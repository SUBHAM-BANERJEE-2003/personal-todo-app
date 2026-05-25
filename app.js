// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoCategory = document.getElementById('todo-category');
const todoStart = document.getElementById('todo-start');
const todoEnd = document.getElementById('todo-end');
const todoDesc = document.getElementById('todo-desc');
const todoPin = document.getElementById('todo-pin');
const todoList = document.getElementById('todo-list');
const themeToggle = document.getElementById('theme-toggle');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const filterBtns = document.querySelectorAll('.filter-btn');

// App State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTodos();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Render Todos
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        if (['examstudy','technology','coding'].includes(currentFilter)) return todo.category === currentFilter;
        return true;
    });

    // show pinned first
    const sorted = filteredTodos.slice().sort((a,b) => {
        if (a.pinned === b.pinned) return b.createdAt - a.createdAt;
        return (a.pinned ? -1 : 1);
    });

    sorted.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.pinned ? 'pinned' : ''}`;
        li.dataset.id = todo.id;

        const startText = todo.start ? new Date(todo.start).toLocaleString() : '';
        const endText = todo.end ? new Date(todo.end).toLocaleString() : '';

        li.innerHTML = `
            <div class="todo-content">
                <button class="check-btn" aria-label="Complete task">
                    <i class="fas fa-check"></i>
                </button>
                <div style="display:flex;flex-direction:column;gap:6px;flex:1;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span class="todo-text">${escapeHTML(todo.text)}</span>
                        <span class="category-badge category-${escapeHTML(todo.category)}">${escapeHTML(capitalize(todo.category))}</span>
                    </div>
                    <div class="meta">
                        ${todo.description ? escapeHTML(todo.description) + ' · ' : ''}
                        ${startText ? 'Start: ' + escapeHTML(startText) + (endText ? ' · ' : '') : ''}
                        ${endText ? 'End: ' + escapeHTML(endText) : ''}
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
                <button class="pin-btn" title="Pin/Unpin">
                    <i class="fas fa-thumbtack"></i>
                </button>
                <button class="delete-btn" aria-label="Delete task">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });

    updateStats();
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add Todo
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (!taskText) return;

    const newTodo = {
        id: Date.now().toString(),
        text: taskText,
        category: todoCategory.value || 'examstudy',
        start: todoStart.value || null,
        end: todoEnd.value || null,
        description: todoDesc.value.trim() || '',
        pinned: !!todoPin.checked,
        completed: false,
        createdAt: Date.now()
    };

    todos.unshift(newTodo); // Add new items to the top
    todoForm.reset();
    renderTodos();
});

// Event Delegation for List Items (Check/Delete)
todoList.addEventListener('click', (e) => {
    const target = e.target;
    const todoItem = target.closest('.todo-item');
    if (!todoItem) return;
    
    const id = todoItem.dataset.id;

    if (target.closest('.check-btn')) {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        renderTodos();
    }

    if (target.closest('.delete-btn')) {
        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
    }

    if (target.closest('.pin-btn')) {
        todos = todos.map(todo => todo.id === id ? { ...todo, pinned: !todo.pinned } : todo);
        renderTodos();
    }
});

// Filter Switching
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Update Counters
function updateStats() {
    const totalCompleted = todos.filter(t => t.completed).length;
    const totalPending = todos.length - totalCompleted;
    
    completedCount.textContent = totalCompleted;
    pendingCount.textContent = totalPending;
}

// Utility to prevent XSS if you copy-paste raw content
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }