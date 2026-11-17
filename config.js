/* ==========================================================
 *  모바일 청첩장 설정 파일
 *  ─ 내용 수정은 이 파일만 고치면 됩니다. (빈 값 "" 은 화면에서 자동으로 숨겨집니다)
 * ========================================================== */
window.WEDDING = {
  // 배포 주소 (카카오톡/문자 링크 미리보기 이미지에 사용) — 끝에 / 포함
  siteUrl: "https://kwkr-wedding.github.io/wedding/",

  // 청첩장 버전 — 버전별 주소는 siteUrl + "v1/", siteUrl + "v2/", siteUrl + "v3/", siteUrl + "v4/" 입니다.
  // 버전을 붙이지 않은 기본 주소(siteUrl)로 들어오면 defaultVersion 으로 연결됩니다.
  // 버전별 링크는 siteUrl + "link/" 페이지에서 골라서 복사할 수 있습니다.
  // sides: true 인 버전은 신부측 링크(주소 끝 ?side=bride)도 만들 수 있습니다.
  defaultVersion: 1,
  versions: [
    { id: 1, name: "V1 · 올리브 카드", desc: "봉투를 열면 인쇄 청첩장 카드가 나오는 차분한 버전" },
    { id: 2, name: "V2 · 딥그린 포토", desc: "실물 청첩장의 딥그린 봉투와 사진 중심 구성을 담은 버전" },
    { id: 3, name: "V3 · 풀 스토리", desc: "V2 디자인에 소개·우리 이야기·인터뷰·사진 공유까지 모두 담고, 접속하면 참석 의사 창이 뜨는 버전" },
    { id: 4, sides: true, name: "V4 · 여섯 시로 가는 길", desc: "스크롤하면 시계가 오후 3시에서 6시로 흐르고, 사진이 낮의 스튜디오에서 전구가 켜진 밤 정원으로 이어지는 패럴랙스 버전" },
  ],

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
        "호텔 주차장 이용 가능 (하객 무료 주차 시간은 안내데스크에서 확인 부탁드립니다)",
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
  v2: {
    // 사진: assets/gallery/ 안의 파일명. 비워두면 해당 영역이 숨겨지거나 갤러리 첫 사진을 씁니다.
    cover: "01.jpg",     // 첫 화면 대표 사진
    banner: "03.jpg",    // 날짜 배너 아래 사진
    ending: "04.jpg",    // 마지막 사진 (위에 endingText 가 겹쳐집니다)
    endingText: [
      "늘 처음같은 마음으로",
      "서로를 귀하게 아끼며 살겠습니다.",
    ],

    // 함께한 날 수: 처음 만난 날(또는 사귄 날)을 "YYYY-MM-DD" 로 적으면 표시됩니다.
    togetherSince: "",

    // 신랑·신부 소개: text 를 채우면 PROFILE 섹션이 나타납니다. photo 는 assets/gallery/ 파일명(선택).
    profiles: {
      groom: { photo: "", text: [] },
      bride: { photo: "", text: [] },
    },

    // 인터뷰: { q: "질문", groom: "신랑 답", bride: "신부 답" } 을 넣으면 INTERVIEW 섹션이 나타납니다.
    interview: [],

    // 안내 사항: { title: "제목", lines: ["내용", ...] } 을 넣으면 NOTICE 섹션이 나타납니다.
    notices: [],
  },

  /* ── 아래는 V3 전용 설정입니다. 여기에 적지 않은 항목(cover·banner·ending 등)은 위 v2 값을 그대로 씁니다 ──
     "(예시)" 로 시작하는 글은 자리 표시용입니다. 실제 내용으로 바꾸거나, 섹션을 빼려면 해당 항목을 [] 또는 "" 로 비워주세요. */
  v3: {
    // 접속 직후(봉투를 연 뒤) 참석 의사 전달 창을 띄웁니다.
    // 이미 회신했거나 "오늘 하루 보지 않기"를 누른 분, 예식이 지난 뒤에는 뜨지 않습니다. false 로 끌 수 있습니다.
    rsvpPopup: true,

    // 함께한 날 수: 처음 만난 날(또는 사귄 날)을 "YYYY-MM-DD" 로 적으면 캘린더 아래에 표시됩니다.
    togetherSince: "",

    // 신랑·신부 소개. text 는 한 줄에 열두 자 안팎이 보기 좋습니다. photo 는 assets/gallery/ 파일명 (비우면 빈 사진 칸이 보입니다)
    profiles: {
      groom: { photo: "", text: ["(예시) 신랑 소개 글을", "서너 줄로 적어주세요."] },
      bride: { photo: "", text: ["(예시) 신부 소개 글을", "서너 줄로 적어주세요."] },
    },

    // 우리 이야기: 시간 순서대로 { date, title, text, photo(선택) }. storyPhoto 는 섹션 대표 사진.
    storyPhoto: "02.jpg",
    story: [
      { date: "(예시) 0000. 00", title: "처음 만난 날", text: "(예시) 두 사람이 처음 만난 이야기를 적어주세요.", photo: "" },
      { date: "(예시) 0000. 00", title: "연인이 된 날", text: "(예시) 기억에 남는 순간을 적어주세요.", photo: "" },
      { date: "2027. 01. 23", title: "부부가 되는 날", text: "(예시) 결혼을 앞둔 마음을 적어주세요.", photo: "" },
    ],

    // 인터뷰: { q: "질문", groom: "신랑 답", bride: "신부 답" }
    interview: [
      { q: "결혼을 앞둔 소감은 어떤가요?", groom: "(예시) 신랑의 답변을 적어주세요.", bride: "(예시) 신부의 답변을 적어주세요." },
      { q: "서로에게 전하고 싶은 말이 있다면?", groom: "(예시) 신랑의 답변을 적어주세요.", bride: "(예시) 신부의 답변을 적어주세요." },
    ],

    // 안내 말씀: { title: "제목", lines: ["내용", ...] }
    notices: [
      { title: "(예시) 안내 제목", lines: ["(예시) 주차, 식사, 화환 등", "하객께 알리고 싶은 내용을 적어주세요."] },
    ],

    // 약도 이미지: assets/ 기준 파일 경로를 적으면 지도 아래에 "약도 이미지 보기" 버튼이 생깁니다. 예) "map.jpg"
    mapImage: "",

    // 축하 사진 공유: 하객이 예식 시작 시각부터 사진을 올릴 수 있습니다.
    // false 면 섹션이 사라집니다.
    photoShare: true,

    // 사진 액자: { photo: assets/gallery/ 파일명, caption: 사진 아래 영문 캡션(선택) }
    frames: [
      { photo: "01.jpg", caption: "Kyungwon & Kyuro" },
      { photo: "03.jpg", caption: "23 January 2027" },
      { photo: "04.jpg", caption: "The Westin Josun Seoul" },
    ],
  },

  /* ── 아래는 V4 전용 설정입니다 (다른 버전에는 영향 없음). 사진·영상은 v4/assets/ 폴더에 있습니다 ── */
  v4: {
    // 접속 초반(첫 화면을 지난 직후)에 참석 의사 전달 창을 띄울지. false 면 맨 아래 "참석 회신"에서만 받습니다.
    rsvpPopup: false,

    // 갤러리: v4/assets/gallery/ 안의 파일명을 넘겨 볼 순서대로 적습니다.
    gallery: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "11.webp", "12.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp"],

    // 영상: v4/assets/ 안의 mp4 경로. 해당 사진 위에 소리 없이 재생됩니다. "" 로 비우면 사진만 보입니다.
    //   hero = 첫 화면(반복), night = 저녁 6시의 밤 정원(반복)
    videos: { hero: "video/hero.mp4?v=2", night: "video/night.mp4" },

    // 스크롤로 넘기는 프레임 묶음: v4/assets/<dir>/000.webp, 001.webp … 와 장 수 (v: 파일을 바꿨을 때 올리는 번호).
    // propose = 프러포즈 장면으로 천천히 다가가는 영상, door = 문을 나서는 영상 (끝은 빛으로 하얗게 바뀝니다).
    // count 를 0 으로 바꾸면 영상 대신 사진을 확대하는 효과로 돌아갑니다.
    sequences: { propose: { dir: "seq-propose", count: 121, v: 2 }, door: { dir: "seq-door", count: 97, v: 3 } },
  },
};
