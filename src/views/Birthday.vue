<template>
  <!--
    生日庆祝页面 — 液态玻璃容器
    包含月亮动画、蛋糕、气球、彩纸效果
  -->
  <div class="container liquid-glass">
    <!-- 头部 -->
    <div class="header">
      <h1>邵远熙，生日快乐！</h1>
      <div class="subtitle">在这个特别的日子里，送上最真挚的祝福</div>
      <div class="birthday-info">农历八月廿七 · 愿你如明月般圆满美好</div>
    </div>

    <!-- 月亮动画 -->
    <div class="moon-container">
      <div class="moon">
        <div class="moon-crater crater1"></div>
        <div class="moon-crater crater2"></div>
        <div class="moon-crater crater3"></div>
      </div>
    </div>

    <!-- 祝福语 -->
    <div class="message">
      <p>亲爱的邵远熙：</p>
      <p>在这个特别的日子里，愿你的生活如圆满的明月一样圆满美好！农历八月廿七，一个充满温馨与喜悦的日子，愿所有的幸福、快乐和美好都围绕在你身边。</p>
      <p>愿新的一岁里，你的每一个梦想都能实现，每一天都充满阳光和欢笑！</p>
    </div>

    <!-- 蛋糕 CSS 绘画 -->
    <div class="cake">
      <div class="cake-base"></div>
      <div class="cake-top"></div>
      <div class="candle"></div>
      <div class="flame"></div>
    </div>

    <!-- 气球 -->
    <div class="balloons">
      <div class="balloon balloon1"></div>
      <div class="balloon balloon2"></div>
      <div class="balloon balloon3"></div>
      <div class="balloon balloon4"></div>
    </div>

    <!-- 祝福输入 — 玻璃卡片 -->
    <div class="wishes glass-card">
      <h2>送上你的祝福</h2>
      <textarea
        v-model="wishText"
        class="wish-input"
        placeholder="在这里写下你对未来的和现在的邵远熙的祝福..."
      ></textarea>
      <button class="btn" @click="sendWish">发送祝福</button>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>祝邵远熙生日快乐！愿你的每一天都充满阳光和欢笑！</p>
      <p>特别为你制作的生日祝福网页</p>
    </div>

    <!-- 背景音乐 -->
    <audio ref="musicRef" loop>
      <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const wishText = ref('')
const musicRef = ref(null)
let confettiTimer = null

