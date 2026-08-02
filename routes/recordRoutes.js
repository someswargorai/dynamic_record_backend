const express = require("express");
const router = express.Router();
const recordController = require("../controller/recordController");
const authMiddleware = require("../middleware/authMiddleware");

// All record routes require authentication
router.use(authMiddleware);

router.post("/", recordController.createRecord);
router.get("/", recordController.getRecords);

module.exports = router;
