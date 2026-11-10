async function load() {
  const res = await fetch("data.json");
  if (!res.ok) throw new Error("Could not load progress data");
  return res.json();
}

function sportLabel(sport) {
  if (sport === "ski") return "SKI";
  if (sport === "ride") return "RIDE";
  return "SKI / RIDE";
}

function render(data, riderId) {
  const rider = data.riders.find((r) => r.id === riderId) || data.riders[0];
  const level = data.levels.find((l) => l.id === rider.level) || data.levels[0];
  const unlocked = rider.milestones || [];
  const total = (data.milestones || []).length || 6;
  const pct = Math.round((unlocked.length / total) * 100);
  const track = rider.sport === "ride" ? level.ride : level.ski;
  const trackSkills = (track || []).slice(0, 3).join(" · ");

  document.getElementById("level-chip").textContent =
    `Level ${level.id} · ${level.name} · ${sportLabel(rider.sport)}`;
  document.getElementById("rider-name").textContent = rider.name;
  document.getElementById("run-line").textContent =
    `${level.difficulty} · Next: ${level.next_run || level.name}`;
  const skillsEl = document.getElementById("skill-track");
  if (skillsEl) {
    skillsEl.textContent = `${sportLabel(rider.sport)} track: ${trackSkills}`;
  }
  document.getElementById("ach-ring").style.setProperty("--p", String(pct));
  document.getElementById("ach-pct").textContent = `${pct}%`;
  document.getElementById("ach-caption").textContent =
    `${unlocked.length} of ${total} milestones · ${rider.stats.lessons} lessons`;

  const stats = document.getElementById("stats-strip");
  stats.innerHTML = [
    ["Lessons", rider.stats.lessons],
    ["Days on snow", rider.stats.days],
  ]
    .map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`)
    .join("");

  const badges = document.getElementById("badge-row");
  const chips = (rider.badges || []).map((b) => `<span class="badge-chip">${b}</span>`);
  const bonus = (rider.bonus || []).map(
    (b) => `<span class="badge-chip bonus">${b} · bonus</span>`
  );
  badges.innerHTML =
    chips.concat(bonus).join("") ||
    `<span class="fine">No badges yet — first tracks waiting.</span>`;

  const roster = document.getElementById("roster");
  roster.innerHTML = (rider.lesson_group || [])
    .map((p) => `<span>${p}</span>`)
    .join("");
}

function fillSelect(data) {
  const sel = document.getElementById("rider-select");
  sel.innerHTML = data.riders
    .map(
      (r) =>
        `<option value="${r.id}">${r.name} · L${r.level} · ${sportLabel(r.sport)}</option>`
    )
    .join("");
  sel.addEventListener("change", () => render(data, sel.value));
}

load()
  .then((data) => {
    fillSelect(data);
    render(data, data.riders[0].id);
  })
  .catch((err) => {
    document.getElementById("progress-card").innerHTML =
      `<p class="note">Error loading card: ${err.message}</p>`;
  });
