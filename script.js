// ===== CONSTANTS =====
const INITIAL_COUNTDOWN = 24;
const STORAGE_KEY = 'basketballScoreboard';

// ===== GAME STATE =====
let gameState = {
  teams: {
    A: { score: 0, fouls: 0, name: 'Time A' },
    B: { score: 0, fouls: 0, name: 'Time B' }
  },
  timers: {
    ascending: { seconds: 0, interval: null },
    descending: { seconds: INITIAL_COUNTDOWN, interval: null }
  }
};

// ===== STORAGE MANAGEMENT =====
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      gameState.teams = parsed.teams || gameState.teams;
      gameState.timers.ascending = { ...gameState.timers.ascending, interval: null };
      gameState.timers.descending = { ...gameState.timers.descending, interval: null };
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
}

// ===== DISPLAY UPDATES =====
function updateDisplay(team) {
  const teamData = gameState.teams[team];
  document.getElementById(`score${team}`).textContent = teamData.score;
  document.getElementById(`fouls${team}`).textContent = teamData.fouls;
  document.getElementById(`team${team}-name`).textContent = teamData.name;
  saveToStorage();
}

function addPoints(team, points) {
  const newScore = gameState.teams[team].score + points;
  if (newScore >= 0) {
    gameState.teams[team].score = newScore;
    updateDisplay(team);
  }
}

function addFouls(team, fouls) {
  const newFouls = gameState.teams[team].fouls + fouls;
  if (newFouls >= 0) {
    gameState.teams[team].fouls = newFouls;
    updateDisplay(team);
  }
}

function resetScore() {
  // Stop all timers
  stopTimer();
  stopTimerRegressivo();

  // Reset all values
  Object.keys(gameState.teams).forEach(team => {
    gameState.teams[team].score = 0;
    gameState.teams[team].fouls = 0;
    updateDisplay(team);
  });

  resetTimerRegressivo();
  resetTimer();
}

// ===== TIMER FUNCTIONS =====
function startTimer() {
  if (!gameState.timers.ascending.interval) {
    gameState.timers.ascending.interval = setInterval(updateTimer, 1000);
  }
}

function stopTimer() {
  clearInterval(gameState.timers.ascending.interval);
  gameState.timers.ascending.interval = null;
}

function resetTimer() {
  stopTimer();
  gameState.timers.ascending.seconds = 0;
  document.getElementById('timer').textContent = '00:00:00';
}

function updateTimer() {
  gameState.timers.ascending.seconds++;
  const hours = Math.floor(gameState.timers.ascending.seconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((gameState.timers.ascending.seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (gameState.timers.ascending.seconds % 60)
    .toString()
    .padStart(2, '0');
  document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
  saveToStorage();
}

// ===== TEAM NAME EDITING =====
function editTeamName(team) {
  const nameEl = document.getElementById(`team${team}-name`);
  const inputEl = document.getElementById(`team${team}-input`);
  if (!nameEl || !inputEl) return;
  
  inputEl.value = nameEl.textContent;
  nameEl.style.display = 'none';
  inputEl.style.display = 'block';
  inputEl.focus();
  inputEl.select();
}

function saveTeamName(team) {
  const nameEl = document.getElementById(`team${team}-name`);
  const inputEl = document.getElementById(`team${team}-input`);
  if (!nameEl || !inputEl) return;
  
  const value = inputEl.value.trim() || `Time ${team}`;
  gameState.teams[team].name = value;
  nameEl.textContent = value;
  inputEl.style.display = 'none';
  nameEl.style.display = 'block';
  saveToStorage();
}

function handleTeamNameKey(event, team) {
  if (event.key === 'Enter') {
    saveTeamName(team);
  } else if (event.key === 'Escape') {
    const nameEl = document.getElementById(`team${team}-name`);
    const inputEl = document.getElementById(`team${team}-input`);
    if (nameEl && inputEl) {
      inputEl.style.display = 'none';
      nameEl.style.display = 'block';
    }
  }
}

// ===== COUNTDOWN TIMER FUNCTIONS =====
function toggleTimerRegressivo() {
  const button = document.getElementById('toggle-timer-regressivo');
  if (!button) return;
  
  if (gameState.timers.descending.interval) {
    stopTimerRegressivo();
    button.textContent = 'Iniciar';
  } else if (gameState.timers.descending.seconds > 0) {
    gameState.timers.descending.interval = setInterval(updateTimerRegressivo, 1000);
    button.textContent = 'Parar';
  }
}

function stopTimerRegressivo() {
  clearInterval(gameState.timers.descending.interval);
  gameState.timers.descending.interval = null;
}

function resetTimerRegressivo() {
  stopTimerRegressivo();
  gameState.timers.descending.seconds = INITIAL_COUNTDOWN;
  document.getElementById('timer-regressivo').textContent = '00:24';
  const button = document.getElementById('toggle-timer-regressivo');
  if (button) button.textContent = 'Iniciar';
  saveToStorage();
}

function updateTimerRegressivo() {
  gameState.timers.descending.seconds--;
  
  if (gameState.timers.descending.seconds < 0) {
    stopTimerRegressivo();
    gameState.timers.descending.seconds = 0;
  }
  
  const minutes = Math.floor(gameState.timers.descending.seconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (gameState.timers.descending.seconds % 60)
    .toString()
    .padStart(2, '0');
  document.getElementById('timer-regressivo').textContent = `${minutes}:${seconds}`;
  saveToStorage();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  Object.keys(gameState.teams).forEach(updateDisplay);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  saveToStorage();
});