// src/models/Pitch.js - 効率的最適化版
import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true
  },
  description: String,
  coverImage: String,
  team: String,
  status: { 
    type: String, 
    enum: ['upcoming', 'live', 'ended'], 
    default: 'upcoming'
  },
  totalTips: { 
    type: Number, 
    default: 0
  },
  participants: { 
    type: Number, 
    default: 0
  },
  schedule: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, { 
  timestamps: true
});

// 🚀 最も重要なインデックスのみ（書き込み性能を維持）
pitchSchema.index({ status: 1, createdAt: -1 });      // メイン：ステータス別一覧表示
pitchSchema.index({ createdBy: 1 });                  // ユーザーのピッチ管理用
pitchSchema.index({ team: 1 });                       // チーム別検索用

export default mongoose.model('Pitch', pitchSchema);