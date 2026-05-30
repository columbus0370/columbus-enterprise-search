from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    gbizinfo_api_key: str = ""
    cors_origins: str = "http://localhost:5173,http://localhost:5174"  # 本番では CORS_ORIGINS 環境変数で上書きすること
    cors_origin_regex: str = ""  # 例: https://.*\.vercel\.app

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
