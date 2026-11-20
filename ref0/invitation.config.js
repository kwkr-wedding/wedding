/*
 * 청첩장 설정 파일 — 문구, 사진, 색, 섹션 순서는 전부 여기서 바꿉니다.
 * 사진은 저장소의 assets/gallery/ 에 넣고 "../assets/gallery/01.jpg"처럼 경로를 적으세요.
 * 경로를 비워 두면 자리표시 이미지가 나옵니다.
 * "(예시)"로 시작하는 글은 자리 표시입니다. 실제 내용으로 바꾸거나, 섹션을 빼려면 enabled 를 false 로 두세요.
 */
window.INVITATION = {
  couple: {
    groom: { family_name: "김", given_name: "경원", phone: "" },
    bride: { family_name: "최", given_name: "규로", phone: "" },
    bride_first: false,
  },

  wedding: {
    date: "2027-01-23",
    time: "18:00",
    hall_name: "웨스틴 조선 서울",
    hall_name_en: "THE WESTIN JOSUN SEOUL",
    hall_detail: "1층 그랜드볼룸",
    address: "서울특별시 중구 소공로 106",
    tel: "02-771-0500",
    lat: 37.5646,
    lng: 126.9799,
  },

  design: {
    accent_color: "#6B7A5E",
    accent_deep: "#4C5A43",
    background_color: "#FBF9F5",
    particle: "snow", // none | snow | petal
  },

  opening: {
    enabled: true,
    text: "OUR NEW CHAPTER",
    left_label: "WEDDING",
    right_label: "INVITATION",
    hint: "화면을 누르거나 밀어서 열어 주세요",
  },

  // 참석 의사 전달. gate: true면 커버를 연 직후 팝업이 먼저 뜨고,
  // 전달하거나 건너뛴 뒤에 본문이 보입니다. 예식 시각이 지나면 자동으로 꺼집니다.
  rsvp: {
    enabled: true,
    gate: true,
    title: "참석 의사 전달",
    popup_message: "한 분 한 분 더 정성껏 모실 수 있도록\n참석 여부를 미리 알려 주시면 감사하겠습니다.",
    description: "신랑, 신부에게 참석 의사를\n미리 전달할 수 있습니다.\n회신 부탁드리는 날짜 · 1월 9일",
    button: "참석 의사 전달하기",
    fields: ["phone", "companions", "message"], // 빼고 싶은 항목은 지우세요
    // 응답을 받을 Google Apps Script 웹앱 주소. 루트 config.js 의 appsScriptUrl 과 같은 주소라
    // 응답이 같은 'Wedding Prep' 시트의 RSVP 탭에 쌓입니다. 비우면 실제로 전송되지 않습니다.
    endpoint: "https://script.google.com/macros/s/AKfycbzdutqZ2i3X4YLUOkJhquAYVJtkCk70HJ3a3V53MqdJ4zlMNZjMRO87yhevFdZ-X6gA/exec",
  },

  main: { photo: "../assets/gallery/01.jpg" },

  greeting: {
    title: "소중한 분들을 초대합니다",
    body:
      "어릴 적 인연이\n평생의 약속으로 이어졌습니다.\n\n늘 처음같은 마음으로\n서로를 귀하게 아끼며 살겠습니다.\n\n오셔서 저희의 소중한 날을\n함께 축복해 주신다면\n더 없는 영광으로 간직하겠습니다.",
  },

  // 전화번호를 적으면 인사말 아래에 '연락하기' 버튼이 생깁니다.
  parents: {
    groom_father: { name: "김진희", phone: "", deceased: false },
    groom_mother: { name: "최지연", phone: "", deceased: false },
    bride_father: { name: "최영선", phone: "", deceased: false },
    bride_mother: { name: "권순희", phone: "", deceased: false },
    groom_relation: "아들",
    bride_relation: "딸",
  },

  profile: {
    enabled: true,
    title: "두 사람을 소개합니다",
    groom: { photo: "", intro: "(예시) 신랑 소개 글을\n서너 줄로 적어주세요." },
    bride: { photo: "", intro: "(예시) 신부 소개 글을\n서너 줄로 적어주세요." },
  },

  calendar: {
    show_calendar: true,
    show_countdown: true,
    dday_text: "(신랑), (신부)의 결혼식이 (D-Day)일 남았습니다.",
  },

  // 처음 만난 날(또는 사귄 날)을 start_date 에 적고 enabled 를 true 로 바꾸면 표시됩니다.
  together: {
    enabled: false,
    title: "함께 걸어온 날",
    start_date: "",
  },

  timeline: {
    enabled: true,
    label: "OUR STORY",
    title: "우리 이야기",
    cover_photo: "../assets/gallery/02.jpg",
    items: [
      { date: "(예시) 0000. 00", title: "처음 만난 날", description: "(예시) 두 사람이 처음 만난 이야기를 적어주세요.", photo: "" },
      { date: "(예시) 0000. 00", title: "연인이 된 날", description: "(예시) 기억에 남는 순간을 적어주세요.", photo: "" },
      { date: "2027. 01. 23", title: "부부가 되는 날", description: "(예시) 결혼을 앞둔 마음을 적어주세요.", photo: "" },
    ],
  },

  interview: {
    enabled: true,
    title: "두 사람에게 물었습니다",
    description: "결혼을 앞둔 저희의\n짧은 인터뷰를 준비했습니다.",
    button: "인터뷰 읽어보기",
    items: [
      { question: "결혼을 앞둔 소감은 어떤가요?", answer: "신랑: (예시) 신랑의 답변을 적어주세요.\n신부: (예시) 신부의 답변을 적어주세요." },
      { question: "서로에게 전하고 싶은 말이 있다면?", answer: "신랑: (예시) 신랑의 답변을 적어주세요.\n신부: (예시) 신부의 답변을 적어주세요." },
    ],
  },

  // 장식 구간. type: "text-photo" | "photo-caption" | "save-the-date"
  // after: 이 섹션 뒤에 놓습니다. ratio: 보여 줄 비율, position: 잘릴 때 기준 위치.
  middle_designs: [
    { type: "text-photo", after: "interview", photo: "../assets/gallery/03.jpg", ratio: "4 / 5", position: "center 35%", lines: ["JOIN US", "AS WE", "BECOME ONE"] },
    { type: "photo-caption", after: "rsvp", photo: "../assets/gallery/01.jpg", ratio: "4 / 5", position: "center 30%", caption: "Kyungwon & Kyuro" },
    { type: "photo-caption", after: "rsvp", photo: "../assets/gallery/03.jpg", ratio: "4 / 5", position: "center 35%", caption: "23 January 2027" },
    { type: "photo-caption", after: "rsvp", photo: "../assets/gallery/04.jpg", ratio: "4 / 5", position: "center 60%", caption: "The Westin Josun Seoul" },
    { type: "save-the-date", after: "rsvp" },
  ],

  location: {
    title: "오시는 길",
    show_map: true,
    map_provider: "placeholder", // placeholder | osm (네이버·카카오 지도는 키 발급 후 연결)
    sketch_map_image: "",
    // 지하철 출구 번호와 하객 무료 주차 시간은 호텔 웨딩팀에 확인 후 고쳐 주세요.
    transport: [
      { title: "지하철", body: "2호선 을지로입구역 · 1·2호선 시청역 하차, 도보 약 5분\n4호선 회현역 하차, 도보 약 10분" },
      { title: "버스", body: "‘시청앞·덕수궁’ 또는 ‘을지로입구’ 정류장 하차" },
      { title: "자가용 · 주차", body: "네비게이션: ‘웨스틴 조선 서울’ 또는 ‘소공로 106’ 검색\n호텔 주차장 이용 가능 (하객 무료 주차 시간은 안내데스크에서 확인 부탁드립니다)" },
    ],
  },

  notices: [
    { label: "NOTICE", title: "(예시) 안내 제목", body: "(예시) 주차, 식사, 화환 등\n하객께 알리고 싶은 내용을 적어주세요.", photo: "" },
  ],

  gallery: {
    enabled: true,
    title: "웨딩 갤러리",
    photos: [
      "../assets/gallery/01.jpg",
      "../assets/gallery/02.jpg",
      "../assets/gallery/03.jpg",
      "../assets/gallery/04.jpg",
    ],
  },

  // 혼주 계좌는 list 에 { holder, bank, number } 를 더 적으면 표시됩니다.
  accounts: {
    enabled: true,
    title: "마음 전하실 곳",
    description: "참석이 어려우신 분들을 위해\n계좌번호를 함께 적었습니다.",
    groups: [
      {
        title: "신랑측 계좌번호",
        open: false,
        list: [
          { holder: "김경원", bank: "우리은행", number: "1002546017343" },
        ],
      },
      {
        title: "신부측 계좌번호",
        open: false,
        list: [
          { holder: "최규로", bank: "하나은행", number: "188-910335-06707" },
        ],
      },
    ],
  },

  ending: {
    photo: "../assets/gallery/04.jpg",
    quote: "늘 처음같은 마음으로\n서로를 귀하게 아끼며 살겠습니다.",
    quote_source: "",
    quote_top: "74%", // 글귀의 세로 위치. 비우면 사진 가운데(50%)
  },

  music: { enabled: false, file: "", autoplay: true },

  // 비우면 기본 순서
  section_order: [],
};
