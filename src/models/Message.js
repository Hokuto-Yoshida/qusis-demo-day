// src/models/Message.js - 高速化版
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  pitch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pitch',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// 🚀 高速化のための重要インデックス
messageSchema.index({ pitch: 1, createdAt: -1 });     // ピッチ別チャット履歴（最新順）
messageSchema.index({ user: 1, createdAt: -1 });      // ユーザー別メッセージ履歴
messageSchema.index({ createdAt: -1 });               // 全体最新メッセージ用

export default mongoose.model('Message', messageSchema);