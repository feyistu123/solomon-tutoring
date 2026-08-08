const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authMiddleware');

// POST /api/contact — public, parents send message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: 'All fields are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please provide a valid email address' });

    await Contact.create({ name, email, subject, message });

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

// GET /api/contact — private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    const unread = await Contact.countDocuments({ read: false });
    res.json({ messages, unread });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/contact/read-all — MUST be before /:id routes
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await Contact.updateMany({ read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/contact/:id/read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/contact/:id/reply
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });
    if (!process.env.RESEND_API_KEY) return res.status(500).json({ message: 'RESEND_API_KEY not set on server.' });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Message not found' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Mr. Solomon Tutoring <onboarding@resend.dev>',
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

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: `Failed to send email: ${error.message}` });
    }

    await contact.updateOne({ read: true });
    await Notification.create({
      type: 'reply_sent',
      message: `Reply sent to ${contact.name} (${contact.email}) re: "${contact.subject}"`,
      applicationId: null
    });

    res.json({ message: `Reply sent to ${contact.email}` });
  } catch (err) {
    console.error('Contact reply error:', err.message);
    res.status(500).json({ message: `Failed to send email: ${err.message}` });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
