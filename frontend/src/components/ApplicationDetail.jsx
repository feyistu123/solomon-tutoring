import { useState } from 'react';
import './Modal.css';

export default function ApplicationDetail({ app, onClose, onReply, onStatusChange, onSaveNotes, onDelete, statusUpdating, statuses, statusColors }) {
  const [notes, setNotes] = useState(app.notes || '');
  const [followUpDate, setFollowUpDate] = useState(app.followUpDate ? app.followUpDate.slice(0,10) : '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    await onSaveNotes(app._id, notes, followUpDate);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box detail-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-avatar">{app.parentName.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{app.parentName}</h3>
            <p className="modal-sub">Applied {new Date(app.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">

          <div className="detail-section">
            <div className="detail-section-title">Contact Information</div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Email</span><span>{app.email}</span></div>
              <div className="detail-item"><span className="detail-label">Phone</span><span>{app.phone}</span></div>
              <div className="detail-item"><span className="detail-label">Address</span><span>{app.address}</span></div>
              <div className="detail-item"><span className="detail-label">How They Found Us</span><span>{app.howDidYouHear}{app.otherSource ? ` — ${app.otherSource}` : ''}</span></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Student Information</div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Student Name</span><span>{app.studentName}</span></div>
              <div className="detail-item"><span className="detail-label">Grade Level</span><span>{app.studentGrade}</span></div>
              <div className="detail-item detail-item--full"><span className="detail-label">Subjects</span><span>{app.subjects}</span></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Schedule</div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Preferred Days</span><span>{app.preferredDays}</span></div>
              <div className="detail-item"><span className="detail-label">Preferred Time</span><span>{app.preferredTime}</span></div>
              <div className="detail-item"><span className="detail-label">Frequency</span><span>{app.sessionFrequency}</span></div>
              <div className="detail-item"><span className="detail-label">Duration</span><span>{app.sessionDuration}</span></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Budget</div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Budget Range</span><span>{app.budgetRange}</span></div>
              {app.expectedRate && <div className="detail-item"><span className="detail-label">Expected Rate</span><span>{app.expectedRate}</span></div>}
            </div>
          </div>

          {(app.additionalNotes || app.message) && (
            <div className="detail-section">
              <div className="detail-section-title">Family's Message</div>
              {app.additionalNotes && <div className="detail-note"><strong>Additional Notes:</strong> {app.additionalNotes}</div>}
              {app.message && <div className="detail-note" style={{marginTop:8}}><strong>Message:</strong> {app.message}</div>}
            </div>
          )}

          <div className="detail-section">
            <div className="detail-section-title">Status</div>
            <div className="detail-status-row">
              <span className="status-badge" style={{ background: statusColors[app.status]+'22', color: statusColors[app.status], border:`1px solid ${statusColors[app.status]}44` }}>
                {app.status}
              </span>
              <select className="filter-select" value={app.status}
                disabled={statusUpdating === app._id}
                onChange={e => onStatusChange(app._id, e.target.value)}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Admin Notes &amp; Follow-up</div>
            <div className="notes-row">
              <div className="notes-field">
                <label>Follow-up Date</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}/>
              </div>
            </div>
            <textarea className="notes-textarea" rows={4} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add private notes about this family, negotiation details, agreed price, etc..."/>
            <button className="notes-save-btn" onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Notes'}
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-reply" onClick={onReply}>✉️ Send Email Reply</button>
          <button className="btn-delete" onClick={onDelete}>🗑 Delete</button>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
