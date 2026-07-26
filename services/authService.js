const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../schema/admin/schema");
const Employee = require("../schema/employees/schema");

const login = async (email, password) => {
  let user = await Admin.findOne({ email });
  let role = "admin";
  let userType = "admin";

  if (!user) {
    user = await Employee.findOne({ employee_email: email });
    role = "employee";
    userType = "employee";
  }

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  if (role === "employee" && user.status === "inactive") {
    throw new Error("Account is inactive");
  }

  const tokenPayload = {
    id: user._id,
    role,
    email: role === "admin" ? user.email : user.employee_email
  };

  // If the user is an employee, store their parentId (Admin's ID) in the token
  // to avoid querying the DB for it on every protected request.
  if (role === "employee") {
    tokenPayload.parentId = user.parentId;
  }

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1d" }
  );

  return { token, role, user };
};

module.exports = {
  login
};
