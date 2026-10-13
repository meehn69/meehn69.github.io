/* ============================================================
   SHELF3D — the three.js cartridge scene (Path A, §3.2/3.3).
   ES module, dynamically imported only after three resolves.
   Budget: draw calls ≤ 12 visible, ≤ 8k tris visible, one
   MeshPhysicalMaterial per theme, labels are CanvasTextures
   created once. rAF only runs while the stage is pinned and
   the tab is visible. GSAP tweens scene objects directly.
   ============================================================ */

export function init(THREE, opts) {
  "use strict";
  try {
    return initInner(THREE, opts);
  } catch (err) {
    window.__shelfErr = String((err && err.stack) || err);
    throw err;
  }
}

function initInner(THREE, opts) {
  "use strict";
  var M = window.Motion || { isReduced: function () { return false; } };

  var stage = opts.stage;
  var canvas = opts.canvas;
  var items = opts.items;
  var theme = opts.theme === "b" ? "b" : "c";

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  var mobile = window.matchMedia("(max-width: 1023px)").matches;
  var dprCap = mobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  /* Cartridges sit right of the credits HUD. */
  var shelfGroup = new THREE.Group();
  shelfGroup.position.x = 1.6;
  scene.add(shelfGroup);

  /* ---------- materials (one physical material per theme, shared) ---------- */
  var SKIN = {
    c: { body: 0x2a2150, label: "#ffd447", ink: "#191a2e", glyph: "#191a2e" },
    b: { body: 0x8d90a3, label: "#2456e6", ink: "#ffffff", glyph: "#ffffff" }
  };

  function bodyMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: SKIN[theme].body,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35
    });
  }
  var bodyMat = bodyMaterial();
  var ridgeMat = new THREE.MeshStandardMaterial({ color: theme === "c" ? 0x1c1f3d : 0x7a7d92, roughness: 0.5 });

  /* ---------- environment: tiny gradient scene through PMREM (no HDR files) ---------- */
  var pmrem = new THREE.PMREMGenerator(renderer);
  var envScene = new THREE.Scene();
  var envGeo = new THREE.SphereGeometry(10, 16, 12);
  var envMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
  var envCanvas = document.createElement("canvas");
  envCanvas.width = 2; envCanvas.height = 64;
  var ectx = envCanvas.getContext("2d");
  var grad = ectx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, theme === "c" ? "#4a1e6e" : "#e7e9f2");
  grad.addColorStop(0.6, theme === "c" ? "#171a36" : "#f4f2ec");
  grad.addColorStop(1, theme === "c" ? "#04050c" : "#dcdfeb");
  ectx.fillStyle = grad;
  ectx.fillRect(0, 0, 2, 64);
  var envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envMat.map = envTex;
  envScene.add(new THREE.Mesh(envGeo, envMat));
  var envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(theme === "c" ? 0x8f7bff : 0xffffff, theme === "c" ? 0x14162e : 0xd8d5cc, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(2.5, 3, 4);
  scene.add(key);
  var rim = new THREE.PointLight(theme === "c" ? 0xff5c8a : 0x2456e6, 12, 20);
  rim.position.set(-3, 1.5, -3);
  scene.add(rim);

  /* ---------- label textures (created once per theme) ---------- */
  var glyphPaths = null;
  function loadGlyphPaths() {
    if (glyphPaths) { return Promise.resolve(glyphPaths); }
    return fetch("assets/icons/glyphs.svg")
      .then(function (r) { return r.text(); })
      .then(function (xml) {
        var map = {};
        var doc = new DOMParser().parseFromString(xml, "image/svg+xml");
        doc.querySelectorAll("symbol").forEach(function (sym) {
          map[sym.getAttribute("id")] = sym.innerHTML;
        });
        glyphPaths = map;
        return map;
      })
      .catch(function () { return {}; });
  }

  function drawLabel(item) {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 592;
    var ctx = c.getContext("2d");

    ctx.fillStyle = SKIN[theme].label;
    var r = 36;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(512 - r, 0); ctx.quadraticCurveTo(512, 0, 512, r);
    ctx.lineTo(512, 592 - r); ctx.quadraticCurveTo(512, 592, 512 - r, 592);
    ctx.lineTo(r, 592); ctx.quadraticCurveTo(0, 592, 0, 592 - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = SKIN[theme].ink;
    ctx.font = "700 44px 'Space Grotesk', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    var words = item.title.toUpperCase().split(" ");
    var lines = [];
    var line = "";
    words.forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > 440 && line) { lines.push(line); line = w; }
      else { line = test; }
    });
    if (line) { lines.push(line); }
    lines = lines.slice(0, 3);
    lines.forEach(function (l, i) { ctx.fillText(l, 256, 120 + i * 54); });

    /* Genre glyph, drawn from the sprite's path data via Path2D. */
    if (glyphPaths && glyphPaths[item.glyph]) {
      var paths = glyphPaths[item.glyph].match(/d="[^"]*"/g);
      if (paths) {
        ctx.save();
        ctx.translate(256, 340);
        ctx.scale(0.35, 0.35);
        ctx.translate(-256, -256);
        ctx.fillStyle = SKIN[theme].glyph;
        paths.forEach(function (p) {
          var d = p.slice(3, -1);
          try { ctx.fill(new Path2D(d)); } catch (e) {}
        });
        ctx.restore();
      }
    }

    /* Tech pips: one square per tech (our own original label art). */
    var count = (item.tech || []).length;
    var pip = 22;
    var gap = 14;
    var total = count * pip + (count - 1) * gap;
    for (var i = 0; i < count; i++) {
      ctx.fillStyle = SKIN[theme].ink;
      ctx.fillRect(256 - total / 2 + i * (pip + gap), 500, pip, pip);
    }
    return c;
  }

  /* ---------- cartridge geometry ---------- */
  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }

  var bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.2, 2.6, 0.12), {
    depth: 0.35, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 8
  });
  var ridgeGeo = new THREE.BoxGeometry(1.4, 0.07, 0.08);
  var labelGeo = new THREE.PlaneGeometry(1.9, 2.2);

  var cartridges = items.map(function (item) {
    var group = new THREE.Group();

    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.175;
    group.add(body);

    for (var i = 0; i < 6; i++) {
      var ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.set(0, 1.36, 0.06 + i * 0.045);
      group.add(ridge);
    }

    var label = new THREE.Mesh(
      labelGeo,
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawLabel(item)) })
    );
    label.position.z = 0.24; /* above the beveled front face (body front ≈ 0.215) */
    group.add(label);

    group.visible = false;
    shelfGroup.add(group);
    return group;
  });

  loadGlyphPaths().then(function () {
    /* Redraw labels now that glyph path data is available. */
    items.forEach(function (item, i) {
      var label = cartridges[i].children[cartridges[i].children.length - 1];
      label.material.map = new THREE.CanvasTexture(drawLabel(item));
      label.material.needsUpdate = true;
    });
  });

  /* ---------- state + tweens (PRJ-02 fly, PRJ-03 idle) ---------- */
  var current = -1;
  var tweens = [];

  function killTweens() { tweens.forEach(function (t) { t.kill(); }); tweens = []; }

  function placeInstant(i) {
    cartridges.forEach(function (g, k) {
      g.visible = Math.abs(k - i) <= 1;
      g.position.set(k === i ? 0 : (k < i ? -7 : 7), 0, 0);
      g.rotation.set(0, k === i ? 0 : (k < i ? -0.9 : 0.9), 0);
    });
  }

  var api = {
    /* Hard-reset choreography: every rapid-scroll race ends in a
       deterministic state — nothing can be left stranded mid-flight. */
    goTo: function (next, prev) {
      killTweens();
      current = next;
      cartridges.forEach(function (g, k) {
        var isComing = k === next;
        var side = k < next ? -1 : 1;
        tweens.forEach(function () {});
        gsap.killTweensOf(g.position);
        gsap.killTweensOf(g.rotation);
        if (!isComing) {
          g.visible = Math.abs(k - next) <= 1;
          g.position.set(7 * side, 0, 0);
          g.rotation.set(0, 0.9 * Math.PI * side, 0);
        }
      });
      var incoming = cartridges[next];
      var dir = prev <= next ? 1 : -1;
      incoming.visible = true;
      gsap.set(incoming.position, { x: 7 * dir, y: 0, z: 0 });
      gsap.set(incoming.rotation, { y: 0.9 * Math.PI * dir, z: 0 });
      tweens.push(gsap.to(incoming.position, { x: 0, duration: 0.7, ease: "power2.out", delay: 0.05 }));
      tweens.push(gsap.to(incoming.rotation, { y: 0, z: 0, duration: 0.7, ease: "power2.out", delay: 0.05 }));
    }
  };

  placeInstant(0);
  current = 0;

  /* Idle bob (PRJ-03) + pointer parallax, driven in the render loop. */
  var clock = new THREE.Clock();
  var px = 0, py = 0;
  window.addEventListener("pointermove", function (e) {
    px = (e.clientX / window.innerWidth - 0.5) * 2;
    py = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    var w = stage.clientWidth || 1;
    var h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  var running = false;
  var visible = false;
  function loop() {
    if (!running) { return; }
    requestAnimationFrame(loop);
    if (!visible || document.hidden) { return; }
    var t = clock.getElapsedTime();
    if (cartridges[current]) {
      cartridges[current].rotation.y += Math.sin(t * 1.57) * 0.0009;
      cartridges[current].position.y = Math.sin(t * 1.26) * 0.15;
    }
    camera.position.x += (px * 0.35 - camera.position.x) * 0.08;
    camera.position.y += (-py * 0.25 - camera.position.y) * 0.08;
    camera.lookAt(shelfGroup.position.x * 0.5, 0, 0);
    renderer.render(scene, camera);
  }

  function start() { if (!running) { running = true; loop(); } }
  function stop() { running = false; }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !M.isReduced()) { start(); }
    }, { threshold: 0.05 }).observe(stage);
  } else {
    visible = true;
    start();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stop(); } else if (visible) { start(); }
  });
  if (M.isReduced()) {
    /* One static frame of the shelf; no loop. */
    visible = true;
    renderer.render(scene, camera);
  }

  /* Theme swap: re-tint materials + redraw labels. */
  document.addEventListener("themechange", function (e) {
    theme = e.detail.theme === "b" ? "b" : "c";
    bodyMat.color.setHex(SKIN[theme].body);
    ridgeMat.color.setHex(theme === "c" ? 0x1c1f3d : 0x7a7d92);
    rim.color.setHex(theme === "c" ? 0xff5c8a : 0x2456e6);
    items.forEach(function (item, i) {
      var label = cartridges[i].children[cartridges[i].children.length - 1];
      label.material.map = new THREE.CanvasTexture(drawLabel(item));
      label.material.needsUpdate = true;
    });
    var grad2 = ectx.createLinearGradient(0, 0, 0, 64);
    grad2.addColorStop(0, theme === "c" ? "#4a1e6e" : "#e7e9f2");
    grad2.addColorStop(0.6, theme === "c" ? "#171a36" : "#f4f2ec");
    grad2.addColorStop(1, theme === "c" ? "#04050c" : "#dcdfeb");
    ectx.fillStyle = grad2;
    ectx.fillRect(0, 0, 2, 64);
    envTex.needsUpdate = true;
  });

  /* First render now; hand control back. */
  renderer.render(scene, camera);
  canvas.dataset.shelf = "live";
  window.dispatchEvent(new CustomEvent("shelf3d:ready"));
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 0.6s ease";
  requestAnimationFrame(function () {
    canvas.style.opacity = "1";
    /* The CSS-3D stand-in layer retires for good once the real shelf is live. */
    stage.querySelectorAll(".cart3d").forEach(function (node) {
      node.style.display = "none";
    });
  });

  return api;
}
