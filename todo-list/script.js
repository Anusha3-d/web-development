const STORAGE_KEY = "daybook.tasks.v1";

const taskList = document.getElementById("taskList");
const addForm = document.getElementById("addForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const filtersEl = document.getElementById("filters");
const taskCountEl = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");
const template = document.getElementById("taskTemplate");
const todayDateEl = document.getElementById("todayDate");

let tasks = loadTasks();
let currentFilter = "all";

// ===== Date header =====
todayDateEl.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ===== Persistence =====
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not load tasks from storage:", err);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks to storage:", err);
  }
}

function generateId() {
  return `t-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ===== Rendering =====
function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";

  filtered.forEach((task) => {
    const node = template.content.cloneNode(true);
    const li = node.querySelector(".task-item");
    const checkbox = node.querySelector(".task-checkbox");
    const textEl = node.querySelector(".task-text");
    const editInput = node.querySelector(".task-edit-input");
    const editBtn = node.querySelector(".task-edit");
    const deleteBtn = node.querySelector(".task-delete");

    li.dataset.id = task.id;
    li.dataset.priority = task.priority;
    li.classList.toggle("is-completed", task.completed);
    checkbox.checked = task.completed;
    textEl.textContent = task.text;
    editInput.value = task.text;

    checkbox.addEventListener("change", () => toggleComplete(task.id));
    textEl.addEventListener("dblclick", () => enterEditMode(li));
    editBtn.addEventListener("click", () => enterEditMode(li));
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") commitEdit(li);
      if (e.key === "Escape") exitEditMode(li, false);
    });
    editInput.addEventListener("blur", () => commitEdit(li));

    taskList.appendChild(node);
  });

  emptyState.hidden = filtered.length > 0;
  updateCount();
}

function updateCount() {
  const remaining = tasks.filter((t) => !t.completed).length;
  taskCountEl.textContent = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;
}

// ===== Edit mode =====
function enterEditMode(li) {
  const textEl = li.querySelector(".task-text");
  const editInput = li.querySelector(".task-edit-input");
  textEl.hidden = true;
  editInput.hidden = false;
  editInput.focus();
  editInput.select();
}

function exitEditMode(li) {
  const textEl = li.querySelector(".task-text");
  const editInput = li.querySelector(".task-edit-input");
  textEl.hidden = false;
  editInput.hidden = true;
}

function commitEdit(li) {
  const id = li.dataset.id;
  const editInput = li.querySelector(".task-edit-input");
  const newText = editInput.value.trim();
  const task = tasks.find((t) => t.id === id);

  if (task && newText.length > 0) {
    task.text = newText;
    saveTasks();
  }
  exitEditMode(li);
  render();
}

// ===== Core actions =====
function addTask(text, priority) {
  tasks.unshift({
    id: generateId(),
    text: text.trim(),
    completed: false,
    priority,
    createdAt: Date.now(),
  });
  saveTasks();
  render();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
}

// ===== Event listeners =====
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text, priorityInput.value);
  taskInput.value = "";
  priorityInput.value = "normal";
  taskInput.focus();
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.remove("is-active");
    b.setAttribute("aria-selected", "false");
  });
  btn.classList.add("is-active");
  btn.setAttribute("aria-selected", "true");
  currentFilter = btn.dataset.filter;
  render();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// ===== Init =====
render();
