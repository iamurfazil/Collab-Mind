const express = require('express');

const router = express.Router();

router.all('/test-db', (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Deprecated route',
  });
});

module.exports = router;
