const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, projectInitSchema, taskSchema, taskStatusSchema } = require('../../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(projectInitSchema), controller.createProjectHandler);
router.get('/', controller.getProjectsHandler);
router.post('/:id/tasks', validate(taskSchema), controller.createTaskHandler);
router.patch('/:id/tasks/:taskId', validate(taskStatusSchema), controller.updateTaskHandler);

module.exports = router;
