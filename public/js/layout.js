// public/js/layout.js - レイアウトシステム

/**
 * QUSIS デモデイ - レイアウトシステム
 * Header + Main のレイアウト構造を作成
 */

class QUSISLayout {
    constructor() {
        this.init();
    }

    // レイアウト初期化
    init() {
        this.setupLayout();
        this.addCommonStyles();
    }

    // レイアウト構造を設定
    setupLayout() {
        // body にレイアウトクラスを追加
        document.body.classList.add('qusis-layout');
        
        // 既存のコンテンツをメインタグで囲む
        const existingContent = document.body.innerHTML;
        document.body.innerHTML = `
            <div class="layout-container">
                <main class="layout-main" id="layout-main">
                    ${existingContent}
                </main>
            </div>
        `;
    }

    // 共通スタイルを追加
    addCommonStyles() {
        const layoutCSS = `
            <style>
            /* レイアウト基本スタイル */
            .qusis-layout {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
            }

            .layout-container {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            .layout-main {
                flex: 1;
                padding-top: 4rem; /* ヘッダー分 */
                padding-left: 1rem;
                padding-right: 1rem;
                padding-bottom: 4rem; /* モバイルナビ分 */
            }

            @media (min-width: 640px) {
                .layout-main {
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                }
            }

            @media (min-width: 768px) {
                .layout-main {
                    padding-bottom: 1rem; /* デスクトップではモバイルナビなし */
                }
            }

            @media (min-width: 1024px) {
                .layout-main {
                    padding-left: 2rem;
                    padding-right: 2rem;
                }
            }

            /* 共通コンテンツスタイル */
            .page-container {
                max-width: 80rem;
                margin: 0 auto;
                width: 100%;
            }

            .page-header {
                margin-bottom: 2rem;
            }

            .page-title {
                font-size: 1.875rem;
                font-weight: bold;
                color: #111827;
                margin-bottom: 0.5rem;
            }

            .page-subtitle {
                color: #6b7280;
            }

            /* カード共通スタイル */
            .card {
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }

            .card-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .card-content {
                padding: 1.5rem;
            }

            .card-title {
                font-size: 1.25rem;
                font-weight: bold;
                color: #111827;
            }

            /* ボタン共通スタイル */
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                text-decoration: none;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-primary {
                background: #14b8a6;
                color: white;
            }

            .btn-primary:hover {
                background: #0d9488;
            }

            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-secondary:hover {
                background: #e5e7eb;
            }

            .btn-danger {
                background: #dc2626;
                color: white;
            }

            .btn-danger:hover {
                background: #b91c1c;
            }

            /* フォーム共通スタイル */
            .form-group {
                margin-bottom: 1rem;
            }

            .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
            }

            .form-input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: border-color 0.2s;
            }

            .form-input:focus {
                outline: none;
                border-color: #14b8a6;
                box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
            }

            .form-input::placeholder {
                color: #9ca3af;
            }

            /* ユーティリティクラス */
            .text-center {
                text-align: center;
            }

            .text-left {
                text-align: left;
            }

            .text-right {
                text-align: right;
            }

            .hidden {
                display: none;
            }

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* スペーシング */
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }

            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }

            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

            /* グリッドシステム */
            .grid {
                display: grid;
            }

            .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
            }

            .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .gap-4 {
                gap: 1rem;
            }

            .gap-6 {
                gap: 1.5rem;
            }

            @media (min-width: 768px) {
                .md\\:grid-cols-2 {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .md\\:grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                .md\\:grid-cols-4 {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                }
            }

            @media (min-width: 1024px) {
                .lg\\:grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                .lg\\:grid-cols-4 {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                }
            }

            /* フレックスボックス */
            .flex {
                display: flex;
            }

            .flex-col {
                flex-direction: column;
            }

            .items-center {
                align-items: center;
            }

            .justify-center {
                justify-content: center;
            }

            .justify-between {
                justify-content: space-between;
            }

            .space-x-2 > * + * {
                margin-left: 0.5rem;
            }

            .space-x-4 > * + * {
                margin-left: 1rem;
            }

            .space-y-4 > * + * {
                margin-top: 1rem;
            }

            /* テキストスタイル */
            .text-sm {
                font-size: 0.875rem;
            }

            .text-lg {
                font-size: 1.125rem;
            }

            .text-xl {
                font-size: 1.25rem;
            }

            .text-2xl {
                font-size: 1.5rem;
            }

            .text-3xl {
                font-size: 1.875rem;
            }

            .font-medium {
                font-weight: 500;
            }

            .font-semibold {
                font-weight: 600;
            }

            .font-bold {
                font-weight: 700;
            }

            /* 色 */
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }

            .text-teal-600 { color: #0d9488; }
            .text-red-600 { color: #dc2626; }
            .text-green-600 { color: #16a34a; }
            .text-blue-600 { color: #2563eb; }

            /* ホバー効果 */
            .hover\\:bg-gray-50:hover {
                background-color: #f9fafb;
            }

            .hover\\:text-teal-600:hover {
                color: #0d9488;
            }

            /* トランジション */
            .transition {
                transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;
            }

            /* レスポンシブユーティリティ */
            .block {
                display: block;
            }

            .inline-block {
                display: inline-block;
            }

            .w-full {
                width: 100%;
            }

            .h-full {
                height: 100%;
            }

            @media (min-width: 640px) {
                .sm\\:block {
                    display: block;
                }
                .sm\\:hidden {
                    display: none;
                }
            }

            @media (min-width: 768px) {
                .md\\:block {
                    display: block;
                }
                .md\\:hidden {
                    display: none;
                }
                .md\\:flex {
                    display: flex;
                }
            }

            @media (min-width: 1024px) {
                .lg\\:block {
                    display: block;
                }
                .lg\\:hidden {
                    display: none;
                }
            }

            /* ローディングアニメーション */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .animate-fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }

            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out;
            }

            /* スクロールバー */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            ::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            ::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', layoutCSS);
    }

    // ページコンテナを追加
    static wrapContent(element) {
        if (!element.classList.contains('page-container')) {
            element.classList.add('page-container');
        }
    }

    // カードコンポーネントを作成
    static createCard(title, content, className = '') {
        return `
            <div class="card ${className}">
                ${title ? `
                    <div class="card-header">
                        <h3 class="card-title">${title}</h3>
                    </div>
                ` : ''}
                <div class="card-content">
                    ${content}
                </div>
            </div>
        `;
    }

    // ページヘッダーを作成
    static createPageHeader(title, subtitle = '') {
        return `
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
            </div>
        `;
    }

    // 統計カードを作成
    static createStatCard(title, value, icon = '') {
        return `
            <div class="card">
                <div class="card-content">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">${title}</p>
                            <p class="text-2xl font-bold text-gray-900">${value}</p>
                        </div>
                        ${icon ? `<div class="text-gray-400">${icon}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // エラーメッセージを表示
    static showError(message, container = document.body) {
        const errorHTML = `
            <div class="error-message" style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                <p>${message}</p>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', errorHTML);
        
        // 5秒後に自動削除
        setTimeout(() => {
            const errorEl = container.querySelector('.error-message');
            if (errorEl) errorEl.remove();
        }, 5000);
    }

    // 成功メッセージを表示
    static showSuccess(message, container = document.body) {
        const successHTML = `
            <div class="success-message" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                <p>${message}</p>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', successHTML);
        
        // 5秒後に自動削除
        setTimeout(() => {
            const successEl = container.querySelector('.success-message');
            if (successEl) successEl.remove();
        }, 5000);
    }
}

// ページ読み込み時にレイアウトを初期化
document.addEventListener('DOMContentLoaded', () => {
    new QUSISLayout();
});

// グローバルに公開
window.QUSISLayout = QUSISLayout;