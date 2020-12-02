var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function i(t){t.forEach(e)}function s(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function h(e,n,i){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const i=e.subscribe(...n);return i.unsubscribe?()=>i.unsubscribe():i}(n,i))}function l(t,e,n=e){return t.set(n),e}function o(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function a(t){t.parentNode.removeChild(t)}function c(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function d(t){return document.createElement(t)}function f(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function g(t){return document.createTextNode(t)}function p(){return g(" ")}function w(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function m(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function x(t){return""===t?void 0:+t}function v(t,e){t.value=null==e?"":e}let $;function b(t){$=t}const y=[],_=[],j=[],H=[],W=Promise.resolve();let k=!1;function A(t){j.push(t)}let S=!1;const E=new Set;function C(){if(!S){S=!0;do{for(let t=0;t<y.length;t+=1){const e=y[t];b(e),P(e.$$)}for(y.length=0;_.length;)_.pop()();for(let t=0;t<j.length;t+=1){const e=j[t];E.has(e)||(E.add(e),e())}j.length=0}while(y.length);for(;H.length;)H.pop()();k=!1,S=!1,E.clear()}}function P(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(A)}}const M=new Set;function R(t,e){t&&t.i&&(M.delete(t),t.i(e))}function I(t,e,n,i){if(t&&t.o){if(M.has(t))return;M.add(t),undefined.c.push((()=>{M.delete(t),i&&(n&&t.d(1),i())})),t.o(e)}}function N(t){t&&t.c()}function O(t,n,r){const{fragment:h,on_mount:l,on_destroy:o,after_update:u}=t.$$;h&&h.m(n,r),A((()=>{const n=l.map(e).filter(s);o?o.push(...n):i(n),t.$$.on_mount=[]})),u.forEach(A)}function B(t,e){const n=t.$$;null!==n.fragment&&(i(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function T(t,e){-1===t.$$.dirty[0]&&(y.push(t),k||(k=!0,W.then(C)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function q(e,s,r,h,l,o,u=[-1]){const c=$;b(e);const d=s.props||{},f=e.$$={fragment:null,ctx:null,props:o,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(c?c.$$.context:[]),callbacks:n(),dirty:u,skip_bound:!1};let g=!1;if(f.ctx=r?r(e,d,((t,n,...i)=>{const s=i.length?i[0]:n;return f.ctx&&l(f.ctx[t],f.ctx[t]=s)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](s),g&&T(e,t)),n})):[],f.update(),g=!0,i(f.before_update),f.fragment=!!h&&h(f.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);f.fragment&&f.fragment.l(t),t.forEach(a)}else f.fragment&&f.fragment.c();s.intro&&R(e.$$.fragment),O(e,s.target,s.anchor),C()}b(c)}class F{$destroy(){B(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}let J=.375,L=0,G=[],K={width:49,height:97,margins:.25,max_width:()=>K.width-2*K.margins+J,max_height:()=>K.height-2*K.margins+J};function V(t,e=1,n=!1,i=J,s=L,r=K){const h=new U(function(t,e=","){for(var n=new RegExp("(\\"+e+'|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\'+e+"\\r\\n]*))","gi"),i=[[]],s=null;s=n.exec(t);){var r=s[1];if(r.length&&r!=e&&i.push([]),s[2])var h=s[2].replace(new RegExp('""',"g"),'"');else h=s[3];i[i.length-1].push(h)}return i}(t).slice(e).flatMap((t=>function([t,e,n,i]){let s=1,r=[];for(;e>=s;)r.push([`${t} (${s}/${e})`,parseFloat(n),parseFloat(i)]),s++;return console.log(r),r}(t).map((t=>new z(t)))))).flat().filterTooBig();function l(t){let e=new U(t.widest().place()),n=e[0].width;for(;t.fitsColumn(e);){let i=new U(t.fitsColumn(e).place());for(;t.fitsRow(i,n);)i.push(t.fitsRow(i,n).place());1===i.length?e.push(i[0]):e.push(i)}return e.shuffle()}function o(t){let e=new U(t.widest().place());for(;t.fitsSheet(e);)e.push(t.fitsSheet(e).place());return e.shuffle()}function u(t,e){let n=K.margins+K.width*e,i=K.margins,s=new U;t.forEach(((e,r)=>{0===r?s.push(n):s.push(s.last()+t[r-1].width);let h=new U;e.group.forEach(((t,e,n)=>{0===e?h.push(i):n[e-1]instanceof U?h.push(h.last()+n[e-1].filledHeight()):h.push(h.last()+n[e-1].height),t instanceof z?(t.x0=s[r],t.y0=h[e]):t.forEach(((n,i)=>{n.x0=0===i?s[r]:t[i-1].x0+t[i-1].width,n.y0=h[e]}))}))}))}return J=i,L=s,K=r,[h,function(t){let e=function(t){let e=new U;for(;t.notPlaced().length>0;){let n=l(t);e.push(new D(n.columnWidth(),n.columnHeight(),n.columnArea(),n))}return e}(t),n=new U;for(;e.notPlaced().length>0;){let t=o(e);u(t,n.length),n.push(new Q(t.filledWidth(),t.filledHeight(),t.filledArea(),t.map((t=>t.group)).flatten(2),t,n.length+1))}return n}(h)]}class Y{constructor(){this.placed=!1}place(){return this.placed=!0,this}}class z extends Y{constructor([t,e,n]){super(),this.id=t,this.width=e+J+L,this.height=n+J+L,this.area=this.height*this.width,this.x0=0,this.y0=0}}class D extends Y{constructor(t,e,n,i){super(),this.width=t,this.height=e,this.area=n,this.group=i}}class Q extends D{constructor(t,e,n,i,s,r){super(t,e,n,i),this.columns=s,this.sheet_width=K.width,this.sheet_height=K.height,this.sheet_area=K.width*K.height,this.waste_area=this.sheet_area-this.area,this.waste_ratio=1-this.area/this.sheet_area,this.id="Sheet "+r,delete this.placed}}class U extends Array{first(){return this[0]}last(){return this[this.length-1]}flatten(t=1){let e=this;for(;t--;)e=e.flat();return e}shuffle(){return new U(...this.slice(1),this.first())}ascendingWidth(){return new U(...this).sort(((t,e)=>e.width!=t.width?e.width-t.width:e.height-t.height))}ascendingHeight(){return new U(...this).sort(((t,e)=>e.height!=t.height?e.height-t.height:e.width-t.width))}filterTooBig(){return this.map((t=>t.width>K.max_width()||t.height>K.max_height()?(G.push(`panel ${t.id} is too big`),!1):t)).filter((t=>t))}notPlaced(){return this.filter((t=>!t.placed))}widest(){return this.notPlaced().ascendingWidth().first()}narrowest(){return this.notPlaced().ascendingWidth().last()}tallest(){return this.notPlaced().ascendingHeight().first()}shortest(){return this.notPlaced().ascendingHeight().last()}biggest(){return this.sort(((t,e)=>e.area-t.area)).notPlaced().first()}totalWidth(){return this.reduce(((t,e)=>e instanceof U?t+e.ascendingWidth().first().width:t+e.width),0)}totalHeight(){return this.reduce(((t,e)=>e instanceof U?t+e.ascendingHeight().first().height:t+e.height),0)}totalArea(){return this.reduce(((t,e)=>t+e.area),0)}columnWidth(){return this.flat().ascendingWidth().first().width}columnHeight(){return this.totalHeight()}columnArea(){return this.flat().totalArea()}filledHeight(){return this.ascendingHeight().first().height}filledWidth(){return this.totalWidth()}filledArea(){return this.flat().totalArea()}remainingWidth(t){return t-this.totalWidth()}remainingHeight(t){return t-this.totalHeight()}fitsColumn(t,e=K.height){return this.notPlaced().filter((e=>e.width<=t[0].width)).filter((n=>n.height<t.remainingHeight(e))).biggest()}fitsRow(t,e){return this.notPlaced().filter((e=>e.height<=t[0].height)).filter((n=>n.width<t.remainingWidth(e))).biggest()}fitsSheet(t,e=K.width){return this.notPlaced().filter((n=>n.width<t.remainingWidth(e))).widest()}}const X=[];const Z=(e,n)=>{const i=t=>JSON.stringify(t,null,2),s=JSON.parse;null===localStorage.getItem(e)&&localStorage.setItem(e,i(n));const h=s(localStorage.getItem(e)),{subscribe:l,set:o,update:u}=function(e,n=t){let i;const s=[];function h(t){if(r(e,t)&&(e=t,i)){const t=!X.length;for(let t=0;t<s.length;t+=1){const n=s[t];n[1](),X.push(n,e)}if(t){for(let t=0;t<X.length;t+=2)X[t][0](X[t+1]);X.length=0}}}return{set:h,update:function(t){h(t(e))},subscribe:function(r,l=t){const o=[r,l];return s.push(o),1===s.length&&(i=n(h)||t),r(e),()=>{const t=s.indexOf(o);-1!==t&&s.splice(t,1),0===s.length&&(i(),i=null)}}}}(h);return{subscribe:l,set:t=>(localStorage.setItem(e,i(t)),o(t)),update:u}},tt=Z("panels",[]),et=Z("sheets",[{sheet_width:49,sheet_height:97}]);function nt(e){let n,s,r,h,l,c,f,$,b,y,_,j,H,W,k,A,S,E,C,P,M,R,I,N,O,B,T,q,F,J,L,G,K,V,Y,z,D=(""==e[5]?"Import":e[5])+"";return{c(){n=d("div"),s=d("input"),r=p(),h=d("label"),l=g(D),c=p(),f=d("div"),$=d("h5"),$.textContent="Material W x H",b=p(),y=d("input"),_=p(),j=d("span"),j.textContent="x",H=p(),W=d("input"),k=p(),A=d("div"),S=d("h5"),S.textContent="Margins",E=p(),C=d("input"),P=p(),M=d("div"),R=d("h5"),R.textContent="Kerf",I=p(),N=d("input"),O=p(),B=d("div"),T=d("h5"),T.textContent="Gap",q=p(),F=d("input"),J=p(),L=d("div"),G=d("h5"),G.textContent="Metric",K=p(),V=d("input"),m(s,"class","inputfile svelte-1ot2xjt"),m(s,"name","file"),m(s,"id","file"),m(s,"type","file"),m(h,"for","file"),m(h,"class","svelte-1ot2xjt"),m(n,"class","upload-wrapper svelte-1ot2xjt"),m($,"class","svelte-1ot2xjt"),m(y,"class","input svelte-1ot2xjt"),m(y,"type","number"),m(j,"class","svelte-1ot2xjt"),m(W,"class","input svelte-1ot2xjt"),m(W,"type","number"),m(f,"class","input-wrapper svelte-1ot2xjt"),m(S,"class","svelte-1ot2xjt"),m(C,"class","input svelte-1ot2xjt"),m(C,"type","number"),m(C,"step","0.005"),m(A,"class","input-wrapper svelte-1ot2xjt"),m(R,"class","svelte-1ot2xjt"),m(N,"class","input svelte-1ot2xjt"),m(N,"type","number"),m(N,"step","0.005"),m(M,"class","input-wrapper svelte-1ot2xjt"),m(T,"class","svelte-1ot2xjt"),m(F,"class","input svelte-1ot2xjt"),m(F,"type","number"),m(F,"step","0.005"),m(B,"class","input-wrapper svelte-1ot2xjt"),m(G,"class","svelte-1ot2xjt"),m(V,"class","input svelte-1ot2xjt"),m(V,"type","checkbox"),m(L,"class","input-wrapper svelte-1ot2xjt")},m(t,i){u(t,n,i),o(n,s),e[7](s),o(n,r),o(n,h),o(h,l),u(t,c,i),u(t,f,i),o(f,$),o(f,b),o(f,y),v(y,e[1].width),o(f,_),o(f,j),o(f,H),o(f,W),v(W,e[1].height),u(t,k,i),u(t,A,i),o(A,S),o(A,E),o(A,C),v(C,e[1].margins),u(t,P,i),u(t,M,i),o(M,R),o(M,I),o(M,N),v(N,e[2]),u(t,O,i),u(t,B,i),o(B,T),o(B,q),o(B,F),v(F,e[3]),u(t,J,i),u(t,L,i),o(L,G),o(L,K),o(L,V),V.checked=e[4],Y||(z=[w(s,"change",e[6]),w(y,"input",e[8]),w(W,"input",e[9]),w(C,"input",e[10]),w(N,"input",e[11]),w(F,"input",e[12]),w(V,"change",e[13])],Y=!0)},p(t,[e]){32&e&&D!==(D=(""==t[5]?"Import":t[5])+"")&&function(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}(l,D),2&e&&x(y.value)!==t[1].width&&v(y,t[1].width),2&e&&x(W.value)!==t[1].height&&v(W,t[1].height),2&e&&x(C.value)!==t[1].margins&&v(C,t[1].margins),4&e&&x(N.value)!==t[2]&&v(N,t[2]),8&e&&x(F.value)!==t[3]&&v(F,t[3]),16&e&&(V.checked=t[4])},i:t,o:t,d(t){t&&a(n),e[7](null),t&&a(c),t&&a(f),t&&a(k),t&&a(A),t&&a(P),t&&a(M),t&&a(O),t&&a(B),t&&a(J),t&&a(L),Y=!1,i(z)}}}function it(t,e,n){let i,s,r;h(t,tt,(t=>n(14,i=t))),h(t,et,(t=>n(15,s=t)));let o,u={width:49,height:97,margins:.25},a=.375,c=0,d=!1;return n(5,o=""),[r,u,a,c,d,o,function(){let t=r.files[0],e=new FileReader;n(5,o=r.value.split("\\").pop()),t.type.match(/text.csv/)?e.onload=function(t){let e=V(t.target.result,5,d,a,c,u);l(tt,i=e[0]),l(et,s=e[1])}:n(5,o="CSV's please!!!"),e.readAsText(t)},function(t){_[t?"unshift":"push"]((()=>{r=t,n(0,r)}))},function(){u.width=x(this.value),n(1,u)},function(){u.height=x(this.value),n(1,u)},function(){u.margins=x(this.value),n(1,u)},function(){a=x(this.value),n(2,a)},function(){c=x(this.value),n(3,c)},function(){d=this.checked,n(4,d)}]}class st extends F{constructor(t){super(),q(this,t,it,nt,r,{})}}function rt(t,e,n){const i=t.slice();return i[4]=e[n],i}function ht(t,e,n){const i=t.slice();return i[7]=e[n],i[9]=n,i}function lt(t){let e,n,i,s,r;return{c(){e=f("rect"),m(e,"class","sheet svelte-1pd2w2x"),m(e,"id",n=t[7].id),m(e,"x",i=t[9]*t[7].sheet_width+"in"),m(e,"y","0"),m(e,"width",s=t[7].sheet_width+"in"),m(e,"height",r=t[7].sheet_height+"in")},m(t,n){u(t,e,n)},p(t,h){2&h&&n!==(n=t[7].id)&&m(e,"id",n),2&h&&i!==(i=t[9]*t[7].sheet_width+"in")&&m(e,"x",i),2&h&&s!==(s=t[7].sheet_width+"in")&&m(e,"width",s),2&h&&r!==(r=t[7].sheet_height+"in")&&m(e,"height",r)},d(t){t&&a(e)}}}function ot(t){let e,n,i,s,r;return{c(){e=f("rect"),m(e,"class","panel svelte-1pd2w2x"),m(e,"id","panel"),m(e,"x",n=t[4].x0+"in"),m(e,"y",i=t[4].y0+"in"),m(e,"width",s=t[4].width+"in"),m(e,"height",r=t[4].height+"in")},m(t,n){u(t,e,n)},p(t,h){8&h&&n!==(n=t[4].x0+"in")&&m(e,"x",n),8&h&&i!==(i=t[4].y0+"in")&&m(e,"y",i),8&h&&s!==(s=t[4].width+"in")&&m(e,"width",s),8&h&&r!==(r=t[4].height+"in")&&m(e,"height",r)},d(t){t&&a(e)}}}function ut(e){let n,i,s,r=e[1],h=[];for(let t=0;t<r.length;t+=1)h[t]=lt(ht(e,r,t));let l=e[3],d=[];for(let t=0;t<l.length;t+=1)d[t]=ot(rt(e,l,t));return{c(){n=f("svg");for(let t=0;t<h.length;t+=1)h[t].c();i=g("");for(let t=0;t<d.length;t+=1)d[t].c();m(n,"version","1.1"),m(n,"xmlns","http://www.w3.org/2000/svg"),m(n,"xmlns:xlink","http://www.w3.org/1999/xlink"),m(n,"viewBox",s="0 0 "+96*e[0]+" "+96*e[2]),m(n,"preserveAspectRatio","xMidYMid meet"),m(n,"class","svelte-1pd2w2x")},m(t,e){u(t,n,e);for(let t=0;t<h.length;t+=1)h[t].m(n,null);o(n,i);for(let t=0;t<d.length;t+=1)d[t].m(n,null)},p(t,[e]){if(2&e){let s;for(r=t[1],s=0;s<r.length;s+=1){const l=ht(t,r,s);h[s]?h[s].p(l,e):(h[s]=lt(l),h[s].c(),h[s].m(n,i))}for(;s<h.length;s+=1)h[s].d(1);h.length=r.length}if(8&e){let i;for(l=t[3],i=0;i<l.length;i+=1){const s=rt(t,l,i);d[i]?d[i].p(s,e):(d[i]=ot(s),d[i].c(),d[i].m(n,null))}for(;i<d.length;i+=1)d[i].d(1);d.length=l.length}5&e&&s!==(s="0 0 "+96*t[0]+" "+96*t[2])&&m(n,"viewBox",s)},i:t,o:t,d(t){t&&a(n),c(h,t),c(d,t)}}}function at(t,e,n){let i,s,r,l;return h(t,et,(t=>n(1,i=t))),h(t,tt,(t=>n(3,s=t))),t.$$.update=()=>{2&t.$$.dirty&&n(0,r=i.length*i[0].sheet_width||49),2&t.$$.dirty&&n(2,l=i.sheet_height||97)},[r,i,l,s]}class ct extends F{constructor(t){super(),q(this,t,at,ut,r,{})}}function dt(e){let n,i,s,r,h,l,c;return s=new st({}),l=new ct({}),{c(){n=d("div"),i=d("div"),N(s.$$.fragment),r=p(),h=d("div"),N(l.$$.fragment),m(i,"class","import svelte-17qrpw"),m(h,"class","viewer svelte-17qrpw"),m(n,"class","container svelte-17qrpw")},m(t,e){u(t,n,e),o(n,i),O(s,i,null),o(n,r),o(n,h),O(l,h,null),c=!0},p:t,i(t){c||(R(s.$$.fragment,t),R(l.$$.fragment,t),c=!0)},o(t){I(s.$$.fragment,t),I(l.$$.fragment,t),c=!1},d(t){t&&a(n),B(s),B(l)}}}return new class extends F{constructor(t){super(),q(this,t,null,dt,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
