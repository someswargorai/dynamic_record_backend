const recordService = require("../services/recordService");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createRecord = async (req, res) => {
  try {
    let adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId && req.user.role === "employee") {
      const Employee = require("../schema/employees/schema");
      const emp = await Employee.findById(req.user.id).lean();
      if (emp && emp.parentId) {
        adminId = emp.parentId;
      }
    }
    if (!adminId) {
      return res.status(400).json({ message: "Unable to determine admin context for this account." });
    }

    let templateId = req.body.templateId;
    let finalData = req.body.data;

    // Handle stringified data if sent via FormData or raw payload
    if (typeof finalData === "string") {
      try {
        finalData = JSON.parse(finalData);
      } catch (parseErr) {
        return res.status(400).json({ message: "Invalid JSON format for record data." });
      }
    }

    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required." });
    }

    if (!finalData || typeof finalData !== "object") {
      return res.status(400).json({ message: "Record data is required." });
    }

    // Determine submitter name reliably
    let submitterName = req.user.name || req.user.employee_name || req.user.company_name;
    if (!submitterName || submitterName === "Unknown") {
      if (req.user.role === "employee") {
        const Employee = require("../schema/employees/schema");
        const emp = await Employee.findById(req.user.id).lean();
        submitterName = emp?.employee_name || req.user.email?.split("@")[0] || "Employee";
      } else {
        const Admin = require("../schema/admin/schema");
        const admin = await Admin.findById(req.user.id).lean();
        submitterName = admin?.company_name || req.user.email?.split("@")[0] || "Admin";
      }
    }

    // Check if there is an attached photo and if it is a base64 string
    if (finalData["Attached Photo"] && typeof finalData["Attached Photo"] === "string" && finalData["Attached Photo"].startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(finalData["Attached Photo"], {
          folder: "dynamic_records",
          resource_type: "image",
          timeout: 45000
        });
        finalData["Attached Photo"] = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image to cloud storage: " + (uploadError.message || "Timeout") });
      }
    }

    const recordData = {
      templateId,
      adminId,
      submittedBy: req.user.id,
      submitterName,
      submitterEmail: req.user.email,
      data: finalData
    };

    const newRecord = await recordService.createRecord(recordData);
    res.status(201).json({ message: "Record submitted successfully", record: newRecord });
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(400).json({ message: error.message || "Failed to create record" });
  }
};

const getRecords = async (req, res) => {
  try {
    let adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId && req.user.role === "employee") {
      const Employee = require("../schema/employees/schema");
      const emp = await Employee.findById(req.user.id).lean();
      if (emp && emp.parentId) {
        adminId = emp.parentId;
      }
    }
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    const { templateId, search, page = 1, limit = 10 } = req.query;
    const submittedBy = req.user.role === "employee" ? req.user.id : null;

    const result = await recordService.getRecordsByAdmin(adminId, {
      templateId,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      submittedBy
    });

    res.status(200).json({ 
      records: result.records,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    let adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId && req.user.role === "employee") {
      const Employee = require("../schema/employees/schema");
      const emp = await Employee.findById(req.user.id).lean();
      if (emp && emp.parentId) {
        adminId = emp.parentId;
      }
    }
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    const recordId = req.params.id;
    let finalData = req.body.data;

    if (typeof finalData === "string") {
      try {
        finalData = JSON.parse(finalData);
      } catch (parseErr) {
        return res.status(400).json({ message: "Invalid JSON format for record data." });
      }
    }

    if (!finalData || typeof finalData !== "object") {
      return res.status(400).json({ message: "Record data is required." });
    }

    // Check if there is an attached photo and if it is a new base64 string
    if (finalData["Attached Photo"] && typeof finalData["Attached Photo"] === "string" && finalData["Attached Photo"].startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(finalData["Attached Photo"], {
          folder: "dynamic_records",
          resource_type: "image",
          timeout: 45000
        });
        finalData["Attached Photo"] = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image to cloud storage: " + (uploadError.message || "Timeout") });
      }
    }

    const updatedRecord = await recordService.updateRecordById(recordId, { data: finalData });
    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ message: "Record updated successfully", record: updatedRecord });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const deletedRecord = await recordService.deleteRecordById(recordId);
    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
};
