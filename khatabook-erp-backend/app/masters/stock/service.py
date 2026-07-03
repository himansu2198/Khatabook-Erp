# app/masters/stock/service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.masters.stock.models import StockItem
from app.masters.stock.schemas import CreateStockItemRequest, UpdateStockItemRequest


def get_all(db: Session, user_id: str):
    return db.query(StockItem).filter(
        StockItem.user_id == user_id
    ).order_by(StockItem.name).all()


def get_by_id(db: Session, item_id: str, user_id: str) -> StockItem:
    item = db.query(StockItem).filter(
        StockItem.id      == item_id,
        StockItem.user_id == user_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return item


def create(db: Session, data: CreateStockItemRequest, user_id: str) -> StockItem:
    item = StockItem(
        user_id        = user_id,
        name           = data.name,
        sku            = data.sku,
        hsn_code       = data.hsn_code,
        unit           = data.unit,
        purchase_rate  = data.purchase_rate,
        selling_rate   = data.selling_rate,
        opening_stock  = data.opening_stock or 0.0,
        current_stock  = data.opening_stock or 0.0,
        gst_percentage = data.gst_percentage,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update(db: Session, item_id: str, data: UpdateStockItemRequest, user_id: str) -> StockItem:
    item = get_by_id(db, item_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete(db: Session, item_id: str, user_id: str):
    item = get_by_id(db, item_id, user_id)

    # Check if item is used in any voucher
    from app.vouchers.sales.models import SalesLineItem
    from app.vouchers.purchase.models import PurchaseLineItem

    sales_count = db.query(SalesLineItem).filter(
        SalesLineItem.stock_item_id == item_id
    ).count()

    purchase_count = db.query(PurchaseLineItem).filter(
        PurchaseLineItem.stock_item_id == item_id
    ).count()

    if sales_count > 0 or purchase_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete — item is used in {sales_count} sale(s) and {purchase_count} purchase(s)"
        )

    db.delete(item)
    db.commit()
    return {"message": "Stock item deleted"}


def update_stock_quantity(db: Session, item_id: str, qty_change: float):
    """Called by vouchers to update stock in/out"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if item:
        item.current_stock = max(0, item.current_stock + qty_change)
        db.commit()