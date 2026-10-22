package com.example.catalog;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Keyset query: WHERE id > :id ORDER BY id LIMIT n. Uses the primary-key index, no row skipping. */
    List<Product> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    /** Offset query without the COUNT(*) that Page<T> adds. */
    Slice<Product> findAllBy(Pageable pageable);
}
