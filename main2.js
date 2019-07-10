import { patch, h } from "./imports.js";
import { Controller } from "./imports.js";

document.addEventListener("DOMContentLoaded", start);

function start() {
  const c = new Controller({ isLoading: true, search: {} });
  const app = App(c.dispatch);
  c.addListener(s => patch(document.getElementById("app"), app(s)));
  window.c = c;
  console.log("starting up");
}

// VIEWS

function App(dispatch) {
  const w = new Worker("worker.js");
  w.onmessage = e =>
    dispatchEvent(new CustomEvent(e.data[0], { detail: e.data }));
  function callWorker(name, args) {
    return new Promise(resolve => {
      const id = `${Math.random()}`;
      const l = e => {
        removeEventListener(id, l);
        resolve(e.detail[1]);
      };
      addEventListener(id, l);
      w.postMessage([id, name, args]);
    });
  }
  const loadMore = async values => {
    dispatch(s => ({ ...s, isLoading: true }));
    const arr = await callWorker("addCurves");
    const { data, total } = await callWorker("query", values);
    dispatch(s => ({ ...s, data, total, isLoading: false }));
  };
  const query = async values => {
    dispatch(s => ({ ...s, isLoading: true }));
    // TODO: need ref for search
    const { data, total } = await callWorker("query", values);
    dispatch(s => ({ ...s, data, total, isLoading: false }));
  };
  const submitSearch = values => {
    dispatch(s => ({ ...s, search: values }));
    query(values);
  };
  query({ g: 1 });
  return state => {
    const { data = [], isLoading, detail, search } = state;
    return h("div", null, [
      h("h1", null, "Super-Isolated Abelian Varieties"),
      h(Search, { onsubmit: submitSearch, values: search }),
      isLoading
        ? Loading()
        : h(
            "ul",
            null,
            data.length === 0
              ? EmptyList()
              : data.map(siav =>
                  h(
                    "li",
                    {
                      key: siav["id"],
                      style: "cursor:pointer",
                      onclick: () =>
                        dispatch(s => ({
                          ...s,
                          detail: detail === siav["id"] ? "" : siav["id"]
                        }))
                    },
                    (detail === siav["id"] ? MoreDetail : LessDetail)(siav)
                  )
                )
          ),
      !search["q"] && search["g"] === "1"
        ? h("button", { onclick: () => loadMore(search) }, "More")
        : null
    ]);
  };
}

