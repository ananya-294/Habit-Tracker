// ==========================================================
// script.js
// All the application logic for HabitFlow lives in this file.
// It is organized into small, clearly named functions so each
// piece is easy to read and explain on its own.
// ==========================================================

// ---------- 1. CONSTANTS & DATA ----------

// Keys used to store data in the browser's Local Storage
const HABITS_STORAGE_KEY = "habitflow_habits";
const THEME_STORAGE_KEY = "habitflow_theme";

// This array holds every habit the user has created.
// Each habit is an object that looks like this:
// {
//   id: "1699999999999",
//   name: "Read 20 pages",
//   category: "Reading",
//   goal: "20 pages",
//   icon: "📚",
//   color: "#3F8A5E",
//   completions: { "2026-08-05": true }
// }
let habits = [];

// A default icon for each category, used when the user
// doesn't type a custom icon of their own.
const categoryIcons = {
  Study: "📘",
  Exercise: "🏃",
  Reading: "📚",
  Health: "💧",
  Personal: "🌱",
  Other: "✨",
};

// A small, curated set of colors the user can pick for a habit card
const colorOptions = ["#3F8A5E", "#E2A33D", "#5B8DBE", "#C97B84", "#8C7AE6", "#4FB3A9"];

// The color currently selected in the Add Habit form
let selectedColor = colorOptions[0];

// A short list of motivational quotes shown on the dashboard.
// (Stored locally so the app works fully offline.)
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

// ---------- 2. DOM REFERENCES ----------

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
const habitIconInput = document.getElementById("habit-icon-input");
const colorSwatchRow = document.getElementById("color-swatch-row");
const formError = document.getElementById("form-error");
const clearFormBtn = document.getElementById("clear-form-btn");

const habitListEl = document.getElementById("habit-list");
const emptyHabitsMessage = document.getElementById("empty-habits-message");

const darkModeToggle = document.getElementById("dark-mode-toggle");
const resetDataBtn = document.getElementById("reset-data-btn");

// The circumference of the progress ring circle (radius = 70)
// Formula: circumference = 2 * PI * radius
const RING_CIRCUMFERENCE = 2 * Math.PI * 70;

// ---------- 3. HELPER FUNCTIONS ----------

// Returns today's date as "YYYY-MM-DD" so it can be used as a
// consistent key for storing daily completion status.
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Returns a friendly, readable date, e.g. "Wednesday, August 5, 2026"
function getFriendlyDateString() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString(undefined, options);
}

// Picks a greeting based on the current hour of the day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

// ---------- 4. LOCAL STORAGE ----------

// Load the saved habit list from Local Storage (if any exists)
function loadHabits() {
  const savedData = localStorage.getItem(HABITS_STORAGE_KEY);
  habits = savedData ? JSON.parse(savedData) : [];
}

// Save the current habit list to Local Storage
function saveHabits() {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

// Load the saved theme ("light" or "dark") from Local Storage
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  applyTheme(savedTheme);
}

// Apply a theme to the page and update the toggle switch
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    darkModeToggle.checked = true;
  } else {
    document.body.removeAttribute("data-theme");
    darkModeToggle.checked = false;
  }
}

// Save the chosen theme to Local Storage
function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// ---------- 5. RENDERING: DASHBOARD ----------

// Calculates today's stats by looping through the habits array
function calculateTodayStats() {
  const today = getTodayDateString();

  let completedCount = 0;

  // forEach() loops through every habit to count today's completions
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

// Updates the dashboard: stat cards, progress ring, progress bar, quote
function renderDashboard() {
  greetingText.textContent = getGreeting();
  todayDateText.textContent = getFriendlyDateString();

  const stats = calculateTodayStats();

  statTotal.textContent = stats.totalCount;
  statCompleted.textContent = stats.completedCount;
  statPending.textContent = stats.pendingCount;
  statPercent.textContent = `${stats.percent}%`;

  // Update the circular progress ring using stroke-dashoffset.
  // At 0%, the offset equals the full circumference (empty ring).
  // At 100%, the offset is 0 (fully filled ring).
  const offset = RING_CIRCUMFERENCE - (stats.percent / 100) * RING_CIRCUMFERENCE;
  ringFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ringFill.style.strokeDashoffset = `${offset}`;
  ringPercentText.textContent = `${stats.percent}%`;

  // Update the simple horizontal progress bar
  progressBarFill.style.width = `${stats.percent}%`;
}

// Shows a random motivational quote
function renderMotivationalQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  quoteText.textContent = motivationalQuotes[randomIndex];
}

