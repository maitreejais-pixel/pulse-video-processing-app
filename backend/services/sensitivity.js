const ffmpeg = require("ffmpeg-static");
const ffprobe = require("ffprobe-static");
const probe = require("ffprobe");
const Video = require("../models/Video");

const analyzeSensitivity = async (videoId) => {
  const io = require("../server").app.get("io");
  const video = await Video.findById(videoId);

  if (!video) return;

  // Simulate processing pipeline (30 seconds total)
  const steps = [
    { name: "Extracting frames", duration: 10 },
    { name: "Analyzing content", duration: 15 },
    { name: "Generating report", duration: 5 },
  ];

  let totalProgress = 0;

  for (let step of steps) {
    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, step.duration * 1000));

    totalProgress += (step.duration / 30) * 100;
    video.progress = Math.min(totalProgress, 100);

    // Real-time update
    io.to(videoId).emit("progress", {
      videoId,
      progress: video.progress,
      step: step.name,
      status: video.status,
    });

    await video.save();
  }

  // Mock sensitivity analysis (random safe/flagged)
  const isSafe = Math.random() > 0.3;
  video.status = isSafe ? "safe" : "flagged";
  video.sensitivityScore = isSafe ? 0.12 : 0.87;

  await video.save();

  io.to(videoId).emit("complete", {
    videoId,
    status: video.status,
    sensitivityScore: video.sensitivityScore,
  });

  return video;
};

module.exports = { analyzeSensitivity };
