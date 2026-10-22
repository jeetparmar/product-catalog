export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description: string | null;
  createdAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export interface OffsetPage {
  items: Product[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  queryTimeMs: number;
}

export interface CursorPage {
  items: Product[];
  nextCursor: number | null;
  hasNext: boolean;
  size: number;
  queryTimeMs: number;
}

export interface BenchmarkRow {
  position: number;
  offsetWithCountMs: number;
  offsetNoCountMs: number;
  cursorMs: number;
}

export interface Benchmark {
  totalRows: number;
  size: number;
  runs: number;
  rows: BenchmarkRow[];
}
