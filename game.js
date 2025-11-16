// Game Configuration
const CONFIG = {
    roadWidth: 400,
    laneWidth: 100,
    numLanes: 4,
    playerCarWidth: 40,
    playerCarHeight: 70,
    enemyCarWidth: 40,
    enemyCarHeight: 70,
};

// Difficulty Settings
const DIFFICULTY = {
    easy: {
        initialSpeed: 3,
        maxSpeed: 12,
        acceleration: 0.2,
        deceleration: 0.15,
        friction: 0.08,
        enemySpawnRate: 0.015,
        enemySpeedBonus: 0.3,
    },
    medium: {
        initialSpeed: 5,
        maxSpeed: 18,
        acceleration: 0.3,
        deceleration: 0.2,
        friction: 0.1,
        enemySpawnRate: 0.02,
        enemySpeedBonus: 0.5,
    },
    hard: {
        initialSpeed: 7,
        maxSpeed: 25,
        acceleration: 0.4,
        deceleration: 0.25,
        friction: 0.12,
        enemySpawnRate: 0.025,
        enemySpeedBonus: 0.8,
    }
};

// Car Models
const CAR_MODELS = {
    speedster: {
        name: 'Speedster',
        colors: ['#00D9FF', '#0099CC'],
        accentColor: '#00FFFF',
        unlocked: true,
    },
    muscle: {
        name: 'Muscle',
        colors: ['#FF4444', '#CC0000'],
        accentColor: '#FF0000',
        unlocked: true,
    },
    racer: {
        name: 'Racer Pro',
        colors: ['#FFD700', '#FFA500'],
        accentColor: '#FFFF00',
        unlocked: true,
    },
    neon: {
        name: 'Neon',
        colors: ['#FF00FF', '#8800FF'],
        accentColor: '#FF00FF',
        unlocked: true,
    },
    phantom: {
        name: 'Phantom',
        colors: ['#000000', '#333333'],
        accentColor: '#8800FF',
        unlocked: false,
    },
    lightning: {
        name: 'Lightning',
        colors: ['#FFFF00', '#FFD700'],
        accentColor: '#FFF000',
        unlocked: false,
    },
    chrome: {
        name: 'Chrome',
        colors: ['#C0C0C0', '#E8E8E8'],
        accentColor: '#FFFFFF',
        unlocked: false,
    },
    fire: {
        name: 'Fire',
        colors: ['#FF4500', '#FF0000'],
        accentColor: '#FF6600',
        unlocked: false,
    }
};

// Quests System
const QUESTS = [
    {
        id: 'first_race',
        title: 'Première Course',
        description: 'Terminez votre première course',
        target: 1,
        reward: { type: 'item', id: 'trophy_bronze', name: 'Trophée Bronze', icon: '🥉' },
        check: (stats) => stats.gamesPlayed >= 1,
        progress: (stats) => Math.min(stats.gamesPlayed, 1),
    },
    {
        id: 'speed_demon',
        title: 'Démon de Vitesse',
        description: 'Atteignez 200 km/h',
        target: 200,
        reward: { type: 'car', id: 'lightning', name: 'Lightning', icon: '⚡' },
        check: (stats) => stats.maxSpeed >= 200,
        progress: (stats) => Math.min(stats.maxSpeed, 200),
    },
    {
        id: 'distance_master',
        title: 'Maître des Distances',
        description: 'Parcourez 5000m en une partie',
        target: 5000,
        reward: { type: 'car', id: 'phantom', name: 'Phantom', icon: '👻' },
        check: (stats) => stats.maxDistance >= 5000,
        progress: (stats) => Math.min(stats.maxDistance, 5000),
    },
    {
        id: 'score_hunter',
        title: 'Chasseur de Points',
        description: 'Obtenez 10000 points',
        target: 10000,
        reward: { type: 'item', id: 'trophy_silver', name: 'Trophée Argent', icon: '🥈' },
        check: (stats) => stats.maxScore >= 10000,
        progress: (stats) => Math.min(stats.maxScore, 10000),
    },
    {
        id: 'level_up',
        title: 'Montée de Niveau',
        description: 'Atteignez le niveau 5',
        target: 5,
        reward: { type: 'car', id: 'chrome', name: 'Chrome', icon: '💎' },
        check: (stats) => stats.maxLevel >= 5,
        progress: (stats) => Math.min(stats.maxLevel, 5),
    },
    {
        id: 'veteran',
        title: 'Vétéran',
        description: 'Jouez 20 parties',
        target: 20,
        reward: { type: 'car', id: 'fire', name: 'Fire', icon: '🔥' },
        check: (stats) => stats.gamesPlayed >= 20,
        progress: (stats) => Math.min(stats.gamesPlayed, 20),
    },
    {
        id: 'total_distance',
        title: 'Globe-Trotter',
        description: 'Parcourez 50000m au total',
        target: 50000,
        reward: { type: 'item', id: 'trophy_gold', name: 'Trophée Or', icon: '🏆' },
        check: (stats) => stats.totalDistance >= 50000,
        progress: (stats) => Math.min(stats.totalDistance, 50000),
    },
    {
        id: 'hard_mode',
        title: 'Expert',
        description: 'Terminez une course en mode Difficile',
        target: 1,
        reward: { type: 'item', id: 'medal', name: 'Médaille Expert', icon: '🎖️' },
        check: (stats) => stats.hardModeCompleted >= 1,
        progress: (stats) => Math.min(stats.hardModeCompleted, 1),
    },
];

