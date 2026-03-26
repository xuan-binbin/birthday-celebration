<template>
  <div class="home-page">
    <StarsBackground />
    <div class="startSign">
      <p id="startButton" class="two button">准备好了，我们开始吧！</p>
    </div>

    <div class="container">
      <div class="one">
        <h1 class="one">
          <span data-node-name="greeting">你好啊</span>
          <span data-node-name="name">轩轩</span>
        </h1>
        <p class="two" data-node-name="greetingText">很庆幸能在最美丽的年华遇见最美丽的你</p>
      </div>
      <div class="three">
        <p data-node-name="text1">今天是你的生日啊!!!</p>
      </div>
      <div class="four">
        <div class="text-box">
          <p class="hbd-chatbox" data-node-name="textInChatBox">非常非常非常诚挚的祝你生日快乐！！！很多很多的快乐……</p>
          <p class="fake-btn" data-node-name="sendButtonLabel">发送</p>
        </div>
      </div>
      <div class="five">
        <p class="idea-1" data-node-name="text2">我想给你一个惊喜</p>
        <p class="idea-2" data-node-name="text3">我认真的想了很久</p>
        <p class="idea-3">
          <span data-node-name="text4">我认识到，我想要做一些</span>
          <strong data-node-name="text4Adjective">特殊的事情</strong>
        </p>
        <p class="idea-4" data-node-name="text5Entry">因为，</p>
        <p class="idea-5">
          <span data-node-name="text5Content">你对于我来说，很特殊</span>
          <span class="smiley" data-node-name="smiley">:)</span>
        </p>
        <p class="idea-6">
          <span data-node-name="bigTextPart1">所</span>
          <span data-node-name="bigTextPart2">以</span>
        </p>
      </div>
      <div class="six">
        <div class="wish">
          <h3 class="wish-hbd" data-node-name="wishHeading">生日快乐啊!</h3>
          <h5 data-node-name="wishText">朱颜长似，头上花枝，岁岁年年。愿君青丝不老，岁岁皆欢。</h5>
        </div>
      </div>
      <div class="seven">
        <div class="baloons">
          <div class="balloon" style="left: 5%; background: #bd6ecf;"></div>
          <div class="balloon" style="left: 15%; background: #7dd175;"></div>
          <div class="balloon" style="left: 25%; background: #349d8b;"></div>
          <div class="balloon" style="left: 35%; background: #c66053;"></div>
          <div class="balloon" style="left: 45%; background: #bfaa40;"></div>
          <div class="balloon" style="left: 55%; background: #e3bae8;"></div>
          <div class="balloon" style="left: 65%; background: #8762cb;"></div>
          <div class="balloon" style="left: 75%; background: #9a90da;"></div>
          <div class="balloon" style="left: 85%; background: #bd6ecf;"></div>
          <div class="balloon" style="left: 95%; background: #7dd175;"></div>
        </div>
      </div>
      <div class="eight">
        <div class="confetti" style="background: #bd6ecf;"></div>
        <div class="confetti" style="background: #7dd175;"></div>
        <div class="confetti" style="background: #349d8b;"></div>
        <div class="confetti" style="background: #c66053;"></div>
        <div class="confetti" style="background: #bfaa40;"></div>
        <div class="confetti" style="background: #e3bae8;"></div>
        <div class="confetti" style="background: #8762cb;"></div>
        <div class="confetti" style="background: #9a90da;"></div>
      </div>
      <div class="nine">
        <p data-node-name="outroText">我希望你喜欢这个小小的惊喜!</p>
        <p id="replay" data-node-name="replayText">如果你喜欢的话，可以再看一次哦!或者……</p>
        <p class="last-smile" data-node-name="outroSmiley">:)</p>
      </div>
      <canvas id="fireworksCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import StarsBackground from '../components/StarsBackground.vue'

let fireworks = []

