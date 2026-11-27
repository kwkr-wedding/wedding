(() => {
  const C = window.WEDDING;
  // V13 · V12 의 타임라인을 다듬은 판. 설정은 config.js 의 v4 → v9 → v12 → v13 순으로 덮어씁니다. V13 에서 새로 만든 사진·영상은 media/ 에 있고,
  // 그대로 쓰는 것은 ../v4/assets/ · ../v8/media/ · ../v9/media/ · ../v10/thumb/ · ../v11/media/ · ../v12/media/ 에서 읽습니다.
  // 사진은 수정_2차 폴더의 가장 새 수정본(번호가 가장 큰 _n)을 씁니다
  const V = Object.assign({
    rsvpPopup: false,
    sequences: {},   // { door: { count } } : 스크롤로 넘기는 프레임 묶음
  }, C.v4 || {}, C.v9 || {}, C.v12 || {}, C.v13 || {});
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t * t * (3 - 2 * t);
  const el = id => document.getElementById(id);
  const QS = new URLSearchParams(location.search);
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches || QS.has("still");
  // 신부측 링크(주소 끝 ?side=bride): 첫 화면은 신부 이름 먼저, 맨 아래는 신랑 이름 먼저. 나머지는 같습니다.
  const BRIDE = QS.get("side") === "bride";
  const root = document.documentElement;
  /* 화면 높이 단위 고정: 카카오톡 · 네이버 · 인스타그램 같은 앱 안의 브라우저는 위아래 도구 막대가 나타나고 사라질 때마다
   * 화면 높이 단위(vh) 자체가 바뀝니다. 그러면 vh 로 길이를 정한 장면들이 한꺼번에 늘었다 줄어, 위로 올리기 시작할 때(도구 막대가 다시 나타날 때)
   * 보던 자리가 화면 반 장 넘게 튀었습니다. 문서 길이에 영향을 주는 높이(--fvh · --fsvh)는 처음 잰 px 로 고정하고,
   * 화면 너비가 바뀔 때(가로 · 세로 돌리기)만 다시 잽니다. 일반 사파리 · 크롬에서는 처음 잰 값이 원래 값과 같아 달라지는 것이 없습니다. */
  const fixVh = () => {
    const t = document.createElement("i"); t.style.cssText = "position:absolute;left:0;top:0;width:0;visibility:hidden;pointer-events:none;height:100vh";
    root.appendChild(t); const a = t.offsetHeight; t.style.height = "calc(100 * var(--vh))"; const s = t.offsetHeight; t.remove();
    if (a > 0) root.style.setProperty("--fvh", a / 100 + "px");
    if (s > 0) root.style.setProperty("--fsvh", s / 100 + "px");
  };
  fixVh();
  { let fx = innerWidth; addEventListener("resize", () => { if (innerWidth !== fx) { fx = innerWidth; fixVh(); } }); }
  if (RM) root.classList.add("rm");
  document.addEventListener("touchstart", () => {}, { passive: true });   // 아이폰에서 누르는 동안의 반응(:active)이 보이도록

  /* ---------- 뒤로 가기 ----------
   * 사진 크게 보기나 창이 열려 있을 때 휴대폰의 뒤로 가기를 누르면, 청첩장이 닫히지 않고 그 창만 닫힙니다.
   * 창을 열 때 방문 기록을 한 칸 쌓고(layerOpen), 화면에서 닫으면 그 칸을 되돌립니다(layerClose).
   * 브라우저의 스크롤 복원은 꺼 두고(장면 높이가 불러오는 중에 바뀌어 엉뚱한 곳으로 가기 때문), 새로 고침하면 아래 "보던 자리"에서 직접 되돌립니다. */
  try { history.scrollRestoration = "manual"; } catch {}
  /* 보던 자리: 내리는 동안 위치를 이 탭의 sessionStorage 에 적어 두고, 새로 고침했을 때만 그 자리로 돌아갑니다
   * (처음 여는 링크 · 다른 탭 · 공유받은 주소는 그대로 맨 위에서 시작). 돌아갈 때는 처음 사진 세 장을 건너뜁니다(index.html). */
  const POS_KEY = "pos:" + location.pathname + location.search;
  const navType = (() => { try { const n = performance.getEntriesByType("navigation")[0]; return n ? n.type : ""; } catch { return ""; } })();
  let restoreY = null;
  try { if (navType === "reload" && !location.hash) { const v = parseFloat(sessionStorage.getItem(POS_KEY)); if (v > 0) restoreY = v; } } catch {}
  let posT = 0;
  const savePos = () => { try { sessionStorage.setItem(POS_KEY, String(Math.round(scrollY))); } catch {} };
  addEventListener("scroll", () => { clearTimeout(posT); posT = setTimeout(savePos, 250); }, { passive: true });
  addEventListener("pagehide", savePos);
  let eatPop = 0, eatT = 0;
  const layerOpen = () => { try { history.pushState({ layer: 1 }, "", location.href); } catch {} };
  const layerClose = () => {
    try { if (!(history.state && history.state.layer)) return; eatPop++; history.back(); } catch { return; }
    clearTimeout(eatT); eatT = setTimeout(() => { eatPop = 0; }, 600);   // 되돌린 기록의 알림이 오지 않았더라도 다음 뒤로 가기를 삼키지 않도록
  };
  addEventListener("popstate", () => {
    if (eatPop) { eatPop--; return; }
    if (lbOpen) return closeLb(true);
    const m = $$(".modal:not([hidden]):not(.out)").pop(); if (m) closeModal(m, true);
  });

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
  $$("[data-bind]").forEach(e => e.textContent = bind[e.dataset.bind] ?? "");
  // 날짜·시간이 있는 곳에는 장소도 함께 적습니다
  const venueKo = `${C.venue.name} ${C.venue.hall}`, venueEnFull = `${C.venue.nameEn} · ${C.venue.hallEn}`;
  $("#heroDate").innerHTML = `${esc(`${ymd} · ${DOW_EN}, ${hourEn}`)}<span class="hero-venue">${esc(venueEnFull)}</span>`;
  const greeting = $("#greeting");
  greeting.innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  $("#parG").textContent = `${C.groom.father.name} · ${C.groom.mother.name}의`;
  $("#parB").textContent = `${C.bride.father.name} · ${C.bride.mother.name}의`;
  $("#relG").textContent = C.groom.relation; $("#relB").textContent = C.bride.relation;
  $("#sixD").innerHTML = (V.sixLine || "With great pleasure,\nwe cordially invite you to our wedding").split("\n").map(esc).join("<br>");   // 저녁 6시 사진 위의 초대 문구(날짜 · 일시 · 장소 세 줄을 대신함)
  $("#sixK").innerHTML = `${esc(whenKo)}<span class="six-v">${esc(venueKo)}</span>`;

  /* 한 줄에 들어가야 하는 글: 칸보다 넓으면 글자 크기를 줄여 맞춥니다 (인사말은 네 줄이 같은 크기로, 가장 긴 줄에 맞춤).
   * 글꼴이 늦게 도착하면 너비가 달라지므로 글꼴이 준비된 뒤와 화면 너비가 바뀔 때 다시 맞춥니다. */
  const fitOne = (box, lines, max, min) => {
    box.style.fontSize = max + "px";
    const avail = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
    const need = Math.max(...lines.map(l => l.scrollWidth));
    if (avail > 0 && need > avail) box.style.fontSize = Math.max(min, Math.floor(max * avail / need * 20) / 20) + "px";
  };
  const fitAll = () => {
    fitOne(greeting, $$("p", greeting), 16.5, 10.5);
    root.style.setProperty("--gfs", getComputedStyle(greeting).fontSize);   // 저녁 6시 사진 위 초대 문구를 인사말과 같은 크기로
    $$(".fit1").forEach(s => { s.style.fontSize = ""; const p = s.parentElement, w = p.clientWidth, fs = parseFloat(getComputedStyle(p).fontSize); if (w > 0 && s.scrollWidth > w) s.style.fontSize = Math.max(parseFloat(s.dataset.min) || 10.5, Math.floor(fs * w / s.scrollWidth * 20) / 20) + "px"; });
  };
  /* 여러 줄을 같은 크기로 한 줄씩: data-fit 이 붙은 상자 안의 줄(.ln)이 모두 한 줄에 들어가도록 가장 긴 줄에 맞춰 글자 크기를 줄입니다(가장 작게는 data-fit px). 회신 창의 지정석 안내에 씁니다. */
  const fitGroups = () => $$("[data-fit]").forEach(box => {
    box.style.fontSize = ""; const w = box.clientWidth; if (!w) return;
    const fs = parseFloat(getComputedStyle(box).fontSize); let m = 0;
    [...box.children].forEach(c => { m = Math.max(m, c.scrollWidth); });
    if (m > w) box.style.fontSize = Math.max(parseFloat(box.dataset.fit) || 9, Math.floor(fs * w / m * 20) / 20) + "px";
  });
  fitAll(); fitGroups();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGroups);
  { let gw = innerWidth; addEventListener("resize", () => { if (innerWidth !== gw) { gw = innerWidth; fitGroups(); } }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  /* ---------- 달력 · 남은 날 ---------- */
  $("#calTitle").textContent = `${Y}.${pad(M)}.${pad(DD)}`;
  $("#calSub").textContent = `${DOW_KO}요일 ${hourKo}`;   // 달력 위에는 장소를 적지 않습니다
  const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let g = ["일", "월", "화", "수", "목", "금", "토"].map((d, i) => `<div class="dow${i === 0 ? " sun" : ""}">${d}</div>`).join("");
  for (let i = 0; i < first; i++) g += "<div></div>";
  for (let d = 1; d <= days; d++) g += `<div class="d${(first + d - 1) % 7 === 0 ? " sun" : ""}${d === DD ? " day" : ""}"${d === DD ? ` aria-label="${M}월 ${d}일 예식일"` : ""}>${d}</div>`;
  $("#calendar").innerHTML = `<div class="cal-grid" role="img" aria-label="${Y}년 ${M}월 달력, 예식일 ${DD}일 ${DOW_KO}요일">${g}</div>`;
  const kstToday = () => { const t = new Date(Date.now() + 9 * 3600e3); t.setUTCHours(0, 0, 0, 0); return t; };
  const dd = Math.round((Date.UTC(Y, M - 1, DD) - kstToday()) / 864e5);
  // 이름 순서는 규로, 경원 (뒤에 붙는 조사는 앞 글자의 받침에 맞춥니다: 경원이 · 규로가)
  const n1 = esc(C.bride.name.slice(1)), n2 = esc(C.groom.name.slice(1));
  const iga = w => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? "이" : "가"); };
  $("#ddayText").innerHTML = dd > 0 ? `${n1}, ${n2}의 결혼식이 <b>${dd}일</b> 남았습니다.`
    : dd === 0 ? `오늘, ${n1}, ${iga(n2)} 결혼합니다.` : `${n1}, ${iga(n2)} 결혼한 지 <b>${-dd}일</b> 되었습니다.`;

  const end = new Date(D.getTime() + (C.durationMinutes || 180) * 6e4);
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const evTitle = `${C.groom.name} ♥ ${C.bride.name} 결혼식`;
  const loc = `${C.venue.name} ${C.venue.hall} (${C.venue.address})`;
  const shareUrl = location.href.split(/[?#]/)[0] + (BRIDE ? "?side=bride" : "");
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
  // 지도: 네이버 지도(../nmap.js). 가까이 오면 불러오고, 한 번 눌러야 움직이며, 화면 밖으로 나가면 다시 잠급니다
  const mapEl = $("#map"), nmap = weddingMap($("#mapBox"), { name: C.venue.name, address: C.venue.address, lat: C.venue.lat, lng: C.venue.lng });
  $("#mapGuard").onclick = () => { mapEl.classList.add("live"); nmap.unlock(); };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); nmap.load(); } }, { rootMargin: "150% 0px" }).observe(mapEl);
    new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && mapEl.classList.contains("live")) { mapEl.classList.remove("live"); nmap.lock(); } })).observe(mapEl);
  } else nmap.load();
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/to/${q},${C.venue.lat},${C.venue.lng}`;
  $("#navTmap").href = `tmap://route?goalname=${q}&goalx=${C.venue.lng}&goaly=${C.venue.lat}`;
  $("#navTmap").addEventListener("click", () => setTimeout(() => { if (!document.hidden) toast("티맵 앱이 설치되어 있어야 합니다"); }, 1500));
  if (C.venue.tel) { $("#venueTel").textContent = `Tel. ${C.venue.tel}`; $("#venueTel").href = `tel:${C.venue.tel}`; }
  $("#addrCopy").onclick = () => copy(C.venue.address, "주소가 복사되었습니다");
  $("#transport").innerHTML = C.venue.transport.map(t => `<div class="t"><h4>${esc(t.title)}</h4><ul>${t.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`).join("");

  /* ---------- 사진: 세 칸 격자 (V10 과 같은 배치 · 같은 사진) ----------
   * 사진별 가로÷세로 비율과 대표색(불러오기 전에 깔아 두는 바탕색). 사진을 바꾸면 여기와 ../v10/thumb/ 의 작은 그림도 함께 고칩니다. */
  const META = { "01.webp": [.6669, "#a5a7a8"], "02.webp": [.6669, "#44474a"], "03.webp": [.6668, "#9ea79a"], "04.webp": [.6669, "#9c9f95"], "05.webp": [1.4995, "#b0afa7"], "06.webp": [1.4995, "#878787"],
    "07.webp": [.6669, "#6d6d6d"], "08.webp": [.6581, "#888888"], "09.webp": [.6669, "#cfcfcf"], "10.webp": [.6669, "#e2e2e1"], "11.webp": [.6669, "#c7c7c6"], "12.webp": [.6669, "#c7c6c6"],
    "13.webp": [.6669, "#c2c4c5"], "14.webp": [.6669, "#c3c6c7"], "15.webp": [.6669, "#9d9d9d"], "16.webp": [.6669, "#787a5d"], "17.webp": [.6669, "#4f4f36"], "18.webp": [.6669, "#3d3d3d"],
    "19.webp": [.6667, "#848587"], "20.webp": [.6667, "#7b7b7b"], "21.webp": [.6667, "#5f6244"], "22.webp": [.6667, "#979590"],
    "23.webp": [1.4995, "#8a8582"], "24.webp": [0.6669, "#85868a"], "25.webp": [0.6669, "#9da49d"], "26.webp": [0.6669, "#8c8d8d"], "27.webp": [0.6669, "#a7a7a7"], "28.webp": [0.6669, "#7b7b7b"], "29.webp": [0.6669, "#d1d4d5"], "31.webp": [0.6669, "#949499"] };
  const gConf = (C.v12 && C.v12.gallery) || (C.v10 && C.v10.gallery) || Object.keys(META);
  const G = gConf.map(x => typeof x === "string" ? { f: x, span: 1 } : { f: x.f, span: x.span || 1, half: !!x.half, big: !!x.big, pair: x.pair || "", cols: x.cols || 0, fill: !!x.fill, pos: x.pos || "" });
  // 수정_2차 폴더에 더 새 수정본(_3 · _4)이 생긴 사진은 V13 의 media/gallery · media/thumb 에서 읽습니다
  // (03 = 2030 무광HJH_1593_3, 05 = CYR_0735_4, 12 = HJH_3386_3, 13 = HJH_0182_3). 나머지는 V4 · V10 것 그대로(이미 가장 새 수정본)
  const NEWER = new Set(["03.webp", "05.webp", "12.webp", "13.webp", "19.webp", "20.webp", "22.webp", "23.webp", "24.webp", "25.webp", "26.webp", "27.webp", "28.webp", "29.webp", "31.webp"]);
  const full = f => NEWER.has(f) ? `media/gallery/${f}?v=${f === "21.webp" ? 2 : 1}` : `../v4/assets/gallery/${f}`;
  const thumb = p => p.pair === "R" && p.f === "22.webp" ? `media/gallery/22x.webp?v=1` : p.pair === "L" && p.f === "19.webp" ? `media/gallery/19x.webp?v=1` : p.span > 1 || p.half || p.big || p.pair || p.cols ? full(p.f) : NEWER.has(p.f) ? `media/thumb/${p.f}?v=${p.f === "21.webp" ? 2 : 1}` : `../v10/thumb/${p.f}`;   // 한 줄 전체를 쓰는 사진은 큰 그림 그대로
  const grid = $("#gGrid");
  grid.innerHTML = G.map((p, i) => `<button class="g${p.span > 1 ? " s" + p.span : ""}${p.half ? " gh" : ""}${p.big ? " gb" : ""}${p.pair ? " gp" + p.pair : ""}${p.fill ? " gf" : ""}" data-i="${i}" style="${p.cols ? `grid-column:span ${p.cols};` : ""}--c:${(META[p.f] || [])[1] || "#2a302c"}" aria-label="사진 ${i + 1} 크게 보기"><img src="${esc(thumb(p))}" alt="웨딩 사진 ${i + 1}" loading="lazy" decoding="async" draggable="false"${p.pos ? ` style="object-position:${p.pos}"` : ""}></button>`).join("");
  if (!G.length) $("#gallery").hidden = true;
  const tiles = $$(".g", grid);
  $$("img", grid).forEach(im => { const ok = () => im.classList.add("ok"); if (im.complete && im.naturalWidth) ok(); else im.addEventListener("load", ok, { once: true }); });

  /* ---------- 사진: 크게 보기 ----------
   * 누른 사진이 그 자리에서 커지며 열리고, 좌우로 넘기며(한 번에 한 장), 위나 아래로 밀거나 누르면 원래 자리로 돌아가며 닫힙니다.
   * 두 손가락 확대는 되지 않습니다. 넘겨 본 사진이 격자에서 화면 밖에 있으면 뒤에서 격자도 그 사진 쪽으로 옮겨 둡니다. */
  const lb = $("#lb"), lbTrack = $("#lbTrack"), lbBg = $("#lbBg"), lbPrev = $("#lbPrev"), lbNext = $("#lbNext");
  lbTrack.innerHTML = G.map((p, i) => `<div class="lb-slide"><img alt="웨딩 사진 ${i + 1}" decoding="async" draggable="false"></div>`).join("");
  $("#lbTotal").textContent = G.length;
  const lbImgs = $$("img", lbTrack);
  let lbI = 0, lbOpen = false, lbBusy = false, lbPend = 0, lbRaf = 0, lbFocus = null;
  const ratio = i => (META[G[i].f] || [])[0] || (tiles[i].querySelector("img").naturalWidth / tiles[i].querySelector("img").naturalHeight) || 2 / 3;
  const lbLoad = i => { const im = lbImgs[i]; if (!im || im.dataset.on) return; im.dataset.on = "1"; im.style.backgroundImage = `url("${thumb(G[i])}")`; im.src = full(G[i].f); };
  // 크게 보기에서 사진이 놓이는 자리와, 격자 칸에서 그 자리까지의 움직임
  const flipFrames = i => {
    const t = tiles[i].getBoundingClientRect();
    if (t.bottom < 8 || t.top > innerHeight - 8 || !t.width) return null;   // 격자 칸이 화면 밖이면 옮겨 가는 움직임 없이
    const cs = getComputedStyle(lbImgs[i].parentElement), W = lb.clientWidth, top = parseFloat(cs.paddingTop) || 0, Hh = lb.clientHeight - top - (parseFloat(cs.paddingBottom) || 0);
    const r = ratio(i), w = Math.min(W, Hh * r), h = w / r;
    const s = Math.max(t.width / w, t.height / h);
    const dx = t.left + t.width / 2 - W / 2, dy = t.top + t.height / 2 - (top + Hh / 2);
    const ix = Math.max(0, (W - t.width / s) / 2), iy = Math.max(0, (Hh - t.height / s) / 2);
    return [{ transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${s.toFixed(4)})`, clipPath: `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px)` },
      { transform: "translate(0px,0px) scale(1)", clipPath: `inset(${((Hh - h) / 2).toFixed(1)}px ${((W - w) / 2).toFixed(1)}px)` }];
  };
  const setIdx = i => {
    lbI = clamp(i, 0, G.length - 1);
    $("#lbCur").textContent = lbI + 1; lbPrev.disabled = lbI === 0; lbNext.disabled = lbI === G.length - 1;
    [lbI, lbI + 1, lbI - 1].forEach(lbLoad);
    tiles.forEach((t, k) => t.classList.toggle("hide", k === lbI));   // 크게 보는 사진의 격자 칸은 비워 둡니다 (밀어 닫을 때 같은 사진이 두 장 보이지 않게)
    const t = tiles[lbI].getBoundingClientRect();
    if (t.top < 20 || t.bottom > innerHeight - 70) tiles[lbI].scrollIntoView({ block: "center" });
  };
  const openLb = i => {
    if (lbOpen) return;
    lbOpen = true; lbPend = 0; lbFocus = document.activeElement; lb.hidden = false; document.body.classList.add("locked"); layerOpen();
    lbTrack.style.scrollSnapType = "none"; lbTrack.scrollLeft = i * lbTrack.clientWidth; lbTrack.style.scrollSnapType = "";
    setIdx(i);
    const fr = RM ? null : flipFrames(i), im = lbImgs[i];
    void lb.offsetWidth; lb.classList.add("show");
    if (fr && im.animate) {
      lbBusy = true;
      const a = im.animate(fr, { duration: 460, easing: "cubic-bezier(.2,.8,.2,1)" });
      // 열리는 도중에 닫기를 눌렀으면 다 열린 뒤에 닫습니다
      a.onfinish = a.oncancel = () => { lbBusy = false; if (lbPend) { const fp = lbPend === 2; lbPend = 0; closeLb(fp); } };
    }
    $("#lbClose").focus({ preventScroll: true });
  };
  function closeLb(fromPop) {
    if (!lbOpen) return;
    if (lbBusy) { if (!lbPend) lbPend = fromPop === true ? 2 : 1; return; }
    lbBusy = true; if (fromPop !== true) layerClose();
    const i = lbI, im = lbImgs[i], cur = im.style.transform;
    lbBg.style.transition = lbBg.style.opacity = ""; lb.classList.remove("show");
    const done = () => {
      lb.hidden = true; lbOpen = lbBusy = false; tiles.forEach(t => t.classList.remove("hide")); im.style.transform = im.style.transition = "";
      unlock(); if (lbFocus && lbFocus.focus) lbFocus.focus({ preventScroll: true });
    };
    const fr = RM || !im.animate ? null : flipFrames(i);
    if (!fr) {
      if (!im.animate || RM) return done();
      const a = im.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-in" }); a.onfinish = a.oncancel = done; return;
    }
    const a = im.animate([cur ? { transform: cur, clipPath: fr[1].clipPath } : fr[1], fr[0]], { duration: 380, easing: "cubic-bezier(.3,.1,.2,1)", fill: "forwards" });
    a.onfinish = () => { done(); a.cancel(); };
  }
  grid.addEventListener("click", e => { const b = e.target.closest(".g"); if (b) openLb(+b.dataset.i); });
  lbTrack.addEventListener("scroll", () => { if (!lbRaf) lbRaf = requestAnimationFrame(() => { lbRaf = 0; if (!lbOpen) return; const i = Math.round(lbTrack.scrollLeft / lbTrack.clientWidth); if (i !== lbI) setIdx(i); }); }, { passive: true });
  lbTrack.addEventListener("click", () => closeLb());
  $("#lbClose").addEventListener("click", () => closeLb());
  const lbGo = d => lbTrack.scrollTo({ left: clamp(lbI + d, 0, G.length - 1) * lbTrack.clientWidth, behavior: RM ? "auto" : "smooth" });
  lbPrev.addEventListener("click", () => lbGo(-1)); lbNext.addEventListener("click", () => lbGo(1));
  addEventListener("resize", () => { if (lbOpen) lbTrack.scrollLeft = lbI * lbTrack.clientWidth; });
  {
    let y0 = null, x0 = 0, t0 = 0, dy = 0, drag = false;
    lbTrack.addEventListener("touchstart", e => {
      if (e.touches.length !== 1 || lbBusy) { y0 = null; return; }
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = performance.now(); dy = 0; drag = false;
    }, { passive: true });
    lbTrack.addEventListener("touchmove", e => {
      if (y0 == null || e.touches.length !== 1) return;
      const t = e.touches[0]; dy = t.clientY - y0;
      if (!drag) { if (Math.abs(dy) < 8 || Math.abs(dy) < Math.abs(t.clientX - x0) * 1.2) return; drag = true; lbImgs[lbI].style.transition = ""; lbBg.style.transition = "none"; lb.classList.add("drag"); }
      const k = Math.min(1, Math.abs(dy) / 320);
      lbImgs[lbI].style.transform = `translate3d(0,${dy.toFixed(1)}px,0) scale(${(1 - .14 * k).toFixed(3)})`;
      lbBg.style.opacity = (1 - .75 * k).toFixed(3);
    }, { passive: true });
    const endDrag = () => {
      if (y0 == null) return; y0 = null;
      if (!drag) return; drag = false; lb.classList.remove("drag");
      if (Math.abs(dy) > 70 || (performance.now() - t0 < 300 && Math.abs(dy) > 30)) return closeLb();
      const im = lbImgs[lbI]; im.style.transition = "transform .35s cubic-bezier(.2,.7,.2,1)"; im.style.transform = ""; lbBg.style.transition = ""; lbBg.style.opacity = "";
    };
    lbTrack.addEventListener("touchend", endDrag, { passive: true }); lbTrack.addEventListener("touchcancel", endDrag, { passive: true });
  }
  document.addEventListener("contextmenu", e => { if (e.target.closest("img,video,canvas")) e.preventDefault(); });
  // 사진·영상이 있는 칸에서는 두 손가락 확대가 되지 않습니다 (style.css 의 touch-action 과 함께)
  const PHOTO = ".pin,.garden,.person .ph,.print,.grid,.lb";
  const onPhoto = e => e.target && e.target.closest && e.target.closest(PHOTO);
  ["gesturestart", "gesturechange"].forEach(t => document.addEventListener(t, e => { if (onPhoto(e)) e.preventDefault(); }, { passive: false }));
  document.addEventListener("wheel", e => { if (e.ctrlKey && onPhoto(e)) e.preventDefault(); }, { passive: false });

  /* ---------- 마음 전하실 곳 ----------
   * 계좌 위에는 이름만 적습니다(신랑 · 신부 같은 구분 없이). config.js 의 v13.accounts 에 적은 계좌(최영선)는 V13 에서만 더해집니다. */
  const accGroup = (title, list) => {
    const rows = list.filter(a => a.number);
    return `<div class="acc-group"><button class="acc-head" aria-expanded="false">${title}</button><div class="acc-body">${rows.map(a => `
      <div class="acc-row"><div><small>${esc(a.name)}</small><div class="num">${esc(a.bank)} <b>${esc(a.number)}</b></div></div>
      <button class="mini" data-acc="${esc(`${a.bank} ${a.number} ${a.name}`)}">복사</button>${a.kakaopay ? `<a class="mini" href="${esc(a.kakaopay)}" target="_blank" rel="noopener">카카오페이</a>` : ""}</div>`).join("")}</div></div>`;
  };
  const accMore = (C.v13 && C.v13.accounts) || {};
  const withMore = (list, side) => list.map(a => Object.assign({}, a, (accMore[side] || {})[a.name] || {}));
  const accG = withMore(C.accounts.groom || [], "groom"), accB = withMore(C.accounts.bride || [], "bride");
  const hasG = accG.some(a => a.number), hasB = accB.some(a => a.number);
  if (window.NOACC || (!hasG && !hasB)) { $("#accountsSec").hidden = true; $$('.quick a[href="#accountsSec"]').forEach(a => a.hidden = true); $("#quick").style.gridTemplateColumns = "repeat(3,auto)"; }
  $("#accounts").innerHTML = (hasG ? accGroup("신랑 측 계좌번호", accG) : "") + (hasB ? accGroup("신부 측 계좌번호", accB) : "");
  $("#accounts").onclick = e => {
    const h = e.target.closest(".acc-head");
    if (h) { const grp = h.parentElement; grp.classList.toggle("open"); h.setAttribute("aria-expanded", grp.classList.contains("open")); }
    const c = e.target.closest("[data-acc]");
    if (c) {
      copy(c.dataset.acc, "계좌번호가 복사되었습니다");
      c.textContent = "복사됨"; c.classList.add("done"); clearTimeout(c._t); c._t = setTimeout(() => { c.textContent = "복사"; c.classList.remove("done"); }, 1800);
    }
  };

  /* ---------- 모달 ---------- */
  function unlock() {
    if (!$$(".modal:not([hidden])").length && lb.hidden) document.body.classList.remove("locked");
    if (introFlow) setTimeout(() => { if (introFlow && !$$(".modal:not([hidden])").length) { introFlow = false; holdY = null; root.classList.remove("hold"); afterIntro(); } }, 60);
  }
  // keep: 다른 창에서 바로 이어 열 때(안내 창 → 양식)는 앞 창이 쌓아 둔 방문 기록 한 칸을 그대로 이어 씁니다
  function openModal(sel, keep) { const m = $(sel); m.classList.remove("out"); m.hidden = false; document.body.classList.add("locked"); if (!keep) layerOpen(); fitGroups(); }
  function closeModal(m, fromPop) {
    if (m.hidden || m.classList.contains("out")) return;
    if (fromPop !== true) layerClose();
    if (RM) { m.hidden = true; return unlock(); }
    m.classList.add("out");   // 살짝 내려가며 사라진 뒤에 닫힙니다
    setTimeout(() => { m.hidden = true; m.classList.remove("out"); unlock(); }, 230);
  }
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", e => {
    if (lbOpen) { if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") lbGo(-1); else if (e.key === "ArrowRight") lbGo(1); return; }
    if (e.key === "Escape") $$(".modal:not([hidden])").forEach(m => closeModal(m));
  });

  /* ---------- 참석 회신 (다른 버전과 같은 시트에 기록) ---------- */
  const API = C.appsScriptUrl;
  const post = payload => fetch(API, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  if (C.rsvpDeadline) {
    const d = new Date(C.rsvpDeadline + "T00:00:00+09:00"), k = new Date(d.getTime() + 9 * 3600e3);
    // 한 줄로: 칸보다 길면 글자 크기를 줄여 맞춥니다(fitAll)
    $("#rsvpDeadline").innerHTML = `<span class="fit1" data-min="9">소중한 걸음에 감사드리며, ${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일까지 회신해 주시면 감사하겠습니다.</span>`;
  }
  $("#rsvpOpen").onclick = () => openModal("#rsvpModal");
  const rf = $("#rsvpForm");
  // 식사 여부는 참석하시는 분께만 여쭙니다
  rf.addEventListener("change", () => rf.classList.toggle("absent", rf.attend.value === "불참"));
  rf.addEventListener("submit", async e => {
    e.preventDefault();
    const data = { type: "rsvp", side: rf.side.value, attend: rf.attend.value, name: rf.name.value.trim(), phone: rf.phone.value.trim(),
      meal: rf.attend.value === "참석" ? rf.meal.value : "-", note: rf.note.value.trim() };
    if (!data.name) return;
    if (API) {
      const btn = rf.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "전달 중…";
      try { await post(data); if (introFlow) thanked = true; else toast("소중한 회신 감사합니다"); rf.reset(); rf.classList.remove("absent"); closeModal($("#rsvpModal")); store.set("rsvp_done", "1"); }
      catch { toast("전송에 실패했어요. 잠시 후 다시 시도해주세요"); }
      finally { btn.disabled = false; btn.textContent = "전달하기"; }
    } else if (C.rsvpFallbackPhone) {
      const body = `[참석 회신] ${data.side} / ${data.name} / ${data.attend}${data.attend === "참석" ? ` / 식사 ${data.meal}` : ""}${data.note ? ` / ${data.note}` : ""}`;
      location.href = `sms:${C.rsvpFallbackPhone}${/iPhone|iPad/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    } else toast("참석 회신 기능이 아직 준비 중입니다");
  });
  /* 첫 화면이 거의 넘어갈 때(내려가는 길에 한 번) 참석 의사 안내 창을 먼저 띄웁니다 (v4.rsvpPopup: true).
   * 회신을 마치거나, "오늘 하루 보지 않기"·닫기로 넘기면 "이어서 화면을 내려주세요!"가 잠깐 뜨고
   * 화면이 저절로 타임라인의 첫 사진까지 천천히 내려갑니다. 이미 회신했거나 오늘 넘긴 분, 예식이 지난 뒤에는 뜨지 않습니다. */
  $("#popWhen").textContent = `${Y}. ${pad(M)}. ${pad(DD)} (${DOW_KO}) ${hourKo}`;
  const todayKey = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  let introShown = false, introFlow = false, thanked = false, navJump = 0, holdY = null, introTop = false;
  // 바로가기·링크로 다른 곳에 이동하는 중에는 띄우지 않습니다
  document.addEventListener("click", e => { if (e.target.closest('a[href^="#"]')) navJump = Date.now(); });
  const showRsvpIntro = (atTop = false) => {   // atTop: 처음의 사진 세 장이 끝난 직후, 첫 화면 그대로 띄움(뒤 화면을 움직이지 않음)
    if (introShown || !V.rsvpPopup || Date.now() > D.getTime()) return;
    introShown = true;
    if (store.get("rsvp_done") || store.get("rsvp_skip") === todayKey()) return;
    if ($$(".modal:not([hidden])").length || !lb.hidden) return;
    introFlow = true; thanked = false; introTop = atTop;
    // 창이 떠 있는 동안: 손으로는 더 내려가지 않게 막고(관성도 멈춤), 뒤 화면은 첫 화면이 완전히 넘어가는 지점(타임라인 시작)까지
    // 천천히 감속하며 저절로 내려갑니다. 타임라인의 글과 사진은 창을 닫은 뒤에 나옵니다.
    holdY = atTop ? Math.round(scrollY) : Math.round(B(s1).top);
    root.classList.add("hold");
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
  // 화면을 잠가 두는 동안(참석 의사 창 · 처음의 사진 세 장)에는 손가락·휠로 움직이지 않습니다
  const holdBlock = e => { if ((holdY != null || introOn) && !e.target.closest(".modal .sheet")) e.preventDefault(); };
  addEventListener("touchmove", holdBlock, { passive: false });
  addEventListener("wheel", holdBlock, { passive: false });
  addEventListener("keydown", e => { if (introOn && [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home"].includes(e.key)) e.preventDefault(); });
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
   * 마우스 휠만 굴린 만큼 부드럽게 이어 줍니다(약 0.2초). 동작 줄이기, 창·크게 보기가 열려 있을 때, 화면 확대 중에는 쓰지 않습니다. */
  const vvp = window.visualViewport;
  const TAU_WHEEL = .19;
  let wT = null, wCur = 0, wSet = 0;   // 휠: 가려는 위치 · 지금 위치 · 마지막으로 옮겨 둔 위치
  function smoothStop() { wT = null; }
  const maxY = () => root.scrollHeight - innerHeight;
  const blocked = () => holdY != null || introOn || root.classList.contains("hold") || document.body.classList.contains("locked") || (vvp && vvp.scale > 1.01);
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
    // '이어서 화면을 내려주세요!' 안내는 뺐습니다(첫 화면의 '천천히 내려 주세요'와 겹쳐 보여서). 회신했으면 감사 인사만 잠깐
    if (thanked) toast("소중한 회신 감사합니다");
    // 타임라인의 첫 사진이 화면 가운데에 와서 영상이 시작되는 지점까지
    const b = stops[0].box, target = Math.round(Math.max(B(s1).top, b.top + b.h / 2 - vh * .5 + 14));
    req();
    if (!introTop && target > scrollY) setTimeout(() => glideTo(target, Math.min(2200, 1000 + (target - scrollY) * .8)), 450);
  };
  $("#rsvpIntroGo").onclick = () => { closeModal($("#rsvpIntro"), true); openModal("#rsvpModal", true); };
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
          imageUrl: (C.siteUrl || shareUrl) + "v13/media/og.jpg?v=1", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
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
  $$("#greeting p").forEach((e, i) => e.style.transitionDelay = `${i * 260}ms`);
  if ("IntersectionObserver" in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    // 화면보다 훨씬 긴 덩어리(갤러리 격자 등)는 18% 가 한꺼번에 화면에 들어올 수 없어 영영 나타나지 않던 문제
    // (예: 1440×760 창에서 갤러리 격자 4174px → 최대 16.6%) → 긴 것은 조금이라도 들어오면 나타나게 따로 봅니다
    const ioTall = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ioTall.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    $$(".rv,#greeting p").forEach(e => (e.offsetHeight > innerHeight * .6 ? ioTall : io).observe(e));
    // 혼주 소개의 신랑·신부 사진은 처음 들어올 때 좌우에서 모입니다
    const ioX = new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio >= .18) { e.target.classList.add("in"); ioX.unobserve(e.target); } }), { threshold: [0, .18] });
    $$(".rv-x").forEach(e => ioX.observe(e));
  } else $$(".rv,.rv-x,#greeting p").forEach(e => e.classList.add("in"));

  /* ==========================================================
   *  스크롤 연동
   *  화면 효과는 실제 스크롤 위치(scrollY)가 아니라, 그 위치를 부드럽게 따라가는 값(SY)으로 그립니다.
   *  스크롤이 툭툭 끊기거나 갑자기 멈춰도 화면은 매 프레임 조금씩 움직이다 사뿐히 멈춥니다.
   *  화면 높이(vh)는 주소창이 접히고 펴져도 바뀌지 않는 높이(고정된 장면의 높이와 같은 값)를 씁니다.
   *  — 내려가다 위로 방향을 바꾸면 주소창이 다시 나타나는데, 이때 계산이 흔들려 장면이 건너뛰지 않도록 하기 위해서입니다.
   * ========================================================== */
  const probe = document.createElement("i"); probe.className = "probe"; probe.setAttribute("aria-hidden", "true"); document.body.appendChild(probe);
  const stableVh = () => probe.offsetHeight || innerHeight;
  let vh = stableVh(), vw = innerWidth, SY = scrollY;
  // 장면들의 문서 안 위치는 한 번 재어 두고 씁니다 (매 프레임 다시 재지 않습니다). 크기가 바뀌면 다시 잽니다
  const boxes = new Map(), B = e => boxes.get(e);
  // 화면에 고정된 장면의 진행률 0~1 (동작 줄이기에서는 대표 장면 하나를 보여 줍니다)
  const pinP = (e, still) => { if (RM) return still; const b = B(e), d = b.h - vh; return d > 0 ? clamp((SY - b.top) / d) : 0; };
  // 화면을 지나가는 블록의 진행률 0~1
  const viewP = e => { const b = B(e); return clamp((vh - (b.top - SY)) / (vh + b.h)); };
  const near = (e, m = 1) => { const b = B(e), t = b.top - SY; return t + b.h > -vh * m && t < vh * (1 + m); };

  /* 프레임 묶음 재생기 (프러포즈 · 문 장면은 스크롤로, 자동 재생이 막힌 기기의 타임라인 영상은 시간으로 넘깁니다).
   * - 위치가 두 프레임 사이면 두 장을 겹쳐 그립니다.
   * - 프레임은 8장 간격 → 4장 → 2장 → 1장 순서로 불러와서, 다 받기 전에도 장면 전체가 보이고 점점 촘촘해집니다.
   * - 그림은 압축된 파일(Blob)로 받아 두고, 지금 보는 위치 앞뒤의 몇 장만 미리 백그라운드에서 풀어(createImageBitmap) 둡니다.
   *   풀어 둔 그림의 메모리는 전체 약 160MB 안에서 가장 먼 것부터 비웁니다. 이 기능이 없는 브라우저는 예전 방식(Image)으로 그립니다. */
  const BITMAP = "createImageBitmap" in window && "fetch" in window;
  const BM_LIMIT = 160e6, allSeqs = [];
  let bmBytes = 0, paintQ = new Set(), paintId = 0;
  const flushPaint = () => { paintId = 0; const qq = paintQ; paintQ = new Set(); qq.forEach(s => { s.last = ""; s.paint(); if (s.onLate) s.onLate(); }); };
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
  const coverSeq = (boxSel, conf, maxW, cap2) => {
    if (!conf || !conf.count || RM) return null;
    const cv = document.createElement("canvas");
    $(boxSel).appendChild(cv);
    const s = new Seq(cv, i => `${conf.base || "../v4/assets/"}${conf.dir}/${F3(i)}.webp${conf.v ? "?v=" + conf.v : ""}`, conf.count, true);
    s.maxW = maxW; s.cap = cap2; return s;
  };
  // 프러포즈 · 문 장면 프레임은 V9 것(../v9/media/): 둘 다 1080×1920.
  // 캔버스가 작을수록 움직이는 동안 가볍습니다: 움직일 때는 화면 배율 2 까지만 그리고, 멈추면 원래 해상도로 한 번 더 그려 겹칩니다(아래 mkSharp)
  const seqPropose = coverSeq("#shotPropose", { base: "../v9/media/", dir: "seq-propose", count: 121, v: 1 }, 1080, 2);
  const seqDoor = coverSeq("#shotDoor", V.sequences.door && V.sequences.door.count ? { base: "../v9/media/", dir: "seq-door", count: 97, v: 1 } : null, 1080, 2);
  // 캔버스 크기는 화면 전체가 아니라 장면 칸에 맞춥니다 (큰 화면에서는 칸이 가운데 휴대폰 너비로 좁아집니다)
  const seqSize = (s, cap2) => { const r = s.canvas.parentElement.getBoundingClientRect(), k = Math.min(cap2, devicePixelRatio || 1, s.maxW / r.width); return [Math.round(r.width * k), Math.round(r.height * k)]; };
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
  /* 장면 2 진행률 다시 맞추기: 문 영상(진행률 .56~.96 구간)만 DOOR_K 배 길게.
   * 아래 장면 2 의 구간표(프러포즈 0~.56, 문 .5~.96, 이름 .9~.96)는 그대로 두고, 실제 진행률 p 를 그 구간표의 진행률로 바꿔 씁니다.
   * 장면 길이(index.html 의 --len)도 같이 늘렸습니다: 540 → 540 + 440 × .4 × (DOOR_K − 1)
   * 실제 프러포즈 사진 구간(0~.56)은 PROP_K 배로 짧게(스크롤 약 25% 덜 내려도 다음 장면). 장면 길이 = 100 + 546 × TOT ÷ 1.24 → 584 */
  const DOOR_K = .72, PROP_K = .3375,   /* 11-27: 프러포즈 · 문 영상 구간 줄이기 (DOOR 1.6 → 1.2 → .9 → .72, PROP .75 → .5625 → .421875 → .3375), 장면 길이 584 → 468 → 380 → 328 */ D0 = .56, D1 = .96, PA = D0 * PROP_K, DA = (D1 - D0) * DOOR_K, TOT = PA + DA + (1 - D1);
  const s2q = p => { const x = p * TOT; return x <= PA ? x / PROP_K : x <= PA + DA ? D0 + (x - PA) / DOOR_K : D1 + (x - PA - DA); };
  const shP = mkSharp(seqPropose, () => inS2() && s2q(pinP(s2, 0)) < .62), shD = mkSharp(seqDoor, () => inS2() && s2q(pinP(s2, 0)) > .5 && s2q(pinP(s2, 0)) < .95);

  /* ---------- 타임라인 속 영상 ----------
   * 사진이 화면 가운데에 오면 그 안의 영상이 처음부터 한 번, 원래 빠르기로 재생되고 마지막 장면에서 멈춥니다.
   * 화면에서 벗어나면 멈추고, 되돌아오면 처음부터 다시 재생합니다. 사진을 누르면 다시 볼 수 있습니다.
   * 영상은 가까워질 때 미리 받기 시작하고, 멀어지면 내려놓습니다(휴대폰이 동시에 쥘 수 있는 영상 수에 한계가 있습니다).
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
      if (on) this.timer = setTimeout(() => this.play(), 420);   // 사진이 자리를 잡은 뒤에 시작
      else { cancelAnimationFrame(this.fr); if (this.v) this.v.pause(); }   // 벗어나면 그 장면에서 멈춰 있다가, 돌아오면 처음부터 다시 재생합니다
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
  // 타임라인의 사진 여덟 묶음(2002년은 두 장)과 그 영상. 프레임 묶음은 자동 재생이 막힌 기기용입니다
  // (V12 의 2003년 '같은 반' 장면은 뺐습니다. V12 에서 만든 영상은 ../v12/media/ 에서 그대로 읽습니다)
  const story = (id, k, dur) => ({ id, src: `../v9/media/st${k}.mp4?v=1`, dur, count: 37, w: 512, h: 384, frame: i => `../v8/media/st${k}/${F3(i)}.webp` });
  const own = (id, name, dur, count, w, h, base = "../v12/media/", v = 1) => ({ id, src: `${base}${name}.mp4?v=${v}`, dur, count, w, h, frame: i => `${base}${name}/${F3(i)}.webp?v=${v}` });
  const clipDefs = [
    [own("clipK", "kitchen", 3.0, 31, 512, 384)],                                                      // 2000 · 카메라를 보고 웃는 신부
    [own("clipA", "jumpkw", 6.0, 61, 512, 384, "media/"),                                               // 2002 · 신랑 줄넘기: 인사 → 긴 줄 안에서 뛰는 장면(겹치며 이어짐)
      own("clipR", "jumpkr", 6.03, 61, 384, 512, "media/")],                                             //        신부 줄넘기(같은 길이로 앞뒤를 늘림)
    [own("clipO", "orch", 3.4, 35, 512, 384, "media/")],                                               // 2003 · 같은 무대의 플루트(경원)와 바이올린(규로) — V13 에서 다시 자름
    [story("clip2", 2, 5)], [story("clip3", 3, 3.6)],                                                  // 2004 · 2005 (계주 장면만 3.6초)
    [own("clip4", "st4", 5, 37, 512, 384)],                                                            // 2012 · 뉴욕과 서울
    [own("clip5", "st5", 5, 37, 512, 384)],                                                            // 2024 · 서로에게 보낸 메시지
    [story("clip6", 6, 5)],                                                                            // 2024 · 다시 만난 날
  ];
  const stops = $$("#tl .stop").map((e, i) => ({ el: e, frame: $(".pair", e) || $(".print", e), links: $$(".link", e), clips: (clipDefs[i] || []).map(o => new Clip(o)), box: { top: 0, h: 1 }, lk: [] }));
  const clips = stops.flatMap(s => s.clips);
  let ACT = -1;   // 영상이 재생되고 있는 묶음의 번호 (-1 = 없음)
  const setAct = a => {
    if (a === ACT) return;
    ACT = a;
    stops.forEach((s, i) => s.clips.forEach(c => c.setTop(i === a)));
    stock();
  };
  // 영상 미리 받기 · 내려놓기: 지금 묶음과 앞뒤 묶음의 영상을 쥐고 있습니다. 영상을 새로 만드는 일은 무거워서
  // 묶음이 바뀌고 0.22초 뒤(빠르게 여러 장을 지나칠 때는 멈춘 뒤)에, 한 번에 하나씩 합니다
  let stockT = 0, NEARI = 0;
  const stock = () => { clearTimeout(stockT); stockT = setTimeout(stockNow, 220); };
  const stockNow = () => {
    const c0 = ACT >= 0 ? ACT : NEARI;
    let made = false, more = false;
    stops.forEach((s, i) => s.clips.forEach(c => {
      if (i >= c0 - 1 && i <= c0 + 1) { if (c.needs()) { if (made) more = true; else { c.prep(); made = true; } } }
      else if (Math.abs(i - c0) > 2) c.unload();
    }));
    if (more) stockT = setTimeout(stockNow, 90);
  };
  // 사진을 누르면 그 영상을 처음부터 다시 봅니다
  el("tl").addEventListener("click", e => {
    const f = e.target.closest(".print"); if (!f) return;
    const i = stops.findIndex(s => s.el.contains(f)); if (i < 0 || i !== ACT) return;
    stops[i].clips.forEach(c => { clearTimeout(c.timer); c.play(); });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || ACT < 0) return;
    stops[ACT].clips.forEach(c => { if (c.fb || NOAUTO || !c.top) return; if (c.v && c.started && c.v.paused && !c.v.ended) { const pr = c.v.play(); if (pr && pr.catch) pr.catch(() => {}); } });
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
  const setLit = (k, f) => { const gg = strands[k], n = Math.round(f * gg.length); if (n === lit[k]) return; lit[k] = n; gg.forEach((e, i) => e.classList.toggle("lit", i < n)); };

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

  /* 오른쪽 위의 원: 스크롤 위치 → 0 ~ 1 (첫 화면에서 비어 있다가 저녁 여섯 시 장면에서 닫힙니다). 글자는 언제나 6:00 PM 입니다 */
  const s0 = $("#s0"), s1 = $("#s1"), s1z = $("#s1z"), s2 = $("#s2"), s3b = $("#s3b"), s4 = $("#s4");
  const garden = el("garden"), bridge = el("bridge");
  const tracked = [...scenes, garden];
  let keys = [], yKeys = [], brW = vw, brH = vh, lastSH = 0;
  /* 오른쪽 위 표시 (시험용, 페이지의 window.YEARCLOCK 으로 고릅니다. 없으면 예전처럼 6:00 PM)
   *  "dday"  : 예식까지 남은 날(D-58). '어릴 적 인연이' 화면부터 보입니다.
   *  "count" : 같은 D-day 이지만 2000년의 남은 날 수에서 시작해, 내리는 만큼 줄어 오늘의 D-day 에 닿습니다.
   *  1       : 연도 (2000 → … → 2027) */
  const MODE = window.YEARCLOCK || 0, YEARS = !!MODE, DDAY = MODE === "dday" || MODE === "count";
  const dTxt = n => n > 0 ? "D-" + n.toLocaleString("en-US") : n === 0 ? "D-DAY" : "D+" + (-n).toLocaleString("en-US");
  const daysTo = yr => yr >= 2027 ? dd : Math.round((Date.UTC(Y, M - 1, DD) - Date.UTC(yr, 6, 1)) / 864e5);   // 그 해 한가운데에서 예식일까지
  const SIX_AT = .2;                 // 장면 4 에서 원이 닫히고 6:00 이 빛나는 지점
  const heroPhoto = el("heroPhoto"), heroText = el("heroText"), hint = el("scrollHint"), heroImg = $("#heroPhoto img"), pin0 = $("#s0 .pin");
  // 첫 화면: 이름·날짜 글씨가 두 사람의 얼굴을 가리지 않도록, 필요하면 사진을 조금 내려 둡니다.
  // (사진은 칸을 가득 채우도록 잘려 보이므로, 화면 비율에 따라 머리 위치가 달라집니다. 머리 꼭대기는 사진 높이의 약 24.5% 지점)
  const HEAD_TOP = .245;
  const heroGuard = () => {
    pin0.style.setProperty("--hero-shift", "0px");
    const box = heroPhoto.getBoundingClientRect(), tx = heroText.getBoundingClientRect(), iw = heroImg.naturalWidth || 1080, ih = heroImg.naturalHeight || 1920;
    if (!box.width || !tx.height) return;
    const hr = Math.max(box.height, box.width * ih / iw);                       // 화면에 그려지는 사진의 높이 (아래쪽 맞춤)
    const head = heroPhoto.offsetTop + heroPhoto.offsetHeight - hr * (1 - HEAD_TOP);   // 칸 안에서 머리 꼭대기의 위치
    const need = heroText.offsetTop + heroText.offsetHeight + 18 - head;
    if (need > 0) pin0.style.setProperty("--hero-shift", Math.ceil(need) + "px");
  };
  // 위치 다시 재기 (가벼움)
  const zLink = el("zLink");
  const absTop = e => { let t = 0; for (; e; e = e.offsetParent) t += e.offsetTop; return t; };
  const measure = () => {
    const y = scrollY;
    tracked.forEach(e => { const r = e.getBoundingClientRect(); boxes.set(e, { top: r.top + y, h: r.height }); });
    // 타임라인의 사진과 선은 움직임(transform)이 걸려 있어도 달라지지 않는 배치상의 위치로 잽니다
    stops.forEach(s => {
      s.box = { top: absTop(s.frame), h: s.frame.offsetHeight || 1 };
      s.lk = s.links.map(l => ({ top: absTop(l), h: l.offsetHeight || 1 }));
    });
    const bb = bridge.getBoundingClientRect(); brW = bb.width; brH = bb.height;
    lastSH = root.scrollHeight;
    const top = e => B(e).top, bot = e => B(e).top + B(e).h;
    keys = [[top(s0), 900], [bot(s1z) - vh, 960], [bot(s2) - vh, 1020], [bot(s3b) - vh, 1070], [top(s4) + SIX_AT * (B(s4).h - vh), 1080]];
    // 연도 표시(V13.1): 타임라인 사진이 화면 가운데쯤 있는 동안은 그 사진의 연도에 머물고, 사진 사이에서는 내리는 만큼 연도가 넘어갑니다
    // (2005 → 2012 → 2024 처럼 사이가 먼 곳은 숫자가 빠르게 감깁니다). 그 뒤 프러포즈 · 문 · 혼주 소개를 지나며 2027 까지 갑니다.
    if (YEARS) {
      yKeys = [];
      stops.forEach(s => { const fc = $("figcaption", s.el), yr = fc ? parseInt(fc.textContent, 10) : 0, c = s.box.top + s.box.h / 2 - vh / 2; if (yr) yKeys.push([c - .14 * vh, yr], [c + .14 * vh, yr]); });
      const last = yKeys.length ? yKeys[yKeys.length - 1][1] : 2024;
      yKeys.push([bot(s1z) - vh, last], [bot(s2) - vh, 2025], [bot(s3b) - vh, 2026], [top(s4) - .5 * vh, 2027]);
      yKeys.sort((a, b) => a[0] - b[0]);
    }
    const f0 = stops[0].box; popAt = Math.min(top(s1) - .12 * vh, f0.top - vh + .3 * f0.h);
  };
  const layout = () => { vh = stableVh(); vw = innerWidth; fitAll(); heroGuard(); measure(); buildLights(); fitSeq(seqPropose); fitSeq(seqDoor); };
  const timeAt = y => {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (y <= keys[i][0]) { const [y0, t0] = keys[i - 1], [y1, t1] = keys[i]; return t0 + (t1 - t0) * (y - y0) / Math.max(1, y1 - y0); }
    return 1080;
  };

  const yearAt = y => {
    if (!yKeys.length || y <= yKeys[0][0]) return yKeys.length ? yKeys[0][1] : 2000;
    for (let i = 1; i < yKeys.length; i++) if (y <= yKeys[i][0]) { const [y0, t0] = yKeys[i - 1], [y1, t1] = yKeys[i]; return Math.floor(t0 + (t1 - t0) * (y - y0) / Math.max(1, y1 - y0) + 1e-6); }
    return yKeys[yKeys.length - 1][1];
  };
  // 남은 날 수: 연도 표시와 같은 자리(사진마다 머무는 구간)를 쓰되 값만 '그 해에서 예식일까지의 날 수'로 바꿔 부드럽게 줄입니다
  const daysAt = y => {
    if (!yKeys.length || y <= yKeys[0][0]) return daysTo(yKeys.length ? yKeys[0][1] : 2000);
    for (let i = 1; i < yKeys.length; i++) if (y <= yKeys[i][0]) { const [y0, t0] = yKeys[i - 1], [y1, t1] = yKeys[i], a = daysTo(t0), b = daysTo(t1); return Math.round(a + (b - a) * (y - y0) / Math.max(1, y1 - y0)); }
    return dd;
  };
  const s1Line = el("s1Line"), album = el("album"), st7 = el("st7");
  const bridgeImgs = [...document.querySelectorAll("#bridge img")], bridgeReal = $("#bridge .real");
  /* 타임라인 끝 장면의 흐름 (진행률 0~1, U = 화면 한 개만큼 내린 거리)
   *  · 프러포즈 그림이 놓이자마자(화면 0.12개) 스크롤에 맞춰 화면 가득 커지고(Z0~Z1), 거의 다 커진 뒤부터 화면 0.46개만큼 내리는 동안
   *    천천히 사라져 바탕색만 남았다가(F0~F1), 실제 프러포즈 사진이 서서히 나타납니다(R0~R1). 두 그림이 겹쳐 보이는 순간은 없습니다.
   *  (V12 에 있던 "어릴 적 인연이" 글줄과 그 뒤의 "평생의 약속으로 이어졌습니다." 는 V13 에서 뺐습니다) */
  const U = 100 / ((parseFloat(s1z.style.getPropertyValue("--len")) || 258) - 100);
  const Z0 = .12 * U, Z1 = Z0 + .52 * U, F0 = Z1 - .06 * U, F1 = Z1 + .4 * U, R0 = F1, R1 = Z1 + .84 * U;
  const imgPropose = $("#shotPropose img"), shotDoor = el("shotDoor"), imgDoor = $("#shotDoor img"), s2Names = el("s2Names"), s2Wash = el("s2Wash");
  if (seqDoor) s2.classList.add("lit");
  const gBg = $(".g-bg"), gDuo = $(".g-duo"), gLeaf = $(".g-leaf");
  const night = el("nightPhoto"), sixD = el("sixD"), sixK = el("sixK");
  const clock = el("clock"), clockArc = $("#clock .arc"), lights = el("lights");
  const RING = 65.97;   // 원의 둘레 (반지름 10.5)
  const clockB = $("#clock b"), clockS = $("#clock small"); let yearNow = 0;
  if (YEARS) { clock.classList.add("yr"); clockS.textContent = ""; }
  if (DDAY) { clock.classList.add("pre", "dd"); clockB.textContent = dTxt(dd); }
  const T = (e, y = 0, s = 1) => e.style.transform = `translate3d(0,${y},0) scale(${s})`;
  let s2Hid = null, brOn = null, lastPP = -1, lastDP = -1, lastY = scrollY, warm = false, ringP = -1, popAt = 0;

  const update = () => {
    paintSky();
    // 오른쪽 위의 원: 내리는 만큼 채워집니다 (글자는 그대로 6:00 PM)
    // D-day 표시일 때 원은 내리는 것과 상관없이 1/(남은 날 수)만큼만 채워 둡니다 (D-58 이면 58분의 1, 하루 전이면 가득)
    const rp = MODE === "dday" ? (dd > 0 ? 1 / dd : 1) : RM ? 1 : Math.round(clamp((timeAt(SY) - 900) / 180) * 400) / 400;
    if (rp !== ringP) { ringP = rp; clockArc.style.strokeDashoffset = (RING * (1 - rp)).toFixed(2); }
    if (DDAY) {
      clock.classList.toggle("pre", !RM && SY < B(s1).top - .55 * vh);   // 첫 화면에서는 감추고 '어릴 적 인연이' 화면부터
      if (MODE === "count") { const n = RM ? dd : daysAt(SY); if (n !== yearNow) { yearNow = n; clockB.textContent = dTxt(n); } }
    } else if (YEARS) { const yr = RM ? 2027 : yearAt(SY); if (yr !== yearNow) { yearNow = yr; clockB.textContent = yr; } }

    // 장면 0
    if (near(s0, .2)) {
      const p = pinP(s0, 0);
      T(heroPhoto, `${(-p * 2).toFixed(2)}%`, 1 + p * .08);   // 내릴수록 사진이 살짝 다가옴
      T(heroText, `${(-p * 150).toFixed(1)}px`); heroText.style.opacity = 1 - seg(p, .35, .95);
      hint.style.opacity = 1 - seg(p, 0, .15);
    }
    // 장면 1 · 타임라인: 사진은 화면에 들어올 때 한 번 놓이고(그 뒤로는 그대로), 선은 스크롤을 내리는 만큼 그어지며,
    // 화면 가운데에 가장 가까운 사진의 영상이 재생됩니다. 위로 되돌아가도 놓인 사진은 그대로라 장면이 뒤섞이지 않습니다.
    if (near(s1, .6)) {
      const holding = holdY != null || introOn;
      if (!warm && near(s1, .4)) { warm = true; stock(); }   // 타임라인이 가까워지면 첫 영상을 받아 둡니다
      if (s1Line && !holding && B(s1).top - SY < vh * .8) s1Line.classList.add("in");   // '어릴 적 인연이' 글줄은 11-27 에 뺌
      const mid = SY + vh * .5, lineAt = SY + vh * .72;
      let best = -1, bd = 1e9, ni = 0, nd = 1e9, curOk = false, curD = 1e9;
      stops.forEach((s, i) => {
        const b = s.box, top = b.top - SY, bot = top + b.h;
        if (top > vh * 1.4 || bot < -vh * 1.4) return;
        if (!holding && top < vh * .86) s.el.classList.add("in");
        s.lk.forEach((k, j) => {
          const f = RM ? 1 : clamp((lineAt - k.top) / k.h), l = s.links[j];
          if (l._f !== f) { l._f = f; l.style.setProperty("--f", f.toFixed(3)); l.classList.toggle("end", f >= 1); }
        });
        const d = Math.abs(b.top + b.h / 2 - mid), vis = (Math.min(bot, vh) - Math.max(top, 0)) / b.h;
        if (d < nd) { nd = d; ni = i; }
        if (vis >= .66 && d < bd) { bd = d; best = i; }
        if (i === ACT) { curOk = vis >= .5; curD = d; }
      });
      // 지금 재생 중인 묶음이 아직 화면에 넉넉히 보이면, 다른 묶음이 확실히 더 가운데에 올 때까지 그대로 둡니다
      if (best !== ACT && ACT >= 0 && curOk && (best < 0 || curD - bd < 70)) best = ACT;
      if (holding || RM) best = -1;
      if (ni !== NEARI) { NEARI = ni; if (ACT < 0) stock(); }
      setAct(best);
    } else if (ACT >= 0) setAct(-1);
    // 타임라인 끝: 프러포즈 그림 → 화면 가득 → 그 자리에서 실제 사진으로 → 장면 2
    // (장면 2 는 이 장면의 마지막 화면 높이만큼 겹쳐 시작하므로 빈 구간이 없습니다)
    const p1 = pinP(s1z, 1);
    {
      const bz = B(s1z), tz = bz.top - SY;
      if (tz < vh * .58 || RM) st7.classList.add("on");
      s1z.classList.toggle("zooming", !RM && p1 >= Z0 + .04 * U);
      if (tz < vh * 1.2 && tz > -vh) { const f = RM ? 1 : clamp((SY + vh * .72 - bz.top - zLink.offsetTop) / (zLink.offsetHeight || 1)); if (zLink._f !== f) { zLink._f = f; zLink.style.setProperty("--f", f.toFixed(3)); } }
      // 실제 스크롤과 따라가는 값(SY)이 모두 장면 2 에 들어온 뒤에만 장면 2 를 보여 줍니다. 그 전에는 화면에 고정된 막(bridge)이 덮고 있어서,
      // 빠르게 위아래로 넘겨도 두 장면이 겹쳐 보이지 않습니다
      const before = Math.min(SY, scrollY) < B(s2).top - 1, hid = !RM && before;
      if (hid !== s2Hid) { s2Hid = hid; s2.style.visibility = hid ? "hidden" : ""; }
      const o = hid && p1 >= Z0;
      if (o) {
        // 인화 사진 속 그림의 자리 → 장면 2 사진과 같은 object-fit:cover 자리로 키운 뒤, 실제 사진으로 바꿉니다.
        // 그림의 자리는 배치(style.css 의 .album · .print.tall9)에서 계산합니다: 한가운데, 너비는 앨범의 52% 에서 테두리 18px 을 뺀 값, 9:16
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
      const p = s2q(pinP(s2, .3));
      const pp = seg(p, 0, .56);
      if (pp !== lastPP) { lastPP = pp; shP.off(); }
      if (seqPropose) seqPropose.draw(pp); else imgPropose.style.transform = `scale(${(1 + .95 * ease(seg(p, 0, .56))).toFixed(4)})`;
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
    // 장면 4 · 저녁 6시: 시간과 날짜가 함께 뜨고, 6:00 에 닿으면 전구가 켜진 뒤 한글 일시·장소와 사진이 올라옵니다
    const b4 = B(s4), top4 = b4.top - SY, reached = RM ? top4 < vh * .6 : top4 < vh * .25, past = top4 + b4.h < vh;
    lights.classList.toggle("on", reached);
    if (near(s4, .2) || past) {
      const p = past ? 1 : pinP(s4, 1);
      // 사진(CYR_0791)이 혼주 소개 바로 아래에서 올라옵니다 (예전처럼 시간 · 날짜만 먼저 뜨는 구간은 없앴습니다)
      // 사진은 화면에 들어오면서 바로 보이고, 시간 · 날짜는 사진이 보인 뒤에 떠서 글자만 먼저 보이는 순간이 없습니다
      const ot = past || RM ? 1 : clamp((vh * .85 - top4) / (vh * .3)), o = past || RM ? 1 : clamp((vh * .5 - top4) / (vh * .45));   // 초대 문구가 먼저 뜨고, 사진이 뒤따라 올라옵니다
      clock.classList.toggle("off", ot > .2 || past);
      sixD.style.opacity = ot; sixK.style.opacity = ot;   // 날짜 · 일시 · 장소 세 줄이 한 번에 뜹니다 (큰 6:00 글씨는 없앴습니다)
      setLit(1, seg(p, SIX_AT, .44)); setLit(0, seg(p, SIX_AT + .05, .5));
      night.style.opacity = o; night.style.transform = `translate(-50%,${(14 * (1 - ease(o))).toFixed(2)}%)`;
    } else { clock.classList.remove("off"); setLit(0, 0); setLit(1, 0); }
    // 참석 의사 창: 내려가는 길에 한 번, 타임라인의 첫 영상이 재생되기 전에 뜹니다.
    // 첫 사진이 화면 아래에서 30% 쯤 올라왔을 때(영상은 사진이 3분의 2 넘게 보여야 재생됩니다) — 그보다 늦어도 타임라인 시작 12% 화면 앞에서는 뜹니다.
    // 바로가기로 건너뛰었다가 위로 올라오는 길에는 띄우지 않습니다 (올라오는데 화면이 저절로 움직이면 놀랍니다)
    {
      const y = scrollY;
      if (!introShown && !introOn && Date.now() - navJump > 2500) {
        const top1 = B(s1).top;
        if (y > lastY && y >= popAt && y < top1 + .5 * vh) showRsvpIntro();
      }
      lastY = y;
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
  // 주소창이 접히고 펴질 때(너비는 그대로, 높이만 조금 바뀜)는 아무것도 다시 맞추지 않습니다: 장면의 높이와 계산에 쓰는 화면 높이는 바뀌지 않습니다
  addEventListener("resize", () => { if (innerWidth === rw && stableVh() === vh) return req(); rw = innerWidth; layout(); req(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); req(); }).observe($("#app"));
  addEventListener("load", () => { layout(); req(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { heroGuard(); measure(); req(); });

  /* ---------- 처음 들어왔을 때: 사진 세 장 ----------
   * ① HJH_1628(소파에 앉은 사진)이 천천히 물러나며 보이고 → ② HJH_3357(마주 보는 사진)이 두 사람 쪽으로 다가가다 빛에 잠기고
   * → ③ HJH_0182(첫 화면 사진)가 빛 속에서 나타나 자리를 잡습니다. 세 장이 다 지나간 뒤에 이름·날짜가 뜨고 화면을 내릴 수 있습니다.
   * 사진이 늦게 도착하면 잠깐 기다렸다가(각각 최대 2.5~4초) 있는 것만으로 이어 갑니다. 화면이 잠겨 있는 시간은 보통 6초쯤입니다. */
  let introOn = root.classList.contains("intro") && !RM;
  if (!introOn) root.classList.remove("intro");
  const runIntro = () => {
    window.__intro = 1;   // 시작했다는 표시 (index.html 의 9초 안전장치가 잠금을 풀지 않도록)
    const box = el("intro"), s1i = $(".is1", box), s2i = $(".is2", box), veil = el("isVeil"), bars = $$("#isBar i");
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const ready = (im, cap2) => Promise.race([wait(cap2).then(() => false), (im.decode ? im.decode() : new Promise((r, j) => { if (im.complete) r(); else { im.onload = r; im.onerror = j; } })).then(() => true, () => false)]);
    const bar = (i, ms) => { bars[i].style.setProperty("--d", ms + "ms"); bars[i].classList.add("go"); };
    const T1 = 2100, T2 = 2400, T3 = 1400;
    window.scrollTo(0, 0);
    (async () => {
      const ok1 = await ready($("img", s1i), 4000);
      if (ok1) { s1i.classList.add("on"); bar(0, T1); await wait(T1); } else bar(0, 1);
      const ok2 = await ready($("img", s2i), ok1 ? 1500 : 2500);
      if (ok2) { s2i.classList.add("on"); bar(1, T2); await wait(T2 - 620); veil.classList.add("on"); await wait(620); } else { bar(1, 1); veil.classList.add("on"); await wait(ok1 ? 500 : 100); }
      await ready(heroImg, 2500);
      // 세 번째: 빛이 걷히며 첫 화면 사진이 자리를 잡습니다
      root.classList.add("intro3"); bar(2, T3); box.classList.add("out");
      await wait(T3);
      // 다 지나갔습니다: 글씨가 뜨고, 화면을 내릴 수 있습니다
      introOn = false;
      root.classList.add("reveal"); root.classList.remove("intro");
      // 참석 의사 창: 처음의 사진 세 장이 끝나면 곧바로 띄웁니다(스크롤을 기다리지 않음). 그 사이 손으로 내렸으면 예전처럼 내려가는 길에 뜸
      setTimeout(() => { if (!introShown && scrollY < 4 && Date.now() - navJump > 2500) showRsvpIntro(true); }, 450);
      lastY = scrollY; req();
      setTimeout(() => root.classList.remove("reveal", "intro3"), 2400);
    })();
  };

  layout(); SY = scrollY; update();
  if (restoreY != null && !introOn) {
    // 보던 자리로: 지금 바로 한 번, 사진 · 글꼴이 다 들어와 높이가 바뀐 뒤 한 번 더(그 사이 손으로 움직였으면 건드리지 않음)
    let moved = false;
    const go = () => { if (moved) return; navJump = Date.now(); window.scrollTo(0, Math.min(restoreY, document.documentElement.scrollHeight - innerHeight)); SY = scrollY; lastY = scrollY; update(); };
    go();
    const stop = () => { moved = true; };
    ["touchstart", "wheel", "keydown"].forEach(t => addEventListener(t, stop, { once: true, passive: true }));
    addEventListener("load", () => setTimeout(go, 60), { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(go, 30));
  }
  if (introOn) runIntro();
})();
