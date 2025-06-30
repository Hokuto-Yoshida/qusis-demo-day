// src/routes/coins.js
import express from 'express';
import User from '../models/User.js';
import Tip from '../models/Tip.js';
import Contribution from '../models/Contribution.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// コイン取引履歴取得（認証必要）
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 投げ銭履歴（支出）
    const tips = await Tip.find({ user: userId })
      .populate('pitch', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    // 時間貢献履歴（収入）
    const contributions = await Contribution.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    // トランザクション形式に変換
    const transactions = [];
    
    // 投げ銭を支出として追加
    tips.forEach(tip => {
      transactions.push({
        id: tip._id,
        type: 'spent',
        amount: -tip.amount,
        description: `${tip.pitch?.title || '不明なピッチ'}への投げ銭`,
        timestamp: tip.createdAt
      });
    });
    
    // 時間貢献を収入として追加
    contributions.forEach(contrib => {
      transactions.push({
        id: contrib._id,
        type: 'earned',
        amount: contrib.coinsAwarded,
        description: `${contrib.type} (${contrib.hours}時間)`,
        timestamp: contrib.createdAt
      });
    });
    
    // 初回登録ボーナス（仮想的に追加）
    transactions.push({
      id: 'signup-bonus',
      type: 'earned',
      amount: 500,
      description: '初回登録ボーナス',
      timestamp: req.user.createdAt
    });
    
    // 時系列順にソート
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(transactions);
  } catch (error) {
    console.error('取引履歴取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザーのコイン残高取得（認証必要）
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // 総獲得コイン計算
    const totalContributions = await Contribution.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$coinsAwarded' } } }
    ]);
    
    // 総使用コイン計算
    const totalTips = await Tip.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalEarned = (totalContributions[0]?.total || 0) + 500; // 初回ボーナス含む
    const totalSpent = totalTips[0]?.total || 0;
    
    res.json({
      success: true,
      balance: user.coinBalance,
      totalEarned,
      totalSpent
    });
  } catch (error) {
    console.error('残高取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// コイン使用（投げ銭など）- 実際の処理はtips.jsで行う
router.post('/spend', authenticate, async (req, res) => {
  try {
    const { amount, description, targetId } = req.body;
    
    if (req.user.coinBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'コイン残高が不足しています'
      });
    }
    
    console.log('コイン使用:', { amount, description, targetId });
    
    res.json({
      success: true,
      message: '投げ銭機能をご利用ください',
      currentBalance: req.user.coinBalance
    });
  } catch (error) {
    console.error('コイン使用エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// コイン獲得（貢献など）- 実際の処理はcontributions.jsで行う
router.post('/earn', authenticate, async (req, res) => {
  try {
    const { type, hours } = req.body;
    
    console.log('コイン獲得リクエスト:', { type, hours });
    
    res.json({
      success: true,
      message: '時間貢献機能をご利用ください',
      currentBalance: req.user.coinBalance
    });
  } catch (error) {
    console.error('コイン獲得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// チャット参加報酬 - 実際の処理はmessages.jsで行う
router.post('/chat', authenticate, async (req, res) => {
  try {
    const amount = 20; // チャット参加で20コイン
    
    console.log('チャット報酬:', { amount });
    
    res.json({
      success: true,
      amount: amount,
      message: 'チャット機能をご利用ください'
    });
  } catch (error) {
    console.error('チャット報酬エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;