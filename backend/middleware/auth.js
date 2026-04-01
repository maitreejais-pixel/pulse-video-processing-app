const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

module.exports = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.query.token;
    if (!token) return res.status(401).json({ error: "Access denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id)
      .populate("role") // 👈 POPULATE ROLE DATA
      .select("-password");

    if (!req.user) return res.status(401).json({ error: "User not found" });

    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// 👇 NEW: Role-based permission check
module.exports.requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role?.name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Role '${userRole}' not authorized. Requires: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};

// 👇 NEW: Permission check
module.exports.requirePermission = (resource, action) => {
  return (req, res, next) => {
    const permissions = req.user.role?.permissions || [];
    const hasPermission = permissions.some(
      (p) =>
        p.resource === resource ||
        (p.resource === "*" &&
          (p.actions.includes(action) || p.actions.includes("*"))),
    );

    if (!hasPermission) {
      return res
        .status(403)
        .json({ error: `No permission for ${resource}:${action}` });
    }
    next();
  };
};
