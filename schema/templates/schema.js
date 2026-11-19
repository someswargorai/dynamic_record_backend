const mongoose = require("mongoose");

const AccessUserSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const CustomFieldSchema = new mongoose.Schema({
  id: { type: String },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["text", "textarea", "dropdown", "radio", "multiselect"], 
    required: true 
  },
  options: { type: [String], default: [] },
  required: { type: Boolean, default: false }
}, { _id: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

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
  cameraAccess: {
    type: Boolean,
    default: false
  },
  access: [AccessUserSchema],
  fields: [CustomFieldSchema]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

TemplateSchema.index({ name: 'text' });

module.exports = mongoose.model("Template", TemplateSchema);
