class Alert {
  constructor(alertId) {
    this.alert = document.getElementById(alertId);
  }

  show(message) {
    this.alert.classList.remove('d-none');
    this.alert.innerText = message;
  }

  hide() {
    this.alert.classList.add('d-none');
  }
}

class Modal {
  constructor() {
    this.title = document.getElementById('modal-title');
    this.description = document.getElementById('modal-description');
    this.btn = document.getElementById('modal-btn');
    this.completed = document.getElementById('modal-completed');
    this.dueDate = document.getElementById('modal-due-date');
    this.dueTime = document.getElementById('modal-due-time');
    this.alert = new Alert('modal-alert');
    this.todo = null;
  }

  setValues(todo) {
    this.todo = todo;
    this.title.value = todo.title;
    this.description.value = todo.description;
    this.completed.checked = todo.completed;
    this.dueDate.value = todo.dueDate || '';
    this.dueTime.value = todo.dueTime || '';
  }

  onClick(callback) {
    this.btn.onclick = () => {
      if (!this.title.value || !this.description.value) {
        this.alert.show('Title and description are required');
        return;
      }
      $('#modal').modal('toggle');
      callback(this.todo.id, {
        title: this.title.value,
        description: this.description.value,
        completed: this.completed.checked,
        dueDate: this.dueDate.value || null,
        dueTime: this.dueTime.value || null,
      });
    };
  }
}

class AddTodo {
  constructor() {
    this.btn = document.getElementById('add');
    this.title = document.getElementById('title');
    this.description = document.getElementById('description');
    this.checkbox = document.getElementById('add-date-checkbox');
    this.dateFields = document.getElementById('date-time-fields');
    this.dueDate = document.getElementById('due-date');
    this.dueTime = document.getElementById('due-time');
    this.alert = new Alert('alert');

    // Mostrar/ocultar campos de fecha según checkbox
    this.checkbox.addEventListener('change', () => {
      if (this.checkbox.checked) {
        this.dateFields.style.display = 'flex';
      } else {
        this.dateFields.style.display = 'none';
        this.dueDate.value = '';
        this.dueTime.value = '';
      }
    });
  }

  onClick(callback) {
    this.btn.onclick = (e) => {
      e.preventDefault();
      if (this.title.value === '' || this.description.value === '') {
        this.alert.show('Title and description are required');
      } else {
        this.alert.hide();
        const dueDate = this.checkbox.checked ? this.dueDate.value : null;
        const dueTime = this.checkbox.checked ? this.dueTime.value : null;
        callback(this.title.value, this.description.value, dueDate, dueTime);
        this.title.value = '';
        this.description.value = '';
        this.dueDate.value = '';
        this.dueTime.value = '';
        this.checkbox.checked = false;
        this.dateFields.style.display = 'none';
      }
    };
  }
}

class Filters {
  constructor() {
    this.form = document.getElementById('filters');
    this.btn = document.getElementById('search');
  }

  onClick(callback) {
    this.btn.onclick = (e) => {
      e.preventDefault();
      const data = new FormData(this.form);
      callback({ type: data.get('type'), words: data.get('words') });
    };
  }

  getSelectedType() {
    const selected = this.form.querySelector('input[name="type"]:checked');
    return selected ? selected.value : 'active';
  }
}

class View {
  constructor(model) {
    this.model = model;
    this.table = document.getElementById('table');
    this.addTodoForm = new AddTodo();
    this.modal = new Modal();

    this.addTodoForm.onClick((title, description, dueDate, dueTime) => this.addTodo(title, description, dueDate, dueTime));
    this.modal.onClick((id, values) => this.editTodo(id, values));

    this.filters = new Filters();
    this.filters.onClick((filters) => this.handleFilter(filters));
  }

  render() {
    const filterType = this.filters.getSelectedType();
    let todos = [];
    
    if (filterType === 'active') {
      todos = this.model.getActiveTodos();
    } else if (filterType === 'completed') {
      todos = this.model.getCompletedTodos();
    } else if (filterType === 'archived') {
      todos = this.model.getArchivedTodos();
    } else {
      todos = this.model.getTodos();
    }
    
    todos.forEach(todo => this.createRow(todo));
  }

  addTodo(title, description, dueDate = null, dueTime = null) {
    const todo = this.model.addTodo(title, description, dueDate, dueTime);
    this.createRow(todo);
  }

