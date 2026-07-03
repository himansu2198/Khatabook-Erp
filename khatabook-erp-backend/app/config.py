# app/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Khatabook ERP"
    APP_ENV:  str = "development"

    SECRET_KEY:                  str
    ALGORITHM:                   str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS:   int = 7

    DATABASE_URL: str

    MAIL_USERNAME:   str = ""
    MAIL_PASSWORD:   str = ""
    MAIL_FROM:       str = ""
    MAIL_PORT:       int = 587
    MAIL_SERVER:     str = "smtp.gmail.com"
    MAIL_FROM_NAME:  str = "Khatabook ERP"

    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file      = ".env"
        case_sensitive = True
        extra          = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()