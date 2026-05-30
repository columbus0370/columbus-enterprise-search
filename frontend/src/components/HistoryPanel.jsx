import { useState } from 'react';
import { FiTrash2, FiSearch, FiMail, FiClock } from 'react-icons/fi';
import { formatTimestamp } from '../utils/formatters';

export const HistoryPanel = ({
  searchHistory,
  proposalHistory,
  onRerunSearch,
  onViewProposal,
  onRemoveSearch,
  onRemoveProposal,
}) => {
  const [tab, setTab] = useState('search');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-navy-900/50 rounded-lg p-1">
        {[
          { id: 'search', label: '検索履歴', icon: FiSearch },
          { id: 'proposal', label: 'メール履歴', icon: FiMail },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors ${
              tab === id ? 'bg-navy-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div className="space-y-2">
          {searchHistory.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">検索履歴はありません</p>
          ) : (
            searchHistory.map((h) => (
              <div key={h.id} className="card p-3 flex items-start justify-between gap-3">
                <button
                  className="flex-1 text-left space-y-1"
                  onClick={() => onRerunSearch(h.query)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{h.query.industry}</span>
                    <span className="text-xs text-gray-500">{h.query.prefecture}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    従業員 {h.query.employee_min}〜{h.query.employee_max}名 ·{' '}
                    <span className="text-accent-400">{h.results_count?.toLocaleString()}件</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FiClock size={11} />
                    {formatTimestamp(h.timestamp)}
                  </div>
                </button>
                <button
                  className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  onClick={() => onRemoveSearch(h.id)}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'proposal' && (
        <div className="space-y-2">
          {proposalHistory.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">生成済みメールはありません</p>
          ) : (
            proposalHistory.map((h) => (
              <div key={h.id} className="card p-3 flex items-start justify-between gap-3">
                <button
                  className="flex-1 text-left space-y-1"
                  onClick={() => onViewProposal(h)}
                >
                  <p className="text-sm font-medium text-white">{h.company_name}</p>
                  <p className="text-xs text-gray-400 truncate">{h.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiClock size={11} />
                    {formatTimestamp(h.generated_at)}
                    {h.edited && <span className="text-accent-400">編集済み</span>}
                  </div>
                </button>
                <button
                  className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  onClick={() => onRemoveProposal(h.id)}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
