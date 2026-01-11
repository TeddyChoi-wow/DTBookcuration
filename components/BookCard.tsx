
import React, { useState } from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div 
      className="flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 group" 
      onClick={() => onSelect(book)}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[1/1.45] mb-3 rounded-sm overflow-hidden book-shadow border border-slate-200 bg-white">
        <img 
          src={book.imageUrl} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${book.id}/300/450`;
          }}
        />
        {/* Heart Icon Overlay */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          <svg 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Info Area - Structured vertically as requested */}
      <div className="px-1">
        {/* 1. Book Title */}
        <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        
        {/* 2. Author */}
        <p className="text-[12px] text-slate-500 font-medium mb-1.5">
          {book.author}
        </p>
        
        {/* 3. Keywords */}
        <div className="flex flex-wrap gap-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {book.keywords.slice(0, 3).map((keyword, idx) => (
            <span key={idx} className="text-[10px] text-indigo-600 font-semibold">
              #{keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
