/* public/js/pages/pitch-management.js */
import { BASE_URL } from '../config.js';
import '../header.js';

if (!localStorage.getItem('authToken')) location.href = '/login.html';

const form   = document.getElementById('create-form');
const list   = document.getElementById('my-pitches');
const empty  = document.getElementById('empty');
const loader = document.getElementById('loading');

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form));
  await fetchJSON(`${BASE_URL}/api/pitches`,{
    method:'POST',
    headers:{'Content-Type':'application/json',
             Authorization:`Bearer ${token()}`},
    body:JSON.stringify(body)
  });
  form.reset();
  loadMine();
});

list.addEventListener('click', (e)=>{
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('btn-del'))  del(id);
  if (e.target.classList.contains('btn-live')) toggleLive(id);
});

loadMine();

async function loadMine(){
  loader.style.display='block'; list.innerHTML='';
  const data = await fetchJSON(`${BASE_URL}/api/pitches?mine=true`,{
    headers:{Authorization:`Bearer ${token()}`}
  });
  loader.style.display='none';
  if(!data.length){ empty.style.display='block'; return; }
  empty.style.display='none';
  list.innerHTML = data.map(rowTemplate).join('');
}

function rowTemplate(p){
  return `<tr>
    <td>${p.title}</td><td>${p.status}</td>
    <td>${p.totalTips}</td>
    <td>
      <button class="btn-live" data-id="${p._id}">
        ${p.status==='live'?'End':'Go Live'}
      </button>
      <button class="btn-del"  data-id="${p._id}">Del</button>
    </td>
  </tr>`;
}

async function del(id){
  if(!confirm('本当に削除？')) return;
  await fetchJSON(`${BASE_URL}/api/pitches/${id}`,{
    method:'DELETE', headers:{Authorization:`Bearer ${token()}`}
  });
  loadMine();
}

async function toggleLive(id){
  await fetchJSON(`${BASE_URL}/api/pitches/${id}/toggle-live`,{
    method:'PATCH', headers:{Authorization:`Bearer ${token()}`}
  });
  loadMine();
}

/* ───── helpers ───── */
function token(){ return localStorage.getItem('authToken'); }
async function fetchJSON(url,opt={}){
  const r = await fetch(url,opt);
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
