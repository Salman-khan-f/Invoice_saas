package com.invoicesaas.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id;

    private String tenantId;

    private String invoiceNumber;

    private String clientId;

    private Client clientSnapshot;

    private List<InvoiceItem> items;

    private BigDecimal subtotal;

    private BigDecimal taxRate;

    private BigDecimal taxAmount;

    private BigDecimal discount;

    private BigDecimal total;

    private String notes;

    private String terms;

    private LocalDate issueDate;

    private LocalDate dueDate;

    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    private List<Payment> payments;

    private BigDecimal paidAmount;

    private BigDecimal balanceDue;

    private String currency;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum InvoiceStatus {
        DRAFT, PENDING, PAID, OVERDUE, CANCELLED, PARTIAL
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceItem {
        private String id;
        private String name;
        private String description;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private BigDecimal total;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Payment {
        private String id;
        private BigDecimal amount;
        private LocalDate paymentDate;
        private String paymentMethod;
        private String reference;
        private String notes;
    }
}
