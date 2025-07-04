// src/models/User.js - シンプル最適化版
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['viewer','presenter','admin'], default: 'viewer' },
  coinBalance: { type: Number, default: 600 },
  team:        { type: String },
}, { timestamps: true });

// 🚀 パフォーマンス向上のために最低限必要なインデックス
userSchema.index({ role: 1 });                    // 管理画面の役割フィルタリング用
userSchema.index({ team: 1 });                    // チーム検索用
userSchema.index({ createdAt: -1 });              // 登録日順ソート用

export default mongoose.model('User', userSchema);