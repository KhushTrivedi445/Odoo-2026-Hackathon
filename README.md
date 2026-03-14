# CoreInventory – Smart Inventory Management System

CoreInventory is a **modern SaaS-style Inventory Management System** built for managing warehouses, tracking stock movements, and monitoring inventory operations in real time.

The system provides a **complete inventory lifecycle** including product management, stock receipts, deliveries, warehouse transfers, and inventory adjustments.
It is designed with a **modern React dashboard frontend** and a **FastAPI backend API** with secure authentication.

---

# 🚀 Features

CoreInventory provides a full warehouse management workflow:

* User Authentication (Signup, Login)
* OTP-based Password Reset
* Inventory Dashboard with analytics
* Product Management
* Multi-Warehouse Management
* Stock Receipts (Stock In)
* Delivery Orders (Stock Out)
* Internal Stock Transfers
* Inventory Adjustments
* Stock Movement History
* Low Stock Alerts

---

# 🧠 System Workflow

The inventory lifecycle works like this:

Receive Goods → Store in Warehouse → Transfer Stock → Deliver Orders → Track History

This allows companies to **track every stock movement from entry to delivery**.

---

# 🏗️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion (animations)
* Lucide Icons
* Axios (API communication)

## Backend

* FastAPI
* Python
* SQLAlchemy ORM
* SQLite Database
* JWT Authentication
* Pydantic
* Pydantic Settings
* Python-Jose (JWT)
* Passlib (Password Hashing)
* Alembic (Database migrations)

## Development Tools

* Git
* GitHub
* VS Code
* Swagger API Docs

---

# 📂 Project Architecture

```
CoreInventory
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── contexts
│   │   ├── services
│   │   └── hooks
│
├── backend
│   ├── app
│   │   ├── routes
│   │   ├── services
│   │   ├── models
│   │   ├── schemas
│   │   └── utils
│   │
│   ├── inventory.db
│   └── requirements.txt
│
└── README.md
```

---

# 🔐 Authentication System

CoreInventory uses **JWT-based authentication**.

Features:

* User Signup
* User Login
* Secure Password Hashing
* JWT Token Authentication
* Protected API routes
* OTP-based Password Reset via Email

Authentication flow:

Signup → Login → JWT Token → Authorized API Access

---

# 👤 User Roles

CoreInventory supports two user roles:

* Manager
* Staff

Each role has different permissions.

---

# 🧑‍💼 Manager Access

Managers have **full control of the inventory system**.

Manager capabilities:

### Inventory Management

* Create products
* Edit products
* Delete products
* View stock levels

### Warehouse Management

* Create warehouses
* Edit warehouse details
* Delete warehouses

### Stock Operations

* Create receipts
* Validate receipts
* Create delivery orders
* Validate deliveries
* Create stock transfers
* Confirm transfers
* Perform inventory adjustments

### Monitoring

* View dashboard analytics
* Track stock movements
* Monitor low stock alerts

Managers control the **entire inventory lifecycle**.

---

# 👷 Staff Access

Staff users have **limited operational access**.

Staff capabilities:

### Stock Operations

* Create receipts
* Create delivery orders
* View products
* View warehouses

### Monitoring

* View inventory dashboard
* Track stock movements

Staff cannot:

* Delete products
* Delete warehouses
* Perform inventory adjustments
* Manage system settings

Staff mainly handle **daily warehouse operations**.

---

# 📊 Dashboard

The dashboard provides real-time analytics including:

* Total Products
* Low Stock Items
* Pending Receipts
* Pending Deliveries
* Internal Transfers

The dashboard helps managers **monitor inventory health instantly**.

---

# 📦 Inventory Operations

## Receipts (Stock In)

When new goods arrive from suppliers, they are recorded as **Receipts**.

This increases stock levels.

Example:

Supplier → Warehouse → Stock Added

---

## Deliveries (Stock Out)

When products are shipped to customers, they are recorded as **Deliveries**.

This decreases stock levels.

Example:

Warehouse → Customer → Stock Reduced

---

## Transfers

Transfers move stock between warehouses.

Example:

Warehouse A → Warehouse B

Total inventory remains unchanged.

---

## Adjustments

Adjustments correct inventory discrepancies between system stock and physical stock.

Example:

System Stock: 120
Counted Stock: 110

Adjustment: -10

---

# 📜 Stock Movement History

All operations are recorded in the **inventory ledger**.

Tracked events:

* Receipts
* Deliveries
* Transfers
* Adjustments

This allows complete **audit tracking of inventory changes**.

---

# 🔔 Low Stock Alerts

If product stock falls below its **reorder level**, the system automatically flags it.

Managers can quickly identify products that need restocking.

---

# 🛠️ Installation Guide

## Clone the Repository

```
git clone https://github.com/KhushTrivedi445/Odoo-2026-Hackathon.git
cd Odoo-2026-Hackathon
```

---

# Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Run backend server:

```
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API documentation:

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔌 API Integration

Frontend communicates with backend using **Axios**.

All API requests are sent to:

```
http://127.0.0.1:8000
```

JWT tokens are automatically attached to authenticated requests.

---

# 🧪 Testing

Backend APIs can be tested using **Swagger UI**.

Open:

```
http://127.0.0.1:8000/docs
```

Test operations like:

* Products
* Warehouses
* Receipts
* Deliveries
* Transfers
* Adjustments

---

# 🎯 Project Goal

CoreInventory aims to provide a **clean, scalable, and modern inventory system** that simplifies warehouse management and improves stock visibility.

The system demonstrates how modern **React + FastAPI architecture** can power a complete SaaS inventory platform.

---

# 📄 License

This project is created for educational and hackathon purposes.
