import { useState, useEffect } from 'react';
import { FiCopy, FiEdit2, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { LoadingSpinner } from './LoadingSpinner';

export const ProposalEditor = ({ company, proposal, loading, error, onRegenerate, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (proposal?.proposal_text) {
      setText(proposal.proposal_text);
      setEditing(false);
    }
  }, [proposal]);

  const handleCopy = async () => {
    const content = `件名: ${proposal?.subject ?? ''}\n\n${text}`;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave?.(text);
    setEditing(false);
  };

  if (!company && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-sm">
        <p>企業を選択して「営業メール生成」ボタンを押してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {company && (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{company.name}</p>
            <p className="text-xs text-gray-400">{company.industry} · {company.prefecture}</p>
          </div>
          <button
            className="btn-ghost text-xs flex items-center gap-1 py-1"
            onClick={() => onRegenerate(company)}
            disabled={loading}
          >
            <FiRefreshCw size={13} />
            再生成
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner label="営業メールを生成中..." />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {proposal && !loading && (
        <div className="space-y-3">
          {proposal.subject && (
            <div className="bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2">
              <span className="text-xs text-gray-500">件名</span>
              <p className="text-sm text-gray-200 mt-0.5">{proposal.subject}</p>
            </div>
          )}

          <div className="relative">
            {editing ? (
              <textarea
                className="input h-72 resize-none font-mono text-xs leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="bg-navy-900/50 border border-white/10 rounded-lg p-4 h-72 overflow-y-auto">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={handleSave}>
                  <FiCheck size={14} /> 保存
                </button>
                <button className="btn-ghost flex items-center gap-1.5 text-sm" onClick={() => { setText(proposal.proposal_text); setEditing(false); }}>
                  <FiX size={14} /> キャンセル
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={handleCopy}>
                  {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
                <button className="btn-ghost flex items-center gap-1.5 text-sm" onClick={() => setEditing(true)}>
                  <FiEdit2 size={14} /> 編集
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
