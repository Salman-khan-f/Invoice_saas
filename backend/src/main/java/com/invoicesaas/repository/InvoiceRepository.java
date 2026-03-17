package com.invoicesaas.repository;

import com.invoicesaas.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByTenantId(String tenantId);
    Optional<Invoice> findByIdAndTenantId(String id, String tenantId);
    List<Invoice> findByTenantIdAndStatus(String tenantId, Invoice.InvoiceStatus status);
    List<Invoice> findByTenantIdAndClientId(String tenantId, String clientId);
    boolean existsByInvoiceNumberAndTenantId(String invoiceNumber, String tenantId);
    long countByTenantIdAndStatus(String tenantId, Invoice.InvoiceStatus status);

    @Query("{ 'tenantId': ?0, 'status': { $in: ['PENDING', 'PARTIAL'] }, 'dueDate': { $lt: ?1 } }")
    List<Invoice> findOverdueInvoices(String tenantId, LocalDate today);

    @Query(value = "{ 'tenantId': ?0, 'status': 'PAID' }", fields = "{ 'total': 1 }")
    List<Invoice> findPaidInvoicesByTenant(String tenantId);
}
