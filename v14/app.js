(() => {
  const C = window.WEDDING;
  // V14 는 V10 을 바탕으로 V13 에서 고친 내용(문구 · 사진 · 계좌 · 식사 여부 · 처음 사진 세 장)을 옮긴 것입니다. 설정은 v10 을 쓰고 v14 가 있으면 덮어씁니다.
  // V10 은 첫 화면과 참석 의사 창만 V4~V9 와 같고, 그 뒤는 일반 청첩장입니다. 사진은 ../v4/assets/ 것을 함께 쓰고, 격자용 작은 그림만 thumb/ 에 따로 있습니다
  const V = Object.assign({
    rsvpPopup: false,
    greetingLead: [],
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],
  }, C.v10 || {}, C.v14 || {});
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
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
  let introOn = root.classList.contains("intro") && !RM;
  if (!introOn) root.classList.remove("intro");
  document.addEventListener("touchstart", () => {}, { passive: true });   // 아이폰에서 누르는 동안의 반응(:active)이 보이도록

  /* ---------- 뒤로 가기 ----------
   * 사진 크게 보기나 창이 열려 있을 때 휴대폰의 뒤로 가기를 누르면, 청첩장이 닫히지 않고 그 창만 닫힙니다.
   * 창을 열 때 방문 기록을 한 칸 쌓고(layerOpen), 화면에서 닫으면 그 칸을 되돌립니다(layerClose).
   * 기록을 오갈 때 브라우저가 스크롤 위치를 예전 자리로 되돌리지 않도록 스크롤 복원은 꺼 둡니다. */
  try { history.scrollRestoration = "manual"; } catch {}
  /* 보던 자리: 내리는 동안 위치를 이 탭의 sessionStorage 에 적어 두고, 새로 고침했을 때만 그 자리로 돌아갑니다(V13 과 같음).
   * 돌아갈 때는 처음 사진 세 장을 건너뜁니다(index.html). */
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
    try { if (navigator.vibrate) navigator.vibrate(8); } catch {}
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
  const venueKo = `${C.venue.name} ${C.venue.hall}`, venueEnFull = `${C.venue.nameEn} · ${C.venue.hallEn}`;
  $("#heroDate").innerHTML = `${esc(`${ymd} · ${DOW_EN}, ${hourEn}`)}<span class="hero-venue">${esc(venueEnFull)}</span>`;

  /* ---------- 초대의 말 ---------- */
  // 네 문장(줄)을 모두 같은 크기 · 같은 줄 간격으로, 한 줄에 하나씩 놓습니다 (크기는 fitGroups 가 화면 너비에 맞춥니다)
  const greeting = $("#greeting");
  greeting.dataset.fit = "10";
  greeting.innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  const gKids = [...greeting.children];
  gKids.forEach((el, i) => el.style.transitionDelay = `${i * 300}ms`);
  // 줄 길이 고르게 나누기(text-wrap: balance)가 없는 브라우저에서는 줄 수가 늘지 않는 가장 좁은 너비를 찾아 줍니다
  if (!(window.CSS && CSS.supports && CSS.supports("text-wrap", "balance"))) {
    const balance = () => $$(".bal").forEach(el => {
      el.style.maxWidth = ""; const h = el.offsetHeight; let hi = el.offsetWidth, lo = hi / 2;
      if (!h || !hi) return;
      for (let i = 0; i < 8; i++) { const mid = (lo + hi) / 2; el.style.maxWidth = mid + "px"; if (el.offsetHeight > h) lo = mid; else hi = mid; }
      el.style.maxWidth = Math.ceil(hi) + "px"; el.style.marginLeft = el.style.marginRight = "auto";
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(balance); else addEventListener("load", balance);
    let bw = innerWidth; addEventListener("resize", () => { if (innerWidth !== bw) { bw = innerWidth; balance(); } });
  }

  /* ---------- 신랑 · 신부 ---------- */
  $("#parG").textContent = `${C.groom.father.name} · ${C.groom.mother.name}의 ${C.groom.relation}`;
  $("#parB").textContent = `${C.bride.father.name} · ${C.bride.mother.name}의 ${C.bride.relation}`;
  [["#telG", C.groom.phone], ["#telB", C.bride.phone]].forEach(([sel, ph]) => {
    if (!ph) return;
    $(sel).innerHTML = `<a class="chip" href="tel:${esc(ph)}">전화</a><a class="chip" href="sms:${esc(ph)}">문자</a>`; $(sel).hidden = false;
  });

  /* ---------- 예식 일시: 달력 · 남은 시간 ---------- */
  $("#dNum").textContent = `${Y}.${pad(M)}.${pad(DD)}`;   // 달력 위는 V13 과 같이 날짜 · 요일과 시각만 (장소는 적지 않습니다)
  $("#dWhen").textContent = `${DOW_KO}요일 ${hourKo}`;
  const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let g = ["일", "월", "화", "수", "목", "금", "토"].map((d, i) => `<div class="dow${i === 0 ? " sun" : ""}">${d}</div>`).join("");
  for (let i = 0; i < first; i++) g += "<div></div>";
  for (let d = 1; d <= days; d++) g += `<div class="d${(first + d - 1) % 7 === 0 ? " sun" : ""}${d === DD ? " day" : ""}"${d === DD ? ` aria-label="${M}월 ${d}일 예식일"` : ""}>${d}</div>`;
  $("#calendar").innerHTML = `<div class="grid7" role="img" aria-label="${Y}년 ${M}월 달력, 예식일 ${DD}일 ${DOW_KO}요일">${g}</div>`;

  // 남은 날: "규로, 경원의 결혼식이 N일 남았습니다." (뒤에 붙는 조사는 앞 글자의 받침에 맞춥니다: 경원이 · 규로가)
  const kstToday = () => { const t = new Date(Date.now() + 9 * 3600e3); t.setUTCHours(0, 0, 0, 0); return t; };
  const dd = Math.round((Date.UTC(Y, M - 1, DD) - kstToday()) / 864e5);
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
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/to/${q},${C.venue.lat},${C.venue.lng}`;
  $("#navTmap").href = `tmap://route?goalname=${q}&goalx=${C.venue.lng}&goaly=${C.venue.lat}`;
  $("#navTmap").addEventListener("click", () => setTimeout(() => { if (!document.hidden) toast("티맵 앱이 설치되어 있어야 합니다"); }, 1500));
  if (C.venue.tel) { const t = $("#venueTel"); t.textContent = `Tel. ${C.venue.tel}`; t.href = `tel:${C.venue.tel}`; }
  $("#addrCopy").onclick = () => copy(C.venue.address, "주소가 복사되었습니다");
  $("#transport").innerHTML = C.venue.transport.map(t => `<div class="t"><h4>${esc(t.title)}</h4><ul>${t.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`).join("");
  // 지도는 가까이 왔을 때 불러오고, 한 번 눌러야 움직입니다(화면을 내리다 지도에 걸리지 않게). 지도가 화면 밖으로 나가면 다시 잠급니다
  // 지도는 네이버 지도(../nmap.js)
  const map = $("#map"), nmap = weddingMap($("#mapBox"), { name: C.venue.name, address: C.venue.address, lat: C.venue.lat, lng: C.venue.lng });
  $("#mapGuard").onclick = () => { map.classList.add("live"); nmap.unlock(); };

  /* ---------- 사진: 격자 ---------- */
  // 사진별 가로÷세로 비율과 대표색(불러오기 전에 깔아 두는 바탕색)
  const META = { "01.webp": [.6669, "#a5a7a8"], "02.webp": [.6669, "#44474a"], "03.webp": [.6669, "#9ea79a"], "04.webp": [.6669, "#9c9f95"], "05.webp": [1.4995, "#b0afa7"], "06.webp": [1.4995, "#878787"],
    "07.webp": [.6669, "#6d6d6d"], "08.webp": [.6581, "#888888"], "09.webp": [.6669, "#cfcfcf"], "10.webp": [.6669, "#e2e2e1"], "11.webp": [.6669, "#c7c7c6"], "12.webp": [.6669, "#c7c6c6"],
    "13.webp": [.6669, "#c2c4c5"], "14.webp": [.6669, "#c3c6c7"], "15.webp": [.6669, "#9d9d9d"], "16.webp": [.6669, "#787a5d"], "17.webp": [.6669, "#4f4f36"], "18.webp": [.6669, "#3d3d3d"],
    "19.webp": [.6667, "#848587"], "20.webp": [.6667, "#7b7b7b"], "21.webp": [.6667, "#5f6244"], "22.webp": [.6667, "#979590"],
    "23.webp": [1.4995, "#8a8582"], "24.webp": [0.6669, "#85868a"], "25.webp": [0.6669, "#9da49d"], "26.webp": [0.6669, "#8c8d8d"], "27.webp": [0.6669, "#a7a7a7"], "28.webp": [0.6669, "#7b7b7b"], "29.webp": [0.6669, "#d1d4d5"], "30.webp": [0.6669, "#45464a"], "31.webp": [0.6669, "#949499"] };
  const G = V.gallery.map(x => typeof x === "string" ? { f: x, span: 1 } : { f: x.f, span: x.span || 1, half: !!x.half, big: !!x.big, pair: x.pair || "", cols: x.cols || 0, fill: !!x.fill, pos: x.pos || "" });
  // 수정_2차 폴더에 더 새 수정본(_3 · _4)이 생긴 사진은 V13 의 media/gallery · media/thumb 것을 씁니다
  const NEWER = new Set(["03.webp", "05.webp", "12.webp", "13.webp", "19.webp", "20.webp", "22.webp", "23.webp", "24.webp", "25.webp", "26.webp", "27.webp", "28.webp", "29.webp", "30.webp", "31.webp"]);
  const full = f => NEWER.has(f) ? `../v13/media/gallery/${f}?v=${f === "21.webp" ? 2 : 1}` : `../v4/assets/gallery/${f}`;
  const thumb = p => p.pair === "R" && p.f === "22.webp" ? `../v13/media/gallery/22x.webp?v=1` : p.pair === "L" && p.f === "19.webp" ? `../v13/media/gallery/19x.webp?v=1` : p.span > 1 || p.half || p.big || p.pair || p.cols ? full(p.f) : NEWER.has(p.f) ? `../v13/media/thumb/${p.f}?v=${p.f === "21.webp" ? 2 : 1}` : `../v10/thumb/${p.f}`;   // 한 줄 전체를 쓰는 사진은 큰 그림 그대로
  const grid = $("#gGrid");
  grid.innerHTML = G.map((p, i) => `<button class="g${p.span > 1 ? " s" + p.span : ""}${p.half ? " gh" : ""}${p.big ? " gb" : ""}${p.pair ? " gp" + p.pair : ""}${p.fill ? " gf" : ""}" data-i="${i}" style="${p.cols ? `grid-column:span ${p.cols};` : ""}--c:${(META[p.f] || [])[1] || "#d9dbd9"}" aria-label="사진 ${i + 1} 크게 보기"><img src="${esc(thumb(p))}" alt="웨딩 사진 ${i + 1}" loading="lazy" decoding="async" draggable="false"${p.pos ? ` style="object-position:${p.pos}"` : ""}></button>`).join("");
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
  const closeLb = fromPop => {
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
  };
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
  document.addEventListener("contextmenu", e => { if (e.target.closest("img")) e.preventDefault(); });
  // 사진이 있는 칸에서는 두 손가락 확대가 되지 않습니다 (style.css 의 touch-action 과 함께)
  const PHOTO = ".pin,.who .ph,.grid,.lb";
  const onPhoto = e => e.target && e.target.closest && e.target.closest(PHOTO);
  ["gesturestart", "gesturechange"].forEach(t => document.addEventListener(t, e => { if (onPhoto(e)) e.preventDefault(); }, { passive: false }));
  document.addEventListener("wheel", e => { if (e.ctrlKey && onPhoto(e)) e.preventDefault(); }, { passive: false });

  /* ---------- 마음 전하실 곳 ----------
   * 계좌 위에는 이름만 적습니다. 번호는 띄어쓰기로 나누고, config.js 의 v13.accounts 에 적은 계좌(김진희 · 최영선 등)도 함께 씁니다. */
  const accGroup = (title, list) => {
    const rows = list.filter(a => a.number);
    return `<div class="acc-group"><button class="acc-head" aria-expanded="false">${title}</button><div class="acc-body"><div class="acc-in">${rows.map(a => `
      <div class="acc-row"><div><small>${esc(a.name)}</small><div class="num">${esc(a.bank)} <b>${esc(a.number)}</b></div></div>
      <div class="acts"><button class="mini" data-acc="${esc(`${a.bank} ${a.number} ${a.name}`)}">복사</button>${a.kakaopay ? `<a class="mini" href="${esc(a.kakaopay)}" target="_blank" rel="noopener">카카오페이</a>` : ""}</div></div>`).join("")}</div></div></div>`;
  };
  const accMore = Object.assign({}, (C.v13 && C.v13.accounts) || {}, (C.v14 && C.v14.accounts) || {});
  const withMore = (list, side) => list.map(a => Object.assign({}, a, (accMore[side] || {})[a.name] || {}));
  const accG = withMore(C.accounts.groom || [], "groom"), accB = withMore(C.accounts.bride || [], "bride");
  const hasG = accG.some(a => a.number), hasB = accB.some(a => a.number);
  if (window.NOACC || (!hasG && !hasB)) { $("#accountsSec").hidden = true; $$('.quick a[href="#accountsSec"]').forEach(a => a.hidden = true); $("#quick").style.gridTemplateColumns = "repeat(3,auto)"; }
  $("#accounts").innerHTML = (hasG ? accGroup("신랑측", accG) : "") + (hasB ? accGroup("신부측", accB) : "");
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
    $("#rsvpDeadline").innerHTML = `<span class="fit1" data-min="9">소중한 걸음에 감사드리며, ${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일까지 회신해 주시면 감사하겠습니다.</span>`;
  }
  // 한 줄에 들어가지 않으면 글자를 조금 줄입니다 (최소 data-min px)
  const fitAll = () => $$(".fit1").forEach(s => { s.style.fontSize = ""; const p = s.parentElement, w = p.clientWidth, fs = parseFloat(getComputedStyle(p).fontSize); if (w > 0 && s.scrollWidth > w) s.style.fontSize = Math.max(parseFloat(s.dataset.min) || 10.5, Math.floor(fs * w / s.scrollWidth * 20) / 20) + "px"; });
  /* 여러 줄을 같은 크기로 한 줄씩: data-fit 이 붙은 상자 안의 줄(.ln · 인사말의 p)이 모두 한 줄에 들어가도록
   * 가장 긴 줄에 맞춰 상자의 글자 크기를 줄입니다(가장 작게는 data-fit px). 인사말 · 계좌 안내 · 회신 창의 지정석 안내에 씁니다. */
  const fitGroups = () => $$("[data-fit]").forEach(box => {
    box.style.fontSize = ""; const w = box.clientWidth; if (!w) return;
    const fs = parseFloat(getComputedStyle(box).fontSize); let m = 0;
    [...box.children].forEach(c => { m = Math.max(m, c.scrollWidth); });
    if (m > w) box.style.fontSize = Math.max(parseFloat(box.dataset.fit) || 9, Math.floor(fs * w / m * 20) / 20) + "px";
  });
  fitAll(); fitGroups();
  // 오른쪽 위 D-day: 첫 화면(이름 · 날짜)이 넘어가기 시작하면 보입니다. 원은 1/(남은 날 수)만큼만 채웁니다
  { const ck = $("#clock"); if (ck) {
      $("b", ck).textContent = dd > 0 ? "D-" + dd : dd === 0 ? "D-DAY" : "D+" + (-dd);
      $(".arc", ck).style.strokeDashoffset = (65.97 * (1 - (dd > 0 ? 1 / dd : 1))).toFixed(2);
      const inv = $("#invitation"), tog = () => ck.classList.toggle("pre", inv.getBoundingClientRect().top > innerHeight * .55);
      addEventListener("scroll", tog, { passive: true }); addEventListener("resize", tog); tog();
  } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGroups);
  { let gw = innerWidth; addEventListener("resize", () => { if (innerWidth !== gw) { gw = innerWidth; fitGroups(); } }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  { let fw = innerWidth; addEventListener("resize", () => { if (innerWidth !== fw) { fw = innerWidth; fitAll(); } }); }
  const markDone = () => { $("#rsvpDone").hidden = !store.get("rsvp_done"); };
  markDone();
  $("#rsvpOpen").onclick = () => openModal("#rsvpModal");
  const rf = $("#rsvpForm");
  rf.addEventListener("change", () => rf.classList.toggle("absent", rf.attend.value === "불참"));
  rf.addEventListener("submit", async e => {
    e.preventDefault();
    const data = { type: "rsvp", side: rf.side.value, attend: rf.attend.value, name: rf.name.value.trim(), phone: rf.phone.value.trim(),
      meal: rf.attend.value === "참석" ? rf.meal.value : "-", note: rf.note.value.trim() };
    if (!data.name) return;
    if (API) {
      const btn = rf.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "전달 중…";
      try { await post(data); if (introFlow) thanked = true; else toast("소중한 회신 감사합니다"); rf.reset(); rf.classList.remove("absent"); closeModal($("#rsvpModal")); store.set("rsvp_done", "1"); markDone(); }
      catch { toast("전송에 실패했어요. 잠시 후 다시 시도해주세요"); }
      finally { btn.disabled = false; btn.textContent = "전달하기"; }
    } else if (C.rsvpFallbackPhone) {
      const body = `[참석 회신] ${data.side} / ${data.name} / ${data.attend}${data.attend === "참석" ? ` / 식사 ${data.meal}` : ""}${data.note ? ` / ${data.note}` : ""}`;
      location.href = `sms:${C.rsvpFallbackPhone}${/iPhone|iPad/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    } else toast("참석 회신 기능이 아직 준비 중입니다");
  });

  /* 첫 화면이 화면 밖으로 거의 다 넘어갔을 때 참석 의사 안내 창을 먼저 띄웁니다 (v10.rsvpPopup: true).
   * 창이 떠 있는 동안 손으로는 더 내려가지 않고, 뒤 화면은 초대의 말이 화면에 꽉 차는 자리까지 천천히 내려가 멈춥니다.
   * 회신을 마치거나 "오늘 하루 보지 않기"·닫기로 넘기면 "이어서 화면을 내려주세요!"가 잠깐 뜨고 초대의 말이 한 줄씩 나타납니다.
   * 이미 회신했거나 오늘 넘긴 분, 예식이 지난 뒤에는 뜨지 않습니다. */
  $("#popWhen").textContent = `${Y}. ${pad(M)}. ${pad(DD)} (${DOW_KO}) ${hourKo}`;
  const todayKey = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  let introShown = false, introFlow = false, thanked = false, navJump = 0, holdY = null, introTop = false;
  // 바로가기·링크로 다른 곳에 이동하는 중에는 띄우지 않습니다
  document.addEventListener("click", e => { if (e.target.closest('a[href^="#"]')) navJump = Date.now(); });
  const introDue = () => V.rsvpPopup && !introShown && Date.now() <= D.getTime() && !store.get("rsvp_done") && store.get("rsvp_skip") !== todayKey();
  const inv = $("#invitation");
  const showRsvpIntro = (atTop = false) => {   // atTop: 처음의 사진 세 장이 끝난 직후, 첫 화면 그대로 띄움(뒤 화면을 움직이지 않음)
    if (introShown || !V.rsvpPopup || Date.now() > D.getTime()) return;
    const due = introDue();
    introShown = true;
    if (!due) return;
    if ($$(".modal:not([hidden])").length || !lb.hidden) return;
    introFlow = true; thanked = false; introTop = atTop;
    holdY = atTop ? Math.round(scrollY) : Math.round(inv.getBoundingClientRect().top + scrollY);
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
  const holdBlock = e => { if ((holdY != null || introOn) && !e.target.closest(".modal .sheet")) e.preventDefault(); };
  addEventListener("keydown", e => { if (introOn && [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home"].includes(e.key)) e.preventDefault(); });
  addEventListener("touchmove", holdBlock, { passive: false });
  addEventListener("wheel", holdBlock, { passive: false });
  let cueT = 0;
  const afterIntro = () => {
    // '이어서 화면을 내려주세요!' 안내는 뺐습니다(첫 화면의 '천천히 내려 주세요'와 겹쳐 보여서). 회신했으면 감사 인사만 잠깐
    if (thanked) toast("소중한 회신 감사합니다");
    if (!introTop) setTimeout(showGreet, 260);   // 첫 화면에서 띄운 경우엔 인사말이 화면에 들어올 때 평소처럼 나타남
  };
  $("#rsvpIntroGo").onclick = () => { closeModal($("#rsvpIntro"), true); openModal("#rsvpModal", true); };
  $("#rsvpIntroSkip").onclick = () => { store.set("rsvp_skip", todayKey()); closeModal($("#rsvpIntro")); };

  // 초대의 말: 한 줄씩 나타납니다. 참석 의사 창이 뜰 분에게는 창을 닫은 뒤에 (창이 뜨기 전에 한참 머물러 계시면 그냥 보여 드립니다)
  let greetShown = RM, greetSeen = false, greetT = 0;
  function showGreet() { if (greetShown) return; greetShown = true; gKids.forEach(el => el.classList.add("in")); }
  const tryGreet = () => {
    if (greetShown || introFlow) return;
    if (introDue()) { if (greetSeen && !greetT) greetT = setTimeout(() => { greetT = 0; if (!introFlow && greetSeen) showGreet(); }, 1100); return; }
    showGreet();
  };

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
  const quick = $("#quick"), qLinks = $$("a", quick);
  quick.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault();
    $(a.getAttribute("href")).scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  });

  /* ---------- 화면에 들어올 때 ---------- */
  const reveals = $$(".rv,.thread");
  if ("IntersectionObserver" in window) {
    if (RM) reveals.forEach(el => el.classList.add("in"));
    else {
      // 섹션 머리의 선이 먼저 그어지고, 내용이 한 번 떠오릅니다
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .05, rootMargin: "0px 0px -5% 0px" });
      reveals.forEach(el => io.observe(el));
      new IntersectionObserver(es => es.forEach(e => { greetSeen = e.isIntersecting; if (greetSeen) tryGreet(); }), { threshold: .6 }).observe(greeting);
    }
    // 지금 보고 있는 섹션을 바로가기에 표시합니다 (화면 가운데 조금 위의 가는 띠에 걸친 섹션)
    const ioNav = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      qLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-42% 0px -56% 0px" });
    $$("#app > section").forEach(s => ioNav.observe(s));
    // 지도: 가까이 오면 불러오고, 화면 밖으로 나가면 다시 잠급니다
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); nmap.load(); } }, { rootMargin: "120% 0px" }).observe(map);
    new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && map.classList.contains("live")) { map.classList.remove("live"); nmap.lock(); } })).observe(map);
  } else {
    reveals.forEach(el => el.classList.add("in")); showGreet(); nmap.load();
  }

  /* ==========================================================
   *  스크롤
   *  손가락·휠 스크롤은 브라우저 기본 그대로입니다. 스크롤에 맞춰 움직이는 것은 첫 화면 하나뿐이고(V4~V9 와 같은 움직임),
   *  그 효과는 스크롤 위치를 약 0.14초 늦게 부드럽게 따라가는 값(SY)으로 그립니다.
   * ========================================================== */
  const s0 = $("#s0"), heroPhoto = $("#heroPhoto"), heroText = $("#heroText"), hint = $("#scrollHint"), closing = $("#closing"), theme = $('meta[name="theme-color"]');
  const T = (e, y = 0, s = 1) => e.style.transform = `translate3d(0,${y},0) scale(${s})`;
  let vh = innerHeight, SY = scrollY, b0 = { top: 0, h: 0 }, invTop = 0, lastSH = 0, dark = null;
  // 첫 화면: 이름·날짜 글씨가 두 사람의 얼굴을 가리지 않도록, 필요하면 사진을 조금 내려 둡니다(V13 과 같은 방식).
  // 휴대폰에서 사진이 화면 폭 가득이라, 보이는 높이가 낮은 화면(앱 안 브라우저 · 작은 휴대폰)에서는 머리가 글씨 쪽으로 올라오기 때문. 머리 꼭대기는 사진 높이의 약 24.5% 지점
  const pin0 = $("#s0 .pin"), heroImg0 = $("#heroImg"), HEAD_TOP = .245;
  const heroGuard = () => {
    pin0.style.setProperty("--hero-shift", "0px");
    const box = heroPhoto.getBoundingClientRect(), iw = heroImg0.naturalWidth || 1080, ih = heroImg0.naturalHeight || 1920;
    if (!box.width || !heroText.offsetHeight) return;
    const hr = Math.max(heroPhoto.offsetHeight, heroPhoto.offsetWidth * ih / iw);
    const head = heroPhoto.offsetTop + heroPhoto.offsetHeight - hr * (1 - HEAD_TOP);
    const need = heroText.offsetTop + heroText.offsetHeight + 18 - head;
    if (need > 0) pin0.style.setProperty("--hero-shift", Math.ceil(need) + "px");
  };
  const measure = () => {
    heroGuard();
    const y = scrollY, r = s0.getBoundingClientRect();
    b0 = { top: r.top + y, h: r.height }; invTop = inv.getBoundingClientRect().top + y; lastSH = root.scrollHeight;
  };
  const update = () => {
    // 첫 화면: 내릴수록 사진이 살짝 다가오고 이름은 위로 올라가며 사라집니다
    if (SY < b0.top + b0.h + vh * .2) {
      const d = b0.h - vh, p = RM || d <= 0 ? 0 : clamp((SY - b0.top) / d);
      T(heroPhoto, `${(-p * 2).toFixed(2)}%`, 1 + p * .08);
      T(heroText, `${(-p * 150).toFixed(1)}px`); heroText.style.opacity = 1 - seg(p, .35, .95);
      hint.style.opacity = 1 - seg(p, 0, .15);
    }
    const y = scrollY;
    // 참석 의사 창: 첫 화면이 화면 밖으로 거의 다 넘어갔을 때 ~ 초대의 말 중간 사이에서 한 번 (바로가기로 다른 곳에 갔을 때는 띄우지 않음)
    if (!introShown && !introOn && Date.now() - navJump > 2500 && y >= invTop - .12 * innerHeight && y < invTop + .5 * innerHeight) showRsvpIntro();
    if (!greetShown && y >= invTop - .1 * innerHeight && y < invTop + .7 * innerHeight) { greetSeen = true; tryGreet(); }
    // 맺음(어두운 바탕)이 바로가기 자리까지 올라오면 바로가기도 어둡게, 화면 위까지 차면 브라우저 위쪽 색도 어둡게
    const dk = 0;   // V14 는 맺음의 어두운 바탕(사진 · 문구)이 없어 끝까지 밝은 바탕입니다
    if (dk !== dark) { dark = dk; document.body.classList.toggle("dark", dk > 0); theme.content = dk === 2 ? "#101613" : "#f4f4f1"; }
  };
  let raf = 0, lastT = 0;
  const frame = now => {
    raf = 0;
    const dt = lastT && now > lastT ? Math.min(.05, (now - lastT) / 1000) : 1 / 60; lastT = now;
    if (root.scrollHeight !== lastSH) measure();
    const y = scrollY, gap = y - SY;
    // 첫 화면을 지난 뒤에는 따라가는 값이 필요 없습니다
    SY = RM || Math.abs(gap) < .4 || Math.abs(gap) > 2.5 * vh || Math.min(y, SY) > b0.top + b0.h + vh ? y : SY + gap * (1 - Math.exp(-7 * dt));
    update();
    if (SY !== y) raf = requestAnimationFrame(frame); else lastT = 0;
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { vh = innerHeight; measure(); req(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); req(); }).observe($("#app"));
  addEventListener("load", () => { measure(); req(); });
  measure(); SY = scrollY; update();

  /* ---------- 처음 들어왔을 때: 사진 세 장 (V12 와 같음) ----------
   * ① HJH_1628(소파에 앉은 사진)이 천천히 물러나며 보이고 → ② HJH_3357(마주 보는 사진)이 두 사람 쪽으로 다가가다 빛에 잠기고
   * → ③ 첫 화면 사진이 빛 속에서 나타나 자리를 잡습니다. 세 장이 다 지나간 뒤에 이름·날짜가 뜨고 화면을 내릴 수 있습니다.
   * 사진이 늦게 도착하면 잠깐 기다렸다가(각각 최대 2.5~4초) 있는 것만으로 이어 갑니다. */
  const runIntro = () => {
    window.__intro = 1;   // 시작했다는 표시 (index.html 의 9초 안전장치가 잠금을 풀지 않도록)
    const box = $("#intro"), s1i = $(".is1", box), s2i = $(".is2", box), veil = $("#isVeil"), bars = $$("#isBar i"), heroImg = $("#heroImg");
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
      root.classList.add("intro3"); bar(2, T3); box.classList.add("out");
      await wait(T3);
      introOn = false;
      root.classList.add("reveal"); root.classList.remove("intro");
      // 참석 의사 창: 처음의 사진 세 장이 끝나면 곧바로 띄웁니다(스크롤을 기다리지 않음). 그 사이 손으로 내렸으면 예전처럼 내려가는 길에 뜸
      setTimeout(() => { if (!introShown && scrollY < 4 && Date.now() - navJump > 2500) showRsvpIntro(true); }, 450);
      req();
      setTimeout(() => root.classList.remove("reveal", "intro3"), 2400);
    })();
  };
  if (restoreY != null && !introOn) {
    // 보던 자리로: 지금 바로 한 번, 사진 · 글꼴이 다 들어와 높이가 바뀐 뒤 한 번 더(그 사이 손으로 움직였으면 건드리지 않음)
    let moved = false;
    const go = () => { if (moved) return; navJump = Date.now(); introShown = introShown || scrollY > 0; window.scrollTo(0, Math.min(restoreY, root.scrollHeight - innerHeight)); measure(); SY = scrollY; update(); };
    go();
    const stop = () => { moved = true; };
    ["touchstart", "wheel", "keydown"].forEach(t => addEventListener(t, stop, { once: true, passive: true }));
    addEventListener("load", () => setTimeout(go, 60), { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(go, 30));
  }
  if (introOn) runIntro();
})();
