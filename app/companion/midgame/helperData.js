import { tagWorldProfile } from './data/recipeGraph.mjs';

const nodeById = new Map(tagWorldProfile.nodes.map((node) => [node.id, node]));

export const materialNames = Object.fromEntries(
  tagWorldProfile.nodes
    .filter((node) => node.kind === 'item')
    .map((node) => [node.id, node.name])
    .sort(([a], [b]) => a.localeCompare(b)),
);

export const photographedInventory = { ...tagWorldProfile.inventory };

export const buildProjects = tagWorldProfile.targets.map((target) => {
  const node = nodeById.get(target.id);
  return {
    id: node.id,
    name: node.name,
    priority: target.priority,
    purpose: target.purpose,
    protected: target.isProtected,
    materials: Object.fromEntries(node.recipe.inputs.map((input) => [input.id, input.quantity])),
  };
});

export const componentRecipes = Object.fromEntries(
  tagWorldProfile.nodes
    .filter((node) => node.kind === 'item' && node.recipe)
    .map((node) => [
      node.id,
      Object.fromEntries(node.recipe.inputs.map((input) => [input.id, input.quantity])),
    ])
    .sort(([a], [b]) => a.localeCompare(b)),
);

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
