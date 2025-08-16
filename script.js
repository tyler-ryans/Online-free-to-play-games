const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverDiv = document.getElementById('gameOver');

let player, bullets, enemies, powerUps, explosions;
let score, health, gameRunning;

function initGame() {
  player = { x: 400, y: 500, size: 20, speed: 5 };
  bullets = [];
  enemies = [];
  powerUps = [];
  explosions = [];
  score = 0;
  health = 10;
  gameRunning = true;
  gameOverDiv.style.display = 'none';
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('click', shoot);

function movePlayer(e) {
  if (!gameRunning) return;
  if (e.key === 'ArrowUp' && player.y > 0) player.y -= player.speed;
  if (e.key === 'ArrowDown' && player.y < canvas.height - player.size) player.y += player.speed;
  if (e.key === 'ArrowLeft' && player.x > 0) player.x -= player.speed;
  if (e.key === 'ArrowRight' && player.x < canvas.width - player.size) player.x += player.speed;
}

function shoot() {
  if (!gameRunning) return;
  bullets.push({ x: player.x + player.size / 2 - 2.5, y: player.y, size: 5, speed: 7 });
}

function spawnEnemy() {
  if (!gameRunning) return;
  enemies.push({ x: Math.random() * (canvas.width - 20), y: 0, size: 20, speed: 2 });

  // 20% chance to spawn a power-up
  if (Math.random() < 0.2) {
    powerUps.push({ x: Math.random() * (canvas.width - 15), y: 0, size: 15, speed: 1 });
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

function update() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Update bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    ctx.fillStyle = 'violet'; // Magic theme
    ctx.fillRect(b.x, b.y, b.size, b.size);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Update enemies
  enemies.forEach((e, ei) => {
    e.y += e.speed;
    ctx.fillStyle = 'red';
    ctx.fillRect(e.x, e.y, e.size, e.size);

    // Collision with player
    if (detectCollision(e, player)) {
      enemies.splice(ei, 1);
      health--;
      if (health <= 0) endGame();
    }

    // Collision with bullets
    bullets.forEach((b, bi) => {
      if (detectCollision(b, e)) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
        explosions.push({ x: e.x, y: e.y, size: 20, life: 20 });
      }
    });

    if (e.y > canvas.height) {
      enemies.splice(ei, 1);
      health--;
      if (health <= 0) endGame();
    }
  });

  // Update power-ups
  powerUps.forEach((p, pi) => {
    p.y += p.speed;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(p.x, p.y, p.size, p.size);

    if (detectCollision(p, player)) {
      powerUps.splice(pi, 1);
      health = Math.min(health + 10, 25);
      player.speed += 2;
    }

    if (p.y > canvas.height) powerUps.splice(pi, 1);
  });

  // Update explosions
  explosions.forEach((ex, i) => {
    ctx.fillStyle = `rgba(255,165,0,${ex.life / 20})`;
    ctx.beginPath();
    ctx.arc(ex.x + ex.size / 2, ex.y + ex.size / 2, ex.size * (1 - ex.life / 20), 0, Math.PI * 2);
    ctx.fill();
    ex.life--;
    if (ex.life <= 0) explosions.splice(i, 1);
  });

  // HUD
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Health: ${health}`, 10, 60);

  requestAnimationFrame(update);
}

function endGame() {
  gameRunning = false;
  gameOverDiv.style.display = 'block';
}

function restartGame() {
  initGame();
  update();
}

initGame();
setInterval(spawnEnemy, 1000);
update();
