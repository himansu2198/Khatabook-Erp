# app/main.py

from fastapi import FastAPI, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.config import settings
from app.database import engine, Base, get_db
from app.utils.responses import success_response

# ── Import all models ──
from app.auth import models as auth_models                    # noqa
from app.masters.ledger import models as ledger_models        # noqa
from app.masters.stock import models as stock_models          # noqa
from app.vouchers.sales import models as sales_models         # noqa
from app.vouchers.purchase import models as purchase_models   # noqa
from app.vouchers.payment import models as payment_models     # noqa

# ── Import routers ──
from app.auth.router import router as auth_router
from app.masters.ledger.router import router as ledger_router
from app.masters.stock.router import router as stock_router
from app.vouchers.sales.router import router as sales_router
from app.vouchers.purchase.router import router as purchase_router
from app.vouchers.payment.router import router as payment_router

# ── Create tables ──
Base.metadata.create_all(bind=engine)

security = HTTPBearer()

app = FastAPI(
    title       = "Khatabook ERP API",
    version     = "1.0.0",
    description = "Billing, Inventory & Accounting Management System",
    docs_url    = "/api/docs",
    redoc_url   = "/api/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000", settings.FRONTEND_URL],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ──
app.include_router(auth_router,     prefix="/api/auth",               tags=["Auth"])
app.include_router(ledger_router,   prefix="/api/masters/ledgers",    tags=["Ledgers"])
app.include_router(stock_router,    prefix="/api/masters/stock",      tags=["Stock"])
app.include_router(sales_router,    prefix="/api/vouchers/sales",     tags=["Sales"])
app.include_router(purchase_router, prefix="/api/vouchers/purchase",  tags=["Purchase"])
app.include_router(payment_router,  prefix="/api/vouchers/payment",   tags=["Payment"])


# ── Health ──
@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}


# ── Helper ──
def get_user_id_from_token(credentials, db):
    from app.auth.utils import decode_token
    from fastapi import HTTPException
    token   = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")


# ── PDF Sales Invoice ──
@app.get("/api/vouchers/sales/{voucher_id}/pdf", tags=["PDF"])
async def download_sales_pdf(voucher_id: str, db=Depends(get_db)):
    from app.utils.pdf import generate_invoice_pdf
    from app.vouchers.sales.models import SalesVoucher
    from app.masters.stock.models import StockItem
    from sqlalchemy.orm import joinedload
    from fastapi import HTTPException

    voucher = (
        db.query(SalesVoucher)
        .options(
            joinedload(SalesVoucher.party),
            joinedload(SalesVoucher.line_items),
        )
        .filter(SalesVoucher.id == voucher_id)
        .first()
    )
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")

    line_items_data = []
    for line in voucher.line_items:
        stock = db.query(StockItem).filter(StockItem.id == line.stock_item_id).first()
        line_items_data.append({
            "stock_item_name": stock.name if stock else "Item",
            "quantity":        line.quantity,
            "rate":            line.rate,
            "gst_percentage":  line.gst_percentage,
            "gst_amount":      line.gst_amount,
            "total_amount":    line.total_amount,
        })

    voucher_data = {
        "voucher_number": voucher.voucher_number,
        "party_name":     voucher.party.name if voucher.party else "",
        "date":           voucher.date.strftime("%d-%m-%Y"),
        "subtotal":       voucher.subtotal,
        "total_gst":      voucher.total_gst,
        "total_amount":   voucher.total_amount,
        "line_items":     line_items_data,
    }

    pdf_bytes = generate_invoice_pdf(voucher_data)
    return Response(
        content    = pdf_bytes,
        media_type = "application/pdf",
        headers    = {
            "Content-Disposition": f"attachment; filename=invoice-{voucher.voucher_number}.pdf"
        },
    )


