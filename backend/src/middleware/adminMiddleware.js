const { db } = require('../config/firebaseAdmin');

async function requireAdmin(req, res, next) {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const snapshot = await db.collection('users').doc(uid).get();
    const role = snapshot.exists ? snapshot.data()?.role : req.user.role;

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify admin access' });
  }
}

module.exports = { requireAdmin };