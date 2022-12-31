//メモ
// S = 路線名の差異、比較元　もし乗換駅が出たら、Sは書き換わって乗換先路線が比較元になる。
// U = 乗換駅･その路線名。damta.main[x]の形で入ってる。
// i = 乗換駅検索の繰り返し回数。
// R = 乗車駅
// G = 下車駅

"use strict";

registSW();

// 経路検索API の URL
const url = "https://script.google.com/macros/s/AKfycbxYA8zo16so3zlystt-1vTK8GbpRANUZPOdphESCQy2GmEAlQpj_POQtCR8bdaOnpM/exec";

function registSW() {

  // Service Worker 対応ブラウザの場合、スコープに基づいてService Worker を登録する

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}

// ServiceWorker登録：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function (registration) {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function (err) {
    console.log('ServiceWorker registration failed: ', err);
  });
}

//---------- 検索 & 検索結果表示処理 ----------//
async function requestbutton() {
  let from = document.getElementById("from").value;
  let to = document.getElementById("to").value;

  // Get リクエスト
  const data = await get(`${url}?from=${from}&to=${to}`);

  let search = data.main[0][1];//出発駅代入
  let result_data_id = document.getElementById('result_data');//<div id="result_data">を取得

  result_data_id.innerHTML = "";//<div id="result_data">内を何も書いていない状態にする

  result_data_id.insertAdjacentHTML('beforeend', `<div class="sta"><div class="station"><br></div><h1>${data.main[0][0]}</h1></div><div class="line"><div class="connect"><br></div><p>${data.main[0][1]}</p></div>`);//乗車する場所表示

  for (let loop = 0; loop < data.main.length; loop++) {
    if (data.main[loop][1] != search) {//もし乗換する場所を見つけたら乗換表示の要素追加
      search = data.main[loop][1];
      result_data_id.insertAdjacentHTML('beforeend', `<div class="sta"><div class="trans"><br></div><h1>${data.main[loop - 1][0]}</h1></div><div class="line"><div class="connect"><br></div><p>${data.main[loop][1]}</p></div>`);
    }
  }

  result_data_id.insertAdjacentHTML('beforeend', `<div class="sta"><div class="station"><br></div><h1>${data.main.slice(-1)[0][0]}</h1></div>`);//降りる場所表示

  let min = ~~(data.length / 60);
  let sec = (data.length % 60);

  result_data_id.insertAdjacentHTML('beforeend', `<br><p>移動距離は${min}分${sec}秒です。`);//移動ブロック表示

  console.log(data.main);
}
//---------- 検索 & 検索結果表示処理 ----------//


//---------- このjsファイルが読み込まれた瞬間に発動 予測変換を設定する部分 ----------//
(async () => {// 干渉しないように 即時関数
  const stationList = await get(`${url}?list=station`);

  const stationDatalist = document.getElementById('stationList');
  console.log(stationList.main);

  for (const stationData of stationList.main) {
    stationDatalist.insertAdjacentHTML("beforeend", `<option value="${stationData}">`);
  }
  console.log(stationList.main);

})();
//---------- このjsファイルが読み込まれた瞬間に発動 予測変換を設定する部分 ----------//


//----------  util 群 ----------//

function get(url) {// Get リクエスト
  return new Promise((resolve) => {
    fetch(url)
      .then(response => response.json())
      .then(data => resolve(data))
  });
}

//----------  util 群 ----------//