from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.auth.models import User
from app.auth.schemas import RegisterRequest, LoginRequest, ResetPasswordRequest
from app.auth.utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, create_reset_token, verify_reset_token,
)
from app.utils.email import send_password_reset_email


async def register_user(db: Session, data: RegisterRequest):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        name     = data.name,
        email    = data.email,
        password = hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"tokens": _generate_tokens(user), "user": user}


async def login_user(db: Session, data: LoginRequest):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    return {"tokens": _generate_tokens(user), "user": user}


async def refresh_token(db: Session, refresh_token_str: str):
    payload = decode_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return _generate_tokens(user)


async def get_current_user(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


async def forgot_password(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If that email exists, a reset link has been sent"}

    token = create_reset_token(email)
    user.reset_token            = token
    user.reset_token_expires_at = datetime.now(timezone.utc)
    db.commit()

    # Print token to console for testing
    print(f"\n🔑 RESET TOKEN for {email}: {token}\n")

    try:
        await send_password_reset_email(email, token)
    except Exception as e:
        print(f"Email failed (token still valid): {e}")

    return {"message": "If that email exists, a reset link has been sent"}


async def reset_password(db: Session, data: ResetPasswordRequest):
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    user = db.query(User).filter(User.email == email).first()
    if not user or user.reset_token != data.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token already used or invalid",
        )
    user.password               = hash_password(data.new_password)
    user.reset_token            = None
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Password reset successfully"}


def _generate_tokens(user: User) -> dict:
    data = {"sub": str(user.id)}
    return {
        "access_token":  create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "token_type":    "bearer",
    }