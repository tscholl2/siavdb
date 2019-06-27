import { SIAVs } from "./data.js";
import { nextSIEC } from "./siec.js";

window.nextSIEC = nextSIEC; // for testing

const renderMath = () =>
  renderMathInElement(document.body, {
    // ...options...
  });

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
  if (IS_LOADING) {
    return;
  }
  IS_LOADING = true;
  const div = document.getElementById("output");
  div.innerHTML = "<progress/>";
  // TODO: disable form
  //const form = document.getElementById("search-parameters");
  const { q } = readSearchParametersFromForm();
  const result = await SIAVs(q);
  const ul = document.createElement("ul");
  for (let A of result) {
    const li = document.createElement("li");
    li.classList.add("siav-li");
    /*{
      f: "x^2 - 2*x + 2",
      p: "2",
      a: "1",
      q: "2",
      g: "1",
      AP: "0",
      F: [["0", "1"], ["-2", "2"]],
      PP: true,
      N: "1",
      croots: [
        "1.00000000000000 - 1.00000000000000*I",
        "1.00000000000000 + 1.00000000000000*I"
      ],
      V: [["2", "-1"], ["2", "0"]],
      NP: ["1/2", "1/2"],
      OR: false,
      Kf: "x^2 + 1",
      "K+f": "y - 1",
      Kdeg: "2",
      "K+deg": "1",
      "K+disc": "1",
      Kdisc: "-4"
    }*/
    li.innerHTML = `
<table>
  <tr>
    <th>Weil Polynomial</th>
  </tr>
  <tr>
    <td>\\( f(x) = ${A["f"].replace(/\*/g, "")} \\)</td>
  </tr>
  <tr>
    <th>Base Field</th>
  </tr>
  <tr>
    <td>\\( q = ${A["q"]} = ${A["p"]}^{${A["a"]}} \\)</sup></td>
  </tr>
  <tr>
    <th>Approximate Complex Roots</th>
  </tr>
  <tr>
    <td><ul>${A["croots"]
      .map(
        a =>
          `<li style="list-style:none;">\\( ${a
            .replace(/(\d+\.\d{5})(\d+)/g, "$1...")
            .replace(/\*I/g, "i")} \\)</li>`
      )
      .join("")}</ul></td>
  </tr>
  <tr>
    <th>Dimension</th>
  </tr>
  <tr>
    <td>\\( \\dim A = ${A["g"]} \\)</td>
  </tr>
  <tr>
    <th>Number of Points</th>
  </tr>
  <tr>
    <td>\\( \\# A(\\mathbb{F}_q) = ${A["N"]} \\)</td>
  </tr>
  <tr>
    <th>Newton Polygon</th>
  </tr>
  <tr>
    <td>Slopes: \\( ${A["NP"]} \\)</td>
  </tr>
  <tr>
    <th>Ordinary</th>
  </tr>
  <tr>
    <td>${A["OR"] ? "Yes" : "No"}</td>
  </tr>
  <tr>
    <th>p-Rank</th>
  </tr>
  <tr>
   <td>\\( \\dim A[p] = ${A["AP"]} \\)</td>
  </tr>
  <tr>
    <th>Deligne Module</th>
  </tr>
  <tr>
    <td>\\( F = \\begin{bmatrix} ${A["F"]
      .map(r => `${r.map(c => `${c}`).join(" & ")}`)
      .join(" \\\\ ")} \\end{bmatrix} \\)
    </td>
  <tr>
    <td>\\( V = \\begin{bmatrix} ${A["V"]
      .map(r => `${r.map(c => `${c}`).join(" & ")}`)
      .join(" \\\\ ")} \\end{bmatrix} \\)
    </td>
  </tr>
  <tr>
    <th>CM Field</th>
  </tr>
  <tr>
    <td>\\( K = \\frac{\\mathbb{Q}[x]}{\\langle ${A["Kf"].replace(
      /\*/g,
      ""
    )} \\rangle} \\)</td>
  </tr>
  <tr>
    <th>Discriminant</th>
  </tr>
  <tr>
    <td>\\( \\mathrm{Disc}(K) = ${A["Kdisc"]} \\)</td>
  </tr>
  <tr>
    <th>Real Subfield</th>
  </tr>
  <tr>
    <td>\\( K^+ = \\frac{\\mathbb{Q}[y]}{\\langle ${A["K+f"].replace(
      /\*/g,
      ""
    )} \\rangle} \\)</td>
  </tr>
  <tr>
    <th>Discriminant</th>
  </tr>
  <tr>
    <td>\\( \\mathrm{Disc}(K^+) = ${A["K+disc"]} \\)</td>
  </tr>
</table>`;
    ul.append(li);
  }
  div.innerHTML = "";
  div.append(ul);
  IS_LOADING = false;
  renderMath();
}

function readSearchParametersFromForm() {
  return {
    q: document.getElementById("q-val").value || "0"
  };
}
