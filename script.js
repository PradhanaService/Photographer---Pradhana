const body = document.body;
const preloader = document.querySelector("[data-preloader]");
const modeToggle = document.querySelector("[data-mode-toggle]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const quotePanel = document.querySelector("[data-quote-panel]");
const quoteOpen = document.querySelector("[data-quote-open]");
const quoteClose = document.querySelector("[data-quote-close]");
const quoteFlow = document.querySelector("[data-quote-flow]");
const quoteSteps = [...document.querySelectorAll(".quote-step")];
const quoteProgress = [...document.querySelectorAll(".quote-progress span")];
const quoteBack = document.querySelector("[data-quote-back]");
const quoteNext = document.querySelector("[data-quote-next]");
const quoteSuccess = document.querySelector("[data-quote-success]");
const networkCanvas = document.querySelector("[data-network]");
const animatedItems = document.querySelectorAll("[data-animate]");
const stickySection = document.querySelector(".sticky-services");
const stickyCards = [...document.querySelectorAll(".sticky-card")];
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorRing = document.querySelector("[data-cursor-ring]");
const magneticItems = document.querySelectorAll(".magnetic, button, .browser-card, .quote-options button, summary");
const tabButtons = document.querySelectorAll(".tab-rail button");
const sectionLabel = document.querySelector("[data-section-label]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const namedSections = [...document.querySelectorAll("[data-section-name]")];

let quoteStep = 0;
const quoteSelections = {};

body.classList.add("is-loading");

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.classList.add("is-done");
    body.classList.remove("is-loading");
  }, 650);
});

const setQuoteStep = (index) => {
  quoteStep = Math.max(0, Math.min(index, quoteSteps.length - 1));
  quoteSteps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === quoteStep));
  quoteProgress.forEach((item, itemIndex) => item.classList.toggle("active", itemIndex <= quoteStep));
  quoteBack.disabled = quoteStep === 0;
  quoteNext.textContent = quoteStep === quoteSteps.length - 1 ? "Submit request" : "Continue ->";
};

modeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  body.style.overflow = isOpen ? "hidden" : "";
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    body.style.overflow = "";
  });
});

quoteOpen.addEventListener("click", () => {
  quotePanel.classList.add("is-open");
  setQuoteStep(0);
});

quoteClose.addEventListener("click", () => {
  quotePanel.classList.remove("is-open");
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.choice;
    quoteSelections[key] = button.textContent.trim();
    document.querySelectorAll(`[data-choice="${key}"]`).forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    setTimeout(() => setQuoteStep(quoteStep + 1), 160);
  });
});

quoteBack.addEventListener("click", () => setQuoteStep(quoteStep - 1));

quoteNext.addEventListener("click", () => {
  if (quoteStep < quoteSteps.length - 1) {
    setQuoteStep(quoteStep + 1);
    return;
  }

  quoteFlow.classList.add("is-complete");
  quoteSuccess.textContent = `Done. Your ${quoteSelections.service || "BrandIdentity"} request is ready.`;
  quoteNext.textContent = "Submitted";
  setTimeout(() => {
    quotePanel.classList.remove("is-open");
    quoteFlow.classList.remove("is-complete");
    setQuoteStep(0);
  }, 1800);
});

setQuoteStep(0);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.16, rootMargin: "-6% 0px -10% 0px" },
  );

  animatedItems.forEach((item) => revealObserver.observe(item));
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

const updateStickyCards = () => {
  if (!stickySection || window.innerWidth <= 900) return;
  const rect = stickySection.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
  const index = Math.floor(progress * stickyCards.length);
  stickyCards.forEach((card, cardIndex) => card.classList.toggle("active", cardIndex === index));
};

const updateScrollStatus = () => {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
  scrollProgress.style.setProperty("--scroll-progress", `${progress}%`);

  let current = namedSections[0]?.dataset.sectionName || "Home";
  namedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.42 && rect.bottom > window.innerHeight * 0.28) {
      current = section.dataset.sectionName;
    }
  });
  sectionLabel.textContent = current;

  if (networkCanvas) {
    const heroProgress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    networkCanvas.style.setProperty("--network-shift", `${heroProgress * -18}px`);
    networkCanvas.style.setProperty("--network-scale", `${1 - heroProgress * 0.035}`);
  }
};

