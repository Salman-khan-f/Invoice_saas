package com.invoicesaas.service;

import com.invoicesaas.model.Invoice;
import com.invoicesaas.model.User;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfService {

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(99, 102, 241);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(249, 250, 251);
    private static final DeviceRgb TEXT_DARK = new DeviceRgb(17, 24, 39);
    private static final DeviceRgb TEXT_GRAY = new DeviceRgb(107, 114, 128);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public byte[] generateInvoicePdf(Invoice invoice, User company) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 50, 40, 50);

            // Header
            addHeader(document, invoice, company);
            addDivider(document);

            // Bill To / Invoice Details
            addBillToSection(document, invoice, company);
            document.add(new Paragraph("\n"));

            // Items Table
            addItemsTable(document, invoice);
            document.add(new Paragraph("\n"));

            // Totals
            addTotalsSection(document, invoice);

            // Notes & Terms
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                addNotesSection(document, invoice);
            }

            // Footer
            addFooter(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    private void addHeader(Document doc, Invoice invoice, User company) throws Exception {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100));

        // Company info
        Cell companyCell = new Cell().setBorder(Border.NO_BORDER);
        companyCell.add(new Paragraph(company.getCompanyName())
                .setFontSize(22).setBold().setFontColor(TEXT_DARK));
        if (company.getAddress() != null) {
            companyCell.add(new Paragraph(company.getAddress()).setFontSize(9).setFontColor(TEXT_GRAY));
        }
        companyCell.add(new Paragraph(company.getEmail()).setFontSize(9).setFontColor(TEXT_GRAY));
        if (company.getPhone() != null) {
            companyCell.add(new Paragraph(company.getPhone()).setFontSize(9).setFontColor(TEXT_GRAY));
        }
        headerTable.addCell(companyCell);

        // Invoice title + number
        Cell invoiceCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        invoiceCell.add(new Paragraph("INVOICE")
                .setFontSize(28).setBold().setFontColor(PRIMARY_COLOR));
        invoiceCell.add(new Paragraph(invoice.getInvoiceNumber())
                .setFontSize(12).setBold().setFontColor(TEXT_DARK));

        String statusText = invoice.getStatus().name();
        Paragraph statusPara = new Paragraph(statusText)
                .setFontSize(9).setBold()
                .setFontColor(getStatusColor(invoice.getStatus()))
                .setBorder(new SolidBorder(getStatusColor(invoice.getStatus()), 1))
                .setPadding(4);
        invoiceCell.add(statusPara);
        headerTable.addCell(invoiceCell);

        doc.add(headerTable);
    }

    private void addDivider(Document doc) {
        doc.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1f))
                .setMarginTop(10).setMarginBottom(15));
    }

    private void addBillToSection(Document doc, Invoice invoice, User company) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100));

        // Bill To
        Cell billToCell = new Cell().setBorder(Border.NO_BORDER);
        billToCell.add(new Paragraph("BILL TO").setFontSize(8).setBold().setFontColor(TEXT_GRAY));
        if (invoice.getClientSnapshot() != null) {
            billToCell.add(new Paragraph(invoice.getClientSnapshot().getName())
                    .setFontSize(11).setBold().setFontColor(TEXT_DARK));
            if (invoice.getClientSnapshot().getCompanyName() != null) {
                billToCell.add(new Paragraph(invoice.getClientSnapshot().getCompanyName())
                        .setFontSize(9).setFontColor(TEXT_GRAY));
            }
            billToCell.add(new Paragraph(invoice.getClientSnapshot().getEmail())
                    .setFontSize(9).setFontColor(TEXT_GRAY));
            if (invoice.getClientSnapshot().getPhone() != null) {
                billToCell.add(new Paragraph(invoice.getClientSnapshot().getPhone())
                        .setFontSize(9).setFontColor(TEXT_GRAY));
            }
            if (invoice.getClientSnapshot().getAddress() != null) {
                billToCell.add(new Paragraph(invoice.getClientSnapshot().getAddress())
                        .setFontSize(9).setFontColor(TEXT_GRAY));
            }
        }
        table.addCell(billToCell);

        // Invoice details
        Cell detailsCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        addDetailRow(detailsCell, "Issue Date:", invoice.getIssueDate() != null ? invoice.getIssueDate().format(DATE_FORMAT) : "N/A");
        addDetailRow(detailsCell, "Due Date:", invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FORMAT) : "N/A");
        addDetailRow(detailsCell, "Currency:", invoice.getCurrency() != null ? invoice.getCurrency() : "USD");
        table.addCell(detailsCell);

        doc.add(table);
    }

    private void addDetailRow(Cell cell, String label, String value) {
        Table t = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100));
        t.addCell(new Cell().add(new Paragraph(label).setFontSize(9).setFontColor(TEXT_GRAY)).setBorder(Border.NO_BORDER));
        t.addCell(new Cell().add(new Paragraph(value).setFontSize(9).setBold().setFontColor(TEXT_DARK).setTextAlignment(TextAlignment.RIGHT)).setBorder(Border.NO_BORDER));
        cell.add(t);
    }

    private void addItemsTable(Document doc, Invoice invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 15, 20, 10, 15}))
                .setWidth(UnitValue.createPercentValue(100));

        // Header row
        String[] headers = {"Description", "Qty", "Unit Price", "Tax %", "Total"};
        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setFontSize(9).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setPadding(8)
                    .setBorder(Border.NO_BORDER));
        }

        // Data rows
        boolean alternate = false;
        for (Invoice.InvoiceItem item : invoice.getItems()) {
            DeviceRgb rowBg = alternate ? LIGHT_GRAY : new DeviceRgb(255, 255, 255);

            addItemCell(table, item.getName() + (item.getDescription() != null ? "\n" + item.getDescription() : ""), rowBg, TextAlignment.LEFT);
            addItemCell(table, item.getQuantity().stripTrailingZeros().toPlainString(), rowBg, TextAlignment.CENTER);
            addItemCell(table, formatAmount(item.getUnitPrice(), invoice.getCurrency()), rowBg, TextAlignment.RIGHT);
            addItemCell(table, item.getTaxRate() + "%", rowBg, TextAlignment.CENTER);
            addItemCell(table, formatAmount(item.getTotal(), invoice.getCurrency()), rowBg, TextAlignment.RIGHT);

            alternate = !alternate;
        }

        doc.add(table);
    }

    private void addItemCell(Table table, String text, DeviceRgb bg, TextAlignment align) {
        table.addCell(new Cell()
                .add(new Paragraph(text).setFontSize(9).setFontColor(TEXT_DARK).setTextAlignment(align))
                .setBackgroundColor(bg)
                .setPadding(7)
                .setBorder(Border.NO_BORDER));
    }

    private void addTotalsSection(Document doc, Invoice invoice) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100));

        Cell emptyCell = new Cell().setBorder(Border.NO_BORDER);
        table.addCell(emptyCell);

        Cell totalsCell = new Cell().setBorder(Border.NO_BORDER);
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{55, 45}))
                .setWidth(UnitValue.createPercentValue(100));

        addTotalRow(totalsTable, "Subtotal:", formatAmount(invoice.getSubtotal(), invoice.getCurrency()), false);
        addTotalRow(totalsTable, "Tax:", formatAmount(invoice.getTaxAmount(), invoice.getCurrency()), false);
        if (invoice.getDiscount() != null && invoice.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Discount:", "-" + formatAmount(invoice.getDiscount(), invoice.getCurrency()), false);
        }

        // Divider
        totalsTable.addCell(new Cell(1, 2).setBorder(Border.NO_BORDER)
                .add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.5f))));

        addTotalRow(totalsTable, "TOTAL:", formatAmount(invoice.getTotal(), invoice.getCurrency()), true);

        if (invoice.getPaidAmount() != null && invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Paid:", formatAmount(invoice.getPaidAmount(), invoice.getCurrency()), false);
            addTotalRow(totalsTable, "Balance Due:", formatAmount(invoice.getBalanceDue(), invoice.getCurrency()), true);
        }

        totalsCell.add(totalsTable);
        table.addCell(totalsCell);
        doc.add(table);
    }

    private void addTotalRow(Table table, String label, String value, boolean bold) {
        Paragraph labelPara = new Paragraph(label).setFontSize(10)
                .setFontColor(bold ? TEXT_DARK : TEXT_GRAY);
        if (bold) labelPara.setBold();

        Paragraph valuePara = new Paragraph(value).setFontSize(10)
                .setFontColor(bold ? PRIMARY_COLOR : TEXT_DARK)
                .setTextAlignment(TextAlignment.RIGHT);
        if (bold) valuePara.setBold();

        Cell labelCell = new Cell().add(labelPara).setBorder(Border.NO_BORDER).setPadding(4);
        Cell valueCell = new Cell().add(valuePara).setBorder(Border.NO_BORDER).setPadding(4);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addNotesSection(Document doc, Invoice invoice) {
        doc.add(new Paragraph("\n"));
        doc.add(new Paragraph("Notes").setFontSize(10).setBold().setFontColor(TEXT_DARK));
        doc.add(new Paragraph(invoice.getNotes()).setFontSize(9).setFontColor(TEXT_GRAY));

        if (invoice.getTerms() != null && !invoice.getTerms().isEmpty()) {
            doc.add(new Paragraph("Terms & Conditions").setFontSize(10).setBold().setFontColor(TEXT_DARK).setMarginTop(10));
            doc.add(new Paragraph(invoice.getTerms()).setFontSize(9).setFontColor(TEXT_GRAY));
        }
    }

    private void addFooter(Document doc) {
        doc.add(new Paragraph("\n\n"));
        doc.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.5f)));
        doc.add(new Paragraph("Thank you for your business!")
                .setFontSize(9).setFontColor(TEXT_GRAY).setTextAlignment(TextAlignment.CENTER).setMarginTop(8));
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) return "-";
        String symbol = getCurrencySymbol(currency);
        return symbol + String.format("%.2f", amount);
    }

    private String getCurrencySymbol(String currency) {
        if (currency == null) return "$";
        return switch (currency.toUpperCase()) {
            case "EUR" -> "€";
            case "GBP" -> "£";
            case "INR" -> "₹";
            default -> "$";
        };
    }

    private DeviceRgb getStatusColor(Invoice.InvoiceStatus status) {
        return switch (status) {
            case PAID -> new DeviceRgb(16, 185, 129);
            case OVERDUE -> new DeviceRgb(239, 68, 68);
            case PENDING -> new DeviceRgb(245, 158, 11);
            case PARTIAL -> new DeviceRgb(99, 102, 241);
            default -> new DeviceRgb(107, 114, 128);
        };
    }
}
