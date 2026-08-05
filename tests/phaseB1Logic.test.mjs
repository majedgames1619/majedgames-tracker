import test from 'node:test';
import assert from 'node:assert/strict';
import { DOC_QUESTIONS, STATUS, getDocAnswer, getFirstLevelComponents, getResultStatus, getTargetMetrics } from '../app/companion/midgame/data/phaseB1Logic.mjs';
import { writeTagBackWorldSave } from '../app/companion/midgame/data/tagBackStorage.mjs';

function result(overrides = {}) {
  return {
    target: { id: 'target', name: 'Target' },
    perNode: [{ id: 'target', name: 'Target', have: 0, need: 1, missing: 1, isRaw: false, isProtected: false, isIncomplete: false }],
    rawShortages: [],
    incomplete: [],
    protectedRequired: [],
    circular: { hasCircular: false, paths: [] },
    ...overrides,
  };
}

test('derives Ready status from a clean engine result', () => {
  assert.equal(getResultStatus(result({
    perNode: [{ id: 'target', name: 'Target', have: 1, need: 1, missing: 0, isRaw: false, isProtected: false, isIncomplete: false }],
  })), STATUS.READY);
});

test('derives Missing Materials from raw shortages', () => {
  assert.equal(getResultStatus(result({
    rawShortages: [{ id: 'wood', name: 'Wood', quantity: 3 }],
  })), STATUS.MISSING);
});

test('derives Protected Resource Required before generic missing state', () => {
  assert.equal(getResultStatus(result({
    rawShortages: [{ id: 'ancientCore', name: 'Ancient Core', quantity: 5 }],
    protectedRequired: [{ id: 'ancientCore', name: 'Ancient Core', quantity: 10 }],
  })), STATUS.PROTECTED);
});

test('derives Recipe Needed before protected warnings', () => {
  assert.equal(getResultStatus(result({
    incomplete: [{ id: 'coralumIngot', name: 'Coralum Ingot', missing: 50 }],
    protectedRequired: [{ id: 'ancientCore', name: 'Ancient Core', quantity: 10 }],
  })), STATUS.RECIPE);
});

test('Doc gather answer keeps incomplete recipes out of gather text', () => {
  const answer = getDocAnswer('gather', result({
    rawShortages: [{ id: 'coal', name: 'Coal', quantity: 8 }],
    incomplete: [{ id: 'coralumIngot', name: 'Coralum Ingot', missing: 50 }],
  }));

  assert.equal(answer.short, 'Gather 8 Coal.');
  assert.match(answer.detail, /Recipe needed first: Coralum Ingot/);
});

test('Doc craft answer lists ready craftables from supplied summaries', () => {
  const answer = getDocAnswer('craft', result(), [
    { id: 'thermalCore', name: 'Thermal Core', status: STATUS.READY },
    { id: 'weapon-line', name: 'Advanced Weapon Assembly Line', status: STATUS.RECIPE },
  ]);

  assert.equal(answer.short, 'You can craft Thermal Core now.');
});

test('extracts first-level components without drill-down metadata', () => {
  const components = getFirstLevelComponents({
    recipe: {
      inputs: [
        { id: 'ore', quantity: 2 },
        { id: 'coal', quantity: 3 },
      ],
    },
  }, 2);

  assert.deepEqual(components, [
    { id: 'ore', quantity: 4 },
    { id: 'coal', quantity: 6 },
  ]);
});

test('target metrics are stable for owned target quantity', () => {
  assert.deepEqual(getTargetMetrics(result({
    perNode: [{ id: 'target', name: 'Target', have: 2, need: 4, missing: 2, isRaw: false, isProtected: false, isIncomplete: false }],
    rawShortages: [{ id: 'ore', name: 'Ore', quantity: 6 }],
  })), {
    have: 2,
    need: 4,
    missing: 2,
    remaining: 6,
    progress: 50,
  });
});

test('Doc question registry exposes the five B1 actions', () => {
  assert.deepEqual(DOC_QUESTIONS.map(([id]) => id), ['next', 'craft', 'block', 'gather', 'protect']);
});

test('B1 storage writes selected target and inventory without dropping milestones', () => {
  const current = JSON.stringify({
    marker: 'tagback-midgame-task-a',
    milestones: { cake_ready: true, ore_mine: false },
  });

  const next = JSON.parse(writeTagBackWorldSave(current, {
    selectedTarget: 'thermalCore',
    selectedQuantity: 3,
    inventory: { coal: 12 },
  }));

  assert.deepEqual(next.milestones, { cake_ready: true, ore_mine: false });
  assert.equal(next.selectedTarget, 'thermalCore');
  assert.equal(next.selectedQuantity, 3);
  assert.equal(next.inventory.coal, 12);
});
