const API_URL = 'http://localhost:5000/api/tasks';

let currentFilter = 'all';

function setFilter(filter) {
    clearError();

    currentFilter = filter;
    loadTasks();

    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
        button.classList.remove('selected');
    });

    const activeButton = document.getElementById(`${filter}-button`);
    if (activeButton) {
        activeButton.classList.add('selected');
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');

    li.innerHTML = `
        <input type="checkbox" id="checkbox-${task.id}" ${task.completed ? 'checked' : ''}/>
        <label for="checkbox-${task.id}" id="label-${task.id}" class="${task.completed ? 'completed' : ''}"></label>
        <button class="delete-button">&times;</button>
    `;

    const label = li.querySelector('label');
    label.textContent = task.title;

    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const button = li.querySelector('button');
    button.addEventListener('click', () => deleteTask(task.id));

    return li;
}

async function loadTasks() {
    try {
        let url = new URL(API_URL);

        if (currentFilter === 'completed') {
            url.searchParams.append('completed', 'true');
        } else if (currentFilter === 'uncompleted') {
            url.searchParams.append('completed', 'false');
        }

        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status} ${error.error}` || 'Failed to load tasks' );
        }

        const data = await response.json();
        const tasks = data.data;
        const taskList = document.getElementById('tasks');
        taskList.innerHTML = '';
    
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    } catch (err) {
        showError(err.message || 'Unexpected error');
    }
}

async function addTask() {
    clearError();

    try {
        const taskInput = document.getElementById('input-box');
        const task = taskInput.value.trim();
        
        if (!task) {
            taskInput.value = '';
            showError('Title is required');
            return;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: task })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status} ${error.error}` || 'Failed to create a task' );
        }

        const newTask = (await response.json()).data;
        taskInput.value = '';

        if (currentFilter === 'all' || (currentFilter === 'uncompleted' && !newTask.completed)) {
            const taskList = document.getElementById('tasks');
            
            taskList.appendChild(createTaskElement(newTask));
        }

        loadTaskStats();
    } catch (err) {
        showError(err.message || 'Unexpected error');
    }
}

async function toggleTask(id, completed) {
    clearError();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status} ${error.error}` || 'Failed to update a task' );
        }

        const updatedTask = await response.json();

        const label = document.getElementById(`label-${id}`);
        label.classList.toggle("completed", updatedTask.data.completed);
        
        const taskElement = document.getElementById(`checkbox-${id}`).closest('li');

        if (
            (currentFilter === 'completed' && !updatedTask.data.completed) ||
            (currentFilter === 'uncompleted' && updatedTask.data.completed)
        ) {
            taskElement.remove();
        }

        loadTaskStats();
    } catch (err) {
        showError(err.message || 'Unexpected error');
    }
}

async function deleteTask(id) {
    clearError();

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status} ${error.error}` || 'Failed to delete a task' );
        }

        const taskElement = document.getElementById(`checkbox-${id}`).closest('li');
        taskElement.remove();

        loadTaskStats();
    } catch (err) {
        showError(err.message || 'Unexpected error');
    }
}

async function loadTaskStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`${response.status} ${error.error}` || 'Failed to load task stats' );
        }
    
        const data = await response.json();
        const stats = data.data;

        console.log(data);
    
        document.getElementById('completed-counter').textContent = stats.completed;
        document.getElementById('uncompleted-counter').textContent = stats.uncompleted;
    } catch (err) {
        showError(err.message || 'Unexpected error');
    }
}

function showError(message) {
    const errorBox = document.getElementById('error-message');
    errorBox.textContent = message;
    errorBox.classList.add('visible');
}

function clearError() {
    const errorBox = document.getElementById('error-message');
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
}

function setupEventListeners() {
    document.getElementById('input-button').addEventListener('click', addTask);

    const taskInput = document.getElementById('input-box');
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    document.getElementById('all-button').addEventListener('click', () => setFilter('all'));
    document.getElementById('completed-button').addEventListener('click', () => setFilter('completed'));
    document.getElementById('uncompleted-button').addEventListener('click', () => setFilter('uncompleted'));
}

function init() {
    setupEventListeners();
    loadTasks();
    loadTaskStats();
}

init();