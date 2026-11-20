(() => {
  const C = window.WEDDING;
  // V11 은 V9 와 같고 장면 3 의 사진만 다릅니다. 설정은 config.js 의 v4 → v9 → v11 순으로 덮어씁니다. 영상과 프레임은 ../v9/media/, 장면 3 의 사진 세 겹은 media/ 에 있습니다
  const V = Object.assign({
    rsvpPopup: false,
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "11.webp", "12.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],
    videos: {},      // { hero, night } : v4/assets/ 안의 mp4 파일명. 있으면 사진 위에 영상을 겹칩니다
    sequences: {},   // { propose: { dir, count }, door: { dir, count } } : 스크롤로 넘기는 프레임 묶음
  }, C.v4 || {}, C.v9 || {}, C.v11 || {});
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
  const shareUrl = (C.siteUrl ? C.siteUrl + "v11/" : location.href.split(/[?#]/)[0]) + (BRIDE ? "?side=bride" : "");
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
  // 크게 본 사진을 위나 아래로 밀면 닫힙니다: 사진이 손가락을 따라 움직이고 뒤 배경이 옅어지다가, 70px 넘게 밀었거나 빠르게 튕겼으면 닫히고 아니면 제자리로 돌아옵니다
  {
    const im = $("#lbImg"); let y0 = null, x0 = 0, t0 = 0, dy = 0, drag = false;
    const reset = anim => { im.style.transition = anim ? "transform .2s ease" : ""; lb.style.transition = anim ? "background-color .2s ease" : ""; im.style.transform = im.style.opacity = lb.style.backgroundColor = ""; };
    lb.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) { y0 = null; return; }
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = performance.now(); dy = 0; drag = false; im.style.transition = lb.style.transition = "";
    }, { passive: true });
    lb.addEventListener("touchmove", e => {
      if (y0 == null || e.touches.length !== 1) return;
      const t = e.touches[0]; dy = t.clientY - y0;
      if (!drag) { if (Math.abs(dy) < 8 || Math.abs(dy) < Math.abs(t.clientX - x0)) return; drag = true; }
      const k = Math.min(1, Math.abs(dy) / 320);
      im.style.transform = `translate3d(0,${dy.toFixed(1)}px,0) scale(${(1 - .12 * k).toFixed(3)})`;
      lb.style.backgroundColor = `rgba(6,9,8,${(.94 * (1 - .7 * k)).toFixed(3)})`;
    }, { passive: true });
    const end = () => {
      if (y0 == null) return; y0 = null;
      if (!drag) return; drag = false;
      if (Math.abs(dy) > 70 || (performance.now() - t0 < 300 && Math.abs(dy) > 30)) {
        im.style.transition = "transform .18s ease-in, opacity .18s ease-in"; lb.style.transition = "background-color .18s ease-in";
        im.style.transform = `translate3d(0,${dy > 0 ? 55 : -55}vh,0) scale(.88)`; im.style.opacity = "0"; lb.style.backgroundColor = "rgba(6,9,8,0)";
        setTimeout(() => { closeLb(); reset(false); }, 190);
      } else reset(true);
    };
    lb.addEventListener("touchend", end, { passive: true }); lb.addEventListener("touchcancel", end, { passive: true });
  }
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
  /* ---------- 스크롤 ----------
   * 손가락 스크롤은 휴대폰(브라우저) 기본 그대로 둡니다. 손을 따라오는 느낌과 관성은 기기가 만들고,
   * 화면 효과는 그 위치를 약 0.14초 늦게 부드럽게 따라갑니다(아래 '스크롤 연동'). 스크롤을 가로채지 않으므로 손을 붙드는 일이 없습니다.
   * 마우스 휠만 굴린 만큼 부드럽게 이어 줍니다(약 0.2초). 동작 줄이기, 참석 의사 창·크게 보기가 열려 있을 때, 화면 확대 중에는 쓰지 않습니다. */
  const root = document.documentElement, vvp = window.visualViewport;
  const TAU_WHEEL = .19;
  let wT = null, wCur = 0, wSet = 0;   // 휠: 가려는 위치 · 지금 위치 · 마지막으로 옮겨 둔 위치
  function smoothStop() { wT = null; }
  const maxY = () => root.scrollHeight - innerHeight;
  const blocked = () => holdY != null || root.classList.contains("hold") || document.body.classList.contains("locked") || (vvp && vvp.scale > 1.01);
  if (!RM) {
    addEventListener("wheel", e => {
      if (e.ctrlKey || e.defaultPrevented || blocked() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (wT == null) wT = wCur = wSet = scrollY;
      const d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
      wT = clamp(wT + d, 0, maxY()); req();
    }, { passive: false });
    addEventListener("touchstart", smoothStop, { passive: true });
  }
  let cueT = 0;
  const afterIntro = () => {
    const cue = $("#cue");
    $("#cueThanks").hidden = !thanked;
    cue.classList.add("show");
    clearTimeout(cueT); cueT = setTimeout(() => cue.classList.remove("show"), 3200);
    // "어릴 적 인연이" 글이 뜨고 첫 사진(어린 신부)이 놓여 영상이 시작되는 지점까지
    const top = s1.getBoundingClientRect().top + scrollY;
    const target = Math.round(top + (CARD0 + .04 * U) * (s1.offsetHeight - innerHeight));
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
   *  화면 효과는 실제 스크롤 위치(scrollY)가 아니라, 그 위치를 부드럽게 따라가는 값(SY)으로 그립니다.
   *  스크롤이 툭툭 끊기거나 갑자기 멈춰도 화면은 매 프레임 조금씩 움직이다 사뿐히 멈춥니다.
   * ========================================================== */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t * t * (3 - 2 * t);
  const el = id => document.getElementById(id);
  let vh = innerHeight, vw = innerWidth, SY = scrollY;
  // 장면들의 문서 안 위치는 한 번 재어 두고 씁니다 (매 프레임 다시 재지 않습니다). 크기가 바뀌면 다시 잽니다
  const boxes = new Map(), B = e => boxes.get(e);
  // 화면에 고정된 장면의 진행률 0~1 (동작 줄이기에서는 대표 장면 하나를 보여 줍니다)
  const pinP = (e, still) => { if (RM) return still; const b = B(e), d = b.h - vh; return d > 0 ? clamp((SY - b.top) / d) : 0; };
  // 화면을 지나가는 블록의 진행률 0~1
  const viewP = e => { const b = B(e); return clamp((vh - (b.top - SY)) / (vh + b.h)); };
  const near = (e, m = 1) => { const b = B(e), t = b.top - SY; return t + b.h > -vh * m && t < vh * (1 + m); };

  /* 프레임 묶음 재생기 (프러포즈 · 문 장면은 스크롤로, 자동 재생이 막힌 기기의 앨범 영상은 시간으로 넘깁니다).
   * - 위치가 두 프레임 사이면 두 장을 겹쳐 그립니다.
   * - 프레임은 8장 간격 → 4장 → 2장 → 1장 순서로 불러와서, 다 받기 전에도 장면 전체가 보이고 점점 촘촘해집니다.
   * - 그림은 압축된 파일(Blob)로 받아 두고, 지금 보는 위치 앞뒤의 몇 장만 미리 백그라운드에서 풀어(createImageBitmap) 둡니다.
   *   풀어 둔 그림의 메모리는 전체 약 160MB 안에서 가장 먼 것부터 비웁니다. 이 기능이 없는 브라우저는 예전 방식(Image)으로 그립니다. */
  const BITMAP = "createImageBitmap" in window && "fetch" in window;
  const BM_LIMIT = 160e6, allSeqs = [];
  let bmBytes = 0, paintQ = new Set(), paintId = 0;
  const flushPaint = () => { paintId = 0; const q = paintQ; paintQ = new Set(); q.forEach(s => { s.last = ""; s.paint(); if (s.onLate) s.onLate(); }); };
  const queuePaint = s => { paintQ.add(s); if (!paintId) paintId = requestAnimationFrame(flushPaint); };
  const evict = () => {
    const now = performance.now();
    while (bmBytes > BM_LIMIT) {
      let vs = null, vi = -1, vd = -1;
      allSeqs.forEach(s => s.bms.forEach((bm, i) => {
        if (!bm) return;
        const d = Math.abs(i - s.cur) + (now - s.used > 1500 ? 1e4 : 0);   // 한동안 안 그린 장면 먼저, 그다음 지금 위치에서 먼 프레임
        if (d > vd) { vd = d; vs = s; vi = i; }
      }));
      if (!vs) break;
      vs.drop(vi);
    }
  };
  class Seq {
    constructor(canvas, url, count, cover) {
      Object.assign(this, { canvas, url, count, cover, imgs: [], blobs: [], bms: [], busy: new Set(), last: "", cur: 0, used: 0, got: 0, started: false });
      this.ctx = canvas.getContext("2d"); allSeqs.push(this);
    }
    load() {
      if (this.started) return; this.started = true;
      const order = [], seen = new Set(), add = i => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
      for (const step of [8, 4, 2, 1]) { for (let i = 0; i < this.count; i += step) add(i); add(this.count - 1); }
      const get = i => {
        if (BITMAP) {
          fetch(this.url(i)).then(r => r.ok ? r.blob() : null).then(bl => { if (bl) { this.blobs[i] = bl; this.got++; this.pump(); } }).catch(() => {});
        } else {
          const im = new Image(); im.decoding = "async";
          im.onload = () => { im.ok = true; this.got++; if (Math.abs(i - this.cur) < 3 || this.last === "") queuePaint(this); };
          im.src = this.url(i); this.imgs[i] = im;
        }
      };
      // 요청은 12장씩 0.04초 간격으로 나눠 보냅니다 (백여 장을 한 프레임에 한꺼번에 요청하면 그 프레임이 멈칫합니다)
      for (let n = 0; n < order.length; n += 12) { const part = order.slice(n, n + 12); if (n) setTimeout(() => part.forEach(get), n / 12 * 40); else part.forEach(get); }
    }
    // 지금 위치에서 가까운 프레임부터 두 장씩 풀기
    pump() {
      if (!BITMAP) return;
      const c = Math.round(Math.max(0, this.cur)), R = 6;
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
    // p = 0~1. 들어오는 값이 이미 부드럽게 이어지므로(스크롤을 따라가는 값 · 시간) 받은 자리에 바로 그립니다
    draw(p) { this.cur = clamp(p) * (this.count - 1); this.pump(); this.paint(); }
    put(im, alpha, c = this.canvas, x = this.ctx) {
      const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      x.globalAlpha = alpha;
      if (!this.cover) return x.drawImage(im, 0, 0, c.width, c.height);
      const k = Math.max(c.width / iw, c.height / ih), w = iw * k, h = ih * k;
      x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
    }
    // 지금 위치에 그릴 프레임: [앞 장, 뒷 장, 뒷 장을 겹칠 정도 0~1). 준비된 프레임이 없으면 null
    pick() {
      const ok = i => !!this.frame(i), w = Math.max(0, this.cur);
      let lo = Math.floor(w), hi = Math.ceil(w);
      while (lo > 0 && !ok(lo)) lo--;
      while (hi < this.count - 1 && !ok(hi)) hi++;
      if (!ok(lo)) { if (!ok(hi)) return null; lo = hi; }
      if (!ok(hi)) hi = lo;
      // 한쪽이 너무 멀면(아직 안 풀림) 가까운 쪽 한 장만 그립니다
      if (hi - lo > 4) { if (w - lo <= hi - w) hi = lo; else lo = hi; }
      let t = hi > lo ? Math.round((w - lo) / (hi - lo) * 32) / 32 : 0;
      if (t >= 1) { lo = hi; t = 0; }
      return [lo, hi, t];
    }
    paint() {
      const pk = this.pick(); if (!pk) return;
      const [lo, hi, t] = pk, key = t > 0 ? `${lo}+${hi}+${t}` : `${lo}`;
      this.used = performance.now();
      if (key === this.last) return;
      this.last = key;
      this.put(this.frame(lo), 1);
      if (t > 0) this.put(this.frame(hi), t);
      this.ctx.globalAlpha = 1;
    }
  }
  const F3 = i => String(i).padStart(3, "0");
  const coverSeq = (boxSel, conf, maxW, cap) => {
    if (!conf || !conf.count || RM) return null;
    const cv = document.createElement("canvas");
    $(boxSel).appendChild(cv);
    const s = new Seq(cv, i => `${conf.base || "../v4/assets/"}${conf.dir}/${F3(i)}.webp${conf.v ? "?v=" + conf.v : ""}`, conf.count, true);
    s.maxW = maxW; s.cap = cap; return s;
  };
  // 프러포즈 · 문 장면 프레임은 V9 것(../v9/media/): 둘 다 1080×1920.
  //  · 프러포즈: 실제 연속 촬영 두 장(시작 = 보정본, 끝 = 신랑이 반지를 내밀고 신부가 옅게 웃는 컷)을 시작·끝 장면으로 만든 영상이라 얼굴이 끝까지 실제 사진과 같습니다
  //  · 문: V4 와 같은 영상을 고해상도로 키운 뒤 빛 효과를 다시 입힌 것
  // 캔버스가 작을수록 움직이는 동안 가볍습니다: 움직일 때는 화면 배율 2 까지만 그리고, 멈추면 원래 해상도로 한 번 더 그려 겹칩니다(아래 mkSharp)
  const seqPropose = coverSeq("#shotPropose", { base: "../v9/media/", dir: "seq-propose", count: 121, v: 1 }, 1080, 2);
  const seqDoor = coverSeq("#shotDoor", V.sequences.door && V.sequences.door.count ? { base: "../v9/media/", dir: "seq-door", count: 97, v: 1 } : null, 1080, 2);
  // 캔버스 크기는 화면 전체가 아니라 장면 칸에 맞춥니다 (큰 화면에서는 칸이 가운데 휴대폰 너비로 좁아집니다)
  const seqSize = (s, cap) => { const r = s.canvas.parentElement.getBoundingClientRect(), k = Math.min(cap, devicePixelRatio || 1, s.maxW / r.width); return [Math.round(r.width * k), Math.round(r.height * k)]; };
  const fitSeq = s => {
    if (!s) return;
    const [w, h] = seqSize(s, s.cap);
    if (!w || !h || (s.canvas.width === w && s.canvas.height === h)) return;
    s.canvas.width = w; s.canvas.height = h; s.last = ""; s.paint();
    (s === seqPropose ? shP : shD).off();
  };
  /* 멈췄을 때만 선명하게: 장면이 보이고 있으면 0.2초 뒤 원래 해상도(1080 너비) 캔버스를 겹쳐 그립니다. 다시 움직이면 바로 걷습니다.
   * 같은 프레임을 이미 그려 두었으면 그대로 두고, 멈춘 뒤 늦게 도착한 프레임으로 바뀌면 다시 그립니다. */
  const mkSharp = (s, visible) => {
    if (!s) return { off() {}, arm() {} };
    let cv = null, T = 0, on = false, key = "";
    const off = () => { clearTimeout(T); T = 0; if (on) { on = false; cv.classList.remove("on"); } };
    const draw = () => {
      T = 0;
      const pk = s.pick(); if (!pk || raf) return;
      key = pk.join();
      const [w, h] = seqSize(s, 3);
      if (w <= s.canvas.width) return;   // 이미 가장 큰 해상도로 그리고 있음 (화면 배율 2 이하인 기기)
      if (!cv) { cv = document.createElement("canvas"); cv.className = "sharp"; s.canvas.after(cv); }
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const x = cv.getContext("2d");
      s.put(s.frame(pk[0]), 1, cv, x); if (pk[2] > 0) s.put(s.frame(pk[1]), pk[2], cv, x); x.globalAlpha = 1;
      on = true; cv.classList.add("on");
    };
    const arm = () => {
      if (raf || !visible()) return;
      const pk = s.pick(); if (!pk || (on && pk.join() === key)) return;
      off(); T = setTimeout(draw, 200);
    };
    s.onLate = arm;
    return { off, arm };
  };
  const inS2 = () => SY >= B(s2).top - 1 && near(s2, 0);
  const shP = mkSharp(seqPropose, () => inS2() && pinP(s2, 0) < .62), shD = mkSharp(seqDoor, () => inS2() && pinP(s2, 0) > .5 && pinP(s2, 0) < .95);

  /* ---------- 앨범 속 영상 ----------
   * 사진이 맨 위에 놓이면 그 안의 영상이 처음부터 한 번, 원래 빠르기로 재생되고 마지막 장면에서 멈춥니다.
   * 다음 사진에 덮이면 멈추고, 되돌아와 다시 맨 위가 되면 처음부터 다시 재생합니다. 맨 위 사진을 누르면 다시 볼 수 있습니다.
   * 영상은 가까워질 때(두 장 앞) 미리 받기 시작하고, 멀어지면 내려놓습니다(휴대폰이 동시에 쥘 수 있는 영상 수에 한계가 있습니다).
   * 자동 재생이 막힌 기기(아이폰 저전력 모드, 일부 앱 안 브라우저)나 영상이 4초 안에 시작되지 않을 때는
   * 같은 장면의 프레임 묶음을 시간에 맞춰 넘겨서 똑같이 움직이는 것처럼 보여 줍니다. */
  let NOAUTO = false;
  class Clip {
    constructor(o) {
      Object.assign(this, { o, box: el(o.id), top: false, v: null, seq: null, fb: false, started: false, timer: 0, wd: 0, rw: 0, fr: 0 });
    }
    // 미리 받을 것이 남았는지
    needs() { return !RM && (NOAUTO || this.fb ? !(this.seq && this.seq.started) : !this.v); }
    // 영상 미리 받기
    prep() {
      if (RM) return;
      if (NOAUTO || this.fb) return this.frames().load();
      if (this.v) return;
      const v = this.v = document.createElement("video");
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = "auto";
      ["muted", "playsinline", "webkit-playsinline", "disablepictureinpicture", "disableremoteplayback"].forEach(a => v.setAttribute(a, ""));
      v.setAttribute("aria-hidden", "true"); v.tabIndex = -1;
      const show = () => { if (this.v === v && !this.fb) v.classList.add("on"); };
      v.addEventListener("playing", () => { this.started = true; clearTimeout(this.wd); if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(show); else show(); });
      v.addEventListener("error", () => { if (this.v === v && v.error) this.fallback(); });
      v.src = this.o.src;
      this.box.appendChild(v);
    }
    setTop(on) {
      if (on === this.top) return; this.top = on;
      clearTimeout(this.timer); clearTimeout(this.wd); clearTimeout(this.rw);
      if (on) this.timer = setTimeout(() => this.play(), 380);   // 사진이 거의 내려앉은 뒤에 시작
      else { cancelAnimationFrame(this.fr); if (this.v) this.v.pause(); }
    }
    play() {
      if (!this.top || RM) return;
      if (NOAUTO || this.fb) return this.playFrames();
      this.prep();
      const v = this.v; this.started = false;
      try { if (v.currentTime > 0) v.currentTime = 0; } catch {}
      const pr = v.play();
      if (pr && pr.catch) pr.catch(e => { if (e && e.name === "NotAllowedError" && this.v === v) { NOAUTO = true; this.fallback(); } });
      // 4초가 지나도 시작되지 않으면: 영상은 받아 놓고도 재생이 안 되는 경우(막힌 기기) 프레임으로 바꾸고, 아직 받는 중이면 더 기다립니다(최대 12초)
      clearTimeout(this.wd);
      const watch = n => { this.wd = setTimeout(() => { if (!this.top || this.started || this.v !== v) return; if (v.readyState >= 3 || n >= 2) this.fallback(); else watch(n + 1); }, 4000); };
      watch(0);
    }
    // 걷힌 사진(아직 놓이지 않은 상태로 돌아간 사진)은 잠시 뒤 첫 장면으로 되돌려 둡니다
    rewind() {
      clearTimeout(this.rw);
      this.rw = setTimeout(() => {
        if (this.top) return;
        if (this.v) { this.v.classList.remove("on"); try { this.v.currentTime = 0; } catch {} }
        if (this.seq) { this.seq.ctx.clearRect(0, 0, this.seq.canvas.width, this.seq.canvas.height); this.seq.last = ""; }
      }, 700);
    }
    unload(force) {
      if ((this.top && !force) || !this.v) return;
      const v = this.v; this.v = null;
      v.pause(); v.removeAttribute("src"); try { v.load(); } catch {} v.remove();
    }
    frames() {
      if (!this.seq) {
        const cv = document.createElement("canvas"); cv.width = this.o.w; cv.height = this.o.h; cv.setAttribute("aria-hidden", "true");
        this.box.appendChild(cv);
        this.seq = new Seq(cv, this.o.frame, this.o.count, false);
      }
      return this.seq;
    }
    fallback() {
      if (this.fb) return; this.fb = true;
      clearTimeout(this.wd);
      // 영상은 내려놓습니다. 자동 재생이 막힌 기기라면 미리 받아 둔 다른 영상들도 함께
      (NOAUTO ? clips : [this]).forEach(c => c && c.unload(true));
      this.frames().load();
      if (this.top) this.playFrames();
    }
    playFrames() {
      const s = this.frames(); s.load();
      cancelAnimationFrame(this.fr);
      const asked = performance.now(), dur = this.o.dur * 1000; let t0 = 0;
      const step = now => {
        if (!this.top) return;
        // 프레임을 70% 넘게 받았거나 2초가 지나면 시작합니다 (받는 중에는 첫 장면 그림이 보입니다)
        if (!t0) { if (s.got >= s.count * .7 || now - asked > 2000) t0 = now; else return void (this.fr = requestAnimationFrame(step)); }
        const t = clamp((now - t0) / dur);
        s.draw(t);
        if (t < 1) this.fr = requestAnimationFrame(step);
      };
      this.fr = requestAnimationFrame(step);
    }
  }
  const clips = [
    new Clip({ id: "clipB", src: "../v9/media/bride.mp4?v=1", dur: 4.5, count: 81, w: 800, h: 600, frame: i => `../v8/media/bride/${F3(i)}.webp` }),   // 1997 캠코더 영상
    new Clip({ id: "clipA", src: "../v9/media/jump.mp4?v=1", dur: 2.7, count: 81, w: 800, h: 600, frame: i => `../v4/assets/jump/${F3(i)}.webp` }),      // 2003 줄넘기
    // 두 사람의 이야기: 애니메이션 여섯 장면 (세 번째 계주 장면만 3.6초, 나머지는 5초)
    ...[1, 2, 3, 4, 5, 6].map(k => new Clip({ id: `clip${k}`, src: `../v9/media/st${k}.mp4?v=1`, dur: k === 3 ? 3.6 : 5, count: 37, w: 512, h: 384, frame: i => `../v8/media/st${k}/${F3(i)}.webp` })),
    null,   // 아홉 번째(프러포즈 그림)는 영상이 아닙니다
  ];
  // 맨 위 사진을 누르면 그 영상을 처음부터 다시 봅니다 (아직 놓이지 않은 사진들이 투명하게 겹쳐 있어서, 앨범 전체에서 받아 맨 위 사진으로 넘깁니다)
  el("album").addEventListener("click", () => { const c = clips[K]; if (c && c.top) { clearTimeout(c.timer); c.play(); } });
  document.addEventListener("visibilitychange", () => {
    const c = clips[K]; if (document.hidden || !c || !c.top) return;
    if (c.fb || NOAUTO) return;
    if (c.v && c.started && c.v.paused && !c.v.ended) { const pr = c.v.play(); if (pr && pr.catch) pr.catch(() => {}); }
  });

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
  const setLit = (k, f) => { const g = strands[k], n = Math.round(f * g.length); if (n === lit[k]) return; lit[k] = n; g.forEach((e, i) => e.classList.toggle("lit", i < n)); };

  /* 바탕색 */
  const scenes = $$(".scene"), cols = scenes.map(s => s.dataset.bg.match(/\w\w/g).map(h => parseInt(h, 16)));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const sky = $("#sky"), theme = $('meta[name="theme-color"]');
  let skyCss = "";
  const paintSky = () => {
    const mid = SY + vh / 2; let col = cols[0];
    for (let i = 0; i < scenes.length; i++) {
      const b = B(scenes[i]), top = b.top, bot = b.top + b.h;
      if (top > mid || bot <= mid) { if (i === scenes.length - 1 && bot <= mid) col = cols[i]; continue; }
      const W = Math.min(vh * .45, b.h / 2);
      col = cols[i];
      if (i < scenes.length - 1 && bot - mid < W) col = mix(cols[i], cols[i + 1], (W - (bot - mid)) / (2 * W));
      else if (i > 0 && mid - top < W) col = mix(cols[i - 1], cols[i], .5 + (mid - top) / (2 * W));
      break;
    }
    const css = `rgb(${col.join(",")})`;
    if (css === skyCss) return; skyCss = css;
    // 바탕색은 필요한 곳에만 직접 넣습니다 (문서 전체의 스타일을 다시 계산하지 않도록)
    sky.style.background = css; theme.content = css; s2Wash.style.background = css;
    document.body.classList.toggle("ink-light", (col[0] * 299 + col[1] * 587 + col[2] * 114) / 1000 < 128);
  };

  /* 시계: 스크롤 위치 → 오후 3:00 ~ 6:00 */
  const s0 = $("#s0"), s1 = $("#s1"), s2 = $("#s2"), s3b = $("#s3b"), s4 = $("#s4");
  const garden = el("garden"), endPhoto = el("endPhoto"), bridge = el("bridge");
  const tracked = [...scenes, garden, endPhoto];
  let keys = [], brW = vw, brH = vh, lastSH = 0;
  const SIX_AT = .2;                 // 장면 4 에서 시계가 6:00 에 닿는 지점
  // 위치 다시 재기 (가벼움)
  const measure = () => {
    const y = scrollY;
    tracked.forEach(e => { const r = e.getBoundingClientRect(); boxes.set(e, { top: r.top + y, h: r.height }); });
    const bb = bridge.getBoundingClientRect(); brW = bb.width; brH = bb.height;
    lastSH = root.scrollHeight;
    const top = e => B(e).top, bot = e => B(e).top + B(e).h;
    keys = [[top(s0), 900], [bot(s1) - vh, 960], [bot(s2) - vh, 1020], [bot(s3b) - vh, 1070], [top(s4) + SIX_AT * (B(s4).h - vh), 1080]];
  };
  const layout = () => { vh = innerHeight; vw = innerWidth; measure(); buildLights(); fitSeq(seqPropose); fitSeq(seqDoor); };
  const timeAt = y => {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (y <= keys[i][0]) { const [y0, t0] = keys[i - 1], [y1, t1] = keys[i]; return t0 + (t1 - t0) * (y - y0) / Math.max(1, y1 - y0); }
    return 1080;
  };
  const fmt = t => { const m = Math.floor(t + 1e-6); return `${((Math.floor(m / 60) + 11) % 12) + 1}:${pad(m % 60)}`; };

  const heroPhoto = el("heroPhoto"), heroText = el("heroText"), hint = el("scrollHint");
  const s1Line = el("s1Line"), album = el("album"), prB2 = el("prB2"), st7 = el("st7");
  const bridgeImgs = [...document.querySelectorAll("#bridge img")], bridgeReal = $("#bridge .real");
  /* 장면 1 의 흐름 (진행률 0~1, U = 화면 한 개만큼 내린 거리)
   *  · 사진 아홉 장(어린 신부 · 어린 신랑 · 이야기 여섯 장 · 프러포즈 그림)이 화면 0.64개 간격으로 한 장씩 놓입니다.
   *    스크롤은 '몇 번째 사진까지 놓였는지'만 정하고, 놓이는 움직임과 영상 재생은 시간에 맞춰 흘러갑니다.
   *  · 마지막 그림이 놓인 뒤에는 스크롤에 맞춰 그림이 화면 가득 커지고(Z0~Z1), 거의 다 커진 뒤부터 화면 0.46개만큼 내리는 동안
   *    천천히 사라져 바탕색만 남았다가(F0~F1), 실제 프러포즈 사진이 서서히 나타납니다(R0~R1). 두 그림이 겹쳐 보이는 순간은 없습니다. */
  const U = 100 / ((parseFloat(s1.style.getPropertyValue("--len")) || 800) - 100);
  const NCARD = 9, CARD0 = .08 * U, CARD = .64 * U, HYS = .07 * U, cardAt = i => CARD0 + i * CARD;
  const Z0 = cardAt(NCARD - 1) + .34 * U, Z1 = Z0 + .52 * U, F0 = Z1 - .06 * U, F1 = Z1 + .4 * U, R0 = F1, R1 = Z1 + .84 * U;
  const cards = [el("prB"), el("prA"), ...[1, 2, 3, 4, 5, 6].map(k => el(`st${k}`)), st7];
  const notes = [el("tvNote"), el("noteB"), ...[1, 2, 3, 4, 5, 6].map(k => el(`sn${k}`)), null];
  let K = -1;   // 맨 위에 놓인 사진의 번호 (-1 = 아직 없음)
  const setK = k => {
    if (k === K) return;
    const prev = K; K = k;
    cards.forEach((f, i) => {
      f.classList.toggle("on", i <= k);
      f.classList.toggle("under", i < k);
      // 어린 시절 영상 두 장은 이야기 두 번째 장이 놓일 때, 이야기 장면은 두 장 뒤가 놓일 때 물러납니다 (마지막 두 장은 그림이 커질 때까지 남습니다)
      f.classList.toggle("gone", i < 2 ? k >= 3 : i <= 5 && k >= i + 2);
    });
    prB2.classList.toggle("late", prev < 0); prB2.classList.toggle("on", k >= 0); prB2.classList.toggle("gone", k >= 3);   // late: 처음 놓일 때만 영상이 조금 흐른 뒤에
    notes.forEach((n, i) => n && n.classList.toggle("on", i === k));
    clips.forEach((c, i) => { if (!c) return; c.setTop(i === k); if (i > k && i <= prev) c.rewind(); });
    stock();
  };
  // 영상 미리 받기 · 내려놓기: 맨 위 사진과 그다음 두 장의 영상을 쥐고 있습니다. 영상을 새로 만드는 일은 무거워서
  // 사진이 바뀌고 0.22초 뒤(빠르게 여러 장을 지나칠 때는 멈춘 뒤)에, 한 번에 하나씩 합니다
  let stockT = 0, warm = false;
  const stock = () => { clearTimeout(stockT); stockT = setTimeout(stockNow, 220); };
  const stockNow = () => {
    let made = false, more = false;
    clips.forEach((c, i) => {
      if (!c) return;
      if (i >= K && i <= K + 2) { if (c.needs()) { if (made) more = true; else { c.prep(); made = true; } } }
      else if (Math.abs(i - K) > 2) c.unload();
    });
    if (more) stockT = setTimeout(stockNow, 90);
  };
  const imgPropose = $("#shotPropose img"), shotDoor = el("shotDoor"), imgDoor = $("#shotDoor img"), s2Line = el("s2Line"), s2Names = el("s2Names"), s2Wash = el("s2Wash");
  if (seqDoor) s2.classList.add("lit");
  const gBg = $(".g-bg"), gDuo = $(".g-duo"), gLeaf = $(".g-leaf");
  const night = el("nightPhoto"), six = el("six"), sixT = $(".six-t"), sixTb = el("sixT"), sixD = el("sixD"), sixK = el("sixK");
  const clock = el("clock"), clockT = el("clockT"), lights = el("lights"), endImg = $("#endPhoto img");
  const T = (e, y = 0, s = 1) => e.style.transform = `translate3d(0,${y},0) scale(${s})`;
  let s2Hid = null, brOn = null, lastPP = -1, lastDP = -1;

  const update = () => {
    paintSky();
    const t = RM ? 1080 : timeAt(SY), time = fmt(t);
    if (clockT.textContent !== time) clockT.textContent = time;

    // 장면 0
    if (near(s0, .2)) {
      const p = pinP(s0, 0);
      T(heroPhoto, `${(-p * 2).toFixed(2)}%`, 1 + p * .08);   // 내릴수록 사진이 살짝 다가옴
      T(heroText, `${(-p * 150).toFixed(1)}px`); heroText.style.opacity = 1 - seg(p, .35, .95);
      hint.style.opacity = 1 - seg(p, 0, .15);
    }
    // 장면 1 · 앨범: 어린 신부(1997) → 어린 신랑(2003) → 두 사람의 이야기 여섯 장면 → 프러포즈 그림 (시간 순서)
    const p1 = pinP(s1, 1);
    {
      let k = K;
      if (RM) k = NCARD - 1;
      else { while (k < NCARD - 1 && p1 >= cardAt(k + 1)) k++; while (k >= 0 && p1 < cardAt(k) - HYS) k--; }
      if (k < 0 && !warm && near(s1, .35)) { warm = true; stock(); }   // 장면 1 이 가까워지면 첫 두 영상을 받아 둡니다
      setK(k);
      s1Line.classList.toggle("on", RM || (p1 > .004 && p1 < Z0 + .02 * U));
      album.classList.toggle("zoom", !RM && p1 >= Z0 + .06 * U);
    }
    // 프러포즈 그림 → 화면 가득 → 그 자리에서 실제 사진으로 → 장면 2 (장면 2 는 장면 1 의 마지막 화면 높이만큼 겹쳐 시작하므로 빈 구간이 없습니다)
    {
      const before = SY < B(s2).top - 1, hid = !RM && before;
      if (hid !== s2Hid) { s2Hid = hid; s2.style.visibility = hid ? "hidden" : ""; }   // 겹쳐 올라오는 동안에는 장면 1 의 그림이 보이게 합니다
      const o = hid && p1 >= Z0;
      if (o) {
        // 인화 사진 속 그림의 자리 → 장면 2 사진과 같은 object-fit:cover 자리로 키운 뒤, 실제 사진으로 바꿉니다.
        // 그림의 자리는 앨범 배치(style.css 의 .album · .print.tall9)에서 계산합니다: 앨범 한가운데, 너비는 앨범의 52% 에서 테두리 18px 을 뺀 값, 9:16
        const z = ease(seg(p1, Z0, Z1)), A = Math.min(.84 * brW, 430), w0 = .52 * A - 18, h0 = w0 * 16 / 9;
        const k = Math.max(brW / 9, brH / 16), cw = 9 * k, ch = 16 * k;
        const lerp = (x, y) => (x + (y - x) * z).toFixed(1) + "px";
        const box = { left: lerp((brW - w0) / 2, (brW - cw) / 2), top: lerp(.48 * brH - h0 / 2, (brH - ch) / 2), width: lerp(w0, cw), height: lerp(h0, ch) };
        bridgeImgs.forEach(im => Object.assign(im.style, box));
        bridgeImgs[0].style.opacity = 1 - ease(seg(p1, F0, F1));
        bridgeReal.style.opacity = ease(seg(p1, R0, R1));
        // 그림이 사라지기 시작할 때부터는 막을 바탕색으로 채워 아래의 인화 사진이 비치지 않게 합니다 (이때 그림은 이미 인화 사진을 다 덮고 있습니다)
        bridge.style.background = p1 >= F0 ? skyCss : "transparent";
      }
      if (o !== brOn) { brOn = o; bridge.style.visibility = o ? "visible" : "hidden"; bridge.style.opacity = o ? 1 : 0; st7.classList.toggle("set", o); }
    }
    // 장면 2 · 프러포즈 → 문밖 정원
    if (near(s2, 1)) { seqPropose && seqPropose.load(); seqDoor && seqDoor.load(); }
    if (near(s2, .2)) {
      const p = pinP(s2, .3);
      const pp = seg(p, 0, .56);
      if (pp !== lastPP) { lastPP = pp; shP.off(); }
      if (seqPropose) seqPropose.draw(pp); else imgPropose.style.transform = `scale(${(1 + .95 * ease(seg(p, 0, .56))).toFixed(4)})`;
      s2Line.style.opacity = seg(p, .12, .22) * (1 - seg(p, .44, .52));
      shotDoor.style.opacity = ease(seg(p, .5, .64));
      const dp = seg(p, .5, .96);
      if (dp !== lastDP) { lastDP = dp; shD.off(); }
      if (seqDoor) seqDoor.draw(dp); else imgDoor.style.transform = `scale(${(1 + .5 * seg(p, .5, 1)).toFixed(4)})`;
      // 문 프레임의 끝은 빛으로 하얗게 바뀝니다. 마지막에 바탕색 막을 덮고, 이름은 밝아진 화면 위에 먹색으로 나타납니다
      s2Wash.style.opacity = seqDoor ? seg(p, .92, .96) : 0;
      s2Names.style.opacity = seqDoor ? seg(p, .9, .96) : seg(p, .7, .78) * (1 - seg(p, .94, 1));
    }
    // 장면 3 · 두 사람 사진 세 겹: 배경은 천천히, 두 사람은 반대로, 앞쪽 잎사귀는 위로 빠르게 걷힌다
    if (!RM && near(garden, .2)) {
      const k = viewP(garden) - .5;
      T(gBg, `${(k * 56).toFixed(1)}px`, 1.04); T(gDuo, `${(k * -32).toFixed(1)}px`, 1.04); T(gLeaf, `${((k + .5) * -190).toFixed(1)}px`, 1.15);
    }
    // 장면 4 · 저녁 6시
    const b4 = B(s4), top4 = b4.top - SY, reached = RM ? top4 < vh * .6 : top4 < vh * .25, past = top4 + b4.h < vh;
    lights.classList.toggle("on", reached);
    if (near(s4, .2) || past) {
      const p = past ? 1 : pinP(s4, 1);
      clock.classList.toggle("off", p > .03 || past);
      sixT.style.opacity = seg(p, .03, .1); if (sixTb.textContent !== time) sixTb.textContent = time; sixT.classList.toggle("hit", p >= SIX_AT);
      setLit(1, seg(p, SIX_AT, .44)); setLit(0, seg(p, SIX_AT + .05, .5));
      sixD.style.opacity = seg(p, .4, .48); sixK.style.opacity = seg(p, .46, .54);
      const up = ease(seg(p, .52, .84));
      six.style.transform = `translate3d(0,${(-5 * up * vh / 100).toFixed(1)}px,0) scale(${1 - .34 * up})`;
      night.style.opacity = seg(p, .52, .62); night.style.transform = `translate(-50%,${(70 * (1 - up)).toFixed(2)}%)`;
    } else { clock.classList.remove("off"); setLit(0, 0); setLit(1, 0); }
    // 마지막 사진
    if (!RM && near(endPhoto, .2)) T(endImg, `${((viewP(endPhoto) - .5) * 90).toFixed(1)}px`);
    // 참석 의사 창: 첫 화면이 화면 밖으로 거의 다 넘어갔을 때(장면 1 시작 12% 화면 앞) ~ 장면 1 앞부분 사이에서 한 번 (바로가기로 다른 곳에 갔을 때는 띄우지 않음)
    if (!introShown && Date.now() - navJump > 2500) {
      const b1 = B(s1), y = scrollY;
      if (y >= b1.top - .12 * innerHeight && y < b1.top + .5 * (b1.h - innerHeight)) showRsvpIntro();
    }
  };

  /* 매 프레임: (휠을 굴렸다면 스크롤을 조금 옮기고) 따라가는 값 SY 를 실제 스크롤 쪽으로 당긴 뒤 화면을 그립니다.
   * SY 는 1초에 7배 비율로 좁혀 갑니다(약 0.14초 뒤처짐). 화면 2.5개 넘게 한꺼번에 옮겨졌으면(새로 고침, 주소로 이동) 바로 그 자리에서 그립니다. */
  const DAMP = 7;
  let raf = 0, lastT = 0;
  const frame = now => {
    raf = 0;
    // 첫 프레임의 시각은 앞선 프레임보다 이를 수 있어 시간 차가 음수가 됩니다 → 첫 프레임은 1/60초로
    const dt = lastT && now > lastT ? Math.min(.05, (now - lastT) / 1000) : 1 / 60; lastT = now;
    if (wT != null) {
      if (blocked()) wT = null;
      else {
        if (Math.abs(scrollY - wSet) > 1.5) { const d = scrollY - wSet; wCur += d; wT += d; }   // 다른 곳이 스크롤을 옮겼으면 맞서지 않고 그만큼 따라감
        wT = clamp(wT, 0, maxY());
        wCur += (wT - wCur) * (1 - Math.exp(-dt / TAU_WHEEL));
        if (Math.abs(wT - wCur) < .35) wCur = wT;
        window.scrollTo(0, wCur); wSet = scrollY;
        if (wCur === wT) wT = null;
      }
    }
    if (root.scrollHeight !== lastSH) measure();
    const y = scrollY, gap = y - SY;
    SY = RM || Math.abs(gap) < .4 || Math.abs(gap) > 2.5 * vh ? y : SY + gap * (1 - Math.exp(-DAMP * dt));
    update();
    if (SY !== y || wT != null) raf = requestAnimationFrame(frame);
    else { lastT = 0; shP.arm(); shD.arm(); }   // 멈췄습니다
  };
  function req() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener("scroll", req, { passive: true });
  let rw = innerWidth;
  addEventListener("resize", () => { if (innerWidth === rw && Math.abs(innerHeight - vh) < 140) { vh = innerHeight; measure(); fitSeq(seqPropose); fitSeq(seqDoor); return req(); } rw = innerWidth; layout(); req(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); req(); }).observe($("#app"));
  addEventListener("load", () => { layout(); req(); gUpdate(); });
  layout(); SY = scrollY; update(); gUpdate();
})();
