// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, team } = req.body;
    
    console.log('Register attempt:', { email, name, role, team });
    
    // 既存ユーザーチェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に登録されています'
      });
    }
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 新規ユーザー作成
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      team: team || null,
      coinBalance: 500 // 新規登録ボーナス
    });
    
    await user.save();
    
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
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    // ユーザー検索
    const user = await User.findOne({ email });
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
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'ログアウトしました' });
});

// ユーザー情報取得
router.get('/me', async (req, res) => {
  try {
    // TODO: JWTトークンの検証を実装
    res.json({
      success: true,
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'viewer'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
});

export default router;