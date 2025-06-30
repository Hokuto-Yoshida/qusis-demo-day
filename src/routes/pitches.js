// src/routes/pitches.js
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

// ピッチ更新（認証必要）
router.put('/:id', authenticate, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    
    // 作成者または管理者のみ編集可能
    if (pitch.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '編集権限がありません' });
    }
    
    const updatedPitch = await Pitch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPitch);
  } catch (err) {
    console.error('ピッチ更新エラー:', err);
    res.status(400).json({ error: err.message });
  }
});

// ピッチ削除（認証必要）
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    
    // 作成者または管理者のみ削除可能
    if (pitch.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
