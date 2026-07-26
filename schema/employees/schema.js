const mongoose = require("mongoose");

const Employee = new mongoose.Schema({
  employee_name: {
    type: String,
    require: true,
  },
  employee_email: {
    type: String,
    require: true,
  },
  password:{
    type: String,
    require: true
  },
  employee_address: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  parentId:{
    type: mongoose.Schema.Types.ObjectId,
    require: true
  }
});

Employee.index({parentId: 1});

module.exports = mongoose.model("Employees", Employee);