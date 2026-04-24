const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, projectInitSchema, taskSchema, taskStatusSchema } = require('../../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(projectInitSchema), controller.postProject);
router.get('/', controller.getProjects);
router.post('/:id/tasks', validate(taskSchema), controller.postTask);
router.patch('/:id/tasks/:taskId', validate(taskStatusSchema), controller.patchTask);

module.exports = router;
