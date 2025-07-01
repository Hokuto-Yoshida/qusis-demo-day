// src/routes/messages.js - 修正版（初回投稿のみコイン獲得）
import { Router } from 'express';
import Message from '../models/Message.js';
import Pitch from '../models/Pitch.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// チャット投稿（認証必要）
router.post('/', authenticate, async (req, res) => {
  try {
    const { pitch: pitchId, content, isSuperchat } = req.body;
    const userId = req.user._id;
    
    console.log('💬 チャットメッセージ:', { pitchId, userId, content, isSuperchat });
    
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

    // ✅ 既存のメッセージをチェック（初回投稿判定）
    const existingMessage = await Message.findOne({ 
      pitch: pitchId, 
      user: userId 
    });
    const isFirstPost = !existingMessage;
    
    console.log('🔍 初回投稿チェック:', { userId, pitchId, isFirstPost });

    // メッセージを作成
    const message = await Message.create({ 
      pitch: pitchId, 
      user: userId, 
      content: content.trim() 
    });

    // ✅ コイン獲得とピッチ参加者数の処理
    let coinReward = 0;
    let newBalance = req.user.coinBalance;
    
    if (!isSuperchat) {
      // 通常のチャットメッセージの場合
      
      if (isFirstPost) {
        // ✅ 初回投稿の場合のみコイン獲得
        coinReward = 20;
        await User.findByIdAndUpdate(userId, { $inc: { coinBalance: coinReward } });
        newBalance = req.user.coinBalance + coinReward;
        
        // ピッチの参加者数をインクリメント（初回投稿時のみ）
        await Pitch.findByIdAndUpdate(pitchId, { $inc: { participants: 1 } });
        
        console.log('✅ 初回チャット投稿: コイン獲得', coinReward);
      } else {
        // ✅ 2回目以降の投稿はコイン獲得なし
        console.log('✅ 2回目以降のチャット投稿: コイン獲得なし');
      }
    } else {
      console.log('✅ スーパーチャット: コイン獲得なし');
    }

    console.log('✅ チャットメッセージ作成成功:', message);
    
    // メッセージとユーザー情報をpopulateして返す
    const populatedMessage = await Message.findById(message._id)
      .populate('user', 'name team')
      .lean();
    
    res.status(201).json({
      success: true,
      message: populatedMessage,
      coinReward: coinReward,
      newBalance: newBalance,
      isFirstPost: isFirstPost // ✅ フロントエンド用の情報
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