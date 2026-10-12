/* ============================================================
   MAIN — renderer registry. One render function per section,
   called in DOM order. Every visible string comes from SITE
   (js/content.js); every collection renders N items. Effect
   modules (gate/hero/marquee/projects) enhance on top; if any
   of them throws, content stays complete and readable.
   ============================================================ */

(function () {
  "use strict";

  if (typeof SITE === "undefined") { return; }

  var M = window.Motion;
  var $ = function (sel) { return document.querySelector(sel); };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function svgUse(name, kind) {
    var wrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("focusable", "false");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "assets/icons/" + (kind === "glyph" ? "glyphs" : "ui") + ".svg#" + name);
    wrap.appendChild(use);
    return wrap;
  }

  function markReveal(node) {
    if (!node) { return; }
    node.setAttribute("data-reveal", "");
  }

  /* ---------- NAV ---------- */
  function renderNav() {
    var name = $("#nav-name");
    if (name) { name.textContent = SITE.meta.name; }

    var links = $("#nav-links");
    if (!links) { return; }
    links.innerHTML = "";

    SITE.nav.forEach(function (item) {
      var a = el("a", null, item.label);
      a.href = "#" + item.target;
      a.setAttribute("data-target", item.target);
      links.appendChild(a);
    });

    var selector = el("span", "nav-selector");
    selector.setAttribute("aria-hidden", "true");
    links.appendChild(selector);

    /* Theme toggle: swaps skin, persists via localStorage. */
    var toggle = $("#nav-theme");
    if (toggle) {
      function paintToggle() {
        var t = M.currentTheme();
        toggle.innerHTML = "";
        toggle.appendChild(svgUse(t === "c" ? "sun" : "moon", "ui"));
        toggle.setAttribute("aria-label", t === "c" ? "Switch to light theme" : "Switch to dark theme");
      }
      paintToggle();
      toggle.addEventListener("click", function () {
        M.setTheme(M.currentTheme() === "c" ? "b" : "c", true);
      });
      document.addEventListener("themechange", paintToggle);
    }

    /* NAV-01 selector glide + active tracking (transform-only). */
    var activeTarget = SITE.nav.length ? SITE.nav[0].target : null;

    function positionSelector(link) {
      if (!link || !links.contains(link)) { return; }
      var lr = links.getBoundingClientRect();
      var r = link.getBoundingClientRect();
      if (M.currentTheme() === "b") {
        selector.style.transform = "translateX(" + (r.left - lr.left) + "px) scaleX(" + (r.width || 1) + ")";
      } else {
        selector.style.transform = "translateX(" + (r.left - lr.left + r.width / 2 - 6) + "px) scaleX(1)";
      }
    }

    function setActive(target) {
      activeTarget = target;
      var link = links.querySelector('a[data-target="' + target + '"]');
      links.querySelectorAll("a").forEach(function (a) { a.classList.toggle("active", a === link); });
      positionSelector(link);
    }

    links.addEventListener("mouseover", function (e) {
      var link = e.target.closest("a");
      if (link) { positionSelector(link); }
    });
    links.addEventListener("mouseleave", function () {
      positionSelector(links.querySelector('a[data-target="' + activeTarget + '"]'));
    });
    window.addEventListener("resize", function () {
      positionSelector(links.querySelector('a[data-target="' + activeTarget + '"]'));
    });

    if (M.hasScrollTrigger()) {
      SITE.nav.forEach(function (item) {
        var section = document.getElementById(item.target);
        if (!section) { return; }
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: function (self) { if (self.isActive) { setActive(item.target); } }
        });
      });
    }
    setActive(activeTarget);
  }

  /* ---------- HERO (static content; hero.js animates) ---------- */
  function renderHero() {
    var badge = $("#hero-badge");
    if (badge) { badge.textContent = SITE.hero.badge; markReveal(badge); }

    var nameEl = $("#hero-name");
    if (nameEl) {
      nameEl.textContent = SITE.hero.name; /* final text from load; hero.js re-wraps for the reveal */
      nameEl.setAttribute("tabindex", "-1");
    }

    var role = $("#hero-role");
    if (role) {
      role.textContent = SITE.hero.roleParts.join(" / ");
      role.setAttribute("aria-label", SITE.hero.roleParts.join(" / "));
    }

    var sub = $("#hero-sub");
    if (sub) { sub.textContent = SITE.hero.sub; markReveal(sub); }

    var btnRow = $("#hero-buttons");
    if (btnRow) {
      SITE.hero.buttons.forEach(function (b) {
        var a = el("a", b.label === "EMAIL ME" ? "btn btn-secondary" : "btn btn-primary", b.label);
        a.href = b.href;
        if (b.external) { a.target = "_blank"; a.rel = "noopener"; }
        btnRow.appendChild(a);
      });
      markReveal(btnRow);
    }

    /* Tokens: created once, parked in the side columns; a matchMedia
       listener reparents them into one row below 1024px (L2 mobile). */
    var left = $("#hero-tokens-l");
    var right = $("#hero-tokens-r");
    var row = $("#hero-tokens-row");
    var tokens = [];

    SITE.hero.tokens.forEach(function (t) {
      var node = el("span", "token style-" + (t.style === "coin" ? "coin" : "cart"), t.label);
      node.setAttribute("data-depth", (0.3 + Math.random() * 0.5).toFixed(2));
      tokens.push(node);
      if (left) { left.appendChild(node); }
    });

    function distribute() {
      if (!row || !left || !right) { return; }
      var narrow = window.matchMedia("(max-width: 1023px)").matches;
      tokens.forEach(function (node, i) {
        if (narrow) {
          row.appendChild(node);
          row.hidden = false;
        } else {
          row.hidden = true;
          (i % 2 === 0 ? left : right).appendChild(node);
        }
      });
    }
    distribute();
    var mq = window.matchMedia("(max-width: 1023px)");
    if (typeof mq.addEventListener === "function") { mq.addEventListener("change", distribute); }
    else if (typeof mq.addListener === "function") { mq.addListener(distribute); }
  }

  /* ---------- ABOUT (merged: lines + bullets + player card + skill chips) ---------- */
  function renderAbout() {
    var heading = $("#about-heading");
    if (heading) { heading.textContent = SITE.about.heading; }

    var lines = $("#about-lines");
    if (lines) {
      SITE.about.lines.forEach(function (line) { lines.appendChild(el("p", null, line)); });
      markReveal(lines);
    }

    var bullets = $("#about-bullets");
    if (bullets) {
      SITE.about.bullets.forEach(function (b) { bullets.appendChild(el("li", null, b)); });
      markReveal(bullets);
    }

    var card = $("#player-card");
    if (card) {
      card.innerHTML = "";
      card.appendChild(el("div", "pc-heading", SITE.playerCard.heading));

      [SITE.playerCard.level, SITE.playerCard.studios, SITE.playerCard.titles].forEach(function (stat) {
        var row = el("div", "pc-row");
        row.appendChild(el("span", "pc-label", stat.label));
        var value = el("span", "pc-value", String(stat.value) + stat.suffix);
        value.setAttribute("data-count", String(stat.value));
        value.setAttribute("data-suffix", stat.suffix);
        row.appendChild(value);
        card.appendChild(row);
      });

      var quest = el("div", "pc-quest");
      quest.appendChild(el("span", "pc-label", SITE.playerCard.quest.label));
      quest.appendChild(el("span", "pc-value", SITE.playerCard.quest.value));
      card.appendChild(quest);

      var interests = el("div", "pc-interests");
      SITE.playerCard.interests.forEach(function (i) {
        var chip = el("span", "interest");
        chip.appendChild(svgUse(i.icon, "ui"));
        chip.appendChild(el("span", null, i.label));
        interests.appendChild(chip);
      });
      card.appendChild(interests);
      markReveal(card);
    }

    var skillsHeading = $("#skills-heading");
    if (skillsHeading) { skillsHeading.textContent = SITE.skills.heading; }

    var groups = $("#skills-groups");
    if (groups) {
      SITE.skills.groups.forEach(function (group) {
        var block = el("div", "skill-group");
        block.appendChild(el("span", "skill-label", group.label));
        var chips = el("div", "chips");
        group.tags.forEach(function (tag) {
          var btn = el("button", "chip" + (group.core ? " core" : ""));
          btn.type = "button";
          btn.setAttribute("aria-label", tag.label + " — " + tag.proof);

          var inner = el("span", "chip-inner");
          var front = el("span", "chip-face chip-face-front");
          front.appendChild(el("span", "chip-label", tag.label));
          front.appendChild(el("span", "proof-inline", tag.proof)); /* reduced-motion static fallback */
          var back = el("span", "chip-face chip-face-back", tag.proof);
          back.setAttribute("aria-hidden", "true");
          inner.appendChild(front);
          inner.appendChild(back);
          btn.appendChild(inner);

          btn.addEventListener("click", function () { btn.classList.toggle("flipped"); });
          chips.appendChild(btn);
        });
        block.appendChild(chips);
        groups.appendChild(block);
        markReveal(chips);
      });
    }
  }

  /* ---------- EXPERIENCE — credits reel ---------- */
  function renderExperience() {
    var heading = $("#experience-heading");
    if (heading) { heading.textContent = SITE.experience.heading; }

    var intro = $("#experience-intro");
    if (intro) { intro.textContent = SITE.experience.intro; }

    var jobs = $("#experience-jobs");
    if (!jobs) { return; }
    jobs.innerHTML = "";

    SITE.experience.jobs.forEach(function (job) {
      var card = el("article", "credit");

      var rows = el("div", "credit-rows");
      [
        ["STUDIO", job.studio, ""],
        ["ROLE", job.role, "role"],
        ["PERIOD", job.period, "period"]
      ].forEach(function (pair) {
        var row = el("div", "credit-row");
        row.appendChild(el("span", "k", pair[0]));
        row.appendChild(el("span", "v " + pair[2], pair[1]));
        rows.appendChild(row);
      });
      card.appendChild(rows);

      var list = el("ul");
      job.bullets.forEach(function (b) { list.appendChild(el("li", null, b)); });
      card.appendChild(list);

      var stamp = el("span", "stamp", SITE.experience.stamp);
      stamp.setAttribute("aria-hidden", "true");
      card.appendChild(stamp);

      jobs.appendChild(card);
      markReveal(card);
    });
  }

  /* ---------- CONTACT — dock + fallback rows ---------- */
  function renderContact() {
    var heading = $("#contact-heading");
    if (heading) { heading.textContent = SITE.contact.heading; }

    var line = $("#contact-line");
    if (line) { line.textContent = SITE.contact.line; }

    var dock = $("#contact-dock");
    if (dock) {
      dock.innerHTML = "";
      var byKey = {
        email: { href: "mailto:" + SITE.contact.email, value: SITE.contact.email, external: false },
        phone: { href: SITE.contact.phoneHref, value: SITE.contact.phone, external: false },
        linkedin: { href: SITE.contact.linkedinHref, value: SITE.contact.linkedin, external: true },
        location: { href: null, value: SITE.contact.location, external: false }
      };
      SITE.dock.forEach(function (d) {
        var info = byKey[d.key];
        if (!info) { return; }
        var item = info.href ? el("a", "dock-item") : el("div", "dock-item");
        if (info.href) {
          item.href = info.href;
          if (info.external) { item.target = "_blank"; item.rel = "noopener"; }
        }
        var tile = el("span", "dock-tile");
        tile.appendChild(svgUse(d.icon, "ui"));
        item.appendChild(tile);
        item.appendChild(el("span", "dock-label", d.label));
        item.appendChild(el("span", "dock-value", info.value));
        dock.appendChild(item);
        markReveal(item);
      });
    }

    var lines = $("#contact-lines");
    if (lines) {
      lines.innerHTML = "";
      [
        ["EMAIL", SITE.contact.email, "mailto:" + SITE.contact.email, false],
        ["PHONE", SITE.contact.phone, SITE.contact.phoneHref, false],
        ["LINKEDIN", SITE.contact.linkedin, SITE.contact.linkedinHref, true],
        ["LOCATION", SITE.contact.location, null, false]
      ].forEach(function (pair) {
        var row = el("div", "contact-item");
        row.appendChild(el("span", "k", pair[0]));
        if (pair[2]) {
          var v = el("a", "v", pair[1]);
          v.href = pair[2];
          if (pair[3]) { v.target = "_blank"; v.rel = "noopener"; }
          row.appendChild(v);
        } else {
          row.appendChild(el("span", "v", pair[1]));
        }
        lines.appendChild(row);
      });
    }
  }

  /* ---------- FOOTER — patch notes, restart, attribution ---------- */
  function renderFooter() {
    var notes = $("#patch-notes");
    if (notes) {
      notes.innerHTML = "";
      SITE.footer.patchNotes.slice(0, 3).forEach(function (patch) {
        var entry = el("div", "patch-entry");
        entry.appendChild(el("span", "pn-version", patch.version));
        entry.appendChild(el("span", "pn-date", patch.date));
        var lines = el("div", "pn-lines");
        patch.lines.forEach(function (l) { lines.appendChild(el("div", null, l)); });
        entry.appendChild(lines);
        notes.appendChild(entry);
      });
      markReveal(notes);
    }

    var restart = $("#footer-restart");
    if (restart) {
      restart.textContent = SITE.footer.restart;
      restart.addEventListener("click", function () {
        M.coin();
        M.scrollToEl(document.getElementById("top") || document.body);
      });
    }

    var attribution = $("#footer-attribution");
    if (attribution) { attribution.textContent = SITE.footer.attribution; }

    var year = $("#footer-year");
    if (year) { year.textContent = String(new Date().getFullYear()); }

    var name = $("#footer-name");
    if (name) { name.textContent = SITE.meta.name; }

    var footerLine = $("#footer-line");
    if (footerLine) { footerLine.textContent = SITE.footer.line; }

    var mail = $("#footer-mail");
    if (mail) { mail.textContent = SITE.footer.email; mail.href = "mailto:" + SITE.footer.email; }

    var li = $("#footer-linkedin");
    if (li) { li.textContent = SITE.footer.linkedinLabel; li.href = SITE.footer.linkedinHref; }
  }

  /* ---------- Reveal system ----------
     GSAP path: ScrollTrigger.batch over [data-reveal].
     Fallback path: .reveal + IntersectionObserver → .visible.
     Classes are applied from JS, so no-JS users see everything. */
  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) { return; }

    if (M.hasScrollTrigger()) {
      gsap.set(targets, { opacity: 0, y: 18 });
      ScrollTrigger.batch(targets, {
        start: "top 85%",
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: M.T.reveal, ease: M.E.out, stagger: 0.08, overwrite: true });
        }
      });
      return;
    }

    targets.forEach(function (node) { node.classList.add("reveal"); });
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (node) { node.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (node) { io.observe(node); });
  }

  /* ---------- Count-up (ABT-02) — GSAP path only; static otherwise ---------- */
  function initCountUps() {
    if (!M.hasGsap()) { return; }
    document.querySelectorAll(".pc-value[data-count]").forEach(function (node) {
      var end = parseInt(node.getAttribute("data-count"), 10);
      var suffix = node.getAttribute("data-suffix") || "";
      if (isNaN(end)) { return; }
      ScrollTrigger.create({
        trigger: node,
        start: "top 90%",
        once: true,
        onEnter: function () {
          var counter = { n: 0 };
          gsap.to(counter, {
            n: end,
            duration: 0.9,
            ease: "steps(" + end + ")",
            onUpdate: function () { node.textContent = String(Math.round(counter.n)) + suffix; }
          });
        }
      });
    });
  }

  /* ---------- Stamps (EXP-03): thump in after each credit card settles ---------- */
  function initStamps() {
    if (!M.hasGsap()) { return; }
    document.querySelectorAll(".credit .stamp").forEach(function (stamp) {
      ScrollTrigger.create({
        trigger: stamp.closest(".credit"),
        start: "top 70%",
        once: true,
        onEnter: function () {
          gsap.fromTo(stamp,
            { scale: 1.5, opacity: 0, rotation: -8 },
            { scale: 1, opacity: 1, rotation: -8, duration: 0.32, ease: "back.out(3)", delay: 0.12 });
        }
      });
    });
  }

  /* ---------- Boot (each render isolated: one failure never blocks the rest) ---------- */
  try { renderNav(); } catch (e) {}
  try { renderHero(); } catch (e) { if (window.console) { console.warn("hero render:", e); } }
  try { renderAbout(); } catch (e) { if (window.console) { console.warn("about render:", e); } }
  try { renderExperience(); } catch (e) { if (window.console) { console.warn("experience render:", e); } }
  try { renderContact(); } catch (e) { if (window.console) { console.warn("contact render:", e); } }
  try { renderFooter(); } catch (e) { if (window.console) { console.warn("footer render:", e); } }
  try { initReveals(); } catch (e) {}
  try { initCountUps(); } catch (e) {}
  try { initStamps(); } catch (e) {}
})();
