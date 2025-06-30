// create-admin.js - プロジェクトルートに配置
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

// MongoDB接続
const MONGODB_URI = 'mongodb+srv://Hoku2346:Hoku2346@demo-day.gob5heo.mongodb.net/qusis?retryWrites=true&w=majority';

async function createAdminUser() {
    try {
        // MongoDB接続
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB接続成功');

        // 管理者アカウント情報
        const adminData = {
            name: 'QUSIS運営',
            email: 'admin@qusis.org',
            password: 'qusis2024',
            role: 'admin',
            team: null,
            coinBalance: 10000 // 管理者には多めのコインを付与
        };

        // 既存の管理者アカウントをチェック
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️  管理者アカウントは既に存在します');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            return;
        }

        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // 管理者ユーザー作成
        const adminUser = new User({
            ...adminData,
            password: hashedPassword
        });

        await adminUser.save();

        console.log('🎉 管理者アカウントを作成しました！');
        console.log('');
        console.log('=== ログイン情報 ===');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('Role:', adminData.role);
        console.log('初期コイン:', adminData.coinBalance);
        console.log('');
        console.log('この情報でログインページからログインできます。');

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    } finally {
        // MongoDB接続を閉じる
        await mongoose.disconnect();
        console.log('MongoDB接続を切断しました');
        process.exit(0);
    }
}

// スクリプト実行
createAdminUser();