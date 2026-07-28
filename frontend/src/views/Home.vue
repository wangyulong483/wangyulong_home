<template>
  <!--
    首页
    视频 position:fixed z-index:-1 全屏背景
    内容从下方滚动，实体背景覆盖视频
    参考：CSS-Tricks "One Viewport Header, Content Scrolls Over Header"
  -->
  <div class="home-page">
    <!-- ====== 固定视频背景（z-index: -1，body 透明时透出） ====== -->
    <video
      ref="videoRef"
      class="video-bg"
      src="/video/试试_6.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/video/hero-poster.webp"
    ></video>

    <!-- ====== 第一屏：hero 文字（100vh，背景透明） ====== -->
    <section class="hero-screen">
      <div class="hero-overlay">
        <p class="hero-saying">
          谁终将声震人间，必长久深自缄默<br />
          谁终将点燃闪电，必长久如云漂泊
        </p>
        <p class="hero-author">—— 尼采</p>

        <div class="scroll-hint">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- ====== 第二屏：内容区（实体背景覆盖视频） ====== -->
    <section class="content-screen">
      <div class="content-card card">
        <h3>关于 MY_WEBSITE</h3>
        <ul>
          <li>它记录我的学习，它见证我的成长</li>
          <li>它记录现在的我的无知与浅薄，让未来的我嘲笑自己的狂妄</li>
          <li>也许未来它会用到别的地方</li>
          <li>......</li>
        </ul>
      </div>

      <div class="content-card card">
        <h3>学习平台</h3>
        <ul class="platform-list">
          <li><a href="https://www.bilibili.com/" target="_blank" class="platform-link" rel="noopener">哔哩哔哩</a></li>
          <li><a href="https://www.csdn.net/" target="_blank" class="platform-link" rel="noopener">CSDN</a></li>
          <li><a href="https://www.runoob.com/" target="_blank" class="platform-link" rel="noopener">菜鸟教程</a></li>
          <li><a href="https://fishros.org.cn/" target="_blank" class="platform-link" rel="noopener">鱼香 ROS</a></li>
          <li><a href="https://forum.d-robotics.cc/" target="_blank" class="platform-link" rel="noopener">地瓜机器人社区</a></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { heroVisible } from '@/composables/useHeroScroll.js'

const videoRef = ref(null)
let bodyBg = ''

// 内容区顶部进入视口 → heroVisible = false → 侧边栏出现
function onScroll() {
  const el = document.querySelector('.content-screen')
  if (!el) return
  heroVisible.value = el.getBoundingClientRect().top > 80
}

function shouldPlay() {
  if (window.matchMedia('(max-width: 768px)').matches) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const conn = navigator.connection || {}
  if (conn.saveData) return false
  if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return false
  return true
}

function onVisibility() {
  const v = videoRef.value
  if (!v) return
  document.hidden ? v.pause() : (shouldPlay() && v.play().catch(() => {}))
}

onMounted(() => {
  heroVisible.value = true
  // 首页 body 背景透明，让 video 透出
  bodyBg = document.body.style.background || ''
  document.body.style.background = 'transparent'
  window.addEventListener('scroll', onScroll, { passive: true })

  if (!shouldPlay()) { videoRef.value?.remove(); return }
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  heroVisible.value = false
  document.body.style.background = bodyBg
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
/* ====== 固定视频背景 ====== */
.video-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
  display: block;
}

/* ====== 第一屏：hero 透视区（100vh，透明） ====== */
.hero-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-overlay {
  text-align: center;
  padding: 20px;
}

.hero-saying {
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(1.15rem, 2.5vw, 1.7rem);
  font-weight: 500;
  line-height: 1.8;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  margin: 0;
  font-style: italic;
}

.hero-author {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85rem;
  margin-top: 14px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.35);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.35; }
  50%      { transform: translateX(-50%) translateY(8px); opacity: 0.7; }
}

/* ====== 第二屏：内容区（实体背景，覆盖视频） ====== */
.content-screen {
  background: var(--bg-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 80px 20px;
}

.content-card {
  max-width: 640px;
  width: 100%;
}

.content-card h3 {
  color: var(--accent);
  margin-bottom: 12px;
  font-size: 1.15rem;
  font-weight: 600;
}

.content-card ul { padding-left: 20px; }
.content-card li { margin: 8px 0; color: var(--text-secondary); }

.platform-list { list-style: none; padding-left: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.platform-link {
  display: inline-flex; align-items: center;
  padding: 8px 18px; background: var(--accent-muted);
  border: 1px solid rgba(108, 92, 231, 0.15);
  border-radius: 20px; color: var(--accent);
  font-size: 0.85rem; font-weight: 500;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  transition: all 0.25s var(--ease-out);
}
.platform-link:hover {
  background: rgba(108, 92, 231, 0.18);
  border-color: var(--border-hover);
  transform: translateY(-2px); color: var(--accent);
}

/* ====== 亮色主题 ====== */
[data-theme="light"] .hero-saying { color: rgba(30,30,30,0.9); text-shadow: 0 2px 8px rgba(255,255,255,0.3); }
[data-theme="light"] .hero-author { color: rgba(50,50,50,0.5); }
[data-theme="light"] .scroll-hint { color: rgba(50,50,50,0.35); }

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .hero-screen {
    height: 100svh;
    background: url('/video/hero-poster.webp') center / cover no-repeat, #0A0A0F;
  }
  .video-bg { display: none; }
  .hero-saying { font-size: 1rem; line-height: 1.7; }
  .hero-author { font-size: 0.8rem; margin-top: 10px; }

  .content-screen {
    min-height: 100svh;
    padding: 40px 16px;
  }
  .content-card { margin: 0; padding: 18px 20px; }
  .content-card h3 { font-size: 1.05rem; }
  .platform-link { padding: 8px 16px; font-size: 0.82rem; min-height: 44px; }
}

@media (max-width: 480px) {
  .hero-saying { font-size: 0.9rem; padding: 0 12px; }
  .scroll-hint { bottom: 16px; }
  .content-card { padding: 14px 16px; }
  .content-card li { font-size: 0.9rem; margin: 6px 0; }
  .platform-link { padding: 6px 14px; font-size: 0.8rem; }
}
</style>
