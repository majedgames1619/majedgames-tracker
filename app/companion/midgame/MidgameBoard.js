'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { calculateTarget } from './data/craftingCalculator.mjs';
import {
  DOC_QUESTIONS,
  STATUS,
  getBreakdown,
  getDocAnswer,
  getFirstLevelComponents,
  getResultStatus,
  getStatusTone,
  getTargetMetrics,
} from './data/phaseB1Logic.mjs';
import { tagWorldProfile } from './data/recipeGraph.mjs';
import { TAG_WORLD_STORAGE_MARKER, readTagBackWorldSave, writeTagBackWorldSave } from './data/tagBackStorage.mjs';
import { midgameMilestones } from './midgameMilestones';
import styles from './page.module.css';

const STORAGE_KEY = tagWorldProfile.storageKey;
const CATEGORY_ORDER = ['Base', 'Production', 'Progression'];
const DEFAULT_TARGET_ID = 'weapon-line';

function createEmptyMilestones() {
  return Object.fromEntries(midgameMilestones.map((milestone) => [milestone.id, false]));
}

function normalizeMilestones(source) {
  return Object.fromEntries(
    midgameMilestones.map((milestone) => [milestone.id, source?.[milestone.id] === true]),
  );
}

function getMilestoneById(id) {
  return midgameMilestones.find((milestone) => milestone.id === id);
}

function getUnmetPrerequisites(milestone, completed) {
  return milestone.prerequisites
    .filter((prerequisiteId) => !completed[prerequisiteId])
    .map((prerequisiteId) => getMilestoneById(prerequisiteId)?.label || prerequisiteId);
}

function getNextMilestone(completed) {
  const incompleteMilestones = midgameMilestones.filter((milestone) => !completed[milestone.id]);
  const readyMilestone = incompleteMilestones.find((milestone) => getUnmetPrerequisites(milestone, completed).length === 0);

  if (readyMilestone) return readyMilestone;
  return incompleteMilestones[0] || null;
}

function cleanQuantity(value) {
  const parsed = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  return Number.isSafeInteger(parsed) ? parsed : 0;
}

