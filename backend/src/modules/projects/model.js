const projectsModel = {
  collection: 'projects',
  fields: ['name', 'summary', 'ownerId', 'members', 'status', 'createdAt'],
};

module.exports = { projectsModel };
