const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Public login route for both admin and employees
router.post("/login", authController.login);

module.exports = router;
