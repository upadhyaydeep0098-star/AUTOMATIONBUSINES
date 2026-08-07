/* Yudi Labs — interaction & motion engine
   Progressive enhancement only: every feature is gated on capability +
   prefers-reduced-motion, and the site is fully usable with JS disabled
   (see the html.js gate in each page's <head>). */

const header = document.querySelector(".m-header");
const menuToggle = document.querySelector(".m-menu-toggle");
const mobilePanel = document.querySelector("#mobile-nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* Entry gate runs once per session, never for reduced motion */
let gateActive = false;
if (document.querySelector("[data-gate]") && !reduceMotion) {
  try {
    gateActive = !sessionStorage.getItem("yl-gate-seen");
  } catch {
    gateActive = true;
  }
}
if (!gateActive) document.documentElement.classList.add("gate-off");

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
  if (gateActive) {
    // The entry gate arms the headline as its curtain lifts.
    window.__ylArmSplit = armSplit;
    // Safety net: never leave the headline hidden if the gate stalls.
    setTimeout(armSplit, 12000);
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(armSplit);
    });
    // rAF can be throttled in background tabs — never leave the headline hidden.
    setTimeout(armSplit, 400);
  }
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

/* ---------- Automation rail: the page runs as a pipeline ---------- */
const stageSections = document.querySelectorAll("[data-stage]");
if (stageSections.length >= 2 && !reduceMotion) {
  const rail = document.createElement("div");
  rail.className = "auto-rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML =
    '<div class="auto-rail-line"><span class="auto-rail-fill"></span></div>' +
    '<div class="auto-rail-pulse"></div>';
  const nodes = [];
  stageSections.forEach((section) => {
    const node = document.createElement("div");
    node.className = "auto-rail-node";
    node.innerHTML = `<span>${section.dataset.stage}</span>`;
    rail.appendChild(node);
    nodes.push({ el: node, section, p: 0 });
  });
  document.body.appendChild(rail);

  const placeNodes = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    nodes.forEach((n) => {
      n.p = docH > 0 ? Math.min(Math.max(n.section.offsetTop / docH, 0), 1) : 0;
      n.el.style.top = `${(n.p * 100).toFixed(2)}%`;
    });
  };

  let railTick = false;
  const updateRail = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
    rail.style.setProperty("--rail-p", p.toFixed(4));
    let activeIdx = -1;
    nodes.forEach((n, i) => {
      const done = p >= n.p - 0.005;
      n.el.classList.toggle("is-done", done);
      if (done) activeIdx = i;
    });
    nodes.forEach((n, i) => n.el.classList.toggle("is-active", i === activeIdx));
    railTick = false;
  };

  placeNodes();
  updateRail();
  window.addEventListener(
    "scroll",
    () => {
      if (!railTick) {
        railTick = true;
        requestAnimationFrame(updateRail);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    placeNodes();
    updateRail();
  });
  window.addEventListener("load", () => {
    placeNodes();
    updateRail();
  });
}

