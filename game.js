// Game Configuration
const CONFIG = {
    roadWidth: 400,
    laneWidth: 100,
    numLanes: 4,
    playerCarWidth: 40,
    playerCarHeight: 70,
    enemyCarWidth: 40,
    enemyCarHeight: 70,
    initialSpeed: 5,
    maxSpeed: 20,
    acceleration: 0.3,
    deceleration: 0.2,
    friction: 0.1,
};

// Game State
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    distance: 0,
    speed: CONFIG.initialSpeed,
    level: 1,
    roadOffset: 0,
    player: null,
    enemies: [],
    keys: {},
    animationId: null,
};

// Canvas Setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Player Car Class
class PlayerCar {
    constructor() {
        this.width = CONFIG.playerCarWidth;
        this.height = CONFIG.playerCarHeight;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 100;
        this.lane = 1;
        this.targetX = this.x;
        this.velocityX = 0;
    }

    update() {
        const laneWidth = CONFIG.roadWidth / CONFIG.numLanes;
        const roadLeft = (canvas.width - CONFIG.roadWidth) / 2;

        // Handle left/right movement
        if (gameState.keys['ArrowLeft'] && this.lane > 0) {
            this.lane--;
            gameState.keys['ArrowLeft'] = false;
        }
        if (gameState.keys['ArrowRight'] && this.lane < CONFIG.numLanes - 1) {
            this.lane++;
            gameState.keys['ArrowRight'] = false;
        }

        // Calculate target position based on lane
        this.targetX = roadLeft + (this.lane * laneWidth) + (laneWidth / 2) - (this.width / 2);

        // Smooth movement to target position
        const diff = this.targetX - this.x;
        this.velocityX = diff * 0.2;
        this.x += this.velocityX;

        // Handle acceleration/deceleration
        if (gameState.keys['ArrowUp']) {
            gameState.speed = Math.min(gameState.speed + CONFIG.acceleration, CONFIG.maxSpeed + (gameState.level * 2));
        } else if (gameState.keys['ArrowDown']) {
            gameState.speed = Math.max(gameState.speed - CONFIG.deceleration, 2);
        } else {
            // Natural friction
            if (gameState.speed > CONFIG.initialSpeed + gameState.level) {
                gameState.speed -= CONFIG.friction;
            } else if (gameState.speed < CONFIG.initialSpeed + gameState.level) {
                gameState.speed += CONFIG.friction;
            }
        }
    }

