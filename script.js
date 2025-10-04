// script.js
let startTime = null; // timestamp when test starts

// DOM elements
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const timeDisplay = document.getElementById("timeDisplay");
const wpmDisplay = document.getElementById("wpmDisplay");
const accDisplay = document.getElementById("accDisplay");
const bestDisplay = document.getElementById("bestDisplay");
const textContainer = document.getElementById("renderedText");
const hiddenInput = document.getElementById("hiddenInput");
const typingBox = document.getElementById("typingBox");
const progressPct = document.getElementById("progressPct");
const paraSelect = document.getElementById("paraSelect");
const customDuration = document.getElementById("customDuration");
const keyboardContainer = document.getElementById("keyboard");
const resultModal = document.getElementById("resultModal");
const finalWPM = document.getElementById("finalWPM");
const finalAcc = document.getElementById("finalAcc");
const finalBest = document.getElementById("finalBest");
const modalRestart = document.getElementById("modalRestart");
const modalClose = document.getElementById("modalClose");

// Keyboard layout (simplified)
const keyboardLayout = [
  ["`","1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
  ["Tab","q","w","e","r","t","y","u","i","o","p","[","]","\\"],
  ["CapsLock","a","s","d","f","g","h","j","k","l",";","'","Enter"],
  ["Shift","z","x","c","v","b","n","m",",",".","/","Shift"],
  ["Control","Alt","Space","Alt","Control"]
];

let currentParagraph = "";
let chars = [];
let currentIndex = 0;
let timer = null;
let timeLeft = 0;
let duration = 60; // seconds default
let correctChars = 0;
let totalTyped = 0;
let bestWPM = 0;

// ---------- RENDER KEYBOARD ----------
function renderKeyboard() {
  keyboardContainer.innerHTML = "";
  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("flex","justify-center","mb-1");
    row.forEach(key => {
      const keyDiv = document.createElement("div");
      keyDiv.classList.add("key");
      
      if(["Backspace","Tab","CapsLock","Enter","Shift","Control","Alt","Space"].includes(key)){
        keyDiv.classList.add("wide");
        if(key === "Space") keyDiv.classList.add("space");
      }

      keyDiv.textContent = key;
      keyDiv.dataset.key = key.toLowerCase();
      rowDiv.appendChild(keyDiv);
    });
    keyboardContainer.appendChild(rowDiv);
  });
}

// ---------- HIGHLIGHT KEY ----------
function highlightKey(char) {
  document.querySelectorAll(".key").forEach(k => k.classList.remove("highlight"));
  if(!char) return;

  let keyChar = char.toLowerCase();
  if(keyChar === " ") keyChar = "space";

  const keyDiv = document.querySelector(`.key[data-key="${keyChar}"]`);
  if(keyDiv) keyDiv.classList.add("highlight");
}

// ---------- RENDER PARAGRAPH ----------
function renderParagraph(text) {
  textContainer.innerHTML = "";
  chars = [];
  text.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.classList.add("char");
    if (i === 0) span.classList.add("current-char");
    textContainer.appendChild(span);
    chars.push(span);
  });
  currentIndex = 0;
  correctChars = 0;
  totalTyped = 0;
  highlightKey(chars[0].textContent);
  progressPct.textContent = "0%";

  // Make scroll container show only 3-4 lines
  textContainer.style.maxHeight = "4em"; // approx 3-4 lines
  textContainer.style.overflowY = "auto";
  textContainer.scrollTop = 0;
}

