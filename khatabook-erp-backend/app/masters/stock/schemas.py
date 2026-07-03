from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.masters.stock.models import UnitType


class CreateStockItemRequest(BaseModel):
    name:           str
    sku:            str
    hsn_code:       Optional[str]   = None
    unit:           UnitType        = UnitType.PCS
    purchase_rate:  float           = 0.0
    selling_rate:   float           = 0.0
    opening_stock:  Optional[float] = 0.0
    gst_percentage: float           = 18.0


class UpdateStockItemRequest(BaseModel):
    name:           Optional[str]      = None
    sku:            Optional[str]      = None
    hsn_code:       Optional[str]      = None
    unit:           Optional[UnitType] = None
    purchase_rate:  Optional[float]    = None
    selling_rate:   Optional[float]    = None
    opening_stock:  Optional[float]    = None
    gst_percentage: Optional[float]    = None


class StockItemResponse(BaseModel):
    id:             uuid.UUID
    name:           str
    sku:            str
    hsn_code:       Optional[str]
    unit:           UnitType
    purchase_rate:  float
    selling_rate:   float
    opening_stock:  float
    current_stock:  float
    gst_percentage: float
    created_at:     datetime
    updated_at:     datetime

    class Config:
        from_attributes = True