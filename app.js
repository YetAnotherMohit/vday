/* ============================================
   PARDESH SE PYAAR — Valentine's Day Scrapbook
   Main Application JavaScript
   ============================================ */

(function () {
  'use strict';

  // ===== DOM ELEMENTS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const preloader = $('#preloader');
  const scenes = $$('.scene');
  const nameInput = $('#nameInput');
  const enterBtn = $('#enterBtn');
  const errorMsg = $('#errorMsg');
  const typewriterText = $('#typewriterText');

  // Scene 2
  const ribbon = $('#ribbon');
  const ribbonInstruction = $('#ribbonInstruction');
  const envelopeFlap = $('#envelopeFlap');
  const envelopeLetter = $('#envelopeLetter');
  const sparkleContainer = $('#sparkleContainer');

  // Scene 3
  const toScene4Btn = $('#toScene4Btn');

  // Scene 4
  const scratchCanvas = $('#scratchCanvas');
  const toScene5Btn = $('#toScene5Btn');
  const bloomingSunflowers = $('#bloomingSunflowers');

  // Scene 5
  const confettiCanvas = $('#confettiCanvas');
  const toFinalBtn = $('#toFinalBtn');

  // Final
  const floatingHearts = $('#floatingHearts');

  // Music
  const musicToggle = $('#musicToggle');

  // ===== STATE =====
  let currentScene = 1;
  let ribbonDragStart = null;
  let ribbonDragging = false;
  let scratchCtx = null;
  let scratchStarted = false;
  let scratchPercent = 0;
  let confettiCtx = null;
  let confettiPieces = [];
  let confettiAnimating = false;

  // ===== INITIALIZATION =====
  function init() {
    document.body.classList.add('no-scroll');

    // Hide preloader after fonts load
    setTimeout(() => {
      preloader.classList.add('hidden');
      startTypewriter();
    }, 2000);

    // Event listeners
    enterBtn.addEventListener('click', handleNameSubmit);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleNameSubmit();
    });

    // Ribbon drag
    setupRibbonDrag();

    // Scene 3 button
    toScene4Btn.addEventListener('click', () => goToScene(4));

    // Scene 4 scratch
    setupScratchCard();

    // Scene 4 button
    toScene5Btn.addEventListener('click', () => goToScene(5));

    // Scene 5 button
    toFinalBtn.addEventListener('click', () => goToScene('final'));

    // Music toggle
    musicToggle.addEventListener('click', toggleMusic);

    // Floating hearts for final page
    createFloatingHearts();
  }

  // ===== TYPEWRITER =====
  const dialogues = [
    'Kuch kuch hota hai...',
    'Naam toh suna hoga?',
    'Agar kisi cheez ko dil se chaho...',
    'Jab tak hai jaan...',
    'Pyaar dosti hai...',
    'Duniya mein kitni hai nafratein...',
    'Hum ek baar jeete hain...',
  ];
  let dialogueIndex = 0;

  function startTypewriter() {
    typeNextDialogue();
  }

  function typeNextDialogue() {
    const text = dialogues[dialogueIndex];
    let i = 0;
    typewriterText.textContent = '';

    const typeInterval = setInterval(() => {
      typewriterText.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length) {
        clearInterval(typeInterval);
        // Pause, then erase and type next
        setTimeout(() => {
          eraseText();
        }, 2000);
      }
    }, 70);
  }

  function eraseText() {
    const text = typewriterText.textContent;
    let i = text.length;
    const eraseInterval = setInterval(() => {
      typewriterText.textContent = text.slice(0, i - 1);
      i--;
      if (i <= 0) {
        clearInterval(eraseInterval);
        dialogueIndex = (dialogueIndex + 1) % dialogues.length;
        setTimeout(() => typeNextDialogue(), 400);
      }
    }, 35);
  }

  // ===== SCENE TRANSITIONS =====
  function goToScene(num) {
    // Deactivate all scenes
    scenes.forEach((s) => s.classList.remove('active'));

    let targetId;
    if (num === 'final') {
      targetId = 'sceneFinal';
    } else {
      targetId = `scene${num}`;
    }

    const target = $(`#${targetId}`);
    if (target) {
      target.classList.add('active');
      currentScene = num;

      // Scene-specific init
      if (num === 4) initScratchCanvas();
      if (num === 5) startCelebration();
      if (num === 'final') startFinalPage();
    }
  }

  // ===== SCENE 1: NAME GATE =====
  function handleNameSubmit() {
    const name = nameInput.value.trim().toUpperCase();
    if (name === 'AMAN') {
      errorMsg.textContent = '';
      nameInput.style.borderColor = 'var(--gold)';

      // Success animation
      enterBtn.style.transform = 'rotate(0deg) scale(1.2)';
      setTimeout(() => {
        goToScene(2);
      }, 600);
    } else if (name === '') {
      errorMsg.textContent = 'Naam toh likho... 😅';
      nameInput.classList.add('shake');
      setTimeout(() => nameInput.classList.remove('shake'), 500);
    } else {
      const responses = [
        `"${nameInput.value}"? Yeh koi naam hai? 😤`,
        'Sirf AMAN ke liye hai yeh! 💛',
        'Galat naam! Try again... 🌻',
        'Arre yaar, AMAN likho! 😂',
        'Naam galat hai, pyaar sahi hai ❤️',
      ];
      errorMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
      nameInput.classList.add('shake');
      setTimeout(() => nameInput.classList.remove('shake'), 500);
    }
  }

  // ===== SCENE 2: RIBBON DRAG =====
  function setupRibbonDrag() {
    let startY = 0;
    let totalDrag = 0;

    const onStart = (e) => {
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      startY = touch.clientY;
      ribbonDragging = true;
      ribbon.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!ribbonDragging) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const dy = startY - touch.clientY;

      if (dy > 0) {
        totalDrag = dy;
        ribbon.style.transform = `translateY(${-dy * 0.5}px) scale(${1 - dy * 0.002})`;

        // Sparkles
        createSparkle(touch.clientX, touch.clientY);
      }

      if (totalDrag > 120) {
        ribbonDragging = false;
        untieRibbon();
      }
    };

    const onEnd = () => {
      if (!ribbonDragging) return;
      ribbonDragging = false;
      if (totalDrag < 120) {
        ribbon.style.transition = 'transform 0.3s ease';
        ribbon.style.transform = '';
        totalDrag = 0;
      }
    };

    ribbon.addEventListener('mousedown', onStart);
    ribbon.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${x + (Math.random() - 0.5) * 40}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 40}px`;
    sparkle.style.width = `${4 + Math.random() * 8}px`;
    sparkle.style.height = sparkle.style.width;

    const colors = ['#F4C430', '#FFE066', '#D4A527', '#FFD700', '#FFF'];
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

    sparkleContainer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  function untieRibbon() {
    ribbon.classList.add('untied');
    ribbonInstruction.style.display = 'none';

    // Create burst of sparkles
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const rect = ribbon.getBoundingClientRect();
        createSparkle(
          rect.left + Math.random() * rect.width,
          rect.top + Math.random() * rect.height
        );
      }, i * 30);
    }

    // Open envelope
    setTimeout(() => {
      envelopeFlap.classList.add('open');
    }, 400);

    setTimeout(() => {
      envelopeLetter.classList.add('emerge');
    }, 800);

    // Move to scene 3 after letter emerges
    setTimeout(() => {
      goToScene(3);
    }, 2500);
  }

  // ===== SCENE 4: SCRATCH CARD =====
  function setupScratchCard() {
    // Will be initialized when scene becomes active
  }

  function initScratchCanvas() {
    if (scratchStarted) return;
    scratchStarted = true;

    const canvas = scratchCanvas;
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    scratchCtx = canvas.getContext('2d');

    // Draw golden glitter overlay
    drawGlitterOverlay();

    // Touch/Mouse scratch
    let scratching = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const startScratch = (e) => {
      e.preventDefault();
      scratching = true;
      scratchCtx.globalCompositeOperation = 'destination-out';
    };

    const doScratch = (e) => {
      if (!scratching) return;
      e.preventDefault();
      const pos = getPos(e);

      scratchCtx.beginPath();
      scratchCtx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
      scratchCtx.fill();

      checkScratchProgress();
    };

    const endScratch = () => {
      scratching = false;
    };

    canvas.addEventListener('mousedown', startScratch);
    canvas.addEventListener('touchstart', startScratch, { passive: false });
    canvas.addEventListener('mousemove', doScratch);
    canvas.addEventListener('touchmove', doScratch, { passive: false });
    canvas.addEventListener('mouseup', endScratch);
    canvas.addEventListener('touchend', endScratch);
  }

  function drawGlitterOverlay() {
    const ctx = scratchCtx;
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    // Base gold
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#D4A527');
    gradient.addColorStop(0.3, '#F4C430');
    gradient.addColorStop(0.5, '#FFE066');
    gradient.addColorStop(0.7, '#F4C430');
    gradient.addColorStop(1, '#D4A527');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Glitter particles
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.6 + 0.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }

    // "Scratch here" text
    ctx.fillStyle = 'rgba(139, 100, 0, 0.5)';
    ctx.font = '600 22px "Caveat", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Yahaan scratch karo! ✨', w / 2, h / 2);
  }

  function checkScratchProgress() {
    const imageData = scratchCtx.getImageData(
      0, 0, scratchCanvas.width, scratchCanvas.height
    );
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    scratchPercent = (transparent / total) * 100;

    if (scratchPercent > 40) {
      // Reveal complete!
      bloomingSunflowers.classList.add('active');

      // Clear remaining overlay
      scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);

      // Show Mohabbatein quote
      const scratchQuote = $('#scratchQuote');
      if (scratchQuote) {
        scratchQuote.style.display = 'block';
      }

      // Show next button
      toScene5Btn.style.display = 'block';
      toScene5Btn.classList.add('fade-in');
    }
  }

  // ===== SCENE 5: CELEBRATION =====
  function startCelebration() {
    initConfetti();

    // Vibration
    if (navigator.vibrate) {
      // Heartbeat pattern
      const pattern = [100, 50, 100, 200, 100, 50, 100];
      navigator.vibrate(pattern);
      setInterval(() => navigator.vibrate(pattern), 1500);
    }
  }

  function initConfetti() {
    const canvas = confettiCanvas;
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    confettiCtx = canvas.getContext('2d');

    // Create confetti pieces
    const emojis = ['🌹', '❤️', '💛', '🌻', '✨', '💕', '🎉', '💐'];
    const colors = ['#E8547C', '#F4C430', '#FFE066', '#FF6B9D', '#C94040', '#D4A527'];

    for (let i = 0; i < 80; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        speedY: 1.5 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: Math.random() > 0.5 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
        opacity: 0.7 + Math.random() * 0.3,
        wobble: Math.random() * 10,
      });
    }

    confettiAnimating = true;
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiAnimating) return;
    const ctx = confettiCtx;
    const w = confettiCanvas.width;
    const h = confettiCanvas.height;

    ctx.clearRect(0, 0, w, h);

    confettiPieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.wobble) * 0.5;
      p.rotation += p.rotSpeed;
      p.wobble += 0.05;

      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.emoji) {
        ctx.font = `${p.w + 8}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    });

    requestAnimationFrame(animateConfetti);
  }

  // ===== FINAL PAGE =====
  function startFinalPage() {
    confettiAnimating = false; // Stop confetti
  }

  function createFloatingHearts() {
    const hearts = ['❤️', '💛', '🌻', '💕', '✨', '💐'];
    for (let i = 0; i < 15; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 6}s`;
      heart.style.animationDuration = `${4 + Math.random() * 4}s`;
      heart.style.fontSize = `${14 + Math.random() * 20}px`;
      floatingHearts.appendChild(heart);
    }
  }

  // ===== MUSIC =====
  let audioCtx = null;
  let musicPlaying = false;

  function toggleMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (musicPlaying) {
      musicPlaying = false;
      musicToggle.classList.remove('playing');
      musicToggle.textContent = '🎵';
    } else {
      musicPlaying = true;
      musicToggle.classList.add('playing');
      musicToggle.textContent = '🎶';
      playMelody();
    }
  }

  function playMelody() {
    if (!musicPlaying || !audioCtx) return;

    // Simple romantic melody using Web Audio API
    const notes = [
      { freq: 523.25, dur: 0.4 }, // C5
      { freq: 587.33, dur: 0.4 }, // D5
      { freq: 659.25, dur: 0.6 }, // E5
      { freq: 587.33, dur: 0.4 }, // D5
      { freq: 523.25, dur: 0.6 }, // C5
      { freq: 493.88, dur: 0.4 }, // B4
      { freq: 523.25, dur: 0.8 }, // C5
      { freq: 0, dur: 0.4 },      // rest
      { freq: 659.25, dur: 0.4 }, // E5
      { freq: 698.46, dur: 0.4 }, // F5
      { freq: 783.99, dur: 0.6 }, // G5
      { freq: 698.46, dur: 0.4 }, // F5
      { freq: 659.25, dur: 0.6 }, // E5
      { freq: 587.33, dur: 0.4 }, // D5
      { freq: 523.25, dur: 0.8 }, // C5
    ];

    let time = audioCtx.currentTime;
    notes.forEach((note) => {
      if (note.freq === 0) {
        time += note.dur;
        return;
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + note.dur);
      time += note.dur;
    });

    // Loop
    const totalDuration = notes.reduce((sum, n) => sum + n.dur, 0);
    setTimeout(() => {
      if (musicPlaying) playMelody();
    }, totalDuration * 1000 + 500);
  }

  // ===== LAUNCH =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
