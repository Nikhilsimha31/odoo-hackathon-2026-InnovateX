import React from 'react';
import styles from './StampBadge.module.css';

export type StampState = 'available' | 'allocated' | 'reserved' | 'pending' | 'rejected' | 'retired';

interface StampBadgeProps {
  state: StampState;
  label: string;
  className?: string;
}

export default function StampBadge({ state, label, className = '' }: StampBadgeProps) {
  const stateClass = styles[state] || styles.available;
  
  return (
    <div className={`${styles.stampBadge} ${stateClass} ${className}`}>
      {label}
    </div>
  );
}
