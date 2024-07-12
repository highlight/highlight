import { e as Nn } from "./index-B6OrGkGw.js";
function Ya(Et, Mt) {
  for (var We = 0; We < Mt.length; We++) {
    const Ke = Mt[We];
    if (typeof Ke != "string" && !Array.isArray(Ke)) {
      for (const Be in Ke)
        if (Be !== "default" && !(Be in Et)) {
          const It = Object.getOwnPropertyDescriptor(Ke, Be);
          It && Object.defineProperty(Et, Be, It.get ? It : {
            enumerable: !0,
            get: () => Ke[Be]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(Et, Symbol.toStringTag, { value: "Module" }));
}
var Ln = { exports: {} };
(function(Et, Mt) {
  (function(We, Ke) {
    Ke(Mt);
  })(Nn, function(We) {
    var Ke = Object.defineProperty, Be = Object.defineProperties, It = Object.getOwnPropertyDescriptors, zt = Object.getOwnPropertySymbols, xn = Object.prototype.hasOwnProperty, Jn = Object.prototype.propertyIsEnumerable, Ci = (t, e, i) => e in t ? Ke(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, U = (t, e) => {
      for (var i in e || (e = {}))
        xn.call(e, i) && Ci(t, i, e[i]);
      if (zt)
        for (var i of zt(e))
          Jn.call(e, i) && Ci(t, i, e[i]);
      return t;
    }, Ve = (t, e) => Be(t, It(e)), Ue = (t, e) => {
      var i = {};
      for (var n in t)
        xn.call(t, n) && e.indexOf(n) < 0 && (i[n] = t[n]);
      if (t != null && zt)
        for (var n of zt(t))
          e.indexOf(n) < 0 && Jn.call(t, n) && (i[n] = t[n]);
      return i;
    }, w = (t, e, i) => (Ci(t, typeof e != "symbol" ? e + "" : e, i), i), ne = (t, e, i) => new Promise((n, s) => {
      var o = (l) => {
        try {
          a(i.next(l));
        } catch (c) {
          s(c);
        }
      }, r = (l) => {
        try {
          a(i.throw(l));
        } catch (c) {
          s(c);
        }
      }, a = (l) => l.done ? n(l.value) : Promise.resolve(l.value).then(o, r);
      a((i = i.apply(t, e)).next());
    });
    function or(t, e) {
      for (var i = 0; i < e.length; i++) {
        const n = e[i];
        if (typeof n != "string" && !Array.isArray(n)) {
          for (const s in n)
            if (s !== "default" && !(s in t)) {
              const o = Object.getOwnPropertyDescriptor(n, s);
              o && Object.defineProperty(t, s, o.get ? o : { enumerable: !0, get: () => n[s] });
            }
        }
      }
      return Object.freeze(Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }));
    }
    var Yn, rr = Object.defineProperty, C = (t, e, i) => (((n, s, o) => {
      s in n ? rr(n, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[s] = o;
    })(t, typeof e != "symbol" ? e + "" : e, i), i), lr = Object.defineProperty, Kn = (t, e, i) => (((n, s, o) => {
      s in n ? lr(n, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[s] = o;
    })(t, typeof e != "symbol" ? e + "" : e, i), i), ae = ((t) => (t[t.Document = 0] = "Document", t[t.DocumentType = 1] = "DocumentType", t[t.Element = 2] = "Element", t[t.Text = 3] = "Text", t[t.CDATA = 4] = "CDATA", t[t.Comment = 5] = "Comment", t))(ae || {});
    const Un = { Node: ["childNodes", "parentNode", "parentElement", "textContent"], ShadowRoot: ["host", "styleSheets"], Element: ["shadowRoot", "querySelector", "querySelectorAll"], MutationObserver: [] }, Fn = { Node: ["contains", "getRootNode"], ShadowRoot: ["getSelection"], Element: [], MutationObserver: ["constructor"] }, Ot = {}, ki = {};
    function it(t, e, i) {
      var n;
      const s = `${t}.${String(i)}`;
      if (ki[s])
        return ki[s].call(e);
      const o = function(a) {
        if (Ot[a])
          return Ot[a];
        const l = globalThis[a], c = l.prototype, d = a in Un ? Un[a] : void 0, h = !!(d && d.every((X) => {
          var Z, V;
          return !!((V = (Z = Object.getOwnPropertyDescriptor(c, X)) == null ? void 0 : Z.get) != null && V.toString().includes("[native code]"));
        })), p = a in Fn ? Fn[a] : void 0, m = !!(p && p.every((X) => {
          var Z;
          return typeof c[X] == "function" && ((Z = c[X]) == null ? void 0 : Z.toString().includes("[native code]"));
        }));
        if (h && m)
          return Ot[a] = l.prototype, l.prototype;
        try {
          const X = document.createElement("iframe");
          document.body.appendChild(X);
          const Z = X.contentWindow;
          if (!Z)
            return l.prototype;
          const V = Z[a].prototype;
          return document.body.removeChild(X), V ? Ot[a] = V : c;
        } catch (X) {
          return c;
        }
      }(t), r = (n = Object.getOwnPropertyDescriptor(o, i)) == null ? void 0 : n.get;
      return r ? (ki[s] = r, r.call(e)) : e[i];
    }
    function Ti(t) {
      return it("Node", t, "childNodes");
    }
    function Pt(t) {
      return it("Node", t, "parentNode");
    }
    function wi(t) {
      return it("Node", t, "parentElement");
    }
    function Ni(t) {
      return it("Node", t, "textContent");
    }
    function Li(t) {
      return t && "shadowRoot" in t ? it("Element", t, "shadowRoot") : null;
    }
    function Hn(t) {
      return t.nodeType === t.ELEMENT_NODE;
    }
    function St(t) {
      const e = t && "host" in t && "mode" in t && function(i) {
        return i && "host" in i ? it("ShadowRoot", i, "host") : null;
      }(t) || null;
      return !!(e && "shadowRoot" in e && Li(e) === t);
    }
    function Xt(t) {
      return Object.prototype.toString.call(t) === "[object ShadowRoot]";
    }
    function Bt(t) {
      try {
        const i = t.rules || t.cssRules;
        return i ? ((e = Array.from(i, En).join("")).includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(/\sbackground-clip:\s*text;/g, " -webkit-background-clip: text; background-clip: text;")), e) : null;
      } catch (i) {
        return null;
      }
      var e;
    }
    function En(t) {
      let e;
      if (function(i) {
        return "styleSheet" in i;
      }(t))
        try {
          e = Bt(t.styleSheet) || function(i) {
            const { cssText: n } = i;
            if (n.split('"').length < 3)
              return n;
            const s = ["@import", `url(${JSON.stringify(i.href)})`];
            return i.layerName === "" ? s.push("layer") : i.layerName && s.push(`layer(${i.layerName})`), i.supportsText && s.push(`supports(${i.supportsText})`), i.media.length && s.push(i.media.mediaText), s.join(" ") + ";";
          }(t);
        } catch (i) {
        }
      else if (function(i) {
        return "selectorText" in i;
      }(t) && t.selectorText.includes(":"))
        return function(i) {
          const n = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
          return i.replace(n, "$1\\$2");
        }(t.cssText);
      return e || t.cssText;
    }
    class Mn {
      constructor() {
        Kn(this, "idNodeMap", /* @__PURE__ */ new Map()), Kn(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
      }
      getId(e) {
        var i;
        if (!e)
          return -1;
        const n = (i = this.getMeta(e)) == null ? void 0 : i.id;
        return n != null ? n : -1;
      }
      getNode(e) {
        return this.idNodeMap.get(e) || null;
      }
      getIds() {
        return Array.from(this.idNodeMap.keys());
      }
      getMeta(e) {
        return this.nodeMetaMap.get(e) || null;
      }
      removeNodeFromMap(e) {
        const i = this.getId(e);
        this.idNodeMap.delete(i), e.childNodes && e.childNodes.forEach((n) => this.removeNodeFromMap(n));
      }
      has(e) {
        return this.idNodeMap.has(e);
      }
      hasNode(e) {
        return this.nodeMetaMap.has(e);
      }
      add(e, i) {
        const n = i.id;
        this.idNodeMap.set(n, e), this.nodeMetaMap.set(e, i);
      }
      replace(e, i) {
        const n = this.getNode(e);
        if (n) {
          const s = this.nodeMetaMap.get(n);
          s && this.nodeMetaMap.set(i, s);
        }
        this.idNodeMap.set(e, i);
      }
      reset() {
        this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
      }
    }
    function xi({ element: t, maskInputOptions: e, tagName: i, type: n, value: s, overwriteRecord: o, maskInputFn: r }) {
      let a = s || "";
      return Bn({ maskInputOptions: e, tagName: i, type: n, overwriteRecord: o }) && (a = r ? r(a, t) : "*".repeat(a.length)), a;
    }
    function nt(t) {
      return t.toLowerCase();
    }
    const zn = "__rrweb_original__";
    function Ji(t) {
      const e = t.type;
      return t.hasAttribute("data-rr-is-password") ? "password" : e ? nt(e) : null;
    }
    function On(t, e) {
      var i;
      let n;
      try {
        n = new URL(t, e != null ? e : window.location.href);
      } catch (o) {
        return null;
      }
      const s = n.pathname.match(/\.([0-9a-z]+)(?:$)/i);
      return (i = s == null ? void 0 : s[1]) != null ? i : null;
    }
    function Yi(t) {
      return t = ((t = t.replace(/[^ -~]+/g, "")) == null ? void 0 : t.split(" ").map((e) => Math.random().toString(20).substr(2, e.length)).join(" ")) || "";
    }
    function Ki(t) {
      return t === "img" || t === "video" || t === "audio" || t === "source";
    }
    const ar = [new RegExp(/[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*/), new RegExp(/[0-9]{9,16}/), new RegExp(/[0-9]{3}-?[0-9]{2}-?[0-9]{4}/), new RegExp(/[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/), new RegExp(/[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}/), new RegExp(/[0-9]{1,5}.?[0-9]{0,3}\s[a-zA-Z]{2,30}\s[a-zA-Z]{2,15}/), new RegExp(/(?:[0-9]{1,3}.){3}[0-9]{1,3}/)];
    function Pn(t) {
      return !!t && ar.some((e) => e.test(t));
    }
    const Bn = ({ maskInputOptions: t, tagName: e, type: i, overwriteRecord: n }) => {
      const s = i && i.toLowerCase();
      return !(n === "true" || !t[e.toLowerCase()] && (!s || !t[s]));
    };
    let cr = 1;
    const dr = new RegExp("[^a-z0-9-_:]"), Vt = -2;
    function Dn() {
      return cr++;
    }
    let st, Qn;
    const ur = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, hr = /^(?:[a-z+]+:)?\/\//i, pr = /^www\..*/i, mr = /^(data:)([^,]*),(.*)/i;
    function Dt(t, e) {
      return (t || "").replace(ur, (i, n, s, o, r, a) => {
        const l = s || r || a, c = n || o || "";
        if (!l)
          return i;
        if (hr.test(l) || pr.test(l))
          return `url(${c}${l}${c})`;
        if (mr.test(l))
          return `url(${c}${l}${c})`;
        if (l[0] === "/")
          return `url(${c}${function(p) {
            let m = "";
            return m = p.indexOf("//") > -1 ? p.split("/").slice(0, 3).join("/") : p.split("/")[0], m = m.split("?")[0], m;
          }(e) + l}${c})`;
        const d = e.split("/"), h = l.split("/");
        d.pop();
        for (const p of h)
          p !== "." && (p === ".." ? d.pop() : d.push(p));
        return `url(${c}${d.join("/")}${c})`;
      });
    }
    const br = /^[^ \t\n\r\u000c]+/, Zr = /^[, \t\n\r\u000c]+/, jn = /* @__PURE__ */ new WeakMap();
    function Gt(t, e) {
      return e && e.trim() !== "" ? Qt(t, e) : e;
    }
    function yr(t) {
      return !!(t.tagName === "svg" || t.ownerSVGElement);
    }
    function Qt(t, e) {
      let i = jn.get(t);
      if (i || (i = t.createElement("a"), jn.set(t, i)), e) {
        if (e.startsWith("blob:") || e.startsWith("data:"))
          return e;
      } else
        e = "";
      return i.setAttribute("href", e), i.href;
    }
    function An(t, e, i, n) {
      return n && (i === "src" || i === "href" && (e !== "use" || n[0] !== "#") || i === "xlink:href" && n[0] !== "#" ? Gt(t, n) : i !== "background" || e !== "table" && e !== "td" && e !== "th" ? i === "srcset" ? function(s, o) {
        if (o.trim() === "")
          return o;
        let r = 0;
        function a(c) {
          let d;
          const h = c.exec(o.substring(r));
          return h ? (d = h[0], r += d.length, d) : "";
        }
        const l = [];
        for (; a(Zr), !(r >= o.length); ) {
          let c = a(br);
          if (c.slice(-1) === ",")
            c = Gt(s, c.substring(0, c.length - 1)), l.push(c);
          else {
            let d = "";
            c = Gt(s, c);
            let h = !1;
            for (; ; ) {
              const p = o.charAt(r);
              if (p === "") {
                l.push((c + d).trim());
                break;
              }
              if (h)
                p === ")" && (h = !1);
              else {
                if (p === ",") {
                  r += 1, l.push((c + d).trim());
                  break;
                }
                p === "(" && (h = !0);
              }
              d += p, r += 1;
            }
          }
        }
        return l.join(", ");
      }(t, n) : i === "style" ? Dt(n, Qt(t)) : e === "object" && i === "data" ? Gt(t, n) : n : Gt(t, n));
    }
    function _n(t, e, i) {
      return (t === "video" || t === "audio") && e === "autoplay";
    }
    function qn(t, e, i) {
      try {
        if (typeof e == "string") {
          if (t.classList.contains(e))
            return !0;
        } else
          for (let n = t.classList.length; n--; ) {
            const s = t.classList[n];
            if (e.test(s))
              return !0;
          }
        if (i)
          return t.matches(i);
      } catch (n) {
      }
      return !1;
    }
    function jt(t, e, i) {
      if (!t)
        return !1;
      if (t.nodeType !== t.ELEMENT_NODE)
        return !!i && jt(Pt(t), e, i);
      for (let n = t.classList.length; n--; ) {
        const s = t.classList[n];
        if (e.test(s))
          return !0;
      }
      return !!i && jt(Pt(t), e, i);
    }
    function $n(t, e, i, n) {
      let s;
      if (Hn(t)) {
        if (s = t, !Ti(s).length)
          return !1;
      } else {
        if (wi(t) === null)
          return !1;
        s = wi(t);
      }
      try {
        if (typeof e == "string") {
          if (n) {
            if (s.closest(`.${e}`))
              return !0;
          } else if (s.classList.contains(e))
            return !0;
        } else if (jt(s, e, n))
          return !0;
        if (i) {
          if (n) {
            if (s.closest(i))
              return !0;
          } else if (s.matches(i))
            return !0;
        }
      } catch (o) {
      }
      return !1;
    }
    function gr(t, e) {
      const { doc: i, mirror: n, blockClass: s, blockSelector: o, needsMask: r, inlineStylesheet: a, maskInputOptions: l = {}, maskTextClass: c, maskTextFn: d, maskInputFn: h, dataURLOptions: p = {}, inlineImages: m, recordCanvas: X, keepIframeSrcFn: Z, newlyAddedElement: V = !1, privacySetting: y } = e, g = function(b, I) {
        if (!I.hasNode(b))
          return;
        const R = I.getId(b);
        return R === 1 ? void 0 : R;
      }(i, n);
      switch (t.nodeType) {
        case t.DOCUMENT_NODE:
          return t.compatMode !== "CSS1Compat" ? { type: ae.Document, childNodes: [], compatMode: t.compatMode } : { type: ae.Document, childNodes: [] };
        case t.DOCUMENT_TYPE_NODE:
          return { type: ae.DocumentType, name: t.name, publicId: t.publicId, systemId: t.systemId, rootId: g };
        case t.ELEMENT_NODE:
          return function(b, I) {
            const { doc: R, blockClass: L, blockSelector: F, inlineStylesheet: H, maskInputOptions: x = {}, maskInputFn: N, maskTextClass: K, dataURLOptions: k = {}, inlineImages: u, recordCanvas: G, keepIframeSrcFn: v, newlyAddedElement: f = !1, privacySetting: M, rootId: S } = I;
            let T = qn(b, L, F);
            const $ = qn(b, K, null), A = M === "strict";
            let B = function(J) {
              if (J instanceof HTMLFormElement)
                return "form";
              const P = nt(J.tagName);
              return dr.test(P) ? "div" : P;
            }(b), z = {};
            const Ie = b.attributes.length;
            for (let J = 0; J < Ie; J++) {
              const P = b.attributes[J];
              _n(B, P.name) || (z[P.name] = An(R, B, nt(P.name), P.value));
            }
            if (B === "link" && H) {
              const J = Array.from(R.styleSheets).find((ue) => ue.href === b.href);
              let P = null;
              J && (P = Bt(J)), P && (delete z.rel, delete z.href, z._cssText = Dt(P, J.href));
            }
            if (B === "style" && b.sheet && !(b.innerText || Ni(b) || "").trim().length) {
              const J = Bt(b.sheet);
              J && (z._cssText = Dt(J, Qt(R)));
            }
            if (B === "input" || B === "textarea" || B === "select") {
              const J = b.value, P = b.checked;
              z.type !== "radio" && z.type !== "checkbox" && z.type !== "submit" && z.type !== "button" && J ? z.value = xi({ element: b, type: Ji(b), tagName: B, value: J, overwriteRecord: b.getAttribute("data-hl-record"), maskInputOptions: x, maskInputFn: N }) : P && (z.checked = P);
            }
            if (B === "option" && (b.selected && !x.select ? z.selected = !0 : delete z.selected), B === "canvas" && G) {
              if (b.__context === "2d")
                (function(J) {
                  const P = J.getContext("2d");
                  if (!P)
                    return !0;
                  for (let ue = 0; ue < J.width; ue += 50)
                    for (let pe = 0; pe < J.height; pe += 50) {
                      const Pe = P.getImageData, Ft = zn in Pe ? Pe[zn] : Pe;
                      if (new Uint32Array(Ft.call(P, ue, pe, Math.min(50, J.width - ue), Math.min(50, J.height - pe)).data.buffer).some((Wi) => Wi !== 0))
                        return !1;
                    }
                  return !0;
                })(b) || (z.rr_dataURL = b.toDataURL(k.type, k.quality));
              else if (!("__context" in b)) {
                const J = b.toDataURL(k.type, k.quality), P = R.createElement("canvas");
                P.width = b.width, P.height = b.height, J !== P.toDataURL(k.type, k.quality) && (z.rr_dataURL = J);
              }
            }
            if (B === "img" && u && !T && !$ && !A) {
              st || (st = R.createElement("canvas"), Qn = st.getContext("2d"));
              const J = b, P = J.currentSrc || J.getAttribute("src") || "<unknown-src>", ue = J.crossOrigin, pe = () => {
                J.removeEventListener("load", pe);
                try {
                  st.width = J.naturalWidth, st.height = J.naturalHeight, Qn.drawImage(J, 0, 0), z.rr_dataURL = st.toDataURL(k.type, k.quality);
                } catch (Pe) {
                  if (J.crossOrigin !== "anonymous")
                    return J.crossOrigin = "anonymous", void (J.complete && J.naturalWidth !== 0 ? pe() : J.addEventListener("load", pe));
                  console.warn(`Cannot inline img src=${P}! Error: ${Pe}`);
                }
                J.crossOrigin === "anonymous" && (ue ? z.crossOrigin = ue : J.removeAttribute("crossorigin"));
              };
              J.complete && J.naturalWidth !== 0 ? pe() : J.addEventListener("load", pe);
            }
            if (B === "audio" || B === "video") {
              const J = z;
              J.rr_mediaState = b.paused ? "paused" : "played", J.rr_mediaCurrentTime = b.currentTime, J.rr_mediaPlaybackRate = b.playbackRate, J.rr_mediaMuted = b.muted, J.rr_mediaLoop = b.loop, J.rr_mediaVolume = b.volume;
            }
            if (f || (b.scrollLeft && (z.rr_scrollLeft = b.scrollLeft), b.scrollTop && (z.rr_scrollTop = b.scrollTop)), T || $ || A && Ki(B)) {
              const { width: J, height: P } = b.getBoundingClientRect();
              z = { class: z.class, rr_width: `${J}px`, rr_height: `${P}px` };
            }
            A && Ki(B) && (T = !0), B !== "iframe" || v(z.src) || (b.contentDocument || (z.rr_src = z.src), delete z.src);
            let be;
            try {
              customElements.get(B) && (be = !0);
            } catch (J) {
            }
            if (u && B === "video") {
              const J = b;
              if (J.src === "" || J.src.indexOf("blob:") !== -1) {
                const { width: P, height: ue } = b.getBoundingClientRect();
                z = { width: P, height: ue, rr_width: `${P}px`, rr_height: `${ue}px`, rr_inlined_video: !0 }, B = "canvas";
                const pe = R.createElement("canvas");
                pe.width = b.width, pe.height = b.height, z.rr_dataURL = pe.toDataURL(k.type, k.quality);
              }
            }
            return { type: ae.Element, tagName: B, attributes: z, childNodes: [], isSVG: yr(b) || void 0, needBlock: T, needMask: $, rootId: S, isCustom: be };
          }(t, { doc: i, blockClass: s, blockSelector: o, inlineStylesheet: a, maskInputOptions: l, maskInputFn: h, maskTextClass: c, dataURLOptions: p, inlineImages: m, recordCanvas: X, keepIframeSrcFn: Z, newlyAddedElement: V, privacySetting: y, rootId: g });
        case t.TEXT_NODE:
          return function(b, I) {
            var R, L;
            const { needsMask: F, maskTextFn: H, privacySetting: x, rootId: N } = I, K = Pt(b), k = K && K.tagName;
            let u = Ni(b);
            const G = k === "STYLE" || void 0, v = k === "SCRIPT" || void 0;
            let f = !1;
            if (G && u) {
              try {
                b.nextSibling || b.previousSibling || (R = K.sheet) != null && R.cssRules && (u = Bt(K.sheet));
              } catch ($) {
                console.warn(`Cannot get CSS styles from text's parentNode. Error: ${$}`, b);
              }
              u = Dt(u, Qt(I.doc)), f = !0;
            }
            v ? (u = "SCRIPT_PLACEHOLDER", f = !0) : k === "NOSCRIPT" && (u = "", f = !0), !G && !v && u && F && (u = H ? H(u, wi(b)) : u.replace(/[\S]/g, "*"));
            const M = x === "strict", S = (L = b.parentElement) == null ? void 0 : L.getAttribute("data-hl-record"), T = x === "default" && Pn(u);
            return (M || T) && !S && !f && k && !(/* @__PURE__ */ new Set(["HEAD", "TITLE", "STYLE", "SCRIPT", "HTML", "BODY", "NOSCRIPT"])).has(k) && u && (u = Yi(u)), { type: ae.Text, textContent: u || "", isStyle: G, rootId: N };
          }(t, { doc: i, needsMask: r, maskTextFn: d, privacySetting: y, rootId: g });
        case t.CDATA_SECTION_NODE:
          return { type: ae.CDATA, textContent: "", rootId: g };
        case t.COMMENT_NODE:
          return { type: ae.Comment, textContent: Ni(t) || "", rootId: g };
        default:
          return !1;
      }
    }
    function te(t) {
      return t == null ? "" : t.toLowerCase();
    }
    function ot(t, e) {
      const { doc: i, mirror: n, blockClass: s, blockSelector: o, maskTextClass: r, maskTextSelector: a, skipChild: l = !1, inlineStylesheet: c = !0, maskInputOptions: d = {}, maskTextFn: h, maskInputFn: p, slimDOMOptions: m, dataURLOptions: X = {}, inlineImages: Z = !1, recordCanvas: V = !1, onSerialize: y, onIframeLoad: g, iframeLoadTimeout: b = 5e3, onStylesheetLoad: I, stylesheetLoadTimeout: R = 5e3, keepIframeSrcFn: L = () => !1, newlyAddedElement: F = !1, privacySetting: H } = e;
      let { needsMask: x } = e, { preserveWhiteSpace: N = !0 } = e;
      x || (x = $n(t, r, a, x === void 0));
      const K = gr(t, { doc: i, mirror: n, blockClass: s, blockSelector: o, needsMask: x, inlineStylesheet: c, maskInputOptions: d, maskTextClass: r, maskTextFn: h, maskInputFn: p, dataURLOptions: X, inlineImages: Z, recordCanvas: V, keepIframeSrcFn: L, newlyAddedElement: F, privacySetting: H });
      if (!K)
        return console.warn(t, "not serialized"), null;
      let k;
      k = n.hasNode(t) ? n.getId(t) : !function(S, T) {
        return !!(T.comment && S.type === ae.Comment || S.type === ae.Element && (T.script && (S.tagName === "script" || S.tagName === "link" && (S.attributes.rel === "preload" || S.attributes.rel === "modulepreload") && S.attributes.as === "script" || S.tagName === "link" && S.attributes.rel === "prefetch" && typeof S.attributes.href == "string" && On(S.attributes.href) === "js") || T.headFavicon && (S.tagName === "link" && S.attributes.rel === "shortcut icon" || S.tagName === "meta" && (te(S.attributes.name).match(/^msapplication-tile(image|color)$/) || te(S.attributes.name) === "application-name" || te(S.attributes.rel) === "icon" || te(S.attributes.rel) === "apple-touch-icon" || te(S.attributes.rel) === "shortcut icon")) || S.tagName === "meta" && (T.headMetaDescKeywords && te(S.attributes.name).match(/^description|keywords$/) || T.headMetaSocial && (te(S.attributes.property).match(/^(og|twitter|fb):/) || te(S.attributes.name).match(/^(og|twitter):/) || te(S.attributes.name) === "pinterest") || T.headMetaRobots && (te(S.attributes.name) === "robots" || te(S.attributes.name) === "googlebot" || te(S.attributes.name) === "bingbot") || T.headMetaHttpEquiv && S.attributes["http-equiv"] !== void 0 || T.headMetaAuthorship && (te(S.attributes.name) === "author" || te(S.attributes.name) === "generator" || te(S.attributes.name) === "framework" || te(S.attributes.name) === "publisher" || te(S.attributes.name) === "progid" || te(S.attributes.property).match(/^article:/) || te(S.attributes.property).match(/^product:/)) || T.headMetaVerification && (te(S.attributes.name) === "google-site-verification" || te(S.attributes.name) === "yandex-verification" || te(S.attributes.name) === "csrf-token" || te(S.attributes.name) === "p:domain_verify" || te(S.attributes.name) === "verify-v1" || te(S.attributes.name) === "verification" || te(S.attributes.name) === "shopify-checkout-api-token"))));
      }(K, m) && (N || K.type !== ae.Text || K.isStyle || K.textContent.replace(/^\s+|\s+$/gm, "").length) ? Dn() : Vt;
      const u = Object.assign(K, { id: k });
      if (n.add(t, u), k === Vt)
        return null;
      y && y(t);
      let G = !l, v = H, f = H === "strict";
      if (u.type === ae.Element) {
        if (G = G && !u.needBlock, f || (f = !!u.needBlock || !!u.needMask), v = f ? "strict" : v, f && Ki(u.tagName)) {
          const T = t.cloneNode();
          T.src = "", n.add(T, u);
        }
        delete u.needBlock, delete u.needMask;
        const S = Li(t);
        S && Xt(S) && (u.isShadowHost = !0);
      }
      if ((u.type === ae.Document || u.type === ae.Element) && G) {
        m.headWhitespace && u.type === ae.Element && u.tagName === "head" && (N = !1);
        const S = { doc: i, mirror: n, blockClass: s, blockSelector: o, needsMask: x, maskTextClass: r, maskTextSelector: a, skipChild: l, inlineStylesheet: c, maskInputOptions: d, maskTextFn: h, maskInputFn: p, slimDOMOptions: m, dataURLOptions: X, inlineImages: Z, recordCanvas: V, preserveWhiteSpace: N, onSerialize: y, onIframeLoad: g, iframeLoadTimeout: b, onStylesheetLoad: I, stylesheetLoadTimeout: R, keepIframeSrcFn: L, privacySetting: v };
        if (!(u.type === ae.Element && u.tagName === "textarea" && u.attributes.value !== void 0))
          for (const $ of Array.from(Ti(t))) {
            const A = ot($, S);
            A && u.childNodes.push(A);
          }
        let T = null;
        if (Hn(t) && (T = Li(t)))
          for (const $ of Array.from(Ti(T))) {
            const A = ot($, S);
            A && (Xt(T) && (A.isShadow = !0), u.childNodes.push(A));
          }
      }
      const M = Pt(t);
      return M && St(M) && Xt(M) && (u.isShadow = !0), u.type === ae.Element && u.tagName === "iframe" && function(S, T, $) {
        const A = S.contentWindow;
        if (!A)
          return;
        let B, z = !1;
        try {
          B = A.document.readyState;
        } catch (be) {
          return;
        }
        if (B !== "complete") {
          const be = setTimeout(() => {
            z || (T(), z = !0);
          }, $);
          return void S.addEventListener("load", () => {
            clearTimeout(be), z = !0, T();
          });
        }
        const Ie = "about:blank";
        if (A.location.href !== Ie || S.src === Ie || S.src === "")
          return setTimeout(T, 0), S.addEventListener("load", T);
        S.addEventListener("load", T);
      }(t, () => {
        const S = t.contentDocument;
        if (S && g) {
          const T = ot(S, { doc: S, mirror: n, blockClass: s, blockSelector: o, needsMask: x, maskTextClass: r, maskTextSelector: a, skipChild: !1, inlineStylesheet: c, maskInputOptions: d, maskTextFn: h, maskInputFn: p, slimDOMOptions: m, dataURLOptions: X, inlineImages: Z, recordCanvas: V, preserveWhiteSpace: N, onSerialize: y, onIframeLoad: g, iframeLoadTimeout: b, onStylesheetLoad: I, stylesheetLoadTimeout: R, keepIframeSrcFn: L, privacySetting: H });
          T && g(t, T);
        }
      }, b), u.type === ae.Element && u.tagName === "link" && typeof u.attributes.rel == "string" && (u.attributes.rel === "stylesheet" || u.attributes.rel === "preload" && typeof u.attributes.href == "string" && On(u.attributes.href) === "css") && function(S, T, $) {
        let A, B = !1;
        try {
          A = S.sheet;
        } catch (Ie) {
          return;
        }
        if (A)
          return;
        const z = setTimeout(() => {
          B || (T(), B = !0);
        }, $);
        S.addEventListener("load", () => {
          clearTimeout(z), B = !0, T();
        });
      }(t, () => {
        if (I) {
          const S = ot(t, { doc: i, mirror: n, blockClass: s, blockSelector: o, needsMask: x, maskTextClass: r, maskTextSelector: a, skipChild: !1, inlineStylesheet: c, maskInputOptions: d, maskTextFn: h, maskInputFn: p, slimDOMOptions: m, dataURLOptions: X, inlineImages: Z, recordCanvas: V, preserveWhiteSpace: N, onSerialize: y, onIframeLoad: g, iframeLoadTimeout: b, onStylesheetLoad: I, stylesheetLoadTimeout: R, keepIframeSrcFn: L, privacySetting: H });
          S && I(t, S);
        }
      }, R), u;
    }
    var Ir = Object.defineProperty, fe = (t, e, i) => (((n, s, o) => {
      s in n ? Ir(n, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[s] = o;
    })(t, typeof e != "symbol" ? e + "" : e, i), i);
    class Ui {
      constructor(...e) {
        fe(this, "parentElement", null), fe(this, "parentNode", null), fe(this, "ownerDocument"), fe(this, "firstChild", null), fe(this, "lastChild", null), fe(this, "previousSibling", null), fe(this, "nextSibling", null), fe(this, "ELEMENT_NODE", 1), fe(this, "TEXT_NODE", 3), fe(this, "nodeType"), fe(this, "nodeName"), fe(this, "RRNodeType");
      }
      get childNodes() {
        const e = [];
        let i = this.firstChild;
        for (; i; )
          e.push(i), i = i.nextSibling;
        return e;
      }
      contains(e) {
        if (!(e instanceof Ui) || e.ownerDocument !== this.ownerDocument)
          return !1;
        if (e === this)
          return !0;
        for (; e.parentNode; ) {
          if (e.parentNode === this)
            return !0;
          e = e.parentNode;
        }
        return !1;
      }
      appendChild(e) {
        throw new Error("RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.");
      }
      insertBefore(e, i) {
        throw new Error("RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.");
      }
      removeChild(e) {
        throw new Error("RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.");
      }
      toString() {
        return "RRNode";
      }
    }
    const es = { Node: ["childNodes", "parentNode", "parentElement", "textContent"], ShadowRoot: ["host", "styleSheets"], Element: ["shadowRoot", "querySelector", "querySelectorAll"], MutationObserver: [] }, ts = { Node: ["contains", "getRootNode"], ShadowRoot: ["getSelection"], Element: [], MutationObserver: ["constructor"] }, At = {};
    function Fi(t) {
      if (At[t])
        return At[t];
      const e = globalThis[t], i = e.prototype, n = t in es ? es[t] : void 0, s = !!(n && n.every((a) => {
        var l, c;
        return !!((c = (l = Object.getOwnPropertyDescriptor(i, a)) == null ? void 0 : l.get) != null && c.toString().includes("[native code]"));
      })), o = t in ts ? ts[t] : void 0, r = !!(o && o.every((a) => {
        var l;
        return typeof i[a] == "function" && ((l = i[a]) == null ? void 0 : l.toString().includes("[native code]"));
      }));
      if (s && r)
        return At[t] = e.prototype, e.prototype;
      try {
        const a = document.createElement("iframe");
        document.body.appendChild(a);
        const l = a.contentWindow;
        if (!l)
          return e.prototype;
        const c = l[t].prototype;
        return document.body.removeChild(a), c ? At[t] = c : i;
      } catch (a) {
        return i;
      }
    }
    const Hi = {};
    function rt(t, e, i) {
      var n;
      const s = `${t}.${String(i)}`;
      if (Hi[s])
        return Hi[s].call(e);
      const o = Fi(t), r = (n = Object.getOwnPropertyDescriptor(o, i)) == null ? void 0 : n.get;
      return r ? (Hi[s] = r, r.call(e)) : e[i];
    }
    const Ei = {};
    function is(t, e, i) {
      const n = `${t}.${String(i)}`;
      if (Ei[n])
        return Ei[n].bind(e);
      const s = Fi(t)[i];
      return typeof s != "function" ? e[i] : (Ei[n] = s, s.bind(e));
    }
    function _t(t) {
      return rt("Node", t, "childNodes");
    }
    function xe(t) {
      return rt("Node", t, "parentNode");
    }
    function qt(t) {
      return rt("Node", t, "parentElement");
    }
    function ns(t) {
      return rt("Node", t, "textContent");
    }
    function ss(t, e) {
      return is("Node", t, "contains")(e);
    }
    function Mi(t) {
      return is("Node", t, "getRootNode")();
    }
    function lt(t) {
      return t && "host" in t ? rt("ShadowRoot", t, "host") : null;
    }
    function Wt(t) {
      return t && "shadowRoot" in t ? rt("Element", t, "shadowRoot") : null;
    }
    function Ze(t, e, i = document) {
      const n = { capture: !0 };
      return i.addEventListener(t, e, n), () => i.removeEventListener(t, e, n);
    }
    const at = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
    let os = { map: {}, getId: () => (console.error(at), -1), getNode: () => (console.error(at), null), removeNodeFromMap() {
      console.error(at);
    }, has: () => (console.error(at), !1), reset() {
      console.error(at);
    } };
    function ft(t, e, i = {}) {
      let n = null, s = 0;
      return function(...o) {
        const r = Date.now();
        s || i.leading !== !1 || (s = r);
        const a = e - (r - s), l = this;
        a <= 0 || a > e ? (n && (clearTimeout(n), n = null), s = r, t.apply(l, o)) : n || i.trailing === !1 || (n = setTimeout(() => {
          s = i.leading === !1 ? 0 : Date.now(), n = null, t.apply(l, o);
        }, a));
      };
    }
    function $t(t, e, i, n, s = window) {
      const o = s.Object.getOwnPropertyDescriptor(t, e);
      return s.Object.defineProperty(t, e, n ? i : { set(r) {
        setTimeout(() => {
          i.set.call(this, r);
        }, 0), o && o.set && o.set.call(this, r);
      } }), () => $t(t, e, o || {}, !0);
    }
    function ct(t, e, i) {
      try {
        if (!(e in t))
          return () => {
          };
        const n = t[e], s = i(n);
        return typeof s == "function" && (s.prototype = s.prototype || {}, Object.defineProperties(s, { __rrweb_original__: { enumerable: !1, value: n } })), t[e] = s, () => {
          t[e] = n;
        };
      } catch (n) {
        return () => {
        };
      }
    }
    typeof window != "undefined" && window.Proxy && window.Reflect && (os = new Proxy(os, { get: (t, e, i) => (e === "map" && console.error(at), Reflect.get(t, e, i)) }));
    let ei = Date.now;
    function rs(t) {
      var e, i, n, s;
      const o = t.document;
      return { left: o.scrollingElement ? o.scrollingElement.scrollLeft : t.pageXOffset !== void 0 ? t.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((e = qt(o.body)) == null ? void 0 : e.scrollLeft) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollLeft) || 0, top: o.scrollingElement ? o.scrollingElement.scrollTop : t.pageYOffset !== void 0 ? t.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = qt(o.body)) == null ? void 0 : n.scrollTop) || ((s = o == null ? void 0 : o.body) == null ? void 0 : s.scrollTop) || 0 };
    }
    function ls() {
      return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
    }
    function as() {
      return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
    }
    function cs(t) {
      return t ? t.nodeType === t.ELEMENT_NODE ? t : qt(t) : null;
    }
    /[1-9][0-9]{12}/.test(Date.now().toString()) || (ei = () => (/* @__PURE__ */ new Date()).getTime());
    const Sr = (t) => {
      try {
        if (t instanceof HTMLElement)
          return t.tagName === "CANVAS";
      } catch (e) {
        return !1;
      }
      return !1;
    };
    function me(t, e, i, n) {
      if (!t)
        return !1;
      const s = cs(t);
      if (!s)
        return !1;
      try {
        if (typeof e == "string") {
          if (s.classList.contains(e) || n && s.closest("." + e) !== null)
            return !0;
        } else if (jt(s, e, n))
          return !0;
      } catch (o) {
      }
      return !!(i && (s.matches(i) || n && s.closest(i) !== null));
    }
    function zi(t, e, i) {
      return !(t.tagName !== "TITLE" || !i.headTitleMutations) || e.getId(t) === Vt;
    }
    function ds(t, e) {
      if (St(t))
        return !1;
      const i = e.getId(t);
      if (!e.has(i))
        return !0;
      const n = xe(t);
      return (!n || n.nodeType !== t.DOCUMENT_NODE) && (!n || ds(n, e));
    }
    function Oi(t) {
      return !!t.changedTouches;
    }
    function us(t, e) {
      return !!(t.nodeName === "IFRAME" && e.getMeta(t));
    }
    function hs(t, e) {
      return !!(t.nodeName === "LINK" && t.nodeType === t.ELEMENT_NODE && t.getAttribute && t.getAttribute("rel") === "stylesheet" && e.getMeta(t));
    }
    function Pi(t) {
      return !!t && (t instanceof Ui && "shadowRoot" in t ? !!t.shadowRoot : !!Wt(t));
    }
    class Xr {
      constructor() {
        C(this, "id", 1), C(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), C(this, "idStyleMap", /* @__PURE__ */ new Map());
      }
      getId(e) {
        var i;
        return (i = this.styleIDMap.get(e)) != null ? i : -1;
      }
      has(e) {
        return this.styleIDMap.has(e);
      }
      add(e, i) {
        if (this.has(e))
          return this.getId(e);
        let n;
        return n = i === void 0 ? this.id++ : i, this.styleIDMap.set(e, n), this.idStyleMap.set(n, e), n;
      }
      getStyle(e) {
        return this.idStyleMap.get(e) || null;
      }
      reset() {
        this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
      }
      generateId() {
        return this.id++;
      }
    }
    function ps(t) {
      var e;
      let i = null;
      return "getRootNode" in t && ((e = Mi(t)) == null ? void 0 : e.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && lt(Mi(t)) && (i = lt(Mi(t))), i;
    }
    function Vr(t) {
      const e = t.ownerDocument;
      if (!e)
        return !1;
      const i = function(n) {
        let s, o = n;
        for (; s = ps(o); )
          o = s;
        return o;
      }(t);
      return ss(e, i);
    }
    function ms(t) {
      const e = t.ownerDocument;
      return !!e && (ss(e, t) || Vr(t));
    }
    var q = ((t) => (t[t.DomContentLoaded = 0] = "DomContentLoaded", t[t.Load = 1] = "Load", t[t.FullSnapshot = 2] = "FullSnapshot", t[t.IncrementalSnapshot = 3] = "IncrementalSnapshot", t[t.Meta = 4] = "Meta", t[t.Custom = 5] = "Custom", t[t.Plugin = 6] = "Plugin", t))(q || {}), j = ((t) => (t[t.Mutation = 0] = "Mutation", t[t.MouseMove = 1] = "MouseMove", t[t.MouseInteraction = 2] = "MouseInteraction", t[t.Scroll = 3] = "Scroll", t[t.ViewportResize = 4] = "ViewportResize", t[t.Input = 5] = "Input", t[t.TouchMove = 6] = "TouchMove", t[t.MediaInteraction = 7] = "MediaInteraction", t[t.StyleSheetRule = 8] = "StyleSheetRule", t[t.CanvasMutation = 9] = "CanvasMutation", t[t.Font = 10] = "Font", t[t.Log = 11] = "Log", t[t.Drag = 12] = "Drag", t[t.StyleDeclaration = 13] = "StyleDeclaration", t[t.Selection = 14] = "Selection", t[t.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", t[t.CustomElement = 16] = "CustomElement", t))(j || {}), Se = ((t) => (t[t.MouseUp = 0] = "MouseUp", t[t.MouseDown = 1] = "MouseDown", t[t.Click = 2] = "Click", t[t.ContextMenu = 3] = "ContextMenu", t[t.DblClick = 4] = "DblClick", t[t.Focus = 5] = "Focus", t[t.Blur = 6] = "Blur", t[t.TouchStart = 7] = "TouchStart", t[t.TouchMove_Departed = 8] = "TouchMove_Departed", t[t.TouchEnd = 9] = "TouchEnd", t[t.TouchCancel = 10] = "TouchCancel", t))(Se || {}), Me = ((t) => (t[t.Mouse = 0] = "Mouse", t[t.Pen = 1] = "Pen", t[t.Touch = 2] = "Touch", t))(Me || {}), dt = ((t) => (t[t["2D"] = 0] = "2D", t[t.WebGL = 1] = "WebGL", t[t.WebGL2 = 2] = "WebGL2", t))(dt || {}), ut = ((t) => (t[t.Play = 0] = "Play", t[t.Pause = 1] = "Pause", t[t.Seeked = 2] = "Seeked", t[t.VolumeChange = 3] = "VolumeChange", t[t.RateChange = 4] = "RateChange", t))(ut || {});
    function bs(t) {
      return "__ln" in t;
    }
    class Gr {
      constructor() {
        C(this, "length", 0), C(this, "head", null), C(this, "tail", null);
      }
      get(e) {
        if (e >= this.length)
          throw new Error("Position outside of list range");
        let i = this.head;
        for (let n = 0; n < e; n++)
          i = (i == null ? void 0 : i.next) || null;
        return i;
      }
      addNode(e) {
        const i = { value: e, previous: null, next: null };
        if (e.__ln = i, e.previousSibling && bs(e.previousSibling)) {
          const n = e.previousSibling.__ln.next;
          i.next = n, i.previous = e.previousSibling.__ln, e.previousSibling.__ln.next = i, n && (n.previous = i);
        } else if (e.nextSibling && bs(e.nextSibling) && e.nextSibling.__ln.previous) {
          const n = e.nextSibling.__ln.previous;
          i.previous = n, i.next = e.nextSibling.__ln, e.nextSibling.__ln.previous = i, n && (n.next = i);
        } else
          this.head && (this.head.previous = i), i.next = this.head, this.head = i;
        i.next === null && (this.tail = i), this.length++;
      }
      removeNode(e) {
        const i = e.__ln;
        this.head && (i.previous ? (i.previous.next = i.next, i.next ? i.next.previous = i.previous : this.tail = i.previous) : (this.head = i.next, this.head ? this.head.previous = null : this.tail = null), e.__ln && delete e.__ln, this.length--);
      }
    }
    const Zs = (t, e) => `${t}@${e}`;
    class Wr {
      constructor() {
        C(this, "frozen", !1), C(this, "locked", !1), C(this, "texts", []), C(this, "attributes", []), C(this, "attributeMap", /* @__PURE__ */ new WeakMap()), C(this, "removes", []), C(this, "mapRemoves", []), C(this, "movedMap", {}), C(this, "addedSet", /* @__PURE__ */ new Set()), C(this, "movedSet", /* @__PURE__ */ new Set()), C(this, "droppedSet", /* @__PURE__ */ new Set()), C(this, "mutationCb"), C(this, "blockClass"), C(this, "blockSelector"), C(this, "maskTextClass"), C(this, "maskTextSelector"), C(this, "inlineStylesheet"), C(this, "maskInputOptions"), C(this, "maskTextFn"), C(this, "maskInputFn"), C(this, "keepIframeSrcFn"), C(this, "recordCanvas"), C(this, "inlineImages"), C(this, "privacySetting"), C(this, "slimDOMOptions"), C(this, "dataURLOptions"), C(this, "doc"), C(this, "mirror"), C(this, "iframeManager"), C(this, "stylesheetManager"), C(this, "shadowDomManager"), C(this, "canvasManager"), C(this, "processedNodeManager"), C(this, "unattachedDoc"), C(this, "processMutations", (e) => {
          e.forEach(this.processMutation), this.emit();
        }), C(this, "emit", () => {
          if (this.frozen || this.locked)
            return;
          const e = [], i = /* @__PURE__ */ new Set(), n = new Gr(), s = (l) => {
            let c = l, d = Vt;
            for (; d === Vt; )
              c = c && c.nextSibling, d = c && this.mirror.getId(c);
            return d;
          }, o = (l) => {
            const c = xe(l);
            if (!c || !ms(l) || c.tagName === "TEXTAREA")
              return;
            const d = St(c) ? this.mirror.getId(ps(l)) : this.mirror.getId(c), h = s(l);
            if (d === -1 || h === -1)
              return n.addNode(l);
            const p = ot(l, { doc: this.doc, mirror: this.mirror, blockClass: this.blockClass, blockSelector: this.blockSelector, maskTextClass: this.maskTextClass, maskTextSelector: this.maskTextSelector, skipChild: !0, newlyAddedElement: !0, inlineStylesheet: this.inlineStylesheet, maskInputOptions: this.maskInputOptions, maskTextFn: this.maskTextFn, maskInputFn: this.maskInputFn, slimDOMOptions: this.slimDOMOptions, dataURLOptions: this.dataURLOptions, recordCanvas: this.recordCanvas, inlineImages: this.inlineImages, privacySetting: this.privacySetting, onSerialize: (m) => {
              us(m, this.mirror) && this.iframeManager.addIframe(m), hs(m, this.mirror) && this.stylesheetManager.trackLinkElement(m), Pi(l) && this.shadowDomManager.addShadowRoot(Wt(l), this.doc);
            }, onIframeLoad: (m, X) => {
              this.iframeManager.attachIframe(m, X), this.shadowDomManager.observeAttachShadow(m);
            }, onStylesheetLoad: (m, X) => {
              this.stylesheetManager.attachLinkElement(m, X);
            } });
            p && (e.push({ parentId: d, nextId: h, node: p }), i.add(p.id));
          };
          for (; this.mapRemoves.length; )
            this.mirror.removeNodeFromMap(this.mapRemoves.shift());
          for (const l of this.movedSet)
            ys(this.removes, l, this.mirror) && !this.movedSet.has(xe(l)) || o(l);
          for (const l of this.addedSet)
            gs(this.droppedSet, l) || ys(this.removes, l, this.mirror) ? gs(this.movedSet, l) ? o(l) : this.droppedSet.add(l) : o(l);
          let r = null;
          for (; n.length; ) {
            let l = null;
            if (r) {
              const c = this.mirror.getId(xe(r.value)), d = s(r.value);
              c !== -1 && d !== -1 && (l = r);
            }
            if (!l) {
              let c = n.tail;
              for (; c; ) {
                const d = c;
                if (c = c.previous, d) {
                  const h = this.mirror.getId(xe(d.value));
                  if (s(d.value) === -1)
                    continue;
                  if (h !== -1) {
                    l = d;
                    break;
                  }
                  {
                    const p = xe(d.value);
                    if (p && p.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                      const m = lt(p);
                      if (this.mirror.getId(m) !== -1) {
                        l = d;
                        break;
                      }
                    }
                  }
                }
              }
            }
            if (!l) {
              for (; n.head; )
                n.removeNode(n.head.value);
              break;
            }
            r = l.previous, n.removeNode(l.value), o(l.value);
          }
          const a = { texts: this.texts.map((l) => {
            var c, d;
            const h = l.node, p = xe(h);
            p && p.tagName === "TEXTAREA" && this.genTextAreaValueMutation(p);
            let m = l.value;
            const X = this.privacySetting === "strict", Z = this.privacySetting === "default" && Pn(m), V = (d = (c = l.node) == null ? void 0 : c.parentElement) == null ? void 0 : d.getAttribute("data-hl-record");
            return (X || Z) && !V && m && (m = Yi(m)), { id: this.mirror.getId(h), value: m };
          }).filter((l) => !i.has(l.id)).filter((l) => this.mirror.has(l.id)), attributes: this.attributes.map((l) => {
            const { attributes: c } = l;
            if (typeof c.style == "string") {
              const d = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
              d.length < c.style.length && (d + h).split("var(").length === c.style.split("var(").length && (c.style = l.styleDiff);
            }
            return { id: this.mirror.getId(l.node), attributes: c };
          }).filter((l) => !i.has(l.id)).filter((l) => this.mirror.has(l.id)), removes: this.removes, adds: e };
          (a.texts.length || a.attributes.length || a.removes.length || a.adds.length) && (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(a));
        }), C(this, "genTextAreaValueMutation", (e) => {
          let i = this.attributeMap.get(e);
          i || (i = { node: e, attributes: {}, styleDiff: {}, _unchangedStyles: {} }, this.attributes.push(i), this.attributeMap.set(e, i)), i.attributes.value = Array.from(_t(e), (n) => ns(n) || "").join("");
        }), C(this, "processMutation", (e) => {
          if (!zi(e.target, this.mirror, this.slimDOMOptions))
            switch (e.type) {
              case "characterData": {
                const i = ns(e.target);
                me(e.target, this.blockClass, this.blockSelector, !1) || i === e.oldValue || this.texts.push({ value: $n(e.target, this.maskTextClass, this.maskTextSelector, !0) && i ? this.maskTextFn ? this.maskTextFn(i, cs(e.target)) : i.replace(/[\S]/g, "*") : i, node: e.target });
                break;
              }
              case "attributes": {
                const i = e.target;
                let n = e.attributeName, s = e.target.getAttribute(n);
                if (n === "value") {
                  const r = Ji(i);
                  s = xi({ element: i, maskInputOptions: this.maskInputOptions, tagName: i.tagName, type: r, value: s, overwriteRecord: i.getAttribute("data-hl-record"), maskInputFn: this.maskInputFn });
                }
                if (me(e.target, this.blockClass, this.blockSelector, !1) || s === e.oldValue)
                  return;
                let o = this.attributeMap.get(e.target);
                if (i.tagName === "IFRAME" && n === "src" && !this.keepIframeSrcFn(s)) {
                  if (i.contentDocument)
                    return;
                  n = "rr_src";
                }
                if (o || (o = { node: e.target, attributes: {}, styleDiff: {}, _unchangedStyles: {} }, this.attributes.push(o), this.attributeMap.set(e.target, o)), n === "type" && i.tagName === "INPUT" && (e.oldValue || "").toLowerCase() === "password" && i.setAttribute("data-rr-is-password", "true"), !_n(i.tagName, n)) {
                  if (e.target.tagName === "INPUT") {
                    const r = e.target;
                    if (r.type === "password") {
                      o.attributes.value = "*".repeat(r.value.length);
                      break;
                    }
                  }
                  if (o.attributes[n] = An(this.doc, nt(i.tagName), nt(n), s), n === "style") {
                    if (!this.unattachedDoc)
                      try {
                        this.unattachedDoc = document.implementation.createHTMLDocument();
                      } catch (a) {
                        this.unattachedDoc = this.doc;
                      }
                    const r = this.unattachedDoc.createElement("span");
                    e.oldValue && r.setAttribute("style", e.oldValue);
                    for (const a of Array.from(i.style)) {
                      const l = i.style.getPropertyValue(a), c = i.style.getPropertyPriority(a);
                      l !== r.style.getPropertyValue(a) || c !== r.style.getPropertyPriority(a) ? o.styleDiff[a] = c === "" ? l : [l, c] : o._unchangedStyles[a] = [l, c];
                    }
                    for (const a of Array.from(r.style))
                      i.style.getPropertyValue(a) === "" && (o.styleDiff[a] = !1);
                  }
                }
                break;
              }
              case "childList":
                if (me(e.target, this.blockClass, this.blockSelector, !0))
                  return;
                if (e.target.tagName === "TEXTAREA")
                  return void this.genTextAreaValueMutation(e.target);
                e.addedNodes.forEach((i) => this.genAdds(i, e.target)), e.removedNodes.forEach((i) => {
                  const n = this.mirror.getId(i), s = St(e.target) ? this.mirror.getId(lt(e.target)) : this.mirror.getId(e.target);
                  me(e.target, this.blockClass, this.blockSelector, !1) || zi(i, this.mirror, this.slimDOMOptions) || !function(o, r) {
                    return r.getId(o) !== -1;
                  }(i, this.mirror) || (this.addedSet.has(i) ? (Bi(this.addedSet, i), this.droppedSet.add(i)) : this.addedSet.has(e.target) && n === -1 || ds(e.target, this.mirror) || (this.movedSet.has(i) && this.movedMap[Zs(n, s)] ? Bi(this.movedSet, i) : this.removes.push({ parentId: s, id: n, isShadow: !(!St(e.target) || !Xt(e.target)) || void 0 })), this.mapRemoves.push(i));
                });
            }
        }), C(this, "genAdds", (e, i) => {
          if (!this.processedNodeManager.inOtherBuffer(e, this) && !this.addedSet.has(e) && !this.movedSet.has(e)) {
            if (this.mirror.hasNode(e)) {
              if (zi(e, this.mirror, this.slimDOMOptions))
                return;
              this.movedSet.add(e);
              let n = null;
              i && this.mirror.hasNode(i) && (n = this.mirror.getId(i)), n && n !== -1 && (this.movedMap[Zs(this.mirror.getId(e), n)] = !0);
            } else
              this.addedSet.add(e), this.droppedSet.delete(e);
            me(e, this.blockClass, this.blockSelector, !1) || (_t(e).forEach((n) => this.genAdds(n)), Pi(e) && _t(Wt(e)).forEach((n) => {
              this.processedNodeManager.add(n, this), this.genAdds(n, e);
            }));
          }
        });
      }
      init(e) {
        ["mutationCb", "blockClass", "blockSelector", "maskTextClass", "maskTextSelector", "inlineStylesheet", "maskInputOptions", "maskTextFn", "maskInputFn", "keepIframeSrcFn", "recordCanvas", "inlineImages", "privacySetting", "slimDOMOptions", "dataURLOptions", "doc", "mirror", "iframeManager", "stylesheetManager", "shadowDomManager", "canvasManager", "processedNodeManager"].forEach((i) => {
          this[i] = e[i];
        });
      }
      freeze() {
        this.frozen = !0, this.canvasManager.freeze();
      }
      unfreeze() {
        this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
      }
      isFrozen() {
        return this.frozen;
      }
      lock() {
        this.locked = !0, this.canvasManager.lock();
      }
      unlock() {
        this.locked = !1, this.canvasManager.unlock(), this.emit();
      }
      reset() {
        this.shadowDomManager.reset(), this.canvasManager.reset();
      }
    }
    function Bi(t, e) {
      t.delete(e), _t(e).forEach((i) => Bi(t, i));
    }
    function ys(t, e, i) {
      return t.length !== 0 && function(n, s, o) {
        let r = xe(s);
        for (; r; ) {
          const a = o.getId(r);
          if (n.some((l) => l.id === a))
            return !0;
          r = xe(r);
        }
        return !1;
      }(t, e, i);
    }
    function gs(t, e) {
      return t.size !== 0 && Is(t, e);
    }
    function Is(t, e) {
      const i = xe(e);
      return !!i && (!!t.has(i) || Is(t, i));
    }
    let Rt;
    const _ = (t) => Rt ? (...e) => {
      try {
        return t(...e);
      } catch (i) {
        if (Rt && Rt(i) === !0)
          return;
        throw i;
      }
    } : t, De = [];
    function vt(t) {
      try {
        if ("composedPath" in t) {
          const e = t.composedPath();
          if (e.length)
            return e[0];
        } else if ("path" in t && t.path.length)
          return t.path[0];
      } catch (e) {
      }
      return t && t.target;
    }
    function Ss(t, e) {
      const i = new Wr();
      De.push(i), i.init(t);
      const n = new (Fi("MutationObserver")).constructor(_(i.processMutations.bind(i)));
      return n.observe(e, { attributes: !0, attributeOldValue: !0, characterData: !0, characterDataOldValue: !0, childList: !0, subtree: !0 }), n;
    }
    function fr({ mouseInteractionCb: t, doc: e, mirror: i, blockClass: n, blockSelector: s, sampling: o }) {
      if (o.mouseInteraction === !1)
        return () => {
        };
      const r = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, a = [];
      let l = null;
      return Object.keys(Se).filter((c) => Number.isNaN(Number(c)) && !c.endsWith("_Departed") && r[c] !== !1).forEach((c) => {
        let d = nt(c);
        const h = /* @__PURE__ */ ((p) => (m) => {
          const X = vt(m);
          if (me(X, n, s, !0) || Sr(X))
            return;
          let Z = null, V = p;
          if ("pointerType" in m) {
            switch (m.pointerType) {
              case "mouse":
                Z = Me.Mouse;
                break;
              case "touch":
                Z = Me.Touch;
                break;
              case "pen":
                Z = Me.Pen;
            }
            Z === Me.Touch && (Se[p] === Se.MouseDown ? V = "TouchStart" : Se[p] === Se.MouseUp && (V = "TouchEnd"));
          } else
            Oi(m) && (Z = Me.Touch);
          Z !== null ? (l = Z, (V.startsWith("Touch") && Z === Me.Touch || V.startsWith("Mouse") && Z === Me.Mouse) && (Z = null)) : Se[p] === Se.Click && (Z = l, l = null);
          const y = Oi(m) ? m.changedTouches[0] : m;
          if (!y)
            return;
          const g = i.getId(X), { clientX: b, clientY: I } = y;
          _(t)(U({ type: Se[V], id: g, x: b, y: I }, Z !== null && { pointerType: Z }));
        })(c);
        if (window.PointerEvent)
          switch (Se[c]) {
            case Se.MouseDown:
            case Se.MouseUp:
              d = d.replace("mouse", "pointer");
              break;
            case Se.TouchStart:
            case Se.TouchEnd:
              return;
          }
        a.push(Ze(d, h, e));
      }), _(() => {
        a.forEach((c) => c());
      });
    }
    function Xs({ scrollCb: t, doc: e, mirror: i, blockClass: n, blockSelector: s, sampling: o }) {
      return Ze("scroll", _(ft(_((r) => {
        const a = vt(r);
        if (!a || me(a, n, s, !0))
          return;
        const l = i.getId(a);
        if (a === e && e.defaultView) {
          const c = rs(e.defaultView);
          t({ id: l, x: c.left, y: c.top });
        } else
          t({ id: l, x: a.scrollLeft, y: a.scrollTop });
      }), o.scroll || 100)), e);
    }
    const Rr = ["INPUT", "TEXTAREA", "SELECT"], Vs = /* @__PURE__ */ new WeakMap();
    function ti(t) {
      return function(e, i) {
        if (ii("CSSGroupingRule") && e.parentRule instanceof CSSGroupingRule || ii("CSSMediaRule") && e.parentRule instanceof CSSMediaRule || ii("CSSSupportsRule") && e.parentRule instanceof CSSSupportsRule || ii("CSSConditionRule") && e.parentRule instanceof CSSConditionRule) {
          const n = Array.from(e.parentRule.cssRules).indexOf(e);
          i.unshift(n);
        } else if (e.parentStyleSheet) {
          const n = Array.from(e.parentStyleSheet.cssRules).indexOf(e);
          i.unshift(n);
        }
        return i;
      }(t, []);
    }
    function ze(t, e, i) {
      let n, s;
      return t ? (t.ownerNode ? n = e.getId(t.ownerNode) : s = i.getId(t), { styleId: s, id: n }) : {};
    }
    function Gs({ mirror: t, stylesheetManager: e }, i) {
      var n, s, o;
      let r = null;
      r = i.nodeName === "#document" ? t.getId(i) : t.getId(lt(i));
      const a = i.nodeName === "#document" ? (n = i.defaultView) == null ? void 0 : n.Document : (o = (s = i.ownerDocument) == null ? void 0 : s.defaultView) == null ? void 0 : o.ShadowRoot, l = a != null && a.prototype ? Object.getOwnPropertyDescriptor(a == null ? void 0 : a.prototype, "adoptedStyleSheets") : void 0;
      return r !== null && r !== -1 && a && l ? (Object.defineProperty(i, "adoptedStyleSheets", { configurable: l.configurable, enumerable: l.enumerable, get() {
        var c;
        return (c = l.get) == null ? void 0 : c.call(this);
      }, set(c) {
        var d;
        const h = (d = l.set) == null ? void 0 : d.call(this, c);
        if (r !== null && r !== -1)
          try {
            e.adoptStyleSheets(c, r);
          } catch (p) {
          }
        return h;
      } }), _(() => {
        Object.defineProperty(i, "adoptedStyleSheets", { configurable: l.configurable, enumerable: l.enumerable, get: l.get, set: l.set });
      })) : () => {
      };
    }
    function vr(t, e = {}) {
      const i = t.doc.defaultView;
      if (!i)
        return () => {
        };
      let n;
      (function(y, g) {
        const { mutationCb: b, mousemoveCb: I, mouseInteractionCb: R, scrollCb: L, viewportResizeCb: F, inputCb: H, mediaInteractionCb: x, styleSheetRuleCb: N, styleDeclarationCb: K, canvasMutationCb: k, fontCb: u, selectionCb: G, customElementCb: v } = y;
        y.mutationCb = (...f) => {
          g.mutation && g.mutation(...f), b(...f);
        }, y.mousemoveCb = (...f) => {
          g.mousemove && g.mousemove(...f), I(...f);
        }, y.mouseInteractionCb = (...f) => {
          g.mouseInteraction && g.mouseInteraction(...f), R(...f);
        }, y.scrollCb = (...f) => {
          g.scroll && g.scroll(...f), L(...f);
        }, y.viewportResizeCb = (...f) => {
          g.viewportResize && g.viewportResize(...f), F(...f);
        }, y.inputCb = (...f) => {
          g.input && g.input(...f), H(...f);
        }, y.mediaInteractionCb = (...f) => {
          g.mediaInteaction && g.mediaInteaction(...f), x(...f);
        }, y.styleSheetRuleCb = (...f) => {
          g.styleSheetRule && g.styleSheetRule(...f), N(...f);
        }, y.styleDeclarationCb = (...f) => {
          g.styleDeclaration && g.styleDeclaration(...f), K(...f);
        }, y.canvasMutationCb = (...f) => {
          g.canvasMutation && g.canvasMutation(...f), k(...f);
        }, y.fontCb = (...f) => {
          g.font && g.font(...f), u(...f);
        }, y.selectionCb = (...f) => {
          g.selection && g.selection(...f), G(...f);
        }, y.customElementCb = (...f) => {
          g.customElement && g.customElement(...f), v(...f);
        };
      })(t, e), t.recordDOM && (n = Ss(t, t.doc));
      const s = function({ mousemoveCb: y, sampling: g, doc: b, mirror: I }) {
        if (g.mousemove === !1)
          return () => {
          };
        const R = typeof g.mousemove == "number" ? g.mousemove : 50, L = typeof g.mousemoveCallback == "number" ? g.mousemoveCallback : 500;
        let F, H = [];
        const x = ft(_((k) => {
          const u = Date.now() - F;
          y(H.map((G) => (G.timeOffset -= u, G)), k), H = [], F = null;
        }), L), N = _(ft(_((k) => {
          const u = vt(k), { clientX: G, clientY: v } = Oi(k) ? k.changedTouches[0] : k;
          F || (F = ei()), H.push({ x: G, y: v, id: I.getId(u), timeOffset: ei() - F }), x(typeof DragEvent != "undefined" && k instanceof DragEvent ? j.Drag : k instanceof MouseEvent ? j.MouseMove : j.TouchMove);
        }), R, { trailing: !1 })), K = [Ze("mousemove", N, b), Ze("touchmove", N, b), Ze("drag", N, b)];
        return _(() => {
          K.forEach((k) => k());
        });
      }(t), o = fr(t), r = Xs(t), a = function({ viewportResizeCb: y }, { win: g }) {
        let b = -1, I = -1;
        return Ze("resize", _(ft(_(() => {
          const R = ls(), L = as();
          b === R && I === L || (y({ width: Number(L), height: Number(R) }), b = R, I = L);
        }), 200)), g);
      }(t, { win: i }), l = function({ inputCb: y, doc: g, mirror: b, blockClass: I, blockSelector: R, ignoreClass: L, ignoreSelector: F, maskInputOptions: H, maskInputFn: x, sampling: N, userTriggeredOnInput: K }) {
        function k(S) {
          let T = vt(S);
          const $ = S.isTrusted, A = T && T.tagName;
          if (T && A === "OPTION" && (T = qt(T)), !T || !A || Rr.indexOf(A) < 0 || me(T, I, R, !0) || T.classList.contains(L) || F && T.matches(F))
            return;
          let B = T.value, z = !1;
          const Ie = Ji(T) || "", be = T.getAttribute("data-hl-record");
          Ie === "radio" || Ie === "checkbox" ? z = T.checked : Bn({ maskInputOptions: H, type: Ie, tagName: A, overwriteRecord: be }) && (B = xi({ element: T, maskInputOptions: H, tagName: A, type: Ie, value: B, overwriteRecord: be, maskInputFn: x })), u(T, K ? { text: B, isChecked: z, userTriggered: $ } : { text: B, isChecked: z });
          const J = T.name;
          Ie === "radio" && J && z && g.querySelectorAll(`input[type="radio"][name="${J}"]`).forEach((P) => {
            if (P !== T) {
              const ue = P.value;
              u(P, K ? { text: ue, isChecked: !z, userTriggered: !1 } : { text: ue, isChecked: !z });
            }
          });
        }
        function u(S, T) {
          const $ = Vs.get(S);
          if (!$ || $.text !== T.text || $.isChecked !== T.isChecked) {
            Vs.set(S, T);
            const A = b.getId(S);
            _(y)(Ve(U({}, T), { id: A }));
          }
        }
        const G = (N.input === "last" ? ["change"] : ["input", "change"]).map((S) => Ze(S, _(k), g)), v = g.defaultView;
        if (!v)
          return () => {
            G.forEach((S) => S());
          };
        const f = v.Object.getOwnPropertyDescriptor(v.HTMLInputElement.prototype, "value"), M = [[v.HTMLInputElement.prototype, "value"], [v.HTMLInputElement.prototype, "checked"], [v.HTMLSelectElement.prototype, "value"], [v.HTMLTextAreaElement.prototype, "value"], [v.HTMLSelectElement.prototype, "selectedIndex"], [v.HTMLOptionElement.prototype, "selected"]];
        return f && f.set && G.push(...M.map((S) => $t(S[0], S[1], { set() {
          _(k)({ target: this, isTrusted: !1 });
        } }, !1, v))), _(() => {
          G.forEach((S) => S());
        });
      }(t), c = function({ mediaInteractionCb: y, blockClass: g, blockSelector: b, mirror: I, sampling: R, doc: L }) {
        const F = _((x) => ft(_((N) => {
          const K = vt(N);
          if (!K || me(K, g, b, !0))
            return;
          const { currentTime: k, volume: u, muted: G, playbackRate: v, loop: f } = K;
          y({ type: x, id: I.getId(K), currentTime: k, volume: u, muted: G, playbackRate: v, loop: f });
        }), R.media || 500)), H = [Ze("play", F(ut.Play), L), Ze("pause", F(ut.Pause), L), Ze("seeked", F(ut.Seeked), L), Ze("volumechange", F(ut.VolumeChange), L), Ze("ratechange", F(ut.RateChange), L)];
        return _(() => {
          H.forEach((x) => x());
        });
      }(t);
      let d = () => {
      }, h = () => {
      }, p = () => {
      }, m = () => {
      };
      t.recordDOM && (d = function({ styleSheetRuleCb: y, mirror: g, stylesheetManager: b }, { win: I }) {
        if (!I.CSSStyleSheet || !I.CSSStyleSheet.prototype)
          return () => {
          };
        const R = I.CSSStyleSheet.prototype.insertRule;
        I.CSSStyleSheet.prototype.insertRule = new Proxy(R, { apply: _((K, k, u) => {
          const [G, v] = u, { id: f, styleId: M } = ze(k, g, b.styleMirror);
          return (f && f !== -1 || M && M !== -1) && y({ id: f, styleId: M, adds: [{ rule: G, index: v }] }), K.apply(k, u);
        }) });
        const L = I.CSSStyleSheet.prototype.deleteRule;
        let F, H;
        I.CSSStyleSheet.prototype.deleteRule = new Proxy(L, { apply: _((K, k, u) => {
          const [G] = u, { id: v, styleId: f } = ze(k, g, b.styleMirror);
          return (v && v !== -1 || f && f !== -1) && y({ id: v, styleId: f, removes: [{ index: G }] }), K.apply(k, u);
        }) }), I.CSSStyleSheet.prototype.replace && (F = I.CSSStyleSheet.prototype.replace, I.CSSStyleSheet.prototype.replace = new Proxy(F, { apply: _((K, k, u) => {
          const [G] = u, { id: v, styleId: f } = ze(k, g, b.styleMirror);
          return (v && v !== -1 || f && f !== -1) && y({ id: v, styleId: f, replace: G }), K.apply(k, u);
        }) })), I.CSSStyleSheet.prototype.replaceSync && (H = I.CSSStyleSheet.prototype.replaceSync, I.CSSStyleSheet.prototype.replaceSync = new Proxy(H, { apply: _((K, k, u) => {
          const [G] = u, { id: v, styleId: f } = ze(k, g, b.styleMirror);
          return (v && v !== -1 || f && f !== -1) && y({ id: v, styleId: f, replaceSync: G }), K.apply(k, u);
        }) }));
        const x = {};
        ni("CSSGroupingRule") ? x.CSSGroupingRule = I.CSSGroupingRule : (ni("CSSMediaRule") && (x.CSSMediaRule = I.CSSMediaRule), ni("CSSConditionRule") && (x.CSSConditionRule = I.CSSConditionRule), ni("CSSSupportsRule") && (x.CSSSupportsRule = I.CSSSupportsRule));
        const N = {};
        return Object.entries(x).forEach(([K, k]) => {
          N[K] = { insertRule: k.prototype.insertRule, deleteRule: k.prototype.deleteRule }, k.prototype.insertRule = new Proxy(N[K].insertRule, { apply: _((u, G, v) => {
            const [f, M] = v, { id: S, styleId: T } = ze(G.parentStyleSheet, g, b.styleMirror);
            return (S && S !== -1 || T && T !== -1) && y({ id: S, styleId: T, adds: [{ rule: f, index: [...ti(G), M || 0] }] }), u.apply(G, v);
          }) }), k.prototype.deleteRule = new Proxy(N[K].deleteRule, { apply: _((u, G, v) => {
            const [f] = v, { id: M, styleId: S } = ze(G.parentStyleSheet, g, b.styleMirror);
            return (M && M !== -1 || S && S !== -1) && y({ id: M, styleId: S, removes: [{ index: [...ti(G), f] }] }), u.apply(G, v);
          }) });
        }), _(() => {
          I.CSSStyleSheet.prototype.insertRule = R, I.CSSStyleSheet.prototype.deleteRule = L, F && (I.CSSStyleSheet.prototype.replace = F), H && (I.CSSStyleSheet.prototype.replaceSync = H), Object.entries(x).forEach(([K, k]) => {
            k.prototype.insertRule = N[K].insertRule, k.prototype.deleteRule = N[K].deleteRule;
          });
        });
      }(t, { win: i }), h = Gs(t, t.doc), p = function({ styleDeclarationCb: y, mirror: g, ignoreCSSAttributes: b, stylesheetManager: I }, { win: R }) {
        const L = R.CSSStyleDeclaration.prototype.setProperty;
        R.CSSStyleDeclaration.prototype.setProperty = new Proxy(L, { apply: _((H, x, N) => {
          var K;
          const [k, u, G] = N;
          if (b.has(k))
            return L.apply(x, [k, u, G]);
          const { id: v, styleId: f } = ze((K = x.parentRule) == null ? void 0 : K.parentStyleSheet, g, I.styleMirror);
          return (v && v !== -1 || f && f !== -1) && y({ id: v, styleId: f, set: { property: k, value: u, priority: G }, index: ti(x.parentRule) }), H.apply(x, N);
        }) });
        const F = R.CSSStyleDeclaration.prototype.removeProperty;
        return R.CSSStyleDeclaration.prototype.removeProperty = new Proxy(F, { apply: _((H, x, N) => {
          var K;
          const [k] = N;
          if (b.has(k))
            return F.apply(x, [k]);
          const { id: u, styleId: G } = ze((K = x.parentRule) == null ? void 0 : K.parentStyleSheet, g, I.styleMirror);
          return (u && u !== -1 || G && G !== -1) && y({ id: u, styleId: G, remove: { property: k }, index: ti(x.parentRule) }), H.apply(x, N);
        }) }), _(() => {
          R.CSSStyleDeclaration.prototype.setProperty = L, R.CSSStyleDeclaration.prototype.removeProperty = F;
        });
      }(t, { win: i }), t.collectFonts && (m = function({ fontCb: y, doc: g }) {
        const b = g.defaultView;
        if (!b)
          return () => {
          };
        const I = [], R = /* @__PURE__ */ new WeakMap(), L = b.FontFace;
        b.FontFace = function(H, x, N) {
          const K = new L(H, x, N);
          return R.set(K, { family: H, buffer: typeof x != "string", descriptors: N, fontSource: typeof x == "string" ? x : JSON.stringify(Array.from(new Uint8Array(x))) }), K;
        };
        const F = ct(g.fonts, "add", function(H) {
          return function(x) {
            return setTimeout(_(() => {
              const N = R.get(x);
              N && (y(N), R.delete(x));
            }), 0), H.apply(this, [x]);
          };
        });
        return I.push(() => {
          b.FontFace = L;
        }), I.push(F), _(() => {
          I.forEach((H) => H());
        });
      }(t)));
      const X = function(y) {
        const { doc: g, mirror: b, blockClass: I, blockSelector: R, selectionCb: L } = y;
        let F = !0;
        const H = _(() => {
          const x = g.getSelection();
          if (!x || F && (x != null && x.isCollapsed))
            return;
          F = x.isCollapsed || !1;
          const N = [], K = x.rangeCount || 0;
          for (let k = 0; k < K; k++) {
            const u = x.getRangeAt(k), { startContainer: G, startOffset: v, endContainer: f, endOffset: M } = u;
            me(G, I, R, !0) || me(f, I, R, !0) || N.push({ start: b.getId(G), startOffset: v, end: b.getId(f), endOffset: M });
          }
          L({ ranges: N });
        });
        return H(), Ze("selectionchange", H);
      }(t), Z = function({ doc: y, customElementCb: g }) {
        const b = y.defaultView;
        return b && b.customElements ? ct(b.customElements, "define", function(I) {
          return function(R, L, F) {
            try {
              g({ define: { name: R } });
            } catch (H) {
              console.warn(`Custom element callback failed for ${R}`);
            }
            return I.apply(this, [R, L, F]);
          };
        }) : () => {
        };
      }(t), V = [];
      for (const y of t.plugins)
        V.push(y.observer(y.callback, i, y.options));
      return _(() => {
        De.forEach((y) => y.reset()), n == null || n.disconnect(), s(), o(), r(), a(), l(), c(), d(), h(), p(), m(), X(), Z(), V.forEach((y) => y());
      });
    }
    function ii(t) {
      return window[t] !== void 0;
    }
    function ni(t) {
      return !!(window[t] !== void 0 && window[t].prototype && "insertRule" in window[t].prototype && "deleteRule" in window[t].prototype);
    }
    class Ws {
      constructor(e) {
        C(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), C(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = e;
      }
      getId(e, i, n, s) {
        const o = n || this.getIdToRemoteIdMap(e), r = s || this.getRemoteIdToIdMap(e);
        let a = o.get(i);
        return a || (a = this.generateIdFn(), o.set(i, a), r.set(a, i)), a;
      }
      getIds(e, i) {
        const n = this.getIdToRemoteIdMap(e), s = this.getRemoteIdToIdMap(e);
        return i.map((o) => this.getId(e, o, n, s));
      }
      getRemoteId(e, i, n) {
        const s = n || this.getRemoteIdToIdMap(e);
        return typeof i != "number" ? i : s.get(i) || -1;
      }
      getRemoteIds(e, i) {
        const n = this.getRemoteIdToIdMap(e);
        return i.map((s) => this.getRemoteId(e, s, n));
      }
      reset(e) {
        if (!e)
          return this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), void (this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap());
        this.iframeIdToRemoteIdMap.delete(e), this.iframeRemoteIdToIdMap.delete(e);
      }
      getIdToRemoteIdMap(e) {
        let i = this.iframeIdToRemoteIdMap.get(e);
        return i || (i = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(e, i)), i;
      }
      getRemoteIdToIdMap(e) {
        let i = this.iframeRemoteIdToIdMap.get(e);
        return i || (i = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(e, i)), i;
      }
    }
    class Cr {
      constructor(e) {
        C(this, "iframes", /* @__PURE__ */ new WeakMap()), C(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), C(this, "crossOriginIframeMirror", new Ws(Dn)), C(this, "crossOriginIframeStyleMirror"), C(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), C(this, "mirror"), C(this, "mutationCb"), C(this, "wrappedEmit"), C(this, "loadListener"), C(this, "stylesheetManager"), C(this, "recordCrossOriginIframes"), this.mutationCb = e.mutationCb, this.wrappedEmit = e.wrappedEmit, this.stylesheetManager = e.stylesheetManager, this.recordCrossOriginIframes = e.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Ws(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror)), this.mirror = e.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
      }
      addIframe(e) {
        this.iframes.set(e, !0), e.contentWindow && this.crossOriginIframeMap.set(e.contentWindow, e);
      }
      addLoadListener(e) {
        this.loadListener = e;
      }
      attachIframe(e, i) {
        var n, s;
        this.mutationCb({ adds: [{ parentId: this.mirror.getId(e), nextId: null, node: i }], removes: [], texts: [], attributes: [], isAttachIframe: !0 }), this.recordCrossOriginIframes && ((n = e.contentWindow) == null || n.addEventListener("message", this.handleMessage.bind(this))), (s = this.loadListener) == null || s.call(this, e), e.contentDocument && e.contentDocument.adoptedStyleSheets && e.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(e.contentDocument.adoptedStyleSheets, this.mirror.getId(e.contentDocument));
      }
      handleMessage(e) {
        const i = e;
        if (i.data.type !== "rrweb" || i.origin !== i.data.origin)
          return;
        const n = e.source;
        if (!n)
          return;
        const s = this.crossOriginIframeMap.get(n);
        if (!s)
          return;
        const o = this.transformCrossOriginEvent(s, i.data.event);
        o && this.wrappedEmit(o, i.data.isCheckout);
      }
      transformCrossOriginEvent(e, i) {
        var n;
        switch (i.type) {
          case q.FullSnapshot: {
            this.crossOriginIframeMirror.reset(e), this.crossOriginIframeStyleMirror.reset(e), this.replaceIdOnNode(i.data.node, e);
            const s = i.data.node.id;
            return this.crossOriginIframeRootIdMap.set(e, s), this.patchRootIdOnNode(i.data.node, s), { timestamp: i.timestamp, type: q.IncrementalSnapshot, data: { source: j.Mutation, adds: [{ parentId: this.mirror.getId(e), nextId: null, node: i.data.node }], removes: [], texts: [], attributes: [], isAttachIframe: !0 } };
          }
          case q.Meta:
          case q.Load:
          case q.DomContentLoaded:
            return !1;
          case q.Plugin:
            return i;
          case q.Custom:
            return this.replaceIds(i.data.payload, e, ["id", "parentId", "previousId", "nextId"]), i;
          case q.IncrementalSnapshot:
            switch (i.data.source) {
              case j.Mutation:
                return i.data.adds.forEach((s) => {
                  this.replaceIds(s, e, ["parentId", "nextId", "previousId"]), this.replaceIdOnNode(s.node, e);
                  const o = this.crossOriginIframeRootIdMap.get(e);
                  o && this.patchRootIdOnNode(s.node, o);
                }), i.data.removes.forEach((s) => {
                  this.replaceIds(s, e, ["parentId", "id"]);
                }), i.data.attributes.forEach((s) => {
                  this.replaceIds(s, e, ["id"]);
                }), i.data.texts.forEach((s) => {
                  this.replaceIds(s, e, ["id"]);
                }), i;
              case j.Drag:
              case j.TouchMove:
              case j.MouseMove:
                return i.data.positions.forEach((s) => {
                  this.replaceIds(s, e, ["id"]);
                }), i;
              case j.ViewportResize:
                return !1;
              case j.MediaInteraction:
              case j.MouseInteraction:
              case j.Scroll:
              case j.CanvasMutation:
              case j.Input:
                return this.replaceIds(i.data, e, ["id"]), i;
              case j.StyleSheetRule:
              case j.StyleDeclaration:
                return this.replaceIds(i.data, e, ["id"]), this.replaceStyleIds(i.data, e, ["styleId"]), i;
              case j.Font:
                return i;
              case j.Selection:
                return i.data.ranges.forEach((s) => {
                  this.replaceIds(s, e, ["start", "end"]);
                }), i;
              case j.AdoptedStyleSheet:
                return this.replaceIds(i.data, e, ["id"]), this.replaceStyleIds(i.data, e, ["styleIds"]), (n = i.data.styles) == null || n.forEach((s) => {
                  this.replaceStyleIds(s, e, ["styleId"]);
                }), i;
            }
        }
        return !1;
      }
      replace(e, i, n, s) {
        for (const o of s)
          (Array.isArray(i[o]) || typeof i[o] == "number") && (Array.isArray(i[o]) ? i[o] = e.getIds(n, i[o]) : i[o] = e.getId(n, i[o]));
        return i;
      }
      replaceIds(e, i, n) {
        return this.replace(this.crossOriginIframeMirror, e, i, n);
      }
      replaceStyleIds(e, i, n) {
        return this.replace(this.crossOriginIframeStyleMirror, e, i, n);
      }
      replaceIdOnNode(e, i) {
        this.replaceIds(e, i, ["id", "rootId"]), "childNodes" in e && e.childNodes.forEach((n) => {
          this.replaceIdOnNode(n, i);
        });
      }
      patchRootIdOnNode(e, i) {
        e.type === ae.Document || e.rootId || (e.rootId = i), "childNodes" in e && e.childNodes.forEach((n) => {
          this.patchRootIdOnNode(n, i);
        });
      }
    }
    class kr {
      constructor(e) {
        C(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), C(this, "mutationCb"), C(this, "scrollCb"), C(this, "bypassOptions"), C(this, "mirror"), C(this, "restoreHandlers", []), this.mutationCb = e.mutationCb, this.scrollCb = e.scrollCb, this.bypassOptions = e.bypassOptions, this.mirror = e.mirror, this.init();
      }
      init() {
        this.reset(), this.patchAttachShadow(Element, document);
      }
      addShadowRoot(e, i) {
        if (!Xt(e) || this.shadowDoms.has(e))
          return;
        this.shadowDoms.add(e);
        const n = Ss(Ve(U({}, this.bypassOptions), { doc: i, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), e);
        this.restoreHandlers.push(() => n.disconnect()), this.restoreHandlers.push(Xs(Ve(U({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: e, mirror: this.mirror }))), setTimeout(() => {
          e.adoptedStyleSheets && e.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(e.adoptedStyleSheets, this.mirror.getId(lt(e))), this.restoreHandlers.push(Gs({ mirror: this.mirror, stylesheetManager: this.bypassOptions.stylesheetManager }, e));
        }, 0);
      }
      observeAttachShadow(e) {
        e.contentWindow && e.contentDocument && this.patchAttachShadow(e.contentWindow.Element, e.contentDocument);
      }
      patchAttachShadow(e, i) {
        const n = this;
        this.restoreHandlers.push(ct(e.prototype, "attachShadow", function(s) {
          return function(o) {
            const r = s.call(this, o), a = Wt(this);
            return a && ms(this) && n.addShadowRoot(a, i), r;
          };
        }));
      }
      reset() {
        this.restoreHandlers.forEach((e) => {
          try {
            e();
          } catch (i) {
          }
        }), this.restoreHandlers = [], this.shadowDoms = /* @__PURE__ */ new WeakSet();
      }
    }
    for (var Ct = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Tr = typeof Uint8Array == "undefined" ? [] : new Uint8Array(256), si = 0; si < 64; si++)
      Tr[Ct.charCodeAt(si)] = si;
    const fs = /* @__PURE__ */ new Map(), Rs = (t, e, i) => {
      if (!t || !Cs(t, e) && typeof t != "object")
        return;
      const n = function(o, r) {
        let a = fs.get(o);
        return a || (a = /* @__PURE__ */ new Map(), fs.set(o, a)), a.has(r) || a.set(r, []), a.get(r);
      }(i, t.constructor.name);
      let s = n.indexOf(t);
      return s === -1 && (s = n.length, n.push(t)), s;
    };
    function oi(t, e, i) {
      if (t instanceof Array)
        return t.map((n) => oi(n, e, i));
      if (t === null)
        return t;
      if (t instanceof Float32Array || t instanceof Float64Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Uint8Array || t instanceof Uint16Array || t instanceof Int16Array || t instanceof Int8Array || t instanceof Uint8ClampedArray)
        return { rr_type: t.constructor.name, args: [Object.values(t)] };
      if (t instanceof ArrayBuffer)
        return { rr_type: t.constructor.name, base64: function(n) {
          var s, o = new Uint8Array(n), r = o.length, a = "";
          for (s = 0; s < r; s += 3)
            a += Ct[o[s] >> 2], a += Ct[(3 & o[s]) << 4 | o[s + 1] >> 4], a += Ct[(15 & o[s + 1]) << 2 | o[s + 2] >> 6], a += Ct[63 & o[s + 2]];
          return r % 3 == 2 ? a = a.substring(0, a.length - 1) + "=" : r % 3 == 1 && (a = a.substring(0, a.length - 2) + "=="), a;
        }(t) };
      if (t instanceof DataView)
        return { rr_type: t.constructor.name, args: [oi(t.buffer, e, i), t.byteOffset, t.byteLength] };
      if (t instanceof HTMLImageElement) {
        const n = t.constructor.name, { src: s } = t;
        return { rr_type: n, src: s };
      }
      return t instanceof HTMLCanvasElement ? { rr_type: "HTMLImageElement", src: t.toDataURL() } : t instanceof ImageData ? { rr_type: t.constructor.name, args: [oi(t.data, e, i), t.width, t.height] } : Cs(t, e) || typeof t == "object" ? { rr_type: t.constructor.name, index: Rs(t, e, i) } : t;
    }
    const vs = (t, e, i) => t.map((n) => oi(n, e, i)), Cs = (t, e) => !!["WebGLActiveInfo", "WebGLBuffer", "WebGLFramebuffer", "WebGLProgram", "WebGLRenderbuffer", "WebGLShader", "WebGLShaderPrecisionFormat", "WebGLTexture", "WebGLUniformLocation", "WebGLVertexArrayObject", "WebGLVertexArrayObjectOES"].filter((n) => typeof e[n] == "function").find((n) => t instanceof e[n]);
    function ks(t, e, i, n) {
      const s = [];
      try {
        const o = ct(t.HTMLCanvasElement.prototype, "getContext", function(r) {
          return function(a, ...l) {
            if (!me(this, e, i, !0)) {
              const c = /* @__PURE__ */ function(d) {
                return d === "experimental-webgl" ? "webgl" : d;
              }(a);
              if ("__context" in this || (this.__context = c), n && ["webgl", "webgl2"].includes(c))
                if (l[0] && typeof l[0] == "object") {
                  const d = l[0];
                  d.preserveDrawingBuffer || (d.preserveDrawingBuffer = !0);
                } else
                  l.splice(0, 1, { preserveDrawingBuffer: !0 });
            }
            return r.apply(this, [a, ...l]);
          };
        });
        s.push(o);
      } catch (o) {
        console.error("failed to patch HTMLCanvasElement.prototype.getContext");
      }
      return () => {
        s.forEach((o) => o());
      };
    }
    function Ts(t, e, i, n, s, o) {
      const r = [], a = Object.getOwnPropertyNames(t);
      for (const l of a)
        if (!["isContextLost", "canvas", "drawingBufferWidth", "drawingBufferHeight"].includes(l))
          try {
            if (typeof t[l] != "function")
              continue;
            const c = ct(t, l, function(d) {
              return function(...h) {
                const p = d.apply(this, h);
                if (Rs(p, o, this), "tagName" in this.canvas && !me(this.canvas, n, s, !0)) {
                  const m = vs(h, o, this), X = { type: e, property: l, args: m };
                  i(this.canvas, X);
                }
                return p;
              };
            });
            r.push(c);
          } catch (c) {
            const d = $t(t, l, { set(h) {
              i(this.canvas, { type: e, property: l, args: [h], setter: !0 });
            } });
            r.push(d);
          }
      return r;
    }
    const ws = "KGZ1bmN0aW9uKCkgewogICJ1c2Ugc3RyaWN0IjsKICB2YXIgY2hhcnMgPSAiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyI7CiAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAidW5kZWZpbmVkIiA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7CiAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpOwogIH0KICB2YXIgZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpIHsKICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSwgaTIsIGxlbiA9IGJ5dGVzLmxlbmd0aCwgYmFzZTY0ID0gIiI7CiAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW47IGkyICs9IDMpIHsKICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2kyXSA+PiAyXTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMl0gJiAzKSA8PCA0IHwgYnl0ZXNbaTIgKyAxXSA+PiA0XTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMiArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpMiArIDJdID4+IDZdOwogICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaTIgKyAyXSAmIDYzXTsKICAgIH0KICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgIj0iOwogICAgfSBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgIj09IjsKICAgIH0KICAgIHJldHVybiBiYXNlNjQ7CiAgfTsKICBjb25zdCBsYXN0QmxvYk1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICBhc3luYyBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEJsb2JGb3Iod2lkdGgsIGhlaWdodCwgZGF0YVVSTE9wdGlvbnMpIHsKICAgIGNvbnN0IGlkID0gYCR7d2lkdGh9LSR7aGVpZ2h0fWA7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBpZiAodHJhbnNwYXJlbnRCbG9iTWFwLmhhcyhpZCkpCiAgICAgICAgcmV0dXJuIHRyYW5zcGFyZW50QmxvYk1hcC5nZXQoaWQpOwogICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOwogICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgiMmQiKTsKICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IG9mZnNjcmVlbi5jb252ZXJ0VG9CbG9iKGRhdGFVUkxPcHRpb25zKTsKICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBibG9iLmFycmF5QnVmZmVyKCk7CiAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7CiAgICAgIHRyYW5zcGFyZW50QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7CiAgICAgIHJldHVybiBiYXNlNjQ7CiAgICB9IGVsc2UgewogICAgICByZXR1cm4gIiI7CiAgICB9CiAgfQogIGNvbnN0IHdvcmtlciA9IHNlbGY7CiAgbGV0IGxvZ0RlYnVnID0gZmFsc2U7CiAgY29uc3QgZGVidWcgPSAoLi4uYXJncykgPT4gewogICAgaWYgKGxvZ0RlYnVnKSB7CiAgICAgIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7CiAgICB9CiAgfTsKICB3b3JrZXIub25tZXNzYWdlID0gYXN5bmMgZnVuY3Rpb24oZSkgewogICAgbG9nRGVidWcgPSAhIWUuZGF0YS5sb2dEZWJ1ZzsKICAgIGlmICgiT2Zmc2NyZWVuQ2FudmFzIiBpbiBnbG9iYWxUaGlzKSB7CiAgICAgIGNvbnN0IHsgaWQsIGJpdG1hcCwgd2lkdGgsIGhlaWdodCwgZHgsIGR5LCBkdywgZGgsIGRhdGFVUkxPcHRpb25zIH0gPSBlLmRhdGE7CiAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKAogICAgICAgIHdpZHRoLAogICAgICAgIGhlaWdodCwKICAgICAgICBkYXRhVVJMT3B0aW9ucwogICAgICApOwogICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOwogICAgICBjb25zdCBjdHggPSBvZmZzY3JlZW4uZ2V0Q29udGV4dCgiMmQiKTsKICAgICAgY3R4LmRyYXdJbWFnZShiaXRtYXAsIDAsIDAsIHdpZHRoLCBoZWlnaHQpOwogICAgICBiaXRtYXAuY2xvc2UoKTsKICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IG9mZnNjcmVlbi5jb252ZXJ0VG9CbG9iKGRhdGFVUkxPcHRpb25zKTsKICAgICAgY29uc3QgdHlwZSA9IGJsb2IudHlwZTsKICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBibG9iLmFycmF5QnVmZmVyKCk7CiAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7CiAgICAgIGlmICghbGFzdEJsb2JNYXAuaGFzKGlkKSAmJiBhd2FpdCB0cmFuc3BhcmVudEJhc2U2NCA9PT0gYmFzZTY0KSB7CiAgICAgICAgZGVidWcoIltoaWdobGlnaHQtd29ya2VyXSBjYW52YXMgYml0bWFwIGlzIHRyYW5zcGFyZW50IiwgewogICAgICAgICAgaWQsCiAgICAgICAgICBiYXNlNjQKICAgICAgICB9KTsKICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7CiAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkLCBzdGF0dXM6ICJ0cmFuc3BhcmVudCIgfSk7CiAgICAgIH0KICAgICAgaWYgKGxhc3RCbG9iTWFwLmdldChpZCkgPT09IGJhc2U2NCkgewogICAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gY2FudmFzIGJpdG1hcCBpcyB1bmNoYW5nZWQiLCB7CiAgICAgICAgICBpZCwKICAgICAgICAgIGJhc2U2NAogICAgICAgIH0pOwogICAgICAgIHJldHVybiB3b3JrZXIucG9zdE1lc3NhZ2UoeyBpZCwgc3RhdHVzOiAidW5jaGFuZ2VkIiB9KTsKICAgICAgfQogICAgICBjb25zdCBtc2cgPSB7CiAgICAgICAgaWQsCiAgICAgICAgdHlwZSwKICAgICAgICBiYXNlNjQsCiAgICAgICAgd2lkdGgsCiAgICAgICAgaGVpZ2h0LAogICAgICAgIGR4LAogICAgICAgIGR5LAogICAgICAgIGR3LAogICAgICAgIGRoCiAgICAgIH07CiAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gY2FudmFzIGJpdG1hcCBwcm9jZXNzZWQiLCBtc2cpOwogICAgICB3b3JrZXIucG9zdE1lc3NhZ2UobXNnKTsKICAgICAgbGFzdEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgfSBlbHNlIHsKICAgICAgZGVidWcoIltoaWdobGlnaHQtd29ya2VyXSBubyBvZmZzY3JlZW5jYW52YXMgc3VwcG9ydCIsIHsKICAgICAgICBpZDogZS5kYXRhLmlkCiAgICAgIH0pOwogICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCwgc3RhdHVzOiAidW5zdXBwb3J0ZWQiIH0pOwogICAgfQogIH07Cn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPWltYWdlLWJpdG1hcC1kYXRhLXVybC13b3JrZXItS0tvQ2VrWjEuanMubWFwCg==", Ns = typeof window != "undefined" && window.Blob && new Blob([(Ls = ws, Uint8Array.from(atob(Ls), (t) => t.charCodeAt(0)))], { type: "text/javascript;charset=utf-8" });
    var Ls;
    function wr(t) {
      let e;
      try {
        if (e = Ns && (window.URL || window.webkitURL).createObjectURL(Ns), !e)
          throw "";
        const i = new Worker(e, { name: t == null ? void 0 : t.name });
        return i.addEventListener("error", () => {
          (window.URL || window.webkitURL).revokeObjectURL(e);
        }), i;
      } catch (i) {
        return new Worker("data:text/javascript;base64," + ws, { name: t == null ? void 0 : t.name });
      } finally {
        e && (window.URL || window.webkitURL).revokeObjectURL(e);
      }
    }
    class Nr {
      constructor(e) {
        C(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), C(this, "rafStamps", { latestId: 0, invokeId: null }), C(this, "mirror"), C(this, "logger"), C(this, "worker"), C(this, "snapshotInProgressMap", /* @__PURE__ */ new Map()), C(this, "lastSnapshotTime", /* @__PURE__ */ new Map()), C(this, "options"), C(this, "mutationCb"), C(this, "resetObservers"), C(this, "frozen", !1), C(this, "locked", !1), C(this, "processMutation", (d, h) => {
          !(this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId) && this.rafStamps.invokeId || (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(d) || this.pendingCanvasMutations.set(d, []), this.pendingCanvasMutations.get(d).push(h);
        });
        const { sampling: i, win: n, blockClass: s, blockSelector: o, recordCanvas: r, recordVideos: a, initialSnapshotDelay: l, dataURLOptions: c } = e;
        this.mutationCb = e.mutationCb, this.mirror = e.mirror, this.logger = e.logger, this.worker = new wr(), this.worker.onmessage = (d) => {
          const { id: h } = d.data;
          if (this.snapshotInProgressMap.set(h, !1), !("base64" in d.data))
            return void this.debug(null, "canvas worker received empty message", { data: d.data, status: d.data.status });
          const { base64: p, type: m, dx: X, dy: Z, dw: V, dh: y } = d.data, g = { id: h, type: dt["2D"], commands: [{ property: "clearRect", args: [X, Z, V, y] }, { property: "drawImage", args: [{ rr_type: "ImageBitmap", args: [{ rr_type: "Blob", data: [{ rr_type: "ArrayBuffer", base64: p }], type: m }] }, X, Z, V, y] }] };
          this.debug(null, "canvas worker recording mutation", g), this.mutationCb(g);
        }, this.options = e, r && i === "all" ? (this.debug(null, "initializing canvas mutation observer", { sampling: i }), this.initCanvasMutationObserver(n, s, o)) : r && typeof i == "number" && (this.debug(null, "initializing canvas fps observer", { sampling: i }), this.initCanvasFPSObserver(a, i, n, s, o, { initialSnapshotDelay: l, dataURLOptions: c }, e.resizeFactor, e.maxSnapshotDimension));
      }
      reset() {
        this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
      }
      freeze() {
        this.frozen = !0;
      }
      unfreeze() {
        this.frozen = !1;
      }
      lock() {
        this.locked = !0;
      }
      unlock() {
        this.locked = !1;
      }
      debug(e, ...i) {
        if (!this.logger)
          return;
        const n = this.mirror.getId(e);
        let s = "[highlight-canvas-manager]";
        e && (s = `[highlight-canvas] [id:${n}]`, e.tagName.toLowerCase() === "canvas" && (s += ` [ctx:${e.__context}]`)), this.logger.debug(s, e, ...i);
      }
      snapshot(e) {
        return ne(this, null, function* () {
          var i;
          const n = this.mirror.getId(e);
          if (this.snapshotInProgressMap.get(n))
            return void this.debug(e, "snapshotting already in progress for", n);
          const s = 1e3 / (typeof this.options.samplingManual == "number" ? this.options.samplingManual : 1), o = this.lastSnapshotTime.get(n);
          if (!(o && (/* @__PURE__ */ new Date()).getTime() - o < s))
            if (this.debug(e, "starting snapshotting"), e.width !== 0 && e.height !== 0) {
              this.lastSnapshotTime.set(n, (/* @__PURE__ */ new Date()).getTime()), this.snapshotInProgressMap.set(n, !0);
              try {
                if (this.options.clearWebGLBuffer !== !1 && ["webgl", "webgl2"].includes(e.__context)) {
                  const d = e.getContext(e.__context);
                  ((i = d == null ? void 0 : d.getContextAttributes()) == null ? void 0 : i.preserveDrawingBuffer) === !1 && (d.clear(d.COLOR_BUFFER_BIT), this.debug(e, "cleared webgl canvas to load it into memory", { attributes: d == null ? void 0 : d.getContextAttributes() }));
                }
                if (e.width === 0 || e.height === 0)
                  return void this.debug(e, "not yet ready", { width: e.width, height: e.height });
                let r = this.options.resizeFactor || 1;
                if (this.options.maxSnapshotDimension) {
                  const d = Math.max(e.width, e.height);
                  r = Math.min(r, this.options.maxSnapshotDimension / d);
                }
                const a = e.width * r, l = e.height * r, c = yield createImageBitmap(e, { resizeWidth: a, resizeHeight: l });
                this.debug(e, "created image bitmap", { width: c.width, height: c.height }), this.worker.postMessage({ id: n, bitmap: c, width: a, height: l, dx: 0, dy: 0, dw: e.width, dh: e.height, dataURLOptions: this.options.dataURLOptions, logDebug: !!this.logger }, [c]), this.debug(e, "sent message");
              } catch (r) {
                this.debug(e, "failed to snapshot", r);
              } finally {
                this.snapshotInProgressMap.set(n, !1);
              }
            } else
              this.debug(e, "not yet ready", { width: e.width, height: e.height });
        });
      }
      initCanvasFPSObserver(e, i, n, s, o, r, a, l) {
        const c = ks(n, s, o, !0), d = 1e3 / i;
        let h, p = 0;
        const m = /* @__PURE__ */ new Map(), X = (y) => {
          const g = [];
          return n.document.querySelectorAll("canvas").forEach((b) => {
            if (!me(b, s, o, !0)) {
              this.debug(b, "discovered canvas"), g.push(b);
              const I = this.mirror.getId(b);
              m.has(I) || m.set(I, y);
            }
          }), g;
        }, Z = (y) => {
          const g = [];
          return e && n.document.querySelectorAll("video").forEach((b) => {
            if ((b.src === "" || b.src.indexOf("blob:") !== -1) && !me(b, s, o, !0)) {
              g.push(b);
              const I = this.mirror.getId(b);
              m.has(I) || m.set(I, y);
            }
          }), g;
        }, V = (y) => ne(this, null, function* () {
          if (p && y - p < d)
            return void (h = requestAnimationFrame(V));
          p = y;
          const g = (I) => {
            const R = this.mirror.getId(I), L = m.get(R), F = !r.initialSnapshotDelay || y - L > r.initialSnapshotDelay;
            return this.debug(I, { delay: r.initialSnapshotDelay, delta: y - L, hadLoadingTime: F }), F;
          }, b = [];
          b.push(...X(y).filter(g).map((I) => this.snapshot(I))), b.push(...Z(y).filter(g).map((I) => ne(this, null, function* () {
            this.debug(I, "starting video snapshotting");
            const R = this.mirror.getId(I);
            if (this.snapshotInProgressMap.get(R))
              this.debug(I, "video snapshotting already in progress for", R);
            else {
              this.snapshotInProgressMap.set(R, !0);
              try {
                const { width: L, height: F } = I.getBoundingClientRect(), { actualWidth: H, actualHeight: x } = { actualWidth: I.videoWidth, actualHeight: I.videoHeight }, N = Math.max(H, x);
                if (I.width === 0 || I.height === 0 || H === 0 || x === 0 || L === 0 || F === 0)
                  return void this.debug(I, "not yet ready", { width: I.width, height: I.height });
                let K = a || 1;
                l && (K = Math.min(K, l / N));
                const k = H * K, u = x * K, G = yield createImageBitmap(I, { resizeWidth: k, resizeHeight: u }), v = Math.max(L, F) / N, f = H * v, M = x * v, S = (L - f) / 2, T = (F - M) / 2;
                this.debug(I, "created image bitmap", { actualWidth: H, actualHeight: x, boxWidth: L, boxHeight: F, outputWidth: f, outputHeight: M, resizeWidth: k, resizeHeight: u, scale: K, outputScale: v, offsetX: S, offsetY: T }), this.worker.postMessage({ id: R, bitmap: G, width: k, height: u, dx: S, dy: T, dw: f, dh: M, dataURLOptions: r.dataURLOptions, logDebug: !!this.logger }, [G]), this.debug(I, "send message");
              } catch (L) {
                this.debug(I, "failed to snapshot", L);
              } finally {
                this.snapshotInProgressMap.set(R, !1);
              }
            }
          }))), yield Promise.all(b).catch(console.error), h = requestAnimationFrame(V);
        });
        h = requestAnimationFrame(V), this.resetObservers = () => {
          c(), h && cancelAnimationFrame(h);
        };
      }
      initCanvasMutationObserver(e, i, n) {
        this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
        const s = ks(e, i, n, !1), o = function(a, l, c, d) {
          const h = [], p = Object.getOwnPropertyNames(l.CanvasRenderingContext2D.prototype);
          for (const m of p)
            try {
              if (typeof l.CanvasRenderingContext2D.prototype[m] != "function")
                continue;
              const X = ct(l.CanvasRenderingContext2D.prototype, m, function(Z) {
                return function(...V) {
                  return me(this.canvas, c, d, !0) || setTimeout(() => {
                    const y = vs(V, l, this);
                    a(this.canvas, { type: dt["2D"], property: m, args: y });
                  }, 0), Z.apply(this, V);
                };
              });
              h.push(X);
            } catch (X) {
              const Z = $t(l.CanvasRenderingContext2D.prototype, m, { set(V) {
                a(this.canvas, { type: dt["2D"], property: m, args: [V], setter: !0 });
              } });
              h.push(Z);
            }
          return () => {
            h.forEach((m) => m());
          };
        }(this.processMutation.bind(this), e, i, n), r = function(a, l, c, d) {
          const h = [];
          return h.push(...Ts(l.WebGLRenderingContext.prototype, dt.WebGL, a, c, d, l)), l.WebGL2RenderingContext !== void 0 && h.push(...Ts(l.WebGL2RenderingContext.prototype, dt.WebGL2, a, c, d, l)), () => {
            h.forEach((p) => p());
          };
        }(this.processMutation.bind(this), e, i, n);
        this.resetObservers = () => {
          s(), o(), r();
        };
      }
      startPendingCanvasMutationFlusher() {
        requestAnimationFrame(() => this.flushPendingCanvasMutations());
      }
      startRAFTimestamping() {
        const e = (i) => {
          this.rafStamps.latestId = i, requestAnimationFrame(e);
        };
        requestAnimationFrame(e);
      }
      flushPendingCanvasMutations() {
        this.pendingCanvasMutations.forEach((e, i) => {
          const n = this.mirror.getId(i);
          this.flushPendingCanvasMutationFor(i, n);
        }), requestAnimationFrame(() => this.flushPendingCanvasMutations());
      }
      flushPendingCanvasMutationFor(e, i) {
        if (this.frozen || this.locked)
          return;
        const n = this.pendingCanvasMutations.get(e);
        if (!n || i === -1)
          return;
        const s = n.map((r) => Ue(r, ["type"])), { type: o } = n[0];
        this.mutationCb({ id: i, type: o, commands: s }), this.pendingCanvasMutations.delete(e);
      }
    }
    class Lr {
      constructor(e) {
        C(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), C(this, "mutationCb"), C(this, "adoptedStyleSheetCb"), C(this, "styleMirror", new Xr()), this.mutationCb = e.mutationCb, this.adoptedStyleSheetCb = e.adoptedStyleSheetCb;
      }
      attachLinkElement(e, i) {
        "_cssText" in i.attributes && this.mutationCb({ adds: [], removes: [], texts: [], attributes: [{ id: i.id, attributes: i.attributes }] }), this.trackLinkElement(e);
      }
      trackLinkElement(e) {
        this.trackedLinkElements.has(e) || (this.trackedLinkElements.add(e), this.trackStylesheetInLinkElement(e));
      }
      adoptStyleSheets(e, i) {
        if (e.length === 0)
          return;
        const n = { id: i, styleIds: [] }, s = [];
        for (const o of e) {
          let r;
          this.styleMirror.has(o) ? r = this.styleMirror.getId(o) : (r = this.styleMirror.add(o), s.push({ styleId: r, rules: Array.from(o.rules || CSSRule, (a, l) => ({ rule: En(a), index: l })) })), n.styleIds.push(r);
        }
        s.length > 0 && (n.styles = s), this.adoptedStyleSheetCb(n);
      }
      reset() {
        this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
      }
      trackStylesheetInLinkElement(e) {
      }
    }
    class xr {
      constructor() {
        C(this, "nodeMap", /* @__PURE__ */ new WeakMap()), C(this, "active", !1);
      }
      inOtherBuffer(e, i) {
        const n = this.nodeMap.get(e);
        return n && Array.from(n).some((s) => s !== i);
      }
      add(e, i) {
        this.active || (this.active = !0, requestAnimationFrame(() => {
          this.nodeMap = /* @__PURE__ */ new WeakMap(), this.active = !1;
        })), this.nodeMap.set(e, (this.nodeMap.get(e) || /* @__PURE__ */ new Set()).add(i));
      }
      destroy() {
      }
    }
    let oe, ri, kt, li = !1;
    try {
      if (Array.from([1], (t) => 2 * t)[0] !== 2) {
        const t = document.createElement("iframe");
        document.body.appendChild(t), Array.from = ((Yn = t.contentWindow) == null ? void 0 : Yn.Array.from) || Array.from, document.body.removeChild(t);
      }
    } catch (t) {
      console.debug("Unable to override Array.from", t);
    }
    const Te = new Mn();
    function Fe(t = {}) {
      var e, i, n, s, o, r, a, l;
      const { emit: c, checkoutEveryNms: d, checkoutEveryNth: h, blockClass: p = "highlight-block", blockSelector: m = null, ignoreClass: X = "highlight-ignore", ignoreSelector: Z = null, maskTextClass: V = "highlight-mask", maskTextSelector: y = null, inlineStylesheet: g = !0, maskAllInputs: b, maskInputOptions: I, slimDOMOptions: R, maskInputFn: L, maskTextFn: F = Yi, hooks: H, packFn: x, sampling: N = {}, mousemoveWait: K, recordDOM: k = !0, recordCanvas: u = !1, recordCrossOriginIframes: G = !1, recordAfter: v = t.recordAfter === "DOMContentLoaded" ? t.recordAfter : "load", userTriggeredOnInput: f = !1, collectFonts: M = !1, inlineImages: S = !1, plugins: T, keepIframeSrcFn: $ = () => !1, privacySetting: A = "default", ignoreCSSAttributes: B = /* @__PURE__ */ new Set([]), errorHandler: z, logger: Ie } = t, be = U(U({}, t.dataURLOptions), (i = (e = t.sampling) == null ? void 0 : e.canvas) == null ? void 0 : i.dataURLOptions);
      Rt = z;
      const J = !G || window.parent === window;
      let P = !1;
      if (!J)
        try {
          window.parent.document && (P = !1);
        } catch (D) {
          P = !0;
        }
      if (J && !c)
        throw new Error("emit function is required");
      if (!J && !P)
        return () => {
        };
      K !== void 0 && N.mousemove === void 0 && (N.mousemove = K), Te.reset();
      const ue = b === !0 ? { color: !0, date: !0, "datetime-local": !0, email: !0, month: !0, number: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0, textarea: !0, select: !0, password: !0 } : I !== void 0 ? I : { password: !0 }, pe = R === !0 || R === "all" ? { script: !0, comment: !0, headFavicon: !0, headWhitespace: !0, headMetaSocial: !0, headMetaRobots: !0, headMetaHttpEquiv: !0, headMetaVerification: !0, headMetaAuthorship: R === "all", headMetaDescKeywords: R === "all", headTitleMutations: R === "all" } : R || {};
      let Pe;
      (function(D = window) {
        "NodeList" in D && !D.NodeList.prototype.forEach && (D.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in D && !D.DOMTokenList.prototype.forEach && (D.DOMTokenList.prototype.forEach = Array.prototype.forEach);
      })();
      let Ft = 0;
      const Wi = (D) => {
        for (const Le of T || [])
          Le.eventProcessor && (D = Le.eventProcessor(D));
        return x && !P && (D = x(D)), D;
      };
      oe = (D, Le) => {
        var ie;
        const se = D;
        if (se.timestamp = ei(), !((ie = De[0]) != null && ie.isFrozen()) || se.type === q.FullSnapshot || se.type === q.IncrementalSnapshot && se.data.source === j.Mutation || De.forEach((ke) => ke.unfreeze()), J)
          c == null || c(Wi(se), Le);
        else if (P) {
          const ke = { type: "rrweb", event: Wi(se), origin: window.location.origin, isCheckout: Le };
          window.parent.postMessage(ke, "*");
        }
        if (se.type === q.FullSnapshot)
          Pe = se, Ft = 0;
        else if (se.type === q.IncrementalSnapshot) {
          if (se.data.source === j.Mutation && se.data.isAttachIframe)
            return;
          Ft++;
          const ke = h && Ft >= h, ee = d && se.timestamp - Pe.timestamp > d;
          (ke || ee) && ri(!0);
        }
      };
      const fi = (D) => {
        oe({ type: q.IncrementalSnapshot, data: U({ source: j.Mutation }, D) });
      }, nr = (D) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.Scroll }, D) }), sr = (D) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.CanvasMutation }, D) }), et = new Lr({ mutationCb: fi, adoptedStyleSheetCb: (D) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.AdoptedStyleSheet }, D) }) }), tt = new Cr({ mirror: Te, mutationCb: fi, stylesheetManager: et, recordCrossOriginIframes: G, wrappedEmit: oe });
      for (const D of T || [])
        D.getMirror && D.getMirror({ nodeMirror: Te, crossOriginIframeMirror: tt.crossOriginIframeMirror, crossOriginIframeStyleMirror: tt.crossOriginIframeStyleMirror });
      const Tn = new xr();
      kt = new Nr({ recordCanvas: u, recordVideos: S, mutationCb: sr, win: window, blockClass: p, blockSelector: m, mirror: Te, sampling: (n = N == null ? void 0 : N.canvas) == null ? void 0 : n.fps, samplingManual: (s = N == null ? void 0 : N.canvas) == null ? void 0 : s.fpsManual, clearWebGLBuffer: (o = N == null ? void 0 : N.canvas) == null ? void 0 : o.clearWebGLBuffer, initialSnapshotDelay: (r = N == null ? void 0 : N.canvas) == null ? void 0 : r.initialSnapshotDelay, dataURLOptions: be, resizeFactor: (a = N == null ? void 0 : N.canvas) == null ? void 0 : a.resizeFactor, maxSnapshotDimension: (l = N == null ? void 0 : N.canvas) == null ? void 0 : l.maxSnapshotDimension, logger: Ie });
      const Ri = new kr({ mutationCb: fi, scrollCb: nr, bypassOptions: { blockClass: p, blockSelector: m, maskTextClass: V, maskTextSelector: y, inlineStylesheet: g, maskInputOptions: ue, dataURLOptions: be, maskTextFn: F, maskInputFn: L, recordCanvas: u, inlineImages: S, privacySetting: A, sampling: N, slimDOMOptions: pe, iframeManager: tt, stylesheetManager: et, canvasManager: kt, keepIframeSrcFn: $, processedNodeManager: Tn }, mirror: Te });
      ri = (D = !1) => {
        if (!k)
          return;
        oe({ type: q.Meta, data: { href: window.location.href, width: as(), height: ls() } }, D), et.reset(), Ri.init(), De.forEach((ie) => ie.lock());
        const Le = function(ie, se) {
          const { mirror: ke = new Mn(), blockClass: ee = "highlight-block", blockSelector: Ht = null, maskTextClass: Sa = "highlight-mask", maskTextSelector: Xa = null, inlineStylesheet: Va = !0, inlineImages: Ga = !1, recordCanvas: Wa = !1, maskAllInputs: wn = !1, maskTextFn: fa, maskInputFn: Ra, slimDOM: vi = !1, dataURLOptions: va, preserveWhiteSpace: Ca, onSerialize: ka, onIframeLoad: Ta, iframeLoadTimeout: wa, onStylesheetLoad: Na, stylesheetLoadTimeout: La, keepIframeSrcFn: xa = () => !1, privacySetting: Ja = "default" } = se || {};
          return ot(ie, { doc: ie, mirror: ke, blockClass: ee, blockSelector: Ht, maskTextClass: Sa, maskTextSelector: Xa, skipChild: !1, inlineStylesheet: Va, maskInputOptions: wn === !0 ? { color: !0, date: !0, "datetime-local": !0, email: !0, month: !0, number: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0, textarea: !0, select: !0, password: !0 } : wn === !1 ? { password: !0 } : wn, maskTextFn: fa, maskInputFn: Ra, slimDOMOptions: vi || vi === "all" ? { script: !0, comment: !0, headFavicon: !0, headWhitespace: !0, headMetaDescKeywords: vi === "all", headMetaSocial: !0, headMetaRobots: !0, headMetaHttpEquiv: !0, headMetaAuthorship: !0, headMetaVerification: !0 } : vi || {}, dataURLOptions: va, inlineImages: Ga, recordCanvas: Wa, preserveWhiteSpace: Ca, onSerialize: ka, onIframeLoad: Ta, iframeLoadTimeout: wa, onStylesheetLoad: Na, stylesheetLoadTimeout: La, keepIframeSrcFn: xa, newlyAddedElement: !1, privacySetting: Ja });
        }(document, { mirror: Te, blockClass: p, blockSelector: m, maskTextClass: V, maskTextSelector: y, inlineStylesheet: g, maskAllInputs: ue, maskTextFn: F, maskInputFn: L, slimDOM: pe, dataURLOptions: be, recordCanvas: u, inlineImages: S, privacySetting: A, onSerialize: (ie) => {
          us(ie, Te) && tt.addIframe(ie), hs(ie, Te) && et.trackLinkElement(ie), Pi(ie) && Ri.addShadowRoot(Wt(ie), document);
        }, onIframeLoad: (ie, se) => {
          tt.attachIframe(ie, se), Ri.observeAttachShadow(ie);
        }, onStylesheetLoad: (ie, se) => {
          et.attachLinkElement(ie, se);
        }, keepIframeSrcFn: $ });
        if (!Le)
          return console.warn("Failed to snapshot the document");
        oe({ type: q.FullSnapshot, data: { node: Le, initialOffset: rs(window) } }, D), De.forEach((ie) => ie.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && et.adoptStyleSheets(document.adoptedStyleSheets, Te.getId(document));
      };
      try {
        const D = [], Le = (se) => {
          var ke;
          return _(vr)({ mutationCb: fi, mousemoveCb: (ee, Ht) => oe({ type: q.IncrementalSnapshot, data: { source: Ht, positions: ee } }), mouseInteractionCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.MouseInteraction }, ee) }), scrollCb: nr, viewportResizeCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.ViewportResize }, ee) }), inputCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.Input }, ee) }), mediaInteractionCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.MediaInteraction }, ee) }), styleSheetRuleCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.StyleSheetRule }, ee) }), styleDeclarationCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.StyleDeclaration }, ee) }), canvasMutationCb: sr, fontCb: (ee) => oe({ type: q.IncrementalSnapshot, data: U({ source: j.Font }, ee) }), selectionCb: (ee) => {
            oe({ type: q.IncrementalSnapshot, data: U({ source: j.Selection }, ee) });
          }, customElementCb: (ee) => {
            oe({ type: q.IncrementalSnapshot, data: U({ source: j.CustomElement }, ee) });
          }, blockClass: p, ignoreClass: X, ignoreSelector: Z, maskTextClass: V, maskTextSelector: y, maskInputOptions: ue, inlineStylesheet: g, sampling: N, recordDOM: k, recordCanvas: u, inlineImages: S, userTriggeredOnInput: f, collectFonts: M, doc: se, maskInputFn: L, maskTextFn: F, keepIframeSrcFn: $, blockSelector: m, slimDOMOptions: pe, dataURLOptions: be, mirror: Te, iframeManager: tt, stylesheetManager: et, shadowDomManager: Ri, processedNodeManager: Tn, canvasManager: kt, ignoreCSSAttributes: B, privacySetting: A, plugins: ((ke = T == null ? void 0 : T.filter((ee) => ee.observer)) == null ? void 0 : ke.map((ee) => ({ observer: ee.observer, options: ee.options, callback: (Ht) => oe({ type: q.Plugin, data: { plugin: ee.name, payload: Ht } }) }))) || [] }, H);
        };
        tt.addLoadListener((se) => {
          try {
            D.push(Le(se.contentDocument));
          } catch (ke) {
            console.warn(ke);
          }
        });
        const ie = () => {
          ri(), D.push(Le(document)), li = !0;
        };
        return document.readyState === "interactive" || document.readyState === "complete" ? ie() : (D.push(Ze("DOMContentLoaded", () => {
          oe({ type: q.DomContentLoaded, data: {} }), v === "DOMContentLoaded" && ie();
        })), D.push(Ze("load", () => {
          oe({ type: q.Load, data: {} }), v === "load" && ie();
        }, window))), () => {
          D.forEach((se) => se()), Tn.destroy(), li = !1, Rt = void 0;
        };
      } catch (D) {
        console.warn(D);
      }
    }
    var xs, ht;
    Fe.addCustomEvent = (t, e) => {
      li && oe({ type: q.Custom, data: { tag: t, payload: e } });
    }, Fe.freezePage = () => {
      De.forEach((t) => t.freeze());
    }, Fe.takeFullSnapshot = (t) => {
      if (!li)
        throw new Error("please take full snapshot after start recording");
      ri(t);
    }, Fe.snapshotCanvas = (t) => ne(this, null, function* () {
      if (!kt)
        throw new Error("canvas manager is not initialized");
      yield kt.snapshot(t);
    }), Fe.mirror = Te, (ht = xs || (xs = {}))[ht.NotStarted = 0] = "NotStarted", ht[ht.Running = 1] = "Running", ht[ht.Stopped = 2] = "Stopped";
    const { addCustomEvent: Js } = Fe, Ys = { key: "_sid" }, Jr = (t) => {
      const e = t ? Object.assign({}, Ys, t) : Ys;
      let i = 0;
      return { name: "rrweb/sequential-id@1", eventProcessor: (n) => (Object.assign(n, { [e.key]: ++i }), n), options: e };
    };
    function Yr(t) {
      if (!t || !t.outerHTML)
        return "";
      let e = "";
      for (; t.parentElement; ) {
        let i = t.localName;
        if (!i)
          break;
        i = i.toLowerCase();
        let n = t.parentElement, s = [];
        if (n.children && n.children.length > 0)
          for (let o = 0; o < n.children.length; o++) {
            let r = n.children[o];
            r.localName && r.localName.toLowerCase && r.localName.toLowerCase() === i && s.push(r);
          }
        s.length > 1 && (i += ":eq(" + s.indexOf(t) + ")"), e = i + (e ? ">" + e : ""), t = n;
      }
      return e;
    }
    function Di(t) {
      return Object.prototype.toString.call(t) === "[object Object]";
    }
    function Ks(t, e) {
      if (e === 0)
        return !0;
      const i = Object.keys(t);
      for (const n of i)
        if (Di(t[n]) && Ks(t[n], e - 1))
          return !0;
      return !1;
    }
    function Qi(t, e) {
      const i = { numOfKeysLimit: 50, depthOfLimit: 4 };
      Object.assign(i, e);
      const n = [], s = [];
      return JSON.stringify(t, function(o, r) {
        if (n.length > 0) {
          const a = n.indexOf(this);
          ~a ? n.splice(a + 1) : n.push(this), ~a ? s.splice(a, 1 / 0, o) : s.push(o), ~n.indexOf(r) && (r = n[0] === r ? "[Circular ~]" : "[Circular ~." + s.slice(0, n.indexOf(r)).join(".") + "]");
        } else
          n.push(r);
        if (r == null)
          return r;
        if (function(a) {
          return Di(a) && Object.keys(a).length > i.numOfKeysLimit || typeof a == "function" ? !0 : a instanceof Event && a.isTrusted === !1 ? Object.keys(a).length === 1 : !!(Di(a) && Ks(a, i.depthOfLimit));
        }(r))
          return function(a) {
            let l = a.toString();
            return i.stringLengthLimit && l.length > i.stringLengthLimit && (l = `${l.slice(0, i.stringLengthLimit)}...`), l;
          }(r);
        if (r instanceof Event) {
          const a = {};
          for (const l in r) {
            const c = r[l];
            Array.isArray(c) ? a[l] = Yr(c.length ? c[0] : null) : a[l] = c;
          }
          return a;
        }
        return r instanceof Node ? r instanceof HTMLElement ? r ? r.outerHTML : "" : r.nodeName : r instanceof Error ? r.name + ": " + r.message : r;
      });
    }
    function Kr() {
      return (t = document.createElement("canvas")).getContext && t.getContext("2d") && t.toDataURL("image/webp").indexOf("data:image/webp") == 0 ? { type: "image/webp", quality: 0.9 } : { type: "image/jpeg", quality: 0.6 };
      var t;
    }
    var Ur = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : typeof Nn != "undefined" ? Nn : typeof self != "undefined" ? self : {};
    function ji(t) {
      return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
    }
    var Us, Qe, Fs, Ai, Hs, Es = { exports: {} }, Ms = { exports: {} };
    function Fr() {
      return Us || (Us = 1, Ms.exports = function() {
        function t(m) {
          return !isNaN(parseFloat(m)) && isFinite(m);
        }
        function e(m) {
          return m.charAt(0).toUpperCase() + m.substring(1);
        }
        function i(m) {
          return function() {
            return this[m];
          };
        }
        var n = ["isConstructor", "isEval", "isNative", "isToplevel"], s = ["columnNumber", "lineNumber"], o = ["fileName", "functionName", "source"], r = ["args"], a = ["evalOrigin"], l = n.concat(s, o, r, a);
        function c(m) {
          if (m)
            for (var X = 0; X < l.length; X++)
              m[l[X]] !== void 0 && this["set" + e(l[X])](m[l[X]]);
        }
        c.prototype = { getArgs: function() {
          return this.args;
        }, setArgs: function(m) {
          if (Object.prototype.toString.call(m) !== "[object Array]")
            throw new TypeError("Args must be an Array");
          this.args = m;
        }, getEvalOrigin: function() {
          return this.evalOrigin;
        }, setEvalOrigin: function(m) {
          if (m instanceof c)
            this.evalOrigin = m;
          else {
            if (!(m instanceof Object))
              throw new TypeError("Eval Origin must be an Object or StackFrame");
            this.evalOrigin = new c(m);
          }
        }, toString: function() {
          var m = this.getFileName() || "", X = this.getLineNumber() || "", Z = this.getColumnNumber() || "", V = this.getFunctionName() || "";
          return this.getIsEval() ? m ? "[eval] (" + m + ":" + X + ":" + Z + ")" : "[eval]:" + X + ":" + Z : V ? V + " (" + m + ":" + X + ":" + Z + ")" : m + ":" + X + ":" + Z;
        } }, c.fromString = function(m) {
          var X = m.indexOf("("), Z = m.lastIndexOf(")"), V = m.substring(0, X), y = m.substring(X + 1, Z).split(","), g = m.substring(Z + 1);
          if (g.indexOf("@") === 0)
            var b = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(g, ""), I = b[1], R = b[2], L = b[3];
          return new c({ functionName: V, args: y || void 0, fileName: I, lineNumber: R || void 0, columnNumber: L || void 0 });
        };
        for (var d = 0; d < n.length; d++)
          c.prototype["get" + e(n[d])] = i(n[d]), c.prototype["set" + e(n[d])] = /* @__PURE__ */ function(m) {
            return function(X) {
              this[m] = !!X;
            };
          }(n[d]);
        for (var h = 0; h < s.length; h++)
          c.prototype["get" + e(s[h])] = i(s[h]), c.prototype["set" + e(s[h])] = /* @__PURE__ */ function(m) {
            return function(X) {
              if (!t(X))
                throw new TypeError(m + " must be a Number");
              this[m] = Number(X);
            };
          }(s[h]);
        for (var p = 0; p < o.length; p++)
          c.prototype["get" + e(o[p])] = i(o[p]), c.prototype["set" + e(o[p])] = /* @__PURE__ */ function(m) {
            return function(X) {
              this[m] = String(X);
            };
          }(o[p]);
        return c;
      }()), Ms.exports;
    }
    Es.exports = (Qe = Fr(), Fs = /(^|@)\S+:\d+/, Ai = /^\s*at .*(\S+:\d+|\(native\))/m, Hs = /^(eval@)?(\[native code])?$/, { parse: function(t) {
      if (t.stacktrace !== void 0 || t["opera#sourceloc"] !== void 0)
        return this.parseOpera(t);
      if (t.stack && t.stack.match(Ai))
        return this.parseV8OrIE(t);
      if (t.stack)
        return this.parseFFOrSafari(t);
      throw new Error("Cannot parse given Error object");
    }, extractLocation: function(t) {
      if (t.indexOf(":") === -1)
        return [t];
      var e = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(t.replace(/[()]/g, ""));
      return [e[1], e[2] || void 0, e[3] || void 0];
    }, parseV8OrIE: function(t) {
      return t.stack.split(`
`).filter(function(e) {
        return !!e.match(Ai);
      }, this).map(function(e) {
        e.indexOf("(eval ") > -1 && (e = e.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, ""));
        var i = e.replace(/^\s+/, "").replace(/\(eval code/g, "("), n = i.match(/ (\((.+):(\d+):(\d+)\)$)/), s = (i = n ? i.replace(n[0], "") : i).split(/\s+/).slice(1), o = this.extractLocation(n ? n[1] : s.pop()), r = s.join(" ") || void 0, a = ["eval", "<anonymous>"].indexOf(o[0]) > -1 ? void 0 : o[0];
        return new Qe({ functionName: r, fileName: a, lineNumber: o[1], columnNumber: o[2], source: e });
      }, this);
    }, parseFFOrSafari: function(t) {
      return t.stack.split(`
`).filter(function(e) {
        return !e.match(Hs);
      }, this).map(function(e) {
        if (e.indexOf(" > eval") > -1 && (e = e.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), e.indexOf("@") === -1 && e.indexOf(":") === -1)
          return new Qe({ functionName: e });
        var i = /((.*".+"[^@]*)?[^@]*)(?:@)/, n = e.match(i), s = n && n[1] ? n[1] : void 0, o = this.extractLocation(e.replace(i, ""));
        return new Qe({ functionName: s, fileName: o[0], lineNumber: o[1], columnNumber: o[2], source: e });
      }, this);
    }, parseOpera: function(t) {
      return !t.stacktrace || t.message.indexOf(`
`) > -1 && t.message.split(`
`).length > t.stacktrace.split(`
`).length ? this.parseOpera9(t) : t.stack ? this.parseOpera11(t) : this.parseOpera10(t);
    }, parseOpera9: function(t) {
      for (var e = /Line (\d+).*script (?:in )?(\S+)/i, i = t.message.split(`
`), n = [], s = 2, o = i.length; s < o; s += 2) {
        var r = e.exec(i[s]);
        r && n.push(new Qe({ fileName: r[2], lineNumber: r[1], source: i[s] }));
      }
      return n;
    }, parseOpera10: function(t) {
      for (var e = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, i = t.stacktrace.split(`
`), n = [], s = 0, o = i.length; s < o; s += 2) {
        var r = e.exec(i[s]);
        r && n.push(new Qe({ functionName: r[3] || void 0, fileName: r[2], lineNumber: r[1], source: i[s] }));
      }
      return n;
    }, parseOpera11: function(t) {
      return t.stack.split(`
`).filter(function(e) {
        return !!e.match(Fs) && !e.match(/^Error created at/);
      }, this).map(function(e) {
        var i, n = e.split("@"), s = this.extractLocation(n.pop()), o = n.shift() || "", r = o.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
        o.match(/\(([^)]*)\)/) && (i = o.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
        var a = i === void 0 || i === "[arguments not available]" ? void 0 : i.split(",");
        return new Qe({ functionName: r, args: a, fileName: s[0], lineNumber: s[1], columnNumber: s[2], source: e });
      }, this);
    } });
    const Tt = ji(Es.exports);
    function Hr(t, e) {
      const i = e.logger;
      if (!i)
        return () => {
        };
      let n;
      n = typeof i == "string" ? window[i] : i;
      const s = [];
      if (e.level.includes("error") && window) {
        const r = (a) => {
          const { message: l, error: c } = a;
          let d = [];
          c && (d = Tt.parse(c));
          const h = [Qi(l, e.stringifyOptions)];
          t({ type: "Error", trace: d, time: Date.now(), value: h });
        };
        window.addEventListener("error", r), s.push(() => {
          window && window.removeEventListener("error", r);
        });
      }
      for (const r of e.level)
        s.push(o(n, r));
      return () => {
        s.forEach((r) => r());
      };
      function o(r, a) {
        return r[a] ? function(l, c, d) {
          try {
            if (!(c in l))
              return () => {
              };
            const h = l[c], p = d(h);
            return typeof p == "function" && (p.prototype = p.prototype || {}, Object.defineProperties(p, { __rrweb_original__: { enumerable: !1, value: h } })), l[c] = p, () => {
              l[c] = h;
            };
          } catch (h) {
            return () => {
            };
          }
        }(r, a, (l) => (...c) => {
          l.apply(this, c);
          try {
            const d = Tt.parse(new Error()), h = e.serializeConsoleAttributes ? c.map((p) => typeof p == "object" ? Qi(p, e.stringifyOptions) : p) : c.filter((p) => typeof p != "object").map((p) => `${p}`);
            t({ type: a, trace: d.slice(1), value: h, attributes: Qi(c.filter((p) => typeof p == "object").reduce((p, m) => U(U({}, p), m), {}), e.stringifyOptions), time: Date.now() });
          } catch (d) {
            l("highlight logger error:", d, ...c);
          }
        }) : () => {
        };
      }
    }
    var zs = { exports: {} };
    (function(t, e) {
      function i(n, s) {
        var o = [], r = [];
        return s == null && (s = function(a, l) {
          return o[0] === l ? "[Circular ~]" : "[Circular ~." + r.slice(0, o.indexOf(l)).join(".") + "]";
        }), function(a, l) {
          if (o.length > 0) {
            var c = o.indexOf(this);
            ~c ? o.splice(c + 1) : o.push(this), ~c ? r.splice(c, 1 / 0, a) : r.push(a), ~o.indexOf(l) && (l = s.call(this, a, l));
          } else
            o.push(l);
          return n == null ? l : n.call(this, a, l);
        };
      }
      (t.exports = function(n, s, o, r) {
        return JSON.stringify(n, i(s, r), o);
      }).getSerialize = i;
    })(zs);
    const je = ji(zs.exports);
    function _i(t, e, i, n) {
      var s, o, r, a;
      let l = [];
      try {
        l = Tt.parse(n != null ? n : e);
      } catch (h) {
        l = Tt.parse(new Error());
      }
      let c = {};
      e instanceof Error && (e = e.message).cause && (c = { "exception.cause": e.cause });
      const d = Mr(l);
      t({ event: je(e), type: "window.onerror", url: window.location.href, source: i != null ? i : "", lineNumber: (s = d[0]) != null && s.lineNumber ? (o = d[0]) == null ? void 0 : o.lineNumber : 0, columnNumber: (r = d[0]) != null && r.columnNumber ? (a = d[0]) == null ? void 0 : a.columnNumber : 0, stackTrace: d, timestamp: (/* @__PURE__ */ new Date()).toISOString(), payload: c ? je(c) : void 0 });
    }
    const Er = (t, { enablePromisePatch: e }) => {
      if (typeof window == "undefined")
        return () => {
        };
      const i = window.onerror = (r, a, l, c, d) => {
        _i(t, r, a, d);
      }, n = window.onunhandledrejection = (r) => {
        if (r.reason) {
          const a = r.promise;
          a.getStack ? _i(t, r.reason, r.type, a.getStack()) : _i(t, r.reason, r.type);
        }
      }, s = window.Promise, o = class extends s {
        constructor(r) {
          super(r), w(this, "promiseCreationError"), this.promiseCreationError = new Error();
        }
        getStack() {
          return this.promiseCreationError;
        }
        static shouldPatch() {
          const r = window.Zone === void 0;
          return e && r;
        }
      };
      return o.shouldPatch() && (window.Promise = o), () => {
        window.Promise = s, window.onunhandledrejection = n, window.onerror = i;
      };
    }, Mr = (t) => {
      var e, i;
      if (t.length === 0)
        return t;
      const n = t[0];
      return (e = n.fileName) != null && e.includes("highlight.run") || (i = n.fileName) != null && i.includes("highlight.io") || n.functionName === "new highlightPromise" ? t.slice(1) : t;
    }, zr = ["assert", "count", "countReset", "debug", "dir", "dirxml", "error", "group", "groupCollapsed", "groupEnd", "info", "log", "table", "time", "timeEnd", "timeLog", "trace", "warn"];
    var Ae = ((t) => (t.DeviceMemory = "DeviceMemory", t.ViewportHeight = "ViewportHeight", t.ViewportWidth = "ViewportWidth", t.ScreenHeight = "ScreenHeight", t.ScreenWidth = "ScreenWidth", t.ViewportArea = "ViewportArea", t))(Ae || {}), Re = ((t) => (t.Device = "Device", t.WebVital = "WebVital", t.Performance = "Performance", t.Frontend = "Frontend", t.Backend = "Backend", t))(Re || {});
    const Os = ['["\\"Script error.\\""]', '"Script error."', '["\\"Load failed.\\""]', '"Load failed."', '["\\"Network request failed.\\""]', '"Network request failed."', '["\\"Document is not focused.\\""]', '"Document is not focused."', '["\\"Failed to fetch\\""]', '"Failed to fetch"', '[{"isTrusted":true}]', '{"isTrusted":true}', '["{}"]', '"{}"', '[""]', '""', '["\\"\\""]', '""'], Ps = ["websocket error", '\\"ResizeObserver loop'], Bs = (t, e, i) => {
      const n = Or(e, t.headers, i);
      return Ve(U({}, t), { headers: n });
    }, Or = (t, e, i) => {
      var n, s;
      const o = U({}, e);
      return i ? ((n = Object.keys(o)) == null || n.forEach((r) => {
        [...i].includes(r == null ? void 0 : r.toLowerCase()) || (o[r] = "[REDACTED]");
      }), o) : ((s = Object.keys(o)) == null || s.forEach((r) => {
        [...Pr, ...t].includes(r == null ? void 0 : r.toLowerCase()) && (o[r] = "[REDACTED]");
      }), o);
    }, Pr = ["authorization", "cookie", "proxy-authorization", "token"], Br = ["https://www.googleapis.com/identitytoolkit", "https://securetoken.googleapis.com"];
    var ce = ((t) => (t.RECORDING_START_TIME = "highlightRecordingStartTime", t.SEGMENT_LAST_SENT_HASH_KEY = "HIGHLIGHT_SEGMENT_LAST_SENT_HASH_KEY", t.SESSION_DATA = "sessionData", t.SESSION_SECURE_ID = "sessionSecureID", t.USER_IDENTIFIER = "highlightIdentifier", t.USER_OBJECT = "highlightUserObject", t.PAYLOAD_ID = "payloadId", t))(ce || {});
    let qi = "localStorage", Dr = new class {
      constructor() {
        w(this, "storage", {});
      }
      getItem(t) {
        var e;
        return (e = this.storage[t]) != null ? e : "";
      }
      setItem(t, e) {
        this.storage[t] = e;
      }
      removeItem(t) {
        delete this.storage[t];
      }
    }();
    const $i = () => {
      try {
        switch (qi) {
          case "localStorage":
            return window.localStorage;
          case "sessionStorage":
            return window.sessionStorage;
        }
      } catch (t) {
        return Dr;
      }
    }, Xe = (t) => $i().getItem(t), we = (t, e) => $i().setItem(t, e), en = (t) => $i().removeItem(t), Qr = (t) => {
      if (qi === "sessionStorage")
        return void console.warn("highlight.io cannot use local storage; segment integration will not work");
      const e = window.localStorage.setItem;
      window.localStorage.setItem = function() {
        const [i, n] = arguments;
        t({ keyName: i, keyValue: n }), e.apply(this, [i, n]);
      };
    }, Ds = { normal: { bytes: 1e7, time: 24e4 }, canvas: { bytes: 16e6, time: 5e3 } }, Qs = () => {
      let t = JSON.parse(Xe(ce.SESSION_DATA) || "{}");
      if (t && t.lastPushTime && Date.now() - t.lastPushTime < 9e5)
        return t;
    }, tn = function(t) {
      t !== null ? (we(ce.SESSION_DATA, JSON.stringify(t)), js(t.sessionSecureID)) : en(ce.SESSION_DATA);
    }, js = function(t) {
      return we(ce.SESSION_SECURE_ID, t);
    }, As = "X-Highlight-Request", _s = (t) => {
      let e = t;
      return t.startsWith("https://") || t.startsWith("http://") || (e = `${window.location.origin}${e}`), e.replace(/\/+$/, "");
    }, qs = (t, e, i, n) => {
      t.sort((a, l) => a.responseEnd - l.responseEnd);
      const s = t.reduce((a, l) => {
        const c = _s(l.name);
        return l.initiatorType === i ? a[i][c] = [...a[i][c] || [], l] : a.others[c] = [...a.others[c] || [], l], a;
      }, { xmlhttprequest: {}, others: {}, fetch: {} });
      let o = {};
      o = e.reduce((a, l) => {
        const c = _s(l.request.url);
        return a[c] = [...a[c] || [], l], a;
      }, o);
      for (let a in s[i]) {
        const l = s[i][a], c = o[a];
        if (!c)
          continue;
        const d = Math.max(l.length - c.length, 0);
        for (let h = d; h < l.length; h++)
          l[h] && (l[h].requestResponsePair = c[h - d]);
      }
      let r = [];
      for (let a in s)
        for (let l in s[a])
          r = r.concat(s[a][l]);
      return r.sort((a, l) => a.fetchStart - l.fetchStart).reduce((a, l) => {
        let c = l.requestResponsePair;
        return c && (c = ((d, { headersToRedact: h, headersToRecord: p, requestResponseSanitizer: m }) => {
          var X, Z;
          let V = d;
          if (m) {
            let R = !0;
            try {
              V.request.body = JSON.parse(V.request.body);
            } catch (F) {
              R = !1;
            }
            let L = !0;
            try {
              V.response.body = JSON.parse(V.response.body);
            } catch (F) {
              L = !1;
            }
            try {
              V = m(V);
            } catch (F) {
            } finally {
              R = R && !!((X = V == null ? void 0 : V.request) != null && X.body), L = L && !!((Z = V == null ? void 0 : V.response) != null && Z.body), R && (V.request.body = JSON.stringify(V.request.body)), L && (V.response.body = JSON.stringify(V.response.body));
            }
            if (!V)
              return null;
          }
          const y = V, { request: g, response: b } = y, I = Ue(y, ["request", "response"]);
          return U({ request: Bs(g, h, p), response: Bs(b, h, p) }, I);
        })(l.requestResponsePair, n), !c) || (l.toJSON = function() {
          const d = window.performance.timeOrigin;
          return { initiatorType: this.initiatorType, startTimeAbs: d + this.startTime, connectStartAbs: d + this.connectStart, connectEndAbs: d + this.connectEnd, domainLookupStartAbs: d + this.domainLookupStart, domainLookupEndAbs: d + this.domainLookupEnd, fetchStartAbs: d + this.fetchStart, redirectStartAbs: d + this.redirectStart, redirectEndAbs: d + this.redirectEnd, requestStartAbs: d + this.requestStart, responseStartAbs: d + this.responseStart, responseEndAbs: d + this.responseEnd, secureConnectionStartAbs: d + this.secureConnectionStart, workerStartAbs: d + this.workerStart, name: this.name, transferSize: this.transferSize, encodedBodySize: this.encodedBodySize, decodedBodySize: this.decodedBodySize, nextHopProtocol: this.nextHopProtocol, requestResponsePairs: c };
        }, a.push(l)), a;
      }, []);
    }, nn = (t, e, i) => {
      return s = e, !((n = t).toLocaleLowerCase().includes("https://localhost:8082/public") || n.toLocaleLowerCase().includes("highlight.io") || n.toLocaleLowerCase().includes(s)) || sn(t, i);
      var n, s;
    }, sn = (t, e) => {
      var i;
      let n = [];
      e === !0 ? (n = ["localhost", /^\//], (i = window == null ? void 0 : window.location) != null && i.host && n.push(window.location.host)) : e instanceof Array && (n = e);
      let s = !1;
      return n.forEach((o) => {
        t.match(o) && (s = !0);
      }), s;
    };
    function jr(t) {
      for (var e = "", i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = 0; n < t; n++)
        e += i.charAt(Math.floor(62 * Math.random()));
      return e;
    }
    const $s = () => {
      return [(t = Xe(ce.SESSION_SECURE_ID)) != null ? t : "", jr(10)];
      var t;
    }, eo = (t, e) => t + "/" + e, Ar = (t, e, i, n, s, o) => {
      const r = XMLHttpRequest.prototype, a = r.open, l = r.send, c = r.setRequestHeader;
      return r.open = function(d, h) {
        return this._url = typeof h == "string" ? h : h.toString(), this._method = d, this._requestHeaders = {}, this._shouldRecordHeaderAndBody = !n.some((p) => this._url.toLowerCase().includes(p)), a.apply(this, arguments);
      }, r.setRequestHeader = function(d, h) {
        return this._requestHeaders[d] = h, c.apply(this, arguments);
      }, r.send = function(d) {
        if (!nn(this._url, e, i))
          return l.apply(this, arguments);
        const [h, p] = $s();
        sn(this._url, i) && this.setRequestHeader(As, eo(h, p));
        const m = this._shouldRecordHeaderAndBody, X = { sessionSecureID: h, id: p, url: this._url, verb: this._method, headers: m ? this._requestHeaders : {}, body: void 0 };
        if (m && d) {
          const Z = to(d, X.url);
          Z && (this._body = Z, X.body = _e(Z, s, o, X.headers));
        }
        return this.addEventListener("load", function() {
          return ne(this, null, function* () {
            const Z = { status: this.status, headers: {}, body: void 0 };
            if (m) {
              const V = this.getAllResponseHeaders().trim().split(/[\r\n]+/), y = {};
              if (V.forEach(function(g) {
                const b = g.split(": "), I = b.shift();
                y[I] = b.join(": ");
              }), Z.headers = y, d) {
                const g = to(d, X.url);
                g && (X.body = _e(g, s, o, Z.headers));
              }
              if (this.responseType === "" || this.responseType === "text")
                Z.body = _e(this.responseText, s, o, Z.headers), Z.size = 8 * this.responseText.length;
              else if (this.responseType === "blob") {
                if (this.response instanceof Blob)
                  try {
                    const g = yield this.response.text();
                    Z.body = _e(g, s, o, Z.headers), Z.size = this.response.size;
                  } catch (g) {
                  }
              } else
                try {
                  Z.body = _e(this.response, s, o, Z.headers);
                } catch (g) {
                }
            }
            t({ request: X, response: Z, urlBlocked: !m });
          });
        }), this.addEventListener("error", function() {
          return ne(this, null, function* () {
            const Z = { status: this.status, headers: void 0, body: void 0 };
            t({ request: X, response: Z, urlBlocked: !1 });
          });
        }), l.apply(this, arguments);
      }, () => {
        r.open = a, r.send = l, r.setRequestHeader = c;
      };
    }, to = (t, e) => {
      if (typeof t == "string") {
        if (!(e != null && e.includes("localhost")) && !(e != null && e.includes("highlight.run")) || !t.includes("pushPayload"))
          return t;
      } else if (typeof t == "object" || typeof t == "number" || typeof t == "boolean")
        return je(t);
      return null;
    }, _r = { "application/json": 67108864, "text/plain": 67108864 }, _e = (t, e, i, n) => {
      var s, o, r;
      let a = 65536;
      if (n) {
        let l = "";
        l = typeof n.get == "function" ? (s = n.get("content-type")) != null ? s : "" : (o = n["content-type"]) != null ? o : "";
        try {
          l = l.split(";")[0];
        } catch (c) {
        }
        a = (r = _r[l]) != null ? r : 65536;
      }
      if (t) {
        if (e)
          try {
            const l = JSON.parse(t);
            Array.isArray(l) ? l.forEach((c) => {
              Object.keys(c).forEach((d) => {
                e.includes(d.toLocaleLowerCase()) && (c[d] = "[REDACTED]");
              });
            }) : Object.keys(l).forEach((c) => {
              e.includes(c.toLocaleLowerCase()) && (l[c] = "[REDACTED]");
            }), t = JSON.stringify(l);
          } catch (l) {
          }
        if (i)
          try {
            const l = JSON.parse(t);
            Object.keys(l).forEach((c) => {
              i.includes(c.toLocaleLowerCase()) || (l[c] = "[REDACTED]");
            }), t = JSON.stringify(l);
          } catch (l) {
          }
      }
      try {
        t = t.slice(0, a);
      } catch (l) {
      }
      return t;
    }, qr = (t, e, i, n, s, o) => {
      const r = window._fetchProxy;
      return window._fetchProxy = function(a, l) {
        const { method: c, url: d } = $r(a, l);
        if (!nn(d, e, i))
          return r.call(this, a, l);
        const [h, p] = $s();
        if (sn(d, i)) {
          l = l || {};
          let V = new Headers(l.headers);
          a instanceof Request && [...a.headers].forEach(([y, g]) => V.set(y, g)), V.set(As, eo(h, p)), l.headers = Object.fromEntries(V.entries());
        }
        const m = { sessionSecureID: h, id: p, headers: {}, body: void 0, url: d, verb: c }, X = !n.some((V) => d.toLowerCase().includes(V));
        X && (m.headers = Object.fromEntries(new Headers(l == null ? void 0 : l.headers).entries()), m.body = _e(l == null ? void 0 : l.body, s, o, l == null ? void 0 : l.headers));
        let Z = r.call(this, a, l);
        return el(Z, m, t, X, s, o), Z;
      }, () => {
        window._fetchProxy = r;
      };
    }, $r = (t, e) => {
      const i = e && e.method || typeof t == "object" && "method" in t && t.method || "GET";
      let n;
      return n = typeof t == "object" ? "url" in t && t.url ? t.url : t.toString() : t, { method: i, url: n };
    }, el = (t, e, i, n, s, o) => {
      t.then((r) => ne(this, null, function* () {
        let a = { body: void 0, headers: void 0, status: 0, size: 0 }, l = !1, c = !n;
        "stack" in r || r instanceof Error ? (a = Ve(U({}, a), { body: r.message, status: 0, size: void 0 }), l = !0) : "status" in r && (a = Ve(U({}, a), { status: r.status }), n && (a.body = yield tl(r, o, s), a.headers = Object.fromEntries(r.headers.entries()), a.size = 8 * a.body.length), r.type !== "opaque" && r.type !== "opaqueredirect" || (c = !0, a = Ve(U({}, a), { body: "CORS blocked request" })), l = !0), l && i({ request: e, response: a, urlBlocked: c });
      })).catch(() => {
      });
    }, tl = (t, e, i) => ne(this, null, function* () {
      let n;
      try {
        const s = t.clone().body;
        if (s) {
          let o, r = s.getReader(), a = new TextDecoder(), l = "";
          for (; !(o = yield r.read()).done; ) {
            let c = o.value;
            l += a.decode(c);
          }
          n = l, n = _e(n, i, e, t.headers);
        } else
          n = "";
      } catch (s) {
        n = `Unable to clone response: ${s}`;
      }
      return n;
    }), il = ({ xhrCallback: t, fetchCallback: e, webSocketRequestCallback: i, webSocketEventCallback: n, disableWebSocketRecording: s, bodyKeysToRedact: o, backendUrl: r, tracingOrigins: a, urlBlocklist: l, sessionSecureID: c, bodyKeysToRecord: d }) => {
      const h = Ar(t, r, a, l, o, d), p = qr(e, r, a, l, o, d), m = s ? () => {
      } : ((X, Z, V) => {
        const y = window._highlightWebSocketRequestCallback;
        window._highlightWebSocketRequestCallback = X;
        const g = window._highlightWebSocketEventCallback;
        return window._highlightWebSocketEventCallback = (b) => {
          const I = b, R = Ue(I, ["message", "size"]), L = V.some((F) => b.name.toLowerCase().includes(F));
          Z(L ? R : b);
        }, () => {
          window._highlightWebSocketRequestCallback = y, window._highlightWebSocketEventCallback = g;
        };
      })(i, n, l);
      return () => {
        h(), p(), m();
      };
    };
    class He {
      constructor(e) {
        var i, n;
        w(this, "disableConsoleRecording"), w(this, "reportConsoleErrors"), w(this, "enablePromisePatch"), w(this, "consoleMethodsToRecord"), w(this, "listeners"), w(this, "errors"), w(this, "messages"), w(this, "options"), w(this, "hasNetworkRecording", !0), w(this, "_backendUrl"), w(this, "disableNetworkRecording"), w(this, "enableRecordingNetworkContents"), w(this, "xhrNetworkContents"), w(this, "fetchNetworkContents"), w(this, "disableRecordingWebSocketContents"), w(this, "webSocketNetworkContents"), w(this, "webSocketEventContents"), w(this, "tracingOrigins"), w(this, "networkHeadersToRedact"), w(this, "networkBodyKeysToRedact"), w(this, "networkBodyKeysToRecord"), w(this, "networkHeaderKeysToRecord"), w(this, "lastNetworkRequestTimestamp"), w(this, "urlBlocklist"), w(this, "requestResponseSanitizer"), this.options = e, this.disableConsoleRecording = !!e.disableConsoleRecording, this.reportConsoleErrors = (i = e.reportConsoleErrors) != null && i, this.enablePromisePatch = (n = e.enablePromisePatch) == null || n, this.consoleMethodsToRecord = e.consoleMethodsToRecord || [...zr], this.listeners = [], this.errors = [], this.messages = [], this.lastNetworkRequestTimestamp = 0;
      }
      isListening() {
        return this.listeners.length > 0;
      }
      startListening() {
        if (this.isListening())
          return;
        const e = this;
        this.disableConsoleRecording || this.listeners.push(Hr((i) => {
          var n, s, o;
          if (this.reportConsoleErrors && (i.type === "Error" || i.type === "error") && i.value && i.trace) {
            const r = je(i.value);
            if (Os.includes(r) || Ps.some((a) => r.includes(a)))
              return;
            e.errors.push({ event: r, type: "console.error", url: window.location.href, source: (n = i.trace[0]) != null && n.fileName ? i.trace[0].fileName : "", lineNumber: (s = i.trace[0]) != null && s.lineNumber ? i.trace[0].lineNumber : 0, columnNumber: (o = i.trace[0]) != null && o.columnNumber ? i.trace[0].columnNumber : 0, stackTrace: i.trace, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
          }
          e.messages.push(i);
        }, { level: this.consoleMethodsToRecord, logger: "console", stringifyOptions: { depthOfLimit: 10, numOfKeysLimit: 100, stringLengthLimit: 1e3 } })), this.listeners.push(Er((i) => {
          Os.includes(i.event) || Ps.some((n) => i.event.includes(n)) || e.errors.push(i);
        }, { enablePromisePatch: this.enablePromisePatch })), this.options.enableOtelTracing && Promise.resolve().then(() => Ia).then(({ shutdown: i }) => {
          this.listeners.push(i);
        }), He.setupNetworkListener(this, this.options);
      }
      stopListening() {
        this.listeners.forEach((e) => e()), this.listeners = [];
      }
      static setupNetworkListener(e, i) {
        var n, s, o, r, a, l, c, d, h, p, m, X;
        e._backendUrl = (i == null ? void 0 : i.backendUrl) || "https://localhost:8082/public", e.xhrNetworkContents = [], e.fetchNetworkContents = [], e.webSocketNetworkContents = [], e.webSocketEventContents = [], e.networkHeadersToRedact = [], e.urlBlocklist = [], e.tracingOrigins = i.tracingOrigins || [], (i == null ? void 0 : i.disableNetworkRecording) !== void 0 ? (e.disableNetworkRecording = i == null ? void 0 : i.disableNetworkRecording, e.enableRecordingNetworkContents = !1, e.disableRecordingWebSocketContents = !0, e.networkHeadersToRedact = [], e.networkBodyKeysToRedact = [], e.urlBlocklist = [], e.networkBodyKeysToRecord = [], e.networkBodyKeysToRecord = []) : typeof (i == null ? void 0 : i.networkRecording) == "boolean" ? (e.disableNetworkRecording = !i.networkRecording, e.enableRecordingNetworkContents = !1, e.disableRecordingWebSocketContents = !0, e.networkHeadersToRedact = [], e.networkBodyKeysToRedact = [], e.urlBlocklist = []) : (((n = i.networkRecording) == null ? void 0 : n.enabled) !== void 0 ? e.disableNetworkRecording = !i.networkRecording.enabled : e.disableNetworkRecording = !1, e.enableRecordingNetworkContents = ((s = i.networkRecording) == null ? void 0 : s.recordHeadersAndBody) || !1, e.disableRecordingWebSocketContents = ((o = i.networkRecording) == null ? void 0 : o.disableWebSocketEventRecordings) || !1, e.networkHeadersToRedact = ((a = (r = i.networkRecording) == null ? void 0 : r.networkHeadersToRedact) == null ? void 0 : a.map((Z) => Z.toLowerCase())) || [], e.networkBodyKeysToRedact = ((c = (l = i.networkRecording) == null ? void 0 : l.networkBodyKeysToRedact) == null ? void 0 : c.map((Z) => Z.toLowerCase())) || [], e.urlBlocklist = ((h = (d = i.networkRecording) == null ? void 0 : d.urlBlocklist) == null ? void 0 : h.map((Z) => Z.toLowerCase())) || [], e.urlBlocklist = [...e.urlBlocklist, ...Br], e.requestResponseSanitizer = (p = i.networkRecording) == null ? void 0 : p.requestResponseSanitizer, e.networkHeaderKeysToRecord = (m = i.networkRecording) == null ? void 0 : m.headerKeysToRecord, e.networkHeaderKeysToRecord && (e.networkHeadersToRedact = [], e.networkHeaderKeysToRecord = e.networkHeaderKeysToRecord.map((Z) => Z.toLocaleLowerCase())), e.networkBodyKeysToRecord = (X = i.networkRecording) == null ? void 0 : X.bodyKeysToRecord, e.networkBodyKeysToRecord && (e.networkBodyKeysToRedact = [], e.networkBodyKeysToRecord = e.networkBodyKeysToRecord.map((Z) => Z.toLocaleLowerCase()))), !e.disableNetworkRecording && e.enableRecordingNetworkContents && e.listeners.push(il({ xhrCallback: (Z) => {
          e.xhrNetworkContents.push(Z);
        }, fetchCallback: (Z) => {
          e.fetchNetworkContents.push(Z);
        }, webSocketRequestCallback: (Z) => {
          e.webSocketNetworkContents && e.webSocketNetworkContents.push(Z);
        }, webSocketEventCallback: (Z) => {
          e.webSocketEventContents.push(Z);
        }, disableWebSocketRecording: e.disableRecordingWebSocketContents, bodyKeysToRedact: e.networkBodyKeysToRedact, backendUrl: e._backendUrl, tracingOrigins: e.tracingOrigins, urlBlocklist: e.urlBlocklist, sessionSecureID: i.sessionSecureID, bodyKeysToRecord: e.networkBodyKeysToRecord }));
      }
      static getRecordedNetworkResources(e, i) {
        var n, s;
        let o = [], r = [];
        if (!e.disableNetworkRecording) {
          const a = ((n = window == null ? void 0 : window.performance) == null ? void 0 : n.timeOrigin) || 0;
          o = performance.getEntriesByType("resource");
          const l = 2 * (i - a);
          if (o = o.filter((c) => !(c.responseEnd < e.lastNetworkRequestTimestamp) && nn(c.name, e._backendUrl, e.tracingOrigins)).map((c) => Ve(U({}, c.toJSON()), { offsetStartTime: c.startTime - l, offsetResponseEnd: c.responseEnd - l, offsetFetchStart: c.fetchStart - l })), e.lastNetworkRequestTimestamp = ((s = o.at(-1)) == null ? void 0 : s.responseEnd) || e.lastNetworkRequestTimestamp, e.enableRecordingNetworkContents) {
            const c = { headersToRedact: e.networkHeadersToRedact, headersToRecord: e.networkHeaderKeysToRecord, requestResponseSanitizer: e.requestResponseSanitizer };
            o = qs(o, e.xhrNetworkContents, "xmlhttprequest", c), o = qs(o, e.fetchNetworkContents, "fetch", c);
          }
        }
        return e.disableRecordingWebSocketContents || (r = e.webSocketNetworkContents || []), [...o, ...r];
      }
      static getRecordedWebSocketEvents(e) {
        let i = [];
        return e.disableNetworkRecording || e.disableRecordingWebSocketContents || (i = e.webSocketEventContents), i;
      }
      static clearRecordedNetworkResources(e) {
        e.disableNetworkRecording || (e.xhrNetworkContents = [], e.fetchNetworkContents = [], e.webSocketNetworkContents = [], e.webSocketEventContents = [], performance.clearResourceTimings());
      }
    }
    const nl = (t) => {
      t(window.location.href);
      const e = history.pushState;
      history.pushState = /* @__PURE__ */ ((o) => function() {
        var r = o.apply(this, arguments);
        return window.dispatchEvent(new Event("pushstate")), window.dispatchEvent(new Event("locationchange")), r;
      })(history.pushState);
      const i = history.replaceState;
      history.replaceState = /* @__PURE__ */ ((o) => function() {
        var r = o.apply(this, arguments);
        return window.dispatchEvent(new Event("replacestate")), window.dispatchEvent(new Event("locationchange")), r;
      })(history.replaceState);
      const n = () => {
        window.dispatchEvent(new Event("locationchange"));
      };
      window.addEventListener("popstate", n);
      const s = function() {
        t(window.location.href);
      };
      return window.addEventListener("locationchange", s), () => {
        window.removeEventListener("popstate", n), window.removeEventListener("locationchange", s), history.pushState = e, history.replaceState = i;
      };
    }, on = JSON;
    function ai(t, e) {
      if (!t)
        throw new Error(e);
    }
    function sl(t, e) {
      if (!t)
        throw new Error(e != null ? e : "Unexpected invariant triggered.");
    }
    const ol = /\r\n|[\n\r]/g;
    function rn(t, e) {
      let i = 0, n = 1;
      for (const s of t.body.matchAll(ol)) {
        if (typeof s.index == "number" || sl(!1), s.index >= e)
          break;
        i = s.index + s[0].length, n += 1;
      }
      return { line: n, column: e + 1 - i };
    }
    function io(t, e) {
      const i = t.locationOffset.column - 1, n = "".padStart(i) + t.body, s = e.line - 1, o = t.locationOffset.line - 1, r = e.line + o, a = e.line === 1 ? i : 0, l = e.column + a, c = `${t.name}:${r}:${l}
`, d = n.split(/\r\n|[\n\r]/g), h = d[s];
      if (h.length > 120) {
        const p = Math.floor(l / 80), m = l % 80, X = [];
        for (let Z = 0; Z < h.length; Z += 80)
          X.push(h.slice(Z, Z + 80));
        return c + no([[`${r} |`, X[0]], ...X.slice(1, p + 1).map((Z) => ["|", Z]), ["|", "^".padStart(m)], ["|", X[p + 1]]]);
      }
      return c + no([[r - 1 + " |", d[s - 1]], [`${r} |`, h], ["|", "^".padStart(l)], [`${r + 1} |`, d[s + 1]]]);
    }
    function no(t) {
      const e = t.filter(([n, s]) => s !== void 0), i = Math.max(...e.map(([n]) => n.length));
      return e.map(([n, s]) => n.padStart(i) + (s ? " " + s : "")).join(`
`);
    }
    class ln extends Error {
      constructor(e, ...i) {
        var n, s, o;
        const { nodes: r, source: a, positions: l, path: c, originalError: d, extensions: h } = function(Z) {
          const V = Z[0];
          return V == null || "kind" in V || "length" in V ? { nodes: V, source: Z[1], positions: Z[2], path: Z[3], originalError: Z[4], extensions: Z[5] } : V;
        }(i);
        super(e), this.name = "GraphQLError", this.path = c != null ? c : void 0, this.originalError = d != null ? d : void 0, this.nodes = so(Array.isArray(r) ? r : r ? [r] : void 0);
        const p = so((n = this.nodes) === null || n === void 0 ? void 0 : n.map((Z) => Z.loc).filter((Z) => Z != null));
        this.source = a != null ? a : p == null || (s = p[0]) === null || s === void 0 ? void 0 : s.source, this.positions = l != null ? l : p == null ? void 0 : p.map((Z) => Z.start), this.locations = l && a ? l.map((Z) => rn(a, Z)) : p == null ? void 0 : p.map((Z) => rn(Z.source, Z.start));
        const m = typeof (X = d == null ? void 0 : d.extensions) == "object" && X !== null ? d == null ? void 0 : d.extensions : void 0;
        var X;
        this.extensions = (o = h != null ? h : m) !== null && o !== void 0 ? o : /* @__PURE__ */ Object.create(null), Object.defineProperties(this, { message: { writable: !0, enumerable: !0 }, name: { enumerable: !1 }, nodes: { enumerable: !1 }, source: { enumerable: !1 }, positions: { enumerable: !1 }, originalError: { enumerable: !1 } }), d != null && d.stack ? Object.defineProperty(this, "stack", { value: d.stack, writable: !0, configurable: !0 }) : Error.captureStackTrace ? Error.captureStackTrace(this, ln) : Object.defineProperty(this, "stack", { value: Error().stack, writable: !0, configurable: !0 });
      }
      get [Symbol.toStringTag]() {
        return "GraphQLError";
      }
      toString() {
        let e = this.message;
        if (this.nodes)
          for (const n of this.nodes)
            n.loc && (e += `

` + io((i = n.loc).source, rn(i.source, i.start)));
        else if (this.source && this.locations)
          for (const n of this.locations)
            e += `

` + io(this.source, n);
        var i;
        return e;
      }
      toJSON() {
        const e = { message: this.message };
        return this.locations != null && (e.locations = this.locations), this.path != null && (e.path = this.path), this.extensions != null && Object.keys(this.extensions).length > 0 && (e.extensions = this.extensions), e;
      }
    }
    function so(t) {
      return t === void 0 || t.length === 0 ? void 0 : t;
    }
    function he(t, e, i) {
      return new ln(`Syntax Error: ${i}`, { source: t, positions: [e] });
    }
    class rl {
      constructor(e, i, n) {
        this.start = e.start, this.end = i.end, this.startToken = e, this.endToken = i, this.source = n;
      }
      get [Symbol.toStringTag]() {
        return "Location";
      }
      toJSON() {
        return { start: this.start, end: this.end };
      }
    }
    class oo {
      constructor(e, i, n, s, o, r) {
        this.kind = e, this.start = i, this.end = n, this.line = s, this.column = o, this.value = r, this.prev = null, this.next = null;
      }
      get [Symbol.toStringTag]() {
        return "Token";
      }
      toJSON() {
        return { kind: this.kind, value: this.value, line: this.line, column: this.column };
      }
    }
    const ro = { Name: [], Document: ["definitions"], OperationDefinition: ["name", "variableDefinitions", "directives", "selectionSet"], VariableDefinition: ["variable", "type", "defaultValue", "directives"], Variable: ["name"], SelectionSet: ["selections"], Field: ["alias", "name", "arguments", "directives", "selectionSet"], Argument: ["name", "value"], FragmentSpread: ["name", "directives"], InlineFragment: ["typeCondition", "directives", "selectionSet"], FragmentDefinition: ["name", "variableDefinitions", "typeCondition", "directives", "selectionSet"], IntValue: [], FloatValue: [], StringValue: [], BooleanValue: [], NullValue: [], EnumValue: [], ListValue: ["values"], ObjectValue: ["fields"], ObjectField: ["name", "value"], Directive: ["name", "arguments"], NamedType: ["name"], ListType: ["type"], NonNullType: ["type"], SchemaDefinition: ["description", "directives", "operationTypes"], OperationTypeDefinition: ["type"], ScalarTypeDefinition: ["description", "name", "directives"], ObjectTypeDefinition: ["description", "name", "interfaces", "directives", "fields"], FieldDefinition: ["description", "name", "arguments", "type", "directives"], InputValueDefinition: ["description", "name", "type", "defaultValue", "directives"], InterfaceTypeDefinition: ["description", "name", "interfaces", "directives", "fields"], UnionTypeDefinition: ["description", "name", "directives", "types"], EnumTypeDefinition: ["description", "name", "directives", "values"], EnumValueDefinition: ["description", "name", "directives"], InputObjectTypeDefinition: ["description", "name", "directives", "fields"], DirectiveDefinition: ["description", "name", "arguments", "locations"], SchemaExtension: ["directives", "operationTypes"], ScalarTypeExtension: ["name", "directives"], ObjectTypeExtension: ["name", "interfaces", "directives", "fields"], InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"], UnionTypeExtension: ["name", "directives", "types"], EnumTypeExtension: ["name", "directives", "values"], InputObjectTypeExtension: ["name", "directives", "fields"] }, ll = new Set(Object.keys(ro));
    function lo(t) {
      const e = t == null ? void 0 : t.kind;
      return typeof e == "string" && ll.has(e);
    }
    var pt, an, cn, de, E, O, W, re;
    function dn(t) {
      return t === 9 || t === 32;
    }
    function wt(t) {
      return t >= 48 && t <= 57;
    }
    function ao(t) {
      return t >= 97 && t <= 122 || t >= 65 && t <= 90;
    }
    function co(t) {
      return ao(t) || t === 95;
    }
    function al(t) {
      return ao(t) || wt(t) || t === 95;
    }
    function cl(t) {
      var e;
      let i = Number.MAX_SAFE_INTEGER, n = null, s = -1;
      for (let r = 0; r < t.length; ++r) {
        var o;
        const a = t[r], l = dl(a);
        l !== a.length && (n = (o = n) !== null && o !== void 0 ? o : r, s = r, r !== 0 && l < i && (i = l));
      }
      return t.map((r, a) => a === 0 ? r : r.slice(i)).slice((e = n) !== null && e !== void 0 ? e : 0, s + 1);
    }
    function dl(t) {
      let e = 0;
      for (; e < t.length && dn(t.charCodeAt(e)); )
        ++e;
      return e;
    }
    (an = pt || (pt = {})).QUERY = "query", an.MUTATION = "mutation", an.SUBSCRIPTION = "subscription", (de = cn || (cn = {})).QUERY = "QUERY", de.MUTATION = "MUTATION", de.SUBSCRIPTION = "SUBSCRIPTION", de.FIELD = "FIELD", de.FRAGMENT_DEFINITION = "FRAGMENT_DEFINITION", de.FRAGMENT_SPREAD = "FRAGMENT_SPREAD", de.INLINE_FRAGMENT = "INLINE_FRAGMENT", de.VARIABLE_DEFINITION = "VARIABLE_DEFINITION", de.SCHEMA = "SCHEMA", de.SCALAR = "SCALAR", de.OBJECT = "OBJECT", de.FIELD_DEFINITION = "FIELD_DEFINITION", de.ARGUMENT_DEFINITION = "ARGUMENT_DEFINITION", de.INTERFACE = "INTERFACE", de.UNION = "UNION", de.ENUM = "ENUM", de.ENUM_VALUE = "ENUM_VALUE", de.INPUT_OBJECT = "INPUT_OBJECT", de.INPUT_FIELD_DEFINITION = "INPUT_FIELD_DEFINITION", (O = E || (E = {})).NAME = "Name", O.DOCUMENT = "Document", O.OPERATION_DEFINITION = "OperationDefinition", O.VARIABLE_DEFINITION = "VariableDefinition", O.SELECTION_SET = "SelectionSet", O.FIELD = "Field", O.ARGUMENT = "Argument", O.FRAGMENT_SPREAD = "FragmentSpread", O.INLINE_FRAGMENT = "InlineFragment", O.FRAGMENT_DEFINITION = "FragmentDefinition", O.VARIABLE = "Variable", O.INT = "IntValue", O.FLOAT = "FloatValue", O.STRING = "StringValue", O.BOOLEAN = "BooleanValue", O.NULL = "NullValue", O.ENUM = "EnumValue", O.LIST = "ListValue", O.OBJECT = "ObjectValue", O.OBJECT_FIELD = "ObjectField", O.DIRECTIVE = "Directive", O.NAMED_TYPE = "NamedType", O.LIST_TYPE = "ListType", O.NON_NULL_TYPE = "NonNullType", O.SCHEMA_DEFINITION = "SchemaDefinition", O.OPERATION_TYPE_DEFINITION = "OperationTypeDefinition", O.SCALAR_TYPE_DEFINITION = "ScalarTypeDefinition", O.OBJECT_TYPE_DEFINITION = "ObjectTypeDefinition", O.FIELD_DEFINITION = "FieldDefinition", O.INPUT_VALUE_DEFINITION = "InputValueDefinition", O.INTERFACE_TYPE_DEFINITION = "InterfaceTypeDefinition", O.UNION_TYPE_DEFINITION = "UnionTypeDefinition", O.ENUM_TYPE_DEFINITION = "EnumTypeDefinition", O.ENUM_VALUE_DEFINITION = "EnumValueDefinition", O.INPUT_OBJECT_TYPE_DEFINITION = "InputObjectTypeDefinition", O.DIRECTIVE_DEFINITION = "DirectiveDefinition", O.SCHEMA_EXTENSION = "SchemaExtension", O.SCALAR_TYPE_EXTENSION = "ScalarTypeExtension", O.OBJECT_TYPE_EXTENSION = "ObjectTypeExtension", O.INTERFACE_TYPE_EXTENSION = "InterfaceTypeExtension", O.UNION_TYPE_EXTENSION = "UnionTypeExtension", O.ENUM_TYPE_EXTENSION = "EnumTypeExtension", O.INPUT_OBJECT_TYPE_EXTENSION = "InputObjectTypeExtension", (re = W || (W = {})).SOF = "<SOF>", re.EOF = "<EOF>", re.BANG = "!", re.DOLLAR = "$", re.AMP = "&", re.PAREN_L = "(", re.PAREN_R = ")", re.SPREAD = "...", re.COLON = ":", re.EQUALS = "=", re.AT = "@", re.BRACKET_L = "[", re.BRACKET_R = "]", re.BRACE_L = "{", re.PIPE = "|", re.BRACE_R = "}", re.NAME = "Name", re.INT = "Int", re.FLOAT = "Float", re.STRING = "String", re.BLOCK_STRING = "BlockString", re.COMMENT = "Comment";
    class ul {
      constructor(e) {
        const i = new oo(W.SOF, 0, 0, 0, 0);
        this.source = e, this.lastToken = i, this.token = i, this.line = 1, this.lineStart = 0;
      }
      get [Symbol.toStringTag]() {
        return "Lexer";
      }
      advance() {
        return this.lastToken = this.token, this.token = this.lookahead();
      }
      lookahead() {
        let e = this.token;
        if (e.kind !== W.EOF)
          do
            if (e.next)
              e = e.next;
            else {
              const i = hl(this, e.end);
              e.next = i, i.prev = e, e = i;
            }
          while (e.kind === W.COMMENT);
        return e;
      }
    }
    function mt(t) {
      return t >= 0 && t <= 55295 || t >= 57344 && t <= 1114111;
    }
    function ci(t, e) {
      return uo(t.charCodeAt(e)) && ho(t.charCodeAt(e + 1));
    }
    function uo(t) {
      return t >= 55296 && t <= 56319;
    }
    function ho(t) {
      return t >= 56320 && t <= 57343;
    }
    function qe(t, e) {
      const i = t.source.body.codePointAt(e);
      if (i === void 0)
        return W.EOF;
      if (i >= 32 && i <= 126) {
        const n = String.fromCodePoint(i);
        return n === '"' ? `'"'` : `"${n}"`;
      }
      return "U+" + i.toString(16).toUpperCase().padStart(4, "0");
    }
    function le(t, e, i, n, s) {
      const o = t.line, r = 1 + i - t.lineStart;
      return new oo(e, i, n, o, r, s);
    }
    function hl(t, e) {
      const i = t.source.body, n = i.length;
      let s = e;
      for (; s < n; ) {
        const o = i.charCodeAt(s);
        switch (o) {
          case 65279:
          case 9:
          case 32:
          case 44:
            ++s;
            continue;
          case 10:
            ++s, ++t.line, t.lineStart = s;
            continue;
          case 13:
            i.charCodeAt(s + 1) === 10 ? s += 2 : ++s, ++t.line, t.lineStart = s;
            continue;
          case 35:
            return pl(t, s);
          case 33:
            return le(t, W.BANG, s, s + 1);
          case 36:
            return le(t, W.DOLLAR, s, s + 1);
          case 38:
            return le(t, W.AMP, s, s + 1);
          case 40:
            return le(t, W.PAREN_L, s, s + 1);
          case 41:
            return le(t, W.PAREN_R, s, s + 1);
          case 46:
            if (i.charCodeAt(s + 1) === 46 && i.charCodeAt(s + 2) === 46)
              return le(t, W.SPREAD, s, s + 3);
            break;
          case 58:
            return le(t, W.COLON, s, s + 1);
          case 61:
            return le(t, W.EQUALS, s, s + 1);
          case 64:
            return le(t, W.AT, s, s + 1);
          case 91:
            return le(t, W.BRACKET_L, s, s + 1);
          case 93:
            return le(t, W.BRACKET_R, s, s + 1);
          case 123:
            return le(t, W.BRACE_L, s, s + 1);
          case 124:
            return le(t, W.PIPE, s, s + 1);
          case 125:
            return le(t, W.BRACE_R, s, s + 1);
          case 34:
            return i.charCodeAt(s + 1) === 34 && i.charCodeAt(s + 2) === 34 ? Il(t, s) : bl(t, s);
        }
        if (wt(o) || o === 45)
          return ml(t, s, o);
        if (co(o))
          return Sl(t, s);
        throw he(t.source, s, o === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : mt(o) || ci(i, s) ? `Unexpected character: ${qe(t, s)}.` : `Invalid character: ${qe(t, s)}.`);
      }
      return le(t, W.EOF, n, n);
    }
    function pl(t, e) {
      const i = t.source.body, n = i.length;
      let s = e + 1;
      for (; s < n; ) {
        const o = i.charCodeAt(s);
        if (o === 10 || o === 13)
          break;
        if (mt(o))
          ++s;
        else {
          if (!ci(i, s))
            break;
          s += 2;
        }
      }
      return le(t, W.COMMENT, e, s, i.slice(e + 1, s));
    }
    function ml(t, e, i) {
      const n = t.source.body;
      let s = e, o = i, r = !1;
      if (o === 45 && (o = n.charCodeAt(++s)), o === 48) {
        if (o = n.charCodeAt(++s), wt(o))
          throw he(t.source, s, `Invalid number, unexpected digit after 0: ${qe(t, s)}.`);
      } else
        s = un(t, s, o), o = n.charCodeAt(s);
      if (o === 46 && (r = !0, o = n.charCodeAt(++s), s = un(t, s, o), o = n.charCodeAt(s)), o !== 69 && o !== 101 || (r = !0, o = n.charCodeAt(++s), o !== 43 && o !== 45 || (o = n.charCodeAt(++s)), s = un(t, s, o), o = n.charCodeAt(s)), o === 46 || co(o))
        throw he(t.source, s, `Invalid number, expected digit but got: ${qe(t, s)}.`);
      return le(t, r ? W.FLOAT : W.INT, e, s, n.slice(e, s));
    }
    function un(t, e, i) {
      if (!wt(i))
        throw he(t.source, e, `Invalid number, expected digit but got: ${qe(t, e)}.`);
      const n = t.source.body;
      let s = e + 1;
      for (; wt(n.charCodeAt(s)); )
        ++s;
      return s;
    }
    function bl(t, e) {
      const i = t.source.body, n = i.length;
      let s = e + 1, o = s, r = "";
      for (; s < n; ) {
        const a = i.charCodeAt(s);
        if (a === 34)
          return r += i.slice(o, s), le(t, W.STRING, e, s + 1, r);
        if (a !== 92) {
          if (a === 10 || a === 13)
            break;
          if (mt(a))
            ++s;
          else {
            if (!ci(i, s))
              throw he(t.source, s, `Invalid character within String: ${qe(t, s)}.`);
            s += 2;
          }
        } else {
          r += i.slice(o, s);
          const l = i.charCodeAt(s + 1) === 117 ? i.charCodeAt(s + 2) === 123 ? Zl(t, s) : yl(t, s) : gl(t, s);
          r += l.value, s += l.size, o = s;
        }
      }
      throw he(t.source, s, "Unterminated string.");
    }
    function Zl(t, e) {
      const i = t.source.body;
      let n = 0, s = 3;
      for (; s < 12; ) {
        const o = i.charCodeAt(e + s++);
        if (o === 125) {
          if (s < 5 || !mt(n))
            break;
          return { value: String.fromCodePoint(n), size: s };
        }
        if (n = n << 4 | Nt(o), n < 0)
          break;
      }
      throw he(t.source, e, `Invalid Unicode escape sequence: "${i.slice(e, e + s)}".`);
    }
    function yl(t, e) {
      const i = t.source.body, n = po(i, e + 2);
      if (mt(n))
        return { value: String.fromCodePoint(n), size: 6 };
      if (uo(n) && i.charCodeAt(e + 6) === 92 && i.charCodeAt(e + 7) === 117) {
        const s = po(i, e + 8);
        if (ho(s))
          return { value: String.fromCodePoint(n, s), size: 12 };
      }
      throw he(t.source, e, `Invalid Unicode escape sequence: "${i.slice(e, e + 6)}".`);
    }
    function po(t, e) {
      return Nt(t.charCodeAt(e)) << 12 | Nt(t.charCodeAt(e + 1)) << 8 | Nt(t.charCodeAt(e + 2)) << 4 | Nt(t.charCodeAt(e + 3));
    }
    function Nt(t) {
      return t >= 48 && t <= 57 ? t - 48 : t >= 65 && t <= 70 ? t - 55 : t >= 97 && t <= 102 ? t - 87 : -1;
    }
    function gl(t, e) {
      const i = t.source.body;
      switch (i.charCodeAt(e + 1)) {
        case 34:
          return { value: '"', size: 2 };
        case 92:
          return { value: "\\", size: 2 };
        case 47:
          return { value: "/", size: 2 };
        case 98:
          return { value: "\b", size: 2 };
        case 102:
          return { value: "\f", size: 2 };
        case 110:
          return { value: `
`, size: 2 };
        case 114:
          return { value: "\r", size: 2 };
        case 116:
          return { value: "	", size: 2 };
      }
      throw he(t.source, e, `Invalid character escape sequence: "${i.slice(e, e + 2)}".`);
    }
    function Il(t, e) {
      const i = t.source.body, n = i.length;
      let s = t.lineStart, o = e + 3, r = o, a = "";
      const l = [];
      for (; o < n; ) {
        const c = i.charCodeAt(o);
        if (c === 34 && i.charCodeAt(o + 1) === 34 && i.charCodeAt(o + 2) === 34) {
          a += i.slice(r, o), l.push(a);
          const d = le(t, W.BLOCK_STRING, e, o + 3, cl(l).join(`
`));
          return t.line += l.length - 1, t.lineStart = s, d;
        }
        if (c !== 92 || i.charCodeAt(o + 1) !== 34 || i.charCodeAt(o + 2) !== 34 || i.charCodeAt(o + 3) !== 34)
          if (c !== 10 && c !== 13)
            if (mt(c))
              ++o;
            else {
              if (!ci(i, o))
                throw he(t.source, o, `Invalid character within String: ${qe(t, o)}.`);
              o += 2;
            }
          else
            a += i.slice(r, o), l.push(a), c === 13 && i.charCodeAt(o + 1) === 10 ? o += 2 : ++o, a = "", r = o, s = o;
        else
          a += i.slice(r, o), r = o + 1, o += 4;
      }
      throw he(t.source, o, "Unterminated string.");
    }
    function Sl(t, e) {
      const i = t.source.body, n = i.length;
      let s = e + 1;
      for (; s < n && al(i.charCodeAt(s)); )
        ++s;
      return le(t, W.NAME, e, s, i.slice(e, s));
    }
    const Xl = 10, mo = 2;
    function hn(t) {
      return di(t, []);
    }
    function di(t, e) {
      switch (typeof t) {
        case "string":
          return JSON.stringify(t);
        case "function":
          return t.name ? `[function ${t.name}]` : "[function]";
        case "object":
          return function(i, n) {
            if (i === null)
              return "null";
            if (n.includes(i))
              return "[Circular]";
            const s = [...n, i];
            if (function(o) {
              return typeof o.toJSON == "function";
            }(i)) {
              const o = i.toJSON();
              if (o !== i)
                return typeof o == "string" ? o : di(o, s);
            } else if (Array.isArray(i))
              return function(o, r) {
                if (o.length === 0)
                  return "[]";
                if (r.length > mo)
                  return "[Array]";
                const a = Math.min(Xl, o.length), l = o.length - a, c = [];
                for (let d = 0; d < a; ++d)
                  c.push(di(o[d], r));
                return l === 1 ? c.push("... 1 more item") : l > 1 && c.push(`... ${l} more items`), "[" + c.join(", ") + "]";
              }(i, s);
            return function(o, r) {
              const a = Object.entries(o);
              return a.length === 0 ? "{}" : r.length > mo ? "[" + function(c) {
                const d = Object.prototype.toString.call(c).replace(/^\[object /, "").replace(/]$/, "");
                if (d === "Object" && typeof c.constructor == "function") {
                  const h = c.constructor.name;
                  if (typeof h == "string" && h !== "")
                    return h;
                }
                return d;
              }(o) + "]" : "{ " + a.map(([c, d]) => c + ": " + di(d, r)).join(", ") + " }";
            }(i, s);
          }(t, e);
        default:
          return String(t);
      }
    }
    const Vl = globalThis.process && globalThis.process.env.NODE_ENV === "production" ? function(t, e) {
      return t instanceof e;
    } : function(t, e) {
      if (t instanceof e)
        return !0;
      if (typeof t == "object" && t !== null) {
        var i;
        const n = e.prototype[Symbol.toStringTag];
        if (n === (Symbol.toStringTag in t ? t[Symbol.toStringTag] : (i = t.constructor) === null || i === void 0 ? void 0 : i.name)) {
          const s = hn(t);
          throw new Error(`Cannot use ${n} "${s}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`);
        }
      }
      return !1;
    };
    class bo {
      constructor(e, i = "GraphQL request", n = { line: 1, column: 1 }) {
        typeof e == "string" || ai(!1, `Body must be a string. Received: ${hn(e)}.`), this.body = e, this.name = i, this.locationOffset = n, this.locationOffset.line > 0 || ai(!1, "line in locationOffset is 1-indexed and must be positive."), this.locationOffset.column > 0 || ai(!1, "column in locationOffset is 1-indexed and must be positive.");
      }
      get [Symbol.toStringTag]() {
        return "Source";
      }
    }
    function Zo(t, e) {
      return new Gl(t, e).parseDocument();
    }
    class Gl {
      constructor(e, i = {}) {
        const n = function(s) {
          return Vl(s, bo);
        }(e) ? e : new bo(e);
        this._lexer = new ul(n), this._options = i, this._tokenCounter = 0;
      }
      parseName() {
        const e = this.expectToken(W.NAME);
        return this.node(e, { kind: E.NAME, value: e.value });
      }
      parseDocument() {
        return this.node(this._lexer.token, { kind: E.DOCUMENT, definitions: this.many(W.SOF, this.parseDefinition, W.EOF) });
      }
      parseDefinition() {
        if (this.peek(W.BRACE_L))
          return this.parseOperationDefinition();
        const e = this.peekDescription(), i = e ? this._lexer.lookahead() : this._lexer.token;
        if (i.kind === W.NAME) {
          switch (i.value) {
            case "schema":
              return this.parseSchemaDefinition();
            case "scalar":
              return this.parseScalarTypeDefinition();
            case "type":
              return this.parseObjectTypeDefinition();
            case "interface":
              return this.parseInterfaceTypeDefinition();
            case "union":
              return this.parseUnionTypeDefinition();
            case "enum":
              return this.parseEnumTypeDefinition();
            case "input":
              return this.parseInputObjectTypeDefinition();
            case "directive":
              return this.parseDirectiveDefinition();
          }
          if (e)
            throw he(this._lexer.source, this._lexer.token.start, "Unexpected description, descriptions are supported only on type definitions.");
          switch (i.value) {
            case "query":
            case "mutation":
            case "subscription":
              return this.parseOperationDefinition();
            case "fragment":
              return this.parseFragmentDefinition();
            case "extend":
              return this.parseTypeSystemExtension();
          }
        }
        throw this.unexpected(i);
      }
      parseOperationDefinition() {
        const e = this._lexer.token;
        if (this.peek(W.BRACE_L))
          return this.node(e, { kind: E.OPERATION_DEFINITION, operation: pt.QUERY, name: void 0, variableDefinitions: [], directives: [], selectionSet: this.parseSelectionSet() });
        const i = this.parseOperationType();
        let n;
        return this.peek(W.NAME) && (n = this.parseName()), this.node(e, { kind: E.OPERATION_DEFINITION, operation: i, name: n, variableDefinitions: this.parseVariableDefinitions(), directives: this.parseDirectives(!1), selectionSet: this.parseSelectionSet() });
      }
      parseOperationType() {
        const e = this.expectToken(W.NAME);
        switch (e.value) {
          case "query":
            return pt.QUERY;
          case "mutation":
            return pt.MUTATION;
          case "subscription":
            return pt.SUBSCRIPTION;
        }
        throw this.unexpected(e);
      }
      parseVariableDefinitions() {
        return this.optionalMany(W.PAREN_L, this.parseVariableDefinition, W.PAREN_R);
      }
      parseVariableDefinition() {
        return this.node(this._lexer.token, { kind: E.VARIABLE_DEFINITION, variable: this.parseVariable(), type: (this.expectToken(W.COLON), this.parseTypeReference()), defaultValue: this.expectOptionalToken(W.EQUALS) ? this.parseConstValueLiteral() : void 0, directives: this.parseConstDirectives() });
      }
      parseVariable() {
        const e = this._lexer.token;
        return this.expectToken(W.DOLLAR), this.node(e, { kind: E.VARIABLE, name: this.parseName() });
      }
      parseSelectionSet() {
        return this.node(this._lexer.token, { kind: E.SELECTION_SET, selections: this.many(W.BRACE_L, this.parseSelection, W.BRACE_R) });
      }
      parseSelection() {
        return this.peek(W.SPREAD) ? this.parseFragment() : this.parseField();
      }
      parseField() {
        const e = this._lexer.token, i = this.parseName();
        let n, s;
        return this.expectOptionalToken(W.COLON) ? (n = i, s = this.parseName()) : s = i, this.node(e, { kind: E.FIELD, alias: n, name: s, arguments: this.parseArguments(!1), directives: this.parseDirectives(!1), selectionSet: this.peek(W.BRACE_L) ? this.parseSelectionSet() : void 0 });
      }
      parseArguments(e) {
        const i = e ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(W.PAREN_L, i, W.PAREN_R);
      }
      parseArgument(e = !1) {
        const i = this._lexer.token, n = this.parseName();
        return this.expectToken(W.COLON), this.node(i, { kind: E.ARGUMENT, name: n, value: this.parseValueLiteral(e) });
      }
      parseConstArgument() {
        return this.parseArgument(!0);
      }
      parseFragment() {
        const e = this._lexer.token;
        this.expectToken(W.SPREAD);
        const i = this.expectOptionalKeyword("on");
        return !i && this.peek(W.NAME) ? this.node(e, { kind: E.FRAGMENT_SPREAD, name: this.parseFragmentName(), directives: this.parseDirectives(!1) }) : this.node(e, { kind: E.INLINE_FRAGMENT, typeCondition: i ? this.parseNamedType() : void 0, directives: this.parseDirectives(!1), selectionSet: this.parseSelectionSet() });
      }
      parseFragmentDefinition() {
        const e = this._lexer.token;
        return this.expectKeyword("fragment"), this._options.allowLegacyFragmentVariables === !0 ? this.node(e, { kind: E.FRAGMENT_DEFINITION, name: this.parseFragmentName(), variableDefinitions: this.parseVariableDefinitions(), typeCondition: (this.expectKeyword("on"), this.parseNamedType()), directives: this.parseDirectives(!1), selectionSet: this.parseSelectionSet() }) : this.node(e, { kind: E.FRAGMENT_DEFINITION, name: this.parseFragmentName(), typeCondition: (this.expectKeyword("on"), this.parseNamedType()), directives: this.parseDirectives(!1), selectionSet: this.parseSelectionSet() });
      }
      parseFragmentName() {
        if (this._lexer.token.value === "on")
          throw this.unexpected();
        return this.parseName();
      }
      parseValueLiteral(e) {
        const i = this._lexer.token;
        switch (i.kind) {
          case W.BRACKET_L:
            return this.parseList(e);
          case W.BRACE_L:
            return this.parseObject(e);
          case W.INT:
            return this.advanceLexer(), this.node(i, { kind: E.INT, value: i.value });
          case W.FLOAT:
            return this.advanceLexer(), this.node(i, { kind: E.FLOAT, value: i.value });
          case W.STRING:
          case W.BLOCK_STRING:
            return this.parseStringLiteral();
          case W.NAME:
            switch (this.advanceLexer(), i.value) {
              case "true":
                return this.node(i, { kind: E.BOOLEAN, value: !0 });
              case "false":
                return this.node(i, { kind: E.BOOLEAN, value: !1 });
              case "null":
                return this.node(i, { kind: E.NULL });
              default:
                return this.node(i, { kind: E.ENUM, value: i.value });
            }
          case W.DOLLAR:
            if (e) {
              if (this.expectToken(W.DOLLAR), this._lexer.token.kind === W.NAME) {
                const n = this._lexer.token.value;
                throw he(this._lexer.source, i.start, `Unexpected variable "$${n}" in constant value.`);
              }
              throw this.unexpected(i);
            }
            return this.parseVariable();
          default:
            throw this.unexpected();
        }
      }
      parseConstValueLiteral() {
        return this.parseValueLiteral(!0);
      }
      parseStringLiteral() {
        const e = this._lexer.token;
        return this.advanceLexer(), this.node(e, { kind: E.STRING, value: e.value, block: e.kind === W.BLOCK_STRING });
      }
      parseList(e) {
        return this.node(this._lexer.token, { kind: E.LIST, values: this.any(W.BRACKET_L, () => this.parseValueLiteral(e), W.BRACKET_R) });
      }
      parseObject(e) {
        return this.node(this._lexer.token, { kind: E.OBJECT, fields: this.any(W.BRACE_L, () => this.parseObjectField(e), W.BRACE_R) });
      }
      parseObjectField(e) {
        const i = this._lexer.token, n = this.parseName();
        return this.expectToken(W.COLON), this.node(i, { kind: E.OBJECT_FIELD, name: n, value: this.parseValueLiteral(e) });
      }
      parseDirectives(e) {
        const i = [];
        for (; this.peek(W.AT); )
          i.push(this.parseDirective(e));
        return i;
      }
      parseConstDirectives() {
        return this.parseDirectives(!0);
      }
      parseDirective(e) {
        const i = this._lexer.token;
        return this.expectToken(W.AT), this.node(i, { kind: E.DIRECTIVE, name: this.parseName(), arguments: this.parseArguments(e) });
      }
      parseTypeReference() {
        const e = this._lexer.token;
        let i;
        if (this.expectOptionalToken(W.BRACKET_L)) {
          const n = this.parseTypeReference();
          this.expectToken(W.BRACKET_R), i = this.node(e, { kind: E.LIST_TYPE, type: n });
        } else
          i = this.parseNamedType();
        return this.expectOptionalToken(W.BANG) ? this.node(e, { kind: E.NON_NULL_TYPE, type: i }) : i;
      }
      parseNamedType() {
        return this.node(this._lexer.token, { kind: E.NAMED_TYPE, name: this.parseName() });
      }
      peekDescription() {
        return this.peek(W.STRING) || this.peek(W.BLOCK_STRING);
      }
      parseDescription() {
        if (this.peekDescription())
          return this.parseStringLiteral();
      }
      parseSchemaDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("schema");
        const n = this.parseConstDirectives(), s = this.many(W.BRACE_L, this.parseOperationTypeDefinition, W.BRACE_R);
        return this.node(e, { kind: E.SCHEMA_DEFINITION, description: i, directives: n, operationTypes: s });
      }
      parseOperationTypeDefinition() {
        const e = this._lexer.token, i = this.parseOperationType();
        this.expectToken(W.COLON);
        const n = this.parseNamedType();
        return this.node(e, { kind: E.OPERATION_TYPE_DEFINITION, operation: i, type: n });
      }
      parseScalarTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("scalar");
        const n = this.parseName(), s = this.parseConstDirectives();
        return this.node(e, { kind: E.SCALAR_TYPE_DEFINITION, description: i, name: n, directives: s });
      }
      parseObjectTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("type");
        const n = this.parseName(), s = this.parseImplementsInterfaces(), o = this.parseConstDirectives(), r = this.parseFieldsDefinition();
        return this.node(e, { kind: E.OBJECT_TYPE_DEFINITION, description: i, name: n, interfaces: s, directives: o, fields: r });
      }
      parseImplementsInterfaces() {
        return this.expectOptionalKeyword("implements") ? this.delimitedMany(W.AMP, this.parseNamedType) : [];
      }
      parseFieldsDefinition() {
        return this.optionalMany(W.BRACE_L, this.parseFieldDefinition, W.BRACE_R);
      }
      parseFieldDefinition() {
        const e = this._lexer.token, i = this.parseDescription(), n = this.parseName(), s = this.parseArgumentDefs();
        this.expectToken(W.COLON);
        const o = this.parseTypeReference(), r = this.parseConstDirectives();
        return this.node(e, { kind: E.FIELD_DEFINITION, description: i, name: n, arguments: s, type: o, directives: r });
      }
      parseArgumentDefs() {
        return this.optionalMany(W.PAREN_L, this.parseInputValueDef, W.PAREN_R);
      }
      parseInputValueDef() {
        const e = this._lexer.token, i = this.parseDescription(), n = this.parseName();
        this.expectToken(W.COLON);
        const s = this.parseTypeReference();
        let o;
        this.expectOptionalToken(W.EQUALS) && (o = this.parseConstValueLiteral());
        const r = this.parseConstDirectives();
        return this.node(e, { kind: E.INPUT_VALUE_DEFINITION, description: i, name: n, type: s, defaultValue: o, directives: r });
      }
      parseInterfaceTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("interface");
        const n = this.parseName(), s = this.parseImplementsInterfaces(), o = this.parseConstDirectives(), r = this.parseFieldsDefinition();
        return this.node(e, { kind: E.INTERFACE_TYPE_DEFINITION, description: i, name: n, interfaces: s, directives: o, fields: r });
      }
      parseUnionTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("union");
        const n = this.parseName(), s = this.parseConstDirectives(), o = this.parseUnionMemberTypes();
        return this.node(e, { kind: E.UNION_TYPE_DEFINITION, description: i, name: n, directives: s, types: o });
      }
      parseUnionMemberTypes() {
        return this.expectOptionalToken(W.EQUALS) ? this.delimitedMany(W.PIPE, this.parseNamedType) : [];
      }
      parseEnumTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("enum");
        const n = this.parseName(), s = this.parseConstDirectives(), o = this.parseEnumValuesDefinition();
        return this.node(e, { kind: E.ENUM_TYPE_DEFINITION, description: i, name: n, directives: s, values: o });
      }
      parseEnumValuesDefinition() {
        return this.optionalMany(W.BRACE_L, this.parseEnumValueDefinition, W.BRACE_R);
      }
      parseEnumValueDefinition() {
        const e = this._lexer.token, i = this.parseDescription(), n = this.parseEnumValueName(), s = this.parseConstDirectives();
        return this.node(e, { kind: E.ENUM_VALUE_DEFINITION, description: i, name: n, directives: s });
      }
      parseEnumValueName() {
        if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null")
          throw he(this._lexer.source, this._lexer.token.start, `${ui(this._lexer.token)} is reserved and cannot be used for an enum value.`);
        return this.parseName();
      }
      parseInputObjectTypeDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("input");
        const n = this.parseName(), s = this.parseConstDirectives(), o = this.parseInputFieldsDefinition();
        return this.node(e, { kind: E.INPUT_OBJECT_TYPE_DEFINITION, description: i, name: n, directives: s, fields: o });
      }
      parseInputFieldsDefinition() {
        return this.optionalMany(W.BRACE_L, this.parseInputValueDef, W.BRACE_R);
      }
      parseTypeSystemExtension() {
        const e = this._lexer.lookahead();
        if (e.kind === W.NAME)
          switch (e.value) {
            case "schema":
              return this.parseSchemaExtension();
            case "scalar":
              return this.parseScalarTypeExtension();
            case "type":
              return this.parseObjectTypeExtension();
            case "interface":
              return this.parseInterfaceTypeExtension();
            case "union":
              return this.parseUnionTypeExtension();
            case "enum":
              return this.parseEnumTypeExtension();
            case "input":
              return this.parseInputObjectTypeExtension();
          }
        throw this.unexpected(e);
      }
      parseSchemaExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("schema");
        const i = this.parseConstDirectives(), n = this.optionalMany(W.BRACE_L, this.parseOperationTypeDefinition, W.BRACE_R);
        if (i.length === 0 && n.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.SCHEMA_EXTENSION, directives: i, operationTypes: n });
      }
      parseScalarTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("scalar");
        const i = this.parseName(), n = this.parseConstDirectives();
        if (n.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.SCALAR_TYPE_EXTENSION, name: i, directives: n });
      }
      parseObjectTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("type");
        const i = this.parseName(), n = this.parseImplementsInterfaces(), s = this.parseConstDirectives(), o = this.parseFieldsDefinition();
        if (n.length === 0 && s.length === 0 && o.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.OBJECT_TYPE_EXTENSION, name: i, interfaces: n, directives: s, fields: o });
      }
      parseInterfaceTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("interface");
        const i = this.parseName(), n = this.parseImplementsInterfaces(), s = this.parseConstDirectives(), o = this.parseFieldsDefinition();
        if (n.length === 0 && s.length === 0 && o.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.INTERFACE_TYPE_EXTENSION, name: i, interfaces: n, directives: s, fields: o });
      }
      parseUnionTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("union");
        const i = this.parseName(), n = this.parseConstDirectives(), s = this.parseUnionMemberTypes();
        if (n.length === 0 && s.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.UNION_TYPE_EXTENSION, name: i, directives: n, types: s });
      }
      parseEnumTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("enum");
        const i = this.parseName(), n = this.parseConstDirectives(), s = this.parseEnumValuesDefinition();
        if (n.length === 0 && s.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.ENUM_TYPE_EXTENSION, name: i, directives: n, values: s });
      }
      parseInputObjectTypeExtension() {
        const e = this._lexer.token;
        this.expectKeyword("extend"), this.expectKeyword("input");
        const i = this.parseName(), n = this.parseConstDirectives(), s = this.parseInputFieldsDefinition();
        if (n.length === 0 && s.length === 0)
          throw this.unexpected();
        return this.node(e, { kind: E.INPUT_OBJECT_TYPE_EXTENSION, name: i, directives: n, fields: s });
      }
      parseDirectiveDefinition() {
        const e = this._lexer.token, i = this.parseDescription();
        this.expectKeyword("directive"), this.expectToken(W.AT);
        const n = this.parseName(), s = this.parseArgumentDefs(), o = this.expectOptionalKeyword("repeatable");
        this.expectKeyword("on");
        const r = this.parseDirectiveLocations();
        return this.node(e, { kind: E.DIRECTIVE_DEFINITION, description: i, name: n, arguments: s, repeatable: o, locations: r });
      }
      parseDirectiveLocations() {
        return this.delimitedMany(W.PIPE, this.parseDirectiveLocation);
      }
      parseDirectiveLocation() {
        const e = this._lexer.token, i = this.parseName();
        if (Object.prototype.hasOwnProperty.call(cn, i.value))
          return i;
        throw this.unexpected(e);
      }
      node(e, i) {
        return this._options.noLocation !== !0 && (i.loc = new rl(e, this._lexer.lastToken, this._lexer.source)), i;
      }
      peek(e) {
        return this._lexer.token.kind === e;
      }
      expectToken(e) {
        const i = this._lexer.token;
        if (i.kind === e)
          return this.advanceLexer(), i;
        throw he(this._lexer.source, i.start, `Expected ${yo(e)}, found ${ui(i)}.`);
      }
      expectOptionalToken(e) {
        return this._lexer.token.kind === e && (this.advanceLexer(), !0);
      }
      expectKeyword(e) {
        const i = this._lexer.token;
        if (i.kind !== W.NAME || i.value !== e)
          throw he(this._lexer.source, i.start, `Expected "${e}", found ${ui(i)}.`);
        this.advanceLexer();
      }
      expectOptionalKeyword(e) {
        const i = this._lexer.token;
        return i.kind === W.NAME && i.value === e && (this.advanceLexer(), !0);
      }
      unexpected(e) {
        const i = e != null ? e : this._lexer.token;
        return he(this._lexer.source, i.start, `Unexpected ${ui(i)}.`);
      }
      any(e, i, n) {
        this.expectToken(e);
        const s = [];
        for (; !this.expectOptionalToken(n); )
          s.push(i.call(this));
        return s;
      }
      optionalMany(e, i, n) {
        if (this.expectOptionalToken(e)) {
          const s = [];
          do
            s.push(i.call(this));
          while (!this.expectOptionalToken(n));
          return s;
        }
        return [];
      }
      many(e, i, n) {
        this.expectToken(e);
        const s = [];
        do
          s.push(i.call(this));
        while (!this.expectOptionalToken(n));
        return s;
      }
      delimitedMany(e, i) {
        this.expectOptionalToken(e);
        const n = [];
        do
          n.push(i.call(this));
        while (this.expectOptionalToken(e));
        return n;
      }
      advanceLexer() {
        const { maxTokens: e } = this._options, i = this._lexer.advance();
        if (e !== void 0 && i.kind !== W.EOF && (++this._tokenCounter, this._tokenCounter > e))
          throw he(this._lexer.source, i.start, `Document contains more that ${e} tokens. Parsing aborted.`);
      }
    }
    function ui(t) {
      const e = t.value;
      return yo(t.kind) + (e != null ? ` "${e}"` : "");
    }
    function yo(t) {
      return function(e) {
        return e === W.BANG || e === W.DOLLAR || e === W.AMP || e === W.PAREN_L || e === W.PAREN_R || e === W.SPREAD || e === W.COLON || e === W.EQUALS || e === W.AT || e === W.BRACKET_L || e === W.BRACKET_R || e === W.BRACE_L || e === W.PIPE || e === W.BRACE_R;
      }(t) ? `"${t}"` : t;
    }
    const Wl = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;
    function fl(t) {
      return Rl[t.charCodeAt(0)];
    }
    const Rl = ["\\u0000", "\\u0001", "\\u0002", "\\u0003", "\\u0004", "\\u0005", "\\u0006", "\\u0007", "\\b", "\\t", "\\n", "\\u000B", "\\f", "\\r", "\\u000E", "\\u000F", "\\u0010", "\\u0011", "\\u0012", "\\u0013", "\\u0014", "\\u0015", "\\u0016", "\\u0017", "\\u0018", "\\u0019", "\\u001A", "\\u001B", "\\u001C", "\\u001D", "\\u001E", "\\u001F", "", "", '\\"', "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\\\", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\u007F", "\\u0080", "\\u0081", "\\u0082", "\\u0083", "\\u0084", "\\u0085", "\\u0086", "\\u0087", "\\u0088", "\\u0089", "\\u008A", "\\u008B", "\\u008C", "\\u008D", "\\u008E", "\\u008F", "\\u0090", "\\u0091", "\\u0092", "\\u0093", "\\u0094", "\\u0095", "\\u0096", "\\u0097", "\\u0098", "\\u0099", "\\u009A", "\\u009B", "\\u009C", "\\u009D", "\\u009E", "\\u009F"], vl = Object.freeze({});
    function Cl(t, e) {
      const i = t[e];
      return typeof i == "object" ? i : typeof i == "function" ? { enter: i, leave: void 0 } : { enter: t.enter, leave: t.leave };
    }
    function go(t) {
      return function(e, i, n = ro) {
        const s = /* @__PURE__ */ new Map();
        for (const g of Object.values(E))
          s.set(g, Cl(i, g));
        let o, r, a, l = Array.isArray(e), c = [e], d = -1, h = [], p = e;
        const m = [], X = [];
        do {
          d++;
          const g = d === c.length, b = g && h.length !== 0;
          if (g) {
            if (r = X.length === 0 ? void 0 : m[m.length - 1], p = a, a = X.pop(), b)
              if (l) {
                p = p.slice();
                let R = 0;
                for (const [L, F] of h) {
                  const H = L - R;
                  F === null ? (p.splice(H, 1), R++) : p[H] = F;
                }
              } else {
                p = Object.defineProperties({}, Object.getOwnPropertyDescriptors(p));
                for (const [R, L] of h)
                  p[R] = L;
              }
            d = o.index, c = o.keys, h = o.edits, l = o.inArray, o = o.prev;
          } else if (a) {
            if (r = l ? d : c[d], p = a[r], p == null)
              continue;
            m.push(r);
          }
          let I;
          if (!Array.isArray(p)) {
            var Z, V;
            lo(p) || ai(!1, `Invalid AST Node: ${hn(p)}.`);
            const R = g ? (Z = s.get(p.kind)) === null || Z === void 0 ? void 0 : Z.leave : (V = s.get(p.kind)) === null || V === void 0 ? void 0 : V.enter;
            if (I = R == null ? void 0 : R.call(i, p, r, a, m, X), I === vl)
              break;
            if (I === !1) {
              if (!g) {
                m.pop();
                continue;
              }
            } else if (I !== void 0 && (h.push([r, I]), !g)) {
              if (!lo(I)) {
                m.pop();
                continue;
              }
              p = I;
            }
          }
          var y;
          I === void 0 && b && h.push([r, p]), g ? m.pop() : (o = { inArray: l, index: d, keys: c, edits: h, prev: o }, l = Array.isArray(p), c = l ? p : (y = n[p.kind]) !== null && y !== void 0 ? y : [], d = -1, h = [], a && X.push(a), a = p);
        } while (o !== void 0);
        return h.length !== 0 ? h[h.length - 1][1] : e;
      }(t, kl);
    }
    const kl = { Name: { leave: (t) => t.value }, Variable: { leave: (t) => "$" + t.name }, Document: { leave: (t) => Y(t.definitions, `

`) }, OperationDefinition: { leave(t) {
      const e = Q("(", Y(t.variableDefinitions, ", "), ")"), i = Y([t.operation, Y([t.name, e]), Y(t.directives, " ")], " ");
      return (i === "query" ? "" : i + " ") + t.selectionSet;
    } }, VariableDefinition: { leave: ({ variable: t, type: e, defaultValue: i, directives: n }) => t + ": " + e + Q(" = ", i) + Q(" ", Y(n, " ")) }, SelectionSet: { leave: ({ selections: t }) => Ne(t) }, Field: { leave({ alias: t, name: e, arguments: i, directives: n, selectionSet: s }) {
      const o = Q("", t, ": ") + e;
      let r = o + Q("(", Y(i, ", "), ")");
      return r.length > 80 && (r = o + Q(`(
`, hi(Y(i, `
`)), `
)`)), Y([r, Y(n, " "), s], " ");
    } }, Argument: { leave: ({ name: t, value: e }) => t + ": " + e }, FragmentSpread: { leave: ({ name: t, directives: e }) => "..." + t + Q(" ", Y(e, " ")) }, InlineFragment: { leave: ({ typeCondition: t, directives: e, selectionSet: i }) => Y(["...", Q("on ", t), Y(e, " "), i], " ") }, FragmentDefinition: { leave: ({ name: t, typeCondition: e, variableDefinitions: i, directives: n, selectionSet: s }) => `fragment ${t}${Q("(", Y(i, ", "), ")")} on ${e} ${Q("", Y(n, " "), " ")}` + s }, IntValue: { leave: ({ value: t }) => t }, FloatValue: { leave: ({ value: t }) => t }, StringValue: { leave: ({ value: t, block: e }) => e ? function(i, n) {
      const s = i.replace(/"""/g, '\\"""'), o = s.split(/\r\n|[\n\r]/g), r = o.length === 1, a = o.length > 1 && o.slice(1).every((Z) => Z.length === 0 || dn(Z.charCodeAt(0))), l = s.endsWith('\\"""'), c = i.endsWith('"') && !l, d = i.endsWith("\\"), h = c || d, p = !(n != null && n.minimize) && (!r || i.length > 70 || h || a || l);
      let m = "";
      const X = r && dn(i.charCodeAt(0));
      return (p && !X || a) && (m += `
`), m += s, (p || h) && (m += `
`), '"""' + m + '"""';
    }(t) : `"${t.replace(Wl, fl)}"` }, BooleanValue: { leave: ({ value: t }) => t ? "true" : "false" }, NullValue: { leave: () => "null" }, EnumValue: { leave: ({ value: t }) => t }, ListValue: { leave: ({ values: t }) => "[" + Y(t, ", ") + "]" }, ObjectValue: { leave: ({ fields: t }) => "{" + Y(t, ", ") + "}" }, ObjectField: { leave: ({ name: t, value: e }) => t + ": " + e }, Directive: { leave: ({ name: t, arguments: e }) => "@" + t + Q("(", Y(e, ", "), ")") }, NamedType: { leave: ({ name: t }) => t }, ListType: { leave: ({ type: t }) => "[" + t + "]" }, NonNullType: { leave: ({ type: t }) => t + "!" }, SchemaDefinition: { leave: ({ description: t, directives: e, operationTypes: i }) => Q("", t, `
`) + Y(["schema", Y(e, " "), Ne(i)], " ") }, OperationTypeDefinition: { leave: ({ operation: t, type: e }) => t + ": " + e }, ScalarTypeDefinition: { leave: ({ description: t, name: e, directives: i }) => Q("", t, `
`) + Y(["scalar", e, Y(i, " ")], " ") }, ObjectTypeDefinition: { leave: ({ description: t, name: e, interfaces: i, directives: n, fields: s }) => Q("", t, `
`) + Y(["type", e, Q("implements ", Y(i, " & ")), Y(n, " "), Ne(s)], " ") }, FieldDefinition: { leave: ({ description: t, name: e, arguments: i, type: n, directives: s }) => Q("", t, `
`) + e + (Io(i) ? Q(`(
`, hi(Y(i, `
`)), `
)`) : Q("(", Y(i, ", "), ")")) + ": " + n + Q(" ", Y(s, " ")) }, InputValueDefinition: { leave: ({ description: t, name: e, type: i, defaultValue: n, directives: s }) => Q("", t, `
`) + Y([e + ": " + i, Q("= ", n), Y(s, " ")], " ") }, InterfaceTypeDefinition: { leave: ({ description: t, name: e, interfaces: i, directives: n, fields: s }) => Q("", t, `
`) + Y(["interface", e, Q("implements ", Y(i, " & ")), Y(n, " "), Ne(s)], " ") }, UnionTypeDefinition: { leave: ({ description: t, name: e, directives: i, types: n }) => Q("", t, `
`) + Y(["union", e, Y(i, " "), Q("= ", Y(n, " | "))], " ") }, EnumTypeDefinition: { leave: ({ description: t, name: e, directives: i, values: n }) => Q("", t, `
`) + Y(["enum", e, Y(i, " "), Ne(n)], " ") }, EnumValueDefinition: { leave: ({ description: t, name: e, directives: i }) => Q("", t, `
`) + Y([e, Y(i, " ")], " ") }, InputObjectTypeDefinition: { leave: ({ description: t, name: e, directives: i, fields: n }) => Q("", t, `
`) + Y(["input", e, Y(i, " "), Ne(n)], " ") }, DirectiveDefinition: { leave: ({ description: t, name: e, arguments: i, repeatable: n, locations: s }) => Q("", t, `
`) + "directive @" + e + (Io(i) ? Q(`(
`, hi(Y(i, `
`)), `
)`) : Q("(", Y(i, ", "), ")")) + (n ? " repeatable" : "") + " on " + Y(s, " | ") }, SchemaExtension: { leave: ({ directives: t, operationTypes: e }) => Y(["extend schema", Y(t, " "), Ne(e)], " ") }, ScalarTypeExtension: { leave: ({ name: t, directives: e }) => Y(["extend scalar", t, Y(e, " ")], " ") }, ObjectTypeExtension: { leave: ({ name: t, interfaces: e, directives: i, fields: n }) => Y(["extend type", t, Q("implements ", Y(e, " & ")), Y(i, " "), Ne(n)], " ") }, InterfaceTypeExtension: { leave: ({ name: t, interfaces: e, directives: i, fields: n }) => Y(["extend interface", t, Q("implements ", Y(e, " & ")), Y(i, " "), Ne(n)], " ") }, UnionTypeExtension: { leave: ({ name: t, directives: e, types: i }) => Y(["extend union", t, Y(e, " "), Q("= ", Y(i, " | "))], " ") }, EnumTypeExtension: { leave: ({ name: t, directives: e, values: i }) => Y(["extend enum", t, Y(e, " "), Ne(i)], " ") }, InputObjectTypeExtension: { leave: ({ name: t, directives: e, fields: i }) => Y(["extend input", t, Y(e, " "), Ne(i)], " ") } };
    function Y(t, e = "") {
      var i;
      return (i = t == null ? void 0 : t.filter((n) => n).join(e)) !== null && i !== void 0 ? i : "";
    }
    function Ne(t) {
      return Q(`{
`, hi(Y(t, `
`)), `
}`);
    }
    function Q(t, e, i = "") {
      return e != null && e !== "" ? t + e + i : "";
    }
    function hi(t) {
      return Q("  ", t.replace(/\n/g, `
  `));
    }
    function Io(t) {
      var e;
      return (e = t == null ? void 0 : t.some((i) => i.includes(`
`))) !== null && e !== void 0 && e;
    }
    const So = (t) => {
      var e, i;
      let n;
      const s = t.definitions.filter((o) => o.kind === "OperationDefinition");
      return s.length === 1 && (n = (i = (e = s[0]) == null ? void 0 : e.name) == null ? void 0 : i.value), n;
    }, pn = (t) => {
      if (typeof t == "string") {
        let i;
        try {
          const n = Zo(t);
          i = So(n);
        } catch (n) {
        }
        return { query: t, operationName: i };
      }
      const e = So(t);
      return { query: go(t), operationName: e };
    };
    class bt extends Error {
      constructor(e, i) {
        super(`${bt.extractMessage(e)}: ${JSON.stringify({ response: e, request: i })}`), Object.setPrototypeOf(this, bt.prototype), this.response = e, this.request = i, typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, bt);
      }
      static extractMessage(e) {
        var i, n, s;
        return (s = (n = (i = e.errors) == null ? void 0 : i[0]) == null ? void 0 : n.message) != null ? s : `GraphQL Error (Code: ${e.status})`;
      }
    }
    var mn = { exports: {} };
    (function(t, e) {
      var i, n = typeof self != "undefined" ? self : Ur, s = function() {
        function r() {
          this.fetch = !1, this.DOMException = n.DOMException;
        }
        return r.prototype = n, new r();
      }();
      i = s, function(r) {
        var a = "URLSearchParams" in i, l = "Symbol" in i && "iterator" in Symbol, c = "FileReader" in i && "Blob" in i && function() {
          try {
            return new Blob(), !0;
          } catch (u) {
            return !1;
          }
        }(), d = "FormData" in i, h = "ArrayBuffer" in i;
        if (h)
          var p = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"], m = ArrayBuffer.isView || function(u) {
            return u && p.indexOf(Object.prototype.toString.call(u)) > -1;
          };
        function X(u) {
          if (typeof u != "string" && (u = String(u)), /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(u))
            throw new TypeError("Invalid character in header field name");
          return u.toLowerCase();
        }
        function Z(u) {
          return typeof u != "string" && (u = String(u)), u;
        }
        function V(u) {
          var G = { next: function() {
            var v = u.shift();
            return { done: v === void 0, value: v };
          } };
          return l && (G[Symbol.iterator] = function() {
            return G;
          }), G;
        }
        function y(u) {
          this.map = {}, u instanceof y ? u.forEach(function(G, v) {
            this.append(v, G);
          }, this) : Array.isArray(u) ? u.forEach(function(G) {
            this.append(G[0], G[1]);
          }, this) : u && Object.getOwnPropertyNames(u).forEach(function(G) {
            this.append(G, u[G]);
          }, this);
        }
        function g(u) {
          if (u.bodyUsed)
            return Promise.reject(new TypeError("Already read"));
          u.bodyUsed = !0;
        }
        function b(u) {
          return new Promise(function(G, v) {
            u.onload = function() {
              G(u.result);
            }, u.onerror = function() {
              v(u.error);
            };
          });
        }
        function I(u) {
          var G = new FileReader(), v = b(G);
          return G.readAsArrayBuffer(u), v;
        }
        function R(u) {
          if (u.slice)
            return u.slice(0);
          var G = new Uint8Array(u.byteLength);
          return G.set(new Uint8Array(u)), G.buffer;
        }
        function L() {
          return this.bodyUsed = !1, this._initBody = function(u) {
            var G;
            this._bodyInit = u, u ? typeof u == "string" ? this._bodyText = u : c && Blob.prototype.isPrototypeOf(u) ? this._bodyBlob = u : d && FormData.prototype.isPrototypeOf(u) ? this._bodyFormData = u : a && URLSearchParams.prototype.isPrototypeOf(u) ? this._bodyText = u.toString() : h && c && (G = u) && DataView.prototype.isPrototypeOf(G) ? (this._bodyArrayBuffer = R(u.buffer), this._bodyInit = new Blob([this._bodyArrayBuffer])) : h && (ArrayBuffer.prototype.isPrototypeOf(u) || m(u)) ? this._bodyArrayBuffer = R(u) : this._bodyText = u = Object.prototype.toString.call(u) : this._bodyText = "", this.headers.get("content-type") || (typeof u == "string" ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : a && URLSearchParams.prototype.isPrototypeOf(u) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"));
          }, c && (this.blob = function() {
            var u = g(this);
            if (u)
              return u;
            if (this._bodyBlob)
              return Promise.resolve(this._bodyBlob);
            if (this._bodyArrayBuffer)
              return Promise.resolve(new Blob([this._bodyArrayBuffer]));
            if (this._bodyFormData)
              throw new Error("could not read FormData body as blob");
            return Promise.resolve(new Blob([this._bodyText]));
          }, this.arrayBuffer = function() {
            return this._bodyArrayBuffer ? g(this) || Promise.resolve(this._bodyArrayBuffer) : this.blob().then(I);
          }), this.text = function() {
            var u, G, v, f = g(this);
            if (f)
              return f;
            if (this._bodyBlob)
              return u = this._bodyBlob, G = new FileReader(), v = b(G), G.readAsText(u), v;
            if (this._bodyArrayBuffer)
              return Promise.resolve(function(M) {
                for (var S = new Uint8Array(M), T = new Array(S.length), $ = 0; $ < S.length; $++)
                  T[$] = String.fromCharCode(S[$]);
                return T.join("");
              }(this._bodyArrayBuffer));
            if (this._bodyFormData)
              throw new Error("could not read FormData body as text");
            return Promise.resolve(this._bodyText);
          }, d && (this.formData = function() {
            return this.text().then(x);
          }), this.json = function() {
            return this.text().then(JSON.parse);
          }, this;
        }
        y.prototype.append = function(u, G) {
          u = X(u), G = Z(G);
          var v = this.map[u];
          this.map[u] = v ? v + ", " + G : G;
        }, y.prototype.delete = function(u) {
          delete this.map[X(u)];
        }, y.prototype.get = function(u) {
          return u = X(u), this.has(u) ? this.map[u] : null;
        }, y.prototype.has = function(u) {
          return this.map.hasOwnProperty(X(u));
        }, y.prototype.set = function(u, G) {
          this.map[X(u)] = Z(G);
        }, y.prototype.forEach = function(u, G) {
          for (var v in this.map)
            this.map.hasOwnProperty(v) && u.call(G, this.map[v], v, this);
        }, y.prototype.keys = function() {
          var u = [];
          return this.forEach(function(G, v) {
            u.push(v);
          }), V(u);
        }, y.prototype.values = function() {
          var u = [];
          return this.forEach(function(G) {
            u.push(G);
          }), V(u);
        }, y.prototype.entries = function() {
          var u = [];
          return this.forEach(function(G, v) {
            u.push([v, G]);
          }), V(u);
        }, l && (y.prototype[Symbol.iterator] = y.prototype.entries);
        var F = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
        function H(u, G) {
          var v, f, M = (G = G || {}).body;
          if (u instanceof H) {
            if (u.bodyUsed)
              throw new TypeError("Already read");
            this.url = u.url, this.credentials = u.credentials, G.headers || (this.headers = new y(u.headers)), this.method = u.method, this.mode = u.mode, this.signal = u.signal, M || u._bodyInit == null || (M = u._bodyInit, u.bodyUsed = !0);
          } else
            this.url = String(u);
          if (this.credentials = G.credentials || this.credentials || "same-origin", !G.headers && this.headers || (this.headers = new y(G.headers)), this.method = (v = G.method || this.method || "GET", f = v.toUpperCase(), F.indexOf(f) > -1 ? f : v), this.mode = G.mode || this.mode || null, this.signal = G.signal || this.signal, this.referrer = null, (this.method === "GET" || this.method === "HEAD") && M)
            throw new TypeError("Body not allowed for GET or HEAD requests");
          this._initBody(M);
        }
        function x(u) {
          var G = new FormData();
          return u.trim().split("&").forEach(function(v) {
            if (v) {
              var f = v.split("="), M = f.shift().replace(/\+/g, " "), S = f.join("=").replace(/\+/g, " ");
              G.append(decodeURIComponent(M), decodeURIComponent(S));
            }
          }), G;
        }
        function N(u, G) {
          G || (G = {}), this.type = "default", this.status = G.status === void 0 ? 200 : G.status, this.ok = this.status >= 200 && this.status < 300, this.statusText = "statusText" in G ? G.statusText : "OK", this.headers = new y(G.headers), this.url = G.url || "", this._initBody(u);
        }
        H.prototype.clone = function() {
          return new H(this, { body: this._bodyInit });
        }, L.call(H.prototype), L.call(N.prototype), N.prototype.clone = function() {
          return new N(this._bodyInit, { status: this.status, statusText: this.statusText, headers: new y(this.headers), url: this.url });
        }, N.error = function() {
          var u = new N(null, { status: 0, statusText: "" });
          return u.type = "error", u;
        };
        var K = [301, 302, 303, 307, 308];
        N.redirect = function(u, G) {
          if (K.indexOf(G) === -1)
            throw new RangeError("Invalid status code");
          return new N(null, { status: G, headers: { location: u } });
        }, r.DOMException = i.DOMException;
        try {
          new r.DOMException();
        } catch (u) {
          r.DOMException = function(G, v) {
            this.message = G, this.name = v;
            var f = Error(G);
            this.stack = f.stack;
          }, r.DOMException.prototype = Object.create(Error.prototype), r.DOMException.prototype.constructor = r.DOMException;
        }
        function k(u, G) {
          return new Promise(function(v, f) {
            var M = new H(u, G);
            if (M.signal && M.signal.aborted)
              return f(new r.DOMException("Aborted", "AbortError"));
            var S = new XMLHttpRequest();
            function T() {
              S.abort();
            }
            S.onload = function() {
              var $, A, B = { status: S.status, statusText: S.statusText, headers: ($ = S.getAllResponseHeaders() || "", A = new y(), $.replace(/\r?\n[\t ]+/g, " ").split(/\r?\n/).forEach(function(Ie) {
                var be = Ie.split(":"), J = be.shift().trim();
                if (J) {
                  var P = be.join(":").trim();
                  A.append(J, P);
                }
              }), A) };
              B.url = "responseURL" in S ? S.responseURL : B.headers.get("X-Request-URL");
              var z = "response" in S ? S.response : S.responseText;
              v(new N(z, B));
            }, S.onerror = function() {
              f(new TypeError("Network request failed"));
            }, S.ontimeout = function() {
              f(new TypeError("Network request failed"));
            }, S.onabort = function() {
              f(new r.DOMException("Aborted", "AbortError"));
            }, S.open(M.method, M.url, !0), M.credentials === "include" ? S.withCredentials = !0 : M.credentials === "omit" && (S.withCredentials = !1), "responseType" in S && c && (S.responseType = "blob"), M.headers.forEach(function($, A) {
              S.setRequestHeader(A, $);
            }), M.signal && (M.signal.addEventListener("abort", T), S.onreadystatechange = function() {
              S.readyState === 4 && M.signal.removeEventListener("abort", T);
            }), S.send(M._bodyInit === void 0 ? null : M._bodyInit);
          });
        }
        k.polyfill = !0, i.fetch || (i.fetch = k, i.Headers = y, i.Request = H, i.Response = N), r.Headers = y, r.Request = H, r.Response = N, r.fetch = k, Object.defineProperty(r, "__esModule", { value: !0 });
      }({}), s.fetch.ponyfill = !0, delete s.fetch.polyfill;
      var o = s;
      (e = o.fetch).default = o.fetch, e.fetch = o.fetch, e.Headers = o.Headers, e.Request = o.Request, e.Response = o.Response, t.exports = e;
    })(mn, mn.exports);
    var pi = mn.exports;
    const mi = ji(pi), Tl = or({ __proto__: null, default: mi }, [pi]), Zt = (t) => {
      let e = {};
      return t && (typeof Headers != "undefined" && t instanceof Headers || Tl && pi.Headers && t instanceof pi.Headers ? e = ((i) => {
        const n = {};
        return i.forEach((s, o) => {
          n[o] = s;
        }), n;
      })(t) : Array.isArray(t) ? t.forEach(([i, n]) => {
        i && n !== void 0 && (e[i] = n);
      }) : e = t), e;
    }, Xo = (t) => t.replace(/([\s,]|#[^\n\r]+)+/g, " ").trim(), wl = (t) => (e) => ne(this, null, function* () {
      var i;
      const { url: n, query: s, variables: o, operationName: r, fetch: a, fetchOptions: l, middleware: c } = e, d = U({}, e.headers);
      let h, p = "";
      t === "POST" ? (h = Ll(s, o, r, l.jsonSerializer), typeof h == "string" && (d["Content-Type"] = "application/json")) : p = ((V) => {
        if (!Array.isArray(V.query)) {
          const b = V, I = [`query=${encodeURIComponent(Xo(b.query))}`];
          return V.variables && I.push(`variables=${encodeURIComponent(b.jsonSerializer.stringify(b.variables))}`), b.operationName && I.push(`operationName=${encodeURIComponent(b.operationName)}`), I.join("&");
        }
        if (V.variables !== void 0 && !Array.isArray(V.variables))
          throw new Error("Cannot create query with given variable type, array expected");
        const y = V, g = V.query.reduce((b, I, R) => (b.push({ query: Xo(I), variables: y.variables ? y.jsonSerializer.stringify(y.variables[R]) : void 0 }), b), []);
        return `query=${encodeURIComponent(y.jsonSerializer.stringify(g))}`;
      })({ query: s, variables: o, operationName: r, jsonSerializer: (i = l.jsonSerializer) != null ? i : on });
      const m = U({ method: t, headers: d, body: h }, l);
      let X = n, Z = m;
      if (c) {
        const V = yield Promise.resolve(c(Ve(U({}, m), { url: n, operationName: r, variables: o }))), { url: y } = V;
        X = y, Z = Ue(V, ["url"]);
      }
      return p && (X = `${X}?${p}`), yield a(X, Z);
    });
    class Nl {
      constructor(e, i = {}) {
        this.url = e, this.requestConfig = i, this.rawRequest = (...n) => ne(this, null, function* () {
          const [s, o, r] = n, a = ((y, g, b) => y.query ? y : { query: y, variables: g, requestHeaders: b, signal: void 0 })(s, o, r), l = this.requestConfig, { headers: c, fetch: d = mi, method: h = "POST", requestMiddleware: p, responseMiddleware: m } = l, X = Ue(l, ["headers", "fetch", "method", "requestMiddleware", "responseMiddleware"]), { url: Z } = this;
          a.signal !== void 0 && (X.signal = a.signal);
          const { operationName: V } = pn(a.query);
          return bn({ url: Z, query: a.query, variables: a.variables, headers: U(U({}, Zt(Zn(c))), Zt(a.requestHeaders)), operationName: V, fetch: d, method: h, fetchOptions: X, middleware: p }).then((y) => (m && m(y), y)).catch((y) => {
            throw m && m(y), y;
          });
        });
      }
      request(e, ...i) {
        return ne(this, null, function* () {
          const [n, s] = i, o = ((V, y, g) => V.document ? V : { document: V, variables: y, requestHeaders: g, signal: void 0 })(e, n, s), r = this.requestConfig, { headers: a, fetch: l = mi, method: c = "POST", requestMiddleware: d, responseMiddleware: h } = r, p = Ue(r, ["headers", "fetch", "method", "requestMiddleware", "responseMiddleware"]), { url: m } = this;
          o.signal !== void 0 && (p.signal = o.signal);
          const { query: X, operationName: Z } = pn(o.document);
          return bn({ url: m, query: X, variables: o.variables, headers: U(U({}, Zt(Zn(a))), Zt(o.requestHeaders)), operationName: Z, fetch: l, method: c, fetchOptions: p, middleware: d }).then((V) => (h && h(V), V.data)).catch((V) => {
            throw h && h(V), V;
          });
        });
      }
      batchRequests(e, i) {
        var n;
        const s = ((d, h) => d.documents ? d : { documents: d, requestHeaders: h, signal: void 0 })(e, i), o = this.requestConfig, { headers: r } = o, a = Ue(o, ["headers"]);
        s.signal !== void 0 && (a.signal = s.signal);
        const l = s.documents.map(({ document: d }) => pn(d).query), c = s.documents.map(({ variables: d }) => d);
        return bn({ url: this.url, query: l, variables: c, headers: U(U({}, Zt(Zn(r))), Zt(s.requestHeaders)), operationName: void 0, fetch: (n = this.requestConfig.fetch) != null ? n : mi, method: this.requestConfig.method || "POST", fetchOptions: a, middleware: this.requestConfig.requestMiddleware }).then((d) => (this.requestConfig.responseMiddleware && this.requestConfig.responseMiddleware(d), d.data)).catch((d) => {
          throw this.requestConfig.responseMiddleware && this.requestConfig.responseMiddleware(d), d;
        });
      }
      setHeaders(e) {
        return this.requestConfig.headers = e, this;
      }
      setHeader(e, i) {
        const { headers: n } = this.requestConfig;
        return n ? n[e] = i : this.requestConfig.headers = { [e]: i }, this;
      }
      setEndpoint(e) {
        return this.url = e, this;
      }
    }
    const bn = (t) => ne(this, null, function* () {
      var e, i;
      const { query: n, variables: s, fetchOptions: o } = t, r = wl(((e = t.method) != null ? e : "post").toUpperCase()), a = Array.isArray(t.query), l = yield r(t), c = yield xl(l, (i = o.jsonSerializer) != null ? i : on), d = Array.isArray(c) ? !c.some(({ data: p }) => !p) : !!c.data, h = Array.isArray(c) || !c.errors || Array.isArray(c.errors) && !c.errors.length || o.errorPolicy === "all" || o.errorPolicy === "ignore";
      if (l.ok && h && d) {
        const p = c, m = Ue(p, ["errors"]), X = o.errorPolicy === "ignore" ? m : c;
        return Ve(U({}, a ? { data: X } : X), { headers: l.headers, status: l.status });
      }
      throw new bt(Ve(U({}, typeof c == "string" ? { error: c } : c), { status: l.status, headers: l.headers }), { query: n, variables: s });
    }), Ll = (t, e, i, n) => {
      const s = n != null ? n : on;
      if (!Array.isArray(t))
        return s.stringify({ query: t, variables: e, operationName: i });
      if (e !== void 0 && !Array.isArray(e))
        throw new Error("Cannot create request body with given variable type, array expected");
      const o = t.reduce((r, a, l) => (r.push({ query: a, variables: e ? e[l] : void 0 }), r), []);
      return s.stringify(o);
    }, xl = (t, e) => ne(this, null, function* () {
      let i;
      return t.headers.forEach((n, s) => {
        s.toLowerCase() === "content-type" && (i = n);
      }), i && (i.toLowerCase().startsWith("application/json") || i.toLowerCase().startsWith("application/graphql+json") || i.toLowerCase().startsWith("application/graphql-response+json")) ? e.parse(yield t.text()) : t.text();
    }), Zn = (t) => typeof t == "function" ? t() : t;
    var bi = function() {
      return bi = Object.assign || function(t) {
        for (var e, i = 1, n = arguments.length; i < n; i++)
          for (var s in e = arguments[i])
            Object.prototype.hasOwnProperty.call(e, s) && (t[s] = e[s]);
        return t;
      }, bi.apply(this, arguments);
    }, Zi = /* @__PURE__ */ new Map(), yn = /* @__PURE__ */ new Map(), Vo = !0, yi = !1;
    function Go(t) {
      return t.replace(/[\s,]+/g, " ").trim();
    }
    function Jl(t) {
      var e = /* @__PURE__ */ new Set(), i = [];
      return t.definitions.forEach(function(n) {
        if (n.kind === "FragmentDefinition") {
          var s = n.name.value, o = Go((a = n.loc).source.body.substring(a.start, a.end)), r = yn.get(s);
          r && !r.has(o) ? Vo && console.warn("Warning: fragment with name " + s + ` already exists.
graphql-tag enforces all fragment names across your application to be unique; read more about
this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names`) : r || yn.set(s, r = /* @__PURE__ */ new Set()), r.add(o), e.has(o) || (e.add(o), i.push(n));
        } else
          i.push(n);
        var a;
      }), bi(bi({}, t), { definitions: i });
    }
    function Yl(t) {
      var e = Go(t);
      if (!Zi.has(e)) {
        var i = Zo(t, { experimentalFragmentVariables: yi, allowLegacyFragmentVariables: yi });
        if (!i || i.kind !== "Document")
          throw new Error("Not a valid GraphQL document.");
        Zi.set(e, function(n) {
          var s = new Set(n.definitions);
          s.forEach(function(r) {
            r.loc && delete r.loc, Object.keys(r).forEach(function(a) {
              var l = r[a];
              l && typeof l == "object" && s.add(l);
            });
          });
          var o = n.loc;
          return o && (delete o.startToken, delete o.endToken), n;
        }(Jl(i)));
      }
      return Zi.get(e);
    }
    function Ge(t) {
      for (var e = [], i = 1; i < arguments.length; i++)
        e[i - 1] = arguments[i];
      typeof t == "string" && (t = [t]);
      var n = t[0];
      return e.forEach(function(s, o) {
        s && s.kind === "Document" ? n += s.loc.source.body : n += s, n += t[o + 1];
      }), Yl(n);
    }
    var Lt, Kl = Ge, Ul = function() {
      Zi.clear(), yn.clear();
    }, Fl = function() {
      Vo = !1;
    }, Hl = function() {
      yi = !0;
    }, El = function() {
      yi = !1;
    };
    (Lt = Ge || (Ge = {})).gql = Kl, Lt.resetCaches = Ul, Lt.disableFragmentWarnings = Fl, Lt.enableExperimentalFragmentVariables = Hl, Lt.disableExperimentalFragmentVariables = El, Ge.default = Ge;
    const Wo = Ge`
	mutation PushPayload(
		$session_secure_id: String!
		$payload_id: ID!
		$events: ReplayEventsInput!
		$messages: String!
		$resources: String!
		$web_socket_events: String!
		$errors: [ErrorObjectInput]!
		$is_beacon: Boolean
		$has_session_unloaded: Boolean
		$highlight_logs: String
	) {
		pushPayload(
			session_secure_id: $session_secure_id
			payload_id: $payload_id
			events: $events
			messages: $messages
			resources: $resources
			web_socket_events: $web_socket_events
			errors: $errors
			is_beacon: $is_beacon
			has_session_unloaded: $has_session_unloaded
			highlight_logs: $highlight_logs
		)
	}
`, Ml = Ge`
	mutation PushPayloadCompressed(
		$session_secure_id: String!
		$payload_id: ID!
		$data: String!
	) {
		pushPayloadCompressed(
			session_secure_id: $session_secure_id
			payload_id: $payload_id
			data: $data
		)
	}
`, zl = Ge`
	mutation identifySession(
		$session_secure_id: String!
		$user_identifier: String!
		$user_object: Any
	) {
		identifySession(
			session_secure_id: $session_secure_id
			user_identifier: $user_identifier
			user_object: $user_object
		)
	}
`, Ol = Ge`
	mutation addSessionProperties(
		$session_secure_id: String!
		$properties_object: Any
	) {
		addSessionProperties(
			session_secure_id: $session_secure_id
			properties_object: $properties_object
		)
	}
`, Pl = Ge`
	mutation pushMetrics($metrics: [MetricInput]!) {
		pushMetrics(metrics: $metrics)
	}
`, Bl = Ge`
	mutation addSessionFeedback(
		$session_secure_id: String!
		$user_name: String
		$user_email: String
		$verbatim: String!
		$timestamp: Timestamp!
	) {
		addSessionFeedback(
			session_secure_id: $session_secure_id
			user_name: $user_name
			user_email: $user_email
			verbatim: $verbatim
			timestamp: $timestamp
		)
	}
`, Dl = Ge`
	mutation initializeSession(
		$session_secure_id: String!
		$organization_verbose_id: String!
		$enable_strict_privacy: Boolean!
		$privacy_setting: String!
		$enable_recording_network_contents: Boolean!
		$clientVersion: String!
		$firstloadVersion: String!
		$clientConfig: String!
		$environment: String!
		$id: String!
		$appVersion: String
		$serviceName: String!
		$client_id: String!
		$network_recording_domains: [String!]
		$disable_session_recording: Boolean
	) {
		initializeSession(
			session_secure_id: $session_secure_id
			organization_verbose_id: $organization_verbose_id
			enable_strict_privacy: $enable_strict_privacy
			enable_recording_network_contents: $enable_recording_network_contents
			clientVersion: $clientVersion
			firstloadVersion: $firstloadVersion
			clientConfig: $clientConfig
			environment: $environment
			appVersion: $appVersion
			serviceName: $serviceName
			fingerprint: $id
			client_id: $client_id
			network_recording_domains: $network_recording_domains
			disable_session_recording: $disable_session_recording
			privacy_setting: $privacy_setting
		) {
			secure_id
			project_id
		}
	}
`, Ql = Ge`
	query Ignore($id: ID!) {
		ignore(id: $id)
	}
`, jl = (t, e, i, n) => t(), Al = (t) => {
      t(window.location.href);
      var e = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function(o) {
        setTimeout(() => {
          var r, a;
          try {
            a = JSON.parse((r = o == null ? void 0 : o.toString()) != null ? r : "");
          } catch (l) {
            return;
          }
          a.type !== "track" && a.type !== "identify" || gn(a) && t(a);
        }, 100), e.call(this, o);
      };
      const i = (o) => {
        if (o.key === "ajs_user_id" || o.key === "ajs_anonymous_id" || o.key === "ajs_user_traits") {
          const { userId: r, userTraits: a } = fo();
          if (r) {
            let l = {};
            a && (l = JSON.parse(a));
            const c = { type: "identify", userId: r.toString(), traits: l };
            gn(c) && t(c);
          }
        }
      }, { userId: n, userTraits: s } = fo();
      if (n) {
        let o = {};
        s && (o = JSON.parse(s));
        const r = { type: "identify", userId: n.toString(), traits: o };
        gn(r) && t(r);
      }
      return window.addEventListener("storage", i), Qr(({ keyName: o }) => {
        i({ key: o });
      }), () => {
        window.removeEventListener("storage", i), XMLHttpRequest.prototype.send = e;
      };
    }, fo = () => ({ userId: Xe("ajs_user_id"), userTraits: Xe("ajs_user_traits"), anonymousId: Xe("ajs_anonymous_id") }), gn = (t) => {
      if (!t)
        return !1;
      let e = "";
      try {
        e = JSON.stringify(t);
      } catch (s) {
        return !1;
      }
      const i = _l(e), n = Xe(ce.SEGMENT_LAST_SENT_HASH_KEY);
      return (n === void 0 || i !== n) && (we(ce.SEGMENT_LAST_SENT_HASH_KEY, i), !0);
    }, _l = (t) => {
      var e = 0, i = t.length, n = 0;
      if (i > 0)
        for (; n < i; )
          e = (e << 5) - e + t.charCodeAt(n++) | 0;
      return e.toString();
    };
    function Ro(t, e) {
      return ql(t);
    }
    function vo(t) {
      if (t.id.length)
        return `#${t.id}`;
      if (t.classList.length) {
        let e = [];
        for (const i of t.classList)
          e.push(`.${i}`);
        return `${t.nodeName.toLowerCase()}${e.join(",")}`;
      }
      return t.nodeName.toLowerCase();
    }
    const ql = (t) => {
      let e = "";
      const i = t.getAttribute("class"), n = t.getAttribute("id");
      return n && (e = e.concat(Co(n, "#"))), i && (e = e.concat(Co(i, "."))), e === "" && (e = e.concat(t.tagName.toLowerCase())), e;
    }, Co = (t, e) => `${e}${t.trim().split(" ").join(e)}`, $l = (t, e) => {
      const i = function(a) {
        typeof a != "string" && (a = "");
        const l = (a = a.replace(/\s/g, "")).split(",");
        let c = l.lastIndexOf("");
        for (; c >= 0; )
          l[c - 1] += ",", l.splice(c, 1), c = l.lastIndexOf("");
        return l;
      }(t);
      let n = [];
      for (let a = 0; a < i.length; a++) {
        let l = i[a].split("+");
        n = [], l.length > 1 && (n = ia(To, l)), l = l[l.length - 1], l = l === "*" ? "*" : ta(l), l in Je || (Je[l] = []), Je[l].push({ mods: n, shortcut: i[a], key: i[a], method: e, keyup: !1, keydown: !0, scope: "all", splitKey: "+" });
      }
      var s, o, r;
      s = document, o = "keydown", r = (a) => {
        (function(l) {
          const c = Je["*"];
          let d = l.keyCode || l.which || l.charCode;
          if (d !== 93 && d !== 224 || (d = 91), ye.indexOf(d) === -1 && d !== 229 && ye.push(d), ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach((h) => {
            const p = ko[h];
            l[h] && ye.indexOf(p) === -1 ? ye.push(p) : !l[h] && ye.indexOf(p) > -1 ? ye.splice(ye.indexOf(p), 1) : h === "metaKey" && l[h] && ye.length === 3 && (l.ctrlKey || l.shiftKey || l.altKey || (ye = ye.slice(ye.indexOf(p))));
          }), !(d in ge) || (ge[d] = !0, c)) {
            for (const h in ge)
              Object.prototype.hasOwnProperty.call(ge, h) && (ge[h] = l[ko[h]]);
            if (l.getModifierState && (!l.altKey || l.ctrlKey) && l.getModifierState("AltGraph") && (ye.indexOf(17) === -1 && ye.push(17), ye.indexOf(18) === -1 && ye.push(18), ge[17] = !0, ge[18] = !0), d in Je) {
              for (let h = 0; h < Je[d].length; h++)
                if ((l.type === "keydown" && Je[d][h].keydown || l.type === "keyup" && Je[d][h].keyup) && Je[d][h].key) {
                  const p = Je[d][h];
                  na(l, p, "all");
                }
            }
          }
        })(a);
      }, s.addEventListener ? s.addEventListener(o, r, !1) : s.attachEvent && s.attachEvent(`on${o}`, () => {
        r(window.event);
      });
    };
    let ye = [];
    const Je = {}, In = typeof navigator != "undefined" && navigator.userAgent.toLowerCase().indexOf("firefox") > 0, ea = { backspace: 8, tab: 9, clear: 12, enter: 13, return: 13, esc: 27, escape: 27, space: 32, left: 37, up: 38, right: 39, down: 40, del: 46, delete: 46, ins: 45, insert: 45, home: 36, end: 35, pageup: 33, pagedown: 34, capslock: 20, num_0: 96, num_1: 97, num_2: 98, num_3: 99, num_4: 100, num_5: 101, num_6: 102, num_7: 103, num_8: 104, num_9: 105, num_multiply: 106, num_add: 107, num_enter: 108, num_subtract: 109, num_decimal: 110, num_divide: 111, "⇪": 20, ",": 188, ".": 190, "/": 191, "`": 192, "-": In ? 173 : 189, "=": In ? 61 : 187, ";": In ? 59 : 186, "'": 222, "[": 219, "]": 221, "\\": 220 }, ko = { 16: "shiftKey", 18: "altKey", 17: "ctrlKey", 91: "metaKey", shiftKey: 16, ctrlKey: 17, altKey: 18, metaKey: 91 }, ge = { 16: !1, 18: !1, 17: !1, 91: !1 }, To = { "⇧": 16, shift: 16, "⌥": 18, alt: 18, option: 18, "⌃": 17, ctrl: 17, control: 17, "⌘": 91, cmd: 91, command: 91 }, ta = (t) => ea[t.toLowerCase()] || To[t.toLowerCase()] || t.toUpperCase().charCodeAt(0);
    function ia(t, e) {
      const i = e.slice(0, e.length - 1);
      for (let n = 0; n < i.length; n++)
        i[n] = t[i[n].toLowerCase()];
      return i;
    }
    function na(t, e, i) {
      let n;
      if (e.scope === i || e.scope === "all") {
        n = e.mods.length > 0;
        for (const s in ge)
          Object.prototype.hasOwnProperty.call(ge, s) && (!ge[s] && e.mods.indexOf(+s) > -1 || ge[s] && e.mods.indexOf(+s) === -1) && (n = !1);
        (e.mods.length !== 0 || ge[16] || ge[18] || ge[17] || ge[91]) && !n && e.shortcut !== "*" || e.method(t, e) === !1 && (t.preventDefault ? t.preventDefault() : t.returnValue = !1, t.stopPropagation && t.stopPropagation(), t.cancelBubble && (t.cancelBubble = !0));
      }
    }
    var Oe, xt, wo, gi, Sn, No = -1, $e = function(t) {
      addEventListener("pageshow", function(e) {
        e.persisted && (No = e.timeStamp, t(e));
      }, !0);
    }, Xn = function() {
      return window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    }, Ii = function() {
      var t = Xn();
      return t && t.activationStart || 0;
    }, ve = function(t, e) {
      var i = Xn(), n = "navigate";
      return No >= 0 ? n = "back-forward-cache" : i && (document.prerendering || Ii() > 0 ? n = "prerender" : document.wasDiscarded ? n = "restore" : i.type && (n = i.type.replace(/_/g, "-"))), { name: t, value: e === void 0 ? -1 : e, rating: "good", delta: 0, entries: [], id: "v3-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: n };
    }, yt = function(t, e, i) {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(t)) {
          var n = new PerformanceObserver(function(s) {
            Promise.resolve().then(function() {
              e(s.getEntries());
            });
          });
          return n.observe(Object.assign({ type: t, buffered: !0 }, i || {})), n;
        }
      } catch (s) {
      }
    }, Ce = function(t, e, i, n) {
      var s, o;
      return function(r) {
        var a, l;
        e.value >= 0 && (r || n) && ((o = e.value - (s || 0)) || s === void 0) && (s = e.value, e.delta = o, e.rating = (a = e.value) > (l = i)[1] ? "poor" : a > l[0] ? "needs-improvement" : "good", t(e));
      };
    }, Vn = function(t) {
      requestAnimationFrame(function() {
        return requestAnimationFrame(function() {
          return t();
        });
      });
    }, Si = function(t) {
      var e = function(i) {
        i.type !== "pagehide" && document.visibilityState !== "hidden" || t(i);
      };
      addEventListener("visibilitychange", e, !0), addEventListener("pagehide", e, !0);
    }, Gn = function(t) {
      var e = !1;
      return function(i) {
        e || (t(i), e = !0);
      };
    }, gt = -1, Lo = function() {
      return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
    }, Xi = function(t) {
      document.visibilityState === "hidden" && gt > -1 && (gt = t.type === "visibilitychange" ? t.timeStamp : 0, sa());
    }, xo = function() {
      addEventListener("visibilitychange", Xi, !0), addEventListener("prerenderingchange", Xi, !0);
    }, sa = function() {
      removeEventListener("visibilitychange", Xi, !0), removeEventListener("prerenderingchange", Xi, !0);
    }, Wn = function() {
      return gt < 0 && (gt = Lo(), xo(), $e(function() {
        setTimeout(function() {
          gt = Lo(), xo();
        }, 0);
      })), { get firstHiddenTime() {
        return gt;
      } };
    }, Jt = function(t) {
      document.prerendering ? addEventListener("prerenderingchange", function() {
        return t();
      }, !0) : t();
    }, Jo = [1800, 3e3], Yo = function(t, e) {
      e = e || {}, Jt(function() {
        var i, n = Wn(), s = ve("FCP"), o = yt("paint", function(r) {
          r.forEach(function(a) {
            a.name === "first-contentful-paint" && (o.disconnect(), a.startTime < n.firstHiddenTime && (s.value = Math.max(a.startTime - Ii(), 0), s.entries.push(a), i(!0)));
          });
        });
        o && (i = Ce(t, s, Jo, e.reportAllChanges), $e(function(r) {
          s = ve("FCP"), i = Ce(t, s, Jo, e.reportAllChanges), Vn(function() {
            s.value = performance.now() - r.timeStamp, i(!0);
          });
        }));
      });
    }, Ko = [0.1, 0.25], Yt = { passive: !0, capture: !0 }, oa = /* @__PURE__ */ new Date(), Uo = function(t, e) {
      Oe || (Oe = e, xt = t, wo = /* @__PURE__ */ new Date(), Ho(removeEventListener), Fo());
    }, Fo = function() {
      if (xt >= 0 && xt < wo - oa) {
        var t = { entryType: "first-input", name: Oe.type, target: Oe.target, cancelable: Oe.cancelable, startTime: Oe.timeStamp, processingStart: Oe.timeStamp + xt };
        gi.forEach(function(e) {
          e(t);
        }), gi = [];
      }
    }, ra = function(t) {
      if (t.cancelable) {
        var e = (t.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - t.timeStamp;
        t.type == "pointerdown" ? function(i, n) {
          var s = function() {
            Uo(i, n), r();
          }, o = function() {
            r();
          }, r = function() {
            removeEventListener("pointerup", s, Yt), removeEventListener("pointercancel", o, Yt);
          };
          addEventListener("pointerup", s, Yt), addEventListener("pointercancel", o, Yt);
        }(e, t) : Uo(e, t);
      }
    }, Ho = function(t) {
      ["mousedown", "keydown", "touchstart", "pointerdown"].forEach(function(e) {
        return t(e, ra, Yt);
      });
    }, Eo = [100, 300], Mo = 0, fn = 1 / 0, Vi = 0, la = function(t) {
      t.forEach(function(e) {
        e.interactionId && (fn = Math.min(fn, e.interactionId), Vi = Math.max(Vi, e.interactionId), Mo = Vi ? (Vi - fn) / 7 + 1 : 0);
      });
    }, zo = function() {
      return Sn ? Mo : performance.interactionCount || 0;
    }, Oo = [200, 500], Po = 0, Bo = function() {
      return zo() - Po;
    }, Ye = [], Rn = {}, Do = function(t) {
      var e = Ye[Ye.length - 1], i = Rn[t.interactionId];
      if (i || Ye.length < 10 || t.duration > e.latency) {
        if (i)
          i.entries.push(t), i.latency = Math.max(i.latency, t.duration);
        else {
          var n = { id: t.interactionId, latency: t.duration, entries: [t] };
          Rn[n.id] = n, Ye.push(n);
        }
        Ye.sort(function(s, o) {
          return o.latency - s.latency;
        }), Ye.splice(10).forEach(function(s) {
          delete Rn[s.id];
        });
      }
    }, aa = function(t, e) {
      e = e || {}, Jt(function() {
        var i;
        "interactionCount" in performance || Sn || (Sn = yt("event", la, { type: "event", buffered: !0, durationThreshold: 0 }));
        var n, s = ve("INP"), o = function(a) {
          a.forEach(function(d) {
            d.interactionId && Do(d), d.entryType === "first-input" && !Ye.some(function(h) {
              return h.entries.some(function(p) {
                return d.duration === p.duration && d.startTime === p.startTime;
              });
            }) && Do(d);
          });
          var l, c = (l = Math.min(Ye.length - 1, Math.floor(Bo() / 50)), Ye[l]);
          c && c.latency !== s.value && (s.value = c.latency, s.entries = c.entries, n());
        }, r = yt("event", o, { durationThreshold: (i = e.durationThreshold) !== null && i !== void 0 ? i : 40 });
        n = Ce(t, s, Oo, e.reportAllChanges), r && ("interactionId" in PerformanceEventTiming.prototype && r.observe({ type: "first-input", buffered: !0 }), Si(function() {
          o(r.takeRecords()), s.value < 0 && Bo() > 0 && (s.value = 0, s.entries = []), n(!0);
        }), $e(function() {
          Ye = [], Po = zo(), s = ve("INP"), n = Ce(t, s, Oo, e.reportAllChanges);
        }));
      });
    }, Qo = [2500, 4e3], vn = {}, jo = [800, 1800], ca = function t(e) {
      document.prerendering ? Jt(function() {
        return t(e);
      }) : document.readyState !== "complete" ? addEventListener("load", function() {
        return t(e);
      }, !0) : setTimeout(e, 0);
    }, da = function(t, e) {
      e = e || {};
      var i = ve("TTFB"), n = Ce(t, i, jo, e.reportAllChanges);
      ca(function() {
        var s = Xn();
        if (s) {
          var o = s.responseStart;
          if (o <= 0 || o > performance.now())
            return;
          i.value = Math.max(o - Ii(), 0), i.entries = [s], n(!0), $e(function() {
            i = ve("TTFB", 0), (n = Ce(t, i, jo, e.reportAllChanges))(!0);
          });
        }
      });
    };
    const ua = (t) => {
      var e, i;
      return e = t, i = i || {}, Yo(Gn(function() {
        var n, s = ve("CLS", 0), o = 0, r = [], a = function(c) {
          c.forEach(function(d) {
            if (!d.hadRecentInput) {
              var h = r[0], p = r[r.length - 1];
              o && d.startTime - p.startTime < 1e3 && d.startTime - h.startTime < 5e3 ? (o += d.value, r.push(d)) : (o = d.value, r = [d]);
            }
          }), o > s.value && (s.value = o, s.entries = r, n());
        }, l = yt("layout-shift", a);
        l && (n = Ce(e, s, Ko, i.reportAllChanges), Si(function() {
          a(l.takeRecords()), n(!0);
        }), $e(function() {
          o = 0, s = ve("CLS", 0), n = Ce(e, s, Ko, i.reportAllChanges), Vn(function() {
            return n();
          });
        }), setTimeout(n, 0));
      })), Yo(t), function(n, s) {
        s = s || {}, Jt(function() {
          var o, r = Wn(), a = ve("FID"), l = function(h) {
            h.startTime < r.firstHiddenTime && (a.value = h.processingStart - h.startTime, a.entries.push(h), o(!0));
          }, c = function(h) {
            h.forEach(l);
          }, d = yt("first-input", c);
          o = Ce(n, a, Eo, s.reportAllChanges), d && Si(Gn(function() {
            c(d.takeRecords()), d.disconnect();
          })), d && $e(function() {
            var h;
            a = ve("FID"), o = Ce(n, a, Eo, s.reportAllChanges), gi = [], xt = -1, Oe = null, Ho(addEventListener), h = l, gi.push(h), Fo();
          });
        });
      }(t), function(n, s) {
        s = s || {}, Jt(function() {
          var o, r = Wn(), a = ve("LCP"), l = function(h) {
            var p = h[h.length - 1];
            p && p.startTime < r.firstHiddenTime && (a.value = Math.max(p.startTime - Ii(), 0), a.entries = [p], o());
          }, c = yt("largest-contentful-paint", l);
          if (c) {
            o = Ce(n, a, Qo, s.reportAllChanges);
            var d = Gn(function() {
              vn[a.id] || (l(c.takeRecords()), c.disconnect(), vn[a.id] = !0, o(!0));
            });
            ["keydown", "click"].forEach(function(h) {
              addEventListener(h, function() {
                return setTimeout(d, 0);
              }, !0);
            }), Si(d), $e(function(h) {
              a = ve("LCP"), o = Ce(n, a, Qo, s.reportAllChanges), Vn(function() {
                a.value = performance.now() - h.timeStamp, vn[a.id] = !0, o(!0);
              });
            });
          }
        });
      }(t), da(t), aa(t), () => {
      };
    }, Cn = (t) => t / Math.pow(1e3, 2), ha = (t) => 1024 * t, Ao = typeof window != "undefined" && "performance" in window && "memory" in performance ? performance : { memory: {} }, Kt = "highlightLogs", pa = (t) => {
      if (!t)
        return;
      let e = Xe(Kt) || "";
      e && (e.startsWith(t) ? (e = e.slice(t.length), we(Kt, e)) : ((i) => {
        let n = Xe(Kt) || "";
        n = n + "[" + (/* @__PURE__ */ new Date()).getTime() + "] " + i + `
`, we(Kt, n);
      })("Unable to clear logs " + t.replace(`
`, " ") + " from " + e.replace(`
`, " ")));
    }, Gi = () => {
      var t;
      const e = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var i = "";
      const n = typeof window != "undefined" && ((t = window.crypto) == null ? void 0 : t.getRandomValues), s = new Uint32Array(28);
      n && window.crypto.getRandomValues(s);
      for (let o = 0; o < 28; o++)
        i += e.charAt(n ? s[o] % 62 : Math.floor(62 * Math.random()));
      return i;
    }, _o = "dmFyIF9fZGVmUHJvcD1PYmplY3QuZGVmaW5lUHJvcGVydHksX19kZWZQcm9wcz1PYmplY3QuZGVmaW5lUHJvcGVydGllcyxfX2dldE93blByb3BEZXNjcz1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyxfX2dldE93blByb3BTeW1ib2xzPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsX19oYXNPd25Qcm9wPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksX19wcm9wSXNFbnVtPU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUsX19kZWZOb3JtYWxQcm9wPShlLHQsbik9PnQgaW4gZT9fX2RlZlByb3AoZSx0LHtlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpufSk6ZVt0XT1uLF9fc3ByZWFkVmFsdWVzPShlLHQpPT57Zm9yKHZhciBuIGluIHR8fCh0PXt9KSlfX2hhc093blByb3AuY2FsbCh0LG4pJiZfX2RlZk5vcm1hbFByb3AoZSxuLHRbbl0pO2lmKF9fZ2V0T3duUHJvcFN5bWJvbHMpZm9yKHZhciBuIG9mIF9fZ2V0T3duUHJvcFN5bWJvbHModCkpX19wcm9wSXNFbnVtLmNhbGwodCxuKSYmX19kZWZOb3JtYWxQcm9wKGUsbix0W25dKTtyZXR1cm4gZX0sX19zcHJlYWRQcm9wcz0oZSx0KT0+X19kZWZQcm9wcyhlLF9fZ2V0T3duUHJvcERlc2NzKHQpKSxfX29ialJlc3Q9KGUsdCk9Pnt2YXIgbj17fTtmb3IodmFyIHIgaW4gZSlfX2hhc093blByb3AuY2FsbChlLHIpJiZ0LmluZGV4T2Yocik8MCYmKG5bcl09ZVtyXSk7aWYobnVsbCE9ZSYmX19nZXRPd25Qcm9wU3ltYm9scylmb3IodmFyIHIgb2YgX19nZXRPd25Qcm9wU3ltYm9scyhlKSl0LmluZGV4T2Yocik8MCYmX19wcm9wSXNFbnVtLmNhbGwoZSxyKSYmKG5bcl09ZVtyXSk7cmV0dXJuIG59LF9fcHVibGljRmllbGQ9KGUsdCxuKT0+KF9fZGVmTm9ybWFsUHJvcChlLCJzeW1ib2wiIT10eXBlb2YgdD90KyIiOnQsbiksbiksX19hc3luYz0oZSx0LG4pPT5uZXcgUHJvbWlzZSgoKHIsaSk9Pnt2YXIgcz1lPT57dHJ5e2Eobi5uZXh0KGUpKX1jYXRjaCh0KXtpKHQpfX0sbz1lPT57dHJ5e2Eobi50aHJvdyhlKSl9Y2F0Y2godCl7aSh0KX19LGE9ZT0+ZS5kb25lP3IoZS52YWx1ZSk6UHJvbWlzZS5yZXNvbHZlKGUudmFsdWUpLnRoZW4ocyxvKTthKChuPW4uYXBwbHkoZSx0KSkubmV4dCgpKX0pKTshZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7ZnVuY3Rpb24gZShlLHQpe3JldHVybiB0LmZvckVhY2goKGZ1bmN0aW9uKHQpe3QmJiJzdHJpbmciIT10eXBlb2YgdCYmIUFycmF5LmlzQXJyYXkodCkmJk9iamVjdC5rZXlzKHQpLmZvckVhY2goKGZ1bmN0aW9uKG4pe2lmKCJkZWZhdWx0IiE9PW4mJiEobiBpbiBlKSl7dmFyIHI9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LG4pO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLG4sci5nZXQ/cjp7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdFtuXX19KX19KSl9KSksT2JqZWN0LmZyZWV6ZShlKX12YXIgdD0oZT0+KGVbZS5Jbml0aWFsaXplPTBdPSJJbml0aWFsaXplIixlW2UuQXN5bmNFdmVudHM9MV09IkFzeW5jRXZlbnRzIixlW2UuSWRlbnRpZnk9Ml09IklkZW50aWZ5IixlW2UuUHJvcGVydGllcz0zXT0iUHJvcGVydGllcyIsZVtlLk1ldHJpY3M9NF09Ik1ldHJpY3MiLGVbZS5GZWVkYmFjaz01XT0iRmVlZGJhY2siLGVbZS5DdXN0b21FdmVudD02XT0iQ3VzdG9tRXZlbnQiLGUpKSh0fHx7fSksbj0idW5kZWZpbmVkIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczoidW5kZWZpbmVkIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6InVuZGVmaW5lZCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOiJ1bmRlZmluZWQiIT10eXBlb2Ygc2VsZj9zZWxmOnt9O2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZSYmT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsImRlZmF1bHQiKT9lLmRlZmF1bHQ6ZX12YXIgaT17ZXhwb3J0czp7fX07IWZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlLHQpe3ZhciBuPVtdLHI9W107cmV0dXJuIG51bGw9PXQmJih0PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIG5bMF09PT10PyJbQ2lyY3VsYXIgfl0iOiJbQ2lyY3VsYXIgfi4iK3Iuc2xpY2UoMCxuLmluZGV4T2YodCkpLmpvaW4oIi4iKSsiXSJ9KSxmdW5jdGlvbihpLHMpe2lmKG4ubGVuZ3RoPjApe3ZhciBvPW4uaW5kZXhPZih0aGlzKTt+bz9uLnNwbGljZShvKzEpOm4ucHVzaCh0aGlzKSx+bz9yLnNwbGljZShvLDEvMCxpKTpyLnB1c2goaSksfm4uaW5kZXhPZihzKSYmKHM9dC5jYWxsKHRoaXMsaSxzKSl9ZWxzZSBuLnB1c2gocyk7cmV0dXJuIG51bGw9PWU/czplLmNhbGwodGhpcyxpLHMpfX0oZS5leHBvcnRzPWZ1bmN0aW9uKGUsdCxyLGkpe3JldHVybiBKU09OLnN0cmluZ2lmeShlLG4odCxpKSxyKX0pLmdldFNlcmlhbGl6ZT1ufShpKTt2YXIgcz1yKGkuZXhwb3J0cyksbz1mdW5jdGlvbigpe3JldHVybiBvPU9iamVjdC5hc3NpZ258fGZ1bmN0aW9uKGUpe2Zvcih2YXIgdCxuPTEscj1hcmd1bWVudHMubGVuZ3RoO248cjtuKyspZm9yKHZhciBpIGluIHQ9YXJndW1lbnRzW25dKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGkpJiYoZVtpXT10W2ldKTtyZXR1cm4gZX0sby5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIGEoZSx0KXtpZighQm9vbGVhbihlKSl0aHJvdyBuZXcgRXJyb3IodCl9ZnVuY3Rpb24gYyhlLHQpe2lmKCFCb29sZWFuKGUpKXRocm93IG5ldyBFcnJvcihudWxsIT10P3Q6IlVuZXhwZWN0ZWQgaW52YXJpYW50IHRyaWdnZXJlZC4iKX1jb25zdCBsPS9cclxufFtcblxyXS9nO2Z1bmN0aW9uIHUoZSx0KXtsZXQgbj0wLHI9MTtmb3IoY29uc3QgaSBvZiBlLmJvZHkubWF0Y2hBbGwobCkpe2lmKCJudW1iZXIiPT10eXBlb2YgaS5pbmRleHx8YyghMSksaS5pbmRleD49dClicmVhaztuPWkuaW5kZXgraVswXS5sZW5ndGgscis9MX1yZXR1cm57bGluZTpyLGNvbHVtbjp0KzEtbn19ZnVuY3Rpb24gZChlLHQpe2NvbnN0IG49ZS5sb2NhdGlvbk9mZnNldC5jb2x1bW4tMSxyPSIiLnBhZFN0YXJ0KG4pK2UuYm9keSxpPXQubGluZS0xLHM9ZS5sb2NhdGlvbk9mZnNldC5saW5lLTEsbz10LmxpbmUrcyxhPTE9PT10LmxpbmU/bjowLGM9dC5jb2x1bW4rYSxsPWAke2UubmFtZX06JHtvfToke2N9XG5gLHU9ci5zcGxpdCgvXHJcbnxbXG5ccl0vZyksZD11W2ldO2lmKGQubGVuZ3RoPjEyMCl7Y29uc3QgZT1NYXRoLmZsb29yKGMvODApLHQ9YyU4MCxuPVtdO2ZvcihsZXQgcj0wO3I8ZC5sZW5ndGg7cis9ODApbi5wdXNoKGQuc2xpY2UocixyKzgwKSk7cmV0dXJuIGwrcChbW2Ake299IHxgLG5bMF1dLC4uLm4uc2xpY2UoMSxlKzEpLm1hcCgoZT0+WyJ8IixlXSkpLFsifCIsIl4iLnBhZFN0YXJ0KHQpXSxbInwiLG5bZSsxXV1dKX1yZXR1cm4gbCtwKFtbby0xKyIgfCIsdVtpLTFdXSxbYCR7b30gfGAsZF0sWyJ8IiwiXiIucGFkU3RhcnQoYyldLFtgJHtvKzF9IHxgLHVbaSsxXV1dKX1mdW5jdGlvbiBwKGUpe2NvbnN0IHQ9ZS5maWx0ZXIoKChbZSx0XSk9PnZvaWQgMCE9PXQpKSxuPU1hdGgubWF4KC4uLnQubWFwKCgoW2VdKT0+ZS5sZW5ndGgpKSk7cmV0dXJuIHQubWFwKCgoW2UsdF0pPT5lLnBhZFN0YXJ0KG4pKyh0PyIgIit0OiIiKSkpLmpvaW4oIlxuIil9Y2xhc3MgaCBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGUsLi4udCl7dmFyIG4scixpO2NvbnN0e25vZGVzOnMsc291cmNlOm8scG9zaXRpb25zOmEscGF0aDpjLG9yaWdpbmFsRXJyb3I6bCxleHRlbnNpb25zOmR9PWZ1bmN0aW9uKGUpe2NvbnN0IHQ9ZVswXTtyZXR1cm4gbnVsbD09dHx8ImtpbmQiaW4gdHx8Imxlbmd0aCJpbiB0P3tub2Rlczp0LHNvdXJjZTplWzFdLHBvc2l0aW9uczplWzJdLHBhdGg6ZVszXSxvcmlnaW5hbEVycm9yOmVbNF0sZXh0ZW5zaW9uczplWzVdfTp0fSh0KTtzdXBlcihlKSx0aGlzLm5hbWU9IkdyYXBoUUxFcnJvciIsdGhpcy5wYXRoPW51bGwhPWM/Yzp2b2lkIDAsdGhpcy5vcmlnaW5hbEVycm9yPW51bGwhPWw/bDp2b2lkIDAsdGhpcy5ub2Rlcz1mKEFycmF5LmlzQXJyYXkocyk/czpzP1tzXTp2b2lkIDApO2NvbnN0IHA9ZihudWxsPT09KG49dGhpcy5ub2Rlcyl8fHZvaWQgMD09PW4/dm9pZCAwOm4ubWFwKChlPT5lLmxvYykpLmZpbHRlcigoZT0+bnVsbCE9ZSkpKTt0aGlzLnNvdXJjZT1udWxsIT1vP286bnVsbD09cHx8bnVsbD09PShyPXBbMF0pfHx2b2lkIDA9PT1yP3ZvaWQgMDpyLnNvdXJjZSx0aGlzLnBvc2l0aW9ucz1udWxsIT1hP2E6bnVsbD09cD92b2lkIDA6cC5tYXAoKGU9PmUuc3RhcnQpKSx0aGlzLmxvY2F0aW9ucz1hJiZvP2EubWFwKChlPT51KG8sZSkpKTpudWxsPT1wP3ZvaWQgMDpwLm1hcCgoZT0+dShlLnNvdXJjZSxlLnN0YXJ0KSkpO2NvbnN0IHk9Im9iamVjdCI9PXR5cGVvZihtPW51bGw9PWw/dm9pZCAwOmwuZXh0ZW5zaW9ucykmJm51bGwhPT1tP251bGw9PWw/dm9pZCAwOmwuZXh0ZW5zaW9uczp2b2lkIDA7dmFyIG07dGhpcy5leHRlbnNpb25zPW51bGwhPT0oaT1udWxsIT1kP2Q6eSkmJnZvaWQgMCE9PWk/aTpPYmplY3QuY3JlYXRlKG51bGwpLE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMse21lc3NhZ2U6e3dyaXRhYmxlOiEwLGVudW1lcmFibGU6ITB9LG5hbWU6e2VudW1lcmFibGU6ITF9LG5vZGVzOntlbnVtZXJhYmxlOiExfSxzb3VyY2U6e2VudW1lcmFibGU6ITF9LHBvc2l0aW9uczp7ZW51bWVyYWJsZTohMX0sb3JpZ2luYWxFcnJvcjp7ZW51bWVyYWJsZTohMX19KSxudWxsIT1sJiZsLnN0YWNrP09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCJzdGFjayIse3ZhbHVlOmwuc3RhY2ssd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfSk6RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2U/RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcyxoKTpPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywic3RhY2siLHt2YWx1ZTpFcnJvcigpLnN0YWNrLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH0pfWdldFtTeW1ib2wudG9TdHJpbmdUYWddKCl7cmV0dXJuIkdyYXBoUUxFcnJvciJ9dG9TdHJpbmcoKXtsZXQgZT10aGlzLm1lc3NhZ2U7aWYodGhpcy5ub2Rlcylmb3IoY29uc3QgbiBvZiB0aGlzLm5vZGVzKW4ubG9jJiYoZSs9IlxuXG4iK2QoKHQ9bi5sb2MpLnNvdXJjZSx1KHQuc291cmNlLHQuc3RhcnQpKSk7ZWxzZSBpZih0aGlzLnNvdXJjZSYmdGhpcy5sb2NhdGlvbnMpZm9yKGNvbnN0IG4gb2YgdGhpcy5sb2NhdGlvbnMpZSs9IlxuXG4iK2QodGhpcy5zb3VyY2Usbik7dmFyIHQ7cmV0dXJuIGV9dG9KU09OKCl7Y29uc3QgZT17bWVzc2FnZTp0aGlzLm1lc3NhZ2V9O3JldHVybiBudWxsIT10aGlzLmxvY2F0aW9ucyYmKGUubG9jYXRpb25zPXRoaXMubG9jYXRpb25zKSxudWxsIT10aGlzLnBhdGgmJihlLnBhdGg9dGhpcy5wYXRoKSxudWxsIT10aGlzLmV4dGVuc2lvbnMmJk9iamVjdC5rZXlzKHRoaXMuZXh0ZW5zaW9ucykubGVuZ3RoPjAmJihlLmV4dGVuc2lvbnM9dGhpcy5leHRlbnNpb25zKSxlfX1mdW5jdGlvbiBmKGUpe3JldHVybiB2b2lkIDA9PT1lfHwwPT09ZS5sZW5ndGg/dm9pZCAwOmV9ZnVuY3Rpb24geShlLHQsbil7cmV0dXJuIG5ldyBoKGBTeW50YXggRXJyb3I6ICR7bn1gLHtzb3VyY2U6ZSxwb3NpdGlvbnM6W3RdfSl9Y2xhc3MgbXtjb25zdHJ1Y3RvcihlLHQsbil7dGhpcy5zdGFydD1lLnN0YXJ0LHRoaXMuZW5kPXQuZW5kLHRoaXMuc3RhcnRUb2tlbj1lLHRoaXMuZW5kVG9rZW49dCx0aGlzLnNvdXJjZT1ufWdldFtTeW1ib2wudG9TdHJpbmdUYWddKCl7cmV0dXJuIkxvY2F0aW9uIn10b0pTT04oKXtyZXR1cm57c3RhcnQ6dGhpcy5zdGFydCxlbmQ6dGhpcy5lbmR9fX1jbGFzcyB2e2NvbnN0cnVjdG9yKGUsdCxuLHIsaSxzKXt0aGlzLmtpbmQ9ZSx0aGlzLnN0YXJ0PXQsdGhpcy5lbmQ9bix0aGlzLmxpbmU9cix0aGlzLmNvbHVtbj1pLHRoaXMudmFsdWU9cyx0aGlzLnByZXY9bnVsbCx0aGlzLm5leHQ9bnVsbH1nZXRbU3ltYm9sLnRvU3RyaW5nVGFnXSgpe3JldHVybiJUb2tlbiJ9dG9KU09OKCl7cmV0dXJue2tpbmQ6dGhpcy5raW5kLHZhbHVlOnRoaXMudmFsdWUsbGluZTp0aGlzLmxpbmUsY29sdW1uOnRoaXMuY29sdW1ufX19Y29uc3QgXz17TmFtZTpbXSxEb2N1bWVudDpbImRlZmluaXRpb25zIl0sT3BlcmF0aW9uRGVmaW5pdGlvbjpbIm5hbWUiLCJ2YXJpYWJsZURlZmluaXRpb25zIiwiZGlyZWN0aXZlcyIsInNlbGVjdGlvblNldCJdLFZhcmlhYmxlRGVmaW5pdGlvbjpbInZhcmlhYmxlIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImRpcmVjdGl2ZXMiXSxWYXJpYWJsZTpbIm5hbWUiXSxTZWxlY3Rpb25TZXQ6WyJzZWxlY3Rpb25zIl0sRmllbGQ6WyJhbGlhcyIsIm5hbWUiLCJhcmd1bWVudHMiLCJkaXJlY3RpdmVzIiwic2VsZWN0aW9uU2V0Il0sQXJndW1lbnQ6WyJuYW1lIiwidmFsdWUiXSxGcmFnbWVudFNwcmVhZDpbIm5hbWUiLCJkaXJlY3RpdmVzIl0sSW5saW5lRnJhZ21lbnQ6WyJ0eXBlQ29uZGl0aW9uIiwiZGlyZWN0aXZlcyIsInNlbGVjdGlvblNldCJdLEZyYWdtZW50RGVmaW5pdGlvbjpbIm5hbWUiLCJ2YXJpYWJsZURlZmluaXRpb25zIiwidHlwZUNvbmRpdGlvbiIsImRpcmVjdGl2ZXMiLCJzZWxlY3Rpb25TZXQiXSxJbnRWYWx1ZTpbXSxGbG9hdFZhbHVlOltdLFN0cmluZ1ZhbHVlOltdLEJvb2xlYW5WYWx1ZTpbXSxOdWxsVmFsdWU6W10sRW51bVZhbHVlOltdLExpc3RWYWx1ZTpbInZhbHVlcyJdLE9iamVjdFZhbHVlOlsiZmllbGRzIl0sT2JqZWN0RmllbGQ6WyJuYW1lIiwidmFsdWUiXSxEaXJlY3RpdmU6WyJuYW1lIiwiYXJndW1lbnRzIl0sTmFtZWRUeXBlOlsibmFtZSJdLExpc3RUeXBlOlsidHlwZSJdLE5vbk51bGxUeXBlOlsidHlwZSJdLFNjaGVtYURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsImRpcmVjdGl2ZXMiLCJvcGVyYXRpb25UeXBlcyJdLE9wZXJhdGlvblR5cGVEZWZpbml0aW9uOlsidHlwZSJdLFNjYWxhclR5cGVEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwiZGlyZWN0aXZlcyJdLE9iamVjdFR5cGVEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwiaW50ZXJmYWNlcyIsImRpcmVjdGl2ZXMiLCJmaWVsZHMiXSxGaWVsZERlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJhcmd1bWVudHMiLCJ0eXBlIiwiZGlyZWN0aXZlcyJdLElucHV0VmFsdWVEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImRpcmVjdGl2ZXMiXSxJbnRlcmZhY2VUeXBlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImludGVyZmFjZXMiLCJkaXJlY3RpdmVzIiwiZmllbGRzIl0sVW5pb25UeXBlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImRpcmVjdGl2ZXMiLCJ0eXBlcyJdLEVudW1UeXBlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImRpcmVjdGl2ZXMiLCJ2YWx1ZXMiXSxFbnVtVmFsdWVEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwiZGlyZWN0aXZlcyJdLElucHV0T2JqZWN0VHlwZURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJkaXJlY3RpdmVzIiwiZmllbGRzIl0sRGlyZWN0aXZlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImFyZ3VtZW50cyIsImxvY2F0aW9ucyJdLFNjaGVtYUV4dGVuc2lvbjpbImRpcmVjdGl2ZXMiLCJvcGVyYXRpb25UeXBlcyJdLFNjYWxhclR5cGVFeHRlbnNpb246WyJuYW1lIiwiZGlyZWN0aXZlcyJdLE9iamVjdFR5cGVFeHRlbnNpb246WyJuYW1lIiwiaW50ZXJmYWNlcyIsImRpcmVjdGl2ZXMiLCJmaWVsZHMiXSxJbnRlcmZhY2VUeXBlRXh0ZW5zaW9uOlsibmFtZSIsImludGVyZmFjZXMiLCJkaXJlY3RpdmVzIiwiZmllbGRzIl0sVW5pb25UeXBlRXh0ZW5zaW9uOlsibmFtZSIsImRpcmVjdGl2ZXMiLCJ0eXBlcyJdLEVudW1UeXBlRXh0ZW5zaW9uOlsibmFtZSIsImRpcmVjdGl2ZXMiLCJ2YWx1ZXMiXSxJbnB1dE9iamVjdFR5cGVFeHRlbnNpb246WyJuYW1lIiwiZGlyZWN0aXZlcyIsImZpZWxkcyJdfSxnPW5ldyBTZXQoT2JqZWN0LmtleXMoXykpO2Z1bmN0aW9uIEUoZSl7Y29uc3QgdD1udWxsPT1lP3ZvaWQgMDplLmtpbmQ7cmV0dXJuInN0cmluZyI9PXR5cGVvZiB0JiZnLmhhcyh0KX12YXIgVCxiLE4sSSxPLEEseCxTO2Z1bmN0aW9uIEQoZSl7cmV0dXJuIDk9PT1lfHwzMj09PWV9ZnVuY3Rpb24gdyhlKXtyZXR1cm4gZT49NDgmJmU8PTU3fWZ1bmN0aW9uIGsoZSl7cmV0dXJuIGU+PTk3JiZlPD0xMjJ8fGU+PTY1JiZlPD05MH1mdW5jdGlvbiBDKGUpe3JldHVybiBrKGUpfHw5NT09PWV9ZnVuY3Rpb24gUChlKXtyZXR1cm4gayhlKXx8dyhlKXx8OTU9PT1lfWZ1bmN0aW9uIFIoZSl7dmFyIHQ7bGV0IG49TnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIscj1udWxsLGk9LTE7Zm9yKGxldCBvPTA7bzxlLmxlbmd0aDsrK28pe3ZhciBzO2NvbnN0IHQ9ZVtvXSxhPUwodCk7YSE9PXQubGVuZ3RoJiYocj1udWxsIT09KHM9cikmJnZvaWQgMCE9PXM/czpvLGk9bywwIT09byYmYTxuJiYobj1hKSl9cmV0dXJuIGUubWFwKCgoZSx0KT0+MD09PXQ/ZTplLnNsaWNlKG4pKSkuc2xpY2UobnVsbCE9PSh0PXIpJiZ2b2lkIDAhPT10P3Q6MCxpKzEpfWZ1bmN0aW9uIEwoZSl7bGV0IHQ9MDtmb3IoO3Q8ZS5sZW5ndGgmJkQoZS5jaGFyQ29kZUF0KHQpKTspKyt0O3JldHVybiB0fShiPVR8fChUPXt9KSkuUVVFUlk9InF1ZXJ5IixiLk1VVEFUSU9OPSJtdXRhdGlvbiIsYi5TVUJTQ1JJUFRJT049InN1YnNjcmlwdGlvbiIsKEk9Tnx8KE49e30pKS5RVUVSWT0iUVVFUlkiLEkuTVVUQVRJT049Ik1VVEFUSU9OIixJLlNVQlNDUklQVElPTj0iU1VCU0NSSVBUSU9OIixJLkZJRUxEPSJGSUVMRCIsSS5GUkFHTUVOVF9ERUZJTklUSU9OPSJGUkFHTUVOVF9ERUZJTklUSU9OIixJLkZSQUdNRU5UX1NQUkVBRD0iRlJBR01FTlRfU1BSRUFEIixJLklOTElORV9GUkFHTUVOVD0iSU5MSU5FX0ZSQUdNRU5UIixJLlZBUklBQkxFX0RFRklOSVRJT049IlZBUklBQkxFX0RFRklOSVRJT04iLEkuU0NIRU1BPSJTQ0hFTUEiLEkuU0NBTEFSPSJTQ0FMQVIiLEkuT0JKRUNUPSJPQkpFQ1QiLEkuRklFTERfREVGSU5JVElPTj0iRklFTERfREVGSU5JVElPTiIsSS5BUkdVTUVOVF9ERUZJTklUSU9OPSJBUkdVTUVOVF9ERUZJTklUSU9OIixJLklOVEVSRkFDRT0iSU5URVJGQUNFIixJLlVOSU9OPSJVTklPTiIsSS5FTlVNPSJFTlVNIixJLkVOVU1fVkFMVUU9IkVOVU1fVkFMVUUiLEkuSU5QVVRfT0JKRUNUPSJJTlBVVF9PQkpFQ1QiLEkuSU5QVVRfRklFTERfREVGSU5JVElPTj0iSU5QVVRfRklFTERfREVGSU5JVElPTiIsKEE9T3x8KE89e30pKS5OQU1FPSJOYW1lIixBLkRPQ1VNRU5UPSJEb2N1bWVudCIsQS5PUEVSQVRJT05fREVGSU5JVElPTj0iT3BlcmF0aW9uRGVmaW5pdGlvbiIsQS5WQVJJQUJMRV9ERUZJTklUSU9OPSJWYXJpYWJsZURlZmluaXRpb24iLEEuU0VMRUNUSU9OX1NFVD0iU2VsZWN0aW9uU2V0IixBLkZJRUxEPSJGaWVsZCIsQS5BUkdVTUVOVD0iQXJndW1lbnQiLEEuRlJBR01FTlRfU1BSRUFEPSJGcmFnbWVudFNwcmVhZCIsQS5JTkxJTkVfRlJBR01FTlQ9IklubGluZUZyYWdtZW50IixBLkZSQUdNRU5UX0RFRklOSVRJT049IkZyYWdtZW50RGVmaW5pdGlvbiIsQS5WQVJJQUJMRT0iVmFyaWFibGUiLEEuSU5UPSJJbnRWYWx1ZSIsQS5GTE9BVD0iRmxvYXRWYWx1ZSIsQS5TVFJJTkc9IlN0cmluZ1ZhbHVlIixBLkJPT0xFQU49IkJvb2xlYW5WYWx1ZSIsQS5OVUxMPSJOdWxsVmFsdWUiLEEuRU5VTT0iRW51bVZhbHVlIixBLkxJU1Q9Ikxpc3RWYWx1ZSIsQS5PQkpFQ1Q9Ik9iamVjdFZhbHVlIixBLk9CSkVDVF9GSUVMRD0iT2JqZWN0RmllbGQiLEEuRElSRUNUSVZFPSJEaXJlY3RpdmUiLEEuTkFNRURfVFlQRT0iTmFtZWRUeXBlIixBLkxJU1RfVFlQRT0iTGlzdFR5cGUiLEEuTk9OX05VTExfVFlQRT0iTm9uTnVsbFR5cGUiLEEuU0NIRU1BX0RFRklOSVRJT049IlNjaGVtYURlZmluaXRpb24iLEEuT1BFUkFUSU9OX1RZUEVfREVGSU5JVElPTj0iT3BlcmF0aW9uVHlwZURlZmluaXRpb24iLEEuU0NBTEFSX1RZUEVfREVGSU5JVElPTj0iU2NhbGFyVHlwZURlZmluaXRpb24iLEEuT0JKRUNUX1RZUEVfREVGSU5JVElPTj0iT2JqZWN0VHlwZURlZmluaXRpb24iLEEuRklFTERfREVGSU5JVElPTj0iRmllbGREZWZpbml0aW9uIixBLklOUFVUX1ZBTFVFX0RFRklOSVRJT049IklucHV0VmFsdWVEZWZpbml0aW9uIixBLklOVEVSRkFDRV9UWVBFX0RFRklOSVRJT049IkludGVyZmFjZVR5cGVEZWZpbml0aW9uIixBLlVOSU9OX1RZUEVfREVGSU5JVElPTj0iVW5pb25UeXBlRGVmaW5pdGlvbiIsQS5FTlVNX1RZUEVfREVGSU5JVElPTj0iRW51bVR5cGVEZWZpbml0aW9uIixBLkVOVU1fVkFMVUVfREVGSU5JVElPTj0iRW51bVZhbHVlRGVmaW5pdGlvbiIsQS5JTlBVVF9PQkpFQ1RfVFlQRV9ERUZJTklUSU9OPSJJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uIixBLkRJUkVDVElWRV9ERUZJTklUSU9OPSJEaXJlY3RpdmVEZWZpbml0aW9uIixBLlNDSEVNQV9FWFRFTlNJT049IlNjaGVtYUV4dGVuc2lvbiIsQS5TQ0FMQVJfVFlQRV9FWFRFTlNJT049IlNjYWxhclR5cGVFeHRlbnNpb24iLEEuT0JKRUNUX1RZUEVfRVhURU5TSU9OPSJPYmplY3RUeXBlRXh0ZW5zaW9uIixBLklOVEVSRkFDRV9UWVBFX0VYVEVOU0lPTj0iSW50ZXJmYWNlVHlwZUV4dGVuc2lvbiIsQS5VTklPTl9UWVBFX0VYVEVOU0lPTj0iVW5pb25UeXBlRXh0ZW5zaW9uIixBLkVOVU1fVFlQRV9FWFRFTlNJT049IkVudW1UeXBlRXh0ZW5zaW9uIixBLklOUFVUX09CSkVDVF9UWVBFX0VYVEVOU0lPTj0iSW5wdXRPYmplY3RUeXBlRXh0ZW5zaW9uIiwoUz14fHwoeD17fSkpLlNPRj0iPFNPRj4iLFMuRU9GPSI8RU9GPiIsUy5CQU5HPSIhIixTLkRPTExBUj0iJCIsUy5BTVA9IiYiLFMuUEFSRU5fTD0iKCIsUy5QQVJFTl9SPSIpIixTLlNQUkVBRD0iLi4uIixTLkNPTE9OPSI6IixTLkVRVUFMUz0iPSIsUy5BVD0iQCIsUy5CUkFDS0VUX0w9IlsiLFMuQlJBQ0tFVF9SPSJdIixTLkJSQUNFX0w9InsiLFMuUElQRT0ifCIsUy5CUkFDRV9SPSJ9IixTLk5BTUU9Ik5hbWUiLFMuSU5UPSJJbnQiLFMuRkxPQVQ9IkZsb2F0IixTLlNUUklORz0iU3RyaW5nIixTLkJMT0NLX1NUUklORz0iQmxvY2tTdHJpbmciLFMuQ09NTUVOVD0iQ29tbWVudCI7Y2xhc3MgRntjb25zdHJ1Y3RvcihlKXtjb25zdCB0PW5ldyB2KHguU09GLDAsMCwwLDApO3RoaXMuc291cmNlPWUsdGhpcy5sYXN0VG9rZW49dCx0aGlzLnRva2VuPXQsdGhpcy5saW5lPTEsdGhpcy5saW5lU3RhcnQ9MH1nZXRbU3ltYm9sLnRvU3RyaW5nVGFnXSgpe3JldHVybiJMZXhlciJ9YWR2YW5jZSgpe3RoaXMubGFzdFRva2VuPXRoaXMudG9rZW47cmV0dXJuIHRoaXMudG9rZW49dGhpcy5sb29rYWhlYWQoKX1sb29rYWhlYWQoKXtsZXQgZT10aGlzLnRva2VuO2lmKGUua2luZCE9PXguRU9GKWRve2lmKGUubmV4dCllPWUubmV4dDtlbHNle2NvbnN0IHQ9cSh0aGlzLGUuZW5kKTtlLm5leHQ9dCx0LnByZXY9ZSxlPXR9fXdoaWxlKGUua2luZD09PXguQ09NTUVOVCk7cmV0dXJuIGV9fWZ1bmN0aW9uICQoZSl7cmV0dXJuIGU+PTAmJmU8PTU1Mjk1fHxlPj01NzM0NCYmZTw9MTExNDExMX1mdW5jdGlvbiBNKGUsdCl7cmV0dXJuIFYoZS5jaGFyQ29kZUF0KHQpKSYmQihlLmNoYXJDb2RlQXQodCsxKSl9ZnVuY3Rpb24gVihlKXtyZXR1cm4gZT49NTUyOTYmJmU8PTU2MzE5fWZ1bmN0aW9uIEIoZSl7cmV0dXJuIGU+PTU2MzIwJiZlPD01NzM0M31mdW5jdGlvbiBqKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LmNvZGVQb2ludEF0KHQpO2lmKHZvaWQgMD09PW4pcmV0dXJuIHguRU9GO2lmKG4+PTMyJiZuPD0xMjYpe2NvbnN0IGU9U3RyaW5nLmZyb21Db2RlUG9pbnQobik7cmV0dXJuJyInPT09ZT8iJ1wiJyI6YCIke2V9ImB9cmV0dXJuIlUrIituLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLnBhZFN0YXJ0KDQsIjAiKX1mdW5jdGlvbiBVKGUsdCxuLHIsaSl7Y29uc3Qgcz1lLmxpbmUsbz0xK24tZS5saW5lU3RhcnQ7cmV0dXJuIG5ldyB2KHQsbixyLHMsbyxpKX1mdW5jdGlvbiBxKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LHI9bi5sZW5ndGg7bGV0IGk9dDtmb3IoO2k8cjspe2NvbnN0IHQ9bi5jaGFyQ29kZUF0KGkpO3N3aXRjaCh0KXtjYXNlIDY1Mjc5OmNhc2UgOTpjYXNlIDMyOmNhc2UgNDQ6KytpO2NvbnRpbnVlO2Nhc2UgMTA6KytpLCsrZS5saW5lLGUubGluZVN0YXJ0PWk7Y29udGludWU7Y2FzZSAxMzoxMD09PW4uY2hhckNvZGVBdChpKzEpP2krPTI6KytpLCsrZS5saW5lLGUubGluZVN0YXJ0PWk7Y29udGludWU7Y2FzZSAzNTpyZXR1cm4gSyhlLGkpO2Nhc2UgMzM6cmV0dXJuIFUoZSx4LkJBTkcsaSxpKzEpO2Nhc2UgMzY6cmV0dXJuIFUoZSx4LkRPTExBUixpLGkrMSk7Y2FzZSAzODpyZXR1cm4gVShlLHguQU1QLGksaSsxKTtjYXNlIDQwOnJldHVybiBVKGUseC5QQVJFTl9MLGksaSsxKTtjYXNlIDQxOnJldHVybiBVKGUseC5QQVJFTl9SLGksaSsxKTtjYXNlIDQ2OmlmKDQ2PT09bi5jaGFyQ29kZUF0KGkrMSkmJjQ2PT09bi5jaGFyQ29kZUF0KGkrMikpcmV0dXJuIFUoZSx4LlNQUkVBRCxpLGkrMyk7YnJlYWs7Y2FzZSA1ODpyZXR1cm4gVShlLHguQ09MT04saSxpKzEpO2Nhc2UgNjE6cmV0dXJuIFUoZSx4LkVRVUFMUyxpLGkrMSk7Y2FzZSA2NDpyZXR1cm4gVShlLHguQVQsaSxpKzEpO2Nhc2UgOTE6cmV0dXJuIFUoZSx4LkJSQUNLRVRfTCxpLGkrMSk7Y2FzZSA5MzpyZXR1cm4gVShlLHguQlJBQ0tFVF9SLGksaSsxKTtjYXNlIDEyMzpyZXR1cm4gVShlLHguQlJBQ0VfTCxpLGkrMSk7Y2FzZSAxMjQ6cmV0dXJuIFUoZSx4LlBJUEUsaSxpKzEpO2Nhc2UgMTI1OnJldHVybiBVKGUseC5CUkFDRV9SLGksaSsxKTtjYXNlIDM0OnJldHVybiAzND09PW4uY2hhckNvZGVBdChpKzEpJiYzND09PW4uY2hhckNvZGVBdChpKzIpP1ooZSxpKTpZKGUsaSl9aWYodyh0KXx8NDU9PT10KXJldHVybiBHKGUsaSx0KTtpZihDKHQpKXJldHVybiBlZShlLGkpO3Rocm93IHkoZS5zb3VyY2UsaSwzOT09PXQ/IlVuZXhwZWN0ZWQgc2luZ2xlIHF1b3RlIGNoYXJhY3RlciAoJyksIGRpZCB5b3UgbWVhbiB0byB1c2UgYSBkb3VibGUgcXVvdGUgKFwiKT8iOiQodCl8fE0obixpKT9gVW5leHBlY3RlZCBjaGFyYWN0ZXI6ICR7aihlLGkpfS5gOmBJbnZhbGlkIGNoYXJhY3RlcjogJHtqKGUsaSl9LmApfXJldHVybiBVKGUseC5FT0YscixyKX1mdW5jdGlvbiBLKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LHI9bi5sZW5ndGg7bGV0IGk9dCsxO2Zvcig7aTxyOyl7Y29uc3QgZT1uLmNoYXJDb2RlQXQoaSk7aWYoMTA9PT1lfHwxMz09PWUpYnJlYWs7aWYoJChlKSkrK2k7ZWxzZXtpZighTShuLGkpKWJyZWFrO2krPTJ9fXJldHVybiBVKGUseC5DT01NRU5ULHQsaSxuLnNsaWNlKHQrMSxpKSl9ZnVuY3Rpb24gRyhlLHQsbil7Y29uc3Qgcj1lLnNvdXJjZS5ib2R5O2xldCBpPXQscz1uLG89ITE7aWYoNDU9PT1zJiYocz1yLmNoYXJDb2RlQXQoKytpKSksNDg9PT1zKXtpZihzPXIuY2hhckNvZGVBdCgrK2kpLHcocykpdGhyb3cgeShlLnNvdXJjZSxpLGBJbnZhbGlkIG51bWJlciwgdW5leHBlY3RlZCBkaWdpdCBhZnRlciAwOiAke2ooZSxpKX0uYCl9ZWxzZSBpPXooZSxpLHMpLHM9ci5jaGFyQ29kZUF0KGkpO2lmKDQ2PT09cyYmKG89ITAscz1yLmNoYXJDb2RlQXQoKytpKSxpPXooZSxpLHMpLHM9ci5jaGFyQ29kZUF0KGkpKSw2OSE9PXMmJjEwMSE9PXN8fChvPSEwLHM9ci5jaGFyQ29kZUF0KCsraSksNDMhPT1zJiY0NSE9PXN8fChzPXIuY2hhckNvZGVBdCgrK2kpKSxpPXooZSxpLHMpLHM9ci5jaGFyQ29kZUF0KGkpKSw0Nj09PXN8fEMocykpdGhyb3cgeShlLnNvdXJjZSxpLGBJbnZhbGlkIG51bWJlciwgZXhwZWN0ZWQgZGlnaXQgYnV0IGdvdDogJHtqKGUsaSl9LmApO3JldHVybiBVKGUsbz94LkZMT0FUOnguSU5ULHQsaSxyLnNsaWNlKHQsaSkpfWZ1bmN0aW9uIHooZSx0LG4pe2lmKCF3KG4pKXRocm93IHkoZS5zb3VyY2UsdCxgSW52YWxpZCBudW1iZXIsIGV4cGVjdGVkIGRpZ2l0IGJ1dCBnb3Q6ICR7aihlLHQpfS5gKTtjb25zdCByPWUuc291cmNlLmJvZHk7bGV0IGk9dCsxO2Zvcig7dyhyLmNoYXJDb2RlQXQoaSkpOykrK2k7cmV0dXJuIGl9ZnVuY3Rpb24gWShlLHQpe2NvbnN0IG49ZS5zb3VyY2UuYm9keSxyPW4ubGVuZ3RoO2xldCBpPXQrMSxzPWksbz0iIjtmb3IoO2k8cjspe2NvbnN0IHI9bi5jaGFyQ29kZUF0KGkpO2lmKDM0PT09cilyZXR1cm4gbys9bi5zbGljZShzLGkpLFUoZSx4LlNUUklORyx0LGkrMSxvKTtpZig5MiE9PXIpe2lmKDEwPT09cnx8MTM9PT1yKWJyZWFrO2lmKCQocikpKytpO2Vsc2V7aWYoIU0obixpKSl0aHJvdyB5KGUuc291cmNlLGksYEludmFsaWQgY2hhcmFjdGVyIHdpdGhpbiBTdHJpbmc6ICR7aihlLGkpfS5gKTtpKz0yfX1lbHNle28rPW4uc2xpY2UocyxpKTtjb25zdCB0PTExNz09PW4uY2hhckNvZGVBdChpKzEpPzEyMz09PW4uY2hhckNvZGVBdChpKzIpP0goZSxpKTpKKGUsaSk6VyhlLGkpO28rPXQudmFsdWUsaSs9dC5zaXplLHM9aX19dGhyb3cgeShlLnNvdXJjZSxpLCJVbnRlcm1pbmF0ZWQgc3RyaW5nLiIpfWZ1bmN0aW9uIEgoZSx0KXtjb25zdCBuPWUuc291cmNlLmJvZHk7bGV0IHI9MCxpPTM7Zm9yKDtpPDEyOyl7Y29uc3QgZT1uLmNoYXJDb2RlQXQodCtpKyspO2lmKDEyNT09PWUpe2lmKGk8NXx8ISQocikpYnJlYWs7cmV0dXJue3ZhbHVlOlN0cmluZy5mcm9tQ29kZVBvaW50KHIpLHNpemU6aX19aWYocj1yPDw0fFgoZSkscjwwKWJyZWFrfXRocm93IHkoZS5zb3VyY2UsdCxgSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZTogIiR7bi5zbGljZSh0LHQraSl9Ii5gKX1mdW5jdGlvbiBKKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LHI9UShuLHQrMik7aWYoJChyKSlyZXR1cm57dmFsdWU6U3RyaW5nLmZyb21Db2RlUG9pbnQociksc2l6ZTo2fTtpZihWKHIpJiY5Mj09PW4uY2hhckNvZGVBdCh0KzYpJiYxMTc9PT1uLmNoYXJDb2RlQXQodCs3KSl7Y29uc3QgZT1RKG4sdCs4KTtpZihCKGUpKXJldHVybnt2YWx1ZTpTdHJpbmcuZnJvbUNvZGVQb2ludChyLGUpLHNpemU6MTJ9fXRocm93IHkoZS5zb3VyY2UsdCxgSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZTogIiR7bi5zbGljZSh0LHQrNil9Ii5gKX1mdW5jdGlvbiBRKGUsdCl7cmV0dXJuIFgoZS5jaGFyQ29kZUF0KHQpKTw8MTJ8WChlLmNoYXJDb2RlQXQodCsxKSk8PDh8WChlLmNoYXJDb2RlQXQodCsyKSk8PDR8WChlLmNoYXJDb2RlQXQodCszKSl9ZnVuY3Rpb24gWChlKXtyZXR1cm4gZT49NDgmJmU8PTU3P2UtNDg6ZT49NjUmJmU8PTcwP2UtNTU6ZT49OTcmJmU8PTEwMj9lLTg3Oi0xfWZ1bmN0aW9uIFcoZSx0KXtjb25zdCBuPWUuc291cmNlLmJvZHk7c3dpdGNoKG4uY2hhckNvZGVBdCh0KzEpKXtjYXNlIDM0OnJldHVybnt2YWx1ZTonIicsc2l6ZToyfTtjYXNlIDkyOnJldHVybnt2YWx1ZToiXFwiLHNpemU6Mn07Y2FzZSA0NzpyZXR1cm57dmFsdWU6Ii8iLHNpemU6Mn07Y2FzZSA5ODpyZXR1cm57dmFsdWU6IlxiIixzaXplOjJ9O2Nhc2UgMTAyOnJldHVybnt2YWx1ZToiXGYiLHNpemU6Mn07Y2FzZSAxMTA6cmV0dXJue3ZhbHVlOiJcbiIsc2l6ZToyfTtjYXNlIDExNDpyZXR1cm57dmFsdWU6IlxyIixzaXplOjJ9O2Nhc2UgMTE2OnJldHVybnt2YWx1ZToiXHQiLHNpemU6Mn19dGhyb3cgeShlLnNvdXJjZSx0LGBJbnZhbGlkIGNoYXJhY3RlciBlc2NhcGUgc2VxdWVuY2U6ICIke24uc2xpY2UodCx0KzIpfSIuYCl9ZnVuY3Rpb24gWihlLHQpe2NvbnN0IG49ZS5zb3VyY2UuYm9keSxyPW4ubGVuZ3RoO2xldCBpPWUubGluZVN0YXJ0LHM9dCszLG89cyxhPSIiO2NvbnN0IGM9W107Zm9yKDtzPHI7KXtjb25zdCByPW4uY2hhckNvZGVBdChzKTtpZigzND09PXImJjM0PT09bi5jaGFyQ29kZUF0KHMrMSkmJjM0PT09bi5jaGFyQ29kZUF0KHMrMikpe2ErPW4uc2xpY2UobyxzKSxjLnB1c2goYSk7Y29uc3Qgcj1VKGUseC5CTE9DS19TVFJJTkcsdCxzKzMsUihjKS5qb2luKCJcbiIpKTtyZXR1cm4gZS5saW5lKz1jLmxlbmd0aC0xLGUubGluZVN0YXJ0PWkscn1pZig5MiE9PXJ8fDM0IT09bi5jaGFyQ29kZUF0KHMrMSl8fDM0IT09bi5jaGFyQ29kZUF0KHMrMil8fDM0IT09bi5jaGFyQ29kZUF0KHMrMykpaWYoMTAhPT1yJiYxMyE9PXIpaWYoJChyKSkrK3M7ZWxzZXtpZighTShuLHMpKXRocm93IHkoZS5zb3VyY2UscyxgSW52YWxpZCBjaGFyYWN0ZXIgd2l0aGluIFN0cmluZzogJHtqKGUscyl9LmApO3MrPTJ9ZWxzZSBhKz1uLnNsaWNlKG8scyksYy5wdXNoKGEpLDEzPT09ciYmMTA9PT1uLmNoYXJDb2RlQXQocysxKT9zKz0yOisrcyxhPSIiLG89cyxpPXM7ZWxzZSBhKz1uLnNsaWNlKG8scyksbz1zKzEscys9NH10aHJvdyB5KGUuc291cmNlLHMsIlVudGVybWluYXRlZCBzdHJpbmcuIil9ZnVuY3Rpb24gZWUoZSx0KXtjb25zdCBuPWUuc291cmNlLmJvZHkscj1uLmxlbmd0aDtsZXQgaT10KzE7Zm9yKDtpPHI7KXtpZighUChuLmNoYXJDb2RlQXQoaSkpKWJyZWFrOysraX1yZXR1cm4gVShlLHguTkFNRSx0LGksbi5zbGljZSh0LGkpKX1jb25zdCB0ZT0xMCxuZT0yO2Z1bmN0aW9uIHJlKGUpe3JldHVybiBpZShlLFtdKX1mdW5jdGlvbiBpZShlLHQpe3N3aXRjaCh0eXBlb2YgZSl7Y2FzZSJzdHJpbmciOnJldHVybiBKU09OLnN0cmluZ2lmeShlKTtjYXNlImZ1bmN0aW9uIjpyZXR1cm4gZS5uYW1lP2BbZnVuY3Rpb24gJHtlLm5hbWV9XWA6IltmdW5jdGlvbl0iO2Nhc2Uib2JqZWN0IjpyZXR1cm4gZnVuY3Rpb24oZSx0KXtpZihudWxsPT09ZSlyZXR1cm4ibnVsbCI7aWYodC5pbmNsdWRlcyhlKSlyZXR1cm4iW0NpcmN1bGFyXSI7Y29uc3Qgbj1bLi4udCxlXTtpZihmdW5jdGlvbihlKXtyZXR1cm4iZnVuY3Rpb24iPT10eXBlb2YgZS50b0pTT059KGUpKXtjb25zdCB0PWUudG9KU09OKCk7aWYodCE9PWUpcmV0dXJuInN0cmluZyI9PXR5cGVvZiB0P3Q6aWUodCxuKX1lbHNlIGlmKEFycmF5LmlzQXJyYXkoZSkpcmV0dXJuIGZ1bmN0aW9uKGUsdCl7aWYoMD09PWUubGVuZ3RoKXJldHVybiJbXSI7aWYodC5sZW5ndGg+bmUpcmV0dXJuIltBcnJheV0iO2NvbnN0IG49TWF0aC5taW4odGUsZS5sZW5ndGgpLHI9ZS5sZW5ndGgtbixpPVtdO2ZvcihsZXQgcz0wO3M8bjsrK3MpaS5wdXNoKGllKGVbc10sdCkpOzE9PT1yP2kucHVzaCgiLi4uIDEgbW9yZSBpdGVtIik6cj4xJiZpLnB1c2goYC4uLiAke3J9IG1vcmUgaXRlbXNgKTtyZXR1cm4iWyIraS5qb2luKCIsICIpKyJdIn0oZSxuKTtyZXR1cm4gZnVuY3Rpb24oZSx0KXtjb25zdCBuPU9iamVjdC5lbnRyaWVzKGUpO2lmKDA9PT1uLmxlbmd0aClyZXR1cm4ie30iO2lmKHQubGVuZ3RoPm5lKXJldHVybiJbIitmdW5jdGlvbihlKXtjb25zdCB0PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlKS5yZXBsYWNlKC9eXFtvYmplY3QgLywiIikucmVwbGFjZSgvXSQvLCIiKTtpZigiT2JqZWN0Ij09PXQmJiJmdW5jdGlvbiI9PXR5cGVvZiBlLmNvbnN0cnVjdG9yKXtjb25zdCB0PWUuY29uc3RydWN0b3IubmFtZTtpZigic3RyaW5nIj09dHlwZW9mIHQmJiIiIT09dClyZXR1cm4gdH1yZXR1cm4gdH0oZSkrIl0iO2NvbnN0IHI9bi5tYXAoKChbZSxuXSk9PmUrIjogIitpZShuLHQpKSk7cmV0dXJuInsgIityLmpvaW4oIiwgIikrIiB9In0oZSxuKX0oZSx0KTtkZWZhdWx0OnJldHVybiBTdHJpbmcoZSl9fWNvbnN0IHNlPWdsb2JhbFRoaXMucHJvY2VzcyYmInByb2R1Y3Rpb24iPT09Z2xvYmFsVGhpcy5wcm9jZXNzLmVudi5OT0RFX0VOVj9mdW5jdGlvbihlLHQpe3JldHVybiBlIGluc3RhbmNlb2YgdH06ZnVuY3Rpb24oZSx0KXtpZihlIGluc3RhbmNlb2YgdClyZXR1cm4hMDtpZigib2JqZWN0Ij09dHlwZW9mIGUmJm51bGwhPT1lKXt2YXIgbjtjb25zdCByPXQucHJvdG90eXBlW1N5bWJvbC50b1N0cmluZ1RhZ107aWYocj09PShTeW1ib2wudG9TdHJpbmdUYWcgaW4gZT9lW1N5bWJvbC50b1N0cmluZ1RhZ106bnVsbD09PShuPWUuY29uc3RydWN0b3IpfHx2b2lkIDA9PT1uP3ZvaWQgMDpuLm5hbWUpKXtjb25zdCB0PXJlKGUpO3Rocm93IG5ldyBFcnJvcihgQ2Fubm90IHVzZSAke3J9ICIke3R9IiBmcm9tIGFub3RoZXIgbW9kdWxlIG9yIHJlYWxtLlxuXG5FbnN1cmUgdGhhdCB0aGVyZSBpcyBvbmx5IG9uZSBpbnN0YW5jZSBvZiAiZ3JhcGhxbCIgaW4gdGhlIG5vZGVfbW9kdWxlc1xuZGlyZWN0b3J5LiBJZiBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgImdyYXBocWwiIGFyZSB0aGUgZGVwZW5kZW5jaWVzIG9mIG90aGVyXG5yZWxpZWQgb24gbW9kdWxlcywgdXNlICJyZXNvbHV0aW9ucyIgdG8gZW5zdXJlIG9ubHkgb25lIHZlcnNpb24gaXMgaW5zdGFsbGVkLlxuXG5odHRwczovL3lhcm5wa2cuY29tL2VuL2RvY3Mvc2VsZWN0aXZlLXZlcnNpb24tcmVzb2x1dGlvbnNcblxuRHVwbGljYXRlICJncmFwaHFsIiBtb2R1bGVzIGNhbm5vdCBiZSB1c2VkIGF0IHRoZSBzYW1lIHRpbWUgc2luY2UgZGlmZmVyZW50XG52ZXJzaW9ucyBtYXkgaGF2ZSBkaWZmZXJlbnQgY2FwYWJpbGl0aWVzIGFuZCBiZWhhdmlvci4gVGhlIGRhdGEgZnJvbSBvbmVcbnZlcnNpb24gdXNlZCBpbiB0aGUgZnVuY3Rpb24gZnJvbSBhbm90aGVyIGNvdWxkIHByb2R1Y2UgY29uZnVzaW5nIGFuZFxuc3B1cmlvdXMgcmVzdWx0cy5gKX19cmV0dXJuITF9O2NsYXNzIG9le2NvbnN0cnVjdG9yKGUsdD0iR3JhcGhRTCByZXF1ZXN0IixuPXtsaW5lOjEsY29sdW1uOjF9KXsic3RyaW5nIj09dHlwZW9mIGV8fGEoITEsYEJvZHkgbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQ6ICR7cmUoZSl9LmApLHRoaXMuYm9keT1lLHRoaXMubmFtZT10LHRoaXMubG9jYXRpb25PZmZzZXQ9bix0aGlzLmxvY2F0aW9uT2Zmc2V0LmxpbmU+MHx8YSghMSwibGluZSBpbiBsb2NhdGlvbk9mZnNldCBpcyAxLWluZGV4ZWQgYW5kIG11c3QgYmUgcG9zaXRpdmUuIiksdGhpcy5sb2NhdGlvbk9mZnNldC5jb2x1bW4+MHx8YSghMSwiY29sdW1uIGluIGxvY2F0aW9uT2Zmc2V0IGlzIDEtaW5kZXhlZCBhbmQgbXVzdCBiZSBwb3NpdGl2ZS4iKX1nZXRbU3ltYm9sLnRvU3RyaW5nVGFnXSgpe3JldHVybiJTb3VyY2UifX1mdW5jdGlvbiBhZShlLHQpe3JldHVybiBuZXcgY2UoZSx0KS5wYXJzZURvY3VtZW50KCl9Y2xhc3MgY2V7Y29uc3RydWN0b3IoZSx0PXt9KXtjb25zdCBuPWZ1bmN0aW9uKGUpe3JldHVybiBzZShlLG9lKX0oZSk/ZTpuZXcgb2UoZSk7dGhpcy5fbGV4ZXI9bmV3IEYobiksdGhpcy5fb3B0aW9ucz10LHRoaXMuX3Rva2VuQ291bnRlcj0wfXBhcnNlTmFtZSgpe2NvbnN0IGU9dGhpcy5leHBlY3RUb2tlbih4Lk5BTUUpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLk5BTUUsdmFsdWU6ZS52YWx1ZX0pfXBhcnNlRG9jdW1lbnQoKXtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOk8uRE9DVU1FTlQsZGVmaW5pdGlvbnM6dGhpcy5tYW55KHguU09GLHRoaXMucGFyc2VEZWZpbml0aW9uLHguRU9GKX0pfXBhcnNlRGVmaW5pdGlvbigpe2lmKHRoaXMucGVlayh4LkJSQUNFX0wpKXJldHVybiB0aGlzLnBhcnNlT3BlcmF0aW9uRGVmaW5pdGlvbigpO2NvbnN0IGU9dGhpcy5wZWVrRGVzY3JpcHRpb24oKSx0PWU/dGhpcy5fbGV4ZXIubG9va2FoZWFkKCk6dGhpcy5fbGV4ZXIudG9rZW47aWYodC5raW5kPT09eC5OQU1FKXtzd2l0Y2godC52YWx1ZSl7Y2FzZSJzY2hlbWEiOnJldHVybiB0aGlzLnBhcnNlU2NoZW1hRGVmaW5pdGlvbigpO2Nhc2Uic2NhbGFyIjpyZXR1cm4gdGhpcy5wYXJzZVNjYWxhclR5cGVEZWZpbml0aW9uKCk7Y2FzZSJ0eXBlIjpyZXR1cm4gdGhpcy5wYXJzZU9iamVjdFR5cGVEZWZpbml0aW9uKCk7Y2FzZSJpbnRlcmZhY2UiOnJldHVybiB0aGlzLnBhcnNlSW50ZXJmYWNlVHlwZURlZmluaXRpb24oKTtjYXNlInVuaW9uIjpyZXR1cm4gdGhpcy5wYXJzZVVuaW9uVHlwZURlZmluaXRpb24oKTtjYXNlImVudW0iOnJldHVybiB0aGlzLnBhcnNlRW51bVR5cGVEZWZpbml0aW9uKCk7Y2FzZSJpbnB1dCI6cmV0dXJuIHRoaXMucGFyc2VJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uKCk7Y2FzZSJkaXJlY3RpdmUiOnJldHVybiB0aGlzLnBhcnNlRGlyZWN0aXZlRGVmaW5pdGlvbigpfWlmKGUpdGhyb3cgeSh0aGlzLl9sZXhlci5zb3VyY2UsdGhpcy5fbGV4ZXIudG9rZW4uc3RhcnQsIlVuZXhwZWN0ZWQgZGVzY3JpcHRpb24sIGRlc2NyaXB0aW9ucyBhcmUgc3VwcG9ydGVkIG9ubHkgb24gdHlwZSBkZWZpbml0aW9ucy4iKTtzd2l0Y2godC52YWx1ZSl7Y2FzZSJxdWVyeSI6Y2FzZSJtdXRhdGlvbiI6Y2FzZSJzdWJzY3JpcHRpb24iOnJldHVybiB0aGlzLnBhcnNlT3BlcmF0aW9uRGVmaW5pdGlvbigpO2Nhc2UiZnJhZ21lbnQiOnJldHVybiB0aGlzLnBhcnNlRnJhZ21lbnREZWZpbml0aW9uKCk7Y2FzZSJleHRlbmQiOnJldHVybiB0aGlzLnBhcnNlVHlwZVN5c3RlbUV4dGVuc2lvbigpfX10aHJvdyB0aGlzLnVuZXhwZWN0ZWQodCl9cGFyc2VPcGVyYXRpb25EZWZpbml0aW9uKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbjtpZih0aGlzLnBlZWsoeC5CUkFDRV9MKSlyZXR1cm4gdGhpcy5ub2RlKGUse2tpbmQ6Ty5PUEVSQVRJT05fREVGSU5JVElPTixvcGVyYXRpb246VC5RVUVSWSxuYW1lOnZvaWQgMCx2YXJpYWJsZURlZmluaXRpb25zOltdLGRpcmVjdGl2ZXM6W10sc2VsZWN0aW9uU2V0OnRoaXMucGFyc2VTZWxlY3Rpb25TZXQoKX0pO2NvbnN0IHQ9dGhpcy5wYXJzZU9wZXJhdGlvblR5cGUoKTtsZXQgbjtyZXR1cm4gdGhpcy5wZWVrKHguTkFNRSkmJihuPXRoaXMucGFyc2VOYW1lKCkpLHRoaXMubm9kZShlLHtraW5kOk8uT1BFUkFUSU9OX0RFRklOSVRJT04sb3BlcmF0aW9uOnQsbmFtZTpuLHZhcmlhYmxlRGVmaW5pdGlvbnM6dGhpcy5wYXJzZVZhcmlhYmxlRGVmaW5pdGlvbnMoKSxkaXJlY3RpdmVzOnRoaXMucGFyc2VEaXJlY3RpdmVzKCExKSxzZWxlY3Rpb25TZXQ6dGhpcy5wYXJzZVNlbGVjdGlvblNldCgpfSl9cGFyc2VPcGVyYXRpb25UeXBlKCl7Y29uc3QgZT10aGlzLmV4cGVjdFRva2VuKHguTkFNRSk7c3dpdGNoKGUudmFsdWUpe2Nhc2UicXVlcnkiOnJldHVybiBULlFVRVJZO2Nhc2UibXV0YXRpb24iOnJldHVybiBULk1VVEFUSU9OO2Nhc2Uic3Vic2NyaXB0aW9uIjpyZXR1cm4gVC5TVUJTQ1JJUFRJT059dGhyb3cgdGhpcy51bmV4cGVjdGVkKGUpfXBhcnNlVmFyaWFibGVEZWZpbml0aW9ucygpe3JldHVybiB0aGlzLm9wdGlvbmFsTWFueSh4LlBBUkVOX0wsdGhpcy5wYXJzZVZhcmlhYmxlRGVmaW5pdGlvbix4LlBBUkVOX1IpfXBhcnNlVmFyaWFibGVEZWZpbml0aW9uKCl7cmV0dXJuIHRoaXMubm9kZSh0aGlzLl9sZXhlci50b2tlbix7a2luZDpPLlZBUklBQkxFX0RFRklOSVRJT04sdmFyaWFibGU6dGhpcy5wYXJzZVZhcmlhYmxlKCksdHlwZToodGhpcy5leHBlY3RUb2tlbih4LkNPTE9OKSx0aGlzLnBhcnNlVHlwZVJlZmVyZW5jZSgpKSxkZWZhdWx0VmFsdWU6dGhpcy5leHBlY3RPcHRpb25hbFRva2VuKHguRVFVQUxTKT90aGlzLnBhcnNlQ29uc3RWYWx1ZUxpdGVyYWwoKTp2b2lkIDAsZGlyZWN0aXZlczp0aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCl9KX1wYXJzZVZhcmlhYmxlKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbjtyZXR1cm4gdGhpcy5leHBlY3RUb2tlbih4LkRPTExBUiksdGhpcy5ub2RlKGUse2tpbmQ6Ty5WQVJJQUJMRSxuYW1lOnRoaXMucGFyc2VOYW1lKCl9KX1wYXJzZVNlbGVjdGlvblNldCgpe3JldHVybiB0aGlzLm5vZGUodGhpcy5fbGV4ZXIudG9rZW4se2tpbmQ6Ty5TRUxFQ1RJT05fU0VULHNlbGVjdGlvbnM6dGhpcy5tYW55KHguQlJBQ0VfTCx0aGlzLnBhcnNlU2VsZWN0aW9uLHguQlJBQ0VfUil9KX1wYXJzZVNlbGVjdGlvbigpe3JldHVybiB0aGlzLnBlZWsoeC5TUFJFQUQpP3RoaXMucGFyc2VGcmFnbWVudCgpOnRoaXMucGFyc2VGaWVsZCgpfXBhcnNlRmllbGQoKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZU5hbWUoKTtsZXQgbixyO3JldHVybiB0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oeC5DT0xPTik/KG49dCxyPXRoaXMucGFyc2VOYW1lKCkpOnI9dCx0aGlzLm5vZGUoZSx7a2luZDpPLkZJRUxELGFsaWFzOm4sbmFtZTpyLGFyZ3VtZW50czp0aGlzLnBhcnNlQXJndW1lbnRzKCExKSxkaXJlY3RpdmVzOnRoaXMucGFyc2VEaXJlY3RpdmVzKCExKSxzZWxlY3Rpb25TZXQ6dGhpcy5wZWVrKHguQlJBQ0VfTCk/dGhpcy5wYXJzZVNlbGVjdGlvblNldCgpOnZvaWQgMH0pfXBhcnNlQXJndW1lbnRzKGUpe2NvbnN0IHQ9ZT90aGlzLnBhcnNlQ29uc3RBcmd1bWVudDp0aGlzLnBhcnNlQXJndW1lbnQ7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KHguUEFSRU5fTCx0LHguUEFSRU5fUil9cGFyc2VBcmd1bWVudChlPSExKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZU5hbWUoKTtyZXR1cm4gdGhpcy5leHBlY3RUb2tlbih4LkNPTE9OKSx0aGlzLm5vZGUodCx7a2luZDpPLkFSR1VNRU5ULG5hbWU6bix2YWx1ZTp0aGlzLnBhcnNlVmFsdWVMaXRlcmFsKGUpfSl9cGFyc2VDb25zdEFyZ3VtZW50KCl7cmV0dXJuIHRoaXMucGFyc2VBcmd1bWVudCghMCl9cGFyc2VGcmFnbWVudCgpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW47dGhpcy5leHBlY3RUb2tlbih4LlNQUkVBRCk7Y29uc3QgdD10aGlzLmV4cGVjdE9wdGlvbmFsS2V5d29yZCgib24iKTtyZXR1cm4hdCYmdGhpcy5wZWVrKHguTkFNRSk/dGhpcy5ub2RlKGUse2tpbmQ6Ty5GUkFHTUVOVF9TUFJFQUQsbmFtZTp0aGlzLnBhcnNlRnJhZ21lbnROYW1lKCksZGlyZWN0aXZlczp0aGlzLnBhcnNlRGlyZWN0aXZlcyghMSl9KTp0aGlzLm5vZGUoZSx7a2luZDpPLklOTElORV9GUkFHTUVOVCx0eXBlQ29uZGl0aW9uOnQ/dGhpcy5wYXJzZU5hbWVkVHlwZSgpOnZvaWQgMCxkaXJlY3RpdmVzOnRoaXMucGFyc2VEaXJlY3RpdmVzKCExKSxzZWxlY3Rpb25TZXQ6dGhpcy5wYXJzZVNlbGVjdGlvblNldCgpfSl9cGFyc2VGcmFnbWVudERlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuO3JldHVybiB0aGlzLmV4cGVjdEtleXdvcmQoImZyYWdtZW50IiksITA9PT10aGlzLl9vcHRpb25zLmFsbG93TGVnYWN5RnJhZ21lbnRWYXJpYWJsZXM/dGhpcy5ub2RlKGUse2tpbmQ6Ty5GUkFHTUVOVF9ERUZJTklUSU9OLG5hbWU6dGhpcy5wYXJzZUZyYWdtZW50TmFtZSgpLHZhcmlhYmxlRGVmaW5pdGlvbnM6dGhpcy5wYXJzZVZhcmlhYmxlRGVmaW5pdGlvbnMoKSx0eXBlQ29uZGl0aW9uOih0aGlzLmV4cGVjdEtleXdvcmQoIm9uIiksdGhpcy5wYXJzZU5hbWVkVHlwZSgpKSxkaXJlY3RpdmVzOnRoaXMucGFyc2VEaXJlY3RpdmVzKCExKSxzZWxlY3Rpb25TZXQ6dGhpcy5wYXJzZVNlbGVjdGlvblNldCgpfSk6dGhpcy5ub2RlKGUse2tpbmQ6Ty5GUkFHTUVOVF9ERUZJTklUSU9OLG5hbWU6dGhpcy5wYXJzZUZyYWdtZW50TmFtZSgpLHR5cGVDb25kaXRpb246KHRoaXMuZXhwZWN0S2V5d29yZCgib24iKSx0aGlzLnBhcnNlTmFtZWRUeXBlKCkpLGRpcmVjdGl2ZXM6dGhpcy5wYXJzZURpcmVjdGl2ZXMoITEpLHNlbGVjdGlvblNldDp0aGlzLnBhcnNlU2VsZWN0aW9uU2V0KCl9KX1wYXJzZUZyYWdtZW50TmFtZSgpe2lmKCJvbiI9PT10aGlzLl9sZXhlci50b2tlbi52YWx1ZSl0aHJvdyB0aGlzLnVuZXhwZWN0ZWQoKTtyZXR1cm4gdGhpcy5wYXJzZU5hbWUoKX1wYXJzZVZhbHVlTGl0ZXJhbChlKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3N3aXRjaCh0LmtpbmQpe2Nhc2UgeC5CUkFDS0VUX0w6cmV0dXJuIHRoaXMucGFyc2VMaXN0KGUpO2Nhc2UgeC5CUkFDRV9MOnJldHVybiB0aGlzLnBhcnNlT2JqZWN0KGUpO2Nhc2UgeC5JTlQ6cmV0dXJuIHRoaXMuYWR2YW5jZUxleGVyKCksdGhpcy5ub2RlKHQse2tpbmQ6Ty5JTlQsdmFsdWU6dC52YWx1ZX0pO2Nhc2UgeC5GTE9BVDpyZXR1cm4gdGhpcy5hZHZhbmNlTGV4ZXIoKSx0aGlzLm5vZGUodCx7a2luZDpPLkZMT0FULHZhbHVlOnQudmFsdWV9KTtjYXNlIHguU1RSSU5HOmNhc2UgeC5CTE9DS19TVFJJTkc6cmV0dXJuIHRoaXMucGFyc2VTdHJpbmdMaXRlcmFsKCk7Y2FzZSB4Lk5BTUU6c3dpdGNoKHRoaXMuYWR2YW5jZUxleGVyKCksdC52YWx1ZSl7Y2FzZSJ0cnVlIjpyZXR1cm4gdGhpcy5ub2RlKHQse2tpbmQ6Ty5CT09MRUFOLHZhbHVlOiEwfSk7Y2FzZSJmYWxzZSI6cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOk8uQk9PTEVBTix2YWx1ZTohMX0pO2Nhc2UibnVsbCI6cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOk8uTlVMTH0pO2RlZmF1bHQ6cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOk8uRU5VTSx2YWx1ZTp0LnZhbHVlfSl9Y2FzZSB4LkRPTExBUjppZihlKXtpZih0aGlzLmV4cGVjdFRva2VuKHguRE9MTEFSKSx0aGlzLl9sZXhlci50b2tlbi5raW5kPT09eC5OQU1FKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLnZhbHVlO3Rocm93IHkodGhpcy5fbGV4ZXIuc291cmNlLHQuc3RhcnQsYFVuZXhwZWN0ZWQgdmFyaWFibGUgIiQke2V9IiBpbiBjb25zdGFudCB2YWx1ZS5gKX10aHJvdyB0aGlzLnVuZXhwZWN0ZWQodCl9cmV0dXJuIHRoaXMucGFyc2VWYXJpYWJsZSgpO2RlZmF1bHQ6dGhyb3cgdGhpcy51bmV4cGVjdGVkKCl9fXBhcnNlQ29uc3RWYWx1ZUxpdGVyYWwoKXtyZXR1cm4gdGhpcy5wYXJzZVZhbHVlTGl0ZXJhbCghMCl9cGFyc2VTdHJpbmdMaXRlcmFsKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbjtyZXR1cm4gdGhpcy5hZHZhbmNlTGV4ZXIoKSx0aGlzLm5vZGUoZSx7a2luZDpPLlNUUklORyx2YWx1ZTplLnZhbHVlLGJsb2NrOmUua2luZD09PXguQkxPQ0tfU1RSSU5HfSl9cGFyc2VMaXN0KGUpe3JldHVybiB0aGlzLm5vZGUodGhpcy5fbGV4ZXIudG9rZW4se2tpbmQ6Ty5MSVNULHZhbHVlczp0aGlzLmFueSh4LkJSQUNLRVRfTCwoKCk9PnRoaXMucGFyc2VWYWx1ZUxpdGVyYWwoZSkpLHguQlJBQ0tFVF9SKX0pfXBhcnNlT2JqZWN0KGUpe3JldHVybiB0aGlzLm5vZGUodGhpcy5fbGV4ZXIudG9rZW4se2tpbmQ6Ty5PQkpFQ1QsZmllbGRzOnRoaXMuYW55KHguQlJBQ0VfTCwoKCk9PnRoaXMucGFyc2VPYmplY3RGaWVsZChlKSkseC5CUkFDRV9SKX0pfXBhcnNlT2JqZWN0RmllbGQoZSl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbixuPXRoaXMucGFyc2VOYW1lKCk7cmV0dXJuIHRoaXMuZXhwZWN0VG9rZW4oeC5DT0xPTiksdGhpcy5ub2RlKHQse2tpbmQ6Ty5PQkpFQ1RfRklFTEQsbmFtZTpuLHZhbHVlOnRoaXMucGFyc2VWYWx1ZUxpdGVyYWwoZSl9KX1wYXJzZURpcmVjdGl2ZXMoZSl7Y29uc3QgdD1bXTtmb3IoO3RoaXMucGVlayh4LkFUKTspdC5wdXNoKHRoaXMucGFyc2VEaXJlY3RpdmUoZSkpO3JldHVybiB0fXBhcnNlQ29uc3REaXJlY3RpdmVzKCl7cmV0dXJuIHRoaXMucGFyc2VEaXJlY3RpdmVzKCEwKX1wYXJzZURpcmVjdGl2ZShlKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3JldHVybiB0aGlzLmV4cGVjdFRva2VuKHguQVQpLHRoaXMubm9kZSh0LHtraW5kOk8uRElSRUNUSVZFLG5hbWU6dGhpcy5wYXJzZU5hbWUoKSxhcmd1bWVudHM6dGhpcy5wYXJzZUFyZ3VtZW50cyhlKX0pfXBhcnNlVHlwZVJlZmVyZW5jZSgpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW47bGV0IHQ7aWYodGhpcy5leHBlY3RPcHRpb25hbFRva2VuKHguQlJBQ0tFVF9MKSl7Y29uc3Qgbj10aGlzLnBhcnNlVHlwZVJlZmVyZW5jZSgpO3RoaXMuZXhwZWN0VG9rZW4oeC5CUkFDS0VUX1IpLHQ9dGhpcy5ub2RlKGUse2tpbmQ6Ty5MSVNUX1RZUEUsdHlwZTpufSl9ZWxzZSB0PXRoaXMucGFyc2VOYW1lZFR5cGUoKTtyZXR1cm4gdGhpcy5leHBlY3RPcHRpb25hbFRva2VuKHguQkFORyk/dGhpcy5ub2RlKGUse2tpbmQ6Ty5OT05fTlVMTF9UWVBFLHR5cGU6dH0pOnR9cGFyc2VOYW1lZFR5cGUoKXtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOk8uTkFNRURfVFlQRSxuYW1lOnRoaXMucGFyc2VOYW1lKCl9KX1wZWVrRGVzY3JpcHRpb24oKXtyZXR1cm4gdGhpcy5wZWVrKHguU1RSSU5HKXx8dGhpcy5wZWVrKHguQkxPQ0tfU1RSSU5HKX1wYXJzZURlc2NyaXB0aW9uKCl7aWYodGhpcy5wZWVrRGVzY3JpcHRpb24oKSlyZXR1cm4gdGhpcy5wYXJzZVN0cmluZ0xpdGVyYWwoKX1wYXJzZVNjaGVtYURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJzY2hlbWEiKTtjb25zdCBuPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxyPXRoaXMubWFueSh4LkJSQUNFX0wsdGhpcy5wYXJzZU9wZXJhdGlvblR5cGVEZWZpbml0aW9uLHguQlJBQ0VfUik7cmV0dXJuIHRoaXMubm9kZShlLHtraW5kOk8uU0NIRU1BX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxkaXJlY3RpdmVzOm4sb3BlcmF0aW9uVHlwZXM6cn0pfXBhcnNlT3BlcmF0aW9uVHlwZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZU9wZXJhdGlvblR5cGUoKTt0aGlzLmV4cGVjdFRva2VuKHguQ09MT04pO2NvbnN0IG49dGhpcy5wYXJzZU5hbWVkVHlwZSgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLk9QRVJBVElPTl9UWVBFX0RFRklOSVRJT04sb3BlcmF0aW9uOnQsdHlwZTpufSl9cGFyc2VTY2FsYXJUeXBlRGVmaW5pdGlvbigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW4sdD10aGlzLnBhcnNlRGVzY3JpcHRpb24oKTt0aGlzLmV4cGVjdEtleXdvcmQoInNjYWxhciIpO2NvbnN0IG49dGhpcy5wYXJzZU5hbWUoKSxyPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKTtyZXR1cm4gdGhpcy5ub2RlKGUse2tpbmQ6Ty5TQ0FMQVJfVFlQRV9ERUZJTklUSU9OLGRlc2NyaXB0aW9uOnQsbmFtZTpuLGRpcmVjdGl2ZXM6cn0pfXBhcnNlT2JqZWN0VHlwZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJ0eXBlIik7Y29uc3Qgbj10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUltcGxlbWVudHNJbnRlcmZhY2VzKCksaT10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCkscz10aGlzLnBhcnNlRmllbGRzRGVmaW5pdGlvbigpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLk9CSkVDVF9UWVBFX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxuYW1lOm4saW50ZXJmYWNlczpyLGRpcmVjdGl2ZXM6aSxmaWVsZHM6c30pfXBhcnNlSW1wbGVtZW50c0ludGVyZmFjZXMoKXtyZXR1cm4gdGhpcy5leHBlY3RPcHRpb25hbEtleXdvcmQoImltcGxlbWVudHMiKT90aGlzLmRlbGltaXRlZE1hbnkoeC5BTVAsdGhpcy5wYXJzZU5hbWVkVHlwZSk6W119cGFyc2VGaWVsZHNEZWZpbml0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KHguQlJBQ0VfTCx0aGlzLnBhcnNlRmllbGREZWZpbml0aW9uLHguQlJBQ0VfUil9cGFyc2VGaWVsZERlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCksbj10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUFyZ3VtZW50RGVmcygpO3RoaXMuZXhwZWN0VG9rZW4oeC5DT0xPTik7Y29uc3QgaT10aGlzLnBhcnNlVHlwZVJlZmVyZW5jZSgpLHM9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLkZJRUxEX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxuYW1lOm4sYXJndW1lbnRzOnIsdHlwZTppLGRpcmVjdGl2ZXM6c30pfXBhcnNlQXJndW1lbnREZWZzKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KHguUEFSRU5fTCx0aGlzLnBhcnNlSW5wdXRWYWx1ZURlZix4LlBBUkVOX1IpfXBhcnNlSW5wdXRWYWx1ZURlZigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW4sdD10aGlzLnBhcnNlRGVzY3JpcHRpb24oKSxuPXRoaXMucGFyc2VOYW1lKCk7dGhpcy5leHBlY3RUb2tlbih4LkNPTE9OKTtjb25zdCByPXRoaXMucGFyc2VUeXBlUmVmZXJlbmNlKCk7bGV0IGk7dGhpcy5leHBlY3RPcHRpb25hbFRva2VuKHguRVFVQUxTKSYmKGk9dGhpcy5wYXJzZUNvbnN0VmFsdWVMaXRlcmFsKCkpO2NvbnN0IHM9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLklOUFVUX1ZBTFVFX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxuYW1lOm4sdHlwZTpyLGRlZmF1bHRWYWx1ZTppLGRpcmVjdGl2ZXM6c30pfXBhcnNlSW50ZXJmYWNlVHlwZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJpbnRlcmZhY2UiKTtjb25zdCBuPXRoaXMucGFyc2VOYW1lKCkscj10aGlzLnBhcnNlSW1wbGVtZW50c0ludGVyZmFjZXMoKSxpPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxzPXRoaXMucGFyc2VGaWVsZHNEZWZpbml0aW9uKCk7cmV0dXJuIHRoaXMubm9kZShlLHtraW5kOk8uSU5URVJGQUNFX1RZUEVfREVGSU5JVElPTixkZXNjcmlwdGlvbjp0LG5hbWU6bixpbnRlcmZhY2VzOnIsZGlyZWN0aXZlczppLGZpZWxkczpzfSl9cGFyc2VVbmlvblR5cGVEZWZpbml0aW9uKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbix0PXRoaXMucGFyc2VEZXNjcmlwdGlvbigpO3RoaXMuZXhwZWN0S2V5d29yZCgidW5pb24iKTtjb25zdCBuPXRoaXMucGFyc2VOYW1lKCkscj10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCksaT10aGlzLnBhcnNlVW5pb25NZW1iZXJUeXBlcygpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLlVOSU9OX1RZUEVfREVGSU5JVElPTixkZXNjcmlwdGlvbjp0LG5hbWU6bixkaXJlY3RpdmVzOnIsdHlwZXM6aX0pfXBhcnNlVW5pb25NZW1iZXJUeXBlcygpe3JldHVybiB0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oeC5FUVVBTFMpP3RoaXMuZGVsaW1pdGVkTWFueSh4LlBJUEUsdGhpcy5wYXJzZU5hbWVkVHlwZSk6W119cGFyc2VFbnVtVHlwZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJlbnVtIik7Y29uc3Qgbj10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLGk9dGhpcy5wYXJzZUVudW1WYWx1ZXNEZWZpbml0aW9uKCk7cmV0dXJuIHRoaXMubm9kZShlLHtraW5kOk8uRU5VTV9UWVBFX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxuYW1lOm4sZGlyZWN0aXZlczpyLHZhbHVlczppfSl9cGFyc2VFbnVtVmFsdWVzRGVmaW5pdGlvbigpe3JldHVybiB0aGlzLm9wdGlvbmFsTWFueSh4LkJSQUNFX0wsdGhpcy5wYXJzZUVudW1WYWx1ZURlZmluaXRpb24seC5CUkFDRV9SKX1wYXJzZUVudW1WYWx1ZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCksbj10aGlzLnBhcnNlRW51bVZhbHVlTmFtZSgpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLkVOVU1fVkFMVUVfREVGSU5JVElPTixkZXNjcmlwdGlvbjp0LG5hbWU6bixkaXJlY3RpdmVzOnJ9KX1wYXJzZUVudW1WYWx1ZU5hbWUoKXtpZigidHJ1ZSI9PT10aGlzLl9sZXhlci50b2tlbi52YWx1ZXx8ImZhbHNlIj09PXRoaXMuX2xleGVyLnRva2VuLnZhbHVlfHwibnVsbCI9PT10aGlzLl9sZXhlci50b2tlbi52YWx1ZSl0aHJvdyB5KHRoaXMuX2xleGVyLnNvdXJjZSx0aGlzLl9sZXhlci50b2tlbi5zdGFydCxgJHtsZSh0aGlzLl9sZXhlci50b2tlbil9IGlzIHJlc2VydmVkIGFuZCBjYW5ub3QgYmUgdXNlZCBmb3IgYW4gZW51bSB2YWx1ZS5gKTtyZXR1cm4gdGhpcy5wYXJzZU5hbWUoKX1wYXJzZUlucHV0T2JqZWN0VHlwZURlZmluaXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJpbnB1dCIpO2NvbnN0IG49dGhpcy5wYXJzZU5hbWUoKSxyPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxpPXRoaXMucGFyc2VJbnB1dEZpZWxkc0RlZmluaXRpb24oKTtyZXR1cm4gdGhpcy5ub2RlKGUse2tpbmQ6Ty5JTlBVVF9PQkpFQ1RfVFlQRV9ERUZJTklUSU9OLGRlc2NyaXB0aW9uOnQsbmFtZTpuLGRpcmVjdGl2ZXM6cixmaWVsZHM6aX0pfXBhcnNlSW5wdXRGaWVsZHNEZWZpbml0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KHguQlJBQ0VfTCx0aGlzLnBhcnNlSW5wdXRWYWx1ZURlZix4LkJSQUNFX1IpfXBhcnNlVHlwZVN5c3RlbUV4dGVuc2lvbigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIubG9va2FoZWFkKCk7aWYoZS5raW5kPT09eC5OQU1FKXN3aXRjaChlLnZhbHVlKXtjYXNlInNjaGVtYSI6cmV0dXJuIHRoaXMucGFyc2VTY2hlbWFFeHRlbnNpb24oKTtjYXNlInNjYWxhciI6cmV0dXJuIHRoaXMucGFyc2VTY2FsYXJUeXBlRXh0ZW5zaW9uKCk7Y2FzZSJ0eXBlIjpyZXR1cm4gdGhpcy5wYXJzZU9iamVjdFR5cGVFeHRlbnNpb24oKTtjYXNlImludGVyZmFjZSI6cmV0dXJuIHRoaXMucGFyc2VJbnRlcmZhY2VUeXBlRXh0ZW5zaW9uKCk7Y2FzZSJ1bmlvbiI6cmV0dXJuIHRoaXMucGFyc2VVbmlvblR5cGVFeHRlbnNpb24oKTtjYXNlImVudW0iOnJldHVybiB0aGlzLnBhcnNlRW51bVR5cGVFeHRlbnNpb24oKTtjYXNlImlucHV0IjpyZXR1cm4gdGhpcy5wYXJzZUlucHV0T2JqZWN0VHlwZUV4dGVuc2lvbigpfXRocm93IHRoaXMudW5leHBlY3RlZChlKX1wYXJzZVNjaGVtYUV4dGVuc2lvbigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW47dGhpcy5leHBlY3RLZXl3b3JkKCJleHRlbmQiKSx0aGlzLmV4cGVjdEtleXdvcmQoInNjaGVtYSIpO2NvbnN0IHQ9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLG49dGhpcy5vcHRpb25hbE1hbnkoeC5CUkFDRV9MLHRoaXMucGFyc2VPcGVyYXRpb25UeXBlRGVmaW5pdGlvbix4LkJSQUNFX1IpO2lmKDA9PT10Lmxlbmd0aCYmMD09PW4ubGVuZ3RoKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLlNDSEVNQV9FWFRFTlNJT04sZGlyZWN0aXZlczp0LG9wZXJhdGlvblR5cGVzOm59KX1wYXJzZVNjYWxhclR5cGVFeHRlbnNpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJzY2FsYXIiKTtjb25zdCB0PXRoaXMucGFyc2VOYW1lKCksbj10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCk7aWYoMD09PW4ubGVuZ3RoKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLlNDQUxBUl9UWVBFX0VYVEVOU0lPTixuYW1lOnQsZGlyZWN0aXZlczpufSl9cGFyc2VPYmplY3RUeXBlRXh0ZW5zaW9uKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbjt0aGlzLmV4cGVjdEtleXdvcmQoImV4dGVuZCIpLHRoaXMuZXhwZWN0S2V5d29yZCgidHlwZSIpO2NvbnN0IHQ9dGhpcy5wYXJzZU5hbWUoKSxuPXRoaXMucGFyc2VJbXBsZW1lbnRzSW50ZXJmYWNlcygpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLGk9dGhpcy5wYXJzZUZpZWxkc0RlZmluaXRpb24oKTtpZigwPT09bi5sZW5ndGgmJjA9PT1yLmxlbmd0aCYmMD09PWkubGVuZ3RoKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLk9CSkVDVF9UWVBFX0VYVEVOU0lPTixuYW1lOnQsaW50ZXJmYWNlczpuLGRpcmVjdGl2ZXM6cixmaWVsZHM6aX0pfXBhcnNlSW50ZXJmYWNlVHlwZUV4dGVuc2lvbigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW47dGhpcy5leHBlY3RLZXl3b3JkKCJleHRlbmQiKSx0aGlzLmV4cGVjdEtleXdvcmQoImludGVyZmFjZSIpO2NvbnN0IHQ9dGhpcy5wYXJzZU5hbWUoKSxuPXRoaXMucGFyc2VJbXBsZW1lbnRzSW50ZXJmYWNlcygpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLGk9dGhpcy5wYXJzZUZpZWxkc0RlZmluaXRpb24oKTtpZigwPT09bi5sZW5ndGgmJjA9PT1yLmxlbmd0aCYmMD09PWkubGVuZ3RoKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLklOVEVSRkFDRV9UWVBFX0VYVEVOU0lPTixuYW1lOnQsaW50ZXJmYWNlczpuLGRpcmVjdGl2ZXM6cixmaWVsZHM6aX0pfXBhcnNlVW5pb25UeXBlRXh0ZW5zaW9uKCl7Y29uc3QgZT10aGlzLl9sZXhlci50b2tlbjt0aGlzLmV4cGVjdEtleXdvcmQoImV4dGVuZCIpLHRoaXMuZXhwZWN0S2V5d29yZCgidW5pb24iKTtjb25zdCB0PXRoaXMucGFyc2VOYW1lKCksbj10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCkscj10aGlzLnBhcnNlVW5pb25NZW1iZXJUeXBlcygpO2lmKDA9PT1uLmxlbmd0aCYmMD09PXIubGVuZ3RoKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUoZSx7a2luZDpPLlVOSU9OX1RZUEVfRVhURU5TSU9OLG5hbWU6dCxkaXJlY3RpdmVzOm4sdHlwZXM6cn0pfXBhcnNlRW51bVR5cGVFeHRlbnNpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJlbnVtIik7Y29uc3QgdD10aGlzLnBhcnNlTmFtZSgpLG49dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLHI9dGhpcy5wYXJzZUVudW1WYWx1ZXNEZWZpbml0aW9uKCk7aWYoMD09PW4ubGVuZ3RoJiYwPT09ci5sZW5ndGgpdGhyb3cgdGhpcy51bmV4cGVjdGVkKCk7cmV0dXJuIHRoaXMubm9kZShlLHtraW5kOk8uRU5VTV9UWVBFX0VYVEVOU0lPTixuYW1lOnQsZGlyZWN0aXZlczpuLHZhbHVlczpyfSl9cGFyc2VJbnB1dE9iamVjdFR5cGVFeHRlbnNpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJpbnB1dCIpO2NvbnN0IHQ9dGhpcy5wYXJzZU5hbWUoKSxuPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxyPXRoaXMucGFyc2VJbnB1dEZpZWxkc0RlZmluaXRpb24oKTtpZigwPT09bi5sZW5ndGgmJjA9PT1yLmxlbmd0aCl0aHJvdyB0aGlzLnVuZXhwZWN0ZWQoKTtyZXR1cm4gdGhpcy5ub2RlKGUse2tpbmQ6Ty5JTlBVVF9PQkpFQ1RfVFlQRV9FWFRFTlNJT04sbmFtZTp0LGRpcmVjdGl2ZXM6bixmaWVsZHM6cn0pfXBhcnNlRGlyZWN0aXZlRGVmaW5pdGlvbigpe2NvbnN0IGU9dGhpcy5fbGV4ZXIudG9rZW4sdD10aGlzLnBhcnNlRGVzY3JpcHRpb24oKTt0aGlzLmV4cGVjdEtleXdvcmQoImRpcmVjdGl2ZSIpLHRoaXMuZXhwZWN0VG9rZW4oeC5BVCk7Y29uc3Qgbj10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUFyZ3VtZW50RGVmcygpLGk9dGhpcy5leHBlY3RPcHRpb25hbEtleXdvcmQoInJlcGVhdGFibGUiKTt0aGlzLmV4cGVjdEtleXdvcmQoIm9uIik7Y29uc3Qgcz10aGlzLnBhcnNlRGlyZWN0aXZlTG9jYXRpb25zKCk7cmV0dXJuIHRoaXMubm9kZShlLHtraW5kOk8uRElSRUNUSVZFX0RFRklOSVRJT04sZGVzY3JpcHRpb246dCxuYW1lOm4sYXJndW1lbnRzOnIscmVwZWF0YWJsZTppLGxvY2F0aW9uczpzfSl9cGFyc2VEaXJlY3RpdmVMb2NhdGlvbnMoKXtyZXR1cm4gdGhpcy5kZWxpbWl0ZWRNYW55KHguUElQRSx0aGlzLnBhcnNlRGlyZWN0aXZlTG9jYXRpb24pfXBhcnNlRGlyZWN0aXZlTG9jYXRpb24oKXtjb25zdCBlPXRoaXMuX2xleGVyLnRva2VuLHQ9dGhpcy5wYXJzZU5hbWUoKTtpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoTix0LnZhbHVlKSlyZXR1cm4gdDt0aHJvdyB0aGlzLnVuZXhwZWN0ZWQoZSl9bm9kZShlLHQpe3JldHVybiEwIT09dGhpcy5fb3B0aW9ucy5ub0xvY2F0aW9uJiYodC5sb2M9bmV3IG0oZSx0aGlzLl9sZXhlci5sYXN0VG9rZW4sdGhpcy5fbGV4ZXIuc291cmNlKSksdH1wZWVrKGUpe3JldHVybiB0aGlzLl9sZXhlci50b2tlbi5raW5kPT09ZX1leHBlY3RUb2tlbihlKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO2lmKHQua2luZD09PWUpcmV0dXJuIHRoaXMuYWR2YW5jZUxleGVyKCksdDt0aHJvdyB5KHRoaXMuX2xleGVyLnNvdXJjZSx0LnN0YXJ0LGBFeHBlY3RlZCAke3VlKGUpfSwgZm91bmQgJHtsZSh0KX0uYCl9ZXhwZWN0T3B0aW9uYWxUb2tlbihlKXtyZXR1cm4gdGhpcy5fbGV4ZXIudG9rZW4ua2luZD09PWUmJih0aGlzLmFkdmFuY2VMZXhlcigpLCEwKX1leHBlY3RLZXl3b3JkKGUpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47aWYodC5raW5kIT09eC5OQU1FfHx0LnZhbHVlIT09ZSl0aHJvdyB5KHRoaXMuX2xleGVyLnNvdXJjZSx0LnN0YXJ0LGBFeHBlY3RlZCAiJHtlfSIsIGZvdW5kICR7bGUodCl9LmApO3RoaXMuYWR2YW5jZUxleGVyKCl9ZXhwZWN0T3B0aW9uYWxLZXl3b3JkKGUpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47cmV0dXJuIHQua2luZD09PXguTkFNRSYmdC52YWx1ZT09PWUmJih0aGlzLmFkdmFuY2VMZXhlcigpLCEwKX11bmV4cGVjdGVkKGUpe2NvbnN0IHQ9bnVsbCE9ZT9lOnRoaXMuX2xleGVyLnRva2VuO3JldHVybiB5KHRoaXMuX2xleGVyLnNvdXJjZSx0LnN0YXJ0LGBVbmV4cGVjdGVkICR7bGUodCl9LmApfWFueShlLHQsbil7dGhpcy5leHBlY3RUb2tlbihlKTtjb25zdCByPVtdO2Zvcig7IXRoaXMuZXhwZWN0T3B0aW9uYWxUb2tlbihuKTspci5wdXNoKHQuY2FsbCh0aGlzKSk7cmV0dXJuIHJ9b3B0aW9uYWxNYW55KGUsdCxuKXtpZih0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oZSkpe2NvbnN0IGU9W107ZG97ZS5wdXNoKHQuY2FsbCh0aGlzKSl9d2hpbGUoIXRoaXMuZXhwZWN0T3B0aW9uYWxUb2tlbihuKSk7cmV0dXJuIGV9cmV0dXJuW119bWFueShlLHQsbil7dGhpcy5leHBlY3RUb2tlbihlKTtjb25zdCByPVtdO2Rve3IucHVzaCh0LmNhbGwodGhpcykpfXdoaWxlKCF0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4obikpO3JldHVybiByfWRlbGltaXRlZE1hbnkoZSx0KXt0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oZSk7Y29uc3Qgbj1bXTtkb3tuLnB1c2godC5jYWxsKHRoaXMpKX13aGlsZSh0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oZSkpO3JldHVybiBufWFkdmFuY2VMZXhlcigpe2NvbnN0e21heFRva2VuczplfT10aGlzLl9vcHRpb25zLHQ9dGhpcy5fbGV4ZXIuYWR2YW5jZSgpO2lmKHZvaWQgMCE9PWUmJnQua2luZCE9PXguRU9GJiYoKyt0aGlzLl90b2tlbkNvdW50ZXIsdGhpcy5fdG9rZW5Db3VudGVyPmUpKXRocm93IHkodGhpcy5fbGV4ZXIuc291cmNlLHQuc3RhcnQsYERvY3VtZW50IGNvbnRhaW5zIG1vcmUgdGhhdCAke2V9IHRva2Vucy4gUGFyc2luZyBhYm9ydGVkLmApfX1mdW5jdGlvbiBsZShlKXtjb25zdCB0PWUudmFsdWU7cmV0dXJuIHVlKGUua2luZCkrKG51bGwhPXQ/YCAiJHt0fSJgOiIiKX1mdW5jdGlvbiB1ZShlKXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGU9PT14LkJBTkd8fGU9PT14LkRPTExBUnx8ZT09PXguQU1QfHxlPT09eC5QQVJFTl9MfHxlPT09eC5QQVJFTl9SfHxlPT09eC5TUFJFQUR8fGU9PT14LkNPTE9OfHxlPT09eC5FUVVBTFN8fGU9PT14LkFUfHxlPT09eC5CUkFDS0VUX0x8fGU9PT14LkJSQUNLRVRfUnx8ZT09PXguQlJBQ0VfTHx8ZT09PXguUElQRXx8ZT09PXguQlJBQ0VfUn0oZSk/YCIke2V9ImA6ZX1jb25zdCBkZT0vW1x4MDAtXHgxZlx4MjJceDVjXHg3Zi1ceDlmXS9nO2Z1bmN0aW9uIHBlKGUpe3JldHVybiBoZVtlLmNoYXJDb2RlQXQoMCldfWNvbnN0IGhlPVsiXFx1MDAwMCIsIlxcdTAwMDEiLCJcXHUwMDAyIiwiXFx1MDAwMyIsIlxcdTAwMDQiLCJcXHUwMDA1IiwiXFx1MDAwNiIsIlxcdTAwMDciLCJcXGIiLCJcXHQiLCJcXG4iLCJcXHUwMDBCIiwiXFxmIiwiXFxyIiwiXFx1MDAwRSIsIlxcdTAwMEYiLCJcXHUwMDEwIiwiXFx1MDAxMSIsIlxcdTAwMTIiLCJcXHUwMDEzIiwiXFx1MDAxNCIsIlxcdTAwMTUiLCJcXHUwMDE2IiwiXFx1MDAxNyIsIlxcdTAwMTgiLCJcXHUwMDE5IiwiXFx1MDAxQSIsIlxcdTAwMUIiLCJcXHUwMDFDIiwiXFx1MDAxRCIsIlxcdTAwMUUiLCJcXHUwMDFGIiwiIiwiIiwnXFwiJywiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiXFxcXCIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIlxcdTAwN0YiLCJcXHUwMDgwIiwiXFx1MDA4MSIsIlxcdTAwODIiLCJcXHUwMDgzIiwiXFx1MDA4NCIsIlxcdTAwODUiLCJcXHUwMDg2IiwiXFx1MDA4NyIsIlxcdTAwODgiLCJcXHUwMDg5IiwiXFx1MDA4QSIsIlxcdTAwOEIiLCJcXHUwMDhDIiwiXFx1MDA4RCIsIlxcdTAwOEUiLCJcXHUwMDhGIiwiXFx1MDA5MCIsIlxcdTAwOTEiLCJcXHUwMDkyIiwiXFx1MDA5MyIsIlxcdTAwOTQiLCJcXHUwMDk1IiwiXFx1MDA5NiIsIlxcdTAwOTciLCJcXHUwMDk4IiwiXFx1MDA5OSIsIlxcdTAwOUEiLCJcXHUwMDlCIiwiXFx1MDA5QyIsIlxcdTAwOUQiLCJcXHUwMDlFIiwiXFx1MDA5RiJdLGZlPU9iamVjdC5mcmVlemUoe30pO2Z1bmN0aW9uIHllKGUsdCl7Y29uc3Qgbj1lW3RdO3JldHVybiJvYmplY3QiPT10eXBlb2Ygbj9uOiJmdW5jdGlvbiI9PXR5cGVvZiBuP3tlbnRlcjpuLGxlYXZlOnZvaWQgMH06e2VudGVyOmUuZW50ZXIsbGVhdmU6ZS5sZWF2ZX19ZnVuY3Rpb24gbWUoZSl7cmV0dXJuIGZ1bmN0aW9uKGUsdCxuPV8pe2NvbnN0IHI9bmV3IE1hcDtmb3IoY29uc3QgYSBvZiBPYmplY3QudmFsdWVzKE8pKXIuc2V0KGEseWUodCxhKSk7bGV0IGkscyxvLGM9QXJyYXkuaXNBcnJheShlKSxsPVtlXSx1PS0xLGQ9W10scD1lO2NvbnN0IGg9W10sZj1bXTtkb3t1Kys7Y29uc3QgZT11PT09bC5sZW5ndGgsXz1lJiYwIT09ZC5sZW5ndGg7aWYoZSl7aWYocz0wPT09Zi5sZW5ndGg/dm9pZCAwOmhbaC5sZW5ndGgtMV0scD1vLG89Zi5wb3AoKSxfKWlmKGMpe3A9cC5zbGljZSgpO2xldCBlPTA7Zm9yKGNvbnN0W3Qsbl1vZiBkKXtjb25zdCByPXQtZTtudWxsPT09bj8ocC5zcGxpY2UociwxKSxlKyspOnBbcl09bn19ZWxzZXtwPU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHt9LE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHApKTtmb3IoY29uc3RbZSx0XW9mIGQpcFtlXT10fXU9aS5pbmRleCxsPWkua2V5cyxkPWkuZWRpdHMsYz1pLmluQXJyYXksaT1pLnByZXZ9ZWxzZSBpZihvKXtpZihzPWM/dTpsW3VdLHA9b1tzXSxudWxsPT1wKWNvbnRpbnVlO2gucHVzaChzKX1sZXQgZztpZighQXJyYXkuaXNBcnJheShwKSl7dmFyIHksbTtFKHApfHxhKCExLGBJbnZhbGlkIEFTVCBOb2RlOiAke3JlKHApfS5gKTtjb25zdCBuPWU/bnVsbD09PSh5PXIuZ2V0KHAua2luZCkpfHx2b2lkIDA9PT15P3ZvaWQgMDp5LmxlYXZlOm51bGw9PT0obT1yLmdldChwLmtpbmQpKXx8dm9pZCAwPT09bT92b2lkIDA6bS5lbnRlcjtpZihnPW51bGw9PW4/dm9pZCAwOm4uY2FsbCh0LHAscyxvLGgsZiksZz09PWZlKWJyZWFrO2lmKCExPT09Zyl7aWYoIWUpe2gucG9wKCk7Y29udGludWV9fWVsc2UgaWYodm9pZCAwIT09ZyYmKGQucHVzaChbcyxnXSksIWUpKXtpZighRShnKSl7aC5wb3AoKTtjb250aW51ZX1wPWd9fXZhciB2O3ZvaWQgMD09PWcmJl8mJmQucHVzaChbcyxwXSksZT9oLnBvcCgpOihpPXtpbkFycmF5OmMsaW5kZXg6dSxrZXlzOmwsZWRpdHM6ZCxwcmV2Oml9LGM9QXJyYXkuaXNBcnJheShwKSxsPWM/cDpudWxsIT09KHY9bltwLmtpbmRdKSYmdm9pZCAwIT09dj92OltdLHU9LTEsZD1bXSxvJiZmLnB1c2gobyksbz1wKX13aGlsZSh2b2lkIDAhPT1pKTtyZXR1cm4gMCE9PWQubGVuZ3RoP2RbZC5sZW5ndGgtMV1bMV06ZX0oZSx2ZSl9Y29uc3QgdmU9e05hbWU6e2xlYXZlOmU9PmUudmFsdWV9LFZhcmlhYmxlOntsZWF2ZTplPT4iJCIrZS5uYW1lfSxEb2N1bWVudDp7bGVhdmU6ZT0+X2UoZS5kZWZpbml0aW9ucywiXG5cbiIpfSxPcGVyYXRpb25EZWZpbml0aW9uOntsZWF2ZShlKXtjb25zdCB0PUVlKCIoIixfZShlLnZhcmlhYmxlRGVmaW5pdGlvbnMsIiwgIiksIikiKSxuPV9lKFtlLm9wZXJhdGlvbixfZShbZS5uYW1lLHRdKSxfZShlLmRpcmVjdGl2ZXMsIiAiKV0sIiAiKTtyZXR1cm4oInF1ZXJ5Ij09PW4/IiI6bisiICIpK2Uuc2VsZWN0aW9uU2V0fX0sVmFyaWFibGVEZWZpbml0aW9uOntsZWF2ZTooe3ZhcmlhYmxlOmUsdHlwZTp0LGRlZmF1bHRWYWx1ZTpuLGRpcmVjdGl2ZXM6cn0pPT5lKyI6ICIrdCtFZSgiID0gIixuKStFZSgiICIsX2UociwiICIpKX0sU2VsZWN0aW9uU2V0OntsZWF2ZTooe3NlbGVjdGlvbnM6ZX0pPT5nZShlKX0sRmllbGQ6e2xlYXZlKHthbGlhczplLG5hbWU6dCxhcmd1bWVudHM6bixkaXJlY3RpdmVzOnIsc2VsZWN0aW9uU2V0Oml9KXtjb25zdCBzPUVlKCIiLGUsIjogIikrdDtsZXQgbz1zK0VlKCIoIixfZShuLCIsICIpLCIpIik7cmV0dXJuIG8ubGVuZ3RoPjgwJiYobz1zK0VlKCIoXG4iLFRlKF9lKG4sIlxuIikpLCJcbikiKSksX2UoW28sX2UociwiICIpLGldLCIgIil9fSxBcmd1bWVudDp7bGVhdmU6KHtuYW1lOmUsdmFsdWU6dH0pPT5lKyI6ICIrdH0sRnJhZ21lbnRTcHJlYWQ6e2xlYXZlOih7bmFtZTplLGRpcmVjdGl2ZXM6dH0pPT4iLi4uIitlK0VlKCIgIixfZSh0LCIgIikpfSxJbmxpbmVGcmFnbWVudDp7bGVhdmU6KHt0eXBlQ29uZGl0aW9uOmUsZGlyZWN0aXZlczp0LHNlbGVjdGlvblNldDpufSk9Pl9lKFsiLi4uIixFZSgib24gIixlKSxfZSh0LCIgIiksbl0sIiAiKX0sRnJhZ21lbnREZWZpbml0aW9uOntsZWF2ZTooe25hbWU6ZSx0eXBlQ29uZGl0aW9uOnQsdmFyaWFibGVEZWZpbml0aW9uczpuLGRpcmVjdGl2ZXM6cixzZWxlY3Rpb25TZXQ6aX0pPT5gZnJhZ21lbnQgJHtlfSR7RWUoIigiLF9lKG4sIiwgIiksIikiKX0gb24gJHt0fSAke0VlKCIiLF9lKHIsIiAiKSwiICIpfWAraX0sSW50VmFsdWU6e2xlYXZlOih7dmFsdWU6ZX0pPT5lfSxGbG9hdFZhbHVlOntsZWF2ZTooe3ZhbHVlOmV9KT0+ZX0sU3RyaW5nVmFsdWU6e2xlYXZlOih7dmFsdWU6ZSxibG9jazp0fSk9PnQ/ZnVuY3Rpb24oZSx0KXtjb25zdCBuPWUucmVwbGFjZSgvIiIiL2csJ1xcIiIiJykscj1uLnNwbGl0KC9cclxufFtcblxyXS9nKSxpPTE9PT1yLmxlbmd0aCxzPXIubGVuZ3RoPjEmJnIuc2xpY2UoMSkuZXZlcnkoKGU9PjA9PT1lLmxlbmd0aHx8RChlLmNoYXJDb2RlQXQoMCkpKSksbz1uLmVuZHNXaXRoKCdcXCIiIicpLGE9ZS5lbmRzV2l0aCgnIicpJiYhbyxjPWUuZW5kc1dpdGgoIlxcIiksbD1hfHxjLHU9IShudWxsIT10JiZ0Lm1pbmltaXplKSYmKCFpfHxlLmxlbmd0aD43MHx8bHx8c3x8byk7bGV0IGQ9IiI7Y29uc3QgcD1pJiZEKGUuY2hhckNvZGVBdCgwKSk7cmV0dXJuKHUmJiFwfHxzKSYmKGQrPSJcbiIpLGQrPW4sKHV8fGwpJiYoZCs9IlxuIiksJyIiIicrZCsnIiIiJ30oZSk6YCIke2UucmVwbGFjZShkZSxwZSl9ImB9LEJvb2xlYW5WYWx1ZTp7bGVhdmU6KHt2YWx1ZTplfSk9PmU/InRydWUiOiJmYWxzZSJ9LE51bGxWYWx1ZTp7bGVhdmU6KCk9PiJudWxsIn0sRW51bVZhbHVlOntsZWF2ZTooe3ZhbHVlOmV9KT0+ZX0sTGlzdFZhbHVlOntsZWF2ZTooe3ZhbHVlczplfSk9PiJbIitfZShlLCIsICIpKyJdIn0sT2JqZWN0VmFsdWU6e2xlYXZlOih7ZmllbGRzOmV9KT0+InsiK19lKGUsIiwgIikrIn0ifSxPYmplY3RGaWVsZDp7bGVhdmU6KHtuYW1lOmUsdmFsdWU6dH0pPT5lKyI6ICIrdH0sRGlyZWN0aXZlOntsZWF2ZTooe25hbWU6ZSxhcmd1bWVudHM6dH0pPT4iQCIrZStFZSgiKCIsX2UodCwiLCAiKSwiKSIpfSxOYW1lZFR5cGU6e2xlYXZlOih7bmFtZTplfSk9PmV9LExpc3RUeXBlOntsZWF2ZTooe3R5cGU6ZX0pPT4iWyIrZSsiXSJ9LE5vbk51bGxUeXBlOntsZWF2ZTooe3R5cGU6ZX0pPT5lKyIhIn0sU2NoZW1hRGVmaW5pdGlvbjp7bGVhdmU6KHtkZXNjcmlwdGlvbjplLGRpcmVjdGl2ZXM6dCxvcGVyYXRpb25UeXBlczpufSk9PkVlKCIiLGUsIlxuIikrX2UoWyJzY2hlbWEiLF9lKHQsIiAiKSxnZShuKV0sIiAiKX0sT3BlcmF0aW9uVHlwZURlZmluaXRpb246e2xlYXZlOih7b3BlcmF0aW9uOmUsdHlwZTp0fSk9PmUrIjogIit0fSxTY2FsYXJUeXBlRGVmaW5pdGlvbjp7bGVhdmU6KHtkZXNjcmlwdGlvbjplLG5hbWU6dCxkaXJlY3RpdmVzOm59KT0+RWUoIiIsZSwiXG4iKStfZShbInNjYWxhciIsdCxfZShuLCIgIildLCIgIil9LE9iamVjdFR5cGVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGludGVyZmFjZXM6bixkaXJlY3RpdmVzOnIsZmllbGRzOml9KT0+RWUoIiIsZSwiXG4iKStfZShbInR5cGUiLHQsRWUoImltcGxlbWVudHMgIixfZShuLCIgJiAiKSksX2UociwiICIpLGdlKGkpXSwiICIpfSxGaWVsZERlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsYXJndW1lbnRzOm4sdHlwZTpyLGRpcmVjdGl2ZXM6aX0pPT5FZSgiIixlLCJcbiIpK3QrKGJlKG4pP0VlKCIoXG4iLFRlKF9lKG4sIlxuIikpLCJcbikiKTpFZSgiKCIsX2UobiwiLCAiKSwiKSIpKSsiOiAiK3IrRWUoIiAiLF9lKGksIiAiKSl9LElucHV0VmFsdWVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LHR5cGU6bixkZWZhdWx0VmFsdWU6cixkaXJlY3RpdmVzOml9KT0+RWUoIiIsZSwiXG4iKStfZShbdCsiOiAiK24sRWUoIj0gIixyKSxfZShpLCIgIildLCIgIil9LEludGVyZmFjZVR5cGVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGludGVyZmFjZXM6bixkaXJlY3RpdmVzOnIsZmllbGRzOml9KT0+RWUoIiIsZSwiXG4iKStfZShbImludGVyZmFjZSIsdCxFZSgiaW1wbGVtZW50cyAiLF9lKG4sIiAmICIpKSxfZShyLCIgIiksZ2UoaSldLCIgIil9LFVuaW9uVHlwZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsZGlyZWN0aXZlczpuLHR5cGVzOnJ9KT0+RWUoIiIsZSwiXG4iKStfZShbInVuaW9uIix0LF9lKG4sIiAiKSxFZSgiPSAiLF9lKHIsIiB8ICIpKV0sIiAiKX0sRW51bVR5cGVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGRpcmVjdGl2ZXM6bix2YWx1ZXM6cn0pPT5FZSgiIixlLCJcbiIpK19lKFsiZW51bSIsdCxfZShuLCIgIiksZ2UocildLCIgIil9LEVudW1WYWx1ZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsZGlyZWN0aXZlczpufSk9PkVlKCIiLGUsIlxuIikrX2UoW3QsX2UobiwiICIpXSwiICIpfSxJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGRpcmVjdGl2ZXM6bixmaWVsZHM6cn0pPT5FZSgiIixlLCJcbiIpK19lKFsiaW5wdXQiLHQsX2UobiwiICIpLGdlKHIpXSwiICIpfSxEaXJlY3RpdmVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGFyZ3VtZW50czpuLHJlcGVhdGFibGU6cixsb2NhdGlvbnM6aX0pPT5FZSgiIixlLCJcbiIpKyJkaXJlY3RpdmUgQCIrdCsoYmUobik/RWUoIihcbiIsVGUoX2UobiwiXG4iKSksIlxuKSIpOkVlKCIoIixfZShuLCIsICIpLCIpIikpKyhyPyIgcmVwZWF0YWJsZSI6IiIpKyIgb24gIitfZShpLCIgfCAiKX0sU2NoZW1hRXh0ZW5zaW9uOntsZWF2ZTooe2RpcmVjdGl2ZXM6ZSxvcGVyYXRpb25UeXBlczp0fSk9Pl9lKFsiZXh0ZW5kIHNjaGVtYSIsX2UoZSwiICIpLGdlKHQpXSwiICIpfSxTY2FsYXJUeXBlRXh0ZW5zaW9uOntsZWF2ZTooe25hbWU6ZSxkaXJlY3RpdmVzOnR9KT0+X2UoWyJleHRlbmQgc2NhbGFyIixlLF9lKHQsIiAiKV0sIiAiKX0sT2JqZWN0VHlwZUV4dGVuc2lvbjp7bGVhdmU6KHtuYW1lOmUsaW50ZXJmYWNlczp0LGRpcmVjdGl2ZXM6bixmaWVsZHM6cn0pPT5fZShbImV4dGVuZCB0eXBlIixlLEVlKCJpbXBsZW1lbnRzICIsX2UodCwiICYgIikpLF9lKG4sIiAiKSxnZShyKV0sIiAiKX0sSW50ZXJmYWNlVHlwZUV4dGVuc2lvbjp7bGVhdmU6KHtuYW1lOmUsaW50ZXJmYWNlczp0LGRpcmVjdGl2ZXM6bixmaWVsZHM6cn0pPT5fZShbImV4dGVuZCBpbnRlcmZhY2UiLGUsRWUoImltcGxlbWVudHMgIixfZSh0LCIgJiAiKSksX2UobiwiICIpLGdlKHIpXSwiICIpfSxVbmlvblR5cGVFeHRlbnNpb246e2xlYXZlOih7bmFtZTplLGRpcmVjdGl2ZXM6dCx0eXBlczpufSk9Pl9lKFsiZXh0ZW5kIHVuaW9uIixlLF9lKHQsIiAiKSxFZSgiPSAiLF9lKG4sIiB8ICIpKV0sIiAiKX0sRW51bVR5cGVFeHRlbnNpb246e2xlYXZlOih7bmFtZTplLGRpcmVjdGl2ZXM6dCx2YWx1ZXM6bn0pPT5fZShbImV4dGVuZCBlbnVtIixlLF9lKHQsIiAiKSxnZShuKV0sIiAiKX0sSW5wdXRPYmplY3RUeXBlRXh0ZW5zaW9uOntsZWF2ZTooe25hbWU6ZSxkaXJlY3RpdmVzOnQsZmllbGRzOm59KT0+X2UoWyJleHRlbmQgaW5wdXQiLGUsX2UodCwiICIpLGdlKG4pXSwiICIpfX07ZnVuY3Rpb24gX2UoZSx0PSIiKXt2YXIgbjtyZXR1cm4gbnVsbCE9PShuPW51bGw9PWU/dm9pZCAwOmUuZmlsdGVyKChlPT5lKSkuam9pbih0KSkmJnZvaWQgMCE9PW4/bjoiIn1mdW5jdGlvbiBnZShlKXtyZXR1cm4gRWUoIntcbiIsVGUoX2UoZSwiXG4iKSksIlxufSIpfWZ1bmN0aW9uIEVlKGUsdCxuPSIiKXtyZXR1cm4gbnVsbCE9dCYmIiIhPT10P2UrdCtuOiIifWZ1bmN0aW9uIFRlKGUpe3JldHVybiBFZSgiICAiLGUucmVwbGFjZSgvXG4vZywiXG4gICIpKX1mdW5jdGlvbiBiZShlKXt2YXIgdDtyZXR1cm4gbnVsbCE9PSh0PW51bGw9PWU/dm9pZCAwOmUuc29tZSgoZT0+ZS5pbmNsdWRlcygiXG4iKSkpKSYmdm9pZCAwIT09dCYmdH12YXIgTmU9bmV3IE1hcCxJZT1uZXcgTWFwLE9lPSEwLEFlPSExO2Z1bmN0aW9uIHhlKGUpe3JldHVybiBlLnJlcGxhY2UoL1tccyxdKy9nLCIgIikudHJpbSgpfWZ1bmN0aW9uIFNlKGUpe3ZhciB0PW5ldyBTZXQsbj1bXTtyZXR1cm4gZS5kZWZpbml0aW9ucy5mb3JFYWNoKChmdW5jdGlvbihlKXtpZigiRnJhZ21lbnREZWZpbml0aW9uIj09PWUua2luZCl7dmFyIHI9ZS5uYW1lLnZhbHVlLGk9eGUoKG89ZS5sb2MpLnNvdXJjZS5ib2R5LnN1YnN0cmluZyhvLnN0YXJ0LG8uZW5kKSkscz1JZS5nZXQocik7cyYmIXMuaGFzKGkpP09lJiZjb25zb2xlLndhcm4oIldhcm5pbmc6IGZyYWdtZW50IHdpdGggbmFtZSAiK3IrIiBhbHJlYWR5IGV4aXN0cy5cbmdyYXBocWwtdGFnIGVuZm9yY2VzIGFsbCBmcmFnbWVudCBuYW1lcyBhY3Jvc3MgeW91ciBhcHBsaWNhdGlvbiB0byBiZSB1bmlxdWU7IHJlYWQgbW9yZSBhYm91dFxudGhpcyBpbiB0aGUgZG9jczogaHR0cDovL2Rldi5hcG9sbG9kYXRhLmNvbS9jb3JlL2ZyYWdtZW50cy5odG1sI3VuaXF1ZS1uYW1lcyIpOnN8fEllLnNldChyLHM9bmV3IFNldCkscy5hZGQoaSksdC5oYXMoaSl8fCh0LmFkZChpKSxuLnB1c2goZSkpfWVsc2Ugbi5wdXNoKGUpO3ZhciBvfSkpLG8obyh7fSxlKSx7ZGVmaW5pdGlvbnM6bn0pfWZ1bmN0aW9uIERlKGUpe3ZhciB0PXhlKGUpO2lmKCFOZS5oYXModCkpe3ZhciBuPWFlKGUse2V4cGVyaW1lbnRhbEZyYWdtZW50VmFyaWFibGVzOkFlLGFsbG93TGVnYWN5RnJhZ21lbnRWYXJpYWJsZXM6QWV9KTtpZighbnx8IkRvY3VtZW50IiE9PW4ua2luZCl0aHJvdyBuZXcgRXJyb3IoIk5vdCBhIHZhbGlkIEdyYXBoUUwgZG9jdW1lbnQuIik7TmUuc2V0KHQsZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IFNldChlLmRlZmluaXRpb25zKTt0LmZvckVhY2goKGZ1bmN0aW9uKGUpe2UubG9jJiZkZWxldGUgZS5sb2MsT2JqZWN0LmtleXMoZSkuZm9yRWFjaCgoZnVuY3Rpb24obil7dmFyIHI9ZVtuXTtyJiYib2JqZWN0Ij09dHlwZW9mIHImJnQuYWRkKHIpfSkpfSkpO3ZhciBuPWUubG9jO3JldHVybiBuJiYoZGVsZXRlIG4uc3RhcnRUb2tlbixkZWxldGUgbi5lbmRUb2tlbiksZX0oU2UobikpKX1yZXR1cm4gTmUuZ2V0KHQpfWZ1bmN0aW9uIHdlKGUpe2Zvcih2YXIgdD1bXSxuPTE7bjxhcmd1bWVudHMubGVuZ3RoO24rKyl0W24tMV09YXJndW1lbnRzW25dOyJzdHJpbmciPT10eXBlb2YgZSYmKGU9W2VdKTt2YXIgcj1lWzBdO3JldHVybiB0LmZvckVhY2goKGZ1bmN0aW9uKHQsbil7dCYmIkRvY3VtZW50Ij09PXQua2luZD9yKz10LmxvYy5zb3VyY2UuYm9keTpyKz10LHIrPWVbbisxXX0pKSxEZShyKX12YXIga2UsQ2U9d2UsUGU9ZnVuY3Rpb24oKXtOZS5jbGVhcigpLEllLmNsZWFyKCl9LFJlPWZ1bmN0aW9uKCl7T2U9ITF9LExlPWZ1bmN0aW9uKCl7QWU9ITB9LEZlPWZ1bmN0aW9uKCl7QWU9ITF9OyhrZT13ZXx8KHdlPXt9KSkuZ3FsPUNlLGtlLnJlc2V0Q2FjaGVzPVBlLGtlLmRpc2FibGVGcmFnbWVudFdhcm5pbmdzPVJlLGtlLmVuYWJsZUV4cGVyaW1lbnRhbEZyYWdtZW50VmFyaWFibGVzPUxlLGtlLmRpc2FibGVFeHBlcmltZW50YWxGcmFnbWVudFZhcmlhYmxlcz1GZSx3ZS5kZWZhdWx0PXdlO2NvbnN0ICRlPXdlYAoJbXV0YXRpb24gUHVzaFBheWxvYWQoCgkJJHNlc3Npb25fc2VjdXJlX2lkOiBTdHJpbmchCgkJJHBheWxvYWRfaWQ6IElEIQoJCSRldmVudHM6IFJlcGxheUV2ZW50c0lucHV0IQoJCSRtZXNzYWdlczogU3RyaW5nIQoJCSRyZXNvdXJjZXM6IFN0cmluZyEKCQkkd2ViX3NvY2tldF9ldmVudHM6IFN0cmluZyEKCQkkZXJyb3JzOiBbRXJyb3JPYmplY3RJbnB1dF0hCgkJJGlzX2JlYWNvbjogQm9vbGVhbgoJCSRoYXNfc2Vzc2lvbl91bmxvYWRlZDogQm9vbGVhbgoJCSRoaWdobGlnaHRfbG9nczogU3RyaW5nCgkpIHsKCQlwdXNoUGF5bG9hZCgKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQlwYXlsb2FkX2lkOiAkcGF5bG9hZF9pZAoJCQlldmVudHM6ICRldmVudHMKCQkJbWVzc2FnZXM6ICRtZXNzYWdlcwoJCQlyZXNvdXJjZXM6ICRyZXNvdXJjZXMKCQkJd2ViX3NvY2tldF9ldmVudHM6ICR3ZWJfc29ja2V0X2V2ZW50cwoJCQllcnJvcnM6ICRlcnJvcnMKCQkJaXNfYmVhY29uOiAkaXNfYmVhY29uCgkJCWhhc19zZXNzaW9uX3VubG9hZGVkOiAkaGFzX3Nlc3Npb25fdW5sb2FkZWQKCQkJaGlnaGxpZ2h0X2xvZ3M6ICRoaWdobGlnaHRfbG9ncwoJCSkKCX0KYCxNZT13ZWAKCW11dGF0aW9uIFB1c2hQYXlsb2FkQ29tcHJlc3NlZCgKCQkkc2Vzc2lvbl9zZWN1cmVfaWQ6IFN0cmluZyEKCQkkcGF5bG9hZF9pZDogSUQhCgkJJGRhdGE6IFN0cmluZyEKCSkgewoJCXB1c2hQYXlsb2FkQ29tcHJlc3NlZCgKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQlwYXlsb2FkX2lkOiAkcGF5bG9hZF9pZAoJCQlkYXRhOiAkZGF0YQoJCSkKCX0KYCxWZT13ZWAKCW11dGF0aW9uIGlkZW50aWZ5U2Vzc2lvbigKCQkkc2Vzc2lvbl9zZWN1cmVfaWQ6IFN0cmluZyEKCQkkdXNlcl9pZGVudGlmaWVyOiBTdHJpbmchCgkJJHVzZXJfb2JqZWN0OiBBbnkKCSkgewoJCWlkZW50aWZ5U2Vzc2lvbigKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQl1c2VyX2lkZW50aWZpZXI6ICR1c2VyX2lkZW50aWZpZXIKCQkJdXNlcl9vYmplY3Q6ICR1c2VyX29iamVjdAoJCSkKCX0KYCxCZT13ZWAKCW11dGF0aW9uIGFkZFNlc3Npb25Qcm9wZXJ0aWVzKAoJCSRzZXNzaW9uX3NlY3VyZV9pZDogU3RyaW5nIQoJCSRwcm9wZXJ0aWVzX29iamVjdDogQW55CgkpIHsKCQlhZGRTZXNzaW9uUHJvcGVydGllcygKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQlwcm9wZXJ0aWVzX29iamVjdDogJHByb3BlcnRpZXNfb2JqZWN0CgkJKQoJfQpgLGplPXdlYAoJbXV0YXRpb24gcHVzaE1ldHJpY3MoJG1ldHJpY3M6IFtNZXRyaWNJbnB1dF0hKSB7CgkJcHVzaE1ldHJpY3MobWV0cmljczogJG1ldHJpY3MpCgl9CmAsVWU9d2VgCgltdXRhdGlvbiBhZGRTZXNzaW9uRmVlZGJhY2soCgkJJHNlc3Npb25fc2VjdXJlX2lkOiBTdHJpbmchCgkJJHVzZXJfbmFtZTogU3RyaW5nCgkJJHVzZXJfZW1haWw6IFN0cmluZwoJCSR2ZXJiYXRpbTogU3RyaW5nIQoJCSR0aW1lc3RhbXA6IFRpbWVzdGFtcCEKCSkgewoJCWFkZFNlc3Npb25GZWVkYmFjaygKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQl1c2VyX25hbWU6ICR1c2VyX25hbWUKCQkJdXNlcl9lbWFpbDogJHVzZXJfZW1haWwKCQkJdmVyYmF0aW06ICR2ZXJiYXRpbQoJCQl0aW1lc3RhbXA6ICR0aW1lc3RhbXAKCQkpCgl9CmAscWU9d2VgCgltdXRhdGlvbiBpbml0aWFsaXplU2Vzc2lvbigKCQkkc2Vzc2lvbl9zZWN1cmVfaWQ6IFN0cmluZyEKCQkkb3JnYW5pemF0aW9uX3ZlcmJvc2VfaWQ6IFN0cmluZyEKCQkkZW5hYmxlX3N0cmljdF9wcml2YWN5OiBCb29sZWFuIQoJCSRwcml2YWN5X3NldHRpbmc6IFN0cmluZyEKCQkkZW5hYmxlX3JlY29yZGluZ19uZXR3b3JrX2NvbnRlbnRzOiBCb29sZWFuIQoJCSRjbGllbnRWZXJzaW9uOiBTdHJpbmchCgkJJGZpcnN0bG9hZFZlcnNpb246IFN0cmluZyEKCQkkY2xpZW50Q29uZmlnOiBTdHJpbmchCgkJJGVudmlyb25tZW50OiBTdHJpbmchCgkJJGlkOiBTdHJpbmchCgkJJGFwcFZlcnNpb246IFN0cmluZwoJCSRzZXJ2aWNlTmFtZTogU3RyaW5nIQoJCSRjbGllbnRfaWQ6IFN0cmluZyEKCQkkbmV0d29ya19yZWNvcmRpbmdfZG9tYWluczogW1N0cmluZyFdCgkJJGRpc2FibGVfc2Vzc2lvbl9yZWNvcmRpbmc6IEJvb2xlYW4KCSkgewoJCWluaXRpYWxpemVTZXNzaW9uKAoJCQlzZXNzaW9uX3NlY3VyZV9pZDogJHNlc3Npb25fc2VjdXJlX2lkCgkJCW9yZ2FuaXphdGlvbl92ZXJib3NlX2lkOiAkb3JnYW5pemF0aW9uX3ZlcmJvc2VfaWQKCQkJZW5hYmxlX3N0cmljdF9wcml2YWN5OiAkZW5hYmxlX3N0cmljdF9wcml2YWN5CgkJCWVuYWJsZV9yZWNvcmRpbmdfbmV0d29ya19jb250ZW50czogJGVuYWJsZV9yZWNvcmRpbmdfbmV0d29ya19jb250ZW50cwoJCQljbGllbnRWZXJzaW9uOiAkY2xpZW50VmVyc2lvbgoJCQlmaXJzdGxvYWRWZXJzaW9uOiAkZmlyc3Rsb2FkVmVyc2lvbgoJCQljbGllbnRDb25maWc6ICRjbGllbnRDb25maWcKCQkJZW52aXJvbm1lbnQ6ICRlbnZpcm9ubWVudAoJCQlhcHBWZXJzaW9uOiAkYXBwVmVyc2lvbgoJCQlzZXJ2aWNlTmFtZTogJHNlcnZpY2VOYW1lCgkJCWZpbmdlcnByaW50OiAkaWQKCQkJY2xpZW50X2lkOiAkY2xpZW50X2lkCgkJCW5ldHdvcmtfcmVjb3JkaW5nX2RvbWFpbnM6ICRuZXR3b3JrX3JlY29yZGluZ19kb21haW5zCgkJCWRpc2FibGVfc2Vzc2lvbl9yZWNvcmRpbmc6ICRkaXNhYmxlX3Nlc3Npb25fcmVjb3JkaW5nCgkJCXByaXZhY3lfc2V0dGluZzogJHByaXZhY3lfc2V0dGluZwoJCSkgewoJCQlzZWN1cmVfaWQKCQkJcHJvamVjdF9pZAoJCX0KCX0KYCxLZT13ZWAKCXF1ZXJ5IElnbm9yZSgkaWQ6IElEISkgewoJCWlnbm9yZShpZDogJGlkKQoJfQpgLEdlPShlLHQsbixyKT0+ZSgpO2NvbnN0IHplPUpTT04sWWU9ZT0+e3ZhciB0LG47bGV0IHI7Y29uc3QgaT1lLmRlZmluaXRpb25zLmZpbHRlcigoZT0+Ik9wZXJhdGlvbkRlZmluaXRpb24iPT09ZS5raW5kKSk7cmV0dXJuIDE9PT1pLmxlbmd0aCYmKHI9bnVsbD09KG49bnVsbD09KHQ9aVswXSk/dm9pZCAwOnQubmFtZSk/dm9pZCAwOm4udmFsdWUpLHJ9LEhlPWU9PntpZigic3RyaW5nIj09dHlwZW9mIGUpe2xldCB0O3RyeXtjb25zdCBuPWFlKGUpO3Q9WWUobil9Y2F0Y2gobil7fXJldHVybntxdWVyeTplLG9wZXJhdGlvbk5hbWU6dH19Y29uc3QgdD1ZZShlKTtyZXR1cm57cXVlcnk6bWUoZSksb3BlcmF0aW9uTmFtZTp0fX07Y2xhc3MgSmUgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihlLHQpe3N1cGVyKGAke0plLmV4dHJhY3RNZXNzYWdlKGUpfTogJHtKU09OLnN0cmluZ2lmeSh7cmVzcG9uc2U6ZSxyZXF1ZXN0OnR9KX1gKSxPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcyxKZS5wcm90b3R5cGUpLHRoaXMucmVzcG9uc2U9ZSx0aGlzLnJlcXVlc3Q9dCwiZnVuY3Rpb24iPT10eXBlb2YgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UmJkVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsSmUpfXN0YXRpYyBleHRyYWN0TWVzc2FnZShlKXt2YXIgdCxuLHI7cmV0dXJuIG51bGwhPShyPW51bGw9PShuPW51bGw9PSh0PWUuZXJyb3JzKT92b2lkIDA6dFswXSk/dm9pZCAwOm4ubWVzc2FnZSk/cjpgR3JhcGhRTCBFcnJvciAoQ29kZTogJHtlLnN0YXR1c30pYH19dmFyIFFlPXtleHBvcnRzOnt9fTshZnVuY3Rpb24oZSx0KXt2YXIgcixpPSJ1bmRlZmluZWQiIT10eXBlb2Ygc2VsZj9zZWxmOm4scz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXt0aGlzLmZldGNoPSExLHRoaXMuRE9NRXhjZXB0aW9uPWkuRE9NRXhjZXB0aW9ufXJldHVybiBlLnByb3RvdHlwZT1pLG5ldyBlfSgpO3I9cyxmdW5jdGlvbihlKXt2YXIgdD0iVVJMU2VhcmNoUGFyYW1zImluIHIsbj0iU3ltYm9sImluIHImJiJpdGVyYXRvciJpbiBTeW1ib2wsaT0iRmlsZVJlYWRlciJpbiByJiYiQmxvYiJpbiByJiZmdW5jdGlvbigpe3RyeXtyZXR1cm4gbmV3IEJsb2IsITB9Y2F0Y2goZSl7cmV0dXJuITF9fSgpLHM9IkZvcm1EYXRhImluIHIsbz0iQXJyYXlCdWZmZXIiaW4gcjtpZihvKXZhciBhPVsiW29iamVjdCBJbnQ4QXJyYXldIiwiW29iamVjdCBVaW50OEFycmF5XSIsIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldIiwiW29iamVjdCBJbnQxNkFycmF5XSIsIltvYmplY3QgVWludDE2QXJyYXldIiwiW29iamVjdCBJbnQzMkFycmF5XSIsIltvYmplY3QgVWludDMyQXJyYXldIiwiW29iamVjdCBGbG9hdDMyQXJyYXldIiwiW29iamVjdCBGbG9hdDY0QXJyYXldIl0sYz1BcnJheUJ1ZmZlci5pc1ZpZXd8fGZ1bmN0aW9uKGUpe3JldHVybiBlJiZhLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpKT4tMX07ZnVuY3Rpb24gbChlKXtpZigic3RyaW5nIiE9dHlwZW9mIGUmJihlPVN0cmluZyhlKSksL1teYS16MC05XC0jJCUmJyorLl5fYHx+XS9pLnRlc3QoZSkpdGhyb3cgbmV3IFR5cGVFcnJvcigiSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUiKTtyZXR1cm4gZS50b0xvd2VyQ2FzZSgpfWZ1bmN0aW9uIHUoZSl7cmV0dXJuInN0cmluZyIhPXR5cGVvZiBlJiYoZT1TdHJpbmcoZSkpLGV9ZnVuY3Rpb24gZChlKXt2YXIgdD17bmV4dDpmdW5jdGlvbigpe3ZhciB0PWUuc2hpZnQoKTtyZXR1cm57ZG9uZTp2b2lkIDA9PT10LHZhbHVlOnR9fX07cmV0dXJuIG4mJih0W1N5bWJvbC5pdGVyYXRvcl09ZnVuY3Rpb24oKXtyZXR1cm4gdH0pLHR9ZnVuY3Rpb24gcChlKXt0aGlzLm1hcD17fSxlIGluc3RhbmNlb2YgcD9lLmZvckVhY2goKGZ1bmN0aW9uKGUsdCl7dGhpcy5hcHBlbmQodCxlKX0pLHRoaXMpOkFycmF5LmlzQXJyYXkoZSk/ZS5mb3JFYWNoKChmdW5jdGlvbihlKXt0aGlzLmFwcGVuZChlWzBdLGVbMV0pfSksdGhpcyk6ZSYmT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZSkuZm9yRWFjaCgoZnVuY3Rpb24odCl7dGhpcy5hcHBlbmQodCxlW3RdKX0pLHRoaXMpfWZ1bmN0aW9uIGgoZSl7aWYoZS5ib2R5VXNlZClyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcigiQWxyZWFkeSByZWFkIikpO2UuYm9keVVzZWQ9ITB9ZnVuY3Rpb24gZihlKXtyZXR1cm4gbmV3IFByb21pc2UoKGZ1bmN0aW9uKHQsbil7ZS5vbmxvYWQ9ZnVuY3Rpb24oKXt0KGUucmVzdWx0KX0sZS5vbmVycm9yPWZ1bmN0aW9uKCl7bihlLmVycm9yKX19KSl9ZnVuY3Rpb24geShlKXt2YXIgdD1uZXcgRmlsZVJlYWRlcixuPWYodCk7cmV0dXJuIHQucmVhZEFzQXJyYXlCdWZmZXIoZSksbn1mdW5jdGlvbiBtKGUpe2lmKGUuc2xpY2UpcmV0dXJuIGUuc2xpY2UoMCk7dmFyIHQ9bmV3IFVpbnQ4QXJyYXkoZS5ieXRlTGVuZ3RoKTtyZXR1cm4gdC5zZXQobmV3IFVpbnQ4QXJyYXkoZSkpLHQuYnVmZmVyfWZ1bmN0aW9uIHYoKXtyZXR1cm4gdGhpcy5ib2R5VXNlZD0hMSx0aGlzLl9pbml0Qm9keT1mdW5jdGlvbihlKXt2YXIgbjt0aGlzLl9ib2R5SW5pdD1lLGU/InN0cmluZyI9PXR5cGVvZiBlP3RoaXMuX2JvZHlUZXh0PWU6aSYmQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihlKT90aGlzLl9ib2R5QmxvYj1lOnMmJkZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGUpP3RoaXMuX2JvZHlGb3JtRGF0YT1lOnQmJlVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihlKT90aGlzLl9ib2R5VGV4dD1lLnRvU3RyaW5nKCk6byYmaSYmKG49ZSkmJkRhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG4pPyh0aGlzLl9ib2R5QXJyYXlCdWZmZXI9bShlLmJ1ZmZlciksdGhpcy5fYm9keUluaXQ9bmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKTpvJiYoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoZSl8fGMoZSkpP3RoaXMuX2JvZHlBcnJheUJ1ZmZlcj1tKGUpOnRoaXMuX2JvZHlUZXh0PWU9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpOnRoaXMuX2JvZHlUZXh0PSIiLHRoaXMuaGVhZGVycy5nZXQoImNvbnRlbnQtdHlwZSIpfHwoInN0cmluZyI9PXR5cGVvZiBlP3RoaXMuaGVhZGVycy5zZXQoImNvbnRlbnQtdHlwZSIsInRleHQvcGxhaW47Y2hhcnNldD1VVEYtOCIpOnRoaXMuX2JvZHlCbG9iJiZ0aGlzLl9ib2R5QmxvYi50eXBlP3RoaXMuaGVhZGVycy5zZXQoImNvbnRlbnQtdHlwZSIsdGhpcy5fYm9keUJsb2IudHlwZSk6dCYmVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGUpJiZ0aGlzLmhlYWRlcnMuc2V0KCJjb250ZW50LXR5cGUiLCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCIpKX0saSYmKHRoaXMuYmxvYj1mdW5jdGlvbigpe3ZhciBlPWgodGhpcyk7aWYoZSlyZXR1cm4gZTtpZih0aGlzLl9ib2R5QmxvYilyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKTtpZih0aGlzLl9ib2R5QXJyYXlCdWZmZXIpcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpO2lmKHRoaXMuX2JvZHlGb3JtRGF0YSl0aHJvdyBuZXcgRXJyb3IoImNvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYiIpO3JldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpfSx0aGlzLmFycmF5QnVmZmVyPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2JvZHlBcnJheUJ1ZmZlcj9oKHRoaXMpfHxQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKTp0aGlzLmJsb2IoKS50aGVuKHkpfSksdGhpcy50ZXh0PWZ1bmN0aW9uKCl7dmFyIGUsdCxuLHI9aCh0aGlzKTtpZihyKXJldHVybiByO2lmKHRoaXMuX2JvZHlCbG9iKXJldHVybiBlPXRoaXMuX2JvZHlCbG9iLHQ9bmV3IEZpbGVSZWFkZXIsbj1mKHQpLHQucmVhZEFzVGV4dChlKSxuO2lmKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1uZXcgVWludDhBcnJheShlKSxuPW5ldyBBcnJheSh0Lmxlbmd0aCkscj0wO3I8dC5sZW5ndGg7cisrKW5bcl09U3RyaW5nLmZyb21DaGFyQ29kZSh0W3JdKTtyZXR1cm4gbi5qb2luKCIiKX0odGhpcy5fYm9keUFycmF5QnVmZmVyKSk7aWYodGhpcy5fYm9keUZvcm1EYXRhKXRocm93IG5ldyBFcnJvcigiY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0Iik7cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dCl9LHMmJih0aGlzLmZvcm1EYXRhPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oRSl9KSx0aGlzLmpzb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKX0sdGhpc31wLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oZSx0KXtlPWwoZSksdD11KHQpO3ZhciBuPXRoaXMubWFwW2VdO3RoaXMubWFwW2VdPW4/bisiLCAiK3Q6dH0scC5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKGUpe2RlbGV0ZSB0aGlzLm1hcFtsKGUpXX0scC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiBlPWwoZSksdGhpcy5oYXMoZSk/dGhpcy5tYXBbZV06bnVsbH0scC5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShsKGUpKX0scC5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGUsdCl7dGhpcy5tYXBbbChlKV09dSh0KX0scC5wcm90b3R5cGUuZm9yRWFjaD1mdW5jdGlvbihlLHQpe2Zvcih2YXIgbiBpbiB0aGlzLm1hcCl0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuKSYmZS5jYWxsKHQsdGhpcy5tYXBbbl0sbix0aGlzKX0scC5wcm90b3R5cGUua2V5cz1mdW5jdGlvbigpe3ZhciBlPVtdO3JldHVybiB0aGlzLmZvckVhY2goKGZ1bmN0aW9uKHQsbil7ZS5wdXNoKG4pfSkpLGQoZSl9LHAucHJvdG90eXBlLnZhbHVlcz1mdW5jdGlvbigpe3ZhciBlPVtdO3JldHVybiB0aGlzLmZvckVhY2goKGZ1bmN0aW9uKHQpe2UucHVzaCh0KX0pKSxkKGUpfSxwLnByb3RvdHlwZS5lbnRyaWVzPWZ1bmN0aW9uKCl7dmFyIGU9W107cmV0dXJuIHRoaXMuZm9yRWFjaCgoZnVuY3Rpb24odCxuKXtlLnB1c2goW24sdF0pfSkpLGQoZSl9LG4mJihwLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdPXAucHJvdG90eXBlLmVudHJpZXMpO3ZhciBfPVsiREVMRVRFIiwiR0VUIiwiSEVBRCIsIk9QVElPTlMiLCJQT1NUIiwiUFVUIl07ZnVuY3Rpb24gZyhlLHQpe3ZhciBuLHIsaT0odD10fHx7fSkuYm9keTtpZihlIGluc3RhbmNlb2YgZyl7aWYoZS5ib2R5VXNlZCl0aHJvdyBuZXcgVHlwZUVycm9yKCJBbHJlYWR5IHJlYWQiKTt0aGlzLnVybD1lLnVybCx0aGlzLmNyZWRlbnRpYWxzPWUuY3JlZGVudGlhbHMsdC5oZWFkZXJzfHwodGhpcy5oZWFkZXJzPW5ldyBwKGUuaGVhZGVycykpLHRoaXMubWV0aG9kPWUubWV0aG9kLHRoaXMubW9kZT1lLm1vZGUsdGhpcy5zaWduYWw9ZS5zaWduYWwsaXx8bnVsbD09ZS5fYm9keUluaXR8fChpPWUuX2JvZHlJbml0LGUuYm9keVVzZWQ9ITApfWVsc2UgdGhpcy51cmw9U3RyaW5nKGUpO2lmKHRoaXMuY3JlZGVudGlhbHM9dC5jcmVkZW50aWFsc3x8dGhpcy5jcmVkZW50aWFsc3x8InNhbWUtb3JpZ2luIiwhdC5oZWFkZXJzJiZ0aGlzLmhlYWRlcnN8fCh0aGlzLmhlYWRlcnM9bmV3IHAodC5oZWFkZXJzKSksdGhpcy5tZXRob2Q9KG49dC5tZXRob2R8fHRoaXMubWV0aG9kfHwiR0VUIixyPW4udG9VcHBlckNhc2UoKSxfLmluZGV4T2Yocik+LTE/cjpuKSx0aGlzLm1vZGU9dC5tb2RlfHx0aGlzLm1vZGV8fG51bGwsdGhpcy5zaWduYWw9dC5zaWduYWx8fHRoaXMuc2lnbmFsLHRoaXMucmVmZXJyZXI9bnVsbCwoIkdFVCI9PT10aGlzLm1ldGhvZHx8IkhFQUQiPT09dGhpcy5tZXRob2QpJiZpKXRocm93IG5ldyBUeXBlRXJyb3IoIkJvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzIik7dGhpcy5faW5pdEJvZHkoaSl9ZnVuY3Rpb24gRShlKXt2YXIgdD1uZXcgRm9ybURhdGE7cmV0dXJuIGUudHJpbSgpLnNwbGl0KCImIikuZm9yRWFjaCgoZnVuY3Rpb24oZSl7aWYoZSl7dmFyIG49ZS5zcGxpdCgiPSIpLHI9bi5zaGlmdCgpLnJlcGxhY2UoL1wrL2csIiAiKSxpPW4uam9pbigiPSIpLnJlcGxhY2UoL1wrL2csIiAiKTt0LmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQociksZGVjb2RlVVJJQ29tcG9uZW50KGkpKX19KSksdH1mdW5jdGlvbiBUKGUsdCl7dHx8KHQ9e30pLHRoaXMudHlwZT0iZGVmYXVsdCIsdGhpcy5zdGF0dXM9dm9pZCAwPT09dC5zdGF0dXM/MjAwOnQuc3RhdHVzLHRoaXMub2s9dGhpcy5zdGF0dXM+PTIwMCYmdGhpcy5zdGF0dXM8MzAwLHRoaXMuc3RhdHVzVGV4dD0ic3RhdHVzVGV4dCJpbiB0P3Quc3RhdHVzVGV4dDoiT0siLHRoaXMuaGVhZGVycz1uZXcgcCh0LmhlYWRlcnMpLHRoaXMudXJsPXQudXJsfHwiIix0aGlzLl9pbml0Qm9keShlKX1nLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3JldHVybiBuZXcgZyh0aGlzLHtib2R5OnRoaXMuX2JvZHlJbml0fSl9LHYuY2FsbChnLnByb3RvdHlwZSksdi5jYWxsKFQucHJvdG90eXBlKSxULnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3JldHVybiBuZXcgVCh0aGlzLl9ib2R5SW5pdCx7c3RhdHVzOnRoaXMuc3RhdHVzLHN0YXR1c1RleHQ6dGhpcy5zdGF0dXNUZXh0LGhlYWRlcnM6bmV3IHAodGhpcy5oZWFkZXJzKSx1cmw6dGhpcy51cmx9KX0sVC5lcnJvcj1mdW5jdGlvbigpe3ZhciBlPW5ldyBUKG51bGwse3N0YXR1czowLHN0YXR1c1RleHQ6IiJ9KTtyZXR1cm4gZS50eXBlPSJlcnJvciIsZX07dmFyIGI9WzMwMSwzMDIsMzAzLDMwNywzMDhdO1QucmVkaXJlY3Q9ZnVuY3Rpb24oZSx0KXtpZigtMT09PWIuaW5kZXhPZih0KSl0aHJvdyBuZXcgUmFuZ2VFcnJvcigiSW52YWxpZCBzdGF0dXMgY29kZSIpO3JldHVybiBuZXcgVChudWxsLHtzdGF0dXM6dCxoZWFkZXJzOntsb2NhdGlvbjplfX0pfSxlLkRPTUV4Y2VwdGlvbj1yLkRPTUV4Y2VwdGlvbjt0cnl7bmV3IGUuRE9NRXhjZXB0aW9ufWNhdGNoKEkpe2UuRE9NRXhjZXB0aW9uPWZ1bmN0aW9uKGUsdCl7dGhpcy5tZXNzYWdlPWUsdGhpcy5uYW1lPXQ7dmFyIG49RXJyb3IoZSk7dGhpcy5zdGFjaz1uLnN0YWNrfSxlLkRPTUV4Y2VwdGlvbi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpLGUuRE9NRXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1lLkRPTUV4Y2VwdGlvbn1mdW5jdGlvbiBOKHQsbil7cmV0dXJuIG5ldyBQcm9taXNlKChmdW5jdGlvbihyLHMpe3ZhciBvPW5ldyBnKHQsbik7aWYoby5zaWduYWwmJm8uc2lnbmFsLmFib3J0ZWQpcmV0dXJuIHMobmV3IGUuRE9NRXhjZXB0aW9uKCJBYm9ydGVkIiwiQWJvcnRFcnJvciIpKTt2YXIgYT1uZXcgWE1MSHR0cFJlcXVlc3Q7ZnVuY3Rpb24gYygpe2EuYWJvcnQoKX1hLm9ubG9hZD1mdW5jdGlvbigpe3ZhciBlLHQsbj17c3RhdHVzOmEuc3RhdHVzLHN0YXR1c1RleHQ6YS5zdGF0dXNUZXh0LGhlYWRlcnM6KGU9YS5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKXx8IiIsdD1uZXcgcCxlLnJlcGxhY2UoL1xyP1xuW1x0IF0rL2csIiAiKS5zcGxpdCgvXHI/XG4vKS5mb3JFYWNoKChmdW5jdGlvbihlKXt2YXIgbj1lLnNwbGl0KCI6Iikscj1uLnNoaWZ0KCkudHJpbSgpO2lmKHIpe3ZhciBpPW4uam9pbigiOiIpLnRyaW0oKTt0LmFwcGVuZChyLGkpfX0pKSx0KX07bi51cmw9InJlc3BvbnNlVVJMImluIGE/YS5yZXNwb25zZVVSTDpuLmhlYWRlcnMuZ2V0KCJYLVJlcXVlc3QtVVJMIik7dmFyIGk9InJlc3BvbnNlImluIGE/YS5yZXNwb25zZTphLnJlc3BvbnNlVGV4dDtyKG5ldyBUKGksbikpfSxhLm9uZXJyb3I9ZnVuY3Rpb24oKXtzKG5ldyBUeXBlRXJyb3IoIk5ldHdvcmsgcmVxdWVzdCBmYWlsZWQiKSl9LGEub250aW1lb3V0PWZ1bmN0aW9uKCl7cyhuZXcgVHlwZUVycm9yKCJOZXR3b3JrIHJlcXVlc3QgZmFpbGVkIikpfSxhLm9uYWJvcnQ9ZnVuY3Rpb24oKXtzKG5ldyBlLkRPTUV4Y2VwdGlvbigiQWJvcnRlZCIsIkFib3J0RXJyb3IiKSl9LGEub3BlbihvLm1ldGhvZCxvLnVybCwhMCksImluY2x1ZGUiPT09by5jcmVkZW50aWFscz9hLndpdGhDcmVkZW50aWFscz0hMDoib21pdCI9PT1vLmNyZWRlbnRpYWxzJiYoYS53aXRoQ3JlZGVudGlhbHM9ITEpLCJyZXNwb25zZVR5cGUiaW4gYSYmaSYmKGEucmVzcG9uc2VUeXBlPSJibG9iIiksby5oZWFkZXJzLmZvckVhY2goKGZ1bmN0aW9uKGUsdCl7YS5zZXRSZXF1ZXN0SGVhZGVyKHQsZSl9KSksby5zaWduYWwmJihvLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCJhYm9ydCIsYyksYS5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXs0PT09YS5yZWFkeVN0YXRlJiZvLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCJhYm9ydCIsYyl9KSxhLnNlbmQodm9pZCAwPT09by5fYm9keUluaXQ/bnVsbDpvLl9ib2R5SW5pdCl9KSl9Ti5wb2x5ZmlsbD0hMCxyLmZldGNofHwoci5mZXRjaD1OLHIuSGVhZGVycz1wLHIuUmVxdWVzdD1nLHIuUmVzcG9uc2U9VCksZS5IZWFkZXJzPXAsZS5SZXF1ZXN0PWcsZS5SZXNwb25zZT1ULGUuZmV0Y2g9TixPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwiX19lc01vZHVsZSIse3ZhbHVlOiEwfSl9KHt9KSxzLmZldGNoLnBvbnlmaWxsPSEwLGRlbGV0ZSBzLmZldGNoLnBvbHlmaWxsO3ZhciBvPXM7KHQ9by5mZXRjaCkuZGVmYXVsdD1vLmZldGNoLHQuZmV0Y2g9by5mZXRjaCx0LkhlYWRlcnM9by5IZWFkZXJzLHQuUmVxdWVzdD1vLlJlcXVlc3QsdC5SZXNwb25zZT1vLlJlc3BvbnNlLGUuZXhwb3J0cz10fShRZSxRZS5leHBvcnRzKTt2YXIgWGU9UWUuZXhwb3J0cyxXZT1yKFhlKSxaZT1lKHtfX3Byb3RvX186bnVsbCxkZWZhdWx0OldlfSxbWGVdKTtjb25zdCBldD1lPT57bGV0IHQ9e307cmV0dXJuIGUmJigidW5kZWZpbmVkIiE9dHlwZW9mIEhlYWRlcnMmJmUgaW5zdGFuY2VvZiBIZWFkZXJzfHxaZSYmWGUuSGVhZGVycyYmZSBpbnN0YW5jZW9mIFhlLkhlYWRlcnM/dD0oZT0+e2NvbnN0IHQ9e307cmV0dXJuIGUuZm9yRWFjaCgoKGUsbik9Pnt0W25dPWV9KSksdH0pKGUpOkFycmF5LmlzQXJyYXkoZSk/ZS5mb3JFYWNoKCgoW2Usbl0pPT57ZSYmdm9pZCAwIT09biYmKHRbZV09bil9KSk6dD1lKSx0fSx0dD1lPT5lLnJlcGxhY2UoLyhbXHMsXXwjW15cblxyXSspKy9nLCIgIikudHJpbSgpLG50PWU9PnQ9Pl9fYXN5bmModGhpcyxudWxsLChmdW5jdGlvbiooKXt2YXIgbjtjb25zdHt1cmw6cixxdWVyeTppLHZhcmlhYmxlczpzLG9wZXJhdGlvbk5hbWU6byxmZXRjaDphLGZldGNoT3B0aW9uczpjLG1pZGRsZXdhcmU6bH09dCx1PV9fc3ByZWFkVmFsdWVzKHt9LHQuaGVhZGVycyk7bGV0IGQscD0iIjsiUE9TVCI9PT1lPyhkPXN0KGkscyxvLGMuanNvblNlcmlhbGl6ZXIpLCJzdHJpbmciPT10eXBlb2YgZCYmKHVbIkNvbnRlbnQtVHlwZSJdPSJhcHBsaWNhdGlvbi9qc29uIikpOnA9KGU9PntpZighQXJyYXkuaXNBcnJheShlLnF1ZXJ5KSl7Y29uc3QgdD1lLG49W2BxdWVyeT0ke2VuY29kZVVSSUNvbXBvbmVudCh0dCh0LnF1ZXJ5KSl9YF07cmV0dXJuIGUudmFyaWFibGVzJiZuLnB1c2goYHZhcmlhYmxlcz0ke2VuY29kZVVSSUNvbXBvbmVudCh0Lmpzb25TZXJpYWxpemVyLnN0cmluZ2lmeSh0LnZhcmlhYmxlcykpfWApLHQub3BlcmF0aW9uTmFtZSYmbi5wdXNoKGBvcGVyYXRpb25OYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHQub3BlcmF0aW9uTmFtZSl9YCksbi5qb2luKCImIil9aWYodm9pZCAwIT09ZS52YXJpYWJsZXMmJiFBcnJheS5pc0FycmF5KGUudmFyaWFibGVzKSl0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBjcmVhdGUgcXVlcnkgd2l0aCBnaXZlbiB2YXJpYWJsZSB0eXBlLCBhcnJheSBleHBlY3RlZCIpO2NvbnN0IHQ9ZSxuPWUucXVlcnkucmVkdWNlKCgoZSxuLHIpPT4oZS5wdXNoKHtxdWVyeTp0dChuKSx2YXJpYWJsZXM6dC52YXJpYWJsZXM/dC5qc29uU2VyaWFsaXplci5zdHJpbmdpZnkodC52YXJpYWJsZXNbcl0pOnZvaWQgMH0pLGUpKSxbXSk7cmV0dXJuYHF1ZXJ5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHQuanNvblNlcmlhbGl6ZXIuc3RyaW5naWZ5KG4pKX1gfSkoe3F1ZXJ5OmksdmFyaWFibGVzOnMsb3BlcmF0aW9uTmFtZTpvLGpzb25TZXJpYWxpemVyOm51bGwhPShuPWMuanNvblNlcmlhbGl6ZXIpP246emV9KTtjb25zdCBoPV9fc3ByZWFkVmFsdWVzKHttZXRob2Q6ZSxoZWFkZXJzOnUsYm9keTpkfSxjKTtsZXQgZj1yLHk9aDtpZihsKXtjb25zdCBlPXlpZWxkIFByb21pc2UucmVzb2x2ZShsKF9fc3ByZWFkUHJvcHMoX19zcHJlYWRWYWx1ZXMoe30saCkse3VybDpyLG9wZXJhdGlvbk5hbWU6byx2YXJpYWJsZXM6c30pKSkse3VybDp0fT1lO2Y9dCx5PV9fb2JqUmVzdChlLFsidXJsIl0pfXJldHVybiBwJiYoZj1gJHtmfT8ke3B9YCkseWllbGQgYShmLHkpfSkpO2NsYXNzIHJ0e2NvbnN0cnVjdG9yKGUsdD17fSl7dGhpcy51cmw9ZSx0aGlzLnJlcXVlc3RDb25maWc9dCx0aGlzLnJhd1JlcXVlc3Q9KC4uLmUpPT5fX2FzeW5jKHRoaXMsbnVsbCwoZnVuY3Rpb24qKCl7Y29uc3RbdCxuLHJdPWUsaT0oKGUsdCxuKT0+ZS5xdWVyeT9lOntxdWVyeTplLHZhcmlhYmxlczp0LHJlcXVlc3RIZWFkZXJzOm4sc2lnbmFsOnZvaWQgMH0pKHQsbixyKSxzPXRoaXMucmVxdWVzdENvbmZpZyx7aGVhZGVyczpvLGZldGNoOmE9V2UsbWV0aG9kOmM9IlBPU1QiLHJlcXVlc3RNaWRkbGV3YXJlOmwscmVzcG9uc2VNaWRkbGV3YXJlOnV9PXMsZD1fX29ialJlc3QocyxbImhlYWRlcnMiLCJmZXRjaCIsIm1ldGhvZCIsInJlcXVlc3RNaWRkbGV3YXJlIiwicmVzcG9uc2VNaWRkbGV3YXJlIl0pLHt1cmw6cH09dGhpczt2b2lkIDAhPT1pLnNpZ25hbCYmKGQuc2lnbmFsPWkuc2lnbmFsKTtjb25zdHtvcGVyYXRpb25OYW1lOmh9PUhlKGkucXVlcnkpO3JldHVybiBpdCh7dXJsOnAscXVlcnk6aS5xdWVyeSx2YXJpYWJsZXM6aS52YXJpYWJsZXMsaGVhZGVyczpfX3NwcmVhZFZhbHVlcyhfX3NwcmVhZFZhbHVlcyh7fSxldChhdChvKSkpLGV0KGkucmVxdWVzdEhlYWRlcnMpKSxvcGVyYXRpb25OYW1lOmgsZmV0Y2g6YSxtZXRob2Q6YyxmZXRjaE9wdGlvbnM6ZCxtaWRkbGV3YXJlOmx9KS50aGVuKChlPT4odSYmdShlKSxlKSkpLmNhdGNoKChlPT57dGhyb3cgdSYmdShlKSxlfSkpfSkpfXJlcXVlc3QoZSwuLi50KXtyZXR1cm4gX19hc3luYyh0aGlzLG51bGwsKGZ1bmN0aW9uKigpe2NvbnN0W24scl09dCxpPSgoZSx0LG4pPT5lLmRvY3VtZW50P2U6e2RvY3VtZW50OmUsdmFyaWFibGVzOnQscmVxdWVzdEhlYWRlcnM6bixzaWduYWw6dm9pZCAwfSkoZSxuLHIpLHM9dGhpcy5yZXF1ZXN0Q29uZmlnLHtoZWFkZXJzOm8sZmV0Y2g6YT1XZSxtZXRob2Q6Yz0iUE9TVCIscmVxdWVzdE1pZGRsZXdhcmU6bCxyZXNwb25zZU1pZGRsZXdhcmU6dX09cyxkPV9fb2JqUmVzdChzLFsiaGVhZGVycyIsImZldGNoIiwibWV0aG9kIiwicmVxdWVzdE1pZGRsZXdhcmUiLCJyZXNwb25zZU1pZGRsZXdhcmUiXSkse3VybDpwfT10aGlzO3ZvaWQgMCE9PWkuc2lnbmFsJiYoZC5zaWduYWw9aS5zaWduYWwpO2NvbnN0e3F1ZXJ5Omgsb3BlcmF0aW9uTmFtZTpmfT1IZShpLmRvY3VtZW50KTtyZXR1cm4gaXQoe3VybDpwLHF1ZXJ5OmgsdmFyaWFibGVzOmkudmFyaWFibGVzLGhlYWRlcnM6X19zcHJlYWRWYWx1ZXMoX19zcHJlYWRWYWx1ZXMoe30sZXQoYXQobykpKSxldChpLnJlcXVlc3RIZWFkZXJzKSksb3BlcmF0aW9uTmFtZTpmLGZldGNoOmEsbWV0aG9kOmMsZmV0Y2hPcHRpb25zOmQsbWlkZGxld2FyZTpsfSkudGhlbigoZT0+KHUmJnUoZSksZS5kYXRhKSkpLmNhdGNoKChlPT57dGhyb3cgdSYmdShlKSxlfSkpfSkpfWJhdGNoUmVxdWVzdHMoZSx0KXt2YXIgbjtjb25zdCByPSgoZSx0KT0+ZS5kb2N1bWVudHM/ZTp7ZG9jdW1lbnRzOmUscmVxdWVzdEhlYWRlcnM6dCxzaWduYWw6dm9pZCAwfSkoZSx0KSxpPXRoaXMucmVxdWVzdENvbmZpZyx7aGVhZGVyczpzfT1pLG89X19vYmpSZXN0KGksWyJoZWFkZXJzIl0pO3ZvaWQgMCE9PXIuc2lnbmFsJiYoby5zaWduYWw9ci5zaWduYWwpO2NvbnN0IGE9ci5kb2N1bWVudHMubWFwKCgoe2RvY3VtZW50OmV9KT0+SGUoZSkucXVlcnkpKSxjPXIuZG9jdW1lbnRzLm1hcCgoKHt2YXJpYWJsZXM6ZX0pPT5lKSk7cmV0dXJuIGl0KHt1cmw6dGhpcy51cmwscXVlcnk6YSx2YXJpYWJsZXM6YyxoZWFkZXJzOl9fc3ByZWFkVmFsdWVzKF9fc3ByZWFkVmFsdWVzKHt9LGV0KGF0KHMpKSksZXQoci5yZXF1ZXN0SGVhZGVycykpLG9wZXJhdGlvbk5hbWU6dm9pZCAwLGZldGNoOm51bGwhPShuPXRoaXMucmVxdWVzdENvbmZpZy5mZXRjaCk/bjpXZSxtZXRob2Q6dGhpcy5yZXF1ZXN0Q29uZmlnLm1ldGhvZHx8IlBPU1QiLGZldGNoT3B0aW9uczpvLG1pZGRsZXdhcmU6dGhpcy5yZXF1ZXN0Q29uZmlnLnJlcXVlc3RNaWRkbGV3YXJlfSkudGhlbigoZT0+KHRoaXMucmVxdWVzdENvbmZpZy5yZXNwb25zZU1pZGRsZXdhcmUmJnRoaXMucmVxdWVzdENvbmZpZy5yZXNwb25zZU1pZGRsZXdhcmUoZSksZS5kYXRhKSkpLmNhdGNoKChlPT57dGhyb3cgdGhpcy5yZXF1ZXN0Q29uZmlnLnJlc3BvbnNlTWlkZGxld2FyZSYmdGhpcy5yZXF1ZXN0Q29uZmlnLnJlc3BvbnNlTWlkZGxld2FyZShlKSxlfSkpfXNldEhlYWRlcnMoZSl7cmV0dXJuIHRoaXMucmVxdWVzdENvbmZpZy5oZWFkZXJzPWUsdGhpc31zZXRIZWFkZXIoZSx0KXtjb25zdHtoZWFkZXJzOm59PXRoaXMucmVxdWVzdENvbmZpZztyZXR1cm4gbj9uW2VdPXQ6dGhpcy5yZXF1ZXN0Q29uZmlnLmhlYWRlcnM9e1tlXTp0fSx0aGlzfXNldEVuZHBvaW50KGUpe3JldHVybiB0aGlzLnVybD1lLHRoaXN9fWNvbnN0IGl0PWU9Pl9fYXN5bmModGhpcyxudWxsLChmdW5jdGlvbiooKXt2YXIgdCxuO2NvbnN0e3F1ZXJ5OnIsdmFyaWFibGVzOmksZmV0Y2hPcHRpb25zOnN9PWUsbz1udCgobnVsbCE9KHQ9ZS5tZXRob2QpP3Q6InBvc3QiKS50b1VwcGVyQ2FzZSgpKTtjb25zdCBhPUFycmF5LmlzQXJyYXkoZS5xdWVyeSksYz15aWVsZCBvKGUpLGw9eWllbGQgb3QoYyxudWxsIT0obj1zLmpzb25TZXJpYWxpemVyKT9uOnplKSx1PUFycmF5LmlzQXJyYXkobCk/IWwuc29tZSgoKHtkYXRhOmV9KT0+IWUpKTpCb29sZWFuKGwuZGF0YSksZD1BcnJheS5pc0FycmF5KGwpfHwhbC5lcnJvcnN8fEFycmF5LmlzQXJyYXkobC5lcnJvcnMpJiYhbC5lcnJvcnMubGVuZ3RofHwiYWxsIj09PXMuZXJyb3JQb2xpY3l8fCJpZ25vcmUiPT09cy5lcnJvclBvbGljeTtpZihjLm9rJiZkJiZ1KXtjb25zdCBlPShBcnJheS5pc0FycmF5KGwpLGwpLHtlcnJvcnM6dH09ZSxuPV9fb2JqUmVzdChlLFsiZXJyb3JzIl0pLHI9Imlnbm9yZSI9PT1zLmVycm9yUG9saWN5P246bDtyZXR1cm4gX19zcHJlYWRQcm9wcyhfX3NwcmVhZFZhbHVlcyh7fSxhP3tkYXRhOnJ9OnIpLHtoZWFkZXJzOmMuaGVhZGVycyxzdGF0dXM6Yy5zdGF0dXN9KX10aHJvdyBuZXcgSmUoX19zcHJlYWRQcm9wcyhfX3NwcmVhZFZhbHVlcyh7fSwic3RyaW5nIj09dHlwZW9mIGw/e2Vycm9yOmx9OmwpLHtzdGF0dXM6Yy5zdGF0dXMsaGVhZGVyczpjLmhlYWRlcnN9KSx7cXVlcnk6cix2YXJpYWJsZXM6aX0pfSkpLHN0PShlLHQsbixyKT0+e2NvbnN0IGk9bnVsbCE9cj9yOnplO2lmKCFBcnJheS5pc0FycmF5KGUpKXJldHVybiBpLnN0cmluZ2lmeSh7cXVlcnk6ZSx2YXJpYWJsZXM6dCxvcGVyYXRpb25OYW1lOm59KTtpZih2b2lkIDAhPT10JiYhQXJyYXkuaXNBcnJheSh0KSl0aHJvdyBuZXcgRXJyb3IoIkNhbm5vdCBjcmVhdGUgcmVxdWVzdCBib2R5IHdpdGggZ2l2ZW4gdmFyaWFibGUgdHlwZSwgYXJyYXkgZXhwZWN0ZWQiKTtjb25zdCBzPWUucmVkdWNlKCgoZSxuLHIpPT4oZS5wdXNoKHtxdWVyeTpuLHZhcmlhYmxlczp0P3Rbcl06dm9pZCAwfSksZSkpLFtdKTtyZXR1cm4gaS5zdHJpbmdpZnkocyl9LG90PShlLHQpPT5fX2FzeW5jKHRoaXMsbnVsbCwoZnVuY3Rpb24qKCl7bGV0IG47cmV0dXJuIGUuaGVhZGVycy5mb3JFYWNoKCgoZSx0KT0+eyJjb250ZW50LXR5cGUiPT09dC50b0xvd2VyQ2FzZSgpJiYobj1lKX0pKSxuJiYobi50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoImFwcGxpY2F0aW9uL2pzb24iKXx8bi50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoImFwcGxpY2F0aW9uL2dyYXBocWwranNvbiIpfHxuLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgiYXBwbGljYXRpb24vZ3JhcGhxbC1yZXNwb25zZStqc29uIikpP3QucGFyc2UoeWllbGQgZS50ZXh0KCkpOmUudGV4dCgpfSkpLGF0PWU9PiJmdW5jdGlvbiI9PXR5cGVvZiBlP2UoKTplO3ZhciBjdD0oZT0+KGUuQmlsbGluZ1F1b3RhRXhjZWVkZWQ9IkJpbGxpbmdRdW90YUV4Y2VlZGVkIixlKSkoY3R8fHt9KTtjb25zdCBsdD1bY3QuQmlsbGluZ1F1b3RhRXhjZWVkZWQudG9TdHJpbmcoKV0sdXQ9ZT0+e2NvbnN0IHQ9KG4scixpLHMsbz0wKT0+X19hc3luYyh0aGlzLG51bGwsKGZ1bmN0aW9uKigpe3RyeXtyZXR1cm4geWllbGQgbigpfWNhdGNoKGEpe2lmKGEgaW5zdGFuY2VvZiBKZSYmIShlPT57dmFyIHQ7cmV0dXJuIHZvaWQgMD09PShudWxsPT0odD1lLnJlc3BvbnNlLmVycm9ycyk/dm9pZCAwOnQuZmluZCgoZT0+bHQuaW5jbHVkZXMoZS5tZXNzYWdlKSkpKX0pKGEpKXRocm93IGE7aWYobzwxMClyZXR1cm4geWllbGQgbmV3IFByb21pc2UoKGU9PnNldFRpbWVvdXQoZSwxZTMrNTAwKk1hdGgucG93KDIsbykpKSkseWllbGQgdChuLHIsaSxzLG8rMSk7dGhyb3cgY29uc29sZS5lcnJvcihgaGlnaGxpZ2h0LmlvOiBbJHtlfHxlfV0gZGF0YSByZXF1ZXN0IGZhaWxlZCBhZnRlciAke299IHJldHJpZXNgKSxhfX0pKTtyZXR1cm4gdH0sZHQ9WyJudW1iZXIiLCJzdHJpbmciLCJib29sZWFuIl07Y2xhc3MgcHR7Y29uc3RydWN0b3IoZSx0KXtfX3B1YmxpY0ZpZWxkKHRoaXMsImRlYnVnIiksX19wdWJsaWNGaWVsZCh0aGlzLCJuYW1lIiksdGhpcy5kZWJ1Zz1lLHRoaXMubmFtZT10fWxvZyguLi5lKXtpZih0aGlzLmRlYnVnKXtsZXQgdD1gWyR7RGF0ZS5ub3coKX1dYDt0aGlzLm5hbWUmJih0Kz1gIC0gJHt0aGlzLm5hbWV9YCksY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSxbdCwuLi5lXSl9fX12YXIgaHQ9VWludDhBcnJheSxmdD1VaW50MTZBcnJheSx5dD1JbnQzMkFycmF5LG10PW5ldyBodChbMCwwLDAsMCwwLDAsMCwwLDEsMSwxLDEsMiwyLDIsMiwzLDMsMywzLDQsNCw0LDQsNSw1LDUsNSwwLDAsMCwwXSksdnQ9bmV3IGh0KFswLDAsMCwwLDEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsNyw4LDgsOSw5LDEwLDEwLDExLDExLDEyLDEyLDEzLDEzLDAsMF0pLF90PW5ldyBodChbMTYsMTcsMTgsMCw4LDcsOSw2LDEwLDUsMTEsNCwxMiwzLDEzLDIsMTQsMSwxNV0pLGd0PWZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPW5ldyBmdCgzMSkscj0wO3I8MzE7KytyKW5bcl09dCs9MTw8ZVtyLTFdO3ZhciBpPW5ldyB5dChuWzMwXSk7Zm9yKHI9MTtyPDMwOysrcilmb3IodmFyIHM9bltyXTtzPG5bcisxXTsrK3MpaVtzXT1zLW5bcl08PDV8cjtyZXR1cm57YjpuLHI6aX19LEV0PWd0KG10LDIpLFR0PUV0LmIsYnQ9RXQucjtUdFsyOF09MjU4LGJ0WzI1OF09Mjg7Zm9yKHZhciBOdD1ndCh2dCwwKS5yLEl0PW5ldyBmdCgzMjc2OCksT3Q9MDtPdDwzMjc2ODsrK090KXt2YXIgQXQ9KDQzNjkwJk90KT4+MXwoMjE4NDUmT3QpPDwxO0F0PSg2MTY4MCYoQXQ9KDUyNDI4JkF0KT4+MnwoMTMxMDcmQXQpPDwyKSk+PjR8KDM4NTUmQXQpPDw0LEl0W090XT0oKDY1MjgwJkF0KT4+OHwoMjU1JkF0KTw8OCk+PjF9dmFyIHh0PWZ1bmN0aW9uKGUsdCxuKXtmb3IodmFyIHI9ZS5sZW5ndGgsaT0wLHM9bmV3IGZ0KHQpO2k8cjsrK2kpZVtpXSYmKytzW2VbaV0tMV07dmFyIG8sYT1uZXcgZnQodCk7Zm9yKGk9MTtpPHQ7KytpKWFbaV09YVtpLTFdK3NbaS0xXTw8MTtpZihuKXtvPW5ldyBmdCgxPDx0KTt2YXIgYz0xNS10O2ZvcihpPTA7aTxyOysraSlpZihlW2ldKWZvcih2YXIgbD1pPDw0fGVbaV0sdT10LWVbaV0sZD1hW2VbaV0tMV0rKzw8dSxwPWR8KDE8PHUpLTE7ZDw9cDsrK2Qpb1tJdFtkXT4+Y109bH1lbHNlIGZvcihvPW5ldyBmdChyKSxpPTA7aTxyOysraSllW2ldJiYob1tpXT1JdFthW2VbaV0tMV0rK10+PjE1LWVbaV0pO3JldHVybiBvfSxTdD1uZXcgaHQoMjg4KTtmb3IoT3Q9MDtPdDwxNDQ7KytPdClTdFtPdF09ODtmb3IoT3Q9MTQ0O090PDI1NjsrK090KVN0W090XT05O2ZvcihPdD0yNTY7T3Q8MjgwOysrT3QpU3RbT3RdPTc7Zm9yKE90PTI4MDtPdDwyODg7KytPdClTdFtPdF09ODt2YXIgRHQ9bmV3IGh0KDMyKTtmb3IoT3Q9MDtPdDwzMjsrK090KUR0W090XT01O3ZhciB3dD14dChTdCw5LDApLGt0PXh0KER0LDUsMCksQ3Q9ZnVuY3Rpb24oZSl7cmV0dXJuKGUrNykvOHwwfSxQdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuKG51bGw9PXR8fHQ8MCkmJih0PTApLChudWxsPT1ufHxuPmUubGVuZ3RoKSYmKG49ZS5sZW5ndGgpLG5ldyBodChlLnN1YmFycmF5KHQsbikpfSxSdD1mdW5jdGlvbihlLHQsbil7bjw8PTcmdDt2YXIgcj10Lzh8MDtlW3JdfD1uLGVbcisxXXw9bj4+OH0sTHQ9ZnVuY3Rpb24oZSx0LG4pe248PD03JnQ7dmFyIHI9dC84fDA7ZVtyXXw9bixlW3IrMV18PW4+PjgsZVtyKzJdfD1uPj4xNn0sRnQ9ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49W10scj0wO3I8ZS5sZW5ndGg7KytyKWVbcl0mJm4ucHVzaCh7czpyLGY6ZVtyXX0pO3ZhciBpPW4ubGVuZ3RoLHM9bi5zbGljZSgpO2lmKCFpKXJldHVybnt0OnF0LGw6MH07aWYoMT09aSl7dmFyIG89bmV3IGh0KG5bMF0ucysxKTtyZXR1cm4gb1tuWzBdLnNdPTEse3Q6byxsOjF9fW4uc29ydCgoZnVuY3Rpb24oZSx0KXtyZXR1cm4gZS5mLXQuZn0pKSxuLnB1c2goe3M6LTEsZjoyNTAwMX0pO3ZhciBhPW5bMF0sYz1uWzFdLGw9MCx1PTEsZD0yO2ZvcihuWzBdPXtzOi0xLGY6YS5mK2MuZixsOmEscjpjfTt1IT1pLTE7KWE9bltuW2xdLmY8bltkXS5mP2wrKzpkKytdLGM9bltsIT11JiZuW2xdLmY8bltkXS5mP2wrKzpkKytdLG5bdSsrXT17czotMSxmOmEuZitjLmYsbDphLHI6Y307dmFyIHA9c1swXS5zO2ZvcihyPTE7cjxpOysrcilzW3JdLnM+cCYmKHA9c1tyXS5zKTt2YXIgaD1uZXcgZnQocCsxKSxmPSR0KG5bdS0xXSxoLDApO2lmKGY+dCl7cj0wO3ZhciB5PTAsbT1mLXQsdj0xPDxtO2ZvcihzLnNvcnQoKGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGhbdC5zXS1oW2Uuc118fGUuZi10LmZ9KSk7cjxpOysrcil7dmFyIF89c1tyXS5zO2lmKCEoaFtfXT50KSlicmVhazt5Kz12LSgxPDxmLWhbX10pLGhbX109dH1mb3IoeT4+PW07eT4wOyl7dmFyIGc9c1tyXS5zO2hbZ108dD95LT0xPDx0LWhbZ10rKy0xOisrcn1mb3IoO3I+PTAmJnk7LS1yKXt2YXIgRT1zW3JdLnM7aFtFXT09dCYmKC0taFtFXSwrK3kpfWY9dH1yZXR1cm57dDpuZXcgaHQoaCksbDpmfX0sJHQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybi0xPT1lLnM/TWF0aC5tYXgoJHQoZS5sLHQsbisxKSwkdChlLnIsdCxuKzEpKTp0W2Uuc109bn0sTXQ9ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PWUubGVuZ3RoO3QmJiFlWy0tdF07KTtmb3IodmFyIG49bmV3IGZ0KCsrdCkscj0wLGk9ZVswXSxzPTEsbz1mdW5jdGlvbihlKXtuW3IrK109ZX0sYT0xO2E8PXQ7KythKWlmKGVbYV09PWkmJmEhPXQpKytzO2Vsc2V7aWYoIWkmJnM+Mil7Zm9yKDtzPjEzODtzLT0xMzgpbygzMjc1NCk7cz4yJiYobyhzPjEwP3MtMTE8PDV8Mjg2OTA6cy0zPDw1fDEyMzA1KSxzPTApfWVsc2UgaWYocz4zKXtmb3IobyhpKSwtLXM7cz42O3MtPTYpbyg4MzA0KTtzPjImJihvKHMtMzw8NXw4MjA4KSxzPTApfWZvcig7cy0tOylvKGkpO3M9MSxpPWVbYV19cmV0dXJue2M6bi5zdWJhcnJheSgwLHIpLG46dH19LFZ0PWZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPTAscj0wO3I8dC5sZW5ndGg7KytyKW4rPWVbcl0qdFtyXTtyZXR1cm4gbn0sQnQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW4ubGVuZ3RoLGk9Q3QodCsyKTtlW2ldPTI1NSZyLGVbaSsxXT1yPj44LGVbaSsyXT0yNTVeZVtpXSxlW2krM109MjU1XmVbaSsxXTtmb3IodmFyIHM9MDtzPHI7KytzKWVbaStzKzRdPW5bc107cmV0dXJuIDgqKGkrNCtyKX0sanQ9ZnVuY3Rpb24oZSx0LG4scixpLHMsbyxhLGMsbCx1KXtSdCh0LHUrKyxuKSwrK2lbMjU2XTtmb3IodmFyIGQ9RnQoaSwxNSkscD1kLnQsaD1kLmwsZj1GdChzLDE1KSx5PWYudCxtPWYubCx2PU10KHApLF89di5jLGc9di5uLEU9TXQoeSksVD1FLmMsYj1FLm4sTj1uZXcgZnQoMTkpLEk9MDtJPF8ubGVuZ3RoOysrSSkrK05bMzEmX1tJXV07Zm9yKEk9MDtJPFQubGVuZ3RoOysrSSkrK05bMzEmVFtJXV07Zm9yKHZhciBPPUZ0KE4sNyksQT1PLnQseD1PLmwsUz0xOTtTPjQmJiFBW190W1MtMV1dOy0tUyk7dmFyIEQsdyxrLEMsUD1sKzU8PDMsUj1WdChpLFN0KStWdChzLER0KStvLEw9VnQoaSxwKStWdChzLHkpK28rMTQrMypTK1Z0KE4sQSkrMipOWzE2XSszKk5bMTddKzcqTlsxOF07aWYoYz49MCYmUDw9UiYmUDw9TClyZXR1cm4gQnQodCx1LGUuc3ViYXJyYXkoYyxjK2wpKTtpZihSdCh0LHUsMSsoTDxSKSksdSs9MixMPFIpe0Q9eHQocCxoLDApLHc9cCxrPXh0KHksbSwwKSxDPXk7dmFyIEY9eHQoQSx4LDApO1J0KHQsdSxnLTI1NyksUnQodCx1KzUsYi0xKSxSdCh0LHUrMTAsUy00KSx1Kz0xNDtmb3IoST0wO0k8UzsrK0kpUnQodCx1KzMqSSxBW190W0ldXSk7dSs9MypTO2Zvcih2YXIgJD1bXyxUXSxNPTA7TTwyOysrTSl7dmFyIFY9JFtNXTtmb3IoST0wO0k8Vi5sZW5ndGg7KytJKXt2YXIgQj0zMSZWW0ldO1J0KHQsdSxGW0JdKSx1Kz1BW0JdLEI+MTUmJihSdCh0LHUsVltJXT4+NSYxMjcpLHUrPVZbSV0+PjEyKX19fWVsc2UgRD13dCx3PVN0LGs9a3QsQz1EdDtmb3IoST0wO0k8YTsrK0kpe3ZhciBqPXJbSV07aWYoaj4yNTUpe0x0KHQsdSxEWyhCPWo+PjE4JjMxKSsyNTddKSx1Kz13W0IrMjU3XSxCPjcmJihSdCh0LHUsaj4+MjMmMzEpLHUrPW10W0JdKTt2YXIgVT0zMSZqO0x0KHQsdSxrW1VdKSx1Kz1DW1VdLFU+MyYmKEx0KHQsdSxqPj41JjgxOTEpLHUrPXZ0W1VdKX1lbHNlIEx0KHQsdSxEW2pdKSx1Kz13W2pdfXJldHVybiBMdCh0LHUsRFsyNTZdKSx1K3dbMjU2XX0sVXQ9bmV3IHl0KFs2NTU0MCwxMzEwODAsMTMxMDg4LDEzMTEwNCwyNjIxNzYsMTA0ODcwNCwxMDQ4ODMyLDIxMTQ1NjAsMjExNzYzMl0pLHF0PW5ldyBodCgwKSxLdD1mdW5jdGlvbigpe2Zvcih2YXIgZT1uZXcgSW50MzJBcnJheSgyNTYpLHQ9MDt0PDI1NjsrK3Qpe2Zvcih2YXIgbj10LHI9OTstLXI7KW49KDEmbiYmLTMwNjY3NDkxMilebj4+PjE7ZVt0XT1ufXJldHVybiBlfSgpLEd0PWZ1bmN0aW9uKGUsdCxuLHIsaSl7aWYoIWkmJihpPXtsOjF9LHQuZGljdGlvbmFyeSkpe3ZhciBzPXQuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpLG89bmV3IGh0KHMubGVuZ3RoK2UubGVuZ3RoKTtvLnNldChzKSxvLnNldChlLHMubGVuZ3RoKSxlPW8saS53PXMubGVuZ3RofXJldHVybiBmdW5jdGlvbihlLHQsbixyLGkscyl7dmFyIG89cy56fHxlLmxlbmd0aCxhPW5ldyBodChyK28rNSooMStNYXRoLmNlaWwoby83ZTMpKStpKSxjPWEuc3ViYXJyYXkocixhLmxlbmd0aC1pKSxsPXMubCx1PTcmKHMucnx8MCk7aWYodCl7dSYmKGNbMF09cy5yPj4zKTtmb3IodmFyIGQ9VXRbdC0xXSxwPWQ+PjEzLGg9ODE5MSZkLGY9KDE8PG4pLTEseT1zLnB8fG5ldyBmdCgzMjc2OCksbT1zLmh8fG5ldyBmdChmKzEpLHY9TWF0aC5jZWlsKG4vMyksXz0yKnYsZz1mdW5jdGlvbih0KXtyZXR1cm4oZVt0XV5lW3QrMV08PHZeZVt0KzJdPDxfKSZmfSxFPW5ldyB5dCgyNWUzKSxUPW5ldyBmdCgyODgpLGI9bmV3IGZ0KDMyKSxOPTAsST0wLE89cy5pfHwwLEE9MCx4PXMud3x8MCxTPTA7TysyPG87KytPKXt2YXIgRD1nKE8pLHc9MzI3NjcmTyxrPW1bRF07aWYoeVt3XT1rLG1bRF09dyx4PD1PKXt2YXIgQz1vLU87aWYoKE4+N2UzfHxBPjI0NTc2KSYmKEM+NDIzfHwhbCkpe3U9anQoZSxjLDAsRSxULGIsSSxBLFMsTy1TLHUpLEE9Tj1JPTAsUz1PO2Zvcih2YXIgUD0wO1A8Mjg2OysrUClUW1BdPTA7Zm9yKFA9MDtQPDMwOysrUCliW1BdPTB9dmFyIFI9MixMPTAsRj1oLCQ9dy1rJjMyNzY3O2lmKEM+MiYmRD09ZyhPLSQpKWZvcih2YXIgTT1NYXRoLm1pbihwLEMpLTEsVj1NYXRoLm1pbigzMjc2NyxPKSxCPU1hdGgubWluKDI1OCxDKTskPD1WJiYtLUYmJnchPWs7KXtpZihlW08rUl09PWVbTytSLSRdKXtmb3IodmFyIGo9MDtqPEImJmVbTytqXT09ZVtPK2otJF07KytqKTtpZihqPlIpe2lmKFI9aixMPSQsaj5NKWJyZWFrO3ZhciBVPU1hdGgubWluKCQsai0yKSxxPTA7Zm9yKFA9MDtQPFU7KytQKXt2YXIgSz1PLSQrUCYzMjc2NyxHPUsteVtLXSYzMjc2NztHPnEmJihxPUcsaz1LKX19fSQrPSh3PWspLShrPXlbd10pJjMyNzY3fWlmKEwpe0VbQSsrXT0yNjg0MzU0NTZ8YnRbUl08PDE4fE50W0xdO3ZhciB6PTMxJmJ0W1JdLFk9MzEmTnRbTF07SSs9bXRbel0rdnRbWV0sKytUWzI1Nyt6XSwrK2JbWV0seD1PK1IsKytOfWVsc2UgRVtBKytdPWVbT10sKytUW2VbT11dfX1mb3IoTz1NYXRoLm1heChPLHgpO088bzsrK08pRVtBKytdPWVbT10sKytUW2VbT11dO3U9anQoZSxjLGwsRSxULGIsSSxBLFMsTy1TLHUpLGx8fChzLnI9NyZ1fGNbdS84fDBdPDwzLHUtPTcscy5oPW0scy5wPXkscy5pPU8scy53PXgpfWVsc2V7Zm9yKE89cy53fHwwO088bytsO08rPTY1NTM1KXt2YXIgSD1PKzY1NTM1O0g+PW8mJihjW3UvOHwwXT1sLEg9byksdT1CdChjLHUrMSxlLnN1YmFycmF5KE8sSCkpfXMuaT1vfXJldHVybiBQdChhLDAscitDdCh1KStpKX0oZSxudWxsPT10LmxldmVsPzY6dC5sZXZlbCxudWxsPT10Lm1lbT9NYXRoLmNlaWwoMS41Kk1hdGgubWF4KDgsTWF0aC5taW4oMTMsTWF0aC5sb2coZS5sZW5ndGgpKSkpOjEyK3QubWVtLG4scixpKX0senQ9ZnVuY3Rpb24oZSx0LG4pe2Zvcig7bjsrK3QpZVt0XT1uLG4+Pj49OH07ZnVuY3Rpb24gWXQoZSx0KXt0fHwodD17fSk7dmFyIG49ZnVuY3Rpb24oKXt2YXIgZT0tMTtyZXR1cm57cDpmdW5jdGlvbih0KXtmb3IodmFyIG49ZSxyPTA7cjx0Lmxlbmd0aDsrK3Ipbj1LdFsyNTUmbl50W3JdXV5uPj4+ODtlPW59LGQ6ZnVuY3Rpb24oKXtyZXR1cm5+ZX19fSgpLHI9ZS5sZW5ndGg7bi5wKGUpO3ZhciBpLHM9R3QoZSx0LDEwKygoaT10KS5maWxlbmFtZT9pLmZpbGVuYW1lLmxlbmd0aCsxOjApLDgpLG89cy5sZW5ndGg7cmV0dXJuIGZ1bmN0aW9uKGUsdCl7dmFyIG49dC5maWxlbmFtZTtpZihlWzBdPTMxLGVbMV09MTM5LGVbMl09OCxlWzhdPXQubGV2ZWw8Mj80Ojk9PXQubGV2ZWw/MjowLGVbOV09MywwIT10Lm10aW1lJiZ6dChlLDQsTWF0aC5mbG9vcihuZXcgRGF0ZSh0Lm10aW1lfHxEYXRlLm5vdygpKS8xZTMpKSxuKXtlWzNdPTg7Zm9yKHZhciByPTA7cjw9bi5sZW5ndGg7KytyKWVbcisxMF09bi5jaGFyQ29kZUF0KHIpfX0ocyx0KSx6dChzLG8tOCxuLmQoKSksenQocyxvLTQsciksc312YXIgSHQ9InVuZGVmaW5lZCIhPXR5cGVvZiBUZXh0RW5jb2RlciYmbmV3IFRleHRFbmNvZGVyLEp0PSJ1bmRlZmluZWQiIT10eXBlb2YgVGV4dERlY29kZXImJm5ldyBUZXh0RGVjb2Rlcjt0cnl7SnQuZGVjb2RlKHF0LHtzdHJlYW06ITB9KSwxfWNhdGNoKFd0KXt9Y29uc3QgUXQ9c2VsZjtmdW5jdGlvbiBYdChlLHQpe2NvbnN0IG49e30scj1bXSxpPVtdO2Zvcihjb25zdFtvLGFdb2YgT2JqZWN0LmVudHJpZXMoZSkpe2lmKG51bGw9PWEpY29udGludWU7bGV0IGU7ZHQuaW5jbHVkZXModHlwZW9mIGEpfHxyLnB1c2goe1tvXTphfSksZT0ic3RyaW5nIj09dHlwZW9mIGE/YTpzKGEpLGUubGVuZ3RoPjJlMyYmKGkucHVzaCh7W29dOmF9KSxlPWUuc3Vic3RyaW5nKDAsMmUzKSksbltvXT1lfXJldHVybiJzZXNzaW9uIiE9PXQmJihyLmxlbmd0aD4wJiZjb25zb2xlLndhcm4oYEhpZ2hsaWdodCB3YXMgcGFzc2VkIG9uZSBvciBtb3JlICR7dH0gcHJvcGVydGllcyBub3Qgb2YgdHlwZSBzdHJpbmcsIG51bWJlciwgb3IgYm9vbGVhbi5gLHIpLGkubGVuZ3RoPjAmJmNvbnNvbGUud2FybihgSGlnaGxpZ2h0IHdhcyBwYXNzZWQgb25lIG9yIG1vcmUgJHt0fSBwcm9wZXJ0aWVzIGV4Y2VlZGluZyAyMDAwIGNoYXJhY3RlcnMsIHdoaWNoIHdpbGwgYmUgdHJ1bmNhdGVkLmAsaSkpLG59e2xldCBlLG4scixpPTAsbz0hMSxhPTAsYz1uZXcgcHQoITEsIlt3b3JrZXJdIik7Y29uc3QgbD1bXSx1PSgpPT4wIT09YSYmaTw1JiYhIShudWxsPT1yP3ZvaWQgMDpyLmxlbmd0aCksZD0oZSxuKT0+e1F0LnBvc3RNZXNzYWdlKHtyZXNwb25zZTp7dHlwZTp0LkN1c3RvbUV2ZW50LHRhZzplLHBheWxvYWQ6bn19KX0scD1uPT5fX2FzeW5jKHRoaXMsbnVsbCwoZnVuY3Rpb24qKCl7Y29uc3R7aWQ6aSxldmVudHM6byxtZXNzYWdlczphLGVycm9yczp1LHJlc291cmNlc1N0cmluZzpkLHdlYlNvY2tldEV2ZW50c1N0cmluZzpwLGhhc1Nlc3Npb25VbmxvYWRlZDpoLGhpZ2hsaWdodExvZ3M6Zn09bix5PXMoe21lc3NhZ2VzOmF9KTtsZXQgbT17c2Vzc2lvbl9zZWN1cmVfaWQ6cixwYXlsb2FkX2lkOmkudG9TdHJpbmcoKSxldmVudHM6e2V2ZW50czpvfSxtZXNzYWdlczp5LHJlc291cmNlczpkLHdlYl9zb2NrZXRfZXZlbnRzOnAsZXJyb3JzOnUsaXNfYmVhY29uOiExLGhhc19zZXNzaW9uX3VubG9hZGVkOmh9O2YmJihtLmhpZ2hsaWdodF9sb2dzPWYpO2NvbnN0IHY9ZnVuY3Rpb24oZSx0KXtpZih0KXtmb3IodmFyIG49bmV3IGh0KGUubGVuZ3RoKSxyPTA7cjxlLmxlbmd0aDsrK3IpbltyXT1lLmNoYXJDb2RlQXQocik7cmV0dXJuIG59aWYoSHQpcmV0dXJuIEh0LmVuY29kZShlKTt2YXIgaT1lLmxlbmd0aCxzPW5ldyBodChlLmxlbmd0aCsoZS5sZW5ndGg+PjEpKSxvPTAsYT1mdW5jdGlvbihlKXtzW28rK109ZX07Zm9yKHI9MDtyPGk7KytyKXtpZihvKzU+cy5sZW5ndGgpe3ZhciBjPW5ldyBodChvKzgrKGktcjw8MSkpO2Muc2V0KHMpLHM9Y312YXIgbD1lLmNoYXJDb2RlQXQocik7bDwxMjh8fHQ/YShsKTpsPDIwNDg/KGEoMTkyfGw+PjYpLGEoMTI4fDYzJmwpKTpsPjU1Mjk1JiZsPDU3MzQ0PyhhKDI0MHwobD02NTUzNisoMTA0NzU1MiZsKXwxMDIzJmUuY2hhckNvZGVBdCgrK3IpKT4+MTgpLGEoMTI4fGw+PjEyJjYzKSxhKDEyOHxsPj42JjYzKSxhKDEyOHw2MyZsKSk6KGEoMjI0fGw+PjEyKSxhKDEyOHxsPj42JjYzKSxhKDEyOHw2MyZsKSl9cmV0dXJuIFB0KHMsMCxvKX0oSlNPTi5zdHJpbmdpZnkobSkpLF89WXQodiksZz15aWVsZCBmdW5jdGlvbihlKXtyZXR1cm4gX19hc3luYyh0aGlzLG51bGwsKGZ1bmN0aW9uKigpe2NvbnN0IHQ9eWllbGQgbmV3IFByb21pc2UoKHQ9Pntjb25zdCBuPW5ldyBGaWxlUmVhZGVyO24ub25sb2FkPSgpPT50KG4ucmVzdWx0KSxuLnJlYWRBc0RhdGFVUkwobmV3IEJsb2IoW2VdKSl9KSk7cmV0dXJuIHQuc2xpY2UodC5pbmRleE9mKCIsIikrMSl9KSl9KF8pO2MubG9nKGBQdXNoaW5nIHBheWxvYWQ6ICR7SlNPTi5zdHJpbmdpZnkoe3Nlc3Npb25TZWN1cmVJRDpyLGlkOmksZmlyc3RTSUQ6TWF0aC5taW4oLi4ubS5ldmVudHMuZXZlbnRzLm1hcCgoZT0+bnVsbD09ZT92b2lkIDA6ZS5fc2lkKSkuZmlsdGVyKChlPT4hIWUpKSksZXZlbnRzTGVuZ3RoOm0uZXZlbnRzLmV2ZW50cy5sZW5ndGgsbWVzc2FnZXNMZW5ndGg6YS5sZW5ndGgscmVzb3VyY2VzTGVuZ3RoOmQubGVuZ3RoLHdlYlNvY2tldExlbmd0aDpwLmxlbmd0aCxlcnJvcnNMZW5ndGg6dS5sZW5ndGgsYnVmTGVuZ3RoOnYubGVuZ3RoLGNvbXByZXNzZWRMZW5ndGg6Xy5sZW5ndGgsY29tcHJlc3NlZEJhc2U2NExlbmd0aDpnLmxlbmd0aH0sdm9pZCAwLDIpfWApO2NvbnN0IEU9ZS5QdXNoUGF5bG9hZENvbXByZXNzZWQoe3Nlc3Npb25fc2VjdXJlX2lkOnIscGF5bG9hZF9pZDppLnRvU3RyaW5nKCksZGF0YTpnfSk7bGV0IFQ9UHJvbWlzZS5yZXNvbHZlKCk7bC5sZW5ndGgmJihUPWUucHVzaE1ldHJpY3Moe21ldHJpY3M6bH0pLGwuc3BsaWNlKDApKSx5aWVsZCBQcm9taXNlLmFsbChbRSxUXSksUXQucG9zdE1lc3NhZ2Uoe3Jlc3BvbnNlOnt0eXBlOnQuQXN5bmNFdmVudHMsaWQ6aSxldmVudHNTaXplOnYubGVuZ3RoLGNvbXByZXNzZWRTaXplOmcubGVuZ3RofX0pfSkpLGg9dD0+X19hc3luYyh0aGlzLG51bGwsKGZ1bmN0aW9uKigpe2NvbnN0e3VzZXJPYmplY3Q6aSx1c2VySWRlbnRpZmllcjpvLHNvdXJjZTphfT10O2QoInNlZ21lbnQiPT09YT8iU2VnbWVudCBJZGVudGlmeSI6IklkZW50aWZ5IixzKF9fc3ByZWFkVmFsdWVzKHt1c2VySWRlbnRpZmllcjpvfSxpKSkpLHlpZWxkIGUuaWRlbnRpZnlTZXNzaW9uKHtzZXNzaW9uX3NlY3VyZV9pZDpyLHVzZXJfaWRlbnRpZmllcjpvLHVzZXJfb2JqZWN0Olh0KGksInVzZXIiKX0pO2NvbnN0IGw9InNlZ21lbnQiPT09YT9hOiJkZWZhdWx0IjtjLmxvZyhgSWRlbnRpZnkgKCR7b30sIHNvdXJjZTogJHtsfSkgdy8gb2JqOiAke3MoaSl9IEAgJHtufWApfSkpLGY9dD0+X19hc3luYyh0aGlzLG51bGwsKGZ1bmN0aW9uKigpe2NvbnN0e3Byb3BlcnRpZXNPYmplY3Q6aSxwcm9wZXJ0eVR5cGU6b309dDtsZXQgYTt2b2lkIDAhPT0obnVsbD09aT92b2lkIDA6aS5jbGlja1RleHRDb250ZW50KT8oYT0iQ2xpY2tUZXh0Q29udGVudCIseWllbGQgZS5hZGRTZXNzaW9uUHJvcGVydGllcyh7c2Vzc2lvbl9zZWN1cmVfaWQ6cixwcm9wZXJ0aWVzX29iamVjdDpYdChpLCJzZXNzaW9uIil9KSk6InNlc3Npb24iPT09KG51bGw9PW8/dm9pZCAwOm8udHlwZSk/KGE9IlNlc3Npb24iLHlpZWxkIGUuYWRkU2Vzc2lvblByb3BlcnRpZXMoe3Nlc3Npb25fc2VjdXJlX2lkOnIscHJvcGVydGllc19vYmplY3Q6WHQoaSwic2Vzc2lvbiIpfSkpOiJzZWdtZW50Ij09PShudWxsPT1vP3ZvaWQgMDpvLnNvdXJjZSk/KGE9IlNlZ21lbnQiLGQoIlNlZ21lbnQgVHJhY2siLHMoaSkpKTooYT0iVHJhY2siLGQoYSxzKGkpKSksYy5sb2coYEFkZGluZyAke2F9IFByb3BlcnRpZXMgdG8gc2Vzc2lvbiAoJHtyfSkgdy8gb2JqOiAke0pTT04uc3RyaW5naWZ5KGkpfSBAICR7bn1gKX0pKSx5PWU9Pl9fYXN5bmModGhpcyxudWxsLChmdW5jdGlvbiooKXtsLnB1c2goLi4uZS5tZXRyaWNzLm1hcCgoZT0+KHtuYW1lOmUubmFtZSx2YWx1ZTplLnZhbHVlLHNlc3Npb25fc2VjdXJlX2lkOnIsY2F0ZWdvcnk6ZS5jYXRlZ29yeSxncm91cDplLmdyb3VwLHRpbWVzdGFtcDplLnRpbWVzdGFtcC50b0lTT1N0cmluZygpLHRhZ3M6ZS50YWdzfSkpKSl9KSksbT10PT5fX2FzeW5jKHRoaXMsbnVsbCwoZnVuY3Rpb24qKCl7Y29uc3R7dGltZXN0YW1wOm4sdmVyYmF0aW06aSx1c2VyRW1haWw6cyx1c2VyTmFtZTpvfT10O3lpZWxkIGUuYWRkU2Vzc2lvbkZlZWRiYWNrKHtzZXNzaW9uX3NlY3VyZV9pZDpyLHRpbWVzdGFtcDpuLHZlcmJhdGltOmksdXNlcl9lbWFpbDpzLHVzZXJfbmFtZTpvfSl9KSk7UXQub25tZXNzYWdlPWZ1bmN0aW9uKHMpe3JldHVybiBfX2FzeW5jKHRoaXMsbnVsbCwoZnVuY3Rpb24qKCl7aWYocy5kYXRhLm1lc3NhZ2UudHlwZT09PXQuSW5pdGlhbGl6ZSlyZXR1cm4gbj1zLmRhdGEubWVzc2FnZS5iYWNrZW5kLHI9cy5kYXRhLm1lc3NhZ2Uuc2Vzc2lvblNlY3VyZUlELG89cy5kYXRhLm1lc3NhZ2UuZGVidWcsYT1zLmRhdGEubWVzc2FnZS5yZWNvcmRpbmdTdGFydFRpbWUsYy5kZWJ1Zz1vLHZvaWQoZT1mdW5jdGlvbihlLHQ9R2Upe3JldHVybntQdXNoUGF5bG9hZDoobixyKT0+dCgodD0+ZS5yZXF1ZXN0KCRlLG4sX19zcHJlYWRWYWx1ZXMoX19zcHJlYWRWYWx1ZXMoe30sciksdCkpKSwiUHVzaFBheWxvYWQiLCJtdXRhdGlvbiIsbiksUHVzaFBheWxvYWRDb21wcmVzc2VkOihuLHIpPT50KCh0PT5lLnJlcXVlc3QoTWUsbixfX3NwcmVhZFZhbHVlcyhfX3NwcmVhZFZhbHVlcyh7fSxyKSx0KSkpLCJQdXNoUGF5bG9hZENvbXByZXNzZWQiLCJtdXRhdGlvbiIsbiksaWRlbnRpZnlTZXNzaW9uOihuLHIpPT50KCh0PT5lLnJlcXVlc3QoVmUsbixfX3NwcmVhZFZhbHVlcyhfX3NwcmVhZFZhbHVlcyh7fSxyKSx0KSkpLCJpZGVudGlmeVNlc3Npb24iLCJtdXRhdGlvbiIsbiksYWRkU2Vzc2lvblByb3BlcnRpZXM6KG4scik9PnQoKHQ9PmUucmVxdWVzdChCZSxuLF9fc3ByZWFkVmFsdWVzKF9fc3ByZWFkVmFsdWVzKHt9LHIpLHQpKSksImFkZFNlc3Npb25Qcm9wZXJ0aWVzIiwibXV0YXRpb24iLG4pLHB1c2hNZXRyaWNzOihuLHIpPT50KCh0PT5lLnJlcXVlc3QoamUsbixfX3NwcmVhZFZhbHVlcyhfX3NwcmVhZFZhbHVlcyh7fSxyKSx0KSkpLCJwdXNoTWV0cmljcyIsIm11dGF0aW9uIixuKSxhZGRTZXNzaW9uRmVlZGJhY2s6KG4scik9PnQoKHQ9PmUucmVxdWVzdChVZSxuLF9fc3ByZWFkVmFsdWVzKF9fc3ByZWFkVmFsdWVzKHt9LHIpLHQpKSksImFkZFNlc3Npb25GZWVkYmFjayIsIm11dGF0aW9uIixuKSxpbml0aWFsaXplU2Vzc2lvbjoobixyKT0+dCgodD0+ZS5yZXF1ZXN0KHFlLG4sX19zcHJlYWRWYWx1ZXMoX19zcHJlYWRWYWx1ZXMoe30sciksdCkpKSwiaW5pdGlhbGl6ZVNlc3Npb24iLCJtdXRhdGlvbiIsbiksSWdub3JlOihuLHIpPT50KCh0PT5lLnJlcXVlc3QoS2UsbixfX3NwcmVhZFZhbHVlcyhfX3NwcmVhZFZhbHVlcyh7fSxyKSx0KSkpLCJJZ25vcmUiLCJxdWVyeSIsbil9fShuZXcgcnQobix7aGVhZGVyczp7fX0pLHV0KHIpKSk7aWYodSgpKXRyeXtzLmRhdGEubWVzc2FnZS50eXBlPT09dC5Bc3luY0V2ZW50cz95aWVsZCBwKHMuZGF0YS5tZXNzYWdlKTpzLmRhdGEubWVzc2FnZS50eXBlPT09dC5JZGVudGlmeT95aWVsZCBoKHMuZGF0YS5tZXNzYWdlKTpzLmRhdGEubWVzc2FnZS50eXBlPT09dC5Qcm9wZXJ0aWVzP3lpZWxkIGYocy5kYXRhLm1lc3NhZ2UpOnMuZGF0YS5tZXNzYWdlLnR5cGU9PT10Lk1ldHJpY3M/eWllbGQgeShzLmRhdGEubWVzc2FnZSk6cy5kYXRhLm1lc3NhZ2UudHlwZT09PXQuRmVlZGJhY2smJih5aWVsZCBtKHMuZGF0YS5tZXNzYWdlKSksaT0wfWNhdGNoKGwpe28mJmNvbnNvbGUuZXJyb3IobCksaSs9MX19KSl9fX0oKTsK", qo = typeof window != "undefined" && window.Blob && new Blob([((t) => Uint8Array.from(atob(t), (e) => e.charCodeAt(0)))(_o)], { type: "text/javascript;charset=utf-8" });
    function ma(t) {
      let e;
      try {
        if (e = qo && (window.URL || window.webkitURL).createObjectURL(qo), !e)
          throw "";
        const i = new Worker(e, { name: t == null ? void 0 : t.name });
        return i.addEventListener("error", () => {
          (window.URL || window.webkitURL).revokeObjectURL(e);
        }), i;
      } catch (i) {
        return new Worker("data:text/javascript;base64," + _o, { name: t == null ? void 0 : t.name });
      } finally {
        e && (window.URL || window.webkitURL).revokeObjectURL(e);
      }
    }
    var $o = ((t) => (t.BillingQuotaExceeded = "BillingQuotaExceeded", t))($o || {});
    const ba = [$o.BillingQuotaExceeded.toString()], Za = (t) => {
      const e = (i, n, s, o, r = 0) => ne(this, null, function* () {
        try {
          return yield i();
        } catch (a) {
          if (a instanceof bt && !((l) => {
            var c;
            return ((c = l.response.errors) == null ? void 0 : c.find((d) => ba.includes(d.message))) === void 0;
          })(a))
            throw a;
          if (r < 10)
            return yield new Promise((l) => setTimeout(l, 1e3 + 500 * Math.pow(2, r))), yield e(i, n, s, o, r + 1);
          throw console.error(`highlight.io: [${t || t}] data request failed after ${r} retries`), a;
        }
      });
      return e;
    };
    var Ee = ((t) => (t[t.Initialize = 0] = "Initialize", t[t.AsyncEvents = 1] = "AsyncEvents", t[t.Identify = 2] = "Identify", t[t.Properties = 3] = "Properties", t[t.Metrics = 4] = "Metrics", t[t.Feedback = 5] = "Feedback", t[t.CustomEvent = 6] = "CustomEvent", t))(Ee || {});
    class ya {
      constructor(e, i) {
        w(this, "debug"), w(this, "name"), this.debug = e, this.name = i;
      }
      log(...e) {
        if (this.debug) {
          let i = `[${Date.now()}]`;
          this.name && (i += ` - ${this.name}`), console.log.apply(console, [i, ...e]);
        }
      }
    }
    const ga = () => ne(this, null, function* () {
      const t = [];
      for (let e = 0; e < 30; e++)
        t.push(yield new Promise((i) => requestAnimationFrame((n) => requestAnimationFrame((s) => i(s - n)))));
      return t.reduce((e, i) => e + i, 0) / t.length;
    }), er = "iframe parent ready", tr = "iframe ok", Ut = (t, e) => {
      console.warn(`Highlight Warning: (${t}): `, { output: e });
    }, ir = "app.highlight.run";
    class kn {
      constructor(e, i) {
        var n, s, o, r, a, l;
        w(this, "options"), w(this, "isRunningOnHighlight"), w(this, "organizationID"), w(this, "graphqlSDK"), w(this, "events"), w(this, "sessionData"), w(this, "ready"), w(this, "manualStopped"), w(this, "state"), w(this, "logger"), w(this, "enableSegmentIntegration"), w(this, "privacySetting"), w(this, "enableCanvasRecording"), w(this, "enablePerformanceRecording"), w(this, "samplingStrategy"), w(this, "inlineImages"), w(this, "inlineStylesheet"), w(this, "debugOptions"), w(this, "listeners"), w(this, "firstloadVersion"), w(this, "environment"), w(this, "sessionShortcut"), w(this, "appVersion"), w(this, "serviceName"), w(this, "_worker"), w(this, "_optionsInternal"), w(this, "_backendUrl"), w(this, "_recordingStartTime"), w(this, "_isOnLocalHost"), w(this, "_onToggleFeedbackFormVisibility"), w(this, "_firstLoadListeners"), w(this, "_isCrossOriginIframe"), w(this, "_eventBytesSinceSnapshot"), w(this, "_lastSnapshotTime"), w(this, "_lastVisibilityChangeTime"), w(this, "pushPayloadTimerId"), w(this, "hasSessionUnloaded"), w(this, "hasPushedData"), w(this, "reloaded"), w(this, "_hasPreviouslyInitialized"), w(this, "_payloadId"), w(this, "_recordStop"), e.sessionSecureID || (e.sessionSecureID = Gi()), this.options = e, typeof ((n = this.options) == null ? void 0 : n.debug) == "boolean" ? this.debugOptions = this.options.debug ? { clientInteractions: !0 } : {} : this.debugOptions = (o = (s = this.options) == null ? void 0 : s.debug) != null ? o : {}, this.logger = new ya(this.debugOptions.clientInteractions), e.storageMode && (this.logger.log(`initializing in ${e.storageMode} session mode`), l = e.storageMode, qi = l), this._worker = new ma(), this._worker.onmessage = (d) => {
          var h, p;
          ((h = d.data.response) == null ? void 0 : h.type) === Ee.AsyncEvents ? (this._eventBytesSinceSnapshot += d.data.response.eventsSize, this.logger.log(`Web worker sent payloadID ${d.data.response.id} size ${d.data.response.eventsSize} bytes, compression ratio ${d.data.response.eventsSize / d.data.response.compressedSize}.
                Total since snapshot: ${(this._eventBytesSinceSnapshot / 1e6).toFixed(1)}MB`)) : ((p = d.data.response) == null ? void 0 : p.type) === Ee.CustomEvent && this.addCustomEvent(d.data.response.tag, d.data.response.payload);
        };
        let c = Qs();
        if (this.reloaded = !1, !((r = this.sessionData) != null && r.sessionSecureID) && (c == null ? void 0 : c.sessionSecureID))
          this.sessionData = c, this.options.sessionSecureID = c.sessionSecureID, this.reloaded = !0, this.logger.log(`Tab reloaded, continuing previous session: ${this.sessionData.sessionSecureID}`);
        else {
          for (const d of Object.values(ce))
            en(d);
          this.sessionData = { sessionSecureID: this.options.sessionSecureID, projectID: 0, sessionStartTime: Date.now() };
        }
        this._hasPreviouslyInitialized = !1, this._firstLoadListeners = i || new He(this.options);
        try {
          window.parent.document && (this._isCrossOriginIframe = !1);
        } catch (d) {
          this._isCrossOriginIframe = (a = this.options.recordCrossOriginIframe) == null || a;
        }
        this._initMembers(this.options);
      }
      static create(e) {
        return new kn(e);
      }
      _reset(e) {
        return ne(this, arguments, function* ({ forceNew: i }) {
          let n, s;
          if (this.pushPayloadTimerId && (clearTimeout(this.pushPayloadTimerId), this.pushPayloadTimerId = void 0), !i)
            try {
              n = Xe(ce.USER_IDENTIFIER);
              const o = Xe(ce.USER_OBJECT);
              o && (s = JSON.parse(o));
            } catch (o) {
            }
          for (const o of Object.values(ce))
            en(o);
          this.sessionData.sessionSecureID = Gi(), this.sessionData.sessionStartTime = Date.now(), this.options.sessionSecureID = this.sessionData.sessionSecureID, this._payloadId = 0, this.stopRecording(), this._firstLoadListeners = new He(this.options), yield this.initialize(), n && s && this.identify(n, s);
        });
      }
      _initMembers(e) {
        var i, n, s, o, r, a, l, c, d, h, p, m;
        this.sessionShortcut = !1, this._recordingStartTime = 0, this._isOnLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "", this.ready = !1, this.state = "NotRecording", this.manualStopped = !1, this.enableSegmentIntegration = !!e.enableSegmentIntegration, this.privacySetting = (i = e.privacySetting) != null ? i : "default", this.enableCanvasRecording = (n = e.enableCanvasRecording) != null && n, this.enablePerformanceRecording = (s = e.enablePerformanceRecording) == null || s, this.inlineImages = (o = e.inlineImages) != null ? o : this._isOnLocalHost, this.inlineStylesheet = (r = e.inlineStylesheet) == null || r, this.samplingStrategy = U({ canvasFactor: 0.5, canvasMaxSnapshotDimension: 360, canvasClearWebGLBuffer: !0, dataUrlOptions: Kr() }, (a = e.samplingStrategy) != null ? a : { canvas: 2 }), this._backendUrl = (l = e == null ? void 0 : e.backendUrl) != null ? l : "https://pub.highlight.io", this._backendUrl[0] === "/" && (this._backendUrl = new URL(this._backendUrl, document.baseURI).href);
        const X = new Nl(`${this._backendUrl}`, { headers: {} });
        this.graphqlSDK = /* @__PURE__ */ function(y, g = jl) {
          return { PushPayload: (b, I) => g((R) => y.request(Wo, b, U(U({}, I), R)), "PushPayload", "mutation", b), PushPayloadCompressed: (b, I) => g((R) => y.request(Ml, b, U(U({}, I), R)), "PushPayloadCompressed", "mutation", b), identifySession: (b, I) => g((R) => y.request(zl, b, U(U({}, I), R)), "identifySession", "mutation", b), addSessionProperties: (b, I) => g((R) => y.request(Ol, b, U(U({}, I), R)), "addSessionProperties", "mutation", b), pushMetrics: (b, I) => g((R) => y.request(Pl, b, U(U({}, I), R)), "pushMetrics", "mutation", b), addSessionFeedback: (b, I) => g((R) => y.request(Bl, b, U(U({}, I), R)), "addSessionFeedback", "mutation", b), initializeSession: (b, I) => g((R) => y.request(Dl, b, U(U({}, I), R)), "initializeSession", "mutation", b), Ignore: (b, I) => g((R) => y.request(Ql, b, U(U({}, I), R)), "Ignore", "query", b) };
        }(X, Za(((c = this.sessionData) == null ? void 0 : c.sessionSecureID) || ((d = this.options) == null ? void 0 : d.sessionSecureID))), this.environment = (h = e.environment) != null ? h : "production", this.appVersion = e.appVersion, this.serviceName = (p = e.serviceName) != null ? p : "", typeof e.organizationID == "string" ? this.organizationID = e.organizationID : this.organizationID = e.organizationID.toString(), this.isRunningOnHighlight = this.organizationID === "1" || this.organizationID === "1jdkoe52", this.firstloadVersion = e.firstloadVersion || "unknown", this.sessionShortcut = e.sessionShortcut || !1, this._onToggleFeedbackFormVisibility = () => {
        };
        const Z = e, V = Ue(Z, ["firstloadVersion"]);
        this._optionsInternal = V, this.listeners = [], this.events = [], this.hasSessionUnloaded = !1, this.hasPushedData = !1, window.Intercom && window.Intercom("onShow", () => {
          window.Intercom("update", { highlightSessionURL: this.getCurrentSessionURLWithTimestamp() }), this.addProperties({ event: "Intercom onShow" });
        }), this._eventBytesSinceSnapshot = 0, this._lastSnapshotTime = (/* @__PURE__ */ new Date()).getTime(), this._lastVisibilityChangeTime = (/* @__PURE__ */ new Date()).getTime(), this._payloadId = (m = Number(Xe(ce.PAYLOAD_ID))) != null ? m : 1, we(ce.PAYLOAD_ID, this._payloadId.toString());
      }
      identify(e, i = {}, n) {
        e && e !== "" ? (this.sessionData.userIdentifier = e.toString(), this.sessionData.userObject = i, we(ce.USER_IDENTIFIER, e.toString()), we(ce.USER_OBJECT, JSON.stringify(i)), this._worker.postMessage({ message: { type: Ee.Identify, userIdentifier: e, userObject: i, source: n } })) : console.warn("Highlight's identify() call was passed an empty identifier.", { user_identifier: e, user_object: i });
      }
      pushCustomError(e, i) {
        return this.consumeCustomError(new Error(e), void 0, i);
      }
      consumeCustomError(e, i, n) {
        let s = {};
        if (n)
          try {
            s = U(U({}, JSON.parse(n)), s);
          } catch (o) {
          }
        return this.consumeError(e, { message: i, payload: s });
      }
      consumeError(e, { message: i, payload: n, source: s, type: o }) {
        var r, a, l, c;
        e.cause && (n = Ve(U({}, n), { "exception.cause": e.cause }));
        let d = i ? i + ":" + e.message : e.message;
        o === "React.ErrorBoundary" && (d = "ErrorBoundary: " + d);
        const h = Tt.parse(e);
        this._firstLoadListeners.errors.push({ event: d, type: o != null ? o : "custom", url: window.location.href, source: s != null ? s : "", lineNumber: (r = h[0]) != null && r.lineNumber ? (a = h[0]) == null ? void 0 : a.lineNumber : 0, columnNumber: (l = h[0]) != null && l.columnNumber ? (c = h[0]) == null ? void 0 : c.columnNumber : 0, stackTrace: h, timestamp: (/* @__PURE__ */ new Date()).toISOString(), payload: JSON.stringify(n) });
      }
      addProperties(e = {}, i) {
        const n = U({}, e);
        Object.entries(n).forEach(([s, o]) => {
          try {
            structuredClone(o);
          } catch (r) {
            delete n[s];
          }
        }), this._worker.postMessage({ message: { type: Ee.Properties, propertiesObject: n, propertyType: i } });
      }
      initialize(e) {
        return ne(this, null, function* () {
          var i, n, s, o, r, a;
          if (this.logger.log("Initializing...", e, this.sessionData, this.options), (navigator == null ? void 0 : navigator.webdriver) && !window.Cypress || ((i = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : i.includes("Googlebot")) || ((n = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : n.includes("AdsBot")))
            (s = this._firstLoadListeners) == null || s.stopListening();
          else
            try {
              if (e != null && e.forceNew)
                return void (yield this._reset(e));
              const l = Xe(ce.RECORDING_START_TIME);
              l ? this._recordingStartTime = parseInt(l, 10) : (this._recordingStartTime = (/* @__PURE__ */ new Date()).getTime(), we(ce.RECORDING_START_TIME, this._recordingStartTime.toString()));
              let c, d = Xe("highlightClientID");
              d || (d = Gi(), we("highlightClientID", d)), tn(null), c = !this.options.disableSessionRecording && this.options.disableNetworkRecording === void 0 && typeof this.options.networkRecording != "boolean" && (((o = this.options.networkRecording) == null ? void 0 : o.recordHeadersAndBody) || !1);
              let h = [];
              if (typeof this.options.networkRecording == "object" && ((r = this.options.networkRecording.destinationDomains) != null && r.length) && (h = this.options.networkRecording.destinationDomains), this._isCrossOriginIframe)
                yield this._setupCrossOriginIframe();
              else {
                const V = yield this.graphqlSDK.initializeSession({ organization_verbose_id: this.organizationID, enable_strict_privacy: this.privacySetting === "strict", privacy_setting: this.privacySetting, enable_recording_network_contents: c, clientVersion: this.firstloadVersion, firstloadVersion: this.firstloadVersion, clientConfig: JSON.stringify(this._optionsInternal), environment: this.environment, id: d, appVersion: this.appVersion, serviceName: this.serviceName, session_secure_id: this.sessionData.sessionSecureID, client_id: d, network_recording_domains: h, disable_session_recording: this.options.disableSessionRecording });
                if (V.initializeSession.secure_id !== this.sessionData.sessionSecureID && this.logger.log(`Unexpected secure id returned by initializeSession: ${V.initializeSession.secure_id}, expected ${this.sessionData.sessionSecureID}`), this.sessionData.sessionSecureID = V.initializeSession.secure_id, this.sessionData.projectID = parseInt(((a = V == null ? void 0 : V.initializeSession) == null ? void 0 : a.project_id) || "0"), !this.sessionData.projectID || !this.sessionData.sessionSecureID)
                  return void console.error("Failed to initialize Highlight; an error occurred on our end.", this.sessionData);
              }
              if (this.logger.log(`Loaded Highlight
Remote: ${this._backendUrl}
Project ID: ${this.sessionData.projectID}
SessionSecureID: ${this.sessionData.sessionSecureID}`), this.options.sessionSecureID = this.sessionData.sessionSecureID, this._worker.postMessage({ message: { type: Ee.Initialize, sessionSecureID: this.sessionData.sessionSecureID, backend: this._backendUrl, debug: !!this.debugOptions.clientInteractions, recordingStartTime: this._recordingStartTime } }), js(this.sessionData.sessionSecureID), this.sessionData.userIdentifier && this.identify(this.sessionData.userIdentifier, this.sessionData.userObject), this._firstLoadListeners.isListening() ? this._firstLoadListeners.hasNetworkRecording || He.setupNetworkListener(this._firstLoadListeners, this.options) : this._firstLoadListeners.startListening(), this.pushPayloadTimerId && (clearTimeout(this.pushPayloadTimerId), this.pushPayloadTimerId = void 0), this._isCrossOriginIframe || (this.pushPayloadTimerId = setTimeout(() => {
                this._save();
              }, 1e3)), this.options.disableSessionRecording)
                return this.logger.log("Highlight is NOT RECORDING a session replay per H.init setting."), this.ready = !0, this.state = "Recording", void (this.manualStopped = !1);
              const { getDeviceDetails: p } = (() => {
                if (!("performance" in window) || !("memory" in performance))
                  return { getDeviceDetails: void 0, getCurrentDeviceDetails: void 0 };
                const V = window.performance;
                return { getDeviceDetails: () => ({ deviceMemory: ha(navigator.deviceMemory || 0) }), getCurrentDeviceDetails: () => ({ jsHeapSizeLimit: Cn(V.memory.jsHeapSizeLimit), totalJSHeapSize: Cn(V.memory.totalJSHeapSize), usedJSHeapSize: Cn(V.memory.usedJSHeapSize) }) };
              })();
              p && this.recordMetric([{ name: Ae.DeviceMemory, value: p().deviceMemory, category: Re.Device, group: window.location.href }]);
              const m = (V) => {
                this.events.push(V);
              };
              m.bind(this), this._recordStop && (this._recordStop(), this._recordStop = void 0);
              const [X, Z] = ((V) => {
                switch (V) {
                  case "strict":
                  case "default":
                    return [!0, void 0];
                  case "none":
                    return [!1, { password: !0 }];
                }
              })(this.privacySetting);
              this._recordStop = Fe({ ignoreClass: "highlight-ignore", blockClass: "highlight-block", emit: m, recordCrossOriginIframes: this.options.recordCrossOriginIframe, privacySetting: this.privacySetting, maskAllInputs: X, maskInputOptions: Z, recordCanvas: this.enableCanvasRecording, sampling: { canvas: { fps: this.samplingStrategy.canvas, fpsManual: this.samplingStrategy.canvasManualSnapshot, resizeFactor: this.samplingStrategy.canvasFactor, clearWebGLBuffer: this.samplingStrategy.canvasClearWebGLBuffer, initialSnapshotDelay: this.samplingStrategy.canvasInitialSnapshotDelay, dataURLOptions: this.samplingStrategy.dataUrlOptions, maxSnapshotDimension: this.samplingStrategy.canvasMaxSnapshotDimension } }, keepIframeSrcFn: (V) => !this.options.recordCrossOriginIframe, inlineImages: this.inlineImages, inlineStylesheet: this.inlineStylesheet, plugins: [Jr()], logger: typeof this.options.debug == "boolean" && this.options.debug || typeof this.options.debug == "object" && this.options.debug.domRecording ? { debug: this.logger.log, warn: Ut } : void 0 }), this._recordStop || this.options.recordCrossOriginIframe && this._setupCrossOriginIframeParent(), document.referrer && (window && document.referrer.includes(window.location.origin) || (this.addCustomEvent("Referrer", document.referrer), this.addProperties({ referrer: document.referrer }, { type: "session" }))), this._setupWindowListeners(), this.ready = !0, this.state = "Recording", this.manualStopped = !1;
            } catch (l) {
              this._isOnLocalHost && (console.error(l), Ut("initializeSession", l));
            }
        });
      }
      _visibilityHandler(e) {
        return ne(this, null, function* () {
          this.manualStopped ? this.logger.log("Ignoring visibility event due to manual stop.") : (/* @__PURE__ */ new Date()).getTime() - this._lastVisibilityChangeTime < 100 || (this._lastVisibilityChangeTime = (/* @__PURE__ */ new Date()).getTime(), this.logger.log(`Detected window ${e ? "hidden" : "visible"}.`), e ? (this.addCustomEvent("TabHidden", !0), this.options.disableBackgroundRecording && this.stopRecording()) : (this.options.disableBackgroundRecording && (yield this.initialize()), this.addCustomEvent("TabHidden", !1)));
        });
      }
      _setupCrossOriginIframe() {
        return ne(this, null, function* () {
          this.logger.log("highlight in cross-origin iframe is waiting "), yield new Promise((e) => {
            const i = (n) => {
              if (n.data.highlight === er) {
                const s = n.data;
                this.logger.log("highlight got window message ", s), this.sessionData.projectID = s.projectID, this.sessionData.sessionSecureID = s.sessionSecureID, window.parent.postMessage({ highlight: tr }, "*"), window.removeEventListener("message", i), e();
              }
            };
            window.addEventListener("message", i);
          });
        });
      }
      _setupCrossOriginIframeParent() {
        this.logger.log("highlight setting up cross origin iframe parent notification"), setInterval(() => {
          window.document.querySelectorAll("iframe").forEach((e) => {
            var i;
            (i = e.contentWindow) == null || i.postMessage({ highlight: er, projectID: this.sessionData.projectID, sessionSecureID: this.sessionData.sessionSecureID }, "*");
          });
        }, 1e3), window.addEventListener("message", (e) => {
          e.data.highlight === tr && this.logger.log("highlight got response from initialized iframe");
        });
      }
      _setupWindowListeners() {
        var e;
        try {
          const n = this;
          this.enableSegmentIntegration && this.listeners.push(Al((o) => {
            if (o.type === "track") {
              const r = {};
              r["segment-event"] = o.event, n.addProperties(r, { type: "track", source: "segment" });
            } else if (o.type === "identify") {
              const r = o.userId.replace(/^"(.*)"$/, "$1");
              n.identify(r, o.traits, "segment");
            }
          })), this.listeners.push(nl((o) => {
            this.reloaded ? (this.addCustomEvent("Reload", o), this.reloaded = !1, n.addProperties({ reload: !0 }, { type: "session" })) : this.addCustomEvent("Navigate", o), n.addProperties({ "visited-url": o }, { type: "session" });
          })), this.listeners.push(((o) => {
            let r;
            const a = () => {
              clearTimeout(r), r = setTimeout(() => {
                o({ height: window.innerHeight, width: window.innerWidth, availHeight: window.screen.availHeight, availWidth: window.screen.availWidth, colorDepth: window.screen.colorDepth, pixelDepth: window.screen.pixelDepth, orientation: window.screen.orientation.angle });
              }, 500);
            };
            return window.addEventListener("resize", a), a(), () => window.removeEventListener("resize", a);
          })((o) => {
            this.addCustomEvent("Viewport", o), this.submitViewportMetrics(o);
          })), this.listeners.push(((o) => {
            const r = (a) => {
              if (a.target) {
                const l = Ro(a.target);
                o(l, a);
              }
            };
            return window.addEventListener("click", r), () => window.removeEventListener("click", r);
          })((o, r) => {
            o && this.addCustomEvent("Click", o);
            let a = null, l = null;
            if (r && r.target) {
              const c = r.target;
              a = vo(c), l = c.textContent, l && l.length > 2e3 && (l = l.substring(0, 2e3));
            }
            n.addProperties({ clickTextContent: l, clickSelector: a }, { type: "session" });
          })), this.listeners.push(((o) => {
            const r = (a) => {
              if (a.target) {
                const l = Ro(a.target);
                o(l);
              }
            };
            return window.addEventListener("focusin", r), () => window.removeEventListener("focusin", r);
          })((o) => {
            o && this.addCustomEvent("Focus", o);
          })), this.listeners.push(ua((o) => {
            const { name: r, value: a } = o;
            this.recordMetric([{ name: r, value: a, group: window.location.href, category: Re.WebVital }]);
          })), this.sessionShortcut && $l(this.sessionShortcut, () => {
            window.open(this.getCurrentSessionURLWithTimestamp(), "_blank");
          }), this.enablePerformanceRecording && (this.listeners.push(((o, r) => {
            let a = 0, l = 0;
            const c = () => {
              const X = ((/* @__PURE__ */ new Date()).getTime() - r) / 1e3, Z = Ao.memory.jsHeapSizeLimit || 0, V = Ao.memory.usedJSHeapSize || 0;
              o({ jsHeapSizeLimit: Z, usedJSHeapSize: V, relativeTimestamp: X, fps: a });
            };
            let d;
            c(), d = setInterval(() => {
              c();
            }, 5e3);
            let h = 0, p = Date.now();
            const m = function() {
              var X = Date.now();
              h++, X > 1e3 + p && (a = Math.round(1e3 * h / (X - p)), h = 0, p = X), l = requestAnimationFrame(m);
            };
            return m(), () => {
              clearInterval(d), cancelAnimationFrame(l);
            };
          })((o) => {
            this.addCustomEvent("Performance", je(o)), this.recordMetric(Object.entries(o).map(([r, a]) => a ? { name: r, value: a, category: Re.Performance, group: window.location.href } : void 0).filter((r) => r));
          }, this._recordingStartTime)), this.listeners.push(((o, r) => {
            let a = {}, l = 16.666666666666668;
            ga().then((m) => l = m);
            const c = (m) => {
              var X;
              a != null && a.event || (a = { event: m, location: window.location.href, timerStart: (X = window.performance) == null ? void 0 : X.now() }, window.requestAnimationFrame(d));
            }, d = () => {
              if (!(a != null && a.timerStart))
                return;
              const m = window.performance.now() - a.timerStart - l;
              h(m), a = {};
            }, h = (m) => {
              const X = ((/* @__PURE__ */ new Date()).getTime() - r) / 1e3;
              o({ relativeTimestamp: X, jankAmount: m, querySelector: p(), newLocation: window.location.href != a.location ? window.location.href : void 0 });
            }, p = () => {
              var m;
              return (m = a == null ? void 0 : a.event) != null && m.target ? vo(a.event.target) : "";
            };
            return window.addEventListener("click", c, !0), window.addEventListener("keydown", c, !0), () => {
              window.removeEventListener("keydown", c, !0), window.removeEventListener("click", c, !0);
            };
          })((o) => {
            this.addCustomEvent("Jank", je(o)), this.recordMetric([{ name: "Jank", value: o.jankAmount, category: Re.WebVital, group: o.querySelector }]);
          }, this._recordingStartTime))), this._hasPreviouslyInitialized || ((e = window.electron) != null && e.ipcRenderer ? (window.electron.ipcRenderer.on("highlight.run", ({ visible: o }) => {
            this._visibilityHandler(!o);
          }), this.logger.log("Set up Electron highlight.run events.")) : (((o) => {
            let r, a;
            if (document.hidden !== void 0 ? (r = "hidden", a = "visibilitychange") : document.msHidden !== void 0 ? (r = "msHidden", a = "msvisibilitychange") : document.webkitHidden !== void 0 && (r = "webkitHidden", a = "webkitvisibilitychange"), a === void 0)
              return () => {
              };
            if (r === void 0)
              return () => {
              };
            const l = r, c = () => {
              const d = document[l];
              o(!!d);
            };
            document.addEventListener(a, c);
          })((o) => this._visibilityHandler(o)), this.logger.log("Set up document visibility listener.")), this._hasPreviouslyInitialized = !0);
          const s = () => {
            this.hasSessionUnloaded = !0, this.pushPayloadTimerId && (clearTimeout(this.pushPayloadTimerId), this.pushPayloadTimerId = void 0);
          };
          window.addEventListener("beforeunload", s), this.listeners.push(() => window.removeEventListener("beforeunload", s));
        } catch (n) {
          this._isOnLocalHost && (console.error(n), Ut("initializeSession _setupWindowListeners", n));
        }
        const i = () => {
          this.addCustomEvent("Page Unload", ""), tn(this.sessionData);
        };
        if (window.addEventListener("beforeunload", i), this.listeners.push(() => window.removeEventListener("beforeunload", i)), navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)) {
          const n = () => {
            this.addCustomEvent("Page Unload", ""), tn(this.sessionData);
          };
          window.addEventListener("pagehide", n), this.listeners.push(() => window.removeEventListener("beforeunload", n));
        }
      }
      submitViewportMetrics({ height: e, width: i, availHeight: n, availWidth: s }) {
        this.recordMetric([{ name: Ae.ViewportHeight, value: e, category: Re.Device, group: window.location.href }, { name: Ae.ViewportWidth, value: i, category: Re.Device, group: window.location.href }, { name: Ae.ScreenHeight, value: n, category: Re.Device, group: window.location.href }, { name: Ae.ScreenWidth, value: s, category: Re.Device, group: window.location.href }, { name: Ae.ViewportArea, value: e * i, category: Re.Device, group: window.location.href }]);
      }
      recordMetric(e) {
        this._worker.postMessage({ message: { type: Ee.Metrics, metrics: e.map((i) => Ve(U({}, i), { tags: i.tags || [], group: i.group || window.location.href, category: i.category || Re.Frontend, timestamp: /* @__PURE__ */ new Date() })) } });
      }
      stopRecording(e) {
        this.manualStopped = !!e, this.manualStopped && this.addCustomEvent("Stop", "H.stop() was called which stops Highlight from recording."), this.state = "NotRecording", e && this._recordStop && (this._recordStop(), this._recordStop = void 0), this.listeners.forEach((i) => i()), this.listeners = [];
      }
      getCurrentSessionTimestamp() {
        return this._recordingStartTime;
      }
      getCurrentSessionURLWithTimestamp() {
        const e = (/* @__PURE__ */ new Date()).getTime(), { projectID: i, sessionSecureID: n } = this.sessionData, s = (e - this._recordingStartTime) / 1e3;
        return `https://${ir}/${i}/sessions/${n}?ts=${s}`;
      }
      getCurrentSessionURL() {
        const e = this.sessionData.projectID, i = this.sessionData.sessionSecureID;
        return e && i ? `https://${ir}/${e}/sessions/${i}` : null;
      }
      snapshot(e) {
        return ne(this, null, function* () {
          yield Fe.snapshotCanvas(e);
        });
      }
      addSessionFeedback({ timestamp: e, verbatim: i, user_email: n, user_name: s }) {
        var o;
        this._worker.postMessage({ message: { type: Ee.Feedback, verbatim: i, timestamp: e, userName: s || this.sessionData.userIdentifier, userEmail: n || ((o = this.sessionData.userObject) == null ? void 0 : o.name) } });
      }
      _save() {
        return ne(this, null, function* () {
          var e;
          try {
            let i;
            this.state === "Recording" && this.listeners && this.sessionData.sessionStartTime && Date.now() - this.sessionData.sessionStartTime > 144e5 && (this.logger.log("Resetting session", { start: this.sessionData.sessionStartTime }), yield this._reset({})), ((e = this.options) == null ? void 0 : e.sendMode) === "local" && (i = (n) => ne(this, null, function* () {
              let s = new Blob([JSON.stringify({ query: go(Wo), variables: n })], { type: "application/json" });
              return yield window.fetch(`${this._backendUrl}`, { method: "POST", body: s }), 0;
            })), yield this._sendPayload({ sendFn: i }), this.hasPushedData = !0, this.sessionData.lastPushTime = Date.now();
          } catch (i) {
            this._isOnLocalHost && (console.error(i), Ut("_save", i));
          }
          this.state === "Recording" && (this.pushPayloadTimerId && (clearTimeout(this.pushPayloadTimerId), this.pushPayloadTimerId = void 0), this.pushPayloadTimerId = setTimeout(() => {
            this._save();
          }, 2e3));
        });
      }
      addCustomEvent(e, i) {
        if (this.state === "NotRecording") {
          let n;
          const s = () => {
            clearInterval(n), this.state === "Recording" && this.events.length > 0 ? Js(e, i) : n = setTimeout(s, 500);
          };
          n = setTimeout(s, 500);
        } else
          this.state === "Recording" && (this.events.length > 0 || this.hasPushedData) && Js(e, i);
      }
      _sendPayload(e) {
        return ne(this, arguments, function* ({ sendFn: i }) {
          const n = He.getRecordedNetworkResources(this._firstLoadListeners, this._recordingStartTime), s = He.getRecordedWebSocketEvents(this._firstLoadListeners), o = [...this.events], r = [...this._firstLoadListeners.messages], a = [...this._firstLoadListeners.errors], { bytes: l, time: c } = this.enableCanvasRecording ? Ds.canvas : Ds.normal;
          this._eventBytesSinceSnapshot >= l && (/* @__PURE__ */ new Date()).getTime() - this._lastSnapshotTime >= c && this.takeFullSnapshot(), this.logger.log(`Sending: ${o.length} events, ${r.length} messages, ${n.length} network resources, ${a.length} errors 
To: ${this._backendUrl}
Org: ${this.organizationID}
SessionSecureID: ${this.sessionData.sessionSecureID}`);
          const d = Xe(Kt) || "";
          i ? yield i({ session_secure_id: this.sessionData.sessionSecureID, payload_id: this._payloadId.toString(), events: { events: o }, messages: je({ messages: r }), resources: JSON.stringify({ resources: n }), web_socket_events: JSON.stringify({ webSocketEvents: s }), errors: a, is_beacon: !1, has_session_unloaded: this.hasSessionUnloaded }) : this._worker.postMessage({ message: { type: Ee.AsyncEvents, id: this._payloadId, events: o, messages: r, errors: a, resourcesString: JSON.stringify({ resources: n }), webSocketEventsString: JSON.stringify({ webSocketEvents: s }), hasSessionUnloaded: this.hasSessionUnloaded, highlightLogs: d } }), this._payloadId++, we(ce.PAYLOAD_ID, this._payloadId.toString()), He.clearRecordedNetworkResources(this._firstLoadListeners), this.events = this.events.slice(o.length), this._firstLoadListeners.messages = this._firstLoadListeners.messages.slice(r.length), this._firstLoadListeners.errors = this._firstLoadListeners.errors.slice(a.length), pa(d);
        });
      }
      takeFullSnapshot() {
        Fe.takeFullSnapshot(), this._eventBytesSinceSnapshot = 0, this._lastSnapshotTime = (/* @__PURE__ */ new Date()).getTime();
      }
    }
    const Ia = Object.freeze(Object.defineProperty({ __proto__: null, shutdown: () => ne(this, null, function* () {
    }) }, Symbol.toStringTag, { value: "Module" }));
    We.FirstLoadListeners = He, We.GenerateSecureID = Gi, We.Highlight = kn, We.HighlightWarning = Ut, We.MetricCategory = Re, We.getPreviousSessionData = Qs, Object.defineProperty(We, Symbol.toStringTag, { value: "Module" });
  });
})(Ln, Ln.exports);
var Ka = Ln.exports;
const Fa = /* @__PURE__ */ Ya({
  __proto__: null
}, [Ka]);
export {
  Fa as i
};
//# sourceMappingURL=index-BM6bZd7k.js.map
