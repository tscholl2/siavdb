let SIAV_DB = undefined;
export async function SIAVs(q) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (SIAV_DB === undefined) {
    const response = await fetch("data/siav-dev.json");
    SIAV_DB = await response.json();
    window.siav = SIAV_DB;
  }
  const result = [];
  for (let A of SIAV_DB) {
    if (BigInt(A["q"]) ===  BigInt(q)) {
      result.push(A);
    }
  }
  // Call for more if q > 5000
  return result;
}