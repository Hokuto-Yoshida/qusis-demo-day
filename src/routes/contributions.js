// src/routes/contributions.js
import { Router } from 'express';
import Contribution from '../models/Contribution.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 時間貢献申請（認証必要）
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, hours } = req.body;
    const userId = req.user._id;
    
    console.log('⏰ 時間貢献申請:', { userId, type, hours });
    
    // バリデーション
    if (!type || !hours || hours <= 0 || hours > 24) {
      return res.status(400).json({ 
        success: false,
        error: '有効な貢献タイプと時間（1-24時間）を入力してください' 
      });
    }

    // 貢献タイプ別のコイン設定
    const coinRates = {
      'オフラインヒアリング': 400,
      'オンラインヒアリング': 200,
      'QUSISイベント参加': 100
    };

    if (!coinRates[type]) {
      return res.status(400).json({ 
        success: false,
        error: '無効な貢献タイプです' 
      });
    }

    const coinsAwarded = hours * coinRates[type];

    // 貢献記録を作成
    const contrib = await Contribution.create({ 
      user: userId, 
      type, 
      hours, 
      coinsAwarded 
    });

    // ユーザーのコイン残高を増やす
    await User.findByIdAndUpdate(userId, { $inc: { coinBalance: coinsAwarded } });

    console.log('✅ 時間貢献申請成功:', contrib);

    res.status(201).json({
      success: true,
      contribution: contrib,
      coinsAwarded,
      newBalance: req.user.coinBalance + coinsAwarded
    });
  } catch (err) {
    console.error('❌ 時間貢献申請エラー:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ユーザーの時間貢献履歴取得（認証必要）
router.get('/my-contributions', authenticate, async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch (err) {
    console.error('時間貢献履歴取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// 管理者用：全ユーザーの時間貢献履歴取得（管理者のみ）
router.get('/all', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: '管理者権限が必要です' 
      });
    }

    const contributions = await Contribution.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email team')
      .lean();
    res.json(contributions);
  } catch (err) {
    console.error('全時間貢献履歴取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// 特定ユーザーの時間貢献履歴取得（管理者のみ）
router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: '管理者権限が必要です' 
      });
    }

    const contributions = await Contribution.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch (err) {
    console.error('ユーザー時間貢献履歴取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;