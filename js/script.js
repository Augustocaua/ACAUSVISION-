const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".mobile-panel a");
const hero = document.querySelector(".hero");
const methodSteps = document.querySelectorAll("#metodo .method-step");

function setupMethodStepTouch() {
  if (!methodSteps.length) return;

  const clearActiveSteps = (exclude) => {
    methodSteps.forEach((step) => {
      if (step !== exclude) step.classList.remove("is-active");
    });
  };

  methodSteps.forEach((step) => {
    const toggle = (event) => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      event.preventDefault();
      const willActivate = !step.classList.contains("is-active");
      clearActiveSteps(step);
      step.classList.toggle("is-active", willActivate);
    };

    step.addEventListener("click", toggle);
    step.addEventListener("touchstart", toggle, { passive: false });
  });

  document.addEventListener("click", (event) => {
    const within = event.target.closest("#metodo .method-step");
    if (!within) clearActiveSteps();
  });
}

setupMethodStepTouch();

function setupMethodTimeline() {
  const methodSection = document.querySelector("#metodo");
  const timeline = document.querySelector(".method-timeline");
  const lineFill = document.querySelector(".method-line-fill");
  const dots = document.querySelectorAll(".method-dot");

  if (!methodSection || !timeline || !lineFill || !dots.length) return;

  const steps = Array.from(document.querySelectorAll("#metodo .method-step"));
  let methodRaf = 0;

  const layoutDots = () => {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top + window.scrollY;
    const timelineHeight = timelineRect.height || 1;

    steps.forEach((step, idx) => {
      if (!dots[idx]) return;
      const rect = step.getBoundingClientRect();
      const stepCenter = rect.top + window.scrollY + rect.height / 2 - timelineTop;
      const pct = Math.max(0, Math.min(100, (stepCenter / timelineHeight) * 100));
      dots[idx].style.top = `${pct}%`;
    });
  };

  const queueUpdate = () => {
    if (methodRaf) return;
    methodRaf = requestAnimationFrame(() => {
      methodRaf = 0;
      updateTimeline();
    });
  };

  const clearCurrentSteps = () => steps.forEach(s => s.classList.remove("is-current"));
  const markDotsLit = (upToIndex) => {
    dots.forEach((d, i) => d.classList.toggle("is-lit", i <= upToIndex));
  };

  const updateTimeline = () => {
    const section = methodSection.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vhMid = vh * 0.5;
    const start = Math.min(vh * 0.9, section.bottom - 1);
    const end = Math.max(section.top, 40);
    const total = start - end;

    const progress = total > 0
      ? Math.max(0, Math.min(1, (start - vhMid) / total))
      : (vhMid <= section.top ? 0 : 1);

    if (lineFill) lineFill.style.height = `${progress * 100}%`;

    const litIndex = progress >= 0.97 ? steps.length - 1
      : steps.findIndex((s, idx) => {
          const next = steps[idx + 1];
          const stepProgress = idx / Math.max(1, steps.length - 1);
          const nextProgress = next ? (idx + 1) / Math.max(1, steps.length - 1) : 1;
          return progress >= stepProgress && progress < nextProgress;
        });

    const activeIdx = litIndex < 0 ? (progress >= 0.02 ? 0 : -1) : litIndex;
    clearCurrentSteps();
    if (activeIdx >= 0 && steps[activeIdx]) steps[activeIdx].classList.add("is-current");
    markDotsLit(activeIdx);
  };

  const methodObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          layoutDots();
          queueUpdate();
        }
      });
    },
    { threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1] }
  );

  methodObserver.observe(methodSection);

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", () => {
    layoutDots();
    queueUpdate();
  }, { passive: true });

  layoutDots();
  updateTimeline();
}

setupMethodTimeline();

function closeMenu() {
  body.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "abrir menu");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "fechar menu" : "abrir menu");
});

menuLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

