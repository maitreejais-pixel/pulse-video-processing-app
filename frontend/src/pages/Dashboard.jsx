import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UploadVideo from "../components/UploadVideo";
import VideoPlayer from "../components/VideoPlayer";
import VideoList from "../components/VideoList";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Access user role info
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { progress, setProgress, status, setStatus } =
    useSocket(currentVideoId);

  useEffect(() => {
    if (!currentVideoId) return;

    const fetchVideoStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Define the dynamic URL
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        // 2. Use the variable in the request
        const id =
          typeof currentVideoId === "object"
            ? currentVideoId?._id
            : currentVideoId;

        const res = await axios.get(`${API_BASE_URL}/api/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(res.data.status);
        setProgress(res.data.progress || 0);
      } catch (err) {
        console.error("Error fetching video details:", err);
      }
    };

    fetchVideoStatus();
  }, [currentVideoId, setStatus, setProgress]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            PULSE <span className="text-blue-600">VIDEO</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Secure Sensitivity Processing & Streaming
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
        >
          LOGOUT
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="bg-white p-2 rounded-2xl">
            {/* --- RBAC LOGIC START --- */}
            {user?.role?.name !== "viewer" ? (
              <UploadVideo
                onUploadSuccess={(id) => {
                  setCurrentVideoId(id);
                  setRefreshKey((prev) => prev + 1);
                }}
              />
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <p className="text-gray-600 font-bold">Viewer Mode</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                  Read-only library access
                </p>
              </div>
            )}
            {/* --- RBAC LOGIC END --- */}

            {currentVideoId &&
              (status === "analyzing" || status === "processing") && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                      {status}
                    </span>
                    <span className="text-sm font-black text-blue-700">
                      {Math.round(progress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
          </section>

          <section>
            <VideoList
              refreshTrigger={refreshKey}
              onSelectVideo={(video) => setCurrentVideoId(video?._id || video)}
            />
          </section>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col justify-center sticky top-8">
          {status === "safe" ? (
            <div className="p-4 w-full">
              <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest text-center">
                Verified Secure Stream
              </h2>
              <VideoPlayer videoId={currentVideoId} />
            </div>
          ) : status === "flagged" ? (
            <div className="p-12 bg-red-50 border-2 border-red-100 rounded-2xl text-center m-6 shadow-inner">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-red-600 text-xl font-black mb-2">
                Content Flagged
              </h2>
              <p className="text-sm text-red-500 leading-relaxed">
                Our sensitivity analysis detected restricted material. This
                video has been blocked.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl">
                {currentVideoId ? "⚙️" : "📁"}
              </div>
              <p className="max-w-[200px] font-medium">
                {currentVideoId
                  ? "Analyzing content for safety violations..."
                  : "Select a video from your library to start streaming"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
