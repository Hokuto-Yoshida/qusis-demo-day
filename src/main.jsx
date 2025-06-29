// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './styles/globals.css';

// axios baseURL setting
if (import.meta.env.PROD) {
  // 本番環境
  axios.defaults.baseURL = 'https://qusis-demo-day-1.onrender.com';
} else {
  // 開発環境
  axios.defaults.baseURL = 'http://localhost:4000';
}

console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
console.log('API Base URL:', axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);