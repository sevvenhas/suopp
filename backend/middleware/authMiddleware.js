const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
