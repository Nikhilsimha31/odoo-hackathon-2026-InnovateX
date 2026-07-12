import { useEffect, useState } from 'react';
import TagCard from './TagCard';
import StampBadge, { type StampState } from './StampBadge';
import Modal from './Modal';
import RegisterAssetForm from './RegisterAssetForm';
import AssetActionForm from './AssetActionForm';
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

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchAssets = () => {
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
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
    fetchAssets();
  };

  const handleActionSuccess = () => {
    setSelectedAsset(null);
    fetchAssets();
  };

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
          <button className={styles.actionBtn} onClick={() => setIsRegisterOpen(true)}>
            Register Asset
          </button>
        </div>
      </div>

      <h2>Overview</h2>
      <div className={styles.kpiRow}>
        {kpis.map(kpi => (
          <TagCard key={kpi.label} className={styles.kpiCard}>
            <StampBadge state={kpi.state} label={kpi.label} keyStr={`${kpi.label}-${kpi.count}`} />
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
            <TagCard key={asset.id} onClick={() => setSelectedAsset(asset)}>
              <div className={styles.assetTag}>
                <span>{asset.tag}</span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>Click to manage</span>
              </div>
              <div className={styles.assetName}>{asset.name}</div>
              <div className={styles.assetCategory}>{asset.category?.name || 'Uncategorized'}</div>
              
              <div style={{ flexGrow: 1 }} />
              
              <StampBadge 
                state={getStampState(asset.status)} 
                label={asset.status}
                keyStr={`${asset.id}-${asset.status}`} 
              />
            </TagCard>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        title="Register New Asset"
      >
        <RegisterAssetForm onSuccess={handleRegisterSuccess} />
      </Modal>

      <Modal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        title={`Manage ${selectedAsset?.name}`}
      >
        {selectedAsset && (
          <AssetActionForm 
            assetId={selectedAsset.id} 
            currentStatus={selectedAsset.status} 
            onSuccess={handleActionSuccess} 
          />
        )}
      </Modal>
    </div>
  );
}
