import Link from 'next/link';
import AncientSphereCalculator from './AncientSphereCalculator';
import styles from './page.module.css';

export const metadata = {
  title: 'MajedGames Companion',
  description: 'Choose what to accomplish next in your game.',
};

const decisions = [
  {
    title: 'Build Base',
    description: 'Plan the next upgrade and strengthen your home base.',
    icon: 'base',
    accent: 'blue',
    number: '01',
  },
  {
    title: 'Prepare Combat',
    description: 'Tune your loadout, supplies, and combat strategy.',
    icon: 'combat',
    accent: 'purple',
    number: '02',
  },
  {
    title: 'Improve Workforce',
    description: 'Assign the right people and improve productivity.',
    icon: 'workforce',
    accent: 'cyan',
    number: '03',
  },
  {
    title: 'Continue Adventure',
    description: 'Return to your journey and pick up the main objective.',
    icon: 'adventure',
    accent: 'indigo',
    number: '04',
  },
  {
    title: 'Free Play',
    description: 'Explore freely, experiment, and follow your curiosity.',
    icon: 'freeplay',
    accent: 'violet',
    number: '05',
  },
];

const recentProgress = [
  {
    title: 'Ancient Furnace',
    status: 'Completed',
    detail: 'Base upgrade',
    progress: 100,
    tone: 'complete',
  },
  {
    title: 'Sky Base',
    status: 'In Progress',
    detail: 'Construction project',
    progress: 68,
    tone: 'active',
  },
  {
    title: 'Ancient Generator',
    status: 'Next Objective',
    detail: 'Power network',
    progress: 18,
    tone: 'next',
  },
];

const combatObjectives = [
  'Legendary Sphere',
  'Ultimate Sphere',
  'Ancient Sphere',
  'Rocket Ammo',
  'Missile Ammo',
  'Armor Upgrade',
  'Shield Upgrade',
];

