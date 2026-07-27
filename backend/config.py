"""
应用配置 — pydantic-settings 管理环境变量
读取优先级: 环境变量 > .env 文件 > 默认值
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # DeepSeek API
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-v4-flash"

    # 服务
    host: str = "127.0.0.1"
    port: int = 8000

    # CORS 允许的前端来源
    cors_origins: str = "http://localhost:5173,https://wangyulong.top,https://www.wangyulong.top"


# 单例 — 使用 lru_cache 确保 .env 只读取一次
from functools import lru_cache


@lru_cache
def get_settings() -> Settings:
    return Settings()
