/**
 * Given a sting s, return the SHA-256 digest of s
 * (encoded as a UTF-8 byte array) in hex form.
 * @param {string} s
 * @returns {string}
 * 
 * python -c 'import hashlib; print(hashlib.sha256("a🐦".encode("utf8")).hexdigest())'
 * 17b5785b8c2ca550b020717c98ab460a64e484ca672a302108dd5457aa1d78c0
 * 
 * python -c 'import hashlib; print(hashlib.sha256("$€𐐷𤭢".encode("utf8")).hexdigest())'
 * 2a90d87f9c44184a1741170866bbc978c4028fb4f3c2819fe9598b035eb3b8ea
 */
async function sha256(s) {
  return Array.prototype.map.call(
    new Uint8Array(await window.crypto.subtle.digest("sha-256", new TextEncoder("utf-8").encode(s))),
    x => x.toString(16).padStart(2, "0")
  ).join('');
}

/**
 * Given a bound M, return all SIEC's over GF(q) with q >= M minimal
 * such that an SIEC exists.
 * @param {BigInt} M
 * @returns {Array}
 */
async function nextSIEC(M) {
  const arr = nextORSIEC(M);
  const brr = nextSSSIEC(M);
  if (BigInt(arr[0]["q"]) < BigInt(brr[0]["q"])) {
    return arr;
  }
  if (BigInt(arr[0]["q"]) > BigInt(brr[0]["q"])) {
    return brr;
  }
  return arr.concat(brr);
}

/**
 * Given the trace t and prime power q for a SIEC,
 * this returns a bunch of data about the curve.
 * @param {BigInt} t
 * @param {BigInt} q
 */
async function siecData(t, q) {
  const [p, a] = BigIntMath.isPerfectPower(q);
  const d = q - t ** 2n; // this is positive
  const component = {
    exponent: "1",
    id: await sha256(`${q},${t},1`),
    f: t === 0n
      ? `x^2 + ${q}`
      : t > 0n
        ? `x^2 - ${t}x + ${q}`
        : t < 0n
          ? `x^2 + ${-t}x + ${q}`
          : `x^2 + ${q}`,
    h: t === 0n ? "x" : t > 0n ? `x - ${t}` : `x + ${-t}`,
    g: "1",
    croots: t === 0n ? [`sqrt(${q})`, `-sqrt(${q})`] : ["?", "?"],
    newton_polygon: t % p !== 0n ? ["1", "0"] : ["1/2", "1/2"],
    is_ordinary: t % p !== 0n,
    frobenius_matrix: [["0", `${-q}`], ["1", `${t}`]], // basis: [1,pi] ---> pi*(1,0) = (0,1), pi*(0,1) = (-q,t)
    verschiebung_matrix: [[`${t}`, `${q}`], ["-1", "0"]], // basis: [1,pi] ---> pibar*(1,0) = (t,-1), pibar*(0,1) = (q,0)
    is_principally_polarized: true,
    K: `x^2 + ${d % 4n === 0n ? (d / 4n) : d}`,
    "K+": "y - 1",
    DeltaK: `${-d}`,
    "DeltaK+": "1",
  };
  return {
    id: component.id,
    f: component.f,
    h: component.h,
    q: `${q}`,
    a: `${a}`,
    p: `${p}`,
    g: component.g,
    is_simple: component.is_simple,
    is_principally_polarized: component.is_principally_polarized,
    DeltaK: component.DeltaK,
    "DeltaK+": component["DeltaK+"],
    components: [component],
  }
}

/**
 * Given a BigInt m, this returns some data about a super-isolated elliptic
 * curve over F_q with q > M. The curve has the property that q is minimal.
 * If m >= 10, then this should uniquely define the curve.
 * @param {BigInt} M
 * @returns {Object}
 */
async function nextORSIEC(M) {
  if (typeof M !== "bigint") {
    throw Error(`expected bigint got ${typeof M}`);
  }
  if (M < 1621n) {
    throw Error(`unimplemented for small M = ${M}`);
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
      const p = BigIntMath.isPerfectPower(q)[0];
      if (q >= M && BigIntMath.isProbablePrime(p, 20n)) {
        return [await siecData(t, q), await siecData(-t, q)];
      }
    }
    t++;
  }
}

/**
 * Given a bound M, returns some data
 * about the next supersingular SIEC over
 * F_q with q close to M.
 * @param {BigInt} M
 * @returns {Array}
 */
async function nextSSSIEC(M) {
  const q = BigIntMath.min(
    ...[2n, 3n, 5n, 7n, 13n].map(p => {
      let k = 1;
      let q = p;
      while (q < M || (p > 3n && k % 2 !== 0)) {
        k++;
        q *= p;
      }
      return q;
    })
  );
  const [p, a] = BigIntMath.isPerfectPower(q);
  if (p === 2n) {
    return [await siecData(0n, q)] + (a % 2n) === 0n
      ? [await siecData(p ** (1n + a / 2n), q), await siecData(-(p ** (1n + a / 2n)), q)]
      : [
        await siecData(p ** ((1n + a) / 2n), q),
        await siecData(-(p ** ((1n + a) / 2n)), q)
      ];
  }
  if (p === 3n) {
    return a % 2n === 0n
      ? [
        await siecData(2n * p ** (a / 2n), q),
        await siecData(-2n * p ** (a / 2n), q),
        await siecData(p ** (a / 2n), q),
        await siecData(-(p ** (a / 2n)), q)
      ]
      : [
        await siecData(p ** ((1n + a) / 2n), q),
        await siecData(-(p ** ((1n + a) / 2n)), q)
      ];
  }
  return [await siecData(2n * p ** (a / 2n), q), await siecData(-2n * p ** (a / 2n), q)];
}
