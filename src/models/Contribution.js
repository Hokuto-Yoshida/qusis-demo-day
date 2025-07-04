// src/models/Contribution.js - 高速化版
import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['オフラインヒアリング', 'オンラインヒアリング', 'QUSISイベント参加', 'other']
  },
  hours: {
    type: Number,
    required: true,
    min: 0.1
  },
  coinsAwarded: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// 🚀 高速化のための重要インデックス
contributionSchema.index({ user: 1, createdAt: -1 });     // ユーザー別貢献履歴
contributionSchema.index({ createdAt: -1 });              // 管理画面の最新貢献表示用
contributionSchema.index({ type: 1 });                    // 貢献タイプ別集計用

export default mongoose.model('Contribution', contributionSchema);