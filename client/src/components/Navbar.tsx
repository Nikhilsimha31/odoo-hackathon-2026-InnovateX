import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

interface Activity {
  id: string;
  action: string;
  details: string;
  entityId: string;
  createdAt: string;
}

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function actionColor(action: string) {
  if (action === 'REGISTERED') return 'var(--color-available)';
  if (action === 'STATUS_CHANGED') return 'var(--color-allocated)';
  return 'var(--color-muted)';
}

export default function Navbar({ isDark, onToggleTheme }: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenTime, setLastSeenTime] = useState(() => {
    return localStorage.getItem('af_last_seen') || new Date(0).toISOString();
  });

  const fetchActivities = () => {
    fetch('http://localhost:3000/api/activities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data);
          const unseen = data.filter(a => new Date(a.createdAt) > new Date(lastSeenTime)).length;
          setUnreadCount(unseen);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    const now = new Date().toISOString();
    setLastSeenTime(now);
    localStorage.setItem('af_last_seen', now);
    setUnreadCount(0);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>AF</div>
          <span className={styles.brandName}>AssetFlow</span>
        </div>

        <div className={styles.navRight}>
          {/* Theme Toggle */}
          <span className={styles.themeLabel}>{isDark ? '🌙' : '☀️'}</span>
          <button
            className={`${styles.themeToggle} ${isDark ? styles.dark : ''}`}
            onClick={onToggleTheme}
            title="Toggle dark mode"
          >
            <div className={styles.themeToggleKnob} />
          </button>

          {/* Notification Bell */}
          <button className={styles.notifBtn} onClick={openDrawer} title="Notifications">
            🔔
            {unreadCount > 0 && (
              <span className={styles.notifBadge} key={unreadCount}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Notifications Drawer */}
      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>Recent Activity</h3>
              <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>&times;</button>
            </div>
            <div className={styles.drawerBody}>
              {activities.length === 0 ? (
                <div className={styles.emptyState}>
                  <span style={{ fontSize: 32 }}>🔔</span>
                  <span>No activity yet</span>
                </div>
              ) : (
                activities.map(act => (
                  <div key={act.id} className={styles.activityItem}>
                    <div className={styles.activityDot} style={{ backgroundColor: actionColor(act.action) }} />
                    <div>
                      <div className={styles.activityText}>{act.details}</div>
                      <div className={styles.activityTime}>{timeAgo(act.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
