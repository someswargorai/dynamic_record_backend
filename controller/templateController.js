const templateService = require("../services/templateService");

const createTemplate = async (req, res) => {
  try {
    // Only admins can create templates
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create templates" });
    }

    const adminId = req.user.id;
    const templateData = req.body;

    const newTemplate = await templateService.createTemplate(adminId, templateData);
    res.status(201).json({ message: "Template created successfully", template: newTemplate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    // If the user is an admin, fetch their own templates.
    // If the user is an employee, fetch templates belonging to their parent Admin.
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    
    if (!adminId) {
       return res.status(400).json({ message: "Unable to determine admin context" });
    }

    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await templateService.getTemplates(adminId, search, page, limit, req.user.role, req.user.email);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const adminId = req.user.role === "admin" ? req.user.id : req.user.parentId;
    if (!adminId) return res.status(400).json({ message: "Unable to determine admin context" });

    const template = await templateService.getTemplateById(req.params.id, adminId);
    if (!template) return res.status(404).json({ message: "Template not found" });

    // Optional: If employee, check if they have access
    if (req.user.role === "employee") {
      const hasAccess = template.access.some(acc => acc.email === req.user.email);
      if (!hasAccess || template.status !== "active") {
        return res.status(403).json({ message: "You do not have access to this template" });
      }
    }

    res.status(200).json({ template });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTemplateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can modify templates" });

    const updatedTemplate = await templateService.updateTemplateStatus(req.params.id, req.user.id, req.body.status);
    if (!updatedTemplate) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template status updated", template: updatedTemplate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can delete templates" });

    const deletedTemplate = await templateService.deleteTemplate(req.params.id, req.user.id);
    if (!deletedTemplate) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can modify templates" });

    const updatedTemplate = await templateService.updateTemplate(req.params.id, req.user.id, req.body);
    if (!updatedTemplate) return res.status(404).json({ message: "Template not found" });

    res.status(200).json({ message: "Template updated successfully", template: updatedTemplate });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
