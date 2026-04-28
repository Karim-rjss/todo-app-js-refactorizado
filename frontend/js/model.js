const API_URL = 'https://todo-app-js-refactorizado.onrender.com/todos';
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
        { id: 0, title: 'Learn JS', description: 'Watch JS Tutorials', completed: false, archived: false, dueDate: null, dueTime: null }
      ];
      this.currentId = 1;
    } else {
      // Migrar todos antiguos sin propiedades 'archived', 'dueDate' y 'dueTime'
      this.todos = this.todos.map(todo => ({
        ...todo,
        archived: todo.archived ?? false,
        dueDate: todo.dueDate ?? null,
        dueTime: todo.dueTime ?? null
      }));
      this.currentId = this.todos[this.todos.length - 1].id + 1;
    }
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getTodos() {
    return this.todos.map(todo => ({ ...todo }));
  }

  addTodo(title, description, dueDate = null, dueTime = null) {
    const todo = { id: this.currentId++, title, description, completed: false, archived: false, dueDate, dueTime };
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

  toggleArchived(id) {
    const index = this.findTodo(id);
    this.todos[index].archived = !this.todos[index].archived;
    this.save();
  }

  getActiveTodos() {
    return this.todos
      .filter(todo => !todo.completed && !todo.archived)
      .map(todo => ({ ...todo }));
  }

  getCompletedTodos() {
    return this.todos
      .filter(todo => todo.completed && !todo.archived)
      .map(todo => ({ ...todo }));
  }

  getArchivedTodos() {
    return this.todos
      .filter(todo => todo.archived)
      .map(todo => ({ ...todo }));
  }
}
