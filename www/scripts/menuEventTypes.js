"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * @class Representa um tipo de evento.
 * @letructs EventType
 * @param {string} description - Descrição do tipo de evento.
 *
 * @property {number} id - ID único do evento, gerado automaticamente.
 * @property {string} description - Descrição textual do tipo de evento.
 */

let EventType = function EventType(description = "") {
    if (!EventType.currentId) {
        EventType.currentId = 1; // Inicializa o contador global de IDs.
    }
    this.id = EventType.currentId++; // Gera um ID único automaticamente.
    this.description = description; // Descrição fornecida ao criar o evento.
};

/**
 * @memberof EventType
 * @property {object} propertyLabels - Rótulos das propriedades da classe, utilizados para criar cabeçalhos na tabela.
 * @readonly
 */
EventType.propertyLabels = {
    id: "Id",
    description: "Descrição"
};

/**
 * @class Gerencia a lista de tipos de eventos e sua interação com a interface do usuário.
 * @letructs MenuEventType
 *
 * @property {EventType[]} eventTypes - Lista de todos os tipos de eventos criados.
 * @property {EventType|null} selectedEvent - Referência ao evento atualmente selecionado (ou `null` se nenhum estiver selecionado).
 */
function MenuEventType() {
    this.eventTypes = [];
    this.selectedEvent = null; // Evento selecionado para edição ou exclusão.
}

/**
 * Gera a tabela que exibe os tipos de eventos.
 * 
 * @memberof MenuEventType
 * @returns {HTMLElement} Tabela HTML contendo os eventos cadastrados.
 */
MenuEventType.prototype.toTable = function () {
    let table = document.createElement("table"); 
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    for (let property in EventType.propertyLabels) {
        let th = document.createElement("th");
        th.textContent = EventType.propertyLabels[property];
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    if (this.eventTypes.length > 0) {
        this.eventTypes.forEach((eventType) => {
            let row = document.createElement("tr");

            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach((r) => r.classList.remove("selected")); // Remove seleção anterior.
                row.classList.add("selected");
                this.selectedEvent = eventType; 
            });

            for (let property in EventType.propertyLabels) {
                let cell = document.createElement("td");
                cell.textContent = eventType[property];
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
    }
    table.appendChild(tbody);

    return table;
};

/**
 * Cria um formulário HTML para adicionar ou editar um evento.
 *
 * @memberof MenuEventType
 * @param {EventType|null} event - O evento a ser editado, ou `null` para criar um novo evento.
 * @returns {HTMLElement} Formulário HTML para criação ou edição.
 */
MenuEventType.prototype.createForm = function (event = null) {
    let formContainer = document.createElement("div");

    let formTitle = document.createElement("h3");
    formTitle.textContent = event ? "Editar Tipo de Evento" : "Criar Tipo de Evento";
    formContainer.appendChild(formTitle);

    let label = document.createElement("label");
    label.textContent = "Descrição: ";
    let input = document.createElement("input");
    input.type = "text";
    input.id = "eventDescription";
    if (event) {
        input.value = event.description; 
    }
    formContainer.appendChild(label);
    formContainer.appendChild(input);

    let buttonContainer = document.createElement("div");

    let saveButton = document.createElement("button");
    saveButton.textContent = "Gravar";
    saveButton.addEventListener("click", () => {
        let description = input.value.trim();
        if (!description) {
            alert("Descrição requirida!");;
        } else {
            if (event) {
                event.description = description; 
            } else {
                this.eventTypes.push(new EventType(description));
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

/**
 * Exibe a tabela de eventos e os botões de ação.
 *
 * @memberof MenuEventType
 */
MenuEventType.prototype.show = function () {
    let container = document.getElementById("eventTypes");

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
            alert("Tem de selecionar um item!");
        }
    });

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Apagar";
    deleteButton.addEventListener("click", () => {
        if (this.selectedEvent) {
            const isUsed = MenuEvent.default.events.some(
                (event) => event.type === this.selectedEvent.description
            );

            if (isUsed) {
                alert(
                    `Não pode apagar o tipo "${this.selectedEvent.description}" porque existem eventos associados a ele.`
                );
            } else {
                this.eventTypes = this.eventTypes.filter(
                    (eventType) => eventType !== this.selectedEvent
                );
                this.selectedEvent = null; 
                this.show();
            }
        } else {
            alert("Tem de selecionar um item!");
        }
    });

    buttonContainer.appendChild(createButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    container.appendChild(buttonContainer);
};


/**
 * Exibe o formulário de criação ou edição.
 *
 * @memberof MenuEventType
 * @param {EventType|null} event 
 */
MenuEventType.prototype.showForm = function (event = null) {
    let container = document.getElementById("eventTypes");

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    container.appendChild(this.createForm(event));
};

/**
 * Objeto default da classe MenuEventType.
 * @memberof MenuEventType
 * @type {MenuEventType}
 */
MenuEventType.default = new MenuEventType();

document.addEventListener("DOMContentLoaded", () => {
    let link = document.getElementById("showEventTypes");
    link.addEventListener("click", (event) => {
        event.preventDefault();
        MenuEventType.default.show(); 
    });
});


//Gerado pelo GPT
document.addEventListener("DOMContentLoaded", () => {
    const sections = ["members", "events", "eventTypes"];

    // Função para ocultar todas as secções
    function hideAllSections() {
        sections.forEach((section) => {
            const element = document.getElementById(section);
            if (element) element.style.display = "none";
        });
    }

    // Adiciona eventos aos links de navegação
    document.getElementById("showMembers").addEventListener("click", (event) => {
        event.preventDefault();
        hideAllSections();
        document.getElementById("members").style.display = "block"; // Mostra "Membros"
        MenuMember.default.show();
    });

    document.getElementById("showEvents").addEventListener("click", (event) => {
        event.preventDefault();
        hideAllSections();
        document.getElementById("events").style.display = "block"; // Mostra "Eventos"
        MenuEvent.default.show();
    });

    document.getElementById("showEventTypes").addEventListener("click", (event) => {
        event.preventDefault();
        hideAllSections();
        document.getElementById("eventTypes").style.display = "block"; // Mostra "Tipos de Eventos"
        MenuEventType.default.show();
    });

    // Oculta todas as secções inicialmente
    hideAllSections();
});

