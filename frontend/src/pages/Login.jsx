import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import pulseLogo from "../assets/images/pulse_logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Store the token so the Dashboard can use it for protected videos
      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <img src={pulseLogo} alt="Pulse" className="w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            PULSE
          </h1>
          <p className="text-gray-500 font-medium">
            Sign in to Video Analytics
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-bold">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all"
          >
            SIGN IN
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          New to the platform?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