function sendWish() {
  if (wishText.value.trim() !== '') {
    alert('祝福已发送！邵远熙会收到你的心意！')
    wishText.value = ''
  } else {
    alert('请先写下你的祝福！')
  }
}

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffbe0b', '#fb5607']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.style.cssText = `
      position: fixed;
      width: 10px; height: 10px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      opacity: 0.7;
      top: -10px;
      left: ${Math.random() * 100}vw;
      animation: confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 5}s infinite;
      pointer-events: none;
      z-index: 999;
    `
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 7000)
  }
}

function playMusic() {
  musicRef.value?.play().catch(() => {})
}

onMounted(() => {
  createConfetti()
  confettiTimer = setInterval(createConfetti, 3000)
  document.addEventListener('click', playMusic, { once: true })
})

onUnmounted(() => {
  clearInterval(confettiTimer)
  document.removeEventListener('click', playMusic)
})
</script>

<style>
/* 彩纸飘落动画 — 全局生效（因为纸屑是动态添加到 body 的） */
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>

<style scoped>
/* -------- 容器（全局 liquid-glass + 局部增强） -------- */
.container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 30px 20px;
}

/* -------- 确保内容在玻璃伪元素上方 -------- */
.header,
.message,
.moon-container,
.cake,
.balloons,
.wishes,
.footer {
  position: relative;
  z-index: 2;
}

.header {
  margin-bottom: 30px;
  text-align: center;
  padding: 20px 0;
}

h1 {
  color: #5a4fcf;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

.birthday-info {
  background: linear-gradient(45deg, #ffd89b, #19547b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 1.4rem;
  margin: 20px 0;
}

/* -------- 月亮 -------- */
.moon-container { width: 200px; height: 200px; margin: 20px auto; position: relative; }
.moon {
  width: 100%; height: 100%;
  background: radial-gradient(circle at 30% 30%, #fff9c4, #ffd54f);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
  position: relative;
  animation: float 3s ease-in-out infinite;
}
.moon-crater { position: absolute; background: rgba(0, 0, 0, 0.1); border-radius: 50%; }
.crater1 { width: 30px; height: 30px; top: 40px; left: 50px; }
.crater2 { width: 20px; height: 20px; top: 80px; left: 120px; }
.crater3 { width: 25px; height: 25px; top: 130px; left: 70px; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* -------- 祝福语 -------- */
.message {
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 30px 0;
  padding: 0 20px;
  text-align: left;
}

/* -------- 蛋糕 -------- */
.cake { width: 200px; height: 100px; margin: 30px auto; position: relative; }
.cake-base {
  width: 180px; height: 60px;
  background: linear-gradient(to bottom, #8b4513, #a0522d);
  border-radius: 10px 10px 0 0;
  position: absolute; bottom: 0; left: 10px;
}
.cake-top {
  width: 200px; height: 40px;
  background: linear-gradient(to bottom, #ffb6c1, #ff69b4);
  border-radius: 50% 50% 0 0;
  position: absolute; top: 0;
}
.candle {
  width: 10px; height: 40px;
  background: #4a90e2;
  position: absolute; top: -40px; left: 95px;
  border-radius: 5px 5px 0 0;
}
.flame {
  width: 15px; height: 25px;
  background: radial-gradient(ellipse at center, #ffd700, #ff4500);
  border-radius: 50% 50% 20% 20%;
  position: absolute; top: -25px; left: 92.5px;
  animation: flicker 1.5s infinite alternate;
}

@keyframes flicker {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* -------- 气球 -------- */
.balloons { display: flex; justify-content: center; margin: 30px 0; }
.balloon {
  width: 50px; height: 60px;
  border-radius: 50%;
  margin: 0 10px;
  position: relative;
  animation: float-balloon 5s ease-in-out infinite;
}
.balloon:before {
  content: '';
  width: 2px; height: 60px;
  background: rgba(0, 0, 0, 0.2);
  position: absolute; bottom: -60px; left: 50%;
  transform: translateX(-50%);
}
.balloon1 { background: #ff5252; animation-delay: 0s; }
.balloon2 { background: #4caf50; animation-delay: 0.5s; }
.balloon3 { background: #2196f3; animation-delay: 1s; }
.balloon4 { background: #ffc107; animation-delay: 1.5s; }

@keyframes float-balloon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* -------- 祝福区域 -------- */
.wishes {
  background: rgba(255, 249, 196, 0.35);
  padding: 24px;
  margin: 20px 0;
  text-align: center;
}

.wishes h2 {
  color: #5a4fcf;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.wish-input {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(90, 79, 207, 0.25);
  border-radius: 10px;
  font-size: 1rem;
  margin: 10px 0;
  resize: vertical;
  min-height: 80px;
  background: rgba(255, 255, 255, 0.5);
  outline: none;
  transition: border-color 0.3s;
  position: relative;
  z-index: 2;
}

.wish-input:focus {
  border-color: #5a4fcf;
  background: rgba(255, 255, 255, 0.8);
}

.btn {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  padding: 12px 28px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  position: relative;
  z-index: 2;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
}

/* -------- 页脚 -------- */
.footer {
  margin-top: 30px;
  color: #666;
  font-size: 0.9rem;
}

/* -------- 响应式 -------- */
@media (max-width: 600px) {
  h1 { font-size: 2rem; }
  .moon-container { width: 150px; height: 150px; }
  .cake { width: 150px; }
  .cake-base { width: 130px; }
  .cake-top { width: 150px; }
  .candle { left: 70px; }
  .flame { left: 67.5px; }
}
</style>
