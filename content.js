/* ============================================================
   AKA WINNER — Magasin de contenu partagé
   Utilisé par index.html (site principal) et admin.html (back-office).

   Fonctionnement :
   - Le contenu "publié" est lu par le site principal.
   - Quand l'administrateur clique sur "Publier", le nouveau contenu est
     déposé en attente ("pending") avec un délai. Le site principal
     affiche alors un bandeau "nouvelle mise à jour disponible", attend
     le délai, puis applique le contenu automatiquement (sans rechargement).
   - Le partage se fait via localStorage : ça fonctionne instantanément
     entre onglets d'UN MÊME navigateur (idéal pour piloter le site depuis
     votre propre ordinateur/téléphone). Pour que TOUT visiteur, sur
     n'importe quel appareil, voie les mises à jour en temps réel, il faut
     un petit serveur/base de données côté back-end — voir la note en bas
     de admin.html.
   ============================================================ */

(function (global) {
  "use strict";

  var KEYS = {
    published: "aw_content_published_v1",
    draft: "aw_content_draft_v1",
    pendingContent: "aw_content_pending_v1",
    pendingFlag: "aw_update_pending_v1",
  };

  var DEFAULT_CONTENT = {
    hero: {
      eyebrow: "Portfolio — Abidjan, Côte d'Ivoire",
      titleLine1: "AKA AMAN",
      titleLine2: "EZECHEIL",
      titleAccent: "WINNER",
      role: "Designer Graphique & Community Manager",
      tagline: "Je transforme les idées en identités visuelles, contenus créatifs et expériences digitales qui marquent les esprits.",
      portraitUrl: "profile.jpg",
      portraitTag: "Designer graphique & Community Manager",
    },
    about: {
      eyebrow: "01 — Qui suis-je",
      heading: "Un regard créatif au service des marques.",
      text1: "Je suis <strong>AKA AMAN EZECHEIL WINNER</strong>, designer graphique et community manager. Passionné par la création visuelle et la communication digitale, j'accompagne les marques, entreprises et projets dans la conception de leur image et de leur présence en ligne.",
      text2: "Mon objectif est de créer des visuels modernes, cohérents et impactants, tout en développant des stratégies de communication capables de renforcer l'identité et la visibilité d'une marque.",
      cards: [
        { title: "Design graphique", text: "Création d'affiches, identités visuelles, contenus pour réseaux sociaux et supports de communication." },
        { title: "Community management", text: "Création de contenus, gestion des réseaux sociaux et développement de la présence digitale." },
        { title: "Créativité", text: "Recherche constante d'idées, concepts et directions artistiques originales." },
      ],
    },
    work: {
      eyebrow: "02 — Mes projets",
      heading: "Une sélection de mes créations graphiques et projets visuels.",
      sub: "Chaque emplacement accueille un visuel au format 1080 × 1080 px.",
      design: buildDefaultProjects(),
      content: buildDefaultProjects(),
    },
    skills: {
      eyebrow: "03 — Mes compétences",
      heading: "Ce que j'apporte à chaque projet.",
      items: [
        "Design graphique",
        "Création d'affiches",
        "Identité visuelle",
        "Design pour réseaux sociaux",
        "Community management",
        "Création de contenu",
        "Direction artistique",
        "Communication digitale",
      ],
      tools: ["Canva", "Photoshop", "Illustrator", "Outils digitaux"],
    },
    contact: {
      eyebrow: "04 — Contact",
      titleLine1: "Parlons de",
      titleAccent: "projet.",
      sub: "Vous avez un projet, une idée ou besoin d'un accompagnement créatif ? N'hésitez pas à me contacter.",
      email: "Akaezecheilwinner@gmail.com",
      phone1: "0502008084",
      phone2: "0799478031",
      socials: {
        instagram: "",
        linkedin: "",
        whatsapp: "",
        behance: "",
      },
    },
    footer: {
      name: "AKA AMAN EZECHEIL WINNER",
      text: "Designer Graphique & Community Manager — © 2026 — Tous droits réservés.",
    },
  };

  function buildDefaultProjects() {
    var arr = [];
    for (var i = 1; i <= 10; i++) {
      arr.push({
        name: "Projet " + (i < 10 ? "0" + i : i),
        url: "",
        bio: "Une création pensée pour donner une identité forte et personnelle à ce projet."
      });
    }
    return arr;
  }

  function deepMerge(base, override) {
    if (typeof override !== "object" || override === null) return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(override).forEach(function (k) {
      if (
        override[k] !== null &&
        typeof override[k] === "object" &&
        !Array.isArray(override[k]) &&
        base &&
        typeof base[k] === "object"
      ) {
        out[k] = deepMerge(base[k], override[k]);
      } else {
        out[k] = override[k];
      }
    });
    return out;
  }

  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getPublishedContent() {
    var raw = localStorage.getItem(KEYS.published);
    var parsed = raw ? safeParse(raw) : null;
    return parsed ? deepMerge(DEFAULT_CONTENT, parsed) : DEFAULT_CONTENT;
  }

  function getDraftContent() {
    var raw = localStorage.getItem(KEYS.draft);
    var parsed = raw ? safeParse(raw) : null;
    return parsed ? deepMerge(DEFAULT_CONTENT, parsed) : getPublishedContent();
  }

  function saveDraft(content) {
    localStorage.setItem(KEYS.draft, JSON.stringify(content));
  }

  function getPendingFlag() {
    var raw = localStorage.getItem(KEYS.pendingFlag);
    return raw ? safeParse(raw) : null;
  }

  function getPendingContent() {
    var raw = localStorage.getItem(KEYS.pendingContent);
    return raw ? safeParse(raw) : null;
  }

  // Publie le contenu : dépose un drapeau "pending" que le site principal
  // détecte pour afficher le bandeau, puis applique le contenu après le délai.
  function publish(content, delayMs) {
    delayMs = typeof delayMs === "number" ? delayMs : 6000;
    localStorage.setItem(KEYS.pendingContent, JSON.stringify(content));
    localStorage.setItem(
      KEYS.pendingFlag,
      JSON.stringify({ active: true, ts: Date.now(), delay: delayMs })
    );
    // Toujours garder le brouillon aligné avec ce qui vient d'être publié
    localStorage.setItem(KEYS.draft, JSON.stringify(content));
    global.dispatchEvent(new CustomEvent("aw:update-pending", { detail: { delay: delayMs } }));
  }

  // Applique immédiatement le contenu en attente (appelé côté site principal
  // une fois le délai écoulé) et nettoie le drapeau.
  function applyPending() {
    var pending = getPendingContent();
    if (pending) {
      localStorage.setItem(KEYS.published, JSON.stringify(pending));
    }
    localStorage.setItem(KEYS.pendingFlag, JSON.stringify({ active: false }));
    global.dispatchEvent(new CustomEvent("aw:update-applied"));
    return getPublishedContent();
  }

  function resetAll() {
    localStorage.removeItem(KEYS.published);
    localStorage.removeItem(KEYS.draft);
    localStorage.removeItem(KEYS.pendingContent);
    localStorage.removeItem(KEYS.pendingFlag);
  }

  global.AWContent = {
    KEYS: KEYS,
    DEFAULT_CONTENT: DEFAULT_CONTENT,
    getPublishedContent: getPublishedContent,
    getDraftContent: getDraftContent,
    saveDraft: saveDraft,
    getPendingFlag: getPendingFlag,
    getPendingContent: getPendingContent,
    publish: publish,
    applyPending: applyPending,
    resetAll: resetAll,
    deepMerge: deepMerge,
  };
})(window);