export default async function CompanionPage({ searchParams }) {
  const params = await searchParams;
  const view = params?.view;

  return (
    <main className={styles.shell}>
      <div className={styles.ambientTop} aria-hidden="true" />
      <div className={styles.ambientBottom} aria-hidden="true" />

      <div className={styles.page}>
        <header className={styles.header}>
          <a className={styles.brand} href="/companion" aria-label="MajedGames Companion home">
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 44 44" role="img">
                <path d="M9 30V14l8.7 10.4L22 18l4.3 6.4L35 14v16" />
                <path d="M9 35h26" />
              </svg>
            </span>
            <span className={styles.brandText}>
              <strong>MajedGames</strong>
              <span>Companion</span>
            </span>
          </a>

          <div className={styles.headerMeta}>
            <span className={styles.phase}>Phase 01</span>
            <span className={styles.profile} aria-label="Majed profile">M</span>
          </div>
        </header>

        {view === 'prepare-combat' ? (
          <PrepareCombatView />
        ) : view === 'ancient-sphere' ? (
          <AncientSphereView />
        ) : (
          <>
        <section className={styles.hero} aria-labelledby="companion-heading">
          <div>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" /> Your next move starts here
            </p>
            <h1 id="companion-heading">Welcome back, Majed.</h1>
            <p className={styles.subtitle}>What would you like to accomplish today?</p>
          </div>

          <div className={styles.session}>
            <span className={styles.sessionPulse} aria-hidden="true" />
            <span>
              <small>Session ready</small>
              Companion online
            </span>
          </div>
        </section>

        <section className={styles.decisionSection} aria-labelledby="choose-path-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Choose your focus</p>
              <h2 id="choose-path-heading">Make this session count.</h2>
            </div>
            <span className={styles.cardCount}>5 paths available</span>
          </div>

          <div className={styles.decisionGrid}>
            {decisions.map((decision) => (
              <DecisionCard decision={decision} key={decision.title} />
            ))}
          </div>
        </section>

        <section className={styles.progressSection} aria-labelledby="recent-progress-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Momentum</p>
              <h2 id="recent-progress-heading">Recent Progress</h2>
            </div>
            <span className={styles.updated}>Updated this session</span>
          </div>

          <div className={styles.progressGrid}>
            {recentProgress.map((item) => (
              <article className={styles.progressCard} key={item.title}>
                <div className={styles.progressTopline}>
                  <span className={`${styles.statusIcon} ${styles[item.tone]}`} aria-hidden="true">
                    {item.tone === 'complete' ? (
                      <svg viewBox="0 0 20 20"><path d="m5 10 3 3 7-7" /></svg>
                    ) : (
                      <span />
                    )}
                  </span>
                  <span className={`${styles.status} ${styles[item.tone]}`}>{item.status}</span>
                </div>
                <p className={styles.progressDetail}>{item.detail}</p>
                <h3>{item.title}</h3>
                <div className={styles.progressFooter}>
                  <div className={styles.progressTrack} aria-label={`${item.progress}% progress`}>
                    <span style={{ width: `${item.progress}%` }} />
                  </div>
                  <strong>{item.progress}%</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
          </>
        )}

        <footer className={styles.footer}>
          <span>MajedGames Companion</span>
          <span>Play with purpose.</span>
        </footer>
      </div>
    </main>
  );
}

function DecisionCard({ decision }) {
  const cardContent = (
    <>
      <span className={styles.cardGlow} aria-hidden="true" />
      <span className={styles.cardTopline}>
        <span className={styles.iconWrap}>
          <DecisionIcon name={decision.icon} />
        </span>
        <span className={styles.cardNumber}>{decision.number}</span>
      </span>
      <span className={styles.cardCopy}>
        <strong>{decision.title}</strong>
        <span>{decision.description}</span>
      </span>
      <span className={styles.cardAction}>
        Choose path
        <ArrowIcon />
      </span>
    </>
  );

  if (decision.title === 'Prepare Combat') {
    return (
      <Link
        className={`${styles.decisionCard} ${styles[decision.accent]}`}
        href="/companion?view=prepare-combat"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <button className={`${styles.decisionCard} ${styles[decision.accent]}`} type="button">
      {cardContent}
    </button>
  );
}

function PrepareCombatView() {
  return (
    <section className={styles.flowView} aria-labelledby="prepare-combat-heading">
      <FlowNavigation current="Prepare Combat" />

      <div className={styles.flowHero}>
        <div>
          <p className={styles.eyebrow}><span aria-hidden="true" /> Combat planning</p>
          <h1 id="prepare-combat-heading">Prepare Combat</h1>
          <p>Choose an objective and see what you need before the next encounter.</p>
        </div>
        <span className={styles.prototypeBadge}>Local prototype</span>
      </div>

      <div className={styles.objectiveGrid}>
        {combatObjectives.map((objective, index) => {
          const isAvailable = objective === 'Ancient Sphere';
          const cardContent = (
            <>
              <span className={styles.objectiveNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.objectiveIcon} aria-hidden="true">
                <SphereIcon active={isAvailable} />
              </span>
              <span className={styles.objectiveCopy}>
                <strong>{objective}</strong>
                <span className={isAvailable ? styles.available : styles.comingNext}>
                  {isAvailable ? 'Open calculator' : 'Coming next'}
                </span>
              </span>
              {isAvailable && <ArrowIcon />}
            </>
          );

          return isAvailable ? (
            <Link className={`${styles.objectiveCard} ${styles.objectiveActive}`} href="/companion?view=ancient-sphere" key={objective}>
              {cardContent}
            </Link>
          ) : (
            <div className={styles.objectiveCard} key={objective} aria-disabled="true">
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AncientSphereView() {
  return (
    <section className={styles.flowView} aria-labelledby="ancient-sphere-heading">
      <FlowNavigation current="Ancient Sphere" showCombatBack />

      <div className={`${styles.flowHero} ${styles.calculatorHero}`}>
        <div>
          <p className={styles.eyebrow}><span aria-hidden="true" /> Combat objective</p>
          <h1 id="ancient-sphere-heading">Ancient Sphere</h1>
          <p>Compare what you have against the prototype sample requirements.</p>
        </div>
        <span className={styles.sphereEmblem} aria-hidden="true"><SphereIcon active /></span>
      </div>

      <div className={styles.prototypeNotice} role="note">
        <strong>Prototype sample data</strong>
        <span>For interface testing only. These values are not presented as a verified Palworld recipe.</span>
      </div>

      <AncientSphereCalculator />
    </section>
  );
}

function FlowNavigation({ current, showCombatBack = false }) {
  return (
    <nav className={styles.flowNavigation} aria-label="Companion navigation">
      <div className={styles.breadcrumbs}>
        <Link href="/companion">Home</Link>
        <span aria-hidden="true">/</span>
        {showCombatBack ? (
          <>
            <Link href="/companion?view=prepare-combat">Prepare Combat</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <strong aria-current="page">{current}</strong>
      </div>
      <div className={styles.navigationActions}>
        {showCombatBack && (
          <Link href="/companion?view=prepare-combat"><BackIcon /> Back to Prepare Combat</Link>
        )}
        <Link href="/companion">Return to Companion Home</Link>
      </div>
    </nav>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16 10H5M9 6l-4 4 4 4" />
    </svg>
  );
}

function SphereIcon({ active = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-active={active || undefined}>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.3 9h11.4M6.3 15h11.4M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8Z" />
    </svg>
  );
}

function DecisionIcon({ name }) {
  const paths = {
    base: (
      <>
        <path d="M5 20V10l7-5 7 5v10" />
        <path d="M9 20v-6h6v6M3 20h18" />
      </>
    ),
    combat: (
      <>
        <path d="m6 18 12-12M14 5l5-1-1 5M4 20l4-4" />
        <path d="m18 18-5-5M10 10 6 6M5 5 4 4M20 20l-2-2" />
      </>
    ),
    workforce: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M16 6a3 3 0 0 1 0 6M17 14c2.5.5 4 2.5 4 5" />
      </>
    ),
    adventure: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m15 9-2 5-5 2 2-5 5-2Z" />
      </>
    ),
    freeplay: (
      <>
        <path d="M8 10 6 8M6 12H3M8 14l-2 2M16 9v.01M19 12v.01" />
        <path d="M7 5h10c3 0 5 8 4 12-.5 2-2 2-3 1l-3-3H9l-3 3c-1 1-2.5 1-3-1C2 13 4 5 7 5Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
