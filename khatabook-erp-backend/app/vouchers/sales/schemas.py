from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class LineItemRequest(BaseModel):
    stock_item_id:  str
    quantity:       float
    rate:           float
    amount:         float
    gst_percentage: float = 0.0


class CreateSalesVoucherRequest(BaseModel):
    party_id:   str
    date:       str
    notes:      Optional[str] = None
    line_items: List[LineItemRequest]


class LineItemResponse(BaseModel):
    id:              uuid.UUID
    stock_item_id:   uuid.UUID
    stock_item_name: Optional[str] = None
    quantity:        float
    rate:            float
    amount:          float
    gst_percentage:  float
    gst_amount:      float
    total_amount:    float

    class Config:
        from_attributes = True


class SalesVoucherResponse(BaseModel):
    id:             uuid.UUID
    voucher_number: str
    party_id:       uuid.UUID
    party_name:     Optional[str] = None
    date:           datetime
    subtotal:       float
    total_gst:      float
    total_amount:   float
    notes:          Optional[str]
    line_items:     List[LineItemResponse]
    created_at:     datetime

    class Config:
        from_attributes = True
