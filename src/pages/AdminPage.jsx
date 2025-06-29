// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { usePitches } from '../context/PitchContext';
import {
  Coins,
  Users as UsersIcon,
  TrendingUp,
  Eye,
  Play,
  Square,
  Trash2,
  RefreshCw,
  Clock,
  UserX
} from 'lucide-react';

const AdminPage = () => {
  const { pitches, updatePitchStatus, deletePitch } = usePitches();

  const [totalGifts, setTotalGifts]       = useState(0);
  const [users, setUsers]                 = useState([]);
  const [timeContributions, setTimeContributions] = useState([]);

  const recentGifts = [
    { id: 1, user: 'ユーザー#4', amount: 100, timestamp: '2025/6/26 16:59:35', event: 'イベント#1' },
    { id: 2, user: 'ユーザー#4', amount: 20,  timestamp: '2025/6/26 11:28:34', event: 'イベント#1' },
    { id: 3, user: 'ユーザー#4', amount: 100, timestamp: '2025/6/26 11:28:22', event: 'イベント#1' },
    { id: 4, user: 'ユーザー#4', amount: 100, timestamp: '2025/6/26 11:25:12', event: 'イベント#1' },
    { id: 5, user: 'ユーザー#4', amount: 200, timestamp: '2025/6/25 10:51:19', event: 'イベント#1' },
    { id: 6, user: 'ユーザー#4', amount: 50,  timestamp: '2025/6/25 10:51:11', event: 'イベント#1' }
  ];

  // 初期データ取得 + リアルタイム購読
  useEffect(() => {
    // 管理用 API
    axios.get('/api/admin/total-coins')
      .then(res => setTotalGifts(res.data.total))
      .catch(console.error);

    axios.get('/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(console.error);

    axios.get('/api/admin/time-contributions')
      .then(res => setTimeContributions(res.data))
      .catch(console.error);

    // socket.io でリアルタイム総ギフト額更新
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.on('total-coins-updated', sum => {
      setTotalGifts(sum);
    });

    return () => {
      socket.off('total-coins-updated');
      socket.disconnect();
    };
  }, []);

  const handleResetHistory = () => {
    if (window.confirm('時間貢献履歴をリセットしますか？')) {
      axios.post('/api/admin/reset-time-contributions')
        .then(() => {
          setTimeContributions([]);
          alert('履歴をリセットしました');
        })
        .catch(() => alert('リセットに失敗しました'));
    }
  };

  const handleStatusChange = (pitchId, newStatus) => {
    updatePitchStatus(pitchId, newStatus);
  };

  const handleDeletePitch = (pitchId, title) => {
    if (window.confirm(`「${title}」を削除しますか？`)) {
      deletePitch(pitchId);
    }
  };

  const handleDeleteUser = (userId, name) => {
    if (window.confirm(`ユーザー「${name}」を削除しますか？`)) {
      axios.delete(`/api/admin/users/${userId}`)
        .then(() => {
          setUsers(prev => prev.filter(u => u._id !== userId));
        })
        .catch(() => alert('ユーザー削除に失敗しました'));
    }
  };

  const getStatusButton = (pitch) => {
    if (pitch.status === 'upcoming') {
      return (
        <button
          onClick={() => handleStatusChange(pitch._id, 'live')}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
        >
          <Play className="w-3 h-3" /><span>開始</span>
        </button>
      );
    }
    if (pitch.status === 'live') {
      return (
        <button
          onClick={() => handleStatusChange(pitch._id, 'ended')}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
        >
          <Square className="w-3 h-3" /><span>終了</span>
        </button>
      );
    }
    return <span className="text-gray-500 text-sm">終了済み</span>;
  };

  const getRoleBadge = (role, team) => {
    const cfg = {
      admin:     { bg: 'bg-red-100 text-red-800',     label: 'admin' },
      presenter: { bg: 'bg-green-100 text-green-800', label: 'presenter' },
      viewer:    { bg: 'bg-blue-100 text-blue-800',   label: 'viewer' }
    }[role] || { bg: 'bg-gray-100 text-gray-800', label: role };

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
          {cfg.label}
        </span>
        {team && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {team}
          </span>
        )}
      </div>
    );
  };

  const totalUsers   = users.length;
  const activeEvents = pitches.filter(p => p.status === 'live').length;
  const totalViewers = pitches.reduce((sum, p) => sum + p.participants, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QUcoin 運営ダッシュボード</h1>
            <p className="text-gray-600">QUSIS ゼロイチピッチイベント管理</p>
          </div>
        </div>
        <button
          onClick={handleResetHistory}
          className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /><span>履歴リセット</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card title="総ギフト額" value={`${totalGifts.toLocaleString()} QUcoin`} icon={<TrendingUp className="w-8 h-8 text-green-500"/>} />
        <Card title="登録ユーザー数" value={`${totalUsers} 人`} icon={<UsersIcon className="w-8 h-8 text-blue-500"/>} />
        <Card title="アクティブイベント" value={`${activeEvents} 件`} icon={<Play className="w-8 h-8 text-purple-500"/>} />
        <Card title="総参加者数" value={`${totalViewers} 人`} icon={<Eye className="w-8 h-8 text-orange-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Events List */}
        <Panel title="アクティブイベント" icon={<Play className="w-5 h-5 text-purple-600"/>}>
          {pitches.length > 0 ? pitches.map(pitch => (
            <div key={pitch._id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{pitch.title}</h3>
                  <p className="text-sm text-purple-600">チーム: {pitch.team}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${pitch.status==='live'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>
                  {pitch.status==='live'?'LIVE':'終了'}
                </span>
              </div>
              <div className="grid grid-cols-3 text-sm text-gray-600 mb-2">
                <div>参加者: <strong>{pitch.participants}</strong></div>
                <div>ギフト総額: <strong>{pitch.totalTips}</strong></div>
                <div>ID: <strong>#{pitch._id}</strong></div>
              </div>
              <div className="flex space-x-2">
                {getStatusButton(pitch)}
                <button
                  onClick={() => handleDeletePitch(pitch._id, pitch.title)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3"/><span>削除</span>
                </button>
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">アクティブなイベントはありません</p>
          )}
        </Panel>

        {/* Recent Gifts */}
        <Panel title="最近のギフト送信" icon={<TrendingUp className="w-5 h-5 text-green-600"/>}>
          <div className="divide-y max-h-80 overflow-y-auto">
            {recentGifts.map(gift => (
              <div key={gift.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-blue-600"/>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{gift.user}</div>
                    <div className="text-sm text-gray-500">{gift.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">+{gift.amount} QUcoin</div>
                  <div className="text-xs text-gray-500">{gift.event}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Time Contribution History */}
      <Panel title="時間貢献履歴" icon={<Clock className="w-5 h-5 text-gray-600"/>}>
        {timeContributions.length > 0 ? timeContributions.map(c => (
          <div key={c._id} className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-teal-600"/>
              </div>
              <div>
                <div className="font-medium text-gray-900">{c.userName}</div>
                <div className="text-sm text-gray-600">{c.type} – {c.hours}時間</div>
                <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-lg font-bold text-teal-600">+{c.coins} QUcoin</div>
          </div>
        )) : (
          <p className="text-center text-gray-500 py-8">時間貢献を行ったユーザーはまだいません</p>
        )}
      </Panel>

      {/* User Management */}
      <Panel title="ユーザー管理" icon={<UsersIcon className="w-5 h-5 text-blue-600"/>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['ユーザー名','メール','残高','登録日','ステータス','操作'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {u.coinBalance.toLocaleString()} QUcoin
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(u.role, u.team)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.role !== 'admin' ? (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4"/>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">管理者</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

// 再利用可能なカード
const Card = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
    {icon}
  </div>
);

// 再利用可能なセクションパネル
const Panel = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border">
    <div className="p-6 border-b flex items-center space-x-2">
      {icon}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default AdminPage;
