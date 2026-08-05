function positiveNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
function cleanName(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') return null;

  const inputs = Array.isArray(recipe.inputs)
    ? recipe.inputs
      .map((input) => ({
        id: cleanName(input?.id),
        quantity: positiveNumber(input?.quantity),
      }))
      .filter((input) => input.id && input.quantity > 0)
    : [];

  if (inputs.length === 0) return null;

  return {
    yield: positiveNumber(recipe.yield, 1),
    inputs,
    station: cleanName(recipe.station) || null,
  };
}

export function normalizeUserRecipes(source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};

  return Object.fromEntries(
    Object.entries(source)
      .filter(([id, value]) => cleanName(id) && value && typeof value === 'object' && !Array.isArray(value))
      .map(([id, value]) => {
        const isRaw = value.isRaw === true;
        return [id, {
          name: cleanName(value.name, id),
          isRaw,
          recipe: isRaw ? null : normalizeRecipe(value.recipe),
        }];
      })
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function mergeUserRecipeProfile(baseProfile, source = {}) {
  const userRecipes = normalizeUserRecipes(source);
  const baseIds = new Set(baseProfile.nodes.map((node) => node.id));
  const nodes = baseProfile.nodes.map((node) => {
    const override = userRecipes[node.id];
    if (!override) return node;
    return {
      ...node,
      name: override.name || node.name,
      isRaw: override.isRaw,
      recipe: override.recipe,
    };
  });

  for (const [id, override] of Object.entries(userRecipes)) {
    if (baseIds.has(id)) continue;
    nodes.push({
      id,
      name: override.name,
      kind: 'item',
      isRaw: override.isRaw,
      isProtected: false,
      recipe: override.recipe,
      image: null,
    });
  }

  return {
    ...baseProfile,
    inventory: {
      ...baseProfile.inventory,
      ...Object.fromEntries(Object.keys(userRecipes).map((id) => [id, baseProfile.inventory[id] || 0])),
    },
    nodes,
  };
}

export function validateRecipeDraft(itemId, draft = {}) {
  if (draft.isRaw === true) return [];

  const errors = [];
  if (positiveNumber(draft.yield) <= 0) errors.push('Yield must be a positive number.');
  if (!Array.isArray(draft.components) || draft.components.length === 0) {
    errors.push('Add at least one component.');
    return errors;
  }

  draft.components.forEach((component, index) => {
    if (!cleanName(component?.id)) errors.push(`Choose a material for component ${index + 1}.`);
    if (positiveNumber(component?.quantity) <= 0) errors.push(`Component ${index + 1} quantity must be positive.`);
    if (component?.id === itemId) errors.push('An item cannot be its own direct component.');
  });

  return [...new Set(errors)];
}

export function createMaterialId(name, existingIds = []) {
  const base = cleanName(name, 'material')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'material';
  const used = new Set(existingIds);
  let id = `custom-${base}`;
  let suffix = 2;
  while (used.has(id)) {
    id = `custom-${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function recipeRecordFromDraft(name, draft) {
  const isRaw = draft.isRaw === true;
  return {
    name: cleanName(name),
    isRaw,
    recipe: isRaw ? null : {
      yield: positiveNumber(draft.yield, 1),
      inputs: draft.components.map((component) => ({
        id: component.id,
        quantity: positiveNumber(component.quantity),
      })),
      station: cleanName(draft.station) || null,
    },
  };
}
