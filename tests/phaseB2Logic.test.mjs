import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARD_STATUS,
  COMPONENT_CLICK_ACTION,
  buildBreadcrumbs,
  buildCurrentLevelCards,
  getCardStatus,
  getComponentClickAction,
  getGatherSummary,
  getTargetOptions,
} from '../app/companion/midgame/data/phaseB2Logic.mjs';

const missing = { have: 1, need: 3, missing: 2, isIncomplete: false, isProtected: false };

test('derives the four component card states with safe precedence', () => {
  assert.equal(getCardStatus({ isRaw: true }, { ...missing, missing: 0 }), CARD_STATUS.READY);
  assert.equal(getCardStatus({ isRaw: true }, missing), CARD_STATUS.MISSING);
  assert.equal(getCardStatus({ isRaw: false, recipe: null }, missing), CARD_STATUS.RECIPE);
  assert.equal(getCardStatus({ isRaw: true, isProtected: true }, missing), CARD_STATUS.PROTECTED);
  assert.equal(getCardStatus({ isRaw: false, recipe: null, isProtected: true }, missing), CARD_STATUS.RECIPE);
});

test('builds direct component cards from an engine-shaped result', () => {
  const current = { id: 'computer', recipe: { inputs: [{ id: 'board', quantity: 2 }, { id: 'ore', quantity: 3 }] } };
  const nodeMap = new Map([
    ['board', { id: 'board', name: 'Circuit Board', recipe: { inputs: [] }, isRaw: false }],
    ['ore', { id: 'ore', name: 'Ore', recipe: null, isRaw: true }],
  ]);
  const result = {
    perNode: [
      { id: 'board', name: 'Circuit Board', have: 0, need: 2, missing: 2, isIncomplete: false },
      { id: 'ore', name: 'Ore', have: 3, need: 3, missing: 0, isIncomplete: false, isRaw: true },
    ],
  };

  const cards = buildCurrentLevelCards(current, result, nodeMap);

  assert.deepEqual(cards.map((card) => [card.id, card.status, card.canDrill]), [
    ['board', CARD_STATUS.MISSING, true],
    ['ore', CARD_STATUS.READY, false],
  ]);
});

test('builds clickable breadcrumb data with engine need and craft counts', () => {
  const nodeMap = new Map([
    ['ai', { id: 'ai', name: 'AI Core' }],
    ['computer', { id: 'computer', name: 'Computer' }],
  ]);
  const result = {
    perNode: [
      { id: 'ai', need: 1, missing: 1 },
      { id: 'computer', need: 5, missing: 3 },
    ],
  };

  assert.deepEqual(buildBreadcrumbs(['ai', 'computer'], nodeMap, result), [
    { id: 'ai', name: 'AI Core', need: 1, craft: 1 },
    { id: 'computer', name: 'Computer', need: 5, craft: 3 },
  ]);
});

test('keeps stable raw gathering and incomplete recipe lists separate', () => {
  const summary = getGatherSummary({
    rawShortages: [
      { id: 'z', name: 'Zulu Ore', quantity: 2 },
      { id: 'a', name: 'Alpha Ore', quantity: 4 },
    ],
    incomplete: [
      { id: 'p', name: 'Plasteel', missing: 3 },
      { id: 'c', name: 'Circuit Board', missing: 2 },
    ],
  });

  assert.deepEqual(summary.raw.map((item) => item.name), ['Alpha Ore', 'Zulu Ore']);
  assert.deepEqual(summary.incomplete.map((item) => item.name), ['Circuit Board', 'Plasteel']);
});

test('target options include raw, incomplete, craftable, and building nodes', () => {
  const options = getTargetOptions({
    nodes: [
      { id: 'raw', name: 'Raw', isRaw: true },
      { id: 'incomplete', name: 'Incomplete', recipe: null },
      { id: 'part', name: 'Part', recipe: { inputs: [] } },
      { id: 'building', name: 'Building', kind: 'building', recipe: { inputs: [] } },
    ],
    targets: [{ id: 'building', priority: 1 }],
  });

  assert.deepEqual(options.map((item) => item.id), ['building', 'incomplete', 'part', 'raw']);
});

test('routes recipe, incomplete, and raw component clicks to the correct action', () => {
  assert.equal(getComponentClickAction({ id: 'computer', recipe: { inputs: [] }, isRaw: false }), COMPONENT_CLICK_ACTION.DRILL_IN);
  assert.equal(getComponentClickAction({ id: 'solvent', recipe: null, isRaw: false }), COMPONENT_CLICK_ACTION.OPEN_EDITOR);
  assert.equal(getComponentClickAction({ id: 'ore', recipe: null, isRaw: true }), COMPONENT_CLICK_ACTION.RAW_LEAF);
});
