// script.js
let startTime = null;
let chars = [];
let currentIndex = 0;
let correctChars = 0;
let totalTyped = 0;

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

function highlightKey(char) {
  document.querySelectorAll(".key").forEach(k => k.classList.remove("highlight"));
  if(!char) return;

  let keyChar = char.toLowerCase();
  if(keyChar === " ") keyChar = "space";

  const keyDiv = document.querySelector(`.key[data-key="${keyChar}"]`);
  if(keyDiv) keyDiv.classList.add("highlight");
}

function renderParagraph(text) {
  textContainer.innerHTML = "";
  chars = [];
  text.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.classList.add("char");
    if(i === 0) span.classList.add("current-char");
    textContainer.appendChild(span);
    chars.push(span);
  });
  currentIndex = 0;
  correctChars = 0;
  totalTyped = 0;
  highlightKey(chars[0].textContent);
  progressPct.textContent = "0%";
}