import { sha256 } from "./sha256.js";
import { nextSIEC } from "./ec.js";

const SIAVLIST = [];

// load data
(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await fetch("siav-dev.json");
  const data = await response.json();
  for (let d of data) {
    d.id = await sha256(d.f.join(","));
    SIAVLIST.push(d);
  }
  const event = document.createEvent("Event");
  event.initEvent("dataavailable", true, true);
  event.eventName = "dataavailable";
  document.dispatchEvent(event);
})();

document.addEventListener("dataavailable", async () => {
  const div = document.getElementById("output");
  const ul = document.createElement("ul");
  let i = 0;
  for await (let entry of iterateOverAll()) {
    i++;
    if (i > 10) {
      break;
    }
    const li = document.createElement("li");
    li.innerText = JSON.stringify(entry);
    ul.append(li);
  }
  div.innerHTML = "";
  div.append(ul);
  /*
  const more = document.createElement("button");
  more.innerText = "more";
  div.append(more);
  */
});

async function* iterateOverAll() {
  const m = Math.max(...SIAVLIST.map(v => parseInt(v.g)));
  const iterators = new Array(m);
  const siavs = new Array(m);
  for (let i = 0; i < m; i++) {
    iterators[i] = iterateByDimension({ g: `${i + 1}` });
    const val = await iterators[i].next();
    siavs[i] = val.done ? undefined : val.value;
  }
  while (true) {
    // Return siav with smallest "q" value.
    let v = siavs[0];
    let i = 0;
    for (let j = 1; j <= m; j++) {
      if (siavs[j] == null) {
        continue;
      }
      if (v == null) {
        v = siavs[j];
        i = j;
      } else if (BigInt(siavs[j].q) < BigInt(v.q)) {
        v = siavs[j];
        i = j;
      }
    }
    yield v;
    // Replace the one we found
    const g = await iterators[i].next();
    if (g.done) {
      siavs[i] = undefined;
      iterators[i] = undefined;
    } else {
      siavs[i] = g.value;
    }
  }
}

async function* iterateByDimension(conditions = {}) {
  const { g = "", q = ">0" } = conditions;
  if (!/\d+/.test(g)) {
    throw new Error("unknown value for 'g'");
  }
  if (!/(\<|\>)?\s*(\d+)/.test(q)) {
    throw new Error("unknown value for 'q'");
  }
  const [_, cmp, val] = /(\<|\>)?\s*(\d+)/.exec(q);
  if (g === "1") {
    yield* newCurveIterator(BigInt(val));
    return;
  }
  let arr = SIAVLIST.filter(
    v =>
      v.g === g &&
      ((cmp === ">" && BigInt(v.q) > val) || (cmp === "<" && BigInt(v.q) < q))
  );
  arr = arr.sort((a, b) => {
    a = BigInt(a.q);
    b = BigInt(b.q);
    return a > b ? 1 : a < b ? -1 : 0;
  });
  for (let v of arr) {
    yield v;
  }
}

async function* newCurveIterator(startq = 0n) {
  const arr = SIAVLIST.filter(v => v.g === "1" && BigInt(v.q) >= startq).sort(
    (a, b) => {
      a = BigInt(a.q);
      b = BigInt(b.q);
      return a > b ? 1 : a < b ? -1 : 0;
    }
  );
  let prev = undefined;
  for (let v of arr) {
    yield (prev = v);
  }
  while (true) {
    const [v1, v2] = nextSIEC(prev === undefined ? startq : BigInt(prev.q));
    v1.id = await sha256(v1.f.join(","));
    v2.id = await sha256(v2.f.join(","));
    yield v1;
    yield v2;
    prev = v2;
  }
}
