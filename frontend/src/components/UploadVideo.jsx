import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Upload, CheckCircle } from "lucide-react";

export default function UploadVideo({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useContext(AuthContext);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", file.name);

    setUploading(true);
    try {
      // 1. Ensure we have the token (Context or LocalStorage)
      const authToken = token || localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 2. Critical for files
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      // 3. Trigger success and clear the file
      onUploadSuccess(res.data.videoId);
      setFile(null);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <form onSubmit={handleUpload} className="space-y-4">
        <label className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-sm text-gray-600">
            {file ? file.name : "Select Video (MP4)"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <button
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Start Analysis"}
        </button>
      </form>
    </div>
  );
}
