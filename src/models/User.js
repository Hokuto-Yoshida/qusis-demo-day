import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['viewer','presenter','admin'], default: 'viewer' },
  coinBalance: { type: Number, default: 600 },
  team:        { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);