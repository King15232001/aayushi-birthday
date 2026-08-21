const page = document.querySelector("#birthday-page");
const curtain = document.querySelector("#curtain");
const experience = document.querySelector("#experience");
const soundToggle = document.querySelector("#sound-toggle");
const soundWaves = soundToggle.querySelector(".sound-waves");
const soundLabel = soundToggle.querySelector(".sound-label");
const envelope = document.querySelector("#envelope");
const letter = document.querySelector("#open-letter");
const secretWish = document.querySelector("#secret-wish");
const lightCards = [...document.querySelectorAll(".light-card")];
const progressLights = [...document.querySelectorAll("#light-progress i")];
const animalCards = [...document.querySelectorAll(".animal-card")];
const committeeMessage = document.querySelector("#committee-message");
const friendshipReel = document.querySelector("#friendship-reel");
const reelSlides = [...document.querySelectorAll(".reel-slide")];
const reelPlay = document.querySelector("#reel-play");

let audioContext = null;
let soundTimer = null;
let reelTimer = null;
let reelEndTimer = null;
let scoreNodes = [];

for (let index = 0; index < 24; index += 1) {
  const star = document.createElement("i");
  star.style.setProperty("--i", index);
  star.style.left = `${(index * 37) % 100}%`;
  star.style.top = `${(index * 53) % 94}%`;
  document.querySelector("#ambient").append(star);
}

function stopChime() {
  if (soundTimer !== null) window.clearInterval(soundTimer);
  soundTimer = null;
  soundToggle.setAttribute("aria-pressed", "false");
  soundWaves.classList.remove("active");
  soundLabel.textContent = "Add a little sound";
}

function playChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  const notes = [261.63, 329.63, 392, 523.25, 659.25];
  let step = 0;
  const ring = () => {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.4);
    step += 1;
  };
  ring();
  soundTimer = window.setInterval(ring, 900);
  soundToggle.setAttribute("aria-pressed", "true");
  soundWaves.classList.add("active");
  soundLabel.textContent = "Sound on";
}

function stopFriendshipReel() {
  if (reelTimer !== null) window.clearInterval(reelTimer);
  if (reelEndTimer !== null) window.clearTimeout(reelEndTimer);
  reelTimer = null;
  reelEndTimer = null;
  scoreNodes.forEach((node) => {
    try { node.stop(); } catch {}
    try { node.disconnect(); } catch {}
  });
  scoreNodes = [];
  friendshipReel.classList.remove("playing");
  reelPlay.setAttribute("aria-pressed", "false");
  reelPlay.querySelector("span").textContent = "Play our little reel";
}

function playFriendshipScore() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  const chords = [
    [261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66],
    [261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 392],
  ];
  const start = audioContext.currentTime + 0.08;
  chords.forEach((chord, chordIndex) => {
    chord.forEach((frequency, noteIndex) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const noteStart = start + chordIndex * 2.75;
      oscillator.type = noteIndex === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(noteIndex === 0 ? 0.012 : 0.005, noteStart + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.7);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 2.75);
      scoreNodes.push(oscillator);
    });
  });
}

function startFriendshipReel() {
  stopFriendshipReel();
  stopChime();
  reelSlides.forEach((slide, index) => slide.classList.toggle("active", index === 0));
  void friendshipReel.offsetWidth;
  friendshipReel.classList.add("playing");
  reelPlay.setAttribute("aria-pressed", "true");
  reelPlay.querySelector("span").textContent = "Playing our story…";
  playFriendshipScore();
  let activeIndex = 0;
  reelTimer = window.setInterval(() => {
    activeIndex += 1;
    if (activeIndex >= reelSlides.length) return;
    reelSlides.forEach((slide, index) => slide.classList.toggle("active", index === activeIndex));
  }, 4400);
  reelEndTimer = window.setTimeout(() => {
    if (reelTimer !== null) window.clearInterval(reelTimer);
    reelTimer = null;
    reelEndTimer = null;
    scoreNodes = [];
    friendshipReel.classList.remove("playing");
    reelPlay.setAttribute("aria-pressed", "false");
    reelPlay.querySelector("span").textContent = "Replay our little reel";
  }, 22000);
}

