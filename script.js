const header = document.querySelector(".site-header");
const taskForms = document.querySelectorAll(".task-form");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

/* ---------- Form handler ----------
 * Lets configured forms submit natively to Formspree.
 * Falls back to opening a pre-filled mailto: if a form has no form backend.
 */
taskForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    const action = form.getAttribute("action") || "";
    const formspreeReady = action.startsWith("https://formspree.io/f/");

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
if ("IntersectionObserver" in window && revealEls.length) {
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
if ("IntersectionObserver" in window && counters.length) {
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
document.querySelectorAll(".marquee-track").forEach((track) => {
  track.innerHTML += track.innerHTML;
});
