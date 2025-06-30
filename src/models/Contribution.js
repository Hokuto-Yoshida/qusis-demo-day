// src/models/Contribution.js
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
    enum: ['オフラインヒアリング', 'オンラインヒアリング', 'QUSISイベント参加', 'other'] // 日本語に変更
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

export default mongoose.model('Contribution', contributionSchema);