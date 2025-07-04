// src/routes/messages.js - エラー対策強化版
import { Router } from 'express';
import Message from '../models/Message.js';
import Pitch from '../models/Pitch.js';
import User from '../models/User.js';
import { authenticate, invalidateUserCache } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

// 🚀 初回投稿キャッシュ（メモリ内）
const firstPostCache = new Map();
const FIRST_POST_CACHE_TTL = 10 * 60 * 1000; // 10分キャッシュ

// 🚀 キャッシュクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of firstPostCache.entries()) {
    if (now > cached.expiry) {
      firstPostCache.delete(key);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

// 🚀 チャット投稿（認証必要）- エラー対策強化版
router.post('/', authenticate, async (req, res) => {
  let session = null;
  
  try {
    const { pitch: pitchId, content, isSuperchat } = req.body;
    const userId = req.user._id;
    
    console.log('💬 チャットメッセージ:', { pitchId, userId, content, isSuperchat });
    
    // ✅ 早期バリデーション（DBアクセス前）
    if (!pitchId || !content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'ピッチIDとメッセージ内容は必須です' 
      });
    }

    // 内容長チェック
    const trimmedContent = content.trim();
    if (trimmedContent.length > 500) {
      return res.status(400).json({ 
        success: false,
        error: 'メッセージは500文字以内で入力してください' 
      });
    }

    // ✅ ObjectId検証（早期リターン）
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ 
        success: false,
        error: '無効なピッチIDです' 
      });
    }

    // 🚀 セッション作成（タイムアウト付き）
    session = await mongoose.startSession();
    
    // 🚀 トランザクション開始（タイムアウト設定）
    await session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority', j: true },
      maxTimeMS: 10000 // 10秒タイムアウト
    });

    // 🚀 初回投稿チェック（キャッシュ優先）
    const cacheKey = `${userId}_${pitchId}`;
    const cached = firstPostCache.get(cacheKey);
    const now = Date.now();
    
    let isFirstPost = true;
    
    if (cached && now < cached.expiry) {
      // キャッシュから取得
      isFirstPost = false;
      console.log('🚀 初回投稿キャッシュヒット:', cacheKey);
    } else {
      // DBから確認（最小限のクエリ）
      const existingMessage = await Message.findOne({ 
        pitch: pitchId, 
        user: userId 
      })
      .select('_id')
      .session(session)
      .lean();
      
      isFirstPost = !existingMessage;
      
      // キャッシュに保存（投稿済みの場合のみ）
      if (!isFirstPost) {
        firstPostCache.set(cacheKey, {
          posted: true,
          expiry: now + FIRST_POST_CACHE_TTL
        });
      }
    }

    console.log('🔍 初回投稿チェック:', { userId, pitchId, isFirstPost });

    // 🚀 ピッチ存在確認（並列処理なし、必要最小限）
    const pitch = await Pitch.findById(pitchId)
      .select('_id participants')
      .session(session)
      .lean();

    if (!pitch) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        error: 'ピッチが見つかりません' 
      });
    }

    // ✅ メッセージ作成
    const messageData = { 
      pitch: pitchId, 
      user: userId, 
      content: trimmedContent 
    };
    
    const [message] = await Message.create([messageData], { session });

    // 🚀 コイン獲得とピッチ参加者数の処理（初回のみ）
    let coinReward = 0;
    let newBalance = req.user.coinBalance;
    let updatedUser = null;
    
    if (!isSuperchat && isFirstPost) {
      // ✅ 初回投稿の場合のみコイン獲得（アトミック操作）
      coinReward = 20;
      
      console.log('💰 初回投稿コイン獲得処理開始');
      
      // 並列でユーザー残高更新と参加者数更新
      const [userUpdate, pitchUpdate] = await Promise.all([
        User.findOneAndUpdate(
          { _id: userId },
          { $inc: { coinBalance: coinReward } },
          { 
            new: true, 
            session, 
            select: 'coinBalance'
          }
        ),
        Pitch.findByIdAndUpdate(
          pitchId, 
          { $inc: { participants: 1 } },
          { session }
        )
      ]);
      
      if (!userUpdate) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          error: 'ユーザー情報の更新に失敗しました' 
        });
      }
      
      updatedUser = userUpdate;
      newBalance = userUpdate.coinBalance;
      
      // 🚀 初回投稿キャッシュに保存
      firstPostCache.set(cacheKey, {
        posted: true,
        expiry: now + FIRST_POST_CACHE_TTL
      });
      
      console.log('✅ 初回チャット投稿: コイン獲得', {
        coinReward,
        newBalance
      });
    } else {
      console.log('✅ 2回目以降またはスーパーチャット: コイン獲得なし');
    }

    // 🚀 トランザクションコミット
    await session.commitTransaction();

    console.log('✅ チャットメッセージ作成成功:', {
      messageId: message._id,
      coinReward,
      isFirstPost
    });
    
    // 🚀 ユーザーキャッシュを無効化（コイン残高更新のため）
    if (coinReward > 0) {
      invalidateUserCache(userId.toString());
    }
    
    // ✅ 効率的なpopulate（必要最小限のクエリ）
    const populatedMessage = await Message.findById(message._id)
      .populate('user', 'name team')
      .select('content createdAt user')
      .lean();
    
    // ✅ レスポンス最適化
    res.status(201).json({
      success: true,
      message: populatedMessage,
      coinReward: coinReward,
      newBalance: newBalance,
      isFirstPost: isFirstPost
    });

  } catch (err) {
    // 🚀 エラー時は必ずロールバック
    if (session && session.inTransaction()) {
      try {
        await session.abortTransaction();
        console.log('🔄 メッセージトランザクションロールバック完了');
      } catch (rollbackError) {
        console.error('❌ メッセージロールバックエラー:', rollbackError);
      }
    }
    
    console.error('❌ チャットメッセージエラー:', {
      error: err,
      name: err.name,
      code: err.code,
      userId: req.user?._id,
      pitchId: req.body?.pitch
    });
    
    // 🚀 エラータイプに応じた詳細レスポンス
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: 'メッセージの形式が正しくありません' 
      });
    }
    
    if (err.code === 11000) { // 重複エラー
      return res.status(409).json({ 
        success: false,
        error: '同じメッセージが既に投稿されています' 
      });
    }
    
    if (err.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        error: 'データベース接続エラーです。しばらく待ってから再試行してください' 
      });
    }
    
    if (err.name === 'MongoTimeoutError' || err.code === 50) {
      return res.status(408).json({ 
        success: false,
        error: 'リクエストタイムアウトです。再試行してください' 
      });
    }
    
    // 🚀 一般的なサーバーエラー
    res.status(500).json({ 
      success: false,
      error: 'サーバー内部エラーが発生しました。しばらく待ってから再試行してください' 
    });
    
  } finally {
    // 🚀 セッション必須クリーンアップ
    if (session) {
      try {
        await session.endSession();
        console.log('🧹 メッセージセッション終了');
      } catch (cleanupError) {
        console.error('❌ メッセージセッションクリーンアップエラー:', cleanupError);
      }
    }
  }
});

