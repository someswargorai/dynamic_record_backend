const recordService = require("../services/recordService");

const createRecord = async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    const recordData = {
      templateId: req.body.templateId,
      adminId: adminId,
      submittedBy: req.user.id,
      submitterName: req.user.name || "Unknown",
      submitterEmail: req.user.email,
      data: req.body.data
    };

    const newRecord = await recordService.createRecord(recordData);
    res.status(201).json({ message: "Record submitted successfully", record: newRecord });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRecords = async (req, res) => {
  try {
    // Only admins or whoever is authorized. 
    // In this case, maybe admins get all their records. 
    // If we want employees to see "My Records", we'll filter differently. For now, we fetch by admin.
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    let records = await recordService.getRecordsByAdmin(adminId);

    // If it's an employee, maybe they only see their own submitted records
    if (req.user.role === "employee") {
      records = records.filter(r => r.submittedBy.toString() === req.user.id);
    }

    res.status(200).json({ records });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords
};
