(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  document.title = `${S.name} — Portfolio`;
  $("logo").textContent = S.name;
  $("hero-role").textContent = S.role;
  $("hero-headline").textContent = S.headline;

  // ---------- 작업물 ----------
  const grid = $("project-grid");
  $("work-count").textContent = String(S.projects.length).padStart(2, "0");
  S.projects.forEach((p, i) => {
    const card = el("a", "card reveal");
    card.href = p.url || "#";
    if (p.url && p.url !== "#") { card.target = "_blank"; card.rel = "noopener"; }

    const media = el("div", "card-media");
    if (p.thumb) {
      const img = el("img");
      img.src = p.thumb;
      img.alt = p.title;
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      media.appendChild(el("span", "card-placeholder", p.title));
    }
    card.appendChild(media);

    const meta = el("div", "card-meta");
    const left = el("div");
    left.appendChild(el("h3", "card-title", p.title));
    left.appendChild(el("p", "card-summary", p.summary));
    const right = el("div", "card-tags");
    right.appendChild(el("span", null, p.category));
    right.appendChild(el("span", null, p.year));
    meta.append(left, right);
    card.appendChild(meta);

    card.style.transitionDelay = `${(i % 2) * 80}ms`;
    grid.appendChild(card);
  });

  // ---------- 소개 ----------
  S.about.forEach((t) => $("about-text").appendChild(el("p", "reveal", t)));
  S.skills.forEach((t) => $("skills").appendChild(el("li", null, t)));
  S.education.forEach((e) => {
    const li = el("li");
    li.append(el("span", "muted", e.period), el("span", null, e.text));
    $("education").appendChild(li);
  });

  // ---------- 연락처 ----------
  const mail = $("contact-email");
  mail.textContent = S.email;
  mail.href = `mailto:${S.email}`;
  S.links.forEach((l) => {
    const li = el("li");
    const a = el("a", null, l.label + " ↗");
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener";
    li.appendChild(a);
    $("contact-links").appendChild(li);
  });

  $("footer").textContent = `© ${new Date().getFullYear()} ${S.name}`;

  // ---------- 스크롤 등장 효과 ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  // ---------- 스크롤하면 상단바 배경 ----------
  const bar = $("top-bar");
  const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
