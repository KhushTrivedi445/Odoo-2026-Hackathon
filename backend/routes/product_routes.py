from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import ProductCreate, ProductResponse
from services.inventory_service import create_product, get_products, delete_product

router = APIRouter(prefix="/products", tags=["Products"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return get_products(db)

@router.post("", response_model=ProductResponse)
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product)

@router.delete("/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db)):
    delete_product(db, product_id)
    return {"message": "Product deleted successfully"}
