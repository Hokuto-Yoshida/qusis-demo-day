// src/server-prod.js
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as IOServer } from 'socket.io';

// ルート
import authRoutes from './routes/auth.js';
import pitchesRoutes from './routes/pitches.js';
import tipsRoutes from './routes/tips.js';
import messagesRoutes from './routes/messages.js';
import contributionsRoutes from './routes/contributions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express アプリを作成
const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイルの配信（ビルドされたReactアプリ）
app.use(express.static(path.join(__dirname, '../dist')));

// ping エンドポイント
app.get('/ping', (_req, res) => {
  console.log('🏓 Ping received');
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: 'production'
  });
});

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/pitches', pitchesRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/contributions', contributionsRoutes);

// React Router対応（SPA）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// HTTP サーバーとSocket.io
const server = http.createServer(app);
const io = new IOServer(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  } 
});

// MongoDB 接続
const uri = process.env.MONGODB_URI || 'your-mongodb-uri';
if (uri !== 'your-mongodb-uri') {
  mongoose
    .connect(uri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// Socket.io接続
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// サーバー起動
const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${port}`);
});