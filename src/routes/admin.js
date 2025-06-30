import { Router } from 'express';
import Tip from '../models/Tip.js';
import User from '../models/User.js';
const router = Router();

// 総応援コイン合計
router.get('/total-coins', async (_, res) => {
  const [{ sum }] = await Tip.aggregate([{ $group:{ _id:null, sum:{ $sum:'$amount' } } }]);
  res.json({ total: sum || 0 });
});

// ユーザー一覧
router.get('/users', async (_, res) => {
  const users = await User.find().select('name email role coinBalance team').lean();
  res.json(users);
});

export default router;
