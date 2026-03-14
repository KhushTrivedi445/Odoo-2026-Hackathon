from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from utils.jwt_handler import JWTBearer
from schemas.inventory_schema import TransferCreate, TransferResponse
from services.inventory_service import create_transfer, get_transfers, confirm_transfer

router = APIRouter(prefix="/transfers", tags=["Transfers"], dependencies=[Depends(JWTBearer())])

@router.get("", response_model=List[TransferResponse])
def read_transfers(db: Session = Depends(get_db)):
    return get_transfers(db)

@router.post("", response_model=TransferResponse)
def add_transfer(transfer: TransferCreate, db: Session = Depends(get_db)):
    return create_transfer(db, transfer)

@router.put("/{transfer_id}/confirm", response_model=TransferResponse)
def confirm_transfer_route(transfer_id: int, db: Session = Depends(get_db)):
    return confirm_transfer(db, transfer_id)
