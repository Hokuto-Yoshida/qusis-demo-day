// src/routes/pitches.js
import { Router } from 'express';
import Pitch from '../models/Pitch.js';

const router = Router();

// 全ピッチ取得
// GET /api/pitches
router.get('/', async (req, res) => {
  try {
    const pitches = await Pitch.find().lean();
    res.json(pitches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 単一ピッチ取得
// GET /api/pitches/:id
router.get('/:id', async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id).lean();
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    res.json(pitch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ピッチ作成
// POST /api/pitches
router.post('/', async (req, res) => {
  try {
    const pitch = await Pitch.create(req.body);
    res.status(201).json(pitch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ピッチ更新
// PUT /api/pitches/:id
router.put('/:id', async (req, res) => {
  try {
    const pitch = await Pitch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    res.json(pitch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ピッチ削除
// DELETE /api/pitches/:id
router.delete('/:id', async (req, res) => {
  try {
    const pitch = await Pitch.findByIdAndDelete(req.params.id);
    if (!pitch) return res.status(404).json({ error: 'Pitch not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
