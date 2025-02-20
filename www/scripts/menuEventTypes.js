"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * @class Representa um tipo de evento.
 * @constructor
 * @param {string} description - Descrição do tipo de evento (ex.: "Prova").
 * @param {number|null} id - ID (chave primária no BD).
 */
let EventType = function (description = "", id = null) {
  this.id = id;
  this.description = description;
};

/** Rótulos para exibir na tabela */
EventType.propertyLabels = {
  id: "Id",
  description: "Descrição"
};

/**
 * @class MenuEventType
 * Gerencia os tipos de evento e a UI (CRUD com fetch).
 */
function MenuEventType() {
  this.eventTypes = [];        
  this.selectedEventType = null;
}

/**
 * Cria a tabela HTML a partir de this.eventTypes
 */
MenuEventType.prototype.toTable = function () {
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let headerRow = document.createElement("tr");

  for (let prop in EventType.propertyLabels) {
    let th = document.createElement("th");
    th.textContent = EventType.propertyLabels[prop];
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  let tbody = document.createElement("tbody");

  if (this.eventTypes.length > 0) {
    this.eventTypes.forEach((typeObj) => {
      let row = document.createElement("tr");

      row.addEventListener("click", () => {
        // Marca/desmarca seleção
        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        this.selectedEventType = typeObj;
      });

      // Cria as TDs: id e description
      let cellId = document.createElement("td");
      cellId.textContent = typeObj.id;
      row.appendChild(cellId);

      let cellDescription = document.createElement("td");
      cellDescription.textContent = typeObj.description;
      row.appendChild(cellDescription);

      tbody.appendChild(row);
    });
  }
  table.appendChild(tbody);
  return table;
};

/**
 * Cria o formulário para criar/editar um tipo de evento.
 */
MenuEventType.prototype.createForm = function (typeObj = null) {
  let formContainer = document.createElement("form");

  let formTitle = document.createElement("h3");
  formTitle.textContent = typeObj ? "Editar Tipo de Evento" : "Criar Tipo de Evento";
  formContainer.appendChild(formTitle);

  let labelDesc = document.createElement("label");
  labelDesc.textContent = "Descrição: ";
  labelDesc.style.display = "block";

  let inputDesc = document.createElement("input");
  inputDesc.type = "text";
  if (typeObj) {
    inputDesc.value = typeObj.description;
  }

  formContainer.appendChild(labelDesc);
  formContainer.appendChild(inputDesc);

  // Botões
  let buttonContainer = document.createElement("div");

  let saveButton = document.createElement("button");
  saveButton.textContent = "Gravar";
  saveButton.type = "button";
  saveButton.addEventListener("click", () => {
    let description = inputDesc.value.trim();
    if (!description) {
      alert("Descrição é obrigatória!");
      return;
    }

    // Se typeObj for null => criação (POST), se existir => edição (PUT)
    if (typeObj) {
      // PUT /eventtypes/:id
      fetch(`/eventtypes/${typeObj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao atualizar tipo de evento");
        return res.json();
      })
      .then(() => {
        this.show(); // recarrega a listagem
      })
      .catch(err => alert(err.message));
    } else {
      // POST /eventtypes
      fetch("/eventtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao criar tipo de evento");
        return res.json();
      })
      .then(() => {
        this.show();
      })
      .catch(err => alert(err.message));
    }
  });

  let cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => {
    this.show();
  });

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(cancelButton);
  formContainer.appendChild(buttonContainer);

  return formContainer;
};

/**
 * Exibe o formulário no container #eventTypes
 */
MenuEventType.prototype.showForm = function (typeObj = null) {
  let container = document.getElementById("eventTypes");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(this.createForm(typeObj));
};

/**
 * Exibe a lista de tipos de evento, buscando do servidor (GET /eventtypes).
 */
MenuEventType.prototype.show = function() {
  let container = document.getElementById("eventTypes");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 1) Busca do servidor
  fetch("/eventtypes")
    .then(res => res.json())
    .then(data => {
      // data é array de { id, description }
      // convertendo em instâncias da classe EventType
      this.eventTypes = data.map(obj => new EventType(obj.description, obj.id));

      // 2) Cria a tabela
      container.appendChild(this.toTable());

      // 3) Botões de criar, editar, apagar
      let buttonContainer = document.createElement("div");

      let createButton = document.createElement("button");
      createButton.textContent = "Criar";
      createButton.addEventListener("click", () => {
        this.showForm();
      });

      let editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => {
        if (this.selectedEventType) {
          this.showForm(this.selectedEventType);
        } else {
          alert("Selecione um tipo de evento!");
        }
      });

      let deleteButton = document.createElement("button");
      deleteButton.textContent = "Apagar";
      deleteButton.addEventListener("click", () => {
        if (!this.selectedEventType) {
          alert("Selecione um tipo de evento!");
          return;
        }
        if (!confirm(`Tem certeza que deseja apagar "${this.selectedEventType.description}"?`)) {
          return;
        }

        // DELETE /eventtypes/:id
        fetch(`/eventtypes/${this.selectedEventType.id}`, {
          method: "DELETE"
        })
        .then(res => {
          if (!res.ok) throw new Error("Falha ao apagar tipo de evento (pode estar em uso).");
          return res.json();
        })
        .then(() => {
          this.show();
        })
        .catch(err => alert(err.message));
      });

      buttonContainer.appendChild(createButton);
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      container.appendChild(buttonContainer);
    })
    .catch(err => {
      console.error("Erro ao carregar tipos de evento:", err);
      alert("Falha ao carregar tipos de evento do servidor!");
    });
};

/** 
 * Método opcional para apenas carregar eventTypes (sem exibir na tela).
 * Útil para quando precisamos ter a lista antes de abrir Membros. 
 */
MenuEventType.prototype.loadFromServer = function() {
  return fetch("/eventtypes")
    .then(res => res.json())
    .then(data => {
      this.eventTypes = data.map(obj => new EventType(obj.description, obj.id));
    })
    .catch(err => {
      console.error("Erro ao carregar eventtypes:", err);
      alert("Falha ao carregar tipos de evento do servidor!");
    });
};

/** Singleton */
MenuEventType.default = new MenuEventType();

// Se tiver <a id="showEventTypes"> no HTML
document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("showEventTypes");
  if (link) {
    link.addEventListener("click", (evt) => {
      evt.preventDefault();
      MenuEventType.default.show();
    });
  }
});
