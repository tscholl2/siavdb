importScripts("math2.js", "siec2.js");
const DB = [];
startWorker();

const methods = { query, addCurves };

self.onmessage = async function(e) {
  const [id, methodName, methodArgs] = e.data;
  const result = await methods[methodName].apply(null, methodArgs);
  self.postMessage([id, result]);
};

async function startWorker() {
  const response = await fetch("data/siav-list.json");
  const data = await response.json();
  for (let A of data) {
    DB.push(A);
  }
  DB.sort(siavComparator);
  self.dispatchEvent(new Event("finishedLoadingDB"));
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

async function query(searchParameters = {}) {
  if (DB.length === 0) {
    await new Promise(resolve =>
      self.addEventListener("finishedLoadingDB", resolve)
    );
  }
  const data = [];
  for (let siav of DB) {
    let ok = true;
    for (let key in searchParameters) {
      const value = searchParameters[key];
      if (value && `${value}` != `${siav[key]}`) {
        ok = false;
      }
    }
    if (ok) {
      data.push(siav);
    }
  }
  const { index = 0, length = 10 } = searchParameters;
  return {
    data: data.slice(index, index + length),
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
