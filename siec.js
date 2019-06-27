eval(
  `"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var BigIntMath=(function(){function BigIntMath(){}BigIntMath.isPerfectPower=function(n){var max=BigInt(BigIntMath.bitLength(n));for(var b=max;b>=1n;b--){var L=2n;var R=n;while(L<=R){var a=(L+R)>>1n;var c=Math.pow(a,b);if(c===n){return[a,b]}if(c<n){L=a+1n}else{R=a-1n}}}throw Error("this should never happen: n="+n)};BigIntMath.bitLength=function(n){if(n<0n){throw Error("expected non-negative integer")}var i=0;while(n>0n){i++;n>>=1n}return i};BigIntMath.max=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}if(values.length===0){throw Error("max of empty set")}var max=values[0];for(var i=1;i<values.length;i++){if(values[i]>max){max=values[i]}}return max};BigIntMath.min=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}return-BigIntMath.max.apply(BigIntMath,values.map(function(a){return-a}))};BigIntMath.abs=function(n){if(n<0n){return-n}return n};BigIntMath.sign=function(n){if(n>0n){return 1n}if(n<0n){return-1n}return 0n};BigIntMath.gcd=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}values=values.map(function(a){return BigIntMath.abs(a)});var x=values[0];for(var i=1;i<values.length;i++){var y=values[i];while(x&&y){x>y?(x%=y):(y%=x)}x+=y}return x};BigIntMath.xgcd=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}var signs=values.map(function(a){return BigIntMath.sign(a)});values=values.map(function(a){return BigIntMath.abs(a)});var d=values[0];var ci=[signs[0]];for(var i=1;i<values.length;i++){var a=values[i];var _a=triple(d,a),d1=_a[0],s1=_a[1],t1=_a[2];d=d1;for(var j=0;j<ci.length;j++){ci[j]*=s1}ci.push(t1*signs[i])}return[d,ci];function triple(a,b){if(b===0n){return[a,1n,0n]}else{var _a=triple(b,a%b),d_1=_a[0],s=_a[1],t=_a[2];return[d_1,t,s-(a/b)*t]}}};BigIntMath.prod=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}if(values.length===0){return 1n}var p=values[0];for(var i=1;i<values.length;i++){p*=values[i]}return p};BigIntMath.sum=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}if(values.length===0){return 0n}var p=values[0];for(var i=1;i<values.length;i++){p+=values[i]}return p};BigIntMath.lcm=function(){var values=[];for(var _i=0;_i<arguments.length;_i++){values[_i]=arguments[_i]}var x=values[0];for(var i=1;i<values.length;i++){var y=values[i];x*=y/BigIntMath.gcd(x,y)}return x};BigIntMath.sqrt=function(n){if(n<0n){throw "expected non-negative number: "+n}if(n<2n){return n}function newtonIteration(n,x0){var x1=(n/x0+x0)>>1n;if(x0===x1||x0===x1-1n){return x0}return newtonIteration(n,x1)}return newtonIteration(n,1n)};BigIntMath.pow=function(a,k,n){if(n===void 0){n=0n}if(k<0n){throw new Error("expected non-negative exponent, got "+k)}if(n===0n){return Math.pow(a,k)}if(n===1n||a===0n){return 0n}var result=1n;while(k>0){if(k%2n===1n){result=(result*a)%n}a=(a*a)%n;k>>=1n}return result};BigIntMath.ord=function(a,p){var k=0n;while(a%p===0n){k++;a/=p}return k};BigIntMath.random=function(n){if(n===0n){return 0n}var result=0n;for(var i=BigIntMath.bitLength(n);i--;i>=0){result+=Math.random()>0.5?1n:0n;result<<=1n}return result%n};BigIntMath.isProbablePrime=function(n,iterations){if(iterations===void 0){iterations=20}if(n<=0n){throw Error("expected positive integer: "+n)}if(n===1n){return!1}if(BigIntMath.gcd(n,7420738134810n)>1n){return[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n].includes(n)}var r=0n;var d=n-1n;while(d%2n===0n){d/=2n;r++}witnessLoop:do{var a=BigIntMath.random(n-4n)+2n;var x=BigIntMath.pow(a,d,n);if(x===1n||x===n-1n){continue witnessLoop}for(var j=0n;j<r-1n;j++){x=(x*x)%n;if(x===n-1n){continue witnessLoop}}return!1}while(--iterations>0);return!0};BigIntMath.toString=function(a){return""+a};return BigIntMath}());exports.BigIntMath=BigIntMath`
);

/**
 * Given the trace t and prime power q for a SIEC,
 * this returns a bunch of data about the curve.
 * @param {BigInt} t
 * @param {BigInt} q
 */
function siecData(t, q) {
  const q = f[0];
  const t = f[1];
  const [p, a] = BigIntMath.isPerfectPower(q);
  const d = q - t ** 2n; // this is positive
  return {
    f:
      t > 0n
        ? `x^2 - ${t}x + ${q}`
        : t < 0n
        ? `x^2 + ${-t}x + ${q}`
        : `x^2 + ${q}`,
    p: `${p}`,
    a: `${a}`,
    q: `${q}`,
    croots: t === 0n ? [`sqrt(${q})`, `-sqrt(${q})`] : "???",
    g: "1",
    N: `${1 - t + q}`,
    NP: t % p === 0n ? ["1/2", "1/2"] : ["1", "0"],
    AP: t % p === 0n ? "0" : "1",
    OR: t % p === 0n,
    F: [["0",`${-q}`],["1",`${t}`]], // basis: [1,pi] ---> pi*(1,0) = (0,1), pi*(0,1) = (-q,t)
    V: [[`${t}`,`${q}`],["-1","0"]], // basis: [1,pi] ---> pibar*(1,0) = (t,-1), pibar*(0,1) = (q,0)
    PP: true,
    Kf: d % 4n === 0n ? `x^2 + ${d / 4n}` : `x^2 + x + ${(d - 1n) / 4n}`,
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
export function nextORSIEC(M) {
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
      const [p, a] = BigIntMath.isPerfectPower(q);
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
 */
export function nextSSSIEC(M) {
  // TODO
  return [siecData(0n, 2n)];
}
