(() => {
  const C = window.WEDDING;
  // V3 설정: v3 에 적지 않은 항목은 v2 값을 그대로 씁니다
  const V = Object.assign({}, C.v2, C.v3);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = new Date(C.date);
  // KST 기준 날짜 구성요소
  const kst = new Date(D.getTime() + 9 * 3600e3);
  const Y = kst.getUTCFullYear(), M = kst.getUTCMonth() + 1, DD = kst.getUTCDate(), H = kst.getUTCHours(), MI = kst.getUTCMinutes();
  const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const DOW_EN = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][kst.getUTCDay()];
  const MONTH_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"][M - 1];
  const pad = n => String(n).padStart(2, "0");
  const h12 = ((H + 11) % 12) + 1;
  const hourKo = `${H < 12 ? "오전" : "오후"} ${h12}시${MI ? ` ${MI}분` : ""}`;
  const hourEn = `${h12}${MI ? ":" + pad(MI) : ""}${H < 12 ? "AM" : "PM"}`;
  const clockEn = `${H < 12 ? "AM" : "PM"} ${h12}:${pad(MI)}`;
  // 사진·음악 경로: 파일명만 적으면 assets/gallery/ 에서 찾습니다
  const isAbs = f => /^(https?:)?\/\//.test(f) || f.startsWith("/");
  const photo = (f, thumb) => !f ? "" : isAbs(f) ? f : `../assets/gallery/${thumb ? "thumb/" : ""}${f}`;

  /* ---------- toast / copy ---------- */
  let tt;
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); };
  const copy = async (text, msg = "복사되었습니다") => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast(msg);
  };

  /* ---------- envelope ---------- */
  const env = $("#envelope");
  const skipIntro = new URLSearchParams(location.search).has("open");
  const openEnv = () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    setTimeout(() => { document.body.classList.remove("locked"); document.body.classList.add("opened"); }, 700);
    setTimeout(() => env.classList.add("gone"), 1950);
    setTimeout(showRsvpIntro, 2700);
    startBgm();
  };
  if (skipIntro) { env.classList.add("open", "gone"); document.body.classList.add("opened"); setTimeout(showRsvpIntro, 900); }
  else {
    document.body.classList.add("locked");
    env.addEventListener("click", openEnv);
    env.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && openEnv());
  }
  $("#sealMono").innerHTML = `${esc(C.groom.nameEn[0])}<i>&amp;</i>${esc(C.bride.nameEn[0])}`;
  $("#sealDate").textContent = `${Y}.${pad(M)}.${pad(DD)}`;

  /* ---------- simple bindings ---------- */
  const bind = {
    groomEn: C.groom.nameEn, brideEn: C.bride.nameEn, groomName: C.groom.name, brideName: C.bride.name,
    venueEn: C.venue.nameEn, hallEn: C.venue.hallEn,
    venueName: C.venue.name, venueHall: C.venue.hall, address: C.venue.address,
  };
  $$("[data-bind]").forEach(el => el.textContent = bind[el.dataset.bind] ?? "");
  $$("[data-copy-key]").forEach(b => b.onclick = () => copy(bind[b.dataset.copyKey], "주소가 복사되었습니다"));
  const whenKo = `${Y}년 ${M}월 ${DD}일 ${DOW_KO}요일 ${hourKo}`;

  /* ---------- cover ---------- */
  $("#cvDate").innerHTML = `<span>${Y}</span><i>/</i><span>${pad(M)}</span><i>/</i><span>${pad(DD)}</span>`;
  $("#cvDow").textContent = DOW_EN;
  $("#cvWhen").textContent = whenKo;
  const setPhoto = (boxSel, imgSel, file) => { if (!file) return false; $(imgSel).src = photo(file); $(boxSel).hidden = false; return true; };
  setPhoto("#cvPhoto", "#cvImg", V.cover || (C.gallery || [])[0]);

  /* ---------- printed card ---------- */
  $("#pcDate").textContent = `${String(Y).slice(2)}.${pad(M)}.${pad(DD)}`;
  $("#pcDow").textContent = `${DOW_EN}, ${hourEn}`;

  /* ---------- invitation ---------- */
  $("#greeting").innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  const pRow = p => `<div class="row"><span class="pn">${esc(p.father.name)} · ${esc(p.mother.name)}</span><span class="of">의</span><span class="rel">${esc(p.relation)}</span><span class="me">${esc(p.name)}</span></div>`;
  $("#parents").innerHTML = pRow(C.groom) + pRow(C.bride);

  /* ---------- profile (선택) ---------- */
  const pf = V.profiles || {};
  const pfHtml = [["groom", "신랑"], ["bride", "신부"]].map(([k, tag]) => {
    const p = pf[k] || {}, lines = p.text || [];
    if (!lines.length) return "";
    return `<div class="pf rv"><div class="pf-photo${p.photo ? "" : " ph"}">${p.photo ? `<img src="${esc(photo(p.photo))}" alt="${tag} ${esc(C[k].name)}" loading="lazy" draggable="false">` : "<span>PHOTO</span>"}</div>
      <div><div class="pf-head"><small>${tag}</small><b>${esc(C[k].name)}</b></div><div class="pf-body">${lines.map(l => `<p>${esc(l)}</p>`).join("")}</div></div></div>`;
  }).join("");
  if (pfHtml) { $("#profiles").innerHTML = pfHtml; $("#profileSec").hidden = false; }

  /* ---------- calendar & countdown ---------- */
  $("#calTitle").textContent = `${Y}.${pad(M)}.${pad(DD)}`;
  $("#calSub").innerHTML = `${esc(`${DOW_KO}요일 ${hourKo}`)}<br>${esc(`${C.venue.name} ${C.venue.hall}`)}`;   // 날짜·시간 아래에 장소도
  const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let g = ["일", "월", "화", "수", "목", "금", "토"].map((d, i) => `<div class="dow${i === 0 ? " sun" : ""}">${d}</div>`).join("");
  for (let i = 0; i < first; i++) g += "<div></div>";
  for (let d = 1; d <= days; d++) {
    const dow = (first + d - 1) % 7;
    g += `<div class="d${dow === 0 ? " sun" : ""}${d === DD ? " day" : ""}">${d}</div>`;
  }
  $("#calendar").innerHTML = `<div class="grid">${g}</div>`;
  const kstToday = () => { const t = new Date(Date.now() + 9 * 3600e3); t.setUTCHours(0, 0, 0, 0); return t; };
  const tick = () => {
    const v = Math.max(0, D - Date.now());
    $("#cdD").textContent = Math.floor(v / 864e5);
    $("#cdH").textContent = pad(Math.floor(v / 36e5) % 24);
    $("#cdM").textContent = pad(Math.floor(v / 6e4) % 60);
    $("#cdS").textContent = pad(Math.floor(v / 1e3) % 60);
    const dd = Math.round((Date.UTC(Y, M - 1, DD) - kstToday()) / 864e5);
    const n1 = esc(C.groom.name.slice(1)), n2 = esc(C.bride.name.slice(1));
    $("#ddayText").innerHTML = dd > 0 ? `${n1}, ${n2}의 결혼식이 <b>${dd}일</b> 남았습니다.`
      : dd === 0 ? `오늘, ${n1}, ${n2}가 결혼합니다.` : `${n1}, ${n2}가 결혼한 지 <b>${-dd}일</b> 되었습니다.`;
  };
  tick(); setInterval(tick, 1000);

  /* ---------- 함께한 날 (선택) ---------- */
  if (V.togetherSince) {
    const [ty, tm, td] = V.togetherSince.split("-").map(Number);
    const n = Math.round((kstToday() - Date.UTC(ty, tm - 1, td)) / 864e5) + 1;
    if (n > 0) {
      const box = $("#together"), out = $("#tgDays"); box.hidden = false; out.textContent = "0";
      new IntersectionObserver((es, o) => es.forEach(e => {
        if (!e.isIntersecting) return; o.disconnect();
        const t0 = performance.now(), dur = 1400;
        const step = t => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3); out.textContent = Math.round(n * ease).toLocaleString("ko-KR"); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }), { threshold: .6 }).observe(box);
    }
  }

  /* ---------- add to calendar ---------- */
  const end = new Date(D.getTime() + (C.durationMinutes || 180) * 6e4);
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const evTitle = `${C.groom.name} ♥ ${C.bride.name} 결혼식`;
  const loc = `${C.venue.name} ${C.venue.hall} (${C.venue.address})`;
  const shareUrl = C.siteUrl ? C.siteUrl + "v3/" : location.href.split(/[?#]/)[0];
  $("#gcalBtn").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evTitle)}&dates=${utc(D)}/${utc(end)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(shareUrl)}`;
  $("#icsBtn").onclick = () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//KO", "BEGIN:VEVENT", `UID:${utc(D)}-wedding@kk`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(D)}`, `DTEND:${utc(end)}`, `SUMMARY:${evTitle}`, `LOCATION:${loc.replace(/,/g, "\\,")}`, `URL:${shareUrl}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${evTitle}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "wedding.ics"; a.click();
  };

  /* ---------- 우리 이야기 ---------- */
  const ST = (V.story || []).filter(s => s && (s.title || s.text));
  if (ST.length) {
    $("#storySec").hidden = false;
    setPhoto("#stPhoto", "#stImg", V.storyPhoto);
    $("#storyList").innerHTML = ST.map(s => `<li>${s.date ? `<time>${esc(s.date)}</time>` : ""}${s.title ? `<h4>${esc(s.title)}</h4>` : ""}${s.text ? `<p>${esc(s.text)}</p>` : ""}${s.photo ? `<img src="${esc(photo(s.photo))}" alt="" loading="lazy" draggable="false">` : ""}</li>`).join("");
    $("#storyOpen").onclick = () => openModal("#storyModal");
  }

  /* ---------- interview (선택) ---------- */
  const QA = (V.interview || []).filter(q => q && q.q);
  if (QA.length) {
    $("#interviewSec").hidden = false;
    $("#qaList").innerHTML = QA.map(q => `<div class="qa"><h4>${esc(q.q)}</h4>${q.groom ? `<p><b>신랑 ${esc(C.groom.name.slice(1))}</b>${esc(q.groom)}</p>` : ""}${q.bride ? `<p><b>신부 ${esc(C.bride.name.slice(1))}</b>${esc(q.bride)}</p>` : ""}</div>`).join("");
    $("#interviewOpen").onclick = () => openModal("#interviewModal");
  }

  /* ---------- date banner ---------- */
  $("#bnRows").innerHTML = [["WE", "ARE", "GETTING", "MARRIED"], [DD, MONTH_EN, Y], [DOW_EN, clockEn], C.venue.nameEn.split(" ")]
    .map(r => `<div>${r.map(w => `<span>${w}</span>`).join("")}</div>`).join("");
  setPhoto("#bnPhoto", "#bnImg", V.banner);

  /* ---------- location ---------- */
  const q = encodeURIComponent(C.venue.name);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${encodeURIComponent(C.venue.name + " " + C.venue.address)}&hl=ko&z=16&output=embed`;
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/to/${q},${C.venue.lat},${C.venue.lng}`;
  $("#navTmap").href = `tmap://route?goalname=${q}&goalx=${C.venue.lng}&goaly=${C.venue.lat}`;
  $("#navTmap").addEventListener("click", () => {
    setTimeout(() => { if (!document.hidden) toast("티맵 앱이 설치되어 있어야 합니다"); }, 1500);
  });
  if (C.venue.tel) { $("#venueTel").textContent = `Tel. ${C.venue.tel}`; $("#venueTel").href = `tel:${C.venue.tel}`; }
  // "2호선", "1·2호선" → 노선 색 동그라미
  const lineBadge = s => esc(s).replace(/((?:\d·)*\d)호선/g, (m, nums) => nums.split("·").map(n => `<i class="ln ln${n}">${n}</i>`).join("") + "호선");
  $("#transport").innerHTML = C.venue.transport.map(t => `<div class="t"><h4>${esc(t.title)}</h4><ul>${t.lines.map(l => `<li>${lineBadge(l)}</li>`).join("")}</ul></div>`).join("");

  // 약도 이미지 (v3.mapImage 에 assets/ 기준 파일 경로를 적으면 버튼 표시)
  if (V.mapImage) {
    $("#mapImgBtn").hidden = false;
    $("#mapImgBtn").onclick = () => { $("#mapImg").src = isAbs(V.mapImage) ? V.mapImage : "../assets/" + V.mapImage; openModal("#mapImgModal"); };
  }

  /* ---------- notices (선택) ---------- */
  const NT = (V.notices || []).filter(n => n && n.title);
  if (NT.length) {
    $("#noticeSec").hidden = false;
    $("#notices").innerHTML = NT.map(n => `<div class="notice rv"><h4>${esc(n.title)}</h4>${(n.lines || []).map(l => `<p>${esc(l)}</p>`).join("")}</div>`).join("");
  }

  /* ---------- gallery (2단 엇갈림 + 크게 보기) ---------- */
  const G = (C.gallery || []).map(f => ({ full: photo(f), thumb: photo(f, true) }));
  if (G.length) {
    $("#gallerySec").hidden = false;
    const grid = $("#gGrid");
    const item = (g, i) => `<button class="g-item rv" data-i="${i}" aria-label="사진 ${i + 1} 크게 보기"><img src="${esc(g.full)}" alt="사진 ${i + 1}" loading="lazy" draggable="false"></button>`;
    if (G.length === 1) { grid.classList.add("single"); grid.innerHTML = item(G[0], 0); }
    else grid.innerHTML = [0, 1].map(c => `<div class="g-col">${G.map((g, i) => i % 2 === c ? item(g, i) : "").join("")}</div>`).join("");
    const lb = $("#lightbox"), track = $("#lbTrack");
    $("#lbTotal").textContent = G.length;
    const openLb = i => {
      if (!track.children.length) track.innerHTML = G.map((g, k) => `<div class="lb-slide"><img src="${esc(g.full)}" alt="사진 ${k + 1}" draggable="false"></div>`).join("");
      lb.hidden = false; document.body.classList.add("locked");
      track.scrollLeft = track.clientWidth * i; $("#lbCur").textContent = i + 1;
    };
    const closeLb = () => { lb.hidden = true; unlock(); };
    grid.onclick = e => { const b = e.target.closest(".g-item"); if (b) openLb(+b.dataset.i); };
    track.addEventListener("scroll", () => { $("#lbCur").textContent = Math.round(track.scrollLeft / track.clientWidth) + 1; }, { passive: true });
    track.onclick = closeLb; $("#lbClose").onclick = closeLb;
    // 사진 길게 눌러 저장·우클릭 방지
    [grid, lb].forEach(el => el.addEventListener("contextmenu", e => e.preventDefault()));
  }
  $$(".cv-photo,.bn-photo,.end-photo").forEach(el => el.addEventListener("contextmenu", e => e.preventDefault()));

  /* ---------- contacts ---------- */
  const people = side => {
    const s = C[side], tag = side === "groom" ? "신랑" : "신부";
    return [[tag, s.name, s.phone], [`${tag} 아버지`, s.father.name, s.father.phone], [`${tag} 어머니`, s.mother.name, s.mother.phone]].filter(p => p[2]);
  };
  const cg = people("groom"), cb = people("bride");
  if (cg.length || cb.length) {
    $("#contactBtn").hidden = false;
    const block = (title, arr) => arr.length ? `<div><h4>${title}</h4>${arr.map(([w, n, ph]) => `<div class="c-row"><span><span class="who">${esc(w)}</span>${esc(n)}</span><span class="actions"><a class="mini" href="tel:${esc(ph)}">전화</a><a class="mini" href="sms:${esc(ph)}">문자</a></span></div>`).join("")}</div>` : "";
    $("#contactList").innerHTML = block("GROOM", cg) + block("BRIDE", cb);
    $("#contactBtn").onclick = () => openModal("#contactModal");
  }

  /* ---------- accounts ---------- */
  const copyIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.500" y="8.500" width="11" height="11" rx="2"/><path d="M15.500 5.500v-1a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1"/></svg>`;
  const accGroup = (title, list) => {
    const rows = list.filter(a => a.number);
    const body = rows.map(a => `
      <div class="acc-row"><div><div class="who"><small>${esc(a.role)}</small>${esc(a.name)}</div><div class="num">${esc(a.bank)} <b>${esc(a.number)}</b></div></div>
      <div class="acc-btns"><button class="mini" data-acc="${esc(`${a.bank} ${a.number} ${a.name}`)}">${copyIcon}복사</button>${a.kakaopay ? `<a class="mini kp" href="${esc(a.kakaopay)}" target="_blank" rel="noopener">카카오페이</a>` : ""}</div></div>`).join("");
    return `<div class="acc-group"><button class="acc-head" aria-expanded="false">${title}</button><div class="acc-body">${body}</div></div>`;
  };
  const accG = C.accounts.groom || [], accB = C.accounts.bride || [];
  const hasG = accG.some(a => a.number), hasB = accB.some(a => a.number);
  if (!hasG && !hasB) $("#accountsSec").hidden = true;
  $("#accounts").innerHTML = (hasG ? accGroup("신랑측 계좌번호", accG) : "") + (hasB ? accGroup("신부측 계좌번호", accB) : "");
  $("#accounts").onclick = e => {
    const h = e.target.closest(".acc-head");
    if (h) { const grp = h.parentElement; grp.classList.toggle("open"); h.setAttribute("aria-expanded", grp.classList.contains("open")); }
    const c = e.target.closest("[data-acc]");
    if (c) copy(c.dataset.acc, "계좌번호가 복사되었습니다");
  };

  /* ---------- modals ---------- */
  function unlock() { if (!$$(".modal:not([hidden])").length && $("#lightbox").hidden && env.classList.contains("open")) document.body.classList.remove("locked"); }
  function openModal(sel) { $(sel).hidden = false; document.body.classList.add("locked"); }
  function closeModal(m) { m.hidden = true; unlock(); }
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    $$(".modal:not([hidden])").forEach(closeModal);
    if (!$("#lightbox").hidden) { $("#lightbox").hidden = true; unlock(); }
  });

  /* ---------- backend (Google Apps Script) ---------- */
  const API = C.appsScriptUrl;
  const post = payload => fetch(API, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });

  /* ---------- RSVP ---------- */
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
      try { await post(data); toast("소중한 회신 감사합니다"); rf.reset(); rf.classList.remove("absent"); closeModal($("#rsvpModal")); try { localStorage.setItem("rsvp_done", "1"); } catch {} }
      catch { toast("전송에 실패했어요. 잠시 후 다시 시도해주세요"); }
      finally { btn.disabled = false; btn.textContent = "전달하기"; }
    } else if (C.rsvpFallbackPhone) {
      const body = `[참석 회신] ${data.side} / ${data.name} / ${data.attend}${data.note ? ` / ${data.note}` : ""}`;
      location.href = `sms:${C.rsvpFallbackPhone}${/iPhone|iPad/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    } else {
      toast("참석 회신 기능이 아직 준비 중입니다");
    }
  });

  /* ---------- Guestbook (가로로 넘기는 카드) ---------- */
  if (API) {
    $("#guestbookSec").hidden = false;
    let items = [];
    const fmt = t => { const d = new Date(t); return isNaN(d) ? "" : `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`; };
    const renderGb = () => {
      $("#gbTrack").innerHTML = items.length ? items.slice(0, 10).map(i => `<div class="gb-card"><p>${esc(i.message)}</p><span>- ${esc(i.name)} -</span></div>`).join("")
        : `<div class="gb-card empty"><p>첫 번째 축하 메시지를 남겨주세요.</p></div>`;
      $("#gbTrack").scrollLeft = 0;
      $("#gbAll").hidden = !items.length;
      $("#gbList").innerHTML = items.map(i => `<div class="gb-item"><div class="h"><b>${esc(i.name)}</b><span>${fmt(i.time)}</span></div><p>${esc(i.message)}</p></div>`).join("");
    };
    fetch(`${API}?type=guestbook`).then(r => r.json()).then(j => { items = (j.items || []).reverse(); renderGb(); photoReady = j.photoUpload === true; updatePhoto(); })
      .catch(() => { $("#gbTrack").innerHTML = `<div class="gb-card empty"><p>메시지를 불러오지 못했습니다.</p></div>`; });
    $("#gbOpen").onclick = () => openModal("#gbModal");
    $("#gbAll").onclick = () => openModal("#gbAllModal");
    $("#gbForm").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target, entry = { type: "guestbook", name: f.name.value.trim(), message: f.message.value.trim() };
      if (!entry.name || !entry.message) return;
      try { await post(entry); items.unshift({ ...entry, time: new Date().toISOString() }); renderGb(); f.reset(); closeModal($("#gbModal")); toast("축하 메시지가 등록되었습니다"); }
      catch { toast("등록에 실패했어요. 잠시 후 다시 시도해주세요"); }
    });
  }

  /* ---------- 접속 시 참석 의사 안내 ---------- */
  $("#popWhen").textContent = `${Y}. ${pad(M)}. ${pad(DD)} (${DOW_KO}) ${hourKo}`;
  const todayKey = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  function showRsvpIntro() {
    if (V.rsvpPopup === false || Date.now() > D.getTime()) return;                 // 꺼 두었거나 예식이 지난 뒤
    if (store.get("rsvp_done") || store.get("rsvp_skip") === todayKey()) return;     // 이미 회신했거나 오늘 보지 않기
    if ($$(".modal:not([hidden])").length || !$("#lightbox").hidden) return;
    openModal("#rsvpIntro");
  }
  $("#rsvpIntroGo").onclick = () => { closeModal($("#rsvpIntro")); openModal("#rsvpModal"); };
  $("#rsvpIntroSkip").onclick = () => { store.set("rsvp_skip", todayKey()); closeModal($("#rsvpIntro")); };

  /* ---------- 축하 사진 공유 ---------- */
  // 백엔드(Apps Script)가 사진 저장을 지원한다고 알려줄 때만, 예식 시작 시각부터 업로드가 열립니다
  var photoReady = false;
  function updatePhoto() {
    if (!V.photoShare || !API) return;
    const open = Date.now() >= D.getTime();
    $("#photoBtn").disabled = !(open && photoReady);
    $("#photoNote").textContent = !open ? `${Y}-${pad(M)}-${pad(DD)} ${pad(H)}:${pad(MI)}부터 업로드할 수 있습니다.`
      : photoReady ? "한 번에 10장까지 올릴 수 있습니다." : "사진 업로드를 준비하고 있습니다.";
  }
  if (V.photoShare && API) {
    $("#photoSec").hidden = false;
    $("#phStack").innerHTML = (C.gallery || []).slice(0, 3).map(f => `<i><img src="${esc(photo(f, true))}" alt="" loading="lazy" draggable="false"></i>`).join("");
    updatePhoto();
    const shrink = file => new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight));
        const cv = document.createElement("canvas"); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        res(cv.toDataURL("image/jpeg", .85).split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("image")); };
      img.src = url;
    });
    const input = $("#photoInput"), btn = $("#photoBtn");
    btn.onclick = () => input.click();
    input.onchange = async () => {
      const files = [...input.files].filter(f => f.type.startsWith("image/")).slice(0, 10);
      if (!files.length) return;
      btn.disabled = true; let sent = 0;
      for (const [i, f] of files.entries()) {
        toast(`사진 ${files.length}장 중 ${i + 1}장 보내는 중…`);
        try { await post({ type: "photo", data: await shrink(f) }); sent++; } catch {}
      }
      input.value = ""; updatePhoto();
      toast(sent ? `사진 ${sent}장을 보냈습니다. 감사합니다` : "사진을 보내지 못했어요. 잠시 후 다시 시도해주세요");
    };
  }

  /* ---------- 사진 액자 ---------- */
  const FR = (V.frames || []).filter(f => f && f.photo);
  if (FR.length) {
    $("#framesSec").hidden = false;
    $("#framesSec").innerHTML = FR.map((f, i) => `<figure class="frame rv${i % 2 ? " alt" : ""}"><div class="fr-mat"><img src="${esc(photo(f.photo))}" alt="" loading="lazy" draggable="false"></div>${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ""}</figure>`).join("");
    $("#framesSec").addEventListener("contextmenu", e => e.preventDefault());
  }

  /* ---------- ending ---------- */
  $("#endDate").textContent = `${Y}. ${pad(M)}. ${pad(DD)} ${DOW_EN.slice(0, 3)}`;
  $("#endTime").textContent = clockEn;
  $$("#endDate,#endTime").forEach(el => el.classList.add("en"));
  if (setPhoto("#endPhoto", "#endImg", V.ending)) $("#endText").innerHTML = (V.endingText || []).map(l => `<p>${esc(l)}</p>`).join("");
  $("#footDate").textContent = `${Y} . ${pad(M)} . ${pad(DD)}`;

  /* ---------- share ---------- */
  const ogImage = (C.siteUrl || shareUrl) + "assets/og-v2.jpg";
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
          imageUrl: ogImage, link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
        buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
          { title: "위치 보기", link: { mobileWebUrl: shareUrl + "#location", webUrl: shareUrl + "#location" } }],
      });
    };
    document.head.appendChild(s);
  }

  /* ---------- 바로가기 메뉴 ---------- */
  const MENU = [["invitation", "초대합니다", "INVITATION"], ["profileSec", "두 사람 소개", "PROFILE"], ["calendarSec", "예식 일시", "DATE"], ["storySec", "우리 이야기", "OUR STORY"], ["interviewSec", "인터뷰", "INTERVIEW"],
    ["location", "오시는 길", "LOCATION"], ["noticeSec", "안내 말씀", "NOTICE"], ["gallerySec", "웨딩 갤러리", "GALLERY"], ["guestbookSec", "방명록", "GUESTBOOK"],
    ["accountsSec", "마음 전하실 곳", "ACCOUNT"], ["rsvp", "참석 의사 전달", "R.S.V.P."], ["photoSec", "축하 사진 공유", "PHOTO"]];
  $("#menuBtn").onclick = () => {
    $("#menuList").innerHTML = MENU.filter(([id]) => !$("#" + id).hidden).map(([id, ko, en]) => `<a href="#${id}">${ko}<small>${en}</small></a>`).join("");
    openModal("#menuModal");
  };
  $("#menuList").onclick = e => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault(); closeModal($("#menuModal"));
    $(a.getAttribute("href")).scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- BGM ---------- */
  const audio = $("#bgm"), bgmBtn = $("#bgmBtn");
  function startBgm() {
    if (!C.bgm) return;
    if (!audio.src) audio.src = isAbs(C.bgm) ? C.bgm : "../" + C.bgm;
    audio.volume = .5;
    audio.play().then(() => bgmBtn.classList.add("on")).catch(() => {});
  }
  if (C.bgm) {
    bgmBtn.hidden = false;
    bgmBtn.onclick = () => { if (audio.paused) startBgm(); else { audio.pause(); bgmBtn.classList.remove("on"); } };
  }

  /* ---------- reveal on scroll (섹션 안에서 차례로 등장) ---------- */
  $$("main > section").forEach(sec => $$(".rv", sec).forEach((el, i) => el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1, rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach(el => io.observe(el));
  } else $$(".rv").forEach(el => el.classList.add("in"));

  /* ---------- snow ---------- */
  if (C.snow && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cv = $("#snow"), ctx = cv.getContext("2d");
    let W, Hh, flakes;
    const resize = () => { const r = devicePixelRatio || 1; W = innerWidth; Hh = innerHeight; cv.width = W * r; cv.height = Hh * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
    resize(); addEventListener("resize", resize);
    flakes = Array.from({ length: Math.round(Math.min(W, 440) / 12) }, () => ({ x: Math.random() * W, y: Math.random() * Hh, r: Math.random() * 1.8 + .6, s: Math.random() * .5 + .25, d: Math.random() * Math.PI * 2 }));
    const draw = () => {
      ctx.clearRect(0, 0, W, Hh);
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.shadowColor = "rgba(60,80,66,.35)"; ctx.shadowBlur = 2;
      for (const f of flakes) {
        f.y += f.s; f.d += .01; f.x += Math.sin(f.d) * .3;
        if (f.y > Hh + 5) { f.y = -5; f.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
})();
