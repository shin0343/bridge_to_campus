const state = {
  route: "onboarding",
  completedMission: localStorage.getItem("btc.completedMission") === "true",
  checklist: JSON.parse(localStorage.getItem("btc.checklist") || "{}"),
  flipped: {},
};

const tasks = [
  { id: "i20", title: "Submit I-20 Request form", detail: "Due in 3 days", status: "Required", group: "required", tone: "required" },
  { id: "funds", title: "Verify Liquid Funds", detail: "Bank statement requested", status: "In progress", group: "required", tone: "primary" },
  { id: "passport", title: "Check Passport Validity", detail: "Must be valid 6 months post-entry", group: "recommended" },
  { id: "housing", title: "Draft Housing Plan Budget", detail: "Estimate initial 3 months", group: "recommended" },
  { id: "sevis", title: "Pay SEVIS Fee", detail: "Receipt saved", group: "completed", done: true },
];

const readiness = [
  { name: "English Confidence", icon: "language", score: 62, label: "Improving" },
  { name: "Culture Readiness", icon: "diversity_3", score: 41, label: "Needs practice", tertiary: true, pulse: true },
  { name: "Visa & Finance", icon: "account_balance", score: 84, label: "Almost ready", primaryBorder: true },
  { name: "Campus Life", icon: "school", score: 55, label: "Getting started" },
  { name: "Emotional Energy", icon: "self_improvement", score: 70, label: "Stable" },
];

const view = document.getElementById("view");
const appShell = document.getElementById("appShell");
const confettiLayer = document.getElementById("confettiLayer");

function save() {
  localStorage.setItem("btc.completedMission", String(state.completedMission));
  localStorage.setItem("btc.checklist", JSON.stringify(state.checklist));
}

function routeTo(route) {
  state.route = route;
  save();
  render();
}

function shellVisible() {
  const visible = state.route !== "onboarding" && state.route !== "weekly";
  document.querySelectorAll("[data-shell='app']").forEach((el) => {
    el.style.display = visible ? "" : "none";
  });
}

function setActiveNav() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    const route = button.dataset.route;
    const active = route === state.route || (state.route === "mission-detail" && route === "mission") || (state.route === "culture" && route === "mission");
    button.classList.toggle("active", active);
  });
}

function icon(name, cls = "") {
  return `<span class="material-symbols-outlined ${cls}">${name}</span>`;
}

function completedTaskCount() {
  return tasks.filter((task) => task.done || state.checklist[task.id]).length;
}

function page(content, cls = "") {
  return `<section class="screen ${cls} reveal">${content}</section>`;
}

function render() {
  shellVisible();
  setActiveNav();
  const routes = {
    onboarding,
    home,
    roadmap,
    mission,
    "mission-detail": missionDetail,
    culture,
    checklist,
    weekly,
  };
  view.innerHTML = (routes[state.route] || home)();
  view.focus({ preventScroll: true });
  bindView();
  requestAnimationFrame(runEntryAnimations);
}

