# app/vouchers/payment/models.py

import uuid
from sqlalchemy import Column, String, Float, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.database import Base
from datetime import date


class PaymentVoucher(Base):
    __tablename__ = "payment_vouchers"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(String,             nullable=False)
    voucher_number = Column(String,             nullable=False, unique=True)
    date           = Column(Date,               default=date.today)
    party_id       = Column(UUID(as_uuid=True), ForeignKey("ledgers.id"),  nullable=True)
    paid_from_id   = Column(UUID(as_uuid=True), ForeignKey("ledgers.id"),  nullable=True)
    amount         = Column(Float,              default=0.0)
    payment_mode   = Column(String,             default="CASH")
    narration      = Column(Text,               nullable=True)

    party     = relationship("Ledger", foreign_keys=[party_id])
    paid_from = relationship("Ledger", foreign_keys=[paid_from_id])