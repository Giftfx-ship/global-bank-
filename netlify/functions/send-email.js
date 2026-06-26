const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, html } = JSON.parse(event.body);

    if (!to) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Recipient email is required' })
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Prime Heritage Bank <no-reply@primeheritage.com>',
      to: to,
      subject: subject || 'Message from Prime Heritage Bank',
      html: html || ''
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      })
    };

  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to send email'
      })
    };
  }
};
