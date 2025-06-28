import React from 'react';
import { Link } from 'react-router-dom';
import { usePitches } from '../context/PitchContext';
import { Users } from 'lucide-react';

const LandingPage = () => {
  const { pitches } = usePitches();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">

      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-4">
              QUSISデモデイ
            </h1>
            <div className="space-y-2 mb-8">
              <p className="text-xl text-white">次世代起業家たちのピッチイベント</p>
              <p className="text-lg text-gray-300">リアルタイムでチャットや投げ銭を通して</p>
              <p className="text-lg text-gray-300">起業家たちを応援しよう</p>
            </div>
            <div className="space-y-2 mb-12">
              <p className="text-gray-400">時間的貢献でQU-coinを獲得し、</p>
              <p className="text-gray-400">お気に入りのピッチを応援しよう</p>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 mb-12 border border-gray-700">
              <div className="mb-6">
                <div className="text-teal-400 text-sm font-mono tracking-wider mb-2">
                  DISCOVER. SUPPORT. INNOVATE.
                </div>
              </div>
              
              <div className="space-y-4">
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>アカウントを作成</span>
                </Link>
                <div className="text-gray-400">
                  既にアカウントをお持ちの方は{' '}
                  <Link 
                    to="/login" 
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    こちらからログイン
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">本日のタイムスケジュール</h2>
            
            <div className="space-y-4">
              {pitches.map((pitch) => (
                <div 
                  key={pitch.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Cover Image Placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {pitch.team || 'TEAM'}
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <h3 className="text-white font-semibold text-lg">{pitch.title}</h3>
                        <p className="text-gray-400 text-sm">{pitch.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-teal-400 text-sm">チーム: {pitch.team}</span>
                          <span className="text-yellow-400 text-sm">
                            応援総額: {pitch.totalTips} QU
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium">{pitch.schedule}</div>
                      <div className={`text-sm px-2 py-1 rounded-full mt-1 ${
                        pitch.status === 'live' 
                          ? 'bg-red-500/20 text-red-400' 
                          : pitch.status === 'ended'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {pitch.status === 'live' ? 'LIVE' : 
                         pitch.status === 'ended' ? '終了' : '開始前'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pitches.length === 0 && (
              <div className="text-gray-400 text-center py-8">
                本日のスケジュールはまだ公開されていません
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default LandingPage;