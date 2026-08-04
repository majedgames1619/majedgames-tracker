'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { buildProjects, getPriorityQueueCost, materialNames, photographedInventory } from './helperData';
import { midgameMilestones } from './midgameMilestones';
import styles from './page.module.css';

const WORLD_ID = 'tag-world';
const SCHEMA_VERSION = 3;
const STORAGE_KEY = `mgc:world:${WORLD_ID}:v${SCHEMA_VERSION}`;
const MILESTONE_STORAGE_KEYS = ['mgc:world:tagback:v2', 'mgc:world:tagback:v1'];
const CATEGORY_ORDER = ['Base', 'Production', 'Progression'];

function createEmptyMilestones() {
  return Object.fromEntries(midgameMilestones.map((milestone) => [milestone.id, false]));
}

function createEmptyBuilds() {
  return Object.fromEntries(buildProjects.map((project) => [project.id, false]));
}

function normalizeBooleanMap(source, items) {
  return Object.fromEntries(items.map((item) => [item.id, source?.[item.id] === true]));
}

function cleanQuantity(value) {
  const parsed = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  return Number.isSafeInteger(parsed) ? parsed : 0;
}

function getRequirements(materials, inventory) {
  return Object.entries(materials).map(([id, need]) => {
    const have = inventory[id] || 0;
    return { id, name: materialNames[id], need, have, missing: Math.max(need - have, 0) };
  });
}

function getProjectState(project, inventory, built) {
  const requirements = getRequirements(project.materials, inventory);
  const met = requirements.filter((item) => item.missing === 0).length;
  const readiness = Math.round(
    requirements.reduce((total, item) => total + Math.min(item.have / item.need, 1), 0)
      / requirements.length * 100,
  );
  return { ...project, built, requirements, readiness, isReady: met === requirements.length };
}

function getAdvice(inventory, projects) {
  const queueMissing = getRequirements(getPriorityQueueCost(inventory), inventory)
    .filter((item) => item.missing > 0)
    .sort((a, b) => b.missing - a.missing);
  const weaponLine = projects.find((project) => project.id === 'weapon-line');
  const workshop = projects.find((project) => project.id === 'advanced-workshop');
  const crusher = projects.find((project) => project.id === 'cryogenic-crusher');

  if (!weaponLine.built || !workshop.built) {
    if (queueMissing.length > 0) {
      const top = queueMissing[0];
      const redOreNote = top.id === 'coralumIngot' && inventory.coralumOre > 0
        ? ` You have ${inventory.coralumOre} raw Red Ore in the Guild Chest; keep it separate from finished Ingots until its conversion yield is confirmed.`
        : '';
      return {
        badge: 'Doc recommendation',
        title: `Get ${top.missing} more ${top.name}`,
        reason: `This is the largest remaining shortage for your Advanced Weapon Assembly Line + Advanced Workshop plan. The full queue needs 100 Red Ore Ingots, 10 crafted Thermal Cores, and 30 crafted Computers.${redOreNote}`,
        status: `${queueMissing.length} shortages left`,
        queueMissing,
      };
    }

    const nextBuild = !weaponLine.built ? weaponLine : workshop;
    return {
      badge: 'Ready to build',
      title: `Build ${nextBuild.name}`,
      reason: 'Your inventory covers the complete priority queue, including the hidden materials inside Thermal Cores and Computers.',
      status: 'All materials ready',
      queueMissing: [],
    };
  }

  if (!crusher.built && crusher.isReady) {
    return {
      badge: 'Quick win',
      title: 'Build Cryogenic Crusher',
      reason: 'It is ready now and does not require your protected Ancient Civilization Cores.',
      status: 'Ready now',
      queueMissing: [],
    };
  }

  return {
    badge: 'Priority complete',
    title: 'Prepare for the Sky Tower',
    reason: 'Your two priority production builds are complete. Add your weapon, armor, shield, and ammunition screenshots next so Doc can calculate combat readiness.',
    status: 'Needs combat data',
    queueMissing: [],
  };
}

