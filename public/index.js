let time = 5 * 60 * 1000;
let remainingTime = null;
let startTime = null;
let timerId = null;
let isCountdownTimer = true;
const maxMinutes = 10000000;

let targetDate = null;

const internalButton = document.getElementById("internal-button");
const externalButton = document.getElementById("external-button");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const setupButton = document.getElementById("setup-button");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let backgroundImage;
let largeImage = new Array();
let mediumImage = new Array();

const updateTimeText = (time) => {
  const totalSeconds = Math.floor(time / 1000);
  const d = Math.floor(totalSeconds / (3600 * 24));
  const h = Math.floor(totalSeconds / 3600) % 24;
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ms = time % 1000;

  const formattedD = `0${d}`.slice(-3);
  const formattedH = `0${h}`.slice(-2);
  const formattedM = `0${m}`.slice(-2);
  const formattedS = `0${s}`.slice(-2);
  const formattedMs = `00${ms}`.slice(-3).slice(0, 2);

  setTimer(formattedD, formattedH, formattedM, formattedS, formattedMs);
};

const getTargetDate = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const daytime = urlParams.get("daytime");
  if (!daytime || daytime.length !== 12) return null;

  const year = parseInt(daytime.substring(0, 4));
  const month = parseInt(daytime.substring(4, 6)) - 1;
  const day = parseInt(daytime.substring(6, 8));
  const hour = parseInt(daytime.substring(8, 10));
  const minute = parseInt(daytime.substring(10, 12));

  return new Date(year, month, day, hour, minute);
};

const setTimer = (d, h, m, s, ms) => {
  document.getElementById("hour").textContent = h;
  document.getElementById("minute").textContent = m;
  document.getElementById("second").textContent = s;
  document.getElementById("millisecond").textContent = ms;
  context.drawImage(backgroundImage, 0, 0);
  context.font = "140px '7segment'";
  context.fillStyle = "#f0c400";
  context.fillText(parseInt(d / 100), 270, 300);
  context.fillText(parseInt(d / 10), 335, 300);
  context.fillText(d % 10, 400, 300);
  context.fillText(parseInt(h / 10), 530, 300);
  context.fillText(h % 10, 591, 300);
  context.drawImage(largeImage[parseInt(m / 10)], 274, 316);
  context.drawImage(largeImage[m % 10], 391, 316);
  context.drawImage(largeImage[parseInt(s / 10)], 538, 316);
  context.drawImage(largeImage[s % 10], 655, 316);
  context.drawImage(mediumImage[parseInt(ms / 10)], 790, 381);
  context.drawImage(mediumImage[ms % 10], 878, 381);
};

const update = () => {
  timerId = setTimeout(() => {
    const now = Date.now();
    remainingTime = targetDate.getTime() - now;

    if (remainingTime > 0) {
      updateTimeText(remainingTime);
      update();
    } else {
      remainingTime = 0;
      updateTimeText(remainingTime);
    }
  }, 10);
};

const internalAction = () => {
  isCountdownTimer = true;
  resetAction();
  internalButton.classList.remove("disabled");
  externalButton.classList.add("disabled");
  setupButton.classList.add("active-control");
};

const externalAction = () => {
  isCountdownTimer = false;
  resetAction();
  externalButton.classList.remove("disabled");
  internalButton.classList.add("disabled");
  setupButton.classList.remove("active-control");
};

const startAction = () => {
  if (timerId !== null || !targetDate) return;
  update();
  startButton.classList.remove("active-control");
  stopButton.classList.add("active-control");
};

const stopAction = () => {
  if (timerId === null) return;
  clearTimeout(timerId);
  timerId = null;
  stopButton.classList.remove("active-control");
  startButton.classList.add("active-control");
};

const resetAction = () => {
  if (!targetDate) return;
  remainingTime = targetDate.getTime() - Date.now();
  updateTimeText(remainingTime);
};

const setupAction = () => {
  if (!isCountdownTimer) return;

  time += 1 * 60 * 1000;
  time %= maxMinutes * 60 * 1000;

  resetAction();
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);
    image.src = src;
  });

(async () => {
  stopButton.addEventListener("click", stopAction);
  resetButton.addEventListener("click", resetAction);

  const urlParams = new URLSearchParams(window.location.search);
  const titlevalue = urlParams.get("title");
  document.getElementById("title").textContent = titlevalue;

  backgroundImage = await loadImage("./img/background.png");
  for (let i = 0; i < 10; i++) {
    largeImage.push(await loadImage("./img/large/" + i + ".png"));
    mediumImage.push(await loadImage("./img/medium/" + i + ".png"));
  }

  targetDate = getTargetDate();
  if (targetDate) {
    resetAction();
    startAction();
  }
})();
