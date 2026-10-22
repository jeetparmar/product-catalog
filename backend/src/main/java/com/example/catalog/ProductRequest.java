package com.example.catalog;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 255) String category,
        @NotBlank @Size(max = 255) String brand,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal price,
        @NotNull @Min(0) Integer stock,
        @Size(max = 1000) String description) {
}
