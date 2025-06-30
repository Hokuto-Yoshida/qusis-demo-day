// src/models/Tip.js
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
  timestamps: true  // createdAt / updatedAt を自動追加
});

export default mongoose.model('Tip', tipSchema);
