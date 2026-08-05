export const TAG_WORLD_ID = 'tagback';
export const OLD_WORLD_ID = 'old-world';
export const TAG_WORLD_STORAGE_KEY = 'mgc:world:tagback:v1';

const materialDefinitions = [
  ['ancientCore', 'Ancient Civilization Core', { isRaw: true, isProtected: true }],
  ['ancientParts', 'Ancient Civilization Parts', { isRaw: true }],
  ['bioBattery', 'Bio Battery', { recipe: { yield: 1, inputs: { electricOrgan: 1, refinedIngot: 1, carbonFiber: 1 } } }],
  ['carbonFiber', 'Carbon Fiber', {}],
  ['cement', 'Cement', {}],
  ['circuitBoard', 'Circuit Board', {}],
  ['coal', 'Coal', { isRaw: true }],
  ['computer', 'Computer', { recipe: { yield: 1, inputs: { circuitBoard: 2, plasteel: 3, bioBattery: 2, carbonFiber: 2 } } }],
  ['coralumOre', 'Coralum Ore (Red Ore)', { isRaw: true }],
  ['coralumIngot', 'Coralum Ingot (Red Ore Ingot)', {}],
  ['corrosiveSolvent', 'Corrosive Solvent', { isRaw: true }],
  ['cryogenicCoolant', 'Cryogenic Coolant', { isRaw: true }],
  ['electricOrgan', 'Electric Organ', { isRaw: true }],
  ['flameOrgan', 'Flame Organ', { isRaw: true }],
  ['hexolite', 'Hexolite', { isRaw: true }],
  ['highQualityWood', 'High Quality Wood', { isRaw: true }],
  ['mythicalWood', 'Mythical Wood', { isRaw: true }],
  ['paldiumFragment', 'Paldium Fragment', { isRaw: true }],
  ['palMetalIngot', 'Pal Metal Ingot', {}],
  ['paloxite', 'Paloxite', { isRaw: true }],
  ['paloxiteIngot', 'Paloxite Ingot', { recipe: { yield: 1, inputs: { soralite: 1, paloxite: 2, worldTreeHolyWater: 1 } } }],
  ['plasteel', 'Plasteel', {}],
  ['refinedIngot', 'Refined Ingot', {}],
  ['soralite', 'Soralite', { isRaw: true }],
  ['soraliteIngot', 'Soralite Ingot', {}],
  ['thermalCore', 'Thermal Core', { recipe: { yield: 1, inputs: { flameOrgan: 4, coal: 8, corrosiveSolvent: 2, hexolite: 2 } } }],
  ['worldTreeHolyWater', 'World Tree Holy Water', { isRaw: true }],
  ['aiCore', 'AI Core', { recipe: { yield: 1, inputs: { computer: 5, soraliteIngot: 10, thermalCore: 2, ancientCore: 1 } } }],
];

const buildTargetDefinitions = [
  {
    id: 'weapon-line',
    name: 'Advanced Weapon Assembly Line',
    priority: 1,
    purpose: 'Unlock stronger weapons and ammunition before the Sky Tower.',
    recipe: { yield: 1, inputs: { coralumIngot: 50, thermalCore: 10, corrosiveSolvent: 30 } },
  },
  {
    id: 'advanced-workshop',
    name: 'Advanced Workshop',
    priority: 2,
    purpose: 'Unlock advanced equipment and component production.',
    recipe: { yield: 1, inputs: { coralumIngot: 50, hexolite: 50, computer: 30, bioBattery: 20 } },
  },
  {
    id: 'cryogenic-crusher',
    name: 'Cryogenic Crusher',
    priority: 3,
    purpose: 'A useful production upgrade, currently blocked by Pal Metal Ingots.',
    recipe: { yield: 1, inputs: { palMetalIngot: 50, plasteel: 30, cryogenicCoolant: 25, corrosiveSolvent: 20 } },
  },
  {
    id: 'aquatic-kit',
    name: 'Aquatic Construction Kit',
    priority: 4,
    purpose: 'Unlock foundations on water after securing enough Cement, Red Ore Ingots, and High Quality Wood.',
    recipe: { yield: 1, inputs: { cement: 200, coralumIngot: 50, highQualityWood: 100 } },
  },
  {
    id: 'ancient-furnace',
    name: 'Ancient Furnace',
    priority: 5,
    purpose: 'A strong production upgrade, but it must not consume protected Ancient Cores yet.',
    isProtectedTarget: true,
    recipe: { yield: 1, inputs: { coralumIngot: 100, thermalCore: 20, computer: 30, ancientCore: 10 } },
  },
  {
    id: 'ancient-generator',
    name: 'Ancient Power Generator',
    priority: 6,
    purpose: 'Long-term infrastructure blocked by Paloxite Ingots and Ancient Cores.',
    isProtectedTarget: true,
    recipe: { yield: 1, inputs: { paloxiteIngot: 100, electricOrgan: 200, ancientCore: 10 } },
  },
  {
    id: 'ancient-recycler',
    name: 'Ancient Relic Recycler',
    priority: 7,
    purpose: 'A late photographed goal blocked by Paloxite Ingots, Mythical Wood, and protected Ancient Cores.',
    isProtectedTarget: true,
    recipe: { yield: 1, inputs: { paloxiteIngot: 50, mythicalWood: 50, ancientParts: 30, ancientCore: 20 } },
  },
  {
    id: 'ancient-sphere',
    name: 'Ancient Sphere',
    priority: 8,
    purpose: 'A high-end capture sphere that depends on Paloxite Ingots and Mythical Wood.',
    recipe: { yield: 1, inputs: { paldiumFragment: 30, paloxiteIngot: 6, mythicalWood: 3 } },
  },
];

