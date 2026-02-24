import sys
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import engine, SessionLocal
from models import Base
from seed import seed_database
from routers import contracts, risks, tasks, annotations, stats, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="MeFlow API",
    description="合同履约管理系统后端",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


app.include_router(contracts.router)
app.include_router(risks.router)
app.include_router(tasks.router)
app.include_router(annotations.router)
app.include_router(annotations.text_edits_router)
app.include_router(stats.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
