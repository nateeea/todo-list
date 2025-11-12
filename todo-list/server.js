"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 4004;
const ROOT = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "todos.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// MIME types by extension
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ico": "image/x-icon",
};

// Only serve these files
const ALLOWED = new Set(["/favicon.ico", "/index.html", "/output.css", "/style.css", "/logic.js"]);

// ============================================
// Data Store
// ============================================

let todos = [];
let nextId = 1;

function loadTodos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      todos = data.todos || [];
      nextId = data.nextId || 1;
    }
  } catch {
    todos = [];
    nextId = 1;
  }
}

function saveTodos() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ todos, nextId }, null, 2));
}

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendFile(res, filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  try {
    const data = fs.readFileSync(filepath);
    res.writeHead(200, { "Content-Type": type, "Content-Length": data.length });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

// ============================================
// API Endpoints
// ============================================

function handleAPI(pathname, query, res) {
  // Health check
  if (pathname === "/api/health") {
    return sendJSON(res, { ok: true });
  }

  // List todos
  if (pathname === "/api/list") {
    let filtered = todos;
    if (query.done !== undefined) {
      const done = query.done === "true";
      filtered = filtered.filter(t => t.done === done);
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      filtered = filtered.filter(t => t.text.toLowerCase().includes(q));
    }
    return sendJSON(res, { ok: true, items: filtered });
  }

  // Get single item
  if (pathname === "/api/item/get") {
    const id = parseInt(query.id);
    const item = todos.find(t => t.id === id);
    if (!item) return sendJSON(res, { ok: false, error: "Item not found" }, 404);
    return sendJSON(res, { ok: true, item });
  }

  // Add item
  if (pathname === "/api/item/add") {
    const text = query.text;
    const done = query.done === "true" || false;
    if (!text || !text.trim()) {
      return sendJSON(res, { ok: false, error: "Text is required" }, 400);
    }
    const item = { id: nextId++, text: text.trim(), done };
    todos.push(item);
    saveTodos();
    return sendJSON(res, { ok: true, item });
  }

  // Update item
  if (pathname === "/api/item/update") {
    const id = parseInt(query.id);
    const text = query.text;
    if (!text || !text.trim()) {
      return sendJSON(res, { ok: false, error: "Text is required" }, 400);
    }
    const item = todos.find(t => t.id === id);
    if (!item) return sendJSON(res, { ok: false, error: "Item not found" }, 404);
    item.text = text.trim();
    saveTodos();
    return sendJSON(res, { ok: true, item });
  }

  // Toggle item
  if (pathname === "/api/item/toggle") {
    const id = parseInt(query.id);
    const item = todos.find(t => t.id === id);
    if (!item) return sendJSON(res, { ok: false, error: "Item not found" }, 404);
    item.done = !item.done;
    saveTodos();
    return sendJSON(res, { ok: true, item });
  }

  // Delete item
  if (pathname === "/api/item/delete") {
    const id = parseInt(query.id);
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return sendJSON(res, { ok: false, error: "Item not found" }, 404);
    todos.splice(index, 1);
    saveTodos();
    return sendJSON(res, { ok: true });
  }

  // Clear completed
  if (pathname === "/api/clear-completed") {
    todos = todos.filter(t => !t.done);
    saveTodos();
    return sendJSON(res, { ok: true });
  }

  // Stats
  if (pathname === "/api/stats") {
    const stats = {
      total: todos.length,
      open: todos.filter(t => !t.done).length,
      done: todos.filter(t => t.done).length,
    };
    return sendJSON(res, { ok: true, stats });
  }

  // Unknown API
  return sendJSON(res, { ok: false, error: "Endpoint not found" }, 404);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + req.headers.host);
  const pathname = url.pathname;
  const query = Object.fromEntries(url.searchParams);

  // API routes
  if (pathname.startsWith("/api/")) {
    return handleAPI(pathname, query, res);
  }

  // Static files
  let filePath = pathname;
  if (filePath === "/") filePath = "/index.html";
  
  if (!ALLOWED.has(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  const filepath = path.join(ROOT, filePath.slice(1));
  sendFile(res, filepath);
});

// Load todos on startup
loadTodos();

server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});