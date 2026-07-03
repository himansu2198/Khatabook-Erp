from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.masters.ledger.models import LedgerType


class CreateLedgerRequest(BaseModel):
    name:            str
    type:            LedgerType
    phone:           Optional[str]   = None
    email:           Optional[str]   = None
    address:         Optional[str]   = None
    gst_number:      Optional[str]   = None
    opening_balance: Optional[float] = 0.0


class UpdateLedgerRequest(BaseModel):
    name:            Optional[str]        = None
    type:            Optional[LedgerType] = None
    phone:           Optional[str]        = None
    email:           Optional[str]        = None
    address:         Optional[str]        = None
    gst_number:      Optional[str]        = None
    opening_balance: Optional[float]      = None


class LedgerResponse(BaseModel):
    id:              uuid.UUID
    name:            str
    type:            LedgerType
    phone:           Optional[str]
    email:           Optional[str]
    address:         Optional[str]
    gst_number:      Optional[str]
    opening_balance: float
    current_balance: float
    created_at:      datetime
    updated_at:      datetime

    class Config:
        from_attributes = True