  removeTodo(id) {
    this.model.removeTodo(id);
    document.getElementById(id).remove();
  }

  archiveTodo(id) {
    this.model.toggleArchived(id);
    document.getElementById(id).remove();
  }

  editTodo(id, values) {
    this.model.editTodo(id, values);
    const row = document.getElementById(id);
    row.children[0].innerText = values.title;
    row.children[1].innerText = values.description;
    const dueDateTime = this.formatDueDateTime(values.dueDate, values.dueTime);
    row.children[2].innerText = dueDateTime;
    row.children[3].children[0].checked = values.completed;
  }

  formatDueDateTime(date, time) {
    if (!date && !time) return '';
    if (date && time) return `${date} ${time}`;
    if (date) return date;
    if (time) return time;
    return '';
  }

  removeCompleted() {
    if (!confirm('¿Está seguro de que desea eliminar todas las tareas completadas?')) return;
    this.model.removeCompleted();
    const [, ...rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
      if (row.children[3].children[0].checked) row.remove();
    }
  }

  toggleCompleted(id) {
    this.model.toggleCompleted(id);
  }

  handleFilter(filters) {
    const { type, words } = filters;
    
    // Obtener todos los todos según el tipo de filtro
    let todos = [];
    if (type === 'active') {
      todos = this.model.getActiveTodos();
    } else if (type === 'completed') {
      todos = this.model.getCompletedTodos();
    } else if (type === 'archived') {
      todos = this.model.getArchivedTodos();
    } else {
      todos = this.model.getTodos();
    }
    
    // Filtrar por palabras si se proporcionan
    if (words) {
      todos = todos.filter(todo =>
        todo.title.includes(words) || todo.description.includes(words)
      );
    }
    
    // Limpiar tabla y renderizar de nuevo
    const tbody = this.table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    rows.forEach(row => row.remove());
    
    todos.forEach(todo => this.createRow(todo));
  }

  createRow(todo) {
    const tbody = this.table.getElementsByTagName('tbody')[0];
    const row = tbody.insertRow();
    row.setAttribute('id', todo.id);

    const dueDateTime = this.formatDueDateTime(todo.dueDate, todo.dueTime);
    row.innerHTML = `
      <td>${todo.title}</td>
      <td>${todo.description}</td>
      <td>${dueDateTime}</td>
      <td class="text-center"></td>
      <td class="text-right"></td>
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => this.toggleCompleted(todo.id);
    row.children[3].appendChild(checkbox);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('btn', 'btn-danger', 'mb-1', 'ml-1');
    removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
    removeBtn.onclick = () => this.removeTodo(todo.id);
    row.children[4].appendChild(removeBtn);

    const archiveBtn = document.createElement('button');
    archiveBtn.classList.add('btn', 'btn-warning', 'mb-1', 'ml-1');
    archiveBtn.innerHTML = todo.archived ? '<i class="fa fa-undo"></i>' : '<i class="fa fa-archive"></i>';
    archiveBtn.title = todo.archived ? 'Desarchivar' : 'Archivar';
    archiveBtn.onclick = () => this.archiveTodo(todo.id);
    row.children[4].appendChild(archiveBtn);

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'mb-1');
    editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
    editBtn.setAttribute('data-toggle', 'modal');
    editBtn.setAttribute('data-target', '#modal');
    editBtn.onclick = () => this.modal.setValues({
      id: todo.id,
      title: row.children[0].innerText,
      description: row.children[1].innerText,
      completed: row.children[3].children[0].checked,
      dueDate: todo.dueDate,
      dueTime: todo.dueTime,
    });
    row.children[4].appendChild(editBtn);
  }

  filter(filters) {
    const { type, words } = filters;
    const [, ...rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
      const [title, description, completed] = row.children;
      let shouldHide = false;
      
      // Filtrar por palabras
      if (words) {
        shouldHide = !title.innerText.includes(words) && !description.innerText.includes(words);
      }
      
      // Filtrar por tipo
      if (type === 'active') {
        shouldHide = completed.children[0].checked; // Ocultar si está completada
      } else if (type === 'completed') {
        shouldHide = !completed.children[0].checked; // Ocultar si no está completada
      }
      
      row.classList.toggle('d-none', shouldHide);
    }
  }
}
