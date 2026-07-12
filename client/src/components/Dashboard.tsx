import { useEffect, useState } from 'react';
import TagCard from './TagCard';
import StampBadge, { type StampState } from './StampBadge';
import styles from './Dashboard.module.css';

interface Category {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  tag: string;
  name: string;
  status: string;
  category: Category;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch assets", err);
        setLoading(false);
      });
  }, []);

  const getStampState = (status: string): StampState => {
    const map: Record<string, StampState> = {
      'Available': 'available',
      'Allocated': 'allocated',
      'Reserved': 'reserved',
      'Under Maintenance': 'pending',
      'Lost': 'rejected',
      'Retired': 'retired'
    };
    return map[status] || 'available';
  };

  const kpis = [
    { label: 'Total Assets', count: assets.length, state: 'available' as StampState },
    { label: 'Allocated', count: assets.filter(a => a.status === 'Allocated').length, state: 'allocated' as StampState },
    { label: 'Maintenance', count: assets.filter(a => a.status === 'Under Maintenance').length, state: 'pending' as StampState },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>AssetFlow</h1>
        <div className={styles.actionsRow} style={{ marginBottom: 0 }}>
          <button className={styles.actionBtn}>Register Asset</button>
        </div>
      </div>

      <h2>Overview</h2>
      <div className={styles.kpiRow}>
        {kpis.map(kpi => (
          <TagCard key={kpi.label} className={styles.kpiCard}>
            <StampBadge state={kpi.state} label={kpi.label} />
            <div className={styles.kpiNumber}>
              {loading ? '-' : kpi.count}
            </div>
          </TagCard>
        ))}
      </div>

      <h2>Asset Registry</h2>
      {loading ? (
        <p>Loading assets...</p>
      ) : (
        <div className={styles.assetGrid}>
          {assets.map(asset => (
            <TagCard key={asset.id}>
              <div className={styles.assetTag}>
                <span>{asset.tag}</span>
              </div>
              <div className={styles.assetName}>{asset.name}</div>
              <div className={styles.assetCategory}>{asset.category?.name || 'Uncategorized'}</div>
              
              <div style={{ flexGrow: 1 }} />
              
              <StampBadge 
                state={getStampState(asset.status)} 
                label={asset.status} 
              />
            </TagCard>
          ))}
        </div>
      )}
    </div>
  );
}