    draw() {
        // Car body - gradient based on speed
        const speedRatio = gameState.speed / CONFIG.maxSpeed;
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, `hsl(${200 + speedRatio * 60}, 100%, ${50 + speedRatio * 20}%)`);
        gradient.addColorStop(1, `hsl(${180 + speedRatio * 40}, 100%, ${40 + speedRatio * 10}%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Car outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Windshield
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 20);

        // Wheels
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x - 3, this.y + this.height - 25, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + this.height - 25, 6, 15);

        // Headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 8, this.y + this.height - 5, 8, 5);
        ctx.fillRect(this.x + this.width - 16, this.y + this.height - 5, 8, 5);

        // Speed lines (when going fast)
        if (gameState.speed > CONFIG.maxSpeed * 0.7) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - 10 - i * 10, this.y + this.height / 2 - 10 + i * 10);
                ctx.lineTo(this.x - 20 - i * 10, this.y + this.height / 2 - 15 + i * 10);
                ctx.stroke();
            }
        }
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// Enemy Car Class
class EnemyCar {
    constructor(lane, speed = null) {
        this.width = CONFIG.enemyCarWidth;
        this.height = CONFIG.enemyCarHeight;
        this.lane = lane;
        const laneWidth = CONFIG.roadWidth / CONFIG.numLanes;
        const roadLeft = (canvas.width - CONFIG.roadWidth) / 2;
        this.x = roadLeft + (lane * laneWidth) + (laneWidth / 2) - (this.width / 2);
        this.y = -this.height;
        this.speed = speed || (Math.random() * 3 + 2 + gameState.level * 0.5);
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [
            '#ff4444', '#44ff44', '#4444ff', '#ffff44',
            '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Move relative to player speed
        this.y += gameState.speed + this.speed;
    }

    draw() {
        // Car body
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 30));

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Car outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Windshield
        ctx.fillStyle = 'rgba(50, 50, 100, 0.5)';
        ctx.fillRect(this.x + 5, this.y + this.height - 30, this.width - 10, 20);

        // Wheels
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + 10, 6, 15);
        ctx.fillRect(this.x - 3, this.y + this.height - 25, 6, 15);
        ctx.fillRect(this.x + this.width - 3, this.y + this.height - 25, 6, 15);

        // Taillights
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 8, this.y, 8, 5);
        ctx.fillRect(this.x + this.width - 16, this.y, 8, 5);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Draw Road
function drawRoad() {
    const roadLeft = (canvas.width - CONFIG.roadWidth) / 2;

    // Road background
    ctx.fillStyle = '#444';
    ctx.fillRect(roadLeft, 0, CONFIG.roadWidth, canvas.height);

    // Road edges
    ctx.fillStyle = '#fff';
    ctx.fillRect(roadLeft - 10, 0, 10, canvas.height);
    ctx.fillRect(roadLeft + CONFIG.roadWidth, 0, 10, canvas.height);

    // Lane markers (moving)
    ctx.fillStyle = '#fff';
    const laneWidth = CONFIG.roadWidth / CONFIG.numLanes;
    const markerHeight = 40;
    const markerGap = 40;
    const totalHeight = markerHeight + markerGap;

    for (let lane = 1; lane < CONFIG.numLanes; lane++) {
        const x = roadLeft + lane * laneWidth;
        for (let y = -totalHeight + (gameState.roadOffset % totalHeight); y < canvas.height; y += totalHeight) {
            ctx.fillRect(x - 2, y, 4, markerHeight);
        }
    }

    gameState.roadOffset += gameState.speed;
}

// Draw Background with color progression
function drawBackground() {
    // Calculate darkness based on level
    const darkness = Math.min(gameState.level * 5, 60);

    const skyTop = `hsl(200, ${70 - darkness}%, ${70 - darkness}%)`;
    const skyBottom = `hsl(210, ${60 - darkness}%, ${50 - darkness}%)`;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, skyTop);
    gradient.addColorStop(1, skyBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

// Spawn Enemies
function spawnEnemy() {
    const availableLanes = [0, 1, 2, 3].filter(lane => {
        // Don't spawn in player's lane if they're too close to top
        if (lane === gameState.player.lane && gameState.player.y < canvas.height / 2) {
            return false;
        }
        // Check if lane is occupied near spawn point
        return !gameState.enemies.some(enemy =>
            enemy.lane === lane && enemy.y < 200
        );
    });

    if (availableLanes.length > 0) {
        const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        gameState.enemies.push(new EnemyCar(lane));
    }
}

// Update Game
function update() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Update player
    gameState.player.update();

    // Update enemies
    gameState.enemies.forEach(enemy => enemy.update());

    // Remove off-screen enemies and add score
    gameState.enemies = gameState.enemies.filter(enemy => {
        if (enemy.isOffScreen()) {
            gameState.score += 10;
            return false;
        }
        return true;
    });

    // Check collisions
    const playerBounds = gameState.player.getBounds();
    gameState.enemies.forEach(enemy => {
        if (checkCollision(playerBounds, enemy.getBounds())) {
            gameOver();
        }
    });

    // Spawn new enemies
    if (Math.random() < 0.02 + gameState.level * 0.005) {
        spawnEnemy();
    }

    // Update distance and score
    gameState.distance += gameState.speed * 0.1;
    gameState.score += Math.floor(gameState.speed * 0.1);

    // Level progression
    const newLevel = Math.floor(gameState.distance / 500) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
    }

    // Update UI
    updateUI();
}

// Draw Game
function draw() {
    drawBackground();
    drawRoad();

    // Draw enemies
    gameState.enemies.forEach(enemy => enemy.draw());

    // Draw player
    gameState.player.draw();
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = Math.floor(gameState.score);
    document.getElementById('distance').textContent = Math.floor(gameState.distance);
    document.getElementById('speed').textContent = Math.floor(gameState.speed * 10);
    document.getElementById('level').textContent = gameState.level;
}

// Game Loop
function gameLoop() {
    update();
    draw();
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    // Reset game state
    gameState = {
        isPlaying: true,
        isPaused: false,
        score: 0,
        distance: 0,
        speed: CONFIG.initialSpeed,
        level: 1,
        roadOffset: 0,
        player: new PlayerCar(),
        enemies: [],
        keys: {},
        animationId: null,
    };

    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');

    // Start game loop
    gameLoop();
}

// Game Over
function gameOver() {
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.animationId);

    // Show game over screen
    document.getElementById('final-score').textContent = Math.floor(gameState.score);
    document.getElementById('final-distance').textContent = Math.floor(gameState.distance);
    document.getElementById('game-over-screen').classList.remove('hidden');
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

window.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;

    // Prevent default arrow key behavior
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        gameState.keys[e.key] = false;
    }
});

// Initial UI update
updateUI();
