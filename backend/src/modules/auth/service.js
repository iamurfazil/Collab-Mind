const nodemailer = require('nodemailer');

const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const cleanupExpiredOtps = () => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (!value || value.expiresAt <= now) {
      otpStore.delete(key);
    }
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.EMAIL_PASS, // your SendGrid API key
  },
});
exports.sendOtp = async (email) => {
  cleanupExpiredOtps();
  const normalizedEmail = normalizeEmail(email);
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await transporter.sendMail({
      from: '"Collab Mind" <team@collabmind.in>',
      to: email,
      subject: 'Your OTP - Collab Mind',
      html: `<h3>Your OTP is ${otp}</h3>`
    });

    otpStore.set(normalizedEmail, {
      otp: String(otp),
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    console.log("OTP sent:", otp);

    return otp;
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send OTP");
  }
};

exports.verifyOtp = (email, otp) => {
  cleanupExpiredOtps();

  const normalizedEmail = normalizeEmail(email);
  const entry = otpStore.get(normalizedEmail);
  if (!entry) {
    return { ok: false, message: 'OTP expired or not found. Please request a new OTP.' };
  }

  if (entry.expiresAt <= Date.now()) {
    otpStore.delete(normalizedEmail);
    return { ok: false, message: 'OTP expired. Please request a new OTP.' };
  }

  if (String(entry.otp) !== String(otp)) {
    return { ok: false, message: 'Invalid OTP. Please try again.' };
  }

  otpStore.delete(normalizedEmail);
  return { ok: true };
};