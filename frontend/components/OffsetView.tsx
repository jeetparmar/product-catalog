'use client';

import { useEffect, useState } from 'react';
import { getOffsetPage } from '@/lib/api';
import type { OffsetPage, Product } from '@/lib/types';
import ProductTable from './ProductTable';

interface Props {
  refreshKey: number;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function OffsetView({ refreshKey, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [jump, setJump] = useState('');
  const [data, setData] = useState<OffsetPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOffsetPage(page, size)
      .then((d) => {
        if (cancelled) return;
        // Deleting the last row of the last page leaves it empty: step back.
        if (d.items.length === 0 && page > 0 && d.totalPages > 0) setPage(d.totalPages - 1);
        else setData(d);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, size, refreshKey]);

  const totalPages = data?.totalPages ?? 0;

  function goTo() {
    const n = Number(jump);
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) setPage(n - 1);
    setJump('');
  }

  return (
    <div>
      <div className="note">
        <strong>Offset pagination</strong> runs <code>LIMIT {size} OFFSET {page * size}</code> and a{' '}
        <code>COUNT(*)</code>. You can jump to any page and see the total, but the database has to walk past
        every skipped row first.
      </div>
      <div className="panel">
        <div className="toolbar">
          <div className="stat">
            {data && (
              <>
                Query time: <strong>{data.queryTimeMs} ms</strong> (page + count) ·{' '}
                {data.totalItems.toLocaleString()} products
              </>
            )}
          </div>
          <label className="row">
            Rows per page
            <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
              {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {data && <ProductTable items={data.items} onEdit={onEdit} onDelete={onDelete} />}
        <div className="pager">
          <button className="btn" onClick={() => setPage(0)} disabled={page === 0 || loading}>First</button>
          <button className="btn" onClick={() => setPage(page - 1)} disabled={page === 0 || loading}>Previous</button>
          <span className="stat">Page <strong>{page + 1}</strong> of {totalPages.toLocaleString()}</span>
          <button className="btn" onClick={() => setPage(page + 1)} disabled={page + 1 >= totalPages || loading}>Next</button>
          <button className="btn" onClick={() => setPage(totalPages - 1)} disabled={page + 1 >= totalPages || loading}>Last</button>
          <input
            type="number"
            min={1}
            max={totalPages || undefined}
            placeholder="Page"
            aria-label="Go to page"
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goTo()}
          />
          <button className="btn" onClick={goTo} disabled={!jump}>Go</button>
        </div>
      </div>
    </div>
  );
}
