import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange, className = '' }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [totalItems, itemsPerPage, currentPage, totalPages, onPageChange]);

  if (totalItems <= itemsPerPage) return null;

  return (
    <div className={`flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 w-full shrink-0 ${className}`}>
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
        Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-bold text-slate-700 dark:text-slate-200">{endIndex}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> data
      </p>
      
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1 px-2 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-[10px]"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <div className="px-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
           {currentPage} / {totalPages}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1 px-2 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-[10px]"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
