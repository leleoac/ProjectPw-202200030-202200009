"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * @class Representa um evento.
 * @constructor
 * @param {string} type - Tipo do evento.
 * @param {string} description - Descrição do evento.
 * @param {string} date - Data do evento (formato YYYY-MM-DD).
 */
let Event = function Event(type = "", description = "", date = "") {
    if (!Event.currentId) {
        Event.currentId = 1;
    }
    this.id = Event.currentId++;
    this.type = type;
    this.description = description;
    this.date = date;
};

/**
 * Rótulos das propriedades.
 */
Event.propertyLabels = {
    id: "Id",
    type: "Tipo",
    description: "Descrição",
    date: "Data"
};

/**
 * @class MenuEvent
 * Gerencia a lista de eventos e sua interação com a interface do usuário.
 */
function MenuEvent() {
    this.events = [];
    this.selectedEvent = null;
}

MenuEvent.prototype.toTable = function () {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    for (let property in Event.propertyLabels) {
        let th = document.createElement("th");
        th.textContent = Event.propertyLabels[property];
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    if (this.events.length > 0) {
        this.events.forEach((event) => {
            let row = document.createElement("tr");

            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected"));
                row.classList.add("selected");
                this.selectedEvent = event;
            });

            for (let property in Event.propertyLabels) {
                let cell = document.createElement("td");
                cell.textContent = event[property];
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
    }
    table.appendChild(tbody);
    return table;
};

MenuEvent.prototype.createForm = function (event = null) {
    let formContainer = document.createElement("div");

    let formTitle = document.createElement("h3");
    formTitle.textContent = event ? "Editar Evento" : "Criar Evento";
    formContainer.appendChild(formTitle);

    // Seletor de Tipo
    let typeLabel = document.createElement("label");
    typeLabel.textContent = "Tipo: ";
    let typeInput = document.createElement("select");
    typeInput.id = "eventType";

    if (MenuEventType.default.eventTypes.length > 0) {
        MenuEventType.default.eventTypes.forEach((eventType) => {
            let option = document.createElement("option");
            option.value = eventType.description;
            option.textContent = eventType.description;
            typeInput.appendChild(option);
        });
    } else {
        let noOption = document.createElement("option");
        noOption.textContent = "Não existem tipos";
        noOption.disabled = true;
        noOption.selected = true;
        typeInput.appendChild(noOption);
    }

    if (event) typeInput.value = event.type;

    // Input Descrição
    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Descrição: ";
    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.id = "eventDescription";
    if (event) descriptionInput.value = event.description;

    // Input Data
    let dateLabel = document.createElement("label");
    dateLabel.textContent = "Data: ";
    let dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.id = "eventDate";
    if (event) dateInput.value = event.date;

    // Anexa os itens ao form
    formContainer.appendChild(typeLabel);
    formContainer.appendChild(typeInput);
    formContainer.appendChild(descriptionLabel);
    formContainer.appendChild(descriptionInput);
    formContainer.appendChild(dateLabel);
    formContainer.appendChild(dateInput);

    // Botões
    let buttonContainer = document.createElement("div");

    let saveButton = document.createElement("button");
    saveButton.textContent = "Gravar";
    saveButton.addEventListener("click", () => {
        let type = typeInput.value;
        let description = descriptionInput.value.trim();
        let date = dateInput.value;

        if (!description || !date) {
            alert("Preencha todos os campos");
        } else {
            if (event) {
                // Edição
                event.type = type;
                event.description = description;
                event.date = date;
            } else {
                // Criação
                this.events.push(new Event(type, description, date));
            }
            this.show();
        }
    });

    let cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancelar";
    cancelButton.addEventListener("click", () => {
        this.show();
    });

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    formContainer.appendChild(buttonContainer);

    return formContainer;
};

MenuEvent.prototype.showForm = function (event = null) {
    let container = document.getElementById("events");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(this.createForm(event));
};

MenuEvent.prototype.show = function () {
    let container = document.getElementById("events");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    container.appendChild(this.toTable());

    let buttonContainer = document.createElement("div");

    let createButton = document.createElement("button");
    createButton.textContent = "Criar";
    createButton.addEventListener("click", () => {
        this.showForm();
    });

    let editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => {
        if (this.selectedEvent) {
            this.showForm(this.selectedEvent);
        } else {
            alert("Um evento tem de ser selecionado");
        }
    });

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Apagar";
    deleteButton.addEventListener("click", () => {
        if (this.selectedEvent) {
            // Verifica se algum membro está inscrito neste evento
            let isRegisteredByAnyMember = MenuMember.default.members.some((member) =>
                member.registeredEvents.includes(this.selectedEvent)
            );
            if (isRegisteredByAnyMember) {
                alert("Não pode apagar este evento, pois há membros inscritos nele!");
            } else {
                // Pode apagar
                this.events = this.events.filter((e) => e !== this.selectedEvent);
                this.selectedEvent = null;
                this.show();
            }
        } else {
            alert("Um evento tem de ser selecionado");
        }
    });

    buttonContainer.appendChild(createButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    container.appendChild(buttonContainer);
};

/** Objeto default da classe MenuEvent */
MenuEvent.default = new MenuEvent();
