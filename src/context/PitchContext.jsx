// src/context/PitchContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PitchContext = createContext();

export const usePitches = () => {
  const context = useContext(PitchContext);
  if (!context) {
    throw new Error('usePitches must be used within a PitchProvider');
  }
  return context;
};

export const PitchProvider = ({ children }) => {
  const [pitches, setPitches] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [tipHistory, setTipHistory] = useState({});

  // 初回ロードでピッチ一覧＋チャット・投げ銭履歴を API から取得
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) ピッチ一覧
        const { data: fetchedPitches } = await axios.get('/api/pitches');
        setPitches(fetchedPitches);

        // 2) 各ピッチのチャット履歴・投げ銭履歴
        const chatMap = {};
        const tipMap  = {};
        await Promise.all(
          fetchedPitches.map(async (p) => {
            const [{ data: msgs }, { data: tips }] = await Promise.all([
              axios.get(`/api/messages/${p._id}`),
              axios.get(`/api/tips/${p._id}`)
            ]);
            chatMap[p._id] = msgs;
            tipMap[p._id]  = tips;
          })
        );
        setChatMessages(chatMap);
        setTipHistory(tipMap);

      } catch (err) {
        console.error('PitchContext: fetchAll error', err);
      }
    };

    fetchAll();
  }, []);

  // ピッチステータス更新
  const updatePitchStatus = async (pitchId, newStatus) => {
    try {
      const { data: updated } = await axios.put(`/api/pitches/${pitchId}`, { status: newStatus });
      setPitches(prev =>
        prev.map(p => (p._id === pitchId ? updated : p))
      );
    } catch (err) {
      console.error('updatePitchStatus error', err);
    }
  };

  // チャット投稿
  const addChatMessage = async (pitchId, message, user) => {
    try {
      const { data: msg } = await axios.post('/api/messages', {
        pitch: pitchId,
        user: user.id,
        content: message
      });
      setChatMessages(prev => ({
        ...prev,
        [pitchId]: [...(prev[pitchId] || []), msg]
      }));
      return msg;
    } catch (err) {
      console.error('addChatMessage error', err);
    }
  };

  // 投げ銭追加
  const addTip = async (pitchId, amount, message, fromUser) => {
    try {
      const { data: tip } = await axios.post('/api/tips', {
        pitch: pitchId,
        user: fromUser.id,
        amount,
        message
      });
      // 履歴更新
      setTipHistory(prev => ({
        ...prev,
        [pitchId]: [...(prev[pitchId] || []), tip]
      }));
      // ピッチの totalTips も更新
      setPitches(prev =>
        prev.map(p =>
          p._id === pitchId
            ? { ...p, totalTips: p.totalTips + amount }
            : p
        )
      );
      return tip;
    } catch (err) {
      console.error('addTip error', err);
    }
  };

  // 新規ピッチ作成
  const createPitch = async (pitchData) => {
    try {
      const { data: newPitch } = await axios.post('/api/pitches', pitchData);
      setPitches(prev => [...prev, newPitch]);
      setChatMessages(prev => ({ ...prev, [newPitch._id]: [] }));
      setTipHistory(prev => ({ ...prev, [newPitch._id]: [] }));
      return newPitch;
    } catch (err) {
      console.error('createPitch error', err);
      throw err;
    }
  };

  // ピッチ更新（任意フィールド）
  const updatePitch = async (pitchId, updates) => {
    try {
      const { data: updated } = await axios.put(`/api/pitches/${pitchId}`, updates);
      setPitches(prev =>
        prev.map(p => (p._id === pitchId ? updated : p))
      );
      return updated;
    } catch (err) {
      console.error('updatePitch error', err);
    }
  };

  // ピッチ削除
  const deletePitch = async (pitchId) => {
    try {
      await axios.delete(`/api/pitches/${pitchId}`);
      setPitches(prev => prev.filter(p => p._id !== pitchId));
      setChatMessages(prev => {
        const next = { ...prev };
        delete next[pitchId];
        return next;
      });
      setTipHistory(prev => {
        const next = { ...prev };
        delete next[pitchId];
        return next;
      });
    } catch (err) {
      console.error('deletePitch error', err);
    }
  };

  // ID でピッチ取得
  const getPitchById = (id) => pitches.find(p => p._id === id);

  // ユーザー別ピッチ取得
  const getPitchesByUser = (userId) =>
    pitches.filter(p => p.presenterId === userId);

  // 応援ランキング取得
  const getTopSupporters = (pitchId) => {
    const tips = tipHistory[pitchId] || [];
    const tally = {};
    tips.forEach(t => {
      tally[t.fromUser] = (tally[t.fromUser] || 0) + t.amount;
    });
    return Object.entries(tally)
      .map(([user, amount]) => ({ user, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  const value = {
    pitches,
    chatMessages,
    tipHistory,
    updatePitchStatus,
    addChatMessage,
    addTip,
    createPitch,
    updatePitch,
    deletePitch,
    getPitchById,
    getPitchesByUser,
    getTopSupporters
  };

  return (
    <PitchContext.Provider value={value}>
      {children}
    </PitchContext.Provider>
  );
};
