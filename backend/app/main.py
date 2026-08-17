from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import alerts, incidents, events


app = FastAPI(
    title="AI-SOC Backend",
    description="AI-powered Security Operations Center API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(events.router)


@app.get("/")
def root():
    return {"message": "AI-SOC Backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}