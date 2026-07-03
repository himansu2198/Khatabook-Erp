from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.router import get_current_user
from app.vouchers.purchase import service
from app.vouchers.purchase.schemas import CreatePurchaseVoucherRequest, PurchaseVoucherResponse
from app.utils.responses import success_response

router = APIRouter()


@router.get("")
def list_purchases(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vouchers = service.get_all(db, str(current_user.id))
    return success_response(data=[PurchaseVoucherResponse.model_validate(v) for v in vouchers], message="Purchase vouchers fetched")


@router.post("", status_code=201)
def create_purchase(data: CreatePurchaseVoucherRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    voucher = service.create(db, data, str(current_user.id))
    return success_response(data=PurchaseVoucherResponse.model_validate(voucher), message="Purchase voucher created")


@router.get("/{voucher_id}")
def get_purchase(voucher_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    voucher = service.get_by_id(db, voucher_id, str(current_user.id))
    return success_response(data=PurchaseVoucherResponse.model_validate(voucher), message="Purchase voucher fetched")
