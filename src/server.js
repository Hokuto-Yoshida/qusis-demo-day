// src/server.js
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import { Server as IOServer } from 'socket.io';

// モデルのインポート（Tip Aggregation に使う）
import Tip from './models/Tip.js';

// ルート
import pitchesRoutes from './routes/pitches.js';
import tipsRoutes from './routes/tips.js';
import messagesRoutes from './routes/messages.js';
import contributionsRoutes from './routes/contributions.js';

// .env ファイルの読み込み
dotenvFlow.config();

// 1) Express アプリを作成
const app = express();
app.use(cors());
app.use(express.json());

// 2) ping エンドポイント
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// 3) 各 API ルート
import authRoutes from './routes/auth.js';  // 追加

app.use('/api/auth', authRoutes);           // 追加
app.use('/api/pitches', pitchesRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/contributions', contributionsRoutes);

// 4) HTTP サーバーを立ち上げてから Socket.io を紐づける
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

// MongoDB 接続
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 投げ銭合計をリアルタイム送信する ChangeStream
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

// 新規接続時にも現在値を送る
io.on('connection', async socket => {
  const agg = await Tip.aggregate([
    { $group: { _id: null, sum: { $sum: '$amount' } } }
  ]);
  const total = agg[0]?.sum || 0;
  socket.emit('total-coins-updated', total);
});

// 5) サーバー起動 - IPv4で明示的にバインド
const port = process.env.BACKEND_PORT || 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
  console.log(`📡 IPv4 Test: curl http://127.0.0.1:${port}/ping`);
  console.log(`📡 Localhost Test: curl http://localhost:${port}/ping`);
});