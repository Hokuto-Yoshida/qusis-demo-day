/* public/js/pages/login.js  */
import { BASE_URL } from '../config.js';   // ← 相対パス注意（../ で 1 つ上に戻る）

// --- DOM 取得 ---
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const errorBox   = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = 'ログイン中...';

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passInput.value
      })
    });

    if (!res.ok) {
      const { message = 'ログインに失敗しました' } = await res.json().catch(() => ({}));
      throw new Error(message);
    }

    // login 成功 → token と user を保存
    const { token, user } = await res.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    // ホームへリダイレクト
    location.href = '/home.html';
  } catch (err) {
    errorBox.textContent = err.message;
  }
});
