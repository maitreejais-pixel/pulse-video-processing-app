import { useEffect, useState } from "react";
import { io } from "socket.io-client"; // Ensure this is installed: npm install socket.io-client

export const useSocket = (videoId) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // 1. Exit if there is no videoId
    if (!videoId) return;

    // 2. Connect to the backend
    const socket = io("http://localhost:5000");

    // 3. Join the specific room for this video
    socket.emit("join-room", videoId);

    // 4. Listen for progress updates (1, 2, 3... 100)
    socket.on("progress", (data) => {
      // Check to make sure we are updating the RIGHT video
      if (data.videoId === videoId) {
        setProgress(data.progress);
        setStatus(data.status);
      }
    });

    // 5. Listen for the completion event
    socket.on("complete", (data) => {
      if (data.videoId === videoId) {
        setProgress(100);
        setStatus(data.status);
      }
    });

    // 6. Cleanup: Important to stop multiple sockets from opening
    return () => {
      socket.off("progress");
      socket.off("complete");
      socket.disconnect();
    };
  }, [videoId]); // Re-run whenever the videoId changes

  return { progress, setProgress, status, setStatus };
};
