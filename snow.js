const NUMBER_OF_SNOWFLAKES = 300;
const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 3;
const SNOWFLAKE_COLOUR = "#ddd";
const snowflakes = [];


let animationId = null;
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let canvas = null

let firstRender = true;
let ctx;

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("snow-canvas");
  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none";
  canvas.style.top = "0px";
  canvas.style.left = "0px";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext("2d");

  generateSnowFlakes();
  animate();
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationId);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  const removedCount = removeOutOfBoundSnowflakes();
  generateSnowFlakes(removedCount);
  animate();
});

const removeOutOfBoundSnowflakes = () => {
  let removedCount = 0;
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const snowflake = snowflakes[i];
    if (snowflake.x > canvas.width || snowflake.y > canvas.height) {
      snowflakes.splice(i, 1);
      removedCount++;
    }
  }
  return removedCount;
}

const generateSnowFlakes = (count = NUMBER_OF_SNOWFLAKES) => {
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake());
  }
}

const generateColour = () => {
  let r = 250 + Math.random() * 5;
  let g = 250 + Math.random() * 5;
  let b = 250 + Math.random() * 5;

  return `rgb(${r} ${b} ${g})`;
};

const createSnowflake = () => ({
  x: Math.random() * canvas.width,
  y: firstRender ? Math.random() * canvas.height : -100,
  radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
  color: generateColour(),
  speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
  sway: (Math.random() - 0.5) * 5, // next
});

const drawSnowflake = (snowflake) => {
  ctx.beginPath();
  ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
  ctx.fillStyle = snowflake.color;
  ctx.fill();
  ctx.closePath();
};

const updateSnowflake = (snowflake) => {
  snowflake.y += snowflake.speed;
  snowflake.x += snowflake.sway;

  if (snowflake.y > canvas.height) {
    Object.assign(snowflake, createSnowflake());
  }
};

const animate = () => {

  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snowflakes.forEach((snowflake) => {
    drawSnowflake(snowflake);
    updateSnowflake(snowflake);
  });
  if (firstRender) firstRender = false;

  
};
