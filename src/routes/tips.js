// src/routes/tips.js
import { Router } from 'express';
import Tip from '../models/Tip.js';
import Pitch from '../models/Pitch.js';

const router = Router();

// 投げ銭追加
// POST /api/tips
router.post('/', async (req, res) => {
  try {
    const { pitch: pitchId, user, amount, message } = req.body;
    const tip = await Tip.create({ pitch: pitchId, user, amount, message });

    // pitch.totalTips を更新
    await Pitch.findByIdAndUpdate(pitchId, { $inc: { totalTips: amount } });

    res.status(201).json(tip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 特定ピッチの投げ銭履歴取得
// GET /api/tips/:pitchId
router.get('/:pitchId', async (req, res) => {
  try {
    const tips = await Tip.find({ pitch: req.params.pitchId })
      .sort({ createdAt: -1 })
      .populate('user', 'name team')
      .lean();
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
