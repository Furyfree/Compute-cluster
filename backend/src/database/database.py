from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent.parent
env_path = base_dir / ".env"
load_dotenv(dotenv_path=env_path)

DB_URL_raw = os.getenv("DATABASE_URL")
if DB_URL_raw is None:
    raise ValueError("DATABASE_URL is not set in the environment variables")

DB_URL: str = DB_URL_raw

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
