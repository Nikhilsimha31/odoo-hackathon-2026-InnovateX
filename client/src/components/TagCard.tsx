
import styles from './TagCard.module.css';

interface TagCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function TagCard({ children, className = '', onClick }: TagCardProps) {
  return (
    <div 
      className={`${styles.tagCard} ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
