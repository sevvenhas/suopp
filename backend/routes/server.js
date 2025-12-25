const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const server = new Server({ name, owner: req.user._id, channels: [{ name: 'general' }], members: [req.user._id] });
    await server.save();
    res.json(server);
  } catch (err) {
    console.error('create server', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const list = await Server.find({ members: req.user._id });
    res.json(list);
  } catch (err) {
    console.error('list servers', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: 'Not found' });
    res.json(server);
  } catch (err) {
    console.error('get server', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