/* ---------- Assembly scene: scroll-scrubbed pinned choreography ---------- */
const assemble = document.querySelector("[data-assemble]");
if (assemble && !reduceMotion && window.matchMedia("(min-width: 901px)").matches) {
  const chips = [...assemble.querySelectorAll(".a-chip")];
  const slots = [...assemble.querySelectorAll(".assemble-slot")];
  const beam = assemble.querySelector(".assemble-beam");
  const out = assemble.querySelector(".assemble-out");
  const counter = assemble.querySelector("[data-assemble-count]");
  const status = assemble.querySelector("[data-assemble-status]");
  const TOTAL_STEPS = 47;
  const STATUS_LINES = [
    [0.0, "Eight manual tasks, scattered across the week…"],
    [0.18, "Collecting inputs — invoices, portals, inboxes…"],
    [0.4, "Checking fields and matching records…"],
    [0.62, "Updating sheets and systems…"],
    [0.82, "Escalating 3 exceptions to a person…"],
    [0.96, "Run complete — 47 steps, zero copy-paste."],
  ];
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const window01 = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

  let lastStatus = "";
  let scrubTick = false;
  const scrub = () => {
    const rect = assemble.getBoundingClientRect();
    const total = assemble.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;

    chips.forEach((chip, i) => {
      const start = 0.05 + i * 0.072;
      chip.style.setProperty("--t", easeOut(window01(p, start, start + 0.3)).toFixed(3));
    });
    slots.forEach((slot, i) => {
      const lastChipStart = 0.05 + (i * 2 + 1) * 0.072;
      slot.classList.toggle("is-filled", p >= lastChipStart + 0.3);
    });
    beam?.style.setProperty("--beam-p", window01(p, 0.1, 0.9).toFixed(3));
    out?.style.setProperty("--t", easeOut(window01(p, 0.78, 0.94)).toFixed(3));
    if (counter) {
      counter.textContent = Math.round(easeOut(window01(p, 0.5, 0.95)) * TOTAL_STEPS).toString();
    }
    if (status) {
      let line = STATUS_LINES[0][1];
      STATUS_LINES.forEach(([threshold, text]) => {
        if (p >= threshold) line = text;
      });
      if (line !== lastStatus) {
        lastStatus = line;
        status.textContent = line;
      }
    }
    scrubTick = false;
  };

  scrub();
  window.addEventListener(
    "scroll",
    () => {
      if (!scrubTick) {
        scrubTick = true;
        requestAnimationFrame(scrub);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", scrub);
}

/* ---------- Live hero run-log ---------- */
const liveLog = document.querySelector("[data-live-log]");
if (liveLog && !reduceMotion) {
  const LOG_LINES = [
    "Report downloaded",
    "Sheet updated",
    "3 exceptions found",
    "Invoice #1042 matched",
    "Portal status changed",
    "2 rows reconciled",
    "File renamed + filed",
    "CRM record created",
    "Reminder scheduled",
    "Exception → review queue",
  ];
  let logIdx = 3;
  let logVisible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => (logVisible = e.isIntersecting)),
      { rootMargin: "40px" }
    ).observe(liveLog);
  }
  setInterval(() => {
    if (!logVisible || document.hidden) return;
    const line = document.createElement("p");
    line.className = "log-in";
    line.innerHTML = "<i></i> " + LOG_LINES[logIdx % LOG_LINES.length];
    logIdx += 1;
    liveLog.appendChild(line);
    const entries = liveLog.querySelectorAll("p");
    if (entries.length > 3) entries[0].remove();
  }, 2600);
}

/* ---------- Entry gate: boot sequence + curtain reveal ---------- */
const gate = document.querySelector("[data-gate]");
if (gate && gateActive) {
  document.body.classList.add("gate-hold");
  const spacer = document.querySelector(".gate-space");
  const lines = [...gate.querySelectorAll(".gate-line")];
  const LINE_AT = [0.05, 0.13, 0.21, 0.29];
  const main = document.querySelector("main");
  let armed = false;
  let done = false;
  let gateTick = false;

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const win01 = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

  const markSeen = () => {
    try {
      sessionStorage.setItem("yl-gate-seen", "1");
    } catch {
      /* private mode — gate simply replays next visit */
    }
  };

  const update = () => {
    const runway = (spacer?.offsetHeight || window.innerHeight * 1.85) - 2;
    const p = Math.min(window.scrollY / runway, 1);

    lines.forEach((line, i) => line.classList.toggle("on", p >= LINE_AT[i]));
    gate.style.setProperty("--gp", win01(p, 0, 0.4).toFixed(3));
    gate.classList.toggle("is-titled", p >= 0.38);
    gate.classList.toggle("is-leaving", p >= 0.58);
    gate.style.setProperty("--gate-y", ease(win01(p, 0.6, 0.97)).toFixed(4));
    main?.style.setProperty("--arrive", ease(win01(p, 0.62, 0.98)).toFixed(3));

    if (p >= 0.7 && !armed) {
      armed = true;
      document.body.classList.remove("gate-hold");
      window.__ylArmSplit?.();
    }
    if (p >= 0.99 && !done) {
      done = true;
      gate.classList.add("is-done");
      markSeen();
    }
    if (p < 0.99 && done) {
      done = false;
      gate.classList.remove("is-done");
    }
    gateTick = false;
  };

  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!gateTick) {
        gateTick = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);

  gate.querySelector("[data-gate-enter]")?.addEventListener("click", () => {
    const runway = spacer?.offsetHeight || window.innerHeight * 1.85;
    window.scrollTo({ top: runway, behavior: "smooth" });
  });
} else if (gate) {
  // Gate skipped (repeat view or reduced motion): collapse it and let the
  // rail re-measure section offsets now that the runway is gone.
  window.dispatchEvent(new Event("resize"));
}
