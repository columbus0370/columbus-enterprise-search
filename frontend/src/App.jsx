import { useState, useCallback } from 'react';
import { FiSearch, FiList, FiClock, FiSun, FiMoon, FiUser, FiX } from 'react-icons/fi';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { ProposalEditor } from './components/ProposalEditor';
import { HistoryPanel } from './components/HistoryPanel';
import { ProfileModal } from './components/ProfileModal';
import { useSearch } from './hooks/useSearch';
import { useProposalGenerate } from './hooks/useProposalGenerate';
import { useHistory } from './hooks/useHistory';
import { useProfile } from './hooks/useProfile';

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
  const [showMailPanel, setShowMailPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { profile, saveProfile, hasProfile } = useProfile();

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
    setShowMailPanel(true);
    generate({
      company_name: company.name,
      industry: company.industry,
      sales: company.sales,
      employees: company.employees,
      prefecture: company.prefecture,
      sender: profile,
    });
  };

  const handleViewProposal = (h) => {
    setSelectedCompany({ name: h.company_name });
    setProposal({
      proposal_text: h.edited ? h.edited_text : h.proposal_text,
      subject: h.subject,
    });
    setShowMailPanel(true);
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
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs"
                onClick={() => setShowProfileModal(true)}
                title="事業者情報"
              >
                <FiUser size={15} className={hasProfile ? 'text-accent-400' : ''} />
                <span className="hidden sm:inline">{hasProfile ? profile.name || '事業者情報' : '事業者情報を登録'}</span>
              </button>
              <button
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                onClick={() => setDark((d) => !d)}
              >
                {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
              </button>
            </div>
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

          {/* 常に2カラム: 検索フォーム | 結果 */}
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
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

              <div className="card p-5 mt-4 hidden md:block">
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

            {/* Main — Results（常に全幅） */}
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

        {/* メールドロワー（右側スライドイン） */}
        {showMailPanel && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => setShowMailPanel(false)}
            />
            <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-navy-800 border-l border-white/10 shadow-2xl z-40 flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-accent-400">✉</span>
                  営業メール生成
                  {selectedCompany && (
                    <span className="text-gray-400 font-normal truncate max-w-[160px]">— {selectedCompany.name}</span>
                  )}
                </h2>
                <button
                  onClick={() => setShowMailPanel(false)}
                  className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
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
          </>
        )}

        {/* Company detail modal */}
        <CompanyDetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onGenerateProposal={(c) => { handleGenerateProposal(c); setDetailCompany(null); }}
        />

        {/* Profile modal */}
        {showProfileModal && (
          <ProfileModal
            profile={profile}
            onSave={saveProfile}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    </div>
  );
}
