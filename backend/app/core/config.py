from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App
    APP_NAME: str = "CBAM Guard API"
    DEBUG: bool = True

    # Database - explicitly read from .env to avoid system env conflicts
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cbamguard.db")

    # Force SQLite for development (comment out for production)
    @property
    def database_url_resolved(self) -> str:
        """Use SQLite for development regardless of system DATABASE_URL"""
        db_url = self.DATABASE_URL
        if db_url.startswith("postgres"):
            # Override with SQLite for local development
            return "sqlite:///./cbamguard.db"
        return db_url

    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "your-super-secret-key-change-in-production-min-32-chars"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    )

    # LLM API Keys (Optional)
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_URL: str = "http://localhost:11434"
    DEFAULT_LLM_PROVIDER: str = "openai"

    # Property aliases for llm_providers.py
    @property
    def openai_api_key(self) -> Optional[str]:
        return self.OPENAI_API_KEY

    @property
    def google_api_key(self) -> Optional[str]:
        return self.GOOGLE_API_KEY

    @property
    def anthropic_api_key(self) -> Optional[str]:
        return self.ANTHROPIC_API_KEY

    @property
    def groq_api_key(self) -> Optional[str]:
        return self.GROQ_API_KEY

    @property
    def ollama_url(self) -> str:
        return self.OLLAMA_URL

    @property
    def default_llm_provider(self) -> str:
        return self.DEFAULT_LLM_PROVIDER

    @property
    def cors_origins_list(self) -> list:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
