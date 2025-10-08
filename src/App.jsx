import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // or your CSS file

const STORAGE_KEY = "todos-modern-v1";

const App = () => {
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState("all");

  const [todos, setTodos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const uid = () => Math.random().toString(36).slice(2, 10);

  const addTodo = (e) => {
    e.preventDefault();
    const title = newTodo.trim();
    if (!title) return;
    setTodos([
      { id: uid(), title, done: false, createdAt: Date.now() },
      ...todos,
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const removeTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const updateTodoTitle = (id, newTitle) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.done));

  const filteredTodos = todos.filter((t) =>
    filter === "active" ? !t.done : filter === "completed" ? t.done : true
  );

  const remainingCount = todos.filter((t) => !t.done).length;

  return (
    <>
      <div className="bg" aria-hidden="true"></div>

      <main className="wrap">
        <section className="card" aria-labelledby="app-title">
          {/* HEADER */}
          <header>
            <div className="brand">
              <div
                className="logo"
                style={{ justifyContent: "center" }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* <path
                    d="M4 12.5l5 5 11-11"
                    stroke="#0b1020"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  /> */}
                </svg>
                <p style={{ marginBottom: 16, fontSize: 20 }}>✔️</p>
              </div>
              <div>
                <h1 id="app-title">To-Do</h1>
                <p className="muted">Fast. Plan Your Day.</p>
              </div>
            </div>

            <div className="controls">
              <div className="pill" id="count">
                {remainingCount} item{remainingCount !== 1 ? "s" : ""}
              </div>
              {todos.some((t) => t.done) && (
                <button
                  className="pill"
                  id="clearCompleted"
                  title="Clear completed tasks"
                  onClick={clearCompleted}
                >
                  Clear completed
                </button>
              )}
            </div>
          </header>

          {/* ADD FORM */}
          <form className="add" onSubmit={addTodo} autoComplete="off">
            <input
              id="newTodo"
              name="todo"
              type="text"
              placeholder="What needs doing? (Press Enter)"
              aria-label="New to-do"
              required
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <button className="btn" type="submit" aria-label="Add to-do">
              Add
            </button>
          </form>

          {/* FILTERS */}
          <div className="meta">
            <div className="filters" role="tablist" aria-label="Filter tasks">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  className={`filter ${filter === f ? "active" : ""}`}
                  aria-pressed={filter === f}
                  role="tab"
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="spacer"></div>
            <span className="muted">Double-click a task to edit</span>
          </div>

          {/* TODO LIST */}
          <ul id="list" role="list" aria-live="polite">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                toggleTodo={toggleTodo}
                removeTodo={removeTodo}
                updateTodoTitle={updateTodoTitle}
              />
            ))}
          </ul>

          <hr style={{ color: "whitesmoke" }} />
          <span className="muted">Designed & Developed with 💗 by SIBA007</span>
        </section>
      </main>
    </>
  );
};

const TodoItem = ({ todo, toggleTodo, removeTodo, updateTodoTitle }) => {
  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, [editing]);

  const finishEdit = (commit) => {
    setEditing(false);
    if (commit) {
      const text = tempTitle.trim();
      if (text) updateTodoTitle(todo.id, text);
      else removeTodo(todo.id);
    } else {
      setTempTitle(todo.title);
    }
  };

  return (
    <li className={`item ${todo.done ? "done" : ""}`} data-id={todo.id}>
      {/* TOGGLE BUTTON */}
      <button
        className="check"
        aria-label="Toggle complete"
        onClick={() => toggleTodo(todo.id)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="#0b1020"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* TITLE (editable) */}
      {editing ? (
        <input
          ref={inputRef}
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={() => finishEdit(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishEdit(true);
            if (e.key === "Escape") finishEdit(false);
          }}
          className="title edit-field"
        />
      ) : (
        <div
          className={`title ${todo.done ? "done" : ""}`}
          onDoubleClick={() => setEditing(true)}
        >
          {todo.title}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="row-actions">
        {!editing && (
          <button
            className="iconbtn edit"
            title="Edit"
            aria-label="Edit"
            onClick={() => setEditing(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        )}
        <button
          className="iconbtn del"
          title="Delete"
          aria-label="Delete"
          onClick={() => removeTodo(todo.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </li>
  );
};

export default App;
