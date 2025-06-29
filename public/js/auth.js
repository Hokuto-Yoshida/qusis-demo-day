// public/js/auth.js - 認証保護機能

/**
 * QUSIS デモデイ - 認証保護機能
 * ProtectedRoute の機能をHTML版で実現
 */

class QUSISAuth {
    constructor() {
        this.currentUser = null;
        this.isLoading = true;
    }

    // 認証保護を適用
    static protect(requiredRole = null) {
        return new Promise((resolve, reject) => {
            const auth = new QUSISAuth();
            auth.checkAuth(requiredRole).then(resolve).catch(reject);
        });
    }

    // ローディング画面を表示
    showLoading() {
        const loadingHTML = `
            <div id="auth-loading" class="auth-loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }

    // ローディング画面を非表示
    hideLoading() {
        const loading = document.getElementById('auth-loading');
        if (loading) {
            loading.remove();
        }
    }

    // 認証チェック
    async checkAuth(requiredRole = null) {
        this.showLoading();

        try {
            const token = localStorage.getItem('authToken');
            const userStr = localStorage.getItem('user');

            // 認証情報がない場合
            if (!token || !userStr) {
                this.redirectToLogin();
                return false;
            }

            // ユーザー情報を解析
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (error) {
                console.error('ユーザー情報の解析に失敗:', error);
                this.redirectToLogin();
                return false;
            }

            // 役割チェック
            if (requiredRole && this.currentUser.role !== requiredRole) {
                this.redirectToHome(`このページは${this.getRoleLabel(requiredRole)}のみアクセス可能です`);
                return false;
            }

            // 認証成功
            this.isLoading = false;
            this.hideLoading();
            return true;

        } catch (error) {
            console.error('認証エラー:', error);
            this.redirectToLogin();
            return false;
        }
    }

    // ログインページにリダイレクト
    redirectToLogin() {
        // 現在のページを保存（ログイン後に戻るため）
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        
        window.location.href = 'login.html';
    }

    // ホームページにリダイレクト
    redirectToHome(message = null) {
        if (message) {
            alert(message);
        }
        window.location.href = 'home.html';
    }

    // 役割のラベルを取得
    getRoleLabel(role) {
        const labels = {
            admin: '管理者',
            presenter: '発表者',
            viewer: '観覧者'
        };
        return labels[role] || role;
    }

    // 現在のユーザーを取得
    getCurrentUser() {
        return this.currentUser;
    }

    // ログアウト
    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = 'index.html';
    }

    // ログイン成功後のリダイレクト処理
    static handleLoginSuccess() {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        
        if (redirectPath && redirectPath !== '/login.html') {
            window.location.href = redirectPath;
        } else {
            window.location.href = 'home.html';
        }
    }

    // 認証状態をチェック（リダイレクトなし）
    static isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        return !!(token && userStr);
    }

    // 現在のユーザー情報を取得（静的メソッド）
    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('ユーザー情報の解析に失敗:', error);
            return null;
        }
    }

    // 役割チェック（静的メソッド）
    static hasRole(requiredRole) {
        const user = QUSISAuth.getCurrentUser();
        return user && user.role === requiredRole;
    }
}

// 認証保護用CSS
const authCSS = `
<style>
.auth-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
`;

// CSS を head に追加
document.head.insertAdjacentHTML('beforeend', authCSS);

// 使用例用のヘルパー関数
window.QUSISAuth = QUSISAuth;

// 簡単に使用できるグローバル関数
window.protectPage = (requiredRole = null) => {
    return QUSISAuth.protect(requiredRole);
};

window.requireAuth = () => {
    return QUSISAuth.protect();
};

window.requireAdmin = () => {
    return QUSISAuth.protect('admin');
};

window.requirePresenter = () => {
    return QUSISAuth.protect('presenter');
};