// script.js - HabitFlow app logic

// ---- Storage keys ----
const HABITS_STORAGE_KEY = "habitflow_habits";
const THEME_STORAGE_KEY = "habitflow_theme";

// Holds all habit objects
let habits = [];

// Default icon per category
const categoryIcons = {
  Study: "📘",
  Exercise: "🏃",
  Reading: "📚",
  Health: "💧",
  Personal: "🌱",
  Other: "✨",
};

// Card color choices
const colorOptions = ["#3F8A5E", "#E2A33D", "#5B8DBE", "#C97B84", "#8C7AE6", "#4FB3A9"];
let selectedColor = colorOptions[0];

// Motivational quotes
const motivationalQuotes = [
  "Small steps every day lead to big changes.",
  "Consistency is what transforms average into excellence.",
  "You don't have to be perfect, just consistent.",
  "Every habit you build today shapes who you become tomorrow.",
  "Progress, not perfection.",
  "Discipline is choosing between what you want now and what you want most.",
  "One percent better every day adds up.",
  "Show up for yourself, even in small ways.",
];

// ---- DOM references ----
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

const greetingText = document.getElementById("greeting-text");
const todayDateText = document.getElementById("today-date");

const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statPercent = document.getElementById("stat-percent");

const ringFill = document.getElementById("ring-fill");
const ringPercentText = document.getElementById("ring-percent-text");
const progressBarFill = document.getElementById("progress-bar-fill");
const quoteText = document.getElementById("quote-text");

const addHabitForm = document.getElementById("add-habit-form");
const habitNameInput = document.getElementById("habit-name-input");
const habitCategorySelect = document.getElementById("habit-category-select");
const habitGoalInput = document.getElementById("habit-goal-input");
const colorSwatchRow = document.getElementById("color-swatch-row");
const formError = document.getElementById("form-error");
const clearFormBtn = document.getElementById("clear-form-btn");

const habitListEl = document.getElementById("habit-list");
const emptyHabitsMessage = document.getElementById("empty-habits-message");

const darkModeToggle = document.getElementById("dark-mode-toggle");
const resetDataBtn = document.getElementById("reset-data-btn");

// Circumference of progress ring (radius = 70)
const RING_CIRCUMFERENCE = 2 * Math.PI * 70;

// ---- Helpers ----

// Today's date as YYYY-MM-DD
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Friendly date, e.g. "Wednesday, August 5, 2026"
function getFriendlyDateString() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString(undefined, options);
}

// Greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

// ---- Local Storage ----

// Load habits from Local Storage
function loadHabits() {
  const savedData = localStorage.getItem(HABITS_STORAGE_KEY);
  habits = savedData ? JSON.parse(savedData) : [];
}

// Save habits to Local Storage
function saveHabits() {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

// Load theme from Local Storage
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  applyTheme(savedTheme);
}

// Apply theme to the page
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    darkModeToggle.checked = true;
  } else {
    document.body.removeAttribute("data-theme");
    darkModeToggle.checked = false;
  }
}

// Save theme to Local Storage
function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// ---- Dashboard rendering ----

// Count today's completed/pending habits
function calculateTodayStats() {
  const today = getTodayDateString();
  let completedCount = 0;

  habits.forEach((habit) => {
    if (habit.completions[today] === true) {
      completedCount += 1;
    }
  });

  const totalCount = habits.length;
  const pendingCount = totalCount - completedCount;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return { totalCount, completedCount, pendingCount, percent };
}

// Update dashboard stats, ring, and progress bar
function renderDashboard() {
  greetingText.textContent = getGreeting();
  todayDateText.textContent = getFriendlyDateString();

  const stats = calculateTodayStats();

  statTotal.textContent = stats.totalCount;
  statCompleted.textContent = stats.completedCount;
  statPending.textContent = stats.pendingCount;
  statPercent.textContent = `${stats.percent}%`;

  const offset = RING_CIRCUMFERENCE - (stats.percent / 100) * RING_CIRCUMFERENCE;
  ringFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ringFill.style.strokeDashoffset = `${offset}`;
  ringPercentText.textContent = `${stats.percent}%`;

  progressBarFill.style.width = `${stats.percent}%`;
}

// Show a random quote
function renderMotivationalQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  quoteText.textContent = motivationalQuotes[randomIndex];
}

// ---- Habit list rendering ----

