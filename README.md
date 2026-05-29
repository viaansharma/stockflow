# StockFlow — Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking — built with FastAPI, React, and PostgreSQL, fully containerized with Docker, and deployed on free cloud platforms.

---

## Live Application

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://stockflow-coral-five.vercel.app |
| **Backend API (Render)** | https://stockflow-backend-ntqj.onrender.com |
| **API Documentation (Swagger)** | https://stockflow-backend-ntqj.onrender.com/docs |

---

## Repository & Docker Images

| Resource | Link |
|---|---|
| **GitHub Repository** | https://github.com/viaansharma/stockflow |
| **Docker Hub — Backend** | https://hub.docker.com/r/viaan007/stockflow-backend |
| **Docker Hub — Frontend** | https://hub.docker.com/r/viaan007/stockflow-frontend |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12 + FastAPI |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Backend Hosting | Render.com |
| Frontend Hosting | Vercel |
| Docker Registry | Docker Hub |

---

## Features

### Products
- Create, read, update, and delete products
- Unique SKU enforcement — duplicate SKUs are rejected with a descriptive error
- Real-time stock quantity tracking
- Category-based filtering and name/SKU search
- Low stock alerts triggered at or below 10 units

### Customers
- Full CRUD operations with form validation
- Unique email enforcement — duplicate registrations are blocked
- Customer card grid with contact details

### Orders
- Place multi-line item orders against any registered customer
- Automatic stock reduction when an order is placed
- Inventory validation — orders exceeding available stock are blocked with a clear error message showing the product name, requested quantity, and available quantity
- Stock is automatically restored when an order is cancelled or deleted
- Order status lifecycle: Pending → Confirmed → Shipped → Delivered / Cancelled
- Expandable order rows showing individual line items, unit prices, and SKUs
- Filter orders by status

### Dashboard
- Live statistics: total products, customers, orders, and revenue
- Low stock and pending order alerts with navigation shortcuts
- Revenue trend area chart
- Order status summary panel
- Recent orders feed

---

## Business Rules

1. **Unique SKUs** — No two products can share the same SKU. Returns HTTP 400 on violation.
2. **Unique Customer Emails** — Duplicate emails are rejected. Returns HTTP 400 on violation.
3. **Inventory Validation** — An order cannot be placed if the requested quantity for any item exceeds its current stock.
4. **Automatic Stock Reduction** — Stock is reduced immediately when an order is created. Row-level locking (`SELECT FOR UPDATE`) is used to prevent race conditions under concurrent requests.
5. **Stock Restoration** — Cancelling or deleting a pending order returns all quantities back to inventory.
6. **Delete Guards** — A product that is part of any order cannot be deleted. A customer with any order history cannot be deleted.

---

## Project Structure

```
stockflow/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS middleware, lifespan
│   │   ├── database.py       # SQLAlchemy engine and session factory
│   │   ├── models.py         # ORM models: Product, Customer, Order, OrderItem
│   │   ├── schemas.py        # Pydantic request/response schemas and validators
│   │   └── routers/
│   │       ├── products.py   # Product CRUD endpoints
│   │       ├── customers.py  # Customer CRUD endpoints
│   │       └── orders.py     # Order endpoints + all business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React Router setup
│   │   ├── main.jsx          # Application entry point
│   │   ├── index.css         # Tailwind base + design tokens
│   │   ├── components/
│   │   │   ├── Layout.jsx    # Sidebar navigation + header shell
│   │   │   └── UI.jsx        # Shared components: Modal, Badge, Form fields
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   └── utils/
│   │       └── api.js        # Axios client with error interceptor
│   ├── nginx.conf            # SPA routing + static asset caching
│   ├── package.json
│   └── Dockerfile            # Multi-stage: Node builder → nginx production
├── .github/
│   └── workflows/
│       └── docker-publish.yml  # CI/CD pipeline
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List all products (supports search, category, low_stock filters) |
| POST | /api/products | Create a new product |
| GET | /api/products/{id} | Get a single product by ID |
| PUT | /api/products/{id} | Update a product |
| DELETE | /api/products/{id} | Delete a product |
| GET | /api/products/stats/categories | List all distinct categories |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/customers | List all customers (supports search filter) |
| POST | /api/customers | Create a new customer |
| GET | /api/customers/{id} | Get a single customer by ID |
| PUT | /api/customers/{id} | Update customer details |
| DELETE | /api/customers/{id} | Delete a customer |
| GET | /api/customers/{id}/orders | Get all orders for a customer |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/orders | List all orders (supports status, customer_id filters) |
| POST | /api/orders | Create a new order (validates stock, reduces inventory) |
| GET | /api/orders/{id} | Get a single order with full line items |
| PATCH | /api/orders/{id}/status | Update order status (restores stock on cancellation) |
| DELETE | /api/orders/{id} | Delete a pending or cancelled order |
| GET | /api/orders/stats/dashboard | Aggregate statistics for the dashboard |

Full interactive documentation is available at `/docs` (Swagger UI) and `/redoc`.

---

## Running Locally

### Prerequisites

- Docker Desktop — https://www.docker.com/products/docker-desktop
- Git — https://git-scm.com

### With Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/viaansharma/stockflow.git
cd stockflow

# 2. Create your environment file
cp .env.example .env

# 3. Start all services (database, backend, frontend)
docker compose up --build
```

Once running, open:

- Frontend → http://localhost:3000
- API Docs → http://localhost:8000/docs

To stop all services:
```bash
docker compose down
```

To stop and remove all stored data:
```bash
docker compose down -v
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database password | required |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `DATABASE_URL` | Full PostgreSQL connection string | constructed from above |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:3000` |
| `VITE_API_URL` | Backend URL used at frontend build time | `http://localhost:8000` |

---

## CI/CD Pipeline

Rather than manually building and pushing Docker images from a local machine, this project uses an automated release pipeline via **GitHub Actions**.

Every time new code is merged into the `main` branch, a cloud runner automatically:

1. Checks out the latest code
2. Authenticates with Docker Hub using repository secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`)
3. Builds the backend image from `./backend`
4. Builds the frontend image from `./frontend`, injecting `VITE_API_URL` as a build argument
5. Tags both images as `latest` and pushes them to Docker Hub

This removes the local environment bottleneck and ensures every release is built in a clean, consistent environment. The workflow file lives at `.github/workflows/docker-publish.yml`.

---

## Deployment

### Architecture

```
User
 │
 ├── Frontend (Vercel)
 │     └── React SPA served via CDN
 │           │
 │           └── API calls → Backend (Render.com)
 │                               │
 │                               └── PostgreSQL (Render.com)
```

### Backend on Render

- Runtime: Python 3
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment Variables: `DATABASE_URL`, `ALLOWED_ORIGINS`

### Database on Render

- Service Type: PostgreSQL (Free tier)
- The Internal Database URL from Render is used as `DATABASE_URL` in the backend service

### Frontend on Vercel

- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL` set to the Render backend URL

> **Note on free tier cold starts:** Render's free tier spins down inactive services after 15 minutes. The first request after a period of inactivity may take 30–50 seconds to respond while the server wakes up. This is expected behaviour on free hosting.

---

## Pulling Docker Images

```bash
# Backend
docker pull viaan007/stockflow-backend

# Frontend
docker pull viaan007/stockflow-frontend
```