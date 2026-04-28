class Model {
  constructor() {
    // HU-6: LocalStorage
    try {
      this.todos = JSON.parse(localStorage.getItem('todos'));
      if (!Array.isArray(this.todos)) {
        this.todos = null;
      }
    } catch (e) {
      this.todos = null;
    }

    if (!this.todos || this.todos.length === 0) {
      this.todos = [
        { id: 0, title: 'Learn JS', description: 'Watch JS Tutorials', completed: false }
      ];
      this.currentId = 1;
    } else {
      this.currentId = this.todos[this.todos.length - 1].id + 1;
    }
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getTodos() {
    return this.todos.map(todo => ({ ...todo }));
  }

  addTodo(title, description) {
    const todo = { id: this.currentId++, title, description, completed: false };
    this.todos.push(todo);
    this.save();
    return { ...todo };
  }

  editTodo(id, values) {
    const index = this.findTodo(id);
    Object.assign(this.todos[index], values);
    this.save();
  }

  findTodo(id) {
    return this.todos.findIndex(todo => todo.id === id);
  }

  removeTodo(id) {
    const index = this.findTodo(id);
    this.todos.splice(index, 1);
    this.save();
  }

  removeCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.save();
  }

  toggleCompleted(id) {
    const index = this.findTodo(id);
    this.todos[index].completed = !this.todos[index].completed;
    this.save();
  }
}

class Modal {
  constructor() {
    this.title = document.getElementById('modal-title');
    this.description = document.getElementById('modal-description');
    this.btn = document.getElementById('modal-btn');
    this.completed = document.getElementById('modal-completed');
    this.alert = new Alert('modal-alert');
    this.todo = null;
  }

  setValues(todo) {
    this.todo = todo;
    this.title.value = todo.title;
    this.description.value = todo.description;
    this.completed.checked = todo.completed;
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
      });
    };
  }
}

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

class AddTodo {
  constructor() {
    this.btn = document.getElementById('add');
    this.title = document.getElementById('title');
    this.description = document.getElementById('description');
    this.alert = new Alert('alert');
  }

  onClick(callback) {
    this.btn.onclick = (e) => {
      e.preventDefault();
      if (this.title.value === '' || this.description.value === '') {
        this.alert.show('Title and description are required');
      } else {
        this.alert.hide();
        callback(this.title.value, this.description.value);
        this.title.value = '';
        this.description.value = '';
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
}


class View {
  constructor(model) {
    this.model = model;
    this.table = document.getElementById('table');
    this.addTodoForm = new AddTodo();
    
    // CORRECCIÓN 1: Instanciar el Modal
    this.modal = new Modal();

    this.addTodoForm.onClick((title, description) => this.addTodo(title, description));

    // CORRECCIÓN 2: Configurar el evento de guardado del modal
    this.modal.onClick((id, values) => this.editTodo(id, values));

    this.filters = new Filters();
    this.filters.onClick((filters) => this.filter(filters));
  }

  render() {
    const todos = this.model.getTodos();
    todos.forEach(todo => this.createRow(todo));
  }

  addTodo(title, description) {
    const todo = this.model.addTodo(title, description);
    this.createRow(todo);
  }

  removeTodo(id) {
    this.model.removeTodo(id);
    document.getElementById(id).remove();
  }

  editTodo(id, values) {
    // Actualizar Modelo
    this.model.editTodo(id, values);
    
    // Actualizar DOM
    const row = document.getElementById(id);
    row.children[0].innerText = values.title;
    row.children[1].innerText = values.description;
    row.children[2].children[0].checked = values.completed;
  }

  removeCompleted() {
    if (!confirm('¿Está seguro de que desea eliminar todas las tareas completadas?')) {
        return;
    }
    this.model.removeCompleted();
    const [, ... rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
       if (row.children[2].children[0].checked) row.remove();
    }
  }

  toggleCompleted(id) {
    this.model.toggleCompleted(id);
  }

  createRow(todo) {
    const tbody = this.table.getElementsByTagName('tbody')[0];
    const row = tbody.insertRow();
    row.setAttribute('id', todo.id);

    row.innerHTML = `
      <td>${todo.title}</td>
      <td>${todo.description}</td>
      <td class="text-center"></td>
      <td class="text-right"></td>
    `;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => this.toggleCompleted(todo.id);
    row.children[2].appendChild(checkbox);

    // Botón Eliminar
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('btn', 'btn-danger', 'mb-1', 'ml-1');
    removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
    removeBtn.onclick = () => this.removeTodo(todo.id);
    row.children[3].appendChild(removeBtn);

    // Botón Editar
    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'mb-1');
    editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
    editBtn.setAttribute('data-toggle', 'modal');
    editBtn.setAttribute('data-target', '#modal');
    
    // CORRECCIÓN 3: Al hacer click enviamos la información actual al modal
    editBtn.onclick = () => this.modal.setValues({
      id: todo.id,
      title: row.children[0].innerText,
      description: row.children[1].innerText,
      completed: row.children[2].children[0].checked,
    });
    
    row.children[3].appendChild(editBtn);
  }

  filter(filters) {
    const { type, words } = filters;
    const [, ...rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
        const [title, description, completed] = row.children;
        let shouldHide = false;
        if (words) {
            shouldHide = !title.innerText.includes(words) && !description.innerText.includes(words);
        }
        const shouldBeCompleted = type === 'completed';
        const isCompleted = completed.children[0].checked;
        if (type !== 'all' && shouldBeCompleted !== isCompleted) {
            shouldHide = true;
        }
        row.classList.toggle('d-none', shouldHide);
    }
  }
}

//HU-8: Limpieza masiva de tareas 
document.addEventListener('DOMContentLoaded', () => {
  const model = new Model();
  const view = new View(model);
  view.render();
  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn btn-warning mt-3';
  clearBtn.innerText = 'Borrar completadas';
  clearBtn.onclick = () => view.removeCompleted();
  document.querySelector('.container').appendChild(clearBtn);
});