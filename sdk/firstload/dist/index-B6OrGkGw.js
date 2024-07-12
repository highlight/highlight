var _e = Object.defineProperty, Ne = Object.defineProperties;
var Oe = Object.getOwnPropertyDescriptors;
var I = Object.getOwnPropertySymbols;
var Y = Object.prototype.hasOwnProperty, ee = Object.prototype.propertyIsEnumerable;
var T = (t, e, r) => e in t ? _e(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, k = (t, e) => {
  for (var r in e || (e = {}))
    Y.call(e, r) && T(t, r, e[r]);
  if (I)
    for (var r of I(e))
      ee.call(e, r) && T(t, r, e[r]);
  return t;
}, v = (t, e) => Ne(t, Oe(e));
var U = (t, e) => {
  var r = {};
  for (var i in t)
    Y.call(t, i) && e.indexOf(i) < 0 && (r[i] = t[i]);
  if (t != null && I)
    for (var i of I(t))
      e.indexOf(i) < 0 && ee.call(t, i) && (r[i] = t[i]);
  return r;
};
var y = (t, e, r) => (T(t, typeof e != "symbol" ? e + "" : e, r), r);
var _ = (t, e, r) => new Promise((i, s) => {
  var l = (n) => {
    try {
      d(r.next(n));
    } catch (c) {
      s(c);
    }
  }, a = (n) => {
    try {
      d(r.throw(n));
    } catch (c) {
      s(c);
    }
  }, d = (n) => n.done ? i(n.value) : Promise.resolve(n.value).then(l, a);
  d((r = r.apply(t, e)).next());
});
const Ce = ({ apiKey: t }) => {
  (function(e, r) {
    var i = e.amplitude || { _q: [], _iq: {} }, s = r.createElement("script");
    s.type = "text/javascript", s.integrity = "sha384-+EO59vL/X7v6VE2s6/F4HxfHlK0nDUVWKVg8K9oUlvffAeeaShVBmbORTC2D3UF+", s.crossOrigin = "anonymous", s.async = !0, s.src = "https://cdn.amplitude.com/libs/amplitude-8.17.0-min.gz.js", s.onload = function() {
      e.amplitude.runQueuedFunctions || console.log("[Amplitude] Error: could not load SDK"), amplitude.getInstance().init(t);
    };
    var l = r.getElementsByTagName("script")[0];
    l.parentNode.insertBefore(s, l);
    function a(f, w) {
      f.prototype[w] = function() {
        return this._q.push([w].concat(Array.prototype.slice.call(arguments, 0))), this;
      };
    }
    for (var d = function() {
      return this._q = [], this;
    }, n = [
      "add",
      "append",
      "clearAll",
      "prepend",
      "set",
      "setOnce",
      "unset",
      "preInsert",
      "postInsert",
      "remove"
    ], c = 0; c < n.length; c++)
      a(d, n[c]);
    i.Identify = d;
    for (var o = function() {
      return this._q = [], this;
    }, u = [
      "setProductId",
      "setQuantity",
      "setPrice",
      "setRevenueType",
      "setEventProperties"
    ], g = 0; g < u.length; g++)
      a(o, u[g]);
    i.Revenue = o;
    var h = [
      "init",
      "logEvent",
      "logRevenue",
      "setUserId",
      "setUserProperties",
      "setOptOut",
      "setVersionName",
      "setDomain",
      "setDeviceId",
      "enableTracking",
      "setGlobalUserProperties",
      "identify",
      "clearUserProperties",
      "setGroup",
      "logRevenueV2",
      "regenerateDeviceId",
      "groupIdentify",
      "onInit",
      "logEventWithTimestamp",
      "logEventWithGroups",
      "setSessionId",
      "resetSessionId"
    ];
    function m(f) {
      function w(R) {
        f[R] = function() {
          f._q.push([R].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }
      for (var S = 0; S < h.length; S++)
        w(h[S]);
    }
    m(i), i.getInstance = function(f) {
      return f = (!f || f.length === 0 ? "$default_instance" : f).toLowerCase(), Object.prototype.hasOwnProperty.call(i._iq, f) || (i._iq[f] = { _q: [] }, m(i._iq[f])), i._iq[f];
    }, e.amplitude = i;
  })(window, document);
};
var H;
(function(t) {
  t.RECORDING_START_TIME = "highlightRecordingStartTime", t.SEGMENT_LAST_SENT_HASH_KEY = "HIGHLIGHT_SEGMENT_LAST_SENT_HASH_KEY", t.SESSION_DATA = "sessionData", t.SESSION_SECURE_ID = "sessionSecureID", t.USER_IDENTIFIER = "highlightIdentifier", t.USER_OBJECT = "highlightUserObject", t.PAYLOAD_ID = "payloadId";
})(H || (H = {}));
const Le = ({ projectToken: t }) => {
  if (window.mixpanel)
    return;
  (function(r, i) {
    if (!i.__SV) {
      var s, l;
      window.mixpanel = i, i._i = [], i.init = function(a, d, n) {
        function c(g, h) {
          var m = h.split(".");
          m.length == 2 && (g = g[m[0]], h = m[1]), g[h] = function() {
            g.push([h].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        var o = i;
        for (typeof n != "undefined" ? o = i[n] = [] : n = "mixpanel", o.people = o.people || [], o.toString = function(g) {
          var h = "mixpanel";
          return n !== "mixpanel" && (h += "." + n), g || (h += " (stub)"), h;
        }, o.people.toString = function() {
          return o.toString(1) + ".people (stub)";
        }, s = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" "), l = 0; l < s.length; l++)
          c(o, s[l]);
        var u = "set set_once union unset remove delete".split(" ");
        o.get_group = function() {
          function g(w) {
            h[w] = function() {
              call2_args = arguments, call2 = [w].concat(Array.prototype.slice.call(call2_args, 0)), o.push([m, call2]);
            };
          }
          for (var h = {}, m = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)), f = 0; f < u.length; f++)
            g(u[f]);
          return h;
        }, i._i.push([a, d, n]);
      }, i.__SV = 1.2;
    }
  })(document, window.mixpanel || []);
  const e = document.createElement("script");
  e.src = He, document.head.appendChild(e), e.addEventListener("load", () => {
    var r;
    (r = window.mixpanel) == null || r.init(t);
  });
}, He = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
function Pe(t, e, r) {
  try {
    if (!(e in t))
      return () => {
      };
    const i = t[e], s = r(i);
    return typeof s == "function" && (s.prototype = s.prototype || {}, Object.defineProperties(s, {
      __rrweb_original__: {
        enumerable: !1,
        value: i
      }
    })), t[e] = s, () => {
      t[e] = i;
    };
  } catch (i) {
    return () => {
    };
  }
}
function Ie(t) {
  if (!t || !t.outerHTML)
    return "";
  let e = "";
  for (; t.parentElement; ) {
    let r = t.localName;
    if (!r)
      break;
    r = r.toLowerCase();
    let i = t.parentElement, s = [];
    if (i.children && i.children.length > 0)
      for (let l = 0; l < i.children.length; l++) {
        let a = i.children[l];
        a.localName && a.localName.toLowerCase && a.localName.toLowerCase() === r && s.push(a);
      }
    s.length > 1 && (r += ":eq(" + s.indexOf(t) + ")"), e = r + (e ? ">" + e : ""), t = i;
  }
  return e;
}
function M(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
function ge(t, e) {
  if (e === 0)
    return !0;
  const r = Object.keys(t);
  for (const i of r)
    if (M(t[i]) && ge(t[i], e - 1))
      return !0;
  return !1;
}
function W(t, e) {
  const r = {
    numOfKeysLimit: 50,
    depthOfLimit: 4
  };
  Object.assign(r, e);
  const i = [], s = [];
  return JSON.stringify(t, function(d, n) {
    if (i.length > 0) {
      const c = i.indexOf(this);
      ~c ? i.splice(c + 1) : i.push(this), ~c ? s.splice(c, 1 / 0, d) : s.push(d), ~i.indexOf(n) && (i[0] === n ? n = "[Circular ~]" : n = "[Circular ~." + s.slice(0, i.indexOf(n)).join(".") + "]");
    } else
      i.push(n);
    if (n == null)
      return n;
    if (l(n))
      return a(n);
    if (n instanceof Event) {
      const c = {};
      for (const o in n) {
        const u = n[o];
        Array.isArray(u) ? c[o] = Ie(u.length ? u[0] : null) : c[o] = u;
      }
      return c;
    } else {
      if (n instanceof Node)
        return n instanceof HTMLElement ? n ? n.outerHTML : "" : n.nodeName;
      if (n instanceof Error)
        return n.name + ": " + n.message;
    }
    return n;
  });
  function l(d) {
    return M(d) && Object.keys(d).length > r.numOfKeysLimit || typeof d == "function" ? !0 : d instanceof Event && d.isTrusted === !1 ? Object.keys(d).length === 1 : !!(M(d) && ge(d, r.depthOfLimit));
  }
  function a(d) {
    let n = d.toString();
    return r.stringLengthLimit && n.length > r.stringLengthLimit && (n = `${n.slice(0, r.stringLengthLimit)}...`), n;
  }
}
var he = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : {};
function me(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function gt(t) {
  if (t.__esModule)
    return t;
  var e = t.default;
  if (typeof e == "function") {
    var r = function i() {
      return this instanceof i ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    r.prototype = e.prototype;
  } else
    r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(t).forEach(function(i) {
    var s = Object.getOwnPropertyDescriptor(t, i);
    Object.defineProperty(r, i, s.get ? s : {
      enumerable: !0,
      get: function() {
        return t[i];
      }
    });
  }), r;
}
var we = { exports: {} }, F = { exports: {} }, te;
function xe() {
  return te || (te = 1, function(t, e) {
    (function(r, i) {
      t.exports = i();
    })(he, function() {
      function r(f) {
        return !isNaN(parseFloat(f)) && isFinite(f);
      }
      function i(f) {
        return f.charAt(0).toUpperCase() + f.substring(1);
      }
      function s(f) {
        return function() {
          return this[f];
        };
      }
      var l = ["isConstructor", "isEval", "isNative", "isToplevel"], a = ["columnNumber", "lineNumber"], d = ["fileName", "functionName", "source"], n = ["args"], c = ["evalOrigin"], o = l.concat(a, d, n, c);
      function u(f) {
        if (f)
          for (var w = 0; w < o.length; w++)
            f[o[w]] !== void 0 && this["set" + i(o[w])](f[o[w]]);
      }
      u.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(f) {
          if (Object.prototype.toString.call(f) !== "[object Array]")
            throw new TypeError("Args must be an Array");
          this.args = f;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(f) {
          if (f instanceof u)
            this.evalOrigin = f;
          else if (f instanceof Object)
            this.evalOrigin = new u(f);
          else
            throw new TypeError("Eval Origin must be an Object or StackFrame");
        },
        toString: function() {
          var f = this.getFileName() || "", w = this.getLineNumber() || "", S = this.getColumnNumber() || "", R = this.getFunctionName() || "";
          return this.getIsEval() ? f ? "[eval] (" + f + ":" + w + ":" + S + ")" : "[eval]:" + w + ":" + S : R ? R + " (" + f + ":" + w + ":" + S + ")" : f + ":" + w + ":" + S;
        }
      }, u.fromString = function(w) {
        var S = w.indexOf("("), R = w.lastIndexOf(")"), P = w.substring(0, S), E = w.substring(S + 1, R).split(","), C = w.substring(R + 1);
        if (C.indexOf("@") === 0)
          var L = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(C, ""), Re = L[1], ve = L[2], Ee = L[3];
        return new u({
          functionName: P,
          args: E || void 0,
          fileName: Re,
          lineNumber: ve || void 0,
          columnNumber: Ee || void 0
        });
      };
      for (var g = 0; g < l.length; g++)
        u.prototype["get" + i(l[g])] = s(l[g]), u.prototype["set" + i(l[g])] = /* @__PURE__ */ function(f) {
          return function(w) {
            this[f] = !!w;
          };
        }(l[g]);
      for (var h = 0; h < a.length; h++)
        u.prototype["get" + i(a[h])] = s(a[h]), u.prototype["set" + i(a[h])] = /* @__PURE__ */ function(f) {
          return function(w) {
            if (!r(w))
              throw new TypeError(f + " must be a Number");
            this[f] = Number(w);
          };
        }(a[h]);
      for (var m = 0; m < d.length; m++)
        u.prototype["get" + i(d[m])] = s(d[m]), u.prototype["set" + i(d[m])] = /* @__PURE__ */ function(f) {
          return function(w) {
            this[f] = String(w);
          };
        }(d[m]);
      return u;
    });
  }(F)), F.exports;
}
(function(t, e) {
  (function(r, i) {
    t.exports = i(xe());
  })(he, function(i) {
    var s = /(^|@)\S+:\d+/, l = /^\s*at .*(\S+:\d+|\(native\))/m, a = /^(eval@)?(\[native code])?$/;
    return {
      /**
       * Given an Error object, extract the most information from it.
       *
       * @param {Error} error object
       * @return {Array} of StackFrames
       */
      parse: function(n) {
        if (typeof n.stacktrace != "undefined" || typeof n["opera#sourceloc"] != "undefined")
          return this.parseOpera(n);
        if (n.stack && n.stack.match(l))
          return this.parseV8OrIE(n);
        if (n.stack)
          return this.parseFFOrSafari(n);
        throw new Error("Cannot parse given Error object");
      },
      // Separate line and column numbers from a string of the form: (URI:Line:Column)
      extractLocation: function(n) {
        if (n.indexOf(":") === -1)
          return [n];
        var c = /(.+?)(?::(\d+))?(?::(\d+))?$/, o = c.exec(n.replace(/[()]/g, ""));
        return [o[1], o[2] || void 0, o[3] || void 0];
      },
      parseV8OrIE: function(n) {
        var c = n.stack.split(`
`).filter(function(o) {
          return !!o.match(l);
        }, this);
        return c.map(function(o) {
          o.indexOf("(eval ") > -1 && (o = o.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, ""));
          var u = o.replace(/^\s+/, "").replace(/\(eval code/g, "("), g = u.match(/ (\((.+):(\d+):(\d+)\)$)/);
          u = g ? u.replace(g[0], "") : u;
          var h = u.split(/\s+/).slice(1), m = this.extractLocation(g ? g[1] : h.pop()), f = h.join(" ") || void 0, w = ["eval", "<anonymous>"].indexOf(m[0]) > -1 ? void 0 : m[0];
          return new i({
            functionName: f,
            fileName: w,
            lineNumber: m[1],
            columnNumber: m[2],
            source: o
          });
        }, this);
      },
      parseFFOrSafari: function(n) {
        var c = n.stack.split(`
`).filter(function(o) {
          return !o.match(a);
        }, this);
        return c.map(function(o) {
          if (o.indexOf(" > eval") > -1 && (o = o.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), o.indexOf("@") === -1 && o.indexOf(":") === -1)
            return new i({
              functionName: o
            });
          var u = /((.*".+"[^@]*)?[^@]*)(?:@)/, g = o.match(u), h = g && g[1] ? g[1] : void 0, m = this.extractLocation(o.replace(u, ""));
          return new i({
            functionName: h,
            fileName: m[0],
            lineNumber: m[1],
            columnNumber: m[2],
            source: o
          });
        }, this);
      },
      parseOpera: function(n) {
        return !n.stacktrace || n.message.indexOf(`
`) > -1 && n.message.split(`
`).length > n.stacktrace.split(`
`).length ? this.parseOpera9(n) : n.stack ? this.parseOpera11(n) : this.parseOpera10(n);
      },
      parseOpera9: function(n) {
        for (var c = /Line (\d+).*script (?:in )?(\S+)/i, o = n.message.split(`
`), u = [], g = 2, h = o.length; g < h; g += 2) {
          var m = c.exec(o[g]);
          m && u.push(new i({
            fileName: m[2],
            lineNumber: m[1],
            source: o[g]
          }));
        }
        return u;
      },
      parseOpera10: function(n) {
        for (var c = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, o = n.stacktrace.split(`
`), u = [], g = 0, h = o.length; g < h; g += 2) {
          var m = c.exec(o[g]);
          m && u.push(
            new i({
              functionName: m[3] || void 0,
              fileName: m[2],
              lineNumber: m[1],
              source: o[g]
            })
          );
        }
        return u;
      },
      // Opera 10.65+ Error.stack very similar to FF/Safari
      parseOpera11: function(n) {
        var c = n.stack.split(`
`).filter(function(o) {
          return !!o.match(s) && !o.match(/^Error created at/);
        }, this);
        return c.map(function(o) {
          var u = o.split("@"), g = this.extractLocation(u.pop()), h = u.shift() || "", m = h.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0, f;
          h.match(/\(([^)]*)\)/) && (f = h.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
          var w = f === void 0 || f === "[arguments not available]" ? void 0 : f.split(",");
          return new i({
            functionName: m,
            args: w,
            fileName: g[0],
            lineNumber: g[1],
            columnNumber: g[2],
            source: o
          });
        }, this);
      }
    };
  });
})(we);
var Ae = we.exports;
const D = /* @__PURE__ */ me(Ae);
function qe(t, e) {
  const r = e.logger;
  if (!r)
    return () => {
    };
  let i;
  typeof r == "string" ? i = window[r] : i = r;
  const s = [];
  if (e.level.includes("error") && window) {
    const a = (d) => {
      const { message: n, error: c } = d;
      let o = [];
      c && (o = D.parse(c));
      const u = [
        W(n, e.stringifyOptions)
      ];
      t({
        type: "Error",
        trace: o,
        time: Date.now(),
        value: u
      });
    };
    window.addEventListener("error", a), s.push(() => {
      window && window.removeEventListener("error", a);
    });
  }
  for (const a of e.level)
    s.push(l(i, a));
  return () => {
    s.forEach((a) => a());
  };
  function l(a, d) {
    return a[d] ? Pe(a, d, (n) => (...c) => {
      n.apply(this, c);
      try {
        const o = D.parse(new Error()), u = e.serializeConsoleAttributes ? c.map((g) => typeof g == "object" ? W(g, e.stringifyOptions) : g) : c.filter((g) => typeof g != "object").map((g) => `${g}`);
        t({
          type: d,
          trace: o.slice(1),
          value: u,
          attributes: W(c.filter((g) => typeof g == "object").reduce((g, h) => k(k({}, g), h), {}), e.stringifyOptions),
          time: Date.now()
        });
      } catch (o) {
        n("highlight logger error:", o, ...c);
      }
    }) : () => {
    };
  }
}
var $ = { exports: {} };
(function(t, e) {
  e = t.exports = r, e.getSerialize = i;
  function r(s, l, a, d) {
    return JSON.stringify(s, i(l, d), a);
  }
  function i(s, l) {
    var a = [], d = [];
    return l == null && (l = function(n, c) {
      return a[0] === c ? "[Circular ~]" : "[Circular ~." + d.slice(0, a.indexOf(c)).join(".") + "]";
    }), function(n, c) {
      if (a.length > 0) {
        var o = a.indexOf(this);
        ~o ? a.splice(o + 1) : a.push(this), ~o ? d.splice(o, 1 / 0, n) : d.push(n), ~a.indexOf(c) && (c = l.call(this, n, c));
      } else
        a.push(c);
      return s == null ? c : s.call(this, n, c);
    };
  }
})($, $.exports);
var De = $.exports;
const B = /* @__PURE__ */ me(De);
function z(t, e, r, i) {
  var d, n, c, o;
  let s = [];
  try {
    s = D.parse(i != null ? i : e);
  } catch (u) {
    s = D.parse(new Error());
  }
  let l = {};
  e instanceof Error && (e = e.message, e.cause && (l = { "exception.cause": e.cause }));
  const a = Te(s);
  t({
    event: B(e),
    type: "window.onerror",
    url: window.location.href,
    source: r != null ? r : "",
    lineNumber: (d = a[0]) != null && d.lineNumber ? (n = a[0]) == null ? void 0 : n.lineNumber : 0,
    columnNumber: (c = a[0]) != null && c.columnNumber ? (o = a[0]) == null ? void 0 : o.columnNumber : 0,
    stackTrace: a,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    payload: l ? B(l) : void 0
  });
}
const Be = (t, { enablePromisePatch: e }) => {
  if (typeof window == "undefined")
    return () => {
    };
  const r = window.onerror = (a, d, n, c, o) => {
    z(t, a, d, o);
  }, i = window.onunhandledrejection = (a) => {
    if (a.reason) {
      const d = a.promise;
      d.getStack ? z(t, a.reason, a.type, d.getStack()) : z(t, a.reason, a.type);
    }
  }, s = window.Promise, l = class extends s {
    constructor(n) {
      super(n);
      y(this, "promiseCreationError");
      this.promiseCreationError = new Error();
    }
    getStack() {
      return this.promiseCreationError;
    }
    static shouldPatch() {
      const n = typeof window.Zone == "undefined";
      return e && n;
    }
  };
  return l.shouldPatch() && (window.Promise = l), () => {
    window.Promise = s, window.onunhandledrejection = i, window.onerror = r;
  };
}, Te = (t) => {
  var r, i;
  if (t.length === 0)
    return t;
  const e = t[0];
  return (r = e.fileName) != null && r.includes("highlight.run") || (i = e.fileName) != null && i.includes("highlight.io") || e.functionName === "new highlightPromise" ? t.slice(1) : t;
}, Ue = [
  "assert",
  "count",
  "countReset",
  "debug",
  "dir",
  "dirxml",
  "error",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "table",
  "time",
  "timeEnd",
  "timeLog",
  "trace",
  "warn"
];
var re;
(function(t) {
  t.DeviceMemory = "DeviceMemory", t.ViewportHeight = "ViewportHeight", t.ViewportWidth = "ViewportWidth", t.ScreenHeight = "ScreenHeight", t.ScreenWidth = "ScreenWidth", t.ViewportArea = "ViewportArea";
})(re || (re = {}));
var ne;
(function(t) {
  t.Device = "Device", t.WebVital = "WebVital", t.Performance = "Performance", t.Frontend = "Frontend", t.Backend = "Backend";
})(ne || (ne = {}));
const ie = [
  '["\\"Script error.\\""]',
  '"Script error."',
  '["\\"Load failed.\\""]',
  '"Load failed."',
  '["\\"Network request failed.\\""]',
  '"Network request failed."',
  '["\\"Document is not focused.\\""]',
  '"Document is not focused."',
  '["\\"Failed to fetch\\""]',
  '"Failed to fetch"',
  '[{"isTrusted":true}]',
  '{"isTrusted":true}',
  '["{}"]',
  '"{}"',
  '[""]',
  '""',
  '["\\"\\""]',
  '""'
], se = [
  "websocket error",
  '\\"ResizeObserver loop'
], oe = (t, e, r) => {
  const i = We(e, t.headers, r);
  return v(k({}, t), {
    headers: i
  });
}, We = (t, e, r) => {
  var s, l;
  const i = k({}, e);
  return r ? ((s = Object.keys(i)) == null || s.forEach((a) => {
    [...r].includes(a == null ? void 0 : a.toLowerCase()) || (i[a] = "[REDACTED]");
  }), i) : ((l = Object.keys(i)) == null || l.forEach((a) => {
    [...Fe, ...t].includes(a == null ? void 0 : a.toLowerCase()) && (i[a] = "[REDACTED]");
  }), i);
}, Fe = [
  "authorization",
  "cookie",
  "proxy-authorization",
  "token"
], ze = [
  "https://www.googleapis.com/identitytoolkit",
  "https://securetoken.googleapis.com"
];
let je = "localStorage";
class Me {
  constructor() {
    y(this, "storage", {});
  }
  getItem(e) {
    var r;
    return (r = this.storage[e]) != null ? r : "";
  }
  setItem(e, r) {
    this.storage[e] = r;
  }
  removeItem(e) {
    delete this.storage[e];
  }
}
let $e = new Me();
const pe = () => {
  try {
    switch (je) {
      case "localStorage":
        return window.localStorage;
      case "sessionStorage":
        return window.sessionStorage;
    }
  } catch (t) {
    return $e;
  }
}, ye = (t) => pe().getItem(t), Ve = (t, e) => pe().setItem(t, e), Ke = 15 * 60 * 1e3, Ge = () => {
  let t = JSON.parse(ye(H.SESSION_DATA) || "{}");
  if (t && t.lastPushTime && Date.now() - t.lastPushTime < Ke)
    return t;
}, be = function() {
  var t;
  return (t = ye(H.SESSION_SECURE_ID)) != null ? t : "";
};
var Je = { BASE_URL: "/", MODE: "production", DEV: !1, PROD: !0, SSR: !1 };
const ke = "X-Highlight-Request", ae = (t) => {
  let e = t;
  return !t.startsWith("https://") && !t.startsWith("http://") && (e = `${window.location.origin}${e}`), e.replace(/\/+$/, "");
}, Xe = (t, { headersToRedact: e, headersToRecord: r, requestResponseSanitizer: i }) => {
  var n, c;
  let s = t;
  if (i) {
    let u = !0;
    try {
      s.request.body = JSON.parse(s.request.body);
    } catch (h) {
      u = !1;
    }
    let g = !0;
    try {
      s.response.body = JSON.parse(s.response.body);
    } catch (h) {
      g = !1;
    }
    try {
      s = i(s);
    } catch (h) {
    } finally {
      u = u && !!((n = s == null ? void 0 : s.request) != null && n.body), g = g && !!((c = s == null ? void 0 : s.response) != null && c.body), u && (s.request.body = JSON.stringify(s.request.body)), g && (s.response.body = JSON.stringify(s.response.body));
    }
    if (!s)
      return null;
  }
  const o = s, { request: l, response: a } = o, d = U(o, ["request", "response"]);
  return k({
    request: oe(l, e, r),
    response: oe(a, e, r)
  }, d);
}, ce = (t, e, r, i) => {
  t.sort((n, c) => n.responseEnd - c.responseEnd);
  const s = {
    xmlhttprequest: {},
    others: {},
    fetch: {}
  }, l = t.reduce((n, c) => {
    const o = ae(c.name);
    return c.initiatorType === r ? n[r][o] = [
      ...n[r][o] || [],
      c
    ] : n.others[o] = [
      ...n.others[o] || [],
      c
    ], n;
  }, s);
  let a = {};
  a = e.reduce((n, c) => {
    const o = ae(c.request.url);
    return n[o] = [...n[o] || [], c], n;
  }, a);
  for (let n in l[r]) {
    const c = l[r][n], o = a[n];
    if (!o)
      continue;
    const u = Math.max(c.length - o.length, 0);
    for (let g = u; g < c.length; g++)
      c[g] && (c[g].requestResponsePair = o[g - u]);
  }
  let d = [];
  for (let n in l)
    for (let c in l[n])
      d = d.concat(l[n][c]);
  return d.sort((n, c) => n.fetchStart - c.fetchStart).reduce((n, c) => {
    let o = c.requestResponsePair;
    return o && (o = Xe(c.requestResponsePair, i), !o) || (c.toJSON = function() {
      const u = window.performance.timeOrigin;
      return {
        initiatorType: this.initiatorType,
        startTimeAbs: u + this.startTime,
        connectStartAbs: u + this.connectStart,
        connectEndAbs: u + this.connectEnd,
        domainLookupStartAbs: u + this.domainLookupStart,
        domainLookupEndAbs: u + this.domainLookupEnd,
        fetchStartAbs: u + this.fetchStart,
        redirectStartAbs: u + this.redirectStart,
        redirectEndAbs: u + this.redirectEnd,
        requestStartAbs: u + this.requestStart,
        responseStartAbs: u + this.responseStart,
        responseEndAbs: u + this.responseEnd,
        secureConnectionStartAbs: u + this.secureConnectionStart,
        workerStartAbs: u + this.workerStart,
        name: this.name,
        transferSize: this.transferSize,
        encodedBodySize: this.encodedBodySize,
        decodedBodySize: this.decodedBodySize,
        nextHopProtocol: this.nextHopProtocol,
        requestResponsePairs: o
      };
    }, n.push(c)), n;
  }, []);
}, Qe = (t, e) => {
  var r;
  return t.toLocaleLowerCase().includes((r = Je.REACT_APP_PUBLIC_GRAPH_URI) != null ? r : "highlight.io") || t.toLocaleLowerCase().includes("highlight.io") || t.toLocaleLowerCase().includes(e);
}, J = (t, e, r) => !Qe(t, e) || X(t, r), X = (t, e) => {
  var s;
  let r = [];
  e === !0 ? (r = ["localhost", /^\//], (s = window == null ? void 0 : window.location) != null && s.host && r.push(window.location.host)) : e instanceof Array && (r = e);
  let i = !1;
  return r.forEach((l) => {
    t.match(l) && (i = !0);
  }), i;
};
function Ze(t) {
  for (var e = "", r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", i = r.length, s = 0; s < t; s++)
    e += r.charAt(Math.floor(Math.random() * i));
  return e;
}
const Q = () => [be(), Ze(10)], Se = (t, e) => t + "/" + e, Ye = (t, e, r, i, s, l) => {
  const a = XMLHttpRequest.prototype, d = a.open, n = a.send, c = a.setRequestHeader;
  return a.open = function(o, u) {
    return typeof u == "string" ? this._url = u : this._url = u.toString(), this._method = o, this._requestHeaders = {}, this._shouldRecordHeaderAndBody = !i.some((g) => this._url.toLowerCase().includes(g)), d.apply(this, arguments);
  }, a.setRequestHeader = function(o, u) {
    return this._requestHeaders[o] = u, c.apply(this, arguments);
  }, a.send = function(o) {
    if (!J(this._url, e, r))
      return n.apply(this, arguments);
    const [u, g] = Q();
    X(this._url, r) && this.setRequestHeader(ke, Se(u, g));
    const h = this._shouldRecordHeaderAndBody, m = {
      sessionSecureID: u,
      id: g,
      url: this._url,
      verb: this._method,
      headers: h ? this._requestHeaders : {},
      body: void 0
    };
    if (h && o) {
      const f = le(o, m.url);
      f && (this._body = f, m.body = O(f, s, l, m.headers));
    }
    return this.addEventListener("load", function() {
      return _(this, null, function* () {
        const f = {
          status: this.status,
          headers: {},
          body: void 0
        };
        if (h) {
          const R = this.getAllResponseHeaders().trim().split(/[\r\n]+/), P = {};
          if (R.forEach(function(E) {
            const C = E.split(": "), L = C.shift();
            P[L] = C.join(": ");
          }), f.headers = P, o) {
            const E = le(o, m.url);
            E && (m.body = O(E, s, l, f.headers));
          }
          if (this.responseType === "" || this.responseType === "text")
            f.body = O(this.responseText, s, l, f.headers), f.size = this.responseText.length * 8;
          else if (this.responseType === "blob") {
            if (this.response instanceof Blob)
              try {
                const E = yield this.response.text();
                f.body = O(E, s, l, f.headers), f.size = this.response.size;
              } catch (E) {
              }
          } else
            try {
              f.body = O(this.response, s, l, f.headers);
            } catch (E) {
            }
        }
        t({
          request: m,
          response: f,
          urlBlocked: !h
        });
      });
    }), this.addEventListener("error", function() {
      return _(this, null, function* () {
        const f = {
          status: this.status,
          headers: void 0,
          body: void 0
        };
        t({
          request: m,
          response: f,
          urlBlocked: !1
        });
      });
    }), n.apply(this, arguments);
  }, () => {
    a.open = d, a.send = n, a.setRequestHeader = c;
  };
}, le = (t, e) => {
  if (typeof t == "string") {
    if (!((e != null && e.includes("localhost") || e != null && e.includes("highlight.run")) && t.includes("pushPayload")))
      return t;
  } else if (typeof t == "object" || typeof t == "number" || typeof t == "boolean")
    return B(t);
  return null;
}, de = 64 * 1024, et = {
  "application/json": 64 * 1024 * 1024,
  // MB
  "text/plain": 64 * 1024 * 1024
  // MB
}, O = (t, e, r, i) => {
  var l, a, d;
  let s = de;
  if (i) {
    let n = "";
    typeof i.get == "function" ? n = (l = i.get("content-type")) != null ? l : "" : n = (a = i["content-type"]) != null ? a : "";
    try {
      n = n.split(";")[0];
    } catch (c) {
    }
    s = (d = et[n]) != null ? d : de;
  }
  if (t) {
    if (e)
      try {
        const n = JSON.parse(t);
        Array.isArray(n) ? n.forEach((c) => {
          Object.keys(c).forEach((o) => {
            e.includes(o.toLocaleLowerCase()) && (c[o] = "[REDACTED]");
          });
        }) : Object.keys(n).forEach((c) => {
          e.includes(c.toLocaleLowerCase()) && (n[c] = "[REDACTED]");
        }), t = JSON.stringify(n);
      } catch (n) {
      }
    if (r)
      try {
        const n = JSON.parse(t);
        Object.keys(n).forEach((c) => {
          r.includes(c.toLocaleLowerCase()) || (n[c] = "[REDACTED]");
        }), t = JSON.stringify(n);
      } catch (n) {
      }
  }
  try {
    t = t.slice(0, s);
  } catch (n) {
  }
  return t;
}, tt = (t, e, r, i, s, l) => {
  const a = window._fetchProxy;
  return window._fetchProxy = function(d, n) {
    const { method: c, url: o } = rt(d, n);
    if (!J(o, e, r))
      return a.call(this, d, n);
    const [u, g] = Q();
    if (X(o, r)) {
      n = n || {};
      let w = new Headers(n.headers);
      d instanceof Request && [...d.headers].forEach(([S, R]) => w.set(S, R)), w.set(ke, Se(u, g)), n.headers = Object.fromEntries(w.entries());
    }
    const h = {
      sessionSecureID: u,
      id: g,
      headers: {},
      body: void 0,
      url: o,
      verb: c
    }, m = !i.some((w) => o.toLowerCase().includes(w));
    m && (h.headers = Object.fromEntries(new Headers(n == null ? void 0 : n.headers).entries()), h.body = O(n == null ? void 0 : n.body, s, l, n == null ? void 0 : n.headers));
    let f = a.call(this, d, n);
    return nt(f, h, t, m, s, l), f;
  }, () => {
    window._fetchProxy = a;
  };
}, rt = (t, e) => {
  const r = e && e.method || typeof t == "object" && "method" in t && t.method || "GET";
  let i;
  return typeof t == "object" ? "url" in t && t.url ? i = t.url : i = t.toString() : i = t, {
    method: r,
    url: i
  };
}, nt = (t, e, r, i, s, l) => {
  const a = (d) => _(void 0, null, function* () {
    let n = {
      body: void 0,
      headers: void 0,
      status: 0,
      size: 0
    }, c = !1, o = !i;
    "stack" in d || d instanceof Error ? (n = v(k({}, n), {
      body: d.message,
      status: 0,
      size: void 0
    }), c = !0) : "status" in d && (n = v(k({}, n), {
      status: d.status
    }), i && (n.body = yield it(d, l, s), n.headers = Object.fromEntries(d.headers.entries()), n.size = n.body.length * 8), (d.type === "opaque" || d.type === "opaqueredirect") && (o = !0, n = v(k({}, n), {
      body: "CORS blocked request"
    })), c = !0), c && r({
      request: e,
      response: n,
      urlBlocked: o
    });
  });
  t.then(a).catch(() => {
  });
}, it = (t, e, r) => _(void 0, null, function* () {
  let i;
  try {
    const l = t.clone().body;
    if (l) {
      let a = l.getReader(), d = new TextDecoder(), n, c = "";
      for (; !(n = yield a.read()).done; ) {
        let o = n.value;
        c += d.decode(o);
      }
      i = c, i = O(i, r, e, t.headers);
    } else
      i = "";
  } catch (s) {
    i = `Unable to clone response: ${s}`;
  }
  return i;
}), st = (t, e, r) => {
  const i = window._highlightWebSocketRequestCallback;
  window._highlightWebSocketRequestCallback = t;
  const s = window._highlightWebSocketEventCallback;
  return window._highlightWebSocketEventCallback = (l) => {
    const u = l, { message: a, size: d } = u, n = U(u, ["message", "size"]), o = r.some((g) => l.name.toLowerCase().includes(g)) ? n : l;
    e(o);
  }, () => {
    window._highlightWebSocketRequestCallback = i, window._highlightWebSocketEventCallback = s;
  };
}, ot = ({ xhrCallback: t, fetchCallback: e, webSocketRequestCallback: r, webSocketEventCallback: i, disableWebSocketRecording: s, bodyKeysToRedact: l, backendUrl: a, tracingOrigins: d, urlBlocklist: n, sessionSecureID: c, bodyKeysToRecord: o }) => {
  const u = Ye(t, a, d, n, l, o), g = tt(e, a, d, n, l, o), h = s ? () => {
  } : st(r, i, n);
  return () => {
    u(), g(), h();
  };
};
var at = { BASE_URL: "/", MODE: "production", DEV: !1, PROD: !0, SSR: !1 };
class Z {
  constructor(e) {
    y(this, "disableConsoleRecording");
    y(this, "reportConsoleErrors");
    y(this, "enablePromisePatch");
    y(this, "consoleMethodsToRecord");
    y(this, "listeners");
    y(this, "errors");
    y(this, "messages");
    // The properties below were added in 4.0.0 (Feb 2022), and are patched in by client via setupNetworkListeners()
    y(this, "options");
    y(this, "hasNetworkRecording", !0);
    y(this, "_backendUrl");
    y(this, "disableNetworkRecording");
    y(this, "enableRecordingNetworkContents");
    y(this, "xhrNetworkContents");
    y(this, "fetchNetworkContents");
    y(this, "disableRecordingWebSocketContents");
    y(this, "webSocketNetworkContents");
    y(this, "webSocketEventContents");
    y(this, "tracingOrigins");
    y(this, "networkHeadersToRedact");
    y(this, "networkBodyKeysToRedact");
    y(this, "networkBodyKeysToRecord");
    y(this, "networkHeaderKeysToRecord");
    y(this, "lastNetworkRequestTimestamp");
    y(this, "urlBlocklist");
    y(this, "requestResponseSanitizer");
    var r, i;
    this.options = e, this.disableConsoleRecording = !!e.disableConsoleRecording, this.reportConsoleErrors = (r = e.reportConsoleErrors) != null ? r : !1, this.enablePromisePatch = (i = e.enablePromisePatch) != null ? i : !0, this.consoleMethodsToRecord = e.consoleMethodsToRecord || [
      ...Ue
    ], this.listeners = [], this.errors = [], this.messages = [], this.lastNetworkRequestTimestamp = 0;
  }
  isListening() {
    return this.listeners.length > 0;
  }
  startListening() {
    if (this.isListening())
      return;
    const e = this;
    this.disableConsoleRecording || this.listeners.push(qe((r) => {
      var i, s, l;
      if (this.reportConsoleErrors && (r.type === "Error" || r.type === "error") && r.value && r.trace) {
        const a = B(r.value);
        if (ie.includes(a) || se.some((d) => a.includes(d)))
          return;
        e.errors.push({
          event: a,
          type: "console.error",
          url: window.location.href,
          source: (i = r.trace[0]) != null && i.fileName ? r.trace[0].fileName : "",
          lineNumber: (s = r.trace[0]) != null && s.lineNumber ? r.trace[0].lineNumber : 0,
          columnNumber: (l = r.trace[0]) != null && l.columnNumber ? r.trace[0].columnNumber : 0,
          stackTrace: r.trace,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      e.messages.push(r);
    }, {
      level: this.consoleMethodsToRecord,
      logger: "console",
      stringifyOptions: {
        depthOfLimit: 10,
        numOfKeysLimit: 100,
        stringLengthLimit: 1e3
      }
    })), this.listeners.push(Be((r) => {
      ie.includes(r.event) || se.some((i) => r.event.includes(i)) || e.errors.push(r);
    }, { enablePromisePatch: this.enablePromisePatch })), this.options.enableOtelTracing && import("./index-2gQNKiCL.js").then(({ shutdown: r }) => {
      this.listeners.push(r);
    }), Z.setupNetworkListener(this, this.options);
  }
  stopListening() {
    this.listeners.forEach((e) => e()), this.listeners = [];
  }
  // We define this as a static method because versions earlier than 4.0.0 (Feb 2022) don't have this code.
  // For those versions, calling this from client will monkey-patch the network listeners onto the old FirstLoadListener object.
  static setupNetworkListener(e, r) {
    var i, s, l, a, d, n, c, o, u, g, h, m;
    e._backendUrl = (r == null ? void 0 : r.backendUrl) || at.REACT_APP_PUBLIC_GRAPH_URI || "https://pub.highlight.run", e.xhrNetworkContents = [], e.fetchNetworkContents = [], e.webSocketNetworkContents = [], e.webSocketEventContents = [], e.networkHeadersToRedact = [], e.urlBlocklist = [], e.tracingOrigins = r.tracingOrigins || [], (r == null ? void 0 : r.disableNetworkRecording) !== void 0 ? (e.disableNetworkRecording = r == null ? void 0 : r.disableNetworkRecording, e.enableRecordingNetworkContents = !1, e.disableRecordingWebSocketContents = !0, e.networkHeadersToRedact = [], e.networkBodyKeysToRedact = [], e.urlBlocklist = [], e.networkBodyKeysToRecord = [], e.networkBodyKeysToRecord = []) : typeof (r == null ? void 0 : r.networkRecording) == "boolean" ? (e.disableNetworkRecording = !r.networkRecording, e.enableRecordingNetworkContents = !1, e.disableRecordingWebSocketContents = !0, e.networkHeadersToRedact = [], e.networkBodyKeysToRedact = [], e.urlBlocklist = []) : (((i = r.networkRecording) == null ? void 0 : i.enabled) !== void 0 ? e.disableNetworkRecording = !r.networkRecording.enabled : e.disableNetworkRecording = !1, e.enableRecordingNetworkContents = ((s = r.networkRecording) == null ? void 0 : s.recordHeadersAndBody) || !1, e.disableRecordingWebSocketContents = ((l = r.networkRecording) == null ? void 0 : l.disableWebSocketEventRecordings) || !1, e.networkHeadersToRedact = ((d = (a = r.networkRecording) == null ? void 0 : a.networkHeadersToRedact) == null ? void 0 : d.map((f) => f.toLowerCase())) || [], e.networkBodyKeysToRedact = ((c = (n = r.networkRecording) == null ? void 0 : n.networkBodyKeysToRedact) == null ? void 0 : c.map((f) => f.toLowerCase())) || [], e.urlBlocklist = ((u = (o = r.networkRecording) == null ? void 0 : o.urlBlocklist) == null ? void 0 : u.map((f) => f.toLowerCase())) || [], e.urlBlocklist = [
      ...e.urlBlocklist,
      ...ze
    ], e.requestResponseSanitizer = (g = r.networkRecording) == null ? void 0 : g.requestResponseSanitizer, e.networkHeaderKeysToRecord = (h = r.networkRecording) == null ? void 0 : h.headerKeysToRecord, e.networkHeaderKeysToRecord && (e.networkHeadersToRedact = [], e.networkHeaderKeysToRecord = e.networkHeaderKeysToRecord.map((f) => f.toLocaleLowerCase())), e.networkBodyKeysToRecord = (m = r.networkRecording) == null ? void 0 : m.bodyKeysToRecord, e.networkBodyKeysToRecord && (e.networkBodyKeysToRedact = [], e.networkBodyKeysToRecord = e.networkBodyKeysToRecord.map((f) => f.toLocaleLowerCase()))), !e.disableNetworkRecording && e.enableRecordingNetworkContents && e.listeners.push(ot({
      xhrCallback: (f) => {
        e.xhrNetworkContents.push(f);
      },
      fetchCallback: (f) => {
        e.fetchNetworkContents.push(f);
      },
      webSocketRequestCallback: (f) => {
        e.webSocketNetworkContents && e.webSocketNetworkContents.push(f);
      },
      webSocketEventCallback: (f) => {
        e.webSocketEventContents.push(f);
      },
      disableWebSocketRecording: e.disableRecordingWebSocketContents,
      bodyKeysToRedact: e.networkBodyKeysToRedact,
      backendUrl: e._backendUrl,
      tracingOrigins: e.tracingOrigins,
      urlBlocklist: e.urlBlocklist,
      sessionSecureID: r.sessionSecureID,
      bodyKeysToRecord: e.networkBodyKeysToRecord
    }));
  }
  static getRecordedNetworkResources(e, r) {
    var l, a;
    let i = [], s = [];
    if (!e.disableNetworkRecording) {
      const d = ((l = window == null ? void 0 : window.performance) == null ? void 0 : l.timeOrigin) || 0;
      i = performance.getEntriesByType("resource");
      const n = (r - d) * 2;
      if (i = i.filter((c) => c.responseEnd < e.lastNetworkRequestTimestamp ? !1 : J(c.name, e._backendUrl, e.tracingOrigins)).map((c) => v(k({}, c.toJSON()), {
        offsetStartTime: c.startTime - n,
        offsetResponseEnd: c.responseEnd - n,
        offsetFetchStart: c.fetchStart - n
      })), e.lastNetworkRequestTimestamp = ((a = i.at(-1)) == null ? void 0 : a.responseEnd) || e.lastNetworkRequestTimestamp, e.enableRecordingNetworkContents) {
        const c = {
          headersToRedact: e.networkHeadersToRedact,
          headersToRecord: e.networkHeaderKeysToRecord,
          requestResponseSanitizer: e.requestResponseSanitizer
        };
        i = ce(i, e.xhrNetworkContents, "xmlhttprequest", c), i = ce(i, e.fetchNetworkContents, "fetch", c);
      }
    }
    return e.disableRecordingWebSocketContents || (s = e.webSocketNetworkContents || []), [...i, ...s];
  }
  static getRecordedWebSocketEvents(e) {
    let r = [];
    return !e.disableNetworkRecording && !e.disableRecordingWebSocketContents && (r = e.webSocketEventContents), r;
  }
  static clearRecordedNetworkResources(e) {
    e.disableNetworkRecording || (e.xhrNetworkContents = [], e.fetchNetworkContents = [], e.webSocketNetworkContents = [], e.webSocketEventContents = [], performance.clearResourceTimings());
  }
}
const ct = () => {
  var l;
  const e = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var r = "";
  const i = typeof window != "undefined" && ((l = window.crypto) == null ? void 0 : l.getRandomValues), s = new Uint32Array(28);
  i && window.crypto.getRandomValues(s);
  for (let a = 0; a < 28; a++)
    i ? r += e.charAt(s[a] % e.length) : r += e.charAt(Math.floor(Math.random() * e.length));
  return r;
}, mt = ({ next: t, payload: e }) => {
  if (typeof window != "undefined" && typeof document != "undefined" && "H" in window) {
    if (e.obj.type === "track") {
      const r = e.obj.event, i = e.obj.properties;
      window.H.track(r, i);
    } else if (e.obj.type === "identify") {
      const r = e.obj.userId;
      if (r != null && r.length) {
        const i = e.obj.traits;
        window.H.identify(r, i);
      }
    }
  }
  t(e);
};
function wt(t) {
  var e;
  t.on && ((e = t.webContents) != null && e.send) && (t.on("focus", () => {
    t.webContents.send("highlight.run", { visible: !0 });
  }), t.on("blur", () => {
    t.webContents.send("highlight.run", { visible: !1 });
  }), t.on("close", () => {
    t.webContents.send("highlight.run", { visible: !1 });
  }));
}
const lt = "9.1.0", V = () => {
  if (typeof window != "undefined") {
    if (typeof window._highlightFetchPatch != "undefined")
      return;
    window._originalFetch = window.fetch, window._fetchProxy = (t, e) => window._originalFetch(t, e), window._highlightFetchPatch = (t, e) => window._fetchProxy.call(window || global, t, e), window.fetch = window._highlightFetchPatch;
  }
}, ue = () => null, K = () => {
  if (typeof window != "undefined") {
    if (typeof window._highlightWebSocketRequestCallback != "undefined")
      return;
    window._highlightWebSocketRequestCallback = ue, window._highlightWebSocketEventCallback = ue;
    const t = new Proxy(window.WebSocket, {
      construct(e, r) {
        const [, i] = Q(), s = new e(...r), l = (o) => {
          window._highlightWebSocketRequestCallback({
            socketId: i,
            initiatorType: "websocket",
            type: "open",
            name: s.url,
            startTimeAbs: performance.timeOrigin + o.timeStamp
          });
        }, a = (o) => {
          window._highlightWebSocketRequestCallback({
            socketId: i,
            initiatorType: "websocket",
            type: "close",
            name: s.url,
            responseEndAbs: performance.timeOrigin + o.timeStamp
          }), s.removeEventListener("open", l), s.removeEventListener("error", n), s.removeEventListener("message", d), s.removeEventListener("close", a);
        }, d = (o) => {
          const { data: u } = o, g = typeof u == "string" ? o.data : void 0;
          let h;
          typeof u == "string" ? h = u.length : u instanceof Blob ? h = u.size : h = u.byteLength || 0, window._highlightWebSocketEventCallback({
            socketId: i,
            type: "received",
            name: s.url,
            timeStamp: performance.timeOrigin + o.timeStamp,
            size: h,
            message: g
          });
        }, n = (o) => {
          window._highlightWebSocketEventCallback({
            socketId: i,
            type: "error",
            name: s.url,
            timeStamp: performance.timeOrigin + o.timeStamp,
            size: 0
          });
        };
        s.addEventListener("open", l), s.addEventListener("error", n), s.addEventListener("message", d), s.addEventListener("close", a);
        const c = new Proxy(s.send, {
          apply: function(o, u, g) {
            const h = g[0], m = typeof h == "string" ? h : void 0;
            let f;
            typeof h == "string" ? f = h.length : h instanceof Blob ? f = h.size : f = h.byteLength || 0, window._highlightWebSocketEventCallback({
              socketId: i,
              type: "sent",
              name: s.url,
              timeStamp: performance.timeOrigin + performance.now(),
              size: f,
              message: m
            }), o.apply(u, g);
          }
        });
        return s.send = c, s;
      }
    });
    window.WebSocket = t;
  }
}, dt = () => {
  var t, e;
  typeof chrome != "undefined" && ((t = chrome == null ? void 0 : chrome.runtime) != null && t.onMessage) && ((e = chrome == null ? void 0 : chrome.runtime) == null || e.onMessage.addListener((r, i, s) => {
    const l = r.action;
    switch (console.log(`[highlight] received '${l}' event from extension.`), l) {
      case "init": {
        b.init(1, {
          debug: !0
        }), b.getSessionURL().then((a) => {
          s({ url: a });
        });
        break;
      }
      case "stop": {
        b.stop(), s({ success: !0 });
        break;
      }
    }
    return !0;
  }));
};
var G;
(function(t) {
  t.Device = "Device", t.WebVital = "WebVital", t.Frontend = "Frontend", t.Backend = "Backend";
})(G || (G = {}));
const N = (t, e) => {
  console.warn(`highlight.run warning: (${t}): `, e);
}, ut = 200;
let x = [], j, p, A, fe = !1, q;
const b = {
  options: void 0,
  init: (t, e) => {
    var r, i, s, l, a, d, n, c;
    try {
      if (b.options = e, typeof window == "undefined" || typeof document == "undefined")
        return;
      if (!t) {
        console.info("Highlight is not initializing because projectID was passed undefined.");
        return;
      }
      let o = Ge(), u = ct();
      if (o != null && o.sessionSecureID)
        u = o.sessionSecureID;
      else {
        const h = v(k({}, o), {
          projectID: +t,
          sessionSecureID: u
        });
        Ve(H.SESSION_DATA, JSON.stringify(h));
      }
      if (fe)
        return { sessionSecureID: u };
      fe = !0, e != null && e.enableOtelTracing && import("./index-2gQNKiCL.js").then(({ setupBrowserTracing: h, getTracer: m }) => {
        var f, w;
        h({
          endpoint: e == null ? void 0 : e.otlpEndpoint,
          projectId: t,
          sessionSecureId: u,
          environment: (f = e == null ? void 0 : e.environment) != null ? f : "production",
          networkRecordingOptions: typeof (e == null ? void 0 : e.networkRecording) == "object" ? e.networkRecording : void 0,
          tracingOrigins: e == null ? void 0 : e.tracingOrigins,
          serviceName: (w = e == null ? void 0 : e.serviceName) != null ? w : "highlight-browser"
        }), q = m;
      }), V(), K(), import("./index-BM6bZd7k.js").then((h) => h.i).then((m) => _(void 0, [m], function* ({ Highlight: h }) {
        p = new h(g, A), V(), K(), e != null && e.manualStart || (yield p.initialize());
      }));
      const g = {
        organizationID: t,
        debug: e == null ? void 0 : e.debug,
        backendUrl: e == null ? void 0 : e.backendUrl,
        tracingOrigins: e == null ? void 0 : e.tracingOrigins,
        disableNetworkRecording: e == null ? void 0 : e.disableNetworkRecording,
        networkRecording: e == null ? void 0 : e.networkRecording,
        disableBackgroundRecording: e == null ? void 0 : e.disableBackgroundRecording,
        disableConsoleRecording: e == null ? void 0 : e.disableConsoleRecording,
        disableSessionRecording: e == null ? void 0 : e.disableSessionRecording,
        reportConsoleErrors: e == null ? void 0 : e.reportConsoleErrors,
        consoleMethodsToRecord: e == null ? void 0 : e.consoleMethodsToRecord,
        privacySetting: e == null ? void 0 : e.privacySetting,
        enableSegmentIntegration: e == null ? void 0 : e.enableSegmentIntegration,
        enableCanvasRecording: e == null ? void 0 : e.enableCanvasRecording,
        enablePerformanceRecording: e == null ? void 0 : e.enablePerformanceRecording,
        enablePromisePatch: e == null ? void 0 : e.enablePromisePatch,
        samplingStrategy: e == null ? void 0 : e.samplingStrategy,
        inlineImages: e == null ? void 0 : e.inlineImages,
        inlineStylesheet: e == null ? void 0 : e.inlineStylesheet,
        recordCrossOriginIframe: e == null ? void 0 : e.recordCrossOriginIframe,
        firstloadVersion: lt,
        environment: (e == null ? void 0 : e.environment) || "production",
        appVersion: e == null ? void 0 : e.version,
        serviceName: e == null ? void 0 : e.serviceName,
        sessionShortcut: e == null ? void 0 : e.sessionShortcut,
        sessionSecureID: u,
        storageMode: e == null ? void 0 : e.storageMode,
        sendMode: e == null ? void 0 : e.sendMode
      };
      return A = new Z(g), e != null && e.manualStart || A.startListening(), !((i = (r = e == null ? void 0 : e.integrations) == null ? void 0 : r.mixpanel) != null && i.disabled) && ((l = (s = e == null ? void 0 : e.integrations) == null ? void 0 : s.mixpanel) != null && l.projectToken) && Le(e.integrations.mixpanel), !((d = (a = e == null ? void 0 : e.integrations) == null ? void 0 : a.amplitude) != null && d.disabled) && ((c = (n = e == null ? void 0 : e.integrations) == null ? void 0 : n.amplitude) != null && c.apiKey) && Ce(e.integrations.amplitude), { sessionSecureID: u };
    } catch (o) {
      N("init", o);
    }
  },
  snapshot: (t) => _(void 0, null, function* () {
    try {
      if (p && p.ready)
        return yield p.snapshot(t);
    } catch (e) {
      N("snapshot", e);
    }
  }),
  addSessionFeedback: ({ verbatim: t, userName: e, userEmail: r, timestampOverride: i }) => {
    try {
      b.onHighlightReady(() => p.addSessionFeedback({
        verbatim: t,
        timestamp: i || (/* @__PURE__ */ new Date()).toISOString(),
        user_email: r,
        user_name: e
      }));
    } catch (s) {
      N("error", s);
    }
  },
  consumeError: (t, e, r) => {
    try {
      b.onHighlightReady(() => p.consumeCustomError(t, e, JSON.stringify(r)));
    } catch (i) {
      N("error", i);
    }
  },
  consume: (t, e) => {
    try {
      b.onHighlightReady(() => p.consumeError(t, e));
    } catch (r) {
      N("error", r);
    }
  },
  error: (t, e) => {
    try {
      b.onHighlightReady(() => p.pushCustomError(t, JSON.stringify(e)));
    } catch (r) {
      N("error", r);
    }
  },
  track: (t, e = {}) => {
    var r, i, s, l, a, d, n, c, o, u, g;
    try {
      b.onHighlightReady(() => p.addProperties(v(k({}, e), { event: t })));
      const h = p == null ? void 0 : p.getCurrentSessionURL();
      (s = (i = (r = b.options) == null ? void 0 : r.integrations) == null ? void 0 : i.mixpanel) != null && s.disabled || (l = window.mixpanel) != null && l.track && window.mixpanel.track(t, v(k({}, e), {
        highlightSessionURL: h
      })), (n = (d = (a = b.options) == null ? void 0 : a.integrations) == null ? void 0 : d.amplitude) != null && n.disabled || (c = window.amplitude) != null && c.getInstance && window.amplitude.getInstance().logEvent(t, v(k({}, e), {
        highlightSessionURL: h
      })), (g = (u = (o = b.options) == null ? void 0 : o.integrations) == null ? void 0 : u.intercom) != null && g.disabled || window.Intercom && window.Intercom("trackEvent", t, e);
    } catch (h) {
      N("track", h);
    }
  },
  start: (t) => {
    (p == null ? void 0 : p.state) === "Recording" && !(t != null && t.forceNew) ? t != null && t.silent || console.warn("Highlight is already recording. Please `H.stop()` the current session before starting a new one.") : (A.startListening(), b.onHighlightReady(() => _(void 0, null, function* () {
      yield p.initialize(t);
    }), { waitForReady: !1 }));
  },
  stop: (t) => {
    (p == null ? void 0 : p.state) !== "Recording" ? t != null && t.silent || console.warn("Highlight is already stopped. Please call `H.start()`.") : b.onHighlightReady(() => p.stopRecording(!0));
  },
  identify: (t, e = {}) => {
    var r, i, s, l, a, d, n, c;
    try {
      b.onHighlightReady(() => p.identify(t, e));
    } catch (o) {
      N("identify", o);
    }
    if ((s = (i = (r = b.options) == null ? void 0 : r.integrations) == null ? void 0 : i.mixpanel) != null && s.disabled || (l = window.mixpanel) != null && l.identify && (window.mixpanel.identify(typeof (e == null ? void 0 : e.email) == "string" ? e == null ? void 0 : e.email : t), e && (window.mixpanel.track("identify", e), window.mixpanel.people.set(e))), !((n = (d = (a = b.options) == null ? void 0 : a.integrations) == null ? void 0 : d.amplitude) != null && n.disabled) && (c = window.amplitude) != null && c.getInstance && (window.amplitude.getInstance().setUserId(t), Object.keys(e).length > 0)) {
      const o = Object.keys(e).reduce((u, g) => (u.set(g, e[g]), u), new window.amplitude.Identify());
      window.amplitude.getInstance().identify(o);
    }
  },
  metrics: (t) => {
    try {
      b.onHighlightReady(() => p.recordMetric(t.map((e) => v(k({}, e), {
        category: G.Frontend
      }))));
    } catch (e) {
      N("metrics", e);
    }
  },
  startSpan: (t, e, r, i) => {
    const s = q();
    if (!s)
      return;
    const l = (a, d) => _(void 0, null, function* () {
      try {
        return yield d(a);
      } finally {
        a.end();
      }
    });
    return i === void 0 && r === void 0 ? s.startActiveSpan(t, (a) => l(a, e)) : i === void 0 ? s.startActiveSpan(t, e, (a) => l(a, r)) : s.startActiveSpan(t, e, r, (a) => l(a, i));
  },
  startManualSpan: (t, e, r, i) => {
    if (typeof q != "function")
      return;
    const s = q();
    return i === void 0 && r === void 0 ? s.startActiveSpan(t, e) : i === void 0 ? s.startActiveSpan(t, e, r) : s.startActiveSpan(t, e, r, i);
  },
  getSessionURL: () => new Promise((t, e) => {
    const r = be();
    r ? t(r) : e(new Error("Unable to get session URL"));
  }),
  getSessionDetails: () => new Promise((t, e) => {
    b.onHighlightReady(() => {
      const r = p.getCurrentSessionURL();
      if (r) {
        const i = p.getCurrentSessionTimestamp(), s = (/* @__PURE__ */ new Date()).getTime(), l = new URL(r), a = new URL(r);
        a.searchParams.set(
          "ts",
          // The delta between when the session recording started and now.
          ((s - i) / 1e3).toString()
        ), t({
          url: l.toString(),
          urlWithTimestamp: a.toString()
        });
      } else
        e(new Error("Could not get session URL"));
    });
  }),
  getRecordingState: () => {
    var t;
    return (t = p == null ? void 0 : p.state) != null ? t : "NotRecording";
  },
  onHighlightReady: (t, e) => {
    if (x.push({ options: e, func: t }), j === void 0) {
      const r = () => {
        var s;
        const i = [];
        for (const l of x)
          p && (((s = l.options) == null ? void 0 : s.waitForReady) === !1 || p.ready) ? l.func() : i.push(l);
        x = i, j = void 0, x.length > 0 && (j = setTimeout(r, ut));
      };
      r();
    }
  }
};
typeof window != "undefined" && (window.H = b);
dt();
V();
K();
export {
  ze as D,
  b as H,
  G as M,
  it as a,
  O as b,
  X as c,
  We as d,
  he as e,
  mt as f,
  gt as g,
  wt as h,
  J as s
};
//# sourceMappingURL=index-B6OrGkGw.js.map
