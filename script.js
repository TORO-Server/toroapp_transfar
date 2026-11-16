"use strict";
registSW();
function registSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(function(registration) {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      }, function(err) {
        console.log("ServiceWorker registration failed: ", err);
      });
    });
  }
}
function createMark(className) {
  const mark = document.createElement("div");
  mark.className = className;
  mark.appendChild(document.createElement("br"));
  return mark;
}
function createStation(markClass, stationName) {
  const station = document.createElement("div");
  station.className = "sta";
  const name = document.createElement("h1");
  name.textContent = stationName;
  station.append(createMark(markClass), name);
  return station;
}
function createLine(lineName) {
  const line = document.createElement("div");
  line.className = "line";
  const name = document.createElement("p");
  name.textContent = lineName;
  line.append(createMark("connect"), name);
  return line;
}
async function requestbutton() {
  let from = document.getElementById("from").value;
  let to = document.getElementById("to").value;
  const data = await get(`${API_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  let result_data_id = document.getElementById("result_data");
  result_data_id.replaceChildren();
  if (!Array.isArray(data.main) || data.main.length === 0) {
    const message = document.createElement("p");
    message.textContent = "経路が見つかりませんでした。";
    result_data_id.appendChild(message);
    return;
  }
  let search = data.main[0][1];
  result_data_id.append(createStation("station", data.main[0][0]), createLine(data.main[0][1]));
  for (let loop = 0; loop < data.main.length; loop++) {
    if (data.main[loop][1] != search) {
      search = data.main[loop][1];
      result_data_id.append(createStation("trans", data.main[loop - 1][0]), createLine(data.main[loop][1]));
    }
  }
  result_data_id.appendChild(createStation("station", data.main.slice(-1)[0][0]));
  let min = ~~(data.length / 60);
  let sec = data.length % 60;
  console.log(data.main);
}
(async () => {
  const stationList = await get(`${API_URL}?list=station`);
  const stationDatalist = document.getElementById("stationList");
  console.log(stationList.main);
  for (const stationData of stationList.main) {
    const option = document.createElement("option");
    option.value = stationData;
    stationDatalist.appendChild(option);
  }
  console.log(stationList.main);
})();
function get(url) {
  return new Promise((resolve) => {
    fetch(url).then((response) => response.json()).then((data) => resolve(data));
  });
}
