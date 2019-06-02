// [`${q}`, `${-t}`, "1"]
import { BigIntMath } from "./math.js";
import { PolynomialMath } from "./polynomial.js";

/**
 * Given the Frobenius polynomial of an SIAV, this
 * computes a bunch of stuff.
 * @param {Array<bigint>} f
 */
function computeSIAVData(f) {
  const g = PolynomialMath.degree(f) / 2;
  const D = PolynomialMath.discriminant(f) / f[0] ** BigInt(g - 1);
  // TODO: NP -- newton polygon
  // TODO: Ap -- p-torsion
  // TODO: OR -- ordinary
  // TODO: p -- q = p^a
  // TODO: a -- q = p^a
  // TODO: q -- base field
  // TODO: N -- #A(Fq)
  // TODO: PP -- principally polarized
  // TODO: T -- Deligne functor image
}

