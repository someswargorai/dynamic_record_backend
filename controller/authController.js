const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { token, role, user } = await authService.login(email, password);

    res.status(200).json({
      message: "Login successful",
      token,
      role,
      user: {
        id: user._id,
        email: role === "admin" ? user.email : user.employee_email,
        role: role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login
};
