package com.example.catalog.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.catalog.config.DataLoader;
import com.example.catalog.repository.ProductRepository;

/**
 * Adds random rows so the pagination comparison is meaningful.
 * With only 1000 rows both strategies are effectively instant.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final int MAX_SEED = 1_000_000;
    private static final int BATCH = 5_000;
    private static final String[] CATEGORIES = { "Electronics", "Home & Kitchen", "Clothing",
            "Sports & Outdoors", "Books & Stationery", "Beauty & Care", "Toys & Games", "Office" };
    private static final String[] BRANDS = { "Volta", "Hearthly", "Threadline", "Summit",
            "Inkwell", "Dewdrop", "Playnest", "Deskly", "Nexa", "Ergon" };
    private static final String[] NOUNS = { "Speaker", "Skillet", "Jacket", "Backpack", "Notebook",
            "Serum", "Puzzle", "Lamp", "Kettle", "Keyboard" };

    private final JdbcTemplate jdbc;
    private final ProductRepository repo;

    public AdminController(JdbcTemplate jdbc, ProductRepository repo) {
        this.jdbc = jdbc;
        this.repo = repo;
    }

    @PostMapping("/seed")
    public Map<String, Object> seed(@RequestParam int count) {
        if (count < 1 || count > MAX_SEED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "count must be 1.." + MAX_SEED);
        }
        Random rnd = new Random();
        LocalDateTime now = LocalDateTime.now();
        int remaining = count;
        while (remaining > 0) {
            int n = Math.min(BATCH, remaining);
            List<Object[]> rows = new ArrayList<>(n);
            for (int i = 0; i < n; i++) {
                String noun = NOUNS[rnd.nextInt(NOUNS.length)];
                String brand = BRANDS[rnd.nextInt(BRANDS.length)];
                rows.add(new Object[] {
                        "Generated " + noun + " " + (100 + rnd.nextInt(900)),
                        CATEGORIES[rnd.nextInt(CATEGORIES.length)],
                        brand,
                        BigDecimal.valueOf(100 + rnd.nextInt(99_900), 2),
                        rnd.nextInt(500),
                        noun + " by " + brand + ".",
                        now });
            }
            jdbc.batchUpdate(DataLoader.INSERT, rows);
            remaining -= n;
        }
        return Map.of("added", count, "totalRows", repo.count());
    }
}
