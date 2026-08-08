import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterInventoryMaterials,
  getInventoryMaterials,
  saveInventoryQuantity,
} from '../app/companion/midgame/data/inventoryManagement.mjs';
import { tagWorldProfile } from '../app/companion/midgame/data/recipeGraph.mjs';
import { readTagBackWorldSave } from '../app/companion/midgame/data/tagBackStorage.mjs';
import { mergeUserRecipeProfile } from '../app/companion/midgame/data/userRecipeOverrides.mjs';

test('reads the full known material list including recipe, user-created, and inventory-only materials', () => {
  const profile = mergeUserRecipeProfile(tagWorldProfile, {
    'custom-session-part': {
      name: 'Session Part',
      isRaw: false,
      recipe: { yield: 1, inputs: [{ id: 'custom-session-ore', quantity: 2 }] },
    },
    'custom-session-ore': { name: 'Session Ore', isRaw: true, recipe: null },
  });
  const materials = getInventoryMaterials(profile, { ...profile.inventory, legacyMaterial: 3 });
  const ids = new Set(materials.map((material) => material.id));

  assert.equal(profile.nodes.filter((node) => node.kind === 'item').every((node) => ids.has(node.id)), true);
  assert.equal(ids.has('custom-session-part'), true);
  assert.equal(ids.has('custom-session-ore'), true);
  assert.equal(ids.has('legacyMaterial'), true);
  assert.equal(ids.has('weapon-line'), false);
});

test('saves an edited quantity through the TAG World adapter and reads it back without dropping other state', () => {
  const original = JSON.stringify({
    marker: 'tagback-midgame-task-a',
    inventory: { coal: 5 },
    milestones: { cake_ready: true },
    selectedTarget: 'computer',
    selectedQuantity: 3,
    userRecipes: { custom: { name: 'Custom', isRaw: true, recipe: null } },
  });
  const result = saveInventoryQuantity(original, 'coal', '42', tagWorldProfile);
  const saved = readTagBackWorldSave(result.rawValue);

  assert.equal(result.quantity, 42);
  assert.equal(saved.inventory.coal, 42);
  assert.deepEqual(saved.milestones, { cake_ready: true });
  assert.equal(saved.selectedTarget, 'computer');
  assert.equal(saved.selectedQuantity, 3);
  assert.equal(saved.userRecipes.custom.name, 'Custom');
});

test('search narrows the inventory list by material name', () => {
  const materials = getInventoryMaterials(tagWorldProfile, tagWorldProfile.inventory);
  const filtered = filterInventoryMaterials(materials, 'coralum');

  assert.deepEqual(filtered.map((material) => material.id), ['coralumIngot', 'coralumOre']);
  assert.equal(filterInventoryMaterials(materials, '  CoRaLuM  ').length, 2);
});

test('rejects negative and invalid quantities without producing a stored value', () => {
  const original = JSON.stringify({ inventory: { coal: 7 } });

  assert.equal(saveInventoryQuantity(original, 'coal', '-1', tagWorldProfile), null);
  assert.equal(saveInventoryQuantity(original, 'coal', 'not-a-number', tagWorldProfile), null);
  assert.equal(saveInventoryQuantity(original, 'coal', '', tagWorldProfile), null);
  assert.equal(readTagBackWorldSave(original).inventory.coal, 7);
});
