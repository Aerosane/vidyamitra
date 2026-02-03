"""Environment configuration for VidyaMitra API"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # GitHub Models
    GITHUB_TOKEN: str = ""
    GITHUB_ORG: str = "imperialorg"
    LLM_MODEL: str = "openai/gpt-4.1"
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    DATABASE_URL: str = ""  # PostgreSQL connection string
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = ""
    
    # Google Drive (optional - handled by n8n)
    GDRIVE_FOLDER_ID: str = ""
    
    # App settings
    DEBUG: bool = False
    API_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
