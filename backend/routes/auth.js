const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. ADD THIS: Check if user already exists to avoid duplicate errors
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // 2. FIND the role (Crucial step)
    const editorRole = await Role.findOne({ name: "editor" });
    if (!editorRole) {
      return res
        .status(500)
        .json({ error: "Roles not initialized in database" });
    }

    // 3. CREATE the user AND assign the role ID explicitly
    const user = new User({
      email,
      password,
      name,
      role: editorRole._id, // <--- THIS attaches the ID so MongoDB accepts the save
    });

    // 4. SAVE to MongoDB
    await user.save();

    // 5. Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: editorRole.name, // Return the string name for frontend use
      },
    });
  } catch (error) {
    // This will now catch any database validation errors
    console.error("Registration Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
