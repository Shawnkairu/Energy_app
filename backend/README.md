# e.mappa Backend

FastAPI backend scaffold for the e.mappa roadmap. It exposes the same camelCase API contracts used by `@emappa/api-client`, while keeping business calculations in organized Python services that mirror `packages/shared`.

## Local Dev

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check: `GET http://localhost:8000/health`.

## Docker

From the repo root:

```bash
docker compose up --build
```

The app currently seeds demo data in memory at startup and includes SQLAlchemy models/migrations scaffolding for the PostgreSQL persistence layer.
