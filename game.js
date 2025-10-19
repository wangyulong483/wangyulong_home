// 游戏常量
const WIDTH = 800;
const HEIGHT = 600;
const BULLET_NUM = 30;
const SHIP_SPEED = 5;
const BULL_SPEED = 8;
const ENEMY_NUM = 8;
const ENEMY_SPEED = 2;
const BIG = 0;
const SMALL = 1;

// 游戏素材配置
const GAME_ASSETS = {
    background: {
        path: './image/school.jpg',
        width: WIDTH,
        height: HEIGHT
    },
    player: {
        path: './image/long.png',
        width: 50,
        height: 50
    },
    bullet: {
        path: './image/bullet.png',
        width: 8,
        height: 15
    },
    enemyBig: {
        path: './image/airplane.png',
        width: 50,
        height: 30
    },
    enemySmall: {
        path: './image/airplane.png',
        width: 30,
        height: 30
    }
};

// 游戏状态
let gameState = {
    score: 0,
    health: 100,
    enemiesDestroyed: 0,
    gameRunning: false,
    lastEnemySpawn: 0,
    enemySpawnRate: 1000,
    lastTime: 0,
    isMobile: false
};

// 玩家飞机
const Myplane = {
    x: WIDTH / 2 - GAME_ASSETS.player.width / 2,
    y: HEIGHT - GAME_ASSETS.player.height - 30,
    width: GAME_ASSETS.player.width,
    height: GAME_ASSETS.player.height,
    live: true,
    speed: SHIP_SPEED
};

// 子弹数组
const Bullets = [];
for (let i = 0; i < BULLET_NUM; i++) {
    Bullets.push({
        x: 0,
        y: 0,
        width: GAME_ASSETS.bullet.width,
        height: GAME_ASSETS.bullet.height,
        live: false,
        speed: BULL_SPEED
    });
}

// 敌机数组
const Enemies = [];
for (let i = 0; i < ENEMY_NUM; i++) {
    Enemies.push({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        live: false,
        hp: 0,
        type: SMALL,
        speed: ENEMY_SPEED
    });
}

// 键盘状态
const keys = {};

// 触摸控制状态
const touchControls = {
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
    touchId: null
};

// 获取Canvas上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 检测是否为移动设备
function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 创建虚拟摇杆和按钮
function createMobileControls() {
    gameState.isMobile = detectMobile();
    if (!gameState.isMobile) return;
    
    const controlsHTML = `
        <div id="mobileControls" style="
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            pointer-events: none;
            z-index: 100;
        ">
            <!-- 左侧方向控制 -->
            <div id="directionPad" style="
                width: 120px;
                height: 120px;
                background: rgba(255,255,255,0.2);
                border-radius: 60px;
                position: relative;
                pointer-events: auto;
            ">
                <div class="direction-btn" data-dir="up" style="
                    position: absolute;
                    top: 10px;
                    left: 45px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 15px;
                    text-align: center;
                    line-height: 30px;
                ">↑</div>
                <div class="direction-btn" data-dir="left" style="
                    position: absolute;
                    top: 45px;
                    left: 10px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 15px;
                    text-align: center;
                    line-height: 30px;
                ">←</div>
                <div class="direction-btn" data-dir="down" style="
                    position: absolute;
                    top: 80px;
                    left: 45px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 15px;
                    text-align: center;
                    line-height: 30px;
                ">↓</div>
                <div class="direction-btn" data-dir="right" style="
                    position: absolute;
                    top: 45px;
                    left: 80px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 15px;
                    text-align: center;
                    line-height: 30px;
                ">→</div>
            </div>
            
            <!-- 右侧射击按钮 -->
            <div id="shootButton" style="
                width: 80px;
                height: 80px;
                background: rgba(255,50,50,0.7);
                border-radius: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                pointer-events: auto;
            ">射击</div>
        </div>
        
        <!-- 移动设备提示 -->
        <div id="mobileTips" style="
            position: absolute;
            top: 10px;
            left: 0;
            right: 0;
            text-align: center;
            color: #FFEB3B;
            font-size: 14px;
            pointer-events: none;
        ">使用虚拟摇杆移动，点击右侧按钮射击</div>
    `;
    
    document.querySelector('.game-container').insertAdjacentHTML('beforeend', controlsHTML);
    
    // 绑定触摸事件
    setupTouchControls();
}

