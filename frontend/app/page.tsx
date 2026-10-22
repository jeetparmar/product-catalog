'use client';

import { useState } from 'react';
import { deleteProduct } from '@/lib/api';
import type { Product } from '@/lib/types';
import CompareView from '@/components/CompareView';
import CursorView from '@/components/CursorView';
import OffsetView from '@/components/OffsetView';
import ProductForm from '@/components/ProductForm';

type Mode = 'offset' | 'cursor' | 'compare';

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'offset', label: 'Offset pagination' },
  { mode: 'cursor', label: 'Cursor pagination' },
  { mode: 'compare', label: 'Compare' },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>('offset');
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  function openForm(p: Product | null) {
    setEditing(p);
    setFormOpen(true);
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try {
      await deleteProduct(p.id);
      setError(null);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the product');
    }
  }

  return (
    <main>
      <div className="topbar">
        <div>
          <h1>Product catalog</h1>
          <span className="muted">Spring Boot + Next.js: the same data, paged two ways</span>
        </div>
        <button className="btn primary" onClick={() => openForm(null)}>Add product</button>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.mode}
            role="tab"
            className="tab"
            data-mode={t.mode}
            aria-selected={mode === t.mode}
            onClick={() => setMode(t.mode)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {mode === 'offset' && <OffsetView refreshKey={refreshKey} onEdit={openForm} onDelete={remove} />}
      {mode === 'cursor' && <CursorView refreshKey={refreshKey} onEdit={openForm} onDelete={remove} />}
      {mode === 'compare' && <CompareView />}

      {formOpen && (
        <ProductForm
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            refresh();
          }}
        />
      )}
    </main>
  );
}
