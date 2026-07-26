const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route, only admin can create employees
router.post("/", authMiddleware, employeeController.createEmployee);

// Protected route to get employees based on parentId (data isolation)
router.get("/", authMiddleware, employeeController.getEmployees);

module.exports = router;
