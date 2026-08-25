const PHOTO_COUNT = 30;
const BALLOON_COLORS = ["#ff4d6d", "#ff8fa3", "#ffd166", "#fff5f7", "#c9184a", "#ff9fb0"];
const SPARK_COLORS = ["#ffd166", "#ff4d6d", "#fff5f7", "#ff8fa3", "#ffb703", "#ffffff"];

const cakeButton = document.getElementById("cake-button");
const cakeLeft = document.getElementById("cake-left");
const cakeRight = document.getElementById("cake-right");
const stage = document.getElementById("celebrate-stage");
const hint = document.getElementById("celebrate-hint");
const sky = document.getElementById("balloon-sky");
const overlay = document.getElementById("anniversary-overlay");
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let cutDone = false;
let fireworksBoost = 1;
const rockets = [];
const sparks = [];

function cakeVisual() {
  return `
    <span class="cake-visual">
      <span class="candles">
        <span class="candle"><span class="flame"></span></span>
        <span class="candle tall"><span class="flame"></span></span>
        <span class="candle"><span class="flame"></span></span>
        <span class="candle tall"><span class="flame"></span></span>
        <span class="candle"><span class="flame"></span></span>
      </span>
      <span class="tier top">
        <span class="drip"></span>
      </span>
      <span class="tier mid">
        <span class="drip"></span>
      </span>
      <span class="tier base">
        <span class="drip"></span>
      </span>
      <span class="plate"></span>
    </span>
  `;
}

cakeLeft.innerHTML = cakeVisual();
cakeRight.innerHTML = cakeVisual();

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function spawnRocket() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  rockets.push({
    x: 24 + Math.random() * (w - 48),
    y: h + 8,
    vx: (Math.random() - 0.5) * 1.4,
    vy: -(7.5 + Math.random() * 5.5 * fireworksBoost),
    hue: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    peak: h * (0.18 + Math.random() * 0.38),
  });
}

function explode(x, y, color) {
  const count = 28 + Math.floor(Math.random() * 18);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 1.4 + Math.random() * 4.2;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      color,
      size: 1.4 + Math.random() * 2.2,
    });
  }
}

function spawnGroundCracker() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = Math.random() * w;
  const y = h - 6;
  const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
  const count = 10 + Math.floor(Math.random() * 10);
  for (let i = 0; i < count; i++) {
    sparks.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3.4,
      vy: -(2.5 + Math.random() * 6),
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      color,
      size: 1.2 + Math.random() * 2,
    });
  }
}

function tickFireworks() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  if (Math.random() < 0.045 * fireworksBoost) spawnRocket();
  if (Math.random() < 0.22 * fireworksBoost) spawnGroundCracker();

  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i];
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;

    ctx.beginPath();
    ctx.strokeStyle = rocket.hue;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.moveTo(rocket.x, rocket.y + 10);
    ctx.lineTo(rocket.x - rocket.vx * 2, rocket.y - rocket.vy * 2);
    ctx.stroke();

    if (rocket.y <= rocket.peak || rocket.vy >= -0.4) {
      explode(rocket.x, rocket.y, rocket.hue);
      rockets.splice(i, 1);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.06;
    spark.life -= spark.decay;

    ctx.globalAlpha = Math.max(spark.life, 0);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();

    if (spark.life <= 0) sparks.splice(i, 1);
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(tickFireworks);
}

function launchBalloons() {
  for (let i = 0; i < PHOTO_COUNT; i++) {
    setTimeout(() => {
      const float = document.createElement("div");
      const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
      const startX = 18 + Math.random() * 64;
      const drift = (Math.random() - 0.5) * 160;
      const duration = 9 + Math.random() * 6;
      const rotate = (Math.random() - 0.5) * 16;

      float.className = "balloon-float";
      float.style.setProperty("--x", `${startX}vw`);
      float.style.setProperty("--drift", `${drift}px`);
      float.style.setProperty("--dur", `${duration}s`);
      float.style.setProperty("--rot", `${rotate}deg`);
      float.innerHTML = `
        <span class="balloon" style="background: ${color}; color: ${color}"></span>
        <span class="balloon-string"></span>
        <img src="images/image${i + 1}.jpg" alt="" class="balloon-photo">
      `;
      sky.appendChild(float);
      float.addEventListener("animationend", () => float.remove());
    }, i * 90);
  }

  setTimeout(() => {
    overlay.classList.add("show");
  }, PHOTO_COUNT * 90 + 2800);
}

function cutCake() {
  if (cutDone) return;
  cutDone = true;
  cakeButton.disabled = true;
  cakeButton.classList.add("is-cutting");
  hint.textContent = "Make a wish…";
  fireworksBoost = 2.4;

  setTimeout(() => {
    cakeButton.classList.add("is-cut");
    hint.textContent = "Our pictures are flying away with the balloons";
  }, 380);

  setTimeout(() => {
    stage.classList.add("is-done");
    launchBalloons();
  }, 1300);
}

function finishArrival() {
  if (sessionStorage.getItem("pageTransition") !== "1") return;
  const veil = document.getElementById("page-veil");
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("is-arriving");
    if (veil) veil.classList.add("is-visible");
    requestAnimationFrame(() => {
      if (veil) veil.classList.remove("is-visible");
    });
  });
  sessionStorage.removeItem("pageTransition");
}

cakeButton.addEventListener("click", cutCake);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
tickFireworks();
finishArrival();
for (let i = 0; i < 8; i++) {
  setTimeout(spawnGroundCracker, i * 120);
}