function onboarding() {
  return `
    <section class="onboarding">
      <div class="onboarding-grid reveal">
        <div class="hero-copy">
          <div class="trust-line">
            <span>English</span><span class="dot">•</span><span>Culture</span><span class="dot">•</span>
            <span>Visa</span><span class="dot">•</span><span>Finance</span><span class="dot">•</span><span>Confidence</span>
          </div>
          <h1>Your first semester abroad starts before your flight.</h1>
          <p>A 90-day readiness companion for international students preparing for life in the U.S.</p>
          <div class="hero-actions">
            <button class="primary-btn" data-route="home">Start My Readiness Check</button>
            <button class="secondary-btn" data-route="roadmap">Preview Journey ${icon("arrow_forward")}</button>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="visual-block one"></div>
          <div class="visual-block two"></div>
          <div class="hero-medallion">
            <div class="medallion-icon">${icon("flight_takeoff", "filled")}</div>
            <strong>Ready to Go</strong>
            <span>Step 1 of 90</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function home() {
  return page(`
    <header class="page-header centered">
      <h1 class="page-title">Today’s Readiness</h1>
      <p class="lead">You do not need to be perfectly ready. You just need to move forward.</p>
      <div class="metric-hero">
        <div class="ring" data-ring="68">
          <div class="ring-content"><strong>68%</strong><span>Overall</span></div>
        </div>
      </div>
    </header>
    <button class="focus-callout" data-route="mission">
      <span class="play">${icon("play_arrow", "filled")}</span>
      <span><small>Today's Focus</small><strong>Practice introducing yourself in class</strong></span>
      ${icon("chevron_right")}
    </button>
    <section class="dashboard-list">
      ${readiness.map(readinessCard).join("")}
    </section>
  `);
}

function readinessCard(item) {
  return `
    <article class="readiness-card ${item.primaryBorder ? "primary" : ""}" style="${item.primaryBorder ? "border-left:4px solid var(--primary)" : item.tertiary ? "border-left:4px solid var(--tertiary)" : ""}">
      <div class="readiness-top">
        <div class="readiness-name">
          <span class="icon-circle" style="${item.tertiary ? "background:var(--tertiary-fixed);color:#380c00" : ""}">${icon(item.icon, "filled")}</span>
          <h3>${item.name}</h3>
        </div>
        <span class="score">${item.score}%</span>
      </div>
      <div class="bar-row">
        <div class="bar"><div class="bar-fill ${item.tertiary ? "tertiary" : ""}" data-width="${item.score}%"></div></div>
        <span class="pill ${item.tertiary ? "tertiary" : ""} ${item.pulse ? "pulse" : ""}">${item.label}</span>
      </div>
    </article>
  `;
}

function roadmap() {
  const count = completedTaskCount();
  return page(`
    <header class="page-header">
      <h1 class="page-title">Your 90-Day Campus Confidence Roadmap</h1>
      <p class="lead">Your journey is broken down into manageable steps. Focus on the active milestone, and watch your confidence grow.</p>
    </header>
    <section class="timeline">
      ${stage("done", "D-90 Milestone", "Build your speaking baseline", "You successfully established your initial conversational skills.", "Completed", "check")}
      ${stage("active", "Current Focus", "Organize visa, finance, and housing", "Secure the logistical foundations of your transition to ensure peace of mind before arrival.", `${count} of 5 tasks completed`, "flight_takeoff", true)}
      ${stage("locked", "D-30 Milestone", "Practice real campus conversations", "Unlocks after completing current logistical tasks.", "", "lock")}
      ${stage("locked", "D-7 Milestone", "Final confidence check", "Unlocks one week prior to departure.", "", "lock")}
      ${stage("locked", "Arrival Week", "Create your first small wins", "Your first steps on campus.", "", "lock")}
    </section>
  `, "wide-screen ambient-screen");
}

function stage(kind, label, title, text, badge, nodeIcon, active = false) {
  return `
    <article class="stage ${kind}">
      <div class="node ${kind === "done" ? "done" : ""} ${kind === "active" ? "active" : ""}">${icon(nodeIcon, kind !== "locked" ? "filled" : "")}</div>
      <div class="timeline-card">
        <div class="badge-row">
          <span class="milestone">${label}</span>
          ${badge && !active ? `<span class="pill primary">${badge}</span>` : ""}
        </div>
        <h3>${title}</h3>
        <p>${text}</p>
        ${
          active
            ? `<div class="action-panel"><span class="icon-label">${icon("fact_check")}<strong>${badge}</strong></span><button class="primary-btn" data-route="checklist">Continue Setup</button></div>`
            : kind === "done"
              ? `<button class="text-btn" data-route="mission-detail">Review Notes ${icon("arrow_forward")}</button>`
              : ""
        }
      </div>
    </article>
  `;
}

function mission() {
  return page(`
    <header class="page-header">
      <div class="badge-row">
        <span class="pill">${icon("schedule")}30 Seconds</span>
        <span class="pill tertiary">${icon("campaign")}Speaking</span>
      </div>
      <h1 class="page-title" style="margin-top:14px">Introduce yourself to a classmate</h1>
    </header>
    <section class="mission-hero">
      <div class="scenario-box">
        <div class="icon-label" style="color:var(--primary)">${icon("forum", "filled")}<strong>The Scenario</strong></div>
        <p>You meet a classmate before your first graduate seminar. Practice a short, natural self-introduction.</p>
      </div>
      <div class="mission-grid">
        <article class="card collapsible">
          <button class="collapse-trigger" data-toggle="example">
            <span class="icon-label">${icon("lightbulb")}<strong>Example Answer</strong></span>
            ${icon("expand_more")}
          </button>
          <div class="collapse-content" id="example"><div><p class="example-answer">"Hi, I’m Jae. I’m starting the MSAI program this fall. It’s nice to meet you. Are you also taking the core ML class this semester?"</p></div></div>
        </article>
        <article class="card">
          <div class="icon-label" style="color:var(--secondary)">${icon("auto_awesome")}<strong>Better Expressions</strong></div>
          <p class="example-answer">Use "starting" instead of "will start" for imminent plans. End with a reciprocal question to keep conversation flowing.</p>
        </article>
      </div>
      <section class="practice-zone">
        <div class="mic-wrap">
          <div class="mic-ring" id="micRing"></div>
          <button class="mic-btn" id="micBtn" aria-label="Hold to practice">${icon("mic", "filled")}</button>
        </div>
        <small id="micLabel">Hold to Practice</small>
      </section>
      <button class="complete-btn ${state.completedMission ? "done" : ""}" id="completeMission">
        ${icon("task_alt", state.completedMission ? "filled" : "")}
        <span>${state.completedMission ? "Mission Completed!" : "Mark Mission Complete"}</span>
      </button>
      <div class="action-row" style="margin-top:4px">
        <button class="secondary-btn" data-route="mission-detail">Open Detailed Guide</button>
        <button class="secondary-btn" data-route="culture">Practice Culture Scenarios</button>
      </div>
    </section>
  `);
}

function missionDetail() {
  return page(`
    <header class="page-header">
      <div class="icon-label" style="color:var(--primary)">${icon("mic", "filled")}<strong>Daily Speaking Mission</strong></div>
      <h1 class="page-title" style="margin-top:10px">Introduce yourself to a classmate</h1>
      <div class="badge-row" style="justify-content:flex-start;margin-top:12px">
        <span class="pill primary">Beginner</span><span class="pill tertiary">5-10 mins</span>
      </div>
    </header>
    <section class="scenario-box">
      <h2 class="section-title">${icon("school")}The Scenario</h2>
      <p>You are waiting in the hallway outside your very first graduate seminar. A fellow student is standing nearby, also checking their phone and looking a bit nervous. Practice a natural, warm self-introduction that feels professional yet approachable.</p>
      <div class="detail-image" role="img" aria-label="Graduate students talking in a university hallway"></div>
    </section>
    <section class="card" style="margin-top:18px">
      <h2 class="section-title" style="color:var(--tertiary)">${icon("tips_and_updates")}Better Expressions</h2>
      <p><strong>Use "Starting" for Imminent Plans.</strong> Instead of "I will start my program tomorrow," say "I'm starting my program tomorrow."</p>
      <p><strong>The Soft Approach.</strong> Use "I was wondering..." or "By the way..." to transition into a question after your intro.</p>
    </section>
    <section class="card collapsible" style="margin-top:18px">
      <button class="collapse-trigger" data-toggle="detailExample">
        <span class="icon-label">${icon("forum")}<strong>Example Answer</strong></span>${icon("expand_more")}
      </button>
      <div class="collapse-content" id="detailExample"><div>
        <p class="example-answer">"Hi there! I'm [Name]. I'm starting the Data Science program this semester. I just moved here last week, so I'm still figuring out where the best coffee is on campus. Are you in the same seminar?"</p>
      </div></div>
    </section>
    <div class="floating-cta"><button class="primary-btn complete-btn" data-route="mission">Start Mission</button></div>
  `);
}

function culture() {
  return page(`
    <header class="page-header">
      <h1 class="page-title">Campus Culture Scenarios</h1>
      <p class="lead">Practice the moments that do not appear in admission documents.</p>
    </header>
    <section class="scenario-scroll">
      ${flipCard("question", "front_hand", "Asking a question in class", "How to interject politely during a lecture.", "Could I ask a quick follow-up...?", "Direct but polite is okay", "Asking shows engagement")}
      ${flipCard("email", "mail", "Emailing a professor politely", "Structuring a formal request for help or extension.", "Dear Professor [Last Name], I am writing to ask...", "Always use title + last name first", "Keep it concise and clear", true)}
    </section>
  `);
}

function flipCard(id, cardIcon, title, body, quote, tip, response, tertiary = false) {
  return `
    <article class="flip-card ${tertiary ? "tertiary" : ""} ${state.flipped[id] ? "flipped" : ""}" data-flip="${id}" tabindex="0" role="button" aria-label="Flip scenario card">
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <div>
            <span class="icon-circle" style="${tertiary ? "background:rgba(194,82,39,.1);color:var(--tertiary-container)" : ""}">${icon(cardIcon, "filled")}</span>
            <h3>${title}</h3>
            <p>${body}</p>
          </div>
          <span class="pill tap-pill">Tap to flip ${icon("flip_camera_android")}</span>
        </div>
        <div class="flip-face flip-back">
          <div>
            <div class="icon-label">${icon(tertiary ? "edit_document" : "record_voice_over", "filled")}<strong>Scenario</strong></div>
            <h3>"${quote}"</h3>
          </div>
          <div class="mini-panel">
            <span class="icon-label">${icon("lightbulb")}<span><strong>Cultural Tip</strong><br>${tip}</span></span>
            <span class="icon-label">${icon("trending_up")}<span><strong>Recommended Response</strong><br>${response}</span></span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function checklist() {
  return page(`
    <header class="page-header">
      <h1 class="page-title">Visa & Finance Readiness</h1>
      <p class="lead">Keep the required steps clear and manageable.</p>
    </header>
    <section class="alert-card">
      ${icon("info", "filled")}
      <div><h3>Financial Document Tip</h3><p>Financial documents should clearly show account type, holder's name, and be recently dated to ensure smooth I-20 processing.</p></div>
    </section>
    ${checkSection("Required Immediate Action", "error", "required")}
    ${checkSection("Recommended Next Steps", "task_alt", "recommended")}
    ${checkSection("Completed", "", "completed")}
  `);
}

function checkSection(title, iconName, group) {
  const items = tasks.filter((task) => {
    const done = task.done || state.checklist[task.id];
    if (group === "completed") return done;
    return task.group === group && !done;
  });
  if (!items.length && group !== "completed") return "";
  return `
    <section class="check-section">
      <h2 class="section-title" style="${group === "completed" ? "color:var(--on-surface-variant)" : ""}">${iconName ? icon(iconName, group === "required" ? "filled" : "") : ""}${title}</h2>
      <div class="check-stack">${items.map(checkItem).join("") || `<p class="lead" style="font-size:16px">No completed tasks yet.</p>`}</div>
    </section>
  `;
}

function checkItem(task) {
  const done = task.done || state.checklist[task.id];
  return `
    <label class="check-item ${task.tone || ""} ${done ? "completed" : ""}" data-task="${task.id}">
      <input class="round-check" type="checkbox" ${done ? "checked" : ""} ${task.done ? "disabled" : ""}>
      <span class="check-text"><strong>${task.title}</strong><small>${task.detail}</small></span>
      ${task.status && !done ? `<span class="pill ${task.tone === "required" ? "error" : "primary"} ${task.tone === "required" ? "pulse" : ""}">${task.status}</span>` : ""}
    </label>
  `;
}

function weekly() {
  const missionBonus = state.completedMission ? 1 : 0;
  const checklistBonus = completedTaskCount() - 1;
  return page(`
    <header class="page-header centered">
      <div class="celebration-icon">${icon("verified", "filled")}</div>
      <h1 class="page-title" style="color:var(--primary)">This Week’s Progress</h1>
      <p class="lead">You are not fully ready yet. But you are more ready than last week.</p>
    </header>
    <section class="stat-grid">
      <article class="stat-card hero"><p class="stat-label">Campus Confidence</p><div><span class="big-stat" data-count="${18 + missionBonus + checklistBonus}">+0</span><span class="small-stat">%</span></div></article>
      <article class="stat-card"><p class="stat-label">Missions Completed</p><span class="small-stat" data-count="${3 + missionBonus}">0</span></article>
      <article class="stat-card"><p class="stat-label">Scenarios Navigated</p><span class="small-stat" data-count="${2 + (state.flipped.question ? 1 : 0) + (state.flipped.email ? 1 : 0)}">0</span></article>
    </section>
    <blockquote class="quote-card">"Small wins before departure become confidence after arrival."</blockquote>
    <div class="action-row">
      <button class="primary-btn" data-route="roadmap">Plan Next Week ${icon("arrow_forward")}</button>
      <button class="ghost-btn" id="shareProgress">${icon("ios_share")}Share Progress</button>
    </div>
  `, "celebration");
}

function bindView() {
  document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.toggle);
      target.classList.toggle("open");
      button.querySelector(".material-symbols-outlined:last-child").style.transform = target.classList.contains("open") ? "rotate(180deg)" : "rotate(0deg)";
    });
  });

  document.querySelectorAll("[data-flip]").forEach((card) => {
    const flip = () => {
      const id = card.dataset.flip;
      state.flipped[id] = !state.flipped[id];
      card.classList.toggle("flipped", state.flipped[id]);
      save();
    };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flip();
      }
    });
  });

  document.querySelectorAll(".check-item input:not([disabled])").forEach((input) => {
    input.addEventListener("change", () => {
      const item = input.closest(".check-item");
      const id = item.dataset.task;
      state.checklist[id] = input.checked;
      item.classList.add("shake-in");
      if (input.checked) createConfetti(16);
      save();
      setTimeout(render, 360);
    });
  });

  const micBtn = document.getElementById("micBtn");
  if (micBtn) bindMic(micBtn);

  const completeMission = document.getElementById("completeMission");
  if (completeMission) {
    completeMission.addEventListener("click", () => {
      if (!state.completedMission) createConfetti(44);
      state.completedMission = true;
      save();
      render();
    });
  }

  const share = document.getElementById("shareProgress");
  if (share) {
    share.addEventListener("click", async () => {
      const text = "I moved my BridgeToCampus readiness forward this week.";
      if (navigator.share) {
        await navigator.share({ title: "BridgeToCampus Progress", text }).catch(() => {});
      } else {
        await navigator.clipboard?.writeText(text);
        share.innerHTML = `${icon("check", "filled")}Copied`;
      }
    });
  }
}

