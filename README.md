# TaskFlow (Frontend + Minimal FastAPI Backend)

Quick local setup to run the frontend UI and a minimal FastAPI backend for testing.

1) Create & activate a virtual environment

PowerShell:
```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies

```powershell
pip install -r requirements.txt
```

3) Run the FastAPI server (from project root)

```powershell
uvicorn backend.main:app --reload --port 8000
```

4) Open the frontend

Open `index.html` in a browser (or serve it with a static server). The frontend expects the API at `http://localhost:8000/tasks`.

Notes:
- The backend uses an in-memory store; data resets when the server restarts.
- For production, replace in-memory storage with a real database.
