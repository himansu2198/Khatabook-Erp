from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime, timezone

from app.vouchers.purchase.models import PurchaseVoucher, PurchaseLineItem
from app.vouchers.purchase.schemas import CreatePurchaseVoucherRequest
from app.masters.ledger.models import Ledger
from app.masters.stock.service import update_stock_quantity


def get_all(db: Session, user_id: str):
    vouchers = (
        db.query(PurchaseVoucher)
        .options(joinedload(PurchaseVoucher.party), joinedload(PurchaseVoucher.line_items))
        .filter(PurchaseVoucher.user_id == user_id)
        .order_by(PurchaseVoucher.created_at.desc())
        .all()
    )
    for v in vouchers:
        v.party_name = v.party.name if v.party else None
    return vouchers


def get_by_id(db: Session, voucher_id: str, user_id: str):
    v = (
        db.query(PurchaseVoucher)
        .options(joinedload(PurchaseVoucher.party), joinedload(PurchaseVoucher.line_items))
        .filter(PurchaseVoucher.id == voucher_id, PurchaseVoucher.user_id == user_id)
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="Purchase voucher not found")
    v.party_name = v.party.name if v.party else None
    return v


def create(db: Session, data: CreatePurchaseVoucherRequest, user_id: str):
    count = db.query(PurchaseVoucher).filter(PurchaseVoucher.user_id == user_id).count()
    v_num = f"PUR-{str(count + 1).zfill(4)}"
    try:
        v_date = datetime.strptime(data.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        v_date = datetime.now(timezone.utc)

    subtotal     = sum(l.amount for l in data.line_items)
    total_gst    = sum((l.amount * l.gst_percentage / 100) for l in data.line_items)
    total_amount = subtotal + total_gst

    voucher = PurchaseVoucher(
        user_id=user_id, party_id=data.party_id, voucher_number=v_num,
        date=v_date, subtotal=round(subtotal, 2),
        total_gst=round(total_gst, 2), total_amount=round(total_amount, 2), notes=data.notes,
    )
    db.add(voucher)
    db.flush()

    for l in data.line_items:
        gst_amount = round(l.amount * l.gst_percentage / 100, 2)
        line = PurchaseLineItem(
            voucher_id=voucher.id, stock_item_id=l.stock_item_id,
            quantity=l.quantity, rate=l.rate, amount=l.amount,
            gst_percentage=l.gst_percentage, gst_amount=gst_amount,
            total_amount=round(l.amount + gst_amount, 2),
        )
        db.add(line)
        update_stock_quantity(db, l.stock_item_id, +l.quantity)

    party = db.query(Ledger).filter(Ledger.id == data.party_id).first()
    if party:
        party.current_balance += round(total_amount, 2)

    db.commit()
    db.refresh(voucher)
    voucher.party_name = voucher.party.name if voucher.party else None
    return voucher
