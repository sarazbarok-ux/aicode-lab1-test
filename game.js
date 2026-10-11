const arena = document.querySelector('#arena');
const ball = document.querySelector('#ball');
const scoreDisplay = document.querySelector('#score');
const timerDisplay = document.querySelector('#timer');
const timeBar = document.querySelector('#time-bar');
const overlay = document.querySelector('#overlay');
const title = document.querySelector('#message-title');
const message = document.querySelector('#message');
const startButton = document.querySelector('#start');
const announcement = document.querySelector('#announcement');
const duration = 30000;
let score = 0;
let running = false;
let deadline = 0;
let previousTime = 0;
let frame = 0;
let x = 0;
let y = 0;
let vx = 140;
let vy = 110;

function bounds() {
  return { width: Math.max(0, arena.clientWidth - ball.offsetWidth), height: Math.max(0, arena.clientHeight - ball.offsetHeight) };
}

function placeBall() {
  const { width, height } = bounds();
  x = Math.random() * width;
  y = Math.random() * height;
  ball.style.transform = `translate(${x}px, ${y}px)`;
}

function endGame() {
  running = false;
  cancelAnimationFrame(frame);
  ball.hidden = true;
  timerDisplay.textContent = '0';
  timeBar.style.transform = 'scaleX(0)';
  title.textContent = 'Time’s up!';
  message.textContent = `You caught ${score} ${score === 1 ? 'ball' : 'balls'}. ${score >= 20 ? 'You’re a pop superstar! ✦' : 'Ready to beat your score?'}`;
  startButton.textContent = 'Play again →';
  overlay.hidden = false;
  announcement.textContent = `Round finished. Your score is ${score}.`;
  startButton.focus({ preventScroll: true });
}

function animate(now) {
  if (!running) return;
  const remaining = Math.max(0, deadline - now);
  if (!remaining) { endGame(); return; }
  timerDisplay.textContent = Math.ceil(remaining / 1000);
  timeBar.style.transform = `scaleX(${remaining / duration})`;
  timeBar.style.background = remaining < 10000 ? '#ffbd59' : '#89eed6';
  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;
  const { width, height } = bounds();
  x += vx * delta;
  y += vy * delta;
  if (x <= 0 || x >= width) { vx *= -1; x = Math.max(0, Math.min(x, width)); }
  if (y <= 0 || y >= height) { vy *= -1; y = Math.max(0, Math.min(y, height)); }
  ball.style.transform = `translate(${x}px, ${y}px)`;
  frame = requestAnimationFrame(animate);
}

function startGame() {
  cancelAnimationFrame(frame);
  arena.querySelectorAll('.pop').forEach(pop => pop.remove());
  score = 0;
  scoreDisplay.textContent = '0';
  timerDisplay.textContent = '30';
  timeBar.style.transform = 'scaleX(1)';
  timeBar.style.background = '#89eed6';
  overlay.hidden = true;
  ball.hidden = false;
  running = true;
  vx = 140 * (Math.random() < 0.5 ? -1 : 1);
  vy = 110 * (Math.random() < 0.5 ? -1 : 1);
  placeBall();
  previousTime = performance.now();
  deadline = previousTime + duration;
  announcement.textContent = 'Round started. You have 30 seconds.';
  frame = requestAnimationFrame(animate);
}

ball.addEventListener('click', () => {
  if (!running) return;
  if (performance.now() >= deadline) { endGame(); return; }
  scoreDisplay.textContent = ++score;
  const pop = document.createElement('span');
  pop.className = 'pop';
  pop.textContent = '+1';
  pop.style.left = `${x + 20}px`;
  pop.style.top = `${y}px`;
  pop.setAttribute('aria-hidden', 'true');
  arena.append(pop);
  setTimeout(() => pop.remove(), 650);
  placeBall();
});
startButton.addEventListener('click', startGame);
document.querySelector('#restart').addEventListener('click', startGame);
document.addEventListener('visibilitychange', () => {
  if (running && performance.now() >= deadline) endGame();
});
