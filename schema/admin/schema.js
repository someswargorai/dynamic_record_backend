const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  googleDriveCredentials: {
    clientId: { type: String, default: "" },
    clientSecret: { type: String, default: "" }
  }
});

module.exports = mongoose.model("Admin", AdminSchema);
