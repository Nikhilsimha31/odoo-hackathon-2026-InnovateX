import React from 'react';
import styles from './ProgressRail.module.css';

interface ProgressRailProps {
  stages: string[];
  currentStageIndex: number;
}

export default function ProgressRail({ stages, currentStageIndex }: ProgressRailProps) {
  return (
    <div className={styles.progressRail}>
      {stages.map((stage, index) => {
        let stageClass = styles.stage;
        if (index < currentStageIndex) {
          stageClass = `${styles.stage} ${styles.stageReached}`;
        } else if (index === currentStageIndex) {
          stageClass = `${styles.stage} ${styles.stageCurrent}`;
        }

        return (
          <div key={stage} className={stageClass}>
            {stage}
          </div>
        );
      })}
    </div>
  );
}
