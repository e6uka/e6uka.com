(() => {
  const {
    Cam, fit, hull, open, poly, proj, rad, rings, ringAt, run, seg, prism, put, solid, facing,
    tween, tset, tval, tdone, mk, place, pointer, register, disposer, inject,
  } = HL;

  const D = 34, GAP = 0.8, R = 1.8, B = 1, LIFT = 12, LEAN = 5, REST_LAST = -14, STAGGER = 45;
  const DIMS = [[10, 66], [8, 58], [12, 72], [9, 62], [11, 54], [8, 68], [10, 60]];

  function layout(n) {
    const books = [];
    let x = 0;
    for (let i = 0; i < n; i++) {
      const [T, H] = DIMS[i % DIMS.length];
      const rest = n > 2 && i === n - 1 ? REST_LAST : 0;
      if (rest) x += Math.min(H, books[i - 1].H) * Math.sin(rad(-rest)) - GAP;
      const [ring, inner] = rings(0, 0, T, D, R, B);
      books.push({ x, T, H, rest, ring, inner });
      x += T + GAP;
    }
    return { books, W: Math.max(x - GAP, 40) };
  }

  function pose(P, front, bk, th, lift) {
    const s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (u, v, h) => P(bk.x + u + h * s, v, h * c + lift);
    const at = (ring, h) => ring.map((q) => w(q.u, q.v, h));
    return {
      sil: poly(hull(at(bk.ring, 0).concat(at(bk.ring, bk.H)))),
      crease: open(at(run(bk.inner, front), bk.H)),
      bands: seg(w(R, D, 6), w(bk.T - R, D, 6)) + seg(w(R, D, 9), w(bk.T - R, D, 9)) + seg(w(R, D, bk.H - 7), w(bk.T - R, D, bk.H - 7)),
      dots: bk.marks.map((_, k) => w(bk.T / 2, D, bk.H - 14 - k * 3.4)),
    };
  }

  function scaleFor(pts) {
    const P1 = proj(Cam(45, 0.5, 1));
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const p of pts) {
      const q = P1(p[0], p[1], p[2]);
      a = Math.min(a, q[0]); b = Math.max(b, q[0]); c = Math.min(c, q[1]); d = Math.max(d, q[1]);
    }
    return Math.min(300 / (b - a), 236 / (d - c), 2.6);
  }

  window.mountShelf = function mountShelf(stage, readEl, items, on = {}) {
    const bag = disposer();
    inject(document);
    stage.setAttribute("data-hairline", "shelf");
    const svg = mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true", focusable: "false" }, stage);

    const n = Math.min(items.length, DIMS.length);
    const { books, W } = layout(n);
    const X0 = -7, X1 = W + 7, Y0 = -5, Y1 = D + 5;
    const pts = [[X0, Y0, -7], [X1, Y1, -7], [X1, Y0, 0], [X0, Y1, 0]];
    for (const bk of books) {
      const top = bk.H + LIFT, sh = bk.H * Math.sin(rad(LEAN + Math.abs(bk.rest)));
      pts.push([bk.x - sh, 0, top], [bk.x + bk.T + sh, 0, top], [bk.x + bk.T + sh, D, top]);
    }
    const C = Cam(45, 0.5, scaleFor(pts));
    fit(C, pts, 200, 166);
    const P = proj(C), front = facing(C);

    const g = mk("g", {}, svg);
    const [bRing, bInner] = rings(X0, Y0, X1, Y1, 3, 1.4);
    const board = solid(g);
    put(board, prism(P, front, bRing, bInner, -7, 0));

    books.forEach((bk, i) => {
      bk.marks = Array.from({ length: i + 1 });
      const grp = mk("g", {}, g);
      bk.el = solid(grp);
      bk.bands = mk("path", { class: "nf lo" }, grp);
      bk.dotEls = bk.marks.map(() => mk("circle", { r: 1.05, class: "dot off" }, grp));
      bk.a = tween(bk.rest);
      bk.z = tween(0);
      bk.th = NaN;
      bk.lz = NaN;
    });

    function draw(bk, th, lift) {
      const q = pose(P, front, bk, th, lift);
      put(bk.el, { sil: q.sil, crease: q.crease });
      bk.bands.setAttribute("d", q.bands);
      bk.dotEls.forEach((el, k) => place(el, q.dots[k]));
    }

    const loop = register(stage, (_dt, now) => {
      let moving = false;
      for (const bk of books) {
        const th = tval(bk.a, now), lift = tval(bk.z, now);
        if (th !== bk.th || lift !== bk.lz) { draw(bk, th, lift); bk.th = th; bk.lz = lift; }
        if (!tdone(bk.a, now) || !tdone(bk.z, now)) moving = true;
      }
      return moving;
    });
    bag.add(loop.unregister);

    const centre = books.map((bk) => P(bk.x + bk.T / 2 + (bk.H / 2) * Math.sin(rad(bk.rest)), D / 2, bk.H / 2));
    const tops = books.map((bk) => P(bk.x + bk.T / 2, D / 2, bk.H)[1]);
    const yTop = Math.min(...tops, 1e9) - 16, yBot = P(X1, Y1, -7)[1] + 6;
    const xL = P(X0, Y1, 0)[0] - 10, xR = P(X1, Y0, 0)[0] + 10;

    function hit([x, y]) {
      if (!n || y < yTop || y > yBot || x < xL || x > xR) return -1;
      let best = -1, bd = 1e9;
      centre.forEach((c, i) => { const dd = Math.abs(c[0] - x); if (dd < bd) { bd = dd; best = i; } });
      return best;
    }

    const restRead = n ? String(n).padStart(2, "0") + " on the shelf" : "empty shelf";
    let act = -2;
    function setActive(a) {
      if (a === act) return;
      const now = performance.now(), from = a >= 0 ? a : act;
      act = a;
      books.forEach((bk, i) => {
        const delay = from >= 0 ? Math.abs(i - from) * STAGGER : 0;
        const f = a < 0 || i === a ? 0 : Math.max(0.35, 1 - (Math.abs(i - a) - 1) * 0.22);
        tset(bk.a, i === a ? 0 : bk.rest + (i < a ? -1 : 1) * LEAN * f, now, delay);
        tset(bk.z, i === a ? LIFT : 0, now, delay);
        const lit = i === a || (a < 0 && i === 0);
        bk.el.sil.classList.toggle("hi", i === a);
        bk.bands.setAttribute("class", i === a ? "nf hi" : "nf lo");
        bk.dotEls.forEach((el) => el.setAttribute("class", lit ? "dot" : "dot off"));
      });
      readEl.textContent = a < 0 ? restRead : items[a].short;
      stage.style.cursor = a >= 0 ? "pointer" : "";
      loop.wake();
    }
    setActive(-1);

    bag.add(pointer(stage, {
      move: (p) => { const a = hit(p); setActive(a); on.hover?.(a); },
      down: (p) => { const a = hit(p); setActive(a); on.hover?.(a); if (a >= 0) on.pick?.(a); },
      leave: () => { setActive(-1); on.hover?.(-1); },
    }));
    bag.add(() => svg.remove());

    return { show: (a) => setActive(a < n ? a : -1), destroy: bag.dispose };
  };
})();
