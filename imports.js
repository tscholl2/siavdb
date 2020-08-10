// https://gist.github.com/tscholl2/4de700ff933d8226fb8b56964547fffe#file-controller-min-js
export const Controller = eval(`
(function(){return f;function f(t){var n=this;this.p=[],this.l=[],this.getState=function(){return n.s},this.addPlugin=function(t){n.p.push(t)},this.removePlugin=function(t){n.p=n.p.filter(function(n){return n!==t})},this.addListener=function(t){n.l.push(t)},this.removeListener=function(t){n.l=n.l.filter(function(n){return n!==t})},this.dispatch=function(t){n.p.forEach(function(n){return t=n(t)});var i=t(n.s);n.s!==i&&(n.s=i,n.l.forEach(function(t){return t(n.s,n.dispatch)}))},this.s=t};})()
`);

//import * as SS from "https://unpkg.com/superfine@8.0.10/superfine.js";
const SS = eval(`
(()=>{var e={},l=[],t=e=>null==e?e:e.key,r=function(e){this.tag[e.type](e)},o=(e,l,t,o,n)=>{"key"===l||("o"===l[0]&&"n"===l[1]?((e.tag||(e.tag={}))[l=l.slice(2)]=o)?t||e.addEventListener(l,r):e.removeEventListener(l,r):!n&&"list"!==l&&"form"!==l&&l in e?e[l]=null==o?"":o:null==o||!1===o?e.removeAttribute(l):e.setAttribute(l,o))},n=(e,l)=>{var t=e.props,r=3===e.tag?document.createTextNode(e.type):(l=l||"svg"===e.type)?document.createElementNS("http://www.w3.org/2000/svg",e.type,{is:t.is}):document.createElement(e.type,{is:t.is});for(var d in t)o(r,d,null,t[d],l);return e.children.map(e=>r.appendChild(n(e=i(e),l))),e.dom=r},d=(e,l,r,a,u)=>{if(r===a);else if(null!=r&&3===r.tag&&3===a.tag)r.type!==a.type&&(l.nodeValue=a.type);else if(null==r||r.type!==a.type)l=e.insertBefore(n(a=i(a),u),l),null!=r&&e.removeChild(r.dom);else{var m,p,s,v,f=r.props,y=a.props,c=r.children,h=a.children,g=0,x=0,C=c.length-1,k=h.length-1;for(var w in u=u||"svg"===a.type,{...f,...y})("value"===w||"selected"===w||"checked"===w?l[w]:f[w])!==y[w]&&o(l,w,f[w],y[w],u);for(;x<=k&&g<=C&&null!=(s=t(c[g]))&&s===t(h[x]);)d(l,c[g].dom,c[g++],h[x]=i(h[x++]),u);for(;x<=k&&g<=C&&null!=(s=t(c[C]))&&s===t(h[k]);)d(l,c[C].dom,c[C--],h[k]=i(h[k--]),u);if(g>C)for(;x<=k;)l.insertBefore(n(h[x]=i(h[x++]),u),(p=c[g])&&p.dom);else if(x>k)for(;g<=C;)l.removeChild(c[g++].dom);else{var N={},A={};for(w=g;w<=C;w++)null!=(s=c[w].key)&&(N[s]=c[w]);for(;x<=k;)s=t(p=c[g]),v=t(h[x]=i(h[x])),A[s]||null!=v&&v===t(c[g+1])?(null==s&&l.removeChild(p.dom),g++):null==v||1===r.tag?(null==s&&(d(l,p&&p.dom,p,h[x],u),x++),g++):(s===v?(d(l,p.dom,p,h[x],u),A[v]=!0,g++):null!=(m=N[v])?(d(l,l.insertBefore(m.dom,p&&p.dom),m,h[x],u),A[v]=!0):d(l,p&&p.dom,null,h[x],u),x++);for(;g<=C;)null==t(p=c[g++])&&l.removeChild(p.dom);for(var w in N)null==A[w]&&l.removeChild(N[w].dom)}}return a.dom=l},i=e=>!0!==e&&!1!==e&&e?e:text(""),a=t=>3===t.nodeType?text(t.nodeValue,t):u(t.nodeName.toLowerCase(),e,l.map.call(t.childNodes,a),t,null,1),u=(e,l,t,r,o,n)=>({type:e,props:l,children:t,dom:r,key:o,tag:n});var text=(t,r)=>u(t,e,l,r,null,3);var h=(e,t,r)=>u(e,t,Array.isArray(r)?r:null==r?l:[r],null,t.key);var patch=(e,l)=>((e=d(e.parentNode,e,e.v||a(e),l)).v=l,e); return {h,text,patch};})()
`);

export const { patch } = SS;

const empty_obj = {};
const empty_arr = [];
export function h(tag, props, children) {
  if (props == null)
    props = empty_obj;
  if (!children)
    children = empty_arr;
  else
    children = (!Array.isArray(children) ? [children] : children)
      .flat()
      .filter(c => c)
      .map(c => typeof (c) === "string" ? SS.text(c) : c);
  return SS.h(tag, props, children);
}

import * as _ from "https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.js";
// https://github.com/justinfagnani/katex-elements/blob/master/katex-inline.js
// (modified)

const w = new Worker(
  window.URL.createObjectURL(
    new Blob([
      `
importScripts("https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.js");
function render(s) {
  return katex.renderToString(s);
}
const methods = { render };
self.onmessage = function(e) {
  const [id, methodName, methodArgs] = e.data;
  const result = methods[methodName].apply(null, methodArgs);
  self.postMessage([id, result]);
};
`
    ]),
    { type: "text/javascript" }
  )
);
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

export class KatexElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.lastRendered = {};
  }
  static get observedAttributes() {
    return ["display"];
  }
  connectedCallback() {
    const displayStyle = this.getAttribute("display");
    const tex = this.textContent;
    if (
      this.lastRendered.tex === tex &&
      this.lastRendered.displayStyle === displayStyle
    ) {
      return;
    }
    this.lastRendered.displayMode = displayStyle;
    const container = displayStyle ? "div" : "span";
    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: ${displayStyle ? "block" : "inline-block"};
          }
        </style>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css"
          integrity="sha384-yFRtMMDnQtDRO8rLpMIKrtPCD5jdktao2TV19YiZYWMDkUR5GQZR/NOVTdquEx1j"
          crossorigin="anonymous"
        />
        <${container}><code>${tex}</code></${container}>
      `;
    this._container = this.shadowRoot.querySelector(container);
    callWorker("render", tex).then(result => {
      if (tex === this.lastRendered.tex) {
        return;
      }
      this.lastRendered.tex = tex;
      this._container.innerHTML = result;
    });
  }
}
customElements.define("math-tex", KatexElement);
