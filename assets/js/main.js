/* Maison Nette — interactions & animations */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CONTACT_EMAIL = "jhoniterra@gmail.com";

  /* ---------------------------------------------------------- Révélations */

  let revealObserver = null;

  function observeReveals(root) {
    const targets = (root || document).querySelectorAll("[data-reveal]:not(.in)");
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
    }
    targets.forEach((el) => revealObserver.observe(el));
  }

  function applyStagger() {
    document.querySelectorAll("[data-stagger]").forEach((group) => {
      const step = parseInt(group.dataset.stagger, 10) || 90;
      Array.from(group.children).forEach((child, i) => {
        if (child.hasAttribute("data-reveal") && !child.style.getPropertyValue("--d")) {
          child.style.setProperty("--d", i * step + "ms");
        }
      });
    });
  }

  /* ------------------------------------------------------------ En-tête */

  function initHeader() {
    const header = document.querySelector(".site-header");
    const progress = document.querySelector(".scroll-progress");
    if (!header) return;

    let ticking = false;
    function update() {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 40);
      if (progress) {
        const max = document.body.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* -------------------------------------------------------- Parallaxe */

  function initParallax() {
    if (reduced) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const orbs = hero.querySelectorAll(".orb");
    const card = hero.querySelector(".hero-card");

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 14;
        orb.style.translate = x * depth + "px " + y * depth + "px";
      });
      if (card) {
        card.style.rotate = "y " + x * 4 + "deg";
        card.style.translate = x * -8 + "px " + y * -8 + "px";
      }
    });

    hero.addEventListener("mouseleave", () => {
      orbs.forEach((orb) => (orb.style.translate = ""));
      if (card) {
        card.style.rotate = "";
        card.style.translate = "";
      }
    });
  }

  function initCardGlow() {
    if (reduced) return;
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------------------------------------------------------- Horaires */

  function highlightToday() {
    const table = document.querySelector(".hours-table");
    if (!table) return;
    const day = new Date().getDay(); /* 0 = dimanche */
    const rowIndex = day === 0 ? 2 : day === 6 ? 1 : 0;
    const rows = table.querySelectorAll("tr");
    if (rows[rowIndex]) rows[rowIndex].classList.add("today");
  }

  /* --------------------------------------------------------------- FAQ */

  function initFaq() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const q = item.querySelector(".faq-q");
      const a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      });
    });
  }

  /* --------------------------------------------------------- Formulaire */

  function initForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const success = form.querySelector(".form-success");

    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service) {
      const select = form.querySelector("#service");
      if (select && [...select.options].some((o) => o.value === service)) {
        select.value = service;
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const serviceLabel = form.querySelector("#service")
        ? form.querySelector("#service").selectedOptions[0].text
        : "";
      const message = (data.get("message") || "").toString().trim();

      const subject = "Demande de devis — " + (serviceLabel || "site web");
      const body =
        "Nom : " + name + "\n" +
        "E-mail : " + email + "\n" +
        "Téléphone : " + phone + "\n" +
        "Service souhaité : " + serviceLabel + "\n\n" +
        "Message :\n" + message;

      const mailto =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      if (success) {
        success.textContent =
          "Votre logiciel de messagerie va s'ouvrir avec votre demande pré-remplie. Vous pouvez aussi appeler ou écrire directement.";
        success.classList.add("show");
      }
    });
  }

  /* ------------------------------------------------------------- Départ */

  window.MaisonNette = { observeReveals };

  document.addEventListener("DOMContentLoaded", () => {
    applyStagger();
    observeReveals();
    initHeader();
    initMenu();
    initParallax();
    initCardGlow();
    highlightToday();
    initFaq();
    initForm();

    const yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  window.addEventListener("load", () => {
    setTimeout(() => document.body.classList.add("loaded"), 120);
  });

  setTimeout(() => document.body.classList.add("loaded"), 2500);
})();
