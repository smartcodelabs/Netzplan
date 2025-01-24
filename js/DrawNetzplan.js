
const canvas = document.createElement("canvas");
document.body.oncontextmenu = function() { return false; }
canvas.width = 1000;
canvas.height = 1000;
canvas.style.border = "1px solid black";
canvas.style.background = "#d1d1d1";
document.body.append(canvas);

const ctx = canvas.getContext("2d");
const netzplan = new Netzplan("Netzplan1");

element1 = new NetzplanElement(0, "Start", 0, 0, 0, 0,   10, 50, 50,[1]);
element2 = new NetzplanElement(0, "Planung", 0, 0, 0, 0,   5, 200, 50,[2]);
element3 = new NetzplanElement(0, "Team aufstellung", 0, 0, 0, 0,   7, 200, 130,[3]);

element1.addNachfolgerId(1,2);

netzplan.addElement(element1);
netzplan.addElement(element2);
netzplan.addElement(element3);

//netzplan.drawAll(ctx);


netzplan.drawAll = function (ctx) {
    this.elements.forEach((element) => {
        drawConnections(ctx, element, this.elements);
    });

    this.elements.forEach((element) => {
        element.draw(ctx, false);
    });
};
let isHovered =false;
let isDragging = false;


//KI GENERIERT WEIL ZU BLÖDE :D
function drawConnections(ctx, element, elements) {
    const spacing = 5; // Abstand zwischen parallelen Linien

    element.nachfolgerIds.forEach((nachfolgerId, index) => {
        const targetElement = elements.find((el) => el.id === nachfolgerId);

        if (targetElement) {
            // Start- und Zielkoordinaten
            const startX = element.x + element.width / 2;
            const startY = element.y + element.height / 2;
            const endX = targetElement.x + targetElement.width / 2;
            const endY = targetElement.y + targetElement.height / 2;

            // Berechnung der Zwischenpunkte
            let intermediateX = startX;
            let intermediateY = startY;

            // Vertikaler Abstand zu anderen Linien
            const verticalOffset = spacing * index; // Unterschiedlicher Abstand je nach Nachfolger-Index

            // Um andere Elemente herumleiten
            const horizontalBlocked = elements.some((el) => {
                return (
                    el !== element && el !== targetElement && // Nicht das Start- oder Ziel-Element
                    el.x < Math.max(startX, endX) && // Innerhalb der X-Range
                    el.x + el.width > Math.min(startX, endX) && // Überlappt horizontal
                    el.y < startY + verticalOffset + spacing && // Überlappt vertikal
                    el.y + el.height > startY + verticalOffset - spacing
                );
            });

            if (horizontalBlocked) {
                intermediateX = startX < endX ? startX - 50 : startX + 50; // Umleitung nach links oder rechts
            }

            const verticalBlocked = elements.some((el) => {
                return (
                    el !== element && el !== targetElement && // Nicht das Start- oder Ziel-Element
                    el.y < Math.max(startY, endY) && // Innerhalb der Y-Range
                    el.y + el.height > Math.min(startY, endY) && // Überlappt vertikal
                    el.x < intermediateX + spacing && // Überlappt horizontal
                    el.x + el.width > intermediateX - spacing
                );
            });

            if (verticalBlocked) {
                intermediateY = startY < endY ? startY - 50 : startY + 50; // Umleitung nach oben oder unten
            }

            // Linie zeichnen
            ctx.beginPath();
            ctx.moveTo(startX, startY); // Startpunkt
            ctx.lineTo(intermediateX, startY + verticalOffset); // Erste horizontale Linie
            ctx.lineTo(intermediateX, endY); // Vertikale Umleitung
            ctx.lineTo(endX, endY); // Zielpunkt
            ctx.strokeStyle = "#000"; // Linienfarbe
            ctx.lineWidth = 2; // Liniendicke
            ctx.stroke();
        }
    });
}






canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;



    let activeElement = null;

    netzplan.elements.forEach((el) => {
        const isHovered =
            mouseX > el.x &&
            mouseX < el.x + el.width &&
            mouseY > el.y &&
            mouseY < el.y + el.height;

        if (isHovered && isDragging) {
            activeElement = el;

        }

        if (!isHovered) { ctx.clearRect(0,0, rect.width,rect.height); netzplan.drawAll(ctx); return;}
        el.draw(ctx, isHovered);
    });

    if (activeElement && isDragging) {

        ctx.clearRect(activeElement.x-15, activeElement.y, activeElement.width+27, activeElement.height+10);
        activeElement.x = mouseX - activeElement.width / 2; // Zentrieren
        activeElement.y = mouseY - activeElement.height / 2;
        activeElement.draw(ctx, true);


    }

});

let draggedElement = null;
let originalPosition = null;

canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const button = event.button;

    switch (button) {
        case 0: // Linksklick
            draggedElement = netzplan.elements.find((el) => {
                return (
                    mouseX > el.x &&
                    mouseX < el.x + el.width &&
                    mouseY > el.y &&
                    mouseY < el.y + el.height
                );
            });

            if (draggedElement) {
                isDragging = true;
                originalPosition = { x: draggedElement.x, y: draggedElement.y };
            }
            break;

        case 2: // Rechtsklick
            event.preventDefault();
            const clickedElement = netzplan.elements.find((el) => {
                return (
                    mouseX > el.x &&
                    mouseX < el.x + el.width &&
                    mouseY > el.y &&
                    mouseY < el.y + el.height
                );
            });

            if (clickedElement) {
                showContextMenu(event.clientX, event.clientY, clickedElement);
            }
            break;
    }
});







canvas.addEventListener("mouseup", () => {
    if (isDragging && draggedElement) {
        const overlaps = netzplan.elements.some((el) => {
            if (el === draggedElement) return false; // Sich selbst ignorieren
            return (
                draggedElement.x < el.x + el.width + 30 &&
                draggedElement.x + draggedElement.width + 30 > el.x &&
                draggedElement.y < el.y + el.height + 20 &&
                draggedElement.y + draggedElement.height + 20 > el.y
            );
        });

        if (overlaps) {
            draggedElement.x = originalPosition.x;
            draggedElement.y = originalPosition.y;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        netzplan.drawAll(ctx);

        isDragging = false;
        draggedElement = null;
        originalPosition = null;
    }
});
let clicktime = new Date().getTime();
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const posX = event.clientX - rect.left;
    const posY = event.clientY - rect.top;


    if (clicktime && new Date().getTime() - clicktime < 250) {

        showPopup(posX, posY);
        //netzplan.addElement(new NetzplanElement(0, "Start", 0, 0, 0, 0, 10, posX, posY));
        //netzplan.drawAll(ctx);
    }

    clicktime = new Date().getTime();




});


function showPopup(x, y) {
    const existingPopup = document.getElementById("popup-form");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "popup-form";
    popup.style.position = "absolute";
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.padding = "10px";
    popup.style.background = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    popup.style.zIndex = "1000";

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name:";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.style.marginBottom = "5px";

    const durationLabel = document.createElement("label");
    durationLabel.textContent = "Dauer:";
    const durationInput = document.createElement("input");
    durationInput.type = "number";
    durationInput.style.marginBottom = "5px";

    const predecessorLabel = document.createElement("label");
    predecessorLabel.textContent = "Vorgänger (IDs optional, mit Komma getrennt):";
    const predecessorInput = document.createElement("input");
    predecessorInput.type = "text";
    predecessorInput.placeholder = "z. B. 1,2,3";
    predecessorInput.style.marginBottom = "10px";


    const submitButton = document.createElement("button");
    submitButton.textContent = "Hinzufügen";
    submitButton.style.marginTop = "10px";
    submitButton.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const duration = parseInt(durationInput.value, 10);
        const predecessorIds = predecessorInput.value
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));


        if (!name || isNaN(duration)) {
            alert("Bitte geben Sie einen gültigen Namen und eine Dauer ein!");
            return;
        }

        const lastElementId = netzplan.elements.length > 0 ? netzplan.elements.length - 2 : 1;


        const newElement = new NetzplanElement(0, name, 0, 0, 0, 0, duration, x, y);


        if (predecessorIds.length > 0) {
            predecessorIds.forEach((id) => newElement.addNachfolgerId(id));
        } else if (lastElementId !== null) {
            newElement.addNachfolgerId(lastElementId);
        }



        netzplan.addElement(newElement);

        netzplan.drawAll(ctx); // Neu zeichnen

        popup.remove();
    });

    popup.appendChild(nameLabel);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(nameInput);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(durationLabel);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(durationInput);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(predecessorLabel);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(predecessorInput);
    popup.appendChild(document.createElement("br"));
    popup.appendChild(submitButton);

    document.body.appendChild(popup);

    setTimeout(() => {
        document.addEventListener(
            "click",
            (e) => {
                if (!popup.contains(e.target)) {
                    popup.remove();
                }
            },
            { once: true }
        );
    }, 0);
}


canvas.addEventListener("contextmenu", (event) => {

    event.preventDefault();
    event.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedElement = netzplan.elements.find((el) => {
        return (
            mouseX > el.x &&
            mouseX < el.x + el.width &&
            mouseY > el.y &&
            mouseY < el.y + el.height
        );
    });

    if (clickedElement) {
        showContextMenu(event.clientX, event.clientY, clickedElement);
        return;
    }

    console.log("Kein Element getroffen.");
});
function editElement(element) {
    const newName = prompt("Gib einen neuen Namen für das Element ein:", element.name);
    if (newName) {
        element.name = newName;
        redrawCanvas();
    }
}
function deleteElement(element) {
    netzplan.elements = netzplan.elements.filter((el) => el !== element);
    redrawCanvas();
}
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    netzplan.drawAll(ctx);
}

