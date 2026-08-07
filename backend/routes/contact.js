const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
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

// POST /api/contact — public, parents send message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: 'All fields are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please provide a valid email address' });

    const contact = await Contact.create({ name, email, subject, message });

    await Notification.create({
      type: 'new_application',
      message: `New message from ${name} (${email}): "${subject}"`,
      applicationId: null
    });

    res.status(201).json({ message: 'Your message has been sent! Mr. Solomon will reply to your email within 24 hours.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/contact — private, Mr. Solomon reads all messages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    const unread = await Contact.countDocuments({ read: false });
    res.json({ messages, unread });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/contact/:id/read — mark one as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/contact/read-all — mark all as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await Contact.updateMany({ read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/contact/:id/reply — reply to a parent message by email
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.status(500).json({ message: 'Email not configured on server. Add EMAIL_USER and EMAIL_PASS in Render environment variables.' });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Message not found' });

    console.log('Sending contact reply to:', contact.email);
    console.log('From:', process.env.EMAIL_USER);

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Mr. Solomon Tutoring" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <div style="background:#1B3A5C;padding:20px 24px;border-radius:10px 10px 0 0">
          <h2 style="color:#C8A951;margin:0;font-family:Georgia,serif">Mr. Solomon's Tutoring</h2>
        </div>
        <div style="background:#f8f6f1;padding:24px;border-radius:0 0 10px 10px;border:1px solid #e4e2dc">
          <p style="color:#4a4a6a;margin-bottom:16px">Dear ${contact.name},</p>
          ${body.split('\n').map(p => p.trim() ? `<p style="color:#1f1e1a;line-height:1.7;margin-bottom:12px">${p}</p>` : '').join('')}
          <hr style="border:none;border-top:1px solid #e4e2dc;margin:20px 0"/>
          <p style="color:#9c9a94;font-size:12px">This is a reply to your enquiry: "${contact.subject}"</p>
        </div>
      </div>`
    });

    console.log('Contact reply sent:', info.messageId);

    await contact.updateOne({ read: true });
    await Notification.create({
      type: 'reply_sent',
      message: `Reply sent to ${contact.name} (${contact.email}) re: "${contact.subject}"`,
      applicationId: null
    });

    res.json({ message: `Reply sent to ${contact.email}` });
  } catch (err) {
    console.error('Contact reply error — message:', err.message);
    console.error('Contact reply error — code:', err.code);
    console.error('Contact reply error — responseCode:', err.responseCode);
    console.error('Contact reply error — response:', err.response);
    res.status(500).json({ message: `Failed to send email: ${err.message}` });
  }
});

// DELETE /api/contact/:id — delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
