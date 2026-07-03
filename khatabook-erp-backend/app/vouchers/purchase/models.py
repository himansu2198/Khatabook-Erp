from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class PurchaseVoucher(Base):
    __tablename__ = "purchase_vouchers"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"),   nullable=False)
    party_id       = Column(UUID(as_uuid=True), ForeignKey("ledgers.id"), nullable=False)
    voucher_number = Column(String(50), nullable=False)
    date           = Column(DateTime(timezone=True), nullable=False)
    subtotal       = Column(Float, default=0.0)
    total_gst      = Column(Float, default=0.0)
    total_amount   = Column(Float, default=0.0)
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    line_items = relationship("PurchaseLineItem", back_populates="voucher", cascade="all, delete")
    party      = relationship("Ledger", foreign_keys=[party_id])


class PurchaseLineItem(Base):
    __tablename__ = "purchase_line_items"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voucher_id     = Column(UUID(as_uuid=True), ForeignKey("purchase_vouchers.id"), nullable=False)
    stock_item_id  = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"),       nullable=False)
    quantity       = Column(Float, nullable=False)
    rate           = Column(Float, nullable=False)
    amount         = Column(Float, nullable=False)
    gst_percentage = Column(Float, default=0.0)
    gst_amount     = Column(Float, default=0.0)
    total_amount   = Column(Float, nullable=False)

    voucher    = relationship("PurchaseVoucher", back_populates="line_items")
    stock_item = relationship("StockItem", foreign_keys=[stock_item_id])
