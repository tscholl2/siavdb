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

let VIEWING_DATA = [];
let START_INDEX = undefined;
let VIEW_NUMBER = undefined;

async function updateOutput(filter) {
  const div = document.getElementById("output");
  div.innerHTML = "<progress/>";
  VIEWING_DATA = [];
  START_INDEX = 0;
  const itr = newIterator(filter);
  VIEW_NUMBER = await loadMore();
  print();

  function print() {
    const ul = document.createElement("ul");
    if (START_INDEX >= VIEWING_DATA.length || VIEWING_DATA === 0) {
      const li = document.createElement("li");
      li.innerText = "no results found";
      ul.append(li);
    } else {
      for (let i = START_INDEX; i < START_INDEX + VIEW_NUMBER; i++) {
        const li = document.createElement("li");
        const v = VIEWING_DATA[i];
        li.innerText = `q=${v.q}, id=${v.id.substr(0, 6)}`;
        ul.append(li);
      }
    }
    div.innerHTML = "";
    div.append(ul);
    const next = document.createElement("button");
    next.innerText = "next";
    if (VIEW_NUMBER < 10) {
      next.disabled = true;
    } else {
      next.onclick = async () => {
        let numberOfNewEntries = Math.min(
          VIEWING_DATA.length - (START_INDEX + VIEW_NUMBER),
          10
        );
        if (START_INDEX + VIEW_NUMBER >= VIEWING_DATA.length) {
          div.innerHTML = "<progress/>";
          numberOfNewEntries = await loadMore();
        }
        START_INDEX = START_INDEX + VIEW_NUMBER;
        VIEW_NUMBER = numberOfNewEntries;
        print();
      };
    }
    const prev = document.createElement("button");
    prev.innerText = "prev";
    if (START_INDEX === 0) {
      prev.disabled = true;
    } else {
      prev.onclick = () => {
        START_INDEX = Math.max(0, START_INDEX - VIEW_NUMBER);
        print();
      };
    }
    div.append(next);
    div.append(prev);
  }

  async function loadMore() {
    for (let i = 0; i < 10; i++) {
      try {
        const v = await itr.next();
        if (v.done) {
          return i;
        }
        VIEWING_DATA.push(v.value);
      } catch (e) {
        console.error(e);
      }
    }
    return 10;
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
