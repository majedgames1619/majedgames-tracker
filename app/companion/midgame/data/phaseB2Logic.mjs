export const CARD_STATUS = {
  READY: 'Ready',
  MISSING: 'Missing',
  RECIPE: 'Recipe Needed',
  PROTECTED: 'Protected',
};

export const COMPONENT_CLICK_ACTION = {
  DRILL_IN: 'drill-in',
  OPEN_EDITOR: 'open-editor-for-item',
  RAW_LEAF: 'no-op-leaf',
};

function sortByNameThenId(a, b) {
  return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

export function getBreakdown(result, id) {
  return result?.perNode?.find((item) => item.id === id) || {
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

export function getCardStatus(node, breakdown) {
  if (breakdown?.isIncomplete || (!node?.isRaw && !node?.recipe)) return CARD_STATUS.RECIPE;
  if (node?.isProtected || breakdown?.isProtected) return CARD_STATUS.PROTECTED;
  if ((breakdown?.missing || 0) <= 0) return CARD_STATUS.READY;
  return CARD_STATUS.MISSING;
}

export function getStatusTone(status) {
  if (status === CARD_STATUS.READY) return 'ready';
  if (status === CARD_STATUS.RECIPE) return 'recipe';
  if (status === CARD_STATUS.PROTECTED) return 'protected';
  return 'missing';
}

export function getComponentClickAction(node) {
  if (node?.isRaw === true) return COMPONENT_CLICK_ACTION.RAW_LEAF;
  if (node?.recipe) return COMPONENT_CLICK_ACTION.DRILL_IN;
  return COMPONENT_CLICK_ACTION.OPEN_EDITOR;
}

export function getTargetOptions(profile) {
  return profile.nodes
    .map((node) => ({
      ...node,
      priority: profile.targets.find((target) => target.id === node.id)?.priority || 99,
    }))
    .sort((a, b) => a.priority - b.priority || sortByNameThenId(a, b));
}

export function buildCurrentLevelCards(currentNode, levelResult, nodeMap) {
  if (!currentNode?.recipe) return [];

  return currentNode.recipe.inputs.map((input) => {
    const node = nodeMap.get(input.id) || { id: input.id, name: input.id, recipe: null, isRaw: false };
    const breakdown = getBreakdown(levelResult, input.id);
    const status = getCardStatus(node, breakdown);
    const clickAction = getComponentClickAction(node);

    return {
      id: input.id,
      node,
      breakdown,
      status,
      clickAction,
      canDrill: clickAction === COMPONENT_CLICK_ACTION.DRILL_IN,
      isNavigable: clickAction !== COMPONENT_CLICK_ACTION.RAW_LEAF,
    };
  });
}

export function buildBreadcrumbs(path, nodeMap, originalResult) {
  return path
    .filter((id) => nodeMap.has(id))
    .map((id) => {
      const node = nodeMap.get(id);
      const breakdown = getBreakdown(originalResult, id);
      return {
        id,
        name: node.name,
        need: breakdown.need,
        craft: breakdown.missing,
      };
    });
}

export function getGatherSummary(result) {
  return {
    raw: [...(result?.rawShortages || [])].sort(sortByNameThenId),
    incomplete: [...(result?.incomplete || [])].sort(sortByNameThenId),
  };
}
