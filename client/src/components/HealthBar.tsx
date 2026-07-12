import styles from './HealthBar.module.css';

interface HealthBarProps {
  status: string;
  createdAt: string;
}

function computeHealth(status: string, createdAt: string): number {
  let score = 100;

  // Deduct for bad statuses
  if (status === 'Under Maintenance') score -= 35;
  if (status === 'Lost') score -= 80;
  if (status === 'Retired') score -= 60;
  if (status === 'Reserved') score -= 5;

  // Deduct slightly for age (older assets naturally degrade)
  const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  score -= Math.min(Math.floor(ageInDays / 30) * 3, 25); // max -25 from age

  return Math.max(score, 5); // never go below 5
}

function healthColor(score: number) {
  if (score >= 80) return 'var(--color-available)';
  if (score >= 50) return 'var(--color-pending)';
  return 'var(--color-rejected)';
}

function healthLabel(score: number) {
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export default function HealthBar({ status, createdAt }: HealthBarProps) {
  const score = computeHealth(status, createdAt);
  const color = healthColor(score);

  return (
    <div className={styles.healthBar}>
      <div className={styles.healthLabel}>
        <span>Health</span>
        <span className={styles.healthScore} style={{ color }}>
          {healthLabel(score)} ({score})
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
