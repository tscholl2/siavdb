import { patch, h } from "./imports.js";
import { Controller } from "./imports.js";
import { Big } from "./big.js";
console.log(Big)

document.addEventListener("DOMContentLoaded", start);

const w = new Worker("worker.js");
w.onmessage = e =>
  dispatchEvent(new CustomEvent(e.data[0], { detail: e.data }));
function callWorker(name, ...args) {
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

async function start() {
  const c = new Controller({});
  const app = App(c.dispatch);
  c.addListener(s => patch(document.getElementById("app"), app(s)));
  c.dispatch(s => ({ ...s, intializing: true }));
  await callWorker("start");
  const { results, ...resp } = await callWorker("query", c.getState().search || {});
  c.dispatch(s => ({ ...s, ...resp, data: results }));
  c.dispatch(s => ({ ...s, intializing: false }));
}

// VIEWS

function App(dispatch) {
  const loadMore = async values => {
    dispatch(s => ({ ...s, isLoading: true }));
    await callWorker("addCurves");
    await query(values);
  };
  const query = async values => {
    dispatch(s => ({ ...s, isLoading: true }));
    const { results, ...resp } = await callWorker("query", values);
    dispatch(s => ({ ...s, ...resp, data: results, isLoading: false }));
  };
  const submitSearch = values => {
    dispatch(s => ({ ...s, search: values, detail: null }));
    query(values);
  };
  return (state = {}) => {
    const {
      data = [],
      total,
      isLoading,
      detail,
      search = {},
      intializing
    } = state;
    if (intializing) {
      return h("div", null, ["Loading database...", h("progress")]);
    }
    const offset = parseInt(search.offset || 0, 10);
    const limit = data.length;
    return h("div", null, [
      h("h1", null, "Super-Isolated Abelian Varieties"),
      h(Search, { onsubmit: submitSearch, values: search }),
      isLoading
        ? Loading()
        : total === 0
          ? h("h3", null, "No results found :(")
          : [
            h(
              "h3",
              { key: "total" },
              `Showing ${offset + 1} - ${offset + limit} of ${total}`
            ),
            h(
              "ol",
              { key: "list", start: offset + 1 },
              data.length === 0
                ? Object.keys(search).length === 0 // poor mans "touched"
                  ? "Try searching!"
                  : EmptyList()
                : data.map(siav =>
                  h(
                    "li",
                    { key: siav["id"], style: "margin:20px 0;" },
                    [
                      h(
                        "span",
                        {
                          key: "summary",
                          style: "cursor:pointer;border:1px solid blue;padding:5px;display:inline-block;",
                          onclick: () => dispatch(s => ({ ...s, detail: detail === siav["id"] ? undefined : siav["id"] })),
                        },
                        h(LessDetail, siav)
                      ),
                      detail === siav["id"] &&
                      h(
                        "div",
                        { key: "details", style: "margin-top: 10px;" },
                        h(MoreDetail, siav)
                      )
                    ]
                  )
                )
            ),
            !search["base_field_cardinality"] && search["dimension"] === "1"
              ? h("button", { onclick: () => loadMore(search) }, "More")
              : null
          ]
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
          for (let el of e.target.elements)
            if (el.name && el.value)
              values[el.name] = el.value;
          onsubmit(values);
        }
      },
      [
        h("label", null, [
          "ID = ",
          h("input", { name: "id", type: "text", placeholder: "07059e5d5e687614d33ae5b8f227608ab7ab82071346cf2b8ef350632e63420c", pattern: "\\w+", value: values["id"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "f(x) = "),
          h("input", { name: "weil_polynomial", type: "text", placeholder: "25", pattern: "\\d+", value: values["weil_polynomial"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "g(x) = "),
          h("input", { name: "real_weil_polynomial", type: "text", placeholder: "25", pattern: "\\d+", value: values["real_weil_polynomial"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "q = "),
          h("input", { name: "base_field_cardinality", type: "text", placeholder: "25", pattern: "\\d+", value: values["base_field_cardinality"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "p = "),
          h("input", { name: "base_field_characteristic", type: "text", placeholder: "5", pattern: "\\d+", value: values["base_field_characteristic"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "a = "),
          h("input", { name: "base_field_exponent", type: "text", placeholder: "2", pattern: "\\d+", value: values["base_field_exponent"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "g = "),
          h("input", { name: "dimension", type: "number", min: "1", placeholder: "2", value: values["dimension"] }),
        ]),
        h("br"),
        h("label", null, [
          "Principally Polarized ",
          h("select", { name: "is_principally_polarized", value: values["is_principally_polarized"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          "Ordinary ",
          h("select", { name: "is_ordinary", value: values["is_ordinary"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          "Simple ",
          h("select", { name: "is_simple", value: values["is_simple"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "\\# A(\\mathbb{F}_q) = "), " ",
          h("input", { name: "number_of_points", type: "text", placeholder: "15", pattern: "\\d+", value: values["n"] }),
        ]),
        h("br"),
        h("label", null, [
          "Custom ",
          h("textarea", { name: "custom", value: values["custom"], placeholder: "(A) => BigInt(A.q) === 27n", }),
        ]),
        h("br"),
        h("label", null, [
          "Offset ",
          h("input", { name: "offset", type: "number", min: "0", placeholder: "0", value: values["offset"] }),
        ]),
        h("br"),
        h("label", null, [
          "Limit ",
          h("input", { name: "limit", type: "number", min: "0", placeholder: "10", value: values["limit"] }),
        ]),
        h("br"),
        h("button", { type: "submit" }, "Search"),
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
  if (siav["base_field_cardinality"].length >= 20) {
    s = `g = ${siav["dimension"]}, q \\approx 2^{${(siav["base_field_cardinality"].length / Math.log10(2)).toFixed(2)}}`;
  } else {
    s = `${prettyPolynomial(siav["weil_polynomial"])}`;
  }
  return h("math-tex", null, s);
}

function MoreDetail(siav) {
  return h(
    "table",
    { style: "border: 2px solid #006f25;border-collapse:collapse;background-color:rgba(0, 159, 17, 0.1);" },
    [
      h("tr", null, h("th", { colspan: "2" }, "ID")),
      h("tr", null, h("td", { colspan: "2" }, [
        h("pre", { style: "display:inline-block;" }, siav["id"].substr(0, 10) + "..."),
        h("button", { "data-copy": siav["id"], style: "margin-left:10px", onclick: copyButton }, "copy"),
      ])),
      h("tr", null, h("th", { colspan: "2" }, "Weil Polynomial")),
      h("tr", null, h("td", { colspan: "2" }, [
        h("math-tex", null, `f(x) = ${prettyPolynomial(siav["weil_polynomial"])}`),
        h("button", { "data-copy": siav["weil_polynomial"], style: "margin-left:10px", onclick: copyButton }, "copy"),
      ])),
      h("tr", null, h("th", { colspan: "2" }, "Real Weil Polynomial")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `g(x) = ${prettyPolynomial(siav["real_weil_polynomial"])}`))),
      h("tr", null, h("th", { colspan: "2" }, "Dimension")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `\\dim A = ${siav["dimension"]}`))),
      h("tr", null, h("th", { colspan: "2" }, "Base Field")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, siav["base_field_exponent"] == "1" ? `q = p = ${siav["base_field_cardinality"]}` : `q = ${siav["base_field_cardinality"]} = ${siav["base_field_characteristic"]}^{${siav["base_field_exponent"]}}`))),
      h("tr", null, h("th", { colspan: "2" }, "Number of points")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `\\#A(\\mathbb{F}_q) = ${siav["number_of_points"]}`))),
      h("tr", null, h("th", { colspan: "2" }, "Simple")),
      h("tr", null, h("td", { colspan: "2" }, siav["is_simple"] ? "Yes" : "No")),
      h("tr", null, h("th", { colspan: "2" }, "Principally Polarized")),
      h("tr", null, h("td", { colspan: "2" }, siav["is_principally_polarized"] ? "Yes" : "No")),
      h("tr", null, h("th", { colspan: "2" }, "Components")),
      ...siav["components"].map((B, i) =>
        h("tr", null, [
          h("td", null, [
            h("tr", null, h("th", null, ["Component ", h("math-tex", null, `B_{${i + 1}}`)])),
            h("tr", null, h("td", null, [
              h("pre", { style: "display:inline-block;" }, B["id"].substr(0, 10) + "..."),
              h("button", { "data-copy": B["id"], style: "margin-left:10px", onclick: copyButton }, "copy"),
            ])),
          ]),
          h("td", { style: "border:2px solid purple;background-color:rgba(255,0,255,0.1);" }, [
            h("tr", null, h("th", null, "Multiplicity")),
            h("tr", null, h("td", null, h("math-tex", null, `e_{${i + 1}} = ${B["exponent"]}`))),
            h("tr", null, h("th", null, "Weil Polynomial")),
            h("tr", null, h("td", null, [
              h("math-tex", null, `f_{${i + 1}}(x) = ${prettyPolynomial(B["weil_polynomial"])}`),
              h("button", { "data-copy": B["weil_polynomial"], style: "margin-left:10px", onclick: copyButton }, "copy"),
            ])),
            h("tr", null, h("th", null, "Real Weil Polynomial")),
            h("tr", null, h("td", null, h("math-tex", null, `g_{${i + 1}}(x) = ${prettyPolynomial(B["real_weil_polynomial"])}`))),
            h("tr", null, h("th", null, "Dimension")),
            h("tr", null, h("td", null, h("math-tex", null, `\\dim B_{${i + 1}} = ${B["dimension"]}`))),
            h("tr", null, h("th", null, "Number of points")),
            h("tr", null, h("td", null, h("math-tex", null, `\\#B_{${i + 1}}(\\mathbb{F}_q) = ${B["number_of_points"]}`))),
            h("tr", null, h("th", null, "Principally Polarized")),
            h("tr", null, h("td", null, B["is_principally_polarized"] ? "Yes" : "No")),
            h("tr", null, h("th", null, "Ordinary")),
            h("tr", null, h("td", null, B["is_ordinary"] ? "Yes" : "No")),
            h("tr", null, h("th", null, "Newton Polygon")),
            h("tr", null, h("td", null, h("math-tex", null, `\\mathrm{Slopes} = [${B["newton_polygon"].join(",")}]`))),
            h("tr", null, h("td", null, NewtonPolygon(B["newton_polygon"]))),
            h("tr", null, h("th", null, "Complex Roots")),
            h("tr", null, h("td", null, h("ul", null, B["complex_roots"].map(z => {
              const [r, i] = parseComplex(z).map(x => x.toPrecision(10));
              return h("li", null, `${r} + ${i}i`);
            })))),
            h("tr", null, h("td", null, ComplexRoots(B["complex_roots"]))),
            h("tr", null, h("th", null, "CM Field")),
            h("tr", null, h("td", null, h("math-tex", null, `K = \\mathbb{Q}[x]/(${prettyPolynomial(B["cm_field"])})`))),
            h("tr", null, h("td", null, h("math-tex", null, `\\Delta_K = ${B["cm_field_discriminant"]}`))),
            h("tr", null, h("th", null, "Real Field")),
            h("tr", null, h("td", null, h("math-tex", null, `K^+ = \\mathbb{Q}[y]/(${prettyPolynomial(B["real_field"]).replace(/x/g, "y")})`))),
            h("tr", null, h("td", null, h("math-tex", null, `\\Delta_{K^+} = ${B["real_field_discriminant"]}`))),
          ]),
        ])
      ),
    ]
  );
}

function NewtonPolygon(slopes) {
  slopes = slopes.map(x => eval(x));
  const n = slopes.length;
  const m = slopes.reduce((p, n) => p + n, 0);
  const grid = [];
  for (let i = 0; i <= 10; i++)
    grid.push(h("path", {
      d: ` M -1 ${i} l ${12} 0 M ${i} -1 l 0 ${12}`,
      fill: "none", stroke: "rgba(128,128,128,0.3)", "stroke-width": i === 0 ? 2 : 0.5, "vector-effect": "non-scaling-stroke"
    }));
  return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `-0.5 -0.5 ${n + 1} ${m + 1}`, style: "transform:scaleY(-1);width:100%;height:100%" }, [
    ...grid,
    h("path", { d: `M 0 ${m} ` + slopes.map(x => `l 1 -${x}`).join(" "), fill: "none", stroke: "blue", "stroke-width": 5, "vector-effect": "non-scaling-stroke", "stroke-linecap": "round", "stroke-linejoin": "round" }),
  ]);
}

function ComplexRoots(croots) {
  const points = croots.map(z => {
    const [x0, y0] = parseComplex(z);
    const r = x0.mul(x0).add(y0.mul(y0)).sqrt();
    const [x, y] = [x0.div(r), y0.div(r)];
    return [x.round(10).toPrecision(10), y.round(10).toPrecision(10)];
  });
  const grid = [];
  for (let i = -1; i <= 1; i++)
    grid.push(h("path", { d: `M -2 ${i} l 4 0 M ${i} -2 l 0 4`, fill: "none", stroke: "rgba(128,128,128,0.3)", "stroke-width": i % 5 === 0 ? 2 : 0.5, "vector-effect": "non-scaling-stroke" }));
  return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `-1.5 -1.5 3 3`, style: "transform:scaleY(-1);width:100%;height:100%" }, [
    ...grid,
    ...points.map(([x, y]) => h("circle", { cx: x, cy: y, r: 0.1, fill: "blue" }))
  ]);

}

function copyButton(e) {
  const button = e.target;
  navigator.clipboard.writeText(button.getAttribute("data-copy"));
  button.disabled = true;
  button.innerText = "✓";
  setTimeout(() => { button.disabled = false; button.innerText = "copy" }, 5000);
}

function prettyPolynomial(p) {
  return p.replace(/\*/g, "").replace(/\^(\d+)/g, "^{$1}")
}

function parseComplex(z) {
  const arr = z.split(" ");
  let [real, imag] = ["0", "0"];
  switch (arr.length) {
    case 1:
      if (arr[0].includes("*I")) imag = arr[0];
      else real = arr[0];
      break;
    case 3:
      real = arr[0];
      imag = (arr[1] == "-" ? "-" : "") + arr[2].substr(0, arr[2].length - 2);
      break;
    default:
      console.error("arr = ");
      console.error(arr);
      throw new Error(`unable to parse complex number: ${z}`);
  }
  return [new Big(real), new Big(imag)];
}