// Player Stats (persistent)
let playerStats = {
    gamesPlayed: 0,
    maxScore: 0,
    maxDistance: 0,
    maxSpeed: 0,
    maxLevel: 0,
    totalDistance: 0,
    hardModeCompleted: 0,
    completedQuests: [],
    unlockedItems: [],
};

// Game State
let gameSettings = {
    selectedCar: 'speedster',
    selectedDifficulty: 'easy',
};

let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    distance: 0,
    speed: 3,
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

// Draw Car Function (reusable for player, enemies, and previews)
function drawCar(ctx, x, y, width, height, carModel, isPreview = false) {
    const model = CAR_MODELS[carModel] || CAR_MODELS.speedster;

    // Car body - gradient
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, model.colors[0]);
    gradient.addColorStop(1, model.colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Car outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = isPreview ? 1 : 2;
    ctx.strokeRect(x, y, width, height);

    // Windshield
    ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.fillRect(x + width * 0.125, y + height * 0.14, width * 0.75, height * 0.28);

    // Wheels
    ctx.fillStyle = '#222';
    const wheelWidth = width * 0.15;
    const wheelHeight = height * 0.21;
    ctx.fillRect(x - wheelWidth * 0.5, y + height * 0.14, wheelWidth, wheelHeight);
    ctx.fillRect(x + width - wheelWidth * 0.5, y + height * 0.14, wheelWidth, wheelHeight);
    ctx.fillRect(x - wheelWidth * 0.5, y + height * 0.64, wheelWidth, wheelHeight);
    ctx.fillRect(x + width - wheelWidth * 0.5, y + height * 0.64, wheelWidth, wheelHeight);

    // Headlights
    ctx.fillStyle = model.accentColor;
    ctx.fillRect(x + width * 0.2, y + height * 0.93, width * 0.2, height * 0.07);
    ctx.fillRect(x + width * 0.6, y + height * 0.93, width * 0.2, height * 0.07);

    // Accent stripe
    ctx.fillStyle = model.accentColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + width * 0.3, y + height * 0.4, width * 0.4, height * 0.2);
    ctx.globalAlpha = 1.0;
}

// Player Car Class
class PlayerCar {
    constructor(carModel) {
        this.width = CONFIG.playerCarWidth;
        this.height = CONFIG.playerCarHeight;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 100;
        this.lane = 1;
        this.targetX = this.x;
        this.velocityX = 0;
        this.carModel = carModel;
    }

