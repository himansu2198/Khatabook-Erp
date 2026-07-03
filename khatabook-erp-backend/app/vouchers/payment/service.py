# app/vouchers/payment/service.py

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.vouchers.payment.models import PaymentVoucher
from app.vouchers.payment.schemas import CreatePaymentRequest
from app.masters.ledger.models import Ledger
from datetime import date, datetime


def get_next_voucher_number(db: Session, user_id: str) -> str:
    count = db.query(PaymentVoucher).filter(
        PaymentVoucher.user_id == user_id
    ).count()
    return f"PAY-{str(count + 1).zfill(4)}"


def get_all(db: Session, user_id: str):
    return (
        db.query(PaymentVoucher)
        .filter(PaymentVoucher.user_id == user_id)
        .order_by(PaymentVoucher.date.desc())
        .all()
    )


def get_by_id(db: Session, voucher_id: str, user_id: str):
    v = db.query(PaymentVoucher).filter(
        PaymentVoucher.id      == uuid.UUID(voucher_id),
        PaymentVoucher.user_id == user_id,
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Payment voucher not found")
    return v


def create(db: Session, data: CreatePaymentRequest, user_id: str):
    # Validate party ledger
    party = db.query(Ledger).filter(
        Ledger.id      == uuid.UUID(data.party_id),
        Ledger.user_id == user_id,
    ).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party ledger not found")

    # Validate paid from ledger
    paid_from = db.query(Ledger).filter(
        Ledger.id      == uuid.UUID(data.paid_from_id),
        Ledger.user_id == user_id,
    ).first()
    if not paid_from:
        raise HTTPException(status_code=404, detail="Paid from ledger not found")

    voucher_number = get_next_voucher_number(db, user_id)

    # Parse date safely
    if data.date:
        try:
            parsed_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        except Exception:
            parsed_date = date.today()
    else:
        parsed_date = date.today()

    voucher = PaymentVoucher(
        user_id        = user_id,
        voucher_number = voucher_number,
        date           = parsed_date,
        party_id       = uuid.UUID(data.party_id),
        paid_from_id   = uuid.UUID(data.paid_from_id),
        amount         = data.amount,
        payment_mode   = data.payment_mode,
        narration      = data.narration or "",
    )
    db.add(voucher)

    # Reduce party balance
    party.current_balance = max(0, party.current_balance - data.amount)

    # Reduce bank/cash balance
    paid_from.current_balance = paid_from.current_balance - data.amount

    db.commit()
    db.refresh(voucher)
    return voucher


def delete(db: Session, voucher_id: str, user_id: str):
    voucher = get_by_id(db, voucher_id, user_id)
    db.delete(voucher)
    db.commit()
    return {"message": "Payment voucher deleted"}