package com.invoicesaas.service;

import com.invoicesaas.dto.response.DashboardStats;
import com.invoicesaas.model.Invoice;
import com.invoicesaas.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final ClientService clientService;
    private final InvoiceService invoiceService;

    public DashboardStats getStats(String tenantId) {
        List<Invoice> allInvoices = invoiceRepository.findByTenantId(tenantId);

        // Mark overdue invoices on the fly
        LocalDate today = LocalDate.now();
        allInvoices.forEach(inv -> {
            if ((inv.getStatus() == Invoice.InvoiceStatus.PENDING || inv.getStatus() == Invoice.InvoiceStatus.PARTIAL)
                    && inv.getDueDate() != null && inv.getDueDate().isBefore(today)) {
                inv.setStatus(Invoice.InvoiceStatus.OVERDUE);
                invoiceRepository.save(inv);
            }
        });

        BigDecimal totalRevenue = allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING || i.getStatus() == Invoice.InvoiceStatus.PARTIAL)
                .map(Invoice::getBalanceDue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overdueAmount = allInvoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.OVERDUE)
                .map(Invoice::getBalanceDue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DashboardStats.MonthlyRevenue> monthlyRevenue = buildMonthlyRevenue(allInvoices);

        List<DashboardStats.RecentInvoice> recentInvoices = allInvoices.stream()
                .sorted(Comparator.comparing(Invoice::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::toRecentInvoice)
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalRevenue(totalRevenue)
                .pendingAmount(pendingAmount)
                .overdueAmount(overdueAmount)
                .totalInvoices(allInvoices.size())
                .paidInvoices(allInvoices.stream().filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID).count())
                .pendingInvoices(allInvoices.stream().filter(i -> i.getStatus() == Invoice.InvoiceStatus.PENDING).count())
                .overdueInvoices(allInvoices.stream().filter(i -> i.getStatus() == Invoice.InvoiceStatus.OVERDUE).count())
                .totalClients(clientService.countClients(tenantId))
                .monthlyRevenue(monthlyRevenue)
                .recentInvoices(recentInvoices)
                .build();
    }

    private List<DashboardStats.MonthlyRevenue> buildMonthlyRevenue(List<Invoice> invoices) {
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, BigDecimal> monthlyMap = new LinkedHashMap<>();

        // Initialize last 6 months
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            monthlyMap.put(month.format(monthFormatter), BigDecimal.ZERO);
        }

        // Aggregate paid invoices
        invoices.stream()
                .filter(inv -> inv.getStatus() == Invoice.InvoiceStatus.PAID
                        && inv.getIssueDate() != null
                        && inv.getIssueDate().isAfter(now.minusMonths(6)))
                .forEach(inv -> {
                    String key = inv.getIssueDate().format(monthFormatter);
                    monthlyMap.merge(key, inv.getTotal() != null ? inv.getTotal() : BigDecimal.ZERO, BigDecimal::add);
                });

        return monthlyMap.entrySet().stream()
                .map(e -> new DashboardStats.MonthlyRevenue(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private DashboardStats.RecentInvoice toRecentInvoice(Invoice inv) {
        String clientName = inv.getClientSnapshot() != null ? inv.getClientSnapshot().getName() : "Unknown";
        String dueDate = inv.getDueDate() != null ? inv.getDueDate().toString() : "";
        return DashboardStats.RecentInvoice.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .clientName(clientName)
                .total(inv.getTotal())
                .status(inv.getStatus().name())
                .dueDate(dueDate)
                .build();
    }
}
