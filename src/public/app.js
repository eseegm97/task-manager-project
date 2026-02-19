const statusText = document.getElementById('status-text');
const toast = document.getElementById('toast');
const reloadButton = document.getElementById('reload-button');

const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskCategorySelect = document.getElementById('task-category');
const taskCompleteInput = document.getElementById('task-complete');
const taskList = document.getElementById('task-list');
const taskFilter = document.getElementById('task-filter');
const taskResetButton = document.getElementById('task-reset');

const categoryForm = document.getElementById('category-form');
const categoryIdInput = document.getElementById('category-id');
const categoryNameInput = document.getElementById('category-name');
const categoryList = document.getElementById('category-list');
const categoryResetButton = document.getElementById('category-reset');

const apiBase = (document.querySelector('meta[name="api-base"]')?.content || '')
  .replace(/\/$/, '');
const apiUrl = (path) => `${apiBase}${path}`;

const state = {
  categories: [],
  tasks: [],
  filterCategoryId: ''
};

const showStatus = (message) => {
  statusText.textContent = message;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload;
};

const loadData = async () => {
  showStatus('Loading data...');
  const [categories, tasks] = await Promise.all([
    fetchJson(apiUrl('/api/categories')),
    fetchJson(apiUrl('/api/tasks'))
  ]);
  state.categories = categories;
  state.tasks = tasks;
  renderAll();
  showStatus('All caught up.');
};

const renderAll = () => {
  renderCategoryOptions();
  renderFilterOptions();
  renderTasks();
  renderCategories();
};

const renderCategoryOptions = () => {
  const options = [
    { value: '', label: 'No category' },
    ...state.categories.map((category) => ({
      value: category._id,
      label: category.name
    }))
  ];

  taskCategorySelect.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join('');
};

const renderFilterOptions = () => {
  const options = [
    { value: '', label: 'All tasks' },
    ...state.categories.map((category) => ({
      value: category._id,
      label: category.name
    }))
  ];

  taskFilter.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join('');

  taskFilter.value = state.filterCategoryId;
};

