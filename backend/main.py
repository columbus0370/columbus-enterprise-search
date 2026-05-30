import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from config import get_settings
from services.rate_limiter import limiter
from middleware.security import SecurityHeadersMiddleware
from middleware.logging import RequestLoggingMiddleware
from routers import search, proposal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)

settings = get_settings()

app = FastAPI(
    title="Enterprise Search API",
    description="AI営業アシスタント — 企業検索 & 営業メール生成 API",
    version="1.0.0",
)

# レート制限ハンドラ
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"status": "error", "message": "リクエスト頻度の上限を超えました。しばらく待ってから再試行してください"},
    )

# CORS
_cors_kwargs: dict = {
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if settings.cors_origin_regex:
    _cors_kwargs["allow_origin_regex"] = settings.cors_origin_regex
    _cors_kwargs["allow_origins"] = settings.cors_origins_list
    _cors_kwargs["allow_credentials"] = True
else:
    _cors_kwargs["allow_origins"] = settings.cors_origins_list
    _cors_kwargs["allow_credentials"] = True

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CORSMiddleware, **_cors_kwargs)

# ルーター登録
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(proposal.router, prefix="/api", tags=["proposal"])


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok"}
