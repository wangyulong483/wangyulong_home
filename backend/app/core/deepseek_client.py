"""
DeepSeek API 异步客户端
- httpx.AsyncClient 连接池复用
- 指数退避重试（3 次）
- 统一错误处理
"""
import asyncio
import logging
from typing import Optional

import httpx
from httpx import AsyncClient, Limits, Timeout

from config import get_settings

logger = logging.getLogger("deepseek")

# 请求超时配置
HTTPX_TIMEOUT = Timeout(connect=10.0, read=60.0, write=10.0, pool=5.0)

# 最大重试次数
MAX_RETRIES = 3

# 退避基数（秒）
BACKOFF_BASE = 1.0


def _build_client() -> AsyncClient:
    """创建带连接池的 httpx 客户端"""
    settings = get_settings()
    return AsyncClient(
        base_url=settings.deepseek_base_url,
        headers={
            "Authorization": f"Bearer {settings.deepseek_api_key}",
            "Content-Type": "application/json",
        },
        limits=Limits(max_keepalive_connections=10, max_connections=50),
        timeout=HTTPX_TIMEOUT,
    )


# 模块级共享客户端（在 lifespan 中初始化/关闭）
_client: Optional[AsyncClient] = None


def get_client() -> AsyncClient:
    """获取共享的 DeepSeek 客户端"""
    global _client
    if _client is None:
        _client = _build_client()
    return _client


async def close_client():
    """关闭客户端连接池"""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def chat_completion(
    messages: list[dict],
    stream: bool = False,
    temperature: float = 0.7,
    max_tokens: int = 400,
) -> dict:
    """
    调用 DeepSeek API 聊天完成

    Args:
        messages: 对话历史 [{"role": "system/user/assistant", "content": "..."}]
        stream: 是否流式响应
        temperature: 温度参数
        max_tokens: 最大输出 token

    Returns:
        {"role": "assistant", "content": "..."}

    Raises:
        httpx.HTTPStatusError: HTTP 4xx/5xx
        httpx.TimeoutException: 请求超时
    """
    settings = get_settings()
    client = get_client()

    payload = {
        "model": settings.deepseek_model,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(
                "[CHAT] request attempt=%d model=%s msg_count=%d",
                attempt + 1,
                settings.deepseek_model,
                len(messages),
            )

            if stream:
                # 流式响应：收集完整内容后返回
                content_parts = []
                async with client.stream(
                    "POST", "/chat/completions", json=payload
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:].strip()
                            if data == "[DONE]":
                                break
                            try:
                                import json
                                chunk = json.loads(data)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                if delta.get("content"):
                                    content_parts.append(delta["content"])
                            except json.JSONDecodeError:
                                continue
                return {
                    "role": "assistant",
                    "content": "".join(content_parts) or "...",
                }
            else:
                # 非流式响应
                response = await client.post(
                    "/chat/completions", json=payload
                )
                response.raise_for_status()
                data = response.json()
                reply = data["choices"][0]["message"]["content"]
                logger.info("[CHAT] success tokens=%s", data.get("usage", {}))
                return {"role": "assistant", "content": reply}

        except httpx.HTTPStatusError as e:
            last_error = e
            status = e.response.status_code
            logger.warning("[CHAT] HTTP %d (attempt %d/%d)", status, attempt + 1, MAX_RETRIES)

            if status == 429:
                # 触发速率限制 — 指数退避
                if attempt < MAX_RETRIES - 1:
                    wait = BACKOFF_BASE * (2 ** attempt)
                    logger.info("[CHAT] rate limited, waiting %.1fs", wait)
                    await asyncio.sleep(wait)
                    continue
            # 其他 4xx 错误不重试
            if 400 <= status < 500 and status != 429:
                raise

        except (httpx.TimeoutException, httpx.ConnectError) as e:
            last_error = e
            logger.warning("[CHAT] timeout/connect (attempt %d/%d): %s", attempt + 1, MAX_RETRIES, e)
            if attempt < MAX_RETRIES - 1:
                wait = BACKOFF_BASE * (2 ** attempt)
                await asyncio.sleep(wait)
                continue

    # 所有重试都失败
    raise last_error  # type: ignore
