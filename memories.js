const MEMORIES = [
  { caption: "A look I still remember, even with my eyes closed." },
  { caption: "The first spark — where our story quietly began." },
  { caption: "The kind of laugh that makes the whole room softer." },
  { caption: "A little adventure, just the two of us." },
  { caption: "Sunlight, a camera, and you — that was enough." },
  { caption: "The day that still feels like a favorite song." },
  { caption: "Close enough to hear the world go quiet." },
  { caption: "A secret smile, saved just for you." },
  { caption: "The ordinary moment I never want to forget." },
  { caption: "Proof that home can be a person." },
  { caption: "We were glowing, and we didn’t even notice." },
  { caption: "A memory I would choose again, every time." },
  { caption: "Your hand in mine — still my favorite place." },
  { caption: "The moment that turned into a forever." },
  { caption: "Soft light, loud hearts." },
  { caption: "A photograph of us, already in love." },
  { caption: "If joy had a face, it would look like this." },
  { caption: "The kind of day I wish I could replay." },
  { caption: "You, being you — my favorite view." },
  { caption: "A promise we didn’t have to say out loud." },
  { caption: "The world blurred. You stayed in focus." },
  { caption: "Another piece of the heart we built together." },
  { caption: "I would walk into this moment again." },
  { caption: "A souvenir from a day that loved us back." },
  { caption: "Forever my favorite chapter." },
  { caption: "The memory that always finds me first." },
  { caption: "Us, written in light." },
  { caption: "A birthday of a feeling — this one, right here." },
  { caption: "Thank you for every version of this smile." },
  { caption: "And this — the love that binds us together." },
];

const HEARTS = ["❤️", "💕", "💖", "💗", "💓", "💘"];

const timeline = document.getElementById("timeline");
const progress = document.getElementById("scroll-progress");
const heartsLayer = document.getElementById("memory-hearts");

function renderTimeline() {
  MEMORIES.forEach((memory, index) => {
    const article = document.createElement("article");
    article.className = `memory-card ${index % 2 === 0 ? "is-left" : "is-right"}`;
    article.style.setProperty("--delay", `${(index % 4) * 0.08}s`);

    const number = String(index + 1).padStart(2, "0");
    article.innerHTML = `
      <div class="memory-dot" aria-hidden="true"></div>
      <figure class="polaroid">
        <img src="image${index + 1}.jpg" alt="Memory ${number}" loading="lazy">
        <figcaption>
          <span class="memory-number">${number}</span>
          <p>${memory.caption}</p>
        </figcaption>
      </figure>
    `;
    timeline.appendChild(article);
  });
}

function observeCards() {
  const cards = document.querySelectorAll(".memory-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

  cards.forEach((card) => observer.observe(card));
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${percent}%`;
}

function spawnAmbientHeart() {
  const heart = document.createElement("span");
  heart.className = "ambient-heart";
  heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  heart.style.left = `${8 + Math.random() * 84}%`;
  heart.style.fontSize = `${0.7 + Math.random() * 1.1}rem`;
  heart.style.animationDuration = `${9 + Math.random() * 8}s`;
  heart.style.opacity = `${0.18 + Math.random() * 0.28}`;
  heartsLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

function finishArrival() {
  if (sessionStorage.getItem("memoryTransition") !== "1") return;

  const veil = document.getElementById("page-veil");
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("is-arriving");
    if (veil) veil.classList.add("is-visible");
    requestAnimationFrame(() => {
      if (veil) veil.classList.remove("is-visible");
    });
  });
  sessionStorage.removeItem("memoryTransition");
}

function goToCelebrate() {
  sessionStorage.setItem("pageTransition", "1");
  const veil = document.getElementById("page-veil");
  if (veil) veil.classList.add("is-visible");
  setTimeout(() => {
    window.location.href = "celebrate.html";
  }, 1150);
}

const openCelebrate = document.getElementById("open-celebrate");
if (openCelebrate) {
  openCelebrate.addEventListener("click", goToCelebrate);
}

renderTimeline();
observeCards();
updateProgress();
finishArrival();
window.addEventListener("scroll", updateProgress, { passive: true });

for (let i = 0; i < 10; i++) {
  setTimeout(spawnAmbientHeart, i * 400);
}
setInterval(spawnAmbientHeart, 1800);
