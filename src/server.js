// src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';

import pitchesRoutes from './routes/pitches.js';
import tipsRoutes from './routes/tips.js';
import messagesRoutes from './routes/messages.js';
import contributionsRoutes from './routes/contributions.js';

import { Server as IOServer } from 'socket.io';
const io = new IOServer(server, { cors:{ origin:'*' } });

// 投げ銭のChangeStream
mongoose.connection.collection('tips').watch()
  .on('change', async _ => {
    // 合計を再計算して全クライアントに送る
    const [{ sum }] = await Tip.aggregate([{ $group:{ _id:null, sum:{ $sum:'$amount' }}}]);
    io.emit('total-coins-updated', sum || 0);
  });

io.on('connection', socket => {
  // 接続時に現在値を送信
  (async ()=>{
    const [{ sum }] = await Tip.aggregate([{ $group:{ _id:null, sum:{ $sum:'$amount' }}}]);
    socket.emit('total-coins-updated', sum || 0);
  })();
});

app.use('/api/pitches', pitchesRoutes);
app.use('/api/tips',    tipsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/contributions', contributionsRoutes);

dotenvFlow.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/ping', (_, res) => {
  res.send('pong');
});

const port = process.env.BACKEND_PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
