import { MatrixMath } from "./matrix.js";

export class PolynomialMath {
  static deg(f) {
    return f.length - 1;
  }

  static zero() {
    return [0n];
  }

  static one() {
    return [1n];
  }

  static x() {
    return [0n, 1n];
  }

  static mul(f, g) {
    const n = PolynomialMath.deg(f);
    const m = PolynomialMath.deg(g);
    const h = new Array(n + m + 1);
    for (let i = 0; i < h.length; i++) {
      h[i] = 0n;
    }
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= m; j++) {
        h[i + j] += f[i] * g[j];
      }
    }
    return h;
  }

  static add(f, g) {
    const n = PolynomialMath.deg(f);
    const m = PolynomialMath.deg(g);
    if (n < m) {
      return PolynomialMath.add(g, f);
    }
    const h = new Array(n);
    for (let i = 0; i <= m; i++) {
      h[i] = f[i] + g[i];
    }
    for (let i = m + 1; i <= n; i++) {
      h[i] = f[i];
    }
    return h;
  }
  
  static scale(f, k) {
    return f.map(a => k * a);
  }
  
  static sub(f, g) {
    return PolynomialMath.add(f, PolynomialMath.scale(g, -1n));
  }
  
  /**
   * Returns true if the ideals (f) and (g) in Z[x]
   * sum to (1). Otherwise, returns false.
   * @param {Array<bigint>} f 
   * @param {Array<bigint>} g 
   * @returns {boolean}
   */
  static coprime(f,g) {
    // TODO: run xgcd in Q[x] to find u,v such that u*f + v*g = 1.
    //       return false if no such u,v exist or if u,v not in Z[x].
  }

  static derivative(f) {
    if (f.length === 1) {
      return [0n];
    }
    const df = new Array(PolynomialMath.deg(f));
    for (let i = 0; i < df.length; i++) {
      df[i] = BigInt(i + 1) * f[i + 1];
    }
    return df;
  }

  static resultant(f, g) {
    const n = PolynomialMath.deg(f);
    const m = PolynomialMath.deg(g);
    const A = MatrixMath.zero(n + m);
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= m; j++) {
        if (j < m) {
          A[j][i + j] = f[n - i];
        }
        if (i < n) {
          A[m + i][i + j] = g[m - j];
        }
      }
    }
    return MatrixMath.det(A);
  }

  static discriminant(f) {
    const n = PolynomialMath.deg(f);
    const an = f[n];
    const df = PolynomialMath.derivative(f);
    const R = PolynomialMath.resultant(f, df);
    const s = BigInt((-1) ** ((n * (n - 1)) / 2));
    return (s * R) / an;
  }
  
  static toString(f) {
    return f
      .map(
        (a, i) => `${i > 0 && a === 1n ? "" : `${a}`}${i === 0 ? "" : `x^${i}`}`
      )
      .filter(s => !s.startsWith("0"))
      .join(" + ");
  }
}
window.PolynomialMath = PolynomialMath;
