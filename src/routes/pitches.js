// src/routes/pitches.js - 修正版
import { Router } from 'express';
import Pitch from '../models/Pitch.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// 全ピッチ取得（認証不要）
router.get('/', async (req, res) => {
  try {
    const pitches = await Pitch.find().lean();
    res.json(pitches);
  } catch (err) {
    console.error('ピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// 単一ピッチ取得（認証不要）
router.get('/:id', async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id).lean();
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    res.json(pitch);
  } catch (err) {
    console.error('ピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ピッチ作成（認証必要）
router.post('/', authenticate, async (req, res) => {
  try {
    const pitchData = {
      ...req.body,
      createdBy: req.user._id, // 作成者を設定
      team: req.user.team || req.body.team // ユーザーのチーム情報を使用
    };
    
    console.log('ピッチ作成:', pitchData);
    
    const pitch = await Pitch.create(pitchData);
    res.status(201).json(pitch);
  } catch (err) {
    console.error('ピッチ作成エラー:', err);
    res.status(400).json({ error: err.message });
  }
});

// ピッチ更新（認証必要）- 権限チェック改善版
router.put('/:id', authenticate, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    
    // デバッグ情報をログ出力
    console.log('=== ピッチ編集権限チェック ===');
    console.log('ユーザーID:', req.user._id.toString());
    console.log('ユーザー役割:', req.user.role);
    console.log('ユーザーチーム:', req.user.team);
    console.log('ピッチ createdBy:', pitch.createdBy?.toString());
    console.log('ピッチ presenterId:', pitch.presenterId?.toString());
    console.log('ピッチ team:', pitch.team);
    
    // 権限チェック
    const isCreator = pitch.createdBy?.toString() === req.user._id.toString();
    const isPresenter = pitch.presenterId?.toString() === req.user._id.toString();
    const isSameTeam = pitch.team && req.user.team && pitch.team === req.user.team;
    const isAdmin = req.user.role === 'admin';
    const isPresenterRole = req.user.role === 'presenter';
    
    console.log('権限チェック結果:');
    console.log('- 作成者:', isCreator);
    console.log('- 発表者:', isPresenter);
    console.log('- 同じチーム:', isSameTeam);
    console.log('- 管理者:', isAdmin);
    console.log('- 発表者役割:', isPresenterRole);
    
    // 権限判定を緩和: 同じチームの発表者なら編集可能
    if (!isCreator && !isPresenter && !isAdmin && !(isSameTeam && isPresenterRole)) {
      console.log('❌ 編集権限なし');
      return res.status(403).json({ 
        error: '編集権限がありません',
        details: {
          userRole: req.user.role,
          userTeam: req.user.team,
          pitchTeam: pitch.team,
          hasCreatedBy: !!pitch.createdBy,
          hasPresenterId: !!pitch.presenterId
        }
      });
    }
    
    console.log('✅ 編集権限あり');
    
    // 更新時に createdBy を設定（存在しない場合）
    const updateData = { ...req.body };
    if (!pitch.createdBy) {
      updateData.createdBy = req.user._id;
    }
    if (!pitch.presenterId) {
      updateData.presenterId = req.user._id;
    }
    
    const updatedPitch = await Pitch.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedPitch);
  } catch (err) {
    console.error('ピッチ更新エラー:', err);
    res.status(400).json({ error: err.message });
  }
});

// ピッチ削除も同様に修正
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    
    // 権限チェック
    const isCreator = pitch.createdBy?.toString() === req.user._id.toString();
    const isPresenter = pitch.presenterId?.toString() === req.user._id.toString();
    const isSameTeam = pitch.team && req.user.team && pitch.team === req.user.team;
    const isAdmin = req.user.role === 'admin';
    const isPresenterRole = req.user.role === 'presenter';
    
    // 同じチームの発表者なら削除可能
    if (!isCreator && !isPresenter && !isAdmin && !(isSameTeam && isPresenterRole)) {
      return res.status(403).json({ error: '削除権限がありません' });
    }
    
    await Pitch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('ピッチ削除エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;