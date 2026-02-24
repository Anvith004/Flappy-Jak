const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let birdY = 200;
let gravity = 0.5;

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(50, birdY, 30, 30);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    birdY += gravity;
    drawBird();
    requestAnimationFrame(update);
}

update();