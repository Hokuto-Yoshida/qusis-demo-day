import React, { useState } from 'react';
import { usePitches } from '../context/PitchContext';
import { useCoins } from '../context/CoinContext';
import { 
  Coins, 
  Users, 
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
  const { transactions } = useCoins();

  // Mock data for admin dashboard
  const [adminStats] = useState({
    totalGifts: 5310,
    totalUsers: 7,
    activeEvents: 0,
    totalViewers: 0
  });

  const [mockUsers] = useState([
    {
      id: 1,
      name: 'admin',
      email: 'admin@example.com',
      balance: 5710,
      registeredDate: '2025/6/24',
      role: 'admin',
      team: null
    },
    {
      id: 2,
      name: 'presenter1',
      email: 'presenter1@example.com',
      balance: 1680,
      registeredDate: '2025/6/24',
      role: 'presenter',
      team: 'teamα'
    },
    {
      id: 3,
      name: 'presenter2',
      email: 'presenter2@example.com',
      balance: 600,
      registeredDate: '2025/6/24',
      role: 'presenter',
      team: 'teamβ'
    },
    {
      id: 4,
      name: 'viewer1',
      email: 'viewer1@example.com',
      balance: 2430,
      registeredDate: '2025/6/24',
      role: 'viewer',
      team: null
    },
    {
      id: 5,
      name: 'viewer2',
      email: 'viewer2@example.com',
      balance: 610,
      registeredDate: '2025/6/24',
      role: 'viewer',
      team: null
    },
    {
      id: 6,
      name: 'あああ',
      email: 'a@a.com',
      balance: 870,
      registeredDate: '2025/6/24',
      role: 'presenter',
      team: 'test'
    },
    {
      id: 7,
      name: 'いいい',
      email: 'b@b.com',
      balance: 560,
      registeredDate: '2025/6/24',
      role: 'viewer',
      team: null
    }
  ]);

  const [mockTimeContributions] = useState([]);

  const recentGifts = [
    {
      id: 1,
      user: 'ユーザー#4',
      amount: 100,
      timestamp: '2025/6/26 16:59:35',
      event: 'イベント#1'
    },
    {
      id: 2,
      user: 'ユーザー#4',
      amount: 20,
      timestamp: '2025/6/26 11:28:34',
      event: 'イベント#1'
    },
    {
      id: 3,
      user: 'ユーザー#4',
      amount: 100,
      timestamp: '2025/6/26 11:28:22',
      event: 'イベント#1'
    },
    {
      id: 4,
      user: 'ユーザー#4',
      amount: 100,
      timestamp: '2025/6/26 11:25:12',
      event: 'イベント#1'
    },
    {
      id: 5,
      user: 'ユーザー#4',
      amount: 200,
      timestamp: '2025/6/25 10:51:19',
      event: 'イベント#1'
    },
    {
      id: 6,
      user: 'ユーザー#4',
      amount: 50,
      timestamp: '2025/6/25 10:51:11',
      event: 'イベント#1'
    }
  ];

  const handleStatusChange = (pitchId, newStatus) => {
    updatePitchStatus(pitchId, newStatus);
  };

  const handleDeletePitch = (pitchId, pitchTitle) => {
    if (window.confirm(`「${pitchTitle}」を削除しますか？`)) {
      deletePitch(pitchId);
    }
  };

  const handleResetHistory = () => {
    if (window.confirm('時間貢献履歴をリセットしますか？')) {
      // Reset time contribution history
      alert('履歴をリセットしました');
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`ユーザー「${userName}」を削除しますか？`)) {
      // Delete user logic would go here
      alert(`ユーザー「${userName}」を削除しました`);
    }
  };

  const getStatusButton = (pitch) => {
    switch (pitch.status) {
      case 'upcoming':
        return (
          <button
            onClick={() => handleStatusChange(pitch.id, 'live')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
          >
            <Play className="w-3 h-3" />
            <span>開始</span>
          </button>
        );
      case 'live':
        return (
          <button
            onClick={() => handleStatusChange(pitch.id, 'ended')}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
          >
            <Square className="w-3 h-3" />
            <span>終了</span>
          </button>
        );
      default:
        return (
          <span className="text-gray-500 text-sm">終了済み</span>
        );
    }
  };

  const getRoleBadge = (role, team) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'admin' },
      presenter: { color: 'bg-green-100 text-green-800', label: 'presenter' },
      viewer: { color: 'bg-blue-100 text-blue-800', label: 'viewer' }
    };

    const config = roleConfig[role] || roleConfig.viewer;

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        {team && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {team}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QUcoin運営ダッシュボード</h1>
            <p className="text-gray-600">QUSIS ゼロイチピッチイベント管理</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleResetHistory}
            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>履歴リセット</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総ギフト額</p>
              <p className="text-3xl font-bold text-green-600">{adminStats.totalGifts.toLocaleString()}</p>
              <p className="text-sm text-gray-500">QUcoin</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">登録ユーザー数</p>
              <p className="text-3xl font-bold text-blue-600">{adminStats.totalUsers}</p>
              <p className="text-sm text-gray-500">人</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">アクティブイベント</p>
              <p className="text-3xl font-bold text-purple-600">{pitches.filter(p => p.status === 'live').length}</p>
              <p className="text-sm text-gray-500">進行中</p>
            </div>
            <Play className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総参加者数</p>
              <p className="text-3xl font-bold text-orange-600">{pitches.reduce((sum, p) => sum + p.participants, 0)}</p>
              <p className="text-sm text-gray-500">人</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Events */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">アクティブイベント</h2>
            </div>
          </div>
          
          <div className="p-6">
            {pitches.length > 0 ? (
              <div className="space-y-4">
                {pitches.map((pitch) => (
                  <div key={pitch.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{pitch.title}</h3>
                        <p className="text-sm text-purple-600">チーム: {pitch.team}</p>
                        <p className="text-sm text-gray-600">{pitch.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pitch.status === 'live' ? 'bg-red-100 text-red-800' :
                        pitch.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pitch.status === 'live' ? 'LIVE' : 
                         pitch.status === 'ended' ? '終了' : '開始前'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="block">参加者</span>
                        <span className="font-semibold text-gray-900">{pitch.participants}人</span>
                      </div>
                      <div>
                        <span className="block">ギフト総額</span>
                        <span className="font-semibold text-gray-900">{pitch.totalTips} QUcoin</span>
                      </div>
                      <div>
                        <span className="block">ID</span>
                        <span className="font-semibold text-gray-900">#{pitch.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {getStatusButton(pitch)}
                        <button
                          onClick={() => handleDeletePitch(pitch.id, pitch.title)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>削除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                アクティブなイベントはありません
              </div>
            )}
          </div>
        </div>

        {/* Recent Gifts */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">最近のギフト送信</h2>
            </div>
          </div>
          
          <div className="divide-y max-h-80 overflow-y-auto">
            {recentGifts.map((gift) => (
              <div key={gift.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-blue-600" />
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
        </div>
      </div>

      {/* Time Contribution History */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">時間貢献履歴</h2>
          </div>
        </div>
        
        <div className="p-6">
          {mockTimeContributions.length > 0 ? (
            <div className="space-y-4">
              {mockTimeContributions.map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contribution.userName}</div>
                      <div className="text-sm text-gray-600">{contribution.type} - {contribution.hours}時間</div>
                      <div className="text-xs text-gray-500">{contribution.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-teal-600">+{contribution.coins} QUcoin</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              時間貢献を行ったユーザーはまだいません
            </div>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">ユーザー管理</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  残高
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-green-600 font-semibold">
                      {user.balance.toLocaleString()} QUcoin
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{user.registeredDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role, user.team)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <span className="text-gray-400 text-sm">管理者</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;