import React from 'react';
import styles from './TagCard.module.css';

interface TagCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TagCard({ children, className = '' }: TagCardProps) {
  return (
    <div className={`${styles.tagCard} ${className}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
