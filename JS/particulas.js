const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

let particles = [];
let targetParticleCount = 30; 
let connectionDistance = 150; 
let mouse = { x: null, y: null, radius: 150 };
let ripples = []; 
let particlesToRemove = 0;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`; 
    this.opacity = 0;
    this.targetOpacity = 1;
    this.fadingOut = false;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > width) this.speedX *= -1; 
    if (this.y < 0 || this.y > height) this.speedY *= -1;

      // && = E || = ou
    if (mouse.x != null && mouse.y != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * force * 5;
        const moveY = Math.sin(angle) * force * 5;

        this.x -= moveX;
        this.y -= moveY;
      }
    }

    if (this.opacity < this.targetOpacity) {
      this.opacity += 0.02;
    } else if (this.opacity > this.targetOpacity) {
      this.opacity -= 0.02;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  startFadeOut() {
    this.targetOpacity = 0;
    this.fadingOut = true;
  }

  isFadedOut() {
    return this.fadingOut && this.opacity <= 0;
  }
}
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.maxSize = 100;
    this.speed = 1.5;
    this.opacity = 0.7;
  }

  update() {
    this.size += this.speed;
    this.opacity -= 0.01;

    if (this.opacity <= 0) {
      this.opacity = 0;
    }
  }

  draw() {
    ctx.strokeStyle = `rgba(79, 172, 254, ${this.opacity})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < targetParticleCount; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        const opacity = 1 - distance / connectionDistance;
        ctx.strokeStyle = `rgba(79, 172, 254, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  if (particles.length < targetParticleCount) {
    particles.push(new Particle());
  } else if (particles.length > targetParticleCount) {
    if (particlesToRemove === 0) {
      particlesToRemove = particles.length - targetParticleCount;
    }
    let marked = 0;
    for (
      let i = 0;
      i < particles.length && marked < 3 && particlesToRemove > 0;
      i++
    ) {
      if (!particles[i].fadingOut) {
        particles[i].startFadeOut();
        marked++;
        particlesToRemove--;
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].isFadedOut()) {
      particles.splice(i, 1);
    }
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  connectParticles();
  for (let i = 0; i < ripples.length; i++) {
    ripples[i].update();
    ripples[i].draw();

    if (ripples[i].opacity <= 0) {
      ripples.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener("click", (e) => {
  ripples.push(new Ripple(e.x, e.y));
});

const particleCountSlider = document.getElementById("particleCount");
const particleCountValue = document.getElementById("particleCountValue");
const connectionDistanceSlider = document.getElementById("connectionDistance");
const connectionDistanceValue = document.getElementById(
  "connectionDistanceValue"
);

particleCountSlider.addEventListener("input", (e) => {
  targetParticleCount = parseInt(e.target.value);
  particleCountValue.textContent = targetParticleCount;

  if (particles.length > targetParticleCount) {
    particlesToRemove = particles.length - targetParticleCount;
  } else {
    particlesToRemove = 0;
  }
});

connectionDistanceSlider.addEventListener("input", (e) => {
  connectionDistance = parseInt(e.target.value);
  connectionDistanceValue.textContent = connectionDistance;
});

initParticles();
animate();
