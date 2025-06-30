// src/middleware/auth.js
import User from '../models/User.js';

// 簡易認証ミドルウェア（JWT実装前）
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

    // ユーザーが存在するかチェック
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '無効なユーザーです' 
      });
    }

    // req.userにユーザー情報を設定
    req.user = user;
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
};

// オプション認証（ログインしていなくても利用可能）
export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('オプション認証エラー:', error);
    next(); // エラーがあってもそのまま進む
  }
};