/* =========================================================
   공통 스크립트
   - 폰 프레임을 창 크기에 맞게 축소
   - 상태바 / 탭바 자동 삽입
   - 화면 전환 방향 (앞으로 / 뒤로 / 탭)

   각 화면 HTML 규칙:
   <body data-tab="home|schedule|profile|none" data-statusbar="solid|clear">
     <div class="stage"><div class="phone-scaler"><div class="phone">
       <main class="screen ..."> ... </main>
     </div></div></div>
   링크에 data-back 을 붙이면 '뒤로' 애니메이션으로 이동.
   ========================================================= */
(function () {
  const root = document.documentElement;


  // ---------- 실제 휴대폰인지 (작은 화면 + 터치) ----------
  const isDevice = () => window.matchMedia("(max-width: 500px) and (pointer: coarse)").matches;

  // ---------- 폰 크기 맞추기 ----------
  function fit() {
    const W = 402, H = 874;
    const device = isDevice();
    root.classList.toggle("device", device);
    let f;
    if (device) {
      f = Math.min(window.innerWidth / W, window.innerHeight / H);
      // 기기에서는 가로를 꽉 채우고 세로는 화면 높이에 맞춤
      root.style.setProperty("--phone-h", Math.round(window.innerHeight / (window.innerWidth / W)) + "px");
      f = window.innerWidth / W;
    } else {
      root.style.removeProperty("--phone-h");
      f = Math.min(1, (window.innerHeight - 64) / H, (window.innerWidth - 48) / W);
    }
    root.style.setProperty("--fit", f.toFixed(4));
  }
  fit();
  window.addEventListener("resize", fit);

  // 페이지(body)를 끝까지 읽기 전에는 첫 화면을 그리지 않음 →
  // 화면 전환 때 새 화면이 상태바·탭바까지 다 갖춘 상태로 찍힘 (없는 id = 문서 끝까지 대기)
  document.write('<link rel="expect" href="#__page-end__" blocking="render">');

  let built = false;
  function build() {
    if (built) return;
    const body = document.body;
    const phone = document.querySelector(".phone");
    if (!body || !phone) return;
    built = true;

    // ---------- 상태바 ----------
    const sb = document.createElement("div");
    sb.className = "statusbar" + (body.dataset.statusbar === "solid" ? " statusbar--solid" : "");
    sb.innerHTML =
      '<div class="sb-time">9:41</div><div class="sb-island"></div>' +
      '<div class="sb-levels">' +
      '<img src="assets/common/cellular.svg" width="19.2" height="12.226" alt="">' +
      '<img src="assets/common/wifi.svg" width="17.142" height="12.328" alt="">' +
      '<img src="assets/common/battery.svg" width="27.328" height="13" alt="">' +
      "</div>";
    phone.appendChild(sb);

    // ---------- 탭바 ----------
    const tab = body.dataset.tab;
    if (tab && tab !== "none") {
      const op = (name) => (name === tab ? 1 : 0.4);
      const dot = (name) => (name === tab ? '<circle cx="23" cy="40.36" r="2" fill="white"/>' : "");
      const nav = document.createElement("nav");
      nav.className = "tabbar";
      nav.innerHTML =
        '<div class="tabbar-pill">' +
        // 홈
        `<a href="home.html" data-tab-link aria-label="홈"><svg width="46" height="46" viewBox="0 0 46 46" fill="none">` +
        `<path transform="translate(0 ${tab === "home" ? 0 : 4})" d="M22.6838 9.51789C22.8656 9.36063 23.1352 9.36048 23.317 9.51789L32.4953 17.4675C32.834 17.7608 32.6267 18.317 32.1787 18.317H30.2589V28.1155C30.2588 28.3826 30.0416 28.5998 29.7745 28.5999H25.2982C25.0312 28.5996 24.815 28.3826 24.815 28.1155V23.0355C24.815 22.7683 24.5978 22.5512 24.3306 22.5511H21.6701C21.4029 22.5511 21.1858 22.7682 21.1858 23.0355V28.1155C21.1858 28.3828 20.9686 28.5999 20.7014 28.5999H16.2262C15.9591 28.5999 15.742 28.3827 15.7419 28.1155V18.317H13.8209C13.3733 18.3166 13.1662 17.7608 13.5043 17.4675L22.6838 9.51789Z" fill="white" fill-opacity="${op("home")}"/>` +
        `${dot("home")}</svg></a>` +
        // 일정 (⇆)
        `<a href="schedule.html" data-tab-link aria-label="일정"><svg width="46" height="46" viewBox="0 0 46 46" fill="none">` +
        `<g transform="translate(11.58 ${tab === "schedule" ? 10.25 : 14.25})" stroke="white" stroke-opacity="${op("schedule")}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
        `<path d="M5.04052 0.750054C3.35379 3.08055 1.47738 5.27675 0.750014 6.08339H22.0833"/>` +
        `<path d="M17.7929 16.7501C19.4796 14.4196 21.356 12.2234 22.0834 11.4167H0.750035"/></g>` +
        `${dot("schedule")}</svg></a>` +
        // 프로필
        `<a href="profile.html" data-tab-link aria-label="프로필"><svg width="46" height="46" viewBox="0 0 46 46" fill="none">` +
        `<g transform="translate(7.64 ${tab === "profile" ? 3.64 : 7.64})" fill="white" fill-opacity="${op("profile")}">` +
        `<circle cx="15" cy="7.68" r="3.84"/>` +
        `<path d="M9.23589 17.8206C9.81974 14.9013 12.3829 12.8 15.36 12.8C18.3371 12.8 20.9003 14.9013 21.4841 17.8206L22.844 24.6201C22.9112 24.956 22.9448 25.124 22.8993 25.2554C22.8594 25.3707 22.7797 25.4679 22.6745 25.5296C22.5545 25.6 22.3833 25.6 22.0407 25.6H8.67926C8.33673 25.6 8.16547 25.6 8.0455 25.5296C7.94029 25.4679 7.86056 25.3707 7.82068 25.2554C7.77521 25.124 7.8088 24.956 7.87597 24.6201L9.23589 17.8206Z"/></g>` +
        `${dot("profile")}</svg></a>` +
        "</div>";
      // 현재 탭에 is-active (등장 모션용)
      const order = ["home", "schedule", "profile"];
      const links = nav.querySelectorAll(".tabbar-pill a");
      const ai = order.indexOf(tab);
      if (ai >= 0 && links[ai]) links[ai].classList.add("is-active");
      phone.appendChild(nav);
    }


    // ---------- 전환 종류 기억 ----------
    // 모든 화면 전환: 배경(지도)은 제자리에서 이어지고 UI만 바뀜 (슬라이드 없음)
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const target = (a.getAttribute("href") || "").split(/[?#]/)[0];
      let type = a.hasAttribute("data-tab-link") ? "tab" : "morph";
      // 화면 구성이 같은 화면끼리는 UI 진입 애니메이션도 생략 → 달라진 요소만 바뀜
      if (SAME_UI.includes(here) && SAME_UI.includes(target) && target !== here) type = "same";
      try { sessionStorage.setItem("vt-type", type); } catch (_) {}
    });
  }
  document.addEventListener("DOMContentLoaded", build);

  // UI 구성까지 같은 화면 묶음 (달력 → 날짜 선택)
  const SAME_UI = ["schedule.html", "schedule-set.html"];
  const here = location.pathname.split("/").pop() || "index.html";

  // ---------- 지도 이어서 움직이기 (FLIP) ----------
  // 화면마다 Figma 지도 위치/크기가 달라서, 새 화면의 지도 이미지를
  // 이전 화면의 지도 위치에서 출발시켜 제자리로 스프링 이동.
  // 지도는 .screen 안에 그대로 있으므로 폰 밖으로 나가지 않음.
  const MAP_SEL = ".sched-bg-map, .map-bg, .mr-bg";
  function mapGeom() {
    const m = document.querySelector(MAP_SEL);
    const phone = document.querySelector(".phone");
    if (!m || !phone) return null;
    const fit = parseFloat(getComputedStyle(root).getPropertyValue("--fit")) || 1;
    const p = phone.getBoundingClientRect();
    const r = m.getBoundingClientRect();
    return {
      m,
      // 보이는 중심과 크기 (폰 좌표, 축소 전 px)
      vx: (r.left + r.width / 2 - p.left) / fit,
      vy: (r.top + r.height / 2 - p.top) / fit,
      w: r.width / fit,
      // transform-origin (레이아웃 박스 중심, 컨테이너 = 폰 좌표)
      ox: m.offsetLeft + m.offsetWidth / 2,
      oy: m.offsetTop + m.offsetHeight / 2,
    };
  }
  function mapFlip() {
    let old = null;
    try { old = JSON.parse(sessionStorage.getItem("vt-map") || "null"); sessionStorage.removeItem("vt-map"); } catch (_) {}
    const now = mapGeom();
    if (!old || !now || !now.w) return;
    const s = old.w / now.w;
    // scale은 origin 기준 → 보이는 중심이 old 위치에 오도록 translate 보정
    const tx = old.vx - now.ox - s * (now.vx - now.ox);
    const ty = old.vy - now.oy - s * (now.vy - now.oy);
    if (Math.abs(tx) < 0.5 && Math.abs(ty) < 0.5 && Math.abs(s - 1) < 0.002) return;
    const easing = getComputedStyle(root).getPropertyValue("--spring-soft").trim() || "ease-out";
    try {
      now.m.animate(
        [{ translate: `${tx}px ${ty}px`, scale: String(s) }, { translate: "0px 0px", scale: "1" }],
        { duration: 750, easing, fill: "backwards" }
      );
    } catch (_) {}
  }

  // 이전 화면: 넘어가기 직전 지도 위치를 기억
  window.addEventListener("pageswap", (e) => {
    if (!e.viewTransition) return;
    root.classList.add("vt-capturing"); // 캡처용 스타일 (app.css 참고)
    const g = mapGeom();
    try {
      if (g) sessionStorage.setItem("vt-map", JSON.stringify({ vx: g.vx, vy: g.vy, w: g.w }));
      else sessionStorage.removeItem("vt-map");
    } catch (_) {}
  });

  // 새 화면: 전환 종류 적용 + 지도 이어 붙이기
  window.addEventListener("pagereveal", (e) => {
    build(); // 첫 화면을 그리기 전에 상태바·탭바를 확실히 넣어둠
    let type = null;
    try { type = sessionStorage.getItem("vt-type"); sessionStorage.removeItem("vt-type"); } catch (_) {}
    if (type) root.classList.add("vt-nav");            // 다른 화면에서 넘어옴
    if (type === "same") root.classList.add("vt-same"); // 같은 구성 화면에서 넘어옴
    if (!e.viewTransition) {
      try { sessionStorage.removeItem("vt-map"); } catch (_) {}
      return;
    }
    mapFlip();
    root.classList.add("vt-capturing");
    e.viewTransition.finished.finally(() => root.classList.remove("vt-capturing"));
    try { e.viewTransition.types.add(type || "morph"); } catch (_) {}
  });
  // 뒤로가기(bfcache)로 이전 화면이 다시 보일 때 캡처용 스타일 정리
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) root.classList.remove("vt-capturing");
  });
})();
