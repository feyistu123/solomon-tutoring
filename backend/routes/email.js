const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authMiddleware');

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  });
}

// POST /api/email/reply/:id — Send email reply to a family (Private)
router.post('/reply/:id', authenticateToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.status(500).json({ message: 'Email not configured on server. Add EMAIL_USER and EMAIL_PASS in Render environment variables.' });

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    console.log('Sending email to:', application.email);
    console.log('From:', process.env.EMAIL_USER);

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Mr. Solomon Tutoring" <${process.env.EMAIL_USER}>`,
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

    console.log('Email sent:', info.messageId);

    await Notification.create({
      type: 'reply_sent',
      message: `Reply sent to ${application.parentName} (${application.email})`,
      applicationId: application._id
    });

    res.json({ message: `Email sent to ${application.email}` });
  } catch (err) {
    console.error('Application email error — message:', err.message);
    console.error('Application email error — code:', err.code);
    console.error('Application email error — responseCode:', err.responseCode);
    console.error('Application email error — response:', err.response);
    res.status(500).json({ message: `Failed to send email: ${err.message}` });
  }
});

module.exports = router;
