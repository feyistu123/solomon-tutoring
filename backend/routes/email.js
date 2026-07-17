const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authMiddleware');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/email/reply/:id — Send email reply to a family (Private)
router.post('/reply/:id', authenticateToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    await transporter.sendMail({
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

    await Notification.create({
      type: 'reply_sent',
      message: `Reply sent to ${application.parentName} (${application.email})`,
      applicationId: application._id
    });

    res.json({ message: `Email sent to ${application.email}` });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email. Check email credentials.' });
  }
});

module.exports = router;
