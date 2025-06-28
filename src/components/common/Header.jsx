// src/components/common/Header.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coins, Plus, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const baseItems = [
    ];

    const roleItems = {
      presenter: [
        { path: '/manage', label: 'ピッチ管理', show: true }
      ],
      admin: [
        { path: '/admin', label: '管理画面', show: true }
      ]
    };

    return [...baseItems, ...(roleItems[user?.role] || [])];
  };

  if (!user) return null;

  // include "使い方" in both desktop and mobile nav arrays
  const desktopNavItems = [...getNavItems(), { path: '/help', label: '使い方', show: true }];
  const mobileNavItems  = desktopNavItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            {/* 画像のサイズはお好みで調整 */}
            <img src="/logo.png" alt="QUSIS ロゴ" className="h-8 w-auto" />
          </Link>

          {/* Navigation (always visible) */}
          <nav className="hidden md:flex items-center space-x-6 overflow-x-auto whitespace-nowrap">
            {desktopNavItems.map(item => (
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1'
                      : 'text-gray-700 hover:text-teal-600'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Coin Balance */}
            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
              <Coins className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {user.coinBalance?.toLocaleString()} QUcoin
              </span>
            </div>

            {/* Add Coins Button */}
            <Link
              to="/coins"
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">コインを増やす</span>
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.avatar || user.name?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">ID: {user.id}</div>
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {user.team && (
                      <div className="text-xs text-teal-600">チーム: {user.team}</div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Navigation (bottom bar) */}
      <div className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0">
        <div className="flex justify-around py-2">
          {mobileNavItems.map(item => (
            item.show && (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                  location.pathname === item.path
                    ? 'text-teal-600'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
