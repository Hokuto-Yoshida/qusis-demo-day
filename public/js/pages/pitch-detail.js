/* public/js/pages/pitch-detail.js */
import { BASE_URL } from '../config.js';
import '../header.js';

// DOM が構築されたあとに一度だけ実行
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

  // DOM 要素取得（HTML 側の id を合わせる）
  const coverImg    = document.getElementById('cover-image');
  const titleEl     = document.getElementById('pitch-title');
  const descEl      = document.getElementById('pitch-description');
  const teamEl      = document.getElementById('cover-team');
  const tipsEl      = document.getElementById('total-amount');
  const tipButtons  = document.querySelectorAll('.tip-button');
  const toast       = document.getElementById('toast');

  // 初期データロード & イベントバインド
  loadDetail();
  attachTipHandlers();

  // ピッチ詳細取得
  async function loadDetail() {
    try {
      const res = await fetch(`${BASE_URL}/api/pitches/${pitchId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (!res.ok) throw new Error('取得失敗');
      const p = await res.json();

      // カバー画像
      if (p.coverImage && coverImg.tagName === 'IMG') {
        coverImg.src = p.coverImage;
      }
      titleEl.textContent = p.title;
      descEl.textContent  = p.description;
      teamEl.textContent  = p.team;
      tipsEl.textContent  = p.totalTips || 0;
    } catch (e) {
      alert('ピッチ取得に失敗しました');
      console.error(e);
    }
  }

  // 投げ銭ボタンにハンドラ
  function attachTipHandlers() {
    tipButtons.forEach(btn => {
      const amount = Number(btn.dataset.amount);
      if (!isNaN(amount)) {
        btn.addEventListener('click', () => sendTip(amount));
      }
    });
  }

  // 投げ銭送信
  async function sendTip(amount) {
    try {
      const res = await fetch(`${BASE_URL}/api/tips`, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ pitchId, amount })
      });
      if (!res.ok) throw new Error('送信失敗');
      const { newTotal } = await res.json();
      tipsEl.textContent = newTotal;
      showToast(`+${amount} QUcoin ありがとう！`);
    } catch (e) {
      showToast('送信エラー');
      console.error(e);
    }
  }

  // トースト表示
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
});
