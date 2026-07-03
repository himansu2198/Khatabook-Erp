# app/vouchers/payment/router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.utils import decode_token
from app.vouchers.payment import service
from app.vouchers.payment.schemas import CreatePaymentRequest
from app.utils.responses import success_response
from fastapi.security import HTTPBearer
from fastapi import HTTPException

router   = APIRouter()
security = HTTPBearer()


def get_user(credentials=Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")


@router.get("")
@router.get("/")
def list_payments(
    db      = Depends(get_db),
    user_id = Depends(get_user),
):
    data = service.get_all(db, user_id)
    return success_response(data=[{
        "id":             str(v.id),
        "voucher_number": v.voucher_number,
        "date":           v.date.strftime("%d-%m-%Y"),
        "party_name":     v.party.name     if v.party     else "",
        "paid_from_name": v.paid_from.name if v.paid_from else "",
        "amount":         v.amount,
        "payment_mode":   v.payment_mode,
        "narration":      v.narration or "",
    } for v in data])


@router.post("")
@router.post("/")
def create_payment(
    data    : CreatePaymentRequest,
    db      = Depends(get_db),
    user_id = Depends(get_user),
):
    v = service.create(db, data, user_id)
    return success_response(data={
        "id":             str(v.id),
        "voucher_number": v.voucher_number,
        "amount":         v.amount,
    })


@router.get("/{voucher_id}")
def get_payment(
    voucher_id: str,
    db         = Depends(get_db),
    user_id    = Depends(get_user),
):
    v = service.get_by_id(db, voucher_id, user_id)
    return success_response(data={
        "id":             str(v.id),
        "voucher_number": v.voucher_number,
        "date":           v.date.strftime("%d-%m-%Y"),
        "party_name":     v.party.name     if v.party     else "",
        "paid_from_name": v.paid_from.name if v.paid_from else "",
        "amount":         v.amount,
        "payment_mode":   v.payment_mode,
        "narration":      v.narration or "",
    })


@router.delete("/{voucher_id}")
def delete_payment(
    voucher_id: str,
    db         = Depends(get_db),
    user_id    = Depends(get_user),
):
    return service.delete(db, voucher_id, user_id)