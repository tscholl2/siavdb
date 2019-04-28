import { newIterator } from "./iterators.js";

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
  try {
    for await (let entry of newIterator(filter)) {
      i++;
      if (i > 10) {
        break;
      }
      const li = document.createElement("li");
      li.innerText = JSON.stringify(entry);
      ul.append(li);
    }
    div.innerHTML = "";
    div.append(ul);
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
