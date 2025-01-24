/*

Eine Netzplan-Anwendung mit dynamischen, modifizierbaren und verschiebbaren, Elementen
Grafische Darstellung, Berechnung der Zeiten, Hinzufügen und Entfernen von Elemente, Hinzufügen und Entfernen von Verbindungen, Mehrfachverbindungen
Berechnung und Darstellung des kritischen Pfads, Berechnung und Darstellung der Anfangs- und Endzeiten

Export- und Importfunktion (save&load)

Tabellarische Darstellung der NetzplanElemente, inkl. Beschreibung, Dauer, Vorgänger und Nachfolger

 */


class NetzplanElement {


    constructor(id, name, faz, fez, saz, sez, dauer, x, y,nachfolgerIds = []) {
        this.id = id;
        this.name = name;
        this.faz = faz;
        this.fez = fez;
        this.saz = saz;
        this.sez = sez;
        this.fp = 0;
        this.gp = 0;
        this.dauer = dauer;
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 60;
        this.nachfolgerIds = nachfolgerIds ;
    }

    addNachfolgerId(nachfolgerId) {
        if (!this.nachfolgerIds.includes(nachfolgerId)) {
            this.nachfolgerIds.push(nachfolgerId);
        }
    }

    draw(ctx, highlight = false) {
        const boxWidth = this.width;
        const boxHeight = this.height;
        const subBoxHeight = boxHeight / 3;


        ctx.strokeStyle = highlight ? "red" : "black";
        ctx.fillStyle = highlight ? "#ffe6e6" : "#ffffff";
        const textColor = highlight ? "red" : "black";
        ctx.lineWidth = 1;

        // Rechteck (Rahmen und Hintergrund)
        ctx.fillRect(this.x, this.y + 15, boxWidth, boxHeight - 15);
        ctx.strokeRect(this.x, this.y + 15, boxWidth, boxHeight - 15);

        // Horizontale Linien
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 2 * subBoxHeight);
        ctx.lineTo(this.x + boxWidth, this.y + 2 * subBoxHeight);
        ctx.stroke();

        // Vertikale Linien in der Mitte
        ctx.beginPath();
        ctx.moveTo(this.x + boxWidth / 3, this.y + subBoxHeight - 5);
        ctx.lineTo(this.x + boxWidth / 3, this.y + boxHeight);
        ctx.moveTo(this.x + 2 * boxWidth / 3, this.y + 2 * subBoxHeight);
        ctx.lineTo(this.x + 2 * boxWidth / 3, this.y + boxHeight);
        ctx.stroke();


        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = textColor; // Schriftfarbe setzen

        // ID und Name
        ctx.fillText(this.id, this.x + 15, this.y + 30);
        ctx.fillText(this.name, this.x + 65, this.y + 30);

        // FAZ und FEZ
        ctx.fillText("FAZ: " + this.faz, this.x, this.y + 10);
        ctx.fillText("FEZ: " + this.fez, this.x + boxWidth, this.y + 10);

        // SAZ, SEZ und Puffer
        // Dauer
        ctx.fillText(this.dauer, this.x + boxWidth / 6, this.y + 54);
        // GP
        ctx.fillText("GP: " + this.gp, this.x + boxWidth / 2, this.y + 54);
        // FP
        ctx.fillText("FP: " + this.fp, this.x + boxWidth - 18, this.y + 54);
        // SAZ
        ctx.fillText("SAZ:" + this.saz, this.x, this.y + 70);
        ctx.fillText("SEZ:" + this.sez, this.x + boxWidth, this.y + 70);
    }
}
