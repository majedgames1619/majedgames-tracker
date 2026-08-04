export const STATUS = {
  READY: 'Ready',
  MISSING: 'Missing Materials',
  PROTECTED: 'Protected Resource Required',
  RECIPE: 'Recipe Needed',
};

export const DOC_QUESTIONS = [
  ['next', 'What should I do next?'],
  ['craft', 'What can I craft now?'],
  ['block', 'What is blocking me?'],
  ['gather', 'What should I gather tonight?'],
  ['protect', 'What resources should I protect?'],
];

export function getResultStatus(result) {
  if (result.incomplete.length > 0) return STATUS.RECIPE;
  if (result.circular.hasCircular) return STATUS.RECIPE;
  if (result.protectedRequired.length > 0) return STATUS.PROTECTED;
  if (result.rawShortages.length > 0 || result.perNode.some((item) => item.missing > 0)) return STATUS.MISSING;
  return STATUS.READY;
}

export function getStatusTone(status) {
  if (status === STATUS.READY) return 'ready';
  if (status === STATUS.PROTECTED) return 'protected';
  if (status === STATUS.RECIPE) return 'recipe';
  return 'missing';
}

export function getBreakdown(result, id) {
  return result.perNode.find((item) => item.id === id) || {
    id,
    name: id,
    have: 0,
    need: 0,
    missing: 0,
    isRaw: false,
    isProtected: false,
    isIncomplete: false,
  };
}

export function getTargetMetrics(result) {
  const target = getBreakdown(result, result.target.id);
  const remaining = result.incomplete.length > 0 ? target.missing : result.rawShortages.reduce((sum, item) => sum + item.quantity, 0);
  const progress = target.need > 0 ? Math.round((Math.min(target.have, target.need) / target.need) * 100) : 0;

  return {
    have: target.have,
    need: target.need,
    missing: target.missing,
    remaining,
    progress,
  };
}

export function getFirstLevelComponents(targetNode, targetQuantity = 1) {
  if (!targetNode?.recipe) return [];
  return targetNode.recipe.inputs.map((input) => ({
    id: input.id,
    quantity: input.quantity * targetQuantity,
  }));
}

function formatList(items, emptyText, mapper = (item) => `${item.quantity} ${item.name}`) {
  if (!items.length) return emptyText;
  return items.map(mapper).join(', ');
}

export function getDocAnswer(questionId, result, craftableSummaries = []) {
  const status = getResultStatus(result);
  const recipeList = formatList(result.incomplete, 'no missing recipes', (item) => item.name);
  const gatherList = formatList(result.rawShortages, 'nothing extra');
  const protectedList = formatList(result.protectedRequired, 'nothing protected');
  const readyCrafts = craftableSummaries
    .filter((item) => item.status === STATUS.READY)
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b));

  if (questionId === 'craft') {
    return {
      short: readyCrafts.length ? `You can craft ${readyCrafts.slice(0, 3).join(', ')} now.` : 'No selected craft is fully ready yet.',
      detail: readyCrafts.length
        ? 'These targets have no raw shortages, no protected-resource warning, and no incomplete recipe branch in the current inventory state.'
        : 'Pick a target with fewer missing materials or update inventory manually after your next resource run.',
    };
  }

  if (questionId === 'block') {
    if (status === STATUS.RECIPE) {
      return { short: `Recipe data is blocking this: ${recipeList}.`, detail: 'Add these recipes before trusting a full gather plan for this branch.' };
    }
    if (status === STATUS.PROTECTED) {
      return { short: `Protected resources are required: ${protectedList}.`, detail: 'The calculator counts owned protected resources as available, but Doc warns before you spend them.' };
    }
    if (result.rawShortages.length) {
      return { short: `Missing materials: ${gatherList}.`, detail: 'Only explicitly tagged raw resources appear in this gather list.' };
    }
    return { short: 'Nothing is blocking this target.', detail: 'The Phase A engine found no raw shortage, missing recipe, protected-resource warning, or circular recipe path.' };
  }

  if (questionId === 'gather') {
    return {
      short: result.rawShortages.length ? `Gather ${gatherList}.` : 'No raw gathering is needed for this target.',
      detail: result.incomplete.length ? `Recipe needed first: ${recipeList}. Unknown recipes are kept out of the gather list.` : 'This list contains raw resources only.',
    };
  }

  if (questionId === 'protect') {
    return {
      short: result.protectedRequired.length ? `Protect check: ${protectedList}.` : 'No protected resources are required for this target.',
      detail: 'Protected resources are usable in the math, but this panel flags them before crafting so you can choose deliberately.',
    };
  }

  if (status === STATUS.RECIPE) {
    return { short: `Add recipe data for ${recipeList}.`, detail: 'That is the safest next move because incomplete branches cannot produce a confident shortage number.' };
  }
  if (status === STATUS.PROTECTED) {
    return { short: `Decide before spending ${protectedList}.`, detail: 'Protected resources are counted as available, but this target would consume them.' };
  }
  if (result.rawShortages.length) {
    return { short: `Gather ${gatherList}.`, detail: 'After updating inventory, the tracker and Doc panel will recalculate immediately.' };
  }
  return { short: `Craft ${result.target.name}.`, detail: 'The current inventory satisfies every known branch for this target.' };
}