function setupHeroVideo() {
  if (!hero) return;

  const servicesSection = document.querySelector("#servicos");

  if (document.querySelector(".hero-video-layer")) return;

  const videoLayer = document.createElement("div");
  videoLayer.className = "hero-video-layer";
  videoLayer.setAttribute("aria-hidden", "true");

  const video = document.createElement("video");
  video.className = "hero-video";
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.disablePictureInPicture = true;
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("aria-hidden", "true");
  video.setAttribute("data-video-source", "hero");

  const source = document.createElement("source");
  source.src = "videobackgraund.mp4";
  source.type = "video/mp4";
  video.appendChild(source);
  video.src = "videobackgraund.mp4";
  try { video.load(); } catch (err) {}

  const markVideoReady = () => {
    video.classList.add("is-ready");
    syncCoverage();
    try {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    } catch (err) {}
  };

  video.addEventListener("loadeddata", markVideoReady, { once: true });
  video.addEventListener("canplay", markVideoReady, { once: true });
  video.addEventListener("error", () => {
    video.classList.remove("is-ready");
  });

  videoLayer.append(video);
  if (document.body.firstElementChild) {
    document.body.insertBefore(videoLayer, document.body.firstElementChild);
  } else {
    document.body.appendChild(videoLayer);
  }

  let rafId = 0;
  const queueCoverageSync = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncCoverage();
    });
  };

  function syncCoverage() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const heroRect = hero.getBoundingClientRect();
    const servicesRect = servicesSection && servicesSection.getBoundingClientRect
      ? servicesSection.getBoundingClientRect()
      : null;

    const blockTop = heroRect.top;
    const blockBottom = servicesRect
      ? Math.max(heroRect.bottom, servicesRect.bottom)
      : heroRect.bottom;
    const isInViewport = blockBottom > 0 && blockTop < viewportHeight;

    if (!isInViewport) {
      videoLayer.style.clipPath = "inset(0 0 100% 0)";
      videoLayer.classList.remove("is-active");
      if (!video.paused) {
        try { video.pause(); } catch (err) {}
      }
      return;
    }

    const clipTop = Math.max(0, blockTop);
    const clipBottom = Math.max(0, viewportHeight - blockBottom);
    videoLayer.style.clipPath = `inset(${clipTop}px 0 ${clipBottom}px 0)`;
    videoLayer.classList.add("is-active");
    if (video.paused && video.readyState >= 2) {
      try {
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(() => {});
        }
      } catch (err) {}
    }
  }

  const coverageObserver = new IntersectionObserver(
    () => queueCoverageSync(),
    {
      threshold: [0, 0.01, 0.15, 0.3, 0.5, 0.7, 1],
      rootMargin: "0px"
    }
  );

  coverageObserver.observe(hero);
  if (servicesSection) coverageObserver.observe(servicesSection);
  window.addEventListener("scroll", queueCoverageSync, { passive: true });
  window.addEventListener("resize", queueCoverageSync, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") queueCoverageSync();
  });
  queueCoverageSync();
}

setupHeroVideo();

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -80px 0px"
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const canvas = document.querySelector(".hero-canvas");
const ctx = canvas?.getContext("2d");
let width = 0;
let height = 0;
let points = [];
let animationFrame;
let canvasLineRgb = "202, 190, 181";
let canvasDotRgb = "255, 255, 255";

function syncCanvasPalette() {
  const styles = getComputedStyle(document.documentElement);
  canvasLineRgb = styles.getPropertyValue("--canvas-line-rgb").trim() || canvasLineRgb;
  canvasDotRgb = styles.getPropertyValue("--canvas-dot-rgb").trim() || canvasDotRgb;
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const total = width < 760 ? 28 : 46;
  points = Array.from({ length: total }, (_, index) => ({
    x: (width / total) * index + Math.random() * 80,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18
  }));
}

function drawNetwork() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  points.forEach((point) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;
  });

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 160) {
        ctx.strokeStyle = `rgba(${canvasLineRgb}, ${0.12 - distance / 1600})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  points.forEach((point) => {
    ctx.fillStyle = `rgba(${canvasDotRgb}, 0.18)`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initCanvas() {
  if (!canvas || !ctx) return;
  cancelAnimationFrame(animationFrame);
  syncCanvasPalette();
  resizeCanvas();

  if (!prefersReducedMotion.matches) {
    drawNetwork();
  }
}

if (canvas && ctx) {
  window.addEventListener("resize", initCanvas);
  prefersReducedMotion.addEventListener("change", initCanvas);
  initCanvas();
}
