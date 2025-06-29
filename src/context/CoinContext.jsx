// src/context/CoinContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
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

  // socket.io クライアント
  const socket = io(import.meta.env.VITE_BACKEND_URL);

  // 初期データ取得 & リアルタイム購読
  useEffect(() => {
    if (!user) return;

    // トランザクション一覧取得
    axios.get('/api/coins/transactions')
      .then(res => {
        setTransactions(res.data);
        // 合計を計算
        const earned = res.data
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const spent = res.data
          .filter(tx => tx.amount < 0)
          .reduce((sum, tx) => sum + (-tx.amount), 0);
        setTotalEarned(earned);
        setTotalSpent(spent);
      })
      .catch(console.error);

    // 新トランザクション通知
    socket.on('transaction-added', (tx) => {
      setTransactions(prev => [tx, ...prev]);
      if (tx.amount > 0) {
        setTotalEarned(prev => prev + tx.amount);
        updateUser({ coinBalance: user.coinBalance + tx.amount });
      } else {
        setTotalSpent(prev => prev + (-tx.amount));
        updateUser({ coinBalance: user.coinBalance + tx.amount });
      }
    });

    return () => {
      socket.off('transaction-added');
      socket.disconnect();
    };
  }, [user, updateUser]);

  // コイン獲得
  const earnCoins = async (type, hours) => {
    const res = await axios.post('/api/coins/earn', { type, hours });
    // サーバーが 'transaction-added' イベントを emit するので、
    // クライアント側ではここで setTransactions しなくてよい場合もある。
    return res.data.amount;
  };

  // コイン使用（投げ銭）
  const spendCoins = async (amount, description = 'ギフト送信') => {
    if (!user || user.coinBalance < amount) {
      return false;
    }
    const res = await axios.post('/api/coins/spend', { amount, description });
    return res.data.success;
  };

  // チャット参加報酬
  const earnChatCoins = async () => {
    const res = await axios.post('/api/coins/chat');
    return res.data.amount;
  };

  const value = {
    transactions,
    totalEarned,
    totalSpent,
    earnCoins,
    spendCoins,
    earnChatCoins
  };

  return (
    <CoinContext.Provider value={value}>
      {children}
    </CoinContext.Provider>
  );
};
