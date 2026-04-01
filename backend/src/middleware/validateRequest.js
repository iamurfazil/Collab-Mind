function validateRequest(schema) {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next();
  };
}

module.exports = { validateRequest };
