import { useState } from 'react';
import styles from './Forms.module.css';

interface AssetActionFormProps {
  assetId: string;
  currentStatus: string;
  onSuccess: () => void;
}

export default function AssetActionForm({ assetId, currentStatus, onSuccess }: AssetActionFormProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ opacity: 0.7, marginBottom: '16px' }}>Current Status: <strong>{currentStatus}</strong></p>
      
      {currentStatus === 'Available' && (
        <button 
          className={styles.submitBtn} 
          style={{ backgroundColor: 'var(--color-allocated)', margin: 0 }}
          onClick={() => handleAction('Allocated')}
          disabled={loading}
        >
          Allocate to Employee
        </button>
      )}

      {currentStatus === 'Allocated' && (
        <button 
          className={styles.submitBtn} 
          style={{ backgroundColor: 'var(--color-available)', margin: 0 }}
          onClick={() => handleAction('Available')}
          disabled={loading}
        >
          Return Asset
        </button>
      )}

      {currentStatus !== 'Under Maintenance' && (
        <button 
          className={styles.submitBtn} 
          style={{ backgroundColor: 'var(--color-pending)', margin: 0 }}
          onClick={() => handleAction('Under Maintenance')}
          disabled={loading}
        >
          Raise Maintenance Request
        </button>
      )}

      {currentStatus === 'Under Maintenance' && (
        <button 
          className={styles.submitBtn} 
          style={{ backgroundColor: 'var(--color-available)', margin: 0 }}
          onClick={() => handleAction('Available')}
          disabled={loading}
        >
          Resolve Maintenance
        </button>
      )}
    </div>
  );
}
