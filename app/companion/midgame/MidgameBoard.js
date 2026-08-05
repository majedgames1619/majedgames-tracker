'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import RecipeEditor from './RecipeEditor';
import { calculateTarget } from './data/craftingCalculator.mjs';
import {
  buildBreadcrumbs,
  buildCurrentLevelCards,
  getBreakdown,
  getGatherSummary,
  getStatusTone,
  getTargetOptions,
} from './data/phaseB2Logic.mjs';
import { tagWorldProfile } from './data/recipeGraph.mjs';
import { readTagBackWorldSave, writeTagBackWorldSave } from './data/tagBackStorage.mjs';
import { mergeUserRecipeProfile } from './data/userRecipeOverrides.mjs';
import { midgameMilestones } from './midgameMilestones';
import styles from './page.module.css';

const STORAGE_KEY = tagWorldProfile.storageKey;
const DEFAULT_TARGET_ID = 'weapon-line';
const CATEGORY_ORDER = ['Base', 'Production', 'Progression'];

function normalizeQuantity(value, fallback = 0) {
  const quantity = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  return Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : fallback;
}

function normalizeMilestones(source) {
  return Object.fromEntries(midgameMilestones.map((milestone) => [milestone.id, source?.[milestone.id] === true]));
}

function emptyMilestones() {
  return normalizeMilestones({});
}

function getMilestone(id) {
  return midgameMilestones.find((milestone) => milestone.id === id);
}

function getUnmetPrerequisites(milestone, completed) {
  return milestone.prerequisites
    .filter((id) => !completed[id])
    .map((id) => getMilestone(id)?.label || id);
}

