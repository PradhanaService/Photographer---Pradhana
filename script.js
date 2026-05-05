const header = document.querySelector("[data-nav]");
const animatedItems = document.querySelectorAll(
  "[data-animate], .work-card, .service-list article, .steps li, .contact-form",
);
const hero = document.querySelector("[data-hero]");
const quote = document.querySelector(".quote-band");
const heroCanvas = document.querySelector("[data-hero-canvas]");
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
    hero.style.setProperty("--holo-shift", `${progress * 36}px`);
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
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.16, rootMargin: "-6% 0px -10% 0px" },
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

const createFallbackParticles = (canvas) => {
  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.0007 + 0.00025,
  }));

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < -0.02) particle.y = 1.02;
      const x = particle.x * canvas.clientWidth;
      const y = particle.y * canvas.clientHeight;
      const size = particle.z * 2.4;
      context.beginPath();
      context.fillStyle = particle.z > 0.65 ? "rgba(40, 215, 255, 0.72)" : "rgba(255, 61, 113, 0.45)";
      context.shadowColor = context.fillStyle;
      context.shadowBlur = 14;
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    });
    window.requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  draw();
};

const initHeroScene = async () => {
  if (!heroCanvas) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js");
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const core = new THREE.IcosahedronGeometry(1.65, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x28d7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(core, coreMaterial);
    coreMesh.position.set(2.35, 0.18, 0.35);
    scene.add(coreMesh);

    const halo = new THREE.TorusKnotGeometry(1.25, 0.018, 180, 12);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3d71,
      transparent: true,
      opacity: 0.98,
    });
    const haloMesh = new THREE.Mesh(halo, haloMaterial);
    haloMesh.position.copy(coreMesh.position);
    scene.add(haloMesh);

    const particleCount = 480;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorA = new THREE.Color(0x28d7ff);
    const colorB = new THREE.Color(0xff3d71);
    const colorC = new THREE.Color(0x40ffc8);

    for (let i = 0; i < particleCount; i += 1) {
      const radius = 3 + Math.random() * 5.8;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;

      const mixed = colorA.clone().lerp(Math.random() > 0.5 ? colorB : colorC, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    const grid = new THREE.GridHelper(12, 24, 0x28d7ff, 0x7c3cff);
    grid.position.set(1.5, -2.28, -0.5);
    grid.rotation.x = Math.PI * 0.03;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    scene.add(grid);

    const resize = () => {
      const width = heroCanvas.clientWidth;
      const height = heroCanvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const mobile = width < 700;
      coreMesh.position.set(mobile ? 2.08 : 2.35, mobile ? -0.25 : 0.18, 0.35);
      haloMesh.position.copy(coreMesh.position);
      coreMesh.scale.setScalar(mobile ? 0.62 : 1);
      haloMesh.scale.setScalar(mobile ? 0.62 : 1);
    };

    const animate = () => {
      const time = performance.now() * 0.001;
      coreMesh.rotation.x = time * 0.22;
      coreMesh.rotation.y = time * 0.34;
      haloMesh.rotation.x = time * 0.28;
      haloMesh.rotation.y = -time * 0.38;
      particleField.rotation.y = time * 0.025;
      particleField.rotation.x = Math.sin(time * 0.3) * 0.025;
      grid.position.z = Math.sin(time * 0.45) * 0.16 - 0.5;
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();
  } catch (error) {
    createFallbackParticles(heroCanvas);
  }
};

initHeroScene();
