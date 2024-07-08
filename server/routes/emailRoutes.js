const express = require("express");
const router = express.Router();
const createTransporter = require("../mailer");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");

router.post("/submit-email", async (req, res) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      return res
        .status(500)
        .send({ message: "Failed to create email transporter." });
    }

    const { email } = req.body;
    const verificationToken = uuid();

    // 读取 HTML 模板文件
    const emailTemplatePath = path.join(__dirname, "emailTemple.html");
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

    // 替换模板中的占位符
    emailTemplate = emailTemplate.replace(/{{token}}/g, verificationToken);

    const mailOptions = {
      from: `Yifan Yu<yifanoxo@gmail.com>`,
      to: email,
      subject: "Email Verification / 邮箱订阅验证 - Yifanovo",
      html: emailTemplate, // 使用 HTML 内容替换文本内容
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: "Verification email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error sending verification email.",
      error: error.message,
    });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  res.send("Email verified successfully!");
});

module.exports = router;
