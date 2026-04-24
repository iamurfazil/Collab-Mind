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

async function listIdeas(req, res) {
  try {
    const ideas = await getAllIdeas();
    return res.status(200).json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getIdeas(req, res) {
  try {
    const ideas = await getIdeasByUser(req.user.uid);
    return res.status(200).json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function postIdea(req, res) {
  try {
    const idea = await createIdea(req.user.uid, req.body || {});
    return res.status(201).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      success: false,
      message: error.message,
    });
  }
}

async function patchIdea(req, res) {
  try {
    const idea = await updateIdeaById(req.params.id, req.user.uid, req.body || {});
    return res.status(200).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      success: false,
      message: error.message,
    });
  }
}

async function removeIdea(req, res) {
  try {
    await deleteIdeaById(req.params.id, req.user.uid);
    return res.status(200).json({
      success: true,
      message: 'Idea deleted successfully',
    });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      success: false,
      message: error.message,
    });
  }
}

async function requestPatent(req, res) {
  try {
    const { summary } = req.body || {};
    if (!summary || !String(summary).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Patent summary is required',
      });
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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
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
