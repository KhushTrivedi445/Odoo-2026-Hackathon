from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import AdjustmentCreate, AdjustmentResponse
from services.inventory_service import create_adjustment, get_adjustments, apply_adjustment

router = APIRouter(prefix="/adjustments", tags=["Adjustments"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[AdjustmentResponse])
def read_adjustments(db: Session = Depends(get_db)):
    return get_adjustments(db)

@router.post("", response_model=AdjustmentResponse)
def add_adjustment(adjustment: AdjustmentCreate, db: Session = Depends(get_db)):
    return create_adjustment(db, adjustment)

@router.put("/{adjustment_id}/apply", response_model=AdjustmentResponse)
def confirm_adjustment(adjustment_id: int, db: Session = Depends(get_db)):
    return apply_adjustment(db, adjustment_id)
