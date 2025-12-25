const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// get channel messages
router.get('/channel/:serverId/:channelId', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ server: req.params.serverId, channelId: req.params.channelId }).populate('sender', 'username');
    res.json(msgs);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error' });
  }
});

// get DM messages between me and userId
router.get('/dm/:userId', auth, async (req, res) => {
  try {
    const other = req.params.userId;
    const msgs = await Message.find({ participants: { $all: [req.user._id, other] } }).populate('sender', 'username');
    res.json(msgs);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
