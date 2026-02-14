const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("Original content length:", content.length);

// 1. Fix updateMusicButton function with Unicode escapes
// Regex matches the function signature and body until the closing brace
const updateButtonRegex = /function updateMusicButton\(\)\s*\{[\s\S]*?\}/;
const newUpdateButton = `function updateMusicButton() {
    if (musicPlaying && !musicMuted) {
      musicToggle.classList.add('playing');
      musicToggle.textContent = '\\uD83C\\uDFB6'; // 🎶
    } else {
      musicToggle.classList.remove('playing');
      musicToggle.textContent = '\\uD83C\\uDFB5'; // 🎵
    }
  }`;

if (updateButtonRegex.test(content)) {
    content = content.replace(updateButtonRegex, newUpdateButton);
    console.log("Replaced updateMusicButton.");
} else {
    console.error("Could not find updateMusicButton function.");
}

// 2. Fix Android Start Logic
// Regex matches the block of addEventListeners at the end
const listenersRegex = /document\.addEventListener\('click', startMusicSystem, \{ once: true \}\);\s*document\.addEventListener\('touchstart', startMusicSystem, \{ once: true \}\);\s*document\.addEventListener\('keydown', startMusicSystem, \{ once: true \}\);/;

const newListeners = `// Auto-start music on ANY user interaction (Crucial for Android Chrome)
  const events = ['click', 'touchstart', 'scroll', 'keydown'];
  const startHandler = () => {
     startMusicSystem();
     const opts = { capture: true };
     events.forEach(e => document.removeEventListener(e, startHandler, opts));
  };
  events.forEach(e => document.addEventListener(e, startHandler, { once: true, capture: true }));`;

if (listenersRegex.test(content)) {
    content = content.replace(listenersRegex, newListeners);
    console.log("Replaced event listeners.");
} else {
    console.error("Could not find event listeners block.");
    // Fallback: simple string replacement if regex fails due to whitespace
    const fallbackString = `document.addEventListener('click', startMusicSystem, { once: true });
  document.addEventListener('touchstart', startMusicSystem, { once: true });
  document.addEventListener('keydown', startMusicSystem, { once: true });`;
    if (content.indexOf(fallbackString) !== -1) {
        content = content.replace(fallbackString, newListeners);
        console.log("Replaced event listeners via fallback string.");
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully wrote app.js");
