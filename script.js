const header = document.querySelector("[data-nav]");
const animatedItems = document.querySelectorAll(
  "[data-animate], .work-card, .service-list article, .steps li, .contact-form",
);
const hero = document.querySelector("[data-hero]");
const quote = document.querySelector(".quote-band");
let lastScrollY = window.scrollY;
let ticking = false;

const updateHeader = () => {
  const currentScroll = window.scrollY;
  header.classList.toggle("is-scrolled", currentScroll > 16);
  header.classList.toggle("is-hidden", currentScroll > lastScrollY && currentScroll > 180);
  lastScrollY = Math.max(currentScroll, 0);
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateScrollMotion = () => {
  const scrollY = window.scrollY;

  if (hero) {
    const progress = clamp(scrollY / window.innerHeight, 0, 1);
    hero.style.setProperty("--hero-shift", `${progress * 64}px`);
    hero.style.setProperty("--hero-copy-shift", `${progress * -28}px`);
    hero.style.setProperty("--hero-overlay-opacity", `${1 - progress * 0.18}`);
  }

  if (quote) {
    const rect = quote.getBoundingClientRect();
    const quoteProgress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
    quote.style.setProperty("--quote-shift", `${(quoteProgress - 0.5) * -48}px`);
  }

  updateHeader();
  ticking = false;
};

const requestScrollMotion = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollMotion);
    ticking = true;
  }
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  animatedItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 80}ms`);
    revealObserver.observe(item);
  });
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

document.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion);
updateScrollMotion();

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.textContent = "Inquiry Sent";
  setTimeout(() => {
    button.textContent = "Send Inquiry";
    event.currentTarget.reset();
  }, 1800);
});
