/* ==========================================================
 *  모바일 청첩장 설정 파일
 *  ─ 내용 수정은 이 파일만 고치면 됩니다. (빈 값 "" 은 화면에서 자동으로 숨겨집니다)
 * ========================================================== */
window.WEDDING = {
  // 배포 주소 (카카오톡/문자 링크 미리보기 이미지에 사용) — 끝에 / 포함
  siteUrl: "https://kwkr-wedding.github.io/wedding/",

  groom: {
    name: "김경원", nameEn: "KYUNGWON", phone: "",
    father: { name: "김진희", phone: "" },
    mother: { name: "최지연", phone: "" },
    relation: "아들",
  },
  bride: {
    name: "최규로", nameEn: "KYURO", phone: "",
    father: { name: "최영선", phone: "" },
    mother: { name: "권순희", phone: "" },
    relation: "딸",
  },

  // 예식 일시 (한국 시간)
  date: "2027-01-23T18:00:00+09:00",
  durationMinutes: 180,

  venue: {
    name: "웨스틴 조선 서울",
    hall: "1층 그랜드볼룸",
    nameEn: "THE WESTIN JOSUN SEOUL",
    hallEn: "1F GRAND BALLROOM",
    address: "서울특별시 중구 소공로 106",
    tel: "02-771-0500",
    lat: 37.5646, lng: 126.9799,
    transport: [
      { title: "지하철", lines: [
        "2호선 을지로입구역 · 1·2호선 시청역 하차, 도보 약 5분",
        "4호선 회현역 하차, 도보 약 10분",
      ]},
      { title: "버스", lines: [
        "‘시청앞·덕수궁’ 또는 ‘을지로입구’ 정류장 하차",
      ]},
      { title: "자가용 · 주차", lines: [
        "네비게이션: ‘웨스틴 조선 서울’ 또는 ‘소공로 106’ 검색",
        "호텔 주차장 이용 가능 (무료 주차는 최대 5시간까지 지원됩니다.)",
      ]},
    ],
  },

  greeting: [
    "어릴 적 인연이 평생의 약속으로 이어졌습니다.",
    "늘 처음같은 마음으로 서로를 귀하게 아끼며 살겠습니다.",
    "오셔서 저희의 소중한 날을 함께 축복해 주신다면",
    "더 없는 영광으로 간직하겠습니다.",
  ],

  // 마음 전하실 곳 — 계좌가 빈 칸("")이면 해당 줄은 표시되지 않습니다.
  accounts: {
    groom: [
      { role: "신랑", name: "김경원", bank: "우리은행", number: "1002546017343", kakaopay: "" },
      { role: "신랑 아버지", name: "김진희", bank: "", number: "" },
      { role: "신랑 어머니", name: "최지연", bank: "", number: "" },
    ],
    bride: [
      { role: "신부", name: "최규로", bank: "하나은행", number: "188-910335-06707", kakaopay: "" },
      { role: "신부 아버지", name: "최영선", bank: "", number: "" },
      { role: "신부 어머니", name: "권순희", bank: "", number: "" },
    ],
  },

  // 갤러리: assets/gallery/ 폴더에 사진을 넣고 파일명을 적어주세요. 비어 있으면 섹션이 숨겨집니다.
  gallery: [
    "01.jpg", "02.jpg", "03.jpg", "04.jpg",
  ],

  // 참석 의사(RSVP) · 방명록 저장용 Google Apps Script 웹앱 주소
  // 비워두면 RSVP는 문자(SMS) 전송 방식으로, 방명록은 숨김 처리됩니다.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzdutqZ2i3X4YLUOkJhquAYVJtkCk70HJ3a3V53MqdJ4zlMNZjMRO87yhevFdZ-X6gA/exec",
  rsvpDeadline: "2027-01-09",       // 회신 요청일 (표시용)
  rsvpFallbackPhone: "",            // appsScriptUrl 이 없을 때 RSVP 문자를 받을 번호

  // 카카오톡 공유 (선택): developers.kakao.com 에서 JavaScript 키 발급 + 사이트 도메인 등록
  kakaoJsKey: "",

  // 배경음악 (선택): assets/ 에 mp3를 넣고 경로를 적어주세요. 예: "assets/bgm.mp3"
  bgm: "",

  // 1월 예식에 맞춘 눈 내리는 효과
  snow: true,

  /* ── 아래는 V2 전용 설정입니다 (V1 에는 영향 없음) ── */
  v4: {
    // 첫 화면에서 내리기 시작하면 참석 의사 전달 창을 먼저 띄울지. 창을 닫으면 "어릴 적 인연이" 장면까지 저절로 내려갑니다.
    // false 면 맨 아래 "참석 회신"과 하단 바로가기에서만 받습니다.
    rsvpPopup: true,

    // 갤러리: v4/assets/gallery/ 안의 파일명을 넘겨 볼 순서대로 적습니다.
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "11.webp", "12.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],

    // 영상: v4/assets/ 안의 mp4 경로. 해당 사진 위에 소리 없이 재생됩니다. "" 로 비우면 사진만 보입니다.
    //   hero = 첫 화면(반복), night = 저녁 6시의 밤 정원(반복)
    videos: { hero: "", night: "video/night.mp4" },

    // 스크롤로 넘기는 프레임 묶음: v4/assets/<dir>/000.webp, 001.webp … 와 장 수 (v: 파일을 바꿨을 때 올리는 번호).
    // propose = 프러포즈 장면으로 천천히 다가가는 영상, door = 문을 나서는 영상 (끝은 빛으로 하얗게 바뀝니다).
    // count 를 0 으로 바꾸면 영상 대신 사진을 확대하는 효과로 돌아갑니다.
    sequences: { propose: { dir: "seq-propose", count: 121, v: 2 }, door: { dir: "seq-door", count: 97, v: 3 } },
  },

  /* ── 아래는 V10(일반 청첩장) 전용 설정입니다. 이름·일시·장소·인사말·계좌는 위 공통 항목을 그대로 씁니다 ── */
  v10: {
    // 첫 화면이 거의 넘어갈 때 참석 의사 전달 창을 먼저 띄울지. false 면 아래쪽 "참석 의사 전달"과 하단 바로가기에서만 받습니다.
    rsvpPopup: true,

    // 초대의 말 첫 문장(greeting 의 첫 줄)을 큰 글씨로 보여 줄 때의 줄 나눔. [] 로 비우면 greeting 을 같은 크기로 그대로 보여 줍니다.
    greetingLead: ["어릴 적 인연이", "평생의 약속으로 이어졌습니다."],

    // 사진: v4/assets/gallery/ 안의 파일명을 격자에 놓을 순서대로 적습니다 (크게 보기에서 넘기는 순서도 같습니다).
    // 가로로 긴 사진은 { f: 파일명, span: 3 } 으로 한 줄 전체에, span: 2 로 두 칸에 걸쳐 놓습니다. 한 줄은 세 칸입니다.
    // 사진을 바꾸거나 더하면 v10/thumb/ 에 같은 이름의 작은 그림도 넣어 주세요.
    // 격자 한 줄은 작은 사진 세 장 너비입니다. 크기를 섞어 놓습니다:
    //   "파일"                 작은 사진 (한 줄에 세 장)
    //   { f, big: true }       큰 사진 (가로 두 장 · 세로 두 장 자리). 옆에 작은 사진 두 장이 위아래로 붙습니다 → 큰 것 하나 + 작은 것 둘을 이어서 적을 것
    //   { f, span: 2 }         가로 사진 (작은 사진 두 장 너비), { f, span: 3 } 한 줄 전체
    //   { f, half: true }      한 줄에 두 장 (짝으로). pairL · pairR 는 신랑(19) · 신부(22) 짝: 얼굴 크기가 비슷하도록 13 : 11 너비로 놓습니다
    // 사진 번호 ↔ 원본: 04 CYR_0835 · 05 CYR_0735 · 06 CYR_1291 · 07 CYR_1129 · 09 HJH_3268 · 10 HJH_5078 · 12 HJH_3386 · 14 HJH_0208 · 15 HJH_4260 · 16 CYR_0998 · 17 HJH_5562
    //   30 HJH_1115 · 31 HJH_0994
    //   19 HJH_0632 · 20 HJH_0588 · 22 HJH_0521 · 23 CYR_1255 · 24 HJH_0920 · 25 HJH_1681 · 26 HJH_3581 · 27 HJH_3683 · 28 HJH_1843 · 29 HJH_5473
    // 색 흐름: 밝은 컬러(흰 스튜디오) → 검은 옷 컬러 → 흑백 묶음(06 07 20 28 15 27 09) → 정원 컬러로 마무리
    //   { f, cols: 14 } · { f, cols: 10, fill: true }   한 줄(24칸)을 원하는 칸 수로 나눔. fill 은 옆 사진 높이에 맞춰 채움(좌우가 조금 잘림), pos 는 그때 보일 위치
    gallery: [{ f: "05.webp", span: 3 },
      "24.webp", { f: "04.webp", big: true }, "31.webp",
      { f: "19.webp", pair: "L" }, { f: "22.webp", pair: "R" },
      "10.webp", { f: "26.webp", big: true }, "12.webp",
      { f: "23.webp", span: 3 },
      { f: "06.webp", span: 2 }, "07.webp",
      { f: "28.webp", cols: 10 }, { f: "20.webp", cols: 14, fill: true, pos: "50% 51%" },
      { f: "15.webp", big: true }, "27.webp", "09.webp",
      { f: "14.webp", half: true }, { f: "25.webp", half: true },
      "29.webp", { f: "17.webp", big: true }, "16.webp"],
  },

  /* ── V14(/p/) 전용 갤러리: 위 v10.gallery 와 같고, 끝의 두 줄만 다릅니다 ──
     V13 의 저녁 6시 사진(30 = HJH_1115)이 V14 에는 없어서 갤러리에 넣었습니다: [30 크게 | 25 · 14 작게] / [16 · 29 작게 | 17 크게] */
  v14: {
    gallery: [{ f: "05.webp", span: 3 },
      "24.webp", { f: "04.webp", big: true }, "31.webp",
      { f: "19.webp", pair: "L" }, { f: "22.webp", pair: "R" },
      "10.webp", { f: "26.webp", big: true }, "12.webp",
      { f: "23.webp", span: 3 },
      { f: "06.webp", span: 2 }, "07.webp",
      { f: "28.webp", cols: 10 }, { f: "20.webp", cols: 14, fill: true, pos: "50% 51%" },
      { f: "15.webp", big: true }, "27.webp", "09.webp",
      { f: "30.webp", big: true }, "25.webp", "14.webp",
      "29.webp", { f: "17.webp", big: true }, "16.webp"],
  },

  /* ── 아래는 V13 전용 설정입니다 (다른 버전에는 영향 없음) ── */
  v13: {
    // V13 에서만 보이는 계좌: 위 accounts 에서 같은 이름의 칸에 은행 · 계좌번호를 채웁니다.
    // 다른 버전에도 보이게 하려면 위 accounts 의 그 사람 칸에 직접 적으면 됩니다.
    // 계좌번호는 '-' 없이 띄어쓰기로 적습니다
    accounts: {
      groom: { "김경원": { bank: "우리은행", number: "1002 546 017343" }, "김진희": { bank: "신한은행", number: "323 06 247341" } },
      bride: { "최규로": { bank: "하나은행", number: "188 910335 06707" }, "최영선": { bank: "하나은행", number: "165 399679 00107" } },
    },
  },
};
