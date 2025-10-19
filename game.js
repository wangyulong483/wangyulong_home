// 游戏常量
const WIDTH = 800;
const HEIGHT = 600;
const BULLET_NUM = 30;
const SHIP_SPEED = 5;
const BULL_SPEED = 8;
const ENEMY_NUM = 8;
const ENEMY_SPEED = 1;
const BIG = 0;
const SMALL = 1;

// ================================
// 在这里配置你的素材路径和尺寸
// ================================
const GAME_ASSETS = {
    // 背景图片配置
    background: {
        path: './images/school.jpg',  // 你的背景图片路径
        width: WIDTH,
        height: HEIGHT
    },
    // 玩家飞机配置
    player: {
        path: './images/long.png',      // 你的玩家飞机图片路径
        width: 50,                        // 你的飞机图片宽度
        height: 50                        // 你的飞机图片高度
    },
    // 子弹配置
    bullet: {
        path: './images/bullet.png',      // 你的子弹图片路径
        width: 8,                         // 你的子弹图片宽度
        height: 15                        // 你的子弹图片高度
    },
    // 大敌机配置
    enemyBig: {
        path: './images/airplane.png',   // 你的大敌机图片路径
        width: 50,                        // 大敌机图片宽度
        height: 30                        // 大敌机图片高度
    },
    // 小敌机配置
    enemySmall: {
        path: './images/airplane.png', // 你的小敌机图片路径
        width: 30,                        // 小敌机图片宽度
        height: 30                        // 小敌机图片高度
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
    lastTime: 0
};

// 玩家飞机 - 使用配置的尺寸
const Myplane = {
    x: WIDTH / 2 - GAME_ASSETS.player.width / 2,
    y: HEIGHT - GAME_ASSETS.player.height - 30,
    width: GAME_ASSETS.player.width,
    height: GAME_ASSETS.player.height,
    live: true,
    speed: SHIP_SPEED
};

// 子弹数组 - 使用配置的尺寸
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

// 获取Canvas上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 图片加载管理
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
                // 如果图片加载失败，使用备用图形
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
        
        // 使用配置的尺寸
        const asset = GAME_ASSETS[name];
        canvas.width = asset.width;
        canvas.height = asset.height;
        
        // 创建彩色备用图形以便区分
        if (name === 'player') {
            ctx.fillStyle = '#4FC3F7';
            ctx.fillRect(0, 0, asset.width, asset.height);
            ctx.fillStyle = '#0288D1';
            ctx.font = '12px Arial';
            ctx.fillText('玩家', 5, asset.height / 2);
        } else if (name === 'enemyBig') {
            ctx.fillStyle = '#F44336';
            ctx.fillRect(0, 0, asset.width, asset.height);
            ctx.fillStyle = '#B71C1C';
            ctx.font = '10px Arial';
            ctx.fillText('大敌机', 5, asset.height / 2);
        } else if (name === 'enemySmall') {
            ctx.fillStyle = '#9C27B0';
            ctx.fillRect(0, 0, asset.width, asset.height);
            ctx.fillStyle = '#4A148C';
            ctx.font = '10px Arial';
            ctx.fillText('小敌机', 5, asset.height / 2);
        } else if (name === 'bullet') {
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(0, 0, asset.width, asset.height);
        } else {
            ctx.fillStyle = '#0A0A2A';
            ctx.fillRect(0, 0, asset.width, asset.height);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText('背景', asset.width / 2 - 20, asset.height / 2);
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

// 创建全局图片管理器
const imageManager = new ImageManager();

// 绘制函数
function drawGame() {
    if (!imageManager.loaded) {
        drawLoadingScreen();
        return;
    }
    
    // 绘制背景
    ctx.drawImage(imageManager.get('background'), 0, 0, WIDTH, HEIGHT);
    
    // 绘制玩家飞机
    if (Myplane.live) {
        ctx.drawImage(imageManager.get('player'), Myplane.x, Myplane.y, Myplane.width, Myplane.height);
    }
    
    // 绘制子弹
    Bullets.forEach(bullet => {
        if (bullet.live) {
            ctx.drawImage(imageManager.get('bullet'), bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });
    
    // 绘制敌机
    Enemies.forEach(enemy => {
        if (enemy.live) {
            const enemyImage = enemy.type === BIG ? imageManager.get('enemyBig') : imageManager.get('enemySmall');
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制血条（大敌机）
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
}

function drawLoadingScreen() {
    ctx.fillStyle = '#0A0A2A';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('加载游戏素材中...', WIDTH / 2, HEIGHT / 2 - 30);
    
    // 绘制加载进度条
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

function createBullet() {
    for (let i = 0; i < BULLET_NUM; i++) {
        if (!Bullets[i].live) {
            // 子弹从飞机中心射出
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
            
            // 随机决定敌机类型
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
    // 子弹与敌机碰撞
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
    
    // 玩家与敌机碰撞
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

function updatePlayer() {
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
    
    // 边界检查
    Myplane.x = Math.max(0, Math.min(WIDTH - Myplane.width, Myplane.x));
    Myplane.y = Math.max(0, Math.min(HEIGHT - Myplane.height, Myplane.y));
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
    
    // 加载图片
    await imageManager.loadAll();
    
    // 重置游戏状态
    gameState = {
        score: 0,
        health: 100,
        enemiesDestroyed: 0,
        gameRunning: true,
        lastEnemySpawn: 0,
        enemySpawnRate: 1000,
        lastTime: 0
    };
    
    // 重置玩家位置
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
}

function restartGame() {
    startGame();
}

// 事件监听
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 触摸控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    if (x > canvas.width * 2/3) {
        createBullet();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    Myplane.x = Math.max(0, Math.min(WIDTH - Myplane.width, Myplane.x + deltaX));
    Myplane.y = Math.max(0, Math.min(HEIGHT - Myplane.height, Myplane.y + deltaY));
    
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

// 初始化
updateStats();