document.addEventListener('DOMContentLoaded', () => {

    // --- STEP 2: FORM VALIDATION ---
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const formSuccess = document.getElementById('form-success');
    const toast = document.getElementById('toast');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    contactForm.addEventListener('submit', (e) => {
        let isValid = true;

        // Reset display errors
        nameInput.parentElement.classList.remove('invalid');
        emailInput.parentElement.classList.remove('invalid');

        // Check name input field
        if (nameInput.value.trim() === "") {
            nameInput.parentElement.classList.add('invalid');
            isValid = false;
        }

        // Email regex evaluation pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.parentElement.classList.add('invalid');
            isValid = false;
        }

        // Intercept submit if any condition breaks
        if (!isValid) {
            e.preventDefault();
            showToast('Please fix errors in the form');
        } else {
            e.preventDefault();
            showToast('Message sent — thanks!');
            if (formSuccess) {
                formSuccess.textContent = 'Thank you! Your message was sent.';
                formSuccess.classList.add('show');
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                    formSuccess.textContent = '';
                }, 3500);
            }
            contactForm.reset();
        }
    });

    // Real-time validation utility
    function validateField(input, validator) {
        const parent = input.parentElement;
        if (validator(input.value)) {
            parent.classList.remove('invalid');
            return true;
        } else {
            parent.classList.add('invalid');
            return false;
        }
    }

    nameInput.addEventListener('input', () => validateField(nameInput, v => v.trim() !== ''));
    emailInput.addEventListener('input', () => validateField(emailInput, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())));

    // Simple toast utility
    function showToast(message, ms = 2800) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => toast.classList.remove('show'), ms);
    }

    // Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            if (navLinks.classList.contains('open')) {
                navLinks.style.display = 'flex';
            } else {
                navLinks.style.display = 'none';
            }
        });
    }


    // --- STEP 4: DYNAMIC TO-DO TRACKER ---
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const todoCount = document.getElementById('todo-count');
    const navTodoCount = document.getElementById('nav-todo-count');

    // Load saved tasks
    let tasks = JSON.parse(localStorage.getItem('tasks_v1') || '[]');

    function saveTasks() {
        localStorage.setItem('tasks_v1', JSON.stringify(tasks));
        updateCount();
    }

    function updateCount() {
        if (!todoCount) return;
        todoCount.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
        if (navTodoCount) navTodoCount.textContent = tasks.length;
    }

    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === "") return;
        
        // 1. Create the container list item element
        const li = document.createElement('li');
        li.className = 'todo-item';

        const span = document.createElement('span');
        span.textContent = taskText;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;'; 

        // 2. Generate unique tracking credentials
        const id = String(Date.now());
        tasks.push({ id, text: taskText, completed: false });
        li.dataset.id = id;

        // Toggle complete dynamic monitoring click action
        span.addEventListener('click', () => {
            li.classList.toggle('completed');
            const idx = tasks.findIndex(t => t.id === li.dataset.id);
            if (idx > -1) {
                tasks[idx].completed = li.classList.contains('completed');
                saveTasks();
            }
        });

        // Removal update engine action
        deleteBtn.addEventListener('click', () => {
            li.remove();
            tasks = tasks.filter(t => t.id !== li.dataset.id);
            saveTasks();
            showToast('Task removed');
        });

        // 3. Assemble structural DOM layout branches
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);

        // 4. Flush control state systems
        todoInput.value = "";
        todoInput.focus();
        saveTasks();
    }

    // Bind triggers for dynamic addition UI action
    if (addTodoBtn) {
        addTodoBtn.addEventListener('click', addTask);
    }
    if (todoInput) {
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    // Render operational existing elements
    function renderTasks() {
        if (!todoList) return;
        todoList.innerHTML = '';
        
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (t.completed ? ' completed' : '');
            li.dataset.id = t.id;

            const span = document.createElement('span');
            span.textContent = t.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            
            deleteBtn.addEventListener('click', () => {
                li.remove();
                tasks = tasks.filter(x => x.id !== t.id);
                saveTasks();
                showToast('Task removed');
            });

            span.addEventListener('click', () => {
                li.classList.toggle('completed');
                const idx = tasks.findIndex(x => x.id === t.id);
                if (idx > -1) {
                    tasks[idx].completed = li.classList.contains('completed');
                    saveTasks();
                }
            });

            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
        updateCount();
    }

    // Run active render pass on load initialization
    renderTasks();

    // Active link highlighting using IntersectionObserver
    const sections = document.querySelectorAll('main .card');
    const navLinksEls = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = document.querySelector(`.nav-link[href="#${id}"]`);
                if (link) {
                    if (entry.isIntersecting) link.classList.add('active');
                    else link.classList.remove('active');
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(s => obs.observe(s));
    }

    // Close mobile nav after clicking a link
    document.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', () => {
            const navLinksEl = document.querySelector('.nav-links');
            if (navLinksEl && navLinksEl.classList.contains('open')) {
                navLinksEl.classList.remove('open');
                navLinksEl.style.display = 'none';
            }
        });
    });

    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
            showToast('Cleared completed tasks');
        });
    }
});