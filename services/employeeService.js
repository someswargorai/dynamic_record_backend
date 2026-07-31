const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Employee = require("../schema/employees/schema");
const { sendCredentialsEmail } = require("./emailService");

const createEmployee = async (employeeData, parentId) => {
  const { employee_name, employee_email, employee_address, status } = employeeData;

  const existingEmployee = await Employee.findOne({ employee_email });
  if (existingEmployee) {
    throw new Error("Employee with this email already exists");
  }

  const generatedPassword = crypto.randomBytes(6).toString("hex");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(generatedPassword, salt);

  const newEmployee = new Employee({
    employee_name,
    employee_email,
    password: hashedPassword,
    employee_address,
    status: status || "active",
    parentId
  });

  await newEmployee.save();

  sendCredentialsEmail(employee_email, generatedPassword);

  return newEmployee;
};

const getEmployeesByParentId = async (parentId, skip = 0, limit = 10) => {
  // Return all employees that belong to this admin (parentId)
  // Exclude password from the results for security
  const employees = await Employee.find({ parentId })
    .select("-password")
    .skip(skip)
    .limit(limit);
    
  const totalEmployees = await Employee.countDocuments({ parentId });
  
  return { employees, totalEmployees };
};

const updateEmployee = async (employeeId, parentId, updateData) => {
  const { employee_name, employee_email, employee_address } = updateData;

  const employee = await Employee.findOneAndUpdate(
    { _id: employeeId, parentId },
    { employee_name, employee_email, employee_address },
    { new: true }
  ).select("-password");

  if (!employee) {
    throw new Error("Employee not found or unauthorized");
  }

  return employee;
};

const toggleEmployeeStatus = async (employeeId, parentId) => {
  const employee = await Employee.findOne({ _id: employeeId, parentId });

  if (!employee) {
    throw new Error("Employee not found or unauthorized");
  }

  employee.status = employee.status === "active" ? "inactive" : "active";
  await employee.save();

  return { id: employee._id, status: employee.status };
};

const deleteEmployee = async (employeeId, parentId) => {
  const employee = await Employee.findOneAndDelete({ _id: employeeId, parentId });

  if (!employee) {
    throw new Error("Employee not found or unauthorized");
  }

  return { id: employeeId, message: "Employee deleted successfully" };
};

module.exports = {
  createEmployee,
  getEmployeesByParentId,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee
};
