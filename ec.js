import { BigIntMath } from "./math.js";

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
