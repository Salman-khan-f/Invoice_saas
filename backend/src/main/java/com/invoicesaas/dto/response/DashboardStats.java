package com.invoicesaas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private BigDecimal overdueAmount;
    private long totalInvoices;
    private long paidInvoices;
    private long pendingInvoices;
    private long overdueInvoices;
    private long totalClients;
    private List<MonthlyRevenue> monthlyRevenue;
    private List<RecentInvoice> recentInvoices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentInvoice {
        private String id;
        private String invoiceNumber;
        private String clientName;
        private BigDecimal total;
        private String status;
        private String dueDate;
    }
}
