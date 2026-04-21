const form = document.getElementById("study-form");
const courseInput = document.getElementById("course");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");
const focusInput = document.getElementById("focus");
const notesInput = document.getElementById("notes");
const formMessage = document.getElementById("form-message");
const clearAllButton = document.getElementById("clear-all");

const totalSessionsEl = document.getElementById("total-sessions");
const totalHoursEl = document.getElementById("total-hours");
const averageFocusEl = document.getElementById("average-focus");
const topCourseEl = document.getElementById("top-course");
const tableBody = document.getElementById("session-table-body");

const STORAGE_KEY = "studypulse_sessions";

function getSessions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString();
}

function calculateHours(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const milliseconds = endDate - startDate;
  const hours = milliseconds / (1000 * 60 * 60);
  return hours;
}

function renderSummary(sessions) {
  totalSessionsEl.textContent = sessions.length;

  const totalHours = sessions.reduce((sum, session) => sum + session.hours, 0);
  totalHoursEl.textContent = totalHours.toFixed(1);

  const averageFocus =
    sessions.length > 0
      ? sessions.reduce((sum, session) => sum + session.focus, 0) / sessions.length
      : 0;
  averageFocusEl.textContent = averageFocus.toFixed(1);

  const courseTotals = {};
  sessions.forEach((session) => {
    if (!courseTotals[session.course]) {
      courseTotals[session.course] = 0;
    }
    courseTotals[session.course] += session.hours;
  });

  let topCourse = "—";
  let maxHours = 0;

  for (const course in courseTotals) {
    if (courseTotals[course] > maxHours) {
      maxHours = courseTotals[course];
      topCourse = course;
    }
  }

  topCourseEl.textContent = topCourse;
}

function renderTable(sessions) {
  if (sessions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No sessions logged yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = sessions
    .slice()
    .reverse()
    .map(
      (session) => `
        <tr>
          <td>${escapeHtml(session.course)}</td>
          <td>${formatDateTime(session.start)}</td>
          <td>${formatDateTime(session.end)}</td>
          <td>${session.hours.toFixed(1)}</td>
          <td>${session.focus}</td>
          <td>${escapeHtml(session.notes || "—")}</td>
        </tr>
      `
    )
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderAll() {
  const sessions = getSessions();
  renderSummary(sessions);
  renderTable(sessions);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const course = courseInput.value.trim();
  const start = startTimeInput.value;
  const end = endTimeInput.value;
  const focus = Number(focusInput.value);
  const notes = notesInput.value.trim();

  if (!course || !start || !end || !focus) {
    formMessage.textContent = "Please complete all required fields.";
    return;
  }

  const hours = calculateHours(start, end);

  if (hours <= 0) {
    formMessage.textContent = "End time must be later than start time.";
    return;
  }

  if (focus < 1 || focus > 10) {
    formMessage.textContent = "Focus score must be between 1 and 10.";
    return;
  }

  const sessions = getSessions();
  sessions.push({
    course,
    start,
    end,
    hours,
    focus,
    notes
  });

  saveSessions(sessions);
  renderAll();

  form.reset();
  formMessage.textContent = "Study session saved successfully.";
});

clearAllButton.addEventListener("click", function () {
  const confirmed = window.confirm("Are you sure you want to delete all study session data?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderAll();
  formMessage.textContent = "All study session data has been cleared.";
});

renderAll();