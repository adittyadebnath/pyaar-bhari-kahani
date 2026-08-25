const PHOTOS = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  src: `image${index + 1}.jpg
}));

const HEARTS = ["❤️", "💕", "💖", "💗", "💓", "💘"];

// 1 = card slot, 0 = empty space (forms a heart silhouette)
const HEART_LAYOUT = [
  [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
];

let cards = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let lock = false;

const board = document.getElementById("game-board");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const winOverlay = document.getElementById("win-overlay");
const winStats = document.getElementById("win-stats");
const heartContainer = document.getElementById("heart-container");
const restartBtn = document.getElementById("restart");
const playAgainBtn = document.getElementById("play-again");
const seeMemoriesBtn = document.getElementById("see-memories");
const birthdayIntro = document.getElementById("birthday-intro");
const enterGameBtn = document.getElementById("enter-game");
const pageVeil = document.getElementById("page-veil");

let memoriesTimer = null;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createDeck() {
  const pairs = PHOTOS.flatMap((photo) => [
    { ...photo, pairId: photo.id },
    { ...photo, pairId: photo.id },
  ]);
  return shuffle(pairs);
}

function photoUrl(path) {
  return path;
}

function createCardElement(card, index) {
  const el = document.createElement("div");
  el.className = "card";
  el.dataset.index = index;
  el.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div class="card-face card-front">
        <img src="${photoUrl(card.src)}" alt="Photo ${card.id}" loading="lazy" />
      </div>
    </div>
  `;
  el.addEventListener("click", () => handleFlip(index));
  return el;
}

function createFillerElement() {
  const el = document.createElement("div");
  el.className = "card filler";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    </div>
  `;
  return el;
}

function renderBoard() {
  board.innerHTML = "";
  let cardIndex = 0;

  HEART_LAYOUT.forEach((row) => {
    row.forEach((cell) => {
      if (cell === 0) {
        const hole = document.createElement("div");
        hole.className = "grid-hole";
        hole.setAttribute("aria-hidden", "true");
        board.appendChild(hole);
        return;
      }

      if (cardIndex < cards.length) {
        board.appendChild(createCardElement(cards[cardIndex], cardIndex));
      } else {
        board.appendChild(createFillerElement());
      }
      cardIndex++;
    });
  });
}

function handleFlip(index) {
  if (lock) return;

  const cardEl = board.querySelector(`.card[data-index="${index}"]`);
  const card = cards[index];

  if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;
  if (flipped.length === 2) return;

  cardEl.classList.add("flipped");
  flipped.push({ index, el: cardEl, data: card });

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flipped;
  lock = true;

  if (a.data.pairId === b.data.pairId) {
    setTimeout(() => {
      a.el.classList.add("matched");
      b.el.classList.add("matched");
      matchedCount++;
      pairsEl.textContent = matchedCount;

      spawnHearts(a.el, b.el);
      flashMatch();

      flipped = [];
      lock = false;

      if (matchedCount === PHOTOS.length) {
        setTimeout(showWin, 800);
      }
    }, 400);
  } else {
    setTimeout(() => {
      a.el.classList.remove("flipped");
      b.el.classList.remove("flipped");
      flipped = [];
      lock = false;
    }, 900);
  }
}

function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function spawnHearts(elA, elB) {
  const centerA = getCenter(elA);
  const centerB = getCenter(elB);
  const midX = (centerA.x + centerB.x) / 2;
  const midY = (centerA.y + centerB.y) / 2;

  const count = 14;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "heart-particle";
    heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const spread = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * spread;
    const tx2 = tx + (Math.random() - 0.5) * 30;

    heart.style.left = `${midX}px`;
    heart.style.top = `${midY}px`;
    heart.style.setProperty("--tx", `${tx}px`);
    heart.style.setProperty("--tx2", `${tx2}px`);
    heart.style.setProperty("--rot", `${Math.random() * 40 - 20}deg`);
    heart.style.setProperty("--rot2", `${Math.random() * 60 - 30}deg`);
    heart.style.fontSize = `${1 + Math.random() * 1.2}rem`;
    heart.style.animationDelay = `${Math.random() * 0.15}s`;

    heartContainer.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

function flashMatch() {
  const flash = document.createElement("div");
  flash.className = "match-flash";
  document.body.appendChild(flash);
  flash.addEventListener("animationend", () => flash.remove());
}

function showWin() {
  winStats.textContent = `You won in ${moves} moves!`;
  winOverlay.classList.add("show");
  celebrateWin();
  clearTimeout(memoriesTimer);
  memoriesTimer = setTimeout(goToMemories, 2400);
}

function goToMemories() {
  clearTimeout(memoriesTimer);
  sessionStorage.setItem("birthdayEntered", "1");
  sessionStorage.setItem("memoryTransition", "1");
  winOverlay.classList.add("is-departing");
  pageVeil.classList.add("is-visible");
  setTimeout(() => {
    window.location.href = "memories.html";
  }, 1150);
}

function celebrateWin() {
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const x = window.innerWidth * (0.2 + Math.random() * 0.6);
      const y = window.innerHeight * (0.3 + Math.random() * 0.4);
      for (let i = 0; i < 8; i++) {
        const heart = document.createElement("span");
        heart.className = "heart-particle";
        heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.setProperty("--tx", `${(Math.random() - 0.5) * 80}px`);
        heart.style.setProperty("--tx2", `${(Math.random() - 0.5) * 100}px`);
        heart.style.fontSize = `${1.5 + Math.random()}rem`;
        heartContainer.appendChild(heart);
        heart.addEventListener("animationend", () => heart.remove());
      }
    }, burst * 300);
  }
}

function initGame() {
  clearTimeout(memoriesTimer);
  cards = createDeck();
  flipped = [];
  matchedCount = 0;
  moves = 0;
  lock = false;

  movesEl.textContent = "0";
  pairsEl.textContent = "0";
  winOverlay.classList.remove("show", "is-departing");
  heartContainer.innerHTML = "";

  renderBoard();
}

function hideBirthdayIntro() {
  birthdayIntro.classList.add("is-leaving");
  birthdayIntro.addEventListener("transitionend", () => {
    birthdayIntro.hidden = true;
  }, { once: true });
}

restartBtn.addEventListener("click", initGame);
playAgainBtn.addEventListener("click", initGame);

seeMemoriesBtn.addEventListener("click", goToMemories);

enterGameBtn.addEventListener("click", () => {
  sessionStorage.setItem("birthdayEntered", "1");
  hideBirthdayIntro();
});

if (sessionStorage.getItem("birthdayEntered") === "1") {
  birthdayIntro.hidden = true;
  birthdayIntro.classList.add("is-leaving");
}

initGame();
