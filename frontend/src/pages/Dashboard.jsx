import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReplyModal from '../components/ReplyModal';
import ApplicationDetail from '../components/ApplicationDetail';
import './Dashboard.css';

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS = {
  'Pending':          '#ea580c',
  'Contacted':        '#2563eb',
  'Negotiating':      '#7c3aed',
  'Enrolled':         '#16a34a',
  'Not Interested':   '#6b7280',
  'Follow-up Needed': '#dc2626',
};
const STATUSES = ['Pending','Contacted','Negotiating','Enrolled','Not Interested','Follow-up Needed'];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  const [applications, setApplications]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [messages, setMessages]           = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStats]                 = useState({});
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('families');
  const [filterStatus, setFilterStatus]   = useState('');
  const [search, setSearch]               = useState('');
  const [selectedApp, setSelectedApp]     = useState(null);
  const [replyApp, setReplyApp]           = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [replyMsg, setReplyMsg]           = useState(null);
  const [replyForm, setReplyForm]         = useState({ subject:'', body:'' });
  const [replySending, setReplySending]   = useState(false);
  const [replyResult, setReplyResult]     = useState({ text:'', ok:false });
  const [pwForm, setPwForm]               = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwMsg, setPwMsg]                 = useState({ text:'', ok:false });
  const [pwLoading, setPwLoading]         = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [appRes, notifRes, msgRes] = await Promise.all([
        axios.get(`${API}/application`, { headers }),
        axios.get(`${API}/notifications`, { headers }),
        axios.get(`${API}/contact`, { headers }),
      ]);
      setApplications(appRes.data.applications);
      setStats(appRes.data.stats);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(notifRes.data.unreadCount);
      setMessages(msgRes.data.messages);
      setUnreadMessages(msgRes.data.unread);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll notifications every 30s
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/notifications`, { headers });
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {}
    }, 30000);
    return () => clearInterval(iv);
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
      const { data } = await axios.get(`${API}/notifications`, { headers });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
    setStatusUpdating(null);
  };

  const deleteApp = async (id) => {
    try {
      await axios.delete(`${API}/application/${id}`, { headers });
      setApplications(apps => apps.filter(a => a._id !== id));
      setStats(s => ({ ...s, total: (s.total || 1) - 1 }));
      setDeleteConfirm(null);
      setSelectedApp(null);
    } catch {}
  };

  const saveNotes = async (id, notes, followUpDate) => {
    try {
      await axios.patch(`${API}/application/${id}/status`, {
        status: selectedApp.status, notes, followUpDate
      }, { headers });
      setApplications(apps => apps.map(a => a._id === id ? { ...a, notes, followUpDate } : a));
      setSelectedApp(a => ({ ...a, notes, followUpDate }));
    } catch {}
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match', ok: false }); return;
    }
    setPwLoading(true); setPwMsg({ text:'', ok:false });
    try {
      const { data } = await axios.post(`${API}/auth/change-password`,
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { headers }
      );
      setPwMsg({ text: data.message, ok: true });
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || 'Failed to change password', ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  const sendContactReply = async (e) => {
    e.preventDefault();
    setReplySending(true); setReplyResult({ text:'', ok:false });
    try {
      const { data } = await axios.post(
        `${API}/contact/${replyMsg._id}/reply`,
        { subject: replyForm.subject, body: replyForm.body },
        { headers }
      );
      setReplyResult({ text: data.message, ok: true });
      setMessages(msgs => msgs.map(x => x._id === replyMsg._id ? { ...x, read: true } : x));
      setUnreadMessages(c => replyMsg.read ? c : Math.max(0, c - 1));
      setTimeout(() => { setReplyMsg(null); setReplyForm({ subject:'', body:'' }); setReplyResult({ text:'', ok:false }); }, 1800);
    } catch (err) {
      setReplyResult({ text: err.response?.data?.message || 'Failed to send. Check email credentials.', ok: false });
    } finally {
      setReplySending(false);
    }
  };

  const openReplyMsg = (m) => {
    setReplyMsg(m);
    setReplyForm({ subject: `Re: ${m.subject}`, body: `Dear ${m.name},\n\n` });
    setReplyResult({ text:'', ok:false });
  };

  const filtered = applications.filter(a => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.parentName.toLowerCase().includes(q) ||
      a.studentName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.subjects.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner"/>
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">S</div>
          <div>
            <div className="sidebar-title">Mr. Solomon</div>
            <div className="sidebar-sub">Admin Dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`sidebar-item ${activeTab==='families'?'active':''}`}
            onClick={() => setActiveTab('families')}>
            <span className="si-icon">👨‍👩‍👧</span>
            <span className="si-label">Families</span>
            <span className="sidebar-count">{applications.length}</span>
          </button>

          <button className={`sidebar-item ${activeTab==='notifications'?'active':''}`}
            onClick={() => { setActiveTab('notifications'); if(unreadCount>0) markAllRead(); }}>
            <span className="si-icon">🔔</span>
            <span className="si-label">Notifications</span>
            {unreadCount > 0
              ? <span className="sidebar-badge">{unreadCount}</span>
              : <span className="sidebar-count">0</span>}
          </button>

          <button className={`sidebar-item ${activeTab==='overview'?'active':''}`}
            onClick={() => setActiveTab('overview')}>
            <span className="si-icon">📊</span>
            <span className="si-label">Overview</span>
          </button>

          <button className={`sidebar-item ${activeTab==='settings'?'active':''}`}
            onClick={() => setActiveTab('settings')}>
            <span className="si-icon">⚙️</span>
            <span className="si-label">Settings</span>
          </button>

          <button className={`sidebar-item ${activeTab==='messages'?'active':''}`}
            onClick={() => { setActiveTab('messages'); }}>
            <span className="si-icon">💬</span>
            <span className="si-label">Messages</span>
            {unreadMessages > 0
              ? <span className="sidebar-badge">{unreadMessages}</span>
              : <span className="sidebar-count">{messages.length}</span>}
          </button>
        </nav>

        <button className="sidebar-logout" onClick={() => { logout(); navigate('/'); }}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main">

        {/* ── FAMILIES ── */}
        {activeTab === 'families' && (
          <div className="dash-panel">
            <div className="panel-header">
              <div>
                <h2>Families</h2>
                <p className="panel-desc">All submitted applications from families</p>
              </div>
              <div className="panel-controls">
                <input className="search-input" placeholder="Search name, email, subject..."
                  value={search} onChange={e => setSearch(e.target.value)}/>
                <select className="filter-select" value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="families-count">
              Showing {filtered.length} of {applications.length} applications
            </div>

            <div className="families-list">
              {filtered.length === 0 && (
                <div className="empty-state">
                  {search || filterStatus
                    ? '🔍 No results. Try clearing your search or filter.'
                    : '📭 No applications yet. They will appear here once families submit the form.'}
                </div>
              )}
              {filtered.map(app => (
                <div key={app._id} className="family-card" onClick={() => setSelectedApp(app)}>
                  <div className="family-avatar">{app.parentName.charAt(0).toUpperCase()}</div>
                  <div className="family-info">
                    <div className="family-name">{app.parentName}</div>
                    <div className="family-meta">
                      <span>👦 {app.studentName}</span>
                      <span>📚 {app.studentGrade}</span>
                      <span>🗓 {new Date(app.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                    <div className="family-subjects">{app.subjects}</div>
                  </div>
                  <div className="family-right">
                    <span className="status-badge"
                      style={{ background: STATUS_COLORS[app.status]+'22', color: STATUS_COLORS[app.status], border:`1px solid ${STATUS_COLORS[app.status]}44` }}>
                      {app.status}
                    </span>
                    <div className="family-budget">{app.budgetRange}</div>
                    <div className="family-actions" onClick={e => e.stopPropagation()}>
                      <select className="status-select" value={app.status}
                        disabled={statusUpdating === app._id}
                        onChange={e => updateStatus(app._id, e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className="reply-btn" onClick={() => setReplyApp(app)}>✉️ Reply</button>
                      <button className="delete-btn" onClick={() => setDeleteConfirm(app)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div className="dash-panel">
            <div className="panel-header">
              <div>
                <h2>Notifications</h2>
                <p className="panel-desc">Activity alerts for new applications and status changes</p>
              </div>
              {notifications.some(n => !n.read) && (
                <button className="mark-read-btn" onClick={markAllRead}>Mark all as read</button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 && (
                <div className="empty-state">🔔 No notifications yet.</div>
              )}
              {notifications.map(n => (
                <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                  <span className="notif-icon">
                    {n.type === 'new_application' ? '📋' : n.type === 'status_change' ? '🔄' : '✉️'}
                  </span>
                  <div className="notif-body">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">
                      {new Date(n.createdAt).toLocaleString('en-GB', {
                        day:'numeric', month:'short', year:'numeric',
                        hour:'2-digit', minute:'2-digit'
                      })}
                    </div>
                  </div>
                  {!n.read && <span className="notif-dot"/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="dash-panel">
            <div className="panel-header">
              <div>
                <h2>Overview</h2>
                <p className="panel-desc">Summary of all applications and their statuses</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-card-num">{stats.total || 0}</div>
                <div className="stat-card-label">Total Applications</div>
              </div>
              <div className="stat-card pending">
                <div className="stat-card-num">{stats.pending || 0}</div>
                <div className="stat-card-label">Pending</div>
              </div>
              <div className="stat-card contacted">
                <div className="stat-card-num">{stats.contacted || 0}</div>
                <div className="stat-card-label">Contacted</div>
              </div>
              <div className="stat-card enrolled">
                <div className="stat-card-num">{stats.enrolled || 0}</div>
                <div className="stat-card-label">Enrolled</div>
              </div>
            </div>

            <div className="overview-section">
              <h3 className="stats-sub-title">Status Breakdown</h3>
              <div className="status-breakdown">
                {STATUSES.map(s => {
                  const count = applications.filter(a => a.status === s).length;
                  const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                  return (
                    <div key={s} className="breakdown-row">
                      <span className="breakdown-label">{s}</span>
                      <div className="breakdown-bar-wrap">
                        <div className="breakdown-bar" style={{ width:`${pct}%`, background: STATUS_COLORS[s] }}/>
                      </div>
                      <span className="breakdown-pct">{pct}%</span>
                      <span className="breakdown-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overview-section">
              <h3 className="stats-sub-title">Budget Distribution</h3>
              <div className="budget-grid">
                {stats.budgetAnalysis && Object.entries({
                  'Under 2K':    stats.budgetAnalysis.under2000,
                  '2K – 3K':     stats.budgetAnalysis.under3000,
                  '3K – 5K':     stats.budgetAnalysis.under5000,
                  '5K – 7K':     stats.budgetAnalysis.under7000,
                  '7K – 10K':    stats.budgetAnalysis.under10000,
                  'Above 10K':   stats.budgetAnalysis.above10000,
                  'Not Disclosed': stats.budgetAnalysis.preferNotSay,
                }).map(([label, count]) => (
                  <div key={label} className="budget-card">
                    <div className="budget-num">{count}</div>
                    <div className="budget-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-section">
              <h3 className="stats-sub-title">Recent Applications</h3>
              <div className="recent-list">
                {applications.slice(0, 5).map(a => (
                  <div key={a._id} className="recent-row" onClick={() => { setSelectedApp(a); setActiveTab('families'); }}>
                    <div className="recent-avatar">{a.parentName.charAt(0)}</div>
                    <div className="recent-info">
                      <span className="recent-name">{a.parentName}</span>
                      <span className="recent-meta">{a.studentName} · {a.studentGrade}</span>
                    </div>
                    <span className="status-badge"
                      style={{ background: STATUS_COLORS[a.status]+'22', color: STATUS_COLORS[a.status], border:`1px solid ${STATUS_COLORS[a.status]}44` }}>
                      {a.status}
                    </span>
                    <span className="recent-date">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {activeTab === 'messages' && (
          <div className="dash-panel">
            <div className="panel-header">
              <div>
                <h2>Messages</h2>
                <p className="panel-desc">Questions and comments from parents</p>
              </div>
              {messages.some(m => !m.read) && (
                <button className="mark-read-btn" onClick={async () => {
                  await axios.patch(`${API}/contact/read-all`, {}, { headers });
                  setMessages(m => m.map(x => ({ ...x, read: true })));
                  setUnreadMessages(0);
                }}>Mark all as read</button>
              )}
            </div>
            <div className="notif-list">
              {messages.length === 0 && (
                <div className="empty-state">💬 No messages yet. Parent enquiries will appear here.</div>
              )}
              {messages.map(m => (
                <div key={m._id} className={`msg-item ${!m.read ? 'unread' : ''}`}>
                  <div className="msg-avatar">{m.name.charAt(0).toUpperCase()}</div>
                  <div className="msg-body">
                    <div className="msg-top">
                      <span className="msg-name">{m.name}</span>
                      <span className="msg-email">{m.email}</span>
                      {!m.read && <span className="msg-new">New</span>}
                    </div>
                    <div className="msg-subject">{m.subject}</div>
                    <div className="msg-text">{m.message}</div>
                    <div className="msg-time">
                      {new Date(m.createdAt).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <div className="msg-actions">
                    <button className="reply-btn" onClick={async () => {
                      if (!m.read) {
                        await axios.patch(`${API}/contact/${m._id}/read`, {}, { headers });
                        setMessages(msgs => msgs.map(x => x._id === m._id ? { ...x, read: true } : x));
                        setUnreadMessages(c => Math.max(0, c - 1));
                      }
                      openReplyMsg(m);
                    }}>✉️ Reply</button>
                    <button className="delete-btn" onClick={async () => {
                      await axios.delete(`${API}/contact/${m._id}`, { headers });
                      setMessages(msgs => msgs.filter(x => x._id !== m._id));
                      if (!m.read) setUnreadMessages(c => Math.max(0, c - 1));
                    }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="dash-panel">
            <div className="panel-header">
              <div>
                <h2>Settings</h2>
                <p className="panel-desc">Manage your admin account</p>
              </div>
            </div>

            <div className="settings-body">
              <div className="settings-card">
                <div className="settings-card-title">Account Information</div>
                <div className="settings-info-row">
                  <span className="settings-info-label">Username</span>
                  <span className="settings-info-val">solomon</span>
                </div>
                <div className="settings-info-row">
                  <span className="settings-info-label">Role</span>
                  <span className="settings-info-val">Administrator</span>
                </div>
                <div className="settings-info-row">
                  <span className="settings-info-label">Access</span>
                  <span className="settings-info-val">Full Dashboard Access</span>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Change Password</div>
                {pwMsg.text && (
                  <div className={`settings-msg ${pwMsg.ok ? 'ok' : 'err'}`}>
                    {pwMsg.ok ? '✅' : '❌'} {pwMsg.text}
                  </div>
                )}
                <form onSubmit={changePassword} className="settings-form">
                  <div className="settings-field">
                    <label>Current Password</label>
                    <input type="password" value={pwForm.currentPassword} required
                      onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                      placeholder="Enter current password"/>
                  </div>
                  <div className="settings-field">
                    <label>New Password</label>
                    <input type="password" value={pwForm.newPassword} required minLength={6}
                      onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="At least 6 characters"/>
                  </div>
                  <div className="settings-field">
                    <label>Confirm New Password</label>
                    <input type="password" value={pwForm.confirm} required
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"/>
                  </div>
                  <button type="submit" className="settings-btn" disabled={pwLoading}>
                    {pwLoading ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── APPLICATION DETAIL MODAL ── */}
      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onReply={() => { setReplyApp(selectedApp); setSelectedApp(null); }}
          onStatusChange={updateStatus}
          onSaveNotes={saveNotes}
          onDelete={() => setDeleteConfirm(selectedApp)}
          statusUpdating={statusUpdating}
          statuses={STATUSES}
          statusColors={STATUS_COLORS}
        />
      )}

      {/* ── REPLY MODAL ── */}
      {replyApp && (
        <ReplyModal
          app={replyApp}
          token={token}
          onClose={() => setReplyApp(null)}
          onSent={() => { setReplyApp(null); fetchData(); }}
        />
      )}

      {/* ── MESSAGE REPLY MODAL ── */}
      {replyMsg && (
        <div className="modal-overlay" onClick={() => { setReplyMsg(null); setReplyResult({ text:'', ok:false }); }}>
          <div className="modal-box reply-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar">{replyMsg.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3>Reply to {replyMsg.name}</h3>
                <p className="modal-sub">→ {replyMsg.email}</p>
              </div>
              <button className="modal-close" onClick={() => { setReplyMsg(null); setReplyResult({ text:'', ok:false }); }}>✕</button>
            </div>

            <div className="reply-body">
              <div className="msg-original">
                <div className="msg-original__label">Original message</div>
                <div className="msg-original__subject">{replyMsg.subject}</div>
                <div className="msg-original__text">{replyMsg.message}</div>
              </div>

              {replyResult.text && (
                <div className={`reply-result ${replyResult.ok ? 'ok' : 'err'}`}>
                  {replyResult.ok ? '✅' : '❌'} {replyResult.text}
                </div>
              )}

              <div className="reply-field">
                <label>Subject</label>
                <input
                  value={replyForm.subject}
                  onChange={e => setReplyForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Email subject..."
                />
              </div>
              <div className="reply-field">
                <label>Message</label>
                <textarea
                  rows={8}
                  value={replyForm.body}
                  onChange={e => setReplyForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your reply here..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-reply"
                onClick={sendContactReply}
                disabled={replySending || !replyForm.subject.trim() || !replyForm.body.trim()}
              >
                {replySending ? 'Sending...' : '✉️ Send Reply'}
              </button>
              <button className="btn-cancel" onClick={() => { setReplyMsg(null); setReplyResult({ text:'', ok:false }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete Application?</h3>
            <p>Are you sure you want to permanently delete the application from <strong>{deleteConfirm.parentName}</strong> for <strong>{deleteConfirm.studentName}</strong>? This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-delete" onClick={() => deleteApp(deleteConfirm._id)}>Yes, Delete</button>
              <button className="confirm-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
