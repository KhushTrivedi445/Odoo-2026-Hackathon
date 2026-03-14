from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import DeliveryCreate, DeliveryResponse
from services.inventory_service import create_delivery, get_deliveries, validate_delivery

router = APIRouter(prefix="/deliveries", tags=["Deliveries"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[DeliveryResponse])
def read_deliveries(db: Session = Depends(get_db)):
    return get_deliveries(db)

@router.post("", response_model=DeliveryResponse)
def add_delivery(delivery: DeliveryCreate, db: Session = Depends(get_db)):
    return create_delivery(db, delivery)

@router.put("/{delivery_id}/validate", response_model=DeliveryResponse)
def confirm_delivery(delivery_id: int, db: Session = Depends(get_db)):
    return validate_delivery(db, delivery_id)