function Search({ values, onsubmit }) {
  return h("fieldset", null, [
    h("legend", null, "Filter"),
    h(
      "form",
      {
        onsubmit: e => {
          e.preventDefault();
          const values = {};
          for (let el of e.target.elements) {
            if (el.name && el.value) {
              values[el.name] = el.value;
            }
          }
          onsubmit(values);
        }
      },
      [
        h("label", null, [
          h("math-tex", null, "q = "),
          h("input", {
            name: "q",
            type: "text",
            placeholder: "107",
            pattern: "\\d+",
            value: values["q"]
          })
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "g = "),
          h("input", {
            name: "g",
            type: "number",
            min: "1",
            placeholder: "2",
            value: values["g"]
          })
        ]),
        h("br"),
        h("label", null, [
          "Principally Polarized ",
          h("select", { name: "PP", value: values["PP"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          "Ordinary ",
          h("select", { name: "OR", value: values["OR"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "\\# A(\\mathbb{F}_q) = "),
          h("input", {
            name: "N",
            type: "text",
            placeholder: "15",
            pattern: "\\d+",
            value: values["N"]
          })
        ]),
        h("br"),
        h("button", { type: "submit" }, "Apply")
      ]
    )
  ]);
}

function EmptyList() {
  return h("div", null, "None found, but they could still exist!");
}

function Loading() {
  return h("progress");
}

function LessDetail(siav) {
  let s;
  if (siav["q"].length >= 20) {
    s = `g = ${siav["g"]}, q \\approx 2^{${(
      siav["q"].length / Math.log10(2)
    ).toFixed(2)}}`;
  } else {
    s = `${siav["f"].replace(/\*/g, "")}`;
  }
  return h("math-tex", null, s);
}

/**
 * {
 *   id: "3580360688fe80da35f5089083d386ae28b15d9cdf099f4cbd52f5492a182e73",
 *   f: "x^2 - 2*x + 2",
 *   p: "2",
 *   a: "1",
 *   q: "2",
 *   g: "1",
 *   AP: "0",
 *   F: [["0", "1"], ["-2", "2"]],
 *   PP: true,
 *   N: "1",
 *   croots: [
 *     "1.00000000000000 - 1.00000000000000*I",
 *     "1.00000000000000 + 1.00000000000000*I"
 *   ],
 *   V: [["2", "-1"], ["2", "0"]],
 *   NP: ["1/2", "1/2"],
 *   OR: false,
 *   Kf: "x^2 + 1",
 *   "K+f": "y - 1",
 *   Kdeg: "2",
 *   "K+deg": "1",
 *   "K+disc": "1",
 *   Kdisc: "-4"
 * }
 */
function MoreDetail(siav) {
  return h(
    "table",
    { style: "border: 2px solid purple; background-color: rgba(0,0,255,0.1);" },
    [
      h("tr", null, h("th", null, "Weil Polynomial")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            `f(x) = ${siav["f"]
              .replace(/\*/g, "")
              .replace(/\^(\d+)/g, "^{$1}")}`
          )
        )
      ),
      h("tr", null, h("th", null, "Base Field")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            siav["a"] === "1"
              ? `q = p = ${siav["q"]}`
              : `q = ${siav["q"]} = ${siav["p"]}^{${siav["a"]}}`
          )
        )
      ),
      h("tr", null, h("th", null, "Approximate Complex Roots")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "ul",
            null,
            siav["croots"].map(a =>
              h(
                "li",
                { style: "list-style:none;" },
                h(
                  "math-tex",
                  null,
                  `${a
                    .replace(/(\d+\.\d{5})(\d+)/g, "$1...")
                    .replace(/\*I/g, "i")}`
                )
              )
            )
          )
        )
      ),
      h("tr", null, h("th", null, "Dimension")),
      h(
        "tr",
        null,
        h("td", null, h("math-tex", null, `\\dim A = ${siav["g"]}`))
      ),
      h("tr", null, h("th", null, "Number of Points")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h("math-tex", null, `\\# A(\\mathbb{F}_q) = ${siav["N"]}`)
        )
      ),
      h("tr", null, h("th", null, "Newton Polygon")),
      h(
        "tr",
        null,
        h("td", null, ["Slopes:", h("math-tex", null, `${siav["NP"]}`)])
      ),
      h("tr", null, h("th", null, "Ordinary")),
      h("tr", null, h("td", null, `${siav["OR"] ? "Yes" : "No"}`)),
      h("tr", null, h("th", null, "Principally Polarized")),
      h("tr", null, h("td", null, `${siav["PP"] ? "Yes" : "No"}`)),
      h("tr", null, h("th", null, "p-Rank")),
      h(
        "tr",
        null,
        h("td", null, h("math-tex", null, `\\dim A[p] = ${siav["AP"]}`))
      ),
      h("tr", null, h("th", null, "Deligne Module")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            `F = \\begin{bmatrix} ${siav["F"]
              .map(r => `${r.map(c => `${c}`).join(" & ")}`)
              .join(" \\\\ ")} \\end{bmatrix}`
          )
        )
      ),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            `V = \\begin{bmatrix} ${siav["V"]
              .map(r => `${r.map(c => `${c}`).join(" & ")}`)
              .join(" \\\\ ")} \\end{bmatrix}`
          )
        )
      ),
      h("tr", null, h("th", null, "CM Field")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            `K = \\frac{\\mathbb{Q}[x]}{\\langle ${siav["Kf"].replace(
              /\*/g,
              ""
            )} \\rangle}`
          )
        )
      ),
      h("tr", null, h("th", null, "Discriminant")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h("math-tex", null, `\\mathrm{Disc}(K) = ${siav["Kdisc"]}`)
        )
      ),
      h("tr", null, h("th", null, "Real Subfield")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h(
            "math-tex",
            null,
            `K^+ = \\frac{\\mathbb{Q}[y]}{\\langle ${siav["K+f"].replace(
              /\*/g,
              ""
            )} \\rangle}`
          )
        )
      ),
      h("tr", null, h("th", null, "Discriminant")),
      h(
        "tr",
        null,
        h(
          "td",
          null,
          h("math-tex", null, `\\mathrm{Disc}(K^+) = ${siav["K+disc"]}`)
        )
      )
    ]
  );
}
