import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CoinProvider } from './context/CoinContext';
import { PitchProvider } from './context/PitchContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CoinPage from './pages/CoinPage';
import PitchDetailPage from './pages/PitchDetailPage';
import PitchManagementPage from './pages/PitchManagementPage';
import AdminPage from './pages/AdminPage';
import HelpPage from './pages/HelpPage'; 

import './styles/globals.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CoinProvider>
          <PitchProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Help (公開ページ) */}
                <Route path="/help" element={
                  <Layout>                  {/* ←ヘッダー／フッター共通レイアウトを使う場合 */}
                    <HelpPage />
                  </Layout>
               } />
                
                {/* Protected routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Layout>
                      <HomePage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/coins" element={
                  <ProtectedRoute>
                    <Layout>
                      <CoinPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/pitch/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <PitchDetailPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/manage" element={
                  <ProtectedRoute requiredRole="presenter">
                    <Layout>
                      <PitchManagementPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Redirect to landing page for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </PitchProvider>
        </CoinProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;