# SmartCattle Net - Backend

## Prerequisites

- Python 3.13+
- PostgreSQL
- Git

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd smartcattle-net/backend
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

**Windows**

```bash
.venv\Scripts\activate
```

**Linux/macOS**

```bash
source .venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
DATABASE_URL=postgresql+asyncpg://postgres:<password>@localhost:5432/smartcattle
JWT_SECRET=your_secret_key
GOOGLE_API_KEY=your_google_api_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## Database Migration

Run the migrations:

```bash
alembic upgrade head
```

---

## Run the Backend

```bash
python -m uvicorn app.main:app --reload
```

The server will start at:

```
http://127.0.0.1:8000
```

---

## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

OpenAPI JSON

```
http://127.0.0.1:8000/openapi.json
```

---

## Main Features

- JWT Authentication
- User Management
- Cow Management
- SmartCattle ML Prediction API
- PostgreSQL Database
- FastAPI REST APIs

---

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication
- TensorFlow
- Scikit-learn
- XGBoost

 <!-- {
  "email": "Shetty@example.com",
  "password": "secure123!",
  "full_name": "Shetty Shetty"
} -->