// 设置触摸控制
function setupTouchControls() {
    // 方向按钮事件
    document.querySelectorAll('.direction-btn').forEach(btn => {
        const direction = btn.getAttribute('data-dir');
        
        // 触摸开始
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchControls[direction] = true;
            btn.style.background = 'rgba(255,255,255,0.9)';
        });
        
        // 触摸结束
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchControls[direction] = false;
            btn.style.background = 'rgba(255,255,255,0.7)';
        });
        
        // 防止默认行为
        btn.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
    });
    
    // 射击按钮事件
    const shootBtn = document.getElementById('shootButton');
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.shoot = true;
        shootBtn.style.background = 'rgba(255,50,50,0.9)';
        createBullet();
    });
    
    shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.shoot = false;
        shootBtn.style.background = 'rgba(255,50,50,0.7)';
    });
    
    shootBtn.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    
    // 全屏触摸控制（可选）
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = true;
        
        // 如果点击在右侧1/3区域，则发射子弹
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        if (x > canvas.width * 2/3 && !touchControls.shoot) {
            createBullet();
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // 平滑移动
        Myplane.x = Math.max(0, Math.min(WIDTH - Myplane.width, Myplane.x + deltaX * 0.5));
        Myplane.y = Math.max(0, Math.min(HEIGHT - Myplane.height, Myplane.y + deltaY * 0.5));
        
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDragging = false;
    });
}

// 更新玩家移动（同时支持键盘和触摸）
function updatePlayer() {
    // 键盘控制
    if (keys['KeyW'] || keys['ArrowUp']) {
        Myplane.y -= Myplane.speed;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        Myplane.y += Myplane.speed;
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        Myplane.x -= Myplane.speed;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        Myplane.x += Myplane.speed;
    }
    if (keys['KeyJ']) {
        createBullet();
        keys['KeyJ'] = false;
    }
    
    // 触摸控制
    if (gameState.isMobile) {
        if (touchControls.up) Myplane.y -= Myplane.speed;
        if (touchControls.down) Myplane.y += Myplane.speed;
        if (touchControls.left) Myplane.x -= Myplane.speed;
        if (touchControls.right) Myplane.x += Myplane.speed;
        if (touchControls.shoot) {
            // 自动射击（每10帧发射一次）
            if (gameState.frameCount % 10 === 0) {
                createBullet();
            }
        }
    }
    
    // 边界检查
    Myplane.x = Math.max(0, Math.min(WIDTH - Myplane.width, Myplane.x));
    Myplane.y = Math.max(0, Math.min(HEIGHT - Myplane.height, Myplane.y));
}

