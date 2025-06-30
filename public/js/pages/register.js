/* public/js/pages/register.js */
import { BASE_URL } from '../config.js';

const form   = document.getElementById('register-form');
const errorB = document.getElementById('reg-error');

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  errorB.textContent = '登録中...';

  const body = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    if(!res.ok) throw new Error((await res.json()).message || '登録失敗');

    const { token, user } = await res.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    location.href='/home.html';
  } catch(err){
    errorB.textContent = err.message;
  }
});
