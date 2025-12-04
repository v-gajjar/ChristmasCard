"use strict";

/* ----------------- Snow config (on-page) ----------------- */

const NUMBER_OF_SNOWFLAKES = 300;
const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 3;

const snowflakes = [];
let canvas;
let ctx;
let firstRender = true;
let animationId = null;
let logicalWidth = window.innerWidth;
let logicalHeight = window.innerHeight;
let snowSpeedMultiplier = 1;

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----------------- On-page snow helpers ----------------- */

function createCanvas() {
  canvas = document.createElement("canvas");

  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.zIndex = "1"; // behind controls & card

  document.body.appendChild(canvas);

  ctx = canvas.getContext("2d");
}

function scaleCanvasForDPR() {
  const dpr = window.devicePixelRatio || 1;

  logicalWidth = window.innerWidth;
  logicalHeight = window.innerHeight;

  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  // Work in CSS pixels, draw in device pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function generateColour() {
  const r = 250 + Math.random() * 5;
  const g = 250 + Math.random() * 5;
  const b = 250 + Math.random() * 5;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function createSnowflake() {
  return {
    x: Math.random() * logicalWidth,
    y: firstRender ? Math.random() * logicalHeight : -100,
    radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
    color: generateColour(),
    speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
    sway: (Math.random() - 0.5) * 2.5, // subtle horizontal drift
  };
}

function generateSnowFlakes() {
  snowflakes.length = 0;
  for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
    snowflakes.push(createSnowflake());
  }
}

function drawSnowflake(snowflake) {
  ctx.beginPath();
  ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
  ctx.fillStyle = snowflake.color;
  ctx.fill();
  ctx.closePath();
}

function updateSnowflake(snowflake) {
  snowflake.y += snowflake.speed * snowSpeedMultiplier;
  snowflake.x += snowflake.sway;

  // Wrap horizontally
  if (snowflake.x < 0) snowflake.x = logicalWidth;
  if (snowflake.x > logicalWidth) snowflake.x = 0;

  // Respawn at top when leaving bottom
  if (snowflake.y > logicalHeight) {
    const fresh = createSnowflake();
    fresh.y = -50;
    Object.assign(snowflake, fresh);
  }
}

function animate() {
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  snowflakes.forEach((snowflake) => {
    drawSnowflake(snowflake);
    updateSnowflake(snowflake);
  });

  if (firstRender) firstRender = false;

  animationId = requestAnimationFrame(animate);
}

function onResize() {
  if (!canvas || !ctx) return;
  scaleCanvasForDPR();
}

/* ----------------- Video recording: card + snow ----------------- */

/**
 * Record a short WebM video of the #card element with animated snow drawn
 * on top in an offscreen canvas.
 */
async function recordCardWithSnow(durationMs = 5000, fps = 30) {
  const card = document.getElementById("card");

  if (!card) {
    alert("Card element not found.");
    return null;
  }

  if (!window.html2canvas) {
    alert("html2canvas not loaded.");
    return null;
  }

  // Take a static snapshot of the card as our background
  const cardSnapshot = await html2canvas(card, { useCORS: true });
  const width = cardSnapshot.width;
  const height = cardSnapshot.height;

  // Offscreen canvas that we will record
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const ctxOff = offscreen.getContext("2d");

  // Local snowflake system (independent of the main page snow)
  const flakes = [];
  const FLAKE_COUNT = 200;
  const MAX_SIZE = 5;
  const MAX_SPEED = 3;

  function createFlake() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * MAX_SIZE + 1,
      s: Math.random() * MAX_SPEED + 0.5,
      sway: (Math.random() - 0.5) * 2.5,
      color: "white",
    };
  }

  for (let i = 0; i < FLAKE_COUNT; i++) {
    flakes.push(createFlake());
  }

  function drawFrame() {
    // Draw card snapshot as background
    ctxOff.clearRect(0, 0, width, height);
    ctxOff.drawImage(cardSnapshot, 0, 0);

    // Draw snow
    flakes.forEach((f) => {
      ctxOff.beginPath();
      ctxOff.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctxOff.fillStyle = f.color;
      ctxOff.fill();
      ctxOff.closePath();

      f.y += f.s;
      f.x += f.sway;

      if (f.x < 0) f.x = width;
      if (f.x > width) f.x = 0;
      if (f.y > height) {
        const fresh = createFlake();
        fresh.y = -20;
        Object.assign(f, fresh);
      }
    });
  }

  const stream = offscreen.captureStream(fps);

  let options = { mimeType: "video/webm;codecs=vp9" };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options = { mimeType: "video/webm;codecs=vp8" };
  }

  let recorder;
  try {
    recorder = new MediaRecorder(stream, options);
  } catch (err) {
    console.error("Failed to create MediaRecorder", err);
    alert("Video recording is not supported in this browser.");
    return null;
  }

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopPromise = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  recorder.start();

  // Drive our animation while we are recording
  const frameInterval = 1000 / fps;
  let recording = true;

  function loop() {
    if (!recording) return;
    drawFrame();
    setTimeout(loop, frameInterval);
  }
  loop();

  setTimeout(() => {
    recording = false;
    recorder.stop();
  }, durationMs);

  await stopPromise;

  return new Blob(chunks, { type: "video/webm" });
}

