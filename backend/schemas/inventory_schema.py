from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ================= WAREHOUSE =================
class WarehouseBase(BaseModel):
    name: str
    location: str

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    class Config:
        from_attributes = True

# ================= PRODUCT =================
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    unit: str
    stock: float = 0
    reorder_level: float = 0
    warehouse_id: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    warehouse: Optional[WarehouseResponse] = None
    class Config:
        from_attributes = True

# ================= RECEIPTS =================
class ReceiptItemBase(BaseModel):
    product_id: int
    expected_qty: float
    received_qty: float = 0

class ReceiptItemCreate(ReceiptItemBase):
    pass

class ReceiptItemResponse(ReceiptItemBase):
    id: int
    class Config:
        from_attributes = True

class ReceiptBase(BaseModel):
    supplier: str
    warehouse_id: int

class ReceiptCreate(ReceiptBase):
    items: List[ReceiptItemCreate]

class ReceiptResponse(ReceiptBase):
    id: int
    status: str
    created_at: datetime
    items: List[ReceiptItemResponse] = []
    class Config:
        from_attributes = True

# ================= DELIVERIES =================
class DeliveryItemBase(BaseModel):
    product_id: int
    quantity: float

class DeliveryItemCreate(DeliveryItemBase):
    pass

class DeliveryItemResponse(DeliveryItemBase):
    id: int
    class Config:
        from_attributes = True

class DeliveryBase(BaseModel):
    customer: str
    warehouse_id: int

class DeliveryCreate(DeliveryBase):
    items: List[DeliveryItemCreate]

class DeliveryResponse(DeliveryBase):
    id: int
    status: str
    created_at: datetime
    items: List[DeliveryItemResponse] = []
    class Config:
        from_attributes = True

# ================= TRANSFERS =================
class TransferBase(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: float

class TransferCreate(TransferBase):
    pass

class TransferResponse(TransferBase):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# ================= ADJUSTMENTS =================
class AdjustmentBase(BaseModel):
    product_id: int
    warehouse_id: int
    system_stock: float
    counted_stock: float
    reason: str

class AdjustmentCreate(AdjustmentBase):
    pass

class AdjustmentResponse(AdjustmentBase):
    id: int
    difference: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# ================= STOCK MOVEMENTS =================
class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    movement_type: str
    reference_id: int
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    created_at: datetime
    
    # Nested info for the frontend
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True
