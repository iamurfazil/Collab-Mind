const express = require('express');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, ideaSchema } = require('../../middleware/validate');
const controller = require('./controller');

const router = express.Router();

// POST /api/ideas — Create idea
router.post('/', requireAuth, validate(ideaSchema), controller.postIdea);

// GET /api/ideas/my — Get current user ideas
router.get('/my', requireAuth, controller.getIdeas);

// PATCH /api/ideas/:id/share — Share idea
router.patch('/:id/share', requireAuth, controller.shareIdea);

// GET /api/ideas/marketplace — Marketplace ideas
router.get('/marketplace', requireAuth, controller.listMarketplaceIdeas);

// GET /api/ideas/shared — Ideas shared with current user
router.get('/shared', requireAuth, controller.listSharedWithMe);

// GET /api/ideas — List ideas (legacy/general)
router.get('/', requireAuth, controller.listIdeas);

// PATCH /api/ideas/:id — Update idea
router.patch('/:id', requireAuth, validate(ideaSchema), controller.patchIdea);

// DELETE /api/ideas/:id — Delete idea
router.delete('/:id', requireAuth, controller.removeIdea);

// POST /api/ideas/:id/patent-request — Patent request
router.post('/:id/patent-request', requireAuth, controller.requestPatent);

module.exports = router;
