import { useState, useCallback } from 'react';
import { searchCompanies } from '../api/client';

export const useSearch = (onSuccess) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchCompanies(params);
      setResults(data);
      onSuccess?.(params, data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '検索に失敗しました';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { results, loading, error, search };
};
