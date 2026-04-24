const service = require('./service');

async function postProject(req, res, next) {
  try {
    const data = await service.createProject({
      ideaId: req.body.ideaId,
      ownerId: req.user.uid
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getProjects(req, res, next) {
  try {
    const projects = await service.getProjects(req.user.uid);
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
}

async function postTask(req, res, next) {
  try {
    const data = await service.createTask(req.params.id, req.user.uid, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function patchTask(req, res, next) {
  try {
    const data = await service.updateTask(req.params.id, req.params.taskId, req.user.uid, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postProject,
  getProjects,
  postTask,
  patchTask
};