function getHue(id) {
  return Array.from(id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
}

function ItemTile({ item }) {
  const initials = item.name.split(' ').map((word) => word[0]).join('').slice(0, 3);
  return (
    <span className={styles.itemTile} style={{ '--tile-hue': getHue(item.id) }} aria-hidden="true">
      <span>{initials}</span>
    </span>
  );
}

function StatusPill({ status }) {
  return <span className={`${styles.statusPill} ${styles[getStatusTone(status)]}`}>{status}</span>;
}

export default function MidgameBoard() {
  const [userRecipes, setUserRecipes] = useState({});
  const [inventory, setInventory] = useState(tagWorldProfile.inventory);
  const activeProfile = useMemo(() => mergeUserRecipeProfile(tagWorldProfile, userRecipes), [userRecipes]);
  const nodeMap = useMemo(() => new Map(activeProfile.nodes.map((node) => [node.id, node])), [activeProfile]);
  const targetOptions = useMemo(() => getTargetOptions(activeProfile), [activeProfile]);
  const inventoryItems = useMemo(() => {
    const items = activeProfile.nodes.filter((node) => node.kind === 'item');
    const knownIds = new Set(items.map((item) => item.id));
    return [
      ...items,
      ...Object.keys(inventory)
        .filter((id) => !knownIds.has(id))
        .map((id) => ({ id, name: id, kind: 'item', isRaw: false, recipe: null })),
    ].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProfile, inventory]);

  const [selectedTargetId, setSelectedTargetId] = useState(DEFAULT_TARGET_ID);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [path, setPath] = useState([DEFAULT_TARGET_ID]);
  const [quickEditId, setQuickEditId] = useState('coralumIngot');
  const [completed, setCompleted] = useState(emptyMilestones);
  const [storageReady, setStorageReady] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    try {
      const save = readTagBackWorldSave(window.localStorage.getItem(STORAGE_KEY));
      const savedProfile = mergeUserRecipeProfile(tagWorldProfile, save.userRecipes);
      const knownTargets = new Set(savedProfile.nodes.map((node) => node.id));
      const nextTarget = knownTargets.has(save.selectedTarget) ? save.selectedTarget : DEFAULT_TARGET_ID;

      setUserRecipes(save.userRecipes);
      setInventory(save.inventory);
      setCompleted(normalizeMilestones(save.milestones));
      setSelectedTargetId(nextTarget);
      setSelectedQuantity(save.selectedQuantity);
      setPath([nextTarget]);
    } catch {
      // Browser storage is optional; defaults keep the calculator usable.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      const current = window.localStorage.getItem(STORAGE_KEY);
      window.localStorage.setItem(STORAGE_KEY, writeTagBackWorldSave(current, {
        inventory,
        milestones: completed,
        selectedTarget: selectedTargetId,
        selectedQuantity,
        userRecipes,
      }));
    } catch {
      // In-session edits still work when localStorage is unavailable.
    }
  }, [completed, inventory, selectedQuantity, selectedTargetId, storageReady, userRecipes]);

  const originalResult = useMemo(
    () => calculateTarget(activeProfile, selectedTargetId, { inventory, quantity: selectedQuantity }),
    [activeProfile, inventory, selectedQuantity, selectedTargetId],
  );
  const currentId = path[path.length - 1];
  const currentNode = nodeMap.get(currentId) || nodeMap.get(selectedTargetId);
  const currentBreakdown = getBreakdown(originalResult, currentNode.id);
  const currentCraftQuantity = Math.max(currentBreakdown.missing, 0);
  const emptyLevelResult = useMemo(() => ({ perNode: [] }), []);
  const levelResult = useMemo(() => {
    if (currentNode.id === selectedTargetId) return originalResult;
    if (currentCraftQuantity === 0) return emptyLevelResult;
    return calculateTarget(activeProfile, currentNode.id, {
      inventory: { ...inventory, [currentNode.id]: 0 },
      quantity: currentCraftQuantity,
    });
  }, [activeProfile, currentCraftQuantity, currentNode.id, emptyLevelResult, inventory, originalResult, selectedTargetId]);
  const cards = useMemo(
    () => buildCurrentLevelCards(currentNode, levelResult, nodeMap),
    [currentNode, levelResult, nodeMap],
  );
  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(path, nodeMap, originalResult),
    [nodeMap, originalResult, path],
  );
  const gather = useMemo(() => getGatherSummary(originalResult), [originalResult]);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const editingItem = editingItemId ? nodeMap.get(editingItemId) : null;

  function updateInventory(id, value) {
    setInventory((current) => ({ ...current, [id]: normalizeQuantity(value) }));
  }

  function chooseTarget(id) {
    setSelectedTargetId(id);
    setPath([id]);
  }

  function setTargetQuantity(value) {
    setSelectedQuantity(Math.max(normalizeQuantity(value, 1), 1));
    setPath([selectedTargetId]);
  }

  function drillTo(id) {
    setPath((current) => [...current, id]);
    setQuickEditId(id);
  }

  function jumpTo(index) {
    setPath((current) => current.slice(0, index + 1));
  }

  function saveRecipe(itemId, record, pendingMaterials) {
    setUserRecipes((current) => ({
      ...current,
      ...Object.fromEntries(pendingMaterials.map((material) => [material.id, {
        name: material.name,
        isRaw: false,
        recipe: null,
      }])),
      [itemId]: record,
    }));
    setEditingItemId(null);
  }

  function clearRecipe(item) {
    setUserRecipes((current) => ({
      ...current,
      [item.id]: {
        name: item.name,
        isRaw: false,
        recipe: null,
      },
    }));
    setEditingItemId(null);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/companion" aria-label="Return to MajedGames Companion">
            <span className={styles.brandMark} aria-hidden="true">MG</span>
            <span><strong>MajedGames</strong><small>Companion</small></span>
          </Link>
          <span className={styles.worldBadge}>TAG World · Phase B2</span>
        </header>

        <section className={styles.hero} aria-labelledby="calculator-title">
          <div>
            <p className={styles.eyebrow}>Single-target crafting calculator</p>
            <h1 id="calculator-title">Build it without losing the thread.</h1>
            <p>Pick one goal, drill through its recipe, and keep the full gathering trip visible.</p>
          </div>
          <div className={styles.targetControls}>
            <label>
              <span>Crafting target</span>
              <select value={selectedTargetId} onChange={(event) => chooseTarget(event.target.value)}>
                {targetOptions.map((target) => <option value={target.id} key={target.id}>{target.name}</option>)}
              </select>
            </label>
            <label className={styles.quantityField}>
              <span>Quantity</span>
              <input type="number" min="1" step="1" inputMode="numeric" value={selectedQuantity} onChange={(event) => setTargetQuantity(event.target.value)} />
            </label>
          </div>
        </section>

        <section className={styles.calculator} aria-labelledby="current-node-title">
          <nav className={styles.breadcrumbs} aria-label="Crafting path">
            {breadcrumbs.map((crumb, index) => (
              <span className={styles.crumbGroup} key={`${crumb.id}-${index}`}>
                {index > 0 && <span className={styles.chevron} aria-hidden="true">›</span>}
                <button type="button" aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined} onClick={() => jumpTo(index)}>
                  <span>{crumb.name}</span>
                  <small>{crumb.craft} to craft{index === breadcrumbs.length - 1 ? ' · here' : ''}</small>
                </button>
              </span>
            ))}
          </nav>

          <div className={styles.nodeHeading}>
            <div className={styles.nodeIdentity}>
              <ItemTile item={currentNode} />
              <div>
                <p>{currentNode.kind === 'building' ? 'Building / machine' : 'Current component'}</p>
                <h2 id="current-node-title">{currentNode.name}</h2>
                {currentNode.recipe?.station && <small className={styles.station}>Made in: {currentNode.recipe.station}</small>}
              </div>
            </div>
            <div className={styles.nodeActions}>
              <span><small>Need</small><strong>{currentBreakdown.need}</strong></span>
              <span><small>Craft</small><strong>{currentBreakdown.missing}</strong></span>
              <button className={styles.nodeEditButton} type="button" onClick={() => setEditingItemId(currentNode.id)}>{currentNode.recipe ? 'Edit recipe' : currentNode.isRaw ? 'Edit material' : 'Add recipe'}</button>
              <button type="button" onClick={() => jumpTo(path.length - 2)} disabled={path.length === 1}>← Back</button>
            </div>
          </div>

          <div className={styles.componentHeader}>
            <div><p>One level at a time</p><h3>Direct components</h3></div>
            <span>{cards.length} {cards.length === 1 ? 'component' : 'components'}</span>
          </div>

          <div className={styles.componentGrid}>
            {cards.map((card) => (
              <article className={`${styles.componentCard} ${styles[getStatusTone(card.status)]}`} key={card.id}>
                <div className={styles.cardTop}>
                  <ItemTile item={card.node} />
                  <StatusPill status={card.status} />
                </div>
                <h4>{card.node.name}</h4>
                <div className={styles.stats}>
                  <label>
                    <span>Have</span>
                    <input aria-label={`Have ${card.node.name}`} inputMode="numeric" value={inventory[card.id] || 0} onChange={(event) => updateInventory(card.id, event.target.value)} />
                  </label>
                  <span><small>Need</small><strong>{card.breakdown.need}</strong></span>
                  <span><small>Craft</small><strong>{card.breakdown.missing}</strong></span>
                </div>
                {card.canDrill ? (
                  <div className={styles.cardActions}>
                    <button className={styles.drillButton} type="button" onClick={() => drillTo(card.id)}>Open recipe <span aria-hidden="true">→</span></button>
                    <button className={styles.editRecipeButton} type="button" onClick={() => setEditingItemId(card.id)}>Edit recipe</button>
                  </div>
                ) : (
                  <div className={styles.cardActions}>
                    <p className={styles.cardNote}>{card.node.isRaw ? 'Raw material · end of this branch' : 'Recipe data is incomplete'}</p>
                    <button className={styles.editRecipeButton} type="button" onClick={() => setEditingItemId(card.id)}>{card.node.isRaw ? 'Edit material' : 'Add recipe'}</button>
                  </div>
                )}
              </article>
            ))}
            {cards.length === 0 && (
              <p className={styles.branchEnd}>
                {currentNode.isRaw
                  ? 'This is a raw material — you have reached the end of this branch.'
                  : 'Recipe Needed — direct components cannot be shown until this recipe is known.'}
              </p>
            )}
          </div>
        </section>

        <section className={styles.gatherSection} aria-labelledby="gather-title">
          <div className={styles.gatherHeading}>
            <div><p>Original target · always visible</p><h2 id="gather-title">What to Gather</h2></div>
            <span>For {selectedQuantity} × {nodeMap.get(selectedTargetId)?.name}</span>
          </div>
          {gather.raw.length > 0 ? (
            <ul className={styles.gatherList}>
              {gather.raw.map((item) => (
                <li key={item.id}><ItemTile item={nodeMap.get(item.id) || item} /><span>{item.name}</span><strong>{item.quantity}</strong></li>
              ))}
            </ul>
          ) : <p className={styles.emptyState}>No raw-resource shortages for this target.</p>}

          {gather.incomplete.length > 0 && (
            <aside className={styles.recipeWarning} aria-labelledby="recipe-needed-title">
              <div><strong id="recipe-needed-title">Recipe Needed — can’t fully compute</strong><span>Kept separate from raw gathering totals.</span></div>
              <ul>{gather.incomplete.map((item) => <li key={item.id}><span>{item.name} <strong>{item.missing}</strong></span><button type="button" onClick={() => setEditingItemId(item.id)}>Add recipe</button></li>)}</ul>
            </aside>
          )}
          {originalResult.protectedRequired.length > 0 && (
            <p className={styles.protectedWarning}><strong>Protected:</strong> this plan consumes {originalResult.protectedRequired.map((item) => `${item.quantity} ${item.name}`).join(', ')}.</p>
          )}
          {originalResult.circular.hasCircular && <p className={styles.recipeWarning}>Circular recipe detected. This branch cannot be fully computed.</p>}
        </section>

        <section className={styles.quickEdit} aria-labelledby="quick-edit-title">
          <div><p>Saved instantly to TAG World</p><h2 id="quick-edit-title">Quick inventory edit</h2></div>
          <label>
            <span>Material</span>
            <select value={quickEditId} onChange={(event) => setQuickEditId(event.target.value)}>
              {inventoryItems.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className={styles.quickNumber}>
            <span>Owned total</span>
            <input inputMode="numeric" value={inventory[quickEditId] || 0} onChange={(event) => updateInventory(quickEditId, event.target.value)} />
          </label>
        </section>

        <details className={styles.milestoneBoard}>
          <summary>
            <span><small>Secondary progress</small><strong>Milestone Board</strong></span>
            <span>{completedCount} / {midgameMilestones.length} complete</span>
          </summary>
          <div className={styles.milestoneBody}>
            <button className={styles.resetButton} type="button" onClick={() => setCompleted(emptyMilestones())}>Reset milestones</button>
            {CATEGORY_ORDER.map((category) => (
              <section className={styles.milestoneCategory} key={category}>
                <h3>{category}</h3>
                <div className={styles.milestoneGrid}>
                  {midgameMilestones.filter((milestone) => milestone.category === category).map((milestone) => {
                    const unmet = getUnmetPrerequisites(milestone, completed);
                    const isComplete = completed[milestone.id];
                    return (
                      <button type="button" aria-pressed={isComplete} onClick={() => setCompleted((current) => ({ ...current, [milestone.id]: !current[milestone.id] }))} key={milestone.id}>
                        <span aria-hidden="true">{isComplete ? '✓' : ''}</span>
                        <span><strong>{milestone.label}</strong><small>{isComplete ? 'Complete' : unmet.length ? `Needs ${unmet.join(', ')}` : 'Ready'}</small></span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </details>

        <footer className={styles.footer}><span>MajedGames Companion</span><span>{STORAGE_KEY}</span></footer>
        {editingItem && (
          <RecipeEditor
            key={editingItem.id}
            item={editingItem}
            materials={inventoryItems}
            onClose={() => setEditingItemId(null)}
            onSave={saveRecipe}
            onClear={clearRecipe}
          />
        )}
      </div>
    </main>
  );
}