function createSparkBurst(event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = event.clientX || rect.left + rect.width / 2;
  const y = event.clientY || rect.top + rect.height / 2;
  const burst = document.createElement("span");
  burst.className = "spark-burst";
  burst.style.setProperty("--spark-x", `${x}px`);
  burst.style.setProperty("--spark-y", `${y}px`);
  burst.style.setProperty("--spark-color", button.classList.contains("animal-card") ? "#a94869" : "#e9b65c");
  for (let index = 0; index < 8; index += 1) {
    const spark = document.createElement("i");
    spark.style.setProperty("--n", index);
    spark.textContent = index % 2 === 0 ? "✦" : "♡";
    burst.append(spark);
  }
  document.body.append(burst);
  window.setTimeout(() => burst.remove(), 800);
}

document.querySelectorAll("button").forEach((button) => button.addEventListener("click", createSparkBurst));

document.querySelector("#open-surprise").addEventListener("click", () => {
  curtain.hidden = true;
  experience.hidden = false;
  page.classList.add("is-open");
  window.scrollTo({ top: 0 });
});

soundToggle.addEventListener("click", () => {
  if (soundTimer === null) {
    stopFriendshipReel();
    playChime();
  } else {
    stopChime();
  }
});
document.querySelector("#story-button").addEventListener("click", () => document.querySelector("#memories").scrollIntoView({ behavior: "smooth" }));
reelPlay.addEventListener("click", startFriendshipReel);

lightCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("revealed")) return;
    card.classList.add("revealed");
    card.setAttribute("aria-pressed", "true");
    card.querySelector(".light-instruction").textContent = "A wish for you";
    card.querySelector("strong").textContent = card.dataset.wish;
    progressLights[index].classList.add("found");
    const found = lightCards.filter((item) => item.classList.contains("revealed")).length;
    document.querySelector("#light-progress").setAttribute("aria-label", `${found} of 3 wishes revealed`);
    if (found === lightCards.length) secretWish.hidden = false;
  });
});

animalCards.forEach((card) => {
  card.addEventListener("click", () => {
    animalCards.forEach((item) => {
      item.classList.remove("chosen");
      item.setAttribute("aria-pressed", "false");
    });
    card.classList.add("chosen");
    card.setAttribute("aria-pressed", "true");
    committeeMessage.querySelector("p").textContent = card.dataset.message;
    committeeMessage.classList.remove("pop");
    void committeeMessage.offsetWidth;
    committeeMessage.classList.add("pop");
  });
});

envelope.addEventListener("click", () => {
  envelope.classList.add("opened");
  envelope.setAttribute("aria-label", "Birthday note opened");
  letter.hidden = false;
});

document.querySelector("#replay-button").addEventListener("click", () => {
  stopChime();
  stopFriendshipReel();
  reelSlides.forEach((slide, index) => slide.classList.toggle("active", index === 0));
  reelPlay.querySelector("span").textContent = "Play our little reel";
  envelope.classList.remove("opened");
  envelope.setAttribute("aria-label", "Open the birthday note");
  letter.hidden = true;
  secretWish.hidden = true;
  lightCards.forEach((card, index) => {
    card.classList.remove("revealed");
    card.setAttribute("aria-pressed", "false");
    card.querySelector(".light-instruction").textContent = "Touch the light";
    card.querySelector("strong").textContent = "A little wish is hiding here.";
    progressLights[index].classList.remove("found");
  });
  animalCards.forEach((card) => {
    card.classList.remove("chosen");
    card.setAttribute("aria-pressed", "false");
  });
  committeeMessage.querySelector("p").textContent = "Choose a tiny messenger to read its note.";
  committeeMessage.classList.remove("pop");
  document.querySelector("#light-progress").setAttribute("aria-label", "0 of 3 wishes revealed");
  experience.hidden = true;
  curtain.hidden = false;
  page.classList.remove("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => image.closest(".photo-frame")?.classList.add("is-missing"));
});
