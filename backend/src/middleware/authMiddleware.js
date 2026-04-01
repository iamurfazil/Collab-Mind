function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  return next();
}

module.exports = { requireAuth };
