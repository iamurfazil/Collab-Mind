const { saveUser } = require('./userService');
const { z } = require('zod');
const {
  generateOtp,
  saveOtp,
  verifyOtp,
  canSendOtp,
  sendOtpEmail,
} = require('./otp.service');

// ─── Existing /me endpoint ──────────────────────────────────────────
async function me(req, res) {
  try {
    const user = await saveUser({
      ...req.user,
      ...req.body,
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─── Zod schemas ────────────────────────────────────────────────────
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

// ─── POST /api/auth/send-otp ────────────────────────────────────────
async function sendOtp(req, res) {
  console.log('[OTP] CONTROLLER: sendOtp called for email:', req.body?.email);
  try {
    // Validate input
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors,
      });
    }

    const { email } = parsed.data;

    // Rate-limit check
    const allowed = await canSendOtp(email);
    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 60 seconds before requesting another OTP.',
      });
    }

    // Generate, save, and send
    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    console.log(`[OTP] Sent to ${email}`);
    return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('[OTP] send-otp error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
}

// ─── POST /api/auth/verify-otp ──────────────────────────────────────
async function verifyOtpHandler(req, res) {
  try {
    // Validate input
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors,
      });
    }

    const { email, otp } = parsed.data;
    const isValid = await verifyOtp(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('[OTP] verify-otp error:', error.message);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
}

module.exports = { me, sendOtp, verifyOtpHandler };
