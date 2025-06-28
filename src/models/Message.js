// src/models/Message.js
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

export default mongoose.model('Message', messageSchema);
