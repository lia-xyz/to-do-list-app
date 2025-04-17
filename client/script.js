const API_URL = 'http://localhost:5000/api/tasks';

let currentFilter = 'all';

function setFilter(filter) {
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

        if (!response.ok) {
            throw new Error(`Failed to load tasks: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const tasks = data.data;
        const taskList = document.getElementById('tasks');
        taskList.innerHTML = '';

        if(tasks.length === 0){
            taskList.innerHTML = `<li class="no-tasks">No Tasks</li>`;
        }
    
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });

    } catch (err) {
        console.error('Failed to load tasks:', err);
        alert("There was an error loading tasks. Please try again.");
    }
}

async function addTask() {
    try {
        const taskInput = document.getElementById('input-box');
        const task = taskInput.value.trim();
        if (!task) {
            taskInput.value = '';
            return;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: task })
        });

        if (!response.ok) {
            throw new Error(`Failed to add task: ${response.status} ${response.statusText}`);
        }

        const newTask = (await response.json()).data;
        taskInput.value = '';

        if (currentFilter === 'all' || (currentFilter === 'uncompleted' && !newTask.completed)) {
            document.getElementById('tasks').appendChild(createTaskElement(newTask));
        }

    } catch (err) {
        console.error('Failed to add task:', err);
        alert("There was an error adding the task. Please try again.");
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });

        if (!response.ok) {
            throw new Error(`Failed to toggle task: ${response.status} ${response.statusText}`);
        }

        const checkbox = document.getElementById(`checkbox-${id}`);
        const label = document.getElementById(`label-${id}`);
        label.classList.toggle("completed", checkbox.checked);

        const updatedTask = await response.json();
        
        const taskElement = document.getElementById(`checkbox-${id}`).closest('li');

        if (
            (currentFilter === 'completed' && !updatedTask.data.completed) ||
            (currentFilter === 'uncompleted' && updatedTask.data.completed)
        ) {
            taskElement.remove();
        }

    } catch (err) {
        console.error('Failed to toggle task:', err);
        alert("There was an error updating the task. Please try again.");
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
        }

        const taskElement = document.getElementById(`checkbox-${id}`).closest('li');
        taskElement.remove();

    } catch (err) {
        console.error('Failed to delete task:', err);
        alert("There was an error deleting the task. Please try again.");
    }
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
}

init();