import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTarget } from '../app/companion/midgame/data/craftingCalculator.mjs';
import { getTargetOptions } from '../app/companion/midgame/data/phaseB2Logic.mjs';
import { tagWorldProfile } from '../app/companion/midgame/data/recipeGraph.mjs';
import { readTagBackWorldSave, writeTagBackWorldSave } from '../app/companion/midgame/data/tagBackStorage.mjs';
import {
  createUserTarget,
  mergeUserRecipeProfile,
  validateRecipeDraft,
} from '../app/companion/midgame/data/userRecipeOverrides.mjs';

test('creates and persists a new target without dropping world state, then exposes it as a target option', () => {
  const created = createUserTarget('Ancient Workbench', {
    category: 'Building / Machine',
    yield: 1,
    station: 'Assembly Line',
    components: [{ id: 'coal', quantity: 2 }],
  }, tagWorldProfile.nodes.map((node) => node.id));
  const current = JSON.stringify({
    marker: 'tagback-midgame-task-a',
    milestones: { cake_ready: true },
    inventory: { coal: 12 },
    selectedTarget: 'computer',
    selectedQuantity: 4,
    userRecipes: { existing: { name: 'Existing', isRaw: false, recipe: null } },
  });
  const userRecipes = {
    existing: { name: 'Existing', isRaw: false, recipe: null },
    [created.id]: created.record,
  };
  const saved = readTagBackWorldSave(writeTagBackWorldSave(current, {
    userRecipes,
    selectedTarget: created.id,
  }));
  const profile = mergeUserRecipeProfile(tagWorldProfile, saved.userRecipes);

  assert.equal(created.id, 'custom-ancient-workbench');
  assert.deepEqual(saved.milestones, { cake_ready: true });
  assert.equal(saved.inventory.coal, 12);
  assert.equal(saved.selectedQuantity, 4);
  assert.equal(saved.selectedTarget, created.id);
  assert.equal(saved.userRecipes.existing.name, 'Existing');
  assert.equal(getTargetOptions(profile).some((option) => option.id === created.id), true);
  assert.equal(profile.nodes.find((node) => node.id === created.id).category, 'Building / Machine');
});

test('user-created items use the Phase A engine recursively as targets and components', () => {
  const userRecipes = {
    'custom-alloy': {
      name: 'Custom Alloy',
      category: 'Component',
      isRaw: false,
      recipe: { yield: 1, inputs: [{ id: 'coal', quantity: 2 }] },
    },
    'custom-machine': {
      name: 'Custom Machine',
      category: 'Building / Machine',
      isRaw: false,
      recipe: { yield: 1, inputs: [{ id: 'custom-alloy', quantity: 3 }] },
    },
    'custom-complex': {
      name: 'Custom Complex',
      category: 'Building / Machine',
      isRaw: false,
      recipe: { yield: 1, inputs: [{ id: 'custom-machine', quantity: 2 }] },
    },
  };
  const profile = mergeUserRecipeProfile(tagWorldProfile, userRecipes);
  const targetResult = calculateTarget(profile, 'custom-machine', { inventory: { coal: 0 } });
  const componentResult = calculateTarget(profile, 'custom-complex', { inventory: { coal: 0 } });

  assert.equal(targetResult.perNode.find((item) => item.id === 'custom-alloy').need, 3);
  assert.equal(targetResult.rawShortages.find((item) => item.id === 'coal').quantity, 6);
  assert.equal(componentResult.perNode.find((item) => item.id === 'custom-machine').need, 2);
  assert.equal(componentResult.rawShortages.find((item) => item.id === 'coal').quantity, 12);
});

test('new targets still use the existing direct self-reference guard', () => {
  const created = createUserTarget('Loop', {
    yield: 1,
    components: [{ id: 'custom-loop', quantity: 1 }],
  });

  assert.deepEqual(created.errors, ['An item cannot be its own direct component.']);
});

test('crafted-but-unknown items are incomplete rather than raw', () => {
  const result = calculateTarget(tagWorldProfile, 'corrosiveSolvent', { inventory: { corrosiveSolvent: 0 } });

  assert.equal(tagWorldProfile.nodes.find((node) => node.id === 'corrosiveSolvent').isRaw, false);
  assert.equal(result.incomplete.some((item) => item.id === 'corrosiveSolvent'), true);
  assert.equal(result.rawShortages.some((item) => item.id === 'corrosiveSolvent'), false);
});
test('explicitly tagged gathered resources remain raw', () => {
  const result = calculateTarget(tagWorldProfile, 'coralumOre', { inventory: { coralumOre: 0 } });

  assert.equal(tagWorldProfile.nodes.find((node) => node.id === 'coralumOre').isRaw, true);
  assert.deepEqual(result.rawShortages.map((item) => item.id), ['coralumOre']);
  assert.equal(result.incomplete.length, 0);
});

test('merges a per-world user recipe over the base graph without mutating it', () => {
  const overrides = {
    corrosiveSolvent: {
      name: 'Corrosive Solvent',
      isRaw: false,
      recipe: {
        yield: 2,
        station: 'Test Workshop',
        inputs: [{ id: 'coal', quantity: 3 }],
      },
    },
    'custom-test-material': {
      name: 'Test Material',
      isRaw: false,
      recipe: null,
    },
  };

  const merged = mergeUserRecipeProfile(tagWorldProfile, overrides);
  const solvent = merged.nodes.find((node) => node.id === 'corrosiveSolvent');

  assert.equal(solvent.recipe.yield, 2);
  assert.equal(solvent.recipe.station, 'Test Workshop');
  assert.deepEqual(solvent.recipe.inputs, [{ id: 'coal', quantity: 3 }]);
  assert.equal(merged.nodes.find((node) => node.id === 'custom-test-material').recipe, null);
  assert.equal(tagWorldProfile.nodes.find((node) => node.id === 'corrosiveSolvent').recipe, null);
});

test('rejects an item as its own direct component', () => {
  assert.deepEqual(validateRecipeDraft('computer', {
    yield: 1,
    components: [{ id: 'computer', quantity: 1 }],
  }), ['An item cannot be its own direct component.']);
});

test('stores user recipes without dropping other TAG World state', () => {
  const current = JSON.stringify({
    marker: 'tagback-midgame-task-a',
    milestones: { cake_ready: true },
    inventory: { coal: 12 },
    selectedTarget: 'computer',
    selectedQuantity: 4,
  });
  const userRecipes = {
    circuitBoard: {
      name: 'Circuit Board',
      isRaw: false,
      recipe: { yield: 1, inputs: [{ id: 'coal', quantity: 2 }], station: '' },
    },
  };

  const saved = readTagBackWorldSave(writeTagBackWorldSave(current, { userRecipes }));

  assert.deepEqual(saved.milestones, { cake_ready: true });
  assert.equal(saved.inventory.coal, 12);
  assert.equal(saved.selectedTarget, 'computer');
  assert.equal(saved.selectedQuantity, 4);
  assert.deepEqual(saved.userRecipes.circuitBoard.recipe, {
    yield: 1,
    inputs: [{ id: 'coal', quantity: 2 }],
    station: null,
  });
});
