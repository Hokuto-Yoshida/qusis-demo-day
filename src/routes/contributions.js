// src/routes/contributions.js
import { Router } from 'express';
import Contribution from '../models/Contribution.js';
import User from '../models/User.js';

const router = Router();

// 時間貢献申請（追加）
// POST /api/contributions
router.post('/', async (req, res) => {
  try {
    const { user: userId, type, hours, coinsAwarded } = req.body;
    const contrib = await Contribution.create({ user: userId, type, hours, coinsAwarded });

    // user.coinBalance をインクリメント
    await User.findByIdAndUpdate(userId, { $inc: { coinBalance: coinsAwarded } });

    res.status(201).json(contrib);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ユーザーの時間貢献履歴取得
// GET /api/contributions/:userId
router.get('/:userId', async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
