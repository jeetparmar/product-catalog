package com.example.catalog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Loads products.csv (1000 rows) on first start, when the table is empty. */
@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);
    static final String INSERT = """
            INSERT INTO products (name, category, brand, price, stock, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)""";

    private final ProductRepository repo;
    private final JdbcTemplate jdbc;

    public DataLoader(ProductRepository repo, JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repo.count() > 0) return;

        List<Object[]> batch = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        try (var reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource("products.csv").getInputStream(), StandardCharsets.UTF_8))) {
            reader.readLine(); // header
            String line;
            int i = 0;
            while ((line = reader.readLine()) != null) {
                String[] c = line.split(",", -1);
                batch.add(new Object[]{c[0], c[1], c[2], new BigDecimal(c[3]),
                        Integer.parseInt(c[4]), c[5], now.minusMinutes(1000 - i++)});
            }
        }
        jdbc.batchUpdate(INSERT, batch);
        log.info("Loaded {} products from products.csv", batch.size());
    }
}