export const tagWorldInventory = {
  ancientCore: 5,
  ancientParts: 730,
  bioBattery: 86,
  carbonFiber: 133,
  cement: 82,
  circuitBoard: 57,
  coal: 9999,
  computer: 0,
  coralumOre: 54,
  coralumIngot: 0,
  corrosiveSolvent: 22,
  cryogenicCoolant: 45,
  electricOrgan: 283,
  flameOrgan: 481,
  hexolite: 542,
  highQualityWood: 34,
  mythicalWood: 0,
  paldiumFragment: 292,
  palMetalIngot: 4,
  paloxite: 0,
  paloxiteIngot: 0,
  plasteel: 336,
  refinedIngot: 1362,
  soralite: 837,
  soraliteIngot: 0,
  thermalCore: 0,
  worldTreeHolyWater: 0,
};

function normalizeInputs(inputs) {
  return Object.entries(inputs)
    .map(([id, quantity]) => ({ id, quantity }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function normalizeRecipe(recipe) {
  if (!recipe) return null;
  return {
    yield: recipe.yield || 1,
    inputs: normalizeInputs(recipe.inputs),
    station: typeof recipe.station === 'string' ? recipe.station : null,
  };
}

function buildNode([id, name, definition]) {
  return {
    id,
    name,
    kind: 'item',
    isRaw: definition.isRaw === true,
    isProtected: definition.isProtected === true,
    recipe: normalizeRecipe(definition.recipe),
    image: definition.image || null,
  };
}

const itemNodes = materialDefinitions.map(buildNode);
const targetNodes = buildTargetDefinitions.map((target) => ({
  id: target.id,
  name: target.name,
  kind: 'building',
  priority: target.priority,
  purpose: target.purpose,
  isRaw: false,
  isProtected: false,
  isProtectedTarget: target.isProtectedTarget === true,
  recipe: normalizeRecipe(target.recipe),
  image: target.image || null,
}));

export const tagWorldProfile = {
  id: TAG_WORLD_ID,
  name: 'TAG World',
  storageKey: TAG_WORLD_STORAGE_KEY,
  inventory: tagWorldInventory,
  nodes: [...itemNodes, ...targetNodes],
  targets: buildTargetDefinitions.map(({ id, priority, purpose, isProtectedTarget }) => ({
    id,
    priority,
    purpose,
    isProtected: isProtectedTarget === true,
  })),
};

export const oldWorldProfile = {
  id: OLD_WORLD_ID,
  name: 'Old World',
  storageKey: null,
  inventory: {},
  nodes: [],
  targets: [],
};

export const worldProfiles = {
  [tagWorldProfile.id]: tagWorldProfile,
  [oldWorldProfile.id]: oldWorldProfile,
};

export function getWorldProfile(worldId) {
  return worldProfiles[worldId] || null;
}

export function getNodeMap(profile) {
  return new Map(profile.nodes.map((node) => [node.id, node]));
}