function connectionsPopup(element) {
    const existingPopup = document.getElementById("connections-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "connections-popup";
    popup.style.position = "absolute";
    popup.style.left = "50%";
    popup.style.top = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.padding = "20px";
    popup.style.background = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    popup.style.zIndex = "1000";
    popup.style.maxWidth = "400px";

    const title = document.createElement("h3");
    title.textContent = "Nachfolger bearbeiten";
    popup.appendChild(title);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const tableHeader = document.createElement("tr");
    tableHeader.innerHTML = `
        <th style="border: 1px solid #ccc; padding: 8px;">Nachfolger-ID</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Aktionen</th>
    `;
    table.appendChild(tableHeader);

    element.nachfolgerIds.forEach((id) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${id}</td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                <button class="remove-button" data-id="${id}">Entfernen</button>
            </td>
        `;

        table.appendChild(row);
    });

    popup.appendChild(table);

    const suggestTitle = document.createElement("p");
    suggestTitle.textContent = "Neue Nachfolger-ID hinzufügen:";
    suggestTitle.style.marginTop = "15px";
    popup.appendChild(suggestTitle);

    const suggestionInput = document.createElement("input");
    suggestionInput.type = "number";
    suggestionInput.placeholder = "Nachfolger-ID";
    suggestionInput.style.marginRight = "10px";
    popup.appendChild(suggestionInput);

    const addButton = document.createElement("button");
    addButton.textContent = "Hinzufügen";
    popup.appendChild(addButton);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Schließen";
    closeButton.style.marginTop = "15px";
    closeButton.style.marginLeft = "10px";
    closeButton.addEventListener("click", () => popup.remove());
    popup.appendChild(closeButton);

    addButton.addEventListener("click", () => {
        const newId = parseInt(suggestionInput.value, 10);
        if (!isNaN(newId) && !element.nachfolgerIds.includes(newId)) {
            element.addNachfolgerId(newId);

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${newId}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                    <button class="remove-button" data-id="${newId}">Entfernen</button>
                </td>
            `;
            table.appendChild(newRow);

            suggestionInput.value = "";
        } else {
            alert("Ungültige oder bereits vorhandene ID!");
        }
    });

    table.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-button")) {
            const idToRemove = parseInt(e.target.getAttribute("data-id"), 10);
            element.nachfolgerIds = element.nachfolgerIds.filter((id) => id !== idToRemove);


            e.target.closest("tr").remove();
        }
    });

    document.body.appendChild(popup);
}


function showContextMenu(x, y, element) {
    const existingMenu = document.getElementById("context-menu");
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement("div");
    menu.id = "context-menu";
    menu.style.position = "absolute";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.background = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.padding = "10px";
    menu.style.zIndex = "1000";
    menu.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    menu.style.cursor = "pointer";

    const editOption = document.createElement("div");
    editOption.textContent = "Bearbeiten";
    editOption.style.padding = "5px";
    editOption.style.cursor = "pointer";
    editOption.style.transition = "background 0.2s";
    editOption.addEventListener("mouseover", () => {
        editOption.style.backgroundColor = "#f0f0f0";
    });
    editOption.addEventListener("mouseout", () => {
        editOption.style.backgroundColor = "";
    });
    editOption.addEventListener("click", () => {
        editElement(element);
        menu.remove();
    });

    const conectionsOption = document.createElement("div");
    conectionsOption.textContent = "Verbindungen";
    conectionsOption.style.padding = "5px";
    conectionsOption.style.cursor = "pointer";
    conectionsOption.style.transition = "background 0.2s";
    conectionsOption.addEventListener("mouseover", () => {
        conectionsOption.style.backgroundColor = "#f0f0f0";
    });
    conectionsOption.addEventListener("mouseout", () => {
        conectionsOption.style.backgroundColor = "";
    });
    conectionsOption.addEventListener("click", () => {
        console.log(element.nachfolgerIds);
        connectionsPopup(element);
        menu.remove();
    });


    const deleteOption = document.createElement("div");
    deleteOption.textContent = "Löschen";
    deleteOption.style.padding = "5px";
    deleteOption.style.marginTop = "5px";
    deleteOption.style.cursor = "pointer";
    deleteOption.style.transition = "background 0.2s";
    deleteOption.addEventListener("mouseover", () => {
        deleteOption.style.backgroundColor = "#f0f0f0";
    });
    deleteOption.addEventListener("mouseout", () => {
        deleteOption.style.backgroundColor = "";
    });
    deleteOption.addEventListener("click", () => {
        deleteElement(element);
        menu.remove();
    });

    menu.appendChild(conectionsOption);
    menu.appendChild(editOption);
    menu.appendChild(deleteOption);

    document.body.appendChild(menu);

    //Hier musste ich ein Timeout machen weils sonst nicht ging
    setTimeout(() => {
        document.addEventListener(
            "click",
            (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                }
            },
            { once: true }
        );
    }, 0);

}
