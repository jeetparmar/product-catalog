package com.example.catalog.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.catalog.dto.Pages.Benchmark;
import com.example.catalog.dto.Pages.BenchmarkRow;
import com.example.catalog.dto.Pages.CursorPage;
import com.example.catalog.dto.Pages.OffsetPage;
import com.example.catalog.dto.ProductRequest;
import com.example.catalog.model.Product;
import com.example.catalog.repository.ProductRepository;

@Service
public class ProductService {

    private static final Sort BY_ID = Sort.by("id");
    private static final int MAX_SIZE = 100;

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    // ---------- Offset pagination: LIMIT n OFFSET page*n (+ COUNT(*)) ----------

    @Transactional(readOnly = true)
    public OffsetPage offsetPage(int page, int size) {
        size = clampSize(size);
        page = Math.max(page, 0);
        long start = System.nanoTime();
        Page<Product> result = repo.findAll(PageRequest.of(page, size, BY_ID));
        double ms = ms(start);
        return new OffsetPage(result.getContent(), page, size,
                result.getTotalElements(), result.getTotalPages(), ms);
    }

    // ---------- Cursor (keyset) pagination: WHERE id > :cursor LIMIT n ----------

    @Transactional(readOnly = true)
    public CursorPage cursorPage(Long after, int size) {
        size = clampSize(size);
        long cursor = after == null ? 0L : after;
        long start = System.nanoTime();
        // Fetch one extra row to learn whether another page exists, without a COUNT.
        List<Product> rows = repo.findByIdGreaterThanOrderByIdAsc(cursor, PageRequest.of(0, size + 1));
        double ms = ms(start);
        boolean hasNext = rows.size() > size;
        List<Product> items = hasNext ? new ArrayList<>(rows.subList(0, size)) : rows;
        Long next = hasNext ? items.get(items.size() - 1).getId() : null;
        return new CursorPage(items, next, hasNext, size, ms);
    }

    // ---------- CRUD ----------

    @Transactional(readOnly = true)
    public Product get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + id + " not found"));
    }

    @Transactional
    public Product create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return repo.save(p);
    }

    @Transactional
    public Product update(Long id, ProductRequest req) {
        Product p = get(id);
        apply(p, req);
        return repo.save(p);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + id + " not found");
        }
        repo.deleteById(id);
    }

    private void apply(Product p, ProductRequest r) {
        p.setName(r.name().trim());
        p.setCategory(r.category().trim());
        p.setBrand(r.brand().trim());
        p.setPrice(r.price());
        p.setStock(r.stock());
        p.setDescription(r.description());
    }

    // ---------- Benchmark: same logical page, fetched three ways ----------

    public Benchmark benchmark(int size, int runs) {
        size = clampSize(size);
        runs = Math.min(Math.max(runs, 1), 20);
        long total = repo.count();
        double[] fractions = { 0, 0.10, 0.25, 0.50, 0.75, 0.90 };
        List<BenchmarkRow> rows = new ArrayList<>();

        for (double f : fractions) {
            long position = (long) (total * f);
            position -= position % size; // align to a page boundary
            if (position >= total)
                continue;
            int page = (int) (position / size);

            // Cursor equal to the id of the row just before `position` (not part of the
            // timing).
            long cursor = 0L;
            if (position > 0) {
                var prev = repo.findAllBy(PageRequest.of((int) position - 1, 1, BY_ID)).getContent();
                if (prev.isEmpty())
                    continue;
                cursor = prev.get(0).getId();
            }

            final long c = cursor;
            final int s = size;
            rows.add(new BenchmarkRow(position,
                    time(runs, () -> repo.findAll(PageRequest.of(page, s, BY_ID))),
                    time(runs, () -> repo.findAllBy(PageRequest.of(page, s, BY_ID))),
                    time(runs, () -> repo.findByIdGreaterThanOrderByIdAsc(c, PageRequest.of(0, s)))));
        }
        return new Benchmark(total, size, runs, rows);
    }

    /** Average milliseconds over `runs`, after one untimed warm-up call. */
    private static double time(int runs, Runnable query) {
        query.run();
        long sum = 0;
        for (int i = 0; i < runs; i++) {
            long start = System.nanoTime();
            query.run();
            sum += System.nanoTime() - start;
        }
        return Math.round(sum / (double) runs / 10_000.0) / 100.0; // ms, 2 decimals
    }

    private static double ms(long startNanos) {
        return Math.round((System.nanoTime() - startNanos) / 10_000.0) / 100.0;
    }

    private static int clampSize(int size) {
        return Math.min(Math.max(size, 1), MAX_SIZE);
    }
}
