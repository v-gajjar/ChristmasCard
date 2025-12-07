const MAX_SNOWFLAKE_SIZE = 5;
const MAX_SNOWFLAKE_SPEED = 3;
const SNOWFLAKE_COLOUR = "#ddd";

const FLAKE_DENSITY = 0.000157;

const snowflakes = [];

let animationId = null;

let canvas = null

let firstRender = true;
let ctx;

let cardWrapper;
let width = 0;
let height = 0;

let numberOfFlakes = Math.floor(width * height * FLAKE_DENSITY);


document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("snow-canvas");
  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none";
  canvas.style.top = "0px";
  canvas.style.left = "0px";

  cardWrapper = document.querySelector(".card-wrapper-inner");
  width = cardWrapper.getBoundingClientRect().width;
  height = cardWrapper.getBoundingClientRect().height;

  numberOfFlakes = Math.floor(width * height * FLAKE_DENSITY);

  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext("2d");

  generateSnowFlakes(numberOfFlakes);
  animate();
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationId);

  firstRender = true;

  let cardWrapper = document.querySelector(".card-wrapper-inner");
  width = cardWrapper.getBoundingClientRect().width;
  height = cardWrapper.getBoundingClientRect().height;

  canvas.width = width;
  canvas.height = height;

  removeOutOfBoundSnowflakes();
  const updatedNumberOfFlakes = Math.floor(width * height * FLAKE_DENSITY);

  if ( snowflakes.length < updatedNumberOfFlakes  ) {
    generateSnowFlakes(updatedNumberOfFlakes - snowflakes.length);
  } else if ( snowflakes.length > updatedNumberOfFlakes ) {
    snowflakes.splice(0, snowflakes.length - updatedNumberOfFlakes);
  }

  animate();
});

const removeOutOfBoundSnowflakes = () => {
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    const snowflake = snowflakes[i];
    if (snowflake.x > canvas.width || snowflake.y > canvas.height) {
      snowflakes.splice(i, 1);
    }
  }
}

const generateSnowFlakes = (count = numberOfFlakes) => {
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
