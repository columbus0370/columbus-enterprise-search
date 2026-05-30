import { useState, useCallback } from 'react';
import { generateProposal } from '../api/client';

export const useProposalGenerate = (onSuccess) => {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (companyInfo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProposal(companyInfo);
      setProposal(data);
      onSuccess?.(companyInfo, data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'メール生成に失敗しました';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { proposal, setProposal, loading, error, generate };
};
