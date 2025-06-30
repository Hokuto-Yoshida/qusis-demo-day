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

  // ピッチ詳細取得
  async function loadDetail() {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/api/pitches/${pitchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('取得失敗');
      const p = await res.json();
      if (p.coverImage) coverContainer.style.backgroundImage = `url('${p.coverImage}')`;
      titleEl.textContent = p.title;
      descEl.textContent  = p.description;
      teamEl.textContent  = p.team;
      tipsEl.textContent  = p.totalTips || 0;
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
      // UI 更新
      tipsEl.textContent = Number(tipsEl.textContent) + tip.amount;
      if (coinBalanceEl) coinBalanceEl.textContent = newBalance;
      // スーパーチャットとしてチャット送信
      await sendMessage(`【${label}】投げ銭 ${amount} QUcoin`);
      // トーストにラベル表示
      showToast(label);
      // クラッカー演出
      jsConfetti?.addConfetti({ emojis: ['🎉','✨','🥳'], confettiNumber: 80 });
      // ヘッダー残高更新
      const headerBal = document.getElementById('header-balance');
      if (headerBal) headerBal.textContent = `${newBalance} QUcoin`;
    } catch (e) {
      showToast('送信エラー');
      console.error(e);
    }
  }

  // トースト表示
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
});
