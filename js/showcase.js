(function () {
  const cfg = window.SHOWCASE || { playVideo: "", list: [] };
  const body = document.body;
  const tabs = document.querySelectorAll(".sc-tab");
  const playView = document.getElementById("playView");
  const playVideo = document.getElementById("playVideo");
  const listView = document.getElementById("listView");
  const listInner = document.getElementById("listInner");
  const isVideo = (f) => /\.(mp4|webm|mov|m4v)$/i.test(f);
  const src = (f) => "media/" + f;

  // ---------- ▶ 메인 영상 (소리와 함께 반복 재생) ----------
  // 후보 파일 이름을 차례로 시도해서 처음으로 열리는 영상을 사용
  const soundBtn = document.getElementById("soundBtn");
  const candidates = [].concat(cfg.playVideo || []).filter(Boolean);
  let hasMain = false;

  function updateSoundBtn() {
    soundBtn.hidden = !hasMain || body.dataset.mode !== "play";
    soundBtn.classList.toggle("is-muted", playVideo.muted);
    soundBtn.setAttribute("aria-label", playVideo.muted ? "소리 켜기" : "소리 끄기");
  }

  // 브라우저는 '사용자가 누르기 전' 소리 자동재생을 막기 때문에:
  // 소리 켜고 재생 시도 → 막히면 소리 없이 재생 + '소리 켜기' 버튼 표시 → 아무 곳이나 누르면 소리 켜짐
  function playMain(withSound) {
    if (!hasMain) return;
    playVideo.muted = !withSound;
    playVideo.play().catch(() => {
      playVideo.muted = true;
      playVideo.play().catch(() => {});
    }).finally(updateSoundBtn);
    updateSoundBtn();
  }

  function tryCandidate(i) {
    if (i >= candidates.length) return; // 영상 없음 → 로고만
    playVideo.src = src(candidates[i]);
    playVideo.onerror = () => tryCandidate(i + 1);
    playVideo.onloadeddata = () => {
      playVideo.onerror = null;
      hasMain = true;
      playView.classList.add("has-video");
      playVideo.classList.add("ready");
      if (body.dataset.mode === "play") playMain(true);
    };
    playVideo.load();
  }
  tryCandidate(0);

  let userMuted = false;   // 사용자가 직접 소리를 끈 경우엔 자동으로 다시 켜지 않음
  let firstTouch = true;
  soundBtn.addEventListener("click", () => {
    firstTouch = false;
    playVideo.muted = !playVideo.muted;
    userMuted = playVideo.muted;
    if (playVideo.paused) playVideo.play().catch(() => {});
    updateSoundBtn();
  });
  // 페이지 어디든 처음 누르면 (▶ 모드일 때) 소리 켜기
  document.addEventListener("pointerdown", (e) => {
    if (!firstTouch || e.target.closest("#soundBtn")) return;
    firstTouch = false;
    if (hasMain && body.dataset.mode === "play" && playVideo.muted && !userMuted) {
      playVideo.muted = false;
      updateSoundBtn();
    }
  });

  // ---------- ☰ 목록 (넣은 순서대로) ----------
  const items = (cfg.list || []).filter(Boolean);
  listView.classList.toggle("is-empty", items.length === 0 && !cfg.prototype);
  items.forEach((f, i) => {
    const wrap = document.createElement("div");
    wrap.className = "sc-item";
    let el;
    if (isVideo(f)) {
      el = document.createElement("video");
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.preload = "metadata";
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.dataset.autoplay = "1";
    } else {
      el = document.createElement("img");
      el.alt = "";
      el.decoding = "async";
      el.loading = i < 2 ? "eager" : "lazy";
    }
    el.src = src(f);
    wrap.appendChild(el);
    listInner.appendChild(wrap);
  });

  // 맨 아래: 직접 눌러볼 수 있는 프로토타입
  if (cfg.prototype) {
    const sec = document.createElement("section");
    sec.className = "sc-item sc-proto";
    const frame = document.createElement("iframe");
    frame.src = cfg.prototype;
    frame.title = "산디종 인터랙티브 프로토타입";
    frame.loading = "lazy";
    frame.setAttribute("allowtransparency", "true");
    sec.appendChild(frame);
    listInner.appendChild(sec);
  }

  // 화면에 들어오면 등장 + 영상 재생, 나가면 영상 일시정지
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target.querySelector("video");
      if (e.isIntersecting) {
        e.target.classList.add("in");
        if (v && body.dataset.mode === "list") v.play().catch(() => {});
      } else if (v) {
        v.pause();
      }
    });
  }, { threshold: 0.15 });
  listInner.querySelectorAll(".sc-item").forEach((n) => io.observe(n));

  // ---------- 탭 전환 ----------
  function setMode(mode) {
    body.dataset.mode = mode;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.target === mode)));
    if (mode === "play") {
      listInner.querySelectorAll("video").forEach((v) => v.pause());
      // ▶ 탭을 누른 건 사용자 동작이라 소리와 함께 처음부터 재생 가능
      if (hasMain) { playVideo.currentTime = 0; playMain(!userMuted); }
    } else {
      playVideo.pause();
      window.scrollTo(0, 0);
      listInner.querySelectorAll(".sc-item.in video").forEach((v) => v.play().catch(() => {}));
    }
    updateSoundBtn();
    try { history.replaceState(null, "", "#" + mode); } catch (_) {}
  }
  tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.target)));

  // 주소 끝이 #list 면 목록으로 시작
  setMode(location.hash === "#list" ? "list" : "play");
})();
