const header = document.querySelector(".site-header, .m-header");
const taskForms = document.querySelectorAll(".task-form");
const menuToggle = document.querySelector(".m-menu-toggle");
const mobilePanel = document.querySelector("#mobile-nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

/* ---------- Mobile navigation ---------- */
function setMobileMenu(open) {
  if (!menuToggle || !mobilePanel) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.classList.toggle("is-open", open);
  mobilePanel.hidden = !open;
  document.body.classList.toggle("nav-open", open);
  if (!open) menuToggle.focus({ preventScroll: true });
}

menuToggle?.addEventListener("click", () => {
  setMobileMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobilePanel?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMobileMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMobileMenu(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 720 && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMobileMenu(false);
  }
});

/* ---------- Form handler ----------
 * Lets configured forms submit natively to Formspree.
 * Falls back to opening a pre-filled mailto: if a form has no form backend.
 */
taskForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    const action = form.getAttribute("action") || "";
    const formspreeReady =
      action.startsWith("https://formspree.io/f/") && !action.includes("YOURFORMID");

    if (formspreeReady) {
      // Let the form submit natively to Formspree.
      return;
    }

    // Fallback: open user's email client with a pre-filled message.
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get("email") || "";
    const task = formData.get("task") || "";
    const subject = encodeURIComponent("Yudi Labs — automation enquiry");
    const body = encodeURIComponent(`Email: ${email}\n\nTask:\n${task}`);
    window.location.href = `mailto:hello@yudilabs.com?subject=${subject}&body=${body}`;
  });
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add("in-view"));
} else if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

/* ---------- Animated stat counters ---------- */
const counters = document.querySelectorAll("[data-count]");
if (!prefersReducedMotion && "IntersectionObserver" in window && counters.length) {
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * ease(progress);
      el.textContent =
        prefix +
        value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  counters.forEach((el) => counterIO.observe(el));
}

/* ---------- Marquee — duplicate children for seamless loop ---------- */
document.querySelectorAll(".marquee-track, .m-marquee-track").forEach((track) => {
  if (prefersReducedMotion) return;
  if (track.dataset.marqueeReady === "true") return;

  [...track.children].forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  track.dataset.marqueeReady = "true";
});

/* ---------- Services page: plain English toggle ---------- */
const serviceLanguageButtons = document.querySelectorAll("[data-service-language]");
const serviceCopyBlocks = document.querySelectorAll("[data-service-copy]");

function setServiceLanguage(language) {
  serviceLanguageButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.dataset.serviceLanguage === language ? "true" : "false"
    );
  });

  serviceCopyBlocks.forEach((block) => {
    block.hidden = block.dataset.serviceCopy !== language;
  });
}

if (serviceLanguageButtons.length && serviceCopyBlocks.length) {
  setServiceLanguage("plain");
  serviceLanguageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setServiceLanguage(button.dataset.serviceLanguage || "plain");
    });
  });
}

/* ---------- Services page: ROI calculator ---------- */
const roiCalculator = document.querySelector("[data-roi-calculator]");

if (roiCalculator) {
  const hoursInput = roiCalculator.querySelector("[data-roi-hours]");
  const rateInput = roiCalculator.querySelector("[data-roi-rate]");
  const hoursValue = roiCalculator.querySelector("[data-roi-hours-value]");
  const annualOutput = roiCalculator.querySelector("[data-roi-annual]");
  const summaryOutput = roiCalculator.querySelector("[data-roi-summary]");
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const updateRoi = () => {
    const hours = Math.max(0, Number(hoursInput?.value || 0));
    const rate = Math.max(0, Number(rateInput?.value || 0));
    const annualCost = hours * rate * 52;

    if (hoursValue) hoursValue.textContent = hours.toString();
    if (annualOutput) annualOutput.textContent = money.format(annualCost);
    if (summaryOutput) {
      summaryOutput.textContent = `Based on ${hours} hours/week at ${money.format(rate)}/hour.`;
    }
  };

  hoursInput?.addEventListener("input", updateRoi);
  rateInput?.addEventListener("input", updateRoi);
  updateRoi();
}
