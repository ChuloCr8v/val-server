require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.options("*", cors());

app.use(cors());
// Create a Nodemailer transporter using your email provider settings.
// In this example, we're using Gmail.
const transporter = nodemailer.createTransport({
  service: "gmail", // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password from .env
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

// API endpoint to send email
app.post("/send-email", async (req, res) => {
  // Extract required fields from the request body
  const { to, subject, phrase, html } = req.body;
  res.header("Access-Control-Allow-Origin", "*");

  // Basic validation
  if (!to || !subject || (!phrase && !html)) {
    return res.status(400).json({
      message: "Missing required fields: to, subject, and either text or html",
    });
  }

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to, // recipient(s)
    subject, // email subject
    text: phrase, // plain text body (optional)
    html, // HTML body (optional)
  };

  try {
    // Send email using the transporter
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
