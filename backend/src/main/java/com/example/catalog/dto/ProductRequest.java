package com.example.catalog.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductRequest(
                @NotBlank @Size(max = 200) String name,
                @NotBlank @Size(max = 255) String category,
                @NotBlank @Size(max = 255) String brand,
                @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal price,
                @NotNull @Min(0) Integer stock,
                @Size(max = 1000) String description) {
}
