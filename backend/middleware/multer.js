const multer = require("multer");
const path = require("path");
const Video = require("../models/Video");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ".mp4");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/") && file.size < 100 * 1024 * 1024) {
    // 100MB
    cb(null, true);
  } else {
    cb(new Error("Only videos under 100MB allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const saveVideoMetadata = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const video = new Video({
      title: req.body.title || req.file.filename,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      uploadedBy: req.user._id,
      organization: req.user.organization,
    });
    await video.save();
    req.video = video;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, saveVideoMetadata };
