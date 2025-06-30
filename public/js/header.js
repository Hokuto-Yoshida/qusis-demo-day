// public/js/header.js - 共通ヘッダーコンポーネント

class Header {
    constructor() {
        this.currentUser = null;
        this.currentPath = window.location.pathname;
        this.init();
    }

    init() {
        this.loadUser();
        this.createHeader();
        this.attachEventListeners();
        this.updateCoinBalance();
    }

    loadUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (error) {
                console.error('ユーザー情報の読み込みエラー:', error);
            }
        }
    }

    getNavItems() {
        const baseItems = [];

        const roleItems = {
            presenter: [
                { path: '/pitch-management.html', label: 'ピッチ管理', show: true }
            ],
            admin: [
                { path: '/admin.html', label: '管理画面', show: true }
            ]
        };

        const helpItem = { path: '/usage.html', label: '使い方', show: true };
        
        return [...baseItems, ...(roleItems[this.currentUser?.role] || []), helpItem];
    }

    createHeader() {
        if (!this.currentUser) return;

        const navItems = this.getNavItems();
        
        const headerHTML = `
            <header class="header-fixed">
                <div class="header-container">
                    <div class="header-content">
                        <!-- Logo -->
                        <a href="home.html" class="header-logo">
                            <img src="/logo.png" alt="QUSIS ロゴ" class="logo-image" />
                        </a>

                        <!-- Navigation (Desktop) -->
                        <nav class="header-nav">
                            ${navItems.map(item => `
                                <a href="${item.path}" class="nav-item ${this.currentPath.includes(item.path.replace('.html', '')) ? 'nav-active' : ''}">
                                    ${item.label}
                                </a>
                            `).join('')}
                        </nav>

                        <!-- Right Side -->
                        <div class="header-right">
                            <!-- Coin Balance -->
                            <div class="coin-balance">
                                <svg class="coin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                </svg>
                                <span class="coin-amount" id="header-coin-balance">
                                    ${(this.currentUser.coinBalance || 0).toLocaleString()} QUcoin
                                </span>
                            </div>

                            <!-- Add Coins Button -->
                            <a href="coin.html" class="add-coins-btn">
                                <svg class="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                <span>コインを増やす</span>
                            </a>

                            <!-- User Menu -->
                            <div class="user-menu" id="user-menu">
                                <button class="user-button" id="user-button">
                                    <div class="user-avatar">
                                        <span class="avatar-text">
                                            ${this.currentUser.avatar || this.currentUser.name?.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div class="user-info">
                                        <div class="user-name">${this.currentUser.name}</div>
                                        <div class="user-id">ID: ${this.currentUser.id}</div>
                                    </div>
                                </button>
                                <div class="user-dropdown" id="user-dropdown">
                                    <div class="dropdown-content">
                                        <div class="user-profile">
                                            <div class="profile-name">${this.currentUser.name}</div>
                                            <div class="profile-email">${this.currentUser.email}</div>
                                            ${this.currentUser.team ? `<div class="profile-team">チーム: ${this.currentUser.team}</div>` : ''}
                                        </div>
                                        <button class="logout-btn" id="logout-btn">
                                            <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                            </svg>
                                            <span>ログアウト</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mobile Navigation (Bottom Bar) -->
                <div class="mobile-nav">
                    <div class="mobile-nav-content">
                        ${navItems.map(item => `
                            <a href="${item.path}" class="mobile-nav-item ${this.currentPath.includes(item.path.replace('.html', '')) ? 'mobile-nav-active' : ''}">
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </header>
        `;

        // ヘッダーのCSSを追加
        this.addHeaderStyles();
        
        // ヘッダーをbodyの最初に挿入
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
        // ページコンテンツにpadding-topを追加
        document.body.style.paddingTop = '4rem';
        document.body.style.paddingBottom = '4rem'; // モバイルナビ用
    }

    addHeaderStyles() {
        const styles = `
            <style>
                .header-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                }
                
                .header-container {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 0 1rem;
                }
                
                @media (min-width: 640px) {
                    .header-container {
                        padding: 0 1.5rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    .header-container {
                        padding: 0 2rem;
                    }
                }
                
                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 4rem;
                }
                
                .header-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: #111827;
                    font-weight: bold;
                    font-size: 1.25rem;
                }
                
                .logo-image {
                    height: 2rem;
                    width: auto;
                }
                
                .header-nav {
                    display: none;
                    align-items: center;
                    gap: 1.5rem;
                    overflow-x: auto;
                    white-space: nowrap;
                }
                
                @media (min-width: 768px) {
                    .header-nav {
                        display: flex;
                    }
                }
                
                .nav-item {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    text-decoration: none;
                    transition: color 0.2s;
                    padding-bottom: 0.25rem;
                }
                
                .nav-item:hover {
                    color: #14b8a6;
                }
                
                .nav-active {
                    color: #14b8a6 !important;
                    border-bottom: 2px solid #14b8a6;
                }
                
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .coin-balance {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #fff7ed;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                }
                
                .coin-icon {
                    width: 1rem;
                    height: 1rem;
                    color: #ea580c;
                }
                
                .coin-amount {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #9a3412;
                }
                
                .add-coins-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #14b8a6;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                
                .add-coins-btn:hover {
                    background: #0d9488;
                }
                
                .add-icon {
                    width: 1rem;
                    height: 1rem;
                }
                
                .user-menu {
                    position: relative;
                }
                
                .user-button {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #f3f4f6;
                    border-radius: 9999px;
                    padding: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .user-button:hover {
                    background: #e5e7eb;
                }
                
                .user-avatar {
                    width: 2rem;
                    height: 2rem;
                    background: #14b8a6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .avatar-text {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .user-info {
                    display: none;
                    text-align: left;
                }
                
                @media (min-width: 768px) {
                    .user-info {
                        display: block;
                    }
                }
                
                .user-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #111827;
                }
                
                .user-id {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                
                .user-dropdown {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    margin-top: 0.5rem;
                    width: 12rem;
                    background: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s;
                }
                
                .user-dropdown.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .dropdown-content {
                    padding: 0.25rem 0;
                }
                
                .user-profile {
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .profile-name {
                    font-weight: 500;
                    color: #111827;
                }
                
                .profile-email {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                
                .profile-team {
                    font-size: 0.75rem;
                    color: #14b8a6;
                }
                
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.5rem 1rem;
                    background: none;
                    border: none;
                    color: #374151;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .logout-btn:hover {
                    background: #f3f4f6;
                }
                
                .logout-icon {
                    width: 1rem;
                    height: 1rem;
                }
                
                .mobile-nav {
                    display: block;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                }
                
                @media (min-width: 768px) {
                    .mobile-nav {
                        display: none;
                    }
                }
                
                .mobile-nav-content {
                    display: flex;
                    justify-content: space-around;
                    padding: 0.5rem 0;
                }
                
                .mobile-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                .mobile-nav-item:hover,
                .mobile-nav-active {
                    color: #14b8a6;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    attachEventListeners() {
        // ユーザーメニューのトグル
        const userButton = document.getElementById('user-button');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userButton && userDropdown) {
            userButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            // ドロップダウン外クリックで閉じる
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });

            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // ログアウト
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    updateCoinBalance() {
        // ローカルストレージの変更を監視
        const updateBalance = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const balanceEl = document.getElementById('header-coin-balance');
                    if (balanceEl) {
                        balanceEl.textContent = `${(user.coinBalance || 0).toLocaleString()} QUcoin`;
                    }
                } catch (error) {
                    console.error('コイン残高の更新エラー:', error);
                }
            }
        };

        // 定期的に残高を更新
        setInterval(updateBalance, 1000);
        
        // storage イベントでも更新
        window.addEventListener('storage', updateBalance);
    }
}

// 認証が必要なページでヘッダーを初期化（改善版）
async function initializeHeader() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // トークンの有効性を簡単にチェック
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                new Header();
            } else {
                // 無効なトークンの場合はクリアしてログインページへ
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        } catch (error) {
            // サーバーエラーの場合はヘッダーを表示（オフライン対応）
            console.error('認証確認エラー:', error);
            new Header();
        }
    } else {
        // トークンがない場合はログインページへ
        window.location.href = 'login.html';
    }
}

// DOM読み込み完了後にヘッダーを初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}