    update() {
        const difficulty = DIFFICULTY[gameSettings.selectedDifficulty];
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
            gameState.speed = Math.min(
                gameState.speed + difficulty.acceleration,
                difficulty.maxSpeed + (gameState.level * 1.5)
            );
        } else if (gameState.keys['ArrowDown']) {
            gameState.speed = Math.max(gameState.speed - difficulty.deceleration, 1);
        } else {
            // Natural friction
            if (gameState.speed > difficulty.initialSpeed + gameState.level * 0.5) {
                gameState.speed -= difficulty.friction;
            } else if (gameState.speed < difficulty.initialSpeed + gameState.level * 0.5) {
                gameState.speed += difficulty.friction * 0.5;
            }
        }
    }

    draw() {
        drawCar(ctx, this.x, this.y, this.width, this.height, this.carModel);

        // Speed lines (when going fast)
        const difficulty = DIFFICULTY[gameSettings.selectedDifficulty];
        if (gameState.speed > difficulty.maxSpeed * 0.7) {
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

        const difficulty = DIFFICULTY[gameSettings.selectedDifficulty];
        this.speed = speed || (Math.random() * 2 + 1.5 + gameState.level * difficulty.enemySpeedBonus);
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

    const difficulty = DIFFICULTY[gameSettings.selectedDifficulty];

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
    if (Math.random() < difficulty.enemySpawnRate + gameState.level * 0.003) {
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
    const difficulty = DIFFICULTY[gameSettings.selectedDifficulty];

    // Reset game state
    gameState = {
        isPlaying: true,
        isPaused: false,
        score: 0,
        distance: 0,
        speed: difficulty.initialSpeed,
        level: 1,
        roadOffset: 0,
        player: new PlayerCar(gameSettings.selectedCar),
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

    // Update player stats
    updatePlayerStats();

    // Show game over screen
    document.getElementById('final-score').textContent = Math.floor(gameState.score);
    document.getElementById('final-distance').textContent = Math.floor(gameState.distance);
    document.getElementById('game-over-screen').classList.remove('hidden');

    // Check quests
    checkQuests();
}

// Draw Car Previews in Menu
function drawCarPreviews() {
    Object.keys(CAR_MODELS).forEach(modelKey => {
        const previewElement = document.getElementById(`preview-${modelKey}`);
        if (!previewElement) return;

        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 60;
        previewCanvas.height = 80;
        const previewCtx = previewCanvas.getContext('2d');

        // Draw car in preview
        drawCar(previewCtx, 10, 10, 40, 60, modelKey, true);

        // Replace the div with the canvas
        previewElement.innerHTML = '';
        previewElement.appendChild(previewCanvas);
    });
}

// === QUESTS SYSTEM ===

// Load player stats from localStorage
function loadPlayerStats() {
    const saved = localStorage.getItem('sonicRacerStats');
    if (saved) {
        playerStats = JSON.parse(saved);
        // Unlock cars based on saved data
        playerStats.completedQuests.forEach(questId => {
            const quest = QUESTS.find(q => q.id === questId);
            if (quest && quest.reward.type === 'car') {
                CAR_MODELS[quest.reward.id].unlocked = true;
            }
        });
    }
}

// Save player stats to localStorage
function savePlayerStats() {
    localStorage.setItem('sonicRacerStats', JSON.stringify(playerStats));
}

// Update stats after game over
function updatePlayerStats() {
    playerStats.gamesPlayed++;
    playerStats.maxScore = Math.max(playerStats.maxScore, Math.floor(gameState.score));
    playerStats.maxDistance = Math.max(playerStats.maxDistance, Math.floor(gameState.distance));
    playerStats.maxSpeed = Math.max(playerStats.maxSpeed, Math.floor(gameState.speed * 10));
    playerStats.maxLevel = Math.max(playerStats.maxLevel, gameState.level);
    playerStats.totalDistance += Math.floor(gameState.distance);

    if (gameSettings.selectedDifficulty === 'hard' && gameState.distance > 1000) {
        playerStats.hardModeCompleted++;
    }

    savePlayerStats();
}

// Check and complete quests
function checkQuests() {
    QUESTS.forEach(quest => {
        if (!playerStats.completedQuests.includes(quest.id) && quest.check(playerStats)) {
            // Quest completed!
            playerStats.completedQuests.push(quest.id);
            playerStats.unlockedItems.push(quest.reward.id);

            // Unlock reward
            if (quest.reward.type === 'car') {
                CAR_MODELS[quest.reward.id].unlocked = true;
            }

            savePlayerStats();
            showQuestNotification(quest);
        }
    });
}

// Show quest completion notification
function showQuestNotification(quest) {
    const notification = document.createElement('div');
    notification.className = 'quest-notification';
    notification.innerHTML = `
        ${quest.reward.icon} Quête Terminée!<br>
        <strong>${quest.title}</strong><br>
        Débloqué: ${quest.reward.name}
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Render quests screen
function renderQuests() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';

    QUESTS.forEach(quest => {
        const isCompleted = playerStats.completedQuests.includes(quest.id);
        const progress = quest.progress(playerStats);
        const progressPercent = Math.min((progress / quest.target) * 100, 100);

        const questCard = document.createElement('div');
        questCard.className = `quest-card ${isCompleted ? 'completed' : ''}`;
        questCard.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-progress">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa; font-size: 12px;">Progression</span>
                    <span style="color: #fff; font-size: 12px;">${Math.floor(progress)}/${quest.target}</span>
                </div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            <div class="quest-reward">
                <span class="quest-reward-icon">${quest.reward.icon}</span>
                <span class="quest-reward-text">${quest.reward.name}</span>
            </div>
            ${isCompleted ? '<div class="quest-status">✓ Complétée</div>' : ''}
        `;
        questsList.appendChild(questCard);
    });
}

// Render unlocked items
function renderUnlockedItems() {
    const itemsGrid = document.getElementById('unlocked-items');
    itemsGrid.innerHTML = '';

    // Show all cars
    Object.keys(CAR_MODELS).forEach(carId => {
        const car = CAR_MODELS[carId];
        const isUnlocked = car.unlocked;

        const itemCard = document.createElement('div');
        itemCard.className = `unlocked-item ${!isUnlocked ? 'locked-item' : ''}`;
        itemCard.innerHTML = `
            <div class="unlocked-item-icon">${isUnlocked ? '🏎️' : '🔒'}</div>
            <div class="unlocked-item-name">${car.name}</div>
        `;
        itemsGrid.appendChild(itemCard);
    });

    // Show trophies/items
    const items = [
        { id: 'trophy_bronze', name: 'Trophée Bronze', icon: '🥉' },
        { id: 'trophy_silver', name: 'Trophée Argent', icon: '🥈' },
        { id: 'trophy_gold', name: 'Trophée Or', icon: '🏆' },
        { id: 'medal', name: 'Médaille Expert', icon: '🎖️' },
    ];

    items.forEach(item => {
        const isUnlocked = playerStats.unlockedItems.includes(item.id);
        const itemCard = document.createElement('div');
        itemCard.className = `unlocked-item ${!isUnlocked ? 'locked-item' : ''}`;
        itemCard.innerHTML = `
            <div class="unlocked-item-icon">${isUnlocked ? item.icon : '🔒'}</div>
            <div class="unlocked-item-name">${item.name}</div>
        `;
        itemsGrid.appendChild(itemCard);
    });
}

// Show quests screen
function showQuestsScreen() {
    renderQuests();
    renderUnlockedItems();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quests-screen').classList.remove('hidden');
}

// Hide quests screen
function hideQuestsScreen() {
    document.getElementById('quests-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

// Menu Selection Handlers
function setupMenuHandlers() {
    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameSettings.selectedDifficulty = btn.dataset.difficulty;
        });
    });

    // Car selection - only allow unlocked cars
    document.querySelectorAll('.car-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const carId = btn.dataset.car;
            if (!CAR_MODELS[carId].unlocked) {
                showQuestNotification({
                    title: 'Voiture Verrouillée',
                    reward: { icon: '🔒', name: 'Complétez des quêtes pour débloquer' }
                });
                return;
            }
            document.querySelectorAll('.car-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameSettings.selectedCar = carId;
        });
    });
}

// Update car selection UI
function updateCarSelectionUI() {
    document.querySelectorAll('.car-option').forEach(btn => {
        const carId = btn.dataset.car;
        if (!CAR_MODELS[carId].unlocked) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    });
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
});

document.getElementById('quests-btn').addEventListener('click', showQuestsScreen);
document.getElementById('close-quests-btn').addEventListener('click', hideQuestsScreen);

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

// Initialize
loadPlayerStats();
drawCarPreviews();
setupMenuHandlers();
updateCarSelectionUI();
updateUI();
