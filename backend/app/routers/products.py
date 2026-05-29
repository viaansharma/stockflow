from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    search: Optional[str] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%") |
            models.Product.sku.ilike(f"%{search}%")
        )
    if low_stock:
        query = query.filter(models.Product.stock_quantity <= 10)
    return query.offset(skip).limit(limit).all()


@router.get("/stats/categories")
def list_categories(db: Session = Depends(get_db)):
    from sqlalchemy import func, distinct
    categories = db.query(models.Product.category).filter(
        models.Product.category.isnot(None)
    ).distinct().all()
    return [c[0] for c in categories]


@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=schemas.ProductResponse, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{product.sku}' already exists")
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Check if product is part of any order
    order_item = db.query(models.OrderItem).filter(
        models.OrderItem.product_id == product_id
    ).first()
    if order_item:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product that is part of existing orders"
        )
    db.delete(product)
    db.commit()
    return None
