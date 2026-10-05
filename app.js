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

  function shot(p) {
    const empty = h("div", { class: "frame-empty" }, h("span", {}, "No screenshot yet"));
    if (!p.image) return h("div", { class: "shot" }, h("div", { class: "frame" }, empty));
    const img = h("img", { src: p.image, alt: p.alt || `Screenshot of ${p.name}`, loading: "lazy", decoding: "async", width: 1600, height: 1000 });
    img.addEventListener("error", () => img.replaceWith(empty));
    return h("div", { class: "shot" }, h("div", { class: "frame" }, img));
  }

  function project(p, i) {
    return h("article", { class: "project", id: `p-${i}`, tabindex: "-1", "data-i": i, "aria-labelledby": `p-${i}-t` },
      shot(p),
      h("div", { class: "info" },
        h("p", { class: "meta" }, p.year ? h("span", {}, p.year) : null, p.role ? h("span", {}, p.role) : null),
        h("h3", { id: `p-${i}-t` }, p.name),
        h("p", { class: "summary" }, p.summary),
        p.stack?.length ? h("ul", { class: "stack", "aria-label": "Built with" }, p.stack.map((s) => h("li", {}, s))) : null,
        p.links?.length ? h("p", { class: "links" }, p.links.map((l) => linkEl(l, "plain"))) : null,
      ),
    );
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
    const copyBtn = h("button", { class: "btn ghost copy", type: "button" }, "Copy");
    const status = h("span", { class: "sr", "aria-live": "polite" });
    copyBtn.addEventListener("click", async () => {
      let ok = true;
      try { await navigator.clipboard.writeText(c.email); } catch { ok = false; }
      copyBtn.textContent = ok ? "Copied" : "Copy failed";
      status.textContent = ok ? "Email address copied" : "Couldn't copy. Select the address instead.";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 2400);
    });
    const extra = [...(c.cv ? [{ label: "CV (PDF)", href: c.cv }] : []), ...(c.links || [])];
    return [
      h("h2", { id: "contact-title" }, "Hiring for a frontend role?"),
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
    if (!projects.length) {
      const gh = (c.links || []).find((l) => /github/i.test(l.label));
      list.replaceChildren(h("div", { class: "empty" },
        h("p", {}, "Case studies are being written up."),
        gh ? h("p", {}, "Until then, ", linkEl({ label: "see my code on GitHub", href: gh.href }, "plain"), ".") : null,
      ));
    } else {
      list.replaceChildren(...projects.map(project));
    }

    const ab = $("about"), co = $("contact");
    ab.replaceChildren(...about(c)); ab.hidden = false;
    co.replaceChildren(...contact(c)); co.hidden = false;

    $("foot").replaceChildren(
      h("p", {}, `© ${new Date().getFullYear()} ${c.name}`),
    );

    mountFigure(c, projects);
    document.body.dataset.state = "ready";
  }

  function mountFigure(c, projects) {
    const items = projects.slice(0, 7).map((p, i) => ({ short: p.short || p.name.toLowerCase().slice(0, 10), target: `p-${i}` }));
    for (const extra of [{ short: "about", target: "about" }, { short: "contact", target: "contact" }]) {
      if (items.length < 6) items.push(extra);
    }
    const rows = [...document.querySelectorAll(".project")];
    const link = (a) => rows.forEach((r, i) => r.classList.toggle("is-linked", i === a));

    let shelf;
    try {
      shelf = window.mountShelf($("shelf"), $("readout"), items, {
        hover: link,
        pick: (a) => {
          const el = $(items[a].target);
          if (!el) return;
          el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
          el.focus({ preventScroll: true });
        },
      });
    } catch (err) {
      document.querySelector(".plate").classList.add("plate-off");
      console.error(err);
      return;
    }

    rows.forEach((r, i) => {
      r.addEventListener("pointerenter", () => { shelf.show(i); link(i); });
      r.addEventListener("pointerleave", () => { shelf.show(-1); link(-1); });
      r.addEventListener("focusin", () => { shelf.show(i); link(i); });
      r.addEventListener("focusout", (e) => { if (!r.contains(e.relatedTarget)) { shelf.show(-1); link(-1); } });
    });
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
