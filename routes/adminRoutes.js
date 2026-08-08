const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/profile", adminController.getProfile);
router.put("/profile/google-drive", adminController.updateGoogleDriveCredentials);

module.exports = router;