// ---------- 6. RENDERING: HABIT LIST ----------

// Builds and displays a card for every habit in the habits array
function renderHabitList() {
  // Clear out whatever is currently shown
  habitListEl.innerHTML = "";

  emptyHabitsMessage.hidden = habits.length !== 0;

  const today = getTodayDateString();

  // forEach() creates one card element per habit
  habits.forEach((habit) => {
    const isDoneToday = habit.completions[today] === true;

    const card = document.createElement("div");
    card.className = "habit-card" + (isDoneToday ? " completed" : "");
    card.style.setProperty("--habit-color", habit.color || "#3F8A5E");

    card.innerHTML = `
      <div class="habit-card-top">
        <span class="habit-icon">${habit.icon || categoryIcons[habit.category] || "✨"}</span>
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

  // Attach click events to the buttons we just created
  attachHabitCardEvents();
}

// Adds event listeners to each "Complete" and "Delete" button.
// This runs every time the list is re-rendered.
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

// ---------- 7. HABIT ACTIONS ----------

// Adds a new habit to the array using data from the Add Habit form
function handleAddHabit(event) {
  event.preventDefault(); // stop the form from reloading the page

  const name = habitNameInput.value.trim();
  const category = habitCategorySelect.value;
  const goal = habitGoalInput.value.trim();
  const icon = habitIconInput.value.trim();

  // Basic validation: a habit must have a name
  if (name === "") {
    formError.textContent = "Please enter a habit name before adding it.";
    return;
  }

  formError.textContent = "";

  const newHabit = {
    id: Date.now().toString(), // a simple unique ID based on the current time
    name: name,
    category: category,
    goal: goal,
    icon: icon,
    color: selectedColor,
    completions: {},
  };

  habits.push(newHabit);
  saveHabits();

  clearAddHabitForm();
  renderHabitList();
  renderDashboard();

  // Take the user to the habit list so they can see what they added
  switchView("habits-view");
}

// Marks a habit as complete for today, or un-marks it if already done
function toggleHabitComplete(habitId) {
  const today = getTodayDateString();

  // find() locates the exact habit object that matches the clicked button
  const habit = habits.find((item) => item.id === habitId);
  if (!habit) return;

  const alreadyDone = habit.completions[today] === true;
  habit.completions[today] = !alreadyDone;

  saveHabits();
  renderHabitList();
  renderDashboard();
}

// Removes a habit from the list completely
function deleteHabit(habitId) {
  const confirmDelete = confirm("Delete this habit? This cannot be undone.");
  if (!confirmDelete) return;

  // filter() rebuilds the array, keeping every habit except the deleted one
  habits = habits.filter((item) => item.id !== habitId);

  saveHabits();
  renderHabitList();
  renderDashboard();
}

// Clears every field in the Add Habit form back to defaults
function clearAddHabitForm() {
  addHabitForm.reset();
  formError.textContent = "";
  selectedColor = colorOptions[0];
  highlightSelectedSwatch();
}

// ---------- 8. ADD HABIT FORM: COLOR SWATCHES ----------

// Builds the row of clickable color circles in the Add Habit form
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

// Adds a "selected" outline to whichever swatch matches selectedColor
function highlightSelectedSwatch() {
  const allSwatches = document.querySelectorAll(".color-swatch");
  allSwatches.forEach((swatch) => {
    swatch.classList.toggle("selected", swatch.dataset.color === selectedColor);
  });
}

// ---------- 9. NAVIGATION ----------

// Switches which view (Dashboard, Add Habit, My Habits, Settings) is visible
function switchView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewId);
  });
}

// ---------- 10. SETTINGS ----------

// Wipes every habit and resets the theme back to default
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

// ---------- 11. EVENT LISTENERS ----------

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

// ---------- 12. APP STARTUP ----------

// Runs once when the app first loads: pulls in saved data and
// draws the initial screen.
function initApp() {
  loadTheme();
  loadHabits();
  renderColorSwatches();
  renderDashboard();
  renderMotivationalQuote();
  renderHabitList();
}

initApp();
