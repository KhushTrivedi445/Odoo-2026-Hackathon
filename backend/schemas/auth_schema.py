from pydantic import BaseModel, EmailStr

class RequestResetSchema(BaseModel):
    email: EmailStr

class VerifyOTPSchema(BaseModel):
    email: EmailStr
    otp_code: str

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    new_password: str

class TokenSchema(BaseModel):
    access_token: str
    user_name: str
    user_email: str
    user_role: str
