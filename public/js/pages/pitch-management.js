/* public/js/pages/pitch-management.js */
import { BASE_URL } from '../config.js';
import '../header.js';

// DOM 構築後に一度だけ実行
window.addEventListener('DOMContentLoaded', () => {
  // 認証チェック
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  if (!token || !userStr) {
    location.href = '/login.html';
    return;
  }
  const currentUser = JSON.parse(userStr);
  if (currentUser.role !== 'presenter') {
    alert('このページは発表者のみアクセス可能です');
    location.href = 'home.html';
    return;
  }

  // 要素取得（HTML id に合わせて更新）
  const form       = document.getElementById('pitch-form');
  const list       = document.getElementById('pitches-list');
  const emptyState = document.getElementById('empty-state');
  const loader     = document.getElementById('loading');

  // イベント登録
  form.addEventListener('submit', onSubmit);
  list.addEventListener('click', onListClick);

  // 初期ロード
  loadMine();

  // フォーム送信（作成／更新）
  async function onSubmit(e) {
    e.preventDefault();
    const title       = document.getElementById('title-input').value.trim();
    const description = document.getElementById('description-input').value.trim();
    const coverImage  = document.getElementById('preview-image').src || '';
    if (!title || !description) {
      alert('タイトルと説明を入力してください');
      return;
    }
    const body = { title, description, coverImage };
    try {
      const res = await fetch(`${BASE_URL}/api/pitches` + (isEditMode ? `/${editingPitch._id}` : ''), {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': token
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      await loadMine();
      closeModal();
      alert(isEditMode ? 'ピッチを更新しました' : 'ピッチを作成しました');
    } catch (err) {
      console.error('保存エラー:', err);
      alert('保存に失敗しました');
    }
  }

  // リストクリック（削除/切替）
  function onListClick(e) {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('btn-live')) toggleLive(id);
    if (e.target.classList.contains('btn-del')) deletePitch(id);
  }

  // 自分のピッチ一覧取得
  async function loadMine() {
    loader.style.display = 'block';
    list.innerHTML = '';
    emptyState.classList.add('hidden');
    try {
      const res = await fetch(`${BASE_URL}/api/pitches?mine=true`, {
        headers: { 'x-user-id': token }
      });
      if (!res.ok) throw new Error('取得失敗');
      const data = await res.json();
      loader.style.display = 'none';
      if (data.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        list.innerHTML = data.map(rowTemplate).join('');
      }
    } catch (err) {
      console.error('ピッチ取得エラー:', err);
      loader.style.display = 'none';
      emptyState.classList.remove('hidden');
    }
  }

  // テーブル行テンプレ
  function rowTemplate(p) {
    return `
      <tr>
        <td>${p.title}</td>
        <td>${p.status}</td>
        <td>${p.totalTips}</td>
        <td>
          <button class="btn-live" data-id="${p._id}">${p.status==='live' ? 'End' : 'Go Live'}</button>
          <button class="btn-del"  data-id="${p._id}">Del</button>
        </td>
      </tr>`;
  }

  // 削除
  async function deletePitch(id) {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/pitches/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': token }
      });
      if (!res.ok) throw new Error('削除失敗');
      alert('削除しました');
      await loadMine();
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  }

  // Go Live / End 切替
  async function toggleLive(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/pitches/${id}/toggle-live`, {
        method: 'PATCH',
        headers: { 'x-user-id': token }
      });
      if (!res.ok) throw new Error('切替失敗');
      await loadMine();
    } catch (err) {
      console.error('切替エラー:', err);
      alert('切替に失敗しました');
    }
  }

  // モーダル管理
  let isEditMode = false;
  let editingPitch = null;
  window.openCreateModal = () => {
    isEditMode = false;
    editingPitch = null;
    document.getElementById('modal-title').textContent = '新規ピッチ作成';
    document.getElementById('submit-text').textContent = '作成する';
    document.getElementById('pitch-form').reset();
    document.getElementById('modal-overlay').classList.remove('hidden');
  };
  window.closeModal = () => document.getElementById('modal-overlay').classList.add('hidden');
});