// 🚀 特定ピッチのチャット履歴取得（認証不要）- 高速化版
router.get('/:pitchId', async (req, res) => {
  try {
    const { pitchId } = req.params;
    
    // ✅ ObjectId検証
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: '無効なピッチIDです' });
    }

    // ✅ 最適化されたクエリ（タイムアウト付き）
    const messages = await Message.find({ pitch: pitchId })
      .select('content createdAt user') // 必要フィールドのみ
      .sort({ createdAt: 1 }) // インデックス活用
      .limit(200) // 件数制限（パフォーマンス向上）
      .populate('user', 'name team') // ユーザー情報は名前とチームのみ
      .lean() // 高速化
      .maxTimeMS(5000); // 5秒タイムアウト

    res.json(messages);
  } catch (err) {
    console.error('チャット履歴取得エラー:', err);
    
    if (err.name === 'MongoTimeoutError') {
      return res.status(408).json({ 
        error: 'チャット履歴の取得がタイムアウトしました。再試行してください' 
      });
    }
    
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// ピッチの最新メッセージ取得（認証不要）- 新規追加
router.get('/:pitchId/recent', async (req, res) => {
  try {
    const { pitchId } = req.params;
    const limit = parseInt(req.query.limit) || 10; // デフォルト10件
    
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: '無効なピッチIDです' });
    }

    const messages = await Message.find({ pitch: pitchId })
      .select('content createdAt user')
      .sort({ createdAt: -1 }) // 新着順
      .limit(Math.min(limit, 50)) // 最大50件まで
      .populate('user', 'name team')
      .lean()
      .maxTimeMS(3000); // 3秒タイムアウト

    // 古い順に並び替えて返す
    res.json(messages.reverse());
  } catch (err) {
    console.error('最新メッセージ取得エラー:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// ユーザーのメッセージ履歴取得（認証必要）- 新規追加
router.get('/user/history', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
      .select('content createdAt pitch')
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('pitch', 'title team')
      .lean()
      .maxTimeMS(3000);

    res.json(messages);
  } catch (err) {
    console.error('ユーザーメッセージ履歴取得エラー:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// ピッチのメッセージ統計取得（認証不要）- 新規追加
router.get('/:pitchId/stats', async (req, res) => {
  try {
    const { pitchId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: '無効なピッチIDです' });
    }

    const stats = await Message.aggregate([
      { $match: { pitch: new mongoose.Types.ObjectId(pitchId) } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          latestMessage: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          latestMessage: 1
        }
      }
    ]).option({ maxTimeMS: 5000 }); // 5秒タイムアウト

    res.json(stats[0] || { totalMessages: 0, uniqueUsers: 0, latestMessage: null });
  } catch (err) {
    console.error('メッセージ統計取得エラー:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// 🚀 キャッシュ管理機能（デバッグ用）
export const clearFirstPostCache = () => {
  firstPostCache.clear();
  console.log('🗑️ 初回投稿キャッシュをクリアしました');
};

export const getFirstPostCacheStats = () => {
  return {
    size: firstPostCache.size,
    ttl: FIRST_POST_CACHE_TTL
  };
};

export default router;