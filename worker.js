importScripts("math.js", "siec.js");
const { decompress } = eval(`
(()=>{const t=String.fromCodePoint,e="length";return{compress:function(o){const r=[],n=new Map;for(let e=0;e<256;e++)n.set(t(e),e);let s="",c="",l="";for(let e of o)l=s+(c=t(e)),n.has(l)?s=l:(r.push(n.set(l,n.size).get(s)),s=c);return r.push(n.get(s)),(t=>{const o=t.reduce((t=0,e)=>e>t?e:t),r=1+Math.floor(Math.log2(o)),n=new Uint8Array(5+Math.ceil(t[e]*r/8));n[0]=r;for(let o=0;o<4;o++)n[1+o]=t[e]>>8*o&255;for(let o=0;o<t[e];o++)for(let e=0;e<r;e++){const s=40+(o*r+e);n[s>>3]|=(1<<s%8)*(t[o]>>e&1)}return n})(r)},decompress:function(o){const r=(t=>{const o=t[0],r=t.slice(1,5).reverse().reduce((t,e)=>t<<8|e,0),n=new Uint32Array(r);for(let r=0;r<t[e];r++)for(let e=0;e<o;e++){const s=40+(r*o+e);n[r]|=(1<<e)*(t[s>>3]>>s%8&1)}return n})(o),n=[];for(let e=0;e<256;e++)n.push(t(e));let s=n[r[0]],c="";const l=[s];for(let t of r.slice(1))l.push(c=t<n[e]?n[t]:s+s[0]),n.push(s+c[0]),s=c;const f=[];for(let t of l.join(""))f.push(t.codePointAt(0));return new Uint8Array(f)}}})();
`)

const DB = [];

const methods = { query, addCurves, start };

self.onmessage = async function (e) {
  const [id, methodName, methodArgs] = e.data;
  const result = await methods[methodName].apply(null, methodArgs);
  self.postMessage([id, result]);
};

async function start() {
  const response = await fetch("siav-list.json.lzw");
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const compressed = new Uint8Array(buffer);
  const decompressed = decompress(compressed);
  const data = JSON.parse(new TextDecoder().decode(decompressed));
  await new Promise(resolve => setTimeout(resolve, 500));
  for (let A of Object.values(data))
    DB.push(A);
  DB.sort(siavComparator);
  return { length: DB.length };
}

function addCurves() {
  const brr = [];
  for (let i = 0; i < 100; i++) {
    const q = BigIntMath.max.apply(
      null,
      DB.filter(A => A["dimension"] === "1").map(A => BigInt(A["base_field_cardinality"]))
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
function query(parameters = {}) {
  parameters.custom = eval(parameters.custom || "");
  const results = [];
  for (let siav of DB) {
    let ok = true;
    for (let [k, q] of Object.entries(parameters)) {
      const v = k.split(".").reduce((p, n) => p[n], siav);
      if ((typeof (q) === "function" && !q(siav)) || (v != null && `${q}` != `${v}`)) {
        ok = false;
        break;
      }
    }
    if (ok)
      results.push(siav);
  }
  let { offset = 0, limit = 10 } = parameters;
  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10);
  return {
    results: results.slice(offset, offset + limit),
    total: results.length
  };
}

function siavComparator(a, b) {
  if (BigInt(a["dimension"]) < BigInt(b["dimension"])) {
    return -1;
  }
  if (BigInt(a["dimension"]) > BigInt(b["dimension"])) {
    return 1;
  }
  if (BigInt(a["base_field_cardinality"]) < BigInt(b["base_field_cardinality"])) {
    return -1;
  }
  if (BigInt(a["base_field_cardinality"]) > BigInt(b["base_field_cardinality"])) {
    return 1;
  }
  if (a["weil_polynomial"] < b["weil_polynomial"]) {
    return -1;
  }
  if (a["weil_polynomial"] > b["weil_polynomial"]) {
    return 1;
  }
  return 0;
}
