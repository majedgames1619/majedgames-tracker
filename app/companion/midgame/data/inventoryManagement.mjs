import { readTagBackWorldSave, writeTagBackWorldSave } from './tagBackStorage.mjs';

export function parseOwnedQuantity(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null;
}

export function getInventoryMaterials(profile, inventory = {}) {
  const nodeMap = new Map(profile.nodes.map((node) => [node.id, node]));
  const materialIds = new Set(
    profile.nodes.filter((node) => node.kind === 'item').map((node) => node.id),
  );

  profile.nodes.forEach((node) => {
    node.recipe?.inputs?.forEach((input) => materialIds.add(input.id));
  });
  Object.keys(inventory).forEach((id) => materialIds.add(id));

  return [...materialIds]
    .map((id) => nodeMap.get(id) || {
      id,
      name: id,
      kind: 'item',
      isRaw: false,
      recipe: null,
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function filterInventoryMaterials(materials, query) {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
  if (!normalizedQuery) return materials;
  return materials.filter((material) => material.name.toLocaleLowerCase().includes(normalizedQuery));
}

export function saveInventoryQuantity(existingRawValue, materialId, value, profile) {
  const quantity = parseOwnedQuantity(value);
  if (!materialId || quantity === null) return null;

  const current = readTagBackWorldSave(existingRawValue, profile);
  const rawValue = writeTagBackWorldSave(existingRawValue, {
    inventory: { ...current.inventory, [materialId]: quantity },
  }, profile);
  const saved = readTagBackWorldSave(rawValue, profile);

  return { rawValue, inventory: saved.inventory, quantity };
}
