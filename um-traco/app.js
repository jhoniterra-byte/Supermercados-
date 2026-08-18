(() => {
  "use strict";

  const STORAGE_STROKES = "umtraco_strokes_v1";
  const STORAGE_HAS_DRAWN = "umtraco_has_drawn_v1";
  const STORAGE_MY_ID = "umtraco_my_stroke_id_v1";

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const counterEl = document.getElementById("strokeCount");
  const drawToggleBtn = document.getElementById("drawToggleBtn");
  const doneMsg = document.getElementById("doneMsg");
  const drawBanner = document.getElementById("drawBanner");
  const cancelDrawBtn = document.getElementById("cancelDrawBtn");
  const toastEl = document.getElementById("toast");
  const infoBtn = document.getElementById("infoBtn");
  const counterBtn = document.getElementById("counterBtn");
  const infoModal = document.getElementById("infoModal");
  const closeInfoBtn = document.getElementById("closeInfoBtn");

  const COLORS = ["#ff5d73", "#ffd23f", "#4dd0e1", "#a78bfa", "#7ee787", "#ff9f6e", "#f472b6", "#93c5fd"];
  const FLAGS = ["🇧🇷", "🇵🇹", "🇯🇵", "🇸🇪", "🇰🇪", "🇦🇷", "🇮🇳", "🇩🇪", "🇨🇦", "🇻🇳", "🇲🇽", "🇳🇬", "🇮🇹", "🇰🇷", "🇦🇺"];

  // ---- deterministic PRNG so first-run seed strokes look stable ----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // ---- state ----
  const view = { scale: 1, panX: 0, panY: 0 };
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let mode = "idle"; // idle | armed | drawing
  let strokes = [];
  let hasDrawn = localStorage.getItem(STORAGE_HAS_DRAWN) === "1";
  let myStrokeId = localStorage.getItem(STORAGE_MY_ID) || null;

  let activePointerId = null;
  let currentStroke = null;
  let dragLast = null; // {x,y} for single-pointer pan
  let dragMoved = false;
  const pinch = new Map(); // pointerId -> {x,y}
  let pinchPrevDist = null;
  let pinchPrevMid = null;

  function loadStrokes() {
    const raw = localStorage.getItem(STORAGE_STROKES);
    if (raw) {
      try {
        strokes = JSON.parse(raw);
        return;
      } catch (e) { /* fall through to seed */ }
    }
    strokes = generateSeedStrokes();
    saveStrokes();
  }

  function saveStrokes() {
    localStorage.setItem(STORAGE_STROKES, JSON.stringify(strokes));
  }

  function generateSeedStrokes() {
    const rnd = mulberry32(20260808);
    const out = [];
    const count = 46;
    for (let i = 0; i < count; i++) {
      const cx = (rnd() - 0.5) * 2600;
      const cy = (rnd() - 0.5) * 2600;
      const pts = [];
      const segs = 3 + Math.floor(rnd() * 6);
      let x = cx, y = cy;
      let ang = rnd() * Math.PI * 2;
      for (let s = 0; s <= segs; s++) {
        pts.push({ x, y });
        ang += (rnd() - 0.5) * 1.6;
        const len = 30 + rnd() * 70;
        x += Math.cos(ang) * len;
        y += Math.sin(ang) * len;
      }
      const daysAgo = Math.floor(rnd() * 400) + 1;
      out.push({
        id: "seed-" + i,
        points: pts,
        color: COLORS[Math.floor(rnd() * COLORS.length)],
        width: 5 + rnd() * 4,
        ts: Date.now() - daysAgo * 86400000,
        flag: FLAGS[Math.floor(rnd() * FLAGS.length)],
        mine: false,
      });
    }
    return out;
  }

  // ---- coordinate transforms (CSS-pixel space) ----
  function getRect() { return canvas.getBoundingClientRect(); }

  function screenToWorld(sx, sy) {
    return { x: (sx - view.panX) / view.scale, y: (sy - view.panY) / view.scale };
  }

  function clampScale(s) { return Math.min(6, Math.max(0.15, s)); }

  // ---- rendering ----
  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = getRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    render();
  }

  function render() {
    const rect = getRect();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.panX, dpr * view.panY);

    drawDotGrid(rect);

    for (const s of strokes) drawStroke(s);
    if (currentStroke) drawStroke(currentStroke);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawDotGrid(rect) {
    const step = 120;
    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(rect.width, rect.height);
    const startX = Math.floor(topLeft.x / step) * step;
    const startY = Math.floor(topLeft.y / step) * step;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    const r = 1.4 / view.scale;
    for (let x = startX; x < bottomRight.x; x += step) {
      for (let y = startY; y < bottomRight.y; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawStroke(s) {
    if (!s.points || s.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width || 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = s.mine ? 1 : 0.88;
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (s.mine) {
      ctx.save();
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---- UI state sync ----
  function syncUI() {
    counterEl.textContent = strokes.length.toLocaleString("pt-BR");
    if (hasDrawn) {
      drawToggleBtn.classList.add("hidden");
      doneMsg.classList.remove("hidden");
    } else {
      drawToggleBtn.classList.remove("hidden");
      doneMsg.classList.add("hidden");
    }
  }

  function showToast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  function relativeTime(ts) {
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days <= 0) return "hoje";
    if (days === 1) return "há 1 dia";
    if (days < 30) return `há ${days} dias`;
    const months = Math.floor(days / 30);
    if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`;
    const years = Math.floor(months / 12);
    return `há ${years} ${years === 1 ? "ano" : "anos"}`;
  }

  // ---- draw mode ----
  function armDrawing() {
    if (hasDrawn) return;
    mode = "armed";
    drawBanner.classList.remove("hidden");
  }

  function cancelDrawing() {
    mode = "idle";
    currentStroke = null;
    drawBanner.classList.add("hidden");
    render();
  }

  function finalizeStroke() {
    if (!currentStroke || currentStroke.points.length < 2) {
      currentStroke = null;
      showToast("Arraste para desenhar uma linha. Você ainda pode tentar.");
      mode = "armed";
      render();
      return;
    }
    strokes.push(currentStroke);
    hasDrawn = true;
    myStrokeId = currentStroke.id;
    localStorage.setItem(STORAGE_HAS_DRAWN, "1");
    localStorage.setItem(STORAGE_MY_ID, myStrokeId);
    saveStrokes();
    currentStroke = null;
    mode = "idle";
    drawBanner.classList.add("hidden");
    syncUI();
    render();
    showToast("Seu traço ficou registrado para sempre. 🖋️", 3600);
  }

  // ---- hit test (tap to inspect, idle mode only) ----
  function hitTest(worldX, worldY) {
    const threshold = 16;
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      for (let j = 1; j < s.points.length; j++) {
        const a = s.points[j - 1], b = s.points[j];
        if (distToSegment(worldX, worldY, a.x, a.y, b.x, b.y) < threshold) return s;
      }
    }
    return null;
  }

  function distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  }

  // ---- pointer events ----
  const pointers = new Map();

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === "drawing") return; // ignore extra fingers mid-stroke

    if (mode === "armed" && pointers.size === 1) {
      mode = "drawing";
      activePointerId = e.pointerId;
      const rect = getRect();
      const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      currentStroke = {
        id: uid(),
        points: [w],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 7,
        ts: Date.now(),
        mine: true,
      };
      drawBanner.classList.add("hidden");
      render();
      return;
    }

    if (pointers.size === 1) {
      dragLast = { x: e.clientX, y: e.clientY };
      dragMoved = false;
    } else if (pointers.size === 2) {
      dragLast = null;
      const pts = [...pointers.values()];
      pinchPrevDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchPrevMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === "drawing" && e.pointerId === activePointerId) {
      const rect = getRect();
      const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const last = currentStroke.points[currentStroke.points.length - 1];
      if (Math.hypot(w.x - last.x, w.y - last.y) > 2 / view.scale) {
        currentStroke.points.push(w);
        render();
      }
      return;
    }

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      if (pinchPrevDist) {
        const factor = dist / pinchPrevDist;
        zoomAt(mid.x, mid.y, factor);
        view.panX += mid.x - pinchPrevMid.x;
        view.panY += mid.y - pinchPrevMid.y;
        render();
      }
      pinchPrevDist = dist;
      pinchPrevMid = mid;
      return;
    }

    if (dragLast && pointers.size === 1) {
      const dx = e.clientX - dragLast.x;
      const dy = e.clientY - dragLast.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      view.panX += dx;
      view.panY += dy;
      dragLast = { x: e.clientX, y: e.clientY };
      render();
    }
  });

  function endPointer(e) {
    const wasDrawing = mode === "drawing" && e.pointerId === activePointerId;
    const wasTap = pointers.has(e.pointerId) && !dragMoved && mode === "idle";
    const tapPos = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);

    if (wasDrawing) {
      activePointerId = null;
      finalizeStroke();
      return;
    }

    if (pointers.size < 2) { pinchPrevDist = null; pinchPrevMid = null; }
    if (pointers.size === 0) dragLast = null;

    if (wasTap && tapPos) {
      const rect = getRect();
      const w = screenToWorld(tapPos.x - rect.left, tapPos.y - rect.top);
      const hit = hitTest(w.x, w.y);
      if (hit) {
        if (hit.mine) showToast("✨ Este é o seu traço. Único, para sempre.");
        else showToast(`${hit.flag || "🌍"} Um traço deixado por um estranho, ${relativeTime(hit.ts)}.`);
      }
    }
  }

  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", (e) => {
    pointers.delete(e.pointerId);
    if (mode === "drawing" && e.pointerId === activePointerId) {
      activePointerId = null;
      currentStroke = null;
      mode = "armed";
      render();
    }
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = getRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    zoomAt(sx, sy, factor);
    render();
  }, { passive: false });

  function zoomAt(sx, sy, factor) {
    const before = screenToWorld(sx, sy);
    view.scale = clampScale(view.scale * factor);
    view.panX = sx - before.x * view.scale;
    view.panY = sy - before.y * view.scale;
  }

  // ---- buttons ----
  drawToggleBtn.addEventListener("click", armDrawing);
  cancelDrawBtn.addEventListener("click", cancelDrawing);
  infoBtn.addEventListener("click", () => infoModal.classList.remove("hidden"));
  counterBtn.addEventListener("click", () => infoModal.classList.remove("hidden"));
  closeInfoBtn.addEventListener("click", () => infoModal.classList.add("hidden"));
  infoModal.addEventListener("click", (e) => { if (e.target === infoModal) infoModal.classList.add("hidden"); });

  window.addEventListener("resize", resize);

  // ---- boot ----
  function boot() {
    loadStrokes();
    const rect = getRect();
    view.panX = rect.width / 2;
    view.panY = rect.height / 2;
    view.scale = 1;
    syncUI();
    resize();
    if (!hasDrawn) {
      setTimeout(() => infoModal.classList.remove("hidden"), 400);
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  boot();
})();
