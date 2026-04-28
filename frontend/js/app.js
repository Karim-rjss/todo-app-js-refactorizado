// HU-8: Limpieza masiva de tareas
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
