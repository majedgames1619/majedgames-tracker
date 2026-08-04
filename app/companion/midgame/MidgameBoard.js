'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { midgameMilestones } from './midgameMilestones';
import styles from './page.module.css';

const WORLD_ID = 'tagback';
const SCHEMA_VERSION = 1;
const STORAGE_KEY = `mgc:world:${WORLD_ID}:v${SCHEMA_VERSION}`;
const CATEGORY_ORDER = ['Base', 'Production', 'Progression'];
const FOCUS_FOUNDATION_IDS = [
  'cake_ready',
  'ore_mine',
  'electricity',
  'refined_ingots',
  'two_bases',
  'guild_storage',
  'pure_quartz',
  'electric_furnace',
];
const FOCUS_PATH_IDS = [
  'production_assembly_line_2',
  'coal_quarry',
  'crude_oil_extraction',
];

const milestonesById = Object.fromEntries(
  midgameMilestones.map((milestone) => [milestone.id, milestone]),
);

function createEmptyMilestones() {
  return Object.fromEntries(midgameMilestones.map((milestone) => [milestone.id, false]));
}

function normalizeStoredMilestones(storedMilestones) {
  const normalized = createEmptyMilestones();

  if (!storedMilestones || typeof storedMilestones !== 'object') {
    return normalized;
  }

  for (const milestone of midgameMilestones) {
    normalized[milestone.id] = storedMilestones[milestone.id] === true;
  }

  return normalized;
}

function getMissingPrerequisites(milestone, completed) {
  return milestone.prerequisites.filter((id) => completed[id] !== true);
}

function getNextMove(completed) {
  const incomplete = midgameMilestones.filter((milestone) => !completed[milestone.id]);

  if (incomplete.length === 0) {
    return { kind: 'complete' };
  }

  const foundationReady = FOCUS_FOUNDATION_IDS.every((id) => completed[id]);
  const focusMilestones = FOCUS_PATH_IDS
    .map((id) => milestonesById[id])
    .filter((milestone) => !completed[milestone.id]);
  const orderedCandidates = foundationReady
    ? [...focusMilestones, ...incomplete.filter((milestone) => !FOCUS_PATH_IDS.includes(milestone.id))]
    : incomplete;
  const available = orderedCandidates.find(
    (milestone) => getMissingPrerequisites(milestone, completed).length === 0,
  );

  if (available) {
    return { kind: 'recommended', milestone: available };
  }

  const blocked = orderedCandidates[0];
  return {
    kind: 'blocked',
    milestone: blocked,
    missingPrerequisites: getMissingPrerequisites(blocked, completed),
  };
}

