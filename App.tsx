
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Book } from './types.ts';
import { fetchBooks } from './services/dataService.ts';
import { getAIRecommendations } from './services/aiService.ts';
import BookCard from './components/BookCard.tsx';
import BookDetailModal from './components/BookDetailModal.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';

const CORE_KEYWORDS = ["전체", "공감", "혁신", "고객", "문제정의", "피드백", "퍼실리테이션", "서비스디자인", "프로토타입"];

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("전체");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Load initial data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data = await fetchBooks();
      setBooks(data);
      setFilteredIds(data.map(b => b.id));
      setLoading(false);
    };
    initData();
  }, []);

  // 2. AI Recommendation Engine based on tabs and search
  useEffect(() => {
    if (loading) return;

    const updateResults = async () => {
      if (activeTab === "전체" && !searchQuery.trim()) {
        setFilteredIds(books.map(b => b.id));
        return;
      }

      setAiLoading(true);
      const combinedQuery = activeTab === "전체" 
        ? searchQuery 
        : `${activeTab} ${searchQuery}`.trim();

      const recommendedIds = await getAIRecommendations(combinedQuery, books);
      setFilteredIds(recommendedIds);
      setAiLoading(false);
    };

    const timeoutId = setTimeout(updateResults, 300);
    return () => clearTimeout(timeoutId);
  }, [activeTab, searchQuery, books, loading]);

  // 3. Final displayed books
  const displayedBooks = useMemo(() => {
    if (filteredIds.length === 0 && !aiLoading && (searchQuery || activeTab !== "전체")) return [];
    
    const idMap = new Map(filteredIds.map((id, index) => [id, index]));
    return books
      .filter(b => idMap.has(b.id))
      .sort((a, b) => (idMap.get(a.id) ?? 999) - (idMap.get(b.id) ?? 999));
  }, [books, filteredIds, aiLoading, searchQuery, activeTab]);

  const handleHomeClick = () => {
    setActiveTab("전체");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchNavClick = () => {
    searchInputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">DT</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">서재</h1>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
           <button onClick={handleSearchNavClick}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
           </button>
        </div>
      </header>

      <main className="pt-16 max-w-4xl mx-auto">
        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-white sticky top-16 z-40 px-2 shadow-sm">
          {CORE_KEYWORDS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-none px-5 py-5 text-[15px] font-bold transition-all relative ${
                activeTab === tab ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-slate-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search Input Area */}
        <div className="px-6 py-6">
          <div className="relative group">
            <input 
              ref={searchInputRef}
              type="text"
              placeholder={activeTab === "전체" ? "요즘 어떤 고민이 있으신가요?" : `'${activeTab}'에 대해 무엇이 궁금한가요?`}
              className="w-full h-14 px-12 bg-white rounded-2xl text-[15px] border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {aiLoading && (
            <div className="mt-4 flex items-center gap-3 px-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span className="text-[12px] text-indigo-600 font-bold">AI 큐레이터가 적절한 도서를 선별하고 있습니다...</span>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="px-6 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {activeTab === "전체" ? "추천 도서" : `'${activeTab}' 컬렉션`} 
            <span className="ml-2 text-slate-300">({displayedBooks.length})</span>
          </h2>
        </div>

        {/* Bookshelf Grid */}
        <div className="px-6">
          {!aiLoading && displayedBooks.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-300 font-medium mb-1 italic">"이 칸은 아직 비어있네요"</p>
              <p className="text-slate-400 text-sm">다른 키워드나 검색어를 시도해보세요.</p>
            </div>
          ) : (
            <div className="book-grid">
              {displayedBooks.map(book => (
                <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
              ))}
              {aiLoading && Array.from({length: 4}).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[1/1.45] bg-slate-200 rounded-sm mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Simplified Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md px-8 py-4 rounded-full flex items-center gap-12 z-50 shadow-2xl border border-white/10">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "전체" && !searchQuery ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={handleSearchNavClick}
          className={`flex flex-col items-center gap-1 transition-all ${searchQuery ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
        </button>
      </nav>

      <BookDetailModal 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
      />
    </div>
  );
};

export default App;
