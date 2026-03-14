import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.otp import OTP

from utils.email_service import send_otp_email

def generate_otp_code() -> str:
    return str(random.randint(100000, 999999))

def create_otp(db: Session, email: str):
    # Invalidate previous unexpired OTPs for this email ideally, 
    # but for simplicity we just generate a new one
    otp_code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    otp_record = OTP(
        email=email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    # Send email containing the OTP
    send_otp_email(email=email, otp=otp_code)
    return otp_record

def verify_otp(db: Session, email: str, otp_code: str):
    otp_record = db.query(OTP).filter(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    otp_record.is_used = True
    db.commit()
    return True
