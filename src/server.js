// src/server.js - 完全版
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import { Server as IOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// モデルのインポート
import Tip from './models/Tip.js';

// ルート
import pitchesRoutes from './routes/pitches.js';
import tipsRoutes from './routes/tips.js';
import messagesRoutes from './routes/messages.js';
import contributionsRoutes from './routes/contributions.js';
import authRoutes from './routes/auth.js';  
import coinsRoutes from './routes/coins.js';
import adminRoutes from './routes/admin.js';

// .env ファイルの読み込み
dotenvFlow.config();

const app = express();
app.use(cors({
  origin: ['https://qusis-demo-day-1.onrender.com', 'http://localhost:5173', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// 静的ファイルを配信（HTML/CSS/JS版）
app.use(express.static(path.join(__dirname, '../public')));

// 本番環境での追加設定（React dist用）
if (process.env.NODE_ENV === 'production') {
  app.use('/react', express.static(path.join(__dirname, '../dist')));
}

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
app.use('/api/admin', adminRoutes);

// HTMLページのルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

app.get('/pitch/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pitch-detail.html'));
});

app.get('/pitch-management', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pitch-management.html'));
});

app.get('/coin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/coin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/usage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/usage.html'));
});

// ヘルスチェック用エンドポイント
app.get('/ping', (req, res) => res.status(200).json({ status: 'OK' }));

// React版への切り替えルート（デバッグ用）
if (process.env.NODE_ENV === 'production') {
  app.get('/react/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// HTTP サーバーとSocket.io
const server = http.createServer(app);
const io = new IOServer(server, { 
  cors: { 
    origin: ['https://qusis-demo-day-1.onrender.com', 'http://localhost:5173', 'http://localhost:4000'],
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

// ===== リアルタイム観覧者数機能 =====

// ピッチごとの観覧者管理
const pitchViewers = new Map(); // pitchId -> Set of socketIds
const socketToPitch = new Map(); // socketId -> pitchId
const socketToUser = new Map();  // socketId -> userId

// ピッチから離脱する関数
function leavePitch(socketId, pitchId) {
    if (pitchViewers.has(pitchId)) {
        pitchViewers.get(pitchId).delete(socketId);
        
        // 観覧者数更新をブロードキャスト
        const viewerCount = pitchViewers.get(pitchId).size;
        io.to(`pitch-${pitchId}`).emit('viewer-count-updated', {
            pitchId,
            count: viewerCount
        });
        
        console.log(`📉 ピッチ ${pitchId} の観覧者数: ${viewerCount}`);
        
        // 観覧者が0になったらMapから削除
        if (viewerCount === 0) {
            pitchViewers.delete(pitchId);
        }
    }
    
    // マッピングから削除
    socketToPitch.delete(socketId);
    socketToUser.delete(socketId);
}

// Socket.io接続処理
io.on('connection', async socket => {
    console.log('🔌 ユーザー接続:', socket.id);
    
    // 投げ銭合計を送信（既存機能）
    const agg = await Tip.aggregate([
        { $group: { _id: null, sum: { $sum: '$amount' } } }
    ]);
    const total = agg[0]?.sum || 0;
    socket.emit('total-coins-updated', total);

    // ピッチルームに参加
    socket.on('join-pitch', (data) => {
        const { pitchId, userId } = data;
        
        console.log(`👤 ユーザー ${userId} がピッチ ${pitchId} に参加`);
        
        // 既に他のピッチを見ている場合は離脱
        if (socketToPitch.has(socket.id)) {
            const prevPitchId = socketToPitch.get(socket.id);
            leavePitch(socket.id, prevPitchId);
        }
        
        // 新しいピッチに参加
        socket.join(`pitch-${pitchId}`);
        
        // 観覧者リストに追加
        if (!pitchViewers.has(pitchId)) {
            pitchViewers.set(pitchId, new Set());
        }
        pitchViewers.get(pitchId).add(socket.id);
        
        // マッピング更新
        socketToPitch.set(socket.id, pitchId);
        socketToUser.set(socket.id, userId);
        
        // リアルタイム観覧者数をブロードキャスト
        const viewerCount = pitchViewers.get(pitchId).size;
        io.to(`pitch-${pitchId}`).emit('viewer-count-updated', {
            pitchId,
            count: viewerCount
        });
        
        console.log(`📊 ピッチ ${pitchId} の観覧者数: ${viewerCount}`);
    });

    // ピッチルームから離脱
    socket.on('leave-pitch', (pitchId) => {
        console.log(`👋 ユーザー ${socketToUser.get(socket.id)} がピッチ ${pitchId} から離脱`);
        leavePitch(socket.id, pitchId);
        socket.leave(`pitch-${pitchId}`);
    });

    // 現在の観覧者数を取得
    socket.on('get-viewer-count', (pitchId) => {
        const count = pitchViewers.has(pitchId) ? pitchViewers.get(pitchId).size : 0;
        socket.emit('viewer-count-updated', { pitchId, count });
    });

    // 接続切断時
    socket.on('disconnect', () => {
        console.log('🔌 ユーザー切断:', socket.id);
        
        // 参加していたピッチから離脱
        if (socketToPitch.has(socket.id)) {
            const pitchId = socketToPitch.get(socket.id);
            leavePitch(socket.id, pitchId);
        }
    });
});

// デバッグ用：定期的に観覧者数をログ出力（10秒ごと）
setInterval(() => {
    if (pitchViewers.size > 0) {
        console.log('📊 現在の観覧者数:');
        pitchViewers.forEach((viewers, pitchId) => {
            console.log(`  ピッチ ${pitchId}: ${viewers.size}人`);
        });
    }
}, 10000); // 10秒ごと

const port = process.env.PORT || 4001;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📱 HTML版: http://localhost:${port}`);
  console.log(`⚛️  React版: http://localhost:${port}/react`);
});