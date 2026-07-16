'use client';

import { useState } from 'react';
import styles from './page.module.css';

const sampleMaterials = [
  { id: 'hexolite', name: 'Hexolite', need: 100 },
  { id: 'pal-metal-ingot', name: 'Pal Metal Ingot', need: 50 },
  { id: 'ancient-civilization-part', name: 'Ancient Civilization Part', need: 10 },
];

const initialInventory = Object.fromEntries(sampleMaterials.map((material) => [material.id, 0]));

function sanitizeQuantity(value) {
  const digitsOnly = String(value).replace(/\D/g, '');

  if (!digitsOnly) return 0;

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isSafeInteger(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export default function AncientSphereCalculator() {
  const [inventory, setInventory] = useState(initialInventory);

  const materialStates = sampleMaterials.map((material) => {
    const have = inventory[material.id];
    return {
      ...material,
      have,
      missing: Math.max(material.need - have, 0),
    };
  });
  const readyCount = materialStates.filter((material) => material.missing === 0).length;
  const isReady = readyCount === sampleMaterials.length;

  function updateInventory(id, value) {
    setInventory((current) => ({
      ...current,
      [id]: sanitizeQuantity(value),
    }));
  }

  return (
    <div className={styles.calculator}>
      <div className={styles.readinessPanel} aria-live="polite">
        <div>
          <p>{readyCount} of {sampleMaterials.length} materials ready</p>
          <h2 className={isReady ? styles.ready : styles.notReady}>
            {isReady ? 'Ready to Craft' : 'Preparation Required'}
          </h2>
        </div>
        <span className={`${styles.readinessRing} ${isReady ? styles.ringReady : ''}`}>
          <strong>{readyCount}</strong>
          <small>/ 3</small>
        </span>
      </div>

      <div className={styles.materialList} aria-label="Ancient Sphere prototype materials">
        {materialStates.map((material) => (
          <article className={`${styles.materialCard} ${material.missing === 0 ? styles.materialReady : ''}`} key={material.id}>
            <div className={styles.materialIdentity}>
              <span className={styles.materialStatus} aria-hidden="true">
                {material.missing === 0 ? <>&#10003;</> : null}
              </span>
              <div>
                <p>Prototype material</p>
                <h3>{material.name}</h3>
              </div>
            </div>

            <dl className={styles.quantityGrid}>
              <div>
                <dt>Need</dt>
                <dd>{material.need}</dd>
              </div>
              <div className={styles.haveField}>
                <dt><label htmlFor={`have-${material.id}`}>Have</label></dt>
                <dd>
                  <input
                    id={`have-${material.id}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={material.have}
                    onChange={(event) => updateInventory(material.id, event.target.value)}
                    aria-describedby={`missing-${material.id}`}
                  />
                </dd>
              </div>
              <div className={styles.missingField} id={`missing-${material.id}`}>
                <dt>Missing</dt>
                <dd>{material.missing}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
