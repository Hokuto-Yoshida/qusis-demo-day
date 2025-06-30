/* public/js/pages/pitch-detail.js */
import { BASE_URL } from '../config.js';
import '../header.js';

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

  // イベントバインド
  attachTipHandlers();
  attachChatHandler();

  // 初期データロード
  loadDetail();
  loadChatMessages();

  // グローバル変数（他の変数と一緒に宣言）
    let supporters = [];

    // 初期データロード部分に追加（loadDetail() と loadChatMessages() の後）
    loadSupporters();

    // ✅ サポーターランキング取得
    async function loadSupporters() {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${BASE_URL}/api/tips/${pitchId}/supporters`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': token,
            Authorization: `Bearer ${token}`
        }
        });
        
        if (!res.ok) {
        if (res.status === 404) {
            // エンドポイントが存在しない場合は空配列
            supporters = [];
            displaySupporters();
            return;
        }
        throw new Error('サポーターランキング取得失敗');
        }
        
        supporters = await res.json();
        displaySupporters();
    } catch (e) {
        console.error('サポーターランキング取得エラー:', e);
        supporters = [];
        displaySupporters();
    }
    }

    // ✅ サポーターランキング表示
    function displaySupporters() {
    const container = document.getElementById('supporters-list');
    const emptyState = document.getElementById('empty-ranking');
    
    if (!container || !emptyState) {
        console.warn('サポーターランキング要素が見つかりません');
        return;
    }

    if (supporters.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = supporters.map((supporter, index) => 
        createSupporterElement(supporter, index)
    ).join('');
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
            <div class="supporter-details">
                <span class="tip-count">${supporter.tipCount}回</span>
                <span class="last-tip">最終: ${new Date(supporter.lastTipDate).toLocaleDateString('ja-JP')}</span>
            </div>
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

        // ✅ その他の表示要素も設定
        const participantsEl = document.getElementById('participants');
        if (participantsEl) {
        participantsEl.textContent = p.participants || 0;
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
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${BASE_URL}/api/tips`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': token,
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pitch: pitchId, amount, message: '' })
        });
        if (!res.ok) throw new Error('送信失敗');
        const { tip, newBalance } = await res.json();
        
        // ✅ ローカルストレージのユーザー情報を更新
        const user = JSON.parse(localStorage.getItem('user'));
        user.coinBalance = newBalance;
        localStorage.setItem('user', JSON.stringify(user));
        
        // ✅ UI 更新
        tipsEl.textContent = Number(tipsEl.textContent) + tip.amount;
        if (coinBalanceEl) coinBalanceEl.textContent = newBalance;
        
        // ✅ スーパーチャットを送信（コイン獲得なしバージョン）
        await sendSuperChat(`【${label}】投げ銭 ${amount} QUcoin`);
        
        // トーストにラベル表示
        showToast(label);
        
        // クラッカー演出
        jsConfetti?.addConfetti({ emojis: ['🎉','✨','🥳'], confettiNumber: 80 });
        
        // ヘッダー残高更新
        const headerBal = document.getElementById('header-balance');
        if (headerBal) headerBal.textContent = `${newBalance} QUcoin`;

        // ✅ サポーターランキングを更新
        await loadSupporters();

        
    } catch (e) {
        showToast('送信エラー');
        console.error(e);
    }
    }

    // ✅ 新しい関数: コイン獲得なしでメッセージ送信
    async function sendSuperChat(content) {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': token,
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
            pitch: pitchId, 
            content,
            isSuperchat: true // ✅ スーパーチャットフラグ（コイン獲得なし）
        })
        });
        
        if (!res.ok) throw new Error('スーパーチャット送信失敗');
        const { message: newMsg } = await res.json();
        
        // チャット表示に追加（残高更新なし）
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
});
