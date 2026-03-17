package com.invoicesaas.service;

import com.invoicesaas.dto.request.InvoiceRequest;
import com.invoicesaas.dto.request.PaymentRequest;
import com.invoicesaas.exception.BadRequestException;
import com.invoicesaas.exception.ResourceNotFoundException;
import com.invoicesaas.model.Client;
import com.invoicesaas.model.Invoice;
import com.invoicesaas.repository.InvoiceRepository;
import com.invoicesaas.util.InvoiceNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientService clientService;
    private final InvoiceNumberGenerator invoiceNumberGenerator;

    public List<Invoice> getAllInvoices(String tenantId) {
        return invoiceRepository.findByTenantId(tenantId);
    }

    public Invoice getInvoiceById(String id, String tenantId) {
        return invoiceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }

    public Invoice createInvoice(InvoiceRequest request, String tenantId) {
        Client client = clientService.getClientById(request.getClientId(), tenantId);

        List<Invoice.InvoiceItem> items = buildItems(request.getItems());
        BigDecimal subtotal = calculateSubtotal(items);
        BigDecimal taxAmount = calculateTotalTax(items);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(taxAmount).subtract(discount);

        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Invoice total cannot be negative");
        }

        Invoice invoice = Invoice.builder()
                .tenantId(tenantId)
                .invoiceNumber(invoiceNumberGenerator.generate(tenantId))
                .clientId(client.getId())
                .clientSnapshot(client)
                .items(items)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discount(discount)
                .total(total)
                .paidAmount(BigDecimal.ZERO)
                .balanceDue(total)
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .terms(request.getTerms())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(Invoice.InvoiceStatus.PENDING)
                .payments(new ArrayList<>())
                .build();

        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoice(String id, InvoiceRequest request, String tenantId) {
        Invoice invoice = getInvoiceById(id, tenantId);

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new BadRequestException("Cannot edit a paid invoice");
        }

        Client client = clientService.getClientById(request.getClientId(), tenantId);

        List<Invoice.InvoiceItem> items = buildItems(request.getItems());
        BigDecimal subtotal = calculateSubtotal(items);
        BigDecimal taxAmount = calculateTotalTax(items);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(taxAmount).subtract(discount);

        invoice.setClientId(client.getId());
        invoice.setClientSnapshot(client);
        invoice.setItems(items);
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setDiscount(discount);
        invoice.setTotal(total);
        invoice.setBalanceDue(total.subtract(invoice.getPaidAmount()));
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());

        return invoiceRepository.save(invoice);
    }

    public Invoice addPayment(String id, PaymentRequest request, String tenantId) {
        Invoice invoice = getInvoiceById(id, tenantId);

        if (invoice.getStatus() == Invoice.InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot add payment to a cancelled invoice");
        }

        BigDecimal newPaidAmount = invoice.getPaidAmount().add(request.getAmount());
        if (newPaidAmount.compareTo(invoice.getTotal()) > 0) {
            throw new BadRequestException("Payment amount exceeds invoice total");
        }

        Invoice.Payment payment = Invoice.Payment.builder()
                .id(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod())
                .reference(request.getReference())
                .notes(request.getNotes())
                .build();

        if (invoice.getPayments() == null) {
            invoice.setPayments(new ArrayList<>());
        }
        invoice.getPayments().add(payment);

        invoice.setPaidAmount(newPaidAmount);
        invoice.setBalanceDue(invoice.getTotal().subtract(newPaidAmount));

        if (newPaidAmount.compareTo(invoice.getTotal()) == 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIAL);
        }

        return invoiceRepository.save(invoice);
    }

    public Invoice updateStatus(String id, String status, String tenantId) {
        Invoice invoice = getInvoiceById(id, tenantId);
        invoice.setStatus(Invoice.InvoiceStatus.valueOf(status.toUpperCase()));
        return invoiceRepository.save(invoice);
    }

    public void deleteInvoice(String id, String tenantId) {
        Invoice invoice = getInvoiceById(id, tenantId);
        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        invoiceRepository.save(invoice);
    }

    public List<Invoice> getInvoicesByClient(String clientId, String tenantId) {
        return invoiceRepository.findByTenantIdAndClientId(tenantId, clientId);
    }

    // Auto-update overdue invoices daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void markOverdueInvoices() {
        List<Invoice> overdue = invoiceRepository.findOverdueInvoices("*", LocalDate.now());
        overdue.forEach(inv -> {
            inv.setStatus(Invoice.InvoiceStatus.OVERDUE);
            invoiceRepository.save(inv);
        });
    }

    // Stats helpers
    public long countByStatus(String tenantId, Invoice.InvoiceStatus status) {
        return invoiceRepository.countByTenantIdAndStatus(tenantId, status);
    }

    public BigDecimal getTotalRevenue(String tenantId) {
        return invoiceRepository.findPaidInvoicesByTenant(tenantId).stream()
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getPendingAmount(String tenantId) {
        return invoiceRepository.findByTenantIdAndStatus(tenantId, Invoice.InvoiceStatus.PENDING)
                .stream().map(Invoice::getBalanceDue).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getOverdueAmount(String tenantId) {
        return invoiceRepository.findByTenantIdAndStatus(tenantId, Invoice.InvoiceStatus.OVERDUE)
                .stream().map(Invoice::getBalanceDue).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Private helpers
    private List<Invoice.InvoiceItem> buildItems(List<InvoiceRequest.InvoiceItemRequest> requests) {
        return requests.stream().map(r -> {
            BigDecimal quantity = r.getQuantity();
            BigDecimal unitPrice = r.getUnitPrice();
            BigDecimal taxRate = r.getTaxRate() != null ? r.getTaxRate() : BigDecimal.ZERO;
            BigDecimal itemTotal = quantity.multiply(unitPrice)
                    .multiply(BigDecimal.ONE.add(taxRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                    .setScale(2, RoundingMode.HALF_UP);

            return Invoice.InvoiceItem.builder()
                    .id(UUID.randomUUID().toString())
                    .name(r.getName())
                    .description(r.getDescription())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .taxRate(taxRate)
                    .total(itemTotal)
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal calculateSubtotal(List<Invoice.InvoiceItem> items) {
        return items.stream()
                .map(i -> i.getQuantity().multiply(i.getUnitPrice()).setScale(2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalTax(List<Invoice.InvoiceItem> items) {
        return items.stream()
                .map(i -> {
                    BigDecimal base = i.getQuantity().multiply(i.getUnitPrice());
                    BigDecimal rate = i.getTaxRate() != null ? i.getTaxRate() : BigDecimal.ZERO;
                    return base.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
