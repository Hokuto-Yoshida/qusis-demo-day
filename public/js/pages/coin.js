/* public/js/pages/coin.js */
import { BASE_URL } from '../config.js';
import '../header.js';

if (!localStorage.getItem('authToken')) location.href = '/login.html';

const balEl = document.getElementById('balance');
const btnAdd = document.getElementById('add-coin');

updateBalance();
btnAdd.addEventListener('click', () => addCoin(50)); // 例：50QU 加算

async function updateBalance(){
  const { balance } = await fetchJSON(`${BASE_URL}/api/coins/balance`, {
    headers:{Authorization:`Bearer ${token()}`}
  });
  balEl.textContent = `${balance} QUcoin`;

  // Header 側の残高も書き換える
  const u = JSON.parse(localStorage.getItem('user'));
  u.coinBalance = balance;
  localStorage.setItem('user', JSON.stringify(u));
}

async function addCoin(amount){
  await fetchJSON(`${BASE_URL}/api/coins/add`,{
    method:'POST',
    headers:{'Content-Type':'application/json',
             Authorization:`Bearer ${token()}`},
    body:JSON.stringify({ amount })
  });
  await updateBalance();
}

function token(){ return localStorage.getItem('authToken'); }
async function fetchJSON(u,o={}){ const r = await fetch(u,o); if(!r.ok) throw r; return r.json();}
