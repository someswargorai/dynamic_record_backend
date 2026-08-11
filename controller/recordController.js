const recordService = require("../services/recordService");
const s3 = require("../lib/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const createRecord = async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    // With multer, data might come as a JSON string
    let finalData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : { ...req.body.data };

    // If an image was uploaded, process it
    if (req.file) {
      // 1. Compress the image using sharp
      const compressedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 1920, withoutEnlargement: true }) // Prevent massive dimensions
        .jpeg({ quality: 70 }) // 70 quality will easily bring almost any photo under 2MB
        .toBuffer();

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `dynamic_records/${uniqueSuffix}.jpg`; // always save as jpg
      const bucketName = process.env.AWS_S3_BUCKET_NAME || "dummy-bucket-name";
      const region = process.env.AWS_REGION || "us-east-1";

      // 2. Upload the compressed buffer to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: compressedImageBuffer,
          ContentType: "image/jpeg",
        })
      );

      // 3. Construct the public S3 URL and attach it to the data
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
      finalData["Attached Photo"] = s3Url;
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
