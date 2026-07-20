import { useState } from 'react';
import axios from 'axios';
import './Modal.css';

const TEMPLATES = [
  {
    label: 'Initial Contact',
    subject: 'Your Tutoring Application – Mr. Solomon',
    body: `Thank you for submitting your application for tutoring services.\n\nI have reviewed your request and I am happy to discuss how I can help {studentName} with {subjects}.\n\nPlease let me know your availability for a brief call or meeting so we can discuss the details further.\n\nBest regards,\nMr. Solomon`
  },
  {
    label: 'Schedule Confirmation',
    subject: 'Tutoring Schedule Confirmed – Mr. Solomon',
    body: `I am pleased to confirm that we have arranged tutoring sessions for {studentName}.\n\nWe will begin as discussed. Please ensure {studentName} has the necessary materials ready for our first session.\n\nLooking forward to working with your family!\n\nBest regards,\nMr. Solomon`
  },
  {
    label: 'Follow-up',
    subject: 'Following Up on Your Application – Mr. Solomon',
    body: `I wanted to follow up on the tutoring application you submitted for {studentName}.\n\nI am still available and would love to help. Please feel free to reach out at your convenience.\n\nBest regards,\nMr. Solomon`
  },
];

export default function ReplyModal({ app, token, onClose, onSent }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const applyTemplate = (tpl) => {
    const fill = (str) => str.replace(/{studentName}/g, app.studentName).replace(/{subjects}/g, app.subjects);
    setSubject(fill(tpl.subject));
    setBody(fill(tpl.body));
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { setError('Subject and body are required.'); return; }
    setSending(true); setError('');
    try {
      await axios.post(
        `http://localhost:5000/api/email/reply/${app._id}`,
        { subject, body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box reply-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Reply to {app.parentName}</h3>
            <p className="modal-sub">→ {app.email}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="reply-body">
          <div className="template-row">
            <span className="template-label">Quick templates:</span>
            {TEMPLATES.map(t => (
              <button key={t.label} className="template-btn" onClick={() => applyTemplate(t)}>{t.label}</button>
            ))}
          </div>

          {error && <div className="reply-error">❌ {error}</div>}

          <div className="reply-field">
            <label>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." />
          </div>
          <div className="reply-field">
            <label>Message</label>
            <textarea rows={10} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message here..." />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-reply" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : '✉️ Send Email'}
          </button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
