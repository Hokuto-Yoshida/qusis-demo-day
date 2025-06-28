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
    enum: ['offline_hearing', 'online_hearing', 'event_participation', 'other']
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
