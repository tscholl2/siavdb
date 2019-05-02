import { newIterator } from "./iterators.js";
import { BigIntMath } from "./math.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("search-parameters");
  form.onsubmit = e => {
    e.preventDefault();
    updateOutput(readSearchParametersFromForm());
  };
  updateOutput();
});

async function updateOutput(filter) {
  const div = document.getElementById("output");
  div.innerHTML = "<progress/>";
  const ul = document.createElement("ul");
  let i = 0;
  const items = [];
  try {
    for await (let entry of newIterator(filter)) {
      items.push(entry);
      i++;
      if (i > 10) {
        break;
      }
      const li = document.createElement("li");
      li.innerText = JSON.stringify(entry);
      ul.append(li);
    }
    if (i === 0) {
      const li = document.createElement("li");
      li.innerText = "no results found";
      ul.append(li);
    }
    div.innerHTML = "";
    div.append(ul);
    const next = document.createElement("button");
    next.innerText = "next";
    next.onclick = () => {
      updateOutput({
        ...filter,
        q: BigIntMath.max(...items.map(e => BigInt(e.q)))
      });
    };
    div.append(next);
  } catch (e) {
    console.error(e);
    div.innerHTML = `<p style="color:'red'">${e}</p>`;
  }
}

function readSearchParametersFromForm() {
  return {
    q:
      (document.getElementById("q-cmp").value || "") +
      (document.getElementById("q-val").value || "0"),
    g: document.getElementById("g-val").value || ""
  };
}
