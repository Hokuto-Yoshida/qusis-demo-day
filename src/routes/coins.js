// src/routes/coins.js - 高速化版
import express from 'express';
import User from '../models/User.js';
import Tip from '../models/Tip.js';
import Contribution from '../models/Contribution.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// コイン取引履歴取得（認証必要）- 高速化版
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 並列でデータ取得（高速化）
    const [tips, contributions] = await Promise.all([
      // 投げ銭履歴（支出）- 必要フィールドのみ
      Tip.find({ user: userId })
        .populate('pitch', 'title') // タイトルのみpopulate
        .select('amount message createdAt') // 必要フィールドのみ
        .sort({ createdAt: -1 })
        .limit(50) // 件数制限で高速化
        .lean(), // Mongooseオブジェクト変換をスキップ
      
      // 時間貢献履歴（収入）- 必要フィールドのみ
      Contribution.find({ user: userId })
        .select('type hours coinsAwarded createdAt') // 必要フィールドのみ
        .sort({ createdAt: -1 })
        .limit(50) // 件数制限で高速化
        .lean() // Mongooseオブジェクト変換をスキップ
    ]);
    
    // トランザクション形式に変換（最適化）
    const transactions = [];
    
    // 投げ銭を支出として追加（for文の方が高速）
    for (const tip of tips) {
      transactions.push({
        id: tip._id,
        type: 'spent',
        amount: -tip.amount,
        description: `${tip.pitch?.title || '不明なピッチ'}への投げ銭`,
        timestamp: tip.createdAt
      });
    }
    
    // 時間貢献を収入として追加（for文の方が高速）
    for (const contrib of contributions) {
      transactions.push({
        id: contrib._id,
        type: 'earned',
        amount: contrib.coinsAwarded,
        description: `${contrib.type} (${contrib.hours}時間)`,
        timestamp: contrib.createdAt
      });
    }
    
    // 初回登録ボーナス（仮想的に追加）
    transactions.push({
      id: 'signup-bonus',
      type: 'earned',
      amount: 600,
      description: '初回登録ボーナス',
      timestamp: req.user.createdAt
    });
    
    // 時系列順にソート（最適化）
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(transactions);
  } catch (error) {
    console.error('取引履歴取得エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザーのコイン残高取得（認証必要）- 高速化版
router.get('/balance', authenticate, async (req, res) => {
  try {
    // ユーザー情報は既にreq.userにあるため、再取得不要（高速化）
    const user = req.user;
    
    // 並列でaggregateクエリを実行（高速化）
    const [totalContributions, totalTips] = await Promise.all([
      // 総獲得コイン計算（インデックス活用）
      Contribution.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: null, total: { $sum: '$coinsAwarded' } } }
      ]),
      
      // 総使用コイン計算（インデックス活用）
      Tip.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    const totalEarned = (totalContributions[0]?.total || 0) + 600; // 初回ボーナス含む
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

// コイン使用（投げ銭など）- 高速化版
router.post('/spend', authenticate, async (req, res) => {
  try {
    const { amount, description, targetId } = req.body;
    
    // req.userから直接取得（高速化）
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

// コイン獲得（貢献など）- 高速化版
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

// チャット参加報酬 - 高速化版
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