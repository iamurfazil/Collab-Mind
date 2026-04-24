const {
  createIdea,
  getAllIdeas,
  getIdeasByUser,
  updateIdeaById,
  deleteIdeaById,
  requestPatentById,
} = require('../../services/ideaService');
const { queueEmail } = require('../../services/emailService');

function mapErrorToStatus(error) {
  if (!error?.message) return 500;
  if (error.message.includes('not found')) return 404;
  if (error.message.includes('not allowed') || error.message.includes('Only the idea owner')) return 403;
  if (error.message.includes('required')) return 400;
  return 500;
}

async function listIdeas(req, res, next) {
  try {
    const ideas = await getAllIdeas();
    return res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    error.statusCode = mapErrorToStatus(error);
    next(error);
  }
}

async function getIdeas(req, res, next) {
  try {
    const ideas = await getIdeasByUser(req.user.uid);
    return res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    error.statusCode = mapErrorToStatus(error);
    next(error);
  }
}

async function postIdea(req, res, next) {
  try {
    const idea = await createIdea(req.user.uid, req.body || {});
    return res.status(201).json({ success: true, data: idea });
  } catch (error) {
    error.statusCode = mapErrorToStatus(error);
    next(error);
  }
}

async function patchIdea(req, res, next) {
  try {
    const idea = await updateIdeaById(req.params.id, req.user.uid, req.body || {});
    return res.status(200).json({ success: true, data: idea });
  } catch (error) {
    error.statusCode = mapErrorToStatus(error);
    next(error);
  }
}

async function removeIdea(req, res, next) {
  try {
    await deleteIdeaById(req.params.id, req.user.uid);
    return res.status(200).json({ success: true, message: 'Idea deleted successfully' });
  } catch (error) {
    error.statusCode = mapErrorToStatus(error);
    next(error);
  }
}

async function requestPatent(req, res, next) {
  try {
    const { summary } = req.body || {};
    if (!summary || !String(summary).trim()) {
      const err = new Error('Patent summary is required');
      err.statusCode = 400;
      return next(err);
    }

    const idea = await requestPatentById(req.params.id, req.user, summary);

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || '';
    if (adminEmail) {
      const requesterName = idea.patentRequester?.name || idea.userName || 'Owner';
      const requesterEmail = idea.patentRequester?.email || 'Not provided';
      const subject = `Patent request: ${idea.title || 'Untitled idea'}`;
      const text = [
        `Requester: ${requesterName} (${requesterEmail})`,
        `Idea: ${idea.title || 'Untitled idea'}`,
        `Summary: ${idea.patentSummary || 'No summary provided'}`,
      ].join('\n');

      try {
        await queueEmail({ to: adminEmail, subject, text });
      } catch (error) {
        console.warn('Unable to queue patent email:', error.message);
      }
    }

    return res.status(200).json({ success: true, data: idea });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
}

module.exports = {
  listIdeas,
  getIdeas,
  postIdea,
  patchIdea,
  removeIdea,
  requestPatent,
};
