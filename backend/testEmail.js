require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `set (${process.env.EMAIL_PASS.length} chars)` : 'MISSING');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('\n❌ FAILED:', err.message);
    console.error('Code:', err.code);
    console.error('Response:', err.response);
  } else {
    console.log('\n✅ Gmail connection OK — sending test email...');
    transporter.sendMail({
      from: `"Mr. Solomon Tutoring" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'Email is working correctly.'
    }, (err, info) => {
      if (err) console.error('❌ Send failed:', err.message);
      else console.log('✅ Email sent! MessageId:', info.messageId);
    });
  }
});
