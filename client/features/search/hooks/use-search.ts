'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchBackend, invalidateSearchCache } from '../api';
import type { UnifiedSearchResult } from '../types';

export function useSearch(query: string, debounceMs = 150) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const activeQueryRef = useRef(query);

  useEffect(() => {
    activeQueryRef.current = query;
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchBackend(trimmed);
        if (activeQueryRef.current === query) {
          setResults(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (activeQueryRef.current === query) {
          console.error('[Search] Failed to fetch search results from backend:', err);
          setError('Failed to search files. Please try again.');
          setResults([]);
        }
      } finally {
        if (activeQueryRef.current === query) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs]);

  const refresh = useCallback(async () => {
    invalidateSearchCache();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchBackend(trimmed);
      setResults(data);
    } catch (err) {
      console.error('[Search] Refresh error:', err);
      setError('Failed to refresh search results.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return {
    results,
    isLoading,
    error,
    refresh,
  };
}
