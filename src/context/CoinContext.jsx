import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CoinContext = createContext();

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return context;
};

export const CoinProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Mock transaction data
  const mockTransactions = [
    {
      id: 1,
      type: 'gift_send',
      amount: -100,
      description: 'イベントへのギフト送信',
      timestamp: '2025年06月26日 16:59',
      icon: '🎁'
    },
    {
      id: 2,
      type: 'gift_send',
      amount: -20,
      description: 'イベントへのギフト送信',
      timestamp: '2025年06月26日 11:28',
      icon: '🎁'
    },
    {
      id: 3,
      type: 'gift_send',
      amount: -100,
      description: 'イベントへのギフト送信',
      timestamp: '2025年06月26日 11:28',
      icon: '🎁'
    },
    {
      id: 4,
      type: 'offline_hearing',
      amount: 400,
      description: 'オフラインヒアリング',
      timestamp: '2025年06月26日 11:28',
      icon: '👥'
    },
    {
      id: 5,
      type: 'online_hearing',
      amount: 200,
      description: 'オンラインヒアリング',
      timestamp: '2025年06月26日 11:28',
      icon: '💻'
    },
    {
      id: 6,
      type: 'event_participation',
      amount: 100,
      description: 'イベント参加',
      timestamp: '2025年06月26日 11:27',
      icon: '🎯'
    }
  ];

  useEffect(() => {
    if (user) {
      setTransactions(mockTransactions);
      
      // Calculate totals
      const earned = mockTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const spent = Math.abs(mockTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
      
      setTotalEarned(earned);
      setTotalSpent(spent);
    }
  }, [user]);

  const earnCoins = (type, hours) => {
    const rates = {
      offline_hearing: 400,
      online_hearing: 200,
      event_participation: 100
    };

    const amount = rates[type] * hours;
    const newTransaction = {
      id: Date.now(),
      type,
      amount,
      description: getTypeDescription(type),
      timestamp: new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: getTypeIcon(type)
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setTotalEarned(prev => prev + amount);
    
    // Update user balance
    if (user) {
      updateUser({ coinBalance: user.coinBalance + amount });
    }

    return amount;
  };

  const spendCoins = (amount, description = 'ギフト送信') => {
    if (!user || user.coinBalance < amount) {
      return false;
    }

    const newTransaction = {
      id: Date.now(),
      type: 'gift_send',
      amount: -amount,
      description,
      timestamp: new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: '🎁'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setTotalSpent(prev => prev + amount);
    
    // Update user balance
    updateUser({ coinBalance: user.coinBalance - amount });
    
    return true;
  };

  const earnChatCoins = () => {
    const amount = 20;
    const newTransaction = {
      id: Date.now(),
      type: 'chat_participation',
      amount,
      description: 'チャット参加',
      timestamp: new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: '💬'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setTotalEarned(prev => prev + amount);
    
    if (user) {
      updateUser({ coinBalance: user.coinBalance + amount });
    }

    return amount;
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      offline_hearing: 'オフラインヒアリング',
      online_hearing: 'オンラインヒアリング', 
      event_participation: 'イベント参加',
      chat_participation: 'チャット参加'
    };
    return descriptions[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      offline_hearing: '👥',
      online_hearing: '💻',
      event_participation: '🎯',
      chat_participation: '💬'
    };
    return icons[type] || '🪙';
  };

  const value = {
    transactions,
    totalEarned,
    totalSpent,
    earnCoins,
    spendCoins,
    earnChatCoins,
    getTypeDescription,
    getTypeIcon
  };

  return (
    <CoinContext.Provider value={value}>
      {children}
    </CoinContext.Provider>
  );
};