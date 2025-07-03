// src/models/Pitch.js - 最適化版
import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    index: true  // タイトル検索用
  },
  description: String,
  coverImage: String,
  team: { 
    type: String,
    index: true  // チーム別検索用
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'live', 'ended'], 
    default: 'upcoming',
    index: true  // ステータス別検索用（重要）
  },
  totalTips: { 
    type: Number, 
    default: 0,
    index: true  // 人気順ソート用
  },
  participants: { 
    type: Number, 
    default: 0,
    index: true  // 参加者数ソート用
  },
  schedule: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true  // 作成者別検索用
  }
}, { 
  timestamps: true  // createdAt, updatedAt 自動追加
});

// 複合インデックス（クエリパフォーマンス向上）
pitchSchema.index({ status: 1, createdAt: -1 });      // ステータス + 作成日時（降順）
pitchSchema.index({ team: 1, status: 1 });            // チーム + ステータス
pitchSchema.index({ status: 1, totalTips: -1 });      // ステータス + 人気順
pitchSchema.index({ createdBy: 1, createdAt: -1 });   // 作成者 + 作成日時
pitchSchema.index({ status: 1, participants: -1 });   // ステータス + 参加者数順

// 管理画面用：アクティブなピッチを高速取得
pitchSchema.index({ status: 1, updatedAt: -1 });      // ステータス + 更新日時

// 検索用：タイトル部分一致（テキスト検索）
pitchSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Pitch', pitchSchema);