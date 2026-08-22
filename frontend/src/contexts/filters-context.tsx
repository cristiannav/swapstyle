import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { GarmentCategory } from '@/types/api';

export interface Filters {
  categories: GarmentCategory[];
  size?: string;
  city?: string;
}

interface FiltersContextValue {
  filters: Filters;
  setCategories: (categories: GarmentCategory[]) => void;
  setSize: (size?: string) => void;
  setCity: (city?: string) => void;
  reset: () => void;
  activeCount: number;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

const initial: Filters = { categories: [] };

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(initial);

  const setCategories = useCallback((categories: GarmentCategory[]) => {
    setFilters((f) => ({ ...f, categories }));
  }, []);
  const setSize = useCallback((size?: string) => setFilters((f) => ({ ...f, size: size || undefined })), []);
  const setCity = useCallback((city?: string) => setFilters((f) => ({ ...f, city: city || undefined })), []);
  const reset = useCallback(() => setFilters(initial), []);

  const value = useMemo<FiltersContextValue>(() => {
    const activeCount =
      filters.categories.length + (filters.size ? 1 : 0) + (filters.city ? 1 : 0);
    return { filters, setCategories, setSize, setCity, reset, activeCount };
  }, [filters, setCategories, setSize, setCity, reset]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters debe usarse dentro de <FiltersProvider>');
  return ctx;
}
