const { sendMail } = require("../services/mailer");

exports.sendComplaint = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Complaint text is required" });
    }

    const message = `
New Complaint Received:

Message:
${text.trim()}
`;

    await sendMail({
      from: process.env.MAIL_FROM,        // ✅ FIXED
      to: process.env.SUGGESTIONS_TO,     // same email as suggestions
      subject: "New Complaint Submitted",
      text: message,
    });

    res.json({ message: "Complaint submitted successfully!" });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ error: "Failed to send complaint" });
  }
};
