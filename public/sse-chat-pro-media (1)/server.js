const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, "messages.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const MAX_HISTORY = 200;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, safe);
  }
});
const upload = multer({ storage });

// Load history
let messages = [];
try {
  if (fs.existsSync(HISTORY_FILE)) {
    messages = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8") || "[]");
  }
} catch (err) {
  console.error("Failed to load history:", err);
  messages = [];
}

function saveHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(messages.slice(-MAX_HISTORY), null, 2));
  } catch (err) {
    console.error("Failed to save history:", err);
  }
}

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(bodyParser.json());

// clients: map id -> {id, user, res}
const clients = new Map();
let nextClientId = 1;

function broadcast(obj, privateTo) {
  const payload = JSON.stringify(obj);
  if (privateTo) {
    // send to user(s) matching privateTo (username)
    for (const [, client] of clients) {
      if (client.user === privateTo || client.user === obj.user) {
        client.res.write(`data: ${payload}\n\n`);
      }
    }
  } else {
    for (const [, client] of clients) {
      client.res.write(`data: ${payload}\n\n`);
    }
  }
}

function broadcastMeta() {
  const users = Array.from(clients.values()).map(c => c.user);
  const meta = { online: users.length, users };
  for (const [, client] of clients) {
    client.res.write(`event: meta\n`);
    client.res.write(`data: ${JSON.stringify(meta)}\n\n`);
  }
}

// SSE endpoint
app.get("/stream", (req, res) => {
  const user = (req.query.user || "Anonymous").toString().slice(0,50);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // open stream
  res.write(': connected\n\n');

  // send history
  res.write(`event: history\n`);
  res.write(`data: ${JSON.stringify(messages.slice(-50))}\n\n`);

  const id = nextClientId++;
  clients.set(id, { id, user, res });

  console.log(`Client connected (#${id}) user="${user}" total=${clients.size}`);

  // announce join (system message)
  const joinMsg = { type: "system", user: "System", text: `${user} joined`, time: new Date().toISOString() };
  messages.push(joinMsg);
  saveHistory();
  broadcast(joinMsg);
  broadcastMeta();

  req.on("close", () => {
    clients.delete(id);
    console.log(`Client disconnected (#${id}) user="${user}" total=${clients.size}`);
    const leaveMsg = { type: "system", user: "System", text: `${user} left`, time: new Date().toISOString() };
    messages.push(leaveMsg);
    saveHistory();
    broadcast(leaveMsg);
    broadcastMeta();
  });
});

// Send text or image message (public or private)
app.post("/send", (req, res) => {
  const user = (req.body.user || "Anonymous").toString().slice(0,50);
  const text = (req.body.text || "").toString().slice(0,2000).trim();
  const target = req.body.target || null; // username to send privately
  const type = req.body.type || "text"; // "text" or "image"
  if (type === "text" && !text) return res.status(400).json({ error: "Empty message" });

  const msg = { type, user, text, imageUrl: req.body.imageUrl || null, time: new Date().toISOString(), privateTo: target || null };
  messages.push(msg);
  saveHistory();

  // broadcast to either everyone or only target+sender
  if (target) broadcast(msg, target);
  else broadcast(msg, null);

  res.json({ success: true, msg });
});

// Upload endpoint for images (multipart)
app.post("/upload", upload.single('file'), (req, res) => {
  const user = (req.body.user || "Anonymous").toString().slice(0,50);
  const target = req.body.target || null;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `/uploads/${req.file.filename}`;
  const msg = { type: "image", user, text: req.body.caption || "", imageUrl, time: new Date().toISOString(), privateTo: target || null };
  messages.push(msg);
  saveHistory();

  if (target) broadcast(msg, target);
  else broadcast(msg, null);

  res.json({ success: true, imageUrl, msg });
});

// simple health
app.get("/ping", (req, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`sse-chat-pro-media running at http://localhost:${PORT}`);
});
