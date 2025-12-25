const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ $or: [ { email }, { username } ] });
    if (existing) return res.status(409).json({ message: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ username, email, passwordHash });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ $or: [ { email: emailOrUsername }, { username: emailOrUsername } ] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('login', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
