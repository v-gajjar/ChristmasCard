const NUMBER_OF_SNOWFLAKES = 300;
const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 3;
const SNOWFLAKE_COLOUR = "#ddd";
const snowflakes = [];

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

const canvas = document.createElement("canvas");

canvas.style.position = "absolute";
canvas.style.pointerEvents = "none";
canvas.style.top = "0px";
canvas.style.left = "0px";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let firstRender = true;
let ctx;

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(canvas);

  ctx = canvas.getContext("2d");

  generateSnowFlakes();
  animate();
});

const generateSnowFlakes = () => {
  for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snowflakes.forEach((snowflake) => {
    drawSnowflake(snowflake);
    updateSnowflake(snowflake);
  });
  if (firstRender) firstRender = false;

  requestAnimationFrame(animate);
};
