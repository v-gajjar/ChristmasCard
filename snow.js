"use strict";

/* ============================================================
 * Snow simulation with off-screen canvas
 *
 * - simCanvas (off-screen, fixed 1920x1080) runs the snow physics
 * - viewCanvas (#snow-canvas, on-page) shows a scaled copy
 * - cardZoomScale scales the entire card via CSS transform
 * ========================================================== */

/* -----------------------------
   Simulation configuration
----------------------------- */

const SIM_WIDTH = 1920;
const SIM_HEIGHT = 1080;

const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 3;
const FLAKE_DENSITY = 0.000157;

const snowflakes = [];
let numberOfFlakes = Math.floor(SIM_WIDTH * SIM_HEIGHT * FLAKE_DENSITY);

let animationId = null;
let firstRender = true;

/* -----------------------------
   Whole-card zoom configuration
----------------------------- */

let cardZoomScale = 1;          // 1.0 = normal size
const CARD_ZOOM_MIN = 0.8;
const CARD_ZOOM_MAX = 1.3;
const CARD_ZOOM_STEP = 0.05;

/* -----------------------------
   Canvases
----------------------------- */

// Off-screen simulation canvas
const simCanvas = document.createElement("canvas");
simCanvas.width = SIM_WIDTH;
simCanvas.height = SIM_HEIGHT;
const simCtx = simCanvas.getContext("2d");

// Visible preview canvas
let viewCanvas = null;
let viewCtx = null;

let cardWrapper;      // .card-wrapper-inner element
let viewWidth = 0;
let viewHeight = 0;

/* -----------------------------
   DOMContentLoaded
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  viewCanvas = document.getElementById("snow-canvas");
  viewCtx = viewCanvas.getContext("2d");

  cardWrapper = document.querySelector(".card-wrapper-inner");

  // Ensure canvas covers the card
  updateViewCanvasSize();

  generateSnowFlakes(numberOfFlakes);
  setupCardZoomControls();
  animate();
});

/* -----------------------------
   Handle Resizing
----------------------------- */

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationId);
  firstRender = true;
  updateViewCanvasSize();
  animate();
});

function updateViewCanvasSize() {
  const rect = cardWrapper.getBoundingClientRect();
  viewWidth = rect.width;
  viewHeight = rect.height;

  viewCanvas.width = viewWidth;
  viewCanvas.height = viewHeight;
}

/* -----------------------------
   Snowflake helpers
----------------------------- */

const generateColour = () => {
  let r = 250 + Math.random() * 5;
  let g = 250 + Math.random() * 5;
  let b = 250 + Math.random() * 5;

  return `rgb(${r} ${g} ${b})`;
};

const createSnowflake = () => ({
  x: Math.random() * SIM_WIDTH,
  y: firstRender ? Math.random() * SIM_HEIGHT : -100,
  radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
  color: generateColour(),
  speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
  sway: (Math.random() - 0.5) * 5
});

const generateSnowFlakes = (count) => {
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake());
  }
};

const drawSnowflake = (snowflake) => {
  simCtx.beginPath();
  simCtx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
  simCtx.fillStyle = snowflake.color;
  simCtx.fill();
  simCtx.closePath();
};

const updateSnowflake = (snowflake) => {
  snowflake.y += snowflake.speed;
  snowflake.x += snowflake.sway;

  if (snowflake.y > SIM_HEIGHT) {
    Object.assign(snowflake, createSnowflake());
  }
};

/* -----------------------------
   Card zoom controls
----------------------------- */

function setupCardZoomControls() {
  const zoomInBtn = document.getElementById("card-zoom-in");
  const zoomOutBtn = document.getElementById("card-zoom-out");

  if (zoomInBtn && zoomOutBtn) {
    zoomInBtn.addEventListener("click", () => {
      setCardZoom(cardZoomScale + CARD_ZOOM_STEP);
    });

    zoomOutBtn.addEventListener("click", () => {
      setCardZoom(cardZoomScale - CARD_ZOOM_STEP);
    });
  }

  // Optional keyboard shortcuts: + / -
  document.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") {
      setCardZoom(cardZoomScale + CARD_ZOOM_STEP);
    }
    if (event.key === "-") {
      setCardZoom(cardZoomScale - CARD_ZOOM_STEP);
    }
  });

  // Expose for devtools if you want:
  window.setCardZoom = setCardZoom;
}

function setCardZoom(value) {
  cardZoomScale = Math.max(CARD_ZOOM_MIN, Math.min(CARD_ZOOM_MAX, value));
  cardWrapper.style.transform = `scale(${cardZoomScale})`;
}

/* -----------------------------
   Animation loop
----------------------------- */

const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 1. Update simulation on off-screen canvas
  simCtx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

  snowflakes.forEach((flake) => {
    drawSnowflake(flake);
    updateSnowflake(flake);
  });

  if (firstRender) firstRender = false;

  // 2. Soft fog at bottom
  const fogHeight = SIM_HEIGHT * 0.25;
  const grad = simCtx.createLinearGradient(
    0,
    SIM_HEIGHT - fogHeight,
    0,
    SIM_HEIGHT
  );
  grad.addColorStop(0, "rgba(255, 255, 255, 0)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0.45)");
  simCtx.fillStyle = grad;
  simCtx.fillRect(0, SIM_HEIGHT - fogHeight, SIM_WIDTH, fogHeight);

  // 3. Draw simulation into visible canvas
  viewCtx.clearRect(0, 0, viewWidth, viewHeight);
  viewCtx.drawImage(
    simCanvas,
    0, 0, SIM_WIDTH, SIM_HEIGHT,
    0, 0, viewWidth, viewHeight
  );
};