// 图片加载管理（保持不变）
class ImageManager {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadProgress = 0;
        this.totalImages = Object.keys(GAME_ASSETS).length;
    }

    async loadAll() {
        const loadPromises = [];
        
        for (const [name, asset] of Object.entries(GAME_ASSETS)) {
            loadPromises.push(this.loadImage(name, asset.path));
        }
        
        await Promise.all(loadPromises);
        this.loaded = true;
        console.log('所有图片加载完成');
    }

    loadImage(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loadProgress++;
                console.log(`加载完成: ${name}`);
                resolve();
            };
            img.onerror = () => {
                console.error(`图片加载失败: ${path}`);
                this.createFallbackImage(name);
                this.loadProgress++;
                resolve();
            };
            img.src = path;
        });
    }

    createFallbackImage(name) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const asset = GAME_ASSETS[name];
        canvas.width = asset.width;
        canvas.height = asset.height;
        
        if (name === 'player') {
            ctx.fillStyle = '#4FC3F7';
            ctx.fillRect(0, 0, asset.width, asset.height);
        } else if (name === 'enemyBig') {
            ctx.fillStyle = '#F44336';
            ctx.fillRect(0, 0, asset.width, asset.height);
        } else if (name === 'enemySmall') {
            ctx.fillStyle = '#9C27B0';
            ctx.fillRect(0, 0, asset.width, asset.height);
        } else if (name === 'bullet') {
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(0, 0, asset.width, asset.height);
        } else {
            ctx.fillStyle = '#0A0A2A';
            ctx.fillRect(0, 0, asset.width, asset.height);
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        this.images[name] = img;
    }

    get(name) {
        return this.images[name];
    }

    getLoadProgress() {
        return (this.loadProgress / this.totalImages) * 100;
    }
}

const imageManager = new ImageManager();

// 绘制游戏（保持不变）
function drawGame() {
    if (!imageManager.loaded) {
        drawLoadingScreen();
        return;
    }
    
    ctx.drawImage(imageManager.get('background'), 0, 0, WIDTH, HEIGHT);
    
    if (Myplane.live) {
        ctx.drawImage(imageManager.get('player'), Myplane.x, Myplane.y, Myplane.width, Myplane.height);
    }
    
    Bullets.forEach(bullet => {
        if (bullet.live) {
            ctx.drawImage(imageManager.get('bullet'), bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
    
    Enemies.forEach(enemy => {
        if (enemy.live) {
            const enemyImage = enemy.type === BIG ? imageManager.get('enemyBig') : imageManager.get('enemySmall');
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            
            if (enemy.type === BIG && enemy.hp < 3) {
                drawHealthBar(enemy);
            }
        }
    });
    
    drawHUD();
}

function drawHealthBar(enemy) {
    const barWidth = 30;
    const barHeight = 4;
    const barX = enemy.x + (enemy.width - barWidth) / 2;
    const barY = enemy.y - 8;
    
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = enemy.hp > 1 ? '#4CAF50' : '#FF9800';
    ctx.fillRect(barX, barY, (barWidth * enemy.hp) / 3, barHeight);
}

function drawHUD() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText(`得分: ${gameState.score}`, 10, 25);
    ctx.fillText(`生命值: ${gameState.health}`, 10, 50);
    ctx.fillText(`击落敌机: ${gameState.enemiesDestroyed}`, 10, 75);
    
    // 在手机上显示触摸提示
    if (gameState.isMobile) {
        ctx.fillStyle = 'rgba(255, 235, 59, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('移动: 左侧摇杆 | 射击: 右侧红色按钮', 10, HEIGHT - 10);
    }
}

function drawLoadingScreen() {
    ctx.fillStyle = '#0A0A2A';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('加载游戏素材中...', WIDTH / 2, HEIGHT / 2 - 30);
    
    const progressWidth = 300;
    const progressHeight = 20;
    const progressX = (WIDTH - progressWidth) / 2;
    const progressY = HEIGHT / 2 + 20;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    
    const progress = imageManager.getLoadProgress();
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(progressX, progressY, (progressWidth * progress) / 100, progressHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`${Math.round(progress)}%`, WIDTH / 2, progressY + 35);
}

// 其他游戏函数保持不变
function createBullet() {
    for (let i = 0; i < BULLET_NUM; i++) {
        if (!Bullets[i].live) {
            Bullets[i].x = Myplane.x + Myplane.width / 2 - Bullets[i].width / 2;
            Bullets[i].y = Myplane.y;
            Bullets[i].live = true;
            break;
        }
    }
}

function bulletMove() {
    Bullets.forEach(bullet => {
        if (bullet.live) {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) {
                bullet.live = false;
            }
        }
    });
}

function createEnemy() {
    for (let i = 0; i < ENEMY_NUM; i++) {
        if (!Enemies[i].live) {
            Enemies[i].x = Math.random() * (WIDTH - 60);
            Enemies[i].y = -50;
            Enemies[i].live = true;
            
            if (Math.random() < 0.3) {
                Enemies[i].type = BIG;
                Enemies[i].hp = 3;
                Enemies[i].width = GAME_ASSETS.enemyBig.width;
                Enemies[i].height = GAME_ASSETS.enemyBig.height;
            } else {
                Enemies[i].type = SMALL;
                Enemies[i].hp = 1;
                Enemies[i].width = GAME_ASSETS.enemySmall.width;
                Enemies[i].height = GAME_ASSETS.enemySmall.height;
            }
            break;
        }
    }
}

function enemyMove() {
    Enemies.forEach(enemy => {
        if (enemy.live) {
            enemy.y += enemy.speed;
            if (enemy.y > HEIGHT) {
                enemy.live = false;
                gameState.health -= 5;
                if (gameState.health < 0) gameState.health = 0;
                updateStats();
            }
        }
    });
}

function checkCollisions() {
    Enemies.forEach(enemy => {
        if (!enemy.live) return;
        
        Bullets.forEach(bullet => {
            if (!bullet.live) return;
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                bullet.live = false;
                enemy.hp--;
                
                if (enemy.hp <= 0) {
                    enemy.live = false;
                    gameState.score += enemy.type === BIG ? 30 : 10;
                    gameState.enemiesDestroyed++;
                    updateStats();
                }
            }
        });
    });
    
    Enemies.forEach(enemy => {
        if (!enemy.live) return;
        
        if (Myplane.x < enemy.x + enemy.width &&
            Myplane.x + Myplane.width > enemy.x &&
            Myplane.y < enemy.y + enemy.height &&
            Myplane.y + Myplane.height > enemy.y) {
            
            enemy.live = false;
            gameState.health -= enemy.type === BIG ? 20 : 10;
            updateStats();
            
            if (gameState.health <= 0) {
                Myplane.live = false;
                gameOver();
            }
        }
    });
}

function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('enemiesDestroyed').textContent = gameState.enemiesDestroyed;
}

