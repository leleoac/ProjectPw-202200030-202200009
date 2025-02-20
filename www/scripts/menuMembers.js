"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * @class Representa um membro do clube.
 * @param {number|null} id  - ID do membro (vindo do BD) ou null se ainda não criado
 * @param {string} name     - Nome do membro
 * @param {number[]} preferredEventTypeIds - Lista de IDs de tipos de evento preferidos
 * @param {number[]} eventIds             - Lista de IDs de eventos em que está inscrito
 */
let Member = function Member(id = null, name = "", preferredEventTypeIds = [], eventIds = []) {
  this.id = id;
  this.name = name;
  this.preferredEventTypeIds = preferredEventTypeIds; 
  this.eventIds = eventIds; // IDs dos eventos em que está inscrito
};

/**
 * Rótulos para a tabela
 */
Member.propertyLabels = {
  id: "Id",
  name: "Nome",
  preferredEventTypeIds: "Tipos Preferidos (IDs)",
  eventIds: "Inscrito em Eventos (IDs)"
};

/**
 * @class MenuMember
 * Gerencia a lista de membros (CRUD) e a interface com o usuário.
 */
function MenuMember() {
  this.members = [];
  this.selectedMember = null;
}

/**
 * Cria a tabela a partir de this.members
 */
MenuMember.prototype.toTable = function () {
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let headerRow = document.createElement("tr");

  for (let prop in Member.propertyLabels) {
    let th = document.createElement("th");
    th.textContent = Member.propertyLabels[prop];
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  let tbody = document.createElement("tbody");
  if (this.members.length > 0) {
    this.members.forEach((member) => {
      let row = document.createElement("tr");

      row.addEventListener("click", () => {
        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        this.selectedMember = member;
      });

      // Cria células na ordem: id, name, preferredEventTypeIds, eventIds
      let cellId = document.createElement("td");
      cellId.textContent = member.id;
      row.appendChild(cellId);

      let cellName = document.createElement("td");
      cellName.textContent = member.name;
      row.appendChild(cellName);

      let cellPref = document.createElement("td");
      cellPref.textContent = member.preferredEventTypeIds.join(", ");
      row.appendChild(cellPref);

      let cellEvents = document.createElement("td");
      cellEvents.textContent = member.eventIds.join(", ");
      row.appendChild(cellEvents);

      tbody.appendChild(row);
    });
  }
  table.appendChild(tbody);
  return table;
};

/**
 * Cria formulário de criar/editar Membro.
 * Se member for null => criação
 * Se member existir => edição
 */
MenuMember.prototype.createForm = function (member = null) {
  let formContainer = document.createElement("form");

  let formTitle = document.createElement("h3");
  formTitle.textContent = member ? "Editar Membro" : "Criar Membro";
  formContainer.appendChild(formTitle);

  // Campo Nome
  let nameLabel = document.createElement("label");
  nameLabel.textContent = "Nome:";
  nameLabel.style.display = "block";

  let nameInput = document.createElement("input");
  nameInput.type = "text";
  if (member) {
    nameInput.value = member.name;
  }

  formContainer.appendChild(nameLabel);
  formContainer.appendChild(nameInput);

  // Checkboxes de tipos de evento preferidos
  let eventTypesLabel = document.createElement("label");
  eventTypesLabel.textContent = "Tipos de Evento Preferidos:";
  eventTypesLabel.style.display = "block";
  formContainer.appendChild(eventTypesLabel);

  // Container para checkboxes
  let eventTypesContainer = document.createElement("div");
  eventTypesContainer.style.display = "grid";
  eventTypesContainer.style.gridTemplateColumns = "1fr 1fr";
  eventTypesContainer.style.gap = "0.5rem";

  // Precisamos de uma lista de eventTypes do MenuEventType
  // (já carregada em MenuEventType.default.eventTypes)
  MenuEventType.default.eventTypes.forEach((et) => {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = et.id; // ID do BD do tipo
    checkbox.id = `member_pref_${et.id}`;
    if (member && member.preferredEventTypeIds.includes(et.id)) {
      checkbox.checked = true;
    }

    let lbl = document.createElement("label");
    lbl.textContent = `${et.description} (id=${et.id})`;
    lbl.htmlFor = `member_pref_${et.id}`;

    let divBox = document.createElement("div");
    divBox.appendChild(checkbox);
    divBox.appendChild(lbl);

    eventTypesContainer.appendChild(divBox);
  });

  formContainer.appendChild(eventTypesContainer);

  // Botões Gravar / Cancelar
  let buttonContainer = document.createElement("div");

  let saveButton = document.createElement("button");
  saveButton.textContent = "Gravar";
  saveButton.type = "button";
  saveButton.addEventListener("click", () => {
    let nameVal = nameInput.value.trim();
    let checkedTypeIds = Array.from(eventTypesContainer.querySelectorAll("input:checked"))
                              .map(cb => parseInt(cb.value));

    if (!nameVal) {
      alert("O membro precisa de ter nome!");
      return;
    }

    // Se member => PUT, senão => POST
    if (member) {
      // PUT /members/:id
      fetch(`/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameVal,
          preferredEventTypeIds: checkedTypeIds
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao atualizar membro");
        return res.json();
      })
      .then(() => {
        this.show(); 
      })
      .catch(err => alert(err.message));
    } else {
      // POST /members
      fetch("/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameVal,
          preferredEventTypeIds: checkedTypeIds
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao criar membro");
        return res.json();
      })
      .then(() => {
        this.show(); 
      })
      .catch(err => alert(err.message));
    }
  });

  let cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";
  cancelButton.type = "button";
  cancelButton.addEventListener("click", () => {
    this.show();
  });

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(cancelButton);
  formContainer.appendChild(buttonContainer);

  // Se estiver editando, botões de Inscrição/Desinscrição
  if (member) {
    let eventActionsContainer = document.createElement("div");

    let registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.textContent = "Inscrever em Evento";
    registerButton.addEventListener("click", () => {
      this.showEventRegistrationForm(member);
    });

    let unregisterButton = document.createElement("button");
    unregisterButton.type = "button";
    unregisterButton.textContent = "Desinscrever de Evento";
    unregisterButton.addEventListener("click", () => {
      this.showEventUnregistrationForm(member);
    });

    eventActionsContainer.appendChild(registerButton);
    eventActionsContainer.appendChild(unregisterButton);
    formContainer.appendChild(eventActionsContainer);
  }

  return formContainer;
};

/**
 * Mostra o formulário de criar/editar
 */
MenuMember.prototype.showForm = function (member = null) {
  let container = document.getElementById("members");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(this.createForm(member));
};

/**
 * Exibe lista de membros (GET /members).
 */
MenuMember.prototype.show = function () {
  let container = document.getElementById("members");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 1) Garante que eventTypes estão carregados antes (se quiser)
  MenuEventType.default.loadFromServer()
    .then(() => {
      // 2) Agora GET /members
      return fetch("/members");
    })
    .then(res => res.json())
    .then(data => {
      // data é array de objetos {id, name, preferredEventTypeIds, eventIds}
      this.members = data.map(m => new Member(
        m.id, 
        m.name, 
        m.preferredEventTypeIds || [], 
        m.eventIds || []
      ));
      
      // Monta tabela
      container.appendChild(this.toTable());

      // Botões CRUD (Criar, Editar, Apagar)
      let buttonContainer = document.createElement("div");

      let createButton = document.createElement("button");
      createButton.textContent = "Criar";
      createButton.addEventListener("click", () => {
        this.showForm();
      });

      let editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => {
        if (this.selectedMember) {
          this.showForm(this.selectedMember);
        } else {
          alert("Tem de selecionar um membro!");
        }
      });

      let deleteButton = document.createElement("button");
      deleteButton.textContent = "Apagar";
      deleteButton.addEventListener("click", () => {
        if (!this.selectedMember) {
          alert("Tem de selecionar um membro!");
          return;
        }
        if (!confirm(`Deseja apagar o membro "${this.selectedMember.name}"?`)) {
          return;
        }

        // DELETE /members/:id
        fetch(`/members/${this.selectedMember.id}`, {
          method: "DELETE"
        })
        .then(res => {
          if (!res.ok) throw new Error("Falha ao apagar membro (pode haver restrição).");
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
      console.error("Erro ao carregar membros:", err);
      alert("Falha ao carregar membros do servidor!");
    });
};

/**
 * Formulário de inscrição em evento
 */
MenuMember.prototype.showEventRegistrationForm = function (member) {
  let container = document.getElementById("members");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  let formContainer = document.createElement("div");
  let formTitle = document.createElement("h3");
  formTitle.textContent = "Inscrição em Evento";
  formContainer.appendChild(formTitle);

  // Filtra eventos ainda não inscritos e cujo "type" (ou typeId) esteja em member.preferredEventTypeIds
  // Ajuste conforme seu MenuEvent. Se "ev.type" for ID, ok.
  let eventSelect = document.createElement("select");

  MenuEvent.default.events
    .filter(ev => 
      !member.eventIds.includes(ev.id) &&
      member.preferredEventTypeIds.includes(ev.type) 
    )
    .forEach(ev => {
      let option = document.createElement("option");
      option.value = ev.id;
      option.textContent = `${ev.type} - ${ev.description} (${ev.date})`;
      eventSelect.appendChild(option);
    });

  if (!eventSelect.childElementCount) {
    let msg = document.createElement("p");
    msg.textContent = "Não há eventos elegíveis para inscrição.";
    formContainer.appendChild(msg);

    let backBtn = document.createElement("button");
    backBtn.textContent = "Voltar";
    backBtn.addEventListener("click", () => {
      this.show();
    });
    formContainer.appendChild(backBtn);
    container.appendChild(formContainer);
    return;
  }

  formContainer.appendChild(eventSelect);

  let buttonContainer = document.createElement("div");

  let acceptButton = document.createElement("button");
  acceptButton.textContent = "Aceitar";
  acceptButton.addEventListener("click", () => {
    let selectedEventId = parseInt(eventSelect.value);
    if (!selectedEventId) return;

    // POST /members/:id/events
    fetch(`/members/${member.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: selectedEventId })
    })
    .then(res => {
      if (!res.ok) throw new Error("Falha ao inscrever no evento");
      return res.json();
    })
    .then(() => {
      this.show(); 
    })
    .catch(err => alert(err.message));
  });

  let cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => {
    this.show();
  });

  buttonContainer.appendChild(acceptButton);
  buttonContainer.appendChild(cancelButton);
  formContainer.appendChild(buttonContainer);

  container.appendChild(formContainer);
};

