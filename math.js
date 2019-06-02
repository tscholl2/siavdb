// https://golb.hplar.ch/2018/09/javascript-bigint.html
// + a few more methods
export class BigIntMath {
  static isPerfectPower(n) {
    let max = BigInt(BigIntMath.bitLength(n));
    for (let b = max; b >= 1n; b--) {
      // binary search for a such that a^b = n
      let L = 2n;
      let R = n;
      while (L <= R) {
        const a = (L + R) >> 1n;
        const c = a ** b;
        if (c === n) {
          return [a, b];
        }
        if (c < n) {
          L = a + 1n;
        } else {
          R = a - 1n;
        }
      }
    }
  }

  static bitLength(n) {
    let i = 0;
    while (n > 0n) {
      i++;
      n >>= 1n;
    }
    return i;
  }

  static max(...values) {
    if (values.length === 0) {
      return null;
    }

    if (values.length === 1) {
      return values[0];
    }

    let max = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] > max) {
        max = values[i];
      }
    }
    return max;
  }

  static min(...values) {
    if (values.length === 0) {
      return null;
    }

    if (values.length === 1) {
      return values[0];
    }

    let min = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] < min) {
        min = values[i];
      }
    }
    return min;
  }

  static sign(value) {
    if (value > 0n) {
      return 1n;
    }
    if (value < 0n) {
      return -1n;
    }
    return 0n;
  }

  static abs(value) {
    if (this.sign(value) === -1n) {
      return -value;
    }
  }

  static sqrt(value) {
    if (value < 0n) {
      throw "square root of negative numbers is not supported";
    }

    if (value < 2n) {
      return value;
    }

    function newtonIteration(n, x0) {
      const x1 = (n / x0 + x0) >> 1n;
      if (x0 === x1 || x0 === x1 - 1n) {
        return x0;
      }
      return newtonIteration(n, x1);
    }

    return newtonIteration(value, 1n);
  }

  /**
   * Returns a^k mod n
   * @param {bigint} a base
   * @param {bigint} k exponent
   * @param {bigint} n modulus
   * @returns {bigint} a^k % n
   */
  static pow(a, k, n = 0n) {
    if (k < 0n) {
      throw new Error(`expected non-negative exponent, got ${k}`);
    }

    if (n === 0n) {
      return a ** k;
    }

    if (n === 1n || a === 0n) {
      return 0n;
    }

    let result = 1n;
    while (k > 0) {
      if (k % 2n === 1n) {
        result = (result * a) % n;
      }
      a = (a * a) % n;
      k >>= 1n;
    }
    return result;
  }

  /**
   * Returns k such that p^k || a
   * @param {bigint} a 
   * @param {bigint} p 
   * @returns {bigint}
   */
  static ord(a, p) {
    const k = 0n;
    while (a % p === 0n) {
      k++
      a /= p
    }
    return k;
  }

  /**
   * Returns a random integer in [0,n).
   * @param {bigint} n
   * @returns {bigint}
   */
  static random(n) {
    let result = 0n;
    const n1 = n;
    while (n > 0n) {
      result += Math.random() > 0.5 ? 1n : 0n;
      result <<= 1n;
      n >>= 1n;
    }
    return result % n1;
  }

  static isProbablePrime(n, iterations = 20) {
    // TODO: this is really slow when n is composite
    // Small cases
    if ([2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n].includes(n)) {
      return true;
    }

    if (n < 40n) {
      return false;
    }

    // Write n-1 = 2^r * d
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      d /= 2n;
      r++;
    }

    // https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Miller%E2%80%93Rabin_test
    witnessLoop: do {
      const a = BigIntMath.random(n - 4n) + 2n;
      let x = BigIntMath.pow(a, d, n);
      if (x === 1n || x === n - 1n) {
        continue witnessLoop;
      }
      for (let j = 0n; j < r - 1n; j++) {
        x = (x * x) % n;
        if (x === n - 1n) {
          continue witnessLoop;
        }
      }
      return false;
    } while (--iterations > 0);
    return true;
  }

  static toString(a) {
    return `${a}`;
  }
}

window.BigIntMath = BigIntMath;
