const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendCredentialsEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Employee Account Credentials",
    text: `Hello,\n\nYour account has been created successfully. Here are your login credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest Regards,\nAdmin Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Credentials email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}: `, error);
  }
};

module.exports = {
  sendCredentialsEmail
};
