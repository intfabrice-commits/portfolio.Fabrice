/* =========================================================
   Portfolio Fabrice. Int — script.js (JavaScript vanilla)
   CONFIGURATION : modifier uniquement ce bloc si besoin.
   ========================================================= */
const CONFIG = {
  // Adresse qui reçoit les messages du formulaire (mailto)
  email: "int.fabrice@gmail.com",

  // INSÉRER ICI L'URL D'UN SERVICE DE FORMULAIRE (Formspree, Web3Forms, Getform...)
  // Exemple : "https://formspree.io/f/xxxxxxxx"
  // Tant que cette valeur est vide, le formulaire ouvre le logiciel de messagerie (mailto).
  formEndpoint: ""
};

document.documentElement.classList.add("js");
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Année du copyright ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- En-tête au défilement + bouton retour en haut ---------- */
const header = $("#header");
const toTop = $("#toTop");
function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 20);
  toTop.hidden = window.scrollY < 600;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

/* ---------- Menu mobile ---------- */
const toggle = $("#navToggle");
const menu = $("#navMenu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("a", menu).forEach(link => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- Lien actif dans la navigation ---------- */
const navLinks = $$(".nav-menu a");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(section => sectionObserver.observe(section));

/* ---------- Apparition au défilement + barres de compétences ---------- */
const BAR_WIDTH = { 1: 30, 2: 60, 3: 85 }; // niveau -> largeur de la barre (%)
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("visible");
    const bar = $(".bar i", el);
    if (bar) bar.style.width = (BAR_WIDTH[el.dataset.level] || 0) + "%";
    observer.unobserve(el);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => revealObserver.observe(el));

/* ---------- Liens à compléter : évite un saut vers le haut de page ---------- */
$$("a[data-placeholder]").forEach(a => a.addEventListener("click", e => e.preventDefault()));

/* ---------- Formulaire de contact ---------- */
const form = $("#contactForm");
const status = $("#formStatus");
function showStatus(message, isError) {
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const fields = $$("input, textarea", form);
  let valid = true;
  fields.forEach(field => {
    const ok = field.value.trim() && field.checkValidity();
    field.setAttribute("aria-invalid", String(!ok));
    if (!ok) valid = false;
  });
  if (!valid) return showStatus("Merci de remplir correctement tous les champs.", true);

  const data = Object.fromEntries(new FormData(form));

  // Option 1 : service de formulaire configuré dans CONFIG.formEndpoint
  if (CONFIG.formEndpoint) {
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      form.reset();
      return showStatus("Message envoyé. Merci !");
    } catch {
      return showStatus("L'envoi a échoué. Écrivez-moi directement à " + CONFIG.email + ".", true);
    }
  }

  // Option 2 (par défaut) : ouvre le logiciel de messagerie avec le message pré-rempli
  const body = `${data.message}\n\n— ${data.nom} (${data.email})`;
  window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(data.sujet)}&body=${encodeURIComponent(body)}`;
  showStatus("Votre messagerie va s'ouvrir avec le message prêt à envoyer.");
});

/* ---------- Animation du hero : réseau de points (léger) ---------- */
(function network() {
  const canvas = $("#network");
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, points = [], running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(60, Math.floor((w * h) / 22000)); // moins de points sur mobile
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  }

  function frame() {
    if (running) {
      ctx.clearRect(0, 0, w, h);
      points.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.fillStyle = "rgba(127,168,255,.8)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(110,130,255,${(1 - d / 130) * .35})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      });
    }
    requestAnimationFrame(frame);
  }

  // Met l'animation en pause quand le hero n'est plus visible
  new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }).observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  frame();
})();
