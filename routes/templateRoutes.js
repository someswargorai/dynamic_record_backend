const express = require("express");
const router = express.Router();
const templateController = require("../controller/templateController");
const authMiddleware = require("../middleware/authMiddleware");

// Require authentication for all template routes
router.use(authMiddleware);

router.post("/", templateController.createTemplate);
router.get("/", templateController.getTemplates);

module.exports = router;
