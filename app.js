(() => {
  const C = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = new Date(C.date);
  // KST 기준 날짜 구성요소
  const kst = new Date(D.getTime() + 9 * 3600e3);
  const Y = kst.getUTCFullYear(), M = kst.getUTCMonth() + 1, DD = kst.getUTCDate(), H = kst.getUTCHours(), MI = kst.getUTCMinutes();
  const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"][kst.getUTCDay()];
  const DOW_EN = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][kst.getUTCDay()];
  const hourKo = `${H < 12 ? "오전" : "오후"} ${((H + 11) % 12) + 1}시${MI ? ` ${MI}분` : ""}`;
  const hourEn = `${((H + 11) % 12) + 1}${MI ? ":" + String(MI).padStart(2, "0") : ""}${H < 12 ? "AM" : "PM"}`;
  const pad = n => String(n).padStart(2, "0");

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
  document.body.classList.add("locked");
  const openEnv = () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    document.body.classList.remove("locked");
    setTimeout(() => env.classList.add("gone"), 1150);
    startBgm(true);
  };
  env.addEventListener("click", openEnv);
  env.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && openEnv());

  /* ---------- simple bindings ---------- */
  const bind = {
    groomEn: C.groom.nameEn, brideEn: C.bride.nameEn,
    venueEn: C.venue.nameEn, hallEn: C.venue.hallEn,
    venueName: C.venue.name, venueHall: C.venue.hall, address: C.venue.address,
  };
  $$("[data-bind]").forEach(el => el.textContent = bind[el.dataset.bind] ?? "");
  $$("[data-copy-key]").forEach(b => b.onclick = () => copy(bind[b.dataset.copyKey], "주소가 복사되었습니다"));
  $("#dateEn").textContent = `${String(Y).slice(2)}.${pad(M)}.${pad(DD)}`;
  $("#dateEn").nextElementSibling.textContent = `${DOW_EN}, ${hourEn}`;
  $("#whenKo").textContent = `${Y}년 ${M}월 ${DD}일 ${DOW_KO}요일 ${hourKo}`;
  $("#greeting").innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join("");
  const pRow = p => `<div class="row"><span class="pn">${esc(p.father.name)} · ${esc(p.mother.name)}</span><span class="of">의</span><span class="rel">${esc(p.relation)}</span><span class="me">${esc(p.name)}</span></div>`;
  $("#parents").innerHTML = pRow(C.groom) + pRow(C.bride);

  /* ---------- calendar & countdown ---------- */
  $("#calTitle").textContent = `${Y}. ${pad(M)}. ${pad(DD)}`;
  const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  let g = ["S", "M", "T", "W", "T", "F", "S"].map((d, i) => `<div class="dow${i === 0 ? " sun" : ""}">${d}</div>`).join("");
  for (let i = 0; i < first; i++) g += "<div></div>";
  for (let d = 1; d <= days; d++) {
    const dow = (first + d - 1) % 7;
    g += `<div class="d${dow === 0 ? " sun" : ""}${d === DD ? " day" : ""}">${d}</div>`;
  }
  $("#calendar").innerHTML = `<div class="grid">${g}</div>`;
  const tick = () => {
    const diff = D - Date.now();
    const v = Math.max(0, diff);
    $("#cdD").textContent = Math.floor(v / 864e5);
    $("#cdH").textContent = Math.floor(v / 36e5) % 24;
    $("#cdM").textContent = Math.floor(v / 6e4) % 60;
    $("#cdS").textContent = Math.floor(v / 1e3) % 60;
    const today = new Date(Date.now() + 9 * 3600e3); today.setUTCHours(0, 0, 0, 0);
    const dd = Math.round((Date.UTC(Y, M - 1, DD) - today) / 864e5);
    const n1 = C.groom.name.slice(1), n2 = C.bride.name.slice(1);
    $("#ddayText").innerHTML = dd > 0 ? `${esc(n1)} <span style="color:var(--sun)">♥</span> ${esc(n2)}의 결혼식이 <b>${dd}일</b> 남았습니다.`
      : dd === 0 ? `오늘, ${esc(n1)} <span style="color:var(--sun)">♥</span> ${esc(n2)}가 결혼합니다.` : `${esc(n1)} <span style="color:var(--sun)">♥</span> ${esc(n2)}가 결혼한 지 <b>${-dd}일</b> 되었습니다.`;
  };
  tick(); setInterval(tick, 1000);

  /* ---------- add to calendar ---------- */
  const end = new Date(D.getTime() + (C.durationMinutes || 180) * 6e4);
  const utc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const evTitle = `${C.groom.name} ♥ ${C.bride.name} 결혼식`;
  const loc = `${C.venue.name} ${C.venue.hall} (${C.venue.address})`;
  $("#gcalBtn").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evTitle)}&dates=${utc(D)}/${utc(end)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(C.siteUrl)}`;
  $("#icsBtn").onclick = () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//KO", "BEGIN:VEVENT", `UID:${utc(D)}-wedding@kk`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(D)}`, `DTEND:${utc(end)}`, `SUMMARY:${evTitle}`, `LOCATION:${loc.replace(/,/g, "\\,")}`, `URL:${C.siteUrl}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${evTitle}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "wedding.ics"; a.click();
  };

  /* ---------- gallery (swipe, 확대 없음) ---------- */
  const G = (C.gallery || []).map(f => /^https?:|\//.test(f) ? f : `assets/gallery/${f}`);
  if (G.length) {
    $("#gallerySec").hidden = false;
    const track = $("#gallery");
    track.innerHTML = G.map((s, i) => `<div class="g-slide"><img src="${esc(s)}" alt="사진 ${i + 1}" ${i ? 'loading="lazy"' : ""} draggable="false"></div>`).join("");
    $("#gDots").innerHTML = G.map((_, i) => `<span${i ? "" : ' class="on"'}></span>`).join("");
    const go = i => track.scrollTo({ left: track.clientWidth * Math.max(0, Math.min(G.length - 1, i)), behavior: "smooth" });
    const idx = () => Math.round(track.scrollLeft / track.clientWidth);
    track.addEventListener("scroll", () => { const k = idx(); $$("#gDots span").forEach((d, j) => d.classList.toggle("on", j === k)); }, { passive: true });
    $("#gPrev").onclick = () => go(idx() - 1);
    $("#gNext").onclick = () => go(idx() + 1);
    if (G.length < 2) $(".g-ctrl").hidden = true;
    // 사진 길게 눌러 저장·우클릭·드래그 방지
    track.addEventListener("contextmenu", e => e.preventDefault());
  }
  // 핀치 확대 방지 (iOS Safari는 viewport 설정을 무시하므로 별도 처리)
  document.addEventListener("gesturestart", e => e.preventDefault());
  let lastTouch = 0;
  document.addEventListener("touchend", e => { const n = Date.now(); if (n - lastTouch < 300 && !e.target.closest("button,a,input,textarea,label")) e.preventDefault(); lastTouch = n; }, { passive: false });

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
  $("#transport").innerHTML = C.venue.transport.map(t => `<div class="t"><h4>${esc(t.title)}</h4><ul>${t.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div>`).join("");

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
  const accGroup = (title, list) => {
    const rows = list.filter(a => a.number);
    const body = rows.length ? rows.map(a => `
      <div class="acc-row"><div><div class="who">${esc(a.role)} ${esc(a.name)}</div><div class="bank">${esc(a.bank)}</div><div class="num">${esc(a.number)}</div></div>
      <div class="acc-btns"><button class="mini" data-acc="${esc(`${a.bank} ${a.number} ${a.name}`)}">복사</button>${a.kakaopay ? `<a class="mini kp" href="${esc(a.kakaopay)}" target="_blank" rel="noopener">카카오페이</a>` : ""}</div></div>`).join("")
      : `<div class="acc-empty">계좌 정보가 곧 업데이트될 예정입니다.</div>`;
    return `<div class="acc-group"><button class="acc-head" aria-expanded="false">${title}</button><div class="acc-body">${body}</div></div>`;
  };
  const accG = C.accounts.groom || [], accB = C.accounts.bride || [];
  const hasG = accG.some(a => a.number), hasB = accB.some(a => a.number);
  if (!hasG && !hasB) $("#accountsSec").hidden = true;
  $("#accounts").innerHTML = (hasG ? accGroup("신랑측 계좌번호", accG) : "") + (hasB ? accGroup("신부측 계좌번호", accB) : "");
  $("#accounts").onclick = e => {
    const h = e.target.closest(".acc-head");
    if (h) { const g = h.parentElement; g.classList.toggle("open"); h.setAttribute("aria-expanded", g.classList.contains("open")); }
    const c = e.target.closest("[data-acc]");
    if (c) copy(c.dataset.acc, "계좌번호가 복사되었습니다");
  };

  /* ---------- modals ---------- */
  function openModal(sel) { $(sel).hidden = false; document.body.classList.add("locked"); }
  function closeModal(m) { m.hidden = true; if (!$$(".modal:not([hidden])").length) document.body.classList.remove("locked"); }
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal); });

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
      meal: rf.attend.value === "참석" ? rf.meal.value : "-", note: rf.note.value.trim() };
    if (!data.name) return;
    if (API) {
      const btn = rf.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "전달 중…";
      try { await post(data); toast("소중한 회신 감사합니다"); rf.reset(); rf.classList.remove("absent"); closeModal($("#rsvpModal")); try { localStorage.setItem("rsvp_done", "1"); } catch {} }
      catch { toast("전송에 실패했어요. 잠시 후 다시 시도해주세요"); }
      finally { btn.disabled = false; btn.textContent = "전달하기"; }
    } else if (C.rsvpFallbackPhone) {
      const body = `[참석 회신] ${data.side} / ${data.name} / ${data.attend}${data.attend === "참석" ? ` / 식사 ${data.meal}` : ""}${data.note ? ` / ${data.note}` : ""}`;
      location.href = `sms:${C.rsvpFallbackPhone}${/iPhone|iPad/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    } else {
      toast("참석 회신 기능이 아직 준비 중입니다");
    }
  });

  /* ---------- Guestbook ---------- */
  if (API) {
    $("#guestbookSec").hidden = false;
    let items = [], shownGb = 5;
    const fmt = t => { const d = new Date(t); return isNaN(d) ? "" : `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`; };
    const renderGb = () => {
      $("#gbList").innerHTML = items.length ? items.slice(0, shownGb).map(i => `<div class="gb-item"><div class="h"><b>${esc(i.name)}</b><span>${fmt(i.time)}</span></div><p>${esc(i.message)}</p></div>`).join("")
        : `<p class="muted center">첫 번째 축하 메시지를 남겨주세요.</p>`;
      $("#gbMore").hidden = shownGb >= items.length;
    };
    const load = () => fetch(`${API}?type=guestbook`).then(r => r.json()).then(j => { items = (j.items || []).reverse(); renderGb(); })
      .catch(() => { $("#gbList").innerHTML = `<p class="muted center">메시지를 불러오지 못했습니다.</p>`; });
    load();
    $("#gbMore").onclick = () => { shownGb += 5; renderGb(); };
    $("#gbOpen").onclick = () => openModal("#gbModal");
    $("#gbForm").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target, entry = { type: "guestbook", name: f.name.value.trim(), message: f.message.value.trim() };
      if (!entry.name || !entry.message) return;
      try { await post(entry); items.unshift({ ...entry, time: new Date().toISOString() }); renderGb(); f.reset(); closeModal($("#gbModal")); toast("축하 메시지가 등록되었습니다"); }
      catch { toast("등록에 실패했어요. 잠시 후 다시 시도해주세요"); }
    });
  }

  /* ---------- share ---------- */
  const shareUrl = C.siteUrl || location.href;
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
        content: { title: `${C.groom.name} ♥ ${C.bride.name} 결혼합니다`, description: `${Y}년 ${M}월 ${DD}일 ${DOW_KO}요일 ${hourKo}\n${C.venue.name} ${C.venue.hall}`,
          imageUrl: shareUrl + "assets/og.jpg", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
        buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
          { title: "위치 보기", link: { mobileWebUrl: shareUrl + "#location", webUrl: shareUrl + "#location" } }],
      });
    };
    document.head.appendChild(s);
  }

  /* ---------- BGM ---------- */
  const audio = $("#bgm"), bgmBtn = $("#bgmBtn");
  function startBgm(fromOpen) {
    if (!C.bgm) return;
    if (!audio.src) audio.src = C.bgm;
    audio.volume = .5;
    audio.play().then(() => bgmBtn.classList.add("on")).catch(() => {});
  }
  if (C.bgm) {
    bgmBtn.hidden = false;
    bgmBtn.onclick = () => { if (audio.paused) startBgm(); else { audio.pause(); bgmBtn.classList.remove("on"); } };
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));

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
      ctx.shadowColor = "rgba(120,118,95,.35)"; ctx.shadowBlur = 2;
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
