import type { Benchmark, CursorPage, OffsetPage, Product, ProductInput } from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* body was not JSON */
    }
    throw new Error(message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const getOffsetPage = (page: number, size: number) =>
  request<OffsetPage>(`/api/products/offset?page=${page}&size=${size}`);

export const getCursorPage = (after: number | null, size: number) =>
  request<CursorPage>(`/api/products/cursor?size=${size}${after === null ? '' : `&after=${after}`}`);

export const createProduct = (input: ProductInput) =>
  request<Product>('/api/products', { method: 'POST', body: JSON.stringify(input) });

export const updateProduct = (id: number, input: ProductInput) =>
  request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteProduct = (id: number) =>
  request<void>(`/api/products/${id}`, { method: 'DELETE' });

export const runBenchmark = (size: number) =>
  request<Benchmark>(`/api/products/benchmark?size=${size}&runs=5`);

export const seedProducts = (count: number) =>
  request<{ added: number; totalRows: number }>(`/api/admin/seed?count=${count}`, { method: 'POST' });
