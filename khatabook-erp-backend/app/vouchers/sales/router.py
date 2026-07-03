from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.router import get_current_user
from app.vouchers.sales import service
from app.vouchers.sales.schemas import CreateSalesVoucherRequest, SalesVoucherResponse
from app.utils.responses import success_response

router = APIRouter()


@router.get("")
def list_sales(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vouchers = service.get_all(db, str(current_user.id))
    return success_response(data=[SalesVoucherResponse.model_validate(v) for v in vouchers], message="Sales vouchers fetched")


@router.post("", status_code=201)
def create_sales(data: CreateSalesVoucherRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    voucher = service.create(db, data, str(current_user.id))
    return success_response(data=SalesVoucherResponse.model_validate(voucher), message="Sales voucher created")


@router.get("/{voucher_id}")
def get_sales(voucher_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    voucher = service.get_by_id(db, voucher_id, str(current_user.id))
    return success_response(data=SalesVoucherResponse.model_validate(voucher), message="Sales voucher fetched")
