(() => {
  "use strict";

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  themeToggle.addEventListener("click", () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById("progressBar");
  const header = document.getElementById("siteHeader");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
    header.classList.toggle("scrolled", scrollTop > 10);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinkMap = new Map(
    Array.from(document.querySelectorAll(".nav-link")).map((a) => [a.getAttribute("href").slice(1), a])
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinkMap.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Typed role text ---------- */
  const roles = [
    "Software Developer",
    "Automation Developer",
    "Laravel & React Engineer",
    "Flutter Android Developer",
    "Python Scraping Specialist",
  ];
  const typedEl = document.getElementById("typedRole");
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  function typeLoop() {
    const current = roles[roleIndex];
    typedEl.textContent = current.slice(0, charIndex);

    if (!deleting && charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
    if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeLoop, 300);
      return;
    }

    charIndex += deleting ? -1 : 1;
    setTimeout(typeLoop, deleting ? 35 : 65);
  }
  setTimeout(typeLoop, 1600);

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll(".stat-num");
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10) || 0;
        let count = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const tick = () => {
          count = Math.min(target, count + step);
          el.textContent = count;
          if (count < target) requestAnimationFrame(tick);
        };
        tick();
        statObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => statObserver.observe(el));

  /* ---------- Contact form (Formspree) ---------- */
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const submitBtn = contactForm.querySelector("button[type=submit]");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    formNote.textContent = "Sending…";
    formNote.classList.remove("form-note-error");

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        formNote.textContent = "Thanks! Your message has been sent — I'll reply within a day.";
        contactForm.reset();
      } else {
        throw new Error("Form submission failed");
      }
    } catch (err) {
      formNote.textContent = "Something went wrong. Please email me directly at dev.hameem@gmail.com.";
      formNote.classList.add("form-note-error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
