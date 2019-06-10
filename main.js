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
      "f":"x^4 - 29*x^3 + 331*x^2 - 1769*x + 3721",
      "zz":"zz",
      "D":"125",
      "p":"61",
      "a":"1",
      "q":"61",
      "N":"2255",
      "h":"y^2 - 29*y + 209",
      "NP":"[1, 1, 0, 0]",
      "Ap":"2",
      "OR":"0",
      "F":"[[6, 2, -1, 0], [-2, 8, -3, 3], [0, 1, 9, -2], [3, -2, 3, 6]]",
      "V":"[[9, -2, 0, 1], [3, 6, 3, -2], [-1, 0, 6, 2], [-3, 3, -2, 8]]",
      "PP":"1"
    }*/
    li.innerHTML = `

<table class="siav-data">
  <tr>
    <th>Weil Polynomial</th>
  </tr>
  <tr>
    <td>f(x) = ${polynomialToString(A["f"])}</td>
  </tr>
  <tr>
    <th>Deligne Module</th>
  </tr>
  <tr>
    <td>F = ${A["F"]}</td>
    <td>V = ${A["V"]}</td>
  </tr>
  <tr>
    <th>Approximate Roots</th>
  </tr>
  <tr>
    <td> TODO </td>
  </tr>
  <tr>
    <th>Dimension</th>
    <th>Number of Points</th>
    <th>p-Rank</th>
    <th>Newton Polygon</th>
  </tr>
  <tr>
    <td>dim A = ${A["g"]}</td>
    <td>#A(F<sub>q</sub>) = ${A["N"]}</td>
    <td>dim A[p] = ${A["Ap"]}</td>
    <td> TODO </td>
  </tr>
  <tr>
    <th>Base Field</th>
  </tr>
  <tr>
    <td>q = ${A["q"]} = ${A["p"]}<sup>${A["a"]}</sup></td>

  </tr>
  <tr>
    <th>CM Field</th>
    <th>Degree</th>
    <th>Discriminant</th>
    <th>Galois</th>
  </tr>
  <tr>
    <td>K = ℚ[x]/⟨${A["Kf"]}⟩</td>
    <td>deg K = ${2 * parseInt(A["g"])}</td>
    <td>disc<sub>K</sub> = ${A["D"]}</td>
    <td>${A["Kg"]}</td>
  </tr>
</table>

`;
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
