import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePitches } from '../context/PitchContext';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinContext';
import { 
  Users, 
  TrendingUp, 
  Send, 
  Gift, 
  Trophy, 
  BarChart3, 
  Clock,
  ArrowLeft,
  Heart
} from 'lucide-react';

const PitchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { spendCoins, earnChatCoins } = useCoins();
  const { 
    getPitchById, 
    chatMessages, 
    addChatMessage, 
    addTip, 
    getTopSupporters 
  } = usePitches();

  const [pitch, setPitch] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [showCustomTip, setShowCustomTip] = useState(false);
  const chatEndRef = useRef(null);

  const presetTips = [
    { amount: 10, label: '応援', color: 'bg-teal-500' },
    { amount: 20, label: '頑張って！', color: 'bg-teal-600' },
    { amount: 50, label: '素晴らしい！', color: 'bg-teal-700' },
    { amount: 100, label: '最高！', color: 'bg-teal-800' }
  ];

  useEffect(() => {
    const foundPitch = getPitchById(id);
    if (foundPitch) {
      setPitch(foundPitch);
    } else {
      navigate('/home');
    }
  }, [id, getPitchById, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages[id]]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    addChatMessage(parseInt(id), newMessage, user);
    earnChatCoins(); // 20 QUcoin獲得
    setNewMessage('');
  };

  const handleSendTip = (amount) => {
    if (!user || user.coinBalance < amount) {
      alert('コインが不足しています');
      return;
    }

    const success = spendCoins(amount, `${pitch.title}への投げ銭`);
    if (success) {
      addTip(parseInt(id), amount, tipMessage, user);
      setTipMessage('');
      setTipAmount('');
      setShowCustomTip(false);
      alert(`${amount} QUcoinを送信しました！`);
    }
  };

  const handleCustomTip = () => {
    const amount = parseInt(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('有効な金額を入力してください');
      return;
    }
    handleSendTip(amount);
  };

  if (!pitch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const messages = chatMessages[id] || [];
  const supporters = getTopSupporters(parseInt(id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ホームに戻る</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{pitch.title}</h1>
        <p className="text-gray-600">{pitch.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Pitch Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pitch Display */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Cover Image/Demo Area */}
            <div className="h-64 bg-gradient-to-br from-teal-500 to-blue-600 relative">
              {pitch.coverImage ? (
                <img 
                  src={pitch.coverImage} 
                  alt={pitch.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <div className="text-2xl font-bold mb-2">{pitch.team}</div>
                    <div className="text-sm opacity-90">{pitch.status === 'live' ? 'デモ進行中' : 'まもなく開始予定です'}</div>
                  </div>
                </div>
              )}
              
              {/* Status Overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {pitch.status === 'live' ? 'LIVE' : pitch.status === 'ended' ? '終了' : '開始前'}
              </div>
            </div>

            {/* Pitch Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                  {pitch.team}
                </span>
                <span className="text-gray-500 text-sm">#{pitch.id}</span>
              </div>

              {/* Stats Bar */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-800 mb-2">
                      {pitch.totalTips}
                    </div>
                    <div className="text-yellow-700 text-sm">総応援コイン</div>
                    <div className="text-yellow-600 text-xs">QUcoin</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">観覧者</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{pitch.participants}</div>
                  <div className="text-gray-500 text-sm">人</div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">ステータス</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {pitch.status === 'live' ? 'LIVE' : pitch.status === 'ended' ? '終了' : '開始前'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">チャット</h3>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {message.avatar || message.user.substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{message.user}</span>
                      <span className="text-gray-500 text-xs">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Gift History Tab */}
            <div className="border-t p-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm">
                <Gift className="w-4 h-4" />
                <span>ギフト履歴</span>
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="応援メッセージを送る..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">チャット参加で20 QUcoin獲得！</p>
            </form>
          </div>
        </div>

        {/* Right Column - Support */}
        <div className="space-y-6">
        {/* Tip Section: 自分のチームのピッチでは非表示 */}
        {pitch.team !== user.team && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">応援の気持ちを投げ銭で表現しよう！</h3>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border">
                ※この投げ銭は仮想的な表現です。金銭的取引は運営しません。
              </div>

              {/* Preset Tips */}
              <div className="grid grid-cols-2 gap-3">
                {presetTips.map((tip) => (
                  <button
                    key={tip.amount}
                    onClick={() => handleSendTip(tip.amount)}
                    className={`${tip.color} hover:opacity-90 text-white p-3 rounded-lg text-center transition-opacity`}
                  >
                    <div className="text-sm font-medium">{tip.label}</div>
                    <div className="text-lg font-bold">{tip.amount} QUcoin</div>
                  </button>
                ))}
              </div>

              <div className="text-center text-sm text-gray-500">
                残高: {user?.coinBalance?.toLocaleString()} QUcoin
              </div>
            </div>
          </div>
        )}

          {/* Support Ranking */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">応援ランキング</h3>
              </div>
            </div>

            <div className="p-4">
              {supporters.length > 0 ? (
                <div className="space-y-3">
                  {supporters.map((supporter, index) => (
                    <div key={supporter.user} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{supporter.user}</span>
                      </div>
                      <span className="text-teal-600 font-semibold">{supporter.amount} QU</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">まだサポーターがいません</p>
                  <p className="text-gray-400 text-sm">投げ銭で応援してみませんか？</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDetailPage;