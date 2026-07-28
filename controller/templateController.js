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

    const templates = await templateService.getTemplates(adminId);
    
    // Optionally filter templates by employee email in 'access' list if user is an employee
    // Wait, the user said "admin can give access to that employee". 
    // We can filter here or let frontend do it. Filtering here is better.
    let filteredTemplates = templates;
    if (req.user.role === "employee") {
      // Filter templates to only those where the employee's email is in the access list,
      // OR if you want employees to see all active templates by default.
      // Based on UI, the admin specifically gives access by name/email.
      filteredTemplates = templates.filter(t => 
        t.status === "active" && 
        t.access.some(acc => acc.email === req.user.email)
      );
    }

    res.status(200).json({ templates: filteredTemplates });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTemplate,
  getTemplates
};
