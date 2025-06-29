// src/routes/coins.js
import express from 'express';
const router = express.Router();

// コイン取引履歴取得
router.get('/transactions', async (req, res) => {
  try {
    // TODO: 実際のデータベースから取得
    const transactions = [
      {
        id: '1',
        type: 'earned',
        amount: 500,
        description: '初回登録ボーナス',
        timestamp: new Date().toISOString()
      },
      {
        id: '2', 
        type: 'spent',
        amount: -50, // 支出は負の値
        description: 'テストピッチへの投げ銭',
        timestamp: new Date().toISOString()
      }
    ];
    
    // CoinContext.jsxは res.data が直接配列であることを期待
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ユーザーのコイン残高取得
router.get('/balance', async (req, res) => {
  try {
    // TODO: 実際のユーザー認証とデータベース取得
    res.json({
      success: true,
      balance: 450,
      totalEarned: 500,
      totalSpent: 50
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// コイン使用（投げ銭など）
router.post('/spend', async (req, res) => {
  try {
    const { amount, description, targetId } = req.body;
    
    // TODO: バリデーションと実際のコイン処理
    console.log('Coin spend:', { amount, description, targetId });
    
    res.json({
      success: true,
      newBalance: 400, // 例
      amount: amount
    });
  } catch (error) {
    console.error('Error spending coins:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// コイン獲得（貢献など）
router.post('/earn', async (req, res) => {
  try {
    const { type, hours } = req.body;
    const amount = hours * 100; // 1時間 = 100コイン
    
    // TODO: バリデーションと実際のコイン処理
    console.log('Coin earn:', { type, hours, amount });
    
    res.json({
      success: true,
      newBalance: 500, // 例
      amount: amount
    });
  } catch (error) {
    console.error('Error earning coins:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// チャット参加報酬
router.post('/chat', async (req, res) => {
  try {
    const amount = 20; // チャット参加で20コイン
    
    console.log('Chat coin reward:', { amount });
    
    res.json({
      success: true,
      amount: amount
    });
  } catch (error) {
    console.error('Error earning chat coins:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;