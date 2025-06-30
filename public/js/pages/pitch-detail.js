/* public/js/pages/pitch-detail.js */
import { BASE_URL } from '../config.js';
import '../header.js';

if (!localStorage.getItem('authToken')) location.href = '/login.html';

const q = new URLSearchParams(location.search);
const pitchId = q.get('id');
if (!pitchId) location.href = '/home.html';

const cover     = document.getElementById('cover');
const titleEl   = document.getElementById('pitch-title');
const descEl    = document.getElementById('pitch-desc');
const teamEl    = document.getElementById('team');
const tipsEl    = document.getElementById('tip-total');
const btnTip10  = document.getElementById('tip10');
const btnTip50  = document.getElementById('tip50');
const btnTip100 = document.getElementById('tip100');
const toast     = document.getElementById('toast');

loadDetail();
attachTipHandlers();

async function loadDetail() {
  try {
    const res = await fetch(`${BASE_URL}/api/pitches/${pitchId}`, {
      headers: { Authorization:`Bearer ${localStorage.getItem('authToken')}` }
    });
    if (!res.ok) throw new Error('取得失敗');
    const p = await res.json();

    if (p.coverImage) cover.src = p.coverImage;
    titleEl.textContent = p.title;
    descEl.textContent  = p.description;
    teamEl.textContent  = p.team;
    tipsEl.textContent  = p.totalTips;
  } catch (e) {
    alert('ピッチ取得に失敗しました'); console.error(e);
  }
}

function attachTipHandlers () {
  [btnTip10,btnTip50,btnTip100].forEach(btn=>{
    btn.addEventListener('click',()=> sendTip(+btn.dataset.amount));
  });
}

async function sendTip(amount){
  try{
    const res = await fetch(`${BASE_URL}/api/tips`,{
      method:'POST',
      headers:{'Content-Type':'application/json',
               Authorization:`Bearer ${localStorage.getItem('authToken')}`},
      body:JSON.stringify({ pitchId, amount })
    });
    if(!res.ok) throw new Error('送信失敗');
    const { newTotal } = await res.json();
    tipsEl.textContent = newTotal;
    showToast(`+${amount} QUcoin ありがとう！`);
  }catch(e){
    showToast('送信エラー'); console.error(e);
  }
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2500);
}
