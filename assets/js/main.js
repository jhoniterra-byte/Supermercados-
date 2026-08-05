/* Top Marché — interactions & animations */
(function () {
  "use strict";

  const LANG_KEY = "topmarche_lang";
  const SUPPORTED = ["fr", "pt", "en"];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ Langue */

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : "fr";
  }

  function dict(lang) {
    return I18N[lang || getLang()] || I18N.fr;
  }

  function movePills() {
    document.querySelectorAll(".lang-switch").forEach((sw) => {
      const pill = sw.querySelector(".lang-pill");
      const active = sw.querySelector("button.active");
      if (!pill || !active) return;
      pill.style.width = active.offsetWidth + "px";
      pill.style.transform = "translateX(" + active.offsetLeft + "px)";
    });
  }

  function applyTranslations(lang) {
    const d = dict(lang);
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (d[key]) el.textContent = d[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
      if (d[key]) el.setAttribute(attr, d[key]);
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    movePills();
    buildMarquee(lang);
    buildRayons(lang);

    if (typeof window.onLangChange === "function") window.onLangChange(lang, d);
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations(lang);
  }

  /* --------------------------------------------------------- Composants */

  function buildMarquee(lang) {
    const track = document.querySelector(".marquee-track");
    if (!track) return;
    const d = dict(lang);
    const words = CATEGORIES.map((c) => d["filter_" + c.key]);
    const line = words.map((w) => "<span>" + w + "</span>").join("");
    track.innerHTML = line + line; /* dupliqué pour une boucle sans couture */
  }

  function buildRayons(lang) {
    const wrap = document.querySelector("#rayons");
    if (!wrap) return;
    const d = dict(lang);
    wrap.innerHTML = CATEGORIES.map((c, i) => {
      const n = PRODUCTS.filter((p) => p.cat === c.key).length;
      return (
        '<a class="rayon" href="ofertas.html?cat=' + c.key + '" data-reveal style="--d:' + i * 70 + 'ms">' +
        '<span class="rayon-ico">' + c.icon + "</span>" +
        "<h3>" + d["filter_" + c.key] + "</h3>" +
        '<span class="count">' + n + " " + d.products_word + "</span>" +
        '<span class="go" aria-hidden="true">→</span>' +
        "</a>"
      );
    }).join("");
    observeReveals(wrap);
  }

  function productCard(p, lang, index) {
    const d = dict(lang);
    return (
      '<article class="product-card" style="--d:' + index * 55 + 'ms">' +
      (p.promo ? '<span class="product-badge">' + d.badge_promo + "</span>" : "") +
      '<div class="product-media"><span>' + p.icon + "</span></div>" +
      '<div class="product-body">' +
      '<div class="product-cat">' + d["filter_" + p.cat] + "</div>" +
      '<h3 class="product-name">' + p.name[lang] + "</h3>" +
      '<div class="price-row"><span class="price">CHF ' + p.price.toFixed(2) + "</span>" +
      (p.oldPrice ? '<span class="price-old">CHF ' + p.oldPrice.toFixed(2) + "</span>" : "") +
      "</div></div></article>"
    );
  }

  function renderProducts(container, list, lang) {
    if (!container) return;
    container.innerHTML = list
      .map((p, i) => productCard(p, lang, i))
      .join("");
  }

  /* ------------------------------------------------------- Révélations */

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

  /* --------------------------------------------------------- Compteurs */

  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduced) {
      el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + "</span>" : "");
      return;
    }
    const duration = 1700;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = Math.round(target * eased);
      el.innerHTML = value + (suffix ? '<span class="suffix">' + suffix + "</span>" : "");
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) {
      nums.forEach(runCounter);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => io.observe(n));
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
    document.querySelectorAll(".feature-card").forEach((card) => {
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

  /* --------------------------------------------------------- Formulaire */

  function initForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const success = form.querySelector(".form-success");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (success) {
        success.textContent = dict().form_success;
        success.classList.add("show");
        setTimeout(() => success.classList.remove("show"), 6000);
      }
      form.reset();
    });
  }

  /* ------------------------------------------------------------- Départ */

  window.TopMarche = { getLang, setLang, dict, renderProducts, observeReveals };

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations(getLang());

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    applyStagger();
    observeReveals();
    initCounters();
    initHeader();
    initMenu();
    initParallax();
    initCardGlow();
    highlightToday();
    initForm();

    window.addEventListener("resize", movePills);
    document.fonts && document.fonts.ready.then(movePills);
  });

  window.addEventListener("load", () => {
    setTimeout(() => document.body.classList.add("loaded"), 120);
  });

  /* Filet de sécurité : ne jamais laisser le préchargeur bloquer la page */
  setTimeout(() => document.body.classList.add("loaded"), 2500);
})();
