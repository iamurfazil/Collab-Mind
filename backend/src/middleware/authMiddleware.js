const { admin } = require('../config/firebaseAdmin');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    console.log('REQ.USER VERIFIED:', req.user);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
