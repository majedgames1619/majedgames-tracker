import { TAG_WORLD_ID, TAG_WORLD_STORAGE_KEY, tagWorldProfile } from './recipeGraph.mjs';

export const TAG_WORLD_STORAGE_MARKER = 'tagback-midgame-task-a';

function parseJson(rawValue) {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeBooleanMap(source = {}) {
  return Object.fromEntries(
    Object.entries(source)
      .filter(([, value]) => value === true || value === false)
      .map(([id, value]) => [id, value === true]),
  );
}

function normalizeInventory(defaultInventory, source = {}) {
  return Object.fromEntries(
    Object.entries({ ...defaultInventory, ...source })
      .map(([id, value]) => {
        const quantity = Number(value);
        return [id, Number.isFinite(quantity) && quantity > 0 ? quantity : 0];
      })
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function normalizeSelectedQuantity(value) {
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

export function readTagBackWorldSave(rawValue, profile = tagWorldProfile) {
  const parsed = parseJson(rawValue);

  return {
    key: TAG_WORLD_STORAGE_KEY,
    worldId: TAG_WORLD_ID,
    marker: parsed.marker || TAG_WORLD_STORAGE_MARKER,
    milestones: normalizeBooleanMap(parsed.milestones),
    inventory: normalizeInventory(profile.inventory, parsed.inventory),
    selectedTarget: typeof parsed.selectedTarget === 'string' ? parsed.selectedTarget : null,
    selectedQuantity: normalizeSelectedQuantity(parsed.selectedQuantity),
    migrationNeeded: false,
    original: parsed,
  };
}

export function writeTagBackWorldSave(existingRawValue, updates = {}, profile = tagWorldProfile) {
  const current = readTagBackWorldSave(existingRawValue, profile);
  const next = {
    ...current.original,
    marker: current.marker,
    milestones: updates.milestones ? normalizeBooleanMap(updates.milestones) : current.milestones,
  };

  if (updates.inventory) {
    next.inventory = normalizeInventory(profile.inventory, updates.inventory);
  } else if (current.original.inventory) {
    next.inventory = current.inventory;
  }

  if (typeof updates.selectedTarget === 'string') {
    next.selectedTarget = updates.selectedTarget;
  }

  if (updates.selectedQuantity !== undefined) {
    next.selectedQuantity = normalizeSelectedQuantity(updates.selectedQuantity);
  } else if (current.original.selectedQuantity !== undefined) {
    next.selectedQuantity = current.selectedQuantity;
  }

  return JSON.stringify(next);
}
