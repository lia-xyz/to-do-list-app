const API_URL = 'http://localhost:5000/api/tasks';

let currentFilter = 'all';

function setFilter(filter) {
    currentFilter = filter;
    loadTasks();
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

    const button = li.querySelector('button.delete-button');
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
        const data = await response.json();
        const tasks = data.data;
        const taskList = document.getElementById('tasks');
        taskList.innerHTML = '';
    
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });

    } catch (err) {
        console.error('Failed to load tasks:', err);
    }
}

async function addTask() {
    try {
        const taskInput = document.getElementById('input-box');
        const task = taskInput.value.trim();
        if (!task) return;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: task })
        });

        const newTask = (await response.json()).data;
        taskInput.value = '';

        if (currentFilter === 'all' || (currentFilter === 'uncompleted' && !newTask.completed)) {
            document.getElementById('tasks').appendChild(createTaskElement(newTask));
        }

    } catch (err) {
        console.error('Failed to add task:', err);
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });

        const checkbox = document.getElementById(`checkbox-${id}`);
        const label = document.getElementById(`label-${id}`);
        label.classList.toggle("completed", checkbox.checked);

    } catch (err) {
        console.error('Failed to toggle task:', err);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        const taskElement = document.getElementById(`checkbox-${id}`).closest('li');
        taskElement.remove();

    } catch (err) {
        console.error('Failed to delete task:', err);
    }
}

function setupEventListeners() {
    document.getElementById('input-button').addEventListener('click', addTask);
    document.getElementById('all-button').addEventListener('click', () => setFilter('all'));
    document.getElementById('completed-button').addEventListener('click', () => setFilter('completed'));
    document.getElementById('uncompleted-button').addEventListener('click', () => setFilter('uncompleted'));
}

function init() {
    setupEventListeners();
    loadTasks();
}

init();