const renderTasks = () => {
  const categoriesById = new Map(
    state.categories.map((category) => [category._id, category])
  );

  const tasks = state.filterCategoryId
    ? state.tasks.filter((task) => task.categoryId === state.filterCategoryId)
    : state.tasks;

  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty">No tasks yet.</div>';
    return;
  }

  taskList.innerHTML = tasks
    .map((task, index) => {
      const category = categoriesById.get(task.categoryId);
      const categoryLabel = category ? category.name : 'Unassigned';
      const completedLabel = task.isCompleted ? 'Done' : 'Open';
      const description = task.description || 'No description';

      return `
        <article class="card" style="--delay: ${index * 70}ms">
          <div class="tag">${completedLabel}</div>
          <h3>${task.title}</h3>
          <p class="meta">${description}</p>
          <p class="meta">Category: ${categoryLabel}</p>
          <div class="card-actions">
            <button class="button ghost" data-action="edit-task" data-id="${task._id}">
              Edit
            </button>
            <button class="button ghost" data-action="toggle-task" data-id="${task._id}">
              Toggle
            </button>
            <button class="button ghost" data-action="delete-task" data-id="${task._id}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join('');
};

const renderCategories = () => {
  if (state.categories.length === 0) {
    categoryList.innerHTML = '<div class="empty">No categories yet.</div>';
    return;
  }

  const taskCounts = state.tasks.reduce((acc, task) => {
    if (task.categoryId) {
      acc[task.categoryId] = (acc[task.categoryId] || 0) + 1;
    }
    return acc;
  }, {});

  categoryList.innerHTML = state.categories
    .map((category, index) => {
      const count = taskCounts[category._id] || 0;
      return `
        <article class="card" style="--delay: ${index * 70}ms">
          <h3>${category.name}</h3>
          <p class="meta">${count} task${count === 1 ? '' : 's'}</p>
          <div class="card-actions">
            <button class="button ghost" data-action="edit-category" data-id="${category._id}">
              Edit
            </button>
            <button class="button ghost" data-action="delete-category" data-id="${category._id}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join('');
};

const resetTaskForm = () => {
  taskIdInput.value = '';
  taskTitleInput.value = '';
  taskDescriptionInput.value = '';
  taskCategorySelect.value = '';
  taskCompleteInput.checked = false;
  taskForm.querySelector('#task-submit').textContent = 'Save task';
};

const resetCategoryForm = () => {
  categoryIdInput.value = '';
  categoryNameInput.value = '';
  categoryForm.querySelector('#category-submit').textContent = 'Save category';
};

const handleTaskSubmit = async (event) => {
  event.preventDefault();
  const payload = {
    title: taskTitleInput.value.trim(),
    description: taskDescriptionInput.value.trim(),
    isCompleted: taskCompleteInput.checked
  };
  const categoryId = taskCategorySelect.value;
  if (categoryId) {
    payload.categoryId = categoryId;
  } else if (taskIdInput.value) {
    payload.categoryId = '';
  }

  try {
    if (taskIdInput.value) {
      await fetchJson(apiUrl(`/api/tasks/${taskIdInput.value}`), {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Task updated.');
    } else {
      await fetchJson(apiUrl('/api/tasks'), {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Task created.');
    }

    resetTaskForm();
    await loadData();
  } catch (error) {
    showToast(error.message);
  }
};

const handleCategorySubmit = async (event) => {
  event.preventDefault();
  const payload = { name: categoryNameInput.value.trim() };

  try {
    if (categoryIdInput.value) {
      await fetchJson(apiUrl(`/api/categories/${categoryIdInput.value}`), {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Category updated.');
    } else {
      await fetchJson(apiUrl('/api/categories'), {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Category created.');
    }

    resetCategoryForm();
    await loadData();
  } catch (error) {
    showToast(error.message);
  }
};

const handleTaskListClick = async (event) => {
  const target = event.target.closest('button');
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  if (action === 'edit-task') {
    const task = state.tasks.find((item) => item._id === id);
    if (!task) {
      return;
    }

    taskIdInput.value = task._id;
    taskTitleInput.value = task.title || '';
    taskDescriptionInput.value = task.description || '';
    taskCategorySelect.value = task.categoryId || '';
    taskCompleteInput.checked = Boolean(task.isCompleted);
    taskForm.querySelector('#task-submit').textContent = 'Update task';
    taskTitleInput.focus();
    return;
  }

  if (action === 'toggle-task') {
    const task = state.tasks.find((item) => item._id === id);
    if (!task) {
      return;
    }

    try {
      await fetchJson(apiUrl(`/api/tasks/${id}`), {
        method: 'PUT',
        body: JSON.stringify({ isCompleted: !task.isCompleted })
      });
      await loadData();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (action === 'delete-task') {
    try {
      await fetchJson(apiUrl(`/api/tasks/${id}`), { method: 'DELETE' });
      await loadData();
      showToast('Task removed.');
    } catch (error) {
      showToast(error.message);
    }
  }
};

const handleCategoryListClick = async (event) => {
  const target = event.target.closest('button');
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  if (action === 'edit-category') {
    const category = state.categories.find((item) => item._id === id);
    if (!category) {
      return;
    }

    categoryIdInput.value = category._id;
    categoryNameInput.value = category.name || '';
    categoryForm.querySelector('#category-submit').textContent = 'Update category';
    categoryNameInput.focus();
    return;
  }

  if (action === 'delete-category') {
    try {
      await fetchJson(apiUrl(`/api/categories/${id}`), { method: 'DELETE' });
      await loadData();
      showToast('Category removed.');
    } catch (error) {
      showToast(error.message);
    }
  }
};

reloadButton.addEventListener('click', () => {
  loadData().catch((error) => showToast(error.message));
});

(taskForm).addEventListener('submit', handleTaskSubmit);
categoryForm.addEventListener('submit', handleCategorySubmit);

taskResetButton.addEventListener('click', resetTaskForm);
categoryResetButton.addEventListener('click', resetCategoryForm);

taskList.addEventListener('click', handleTaskListClick);
categoryList.addEventListener('click', handleCategoryListClick);

taskFilter.addEventListener('change', (event) => {
  state.filterCategoryId = event.target.value;
  renderTasks();
});

loadData().catch((error) => {
  showToast(error.message);
  showStatus('Unable to load data.');
});
