export const materialNames = {
  ancientCore: 'Ancient Civilization Core',
  ancientParts: 'Ancient Civilization Parts',
  bioBattery: 'Bio Battery',
  carbonFiber: 'Carbon Fiber',
  circuitBoard: 'Circuit Board',
  coal: 'Coal',
  computer: 'Computer',
  coralumOre: 'Coralum Ore (Red Ore)',
  coralumIngot: 'Coralum Ingot (Red Ore Ingot)',
  corrosiveSolvent: 'Corrosive Solvent',
  cryogenicCoolant: 'Cryogenic Coolant',
  electricOrgan: 'Electric Organ',
  flameOrgan: 'Flame Organ',
  hexolite: 'Hexolite',
  highQualityWood: 'High Quality Wood',
  mythicalWood: 'Mythical Wood',
  paldiumFragment: 'Paldium Fragment',
  palMetalIngot: 'Pal Metal Ingot',
  paloxite: 'Paloxite',
  paloxiteIngot: 'Paloxite Ingot',
  plasteel: 'Plasteel',
  refinedIngot: 'Refined Ingot',
  soralite: 'Soralite',
  soraliteIngot: 'Soralite Ingot',
  thermalCore: 'Thermal Core',
  worldTreeHolyWater: 'World Tree Holy Water',
  cement: 'Cement',
};

export const photographedInventory = {
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

export const buildProjects = [
  {
    id: 'weapon-line',
    name: 'Advanced Weapon Assembly Line',
    priority: 1,
    purpose: 'Unlock stronger weapons and ammunition before the Sky Tower.',
    materials: { coralumIngot: 50, thermalCore: 10, corrosiveSolvent: 30 },
  },
  {
    id: 'advanced-workshop',
    name: 'Advanced Workshop',
    priority: 2,
    purpose: 'Unlock advanced equipment and component production.',
    materials: { coralumIngot: 50, hexolite: 50, computer: 30, bioBattery: 20 },
  },
  {
    id: 'cryogenic-crusher',
    name: 'Cryogenic Crusher',
    priority: 3,
    purpose: 'A useful production upgrade, currently blocked by Pal Metal Ingots.',
    materials: { palMetalIngot: 50, plasteel: 30, cryogenicCoolant: 25, corrosiveSolvent: 20 },
  },
  {
    id: 'aquatic-kit',
    name: 'Aquatic Construction Kit',
    priority: 4,
    purpose: 'Unlock foundations on water after securing enough Cement, Red Ore Ingots, and High Quality Wood.',
    materials: { cement: 200, coralumIngot: 50, highQualityWood: 100 },
  },
  {
    id: 'ancient-furnace',
    name: 'Ancient Furnace',
    priority: 5,
    purpose: 'A strong production upgrade, but it must not consume protected Ancient Cores yet.',
    protected: true,
    materials: { coralumIngot: 100, thermalCore: 20, computer: 30, ancientCore: 10 },
  },
  {
    id: 'ancient-generator',
    name: 'Ancient Power Generator',
    priority: 6,
    purpose: 'Long-term infrastructure blocked by Paloxite Ingots and Ancient Cores.',
    protected: true,
    materials: { paloxiteIngot: 100, electricOrgan: 200, ancientCore: 10 },
  },
  {
    id: 'ancient-recycler',
    name: 'Ancient Relic Recycler',
    priority: 7,
    purpose: 'A late photographed goal blocked by Paloxite Ingots, Mythical Wood, and protected Ancient Cores.',
    protected: true,
    materials: { paloxiteIngot: 50, mythicalWood: 50, ancientParts: 30, ancientCore: 20 },
  },
  {
    id: 'ancient-sphere',
    name: 'Ancient Sphere',
    priority: 8,
    purpose: 'A high-end capture sphere that depends on Paloxite Ingots and Mythical Wood.',
    materials: { paldiumFragment: 30, paloxiteIngot: 6, mythicalWood: 3 },
  },
];

export const componentRecipes = {
  thermalCore: { flameOrgan: 4, coal: 8, corrosiveSolvent: 2, hexolite: 2 },
  computer: { circuitBoard: 2, plasteel: 3, bioBattery: 2, carbonFiber: 2 },
  bioBattery: { electricOrgan: 1, refinedIngot: 1, carbonFiber: 1 },
  aiCore: { computer: 5, soraliteIngot: 10, thermalCore: 2, ancientCore: 1 },
  paloxiteIngot: { soralite: 1, paloxite: 2, worldTreeHolyWater: 1 },
};

// Full shopping list for the two agreed priority builds. Already-crafted
// Thermal Cores and Computers reduce their underlying raw-material cost.
export function getPriorityQueueCost(inventory) {
  const thermalCoresToCraft = Math.max(10 - (inventory.thermalCore || 0), 0);
  const computersToCraft = Math.max(30 - (inventory.computer || 0), 0);

  return {
    coralumIngot: 100,
    flameOrgan: thermalCoresToCraft * 4,
    coal: thermalCoresToCraft * 8,
    corrosiveSolvent: 30 + thermalCoresToCraft * 2,
    hexolite: 50 + thermalCoresToCraft * 2,
    circuitBoard: computersToCraft * 2,
    plasteel: computersToCraft * 3,
    bioBattery: 20 + computersToCraft * 2,
    carbonFiber: computersToCraft * 2,
  };
}
