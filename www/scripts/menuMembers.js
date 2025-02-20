"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * @class Representa um membro do clube.
 * @constructor
 * @param {string} name - Nome do membro.
 * @param {string[]} preferredEventTypes - Tipos de eventos preferidos.
 */
let Member = function Member(name = "", preferredEventTypes = []) {
    if (!Member.currentId) {
        Member.currentId = 1; 
    }
    this.id = Member.currentId++;
    this.name = name;
    this.preferredEventTypes = preferredEventTypes; 
    this.registeredEvents = [];
};

/**
 * Rótulos das propriedades de Member
 */
Member.propertyLabels = {
    id: "Id",
    name: "Nome",
    preferredEventTypes: "Tipos de Eventos Preferidos",
    registeredEvents: "Eventos Inscritos"
};

/**
 * @class MenuMember
 * Gerencia a lista de membros e a UI.
 */
function MenuMember() {
    this.members = [];
    this.selectedMember = null;
}

/**
 * Cria a tabela que lista os membros.
 */
MenuMember.prototype.toTable = function () {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    for (let property in Member.propertyLabels) {
        let th = document.createElement("th");
        th.textContent = Member.propertyLabels[property];
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    if (this.members.length > 0) {
        this.members.forEach((member) => {
            let row = document.createElement("tr");

            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected"));
                row.classList.add("selected");
                this.selectedMember = member;
            });

            for (let property in Member.propertyLabels) {
                let cell = document.createElement("td");
                if (Array.isArray(member[property])) {
                    // Se for preferredEventTypes ou registeredEvents
                    if (property === "registeredEvents") {
                        // Exibe só as descrições dos eventos
                        let eventNames = member.registeredEvents.map(evt => evt.description);
                        cell.textContent = eventNames.join(", ");
                    } else {
                        // Ex: preferredEventTypes
                        cell.textContent = member[property].join(", ");
                    }
                } else {
                    cell.textContent = member[property];
                }
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
    }
    table.appendChild(tbody);
    return table;
};

/**
 * Cria o formulário de criar/editar Membro, com layout em coluna e checkboxes em grid.
 */
MenuMember.prototype.createForm = function (member = null) {
    // Cria um <form> (aproveita o estilo "form { ... }" do CSS)
    let formContainer = document.createElement("form");

    // Título do formulário
    let formTitle = document.createElement("h3");
    formTitle.textContent = member ? "Editar Membro" : "Criar Membro";
    formContainer.appendChild(formTitle);

    // ======== CAMPO NOME ========
    let nameLabel = document.createElement("label");
    nameLabel.textContent = "Nome";
    nameLabel.style.display = "block";  // Força label acima do input

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "memberName";
    if (member) {
        nameInput.value = member.name;
    }

    formContainer.appendChild(nameLabel);
    formContainer.appendChild(nameInput);

    // ======== CHECKBOXES DE TIPOS DE EVENTO ========
    let eventTypesLabel = document.createElement("label");
    eventTypesLabel.textContent = "Tipos de Eventos Preferidos";
    eventTypesLabel.style.display = "block"; // Quebra linha
    formContainer.appendChild(eventTypesLabel);

    // Container para os checkboxes em 2 colunas
    let eventTypesContainer = document.createElement("div");
    eventTypesContainer.style.display = "grid";
    eventTypesContainer.style.gridTemplateColumns = "1fr 1fr";
    eventTypesContainer.style.gap = "0.5rem";

    // Cria um checkbox para cada tipo de evento
    MenuEventType.default.eventTypes.forEach((type) => {
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = type.description;
        checkbox.id = `eventType_${type.description}`;
        if (member && member.preferredEventTypes.includes(type.description)) {
            checkbox.checked = true;
        }

        let lbl = document.createElement("label");
        lbl.htmlFor = `eventType_${type.description}`;
        lbl.textContent = type.description;

        // Agrupa checkbox + label dentro de um "div" para ficar arrumado
        let checkboxGroup = document.createElement("div");
        checkboxGroup.appendChild(checkbox);
        checkboxGroup.appendChild(lbl);

        eventTypesContainer.appendChild(checkboxGroup);
    });

    formContainer.appendChild(eventTypesContainer);

    // ======== BOTÕES GRAVAR / CANCELAR ========
    let buttonContainer = document.createElement("div");

    let saveButton = document.createElement("button");
    saveButton.textContent = "Gravar";
    saveButton.type = "button"; // evita submissão de form
    saveButton.addEventListener("click", () => {
        let name = nameInput.value.trim();
        // Pega todos os checkboxes marcados
        let preferredEventTypes = Array.from(
            eventTypesContainer.querySelectorAll("input[type='checkbox']:checked")
        ).map((checkbox) => checkbox.value);

        if (!name) {
            alert("O membro precisa de ter nome!");
        } else {
            if (member) {
                // Edição
                member.name = name;
                member.preferredEventTypes = preferredEventTypes;
            } else {
                // Criação
                this.members.push(new Member(name, preferredEventTypes));
            }
            this.show();
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

    // ======== BOTÕES DE INSCRIÇÃO / DESINSCRIÇÃO EM EVENTOS (se for edição) ========
    if (member) {
        let eventActionsContainer = document.createElement("div");

        let registerButton = document.createElement("button");
        registerButton.textContent = "Inscrever em Evento";
        registerButton.type = "button";
        registerButton.addEventListener("click", () => {
            this.showEventRegistrationForm(member);
        });

        let unregisterButton = document.createElement("button");
        unregisterButton.textContent = "Desinscrever de Evento";
        unregisterButton.type = "button";
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
 * Renderiza o formulário (criar/editar) no container #members.
 */
MenuMember.prototype.showForm = function (member = null) {
    let container = document.getElementById("members");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(this.createForm(member));
};

/**
 * Mostra a tela principal (listagem + botões CRUD).
 */
MenuMember.prototype.show = function () {
    let container = document.getElementById("members");
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
        if (this.selectedMember) {
            this.showForm(this.selectedMember);
        } else {
            alert("Tem de selecionar um membro!");
        }
    });

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Apagar";
    deleteButton.addEventListener("click", () => {
        if (this.selectedMember) {
            // Exclui o membro
            this.members = this.members.filter((m) => m !== this.selectedMember);
            this.selectedMember = null;
            this.show();
        } else {
            alert("Tem de selecionar um membro!");
        }
    });

    buttonContainer.appendChild(createButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    container.appendChild(buttonContainer);
};

/**
 * Exibe o formulário de inscrição em evento (apenas para eventos futuros,
 * do tipo preferido e não inscritos ainda).
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

    // Filtra eventos disponíveis
    let eventSelect = document.createElement("select");
    MenuEvent.default.events
        .filter((event) =>
            member.preferredEventTypes.includes(event.type) &&
            !member.registeredEvents.includes(event) &&
            new Date(event.date) > new Date() // só eventos futuros
        )
        .forEach((event) => {
            let option = document.createElement("option");
            option.value = event.id;
            option.textContent = `${event.type} - ${event.description} (${event.date})`;
            eventSelect.appendChild(option);
        });

    // Caso não existam eventos elegíveis
    if (!eventSelect.childElementCount) {
        let message = document.createElement("p");
        message.textContent = "Não há eventos disponíveis para inscrição.";
        formContainer.appendChild(message);

        // Botão para voltar
        let backBtn = document.createElement("button");
        backBtn.textContent = "Voltar";
        backBtn.addEventListener("click", () => {
            this.show();
        });
        formContainer.appendChild(backBtn);

        container.appendChild(formContainer);
        return;
    }

    // Se houver eventos elegíveis, mostra o <select> e os botões Aceitar/Cancelar
    formContainer.appendChild(eventSelect);

    let buttonContainer = document.createElement("div");

    let acceptButton = document.createElement("button");
    acceptButton.textContent = "Aceitar";
    acceptButton.addEventListener("click", () => {
        let selectedEventId = eventSelect.value;
        if (selectedEventId) {
            let selectedEvent = MenuEvent.default.events.find((evt) => evt.id == selectedEventId);
            if (selectedEvent) {
                member.registeredEvents.push(selectedEvent);
            }
            this.show();
        }
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
 * Exibe o formulário de desinscrição de evento.
 */
MenuMember.prototype.showEventUnregistrationForm = function (member) {
    let container = document.getElementById("members");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let formContainer = document.createElement("div");
    let formTitle = document.createElement("h3");
    formTitle.textContent = "Desinscrição de Evento";
    formContainer.appendChild(formTitle);

    let eventSelect = document.createElement("select");
    member.registeredEvents.forEach((event) => {
        let option = document.createElement("option");
        option.value = event.id;
        option.textContent = `${event.type} - ${event.description} (${event.date})`;
        eventSelect.appendChild(option);
    });

    // Se o membro não estiver inscrito em nenhum evento
    if (!eventSelect.childElementCount) {
        let message = document.createElement("p");
        message.textContent = "Não há eventos para desinscrição.";
        formContainer.appendChild(message);

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
        let selectedEventId = eventSelect.value;
        if (selectedEventId) {
            member.registeredEvents = member.registeredEvents.filter(
                (evt) => evt.id != selectedEventId
            );
        }
        this.show();
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

/** Objeto singleton default */
MenuMember.default = new MenuMember();

/**
 * Listener DOMContentLoaded para ativar o botão “Membros”
 * (Se você já tiver outro listener igual, pode remover isto.)
 */
document.addEventListener("DOMContentLoaded", () => {
    let link = document.getElementById("showMembers");
    if (link) {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            MenuMember.default.show();
        });
    }
});