// ---------- UPDATE METRICS ----------
function updateMetrics() {
  const elapsedMinutes = Math.max((Date.now() - startTime)/60000, 1/60);
  const wpm = Math.round((correctChars / 5) / elapsedMinutes);
  const acc = totalTyped === 0 ? 100 : Math.round((correctChars/totalTyped)*100);

  wpmDisplay.textContent = wpm;
  accDisplay.textContent = acc + "%";

  const progress = Math.min(100, Math.round((currentIndex / chars.length) * 100));
  progressPct.textContent = progress + "%";

  // Scroll to current char
  if(chars[currentIndex]){
    chars[currentIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

// ---------- TIMER ----------
function tick() {
  if (timeLeft <= 0) {
    endTest();
    return;
  }
  timeLeft--;
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2,"0");
  const seconds = String(timeLeft % 60).padStart(2,"0");
  timeDisplay.textContent = `${minutes}:${seconds}`;
}

// ---------- START TEST ----------
async function startTest() {
  // Determine duration in seconds
  duration = Number(customDuration.value) > 0 
    ? Number(customDuration.value) * 60 
    : Number(document.querySelector(".duration-btn.active")?.dataset.min || 1) * 60;

  timeLeft = duration;

  try {
    // Calculate how many paragraphs are needed based on duration
    const paraCount = Math.max(1, Math.round(duration / 30));

    // Fetch paragraphs from your hosted API
    const response = await fetch(`https://random-para-generator-api.onrender.com/paragraph?count=${paraCount}`);
    if (!response.ok) throw new Error("Failed to fetch paragraph");
    const data = await response.json();

    // Your API returns { count, total_available, paragraphs: [] }
    const paragraphsText = data.paragraphs.join(" ");
    currentParagraph = paragraphsText.trim();

    // Render to UI
    renderParagraph(currentParagraph);
    updateMetrics();
    hiddenInput.value = "";
    hiddenInput.focus();

    startTime = Date.now();

    clearInterval(timer);
    timer = setInterval(() => {
      tick();
      updateMetrics();
    }, 1000);

  } catch (error) {
    alert("Error fetching paragraph. Please try again.");
    console.error(error);
  }
}



// ---------- END TEST ----------
function endTest() {
  clearInterval(timer);
  const elapsedMinutes = Math.max((Date.now() - startTime)/60000, 1/60);
  const wpm = Math.round((correctChars / 5) / elapsedMinutes);
  const acc = totalTyped === 0 ? 100 : Math.round((correctChars/totalTyped)*100);

  bestWPM = Math.max(bestWPM, wpm);

  finalWPM.textContent = wpm;
  finalAcc.textContent = acc + "%";
  finalBest.textContent = bestWPM;
  bestDisplay.textContent = bestWPM;

  resultModal.classList.remove("hidden");
}

// ---------- RESET TEST ----------
function resetTest() {
  clearInterval(timer);
  timeLeft = duration;
  timeDisplay.textContent = "00:00";
  wpmDisplay.textContent = "0";
  accDisplay.textContent = "100%";
  progressPct.textContent = "0%";
  textContainer.innerHTML = "";
  hiddenInput.value = "";
  highlightKey("");
}

hiddenInput.addEventListener("keydown", e => {
  let key = e.key.toLowerCase();
  if(key === " ") key = "space";
  const keyDiv = document.querySelector(`.key[data-key="${key}"]`);
  if(keyDiv){
    keyDiv.classList.add("pressed");
    setTimeout(() => keyDiv.classList.remove("pressed"), 100);
  }
});

function updateNextCharHighlight() {
  const nextChar = chars[currentIndex]?.textContent;
  highlightKey(nextChar);
}

hiddenInput.addEventListener("input", e => {
  updateNextCharHighlight();
});

hiddenInput.addEventListener("input", e => {
  const val = e.target.value;

  if (val.length < currentIndex) {
    if (currentIndex > 0) {
      currentIndex--;
      const span = chars[currentIndex];
      span.classList.remove("correct", "incorrect", "current-char");
      span.classList.add("current-char");

      correctChars = Array.from(chars)
        .slice(0, currentIndex)
        .filter(c => c.classList.contains("correct")).length;
      totalTyped = Math.max(totalTyped - 1, 0);

      highlightKey(chars[currentIndex].textContent);
      updateMetrics();
    }
    return;
  }

  if (!chars[currentIndex]) return;

  totalTyped++;
  if (val.slice(-1) === chars[currentIndex].textContent) {
    chars[currentIndex].classList.add("correct");
    correctChars++;
  } else {
    chars[currentIndex].classList.add("incorrect");
  }
  chars[currentIndex].classList.remove("current-char");
  currentIndex++;

  if (chars[currentIndex]) {
    chars[currentIndex].classList.add("current-char");
    highlightKey(chars[currentIndex].textContent);
  } else {
    endTest();
    return;
  }

  updateMetrics();
});

document.querySelectorAll(".duration-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".duration-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    customDuration.value = "";
  });
});

// Event listeners
startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", resetTest);
modalRestart.addEventListener("click", () => {
  resultModal.classList.add("hidden");
  startTest();
});
modalClose.addEventListener("click", () => {
  resultModal.classList.add("hidden");
});
typingBox.addEventListener("click", () => hiddenInput.focus());

// Initialize
renderKeyboard();
resetTest();
