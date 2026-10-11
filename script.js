/* Shared interactions. Content and navigation remain available without JavaScript. */
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".m-header");
const menuToggle = document.querySelector(".m-menu-toggle");
const mobilePanel = document.querySelector("#mobile-nav");
const desktopMenu = window.matchMedia("(min-width: 861px)");

function setMobileMenu(open, restoreFocus = true) {
  if (!menuToggle || !mobilePanel) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.classList.toggle("is-open", open);
  mobilePanel.hidden = !open;
  document.body.classList.toggle("nav-open", open);
  document.querySelector("main")?.toggleAttribute("inert", open);
  document.querySelector(".m-footer")?.toggleAttribute("inert", open);
  if (open) mobilePanel.querySelector("a")?.focus({ preventScroll: true });
  else if (restoreFocus) menuToggle.focus({ preventScroll: true });
}
menuToggle?.addEventListener("click", () => {
  setMobileMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});
mobilePanel?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMobileMenu(false, false);
});
document.addEventListener("keydown", (event) => {
  if (menuToggle?.getAttribute("aria-expanded") !== "true") return;
  if (event.key === "Escape") {
    event.preventDefault();
    setMobileMenu(false);
  }
  if (event.key === "Tab") {
    const links = [...mobilePanel.querySelectorAll("a")];
    const first = links[0];
    const last = links.at(-1);
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      last?.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      menuToggle.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      menuToggle.focus();
    }
  }
});
desktopMenu.addEventListener("change", ({ matches }) => {
  if (matches && menuToggle?.getAttribute("aria-expanded") === "true") setMobileMenu(false, false);
});
const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
const entrances = [...document.querySelectorAll("[data-enter]")];
if (!motionPreference.matches && "IntersectionObserver" in window) {
  const entranceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("m-entered");
      entranceObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });
  entrances.forEach((el) => {
    // Hide only sections below the viewport, after the observer is ready.
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("m-enter-ready");
      entranceObserver.observe(el);
    }
  });
  motionPreference.addEventListener("change", ({ matches }) => {
    if (matches) {
      entrances.forEach((el) => el.classList.add("m-entered"));
      entranceObserver.disconnect();
    }
  });
}

const demo = document.querySelector("[data-workflow-demo]");
const motionToggle = document.querySelector("[data-motion-toggle]");
if (demo && motionToggle) {
  let userPaused = false;
  let inView = true;
  let timer = null;
  let activeStep = 0;
  const sources = [...demo.querySelectorAll("[data-step]")];
  const syncDemo = () => {
    const playing = !motionPreference.matches && !userPaused && inView && !document.hidden;
    demo.classList.toggle("is-playing", playing);
    motionToggle.hidden = motionPreference.matches;
    motionToggle.setAttribute("aria-pressed", String(userPaused));
    motionToggle.setAttribute("aria-label", userPaused ? "Play workflow animation" : "Pause workflow animation");
    motionToggle.querySelector("span").textContent = userPaused ? "Play" : "Pause";
    motionToggle.querySelector("img").src = userPaused ? "/assets/ui/play.svg" : "/assets/ui/pause.svg";
    if (timer) clearInterval(timer);
    timer = null;
    sources.forEach((source) => source.classList.remove("is-active"));
    if (playing) {
      const advance = () => {
        sources.forEach((source, index) => source.classList.toggle("is-active", index === activeStep));
        activeStep = (activeStep + 1) % sources.length;
      };
      advance();
      timer = setInterval(advance, 1900);
    }
  };
  motionToggle.addEventListener("click", () => { userPaused = !userPaused; syncDemo(); });
  motionPreference.addEventListener("change", syncDemo);
  document.addEventListener("visibilitychange", syncDemo);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncDemo(); }, { threshold: 0.05 }).observe(demo);
  }
  syncDemo();
}

/* All disclosure panels remain usable with native details when JS is absent. */
const workflowItems = [...document.querySelectorAll(".m-workflow-item")];
workflowItems.forEach((item) => item.addEventListener("toggle", () => {
  if (item.open) workflowItems.forEach((other) => { if (other !== item) other.open = false; });
}));

/* Start with ordinary fragment links; enhance to tabs only when JS is ready. */
const caseBrowser = document.querySelector("[data-case-browser]");
if (caseBrowser) {
  const navigation = caseBrowser.querySelector(".m-case-nav");
  const links = [...navigation.querySelectorAll("a")];
  const panels = [...caseBrowser.querySelectorAll("[data-case-panel]")];
  const selectCase = (index, focus = false) => {
    links.forEach((link, i) => {
      link.setAttribute("aria-selected", String(i === index));
      link.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) links[index].focus();
  };
  navigation.setAttribute("role", "tablist");
  links.forEach((link, index) => {
    link.id = panels[index].id + "-tab";
    link.setAttribute("role", "tab");
    link.setAttribute("aria-controls", panels[index].id);
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", link.id);
    panels[index].tabIndex = 0;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      selectCase(index);
    });
    link.addEventListener("keydown", (event) => {
      let next = index;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % links.length;
      else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index + links.length - 1) % links.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = links.length - 1;
      else return;
      event.preventDefault();
      selectCase(next, true);
    });
  });
  const selectHash = () => {
    const index = panels.findIndex((panel) => "#" + panel.id === window.location.hash);
    selectCase(index < 0 ? 0 : index);
  };
  caseBrowser.classList.add("is-enhanced");
  selectHash();
  window.addEventListener("hashchange", selectHash);
}

