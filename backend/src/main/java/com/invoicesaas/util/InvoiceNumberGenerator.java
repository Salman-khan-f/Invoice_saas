package com.invoicesaas.util;

import com.invoicesaas.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class InvoiceNumberGenerator {

    private final InvoiceRepository invoiceRepository;

    public String generate(String tenantId) {
        int year = Year.now().getValue();
        String prefix = "INV-" + year + "-";
        int sequence = 1;

        // Find next available sequence
        while (invoiceRepository.existsByInvoiceNumberAndTenantId(prefix + String.format("%04d", sequence), tenantId)) {
            sequence++;
        }

        return prefix + String.format("%04d", sequence);
    }
}
