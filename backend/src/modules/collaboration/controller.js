const service = require('./service');

async function postRequest(req, res, next) {
  try {
    const { ideaId, answer } = req.body || {};
    const data = await service.createRequest({
      requester: req.user,
      ideaId,
      answer,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
}

async function getRequests(req, res, next) {
  try {
    const scope = req.query.scope === 'requester' ? 'requester' : 'owner';
    const data = await service.listRequestsForUser({
      userId: req.user.uid,
      scope,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function patchRequestStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    const data = await service.updateRequestStatus({
      requestId: req.params.id,
      ownerId: req.user.uid,
      status,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
}

module.exports = {
  postRequest,
  getRequests,
  patchRequestStatus,
};
