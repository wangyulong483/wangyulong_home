<template>
  <!--
    图片轮播组件
    功能：自动播放 + 点击小圆点切换图片
  -->
  <div class="box-container glass-card" style="padding: 0; overflow: hidden">
    <div class="box" ref="boxRef">
      <div class="box-img" v-for="(img, index) in images" :key="index">
        <img :src="img.src" :alt="img.alt" class="photo" />
      </div>
    </div>
  </div>

  <!-- 轮播控制圆点 -->
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

// 轮播图片数据
const images = [
  {
    src: 'https://n.sinaimg.cn/sinakd10112/636/w1920h1116/20200605/5aed-iurnkpq8959411.jpg',
    alt: 'logo',
  },
  {
    src: 'https://img.bizhikong.com/uploads/ss3/253/3249973560/3487682374.jpg',
    alt: 'logo2',
  },
  {
    src: 'https://ts3.tc.mm.bing.net/th/id/OIP-C.WcwIey7Pbb4nmX7O0q7LBwHaEo?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3',
    alt: 'logo3',
  },
  {
    src: 'https://ts1.tc.mm.bing.net/th/id/R-C.7569b2d83e7e794d97368efa6b07180e?rik=VtQm5CRxgVYybA&riu=http%3a%2f%2fn.sinaimg.cn%2fsinacn18%2f133%2fw640h1093%2f20180610%2f136d-hcufqif4164698.jpg&ehk=S95HQrOIHtnwlev1hvcdygSpd9FDtDYB0ply3VEyFNo%3d&risl=&pid=ImgRaw&r=0',
    alt: 'logo4',
  },
]

const boxRef = ref(null)
const currentIndex = ref(0)
let slideTimer = null

// 切换到指定幻灯片
function goToSlide(index) {
  currentIndex.value = index
  resetTimer()
}

// 更新轮播位置
function updateCarousel() {
  if (boxRef.value) {
    boxRef.value.style.transform = `translateX(-${currentIndex.value * 100}%)`
  }
}

// 自动播放下一张
function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % images.length
  updateCarousel()
}

// 启动自动播放
function startTimer() {
  slideTimer = setInterval(nextSlide, 4000)
}

// 重置计时器（用户手动切换后重新计时）
function resetTimer() {
  clearInterval(slideTimer)
  updateCarousel()
  startTimer()
}

// 组件挂载时启动自动播放
onMounted(() => {
  startTimer()
})

// 组件卸载时清除计时器，防止内存泄漏
onUnmounted(() => {
  clearInterval(slideTimer)
})
</script>

<style scoped>
.box-container {
  max-width: 700px;
  width: 90%;
  margin: 0 auto 10px auto;
  position: relative;
}

.box {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 200px;
}

@media (max-width: 480px) {
  .box { height: 140px }
  .box-container { width: 98% }
}

.box-img {
  min-width: 100%;
  transition: opacity 0.3s ease;
}

.photo {
  border-radius: 15px;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.box-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-dot.active {
  background-color: white;
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .box-container {
    width: 95%;
  }
}
</style>
