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

// メインアプリページ
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QUSIS Demo Day - ピッチ応援プラットフォーム</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://unpkg.com/socket.io-client@4/dist/socket.io.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useContext, createContext } = React;
        
        // API Base URL
        const API_BASE_URL = window.location.origin;
        
        // Configure axios
        axios.defaults.baseURL = API_BASE_URL;
        
        // Socket.io connection
        const socket = io(API_BASE_URL);
        
        // Auth Context
        const AuthContext = createContext();
        
        const AuthProvider = ({ children }) => {
            const [user, setUser] = useState(null);
            const [loading, setLoading] = useState(true);
            const [token, setToken] = useState(null);
            
            useEffect(() => {
                const saved = localStorage.getItem('qusis_auth');
                if (saved) {
                    const { token: t, user: u } = JSON.parse(saved);
                    setToken(t);
                    setUser(u);
                }
                setLoading(false);
            }, []);
            
            const login = async (email, password) => {
                try {
                    const res = await axios.post('/api/auth/login', { email, password });
                    if (res.data.success) {
                        const { token: t, user: u } = res.data;
                        setToken(t);
                        setUser(u);
                        localStorage.setItem('qusis_auth', JSON.stringify({ token: t, user: u }));
                        return { success: true };
                    } else {
                        return { success: false, error: res.data.message };
                    }
                } catch (err) {
                    return {
                        success: false,
                        error: err.response?.data?.message || err.message
                    };
                }
            };
            
            const register = async (payload) => {
                try {
                    const res = await axios.post('/api/auth/register', payload);
                    if (res.data.success) {
                        const { token: t, user: u } = res.data;
                        setToken(t);
                        setUser(u);
                        localStorage.setItem('qusis_auth', JSON.stringify({ token: t, user: u }));
                        return { success: true };
                    } else {
                        return { success: false, error: res.data.message };
                    }
                } catch (err) {
                    return {
                        success: false,
                        error: err.response?.data?.message || err.message
                    };
                }
            };
            
            const logout = () => {
                setToken(null);
                setUser(null);
                localStorage.removeItem('qusis_auth');
            };
            
            return (
                <AuthContext.Provider value={{
                    user, token, loading, isAuthenticated: !!user,
                    login, register, logout
                }}>
                    {children}
                </AuthContext.Provider>
            );
        };
        
        const useAuth = () => useContext(AuthContext);
        
        // Components
        const LandingPage = ({ onNavigate }) => {
            return (
                <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)' }}>
                    <div className="container mx-auto px-4 py-20">
                        <div className="text-center mb-16 text-white">
                            <div className="flex justify-center items-center mb-8">
                                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">Q</span>
                                </div>
                                <span className="ml-4 text-3xl font-bold text-teal-400">QUSIS</span>
                            </div>
                            
                            <h1 className="text-5xl font-bold mb-6">QUSISデモデイ</h1>
                            <p className="text-xl mb-4">次世代起業家たちのピッチイベント</p>
                            <p className="text-lg mb-2">リアルタイムでチャットや投げ銭を通じて</p>
                            <p className="text-lg mb-8">起業家たちを応援しよう</p>
                            
                            <div className="glass-effect rounded-lg p-6 max-w-md mx-auto mb-8">
                                <p className="text-sm mb-2">時間的貢献でQU-coinを獲得し、</p>
                                <p className="text-sm">お気に入りのピッチを応援しよう</p>
                            </div>
                            
                            <div className="mb-8">
                                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                    DISCOVER. SUPPORT. INNOVATE.
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => onNavigate('register')}
                                    className="w-full max-w-xs bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
                                >
                                    <span className="mr-2">👤</span>
                                    アカウントを作成
                                </button>
                                
                                <p className="text-sm">
                                    既にアカウントをお持ちの方は{' '}
                                    <button 
                                        onClick={() => onNavigate('login')}
                                        className="text-teal-300 hover:text-teal-200 underline"
                                    >
                                        こちらからログイン
                                    </button>
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-center mb-8 text-white">本日のタイムスケジュール</h2>
                            <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
                                <div className="flex items-center p-4 bg-gray-100 rounded-lg">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                                        T1
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">test</h3>
                                        <p className="text-gray-600 text-sm">test</p>
                                        <div className="flex items-center mt-2">
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                0 QUcoin
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        const LoginPage = ({ onNavigate }) => {
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [error, setError] = useState('');
            const [loading, setLoading] = useState(false);
            const { login } = useAuth();
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                
                const result = await login(email, password);
                setLoading(false);
                
                if (result.success) {
                    onNavigate('home');
                } else {
                    setError(result.error);
                }
            };
            
            const handleDemoLogin = async (demoUser) => {
                const credentials = {
                    admin: { email: 'admin@example.com', password: 'admin123' },
                    presenter1: { email: 'presenter1@example.com', password: 'presenter123' },
                    viewer1: { email: 'viewer1@example.com', password: 'viewer123' }
                };
                
                const { email, password } = credentials[demoUser];
                setEmail(email);
                setPassword(password);
                
                setLoading(true);
                const result = await login(email, password);
                setLoading(false);
                
                if (result.success) {
                    onNavigate('home');
                } else {
                    setError(result.error);
                }
            };
            
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="flex justify-center items-center mb-4">
                                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">Q</span>
                                </div>
                                <span className="ml-3 text-2xl font-bold text-gray-800">QUSIS</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">ピッチ応援プラットフォーム</h2>
                            <p className="text-gray-600 mt-2">アカウントにログインしてください</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ユーザー名
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ユーザー名を入力"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    パスワード
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="パスワードを入力"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-3">デモアカウント（クリックで自動入力）：</p>
                                <div className="space-y-2 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleDemoLogin('admin')}
                                        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                                    >
                                        admin - 運営（システム運営者・管理者）
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDemoLogin('presenter1')}
                                        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                                    >
                                        presenter1 - 発表者（ピッチ発表者）
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDemoLogin('viewer1')}
                                        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                                    >
                                        viewer1 - 観覧者（一般観覧者・投資家）
                                    </button>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                            >
                                <span className="mr-2">🔐</span>
                                {loading ? 'ログイン中...' : 'ログイン'}
                            </button>
                        </form>
                        
                        <p className="mt-6 text-center text-gray-600">
                            アカウントをお持ちでない場合は{' '}
                            <button 
                                onClick={() => onNavigate('register')}
                                className="text-teal-600 hover:text-teal-500 font-medium"
                            >
                                新規登録
                            </button>
                        </p>
                    </div>
                </div>
            );
        };
        
        const RegisterPage = ({ onNavigate }) => {
            const [formData, setFormData] = useState({
                name: '',
                email: '',
                role: 'viewer',
                team: '',
                password: '',
                confirmPassword: ''
            });
            const [error, setError] = useState('');
            const [loading, setLoading] = useState(false);
            const [showTeamSelect, setShowTeamSelect] = useState(false);
            const { register } = useAuth();
            
            const teams = ['teamα', 'teamβ', 'teamγ', 'teamδ', 'teamε', 'teamζ', 'teamη', 'teamθ', 'teamι'];
            
            const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
                
                if (name === 'role') {
                    setShowTeamSelect(value === 'presenter');
                    if (value !== 'presenter') {
                        setFormData(prev => ({ ...prev, team: '' }));
                    }
                }
            };
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                setError('');
                
                if (formData.password !== formData.confirmPassword) {
                    setError('パスワードが一致しません');
                    return;
                }
                
                if (formData.password.length < 6) {
                    setError('パスワードは6文字以上で入力してください');
                    return;
                }
                
                setLoading(true);
                
                const result = await register({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    team: formData.team,
                    password: formData.password
                });
                
                setLoading(false);
                
                if (result.success) {
                    onNavigate('home');
                } else {
                    setError(result.error);
                }
            };
            
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="flex justify-center items-center mb-4">
                                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">Q</span>
                                </div>
                                <span className="ml-3 text-2xl font-bold text-gray-800">QUSIS</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">アカウント作成</h2>
                            <p className="text-gray-600 mt-2">新しいアカウントを作成してください</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    👤 ユーザー名
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="ユーザー名を入力"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📧 メールアドレス
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    👥 役割
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="viewer">観覧者</option>
                                    <option value="presenter">発表者</option>
                                </select>
                            </div>
                            
                            {showTeamSelect && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        チーム
                                    </label>
                                    <select
                                        name="team"
                                        value={formData.team}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    >
                                        <option value="">チームを選択</option>
                                        {teams.map(team => (
                                            <option key={team} value={team}>{team}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🔒 パスワード
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="6文字以上で入力"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🔒 パスワード確認
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="パスワードを再入力"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                            >
                                <span className="mr-2">👤</span>
                                {loading ? 'アカウント作成中...' : 'アカウント作成'}
                            </button>
                        </form>
                        
                        <p className="mt-6 text-center text-gray-600">
                            既にアカウントをお持ちの場合は{' '}
                            <button 
                                onClick={() => onNavigate('login')}
                                className="text-teal-600 hover:text-teal-500 font-medium"
                            >
                                ログイン
                            </button>
                        </p>
                    </div>
                </div>
            );
        };
        
        const HomePage = ({ onNavigate }) => {
            const { user, logout } = useAuth();
            const [totalCoins, setTotalCoins] = useState(5310);
            
            useEffect(() => {
                socket.on('total-coins-updated', (total) => {
                    setTotalCoins(total);
                });
                
                return () => {
                    socket.off('total-coins-updated');
                };
            }, []);
            
            const getNavigation = () => {
                switch (user?.role) {
                    case 'admin':
                        return ['管理画面', '使い方'];
                    case 'presenter':
                        return ['ピッチ管理', '使い方'];
                    default:
                        return ['使い方'];
                }
            };
            
            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="bg-white shadow-sm border-b">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-8">
                                    <button 
                                        onClick={() => onNavigate('home')}
                                        className="flex items-center"
                                    >
                                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">Q</span>
                                        </div>
                                        <span className="ml-2 text-xl font-bold text-gray-800">QUSIS</span>
                                    </button>
                                    
                                    <nav className="flex space-x-6">
                                        {getNavigation().map(item => (
                                            <button
                                                key={item}
                                                className="text-gray-600 hover:text-gray-800 font-medium"
                                                onClick={() => {
                                                    if (item === '使い方') onNavigate('guide');
                                                    else if (item === '管理画面') onNavigate('admin');
                                                    else if (item === 'ピッチ管理') onNavigate('pitch-management');
                                                }}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                        <span className="mr-1">🪙</span>
                                        <span className="font-bold text-yellow-800">{user?.coinBalance || 500} QUcoin</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onNavigate('coins')}
                                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center"
                                    >
                                        <span className="mr-1">➕</span>
                                        コインを増やす
                                    </button>
                                    
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">
                                                {user?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">{user?.name}</div>
                                            <div className="text-gray-500">ID: {user?.id}</div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            🚪
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-teal-600 mb-2">QUSISデモデイ</h1>
                            <p className="text-gray-600">ピッチ応援アプリ</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden card-hover">
                                {/* Pitch Card Header */}
                                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <span className="mr-2">🕐</span>
                                            <span className="bg-black bg-opacity-20 px-3 py-1 rounded-full text-sm">開始前</span>
                                            <span className="ml-4 mr-1">➕</span>
                                            <span className="text-sm">NEW</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2">👥</span>
                                            <span>0人参加</span>
                                        </div>
                                    </div>
                                    
                                    {/* Analytics Chart Area */}
                                    <div className="bg-black bg-opacity-20 rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">223</div>
                                                <div className="text-xs opacity-75">Total clicks</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">17.6K</div>
                                                <div className="text-xs opacity-75">Total impressions</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">1.3%</div>
                                                <div className="text-xs opacity-75">Average CTR</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">25.2</div>
                                                <div className="text-xs opacity-75">Average position</div>
                                            </div>
                                        </div>
                                        
                                        {/* Chart placeholder */}
                                        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded opacity-50 flex items-end justify-around p-2">
                                            {[...Array(12)].map((_, i) => {
                                                const height = Math.random() * 80 + 20;
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className="bg-white rounded w-4" 
                                                        style={{height: height + '%'}}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pitch Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">test</h2>
                                            <p className="text-gray-600">test</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">開始前</span>
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="bg-yellow-100 rounded-lg p-6 mb-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-yellow-800 mb-2">💰 0 QUcoin</div>
                                            <p className="text-yellow-700">応援コイン合計</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-800">👥</div>
                                            <div className="text-2xl font-bold text-gray-800">0</div>
                                            <div className="text-sm text-gray-600">観覧者</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-800">🕐</div>
                                            <div className="text-2xl font-bold text-gray-800">LIVE</div>
                                            <div className="text-sm text-gray-600">ステータス</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-800">#184</div>
                                            <div className="text-sm text-gray-600">イベントID</div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onNavigate('pitch-detail')}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
                                    >
                                        開始を待つ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        };
        
        const GuideePage = ({ onNavigate }) => {
            const { user } = useAuth();
            
            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="bg-white shadow-sm border-b">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex justify-between items-center">
                                <button 
                                    onClick={() => onNavigate('home')}
                                    className="flex items-center"
                                >
                                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">Q</span>
                                    </div>
                                    <span className="ml-2 text-xl font-bold text-gray-800">QUSIS</span>
                                </button>
                                
                                <nav className="flex space-x-6">
                                    <span className="text-gray-800 font-medium">使い方</span>
                                </nav>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                        <span className="mr-1">🪙</span>
                                        <span className="font-bold text-yellow-800">{user?.coinBalance || 2430} QUcoin</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onNavigate('coins')}
                                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center"
                                    >
                                        <span className="mr-1">➕</span>
                                        コインを増やす
                                    </button>
                                    
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">
                                                {user?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">{user?.name}</div>
                                            <div className="text-gray-500">ID: {user?.id}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">アプリの使い方ガイド</h1>
                                <p className="text-gray-600">QUSISピッチ応援プラットフォームの使い方とQUcoinの活用方法</p>
                            </div>
                            
                            {/* QUcoinとは */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">🪙</span>
                                    <h2 className="text-2xl font-bold text-gray-800">QUcoinとは</h2>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    QUcoinは、ピッチイベントで使用される仮想通貨です。観覧者がプレゼンターを応援するためのギフトとして使用できます。
                                </p>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="mr-2">⭐</span>
                                        <h3 className="font-bold text-yellow-800">新規登録ボーナス</h3>
                                    </div>
                                    <p className="text-yellow-700">アカウント作成時に500 QUcoinをプレゼント！</p>
                                </div>
                            </div>
                            
                            {/* QUcoinの獲得方法 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <div className="flex items-center mb-6">
                                    <span className="text-2xl mr-3">🎯</span>
                                    <h2 className="text-2xl font-bold text-gray-800">QUcoinの獲得方法</h2>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-xl">💬</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-2">チャット投稿</h3>
                                            <p className="text-gray-600 text-sm">イベントのチャットにメッセージを投稿すると20 QUcoin獲得</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xl">🕐</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-2">時間貢献</h3>
                                            <p className="text-gray-600 text-sm">ボランティア活動や貢献活動を申請してコインを獲得</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* QUcoinの使い方 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <div className="flex items-center mb-6">
                                    <span className="text-2xl mr-3">🎁</span>
                                    <h2 className="text-2xl font-bold text-gray-800">QUcoinの使い方</h2>
                                </div>
                                
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-bold text-pink-800 mb-2">投げ銭</h3>
                                    <p className="text-pink-700 text-sm">気に入ったピッチプレゼンテーションに対してQUcoinで投げ銭ができます。</p>
                                </div>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-bold text-yellow-800 mb-3">重要なルール</h3>
                                    <ul className="space-y-2 text-yellow-700 text-sm">
                                        <li>• 自分のチームのピッチには投げ銭を送信できません</li>
                                        <li>• 送信した投げ銭は取り消しできません</li>
                                    </ul>
                                </div>
                            </div>
                            
                            {/* ステップバイステップガイド */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">ステップバイステップガイド</h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">イベントに参加</h3>
                                            <p className="text-gray-600 text-sm">ホームページからライブ中のピッチイベントを選択して参加します</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">チャットで交流</h3>
                                            <p className="text-gray-600 text-sm">イベントチャットでメッセージを投稿してコインを獲得し、他の参加者と交流します</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">投げ銭を送信</h3>
                                            <p className="text-gray-600 text-sm">気に入ったプレゼンテーションにQUcoinで投げ銭をして応援します</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">履歴を確認・コインをさらに獲得</h3>
                                            <p className="text-gray-600 text-sm">ページ上部の「コインを増やす」ボタンからコインの獲得や使用履歴の確認ができます</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        };
        
        const CoinsPage = ({ onNavigate }) => {
            const { user } = useAuth();
            const [showContributionModal, setShowContributionModal] = useState(false);
            
            const contributionOptions = [
                { type: 'offline', label: 'オフラインヒアリング', rate: 400 },
                { type: 'online', label: 'オンラインヒアリング', rate: 200 },
                { type: 'event', label: 'QUSISイベント参加', rate: 100 }
            ];
            
            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header - same as HomePage */}
                    <header className="bg-white shadow-sm border-b">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex justify-between items-center">
                                <button 
                                    onClick={() => onNavigate('home')}
                                    className="flex items-center"
                                >
                                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">Q</span>
                                    </div>
                                    <span className="ml-2 text-xl font-bold text-gray-800">QUSIS</span>
                                </button>
                                
                                <nav className="flex space-x-6">
                                    <span className="text-gray-600 hover:text-gray-800 font-medium">使い方</span>
                                </nav>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                        <span className="mr-1">🪙</span>
                                        <span className="font-bold text-yellow-800">{user?.coinBalance || 2430} QUcoin</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onNavigate('coins')}
                                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center"
                                    >
                                        <span className="mr-1">➕</span>
                                        コインを増やす
                                    </button>
                                    
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">
                                                {user?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">{user?.name}</div>
                                            <div className="text-gray-500">ID: {user?.id}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">QU-coinチャージ・履歴確認</h1>
                                <p className="text-gray-600">{user?.name}さんのQU-coin状況</p>
                            </div>
                            
                            {/* 協力によるコイン獲得 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">QUSISへの協力によるコイン獲得</h2>
                                <p className="text-gray-600 mb-6">あなたの貴重な時間を起業家支援に</p>
                                <p className="text-gray-600 text-sm mb-6">
                                    いただいた時間は、起業家のアイデア設計、ビジネスモデルのヒアリング、QUSISイベントへの参加などに活用させていただきます。
                                    あなたの経験や視点が、次世代の起業家たちの成長を支える重要な資源となります。
                                </p>
                                
                                <div className="space-y-4 mb-6">
                                    {contributionOptions.map((option) => (
                                        <div key={option.type} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{option.label}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {option.type === 'offline' && '起業家と直接対面し、アイデアの練り上げやビジネスモデルの深掘りを行います。あなたの経験や視点を活かし、起業家の成長をサポートしてください。'}
                                                        {option.type === 'online' && 'オンラインでの起業家ヒアリングに参加し、アイデアのブラッシュアップや課題解決のディスカッションを行います。場所を選ばず貢献できます。'}
                                                        {option.type === 'event' && 'ピッチイベントやワークショップ、起業家コミュニティイベントに参加し、次世代の起業家たちとの交流や学びの場を共創します。'}
                                                    </p>
                                                </div>
                                                <span className="font-bold text-lg">
                                                    {option.rate}コイン/時間
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => setShowContributionModal(true)}
                                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
                                >
                                    <span className="mr-2">➕</span>
                                    コインを増やす
                                </button>
                            </div>
                            
                            {/* 統計カード */}
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">2430 QU</div>
                                    <div className="text-gray-600">現在のQU-coin残高</div>
                                </div>
                                
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <div className="text-2xl font-bold text-green-600 mb-2">4300 QU</div>
                                    <div className="text-gray-600">総獲得QU-coin</div>
                                </div>
                                
                                <div className="bg-white rounded-lg shadow p-6 text-center">
                                    <div className="text-2xl font-bold text-red-600 mb-2">1870 QU</div>
                                    <div className="text-gray-600">総使用QU-coin</div>
                                </div>
                            </div>
                            
                            {/* QU-coin履歴 */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center mb-6">
                                    <span className="text-xl mr-3">📋</span>
                                    <h2 className="text-xl font-bold text-gray-800">QU-coin履歴</h2>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🎁</span>
                                            <div>
                                                <div className="font-medium">イベントへのギフト送信</div>
                                                <div className="text-sm text-gray-600">2025/6/26 16:59</div>
                                            </div>
                                        </div>
                                        <div className="text-red-600 font-bold">-100</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🎁</span>
                                            <div>
                                                <div className="font-medium">イベントへのギフト送信</div>
                                                <div className="text-sm text-gray-600">2025/6/26 11:28</div>
                                            </div>
                                        </div>
                                        <div className="text-red-600 font-bold">-20</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🎁</span>
                                            <div>
                                                <div className="font-medium">イベントへのギフト送信</div>
                                                <div className="text-sm text-gray-600">2025/6/26 11:28</div>
                                            </div>
                                        </div>
                                        <div className="text-red-600 font-bold">-100</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🕐</span>
                                            <div>
                                                <div className="font-medium">オフラインヒアリング</div>
                                                <div className="text-sm text-gray-600">2025/6/26 11:28</div>
                                            </div>
                                        </div>
                                        <div className="text-green-600 font-bold">+400</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🕐</span>
                                            <div>
                                                <div className="font-medium">オンラインヒアリング</div>
                                                <div className="text-sm text-gray-600">2025/6/26 11:28</div>
                                            </div>
                                        </div>
                                        <div className="text-green-600 font-bold">+200</div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="mr-3">🕐</span>
                                            <div>
                                                <div className="font-medium">イベント参加</div>
                                                <div className="text-sm text-gray-600">2025/6/26 11:27</div>
                                            </div>
                                        </div>
                                        <div className="text-green-600 font-bold">+100</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        };
        
        // Main App Component
        const App = () => {
            const [currentPage, setCurrentPage] = useState('landing');
            const { loading, isAuthenticated } = useAuth();
            
            useEffect(() => {
                if (!loading) {
                    if (isAuthenticated && currentPage === 'landing') {
                        setCurrentPage('home');
                    } else if (!isAuthenticated && !['landing', 'login', 'register'].includes(currentPage)) {
                        setCurrentPage('landing');
                    }
                }
            }, [loading, isAuthenticated, currentPage]);
            
            if (loading) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">Q</span>
                            </div>
                            <p className="text-gray-600">読み込み中...</p>
                        </div>
                    </div>
                );
            }
            
            const renderPage = () => {
                switch (currentPage) {
                    case 'landing':
                        return <LandingPage onNavigate={setCurrentPage} />;
                    case 'login':
                        return <LoginPage onNavigate={setCurrentPage} />;
                    case 'register':
                        return <RegisterPage onNavigate={setCurrentPage} />;
                    case 'home':
                        return <HomePage onNavigate={setCurrentPage} />;
                    case 'guide':
                        return <GuideePage onNavigate={setCurrentPage} />;
                    case 'coins':
                        return <CoinsPage onNavigate={setCurrentPage} />;
                    default:
                        return <HomePage onNavigate={setCurrentPage} />;
                }
            };
            
            return renderPage();
        };
        
        // Render the app
        ReactDOM.render(
            <AuthProvider>
                <App />
            </AuthProvider>,
            document.getElementById('root')
        );
    </script>
</body>
</html>
  `);
});

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
  console.log(`🚀 Complete App Server listening on port ${port}`);
  console.log(`📱 App available at: http://localhost:${port} (dev) or https://qusis-demo-day-1.onrender.com (prod)`);
});