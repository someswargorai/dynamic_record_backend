const employeeService = require("../services/employeeService");

const createEmployee = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create employees." });
    }

    const parentId = req.user.id;
    const employeeData = req.body;

    const newEmployee = await employeeService.createEmployee(employeeData, parentId);

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        id: newEmployee._id,
        employee_name: newEmployee.employee_name,
        employee_email: newEmployee.employee_email
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    // If the logged-in user is an admin, their own ID is the parentId.
    // If it's an employee, the parentId is in their token payload.
    const parentId = req.user.role === "admin" ? req.user.id : req.user.parentId;

    if (!parentId) {
      return res.status(400).json({ message: "Invalid user configuration, parentId missing." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { employees, totalEmployees } = await employeeService.getEmployeesByParentId(parentId, skip, limit);
    
    res.status(200).json({ 
      employees,
      limit,
      page,
      total: totalEmployees,
      totalPage: Math.ceil(totalEmployees / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees
};
