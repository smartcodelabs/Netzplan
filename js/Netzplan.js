class Netzplan {
    id = 0;
    constructor(name) {
        this.name = name;
        this.elements = [];
    }

    addElement(element) {
        if (!this.isOverlapping(element)) {
            element.id = this.id++;
            this.elements.push(element);
        } else {
            console.error("Elemente überschneiden sich!", element);
        }
    }

    getElementById(id) {
        return this.elements.find(el => el.id === id);
    }

    isOverlapping(newElement) {
        return this.elements.some(el =>
            newElement.x < el.x + el.width + 50 &&
            newElement.x + newElement.width + 50 > el.x &&
            newElement.y < el.y + el.height + 20 &&
            newElement.y + newElement.height + 20 > el.y
        );
    }

    drawAll(ctx) {
        this.elements.forEach(el => el.draw(ctx));
    }
}
