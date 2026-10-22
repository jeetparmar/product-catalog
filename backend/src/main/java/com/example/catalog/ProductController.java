package com.example.catalog;

import com.example.catalog.Pages.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/offset")
    public OffsetPage offset(@RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "20") int size) {
        return service.offsetPage(page, size);
    }

    @GetMapping("/cursor")
    public CursorPage cursor(@RequestParam(required = false) Long after,
                             @RequestParam(defaultValue = "20") int size) {
        return service.cursorPage(after, size);
    }

    @GetMapping("/benchmark")
    public Benchmark benchmark(@RequestParam(defaultValue = "20") int size,
                               @RequestParam(defaultValue = "5") int runs) {
        return service.benchmark(size, runs);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
