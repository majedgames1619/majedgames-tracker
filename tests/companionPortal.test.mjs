import test from 'node:test';
import assert from 'node:assert/strict';
import { portalSections } from '../app/companion/portalSections.mjs';

test('portal defines the three requested companion sections', () => {
  assert.deepEqual(
    portalSections.map(({ title }) => title),
    ['Crafting Planner', 'Breeding', 'Combat Prep'],
  );
});

test('Crafting Planner is the only ready section and preserves the midgame route', () => {
  const readySections = portalSections.filter(({ ready }) => ready);

  assert.equal(readySections.length, 1);
  assert.equal(readySections[0].title, 'Crafting Planner');
  assert.equal(readySections[0].href, '/companion/midgame');
});

test('future sections are disabled navigation targets', () => {
  const comingSoonSections = portalSections.filter(({ ready }) => !ready);

  assert.deepEqual(
    comingSoonSections.map(({ title }) => title),
    ['Breeding', 'Combat Prep'],
  );
  assert.ok(comingSoonSections.every(({ href }) => href === null));
});
