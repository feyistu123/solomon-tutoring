const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authMiddleware');

// POST /api/email/reply/:id — Send email reply to a family (Private)
router.post('/reply/:id', authenticateToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });
    if (!process.env.RESEND_API_KEY) return res.status(500).json({ message: 'RESEND_API_KEY not set on server.' });

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Mr. Solomon Tutoring <onboarding@resend.dev>',
      to: application.email,
      subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a3c5e">Mr. Solomon's Tutoring</h2>
        <p>Dear ${application.parentName},</p>
        ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
        <hr/>
        <p style="color:#888;font-size:12px">This email was sent regarding your tutoring application for ${application.studentName}.</p>
      </div>`
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: `Failed to send email: ${error.message}` });
    }

    await Notification.create({
      type: 'reply_sent',
      message: `Reply sent to ${application.parentName} (${application.email})`,
      applicationId: application._id
    });

    res.json({ message: `Email sent to ${application.email}` });
  } catch (err) {
    console.error('Application email error:', err.message);
    res.status(500).json({ message: `Failed to send email: ${err.message}` });
  }
});

module.exports = router;
