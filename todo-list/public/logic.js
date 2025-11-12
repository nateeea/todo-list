"use strict";

let filter = "open", search = "";
const el = id => document.getElementById(id);
const api = (path) => fetch(path).then(r => r.json());

// Display all tasks based on current filter and search
async function render() {
  let done = filter === "open" ? false : filter === "done" ? true : null;
  const url = `/api/list${done !== null ? `?done=${done}` : ""}${search ? `${done !== null ? "&" : "?"}q=${encodeURIComponent(search)}` : ""}`;
  const res = await api(url);
  let items = res.items || [];
  
  const list = el("todo-list");
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = item.id;
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-toggle";
    checkbox.checked = item.done;
    checkbox.onchange = () => toggle(item.id);
    
    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = item.text;
    text.style.textDecoration = item.done ? "line-through" : "none";
    text.onclick = () => edit(item.id, item.text);
    
    const btn = document.createElement("button");
    btn.className = "todo-delete";
    btn.textContent = "×";
    btn.onclick = () => del(item.id);
    
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(btn);
    list.appendChild(li);
  });
  
  const stats = await api("/api/stats");
  el("stat-total").textContent = stats.stats.total;
  el("stat-open").textContent = stats.stats.open;
  el("stat-done").textContent = stats.stats.done;
}

// Add a new task
async function add() {
  const text = el("add-input").value.trim();
  if (text) {
    await api(`/api/item/add?text=${encodeURIComponent(text)}&done=false`);
    el("add-input").value = "";
    render();
  }
}

// Toggle a task between done and not done
async function toggle(id) {
  await api(`/api/item/toggle?id=${id}`);
  render();
}

// Delete a task
async function del(id) {
  await api(`/api/item/delete?id=${id}`);
  render();
}

// Edit a task's text
async function edit(id, text) {
  const newText = prompt("Edit:", text);
  if (newText && newText.trim()) {
    await api(`/api/item/update?id=${id}&text=${encodeURIComponent(newText)}`);
    render();
  }
}

// Change the filter view (all, open, done)
function setFilter(f) {
  filter = f;
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("bg-blue-500", btn.dataset.filter === f);
    btn.classList.toggle("text-white", btn.dataset.filter === f);
    btn.classList.toggle("bg-gray-300", btn.dataset.filter !== f);
  });
  render();
}

// Used AI to help write this function
document.addEventListener("DOMContentLoaded", () => {
  el("add-submit").onclick = add;
  el("add-input").onkeypress = (e) => { if (e.key === "Enter") add(); };
  el("clear-btn").onclick = () => api("/api/clear-completed").then(() => render());
  el("search-input").oninput = (e) => { search = e.target.value; render(); };
  document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
    btn.onclick = () => setFilter(btn.dataset.filter);
  });
  setFilter("open");
  render();
});