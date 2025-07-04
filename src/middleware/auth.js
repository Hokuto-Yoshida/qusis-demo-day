// src/middleware/auth.js - 最適化版
import User from '../models/User.js';

// 🚀 ユーザーキャッシュ（メモリ内）
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分キャッシュ
const MAX_CACHE_SIZE = 1000; // 最大1000ユーザー

// 🚀 キャッシュクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [userId, cached] of userCache.entries()) {
    if (now > cached.expiry) {
      userCache.delete(userId);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

// 🚀 高速化された認証ミドルウェア
export const authenticate = async (req, res, next) => {
  try {
    // ヘッダーまたはクエリからユーザーIDを取得
    const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'ユーザー認証が必要です' 
      });
    }

    // 🚀 ObjectId検証（早期リターン）
    if (!isValidObjectId(userId)) {
      return res.status(401).json({ 
        success: false, 
        message: '無効なユーザーIDです' 
      });
    }

    // 🚀 キャッシュから取得を試行
    const cached = userCache.get(userId);
    const now = Date.now();
    
    if (cached && now < cached.expiry) {
      console.log(`🚀 認証キャッシュヒット: ${userId}`);
      req.user = cached.user;
      return next();
    }

    // 🚀 DBからユーザー取得（最小限のフィールド）
    console.log(`🔍 DB認証: ${userId}`);
    const user = await User.findById(userId)
      .select('_id name email role team coinBalance') // 必要フィールドのみ
      .lean(); // Mongoose オブジェクト変換をスキップ
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '無効なユーザーです' 
      });
    }

    // 🚀 キャッシュに保存（LRUサイズ制限）
    if (userCache.size >= MAX_CACHE_SIZE) {
      // 最古のエントリを削除
      const firstKey = userCache.keys().next().value;
      userCache.delete(firstKey);
    }
    
    userCache.set(userId, {
      user: user,
      expiry: now + CACHE_TTL
    });

    // req.userにユーザー情報を設定
    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ 認証エラー:', error);
    
    // エラータイプに応じた詳細なレスポンス
    if (error.name === 'CastError') {
      return res.status(401).json({ 
        success: false, 
        message: '無効なユーザーIDフォーマットです' 
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false, 
        message: 'データベース接続エラーです。しばらく待ってから再試行してください' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
};

// 🚀 オプション認証（最適化版）
export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    if (userId && isValidObjectId(userId)) {
      // キャッシュから取得を試行
      const cached = userCache.get(userId);
      const now = Date.now();
      
      if (cached && now < cached.expiry) {
        req.user = cached.user;
      } else {
        // DBから取得（エラーは無視）
        try {
          const user = await User.findById(userId)
            .select('_id name email role team coinBalance')
            .lean();
          
          if (user) {
            req.user = user;
            
            // キャッシュに保存
            if (userCache.size < MAX_CACHE_SIZE) {
              userCache.set(userId, {
                user: user,
                expiry: now + CACHE_TTL
              });
            }
          }
        } catch (dbError) {
          console.warn('オプション認証DB取得失敗:', dbError);
          // エラーは無視してそのまま進む
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('オプション認証エラー:', error);
    next(); // エラーがあってもそのまま進む
  }
};

// 🚀 ObjectId検証ヘルパー
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// 🚀 キャッシュ管理機能（デバッグ用）
export const clearUserCache = () => {
  userCache.clear();
  console.log('🗑️ ユーザーキャッシュをクリアしました');
};

export const getCacheStats = () => {
  return {
    size: userCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL
  };
};

// 🚀 特定ユーザーをキャッシュから削除（コイン残高更新時など）
export const invalidateUserCache = (userId) => {
  userCache.delete(userId);
  console.log(`🗑️ ユーザーキャッシュ削除: ${userId}`);
};