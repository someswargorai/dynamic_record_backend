const Admin = require("../schema/admin/schema");

const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoogleDriveCredentials = async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update credentials" });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "googleDriveCredentials.clientId": clientId,
          "googleDriveCredentials.clientSecret": clientSecret
        }
      },
      { new: true }
    ).select("-password");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Credentials updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateGoogleDriveCredentials
};
