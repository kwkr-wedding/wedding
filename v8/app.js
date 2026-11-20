(() => {
  const C = window.WEDDING;
  // V8 은 V4 설정(config.js 의 v4)을 그대로 쓰고, v8 에 적은 항목만 덮어씁니다. 사진·영상은 ../v4/assets/, 장면 1 전용 파일은 media/ 에 있습니다
  const V = Object.assign({
    rsvpPopup: false,
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "11.webp", "12.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],
    videos: {},      // { hero, night } : v4/assets/ 안의 mp4 파일명. 있으면 사진 위에 영상을 겹칩니다
    sequences: {},   // { propose: { dir, count }, door: { dir, count } } : 스크롤로 넘기는 프레임 묶음
  }, C.v4 || {}, C.v8 || {});
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
  // 날짜·시간이 있는 곳에는 장소도 함께 적습니다
  const venueKo = `${C.venue.name} ${C.venue.hall}`, venueEnFull = `${C.venue.nameEn} · ${C.venue.hallEn}`;
  $("#heroDate").innerHTML = `${esc(`${ymd} · ${DOW_EN}, ${hourEn}`)}<span class="hero-venue">${esc(venueEnFull)}</span>`;
  $("#greeting").innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  $("#parG").textContent = `${C.groom.father.name} · ${C.groom.mother.name}의`;
  $("#parB").textContent = `${C.bride.father.name} · ${C.bride.mother.name}의`;
  $("#relG").textContent = C.groom.relation; $("#relB").textContent = C.bride.relation;
  $("#sixD").textContent = `${ymd} · ${DOW_EN}`;
  $("#sixK").innerHTML = `${esc(whenKo)}<span class="six-v">${esc(venueKo)}</span>`;
  $("#footDate").textContent = `${Y} . ${pad(M)} . ${pad(DD)}`;

  /* ---------- 달력 · 남은 날 ---------- */
  $("#calTitle").textContent = `${Y}.${pad(M)}.${pad(DD)}`;
  $("#calSub").innerHTML = `${esc(`${DOW_KO}요일 ${hourKo}`)}<br>${esc(venueKo)}`;
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
  const shareUrl = (C.siteUrl ? C.siteUrl + "v8/" : location.href.split(/[?#]/)[0]) + (BRIDE ? "?side=bride" : "");
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
        const k = Math.min(1, Math.max(0, (now - t0) / ms)), e = 1 - Math.pow(1 - k, 3);   // 감속
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
    smoothStop();
    const y0 = scrollY, t0 = performance.now(); let stop = false;
    const halt = () => { stop = true; };
    ["touchstart", "wheel", "keydown"].forEach(t => addEventListener(t, halt, { once: true, passive: true }));
    const step = now => {
      if (stop) return;
      const k = Math.min(1, Math.max(0, (now - t0) / ms)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, Math.round(y0 + (y - y0) * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  /* ---------- 부드러운 스크롤 + 장면 단위 넘김 ----------
   * 손가락으로 끄는 동안에는 손을 바짝 따라옵니다(천천히 끌면 원하는 만큼 세밀하게 볼 수 있습니다).
   * 손을 뗄 때의 손짓에 따라 세 가지로 움직입니다.
   *  · 천천히 끌다 놓음(또는 0.45px/ms 미만, 또는 0.45초 넘게 끈 손짓): 그 자리 근처에서 살짝 미끄러지고 멈춥니다(최대 화면 0.9개).
   *  · 짧게 '휙'(0.45초 안에 떼고 0.45~2px/ms): 그 방향의 다음 '멈춤 지점'(장면·페이지가 완성된 화면, 화면 1.3개 안)까지 스프링처럼 부드럽게 이어 갑니다.
   *  · 세게(2px/ms 이상): 멈춤 지점 없이 손의 빠르기만큼(최대 화면 5개) 미끄러졌다가 천천히 멈춥니다.
   * 스크롤을 옮긴 프레임에서 바로 화면 효과(update)도 그려 한 프레임 어긋나 떨리는 일이 없게 하고, 다른 곳이 스크롤을 옮기면 맞서지 않고 따라갑니다.
   * 휠은 굴린 만큼 부드럽게 따라갑니다. 동작 줄이기, 참석 의사 창·크게 보기가 열려 있을 때, 화면 확대 중, 가로 갤러리에서는 쓰지 않습니다. */
  let smoothRaf = 0;
  function smoothStop() { if (smoothRaf) cancelAnimationFrame(smoothRaf); smoothRaf = 0; }
  // 멈춤 지점: 고정 장면은 각 장면이 완성되는 진행도, 일반 섹션은 맨 위와 화면 0.85개 간격
  const PIN_STOPS = {
    s0: () => [0],
    s1: () => [0, .13, .265, ...[0, 1, 2, 3, 4, 5].map(i => stAt(i) + .09)],
    s2: () => [0, .5, 1],
    s4: () => [0, .12, .54, .86, 1]
  };
  const snapStops = () => {
    const H = innerHeight, out = [0], maxY = document.documentElement.scrollHeight - H;
    document.querySelectorAll("section.scene").forEach(sec => {
      const top = sec.getBoundingClientRect().top + scrollY, h = sec.offsetHeight, d = h - H;
      const f = PIN_STOPS[sec.id];
      if (f && d > 0) f().forEach(p => out.push(top + p * d));
      else {
        out.push(top);
        for (let y = top + .85 * H; y < top + d - .2 * H; y += .85 * H) out.push(y);
        if (d > 0) out.push(top + d);
      }
    });
    out.push(maxY);
    return out.map(y => clamp(Math.round(y), 0, maxY)).sort((a, b) => a - b)
      .filter((y, i, a) => i === 0 || y - a[i - 1] > .12 * H);
  };
  if (!RM) {
    const root = document.documentElement, vvp = window.visualViewport;
    const WHEEL = .55, TAU_DRAG = .07, TAU_FREE = .42, TAU_FLING = .6;
    const SNAP = .45, FAST = 2, SPRING = 7;        // px/ms, px/ms, rad/s
    let target = scrollY, cur = scrollY, vel = 0, last = 0, tau = TAU_FREE, dragging = false, spring = false, setY = null, gT0 = 0;
    const maxY = () => root.scrollHeight - innerHeight;
    const blocked = () => holdY != null || root.classList.contains("hold") || document.body.classList.contains("locked") || (vvp && vvp.scale > 1.01);
    const run = now => {
      if (blocked()) { smoothRaf = 0; spring = false; return; }
      // 첫 프레임의 rAF 시각은 손짓보다 앞설 수 있어 시간 차가 음수가 됩니다 → 그대로 쓰면 한 프레임 뒤로 물러났다 나가며 떨림. 첫 프레임은 1/60초로
      const dt = last && now > last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
      if (setY != null && Math.abs(scrollY - setY) > 1.5) { const d = scrollY - setY; cur += d; target += d; }   // 다른 곳이 스크롤을 옮겼으면 맞서지 않고 그만큼 따라감
      target = clamp(target, 0, maxY());
      if (spring) {
        // 임계 감쇠 스프링: 손을 뗀 순간의 빠르기에서 이어받아, 넘치지 않고 멈춤 지점에 사뿐히 섭니다
        const before = target - cur;
        vel += (SPRING * SPRING * before - 2 * SPRING * vel) * dt;
        cur += vel * dt;
        if ((target - cur) * before <= 0 || (Math.abs(target - cur) < .5 && Math.abs(vel) < 20)) { cur = target; vel = 0; spring = false; }
      } else {
        cur += (target - cur) * (1 - Math.exp(-dt / tau));
        if (Math.abs(target - cur) < .35) cur = target;
      }
      window.scrollTo(0, cur); setY = scrollY;
      if (Math.abs(setY - updY) > .01) update();   // 스크롤과 그 위치의 화면 효과를 같은 프레임에 그립니다(한 프레임 늦으면 떨려 보임)
      smoothRaf = cur !== target || dragging ? requestAnimationFrame(run) : 0;
    };
    const kick = () => { if (!smoothRaf) { last = 0; setY = scrollY; smoothRaf = requestAnimationFrame(run); } };
    const fresh = () => { if (!smoothRaf) target = cur = scrollY; };
    addEventListener("wheel", e => {
      if (e.ctrlKey || e.defaultPrevented || blocked() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault(); fresh();
      const d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
      spring = false; tau = TAU_FREE; target = clamp(target + d * WHEEL, 0, maxY()); kick();
    }, { passive: false });
    let ty = null, tx = 0, mode = null, samples = [];
    addEventListener("touchstart", e => {
      if (e.touches.length !== 1 || blocked()) { ty = null; return; }
      const t = e.touches[0]; ty = t.clientY; tx = t.clientX; mode = null; samples = [[performance.now(), ty]]; gT0 = performance.now();
      if (smoothRaf) target = cur; else fresh();   // 미끄러지는 중에 닿으면 그 자리에 멈춥니다
      spring = false; vel = 0;
    }, { passive: true });
    addEventListener("touchmove", e => {
      if (ty == null || e.touches.length !== 1 || blocked()) { ty = null; return; }
      const t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      if (!mode) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; mode = Math.abs(dy) >= Math.abs(dx) ? "y" : "x"; }
      if (mode !== "y") return;
      e.preventDefault();
      dragging = true; tau = TAU_DRAG;
      target = clamp(target - dy, 0, maxY()); ty = t.clientY; tx = t.clientX;
      samples.push([performance.now(), ty]); if (samples.length > 5) samples.shift();
      kick();
    }, { passive: false });
    const release = () => {
      if (mode === "y" && dragging) {
        const [t0, y0] = samples[0], [t1, y1] = samples[samples.length - 1], now = performance.now();
        const v = now - t1 < 140 ? -(y1 - y0) / Math.max(16, t1 - t0) : 0;   // 화면이 내려가는 방향 +, px/ms
        const sp = Math.abs(v), H = innerHeight;
        // 장면 단위로 넘기는 건 '휙' 튕긴 손짓(짧게 닿았다 떼고, 어느 정도 빠름)일 때만. 천천히 끌다 놓으면 그 자리 근처에서 멈춥니다
        const flick = now - gT0 < 450 && sp >= SNAP;
        let snapped = false;
        if (sp >= FAST) {
          tau = TAU_FLING; target = clamp(target + clamp(v * TAU_FLING * 1000, -5 * H, 5 * H), 0, maxY());
          snapped = true;
        } else if (flick) {
          const dir = Math.sign(v), from = target, eps = .04 * H, stops = snapStops();
          const next = dir > 0 ? stops.find(y => y > from + eps) : [...stops].reverse().find(y => y < from - eps);
          if (next != null && Math.abs(next - from) < 1.3 * H) { target = next; spring = true; vel = v * 1000; snapped = true; }
        }
        if (!snapped) { tau = TAU_FREE; target = clamp(target + clamp(v * 300, -.9 * H, .9 * H), 0, maxY()); }
      }
      dragging = false; ty = null; mode = null; kick();
    };
    addEventListener("touchend", release, { passive: true });
    addEventListener("touchcancel", release, { passive: true });
  }
  let cueT = 0;
  const afterIntro = () => {
    const cue = $("#cue");
    $("#cueThanks").hidden = !thanked;
    cue.classList.add("show");
    clearTimeout(cueT); cueT = setTimeout(() => cue.classList.remove("show"), 3200);
    // "어릴 적 인연이" 글이 다 떠오른 지점까지
    const s1 = el("s1"), top = s1.getBoundingClientRect().top + scrollY;
    const target = Math.round(top + .026 * (s1.offsetHeight - innerHeight));
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
    smoothStop(); $(a.getAttribute("href")).scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
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
  // 애니메이션 장면의 프레임 넘김: 시작과 끝은 느리게(보통의 약 0.4배), 가운데는 조금 빠르게. 전체 길이는 그대로
  const SLOW_K = .6, slowEnds = t => t - SLOW_K * Math.sin(2 * Math.PI * t) / (2 * Math.PI);
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
    const dt = Math.min(64, glideT && now > glideT ? now - glideT : 16); glideT = now;
    const k = 1 - Math.exp(-dt / 70);
    gliding.forEach(s => {
      const d = s.target - s.cur;
      if (Math.abs(d) < .02) { s.cur = s.target; gliding.delete(s); } else s.cur += d * k;
      s.paint();
    });
    glideId = gliding.size ? requestAnimationFrame(glide) : 0;
    if (!glideId) glideT = 0;
  };
  /* 프레임 그림은 압축된 파일(Blob)로 받아 두고, 지금 보는 위치 앞뒤의 몇 장만 미리 백그라운드에서 풀어(createImageBitmap) 둡니다.
   * 그리는 순간에 그림을 푸느라 화면이 멈칫하지 않게 하고, 풀어 둔 그림의 메모리는 전체 약 160MB 안에서 가장 먼 것부터 비웁니다.
   * 아직 풀리지 않은 프레임 자리에는 가장 가까이 풀린 프레임을 그립니다. 이 기능이 없는 브라우저는 예전 방식(Image)으로 그립니다. */
  const BITMAP = "createImageBitmap" in window && "fetch" in window;
  const BM_LIMIT = 160e6, allSeqs = [];
  let bmBytes = 0, paintQ = new Set(), paintId = 0;
  const flushPaint = () => { paintId = 0; const q = paintQ; paintQ = new Set(); q.forEach(s => { s.last = ""; s.paint(); }); };
  const queuePaint = s => { paintQ.add(s); if (!paintId) paintId = requestAnimationFrame(flushPaint); };
  const evict = () => {
    const now = performance.now();
    while (bmBytes > BM_LIMIT) {
      let vs = null, vi = -1, vd = -1;
      allSeqs.forEach(s => s.bms.forEach((bm, i) => {
        if (!bm) return;
        const d = Math.abs(i - s.target) + (now - s.used > 1500 ? 1e4 : 0);   // 한동안 안 그린 장면 먼저, 그다음 지금 위치에서 먼 프레임
        if (d > vd) { vd = d; vs = s; vi = i; }
      }));
      if (!vs) break;
      vs.drop(vi);
    }
  };
  class Seq {
    constructor(canvas, url, count, cover) {
      Object.assign(this, { canvas, url, count, cover, imgs: [], blobs: [], bms: [], busy: new Set(), last: "", cur: -1, target: 0, used: 0, started: false });
      this.ctx = canvas.getContext("2d"); allSeqs.push(this);
    }
    load() {
      if (this.started) return; this.started = true;
      const order = [], seen = new Set(), add = i => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
      for (const step of [8, 4, 2, 1]) { for (let i = 0; i < this.count; i += step) add(i); add(this.count - 1); }
      order.forEach(i => {
        if (BITMAP) {
          fetch(this.url(i)).then(r => r.ok ? r.blob() : null).then(bl => { if (bl) { this.blobs[i] = bl; this.pump(); } }).catch(() => {});
        } else {
          const im = new Image(); im.decoding = "async";
          im.onload = () => { im.ok = true; if (Math.abs(i - this.cur) < 3 || this.last === "") queuePaint(this); };
          im.src = this.url(i); this.imgs[i] = im;
        }
      });
    }
    // 지금 향하는 위치에서 가까운 프레임부터 두 장씩 풀기
    pump() {
      if (!BITMAP) return;
      const c = Math.round(Math.max(0, this.target)), R = 6;
      for (let k = 0; k <= this.count && this.busy.size < 2; k++) {
        for (const i of k ? [c + k, c - k] : [c]) {
          if (i < 0 || i >= this.count || this.busy.size >= 2) continue;
          if (k > R && this.bms.some(Boolean)) return;   // 가까운 범위만 미리 풀어 둡니다 (처음 한 장은 멀어도 풉니다)
          if (!this.blobs[i] || this.bms[i] || this.busy.has(i)) continue;
          this.busy.add(i);
          createImageBitmap(this.blobs[i]).then(bm => {
            this.busy.delete(i);
            if (this.bms[i]) { bm.close(); return this.pump(); }
            this.bms[i] = bm; bmBytes += bm.width * bm.height * 4; evict();
            if (this.bms[i] && (Math.abs(i - this.cur) < 3 || !this.last)) queuePaint(this);
            this.pump();
          }).catch(() => { this.busy.delete(i); });
        }
      }
    }
    drop(i) { const bm = this.bms[i]; if (!bm) return; bmBytes -= bm.width * bm.height * 4; bm.close(); this.bms[i] = null; }
    frame(i) { return BITMAP ? this.bms[i] : (this.imgs[i] && this.imgs[i].ok ? this.imgs[i] : null); }
    draw(p) {
      this.target = clamp(p) * (this.count - 1); this.pump();
      if (this.cur < 0 || RM || Math.abs(this.target - this.cur) < .02) { this.cur = this.target; gliding.delete(this); return this.paint(); }
      gliding.add(this);
      if (!glideId) glideId = requestAnimationFrame(glide);
    }
    put(im, alpha) {
      const c = this.canvas, x = this.ctx, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      x.globalAlpha = alpha;
      if (!this.cover) return x.drawImage(im, 0, 0, c.width, c.height);
      const k = Math.max(c.width / iw, c.height / ih), w = iw * k, h = ih * k;
      x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
    }
    paint() {
      const ok = i => !!this.frame(i), w = Math.max(0, this.cur);
      // 지금 위치 앞뒤로 준비된 프레임을 찾아 그 사이를 겹쳐 그립니다
      let lo = Math.floor(w), hi = Math.ceil(w);
      while (lo > 0 && !ok(lo)) lo--;
      while (hi < this.count - 1 && !ok(hi)) hi++;
      if (!ok(lo)) { if (!ok(hi)) return; lo = hi; }
      if (!ok(hi)) hi = lo;
      // 한쪽이 너무 멀면(아직 안 풀림) 가까운 쪽 한 장만 그립니다
      if (hi - lo > 4) { if (w - lo <= hi - w) hi = lo; else lo = hi; }
      let t = hi > lo ? Math.round((w - lo) / (hi - lo) * 32) / 32 : 0;
      if (t >= 1) { lo = hi; t = 0; }
      const key = t > 0 ? `${lo}+${hi}+${t}` : `${lo}`;
      this.used = performance.now();
      if (key === this.last) return;
      this.last = key;
      this.put(this.frame(lo), 1);
      if (t > 0) this.put(this.frame(hi), t);
      this.ctx.globalAlpha = 1;
    }
  }
  const jump = new Seq($("#jump"), i => `../v4/assets/jump/${String(i).padStart(3, "0")}.webp`, 81, false);
  // 두 사람의 이야기: 애니메이션 여섯 장면 (장면마다 프레임 STORY_N 장)
  const STORY_N = 37;
  const brideCam = new Seq($("#brideCam"), i => `media/bride/${String(i).padStart(3, "0")}.webp`, 81, false);   // 1997 캠코더 영상 4.5초
  const story = [1, 2, 3, 4, 5, 6].map(k => new Seq($(`#st${k} canvas`), i => `media/st${k}/${String(i).padStart(3, "0")}.webp`, STORY_N, false));
  const coverSeq = (boxSel, conf) => {
    if (!conf || !conf.count || RM) return null;
    const cv = document.createElement("canvas");
    $(boxSel).appendChild(cv);
    return new Seq(cv, i => `${conf.base || "../v4/assets/"}${conf.dir}/${String(i).padStart(3, "0")}.webp${conf.v ? "?v=" + conf.v : ""}`, conf.count, true);
  };
  // 프러포즈 영상은 V8 전용: V4 와 같은 영상(Kling std 720p)을 Topaz 로 4K 업스케일한 1080×1920 프레임
  const seqPropose = coverSeq("#shotPropose", { base: "media/", dir: "seq-propose", count: 121, v: 2 }), seqDoor = coverSeq("#shotDoor", V.sequences.door);
  // 캔버스 크기는 화면 전체가 아니라 장면 칸에 맞춥니다 (큰 화면에서는 칸이 가운데 휴대폰 너비로 좁아집니다)
  const fitSeq = s => {
    if (!s) return;
    const r = s.canvas.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const k = Math.min(3, devicePixelRatio || 1, 1080 / r.width), w = Math.round(r.width * k), h = Math.round(r.height * k);
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
    fitSeq(seqPropose); fitSeq(seqDoor);
  };
  const timeAt = y => {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (y <= keys[i][0]) { const [y0, t0] = keys[i - 1], [y1, t1] = keys[i]; return t0 + (t1 - t0) * (y - y0) / Math.max(1, y1 - y0); }
    return 1080;
  };
  const fmt = t => { const m = Math.floor(t + 1e-6); return `${((Math.floor(m / 60) + 11) % 12) + 1}:${pad(m % 60)}`; };

  const el = id => document.getElementById(id);
  const heroPhoto = el("heroPhoto"), heroText = el("heroText"), hint = el("scrollHint");
  const s1Line = el("s1Line"), tvNote = el("tvNote"), noteB = el("noteB");
  const prA = el("prA"), prB = el("prB"), prB2 = el("prB2");
  const capA = $("#prA figcaption"), capB = $("#prB figcaption");
  const stFig = story.map((_, i) => el(`st${i + 1}`)), stCap = stFig.map(f => f.querySelector("figcaption")), stNote = story.map((_, i) => el(`sn${i + 1}`));
  const ST0 = .285, STEP = .1, stAt = i => ST0 + i * STEP;
  const st7 = el("st7"), bridge = el("bridge"), st7img = $("#st7 img"), bridgeImgs = [...document.querySelectorAll("#bridge img")], bridgeReal = $("#bridge .real");   // 이야기 장면 i 가 놓이기 시작하는 지점
  const stRot = [-1, 1.6, -2, 1.2, -1.5, .6];
  // 사진 한 장이 살짝 기운 채 위에서 내려앉습니다. t = 0~1, rot = 놓인 뒤의 기울기
  const dropIn = (fig, t, rot, from) => {
    const e = ease(t);
    fig.style.opacity = seg(t, 0, .5);
    fig.style.transform = `translate(-50%,-50%) translateY(${(64 * (1 - e)).toFixed(1)}px) rotate(${(rot + from * (1 - e)).toFixed(2)}deg) scale(${(1.06 - .06 * e).toFixed(3)})`;
  };
  const imgPropose = $("#shotPropose img"), shotDoor = el("shotDoor"), imgDoor = $("#shotDoor img"), s2Line = el("s2Line"), s2Names = el("s2Names"), s2Wash = el("s2Wash");
  if (seqDoor) s2.classList.add("lit");
  const garden = el("garden"), gBg = $(".g-bg"), gGroom = $(".g-groom"), gVeil = $(".g-veil");
  const night = el("nightPhoto"), six = el("six"), sixT = $(".six-t"), sixTb = el("sixT"), sixD = el("sixD"), sixK = el("sixK");
  const clock = el("clock"), clockT = el("clockT"), lights = el("lights"), endPhoto = el("endPhoto"), endImg = $("#endPhoto img");
  const T = (e, y = 0, s = 1) => e.style.transform = `translate3d(0,${y},0) scale(${s})`;

  const update = () => {
    ticking = false; updY = scrollY;
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
    // 장면 1 · 앨범: 어린 신부(1997) → 어린 신랑(2003) → 두 사람의 이야기 여섯 장면 → 프러포즈 그림 (시간 순서)
    if (near(s1, 1.5)) { jump.load(); brideCam.load(); }
    if (near(s1, .2)) {
      const p = pinP(s1, 1);
      s1Line.style.opacity = seg(p, 0, .02); T(s1Line, `${(18 * (1 - ease(seg(p, 0, .025)))).toFixed(1)}px`);
      dropIn(prB, seg(p, .005, .025), 2.2, -7); brideCam.draw(seg(p, .025, .13));
      dropIn(prB2, seg(p, .07, .09), 5, -8);
      dropIn(prA, seg(p, .14, .16), -2.5, 7); jump.draw(seg(p, .16, .265));
      const realOff = 1 - seg(p, stAt(1) + .03, stAt(1) + .06);   // 이야기 두 번째 장이 놓이면 옛 사진·영상은 물러납니다
      if (realOff < 1) [prA, prB, prB2].forEach(f => f.style.opacity = Math.min(+f.style.opacity, realOff));
      const capOff = 1 - seg(p, ST0, ST0 + .02); capA.style.opacity = capOff; capB.style.opacity = 1 - seg(p, .14, .155);
      tvNote.style.opacity = seg(p, .02, .04) * (1 - seg(p, .125, .14));
      noteB.style.opacity = seg(p, .15, .17) * (1 - seg(p, ST0 - .012, ST0 + .005));
      const at7 = stAt(story.length);
      story.forEach((sq, i) => {
        const at = stAt(i), next = i + 1 < story.length ? stAt(i + 1) : at7;
        if (p > at - .15) sq.load();
        dropIn(stFig[i], seg(p, at, at + .025), stRot[i], i % 2 ? -6 : 6);
        sq.draw(slowEnds(seg(p, at + .025, at + .09)));
        const gone = i + 2 < story.length ? stAt(i + 2) : at7 + .03;
        stFig[i].style.opacity = Math.min(+stFig[i].style.opacity, 1 - seg(p, gone + .03, gone + .06));
        stCap[i].style.opacity = 1 - seg(p, next, next + .02);
        stNote[i].style.opacity = seg(p, at + .01, at + .03) * (1 - seg(p, next - .012, next + .005));
      });
      dropIn(st7, seg(p, at7, at7 + .02), 0, 5);
      const zf = 1 - seg(p, at7 + .025, at7 + .05);   // 그림이 커지기 시작하면 아래 사진들은 물러납니다
      if (zf < 1) stFig.forEach(f => f.style.opacity = Math.min(+f.style.opacity, zf));
      s1Line.style.opacity = Math.min(+s1Line.style.opacity, 1 - seg(p, at7 + .02, at7 + .045));
    }
    // 프러포즈 그림 → 화면 가득 → 그 자리에서 실제 사진으로 → 장면 2 (장면 2 는 장면 1 의 마지막 화면 높이만큼 겹쳐 시작하므로 빈 구간이 없습니다)
    {
      const r2 = s2.getBoundingClientRect(), before = r2.top > 1;
      s2.style.visibility = !RM && before ? "hidden" : "";   // 겹쳐 올라오는 동안에는 장면 1 의 그림이 보이게 합니다
      if (!RM && before && near(s1, .2)) {
        const at7 = stAt(story.length), p1 = pinP(s1, 1), z = ease(seg(p1, at7 + .02, at7 + .075));
        const o = p1 < at7 + .02 ? 0 : 1;
        bridge.style.visibility = o ? "visible" : "hidden"; bridge.style.opacity = o;
        if (o) {
          // 인화 사진 속 그림의 자리 → 장면 2 사진과 같은 object-fit:cover 자리로 키운 뒤, 실제 사진으로 바꿉니다
          const b = bridge.getBoundingClientRect(), r = st7img.getBoundingClientRect();
          const k = Math.max(b.width / 9, b.height / 16), cw = 9 * k, ch = 16 * k, cl = (b.width - cw) / 2, ct = (b.height - ch) / 2;
          const lerp = (x, y) => (x + (y - x) * z).toFixed(1) + "px";
          const box = { left: lerp(r.left - b.left, cl), top: lerp(r.top - b.top, ct), width: lerp(r.width, cw), height: lerp(r.height, ch) };
          bridgeImgs.forEach(im => Object.assign(im.style, box));
          bridgeReal.style.opacity = ease(seg(p1, at7 + .07, at7 + .105));
          bridge.style.background = z >= 1 ? "var(--sky)" : "transparent";
        }
      } else if (bridge.style.visibility !== "hidden") { bridge.style.visibility = "hidden"; bridge.style.opacity = 0; }
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
  let ticking = false, updY = -1;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", () => { if (Math.abs(scrollY - updY) > .01) req(); }, { passive: true });   // 부드러운 스크롤이 이미 그린 위치면 다시 그리지 않음
  let rw = innerWidth;
  addEventListener("resize", () => { if (innerWidth === rw && Math.abs(innerHeight - vh) < 140) { vh = innerHeight; fitSeq(seqPropose); fitSeq(seqDoor); return req(); } rw = innerWidth; layout(); req(); });
  addEventListener("load", () => { layout(); req(); gUpdate(); });
  layout(); update(); gUpdate();
})();
