(() => {
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  const MODES = ["system", "light", "dark"];
  const LABEL = { system: "System", light: "Light", dark: "Dark" };
  const mode = () => root.dataset.theme || "system";
  function paintTheme() {
    const btn = $("theme"), now = mode(), next = MODES[(MODES.indexOf(now) + 1) % MODES.length];
    btn.dataset.mode = now;
    const label = `Theme: ${LABEL[now]}. Switch to ${LABEL[next]}`;
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }
  $("theme").addEventListener("click", () => {
    const next = MODES[(MODES.indexOf(mode()) + 1) % MODES.length];
    if (next === "system") delete root.dataset.theme;
    else root.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
    paintTheme();
  });
  paintTheme();

  function fail(message) {
    document.body.dataset.state = "error";
    $("brand").textContent = "Portfolio";
    $("main").replaceChildren(
      h("section", { class: "wrap fail", role: "alert" },
        h("h1", {}, "This page didn't load properly."),
        h("p", {}, message),
        h("button", { class: "btn", type: "button", onclick: () => location.reload() }, "Reload the page"),
      ),
    );
    $("foot").replaceChildren();
  }

  const linkEl = (l, cls) => h("a", { class: cls, href: l.href, ...(/^https?:/.test(l.href) ? { rel: "noopener" } : {}) }, l.label);

  function heroCopy(c) {
    return [
      h("p", { class: "meta" }, h("span", { class: "who" }, c.name), h("span", {}, c.role)),
      h("h1", {}, c.headline),
      c.availability ? h("p", { class: "lede" }, c.availability) : null,
      h("div", { class: "actions" },
        h("a", { class: "btn", href: `mailto:${c.email}` }, "Email me"),
        c.cv ? h("a", { class: "btn ghost", href: c.cv, download: "" }, "Download CV") : null,
        ...(c.links || []).slice(0, 2).map((l) => linkEl(l, "plain")),
      ),
    ];
  }

  const slugOf = (p) => p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const imagesOf = (p) => (p.images?.length ? p.images : p.image ? [{ src: p.image, alt: p.alt }] : []);
  const kindLabel = (p) => p.platform || (p.kind === "mobile" ? "Mobile app" : "Web");
  const emptyFrame = (text) => h("span", { class: "frame-empty" }, h("span", {}, text));

  function picture(src, alt) {
    const img = h("img", { src, alt, decoding: "async", draggable: "false" });
    img.addEventListener("error", () => img.replaceWith(emptyFrame("Screenshot unavailable")));
    return img;
  }

  const isMobile = (p) => p.kind === "mobile";
  function pagesOf(p, perPage = 3) {
    const imgs = imagesOf(p), size = isMobile(p) ? perPage : 1, pages = [];
    for (let j = 0; j < imgs.length; j += size) pages.push(imgs.slice(j, j + size));
    return pages;
  }
  const phones = (imgs, alt, small) =>
    h("span", { class: "phones" }, imgs.map((im) => picture(small && im.small ? im.small : im.src, alt(im))));

  function preview(p) {
    if (p.cover) return picture(p.cover.src, "");
    const page = pagesOf(p)[0];
    if (!page) return emptyFrame("No screenshot yet");
    return isMobile(p) ? phones(page, () => "", true) : picture(page[0].src, "");
  }

  function card(p, i, copy) {
    return h("button", {
      class: "card",
      type: "button",
      "data-i": i,
      "aria-haspopup": "dialog",
      ...(copy ? { tabindex: "-1", "aria-hidden": "true" } : {}),
    },
      h("span", { class: "shot" }, h("span", { class: "frame" }, preview(p))),
      h("span", { class: "card-name" }, p.name),
      h("span", { class: "card-meta" }, [p.year, kindLabel(p)].filter(Boolean).join(" · ")),
    );
  }

  function spread(projects, rows) {
    const n = projects.length;
    const family = (i) => projects[i].group || projects[i].family || `#${i}`;
    const order = [], used = new Array(n).fill(false);
    let budget = 20000;
    const clash = (a, b) => a !== b && family(a) === family(b);
    const rowEnds = () => {
      for (let r = 0; r < rows; r++) {
        const row = order.filter((_, k) => k % rows === r);
        if (row.length > 2 && clash(row[0], row[row.length - 1])) return false;
      }
      return true;
    };
    const place = () => {
      if (--budget < 0) return false;
      if (order.length === n) return rowEnds();
      for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        const k = order.length;
        if (k >= rows && clash(order[k - rows], i)) continue;
        used[i] = true; order.push(i);
        if (place()) return true;
        used[i] = false; order.pop();
      }
      return false;
    };
    return place() ? order : projects.map((_, i) => i);
  }

  function mountLanes(host, projects, on) {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const SPEED = 26;
    const ids = spread(projects, projects.length > 3 ? 2 : 1);
    const groups = projects.length > 3 ? [ids.filter((_, k) => k % 2 === 0), ids.filter((_, k) => k % 2 === 1)] : [ids];
    const state = { paused: false, offscreen: false, held: false };
    const lanes = groups.map((g, k) => {
      const track = h("div", { class: "track" });
      const el = h("div", { class: "lane", role: "group", "aria-label": groups.length > 1 ? `Projects, row ${k + 1} of ${groups.length}` : "Projects" }, track);
      return { el, track, ids: g, dir: k % 2 ? -1 : 1, pos: 0, W: 0, hover: false, focus: false, drag: null, rest: 0 };
    });
    host.replaceChildren(...lanes.map((l) => l.el));

    const still = () => motion.matches;
    const apply = (l) => { l.track.style.transform = still() ? "" : `translate3d(${-l.pos}px,0,0)`; };
    const wrap = (l) => {
      if (!l.W) return;
      while (l.pos >= 2 * l.W) l.pos -= l.W;
      while (l.pos < l.W) l.pos += l.W;
    };

    function fill(l) {
      const active = l.el.contains(document.activeElement) ? document.activeElement.dataset.i : null;
      const set = (copy) => l.ids.map((i) => card(projects[i], i, copy));
      l.el.classList.toggle("is-static", still());
      if (still()) {
        l.track.replaceChildren(...set(false));
        l.W = 0;
      } else {
        const oldW = l.W, frac = oldW ? (l.pos - oldW) / oldW : 0;
        l.track.replaceChildren(...set(true), ...set(false), ...set(true));
        const kids = l.track.children;
        l.W = kids[l.ids.length].offsetLeft - kids[0].offsetLeft;
        const sets = 2 + Math.ceil(l.el.clientWidth / Math.max(l.W, 1));
        for (let s = 3; s < sets; s++) l.track.append(...set(true));
        l.pos = l.W * (1 + frac);
        wrap(l);
      }
      apply(l);
      if (active != null) l.track.querySelector(`.card:not([tabindex="-1"])[data-i="${active}"]`)?.focus({ preventScroll: true });
    }

    const moving = (l, now) => !still() && !state.paused && !state.offscreen && !state.held && !l.hover && !l.focus && !l.drag && now >= l.rest && l.W > 0;
    let raf = 0, last = 0;
    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      let any = false;
      for (const l of lanes) {
        if (!moving(l, now)) continue;
        any = true;
        l.pos += l.dir * SPEED * dt;
        wrap(l);
        apply(l);
      }
      if (any) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function wake() {
      const now = performance.now();
      if (!raf && lanes.some((l) => moving(l, now))) { last = 0; raf = requestAnimationFrame(frame); }
    }
    const restFor = (l, ms) => { l.rest = performance.now() + ms; setTimeout(wake, ms + 50); };

    function glideTo(l, card) {
      const laneW = l.el.clientWidth, x = card.offsetLeft, w = card.offsetWidth, pad = 32;
      if (x >= l.pos + pad && x + w <= l.pos + laneW - pad) return;
      l.pos = Math.max(0, x - (laneW - w) / 2);
      l.track.classList.add("is-gliding");
      apply(l);
      setTimeout(() => l.track.classList.remove("is-gliding"), 400);
    }

    for (const l of lanes) {
      const { el, track } = l;
      el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { l.hover = true; } });
      el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { l.hover = false; on.hover(-1); wake(); } });
      el.addEventListener("focusin", (e) => {
        l.focus = true;
        const c = e.target.closest(".card");
        if (!c) return;
        on.hover(+c.dataset.i);
        if (!still() && e.target.matches(":focus-visible")) glideTo(l, c);
      });
      el.addEventListener("focusout", (e) => {
        if (el.contains(e.relatedTarget)) return;
        l.focus = false;
        on.hover(-1);
        wake();
      });
      track.addEventListener("pointerover", (e) => {
        const c = e.target.closest(".card");
        if (c && e.pointerType === "mouse") on.hover(+c.dataset.i);
      });
      track.addEventListener("click", (e) => {
        const c = e.target.closest(".card");
        if (!c) return;
        if (l.drag?.moved || l.justDragged) { e.preventDefault(); return; }
        on.open(+c.dataset.i);
      });

      el.addEventListener("pointerdown", (e) => {
        if (still() || (e.pointerType === "mouse" && e.button !== 0)) return;
        l.drag = { id: e.pointerId, x: e.clientX, pos: l.pos, moved: false, type: e.pointerType };
      });
      el.addEventListener("pointermove", (e) => {
        const d = l.drag;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x;
        if (!d.moved) {
          if (Math.abs(dx) < 6) return;
          d.moved = true;
          el.setPointerCapture(e.pointerId);
          el.classList.add("is-dragging");
        }
        const before = d.pos - dx;
        l.pos = before;
        wrap(l);
        d.pos += l.pos - before;
        apply(l);
      });
      const end = (e) => {
        const d = l.drag;
        if (!d || d.id !== e.pointerId) return;
        l.drag = null;
        el.classList.remove("is-dragging");
        if (d.moved) {
          l.justDragged = true;
          setTimeout(() => { l.justDragged = false; }, 0);
          restFor(l, d.type === "mouse" ? 300 : 1800);
        } else wake();
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("wheel", (e) => {
        if (still() || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        l.pos += e.deltaX;
        wrap(l);
        apply(l);
        restFor(l, 1200);
      }, { passive: false });
    }

    const btn = $("motion");
    function paintButton() {
      btn.hidden = still();
      btn.dataset.state = state.paused ? "paused" : "playing";
      btn.querySelector(".motion-label").textContent = state.paused ? "Play" : "Pause";
      btn.setAttribute("aria-label", state.paused ? "Play the moving project rows" : "Pause the moving project rows");
    }
    btn.onclick = () => { state.paused = !state.paused; paintButton(); wake(); };

    const refill = () => { lanes.forEach(fill); paintButton(); wake(); };
    motion.addEventListener("change", refill);
    let lastW = 0, pending = 0;
    new ResizeObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        if (host.clientWidth === lastW) return;
        lastW = host.clientWidth;
        refill();
      });
    }).observe(host);
    new IntersectionObserver(([en]) => { state.offscreen = !en.isIntersecting; wake(); }).observe(host);

    lastW = host.clientWidth;
    refill();

    return {
      link: (a) => {
        const on = [].concat(a);
        host.querySelectorAll(".card").forEach((c) => c.classList.toggle("is-linked", on.includes(+c.dataset.i)));
      },
      hold: (on) => { state.held = on; wake(); },
    };
  }

  function mountFocus(projects, groups, on) {
    const dlg = $("focus");
    const n = projects.length;
    const overviews = groups.map((g) => {
      const parts = projects.flatMap((p, j) => (p.group === g.key ? [j] : []));
      return { ...g, overview: true, parts };
    }).filter((g) => g.parts.length);
    const entries = [...projects, ...overviews];
    const slugs = entries.map(slugOf);
    const groupAt = (key) => entries.findIndex((e) => e.overview && e.key === key);
    let cur = -1, shot = 0, prevAt = 0, nextAt = 0;

    const shotsOf = (p) => (p.overview
      ? p.parts.map((j) => ({ mobile: isMobile(projects[j]), imgs: pagesOf(projects[j], 2)[0] || [] }))
      : pagesOf(p, 2).map((imgs) => ({ mobile: isMobile(p), imgs }))
    ).filter((page) => page.imgs.length);
    const galleryOf = (p) => {
      const pages = shotsOf(p);
      return pages.length || !p.cover ? pages : [{ mobile: false, imgs: [{ src: p.cover.src, alt: `${p.name} logo` }] }];
    };
    const show = (page, alt, small) => (page.mobile ? phones(page.imgs, alt, small) : picture(page.imgs[0].src, alt(page.imgs[0])));
    const partBtn = (j, kind) => h("button", { type: "button", class: "part", onclick: () => open(j, false) },
      h("span", { class: "part-name" }, entries[j].name),
      kind ? h("span", { class: "part-kind" }, kind) : null);

    function paintParts(p) {
      const el = $("focus-parts");
      const g = !p.overview && p.group ? groupAt(p.group) : -1;
      el.hidden = !p.overview && g < 0;
      el.replaceChildren(...(p.overview ? [
        h("h3", { class: "parts-title" }, `Inside ${p.name}`),
        h("ul", {}, p.parts.map((j) => h("li", {}, partBtn(j, kindLabel(projects[j]))))),
      ] : g < 0 ? [] : [
        h("h3", { class: "parts-title" }, "Part of"),
        h("ul", {}, h("li", {}, partBtn(g, `${entries[g].parts.length} parts`))),
      ]));
    }

    function paintShot(k) {
      const p = entries[cur], pages = galleryOf(p);
      shot = pages.length ? (k + pages.length) % pages.length : 0;
      const page = pages[shot], alt = (im) => im.alt || `Screenshot of ${p.name}`;
      dlg.dataset.kind = isMobile(p) ? "mobile" : "web";
      $("focus-stage").replaceChildren(!page ? emptyFrame("No screenshots yet") : show(page, alt));
      $("focus-thumbs").querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(j === shot)));
    }

    function fill(i) {
      const p = entries[i], pages = galleryOf(p);
      cur = i;
      const kind = p.overview ? `${p.parts.length} parts` : kindLabel(p);
      $("focus-meta").replaceChildren(...[p.year, kind].filter(Boolean).map((t) => h("span", {}, t)));
      $("focus-title").textContent = p.name;
      $("focus-role").replaceChildren(...(p.role && p.at ? [`${p.role} at `, linkEl(p.at, "plain")] : [p.role || ""]));
      $("focus-role").hidden = !p.role;
      $("focus-text").replaceChildren(...[p.summary, ...(p.body || [])].filter(Boolean).map((t) => h("p", {}, t)));
      paintParts(p);
      $("focus-stack").replaceChildren(...(p.stack || []).map((s) => h("li", {}, s)));
      $("focus-stack").hidden = !p.stack?.length;
      $("focus-links").replaceChildren(...(p.links || []).map((l) => linkEl(l, "plain")));
      $("focus-links").hidden = !p.links?.length;
      $("focus-thumbs").replaceChildren(...pages.map((page, j) =>
        h("button", { type: "button", class: "thumb", "aria-label": `${page.mobile ? "Screens" : "Screen"} ${j + 1} of ${pages.length}`, onclick: () => paintShot(j) },
          show(page, () => "", true)),
      ));
      $("focus-thumbs").hidden = pages.length < 2;
      const base = p.overview ? p.parts[0] : i;
      const step = (el, j, dir) => el.replaceChildren(h("span", { class: "step-dir" }, dir), h("span", { class: "step-name" }, projects[j].name));
      prevAt = (base - 1 + n) % n;
      nextAt = (base + 1) % n;
      step($("focus-prev"), prevAt, "Previous");
      step($("focus-next"), nextAt, "Next");
      $("focus-prev").parentElement.hidden = n < 2;
      paintShot(0);
      dlg.querySelector(".focus-in").scrollTop = 0;
    }

    const route = () => {
      const m = location.hash.match(/^#work\/(.+)$/);
      return m ? slugs.indexOf(decodeURIComponent(m[1])) : -1;
    };

    function open(i, push) {
      if (dlg.open && i === cur) return;
      fill(i);
      const hash = `#work/${slugs[i]}`;
      if (location.hash !== hash) {
        if (dlg.open || !push) history.replaceState(history.state, "", hash);
        else history.pushState({ focus: true }, "", hash);
      }
      if (!dlg.open) {
        dlg.showModal();
        on.toggle(true);
      }
    }

    dlg.addEventListener("close", () => {
      on.toggle(false);
      if (route() < 0) return;
      if (history.state?.focus) history.back();
      else history.replaceState(null, "", "#work");
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (galleryOf(entries[cur]).length < 2) return;
      paintShot(shot + (e.key === "ArrowRight" ? 1 : -1));
    });
    $("focus-close").onclick = () => dlg.close();
    $("focus-prev").onclick = () => open(prevAt, false);
    $("focus-next").onclick = () => open(nextAt, false);

    const sync = () => {
      const i = route();
      if (i >= 0) open(i, false);
      else if (dlg.open) dlg.close();
    };
    addEventListener("popstate", sync);
    addEventListener("hashchange", sync);

    return {
      open: (i) => open(i, true),
      openGroup: (key) => { const g = groupAt(key); if (g >= 0) open(g, true); },
      sync,
    };
  }

  function about(c) {
    return [
      h("h2", { id: "about-title" }, "About"),
      h("div", { class: "about-grid" },
        h("div", { class: "bio" }, (c.bio || []).map((t) => h("p", {}, t))),
        h("div", { class: "facts" },
          c.skills?.length ? h("dl", { class: "skills" }, c.skills.map((s) => [h("dt", {}, s.group), h("dd", {}, s.items.join(", "))])) : null,
          c.experience?.length ? h("div", {},
            h("h3", { class: "facts-title" }, "Experience"),
            h("ol", { class: "jobs" }, c.experience.map((e) => h("li", {}, h("span", { class: "job-role" }, e.role), h("span", { class: "job-co" }, e.company), h("span", { class: "job-years" }, e.years)))),
          ) : null,
        ),
      ),
    ];
  }

  function contact(c) {
    const copyBtn = h("button", { class: "copy", type: "button", "data-state": "idle", "aria-label": "Copy email address", title: "Copy email address" });
    copyBtn.innerHTML =
      '<svg class="i-idle" viewBox="0 0 24 24" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
      '<svg class="i-done" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' +
      '<svg class="i-fail" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    const status = h("span", { class: "sr", "aria-live": "polite" });
    let reset;
    copyBtn.addEventListener("click", async () => {
      let ok = true;
      try { await navigator.clipboard.writeText(c.email); } catch { ok = false; }
      copyBtn.dataset.state = ok ? "done" : "fail";
      copyBtn.title = ok ? "Copied" : "Couldn't copy";
      status.textContent = ok ? "Email address copied" : "Couldn't copy. Select the address instead.";
      clearTimeout(reset);
      reset = setTimeout(() => {
        copyBtn.dataset.state = "idle";
        copyBtn.title = "Copy email address";
        status.textContent = "";
      }, 2400);
    });
    const extra = [...(c.cv ? [{ label: "CV (PDF)", href: c.cv }] : []), ...(c.links || [])];
    return [
      h("h2", { id: "contact-title" }, "Hiring, or looking to build something?"),
      h("p", { class: "lede" }, "Email is the fastest way to reach me. I reply within two working days."),
      h("div", { class: "mail-row" }, h("a", { class: "mail", href: `mailto:${c.email}` }, c.email), copyBtn, status),
      extra.length ? h("ul", { class: "elsewhere" }, extra.map((l) => h("li", {}, linkEl(l, "plain")))) : null,
    ];
  }

  function render(c) {
    document.title = `${c.name}, ${c.role}`;
    if (c.sample) {
      const n = $("notice");
      n.textContent = "Sample content. Replace it in content.js before you publish.";
      n.hidden = false;
    }
    $("brand").textContent = c.name;
    const heroEl = $("hero-copy");
    heroEl.replaceChildren(...heroCopy(c));
    heroEl.removeAttribute("aria-busy");

    const projects = c.projects || [];
    const list = $("projects");
    list.removeAttribute("aria-busy");
    let lanes = null, focus = null;
    const linkAll = (a) => lanes?.link(a);
    if (!projects.length) {
      const gh = (c.links || []).find((l) => /github/i.test(l.label));
      list.replaceChildren(h("div", { class: "wrap" }, h("div", { class: "empty" },
        h("p", {}, "Case studies are being written up."),
        gh ? h("p", {}, "Until then, ", linkEl({ label: "see my code on GitHub", href: gh.href }, "plain"), ".") : null,
      )));
    } else {
      $("work-hint").hidden = false;
      focus = mountFocus(projects, c.groups || [], { toggle: (open) => lanes?.hold(open) });
      const hover = (i) => {
        const b = shelfRef.bookOf(i);
        linkAll(b < 0 ? i : shelfRef.books[b]);
        shelfRef.shelf?.show(b);
      };
      lanes = mountLanes(list, projects, { open: (i) => focus.open(i), hover });
    }

    const ab = $("about"), co = $("contact");
    ab.replaceChildren(...about(c)); ab.hidden = false;
    co.replaceChildren(...contact(c)); co.hidden = false;

    $("foot").replaceChildren(
      h("p", {}, `© ${new Date().getFullYear()} ${c.name}`),
    );

    shelfRef.shelf = mountFigure(projects, { focus, link: linkAll });
    focus?.sync();
    document.body.dataset.state = "ready";
  }

  const shelfRef = {
    shelf: null,
    books: [],
    bookOf(i) { return this.books.findIndex((b) => b.includes(i)); },
  };

  function mountFigure(projects, { focus, link }) {
    const groups = [];
    projects.forEach((p, i) => {
      const g = p.group && groups.find((x) => x.key === p.group);
      if (g) g.projects.push(i);
      else groups.push({ key: p.group, short: p.group || p.short || p.name.toLowerCase().slice(0, 10), projects: [i] });
    });
    const items = groups.slice(0, 7).map(({ key, short, projects }) => ({ key, short, projects }));
    shelfRef.books = items.map((it) => it.projects);
    for (const extra of [{ short: "about", target: "about" }, { short: "contact", target: "contact" }]) {
      if (items.length < 6) items.push(extra);
    }
    try {
      return window.mountShelf($("shelf"), $("readout"), items, {
        hover: (a) => link(items[a]?.projects ?? -1),
        pick: (a) => {
          const it = items[a];
          if (it.key && it.projects.length > 1) return focus?.openGroup(it.key);
          if (it.projects) return focus?.open(it.projects[0]);
          const el = $(it.target);
          if (!el) return;
          el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
          el.focus({ preventScroll: true });
        },
      });
    } catch (err) {
      document.querySelector(".plate").classList.add("plate-off");
      console.error(err);
      return null;
    }
  }

  const c = window.PORTFOLIO;
  if (!c || typeof c !== "object" || !c.name || !c.email) {
    fail("The content file is missing or incomplete. Check that content.js sits next to index.html and has a name and an email.");
    return;
  }
  try {
    render(c);
  } catch (err) {
    console.error(err);
    fail("Something in the content file couldn't be read. Refresh, or check content.js for a typo.");
  }
})();
