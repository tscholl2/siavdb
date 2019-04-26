let SIAVLIST = [];

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder("utf-8").encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map(b => ("00" + b.toString(16)).slice(-2))
    .join("");
  return hashHex;
}

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

loadData().then(() => console.log("loaded")).catch(e => console.error(e));
