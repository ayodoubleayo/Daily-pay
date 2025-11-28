// backend/services/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ from, to, subject, html, text }) {
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", result);
    return result;
  } catch (err) {
    console.error("Resend error:", err);
    throw err;
  }
}

module.exports = { sendMail };
