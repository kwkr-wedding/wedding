/**
 * 모바일 청첩장 RSVP · 방명록 백엔드 (Google Apps Script, 스프레드시트에 연결된 스크립트)
 * - RSVP 탭: 같은 이름(공백 무시)으로 다시 회신하면 기존 줄을 최신 내용으로 덮어씀
 * - Guestbook 탭: 방명록 (D열 체크 시 화면에서 숨김)
 * 배포: 배포 → 새 배포 → 웹 앱 / 실행: 나 / 액세스: 모든 사용자
 */
const RSVP_SHEET = "RSVP";
const GB_SHEET = "Guestbook";
const RSVP_HEADER = ["최초 등록", "최종 수정", "구분", "참석여부", "성함", "연락처", "식사", "메모", "수정 횟수"];
const GB_HEADER = ["시간", "이름", "메시지", "숨김(체크하면 비공개)"];
const NAME_COL = 5; // RSVP_HEADER 에서 "성함" 위치 (1부터)

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight("bold");
  }
  return sh;
}

// 수식 주입 방지 + 길이 제한
function clean_(v, max) { return String(v == null ? "" : v).trim().replace(/^[=+\-@]/, "'$&").slice(0, max); }
// 이름 비교용 키: 공백 제거
function key_(v) { return String(v == null ? "" : v).replace(/^'/, "").replace(/\s+/g, ""); }

function upsertRsvp_(d) {
  const sh = sheet_(RSVP_SHEET, RSVP_HEADER);
  const now = new Date();
  const name = clean_(d.name, 20);
  if (!name) return;
  const values = [clean_(d.side, 10), clean_(d.attend, 10), name, clean_(d.phone, 20), clean_(d.meal, 10), clean_(d.note, 200)];
  const last = sh.getLastRow();
  if (last > 1) {
    const names = sh.getRange(2, NAME_COL, last - 1, 1).getValues();
    // 가장 아래(가장 최근)에 있는 같은 이름 줄을 찾아 덮어씀
    for (let i = names.length - 1; i >= 0; i--) {
      if (key_(names[i][0]) === key_(name)) {
        const row = i + 2;
        const count = Number(sh.getRange(row, 9).getValue()) || 0;
        sh.getRange(row, 2, 1, 8).setValues([[now].concat(values).concat([count + 1])]);
        return;
      }
    }
  }
  sh.appendRow([now, now].concat(values).concat([0]));
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    if (d.type === "rsvp") {
      upsertRsvp_(d);
    } else if (d.type === "guestbook") {
      sheet_(GB_SHEET, GB_HEADER).appendRow([new Date(), clean_(d.name, 20), clean_(d.message, 300), false]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if ((e.parameter || {}).type === "guestbook") {
    const sh = sheet_(GB_SHEET, GB_HEADER);
    const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
    const items = rows.filter(r => r[1] && r[3] !== true)
      .map(r => ({ time: new Date(r[0]).toISOString(), name: String(r[1]).replace(/^'/, ""), message: String(r[2]).replace(/^'/, "") }));
    return json_({ items });
  }
  return json_({ ok: true });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** 배포 전 편집기에서 한 번 실행해 권한 승인 + 탭 생성 확인용 */
function setup() {
  sheet_(RSVP_SHEET, RSVP_HEADER);
  sheet_(GB_SHEET, GB_HEADER);
}
