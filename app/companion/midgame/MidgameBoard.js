'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { midgameMilestones } from './midgameMilestones';
import styles from './page.module.css';

const STORAGE_KEY = 'mgc:world:tagback:v1';
const STORAGE_MARKER = 'tagback-midgame-task-a';
const CATEGORY_ORDER = ['Base', 'Production', 'Progression'];

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

function getNextMove(completed) {
  const incompleteMilestones = midgameMilestones.filter((milestone) => !completed[milestone.id]);
  const readyMilestones = incompleteMilestones.filter(
    (milestone) => getUnmetPrerequisites(milestone, completed).length === 0,
  );

  if (incompleteMilestones.length === 0) {
    return {
      status: 'Run plan complete',
      title: 'All midgame milestones are complete',
      body: 'Every Task A milestone for this fresh randomized TagBackTV world is marked complete.',
      blockedBy: [],
    };
  }

  if (readyMilestones.length > 0) {
    const nextMilestone = readyMilestones[0];
    return {
      status: 'Ready now',
      title: nextMilestone.label,
      body: nextMilestone.reason,
      blockedBy: [],
    };
  }

  const blockedMilestone = incompleteMilestones[0];
  return {
    status: 'Prerequisites needed',
    title: blockedMilestone.label,
    body: blockedMilestone.reason,
    blockedBy: getUnmetPrerequisites(blockedMilestone, completed),
  };
}

export default function MidgameBoard() {
  const [completed, setCompleted] = useState(createEmptyMilestones);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (!storedValue) return;

      const parsed = JSON.parse(storedValue);
      if (parsed?.marker !== STORAGE_MARKER) return;

      setCompleted(normalizeMilestones(parsed.milestones));
    } catch {
      // A malformed localStorage entry should not stop the board from loading unchecked.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        marker: STORAGE_MARKER,
        milestones: completed,
      }));
    } catch {
      // Local storage is optional; the in-session tracker still works.
    }
  }, [completed, storageReady]);

  const nextMove = useMemo(() => getNextMove(completed), [completed]);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / midgameMilestones.length) * 100);

  function toggleMilestone(id) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  }

  function resetMilestones() {
    setCompleted(createEmptyMilestones());
  }

  return (
    <main className={styles.shell}>
      <div className={styles.ambientTop} aria-hidden="true" />
      <div className={styles.ambientBottom} aria-hidden="true" />
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/companion" aria-label="Return to MajedGames Companion">
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 44 44"><path d="M9 30V14l8.7 10.4L22 18l4.3 6.4L35 14v16" /><path d="M9 35h26" /></svg>
            </span>
            <span className={styles.brandText}><strong>MajedGames</strong><span>Companion</span></span>
          </Link>
          <div className={styles.headerMeta}><span className={styles.phase}>Task A</span><span className={styles.profile}>52</span></div>
        </header>

        <section className={styles.intro} aria-labelledby="midgame-heading">
          <div>
            <p className={styles.eyebrow}><span aria-hidden="true" /> TagBackTV community server</p>
            <h1 id="midgame-heading">Palworld randomized midgame</h1>
            <p className={styles.subtitle}>Fresh restarted world, around Level 52. Milestones start unchecked and the next move follows prerequisites.</p>
          </div>
          <div className={styles.worldBadge}><small>World</small><strong>TagBackTV</strong></div>
        </section>

        <section className={styles.nextMove} aria-labelledby="next-move-heading" aria-live="polite">
          <div className={styles.nextMoveTopline}><p><span aria-hidden="true" /> Prerequisite logic</p><span>{nextMove.status}</span></div>
          <div className={styles.nextMoveBody}>
            <div>
              <small>Best next move</small>
              <h2 id="next-move-heading">{nextMove.title}</h2>
              <p>{nextMove.body}</p>
              {nextMove.blockedBy.length > 0 && (
                <p className={styles.blockedText}>Complete first: {nextMove.blockedBy.join(', ')}</p>
              )}
            </div>
            <div className={styles.nextMoveProgress}><strong>{progressPercent}%</strong><span>{completedCount}/{midgameMilestones.length} done</span></div>
          </div>
        </section>

        <section className={styles.board} aria-labelledby="milestone-board-heading">
          <div className={styles.sectionHeading}>
            <div><p>Fresh run checklist</p><h2 id="milestone-board-heading">Milestone Board</h2></div>
            <div className={styles.actionRow}>
              <span>{completedCount} of {midgameMilestones.length} complete</span>
              <button className={styles.secondaryButton} type="button" onClick={resetMilestones}>Reset unchecked</button>
            </div>
          </div>

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
                            <em>
                              Needs {milestone.prerequisites.map((id) => getMilestoneById(id)?.label || id).join(', ')}
                            </em>
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

        <footer className={styles.footer}><span>MajedGames Companion</span><span>Storage: {STORAGE_KEY}</span></footer>
      </div>
    </main>
  );
}
