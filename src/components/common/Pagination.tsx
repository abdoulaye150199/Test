import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-(--color-border) pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-(--color-text-secondary)">
        Affichage de {startItem} à {endItem} sur {totalItems} résultats
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm transition-colors sm:flex-none ${
            currentPage === 1
              ? 'text-(--color-text-tertiary) cursor-not-allowed'
              : 'text-(--color-text-secondary) hover:bg-(--color-surface-hover)'
          }`}
        >
          <ChevronLeft size={16} />
          Précédent
        </button>

        <div className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-(--color-text-tertiary)">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-(--color-primary) text-white'
                      : 'text-(--color-text-secondary) hover:bg-(--color-surface-hover)'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm transition-colors sm:flex-none ${
            currentPage === totalPages
              ? 'text-(--color-text-tertiary) cursor-not-allowed'
              : 'text-(--color-text-secondary) hover:bg-(--color-surface-hover)'
          }`}
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
