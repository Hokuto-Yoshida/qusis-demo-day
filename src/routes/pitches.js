// src/routes/pitches.js - coverImage修正版
import { Router } from 'express';
import Pitch from '../models/Pitch.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// 全ピッチ取得（認証不要）- coverImage追加版
router.get('/', async (req, res) => {
  try {
    const pitches = await Pitch.find()
      .select('title description team status totalTips participants schedule coverImage createdAt') // ✅ coverImage追加
      .sort({ status: 1, createdAt: -1 }) // インデックスを活用（ステータス優先 + 新着順）
      .limit(100) // 件数制限で高速化
      .lean(); // Mongooseオブジェクト変換をスキップ
    
    console.log(`📊 ピッチ取得完了: ${pitches.length}件`);
    
    // 画像データの確認ログ（デバッグ用）
    pitches.forEach(pitch => {
      if (pitch.coverImage) {
        console.log(`🖼️ ${pitch.title}: 画像データあり (${pitch.coverImage.length}文字)`);
      } else {
        console.log(`📝 ${pitch.title}: 画像データなし`);
      }
    });
    
    res.json(pitches);
  } catch (err) {
    console.error('ピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// 単一ピッチ取得（認証不要）- coverImage追加版
router.get('/:id', async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .lean(); // 全フィールド取得（coverImage含む）
    
    if (!pitch) {
      return res.status(404).json({ error: 'Pitch not found' });
    }
    
    console.log(`🔍 ピッチ詳細取得: ${pitch.title}, 画像: ${pitch.coverImage ? 'あり' : 'なし'}`);
    
    res.json(pitch);
  } catch (err) {
    console.error('ピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ユーザーのピッチ取得（認証必要）- coverImage追加版
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 自分のピッチまたは管理者のみアクセス可能
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }
    
    const pitches = await Pitch.find({ createdBy: userId })
      .select('title description team status totalTips participants schedule coverImage createdAt') // ✅ coverImage追加
      .sort({ createdAt: -1 }) // インデックス活用
      .lean();
    
    res.json(pitches);
  } catch (err) {
    console.error('ユーザーピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// チーム別ピッチ取得（認証必要）- coverImage追加版
router.get('/team/:teamName', authenticate, async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const pitches = await Pitch.find({ team: teamName })
      .select('title description team status totalTips participants schedule coverImage createdAt') // ✅ coverImage追加
      .sort({ status: 1, createdAt: -1 }) // インデックス活用
      .lean();
    
    res.json(pitches);
  } catch (err) {
    console.error('チームピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ライブピッチ取得（認証不要）- coverImage追加版
router.get('/status/live', async (req, res) => {
  try {
    const livePitches = await Pitch.find({ status: 'live' })
      .select('title description team totalTips participants coverImage createdAt') // ✅ coverImage追加
      .sort({ totalTips: -1, createdAt: -1 }) // 人気順 + 新着順
      .lean();
    
    res.json(livePitches);
  } catch (err) {
    console.error('ライブピッチ取得エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ピッチ作成（認証必要）- coverImage保存確認版
router.post('/', authenticate, async (req, res) => {
  try {
    const pitchData = {
      ...req.body,
      createdBy: req.user._id, // 作成者を設定
      team: req.user.team || req.body.team // ユーザーのチーム情報を使用
    };
    
    console.log('📝 ピッチ作成開始:', {
      title: pitchData.title,
      team: pitchData.team,
      hasImage: !!pitchData.coverImage,
      imageLength: pitchData.coverImage ? pitchData.coverImage.length : 0
    });
    
    const pitch = await Pitch.create(pitchData);
    
    // 作成後は全データを返す（coverImage含む）
    const createdPitch = await Pitch.findById(pitch._id).lean();
    
    console.log('✅ ピッチ作成完了:', {
      id: createdPitch._id,
      title: createdPitch.title,
      hasImage: !!createdPitch.coverImage
    });
    
    res.status(201).json(createdPitch);
  } catch (err) {
    console.error('❌ ピッチ作成エラー:', err);
    res.status(400).json({ error: err.message });
  }
});

// ピッチ更新（認証必要）- coverImage保存確認版
router.put('/:id', authenticate, async (req, res) => {
  try {
    // findByIdとupdateを分離せず、findByIdAndUpdateを使用（高速化）
    const pitch = await Pitch.findById(req.params.id)
      .select('createdBy presenterId team') // 必要なフィールドのみ
      .lean();
    
    if (!pitch) {
      return res.status(404).json({ error: 'Pitch not found' });
    }
    
    // 権限チェック
    const isCreator = pitch.createdBy?.toString() === req.user._id.toString();
    const isPresenter = pitch.presenterId?.toString() === req.user._id.toString();
    const isSameTeam = pitch.team && req.user.team && pitch.team === req.user.team;
    const isAdmin = req.user.role === 'admin';
    const isPresenterRole = req.user.role === 'presenter';
    
    // 同じチームの発表者なら編集可能
    if (!isCreator && !isPresenter && !isAdmin && !(isSameTeam && isPresenterRole)) {
      return res.status(403).json({ 
        error: '編集権限がありません'
      });
    }
    
    // 更新時に不足フィールドを補完
    const updateData = { ...req.body };
    if (!pitch.createdBy) {
      updateData.createdBy = req.user._id;
    }
    if (!pitch.presenterId) {
      updateData.presenterId = req.user._id;
    }
    
    console.log('📝 ピッチ更新開始:', {
      id: req.params.id,
      title: updateData.title,
      hasImage: !!updateData.coverImage,
      imageLength: updateData.coverImage ? updateData.coverImage.length : 0
    });
    
    const updatedPitch = await Pitch.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { 
        new: true
        // selectを削除して全フィールドを返す（coverImage含む）
      }
    ).lean();
    
    console.log('✅ ピッチ更新完了:', {
      id: updatedPitch._id,
      title: updatedPitch.title,
      hasImage: !!updatedPitch.coverImage
    });
    
    res.json(updatedPitch);
  } catch (err) {
    console.error('❌ ピッチ更新エラー:', err);
    res.status(400).json({ error: err.message });
  }
});

// ピッチ削除（認証必要）- 高速化版
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .select('createdBy presenterId team') // 必要なフィールドのみ
      .lean();
    
    if (!pitch) {
      return res.status(404).json({ error: 'Pitch not found' });
    }
    
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
    console.log('🗑️ ピッチ削除完了:', req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('ピッチ削除エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ピッチステータス更新（管理者用）- 新規追加
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    // 管理者または作成者のみ
    const pitch = await Pitch.findById(req.params.id)
      .select('createdBy team')
      .lean();
    
    if (!pitch) {
      return res.status(404).json({ error: 'Pitch not found' });
    }
    
    const isCreator = pitch.createdBy?.toString() === req.user._id.toString();
    const isSameTeam = pitch.team && req.user.team && pitch.team === req.user.team;
    const isAdmin = req.user.role === 'admin';
    const isPresenterRole = req.user.role === 'presenter';
    
    if (!isAdmin && !isCreator && !(isSameTeam && isPresenterRole)) {
      return res.status(403).json({ error: 'ステータス変更権限がありません' });
    }
    
    const { status } = req.body;
    if (!['upcoming', 'live', 'ended'].includes(status)) {
      return res.status(400).json({ error: '無効なステータスです' });
    }
    
    const updatedPitch = await Pitch.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: 'title status' }
    ).lean();
    
    console.log('🔄 ステータス更新完了:', {
      id: req.params.id,
      status: status
    });
    
    res.json(updatedPitch);
  } catch (err) {
    console.error('ステータス更新エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

// ピッチ検索（認証不要）- coverImage追加版
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const pitches = await Pitch.find({
      $text: { $search: query } // テキストインデックスを活用
    })
    .select('title description team status totalTips participants coverImage') // ✅ coverImage追加
    .sort({ score: { $meta: 'textScore' }, totalTips: -1 }) // 関連度 + 人気順
    .limit(20)
    .lean();
    
    res.json(pitches);
  } catch (err) {
    console.error('ピッチ検索エラー:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;