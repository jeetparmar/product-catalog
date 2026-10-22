'use client';

import { useEffect, useState } from 'react';
import { getCursorPage } from '@/lib/api';
import type { CursorPage, Product } from '@/lib/types';
import ProductTable from './ProductTable';

interface Props {
  refreshKey: number;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function CursorView({ refreshKey, onEdit, onDelete }: Props) {
  // Each entry is the `after` cursor that produced that page; the first page has none.
  const [history, setHistory] = useState<(number | null)[]>([null]);
  const [size, setSize] = useState(20);
  const [data, setData] = useState<CursorPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const after = history[history.length - 1];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCursorPage(after, size)
      .then((d) => {
        if (cancelled) return;
        // The page we were on was emptied by deletes: step back one.
        if (d.items.length === 0 && history.length > 1) setHistory((h) => h.slice(0, -1));
        else setData(d);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [after, size, refreshKey]);

  return (
    <div>
      <div className="note">
        <strong>Cursor pagination</strong> runs <code>WHERE id &gt; {after ?? 0} ORDER BY id LIMIT {size + 1}</code>.
        It jumps straight into the primary-key index, so cost stays flat on deep pages and rows don&apos;t shift
        when others are added or deleted. There is no total count and no jump-to-page.
      </div>
      <div className="panel">
        <div className="toolbar">
          <div className="stat">
            {data && <>Query time: <strong>{data.queryTimeMs} ms</strong> · cursor: {after ?? 'none (first page)'}</>}
          </div>
          <label className="row">
            Rows per page
            <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setHistory([null]); }}>
              {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {data && <ProductTable items={data.items} onEdit={onEdit} onDelete={onDelete} />}
        <div className="pager">
          <button className="btn" onClick={() => setHistory([null])} disabled={history.length === 1 || loading}>First</button>
          <button className="btn" onClick={() => setHistory((h) => h.slice(0, -1))} disabled={history.length === 1 || loading}>Previous</button>
          <span className="stat">Page <strong>{history.length}</strong></span>
          <button
            className="btn"
            onClick={() => data?.nextCursor != null && setHistory((h) => [...h, data.nextCursor])}
            disabled={!data?.hasNext || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
