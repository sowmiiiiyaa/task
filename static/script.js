// Default API base — change if your backend runs elsewhere.
const API_BASE = 'http://127.0.0.1:8000';

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

  // hero CTA removed — no click listener needed

  // load tasks
  loadTasks();

  // init particle atmosphere
  try{ initParticlesCanvas(); }catch(e){console.warn('Particles init failed', e)}

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
      const res = await fetch(API_BASE + '/tasks');
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
      emptyState.textContent = `Could not load tasks (check backend at ${API_BASE})`;
      console.error('Error loading tasks from', API_BASE, err);
    }
  }

  async function createTask(payload){
    try{
      const res = await fetch(API_BASE + '/tasks', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error('Create failed');
      // refresh list so empty state hides and layout is correct
      await loadTasks();
    }catch(err){
      alert('Failed to add task — check backend at ' + API_BASE);
      console.error('Create task error', err);
    }
  }

  function renderTask(task){
    const el = document.createElement('div');
    el.className = 'task-item glass';
    el.innerHTML = `
      <div class="glow-spark"></div>
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-meta">
        <div class="chip ${task.completed ? 'status-complete' : 'status-pending'}">${task.completed ? 'Completed' : 'Pending'}</div>
        <div class="muted">${task.deadline ? formatDate(task.deadline) : 'No deadline'}</div>
      </div>
      <div class="task-actions">
        <button class="action-btn complete">${task.completed ? 'Undo' : 'Complete'}</button>
        <button class="action-btn delete">Delete</button>
      </div>
    `;

    const completeBtn = el.querySelector('.complete');
    const deleteBtn = el.querySelector('.delete');

    completeBtn.addEventListener('click', async ()=>{
      try{
        const res = await fetch(API_BASE + '/tasks/' + task.id, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...task,completed:!task.completed})});
        if(!res.ok) throw new Error('Update failed');
        await loadTasks();
      }catch(err){ console.error(err); alert('Failed to update task'); }
    });

    deleteBtn.addEventListener('click', async ()=>{
      if(!confirm('Delete this task?')) return;
      try{
        const res = await fetch(API_BASE + '/tasks/' + task.id, {method:'DELETE'});
        if(!res.ok) throw new Error('Delete failed');
        await loadTasks();
      }catch(err){ console.error(err); alert('Failed to delete task'); }
    });

    return el;
  }

  function formatDate(d){
    try{ const dt = new Date(d); return dt.toLocaleDateString(); }catch(e){return d}
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

});

/* Particles / subtle floating lights for atmosphere */
function initParticlesCanvas(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
  let particles = [];

  function resize(){
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    // regenerate particle count based on area
    const area = W * H;
    const target = Math.max(30, Math.min(120, Math.floor(area / 9000)));
    if(particles.length < target){
      for(let i=particles.length;i<target;i++) particles.push(createParticle(true));
    } else if(particles.length > target){
      particles = particles.slice(0,target);
    }
  }

  function createParticle(fromEdge=false){
    const x = fromEdge ? (W * (0.3 + Math.random()*0.4)) : Math.random()*W;
    const y = fromEdge ? (H + Math.random()*H*0.2) : Math.random()*H;
    return {
      x, y,
      vx: (Math.random()-0.5) * 0.15,
      vy: - (0.15 + Math.random()*0.6),
      r: 0.6 + Math.random()*2.2,
      alpha: 0.12 + Math.random()*0.28,
      hue: 210 + Math.random()*60
    };
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    for(let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= 1; // placeholder for future effects
      // draw
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      grad.addColorStop(0, `hsla(${p.hue},80%,65%,${p.alpha})`);
      grad.addColorStop(0.4, `hsla(${p.hue},70%,55%,${p.alpha*0.35})`);
      grad.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - p.r*6, p.y - p.r*6, p.r*12, p.r*12);

      // recycle
      if(p.y < -20 || p.x < -50 || p.x > W+50){
        Object.assign(p, createParticle(true));
      }
    }
    raf = requestAnimationFrame(step);
  }

  let raf = null;
  let hidden = false;
  function visibilityChanged(){
    if(document.hidden){ hidden = true; if(raf) cancelAnimationFrame(raf); }
    else { if(hidden){ hidden = false; raf = requestAnimationFrame(step); } }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibilityChanged);
  resize();
  raf = requestAnimationFrame(step);
}
