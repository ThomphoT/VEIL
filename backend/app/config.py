from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "VEIL"
    app_version: str = "1.0.0"
    environment: str = "development"

    gemini_api_key: Optional[str] = None
    gemini_flash_model: str = "gemini-1.5-flash"
    gemini_pro_model: str = "gemini-1.5-pro"

    featherless_api_key: Optional[str] = None
    featherless_base_url: str = "https://api.featherless.ai/v1"
    featherless_model: str = "meta-llama/Llama-3.1-8B-Instruct"

    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

    speechmatics_api_key: Optional[str] = None

    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
