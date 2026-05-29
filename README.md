# StockFlow — Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Backend    | Python + FastAPI    |
| Frontend   | React 18 + Vite     |
| Database   | PostgreSQL 16       |
| Styling    | Tailwind CSS        |
| Container  | Docker + Compose    |

---

## Features

### Products
- Create, read, update, delete products
- Unique SKU enforcement
- Stock quantity tracking
- Category filtering
- Low stock alerts (≤10 units)

### Customers
- Full CRUD operations
- Unique email enforcement
- Customer order history

### Orders
- Place orders with multiple line items
- **Automatic stock reduction** on order creation
- **Stock validation** — prevents orders exceeding available inventory
- **Stock restoration** when orders are cancelled or deleted
- Order status management (Pending → Confirmed → Shipped → Delivered / Cancelled)
- Expandable order details

### Dashboard
- Live statistics (products, customers, orders, revenue)
- Low stock and pending order alerts
- Revenue trend chart
- Recent orders feed

---

## Quick Start

### Prerequisites
- Docker & Docker Compose

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd inventory-system
cp .env.example .env
# Edit .env with your desired credentials
```

### 2. Start all services

```bash
docker compose up --build -d
```

### 3. Access the application

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set API URL
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run
npm run dev
```

---

## API Endpoints

### Products
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /api/products        | List all products    |
| POST   | /api/products        | Create a product     |
| GET    | /api/products/{id}   | Get product by ID    |
| PUT    | /api/products/{id}   | Update a product     |
| DELETE | /api/products/{id}   | Delete a product     |

### Customers
| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| GET    | /api/customers         | List all customers     |
| POST   | /api/customers         | Create a customer      |
| GET    | /api/customers/{id}    | Get customer by ID     |
| PUT    | /api/customers/{id}    | Update a customer      |
| DELETE | /api/customers/{id}    | Delete a customer      |
| GET    | /api/customers/{id}/orders | Get customer orders |

### Orders
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/orders                 | List all orders      |
| POST   | /api/orders                 | Create an order      |
| GET    | /api/orders/{id}            | Get order by ID      |
| PATCH  | /api/orders/{id}/status     | Update order status  |
| DELETE | /api/orders/{id}            | Delete an order      |
| GET    | /api/orders/stats/dashboard | Dashboard statistics |

---

## Business Rules

1. **Unique SKUs** — Product SKUs must be unique; duplicates return HTTP 400
2. **Unique Emails** — Customer emails must be unique; duplicates return HTTP 400
3. **Inventory Validation** — Orders cannot be placed if requested quantity exceeds stock
4. **Automatic Stock Reduction** — Placing an order immediately reduces product stock
5. **Stock Restoration** — Cancelling or deleting a pending order restores stock
6. **Delete Guards** — Products with orders and customers with orders cannot be deleted
7. **Concurrent Safety** — Row-level locking (`SELECT FOR UPDATE`) prevents race conditions on stock

---

## Deployment

### Environment Variables

| Variable          | Description                  | Default               |
|-------------------|------------------------------|-----------------------|
| `DATABASE_URL`    | PostgreSQL connection string | (required)            |
| `POSTGRES_USER`   | DB username                  | `postgres`            |
| `POSTGRES_PASSWORD` | DB password               | (required)            |
| `POSTGRES_DB`     | Database name                | `inventory_db`        |
| `ALLOWED_ORIGINS` | CORS allowed origins         | `http://localhost:3000` |
| `VITE_API_URL`    | Backend URL (build-time)     | `http://localhost:8000` |

### Recommended Free Platforms

- **Backend**: [Render](https://render.com) — Deploy as a Web Service from your repo
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Database**: [Render PostgreSQL](https://render.com/docs/postgresql) or [Supabase](https://supabase.com)

### Docker Hub

```bash
# Build and push backend
docker build -t yourusername/stockflow-backend ./backend
docker push yourusername/stockflow-backend

# Build and push frontend (with API URL)
docker build --build-arg VITE_API_URL=https://your-backend-url.com -t yourusername/stockflow-frontend ./frontend
docker push yourusername/stockflow-frontend
```

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, lifespan
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py  # Product CRUD endpoints
│   │       ├── customers.py # Customer CRUD endpoints
│   │       └── orders.py    # Order endpoints + business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Router setup
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Tailwind + design tokens
│   │   ├── components/
│   │   │   ├── Layout.jsx   # Sidebar + header shell
│   │   │   └── UI.jsx       # Shared components
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   └── utils/
│   │       └── api.js       # Axios client
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```