export default function MidgameBoard() {
  const [completed, setCompleted] = useState(createEmptyMilestones);
  const [inventory, setInventory] = useState(photographedInventory);
  const [built, setBuilt] = useState(createEmptyBuilds);
  const [selectedProjectId, setSelectedProjectId] = useState('weapon-line');
  const [openAnswer, setOpenAnswer] = useState('next');
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        setCompleted(normalizeBooleanMap(parsed.milestones, midgameMilestones));
        setBuilt(normalizeBooleanMap(parsed.builds, buildProjects));
        setInventory({ ...photographedInventory, ...parsed.inventory });
      } else {
        for (const oldKey of MILESTONE_STORAGE_KEYS) {
          const oldValue = window.localStorage.getItem(oldKey);
          if (oldValue) {
            const parsed = JSON.parse(oldValue);
            setCompleted(normalizeBooleanMap(parsed.milestones, midgameMilestones));
            setBuilt(normalizeBooleanMap(parsed.builds, buildProjects));
            break;
          }
        }
      }
    } catch {
      // The helper remains usable with the photographed defaults.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        milestones: completed,
        inventory,
        builds: built,
      }));
    } catch {
      // Local storage is optional; keep the current session usable.
    }
  }, [built, completed, inventory, storageReady]);

  const projects = useMemo(
    () => buildProjects.map((project) => getProjectState(project, inventory, built[project.id])),
    [built, inventory],
  );
  const advice = useMemo(() => getAdvice(inventory, projects), [inventory, projects]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const readyProjects = projects.filter((project) => project.isReady && !project.built && !project.protected);

  const quickAnswers = {
    next: advice.reason,
    ready: readyProjects.length
      ? `You can build ${readyProjects.map((project) => project.name).join(' and ')} now. Mark a build complete after you place it so I can recalculate.`
      : 'No unbuilt safe project is fully ready with the current inventory.',
    blocked: advice.queueMissing.length
      ? `Your priority queue is blocked by ${advice.queueMissing.map((item) => `${item.missing} ${item.name}`).join(', ')}.`
      : 'Your priority production queue has no material shortages.',
    protect: `Protect your ${inventory.ancientCore} Ancient Civilization Cores. Do not spend them on the Ancient Furnace, Generator, Relic Recycler, or AI Cores yet. Reserve Red Ore for the two priority production builds first.`,
    farm: inventory.coralumIngot < 100
      ? `Farm Red Ore first. You currently have ${inventory.coralumOre} raw Red Ore and ${inventory.coralumIngot} finished Coralum Ingots. After that, get ${Math.max(50 - inventory.corrosiveSolvent, 0)} Corrosive Solvent and ${Math.max(60 - inventory.circuitBoard, 0)} Circuit Boards for the two priority production builds.`
      : advice.queueMissing.length
        ? `Farm ${advice.queueMissing[0].name}: you are missing ${advice.queueMissing[0].missing}.`
        : 'Your priority build materials are ready. Focus on placing the two production lines.',
  };

  function updateInventory(id, value) {
    setInventory((current) => ({ ...current, [id]: cleanQuantity(value) }));
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
          <div className={styles.headerMeta}><span className={styles.phase}>Helper Pre-Alpha</span><span className={styles.profile}>M</span></div>
        </header>

        <section className={styles.intro} aria-labelledby="midgame-heading">
          <div>
            <p className={styles.eyebrow}><span aria-hidden="true" /> Personal world adviser</p>
            <h1 id="midgame-heading">Palworld Helper <span>&mdash; TAG World</span></h1>
            <p className={styles.subtitle}>Your inventory decides the plan. Doc explains the next move.</p>
          </div>
          <div className={styles.worldBadge}><small>Data source</small><strong>Your screenshots</strong></div>
        </section>

        <section className={styles.nextMove} aria-labelledby="next-move-heading" aria-live="polite">
          <div className={styles.nextMoveTopline}><p><span aria-hidden="true" /> {advice.badge}</p><span>{advice.status}</span></div>
          <div className={styles.nextMoveBody}>
            <div><small>Best next move</small><h2 id="next-move-heading">{advice.title}</h2><p>{advice.reason}</p></div>
            <div className={styles.nextMoveProgress}><strong>{inventory.coralumIngot}/100</strong><span>Red Ore Ingots</span></div>
          </div>
        </section>

        <section className={styles.docSection} aria-labelledby="ask-doc-heading">
          <div className={styles.sectionHeading}>
            <div><p>Ask Doc</p><h2 id="ask-doc-heading">Answers from your world data</h2></div>
            <span>Updates instantly when inventory changes</span>
          </div>
          <div className={styles.questionGrid}>
            {[
              ['next', 'What should I do next?'],
              ['ready', 'What can I build now?'],
              ['blocked', 'What is blocking me?'],
              ['farm', 'What should I farm tonight?'],
              ['protect', 'What should I protect?'],
            ].map(([id, label]) => (
              <button className={openAnswer === id ? styles.questionActive : ''} type="button" onClick={() => setOpenAnswer(id)} key={id}>{label}</button>
            ))}
          </div>
          <div className={styles.docAnswer}><span aria-hidden="true">D</span><p>{quickAnswers[openAnswer]}</p></div>
        </section>

        <section className={styles.buildSection} aria-labelledby="build-plan-heading">
          <div className={styles.sectionHeading}>
            <div><p>Decision support</p><h2 id="build-plan-heading">Build plan</h2></div>
            <button className={styles.secondaryButton} type="button" onClick={() => setInventoryOpen((current) => !current)}>{inventoryOpen ? 'Close inventory' : 'Update inventory'}</button>
          </div>

          {inventoryOpen && (
            <div className={styles.inventoryPanel}>
              <div className={styles.inventoryIntro}><div><strong>Current inventory</strong><span>Saved on this device</span></div><button type="button" onClick={() => setInventory(photographedInventory)}>Restore screenshot values</button></div>
              <div className={styles.inventoryGrid}>
                {Object.keys(photographedInventory).map((id) => (
                  <label key={id}><span>{materialNames[id]}</span><input inputMode="numeric" value={inventory[id]} onChange={(event) => updateInventory(id, event.target.value)} /></label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.projectTabs}>
            {projects.map((project) => (
              <button className={selectedProject.id === project.id ? styles.projectTabActive : ''} type="button" onClick={() => setSelectedProjectId(project.id)} key={project.id}>
                <span>{project.built ? 'Built' : project.protected ? 'Protected' : project.isReady ? 'Ready' : `${project.readiness}%`}</span>
                <strong>{project.name}</strong>
              </button>
            ))}
          </div>

          <div className={styles.projectDetail}>
            <div className={styles.projectDetailTop}>
              <div><p>Priority {selectedProject.priority}</p><h3>{selectedProject.name}</h3><span>{selectedProject.purpose}</span></div>
              <button type="button" onClick={() => setBuilt((current) => ({ ...current, [selectedProject.id]: !current[selectedProject.id] }))}>{selectedProject.built ? 'Mark not built' : 'Mark as built'}</button>
            </div>
            {selectedProject.protected && <div className={styles.protectionWarning}><strong>Doc warning</strong><span>This build uses protected Ancient Cores. Keep it on hold until the two priority production builds and combat reserve are secure.</span></div>}
            <div className={styles.requirementGrid}>
              {selectedProject.requirements.map((item) => (
                <article className={item.missing === 0 ? styles.requirementMet : ''} key={item.id}>
                  <span>{item.missing === 0 ? <>&#10003;</> : '!'}</span>
                  <div><strong>{item.name}</strong><small>{item.have} have / {item.need} need</small></div>
                  <b>{item.missing === 0 ? 'Ready' : `${item.missing} missing`}</b>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.board} aria-labelledby="milestone-board-heading">
          <div className={styles.sectionHeading}><div><p>Supporting world data</p><h2 id="milestone-board-heading">Milestone Board</h2></div><span>{completedCount} of {midgameMilestones.length} complete</span></div>
          {CATEGORY_ORDER.map((category) => {
            const categoryMilestones = midgameMilestones.filter((milestone) => milestone.category === category);
            return (
              <section className={styles.category} key={category}>
                <div className={styles.categoryHeading}><h3>{category}</h3><span>{categoryMilestones.filter((milestone) => completed[milestone.id]).length} / {categoryMilestones.length}</span></div>
                <div className={styles.milestoneGrid}>
                  {categoryMilestones.map((milestone) => {
                    const isComplete = completed[milestone.id];
                    return <button className={`${styles.milestoneCard} ${isComplete ? styles.milestoneComplete : ''}`} type="button" aria-pressed={isComplete} onClick={() => setCompleted((current) => ({ ...current, [milestone.id]: !current[milestone.id] }))} key={milestone.id}><span className={styles.check} aria-hidden="true">{isComplete ? <>&#10003;</> : null}</span><span className={styles.milestoneCopy}><small>{isComplete ? 'Complete' : 'Not complete'}</small><strong>{milestone.label}</strong></span></button>;
                  })}
                </div>
              </section>
            );
          })}
        </section>

        <footer className={styles.footer}><span>MajedGames Companion</span><span>Helper pre-alpha &middot; World: TAG World</span></footer>
      </div>
    </main>
  );
}
