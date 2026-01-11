
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

  useEffect(() => {
    if (loading) return;

    const updateResults = async () => {
      // 로딩 연출 시작
      setAiLoading(true);
      const startTime = Date.now();

      const isDefaultState = activeTab === "전체" && !searchQuery.trim();
      
      let recommendedIds: string[] = [];
      if (isDefaultState) {
        recommendedIds = books.map(b => b.id);
      } else {
        const combinedQuery = activeTab === "전체" 
          ? searchQuery 
          : `${activeTab} ${searchQuery}`.trim();
        recommendedIds = await getAIRecommendations(combinedQuery, books);
      }

      // UX를 위해 최소 600ms는 '큐레이팅 중' 상태 유지
      const elapsedTime = Date.now() - startTime;
      const minWait = 600;
      const remainingWait = Math.max(0, minWait - elapsedTime);

      setTimeout(() => {
        setFilteredIds(recommendedIds);
        setAiLoading(false);
      }, remainingWait);
    };

    const debounceId = setTimeout(updateResults, 400);
    return () => clearTimeout(debounceId);
  }, [activeTab, searchQuery, books, loading]);

  const displayedBooks = useMemo(() => {
    // 로딩 중일 때는 이전 결과를 유지하여 화면 깜빡임 방지
    const targetIds = filteredIds;
    if (targetIds.length === 0 && !aiLoading && (searchQuery || activeTab !== "전체")) return [];
    
    const idMap = new Map(targetIds.map((id, index) => [id, index]));
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">DT</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">디자인씽킹 서재</h1>
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
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-white sticky top-16 z-40 px-2 shadow-sm">
          {CORE_KEYWORDS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery(""); // 탭 변경 시 검색어 초기화
              }}
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

        <div className="px-6 py-6">
          <div className="relative group">
            <input 
              ref={searchInputRef}
              type="text"
              placeholder={activeTab === "전체" ? "요즘 어떤 프로젝트 고민이 있으신가요?" : `'${activeTab}'에 대해 더 자세히 검색해보세요`}
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
          
          <div className={`mt-4 flex items-center gap-3 px-2 transition-opacity duration-300 ${aiLoading ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
            <span className="text-[12px] text-indigo-600 font-bold uppercase tracking-wider">
                {process.env.API_KEY ? "AI Curator is thinking..." : "Smart Curator is sorting..."}
            </span>
          </div>
        </div>

        <div className="px-6 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {activeTab === "전체" ? "CURATED BOOKS" : `${activeTab} COLLECTION`} 
            <span className="ml-2 text-slate-300">({displayedBooks.length})</span>
          </h2>
        </div>

        <div className="px-6">
          {!aiLoading && displayedBooks.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-300 font-medium mb-1 italic">"적절한 도서를 찾지 못했습니다"</p>
              <p className="text-slate-400 text-sm">다른 키워드로 고민을 입력해보세요.</p>
            </div>
          ) : (
            <div className="book-grid">
              {displayedBooks.map(book => (
                <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
              ))}
              {aiLoading && displayedBooks.length === 0 && Array.from({length: 4}).map((_, i) => (
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
