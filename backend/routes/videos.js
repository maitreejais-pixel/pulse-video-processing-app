const express = require("express");
const auth = require("../middleware/auth"); // Line 2: Import the bouncer
const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// 1. LIST ALL VIDEOS (Filtered by user)
router.get("/", auth, async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET SINGLE VIDEO (Secure Ownership Check)
router.get("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    // --- THE SECURITY CHECK ---
    // This compares the video's owner ID to the ID in the user's Token
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this video" });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 3. DELETE VIDEO (Database + Physical File)
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    // SECURITY: Only the owner can delete their own videos
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this video" });
    }

    // Define path to the file (goes up one level to find /uploads)
    const filePath = path.join(__dirname, "..", video.filepath);

    // 1. Remove physical file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 2. Remove metadata from MongoDB
    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: "Video and file deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ error: "Failed to delete video" });
  }
});
module.exports = router;
