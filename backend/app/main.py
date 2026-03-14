import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from routes import (
    auth_routes, warehouse_routes, product_routes, receipt_routes,
    delivery_routes, transfer_routes, adjustment_routes, dashboard_routes
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CoreInventory API",
    description="Backend for Inventory Management System",
    version="1.0.0"
)

# CORS setup
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_routes.router)
app.include_router(warehouse_routes.router)
app.include_router(product_routes.router)
app.include_router(receipt_routes.router)
app.include_router(delivery_routes.router)
app.include_router(transfer_routes.router)
app.include_router(adjustment_routes.router)
app.include_router(dashboard_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CoreInventory API"}
