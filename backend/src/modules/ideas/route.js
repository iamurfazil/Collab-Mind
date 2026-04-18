const express = require('express');
const { requireAuth } = require('../../middleware/authMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', requireAuth, controller.listIdeas);
router.get('/mine', requireAuth, controller.getIdeas);
router.post('/', requireAuth, controller.postIdea);
router.patch('/:id', requireAuth, controller.patchIdea);
router.delete('/:id', requireAuth, controller.removeIdea);

module.exports = router;
