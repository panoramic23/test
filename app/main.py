from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request

from app.amazon_client import AmazonProductClient
from app.deals_agent import DealHunterAgent
from app.storage import JsonStorage

load_dotenv()

app = FastAPI(title="Luck The System")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

storage = JsonStorage()
amazon_client = AmazonProductClient()
agent = DealHunterAgent(storage=storage, amazon_client=amazon_client)


@app.on_event("startup")
async def startup_event() -> None:
    await agent.start()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await agent.stop()


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    deals = storage.load_deals()
    return templates.TemplateResponse("index.html", {"request": request, "deals": deals})


@app.get("/api/deals")
async def list_deals() -> dict:
    return {"deals": storage.load_deals()}


@app.post("/api/scan")
async def trigger_scan() -> dict:
    deals = await agent.scan_once()
    return {"count": len(deals), "deals": [d.to_dict() for d in deals]}
