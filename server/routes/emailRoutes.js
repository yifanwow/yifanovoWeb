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
      from: `Yifan Yu <yifanoxo@gmail.com>`,
      to: email,
      subject: 'Email Verification',
      text: `Hello world.`
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
