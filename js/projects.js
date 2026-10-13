/* ============================================================
   PROJECTS — the centerpiece (L6). One story, three paths:
   Path A: pinned horizontal story + real three.js cartridges
           (lazy ES-module import, §3.1 — document-relative
           specifiers, 4s timeout, silent CSS fallback).
   Path B: same pinned story, CSS-3D cartridges (no WebGL).
   Path C: mobile / reduced motion — vertical stack.
   The credits panel, counter, dots and DETAILS expander are
   real DOM in every path (the accessible content).
   ============================================================ */

(function () {
  "use strict";

  var M = window.Motion;
  if (typeof SITE === "undefined") { return; }

  var P = SITE.projects;
  var heading = document.getElementById("projects-heading");
  if (heading) { heading.textContent = P.heading; }
  var note = document.getElementById("projects-note");
  if (note) { note.textContent = P.note || ""; note.hidden = !P.note; }

  var stage = document.getElementById("proj-stage");
  var canvas = document.getElementById("proj-canvas");
  var credits = document.getElementById("proj-credits");
  var counterEl = document.getElementById("proj-counter");
  var dotsEl = document.getElementById("proj-dots");
  var mobile = document.getElementById("projects-mobile");
  var diagramsTemplate = document.getElementById("systems-diagrams");

  var items = P.items;
  var index = 0;
  var st = null; /* the pinned ScrollTrigger */
  var shelf = null; /* path A 3D api */

  /* ---------- shared builders ---------- */
  function glyphSvg(name) {
    var wrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("focusable", "false");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "assets/icons/glyphs.svg#" + name);
    wrap.appendChild(use);
    return wrap;
  }

  function iconSvg(name) {
    var wrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("focusable", "false");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "assets/icons/ui.svg#" + name);
    wrap.appendChild(use);
    return wrap;
  }

  function row(label, valueNode) {
    var row = document.createElement("div");
    row.className = "cr-row";
    var k = document.createElement("span");
    k.className = "k";
    k.textContent = label;
    row.appendChild(k);
    row.appendChild(valueNode);
    return row;
  }

  function textNode(cls, text) {
    var node = document.createElement("span");
    node.className = cls;
    node.textContent = text;
    return node;
  }

  function detailsBlock(item) {
    var wrap = document.createElement("div");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "details-btn";
    btn.setAttribute("aria-expanded", "false");
    btn.appendChild(document.createTextNode(P.detailsLabel + " "));
    btn.appendChild(iconSvg("chevron-down"));

    var panel = document.createElement("div");
    panel.className = "details-panel";
    panel.style.height = "0";
    panel.style.clipPath = "inset(0 0 100% 0)";
    panel.style.opacity = "0";

    var list = document.createElement("ul");
    item.bullets.forEach(function (b) {
      var li = document.createElement("li");
      li.textContent = b;
      list.appendChild(li);
    });
    panel.appendChild(list);

    if (item.caption) {
      panel.appendChild(Object.assign(document.createElement("p"), { className: "caption", textContent: item.caption }));
    }

    /* Q5 (owner-approved): the two systems diagrams fold into the flagship expander. */
    if (item.id === "casino-suite" && diagramsTemplate) {
      panel.appendChild(diagramsTemplate.content.cloneNode(true));
    }

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      if (M.isReduced() || !M.hasGsap()) {
        panel.style.height = open ? "0" : "auto";
        panel.style.clipPath = open ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)";
        panel.style.opacity = open ? "0" : "1";
        return;
      }
      if (open) {
        gsap.to(panel, {
          height: 0, clipPath: "inset(0 0 100% 0)", opacity: 0,
          duration: 0.3, ease: "power3.out"
        });
      } else {
        gsap.set(panel, { height: "auto" });
        gsap.from(panel, { height: 0, duration: 0.01 });
        gsap.to(panel, {
          height: "auto", clipPath: "inset(0 0 0% 0)", opacity: 1,
          duration: 0.3, ease: "power3.out",
          onComplete: function () { if (window.ScrollTrigger) { ScrollTrigger.refresh(); } }
        });
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    return wrap;
  }

  function linksRow(item) {
    var row = document.createElement("div");
    row.className = "cr-links";
    (item.links || []).forEach(function (l) {
      var a = document.createElement("a");
      a.href = l.href;
      a.textContent = l.label;
      if (l.external) { a.target = "_blank"; a.rel = "noopener"; }
      row.appendChild(a);
    });
    return row;
  }

  function techChips(item) {
    var wrap = document.createElement("div");
    wrap.className = "cr-tech";
    (item.tech || []).forEach(function (t) {
      wrap.appendChild(textNode("tech", t));
    });
    return wrap;
  }

  function crtFrame(item) {
    var frame = document.createElement("div");
    frame.className = "crt-frame";
    var screen = document.createElement("div");
    screen.className = "crt-screen";
    var img = document.createElement("img");
    img.src = item.image;
    img.alt = item.imageAlt || "";
    img.loading = "lazy";
    screen.appendChild(img);
    frame.appendChild(screen);
    var led = document.createElement("span");
    led.className = "crt-led";
    frame.appendChild(led);

    /* PRJ-06 magnifier: lens follows cursor with 0.25 lerp (desktop pointer). */
    if (window.matchMedia("(pointer: fine)").matches && !M.isReduced()) {
      var lens = document.createElement("div");
      lens.className = "crt-lens";
      var lensImg = document.createElement("img");
      lensImg.src = item.image;
      lensImg.alt = "";
      lens.appendChild(lensImg);
      frame.appendChild(lens);

      var ZOOM = 1.8;
      var lx = 0, ly = 0, tx = 0, ty = 0, active = false, raf = null;
      function sizeLens() {
        var src = screen.querySelector("img");
        lensImg.style.width = (src.clientWidth * ZOOM) + "px";
      }
      function loop() {
        lx += (tx - lx) * 0.25;
        ly += (ty - ly) * 0.25;
        lens.style.left = (lx - 55) + "px";
        lens.style.top = (ly - 55) + "px";
        lensImg.style.left = -(lx * 1.8 - 55) + "px";
        lensImg.style.top = -(ly * 1.8 - 55) + "px";
        if (active || Math.abs(tx - lx) > 0.5) { raf = requestAnimationFrame(loop); }
        else { raf = null; }
      }
      screen.addEventListener("mouseenter", function () {
        sizeLens();
        lens.style.display = "block";
        active = true;
        if (!raf) { raf = requestAnimationFrame(loop); }
      });
      screen.addEventListener("mousemove", function (e) {
        var r = screen.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
      });
      screen.addEventListener("mouseleave", function () {
        active = false;
        lens.style.display = "none";
      });
    }
    return frame;
  }

  function buildPanel(item) {
    credits.innerHTML = "";

    var title = document.createElement("h3");
    title.className = "cr-title";
    title.textContent = item.title;
    credits.appendChild(title);

    var studioV = textNode("v", item.studio);
    credits.appendChild(row("STUDIO", studioV));

    var genreV = document.createElement("span");
    genreV.className = "v";
    genreV.appendChild(glyphSvg(item.glyph));
    genreV.appendChild(document.createTextNode(item.genre));
    credits.appendChild(row("GENRE", genreV));

    credits.appendChild(Object.assign(document.createElement("p"), { className: "cr-what", textContent: item.what }));

    credits.appendChild(techChips(item));

    if (item.type === "personal" && item.image) {
      credits.appendChild(crtFrame(item));
    }

    if ((item.links || []).length) {
      credits.appendChild(linksRow(item));
    }

    credits.appendChild(detailsBlock(item));
  }

  function counterText(n) {
    return P.counterFormat.replace("{n}", String(n + 1).padStart(2, "0")).replace("{total}", String(items.length).padStart(2, "0"));
  }

  function buildDots() {
    dotsEl.innerHTML = "";
    items.forEach(function (item, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (i === index ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", item.title);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
      dot.addEventListener("click", function () { goTo(i); });
      dotsEl.appendChild(dot);
    });
  }

  function paintDots() {
    dotsEl.querySelectorAll(".dot").forEach(function (d, i) {
      d.classList.toggle("active", i === index);
      d.setAttribute("aria-selected", i === index ? "true" : "false");
    });
  }

  /* ---------- index change (PRJ-02/04/07) ---------- */
  function setIndex(next, skipFly) {
    if (next === index && skipFly !== "force") { return; }
    var prev = index;
    index = next;
    buildPanel(items[index]);
    counterEl.textContent = counterText(index);
    paintDots();

    if (M.hasGsap() && !M.isReduced()) {
      gsap.fromTo(credits, { opacity: 0, x: prev <= index ? 24 : -24 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out", overwrite: true });
      gsap.fromTo(counterEl, { scale: 1.18 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }
    if (shelf && !skipFly) { shelf.goTo(index, prev); }
    if (pathBActive) { flyCss3D(prev, index); }
  }

  function goTo(i) {
    if (!st) { setIndex(i); return; }
    var progress = i / (items.length - 1);
    var y = st.start + progress * (st.end - st.start);
    window.scrollTo({ top: y, behavior: M.isReduced() ? "auto" : "smooth" });
  }

  /* ---------- mobile / fallback stack (Path C, also the SEO/SR structure) ---------- */
  function buildMobileStack() {
    mobile.innerHTML = "";
    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "proj-card";

      var title = document.createElement("h3");
      title.className = "cr-title";
      title.textContent = item.title;
      card.appendChild(title);

      var meta = row("STUDIO", textNode("v", item.studio));
      card.appendChild(meta);
      var genreV = document.createElement("span");
      genreV.className = "v";
      genreV.appendChild(glyphSvg(item.glyph));
      genreV.appendChild(document.createTextNode(item.genre));
      card.appendChild(row("GENRE", genreV));

      card.appendChild(Object.assign(document.createElement("p"), { className: "cr-what", textContent: item.what }));
      card.appendChild(techChips(item));

      if (item.type === "personal" && item.image) {
        card.appendChild(crtFrame(item));
      }

      var list = document.createElement("ul");
      item.bullets.forEach(function (b) {
        var li = document.createElement("li");
        li.textContent = b;
        list.appendChild(li);
      });
      var panel = document.createElement("div");
      panel.className = "details-panel";
      panel.appendChild(list);
      if (item.caption) {
        panel.appendChild(Object.assign(document.createElement("p"), { className: "caption", textContent: item.caption }));
      }
      card.appendChild(panel);

      if (item.id === "casino-suite" && diagramsTemplate) {
        panel.appendChild(diagramsTemplate.content.cloneNode(true));
      }

      if ((item.links || []).length) {
        card.appendChild(linksRow(item));
      }
      mobile.appendChild(card);
    });
  }

  /* ---------- Path B: CSS-3D cartridges ---------- */
  var pathBActive = false;
  var bCartridges = [];

  function initPathB() {
    pathBActive = true;
    bCartridges = items.map(function (item, i) {
      var node = document.createElement("div");
      node.className = "proj-card cart3d";
      node.style.cssText =
        "position:absolute;left:50%;top:50%;width:min(340px,80vw);margin:0;" +
        "transform:translate(-50%,-50%) perspective(900px) rotateY(0deg);z-index:" + (i === 0 ? 2 : 1) + ";" +
        (i === 0 ? "" : "opacity:0;");
      node.innerHTML = "<div class='cr-title' style='font-size:1.2rem'></div>" +
        "<p class='cr-what'></p><div class='cr-tech'></div>";
      node.querySelector(".cr-title").textContent = item.title;
      node.querySelector(".cr-what").textContent = item.what;
      var tech = node.querySelector(".cr-tech");
      (item.tech || []).forEach(function (t) {
        var chip = document.createElement("span");
        chip.className = "tech";
        chip.textContent = t;
        tech.appendChild(chip);
      });
      stage.appendChild(node);
      return node;
    });
  }

  function flyCss3D(prev, next) {
    if (!pathBActive || shelf) { return; } /* the real shelf owns flight once live */
    if (!bCartridges.length) { return; }
    var out = bCartridges[prev];
    var inc = bCartridges[next];
    if (M.hasGsap() && !M.isReduced()) {
      gsap.to(out, { x: -160, rotateY: -55, opacity: 0, duration: 0.7, ease: "power2.in" });
      gsap.fromTo(inc, { x: 160, rotateY: 55, opacity: 0 }, {
        x: 0, rotateY: 0, opacity: 1, duration: 0.7, ease: "power2.out",
        onComplete: function () { if (out !== inc) { gsap.set(out, { zIndex: 1 }); } gsap.set(inc, { zIndex: 2 }); }
      });
    } else {
      gsap.set(out, { opacity: 0 });
      gsap.set(inc, { opacity: 1, zIndex: 2 });
    }
  }

  /* ---------- Path decision (§3.1) ---------- */
  function webglOk() {
    try {
      var test = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (test.getContext("webgl") || test.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function initPin() {
    if (!M.hasScrollTrigger()) { return false; }
    st = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "+=" + (items.length * 85 + 100) + "vh",
      pin: true,
      scrub: true,
      snap: {
        snapTo: 1 / (items.length - 1),
        duration: 0.35,
        ease: "power2.inOut",
        delay: 0.05
      },
      onUpdate: function (self) {
        var i = Math.max(0, Math.min(items.length - 1, Math.round(self.progress * (items.length - 1))));
        if (i !== index) { setIndex(i); }
      }
    });
    return true;
  }

  function boot() {
    buildMobileStack();
    buildDots();
    setIndex(0, "force");

    /* Deep links: #projects/<id> boots the story at that cartridge. */
    var hashId = (location.hash || "").replace("#projects/", "");
    var hashIndex = items.findIndex(function (it) { return it.id === hashId; });

    var desktop = window.matchMedia("(min-width: 1024px)").matches;
    var finePointer = window.matchMedia("(pointer: fine)").matches;
    var wants3D = desktop && finePointer && !M.prefersSaveData() && webglOk();

    if (wants3D && M.hasScrollTrigger()) {
      /* Path A: real three.js, lazily. document-relative specifier (§3.1 fix). */
      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) { return; }
        observer.disconnect();
        var kick = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };
        kick(function () {
          var specifier = new URL("assets/vendor/three.module.min.js", document.baseURI).href;
          Promise.race([
            import(specifier),
            new Promise(function (_, reject) { setTimeout(reject, 4000); })
          ]).then(function (THREE) {
            return import(new URL("js/shelf3d.js", document.baseURI).href).then(function (mod) {
              shelf = mod.init(THREE, { stage: stage, canvas: canvas, items: items, theme: M.currentTheme() });
              if (st) { shelf.goTo(index, index); }
            });
          }).catch(function (err) {
            /* 4s timeout or load failure → Path B, never a blank stage. */
            window.__shelfErr = String((err && err.message) || err);
            if (!shelf && !pathBActive) { initPathB(); }
          });
        });
      }, { rootMargin: "200% 0px" });
      observer.observe(stage);

      initPin();
      initPathB(); /* visible from frame one; the 3D canvas fades in over it when ready */
      if (hashIndex > -1) { setTimeout(function () { goTo(hashIndex); }, 400); }
      return;
    }

    if (desktop && M.hasScrollTrigger()) {
      /* Path B: WebGL unavailable → CSS-3D cartridges in the same pinned story. */
      initPathB();
      initPin();
      if (hashIndex > -1) { setTimeout(function () { goTo(hashIndex); }, 400); }
      return;
    }

    /* Path C: mobile / reduced-motion — vertical stack only. */
    stage.style.display = "none";
    if (hashIndex > -1) {
      var targetCard = mobile.children[hashIndex];
      if (targetCard) { M.scrollToEl(targetCard); }
    }
  }

  boot();
})();
