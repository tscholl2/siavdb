/**
 * Given a BigInt m, this returns some data about a super-isolated elliptic
 * curve over F_q with q > M. The curve has the property that q is minimal.
 * If m >= 10, then this should uniquely define the curve.
 * @param {BigInt} M
 * @returns {Object} 
 */
function nextSIEC(M) {
    if (typeof (M) !== "bigint") {
        throw Error("expected bigint got", typeof (M));
    }
    if (M < 1621n) {
        // GOTO TABLE
        throw Error("unimplemented for small M");
    }
    t = BigIntMath.sqrt(4n * M - 163n);
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
            if (q >= M && bigInt(p).isProbablePrime(20)) {
                return [
                    `x^2 - ${t.toString()}x + ${q.toString()}`,
                    `x^2 + ${t.toString()}x + ${q.toString()}`,
                ];
            }
        }
        t++;
    }
    /*
def next_ord_siec(M):
    R.<x> = ZZ[]
    t = ceil(sqrt(4*M-163))
    while True:
        print t
        for d in [3,4,7,8,11,19,43,67,163]:
            q = (t^2+d)/4
            if q >= M and q in ZZ and ZZ(q).is_pseudoprime_power():
                return [R(x^2 - t*x + q), R(x^2 + t*x + q)]
        t = t + 1
# Samples
1621, x^2 - 81*x + 1657
1773, x^2 - 85*x + 1811
1267650600228229401496703205376, x^2 - 2251799813685253*x + 1267650600228235030996237418507
    */
}


