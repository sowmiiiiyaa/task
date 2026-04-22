// ✅ No hardcoded backend URL
const API_BASE = '';

document.addEventListener('DOMContentLoaded', ()=>{
  const addBtn = document.getElementById('addTaskBtn');
  const titleInput = document.getElementById('taskTitle');
  const deadlineInput = document.getElementById('taskDeadline');
  const tasksContainer = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  addBtn.addEventListener('click', async ()=>{
    const title = titleInput.value.trim();
    const deadline = deadlineInput.value || null;
    if(!title) { titleInput.focus(); return; }

    await createTask({title, deadline});

    titleInput.value = '';
    deadlineInput.value = '';
  });

  loadTasks();

  function setEmptyState(show){
    if(!emptyState) return;
    if(show){
      emptyState.style.display = 'flex';
      tasksContainer.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      tasksContainer.style.display = 'grid';
    }
  }

  async function loadTasks(){
    tasksContainer.innerHTML = '';
    try{
      const res = await fetch('/tasks');   // ✅ FIXED
      if(!res.ok) throw new Error('Failed to fetch: ' + res.status);

      const tasks = await res.json();

      if(Array.isArray(tasks) && tasks.length){
        setEmptyState(false);
        tasks.forEach(t => tasksContainer.appendChild(renderTask(t)));
      } else {
        setEmptyState(true);
      }

    }catch(err){
      setEmptyState(true);
      emptyState.textContent = `Could not load tasks`;
      console.error('Error loading tasks', err);
    }
  }

  async function createTask(payload){
    try{
      const res = await fetch('/tasks', {   // ✅ FIXED
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });

      if(!res.ok) throw new Error('Create failed');

      await loadTasks();

    }catch(err){
      alert('Failed to add task');
      console.error('Create task error', err);
    }
  }

  function renderTask(task){
    const el = document.createElement('div');
    el.className = 'task-item glass';

    el.innerHTML = `
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-meta">
        <div class="chip ${task.completed ? 'status-complete' : 'status-pending'}">
          ${task.completed ? 'Completed' : 'Pending'}
        </div>
        <div class="muted">
          ${task.deadline ? formatDate(task.deadline) : 'No deadline'}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn complete">
          ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="action-btn delete">Delete</button>
      </div>
    `;

    const completeBtn = el.querySelector('.complete');
    const deleteBtn = el.querySelector('.delete');

    completeBtn.addEventListener('click', async ()=>{
      try{
        const res = await fetch('/tasks/' + task.id, {   // ✅ FIXED
          method:'PUT',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({...task, completed:!task.completed})
        });

        if(!res.ok) throw new Error('Update failed');

        await loadTasks();

      }catch(err){
        console.error(err);
        alert('Failed to update task');
      }
    });

    deleteBtn.addEventListener('click', async ()=>{
      if(!confirm('Delete this task?')) return;

      try{
        const res = await fetch('/tasks/' + task.id, {  
          method:'DELETE'
        });

        if(!res.ok) throw new Error('Delete failed');

        await loadTasks();

      }catch(err){
        console.error(err);
        alert('Failed to delete task');
      }
    });

    return el;
  }

  function formatDate(d){
    try{
      return new Date(d).toLocaleDateString();
    }catch{
      return d;
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c=>(
      {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]
    ));
  }
});