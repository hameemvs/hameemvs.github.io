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

  /* ---------- Project case-study modal ---------- */
  const projectModal = document.getElementById("projectModal");
  const modalImg = document.getElementById("modalImg");
  const modalPrev = document.getElementById("modalPrev");
  const modalNext = document.getElementById("modalNext");
  const modalImgCount = document.getElementById("modalImgCount");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalTags = document.getElementById("modalTags");
  const modalLinks = document.getElementById("modalLinks");
  const modalClose = document.getElementById("modalClose");
  const modalGallery = document.querySelector(".modal-gallery");

  // Extra gallery images not shown on the card itself, keyed by data-project id.
  const extraProjectImages = {
    "retail-hub": ["assets/img/retail-hub-income.jpg"],
  };

  let modalImages = [];
  let modalImageIndex = 0;
  let lastFocusedEl = null;

  function renderModalImage() {
    modalImg.src = modalImages[modalImageIndex];
    const multi = modalImages.length > 1;
    modalPrev.hidden = !multi;
    modalNext.hidden = !multi;
    modalImgCount.hidden = !multi;
    if (multi) modalImgCount.textContent = `${modalImageIndex + 1} / ${modalImages.length}`;
  }

  function openProjectModal(card) {
    const thumbImg = card.querySelector(".project-thumb img");
    const id = card.dataset.project;

    if (thumbImg) {
      modalGallery.hidden = false;
      modalImages = [thumbImg.getAttribute("src"), ...(extraProjectImages[id] || [])];
      modalImageIndex = 0;
      renderModalImage();
    } else {
      modalGallery.hidden = true;
      modalImages = [];
    }

    modalTitle.textContent = card.querySelector(".project-body h3").textContent;
    const fullDesc = card.querySelector(".project-full-desc");
    if (fullDesc) {
      modalDesc.innerHTML = fullDesc.innerHTML;
    } else {
      modalDesc.textContent = card.querySelector(".project-body p").textContent;
    }

    modalTags.innerHTML = "";
    card.querySelectorAll(".tag-list.small li").forEach((li) => {
      const clone = document.createElement("li");
      clone.textContent = li.textContent;
      modalTags.appendChild(clone);
    });

    modalLinks.innerHTML = "";
    card.querySelectorAll(".project-links a").forEach((a) => {
      modalLinks.appendChild(a.cloneNode(true));
    });

    lastFocusedEl = document.activeElement;
    projectModal.hidden = false;
    requestAnimationFrame(() => projectModal.classList.add("open"));
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeProjectModal() {
    projectModal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      projectModal.hidden = true;
    }, 250);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll(".project-card[data-project]").forEach((card) => {
    const trigger = card.querySelector(".project-thumb");
    if (trigger) trigger.addEventListener("click", () => openProjectModal(card));
  });

  modalClose.addEventListener("click", closeProjectModal);
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) closeProjectModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !projectModal.hidden) closeProjectModal();
  });
  modalPrev.addEventListener("click", () => {
    modalImageIndex = (modalImageIndex - 1 + modalImages.length) % modalImages.length;
    renderModalImage();
  });
  modalNext.addEventListener("click", () => {
    modalImageIndex = (modalImageIndex + 1) % modalImages.length;
    renderModalImage();
  });

  /* ---------- Motion polish: hero parallax, card tilt, cursor spotlight ---------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!prefersReducedMotion && supportsFineHover) {
    const heroEl = document.querySelector(".hero");
    const spotlight = document.getElementById("cursorSpotlight");

    if (heroEl) {
      heroEl.addEventListener("mousemove", (e) => {
        const rect = heroEl.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroEl.style.setProperty("--parallax-x", `${x * 30}px`);
        heroEl.style.setProperty("--parallax-y", `${y * 30}px`);

        if (spotlight) {
          spotlight.style.left = `${e.clientX}px`;
          spotlight.style.top = `${e.clientY}px`;
        }
      });
      heroEl.addEventListener("mouseenter", () => spotlight && spotlight.classList.add("active"));
      heroEl.addEventListener("mouseleave", () => {
        heroEl.style.setProperty("--parallax-x", "0px");
        heroEl.style.setProperty("--parallax-y", "0px");
        spotlight && spotlight.classList.remove("active");
      });
    }

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-py * 8).toFixed(2);
        const rotateY = (px * 8).toFixed(2);
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
