"""
FastAPI 后端入口
开发启动: uvicorn main:app --reload
API 文档: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MY_WEBSITE API")

# 允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
def hello():
    """测试接口"""
    return {"message": "Hello from FastAPI!"}