// Render habit cards
function renderHabitList() {
  habitListEl.innerHTML = "";
  emptyHabitsMessage.hidden = habits.length !== 0;

  const today = getTodayDateString();

  habits.forEach((habit) => {
    const isDoneToday = habit.completions[today] === true;

    const card = document.createElement("div");
    card.className = "habit-card" + (isDoneToday ? " completed" : "");
    card.style.setProperty("--habit-color", habit.color || "#3F8A5E");

    card.innerHTML = `
      <div class="habit-card-top">
        <span class="habit-icon">${categoryIcons[habit.category] || "✨"}</span>
        <button class="delete-icon-btn" data-id="${habit.id}" title="Delete habit">✕</button>
      </div>
      <p class="habit-name">${habit.name}</p>
      <span class="habit-category">${habit.category}</span>
      ${habit.goal ? `<p class="habit-goal">Goal: ${habit.goal}</p>` : ""}
      <p class="habit-status ${isDoneToday ? "done" : "pending"}">
        ${isDoneToday ? "✓ Completed today" : "○ Not completed yet"}
      </p>
      <div class="habit-card-actions">
        <button class="btn ${isDoneToday ? "btn-ghost" : "btn-primary"} complete-btn" data-id="${habit.id}">
          ${isDoneToday ? "Undo" : "Mark Complete"}
        </button>
      </div>
    `;

    habitListEl.appendChild(card);
  });

  attachHabitCardEvents();
}

// Hook up Complete/Delete buttons on each card
function attachHabitCardEvents() {
  const completeButtons = document.querySelectorAll(".complete-btn");
  const deleteButtons = document.querySelectorAll(".delete-icon-btn");

  completeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleHabitComplete(button.dataset.id);
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      deleteHabit(button.dataset.id);
    });
  });
}

// ---- Habit actions ----

// Add a new habit
function handleAddHabit(event) {
  event.preventDefault();

  const name = habitNameInput.value.trim();
  const category = habitCategorySelect.value;
  const goal = habitGoalInput.value.trim();

  // Basic validation
  if (name === "") {
    formError.textContent = "Please enter a habit name before adding it.";
    return;
  }

  formError.textContent = "";

  const newHabit = {
    id: Date.now().toString(),
    name: name,
    category: category,
    goal: goal,
    color: selectedColor,
    completions: {},
  };

  habits.push(newHabit);
  saveHabits();

  clearAddHabitForm();
  renderHabitList();
  renderDashboard();

  switchView("habits-view");
}

// Mark habit as completed for today (or undo)
function toggleHabitComplete(habitId) {
  const today = getTodayDateString();
  const habit = habits.find((item) => item.id === habitId);
  if (!habit) return;

  const alreadyDone = habit.completions[today] === true;
  habit.completions[today] = !alreadyDone;

  saveHabits();
  renderHabitList();
  renderDashboard();
}

// Delete a habit
function deleteHabit(habitId) {
  const confirmDelete = confirm("Delete this habit? This cannot be undone.");
  if (!confirmDelete) return;

  habits = habits.filter((item) => item.id !== habitId);

  saveHabits();
  renderHabitList();
  renderDashboard();
}

// Reset the Add Habit form
function clearAddHabitForm() {
  addHabitForm.reset();
  formError.textContent = "";
  selectedColor = colorOptions[0];
  highlightSelectedSwatch();
}

// ---- Color swatches ----

// Build the color swatch buttons
function renderColorSwatches() {
  colorSwatchRow.innerHTML = "";

  colorOptions.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;

    swatch.addEventListener("click", () => {
      selectedColor = color;
      highlightSelectedSwatch();
    });

    colorSwatchRow.appendChild(swatch);
  });

  highlightSelectedSwatch();
}

// Highlight the selected swatch
function highlightSelectedSwatch() {
  const allSwatches = document.querySelectorAll(".color-swatch");
  allSwatches.forEach((swatch) => {
    swatch.classList.toggle("selected", swatch.dataset.color === selectedColor);
  });
}

// ---- Navigation ----

// Switch between views
function switchView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewId);
  });
}

// ---- Settings ----

// Reset all data
function resetAllData() {
  const confirmReset = confirm(
    "This will permanently delete all habits and reset your settings. Continue?"
  );
  if (!confirmReset) return;

  localStorage.removeItem(HABITS_STORAGE_KEY);
  localStorage.removeItem(THEME_STORAGE_KEY);

  habits = [];
  applyTheme("light");

  renderDashboard();
  renderHabitList();
}

// ---- Event listeners ----

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    switchView(item.dataset.view);
  });
});

addHabitForm.addEventListener("submit", handleAddHabit);
clearFormBtn.addEventListener("click", clearAddHabitForm);

darkModeToggle.addEventListener("change", () => {
  const newTheme = darkModeToggle.checked ? "dark" : "light";
  applyTheme(newTheme);
  saveTheme(newTheme);
});

resetDataBtn.addEventListener("click", resetAllData);

// ---- Startup ----

function initApp() {
  loadTheme();
  loadHabits();
  renderColorSwatches();
  renderDashboard();
  renderMotivationalQuote();
  renderHabitList();
}

initApp();