function gameLoop(timestamp) {
    if (!gameState.gameRunning) return;
    
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    gameState.frameCount = (gameState.frameCount || 0) + 1;
    
    updatePlayer();
    bulletMove();
    
    if (timestamp - gameState.lastEnemySpawn > gameState.enemySpawnRate) {
        createEnemy();
        gameState.lastEnemySpawn = timestamp;
        gameState.enemySpawnRate = Math.max(300, 1000 - Math.floor(gameState.score / 100) * 50);
    }
    
    enemyMove();
    checkCollisions();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

async function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    
    // 初始化移动控制
    if (gameState.isMobile) {
        document.getElementById('mobileControls').style.display = 'flex';
        document.getElementById('mobileTips').style.display = 'block';
    }
    
    await imageManager.loadAll();
    
    gameState = {
        score: 0,
        health: 100,
        enemiesDestroyed: 0,
        gameRunning: true,
        lastEnemySpawn: 0,
        enemySpawnRate: 1000,
        lastTime: 0,
        isMobile: gameState.isMobile,
        frameCount: 0
    };
    
    Myplane.x = WIDTH / 2 - Myplane.width / 2;
    Myplane.y = HEIGHT - Myplane.height - 30;
    Myplane.live = true;
    
    Bullets.forEach(bullet => bullet.live = false);
    Enemies.forEach(enemy => enemy.live = false);
    
    updateStats();
    
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('finalScore').textContent = `最终得分: ${gameState.score}`;
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // 隐藏移动控制
    if (gameState.isMobile) {
        document.getElementById('mobileControls').style.display = 'none';
        document.getElementById('mobileTips').style.display = 'none';
    }
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    startGame();
}

// 事件监听
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 初始化
updateStats();
createMobileControls(); // 创建移动控制界面
