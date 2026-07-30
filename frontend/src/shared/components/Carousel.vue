<template>
  <!-- 图片轮播：自动播放 + 触摸滑动 + 小圆点 -->
  <div
    class="box-container card"
    style="padding: 0; overflow: hidden"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="box" ref="boxRef">
      <div class="box-img" v-for="(img, index) in images" :key="index">
        <img :src="img.src" :alt="img.alt" class="photo" loading="lazy" />
      </div>
    </div>
  </div>

  <div class="box-controls">
    <div
      v-for="(img, index) in images"
      :key="index"
      class="control-dot"
      :class="{ active: index === currentIndex }"
      @click="goToSlide(index)"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const images = [
  { src: 'https://n.sinaimg.cn/sinakd10112/636/w1920h1116/20200605/5aed-iurnkpq8959411.jpg', alt: 'logo' },
  { src: 'https://img.bizhikong.com/uploads/ss3/253/3249973560/3487682374.jpg', alt: 'logo2' },
  { src: 'https://ts3.tc.mm.bing.net/th/id/OIP-C.WcwIey7Pbb4nmX7O0q7LBwHaEo?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3', alt: 'logo3' },
  { src: 'https://ts1.tc.mm.bing.net/th/id/R-C.7569b2d83e7e794d97368efa6b07180e?rik=VtQm5CRxgVYybA&riu=http%3a%2f%2fn.sinaimg.cn%2fsinacn18%2f133%2fw640h1093%2f20180610%2f136d-hcufqif4164698.jpg&ehk=S95HQrOIHtnwlev1hvcdygSpd9FDtDYB0ply3VEyFNo%3d&risl=&pid=ImgRaw&r=0', alt: 'logo4' },
]

const boxRef = ref(null)
const currentIndex = ref(0)
let slideTimer = null

let touchStartX = 0, touchEndX = 0

function onTouchStart(e) { touchStartX = e.changedTouches[0].screenX }
function onTouchMove(e) { touchEndX = e.changedTouches[0].screenX }

function onTouchEnd() {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) currentIndex.value = (currentIndex.value + 1) % images.length
    else currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
    resetTimer()
  }
}

function goToSlide(index) { currentIndex.value = index; resetTimer() }

function updateCarousel() {
  if (boxRef.value) boxRef.value.style.transform = 'translateX(-' + currentIndex.value * 100 + '%)'
}
function nextSlide() { currentIndex.value = (currentIndex.value + 1) % images.length; updateCarousel() }
function startTimer() { slideTimer = setInterval(nextSlide, 4000) }
function resetTimer() { clearInterval(slideTimer); updateCarousel(); startTimer() }

onMounted(() => startTimer())
onUnmounted(() => clearInterval(slideTimer))
</script>

<style scoped>
.box-container {
  max-width: 700px;
  width: 90%;
  margin: 0 auto 10px auto;
  position: relative;
}

.box { display: flex; transition: transform 0.5s var(--ease-out); height: 200px; }

@media (max-width: 480px) {
  .box { height: 140px }
  .box-container { width: 98% }
}

.box-img { min-width: 100%; transition: opacity 0.3s ease; }
.photo { border-radius: var(--radius); object-fit: cover; width: 100%; height: 100%; }

.box-controls { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
.control-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background-color: var(--text-tertiary);
  cursor: pointer; transition: all 0.3s;
}
.control-dot.active { background-color: var(--accent); transform: scale(1.2); box-shadow: 0 0 6px var(--accent-glow); }

@media (max-width: 768px) {
  .box-container { width: 95%; }
}
</style>
