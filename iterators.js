import { sha256 } from "./sha256.js";
import { BigIntMath } from "./math.js";

const SIAVLIST = [];
async function loadData() {
  if (SIAVLIST.length > 0) {
    return SIAVLIST;
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await fetch("siav-dev.json");
  const data = await response.json();
  for (let d of data) {
    d.id = await sha256(d.f.join(","));
    SIAVLIST.push(d);
  }
  return SIAVLIST;
}

export async function* newIterator(filter = {}) {
  const data = await loadData();
  const { g = "", q = ">0" } = filter;
  if (g !== "") {
    yield* iterateByDimension(filter);
    return;
  }
  const m = Math.max(...data.map(v => parseInt(v.g)));
  const iterators = new Array(m);
  const siavs = new Array(m);
  for (let i = 0; i < m; i++) {
    iterators[i] = iterateByDimension({ g: `${i + 1}`, q });
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

async function* iterateByDimension(filter = {}) {
  const { g = "", q = ">0" } = filter;
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
  const data = await loadData();
  let arr = data.filter(
    v =>
      v.g === g &&
      ((cmp === ">" && BigInt(v.q) > val) || (cmp === "<" && BigInt(v.q) < q))
  );
  arr = arr.sort(compareEntries);
  for (let v of arr) {
    yield v;
  }
}

async function* newCurveIterator(startq = 0n) {
  const data = await loadData();
  const arr = data
    .filter(v => v.g === "1" && BigInt(v.q) >= startq)
    .sort(compareEntries);
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

/**
 * Given a BigInt m, this returns some data about a super-isolated elliptic
 * curve over F_q with q > M. The curve has the property that q is minimal.
 * If m >= 10, then this should uniquely define the curve.
 * @param {BigInt} M
 * @returns {Object}
 */
export function nextSIEC(M) {
  if (typeof M !== "bigint") {
    throw Error("expected bigint got", typeof M);
  }
  if (M < 1621n) {
    throw Error("unimplemented for small M");
  }
  let t = BigIntMath.sqrt(4n * M - 163n);
  if (t ** 2n < 4n * M - 163n) {
    t++;
  }
  while (true) {
    for (let d of [3n, 4n, 7n, 8n, 11n, 19n, 43n, 67n, 163n]) {
      let q = t ** 2n + d;
      if (q % 4n !== 0n) {
        continue;
      }
      q = q >> 2n;
      const [p, _] = BigIntMath.isPerfectPower(q);
      if (q > M && BigIntMath.isProbablePrime(p, 20n)) {
        return [
          {
            Ap: "1",
            D: `${-d}`,
            N: `${q + 1n - t}`,
            NP: [[0, 0], [1, 0], [2, 1]],
            PP: true,
            f: [`${q}`, `${t}`, "1"],
            g: "1",
            p: `${p}`,
            q: `${q}`
          },
          {
            Ap: "1",
            D: `${-d}`,
            N: `${q + 1n + t}`,
            NP: [[0, 0], [1, 0], [2, 1]],
            PP: true,
            f: [`${q}`, `${-t}`, "1"],
            g: "1",
            p: `${p}`,
            q: `${q}`
          }
        ];
      }
    }
    t++;
  }
}

function compareEntries(v1, v2) {
  const g1 = BigInt(v1.g);
  const g2 = BigInt(v2.g);
  const q1 = BigInt(v1.q);
  const q2 = BigInt(v2.q);
  const N1 = BigInt(v1.N);
  const N2 = BigInt(v2.N);
  if (g1 < g2) {
    return -1;
  }
  if (g1 > g2) {
    return 1;
  }
  if (q1 < q2) {
    return -1;
  }
  if (q1 > q2) {
    return 1;
  }
  if (N1 < N2) {
    return -1;
  }
  if (N1 > N2) {
    return 1;
  }
  if (v1.id < v2.id) {
    return -1;
  }
  if (v1.id > v2.id) {
    return 1;
  }
  return 0;
}
