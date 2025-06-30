/* public/js/pages/admin.js */
import { BASE_URL } from '../config.js';
import '../header.js';

if (!localStorage.getItem('authToken')) location.href = '/login.html';

const usersTbl  = document.getElementById('users');
const pitchesTbl= document.getElementById('pitches');

loadUsers(); loadPitches();

async function loadUsers(){
  const users = await fetchJSON(`${BASE_URL}/api/auth/users`,{
    headers:{Authorization:`Bearer ${token()}`}
  });
  usersTbl.innerHTML = users.map(u=>`
    <tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join('');
}

async function loadPitches(){
  const ps = await fetchJSON(`${BASE_URL}/api/pitches`,{
    headers:{Authorization:`Bearer ${token()}`}
  });
  pitchesTbl.innerHTML = ps.map(p=>`
    <tr><td>${p.title}</td><td>${p.team}</td><td>${p.status}</td></tr>`).join('');
}

function token(){ return localStorage.getItem('authToken'); }
async function fetchJSON(u,o={}){ const r = await fetch(u,o); if(!r.ok) throw r; return r.json();}
