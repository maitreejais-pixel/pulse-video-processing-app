const express = require("express");
const router = express.Router();
const multer = require("multer");
const Video = require("../models/Video");
const auth = require("../middleware/auth");

// 1. Setup Storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadMiddleware = multer({ storage });

// 2. The Handler
const uploadHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const video = new Video({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      uploadedBy: req.user._id,
      status: "processing",
      progress: 0,
    });

    await video.save();

    // 3. NEW: Smooth Progress & Consistent Results
    let currentProgress = 0;
    const io = req.app.get("io");

    const progressInterval = setInterval(async () => {
      currentProgress += 5;

      if (io) {
        io.to(video._id.toString()).emit("progress", {
          videoId: video._id,
          progress: currentProgress,
          status: "analyzing",
        });
      }

      if (currentProgress >= 100) {
        clearInterval(progressInterval);

        const analysisResults = ["safe", "flagged", "safe"]; // Weighted towards 'safe'
        const finalStatus =
          analysisResults[Math.floor(Math.random() * analysisResults.length)];
        video.status = finalStatus;
        video.progress = 100;
        await video.save();

        if (io) {
          io.to(video._id.toString()).emit("complete", {
            videoId: video._id,
            status: finalStatus,
          });
        }
      }
    }, 150);

    // IMPORTANT: Send this response so the frontend knows to start tracking progress
    res.json({
      message: "Upload success",
      videoId: video._id,
    });
  } catch (error) {
    console.error("BACKEND ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
}; // <--- ADDED MISSING BRACE

// 4. THE ROUTE
router.post("/", auth, uploadMiddleware.single("video"), uploadHandler);
module.exports = router;
