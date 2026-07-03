from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.auth.router import get_current_user
from app.masters.ledger import service
from app.masters.ledger.schemas import CreateLedgerRequest, UpdateLedgerRequest, LedgerResponse
from app.utils.responses import success_response

router = APIRouter()


@router.get("")
def list_ledgers(
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ledgers = service.get_all(db, str(current_user.id), type)
    return success_response(
        data=[LedgerResponse.model_validate(l) for l in ledgers],
        message="Ledgers fetched",
    )


@router.post("", status_code=201)
def create_ledger(
    data: CreateLedgerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ledger = service.create(db, data, str(current_user.id))
    return success_response(
        data=LedgerResponse.model_validate(ledger),
        message="Ledger created",
    )


@router.get("/{ledger_id}")
def get_ledger(
    ledger_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ledger = service.get_by_id(db, ledger_id, str(current_user.id))
    return success_response(
        data=LedgerResponse.model_validate(ledger),
        message="Ledger fetched",
    )


@router.put("/{ledger_id}")
def update_ledger(
    ledger_id: str,
    data: UpdateLedgerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    ledger = service.update(db, ledger_id, data, str(current_user.id))
    return success_response(
        data=LedgerResponse.model_validate(ledger),
        message="Ledger updated",
    )


@router.delete("/{ledger_id}")
def delete_ledger(
    ledger_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = service.delete(db, ledger_id, str(current_user.id))
    return success_response(data=result, message="Ledger deleted")