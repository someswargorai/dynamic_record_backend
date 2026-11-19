const Template = require("../schema/templates/schema");

const normalizeFields = (fields) => {
  if (!Array.isArray(fields)) return [];
  return fields.map((f) => {
    const fieldId = f.id || (f._id ? f._id.toString() : undefined);
    return {
      ...(f._id ? { _id: f._id } : {}),
      id: fieldId,
      label: f.label || "",
      type: f.type || "text",
      options: Array.isArray(f.options) ? f.options : [],
      required: Boolean(f.required)
    };
  });
};

const normalizeAccess = (access) => {
  if (!Array.isArray(access)) return [];
  return access.map((a) => ({
    ...(a._id ? { _id: a._id } : {}),
    id: a.id || (a._id ? a._id.toString() : undefined),
    name: a.name || "",
    email: a.email || ""
  }));
};

const formatTemplateDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.id || (obj._id ? obj._id.toString() : undefined);
  if (Array.isArray(obj.fields)) {
    obj.fields = obj.fields.map((f) => ({
      ...f,
      id: f.id || (f._id ? f._id.toString() : undefined),
      options: Array.isArray(f.options) ? f.options : [],
      required: Boolean(f.required)
    }));
  }
  if (Array.isArray(obj.access)) {
    obj.access = obj.access.map((a) => ({
      ...a,
      id: a.id || (a._id ? a._id.toString() : undefined)
    }));
  }
  return obj;
};

const createTemplate = async (adminId, templateData) => {
  try {
    const dataToSave = { ...templateData, adminId };
    if (dataToSave.fields) {
      dataToSave.fields = normalizeFields(dataToSave.fields);
    }
    if (dataToSave.access) {
      dataToSave.access = normalizeAccess(dataToSave.access);
    }
    const newTemplate = new Template(dataToSave);
    const saved = await newTemplate.save();
    return formatTemplateDoc(saved);
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

    const [templatesDocs, totalItems] = await Promise.all([
      Template.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Template.countDocuments(query)
    ]);

    const templates = templatesDocs.map((t) => formatTemplateDoc(t));

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
    const template = await Template.findOne({ _id: id, adminId });
    return template ? formatTemplateDoc(template) : null;
  } catch (error) {
    throw new Error("Failed to fetch template: " + error.message);
  }
};

const updateTemplateStatus = async (id, adminId, status) => {
  try {
    const updated = await Template.findOneAndUpdate(
      { _id: id, adminId },
      { status },
      { new: true }
    );
    return updated ? formatTemplateDoc(updated) : null;
  } catch (error) {
    throw new Error("Failed to update template status: " + error.message);
  }
};

const updateTemplate = async (id, adminId, templateData) => {
  try {
    const dataToUpdate = { ...templateData };
    if (dataToUpdate.fields) {
      dataToUpdate.fields = normalizeFields(dataToUpdate.fields);
    }
    if (dataToUpdate.access) {
      dataToUpdate.access = normalizeAccess(dataToUpdate.access);
    }
    const updated = await Template.findOneAndUpdate(
      { _id: id, adminId },
      dataToUpdate,
      { new: true }
    );
    return updated ? formatTemplateDoc(updated) : null;
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
