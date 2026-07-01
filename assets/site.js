const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const runToggle = document.querySelector("[data-run-toggle]");
const viewRun = document.querySelector("[data-view-run]");
const taskFocus = document.querySelector("[data-task-focus]");
const taskInput = document.querySelector("[data-task-input]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const workflowRows = [...document.querySelectorAll("[data-row]")];
const triggers = [...document.querySelectorAll("[data-node]")];
const nodes = [...document.querySelectorAll("[data-step]")];

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
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

let activeIndex = 0;
let nodeTimer;

const setActiveNode = (index) => {
  activeIndex = index % Math.max(nodes.length, 1);
  triggers.forEach((trigger, triggerIndex) => {
    trigger.classList.toggle("active", triggerIndex === activeIndex % triggers.length);
  });
  nodes.forEach((node, nodeIndex) => {
    node.classList.toggle("active", nodeIndex === activeIndex);
  });
};

const startNodeLoop = () => {
  window.clearInterval(nodeTimer);
  nodeTimer = window.setInterval(() => {
    if (document.body.classList.contains("paused")) return;
    setActiveNode(activeIndex + 1);
  }, 1700);
};

setActiveNode(0);
startNodeLoop();

runToggle?.addEventListener("click", () => {
  const paused = !document.body.classList.contains("paused");
  document.body.classList.toggle("paused", paused);
  runToggle.textContent = paused ? "Resume" : "Pause";
});

viewRun?.addEventListener("click", () => {
  setActiveNode(activeIndex + 1);
});

workflowRows.forEach((row) => {
  row.addEventListener("click", () => {
    workflowRows.forEach((item) => item.classList.remove("active"));
    row.classList.add("active");
  });
});

taskFocus?.addEventListener("click", () => {
  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => taskInput?.focus(), 420);
});

contactForm?.addEventListener("submit", () => {
  if (!formStatus) return;
  formStatus.textContent = "Opening your email app with the workflow details.";
});
