import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTarget } from '../app/companion/midgame/data/craftingCalculator.mjs';
import { getWorldProfile, oldWorldProfile, tagWorldProfile } from '../app/companion/midgame/data/recipeGraph.mjs';
import { readTagBackWorldSave, TAG_WORLD_STORAGE_MARKER } from '../app/companion/midgame/data/tagBackStorage.mjs';

function makeProfile(nodes, inventory = {}) {
  return {
    id: 'test-world',
    name: 'Test World',
    inventory,
    nodes,
    targets: [],
  };
}

function node(id, overrides = {}) {
  return {
    id,
    name: overrides.name || id,
    kind: overrides.kind || 'item',
    isRaw: overrides.isRaw === true,
    isProtected: overrides.isProtected === true,
    recipe: overrides.recipe || null,
  };
}

function quantities(list) {
  return Object.fromEntries(list.map((item) => [item.id, item.quantity]));
}

test('calculates a single-level recipe', () => {
  const profile = makeProfile([
    node('camp', { name: 'Camp', kind: 'building', recipe: { yield: 1, inputs: [{ id: 'wood', quantity: 3 }] } }),
    node('wood', { name: 'Wood', isRaw: true }),
  ], { wood: 1 });

  const result = calculateTarget(profile, 'camp');

  assert.deepEqual(quantities(result.rawShortages), { wood: 2 });
  assert.equal(result.perNode.find((item) => item.id === 'wood').have, 1);
  assert.equal(result.perNode.find((item) => item.id === 'wood').missing, 2);
});

test('calculates a multi-level recursive recipe', () => {
  const profile = makeProfile([
    node('machine', { recipe: { yield: 1, inputs: [{ id: 'gear', quantity: 2 }] } }),
    node('gear', { recipe: { yield: 1, inputs: [{ id: 'ore', quantity: 2 }] } }),
    node('ore', { isRaw: true }),
  ], { ore: 1 });

  const result = calculateTarget(profile, 'machine');

  assert.deepEqual(quantities(result.rawShortages), { ore: 3 });
  assert.equal(result.perNode.find((item) => item.id === 'gear').need, 2);
  assert.equal(result.perNode.find((item) => item.id === 'ore').need, 4);
});

test('multiplies recipe inputs by craft count', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'bolt', quantity: 4 }] } }),
    node('bolt', { recipe: { yield: 1, inputs: [{ id: 'ore', quantity: 3 }] } }),
    node('ore', { isRaw: true }),
  ]);

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(quantities(result.rawShortages), { ore: 12 });
});

test('handles recipe yield greater than one and exposes surplus for sibling branches', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'left', quantity: 1 }, { id: 'right', quantity: 1 }] } }),
    node('left', { recipe: { yield: 1, inputs: [{ id: 'ingot', quantity: 3 }] } }),
    node('right', { recipe: { yield: 1, inputs: [{ id: 'ingot', quantity: 1 }] } }),
    node('ingot', { recipe: { yield: 2, inputs: [{ id: 'ore', quantity: 3 }] } }),
    node('ore', { isRaw: true }),
  ]);

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(quantities(result.rawShortages), { ore: 6 });
  assert.equal(result.perNode.find((item) => item.id === 'ingot').need, 4);
});

test('subtracts owned crafted components before expanding shortages', () => {
  const profile = makeProfile([
    node('machine', { recipe: { yield: 1, inputs: [{ id: 'gear', quantity: 2 }] } }),
    node('gear', { recipe: { yield: 1, inputs: [{ id: 'ore', quantity: 5 }] } }),
    node('ore', { isRaw: true }),
  ], { gear: 1 });

  const result = calculateTarget(profile, 'machine');

  assert.deepEqual(quantities(result.rawShortages), { ore: 5 });
  assert.equal(result.perNode.find((item) => item.id === 'gear').have, 1);
});

test('deduplicates shared raw inventory across branches', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 1 }] } }),
    node('a', { recipe: { yield: 1, inputs: [{ id: 'ore', quantity: 4 }] } }),
    node('b', { recipe: { yield: 1, inputs: [{ id: 'ore', quantity: 4 }] } }),
    node('ore', { isRaw: true }),
  ], { ore: 5 });

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(quantities(result.rawShortages), { ore: 3 });
  assert.equal(result.perNode.find((item) => item.id === 'ore').have, 5);
});

