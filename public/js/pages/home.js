/* public/js/pages/home.js - 最適化版 */
import { BASE_URL } from '../config.js';
import '../header.js';

// グローバル変数
let pitchesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30秒キャッシュ

// 1. 認証チェック（改善版）─────────────────────────
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    location.href = '/login.html';
    return false;
  }
  
  try {
    JSON.parse(user); // ユーザー情報の妥当性チェック
    return true;
  } catch (error) {
    console.error('ユーザー情報が無効:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    location.href = '/login.html';
    return false;
  }
}

// 認証チェック実行
if (!checkAuth()) {
  // 認証失敗時は処理を停止
  throw new Error('認証が必要です');
}

// 2. DOM 参照（エラーハンドリング追加）───────────────────────────
const loading = document.getElementById('loading');
const grid = document.getElementById('pitch-grid');
const empty = document.getElementById('empty-state');

if (!loading || !grid || !empty) {
  console.error('必要なDOM要素が見つかりません');
  throw new Error('DOM要素の初期化に失敗しました');
}

// 3. タイムアウト付きfetch関数
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('リクエストがタイムアウトしました');
    }
    throw error;
  }
}

// 4. ピッチ一覧を取得（高速化・キャッシュ機能追加）───────────────
async function loadPitches() {
  try {
    console.log('🔄 ピッチ一覧取得開始');
    
    // キャッシュチェック
    const now = Date.now();
    if (pitchesCache && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('📦 キャッシュからピッチ一覧を表示');
      displayPitches(pitchesCache);
      return;
    }
    
    console.log('🌐 サーバーからピッチ一覧を取得');
    
    // ローディング状態表示
    showLoading();
    
    const token = localStorage.getItem('authToken');
    const res = await fetchWithTimeout(`${BASE_URL}/api/pitches`, {
      headers: {
        'x-user-id': token, // 認証ヘッダーを統一
        'Content-Type': 'application/json'
      }
    }, 15000); // 15秒タイムアウト
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('認証が無効です。再度ログインしてください。');
      } else if (res.status === 403) {
        throw new Error('アクセス権限がありません');
      } else if (res.status >= 500) {
        throw new Error('サーバーエラーが発生しました');
      } else {
        throw new Error(`ピッチ取得に失敗しました (${res.status})`);
      }
    }

    const pitches = await res.json();
    console.log(`📊 取得したピッチ数: ${pitches.length}`);
    
    // キャッシュ更新
    pitchesCache = pitches;
    lastFetchTime = now;
    
    displayPitches(pitches);
    
  } catch (err) {
    console.error('❌ ピッチ取得エラー:', err);
    showError(err.message);
  }
}

// 5. ピッチ表示処理（高速化）
function displayPitches(pitches) {
  hideLoading();
  
  if (!pitches || pitches.length === 0) {
    showEmpty();
    return;
  }

  console.log('🎨 ピッチカード生成開始');
  
  // パフォーマンス最適化: DocumentFragmentを使用
  const fragment = document.createDocumentFragment();
  
  pitches.forEach(pitch => {
    const cardElement = createPitchCard(pitch);
    fragment.appendChild(cardElement);
  });
  
  // 一度にDOMに追加（リフロー・リペイント最小化）
  grid.innerHTML = '';
  grid.appendChild(fragment);
  grid.style.display = 'grid';
  
  console.log('✅ ピッチカード表示完了');
}

