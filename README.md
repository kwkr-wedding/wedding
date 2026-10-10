# 김경원 ♥ 최규로 모바일 청첩장

GitHub Pages(깃허브 정적 웹호스팅)로 배포하는 단일 페이지 청첩장입니다. 내용 수정은 `config.js` 하나만 고치면 됩니다.

## 배포
1. GitHub에 `kwkr-wedding` 조직에 `wedding` 저장소(public)를 만들고 이 폴더 전체를 올립니다.
2. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
3. 1~2분 뒤 `https://kwkr-wedding.github.io/wedding/` 에서 열립니다.
   - 저장소 이름이 다르면 `config.js`의 `siteUrl`, `index.html`의 `og:url`·`og:image` 주소도 바꿔주세요.

## RSVP(참석 의사) · 방명록 연결 — Google 스프레드시트
1. Google 스프레드시트 새로 만들기 → 확장 프로그램 → Apps Script
2. `apps-script/Code.gs` 내용을 붙여넣고 저장
3. 배포 → 새 배포 → 유형 **웹 앱**, 실행 계정 **나**, 액세스 **모든 사용자** → 배포 → 권한 승인
4. 발급된 `https://script.google.com/macros/s/…/exec` 주소를 `config.js`의 `appsScriptUrl`에 붙여넣기
5. 응답은 시트의 `RSVP` 탭, 방명록은 `Guestbook` 탭에 쌓입니다. 방명록 글을 숨기려면 D열(숨김)을 체크하세요.

`appsScriptUrl`이 비어 있으면 RSVP는 `rsvpFallbackPhone` 번호로 문자를 보내는 방식으로 동작하고, 방명록은 숨겨집니다.

## 선택 기능
| 항목 | 설정 |
|---|---|
| 신부측 계좌 | `accounts.bride[].bank / number` 입력 시 자동 표시 |
| 연락하기 | `groom/bride` 및 혼주 `phone` 입력 시 ‘연락하기’ 버튼 표시 |
| 갤러리 | `assets/gallery/`에 사진 추가 후 `gallery`에 파일명 나열 |
| 카카오톡 공유 | developers.kakao.com에서 JavaScript 키 발급, 플랫폼 > Web에 `https://kwkr-wedding.github.io` 등록 후 `kakaoJsKey` 입력 |
| 카카오페이 송금 | 카카오페이 송금 링크를 `kakaopay`에 입력 |
| 배경음악 | `assets/bgm.mp3` 추가 후 `bgm: "assets/bgm.mp3"` |
| 눈 효과 | `snow: false`로 끄기 |

## 확인 필요
- 교통·주차 안내는 일반 정보로 적어두었습니다. 지하철 출구 번호와 하객 무료 주차 시간은 웨스틴 조선 웨딩팀에 확인 후 `venue.transport`를 수정하세요.
