package com.example.catalog.dto;

import java.util.List;

import com.example.catalog.model.Product;

/** Response shapes for the two pagination styles, plus the benchmark. */
public final class Pages {
    private Pages() {
    }

    public record OffsetPage(List<Product> items, int page, int size,
            long totalItems, int totalPages, double queryTimeMs) {
    }

    public record CursorPage(List<Product> items, Long nextCursor, boolean hasNext,
            int size, double queryTimeMs) {
    }

    public record BenchmarkRow(long position, double offsetWithCountMs,
            double offsetNoCountMs, double cursorMs) {
    }

    public record Benchmark(long totalRows, int size, int runs, List<BenchmarkRow> rows) {
    }
}