// 6. ピッチカード生成（DOMベース・高速化）
function createPitchCard(pitch) {
  const statusMap = {
    live: { label: 'デモ中', badge: 'status-live', btn: 'btn-live', action: 'デモを見る' },
    ended: { label: '終了', badge: 'status-ended', btn: 'btn-upcoming', action: '応援する' },
    upcoming: { label: '開始前', badge: 'status-upcoming', btn: 'btn-upcoming', action: '応援する' }
  };
  
  const status = statusMap[pitch.status] || statusMap.upcoming;
  
  // DOM要素を直接作成（innerHTML より高速）
  const cardDiv = document.createElement('div');
  cardDiv.className = 'pitch-card';
  
  // カバー画像セクション
  const coverDiv = document.createElement('div');
  coverDiv.className = 'cover-image';
  
  if (pitch.coverImage && pitch.coverImage.trim()) {
    const img = document.createElement('img');
    img.src = pitch.coverImage;
    img.alt = `${pitch.team}のピッチ`;
    img.onerror = function() {
      // 画像読み込み失敗時はプレースホルダーに切り替え
      this.style.display = 'none';
      const placeholder = createCoverPlaceholder(pitch.team);
      coverDiv.appendChild(placeholder);
    };
    coverDiv.appendChild(img);
  } else {
    const placeholder = createCoverPlaceholder(pitch.team);
    coverDiv.appendChild(placeholder);
  }
  
  // ステータスバッジ
  const statusBadge = document.createElement('div');
  statusBadge.className = `status-badge ${status.badge}`;
  statusBadge.textContent = status.label;
  coverDiv.appendChild(statusBadge);
  
  // ライブインジケーター
  if (pitch.status === 'live') {
    const liveIndicator = document.createElement('div');
    liveIndicator.className = 'live-indicator';
    liveIndicator.innerHTML = '<div class="live-dot"></div><span class="live-text">LIVE</span>';
    coverDiv.appendChild(liveIndicator);
  }
  
  cardDiv.appendChild(coverDiv);
  
  // カードコンテンツ
  const contentDiv = document.createElement('div');
  contentDiv.className = 'card-content';
  
  // ヘッダー
  const headerDiv = document.createElement('div');
  headerDiv.className = 'card-header';
  
  const teamBadge = document.createElement('span');
  teamBadge.className = 'team-badge';
  teamBadge.textContent = pitch.team || '未設定';
  
  const schedule = document.createElement('span');
  schedule.className = 'schedule';
  schedule.textContent = pitch.schedule || '';
  
  headerDiv.appendChild(teamBadge);
  headerDiv.appendChild(schedule);
  
  // タイトルと説明
  const title = document.createElement('h3');
  title.className = 'pitch-title';
  title.textContent = pitch.title || 'タイトル未設定';
  
  const description = document.createElement('p');
  description.className = 'pitch-description';
  description.textContent = pitch.description || '説明文がありません';
  
  // 統計情報
  const statsDiv = document.createElement('div');
  statsDiv.className = 'stats';
  
  const statsLeft = document.createElement('div');
  statsLeft.className = 'stats-left';
  
  const tipsStat = document.createElement('span');
  tipsStat.className = 'stat-item';
  tipsStat.textContent = `${pitch.totalTips || 0} QU`;
  
  const pitchId = document.createElement('span');
  pitchId.className = 'pitch-id';
  pitchId.textContent = `#${pitch._id}`;
  
  statsLeft.appendChild(tipsStat);
  statsDiv.appendChild(statsLeft);
  statsDiv.appendChild(pitchId);
  
  // アクションボタン
  const actionLink = document.createElement('a');
  actionLink.href = `/pitch-detail.html?id=${pitch._id}`;
  actionLink.className = `action-btn ${status.btn}`;
  actionLink.textContent = status.action;
  
  // イベントリスナー追加（ナビゲーション分析用）
  actionLink.addEventListener('click', () => {
    console.log(`🎯 ピッチ詳細へ移動: ${pitch.title} (${pitch._id})`);
  });
  
  // 要素組み立て
  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(title);
  contentDiv.appendChild(description);
  contentDiv.appendChild(statsDiv);
  contentDiv.appendChild(actionLink);
  
  cardDiv.appendChild(contentDiv);
  
  return cardDiv;
}

// 7. カバープレースホルダー作成
function createCoverPlaceholder(teamName) {
  const placeholder = document.createElement('div');
  placeholder.className = 'cover-placeholder';
  
  const teamNameDiv = document.createElement('div');
  teamNameDiv.className = 'team-name';
  teamNameDiv.textContent = teamName || 'チーム未設定';
  
  const coverText = document.createElement('div');
  coverText.className = 'cover-text';
  coverText.textContent = 'Cover Image';
  
  placeholder.appendChild(teamNameDiv);
  placeholder.appendChild(coverText);
  
  return placeholder;
}

// 8. 状態管理関数
function showLoading() {
  loading.style.display = 'flex';
  grid.style.display = 'none';
  empty.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showEmpty() {
  loading.style.display = 'none';
  grid.style.display = 'none';
  empty.style.display = 'block';
}

function showError(message) {
  hideLoading();
  
  // エラー表示用の要素作成
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-state';
  errorDiv.style.cssText = `
    text-align: center;
    padding: 3rem 0;
    color: #dc2626;
  `;
  
  errorDiv.innerHTML = `
    <div style="margin-bottom: 1rem;">⚠️</div>
    <p style="margin-bottom: 1rem;">${message}</p>
    <button onclick="retryLoad()" style="
      background: #14b8a6;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    ">再試行</button>
  `;
  
  grid.innerHTML = '';
  grid.appendChild(errorDiv);
  grid.style.display = 'block';
}

// 9. 再試行機能
window.retryLoad = function() {
  pitchesCache = null; // キャッシュクリア
  loadPitches();
};

// 10. 自動更新機能（オプション）
function setupAutoRefresh() {
  // 5分ごとに自動更新
  setInterval(() => {
    console.log('🔄 自動更新実行');
    pitchesCache = null; // キャッシュクリア
    loadPitches();
  }, 5 * 60 * 1000);
}

// 11. ページ可視性変更時の処理
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // ページが再び表示された時
    const now = Date.now();
    if (!pitchesCache || (now - lastFetchTime) > CACHE_DURATION) {
      console.log('🔄 ページ復帰時の更新');
      loadPitches();
    }
  }
});

// 12. 初期化実行
console.log('🚀 ホームページ初期化開始');
loadPitches();
setupAutoRefresh();

// 13. エラーハンドリング
window.addEventListener('error', (event) => {
  console.error('未処理エラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未処理Promise拒否:', event.reason);
});