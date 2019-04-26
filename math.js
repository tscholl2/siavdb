// https://golb.hplar.ch/2018/09/javascript-bigint.html
// + a few more methods
class BigIntMath {
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
    while (n >= 1n) {
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
}
