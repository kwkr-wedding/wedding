/* 모바일 청첩장 — invitation.config.js의 내용을 읽어 화면을 만듭니다. */
(() => {
  'use strict';
  const C = window.INVITATION;
  if (!C) return;

  const $ = (s, r = document) => r.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 도우미 ─────────────────────────────────────────────
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v; // 아래 ICONS 같은 고정 문자열에만 사용
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return n;
  };
  const multiline = (text, cls) =>
    el('p', { class: cls }, String(text || '').split('\n').flatMap((l, i, a) => (i < a.length - 1 ? [l, el('br')] : [l])));
  const pad2 = (n) => String(n).padStart(2, '0');

  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    sms: svg('<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
    copy: svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    menu: svg('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/>'),
    close: svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'),
    right: svg('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    chevL: svg('<polyline points="15 18 9 12 15 6"/>'),
    chevR: svg('<polyline points="9 18 15 12 9 6"/>'),
    music: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    share: svg('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'),
    map: svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  };
  const icon = (name) => el('span', { html: ICONS[name], style: 'display:contents' });

  // 사진 경로가 비어 있을 때 쓰는 자리표시 이미지
  const TONES = [['#D9D2C5', '#B7AE9E'], ['#CFD6CC', '#A5B2A1'], ['#E3D6CC', '#C2AB9D'], ['#D6D4DB', '#ADABB9']];
  let toneIdx = 0;
  const placeholder = (label, w, h) => {
    const [a, b] = TONES[toneIdx++ % TONES.length];
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${Math.round(w / 15)}" fill="rgba(255,255,255,.9)">${label}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  };
  // opts.ratio: "4 / 5"처럼 보여 줄 비율, opts.position: 잘릴 때 기준 위치(예: "center 30%")
  const photo = (src, label, w, h, eager, opts = {}) => {
    const style = [opts.ratio && `aspect-ratio:${opts.ratio}`, opts.position && `object-position:${opts.position}`].filter(Boolean).join(';');
    return el('img', { src: src || placeholder(label, w, h), alt: label, width: w, height: h, loading: eager ? 'eager' : 'lazy', style: style || null });
  };

  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('in'), 2000);
  };
  const copyText = async (text, done) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = el('textarea', { style: 'position:fixed;opacity:0' });
      t.value = text;
      document.body.append(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    toast(done);
  };

  // ── 날짜 계산 (보는 사람의 시간대와 무관하게 한국 시간 기준) ──────
  const W = C.wedding;
  const [Y, M, D] = W.date.split('-').map(Number);
  const [hh, mm] = W.time.split(':').map(Number);
  const WD_EN = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const WD_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTH_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const dow = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
  const instant = new Date(`${W.date}T${W.time}:00+09:00`);
  const todayKST = () => {
    const k = new Date(Date.now() + 9 * 3600e3);
    return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  };
  const daysBetween = (fromUTC, toUTC) => Math.round((toUTC - fromUTC) / 864e5);
  const ampm = hh < 12 ? '오전' : hh === 12 ? '낮' : '오후';
  const timeKo = `${ampm} ${hh % 12 || 12}시${mm ? ` ${mm}분` : ''}`;
  const timeEn = `${hh < 12 ? 'AM' : 'PM'} ${pad2(hh % 12 || 12)}:${pad2(mm)}`;
  const dateKo = `${Y}년 ${M}월 ${D}일 ${WD_KO[dow]}요일`;

  const G = C.couple.groom, B = C.couple.bride;
  const groomName = G.family_name + G.given_name;
  const brideName = B.family_name + B.given_name;
  const pair = C.couple.bride_first ? [brideName, groomName] : [groomName, brideName];
  const venue = [W.hall_name, W.hall_detail].filter(Boolean).join(' ');

  // ── 디자인 값 적용 ──────────────────────────────────────
  const root = document.documentElement.style;
  const DS = C.design || {};
  if (DS.accent_color) root.setProperty('--accent', DS.accent_color);
  if (DS.accent_deep) root.setProperty('--accent-deep', DS.accent_deep);
  if (DS.background_color) root.setProperty('--paper', DS.background_color);
  document.title = `${M}월 ${D}일 ${pair[0]} ♥ ${pair[1]} 결혼합니다.`;

  // ── 팝업 ───────────────────────────────────────────────
  const layer = $('#popup-layer');
  let lastFocus = null;
  let sheetOnClose = null;
  const closeSheet = () => {
    layer.hidden = true;
    layer.replaceChildren();
    document.body.classList.remove('locked');
    const cb = sheetOnClose;
    sheetOnClose = null;
    lastFocus?.focus?.();
    cb?.();
  };
  // opts.closeLabel: X 대신 글자 버튼(예: 건너뛰기), opts.onClose: 닫힌 뒤 실행
  const openSheet = (title, content, opts = {}) => {
    lastFocus = document.activeElement;
    sheetOnClose = opts.onClose || null;
    const closeBtn = opts.closeLabel
      ? el('button', { class: 'text-btn', type: 'button', onclick: closeSheet }, opts.closeLabel)
      : el('button', { class: 'icon-btn plain', type: 'button', 'aria-label': '닫기', onclick: closeSheet }, icon('close'));
    const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      el('header', { class: 'sheet-head' }, el('h2', {}, title), closeBtn),
      el('div', { class: 'sheet-body' }, content));
    layer.replaceChildren(sheet);
    layer.hidden = false;
    document.body.classList.add('locked');
    requestAnimationFrame(() => sheet.classList.add('in'));
    closeBtn.focus();
  };

  // ── 참석 의사 전달 (RSVP) ────────────────────────────────
  const R = C.rsvp || {};
  const rsvpOpen = !!R.enabled && Date.now() < instant.getTime(); // 예식 이후에는 받지 않음
  const RSVP_KEY = 'rsvp_done'; // 기존 청첩장(v1~v3)과 같은 이름이라, 거기서 응답한 분께는 다시 묻지 않습니다.
  // 저장 서버가 연결된 경우에만 "이미 응답함"을 기억합니다. 주소가 비어 있으면 매번 다시 묻습니다.
  const rsvpDone = () => { try { return !!R.endpoint && localStorage.getItem(RSVP_KEY) === '1'; } catch { return false; } };

  function openRsvp({ gate = false, onDone } = {}) {
    const fields = R.fields || ['phone', 'companions', 'meal', 'message'];
    const has = (f) => fields.includes(f);
    const choices = (name, legend, options, value) =>
      el('fieldset', { class: 'field' }, el('legend', {}, legend),
        el('div', { class: 'choices' }, options.map(([val, label]) =>
          el('label', { class: 'choice' }, el('input', { type: 'radio', name, value: val, checked: val === value }), el('span', {}, label)))));
    const textField = (name, label, attrs) => {
      const input = el('input', { id: `rsvp-${name}`, name, ...attrs });
      return el('div', { class: 'field' }, el('label', { for: `rsvp-${name}` }, label), input);
    };

    let companions = 0;
    const compOut = el('output', { 'aria-live': 'polite' }, '0');
    const step = (d) => { companions = Math.min(9, Math.max(0, companions + d)); compOut.textContent = companions; };
    const attendOnly = el('div', {},
      has('companions') && el('div', { class: 'field' }, el('span', { class: 'field-label' }, '동행 인원 (본인 제외)'),
        el('div', { class: 'stepper' },
          el('button', { type: 'button', 'aria-label': '동행 인원 줄이기', onclick: () => step(-1) }, '−'),
          compOut,
          el('button', { type: 'button', 'aria-label': '동행 인원 늘리기', onclick: () => step(1) }, '+'))),
      has('meal') && choices('meal', '식사 여부', [['yes', '식사함'], ['no', '식사 안 함'], ['unsure', '미정']], 'yes'));

    const consent = el('input', { type: 'checkbox', id: 'rsvp-consent', name: 'consent' });
    const status = el('p', { class: 'form-status', role: 'alert' });
    const submit = el('button', { class: 'btn primary', type: 'submit' }, '신랑 · 신부에게 전달하기');
    const form = el('form', { class: 'rsvp-form', novalidate: true },
      multiline(R.popup_message || '예식 준비에 참고할 수 있도록\n참석 여부를 알려 주시면 감사하겠습니다.', 'soft'),
      el('p', { class: 'rsvp-summary' }, `${dateKo} ${timeKo}`, el('br'), venue),
      choices('attending', '참석 여부', [['yes', '참석할게요'], ['no', '참석이 어려워요']], 'yes'),
      choices('side', '어느 쪽 하객이신가요', [['groom', '신랑측'], ['bride', '신부측']], 'groom'),
      textField('name', '성함', { type: 'text', autocomplete: 'name', required: true, maxlength: 20 }),
      has('phone') && textField('phone', '연락처 (선택)', { type: 'tel', autocomplete: 'tel', inputmode: 'tel', maxlength: 20 }),
      attendOnly,
      has('message') && textField('message', '전달사항 (선택)', { type: 'text', maxlength: 50 }),
      el('div', { class: 'field consent' },
        el('label', { class: 'check', for: 'rsvp-consent' }, consent,
          el('span', {}, '개인정보 수집 및 이용에 동의합니다.')),
        el('p', { class: 'hint' }, '수집 항목: 성함, 연락처, 동행 인원 · 보유 기간: 예식 후 청첩장 이용 종료 시까지')),
      !R.endpoint && el('p', { class: 'draft-note' }, '시안 안내: 응답을 저장할 서버가 아직 연결되지 않아, 전달하기를 눌러도 실제로 전송되지 않습니다.'),
      status,
      submit);

    form.addEventListener('change', (e) => {
      if (e.target.name === 'attending') attendOnly.hidden = e.target.value !== 'yes';
    });

    const setError = (input, msg) => {
      input.setAttribute('aria-invalid', 'true');
      const err = el('p', { class: 'err', id: `${input.id}-err` }, msg);
      input.setAttribute('aria-describedby', err.id);
      input.closest('.field').append(err);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      form.querySelectorAll('.err').forEach((n) => n.remove());
      form.querySelectorAll('[aria-invalid]').forEach((n) => { n.removeAttribute('aria-invalid'); n.removeAttribute('aria-describedby'); });
      status.textContent = '';
      const fd = new FormData(form);
      const nameInput = form.elements.name;
      const name = String(fd.get('name') || '').trim();
      if (!name) setError(nameInput, '성함을 입력해 주세요.');
      if (!consent.checked) setError(consent, '동의에 체크해 주셔야 전달할 수 있습니다.');
      const firstBad = form.querySelector('[aria-invalid]');
      if (firstBad) { firstBad.focus(); return; }

      // 기존 청첩장(v1~v3)의 Apps Script와 같은 형식으로 보냅니다.
      // 시트 열: 구분 · 참석여부 · 성함 · 연락처 · 식사 · 메모. 동행 인원은 열이 없어 메모 앞에 적습니다.
      const attending = fd.get('attending') === 'yes';
      const MEAL = { yes: '예정', no: '안 함', unsure: '미정' };
      const message = String(fd.get('message') || '').trim();
      const payload = {
        type: 'rsvp',
        side: fd.get('side') === 'bride' ? '신부측' : '신랑측',
        attend: attending ? '참석' : '불참',
        name,
        phone: String(fd.get('phone') || '').trim(),
        meal: attending && has('meal') ? MEAL[fd.get('meal')] || '' : '',
        note: [attending && companions > 0 ? `동행 ${companions}명` : '', message].filter(Boolean).join(' · '),
      };
      submit.disabled = true;
      submit.textContent = '전달하는 중…';
      try {
        if (R.endpoint) {
          // Apps Script 웹앱은 응답을 읽을 수 없는 방식(no-cors)으로만 받을 수 있어, 요청이 나가면 전달된 것으로 봅니다.
          await fetch(R.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
          try { localStorage.setItem(RSVP_KEY, '1'); } catch { /* 저장소를 못 써도 진행 */ }
        }
        const doneBtn = el('button', { class: 'btn primary', type: 'button', onclick: closeSheet }, gate ? '청첩장 보기' : '닫기');
        form.replaceWith(el('div', { class: 'rsvp-done' },
          el('p', { class: 'title' }, attending ? '참석 의사를 전달했습니다' : '마음을 전달했습니다'),
          el('p', { class: 'soft' }, attending ? '예식 날 반갑게 뵙겠습니다.' : '알려 주셔서 감사합니다.'),
          doneBtn));
        $('.sheet .text-btn')?.remove();
        doneBtn.focus();
      } catch {
        status.textContent = '전달하지 못했습니다. 잠시 후 다시 시도해 주세요.';
        submit.disabled = false;
        submit.textContent = '신랑 · 신부에게 전달하기';
      }
    });

    openSheet(R.title || '참석 의사 전달', form, { closeLabel: gate ? '건너뛰기' : null, onClose: onDone });
  }

  const head = (label, title) =>
    el('div', { class: 'head reveal' }, el('p', { class: 'label' }, label), title && el('h2', { class: 'title' }, title));

  // ── 섹션 ───────────────────────────────────────────────
  const sections = {};
  const menuNames = {};

  sections.main = () => {
    const wrap = el('div', { class: 'photo-wrap' }, photo(C.main?.photo, '대표 사진', 900, 1200, true));
    if (DS.particle && DS.particle !== 'none' && !reduced) wrap.append(el('canvas', { 'aria-hidden': 'true' }));
    return el('section', { class: 'main', id: 'sec-main' },
      el('p', { class: 'date' }, String(Y), el('i', {}, '/'), pad2(M), el('i', {}, '/'), pad2(D)),
      el('p', { class: 'weekday' }, WD_EN[dow]),
      wrap,
      el('h1', { class: 'names' }, pair[0], el('i', {}, '·'), pair[1]),
      el('p', { class: 'when' }, `${dateKo} ${timeKo}`, el('br'), venue));
  };

  menuNames.greeting = '인사말';
  sections.greeting = () => {
    const P = C.parents || {};
    const name = (p) => (p?.name ? (p.deceased ? '故 ' : '') + p.name : '');
    const line = (f, m, rel, given) => {
      const parents = [name(f), name(m)].filter(Boolean).join(' · ');
      return parents ? el('p', {}, parents, el('span', { class: 'rel' }, `의 ${rel}`), el('b', {}, given)) : null;
    };
    const groomLine = line(P.groom_father, P.groom_mother, P.groom_relation || '아들', G.given_name);
    const brideLine = line(P.bride_father, P.bride_mother, P.bride_relation || '딸', B.given_name);
    const lines = C.couple.bride_first ? [brideLine, groomLine] : [groomLine, brideLine];

    const row = (role, person) => person?.phone && el('div', { class: 'contact-row' },
      el('small', {}, role), el('span', {}, person.name),
      el('a', { class: 'icon-btn', href: `tel:${person.phone}`, 'aria-label': `${person.name}에게 전화` }, icon('phone')),
      el('a', { class: 'icon-btn', href: `sms:${person.phone}`, 'aria-label': `${person.name}에게 문자` }, icon('sms')));
    const openContact = () => openSheet('연락하기', el('div', {},
      el('div', { class: 'contact-group' }, el('h3', {}, '신랑측'),
        row('신랑', { name: groomName, phone: G.phone }), row('아버지', P.groom_father), row('어머니', P.groom_mother)),
      el('div', { class: 'contact-group' }, el('h3', {}, '신부측'),
        row('신부', { name: brideName, phone: B.phone }), row('아버지', P.bride_father), row('어머니', P.bride_mother))));

    return el('section', { class: 'section greeting', id: 'sec-greeting' },
      head('Invitation', C.greeting.title),
      multiline(C.greeting.body, 'body-text reveal'),
      el('div', { class: 'rule' }),
      el('div', { class: 'parents reveal' }, lines),
      // 전화번호가 하나도 없으면 연락하기 버튼을 숨깁니다.
      [G, B, P.groom_father, P.groom_mother, P.bride_father, P.bride_mother].some((p) => p?.phone) &&
        el('button', { class: 'btn reveal', type: 'button', onclick: openContact }, icon('phone'), '연락하기'));
  };

  menuNames.profile = '신랑 · 신부 소개';
  sections.profile = () => {
    const P = C.profile;
    if (!P?.enabled) return null;
    const card = (role, name, p, flip) => el('div', { class: 'profile reveal' + (flip ? ' flip' : '') },
      photo(p.photo, `${role} 사진`, 600, 600),
      el('div', {}, el('div', { class: 'who' }, el('small', {}, role), name), multiline(p.intro, 'intro')));
    const cards = [card('신랑', groomName, P.groom, false), card('신부', brideName, P.bride, true)];
    return el('section', { class: 'section', id: 'sec-profile' }, head('Profile', P.title),
      el('div', { class: 'profiles' }, C.couple.bride_first ? cards.reverse() : cards));
  };

  menuNames.calendar = '예식 일시';
  sections.calendar = () => {
    const K = C.calendar || {};
    const out = el('section', { class: 'section', id: 'sec-calendar' },
      el('div', { class: 'reveal' },
        el('p', { class: 'cal-date' }, `${Y}.${pad2(M)}.${pad2(D)}`),
        el('p', { class: 'cal-time' }, `${WD_KO[dow]}요일 ${timeKo}`, el('br'), venue)));

    if (K.show_calendar !== false) {
      const grid = el('div', { class: 'cal-grid reveal', role: 'img', 'aria-label': `${Y}년 ${M}월 달력, 예식일 ${D}일` });
      WD_KO.forEach((d, i) => grid.append(el('span', { class: 'dow' + (i === 0 ? ' sun' : '') }, d)));
      const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
      const last = new Date(Date.UTC(Y, M, 0)).getUTCDate();
      for (let i = 0; i < first; i++) grid.append(el('span'));
      for (let d = 1; d <= last; d++) {
        const sun = (first + d - 1) % 7 === 0;
        grid.append(el('span', { class: (d === D ? 'day' : '') + (sun ? ' sun' : '') }, d === D ? el('b', {}, d) : d));
      }
      out.append(grid);
    }

    if (K.show_countdown !== false) {
      const cells = {};
      const box = el('div', { class: 'countdown reveal', 'aria-hidden': 'true' });
      [['DAYS', 'd'], ['HOUR', 'h'], ['MIN', 'm'], ['SEC', 's']].forEach(([lab, key], i) => {
        if (i) box.append(el('i', {}, ':'));
        cells[key] = el('strong', {}, '00');
        box.append(el('div', {}, el('small', {}, lab), cells[key]));
      });
      const ddayEl = el('p', { class: 'dday reveal' });
      const tick = () => {
        const left = Math.max(0, instant - Date.now());
        cells.d.textContent = Math.floor(left / 864e5);
        cells.h.textContent = pad2(Math.floor(left / 36e5) % 24);
        cells.m.textContent = pad2(Math.floor(left / 6e4) % 60);
        cells.s.textContent = pad2(Math.floor(left / 1e3) % 60);
      };
      const n = daysBetween(todayKST(), Date.UTC(Y, M - 1, D));
      const tpl = n > 0 ? (K.dday_text || '(신랑), (신부)의 결혼식이 (D-Day)일 남았습니다.')
        : n === 0 ? '오늘은 (신랑), (신부)의 결혼식 날입니다.'
        : '(신랑), (신부)의 결혼식이 (D-Day)일 지났습니다.';
      tpl.split(/(\(신랑\)|\(신부\)|\(D-Day\))/).forEach((part) => {
        if (part === '(신랑)') ddayEl.append(G.given_name);
        else if (part === '(신부)') ddayEl.append(B.given_name);
        else if (part === '(D-Day)') ddayEl.append(el('em', {}, Math.abs(n)));
        else ddayEl.append(part);
      });
      tick();
      setInterval(tick, 1000);
      out.append(box, ddayEl);
    }
    return out;
  };

  sections.together = () => {
    const T = C.together;
    if (!T?.enabled || !T.start_date) return null;
    const [y, m, d] = T.start_date.split('-').map(Number);
    const total = Math.max(0, daysBetween(Date.UTC(y, m - 1, d), todayKST()));
    const num = el('span', {}, reduced ? total.toLocaleString() : '0');
    const count = el('p', { class: 'count' }, '+ ', num, el('small', {}, '일'));
    if (!reduced) {
      new IntersectionObserver((entries, io) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / 1400);
          num.textContent = Math.round(total * (1 - Math.pow(1 - p, 3))).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 }).observe(count);
    }
    return el('section', { class: 'section together', id: 'sec-together' },
      el('div', { class: 'reveal' }, el('p', { class: 'title' }, T.title || '함께한 시간'), count));
  };

  menuNames.timeline = '타임라인';
  sections.timeline = () => {
    const T = C.timeline;
    if (!T?.enabled || !T.items?.length) return null;
    const frame = el('div', { class: 'tl-frame reveal' });
    let idx = 0;
    const show = () => {
      const it = T.items[idx];
      const prev = el('button', { class: 'icon-btn plain', type: 'button', 'aria-label': '이전 장면', disabled: idx === 0, onclick: () => { idx--; show(); } }, icon('chevL'));
      const next = el('button', { class: 'icon-btn plain', type: 'button', 'aria-label': '다음 장면', disabled: idx === T.items.length - 1, onclick: () => { idx++; show(); } }, icon('chevR'));
      frame.replaceChildren(
        el('div', { class: 'tl-meta' }, el('span', {}, it.date || ''), el('span', {}, `${pad2(idx + 1)} / ${pad2(T.items.length)}`)),
        el('div', { class: 'tl-slide', 'aria-live': 'polite' },
          photo(it.photo, `장면 ${idx + 1}`, 800, 1000, true),
          el('h3', {}, it.title), multiline(it.description)),
        el('div', { class: 'tl-nav' }, prev, next));
    };
    frame.append(
      photo(T.cover_photo, '타임라인 표지', 800, 1000),
      el('div', { class: 'tl-cover-title' }, el('em', {}, 'Our story'), el('span', {}, `${T.items.length}개의 장면`)),
      el('div', { class: 'tl-start' }, el('span', {}, '이야기 시작하기'),
        el('button', { class: 'icon-btn', type: 'button', 'aria-label': '이야기 시작하기', onclick: show }, icon('right'))));
    return el('section', { class: 'section', id: 'sec-timeline' }, head(T.label || 'Our story', T.title), frame);
  };

  menuNames.interview = '인터뷰';
  sections.interview = () => {
    const I = C.interview;
    if (!I?.enabled || !I.items?.length) return null;
    const open = () => openSheet(I.title, el('div', {},
      I.items.map((q, i) => el('div', { class: 'qa' }, el('h3', {}, `Q${i + 1}. ${q.question}`), multiline(q.answer)))));
    return el('section', { class: 'section', id: 'sec-interview' }, head('Interview', I.title),
      multiline(I.description, 'body-text reveal'),
      el('button', { class: 'btn reveal', type: 'button', style: 'margin-top:28px', onclick: open }, icon('sms'), I.button || '인터뷰 읽어보기'));
  };

  const middle = (m) => {
    if (m.type === 'text-photo') {
      const L = m.lines || [];
      const rows = [
        [L[0], L[1], L[2]].filter(Boolean),
        [String(D), MONTH_EN[M - 1], String(Y)],
        [WD_EN[dow], timeEn],
        W.hall_name_en ? W.hall_name_en.split(' ') : null,   // 날짜·시간 아래에 장소도
      ].filter(Boolean);
      return el('section', { class: 'section flush' },
        el('div', { class: 'mid-text reveal' }, rows.map((r) => el('div', {}, r.map((t) => el('span', {}, t))))),
        el('div', { class: 'mid-photo reveal' }, photo(m.photo, '가로 사진', 1200, 800, false, m)));
    }
    if (m.type === 'photo-caption') {
      return el('section', { class: 'section flush' },
        el('div', { class: 'mid-caption reveal' }, photo(m.photo, '사진', 1200, 900, false, m), el('em', {}, m.caption || '')));
    }
    if (m.type === 'save-the-date') {
      return el('section', { class: 'section std' },
        el('div', { class: 'reveal' }, el('em', {}, 'Save the Date'),
          el('dl', {},
            el('div', {}, el('dt', {}, 'DATE'), el('dd', {}, `${Y}. ${pad2(M)}. ${pad2(D)} ${WD_EN[dow].slice(0, 3)}`)),
            el('div', {}, el('dt', {}, 'TIME'), el('dd', {}, timeEn)),
            el('div', { class: 'wide' }, el('dt', {}, 'PLACE'), el('dd', {}, `${venue} · ${W.address}`)))));
    }
    return null;
  };

  menuNames.location = '오시는 길';
  sections.location = () => {
    const L = C.location || {};
    const out = el('section', { class: 'section flush', id: 'sec-location' },
      el('div', { style: 'padding:0 28px' }, head('Location', L.title || '오시는 길'),
        el('div', { class: 'reveal' },
          el('p', { class: 'loc-hall' }, venue),
          el('p', { class: 'loc-addr' }, W.address),
          W.tel && el('p', { class: 'loc-addr' }, 'Tel. ', el('a', { href: `tel:${W.tel}`, style: 'color:inherit' }, W.tel)))));

    const q = encodeURIComponent(`${W.hall_name} ${W.address}`);
    const name = encodeURIComponent(W.hall_name);
    if (L.show_map !== false && W.lat && W.lng) {
      if (L.map_provider === 'osm') {
        // 키 없이 쓰는 오픈스트리트맵. 국내 상세도는 네이버·카카오 지도보다 낮습니다.
        const bbox = [W.lng - 0.004, W.lat - 0.0025, W.lng + 0.004, W.lat + 0.0025].map((n) => n.toFixed(5)).join(',');
        out.append(el('div', { class: 'map reveal' },
          el('iframe', { title: '예식장 위치 지도', src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${W.lat},${W.lng}` })));
      } else {
        // 네이버·카카오 지도 키를 연결하기 전까지 보여 주는 자리
        out.append(el('a', { class: 'map map-ph reveal', href: `https://map.naver.com/p/search/${q}`, target: '_blank', rel: 'noopener' },
          icon('map'), el('strong', {}, venue), el('span', {}, '지도 앱에서 위치 보기')));
      }
    }

    const body = el('div', { class: 'loc-body' });
    body.append(el('button', { class: 'btn reveal', type: 'button', onclick: () => openSheet('약도', photo(L.sketch_map_image, '약도 이미지', 1000, 800)) }, icon('map'), '약도 이미지 보기'));
    body.append(el('h3', { class: 'reveal' }, '내비게이션'),
      el('div', { class: 'nav-btns reveal' },
        el('a', { class: 'btn', href: `https://map.naver.com/p/search/${q}`, target: '_blank', rel: 'noopener' }, '네이버지도'),
        el('a', { class: 'btn', href: `tmap://route?goalname=${name}&goalx=${W.lng}&goaly=${W.lat}` }, '티맵'),
        el('a', { class: 'btn', href: `https://map.kakao.com/link/to/${name},${W.lat},${W.lng}`, target: '_blank', rel: 'noopener' }, '카카오맵')));
    if (L.transport?.length) {
      body.append(el('div', { class: 'transport reveal' },
        L.transport.map((t) => el('div', {}, el('h3', {}, t.title), multiline(t.body)))));
    }
    out.append(body);
    return out;
  };

  menuNames.notices = '안내사항';
  sections.notices = () => {
    if (!C.notices?.length) return null;
    return el('div', { id: 'sec-notices' }, C.notices.map((n) =>
      el('section', { class: 'section notice' }, head(n.label || 'Notice', n.title),
        multiline(n.body, 'body-text reveal'),
        el('div', { class: 'reveal' }, photo(n.photo, '안내 사진', 1200, 800)),
        n.button_url && el('a', { class: 'btn reveal', style: 'margin-top:24px', href: n.button_url, target: '_blank', rel: 'noopener' }, n.button_label || '자세히 보기'))));
  };

  menuNames.gallery = '갤러리';
  sections.gallery = () => {
    const Gy = C.gallery;
    if (!Gy?.enabled) return null;
    const ratios = [[800, 1100], [800, 1000], [800, 1000], [800, 560], [800, 1100], [800, 1000], [800, 560], [800, 1100]];
    const items = Gy.photos?.length
      ? Gy.photos.map((src, i) => ({ src, alt: `갤러리 사진 ${i + 1}` }))
      : ratios.map(([w, h], i) => ({ src: placeholder(`사진 ${i + 1}`, w, h), alt: `갤러리 사진 ${i + 1}` }));
    // 두 열에 번갈아 넣어 왼쪽→오른쪽 순서로 읽히게 합니다.
    const cols = [el('div', {}), el('div', {})];
    items.forEach((it, i) => cols[i % 2].append(
      el('button', { type: 'button', 'aria-label': `${it.alt} 크게 보기`, onclick: () => openViewer(items, i) },
        el('img', { src: it.src, alt: it.alt, loading: 'lazy' }))));
    const grid = el('div', { class: 'grid reveal' }, cols);
    return el('section', { class: 'section gallery', id: 'sec-gallery' }, head('Gallery', Gy.title), grid);
  };

  menuNames.accounts = '마음 전하실 곳';
  sections.accounts = () => {
    const A = C.accounts;
    if (!A?.enabled || !A.groups?.length) return null;
    return el('section', { class: 'section accounts', id: 'sec-accounts' }, head('Account', A.title),
      multiline(A.description, 'body-text reveal'),
      el('div', { class: 'reveal', style: 'margin-top:28px' }, A.groups.map((g) =>
        el('details', { open: !!g.open }, el('summary', {}, g.title),
          g.list.map((a) => el('div', { class: 'acct' },
            el('div', {}, el('p', { class: 'who' }, a.holder), el('p', { class: 'num' }, `${a.bank} ${a.number}`)),
            el('div', { style: 'display:flex;gap:6px' },
              el('button', { class: 'btn', type: 'button', onclick: () => copyText(`${a.bank} ${a.number}`, '계좌번호를 복사했습니다') }, icon('copy'), '복사'),
              a.kakaopay_link && el('a', { class: 'btn', href: a.kakaopay_link, target: '_blank', rel: 'noopener' }, '송금'))))))));
  };

  menuNames.rsvp = '참석 의사 전달';
  sections.rsvp = () => {
    if (!rsvpOpen) return null;
    return el('section', { class: 'section', id: 'sec-rsvp' }, head('R.S.V.P.', R.title || '참석 의사 전달'),
      multiline(R.description || '신랑, 신부에게 참석 의사를\n미리 전달할 수 있습니다.', 'body-text reveal'),
      el('button', { class: 'btn reveal', type: 'button', style: 'margin-top:28px', onclick: () => openRsvp() }, R.button || '참석 의사 전달하기'));
  };

  const shareLink = () => copyText(location.href, '청첩장 주소를 복사했습니다');
  const shareNative = () => (navigator.share ? navigator.share({ title: document.title, url: location.href }).catch(() => {}) : shareLink());

  sections.ending = () => {
    const E = C.ending || {};
    return el('section', { class: 'ending', id: 'sec-ending' },
      el('div', { class: 'photo' }, photo(E.photo, '엔딩 사진', 1000, 1250),
        // quote_top: 글귀의 세로 위치(사진 높이 기준). 얼굴을 가리면 값을 바꿔 주세요.
        el('div', { class: 'quote reveal', style: E.quote_top ? `top:${E.quote_top}` : null },
          multiline(E.quote), E.quote_source && el('small', {}, E.quote_source))),
      el('div', { class: 'share' },
        el('button', { class: 'btn', type: 'button', onclick: shareNative }, icon('share'), '청첩장 공유하기'),
        el('button', { class: 'btn', type: 'button', onclick: shareLink }, icon('link'), '주소 복사하기')),
      el('footer', {}, `${pair[0]} & ${pair[1]}`));
  };

  // ── 조립 ───────────────────────────────────────────────
  const DEFAULT_ORDER = ['main', 'greeting', 'profile', 'calendar', 'together', 'timeline', 'interview', 'location', 'notices', 'gallery', 'accounts', 'rsvp', 'ending'];
  const order = C.section_order?.length ? C.section_order : DEFAULT_ORDER;
  const app = $('#app');
  const built = [];
  for (const key of order) {
    const node = sections[key]?.();
    if (node) {
      app.append(node);
      if (menuNames[key]) built.push([menuNames[key], node]);
    }
    for (const m of C.middle_designs || []) {
      if (m.after === key) { const mid = middle(m); if (mid) app.append(mid); }
    }
  }

  // ── 스크롤 등장 효과 ─────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));

  // ── 사진 뷰어 ───────────────────────────────────────────
  const viewer = $('#viewer');
  let vItems = [], vIdx = 0, vFocus = null, touchX = null;
  const vImg = el('img', { alt: '' });
  const vCount = el('p', { class: 'n' });
  const vMove = (d) => {
    vIdx = (vIdx + d + vItems.length) % vItems.length;
    vImg.src = vItems[vIdx].src;
    vImg.alt = vItems[vIdx].alt;
    vCount.textContent = `${vIdx + 1} / ${vItems.length}`;
  };
  const closeViewer = () => { viewer.hidden = true; document.body.classList.remove('locked'); vFocus?.focus(); };
  const vClose = el('button', { class: 'icon-btn plain x', type: 'button', 'aria-label': '닫기', onclick: closeViewer }, icon('close'));
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', '사진 크게 보기');
  viewer.append(vImg, vCount, vClose,
    el('button', { class: 'icon-btn plain prev', type: 'button', 'aria-label': '이전 사진', onclick: () => vMove(-1) }, icon('chevL')),
    el('button', { class: 'icon-btn plain next', type: 'button', 'aria-label': '다음 사진', onclick: () => vMove(1) }, icon('chevR')));
  viewer.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) vMove(dx < 0 ? 1 : -1);
    touchX = null;
  });
  function openViewer(items, i) {
    vFocus = document.activeElement;
    vItems = items; vIdx = i; vMove(0);
    viewer.hidden = false;
    document.body.classList.add('locked');
    vClose.focus();
  }

  // ── 떠 있는 버튼과 서랍 메뉴 ───────────────────────────────
  const floating = $('#floating');
  const drawer = $('#drawer');
  const closeDrawer = () => {
    drawer.classList.remove('in');
    document.body.classList.remove('locked');
    setTimeout(() => { drawer.hidden = true; }, 300);
  };
  const openDrawer = () => {
    drawer.hidden = false;
    document.body.classList.add('locked');
    requestAnimationFrame(() => drawer.classList.add('in'));
    $('button', drawer).focus();
  };
  drawer.append(el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': '메뉴' },
    el('header', {}, el('button', { class: 'icon-btn plain', type: 'button', 'aria-label': '메뉴 닫기', onclick: closeDrawer }, icon('close'))),
    el('nav', {}, built.map(([name, node]) => el('button', { type: 'button', onclick: () => {
      closeDrawer();
      node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    } }, name))),
    el('div', { class: 'tools' },
      el('button', { type: 'button', onclick: shareLink }, icon('link'), '주소 복사'),
      el('button', { type: 'button', onclick: shareNative }, icon('share'), '공유하기'))));
  drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
  floating.append(el('button', { class: 'icon-btn menu', type: 'button', 'aria-label': '메뉴 열기', onclick: openDrawer }, icon('menu')));

  if (C.music?.enabled && C.music.file) {
    const audio = new Audio(C.music.file);
    audio.loop = true;
    const btn = el('button', { class: 'icon-btn bgm', type: 'button', 'aria-label': '배경음악 재생', 'aria-pressed': 'false' }, icon('music'));
    const sync = () => {
      btn.setAttribute('aria-pressed', String(!audio.paused));
      btn.setAttribute('aria-label', audio.paused ? '배경음악 재생' : '배경음악 정지');
      btn.style.opacity = audio.paused ? '.55' : '1';
    };
    btn.addEventListener('click', () => { (audio.paused ? audio.play() : Promise.resolve(audio.pause())).catch(() => {}).finally(sync); });
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    if (C.music.autoplay) {
      // 브라우저가 자동 재생을 막으므로 첫 터치 때 시작합니다.
      addEventListener('pointerdown', (e) => { if (!btn.contains(e.target)) audio.play().catch(() => {}); }, { once: true });
    }
    sync();
    floating.append(btn);
  }

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!viewer.hidden) closeViewer();
      else if (!layer.hidden) closeSheet();
      else if (!drawer.hidden) closeDrawer();
    } else if (!viewer.hidden && e.key === 'ArrowLeft') vMove(-1);
    else if (!viewer.hidden && e.key === 'ArrowRight') vMove(1);
  });

  // ── 메인 사진 위 입자 효과 ────────────────────────────────
  const canvas = $('.main canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const petal = DS.particle === 'petal';
    let w = 0, h = 0, parts = [], running = false;
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (top) => ({ x: Math.random() * w, y: top ? -10 : Math.random() * h, r: 1.5 + Math.random() * 2.5, vy: 0.25 + Math.random() * 0.5, vx: -0.15 + Math.random() * 0.3, a: Math.random() * Math.PI, o: 0.35 + Math.random() * 0.45 });
    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.y += p.vy; p.x += p.vx + Math.sin((p.a += 0.01)) * 0.2;
        if (p.y > h + 10) parts[i] = spawn(true);
        ctx.globalAlpha = p.o;
        ctx.fillStyle = petal ? '#FBEDEA' : '#FFFFFF';
        ctx.beginPath();
        if (petal) ctx.ellipse(p.x, p.y, p.r * 1.6, p.r, p.a, 0, Math.PI * 2);
        else ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    size();
    parts = Array.from({ length: 26 }, () => spawn(false));
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(frame);
    }).observe(canvas);
  }

  // ── 커버 → 참석 의사 팝업 → 본문 ───────────────────────────
  // 커버를 누르거나 밀면 참석 의사 팝업이 먼저 뜨고, 전달하거나 건너뛴 뒤에 본문이 보입니다.
  const opening = $('#opening');
  const gateNeeded = rsvpOpen && R.gate !== false && !rsvpDone();
  const showContent = () => {
    app.removeAttribute('inert');
    document.body.classList.remove('gated');
    scrollTo(0, 0);
  };
  const afterCover = () => (gateNeeded ? openRsvp({ gate: true, onDone: showContent }) : showContent());

  if (C.opening?.enabled) {
    const O = C.opening;
    app.setAttribute('inert', '');
    document.body.classList.add('gated');
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      opening.classList.add('out');
      setTimeout(() => { opening.hidden = true; }, 800);
      afterCover();
    };
    let n = 0;
    const big = el('div', { class: 'big', 'aria-hidden': 'true' },
      String(O.text || 'OUR WEDDING DAY').split(' ').map((word) =>
        el('span', { style: 'animation:none;opacity:1;transform:none' },
          [...word].map((ch) => el('span', { style: `animation-delay:${0.25 + n++ * 0.07}s` }, ch)))));
    opening.append(
      big,
      el('div', { class: 'labels', 'aria-hidden': 'true' }, el('span', {}, O.left_label || ''), el('span', {}, O.right_label || '')),
      el('p', { class: 'hint' }, O.hint || '화면을 누르거나 밀어서 열어 주세요'));
    opening.setAttribute('role', 'button');
    opening.setAttribute('tabindex', '0');
    opening.setAttribute('aria-label', `${pair[0]} ♥ ${pair[1]} 청첩장 열기`);
    opening.hidden = false;

    // 누르기, 밀기(어느 방향이든), 마우스 휠, Enter·Space 모두 "열기"로 처리
    let sx = null, sy = null;
    opening.addEventListener('click', open);
    opening.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    opening.addEventListener('touchmove', (e) => {
      if (sx == null) return;
      const t = e.touches[0];
      if (Math.hypot(t.clientX - sx, t.clientY - sy) > 24) open();
    }, { passive: true });
    opening.addEventListener('wheel', open, { passive: true });
    opening.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  } else if (gateNeeded) {
    app.setAttribute('inert', '');
    document.body.classList.add('gated');
    afterCover();
  }
})();
