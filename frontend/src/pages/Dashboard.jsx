import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReplyModal from '../components/ReplyModal';
import ApplicationDetail from '../components/ApplicationDetail';
import './Dashboard.css';

const API = 'http://localhost:5000/api';

const STATUS_COLORS = {
  'Pending': '#ea580c',
  'Contacted': '#2563eb',
  'Negotiating': '#7c3aed',
  'Enrolled': '#16a34a',
  'Not Interested': '#6b7280',
  'Follow-up Needed': '#dc2626',
};

const STATUSES = ['Pending','Contacted','Negotiating','Enrolled','Not Interested','Follow-up Needed'];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('families');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [replyApp, setReplyApp] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [appRes, notifRes] = await Promise.all([
        axios.get(`${API}/application`, { headers }),
        axios.get(`${API}/notifications`, { headers }),
      ]);
      setApplications(appRes.data.applications);
      setStats(appRes.data.stats);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(notifRes.data.unreadCount);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll for new notifications every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/notifications`, { headers });
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const markAllRead = async () => {
    await axios.patch(`${API}/notifications/read-all`, {}, { headers });
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const updateStatus = async (id, status) => {
    setStatusUpdating(id);
    try {
      await axios.patch(`${API}/application/${id}/status`, { status }, { headers });
      setApplications(apps => apps.map(a => a._id === id ? { ...a, status } : a));
      if (selectedApp?._id === id) setSelectedApp(a => ({ ...a, status }));
      // refresh notifications
      const { data } = await axios.get(`${API}/notifications`, { headers });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
    setStatusUpdating(null);
  };

  const filtered = applications.filter(a => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || a.parentName.toLowerCase().includes(q) ||
      a.studentName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>
          <div>
            <div className="sidebar-title">Mr. Solomon</div>
            <div className="sidebar-sub">Private Dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`sidebar-item ${activeTab==='families'?'active':''}`} onClick={() => setActiveTab('families')}>
            <span>👨‍👩‍👧</span> Families
            <span className="sidebar-count">{applications.length}</span>
          </button>
          <button className={`sidebar-item ${activeTab==='notifications'?'active':''}`} onClick={() => { setActiveTab('notifications'); if(unreadCount>0) markAllRead(); }}>
            <span>🔔</span> Notifications
            {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
          </button>
          <button className={`sidebar-item ${activeTab==='stats'?'active':''}`} onClick={() => setActiveTab('stats')}>
            <span>📊</span> Overview
          </button>
        </nav>

        <button className="sidebar-logout" onClick={() => { logout(); navigate('/'); }}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="dash-main">

        {/* FAMILIES TAB */}
        {activeTab === 'families' && (
          <div className="dash-panel">
            <div className="panel-header">
              <h2>Families</h2>
              <div className="panel-controls">
                <input
                  className="search-input"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="families-count">{filtered.length} of {applications.length} families</div>

            <div className="families-list">
              {filtered.length === 0 && (
                <div className="empty-state">No families found. {search || filterStatus ? 'Try clearing filters.' : 'Applications will appear here.'}</div>
              )}
              {filtered.map(app => (
                <div key={app._id} className="family-card" onClick={() => setSelectedApp(app)}>
                  <div className="family-avatar">{app.parentName.charAt(0).toUpperCase()}</div>
                  <div className="family-info">
                    <div className="family-name">{app.parentName}</div>
                    <div className="family-meta">
                      <span>👦 {app.studentName}</span>
                      <span>📚 {app.studentGrade}</span>
                      <span>📅 {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="family-subjects">{app.subjects}</div>
                  </div>
                  <div className="family-right">
                    <span className="status-badge" style={{ background: STATUS_COLORS[app.status]+'22', color: STATUS_COLORS[app.status], border: `1px solid ${STATUS_COLORS[app.status]}44` }}>
                      {app.status}
                    </span>
                    <div className="family-budget">{app.budgetRange}</div>
                    <div className="family-actions" onClick={e => e.stopPropagation()}>
                      <select
                        className="status-select"
                        value={app.status}
                        disabled={statusUpdating === app._id}
                        onChange={e => updateStatus(app._id, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className="reply-btn" onClick={() => setReplyApp(app)}>✉️ Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="dash-panel">
            <div className="panel-header">
              <h2>Notifications</h2>
              {unreadCount > 0 && (
                <button className="mark-read-btn" onClick={markAllRead}>Mark all as read</button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 && <div className="empty-state">No notifications yet.</div>}
              {notifications.map(n => (
                <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                  <span className="notif-icon">
                    {n.type === 'new_application' ? '📋' : n.type === 'status_change' ? '🔄' : '✉️'}
                  </span>
                  <div className="notif-body">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && <span className="notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="dash-panel">
            <div className="panel-header"><h2>Overview</h2></div>
            <div className="stats-grid">
              <div className="stat-card total"><div className="stat-card-num">{stats.total || 0}</div><div className="stat-card-label">Total Applications</div></div>
              <div className="stat-card pending"><div className="stat-card-num">{stats.pending || 0}</div><div className="stat-card-label">Pending</div></div>
              <div className="stat-card contacted"><div className="stat-card-num">{stats.contacted || 0}</div><div className="stat-card-label">Contacted</div></div>
              <div className="stat-card enrolled"><div className="stat-card-num">{stats.enrolled || 0}</div><div className="stat-card-label">Enrolled</div></div>
            </div>
            <h3 className="stats-sub-title">Status Breakdown</h3>
            <div className="status-breakdown">
              {STATUSES.map(s => {
                const count = applications.filter(a => a.status === s).length;
                const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                return (
                  <div key={s} className="breakdown-row">
                    <span className="breakdown-label">{s}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${pct}%`, background: STATUS_COLORS[s] }} />
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                );
              })}
            </div>
            <h3 className="stats-sub-title">Budget Distribution</h3>
            <div className="budget-grid">
              {stats.budgetAnalysis && Object.entries({
                'Under 2K': stats.budgetAnalysis.under2000,
                '2K–3K': stats.budgetAnalysis.under3000,
                '3K–5K': stats.budgetAnalysis.under5000,
                '5K–7K': stats.budgetAnalysis.under7000,
                '7K–10K': stats.budgetAnalysis.under10000,
                'Above 10K': stats.budgetAnalysis.above10000,
                'Not Disclosed': stats.budgetAnalysis.preferNotSay,
              }).map(([label, count]) => (
                <div key={label} className="budget-card">
                  <div className="budget-num">{count}</div>
                  <div className="budget-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* APPLICATION DETAIL MODAL */}
      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onReply={() => { setReplyApp(selectedApp); setSelectedApp(null); }}
          onStatusChange={(id, status) => updateStatus(id, status)}
          statusUpdating={statusUpdating}
          statuses={STATUSES}
          statusColors={STATUS_COLORS}
        />
      )}

      {/* REPLY MODAL */}
      {replyApp && (
        <ReplyModal
          app={replyApp}
          token={token}
          onClose={() => setReplyApp(null)}
          onSent={() => { setReplyApp(null); fetchData(); }}
        />
      )}
    </div>
  );
}
