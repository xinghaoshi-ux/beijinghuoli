# Backend

FastAPI backend for the tennis exchange results and points platform.

## Commands

```bash
uv sync
uv run uvicorn app.main:app --reload
uv run pytest
```

The MVP backend uses SQLite by default and creates tables on startup.
