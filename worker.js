importScripts("math2.js", "siec2.js");
const DB = [];

const methods = { query, addCurves, start };

self.onmessage = async function(e) {
  const [id, methodName, methodArgs] = e.data;
  const result = await methods[methodName].apply(null, methodArgs);
  self.postMessage([id, result]);
};

async function start() {
  const response = await fetch("data/siav-list.json");
  const data = await response.json();
  await new Promise(resolve => setTimeout(resolve, 500));
  for (let A of data) {
    DB.push(A);
  }
  DB.sort(siavComparator);
  return { length: DB.length };
}

function addCurves() {
  const q = BigIntMath.max.apply(
    null,
    DB.filter(A => A["g"] === "1").map(A => BigInt(A["q"]))
  );
  const arr = nextSIEC(q + 1n);
  for (let A of arr) {
    DB.push(A);
  }
  DB.sort(siavComparator);
  return arr;
}

function query(searchParameters = {}) {
  const data = [];
  for (let siav of DB) {
    let ok = true;
    for (let key in siav) {
      const value = searchParameters[key];
      if (value && `${value}` != `${siav[key]}`) {
        ok = false;
      }
    }
    if (ok) {
      data.push(siav);
    }
  }
  let { offset = 0, limit = 10 } = searchParameters;
  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10);
  return {
    data: data.slice(offset, offset + limit),
    total: data.length
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
