const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER, // must be "apikey"
    pass: process.env.EMAIL_PASS, // your SendGrid API key
  },
});
exports.sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await transporter.sendMail({
      from: '"Collab Mind" <team@collabmind.in>',
      to: email,
      subject: 'Your OTP - Collab Mind',
      html: `<h3>Your OTP is ${otp}</h3>`
    });

    console.log("OTP sent:", otp);

    return otp;
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send OTP");
  }
};