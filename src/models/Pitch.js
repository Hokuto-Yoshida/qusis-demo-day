import mongoose from 'mongoose';
const pitchSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  coverImage:  String,
  team:        String,
  status:      { type: String, enum: ['upcoming','live','ended'], default: 'upcoming' },
  totalTips:   { type: Number, default: 0 },
  participants:{ type: Number, default: 0 },
  schedule:    String,
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 追加
}, { timestamps: true });
export default mongoose.model('Pitch', pitchSchema);