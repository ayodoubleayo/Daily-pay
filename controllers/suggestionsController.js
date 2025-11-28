// backend/controllers/suggestionsController.js
const { sendMail } = require("../services/mailer");

exports.sendSuggestion = async (req, res) => {
  try {
    const { text, name, email } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Suggestion text is required" });
    }

    const message = `
New Suggestion Received:

From: ${name || "Anonymous"} ${email ? `<${email}>` : ""}
Message:
${text.trim()}
`;

    await sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.SUGGESTIONS_TO,
      subject: "New Suggestion Submitted",
      text: message,
      html: `<pre>${message}</pre>`,
    });

    res.json({ message: "Suggestion sent successfully!" });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ error: "Failed to send suggestion" });
  }
};
