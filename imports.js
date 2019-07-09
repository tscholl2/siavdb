// https://gist.github.com/tscholl2/4de700ff933d8226fb8b56964547fffe#file-controller-min-js
export const Controller = eval(
  `(function(){return f;function f(t){var n=this;this.p=[],this.l=[],this.getState=function(){return n.s},this.addPlugin=function(t){n.p.push(t)},this.removePlugin=function(t){n.p=n.p.filter(function(n){return n!==t})},this.addListener=function(t){n.l.push(t)},this.removeListener=function(t){n.l=n.l.filter(function(n){return n!==t})},this.dispatch=function(t){n.p.forEach(function(n){return t=n(t)});var i=t(n.s);n.s!==i&&(n.s=i,n.l.forEach(function(t){return t(n.s,n.dispatch)}))},this.s=t};})()`
);
// https://unpkg.com/superfine@7.0.0/src/index.js
// export { patch, h } from "https://unpkg.com/superfine@7.0.0/src/index.js";
export const { h, patch } = eval(`(function(a,b){b(a);return a})({},function(p){var h={},g=[],b=g.map,j=Array.isArray,y=function(a){this.handlers[a.type](a)},x=function(d,i,f,c,a){"key"===i||("o"===i[0]&&"n"===i[1]?((d.handlers||(d.handlers={}))[(i=i.slice(2).toLowerCase())]=c)?f||d.addEventListener(i,y):d.removeEventListener(i,y):!a&&"list"!==i&&i in d?(d[i]=null==c?"":c):null==c||!1===c?d.removeAttribute(i):d.setAttribute(i,c))},k=function(i,A){var u=3===i.type?document.createTextNode(i.name):(A=A||"svg"===i.name)?document.createElementNS("http://www.w3.org/2000/svg",i.name):document.createElement(i.name),f=i.props;for(var a in f){x(u,a,null,f[a],A)}for(var c=0,s=i.children.length;c<s;c++){u.appendChild(k(i.children[c],A))}return(i.node=u)},q=function(a){return null==a?null:a.key},m=function(O,H,G,E,J){if(G===E){}else{if(null!=G&&3===G.type&&3===E.type){G.name!==E.name&&(H.nodeValue=E.name)}else{if(null==G||G.name!==E.name){(H=O.insertBefore(k(E,J),H)),null!=G&&O.removeChild(G.node)}else{var A,R,B,P,F=G.props,L=E.props,I=G.children,u=E.children,f=0,M=0,D=I.length-1,K=u.length-1;for(var i in ((J=J||"svg"===E.name),(function(c,s){var l={};for(var a in c){l[a]=c[a]}for(var a in s){l[a]=s[a]}return l})(F,L))){("value"===i||"selected"===i||"checked"===i?H[i]:F[i])!==L[i]&&x(H,i,F[i],L[i],J)}for(;M<=K&&f<=D&&null!=(B=q(I[f]))&&B===q(u[M]);){m(H,I[f].node,I[f++],u[M++],J)}for(;M<=K&&f<=D&&null!=(B=q(I[D]))&&B===q(u[K]);){m(H,I[D].node,I[D--],u[K--],J)}if(f>D){for(;M<=K;){H.insertBefore(k(u[M++],J),(R=I[f])&&R.node)}}else{if(M>K){for(;f<=D;){H.removeChild(I[f++].node)}}else{i=f;for(var d={},Q={};i<=D;i++){null!=(B=I[i].key)&&(d[B]=I[i])}for(;M<=K;){(B=q((R=I[f]))),(P=q(u[M])),Q[B]||(null!=P&&P===q(I[f+1]))?(null==B&&H.removeChild(R.node),f++):null==P||1===G.type?(null==B&&(m(H,R&&R.node,R,u[M],J),M++),f++):(B===P?(m(H,R.node,R,u[M],J),(Q[P]=!0),f++):null!=(A=d[P])?(m(H,H.insertBefore(A.node,R&&R.node),A,u[M],J),(Q[P]=!0)):m(H,R&&R.node,null,u[M],J),M++)}for(;f<=D;){null==q((R=I[f++]))&&H.removeChild(R.node)}for(var i in d){null==Q[i]&&H.removeChild(d[i].node)}}}}}}return(E.node=H)},w=function(f,s,i,d,a,c){return{name:f,props:s,children:i,node:d,type:c,key:a}},z=function(c,a){return w(c,h,g,a,null,3)},v=function(a){return 3===a.nodeType?z(a.nodeValue,a):w(a.nodeName.toLowerCase(),h,b.call(a.childNodes,v),a,null,1)};(p.h=function(l,n){for(var f,d=[],a=[],c=arguments.length;c-->2;){d.push(arguments[c])}for(;d.length>0;){if(j((f=d.pop()))){for(c=f.length;c-->0;){d.push(f[c])}}else{!1===f||!0===f||null==f||a.push("object"==typeof f?f:z(f))}}return((n=n||h),"function"==typeof l?l(n,a):w(l,n,a,null,n.key))}),(p.patch=function(a,c){return((a=m(a.parentNode,a,a.vdom||v(a),c)).vdom=c),a})});`);

import * as _ from "https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.js";
// https://github.com/justinfagnani/katex-elements/blob/master/katex-inline.js
// (modified)
export class KatexElement extends HTMLElement {
  constructor() {
    super();
    const displayStyle = this.getAttribute("display");
    const container = displayStyle ? "div" : "span";
    this.attachShadow({ mode: "open" });
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
        <${container}></${container}>
      `;
    this._container = this.shadowRoot.querySelector(container);
  }
  connectedCallback() {
    if (katex) {
      katex.render(this.textContent, this._container, {
        displayMode: this.getAttribute("display")
      });
    } else {
      // TODO: fallback
    }
  }
  // TODO: listen for text changes
}
customElements.define("math-tex", KatexElement);
