import { nextSIEC } from "./siec.js";
import { BigIntMath } from "./math.js";
import { patch, h } from "./imports.js";
import { Controller } from "./imports.js";

window.nextSIEC = nextSIEC;

document.addEventListener("DOMContentLoaded", start);

function start() {
  const c = new Controller({ search: { g: "1" } });
  const app = App(c.dispatch);
  c.addListener((s, d) => patch(document.getElementById("app"), app(s)));
  /*
  c.addListener(() =>
  renderMathInElement(document.body, {});
  );
  */
  window.c = c;
  c.dispatch(s => ({ ...s, isLoading: true }));
  // fetch initial data
  (async function load() {
    const response = await fetch("data/siav-list.json");
    const data = await response.json();
    data.sort(siavComparator);
    c.dispatch(s => ({ ...s, data, isLoading: false }));
  })();
}

// VIEWS

function App(dispatch) {
  const search = Search(dispatch);
  const loadMore = state => {
    dispatch(s => ({ ...s, isLoading: true }));
    let data = state.data;
    let q = BigIntMath.max(
      ...data.filter(A => A["g"] === "1").map(E => BigInt(E["q"]))
    );
    // TODO: this should go in webworker
    for (let i = 0; i < 10; i++) {
      const e = nextSIEC(q + 1n);
      data = data.concat(e);
      q = BigIntMath.max(
        ...data.filter(A => A["g"] === "1").map(E => BigInt(E["q"]))
      );
      data.sort(siavComparator);
    }
    dispatch(s => ({ ...s, data, isLoading: false }));
  };
  return state => {
    const {
      data = [],
      isLoading,
      detail,
      search: { g, q }
    } = state;
    const filteredData = data.filter(
      siav => (!g || siav["g"] === g) && (!q || siav["q"] === q)
    );
    return h("div", null, [
      h("h1", null, "Super-Isolated Abelian Varieties"),
      search(state),
      isLoading
        ? Loading()
        : h(
            "ul",
            null,
            filteredData.length === 0
              ? EmptyList()
              : filteredData.map(siav =>
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
      !q && g === "1"
        ? h("button", { onclick: () => loadMore(state) }, "More")
        : null
    ]);
  };
}

function Search(dispatch) {
  return ({ search: { g = "", q = "" } }) => {
    return h("fieldset", null, [
      h("legend", null, "Filter"),
      h(
        "form",
        {
          onsubmit: e => {
            e.preventDefault();
            const g = e.target.elements["g"].value;
            const q = e.target.elements["q"].value;
            dispatch(s => ({ ...s, search: { ...s.search, g, q } }));
          }
        },
        [
          h("label", null, [
            `\\(q = \\)`,
            h("input", {
              name: "q",
              type: "text",
              placeholder: "107",
              pattern: "\\d+",
              value: q
            })
          ]),
          h("br"),
          h("label", null, [
            `\\(g = \\)`,
            h("input", {
              name: "g",
              type: "number",
              min: "1",
              placeholder: "2",
              value: g
            })
          ]),
          h("br"),
          h("button", { type: "submit" }, "Apply")
        ]
      )
    ]);
  };
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

/*
// https://github.com/lodash/lodash/blob/4.17.4/lodash.js#L10554-L10572
function memoize(func, resolver) {
  if (
    typeof func != "function" ||
    (resolver != null && typeof resolver != "function")
  ) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
      key = resolver ? resolver.apply(this, args) : args[0],
      cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new Map();
  return memoized;
}
*/

function siavComparator(a, b) {
  if (BigInt(a["g"]) < BigInt(b["g"])) {
    return -1;
  }
  if (BigInt(a["g"]) > BigInt(b["g"])) {
    return 1;
  }
  if (BigInt(a["q"]) < BigInt(b["q"])) {
    return -1;
  }
  if (BigInt(a["q"]) > BigInt(b["q"])) {
    return 1;
  }
  if (a["f"] < b["f"]) {
    return -1;
  }
  if (a["f"] > b["f"]) {
    return 1;
  }
  return 0;
}
