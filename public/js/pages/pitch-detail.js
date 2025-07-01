/* public/js/pages/pitch-detail.js */
import { BASE_URL } from '../config.js';
import '../header.js';

window.debugSocket = null;
window.debugPitchId = null;

window.addEventListener('DOMContentLoaded', () => {
  // 認証チェック
  if (!localStorage.getItem('authToken')) {
    location.href = '/login.html';
    return;
  }

  // URL から pitchId を取得
  const q = new URLSearchParams(location.search);
  const pitchId = q.get('id');
  if (!pitchId) {
    location.href = '/home.html';
    return;
  }

  // UI 要素取得
  const loadingEl      = document.getElementById('loading');
  const mainContentEl  = document.getElementById('main-content');
  const coverContainer = document.querySelector('.cover-image');
  const titleEl        = document.getElementById('pitch-title');
  const descEl         = document.getElementById('pitch-description');
  const teamEl         = document.getElementById('cover-team');
  const tipsEl         = document.getElementById('total-amount');
  const tipButtons     = document.querySelectorAll('.tip-button');
  const chatForm       = document.getElementById('chat-form');
  const messageInput   = document.getElementById('message-input');
  const chatContainer  = document.getElementById('chat-messages');
  const toast          = document.getElementById('toast');
  const coinBalanceEl  = document.getElementById('coin-balance');

  // js-confetti インスタンス (グローバル読み込み済み)
  const jsConfetti = window.JSConfetti ? new JSConfetti() : null;
  let chatMessages = [];
  let supporters = [];
  let socket = null; // Socket.io用

  // イベントバインド
  attachTipHandlers();
  attachChatHandler();

  // 初期データロード
  loadDetail();
  loadChatMessages();
  loadSupporters();
  
  // Socket.io初期化
  initializeSocket();

    window.debugPitchId = pitchId;

  // ✅ Socket.io初期化
  function initializeSocket() {
    try {
      console.log('🔌 Socket.io初期化開始');
      
      // Socket.ioが利用可能な場合のみ接続
      if (typeof io !== 'undefined') {
        console.log('✅ Socket.io利用可能');
        
        socket = io();
        
        // デバッグ用グローバル変数に保存
        window.debugSocket = socket;
        
        console.log('🔗 Socket.io接続開始:', socket);
        
        // 接続成功イベント
        socket.on('connect', () => {
          console.log('✅ Socket.io接続成功:', socket.id);
          
          // ユーザー情報を取得
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('👤 ユーザー情報:', user);
          
          // ピッチルームに参加
          const joinData = {
            pitchId: pitchId,
            userId: user.id || 'anonymous'
          };
          console.log('🎯 ピッチルーム参加:', joinData);
          
          socket.emit('join-pitch', joinData);
        });
        
        // 接続エラーイベント
        socket.on('connect_error', (error) => {
          console.error('❌ Socket.io接続エラー:', error);
        });
        
        // 観覧者数の更新を受信
        socket.on('viewer-count-updated', (data) => {
          console.log('📊 観覧者数更新受信:', data);
          if (data.pitchId === pitchId) {
            updateViewerCount(data.count);
          }
        });
        
        console.log('🔌 Socket.ioイベントリスナー設定完了');
      } else {
        console.error('❌ Socket.ioが利用できません');
      }
    } catch (error) {
      console.error('❌ Socket.io初期化エラー:', error);
    }
  }


  // ✅ 観覧者数を更新する関数
  function updateViewerCount(count) {
    const participantsEl = document.getElementById('participants');
    if (participantsEl) {
      participantsEl.textContent = count;
      console.log(`👥 観覧者数更新: ${count}人`);
    }
  }

  // ✅ Socket.io切断
  function disconnectSocket() {
    if (socket) {
      socket.emit('leave-pitch', pitchId);
      socket.disconnect();
      console.log('🔌 Socket.io切断');
    }
  }

  // ✅ サポーターランキング取得
  async function loadSupporters() {
    try {
      console.log('🔍 loadSupporters 開始');
      console.log('pitchId:', pitchId);
      
      const token = localStorage.getItem('authToken');
      console.log('token:', token ? 'あり' : 'なし');
      
      // ✅ 認証ヘッダーを統一（x-user-id のみ使用）
      const url = `${BASE_URL}/api/tips/${pitchId}/supporters`;
      console.log('📡 リクエストURL:', url);
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token  // ✅ 認証ヘッダーを統一
        }
      });
      
      console.log('📥 レスポンスステータス:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ レスポンスエラー:', res.status, errorText);
        
        if (res.status === 404) {
          console.log('⚠️ エンドポイントが見つからない');
          supporters = [];
          displaySupporters();
          return;
        }
        throw new Error('サポーターランキング取得失敗');
      }
      
      const data = await res.json();
      console.log('📋 取得したサポーターデータ:', data);
      
      supporters = data;
      console.log('✅ supporters配列に設定:', supporters);
      
      displaySupporters();
    } catch (e) {
      console.error('❌ サポーターランキング取得エラー:', e);
      supporters = [];
      displaySupporters();
    }
  }

  // ✅ デバッグ版サポーターランキング表示
  function displaySupporters() {
    console.log('🎨 displaySupporters 実行');
    console.log('supporters配列:', supporters);
    console.log('supporters.length:', supporters.length);
    
    const container = document.getElementById('supporters-list');
    const emptyState = document.getElementById('empty-ranking');
    
    console.log('container要素:', container);
    console.log('emptyState要素:', emptyState);
    
    if (!container || !emptyState) {
      console.warn('⚠️ サポーターランキング要素が見つかりません');
      return;
    }

    if (supporters.length === 0) {
      console.log('📭 サポーターが0人 - 空状態を表示');
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    console.log('👥 サポーターあり - ランキング表示');
    emptyState.classList.add('hidden');
    container.innerHTML = supporters.map((supporter, index) => {
      console.log(`サポーター${index + 1}:`, supporter);
      return createSupporterElement(supporter, index);
    }).join('');
  }

  // ✅ サポーター要素を作成
  function createSupporterElement(supporter, index) {
    const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
    const rankClass = rankClasses[index] || 'rank-other';
    
    // チーム名がある場合は表示
    const teamBadge = supporter.userTeam ? 
      `<span class="team-badge-small">${supporter.userTeam}</span>` : '';

    return `
      <div class="supporter-item">
        <div class="supporter-left">
          <div class="rank-badge ${rankClass}">${index + 1}</div>
          <div class="supporter-info">
            <span class="supporter-name">${supporter.userName}</span>
            ${teamBadge}
          </div>
        </div>
        <div class="supporter-right">
          <span class="supporter-amount">${supporter.totalAmount} QU</span>
        </div>
      </div>
    `;
  }

  async function loadDetail() {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/pitches/${pitchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('取得失敗');
      const p = await res.json();

      // ✅ カバー画像の処理を修正
      const coverImg = document.getElementById('cover');
      const coverPlaceholder = document.getElementById('cover-content');
      
      if (p.coverImage && p.coverImage.trim() !== '') {
        // カバー画像がある場合
        coverImg.src = p.coverImage;
        coverImg.style.display = 'block';
        coverPlaceholder.style.display = 'none';
        
        // 画像読み込みエラーの場合はプレースホルダーを表示
        coverImg.onerror = function() {
          coverImg.style.display = 'none';
          coverPlaceholder.style.display = 'flex';
        };
      } else {
        // カバー画像がない場合はプレースホルダーを表示
        coverImg.style.display = 'none';
        coverPlaceholder.style.display = 'flex';
      }

      // 基本情報を設定
      titleEl.textContent = p.title;
      descEl.textContent = p.description;
      teamEl.textContent = p.team;
      tipsEl.textContent = p.totalTips || 0;

      // ✅ チーム名バッジを正しく設定
      const teamBadgeEl = document.getElementById('team-badge');
      if (teamBadgeEl) {
        teamBadgeEl.textContent = p.team;
      }

      // ✅ ステータス表示
      const statusMap = {
        'live': { text: 'LIVE', status: 'デモ進行中' },
        'ended': { text: '終了', status: '終了しました' },
        'upcoming': { text: '開始前', status: 'まもなく開始予定です' }
      };
      
      const statusInfo = statusMap[p.status] || statusMap['upcoming'];
      const statusBadgeEl = document.getElementById('status-badge');
      const coverStatusEl = document.getElementById('cover-status');
      const statusDisplayEl = document.getElementById('status-display');
      
      if (statusBadgeEl) statusBadgeEl.textContent = statusInfo.text;
      if (coverStatusEl) coverStatusEl.textContent = statusInfo.status;
      if (statusDisplayEl) statusDisplayEl.textContent = statusInfo.text;

      // ✅ ユーザーのコイン残高表示
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (coinBalanceEl && user.coinBalance !== undefined) {
        coinBalanceEl.textContent = user.coinBalance;
      }

      // ✅ 投げ銭セクションの表示制御（自チームの場合は非表示）
      const tipSection = document.getElementById('tip-section');
      if (tipSection && user.team === p.team) {
        tipSection.style.display = 'none';
      }

      loadingEl.classList.add('hidden');
      mainContentEl.classList.remove('hidden');
    } catch (e) {
      alert('ピッチ取得に失敗しました');
      console.error(e);
    }
  }

  // チャット履歴取得
  async function loadChatMessages() {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/messages/${pitchId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token,
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('チャット取得失敗');
      chatMessages = await res.json();
      displayChatMessages();
    } catch (e) {
      console.error(e);
    }
  }

  // チャット表示
  function displayChatMessages() {
    chatContainer.innerHTML = '';
    chatMessages.forEach(msg => chatContainer.appendChild(createMessageElement(msg)));
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // メッセージ要素作成
  function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = 'message';
    const time = new Date(message.createdAt).toLocaleTimeString('ja-JP');
    div.innerHTML = `
      <div class="message-avatar">
        <span class="avatar-text">${message.user.name.slice(0,2).toUpperCase()}</span>
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-user">${message.user.name}</span>
          <span class="message-time">${time}</span>
        </div>
        <p class="message-text">${message.content}</p>
      </div>
    `;
    return div;
  }

  // チャット送信ハンドラ
  function attachChatHandler() {
    chatForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const content = messageInput.value.trim();
      if (!content) return;
      const ok = await sendMessage(content);
      if (ok) messageInput.value = '';
    });
  }

  // チャット送信
  async function sendMessage(content) {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pitch: pitchId, content })
      });
      if (!res.ok) throw new Error('送信失敗');
      const { message: newMsg, coinReward, newBalance } = await res.json();
      chatMessages.push(newMsg);
      displayChatMessages();
      // 残高更新
      const user = JSON.parse(localStorage.getItem('user'));
      user.coinBalance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
      if (coinBalanceEl) coinBalanceEl.textContent = newBalance;
      showToast(`+${coinReward} QUcoin 獲得！`);
      return true;
    } catch (e) {
      showToast('チャット送信エラー');
      console.error(e);
      return false;
    }
  }

  // 投げ銭ハンドラ
  function attachTipHandlers() {
    tipButtons.forEach(btn => {
      const amount = Number(btn.dataset.amount);
      const label  = btn.querySelector('.tip-label')?.textContent || `${amount} QUcoin`;
      btn.addEventListener('click', () => sendTip(amount, label));
    });
  }

  // 投げ銭送信 + スーパーチャット + クラッカー
  async function sendTip(amount, label) {
    try {
      console.log('💰 投げ銭送信開始:', { amount, label, pitchId });
      
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/tips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token  // ✅ 認証ヘッダーを統一
        },
        body: JSON.stringify({ pitch: pitchId, amount, message: '' })
      });
      
      console.log('投げ銭レスポンス:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('投げ銭エラー:', errorText);
        throw new Error('送信失敗');
      }
      
      const { tip, newBalance } = await res.json();
      console.log('投げ銭成功:', { tip, newBalance });
      
      // ✅ ローカルストレージのユーザー情報を更新
      const user = JSON.parse(localStorage.getItem('user'));
      user.coinBalance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
      
      // ✅ UI 更新
      tipsEl.textContent = Number(tipsEl.textContent) + tip.amount;
      
      // ✅ コイン残高表示（要素が存在する場合のみ）
      const coinBalanceEl = document.getElementById('coin-balance');
      if (coinBalanceEl) {
        coinBalanceEl.textContent = newBalance;
      }
      
      // ✅ スーパーチャットを送信
      await sendSuperChat(`【${label}】投げ銭 ${amount} QUcoin`);
      
      // トーストにラベル表示
      showToast(label);
      
      // クラッカー演出
      jsConfetti?.addConfetti({ emojis: ['🎉','✨','🥳'], confettiNumber: 80 });
      
      // ヘッダー残高更新
      const headerBal = document.getElementById('header-balance');
      if (headerBal) headerBal.textContent = `${newBalance} QUcoin`;

      // ✅ サポーターランキングを更新
      console.log('🔄 サポーターランキング更新開始');
      await loadSupporters();
      
    } catch (e) {
      showToast('送信エラー');
      console.error(e);
    }
  }

  // ✅ 修正版スーパーチャット送信
  async function sendSuperChat(content) {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token  // ✅ 認証ヘッダーを統一
        },
        body: JSON.stringify({ 
          pitch: pitchId, 
          content,
          isSuperchat: true
        })
      });
      
      if (!res.ok) throw new Error('スーパーチャット送信失敗');
      const { message: newMsg } = await res.json();
      
      chatMessages.push(newMsg);
      displayChatMessages();
      
      return true;
    } catch (e) {
      console.error('スーパーチャット送信エラー:', e);
      return false;
    }
  }

  // トースト表示
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ✅ ページ離脱時の処理
  window.addEventListener('beforeunload', () => {
    disconnectSocket();
  });

  // ✅ ページが非表示になった時も切断
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && socket) {
      socket.emit('leave-pitch', pitchId);
    } else if (!document.hidden && socket && !socket.connected) {
      // ページが再び表示された時に再接続
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('join-pitch', {
        pitchId: pitchId,
        userId: user.id || 'anonymous'
      });
    }
  });
});