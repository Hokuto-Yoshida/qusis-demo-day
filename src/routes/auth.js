// src/routes/auth.js - 高速化版
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ユーザー登録 - 高速化版
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, team } = req.body;
    
    console.log('Register attempt:', { email, name, role, team });
    
    // 既存ユーザーチェック（emailフィールドのみ検索 - 高速化）
    const existingUser = await User.findOne({ email })
      .select('_id') // IDのみ取得（高速化）
      .lean(); // Mongooseオブジェクト変換をスキップ
      
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に登録されています'
      });
    }
    
    // パスワードをハッシュ化（bcryptのsaltRounds=10は適切）
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 新規ユーザー作成
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      team: team || null,
      coinBalance: 600 // 新規登録ボーナス
    });
    
    await user.save();
    
    // レスポンスデータ（パスワードは除外）
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.team,
        coinBalance: user.coinBalance
      },
      token: user._id.toString() // 簡易トークン（実際のJWTではない）
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

// ログイン - 高速化版
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    // ユーザー検索（必要フィールドのみ取得 - 高速化）
    const user = await User.findOne({ email })
      .select('password name role team coinBalance') // パスワード認証に必要なフィールドのみ
      .lean(); // Mongooseオブジェクト変換をスキップ
      
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // パスワード照合
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // レスポンスデータ（パスワードは除外）
    res.json({
      success: true,
      user: {
        id: user._id,
        email: email, // emailはリクエストから取得（DBから再取得不要）
        name: user.name,
        role: user.role,
        team: user.team,
        coinBalance: user.coinBalance
      },
      token: user._id.toString() // 簡易トークン（実際のJWTではない）
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

// ログアウト - 高速化（変更なし - 既に最適）
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'ログアウトしました' });
});

// ユーザー情報取得（認証必要）- 高速化版
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.userから直接取得（DB再クエリ不要 - 高速化）
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        team: req.user.team,
        coinBalance: req.user.coinBalance
      }
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

export default router;