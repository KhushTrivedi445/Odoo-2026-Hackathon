from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)

    products = relationship("Product", back_populates="warehouse")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    unit = Column(String)
    stock = Column(Float, default=0)
    reorder_level = Column(Float, default=0)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))

    warehouse = relationship("Warehouse", back_populates="products")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    supplier = Column(String)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Pending") # Pending / Validated
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")
    warehouse = relationship("Warehouse")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    expected_qty = Column(Float)
    received_qty = Column(Float, default=0)

    receipt = relationship("Receipt", back_populates="items")
    product = relationship("Product")

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Pending") # Pending / Validated
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("DeliveryItem", back_populates="delivery", cascade="all, delete-orphan")
    warehouse = relationship("Warehouse")

class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)

    delivery = relationship("Delivery", back_populates="items")
    product = relationship("Product")

class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    quantity = Column(Float)
    status = Column(String, default="Pending") # Pending / Confirmed
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    from_warehouse = relationship("Warehouse", foreign_keys=[from_warehouse_id])
    to_warehouse = relationship("Warehouse", foreign_keys=[to_warehouse_id])

class Adjustment(Base):
    __tablename__ = "adjustments"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    system_stock = Column(Float)
    counted_stock = Column(Float)
    difference = Column(Float)
    reason = Column(String)
    status = Column(String, default="Pending") # Pending / Applied
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    warehouse = relationship("Warehouse")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float)
    movement_type = Column(String) # Receipt / Delivery / Transfer Out / Transfer In / Adjustment
    reference_id = Column(Integer) # ID of Receipt/Delivery/Transfer/Adjustment
    from_location = Column(String, nullable=True)
    to_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
