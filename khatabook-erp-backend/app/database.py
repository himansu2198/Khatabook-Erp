# app/database.py

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping    = True,
    pool_recycle     = 300,
    pool_size        = 5,
    max_overflow     = 10,
    connect_args     = {
        "connect_timeout":        10,
        "keepalives":             1,
        "keepalives_idle":        30,
        "keepalives_interval":    10,
        "keepalives_count":       5,
    },
)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush  = False,
    bind       = engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()