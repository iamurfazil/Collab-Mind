const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { db } = require('../../config/firebaseAdmin');

const OTP_COLLECTION = 'otp_codes';
const OTP_TTL_MINUTES = 5;
const OTP_COOLDOWN_SECONDS = 60; // minimum gap between OTP requests per email

// ─── Initialise SendGrid ────────────────────────────────────────────
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'team@collabmind.in';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('[OTP] SERVICE: Initialized V2 with SendGrid API Key');
} else {
  console.warn('[OTP] SERVICE: SENDGRID_API_KEY is not set in environment – OTP emails will not be sent.');
}

// ─── Generate a cryptographically-random 6-digit OTP ────────────────
function generateOtp() {
  // crypto.randomInt is available in Node 18+
  return String(crypto.randomInt(100000, 999999));
}

// ─── Persist OTP in Firestore ───────────────────────────────────────
async function saveOtp(email, otp) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  const docRef = await db.collection(OTP_COLLECTION).add({
    email: email.toLowerCase().trim(),
    otp,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return docRef.id;
}

// ─── Verify OTP ─────────────────────────────────────────────────────
async function verifyOtp(email, otp) {
  const normalised = email.toLowerCase().trim();

  // Fetch all OTPs for this email to avoid composite index requirement
  const snap = await db
    .collection(OTP_COLLECTION)
    .where('email', '==', normalised)
    .get();

  if (snap.empty) {
    return false;
  }

  // Find the most recent one in memory to avoid needing a Firestore index
  const docs = snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
  docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const data = docs[0];

  // Check expiry
  if (new Date(data.expiresAt) < new Date()) {
    // Expired – clean up
    await data.ref.delete();
    return false;
  }

  // Check match
  if (data.otp !== otp) {
    return false;
  }

  // Valid – delete all OTP docs for this email (cleanup)
  const allDocs = await db
    .collection(OTP_COLLECTION)
    .where('email', '==', normalised)
    .get();

  const batch = db.batch();
  allDocs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  return true;
}

// ─── Rate-limit check (1 OTP per COOLDOWN_SECONDS per email) ────────
async function canSendOtp(email) {
  const normalised = email.toLowerCase().trim();
  const cutoff = new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000).toISOString();

  const snap = await db
    .collection(OTP_COLLECTION)
    .where('email', '==', normalised)
    .get();

  if (snap.empty) return true;

  // Check in memory
  const recentOtp = snap.docs.find(d => {
    const data = d.data();
    return data.createdAt > cutoff;
  });

  return !recentOtp; // true = no recent OTP, safe to send
}

// ─── Send OTP email via SendGrid ────────────────────────────────────
async function sendOtpEmail(email, otp) {
  const msg = {
    to: email,
    from: EMAIL_FROM,
    subject: 'Your Collab-Mind Verification Code',
    text: `Your OTP is ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #f0f0f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f97316; margin: 0; font-size: 24px;">Collab-Mind</h1>
        </div>
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Enter the code below to verify your email address. This code will expire in <strong>${OTP_TTL_MINUTES} minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; background: #f3f4f6; padding: 16px 32px; border-radius: 12px; border: 2px dashed #d1d5db;">
            ${otp}
          </span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    if (!SENDGRID_API_KEY) {
       // Fallback for dev if no key - just log it
       console.log(`[OTP DEBUG] No SendGrid API key. OTP for ${email} is ${otp}`);
       return;
    }
    await sgMail.send(msg);
    console.log(`[OTP] Email sent to ${email}`);
  } catch (error) {
    console.error('[OTP] SendGrid Error:', error.response?.body || error.message);
    throw new Error('Email service failure');
  }
}

module.exports = {
  generateOtp,
  saveOtp,
  verifyOtp,
  canSendOtp,
  sendOtpEmail,
};
