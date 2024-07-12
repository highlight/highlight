var li = Object.defineProperty;
var pi = (e, t, r) => t in e ? li(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var H = (e, t, r) => (pi(e, typeof t != "symbol" ? t + "" : t, r), r);
var Ot = (e, t, r) => new Promise((n, i) => {
  var a = (u) => {
    try {
      s(r.next(u));
    } catch (_) {
      i(_);
    }
  }, o = (u) => {
    try {
      s(r.throw(u));
    } catch (_) {
      i(_);
    }
  }, s = (u) => u.done ? n(u.value) : Promise.resolve(u.value).then(a, o);
  s((r = r.apply(e, t)).next());
});
import { g as Qr, a as fi, b as Ei, D as Jr, s as Ti, c as hi, d as vi } from "./index-B6OrGkGw.js";
var Si = typeof globalThis == "object" ? globalThis : typeof self == "object" ? self : typeof window == "object" ? window : typeof global == "object" ? global : {}, ee = "1.8.0", mr = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function Ai(e) {
  var t = /* @__PURE__ */ new Set([e]), r = /* @__PURE__ */ new Set(), n = e.match(mr);
  if (!n)
    return function() {
      return !1;
    };
  var i = {
    major: +n[1],
    minor: +n[2],
    patch: +n[3],
    prerelease: n[4]
  };
  if (i.prerelease != null)
    return function(u) {
      return u === e;
    };
  function a(s) {
    return r.add(s), !1;
  }
  function o(s) {
    return t.add(s), !0;
  }
  return function(u) {
    if (t.has(u))
      return !0;
    if (r.has(u))
      return !1;
    var _ = u.match(mr);
    if (!_)
      return a(u);
    var c = {
      major: +_[1],
      minor: +_[2],
      patch: +_[3],
      prerelease: _[4]
    };
    return c.prerelease != null || i.major !== c.major ? a(u) : i.major === 0 ? i.minor === c.minor && i.patch <= c.patch ? o(u) : a(u) : i.minor <= c.minor ? o(u) : a(u);
  };
}
var Oi = Ai(ee), mi = ee.split(".")[0], we = Symbol.for("opentelemetry.js.api." + mi), xe = Si;
function Ue(e, t, r, n) {
  var i;
  n === void 0 && (n = !1);
  var a = xe[we] = (i = xe[we]) !== null && i !== void 0 ? i : {
    version: ee
  };
  if (!n && a[e]) {
    var o = new Error("@opentelemetry/api: Attempted duplicate registration of API: " + e);
    return r.error(o.stack || o.message), !1;
  }
  if (a.version !== ee) {
    var o = new Error("@opentelemetry/api: Registration of version v" + a.version + " for " + e + " does not match previously registered API v" + ee);
    return r.error(o.stack || o.message), !1;
  }
  return a[e] = t, r.debug("@opentelemetry/api: Registered a global for " + e + " v" + ee + "."), !0;
}
function re(e) {
  var t, r, n = (t = xe[we]) === null || t === void 0 ? void 0 : t.version;
  if (!(!n || !Oi(n)))
    return (r = xe[we]) === null || r === void 0 ? void 0 : r[e];
}
function Ge(e, t) {
  t.debug("@opentelemetry/api: Unregistering a global for " + e + " v" + ee + ".");
  var r = xe[we];
  r && delete r[e];
}
var Ni = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, Pi = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, yi = (
  /** @class */
  function() {
    function e(t) {
      this._namespace = t.namespace || "DiagComponentLogger";
    }
    return e.prototype.debug = function() {
      for (var t = [], r = 0; r < arguments.length; r++)
        t[r] = arguments[r];
      return me("debug", this._namespace, t);
    }, e.prototype.error = function() {
      for (var t = [], r = 0; r < arguments.length; r++)
        t[r] = arguments[r];
      return me("error", this._namespace, t);
    }, e.prototype.info = function() {
      for (var t = [], r = 0; r < arguments.length; r++)
        t[r] = arguments[r];
      return me("info", this._namespace, t);
    }, e.prototype.warn = function() {
      for (var t = [], r = 0; r < arguments.length; r++)
        t[r] = arguments[r];
      return me("warn", this._namespace, t);
    }, e.prototype.verbose = function() {
      for (var t = [], r = 0; r < arguments.length; r++)
        t[r] = arguments[r];
      return me("verbose", this._namespace, t);
    }, e;
  }()
);
function me(e, t, r) {
  var n = re("diag");
  if (n)
    return r.unshift(t), n[e].apply(n, Pi([], Ni(r), !1));
}
var P;
(function(e) {
  e[e.NONE = 0] = "NONE", e[e.ERROR = 30] = "ERROR", e[e.WARN = 50] = "WARN", e[e.INFO = 60] = "INFO", e[e.DEBUG = 70] = "DEBUG", e[e.VERBOSE = 80] = "VERBOSE", e[e.ALL = 9999] = "ALL";
})(P || (P = {}));
function gi(e, t) {
  e < P.NONE ? e = P.NONE : e > P.ALL && (e = P.ALL), t = t || {};
  function r(n, i) {
    var a = t[n];
    return typeof a == "function" && e >= i ? a.bind(t) : function() {
    };
  }
  return {
    error: r("error", P.ERROR),
    warn: r("warn", P.WARN),
    info: r("info", P.INFO),
    debug: r("debug", P.DEBUG),
    verbose: r("verbose", P.VERBOSE)
  };
}
var Ri = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, Mi = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, Ii = "diag", V = (
  /** @class */
  function() {
    function e() {
      function t(i) {
        return function() {
          for (var a = [], o = 0; o < arguments.length; o++)
            a[o] = arguments[o];
          var s = re("diag");
          if (s)
            return s[i].apply(s, Mi([], Ri(a), !1));
        };
      }
      var r = this, n = function(i, a) {
        var o, s, u;
        if (a === void 0 && (a = { logLevel: P.INFO }), i === r) {
          var _ = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
          return r.error((o = _.stack) !== null && o !== void 0 ? o : _.message), !1;
        }
        typeof a == "number" && (a = {
          logLevel: a
        });
        var c = re("diag"), l = gi((s = a.logLevel) !== null && s !== void 0 ? s : P.INFO, i);
        if (c && !a.suppressOverrideMessage) {
          var p = (u = new Error().stack) !== null && u !== void 0 ? u : "<failed to generate stacktrace>";
          c.warn("Current logger will be overwritten from " + p), l.warn("Current logger will overwrite one already registered from " + p);
        }
        return Ue("diag", l, r, !0);
      };
      r.setLogger = n, r.disable = function() {
        Ge(Ii, r);
      }, r.createComponentLogger = function(i) {
        return new yi(i);
      }, r.verbose = t("verbose"), r.debug = t("debug"), r.info = t("info"), r.warn = t("warn"), r.error = t("error");
    }
    return e.instance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e;
  }()
), Ci = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, Li = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, Di = (
  /** @class */
  function() {
    function e(t) {
      this._entries = t ? new Map(t) : /* @__PURE__ */ new Map();
    }
    return e.prototype.getEntry = function(t) {
      var r = this._entries.get(t);
      if (r)
        return Object.assign({}, r);
    }, e.prototype.getAllEntries = function() {
      return Array.from(this._entries.entries()).map(function(t) {
        var r = Ci(t, 2), n = r[0], i = r[1];
        return [n, i];
      });
    }, e.prototype.setEntry = function(t, r) {
      var n = new e(this._entries);
      return n._entries.set(t, r), n;
    }, e.prototype.removeEntry = function(t) {
      var r = new e(this._entries);
      return r._entries.delete(t), r;
    }, e.prototype.removeEntries = function() {
      for (var t, r, n = [], i = 0; i < arguments.length; i++)
        n[i] = arguments[i];
      var a = new e(this._entries);
      try {
        for (var o = Li(n), s = o.next(); !s.done; s = o.next()) {
          var u = s.value;
          a._entries.delete(u);
        }
      } catch (_) {
        t = { error: _ };
      } finally {
        try {
          s && !s.done && (r = o.return) && r.call(o);
        } finally {
          if (t)
            throw t.error;
        }
      }
      return a;
    }, e.prototype.clear = function() {
      return new e();
    }, e;
  }()
), bi = Symbol("BaggageEntryMetadata"), wi = V.instance();
function xi(e) {
  return e === void 0 && (e = {}), new Di(new Map(Object.entries(e)));
}
function Zr(e) {
  return typeof e != "string" && (wi.error("Cannot create baggage metadata from unknown type: " + typeof e), e = ""), {
    __TYPE__: bi,
    toString: function() {
      return e;
    }
  };
}
function $e(e) {
  return Symbol.for(e);
}
var Bi = (
  /** @class */
  /* @__PURE__ */ function() {
    function e(t) {
      var r = this;
      r._currentContext = t ? new Map(t) : /* @__PURE__ */ new Map(), r.getValue = function(n) {
        return r._currentContext.get(n);
      }, r.setValue = function(n, i) {
        var a = new e(r._currentContext);
        return a._currentContext.set(n, i), a;
      }, r.deleteValue = function(n) {
        var i = new e(r._currentContext);
        return i._currentContext.delete(n), i;
      };
    }
    return e;
  }()
), G = new Bi(), mt = [
  { n: "error", c: "error" },
  { n: "warn", c: "warn" },
  { n: "info", c: "info" },
  { n: "debug", c: "debug" },
  { n: "verbose", c: "trace" }
], Ui = (
  /** @class */
  /* @__PURE__ */ function() {
    function e() {
      function t(n) {
        return function() {
          for (var i = [], a = 0; a < arguments.length; a++)
            i[a] = arguments[a];
          if (console) {
            var o = console[n];
            if (typeof o != "function" && (o = console.log), typeof o == "function")
              return o.apply(console, i);
          }
        };
      }
      for (var r = 0; r < mt.length; r++)
        this[mt[r].n] = t(mt[r].c);
    }
    return e;
  }()
), ve = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Gi = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.createHistogram = function(t, r) {
      return Xi;
    }, e.prototype.createCounter = function(t, r) {
      return ji;
    }, e.prototype.createUpDownCounter = function(t, r) {
      return Wi;
    }, e.prototype.createObservableGauge = function(t, r) {
      return zi;
    }, e.prototype.createObservableCounter = function(t, r) {
      return Ki;
    }, e.prototype.createObservableUpDownCounter = function(t, r) {
      return qi;
    }, e.prototype.addBatchObservableCallback = function(t, r) {
    }, e.prototype.removeBatchObservableCallback = function(t) {
    }, e;
  }()
), Qt = (
  /** @class */
  /* @__PURE__ */ function() {
    function e() {
    }
    return e;
  }()
), $i = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t.prototype.add = function(r, n) {
    }, t;
  }(Qt)
), ki = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t.prototype.add = function(r, n) {
    }, t;
  }(Qt)
), Fi = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t.prototype.record = function(r, n) {
    }, t;
  }(Qt)
), Jt = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.addCallback = function(t) {
    }, e.prototype.removeCallback = function(t) {
    }, e;
  }()
), Vi = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t;
  }(Jt)
), Hi = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t;
  }(Jt)
), Yi = (
  /** @class */
  function(e) {
    ve(t, e);
    function t() {
      return e !== null && e.apply(this, arguments) || this;
    }
    return t;
  }(Jt)
), en = new Gi(), ji = new $i(), Xi = new Fi(), Wi = new ki(), Ki = new Vi(), zi = new Hi(), qi = new Yi();
function Qi() {
  return en;
}
var Bt;
(function(e) {
  e[e.INT = 0] = "INT", e[e.DOUBLE = 1] = "DOUBLE";
})(Bt || (Bt = {}));
var tn = {
  get: function(e, t) {
    if (e != null)
      return e[t];
  },
  keys: function(e) {
    return e == null ? [] : Object.keys(e);
  }
}, rn = {
  set: function(e, t, r) {
    e != null && (e[t] = r);
  }
}, Ji = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, Zi = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, ea = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.active = function() {
      return G;
    }, e.prototype.with = function(t, r, n) {
      for (var i = [], a = 3; a < arguments.length; a++)
        i[a - 3] = arguments[a];
      return r.call.apply(r, Zi([n], Ji(i), !1));
    }, e.prototype.bind = function(t, r) {
      return r;
    }, e.prototype.enable = function() {
      return this;
    }, e.prototype.disable = function() {
      return this;
    }, e;
  }()
), ta = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, ra = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, Nt = "context", na = new ea(), ut = (
  /** @class */
  function() {
    function e() {
    }
    return e.getInstance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e.prototype.setGlobalContextManager = function(t) {
      return Ue(Nt, t, V.instance());
    }, e.prototype.active = function() {
      return this._getContextManager().active();
    }, e.prototype.with = function(t, r, n) {
      for (var i, a = [], o = 3; o < arguments.length; o++)
        a[o - 3] = arguments[o];
      return (i = this._getContextManager()).with.apply(i, ra([t, r, n], ta(a), !1));
    }, e.prototype.bind = function(t, r) {
      return this._getContextManager().bind(t, r);
    }, e.prototype._getContextManager = function() {
      return re(Nt) || na;
    }, e.prototype.disable = function() {
      this._getContextManager().disable(), Ge(Nt, V.instance());
    }, e;
  }()
), w;
(function(e) {
  e[e.NONE = 0] = "NONE", e[e.SAMPLED = 1] = "SAMPLED";
})(w || (w = {}));
var Zt = "0000000000000000", er = "00000000000000000000000000000000", tr = {
  traceId: er,
  spanId: Zt,
  traceFlags: w.NONE
}, Me = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = tr), this._spanContext = t;
    }
    return e.prototype.spanContext = function() {
      return this._spanContext;
    }, e.prototype.setAttribute = function(t, r) {
      return this;
    }, e.prototype.setAttributes = function(t) {
      return this;
    }, e.prototype.addEvent = function(t, r) {
      return this;
    }, e.prototype.setStatus = function(t) {
      return this;
    }, e.prototype.updateName = function(t) {
      return this;
    }, e.prototype.end = function(t) {
    }, e.prototype.isRecording = function() {
      return !1;
    }, e.prototype.recordException = function(t, r) {
    }, e;
  }()
), rr = $e("OpenTelemetry Context Key SPAN");
function nr(e) {
  return e.getValue(rr) || void 0;
}
function ia() {
  return nr(ut.getInstance().active());
}
function ir(e, t) {
  return e.setValue(rr, t);
}
function aa(e) {
  return e.deleteValue(rr);
}
function oa(e, t) {
  return ir(e, new Me(t));
}
function nn(e) {
  var t;
  return (t = nr(e)) === null || t === void 0 ? void 0 : t.spanContext();
}
var sa = /^([0-9a-f]{32})$/i, ua = /^[0-9a-f]{16}$/i;
function _t(e) {
  return sa.test(e) && e !== er;
}
function an(e) {
  return ua.test(e) && e !== Zt;
}
function Se(e) {
  return _t(e.traceId) && an(e.spanId);
}
function _a(e) {
  return new Me(e);
}
var Pt = ut.getInstance(), on = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.startSpan = function(t, r, n) {
      n === void 0 && (n = Pt.active());
      var i = !!(r != null && r.root);
      if (i)
        return new Me();
      var a = n && nn(n);
      return ca(a) && Se(a) ? new Me(a) : new Me();
    }, e.prototype.startActiveSpan = function(t, r, n, i) {
      var a, o, s;
      if (!(arguments.length < 2)) {
        arguments.length === 2 ? s = r : arguments.length === 3 ? (a = r, s = n) : (a = r, o = n, s = i);
        var u = o != null ? o : Pt.active(), _ = this.startSpan(t, a, u), c = ir(u, _);
        return Pt.with(c, s, void 0, _);
      }
    }, e;
  }()
);
function ca(e) {
  return typeof e == "object" && typeof e.spanId == "string" && typeof e.traceId == "string" && typeof e.traceFlags == "number";
}
var da = new on(), sn = (
  /** @class */
  function() {
    function e(t, r, n, i) {
      this._provider = t, this.name = r, this.version = n, this.options = i;
    }
    return e.prototype.startSpan = function(t, r, n) {
      return this._getTracer().startSpan(t, r, n);
    }, e.prototype.startActiveSpan = function(t, r, n, i) {
      var a = this._getTracer();
      return Reflect.apply(a.startActiveSpan, a, arguments);
    }, e.prototype._getTracer = function() {
      if (this._delegate)
        return this._delegate;
      var t = this._provider.getDelegateTracer(this.name, this.version, this.options);
      return t ? (this._delegate = t, this._delegate) : da;
    }, e;
  }()
), la = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.getTracer = function(t, r, n) {
      return new on();
    }, e;
  }()
), pa = new la(), Ut = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.getTracer = function(t, r, n) {
      var i;
      return (i = this.getDelegateTracer(t, r, n)) !== null && i !== void 0 ? i : new sn(this, t, r, n);
    }, e.prototype.getDelegate = function() {
      var t;
      return (t = this._delegate) !== null && t !== void 0 ? t : pa;
    }, e.prototype.setDelegate = function(t) {
      this._delegate = t;
    }, e.prototype.getDelegateTracer = function(t, r, n) {
      var i;
      return (i = this._delegate) === null || i === void 0 ? void 0 : i.getTracer(t, r, n);
    }, e;
  }()
), K;
(function(e) {
  e[e.NOT_RECORD = 0] = "NOT_RECORD", e[e.RECORD = 1] = "RECORD", e[e.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
})(K || (K = {}));
var Ee;
(function(e) {
  e[e.INTERNAL = 0] = "INTERNAL", e[e.SERVER = 1] = "SERVER", e[e.CLIENT = 2] = "CLIENT", e[e.PRODUCER = 3] = "PRODUCER", e[e.CONSUMER = 4] = "CONSUMER";
})(Ee || (Ee = {}));
var Je;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.OK = 1] = "OK", e[e.ERROR = 2] = "ERROR";
})(Je || (Je = {}));
var Gt = "[_0-9a-z-*/]", fa = "[a-z]" + Gt + "{0,255}", Ea = "[a-z0-9]" + Gt + "{0,240}@[a-z]" + Gt + "{0,13}", Ta = new RegExp("^(?:" + fa + "|" + Ea + ")$"), ha = /^[ -~]{0,255}[!-~]$/, va = /,|=/;
function Sa(e) {
  return Ta.test(e);
}
function Aa(e) {
  return ha.test(e) && !va.test(e);
}
var Nr = 32, Oa = 512, Pr = ",", yr = "=", ma = (
  /** @class */
  function() {
    function e(t) {
      this._internalState = /* @__PURE__ */ new Map(), t && this._parse(t);
    }
    return e.prototype.set = function(t, r) {
      var n = this._clone();
      return n._internalState.has(t) && n._internalState.delete(t), n._internalState.set(t, r), n;
    }, e.prototype.unset = function(t) {
      var r = this._clone();
      return r._internalState.delete(t), r;
    }, e.prototype.get = function(t) {
      return this._internalState.get(t);
    }, e.prototype.serialize = function() {
      var t = this;
      return this._keys().reduce(function(r, n) {
        return r.push(n + yr + t.get(n)), r;
      }, []).join(Pr);
    }, e.prototype._parse = function(t) {
      t.length > Oa || (this._internalState = t.split(Pr).reverse().reduce(function(r, n) {
        var i = n.trim(), a = i.indexOf(yr);
        if (a !== -1) {
          var o = i.slice(0, a), s = i.slice(a + 1, n.length);
          Sa(o) && Aa(s) && r.set(o, s);
        }
        return r;
      }, /* @__PURE__ */ new Map()), this._internalState.size > Nr && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, Nr))));
    }, e.prototype._keys = function() {
      return Array.from(this._internalState.keys()).reverse();
    }, e.prototype._clone = function() {
      var t = new e();
      return t._internalState = new Map(this._internalState), t;
    }, e;
  }()
);
function Na(e) {
  return new ma(e);
}
var O = ut.getInstance(), v = V.instance(), Pa = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.getMeter = function(t, r, n) {
      return en;
    }, e;
  }()
), ya = new Pa(), yt = "metrics", ga = (
  /** @class */
  function() {
    function e() {
    }
    return e.getInstance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e.prototype.setGlobalMeterProvider = function(t) {
      return Ue(yt, t, V.instance());
    }, e.prototype.getMeterProvider = function() {
      return re(yt) || ya;
    }, e.prototype.getMeter = function(t, r, n) {
      return this.getMeterProvider().getMeter(t, r, n);
    }, e.prototype.disable = function() {
      Ge(yt, V.instance());
    }, e;
  }()
), ct = ga.getInstance(), Ra = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.inject = function(t, r) {
    }, e.prototype.extract = function(t, r) {
      return t;
    }, e.prototype.fields = function() {
      return [];
    }, e;
  }()
), ar = $e("OpenTelemetry Baggage Key");
function un(e) {
  return e.getValue(ar) || void 0;
}
function Ma() {
  return un(ut.getInstance().active());
}
function Ia(e, t) {
  return e.setValue(ar, t);
}
function Ca(e) {
  return e.deleteValue(ar);
}
var gt = "propagation", La = new Ra(), Da = (
  /** @class */
  function() {
    function e() {
      this.createBaggage = xi, this.getBaggage = un, this.getActiveBaggage = Ma, this.setBaggage = Ia, this.deleteBaggage = Ca;
    }
    return e.getInstance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e.prototype.setGlobalPropagator = function(t) {
      return Ue(gt, t, V.instance());
    }, e.prototype.inject = function(t, r, n) {
      return n === void 0 && (n = rn), this._getGlobalPropagator().inject(t, r, n);
    }, e.prototype.extract = function(t, r, n) {
      return n === void 0 && (n = tn), this._getGlobalPropagator().extract(t, r, n);
    }, e.prototype.fields = function() {
      return this._getGlobalPropagator().fields();
    }, e.prototype.disable = function() {
      Ge(gt, V.instance());
    }, e.prototype._getGlobalPropagator = function() {
      return re(gt) || La;
    }, e;
  }()
), D = Da.getInstance(), Rt = "trace", ba = (
  /** @class */
  function() {
    function e() {
      this._proxyTracerProvider = new Ut(), this.wrapSpanContext = _a, this.isSpanContextValid = Se, this.deleteSpan = aa, this.getSpan = nr, this.getActiveSpan = ia, this.getSpanContext = nn, this.setSpan = ir, this.setSpanContext = oa;
    }
    return e.getInstance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e.prototype.setGlobalTracerProvider = function(t) {
      var r = Ue(Rt, this._proxyTracerProvider, V.instance());
      return r && this._proxyTracerProvider.setDelegate(t), r;
    }, e.prototype.getTracerProvider = function() {
      return re(Rt) || this._proxyTracerProvider;
    }, e.prototype.getTracer = function(t, r) {
      return this.getTracerProvider().getTracer(t, r);
    }, e.prototype.disable = function() {
      Ge(Rt, V.instance()), this._proxyTracerProvider = new Ut();
    }, e;
  }()
), N = ba.getInstance();
const wa = {
  context: O,
  diag: v,
  metrics: ct,
  propagation: D,
  trace: N
}, xa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagConsoleLogger: Ui,
  get DiagLogLevel() {
    return P;
  },
  INVALID_SPANID: Zt,
  INVALID_SPAN_CONTEXT: tr,
  INVALID_TRACEID: er,
  ProxyTracer: sn,
  ProxyTracerProvider: Ut,
  ROOT_CONTEXT: G,
  get SamplingDecision() {
    return K;
  },
  get SpanKind() {
    return Ee;
  },
  get SpanStatusCode() {
    return Je;
  },
  get TraceFlags() {
    return w;
  },
  get ValueType() {
    return Bt;
  },
  baggageEntryMetadataFromString: Zr,
  context: O,
  createContextKey: $e,
  createNoopMeter: Qi,
  createTraceState: Na,
  default: wa,
  defaultTextMapGetter: tn,
  defaultTextMapSetter: rn,
  diag: v,
  isSpanContextValid: Se,
  isValidSpanId: an,
  isValidTraceId: _t,
  metrics: ct,
  propagation: D,
  trace: N
}, Symbol.toStringTag, { value: "Module" }));
var or = $e("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
function sr(e) {
  return e.setValue(or, !0);
}
function Ba(e) {
  return e.deleteValue(or);
}
function dt(e) {
  return e.getValue(or) === !0;
}
var Ua = "=", $t = ";", Ze = ",", Mt = "baggage", Ga = 180, $a = 4096, ka = 8192, Fa = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
};
function _n(e) {
  return e.reduce(function(t, r) {
    var n = "" + t + (t !== "" ? Ze : "") + r;
    return n.length > ka ? t : n;
  }, "");
}
function cn(e) {
  return e.getAllEntries().map(function(t) {
    var r = Fa(t, 2), n = r[0], i = r[1], a = encodeURIComponent(n) + "=" + encodeURIComponent(i.value);
    return i.metadata !== void 0 && (a += $t + i.metadata.toString()), a;
  });
}
function ur(e) {
  var t = e.split($t);
  if (!(t.length <= 0)) {
    var r = t.shift();
    if (r) {
      var n = r.indexOf(Ua);
      if (!(n <= 0)) {
        var i = decodeURIComponent(r.substring(0, n).trim()), a = decodeURIComponent(r.substring(n + 1).trim()), o;
        return t.length > 0 && (o = Zr(t.join($t))), { key: i, value: a, metadata: o };
      }
    }
  }
}
function _r(e) {
  return typeof e != "string" || e.length === 0 ? {} : e.split(Ze).map(function(t) {
    return ur(t);
  }).filter(function(t) {
    return t !== void 0 && t.value.length > 0;
  }).reduce(function(t, r) {
    return t[r.key] = r.value, t;
  }, {});
}
const Va = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getKeyPairs: cn,
  parseKeyPairsIntoRecord: _r,
  parsePairKeyValue: ur,
  serializeKeyPairs: _n
}, Symbol.toStringTag, { value: "Module" }));
var cr = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.inject = function(t, r, n) {
      var i = D.getBaggage(t);
      if (!(!i || dt(t))) {
        var a = cn(i).filter(function(s) {
          return s.length <= $a;
        }).slice(0, Ga), o = _n(a);
        o.length > 0 && n.set(r, Mt, o);
      }
    }, e.prototype.extract = function(t, r, n) {
      var i = n.get(r, Mt), a = Array.isArray(i) ? i.join(Ze) : i;
      if (!a)
        return t;
      var o = {};
      if (a.length === 0)
        return t;
      var s = a.split(Ze);
      return s.forEach(function(u) {
        var _ = ur(u);
        if (_) {
          var c = { value: _.value };
          _.metadata && (c.metadata = _.metadata), o[_.key] = c;
        }
      }), Object.entries(o).length === 0 ? t : D.setBaggage(t, D.createBaggage(o));
    }, e.prototype.fields = function() {
      return [Mt];
    }, e;
  }()
), Ha = (
  /** @class */
  function() {
    function e(t, r) {
      this._monotonicClock = r, this._epochMillis = t.now(), this._performanceMillis = r.now();
    }
    return e.prototype.now = function() {
      var t = this._monotonicClock.now() - this._performanceMillis;
      return this._epochMillis + t;
    }, e;
  }()
), dn = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, Ya = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
};
function Ie(e) {
  var t, r, n = {};
  if (typeof e != "object" || e == null)
    return n;
  try {
    for (var i = dn(Object.entries(e)), a = i.next(); !a.done; a = i.next()) {
      var o = Ya(a.value, 2), s = o[0], u = o[1];
      if (!ln(s)) {
        v.warn("Invalid attribute key: " + s);
        continue;
      }
      if (!dr(u)) {
        v.warn("Invalid attribute value set for key: " + s);
        continue;
      }
      Array.isArray(u) ? n[s] = u.slice() : n[s] = u;
    }
  } catch (_) {
    t = { error: _ };
  } finally {
    try {
      a && !a.done && (r = i.return) && r.call(i);
    } finally {
      if (t)
        throw t.error;
    }
  }
  return n;
}
function ln(e) {
  return typeof e == "string" && e.length > 0;
}
function dr(e) {
  return e == null ? !0 : Array.isArray(e) ? ja(e) : pn(e);
}
function ja(e) {
  var t, r, n;
  try {
    for (var i = dn(e), a = i.next(); !a.done; a = i.next()) {
      var o = a.value;
      if (o != null) {
        if (!n) {
          if (pn(o)) {
            n = typeof o;
            continue;
          }
          return !1;
        }
        if (typeof o !== n)
          return !1;
      }
    }
  } catch (s) {
    t = { error: s };
  } finally {
    try {
      a && !a.done && (r = i.return) && r.call(i);
    } finally {
      if (t)
        throw t.error;
    }
  }
  return !0;
}
function pn(e) {
  switch (typeof e) {
    case "number":
    case "boolean":
    case "string":
      return !0;
  }
  return !1;
}
function fn() {
  return function(e) {
    v.error(Xa(e));
  };
}
function Xa(e) {
  return typeof e == "string" ? e : JSON.stringify(Wa(e));
}
function Wa(e) {
  for (var t = {}, r = e; r !== null; )
    Object.getOwnPropertyNames(r).forEach(function(n) {
      if (!t[n]) {
        var i = r[n];
        i && (t[n] = String(i));
      }
    }), r = Object.getPrototypeOf(r);
  return t;
}
var En = fn();
function Ka(e) {
  En = e;
}
function W(e) {
  try {
    En(e);
  } catch (t) {
  }
}
var U;
(function(e) {
  e.AlwaysOff = "always_off", e.AlwaysOn = "always_on", e.ParentBasedAlwaysOff = "parentbased_always_off", e.ParentBasedAlwaysOn = "parentbased_always_on", e.ParentBasedTraceIdRatio = "parentbased_traceidratio", e.TraceIdRatio = "traceidratio";
})(U || (U = {}));
var le = typeof globalThis == "object" ? globalThis : typeof self == "object" ? self : typeof window == "object" ? window : typeof global == "object" ? global : {}, za = ",", qa = ["OTEL_SDK_DISABLED"];
function Qa(e) {
  return qa.indexOf(e) > -1;
}
var Ja = [
  "OTEL_BSP_EXPORT_TIMEOUT",
  "OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
  "OTEL_BSP_MAX_QUEUE_SIZE",
  "OTEL_BSP_SCHEDULE_DELAY",
  "OTEL_BLRP_EXPORT_TIMEOUT",
  "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE",
  "OTEL_BLRP_MAX_QUEUE_SIZE",
  "OTEL_BLRP_SCHEDULE_DELAY",
  "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT",
  "OTEL_ATTRIBUTE_COUNT_LIMIT",
  "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT",
  "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT",
  "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT",
  "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT",
  "OTEL_SPAN_EVENT_COUNT_LIMIT",
  "OTEL_SPAN_LINK_COUNT_LIMIT",
  "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT",
  "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT",
  "OTEL_EXPORTER_OTLP_TIMEOUT",
  "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT",
  "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT",
  "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT",
  "OTEL_EXPORTER_JAEGER_AGENT_PORT"
];
function Za(e) {
  return Ja.indexOf(e) > -1;
}
var eo = [
  "OTEL_NO_PATCH_MODULES",
  "OTEL_PROPAGATORS"
];
function to(e) {
  return eo.indexOf(e) > -1;
}
var Ce = 1 / 0, Le = 128, Tn = 128, hn = 128, lr = {
  OTEL_SDK_DISABLED: !1,
  CONTAINER_NAME: "",
  ECS_CONTAINER_METADATA_URI_V4: "",
  ECS_CONTAINER_METADATA_URI: "",
  HOSTNAME: "",
  KUBERNETES_SERVICE_HOST: "",
  NAMESPACE: "",
  OTEL_BSP_EXPORT_TIMEOUT: 3e4,
  OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
  OTEL_BSP_MAX_QUEUE_SIZE: 2048,
  OTEL_BSP_SCHEDULE_DELAY: 5e3,
  OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
  OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
  OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
  OTEL_BLRP_SCHEDULE_DELAY: 5e3,
  OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
  OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
  OTEL_EXPORTER_JAEGER_ENDPOINT: "",
  OTEL_EXPORTER_JAEGER_PASSWORD: "",
  OTEL_EXPORTER_JAEGER_USER: "",
  OTEL_EXPORTER_OTLP_ENDPOINT: "",
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
  OTEL_EXPORTER_OTLP_HEADERS: "",
  OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
  OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
  OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
  OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
  OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
  OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
  OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
  OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
  OTEL_LOG_LEVEL: P.INFO,
  OTEL_NO_PATCH_MODULES: [],
  OTEL_PROPAGATORS: ["tracecontext", "baggage"],
  OTEL_RESOURCE_ATTRIBUTES: "",
  OTEL_SERVICE_NAME: "",
  OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: Ce,
  OTEL_ATTRIBUTE_COUNT_LIMIT: Le,
  OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: Ce,
  OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: Le,
  OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: Ce,
  OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: Le,
  OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
  OTEL_SPAN_LINK_COUNT_LIMIT: 128,
  OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: Tn,
  OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: hn,
  OTEL_TRACES_EXPORTER: "",
  OTEL_TRACES_SAMPLER: U.ParentBasedAlwaysOn,
  OTEL_TRACES_SAMPLER_ARG: "",
  OTEL_LOGS_EXPORTER: "",
  OTEL_EXPORTER_OTLP_INSECURE: "",
  OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
  OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
  OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
  OTEL_EXPORTER_OTLP_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_COMPRESSION: "",
  OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
  OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
  OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
  OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
  OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
  OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
  OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
  OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
  OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
  OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
  OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
  OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
  OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative"
};
function ro(e, t, r) {
  if (typeof r[e] != "undefined") {
    var n = String(r[e]);
    t[e] = n.toLowerCase() === "true";
  }
}
function no(e, t, r, n, i) {
  if (n === void 0 && (n = -1 / 0), i === void 0 && (i = 1 / 0), typeof r[e] != "undefined") {
    var a = Number(r[e]);
    isNaN(a) || (a < n ? t[e] = n : a > i ? t[e] = i : t[e] = a);
  }
}
function io(e, t, r, n) {
  n === void 0 && (n = za);
  var i = r[e];
  typeof i == "string" && (t[e] = i.split(n).map(function(a) {
    return a.trim();
  }));
}
var ao = {
  ALL: P.ALL,
  VERBOSE: P.VERBOSE,
  DEBUG: P.DEBUG,
  INFO: P.INFO,
  WARN: P.WARN,
  ERROR: P.ERROR,
  NONE: P.NONE
};
function oo(e, t, r) {
  var n = r[e];
  if (typeof n == "string") {
    var i = ao[n.toUpperCase()];
    i != null && (t[e] = i);
  }
}
function et(e) {
  var t = {};
  for (var r in lr) {
    var n = r;
    switch (n) {
      case "OTEL_LOG_LEVEL":
        oo(n, t, e);
        break;
      default:
        if (Qa(n))
          ro(n, t, e);
        else if (Za(n))
          no(n, t, e);
        else if (to(n))
          io(n, t, e);
        else {
          var i = e[n];
          typeof i != "undefined" && i !== null && (t[n] = String(i));
        }
    }
  }
  return t;
}
function vn() {
  return typeof process != "undefined" && process && process.env ? et(process.env) : et(le);
}
function y() {
  var e = et(le);
  return Object.assign({}, lr, e);
}
function gr(e) {
  return e >= 48 && e <= 57 ? e - 48 : e >= 97 && e <= 102 ? e - 87 : e - 55;
}
function ke(e) {
  for (var t = new Uint8Array(e.length / 2), r = 0, n = 0; n < e.length; n += 2) {
    var i = gr(e.charCodeAt(n)), a = gr(e.charCodeAt(n + 1));
    t[r++] = i << 4 | a;
  }
  return t;
}
var so = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, uo = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
};
function _o(e) {
  return btoa(String.fromCharCode.apply(String, uo([], so(ke(e)), !1)));
}
var co = 8, lo = 16, po = (
  /** @class */
  /* @__PURE__ */ function() {
    function e() {
      this.generateTraceId = Rr(lo), this.generateSpanId = Rr(co);
    }
    return e;
  }()
), Ve = Array(32);
function Rr(e) {
  return function() {
    for (var r = 0; r < e * 2; r++)
      Ve[r] = Math.floor(Math.random() * 16) + 48, Ve[r] >= 58 && (Ve[r] += 39);
    return String.fromCharCode.apply(null, Ve.slice(0, e * 2));
  };
}
var b = performance, Sn = "1.22.0";
// @__NO_SIDE_EFFECTS__
function An(e) {
  for (var t = {}, r = e.length, n = 0; n < r; n++) {
    var i = e[n];
    i && (t[String(i).toUpperCase().replace(/[-.]/g, "_")] = i);
  }
  return t;
}
var fo = "http.url", Eo = "http.user_agent", It = fo, To = Eo, ho = "cloud.provider", vo = "cloud.account.id", So = "cloud.region", Ao = "cloud.availability_zone", Oo = "cloud.platform", mo = "aws.ecs.container.arn", No = "aws.ecs.cluster.arn", Po = "aws.ecs.launchtype", yo = "aws.ecs.task.arn", go = "aws.ecs.task.family", Ro = "aws.ecs.task.revision", Mo = "aws.eks.cluster.arn", Io = "aws.log.group.names", Co = "aws.log.group.arns", Lo = "aws.log.stream.names", Do = "aws.log.stream.arns", bo = "container.name", wo = "container.id", xo = "container.runtime", Bo = "container.image.name", Uo = "container.image.tag", Go = "deployment.environment", $o = "device.id", ko = "device.model.identifier", Fo = "device.model.name", Vo = "faas.name", Ho = "faas.id", Yo = "faas.version", jo = "faas.instance", Xo = "faas.max_memory", Wo = "host.id", Ko = "host.name", zo = "host.type", qo = "host.arch", Qo = "host.image.name", Jo = "host.image.id", Zo = "host.image.version", es = "k8s.cluster.name", ts = "k8s.node.name", rs = "k8s.node.uid", ns = "k8s.namespace.name", is = "k8s.pod.uid", as = "k8s.pod.name", os = "k8s.container.name", ss = "k8s.replicaset.uid", us = "k8s.replicaset.name", _s = "k8s.deployment.uid", cs = "k8s.deployment.name", ds = "k8s.statefulset.uid", ls = "k8s.statefulset.name", ps = "k8s.daemonset.uid", fs = "k8s.daemonset.name", Es = "k8s.job.uid", Ts = "k8s.job.name", hs = "k8s.cronjob.uid", vs = "k8s.cronjob.name", Ss = "os.type", As = "os.description", Os = "os.name", ms = "os.version", Ns = "process.pid", Ps = "process.executable.name", ys = "process.executable.path", gs = "process.command", Rs = "process.command_line", Ms = "process.command_args", Is = "process.owner", Cs = "process.runtime.name", Ls = "process.runtime.version", Ds = "process.runtime.description", bs = "service.name", ws = "service.namespace", xs = "service.instance.id", Bs = "service.version", Us = "telemetry.sdk.name", Gs = "telemetry.sdk.language", $s = "telemetry.sdk.version", ks = "telemetry.auto.version", Fs = "webengine.name", Vs = "webengine.version", Hs = "webengine.description", x = /* @__PURE__ */ An([
  ho,
  vo,
  So,
  Ao,
  Oo,
  mo,
  No,
  Po,
  yo,
  go,
  Ro,
  Mo,
  Io,
  Co,
  Lo,
  Do,
  bo,
  wo,
  xo,
  Bo,
  Uo,
  Go,
  $o,
  ko,
  Fo,
  Vo,
  Ho,
  Yo,
  jo,
  Xo,
  Wo,
  Ko,
  zo,
  qo,
  Qo,
  Jo,
  Zo,
  es,
  ts,
  rs,
  ns,
  is,
  as,
  os,
  ss,
  us,
  _s,
  cs,
  ds,
  ls,
  ps,
  fs,
  Es,
  Ts,
  hs,
  vs,
  Ss,
  As,
  Os,
  ms,
  Ns,
  Ps,
  ys,
  gs,
  Rs,
  Ms,
  Is,
  Cs,
  Ls,
  Ds,
  bs,
  ws,
  xs,
  Bs,
  Us,
  Gs,
  $s,
  ks,
  Fs,
  Vs,
  Hs
]), Ys = "cpp", js = "dotnet", Xs = "erlang", Ws = "go", Ks = "java", zs = "nodejs", qs = "php", Qs = "python", Js = "ruby", Zs = "webjs", eu = /* @__PURE__ */ An([
  Ys,
  js,
  Xs,
  Ws,
  Ks,
  zs,
  qs,
  Qs,
  Js,
  Zs
]), oe, Ke = (oe = {}, oe[x.TELEMETRY_SDK_NAME] = "opentelemetry", oe[x.PROCESS_RUNTIME_NAME] = "browser", oe[x.TELEMETRY_SDK_LANGUAGE] = eu.WEBJS, oe[x.TELEMETRY_SDK_VERSION] = Sn, oe);
function tu(e) {
}
var On = 9, ru = 6, nu = Math.pow(10, ru), tt = Math.pow(10, On);
function $(e) {
  var t = e / 1e3, r = Math.trunc(t), n = Math.round(e % 1e3 * nu);
  return [r, n];
}
function lt() {
  var e = b.timeOrigin;
  if (typeof e != "number") {
    var t = b;
    e = t.timing && t.timing.fetchStart;
  }
  return e;
}
function ne(e) {
  var t = $(lt()), r = $(typeof e == "number" ? e : b.now());
  return pr(t, r);
}
function pe(e) {
  if (pt(e))
    return e;
  if (typeof e == "number")
    return e < lt() ? ne(e) : $(e);
  if (e instanceof Date)
    return $(e.getTime());
  throw TypeError("Invalid input type");
}
function mn(e, t) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return n < 0 && (r -= 1, n += tt), [r, n];
}
function iu(e) {
  var t = On, r = "" + "0".repeat(t) + e[1] + "Z", n = r.substr(r.length - t - 1), i = new Date(e[0] * 1e3).toISOString();
  return i.replace("000Z", n);
}
function k(e) {
  return e[0] * tt + e[1];
}
function au(e) {
  return e[0] * 1e3 + e[1] / 1e6;
}
function kt(e) {
  return e[0] * 1e6 + e[1] / 1e3;
}
function pt(e) {
  return Array.isArray(e) && e.length === 2 && typeof e[0] == "number" && typeof e[1] == "number";
}
function Ft(e) {
  return pt(e) || typeof e == "number" || e instanceof Date;
}
function pr(e, t) {
  var r = [e[0] + t[0], e[1] + t[1]];
  return r[1] >= tt && (r[1] -= tt, r[0] += 1), r;
}
var F;
(function(e) {
  e[e.SUCCESS = 0] = "SUCCESS", e[e.FAILED = 1] = "FAILED";
})(F || (F = {}));
var ou = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, fr = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = {});
      var r;
      this._propagators = (r = t.propagators) !== null && r !== void 0 ? r : [], this._fields = Array.from(new Set(this._propagators.map(function(n) {
        return typeof n.fields == "function" ? n.fields() : [];
      }).reduce(function(n, i) {
        return n.concat(i);
      }, [])));
    }
    return e.prototype.inject = function(t, r, n) {
      var i, a;
      try {
        for (var o = ou(this._propagators), s = o.next(); !s.done; s = o.next()) {
          var u = s.value;
          try {
            u.inject(t, r, n);
          } catch (_) {
            v.warn("Failed to inject with " + u.constructor.name + ". Err: " + _.message);
          }
        }
      } catch (_) {
        i = { error: _ };
      } finally {
        try {
          s && !s.done && (a = o.return) && a.call(o);
        } finally {
          if (i)
            throw i.error;
        }
      }
    }, e.prototype.extract = function(t, r, n) {
      return this._propagators.reduce(function(i, a) {
        try {
          return a.extract(i, r, n);
        } catch (o) {
          v.warn("Failed to inject with " + a.constructor.name + ". Err: " + o.message);
        }
        return i;
      }, t);
    }, e.prototype.fields = function() {
      return this._fields.slice();
    }, e;
  }()
), Vt = "[_0-9a-z-*/]", su = "[a-z]" + Vt + "{0,255}", uu = "[a-z0-9]" + Vt + "{0,240}@[a-z]" + Vt + "{0,13}", _u = new RegExp("^(?:" + su + "|" + uu + ")$"), cu = /^[ -~]{0,255}[!-~]$/, du = /,|=/;
function lu(e) {
  return _u.test(e);
}
function pu(e) {
  return cu.test(e) && !du.test(e);
}
var Mr = 32, fu = 512, Ir = ",", Cr = "=", Nn = (
  /** @class */
  function() {
    function e(t) {
      this._internalState = /* @__PURE__ */ new Map(), t && this._parse(t);
    }
    return e.prototype.set = function(t, r) {
      var n = this._clone();
      return n._internalState.has(t) && n._internalState.delete(t), n._internalState.set(t, r), n;
    }, e.prototype.unset = function(t) {
      var r = this._clone();
      return r._internalState.delete(t), r;
    }, e.prototype.get = function(t) {
      return this._internalState.get(t);
    }, e.prototype.serialize = function() {
      var t = this;
      return this._keys().reduce(function(r, n) {
        return r.push(n + Cr + t.get(n)), r;
      }, []).join(Ir);
    }, e.prototype._parse = function(t) {
      t.length > fu || (this._internalState = t.split(Ir).reverse().reduce(function(r, n) {
        var i = n.trim(), a = i.indexOf(Cr);
        if (a !== -1) {
          var o = i.slice(0, a), s = i.slice(a + 1, n.length);
          lu(o) && pu(s) && r.set(o, s);
        }
        return r;
      }, /* @__PURE__ */ new Map()), this._internalState.size > Mr && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, Mr))));
    }, e.prototype._keys = function() {
      return Array.from(this._internalState.keys()).reverse();
    }, e.prototype._clone = function() {
      var t = new e();
      return t._internalState = new Map(this._internalState), t;
    }, e;
  }()
), De = "traceparent", ze = "tracestate", Eu = "00", Tu = "(?!ff)[\\da-f]{2}", hu = "(?![0]{32})[\\da-f]{32}", vu = "(?![0]{16})[\\da-f]{16}", Su = "[\\da-f]{2}", Au = new RegExp("^\\s?(" + Tu + ")-(" + hu + ")-(" + vu + ")-(" + Su + ")(-.*)?\\s?$");
function Pn(e) {
  var t = Au.exec(e);
  return !t || t[1] === "00" && t[5] ? null : {
    traceId: t[2],
    spanId: t[3],
    traceFlags: parseInt(t[4], 16)
  };
}
var Er = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.inject = function(t, r, n) {
      var i = N.getSpanContext(t);
      if (!(!i || dt(t) || !Se(i))) {
        var a = Eu + "-" + i.traceId + "-" + i.spanId + "-0" + Number(i.traceFlags || w.NONE).toString(16);
        n.set(r, De, a), i.traceState && n.set(r, ze, i.traceState.serialize());
      }
    }, e.prototype.extract = function(t, r, n) {
      var i = n.get(r, De);
      if (!i)
        return t;
      var a = Array.isArray(i) ? i[0] : i;
      if (typeof a != "string")
        return t;
      var o = Pn(a);
      if (!o)
        return t;
      o.isRemote = !0;
      var s = n.get(r, ze);
      if (s) {
        var u = Array.isArray(s) ? s.join(",") : s;
        o.traceState = new Nn(typeof u == "string" ? u : void 0);
      }
      return N.setSpanContext(t, o);
    }, e.prototype.fields = function() {
      return [De, ze];
    }, e;
  }()
), Tr = $e("OpenTelemetry SDK Context Key RPC_METADATA"), Ht;
(function(e) {
  e.HTTP = "http";
})(Ht || (Ht = {}));
function Ou(e, t) {
  return e.setValue(Tr, t);
}
function mu(e) {
  return e.deleteValue(Tr);
}
function Nu(e) {
  return e.getValue(Tr);
}
var Yt = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.shouldSample = function() {
      return {
        decision: K.NOT_RECORD
      };
    }, e.prototype.toString = function() {
      return "AlwaysOffSampler";
    }, e;
  }()
), qe = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.shouldSample = function() {
      return {
        decision: K.RECORD_AND_SAMPLED
      };
    }, e.prototype.toString = function() {
      return "AlwaysOnSampler";
    }, e;
  }()
), Pu = (
  /** @class */
  function() {
    function e(t) {
      var r, n, i, a;
      this._root = t.root, this._root || (W(new Error("ParentBasedSampler must have a root sampler configured")), this._root = new qe()), this._remoteParentSampled = (r = t.remoteParentSampled) !== null && r !== void 0 ? r : new qe(), this._remoteParentNotSampled = (n = t.remoteParentNotSampled) !== null && n !== void 0 ? n : new Yt(), this._localParentSampled = (i = t.localParentSampled) !== null && i !== void 0 ? i : new qe(), this._localParentNotSampled = (a = t.localParentNotSampled) !== null && a !== void 0 ? a : new Yt();
    }
    return e.prototype.shouldSample = function(t, r, n, i, a, o) {
      var s = N.getSpanContext(t);
      return !s || !Se(s) ? this._root.shouldSample(t, r, n, i, a, o) : s.isRemote ? s.traceFlags & w.SAMPLED ? this._remoteParentSampled.shouldSample(t, r, n, i, a, o) : this._remoteParentNotSampled.shouldSample(t, r, n, i, a, o) : s.traceFlags & w.SAMPLED ? this._localParentSampled.shouldSample(t, r, n, i, a, o) : this._localParentNotSampled.shouldSample(t, r, n, i, a, o);
    }, e.prototype.toString = function() {
      return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
    }, e;
  }()
), yu = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = 0), this._ratio = t, this._ratio = this._normalize(t), this._upperBound = Math.floor(this._ratio * 4294967295);
    }
    return e.prototype.shouldSample = function(t, r) {
      return {
        decision: _t(r) && this._accumulate(r) < this._upperBound ? K.RECORD_AND_SAMPLED : K.NOT_RECORD
      };
    }, e.prototype.toString = function() {
      return "TraceIdRatioBased{" + this._ratio + "}";
    }, e.prototype._normalize = function(t) {
      return typeof t != "number" || isNaN(t) ? 0 : t >= 1 ? 1 : t <= 0 ? 0 : t;
    }, e.prototype._accumulate = function(t) {
      for (var r = 0, n = 0; n < t.length / 8; n++) {
        var i = n * 8, a = parseInt(t.slice(i, i + 8), 16);
        r = (r ^ a) >>> 0;
      }
      return r;
    }, e;
  }()
), gu = "[object Object]", Ru = "[object Null]", Mu = "[object Undefined]", Iu = Function.prototype, yn = Iu.toString, Cu = yn.call(Object), Lu = Du(Object.getPrototypeOf, Object), gn = Object.prototype, Rn = gn.hasOwnProperty, J = Symbol ? Symbol.toStringTag : void 0, Mn = gn.toString;
function Du(e, t) {
  return function(r) {
    return e(t(r));
  };
}
function Lr(e) {
  if (!bu(e) || wu(e) !== gu)
    return !1;
  var t = Lu(e);
  if (t === null)
    return !0;
  var r = Rn.call(t, "constructor") && t.constructor;
  return typeof r == "function" && r instanceof r && yn.call(r) === Cu;
}
function bu(e) {
  return e != null && typeof e == "object";
}
function wu(e) {
  return e == null ? e === void 0 ? Mu : Ru : J && J in Object(e) ? xu(e) : Bu(e);
}
function xu(e) {
  var t = Rn.call(e, J), r = e[J], n = !1;
  try {
    e[J] = void 0, n = !0;
  } catch (a) {
  }
  var i = Mn.call(e);
  return n && (t ? e[J] = r : delete e[J]), i;
}
function Bu(e) {
  return Mn.call(e);
}
var Uu = 20;
function In() {
  for (var e = [], t = 0; t < arguments.length; t++)
    e[t] = arguments[t];
  for (var r = e.shift(), n = /* @__PURE__ */ new WeakMap(); e.length > 0; )
    r = Cn(r, e.shift(), 0, n);
  return r;
}
function Ct(e) {
  return rt(e) ? e.slice() : e;
}
function Cn(e, t, r, n) {
  r === void 0 && (r = 0);
  var i;
  if (!(r > Uu)) {
    if (r++, Qe(e) || Qe(t) || Ln(t))
      i = Ct(t);
    else if (rt(e)) {
      if (i = e.slice(), rt(t))
        for (var a = 0, o = t.length; a < o; a++)
          i.push(Ct(t[a]));
      else if (Ne(t))
        for (var s = Object.keys(t), a = 0, o = s.length; a < o; a++) {
          var u = s[a];
          i[u] = Ct(t[u]);
        }
    } else if (Ne(e))
      if (Ne(t)) {
        if (!Gu(e, t))
          return t;
        i = Object.assign({}, e);
        for (var s = Object.keys(t), a = 0, o = s.length; a < o; a++) {
          var u = s[a], _ = t[u];
          if (Qe(_))
            typeof _ == "undefined" ? delete i[u] : i[u] = _;
          else {
            var c = i[u], l = _;
            if (Dr(e, u, n) || Dr(t, u, n))
              delete i[u];
            else {
              if (Ne(c) && Ne(l)) {
                var p = n.get(c) || [], E = n.get(l) || [];
                p.push({ obj: e, key: u }), E.push({ obj: t, key: u }), n.set(c, p), n.set(l, E);
              }
              i[u] = Cn(i[u], _, r, n);
            }
          }
        }
      } else
        i = t;
    return i;
  }
}
function Dr(e, t, r) {
  for (var n = r.get(e[t]) || [], i = 0, a = n.length; i < a; i++) {
    var o = n[i];
    if (o.key === t && o.obj === e)
      return !0;
  }
  return !1;
}
function rt(e) {
  return Array.isArray(e);
}
function Ln(e) {
  return typeof e == "function";
}
function Ne(e) {
  return !Qe(e) && !rt(e) && !Ln(e) && typeof e == "object";
}
function Qe(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "undefined" || e instanceof Date || e instanceof RegExp || e === null;
}
function Gu(e, t) {
  return !(!Lr(e) || !Lr(t));
}
var $u = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Dn = (
  /** @class */
  function(e) {
    $u(t, e);
    function t(r) {
      var n = e.call(this, r) || this;
      return Object.setPrototypeOf(n, t.prototype), n;
    }
    return t;
  }(Error)
);
function ku(e, t) {
  var r, n = new Promise(function(a, o) {
    r = setTimeout(function() {
      o(new Dn("Operation timed out."));
    }, t);
  });
  return Promise.race([e, n]).then(function(i) {
    return clearTimeout(r), i;
  }, function(i) {
    throw clearTimeout(r), i;
  });
}
var Fu = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
function hr(e, t) {
  return typeof t == "string" ? e === t : !!e.match(t);
}
function vr(e, t) {
  var r, n;
  if (!t)
    return !1;
  try {
    for (var i = Fu(t), a = i.next(); !a.done; a = i.next()) {
      var o = a.value;
      if (hr(e, o))
        return !0;
    }
  } catch (s) {
    r = { error: s };
  } finally {
    try {
      a && !a.done && (n = i.return) && n.call(i);
    } finally {
      if (r)
        throw r.error;
    }
  }
  return !1;
}
function Vu(e) {
  return typeof e == "function" && typeof e.__original == "function" && typeof e.__unwrap == "function" && e.__wrapped === !0;
}
var Hu = (
  /** @class */
  function() {
    function e() {
      var t = this;
      this._promise = new Promise(function(r, n) {
        t._resolve = r, t._reject = n;
      });
    }
    return Object.defineProperty(e.prototype, "promise", {
      get: function() {
        return this._promise;
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype.resolve = function(t) {
      this._resolve(t);
    }, e.prototype.reject = function(t) {
      this._reject(t);
    }, e;
  }()
), Yu = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, ju = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, ft = (
  /** @class */
  function() {
    function e(t, r) {
      this._callback = t, this._that = r, this._isCalled = !1, this._deferred = new Hu();
    }
    return Object.defineProperty(e.prototype, "isCalled", {
      get: function() {
        return this._isCalled;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e.prototype, "promise", {
      get: function() {
        return this._deferred.promise;
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype.call = function() {
      for (var t, r = this, n = [], i = 0; i < arguments.length; i++)
        n[i] = arguments[i];
      if (!this._isCalled) {
        this._isCalled = !0;
        try {
          Promise.resolve((t = this._callback).call.apply(t, ju([this._that], Yu(n), !1))).then(function(a) {
            return r._deferred.resolve(a);
          }, function(a) {
            return r._deferred.reject(a);
          });
        } catch (a) {
          this._deferred.reject(a);
        }
      }
      return this._deferred.promise;
    }, e;
  }()
);
function Xu(e, t) {
  return new Promise(function(r) {
    O.with(sr(O.active()), function() {
      e.export(t, function(n) {
        r(n);
      });
    });
  });
}
var bn = {
  _export: Xu
};
const Wu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AlwaysOffSampler: Yt,
  AlwaysOnSampler: qe,
  AnchoredClock: Ha,
  BindOnceFuture: ft,
  CompositePropagator: fr,
  DEFAULT_ATTRIBUTE_COUNT_LIMIT: Le,
  DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT: Ce,
  DEFAULT_ENVIRONMENT: lr,
  DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: Tn,
  DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: hn,
  get ExportResultCode() {
    return F;
  },
  ParentBasedSampler: Pu,
  get RPCType() {
    return Ht;
  },
  RandomIdGenerator: po,
  SDK_INFO: Ke,
  TRACE_PARENT_HEADER: De,
  TRACE_STATE_HEADER: ze,
  TimeoutError: Dn,
  TraceIdRatioBasedSampler: yu,
  TraceState: Nn,
  get TracesSamplerValues() {
    return U;
  },
  VERSION: Sn,
  W3CBaggagePropagator: cr,
  W3CTraceContextPropagator: Er,
  _globalThis: le,
  addHrTimes: pr,
  baggageUtils: Va,
  callWithTimeout: ku,
  deleteRPCMetadata: mu,
  getEnv: y,
  getEnvWithoutDefaults: vn,
  getRPCMetadata: Nu,
  getTimeOrigin: lt,
  globalErrorHandler: W,
  hexToBase64: _o,
  hexToBinary: ke,
  hrTime: ne,
  hrTimeDuration: mn,
  hrTimeToMicroseconds: kt,
  hrTimeToMilliseconds: au,
  hrTimeToNanoseconds: k,
  hrTimeToTimeStamp: iu,
  internal: bn,
  isAttributeKey: ln,
  isAttributeValue: dr,
  isTimeInput: Ft,
  isTimeInputHrTime: pt,
  isTracingSuppressed: dt,
  isUrlIgnored: vr,
  isWrapped: Vu,
  loggingErrorHandler: fn,
  merge: In,
  millisToHrTime: $,
  otperformance: b,
  parseEnvironment: et,
  parseTraceParent: Pn,
  sanitizeAttributes: Ie,
  setGlobalErrorHandler: Ka,
  setRPCMetadata: Ou,
  suppressTracing: sr,
  timeInputToHrTime: pe,
  unrefTimer: tu,
  unsuppressTracing: Ba,
  urlMatches: hr
}, Symbol.toStringTag, { value: "Module" }));
// @__NO_SIDE_EFFECTS__
function Ku(e) {
  for (var t = {}, r = e.length, n = 0; n < r; n++) {
    var i = e[n];
    i && (t[String(i).toUpperCase().replace(/[-.]/g, "_")] = i);
  }
  return t;
}
var zu = "aws.lambda.invoked_arn", qu = "db.system", Qu = "db.connection_string", Ju = "db.user", Zu = "db.jdbc.driver_classname", e_ = "db.name", t_ = "db.statement", r_ = "db.operation", n_ = "db.mssql.instance_name", i_ = "db.cassandra.keyspace", a_ = "db.cassandra.page_size", o_ = "db.cassandra.consistency_level", s_ = "db.cassandra.table", u_ = "db.cassandra.idempotence", __ = "db.cassandra.speculative_execution_count", c_ = "db.cassandra.coordinator.id", d_ = "db.cassandra.coordinator.dc", l_ = "db.hbase.namespace", p_ = "db.redis.database_index", f_ = "db.mongodb.collection", E_ = "db.sql.table", T_ = "exception.type", h_ = "exception.message", v_ = "exception.stacktrace", S_ = "exception.escaped", A_ = "faas.trigger", O_ = "faas.execution", m_ = "faas.document.collection", N_ = "faas.document.operation", P_ = "faas.document.time", y_ = "faas.document.name", g_ = "faas.time", R_ = "faas.cron", M_ = "faas.coldstart", I_ = "faas.invoked_name", C_ = "faas.invoked_provider", L_ = "faas.invoked_region", D_ = "net.transport", b_ = "net.peer.ip", w_ = "net.peer.port", x_ = "net.peer.name", B_ = "net.host.ip", U_ = "net.host.port", G_ = "net.host.name", $_ = "net.host.connection.type", k_ = "net.host.connection.subtype", F_ = "net.host.carrier.name", V_ = "net.host.carrier.mcc", H_ = "net.host.carrier.mnc", Y_ = "net.host.carrier.icc", j_ = "peer.service", X_ = "enduser.id", W_ = "enduser.role", K_ = "enduser.scope", z_ = "thread.id", q_ = "thread.name", Q_ = "code.function", J_ = "code.namespace", Z_ = "code.filepath", ec = "code.lineno", tc = "http.method", rc = "http.url", nc = "http.target", ic = "http.host", ac = "http.scheme", oc = "http.status_code", sc = "http.flavor", uc = "http.user_agent", _c = "http.request_content_length", cc = "http.request_content_length_uncompressed", dc = "http.response_content_length", lc = "http.response_content_length_uncompressed", pc = "http.server_name", fc = "http.route", Ec = "http.client_ip", Tc = "aws.dynamodb.table_names", hc = "aws.dynamodb.consumed_capacity", vc = "aws.dynamodb.item_collection_metrics", Sc = "aws.dynamodb.provisioned_read_capacity", Ac = "aws.dynamodb.provisioned_write_capacity", Oc = "aws.dynamodb.consistent_read", mc = "aws.dynamodb.projection", Nc = "aws.dynamodb.limit", Pc = "aws.dynamodb.attributes_to_get", yc = "aws.dynamodb.index_name", gc = "aws.dynamodb.select", Rc = "aws.dynamodb.global_secondary_indexes", Mc = "aws.dynamodb.local_secondary_indexes", Ic = "aws.dynamodb.exclusive_start_table", Cc = "aws.dynamodb.table_count", Lc = "aws.dynamodb.scan_forward", Dc = "aws.dynamodb.segment", bc = "aws.dynamodb.total_segments", wc = "aws.dynamodb.count", xc = "aws.dynamodb.scanned_count", Bc = "aws.dynamodb.attribute_definitions", Uc = "aws.dynamodb.global_secondary_index_updates", Gc = "messaging.system", $c = "messaging.destination", kc = "messaging.destination_kind", Fc = "messaging.temp_destination", Vc = "messaging.protocol", Hc = "messaging.protocol_version", Yc = "messaging.url", jc = "messaging.message_id", Xc = "messaging.conversation_id", Wc = "messaging.message_payload_size_bytes", Kc = "messaging.message_payload_compressed_size_bytes", zc = "messaging.operation", qc = "messaging.consumer_id", Qc = "messaging.rabbitmq.routing_key", Jc = "messaging.kafka.message_key", Zc = "messaging.kafka.consumer_group", ed = "messaging.kafka.client_id", td = "messaging.kafka.partition", rd = "messaging.kafka.tombstone", nd = "rpc.system", id = "rpc.service", ad = "rpc.method", od = "rpc.grpc.status_code", sd = "rpc.jsonrpc.version", ud = "rpc.jsonrpc.request_id", _d = "rpc.jsonrpc.error_code", cd = "rpc.jsonrpc.error_message", dd = "message.type", ld = "message.id", pd = "message.compressed_size", fd = "message.uncompressed_size", Y = /* @__PURE__ */ Ku([
  zu,
  qu,
  Qu,
  Ju,
  Zu,
  e_,
  t_,
  r_,
  n_,
  i_,
  a_,
  o_,
  s_,
  u_,
  __,
  c_,
  d_,
  l_,
  p_,
  f_,
  E_,
  T_,
  h_,
  v_,
  S_,
  A_,
  O_,
  m_,
  N_,
  P_,
  y_,
  g_,
  R_,
  M_,
  I_,
  C_,
  L_,
  D_,
  b_,
  w_,
  x_,
  B_,
  U_,
  G_,
  $_,
  k_,
  F_,
  V_,
  H_,
  Y_,
  j_,
  X_,
  W_,
  K_,
  z_,
  q_,
  Q_,
  J_,
  Z_,
  ec,
  tc,
  rc,
  nc,
  ic,
  ac,
  oc,
  sc,
  uc,
  _c,
  cc,
  dc,
  lc,
  pc,
  fc,
  Ec,
  Tc,
  hc,
  vc,
  Sc,
  Ac,
  Oc,
  mc,
  Nc,
  Pc,
  yc,
  gc,
  Rc,
  Mc,
  Ic,
  Cc,
  Lc,
  Dc,
  bc,
  wc,
  xc,
  Bc,
  Uc,
  Gc,
  $c,
  kc,
  Fc,
  Vc,
  Hc,
  Yc,
  jc,
  Xc,
  Wc,
  Kc,
  zc,
  qc,
  Qc,
  Jc,
  Zc,
  ed,
  td,
  rd,
  nd,
  id,
  ad,
  od,
  sd,
  ud,
  _d,
  cd,
  dd,
  ld,
  pd,
  fd
]), Ed = "exception", Td = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, hd = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, vd = (
  /** @class */
  function() {
    function e(t, r, n, i, a, o, s, u, _, c) {
      s === void 0 && (s = []), this.attributes = {}, this.links = [], this.events = [], this._droppedAttributesCount = 0, this._droppedEventsCount = 0, this._droppedLinksCount = 0, this.status = {
        code: Je.UNSET
      }, this.endTime = [0, 0], this._ended = !1, this._duration = [-1, -1], this.name = n, this._spanContext = i, this.parentSpanId = o, this.kind = a, this.links = s;
      var l = Date.now();
      this._performanceStartTime = b.now(), this._performanceOffset = l - (this._performanceStartTime + lt()), this._startTimeProvided = u != null, this.startTime = this._getTime(u != null ? u : l), this.resource = t.resource, this.instrumentationLibrary = t.instrumentationLibrary, this._spanLimits = t.getSpanLimits(), this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit || 0, c != null && this.setAttributes(c), this._spanProcessor = t.getActiveSpanProcessor(), this._spanProcessor.onStart(this, r);
    }
    return e.prototype.spanContext = function() {
      return this._spanContext;
    }, e.prototype.setAttribute = function(t, r) {
      return r == null || this._isSpanEnded() ? this : t.length === 0 ? (v.warn("Invalid attribute key: " + t), this) : dr(r) ? Object.keys(this.attributes).length >= this._spanLimits.attributeCountLimit && !Object.prototype.hasOwnProperty.call(this.attributes, t) ? (this._droppedAttributesCount++, this) : (this.attributes[t] = this._truncateToSize(r), this) : (v.warn("Invalid attribute value set for key: " + t), this);
    }, e.prototype.setAttributes = function(t) {
      var r, n;
      try {
        for (var i = Td(Object.entries(t)), a = i.next(); !a.done; a = i.next()) {
          var o = hd(a.value, 2), s = o[0], u = o[1];
          this.setAttribute(s, u);
        }
      } catch (_) {
        r = { error: _ };
      } finally {
        try {
          a && !a.done && (n = i.return) && n.call(i);
        } finally {
          if (r)
            throw r.error;
        }
      }
      return this;
    }, e.prototype.addEvent = function(t, r, n) {
      if (this._isSpanEnded())
        return this;
      if (this._spanLimits.eventCountLimit === 0)
        return v.warn("No events allowed."), this._droppedEventsCount++, this;
      this.events.length >= this._spanLimits.eventCountLimit && (this._droppedEventsCount === 0 && v.debug("Dropping extra events."), this.events.shift(), this._droppedEventsCount++), Ft(r) && (Ft(n) || (n = r), r = void 0);
      var i = Ie(r);
      return this.events.push({
        name: t,
        attributes: i,
        time: this._getTime(n),
        droppedAttributesCount: 0
      }), this;
    }, e.prototype.setStatus = function(t) {
      return this._isSpanEnded() ? this : (this.status = t, this);
    }, e.prototype.updateName = function(t) {
      return this._isSpanEnded() ? this : (this.name = t, this);
    }, e.prototype.end = function(t) {
      if (this._isSpanEnded()) {
        v.error(this.name + " " + this._spanContext.traceId + "-" + this._spanContext.spanId + " - You can only call end() on a span once.");
        return;
      }
      this._ended = !0, this.endTime = this._getTime(t), this._duration = mn(this.startTime, this.endTime), this._duration[0] < 0 && (v.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime), this.endTime = this.startTime.slice(), this._duration = [0, 0]), this._droppedEventsCount > 0 && v.warn("Dropped " + this._droppedEventsCount + " events because eventCountLimit reached"), this._spanProcessor.onEnd(this);
    }, e.prototype._getTime = function(t) {
      if (typeof t == "number" && t < b.now())
        return ne(t + this._performanceOffset);
      if (typeof t == "number")
        return $(t);
      if (t instanceof Date)
        return $(t.getTime());
      if (pt(t))
        return t;
      if (this._startTimeProvided)
        return $(Date.now());
      var r = b.now() - this._performanceStartTime;
      return pr(this.startTime, $(r));
    }, e.prototype.isRecording = function() {
      return this._ended === !1;
    }, e.prototype.recordException = function(t, r) {
      var n = {};
      typeof t == "string" ? n[Y.EXCEPTION_MESSAGE] = t : t && (t.code ? n[Y.EXCEPTION_TYPE] = t.code.toString() : t.name && (n[Y.EXCEPTION_TYPE] = t.name), t.message && (n[Y.EXCEPTION_MESSAGE] = t.message), t.stack && (n[Y.EXCEPTION_STACKTRACE] = t.stack)), n[Y.EXCEPTION_TYPE] || n[Y.EXCEPTION_MESSAGE] ? this.addEvent(Ed, n, r) : v.warn("Failed to record an exception " + t);
    }, Object.defineProperty(e.prototype, "duration", {
      get: function() {
        return this._duration;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e.prototype, "ended", {
      get: function() {
        return this._ended;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e.prototype, "droppedAttributesCount", {
      get: function() {
        return this._droppedAttributesCount;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e.prototype, "droppedEventsCount", {
      get: function() {
        return this._droppedEventsCount;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e.prototype, "droppedLinksCount", {
      get: function() {
        return this._droppedLinksCount;
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype._isSpanEnded = function() {
      return this._ended && v.warn("Can not execute the operation on ended Span {traceId: " + this._spanContext.traceId + ", spanId: " + this._spanContext.spanId + "}"), this._ended;
    }, e.prototype._truncateToLimitUtil = function(t, r) {
      return t.length <= r ? t : t.substr(0, r);
    }, e.prototype._truncateToSize = function(t) {
      var r = this, n = this._attributeValueLengthLimit;
      return n <= 0 ? (v.warn("Attribute value limit must be positive, got " + n), t) : typeof t == "string" ? this._truncateToLimitUtil(t, n) : Array.isArray(t) ? t.map(function(i) {
        return typeof i == "string" ? r._truncateToLimitUtil(i, n) : i;
      }) : t;
    }, e;
  }()
), Te;
(function(e) {
  e[e.NOT_RECORD = 0] = "NOT_RECORD", e[e.RECORD = 1] = "RECORD", e[e.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
})(Te || (Te = {}));
var nt = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.shouldSample = function() {
      return {
        decision: Te.NOT_RECORD
      };
    }, e.prototype.toString = function() {
      return "AlwaysOffSampler";
    }, e;
  }()
), fe = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.shouldSample = function() {
      return {
        decision: Te.RECORD_AND_SAMPLED
      };
    }, e.prototype.toString = function() {
      return "AlwaysOnSampler";
    }, e;
  }()
), Lt = (
  /** @class */
  function() {
    function e(t) {
      var r, n, i, a;
      this._root = t.root, this._root || (W(new Error("ParentBasedSampler must have a root sampler configured")), this._root = new fe()), this._remoteParentSampled = (r = t.remoteParentSampled) !== null && r !== void 0 ? r : new fe(), this._remoteParentNotSampled = (n = t.remoteParentNotSampled) !== null && n !== void 0 ? n : new nt(), this._localParentSampled = (i = t.localParentSampled) !== null && i !== void 0 ? i : new fe(), this._localParentNotSampled = (a = t.localParentNotSampled) !== null && a !== void 0 ? a : new nt();
    }
    return e.prototype.shouldSample = function(t, r, n, i, a, o) {
      var s = N.getSpanContext(t);
      return !s || !Se(s) ? this._root.shouldSample(t, r, n, i, a, o) : s.isRemote ? s.traceFlags & w.SAMPLED ? this._remoteParentSampled.shouldSample(t, r, n, i, a, o) : this._remoteParentNotSampled.shouldSample(t, r, n, i, a, o) : s.traceFlags & w.SAMPLED ? this._localParentSampled.shouldSample(t, r, n, i, a, o) : this._localParentNotSampled.shouldSample(t, r, n, i, a, o);
    }, e.prototype.toString = function() {
      return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
    }, e;
  }()
), br = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = 0), this._ratio = t, this._ratio = this._normalize(t), this._upperBound = Math.floor(this._ratio * 4294967295);
    }
    return e.prototype.shouldSample = function(t, r) {
      return {
        decision: _t(r) && this._accumulate(r) < this._upperBound ? Te.RECORD_AND_SAMPLED : Te.NOT_RECORD
      };
    }, e.prototype.toString = function() {
      return "TraceIdRatioBased{" + this._ratio + "}";
    }, e.prototype._normalize = function(t) {
      return typeof t != "number" || isNaN(t) ? 0 : t >= 1 ? 1 : t <= 0 ? 0 : t;
    }, e.prototype._accumulate = function(t) {
      for (var r = 0, n = 0; n < t.length / 8; n++) {
        var i = n * 8, a = parseInt(t.slice(i, i + 8), 16);
        r = (r ^ a) >>> 0;
      }
      return r;
    }, e;
  }()
), Sd = y(), Ad = U.AlwaysOn, se = 1;
function wn() {
  return {
    sampler: xn(Sd),
    forceFlushTimeoutMillis: 3e4,
    generalLimits: {
      attributeValueLengthLimit: y().OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
      attributeCountLimit: y().OTEL_ATTRIBUTE_COUNT_LIMIT
    },
    spanLimits: {
      attributeValueLengthLimit: y().OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
      attributeCountLimit: y().OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
      linkCountLimit: y().OTEL_SPAN_LINK_COUNT_LIMIT,
      eventCountLimit: y().OTEL_SPAN_EVENT_COUNT_LIMIT,
      attributePerEventCountLimit: y().OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
      attributePerLinkCountLimit: y().OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT
    }
  };
}
function xn(e) {
  switch (e === void 0 && (e = y()), e.OTEL_TRACES_SAMPLER) {
    case U.AlwaysOn:
      return new fe();
    case U.AlwaysOff:
      return new nt();
    case U.ParentBasedAlwaysOn:
      return new Lt({
        root: new fe()
      });
    case U.ParentBasedAlwaysOff:
      return new Lt({
        root: new nt()
      });
    case U.TraceIdRatio:
      return new br(wr(e));
    case U.ParentBasedTraceIdRatio:
      return new Lt({
        root: new br(wr(e))
      });
    default:
      return v.error('OTEL_TRACES_SAMPLER value "' + e.OTEL_TRACES_SAMPLER + " invalid, defaulting to " + Ad + '".'), new fe();
  }
}
function wr(e) {
  if (e.OTEL_TRACES_SAMPLER_ARG === void 0 || e.OTEL_TRACES_SAMPLER_ARG === "")
    return v.error("OTEL_TRACES_SAMPLER_ARG is blank, defaulting to " + se + "."), se;
  var t = Number(e.OTEL_TRACES_SAMPLER_ARG);
  return isNaN(t) ? (v.error("OTEL_TRACES_SAMPLER_ARG=" + e.OTEL_TRACES_SAMPLER_ARG + " was given, but it is invalid, defaulting to " + se + "."), se) : t < 0 || t > 1 ? (v.error("OTEL_TRACES_SAMPLER_ARG=" + e.OTEL_TRACES_SAMPLER_ARG + " was given, but it is out of range ([0..1]), defaulting to " + se + "."), se) : t;
}
function Od(e) {
  var t = {
    sampler: xn()
  }, r = wn(), n = Object.assign({}, r, t, e);
  return n.generalLimits = Object.assign({}, r.generalLimits, e.generalLimits || {}), n.spanLimits = Object.assign({}, r.spanLimits, e.spanLimits || {}), n;
}
function md(e) {
  var t, r, n, i, a, o, s, u, _, c, l, p, E = Object.assign({}, e.spanLimits), f = vn();
  return E.attributeCountLimit = (o = (a = (i = (r = (t = e.spanLimits) === null || t === void 0 ? void 0 : t.attributeCountLimit) !== null && r !== void 0 ? r : (n = e.generalLimits) === null || n === void 0 ? void 0 : n.attributeCountLimit) !== null && i !== void 0 ? i : f.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && a !== void 0 ? a : f.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && o !== void 0 ? o : Le, E.attributeValueLengthLimit = (p = (l = (c = (u = (s = e.spanLimits) === null || s === void 0 ? void 0 : s.attributeValueLengthLimit) !== null && u !== void 0 ? u : (_ = e.generalLimits) === null || _ === void 0 ? void 0 : _.attributeValueLengthLimit) !== null && c !== void 0 ? c : f.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && l !== void 0 ? l : f.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && p !== void 0 ? p : Ce, Object.assign({}, e, { spanLimits: E });
}
var Nd = (
  /** @class */
  function() {
    function e(t, r) {
      this._exporter = t, this._isExporting = !1, this._finishedSpans = [], this._droppedSpansCount = 0;
      var n = y();
      this._maxExportBatchSize = typeof (r == null ? void 0 : r.maxExportBatchSize) == "number" ? r.maxExportBatchSize : n.OTEL_BSP_MAX_EXPORT_BATCH_SIZE, this._maxQueueSize = typeof (r == null ? void 0 : r.maxQueueSize) == "number" ? r.maxQueueSize : n.OTEL_BSP_MAX_QUEUE_SIZE, this._scheduledDelayMillis = typeof (r == null ? void 0 : r.scheduledDelayMillis) == "number" ? r.scheduledDelayMillis : n.OTEL_BSP_SCHEDULE_DELAY, this._exportTimeoutMillis = typeof (r == null ? void 0 : r.exportTimeoutMillis) == "number" ? r.exportTimeoutMillis : n.OTEL_BSP_EXPORT_TIMEOUT, this._shutdownOnce = new ft(this._shutdown, this), this._maxExportBatchSize > this._maxQueueSize && (v.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize"), this._maxExportBatchSize = this._maxQueueSize);
    }
    return e.prototype.forceFlush = function() {
      return this._shutdownOnce.isCalled ? this._shutdownOnce.promise : this._flushAll();
    }, e.prototype.onStart = function(t, r) {
    }, e.prototype.onEnd = function(t) {
      this._shutdownOnce.isCalled || t.spanContext().traceFlags & w.SAMPLED && this._addToBuffer(t);
    }, e.prototype.shutdown = function() {
      return this._shutdownOnce.call();
    }, e.prototype._shutdown = function() {
      var t = this;
      return Promise.resolve().then(function() {
        return t.onShutdown();
      }).then(function() {
        return t._flushAll();
      }).then(function() {
        return t._exporter.shutdown();
      });
    }, e.prototype._addToBuffer = function(t) {
      if (this._finishedSpans.length >= this._maxQueueSize) {
        this._droppedSpansCount === 0 && v.debug("maxQueueSize reached, dropping spans"), this._droppedSpansCount++;
        return;
      }
      this._droppedSpansCount > 0 && (v.warn("Dropped " + this._droppedSpansCount + " spans because maxQueueSize reached"), this._droppedSpansCount = 0), this._finishedSpans.push(t), this._maybeStartTimer();
    }, e.prototype._flushAll = function() {
      var t = this;
      return new Promise(function(r, n) {
        for (var i = [], a = Math.ceil(t._finishedSpans.length / t._maxExportBatchSize), o = 0, s = a; o < s; o++)
          i.push(t._flushOneBatch());
        Promise.all(i).then(function() {
          r();
        }).catch(n);
      });
    }, e.prototype._flushOneBatch = function() {
      var t = this;
      return this._clearTimer(), this._finishedSpans.length === 0 ? Promise.resolve() : new Promise(function(r, n) {
        var i = setTimeout(function() {
          n(new Error("Timeout"));
        }, t._exportTimeoutMillis);
        O.with(sr(O.active()), function() {
          var a;
          t._finishedSpans.length <= t._maxExportBatchSize ? (a = t._finishedSpans, t._finishedSpans = []) : a = t._finishedSpans.splice(0, t._maxExportBatchSize);
          for (var o = function() {
            return t._exporter.export(a, function(l) {
              var p;
              clearTimeout(i), l.code === F.SUCCESS ? r() : n((p = l.error) !== null && p !== void 0 ? p : new Error("BatchSpanProcessor: span export failed"));
            });
          }, s = null, u = 0, _ = a.length; u < _; u++) {
            var c = a[u];
            c.resource.asyncAttributesPending && c.resource.waitForAsyncAttributes && (s != null || (s = []), s.push(c.resource.waitForAsyncAttributes()));
          }
          s === null ? o() : Promise.all(s).then(o, function(l) {
            W(l), n(l);
          });
        });
      });
    }, e.prototype._maybeStartTimer = function() {
      var t = this;
      if (!this._isExporting) {
        var r = function() {
          t._isExporting = !0, t._flushOneBatch().finally(function() {
            t._isExporting = !1, t._finishedSpans.length > 0 && (t._clearTimer(), t._maybeStartTimer());
          }).catch(function(n) {
            t._isExporting = !1, W(n);
          });
        };
        if (this._finishedSpans.length >= this._maxExportBatchSize)
          return r();
        this._timer === void 0 && (this._timer = setTimeout(function() {
          return r();
        }, this._scheduledDelayMillis));
      }
    }, e.prototype._clearTimer = function() {
      this._timer !== void 0 && (clearTimeout(this._timer), this._timer = void 0);
    }, e;
  }()
), Pd = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Bn = (
  /** @class */
  function(e) {
    Pd(t, e);
    function t(r, n) {
      var i = e.call(this, r, n) || this;
      return i.onInit(n), i;
    }
    return t.prototype.onInit = function(r) {
      var n = this;
      (r == null ? void 0 : r.disableAutoFlushOnDocumentHide) !== !0 && typeof document != "undefined" && (this._visibilityChangeListener = function() {
        document.visibilityState === "hidden" && n.forceFlush();
      }, this._pageHideListener = function() {
        n.forceFlush();
      }, document.addEventListener("visibilitychange", this._visibilityChangeListener), document.addEventListener("pagehide", this._pageHideListener));
    }, t.prototype.onShutdown = function() {
      typeof document != "undefined" && (this._visibilityChangeListener && document.removeEventListener("visibilitychange", this._visibilityChangeListener), this._pageHideListener && document.removeEventListener("pagehide", this._pageHideListener));
    }, t;
  }(Nd)
), yd = 8, gd = 16, Rd = (
  /** @class */
  /* @__PURE__ */ function() {
    function e() {
      this.generateTraceId = xr(gd), this.generateSpanId = xr(yd);
    }
    return e;
  }()
), He = Array(32);
function xr(e) {
  return function() {
    for (var r = 0; r < e * 2; r++)
      He[r] = Math.floor(Math.random() * 16) + 48, He[r] >= 58 && (He[r] += 39);
    return String.fromCharCode.apply(null, He.slice(0, e * 2));
  };
}
var Md = (
  /** @class */
  function() {
    function e(t, r, n) {
      this._tracerProvider = n;
      var i = Od(r);
      this._sampler = i.sampler, this._generalLimits = i.generalLimits, this._spanLimits = i.spanLimits, this._idGenerator = r.idGenerator || new Rd(), this.resource = n.resource, this.instrumentationLibrary = t;
    }
    return e.prototype.startSpan = function(t, r, n) {
      var i, a, o;
      r === void 0 && (r = {}), n === void 0 && (n = O.active()), r.root && (n = N.deleteSpan(n));
      var s = N.getSpan(n);
      if (dt(n)) {
        v.debug("Instrumentation suppressed, returning Noop Span");
        var u = N.wrapSpanContext(tr);
        return u;
      }
      var _ = s == null ? void 0 : s.spanContext(), c = this._idGenerator.generateSpanId(), l, p, E;
      !_ || !N.isSpanContextValid(_) ? l = this._idGenerator.generateTraceId() : (l = _.traceId, p = _.traceState, E = _.spanId);
      var f = (i = r.kind) !== null && i !== void 0 ? i : Ee.INTERNAL, S = ((a = r.links) !== null && a !== void 0 ? a : []).map(function(Oe) {
        return {
          context: Oe.context,
          attributes: Ie(Oe.attributes)
        };
      }), R = Ie(r.attributes), A = this._sampler.shouldSample(n, l, t, f, R, S);
      p = (o = A.traceState) !== null && o !== void 0 ? o : p;
      var m = A.decision === K.RECORD_AND_SAMPLED ? w.SAMPLED : w.NONE, C = { traceId: l, spanId: c, traceFlags: m, traceState: p };
      if (A.decision === K.NOT_RECORD) {
        v.debug("Recording is off, propagating context in a non-recording span");
        var u = N.wrapSpanContext(C);
        return u;
      }
      var ae = Ie(Object.assign(R, A.attributes)), St = new vd(this, n, t, C, f, E, S, r.startTime, void 0, ae);
      return St;
    }, e.prototype.startActiveSpan = function(t, r, n, i) {
      var a, o, s;
      if (!(arguments.length < 2)) {
        arguments.length === 2 ? s = r : arguments.length === 3 ? (a = r, s = n) : (a = r, o = n, s = i);
        var u = o != null ? o : O.active(), _ = this.startSpan(t, a, u), c = N.setSpan(u, _);
        return O.with(c, s, void 0, _);
      }
    }, e.prototype.getGeneralLimits = function() {
      return this._generalLimits;
    }, e.prototype.getSpanLimits = function() {
      return this._spanLimits;
    }, e.prototype.getActiveSpanProcessor = function() {
      return this._tracerProvider.getActiveSpanProcessor();
    }, e;
  }()
);
function Id() {
  return "unknown_service";
}
var z = function() {
  return z = Object.assign || function(e) {
    for (var t, r = 1, n = arguments.length; r < n; r++) {
      t = arguments[r];
      for (var i in t)
        Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
    }
    return e;
  }, z.apply(this, arguments);
}, Cd = function(e, t, r, n) {
  function i(a) {
    return a instanceof r ? a : new r(function(o) {
      o(a);
    });
  }
  return new (r || (r = Promise))(function(a, o) {
    function s(c) {
      try {
        _(n.next(c));
      } catch (l) {
        o(l);
      }
    }
    function u(c) {
      try {
        _(n.throw(c));
      } catch (l) {
        o(l);
      }
    }
    function _(c) {
      c.done ? a(c.value) : i(c.value).then(s, u);
    }
    _((n = n.apply(e, t || [])).next());
  });
}, Ld = function(e, t) {
  var r = { label: 0, sent: function() {
    if (a[0] & 1)
      throw a[1];
    return a[1];
  }, trys: [], ops: [] }, n, i, a, o;
  return o = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function s(_) {
    return function(c) {
      return u([_, c]);
    };
  }
  function u(_) {
    if (n)
      throw new TypeError("Generator is already executing.");
    for (; r; )
      try {
        if (n = 1, i && (a = _[0] & 2 ? i.return : _[0] ? i.throw || ((a = i.return) && a.call(i), 0) : i.next) && !(a = a.call(i, _[1])).done)
          return a;
        switch (i = 0, a && (_ = [_[0] & 2, a.value]), _[0]) {
          case 0:
          case 1:
            a = _;
            break;
          case 4:
            return r.label++, { value: _[1], done: !1 };
          case 5:
            r.label++, i = _[1], _ = [0];
            continue;
          case 7:
            _ = r.ops.pop(), r.trys.pop();
            continue;
          default:
            if (a = r.trys, !(a = a.length > 0 && a[a.length - 1]) && (_[0] === 6 || _[0] === 2)) {
              r = 0;
              continue;
            }
            if (_[0] === 3 && (!a || _[1] > a[0] && _[1] < a[3])) {
              r.label = _[1];
              break;
            }
            if (_[0] === 6 && r.label < a[1]) {
              r.label = a[1], a = _;
              break;
            }
            if (a && r.label < a[2]) {
              r.label = a[2], r.ops.push(_);
              break;
            }
            a[2] && r.ops.pop(), r.trys.pop();
            continue;
        }
        _ = t.call(e, r);
      } catch (c) {
        _ = [6, c], i = 0;
      } finally {
        n = a = 0;
      }
    if (_[0] & 5)
      throw _[1];
    return { value: _[0] ? _[1] : void 0, done: !0 };
  }
}, Dd = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, jt = (
  /** @class */
  function() {
    function e(t, r) {
      var n = this, i;
      this._attributes = t, this.asyncAttributesPending = r != null, this._syncAttributes = (i = this._attributes) !== null && i !== void 0 ? i : {}, this._asyncAttributesPromise = r == null ? void 0 : r.then(function(a) {
        return n._attributes = Object.assign({}, n._attributes, a), n.asyncAttributesPending = !1, a;
      }, function(a) {
        return v.debug("a resource's async attributes promise rejected: %s", a), n.asyncAttributesPending = !1, {};
      });
    }
    return e.empty = function() {
      return e.EMPTY;
    }, e.default = function() {
      var t;
      return new e((t = {}, t[x.SERVICE_NAME] = Id(), t[x.TELEMETRY_SDK_LANGUAGE] = Ke[x.TELEMETRY_SDK_LANGUAGE], t[x.TELEMETRY_SDK_NAME] = Ke[x.TELEMETRY_SDK_NAME], t[x.TELEMETRY_SDK_VERSION] = Ke[x.TELEMETRY_SDK_VERSION], t));
    }, Object.defineProperty(e.prototype, "attributes", {
      get: function() {
        var t;
        return this.asyncAttributesPending && v.error("Accessing resource attributes before async attributes settled"), (t = this._attributes) !== null && t !== void 0 ? t : {};
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype.waitForAsyncAttributes = function() {
      return Cd(this, void 0, void 0, function() {
        return Ld(this, function(t) {
          switch (t.label) {
            case 0:
              return this.asyncAttributesPending ? [4, this._asyncAttributesPromise] : [3, 2];
            case 1:
              t.sent(), t.label = 2;
            case 2:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.merge = function(t) {
      var r = this, n;
      if (!t)
        return this;
      var i = z(z({}, this._syncAttributes), (n = t._syncAttributes) !== null && n !== void 0 ? n : t.attributes);
      if (!this._asyncAttributesPromise && !t._asyncAttributesPromise)
        return new e(i);
      var a = Promise.all([
        this._asyncAttributesPromise,
        t._asyncAttributesPromise
      ]).then(function(o) {
        var s, u = Dd(o, 2), _ = u[0], c = u[1];
        return z(z(z(z({}, r._syncAttributes), _), (s = t._syncAttributes) !== null && s !== void 0 ? s : t.attributes), c);
      });
      return new e(i, a);
    }, e.EMPTY = new e({}), e;
  }()
), Ye = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, bd = (
  /** @class */
  function() {
    function e(t) {
      this._spanProcessors = t;
    }
    return e.prototype.forceFlush = function() {
      var t, r, n = [];
      try {
        for (var i = Ye(this._spanProcessors), a = i.next(); !a.done; a = i.next()) {
          var o = a.value;
          n.push(o.forceFlush());
        }
      } catch (s) {
        t = { error: s };
      } finally {
        try {
          a && !a.done && (r = i.return) && r.call(i);
        } finally {
          if (t)
            throw t.error;
        }
      }
      return new Promise(function(s) {
        Promise.all(n).then(function() {
          s();
        }).catch(function(u) {
          W(u || new Error("MultiSpanProcessor: forceFlush failed")), s();
        });
      });
    }, e.prototype.onStart = function(t, r) {
      var n, i;
      try {
        for (var a = Ye(this._spanProcessors), o = a.next(); !o.done; o = a.next()) {
          var s = o.value;
          s.onStart(t, r);
        }
      } catch (u) {
        n = { error: u };
      } finally {
        try {
          o && !o.done && (i = a.return) && i.call(a);
        } finally {
          if (n)
            throw n.error;
        }
      }
    }, e.prototype.onEnd = function(t) {
      var r, n;
      try {
        for (var i = Ye(this._spanProcessors), a = i.next(); !a.done; a = i.next()) {
          var o = a.value;
          o.onEnd(t);
        }
      } catch (s) {
        r = { error: s };
      } finally {
        try {
          a && !a.done && (n = i.return) && n.call(i);
        } finally {
          if (r)
            throw r.error;
        }
      }
    }, e.prototype.shutdown = function() {
      var t, r, n = [];
      try {
        for (var i = Ye(this._spanProcessors), a = i.next(); !a.done; a = i.next()) {
          var o = a.value;
          n.push(o.shutdown());
        }
      } catch (s) {
        t = { error: s };
      } finally {
        try {
          a && !a.done && (r = i.return) && r.call(i);
        } finally {
          if (t)
            throw t.error;
        }
      }
      return new Promise(function(s, u) {
        Promise.all(n).then(function() {
          s();
        }, u);
      });
    }, e;
  }()
), wd = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.onStart = function(t, r) {
    }, e.prototype.onEnd = function(t) {
    }, e.prototype.shutdown = function() {
      return Promise.resolve();
    }, e.prototype.forceFlush = function() {
      return Promise.resolve();
    }, e;
  }()
), Z;
(function(e) {
  e[e.resolved = 0] = "resolved", e[e.timeout = 1] = "timeout", e[e.error = 2] = "error", e[e.unresolved = 3] = "unresolved";
})(Z || (Z = {}));
var xd = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = {});
      var r;
      this._registeredSpanProcessors = [], this._tracers = /* @__PURE__ */ new Map();
      var n = In({}, wn(), md(t));
      this.resource = (r = n.resource) !== null && r !== void 0 ? r : jt.empty(), this.resource = jt.default().merge(this.resource), this._config = Object.assign({}, n, {
        resource: this.resource
      });
      var i = this._buildExporterFromEnv();
      if (i !== void 0) {
        var a = new Bn(i);
        this.activeSpanProcessor = a;
      } else
        this.activeSpanProcessor = new wd();
    }
    return e.prototype.getTracer = function(t, r, n) {
      var i = t + "@" + (r || "") + ":" + ((n == null ? void 0 : n.schemaUrl) || "");
      return this._tracers.has(i) || this._tracers.set(i, new Md({ name: t, version: r, schemaUrl: n == null ? void 0 : n.schemaUrl }, this._config, this)), this._tracers.get(i);
    }, e.prototype.addSpanProcessor = function(t) {
      this._registeredSpanProcessors.length === 0 && this.activeSpanProcessor.shutdown().catch(function(r) {
        return v.error("Error while trying to shutdown current span processor", r);
      }), this._registeredSpanProcessors.push(t), this.activeSpanProcessor = new bd(this._registeredSpanProcessors);
    }, e.prototype.getActiveSpanProcessor = function() {
      return this.activeSpanProcessor;
    }, e.prototype.register = function(t) {
      t === void 0 && (t = {}), N.setGlobalTracerProvider(this), t.propagator === void 0 && (t.propagator = this._buildPropagatorFromEnv()), t.contextManager && O.setGlobalContextManager(t.contextManager), t.propagator && D.setGlobalPropagator(t.propagator);
    }, e.prototype.forceFlush = function() {
      var t = this._config.forceFlushTimeoutMillis, r = this._registeredSpanProcessors.map(function(n) {
        return new Promise(function(i) {
          var a, o = setTimeout(function() {
            i(new Error("Span processor did not completed within timeout period of " + t + " ms")), a = Z.timeout;
          }, t);
          n.forceFlush().then(function() {
            clearTimeout(o), a !== Z.timeout && (a = Z.resolved, i(a));
          }).catch(function(s) {
            clearTimeout(o), a = Z.error, i(s);
          });
        });
      });
      return new Promise(function(n, i) {
        Promise.all(r).then(function(a) {
          var o = a.filter(function(s) {
            return s !== Z.resolved;
          });
          o.length > 0 ? i(o) : n();
        }).catch(function(a) {
          return i([a]);
        });
      });
    }, e.prototype.shutdown = function() {
      return this.activeSpanProcessor.shutdown();
    }, e.prototype._getPropagator = function(t) {
      var r;
      return (r = this.constructor._registeredPropagators.get(t)) === null || r === void 0 ? void 0 : r();
    }, e.prototype._getSpanExporter = function(t) {
      var r;
      return (r = this.constructor._registeredExporters.get(t)) === null || r === void 0 ? void 0 : r();
    }, e.prototype._buildPropagatorFromEnv = function() {
      var t = this, r = Array.from(new Set(y().OTEL_PROPAGATORS)), n = r.map(function(a) {
        var o = t._getPropagator(a);
        return o || v.warn('Propagator "' + a + '" requested through environment variable is unavailable.'), o;
      }), i = n.reduce(function(a, o) {
        return o && a.push(o), a;
      }, []);
      if (i.length !== 0)
        return r.length === 1 ? i[0] : new fr({
          propagators: i
        });
    }, e.prototype._buildExporterFromEnv = function() {
      var t = y().OTEL_TRACES_EXPORTER;
      if (!(t === "none" || t === "")) {
        var r = this._getSpanExporter(t);
        return r || v.error('Exporter "' + t + '" requested through environment variable is unavailable.'), r;
      }
    }, e._registeredPropagators = /* @__PURE__ */ new Map([
      ["tracecontext", function() {
        return new Er();
      }],
      ["baggage", function() {
        return new cr();
      }]
    ]), e._registeredExporters = /* @__PURE__ */ new Map(), e;
  }()
), Bd = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, Ud = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.export = function(t, r) {
      return this._sendSpans(t, r);
    }, e.prototype.shutdown = function() {
      return this._sendSpans([]), this.forceFlush();
    }, e.prototype.forceFlush = function() {
      return Promise.resolve();
    }, e.prototype._exportInfo = function(t) {
      var r;
      return {
        resource: {
          attributes: t.resource.attributes
        },
        traceId: t.spanContext().traceId,
        parentId: t.parentSpanId,
        traceState: (r = t.spanContext().traceState) === null || r === void 0 ? void 0 : r.serialize(),
        name: t.name,
        id: t.spanContext().spanId,
        kind: t.kind,
        timestamp: kt(t.startTime),
        duration: kt(t.duration),
        attributes: t.attributes,
        status: t.status,
        events: t.events,
        links: t.links
      };
    }, e.prototype._sendSpans = function(t, r) {
      var n, i;
      try {
        for (var a = Bd(t), o = a.next(); !o.done; o = a.next()) {
          var s = o.value;
          console.dir(this._exportInfo(s), { depth: 3 });
        }
      } catch (u) {
        n = { error: u };
      } finally {
        try {
          o && !o.done && (i = a.return) && i.call(a);
        } finally {
          if (n)
            throw n.error;
        }
      }
      if (r)
        return r({ code: F.SUCCESS });
    }, e;
  }()
), Gd = function(e, t, r, n) {
  function i(a) {
    return a instanceof r ? a : new r(function(o) {
      o(a);
    });
  }
  return new (r || (r = Promise))(function(a, o) {
    function s(c) {
      try {
        _(n.next(c));
      } catch (l) {
        o(l);
      }
    }
    function u(c) {
      try {
        _(n.throw(c));
      } catch (l) {
        o(l);
      }
    }
    function _(c) {
      c.done ? a(c.value) : i(c.value).then(s, u);
    }
    _((n = n.apply(e, t || [])).next());
  });
}, $d = function(e, t) {
  var r = { label: 0, sent: function() {
    if (a[0] & 1)
      throw a[1];
    return a[1];
  }, trys: [], ops: [] }, n, i, a, o;
  return o = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function s(_) {
    return function(c) {
      return u([_, c]);
    };
  }
  function u(_) {
    if (n)
      throw new TypeError("Generator is already executing.");
    for (; r; )
      try {
        if (n = 1, i && (a = _[0] & 2 ? i.return : _[0] ? i.throw || ((a = i.return) && a.call(i), 0) : i.next) && !(a = a.call(i, _[1])).done)
          return a;
        switch (i = 0, a && (_ = [_[0] & 2, a.value]), _[0]) {
          case 0:
          case 1:
            a = _;
            break;
          case 4:
            return r.label++, { value: _[1], done: !1 };
          case 5:
            r.label++, i = _[1], _ = [0];
            continue;
          case 7:
            _ = r.ops.pop(), r.trys.pop();
            continue;
          default:
            if (a = r.trys, !(a = a.length > 0 && a[a.length - 1]) && (_[0] === 6 || _[0] === 2)) {
              r = 0;
              continue;
            }
            if (_[0] === 3 && (!a || _[1] > a[0] && _[1] < a[3])) {
              r.label = _[1];
              break;
            }
            if (_[0] === 6 && r.label < a[1]) {
              r.label = a[1], a = _;
              break;
            }
            if (a && r.label < a[2]) {
              r.label = a[2], r.ops.push(_);
              break;
            }
            a[2] && r.ops.pop(), r.trys.pop();
            continue;
        }
        _ = t.call(e, r);
      } catch (c) {
        _ = [6, c], i = 0;
      } finally {
        n = a = 0;
      }
    if (_[0] & 5)
      throw _[1];
    return { value: _[0] ? _[1] : void 0, done: !0 };
  }
}, kd = (
  /** @class */
  function() {
    function e(t) {
      this._exporter = t, this._shutdownOnce = new ft(this._shutdown, this), this._unresolvedExports = /* @__PURE__ */ new Set();
    }
    return e.prototype.forceFlush = function() {
      return Gd(this, void 0, void 0, function() {
        return $d(this, function(t) {
          switch (t.label) {
            case 0:
              return [4, Promise.all(Array.from(this._unresolvedExports))];
            case 1:
              return t.sent(), this._exporter.forceFlush ? [4, this._exporter.forceFlush()] : [3, 3];
            case 2:
              t.sent(), t.label = 3;
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.onStart = function(t, r) {
    }, e.prototype.onEnd = function(t) {
      var r = this, n, i;
      if (!this._shutdownOnce.isCalled && t.spanContext().traceFlags & w.SAMPLED) {
        var a = function() {
          return bn._export(r._exporter, [t]).then(function(s) {
            var u;
            s.code !== F.SUCCESS && W((u = s.error) !== null && u !== void 0 ? u : new Error("SimpleSpanProcessor: span export failed (status " + s + ")"));
          }).catch(function(s) {
            W(s);
          });
        };
        if (t.resource.asyncAttributesPending) {
          var o = (i = (n = t.resource).waitForAsyncAttributes) === null || i === void 0 ? void 0 : i.call(n).then(function() {
            return o != null && r._unresolvedExports.delete(o), a();
          }, function(s) {
            return W(s);
          });
          o != null && this._unresolvedExports.add(o);
        } else
          a();
      }
    }, e.prototype.shutdown = function() {
      return this._shutdownOnce.call();
    }, e.prototype._shutdown = function() {
      return this._exporter.shutdown();
    }, e;
  }()
), Fd = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, Vd = function(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, a; n < i; n++)
      (a || !(n in t)) && (a || (a = Array.prototype.slice.call(t, 0, n)), a[n] = t[n]);
  return e.concat(a || Array.prototype.slice.call(t));
}, Hd = (
  /** @class */
  function() {
    function e() {
      this._enabled = !1, this._currentContext = G;
    }
    return e.prototype._bindFunction = function(t, r) {
      t === void 0 && (t = G);
      var n = this, i = function() {
        for (var a = this, o = [], s = 0; s < arguments.length; s++)
          o[s] = arguments[s];
        return n.with(t, function() {
          return r.apply(a, o);
        });
      };
      return Object.defineProperty(i, "length", {
        enumerable: !1,
        configurable: !0,
        writable: !1,
        value: r.length
      }), i;
    }, e.prototype.active = function() {
      return this._currentContext;
    }, e.prototype.bind = function(t, r) {
      return t === void 0 && (t = this.active()), typeof r == "function" ? this._bindFunction(t, r) : r;
    }, e.prototype.disable = function() {
      return this._currentContext = G, this._enabled = !1, this;
    }, e.prototype.enable = function() {
      return this._enabled ? this : (this._enabled = !0, this._currentContext = G, this);
    }, e.prototype.with = function(t, r, n) {
      for (var i = [], a = 3; a < arguments.length; a++)
        i[a - 3] = arguments[a];
      var o = this._currentContext;
      this._currentContext = t || G;
      try {
        return r.call.apply(r, Vd([n], Fd(i), !1));
      } finally {
        this._currentContext = o;
      }
    }, e;
  }()
), Yd = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), jd = (
  /** @class */
  function(e) {
    Yd(t, e);
    function t(r) {
      r === void 0 && (r = {});
      var n = e.call(this, r) || this;
      if (r.contextManager)
        throw "contextManager should be defined in register method not in constructor";
      if (r.propagator)
        throw "propagator should be defined in register method not in constructor";
      return n;
    }
    return t.prototype.register = function(r) {
      r === void 0 && (r = {}), r.contextManager === void 0 && (r.contextManager = new Hd()), r.contextManager && r.contextManager.enable(), e.prototype.register.call(this, r);
    }, t;
  }(xd)
), h;
(function(e) {
  e.CONNECT_END = "connectEnd", e.CONNECT_START = "connectStart", e.DECODED_BODY_SIZE = "decodedBodySize", e.DOM_COMPLETE = "domComplete", e.DOM_CONTENT_LOADED_EVENT_END = "domContentLoadedEventEnd", e.DOM_CONTENT_LOADED_EVENT_START = "domContentLoadedEventStart", e.DOM_INTERACTIVE = "domInteractive", e.DOMAIN_LOOKUP_END = "domainLookupEnd", e.DOMAIN_LOOKUP_START = "domainLookupStart", e.ENCODED_BODY_SIZE = "encodedBodySize", e.FETCH_START = "fetchStart", e.LOAD_EVENT_END = "loadEventEnd", e.LOAD_EVENT_START = "loadEventStart", e.NAVIGATION_START = "navigationStart", e.REDIRECT_END = "redirectEnd", e.REDIRECT_START = "redirectStart", e.REQUEST_START = "requestStart", e.RESPONSE_END = "responseEnd", e.RESPONSE_START = "responseStart", e.SECURE_CONNECTION_START = "secureConnectionStart", e.UNLOAD_EVENT_END = "unloadEventEnd", e.UNLOAD_EVENT_START = "unloadEventStart";
})(h || (h = {}));
var Dt;
function Xd() {
  return Dt || (Dt = document.createElement("a")), Dt;
}
function q(e, t) {
  return t in e;
}
function M(e, t, r, n) {
  var i = void 0, a = void 0;
  q(r, t) && typeof r[t] == "number" && (i = r[t]);
  var o = n || h.FETCH_START;
  if (q(r, o) && typeof r[o] == "number" && (a = r[o]), i !== void 0 && a !== void 0 && i >= a)
    return e.addEvent(t, i), e;
}
function he(e, t) {
  M(e, h.FETCH_START, t), M(e, h.DOMAIN_LOOKUP_START, t), M(e, h.DOMAIN_LOOKUP_END, t), M(e, h.CONNECT_START, t), q(t, "name") && t.name.startsWith("https:") && M(e, h.SECURE_CONNECTION_START, t), M(e, h.CONNECT_END, t), M(e, h.REQUEST_START, t), M(e, h.RESPONSE_START, t), M(e, h.RESPONSE_END, t);
  var r = t[h.ENCODED_BODY_SIZE];
  r !== void 0 && e.setAttribute(Y.HTTP_RESPONSE_CONTENT_LENGTH, r);
  var n = t[h.DECODED_BODY_SIZE];
  n !== void 0 && r !== n && e.setAttribute(Y.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, n);
}
function Wd(e) {
  return e.slice().sort(function(t, r) {
    var n = t[h.FETCH_START], i = r[h.FETCH_START];
    return n > i ? 1 : n < i ? -1 : 0;
  });
}
function Un() {
  return typeof location != "undefined" ? location.origin : void 0;
}
function Gn(e, t, r, n, i, a) {
  i === void 0 && (i = /* @__PURE__ */ new WeakSet());
  var o = X(e);
  e = o.toString();
  var s = zd(e, t, r, n, i, a);
  if (s.length === 0)
    return {
      mainRequest: void 0
    };
  if (s.length === 1)
    return {
      mainRequest: s[0]
    };
  var u = Wd(s);
  if (o.origin !== Un() && u.length > 1) {
    var _ = u[0], c = Kd(u, _[h.RESPONSE_END], r), l = _[h.RESPONSE_END], p = c[h.FETCH_START];
    return p < l && (c = _, _ = void 0), {
      corsPreFlightRequest: _,
      mainRequest: c
    };
  } else
    return {
      mainRequest: s[0]
    };
}
function Kd(e, t, r) {
  for (var n = k(r), i = k(pe(t)), a = e[1], o, s = e.length, u = 1; u < s; u++) {
    var _ = e[u], c = k(pe(_[h.FETCH_START])), l = k(pe(_[h.RESPONSE_END])), p = n - l;
    c >= i && (!o || p < o) && (o = p, a = _);
  }
  return a;
}
function zd(e, t, r, n, i, a) {
  var o = k(t), s = k(r), u = n.filter(function(_) {
    var c = k(pe(_[h.FETCH_START])), l = k(pe(_[h.RESPONSE_END]));
    return _.initiatorType.toLowerCase() === (a || "xmlhttprequest") && _.name === e && c >= o && l <= s;
  });
  return u.length > 0 && (u = u.filter(function(_) {
    return !i.has(_);
  })), u;
}
function X(e) {
  if (typeof URL == "function")
    return new URL(e, typeof document != "undefined" ? document.baseURI : typeof location != "undefined" ? location.href : void 0);
  var t = Xd();
  return t.href = e, t;
}
function $n(e, t) {
  if (e.nodeType === Node.DOCUMENT_NODE)
    return "/";
  var r = Qd(e, t);
  if (t && r.indexOf("@id") > 0)
    return r;
  var n = "";
  return e.parentNode && (n += $n(e.parentNode, !1)), n += r, n;
}
function qd(e) {
  if (!e.parentNode)
    return 0;
  var t = [e.nodeType];
  e.nodeType === Node.CDATA_SECTION_NODE && t.push(Node.TEXT_NODE);
  var r = Array.from(e.parentNode.childNodes);
  return r = r.filter(function(n) {
    var i = n.localName;
    return t.indexOf(n.nodeType) >= 0 && i === e.localName;
  }), r.length >= 1 ? r.indexOf(e) + 1 : 0;
}
function Qd(e, t) {
  var r = e.nodeType, n = qd(e), i = "";
  if (r === Node.ELEMENT_NODE) {
    var a = e.getAttribute("id");
    if (t && a)
      return '//*[@id="' + a + '"]';
    i = e.localName;
  } else if (r === Node.TEXT_NODE || r === Node.CDATA_SECTION_NODE)
    i = "text()";
  else if (r === Node.COMMENT_NODE)
    i = "comment()";
  else
    return "";
  return i && n > 1 ? "/" + i + "[" + n + "]" : "/" + i;
}
function kn(e, t) {
  var r = t || [];
  (typeof r == "string" || r instanceof RegExp) && (r = [r]);
  var n = X(e);
  return n.origin === Un() ? !0 : r.some(function(i) {
    return hr(e, i);
  });
}
var Jd = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.emit = function(t) {
    }, e;
  }()
), Zd = (
  /** @class */
  function() {
    function e() {
    }
    return e.prototype.getLogger = function(t, r, n) {
      return new Jd();
    }, e;
  }()
), Br = new Zd(), el = typeof globalThis == "object" ? globalThis : typeof self == "object" ? self : typeof window == "object" ? window : typeof global == "object" ? global : {}, je = Symbol.for("io.opentelemetry.js.api.logs"), Pe = el;
function tl(e, t, r) {
  return function(n) {
    return n === e ? t : r;
  };
}
var Ur = 1, rl = (
  /** @class */
  function() {
    function e() {
    }
    return e.getInstance = function() {
      return this._instance || (this._instance = new e()), this._instance;
    }, e.prototype.setGlobalLoggerProvider = function(t) {
      return Pe[je] ? this.getLoggerProvider() : (Pe[je] = tl(Ur, t, Br), t);
    }, e.prototype.getLoggerProvider = function() {
      var t, r;
      return (r = (t = Pe[je]) === null || t === void 0 ? void 0 : t.call(Pe, Ur)) !== null && r !== void 0 ? r : Br;
    }, e.prototype.getLogger = function(t, r, n) {
      return this.getLoggerProvider().getLogger(t, r, n);
    }, e.prototype.disable = function() {
      delete Pe[je];
    }, e;
  }()
), Fn = rl.getInstance();
function Vn(e) {
  e === void 0 && (e = []);
  for (var t = [], r = 0, n = e.length; r < n; r++) {
    var i = e[r];
    if (Array.isArray(i)) {
      var a = Vn(i);
      t = t.concat(a.instrumentations);
    } else
      typeof i == "function" ? t.push(new i()) : i.instrumentationName && t.push(i);
  }
  return { instrumentations: t };
}
function nl(e, t, r, n) {
  for (var i = 0, a = e.length; i < a; i++) {
    var o = e[i];
    t && o.setTracerProvider(t), r && o.setMeterProvider(r), n && o.setLoggerProvider && o.setLoggerProvider(n), o.getConfig().enabled || o.enable();
  }
}
function il(e) {
  e.forEach(function(t) {
    return t.disable();
  });
}
function al(e) {
  var t = Vn(e.instrumentations).instrumentations, r = e.tracerProvider || N.getTracerProvider(), n = e.meterProvider || ct.getMeterProvider(), i = e.loggerProvider || Fn.getLoggerProvider();
  return nl(t, r, n, i), function() {
    il(t);
  };
}
function Xt(e) {
  return typeof e == "function";
}
var L = console.error.bind(console);
function ye(e, t, r) {
  var n = !!e[t] && e.propertyIsEnumerable(t);
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: n,
    writable: !0,
    value: r
  });
}
function Fe(e) {
  e && e.logger && (Xt(e.logger) ? L = e.logger : L("new logger isn't a function, not replacing"));
}
function Hn(e, t, r) {
  if (!e || !e[t]) {
    L("no original function " + t + " to wrap");
    return;
  }
  if (!r) {
    L("no wrapper function"), L(new Error().stack);
    return;
  }
  if (!Xt(e[t]) || !Xt(r)) {
    L("original object and wrapper must be functions");
    return;
  }
  var n = e[t], i = r(n, t);
  return ye(i, "__original", n), ye(i, "__unwrap", function() {
    e[t] === i && ye(e, t, n);
  }), ye(i, "__wrapped", !0), ye(e, t, i), i;
}
function ol(e, t, r) {
  if (e)
    Array.isArray(e) || (e = [e]);
  else {
    L("must provide one or more modules to patch"), L(new Error().stack);
    return;
  }
  if (!(t && Array.isArray(t))) {
    L("must provide one or more functions to wrap on modules");
    return;
  }
  e.forEach(function(n) {
    t.forEach(function(i) {
      Hn(n, i, r);
    });
  });
}
function Yn(e, t) {
  if (!e || !e[t]) {
    L("no function to unwrap."), L(new Error().stack);
    return;
  }
  if (!e[t].__unwrap)
    L("no original to unwrap to -- has " + t + " already been unwrapped?");
  else
    return e[t].__unwrap();
}
function sl(e, t) {
  if (e)
    Array.isArray(e) || (e = [e]);
  else {
    L("must provide one or more modules to patch"), L(new Error().stack);
    return;
  }
  if (!(t && Array.isArray(t))) {
    L("must provide one or more functions to unwrap on modules");
    return;
  }
  e.forEach(function(r) {
    t.forEach(function(n) {
      Yn(r, n);
    });
  });
}
Fe.wrap = Hn;
Fe.massWrap = ol;
Fe.unwrap = Yn;
Fe.massUnwrap = sl;
var Xe = Fe, Wt = function() {
  return Wt = Object.assign || function(e) {
    for (var t, r = 1, n = arguments.length; r < n; r++) {
      t = arguments[r];
      for (var i in t)
        Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
    }
    return e;
  }, Wt.apply(this, arguments);
}, ul = (
  /** @class */
  function() {
    function e(t, r, n) {
      n === void 0 && (n = {}), this.instrumentationName = t, this.instrumentationVersion = r, this._wrap = Xe.wrap, this._unwrap = Xe.unwrap, this._massWrap = Xe.massWrap, this._massUnwrap = Xe.massUnwrap, this._config = Wt({ enabled: !0 }, n), this._diag = v.createComponentLogger({
        namespace: t
      }), this._tracer = N.getTracer(t, r), this._meter = ct.getMeter(t, r), this._logger = Fn.getLogger(t, r), this._updateMetricInstruments();
    }
    return Object.defineProperty(e.prototype, "meter", {
      /* Returns meter */
      get: function() {
        return this._meter;
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype.setMeterProvider = function(t) {
      this._meter = t.getMeter(this.instrumentationName, this.instrumentationVersion), this._updateMetricInstruments();
    }, Object.defineProperty(e.prototype, "logger", {
      /* Returns logger */
      get: function() {
        return this._logger;
      },
      enumerable: !1,
      configurable: !0
    }), e.prototype.setLoggerProvider = function(t) {
      this._logger = t.getLogger(this.instrumentationName, this.instrumentationVersion);
    }, e.prototype.getModuleDefinitions = function() {
      var t, r = (t = this.init()) !== null && t !== void 0 ? t : [];
      return Array.isArray(r) ? r : [r];
    }, e.prototype._updateMetricInstruments = function() {
    }, e.prototype.getConfig = function() {
      return this._config;
    }, e.prototype.setConfig = function(t) {
      t === void 0 && (t = {}), this._config = Object.assign({}, t);
    }, e.prototype.setTracerProvider = function(t) {
      this._tracer = t.getTracer(this.instrumentationName, this.instrumentationVersion);
    }, Object.defineProperty(e.prototype, "tracer", {
      /* Returns tracer */
      get: function() {
        return this._tracer;
      },
      enumerable: !1,
      configurable: !0
    }), e;
  }()
), _l = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Et = (
  /** @class */
  function(e) {
    _l(t, e);
    function t(r, n, i) {
      i === void 0 && (i = {});
      var a = e.call(this, r, n, i) || this;
      return a._config.enabled && a.enable(), a;
    }
    return t;
  }(ul)
);
function it(e, t, r) {
  var n, i;
  try {
    i = e();
  } catch (a) {
    n = a;
  } finally {
    if (t(n, i), n && !r)
      throw n;
    return i;
  }
}
function te(e) {
  return typeof e == "function" && typeof e.__original == "function" && typeof e.__unwrap == "function" && e.__wrapped === !0;
}
var be;
(function(e) {
  e.DOCUMENT_LOAD = "documentLoad", e.DOCUMENT_FETCH = "documentFetch", e.RESOURCE_FETCH = "resourceFetch";
})(be || (be = {}));
var cl = "0.38.0", at;
(function(e) {
  e.FIRST_PAINT = "firstPaint", e.FIRST_CONTENTFUL_PAINT = "firstContentfulPaint";
})(at || (at = {}));
var dl = function() {
  var e, t, r = {}, n = (t = (e = b).getEntriesByType) === null || t === void 0 ? void 0 : t.call(e, "navigation")[0];
  if (n) {
    var i = Object.values(h);
    i.forEach(function(s) {
      if (q(n, s)) {
        var u = n[s];
        typeof u == "number" && (r[s] = u);
      }
    });
  } else {
    var a = b, o = a.timing;
    if (o) {
      var i = Object.values(h);
      i.forEach(function(u) {
        if (q(o, u)) {
          var _ = o[u];
          typeof _ == "number" && (r[u] = _);
        }
      });
    }
  }
  return r;
}, Gr = {
  "first-paint": at.FIRST_PAINT,
  "first-contentful-paint": at.FIRST_CONTENTFUL_PAINT
}, ll = function(e) {
  var t, r, n = (r = (t = b).getEntriesByType) === null || r === void 0 ? void 0 : r.call(t, "paint");
  n && n.forEach(function(i) {
    var a = i.name, o = i.startTime;
    q(Gr, a) && e.addEvent(Gr[a], o);
  });
}, pl = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), fl = (
  /** @class */
  function(e) {
    pl(t, e);
    function t(r) {
      r === void 0 && (r = {});
      var n = e.call(this, "@opentelemetry/instrumentation-document-load", cl, r) || this;
      return n.component = "document-load", n.version = "1", n.moduleName = n.component, n;
    }
    return t.prototype.init = function() {
    }, t.prototype._onDocumentLoaded = function() {
      var r = this;
      window.setTimeout(function() {
        r._collectPerformance();
      });
    }, t.prototype._addResourcesSpans = function(r) {
      var n = this, i, a, o = (a = (i = b).getEntriesByType) === null || a === void 0 ? void 0 : a.call(i, "resource");
      o && o.forEach(function(s) {
        n._initResourceSpan(s, r);
      });
    }, t.prototype._collectPerformance = function() {
      var r = this, n = Array.from(document.getElementsByTagName("meta")).find(function(o) {
        return o.getAttribute("name") === De;
      }), i = dl(), a = n && n.content || "";
      O.with(D.extract(G, { traceparent: a }), function() {
        var o, s = r._startSpan(be.DOCUMENT_LOAD, h.FETCH_START, i);
        s && (O.with(N.setSpan(O.active(), s), function() {
          var u = r._startSpan(be.DOCUMENT_FETCH, h.FETCH_START, i);
          u && (u.setAttribute(It, location.href), O.with(N.setSpan(O.active(), u), function() {
            var _;
            he(u, i), r._addCustomAttributesOnSpan(u, (_ = r._getConfig().applyCustomAttributesOnSpan) === null || _ === void 0 ? void 0 : _.documentFetch), r._endSpan(u, h.RESPONSE_END, i);
          }));
        }), s.setAttribute(It, location.href), s.setAttribute(To, navigator.userAgent), r._addResourcesSpans(s), M(s, h.FETCH_START, i), M(s, h.UNLOAD_EVENT_START, i), M(s, h.UNLOAD_EVENT_END, i), M(s, h.DOM_INTERACTIVE, i), M(s, h.DOM_CONTENT_LOADED_EVENT_START, i), M(s, h.DOM_CONTENT_LOADED_EVENT_END, i), M(s, h.DOM_COMPLETE, i), M(s, h.LOAD_EVENT_START, i), M(s, h.LOAD_EVENT_END, i), ll(s), r._addCustomAttributesOnSpan(s, (o = r._getConfig().applyCustomAttributesOnSpan) === null || o === void 0 ? void 0 : o.documentLoad), r._endSpan(s, h.LOAD_EVENT_END, i));
      });
    }, t.prototype._endSpan = function(r, n, i) {
      r && (q(i, n) ? r.end(i[n]) : r.end());
    }, t.prototype._initResourceSpan = function(r, n) {
      var i, a = this._startSpan(be.RESOURCE_FETCH, h.FETCH_START, r, n);
      a && (a.setAttribute(It, r.name), he(a, r), this._addCustomAttributesOnResourceSpan(a, r, (i = this._getConfig().applyCustomAttributesOnSpan) === null || i === void 0 ? void 0 : i.resourceFetch), this._endSpan(a, h.RESPONSE_END, r));
    }, t.prototype._startSpan = function(r, n, i, a) {
      if (q(i, n) && typeof i[n] == "number") {
        var o = this.tracer.startSpan(r, {
          startTime: i[n]
        }, a ? N.setSpan(O.active(), a) : void 0);
        return o;
      }
    }, t.prototype._waitForPageLoad = function() {
      window.document.readyState === "complete" ? this._onDocumentLoaded() : (this._onDocumentLoaded = this._onDocumentLoaded.bind(this), window.addEventListener("load", this._onDocumentLoaded));
    }, t.prototype._getConfig = function() {
      return this._config;
    }, t.prototype._addCustomAttributesOnSpan = function(r, n) {
      var i = this;
      n && it(function() {
        return n(r);
      }, function(a) {
        a && i._diag.error("addCustomAttributesOnSpan", a);
      }, !0);
    }, t.prototype._addCustomAttributesOnResourceSpan = function(r, n, i) {
      var a = this;
      i && it(function() {
        return i(r, n);
      }, function(o) {
        o && a._diag.error("addCustomAttributesOnResourceSpan", o);
      }, !0);
    }, t.prototype.enable = function() {
      window.removeEventListener("load", this._onDocumentLoaded), this._waitForPageLoad();
    }, t.prototype.disable = function() {
      window.removeEventListener("load", this._onDocumentLoaded);
    }, t;
  }(Et)
), ot;
(function(e) {
  e.COMPONENT = "component", e.HTTP_ERROR_NAME = "http.error_name", e.HTTP_STATUS_TEXT = "http.status_text";
})(ot || (ot = {}));
// @__NO_SIDE_EFFECTS__
function El(e) {
  for (var t = {}, r = e.length, n = 0; n < r; n++) {
    var i = e[n];
    i && (t[String(i).toUpperCase().replace(/[-.]/g, "_")] = i);
  }
  return t;
}
var Tl = "aws.lambda.invoked_arn", hl = "db.system", vl = "db.connection_string", Sl = "db.user", Al = "db.jdbc.driver_classname", Ol = "db.name", ml = "db.statement", Nl = "db.operation", Pl = "db.mssql.instance_name", yl = "db.cassandra.keyspace", gl = "db.cassandra.page_size", Rl = "db.cassandra.consistency_level", Ml = "db.cassandra.table", Il = "db.cassandra.idempotence", Cl = "db.cassandra.speculative_execution_count", Ll = "db.cassandra.coordinator.id", Dl = "db.cassandra.coordinator.dc", bl = "db.hbase.namespace", wl = "db.redis.database_index", xl = "db.mongodb.collection", Bl = "db.sql.table", Ul = "exception.type", Gl = "exception.message", $l = "exception.stacktrace", kl = "exception.escaped", Fl = "faas.trigger", Vl = "faas.execution", Hl = "faas.document.collection", Yl = "faas.document.operation", jl = "faas.document.time", Xl = "faas.document.name", Wl = "faas.time", Kl = "faas.cron", zl = "faas.coldstart", ql = "faas.invoked_name", Ql = "faas.invoked_provider", Jl = "faas.invoked_region", Zl = "net.transport", ep = "net.peer.ip", tp = "net.peer.port", rp = "net.peer.name", np = "net.host.ip", ip = "net.host.port", ap = "net.host.name", op = "net.host.connection.type", sp = "net.host.connection.subtype", up = "net.host.carrier.name", _p = "net.host.carrier.mcc", cp = "net.host.carrier.mnc", dp = "net.host.carrier.icc", lp = "peer.service", pp = "enduser.id", fp = "enduser.role", Ep = "enduser.scope", Tp = "thread.id", hp = "thread.name", vp = "code.function", Sp = "code.namespace", Ap = "code.filepath", Op = "code.lineno", mp = "http.method", Np = "http.url", Pp = "http.target", yp = "http.host", gp = "http.scheme", Rp = "http.status_code", Mp = "http.flavor", Ip = "http.user_agent", Cp = "http.request_content_length", Lp = "http.request_content_length_uncompressed", Dp = "http.response_content_length", bp = "http.response_content_length_uncompressed", wp = "http.server_name", xp = "http.route", Bp = "http.client_ip", Up = "aws.dynamodb.table_names", Gp = "aws.dynamodb.consumed_capacity", $p = "aws.dynamodb.item_collection_metrics", kp = "aws.dynamodb.provisioned_read_capacity", Fp = "aws.dynamodb.provisioned_write_capacity", Vp = "aws.dynamodb.consistent_read", Hp = "aws.dynamodb.projection", Yp = "aws.dynamodb.limit", jp = "aws.dynamodb.attributes_to_get", Xp = "aws.dynamodb.index_name", Wp = "aws.dynamodb.select", Kp = "aws.dynamodb.global_secondary_indexes", zp = "aws.dynamodb.local_secondary_indexes", qp = "aws.dynamodb.exclusive_start_table", Qp = "aws.dynamodb.table_count", Jp = "aws.dynamodb.scan_forward", Zp = "aws.dynamodb.segment", ef = "aws.dynamodb.total_segments", tf = "aws.dynamodb.count", rf = "aws.dynamodb.scanned_count", nf = "aws.dynamodb.attribute_definitions", af = "aws.dynamodb.global_secondary_index_updates", of = "messaging.system", sf = "messaging.destination", uf = "messaging.destination_kind", _f = "messaging.temp_destination", cf = "messaging.protocol", df = "messaging.protocol_version", lf = "messaging.url", pf = "messaging.message_id", ff = "messaging.conversation_id", Ef = "messaging.message_payload_size_bytes", Tf = "messaging.message_payload_compressed_size_bytes", hf = "messaging.operation", vf = "messaging.consumer_id", Sf = "messaging.rabbitmq.routing_key", Af = "messaging.kafka.message_key", Of = "messaging.kafka.consumer_group", mf = "messaging.kafka.client_id", Nf = "messaging.kafka.partition", Pf = "messaging.kafka.tombstone", yf = "rpc.system", gf = "rpc.service", Rf = "rpc.method", Mf = "rpc.grpc.status_code", If = "rpc.jsonrpc.version", Cf = "rpc.jsonrpc.request_id", Lf = "rpc.jsonrpc.error_code", Df = "rpc.jsonrpc.error_message", bf = "message.type", wf = "message.id", xf = "message.compressed_size", Bf = "message.uncompressed_size", ue = /* @__PURE__ */ El([
  Tl,
  hl,
  vl,
  Sl,
  Al,
  Ol,
  ml,
  Nl,
  Pl,
  yl,
  gl,
  Rl,
  Ml,
  Il,
  Cl,
  Ll,
  Dl,
  bl,
  wl,
  xl,
  Bl,
  Ul,
  Gl,
  $l,
  kl,
  Fl,
  Vl,
  Hl,
  Yl,
  jl,
  Xl,
  Wl,
  Kl,
  zl,
  ql,
  Ql,
  Jl,
  Zl,
  ep,
  tp,
  rp,
  np,
  ip,
  ap,
  op,
  sp,
  up,
  _p,
  cp,
  dp,
  lp,
  pp,
  fp,
  Ep,
  Tp,
  hp,
  vp,
  Sp,
  Ap,
  Op,
  mp,
  Np,
  Pp,
  yp,
  gp,
  Rp,
  Mp,
  Ip,
  Cp,
  Lp,
  Dp,
  bp,
  wp,
  xp,
  Bp,
  Up,
  Gp,
  $p,
  kp,
  Fp,
  Vp,
  Hp,
  Yp,
  jp,
  Xp,
  Wp,
  Kp,
  zp,
  qp,
  Qp,
  Jp,
  Zp,
  ef,
  tf,
  rf,
  nf,
  af,
  of,
  sf,
  uf,
  _f,
  cf,
  df,
  lf,
  pf,
  ff,
  Ef,
  Tf,
  hf,
  vf,
  Sf,
  Af,
  Of,
  mf,
  Nf,
  Pf,
  yf,
  gf,
  Rf,
  Mf,
  If,
  Cf,
  Lf,
  Df,
  bf,
  wf,
  xf,
  Bf
]), $r = "0.51.1", Uf = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), bt, Gf = 300, kr = typeof process == "object" && ((bt = process.release) === null || bt === void 0 ? void 0 : bt.name) === "node", $f = (
  /** @class */
  function(e) {
    Uf(t, e);
    function t(r) {
      var n = e.call(this, "@opentelemetry/instrumentation-fetch", $r, r) || this;
      return n.component = "fetch", n.version = $r, n.moduleName = n.component, n._usedResources = /* @__PURE__ */ new WeakSet(), n._tasksCount = 0, n;
    }
    return t.prototype.init = function() {
    }, t.prototype._getConfig = function() {
      return this._config;
    }, t.prototype._addChildSpan = function(r, n) {
      var i = this.tracer.startSpan("CORS Preflight", {
        startTime: n[h.FETCH_START]
      }, N.setSpan(O.active(), r));
      this._getConfig().ignoreNetworkEvents || he(i, n), i.end(n[h.RESPONSE_END]);
    }, t.prototype._addFinalSpanAttributes = function(r, n) {
      var i = X(n.url);
      r.setAttribute(ue.HTTP_STATUS_CODE, n.status), n.statusText != null && r.setAttribute(ot.HTTP_STATUS_TEXT, n.statusText), r.setAttribute(ue.HTTP_HOST, i.host), r.setAttribute(ue.HTTP_SCHEME, i.protocol.replace(":", "")), typeof navigator != "undefined" && r.setAttribute(ue.HTTP_USER_AGENT, navigator.userAgent);
    }, t.prototype._addHeaders = function(r, n) {
      if (!kn(n, this._getConfig().propagateTraceHeaderCorsUrls)) {
        var i = {};
        D.inject(O.active(), i), Object.keys(i).length > 0 && this._diag.debug("headers inject skipped due to CORS policy");
        return;
      }
      if (r instanceof Request)
        D.inject(O.active(), r.headers, {
          set: function(a, o, s) {
            return a.set(o, typeof s == "string" ? s : String(s));
          }
        });
      else if (r.headers instanceof Headers)
        D.inject(O.active(), r.headers, {
          set: function(a, o, s) {
            return a.set(o, typeof s == "string" ? s : String(s));
          }
        });
      else if (r.headers instanceof Map)
        D.inject(O.active(), r.headers, {
          set: function(a, o, s) {
            return a.set(o, typeof s == "string" ? s : String(s));
          }
        });
      else {
        var i = {};
        D.inject(O.active(), i), r.headers = Object.assign({}, i, r.headers || {});
      }
    }, t.prototype._clearResources = function() {
      this._tasksCount === 0 && this._getConfig().clearTimingResources && (performance.clearResourceTimings(), this._usedResources = /* @__PURE__ */ new WeakSet());
    }, t.prototype._createSpan = function(r, n) {
      var i;
      if (n === void 0 && (n = {}), vr(r, this._getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      var a = (n.method || "GET").toUpperCase(), o = "HTTP " + a;
      return this.tracer.startSpan(o, {
        kind: Ee.CLIENT,
        attributes: (i = {}, i[ot.COMPONENT] = this.moduleName, i[ue.HTTP_METHOD] = a, i[ue.HTTP_URL] = r, i)
      });
    }, t.prototype._findResourceAndAddNetworkEvents = function(r, n, i) {
      var a = n.entries;
      if (!a.length) {
        if (!performance.getEntriesByType)
          return;
        a = performance.getEntriesByType("resource");
      }
      var o = Gn(n.spanUrl, n.startTime, i, a, this._usedResources, "fetch");
      if (o.mainRequest) {
        var s = o.mainRequest;
        this._markResourceAsUsed(s);
        var u = o.corsPreFlightRequest;
        u && (this._addChildSpan(r, u), this._markResourceAsUsed(u)), this._getConfig().ignoreNetworkEvents || he(r, s);
      }
    }, t.prototype._markResourceAsUsed = function(r) {
      this._usedResources.add(r);
    }, t.prototype._endSpan = function(r, n, i) {
      var a = this, o = $(Date.now()), s = ne();
      this._addFinalSpanAttributes(r, i), setTimeout(function() {
        var u;
        (u = n.observer) === null || u === void 0 || u.disconnect(), a._findResourceAndAddNetworkEvents(r, n, s), a._tasksCount--, a._clearResources(), r.end(o);
      }, Gf);
    }, t.prototype._patchConstructor = function() {
      var r = this;
      return function(n) {
        var i = r;
        return function() {
          for (var o = [], s = 0; s < arguments.length; s++)
            o[s] = arguments[s];
          var u = this, _ = X(o[0] instanceof Request ? o[0].url : String(o[0])).href, c = o[0] instanceof Request ? o[0] : o[1] || {}, l = i._createSpan(_, c);
          if (!l)
            return n.apply(this, o);
          var p = i._prepareSpanData(_);
          function E(A, m) {
            i._applyAttributesAfterFetch(A, c, m), i._endSpan(A, p, {
              status: m.status || 0,
              statusText: m.message,
              url: _
            });
          }
          function f(A, m) {
            i._applyAttributesAfterFetch(A, c, m), m.status >= 200 && m.status < 400 ? i._endSpan(A, p, m) : i._endSpan(A, p, {
              status: m.status,
              statusText: m.statusText,
              url: _
            });
          }
          function S(A, m, C) {
            try {
              var ae = C.clone(), St = C.clone(), Oe = ae.body;
              if (Oe) {
                var ci = Oe.getReader(), Or = function() {
                  ci.read().then(function(At) {
                    var di = At.done;
                    di ? f(A, St) : Or();
                  }, function(At) {
                    E(A, At);
                  });
                };
                Or();
              } else
                f(A, C);
            } finally {
              m(C);
            }
          }
          function R(A, m, C) {
            try {
              E(A, C);
            } finally {
              m(C);
            }
          }
          return new Promise(function(A, m) {
            return O.with(N.setSpan(O.active(), l), function() {
              return i._addHeaders(c, _), i._tasksCount++, n.apply(u, c instanceof Request ? [c] : [_, c]).then(S.bind(u, l, A), R.bind(u, l, m));
            });
          });
        };
      };
    }, t.prototype._applyAttributesAfterFetch = function(r, n, i) {
      var a = this, o = this._getConfig().applyCustomAttributesOnSpan;
      o && it(function() {
        return o(r, n, i);
      }, function(s) {
        s && a._diag.error("applyCustomAttributesOnSpan", s);
      }, !0);
    }, t.prototype._prepareSpanData = function(r) {
      var n = ne(), i = [];
      if (typeof PerformanceObserver != "function")
        return { entries: i, startTime: n, spanUrl: r };
      var a = new PerformanceObserver(function(o) {
        var s = o.getEntries();
        s.forEach(function(u) {
          u.initiatorType === "fetch" && u.name === r && i.push(u);
        });
      });
      return a.observe({
        entryTypes: ["resource"]
      }), { entries: i, observer: a, startTime: n, spanUrl: r };
    }, t.prototype.enable = function() {
      if (kr) {
        this._diag.warn("this instrumentation is intended for web usage only, it does not instrument Node.js's fetch()");
        return;
      }
      te(fetch) && (this._unwrap(le, "fetch"), this._diag.debug("removing previous patch for constructor")), this._wrap(le, "fetch", this._patchConstructor());
    }, t.prototype.disable = function() {
      kr || (this._unwrap(le, "fetch"), this._usedResources = /* @__PURE__ */ new WeakSet());
    }, t;
  }(Et)
);
// @__NO_SIDE_EFFECTS__
function kf(e) {
  for (var t = {}, r = e.length, n = 0; n < r; n++) {
    var i = e[n];
    i && (t[String(i).toUpperCase().replace(/[-.]/g, "_")] = i);
  }
  return t;
}
var Ff = "aws.lambda.invoked_arn", Vf = "db.system", Hf = "db.connection_string", Yf = "db.user", jf = "db.jdbc.driver_classname", Xf = "db.name", Wf = "db.statement", Kf = "db.operation", zf = "db.mssql.instance_name", qf = "db.cassandra.keyspace", Qf = "db.cassandra.page_size", Jf = "db.cassandra.consistency_level", Zf = "db.cassandra.table", eE = "db.cassandra.idempotence", tE = "db.cassandra.speculative_execution_count", rE = "db.cassandra.coordinator.id", nE = "db.cassandra.coordinator.dc", iE = "db.hbase.namespace", aE = "db.redis.database_index", oE = "db.mongodb.collection", sE = "db.sql.table", uE = "exception.type", _E = "exception.message", cE = "exception.stacktrace", dE = "exception.escaped", lE = "faas.trigger", pE = "faas.execution", fE = "faas.document.collection", EE = "faas.document.operation", TE = "faas.document.time", hE = "faas.document.name", vE = "faas.time", SE = "faas.cron", AE = "faas.coldstart", OE = "faas.invoked_name", mE = "faas.invoked_provider", NE = "faas.invoked_region", PE = "net.transport", yE = "net.peer.ip", gE = "net.peer.port", RE = "net.peer.name", ME = "net.host.ip", IE = "net.host.port", CE = "net.host.name", LE = "net.host.connection.type", DE = "net.host.connection.subtype", bE = "net.host.carrier.name", wE = "net.host.carrier.mcc", xE = "net.host.carrier.mnc", BE = "net.host.carrier.icc", UE = "peer.service", GE = "enduser.id", $E = "enduser.role", kE = "enduser.scope", FE = "thread.id", VE = "thread.name", HE = "code.function", YE = "code.namespace", jE = "code.filepath", XE = "code.lineno", WE = "http.method", KE = "http.url", zE = "http.target", qE = "http.host", QE = "http.scheme", JE = "http.status_code", ZE = "http.flavor", eT = "http.user_agent", tT = "http.request_content_length", rT = "http.request_content_length_uncompressed", nT = "http.response_content_length", iT = "http.response_content_length_uncompressed", aT = "http.server_name", oT = "http.route", sT = "http.client_ip", uT = "aws.dynamodb.table_names", _T = "aws.dynamodb.consumed_capacity", cT = "aws.dynamodb.item_collection_metrics", dT = "aws.dynamodb.provisioned_read_capacity", lT = "aws.dynamodb.provisioned_write_capacity", pT = "aws.dynamodb.consistent_read", fT = "aws.dynamodb.projection", ET = "aws.dynamodb.limit", TT = "aws.dynamodb.attributes_to_get", hT = "aws.dynamodb.index_name", vT = "aws.dynamodb.select", ST = "aws.dynamodb.global_secondary_indexes", AT = "aws.dynamodb.local_secondary_indexes", OT = "aws.dynamodb.exclusive_start_table", mT = "aws.dynamodb.table_count", NT = "aws.dynamodb.scan_forward", PT = "aws.dynamodb.segment", yT = "aws.dynamodb.total_segments", gT = "aws.dynamodb.count", RT = "aws.dynamodb.scanned_count", MT = "aws.dynamodb.attribute_definitions", IT = "aws.dynamodb.global_secondary_index_updates", CT = "messaging.system", LT = "messaging.destination", DT = "messaging.destination_kind", bT = "messaging.temp_destination", wT = "messaging.protocol", xT = "messaging.protocol_version", BT = "messaging.url", UT = "messaging.message_id", GT = "messaging.conversation_id", $T = "messaging.message_payload_size_bytes", kT = "messaging.message_payload_compressed_size_bytes", FT = "messaging.operation", VT = "messaging.consumer_id", HT = "messaging.rabbitmq.routing_key", YT = "messaging.kafka.message_key", jT = "messaging.kafka.consumer_group", XT = "messaging.kafka.client_id", WT = "messaging.kafka.partition", KT = "messaging.kafka.tombstone", zT = "rpc.system", qT = "rpc.service", QT = "rpc.method", JT = "rpc.grpc.status_code", ZT = "rpc.jsonrpc.version", eh = "rpc.jsonrpc.request_id", th = "rpc.jsonrpc.error_code", rh = "rpc.jsonrpc.error_message", nh = "message.type", ih = "message.id", ah = "message.compressed_size", oh = "message.uncompressed_size", _e = /* @__PURE__ */ kf([
  Ff,
  Vf,
  Hf,
  Yf,
  jf,
  Xf,
  Wf,
  Kf,
  zf,
  qf,
  Qf,
  Jf,
  Zf,
  eE,
  tE,
  rE,
  nE,
  iE,
  aE,
  oE,
  sE,
  uE,
  _E,
  cE,
  dE,
  lE,
  pE,
  fE,
  EE,
  TE,
  hE,
  vE,
  SE,
  AE,
  OE,
  mE,
  NE,
  PE,
  yE,
  gE,
  RE,
  ME,
  IE,
  CE,
  LE,
  DE,
  bE,
  wE,
  xE,
  BE,
  UE,
  GE,
  $E,
  kE,
  FE,
  VE,
  HE,
  YE,
  jE,
  XE,
  WE,
  KE,
  zE,
  qE,
  QE,
  JE,
  ZE,
  eT,
  tT,
  rT,
  nT,
  iT,
  aT,
  oT,
  sT,
  uT,
  _T,
  cT,
  dT,
  lT,
  pT,
  fT,
  ET,
  TT,
  hT,
  vT,
  ST,
  AT,
  OT,
  mT,
  NT,
  PT,
  yT,
  gT,
  RT,
  MT,
  IT,
  CT,
  LT,
  DT,
  bT,
  wT,
  xT,
  BT,
  UT,
  GT,
  $T,
  kT,
  FT,
  VT,
  HT,
  YT,
  jT,
  XT,
  WT,
  KT,
  zT,
  qT,
  QT,
  JT,
  ZT,
  eh,
  th,
  rh,
  nh,
  ih,
  ah,
  oh
]), j;
(function(e) {
  e.METHOD_OPEN = "open", e.METHOD_SEND = "send", e.EVENT_ABORT = "abort", e.EVENT_ERROR = "error", e.EVENT_LOAD = "loaded", e.EVENT_TIMEOUT = "timeout";
})(j || (j = {}));
var Fr = "0.51.1", Kt;
(function(e) {
  e.HTTP_STATUS_TEXT = "http.status_text";
})(Kt || (Kt = {}));
var sh = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), uh = 300, _h = (
  /** @class */
  function(e) {
    sh(t, e);
    function t(r) {
      var n = e.call(this, "@opentelemetry/instrumentation-xml-http-request", Fr, r) || this;
      return n.component = "xml-http-request", n.version = Fr, n.moduleName = n.component, n._tasksCount = 0, n._xhrMem = /* @__PURE__ */ new WeakMap(), n._usedResources = /* @__PURE__ */ new WeakSet(), n;
    }
    return t.prototype.init = function() {
    }, t.prototype._getConfig = function() {
      return this._config;
    }, t.prototype._addHeaders = function(r, n) {
      var i = X(n).href;
      if (!kn(i, this._getConfig().propagateTraceHeaderCorsUrls)) {
        var a = {};
        D.inject(O.active(), a), Object.keys(a).length > 0 && this._diag.debug("headers inject skipped due to CORS policy");
        return;
      }
      var o = {};
      D.inject(O.active(), o), Object.keys(o).forEach(function(s) {
        r.setRequestHeader(s, String(o[s]));
      });
    }, t.prototype._addChildSpan = function(r, n) {
      var i = this;
      O.with(N.setSpan(O.active(), r), function() {
        var a = i.tracer.startSpan("CORS Preflight", {
          startTime: n[h.FETCH_START]
        });
        i._getConfig().ignoreNetworkEvents || he(a, n), a.end(n[h.RESPONSE_END]);
      });
    }, t.prototype._addFinalSpanAttributes = function(r, n, i) {
      if (typeof i == "string") {
        var a = X(i);
        n.status !== void 0 && r.setAttribute(_e.HTTP_STATUS_CODE, n.status), n.statusText !== void 0 && r.setAttribute(Kt.HTTP_STATUS_TEXT, n.statusText), r.setAttribute(_e.HTTP_HOST, a.host), r.setAttribute(_e.HTTP_SCHEME, a.protocol.replace(":", "")), r.setAttribute(_e.HTTP_USER_AGENT, navigator.userAgent);
      }
    }, t.prototype._applyAttributesAfterXHR = function(r, n) {
      var i = this, a = this._getConfig().applyCustomAttributesOnSpan;
      typeof a == "function" && it(function() {
        return a(r, n);
      }, function(o) {
        o && i._diag.error("applyCustomAttributesOnSpan", o);
      }, !0);
    }, t.prototype._addResourceObserver = function(r, n) {
      var i = this._xhrMem.get(r);
      !i || typeof PerformanceObserver != "function" || typeof PerformanceResourceTiming != "function" || (i.createdResources = {
        observer: new PerformanceObserver(function(a) {
          var o = a.getEntries(), s = X(n);
          o.forEach(function(u) {
            u.initiatorType === "xmlhttprequest" && u.name === s.href && i.createdResources && i.createdResources.entries.push(u);
          });
        }),
        entries: []
      }, i.createdResources.observer.observe({
        entryTypes: ["resource"]
      }));
    }, t.prototype._clearResources = function() {
      this._tasksCount === 0 && this._getConfig().clearTimingResources && (b.clearResourceTimings(), this._xhrMem = /* @__PURE__ */ new WeakMap(), this._usedResources = /* @__PURE__ */ new WeakSet());
    }, t.prototype._findResourceAndAddNetworkEvents = function(r, n, i, a, o) {
      if (!(!i || !a || !o || !r.createdResources)) {
        var s = r.createdResources.entries;
        (!s || !s.length) && (s = b.getEntriesByType("resource"));
        var u = Gn(X(i).href, a, o, s, this._usedResources);
        if (u.mainRequest) {
          var _ = u.mainRequest;
          this._markResourceAsUsed(_);
          var c = u.corsPreFlightRequest;
          c && (this._addChildSpan(n, c), this._markResourceAsUsed(c)), this._getConfig().ignoreNetworkEvents || he(n, _);
        }
      }
    }, t.prototype._cleanPreviousSpanInformation = function(r) {
      var n = this._xhrMem.get(r);
      if (n) {
        var i = n.callbackToRemoveEvents;
        i && i(), this._xhrMem.delete(r);
      }
    }, t.prototype._createSpan = function(r, n, i) {
      var a;
      if (vr(n, this._getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      var o = i.toUpperCase(), s = this.tracer.startSpan(o, {
        kind: Ee.CLIENT,
        attributes: (a = {}, a[_e.HTTP_METHOD] = i, a[_e.HTTP_URL] = X(n).toString(), a)
      });
      return s.addEvent(j.METHOD_OPEN), this._cleanPreviousSpanInformation(r), this._xhrMem.set(r, {
        span: s,
        spanUrl: n
      }), s;
    }, t.prototype._markResourceAsUsed = function(r) {
      this._usedResources.add(r);
    }, t.prototype._patchOpen = function() {
      var r = this;
      return function(n) {
        var i = r;
        return function() {
          for (var o = [], s = 0; s < arguments.length; s++)
            o[s] = arguments[s];
          var u = o[0], _ = o[1];
          return i._createSpan(this, _, u), n.apply(this, o);
        };
      };
    }, t.prototype._patchSend = function() {
      var r = this;
      function n(c, l, p, E) {
        var f = l.callbackToRemoveEvents;
        typeof f == "function" && f();
        var S = l.span, R = l.spanUrl, A = l.sendStartTime;
        S && (r._findResourceAndAddNetworkEvents(l, S, R, A, p), S.addEvent(c, E), r._addFinalSpanAttributes(S, l, R), S.end(E), r._tasksCount--), r._clearResources();
      }
      function i(c, l) {
        var p = r._xhrMem.get(l);
        if (p) {
          p.status = l.status, p.statusText = l.statusText, r._xhrMem.delete(l), p.span && r._applyAttributesAfterXHR(p.span, l);
          var E = ne(), f = Date.now();
          setTimeout(function() {
            n(c, p, E, f);
          }, uh);
        }
      }
      function a() {
        i(j.EVENT_ERROR, this);
      }
      function o() {
        i(j.EVENT_ABORT, this);
      }
      function s() {
        i(j.EVENT_TIMEOUT, this);
      }
      function u() {
        this.status < 299 ? i(j.EVENT_LOAD, this) : i(j.EVENT_ERROR, this);
      }
      function _(c) {
        c.removeEventListener("abort", o), c.removeEventListener("error", a), c.removeEventListener("load", u), c.removeEventListener("timeout", s);
        var l = r._xhrMem.get(c);
        l && (l.callbackToRemoveEvents = void 0);
      }
      return function(c) {
        return function() {
          for (var p = this, E = [], f = 0; f < arguments.length; f++)
            E[f] = arguments[f];
          var S = r._xhrMem.get(this);
          if (!S)
            return c.apply(this, E);
          var R = S.span, A = S.spanUrl;
          return R && A && O.with(N.setSpan(O.active(), R), function() {
            r._tasksCount++, S.sendStartTime = ne(), R.addEvent(j.METHOD_SEND), p.addEventListener("abort", o), p.addEventListener("error", a), p.addEventListener("load", u), p.addEventListener("timeout", s), S.callbackToRemoveEvents = function() {
              _(p), S.createdResources && S.createdResources.observer.disconnect();
            }, r._addHeaders(p, A), r._addResourceObserver(p, A);
          }), c.apply(this, E);
        };
      };
    }, t.prototype.enable = function() {
      this._diag.debug("applying patch to", this.moduleName, this.version), te(XMLHttpRequest.prototype.open) && (this._unwrap(XMLHttpRequest.prototype, "open"), this._diag.debug("removing previous patch from method open")), te(XMLHttpRequest.prototype.send) && (this._unwrap(XMLHttpRequest.prototype, "send"), this._diag.debug("removing previous patch from method send")), this._wrap(XMLHttpRequest.prototype, "open", this._patchOpen()), this._wrap(XMLHttpRequest.prototype, "send", this._patchSend());
    }, t.prototype.disable = function() {
      this._diag.debug("removing patch from", this.moduleName, this.version), this._unwrap(XMLHttpRequest.prototype, "open"), this._unwrap(XMLHttpRequest.prototype, "send"), this._tasksCount = 0, this._xhrMem = /* @__PURE__ */ new WeakMap(), this._usedResources = /* @__PURE__ */ new WeakSet();
    }, t;
  }(Et)
), ch = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
}, jn = 1e4, dh = 5, lh = 1e3, ph = 5e3, fh = 1.5;
function Eh(e) {
  e === void 0 && (e = {});
  var t = {};
  return Object.entries(e).forEach(function(r) {
    var n = ch(r, 2), i = n[0], a = n[1];
    typeof a != "undefined" ? t[i] = String(a) : v.warn('Header "' + i + '" has wrong value and will be ignored');
  }), t;
}
function Th(e, t) {
  return e.endsWith("/") || (e = e + "/"), e + t;
}
function hh(e) {
  try {
    var t = new URL(e);
    return t.pathname === "" && (t.pathname = t.pathname + "/"), t.toString();
  } catch (r) {
    return v.warn("Could not parse export URL: '" + e + "'"), e;
  }
}
function vh(e) {
  return typeof e == "number" ? e <= 0 ? Xn(e, jn) : e : Sh();
}
function Sh() {
  var e, t = Number((e = y().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT) !== null && e !== void 0 ? e : y().OTEL_EXPORTER_OTLP_TIMEOUT);
  return t <= 0 ? Xn(t, jn) : t;
}
function Xn(e, t) {
  return v.warn("Timeout must be greater than 0", e), t;
}
function Ah(e) {
  var t = [429, 502, 503, 504];
  return t.includes(e);
}
function Oh(e) {
  if (e == null)
    return -1;
  var t = Number.parseInt(e, 10);
  if (Number.isInteger(t))
    return t > 0 ? t * 1e3 : -1;
  var r = new Date(e).getTime() - Date.now();
  return r >= 0 ? r : 0;
}
var mh = (
  /** @class */
  function() {
    function e(t) {
      t === void 0 && (t = {}), this._sendingPromises = [], this.url = this.getDefaultUrl(t), typeof t.hostname == "string" && (this.hostname = t.hostname), this.shutdown = this.shutdown.bind(this), this._shutdownOnce = new ft(this._shutdown, this), this._concurrencyLimit = typeof t.concurrencyLimit == "number" ? t.concurrencyLimit : 30, this.timeoutMillis = vh(t.timeoutMillis), this.onInit(t);
    }
    return e.prototype.export = function(t, r) {
      if (this._shutdownOnce.isCalled) {
        r({
          code: F.FAILED,
          error: new Error("Exporter has been shutdown")
        });
        return;
      }
      if (this._sendingPromises.length >= this._concurrencyLimit) {
        r({
          code: F.FAILED,
          error: new Error("Concurrent export limit reached")
        });
        return;
      }
      this._export(t).then(function() {
        r({ code: F.SUCCESS });
      }).catch(function(n) {
        r({ code: F.FAILED, error: n });
      });
    }, e.prototype._export = function(t) {
      var r = this;
      return new Promise(function(n, i) {
        try {
          v.debug("items to be sent", t), r.send(t, n, i);
        } catch (a) {
          i(a);
        }
      });
    }, e.prototype.shutdown = function() {
      return this._shutdownOnce.call();
    }, e.prototype.forceFlush = function() {
      return Promise.all(this._sendingPromises).then(function() {
      });
    }, e.prototype._shutdown = function() {
      return v.debug("shutdown started"), this.onShutdown(), this.forceFlush();
    }, e;
  }()
), Nh = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), ge = (
  /** @class */
  function(e) {
    Nh(t, e);
    function t(r, n, i) {
      var a = e.call(this, r) || this;
      return a.name = "OTLPExporterError", a.data = i, a.code = n, a;
    }
    return t;
  }(Error)
), st = function() {
  return st = Object.assign || function(e) {
    for (var t, r = 1, n = arguments.length; r < n; r++) {
      t = arguments[r];
      for (var i in t)
        Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
    }
    return e;
  }, st.apply(this, arguments);
}, Ph = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
};
function yh(e, t, r, n, i) {
  if (navigator.sendBeacon(t, new Blob([e], r)))
    v.debug("sendBeacon - can send", e), n();
  else {
    var a = new ge("sendBeacon - cannot send " + e);
    i(a);
  }
}
function gh(e, t, r, n, i, a) {
  var o, s, u = !1, _ = setTimeout(function() {
    if (clearTimeout(o), u = !0, s.readyState === XMLHttpRequest.DONE) {
      var l = new ge("Request Timeout");
      a(l);
    } else
      s.abort();
  }, n), c = function(l, p) {
    l === void 0 && (l = dh), p === void 0 && (p = lh), s = new XMLHttpRequest(), s.open("POST", t);
    var E = {
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    Object.entries(st(st({}, E), r)).forEach(function(f) {
      var S = Ph(f, 2), R = S[0], A = S[1];
      s.setRequestHeader(R, A);
    }), s.send(e), s.onreadystatechange = function() {
      if (s.readyState === XMLHttpRequest.DONE && u === !1)
        if (s.status >= 200 && s.status <= 299)
          v.debug("xhr success", e), i(), clearTimeout(_), clearTimeout(o);
        else if (s.status && Ah(s.status) && l > 0) {
          var f = void 0;
          p = fh * p, s.getResponseHeader("Retry-After") ? f = Oh(s.getResponseHeader("Retry-After")) : f = Math.round(Math.random() * (ph - p) + p), o = setTimeout(function() {
            c(l - 1, p);
          }, f);
        } else {
          var S = new ge("Failed to export with XHR (status: " + s.status + ")", s.status);
          a(S), clearTimeout(_), clearTimeout(o);
        }
    }, s.onabort = function() {
      if (u) {
        var f = new ge("Request Timeout");
        a(f);
      }
      clearTimeout(_), clearTimeout(o);
    }, s.onerror = function() {
      if (u) {
        var f = new ge("Request Timeout");
        a(f);
      }
      clearTimeout(_), clearTimeout(o);
    };
  };
  c();
}
var Rh = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Mh = (
  /** @class */
  function(e) {
    Rh(t, e);
    function t(r) {
      r === void 0 && (r = {});
      var n = e.call(this, r) || this;
      return n._useXHR = !1, n._useXHR = !!r.headers || typeof navigator.sendBeacon != "function", n._useXHR ? n._headers = Object.assign({}, Eh(r.headers), _r(y().OTEL_EXPORTER_OTLP_HEADERS)) : n._headers = {}, n;
    }
    return t.prototype.onInit = function() {
    }, t.prototype.onShutdown = function() {
    }, t.prototype.send = function(r, n, i) {
      var a = this;
      if (this._shutdownOnce.isCalled) {
        v.debug("Shutdown already started. Cannot send objects");
        return;
      }
      var o = this.convert(r), s = JSON.stringify(o), u = new Promise(function(c, l) {
        a._useXHR ? gh(s, a.url, a._headers, a.timeoutMillis, c, l) : yh(s, a.url, { type: "application/json" }, c, l);
      }).then(n, i);
      this._sendingPromises.push(u);
      var _ = function() {
        var c = a._sendingPromises.indexOf(u);
        a._sendingPromises.splice(c, 1);
      };
      u.then(_, _);
    }, t;
  }(mh)
);
function Wn(e) {
  var t = BigInt(1e9);
  return BigInt(e[0]) * t + BigInt(e[1]);
}
function Ih(e) {
  var t = Number(BigInt.asUintN(32, e)), r = Number(BigInt.asUintN(32, e >> BigInt(32)));
  return { low: t, high: r };
}
function Kn(e) {
  var t = Wn(e);
  return Ih(t);
}
function Ch(e) {
  var t = Wn(e);
  return t.toString();
}
var Lh = typeof BigInt != "undefined" ? Ch : k;
function Vr(e) {
  return e;
}
function zn(e) {
  if (e !== void 0)
    return ke(e);
}
var Dh = {
  encodeHrTime: Kn,
  encodeSpanContext: ke,
  encodeOptionalSpanContext: zn
};
function bh(e) {
  var t, r;
  if (e === void 0)
    return Dh;
  var n = (t = e.useLongBits) !== null && t !== void 0 ? t : !0, i = (r = e.useHex) !== null && r !== void 0 ? r : !1;
  return {
    encodeHrTime: n ? Kn : Lh,
    encodeSpanContext: i ? Vr : ke,
    encodeOptionalSpanContext: i ? Vr : zn
  };
}
var wh = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
};
function Tt(e) {
  return Object.keys(e).map(function(t) {
    return qn(t, e[t]);
  });
}
function qn(e, t) {
  return {
    key: e,
    value: Qn(t)
  };
}
function Qn(e) {
  var t = typeof e;
  return t === "string" ? { stringValue: e } : t === "number" ? Number.isInteger(e) ? { intValue: e } : { doubleValue: e } : t === "boolean" ? { boolValue: e } : e instanceof Uint8Array ? { bytesValue: e } : Array.isArray(e) ? { arrayValue: { values: e.map(Qn) } } : t === "object" && e != null ? {
    kvlistValue: {
      values: Object.entries(e).map(function(r) {
        var n = wh(r, 2), i = n[0], a = n[1];
        return qn(i, a);
      })
    }
  } : {};
}
function xh(e, t) {
  var r, n = e.spanContext(), i = e.status;
  return {
    traceId: t.encodeSpanContext(n.traceId),
    spanId: t.encodeSpanContext(n.spanId),
    parentSpanId: t.encodeOptionalSpanContext(e.parentSpanId),
    traceState: (r = n.traceState) === null || r === void 0 ? void 0 : r.serialize(),
    name: e.name,
    // Span kind is offset by 1 because the API does not define a value for unset
    kind: e.kind == null ? 0 : e.kind + 1,
    startTimeUnixNano: t.encodeHrTime(e.startTime),
    endTimeUnixNano: t.encodeHrTime(e.endTime),
    attributes: Tt(e.attributes),
    droppedAttributesCount: e.droppedAttributesCount,
    events: e.events.map(function(a) {
      return Uh(a, t);
    }),
    droppedEventsCount: e.droppedEventsCount,
    status: {
      // API and proto enums share the same values
      code: i.code,
      message: i.message
    },
    links: e.links.map(function(a) {
      return Bh(a, t);
    }),
    droppedLinksCount: e.droppedLinksCount
  };
}
function Bh(e, t) {
  var r;
  return {
    attributes: e.attributes ? Tt(e.attributes) : [],
    spanId: t.encodeSpanContext(e.context.spanId),
    traceId: t.encodeSpanContext(e.context.traceId),
    traceState: (r = e.context.traceState) === null || r === void 0 ? void 0 : r.serialize(),
    droppedAttributesCount: e.droppedAttributesCount || 0
  };
}
function Uh(e, t) {
  return {
    attributes: e.attributes ? Tt(e.attributes) : [],
    name: e.name,
    timeUnixNano: t.encodeHrTime(e.time),
    droppedAttributesCount: e.droppedAttributesCount || 0
  };
}
var Gh = function(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, r = t && e[t], n = 0;
  if (r)
    return r.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function() {
        return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
      }
    };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}, $h = function(e, t) {
  var r = typeof Symbol == "function" && e[Symbol.iterator];
  if (!r)
    return e;
  var n = r.call(e), i, a = [], o;
  try {
    for (; (t === void 0 || t-- > 0) && !(i = n.next()).done; )
      a.push(i.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      i && !i.done && (r = n.return) && r.call(n);
    } finally {
      if (o)
        throw o.error;
    }
  }
  return a;
};
function kh(e, t) {
  var r = bh(t);
  return {
    resourceSpans: Vh(e, r)
  };
}
function Fh(e) {
  var t, r, n = /* @__PURE__ */ new Map();
  try {
    for (var i = Gh(e), a = i.next(); !a.done; a = i.next()) {
      var o = a.value, s = n.get(o.resource);
      s || (s = /* @__PURE__ */ new Map(), n.set(o.resource, s));
      var u = o.instrumentationLibrary.name + "@" + (o.instrumentationLibrary.version || "") + ":" + (o.instrumentationLibrary.schemaUrl || ""), _ = s.get(u);
      _ || (_ = [], s.set(u, _)), _.push(o);
    }
  } catch (c) {
    t = { error: c };
  } finally {
    try {
      a && !a.done && (r = i.return) && r.call(i);
    } finally {
      if (t)
        throw t.error;
    }
  }
  return n;
}
function Vh(e, t) {
  for (var r = Fh(e), n = [], i = r.entries(), a = i.next(); !a.done; ) {
    for (var o = $h(a.value, 2), s = o[0], u = o[1], _ = [], c = u.values(), l = c.next(); !l.done; ) {
      var p = l.value;
      if (p.length > 0) {
        var E = p[0].instrumentationLibrary, f = E.name, S = E.version, R = E.schemaUrl, A = p.map(function(C) {
          return xh(C, t);
        });
        _.push({
          scope: { name: f, version: S },
          spans: A,
          schemaUrl: R
        });
      }
      l = c.next();
    }
    var m = {
      resource: {
        attributes: Tt(s.attributes),
        droppedAttributesCount: 0
      },
      scopeSpans: _,
      schemaUrl: void 0
    };
    n.push(m), a = i.next();
  }
  return n;
}
var Hh = /* @__PURE__ */ function() {
  var e = function(t, r) {
    return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
      n.__proto__ = i;
    } || function(n, i) {
      for (var a in i)
        Object.prototype.hasOwnProperty.call(i, a) && (n[a] = i[a]);
    }, e(t, r);
  };
  return function(t, r) {
    if (typeof r != "function" && r !== null)
      throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    e(t, r);
    function n() {
      this.constructor = t;
    }
    t.prototype = r === null ? Object.create(r) : (n.prototype = r.prototype, new n());
  };
}(), Jn = "v1/traces", Yh = "http://localhost:4318/" + Jn, jh = (
  /** @class */
  function(e) {
    Hh(t, e);
    function t(r) {
      r === void 0 && (r = {});
      var n = e.call(this, r) || this;
      return n._headers = Object.assign(n._headers, _r(y().OTEL_EXPORTER_OTLP_TRACES_HEADERS)), n;
    }
    return t.prototype.convert = function(r) {
      return kh(r, {
        useHex: !0,
        useLongBits: !1
      });
    }, t.prototype.getDefaultUrl = function(r) {
      return typeof r.url == "string" ? r.url : y().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.length > 0 ? hh(y().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) : y().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0 ? Th(y().OTEL_EXPORTER_OTLP_ENDPOINT, Jn) : Yh;
    }, t;
  }(Mh)
), Xh = "deployment.environment", Wh = "service.name", Kh = Xh, zh = Wh, Sr = {};
const qh = /* @__PURE__ */ Qr(xa), Qh = /* @__PURE__ */ Qr(Wu);
Object.defineProperty(Sr, "__esModule", { value: !0 });
var Zn = Sr.BatchSpanProcessorBase = void 0;
const ce = qh, Q = Qh;
class Jh {
  constructor(t, r) {
    this._exporter = t, this._isExporting = !1, this._finishedSpans = [], this._droppedSpansCount = 0;
    const n = (0, Q.getEnv)();
    this._maxExportBatchSize = typeof (r == null ? void 0 : r.maxExportBatchSize) == "number" ? r.maxExportBatchSize : n.OTEL_BSP_MAX_EXPORT_BATCH_SIZE, this._maxQueueSize = typeof (r == null ? void 0 : r.maxQueueSize) == "number" ? r.maxQueueSize : n.OTEL_BSP_MAX_QUEUE_SIZE, this._scheduledDelayMillis = typeof (r == null ? void 0 : r.scheduledDelayMillis) == "number" ? r.scheduledDelayMillis : n.OTEL_BSP_SCHEDULE_DELAY, this._exportTimeoutMillis = typeof (r == null ? void 0 : r.exportTimeoutMillis) == "number" ? r.exportTimeoutMillis : n.OTEL_BSP_EXPORT_TIMEOUT, this._shutdownOnce = new Q.BindOnceFuture(this._shutdown, this), this._maxExportBatchSize > this._maxQueueSize && (ce.diag.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize"), this._maxExportBatchSize = this._maxQueueSize);
  }
  forceFlush() {
    return this._shutdownOnce.isCalled ? this._shutdownOnce.promise : this._flushAll();
  }
  // does nothing.
  onStart(t, r) {
  }
  onEnd(t) {
    this._shutdownOnce.isCalled || t.spanContext().traceFlags & ce.TraceFlags.SAMPLED && this._addToBuffer(t);
  }
  shutdown() {
    return this._shutdownOnce.call();
  }
  _shutdown() {
    return Promise.resolve().then(() => this.onShutdown()).then(() => this._flushAll()).then(() => this._exporter.shutdown());
  }
  /** Add a span in the buffer. */
  _addToBuffer(t) {
    if (this._finishedSpans.length >= this._maxQueueSize) {
      this._droppedSpansCount === 0 && ce.diag.debug("maxQueueSize reached, dropping spans"), this._droppedSpansCount++;
      return;
    }
    this._droppedSpansCount > 0 && (ce.diag.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`), this._droppedSpansCount = 0), this._finishedSpans.push(t), this._maybeStartTimer();
  }
  /**
   * Send all spans to the exporter respecting the batch size limit
   * This function is used only on forceFlush or shutdown,
   * for all other cases _flush should be used
   * */
  _flushAll() {
    return new Promise((t, r) => {
      const n = [], i = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
      for (let a = 0, o = i; a < o; a++)
        n.push(this._flushOneBatch());
      Promise.all(n).then(() => {
        t();
      }).catch(r);
    });
  }
  _flushOneBatch() {
    return this._clearTimer(), this._finishedSpans.length === 0 ? Promise.resolve() : new Promise((t, r) => {
      const n = setTimeout(() => {
        r(new Error("Timeout"));
      }, this._exportTimeoutMillis);
      ce.context.with((0, Q.suppressTracing)(ce.context.active()), () => {
        const i = this._finishedSpans.splice(0, this._maxExportBatchSize), a = () => this._exporter.export(i, (s) => {
          var u;
          clearTimeout(n), s.code === Q.ExportResultCode.SUCCESS ? t() : r((u = s.error) !== null && u !== void 0 ? u : new Error("BatchSpanProcessor: span export failed"));
        }), o = i.map((s) => s.resource).filter((s) => s.asyncAttributesPending);
        o.length === 0 ? a() : Promise.all(o.map((s) => {
          var u;
          return (u = s.waitForAsyncAttributes) === null || u === void 0 ? void 0 : u.call(s);
        })).then(a, (s) => {
          (0, Q.globalErrorHandler)(s), r(s);
        });
      });
    });
  }
  _maybeStartTimer() {
    if (this._isExporting)
      return;
    const t = () => {
      this._isExporting = !0, this._flushOneBatch().finally(() => {
        this._isExporting = !1, this._finishedSpans.length > 0 && (this._clearTimer(), this._maybeStartTimer());
      }).catch((r) => {
        this._isExporting = !1, (0, Q.globalErrorHandler)(r);
      });
    };
    if (this._finishedSpans.length >= this._maxExportBatchSize)
      return t();
    this._timer === void 0 && (this._timer = setTimeout(() => t(), this._scheduledDelayMillis), (0, Q.unrefTimer)(this._timer));
  }
  _clearTimer() {
    this._timer !== void 0 && (clearTimeout(this._timer), this._timer = void 0);
  }
}
Zn = Sr.BatchSpanProcessorBase = Jh;
var Hr;
(function(e) {
  e.EVENT_TYPE = "event_type", e.TARGET_ELEMENT = "target_element", e.TARGET_XPATH = "target_xpath", e.HTTP_URL = "http.url";
})(Hr || (Hr = {}));
const Zh = ["click", "input", "submit", "scroll"];
function ev() {
  return !1;
}
class tv extends Et {
  constructor(r = {}) {
    var n;
    super("user-interaction", "1.0.0", r);
    H(this, "_spansData", /* @__PURE__ */ new WeakMap());
    // for addEventListener/removeEventListener state
    H(this, "_wrappedListeners", /* @__PURE__ */ new WeakMap());
    // for event bubbling
    H(this, "_eventsSpanMap", /* @__PURE__ */ new WeakMap());
    H(this, "_eventNames");
    H(this, "_shouldPreventSpanCreation");
    this._eventNames = new Set((n = r == null ? void 0 : r.eventNames) != null ? n : Zh), this._shouldPreventSpanCreation = typeof (r == null ? void 0 : r.shouldPreventSpanCreation) == "function" ? r.shouldPreventSpanCreation : ev;
  }
  init() {
  }
  /**
   * Controls whether or not to create a span, based on the event type.
   */
  _allowEventName(r) {
    return this._eventNames.has(r);
  }
  /**
   * Creates a new span
   * @param event
   * @param parentSpan
   */
  _createSpan(r, n) {
    var s;
    const i = r == null ? void 0 : r.target, a = r == null ? void 0 : r.type;
    if (!(i instanceof HTMLElement) || !i.getAttribute || i.hasAttribute("disabled") || !this._allowEventName(a))
      return;
    const o = $n(i, !0);
    try {
      const u = this.tracer.startSpan(a, {
        attributes: {
          "event.type": a,
          "event.tag": i.tagName,
          "event.xpath": o,
          "event.id": i.id,
          "event.text": (s = i.textContent) != null ? s : "",
          "event.url": window.location.href,
          "viewport.width": window.innerWidth,
          "viewport.height": window.innerHeight
        }
      }, n ? N.setSpan(O.active(), n) : void 0);
      return r instanceof MouseEvent && (u.setAttribute("event.x", r.clientX), u.setAttribute("event.y", r.clientY), u.setAttribute("event.relativeX", r.clientX / window.innerWidth), u.setAttribute("event.relativeY", r.clientY / window.innerHeight), a === "scroll" && (u.setAttribute("event.scrollX", window.scrollX), u.setAttribute("event.scrollY", window.scrollY))), this._shouldPreventSpanCreation(a, i, u) === !0 ? void 0 : (this._spansData.set(u, {
        taskCount: 0
      }), u);
    } catch (u) {
      this._diag.error("failed to start create new user interaction span", u);
    }
  }
  /**
   * Returns true iff we should use the patched callback; false if it's already been patched
   */
  addPatchedListener(r, n, i, a) {
    let o = this._wrappedListeners.get(i);
    o || (o = /* @__PURE__ */ new Map(), this._wrappedListeners.set(i, o));
    let s = o.get(n);
    return s || (s = /* @__PURE__ */ new Map(), o.set(n, s)), s.has(r) ? !1 : (s.set(r, a), !0);
  }
  /**
   * Returns the patched version of the callback (or undefined)
   */
  removePatchedListener(r, n, i) {
    const a = this._wrappedListeners.get(i);
    if (!a)
      return;
    const o = a.get(n);
    if (!o)
      return;
    const s = o.get(r);
    return s && (o.delete(r), o.size === 0 && (a.delete(n), a.size === 0 && this._wrappedListeners.delete(i))), s;
  }
  // utility method to deal with the Function|EventListener nature of addEventListener
  _invokeListener(r, n, i) {
    return typeof r == "function" ? r.apply(n, i) : r.handleEvent(i[0]);
  }
  /**
   * This patches the addEventListener of HTMLElement to be able to
   * auto instrument the click events
   */
  _patchAddEventListener() {
    const r = this;
    let n = 0;
    return (i) => function(o, s, u) {
      if (!s)
        return i.call(this, o, s, u);
      const _ = u && typeof u == "object" && u.once, c = function(...l) {
        let p;
        const E = l[0];
        if ((E == null ? void 0 : E.type) === "mousemove" && Date.now() - n < 100)
          return;
        n = Date.now(), E && (p = r._eventsSpanMap.get(E)), _ && r.removePatchedListener(this, o, s);
        const f = r._createSpan(E, p);
        return f ? (E && r._eventsSpanMap.set(E, f), O.with(N.setSpan(O.active(), f), () => {
          const S = r._invokeListener(s, this, l);
          return f.end(), S;
        })) : r._invokeListener(s, this, l);
      };
      if (r.addPatchedListener(this, o, s, c))
        return i.call(this, o, c, u);
    };
  }
  /**
   * This patches the removeEventListener of HTMLElement to handle the fact that
   * we patched the original callbacks
   */
  _patchRemoveEventListener() {
    const r = this;
    return (n) => function(a, o, s) {
      const u = r.removePatchedListener(this, a, o);
      return u ? n.call(this, a, u, s) : n.call(this, a, o, s);
    };
  }
  /**
   * Most browser provide event listener api via EventTarget in prototype chain.
   * Exception to this is IE 11 which has it on the prototypes closest to EventTarget:
   *
   * * - has addEventListener in IE
   * ** - has addEventListener in all other browsers
   * ! - missing in IE
   *
   * HTMLElement -> Element -> Node * -> EventTarget **! -> Object
   * Document -> Node * -> EventTarget **! -> Object
   * Window * -> WindowProperties ! -> EventTarget **! -> Object
   */
  _getPatchableEventTargets() {
    return window.EventTarget ? [EventTarget.prototype] : [Node.prototype, Window.prototype];
  }
  /**
   * Will try to end span when such span still exists.
   * @param span
   * @param endTime
   * @private
   */
  _tryToEndSpan(r, n) {
    r && this._spansData.get(r) && (r.end(n), this._spansData.delete(r));
  }
  /**
   * implements enable function
   */
  enable() {
    this._getPatchableEventTargets().forEach((n) => {
      te(n.addEventListener) && (this._unwrap(n, "addEventListener"), this._diag.debug("removing previous patch from method addEventListener")), te(n.removeEventListener) && (this._unwrap(n, "removeEventListener"), this._diag.debug("removing previous patch from method removeEventListener")), this._wrap(n, "addEventListener", this._patchAddEventListener()), this._wrap(n, "removeEventListener", this._patchRemoveEventListener());
    });
  }
  /**
   * implements unpatch function
   */
  disable() {
    this._getPatchableEventTargets().forEach((n) => {
      te(n.addEventListener) && this._unwrap(n, "addEventListener"), te(n.removeEventListener) && this._unwrap(n, "removeEventListener");
    });
  }
}
function wt(e, t) {
  if (!!!e)
    throw new Error(t);
}
function rv(e) {
  return typeof e == "object" && e !== null;
}
function nv(e, t) {
  if (!!!e)
    throw new Error(
      t != null ? t : "Unexpected invariant triggered."
    );
}
const iv = /\r\n|[\n\r]/g;
function zt(e, t) {
  let r = 0, n = 1;
  for (const i of e.body.matchAll(iv)) {
    if (typeof i.index == "number" || nv(!1), i.index >= t)
      break;
    r = i.index + i[0].length, n += 1;
  }
  return {
    line: n,
    column: t + 1 - r
  };
}
function av(e) {
  return ei(
    e.source,
    zt(e.source, e.start)
  );
}
function ei(e, t) {
  const r = e.locationOffset.column - 1, n = "".padStart(r) + e.body, i = t.line - 1, a = e.locationOffset.line - 1, o = t.line + a, s = t.line === 1 ? r : 0, u = t.column + s, _ = `${e.name}:${o}:${u}
`, c = n.split(/\r\n|[\n\r]/g), l = c[i];
  if (l.length > 120) {
    const p = Math.floor(u / 80), E = u % 80, f = [];
    for (let S = 0; S < l.length; S += 80)
      f.push(l.slice(S, S + 80));
    return _ + Yr([
      [`${o} |`, f[0]],
      ...f.slice(1, p + 1).map((S) => ["|", S]),
      ["|", "^".padStart(E)],
      ["|", f[p + 1]]
    ]);
  }
  return _ + Yr([
    // Lines specified like this: ["prefix", "string"],
    [`${o - 1} |`, c[i - 1]],
    [`${o} |`, l],
    ["|", "^".padStart(u)],
    [`${o + 1} |`, c[i + 1]]
  ]);
}
function Yr(e) {
  const t = e.filter(([n, i]) => i !== void 0), r = Math.max(...t.map(([n]) => n.length));
  return t.map(([n, i]) => n.padStart(r) + (i ? " " + i : "")).join(`
`);
}
function ov(e) {
  const t = e[0];
  return t == null || "kind" in t || "length" in t ? {
    nodes: t,
    source: e[1],
    positions: e[2],
    path: e[3],
    originalError: e[4],
    extensions: e[5]
  } : t;
}
class Ar extends Error {
  /**
   * An array of `{ line, column }` locations within the source GraphQL document
   * which correspond to this error.
   *
   * Errors during validation often contain multiple locations, for example to
   * point out two things with the same name. Errors during execution include a
   * single location, the field which produced the error.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  /**
   * An array describing the JSON-path into the execution response which
   * corresponds to this error. Only included for errors during execution.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  /**
   * An array of GraphQL AST Nodes corresponding to this error.
   */
  /**
   * The source GraphQL document for the first location of this error.
   *
   * Note that if this Error represents more than one node, the source may not
   * represent nodes after the first node.
   */
  /**
   * An array of character offsets within the source GraphQL document
   * which correspond to this error.
   */
  /**
   * The original error thrown from a field resolver during execution.
   */
  /**
   * Extension fields to add to the formatted error.
   */
  /**
   * @deprecated Please use the `GraphQLErrorOptions` constructor overload instead.
   */
  constructor(t, ...r) {
    var n, i, a;
    const { nodes: o, source: s, positions: u, path: _, originalError: c, extensions: l } = ov(r);
    super(t), this.name = "GraphQLError", this.path = _ != null ? _ : void 0, this.originalError = c != null ? c : void 0, this.nodes = jr(
      Array.isArray(o) ? o : o ? [o] : void 0
    );
    const p = jr(
      (n = this.nodes) === null || n === void 0 ? void 0 : n.map((f) => f.loc).filter((f) => f != null)
    );
    this.source = s != null ? s : p == null || (i = p[0]) === null || i === void 0 ? void 0 : i.source, this.positions = u != null ? u : p == null ? void 0 : p.map((f) => f.start), this.locations = u && s ? u.map((f) => zt(s, f)) : p == null ? void 0 : p.map((f) => zt(f.source, f.start));
    const E = rv(
      c == null ? void 0 : c.extensions
    ) ? c == null ? void 0 : c.extensions : void 0;
    this.extensions = (a = l != null ? l : E) !== null && a !== void 0 ? a : /* @__PURE__ */ Object.create(null), Object.defineProperties(this, {
      message: {
        writable: !0,
        enumerable: !0
      },
      name: {
        enumerable: !1
      },
      nodes: {
        enumerable: !1
      },
      source: {
        enumerable: !1
      },
      positions: {
        enumerable: !1
      },
      originalError: {
        enumerable: !1
      }
    }), c != null && c.stack ? Object.defineProperty(this, "stack", {
      value: c.stack,
      writable: !0,
      configurable: !0
    }) : Error.captureStackTrace ? Error.captureStackTrace(this, Ar) : Object.defineProperty(this, "stack", {
      value: Error().stack,
      writable: !0,
      configurable: !0
    });
  }
  get [Symbol.toStringTag]() {
    return "GraphQLError";
  }
  toString() {
    let t = this.message;
    if (this.nodes)
      for (const r of this.nodes)
        r.loc && (t += `

` + av(r.loc));
    else if (this.source && this.locations)
      for (const r of this.locations)
        t += `

` + ei(this.source, r);
    return t;
  }
  toJSON() {
    const t = {
      message: this.message
    };
    return this.locations != null && (t.locations = this.locations), this.path != null && (t.path = this.path), this.extensions != null && Object.keys(this.extensions).length > 0 && (t.extensions = this.extensions), t;
  }
}
function jr(e) {
  return e === void 0 || e.length === 0 ? void 0 : e;
}
function I(e, t, r) {
  return new Ar(`Syntax Error: ${r}`, {
    source: e,
    positions: [t]
  });
}
class sv {
  /**
   * The character offset at which this Node begins.
   */
  /**
   * The character offset at which this Node ends.
   */
  /**
   * The Token at which this Node begins.
   */
  /**
   * The Token at which this Node ends.
   */
  /**
   * The Source document the AST represents.
   */
  constructor(t, r, n) {
    this.start = t.start, this.end = r.end, this.startToken = t, this.endToken = r, this.source = n;
  }
  get [Symbol.toStringTag]() {
    return "Location";
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end
    };
  }
}
class ti {
  /**
   * The kind of Token.
   */
  /**
   * The character offset at which this Node begins.
   */
  /**
   * The character offset at which this Node ends.
   */
  /**
   * The 1-indexed line number on which this Token appears.
   */
  /**
   * The 1-indexed column number at which this Token begins.
   */
  /**
   * For non-punctuation tokens, represents the interpreted value of the token.
   *
   * Note: is undefined for punctuation tokens, but typed as string for
   * convenience in the parser.
   */
  /**
   * Tokens exist as nodes in a double-linked-list amongst all tokens
   * including ignored tokens. <SOF> is always the first node and <EOF>
   * the last.
   */
  constructor(t, r, n, i, a, o) {
    this.kind = t, this.start = r, this.end = n, this.line = i, this.column = a, this.value = o, this.prev = null, this.next = null;
  }
  get [Symbol.toStringTag]() {
    return "Token";
  }
  toJSON() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  }
}
const uv = {
  Name: [],
  Document: ["definitions"],
  OperationDefinition: [
    "name",
    "variableDefinitions",
    "directives",
    "selectionSet"
  ],
  VariableDefinition: ["variable", "type", "defaultValue", "directives"],
  Variable: ["name"],
  SelectionSet: ["selections"],
  Field: ["alias", "name", "arguments", "directives", "selectionSet"],
  Argument: ["name", "value"],
  FragmentSpread: ["name", "directives"],
  InlineFragment: ["typeCondition", "directives", "selectionSet"],
  FragmentDefinition: [
    "name",
    // Note: fragment variable definitions are deprecated and will removed in v17.0.0
    "variableDefinitions",
    "typeCondition",
    "directives",
    "selectionSet"
  ],
  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ["values"],
  ObjectValue: ["fields"],
  ObjectField: ["name", "value"],
  Directive: ["name", "arguments"],
  NamedType: ["name"],
  ListType: ["type"],
  NonNullType: ["type"],
  SchemaDefinition: ["description", "directives", "operationTypes"],
  OperationTypeDefinition: ["type"],
  ScalarTypeDefinition: ["description", "name", "directives"],
  ObjectTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  FieldDefinition: ["description", "name", "arguments", "type", "directives"],
  InputValueDefinition: [
    "description",
    "name",
    "type",
    "defaultValue",
    "directives"
  ],
  InterfaceTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  UnionTypeDefinition: ["description", "name", "directives", "types"],
  EnumTypeDefinition: ["description", "name", "directives", "values"],
  EnumValueDefinition: ["description", "name", "directives"],
  InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
  DirectiveDefinition: ["description", "name", "arguments", "locations"],
  SchemaExtension: ["directives", "operationTypes"],
  ScalarTypeExtension: ["name", "directives"],
  ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
  InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
  UnionTypeExtension: ["name", "directives", "types"],
  EnumTypeExtension: ["name", "directives", "values"],
  InputObjectTypeExtension: ["name", "directives", "fields"]
};
new Set(Object.keys(uv));
var de;
(function(e) {
  e.QUERY = "query", e.MUTATION = "mutation", e.SUBSCRIPTION = "subscription";
})(de || (de = {}));
var qt;
(function(e) {
  e.QUERY = "QUERY", e.MUTATION = "MUTATION", e.SUBSCRIPTION = "SUBSCRIPTION", e.FIELD = "FIELD", e.FRAGMENT_DEFINITION = "FRAGMENT_DEFINITION", e.FRAGMENT_SPREAD = "FRAGMENT_SPREAD", e.INLINE_FRAGMENT = "INLINE_FRAGMENT", e.VARIABLE_DEFINITION = "VARIABLE_DEFINITION", e.SCHEMA = "SCHEMA", e.SCALAR = "SCALAR", e.OBJECT = "OBJECT", e.FIELD_DEFINITION = "FIELD_DEFINITION", e.ARGUMENT_DEFINITION = "ARGUMENT_DEFINITION", e.INTERFACE = "INTERFACE", e.UNION = "UNION", e.ENUM = "ENUM", e.ENUM_VALUE = "ENUM_VALUE", e.INPUT_OBJECT = "INPUT_OBJECT", e.INPUT_FIELD_DEFINITION = "INPUT_FIELD_DEFINITION";
})(qt || (qt = {}));
var T;
(function(e) {
  e.NAME = "Name", e.DOCUMENT = "Document", e.OPERATION_DEFINITION = "OperationDefinition", e.VARIABLE_DEFINITION = "VariableDefinition", e.SELECTION_SET = "SelectionSet", e.FIELD = "Field", e.ARGUMENT = "Argument", e.FRAGMENT_SPREAD = "FragmentSpread", e.INLINE_FRAGMENT = "InlineFragment", e.FRAGMENT_DEFINITION = "FragmentDefinition", e.VARIABLE = "Variable", e.INT = "IntValue", e.FLOAT = "FloatValue", e.STRING = "StringValue", e.BOOLEAN = "BooleanValue", e.NULL = "NullValue", e.ENUM = "EnumValue", e.LIST = "ListValue", e.OBJECT = "ObjectValue", e.OBJECT_FIELD = "ObjectField", e.DIRECTIVE = "Directive", e.NAMED_TYPE = "NamedType", e.LIST_TYPE = "ListType", e.NON_NULL_TYPE = "NonNullType", e.SCHEMA_DEFINITION = "SchemaDefinition", e.OPERATION_TYPE_DEFINITION = "OperationTypeDefinition", e.SCALAR_TYPE_DEFINITION = "ScalarTypeDefinition", e.OBJECT_TYPE_DEFINITION = "ObjectTypeDefinition", e.FIELD_DEFINITION = "FieldDefinition", e.INPUT_VALUE_DEFINITION = "InputValueDefinition", e.INTERFACE_TYPE_DEFINITION = "InterfaceTypeDefinition", e.UNION_TYPE_DEFINITION = "UnionTypeDefinition", e.ENUM_TYPE_DEFINITION = "EnumTypeDefinition", e.ENUM_VALUE_DEFINITION = "EnumValueDefinition", e.INPUT_OBJECT_TYPE_DEFINITION = "InputObjectTypeDefinition", e.DIRECTIVE_DEFINITION = "DirectiveDefinition", e.SCHEMA_EXTENSION = "SchemaExtension", e.SCALAR_TYPE_EXTENSION = "ScalarTypeExtension", e.OBJECT_TYPE_EXTENSION = "ObjectTypeExtension", e.INTERFACE_TYPE_EXTENSION = "InterfaceTypeExtension", e.UNION_TYPE_EXTENSION = "UnionTypeExtension", e.ENUM_TYPE_EXTENSION = "EnumTypeExtension", e.INPUT_OBJECT_TYPE_EXTENSION = "InputObjectTypeExtension";
})(T || (T = {}));
function _v(e) {
  return e === 9 || e === 32;
}
function Be(e) {
  return e >= 48 && e <= 57;
}
function ri(e) {
  return e >= 97 && e <= 122 || // A-Z
  e >= 65 && e <= 90;
}
function ni(e) {
  return ri(e) || e === 95;
}
function cv(e) {
  return ri(e) || Be(e) || e === 95;
}
function dv(e) {
  var t;
  let r = Number.MAX_SAFE_INTEGER, n = null, i = -1;
  for (let o = 0; o < e.length; ++o) {
    var a;
    const s = e[o], u = lv(s);
    u !== s.length && (n = (a = n) !== null && a !== void 0 ? a : o, i = o, o !== 0 && u < r && (r = u));
  }
  return e.map((o, s) => s === 0 ? o : o.slice(r)).slice(
    (t = n) !== null && t !== void 0 ? t : 0,
    i + 1
  );
}
function lv(e) {
  let t = 0;
  for (; t < e.length && _v(e.charCodeAt(t)); )
    ++t;
  return t;
}
var d;
(function(e) {
  e.SOF = "<SOF>", e.EOF = "<EOF>", e.BANG = "!", e.DOLLAR = "$", e.AMP = "&", e.PAREN_L = "(", e.PAREN_R = ")", e.SPREAD = "...", e.COLON = ":", e.EQUALS = "=", e.AT = "@", e.BRACKET_L = "[", e.BRACKET_R = "]", e.BRACE_L = "{", e.PIPE = "|", e.BRACE_R = "}", e.NAME = "Name", e.INT = "Int", e.FLOAT = "Float", e.STRING = "String", e.BLOCK_STRING = "BlockString", e.COMMENT = "Comment";
})(d || (d = {}));
class pv {
  /**
   * The previously focused non-ignored token.
   */
  /**
   * The currently focused non-ignored token.
   */
  /**
   * The (1-indexed) line containing the current token.
   */
  /**
   * The character offset at which the current line begins.
   */
  constructor(t) {
    const r = new ti(d.SOF, 0, 0, 0, 0);
    this.source = t, this.lastToken = r, this.token = r, this.line = 1, this.lineStart = 0;
  }
  get [Symbol.toStringTag]() {
    return "Lexer";
  }
  /**
   * Advances the token stream to the next non-ignored token.
   */
  advance() {
    return this.lastToken = this.token, this.token = this.lookahead();
  }
  /**
   * Looks ahead and returns the next non-ignored token, but does not change
   * the state of Lexer.
   */
  lookahead() {
    let t = this.token;
    if (t.kind !== d.EOF)
      do
        if (t.next)
          t = t.next;
        else {
          const r = Ev(this, t.end);
          t.next = r, r.prev = t, t = r;
        }
      while (t.kind === d.COMMENT);
    return t;
  }
}
function fv(e) {
  return e === d.BANG || e === d.DOLLAR || e === d.AMP || e === d.PAREN_L || e === d.PAREN_R || e === d.SPREAD || e === d.COLON || e === d.EQUALS || e === d.AT || e === d.BRACKET_L || e === d.BRACKET_R || e === d.BRACE_L || e === d.PIPE || e === d.BRACE_R;
}
function Ae(e) {
  return e >= 0 && e <= 55295 || e >= 57344 && e <= 1114111;
}
function ht(e, t) {
  return ii(e.charCodeAt(t)) && ai(e.charCodeAt(t + 1));
}
function ii(e) {
  return e >= 55296 && e <= 56319;
}
function ai(e) {
  return e >= 56320 && e <= 57343;
}
function ie(e, t) {
  const r = e.source.body.codePointAt(t);
  if (r === void 0)
    return d.EOF;
  if (r >= 32 && r <= 126) {
    const n = String.fromCodePoint(r);
    return n === '"' ? `'"'` : `"${n}"`;
  }
  return "U+" + r.toString(16).toUpperCase().padStart(4, "0");
}
function g(e, t, r, n, i) {
  const a = e.line, o = 1 + r - e.lineStart;
  return new ti(t, r, n, a, o, i);
}
function Ev(e, t) {
  const r = e.source.body, n = r.length;
  let i = t;
  for (; i < n; ) {
    const a = r.charCodeAt(i);
    switch (a) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++i;
        continue;
      case 10:
        ++i, ++e.line, e.lineStart = i;
        continue;
      case 13:
        r.charCodeAt(i + 1) === 10 ? i += 2 : ++i, ++e.line, e.lineStart = i;
        continue;
      case 35:
        return Tv(e, i);
      case 33:
        return g(e, d.BANG, i, i + 1);
      case 36:
        return g(e, d.DOLLAR, i, i + 1);
      case 38:
        return g(e, d.AMP, i, i + 1);
      case 40:
        return g(e, d.PAREN_L, i, i + 1);
      case 41:
        return g(e, d.PAREN_R, i, i + 1);
      case 46:
        if (r.charCodeAt(i + 1) === 46 && r.charCodeAt(i + 2) === 46)
          return g(e, d.SPREAD, i, i + 3);
        break;
      case 58:
        return g(e, d.COLON, i, i + 1);
      case 61:
        return g(e, d.EQUALS, i, i + 1);
      case 64:
        return g(e, d.AT, i, i + 1);
      case 91:
        return g(e, d.BRACKET_L, i, i + 1);
      case 93:
        return g(e, d.BRACKET_R, i, i + 1);
      case 123:
        return g(e, d.BRACE_L, i, i + 1);
      case 124:
        return g(e, d.PIPE, i, i + 1);
      case 125:
        return g(e, d.BRACE_R, i, i + 1);
      case 34:
        return r.charCodeAt(i + 1) === 34 && r.charCodeAt(i + 2) === 34 ? mv(e, i) : vv(e, i);
    }
    if (Be(a) || a === 45)
      return hv(e, i, a);
    if (ni(a))
      return Nv(e, i);
    throw I(
      e.source,
      i,
      a === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : Ae(a) || ht(r, i) ? `Unexpected character: ${ie(e, i)}.` : `Invalid character: ${ie(e, i)}.`
    );
  }
  return g(e, d.EOF, n, n);
}
function Tv(e, t) {
  const r = e.source.body, n = r.length;
  let i = t + 1;
  for (; i < n; ) {
    const a = r.charCodeAt(i);
    if (a === 10 || a === 13)
      break;
    if (Ae(a))
      ++i;
    else if (ht(r, i))
      i += 2;
    else
      break;
  }
  return g(
    e,
    d.COMMENT,
    t,
    i,
    r.slice(t + 1, i)
  );
}
function hv(e, t, r) {
  const n = e.source.body;
  let i = t, a = r, o = !1;
  if (a === 45 && (a = n.charCodeAt(++i)), a === 48) {
    if (a = n.charCodeAt(++i), Be(a))
      throw I(
        e.source,
        i,
        `Invalid number, unexpected digit after 0: ${ie(
          e,
          i
        )}.`
      );
  } else
    i = xt(e, i, a), a = n.charCodeAt(i);
  if (a === 46 && (o = !0, a = n.charCodeAt(++i), i = xt(e, i, a), a = n.charCodeAt(i)), (a === 69 || a === 101) && (o = !0, a = n.charCodeAt(++i), (a === 43 || a === 45) && (a = n.charCodeAt(++i)), i = xt(e, i, a), a = n.charCodeAt(i)), a === 46 || ni(a))
    throw I(
      e.source,
      i,
      `Invalid number, expected digit but got: ${ie(
        e,
        i
      )}.`
    );
  return g(
    e,
    o ? d.FLOAT : d.INT,
    t,
    i,
    n.slice(t, i)
  );
}
function xt(e, t, r) {
  if (!Be(r))
    throw I(
      e.source,
      t,
      `Invalid number, expected digit but got: ${ie(
        e,
        t
      )}.`
    );
  const n = e.source.body;
  let i = t + 1;
  for (; Be(n.charCodeAt(i)); )
    ++i;
  return i;
}
function vv(e, t) {
  const r = e.source.body, n = r.length;
  let i = t + 1, a = i, o = "";
  for (; i < n; ) {
    const s = r.charCodeAt(i);
    if (s === 34)
      return o += r.slice(a, i), g(e, d.STRING, t, i + 1, o);
    if (s === 92) {
      o += r.slice(a, i);
      const u = r.charCodeAt(i + 1) === 117 ? r.charCodeAt(i + 2) === 123 ? Sv(e, i) : Av(e, i) : Ov(e, i);
      o += u.value, i += u.size, a = i;
      continue;
    }
    if (s === 10 || s === 13)
      break;
    if (Ae(s))
      ++i;
    else if (ht(r, i))
      i += 2;
    else
      throw I(
        e.source,
        i,
        `Invalid character within String: ${ie(
          e,
          i
        )}.`
      );
  }
  throw I(e.source, i, "Unterminated string.");
}
function Sv(e, t) {
  const r = e.source.body;
  let n = 0, i = 3;
  for (; i < 12; ) {
    const a = r.charCodeAt(t + i++);
    if (a === 125) {
      if (i < 5 || !Ae(n))
        break;
      return {
        value: String.fromCodePoint(n),
        size: i
      };
    }
    if (n = n << 4 | Re(a), n < 0)
      break;
  }
  throw I(
    e.source,
    t,
    `Invalid Unicode escape sequence: "${r.slice(
      t,
      t + i
    )}".`
  );
}
function Av(e, t) {
  const r = e.source.body, n = Xr(r, t + 2);
  if (Ae(n))
    return {
      value: String.fromCodePoint(n),
      size: 6
    };
  if (ii(n) && r.charCodeAt(t + 6) === 92 && r.charCodeAt(t + 7) === 117) {
    const i = Xr(r, t + 8);
    if (ai(i))
      return {
        value: String.fromCodePoint(n, i),
        size: 12
      };
  }
  throw I(
    e.source,
    t,
    `Invalid Unicode escape sequence: "${r.slice(t, t + 6)}".`
  );
}
function Xr(e, t) {
  return Re(e.charCodeAt(t)) << 12 | Re(e.charCodeAt(t + 1)) << 8 | Re(e.charCodeAt(t + 2)) << 4 | Re(e.charCodeAt(t + 3));
}
function Re(e) {
  return e >= 48 && e <= 57 ? e - 48 : e >= 65 && e <= 70 ? e - 55 : e >= 97 && e <= 102 ? e - 87 : -1;
}
function Ov(e, t) {
  const r = e.source.body;
  switch (r.charCodeAt(t + 1)) {
    case 34:
      return {
        value: '"',
        size: 2
      };
    case 92:
      return {
        value: "\\",
        size: 2
      };
    case 47:
      return {
        value: "/",
        size: 2
      };
    case 98:
      return {
        value: "\b",
        size: 2
      };
    case 102:
      return {
        value: "\f",
        size: 2
      };
    case 110:
      return {
        value: `
`,
        size: 2
      };
    case 114:
      return {
        value: "\r",
        size: 2
      };
    case 116:
      return {
        value: "	",
        size: 2
      };
  }
  throw I(
    e.source,
    t,
    `Invalid character escape sequence: "${r.slice(
      t,
      t + 2
    )}".`
  );
}
function mv(e, t) {
  const r = e.source.body, n = r.length;
  let i = e.lineStart, a = t + 3, o = a, s = "";
  const u = [];
  for (; a < n; ) {
    const _ = r.charCodeAt(a);
    if (_ === 34 && r.charCodeAt(a + 1) === 34 && r.charCodeAt(a + 2) === 34) {
      s += r.slice(o, a), u.push(s);
      const c = g(
        e,
        d.BLOCK_STRING,
        t,
        a + 3,
        // Return a string of the lines joined with U+000A.
        dv(u).join(`
`)
      );
      return e.line += u.length - 1, e.lineStart = i, c;
    }
    if (_ === 92 && r.charCodeAt(a + 1) === 34 && r.charCodeAt(a + 2) === 34 && r.charCodeAt(a + 3) === 34) {
      s += r.slice(o, a), o = a + 1, a += 4;
      continue;
    }
    if (_ === 10 || _ === 13) {
      s += r.slice(o, a), u.push(s), _ === 13 && r.charCodeAt(a + 1) === 10 ? a += 2 : ++a, s = "", o = a, i = a;
      continue;
    }
    if (Ae(_))
      ++a;
    else if (ht(r, a))
      a += 2;
    else
      throw I(
        e.source,
        a,
        `Invalid character within String: ${ie(
          e,
          a
        )}.`
      );
  }
  throw I(e.source, a, "Unterminated string.");
}
function Nv(e, t) {
  const r = e.source.body, n = r.length;
  let i = t + 1;
  for (; i < n; ) {
    const a = r.charCodeAt(i);
    if (cv(a))
      ++i;
    else
      break;
  }
  return g(
    e,
    d.NAME,
    t,
    i,
    r.slice(t, i)
  );
}
const Pv = 10, oi = 2;
function si(e) {
  return vt(e, []);
}
function vt(e, t) {
  switch (typeof e) {
    case "string":
      return JSON.stringify(e);
    case "function":
      return e.name ? `[function ${e.name}]` : "[function]";
    case "object":
      return yv(e, t);
    default:
      return String(e);
  }
}
function yv(e, t) {
  if (e === null)
    return "null";
  if (t.includes(e))
    return "[Circular]";
  const r = [...t, e];
  if (gv(e)) {
    const n = e.toJSON();
    if (n !== e)
      return typeof n == "string" ? n : vt(n, r);
  } else if (Array.isArray(e))
    return Mv(e, r);
  return Rv(e, r);
}
function gv(e) {
  return typeof e.toJSON == "function";
}
function Rv(e, t) {
  const r = Object.entries(e);
  return r.length === 0 ? "{}" : t.length > oi ? "[" + Iv(e) + "]" : "{ " + r.map(
    ([i, a]) => i + ": " + vt(a, t)
  ).join(", ") + " }";
}
function Mv(e, t) {
  if (e.length === 0)
    return "[]";
  if (t.length > oi)
    return "[Array]";
  const r = Math.min(Pv, e.length), n = e.length - r, i = [];
  for (let a = 0; a < r; ++a)
    i.push(vt(e[a], t));
  return n === 1 ? i.push("... 1 more item") : n > 1 && i.push(`... ${n} more items`), "[" + i.join(", ") + "]";
}
function Iv(e) {
  const t = Object.prototype.toString.call(e).replace(/^\[object /, "").replace(/]$/, "");
  if (t === "Object" && typeof e.constructor == "function") {
    const r = e.constructor.name;
    if (typeof r == "string" && r !== "")
      return r;
  }
  return t;
}
const Cv = (
  /* c8 ignore next 6 */
  // FIXME: https://github.com/graphql/graphql-js/issues/2317
  globalThis.process && globalThis.process.env.NODE_ENV === "production" ? function(t, r) {
    return t instanceof r;
  } : function(t, r) {
    if (t instanceof r)
      return !0;
    if (typeof t == "object" && t !== null) {
      var n;
      const i = r.prototype[Symbol.toStringTag], a = (
        // We still need to support constructor's name to detect conflicts with older versions of this library.
        Symbol.toStringTag in t ? t[Symbol.toStringTag] : (n = t.constructor) === null || n === void 0 ? void 0 : n.name
      );
      if (i === a) {
        const o = si(t);
        throw new Error(`Cannot use ${i} "${o}" from another module or realm.

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
  }
);
class ui {
  constructor(t, r = "GraphQL request", n = {
    line: 1,
    column: 1
  }) {
    typeof t == "string" || wt(!1, `Body must be a string. Received: ${si(t)}.`), this.body = t, this.name = r, this.locationOffset = n, this.locationOffset.line > 0 || wt(
      !1,
      "line in locationOffset is 1-indexed and must be positive."
    ), this.locationOffset.column > 0 || wt(
      !1,
      "column in locationOffset is 1-indexed and must be positive."
    );
  }
  get [Symbol.toStringTag]() {
    return "Source";
  }
}
function Lv(e) {
  return Cv(e, ui);
}
function Dv(e, t) {
  return new bv(e, t).parseDocument();
}
class bv {
  constructor(t, r = {}) {
    const n = Lv(t) ? t : new ui(t);
    this._lexer = new pv(n), this._options = r, this._tokenCounter = 0;
  }
  /**
   * Converts a name lex token into a name parse node.
   */
  parseName() {
    const t = this.expectToken(d.NAME);
    return this.node(t, {
      kind: T.NAME,
      value: t.value
    });
  }
  // Implements the parsing rules in the Document section.
  /**
   * Document : Definition+
   */
  parseDocument() {
    return this.node(this._lexer.token, {
      kind: T.DOCUMENT,
      definitions: this.many(
        d.SOF,
        this.parseDefinition,
        d.EOF
      )
    });
  }
  /**
   * Definition :
   *   - ExecutableDefinition
   *   - TypeSystemDefinition
   *   - TypeSystemExtension
   *
   * ExecutableDefinition :
   *   - OperationDefinition
   *   - FragmentDefinition
   *
   * TypeSystemDefinition :
   *   - SchemaDefinition
   *   - TypeDefinition
   *   - DirectiveDefinition
   *
   * TypeDefinition :
   *   - ScalarTypeDefinition
   *   - ObjectTypeDefinition
   *   - InterfaceTypeDefinition
   *   - UnionTypeDefinition
   *   - EnumTypeDefinition
   *   - InputObjectTypeDefinition
   */
  parseDefinition() {
    if (this.peek(d.BRACE_L))
      return this.parseOperationDefinition();
    const t = this.peekDescription(), r = t ? this._lexer.lookahead() : this._lexer.token;
    if (r.kind === d.NAME) {
      switch (r.value) {
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
      if (t)
        throw I(
          this._lexer.source,
          this._lexer.token.start,
          "Unexpected description, descriptions are supported only on type definitions."
        );
      switch (r.value) {
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
    throw this.unexpected(r);
  }
  // Implements the parsing rules in the Operations section.
  /**
   * OperationDefinition :
   *  - SelectionSet
   *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
   */
  parseOperationDefinition() {
    const t = this._lexer.token;
    if (this.peek(d.BRACE_L))
      return this.node(t, {
        kind: T.OPERATION_DEFINITION,
        operation: de.QUERY,
        name: void 0,
        variableDefinitions: [],
        directives: [],
        selectionSet: this.parseSelectionSet()
      });
    const r = this.parseOperationType();
    let n;
    return this.peek(d.NAME) && (n = this.parseName()), this.node(t, {
      kind: T.OPERATION_DEFINITION,
      operation: r,
      name: n,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(!1),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * OperationType : one of query mutation subscription
   */
  parseOperationType() {
    const t = this.expectToken(d.NAME);
    switch (t.value) {
      case "query":
        return de.QUERY;
      case "mutation":
        return de.MUTATION;
      case "subscription":
        return de.SUBSCRIPTION;
    }
    throw this.unexpected(t);
  }
  /**
   * VariableDefinitions : ( VariableDefinition+ )
   */
  parseVariableDefinitions() {
    return this.optionalMany(
      d.PAREN_L,
      this.parseVariableDefinition,
      d.PAREN_R
    );
  }
  /**
   * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
   */
  parseVariableDefinition() {
    return this.node(this._lexer.token, {
      kind: T.VARIABLE_DEFINITION,
      variable: this.parseVariable(),
      type: (this.expectToken(d.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(d.EQUALS) ? this.parseConstValueLiteral() : void 0,
      directives: this.parseConstDirectives()
    });
  }
  /**
   * Variable : $ Name
   */
  parseVariable() {
    const t = this._lexer.token;
    return this.expectToken(d.DOLLAR), this.node(t, {
      kind: T.VARIABLE,
      name: this.parseName()
    });
  }
  /**
   * ```
   * SelectionSet : { Selection+ }
   * ```
   */
  parseSelectionSet() {
    return this.node(this._lexer.token, {
      kind: T.SELECTION_SET,
      selections: this.many(
        d.BRACE_L,
        this.parseSelection,
        d.BRACE_R
      )
    });
  }
  /**
   * Selection :
   *   - Field
   *   - FragmentSpread
   *   - InlineFragment
   */
  parseSelection() {
    return this.peek(d.SPREAD) ? this.parseFragment() : this.parseField();
  }
  /**
   * Field : Alias? Name Arguments? Directives? SelectionSet?
   *
   * Alias : Name :
   */
  parseField() {
    const t = this._lexer.token, r = this.parseName();
    let n, i;
    return this.expectOptionalToken(d.COLON) ? (n = r, i = this.parseName()) : i = r, this.node(t, {
      kind: T.FIELD,
      alias: n,
      name: i,
      arguments: this.parseArguments(!1),
      directives: this.parseDirectives(!1),
      selectionSet: this.peek(d.BRACE_L) ? this.parseSelectionSet() : void 0
    });
  }
  /**
   * Arguments[Const] : ( Argument[?Const]+ )
   */
  parseArguments(t) {
    const r = t ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(d.PAREN_L, r, d.PAREN_R);
  }
  /**
   * Argument[Const] : Name : Value[?Const]
   */
  parseArgument(t = !1) {
    const r = this._lexer.token, n = this.parseName();
    return this.expectToken(d.COLON), this.node(r, {
      kind: T.ARGUMENT,
      name: n,
      value: this.parseValueLiteral(t)
    });
  }
  parseConstArgument() {
    return this.parseArgument(!0);
  }
  // Implements the parsing rules in the Fragments section.
  /**
   * Corresponds to both FragmentSpread and InlineFragment in the spec.
   *
   * FragmentSpread : ... FragmentName Directives?
   *
   * InlineFragment : ... TypeCondition? Directives? SelectionSet
   */
  parseFragment() {
    const t = this._lexer.token;
    this.expectToken(d.SPREAD);
    const r = this.expectOptionalKeyword("on");
    return !r && this.peek(d.NAME) ? this.node(t, {
      kind: T.FRAGMENT_SPREAD,
      name: this.parseFragmentName(),
      directives: this.parseDirectives(!1)
    }) : this.node(t, {
      kind: T.INLINE_FRAGMENT,
      typeCondition: r ? this.parseNamedType() : void 0,
      directives: this.parseDirectives(!1),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * FragmentDefinition :
   *   - fragment FragmentName on TypeCondition Directives? SelectionSet
   *
   * TypeCondition : NamedType
   */
  parseFragmentDefinition() {
    const t = this._lexer.token;
    return this.expectKeyword("fragment"), this._options.allowLegacyFragmentVariables === !0 ? this.node(t, {
      kind: T.FRAGMENT_DEFINITION,
      name: this.parseFragmentName(),
      variableDefinitions: this.parseVariableDefinitions(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(!1),
      selectionSet: this.parseSelectionSet()
    }) : this.node(t, {
      kind: T.FRAGMENT_DEFINITION,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(!1),
      selectionSet: this.parseSelectionSet()
    });
  }
  /**
   * FragmentName : Name but not `on`
   */
  parseFragmentName() {
    if (this._lexer.token.value === "on")
      throw this.unexpected();
    return this.parseName();
  }
  // Implements the parsing rules in the Values section.
  /**
   * Value[Const] :
   *   - [~Const] Variable
   *   - IntValue
   *   - FloatValue
   *   - StringValue
   *   - BooleanValue
   *   - NullValue
   *   - EnumValue
   *   - ListValue[?Const]
   *   - ObjectValue[?Const]
   *
   * BooleanValue : one of `true` `false`
   *
   * NullValue : `null`
   *
   * EnumValue : Name but not `true`, `false` or `null`
   */
  parseValueLiteral(t) {
    const r = this._lexer.token;
    switch (r.kind) {
      case d.BRACKET_L:
        return this.parseList(t);
      case d.BRACE_L:
        return this.parseObject(t);
      case d.INT:
        return this.advanceLexer(), this.node(r, {
          kind: T.INT,
          value: r.value
        });
      case d.FLOAT:
        return this.advanceLexer(), this.node(r, {
          kind: T.FLOAT,
          value: r.value
        });
      case d.STRING:
      case d.BLOCK_STRING:
        return this.parseStringLiteral();
      case d.NAME:
        switch (this.advanceLexer(), r.value) {
          case "true":
            return this.node(r, {
              kind: T.BOOLEAN,
              value: !0
            });
          case "false":
            return this.node(r, {
              kind: T.BOOLEAN,
              value: !1
            });
          case "null":
            return this.node(r, {
              kind: T.NULL
            });
          default:
            return this.node(r, {
              kind: T.ENUM,
              value: r.value
            });
        }
      case d.DOLLAR:
        if (t)
          if (this.expectToken(d.DOLLAR), this._lexer.token.kind === d.NAME) {
            const n = this._lexer.token.value;
            throw I(
              this._lexer.source,
              r.start,
              `Unexpected variable "$${n}" in constant value.`
            );
          } else
            throw this.unexpected(r);
        return this.parseVariable();
      default:
        throw this.unexpected();
    }
  }
  parseConstValueLiteral() {
    return this.parseValueLiteral(!0);
  }
  parseStringLiteral() {
    const t = this._lexer.token;
    return this.advanceLexer(), this.node(t, {
      kind: T.STRING,
      value: t.value,
      block: t.kind === d.BLOCK_STRING
    });
  }
  /**
   * ListValue[Const] :
   *   - [ ]
   *   - [ Value[?Const]+ ]
   */
  parseList(t) {
    const r = () => this.parseValueLiteral(t);
    return this.node(this._lexer.token, {
      kind: T.LIST,
      values: this.any(d.BRACKET_L, r, d.BRACKET_R)
    });
  }
  /**
   * ```
   * ObjectValue[Const] :
   *   - { }
   *   - { ObjectField[?Const]+ }
   * ```
   */
  parseObject(t) {
    const r = () => this.parseObjectField(t);
    return this.node(this._lexer.token, {
      kind: T.OBJECT,
      fields: this.any(d.BRACE_L, r, d.BRACE_R)
    });
  }
  /**
   * ObjectField[Const] : Name : Value[?Const]
   */
  parseObjectField(t) {
    const r = this._lexer.token, n = this.parseName();
    return this.expectToken(d.COLON), this.node(r, {
      kind: T.OBJECT_FIELD,
      name: n,
      value: this.parseValueLiteral(t)
    });
  }
  // Implements the parsing rules in the Directives section.
  /**
   * Directives[Const] : Directive[?Const]+
   */
  parseDirectives(t) {
    const r = [];
    for (; this.peek(d.AT); )
      r.push(this.parseDirective(t));
    return r;
  }
  parseConstDirectives() {
    return this.parseDirectives(!0);
  }
  /**
   * ```
   * Directive[Const] : @ Name Arguments[?Const]?
   * ```
   */
  parseDirective(t) {
    const r = this._lexer.token;
    return this.expectToken(d.AT), this.node(r, {
      kind: T.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(t)
    });
  }
  // Implements the parsing rules in the Types section.
  /**
   * Type :
   *   - NamedType
   *   - ListType
   *   - NonNullType
   */
  parseTypeReference() {
    const t = this._lexer.token;
    let r;
    if (this.expectOptionalToken(d.BRACKET_L)) {
      const n = this.parseTypeReference();
      this.expectToken(d.BRACKET_R), r = this.node(t, {
        kind: T.LIST_TYPE,
        type: n
      });
    } else
      r = this.parseNamedType();
    return this.expectOptionalToken(d.BANG) ? this.node(t, {
      kind: T.NON_NULL_TYPE,
      type: r
    }) : r;
  }
  /**
   * NamedType : Name
   */
  parseNamedType() {
    return this.node(this._lexer.token, {
      kind: T.NAMED_TYPE,
      name: this.parseName()
    });
  }
  // Implements the parsing rules in the Type Definition section.
  peekDescription() {
    return this.peek(d.STRING) || this.peek(d.BLOCK_STRING);
  }
  /**
   * Description : StringValue
   */
  parseDescription() {
    if (this.peekDescription())
      return this.parseStringLiteral();
  }
  /**
   * ```
   * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
   * ```
   */
  parseSchemaDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("schema");
    const n = this.parseConstDirectives(), i = this.many(
      d.BRACE_L,
      this.parseOperationTypeDefinition,
      d.BRACE_R
    );
    return this.node(t, {
      kind: T.SCHEMA_DEFINITION,
      description: r,
      directives: n,
      operationTypes: i
    });
  }
  /**
   * OperationTypeDefinition : OperationType : NamedType
   */
  parseOperationTypeDefinition() {
    const t = this._lexer.token, r = this.parseOperationType();
    this.expectToken(d.COLON);
    const n = this.parseNamedType();
    return this.node(t, {
      kind: T.OPERATION_TYPE_DEFINITION,
      operation: r,
      type: n
    });
  }
  /**
   * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
   */
  parseScalarTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("scalar");
    const n = this.parseName(), i = this.parseConstDirectives();
    return this.node(t, {
      kind: T.SCALAR_TYPE_DEFINITION,
      description: r,
      name: n,
      directives: i
    });
  }
  /**
   * ObjectTypeDefinition :
   *   Description?
   *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
   */
  parseObjectTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("type");
    const n = this.parseName(), i = this.parseImplementsInterfaces(), a = this.parseConstDirectives(), o = this.parseFieldsDefinition();
    return this.node(t, {
      kind: T.OBJECT_TYPE_DEFINITION,
      description: r,
      name: n,
      interfaces: i,
      directives: a,
      fields: o
    });
  }
  /**
   * ImplementsInterfaces :
   *   - implements `&`? NamedType
   *   - ImplementsInterfaces & NamedType
   */
  parseImplementsInterfaces() {
    return this.expectOptionalKeyword("implements") ? this.delimitedMany(d.AMP, this.parseNamedType) : [];
  }
  /**
   * ```
   * FieldsDefinition : { FieldDefinition+ }
   * ```
   */
  parseFieldsDefinition() {
    return this.optionalMany(
      d.BRACE_L,
      this.parseFieldDefinition,
      d.BRACE_R
    );
  }
  /**
   * FieldDefinition :
   *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
   */
  parseFieldDefinition() {
    const t = this._lexer.token, r = this.parseDescription(), n = this.parseName(), i = this.parseArgumentDefs();
    this.expectToken(d.COLON);
    const a = this.parseTypeReference(), o = this.parseConstDirectives();
    return this.node(t, {
      kind: T.FIELD_DEFINITION,
      description: r,
      name: n,
      arguments: i,
      type: a,
      directives: o
    });
  }
  /**
   * ArgumentsDefinition : ( InputValueDefinition+ )
   */
  parseArgumentDefs() {
    return this.optionalMany(
      d.PAREN_L,
      this.parseInputValueDef,
      d.PAREN_R
    );
  }
  /**
   * InputValueDefinition :
   *   - Description? Name : Type DefaultValue? Directives[Const]?
   */
  parseInputValueDef() {
    const t = this._lexer.token, r = this.parseDescription(), n = this.parseName();
    this.expectToken(d.COLON);
    const i = this.parseTypeReference();
    let a;
    this.expectOptionalToken(d.EQUALS) && (a = this.parseConstValueLiteral());
    const o = this.parseConstDirectives();
    return this.node(t, {
      kind: T.INPUT_VALUE_DEFINITION,
      description: r,
      name: n,
      type: i,
      defaultValue: a,
      directives: o
    });
  }
  /**
   * InterfaceTypeDefinition :
   *   - Description? interface Name Directives[Const]? FieldsDefinition?
   */
  parseInterfaceTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("interface");
    const n = this.parseName(), i = this.parseImplementsInterfaces(), a = this.parseConstDirectives(), o = this.parseFieldsDefinition();
    return this.node(t, {
      kind: T.INTERFACE_TYPE_DEFINITION,
      description: r,
      name: n,
      interfaces: i,
      directives: a,
      fields: o
    });
  }
  /**
   * UnionTypeDefinition :
   *   - Description? union Name Directives[Const]? UnionMemberTypes?
   */
  parseUnionTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("union");
    const n = this.parseName(), i = this.parseConstDirectives(), a = this.parseUnionMemberTypes();
    return this.node(t, {
      kind: T.UNION_TYPE_DEFINITION,
      description: r,
      name: n,
      directives: i,
      types: a
    });
  }
  /**
   * UnionMemberTypes :
   *   - = `|`? NamedType
   *   - UnionMemberTypes | NamedType
   */
  parseUnionMemberTypes() {
    return this.expectOptionalToken(d.EQUALS) ? this.delimitedMany(d.PIPE, this.parseNamedType) : [];
  }
  /**
   * EnumTypeDefinition :
   *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
   */
  parseEnumTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("enum");
    const n = this.parseName(), i = this.parseConstDirectives(), a = this.parseEnumValuesDefinition();
    return this.node(t, {
      kind: T.ENUM_TYPE_DEFINITION,
      description: r,
      name: n,
      directives: i,
      values: a
    });
  }
  /**
   * ```
   * EnumValuesDefinition : { EnumValueDefinition+ }
   * ```
   */
  parseEnumValuesDefinition() {
    return this.optionalMany(
      d.BRACE_L,
      this.parseEnumValueDefinition,
      d.BRACE_R
    );
  }
  /**
   * EnumValueDefinition : Description? EnumValue Directives[Const]?
   */
  parseEnumValueDefinition() {
    const t = this._lexer.token, r = this.parseDescription(), n = this.parseEnumValueName(), i = this.parseConstDirectives();
    return this.node(t, {
      kind: T.ENUM_VALUE_DEFINITION,
      description: r,
      name: n,
      directives: i
    });
  }
  /**
   * EnumValue : Name but not `true`, `false` or `null`
   */
  parseEnumValueName() {
    if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null")
      throw I(
        this._lexer.source,
        this._lexer.token.start,
        `${We(
          this._lexer.token
        )} is reserved and cannot be used for an enum value.`
      );
    return this.parseName();
  }
  /**
   * InputObjectTypeDefinition :
   *   - Description? input Name Directives[Const]? InputFieldsDefinition?
   */
  parseInputObjectTypeDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("input");
    const n = this.parseName(), i = this.parseConstDirectives(), a = this.parseInputFieldsDefinition();
    return this.node(t, {
      kind: T.INPUT_OBJECT_TYPE_DEFINITION,
      description: r,
      name: n,
      directives: i,
      fields: a
    });
  }
  /**
   * ```
   * InputFieldsDefinition : { InputValueDefinition+ }
   * ```
   */
  parseInputFieldsDefinition() {
    return this.optionalMany(
      d.BRACE_L,
      this.parseInputValueDef,
      d.BRACE_R
    );
  }
  /**
   * TypeSystemExtension :
   *   - SchemaExtension
   *   - TypeExtension
   *
   * TypeExtension :
   *   - ScalarTypeExtension
   *   - ObjectTypeExtension
   *   - InterfaceTypeExtension
   *   - UnionTypeExtension
   *   - EnumTypeExtension
   *   - InputObjectTypeDefinition
   */
  parseTypeSystemExtension() {
    const t = this._lexer.lookahead();
    if (t.kind === d.NAME)
      switch (t.value) {
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
    throw this.unexpected(t);
  }
  /**
   * ```
   * SchemaExtension :
   *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
   *  - extend schema Directives[Const]
   * ```
   */
  parseSchemaExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("schema");
    const r = this.parseConstDirectives(), n = this.optionalMany(
      d.BRACE_L,
      this.parseOperationTypeDefinition,
      d.BRACE_R
    );
    if (r.length === 0 && n.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.SCHEMA_EXTENSION,
      directives: r,
      operationTypes: n
    });
  }
  /**
   * ScalarTypeExtension :
   *   - extend scalar Name Directives[Const]
   */
  parseScalarTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("scalar");
    const r = this.parseName(), n = this.parseConstDirectives();
    if (n.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.SCALAR_TYPE_EXTENSION,
      name: r,
      directives: n
    });
  }
  /**
   * ObjectTypeExtension :
   *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
   *  - extend type Name ImplementsInterfaces? Directives[Const]
   *  - extend type Name ImplementsInterfaces
   */
  parseObjectTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("type");
    const r = this.parseName(), n = this.parseImplementsInterfaces(), i = this.parseConstDirectives(), a = this.parseFieldsDefinition();
    if (n.length === 0 && i.length === 0 && a.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.OBJECT_TYPE_EXTENSION,
      name: r,
      interfaces: n,
      directives: i,
      fields: a
    });
  }
  /**
   * InterfaceTypeExtension :
   *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
   *  - extend interface Name ImplementsInterfaces? Directives[Const]
   *  - extend interface Name ImplementsInterfaces
   */
  parseInterfaceTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("interface");
    const r = this.parseName(), n = this.parseImplementsInterfaces(), i = this.parseConstDirectives(), a = this.parseFieldsDefinition();
    if (n.length === 0 && i.length === 0 && a.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.INTERFACE_TYPE_EXTENSION,
      name: r,
      interfaces: n,
      directives: i,
      fields: a
    });
  }
  /**
   * UnionTypeExtension :
   *   - extend union Name Directives[Const]? UnionMemberTypes
   *   - extend union Name Directives[Const]
   */
  parseUnionTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("union");
    const r = this.parseName(), n = this.parseConstDirectives(), i = this.parseUnionMemberTypes();
    if (n.length === 0 && i.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.UNION_TYPE_EXTENSION,
      name: r,
      directives: n,
      types: i
    });
  }
  /**
   * EnumTypeExtension :
   *   - extend enum Name Directives[Const]? EnumValuesDefinition
   *   - extend enum Name Directives[Const]
   */
  parseEnumTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("enum");
    const r = this.parseName(), n = this.parseConstDirectives(), i = this.parseEnumValuesDefinition();
    if (n.length === 0 && i.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.ENUM_TYPE_EXTENSION,
      name: r,
      directives: n,
      values: i
    });
  }
  /**
   * InputObjectTypeExtension :
   *   - extend input Name Directives[Const]? InputFieldsDefinition
   *   - extend input Name Directives[Const]
   */
  parseInputObjectTypeExtension() {
    const t = this._lexer.token;
    this.expectKeyword("extend"), this.expectKeyword("input");
    const r = this.parseName(), n = this.parseConstDirectives(), i = this.parseInputFieldsDefinition();
    if (n.length === 0 && i.length === 0)
      throw this.unexpected();
    return this.node(t, {
      kind: T.INPUT_OBJECT_TYPE_EXTENSION,
      name: r,
      directives: n,
      fields: i
    });
  }
  /**
   * ```
   * DirectiveDefinition :
   *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
   * ```
   */
  parseDirectiveDefinition() {
    const t = this._lexer.token, r = this.parseDescription();
    this.expectKeyword("directive"), this.expectToken(d.AT);
    const n = this.parseName(), i = this.parseArgumentDefs(), a = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    const o = this.parseDirectiveLocations();
    return this.node(t, {
      kind: T.DIRECTIVE_DEFINITION,
      description: r,
      name: n,
      arguments: i,
      repeatable: a,
      locations: o
    });
  }
  /**
   * DirectiveLocations :
   *   - `|`? DirectiveLocation
   *   - DirectiveLocations | DirectiveLocation
   */
  parseDirectiveLocations() {
    return this.delimitedMany(d.PIPE, this.parseDirectiveLocation);
  }
  /*
   * DirectiveLocation :
   *   - ExecutableDirectiveLocation
   *   - TypeSystemDirectiveLocation
   *
   * ExecutableDirectiveLocation : one of
   *   `QUERY`
   *   `MUTATION`
   *   `SUBSCRIPTION`
   *   `FIELD`
   *   `FRAGMENT_DEFINITION`
   *   `FRAGMENT_SPREAD`
   *   `INLINE_FRAGMENT`
   *
   * TypeSystemDirectiveLocation : one of
   *   `SCHEMA`
   *   `SCALAR`
   *   `OBJECT`
   *   `FIELD_DEFINITION`
   *   `ARGUMENT_DEFINITION`
   *   `INTERFACE`
   *   `UNION`
   *   `ENUM`
   *   `ENUM_VALUE`
   *   `INPUT_OBJECT`
   *   `INPUT_FIELD_DEFINITION`
   */
  parseDirectiveLocation() {
    const t = this._lexer.token, r = this.parseName();
    if (Object.prototype.hasOwnProperty.call(qt, r.value))
      return r;
    throw this.unexpected(t);
  }
  // Core parsing utility functions
  /**
   * Returns a node that, if configured to do so, sets a "loc" field as a
   * location object, used to identify the place in the source that created a
   * given parsed object.
   */
  node(t, r) {
    return this._options.noLocation !== !0 && (r.loc = new sv(
      t,
      this._lexer.lastToken,
      this._lexer.source
    )), r;
  }
  /**
   * Determines if the next token is of a given kind
   */
  peek(t) {
    return this._lexer.token.kind === t;
  }
  /**
   * If the next token is of the given kind, return that token after advancing the lexer.
   * Otherwise, do not change the parser state and throw an error.
   */
  expectToken(t) {
    const r = this._lexer.token;
    if (r.kind === t)
      return this.advanceLexer(), r;
    throw I(
      this._lexer.source,
      r.start,
      `Expected ${_i(t)}, found ${We(r)}.`
    );
  }
  /**
   * If the next token is of the given kind, return "true" after advancing the lexer.
   * Otherwise, do not change the parser state and return "false".
   */
  expectOptionalToken(t) {
    return this._lexer.token.kind === t ? (this.advanceLexer(), !0) : !1;
  }
  /**
   * If the next token is a given keyword, advance the lexer.
   * Otherwise, do not change the parser state and throw an error.
   */
  expectKeyword(t) {
    const r = this._lexer.token;
    if (r.kind === d.NAME && r.value === t)
      this.advanceLexer();
    else
      throw I(
        this._lexer.source,
        r.start,
        `Expected "${t}", found ${We(r)}.`
      );
  }
  /**
   * If the next token is a given keyword, return "true" after advancing the lexer.
   * Otherwise, do not change the parser state and return "false".
   */
  expectOptionalKeyword(t) {
    const r = this._lexer.token;
    return r.kind === d.NAME && r.value === t ? (this.advanceLexer(), !0) : !1;
  }
  /**
   * Helper function for creating an error when an unexpected lexed token is encountered.
   */
  unexpected(t) {
    const r = t != null ? t : this._lexer.token;
    return I(
      this._lexer.source,
      r.start,
      `Unexpected ${We(r)}.`
    );
  }
  /**
   * Returns a possibly empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  any(t, r, n) {
    this.expectToken(t);
    const i = [];
    for (; !this.expectOptionalToken(n); )
      i.push(r.call(this));
    return i;
  }
  /**
   * Returns a list of parse nodes, determined by the parseFn.
   * It can be empty only if open token is missing otherwise it will always return non-empty list
   * that begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  optionalMany(t, r, n) {
    if (this.expectOptionalToken(t)) {
      const i = [];
      do
        i.push(r.call(this));
      while (!this.expectOptionalToken(n));
      return i;
    }
    return [];
  }
  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list begins with a lex token of openKind and ends with a lex token of closeKind.
   * Advances the parser to the next lex token after the closing token.
   */
  many(t, r, n) {
    this.expectToken(t);
    const i = [];
    do
      i.push(r.call(this));
    while (!this.expectOptionalToken(n));
    return i;
  }
  /**
   * Returns a non-empty list of parse nodes, determined by the parseFn.
   * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
   * Advances the parser to the next lex token after last item in the list.
   */
  delimitedMany(t, r) {
    this.expectOptionalToken(t);
    const n = [];
    do
      n.push(r.call(this));
    while (this.expectOptionalToken(t));
    return n;
  }
  advanceLexer() {
    const { maxTokens: t } = this._options, r = this._lexer.advance();
    if (t !== void 0 && r.kind !== d.EOF && (++this._tokenCounter, this._tokenCounter > t))
      throw I(
        this._lexer.source,
        r.start,
        `Document contains more that ${t} tokens. Parsing aborted.`
      );
  }
}
function We(e) {
  const t = e.value;
  return _i(e.kind) + (t != null ? ` "${t}"` : "");
}
function _i(e) {
  return fv(e) ? `"${e}"` : e;
}
function wv(e) {
  return e === void 0 && (e = {}), typeof e.addEventListener == "function" && typeof e.removeEventListener == "function";
}
var Wr = "OT_ZONE_CONTEXT", xv = (
  /** @class */
  function() {
    function e() {
      this._enabled = !1, this._zoneCounter = 0;
    }
    return e.prototype._activeContextFromZone = function(t) {
      return t && t.get(Wr) || G;
    }, e.prototype._bindFunction = function(t, r) {
      var n = this, i = function() {
        for (var a = this, o = [], s = 0; s < arguments.length; s++)
          o[s] = arguments[s];
        return n.with(t, function() {
          return r.apply(a, o);
        });
      };
      return Object.defineProperty(i, "length", {
        enumerable: !1,
        configurable: !0,
        writable: !1,
        value: r.length
      }), i;
    }, e.prototype._bindListener = function(t, r) {
      var n = r;
      return n.__ot_listeners !== void 0 || (n.__ot_listeners = {}, typeof n.addEventListener == "function" && (n.addEventListener = this._patchAddEventListener(n, n.addEventListener, t)), typeof n.removeEventListener == "function" && (n.removeEventListener = this._patchRemoveEventListener(n, n.removeEventListener))), r;
    }, e.prototype._createZoneName = function() {
      this._zoneCounter++;
      var t = Math.random();
      return this._zoneCounter + "-" + t;
    }, e.prototype._createZone = function(t, r) {
      var n;
      return Zone.current.fork({
        name: t,
        properties: (n = {}, n[Wr] = r, n)
      });
    }, e.prototype._getActiveZone = function() {
      return Zone.current;
    }, e.prototype._patchAddEventListener = function(t, r, n) {
      var i = this;
      return function(a, o, s) {
        t.__ot_listeners === void 0 && (t.__ot_listeners = {});
        var u = t.__ot_listeners[a];
        u === void 0 && (u = /* @__PURE__ */ new WeakMap(), t.__ot_listeners[a] = u);
        var _ = i.bind(n, o);
        return u.set(o, _), r.call(this, a, _, s);
      };
    }, e.prototype._patchRemoveEventListener = function(t, r) {
      return function(n, i) {
        if (t.__ot_listeners === void 0 || t.__ot_listeners[n] === void 0)
          return r.call(this, n, i);
        var a = t.__ot_listeners[n], o = a.get(i);
        return a.delete(i), r.call(this, n, o || i);
      };
    }, e.prototype.active = function() {
      if (!this._enabled)
        return G;
      var t = this._getActiveZone(), r = this._activeContextFromZone(t);
      return r || G;
    }, e.prototype.bind = function(t, r) {
      return t === void 0 && (t = this.active()), typeof r == "function" ? this._bindFunction(t, r) : (wv(r) && this._bindListener(t, r), r);
    }, e.prototype.disable = function() {
      return this._enabled = !1, this;
    }, e.prototype.enable = function() {
      return this._enabled = !0, this;
    }, e.prototype.with = function(t, r, n) {
      for (var i = [], a = 3; a < arguments.length; a++)
        i[a - 3] = arguments[a];
      var o = this._createZoneName(), s = this._createZone(o, t);
      return s.run(r, n, i);
    }, e;
  }()
), Kr = { BASE_URL: "/", MODE: "production", DEV: !1, PROD: !0, SSR: !1 };
let B;
const kv = (e) => {
  var u, _, c, l;
  if (B !== void 0) {
    console.warn("OTEL already initialized. Skipping...");
    return;
  }
  const t = e.backendUrl || Kr.REACT_APP_PUBLIC_GRAPH_URI || "https://pub.highlight.run", r = [
    ...(u = e.urlBlocklist) != null ? u : [],
    ...Jr
  ], n = Kr.DEBUG === "true", i = (_ = e.endpoint) != null ? _ : "https://otel.highlight.io:4318", a = (c = e.environment) != null ? c : "production";
  B = new jd({
    resource: new jt({
      [zh]: (l = e.serviceName) != null ? l : "highlight-browser",
      [Kh]: a,
      "highlight.project_id": e.projectId,
      "highlight.session_id": e.sessionSecureId
    })
  }), B.register({
    propagator: new fr({
      propagators: [
        new cr(),
        new Er()
      ]
    })
  }), n && B.addSpanProcessor(new kd(new Ud()));
  const o = new jh({
    url: i + "/v1/traces",
    concurrencyLimit: 10,
    // Using any because we were getting an error importing CompressionAlgorithm
    // from @opentelemetry/otlp-exporter-base.
    compression: "gzip"
  }), s = new Bv(o, {
    backendUrl: t,
    urlBlocklist: r,
    tracingOrigins: e.tracingOrigins
  });
  B.addSpanProcessor(s), B.addSpanProcessor(new Bn(o)), al({
    instrumentations: [
      new fl(),
      new tv(),
      new $f({
        propagateTraceHeaderCorsUrls: /.*/,
        applyCustomAttributesOnSpan: (p, E, f) => Ot(void 0, null, function* () {
          var m, C, ae;
          const S = p.attributes["http.url"], R = (m = E.method) != null ? m : "GET";
          if (p.updateName(zr(S, R, E.body)), !(f instanceof Response)) {
            p.setAttributes({
              "http.response.error": f.message,
              "http.response.status": f.status
            });
            return;
          }
          qr(p, E.body, E.headers, e.networkRecordingOptions);
          const A = yield fi(f, (C = e.networkRecordingOptions) == null ? void 0 : C.bodyKeysToRecord, (ae = e.networkRecordingOptions) == null ? void 0 : ae.networkBodyKeysToRedact);
          p.setAttribute("http.response.body", A);
        })
      }),
      new _h({
        propagateTraceHeaderCorsUrls: /.*/,
        applyCustomAttributesOnSpan: (p, E) => {
          var A, m;
          const f = E, S = zr(f._url, f._method, E.responseText);
          p.updateName(S), qr(p, f._body, f._requestHeaders, e.networkRecordingOptions);
          const R = Ei(f._body, (A = e.networkRecordingOptions) == null ? void 0 : A.networkBodyKeysToRedact, (m = e.networkRecordingOptions) == null ? void 0 : m.bodyKeysToRecord, f._requestHeaders);
          p.setAttribute("http.request.body", R);
        }
      })
    ]
  }), B.register({
    contextManager: new xv()
  });
};
class Bv extends Zn {
  constructor(r, n) {
    var i, a, o;
    super(r);
    H(this, "backendUrl");
    H(this, "urlBlocklist");
    H(this, "tracingOrigins");
    this.backendUrl = (i = n.backendUrl) != null ? i : "", this.urlBlocklist = (a = n.urlBlocklist) != null ? a : Jr, this.tracingOrigins = (o = n.tracingOrigins) != null ? o : !1;
  }
  onStart() {
  }
  onEnd(r) {
    const n = r.attributes["http.url"];
    if (typeof n == "string") {
      const i = !this.urlBlocklist.some((s) => n.toLowerCase().includes(s)), a = Ti(n, this.backendUrl, this.tracingOrigins), o = hi(n, this.tracingOrigins);
      (!i || !a || !o) && (r.spanContext().traceFlags = 0);
    }
  }
  onShutdown() {
  }
}
const Uv = "highlight-browser", Fv = () => B.getTracer(Uv), Vv = () => Ot(void 0, null, function* () {
  B !== void 0 && (yield B.forceFlush(), B.shutdown());
}), zr = (e, t, r) => {
  var o, s, u;
  let n;
  const i = new URL(e).pathname;
  let a = `${t} - ${i}`;
  try {
    if (n = typeof r == "string" ? JSON.parse(r) : r, n && n.query) {
      const _ = Dv(n.query), c = ((o = _.definitions[0]) == null ? void 0 : o.kind) === "OperationDefinition" ? (u = (s = _.definitions[0]) == null ? void 0 : s.name) == null ? void 0 : u.value : void 0;
      c && (a = `${c} (GraphQL: ${i})`);
    }
  } catch (_) {
  }
  return a;
}, qr = (e, t, r, n) => {
  var s;
  const i = typeof t == "string" ? t : String(t);
  let a;
  try {
    a = t ? JSON.parse(i) : void 0, a.operationName && e.setAttribute("graphql.operation.name", a.operationName);
  } catch (u) {
  }
  const o = vi((s = n == null ? void 0 : n.networkHeadersToRedact) != null ? s : [], r, n == null ? void 0 : n.headerKeysToRecord);
  e.setAttributes({
    "highlight.type": "http.request",
    "http.request.headers": JSON.stringify(o),
    "http.request.body": i
  });
};
export {
  Uv as BROWSER_TRACER_NAME,
  Fv as getTracer,
  kv as setupBrowserTracing,
  Vv as shutdown
};
//# sourceMappingURL=index-2gQNKiCL.js.map
