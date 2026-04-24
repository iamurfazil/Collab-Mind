const { db, admin } = require('../../config/firebaseAdmin');

async function createProject({ ideaId, ownerId }) {
  const ideaRef = db.collection('ideas').doc(ideaId);
  const ideaSnap = await ideaRef.get();

  if (!ideaSnap.exists) {
    throw new Error('Idea not found');
  }

  const idea = ideaSnap.data();
  if (idea.userId !== ownerId) {
    throw new Error('Only the idea owner can create a project');
  }

  // Check if project already exists for this idea
  const existingProj = await db.collection('projects').where('ideaId', '==', ideaId).get();
  if (!existingProj.empty) {
    throw new Error('Project already exists for this idea');
  }

  const members = [...new Set([ownerId, ...(idea.collaborators || [])])];

  const payload = {
    ideaId,
    title: idea.title,
    ownerId,
    members,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('projects').add(payload);
  const saved = await docRef.get();
  
  // Create an automatic welcome task
  await db.collection('tasks').add({
    projectId: saved.id,
    title: 'Welcome to your new project workspace!',
    description: 'Start managing your tasks here.',
    assignedTo: ownerId,
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return { id: saved.id, ...saved.data() };
}

async function getProjects(userId) {
  const snapshot = await db.collection('projects')
    .where('members', 'array-contains', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const projects = [];
  const projectIds = [];
  snapshot.forEach(doc => {
    projects.push({ id: doc.id, ...doc.data(), tasks: [] });
    projectIds.push(doc.id);
  });

  if (projectIds.length > 0) {
    // Firestore 'in' supports max 30 values
    const chunks = [];
    for (let i = 0; i < projectIds.length; i += 30) {
      chunks.push(projectIds.slice(i, i + 30));
    }
    
    for (const chunk of chunks) {
      const taskSnap = await db.collection('tasks')
        .where('projectId', 'in', chunk)
        .get();
        
      taskSnap.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        const p = projects.find(proj => proj.id === task.projectId);
        if (p) p.tasks.push(task);
      });
    }
  }

  return projects;
}

async function getTasks(projectId) {
  const snapshot = await db.collection('tasks')
    .where('projectId', '==', projectId)
    .get();

  const tasks = [];
  snapshot.forEach(doc => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
}

async function createTask(projectId, userId, taskData) {
  const projSnap = await db.collection('projects').doc(projectId).get();
  if (!projSnap.exists) throw new Error('Project not found');
  const proj = projSnap.data();

  if (!proj.members.includes(userId)) throw new Error('Not a project member');

  const payload = {
    projectId,
    title: taskData.title,
    description: taskData.description || '',
    assignedTo: taskData.assignedTo || null,
    status: taskData.status || 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('tasks').add(payload);
  const saved = await docRef.get();
  return { id: saved.id, ...saved.data() };
}

async function updateTask(projectId, taskId, userId, taskData) {
  const projSnap = await db.collection('projects').doc(projectId).get();
  if (!projSnap.exists) throw new Error('Project not found');
  const proj = projSnap.data();

  if (!proj.members.includes(userId)) throw new Error('Not a project member');

  const taskRef = db.collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists || taskSnap.data().projectId !== projectId) throw new Error('Task not found');

  const updates = { ...taskData, updatedAt: new Date().toISOString() };
  await taskRef.set(updates, { merge: true });

  const updated = await taskRef.get();
  return { id: updated.id, ...updated.data() };
}

module.exports = {
  createProject,
  getProjects,
  getTasks,
  createTask,
  updateTask
};
