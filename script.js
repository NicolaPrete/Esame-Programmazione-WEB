// Store tasks
let tasks = [];
let editTaskId = null;

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const editModal = document.getElementById('editModal');
const editTaskName = document.getElementById('editTaskName');
const editTaskStatus = document.getElementById('editTaskStatus');
const closeBtn = document.querySelector('.close');

// Close modal when clicking the X
closeBtn.onclick = function() {
    editModal.style.display = "none";
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
}

// Add a new task
function addTask() {
    const taskName = taskInput.value.trim();
    
    if (taskName !== '') {
        const newTask = {
            id: Date.now(),
            name: taskName,
            status: 'todo' // Default status
        };
        
        tasks.push(newTask);
        taskInput.value = '';
        renderTasks();
    }
}

// Remove a task
function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
}

// Open edit modal
function openEditModal(taskId) {
    editTaskId = taskId;
    const task = tasks.find(task => task.id === taskId);
    
    if (task) {
        editTaskName.value = task.name;
        editTaskStatus.value = task.status;
        editModal.style.display = "block";
    }
}

// Save task edits
function saveTaskEdit() {
    if (editTaskId) {
        const taskIndex = tasks.findIndex(task => task.id === editTaskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].name = editTaskName.value.trim();
            tasks[taskIndex].status = editTaskStatus.value;
            editModal.style.display = "none";
            renderTasks();
        }
    }
}

// Cycle through task status
function cycleTaskStatus(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const statusCycle = {
            'todo': 'in-progress',
            'in-progress': 'completed',
            'completed': 'todo'
        };
        
        tasks[taskIndex].status = statusCycle[tasks[taskIndex].status];
        renderTasks();
    }
}

// Filter tasks based on status and search term
function filterTasks() {
    renderTasks();
}

// Render tasks to the DOM
function renderTasks() {
    const statusFilterValue = statusFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredTasks = tasks;
    
    // Apply status filter
    if (statusFilterValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilterValue);
    }
    
    // Apply search filter
    if (searchTerm !== '') {
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Clear current list
    taskList.innerHTML = '';
    
    // Show empty message if no tasks
    if (filteredTasks.length === 0) {
        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-message">Nessuna attività presente. Aggiungi qualcosa!</li>';
        } else {
            taskList.innerHTML = '<li class="empty-message">Nessun risultato per i filtri applicati.</li>';
        }
        return;
    }
    
    // Add filtered tasks to the list
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.status}`;
        
        let statusText = '';
        switch(task.status) {
            case 'todo':
                statusText = 'Da fare';
                break;
            case 'in-progress':
                statusText = 'In corso';
                break;
            case 'completed':
                statusText = 'Completata';
                break;
        }
        
        taskItem.innerHTML = `
            <div class="task-content">
                <span class="task-status ${task.status}">${statusText}</span>
                <span class="task-name ${task.status === 'completed' ? 'completed' : ''}">${task.name}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-status" onclick="cycleTaskStatus(${task.id})">Stato</button>
                <button class="btn btn-edit" onclick="openEditModal(${task.id})">Modifica</button>
                <button class="btn btn-delete" onclick="removeTask(${task.id})">Elimina</button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

// Initialize
renderTasks();

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});