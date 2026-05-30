import { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { fetchIndustries } from '../api/client';
import { PREFECTURES } from '../utils/formatters';
import { LoadingSpinner } from './LoadingSpinner';

const DEFAULT_FORM = {
  industry: '',
  sales_min: 0,
  sales_max: null,
  employee_min: 0,
  employee_max: null,
  prefecture: '全国',
};

const formatYen = (v) => {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(0)}億`;
  if (v >= 10_000) return `${Math.floor(v / 10_000)}万`;
  return `${v}`;
};

export const SearchForm = ({ onSearch, loading }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchIndustries()
      .then(setIndustries)
      .catch(() => setIndustries(['製造業', '卸売業', '小売業', '情報処理・提供サービス業', '建設業', '運輸業', '通信業', 'その他']));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.industry) e.industry = '業種を選択してください';
    if (form.sales_max !== null && form.sales_min > form.sales_max) e.sales = '売上下限が上限を超えています';
    if (form.employee_max !== null && form.employee_min > form.employee_max) e.employees = '従業員下限が上限を超えています';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSearch({ ...form, page: 1 });
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 業種 */}
      <div>
        <label className="label">業種 *</label>
        <select
          className="input"
          value={form.industry}
          onChange={(e) => set('industry', e.target.value)}
        >
          <option value="">-- 業種を選択 --</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
      </div>

      {/* 都道府県 */}
      <div>
        <label className="label">所在地</label>
        <select
          className="input"
          value={form.prefecture}
          onChange={(e) => set('prefecture', e.target.value)}
        >
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* 売上範囲 */}
      <div>
        <label className="label">売上規模</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input"
            placeholder="下限（円）"
            value={form.sales_min}
            min={0}
            onChange={(e) => set('sales_min', Number(e.target.value))}
          />
          <span className="text-gray-400 shrink-0">〜</span>
          <input
            type="number"
            className="input"
            placeholder="上限（円）空欄=上限なし"
            value={form.sales_max ?? ''}
            min={0}
            onChange={(e) => set('sales_max', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatYen(form.sales_min)}円 〜 {form.sales_max !== null ? `${formatYen(form.sales_max)}円` : '上限なし'}
        </p>
        {errors.sales && <p className="text-red-400 text-xs mt-1">{errors.sales}</p>}
      </div>

      {/* 従業員数 */}
      <div>
        <label className="label">従業員数</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input"
            placeholder="下限（名）"
            value={form.employee_min}
            min={0}
            onChange={(e) => set('employee_min', Number(e.target.value))}
          />
          <span className="text-gray-400 shrink-0">〜</span>
          <input
            type="number"
            className="input"
            placeholder="上限（名）空欄=上限なし"
            value={form.employee_max ?? ''}
            min={0}
            onChange={(e) => set('employee_max', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {form.employee_min}名 〜 {form.employee_max !== null ? `${form.employee_max}名` : '上限なし'}
        </p>
        {errors.employees && <p className="text-red-400 text-xs mt-1">{errors.employees}</p>}
      </div>

      {/* ボタン */}
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : <FiSearch />}
          検索
        </button>
        <button type="button" className="btn-ghost flex items-center gap-1" onClick={handleReset}>
          <FiRefreshCw size={14} />
          リセット
        </button>
      </div>
    </form>
  );
};
