from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token:        str
    new_password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"


class UserResponse(BaseModel):
    id:         uuid.UUID
    name:       str
    email:      str
    is_active:  bool
    created_at: datetime

    class Config:
        from_attributes = True