// src/pages/CoinPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinContext';
import { io } from 'socket.io-client';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  Users,
  Laptop,
  Target,
  Gift,
  MessageCircle,
  Clock
} from 'lucide-react';

const CoinPage = () => {
  const { user } = useAuth();
  const {
    transactions,
    totalEarned,
    totalSpent,
    earnCoins,
    subscribeToTotal
  } = useCoins();
  const [showEarnModal, setShowEarnModal] = useState(false);

  // リアルタイム残高更新（バックエンドの ChangeStream via socket.io）
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.on('total-coins-updated', sum => {
      subscribeToTotal(sum);
    });
    return () => {
      socket.disconnect();
    };
  }, [subscribeToTotal]);

  const contributionMethods = [
    {
      type: 'offline_hearing',
      title: 'オフラインヒアリング',
      rate: 400,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      description:
        '起業家と直接対面し、アイデアの整理やビジネスモデルの深掘りを行います。あなたの経験や視点を活用し、起業家の成長をサポートしてください。'
    },
    {
      type: 'online_hearing',
      title: 'オンラインヒアリング',
      rate: 200,
      icon: <Laptop className="w-6 h-6" />,
      color: 'green',
      description:
        'オンラインでの起業家ヒアリングに参加し、アイデアのブラッシュアップや課題解決のディスカッションを行います。場所を選ばず貴重です。'
    },
    {
      type: 'event_participation',
      title: 'QUSISイベント参加',
      rate: 100,
      icon: <Target className="w-6 h-6" />,
      color: 'yellow',
      description:
        'ピッチイベントやワークショップ、起業家コミュニティイベントに参加し、次世代の起業家たちとの交流や学びの場を共創します。'
    }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'gift_send':
        return <Gift className="w-5 h-5 text-red-500" />;
      case 'chat_participation':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'offline_hearing':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'online_hearing':
        return <Laptop className="w-5 h-5 text-green-500" />;
      case 'event_participation':
        return <Target className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const EarnCoinModal = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [hours, setHours] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!selectedMethod) return;
      setIsSubmitting(true);
      try {
        await earnCoins(selectedMethod.type, hours);
        alert(`${selectedMethod.rate * hours} QUcoinを獲得しました！`);
        setShowEarnModal(false);
      } catch {
        alert('エラーが発生しました');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">コイン獲得方法を選択</h2>
              <button
                onClick={() => setShowEarnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {contributionMethods.map((m) => (
                <div
                  key={m.type}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod?.type === m.type
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(m)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        m.color === 'blue'
                          ? 'bg-blue-100'
                          : m.color === 'green'
                          ? 'bg-green-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{m.title}</h3>
                        <span className="text-lg font-bold text-teal-600">
                          {m.rate} QUcoin/時間
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{m.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedMethod && (
              <div className="border-t pt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間数を入力
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={hours}
                    onChange={(e) => setHours(+e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">獲得予定コイン:</span>
                    <span className="text-xl font-bold text-teal-600">
                      {selectedMethod.rate * hours} QUcoin
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEarnModal(false)}
                    className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
                  >
                    {isSubmitting ? '処理中...' : 'コインを獲得'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QU-coinチャージ・履歴確認</h1>
        <p className="text-gray-600">{user.name}さんのQU-coin状況</p>
      </div>

      {/* Coin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">現在のQU-coin残高</span>
            <Coins className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {user.coinBalance.toLocaleString()} QU
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">総獲得QU-coin</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {totalEarned.toLocaleString()} QU
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">総使用QU-coin</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">
            {totalSpent.toLocaleString()} QU
          </div>
        </div>
      </div>

      {/* Contribution Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-2">QUSISへの協力によるコイン獲得</h2>
          <p className="text-gray-600">あなたの貴重な時間を起業家支援に</p>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            いただいた時間は、起業家のアイデアの整理、ビジネスモデルの
            ヒアリング、QUSISイベントへの参加などに活用されます。あなたの
            経験と視点が、次世代の起業家たちの成長を支える貴重な資源となります。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {contributionMethods.map((m) => (
              <div key={m.type} className="border rounded-lg p-4">
                <div
                  className={`inline-flex p-2 rounded-lg mb-3 ${
                    m.color === 'blue'
                      ? 'bg-blue-100'
                      : m.color === 'green'
                      ? 'bg-green-100'
                      : 'bg-yellow-100'
                  }`}
                >
                  {m.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{m.title}</h3>
                <div className="text-lg font-bold text-teal-600 mb-2">
                  {m.rate}コイン/時間
                </div>
                <p className="text-sm text-gray-600">{m.description}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowEarnModal(true)}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>コインを増やす</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">QU-coin履歴</h2>
        </div>
        <div className="divide-y">
          {transactions.map(tx => (
            <div key={tx._id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getTransactionIcon(tx.type)}
                <div>
                  <div className="font-medium text-gray-900">{tx.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${
                tx.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </div>
            </div>
          ))}
        </div>
        {transactions.length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">まだ取引履歴がありません</p>
          </div>
        )}
      </div>

      {showEarnModal && <EarnCoinModal />}
    </div>
  );
};

export default CoinPage;
