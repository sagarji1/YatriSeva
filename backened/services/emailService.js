const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendFIREmail(toEmail, subject, text, attachmentPath) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
    attachments: attachmentPath ? [{ path: attachmentPath }] : []
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendFIREmail };
