import { Play } from "lucide-react";
import React from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VideoPlayer({ videoId }) {
  if (!videoId) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <Play className="w-5 h-5 text-green-500" /> Now Playing
      </h3>
      <video
        controls
        className="w-full rounded-lg shadow-lg bg-black"
        src={`${API_BASE_URL}/api/stream/${videoId}`}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
