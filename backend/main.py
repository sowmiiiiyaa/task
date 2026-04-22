from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4


class Task(BaseModel):
    id: str
    title: str
    deadline: Optional[str] = None
    completed: bool = False


class TaskCreate(BaseModel):
    title: str
    deadline: Optional[str] = None


app = FastAPI(title="TaskFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for demo purposes
_tasks: List[dict] = []


@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return _tasks


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate):
    t = Task(id=str(uuid4()), title=payload.title, deadline=payload.deadline, completed=False)
    _tasks.append(t.dict())
    return t


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, payload: Task):
    for i, t in enumerate(_tasks):
        if t["id"] == task_id:
            _tasks[i] = payload.dict()
            return _tasks[i]
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    for i, t in enumerate(_tasks):
        if t["id"] == task_id:
            _tasks.pop(i)
            return
    raise HTTPException(status_code=404, detail="Task not found")
