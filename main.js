import { sha256 } from "./sha256.js";
import { nextSIEC } from "./ec.js";

const SIAVLIST = [];

fetchData()
  .then(() => {
    const event = document.createEvent("Event");
    event.initEvent("dataavailable", true, true);
    event.eventName = "dataavailable";
    document.dispatchEvent(event);
  })
  .catch(e => console.error(e));

document.addEventListener("dataavailable", () => {
  const div = document.getElementById("output");
  const ul = document.createElement("ul");
  let i = 0;
  for (let entry of filterNone()) {
    i++;
    if (i > 10) {
      break;
    }
    const li = document.createElement("li");
    //entry = JSON.parse(JSON.stringify(entry));
    //entry.id = entry.id.substr(0, 6);
    li.innerText = JSON.stringify(entry);
    ul.append(li);
  }
  div.innerHTML = "";
  div.append(ul);
});

async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await fetch("siav-dev.json");
  const data = await response.json();
  for (let d of data) {
    d.id = await sha256(d.f.join(","));
    console.log(d);
    SIAVLIST.push(d);
  }
}

window.foo = newCurveIterator();

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
    const [v1, v2] = await nextSIEC(prev === undefined ? startq : BigInt(prev.q));
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
    iterators[i] = filterSome({ q: 0, g: `${i + 1}` });
  }
  const siavs = iterators.map(itr => itr.next().value);
  while (true) {
    // Return siav with smallest "q" value.
    let v = siavs[0];
    let i = 0;
    for (let j = 1; j <= m; j++) {
      if (siavs[j] != null && BigInt(siavs[j].q) < BigInt(v.q)) {
        v = siavs[j];
        i = j;
      }
    }
    yield v;
    // Replace the one we found
    const g = iterators[i].next();
    if (g.done) {
      siavs[i] = undefined;
      iterators[i] = undefined;
    } else {
      siavs[i] = g.value;
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
