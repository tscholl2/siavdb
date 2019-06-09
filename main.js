document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("search-parameters");
  form.onsubmit = e => {
    e.preventDefault();
    updateOutput();
  };
  //updateOutput();
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
    li.innerText = JSON.stringify(A);
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
