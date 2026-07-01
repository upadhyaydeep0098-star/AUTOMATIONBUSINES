const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const taskFocusButtons = [...document.querySelectorAll("[data-task-focus]")];
const taskInput = document.querySelector("[data-task-input]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const workflowRows = [...document.querySelectorAll("[data-row]")];
const auditSteps = [...document.querySelectorAll("[data-step]")];
const viewButtons = [...document.querySelectorAll("[data-view]")];
const auditSummary = document.querySelector("[data-audit-summary]");

const afterCopy = {
  summary: "We remove manual steps and let your team focus on exceptions that actually need attention.",
  labels: [
    ["Automated", "Inbox watched"],
    ["Automated", "Matched"],
    ["Automated", "Tracker updated"],
    ["Human review", "Exceptions only"]
  ]
};

const beforeCopy = {
  summary: "This is the manual workflow your team repeats every week before automation.",
  labels: [
    ["Manual", "2-3 hrs/week"],
    ["Manual", "3-5 hrs/week"],
    ["Manual", "2-4 hrs/week"],
    ["Manual", "1-2 hrs/week"]
  ]
};

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu?.classList.toggle("is-open", open);
  header?.classList.toggle("menu-active", open);
  document.body.classList.toggle("menu-open", open);
});

mobileMenu?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;
  menuToggle?.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  header?.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
});

const revealItems = [...document.querySelectorAll(".reveal")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

let activeAuditStep = 0;
let auditTimer;

const setActiveAuditStep = (index) => {
  if (auditSteps.length === 0) return;
  activeAuditStep = index % auditSteps.length;
  auditSteps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === activeAuditStep);
  });
};

const startAuditLoop = () => {
  window.clearInterval(auditTimer);
  auditTimer = window.setInterval(() => {
    setActiveAuditStep(activeAuditStep + 1);
  }, 1900);
};

setActiveAuditStep(0);
startAuditLoop();

auditSteps.forEach((step, index) => {
  step.addEventListener("click", () => {
    setActiveAuditStep(index);
    startAuditLoop();
  });
});

const setAuditView = (view) => {
  const copy = view === "before" ? beforeCopy : afterCopy;
  if (auditSummary) auditSummary.textContent = copy.summary;
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  auditSteps.forEach((step, index) => {
    const detail = step.querySelector("small");
    if (!detail) return;
    const [label, value] = copy.labels[index] || ["", ""];
    detail.replaceChildren(label, document.createElement("br"), value);
  });
};

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuditView(button.dataset.view || "after");
  });
});

workflowRows.forEach((row) => {
  row.addEventListener("click", () => {
    workflowRows.forEach((item) => item.classList.remove("active"));
    row.classList.add("active");
  });
});

taskFocusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => taskInput?.focus(), 420);
  });
});

contactForm?.addEventListener("submit", () => {
  if (!formStatus) return;
  formStatus.textContent = "Opening your email app with the workflow details.";
});
