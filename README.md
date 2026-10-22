# Product catalog: offset vs cursor pagination

Spring Boot 3 (Java 21) REST API + Next.js 14 UI. No authentication.

```
products.csv   1,000 generated products (also bundled in backend/src/main/resources)
gen_dataset.py regenerates the CSV (seeded, so output is repeatable)
backend/       Spring Boot, JPA, H2 file database
frontend/      Next.js (App Router, TypeScript)
```

## Run

Backend (needs JDK 21 and Maven):

    cd backend
    mvn spring-boot:run          # http://localhost:8080

On first start the 1,000 rows load from `products.csv`. Data is kept in `backend/data/`;
delete that folder to reset.

Frontend (needs Node 18.17+):

    cd frontend
    npm install
    npm run dev                  # http://localhost:3000

Next.js proxies `/api/*` to the backend, so no CORS setup is needed. To point at another
backend: `BACKEND_URL=http://host:port npm run dev`.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/products/offset?page=0&size=20` | Offset page: items, page, totalItems, totalPages, queryTimeMs |
| GET | `/api/products/cursor?after=<id>&size=20` | Cursor page: items, nextCursor, hasNext, queryTimeMs |
| GET | `/api/products/{id}` | One product |
| POST | `/api/products` | Create |
| PUT | `/api/products/{id}` | Update |
| DELETE | `/api/products/{id}` | Delete |
| GET | `/api/products/benchmark?size=20&runs=5` | Same page fetched three ways at several depths |
| POST | `/api/admin/seed?count=100000` | Add random rows (max 1,000,000) |

Page size is capped at 100.

## How the two approaches are implemented

- Offset: `PageRequest.of(page, size, Sort.by("id"))` becomes `ORDER BY id LIMIT n OFFSET page*n`,
  plus a `COUNT(*)` for the total.
- Cursor (keyset): `WHERE id > :after ORDER BY id LIMIT size+1`. The extra row tells us whether
  a next page exists, so no count is needed. `nextCursor` is the last id on the page.

## Reading the comparison

With 1,000 rows both are about a millisecond, so the Compare tab has "+10,000 / +100,000 / +500,000"
buttons that insert random products. The benchmark shows three bars per depth:

1. Offset + COUNT(*): what a typical `Page<T>` API does.
2. Offset only: isolates the cost of skipping rows from the cost of counting.
3. Cursor.

Expect offset time to grow with depth and cursor time to stay flat. Exact numbers depend on your machine
and on H2; a server database such as PostgreSQL will show a larger gap on big tables.

Cursor pagination here is ascending by id only. Sorting by another column (price, name) needs a
composite cursor such as `(price, id)`.
