"""
FastAPI 后端入口
开发启动: uvicorn main:app --reload
API 文档: http://localhost:8000/docs

路由:
  GET  /api/health — 健康检查
  POST /api/chat   — AI 角色对话
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from app.api.chat import router as chat_router
from app.core.deepseek_client import close_client

# 日志格式: [TAG] message
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化、关闭时清理"""
    settings = get_settings()
    logger.info("[OK] FastAPI starting on %s:%d", settings.host, settings.port)
    logger.info("[OK] DeepSeek model: %s", settings.deepseek_model)
    logger.info("[OK] API docs: http://%s:%d/docs", settings.host, settings.port)
    yield
    logger.info("[OK] shutting down...")
    await close_client()
    logger.info("[OK] FastAPI stopped")


def create_app() -> FastAPI:
    """应用工厂"""
    settings = get_settings()

    app = FastAPI(
        title="MY_WEBSITE API",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS 跨域
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(chat_router, prefix="/api")

    # 健康检查
    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "model": settings.deepseek_model,
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info",
    )
