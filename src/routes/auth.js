// src/routes/auth.js
import express from 'express';
const router = express.Router();

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    // TODO: 実際の認証ロジック
    // 一時的にモックレスポンス
    if (email && password) {
      res.json({
        success: true,
        user: {
          id: '1',
          email: email,
          name: 'Test User',
          role: 'viewer' // viewer, presenter, admin
        },
        token: 'mock-jwt-token'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    console.log('Register attempt:', { email, name, role });
    
    // TODO: 実際の登録ロジック
    res.json({
      success: true,
      user: {
        id: '2',
        email: email,
        name: name,
        role: role || 'viewer'
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ユーザー情報取得
router.get('/me', (req, res) => {
  // TODO: JWTトークンの検証
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'viewer'
    }
  });
});

export default router;