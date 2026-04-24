const service = require('./service');

async function createRequest(req, res) {
  try {
    const { ideaId, answer } = req.body || {};
    const data = await service.createRequest({
      requester: req.user,
      ideaId,
      answer,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function listRequests(req, res) {
  try {
    const scope = req.query.scope === 'requester' ? 'requester' : 'owner';
    const data = await service.listRequestsForUser({
      userId: req.user.uid,
      scope,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateRequest(req, res) {
  try {
    const { status } = req.body || {};
    const data = await service.updateRequestStatus({
      requestId: req.params.id,
      ownerId: req.user.uid,
      status,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  createRequest,
  listRequests,
  updateRequest,
};
