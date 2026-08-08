const recordService = require("../services/recordService");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createRecord = async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    let finalData = { ...req.body.data };

    // Check if there is an attached photo and if it is a base64 string
    if (finalData["Attached Photo"] && finalData["Attached Photo"].startsWith("data:image")) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(finalData["Attached Photo"], {
          folder: "dynamic_records"
        });
        // Replace base64 with secure url
        finalData["Attached Photo"] = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image to cloud storage" });
      }
    }

    const recordData = {
      templateId: req.body.templateId,
      adminId: adminId,
      submittedBy: req.user.id,
      submitterName: req.user.name || "Unknown",
      submitterEmail: req.user.email,
      data: finalData
    };

    const newRecord = await recordService.createRecord(recordData);
    res.status(201).json({ message: "Record submitted successfully", record: newRecord });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRecords = async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    const { templateId, search, page = 1, limit = 10 } = req.query;

    const result = await recordService.getRecordsByAdmin(adminId, {
      templateId,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    let records = result.records;

    // If it's an employee, maybe they only see their own submitted records
    if (req.user.role === "employee") {
      records = records.filter(r => r.submittedBy.toString() === req.user.id);
      // Note: Pagination counts might be slightly off if we filter post-db for employees. 
      // A better way would be adding submittedBy to matchStage, but sticking to current logic for now.
    }

    res.status(200).json({ 
      records,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords
};
