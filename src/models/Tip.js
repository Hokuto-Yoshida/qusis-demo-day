// src/models/Tip.js - 高速化版
import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// 🚀 高速化のための重要インデックス
tipSchema.index({ pitch: 1, createdAt: -1 });    // ピッチ別投げ銭履歴（最新順）
tipSchema.index({ user: 1, createdAt: -1 });     // ユーザー別投げ銭履歴
tipSchema.index({ createdAt: -1 });              // 管理画面の最新投げ銭表示用

export default mongoose.model('Tip', tipSchema);