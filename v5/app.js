(() => {
  const C = window.WEDDING;
  // V5 는 V4 설정(config.js 의 v4)을 그대로 쓰고, v5 에 적은 항목만 덮어씁니다. 사진·영상은 ../v4/assets/, 장면 1 전용 파일은 media/ 에 있습니다
  const V = Object.assign({
    rsvpPopup: false,
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "11.webp", "12.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],
    videos: {},      // { hero, night } : v4/assets/ 안의 mp4 파일명. 있으면 사진 위에 영상을 겹칩니다
    sequences: {},   // { propose: { dir, count }, door: { dir, count } } : 스크롤로 넘기는 프레임 묶음
  }, C.v4 || {}, C.v5 || {});
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const QS = new URLSearchParams(location.search);
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches || QS.has("still");
  // 신부측 링크(주소 끝 ?side=bride): 첫 화면은 신부 이름 먼저, 맨 아래는 신랑 이름 먼저. 나머지는 같습니다.
  const BRIDE = QS.get("side") === "bride";
  if (RM) document.documentElement.classList.add("rm");

  /* ---------- 날짜 (한국 시간 기준) ---------- */
  const D = new Date(C.date);
  const kst = new Date(D.getTime() + 9 * 3600e3);
  const Y = kst.getUTCFullYear(), M = kst.getUTCMonth() + 1, DD = kst.getUTCDate(), H = kst.getUTCHours(), MI = kst.getUTCMinutes();
  const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const DOW_EN = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][kst.getUTCDay()];
  const pad = n => String(n).padStart(2, "0");
  const h12 = ((H + 11) % 12) + 1;
  const hourKo = `${H < 12 ? "오전" : "오후"} ${h12}시${MI ? ` ${MI}분` : ""}`;
  const hourEn = `${h12}${MI ? ":" + pad(MI) : ""}${H < 12 ? "AM" : "PM"}`;
  const ymd = `${String(Y).slice(2)}.${pad(M)}.${pad(DD)}`;
  const whenKo = `${Y}년 ${M}월 ${DD}일 ${DOW_KO}요일 ${hourKo}`;
  const cap = s => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

  /* ---------- toast / copy ---------- */
  let tt;
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); };
  const copy = async (text, msg = "복사되었습니다") => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast(msg);
  };

  /* ---------- 글자 채우기 ---------- */
  const gEn = cap(C.groom.nameEn), bEn = cap(C.bride.nameEn);
  const bind = {
    // 영문 이름 순서: 신랑측 링크는 첫 화면 신랑 먼저 · 맨 아래 신부 먼저, 신부측 링크는 그 반대
    openA: BRIDE ? bEn : gEn, openB: BRIDE ? gEn : bEn, closeA: BRIDE ? gEn : bEn, closeB: BRIDE ? bEn : gEn,
    groomName: C.groom.name, brideName: C.bride.name,
    venueEn: C.venue.nameEn, hallEn: C.venue.hallEn, venueName: C.venue.name, venueHall: C.venue.hall, address: C.venue.address,
  };
  $$("[data-bind]").forEach(el => el.textContent = bind[el.dataset.bind] ?? "");
  $("#heroDate").textContent = `${ymd} · ${DOW_EN}, ${hourEn}`;
  $("#greeting").innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  $("#parG").textContent = `${C.groom.father.name} · ${C.groom.mother.name}의`;
  $("#parB").textContent = `${C.bride.father.name} · ${C.bride.mother.name}의`;
  $("#relG").textContent = C.groom.relation; $("#relB").textContent = C.bride.relation;
  $("#sixD").textContent = `${ymd} · ${DOW_EN}`;
  $("#sixK").textContent = whenKo;
  $("#footDate").textContent = `${Y} . ${pad(M)} . ${pad(DD)}`;

  /* ---------- 달력 · 남은 날 ---------- */
  $("#calTitle").textContent = `${Y}.${pad(M)}.${pad(DD)}`;
  $("#calSub").textContent = `${DOW_KO}요일 ${hourKo}`;
  const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let g = ["일", "월", "화", "수", "목", "금", "토"].map((d, i) => `<div class="dow${i === 0 ? " sun" : ""}">${d}</div>`).join("");
  for (let i = 0; i < first; i++) g += "<div></div>";
  for (let d = 1; d <= days; d++) g += `<div class="d${(first + d - 1) % 7 === 0 ? " sun" : ""}${d === DD ? " day" : ""}">${d}</div>`;
  $("#calendar").innerHTML = `<div class="grid">${g}</div>`;
  const kstToday = () => { const t = new Date(Date.now() + 9 * 3600e3); t.setUTCHours(0, 0, 0, 0); return t; };
  const dd = Math.round((Date.UTC(Y, M - 1, DD) - kstToday()) / 864e5);
  const n1 = esc(C.groom.name.slice(1)), n2 = esc(C.bride.name.slice(1));
  $("#ddayText").innerHTML = dd > 0 ? `${n1}, ${n2}의 결혼식이 <b>${dd}일</b> 남았습니다.`
    : dd === 0 ? `오늘, ${n1}, ${n2}가 결혼합니다.` : `${n1}, ${n2}가 결혼한 지 <b>${-dd}일</b> 되었습니다.`;

  const end = new Date(D.getTime() + (C.durationMinutes || 180) * 6e4);
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const evTitle = `${C.groom.name} ♥ ${C.bride.name} 결혼식`;
  const loc = `${C.venue.name} ${C.venue.hall} (${C.venue.address})`;
  const shareUrl = (C.siteUrl ? C.siteUrl + "v5/" : location.href.split(/[?#]/)[0]) + (BRIDE ? "?side=bride" : "");
  $("#gcalBtn").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evTitle)}&dates=${utc(D)}/${utc(end)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(shareUrl)}`;
  $("#icsBtn").onclick = () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//KO", "BEGIN:VEVENT", `UID:${utc(D)}-wedding@kk`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(D)}`, `DTEND:${utc(end)}`, `SUMMARY:${evTitle}`, `LOCATION:${loc.replace(/,/g, "\\,")}`, `URL:${shareUrl}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${evTitle}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "wedding.ics"; a.click();
  };

  /* ---------- 오시는 길 ---------- */
  const q = encodeURIComponent(C.venue.name);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${encodeURIComponent(C.venue.name + " " + C.venue.address)}&hl=ko&z=16&output=embed`;
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/to/${q},${C.venue.lat},${C.venue.lng}`;
  $("#navTmap").href = `tmap://route?goalname=${q}&goalx=${C.venue.lng}&goaly=${C.venue.lat}`;
  $("#navTmap").addEventListener("click", () => setTimeout(() => { if (!document.hidden) toast("티맵 앱이 설치되어 있어야 합니다"); }, 1500));
  if (C.venue.tel) { $("#venueTel").textContent = `Tel. ${C.venue.tel}`; $("#venueTel").href = `tel:${C.venue.tel}`; }
  $("#addrCopy").onclick = () => copy(C.venue.address, "주소가 복사되었습니다");
  $("#transport").innerHTML = C.venue.transport.map(t => `<div class="t"><h4>${esc(t.title)}</h4><ul>${t.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`).join("");

  /* ---------- 영상 (선택): config.js 의 v4.videos 에 파일명이 있으면 사진 위에 겹칩니다 ----------
   * 사진은 영상의 첫 장면과 같은 구도라서, 영상이 재생되기 시작하면 사진 위로 부드럽게 겹쳐집니다.
   * 근처에 왔을 때 불러오고, 화면에 보일 때만 재생합니다. 자동 재생이 막힌 기기에서는 사진이 그대로 보입니다.
   *   opt.afterLoad   페이지의 다른 사진을 다 불러온 뒤에 불러오기 (첫 화면용)
   *   opt.nearEl      이 요소가 가까워지면 불러오기 (기본은 영상이 들어갈 칸) */
  const addVideo = (box, file, opt = {}) => {
    if (!file || RM || !box) return;
    const attach = () => {
      const v = document.createElement("video");
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true; v.preload = "auto";
      ["muted", "playsinline", "webkit-playsinline", "disablepictureinpicture"].forEach(a => v.setAttribute(a, ""));
      v.setAttribute("aria-hidden", "true"); v.className = "vid";
      v.addEventListener("playing", () => v.classList.add("on"));
      v.src = "../v4/assets/" + file;
      box.appendChild(v);
      new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { const pr = v.play(); if (pr) pr.catch(() => {}); }
        else v.pause();
      }), { threshold: .05 }).observe(box);
    };
    const whenNear = () => new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); attach(); } }, { rootMargin: "150% 0px" }).observe(opt.nearEl || box);
    if (opt.afterLoad && document.readyState !== "complete") addEventListener("load", () => setTimeout(whenNear, 300), { once: true });
    else whenNear();
  };
  addVideo($("#heroPhoto"), V.videos.hero, { afterLoad: true });
  addVideo($("#nightPhoto"), V.videos.night);

  /* ---------- 갤러리 (가로로 넘기기) ---------- */
  const track = $("#gTrack");
  const items = V.gallery.map((f, i) => `<button class="g-item" data-src="../v4/assets/gallery/${esc(f)}" aria-label="사진 ${i + 1} 크게 보기"><img src="../v4/assets/gallery/${esc(f)}" alt="웨딩 사진 ${i + 1}" loading="lazy" draggable="false"></button>`);
  track.innerHTML = items.join("");
  $("#gTotal").textContent = items.length;
  const gItems = $$(".g-item", track);
  const gUpdate = () => {
    const tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2;
    let best = 0, bd = 1e9;
    gItems.forEach((el, i) => {
      const r = el.getBoundingClientRect(), off = (r.left + r.width / 2 - mid) / tr.width;
      if (Math.abs(off) < bd) { bd = Math.abs(off); best = i; }
      if (!RM && Math.abs(off) < 1.5) $$("img", el).forEach(m => m.style.transform = `translate3d(${(-off * 7).toFixed(2)}%,0,0)`);
    });
    $("#gCur").textContent = best + 1;
  };
  track.addEventListener("scroll", () => requestAnimationFrame(gUpdate), { passive: true });
  const lb = $("#lightbox");
  track.addEventListener("click", e => { const b = e.target.closest("button.g-item"); if (!b) return; $("#lbImg").src = b.dataset.src; lb.hidden = false; document.body.classList.add("locked"); });
  const closeLb = () => { lb.hidden = true; unlock(); };
  lb.addEventListener("click", closeLb);
  document.addEventListener("contextmenu", e => { if (e.target.closest("img,video,canvas")) e.preventDefault(); });

  /* ---------- 사진 확대 막기 ----------
   * 사진·영상이 있는 칸에서는 두 손가락 확대, 두 번 눌러 확대가 되지 않습니다 (style.css 의 touch-action 과 함께 동작).
   * 글씨가 있는 카드에서는 확대할 수 있고, 그렇게 화면을 확대해도 갤러리 사진은 원래 크기로 보입니다. */
  const PHOTO = ".pin,.garden,.person .ph,.g-track,.end-photo,.lightbox";
  const onPhoto = e => e.target && e.target.closest && e.target.closest(PHOTO);
  ["gesturestart", "gesturechange"].forEach(t => document.addEventListener(t, e => { if (onPhoto(e)) e.preventDefault(); }, { passive: false }));
  document.addEventListener("wheel", e => { if (e.ctrlKey && onPhoto(e)) e.preventDefault(); }, { passive: false });
  const gWrap = $("#gWrap"), vv = window.visualViewport;
  if (vv) {
    const fix = () => {
      const z = vv.scale || 1;
      if (z <= 1.01) { if (gWrap.style.transform) gWrap.style.transform = ""; return; }
      const host = gWrap.parentElement.getBoundingClientRect(), W = gWrap.offsetWidth, Hh = gWrap.offsetHeight;
      const ox = Math.min(W, Math.max(0, (vv.offsetLeft - host.left - gWrap.offsetLeft) / (1 - 1 / z)));
      const oy = Math.min(Hh, Math.max(0, vv.offsetTop + vv.height / 2 - host.top - gWrap.offsetTop));
      gWrap.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
      gWrap.style.transform = `scale(${(1 / z).toFixed(4)})`;
    };
    vv.addEventListener("resize", fix); vv.addEventListener("scroll", fix);
  }

  /* ---------- 마음 전하실 곳 ---------- */
  const accGroup = (title, list) => {
    const rows = list.filter(a => a.number);
    return `<div class="acc-group"><button class="acc-head" aria-expanded="false">${title}</button><div class="acc-body">${rows.map(a => `
      <div class="acc-row"><div><small>${esc(a.role)} ${esc(a.name)}</small><div class="num">${esc(a.bank)} <b>${esc(a.number)}</b></div></div>
      <button class="mini" data-acc="${esc(`${a.bank} ${a.number} ${a.name}`)}">복사</button>${a.kakaopay ? `<a class="mini" href="${esc(a.kakaopay)}" target="_blank" rel="noopener">카카오페이</a>` : ""}</div>`).join("")}</div></div>`;
  };
  const accG = C.accounts.groom || [], accB = C.accounts.bride || [];
  const hasG = accG.some(a => a.number), hasB = accB.some(a => a.number);
  if (!hasG && !hasB) { $("#accountsSec").hidden = true; $$('.quick a[href="#accountsSec"]').forEach(a => a.hidden = true); }
  $("#accounts").innerHTML = (hasG ? accGroup("신랑측 계좌번호", accG) : "") + (hasB ? accGroup("신부측 계좌번호", accB) : "");
  $("#accounts").onclick = e => {
    const h = e.target.closest(".acc-head");
    if (h) { const grp = h.parentElement; grp.classList.toggle("open"); h.setAttribute("aria-expanded", grp.classList.contains("open")); }
    const c = e.target.closest("[data-acc]");
    if (c) copy(c.dataset.acc, "계좌번호가 복사되었습니다");
  };

  /* ---------- 모달 ---------- */
  function unlock() {
    if (!$$(".modal:not([hidden])").length && lb.hidden) document.body.classList.remove("locked");
    if (introFlow) setTimeout(() => { if (introFlow && !$$(".modal:not([hidden])").length) { introFlow = false; holdY = null; document.documentElement.classList.remove("hold"); afterIntro(); } }, 60);
  }
  function openModal(sel) { $(sel).hidden = false; document.body.classList.add("locked"); }
  function closeModal(m) { m.hidden = true; unlock(); }
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", e => { if (e.key !== "Escape") return; $$(".modal:not([hidden])").forEach(closeModal); if (!lb.hidden) closeLb(); });

  /* ---------- 참석 회신 (다른 버전과 같은 시트에 기록) ---------- */
  const API = C.appsScriptUrl;
  const post = payload => fetch(API, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  if (C.rsvpDeadline) {
    const d = new Date(C.rsvpDeadline + "T00:00:00+09:00");
    $("#rsvpDeadline").textContent = `회신 부탁드리는 날짜 · ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }
  $("#rsvpOpen").onclick = () => openModal("#rsvpModal");
  const rf = $("#rsvpForm");
  rf.addEventListener("change", () => rf.classList.toggle("absent", rf.attend.value === "불참"));
  rf.addEventListener("submit", async e => {
    e.preventDefault();
    const data = { type: "rsvp", side: rf.side.value, attend: rf.attend.value, name: rf.name.value.trim(), phone: rf.phone.value.trim(),
      meal: "", note: rf.note.value.trim() };
    if (!data.name) return;
    if (API) {
      const btn = rf.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "전달 중…";
      try { await post(data); if (introFlow) thanked = true; else toast("소중한 회신 감사합니다"); rf.reset(); rf.classList.remove("absent"); closeModal($("#rsvpModal")); store.set("rsvp_done", "1"); }
      catch { toast("전송에 실패했어요. 잠시 후 다시 시도해주세요"); }
      finally { btn.disabled = false; btn.textContent = "전달하기"; }
    } else if (C.rsvpFallbackPhone) {
      const body = `[참석 회신] ${data.side} / ${data.name} / ${data.attend}${data.note ? ` / ${data.note}` : ""}`;
      location.href = `sms:${C.rsvpFallbackPhone}${/iPhone|iPad/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    } else toast("참석 회신 기능이 아직 준비 중입니다");
  });
  /* 첫 화면에서 스크롤을 시작하면 참석 의사 안내 창을 먼저 띄웁니다 (v4.rsvpPopup: true).
   * 회신을 마치거나, "오늘 하루 보지 않기"·닫기로 넘기면 "이어서 화면을 내려주세요!"가 잠깐 뜨고
   * 화면이 저절로 "어릴 적 인연이" 장면까지 천천히 내려갑니다. 이미 회신했거나 오늘 넘긴 분, 예식이 지난 뒤에는 뜨지 않습니다. */
  $("#popWhen").textContent = `${Y}. ${pad(M)}. ${pad(DD)} (${DOW_KO}) ${hourKo}`;
  const todayKey = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  let introShown = false, introFlow = false, thanked = false, navJump = 0;
  // 바로가기·링크로 다른 곳에 이동하는 중에는 띄우지 않습니다
  document.addEventListener("click", e => { if (e.target.closest('a[href^="#"]')) navJump = Date.now(); });
  const showRsvpIntro = () => {
    if (introShown || !V.rsvpPopup || Date.now() > D.getTime()) return;
    introShown = true;
    if (store.get("rsvp_done") || store.get("rsvp_skip") === todayKey()) return;
    if ($$(".modal:not([hidden])").length || !lb.hidden) return;
    introFlow = true; thanked = false;
    // 창이 떠 있는 동안: 손으로는 더 내려가지 않게 막고(관성도 멈춤), 뒤 화면은 첫 화면이 완전히 넘어가는 지점(장면 1 시작)까지
    // 천천히 감속하며 저절로 내려갑니다. "어릴 적 인연이"는 창을 닫은 뒤에 나옵니다.
    holdY = Math.round($("#s1").getBoundingClientRect().top + scrollY);
    document.documentElement.classList.add("hold");
    if (RM) window.scrollTo(0, holdY);
    else {
      const y0 = scrollY, d = holdY - y0, ms = Math.min(1400, 700 + Math.abs(d) * 2.5), t0 = performance.now();
      const step = now => {
        if (holdY == null) return;
        const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);   // 감속
        window.scrollTo(0, Math.round(y0 + d * e));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    openModal("#rsvpIntro");
  };
  let holdY = null;
  const holdBlock = e => { if (holdY != null && !e.target.closest(".modal-card, .modal form, .modal .sheet")) e.preventDefault(); };
  addEventListener("touchmove", holdBlock, { passive: false });
  addEventListener("wheel", holdBlock, { passive: false });
  // 화면을 정해진 위치까지 부드럽게 내립니다. 그사이 화면을 만지면 멈춥니다
  const glideTo = (y, ms) => {
    if (RM) return window.scrollTo(0, y);
    const y0 = scrollY, t0 = performance.now(); let stop = false;
    const halt = () => { stop = true; };
    ["touchstart", "wheel", "keydown"].forEach(t => addEventListener(t, halt, { once: true, passive: true }));
    const step = now => {
      if (stop) return;
      const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, Math.round(y0 + (y - y0) * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  let cueT = 0;
  const afterIntro = () => {
    const cue = $("#cue");
    $("#cueThanks").hidden = !thanked;
    cue.classList.add("show");
    clearTimeout(cueT); cueT = setTimeout(() => cue.classList.remove("show"), 3200);
    // 불 꺼진 거실에 "어릴 적 인연이" 글이 떠오른 지점까지 (TV 가 켜지기 직전)
    const s1 = el("s1"), top = s1.getBoundingClientRect().top + scrollY;
    const target = Math.round(top + .065 * (s1.offsetHeight - innerHeight));
    if (target > scrollY) setTimeout(() => glideTo(target, Math.min(2600, 1200 + (target - scrollY) * .6)), 450);
  };
  $("#rsvpIntroGo").onclick = () => { closeModal($("#rsvpIntro")); openModal("#rsvpModal"); };
  $("#rsvpIntroSkip").onclick = () => { store.set("rsvp_skip", todayKey()); closeModal($("#rsvpIntro")); };

  /* ---------- 공유 ---------- */
  $("#copyLink").onclick = () => copy(shareUrl, "청첩장 링크가 복사되었습니다");
  if (navigator.share) { $("#nativeShare").hidden = false; $("#nativeShare").onclick = () => navigator.share({ title: document.title, url: shareUrl }).catch(() => {}); }
  if (C.kakaoJsKey) {
    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"; s.crossOrigin = "anonymous";
    s.onload = () => {
      if (!window.Kakao) return; Kakao.init(C.kakaoJsKey);
      $("#kakaoShare").hidden = false;
      $("#kakaoShare").onclick = () => Kakao.Share.sendDefault({
        objectType: "feed",
        content: { title: `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`, description: `${whenKo}\n${C.venue.name} ${C.venue.hall}`,
          imageUrl: (C.siteUrl || shareUrl) + "assets/og-v4.jpg", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
        buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      });
    };
    document.head.appendChild(s);
  }

  /* ---------- 바로가기 ---------- */
  $("#quick").addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault();
    $(a.getAttribute("href")).scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  });

  /* ---------- 차례로 나타나기 ---------- */
  $$("#greeting p").forEach((el, i) => el.style.transitionDelay = `${i * 260}ms`);
  if ("IntersectionObserver" in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    $$(".rv,#greeting p").forEach(el => io.observe(el));
    // 혼주 소개의 신랑·신부 사진은 지나갈 때마다 좌우에서 모입니다: 화면 밖으로 완전히 나가면 제자리로 돌려 두었다가 다시 들어올 때 움직임
    const ioX = new IntersectionObserver(es => es.forEach(e => {
      if (e.intersectionRatio >= .18) e.target.classList.add("in");
      else if (!e.isIntersecting) e.target.classList.remove("in");
    }), { threshold: [0, .18] });
    $$(".rv-x").forEach(el => ioX.observe(el));
  } else $$(".rv,.rv-x,#greeting p").forEach(el => el.classList.add("in"));

  /* ==========================================================
   *  스크롤 연동
   * ========================================================== */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t * t * (3 - 2 * t);
  let vh = innerHeight, vw = innerWidth;
  // 화면에 고정된 장면의 진행률 0~1 (동작 줄이기에서는 대표 장면 하나를 보여 줍니다)
  const pinP = (el, still) => { if (RM) return still; const r = el.getBoundingClientRect(), d = r.height - vh; return d > 0 ? clamp(-r.top / d) : 0; };
  // 화면을 지나가는 블록의 진행률 0~1
  const viewP = el => { const r = el.getBoundingClientRect(); return clamp((vh - r.top) / (vh + r.height)); };
  const near = (el, m = 1) => { const r = el.getBoundingClientRect(); return r.bottom > -vh * m && r.top < vh * (1 + m); };

  /* 프레임 묶음을 스크롤로 넘기는 재생기.
   * - 스크롤 위치를 바로 따라가지 않고 짧게(약 0.07초) 미끄러지듯 따라가서, 스크롤이 툭툭 끊겨도 화면은 매 주사(60·120Hz)마다 조금씩 움직입니다.
   * - 위치가 두 프레임 사이면 두 장을 겹쳐 그립니다.
   * - 프레임은 8장 간격 → 4장 → 2장 → 1장 순서로 불러와서, 다 받기 전에도 장면 전체가 보이고 점점 촘촘해집니다. */
  const gliding = new Set();
  let glideId = 0, glideT = 0;
  const glide = now => {
    const dt = Math.min(64, glideT ? now - glideT : 16); glideT = now;
    const k = 1 - Math.exp(-dt / 70);
    gliding.forEach(s => {
      const d = s.target - s.cur;
      if (Math.abs(d) < .02) { s.cur = s.target; gliding.delete(s); } else s.cur += d * k;
      s.paint();
    });
    glideId = gliding.size ? requestAnimationFrame(glide) : 0;
    if (!glideId) glideT = 0;
  };
  class Seq {
    constructor(canvas, url, count, cover) { Object.assign(this, { canvas, url, count, cover, imgs: [], last: "", cur: -1, target: 0, started: false }); this.ctx = canvas.getContext("2d"); }
    load() {
      if (this.started) return; this.started = true;
      const order = [], seen = new Set(), add = i => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
      for (const step of [8, 4, 2, 1]) { for (let i = 0; i < this.count; i += step) add(i); add(this.count - 1); }
      order.forEach(i => {
        const im = new Image(); im.decoding = "async";
        im.onload = () => { im.ok = true; this.last = ""; this.paint(); };
        im.src = this.url(i); this.imgs[i] = im;
      });
    }
    draw(p) {
      this.target = clamp(p) * (this.count - 1);
      if (this.cur < 0 || RM || Math.abs(this.target - this.cur) < .02) { this.cur = this.target; gliding.delete(this); return this.paint(); }
      gliding.add(this);
      if (!glideId) glideId = requestAnimationFrame(glide);
    }
    put(im, alpha) {
      const c = this.canvas, x = this.ctx;
      x.globalAlpha = alpha;
      if (!this.cover) return x.drawImage(im, 0, 0, c.width, c.height);
      const k = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
      x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
    }
    paint() {
      const ok = i => this.imgs[i] && this.imgs[i].ok, w = Math.max(0, this.cur);
      // 지금 위치 앞뒤로 이미 받은 프레임을 찾아 그 사이를 겹쳐 그립니다
      let lo = Math.floor(w), hi = Math.ceil(w);
      while (lo > 0 && !ok(lo)) lo--;
      while (hi < this.count - 1 && !ok(hi)) hi++;
      if (!ok(lo)) { if (!ok(hi)) return; lo = hi; }
      if (!ok(hi)) hi = lo;
      let t = hi > lo ? Math.round((w - lo) / (hi - lo) * 32) / 32 : 0;
      if (t >= 1) { lo = hi; t = 0; }
      const key = t > 0 ? `${lo}+${hi}+${t}` : `${lo}`;
      if (key === this.last) return;
      this.last = key;
      this.put(this.imgs[lo], 1);
      if (t > 0) this.put(this.imgs[hi], t);
      this.ctx.globalAlpha = 1;
    }
  }
  const jump = new Seq($("#jump"), i => `../v4/assets/jump/${String(i).padStart(3, "0")}.webp`, 81, false);
  const coverSeq = (boxSel, conf) => {
    if (!conf || !conf.count || RM) return null;
    const cv = document.createElement("canvas");
    $(boxSel).appendChild(cv);
    return new Seq(cv, i => `../v4/assets/${conf.dir}/${String(i).padStart(3, "0")}.webp${conf.v ? "?v=" + conf.v : ""}`, conf.count, true);
  };
  const seqPropose = coverSeq("#shotPropose", V.sequences.propose), seqDoor = coverSeq("#shotDoor", V.sequences.door);
  // 캔버스 크기는 화면 전체가 아니라 장면 칸에 맞춥니다 (큰 화면에서는 칸이 가운데 휴대폰 너비로 좁아집니다)
  const fitSeq = s => {
    if (!s) return;
    const r = s.canvas.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const k = Math.min(2, devicePixelRatio || 1, 1080 / r.width), w = Math.round(r.width * k), h = Math.round(r.height * k);
    if (s.canvas.width === w && s.canvas.height === h) return;
    s.canvas.width = w; s.canvas.height = h; s.last = ""; s.paint();
  };

  /* 전구 줄 */
  const strands = [];
  const buildStrand = (svg, h, sag, step, r, y0, gid) => {
    const W = Math.round(vw * 1.08), n = Math.max(5, Math.round(W / step));
    svg.setAttribute("viewBox", `0 0 ${W} ${h}`); svg.setAttribute("width", W); svg.setAttribute("height", h);
    const y = t => y0 + sag * 4 * t * (1 - t);
    let d = `M0 ${y(0)}`, gs = "";
    for (let i = 1; i <= 40; i++) d += ` L${(W * i / 40).toFixed(1)} ${y(i / 40).toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const t = (i + .5) / n, x = (W * t).toFixed(1), yy = y(t);
      gs += `<g><circle class="glow" cx="${x}" cy="${(yy + r * 2.1).toFixed(1)}" r="${(r * 5).toFixed(1)}" fill="url(#${gid})"/><rect class="cap" x="${(x - r * .45).toFixed(1)}" y="${yy.toFixed(1)}" width="${(r * .9).toFixed(1)}" height="${(r * .9).toFixed(1)}"/><circle class="bulb" cx="${x}" cy="${(yy + r * 2.1).toFixed(1)}" r="${r}"/></g>`;
    }
    svg.innerHTML = `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="#ffe7ad" stop-opacity=".9"/><stop offset=".28" stop-color="#f2d08a" stop-opacity=".42"/><stop offset=".6" stop-color="#f2d08a" stop-opacity=".12"/><stop offset="1" stop-color="#f2d08a" stop-opacity="0"/></radialGradient></defs><path d="${d}"/>${gs}`;
    return $$("g", svg);
  };
  const buildLights = () => { strands[0] = buildStrand($("#strandFar"), 54, 20, 30, 2.6, 4, "glF"); strands[1] = buildStrand($("#strandNear"), 74, 26, 46, 4, 6, "glN"); lit = [-1, -1]; };
  let lit = [-1, -1];
  const setLit = (k, f) => { const g = strands[k], n = Math.round(f * g.length); if (n === lit[k]) return; lit[k] = n; g.forEach((el, i) => el.classList.toggle("lit", i < n)); };

  /* 바탕색 */
  const scenes = $$(".scene"), cols = scenes.map(s => s.dataset.bg.match(/\w\w/g).map(h => parseInt(h, 16)));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const I1 = scenes.indexOf($("#s1")), S1_DARK = cols[I1].slice(), S1_LIGHT = [244, 244, 241];
  const sky = $("#sky"), theme = $('meta[name="theme-color"]');
  let lastSky = "";
  const paintSky = () => {
    const mid = vh / 2; let col = cols[0];
    for (let i = 0; i < scenes.length; i++) {
      const r = scenes[i].getBoundingClientRect();
      if (r.top > mid || r.bottom <= mid) { if (i === scenes.length - 1 && r.bottom <= mid) col = cols[i]; continue; }
      const B = Math.min(vh * .45, r.height / 2);
      col = cols[i];
      if (i < scenes.length - 1 && r.bottom - mid < B) col = mix(cols[i], cols[i + 1], (B - (r.bottom - mid)) / (2 * B));
      else if (i > 0 && mid - r.top < B) col = mix(cols[i - 1], cols[i], .5 + (mid - r.top) / (2 * B));
      break;
    }
    const css = `rgb(${col.join(",")})`;
    if (css === lastSky) return; lastSky = css;
    sky.style.background = css; theme.content = css; document.documentElement.style.setProperty("--sky", css);
    document.body.classList.toggle("ink-light", (col[0] * 299 + col[1] * 587 + col[2] * 114) / 1000 < 128);
  };

  /* 시계: 스크롤 위치 → 오후 3:00 ~ 6:00 */
  const s0 = $("#s0"), s1 = $("#s1"), s2 = $("#s2"), s3b = $("#s3b"), s4 = $("#s4");
  let keys = [];
  const SIX_AT = .2;                 // 장면 4 에서 시계가 6:00 에 닿는 지점
  const layout = () => {
    vh = innerHeight; vw = innerWidth;
    const top = el => el.getBoundingClientRect().top + scrollY, bot = el => top(el) + el.offsetHeight;
    keys = [[top(s0), 900], [bot(s1) - vh, 960], [bot(s2) - vh, 1020], [bot(s3b) - vh, 1070], [top(s4) + SIX_AT * (s4.offsetHeight - vh), 1080]];
    buildLights();
    fitSeq(seqPropose); fitSeq(seqDoor); layoutRoom();
  };
  const timeAt = y => {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (y <= keys[i][0]) { const [y0, t0] = keys[i - 1], [y1, t1] = keys[i]; return t0 + (t1 - t0) * (y - y0) / Math.max(1, y1 - y0); }
    return 1080;
  };
  const fmt = t => { const m = Math.floor(t + 1e-6); return `${((Math.floor(m / 60) + 11) % 12) + 1}:${pad(m % 60)}`; };

  const el = id => document.getElementById(id);
  const heroPhoto = el("heroPhoto"), heroText = el("heroText"), hint = el("scrollHint");
  const s1Line = el("s1Line"), tvNote = el("tvNote");

  /* ---------- 장면 1 · 한 편의 홈비디오 ----------
   * 거실 컷(꺼진 TV 한 장 + 켜진 뒤 24프레임 반복)은 Higgsfield 로 만든 사람 없는 영상이고,
   * 브라운관 화면(.crt) 안에는 실제 사진·영상을 그대로 그립니다: 1997 신부 → 채널 전환 → 2003 신랑 줄넘기 → 빨리 감기 → 2027.1.23 */
  const room = el("room"), roomOn = el("roomOn"), roomCtx = roomOn.getContext("2d"), crt = el("crt"), tvCv = el("tvCv"), tctx = tvCv.getContext("2d"), jumpCv = el("jump");
  const noteA = el("noteA"), noteC = el("noteC"), noteD = el("noteD"), s1Bloom = el("s1Bloom"), s1White = el("s1White");
  const TVW = 800, TVH = 634, SCR = { cx: .5042, cy: .3984, w: .5894 };   // 거실 그림 안에서 화면의 가운데 위치와 너비(비율)
  let roomZ = 1.3;
  const layoutRoom = () => {
    const pin = room.parentElement, pw = pin.clientWidth, ph = pin.clientHeight;
    const target = Math.min(pw * .92, 500);                                // 다 다가갔을 때의 화면 너비
    const w = Math.max(ph * 716 / 1280, target / (SCR.w * 1.3)), h = w * 1280 / 716;
    roomZ = target / (SCR.w * w);
    room.style.width = w + "px"; room.style.height = h + "px";
    room.style.left = (pw / 2 - SCR.cx * w) + "px"; room.style.top = (ph * .47 - SCR.cy * h) + "px";
    room.style.transformOrigin = `${SCR.cx * 100}% ${SCR.cy * 100}%`;
  };
  const okImg = i => i && i.complete && i.naturalWidth;
  const loadImg = src => { const i = new Image(); i.decoding = "async"; i.onload = () => { if (RM) req(); }; i.src = src; return i; };
  const noiseTiles = () => Array.from({ length: 4 }, () => {
    const c = document.createElement("canvas"); c.width = 200; c.height = 160;
    const x = c.getContext("2d"), d = x.createImageData(200, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = 40 + Math.random() * 200; d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v + 8; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return c;
  });
  let hv = null;
  const loadHV = () => hv || (hv = { a: loadImg("media/bride-1997.webp"), b: loadImg("media/bride-photo.webp"),
    on: Array.from({ length: 24 }, (_, i) => loadImg(`media/room/${String(i).padStart(2, "0")}.webp`)), tiles: noiseTiles() });
  const coverImg = (img, z, a = 1) => {
    if (!okImg(img) || a <= 0) return;
    const k = Math.max(TVW / img.naturalWidth, TVH / img.naturalHeight) * z, w = img.naturalWidth * k, h = img.naturalHeight * k;
    tctx.globalAlpha = a; tctx.drawImage(img, (TVW - w) / 2, (TVH - h) / 2, w, h); tctx.globalAlpha = 1;
  };
  const snow = a => {
    if (a <= 0) return;
    const t = hv.tiles[RM ? 0 : (Math.random() * hv.tiles.length) | 0], r = RM ? .5 : Math.random(), q = RM ? .5 : Math.random();
    tctx.globalAlpha = Math.min(1, a); tctx.imageSmoothingEnabled = false;
    tctx.drawImage(t, -r * 60, -q * 60, TVW + 120, TVH + 120);
    tctx.imageSmoothingEnabled = true; tctx.globalAlpha = 1;
  };
  const osd = (txt, x, y, align = "right", size = 40) => {
    tctx.font = `700 ${size}px "Courier New",ui-monospace,Menlo,Consolas,monospace`; tctx.textAlign = align; tctx.textBaseline = "alphabetic";
    tctx.lineJoin = "round"; tctx.lineWidth = 7; tctx.strokeStyle = "rgba(24,24,24,.7)"; tctx.strokeText(txt, x, y);
    tctx.fillStyle = "#f4f4ee"; tctx.fillText(txt, x, y);
  };
  // 화면 그리기. p = 장면 1 진행률
  const drawTV = (p, now) => {
    const c = tctx; c.clearRect(0, 0, TVW, TVH);
    if (!hv || p < .07) { crt.classList.remove("on"); return; }            // 꺼진 화면: 거실 그림의 검은 유리가 그대로 보입니다
    crt.classList.add("on");
    if (p < .16) {                                                         // 켜지는 중: 가로줄 → 위아래로 벌어짐 → 지직거림
      c.fillStyle = "#0a0a0b"; c.fillRect(0, 0, TVW, TVH);
      const b = ease(seg(p, .10, .125));
      if (b > 0) { const h = Math.max(4, TVH * b); c.save(); c.beginPath(); c.rect(0, (TVH - h) / 2, TVW, h); c.clip(); snow(1); c.restore(); }
      else { const w = TVW * ease(seg(p, .07, .10)); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect((TVW - w) / 2, TVH / 2 - 6, w, 12); c.fillStyle = "#fff"; c.fillRect((TVW - w) / 2, TVH / 2 - 2, w, 4); }
      return;
    }
    if (p < .47) {                                                         // 1997 · 신부
      const z = 1 + .05 * seg(p, .16, .47), x = seg(p, .33, .36);
      c.fillStyle = "#0a0a0b"; c.fillRect(0, 0, TVW, TVH);
      if (x < 1) coverImg(hv.a, z);
      coverImg(hv.b, z, x);
      snow(Math.max(.05, 1 - seg(p, .16, .19), x > 0 && x < 1 ? .45 * (1 - Math.abs(x * 2 - 1)) : 0));
      osd("\u25B6 PLAY", 46, 70, "left", 32);
      return;
    }
    if (p < .52) {                                                         // 채널 전환
      c.fillStyle = "#0a0a0b"; c.fillRect(0, 0, TVW, TVH); snow(1);
      const y = RM ? TVH * .4 : (now * .5) % (TVH + 140) - 140; c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(0, y, TVW, 110);
      return;
    }
    if (p < .80) {                                                         // 2003 · 신랑 (줄넘기 프레임은 아래 캔버스 #jump 에)
      snow(.05 + .6 * (1 - seg(p, .52, .535)));
      osd("\u25B6 PLAY", 46, 70, "left", 32); osd("2003", TVW - 46, TVH - 46);
      return;
    }
    const ff = seg(p, .80, .89);                                           // 빨리 감기 → 결혼식 날
    snow(.07);
    if (ff < 1) {
      if (!RM) for (let i = 0; i < 3; i++) { const y = (now * .7 + i * TVH / 3) % TVH; c.save(); c.beginPath(); c.rect(0, y, TVW, 16 + i * 6); c.clip(); snow(.55); c.restore(); }
      osd("\u25B6\u25B6", 46, 70, "left", 34); osd(String(2003 + Math.min(23, Math.floor(ff * 24))), TVW - 46, TVH - 46);
    } else { osd("1.23.2027", TVW - 46, TVH - 94); osd("PM 6:00:00", TVW - 46, TVH - 46); }
    const w = seg(p, .905, .95); if (w > 0) { c.fillStyle = `rgba(244,244,241,${w.toFixed(3)})`; c.fillRect(0, 0, TVW, TVH); }
  };
  // 화면의 지직거림과 거실에 번지는 TV 빛은 스크롤이 멈춰 있어도 살아 있게 (장면이 보일 때만)
  let hvP = 0, hvRun = false, hvLast = 0, onK = 0, onDir = 1, onLast = 0;
  const hvTick = now => {
    if (!near(s1, .2) || document.hidden) { hvRun = false; return; }
    if (now - hvLast > 60) { hvLast = now; drawTV(hvP, now); }
    if (hv && hvP > .08 && now - onLast > 85) {
      onLast = now; const im = hv.on[onK];
      if (okImg(im)) roomCtx.drawImage(im, 0, 0, 537, 960);
      onK += onDir; if (onK >= 23 || onK <= 0) onDir = -onDir;
    }
    requestAnimationFrame(hvTick);
  };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) req(); });
  const imgPropose = $("#shotPropose img"), shotDoor = el("shotDoor"), imgDoor = $("#shotDoor img"), s2Line = el("s2Line"), s2Names = el("s2Names"), s2Wash = el("s2Wash");
  if (seqDoor) s2.classList.add("lit");
  const garden = el("garden"), gBg = $(".g-bg"), gGroom = $(".g-groom"), gVeil = $(".g-veil");
  const night = el("nightPhoto"), six = el("six"), sixT = $(".six-t"), sixTb = el("sixT"), sixD = el("sixD"), sixK = el("sixK");
  const clock = el("clock"), clockT = el("clockT"), lights = el("lights"), endPhoto = el("endPhoto"), endImg = $("#endPhoto img");
  const T = (e, y = 0, s = 1) => e.style.transform = `translate3d(0,${y},0) scale(${s})`;

  const update = () => {
    ticking = false;
    cols[I1] = mix(S1_DARK, S1_LIGHT, seg(pinP(s1, .66), .955, .99));        // 장면 1 은 끝에서 화면 빛과 함께 밝아집니다
    paintSky();
    const t = RM ? 1080 : timeAt(scrollY), time = fmt(t);
    if (clockT.textContent !== time) clockT.textContent = time;

    // 장면 0
    if (near(s0, .2)) {
      const p = pinP(s0, 0);
      T(heroPhoto, `${(-p * 2).toFixed(2)}%`, 1 + p * .08);   // 내릴수록 사진이 살짝 다가옴
      T(heroText, `${(-p * 150).toFixed(1)}px`); heroText.style.opacity = 1 - seg(p, .35, .95);
      hint.style.opacity = 1 - seg(p, 0, .15);
    }
    // 장면 1 · 한 편의 홈비디오
    if (near(s1, 1.5)) { jump.load(); loadHV(); }
    if (near(s1, .2)) {
      const p = pinP(s1, .66); hvP = p;
      room.style.opacity = seg(p, 0, .05) * (1 - seg(p, .975, 1));
      room.style.transform = `scale(${(1 + (roomZ - 1) * ease(seg(p, .05, .2))).toFixed(4)})`;
      roomOn.style.opacity = seg(p, .09, .15);
      s1Line.style.opacity = seg(p, .015, .06); T(s1Line, `${(18 * (1 - ease(seg(p, .015, .07)))).toFixed(1)}px`);
      noteA.style.opacity = seg(p, .19, .22) * (1 - seg(p, .44, .47));
      tvNote.style.opacity = seg(p, .55, .59) * (1 - seg(p, .77, .80));
      noteC.style.opacity = seg(p, .81, .84) * (1 - seg(p, .875, .89));
      noteD.style.opacity = seg(p, .895, .915) * (1 - seg(p, .94, .955));
      jumpCv.style.opacity = p >= .5 && p < .96 ? 1 : 0;
      jump.draw(seg(p, .52, .80));
      const bl = seg(p, .92, .975);                                        // 화면의 빛이 번져 다음 장면의 바탕색이 됩니다
      s1Bloom.style.opacity = seg(p, .92, .94); s1Bloom.style.transform = `scale(${(.1 + 1.5 * bl * bl).toFixed(3)})`;
      const wh = seg(p, .95, .985); s1White.style.opacity = wh;
      s1.dataset.ink = wh > .5 ? "dark" : "light";
      if (RM) { drawTV(p, 0); if (hv && okImg(hv.on[0])) roomCtx.drawImage(hv.on[0], 0, 0, 537, 960); }
      else if (!hvRun) { hvRun = true; requestAnimationFrame(hvTick); }
    }
    // 장면 2 · 프러포즈 → 문밖 정원
    if (near(s2, 1) ) { seqPropose && seqPropose.load(); seqDoor && seqDoor.load(); }
    if (near(s2, .2)) {
      const p = pinP(s2, .3);
      if (seqPropose) seqPropose.draw(seg(p, 0, .56)); else imgPropose.style.transform = `scale(${(1 + .95 * ease(seg(p, 0, .56))).toFixed(4)})`;
      s2Line.style.opacity = seg(p, .12, .22) * (1 - seg(p, .44, .52));
      shotDoor.style.opacity = ease(seg(p, .5, .64));
      if (seqDoor) seqDoor.draw(seg(p, .5, .96)); else imgDoor.style.transform = `scale(${(1 + .5 * seg(p, .5, 1)).toFixed(4)})`;
      // 문 프레임의 끝은 빛으로 하얗게 바뀝니다. 마지막에 바탕색 막을 덮고, 이름은 밝아진 화면 위에 먹색으로 나타납니다
      s2Wash.style.opacity = seqDoor ? seg(p, .92, .96) : 0;
      s2Names.style.opacity = seqDoor ? seg(p, .9, .96) : seg(p, .7, .78) * (1 - seg(p, .94, 1));
    }
    // 장면 3 · 정원 사진 세 겹
    if (!RM && near(garden, .2)) {
      const k = viewP(garden) - .5;
      T(gBg, `${(k * 70).toFixed(1)}px`, 1.04); T(gGroom, `${(k * -40).toFixed(1)}px`, 1.04); T(gVeil, `${(k * -330).toFixed(1)}px`, 1.3);
    }
    // 장면 4 · 저녁 6시
    const r4 = s4.getBoundingClientRect(), reached = RM ? r4.top < vh * .6 : r4.top < vh * .25, past = r4.bottom < vh;
    lights.classList.toggle("on", reached);
    if (near(s4, .2) || past) {
      const p = past ? 1 : pinP(s4, 1);
      clock.classList.toggle("off", p > .03 || past);
      sixT.style.opacity = seg(p, .03, .1); sixTb.textContent = time; sixT.classList.toggle("hit", p >= SIX_AT);
      setLit(1, seg(p, SIX_AT, .44)); setLit(0, seg(p, SIX_AT + .05, .5));
      sixD.style.opacity = seg(p, .4, .48); sixK.style.opacity = seg(p, .46, .54);
      const up = ease(seg(p, .52, .84));
      six.style.transform = `translate3d(0,${(-5 * up * vh / 100).toFixed(1)}px,0) scale(${1 - .34 * up})`;
      night.style.opacity = seg(p, .52, .62); night.style.transform = `translate(-50%,${(70 * (1 - up)).toFixed(2)}%)`;
    } else { clock.classList.remove("off"); setLit(0, 0); setLit(1, 0); }
    // 마지막 사진
    if (!RM && near(endPhoto, .2)) T(endImg, `${((viewP(endPhoto) - .5) * 90).toFixed(1)}px`);
    // 첫 화면 안에서 내리기 시작하면 바로 (바로가기로 다른 곳에 갔을 때는 띄우지 않음)
    // 참석 의사 창: 첫 화면이 화면 밖으로 거의 다 넘어갔을 때(장면 1 시작 12% 화면 앞) ~ 장면 1 앞부분 사이에서 한 번
    if (!introShown && Date.now() - navJump > 2500) {
      const top1 = s1.getBoundingClientRect().top + scrollY;
      if (scrollY >= top1 - .12 * innerHeight && scrollY < top1 + .5 * (s1.offsetHeight - innerHeight)) showRsvpIntro();
    }
  };
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, { passive: true });
  let rw = innerWidth;
  addEventListener("resize", () => { if (innerWidth === rw && Math.abs(innerHeight - vh) < 140) { vh = innerHeight; fitSeq(seqPropose); fitSeq(seqDoor); return req(); } rw = innerWidth; layout(); req(); });
  addEventListener("load", () => { layout(); req(); gUpdate(); });
  layout(); update(); gUpdate();
})();
