import { sha256 } from "./sha256.js";
import { nextSIEC } from "./ec.js";

console.log(window.nextSIEC = nextSIEC)

let SIAVLIST = [];

async function loadData() {
  const response = await fetch("siav.json");
  const data = await response.json();
  for (let d of data) {
    d.id = await sha256(d["f"].join(","));
  }
  const table = document.getElementById("data-table");
  for (let entry of data) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.innerText = JSON.stringify(entry);
    tr.append(td);
    table.append(tr);
  }
}

loadData()
  .then(() => console.log("loaded"))
  .catch(e => console.error(e));

function filter(conditions) {
  ???
}