const initFireworks = () => {
  const canvas = document.getElementById('fireworksCanvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  class Particle {
    constructor(x, y, color, angle, speed) {
      this.x = x
      this.y = y
      this.color = color
      this.angle = angle
      this.speed = speed
      this.size = Math.random() * 2 + 1
      this.alpha = 1
      this.gravity = 0.02
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed
      this.speed *= 0.98
      this.alpha -= 0.015
      this.speed -= this.gravity
    }

    draw() {
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  class Firework {
    constructor(x, y, particleCount = 50) {
      this.x = x
      this.y = y
      this.particles = []
      this.colors = ["#ff5733", "#ffbd33", "#33ff57", "#3357ff", "#f033ff"]

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3 + 2
        const color = this.colors[Math.floor(Math.random() * this.colors.length)]
        this.particles.push(new Particle(this.x, this.y, color, angle, speed))
      }
    }

    update() {
      this.particles.forEach((p, index) => {
        p.update()
        if (p.alpha <= 0) {
          this.particles.splice(index, 1)
        }
      })
    }

    draw() {
      this.particles.forEach(p => p.draw())
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    fireworks.forEach((firework, index) => {
      firework.update()
      firework.draw()
      if (firework.particles.length === 0) {
        fireworks.splice(index, 1)
      }
    })

    requestAnimationFrame(animate)
  }

  document.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    fireworks.push(new Firework(x, y, 30))
  })

  animate()
}

