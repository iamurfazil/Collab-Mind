const { Server } = require('socket.io');
const { admin, db } = require('./config/firebaseAdmin');

let io;
const userSockets = new Map(); // uid -> socketId

async function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: Token missing'));
      
      const decodedUser = await admin.auth().verifyIdToken(token);
      socket.user = decodedUser;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.uid;
    userSockets.set(userId, socket.id);
    console.log(`Socket connected: ${userId}`);

    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      // Join a room specifically for this project
    });

    socket.on('sendMessage', async (data) => {
      // payload -> { projectId, receiverId, content, fileUrl }
      try {
        const payload = {
          projectId: data.projectId,
          senderId: userId,
          senderName: socket.user.name || socket.user.email || 'User',
          receiverId: data.receiverId || null,
          content: data.content,
          timestamp: new Date().toISOString()
        };

        const docRef = await db.collection('chat_messages').add(payload);
        const msg = { id: docRef.id, ...payload };

        // Broadcast to the project room
        io.to(`project_${data.projectId}`).emit('receiveMessage', msg);
      } catch (error) {
        console.error('Socket sendMessage error:', error.message);
      }
    });

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`Socket disconnected: ${userId}`);
    });
  });
}

function notifyUser(userId, type, payload) {
  if (io && userSockets.has(userId)) {
    const socketId = userSockets.get(userId);
    io.to(socketId).emit('notification:new', { type, data: payload, timestamp: new Date().toISOString() });
    
    // Also store notification silently
    db.collection('notifications').add({
      userId,
      type,
      payload,
      isRead: false,
      timestamp: new Date().toISOString()
    }).catch(console.error);
  }
}

module.exports = {
  initializeSocket,
  notifyUser
};
