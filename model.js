class Model {
  constructor(initialTodos = null) {
    if (initialTodos) {
      this.todos = initialTodos;
      this.currentId = initialTodos.length > 0
        ? initialTodos[initialTodos.length - 1].id + 1
        : 1;
    } else {
      this.todos = [
        { id: 0, title: 'Learn JS', description: 'Watch JS Tutorials', completed: false }
      ];
      this.currentId = 1;
    }
  }

  save() {}

  getTodos() {
    return this.todos.map(todo => ({ ...todo }));
  }

  addTodo(title, description) {
    const todo = { id: this.currentId++, title, description, completed: false };
    this.todos.push(todo);
    return { ...todo };
  }

  editTodo(id, values) {
    const index = this.findTodo(id);
    Object.assign(this.todos[index], values);
  }

  findTodo(id) {
    return this.todos.findIndex(todo => todo.id === id);
  }

  removeTodo(id) {
    const index = this.findTodo(id);
    this.todos.splice(index, 1);
  }

  removeCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
  }

  toggleCompleted(id) {
    const index = this.findTodo(id);
    this.todos[index].completed = !this.todos[index].completed;
  }
}

module.exports = Model;