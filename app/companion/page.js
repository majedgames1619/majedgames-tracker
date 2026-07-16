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

export default function CompanionPage() {
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
              <button
                className={`${styles.decisionCard} ${styles[decision.accent]}`}
                type="button"
                key={decision.title}
              >
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
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h11M11 6l4 4-4 4" />
                  </svg>
                </span>
              </button>
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

        <footer className={styles.footer}>
          <span>MajedGames Companion</span>
          <span>Play with purpose.</span>
        </footer>
      </div>
    </main>
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
