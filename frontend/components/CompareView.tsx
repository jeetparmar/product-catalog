'use client';

import { useState } from 'react';
import { runBenchmark, seedProducts } from '@/lib/api';
import type { Benchmark } from '@/lib/types';

const SEED_OPTIONS = [10_000, 100_000, 500_000];

export default function CompareView() {
  const [size, setSize] = useState(20);
  const [result, setResult] = useState<Benchmark | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy('Running benchmark…');
    setError(null);
    try {
      setResult(await runBenchmark(size));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Benchmark failed');
    } finally {
      setBusy(null);
    }
  }

  async function seed(count: number) {
    setBusy(`Adding ${count.toLocaleString()} products…`);
    setError(null);
    try {
      await seedProducts(count);
      setResult(await runBenchmark(size));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add products');
    } finally {
      setBusy(null);
    }
  }

  const max = result ? Math.max(0.01, ...result.rows.flatMap((r) => [r.offsetWithCountMs, r.offsetNoCountMs, r.cursorMs])) : 1;
  const width = (v: number) => `${Math.max((v / max) * 100, 0.5)}%`;

  return (
    <div>
      <div className="note">
        Each benchmark fetches the <em>same page</em> three ways at several depths and reports the average of 5
        runs after a warm-up. With only 1,000 products every method takes about a millisecond, so add more
        rows to see the difference.
      </div>
      <div className="panel">
        <div className="toolbar">
          <div className="row">
            <label className="row">
              Rows per page
              <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
            <button className="btn primary" onClick={run} disabled={!!busy}>Run benchmark</button>
          </div>
          <div className="row">
            <span className="muted">Add random products:</span>
            {SEED_OPTIONS.map((n) => (
              <button key={n} className="btn" onClick={() => seed(n)} disabled={!!busy}>
                +{n.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {busy && <p className="muted" role="status">{busy}</p>}
        {error && <p className="error" role="alert">{error}</p>}

        {result && (
          <>
            <p className="stat">
              <strong>{result.totalRows.toLocaleString()}</strong> products · {result.size} rows per page · lower is faster
            </p>
            <div className="legend">
              <span><i className="swatch" style={{ background: 'var(--offset)' }} />Offset with COUNT(*)</span>
              <span><i className="swatch" style={{ background: '#d9a46b' }} />Offset without count</span>
              <span><i className="swatch" style={{ background: 'var(--cursor)' }} />Cursor</span>
            </div>
            {result.rows.map((r) => (
              <div key={r.position}>
                <div className="position-title">
                  Starting at row {r.position.toLocaleString()}
                  {r.position === 0 ? ' (first page)' : ` (${Math.round((r.position / result.totalRows) * 100)}% deep)`}
                </div>
                <div className="bars">
                  <span className="bar-label">Offset + count</span>
                  <span className="bar-track"><span className="bar offset" style={{ width: width(r.offsetWithCountMs) }} /><span className="bar-value">{r.offsetWithCountMs} ms</span></span>
                  <span className="bar-label">Offset only</span>
                  <span className="bar-track"><span className="bar nocount" style={{ width: width(r.offsetNoCountMs) }} /><span className="bar-value">{r.offsetNoCountMs} ms</span></span>
                  <span className="bar-label">Cursor</span>
                  <span className="bar-track"><span className="bar cursor" style={{ width: width(r.cursorMs) }} /><span className="bar-value">{r.cursorMs} ms</span></span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="cols" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Offset pagination</h2>
          <p><strong>Good:</strong> jump to any page, show total pages, trivial to build, works with any sort order.</p>
          <p><strong>Costs:</strong> time grows with page depth because skipped rows are still read. Rows can repeat or vanish if data changes while someone pages. The extra <code>COUNT(*)</code> also grows with table size.</p>
        </div>
        <div className="panel">
          <h2>Cursor pagination</h2>
          <p><strong>Good:</strong> flat cost at any depth, stable results while data changes, well suited to infinite scroll and feeds.</p>
          <p><strong>Costs:</strong> no jump-to-page and no cheap total. The sort column must be unique and indexed (here the id), and sorting by other columns needs a composite cursor.</p>
        </div>
      </div>
    </div>
  );
}
