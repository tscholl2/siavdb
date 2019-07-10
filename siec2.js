/**
 *
 * @param {BigInt} M
 * @returns {Array}
 */
function nextSIEC(M) {
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
function siecData(t, q) {
  const [p, a] = BigIntMath.isPerfectPower(q);
  const d = q - t ** 2n; // this is positive
  return {
    id: `1,${t},${q}`,
    f:
      t > 0n
        ? `x^2 - ${t}x + ${q}`
        : t < 0n
        ? `x^2 + ${-t}x + ${q}`
        : `x^2 + ${q}`,
    p: `${p}`,
    a: `${a}`,
    q: `${q}`,
    croots: t === 0n ? [`sqrt(${q})`, `-sqrt(${q})`] : ["?", "?"],
    g: "1",
    N: `${1n - t + q}`,
    NP: t % p !== 0n ? ["1", "0"] : ["1/2", "1/2"],
    AP: t % p !== 0n ? "1" : "0",
    OR: t % p !== 0n,
    F: [["0", `${-q}`], ["1", `${t}`]], // basis: [1,pi] ---> pi*(1,0) = (0,1), pi*(0,1) = (-q,t)
    V: [[`${t}`, `${q}`], ["-1", "0"]], // basis: [1,pi] ---> pibar*(1,0) = (t,-1), pibar*(0,1) = (q,0)
    PP: true,
    Kf:
      t % p === 0n
        ? t === 0n
          ? `x^2 + ${q}`
          : "???"
        : d % 4n === 0n
        ? `x^2 + ${d / 4n}`
        : `x^2 + x + ${(d - 1n) / 4n}`,
    "K+f": "y - 1",
    Kdisc: `${-d}`,
    "K+disc": "1",
    Kdeg: "2",
    "K+deg": "1"
  };
}

/**
 * Given a BigInt m, this returns some data about a super-isolated elliptic
 * curve over F_q with q > M. The curve has the property that q is minimal.
 * If m >= 10, then this should uniquely define the curve.
 * @param {BigInt} M
 * @returns {Object}
 */
function nextORSIEC(M) {
  if (typeof M !== "bigint") {
    throw Error("expected bigint got", typeof M);
  }
  if (M < 1621n) {
    throw Error("unimplemented for small M: ", M);
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
      if (q > M && BigIntMath.isProbablePrime(p, 20n)) {
        return [siecData(t, q), siecData(-t, q)];
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
function nextSSSIEC(M) {
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
    return [siecData(0n, q)] + (a % 2n) === 0n
      ? [siecData(p ** (1n + a / 2n), q), siecData(-(p ** (1n + a / 2n)), q)]
      : [
          siecData(p ** ((1n + a) / 2n), q),
          siecData(-(p ** ((1n + a) / 2n)), q)
        ];
  }
  if (p === 3n) {
    return a % 2n === 0n
      ? [
          siecData(2n * p ** (a / 2n), q),
          siecData(-2n * p ** (a / 2n), q),
          siecData(p ** (a / 2n), q),
          siecData(-(p ** (a / 2n)), q)
        ]
      : [
          siecData(p ** ((1n + a) / 2n), q),
          siecData(-(p ** ((1n + a) / 2n)), q)
        ];
  }
  return [siecData(2n * p ** (a / 2n), q), siecData(-2n * p ** (a / 2n), q)];
}
