import { useState, useEffect, useCallback } from 'react';

const SEARCH_KEY = 'enterprise_search_history';
const PROPOSAL_KEY = 'generated_proposals';
const MAX_ITEMS = 30;

const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const save = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const useHistory = () => {
  const [searchHistory, setSearchHistory] = useState(() => load(SEARCH_KEY));
  const [proposalHistory, setProposalHistory] = useState(() => load(PROPOSAL_KEY));

  const addSearch = useCallback((query, resultsCount, resultsSample) => {
    setSearchHistory((prev) => {
      const next = [
        { id: `s_${Date.now()}`, timestamp: Date.now(), query, results_count: resultsCount, results_sample: resultsSample },
        ...prev,
      ].slice(0, MAX_ITEMS);
      save(SEARCH_KEY, next);
      return next;
    });
  }, []);

  const addProposal = useCallback((companyName, proposalText, subject) => {
    setProposalHistory((prev) => {
      const next = [
        {
          id: `p_${Date.now()}`,
          company_name: companyName,
          proposal_text: proposalText,
          subject,
          generated_at: Date.now(),
          edited: false,
          edited_text: null,
        },
        ...prev,
      ].slice(0, MAX_ITEMS);
      save(PROPOSAL_KEY, next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((id) => {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      save(SEARCH_KEY, next);
      return next;
    });
  }, []);

  const removeProposal = useCallback((id) => {
    setProposalHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      save(PROPOSAL_KEY, next);
      return next;
    });
  }, []);

  const updateProposal = useCallback((id, editedText) => {
    setProposalHistory((prev) => {
      const next = prev.map((h) =>
        h.id === id ? { ...h, edited: true, edited_text: editedText } : h
      );
      save(PROPOSAL_KEY, next);
      return next;
    });
  }, []);

  return {
    searchHistory,
    proposalHistory,
    addSearch,
    addProposal,
    removeSearch,
    removeProposal,
    updateProposal,
  };
};
