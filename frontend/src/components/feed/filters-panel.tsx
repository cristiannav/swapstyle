import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useFilters } from '@/contexts/filters-context';
import { cn } from '@/lib/cn';
import type { GarmentCategory } from '@/types/api';

const CATEGORIES: { value: GarmentCategory; label: string }[] = [
  { value: 'top', label: 'Parte superior' },
  { value: 'bottom', label: 'Parte inferior' },
  { value: 'dress', label: 'Vestidos' },
  { value: 'outerwear', label: 'Abrigos' },
  { value: 'shoes', label: 'Calzado' },
  { value: 'accessory', label: 'Accesorios' },
  { value: 'bag', label: 'Bolsos' },
  { value: 'other', label: 'Otros' },
];

export function FiltersPanel() {
  const [open, setOpen] = useState(false);
  const { filters, setCategories, setSize, setCity, reset, activeCount } = useFilters();

  const toggleCategory = (cat: GarmentCategory) => {
    setCategories(
      filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-text-muted hover:text-danger flex items-center gap-1">
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Categorías</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map(({ value, label }) => {
                const active = filters.categories.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleCategory(value)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs border transition-colors',
                      active
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-surface text-text-secondary border-border hover:border-brand-300',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="size" className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Talla
              </label>
              <Input
                id="size"
                placeholder="S, M, L, 38..."
                value={filters.size ?? ''}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="city" className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Ciudad
              </label>
              <Input
                id="city"
                placeholder="Buenos Aires"
                value={filters.city ?? ''}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} fullWidth>
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
