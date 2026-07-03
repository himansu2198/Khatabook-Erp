from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.router import get_current_user
from app.masters.stock import service
from app.masters.stock.schemas import CreateStockItemRequest, UpdateStockItemRequest, StockItemResponse
from app.utils.responses import success_response

router = APIRouter()


@router.get("")
def list_items(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    items = service.get_all(db, str(current_user.id))
    return success_response(
        data=[StockItemResponse.model_validate(i) for i in items],
        message="Stock items fetched",
    )


@router.post("", status_code=201)
def create_item(
    data: CreateStockItemRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = service.create(db, data, str(current_user.id))
    return success_response(
        data=StockItemResponse.model_validate(item),
        message="Stock item created",
    )


@router.get("/{item_id}")
def get_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = service.get_by_id(db, item_id, str(current_user.id))
    return success_response(
        data=StockItemResponse.model_validate(item),
        message="Stock item fetched",
    )


@router.put("/{item_id}")
def update_item(
    item_id: str,
    data: UpdateStockItemRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = service.update(db, item_id, data, str(current_user.id))
    return success_response(
        data=StockItemResponse.model_validate(item),
        message="Stock item updated",
    )


@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = service.delete(db, item_id, str(current_user.id))
    return success_response(data=result, message="Stock item deleted")