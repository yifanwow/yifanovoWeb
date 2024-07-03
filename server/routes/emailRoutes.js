const express = require('express');
const router = express.Router();
const createTransporter = require('../mailer');
const uuid = require('uuid').v4;

router.post('/submit-email', async (req, res) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      return res.status(500).send({ message: 'Failed to create email transporter.' });
    }

    const { email } = req.body;
    const verificationToken = uuid();
    const mailOptions = {
      from: `Yifan Yu<yifanoxo@gmail.com>`,
      to: email,
      subject: 'Email Verification-Yifanovo',
      text: `您好，感谢您的关注！\n\n请点击以下链接以验证您的邮箱地址以激活关注：https://yifanovo.info，如果您没有订阅，请忽略此邮件。\n\nHi, thank you for your interest! \n\nPlease click on the following link to verify your email: https://yifanovo.info, if you are not subscribed, please ignore this email.\n\n-饭饭 Yifan Yu\nhttps://yifanovo.info`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: 'Verification email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error sending verification email.', error: error.message });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  res.send('Email verified successfully!');
});

module.exports = router;
