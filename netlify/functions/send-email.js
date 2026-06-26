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

    // Generate a unique message ID
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 15)}@primeheritage.com>`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Prime Heritage Bank" <no-reply@primeheritage.com>',
      to: to,
      subject: subject || 'Message from Prime Heritage Bank',
      html: html || '',
      // ✅ Plain text version (helps avoid spam)
      text: html ? html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '',
      messageId: messageId,
      // ✅ HEADERS TO AVOID SPAM
      headers: {
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER || 'primeheritageinternationalbank@gmail.com'}?subject=unsubscribe>`,
        'X-Mailer': 'Prime Heritage Bank Mail System',
        'X-Entity-Ref-ID': Date.now().toString(),
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'X-No-Spam': 'true',
        'Precedence': 'bulk'
      },
      // ✅ Priority headers
      priority: 'high'
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
