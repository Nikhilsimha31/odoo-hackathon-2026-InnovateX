import React from 'react';
import styles from './StampBadge.module.css';

export type StampState = 'available' | 'allocated' | 'reserved' | 'pending' | 'rejected' | 'retired';

interface StampBadgeProps {
  state: StampState;
  label: string;
  className?: string;
  keyStr?: string; // To force re-render/re-animation if status changes
}

export default function StampBadge({ state, label, className = '', keyStr }: StampBadgeProps) {
  const stateClass = styles[state] || styles.available;
  
  return (
    <div key={keyStr || state} className={`${styles.stampBadge} ${stateClass} ${className}`}>
      {label}
    </div>
  );
}
