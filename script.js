// This array holds all the habits while the app is running
let habits = [];

// ===== Load habits from Local Storage =====
function loadHabits() {
  const saved = localStorage.getItem("habits");
  if (saved) {
    habits = JSON.parse(saved);
  } else {
    habits = [];
  }
}

// ===== Save habits to Local Storage =====
function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// ===== Get today's date as "YYYY/MM/DD" =====
function getTodayString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// ===== Show today's date in the header =====
function showTodayDate() {
  const today = new Date();

  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  document.getElementById("today-weekday").textContent = weekday.toUpperCase();
  document.getElementById("today-date").textContent = fullDate.toUpperCase();
}

// ===== Add a habit =====
function addHabit(event) {
  event.preventDefault(); // stop the form from reloading the page

  const nameInput = document.getElementById("habit-name");
  const categoryInput = document.getElementById("habit-category");
  const goalInput = document.getElementById("habit-goal");

  const name = nameInput.value.trim();
  const category = categoryInput.value;
  const goal = goalInput.value.trim();

  if (name === "") {
    alert("Please enter a habit name.");
    return;
  }

  const newHabit = {
    id: Date.now(),
    name: name,
    category: category,
    goal: goal,
    completed: false,
    date: ""
  };

  habits.push(newHabit);
  saveHabits();
  renderHabits();
  updateProgress();
  clearForm();
}

// ===== Clear the add-habit form =====
function clearForm() {
  document.getElementById("habit-name").value = "";
  document.getElementById("habit-goal").value = "";
  document.getElementById("habit-category").selectedIndex = 0;
}

// ===== Complete or undo a habit for today =====
function completeHabit(id) {
  const today = getTodayString();

  habits.forEach(function (habit) {
    if (habit.id === id) {
      if (habit.completed && habit.date === today) {
        // it was already done today, so undo it
        habit.completed = false;
        habit.date = "";
      } else {
        // mark it as done today
        habit.completed = true;
        habit.date = today;
      }
    }
  });

  saveHabits();
  renderHabits();
  updateProgress();
}

// ===== Delete a habit =====
function deleteHabit(id) {
  habits = habits.filter(function (habit) {
    return habit.id !== id;
  });

  saveHabits();
  renderHabits();
  updateProgress();
}

// ===== Display habits on the page =====
function renderHabits() {
  const container = document.getElementById("habits-container");
  const emptyMessage = document.getElementById("empty-message");
  const today = getTodayString();

  container.innerHTML = "";

  if (habits.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  habits.forEach(function (habit) {
    const isDone = habit.completed && habit.date === today;

    const row = document.createElement("div");
    row.className = isDone ? "habit-row done" : "habit-row";

    row.innerHTML =
      '<div class="habit-circle">' + (isDone ? "&#10003;" : "&#9675;") + "</div>" +
      '<div class="habit-info">' +
        '<p class="habit-name">' + habit.name + "</p>" +
        '<p class="habit-category">' + habit.category + "</p>" +
        '<p class="habit-goal">' + (isDone ? "Completed" : habit.goal) + "</p>" +
      "</div>" +
      '<div class="habit-actions">' +
        '<button class="complete-btn" onclick="completeHabit(' + habit.id + ')">' + (isDone ? "Undo" : "Done") + "</button>" +
        '<button class="delete-btn" onclick="deleteHabit(' + habit.id + ')">Delete</button>' +
      "</div>";

    container.appendChild(row);
  });
}

// ===== Update today's progress =====
function updateProgress() {
  const today = getTodayString();
  const total = habits.length;

  const completedCount = habits.filter(function (habit) {
    return habit.completed && habit.date === today;
  }).length;

  let percent = 0;
  if (total > 0) {
    percent = Math.round((completedCount / total) * 100);
  }

  document.getElementById("progress-count").textContent = completedCount + " / " + total + " habits";
  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("progress-percent").textContent = percent + "%";

  let message = "Start small. One habit is enough.";
  if (total > 0 && percent === 100) {
    message = "Perfect day. Keep the rhythm going!";
  } else if (percent >= 50) {
    message = "You're halfway there.";
  } else if (percent > 0) {
    message = "Good start. Keep going.";
  }

  document.getElementById("progress-message").textContent = message;
}

// ===== Switch between light and dark mode =====
function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// ===== Load the saved theme when the app starts =====
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("theme-toggle").checked = true;
  }
}

// ===== Reset all data =====
function resetData() {
  const sure = confirm("This will delete all your habits. Are you sure?");

  if (sure) {
    habits = [];
    localStorage.removeItem("habits");
    renderHabits();
    updateProgress();
  }
}

// ===== Event listeners =====
document.getElementById("habit-form").addEventListener("submit", addHabit);
document.getElementById("clear-btn").addEventListener("click", clearForm);
document.getElementById("theme-toggle").addEventListener("change", toggleTheme);
document.getElementById("reset-btn").addEventListener("click", resetData);

// ===== Start the app =====
loadHabits();
loadTheme();
showTodayDate();
renderHabits();
updateProgress();
