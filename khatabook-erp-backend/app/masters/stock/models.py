from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class UnitType(str, enum.Enum):
    PCS  = "PCS"
    BOX  = "BOX"
    KG   = "KG"
    LTR  = "LTR"
    PACK = "PACK"


class StockItem(Base):
    __tablename__ = "stock_items"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name           = Column(String(200), nullable=False)
    sku            = Column(String(100), nullable=False)
    hsn_code       = Column(String(20),  nullable=True)
    unit           = Column(Enum(UnitType), nullable=False, default=UnitType.PCS)
    purchase_rate  = Column(Float, default=0.0)
    selling_rate   = Column(Float, default=0.0)
    opening_stock  = Column(Float, default=0.0)
    current_stock  = Column(Float, default=0.0)
    gst_percentage = Column(Float, default=18.0)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())