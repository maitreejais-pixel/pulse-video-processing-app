import React, { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const VideoList = ({ onSelectVideo, refreshTrigger }) => {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/videos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideos(res.data);
      } catch (err) {
        console.error("Error fetching library:", err);
      }
    };
    fetchVideos();
  }, [refreshTrigger]); // Reloads when a new upload happens

  const handleDelete = async (e, videoId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(videos.filter((v) => v._id !== videoId));
      onSelectVideo(null);
    } catch (err) {
      alert("Error deleting video");
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (filter === "all") return true;
    return v.status === filter;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📁</span> Video Library
      </h2>
      <div className="flex gap-2 mb-4">
        {["all", "safe", "flagged"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all uppercase ${
              filter === f
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredVideos.map((v) => (
          <div
            key={v._id}
            onClick={() => onSelectVideo(v)}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                🎬
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 truncate w-40">
                  {v.title}
                </p>
                <p className="text-[10px] text-gray-400">
                  {(v.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                v.status === "safe"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {v.status}
            </span>
            <button
              onClick={(e) => handleDelete(e, v._id)}
              className="ml-3 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete Video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