/**
 * Formulário de desinscrição de evento
 */
MenuMember.prototype.showEventUnregistrationForm = function (member) {
  let container = document.getElementById("members");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  let formContainer = document.createElement("div");
  let formTitle = document.createElement("h3");
  formTitle.textContent = "Desinscrever de Evento";
  formContainer.appendChild(formTitle);

  let eventSelect = document.createElement("select");

  // Lista apenas eventos em que o membro está inscrito
  member.eventIds.forEach(evId => {
    let evObj = MenuEvent.default.events.find(e => e.id === evId);
    if (evObj) {
      let option = document.createElement("option");
      option.value = evObj.id;
      option.textContent = `${evObj.type} - ${evObj.description} (${evObj.date})`;
      eventSelect.appendChild(option);
    }
  });

  if (!eventSelect.childElementCount) {
    let msg = document.createElement("p");
    msg.textContent = "Não há eventos para desinscrever.";
    formContainer.appendChild(msg);

    let backBtn = document.createElement("button");
    backBtn.textContent = "Voltar";
    backBtn.addEventListener("click", () => {
      this.show();
    });
    formContainer.appendChild(backBtn);
    container.appendChild(formContainer);
    return;
  }

  formContainer.appendChild(eventSelect);

  let buttonContainer = document.createElement("div");

  let acceptButton = document.createElement("button");
  acceptButton.textContent = "Aceitar";
  acceptButton.addEventListener("click", () => {
    let selectedEventId = parseInt(eventSelect.value);
    if (!selectedEventId) return;

    // DELETE /members/:id/events/:eventId
    fetch(`/members/${member.id}/events/${selectedEventId}`, {
      method: "DELETE"
    })
    .then(res => {
      if (!res.ok) throw new Error("Falha ao desinscrever do evento");
      return res.json();
    })
    .then(() => {
      this.show();
    })
    .catch(err => alert(err.message));
  });

  let cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", () => {
    this.show();
  });

  buttonContainer.appendChild(acceptButton);
  buttonContainer.appendChild(cancelButton);
  formContainer.appendChild(buttonContainer);

  container.appendChild(formContainer);
};

/** Singleton */
MenuMember.default = new MenuMember();

// Se tiver <a id="showMembers"> no HTML
document.addEventListener("DOMContentLoaded", () => {
  let link = document.getElementById("showMembers");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      MenuMember.default.show();
    });
  }
});
