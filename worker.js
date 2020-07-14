importScripts("math.js", "siec.js");
const DB = [];

const methods = { query, addCurves, start };

self.onmessage = async function (e) {
  const [id, methodName, methodArgs] = e.data;
  const result = await methods[methodName].apply(null, methodArgs);
  self.postMessage([id, result]);
};

async function start() {
  const response = await fetch("data/siav-list.json");
  const data = await response.json();
  await new Promise(resolve => setTimeout(resolve, 500));
  for (let A of Object.values(data)) {
    DB.push(A);
  }
  DB.sort(siavComparator);
  return { length: DB.length };
}

function addCurves() {
  const brr = [];
  for (let i = 0; i < 100; i++) {
    const q = BigIntMath.max.apply(
      null,
      DB.filter(A => A["g"] === "1").map(A => BigInt(A["q"]))
    );
    const arr = nextSIEC(q + 1n);
    for (let A of arr) {
      DB.push(A);
      brr.push(A);
    }
    DB.sort(siavComparator);
  }
  return brr;
}

// TODO: cache total results for easy slicing when limit/offset changes
function query(searchParameters = {}) {
  if (searchParameters["function"])
    searchParameters["function"] = eval(searchParameters["function"]);
  const results = [];
  for (let siav of DB) {
    let ok = true;
    for (let [k, q] of Object.entries(searchParameters)) {
      const v = siav[k];
      if ((k === "function" && !q(siav)) || (v != null && `${q}` != `${v}`)) {
        ok = false;
        break;
      }
    }
    if (ok)
      results.push(siav);
  }
  let { offset = 0, limit = 10 } = searchParameters;
  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10);
  return {
    results: results.slice(offset, offset + limit),
    total: results.length
  };
}

function siavComparator(a, b) {
  if (BigInt(a["g"]) < BigInt(b["g"])) {
    return -1;
  }
  if (BigInt(a["g"]) > BigInt(b["g"])) {
    return 1;
  }
  if (BigInt(a["q"]) < BigInt(b["q"])) {
    return -1;
  }
  if (BigInt(a["q"]) > BigInt(b["q"])) {
    return 1;
  }
  if (a["f"] < b["f"]) {
    return -1;
  }
  if (a["f"] > b["f"]) {
    return 1;
  }
  return 0;
}
