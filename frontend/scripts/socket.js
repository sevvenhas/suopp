const API_ORIGIN = window.SUOP_CONFIG && window.SUOP_CONFIG.API_ORIGIN ? window.SUOP_CONFIG.API_ORIGIN : 'http://localhost:3000';
let socket = null;

function connectSocket(token) {
  socket = io(API_ORIGIN, { auth: { token } });
  socket.on('connect_error', (err) => console.error('socket connect_error', err));
  socket.on('message', (m) => { if (window.__SUOP_onMessage) window.__SUOP_onMessage(m); });
  socket.on('typing', (info) => { if (window.__SUOP_onTyping) window.__SUOP_onTyping(info); });
  socket.on('connect', () => console.log('socket connected'));
  return socket;
}

function sendMessage(payload) { if (!socket) throw new Error('Not connected'); socket.emit('sendMessage', payload); }
function joinChannel(serverId, channelId) { if (!socket) return; socket.emit('joinChannel', serverId, channelId); }
function typing(info) { if (!socket) return; socket.emit('typing', info); }

window.__suop_socket = { connectSocket, sendMessage, joinChannel, typing };
