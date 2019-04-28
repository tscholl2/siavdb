import { newIterator } from "./iterators.js";

document.addEventListener("DOMContentLoaded", async () => {
  const div = document.getElementById("output");
  const ul = document.createElement("ul");
  let i = 0;
  for await (let entry of newIterator()) {
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
  /*
  const more = document.createElement("button");
  more.innerText = "more";
  div.append(more);
  */
});