/* ----------------- Controls ----------------- */

function initControls() {
  const nameInput = document.getElementById("nameInput");
  const fromSpan = document.querySelector("#from span");
  const borderSelect = document.getElementById("borderSelect");
  const card = document.getElementById("card");
  const speedSlider = document.getElementById("snowSpeed");
  const speedValue = document.getElementById("snowSpeedValue");
  const downloadPngBtn = document.getElementById("downloadPng");
  const downloadVideoBtn = document.getElementById("downloadVideo");
  const controls = document.getElementById("controls");

  // Name -> "From ..." line
  if (nameInput && fromSpan) {
    nameInput.addEventListener("input", (e) => {
      const name = e.target.value.trim();
      fromSpan.textContent = name ? `From ${name}` : "From Nick";
    });
  }

  // Border selector
  if (borderSelect && card) {
    card.classList.add(borderSelect.value);

    borderSelect.addEventListener("change", (e) => {
      card.classList.remove("border-none", "border-gold", "border-holly");
      card.classList.add(e.target.value);
    });
  }

  // Snow speed
  if (speedSlider && speedValue) {
    snowSpeedMultiplier = parseFloat(speedSlider.value) || 1;
    speedValue.textContent = `${snowSpeedMultiplier.toFixed(1)}x`;

    speedSlider.addEventListener("input", (e) => {
      snowSpeedMultiplier = parseFloat(e.target.value) || 1;
      speedValue.textContent = `${snowSpeedMultiplier.toFixed(1)}x`;
    });
  }

  // Download PNG of the card
  if (downloadPngBtn && card) {
    downloadPngBtn.addEventListener("click", async () => {
      if (!window.html2canvas) {
        alert("html2canvas not loaded.");
        return;
      }

      if (controls) controls.style.visibility = "hidden";

      const canvasSnapshot = await html2canvas(card, { useCORS: true });

      if (controls) controls.style.visibility = "visible";

      const link = document.createElement("a");
      link.download = "christmas-card.png";
      link.href = canvasSnapshot.toDataURL("image/png");
      link.click();
    });
  }

  // Download WebM video of card + snow
  if (downloadVideoBtn) {
    downloadVideoBtn.addEventListener("click", async () => {
      downloadVideoBtn.disabled = true;
      const originalText = downloadVideoBtn.textContent;
      downloadVideoBtn.textContent = "Rendering...";

      try {
        const blob = await recordCardWithSnow(5000, 30); // 5 seconds @ 30 FPS
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "christmas-card.webm";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error(err);
        alert("Failed to create video (see console).");
      } finally {
        downloadVideoBtn.disabled = false;
        downloadVideoBtn.textContent = originalText;
      }
    });
  }
}

/* ----------------- Snow init ----------------- */

function initSnow() {
  if (prefersReducedMotion) {
    console.log("Prefers reduced motion: snow disabled.");
    return;
  }

  createCanvas();
  scaleCanvasForDPR();
  generateSnowFlakes();
  animate();

  window.addEventListener("resize", onResize);
}

/* ----------------- Entry point ----------------- */

document.addEventListener("DOMContentLoaded", () => {
  initControls();
  initSnow();
});