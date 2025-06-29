// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ScheduleList } from '../components/ScheduleList'; 

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header with logo and nav */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-transparent px-6 py-4 flex items-center justify-between">

      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Hero */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-4">
              QUSISデモデイ
            </h1>
            <p className="text-xl text-white mb-1">次世代起業家たちのピッチイベント</p>
            <p className="text-lg text-gray-300">リアルタイムでチャットや投げ銭を通して起業家たちを応援しよう</p>
            <div className="mt-6">
              <p className="text-gray-400">時間的貢献でQU-coinを獲得し、お気に入りのピッチを応援しよう</p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">

            <div className="space-y-4">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>アカウントを作成</span>
              </Link>
              <p className="text-gray-400">
                既にアカウントをお持ちの方は{' '}
                <Link
                  to="/login"
                  className="text-teal-400 hover:text-teal-300 underline"
                >
                  こちらからログイン
                </Link>
              </p>
            </div>
          </section>

          {/* Today's Schedule */}
          <section className="mb-16 bg-gray-900/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">本日のタイムスケジュール</h2>
            <ScheduleList />
          </section>

        </div>
      </main>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default LandingPage;