const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, message) {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: to,
      subject: subject,
      text: message,
    });
    console.log('Email sent successfully via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    throw error;
  }
}

module.exports = sendEmail;