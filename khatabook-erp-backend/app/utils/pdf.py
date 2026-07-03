# app/utils/pdf.py

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Spacer, HRFlowable,
)
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
import io
from datetime import datetime


def generate_invoice_pdf(voucher_data: dict) -> bytes:
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize     = A4,
        rightMargin  = 20 * mm,
        leftMargin   = 20 * mm,
        topMargin    = 20 * mm,
        bottomMargin = 20 * mm,
    )

    styles  = getSampleStyleSheet()
    PRIMARY = colors.HexColor("#1a1a2e")
    ACCENT  = colors.HexColor("#4f46e5")
    LIGHT   = colors.HexColor("#f8f9fa")
    GRAY    = colors.HexColor("#6c757d")

    title_style = ParagraphStyle(
        "Title",
        parent   = styles["Normal"],
        fontSize = 24,
        textColor= PRIMARY,
        fontName = "Helvetica-Bold",
    )
    heading_style = ParagraphStyle(
        "Heading",
        parent   = styles["Normal"],
        fontSize = 11,
        textColor= PRIMARY,
        fontName = "Helvetica-Bold",
    )
    normal_style = ParagraphStyle(
        "Normal2",
        parent   = styles["Normal"],
        fontSize = 9,
        textColor= PRIMARY,
    )

    elements = []

    # ── Header ──
    header_data = [[
        Paragraph("Khatabook ERP", title_style),
        Paragraph(
            f"<b>INVOICE</b><br/>{voucher_data.get('voucher_number', '')}",
            ParagraphStyle(
                "inv",
                parent    = styles["Normal"],
                fontSize  = 14,
                alignment = TA_RIGHT,
                textColor = ACCENT,
                fontName  = "Helvetica-Bold",
            )
        ),
    ]]
    header_table = Table(header_data, colWidths=[90 * mm, 80 * mm])
    header_table.setStyle(TableStyle([
        ("VALIGN",       (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=2, color=ACCENT))
    elements.append(Spacer(1, 6 * mm))

    # ── Bill To + Date ──
    date_str = voucher_data.get("date", datetime.now().strftime("%d-%m-%Y"))
    bill_data = [[
        Paragraph("<b>Bill To:</b>", heading_style),
        Paragraph("<b>Invoice Details:</b>", heading_style),
    ], [
        Paragraph(voucher_data.get("party_name", ""), normal_style),
        Paragraph(
            f"Date: {date_str}<br/>Voucher No: {voucher_data.get('voucher_number', '')}",
            normal_style,
        ),
    ]]
    bill_table = Table(bill_data, colWidths=[90 * mm, 80 * mm])
    bill_table.setStyle(TableStyle([
        ("VALIGN",       (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
    ]))
    elements.append(bill_table)
    elements.append(Spacer(1, 6 * mm))

    # ── Line Items Table ──
    # Use "Rs." instead of rupee symbol to avoid font issues
    table_header = ["#", "Item", "Qty", "Rate (Rs.)", "GST%", "GST Amt", "Total (Rs.)"]
    table_data   = [table_header]

    for i, item in enumerate(voucher_data.get("line_items", []), 1):
        table_data.append([
            str(i),
            item.get("stock_item_name", "Item"),
            str(item.get("quantity", 0)),
            f"Rs.{item.get('rate', 0):,.2f}",
            f"{item.get('gst_percentage', 0)}%",
            f"Rs.{item.get('gst_amount', 0):,.2f}",
            f"Rs.{item.get('total_amount', 0):,.2f}",
        ])

    col_widths  = [10 * mm, 50 * mm, 15 * mm, 25 * mm, 15 * mm, 22 * mm, 25 * mm]
    items_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    items_table.setStyle(TableStyle([
        # Header
        ("BACKGROUND",    (0, 0), (-1, 0),  ACCENT),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  colors.white),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0),  9),
        ("ALIGN",         (0, 0), (-1, 0),  "CENTER"),
        ("BOTTOMPADDING", (0, 0), (-1, 0),  6),
        ("TOPPADDING",    (0, 0), (-1, 0),  6),
        # Data rows
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("ALIGN",         (2, 1), (-1, -1), "RIGHT"),
        ("ALIGN",         (0, 1), (1, -1),  "LEFT"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("TOPPADDING",    (0, 1), (-1, -1), 5),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 6 * mm))

    # ── Totals ──
    subtotal     = voucher_data.get("subtotal",     0)
    total_gst    = voucher_data.get("total_gst",    0)
    total_amount = voucher_data.get("total_amount", 0)

    totals_data = [
        ["", "Subtotal:",    f"Rs.{subtotal:,.2f}"],
        ["", "Total GST:",   f"Rs.{total_gst:,.2f}"],
        ["", "Grand Total:", f"Rs.{total_amount:,.2f}"],
    ]
    totals_table = Table(totals_data, colWidths=[110 * mm, 30 * mm, 32 * mm])
    totals_table.setStyle(TableStyle([
        ("ALIGN",         (1, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("FONTNAME",      (1, 2), (-1, 2),  "Helvetica-Bold"),
        ("FONTSIZE",      (1, 2), (-1, 2),  12),
        ("TEXTCOLOR",     (1, 2), (-1, 2),  ACCENT),
        ("LINEABOVE",     (1, 2), (-1, 2),  1, ACCENT),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 10 * mm))

    # ── Footer ──
    elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(
        "Thank you for your business! - Khatabook ERP",
        ParagraphStyle(
            "footer",
            parent    = styles["Normal"],
            fontSize  = 9,
            textColor = GRAY,
            alignment = TA_CENTER,
        )
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()