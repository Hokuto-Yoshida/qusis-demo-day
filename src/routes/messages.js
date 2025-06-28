// src/routes/messages.js
import { Router } from 'express';
import Message from '../models/Message.js';
import Pitch from '../models/Pitch.js';

const router = Router();

// チャット投稿
// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { pitch: pitchId, user, content } = req.body;
    // オプションで Pitch.participants をインクリメント
    await Pitch.findByIdAndUpdate(pitchId, { $inc: { participants: 1 } });
    const message = await Message.create({ pitch: pitchId, user, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 特定ピッチのチャット履歴取得
// GET /api/messages/:pitchId
router.get('/:pitchId', async (req, res) => {
  try {
    const messages = await Message.find({ pitch: req.params.pitchId })
      .sort({ createdAt: 1 })
      .populate('user', 'name avatar')
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
