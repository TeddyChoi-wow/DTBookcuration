
import React from 'react';
import { Book } from '../types';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl modal-enter max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Container */}
        <div className="overflow-y-auto no-scrollbar pb-10">
          {/* Top Close Button (Floating) */}
          <div className="sticky top-0 right-0 z-20 flex justify-end p-6 pointer-events-none">
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-full pointer-events-auto active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header Image Section */}
          <div className="w-full bg-slate-50 flex items-center justify-center -mt-16 pb-12 px-12 pt-16">
            <div className="relative group">
                <img 
                src={book.imageUrl} 
                alt={book.title} 
                className="w-full max-w-[240px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] rounded-sm transition-transform duration-700 group-hover:scale-[1.03]"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${book.id}/400/600`;
                }}
                />
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 sm:px-10 pt-6">
            {/* 1. Keywords (Hashtag style) */}
            <div className="flex flex-wrap gap-2 mb-5">
              {book.keywords.map((k, i) => (
                <span key={i} className="text-[13px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  ##{k}
                </span>
              ))}
            </div>

            {/* 2. Full Title (No truncation, break-words) */}
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.2] mb-3 tracking-tight break-words">
              {book.title}
            </h2>

            {/* 3. Author */}
            <p className="text-slate-400 text-lg sm:text-xl font-semibold mb-10">
              {book.author}
            </p>

            {/* 4. Reason Box (Aesthetic grey box with full content) */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 mb-10 border border-slate-100">
              <p className="text-slate-700 text-[17px] leading-[1.8] whitespace-pre-wrap break-words italic">
                {book.reason || "이 도서의 추천 사유가 곧 업데이트될 예정입니다."}
              </p>
            </div>

            {/* Action Button */}
            <div className="sticky bottom-0 bg-white pt-2 pb-4">
                <a 
                href={book.purchaseUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-16 bg-slate-900 text-white text-lg font-black rounded-2xl active:scale-[0.97] transition-all shadow-xl hover:shadow-slate-200"
                >
                이 책 구매하러 가기
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
