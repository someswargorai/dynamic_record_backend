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

module.exports = {
  createEmployee,
  getEmployeesByParentId
};
