import { useState, useCallback } from 'react';
import { FiSearch, FiList, FiClock, FiSun, FiMoon } from 'react-icons/fi';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { ProposalEditor } from './components/ProposalEditor';
import { HistoryPanel } from './components/HistoryPanel';
import { useSearch } from './hooks/useSearch';
import { useProposalGenerate } from './hooks/useProposalGenerate';
import { useHistory } from './hooks/useHistory';

const TABS = [
  { id: 'search', label: '検索', icon: FiSearch },
  { id: 'results', label: '結果', icon: FiList },
  { id: 'history', label: '履歴', icon: FiClock },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailCompany, setDetailCompany] = useState(null);
  const [dark, setDark] = useState(true);

  const {
    searchHistory, proposalHistory,
    addSearch, addProposal,
    removeSearch, removeProposal,
    updateProposal,
  } = useHistory();

  const [lastParams, setLastParams] = useState(null);

  const onSearchSuccess = useCallback((params, data) => {
    addSearch(params, data.total_count, data.data?.slice(0, 5));
    setActiveTab('results');
  }, [addSearch]);

  const { results, loading: searchLoading, error: searchError, search } = useSearch(onSearchSuccess);

  const handleSearch = useCallback((params) => {
    const p = { ...params, page: 1 };
    setLastParams(p);
    search(p);
  }, [search]);

  const handlePageChange = useCallback((newPage) => {
    if (!lastParams) return;
    const p = { ...lastParams, page: newPage };
    setLastParams(p);
    search(p);
  }, [lastParams, search]);

  const onProposalSuccess = useCallback((company, data) => {
    addProposal(company.company_name, data.proposal_text, data.subject);
  }, [addProposal]);

  const {
    proposal, setProposal, loading: proposalLoading, error: proposalError, generate,
  } = useProposalGenerate(onProposalSuccess);

  const handleGenerateProposal = (company) => {
    setSelectedCompany(company);
    generate({
      company_name: company.name,
      industry: company.industry,
      sales: company.sales,
      employees: company.employees,
      prefecture: company.prefecture,
    });
  };

  const handleViewProposal = (h) => {
    setSelectedCompany({ name: h.company_name });
    setProposal({
      proposal_text: h.edited ? h.edited_text : h.proposal_text,
      subject: h.subject,
    });
    setActiveTab('results');
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {/* Header */}
        <header className="border-b border-white/10 bg-navy-900/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-accent-500 rounded-lg p-1.5">
                <FiSearch size={16} className="text-white" />
              </div>
              <span className="font-semibold text-white text-sm">AI営業アシスタント</span>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Mobile tabs */}
          <div className="flex gap-1 bg-navy-900/50 rounded-lg p-1 mb-6 md:hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-md transition-colors ${
                  activeTab === id ? 'bg-navy-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-6">
            {/* Left — Search */}
            <aside className={activeTab !== 'search' ? 'hidden md:block' : ''}>
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FiSearch size={14} className="text-accent-400" />
                  企業検索
                </h2>
                <SearchForm onSearch={handleSearch} loading={searchLoading} />
                {searchError && (
                  <p className="text-red-400 text-xs mt-3">{searchError}</p>
                )}
              </div>

              {/* History sidebar (desktop only) */}
              <div className="card p-5 mt-4 hidden lg:block">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FiClock size={14} className="text-accent-400" />
                  履歴
                </h2>
                <HistoryPanel
                  searchHistory={searchHistory}
                  proposalHistory={proposalHistory}
                  onRerunSearch={(q) => { search(q); setActiveTab('results'); }}
                  onViewProposal={handleViewProposal}
                  onRemoveSearch={removeSearch}
                  onRemoveProposal={removeProposal}
                />
              </div>
            </aside>

            {/* Main — Results */}
            <main className={`${activeTab !== 'results' ? 'hidden md:block' : ''} min-w-0`}>
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FiList size={14} className="text-accent-400" />
                  検索結果
                </h2>
                <SearchResults
                  results={results}
                  onSelectCompany={setDetailCompany}
                  onGenerateProposal={handleGenerateProposal}
                  onPageChange={handlePageChange}
                  currentPage={lastParams?.page ?? 1}
                />
                {!results && !searchLoading && (
                  <p className="text-center text-sm text-gray-500 py-16">
                    左の検索フォームで企業を検索してください
                  </p>
                )}
              </div>
            </main>

            {/* Right — Proposal Editor */}
            <aside className={activeTab !== 'results' ? 'hidden lg:block' : ''}>
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-accent-400 text-base">✉</span>
                  営業メール生成
                </h2>
                <ProposalEditor
                  company={selectedCompany}
                  proposal={proposal}
                  loading={proposalLoading}
                  error={proposalError}
                  onRegenerate={handleGenerateProposal}
                  onSave={(text) => {
                    if (proposalHistory[0]) updateProposal(proposalHistory[0].id, text);
                  }}
                />
              </div>
            </aside>

            {/* History tab — mobile */}
            {activeTab === 'history' && (
              <div className="md:hidden col-span-full">
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <FiClock size={14} className="text-accent-400" />
                    履歴
                  </h2>
                  <HistoryPanel
                    searchHistory={searchHistory}
                    proposalHistory={proposalHistory}
                    onRerunSearch={(q) => { search(q); setActiveTab('results'); }}
                    onViewProposal={handleViewProposal}
                    onRemoveSearch={removeSearch}
                    onRemoveProposal={removeProposal}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company detail modal */}
        <CompanyDetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onGenerateProposal={(c) => { handleGenerateProposal(c); setDetailCompany(null); }}
        />
      </div>
    </div>
  );
}
