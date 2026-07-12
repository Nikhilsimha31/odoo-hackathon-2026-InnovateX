import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import TagCard from './TagCard';
import StampBadge, { type StampState } from './StampBadge';
import Modal from './Modal';
import RegisterAssetForm from './RegisterAssetForm';
import AssetActionForm from './AssetActionForm';
import StatusChart from './StatusChart';
import HealthBar from './HealthBar';
import styles from './Dashboard.module.css';
import xStyles from './DashboardExtras.module.css';
import kStyles from './KanbanExtras.module.css';

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
  createdAt: string;
}

const STATUS_FILTERS = ['All', 'Available', 'Allocated', 'Under Maintenance', 'Reserved', 'Retired'];
const KANBAN_COLS = ['Available', 'Allocated', 'Under Maintenance', 'Reserved', 'Retired'];
const KANBAN_COLORS: Record<string, string> = {
  'Available': 'var(--color-available)',
  'Allocated': 'var(--color-allocated)',
  'Under Maintenance': 'var(--color-pending)',
  'Reserved': 'var(--color-reserved)',
  'Retired': 'var(--color-retired)',
};

// CSV Export helper
function exportToCSV(assets: Asset[]) {
  const headers = ['Tag', 'Name', 'Category', 'Status', 'Registered'];
  const rows = assets.map(a => [
    a.tag,
    `"${a.name}"`,
    `"${a.category?.name || 'Uncategorized'}"`,
    a.status,
    new Date(a.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assetflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [showShortcuts, setShowShortcuts] = useState(true);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(() => {
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

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'r' || e.key === 'R') {
        setIsRegisterOpen(true);
      } else if (e.key === 'k' || e.key === 'K') {
        setViewMode(v => v === 'grid' ? 'kanban' : 'grid');
      } else if (e.key === 'Escape') {
        searchRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    // Auto-hide shortcut hint after 8 seconds
    const t = setTimeout(() => setShowShortcuts(false), 8000);
    return () => { window.removeEventListener('keydown', handler); clearTimeout(t); };
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

  // KPI Cards
  const kpis = [
    { label: 'Total Assets', count: assets.length, state: 'available' as StampState },
    { label: 'Allocated', count: assets.filter(a => a.status === 'Allocated').length, state: 'allocated' as StampState },
    { label: 'Maintenance', count: assets.filter(a => a.status === 'Under Maintenance').length, state: 'pending' as StampState },
    { label: 'Available', count: assets.filter(a => a.status === 'Available').length, state: 'available' as StampState },
  ];

  // Overdue Alert: allocated assets older than 30 days
  const overdueAssets = useMemo(() =>
    assets.filter(a => {
      if (a.status !== 'Allocated') return false;
      const created = new Date(a.createdAt);
      const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 30;
    }), [assets]);

  // Filtered + Searched assets
  const filteredAssets = useMemo(() =>
    assets.filter(asset => {
      const matchesStatus = activeFilter === 'All' || asset.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        asset.name.toLowerCase().includes(q) ||
        asset.tag.toLowerCase().includes(q) ||
        asset.category?.name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    }), [assets, activeFilter, searchQuery]);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h2 style={{ fontSize: 26, marginBottom: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className={kStyles.exportBtn} onClick={() => exportToCSV(assets)} title="Export to CSV">
            📥 Export CSV
          </button>
          <button className={styles.actionBtn} onClick={() => setIsRegisterOpen(true)}>
            + Register Asset
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {overdueAssets.length > 0 && (
        <div className={xStyles.overdueAlert}>
          <span className={xStyles.overdueIcon}>⚠️</span>
          <div>
            <div className={xStyles.overdueTitle}>
              {overdueAssets.length} asset{overdueAssets.length > 1 ? 's are' : ' is'} overdue for return!
            </div>
            <ul className={xStyles.overdueList}>
              {overdueAssets.slice(0, 3).map(a => (
                <li key={a.id}>{a.tag} — {a.name}</li>
              ))}
              {overdueAssets.length > 3 && <li>...and {overdueAssets.length - 3} more</li>}
            </ul>
          </div>
        </div>
      )}

      {/* KPI Row */}
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

      {/* Analytics Row */}
      {!loading && assets.length > 0 && (
        <div className={xStyles.analyticsRow} style={{ marginBottom: '48px' }}>
          <StatusChart assets={assets} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={xStyles.statCard}>
              <div className={xStyles.statLabel}>Utilization Rate</div>
              <div className={xStyles.statValue} style={{ color: 'var(--color-allocated)' }}>
                {assets.length > 0
                  ? `${Math.round((assets.filter(a => a.status === 'Allocated').length / assets.length) * 100)}%`
                  : '0%'}
              </div>
            </div>
            <div className={xStyles.statCard}>
              <div className={xStyles.statLabel}>Assets in Maintenance</div>
              <div className={xStyles.statValue} style={{ color: 'var(--color-pending)' }}>
                {assets.filter(a => a.status === 'Under Maintenance').length}
              </div>
            </div>
            <div className={xStyles.statCard}>
              <div className={xStyles.statLabel}>Overdue Returns</div>
              <div className={xStyles.statValue} style={{ color: overdueAssets.length > 0 ? 'var(--color-rejected)' : 'var(--color-available)' }}>
                {overdueAssets.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Registry Header with View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Asset Registry <span style={{ fontSize: 14, opacity: 0.5, fontWeight: 400 }}>({filteredAssets.length})</span></h2>
        <div className={kStyles.viewToggle}>
          <button
            className={`${kStyles.viewBtn} ${viewMode === 'grid' ? kStyles.viewBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞ Grid
          </button>
          <button
            className={`${kStyles.viewBtn} ${viewMode === 'kanban' ? kStyles.viewBtnActive : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            ⊟ Board
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={xStyles.searchBar}>
        <input
          ref={searchRef}
          className={xStyles.searchInput}
          type="text"
          placeholder="Search by name, tag, or category... (press / to focus)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={`${xStyles.filterBtn} ${activeFilter === f ? xStyles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <p>Loading assets...</p>
          ) : filteredAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', opacity: 0.4 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p>No assets found matching your search.</p>
            </div>
          ) : (
            <div className={styles.assetGrid}>
              {filteredAssets.map(asset => (
                <TagCard key={asset.id} onClick={() => setSelectedAsset(asset)}>
                  <div className={styles.assetTag}>
                    <span>{asset.tag}</span>
                    <span style={{ fontSize: 12, opacity: 0.5 }}>Click to manage</span>
                  </div>
                  <div className={styles.assetName}>{asset.name}</div>
                  <div className={styles.assetCategory}>{asset.category?.name || 'Uncategorized'}</div>
                  <div style={{ flexGrow: 1, minHeight: 12 }} />
                  <HealthBar status={asset.status} createdAt={asset.createdAt} />
                  <div style={{ marginTop: 14 }}>
                    <StampBadge
                      state={getStampState(asset.status)}
                      label={asset.status}
                      keyStr={`${asset.id}-${asset.status}`}
                    />
                  </div>
                </TagCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className={kStyles.kanban}>
          {KANBAN_COLS.map(col => {
            const colAssets = filteredAssets.filter(a => a.status === col);
            return (
              <div key={col} className={kStyles.kanbanCol}>
                <div className={kStyles.kanbanColHeader}>
                  <span className={kStyles.kanbanColTitle} style={{ color: KANBAN_COLORS[col] }}>{col}</span>
                  <span className={kStyles.kanbanCount}>{colAssets.length}</span>
                </div>
                <div className={kStyles.kanbanCards}>
                  {colAssets.map(asset => (
                    <div key={asset.id} className={kStyles.kanbanCard} onClick={() => setSelectedAsset(asset)}>
                      <div className={kStyles.kanbanTag}>{asset.tag}</div>
                      <div className={kStyles.kanbanName}>{asset.name}</div>
                      <div className={kStyles.kanbanCat}>{asset.category?.name || 'Uncategorized'}</div>
                      <HealthBar status={asset.status} createdAt={asset.createdAt} />
                    </div>
                  ))}
                  {colAssets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.3, fontSize: 13 }}>
                      No assets
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {showShortcuts && (
        <div className={kStyles.shortcutHint}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-ink)' }}>⌨️ Shortcuts</div>
          <div className={kStyles.shortcutRow}><span>Focus search</span><kbd>/</kbd></div>
          <div className={kStyles.shortcutRow}><span>Register asset</span><kbd>R</kbd></div>
          <div className={kStyles.shortcutRow}><span>Toggle board</span><kbd>K</kbd></div>
          <div className={kStyles.shortcutRow}><span>Clear search</span><kbd>Esc</kbd></div>
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
            assetTag={selectedAsset.tag}
            currentStatus={selectedAsset.status}
            acquisitionCost={(selectedAsset as any).acquisitionCost}
            acquisitionDate={(selectedAsset as any).acquisitionDate}
            location={(selectedAsset as any).location}
            departmentName={(selectedAsset as any).allocatedToDept?.name}
            onSuccess={handleActionSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
