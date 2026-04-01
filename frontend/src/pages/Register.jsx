import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import pulseLogo from "../assets/images/pulse_logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      // Endpoint matches your Node backend
      await axios.post("http://localhost:5000/api/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100">
        <div className="text-center mb-8">
          <img src={pulseLogo} alt="Pulse" className="w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 font-medium">Join the Pulse Network</p>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-bold">{error}</p>
        )}

        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            className="p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            className="p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Work Email"
            className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
            onChange={handleChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm"
            className="p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="md:col-span-2 mt-4 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
