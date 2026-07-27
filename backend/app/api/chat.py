"""
聊天 API 路由 — POST /api/chat
处理对话请求：注入 system prompt + 检索知识库 → 调用 DeepSeek
"""
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.core.system_prompt import SYSTEM_PROMPT
from app.core.knowledge import search_knowledge
from app.core.deepseek_client import chat_completion
from app.models.chat import ChatRequest, ChatResponse, ErrorResponse

logger = logging.getLogger("chat")

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={500: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="AI 角色对话",
    description="发送对话历史，获得雷电将军角色的 AI 回复。",
)
async def chat(request: ChatRequest):
    """
    接收对话消息，拼接 system prompt 和知识库上下文后调用 DeepSeek API
    """
    # 提取 user/assistant 消息
    history = [m.model_dump() for m in request.messages]

    # 检索知识库 — 匹配最后一条用户消息
    last_user_msg = next(
        (m for m in reversed(request.messages) if m.role == "user"), None
    )
    knowledge_suffix = ""
    if last_user_msg:
        entries = search_knowledge(last_user_msg.content)
        if entries:
            logger.info(
                "[CHAT] knowledge matched: %s",
                [e["category"] for e in entries],
            )
            knowledge_text = " ".join(e["content"] for e in entries)
            knowledge_suffix = (
                "\n\n[参考知识，请以角色视角自然地融入回答]：" + knowledge_text
            )

    # 构建完整消息列表
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for i, msg in enumerate(history):
        is_last_user = msg["role"] == "user" and i == len(history) - 1
        if is_last_user and knowledge_suffix:
            full_messages.append(
                {"role": msg["role"], "content": msg["content"] + knowledge_suffix}
            )
        else:
            full_messages.append(msg)

    # 只保留最近 20 条消息（避免超出上下文窗口）
    full_messages = [full_messages[0]] + full_messages[-(20 * 2) :]

    try:
        result = await chat_completion(full_messages, stream=True)
        return ChatResponse(**result)

    except Exception as e:
        logger.error("[CHAT] DeepSeek error: %s", e)
        raise HTTPException(
            status_code=503,
            detail="DeepSeek API 调用失败",
        )
