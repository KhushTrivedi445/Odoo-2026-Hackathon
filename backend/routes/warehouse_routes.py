from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import WarehouseCreate, WarehouseResponse
from services.inventory_service import create_warehouse, get_warehouses, delete_warehouse

router = APIRouter(prefix="/warehouses", tags=["Warehouses"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[WarehouseResponse])
def read_warehouses(db: Session = Depends(get_db)):
    return get_warehouses(db)

@router.post("", response_model=WarehouseResponse)
def add_warehouse(warehouse: WarehouseCreate, db: Session = Depends(get_db)):
    return create_warehouse(db, warehouse)

@router.delete("/{warehouse_id}")
def remove_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    delete_warehouse(db, warehouse_id)
    return {"message": "Warehouse deleted successfully"}
