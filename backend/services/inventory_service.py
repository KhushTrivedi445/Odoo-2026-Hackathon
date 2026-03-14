from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.inventory import (
    Warehouse, Product, Receipt, ReceiptItem, Delivery, DeliveryItem, 
    Transfer, Adjustment, StockMovement
)
from schemas.inventory_schema import (
    WarehouseCreate, ProductCreate, ReceiptCreate, DeliveryCreate, 
    TransferCreate, AdjustmentCreate
)

# ================= WAREHOUSES =================
def create_warehouse(db: Session, warehouse: WarehouseCreate):
    db_warehouse = Warehouse(name=warehouse.name, location=warehouse.location)
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

def get_warehouses(db: Session):
    return db.query(Warehouse).all()

def delete_warehouse(db: Session, warehouse_id: int):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(warehouse)
    db.commit()

# ================= PRODUCTS =================
def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(Product).all()

def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()

def log_movement(db: Session, product_id: int, quantity: float, movement_type: str, ref_id: int, from_loc: str = None, to_loc: str = None):
    movement = StockMovement(
        product_id=product_id,
        quantity=quantity,
        movement_type=movement_type,
        reference_id=ref_id,
        from_location=from_loc,
        to_location=to_loc
    )
    db.add(movement)

# ================= RECEIPTS =================
def get_receipts(db: Session):
    return db.query(Receipt).all()

def create_receipt(db: Session, receipt: ReceiptCreate):
    db_receipt = Receipt(supplier=receipt.supplier, warehouse_id=receipt.warehouse_id)
    db.add(db_receipt)
    db.flush() # get id

    for item in receipt.items:
        db_item = ReceiptItem(
            receipt_id=db_receipt.id,
            product_id=item.product_id,
            expected_qty=item.expected_qty,
            received_qty=item.received_qty
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_receipt)
    return db_receipt

def validate_receipt(db: Session, receipt_id: int):
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt: raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.status == "Validated": raise HTTPException(status_code=400, detail="Already validated")

    warehouse_name = receipt.warehouse.name

    for item in receipt.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.received_qty
            log_movement(db, product.id, item.received_qty, "Receipt", receipt.id, to_loc=warehouse_name)

    receipt.status = "Validated"
    db.commit()
    return receipt

# ================= DELIVERIES =================
def get_deliveries(db: Session):
    return db.query(Delivery).all()

def create_delivery(db: Session, delivery: DeliveryCreate):
    db_del = Delivery(customer=delivery.customer, warehouse_id=delivery.warehouse_id)
    db.add(db_del)
    db.flush()

    for item in delivery.items:
        db_item = DeliveryItem(
            delivery_id=db_del.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_del)
    return db_del

def validate_delivery(db: Session, delivery_id: int):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery: raise HTTPException(status_code=404, detail="Delivery not found")
    if delivery.status == "Validated": raise HTTPException(status_code=400, detail="Already validated")

    warehouse_name = delivery.warehouse.name

    for item in delivery.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            product.stock -= item.quantity
            log_movement(db, product.id, item.quantity, "Delivery", delivery.id, from_loc=warehouse_name)

    delivery.status = "Validated"
    db.commit()
    return delivery

# ================= TRANSFERS =================
def get_transfers(db: Session):
    return db.query(Transfer).all()

def create_transfer(db: Session, transfer: TransferCreate):
    if transfer.from_warehouse_id == transfer.to_warehouse_id:
        raise HTTPException(status_code=400, detail="Source and destination cannot be the same")
        
    db_trans = Transfer(**transfer.model_dump())
    db.add(db_trans)
    db.commit()
    db.refresh(db_trans)
    return db_trans

def confirm_transfer(db: Session, transfer_id: int):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    if not transfer: raise HTTPException(status_code=404, detail="Transfer not found")
    if transfer.status == "Confirmed": raise HTTPException(status_code=400, detail="Already confirmed")

    product = db.query(Product).filter(Product.id == transfer.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < transfer.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock for transfer")

    # Technically, transfers to another warehouse might mean the product belongs to a different warehouse_id now,
    # or it's just global stock tracking using Transfer logging. The prompt indicates simple stock reduction/increase.
    # In a real system, stock is tracked per warehouse. Given the prompt's Product model has *one* warehouse_id, 
    # we'll assume total stock is bound to the product record directly, but we log the locations.
    
    # We log OUT from source
    from_name = transfer.from_warehouse.name if transfer.from_warehouse else f"WH-{transfer.from_warehouse_id}"
    log_movement(db, product.id, transfer.quantity, "Transfer Out", transfer.id, from_loc=from_name)
    # We log IN from source
    to_name = transfer.to_warehouse.name if transfer.to_warehouse else f"WH-{transfer.to_warehouse_id}"
    log_movement(db, product.id, transfer.quantity, "Transfer In", transfer.id, to_loc=to_name)

    transfer.status = "Confirmed"
    db.commit()
    return transfer

# ================= ADJUSTMENTS =================
def get_adjustments(db: Session):
    return db.query(Adjustment).all()

def create_adjustment(db: Session, adjustment: AdjustmentCreate):
    diff = adjustment.counted_stock - adjustment.system_stock
    db_adj = Adjustment(**adjustment.model_dump(), difference=diff)
    db.add(db_adj)
    db.commit()
    db.refresh(db_adj)
    return db_adj

def apply_adjustment(db: Session, adjustment_id: int):
    adjustment = db.query(Adjustment).filter(Adjustment.id == adjustment_id).first()
    if not adjustment: raise HTTPException(status_code=404, detail="Adjustment not found")
    if adjustment.status == "Applied": raise HTTPException(status_code=400, detail="Already applied")

    product = db.query(Product).filter(Product.id == adjustment.product_id).first()
    if product:
        product.stock = adjustment.counted_stock
        log_movement(db, product.id, abs(adjustment.difference), "Adjustment", adjustment.id)

    adjustment.status = "Applied"
    db.commit()
    return adjustment

# ================= DASHBOARD & STOCK MOVEMENTS =================
def get_stock_movements(db: Session):
    return db.query(StockMovement).order_by(StockMovement.created_at.desc()).all()

def get_dashboard_metrics(db: Session):
    products = db.query(Product).all()
    total_products = len(products)
    
    low_stock_items = [
        {"id": p.id, "name": p.name, "sku": p.sku, "stock": p.stock, "reorder_level": p.reorder_level}
        for p in products if p.stock < p.reorder_level
    ]

    pending_receipts = db.query(Receipt).filter(Receipt.status == "Pending").count()
    pending_deliveries = db.query(Delivery).filter(Delivery.status == "Pending").count()

    categories = {}
    for p in products:
        categories[p.category] = categories.get(p.category, 0) + 1

    stock_by_category = [{"name": k, "value": v} for k, v in categories.items()]

    return {
        "total_products": total_products,
        "low_stock_items": low_stock_items,
        "pending_receipts": pending_receipts,
        "pending_deliveries": pending_deliveries,
        "stock_by_category": stock_by_category
    }
