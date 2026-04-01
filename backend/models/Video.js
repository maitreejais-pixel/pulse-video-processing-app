const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["processing", "analyzing", "safe", "flagged"],
    default: "processing",
  },
  progress: {
    type: Number,
    default: 0,
  },
  // 🔑 THE CRITICAL LINK: Connects this video to a specific User
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // This must match the name in your User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Video", videoSchema);
