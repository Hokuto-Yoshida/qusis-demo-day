// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { usePitches } from '../context/PitchContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, TrendingUp, Play, Clock, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { pitches } = usePitches();
  const { user } = useAuth();

  const getStatusInfo = (status) => {
    switch (status) {
      case 'live':
        return {
          label: 'デモ中',
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: <Play className="w-4 h-4" />
        };
      case 'ended':
        return {
          label: '終了',
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <CheckCircle className="w-4 h-4" />
        };
      default:
        return {
          label: '開始前',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const getActionButton = (pitch) => {
    if (pitch.status === 'ended') {
      return (
        <button className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed">
          終了しました
        </button>
      );
    }

    return (
      <Link
        to={`/pitch/${pitch.id}`}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-center block ${
          pitch.status === 'live'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {pitch.status === 'live' ? 'デモを見る' : '応援する'}
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Pitch Grid */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">今日のピッチ一覧</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch) => {
            const statusInfo = getStatusInfo(pitch.status);
            
            return (
              <div key={pitch.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-br from-teal-500 to-blue-600 relative">
                  {pitch.coverImage ? (
                    <img 
                      src={pitch.coverImage} 
                      alt={pitch.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-2xl font-bold mb-2">{pitch.team}</div>
                        <div className="text-sm opacity-90">Cover Image</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 ${statusInfo.bgColor} ${statusInfo.textColor} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                  
                  {/* Live Indicator */}
                  {pitch.status === 'live' && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">LIVE</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {pitch.team}
                    </span>
                    <span className="text-gray-500 text-sm">{pitch.schedule}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pitch.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pitch.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{pitch.participants}人</span>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{pitch.totalTips} QU</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">#{pitch.id}</span>
                  </div>
                  
                  {/* Action Button */}
                  {getActionButton(pitch)}
                </div>
              </div>
            );
          })}
        </div>

        {pitches.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">今日のピッチはまだ登録されていません</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">💡</span>
          </div>
          <div>
            <h3 className="font-semibold text-teal-900 mb-2">応援の仕方</h3>
            <ul className="text-teal-700 text-sm space-y-1">
              <li>• チャットに参加して20 QUcoinを獲得</li>
              <li>• 投げ銭で直接応援（10〜100 QUcoin）</li>
              <li>• QUSIS協力活動でQUcoinを獲得</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
