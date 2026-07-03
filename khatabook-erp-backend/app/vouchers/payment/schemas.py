# app/vouchers/payment/schemas.py

from pydantic import BaseModel
from typing import Optional
from datetime import date


class CreatePaymentRequest(BaseModel):
    party_id:     str
    paid_from_id: str
    amount:       float
    payment_mode: str           = "CASH"
    narration:    Optional[str] = None
    date:         Optional[str] = None  # ← change date to str


class UpdatePaymentRequest(BaseModel):
    narration: Optional[str] = None