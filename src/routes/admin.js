// src/routes/admin.js - シンプル版
import { Router } from 'express';
import Tip from '../models/Tip.js';
import User from '../models/User.js';
import Contribution from '../models/Contribution.js';
import Pitch from '../models/Pitch.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 管理者権限チェックミドルウェア
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '管理者権限が必要です'
        });
    }
    next();
};

// 総応援コイン合計
router.get('/total-coins', async (_, res) => {
    try {
        const result = await Tip.aggregate([{ $group: { _id: null, sum: { $sum: '$amount' } } }]);
        const total = result.length > 0 ? result[0].sum : 0;
        res.json({ total: total || 0 });
    } catch (error) {
        console.error('総コイン取得エラー:', error);
        res.status(500).json({ success: false, message: 'データ取得に失敗しました' });
    }
});

// ユーザー一覧（管理者のみ）
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role coinBalance team createdAt')
            .sort({ createdAt: -1 })
            .lean();
        
        res.json(users);
    } catch (error) {
        console.error('ユーザー一覧取得エラー:', error);
        res.status(500).json({ success: false, message: 'ユーザー一覧の取得に失敗しました' });
    }
});

// ユーザー削除（管理者のみ）
router.delete('/users/:userId', authenticate, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 削除対象ユーザーを取得
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        
        // 管理者の削除を防ぐ
        if (targetUser.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: '管理者アカウントは削除できません'
            });
        }
        
        // 関連データも削除
        await Promise.all([
            Tip.deleteMany({ user: userId }),
            Contribution.deleteMany({ user: userId }),
            Pitch.deleteMany({ createdBy: userId })
        ]);
        
        // ユーザー削除
        await User.findByIdAndDelete(userId);
        
        res.json({
            success: true,
            message: 'ユーザーを削除しました'
        });
    } catch (error) {
        console.error('ユーザー削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'ユーザーの削除に失敗しました'
        });
    }
});

// 時間貢献履歴取得（管理者のみ）
router.get('/time-contributions', authenticate, requireAdmin, async (req, res) => {
    try {
        const contributions = await Contribution.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();
        
        // データ形式を整形
        const formattedContributions = contributions.map(contrib => ({
            _id: contrib._id,
            userName: contrib.user?.name || '不明なユーザー',
            userEmail: contrib.user?.email || '',
            type: contrib.type,
            hours: contrib.hours,
            coins: contrib.coinsAwarded,
            createdAt: contrib.createdAt
        }));
        
        res.json(formattedContributions);
    } catch (error) {
        console.error('時間貢献履歴取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '時間貢献履歴の取得に失敗しました'
        });
    }
});

// 時間貢献履歴リセット（管理者のみ）
router.post('/reset-time-contributions', authenticate, requireAdmin, async (req, res) => {
    try {
        await Contribution.deleteMany({});
        
        res.json({
            success: true,
            message: '時間貢献履歴をリセットしました'
        });
    } catch (error) {
        console.error('時間貢献履歴リセットエラー:', error);
        res.status(500).json({
            success: false,
            message: '履歴のリセットに失敗しました'
        });
    }
});

// システム統計取得（管理者のみ）
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        // 並列でデータ取得
        const [
            totalUsers,
            totalPitches,
            activePitches,
            totalTips,
            totalContributions
        ] = await Promise.all([
            User.countDocuments(),
            Pitch.countDocuments(),
            Pitch.countDocuments({ status: 'live' }),
            Tip.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
            Contribution.countDocuments()
        ]);
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalPitches,
                activePitches,
                totalTipsAmount: totalTips[0]?.total || 0,
                totalContributions
            }
        });
    } catch (error) {
        console.error('統計取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '統計の取得に失敗しました'
        });
    }
});

export default router;