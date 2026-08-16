// ============================================
// TASK DECK — app logic
// ============================================

const STORAGE_KEY = 'task-deck.tasks';

const addForm = document.getElementById('addForm');
const taskInput = document.getElementById('taskInput');
const swatchGroup = document.getElementById('swatchGroup');
const filterRow = document.getElementById('filterRow');
const clearDoneBtn = document.getElementById('clearDone');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const counter = document.getElementById('counter');

let tasks = loadTasks();
let activeFilter = 'all';
let activeColor = 'amber';

// ---------- Persistence ----------

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Could not load tasks:', e);
    return [];
  }
}

function saveTasks(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }catch(e){
    console.error('Could not save tasks:', e);
  }
}

// ---------- Rendering ----------

const CHECK_ICON = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 8.5L6.2 12L13 4" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function getVisibleTasks(){
  if(activeFilter === 'active') return tasks.filter(t => !t.done);
  if(activeFilter === 'done') return tasks.filter(t => t.done);
  return tasks;
}

function render(){
  const visible = getVisibleTasks();
  taskList.innerHTML = '';

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = `keycap color-${task.color}${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="check" aria-label="Toggle complete">${CHECK_ICON}</button>
      <span class="task-text"></span>
      <button class="del" aria-label="Delete task">✕</button>
    `;
    li.querySelector('.task-text').textContent = task.text;

    taskList.appendChild(li);
  });

  const noneAtAll = tasks.length === 0;
  const noneInFilter = visible.length === 0 && !noneAtAll;
  emptyState.classList.toggle('show', noneAtAll);
  emptyState.textContent = noneAtAll
    ? 'The deck is empty. Add your first key above.'
    : '';
  if(noneInFilter){
    emptyState.classList.add('show');
    emptyState.textContent = activeFilter === 'done'
      ? 'No finished keys yet.'
      : 'Nothing active — nice work.';
  }

  const remaining = tasks.filter(t => !t.done).length;
  const doneCount = tasks.length - remaining;
  counter.textContent = tasks.length === 0
    ? '0 tasks'
    : `${remaining} open · ${doneCount} done · ${tasks.length} total`;
}

// ---------- Actions ----------

function addTask(text){
  const trimmed = text.trim();
  if(!trimmed) return;
  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    text: trimmed,
    color: activeColor,
    done: false
  });
  saveTasks();
  render();
}

function toggleTask(id){
  const task = tasks.find(t => t.id === id);
  if(task) task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id){
  const li = taskList.querySelector(`[data-id="${id}"]`);
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearDone(){
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// ---------- Event listeners ----------

addForm.addEventListener('submit', e => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

swatchGroup.addEventListener('click', e => {
  const btn = e.target.closest('.swatch');
  if(!btn) return;
  activeColor = btn.dataset.color;
  swatchGroup.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s === btn);
    s.setAttribute('aria-pressed', s === btn ? 'true' : 'false');
  });
});

filterRow.addEventListener('click', e => {
  const btn = e.target.closest('.fkey');
  if(!btn || btn === clearDoneBtn) return;
  activeFilter = btn.dataset.filter;
  filterRow.querySelectorAll('.fkey').forEach(f => f.classList.toggle('active', f === btn));
  render();
});

clearDoneBtn.addEventListener('click', clearDone);

taskList.addEventListener('click', e => {
  const li = e.target.closest('.keycap');
  if(!li) return;
  const id = li.dataset.id;

  if(e.target.closest('.check')){
    toggleTask(id);
  }else if(e.target.closest('.del')){
    deleteTask(id);
  }
});

// ---------- Seed data (only on first-ever load) ----------

if(tasks.length === 0 && localStorage.getItem(STORAGE_KEY) === null){
  tasks = [
    { id: crypto.randomUUID ? crypto.randomUUID() : '1', text: 'Drag this key to delete it', color: 'coral', done: false },
    { id: crypto.randomUUID ? crypto.randomUUID() : '2', text: 'Click the checkbox to press a task in', color: 'mint', done: false },
    { id: crypto.randomUUID ? crypto.randomUUID() : '3', text: 'Pick a color before adding a new task', color: 'peri', done: false },
    { id: crypto.randomUUID ? crypto.randomUUID() : '4', text: 'This one is already done', color: 'amber', done: true }
  ];
  saveTasks();
}

// ---------- Init ----------

render();