function getHue(id) {
  return Array.from(id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
}

function getTargetOptions() {
  return tagWorldProfile.nodes
    .filter((node) => node.recipe)
    .map((node) => {
      const targetMeta = tagWorldProfile.targets.find((target) => target.id === node.id);
      return {
        ...node,
        priority: targetMeta?.priority || 99,
        purpose: targetMeta?.purpose || node.name,
      };
    })
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

function ItemTile({ item, size = 'normal' }) {
  return (
    <span
      className={`${styles.itemTile} ${size === 'large' ? styles.itemTileLarge : ''}`}
      style={{ '--tile-hue': getHue(item.id) }}
      aria-hidden="true"
    >
      <span>{item.name.split(' ').map((word) => word[0]).join('').slice(0, 3)}</span>
    </span>
  );
}

function StatusPill({ status }) {
  return <span className={`${styles.statusPill} ${styles[getStatusTone(status)]}`}>{status}</span>;
}

function ReadMore({ summary, children }) {
  return (
    <details className={styles.readMore}>
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  );
}

export default function MidgameBoard() {
  const targetOptions = useMemo(getTargetOptions, []);
  const nodeById = useMemo(() => new Map(tagWorldProfile.nodes.map((node) => [node.id, node])), []);
  const inventoryItems = useMemo(
    () => tagWorldProfile.nodes.filter((node) => node.kind === 'item').sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const [completed, setCompleted] = useState(createEmptyMilestones);
  const [inventory, setInventory] = useState(tagWorldProfile.inventory);
  const [selectedTargetId, setSelectedTargetId] = useState(DEFAULT_TARGET_ID);
  const [selectedDocQuestion, setSelectedDocQuestion] = useState('next');
  const [mobileView, setMobileView] = useState('tracker');
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      const save = readTagBackWorldSave(rawValue);
      const knownTargetIds = new Set(targetOptions.map((target) => target.id));

      setCompleted(normalizeMilestones(save.milestones));
      setInventory(save.inventory);
      if (save.selectedTarget && knownTargetIds.has(save.selectedTarget)) {
        setSelectedTargetId(save.selectedTarget);
      }
    } catch {
      // Local storage is optional; the tracker remains usable with TAG World defaults.
    } finally {
      setStorageReady(true);
    }
  }, [targetOptions]);

  useEffect(() => {
    if (!storageReady) return;

    try {
      const currentValue = window.localStorage.getItem(STORAGE_KEY);
      window.localStorage.setItem(
        STORAGE_KEY,
        writeTagBackWorldSave(currentValue, {
          milestones: completed,
          inventory,
          selectedTarget: selectedTargetId,
        }),
      );
    } catch {
      // Keep the in-session tracker usable even if browser storage is unavailable.
    }
  }, [completed, inventory, selectedTargetId, storageReady]);

  const selectedTarget = nodeById.get(selectedTargetId) || nodeById.get(DEFAULT_TARGET_ID);
  const targetResult = useMemo(
    () => calculateTarget(tagWorldProfile, selectedTarget.id, { inventory }),
    [inventory, selectedTarget.id],
  );
  const targetStatus = getResultStatus(targetResult);
  const targetMetrics = getTargetMetrics(targetResult);
  const firstLevelComponents = useMemo(
    () => getFirstLevelComponents(selectedTarget).map((component) => {
      const node = nodeById.get(component.id) || { id: component.id, name: component.id };
      const result = calculateTarget(tagWorldProfile, component.id, { inventory, quantity: component.quantity });
      return {
        ...component,
        node,
        result,
        status: getResultStatus(result),
        breakdown: getBreakdown(result, component.id),
      };
    }),
    [inventory, nodeById, selectedTarget],
  );
  const craftableSummaries = useMemo(
    () => targetOptions.map((target) => ({
      id: target.id,
      name: target.name,
      status: getResultStatus(calculateTarget(tagWorldProfile, target.id, { inventory })),
    })),
    [inventory, targetOptions],
  );
  const docAnswer = getDocAnswer(selectedDocQuestion, targetResult, craftableSummaries);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const nextMilestone = getNextMilestone(completed);

  function updateInventory(id, value) {
    setInventory((current) => ({ ...current, [id]: cleanQuantity(value) }));
  }

  function toggleMilestone(id) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  }

  function resetMilestones() {
    setCompleted(createEmptyMilestones());
  }

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/companion" aria-label="Return to MajedGames Companion">
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 44 44"><path d="M9 30V14l8.7 10.4L22 18l4.3 6.4L35 14v16" /><path d="M9 35h26" /></svg>
            </span>
            <span className={styles.brandText}><strong>MajedGames</strong><span>Companion</span></span>
          </Link>
          <div className={styles.headerMeta}><span className={styles.phase}>Phase B1</span><span className={styles.profile}>52</span></div>
        </header>

        <section className={styles.hero} aria-labelledby="midgame-heading">
          <div>
            <p className={styles.eyebrow}>TagBackTV community server</p>
            <h1 id="midgame-heading">Crafting tracker</h1>
            <p className={styles.subtitle}>Visual targets, manual inventory, and rules-based Doc advice powered by the Phase A crafting engine.</p>
          </div>
          <label className={styles.targetSelect}>
            <span>Current target</span>
            <select value={selectedTargetId} onChange={(event) => setSelectedTargetId(event.target.value)}>
              {targetOptions.map((target) => <option value={target.id} key={target.id}>{target.name}</option>)}
            </select>
          </label>
        </section>

        <nav className={styles.mobileTabs} aria-label="Midgame views">
          {[
            ['tracker', 'Tracker'],
            ['doc', 'Ask Doc'],
            ['inventory', 'Inventory'],
          ].map(([id, label]) => (
            <button type="button" className={mobileView === id ? styles.activeTab : ''} onClick={() => setMobileView(id)} key={id}>{label}</button>
          ))}
        </nav>

        <div className={styles.mainGrid}>
          <section className={`${styles.trackerPanel} ${mobileView === 'tracker' ? styles.mobileVisible : ''}`} aria-labelledby="tracker-heading">
            <article className={`${styles.targetCard} ${styles[getStatusTone(targetStatus)]}`}>
              <div className={styles.targetArt}>
                <ItemTile item={selectedTarget} size="large" />
              </div>
              <div className={styles.targetInfo}>
                <div className={styles.cardTopline}>
                  <span>Crafting target</span>
                  <StatusPill status={targetStatus} />
                </div>
                <h2 id="tracker-heading">{selectedTarget.name}</h2>
                <p>{selectedTarget.purpose || 'Track known recipe requirements from TAG World data.'}</p>
                <div className={styles.metricRow}>
                  <span><small>Need</small><strong>{targetMetrics.need || 1}</strong></span>
                  <span><small>Owned</small><strong>{targetMetrics.have}</strong></span>
                  <span><small>Remaining</small><strong>{targetMetrics.missing}</strong></span>
                </div>
                <div className={styles.progressTrack} aria-label={`${targetMetrics.progress}% owned`}>
                  <span style={{ width: `${targetMetrics.progress}%` }} />
                </div>
              </div>
            </article>

            <section className={styles.componentSection} aria-labelledby="components-heading">
              <div className={styles.sectionHeading}>
                <div><p>First-level components</p><h2 id="components-heading">Required components</h2></div>
                <span>{firstLevelComponents.length} cards</span>
              </div>
              <div className={styles.componentGrid}>
                {firstLevelComponents.map((component) => (
                  <article className={`${styles.componentCard} ${styles[getStatusTone(component.status)]}`} key={component.id}>
                    <div className={styles.componentTop}>
                      <ItemTile item={component.node} />
                      <StatusPill status={component.status} />
                    </div>
                    <h3>{component.node.name}</h3>
                    <div className={styles.compactStats}>
                      <span><small>Have</small><strong>{component.breakdown.have}</strong></span>
                      <span><small>Need</small><strong>{component.breakdown.need}</strong></span>
                      <span><small>Missing</small><strong>{component.breakdown.missing}</strong></span>
                    </div>
                    {component.result.incomplete.length > 0 && <p className={styles.cardNote}>Recipe needed: {component.result.incomplete.map((item) => item.name).join(', ')}</p>}
                  </article>
                ))}
              </div>
            </section>

            <div className={styles.summaryGrid}>
              <section className={styles.gatherCard} aria-labelledby="gather-heading">
                <div className={styles.sectionHeading}>
                  <div><p>Raw only</p><h2 id="gather-heading">What to Gather</h2></div>
                </div>
                {targetResult.rawShortages.length ? (
                  <ul className={styles.gatherList}>
                    {targetResult.rawShortages.map((item) => <li key={item.id}><strong>{item.quantity}</strong><span>{item.name}</span></li>)}
                  </ul>
                ) : <p className={styles.emptyText}>No raw gathering needed for this target.</p>}
              </section>

              <section className={styles.recipeCard} aria-labelledby="recipe-heading">
                <div className={styles.sectionHeading}>
                  <div><p>Unknown data</p><h2 id="recipe-heading">Recipe Needed</h2></div>
                </div>
                {targetResult.incomplete.length ? (
                  <ul className={styles.recipeList}>
                    {targetResult.incomplete.map((item) => <li key={item.id}>{item.name}</li>)}
                  </ul>
                ) : <p className={styles.emptyText}>No incomplete recipe in this branch.</p>}
              </section>
            </div>

            <button className={styles.uploadPlaceholder} type="button" disabled>
              Upload Inventory Screenshots <span>Coming soon in Phase C</span>
            </button>
          </section>

          <aside className={`${styles.docPanel} ${mobileView === 'doc' ? styles.mobileVisible : ''}`} aria-labelledby="doc-heading">
            <div className={styles.docHeader}>
              <span aria-hidden="true">D</span>
              <div><p>Rules-based Doc</p><h2 id="doc-heading">Ask Doc</h2></div>
            </div>
            <div className={styles.docQuestionGrid}>
              {DOC_QUESTIONS.map(([id, label]) => (
                <button className={selectedDocQuestion === id ? styles.questionActive : ''} type="button" onClick={() => setSelectedDocQuestion(id)} key={id}>{label}</button>
              ))}
            </div>
            <article className={styles.docAnswer} aria-live="polite">
              <strong>{docAnswer.short}</strong>
              <ReadMore summary="Read More">
                <p>{docAnswer.detail}</p>
              </ReadMore>
            </article>
            <section className={styles.protectBox} aria-label="Protected resource warning">
              <h3>Protect</h3>
              {targetResult.protectedRequired.length ? (
                <ul>
                  {targetResult.protectedRequired.map((item) => <li key={item.id}>{item.quantity} {item.name}</li>)}
                </ul>
              ) : <p>No protected resources required by this target.</p>}
            </section>
          </aside>
        </div>

        <section className={`${styles.inventoryPanel} ${mobileView === 'inventory' ? styles.mobileVisible : ''}`} aria-labelledby="inventory-heading">
          <div className={styles.sectionHeading}>
            <div><p>Manual entry only</p><h2 id="inventory-heading">Inventory Editor</h2></div>
            <span>Saved to {STORAGE_KEY}</span>
          </div>
          <div className={styles.inventoryGrid}>
            {inventoryItems.map((item) => (
              <label key={item.id}>
                <span>{item.name}</span>
                <input inputMode="numeric" value={inventory[item.id] || 0} onChange={(event) => updateInventory(item.id, event.target.value)} />
              </label>
            ))}
          </div>
        </section>

        <section className={styles.supportingBoard} aria-labelledby="milestone-board-heading">
          <div className={styles.sectionHeading}>
            <div><p>Supporting progress</p><h2 id="milestone-board-heading">Milestone Board</h2></div>
            <div className={styles.actionRow}>
              <span>{completedCount} of {midgameMilestones.length} complete</span>
              <button className={styles.secondaryButton} type="button" onClick={resetMilestones}>Reset unchecked</button>
            </div>
          </div>
          {nextMilestone && <p className={styles.milestoneHint}>Next supporting milestone: {nextMilestone.label}</p>}

          {CATEGORY_ORDER.map((category) => {
            const categoryMilestones = midgameMilestones.filter((milestone) => milestone.category === category);
            return (
              <section className={styles.category} key={category}>
                <div className={styles.categoryHeading}><h3>{category}</h3><span>{categoryMilestones.filter((milestone) => completed[milestone.id]).length} / {categoryMilestones.length}</span></div>
                <div className={styles.milestoneGrid}>
                  {categoryMilestones.map((milestone) => {
                    const isComplete = completed[milestone.id];
                    const unmetPrerequisites = getUnmetPrerequisites(milestone, completed);
                    const isLocked = !isComplete && unmetPrerequisites.length > 0;

                    return (
                      <button
                        className={`${styles.milestoneCard} ${isComplete ? styles.milestoneComplete : ''} ${isLocked ? styles.milestoneLocked : ''}`}
                        type="button"
                        aria-pressed={isComplete}
                        onClick={() => toggleMilestone(milestone.id)}
                        key={milestone.id}
                      >
                        <span className={styles.check} aria-hidden="true">{isComplete ? <>&#10003;</> : null}</span>
                        <span className={styles.milestoneCopy}>
                          <small>{isComplete ? 'Complete' : isLocked ? 'Prerequisite blocked' : 'Ready'}</small>
                          <strong>{milestone.label}</strong>
                          {milestone.prerequisites.length > 0 && (
                            <em>Needs {milestone.prerequisites.map((id) => getMilestoneById(id)?.label || id).join(', ')}</em>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>

        <footer className={styles.footer}><span>MajedGames Companion</span><span>Storage marker: {TAG_WORLD_STORAGE_MARKER}</span></footer>
      </div>
    </main>
  );
}
