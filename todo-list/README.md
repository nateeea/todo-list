# ToDo List Application

A full-stack todo list application with a Node.js backend API and a vanilla JavaScript frontend, styled with Tailwind CSS.

## Features

- Create, read, update, and delete todos
- Filter todos by status (open/done)
- Search todos by text
- Persistent storage using JSON file
- Responsive UI with Tailwind CSS
- Automated testing with Playwright
- Real-time statistics (total, open, done items)

## Prerequisites

Before running this application, make sure you have:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository or download the project files

2. Navigate to the project directory:
   ```bash
   cd todo-list
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the server

```bash
npm start
```

The server will start on `http://localhost:4004` by default.

### Development mode (with auto-rebuild)

```bash
npm run dev
```

This runs the server and watches for Tailwind CSS changes concurrently.

### Build Tailwind CSS

To compile the Tailwind CSS (with watch mode):
```bash
npm run tailwind
```

## Using the Application

1. Open your browser and navigate to `http://localhost:4004`
2. Use the interface to:
   - Add new todos by entering text and clicking "Add"
   - Mark todos as complete/incomplete
   - Edit todo text
   - Delete todos
   - Filter todos by status
   - Search todos by text

## API Endpoints

The application provides a RESTful JSON API:

### Health Check
```
GET /api/health
```
Returns: `{ "ok": true }`

### List Todos
```
GET /api/list?done=<true|false>&q=<search_text>
```
Returns all todos, with optional filtering by status and text search.

### Get Single Item
```
GET /api/item/get?id=<id>
```
Returns a specific todo by ID.

### Add Todo
```
GET /api/item/add?text=<text>
```
Creates a new todo with the specified text.

### Update Todo
```
GET /api/item/update?id=<id>&text=<text>&done=<true|false>
```
Updates an existing todo's text and/or status.

### Delete Todo
```
GET /api/item/delete?id=<id>
```
Deletes a todo by ID.

## Testing

Run automated tests with Playwright:

```bash
npm test
```

Tests are located in the `tests/` directory.

## Project Structure

```
todo-list/
├── data/
│   └── todos.json          # Persistent data storage
├── frontend/
│   ├── appState.js         # State management
│   ├── dom.js              # DOM manipulation utilities
│   └── index.js            # Main frontend logic
├── public/
│   ├── index.html          # Main HTML page
│   ├── logic.js            # Client-side logic
│   ├── output.css          # Compiled Tailwind CSS
│   └── style.css           # Custom styles
├── tailwind/
│   └── input.css           # Tailwind CSS source
├── tests/
│   └── *.js                # Playwright test files
├── package.json            # Project dependencies and scripts
├── playwright.config.js    # Playwright configuration
└── server.js               # Node.js HTTP server
```

## Technologies Used

- **Backend**: Node.js (vanilla HTTP server)
- **Frontend**: Vanilla JavaScript (no framework)
- **Styling**: Tailwind CSS
- **Testing**: Playwright
- **Build Tools**: esbuild, concurrently

## Data Persistence

Todos are stored in `data/todos.json` and persist between server restarts. The file is automatically created on first use.

## Author

Nathan Brubaker

## License

ISC