export default function MidgameBoard() {
  const [completed, setCompleted] = useState(createEmptyMilestones);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        if (parsed?.schemaVersion === SCHEMA_VERSION) {
          setCompleted(normalizeStoredMilestones(parsed.milestones));
        }
      }
    } catch {
      // Local storage is optional; in-memory state still works for this session.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          milestones: completed,
        }),
      );
    } catch {
      // Local storage is optional; keep the current session usable.
    }
  }, [completed, storageReady]);

  const nextMove = useMemo(() => getNextMove(completed), [completed]);
  const completedCount = Object.values(completed).filter(Boolean).length;

  function toggleMilestone(id) {
    setCompleted((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <main className={styles.shell}>
      <div className={styles.ambientTop} aria-hidden="true" />
      <div className={styles.ambientBottom} aria-hidden="true" />

      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/companion" aria-label="Return to MajedGames Companion">
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 44 44">
                <path d="M9 30V14l8.7 10.4L22 18l4.3 6.4L35 14v16" />
                <path d="M9 35h26" />
              </svg>
            </span>
            <span className={styles.brandText}>
              <strong>MajedGames</strong>
              <span>Companion</span>
            </span>
          </Link>

          <div className={styles.headerMeta}>
            <span className={styles.phase}>Mid-Game Pre-Alpha</span>
            <span className={styles.profile} aria-label="Majed profile">M</span>
          </div>
        </header>

        <section className={styles.intro} aria-labelledby="midgame-heading">
          <div>
            <p className={styles.eyebrow}><span aria-hidden="true" /> World milestone planner</p>
            <h1 id="midgame-heading">
              Palworld Mid-Game Companion <span>&mdash; Pre-Alpha</span>
            </h1>
            <p className={styles.subtitle}>Less remembering. More playing.</p>
          </div>
          <div className={styles.worldBadge}>
            <small>Active world</small>
            <strong>Tagback</strong>
          </div>
        </section>

        <NextMovePanel nextMove={nextMove} completed={completed} />

        <section className={styles.board} aria-labelledby="milestone-board-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>World state</p>
              <h2 id="milestone-board-heading">Milestone Board</h2>
            </div>
            <span>{completedCount} of {midgameMilestones.length} complete</span>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const categoryMilestones = midgameMilestones.filter(
              (milestone) => milestone.category === category,
            );

            return (
              <section className={styles.category} aria-labelledby={`category-${category.toLowerCase()}`} key={category}>
                <div className={styles.categoryHeading}>
                  <h3 id={`category-${category.toLowerCase()}`}>{category}</h3>
                  <span>{categoryMilestones.filter((milestone) => completed[milestone.id]).length} / {categoryMilestones.length}</span>
                </div>
                <div className={styles.milestoneGrid}>
                  {categoryMilestones.map((milestone) => {
                    const isComplete = completed[milestone.id];
                    return (
                      <button
                        className={`${styles.milestoneCard} ${isComplete ? styles.milestoneComplete : ''}`}
                        type="button"
                        aria-pressed={isComplete}
                        onClick={() => toggleMilestone(milestone.id)}
                        key={milestone.id}
                      >
                        <span className={styles.check} aria-hidden="true">
                          {isComplete ? <>&#10003;</> : null}
                        </span>
                        <span className={styles.milestoneCopy}>
                          <small>{isComplete ? 'Complete' : 'Not complete'}</small>
                          <strong>{milestone.label}</strong>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>

        <footer className={styles.footer}>
          <span>MajedGames Companion</span>
          <span>Local pre-alpha &middot; World: {WORLD_ID}</span>
        </footer>
      </div>
    </main>
  );
}

function NextMovePanel({ nextMove, completed }) {
  if (nextMove.kind === 'complete') {
    return (
      <section className={`${styles.nextMove} ${styles.allComplete}`} aria-labelledby="next-move-heading" aria-live="polite">
        <div className={styles.nextMoveIcon} aria-hidden="true">&#10003;</div>
        <div>
          <p>Next Move</p>
          <h2 id="next-move-heading">All tracked milestones complete</h2>
          <span>Your mid-game world plan is clear. Pick the adventure that sounds most fun.</span>
        </div>
      </section>
    );
  }

  const { milestone } = nextMove;
  const missingLabels = nextMove.kind === 'blocked'
    ? nextMove.missingPrerequisites.map((id) => milestonesById[id]?.label || id)
    : [];

  return (
    <section className={styles.nextMove} aria-labelledby="next-move-heading" aria-live="polite">
      <div className={styles.nextMoveTopline}>
        <p><span aria-hidden="true" /> Next Move</p>
        <span>{nextMove.kind === 'blocked' ? 'Blocked' : 'Ready now'}</span>
      </div>
      <div className={styles.nextMoveBody}>
        <div>
          <small>{milestone.category} milestone</small>
          <h2 id="next-move-heading">Build {milestone.label}</h2>
          <p>
            {nextMove.kind === 'blocked'
              ? `Blocked — requires ${missingLabels.join(' and ')} first.`
              : milestone.reason}
          </p>
        </div>
        <div className={styles.nextMoveProgress} aria-label={`${milestone.prerequisites.filter((id) => completed[id]).length} of ${milestone.prerequisites.length} prerequisites complete`}>
          <strong>{milestone.prerequisites.length === 0 ? 'Ready' : `${milestone.prerequisites.filter((id) => completed[id]).length}/${milestone.prerequisites.length}`}</strong>
          <span>{milestone.prerequisites.length === 0 ? 'No prerequisites' : 'Prerequisites'}</span>
        </div>
      </div>
    </section>
  );
}
