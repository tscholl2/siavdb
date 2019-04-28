import { sha256 } from "./sha256.js";
import { nextSIEC } from "./ec.js";

const SIAVLIST = [];

loadData()
  .then(() => console.log("loaded"))
  .catch(e => console.error(e));

async function loadData() {
  const response = await fetch("siav-dev.json");
  const data = await response.json();
  for (let d of data) {
    d.id = await sha256(d["f"].join(","));
    SIAVLIST.push(d);
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

function* newCurveIterator(startq = 0n) {
  let index = 0;
  let prev = undefined;
  while (index < SIAVLIST.length) {
    prev = SIAVLIST[index];
    if (prev.g === "1" && BigInt(prev.q) >= startq) {
      yield prev;
    }
    index++;
  }
  while (true) {
    const [v1, v2] = nextSIEC(prev === undefined ? startq : BigInt(prev.q));
    yield v1;
    yield v2;
    prev = v2;
  }
}

function* filterNone() {
  const curveItr = newCurveIterator();
  const m = Math.max(...SIAVLIST.map(v => parseInt(v.g)));
  const iterators = new Array(m);
  iterators[0] = curveItr;
  for (let i = 1; i < m; i++) {
    iterators[i] = filter({ q: 0, g: `${i + 1}` });
  }
  siavs = iterators.map(itr => itr.next());
  while (true) {
    // Return siav with smallest "q" value.
    let v = siavs[0];
    let i = 0;
    for (let j = 1; j <= m; j++) {
      if (siavs[j] != null && BigInt(siavs[j].q) < BigInt(v.q)) {
        v = siaves[j];
        i = j;
      }
    }
    yield v;
    // Replace the one we found
    const val = iterators[i].next();
    if (val.done) {
      siavs[i] = val.value;
    } else {
      siavs[i] = undefined;
    }
  }
}

function* filterSome(conditions = {}) {
  const { g = "", q = "" } = conditions;
  if (!/\d+/.test(g)) {
    throw new Error("unknown value for 'g'");
  }
  if (!/(\<|\>)?\s*(\d+)/.test(q)) {
    throw new Error("unknown value for 'q'");
  }
  const [_, cmp, val] = /(\<|\>)?\s*(\d+)/.exec(q);
  if (g === "1") {
    return newCurveIterator(BigInt(val));
  }
  const data = SIAVLIST.filter(v => v.g === g);
  for (let v of data) {
    if (q !== "") {
      if (cmp === ">" && BigInt(v.q) <= BigInt(val)) {
        continue;
      }
      if (cmp === "<" && BigInt(v.q) >= BigInt(val)) {
        return;
      }
    }
    yield v;
  }
  return;
}
