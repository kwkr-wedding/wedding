/**
 * 모바일 청첩장 RSVP · 방명록 백엔드 (Google Apps Script)
 * 1) 새 Google 스프레드시트 → 확장 프로그램 → Apps Script
 * 2) 이 코드를 붙여넣고 저장
 * 3) 배포 → 새 배포 → 유형: 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → 배포
 * 4) 발급된 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 config.js 의 appsScriptUrl 에 붙여넣기
 */
const RSVP_SHEET = "RSVP";
const GB_SHEET = "Guestbook";

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}

function clean_(v, max) { return String(v == null ? "" : v).replace(/^[=+\-@]/, "'$&").slice(0, max); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    const now = new Date();
    if (d.type === "rsvp") {
      sheet_(RSVP_SHEET, ["시간", "구분", "참석여부", "성함", "연락처", "인원", "식사", "메모"])
        .appendRow([now, clean_(d.side, 10), clean_(d.attend, 10), clean_(d.name, 20), clean_(d.phone, 20),
                    Number(d.count) || 0, clean_(d.meal, 10), clean_(d.note, 200)]);
    } else if (d.type === "guestbook") {
      sheet_(GB_SHEET, ["시간", "이름", "메시지", "숨김(체크하면 비공개)"])
        .appendRow([now, clean_(d.name, 20), clean_(d.message, 300), false]);
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
    const sh = sheet_(GB_SHEET, ["시간", "이름", "메시지", "숨김(체크하면 비공개)"]);
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
