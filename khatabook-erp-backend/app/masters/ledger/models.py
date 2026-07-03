from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class LedgerType(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    SUPPLIER = "SUPPLIER"
    EXPENSE  = "EXPENSE"
    INCOME   = "INCOME"
    BANK     = "BANK"
    CASH     = "CASH"


class Ledger(Base):
    __tablename__ = "ledgers"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name            = Column(String(200), nullable=False)
    type            = Column(Enum(LedgerType), nullable=False)
    phone           = Column(String(20),  nullable=True)
    email           = Column(String(255), nullable=True)
    address         = Column(Text,        nullable=True)
    gst_number      = Column(String(20),  nullable=True)
    opening_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())