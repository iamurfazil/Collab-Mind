const express = require('express');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, ideaSchema } = require('../../middleware/validate');
const controller = require('./controller');

const router = express.Router();

router.get('/', requireAuth, controller.listIdeas);
router.get('/mine', requireAuth, controller.getIdeas);
router.post('/', requireAuth, validate(ideaSchema), controller.postIdea);
router.patch('/:id', requireAuth, validate(ideaSchema), controller.patchIdea);
router.delete('/:id', requireAuth, controller.removeIdea);
router.post('/:id/patent-request', requireAuth, controller.requestPatent);

module.exports = router;
