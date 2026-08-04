import { getNodeMap } from './recipeGraph.mjs';

function cleanQuantity(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function sortByNameThenId(a, b) {
  return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

function toQuantityMap(source = {}) {
  return new Map(
    Object.entries(source)
      .map(([id, quantity]) => [id, cleanQuantity(quantity)])
      .filter(([, quantity]) => quantity > 0),
  );
}

function getAvailable(available, id) {
  return available.get(id) || 0;
}

function addAvailable(available, id, quantity) {
  if (quantity <= 0) return;
  available.set(id, getAvailable(available, id) + quantity);
}

function consumeAvailable(available, id, quantity) {
  const have = getAvailable(available, id);
  const consumed = Math.min(have, quantity);
  if (consumed > 0) {
    available.set(id, have - consumed);
  }
  return consumed;
}

function createBreakdown(node, fallbackId) {
  return {
    id: node?.id || fallbackId,
    name: node?.name || fallbackId,
    have: 0,
    need: 0,
    missing: 0,
    isRaw: node?.isRaw === true,
    isProtected: node?.isProtected === true,
    isIncomplete: false,
  };
}

function getBreakdown(breakdowns, node, id) {
  const key = node?.id || id;
  if (!breakdowns.has(key)) {
    breakdowns.set(key, createBreakdown(node, key));
  }
  return breakdowns.get(key);
}

function sortedQuantityList(quantityMap, nodeMap, extra = {}) {
  return Array.from(quantityMap.entries())
    .map(([id, quantity]) => ({
      id,
      name: nodeMap.get(id)?.name || id,
      quantity,
      ...extra[id],
    }))
    .sort(sortByNameThenId);
}

function sortedBreakdownList(breakdowns) {
  return Array.from(breakdowns.values())
    .map((item) => ({ ...item }))
    .sort(sortByNameThenId);
}

export function calculateTarget(profile, targetId, options = {}) {
  const nodeMap = getNodeMap(profile);
  const inventory = { ...profile.inventory, ...options.inventory };
  const available = toQuantityMap(inventory);
  const targetQuantity = cleanQuantity(options.quantity || 1);
  const targetNode = nodeMap.get(targetId) || null;
  const breakdowns = new Map();
  const rawShortages = new Map();
  const incomplete = new Map();
  const protectedRequired = new Map();
  const circular = new Set();

  function addQuantity(map, id, quantity) {
    if (quantity <= 0) return;
    map.set(id, (map.get(id) || 0) + quantity);
  }

  function requireNode(id, quantity, stack) {
    const need = cleanQuantity(quantity);
    if (need <= 0) return;

    const node = nodeMap.get(id);
    const breakdown = getBreakdown(breakdowns, node, id);
    breakdown.need += need;

    if (node?.isProtected === true) {
      addQuantity(protectedRequired, id, need);
    }

    const consumed = consumeAvailable(available, id, need);
    breakdown.have += consumed;
    const missing = need - consumed;
    breakdown.missing += missing;

    if (missing <= 0) return;

    if (!node) {
      breakdown.isIncomplete = true;
      incomplete.set(id, {
        id,
        name: id,
        missing,
        reason: 'missing-node',
      });
      return;
    }

    if (node.isRaw === true) {
      addQuantity(rawShortages, id, missing);
      return;
    }

    if (!node.recipe) {
      breakdown.isIncomplete = true;
      incomplete.set(id, {
        id: node.id,
        name: node.name,
        missing: (incomplete.get(id)?.missing || 0) + missing,
        reason: 'missing-recipe',
      });
      return;
    }

    if (stack.includes(id)) {
      circular.add([...stack, id].join(' -> '));
      return;
    }

    const outputYield = Math.max(cleanQuantity(node.recipe.yield), 1);
    const craftCount = Math.ceil(missing / outputYield);
    const surplus = (craftCount * outputYield) - missing;
    addAvailable(available, id, surplus);

    for (const input of [...node.recipe.inputs].sort((a, b) => a.id.localeCompare(b.id))) {
      requireNode(input.id, input.quantity * craftCount, [...stack, id]);
    }
  }

  requireNode(targetId, targetQuantity, []);

  const surplus = Array.from(available.entries())
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ id, name: nodeMap.get(id)?.name || id, quantity }))
    .sort(sortByNameThenId);

  return {
    target: {
      id: targetId,
      name: targetNode?.name || targetId,
    },
    perNode: sortedBreakdownList(breakdowns),
    rawShortages: sortedQuantityList(rawShortages, nodeMap),
    incomplete: Array.from(incomplete.values()).sort(sortByNameThenId),
    protectedRequired: sortedQuantityList(protectedRequired, nodeMap),
    surplus,
    circular: {
      hasCircular: circular.size > 0,
      paths: Array.from(circular).sort(),
    },
  };
}

export function calculateTargets(profile, requests, options = {}) {
  return requests
    .map((request) => calculateTarget(profile, request.id, { ...options, quantity: request.quantity || 1 }))
    .sort((a, b) => a.target.name.localeCompare(b.target.name) || a.target.id.localeCompare(b.target.id));
}
