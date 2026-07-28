const Template = require("../schema/templates/schema");

const createTemplate = async (adminId, templateData) => {
  try {
    const newTemplate = new Template({
      ...templateData,
      adminId
    });
    return await newTemplate.save();
  } catch (error) {
    throw new Error("Failed to create template: " + error.message);
  }
};

const getTemplates = async (adminId) => {
  try {
    return await Template.find({ adminId }).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Failed to fetch templates: " + error.message);
  }
};

module.exports = {
  createTemplate,
  getTemplates
};
