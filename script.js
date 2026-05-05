const body = document.body;
const modeToggle = document.querySelector("[data-mode-toggle]");
const quotePanel = document.querySelector("[data-quote-panel]");
const quoteOpen = document.querySelector("[data-quote-open]");
const quoteClose = document.querySelector("[data-quote-close]");
const networkCanvas = document.querySelector("[data-network]");
const animatedItems = document.querySelectorAll("[data-animate]");

modeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

quoteOpen.addEventListener("click", () => {
  quotePanel.classList.add("is-open");
});

quoteClose.addEventListener("click", () => {
  quotePanel.classList.remove("is-open");
});

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

const createNetwork = (canvas) => {
  const context = canvas.getContext("2d");
  const colors = ["#ff4f5a", "#9d37f2", "#5358ff", "#050505"];
  let width = 0;
  let height = 0;
  let points = [];
  let mouse = { x: 0.5, y: 0.5 };

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 520 ? 38 : 48;
    points = Array.from({ length: count }, (_, index) => {
      const ring = index / count;
      const angle = ring * Math.PI * 7.2;
      const radius = Math.min(width, height) * (0.12 + ring * 0.34);
      return {
        x: width * 0.5 + Math.cos(angle) * radius + (Math.random() - 0.5) * 38,
        y: height * 0.5 + Math.sin(angle) * radius + (Math.random() - 0.5) * 38,
        baseX: width * 0.5 + Math.cos(angle) * radius,
        baseY: height * 0.5 + Math.sin(angle) * radius,
        size: Math.random() * 7 + 4,
        color: colors[index % colors.length],
        speed: Math.random() * 0.7 + 0.35,
      };
    });
  };

  const drawLines = (time) => {
    context.setLineDash([2, 7]);
    context.lineWidth = 1.3;
    context.strokeStyle = body.classList.contains("dark-mode") ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.52)";

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < Math.min(width, height) * 0.22) {
          context.globalAlpha = 1 - distance / (Math.min(width, height) * 0.22);
          context.beginPath();
          context.moveTo(points[i].x, points[i].y);
          context.quadraticCurveTo(width * 0.5, height * 0.5 + Math.sin(time * 0.001) * 16, points[j].x, points[j].y);
          context.stroke();
        }
      }
    }

    context.setLineDash([]);
    context.globalAlpha = 1;
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    const cx = width * (0.5 + (mouse.x - 0.5) * 0.04);
    const cy = height * (0.5 + (mouse.y - 0.5) * 0.04);

    points.forEach((point, index) => {
      const orbit = time * 0.00022 * point.speed + index;
      point.x += (point.baseX + Math.cos(orbit) * 20 - point.x + (cx - width * 0.5) * 0.08) * 0.035;
      point.y += (point.baseY + Math.sin(orbit) * 20 - point.y + (cy - height * 0.5) * 0.08) * 0.035;
    });

    drawLines(time);

    points.forEach((point, index) => {
      const pulse = Math.sin(time * 0.003 + index) * 0.35 + 1;
      context.beginPath();
      context.fillStyle = point.color;
      context.arc(point.x, point.y, point.size * pulse, 0, Math.PI * 2);
      context.fill();
    });

    window.requestAnimationFrame(draw);
  };

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  });

  resize();
  window.addEventListener("resize", resize);
  window.requestAnimationFrame(draw);
};

createNetwork(networkCanvas);
