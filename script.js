/* =========================================================
   IFA'S PORTFOLIO — interactions
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Starfield background ---------- */
(function starfield() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, stars = [], shooting = [];
  let mouseX = 0, mouseY = 0, offX = 0, offY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    const count = Math.floor((window.innerWidth * window.innerHeight) / 4500);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.2 + 0.2) * dpr,
      depth: Math.random() * 0.8 + 0.2, // parallax layer
      tw: Math.random() * Math.PI * 2,  // twinkle phase
      hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 280 : 45) : 0,
    }));
  }

  function spawnShootingStar() {
    shooting.push({
      x: Math.random() * w * 0.7 + w * 0.3,
      y: Math.random() * h * 0.4,
      len: (Math.random() * 80 + 60) * dpr,
      speed: (Math.random() * 6 + 8) * dpr,
      life: 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    offX += (mouseX - offX) * 0.05;
    offY += (mouseY - offY) * 0.05;
    const scrollShift = window.scrollY * 0.15 * dpr;

    for (const s of stars) {
      s.tw += 0.02;
      const alpha = 0.45 + Math.sin(s.tw) * 0.35;
      let x = s.x + offX * s.depth * 20 * dpr;
      let y = (s.y - scrollShift * s.depth) % h;
      if (y < 0) y += h;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue
        ? `hsla(${s.hue}, 90%, 75%, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len * 0.5);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y - s.len * 0.5);
      ctx.stroke();
      s.x -= s.speed;
      s.y += s.speed * 0.5;
      s.life -= 0.015;
      if (s.life <= 0) shooting.splice(i, 1);
    }

    if (Math.random() < 0.004) spawnShootingStar();
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  resize();
  if (reduceMotion) {
    // draw a single static frame
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
    });
  } else {
    draw();
  }
})();

/* ---------- Cursor glow ---------- */
const glow = document.querySelector(".cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* ---------- Nav: scrolled state, progress bar, mobile menu ---------- */
const nav = document.getElementById("nav");
const progress = document.querySelector(".scroll-progress");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

function onScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 20);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function toggleMenu(force) {
  const open = force ?? !navLinks.classList.contains("open");
  navLinks.classList.toggle("open", open);
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", open);
}
hamburger.addEventListener("click", () => toggleMenu());
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleMenu(false));

/* ---------- Active nav link by section ---------- */
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.querySelectorAll("a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- Reveal on scroll (with stagger) ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--d", `${siblings.indexOf(el) * 0.08}s`);
  revealObserver.observe(el);
});

/* ---------- Typing effect ---------- */
(function typing() {
  const el = document.getElementById("typed");
  const words = ["Mathematics Student", "Problem Solver", "Guitar Enthusiast", "Web Explorer"];
  if (reduceMotion) return;
  let wi = 0, ci = words[0].length, deleting = true;

  function tick() {
    const word = words[wi];
    el.textContent = word.slice(0, ci);
    let delay = deleting ? 45 : 90;

    if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      delay = 300;
    } else if (!deleting && ci === words[wi].length) {
      deleting = true;
      delay = 1800;
    }
    ci += deleting ? -1 : 1;
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2200);
})();

/* ---------- 3D tilt on project cards ---------- */
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-6px)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Image fallback (if a file is missing) ---------- */
document.querySelectorAll("img[data-fallback]").forEach((img) => {
  const swap = () => {
    const type = img.dataset.fallback;
    const div = document.createElement("div");
    div.className = "img-fallback";
    if (type === "planet-amber") div.classList.add("amber");
    if (type === "astro") {
      div.classList.add("astro");
      div.textContent = "🪐";
    }
    img.replaceWith(div);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener("error", swap);
});

/* ---------- Contact form (AJAX via Web3Forms) ---------- */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "form_status";

  let valid = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const ok = input.checkValidity();
    input.closest(".field").classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    statusEl.textContent = "Please fill in all fields with a valid email.";
    statusEl.classList.add("err");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector(".btn_label").textContent = "Sending…";
  statusEl.textContent = "";

  try {
    const res = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message);

    statusEl.textContent = "Message sent! I'll get back to you soon 🚀";
    statusEl.classList.add("ok");
    form.reset();
  } catch (err) {
    statusEl.textContent = "Oops, something went wrong. Please try again later.";
    statusEl.classList.add("err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn_label").textContent = "Send message";
  }
});

form.querySelectorAll("input, textarea").forEach((input) =>
  input.addEventListener("input", () => input.closest(".field")?.classList.remove("invalid"))
);

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
