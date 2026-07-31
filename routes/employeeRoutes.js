const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route, only admin can create employees
router.post("/", authMiddleware, employeeController.createEmployee);

// Protected route to get employees based on parentId (data isolation)
router.get("/", authMiddleware, employeeController.getEmployees);
// Protected route to edit an employee
router.put("/:id", authMiddleware, employeeController.editEmployee);

// Protected route to toggle an employee's status
router.patch("/:id/status", authMiddleware, employeeController.toggleEmployeeStatus);

// Protected route to delete an employee
router.delete("/:id", authMiddleware, employeeController.deleteEmployee);

module.exports = router;
