const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Server = require('./models/Server');
const User = require('./models/User');
const sanitizeHtml = require('sanitize-html');

module.exports = function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      console.error('socket auth', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log('socket connected', user.username);
    user.online = true; user.lastSeen = new Date(); user.save().catch(()=>{});
    socket.join(`user:${user._id}`);

    socket.on('joinChannel', (serverId, channelId) => {
      const room = `server:${serverId}:channel:${channelId}`;
      socket.join(room);
    });

    socket.on('typing', (info) => {
      // broadcast typing to room
      if (info.serverId && info.channelId) {
        socket.to(`server:${info.serverId}:channel:${info.channelId}`).emit('typing', { username: user.username });
      } else if (info.toUserId) {
        socket.to(`user:${info.toUserId}`).emit('typing', { username: user.username });
      }
    });

    socket.on('sendMessage', async (payload) => {
      try {
        // sanitize
        const content = sanitizeHtml(payload.content || '', { allowedTags: [], allowedAttributes: {} }).trim();
        if (!content) return;
        const m = new Message({ content, sender: user._id });
        if (payload.serverId && payload.channelId) {
          m.server = payload.serverId; m.channelId = payload.channelId; await m.save();
          const populated = await m.populate('sender', 'username');
          io.to(`server:${payload.serverId}:channel:${payload.channelId}`).emit('message', { ...populated.toObject(), isDM: false, channelId: payload.channelId, server: payload.serverId });
        } else if (payload.participants && Array.isArray(payload.participants)) {
          m.participants = [user._id, ...payload.participants]; await m.save();
          const populated = await m.populate('sender', 'username');
          // emit to each participant
          m.participants.forEach(pid => {
            io.to(`user:${pid}`).emit('message', { ...populated.toObject(), isDM: true, participants: m.participants });
          });
        }
      } catch (err) {
        console.error('sendMessage', err);
      }
    });

    socket.on('disconnect', () => {
      user.online = false; user.lastSeen = new Date(); user.save().catch(()=>{});
      console.log('socket disconnected', user.username);
    });
  });
};
