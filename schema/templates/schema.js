const mongoose = require("mongoose");

const AccessUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: true });

const CustomFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["text", "textarea", "dropdown", "radio", "multiselect"], 
    required: true 
  },
  options: [{ type: String }],
  required: { type: Boolean, default: false }
}, { _id: true });

const TemplateSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  name: {
    type: String,
    required: true,
    default: "Untitled template"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  image: {
    type: String, // Can store base64 string or URL
    default: null
  },
  imageHeight: {
    type: Number,
    default: 220
  },
  access: [AccessUserSchema],
  fields: [CustomFieldSchema]
}, { timestamps: true });

TemplateSchema.index({ name: 'text' });

module.exports = mongoose.model("Template", TemplateSchema);
