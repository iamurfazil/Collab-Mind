const service = require('./service');

async function postRequest(req, res, next) {
  try {
    const { ideaId, ideaTitle } = req.body;
    const data = await service.createPatentRequest(req.user.uid, {
        ideaId,
        userName: req.user.name || req.user.displayName,
        email: req.user.email,
        ideaTitle
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getMyRequests(req, res, next) {
  try {
    const data = await service.getPatentRequestsByUser(req.user.uid);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postRequest,
  getMyRequests
};
