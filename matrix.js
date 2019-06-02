export class MatrixMath {
  static zero(n) {
    const A = new Array(n);
    for (let i = 0; i < n; i++) {
      A[i] = new Array(n);
      for (let j = 0; j < n; j++) {
        A[i][j] = 0n;
      }
    }
    return A;
  }

  static one(n) {
    const A = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      A[i][i] = 1n;
    }
    return A;
  }

  static add(A, B) {
    const n = A.length;
    const C = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        C[i][j] = A[i][j] + B[i][j];
      }
    }
    return C;
  }

  static scale(A, k) {
    const n = A.length;
    const B = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        B[i][j] = k * A[i][j];
      }
    }
    return B;
  }

  static sub(A, B) {
    return MatrixMath.add(A, MatrixMath.scale(B, -1n));
  }

  static mul(A, B) {
    const n = A.length;
    const C = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          C[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return C;
  }

  static det(A) {
    const n = A.length;
    if (n === 1) {
      return A[0][0];
    }
    let D = 0n;
    for (let i = 0; i < n; i++) {
      const c = MatrixMath.det(MatrixMath.minor(A, i, 0));
      const s = BigInt((-1) ** i);
      D += A[i][0] * c * s;
    }
    return D;
  }

  static minor(A, i, j) {
    const n = A.length;
    const Am = MatrixMath.zero(n - 1);
    for (let r = 0; r < n - 1; r++) {
      for (let c = 0; c < n - 1; c++) {
        Am[r][c] = A[r >= i ? r + 1 : r][c >= j ? c + 1 : c];
      }
    }
    return Am;
  }

  static cofactor(A) {
    const n = A.length;
    const C = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const d = MatrixMath.det(MatrixMath.minor(A, i, j));
        const s = BigInt((-1) ** (i + j));
        C[i][j] = d * s;
      }
    }
    return C;
  }

  static inverse(A) {
    const n = A.length;
    const d = MatrixMath.det(A);
    if (d !== 1n && d !== -1n) {
      throw new Error(
        `expected matrix in GL_n(Z), got ${MatrixMath.toString(
          A
        )} (with det ${d})`
      );
    }
    let B = MatrixMath.cofactor(A);
    B = MatrixMath.scale(B, d);
    B = MatrixMath.transpose(B);
    return B;
  }

  static transpose(A) {
    const n = A.length;
    const At = MatrixMath.zero(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        At[i][j] = A[j][i];
      }
    }
    return At;
  }

  static toString(A) {
    return `[${A.map(row => `[${row.map(a => `${a}`).join(",")}]`).join(",")}]`;
  }
}

window.MatrixMath = MatrixMath;
