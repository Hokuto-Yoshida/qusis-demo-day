import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Mock pitch data
  const mockPitches = [
  ];

  // Mock chat messages
  const mockChatMessages = {

  };

  useEffect(() => {
    setPitches(mockPitches);
    setChatMessages(mockChatMessages);
    
    // Initialize tip history
    const initialTipHistory = {};
    mockPitches.forEach(pitch => {
      initialTipHistory[pitch.id] = [];
    });
    setTipHistory(initialTipHistory);
  }, []);

  const updatePitchStatus = (pitchId, newStatus) => {
    setPitches(prev => prev.map(pitch => 
      pitch.id === pitchId ? { ...pitch, status: newStatus } : pitch
    ));
  };

  const addChatMessage = (pitchId, message, user) => {
    const newMessage = {
      id: Date.now(),
      user: user.name,
      message,
      timestamp: new Date().toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      avatar: user.avatar
    };

    setChatMessages(prev => ({
      ...prev,
      [pitchId]: [...(prev[pitchId] || []), newMessage]
    }));

    return newMessage;
  };

  const addTip = (pitchId, amount, message, fromUser) => {
    const tip = {
      id: Date.now(),
      amount,
      message: message || '',
      fromUser: fromUser.name,
      timestamp: new Date().toLocaleTimeString('ja-JP'),
      userId: fromUser.id
    };

    setTipHistory(prev => ({
      ...prev,
      [pitchId]: [...(prev[pitchId] || []), tip]
    }));

    // Update pitch total tips
    setPitches(prev => prev.map(pitch => 
      pitch.id === pitchId 
        ? { ...pitch, totalTips: pitch.totalTips + amount }
        : pitch
    ));

    return tip;
  };

  const createPitch = (pitchData) => {
    const newPitch = {
      id: Date.now(),
      title: pitchData.title,
      description: pitchData.description,
      team: pitchData.team,
      status: 'upcoming',
      coverImage: pitchData.coverImage || null,
      totalTips: 0,
      participants: 0,
      presenterId: pitchData.presenterId,
      presenterName: pitchData.presenterName,
      createdAt: new Date().toISOString().split('T')[0],
      schedule: pitchData.schedule || 'TBD'
    };

    setPitches(prev => [...prev, newPitch]);
    setChatMessages(prev => ({ ...prev, [newPitch.id]: [] }));
    setTipHistory(prev => ({ ...prev, [newPitch.id]: [] }));

    return newPitch;
  };

  const updatePitch = (pitchId, updates) => {
    setPitches(prev => prev.map(pitch => 
      pitch.id === pitchId ? { ...pitch, ...updates } : pitch
    ));
  };

  const deletePitch = (pitchId) => {
    setPitches(prev => prev.filter(pitch => pitch.id !== pitchId));
    setChatMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[pitchId];
      return newMessages;
    });
    setTipHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[pitchId];
      return newHistory;
    });
  };

  const getPitchById = (id) => {
    return pitches.find(pitch => pitch.id === parseInt(id));
  };

  const getPitchesByUser = (userId) => {
    return pitches.filter(pitch => pitch.presenterId === userId);
  };

  const getTopSupporters = (pitchId) => {
    const tips = tipHistory[pitchId] || [];
    const userTips = {};
    
    tips.forEach(tip => {
      userTips[tip.fromUser] = (userTips[tip.fromUser] || 0) + tip.amount;
    });

    return Object.entries(userTips)
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