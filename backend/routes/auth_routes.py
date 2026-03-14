from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from schemas.user_schema import UserCreate, UserLogin
from schemas.auth_schema import RequestResetSchema, VerifyOTPSchema, ResetPasswordSchema, TokenSchema
from services import auth_service, otp_service
from utils.password_utils import verify_password
from utils.jwt_handler import sign_jwt

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    auth_service.create_user(db=db, user=user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=TokenSchema)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, email=user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = sign_jwt(user_id=user.id, email=user.email, role=user.role)
    return TokenSchema(
        access_token=access_token,
        user_name=user.name,
        user_email=user.email,
        user_role=user.role
    )

@router.post("/request-reset")
def request_password_reset(request: RequestResetSchema, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, email=request.email)
    if not user:
        # Don't reveal if user exists or not for security, but return generic success message
        print(f"\n--- [DEBUG] User {request.email} not found. OTP not generated. ---\n", flush=True)
        return {"message": "If an account exists, an OTP will be printed to the terminal."}
    
    otp_service.create_otp(db, email=request.email)
    return {"message": "If an account exists, an OTP will be printed to the terminal."}

@router.post("/verify-otp")
def verify_otp(request: VerifyOTPSchema, db: Session = Depends(get_db)):
    # verify_otp raises 400 if invalid
    otp_service.verify_otp(db, email=request.email, otp_code=request.otp_code)
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordSchema, db: Session = Depends(get_db)):
    # At this point, caller should have verified OTP. 
    # Just update the password.
    auth_service.update_user_password(db, email=request.email, new_password=request.new_password)
    return {"message": "Password reset successfully"}
