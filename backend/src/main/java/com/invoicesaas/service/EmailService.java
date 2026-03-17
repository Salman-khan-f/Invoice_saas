package com.invoicesaas.service;

import com.invoicesaas.model.Invoice;
import com.invoicesaas.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfService pdfService;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Async
    public void sendInvoiceEmail(Invoice invoice, User company, byte[] pdfBytes) {
        try {
            if (invoice.getClientSnapshot() == null || invoice.getClientSnapshot().getEmail() == null) {
                log.warn("Cannot send email: client email is null for invoice {}", invoice.getInvoiceNumber());
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(invoice.getClientSnapshot().getEmail());
            helper.setSubject("Invoice " + invoice.getInvoiceNumber() + " from " + company.getCompanyName());
            helper.setText(buildEmailBody(invoice, company), true);
            helper.addAttachment(invoice.getInvoiceNumber() + ".pdf",
                    () -> new java.io.ByteArrayInputStream(pdfBytes), "application/pdf");

            mailSender.send(message);
            log.info("Invoice email sent successfully for {}", invoice.getInvoiceNumber());

        } catch (MessagingException e) {
            log.error("Failed to send invoice email for {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private String buildEmailBody(Invoice invoice, User company) {
        String clientName = invoice.getClientSnapshot() != null ? invoice.getClientSnapshot().getName() : "Valued Client";
        String dueDate = invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FORMAT) : "N/A";
        String total = "$" + (invoice.getTotal() != null ? String.format("%.2f", invoice.getTotal()) : "0.00");
        String currency = invoice.getCurrency() != null ? invoice.getCurrency() : "USD";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
                        .header p { color: rgba(255,255,255,0.85); margin: 5px 0 0; }
                        .body { padding: 30px; }
                        .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
                        .invoice-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .invoice-row { display: flex; justify-content: space-between; margin: 8px 0; }
                        .invoice-label { color: #6b7280; font-size: 14px; }
                        .invoice-value { color: #111827; font-weight: 600; font-size: 14px; }
                        .total-row { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
                        .total-row .invoice-value { color: #6366f1; font-size: 18px; }
                        .cta-button { display: block; text-align: center; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
                        .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Invoice from %s</h1>
                            <p>%s</p>
                        </div>
                        <div class="body">
                            <p class="greeting">Dear %s,</p>
                            <p style="color: #6b7280; font-size: 15px;">Please find attached your invoice. Here's a summary:</p>
                            <div class="invoice-box">
                                <div class="invoice-row">
                                    <span class="invoice-label">Invoice Number</span>
                                    <span class="invoice-value">%s</span>
                                </div>
                                <div class="invoice-row">
                                    <span class="invoice-label">Issue Date</span>
                                    <span class="invoice-value">%s</span>
                                </div>
                                <div class="invoice-row">
                                    <span class="invoice-label">Due Date</span>
                                    <span class="invoice-value">%s</span>
                                </div>
                                <div class="invoice-row total-row">
                                    <span class="invoice-label">Amount Due (%s)</span>
                                    <span class="invoice-value">%s</span>
                                </div>
                            </div>
                            <p style="color: #6b7280; font-size: 14px;">The invoice PDF is attached to this email. Please review and process payment by the due date.</p>
                            <p style="color: #6b7280; font-size: 14px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
                        </div>
                        <div class="footer">
                            <p>This invoice was sent by <strong>%s</strong></p>
                            <p>%s</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                company.getCompanyName(),
                invoice.getInvoiceNumber(),
                clientName,
                invoice.getInvoiceNumber(),
                invoice.getIssueDate() != null ? invoice.getIssueDate().format(DATE_FORMAT) : "N/A",
                dueDate,
                currency,
                total,
                company.getCompanyName(),
                company.getEmail()
        );
    }
}
