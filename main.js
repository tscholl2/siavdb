document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("search-parameters");
  form.onsubmit = e => {
    e.preventDefault();
    updateOutput();
  };
  updateOutput();
});

let IS_LOADING = false;
async function updateOutput() {
  console.log("updating output...");
  if (IS_LOADING) {
    console.log("currently loading");
    return;
  }
  IS_LOADING = true;
  const div = document.getElementById("output");
  div.innerHTML = "<progress/>";
  // TODO: disable form
  //const form = document.getElementById("search-parameters");
  const { q } = readSearchParametersFromForm();
  console.log("got q = ", q);
  const result = await SIAVs(q);
  const ul = document.createElement("ul");
  for (let A of result) {
    const li = document.createElement("li");
    /*{
      "f": "x^4 - 29*x^3 + 331*x^2 - 1769*x + 3721",
      "p": 61,
      "a": 1,
      "q": 61,
      "croots": ["7.8090169943749474241022934171828190589 - 0.13875727571288775672676080284154598102*I", "7.8090169943749474241022934171828190589 + 0.13875727571288775672676080284154598102*I", "6.6909830056250525758977065828171809411 - 4.0287400534704069746867299094162919674*I", "6.6909830056250525758977065828171809411 + 4.0287400534704069746867299094162919674*I"],
      "proots": ["20*61 + 59*61^2 + 36*61^3 + 51*61^4 + 26*61^5 + 51*61^6 + 3*61^7 + 20*61^8 + 59*61^9 + O(61^10)", "21*61 + 4*61^2 + 48*61^3 + 22*61^4 + 54*61^5 + 60*61^6 + 55*61^7 + 14*61^8 + 41*61^9 + O(61^10)", "32 + 5*61 + 39*61^2 + 30*61^3 + 37*61^4 + 8*61^5 + 55*61^6 + 49*61^7 + 54*61^8 + 13*61^9 + O(61^10)", "58 + 14*61 + 19*61^2 + 6*61^3 + 10*61^4 + 32*61^5 + 15*61^6 + 12*61^7 + 32*61^8 + 7*61^9 + O(61^10)"],
      "g": 2,
      "N": 2255,
      "NP": [1, 1, 0, 0],
      "AP": 2,
      "OR": 0,
      "F": [[6, 2, -1, 0], [-2, 8, -3, 3], [0, 1, 9, -2], [3, -2, 3, 6]],
      "V": [[9, -2, 0, 1], [3, 6, 3, -2], [-1, 0, 6, 2], [-3, 3, -2, 8]],
      "PP": 1,
      "Kf": "x^4 - x^3 + x^2 - x + 1",
      "Kh": "y^2 - y - 1",
      "Kdisc": 125,
      "Kdeg": 4,
    }*/
    console.log("constructing html")
    li.innerHTML = `

<table class="siav-data">
<tr>
    <th>Weil Polynomial</th>
    <th>Base Field</th>
    <th>Newton Polygon</th>
  </tr>
  <tr>
    <td>f(x) = ${A["f"]}</td>
    <td>q = ${A["q"]} = ${A["p"]}<sup>${A["a"]}</sup></td>
    <td>slopes = ${A["NP"]}</td>
  </tr>
  <tr>
    <th>Approximate Complex Roots</th>
    <th>Approximate p-Adic Roots</th>
  </tr>
  <tr>
    <td>${A["croots"]}</td>
    <td>${A["proots"]}</td>
  </tr>
  <tr>
    <th>Dimension</th>
    <th>Number of Points</th>
    <th>p-Rank</th>
  </tr>
  <tr>
    <td>dim A = ${A["g"]}</td>
    <td>#A(F<sub>q</sub>) = ${A["N"]}</td>
    <td>dim A[p] = ${A["AP"]}</td>
    <td>A is ${A["OR"] ? "" : "not"} ordinary</td>
  </tr>
  <tr>
    <th>Deligne Module</th>
  </tr>
  <tr>
    <td>F = ${A["F"]}</td>
    <td>V = ${A["V"]}</td>
  </tr>
  <tr>
    <th>CM Field</th>
    <th>Degree</th>
    <th>Discriminant</th>
    <th>Real Subfield</th>
  </tr>
  <tr>
    <td>K = ℚ[x]/⟨${A["Kf"]}⟩</td>
    <td>deg K = ${A["Kdeg"]}</td>
    <td>disc<sub>K</sub> = ${A["Kdisc"]}</td>
    <td>K<sup>+</sup> = ℚ[y]/⟨${A["Kh"]}⟩</td>
  </tr>
</table>

`;
console.log("got li")
    ul.append(li);
  }
  div.innerHTML = "";
  div.append(ul);
  IS_LOADING = false;
}

function readSearchParametersFromForm() {
  return {
    q: document.getElementById("q-val").value || "0"
  };
}

let SIAV_DB = undefined;
async function SIAVs(q) {
  console.log("searching...", q);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (SIAV_DB === undefined) {
    console.log("fetching...");
    const response = await fetch("data/siav-dev.json");
    SIAV_DB = await response.json();
    window.siav = SIAV_DB;
  }
  console.log("fetched");
  const result = [];
  console.log(SIAV_DB);
  for (let A of SIAV_DB) {
    if (A["q"] === q) {
      result.push(A);
    }
  }
  console.log("returning");
  // Call for more if q > 5000
  return result;
}

function polynomialToString(f) {
  return f
    .map(
      (a, i) =>
        `${i > 0 && a === 1n ? "" : `${a}`}${
          i === 0 ? "" : i === 1 ? "x" : `x^${i}`
        }`
    )
    .filter(s => !s.startsWith("0"))
    .join(" + ");
}
