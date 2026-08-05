'use client';

import { useMemo, useState } from 'react';
import {
  createUserTarget,
  createMaterialId,
  recipeRecordFromDraft,
  validateRecipeDraft,
} from './data/userRecipeOverrides.mjs';
import styles from './page.module.css';

function starterRows(item, materials) {
  if (item.recipe?.inputs?.length) {
    return item.recipe.inputs.map((input) => ({ id: input.id, quantity: input.quantity }));
  }
  return [{ id: materials.find((material) => material.id !== item.id)?.id || '', quantity: 1 }];
}
export default function RecipeEditor({ item, materials, mode = 'edit', isUserCreated = false, onClose, onSave, onClear, onDelete }) {
  const isCreating = mode === 'create';
  const [name, setName] = useState(isCreating ? '' : item.name);
  const [category, setCategory] = useState(isCreating ? '' : (item.category || ''));
  const [isRaw, setIsRaw] = useState(item.isRaw === true);
  const [yieldQuantity, setYieldQuantity] = useState(item.recipe?.yield || 1);
  const [station, setStation] = useState(item.recipe?.station || '');
  const [components, setComponents] = useState(() => starterRows(item, materials));
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [errors, setErrors] = useState([]);
  const [materialError, setMaterialError] = useState('');
  const allMaterials = useMemo(
    () => [...materials, ...pendingMaterials].sort((a, b) => a.name.localeCompare(b.name)),
    [materials, pendingMaterials],
  );

  function updateComponent(index, field, value) {
    setComponents((current) => current.map((component, componentIndex) => (
      componentIndex === index ? { ...component, [field]: value } : component
    )));
  }

  function addComponent() {
    setComponents((current) => [
      ...current,
      { id: allMaterials.find((material) => material.id !== item.id)?.id || '', quantity: 1 },
    ]);
  }

  function addMaterial() {
    const name = newMaterialName.trim();
    if (!name) {
      setMaterialError('Enter a material name first.');
      return;
    }
    const duplicate = allMaterials.find((material) => material.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setMaterialError('That material already exists in the list.');
      return;
    }

    const id = createMaterialId(name, allMaterials.map((material) => material.id));
    setPendingMaterials((current) => [...current, { id, name }]);
    setComponents((current) => [...current, { id, quantity: 1 }]);
    setNewMaterialName('');
    setMaterialError('');
  }

  function submit(event) {
    event.preventDefault();
    const draft = {
      category,
      isRaw,
      yield: yieldQuantity,
      station,
      components,
    };
    const created = isCreating
      ? createUserTarget(name, draft, allMaterials.map((material) => material.id))
      : null;
    const nextErrors = created?.errors || validateRecipeDraft(item.id, draft);
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    onSave(
      created?.id || item.id,
      created?.record || recipeRecordFromDraft(name, draft),
      pendingMaterials,
      { isCreating },
    );
  }

  return (
    <div className={styles.editorBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className={styles.editorPanel} role="dialog" aria-modal="true" aria-labelledby="recipe-editor-title" onSubmit={submit} onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}>
        <div className={styles.editorHeader}>
          <div>
            <p>Per-world recipe override</p>
            <h2 id="recipe-editor-title">{isCreating ? 'Add new target' : `${item.recipe ? 'Edit' : 'Add'} recipe · ${item.name}`}</h2>
          </div>
          <button type="button" aria-label="Close recipe editor" onClick={onClose}>×</button>
        </div>

        {(isCreating || isUserCreated) && (
          <div className={styles.itemDetails}>
            <label>
              <span>Name</span>
              <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ancient Workbench" />
            </label>
            <label>
              <span>Type / category <small>Optional</small></span>
              <input list="item-category-options" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Item" />
              <datalist id="item-category-options">
                <option value="Building / Machine" />
                <option value="Item" />
                <option value="Component" />
              </datalist>
            </label>
          </div>
        )}

        <label className={styles.rawToggle}>
          <input type="checkbox" checked={isRaw} onChange={(event) => setIsRaw(event.target.checked)} />
          <span><strong>Mark as raw / gathered</strong><small>This explicit toggle is the only way to classify an item as raw.</small></span>
        </label>

        {!isRaw && (
          <>
            <div className={styles.editorTwoColumn}>
              <label>
                <span>Yield / output quantity</span>
                <input type="number" min="0.01" step="any" inputMode="decimal" value={yieldQuantity} onChange={(event) => setYieldQuantity(event.target.value)} />
              </label>
              <label>
                <span>Crafting station <small>Optional</small></span>
                <input type="text" value={station} onChange={(event) => setStation(event.target.value)} placeholder="e.g. Ancient Furnace" />
              </label>
            </div>

            <fieldset className={styles.componentEditor}>
              <legend>Components</legend>
              {components.map((component, index) => (
                <div className={styles.componentRow} key={`${index}-${component.id}`}>
                  <label>
                    <span>Material {index + 1}</span>
                    <select autoFocus={!isCreating && index === 0} value={component.id} onChange={(event) => updateComponent(index, 'id', event.target.value)}>
                      <option value="">Choose a material</option>
                      {allMaterials.map((material) => <option value={material.id} key={material.id}>{material.name}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Quantity</span>
                    <input type="number" min="0.01" step="any" inputMode="decimal" value={component.quantity} onChange={(event) => updateComponent(index, 'quantity', event.target.value)} />
                  </label>
                  <button type="button" aria-label={`Remove component ${index + 1}`} onClick={() => setComponents((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>
                </div>
              ))}
              <button className={styles.addRowButton} type="button" onClick={addComponent}>+ Add component</button>
            </fieldset>

            <section className={styles.newMaterial} aria-labelledby="new-material-title">
              <div><strong id="new-material-title">Add new material</strong><small>New materials start as Recipe Needed, never raw.</small></div>
              <div>
                <label>
                  <span>Material name</span>
                  <input value={newMaterialName} onChange={(event) => setNewMaterialName(event.target.value)} placeholder="Material name" />
                </label>
                <button type="button" onClick={addMaterial}>Create & select</button>
              </div>
              {materialError && <p role="alert">{materialError}</p>}
            </section>
          </>
        )}

        {errors.length > 0 && <ul className={styles.editorErrors} role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}

        <div className={styles.editorFooter}>
          {isUserCreated
            ? <button className={styles.dangerButton} type="button" onClick={() => onDelete(item)}>Delete item</button>
            : (item.recipe || item.isRaw) && <button className={styles.dangerButton} type="button" onClick={() => onClear(item)}>{item.recipe ? 'Remove recipe' : 'Mark Recipe Needed'}</button>}
          <span />
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.saveButton} type="submit">{isCreating ? 'Create & select' : `Save ${isRaw ? 'classification' : 'recipe'}`}</button>
        </div>
      </form>
    </div>
  );
}
