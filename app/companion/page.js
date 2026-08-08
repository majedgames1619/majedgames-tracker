import Link from 'next/link';
import { portalSections } from './portalSections.mjs';
import styles from './page.module.css';

export const metadata = {
  title: 'MajedGames Companion',
  description: 'Choose a companion tool for your next session.',
};

export default function CompanionPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logoSpace} aria-hidden="true" />
          <div>
            <p className={styles.eyebrow}>Your game, organized</p>
            <h1>MajedGames Companion</h1>
            <p className={styles.subtitle}>
              Practical tools to help you plan, prepare, and make every session count.
            </p>
          </div>
        </header>

        <section className={styles.sections} aria-labelledby="sections-heading">
          <div className={styles.sectionHeading}>
            <p>Explore the companion</p>
            <h2 id="sections-heading">Choose a section</h2>
          </div>

          <div className={styles.cardGrid}>
            {portalSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionCard({ section }) {
  const content = (
    <>
      <div className={styles.cardTopline}>
        <span className={`${styles.icon} ${styles[section.id]}`} aria-hidden="true">
          <SectionIcon name={section.id} />
        </span>
        <span className={`${styles.badge} ${section.ready ? styles.ready : styles.comingSoon}`}>
          {section.ready ? 'Ready' : 'Coming soon'}
        </span>
      </div>
      <div className={styles.cardCopy}>
        <h3>{section.title}</h3>
        <p>{section.description}</p>
      </div>
      <div className={styles.cardFooter} aria-hidden="true">
        <span>{section.ready ? 'Open planner' : 'In development'}</span>
        {section.ready ? <ArrowIcon /> : null}
      </div>
    </>
  );

  if (section.ready) {
    return (
      <Link
        className={`${styles.card} ${styles.activeCard}`}
        href={section.href}
        aria-label={`Open ${section.title}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={`${styles.card} ${styles.disabledCard}`} aria-disabled="true">
      {content}
    </article>
  );
}

function SectionIcon({ name }) {
  if (name === 'crafting') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 19.5 14.4 9.1M13 6.2l1.6-1.6 4.8 4.8-1.6 1.6M7 17l-2.5-2.5M15.5 18.5h5M18 16v5" />
      </svg>
    );
  }

  if (name === 'breeding') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 20c4.4 0 8-3.1 8-7 0-5-4.2-9-8-9s-8 4-8 9c0 3.9 3.6 7 8 7Z" />
        <path d="M8.5 11.5h.01M15.5 11.5h.01M9.5 15c1.4 1 3.6 1 5 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="m14 5 5-1-1 5L8 19l-3 1 1-3L16 7M5 5l14 14M15.5 15.5 19 19" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}
