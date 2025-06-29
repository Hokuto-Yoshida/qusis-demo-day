// src/pages/PitchManagementPage.jsx
import React, { useState } from 'react';
import { usePitches } from '../context/PitchContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Clock,
  Upload,
  X
} from 'lucide-react';

const PitchManagementPage = () => {
  const { user } = useAuth();
  const {
    pitches,
    createPitch,
    updatePitch,
    deletePitch,
    getPitchesByUser
  } = usePitches();

  // 発表者本人のピッチだけ絞り込み
  const userPitches = getPitchesByUser(user.id);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [selectedPitch, setSelectedPitch]     = useState(null);

  // モーダルコンポーネント
  const PitchModal = ({ isEdit = false, pitch = {}, onClose }) => {
    const [formData, setFormData] = useState({
      title:      pitch.title || '',
      description:pitch.description || '',
      coverImage: pitch.coverImage || '',
      schedule:   pitch.schedule || ''
    });
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = async e => {
      e.preventDefault();
      try {
        if (isEdit) {
          await updatePitch(pitch._id, formData);
        } else {
          await createPitch({
            ...formData,
            team:           user.team,
            presenterId:    user.id,
            presenterName:  user.name
          });
        }
        onClose();
      } catch {
        alert('保存に失敗しました。');
      }
    };

    const handleDrag = e => {
      e.preventDefault(); e.stopPropagation();
      setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = e => {
      e.preventDefault(); e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
    };

    const handleFiles = files => {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          setFormData(fd => ({ ...fd, coverImage: ev.target.result }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isEdit ? 'ピッチ編集' : '新規ピッチ作成'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>ピッチタイトル</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData(fd => ({ ...fd, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="ピッチのタイトルを入力"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Edit className="w-4 h-4" />
                  <span>詳細説明</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(fd => ({ ...fd, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="ピッチの詳細説明を入力"
                  required
                />
              </div>

              {/* カバー画像 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カバー画像（任意）
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.coverImage ? (
                    <div className="space-y-4">
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData(fd => ({ ...fd, coverImage: '' }))
                        }
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        画像を削除
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">
                        クリックまたはドラッグ&ドロップで画像を選択
                      </p>
                      <p className="text-gray-400 text-sm">
                        JPG, PNG, GIF, WebP, HEIC (最大5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFiles(e.target.files)}
                        className="hidden"
                        id="coverImage"
                      />
                      <label
                        htmlFor="coverImage"
                        className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer"
                      >
                        ファイルを選択
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEdit ? '更新する' : '作成する'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // 編集モーダルを開く
  const handleEdit = pitch => {
    setSelectedPitch(pitch);
    setShowEditModal(true);
  };

  // 削除
  const handleDelete = async pitch => {
    if (window.confirm(`「${pitch.title}」を削除しますか？`)) {
      await deletePitch(pitch._id);
    }
  };

  // ステータス表示用
  const getStatusColor = status =>
    status === 'live'
      ? 'bg-red-100 text-red-800'
      : status === 'ended'
      ? 'bg-gray-100 text-gray-800'
      : 'bg-blue-100 text-blue-800';

  const getStatusLabel = status =>
    status === 'live'
      ? 'デモ中'
      : status === 'ended'
      ? '終了'
      : '未開始';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QUSISデモデイ</h1>
          <p className="text-gray-600">ピッチ応援アプリ</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>新規ピッチ作成</span>
        </button>
      </div>

      {/* 発表者のピッチ一覧 */}
      <div className="space-y-6">
        {userPitches.length > 0 ? (
          userPitches.map(pitch => (
            <div
              key={pitch._id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        pitch.status
                      )}`}
                    >
                      {getStatusLabel(pitch.status)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {user.team}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(pitch)}
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pitch)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {pitch.title}
                </h2>
                <p className="text-gray-600 mb-4">{pitch.description}</p>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Users className="w-4 h-4" /> <span>参加者</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {pitch.participants}
                    </div>
                    <div className="text-gray-500 text-sm">人</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                      <TrendingUp className="w-4 h-4" /> <span>ギフト総額</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {pitch.totalTips}
                    </div>
                    <div className="text-gray-500 text-sm">QUcoin</div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handleEdit(pitch)}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>編集</span>
                  </button>
                  <button
                    onClick={() => handleDelete(pitch)}
                    className="px-6 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>削除</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ピッチがありません
            </h3>
            <p className="text-gray-500 mb-6">
              新しいピッチを作成して応援を集めましょう
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg"
            >
              最初のピッチを作成
            </button>
          </div>
        )}
      </div>

      {/* モーダル */}
      {showCreateModal && <PitchModal onClose={() => setShowCreateModal(false)} />}
      {showEditModal && selectedPitch && (
        <PitchModal
          isEdit
          pitch={selectedPitch}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPitch(null);
          }}
        />
      )}
    </div>
  );
};

export default PitchManagementPage;
