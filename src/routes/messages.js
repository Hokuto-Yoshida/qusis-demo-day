// src/routes/messages.js
import { Router } from 'express';
import Message from '../models/Message.js';
import Pitch from '../models/Pitch.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// チャット投稿（認証必要）
router.post('/', authenticate, async (req, res) => {
  try {
    const { pitch: pitchId, content } = req.body;
    const userId = req.user._id;
    
    console.log('💬 チャットメッセージ:', { pitchId, userId, content });
    
    // バリデーション
    if (!pitchId || !content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'ピッチIDとメッセージ内容は必須です' 
      });
    }

    // ピッチが存在するかチェック
    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      return res.status(404).json({ 
        success: false,
        error: 'ピッチが見つかりません' 
      });
    }

    // メッセージを作成
    const message = await Message.create({ 
      pitch: pitchId, 
      user: userId, 
      content: content.trim() 
    });

    // ピッチの参加者数をインクリメント（重複参加者の考慮なし）
    await Pitch.findByIdAndUpdate(pitchId, { $inc: { participants: 1 } });

    // チャット参加報酬（20コイン）
    const chatReward = 20;
    await User.findByIdAndUpdate(userId, { $inc: { coinBalance: chatReward } });

    console.log('✅ チャットメッセージ作成成功:', message);
    
    // メッセージとユーザー情報をpopulateして返す
    const populatedMessage = await Message.findById(message._id)
      .populate('user', 'name team')
      .lean();
    
    res.status(201).json({
      success: true,
      message: populatedMessage,
      coinReward: chatReward,
      newBalance: req.user.coinBalance + chatReward
    });
  } catch (err) {
    console.error('❌ チャットメッセージエラー:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// 特定ピッチのチャット履歴取得（認証不要）
router.get('/:pitchId', async (req, res) => {
  try {
    const messages = await Message.find({ pitch: req.params.pitchId })
      .sort({ createdAt: 1 })
      .populate('user', 'name team')
      .lean();
    res.json(messages);
  } catch (err) {
    console.error('チャット履歴取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;