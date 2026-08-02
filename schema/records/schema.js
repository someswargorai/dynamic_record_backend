const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    // Can be either admin or employee, so we don't strictly ref one or we can just rely on the ID.
    required: true
  },
  submitterName: {
    type: String,
    required: true
  },
  submitterEmail: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Record", recordSchema);
