import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTarget } from '../app/companion/midgame/data/craftingCalculator.mjs';
import { tagWorldProfile } from '../app/companion/midgame/data/recipeGraph.mjs';
import { readTagBackWorldSave, writeTagBackWorldSave } from '../app/companion/midgame/data/tagBackStorage.mjs';
import {
  mergeUserRecipeProfile,
  validateRecipeDraft,
} from '../app/companion/midgame/data/userRecipeOverrides.mjs';

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
