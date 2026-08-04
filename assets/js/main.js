(function () {
  const LANG_KEY = "topmarche_lang";
  const supported = ["fr", "pt", "en"];

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && supported.includes(saved)) return saved;
    const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return supported.includes(nav) ? nav : "fr";
  }

  function applyTranslations(lang) {
    const dict = I18N[lang] || I18N.fr;
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    if (typeof window.onLangChange === "function") {
      window.onLangChange(lang, dict);
    }
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations(lang);
  }

  window.TopMarche = { getLang, setLang };

  document.addEventListener("DOMContentLoaded", () => {
    const lang = getLang();
    applyTranslations(lang);

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });

    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav.main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => nav.classList.toggle("open"));
      nav.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => nav.classList.remove("open"))
      );
    }

    const form = document.querySelector("#contact-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const dict = I18N[getLang()] || I18N.fr;
        const msg =
          {
            fr: "Merci ! Ceci est une démonstration : aucun message n'a réellement été envoyé.",
            pt: "Obrigado! Esta é uma demonstração: nenhuma mensagem foi realmente enviada.",
            en: "Thank you! This is a demo: no message was actually sent.",
          }[getLang()] || "Thank you!";
        alert(msg);
        form.reset();
      });
    }
  });
})();
