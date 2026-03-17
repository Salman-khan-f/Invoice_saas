package com.invoicesaas.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotEmpty(message = "At least one item is required")
    private List<InvoiceItemRequest> items;

    private BigDecimal discount;
    private String notes;
    private String terms;
    private String currency = "USD";
    private String status;

    @Data
    public static class InvoiceItemRequest {
        @NotBlank(message = "Item name is required")
        private String name;
        private String description;

        @NotNull @DecimalMin("0.01")
        private BigDecimal quantity;

        @NotNull @DecimalMin("0.01")
        private BigDecimal unitPrice;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal taxRate = BigDecimal.ZERO;
    }
}
