const Record = require("../schema/records/schema");

const createRecord = async (recordData) => {
  try {
    const newRecord = new Record(recordData);
    return await newRecord.save();
  } catch (error) {
    throw new Error("Failed to save record: " + error.message);
  }
};

const getRecordsByAdmin = async (adminId) => {
  try {
    return await Record.find({ adminId })
      .populate("templateId", "name image") // get basic template details
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Failed to fetch records: " + error.message);
  }
};

module.exports = {
  createRecord,
  getRecordsByAdmin
};
