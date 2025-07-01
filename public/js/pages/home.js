/* public/js/pages/home.js - 修正版 */
import { BASE_URL } from '../config.js';
import '../header.js';

// 1. 認証チェック ─────────────────────────
if (!localStorage.getItem('authToken')) {
  location.href = '/login.html';
}

// 2. DOM 参照 ───────────────────────────
const loading   = document.getElementById('loading');
const grid      = document.getElementById('pitch-grid');
const empty     = document.getElementById('empty-state');

// 3. ピッチ一覧を取得して描画 ───────────────
(async function loadPitches () {
  try {
    const res = await fetch(`${BASE_URL}/api/pitches`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    if (!res.ok) throw new Error('ピッチ取得失敗');

    const pitches = await res.json();
    if (!pitches.length) return showEmpty();

    grid.innerHTML = pitches.map(toCard).join('');
    grid.style.display = 'grid';
  } catch (err) {
    console.error(err);
    showEmpty();
  } finally {
    loading.style.display = 'none';
  }
})();

// 4. カード生成ヘルパー（修正版）
function toCard (p) {
  const statusMap = {
    live    : { label:'デモ中',    badge:'status-live',    btn:'btn-live',     action:'デモを見る' },
    ended   : { label:'終了',      badge:'status-ended',   btn:'btn-upcoming', action:'応援する' }, // ✅ 修正: 終了後も応援可能
    upcoming: { label:'開始前',    badge:'status-upcoming',btn:'btn-upcoming', action:'応援する' }
  };
  const S = statusMap[p.status] || statusMap.upcoming;

  return /* html */`
    <div class="pitch-card">
      <div class="cover-image">
        ${p.coverImage ? `<img src="${p.coverImage}" alt="">`
                       : `<div class="cover-placeholder">
                            <div class="team-name">${p.team}</div>
                            <div class="cover-text">Cover Image</div>
                          </div>`}
        <div class="status-badge ${S.badge}">${S.label}</div>
        ${p.status==='live'
          ? `<div class="live-indicator"><div class="live-dot"></div><span class="live-text">LIVE</span></div>`
          : ''}
      </div>

      <div class="card-content">
        <div class="card-header">
          <span class="team-badge">${p.team}</span>
          <span class="schedule">${p.schedule || ''}</span>
        </div>

        <h3 class="pitch-title">${p.title}</h3>
        <p  class="pitch-description">${p.description}</p>

        <div class="stats">
          <div class="stats-left">
            <span class="stat-item">${p.totalTips || 0} QU</span>
          </div>
          <span class="pitch-id">#${p._id}</span>
        </div>

        <!-- ✅ 修正: すべてのステータスでピッチ詳細に飛べるように -->
        <a href="/pitch-detail.html?id=${p._id}" class="action-btn ${S.btn}">${S.action}</a>
      </div>
    </div>`;
}

function showEmpty () { empty.style.display = 'block'; }