"use strict";
//202200030 202200030@estudantes.ips.pt
//202200009 202200009@estudantes.ips.pt

/**
 * Classe Event (sem auto-incremento local)
 * @param {string} typeName - Nome do tipo de evento (ex.: "Prova", "Passeio", etc.)
 * @param {string} description - Descrição do evento
 * @param {string} date - Data do evento (YYYY-MM-DD)
 * @param {number|null} id - ID (PK do BD)
 */
let Event = function(typeName = "", description = "", date = "", id = null) {
    this.id = id;
    this.typeName = typeName; 
    this.description = description;
    this.date = date;
};

/**
 * Rótulos para exibir na tabela
 */
Event.propertyLabels = {
    id: "Id",
    typeName: "Tipo",
    description: "Descrição",
    date: "Data"
};

/**
 * MenuEvent para gerir a listagem e CRUD
 */
function MenuEvent() {
    this.events = [];
    this.selectedEvent = null;
}

/**
 * Cria a tabela a partir do array this.events
 */
MenuEvent.prototype.toTable = function() {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    // Cabeçalhos (id, typeName, description, date)
    for (let prop in Event.propertyLabels) {
        let th = document.createElement("th");
        th.textContent = Event.propertyLabels[prop];
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    if (this.events.length > 0) {
        this.events.forEach(event => {
            let row = document.createElement("tr");
            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
                row.classList.add("selected");
                this.selectedEvent = event;
            });

            // Cria as TDs na ordem: id, typeName, description, date
            let cellId = document.createElement("td");
            cellId.textContent = event.id;
            row.appendChild(cellId);

            let cellTypeName = document.createElement("td");
            cellTypeName.textContent = event.typeName;
            row.appendChild(cellTypeName);

            let cellDescription = document.createElement("td");
            cellDescription.textContent = event.description;
            row.appendChild(cellDescription);

            let cellDate = document.createElement("td");
            cellDate.textContent = event.date;
            row.appendChild(cellDate);

            tbody.appendChild(row);
        });
    }
    table.appendChild(tbody);
    return table;
};

/**
 * Cria o formulário para criar/editar um evento
 * Se event for null => cria
 * Se event existir => edita
 */
MenuEvent.prototype.createForm = function(event = null) {
    let formContainer = document.createElement("form");

    let formTitle = document.createElement("h3");
    formTitle.textContent = event ? "Editar Evento" : "Criar Evento";
    formContainer.appendChild(formTitle);

    // Campo para nome do tipo (ex.: "Prova", "Passeio")
    let typeLabel = document.createElement("label");
    typeLabel.textContent = "Tipo (nome): ";
    typeLabel.style.display = "block";

    let typeInput = document.createElement("input");
    typeInput.type = "text";
    if (event) {
        typeInput.value = event.typeName;
    }

    // Campo para descrição
    let descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Descrição: ";
    descriptionLabel.style.display = "block";

    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    if (event) {
        descriptionInput.value = event.description;
    }

    // Campo para data
    let dateLabel = document.createElement("label");
    dateLabel.textContent = "Data (YYYY-MM-DD): ";
    dateLabel.style.display = "block";

    let dateInput = document.createElement("input");
    dateInput.type = "date";
    if (event) {
        dateInput.value = event.date;
    }

    // Monta o form
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
    saveButton.type = "button";
    saveButton.addEventListener("click", () => {
        let typeVal = typeInput.value.trim();
        let descrVal = descriptionInput.value.trim();
        let dateVal = dateInput.value;

        if (!typeVal || !descrVal || !dateVal) {
            alert("Preencha todos os campos!");
            return;
        }

        // Edição ou criação
        if (event) {
            // PUT /events/:id
            fetch(`/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // No back-end, você deve ter feito JOIN p/ mandar typeName
                    // Mas para atualizar, precisamos do ID do tipo ou da logica do back
                    // * Se você só guarda 'description' do tipo no BD, então adequar:
                    typeId: 0,    // ou a lógica que quiser
                    description: descrVal,
                    date: dateVal
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Falha ao atualizar evento");
                return res.json();
            })
            .then(() => {
                this.show();
            })
            .catch(err => alert(err.message));

        } else {
            // POST /events
            fetch("/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // No BD, se você realmente só quer guardar a "string" do tipo
                    // e não relacionar com event_types, no server ajusta a query
                    typeId: 0,
                    description: descrVal,
                    date: dateVal
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Falha ao criar evento");
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

    return formContainer;
};

/**
 * Exibe a listagem de eventos, buscando do servidor (GET /events)
 */
MenuEvent.prototype.show = function() {
    let container = document.getElementById("events");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    fetch("/events")
        .then(res => res.json())
        .then(data => {
            // data deve ser array de { id, typeName, description, date }
            this.events = data.map(obj => new Event(
                obj.typeName,   // do JOIN que vc faz no back-end
                obj.description,
                obj.date,
                obj.id
            ));

            container.appendChild(this.toTable());

            let buttonContainer = document.createElement("div");

            let createButton = document.createElement("button");
            createButton.textContent = "Criar";
            createButton.addEventListener("click", () => {
                this.showForm(); // Criar
            });

            let editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.addEventListener("click", () => {
                if (this.selectedEvent) {
                    this.showForm(this.selectedEvent);
                } else {
                    alert("Selecione um evento!");
                }
            });

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Apagar";
            deleteButton.addEventListener("click", () => {
                if (!this.selectedEvent) {
                    alert("Selecione um evento!");
                    return;
                }
                if (!confirm("Deseja apagar este evento?")) {
                    return;
                }
                // DELETE /events/:id
                fetch(`/events/${this.selectedEvent.id}`, {
                    method: "DELETE"
                })
                .then(res => {
                    if (!res.ok) throw new Error("Falha ao apagar evento");
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
            console.error("Erro ao carregar eventos:", err);
            alert("Não foi possível carregar eventos do servidor!");
        });
};

/**
 * Exibe o formulário no container #events
 */
MenuEvent.prototype.showForm = function(event = null) {
    let container = document.getElementById("events");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(this.createForm(event));
};

/** Singleton */  
MenuEvent.default = new MenuEvent();

// Se tiver <a id="showEvents" ...> no menu:
document.addEventListener("DOMContentLoaded", () => {
    let link = document.getElementById("showEvents");
    if (link) {
        link.addEventListener("click", (evt) => {
            evt.preventDefault();
            MenuEvent.default.show();
        });
    }
});
