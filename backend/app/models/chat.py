"""
聊天 API — Pydantic 请求/响应模型
"""
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="角色：user / assistant / system")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(
        ..., description="对话历史（只含 user 和 assistant）"
    )


class ChatResponse(BaseModel):
    role: str = Field(default="assistant", description="响应角色")
    content: str = Field(..., description="AI 回复内容")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="错误信息")
    content: str = Field(default="一心净土的门扉暂未开启…稍后再试吧，旅者。", description="兜底回复")
