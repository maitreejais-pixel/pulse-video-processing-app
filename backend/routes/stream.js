const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Video = require("../models/Video");
const auth = require("../middleware/auth");

router.get("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send("Video not found");

    const videoPath = path.join(__dirname, "..", video.filepath);
    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;

    if (range) {
      // Parse Range Header: "bytes=1000-"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head); // 206 = Partial Content
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": videoSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
