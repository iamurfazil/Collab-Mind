const service = require('./service');

async function postFeedback(req, res, next) {
  try {
    const { name, email, message } = req.body;
    const data = await service.createFeedback({ name, email, message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getAdminFeedback(req, res, next) {
  try {
    const data = await service.getAllFeedback();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function patchAdminFeedback(req, res, next) {
  try {
    const { status } = req.body;
    const data = await service.updateFeedbackStatus(req.params.id, status);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postFeedback,
  getAdminFeedback,
  patchAdminFeedback
};