const setupCursor = () => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let dotX = 0;
  let dotY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener("pointermove", (event) => {
    body.classList.add("cursor-ready");
    dotX = event.clientX;
    dotY = event.clientY;
    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
  });

  const render = () => {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };

  magneticItems.forEach((item) => {
    item.addEventListener("pointerenter", () => body.classList.add("cursor-hover"));
    item.addEventListener("pointerleave", () => {
      body.classList.remove("cursor-hover");
      item.style.transform = "";
    });
    item.addEventListener("pointermove", (event) => {
      if (!item.classList.contains("magnetic")) return;
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  render();
};

setupCursor();

const createNetwork = (canvas) => {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let points = [];
  let mouse = { x: 0.5, y: 0.5, active: false };

  const palette = () =>
    body.classList.contains("dark-mode")
      ? ["#ff5f83", "#b56cff", "#7f83ff", "#ffffff"]
      : ["#ff4f5a", "#9d37f2", "#5358ff", "#050505"];

  const brainPoint = (index, count) => {
    const t = (index / count) * Math.PI * 2;
    const outline = index < count * 0.62;
    const side = index % 2 === 0 ? -1 : 1;
    const lobeCenter = side === -1 ? 0.42 : 0.58;

    if (outline) {
      const lobe = Math.sin(t * 3) * 0.08 + 1;
      return {
        x: lobeCenter + Math.cos(t) * 0.18 * lobe,
        y: 0.5 + Math.sin(t) * 0.29 * (0.92 + Math.cos(t * 2) * 0.06),
      };
    }

    const spiral = (index / count) * Math.PI * 9;
    const radius = 0.04 + ((index % 14) / 14) * 0.16;
    return {
      x: 0.5 + Math.cos(spiral) * radius + Math.sin(spiral * 0.5) * 0.03,
      y: 0.5 + Math.sin(spiral) * radius * 1.25,
    };
  };

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 520 ? 46 : 60;
    const colors = palette();

    points = Array.from({ length: count }, (_, index) => {
      const point = brainPoint(index, count);
      const jitter = width < 520 ? 0.035 : 0.028;
      return {
        x: (point.x + (Math.random() - 0.5) * jitter) * width,
        y: (point.y + (Math.random() - 0.5) * jitter) * height,
        baseX: point.x * width,
        baseY: point.y * height,
        size: index % 7 === 0 ? 13 : Math.random() * 5 + 4,
        color: colors[index % colors.length],
        speed: Math.random() * 0.7 + 0.28,
      };
    });
  };

  const drawLines = (time) => {
    const lineColor = body.classList.contains("dark-mode") ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.34)";
    context.setLineDash([2, 7]);
    context.lineWidth = 1.15;
    context.strokeStyle = lineColor;

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const limit = Math.min(width, height) * 0.18;
        if (distance < limit) {
          context.globalAlpha = (1 - distance / limit) * 0.86;
          context.beginPath();
          context.moveTo(points[i].x, points[i].y);
          context.quadraticCurveTo(
            width * 0.5 + Math.sin(time * 0.0007) * 10,
            height * 0.5 + Math.cos(time * 0.0008) * 10,
            points[j].x,
            points[j].y,
          );
          context.stroke();
        }
      }
    }

    context.setLineDash([]);
    context.globalAlpha = 1;
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    const cx = width * mouse.x;
    const cy = height * mouse.y;

    points.forEach((point, index) => {
      const orbit = time * 0.00018 * point.speed + index;
      const dx = point.x - cx;
      const dy = point.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const attraction = mouse.active ? Math.max(0, 1 - distance / 260) : 0;
      point.x += (point.baseX + Math.cos(orbit) * 12 - point.x - dx * attraction * 0.032) * 0.045;
      point.y += (point.baseY + Math.sin(orbit) * 12 - point.y - dy * attraction * 0.032) * 0.045;
    });

    drawLines(time);

    points.forEach((point, index) => {
      const pulse = Math.sin(time * 0.0024 + index) * 0.22 + 1;
      context.beginPath();
      context.fillStyle = point.color;
      context.arc(point.x, point.y, point.size * pulse, 0, Math.PI * 2);
      context.fill();
    });

    requestAnimationFrame(draw);
  };

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      active: true,
    };
  });

  canvas.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  resize();
  window.addEventListener("resize", resize);
  modeToggle.addEventListener("click", () => setTimeout(resize, 20));
  requestAnimationFrame(draw);
};

createNetwork(networkCanvas);
window.addEventListener(
  "scroll",
  () => {
    updateStickyCards();
    updateScrollStatus();
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  updateStickyCards();
  updateScrollStatus();
});
updateStickyCards();
updateScrollStatus();
