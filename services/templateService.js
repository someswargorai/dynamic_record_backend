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

const getTemplates = async (adminId, search, page = 1, limit = 10, userRole, userEmail) => {
  try {
    const query = { adminId };
    if (search) {
      query.$text = { $search: search };
    }
    
    // Apply employee filter directly to query
    if (userRole === "employee") {
      query.status = "active";
      query["access.email"] = userEmail;
    }

    const skip = (page - 1) * limit;

    const [templates, totalItems] = await Promise.all([
      Template.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Template.countDocuments(query)
    ]);

    return { 
      templates, 
      totalItems, 
      currentPage: Number(page), 
      totalPages: Math.ceil(totalItems / limit) 
    };
  } catch (error) {
    throw new Error("Failed to fetch templates: " + error.message);
  }
};

const getTemplateById = async (id, adminId) => {
  try {
    return await Template.findOne({ _id: id, adminId });
  } catch (error) {
    throw new Error("Failed to fetch template: " + error.message);
  }
};

const updateTemplateStatus = async (id, adminId, status) => {
  try {
    return await Template.findOneAndUpdate(
      { _id: id, adminId },
      { status },
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to update template status: " + error.message);
  }
};

const updateTemplate = async (id, adminId, templateData) => {
  try {
    return await Template.findOneAndUpdate(
      { _id: id, adminId },
      templateData,
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to update template: " + error.message);
  }
};

const deleteTemplate = async (id, adminId) => {
  try {
    return await Template.findOneAndDelete({ _id: id, adminId });
  } catch (error) {
    throw new Error("Failed to delete template: " + error.message);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplateStatus,
  updateTemplate,
  deleteTemplate
};
