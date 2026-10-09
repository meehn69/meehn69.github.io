/* ============================================================
   RENDERER — turns js/content.js into the page.
   You should rarely need to touch this file; edit content.js.
   ============================================================ */

(function () {
  "use strict";

  /* Theme override: index.html?theme=b forces Theme B (default is c). */
  var themeParam = new URLSearchParams(window.location.search).get("theme");
  if (themeParam === "b" || themeParam === "c") {
    document.documentElement.setAttribute("data-theme", themeParam);
  }

  var $ = function (sel) { return document.querySelector(sel); };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function link(href, label, external) {
    var a = el("a", null, label);
    a.href = href;
    if (external || href.indexOf("http") === 0) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    return a;
  }

  /* ---------- Meta ---------- */
  document.title = SITE.meta.title;

  /* ---------- Nav ---------- */
  var navName = $("#nav-name");
  navName.textContent = SITE.hero.name;
  navName.href = "#top";

  var navLinks = $("#nav-links");
  SITE.nav.forEach(function (item) {
    var a = link("#" + item.target, item.label);
    a.dataset.target = item.target;
    navLinks.appendChild(a);
  });

  /* ---------- Hero ---------- */
  $("#hero-role").textContent = SITE.hero.role;
  $("#hero-sub").textContent = SITE.hero.sub;
  $("#hero-location").textContent = SITE.hero.location;

  var btnRow = $("#hero-buttons");
  SITE.hero.buttons.forEach(function (b, i) {
    var a = link(b.href, b.label, b.external);
    a.className = i === 0 ? "btn btn-primary" : "btn btn-secondary";
    btnRow.appendChild(a);
  });

  /* ---------- About ---------- */
  $("#about-heading").textContent = SITE.about.heading;
  var aboutText = $("#about-text");
  SITE.about.paragraphs.forEach(function (p) {
    aboutText.appendChild(el("p", null, p));
  });

  /* ---------- Skills ---------- */
  $("#skills-heading").textContent = SITE.skills.heading;
  var skillsWrap = $("#skills-groups");
  SITE.skills.groups.forEach(function (group) {
    var g = el("div", "skill-group" + (group.secondary ? " secondary" : ""));
    g.appendChild(el("div", "skill-label", group.label));
    var chips = el("div", "chips");
    group.tags.forEach(function (t) { chips.appendChild(el("span", "chip", t)); });
    g.appendChild(chips);
    skillsWrap.appendChild(g);
  });

  /* ---------- Experience ---------- */
  $("#experience-heading").textContent = SITE.experience.heading;
  var jobsWrap = $("#experience-jobs");
  SITE.experience.jobs.forEach(function (job) {
    var card = el("article", "job reveal");

    var head = el("div", "job-head");
    head.appendChild(el("h3", "job-studio", job.studio));
    head.appendChild(el("span", "job-period", job.period));
    card.appendChild(head);

    card.appendChild(el("div", "job-role", job.role));

    var ul = el("ul");
    job.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
    card.appendChild(ul);

    jobsWrap.appendChild(card);
  });

  /* ---------- Projects ---------- */
  $("#projects-heading").textContent = SITE.projects.heading;

  function projectCard(data) {
    var card = el("article", "card reveal");
    card.appendChild(el("h3", "card-title", data.title));
    card.appendChild(el("div", "card-org", data.org));
    card.appendChild(el("p", "card-what", data.what));

    if (data.image) {
      var img = el("img", "card-image");
      img.src = data.image;
      img.alt = data.imageAlt || "";
      img.loading = "lazy";
      card.appendChild(img);
    }

    var role = el("p", "card-role");
    role.appendChild(el("strong", null, "My role"));
    role.appendChild(document.createTextNode(data.role));
    card.appendChild(role);

    if (data.links) {
      var row = el("div", "card-links");
      data.links.forEach(function (l) { row.appendChild(link(l.href, l.label, l.external)); });
      card.appendChild(row);
    } else if (data.link) {
      var single = el("div", "card-links");
      single.appendChild(link(data.link.href, data.link.label, data.link.external));
      card.appendChild(single);
    }

    if (data.caption) card.appendChild(el("p", "card-caption", data.caption));
    return card;
  }

  var aLabel = $("#group-a-label");
  aLabel.textContent = SITE.projects.groupA.label;
  $("#group-a-note").textContent = SITE.projects.groupA.note;
  var gridA = $("#group-a-cards");
  SITE.projects.groupA.cards.forEach(function (c) { gridA.appendChild(projectCard(c)); });

  $("#group-b-label").textContent = SITE.projects.groupB.label;
  $("#group-b-note").textContent = SITE.projects.groupB.note;
  var gridB = $("#group-b-cards");
  SITE.projects.groupB.cards.forEach(function (c) { gridB.appendChild(projectCard(c)); });

  /* ---------- Contact ---------- */
  $("#contact-heading").textContent = SITE.contact.heading;
  $("#contact-line").textContent = SITE.contact.line;

  var lines = $("#contact-lines");
  [
    { k: "Email", v: SITE.contact.email, href: "mailto:" + SITE.contact.email },
    { k: "Phone", v: SITE.contact.phone, href: SITE.contact.phoneHref },
    { k: "LinkedIn", v: SITE.contact.linkedin, href: SITE.contact.linkedinHref },
    { k: "Location", v: SITE.contact.location, href: null },
  ].forEach(function (item) {
    var row = el("div", "contact-item");
    row.appendChild(el("span", "k", item.k));
    if (item.href) {
      var a = link(item.href, item.v);
      a.className = "v";
      row.appendChild(a);
    } else {
      row.appendChild(el("span", "v", item.v));
    }
    lines.appendChild(row);
  });

  /* ---------- Footer ---------- */
  $("#footer-year").textContent = new Date().getFullYear();
  $("#footer-line").textContent = SITE.footer.line;
  $("#footer-mail").textContent = SITE.footer.email;
  $("#footer-mail").href = "mailto:" + SITE.footer.email;
  var fl = $("#footer-linkedin");
  fl.href = SITE.footer.linkedinHref;
  fl.textContent = SITE.footer.linkedinLabel;

  /* ---------- Scroll reveal (one-shot, respects reduced motion) ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (n) { n.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Nav active-section highlight ---------- */
  var sections = SITE.nav
    .map(function (n) { return document.getElementById(n.target); })
    .filter(Boolean);

  function highlight() {
    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 120) current = s.id;
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.target === current);
    });
  }
  window.addEventListener("scroll", highlight, { passive: true });
  highlight();
})();
