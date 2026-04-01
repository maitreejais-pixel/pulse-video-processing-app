const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["viewer", "editor", "admin"],
      unique: true,
    },
    description: String,
    permissions: [
      {
        resource: String, // 'videos', 'users', 'settings'
        actions: [String], // 'read', 'create', 'update', 'delete'
      },
    ],
    organization: {
      type: String,
      default: "default-org",
    },
  },
  { timestamps: true },
);

// Static method: Get role by name
roleSchema.statics.findByName = function (name, organization = "default-org") {
  return this.findOne({ name, organization });
};

module.exports = mongoose.model("Role", roleSchema);
