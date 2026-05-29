from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[models.OrderStatus] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
    )
    if status:
        query = query.filter(models.Order.status == status)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/stats/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func

    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    pending_orders = db.query(models.Order).filter(
        models.Order.status == models.OrderStatus.pending
    ).count()
    low_stock_products = db.query(models.Product).filter(
        models.Product.stock_quantity <= 10
    ).count()
    revenue_result = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.status != models.OrderStatus.cancelled
    ).scalar()
    total_revenue = float(revenue_result) if revenue_result else 0.0

    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        pending_orders=pending_orders,
        low_stock_products=low_stock_products,
        total_revenue=total_revenue,
    )


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(models.Customer).filter(
        models.Customer.id == order_data.customer_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate all products and check stock
    total_amount = 0.0
    items_to_create = []

    for item in order_data.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).with_for_update().first()  # Lock row to prevent race conditions

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {item.product_id} not found"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}' (SKU: {product.sku}). "
                    f"Requested: {item.quantity}, Available: {product.stock_quantity}"
                ),
            )

        items_to_create.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
        })
        total_amount += product.price * item.quantity

    # Create order
    db_order = models.Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        notes=order_data.notes,
        status=models.OrderStatus.pending,
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing

    # Create order items and reduce stock
    for item_data in items_to_create:
        order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
        )
        db.add(order_item)
        # Reduce stock
        item_data["product"].stock_quantity -= item_data["quantity"]

    db.commit()

    # Reload with relationships
    db.refresh(db_order)
    return get_order(db_order.id, db)


@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    new_status = status_update.status

    # If cancelling an order, restore stock
    if new_status == models.OrderStatus.cancelled and old_status != models.OrderStatus.cancelled:
        for item in order.items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            if product:
                product.stock_quantity += item.quantity

    order.status = new_status
    db.commit()
    db.refresh(order)
    return get_order(order_id, db)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in [models.OrderStatus.pending, models.OrderStatus.cancelled]:
        raise HTTPException(
            status_code=400,
            detail="Only pending or cancelled orders can be deleted"
        )

    # Restore stock if not already cancelled
    if order.status != models.OrderStatus.cancelled:
        for item in order.items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            if product:
                product.stock_quantity += item.quantity

    db.delete(order)
    db.commit()
    return None
