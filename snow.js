"use strict";

/* ============================================================
 * Snow simulation with off-screen canvas
 *
 * - simCanvas (off-screen, fixed 1920x1080) runs the snow physics
 * - viewCanvas (on-page) just shows a scaled copy of simCanvas
 *
 * This keeps the visual density stable regardless of card size.
 * ========================================================== */

/* -----------------------------
   Simulation configuration
----------------------------- */

const SIM_WIDTH = 1920;          // fixed simulation width (simulation space)
const SIM_HEIGHT = 1080;         // fixed simulation height (simulation space)

const MAX_SNOWFLAKE_SIZE = 5;    // max radius of a snowflake in pixels
const MAX_SNOWFLAKE_SPEED = 3;   // max vertical speed of a snowflake
const FLAKE_DENSITY = 0.000157;  // density used to decide initial flake count

// All simulated snowflakes live in this array
const snowflakes = [];

// Initial number of flakes based on simulation area
let numberOfFlakes = Math.floor(SIM_WIDTH * SIM_HEIGHT * FLAKE_DENSITY);

// Animation state
let animationId = null;
let firstRender = true;

/* -----------------------------
   Canvases
----------------------------- */

// Off-screen simulation canvas (never added to the DOM)
const simCanvas = document.createElement("canvas");
simCanvas.width = SIM_WIDTH;
simCanvas.height = SIM_HEIGHT;
const simCtx = simCanvas.getContext("2d");

// Visible preview canvas (actually in the DOM)
let viewCanvas = null;
let viewCtx = null;

// Track the size of the card wrapper in CSS pixels
let cardWrapper;
let viewWidth = 0;
let viewHeight = 0;

/* -----------------------------
   DOMContentLoaded
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // The on-page canvas that shows the snow
  viewCanvas = document.getElementById("snow-canvas");
  viewCtx = viewCanvas.getContext("2d");

  // Position on top of the card without blocking pointer events
  viewCanvas.style.position = "absolute";
  viewCanvas.style.pointerEvents = "none";
  viewCanvas.style.top = "0px";
  viewCanvas.style.left = "0px";

  // Element we want to cover with snow
  cardWrapper = document.querySelector(".card-wrapper-inner");

  // Match view canvas size to the wrapper's current size
  updateViewCanvasSize();

  // Create initial set of flakes in the simulation space
  generateSnowFlakes(numberOfFlakes);

  // Kick off the animation loop
  animate();
});

/* -----------------------------
   Handle Resizing
----------------------------- */

window.addEventListener("resize", () => {
  // Stop the current animation frame loop while we resize
  cancelAnimationFrame(animationId);

  // Allow some flakes to start anywhere again on the next run
  firstRender = true;

  // Resize view canvas to match the new wrapper size
  updateViewCanvasSize();

  // Restart the animation loop
  animate();
});

/**
 * Resize the visible canvas to exactly match the card wrapper
 * while keeping the simulation canvas at a fixed resolution.
 */
function updateViewCanvasSize() {
  const rect = cardWrapper.getBoundingClientRect();
  viewWidth = rect.width;
  viewHeight = rect.height;

  viewCanvas.width = viewWidth;
  viewCanvas.height = viewHeight;
}

/* -----------------------------
   Snowflake Helpers
----------------------------- */

/**
 * Generate a very light white-ish colour with tiny random variance.
 */
const generateColour = () => {
  let r = 250 + Math.random() * 5;
  let g = 250 + Math.random() * 5;
  let b = 250 + Math.random() * 5;

  return `rgb(${r} ${g} ${b})`;
};

/**
 * Create a single snowflake in simulation space.
 * - On first render, flakes are scattered across the whole screen.
 * - After that, new flakes spawn slightly above the top edge.
 */
const createSnowflake = () => ({
  x: Math.random() * SIM_WIDTH,
  y: firstRender ? Math.random() * SIM_HEIGHT : -100,
  radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
  color: generateColour(),
  speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
  sway: (Math.random() - 0.5) * 5
});

/**
 * Fill the snowflakes array with the requested number of flakes.
 */
const generateSnowFlakes = (count) => {
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake());
  }
};

/**
 * Draw a single snowflake onto the simulation canvas.
 */
const drawSnowflake = (snowflake) => {
  simCtx.beginPath();
  simCtx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
  simCtx.fillStyle = snowflake.color;
  simCtx.fill();
  simCtx.closePath();
};

/**
 * Update a snowflake's position, and respawn it at the top
 * when it falls past the bottom of the simulation space.
 */
const updateSnowflake = (snowflake) => {
  // Fall downwards
  snowflake.y += snowflake.speed;

  // Drift sideways a bit
  snowflake.x += snowflake.sway;

  // If it drops below the simulation area, recycle it
  if (snowflake.y > SIM_HEIGHT) {
    Object.assign(snowflake, createSnowflake());
  }
};

/* -----------------------------
   Animation Loop
----------------------------- */

/**
 * Main animation loop:
 *   1) advance the snow simulation on the off-screen canvas
 *   2) draw a subtle fog/accumulation layer along the bottom
 *   3) copy the simulation canvas into the visible canvas scaled
 */
const animate = () => {
  // Schedule the next frame right away
  animationId = requestAnimationFrame(animate);

  // ---- 1. Update simulation on the off-screen canvas ----
  simCtx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

  snowflakes.forEach((flake) => {
    drawSnowflake(flake);
    updateSnowflake(flake);
  });

  if (firstRender) firstRender = false;

  // ---- 2. Draw a soft snow "fog" layer at the bottom ----
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

  // ---- 3. Render scaled output to the visible canvas ----
  viewCtx.clearRect(0, 0, viewWidth, viewHeight);
  viewCtx.drawImage(
    simCanvas,
    0, 0, SIM_WIDTH, SIM_HEIGHT,  // source rect (simulation space)
    0, 0, viewWidth, viewHeight   // dest rect (visible card size)
  );
};