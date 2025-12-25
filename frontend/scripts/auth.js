const API_BASE = window.SUOP_CONFIG && window.SUOP_CONFIG.API_BASE ? window.SUOP_CONFIG.API_BASE : 'http://localhost:3000/api';

function setToken(token) { localStorage.setItem('suop_token', token); }
function getToken() { return localStorage.getItem('suop_token'); }

async function register(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username, email, password }) });
  return res.json();
}
async function login(emailOrUsername, password) {
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ emailOrUsername, password }) });
  return res.json();
}

window.SUOP_AUTH = { setToken, getToken, register, login };
