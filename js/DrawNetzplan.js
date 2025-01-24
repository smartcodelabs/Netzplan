
const canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 1000;
canvas.style.border = "1px solid black";
canvas.style.background = "#d1d1d1";
document.body.append(canvas);

const ctx = canvas.getContext("2d");
const netzplan = new Netzplan("Netzplan1");

element1 = new NetzplanElement(0, "Start", 0, 0, 0, 0,   10, 50, 50);
element2 = new NetzplanElement(0, "Planung", 0, 0, 0, 0,   5, 200, 50);
element3 = new NetzplanElement(0, "Team aufstellung", 0, 0, 0, 0,   7, 200, 130);

element1.addNachfolgerId(1,2);

netzplan.addElement(element1);
netzplan.addElement(element2);
netzplan.addElement(element3);

netzplan.drawAll(ctx);

canvas.addEventListener("mousemove", event => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    netzplan.elements.forEach(el => {
        const isHovered =
            mouseX > el.x &&
            mouseX < el.x + el.width &&
            mouseY > el.y &&
            mouseY < el.y + el.height;
        el.draw(ctx, isHovered);
    });
});
clicktime = new Date().getTime()
canvas.addEventListener("click", e => {

    if(clicktime && new Date().getTime() - clicktime < 250) {
        posX = e.x
        posY = e.y

        netzplan.addElement(new NetzplanElement(0, "Start", 0, 0, 0, 0,   10, posX, posY));

        netzplan.drawAll(ctx);
    }

    clicktime = new Date().getTime()
})
