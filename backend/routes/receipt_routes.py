from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import ReceiptCreate, ReceiptResponse
from services.inventory_service import create_receipt, get_receipts, validate_receipt

router = APIRouter(prefix="/receipts", tags=["Receipts"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[ReceiptResponse])
def read_receipts(db: Session = Depends(get_db)):
    return get_receipts(db)

@router.post("", response_model=ReceiptResponse)
def add_receipt(receipt: ReceiptCreate, db: Session = Depends(get_db)):
    return create_receipt(db, receipt)

@router.put("/{receipt_id}/validate", response_model=ReceiptResponse)
def confirm_receipt(receipt_id: int, db: Session = Depends(get_db)):
    return validate_receipt(db, receipt_id)