document.querySelectorAll(".m-marquee-track, .service-tool-row").forEach((track) => {
  if (track.dataset.marqueeReady) return;
  [...track.children].forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  track.dataset.marqueeReady = "true";
});
const loopScenes = document.querySelectorAll(".motion-board, .service-map-preview, .motion-flow-panel, .m-marquee, .service-tool-window");
if ("IntersectionObserver" in window) {
  const loopObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-paused", !entry.isIntersecting));
  });
  loopScenes.forEach((scene) => loopObserver.observe(scene));
}

/* The server-rendered stat is also the accessible, reduced-motion value. */
document.querySelectorAll("[data-count]").forEach((el) => {
  const finalText = el.textContent;
  if (motionPreference.matches || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    const start = performance.now();
    const target = Number(el.dataset.count);
    const tick = (now) => {
      const progress = Math.min((now - start) / 900, 1);
      if (motionPreference.matches || progress === 1) { el.textContent = finalText; return; }
      const value = target * (1 - Math.pow(1 - progress, 3));
      el.textContent = (el.dataset.prefix || "") + value.toLocaleString("en-CA", { maximumFractionDigits: Number(el.dataset.decimals || 0) }) + (el.dataset.suffix || "");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.3 });
  observer.observe(el);
});

document.querySelectorAll(".task-form").forEach((form) => {
  const action = form.getAttribute("action") || "";
  if (!action.startsWith("https://formspree.io/f/")) return;
  const status = document.createElement("p");
  status.className = "form-status";
  status.setAttribute("role", "status");
  form.appendChild(status);
  let submitting = false;
  form.addEventListener("submit", async (event) => {
    if (!("fetch" in window)) return;
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    const button = form.querySelector('[type="submit"]');
    const label = button?.textContent;
    if (button) { button.disabled = true; button.textContent = "Sending..."; }
    status.textContent = "";
    status.removeAttribute("data-state");
    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.dataset.state = "success";
      status.textContent = form.dataset.successMessage || "Your message is in our inbox. Expect a reply within one business day.";
    } catch {
      status.dataset.state = "error";
      status.textContent = "We could not send your message. Your text is still here. Try again or email hello@yudilabs.com.";
    } finally {
      submitting = false;
      if (button) { button.disabled = false; button.textContent = label; }
    }
  });
});

const languageButtons = document.querySelectorAll("[data-service-language]");
const languageBlocks = document.querySelectorAll("[data-service-copy]");
function setLanguage(language) {
  languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.serviceLanguage === language)));
  languageBlocks.forEach((block) => { block.hidden = block.dataset.serviceCopy !== language; });
}
if (languageButtons.length) {
  setLanguage("plain");
  languageButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.serviceLanguage)));
}

const calculator = document.querySelector("[data-roi-calculator]");
if (calculator) {
  const hours = calculator.querySelector("[data-roi-hours]");
  const rate = calculator.querySelector("[data-roi-rate]");
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const update = () => {
    const hourCount = Math.max(Number(hours.min), Math.min(Number(hours.max), Number(hours.value) || 0));
    const rateValue = Number(rate.value);
    const valid = rate.value !== "" && rate.checkValidity() && Number.isFinite(rateValue);
    hours.style.setProperty("--roi-fill", ((hourCount - Number(hours.min)) / (Number(hours.max) - Number(hours.min)) * 100) + "%");
    hours.setAttribute("aria-valuetext", hourCount + " hours per week");
    calculator.querySelector("[data-roi-hours-value]").textContent = hourCount;
    const yearlyHours = calculator.querySelector("[data-roi-year-hours]");
    if (yearlyHours) yearlyHours.textContent = (hourCount * 52).toLocaleString("en-US");
    calculator.querySelector("[data-roi-annual]").textContent = valid ? currency.format(hourCount * rateValue * 52) : "Enter a rate";
    calculator.querySelector("[data-roi-summary]").textContent = valid
      ? "Based on " + hourCount + " hours/week at " + currency.format(rateValue) + "/hour. USD; before automation costs."
      : "Enter an hourly cost between " + rate.min + " and " + rate.max + ".";
  };
  hours.addEventListener("input", update);
  rate.addEventListener("input", update);
  update();
}

const calendlyEmbed = document.querySelector("[data-calendly-url]");
if (calendlyEmbed) {
  const mount = () => {
    if (calendlyEmbed.dataset.calendlyReady) return;
    calendlyEmbed.dataset.calendlyReady = "true";
    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = calendlyEmbed.dataset.calendlyUrl + "?background_color=ffffff&text_color=17191c&primary_color=c43d2d";
    widget.style.minWidth = "280px";
    widget.style.height = "700px";
    calendlyEmbed.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { mount(); observer.disconnect(); }
    }, { rootMargin: "200px" });
    observer.observe(calendlyEmbed);
  } else mount();
}
