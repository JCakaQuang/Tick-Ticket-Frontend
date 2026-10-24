'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  scrollToCategory: (catId: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
  selectedCategory: 'ALL',
  setSelectedCategory: () => {},
  scrollToCategory: () => {},
});

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query params on mount or change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('search');
      if (q !== null) {
        setSearchQuery(q);
      }
      const cat = params.get('category');
      if (cat !== null) {
        setSelectedCategory(cat);
      }
    }
  }, []);

  const handleSetSearchQuery = (q: string) => {
    setSearchQuery(q);
    // If not on home page and query has content, navigate to home page with query
    if (pathname !== '/' && q.trim().length > 0) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const scrollToCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (pathname !== '/') {
      router.push(`/#section-${catId.toLowerCase()}`);
      return;
    }

    if (catId === 'ALL') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionEl = document.getElementById(`section-${catId.toLowerCase()}`);
    if (sectionEl) {
      const yOffset = -130; // offset for sticky dual headers
      const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        selectedCategory,
        setSelectedCategory,
        scrollToCategory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