test('keeps raw resources and incomplete recipes separate', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'rawOre', quantity: 5 }, { id: 'unknownWidget', quantity: 2 }] } }),
    node('rawOre', { name: 'Raw Ore', isRaw: true }),
    node('unknownWidget', { name: 'Unknown Widget' }),
  ]);

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(quantities(result.rawShortages), { rawOre: 5 });
  assert.deepEqual(result.incomplete.map((item) => item.id), ['unknownWidget']);
});

test('isolates incomplete branches while computing known branches', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'water', quantity: 3 }, { id: 'unknownWidget', quantity: 2 }] } }),
    node('water', { isRaw: true }),
    node('unknownWidget'),
  ]);

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(quantities(result.rawShortages), { water: 3 });
  assert.deepEqual(result.incomplete.map((item) => item.id), ['unknownWidget']);
});

test('counts protected resources as available while flagging total required quantity', () => {
  const profile = makeProfile([
    node('ancientMachine', { recipe: { yield: 1, inputs: [{ id: 'ancientCore', quantity: 10 }] } }),
    node('ancientCore', { name: 'Ancient Core', isRaw: true, isProtected: true }),
  ], { ancientCore: 5 });

  const result = calculateTarget(profile, 'ancientMachine');

  assert.deepEqual(quantities(result.rawShortages), { ancientCore: 5 });
  assert.deepEqual(quantities(result.protectedRequired), { ancientCore: 10 });
  assert.equal(result.perNode.find((item) => item.id === 'ancientCore').have, 5);
});

test('detects circular recipes without crashing', () => {
  const profile = makeProfile([
    node('a', { recipe: { yield: 1, inputs: [{ id: 'b', quantity: 1 }] } }),
    node('b', { recipe: { yield: 1, inputs: [{ id: 'a', quantity: 1 }] } }),
  ]);

  const result = calculateTarget(profile, 'a');

  assert.equal(result.circular.hasCircular, true);
  assert.deepEqual(result.circular.paths, ['a -> b -> a']);
});

test('keeps TAG World and Old World profiles isolated', () => {
  assert.equal(getWorldProfile('tagback').id, 'tagback');
  assert.equal(getWorldProfile('old-world').id, 'old-world');
  assert.equal(tagWorldProfile.inventory.coralumOre, 54);
  assert.deepEqual(oldWorldProfile.inventory, {});
});

test('keeps raw Coralum Ore separate from Coralum Ingots', () => {
  const rawOre = tagWorldProfile.nodes.find((item) => item.id === 'coralumOre');
  const ingot = tagWorldProfile.nodes.find((item) => item.id === 'coralumIngot');
  const result = calculateTarget(tagWorldProfile, 'weapon-line');

  assert.equal(rawOre.isRaw, true);
  assert.equal(ingot.isRaw, false);
  assert.equal(ingot.recipe, null);
  assert.equal(result.incomplete.some((item) => item.id === 'coralumIngot'), true);
  assert.equal(result.rawShortages.some((item) => item.id === 'coralumIngot'), false);
});

test('reads the real existing localStorage shape without migration', () => {
  const stored = JSON.stringify({
    marker: TAG_WORLD_STORAGE_MARKER,
    milestones: { cake_ready: true, ore_mine: false },
  });

  const result = readTagBackWorldSave(stored);

  assert.equal(result.key, 'mgc:world:tagback:v1');
  assert.equal(result.migrationNeeded, false);
  assert.deepEqual(result.milestones, { cake_ready: true, ore_mine: false });
  assert.equal(result.inventory.coralumOre, 54);
});

test('returns deterministic sorted lists', () => {
  const profile = makeProfile([
    node('target', { recipe: { yield: 1, inputs: [{ id: 'zRaw', quantity: 1 }, { id: 'aRaw', quantity: 1 }, { id: 'unknown', quantity: 1 }] } }),
    node('zRaw', { name: 'Zulu Raw', isRaw: true }),
    node('aRaw', { name: 'Alpha Raw', isRaw: true }),
    node('unknown', { name: 'Middle Unknown' }),
  ]);

  const result = calculateTarget(profile, 'target');

  assert.deepEqual(result.rawShortages.map((item) => item.name), ['Alpha Raw', 'Zulu Raw']);
  assert.deepEqual(result.incomplete.map((item) => item.name), ['Middle Unknown']);
  assert.deepEqual(result.perNode.map((item) => item.name), ['Alpha Raw', 'Middle Unknown', 'target', 'Zulu Raw']);
});
