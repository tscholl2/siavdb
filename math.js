// https://golb.hplar.ch/2018/09/javascript-bigint.html
// + a few more methods
export class BigIntMath {
  /**
   * Given n, returns a,b such that n = a^b
   * if such a,b exist. Otherwise returns undefined.
   * @param {biging} n
   * @returns {bigint[] | undefined} 
   */
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
    return undefined;
  }

  static bitLength(n) {
    let i = 0;
    while (n > 0n) {
      i++;
      n >>= 1n;
    }
    return i;
  }

  /**
   * Returns the maximum integer.
   * @param  {...bigint}
   * @returns {bigint} 
   */
  static max(...values) {
    if (values.length === 0) {
      return null;
    }
    let max = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] > max) {
        max = values[i];
      }
    }
    return max;
  }

  /**
   * Returns the minimum integer.
   * @param  {...bigint} values 
   * @returns {bigint}
   */
  static min(...values) {
    return -BigIntMath.max(values.map(a => -a));
  }

  /**
   * Returns absolute value of n
   * @param {bigint} n
   * @returns {bigint} 
   */
  static abs(n) {
    if (n < 0n) {
      return -n
    }
    return n;
  }

  /**
   * Returns the gcd of the given numbers.
   * @param  {...bigint} values
   * @returns {bigint} 
   * http://rosettacode.org/wiki/Greatest_common_divisor#JavaScript
   */
  static gcd(...values) {
    values = values.map(a => BigIntMath.abs(a));
    let x = values[0];
    for (let i = 1; i < values.length; i++) {
      let y = values[i];
      while (x && y) {
        (x > y) ? x %= y : y %= x;
      }
      x += y;
    }
    return x;
  }

  /**
   * Given integers a1,...,an, this returns the
   * gcd d of ai, as well as a set of integers ci
   * such that sum ci*ai = d. 
   * @param  {...bigint} values
   * @returns {[bigint,bigint[]]} 
   */
  static xgcd(...values) {
    const signs = values.map(a => BigIntMath.sign(a))
    values = values.map(a => BigIntMath.abs(a));
    let d = values[0];
    const ci = [signs[0]];
    for (let i = 1; i < values.length; i++) {
      const a = values[i];
      const [d1, s1, t1] = triple(d, a);
      d = d1
      for (let j = 0; j < ci.length; j++) {
        ci[j] *= s1;
      }
      ci.push(t1 * signs[i]);
    }
    return [d, ci];
    function triple(a, b) {
      if (b === 0n) {
        return [a, 1n, 0n]
      } else {
        const [d, s, t] = triple(b, a % b)
        return [d, t, s - (a / b) * t]
      }
    }
  }

  /**
   * Returns the product of the values.
   * @param  {...bigint} values
   * @returns {bigint} 
   */
  static prod(...values) {
    if (values.length === 0) {
      return 1n;
    }
    let p = values[0];
    for (let i = 1; i < values.length; i++) {
      p *= values[i];
    }
    return p;
  }

  /**
   * Returns the sum of the values.
   * @param  {...bigint} values
   * @returns {bigint} 
   */
  static sum(...values) {
    if (values.length === 0) {
      return 0n;
    }
    let p = values[0];
    for (let i = 1; i < values.length; i++) {
      p += values[i];
    }
    return p;
  }

  /**
   * Retruns the lcm of the values.
   * @param  {...bigint} values
   * @returns {bigint} 
   */
  static lcm(...values) {
    let x = values[0];
    for (let i = 1; i < values.length; i++) {
      let y = values[i];
      x *= y / BigIntMath.gcd(x, y)
    }
    return x;
  }

  static sign(n) {
    if (n > 0n) {
      return 1n;
    }
    if (n < 0n) {
      return -1n;
    }
    return 0n;
  }

  static abs(n) {
    if (this.sign(n) === -1n) {
      return -n;
    }
    return n;
  }

  /**
   * Given integer n, returns floor(sqrt(n)).
   * @param {bigint} n
   * @returns {bigint} 
   */
  static sqrt(n) {
    if (n < 0n) {
      throw "square root of negative numbers is not supported";
    }
    if (n < 2n) {
      return n;
    }
    function newtonIteration(n, x0) {
      const x1 = (n / x0 + x0) >> 1n;
      if (x0 === x1 || x0 === x1 - 1n) {
        return x0;
      }
      return newtonIteration(n, x1);
    }
    return newtonIteration(n, 1n);
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
    for (let i = BigInt.bitLength(n); i--; i >= 0) {
      result += Math.random() > 0.5 ? 1n : 0n;
      result <<= 1n;
      n >>= 1n;
    }
    return result % n;
  }

  /**
   * Returns true if n passes the Miller-Rabin primality test.
   * @param {bigint} n 
   * @param {number} iterations
   * @returns {boolean} 
   */
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
