// src/server.js
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import { Server as IOServer } from 'socket.io';

// モデルのインポート
import Tip from './models/Tip.js';

// ルート
import pitchesRoutes from './routes/pitches.js';
import tipsRoutes from './routes/tips.js';
import messagesRoutes from './routes/messages.js';
import contributionsRoutes from './routes/contributions.js';
import authRoutes from './routes/auth.js';  
import coinsRoutes from './routes/coins.js';

// .env ファイルの読み込み
dotenvFlow.config();

const app = express();
app.use(cors({
  origin: ['https://qusis-demo-day-1.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// ping エンドポイント
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// API ルート
app.use('/api/auth', authRoutes);          
app.use('/api/coins', coinsRoutes);
app.use('/api/pitches', pitchesRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/contributions', contributionsRoutes);

// HTTP サーバーとSocket.io
const server = http.createServer(app);
const io = new IOServer(server, { 
  cors: { 
    origin: ['https://qusis-demo-day-1.onrender.com', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true
  } 
});

// MongoDB 接続
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 投げ銭合計をリアルタイム送信
mongoose.connection.once('open', () => {
  const tipColl = mongoose.connection.collection('tips');
  tipColl.watch().on('change', async () => {
    const agg = await Tip.aggregate([
      { $group: { _id: null, sum: { $sum: '$amount' } } }
    ]);
    const total = agg[0]?.sum || 0;
    io.emit('total-coins-updated', total);
  });
});

io.on('connection', async socket => {
  const agg = await Tip.aggregate([
    { $group: { _id: null, sum: { $sum: '$amount' } } }
  ]);
  const total = agg[0]?.sum || 0;
  socket.emit('total-coins-updated', total);
});

const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API Server listening on port ${port}`);
});