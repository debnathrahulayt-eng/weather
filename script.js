const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');

const game = {
  width: canvas.width,
  height: canvas.height,
  paddleWidth: 16,
  paddleHeight: 110,
  paddleSpeed: 7,
  ballRadius: 10,
  maxBallSpeed: 10,
  leftScore: 0,
  rightScore: 0,
};

const leftPaddle = {
  x: 30,
  y: game.height / 2 - game.paddleHeight / 2,
  width: game.paddleWidth,
  height: game.paddleHeight,
  speed: game.paddleSpeed,
};

const rightPaddle = {
  x: game.width - 30 - game.paddleWidth,
  y: game.height / 2 - game.paddleHeight / 2,
  width: game.paddleWidth,
  height: game.paddleHeight,
  speed: 5.5,
};

const ball = {
  x: game.width / 2,
  y: game.height / 2,
  radius: game.ballRadius,
  vx: 4,
  vy: 3,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

let mouseY = game.height / 2;

function resetBall(direction) {
  ball.x = game.width / 2;
  ball.y = game.height / 2;
  const baseSpeed = 4.5;
  ball.vx = direction * (baseSpeed + Math.random() * 1.2);
  ball.vy = (Math.random() * 4 - 2) * 1.4;
}

function updateScore() {
  leftScoreEl.textContent = game.leftScore;
  rightScoreEl.textContent = game.rightScore;
}

function movePlayerPaddle() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

  const targetY = mouseY - leftPaddle.height / 2;
  leftPaddle.y += (targetY - leftPaddle.y) * 0.22;

  leftPaddle.y = Math.max(0, Math.min(game.height - leftPaddle.height, leftPaddle.y));
}

function moveComputerPaddle() {
  const target = ball.y - rightPaddle.height / 2;
  rightPaddle.y += (target - rightPaddle.y) * 0.12;
  rightPaddle.y = Math.max(0, Math.min(game.height - rightPaddle.height, rightPaddle.y));
}

function checkWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= game.height) {
    ball.y = game.height - ball.radius;
    ball.vy *= -1;
  }
}

function handlePaddleCollision(paddle, direction) {
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;

  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  const intersects =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  if (!intersects || direction === 0) {
    return;
  }

  ball.x = direction < 0 ? paddleLeft - ball.radius : paddleRight + ball.radius;
  const impactPoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  ball.vy = impactPoint * 5.5;

  const speed = Math.hypot(ball.vx, ball.vy);
  const newSpeed = Math.min(speed + 0.6, game.maxBallSpeed);
  const directionMultiplier = direction < 0 ? 1 : -1;
  const baseAngle = 0.28;

  ball.vx = directionMultiplier * (Math.cos(baseAngle) * newSpeed);
  ball.vy = Math.sin(baseAngle * impactPoint) * newSpeed;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  checkWallCollision();

  if (ball.x - ball.radius <= leftPaddle.x + leftPaddle.width) {
    if (ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + leftPaddle.height) {
      handlePaddleCollision(leftPaddle, -1);
    }
  }

  if (ball.x + ball.radius >= rightPaddle.x) {
    if (ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + rightPaddle.height) {
      handlePaddleCollision(rightPaddle, 1);
    }
  }

  if (ball.x < 0) {
    game.rightScore += 1;
    updateScore();
    resetBall(1);
  }

  if (ball.x > game.width) {
    game.leftScore += 1;
    updateScore();
    resetBall(-1);
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#facc15';
  ctx.fill();
  ctx.closePath();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  movePlayerPaddle();
  moveComputerPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
    event.preventDefault();
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  mouseY = (event.clientY - rect.top) * scaleY;
  mouseY = Math.max(0, Math.min(game.height, mouseY));
});

updateScore();
resetBall(1);
gameLoop();
