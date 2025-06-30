// src/routes/tips.js - サポーターランキング機能追加版
import { Router } from 'express';
import Tip from '../models/Tip.js';
import Pitch from '../models/Pitch.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 投げ銭追加（認証必要）
router.post('/', authenticate, async (req, res) => {
  try {
    const { pitch: pitchId, amount, message } = req.body;
    const userId = req.user._id;
    
    console.log('💰 投げ銭リクエスト:', { pitchId, userId, amount, message });
    
    // バリデーション
    if (!pitchId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: '必須フィールドが不足しているか、無効な金額です' 
      });
    }

    // ユーザーの残高チェック
    if (req.user.coinBalance < amount) {
      return res.status(400).json({ 
        success: false,
        error: 'コイン残高が不足しています' 
      });
    }

    // ピッチが存在するかチェック
    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      return res.status(404).json({ 
        success: false,
        error: 'ピッチが見つかりません' 
      });
    }

    // 自分のピッチには投げ銭できない
    if (pitch.createdBy?.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false,
        error: '自分のピッチには投げ銭できません' 
      });
    }

    // 投げ銭を作成
    const tip = await Tip.create({ 
      pitch: pitchId, 
      user: userId, 
      amount, 
      message: message || '' 
    });

    // ピッチの総投げ銭額を更新
    await Pitch.findByIdAndUpdate(pitchId, { $inc: { totalTips: amount } });

    // ユーザーのコイン残高を減らす
    await User.findByIdAndUpdate(userId, { $inc: { coinBalance: -amount } });

    console.log('✅ 投げ銭作成成功:', tip);
    
    res.status(201).json({
      success: true,
      tip,
      newBalance: req.user.coinBalance - amount
    });
  } catch (err) {
    console.error('❌ 投げ銭エラー:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// 特定ピッチの投げ銭履歴取得（認証不要）
router.get('/:pitchId', async (req, res) => {
  try {
    const tips = await Tip.find({ pitch: req.params.pitchId })
      .sort({ createdAt: -1 })
      .populate('user', 'name team')
      .lean();
    res.json(tips);
  } catch (err) {
    console.error('投げ銭履歴取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 新機能: 特定ピッチのサポーターランキング取得
router.get('/:pitchId/supporters', async (req, res) => {
  try {
    const { pitchId } = req.params;
    
    // MongoDB Aggregation でユーザー別投げ銭総額を計算
    const supporters = await Tip.aggregate([
      // 該当ピッチの投げ銭のみフィルタ
      { $match: { pitch: pitchId } },
      
      // ユーザー別にグループ化して総額計算
      {
        $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          tipCount: { $sum: 1 },
          lastTipDate: { $max: '$createdAt' }
        }
      },
      
      // ユーザー情報を結合
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      
      // userInfo配列を展開
      { $unwind: '$userInfo' },
      
      // 投げ銭総額で降順ソート
      { $sort: { totalAmount: -1 } },
      
      // 上位10名まで
      { $limit: 10 },
      
      // 必要な情報のみ返す
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$userInfo.name',
          userTeam: '$userInfo.team',
          totalAmount: 1,
          tipCount: 1,
          lastTipDate: 1
        }
      }
    ]);

    console.log(`📊 ピッチ ${pitchId} のサポーターランキング:`, supporters);
    
    res.json(supporters);
  } catch (err) {
    console.error('サポーターランキング取得エラー:', err);
    res.status(500).json({ 
      success: false,
      error: 'サポーターランキングの取得に失敗しました' 
    });
  }
});

export default router;