const multer = require("multer");

// Store the incoming file in a memory buffer so Sharp can process it
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