function bindMic(micBtn) {
  const micRing = document.getElementById("micRing");
  const micLabel = document.getElementById("micLabel");
  const start = () => {
    micBtn.classList.add("recording");
    micRing.classList.add("recording");
    micBtn.innerHTML = icon("graphic_eq", "filled");
    micLabel.textContent = "Recording Practice";
  };
  const stop = () => {
    micBtn.classList.remove("recording");
    micRing.classList.remove("recording");
    micBtn.innerHTML = icon("mic", "filled");
    micLabel.textContent = "Hold to Practice";
  };
  micBtn.addEventListener("mousedown", start);
  micBtn.addEventListener("mouseup", stop);
  micBtn.addEventListener("mouseleave", stop);
  micBtn.addEventListener("touchstart", (event) => {
    event.preventDefault();
    start();
  });
  micBtn.addEventListener("touchend", (event) => {
    event.preventDefault();
    stop();
  });
}

function runEntryAnimations() {
  document.querySelectorAll("[data-width]").forEach((bar) => {
    bar.style.width = bar.dataset.width;
  });
  document.querySelectorAll("[data-ring]").forEach((ring) => {
    ring.style.setProperty("--progress", `${Number(ring.dataset.ring) * 3.6}deg`);
  });
  document.querySelectorAll("[data-count]").forEach((counter) => animateCount(counter, Number(counter.dataset.count)));
  if (state.route === "weekly") createConfetti(40, true);
}

function animateCount(el, target) {
  const prefix = el.textContent.trim().startsWith("+") ? "+" : "";
  let frame = 0;
  const total = 54;
  const tick = () => {
    frame += 1;
    const progress = 1 - Math.pow(1 - frame / total, 4);
    el.textContent = `${prefix}${Math.round(target * progress)}`;
    if (frame < total) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function createConfetti(amount = 32, falling = false) {
  const colors = ["#005da7", "#a4c9ff", "#de8ffd", "#ecb2ff", "#c25227", "#ffffff"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = falling ? "-5vh" : `${45 + Math.random() * 12}vh`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.setProperty("--duration", `${3.8 + Math.random() * 3}s`);
    piece.style.setProperty("--drift", `${-35 + Math.random() * 70}px`);
    piece.style.animationDelay = `${i * 45}ms`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 7600);
  }
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (!routeButton) return;
  routeTo(routeButton.dataset.route);
});

render();
