import { patch, h } from "./imports.js";
import { Controller } from "./imports.js";

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
  const c = new Controller({ search: { offset: 400 } });
  const app = App(c.dispatch);
  c.addListener(s => patch(document.getElementById("app"), app(s)));
  c.dispatch(s => ({ ...s, intializing: true }));
  await callWorker("start");
  const { results, ...resp } = await callWorker("query", c.getState().search);
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
  return state => {
    const {
      data = [],
      total,
      isLoading,
      detail,
      search,
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
                          style:
                            "cursor:pointer;border:1px solid blue;padding: 5px",
                          onclick: () =>
                            dispatch(s => ({
                              ...s,
                              detail:
                                detail === siav["id"] ? undefined : siav["id"]
                            }))
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
            !search["q"] && search["g"] === "1"
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
          h("math-tex", null, "q = "),
          h("input", { name: "q", type: "text", placeholder: "107", pattern: "\\d+", value: values["q"] }),
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "g = "),
          h("input", { name: "g", type: "number", min: "1", placeholder: "2", value: values["g"] }),
        ]),
        h("br"),
        h("label", null, [
          "Principally Polarized ",
          h("select", { name: "is_principally_polarized", value: values["PP"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          "Ordinary ",
          h("select", { name: "is_ordinary", value: values["OR"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          "Simple ",
          h("select", { name: "is_simple", value: values["S"] }, [
            h("option", { value: "" }, ""),
            h("option", { value: "true" }, "Yes"),
            h("option", { value: "false" }, "No")
          ])
        ]),
        h("br"),
        h("label", null, [
          h("math-tex", null, "\\# A(\\mathbb{F}_q) = "), " ",
          h("input", { name: "N", type: "text", placeholder: "15", pattern: "\\d+", value: values["N"] }),
        ]),
        h("br"),
        h("label", null, [
          "Custom ",
          h("textarea", { name: "custom", value: values["custom"], placeholder: "(A) => BigInt(A.q) == 27", }),
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
  if (siav["q"].length >= 20) {
    s = `g = ${siav["g"]}, q \\approx 2^{${(siav["q"].length / Math.log10(2)).toFixed(2)}}`;
  } else {
    s = `${prettyPolynomial(siav["f"])}`;
  }
  return h("math-tex", null, s);
}

function MoreDetail(siav) {
  return h(
    "table",
    { style: "border: 2px solid purple;border-collapse:collapse;background-color: rgba(0,0,255,0.1);" },
    [
      h("tr", null, h("th", { colspan: "2" }, "ID")),
      h("tr", null, h("td", { colspan: "2" }, [
        h("pre", { style: "display:inline-block;" }, siav["id"].substr(0, 10) + "..."),
        h("button", { "data-copy": siav["id"], style: "margin-left:10px", onclick: copyButton }, "copy"),
      ])),
      h("tr", null, h("th", { colspan: "2" }, "Weil Polynomial")),
      h("tr", null, h("td", { colspan: "2" }, [
        h("math-tex", null, `f(x) = ${prettyPolynomial(siav["f"])}`),
        h("button", { "data-copy": siav["f"], style: "margin-left:10px", onclick: copyButton }, "copy"),
      ])),
      h("tr", null, h("th", { colspan: "2" }, "Real Weil Polynomial")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `g(x) = ${prettyPolynomial(siav["h"])}`))),
      h("tr", null, h("th", { colspan: "2" }, "Dimension")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `\\dim A = ${siav["g"]}`))),
      h("tr", null, h("th", { colspan: "2" }, "Base Field")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, siav["a"] == "1" ? `q = p = ${siav["q"]}` : `q = ${siav["q"]} = ${siav["p"]}^{${siav["a"]}}`))),
      h("tr", null, h("th", { colspan: "2" }, "Number of points")),
      h("tr", null, h("td", { colspan: "2" }, h("math-tex", null, `\\#A(\\mathbb{F}_q) = ${siav["n"]}`))),
      h("tr", null, h("th", { colspan: "2" }, "Simple")),
      h("tr", null, h("td", { colspan: "2" }, siav["is_simple"] ? "Yes" : "No")),
      h("tr", null, h("th", { colspan: "2" }, "Principally Polarized")),
      h("tr", null, h("td", { colspan: "2" }, siav["is_principally_polarized"] ? "Yes" : "No")),
      h("tr", null, h("th", { colspan: "2" }, "Components")),
      ...siav["components"].map((B, i) =>
        h("tr", null, [
          h("td", { style: "width:200px;" }, [
            h("pre", { style: "display:inline-block;" }, B["id"].substr(0, 10) + "..."),
            h("button", { "data-copy": B["id"], style: "margin-left:10px", onclick: copyButton }, "copy"),
          ]),
          h("td", { style: "border:1px solid black;" }, [
            h("tr", null, h("th", null, "Multiplicity")),
            h("tr", null, h("td", null, h("math-tex", null, `e_{${i + 1}} = ${B["exponent"]}`))),
            h("tr", null, h("th", null, "Weil Polynomial")),
            h("tr", null, h("td", null, [
              h("math-tex", null, `f_{${i + 1}}(x) = ${prettyPolynomial(B["f"])}`),
              h("button", { "data-copy": B["f"], style: "margin-left:10px", onclick: copyButton }, "copy"),
            ])),
            h("tr", null, h("th", null, "Real Weil Polynomial")),
            h("tr", null, h("td", null, h("math-tex", null, `g_{${i + 1}}(x) = ${prettyPolynomial(B["h"])}`))),
            h("tr", null, h("th", null, "Dimension")),
            h("tr", null, h("td", null, h("math-tex", null, `\\dim B_{${i + 1}} = ${B["g"]}`))),
            h("tr", null, h("th", null, "Number of points")),
            h("tr", null, h("td", null, h("math-tex", null, `\\#B_{${i + 1}}(\\mathbb{F}_q) = ${B["n"]}`))),
            h("tr", null, h("th", null, "Principally Polarized")),
            h("tr", null, h("td", null, B["is_principally_polarized"] ? "Yes" : "No")),
            h("tr", null, h("th", null, "Ordinary")),
            h("tr", null, h("td", null, B["is_ordinary"] ? "Yes" : "No")),
            h("tr", null, h("th", null, "Newton Polygon")),
            h("tr", null, h("td", null, "???")),
            h("tr", null, h("th", null, "Complex Roots")),
            h("tr", null, h("td", null, "???")),
            h("tr", null, h("th", null, "Verschiebung")),
            h("tr", null, h("td", null, h("math-tex", null, prettyPolynomial(B["h"]).replace(/x/g, "\\pi")))),
          ]),
        ])
      ),
    ]
  );
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
