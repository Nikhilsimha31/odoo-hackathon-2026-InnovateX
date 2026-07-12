import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Forms.module.css';
import badgeStyles from './StampBadge.module.css';

interface Activity {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

interface AssetActionFormProps {
  assetId: string;
  assetTag: string;
  currentStatus: string;
  acquisitionCost?: number | null;
  acquisitionDate?: string | null;
  location?: string | null;
  departmentName?: string | null;
  onSuccess: () => void;
}

// Straight-line depreciation
function calcDepreciation(cost: number, dateStr: string, location: string | null) {
  const lifeMatch = location?.match(/life:(\d+)/);
  const usefulYears = lifeMatch ? parseInt(lifeMatch[1]) : 5;
  const ageYears = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365);
  const annualDep = cost / usefulYears;
  const totalDep = Math.min(annualDep * ageYears, cost * 0.95);
  const currentValue = Math.max(cost - totalDep, cost * 0.05);
  const percent = Math.round((currentValue / cost) * 100);
  return { currentValue: Math.round(currentValue), percent, usefulYears };
}

export default function AssetActionForm({
  assetId, assetTag, currentStatus, acquisitionCost, acquisitionDate, location, departmentName, onSuccess
}: AssetActionFormProps) {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState<'actions' | 'timeline'>('actions');

  // Maintenance form
  const [maintDesc, setMaintDesc] = useState('');
  const [maintPriority, setMaintPriority] = useState('Low');
  const [showMaintForm, setShowMaintForm] = useState(false);

  // Transfer
  const [transferDeptId, setTransferDeptId] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);

  const fetchActivities = () => {
    fetch(`http://localhost:3000/api/assets/${assetId}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Failed to load activities", err));
  };

  useEffect(() => {
    fetchActivities();
    fetch('http://localhost:3000/api/departments')
      .then(res => res.json())
      .then(setDepartments)
      .catch(() => {});
  }, [assetId]);

  const handleAction = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) onSuccess();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${assetId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: maintDesc, priority: maintPriority })
      });
      if (response.ok) onSuccess();
    } catch (error) {
      console.error("Failed to submit maintenance", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferDeptId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${assetId}/transfer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: transferDeptId })
      });
      if (response.ok) onSuccess();
    } catch (error) {
      console.error("Failed to transfer", error);
    } finally {
      setLoading(false);
    }
  };

  const dep = acquisitionCost && acquisitionDate
    ? calcDepreciation(acquisitionCost, acquisitionDate, location || null)
    : null;

  const tabStyle = (tab: string) => ({
    padding: '8px 16px',
    borderBottom: activeTab === tab ? '2px solid var(--color-ink)' : '2px solid transparent',
    fontWeight: activeTab === tab ? 700 : 400 as number,
    opacity: activeTab === tab ? 1 : 0.5,
    cursor: 'pointer' as const,
    background: 'none',
    border: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid' as const,
    borderBottomColor: activeTab === tab ? 'var(--color-ink)' : 'transparent',
    fontSize: '14px',
  });

  return (
    <div>
      {/* Top: QR Code + Info */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'var(--color-card)' }}>
          <QRCodeSVG value={assetTag} size={100} />
          <p style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>{assetTag}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }}>Status: <strong>{currentStatus}</strong></p>
          {departmentName && <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }}>Department: <strong>{departmentName}</strong></p>}
          {dep && (
            <div style={{ marginTop: 8, padding: '12px', background: 'var(--color-paper)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: 6 }}>Depreciation</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span>Purchase: ₹{acquisitionCost?.toLocaleString()}</span>
                <span style={{ fontWeight: 700, color: dep.percent > 60 ? 'var(--color-available)' : dep.percent > 30 ? 'var(--color-pending)' : 'var(--color-rejected)' }}>
                  Current: ₹{dep.currentValue.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${dep.percent}%`,
                  backgroundColor: dep.percent > 60 ? 'var(--color-available)' : dep.percent > 30 ? 'var(--color-pending)' : 'var(--color-rejected)',
                  borderRadius: 2,
                  transition: 'width 0.8s ease'
                }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4 }}>Straight-line over {dep.usefulYears} years</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
        <button style={tabStyle('actions')} onClick={() => setActiveTab('actions')}>Actions</button>
        <button style={tabStyle('timeline')} onClick={() => setActiveTab('timeline')}>Timeline ({activities.length})</button>
      </div>

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentStatus === 'Available' && (
            <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-allocated)', margin: 0 }} onClick={() => handleAction('Allocated')} disabled={loading}>
              Allocate to Employee
            </button>
          )}
          {currentStatus === 'Allocated' && (
            <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-available)', margin: 0 }} onClick={() => handleAction('Available')} disabled={loading}>
              Return Asset
            </button>
          )}
          {currentStatus === 'Under Maintenance' && (
            <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-available)', margin: 0 }} onClick={() => handleAction('Available')} disabled={loading}>
              Resolve Maintenance
            </button>
          )}

          {/* Maintenance Request */}
          {currentStatus !== 'Under Maintenance' && (
            <>
              {!showMaintForm ? (
                <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-pending)', margin: 0 }} onClick={() => setShowMaintForm(true)} disabled={loading}>
                  🔧 Raise Maintenance Request
                </button>
              ) : (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Maintenance Request</div>
                  <textarea
                    className={styles.input}
                    placeholder="Describe the issue..."
                    value={maintDesc}
                    onChange={e => setMaintDesc(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {['Low', 'Medium', 'High'].map(p => (
                      <button key={p} onClick={() => setMaintPriority(p)} style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: maintPriority === p ? '2px solid var(--color-ink)' : '2px solid var(--color-border)',
                        backgroundColor: maintPriority === p ? 'var(--color-ink)' : 'transparent',
                        color: maintPriority === p ? 'var(--color-paper)' : 'var(--color-ink)',
                      }}>{p}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-pending)', margin: 0, flex: 1 }} onClick={handleMaintenance} disabled={loading}>
                      Submit Request
                    </button>
                    <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-muted)', margin: 0 }} onClick={() => setShowMaintForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Department Transfer */}
          {!showTransferForm ? (
            <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-reserved)', margin: 0 }} onClick={() => setShowTransferForm(true)} disabled={loading}>
              🏢 Transfer Department
            </button>
          ) : (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Transfer to Department</div>
              <select className={styles.select} value={transferDeptId} onChange={e => setTransferDeptId(e.target.value)} style={{ marginBottom: 12 }}>
                <option value="">Select department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-reserved)', margin: 0, flex: 1 }} onClick={handleTransfer} disabled={loading || !transferDeptId}>
                  Confirm Transfer
                </button>
                <button className={styles.submitBtn} style={{ backgroundColor: 'var(--color-muted)', margin: 0 }} onClick={() => setShowTransferForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {activities.length === 0 ? (
            <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', padding: 24 }}>No activity recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map((act, index) => (
                <div key={act.id} style={{ position: 'relative', paddingLeft: '20px' }}>
                  {index !== activities.length - 1 && (
                    <div style={{ position: 'absolute', left: '4px', top: '16px', bottom: '-24px', width: '2px', backgroundColor: 'var(--color-border)' }} />
                  )}
                  <div style={{ position: 'absolute', left: 0, top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-ink)' }} />
                  <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '2px' }}>
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
                    <span className={badgeStyles.stampBadge} style={{ fontSize: '9px', padding: '1px 5px', animationDuration: '0.15s' }}>
                      {act.action === 'REGISTERED' ? 'Registered' : act.action === 'MAINTENANCE' ? 'Maintenance' : act.action === 'TRANSFERRED' ? 'Transfer' : 'Update'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.7 }}>{act.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
