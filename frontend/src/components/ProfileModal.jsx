import { useState } from 'react';
import { FiX, FiUser, FiSave } from 'react-icons/fi';

export const ProfileModal = ({ profile, onSave, onClose }) => {
  const [form, setForm] = useState({ ...profile });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-navy-800 rounded-xl border border-white/10 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiUser size={14} className="text-accent-400" />
            事業者情報の登録
          </h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-gray-500">登録した情報はメール生成時に自動で反映されます。</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">担当者名</label>
              <input className="input" placeholder="山田 太郎" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">役職</label>
              <input className="input" placeholder="営業部長" value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">会社名</label>
            <input className="input" placeholder="株式会社〇〇" value={form.company} onChange={(e) => set('company', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">メールアドレス</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">電話番号</label>
              <input className="input" placeholder="03-0000-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">提供サービス・強み <span className="text-gray-600">（メール内容に反映）</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="例: AIを活用した業務自動化ツールの提供。導入実績50社以上。"
              value={form.service}
              onChange={(e) => set('service', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiSave size={14} />
              保存
            </button>
            <button type="button" className="btn-ghost px-4" onClick={onClose}>キャンセル</button>
          </div>
        </form>
      </div>
    </div>
  );
};
