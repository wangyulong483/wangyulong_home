<template>
  <!-- 保卫安建大 — 飞机大战（升级版） -->
  <div class="container glass-card">
    <h1>保卫安建大</h1>

    <div class="controls">
      <div class="control-group">
        <strong>移动：</strong><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span>
        <strong> 射击：</strong><span class="key">J</span>（按住连发）
      </div>
    </div>

    <div class="game-container" ref="gameContainerRef">
      <canvas ref="canvasRef" id="gameCanvas" width="800" height="600"
        @touchstart="onCanvasTouchStart" @touchmove="onCanvasTouchMove" @touchend="onCanvasTouchEnd"></canvas>

      <!-- 开始界面 -->
      <div v-if="screen === 'start'" class="screen">
        <h2 style="color: #ffeb3b; margin-bottom: 24px">保卫安建大</h2>
        <p style="margin: 8px 0; font-size: 17px; color: #ccc">躲避敌机，消灭它们！</p>
        <button class="button" @click="startGame">开始游戏</button>
        <div style="margin-top: 20px; color: #999; font-size: 14px">
          <p>WASD 移动 · J 射击（按住连发）</p>
        </div>
      </div>

      <!-- 结束界面 -->
      <div v-if="screen === 'over'" class="screen">
        <h2 style="color: #ff6b6b">游戏结束</h2>
        <p style="font-size: 26px; margin: 16px 0; color: #ffeb3b">得分: {{ score }}</p>
        <p style="color: #aaa">击落: {{ enemiesDestroyed }} 架 · 最高连击: {{ maxCombo }}×</p>
        <button class="button" @click="restartGame">重新开始</button>
      </div>

      <!-- 移动端摇杆 -->
      <div v-if="isMobile && screen === 'playing'" class="mobile-controls">
        <div class="direction-pad">
          <div class="dir-btn dir-up"    @touchstart.prevent="tc.up=true"    @touchend.prevent="tc.up=false">↑</div>
          <div class="dir-btn dir-left"  @touchstart.prevent="tc.left=true"  @touchend.prevent="tc.left=false">←</div>
          <div class="dir-btn dir-down"  @touchstart.prevent="tc.down=true"  @touchend.prevent="tc.down=false">↓</div>
          <div class="dir-btn dir-right" @touchstart.prevent="tc.right=true" @touchend.prevent="tc.right=false">→</div>
        </div>
        <div class="shoot-btn" @touchstart.prevent="tc.shoot=true" @touchend.prevent="tc.shoot=false">射击</div>
      </div>
    </div>

    <!-- HUD 状态栏 -->
    <div class="stats">
      <div class="stat-item"><AppIcon icon="shield-03" size="16" /> {{ lives }} 条命</div>
      <div class="stat-item"><AppIcon icon="star" size="16" /> {{ score }}</div>
      <div class="stat-item" :class="{ combo: combo > 1 }"><AppIcon icon="fire" size="16" /> {{ combo }}×</div>
      <div class="stat-item"><AppIcon icon="skull" size="16" /> {{ enemiesDestroyed }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

// ==================== 常量 ====================
const W = 800, H = 600
const BULLET_MAX = 50, ENEMY_MAX = 20, PARTICLE_MAX = 150
const SHIP_SPEED = 5, BULL_SPEED = 10
const BIG = 0, SMALL = 1, FAST = 2, ZIGZAG = 3

const ASSETS = {
  bg:      { path: '/image/school.jpg',      w: W, h: H },
  player:  { path: '/image/long.png',         w: 48, h: 48 },
  bullet:  { path: '/image/bullet.png',       w: 8,  h: 15 },
  enemyB:  { path: '/image/airplane.png',     w: 48, h: 28 },
  enemyS:  { path: '/image/airplane.png',     w: 28, h: 28 },
}

// ==================== 响应式 ====================
const canvasRef = ref(null), gameContainerRef = ref(null)
const screen = ref('start')
const score = ref(0), lives = ref(3)
const enemiesDestroyed = ref(0), combo = ref(1), maxCombo = ref(1)
const isMobile = ref(false)
const tc = ref({ up:false, down:false, left:false, right:false, shoot:false })

// ==================== 内部状态 ====================
let ctx = null, animId = null, running = false, keys = {}, fc = 0
let lastSpawn = 0, spawnRate = 1000, lastCombo = 0
let shakeAmount = 0, shakeDecay = 0.85
const imgs = {}

// 对象池
const p = { x: W/2-24, y: H-80, w: 48, h: 48, alive: true, speed: SHIP_SPEED, iframe: 0 }
const bullets = Array.from({ length: BULLET_MAX }, () => ({ x:0, y:0, w:8, h:15, live:false, speed:BULL_SPEED }))
const enemies = Array.from({ length: ENEMY_MAX }, () => ({ x:0, y:0, w:0, h:0, live:false, hp:0, type:SMALL, speed:2, birth:0 }))
const particles = Array.from({ length: PARTICLE_MAX }, () => ({ x:0, y:0, vx:0, vy:0, life:0, maxLife:0, color:'', size:3 }))

// 星空背景
const stars = Array.from({ length: 80 }, () => ({ x: Math.random()*W, y: Math.random()*H, speed: 0.5+Math.random()*2, size: Math.random()*1.5+0.5, bright: Math.random() }))

// ==================== 加载图片 ====================
async function loadImgs() {
  await Promise.all(Object.entries(ASSETS).map(([k, a]) => new Promise(res => {
    const img = new Image()
    img.onload = () => { imgs[k] = img; res() }
    img.onerror = () => {
      const c = document.createElement('canvas'); c.width = a.w; c.height = a.h
      const cx = c.getContext('2d')
      cx.fillStyle = { player:'#4FC3F7', enemyB:'#F44336', enemyS:'#9C27B0', bullet:'#FFEB3B' }[k]||'#555'
      cx.fillRect(0,0,a.w,a.h)
      const fi = new Image(); fi.src = c.toDataURL(); imgs[k] = fi; res()
    }
    img.src = a.path
  })))
}

// ==================== 粒子系统 ====================
function burst(x, y, color, count = 12) {
  let spawned = 0
  for (const pt of particles) {
    if (pt.life <= 0) {
      const angle = (Math.PI * 2 * spawned) / count + (Math.random()-0.5)*0.6
      const speed = 1.5 + Math.random() * 4
      pt.x = x; pt.y = y
      pt.vx = Math.cos(angle) * speed; pt.vy = Math.sin(angle) * speed - 2
      pt.maxLife = 25 + Math.random() * 20; pt.life = pt.maxLife
      pt.color = color; pt.size = 2 + Math.random() * 4
      spawned++
      if (spawned >= count) break
    }
  }
}

function updateParticles() {
  for (const pt of particles) {
    if (pt.life <= 0) continue
    pt.x += pt.vx; pt.y += pt.vy
    pt.vy += 0.05 // gravity
    pt.life--
  }
}

function drawParticles() {
  for (const pt of particles) {
    if (pt.life <= 0) continue
    const alpha = pt.life / pt.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = pt.color
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ==================== 分数弹出 ====================
const popups = []
function spawnPopup(x, y, text, color = '#FFEB3B') {
  popups.push({ x, y, text, color, life: 40, maxLife: 40 })
}
function updatePopups() {
  for (let i = popups.length-1; i >= 0; i--) {
    popups[i].y -= 1.2; popups[i].life--
    if (popups[i].life <= 0) popups.splice(i,1)
  }
}
function drawPopups() {
  for (const pp of popups) {
    const alpha = pp.life / pp.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = pp.color; ctx.font = 'bold 16px "Microsoft YaHei"'
    ctx.textAlign = 'center'; ctx.fillText(pp.text, pp.x, pp.y)
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'start'
}

// ==================== 屏幕震动 ====================
function shake(intensity) {
  shakeAmount = Math.max(shakeAmount, intensity)
}
function getShakeOffset() {
  if (shakeAmount < 0.1) return { x:0, y:0 }
  const sx = (Math.random()-0.5) * shakeAmount * 2
  const sy = (Math.random()-0.5) * shakeAmount * 2
  shakeAmount *= shakeDecay
  return { x: sx, y: sy }
}

// ==================== 绘制 ====================
function drawBg() {
  // 星空视差
  ctx.fillStyle = '#0a0a1a'
  ctx.fillRect(0, 0, W, H)
  for (const s of stars) {
    const flicker = 0.5 + 0.5 * Math.sin(fc * 0.03 + s.bright * 10)
    ctx.fillStyle = `rgba(255,255,255,${(0.3+flicker*0.7).toFixed(2)})`
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill()
    s.y += s.speed
    if (s.y > H) { s.y = -2; s.x = Math.random()*W }
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 13px "Microsoft YaHei"'
  ctx.fillText(`HP: ${lives.value}`, 12, 22)
  ctx.fillText(`SCORE: ${score.value}`, 12, 44)
  if (combo.value > 1) {
    ctx.fillStyle = combo.value >= 5 ? '#FF6B6B' : '#FFEB3B'
    ctx.font = 'bold 15px "Microsoft YaHei"'
    ctx.fillText(`COMBO x${combo.value}`, 12, 68)
  }
}

function drawGame() {
  if (!ctx) return

  // 震动偏移
  const so = getShakeOffset()
  ctx.save()
  ctx.translate(so.x, so.y)

  drawBg()

  // 玩家（受伤闪烁）
  if (p.alive && (p.iframe === 0 || fc % 6 < 3)) {
    const pi = imgs.player || imgs.player
    if (pi) ctx.drawImage(pi, p.x, p.y, p.w, p.h)
  }

  // 子弹 + 发光拖尾
  for (const b of bullets) {
    if (!b.live) continue
    const bi = imgs.bullet
    if (bi) {
      ctx.shadowColor = '#FFEB3B'; ctx.shadowBlur = 8
      ctx.drawImage(bi, b.x, b.y, b.w, b.h)
      ctx.shadowBlur = 0
    }
  }

  // 敌机
  for (const e of enemies) {
    if (!e.live) continue
    const ei = e.type === SMALL || e.type === FAST || e.type === ZIGZAG ? imgs.enemyS : imgs.enemyB
    if (ei) ctx.drawImage(ei, e.x, e.y, e.w, e.h)
    // 大型机血条
    if (e.type === BIG && e.hp < 3) {
      const bw=28, bh=4, bx=e.x+(e.w-bw)/2, by=e.y-8
      ctx.fillStyle='#555'; ctx.fillRect(bx,by,bw,bh)
      ctx.fillStyle=e.hp>1?'#4CAF50':'#FF9800'; ctx.fillRect(bx,by,bw*e.hp/3,bh)
    }
  }

  // 粒子
  drawParticles()
  // 分数弹出
  drawPopups()

  ctx.restore()
  // HUD（不受震动影响）
  drawHUD()
}

// ==================== 游戏逻辑 ====================
function fireBullet() {
  for (const b of bullets) {
    if (!b.live) { b.x=p.x+p.w/2-b.w/2; b.y=p.y; b.live=true; return }
  }
}

function spawnEnemy() {
  for (const e of enemies) {
    if (e.live) continue
    e.x = Math.random()*(W-60); e.y = -40; e.live = true; e.birth = fc
    const roll = Math.random()
    if (roll < 0.15) { e.type=BIG; e.hp=3; e.w=ASSETS.enemyB.w; e.h=ASSETS.enemyB.h; e.speed=1.5 }
    else if (roll < 0.35) { e.type=FAST; e.hp=1; e.w=ASSETS.enemyS.w; e.h=ASSETS.enemyS.h; e.speed=4.5 }
    else if (roll < 0.55) { e.type=ZIGZAG; e.hp=2; e.w=ASSETS.enemyS.w; e.h=ASSETS.enemyS.h; e.speed=2.5 }
    else { e.type=SMALL; e.hp=1; e.w=ASSETS.enemyS.w; e.h=ASSETS.enemyS.h; e.speed=2+Math.random() }
    return
  }
}

function updateEnemies() {
  for (const e of enemies) {
    if (!e.live) continue
    e.y += e.speed
    // 之字形移动
    if (e.type === ZIGZAG) {
      e.x += Math.sin(fc * 0.08 + e.birth) * 3
    }
    if (e.y > H + 50) {
      e.live = false
      lives.value = Math.max(0, lives.value - 1)
      shake(6)
      burst(p.x, p.y, '#FF5252', 8)
      if (lives.value <= 0) { p.alive = false; gameOver() }
    }
  }
}

function checkHit() {
  for (const e of enemies) {
    if (!e.live) continue
    for (const b of bullets) {
      if (!b.live) continue
      if (b.x<e.x+e.w && b.x+b.w>e.x && b.y<e.y+e.h && b.y+b.h>e.y) {
        b.live = false; e.hp--
        if (e.hp <= 0) {
          e.live = false
          const pts = e.type===BIG?30:e.type===ZIGZAG?20:10
          // 连击
          if (fc - lastCombo < 90) { combo.value = Math.min(8, combo.value+1) }
          else { combo.value = 1 }
          lastCombo = fc
          if (combo.value > maxCombo.value) maxCombo.value = combo.value
          const bonus = Math.floor(pts * (1 + combo.value * 0.5))
          score.value += bonus
          enemiesDestroyed.value++
          shake(e.type===BIG?12:5)
          burst(e.x+e.w/2, e.y+e.h/2, e.type===BIG?'#FF9800':'#4FC3F7', e.type===BIG?20:10)
          spawnPopup(e.x+e.w/2, e.y, `+${bonus}`, combo.value>=5?'#FF6B6B':'#FFEB3B')

          // 15% 概率掉血包
          if (Math.random() < 0.15) {
            burst(e.x+e.w/2, e.y+e.h/2, '#4CAF50', 6)
            if (lives.value < 5) lives.value++
          }
        }
      }
    }
  }

  // 玩家 vs 敌机
  if (p.iframe > 0) { p.iframe-- }
  for (const e of enemies) {
    if (!e.live || !p.alive || p.iframe > 0) continue
    if (p.x<e.x+e.w && p.x+p.w>e.x && p.y<e.y+e.h && p.y+p.h>e.y) {
      e.live = false
      burst(e.x+e.w/2, e.y+e.h/2, '#FF5252', 15)
      shake(15)
      lives.value--
      p.iframe = 90 // 1.5秒无敌
      if (lives.value <= 0) { p.alive = false; gameOver() }
    }
  }
}

// ==================== 游戏循环 ====================
function loop(ts) {
  if (!running) return
  fc++

  // 玩家输入
  if (keys['KeyW']||keys['ArrowUp']||tc.value.up)       p.y -= p.speed
  if (keys['KeyS']||keys['ArrowDown']||tc.value.down)   p.y += p.speed
  if (keys['KeyA']||keys['ArrowLeft']||tc.value.left)   p.x -= p.speed
  if (keys['KeyD']||keys['ArrowRight']||tc.value.right) p.x += p.speed
  if ((keys['KeyJ'] || tc.value.shoot) && fc % 8 === 0) fireBullet()
  p.x = Math.max(0, Math.min(W-p.w, p.x))
  p.y = Math.max(0, Math.min(H-p.h, p.y))

  // 子弹移动
  for (const b of bullets) { if (b.live) { b.y-=b.speed; if (b.y<0) b.live=false } }

  // 生成敌机
  if (ts - lastSpawn > spawnRate) { spawnEnemy(); lastSpawn=ts; spawnRate=Math.max(250,1000-Math.floor(score.value/100)*40) }

  updateEnemies(); checkHit()
  updateParticles(); updatePopups()
  drawGame()

  animId = requestAnimationFrame(loop)
}

function gameOver() { running=false; cancelAnimationFrame(animId); screen.value='over' }

// ==================== 按钮 ====================
async function startGame() {
  screen.value='playing'; await loadImgs()
  score.value=0; lives.value=3; enemiesDestroyed.value=0; combo.value=1; maxCombo.value=1
  running=true; lastSpawn=0; spawnRate=1000; fc=0; shakeAmount=0
  p.x=W/2-p.w/2; p.y=H-p.h-30; p.alive=true; p.iframe=60
  for (const b of bullets) b.live=false
  for (const e of enemies) e.live=false
  for (const pt of particles) pt.life=0
  popups.length=0
  animId=requestAnimationFrame(loop)
}
function restartGame() { startGame() }

// ==================== 事件 ====================
function kd(e) { keys[e.code]=true }
function ku(e) { keys[e.code]=false }

let tsX=0, tsY=0, dragging=false
function onCanvasTouchStart(e) { e.preventDefault(); const t=e.touches[0]; tsX=t.clientX; tsY=t.clientY; dragging=true; const rect=canvasRef.value.getBoundingClientRect(); if(t.clientX-rect.left>W*2/3) fireBullet() }
function onCanvasTouchMove(e) { if(!dragging)return; e.preventDefault(); const t=e.touches[0]; p.x=Math.max(0,Math.min(W-p.w,p.x+(t.clientX-tsX)*0.5)); p.y=Math.max(0,Math.min(H-p.h,p.y+(t.clientY-tsY)*0.5)); tsX=t.clientX; tsY=t.clientY }
function onCanvasTouchEnd(e) { e.preventDefault(); dragging=false }

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  isMobile.value = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
})
onUnmounted(() => { running=false; cancelAnimationFrame(animId); window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku) })
</script>

<style scoped>
.container { text-align:center; padding:20px; margin:20px auto; max-width:900px }
h1 { color:#5a4fcf; text-shadow:1px 1px 3px rgba(0,0,0,0.2); font-size:2.2rem }
.controls { background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); padding:12px; border-radius:10px; margin:10px 0; border:1px solid rgba(255,255,255,0.2) }
.control-group { color:#5a4fcf; font-weight:bold; font-size:14px }
.key { display:inline-block; padding:3px 8px; margin:2px; background:#333; color:#fff; border:1px solid #666; border-radius:5px; font-weight:bold; font-size:13px }
.game-container { position:relative; margin:16px 0 }
canvas { border:3px solid #ffeb3b; border-radius:10px; background:#000; box-shadow:0 0 20px rgba(255,235,59,0.3); display:block; margin:0 auto }
.screen { position:absolute; top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:10px }
.button { background:linear-gradient(45deg,#ff6b6b,#ee5a24);border:none;color:#fff;padding:12px 30px;font-size:18px;border-radius:25px;cursor:pointer;margin:10px;transition:all 0.3s }
.button:hover { transform:scale(1.05);box-shadow:0 0 15px rgba(255,107,107,0.5) }
.stats { display:flex;justify-content:space-around;width:100%;margin:10px 0 }
.stat-item { background:rgba(255,255,255,0.25);backdrop-filter:blur(8px);padding:8px 16px;border-radius:8px;color:#5a4fcf;font-weight:bold;border:1px solid rgba(255,255,255,0.2);font-size:14px;transition:all 0.3s }
.stat-item.combo { background:rgba(255,235,59,0.3);border-color:rgba(255,235,59,0.5);transform:scale(1.1) }
.mobile-controls { position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;padding:0 20px;pointer-events:none;z-index:100 }
.direction-pad { width:120px;height:120px;background:rgba(255,255,255,0.2);border-radius:60px;position:relative;pointer-events:auto }
.dir-btn { position:absolute;width:30px;height:30px;background:rgba(255,255,255,0.7);border-radius:15px;text-align:center;line-height:30px;user-select:none }
.dir-up{top:10px;left:45px}.dir-left{top:45px;left:10px}.dir-down{top:80px;left:45px}.dir-right{top:45px;left:80px}
.shoot-btn { width:80px;height:80px;background:rgba(255,50,50,0.7);border-radius:40px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16px;pointer-events:auto;user-select:none }
@media(max-width:768px){
  h1{font-size:1.5rem}
  .container{padding:12px;margin:8px}
  .controls{font-size:12px;padding:10px}
  .stats{gap:4px}
  .stat-item{padding:6px 10px;font-size:12px}
  canvas{width:100%;height:auto}
}
@media(max-width:480px){
  h1{font-size:1.3rem}
  .container{padding:8px;margin:4px}
  .key{padding:2px 5px;font-size:11px}
  .control-group{font-size:12px}
}
</style>
