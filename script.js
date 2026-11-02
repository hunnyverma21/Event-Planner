const $ = (id) => document.getElementById(id);
let events = JSON.parse(localStorage.getItem("eventlyEvents") || "[]");

function save() {
  localStorage.setItem("eventlyEvents", JSON.stringify(events));
  render();
}

function openModal(id) {
  $("eventForm").reset();
  $("editId").value = "";
  $("modalTitle").textContent = "Create New Event";
  if (id) {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    $("modalTitle").textContent = "Edit Event";
    ["name", "category", "date", "time", "venue", "guests", "cost", "notes"].forEach((key) => {
      $(key).value = event[key] ?? "";
    });
    $("editId").value = id;
  }
  $("modal").style.display = "flex";
  $("name").focus();
}

function closeModal() { $("modal").style.display = "none"; }

$("newEventBtn").addEventListener("click", () => openModal());
$("createEventBtn").addEventListener("click", () => openModal());
$("closeBtn").addEventListener("click", closeModal);
$("modal").addEventListener("click", (event) => {
  if (event.target === $("modal")) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

$("eventForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("editId").value;
  const data = { id: id || String(Date.now()) };
  ["name", "category", "date", "time", "venue", "guests", "cost", "notes"].forEach((key) => {
    data[key] = $(key).value.trim();
  });
  if (id) events = events.map((item) => item.id === id ? data : item);
  else events.push(data);
  save();
  closeModal();
});

function removeEvent(id) {
  if (confirm("Delete this event?")) {
    events = events.filter((item) => item.id !== id);
    save();
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function render() {
  const today = new Date();
  const todayString = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $("total").textContent = events.length;
  $("upcoming").textContent = events.filter((item) => item.date >= todayString).length;
  $("budget").textContent = "₹" + events.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toLocaleString("en-IN");

  const query = $("search").value.toLowerCase();
  const filter = $("filter").value;
  const visible = events
    .filter((item) => (item.name + " " + item.venue).toLowerCase().includes(query))
    .filter((item) => filter === "All" || item.category === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  $("events").innerHTML = visible.length ? visible.map((item) => `
    <article class="event">
      <h3>${escapeHTML(item.name)}</h3>
      <span class="muted">${escapeHTML(item.category)}</span>
      <p>📅 ${escapeHTML(item.date)} ${escapeHTML(item.time || "")}</p>
      <p>📍 ${escapeHTML(item.venue || "Venue not set")}</p>
      <p>👥 ${escapeHTML(item.guests || "0")} Guests</p>
      <p>💰 ₹${(Number(item.cost) || 0).toLocaleString("en-IN")}</p>
      <p>📝 ${escapeHTML(item.notes || "No notes")}</p>
      <div class="actions">
        <button class="edit" data-edit="${escapeHTML(item.id)}">Edit</button>
        <button class="delete" data-delete="${escapeHTML(item.id)}">Delete</button>
      </div>
    </article>
  `).join("") : `<div class="empty">🎉<h3>No events found</h3><p>Create your first event to get started!</p></div>`;

  $("events").querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.edit));
  });
  $("events").querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => removeEvent(button.dataset.delete));
  });
}

render();
