from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)
