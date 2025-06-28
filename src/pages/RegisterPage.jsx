import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Users, ArrowLeft, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    team: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    if (formData.role === 'presenter' && !formData.team) {
      setError('発表者の場合はチーム名を入力してください');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-teal-400 hover:text-teal-300 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>戻る</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">

          </div>
          <h1 className="text-2xl font-bold text-white mb-2">アカウント作成</h1>
          <p className="text-gray-400">QUSISデモデイに参加しましょう</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                お名前
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="山田太郎"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="your@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="6文字以上"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="パスワードを再入力"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                参加タイプ
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="viewer">観覧者（ピッチを見て応援）</option>
                <option value="presenter">発表者（ピッチを行う）</option>
              </select>
            </div>

            {formData.role === 'presenter' && (
             <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-300 mb-2">
                チームを選択
                </label>
                <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="" disabled>チームを選択してください</option>
                    <option value="teamα">teamα（アルファ）</option>
                    <option value="teamβ">teamβ（ベータ）</option>
                    <option value="teamγ">teamγ（ガンマ）</option>
                    <option value="teamδ">teamδ（デルタ）</option>
                    <option value="teamε">teamε（イプシロン）</option>
                    <option value="teamζ">teamζ（ゼータ）</option>
                    <option value="teamη">teamη（イータ）</option>
                    <option value="teamθ">teamθ（シータ）</option>

                </select>
               </div>
             </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'アカウント作成中...' : 'アカウントを作成'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              既にアカウントをお持ちの方は{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 underline">
                こちらからログイン
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-medium mb-2">参加タイプについて</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div>
              <span className="text-blue-400">観覧者:</span> ピッチを見て、チャットや投げ銭で応援
            </div>
            <div>
              <span className="text-green-400">発表者:</span> 自分のピッチを登録・管理し、発表
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;