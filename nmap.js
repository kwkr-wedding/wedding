/* 오시는 길 지도: 네이버 지도 (NAVER Maps JavaScript API v3)
 * - 키(ncpKeyId)는 네이버 클라우드 플랫폼 Maps Application 의 Client ID. 등록한 Web 서비스 URL(https://kwkr-wedding.github.io) 에서만 작동합니다.
 * - 처음에는 지도가 잠겨 있어(끌기 · 확대 안 됨) 화면을 내리다 지도에 걸리지 않습니다. unlock() 으로 풀고 lock() 으로 다시 잠급니다.
 * - 네이버 지도를 불러오지 못하면(인증 실패 · 차단 · 8초 넘게 응답 없음) 예전처럼 구글 지도를 띄웁니다.
 * 사용: const m = weddingMap(상자, { name, address, lat, lng }); m.load(); m.unlock(); m.lock();
 */
(function () {
  "use strict";
  const KEY = "1zjrgbmsd2";
  let loading = null, authBad = false;
  const onBad = [];   // 인증이 나중에(지도를 만든 뒤) 실패해도 구글 지도로 바꿀 수 있게 모아 둡니다
  const loadNaver = () => loading || (loading = new Promise((ok, no) => {
    if (window.naver && naver.maps && naver.maps.Map) return ok();
    window.navermap_authFailure = () => { authBad = true; no(new Error("auth")); onBad.splice(0).forEach(f => f()); };   // 키 · 주소 인증이 실패하면 네이버가 이 함수를 부릅니다
    const s = document.createElement("script");
    s.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=" + KEY;
    s.async = true;
    s.onload = () => (window.naver && naver.maps && naver.maps.Map ? ok() : no(new Error("load")));
    s.onerror = () => no(new Error("load"));
    document.head.appendChild(s);
    setTimeout(() => no(new Error("timeout")), 8000);
  }));

  window.weddingMap = (box, v) => {
    let map = null, started = false, live = false, failed = false;
    const LOCKED = { draggable: false, pinchZoom: false, scrollWheel: false, keyboardShortcuts: false, disableDoubleTapZoom: true, disableDoubleClickZoom: true, disableTwoFingerTapZoom: true };
    const OPEN = { draggable: true, pinchZoom: true, scrollWheel: true, keyboardShortcuts: true, disableDoubleTapZoom: false, disableDoubleClickZoom: false, disableTwoFingerTapZoom: false };
    const google = () => {
      if (failed) return; failed = true; if (map) { try { map.destroy(); } catch (e) {} } map = null; box.innerHTML = "";
      const f = document.createElement("iframe");
      f.title = v.name + " 지도"; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      f.style.cssText = "display:block;width:100%;height:100%;border:0";
      f.src = "https://maps.google.com/maps?q=" + encodeURIComponent(v.name + " " + v.address) + "&hl=ko&z=16&output=embed";
      box.appendChild(f);
    };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    return {
      load() {
        if (started) return; started = true;
        onBad.push(google);
        loadNaver().then(() => {
          if (failed || authBad) return google();
          const pos = new naver.maps.LatLng(v.lat, v.lng);
          map = new naver.maps.Map(box, Object.assign({ center: pos, zoom: 16, zoomControl: false, mapDataControl: false, scaleControl: false, logoControl: true }, live ? OPEN : LOCKED));
          new naver.maps.Marker({
            position: pos, map,
            icon: { content: `<div class="nv-pin"><span>${esc(v.name)}</span><i></i></div>`, anchor: new naver.maps.Point(0, 0) }
          });
          // 상자 크기가 늦게 정해지는 경우(글꼴 · 사진 로딩)를 대비해 한 번 더 맞춥니다
          setTimeout(() => { if (map) { map.autoResize(); map.setCenter(pos); } }, 600);
        }).catch(google);
      },
      unlock() { live = true; if (map) try { map.setOptions(Object.assign({ zoomControl: true, zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT, style: naver.maps.ZoomControlStyle.SMALL } }, OPEN)); } catch (e) {} },
      lock() { live = false; if (map) try { map.setOptions(Object.assign({ zoomControl: false }, LOCKED)); } catch (e) {} }
    };
  };
})();
