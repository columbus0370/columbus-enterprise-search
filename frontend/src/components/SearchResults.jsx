import { useState } from 'react';
import { FiMail, FiInfo, FiChevronUp, FiChevronDown, FiDownload } from 'react-icons/fi';
import { formatSales, formatEmployees } from '../utils/formatters';

const PAGE_SIZE = 50;

export const SearchResults = ({ results, onSelectCompany, onGenerateProposal, onPageChange, currentPage = 1 }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  if (!results) return null;
  const { data = [], total_count = 0 } = results;
  const hasNextPage = total_count >= PAGE_SIZE;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const v = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
    return sortAsc ? v : -v;
  });

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return null;
    return sortAsc ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />;
  };

  const downloadCSV = () => {
    const header = ['企業名', '業種', '売上', '従業員数', '所在地'];
    const rows = data.map((c) => [
      c.name, c.industry, c.sales ?? '', c.employees ?? '', c.prefecture,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `企業検索結果_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="text-white font-semibold">{total_count}</span> 件表示
          {hasNextPage && <span className="text-gray-500 ml-1">/ 次ページあり</span>}
        </p>
        <button onClick={downloadCSV} className="btn-ghost text-xs flex items-center gap-1 py-1 px-2">
          <FiDownload size={13} /> CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="bg-navy-800 text-gray-400 text-xs">
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">企業名</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">業種</th>
              <th
                className="px-4 py-3 text-right font-medium cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('sales')}
              >
                売上 <SortIcon k="sales" />
              </th>
              <th
                className="px-4 py-3 text-right font-medium cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('employees')}
              >
                従業員 <SortIcon k="employees" />
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">所在地</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  該当企業が見つかりませんでした
                </td>
              </tr>
            ) : (
              sorted.map((company) => (
                <tr
                  key={company.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">{company.name}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{company.industry || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{formatSales(company.sales)}</td>
                  <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">{formatEmployees(company.employees)}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{company.prefecture || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="詳細"
                        onClick={() => onSelectCompany(company)}
                      >
                        <FiInfo size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-accent-500/20 text-gray-400 hover:text-accent-400 transition-colors"
                        title="営業メール生成"
                        onClick={() => onGenerateProposal(company)}
                      >
                        <FiMail size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn-ghost py-1 px-3 text-sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            ← 前
          </button>
          <span className="text-sm text-gray-400">{currentPage} ページ</span>
          <button
            className="btn-ghost py-1 px-3 text-sm"
            disabled={!hasNextPage}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            次 →
          </button>
        </div>
      )}
    </div>
  );
};
