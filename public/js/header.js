// public/js/header.js - リアルタイム最適化版

class Header {
    constructor() {
        this.currentUser = null;
        this.currentPath = window.location.pathname;
        this.balanceUpdateInterval = null;
        this.lastKnownBalance = null;
        this.updateFrequency = this.getOptimalUpdateFrequency();
        this.pendingBalanceUpdate = false;
        this.init();
    }

    init() {
        this.loadUser();
        this.createHeader();
        this.attachEventListeners();
        this.setupRealtimeBalanceUpdates();
    }

    // 🚀 ページ別の最適な更新頻度を決定
    getOptimalUpdateFrequency() {
        const path = window.location.pathname;
        
        // ピッチ詳細ページ: 高頻度更新（投げ銭・チャットがある）
        if (path.includes('pitch-detail')) {
            return 2000; // 2秒
        }
        
        // コイン管理ページ: 中頻度更新
        if (path.includes('coin')) {
            return 2000; // 2秒
        }
        
        // ホーム・その他: 低頻度更新
        return 15000; // 15秒
    }

    loadUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                this.lastKnownBalance = this.currentUser.coinBalance;
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
                            <div class="coin-balance" id="coin-balance-container">
                                <svg class="coin-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                </svg>
                                <span class="coin-amount" id="header-coin-balance">
                                    ${(this.currentUser.coinBalance || 0).toLocaleString()} QUcoin
                                </span>
                                <span class="balance-indicator" id="balance-indicator"></span>
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
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .coin-balance.updating {
                    background: #f0fdfa;
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
                    transition: color 0.3s ease;
                }
                
                .balance-indicator {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .balance-indicator.increased {
                    background: #10b981;
                    opacity: 1;
                    animation: balancePulse 0.5s ease;
                }
                
                .balance-indicator.decreased {
                    background: #f59e0b;
                    opacity: 1;
                    animation: balancePulse 0.5s ease;
                }
                
                @keyframes balancePulse {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.5); }
                    100% { transform: scale(1); }
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
        // 残高更新のインターバルをクリア
        if (this.balanceUpdateInterval) {
            clearInterval(this.balanceUpdateInterval);
        }
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // 🚀 サーバーから実際の残高を取得（最適化版）
    async fetchRealBalance() {
        // 既に更新中の場合はスキップ
        if (this.pendingBalanceUpdate) {
            return;
        }

        try {
            this.pendingBalanceUpdate = true;
            
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒タイムアウト

            const response = await fetch('/api/coins/balance', {
                headers: {
                    'x-user-id': token,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                this.updateBalance(data.balance);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('ヘッダー残高取得エラー:', error);
            }
        } finally {
            this.pendingBalanceUpdate = false;
        }
    }

    // 🚀 残高更新（視覚的フィードバック付き）
    updateBalance(newBalance) {
        const balanceEl = document.getElementById('header-coin-balance');
        const indicatorEl = document.getElementById('balance-indicator');
        const containerEl = document.getElementById('coin-balance-container');
        
        if (!balanceEl) return;

        const oldBalance = this.lastKnownBalance;
        
        // 残高が変更された場合
        if (oldBalance !== null && oldBalance !== newBalance) {
            // 視覚的フィードバック
            containerEl?.classList.add('updating');
            
            // 増減インジケーター
            if (indicatorEl) {
                indicatorEl.className = 'balance-indicator';
                if (newBalance > oldBalance) {
                    indicatorEl.classList.add('increased');
                } else if (newBalance < oldBalance) {
                    indicatorEl.classList.add('decreased');
                }
                
                // 1秒後にインジケーターを消す
                setTimeout(() => {
                    indicatorEl.className = 'balance-indicator';
                }, 1000);
            }
            
            // 0.3秒後に更新状態を解除
            setTimeout(() => {
                containerEl?.classList.remove('updating');
            }, 300);
        }

        // 表示を更新
        balanceEl.textContent = `${(newBalance || 0).toLocaleString()} QUcoin`;
        
        // localStorageのユーザー情報を更新
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                user.coinBalance = newBalance;
                localStorage.setItem('user', JSON.stringify(user));
            } catch (error) {
                console.error('ユーザー情報更新エラー:', error);
            }
        }
        
        this.lastKnownBalance = newBalance;
    }

    // 🚀 リアルタイム残高更新システム
    setupRealtimeBalanceUpdates() {
        // 初回実行
        this.fetchRealBalance();
        
        // ページ別の最適な頻度で定期更新
        this.balanceUpdateInterval = setInterval(() => {
            this.fetchRealBalance();
        }, this.updateFrequency);

        // 🚀 即座の更新イベントリスナー
        this.setupInstantUpdates();

        // ページの可視性変更時の処理
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // ページが再び表示された時は即座に更新
                this.fetchRealBalance();
            }
        });

        console.log(`💡 ヘッダー残高更新設定: ${this.updateFrequency/1000}秒間隔 (${this.currentPath})`);
    }

    // 🚀 即座の更新システム
    setupInstantUpdates() {
        // カスタムイベントでの即座更新
        window.addEventListener('coinBalanceChanged', (event) => {
            if (event.detail && typeof event.detail.newBalance === 'number') {
                this.updateBalance(event.detail.newBalance);
            }
        });

        // localStorage変更の監視（他のタブでの変更も反映）
        window.addEventListener('storage', (event) => {
            if (event.key === 'user' && event.newValue) {
                try {
                    const user = JSON.parse(event.newValue);
                    if (user.coinBalance !== this.lastKnownBalance) {
                        this.updateBalance(user.coinBalance);
                    }
                } catch (error) {
                    console.error('Storage event処理エラー:', error);
                }
            }
        });

        // 🚀 ページ内アクション後の即座更新（投げ銭・チャット後）
        this.setupActionBasedUpdates();
    }

    // 🚀 アクション後の即座更新
    setupActionBasedUpdates() {
        // 投げ銭成功後
        window.addEventListener('tipSent', () => {
            console.log('🎯 投げ銭完了 - 残高を即座更新');
            setTimeout(() => this.fetchRealBalance(), 100);
        });

        // チャット送信後
        window.addEventListener('messageSent', () => {
            console.log('💬 チャット送信完了 - 残高を即座更新');
            setTimeout(() => this.fetchRealBalance(), 100);
        });

        // コイン獲得後
        window.addEventListener('coinsEarned', () => {
            console.log('💰 コイン獲得 - 残高を即座更新');
            setTimeout(() => this.fetchRealBalance(), 100);
        });
    }
}

// 🚀 グローバル関数: 他のページから残高更新をトリガー
window.updateCoinBalance = function(newBalance) {
    window.dispatchEvent(new CustomEvent('coinBalanceChanged', {
        detail: { newBalance }
    }));
};

// 🚀 グローバル関数: アクション完了通知
window.notifyActionCompleted = function(actionType) {
    const eventMap = {
        'tip': 'tipSent',
        'message': 'messageSent',
        'coins': 'coinsEarned'
    };
    
    const eventName = eventMap[actionType];
    if (eventName) {
        window.dispatchEvent(new CustomEvent(eventName));
    }
};

// 認証が必要なページでヘッダーを初期化
function initializeHeader() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    console.log('認証チェック - Token:', !!token);
    console.log('認証チェック - User:', !!user);
    
    if (token && user) {
        try {
            JSON.parse(user);
            console.log('ヘッダー初期化開始');
            new Header();
        } catch (error) {
            console.error('ユーザー情報が無効:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    } else {
        console.log('認証情報が不足 - ログインページへリダイレクト');
        window.location.href = 'login.html';
    }
}

// DOM読み込み完了後にヘッダーを初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}