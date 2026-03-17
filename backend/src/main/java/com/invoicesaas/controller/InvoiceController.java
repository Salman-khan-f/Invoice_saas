package com.invoicesaas.controller;

import com.invoicesaas.dto.request.InvoiceRequest;
import com.invoicesaas.dto.request.PaymentRequest;
import com.invoicesaas.dto.response.ApiResponse;
import com.invoicesaas.model.Invoice;
import com.invoicesaas.model.User;
import com.invoicesaas.repository.UserRepository;
import com.invoicesaas.service.EmailService;
import com.invoicesaas.service.InvoiceService;
import com.invoicesaas.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfService pdfService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Invoice>>> getAllInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices(user.getTenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> getInvoice(@PathVariable String id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceById(id, user.getTenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Invoice>> createInvoice(@Valid @RequestBody InvoiceRequest request,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.createInvoice(request, user.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created successfully", invoice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Invoice>> updateInvoice(@PathVariable String id,
                                                               @Valid @RequestBody InvoiceRequest request,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.updateInvoice(id, request, user.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Invoice updated successfully", invoice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable String id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        invoiceService.deleteInvoice(id, user.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Invoice cancelled", null));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<Invoice>> addPayment(@PathVariable String id,
                                                            @Valid @RequestBody PaymentRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.addPayment(id, request, user.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", invoice));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Invoice>> updateStatus(@PathVariable String id,
                                                              @RequestBody Map<String, String> body,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.updateStatus(id, body.get("status"), user.getTenantId());
        return ResponseEntity.ok(ApiResponse.success("Status updated", invoice));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.getInvoiceById(id, user.getTenantId());
        byte[] pdf = pdfService.generateInvoicePdf(invoice, user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(invoice.getInvoiceNumber() + ".pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/{id}/send-email")
    public ResponseEntity<ApiResponse<Void>> sendInvoiceEmail(@PathVariable String id,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Invoice invoice = invoiceService.getInvoiceById(id, user.getTenantId());
        byte[] pdf = pdfService.generateInvoicePdf(invoice, user);
        emailService.sendInvoiceEmail(invoice, user, pdf);
        return ResponseEntity.ok(ApiResponse.success("Invoice sent to client email", null));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<Invoice>>> getByClient(@PathVariable String clientId,
                                                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoicesByClient(clientId, user.getTenantId())));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