# ── Print Sales Invoice HTML ──
@app.get("/api/vouchers/sales/{voucher_id}/print", tags=["Print"])
async def print_sales_invoice(voucher_id: str, db=Depends(get_db)):
    from app.vouchers.sales.models import SalesVoucher
    from app.masters.stock.models import StockItem
    from sqlalchemy.orm import joinedload
    from fastapi import HTTPException
    from fastapi.responses import HTMLResponse

    voucher = (
        db.query(SalesVoucher)
        .options(
            joinedload(SalesVoucher.party),
            joinedload(SalesVoucher.line_items),
        )
        .filter(SalesVoucher.id == voucher_id)
        .first()
    )
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")

    line_items_html = ""
    for i, line in enumerate(voucher.line_items, 1):
        stock = db.query(StockItem).filter(StockItem.id == line.stock_item_id).first()
        name  = stock.name if stock else "Item"
        line_items_html += f"""
        <tr>
          <td>{i}</td>
          <td>{name}</td>
          <td>{line.quantity}</td>
          <td>Rs.{line.rate:,.2f}</td>
          <td>{line.gst_percentage}%</td>
          <td>Rs.{line.gst_amount:,.2f}</td>
          <td>Rs.{line.total_amount:,.2f}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice {voucher.voucher_number}</title>
      <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; font-size: 13px; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }}
        .company {{ font-size: 24px; font-weight: bold; color: #1a1a2e; }}
        .invoice-title {{ text-align: right; }}
        .invoice-title h2 {{ color: #4f46e5; font-size: 20px; }}
        .invoice-title p {{ color: #4f46e5; font-size: 14px; }}
        hr {{ border: 2px solid #4f46e5; margin: 16px 0; }}
        .info {{ display: flex; justify-content: space-between; margin-bottom: 24px; }}
        .info div p {{ margin-bottom: 4px; }}
        .info div .label {{ font-weight: bold; font-size: 12px; color: #555; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
        thead tr {{ background: #4f46e5; color: white; }}
        thead th {{ padding: 10px 12px; text-align: left; font-size: 12px; }}
        tbody tr:nth-child(even) {{ background: #f8f9fa; }}
        tbody td {{ padding: 9px 12px; border-bottom: 1px solid #dee2e6; font-size: 12px; }}
        .totals {{ display: flex; justify-content: flex-end; }}
        .totals table {{ width: 280px; }}
        .totals td {{ padding: 5px 10px; font-size: 13px; }}
        .grand {{ font-weight: bold; font-size: 15px; color: #4f46e5; border-top: 2px solid #4f46e5; }}
        .footer {{ margin-top: 40px; text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 16px; }}
        @media print {{ body {{ padding: 20px; }} }}
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company">Khatabook ERP</div>
          <p style="color:#888; font-size:12px;">Billing & Inventory Management</p>
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>{voucher.voucher_number}</p>
        </div>
      </div>
      <hr/>
      <div class="info">
        <div>
          <p class="label">Bill To:</p>
          <p style="font-size:15px; font-weight:bold;">
            {voucher.party.name if voucher.party else ""}
          </p>
        </div>
        <div style="text-align:right;">
          <p class="label">Invoice Details:</p>
          <p>Date: {voucher.date.strftime("%d-%m-%Y")}</p>
          <p>Voucher No: {voucher.voucher_number}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Item</th><th>Qty</th>
            <th>Rate</th><th>GST%</th><th>GST Amt</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {line_items_html}
        </tbody>
      </table>
      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right;">Rs.{voucher.subtotal:,.2f}</td>
          </tr>
          <tr>
            <td>Total GST:</td>
            <td style="text-align:right;">Rs.{voucher.total_gst:,.2f}</td>
          </tr>
          <tr class="grand">
            <td>Grand Total:</td>
            <td style="text-align:right;">Rs.{voucher.total_amount:,.2f}</td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <p>Thank you for your business! — Khatabook ERP</p>
      </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


# ── PDF Purchase Invoice ──
@app.get("/api/vouchers/purchase/{voucher_id}/pdf", tags=["PDF"])
async def download_purchase_pdf(voucher_id: str, db=Depends(get_db)):
    from app.utils.pdf import generate_invoice_pdf
    from app.vouchers.purchase.models import PurchaseVoucher
    from app.masters.stock.models import StockItem
    from sqlalchemy.orm import joinedload
    from fastapi import HTTPException

    voucher = (
        db.query(PurchaseVoucher)
        .options(
            joinedload(PurchaseVoucher.party),
            joinedload(PurchaseVoucher.line_items),
        )
        .filter(PurchaseVoucher.id == voucher_id)
        .first()
    )
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")

    line_items_data = []
    for line in voucher.line_items:
        stock = db.query(StockItem).filter(StockItem.id == line.stock_item_id).first()
        line_items_data.append({
            "stock_item_name": stock.name if stock else "Item",
            "quantity":        line.quantity,
            "rate":            line.rate,
            "gst_percentage":  line.gst_percentage,
            "gst_amount":      line.gst_amount,
            "total_amount":    line.total_amount,
        })

    voucher_data = {
        "voucher_number": voucher.voucher_number,
        "party_name":     voucher.party.name if voucher.party else "",
        "date":           voucher.date.strftime("%d-%m-%Y"),
        "subtotal":       voucher.subtotal,
        "total_gst":      voucher.total_gst,
        "total_amount":   voucher.total_amount,
        "line_items":     line_items_data,
    }

    pdf_bytes = generate_invoice_pdf(voucher_data)
    return Response(
        content    = pdf_bytes,
        media_type = "application/pdf",
        headers    = {
            "Content-Disposition": f"attachment; filename=purchase-{voucher.voucher_number}.pdf"
        },
    )


# ── Reports ──────────────────────────────────────

@app.get("/api/reports/stock-summary", tags=["Reports"])
async def stock_summary(
    db          = Depends(get_db),
    credentials = Depends(security),
):
    from app.auth.utils import decode_token
    from app.masters.stock.models import StockItem
    from fastapi import HTTPException

    token   = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    items   = db.query(StockItem).filter(StockItem.user_id == user_id).all()

    result = []
    for item in items:
        stock_value = item.current_stock * item.purchase_rate
        result.append({
            "id":             str(item.id),
            "name":           item.name,
            "sku":            item.sku,
            "unit":           item.unit,
            "opening_stock":  item.opening_stock,
            "current_stock":  item.current_stock,
            "purchase_rate":  item.purchase_rate,
            "selling_rate":   item.selling_rate,
            "stock_value":    round(stock_value, 2),
            "gst_percentage": item.gst_percentage,
            "status":         "low"  if item.current_stock <= 5
                              else "ok" if item.current_stock <= 10
                              else "good",
        })

    total_value     = sum(r["stock_value"] for r in result)
    low_stock_count = sum(1 for r in result if r["status"] == "low")

    return success_response(data={
        "items":           result,
        "total_value":     round(total_value, 2),
        "total_items":     len(result),
        "low_stock_count": low_stock_count,
    })


@app.get("/api/reports/sales-register", tags=["Reports"])
async def sales_register(
    db          = Depends(get_db),
    credentials = Depends(security),
):
    from app.auth.utils import decode_token
    from app.vouchers.sales.models import SalesVoucher
    from sqlalchemy.orm import joinedload
    from fastapi import HTTPException

    token   = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id  = payload.get("sub")
    vouchers = (
        db.query(SalesVoucher)
        .options(joinedload(SalesVoucher.party))
        .filter(SalesVoucher.user_id == user_id)
        .order_by(SalesVoucher.date.desc())
        .all()
    )

    result = []
    for v in vouchers:
        result.append({
            "id":             str(v.id),
            "voucher_number": v.voucher_number,
            "date":           v.date.strftime("%d-%m-%Y"),
            "party_name":     v.party.name if v.party else "",
            "subtotal":       v.subtotal,
            "total_gst":      v.total_gst,
            "total_amount":   v.total_amount,
        })

    total_sales = sum(r["total_amount"] for r in result)
    total_gst   = sum(r["total_gst"]    for r in result)

    return success_response(data={
        "vouchers":    result,
        "total_sales": round(total_sales, 2),
        "total_gst":   round(total_gst,   2),
        "count":       len(result),
    })


@app.get("/api/reports/purchase-register", tags=["Reports"])
async def purchase_register(
    db          = Depends(get_db),
    credentials = Depends(security),
):
    from app.auth.utils import decode_token
    from app.vouchers.purchase.models import PurchaseVoucher
    from sqlalchemy.orm import joinedload
    from fastapi import HTTPException

    token   = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id  = payload.get("sub")
    vouchers = (
        db.query(PurchaseVoucher)
        .options(joinedload(PurchaseVoucher.party))
        .filter(PurchaseVoucher.user_id == user_id)
        .order_by(PurchaseVoucher.date.desc())
        .all()
    )

    result = []
    for v in vouchers:
        result.append({
            "id":             str(v.id),
            "voucher_number": v.voucher_number,
            "date":           v.date.strftime("%d-%m-%Y"),
            "party_name":     v.party.name if v.party else "",
            "subtotal":       v.subtotal,
            "total_gst":      v.total_gst,
            "total_amount":   v.total_amount,
        })

    total_purchases = sum(r["total_amount"] for r in result)
    total_gst       = sum(r["total_gst"]    for r in result)

    return success_response(data={
        "vouchers":        result,
        "total_purchases": round(total_purchases, 2),
        "total_gst":       round(total_gst,       2),
        "count":           len(result),
    })


# ── Ledger Statement ──
@app.get("/api/masters/ledgers/{ledger_id}/statement", tags=["Reports"])
async def ledger_statement(
    ledger_id:  str,
    db          = Depends(get_db),
    credentials = Depends(security),
):
    from app.auth.utils import decode_token
    from app.masters.ledger.models import Ledger
    from app.vouchers.sales.models import SalesVoucher
    from app.vouchers.purchase.models import PurchaseVoucher
    from app.vouchers.payment.models import PaymentVoucher
    from fastapi import HTTPException

    token   = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    ledger  = db.query(Ledger).filter(
        Ledger.id      == ledger_id,
        Ledger.user_id == user_id,
    ).first()

    if not ledger:
        raise HTTPException(status_code=404, detail="Ledger not found")

    transactions = []

    # Sales
    sales = (
        db.query(SalesVoucher)
        .filter(
            SalesVoucher.party_id == ledger_id,
            SalesVoucher.user_id  == user_id,
        )
        .order_by(SalesVoucher.date)
        .all()
    )
    for s in sales:
        transactions.append({
            "date":           s.date.strftime("%d-%m-%Y"),
            "voucher_number": s.voucher_number,
            "type":           "Sales",
            "debit":          s.total_amount,
            "credit":         0,
            "amount":         s.total_amount,
        })

    # Purchases
    purchases = (
        db.query(PurchaseVoucher)
        .filter(
            PurchaseVoucher.party_id == ledger_id,
            PurchaseVoucher.user_id  == user_id,
        )
        .order_by(PurchaseVoucher.date)
        .all()
    )
    for p in purchases:
        transactions.append({
            "date":           p.date.strftime("%d-%m-%Y"),
            "voucher_number": p.voucher_number,
            "type":           "Purchase",
            "debit":          0,
            "credit":         p.total_amount,
            "amount":         p.total_amount,
        })

    # Payments made to this party
    payments = (
        db.query(PaymentVoucher)
        .filter(
            PaymentVoucher.party_id == ledger_id,
            PaymentVoucher.user_id  == user_id,
        )
        .order_by(PaymentVoucher.date)
        .all()
    )
    for pay in payments:
        transactions.append({
            "date":           pay.date.strftime("%d-%m-%Y"),
            "voucher_number": pay.voucher_number,
            "type":           "Payment",
            "debit":          0,
            "credit":         pay.amount,
            "amount":         pay.amount,
        })

    # Payments from this ledger (bank/cash)
    payments_from = (
        db.query(PaymentVoucher)
        .filter(
            PaymentVoucher.paid_from_id == ledger_id,
            PaymentVoucher.user_id      == user_id,
        )
        .order_by(PaymentVoucher.date)
        .all()
    )
    for pay in payments_from:
        transactions.append({
            "date":           pay.date.strftime("%d-%m-%Y"),
            "voucher_number": pay.voucher_number,
            "type":           "Payment Out",
            "debit":          pay.amount,
            "credit":         0,
            "amount":         pay.amount,
        })

    # Sort by date
    transactions.sort(key=lambda x: x["date"])

    # Running balance
    balance = ledger.opening_balance
    for t in transactions:
        if t["type"] in ["Sales", "Payment Out"]:
            balance += t["debit"]
        else:
            balance += t["credit"]
        t["running_balance"] = round(balance, 2)

    return success_response(data={
        "ledger": {
            "id":              str(ledger.id),
            "name":            ledger.name,
            "type":            ledger.type,
            "opening_balance": ledger.opening_balance,
            "current_balance": ledger.current_balance,
        },
        "transactions": transactions,
        "total_debit":  round(sum(t["debit"]  for t in transactions), 2),
        "total_credit": round(sum(t["credit"] for t in transactions), 2),
    })