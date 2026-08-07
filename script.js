/* Yudi Labs — interaction & motion engine
   Progressive enhancement only: every feature is gated on capability +
   prefers-reduced-motion, and the site is fully usable with JS disabled
   (see the html.js gate in each page's <head>). */

const header = document.querySelector(".m-header");
const menuToggle = document.querySelector(".m-menu-toggle");
const mobilePanel = document.querySelector("#mobile-nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Header state ---------- */
function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

/* ---------- Scroll progress bar ---------- */
if (!reduceMotion) {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.appendChild(document.createElement("span"));
  document.body.appendChild(progress);

  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.setProperty("--scroll-progress", value.toFixed(4));
    ticking = false;
  };
  updateProgress();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );
}

/* ---------- Mobile navigation ---------- */
function setMobileMenu(open) {
  if (!menuToggle || !mobilePanel) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.classList.toggle("is-open", open);
  mobilePanel.hidden = !open;
  document.body.classList.toggle("nav-open", open);
  if (open) {
    mobilePanel.querySelector("a")?.focus({ preventScroll: true });
  } else {
    menuToggle.focus({ preventScroll: true });
  }
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
  if (window.innerWidth > 860 && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMobileMenu(false);
  }
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("in-view"));
} else if (revealEls.length) {
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
}

/* ---------- Pause looping animations while offscreen ---------- */
const loopScenes = document.querySelectorAll(
  ".motion-board, .service-map-preview, .motion-flow-panel, .m-marquee, .service-tool-window, .m-pill"
);
if ("IntersectionObserver" in window && loopScenes.length && !reduceMotion) {
  const pauseIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-paused", !entry.isIntersecting);
      });
    },
    { rootMargin: "80px" }
  );
  loopScenes.forEach((el) => pauseIO.observe(el));
}

/* ---------- Animated stat counters ---------- */
const counters = document.querySelectorAll("[data-count]");
if (counters.length) {
  const finishCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    el.textContent =
      (el.dataset.prefix || "") +
      target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (el.dataset.suffix || "");
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    counters.forEach(finishCounter);
  } else {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const duration = 1400;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent =
          prefix +
          (target * ease(p)).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          suffix;
        if (p < 1) requestAnimationFrame(tick);
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
}

/* ---------- Marquee — duplicate children once for a seamless -50% loop ---------- */
document.querySelectorAll(".m-marquee-track, .service-tool-row").forEach((track) => {
  if (track.dataset.marqueeReady === "true") return;
  [...track.children].forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  track.dataset.marqueeReady = "true";
});

/* ---------- Parallax + 3D tilt scenes ([data-parallax-scene]) ---------- */
document.querySelectorAll("[data-parallax-scene]").forEach((scene) => {
  if (reduceMotion || !finePointer) return;
  const layers = scene.querySelectorAll("[data-depth]");
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let raf = null;

  const render = () => {
    x += (targetX - x) * 0.08;
    y += (targetY - y) * 0.08;
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      layer.style.setProperty("--px", `${(x * depth * 46).toFixed(2)}px`);
      layer.style.setProperty("--py", `${(y * depth * 46).toFixed(2)}px`);
    });
    scene.style.setProperty("--tilt-y", `${(x * 3.4).toFixed(2)}deg`);
    scene.style.setProperty("--tilt-x", `${(-y * 3.4).toFixed(2)}deg`);
    if (Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  };

  scene.addEventListener(
    "pointermove",
    (event) => {
      const rect = scene.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(render);
    },
    { passive: true }
  );

  scene.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(render);
  });
});

/* ---------- Magnetic primary buttons ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".m-btn, .button-primary, .m-cta").forEach((btn) => {
    const strength = 0.24;
    btn.addEventListener(
      "pointermove",
      (event) => {
        const rect = btn.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        btn.style.setProperty("--mx", `${(dx * strength).toFixed(1)}px`);
        btn.style.setProperty("--my", `${(dy * strength).toFixed(1)}px`);
      },
      { passive: true }
    );
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--mx", "0px");
      btn.style.setProperty("--my", "0px");
    });
  });
}

/* ---------- Hero headline: word-by-word rise ---------- */
const displayEl = document.querySelector(".m-display");
if (displayEl && !reduceMotion) {
  const splitWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (!part.trim()) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "split-word";
          const inner = document.createElement("span");
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        splitWords(child);
      }
    });
  };
  splitWords(displayEl);
  displayEl.classList.remove("reveal", "reveal-delay-1");
  displayEl.classList.add("in-view");
  displayEl.querySelectorAll(".split-word > span").forEach((el, i) => {
    el.style.transitionDelay = `${120 + i * 70}ms`;
  });
  const armSplit = () => displayEl.classList.add("split-ready");
  requestAnimationFrame(() => {
    requestAnimationFrame(armSplit);
  });
  // rAF can be throttled in background tabs — never leave the headline hidden.
  setTimeout(armSplit, 400);
}

