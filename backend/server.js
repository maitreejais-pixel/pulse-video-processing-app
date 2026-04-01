const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Routes & Models
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const uploadRoutes = require("./routes/upload");
const Role = require("./models/Role");
const Video = require("./models/Video");
const auth = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://pulse-frontend-1wzo.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "https://pulse-frontend-1wzo.onrender.com",
    credentials: true,
  }),
);
app.use(express.json());

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
  console.log("📁 Created 'uploads' directory");
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Role Initialization Logic
const initRoles = async () => {
  const roles = [
    {
      name: "viewer",
      description: "Read videos only",
      permissions: [{ resource: "videos", actions: ["read"] }],
    },
    {
      name: "editor",
      description: "Upload & manage videos",
      permissions: [
        { resource: "videos", actions: ["read", "create", "update", "delete"] },
      ],
    },
    {
      name: "admin",
      description: "Full system access",
      permissions: [{ resource: "*", actions: ["*"] }],
    },
  ];

  for (let roleData of roles) {
    await Role.findOneAndUpdate({ name: roleData.name }, roleData, {
      upsert: true,
      new: true,
    });
  }
  console.log("✅ Roles initialized");
};

mongoose.connection.once("open", initRoles);

// Socket.IO
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);
  socket.on("join-room", (videoId) => {
    socket.join(videoId);
    console.log(`📺 Joined video room: ${videoId}`);
  });
  socket.on("disconnect", () => console.log("👤 User disconnected"));
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("🚀 Pulse Backend is running and healthy!");
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/upload", uploadRoutes);

// SECURE STREAMING ENDPOINT (Range Requests)
app.get("/api/stream/:videoId", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) return res.status(404).json({ error: "Video not found" });

    // Multi-tenant Security Check
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this stream" });
    }

    const videoPath = path.join(__dirname, video.filepath);
    const { range } = req.headers;

    if (!range) {
      return res.status(400).send("Range header required");
    }

    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6; // 1MB chunks
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } catch (err) {
    console.error("Streaming Error:", err.message);
    res.status(500).json({ error: "Streaming failed" });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
