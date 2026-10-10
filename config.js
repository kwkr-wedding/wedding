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
      { role: "신부", name: "최규로", bank: "", number: "", kakaopay: "" },
      { role: "신부 아버지", name: "최영선", bank: "", number: "" },
      { role: "신부 어머니", name: "권순희", bank: "", number: "" },
    ],
  },

  // 갤러리: assets/gallery/ 폴더에 사진을 넣고 파일명을 적어주세요. 비어 있으면 섹션이 숨겨집니다.
  gallery: [
    "01.jpg", "02.jpg", "03.jpg", "04.jpg",
  ],

  // 참석 의사(RSVP) · 방명록 저장용 Google Apps Script 웹앱 주소 (README 참고)
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
};