/* ---------- Hero cursor glow (fine pointers only) ---------- */
const heroEl = document.querySelector(".m-hero, .page-hero");
if (heroEl && !reduceMotion && finePointer) {
  const glow = document.createElement("div");
  glow.className = "m-cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  heroEl.appendChild(glow);

  let targetX = heroEl.offsetWidth * 0.68;
  let targetY = heroEl.offsetHeight * 0.42;
  let x = targetX;
  let y = targetY;
  let raf = null;

  const render = () => {
    x += (targetX - x) * 0.09;
    y += (targetY - y) * 0.09;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  };

  glow.style.transform = `translate(${x}px, ${y}px)`;

  heroEl.addEventListener(
    "pointermove",
    (event) => {
      const rect = heroEl.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(render);
    },
    { passive: true }
  );
}

/* ---------- Forms: AJAX submit with inline status ---------- */
document.querySelectorAll(".task-form").forEach((form) => {
  const action = form.getAttribute("action") || "";
  if (!action.startsWith("https://formspree.io/f/")) return;

  let status = form.querySelector(".form-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);
  }

  form.addEventListener("submit", async (event) => {
    if (!("fetch" in window)) return; // native POST fallback
    event.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const restoreLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    status.textContent = "";
    status.removeAttribute("data-state");

    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.dataset.state = "success";
      status.textContent =
        form.dataset.successMessage ||
        "Got it — your message is in our inbox. Expect an honest reply within one business day.";
    } catch {
      status.dataset.state = "error";
      status.textContent =
        "Something went wrong sending the form. Please email us directly at hello@yudilabs.com.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = restoreLabel;
      }
    }
  });
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

    if (hoursInput) {
      const min = Number(hoursInput.min || 0);
      const max = Number(hoursInput.max || 100);
      const fill = ((hours - min) / (max - min)) * 100;
      hoursInput.style.setProperty("--roi-fill", `${fill.toFixed(1)}%`);
      hoursInput.setAttribute("aria-valuetext", `${hours} hours per week`);
    }
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

/* ---------- Floating CTA (pages with data-floating-cta on <body>) ---------- */
if (document.body.dataset.floatingCta !== undefined && !sessionStorage.getItem("yl-cta-dismissed")) {
  const pill = document.createElement("div");
  pill.className = "floating-cta";
  pill.innerHTML =
    '<a href="https://calendly.com/hello-yudilabs/30min" target="_blank" rel="noopener noreferrer">Book a free 30-min call<span class="sr-only"> (opens in new tab)</span></a>' +
    '<button type="button" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(pill);

  pill.querySelector("button")?.addEventListener("click", () => {
    pill.classList.remove("is-visible");
    sessionStorage.setItem("yl-cta-dismissed", "1");
  });

  let shown = false;
  window.addEventListener(
    "scroll",
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const past = max > 0 ? window.scrollY / max : 0;
      const show = past > 0.45 && past < 0.96;
      if (show !== shown) {
        shown = show;
        pill.classList.toggle("is-visible", show);
      }
    },
    { passive: true }
  );
}

/* ---------- Calendly inline embed (contact page) ---------- */
const calendlyEmbed = document.querySelector("[data-calendly-url]");
if (calendlyEmbed) {
  const mount = () => {
    if (calendlyEmbed.dataset.calendlyReady === "true") return;
    calendlyEmbed.dataset.calendlyReady = "true";
    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = `${calendlyEmbed.dataset.calendlyUrl}?hide_gdpr_banner=1&background_color=0d1614&text_color=eef4f2&primary_color=2dd4bf`;
    widget.style.minWidth = "300px";
    widget.style.height = "700px";
    calendlyEmbed.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  };
  if ("IntersectionObserver" in window) {
    const embedIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mount();
            embedIO.disconnect();
          }
        });
      },
      { rootMargin: "400px" }
    );
    embedIO.observe(calendlyEmbed);
  } else {
    mount();
  }
}
