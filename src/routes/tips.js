// src/routes/tips.js - 最適化・高速化版
import { Router } from 'express';
import Tip from '../models/Tip.js';
import Pitch from '../models/Pitch.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

// 投げ銭追加（認証必要）- 最適化版
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { pitch: pitchId, amount, message } = req.body;
    const userId = req.user._id;
    
    console.log('💰 投げ銭リクエスト:', { pitchId, userId, amount, message });
    
    // ✅ バリデーション強化
    if (!pitchId || !amount || amount <= 0 || amount > 1000) {
      return res.status(400).json({ 
        success: false,
        error: '必須フィールドが不足しているか、無効な金額です（1-1000コイン）' 
      });
    }

    // ✅ 型チェック
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ 
        success: false,
        error: '無効なピッチIDです' 
      });
    }

    // ✅ トランザクション開始
    session.startTransaction();

    // ✅ 並列でピッチとユーザー情報を取得（高速化）
    const [pitch, currentUser] = await Promise.all([
      Pitch.findById(pitchId).select('_id createdBy team totalTips').session(session),
      User.findById(userId).select('_id coinBalance team').session(session)
    ]);

    // ピッチ存在チェック
    if (!pitch) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        error: 'ピッチが見つかりません' 
      });
    }

    // ✅ 残高チェック（最新データで）
    if (currentUser.coinBalance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        error: `コイン残高が不足しています（残高: ${currentUser.coinBalance}コイン）` 
      });
    }

    // ✅ 自分のピッチチェック（チーム単位）
    if (pitch.createdBy?.toString() === userId.toString() || 
        (pitch.team && currentUser.team && pitch.team === currentUser.team)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        error: '自分のチームのピッチには投げ銭できません' 
      });
    }

    // ✅ アトミックな更新操作（並列実行）
    const [tip, updatedUser] = await Promise.all([
      // 投げ銭記録作成
      Tip.create([{ 
        pitch: pitchId, 
        user: userId, 
        amount, 
        message: message || '' 
      }], { session }),
      
      // ユーザー残高をアトミックに減算（条件付き更新）
      User.findOneAndUpdate(
        { 
          _id: userId, 
          coinBalance: { $gte: amount } // 残高チェックを条件に含める
        },
        { $inc: { coinBalance: -amount } },
        { new: true, session }
      )
    ]);

    // 残高不足で更新失敗した場合
    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        error: 'コイン残高が不足しています（他の操作により残高が変更されました）' 
      });
    }

    // ピッチの総投げ銭額を更新
    await Pitch.findByIdAndUpdate(
      pitchId, 
      { $inc: { totalTips: amount } },
      { session }
    );

    // ✅ トランザクションコミット
    await session.commitTransaction();

    console.log('✅ 投げ銭作成成功:', tip[0]);
    
    // ✅ レスポンス最適化（必要最小限のデータ）
    res.status(201).json({
      success: true,
      tip: {
        _id: tip[0]._id,
        amount: tip[0].amount,
        createdAt: tip[0].createdAt
      },
      newBalance: updatedUser.coinBalance,
      newTotalTips: (pitch.totalTips || 0) + amount
    });

  } catch (err) {
    // ✅ エラー時は必ずロールバック
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error('❌ 投げ銭エラー:', err);
    
    // エラータイプに応じたレスポンス
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: 'データ検証エラーです' 
      });
    }
    
    if (err.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        error: 'データベース接続エラーです。しばらく待ってから再試行してください' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'サーバー内部エラーが発生しました' 
    });
  } finally {
    // ✅ セッション必須クリーンアップ
    await session.endSession();
  }
});

// 特定ピッチの投げ銭履歴取得（認証不要）- 高速化版
router.get('/:pitchId', async (req, res) => {
  try {
    const { pitchId } = req.params;
    
    // ✅ ObjectId検証
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: '無効なピッチIDです' });
    }

    const tips = await Tip.find({ pitch: pitchId })
      .select('amount message createdAt user') // 必要フィールドのみ
      .sort({ createdAt: -1 })
      .limit(50) // 件数制限
      .populate('user', 'name team') // ユーザー情報は名前とチームのみ
      .lean(); // 高速化

    res.json(tips);
  } catch (err) {
    console.error('投げ銭履歴取得エラー:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// サポーターランキング取得 - 高速化版
router.get('/:pitchId/supporters', async (req, res) => {
  try {
    const { pitchId } = req.params;
    
    console.log('🔍 サポーターランキング取得開始:', pitchId);
    
    // ✅ ObjectId検証
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: '無効なピッチIDです' });
    }
    
    const pitchObjectId = new mongoose.Types.ObjectId(pitchId);
    
    // ✅ 最適化されたAggregation（インデックス活用）
    const supporters = await Tip.aggregate([
      // まず該当ピッチの投げ銭に絞り込み（インデックス活用）
      { $match: { pitch: pitchObjectId } },
      
      // ユーザー別にグループ化
      {
        $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          tipCount: { $sum: 1 },
          lastTipDate: { $max: '$createdAt' }
        }
      },
      
      // 投げ銭総額で降順ソート（インデックス活用）
      { $sort: { totalAmount: -1 } },
      
      // 上位10名まで（早期終了）
      { $limit: 10 },
      
      // ユーザー情報を結合（必要フィールドのみ）
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
          pipeline: [
            { $project: { name: 1, team: 1 } } // ユーザー情報も最小限
          ]
        }
      },
      
      // userInfo配列を展開
      { $unwind: '$userInfo' },
      
      // 最終的な形式に整形
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

    console.log(`📊 サポーター数: ${supporters.length}`);
    
    res.json(supporters);
  } catch (err) {
    console.error('❌ サポーターランキング取得エラー:', err);
    res.status(500).json({ 
      success: false,
      error: 'サポーターランキングの取得に失敗しました' 
    });
  }
});

// ユーザーの投げ銭履歴取得（認証必要）- 新規追加
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const tips = await Tip.find({ user: req.user._id })
      .select('amount message createdAt pitch')
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('pitch', 'title team')
      .lean();

    res.json(tips);
  } catch (err) {
    console.error('ユーザー投げ銭履歴取得エラー:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

export default router;