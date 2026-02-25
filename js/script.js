const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= GLOBAL VARIABLES =================

let gameOverScale = 0;
let bounceBack = false;

let retryButton = {
  x: 0,
  y: 0,
  width: 160,
  height: 45
};

const gameOverImg = new Image();
gameOverImg.src = "images/gameover.jpeg";

let gameState = "start";

let bird = {
  x: 80,
  y: 300,
  width: 30,
  height: 30,
  gravity: 0.18,
  lift: -9.5,
  velocity: 0
};

let pipes = [];
let frame = 0;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;

let pipeSpeed = 1.0;
let gap = 230;

// ================= RESET GAME =================

function resetGame() {
  bird.y = 300;
  bird.velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  pipeSpeed = 1.0;
  gap = 230;
  gameOverScale = 0;
  bounceBack = false;
}

// ================= DRAW BIRD =================

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// ================= UPDATE BIRD =================

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height) {
    gameState = "gameover";
  }

  if (bird.y < 0) {
    bird.y = 0;
  }
}

// ================= CREATE PIPE =================

function createPipe() {
  let topHeight = Math.random() * 300 + 50;

  pipes.push({
    x: canvas.width,
    width: 70,
    top: topHeight,
    bottom: canvas.height - topHeight - gap,
    passed: false
  });
}

// ================= DRAW PIPES =================

function drawPipes() {
  ctx.fillStyle = "green";

  pipes.forEach(pipe => {

    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(
      pipe.x,
      canvas.height - pipe.bottom,
      pipe.width,
      pipe.bottom
    );

    pipe.x -= pipeSpeed;

    // Collision
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top ||
        bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      gameState = "gameover";
    }

    // Score
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.passed = true;
    }
  });
}

// ================= DRAW SCORE =================

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "22px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("High: " + highScore, 20, 60);
}

// ================= START SCREEN =================

function drawStartScreen() {
  ctx.fillStyle = "black";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Flappy-Jak", canvas.width / 2, 250);

  ctx.font = "18px Arial";
  ctx.fillText("Press Space or Tap to Start", canvas.width / 2, 300);
}

// ================= GAME OVER SCREEN =================

function drawGameOver() {

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
  }

  // Dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Zoom + Bounce
  if (!bounceBack) {
    gameOverScale += 0.08;
    if (gameOverScale >= 1.1) {
      bounceBack = true;
    }
  } else {
    gameOverScale -= 0.05;
    if (gameOverScale <= 1) {
      gameOverScale = 1;
    }
  }

  let popupWidth = 320 * gameOverScale;
  let popupHeight = 220 * gameOverScale;

  let popupX = canvas.width / 2 - popupWidth / 2;
  let popupY = canvas.height / 2 - popupHeight / 2;

  ctx.drawImage(
    gameOverImg,
    popupX,
    popupY,
    popupWidth,
    popupHeight
  );

  // Glow Title
  ctx.shadowColor = "yellow";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, popupY + 50);
  ctx.shadowBlur = 0;

  // Custom text
  ctx.fillStyle = "#ff4444";
  ctx.font = "18px Arial";
  ctx.fillText("hehehe inka pakkaki po", canvas.width / 2, popupY + 80);

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, popupY + 110);
  ctx.fillText("High: " + highScore, canvas.width / 2, popupY + 140);

  // Retry button
  retryButton.x = canvas.width / 2 - retryButton.width / 2;
  retryButton.y = popupY + 170;

  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(
    retryButton.x,
    retryButton.y,
    retryButton.width,
    retryButton.height
  );

  ctx.fillStyle = "black";
  ctx.font = "bold 18px Arial";
  ctx.fillText("RETRY", canvas.width / 2, retryButton.y + 28);
}

// ================= MAIN LOOP =================

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "start") {
    drawStartScreen();
  }

  if (gameState === "playing") {

    if (frame % 170 === 0) {
      createPipe();
    }

    // Difficulty increase
    if (frame % 300 === 0 && frame !== 0) {
      pipeSpeed += 0.15;
      if (gap > 160) {
        gap -= 5;
      }
    }

    drawBird();
    updateBird();
    drawPipes();
    drawScore();

    frame++;
  }

  if (gameState === "gameover") {
    drawBird();
    drawPipes();
    drawScore();
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// ================= INPUT =================

function handleInput(event) {

  if (gameState === "start") {
    gameState = "playing";
  }
  else if (gameState === "playing") {
    bird.velocity = bird.lift;
  }
  else if (gameState === "gameover") {

    if (event) {
      let mouseX = event.offsetX;
      let mouseY = event.offsetY;

      if (
        mouseX > retryButton.x &&
        mouseX < retryButton.x + retryButton.width &&
        mouseY > retryButton.y &&
        mouseY < retryButton.y + retryButton.height
      ) {
        resetGame();
        gameState = "start";
      }
    }
  }
}

// Desktop
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    handleInput();
  }
});

// Click
canvas.addEventListener("click", function (e) {
  handleInput(e);
});

// Mobile
canvas.addEventListener("touchstart", function () {
  handleInput();
});

gameLoop();