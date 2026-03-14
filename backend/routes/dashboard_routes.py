from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import StockMovementResponse
from services.inventory_service import get_dashboard_metrics, get_stock_movements

# We put /dashboard and /stock-movements here for simplicity
router = APIRouter(dependencies=[Depends(JWTBearer())], tags=["Dashboard"])

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)

@router.get("/stock-movements", response_model=List[StockMovementResponse])
def read_stock_movements(db: Session = Depends(get_db)):
    return get_stock_movements(db)
