from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional

from app.masters.ledger.models import Ledger
from app.masters.ledger.schemas import CreateLedgerRequest, UpdateLedgerRequest


def get_all(db: Session, user_id: str, ledger_type: Optional[str] = None):
    query = db.query(Ledger).filter(Ledger.user_id == user_id)
    if ledger_type:
        query = query.filter(Ledger.type == ledger_type)
    return query.order_by(Ledger.name).all()


def get_by_id(db: Session, ledger_id: str, user_id: str) -> Ledger:
    ledger = db.query(Ledger).filter(
        Ledger.id == ledger_id,
        Ledger.user_id == user_id,
    ).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="Ledger not found")
    return ledger


def create(db: Session, data: CreateLedgerRequest, user_id: str) -> Ledger:
    ledger = Ledger(
        user_id         = user_id,
        name            = data.name,
        type            = data.type,
        phone           = data.phone,
        email           = data.email,
        address         = data.address,
        gst_number      = data.gst_number,
        opening_balance = data.opening_balance or 0.0,
        current_balance = data.opening_balance or 0.0,
    )
    db.add(ledger)
    db.commit()
    db.refresh(ledger)
    return ledger


def update(db: Session, ledger_id: str, data: UpdateLedgerRequest, user_id: str) -> Ledger:
    ledger = get_by_id(db, ledger_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ledger, field, value)
    db.commit()
    db.refresh(ledger)
    return ledger


def delete(db: Session, ledger_id: str, user_id: str):
    ledger = get_by_id(db, ledger_id, user_id)
    db.delete(ledger)
    db.commit()
    return {"message": "Ledger deleted"}