const animationTimeline = () => {
  const textBoxChars = document.querySelector(".hbd-chatbox")
  const hbd = document.querySelector(".wish-hbd")

  if (textBoxChars) {
    textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML.split("").join("</span><span>")}</span>`
  }
  if (hbd) {
    hbd.innerHTML = `<span>${hbd.innerHTML.split("").join("</span><span>")}</span>`
  }

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg"
  }

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg"
  }

  const tl = gsap.timeline()

  tl.to(".container", 0.1, { visibility: "visible" })
    .from(".one", 0.7, { opacity: 0, y: 10 })
    .from(".container .two", 0.4, { opacity: 0, y: 10 })
    .to(".one", 0.7, { opacity: 0, y: 10 }, "+=2.5")
    .to(".container .two", 0.7, { opacity: 0, y: 10 }, "-=1")
    .from(".three", 0.7, { opacity: 0, y: 10 })
    .to(".three", 0.7, { opacity: 0, y: 10 }, "+=2")
    .from(".four", 0.7, { scale: 0.2, opacity: 0 })
    .from(".fake-btn", 0.3, { scale: 0.2, opacity: 0 })
    .to(".hbd-chatbox span", { visibility: "visible", stagger: 0.05 })
    .to(".fake-btn", 0.1, { backgroundColor: "#8FE3B6" })
    .to(".four", 0.5, { scale: 0.2, opacity: 0, y: -150 }, "+=0.7")
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, { scale: 1.2, x: 10, backgroundColor: "rgb(21, 161, 237)", color: "#fff" })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-5", 0.7, { rotationX: 15, rotationZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5")
    .to(".idea-5 .smiley", 0.7, { rotation: 90, x: 8 }, "+=0.4")
    .to(".idea-5", 0.7, { scale: 0.2, opacity: 0 }, "+=2")
    .from(".idea-6 span", { scale: 3, opacity: 0, rotation: 15, ease: "expo.out", stagger: 0.2 })
    .to(".idea-6 span", { scale: 3, opacity: 0, rotation: -15, ease: "expo.out", stagger: 0.2 }, "+=1")
    .fromTo(".baloons .balloon", { opacity: 0.9, y: 1400 }, { opacity: 1, y: -1000, stagger: 0.2, duration: 2.5 })
    .from(".six .wish", { scale: 3.5, opacity: 0, x: 25, y: -25, rotationZ: -45, duration: 0.5 }, "-=2")
    .from(".wish-hbd span", { opacity: 0, y: -50, rotation: 150, skewX: "30deg", ease: "elastic.out(1, 0.5)", stagger: 0.1, duration: 0.7 })
    .fromTo(".wish-hbd span", { scale: 1.4, rotationY: 150 }, { scale: 1, rotationY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.1, duration: 0.7 }, "party")
    .from(".wish h5", { opacity: 0, y: 10, skewX: "-15deg", duration: 0.5 }, "party")
    .to(".eight .confetti", { visibility: "visible", opacity: 0, scale: 80, repeat: 3, repeatDelay: 1.4, stagger: 0.3, duration: 1.5 })
    .to(".six", { opacity: 0, y: 30, zIndex: "-1", duration: 0.5 })
    .from(".nine p", { ...ideaTextTrans, stagger: 1.2, duration: 1 })
    .to(".last-smile", { rotation: 90, duration: 0.5 }, "+=1")

  const replyBtn = document.getElementById("replay")
  if (replyBtn) {
    replyBtn.addEventListener("click", () => {
      tl.restart()
    })
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  initFireworks()

  const startButton = document.getElementById('startButton')
  if (startButton) {
    startButton.addEventListener('click', () => {
      document.querySelector('.startSign').style.display = 'none'
      animationTimeline()
    })
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style>
html {
  box-sizing: border-box;
}

body {
  margin: 0;
  height: 100vh;
  width: 100vw;
}

.home-page {
  position: relative;
  width: 100%;
  height: 100vh;
}

#fireworksCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.startSign {
  position: relative;
  z-index: 5;
}

.startSign .button {
  color: #fff;
}

.container {
  height: 100vh;
  width: 100vw;
  margin: 0 auto;
  text-align: center;
  visibility: hidden;
  position: relative;
  overflow: hidden;
  z-index: 5;
  color: #fff;
}

.container > div {
  position: absolute;
  left: 0;
  right: 0;
  top: 20vh;
}

.one {
  font-size: 4.5rem;
}

.one > img {
  vertical-align: middle;
  margin-bottom: 10px;
  max-width: 100%;
  height: auto;
}

.two {
  font-size: 1.2rem;
  font-weight: lighter;
}

.three {
  font-size: 3rem;
}

.four .text-box {
  width: 600px;
  margin: 0 auto;
  border: 3px solid #aaa;
  border-radius: 5px;
  padding: 10px;
  position: relative;
}

.text-box p {
  margin: 0;
  text-align: left;
}

.text-box span {
  visibility: hidden;
}

.text-box .fake-btn {
  position: absolute;
  right: 5px;
  bottom: 2px;
  color: #fff;
  background-color: #03C160;
  padding: 8px 16px;
  border-radius: 8px;
}

.five p {
  font-size: 2rem;
  position: absolute;
  left: 0;
  right: 0;
}

.idea-3 strong {
  padding: 3px 5px;
  border-radius: 3px;
  display: inline-block;
}

.idea-5 {
  font-size: 4rem;
}

.idea-5 span,
.idea-6 span,
.wish-hbd span {
  display: inline-block;
}

.idea-6 span {
  font-size: 15rem;
}

.six {
  position: relative;
}

.wish-hbd {
  font-size: 3em;
  margin: 0;
  text-transform: uppercase;
}

.wish h5 {
  font-weight: lighter;
  font-size: 2rem;
  margin: 10px 0 0;
}

.nine p {
  font-size: 2rem;
  font-weight: lighter;
}

#replay {
  z-index: 3;
  cursor: pointer;
}

.startSign {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 20vh 5vw;
}

.startSign .button {
  padding: 1rem 1.6rem;
  border: 1px solid #03C160;
  border-radius: 5px;
}

.startSign .button:hover {
  background-color: #03C160;
  color: #fff;
  padding: 1rem 1.6rem;
  cursor: pointer;
}

.balloon {
  position: absolute;
  width: 35px;
  height: 45px;
  border-radius: 50% 50% 50% 50%;
  bottom: -100px;
}

.balloon::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 10px solid inherit;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.balloon::after {
  content: "";
  position: absolute;
  width: 2px;
  height: 50px;
  background: #ccc;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #f00;
  top: 0;
  left: 0;
  visibility: hidden;
  z-index: -1;
}

.confetti:nth-child(1) { top: 7vh; left: 5vw; }
.confetti:nth-child(2) { top: 23vh; left: 35vw; }
.confetti:nth-child(3) { top: 33vh; left: 23vw; }
.confetti:nth-child(4) { top: 43vh; left: 57vw; }
.confetti:nth-child(5) { top: 68vh; left: 7vw; }
.confetti:nth-child(6) { top: 42vh; left: 77vw; }
.confetti:nth-child(7) { top: 68vh; left: 83vw; }
.confetti:nth-child(8) { top: 86vh; left: 37vw; }

@media screen and (max-width: 500px) {
  .container {
    width: 90%;
  }
  .four .text-box {
    width: 90%;
  }
  .text-box .fake-btn {
    right: 5px;
    bottom: -48px;
  }
  .idea-5 span {
    display: block;
  }
  .idea-6 span {
    font-size: 10rem;
  }
  .wish-hbd {
    font-size: 2.2em;
  }
  .wish h5 {
    font-size: 1.4rem;
  }
  .nine p {
    font-size: 1.5rem;
    font-weight: lighter;
  }
}
</style>
