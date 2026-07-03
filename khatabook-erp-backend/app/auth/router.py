from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import schemas, service
from app.auth.utils import decode_token
from app.utils.responses import success_response

router   = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token   = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = await service.get_current_user(db, payload.get("sub"))
    return user


@router.post("/register", status_code=201)
async def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    result = await service.register_user(db, data)
    return success_response(
        data={"tokens": result["tokens"], "user": schemas.UserResponse.model_validate(result["user"])},
        message="Account created successfully",
    )


@router.post("/login")
async def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    result = await service.login_user(db, data)
    return success_response(
        data={"tokens": result["tokens"], "user": schemas.UserResponse.model_validate(result["user"])},
        message="Login successful",
    )


@router.post("/refresh")
async def refresh(data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    tokens = await service.refresh_token(db, data.refresh_token)
    return success_response(data=tokens, message="Token refreshed")


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return success_response(
        data=schemas.UserResponse.model_validate(current_user),
        message="User fetched",
    )


@router.post("/forgot-password")
async def forgot_password(
    data: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    result = await service.forgot_password(db, data.email)
    return success_response(data=result, message=result["message"])


@router.post("/reset-password")
async def reset_password(
    data: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    result = await service.reset_password(db, data)
    return success_response(data=result, message=result["message"])