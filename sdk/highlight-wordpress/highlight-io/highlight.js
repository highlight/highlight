;(function (O, U) {
	typeof exports == 'object' && typeof module != 'undefined'
		? U(exports)
		: typeof define == 'function' && define.amd
			? define(['exports'], U)
			: ((O = typeof globalThis != 'undefined' ? globalThis : O || self),
				U((O.H = {})))
})(this, function (O) {
	'use strict'
	var aC = Object.defineProperty,
		lC = Object.defineProperties
	var cC = Object.getOwnPropertyDescriptors
	var Ss = Object.getOwnPropertySymbols
	var Zf = Object.prototype.hasOwnProperty,
		Tf = Object.prototype.propertyIsEnumerable
	var Cl = (O, U) => ((U = Symbol[O]) ? U : Symbol.for('Symbol.' + O)),
		uC = (O) => {
			throw TypeError(O)
		}
	var Gl = (O, U, ne) =>
			U in O
				? aC(O, U, {
						enumerable: !0,
						configurable: !0,
						writable: !0,
						value: ne,
					})
				: (O[U] = ne),
		Z = (O, U) => {
			for (var ne in U || (U = {})) Zf.call(U, ne) && Gl(O, ne, U[ne])
			if (Ss) for (var ne of Ss(U)) Tf.call(U, ne) && Gl(O, ne, U[ne])
			return O
		},
		q = (O, U) => lC(O, cC(U))
	var Ve = (O, U) => {
		var ne = {}
		for (var ye in O)
			Zf.call(O, ye) && U.indexOf(ye) < 0 && (ne[ye] = O[ye])
		if (O != null && Ss)
			for (var ye of Ss(O))
				U.indexOf(ye) < 0 && Tf.call(O, ye) && (ne[ye] = O[ye])
		return ne
	}
	var C = (O, U, ne) => Gl(O, typeof U != 'symbol' ? U + '' : U, ne)
	var z = (O, U, ne) =>
			new Promise((ye, Fe) => {
				var Ne = (Le) => {
						try {
							Nt(ne.next(Le))
						} catch (Bt) {
							Fe(Bt)
						}
					},
					ot = (Le) => {
						try {
							Nt(ne.throw(Le))
						} catch (Bt) {
							Fe(Bt)
						}
					},
					Nt = (Le) =>
						Le.done
							? ye(Le.value)
							: Promise.resolve(Le.value).then(Ne, ot)
				Nt((ne = ne.apply(O, U)).next())
			}),
		dC = function (O, U) {
			;(this[0] = O), (this[1] = U)
		}
	var Vl = (O) => {
		var U = O[Cl('asyncIterator')],
			ne = !1,
			ye,
			Fe = {}
		return (
			U == null
				? ((U = O[Cl('iterator')]()),
					(ye = (Ne) => (Fe[Ne] = (ot) => U[Ne](ot))))
				: ((U = U.call(O)),
					(ye = (Ne) =>
						(Fe[Ne] = (ot) => {
							if (ne) {
								if (((ne = !1), Ne === 'throw')) throw ot
								return ot
							}
							return (
								(ne = !0),
								{
									done: !1,
									value: new dC(
										new Promise((Nt) => {
											var Le = U[Ne](ot)
											Le instanceof Object ||
												uC('Object expected'),
												Nt(Le)
										}),
										1,
									),
								}
							)
						}))),
			(Fe[Cl('iterator')] = () => Fe),
			ye('next'),
			'throw' in U
				? ye('throw')
				: (Fe.throw = (Ne) => {
						throw Ne
					}),
			'return' in U && ye('return'),
			Fe
		)
	}
	function U(r, e) {
		for (var t = 0; t < e.length; t++) {
			const n = e[t]
			if (typeof n != 'string' && !Array.isArray(n)) {
				for (const i in n)
					if (i !== 'default' && !(i in r)) {
						const s = Object.getOwnPropertyDescriptor(n, i)
						s &&
							Object.defineProperty(
								r,
								i,
								s.get ? s : { enumerable: !0, get: () => n[i] },
							)
					}
			}
		}
		return Object.freeze(
			Object.defineProperty(r, Symbol.toStringTag, { value: 'Module' }),
		)
	}
	const ne = ({ apiKey: r }) => {
			;(function (e, t) {
				var n = e.amplitude || { _q: [], _iq: {} },
					i = t.createElement('script')
				;(i.type = 'text/javascript'),
					(i.integrity =
						'sha384-+EO59vL/X7v6VE2s6/F4HxfHlK0nDUVWKVg8K9oUlvffAeeaShVBmbORTC2D3UF+'),
					(i.crossOrigin = 'anonymous'),
					(i.async = !0),
					(i.src =
						'https://cdn.amplitude.com/libs/amplitude-8.17.0-min.gz.js'),
					(i.onload = function () {
						e.amplitude.runQueuedFunctions ||
							console.log(
								'[Amplitude] Error: could not load SDK',
							),
							amplitude.getInstance().init(r)
					})
				var s = t.getElementsByTagName('script')[0]
				s.parentNode.insertBefore(i, s)
				function o(f, m) {
					f.prototype[m] = function () {
						return (
							this._q.push(
								[m].concat(
									Array.prototype.slice.call(arguments, 0),
								),
							),
							this
						)
					}
				}
				for (
					var l = function () {
							return (this._q = []), this
						},
						a = [
							'add',
							'append',
							'clearAll',
							'prepend',
							'set',
							'setOnce',
							'unset',
							'preInsert',
							'postInsert',
							'remove',
						],
						c = 0;
					c < a.length;
					c++
				)
					o(l, a[c])
				n.Identify = l
				for (
					var u = function () {
							return (this._q = []), this
						},
						d = [
							'setProductId',
							'setQuantity',
							'setPrice',
							'setRevenueType',
							'setEventProperties',
						],
						h = 0;
					h < d.length;
					h++
				)
					o(u, d[h])
				n.Revenue = u
				var p = [
					'init',
					'logEvent',
					'logRevenue',
					'setUserId',
					'setUserProperties',
					'setOptOut',
					'setVersionName',
					'setDomain',
					'setDeviceId',
					'enableTracking',
					'setGlobalUserProperties',
					'identify',
					'clearUserProperties',
					'setGroup',
					'logRevenueV2',
					'regenerateDeviceId',
					'groupIdentify',
					'onInit',
					'logEventWithTimestamp',
					'logEventWithGroups',
					'setSessionId',
					'resetSessionId',
				]
				function y(f) {
					function m(v) {
						f[v] = function () {
							f._q.push(
								[v].concat(
									Array.prototype.slice.call(arguments, 0),
								),
							)
						}
					}
					for (var g = 0; g < p.length; g++) m(p[g])
				}
				y(n),
					(n.getInstance = function (f) {
						return (
							(f = (
								!f || f.length === 0 ? '$default_instance' : f
							).toLowerCase()),
							Object.prototype.hasOwnProperty.call(n._iq, f) ||
								((n._iq[f] = { _q: [] }), y(n._iq[f])),
							n._iq[f]
						)
					}),
					(e.amplitude = n)
			})(window, document)
		},
		ye = ({ projectToken: r }) => {
			if (window.mixpanel) return
			;(function (t, n) {
				if (!n.__SV) {
					var i, s
					;(window.mixpanel = n),
						(n._i = []),
						(n.init = function (o, l, a) {
							function c(h, p) {
								var y = p.split('.')
								y.length == 2 && ((h = h[y[0]]), (p = y[1])),
									(h[p] = function () {
										h.push(
											[p].concat(
												Array.prototype.slice.call(
													arguments,
													0,
												),
											),
										)
									})
							}
							var u = n
							for (
								typeof a != 'undefined'
									? (u = n[a] = [])
									: (a = 'mixpanel'),
									u.people = u.people || [],
									u.toString = function (h) {
										var p = 'mixpanel'
										return (
											a !== 'mixpanel' && (p += '.' + a),
											h || (p += ' (stub)'),
											p
										)
									},
									u.people.toString = function () {
										return u.toString(1) + '.people (stub)'
									},
									i =
										'disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove'.split(
											' ',
										),
									s = 0;
								s < i.length;
								s++
							)
								c(u, i[s])
							var d =
								'set set_once union unset remove delete'.split(
									' ',
								)
							;(u.get_group = function () {
								function h(m) {
									p[m] = function () {
										;(call2_args = arguments),
											(call2 = [m].concat(
												Array.prototype.slice.call(
													call2_args,
													0,
												),
											)),
											u.push([y, call2])
									}
								}
								for (
									var p = {},
										y = ['get_group'].concat(
											Array.prototype.slice.call(
												arguments,
												0,
											),
										),
										f = 0;
									f < d.length;
									f++
								)
									h(d[f])
								return p
							}),
								n._i.push([o, l, a])
						}),
						(n.__SV = 1.2)
				}
			})(document, window.mixpanel || [])
			const e = document.createElement('script')
			;(e.src = Fe),
				document.head.appendChild(e),
				e.addEventListener('load', () => {
					var t
					;(t = window.mixpanel) == null || t.init(r)
				})
		},
		Fe = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
		Ne = 1e3,
		ot = 1e3 * 2,
		Nt = 4 * 60 * 60 * 1e3,
		Le = 15 * 60 * 1e3,
		Bt = {
			normal: { bytes: 1e7, time: 4 * 60 * 1e3 },
			canvas: { bytes: 16e6, time: 5e3 },
		},
		Xf = 100,
		vs = 'app.highlight.io'
	var Rs =
		typeof globalThis != 'undefined'
			? globalThis
			: typeof window != 'undefined'
				? window
				: typeof global != 'undefined'
					? global
					: typeof self != 'undefined'
						? self
						: {}
	function Is(r) {
		return r &&
			r.__esModule &&
			Object.prototype.hasOwnProperty.call(r, 'default')
			? r.default
			: r
	}
	var Nl = { exports: {} },
		ws = { exports: {} },
		Ll
	function Wf() {
		return (
			Ll ||
				((Ll = 1),
				(function (r, e) {
					;(function (t, n) {
						r.exports = n()
					})(Rs, function () {
						function t(f) {
							return !isNaN(parseFloat(f)) && isFinite(f)
						}
						function n(f) {
							return f.charAt(0).toUpperCase() + f.substring(1)
						}
						function i(f) {
							return function () {
								return this[f]
							}
						}
						var s = [
								'isConstructor',
								'isEval',
								'isNative',
								'isToplevel',
							],
							o = ['columnNumber', 'lineNumber'],
							l = ['fileName', 'functionName', 'source'],
							a = ['args'],
							c = ['evalOrigin'],
							u = s.concat(o, l, a, c)
						function d(f) {
							if (f)
								for (var m = 0; m < u.length; m++)
									f[u[m]] !== void 0 &&
										this['set' + n(u[m])](f[u[m]])
						}
						;(d.prototype = {
							getArgs: function () {
								return this.args
							},
							setArgs: function (f) {
								if (
									Object.prototype.toString.call(f) !==
									'[object Array]'
								)
									throw new TypeError('Args must be an Array')
								this.args = f
							},
							getEvalOrigin: function () {
								return this.evalOrigin
							},
							setEvalOrigin: function (f) {
								if (f instanceof d) this.evalOrigin = f
								else if (f instanceof Object)
									this.evalOrigin = new d(f)
								else
									throw new TypeError(
										'Eval Origin must be an Object or StackFrame',
									)
							},
							toString: function () {
								var f = this.getFileName() || '',
									m = this.getLineNumber() || '',
									g = this.getColumnNumber() || '',
									v = this.getFunctionName() || ''
								return this.getIsEval()
									? f
										? '[eval] (' +
											f +
											':' +
											m +
											':' +
											g +
											')'
										: '[eval]:' + m + ':' + g
									: v
										? v + ' (' + f + ':' + m + ':' + g + ')'
										: f + ':' + m + ':' + g
							},
						}),
							(d.fromString = function (m) {
								var g = m.indexOf('('),
									v = m.lastIndexOf(')'),
									S = m.substring(0, g),
									I = m.substring(g + 1, v).split(','),
									G = m.substring(v + 1)
								if (G.indexOf('@') === 0)
									var L =
											/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(
												G,
												'',
											),
										w = L[1],
										V = L[2],
										P = L[3]
								return new d({
									functionName: S,
									args: I || void 0,
									fileName: w,
									lineNumber: V || void 0,
									columnNumber: P || void 0,
								})
							})
						for (var h = 0; h < s.length; h++)
							(d.prototype['get' + n(s[h])] = i(s[h])),
								(d.prototype['set' + n(s[h])] = (function (f) {
									return function (m) {
										this[f] = !!m
									}
								})(s[h]))
						for (var p = 0; p < o.length; p++)
							(d.prototype['get' + n(o[p])] = i(o[p])),
								(d.prototype['set' + n(o[p])] = (function (f) {
									return function (m) {
										if (!t(m))
											throw new TypeError(
												f + ' must be a Number',
											)
										this[f] = Number(m)
									}
								})(o[p]))
						for (var y = 0; y < l.length; y++)
							(d.prototype['get' + n(l[y])] = i(l[y])),
								(d.prototype['set' + n(l[y])] = (function (f) {
									return function (m) {
										this[f] = String(m)
									}
								})(l[y]))
						return d
					})
				})(ws)),
			ws.exports
		)
	}
	;(function (r, e) {
		;(function (t, n) {
			r.exports = n(Wf())
		})(Rs, function (n) {
			var i = /(^|@)\S+:\d+/,
				s = /^\s*at .*(\S+:\d+|\(native\))/m,
				o = /^(eval@)?(\[native code])?$/
			return {
				parse: function (a) {
					if (
						typeof a.stacktrace != 'undefined' ||
						typeof a['opera#sourceloc'] != 'undefined'
					)
						return this.parseOpera(a)
					if (a.stack && a.stack.match(s)) return this.parseV8OrIE(a)
					if (a.stack) return this.parseFFOrSafari(a)
					throw new Error('Cannot parse given Error object')
				},
				extractLocation: function (a) {
					if (a.indexOf(':') === -1) return [a]
					var c = /(.+?)(?::(\d+))?(?::(\d+))?$/,
						u = c.exec(a.replace(/[()]/g, ''))
					return [u[1], u[2] || void 0, u[3] || void 0]
				},
				parseV8OrIE: function (a) {
					var c = a.stack
						.split(
							`
`,
						)
						.filter(function (u) {
							return !!u.match(s)
						}, this)
					return c.map(function (u) {
						u.indexOf('(eval ') > -1 &&
							(u = u
								.replace(/eval code/g, 'eval')
								.replace(/(\(eval at [^()]*)|(\),.*$)/g, ''))
						var d = u
								.replace(/^\s+/, '')
								.replace(/\(eval code/g, '('),
							h = d.match(/ (\((.+):(\d+):(\d+)\)$)/)
						d = h ? d.replace(h[0], '') : d
						var p = d.split(/\s+/).slice(1),
							y = this.extractLocation(h ? h[1] : p.pop()),
							f = p.join(' ') || void 0,
							m =
								['eval', '<anonymous>'].indexOf(y[0]) > -1
									? void 0
									: y[0]
						return new n({
							functionName: f,
							fileName: m,
							lineNumber: y[1],
							columnNumber: y[2],
							source: u,
						})
					}, this)
				},
				parseFFOrSafari: function (a) {
					var c = a.stack
						.split(
							`
`,
						)
						.filter(function (u) {
							return !u.match(o)
						}, this)
					return c.map(function (u) {
						if (
							(u.indexOf(' > eval') > -1 &&
								(u = u.replace(
									/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
									':$1',
								)),
							u.indexOf('@') === -1 && u.indexOf(':') === -1)
						)
							return new n({ functionName: u })
						var d = /((.*".+"[^@]*)?[^@]*)(?:@)/,
							h = u.match(d),
							p = h && h[1] ? h[1] : void 0,
							y = this.extractLocation(u.replace(d, ''))
						return new n({
							functionName: p,
							fileName: y[0],
							lineNumber: y[1],
							columnNumber: y[2],
							source: u,
						})
					}, this)
				},
				parseOpera: function (a) {
					return !a.stacktrace ||
						(a.message.indexOf(`
`) > -1 &&
							a.message.split(`
`).length >
								a.stacktrace.split(`
`).length)
						? this.parseOpera9(a)
						: a.stack
							? this.parseOpera11(a)
							: this.parseOpera10(a)
				},
				parseOpera9: function (a) {
					for (
						var c = /Line (\d+).*script (?:in )?(\S+)/i,
							u = a.message.split(`
`),
							d = [],
							h = 2,
							p = u.length;
						h < p;
						h += 2
					) {
						var y = c.exec(u[h])
						y &&
							d.push(
								new n({
									fileName: y[2],
									lineNumber: y[1],
									source: u[h],
								}),
							)
					}
					return d
				},
				parseOpera10: function (a) {
					for (
						var c =
								/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,
							u = a.stacktrace.split(`
`),
							d = [],
							h = 0,
							p = u.length;
						h < p;
						h += 2
					) {
						var y = c.exec(u[h])
						y &&
							d.push(
								new n({
									functionName: y[3] || void 0,
									fileName: y[2],
									lineNumber: y[1],
									source: u[h],
								}),
							)
					}
					return d
				},
				parseOpera11: function (a) {
					var c = a.stack
						.split(
							`
`,
						)
						.filter(function (u) {
							return !!u.match(i) && !u.match(/^Error created at/)
						}, this)
					return c.map(function (u) {
						var d = u.split('@'),
							h = this.extractLocation(d.pop()),
							p = d.shift() || '',
							y =
								p
									.replace(
										/<anonymous function(: (\w+))?>/,
										'$2',
									)
									.replace(/\([^)]*\)/g, '') || void 0,
							f
						p.match(/\(([^)]*)\)/) &&
							(f = p.replace(/^[^(]+\(([^)]*)\)$/, '$1'))
						var m =
							f === void 0 || f === '[arguments not available]'
								? void 0
								: f.split(',')
						return new n({
							functionName: y,
							args: m,
							fileName: h[0],
							lineNumber: h[1],
							columnNumber: h[2],
							source: u,
						})
					}, this)
				},
			}
		})
	})(Nl)
	var _f = Nl.exports
	const Zr = Is(_f)
	function xf(r, e, t) {
		try {
			if (!(e in r)) return () => {}
			const n = r[e],
				i = t(n)
			return (
				typeof i == 'function' &&
					((i.prototype = i.prototype || {}),
					Object.defineProperties(i, {
						__rrweb_original__: { enumerable: !1, value: n },
					})),
				(r[e] = i),
				() => {
					r[e] = n
				}
			)
		} catch (n) {
			return () => {}
		}
	}
	function Of(r) {
		if (!r || !r.outerHTML) return ''
		let e = ''
		for (; r.parentElement; ) {
			let t = r.localName
			if (!t) break
			t = t.toLowerCase()
			let n = r.parentElement,
				i = []
			if (n.children && n.children.length > 0)
				for (let s = 0; s < n.children.length; s++) {
					let o = n.children[s]
					o.localName &&
						o.localName.toLowerCase &&
						o.localName.toLowerCase() === t &&
						i.push(o)
				}
			i.length > 1 && (t += ':eq(' + i.indexOf(r) + ')'),
				(e = t + (e ? '>' + e : '')),
				(r = n)
		}
		return e
	}
	function Zs(r) {
		return Object.prototype.toString.call(r) === '[object Object]'
	}
	function Xl(r, e) {
		if (e === 0) return !0
		const t = Object.keys(r)
		for (const n of t) if (Zs(r[n]) && Xl(r[n], e - 1)) return !0
		return !1
	}
	function Ts(r, e) {
		const t = { numOfKeysLimit: 50, depthOfLimit: 4 }
		Object.assign(t, e)
		const n = [],
			i = []
		return JSON.stringify(r, function (l, a) {
			if (n.length > 0) {
				const c = n.indexOf(this)
				~c ? n.splice(c + 1) : n.push(this),
					~c ? i.splice(c, 1 / 0, l) : i.push(l),
					~n.indexOf(a) &&
						(n[0] === a
							? (a = '[Circular ~]')
							: (a =
									'[Circular ~.' +
									i.slice(0, n.indexOf(a)).join('.') +
									']'))
			} else n.push(a)
			if (a == null) return a
			if (s(a)) return o(a)
			if (a instanceof Event) {
				const c = {}
				for (const u in a) {
					const d = a[u]
					Array.isArray(d)
						? (c[u] = Of(d.length ? d[0] : null))
						: (c[u] = d)
				}
				return c
			} else {
				if (a instanceof Node)
					return a instanceof HTMLElement
						? a
							? a.outerHTML
							: ''
						: a.nodeName
				if (a instanceof Error) return a.name + ': ' + a.message
			}
			return a
		})
		function s(l) {
			return (Zs(l) && Object.keys(l).length > t.numOfKeysLimit) ||
				typeof l == 'function'
				? !0
				: l instanceof Event && l.isTrusted === !1
					? Object.keys(l).length === 1
					: !!(Zs(l) && Xl(l, t.depthOfLimit))
		}
		function o(l) {
			let a = l.toString()
			return (
				t.stringLengthLimit &&
					a.length > t.stringLengthLimit &&
					(a = `${a.slice(0, t.stringLengthLimit)}...`),
				a
			)
		}
	}
	function kf() {
		var r = document.createElement('canvas')
		return r.getContext && r.getContext('2d')
			? r.toDataURL('image/webp').indexOf('data:image/webp') == 0
			: !1
	}
	function Pf() {
		return kf()
			? { type: 'image/webp', quality: 0.9 }
			: { type: 'image/jpeg', quality: 0.6 }
	}
	function Uf(r, e) {
		const t = e.logger
		let n
		n = window[t]
		const i = []
		if (e.level.includes('error') && window) {
			const o = (l) => {
				const { message: a, error: c } = l
				let u = []
				c && (u = Zr.parse(c))
				const d = [Ts(a, e.stringifyOptions)]
				r({ type: 'Error', trace: u, time: Date.now(), value: d })
			}
			window.addEventListener('error', o),
				i.push(() => {
					window && window.removeEventListener('error', o)
				})
		}
		for (const o of e.level) i.push(s(n, o))
		return () => {
			i.forEach((o) => o())
		}
		function s(o, l) {
			return o[l]
				? xf(o, l, (a) => (...c) => {
						a.apply(this, c)
						try {
							const u = Zr.parse(new Error()),
								d = e.serializeConsoleAttributes
									? c.map((h) =>
											typeof h == 'object'
												? Ts(h, e.stringifyOptions)
												: h,
										)
									: c
											.filter((h) => typeof h != 'object')
											.map((h) => `${h}`)
							r({
								type: l,
								trace: u.slice(1),
								value: d,
								attributes: Ts(
									c
										.filter((h) => typeof h == 'object')
										.reduce((h, p) => Z(Z({}, h), p), {}),
									e.stringifyOptions,
								),
								time: Date.now(),
							})
						} catch (u) {
							a('highlight logger error:', u, ...c)
						}
					})
				: () => {}
		}
	}
	var Es = { exports: {} }
	;(function (r, e) {
		;(e = r.exports = t), (e.getSerialize = n)
		function t(i, s, o, l) {
			return JSON.stringify(i, n(s, l), o)
		}
		function n(i, s) {
			var o = [],
				l = []
			return (
				s == null &&
					(s = function (a, c) {
						return o[0] === c
							? '[Circular ~]'
							: '[Circular ~.' +
									l.slice(0, o.indexOf(c)).join('.') +
									']'
					}),
				function (a, c) {
					if (o.length > 0) {
						var u = o.indexOf(this)
						~u ? o.splice(u + 1) : o.push(this),
							~u ? l.splice(u, 1 / 0, a) : l.push(a),
							~o.indexOf(c) && (c = s.call(this, a, c))
					} else o.push(c)
					return i == null ? c : i.call(this, a, c)
				}
			)
		}
	})(Es, Es.exports)
	var Af = Es.exports
	const Lt = Is(Af)
	function Cs(r, e, t, n) {
		var l, a, c, u
		let i = []
		try {
			i = Zr.parse(n != null ? n : e)
		} catch (d) {
			i = Zr.parse(new Error())
		}
		let s = {}
		e instanceof Error &&
			((e = e.message), e.cause && (s = { 'exception.cause': e.cause }))
		const o = Yf(i)
		r({
			event: Lt(e),
			type: 'window.onerror',
			url: window.location.href,
			source: t != null ? t : '',
			lineNumber:
				(l = o[0]) != null && l.lineNumber
					? (a = o[0]) == null
						? void 0
						: a.lineNumber
					: 0,
			columnNumber:
				(c = o[0]) != null && c.columnNumber
					? (u = o[0]) == null
						? void 0
						: u.columnNumber
					: 0,
			stackTrace: o,
			timestamp: new Date().toISOString(),
			payload: s ? Lt(s) : void 0,
		})
	}
	const Mf = (r, { enablePromisePatch: e }) => {
			if (typeof window == 'undefined') return () => {}
			const t = (window.onerror = (o, l, a, c, u) => {
					Cs(r, o, l, u)
				}),
				n = (window.onunhandledrejection = (o) => {
					if (o.reason) {
						const l = o.promise
						l.getStack
							? Cs(r, o.reason, o.type, l.getStack())
							: Cs(r, o.reason, o.type)
					}
				}),
				i = window.Promise,
				s = class extends i {
					constructor(a) {
						super(a)
						C(this, 'promiseCreationError')
						this.promiseCreationError = new Error()
					}
					getStack() {
						return this.promiseCreationError
					}
					static shouldPatch() {
						const a = typeof window.Zone == 'undefined'
						return e && a
					}
				}
			return (
				s.shouldPatch() && (window.Promise = s),
				() => {
					;(window.Promise = i),
						(window.onunhandledrejection = n),
						(window.onerror = t)
				}
			)
		},
		Yf = (r) => {
			var t, n
			if (r.length === 0) return r
			const e = r[0]
			return ((t = e.fileName) != null && t.includes('highlight.run')) ||
				((n = e.fileName) != null && n.includes('highlight.io')) ||
				e.functionName === 'new highlightPromise'
				? r.slice(1)
				: r
		},
		Wl = [
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
			'""',
		],
		_l = ['websocket error', '\\"ResizeObserver loop']
	var Ff =
			typeof globalThis == 'object'
				? globalThis
				: typeof self == 'object'
					? self
					: typeof window == 'object'
						? window
						: typeof global == 'object'
							? global
							: {},
		Xt = '1.9.0',
		xl = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/
	function Jf(r) {
		var e = new Set([r]),
			t = new Set(),
			n = r.match(xl)
		if (!n)
			return function () {
				return !1
			}
		var i = { major: +n[1], minor: +n[2], patch: +n[3], prerelease: n[4] }
		if (i.prerelease != null)
			return function (a) {
				return a === r
			}
		function s(l) {
			return t.add(l), !1
		}
		function o(l) {
			return e.add(l), !0
		}
		return function (a) {
			if (e.has(a)) return !0
			if (t.has(a)) return !1
			var c = a.match(xl)
			if (!c) return s(a)
			var u = {
				major: +c[1],
				minor: +c[2],
				patch: +c[3],
				prerelease: c[4],
			}
			return u.prerelease != null || i.major !== u.major
				? s(a)
				: i.major === 0
					? i.minor === u.minor && i.patch <= u.patch
						? o(a)
						: s(a)
					: i.minor <= u.minor
						? o(a)
						: s(a)
		}
	}
	var Hf = Jf(Xt),
		Kf = Xt.split('.')[0],
		Tr = Symbol.for('opentelemetry.js.api.' + Kf),
		Er = Ff
	function Cr(r, e, t, n) {
		var i
		n === void 0 && (n = !1)
		var s = (Er[Tr] =
			(i = Er[Tr]) !== null && i !== void 0 ? i : { version: Xt })
		if (!n && s[r]) {
			var o = new Error(
				'@opentelemetry/api: Attempted duplicate registration of API: ' +
					r,
			)
			return t.error(o.stack || o.message), !1
		}
		if (s.version !== Xt) {
			var o = new Error(
				'@opentelemetry/api: Registration of version v' +
					s.version +
					' for ' +
					r +
					' does not match previously registered API v' +
					Xt,
			)
			return t.error(o.stack || o.message), !1
		}
		return (
			(s[r] = e),
			t.debug(
				'@opentelemetry/api: Registered a global for ' +
					r +
					' v' +
					Xt +
					'.',
			),
			!0
		)
	}
	function Wt(r) {
		var e,
			t,
			n = (e = Er[Tr]) === null || e === void 0 ? void 0 : e.version
		if (!(!n || !Hf(n)))
			return (t = Er[Tr]) === null || t === void 0 ? void 0 : t[r]
	}
	function Gr(r, e) {
		e.debug(
			'@opentelemetry/api: Unregistering a global for ' +
				r +
				' v' +
				Xt +
				'.',
		)
		var t = Er[Tr]
		t && delete t[r]
	}
	var Bf = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		zf = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		Df = (function () {
			function r(e) {
				this._namespace = e.namespace || 'DiagComponentLogger'
			}
			return (
				(r.prototype.debug = function () {
					for (var e = [], t = 0; t < arguments.length; t++)
						e[t] = arguments[t]
					return Vr('debug', this._namespace, e)
				}),
				(r.prototype.error = function () {
					for (var e = [], t = 0; t < arguments.length; t++)
						e[t] = arguments[t]
					return Vr('error', this._namespace, e)
				}),
				(r.prototype.info = function () {
					for (var e = [], t = 0; t < arguments.length; t++)
						e[t] = arguments[t]
					return Vr('info', this._namespace, e)
				}),
				(r.prototype.warn = function () {
					for (var e = [], t = 0; t < arguments.length; t++)
						e[t] = arguments[t]
					return Vr('warn', this._namespace, e)
				}),
				(r.prototype.verbose = function () {
					for (var e = [], t = 0; t < arguments.length; t++)
						e[t] = arguments[t]
					return Vr('verbose', this._namespace, e)
				}),
				r
			)
		})()
	function Vr(r, e, t) {
		var n = Wt('diag')
		if (n) return t.unshift(e), n[r].apply(n, zf([], Bf(t), !1))
	}
	var de
	;(function (r) {
		;(r[(r.NONE = 0)] = 'NONE'),
			(r[(r.ERROR = 30)] = 'ERROR'),
			(r[(r.WARN = 50)] = 'WARN'),
			(r[(r.INFO = 60)] = 'INFO'),
			(r[(r.DEBUG = 70)] = 'DEBUG'),
			(r[(r.VERBOSE = 80)] = 'VERBOSE'),
			(r[(r.ALL = 9999)] = 'ALL')
	})(de || (de = {}))
	function jf(r, e) {
		r < de.NONE ? (r = de.NONE) : r > de.ALL && (r = de.ALL), (e = e || {})
		function t(n, i) {
			var s = e[n]
			return typeof s == 'function' && r >= i ? s.bind(e) : function () {}
		}
		return {
			error: t('error', de.ERROR),
			warn: t('warn', de.WARN),
			info: t('info', de.INFO),
			debug: t('debug', de.DEBUG),
			verbose: t('verbose', de.VERBOSE),
		}
	}
	var Qf = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		$f = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		qf = 'diag',
		$e = (function () {
			function r() {
				function e(i) {
					return function () {
						for (var s = [], o = 0; o < arguments.length; o++)
							s[o] = arguments[o]
						var l = Wt('diag')
						if (l) return l[i].apply(l, $f([], Qf(s), !1))
					}
				}
				var t = this,
					n = function (i, s) {
						var o, l, a
						if (
							(s === void 0 && (s = { logLevel: de.INFO }),
							i === t)
						) {
							var c = new Error(
								'Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation',
							)
							return (
								t.error(
									(o = c.stack) !== null && o !== void 0
										? o
										: c.message,
								),
								!1
							)
						}
						typeof s == 'number' && (s = { logLevel: s })
						var u = Wt('diag'),
							d = jf(
								(l = s.logLevel) !== null && l !== void 0
									? l
									: de.INFO,
								i,
							)
						if (u && !s.suppressOverrideMessage) {
							var h =
								(a = new Error().stack) !== null && a !== void 0
									? a
									: '<failed to generate stacktrace>'
							u.warn(
								'Current logger will be overwritten from ' + h,
							),
								d.warn(
									'Current logger will overwrite one already registered from ' +
										h,
								)
						}
						return Cr('diag', d, t, !0)
					}
				;(t.setLogger = n),
					(t.disable = function () {
						Gr(qf, t)
					}),
					(t.createComponentLogger = function (i) {
						return new Df(i)
					}),
					(t.verbose = e('verbose')),
					(t.debug = e('debug')),
					(t.info = e('info')),
					(t.warn = e('warn')),
					(t.error = e('error'))
			}
			return (
				(r.instance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				r
			)
		})(),
		em = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		tm = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		rm = (function () {
			function r(e) {
				this._entries = e ? new Map(e) : new Map()
			}
			return (
				(r.prototype.getEntry = function (e) {
					var t = this._entries.get(e)
					if (t) return Object.assign({}, t)
				}),
				(r.prototype.getAllEntries = function () {
					return Array.from(this._entries.entries()).map(
						function (e) {
							var t = em(e, 2),
								n = t[0],
								i = t[1]
							return [n, i]
						},
					)
				}),
				(r.prototype.setEntry = function (e, t) {
					var n = new r(this._entries)
					return n._entries.set(e, t), n
				}),
				(r.prototype.removeEntry = function (e) {
					var t = new r(this._entries)
					return t._entries.delete(e), t
				}),
				(r.prototype.removeEntries = function () {
					for (var e, t, n = [], i = 0; i < arguments.length; i++)
						n[i] = arguments[i]
					var s = new r(this._entries)
					try {
						for (
							var o = tm(n), l = o.next();
							!l.done;
							l = o.next()
						) {
							var a = l.value
							s._entries.delete(a)
						}
					} catch (c) {
						e = { error: c }
					} finally {
						try {
							l && !l.done && (t = o.return) && t.call(o)
						} finally {
							if (e) throw e.error
						}
					}
					return s
				}),
				(r.prototype.clear = function () {
					return new r()
				}),
				r
			)
		})(),
		nm = Symbol('BaggageEntryMetadata'),
		im = $e.instance()
	function sm(r) {
		return r === void 0 && (r = {}), new rm(new Map(Object.entries(r)))
	}
	function om(r) {
		return (
			typeof r != 'string' &&
				(im.error(
					'Cannot create baggage metadata from unknown type: ' +
						typeof r,
				),
				(r = '')),
			{
				__TYPE__: nm,
				toString: function () {
					return r
				},
			}
		)
	}
	function Gs(r) {
		return Symbol.for(r)
	}
	var am = (function () {
			function r(e) {
				var t = this
				;(t._currentContext = e ? new Map(e) : new Map()),
					(t.getValue = function (n) {
						return t._currentContext.get(n)
					}),
					(t.setValue = function (n, i) {
						var s = new r(t._currentContext)
						return s._currentContext.set(n, i), s
					}),
					(t.deleteValue = function (n) {
						var i = new r(t._currentContext)
						return i._currentContext.delete(n), i
					})
			}
			return r
		})(),
		_t = new am(),
		xt = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		lm = (function () {
			function r() {}
			return (
				(r.prototype.createGauge = function (e, t) {
					return gm
				}),
				(r.prototype.createHistogram = function (e, t) {
					return Sm
				}),
				(r.prototype.createCounter = function (e, t) {
					return bm
				}),
				(r.prototype.createUpDownCounter = function (e, t) {
					return vm
				}),
				(r.prototype.createObservableGauge = function (e, t) {
					return Im
				}),
				(r.prototype.createObservableCounter = function (e, t) {
					return Rm
				}),
				(r.prototype.createObservableUpDownCounter = function (e, t) {
					return wm
				}),
				(r.prototype.addBatchObservableCallback = function (e, t) {}),
				(r.prototype.removeBatchObservableCallback = function (e) {}),
				r
			)
		})(),
		In = (function () {
			function r() {}
			return r
		})(),
		cm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return (e.prototype.add = function (t, n) {}), e
		})(In),
		um = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return (e.prototype.add = function (t, n) {}), e
		})(In),
		dm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return (e.prototype.record = function (t, n) {}), e
		})(In),
		hm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return (e.prototype.record = function (t, n) {}), e
		})(In),
		Vs = (function () {
			function r() {}
			return (
				(r.prototype.addCallback = function (e) {}),
				(r.prototype.removeCallback = function (e) {}),
				r
			)
		})(),
		pm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return e
		})(Vs),
		fm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return e
		})(Vs),
		mm = (function (r) {
			xt(e, r)
			function e() {
				return (r !== null && r.apply(this, arguments)) || this
			}
			return e
		})(Vs),
		ym = new lm(),
		bm = new cm(),
		gm = new dm(),
		Sm = new hm(),
		vm = new um(),
		Rm = new pm(),
		Im = new fm(),
		wm = new mm(),
		Zm = {
			get: function (r, e) {
				if (r != null) return r[e]
			},
			keys: function (r) {
				return r == null ? [] : Object.keys(r)
			},
		},
		Tm = {
			set: function (r, e, t) {
				r != null && (r[e] = t)
			},
		},
		Em = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		Cm = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		Gm = (function () {
			function r() {}
			return (
				(r.prototype.active = function () {
					return _t
				}),
				(r.prototype.with = function (e, t, n) {
					for (var i = [], s = 3; s < arguments.length; s++)
						i[s - 3] = arguments[s]
					return t.call.apply(t, Cm([n], Em(i), !1))
				}),
				(r.prototype.bind = function (e, t) {
					return t
				}),
				(r.prototype.enable = function () {
					return this
				}),
				(r.prototype.disable = function () {
					return this
				}),
				r
			)
		})(),
		Vm = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		Nm = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		Ns = 'context',
		Lm = new Gm(),
		wn = (function () {
			function r() {}
			return (
				(r.getInstance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				(r.prototype.setGlobalContextManager = function (e) {
					return Cr(Ns, e, $e.instance())
				}),
				(r.prototype.active = function () {
					return this._getContextManager().active()
				}),
				(r.prototype.with = function (e, t, n) {
					for (var i, s = [], o = 3; o < arguments.length; o++)
						s[o - 3] = arguments[o]
					return (i = this._getContextManager()).with.apply(
						i,
						Nm([e, t, n], Vm(s), !1),
					)
				}),
				(r.prototype.bind = function (e, t) {
					return this._getContextManager().bind(e, t)
				}),
				(r.prototype._getContextManager = function () {
					return Wt(Ns) || Lm
				}),
				(r.prototype.disable = function () {
					this._getContextManager().disable(), Gr(Ns, $e.instance())
				}),
				r
			)
		})(),
		at
	;(function (r) {
		;(r[(r.NONE = 0)] = 'NONE'), (r[(r.SAMPLED = 1)] = 'SAMPLED')
	})(at || (at = {}))
	var Ol = '0000000000000000',
		kl = '00000000000000000000000000000000',
		Pl = { traceId: kl, spanId: Ol, traceFlags: at.NONE },
		Nr = (function () {
			function r(e) {
				e === void 0 && (e = Pl), (this._spanContext = e)
			}
			return (
				(r.prototype.spanContext = function () {
					return this._spanContext
				}),
				(r.prototype.setAttribute = function (e, t) {
					return this
				}),
				(r.prototype.setAttributes = function (e) {
					return this
				}),
				(r.prototype.addEvent = function (e, t) {
					return this
				}),
				(r.prototype.addLink = function (e) {
					return this
				}),
				(r.prototype.addLinks = function (e) {
					return this
				}),
				(r.prototype.setStatus = function (e) {
					return this
				}),
				(r.prototype.updateName = function (e) {
					return this
				}),
				(r.prototype.end = function (e) {}),
				(r.prototype.isRecording = function () {
					return !1
				}),
				(r.prototype.recordException = function (e, t) {}),
				r
			)
		})(),
		Ls = Gs('OpenTelemetry Context Key SPAN')
	function Xs(r) {
		return r.getValue(Ls) || void 0
	}
	function Xm() {
		return Xs(wn.getInstance().active())
	}
	function Ws(r, e) {
		return r.setValue(Ls, e)
	}
	function Wm(r) {
		return r.deleteValue(Ls)
	}
	function _m(r, e) {
		return Ws(r, new Nr(e))
	}
	function Ul(r) {
		var e
		return (e = Xs(r)) === null || e === void 0 ? void 0 : e.spanContext()
	}
	var xm = /^([0-9a-f]{32})$/i,
		Om = /^[0-9a-f]{16}$/i
	function Al(r) {
		return xm.test(r) && r !== kl
	}
	function km(r) {
		return Om.test(r) && r !== Ol
	}
	function Zn(r) {
		return Al(r.traceId) && km(r.spanId)
	}
	function Pm(r) {
		return new Nr(r)
	}
	var _s = wn.getInstance(),
		Ml = (function () {
			function r() {}
			return (
				(r.prototype.startSpan = function (e, t, n) {
					n === void 0 && (n = _s.active())
					var i = !!(t != null && t.root)
					if (i) return new Nr()
					var s = n && Ul(n)
					return Um(s) && Zn(s) ? new Nr(s) : new Nr()
				}),
				(r.prototype.startActiveSpan = function (e, t, n, i) {
					var s, o, l
					if (!(arguments.length < 2)) {
						arguments.length === 2
							? (l = t)
							: arguments.length === 3
								? ((s = t), (l = n))
								: ((s = t), (o = n), (l = i))
						var a = o != null ? o : _s.active(),
							c = this.startSpan(e, s, a),
							u = Ws(a, c)
						return _s.with(u, l, void 0, c)
					}
				}),
				r
			)
		})()
	function Um(r) {
		return (
			typeof r == 'object' &&
			typeof r.spanId == 'string' &&
			typeof r.traceId == 'string' &&
			typeof r.traceFlags == 'number'
		)
	}
	var Am = new Ml(),
		Mm = (function () {
			function r(e, t, n, i) {
				;(this._provider = e),
					(this.name = t),
					(this.version = n),
					(this.options = i)
			}
			return (
				(r.prototype.startSpan = function (e, t, n) {
					return this._getTracer().startSpan(e, t, n)
				}),
				(r.prototype.startActiveSpan = function (e, t, n, i) {
					var s = this._getTracer()
					return Reflect.apply(s.startActiveSpan, s, arguments)
				}),
				(r.prototype._getTracer = function () {
					if (this._delegate) return this._delegate
					var e = this._provider.getDelegateTracer(
						this.name,
						this.version,
						this.options,
					)
					return e ? ((this._delegate = e), this._delegate) : Am
				}),
				r
			)
		})(),
		Ym = (function () {
			function r() {}
			return (
				(r.prototype.getTracer = function (e, t, n) {
					return new Ml()
				}),
				r
			)
		})(),
		Fm = new Ym(),
		Yl = (function () {
			function r() {}
			return (
				(r.prototype.getTracer = function (e, t, n) {
					var i
					return (i = this.getDelegateTracer(e, t, n)) !== null &&
						i !== void 0
						? i
						: new Mm(this, e, t, n)
				}),
				(r.prototype.getDelegate = function () {
					var e
					return (e = this._delegate) !== null && e !== void 0
						? e
						: Fm
				}),
				(r.prototype.setDelegate = function (e) {
					this._delegate = e
				}),
				(r.prototype.getDelegateTracer = function (e, t, n) {
					var i
					return (i = this._delegate) === null || i === void 0
						? void 0
						: i.getTracer(e, t, n)
				}),
				r
			)
		})(),
		Tn
	;(function (r) {
		;(r[(r.NOT_RECORD = 0)] = 'NOT_RECORD'),
			(r[(r.RECORD = 1)] = 'RECORD'),
			(r[(r.RECORD_AND_SAMPLED = 2)] = 'RECORD_AND_SAMPLED')
	})(Tn || (Tn = {}))
	var Lr
	;(function (r) {
		;(r[(r.INTERNAL = 0)] = 'INTERNAL'),
			(r[(r.SERVER = 1)] = 'SERVER'),
			(r[(r.CLIENT = 2)] = 'CLIENT'),
			(r[(r.PRODUCER = 3)] = 'PRODUCER'),
			(r[(r.CONSUMER = 4)] = 'CONSUMER')
	})(Lr || (Lr = {}))
	var xs
	;(function (r) {
		;(r[(r.UNSET = 0)] = 'UNSET'),
			(r[(r.OK = 1)] = 'OK'),
			(r[(r.ERROR = 2)] = 'ERROR')
	})(xs || (xs = {}))
	var Q = wn.getInstance(),
		Y = $e.instance(),
		Jm = (function () {
			function r() {}
			return (
				(r.prototype.getMeter = function (e, t, n) {
					return ym
				}),
				r
			)
		})(),
		Hm = new Jm(),
		Os = 'metrics',
		Km = (function () {
			function r() {}
			return (
				(r.getInstance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				(r.prototype.setGlobalMeterProvider = function (e) {
					return Cr(Os, e, $e.instance())
				}),
				(r.prototype.getMeterProvider = function () {
					return Wt(Os) || Hm
				}),
				(r.prototype.getMeter = function (e, t, n) {
					return this.getMeterProvider().getMeter(e, t, n)
				}),
				(r.prototype.disable = function () {
					Gr(Os, $e.instance())
				}),
				r
			)
		})(),
		Fl = Km.getInstance(),
		Bm = (function () {
			function r() {}
			return (
				(r.prototype.inject = function (e, t) {}),
				(r.prototype.extract = function (e, t) {
					return e
				}),
				(r.prototype.fields = function () {
					return []
				}),
				r
			)
		})(),
		ks = Gs('OpenTelemetry Baggage Key')
	function Jl(r) {
		return r.getValue(ks) || void 0
	}
	function zm() {
		return Jl(wn.getInstance().active())
	}
	function Dm(r, e) {
		return r.setValue(ks, e)
	}
	function jm(r) {
		return r.deleteValue(ks)
	}
	var Ps = 'propagation',
		Qm = new Bm(),
		$m = (function () {
			function r() {
				;(this.createBaggage = sm),
					(this.getBaggage = Jl),
					(this.getActiveBaggage = zm),
					(this.setBaggage = Dm),
					(this.deleteBaggage = jm)
			}
			return (
				(r.getInstance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				(r.prototype.setGlobalPropagator = function (e) {
					return Cr(Ps, e, $e.instance())
				}),
				(r.prototype.inject = function (e, t, n) {
					return (
						n === void 0 && (n = Tm),
						this._getGlobalPropagator().inject(e, t, n)
					)
				}),
				(r.prototype.extract = function (e, t, n) {
					return (
						n === void 0 && (n = Zm),
						this._getGlobalPropagator().extract(e, t, n)
					)
				}),
				(r.prototype.fields = function () {
					return this._getGlobalPropagator().fields()
				}),
				(r.prototype.disable = function () {
					Gr(Ps, $e.instance())
				}),
				(r.prototype._getGlobalPropagator = function () {
					return Wt(Ps) || Qm
				}),
				r
			)
		})(),
		xe = $m.getInstance(),
		Us = 'trace',
		qm = (function () {
			function r() {
				;(this._proxyTracerProvider = new Yl()),
					(this.wrapSpanContext = Pm),
					(this.isSpanContextValid = Zn),
					(this.deleteSpan = Wm),
					(this.getSpan = Xs),
					(this.getActiveSpan = Xm),
					(this.getSpanContext = Ul),
					(this.setSpan = Ws),
					(this.setSpanContext = _m)
			}
			return (
				(r.getInstance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				(r.prototype.setGlobalTracerProvider = function (e) {
					var t = Cr(Us, this._proxyTracerProvider, $e.instance())
					return t && this._proxyTracerProvider.setDelegate(e), t
				}),
				(r.prototype.getTracerProvider = function () {
					return Wt(Us) || this._proxyTracerProvider
				}),
				(r.prototype.getTracer = function (e, t) {
					return this.getTracerProvider().getTracer(e, t)
				}),
				(r.prototype.disable = function () {
					Gr(Us, $e.instance()),
						(this._proxyTracerProvider = new Yl())
				}),
				r
			)
		})(),
		ae = qm.getInstance(),
		Hl = Gs('OpenTelemetry SDK Context Key SUPPRESS_TRACING')
	function ey(r) {
		return r.setValue(Hl, !0)
	}
	function As(r) {
		return r.getValue(Hl) === !0
	}
	var ty = '=',
		Ms = ';',
		En = ',',
		Ys = 'baggage',
		ry = 180,
		ny = 4096,
		iy = 8192,
		sy = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		}
	function Kl(r) {
		return r.reduce(function (e, t) {
			var n = '' + e + (e !== '' ? En : '') + t
			return n.length > iy ? e : n
		}, '')
	}
	function Bl(r) {
		return r.getAllEntries().map(function (e) {
			var t = sy(e, 2),
				n = t[0],
				i = t[1],
				s = encodeURIComponent(n) + '=' + encodeURIComponent(i.value)
			return i.metadata !== void 0 && (s += Ms + i.metadata.toString()), s
		})
	}
	function Fs(r) {
		var e = r.split(Ms)
		if (!(e.length <= 0)) {
			var t = e.shift()
			if (t) {
				var n = t.indexOf(ty)
				if (!(n <= 0)) {
					var i = decodeURIComponent(t.substring(0, n).trim()),
						s = decodeURIComponent(t.substring(n + 1).trim()),
						o
					return (
						e.length > 0 && (o = om(e.join(Ms))),
						{ key: i, value: s, metadata: o }
					)
				}
			}
		}
	}
	function oy(r) {
		return typeof r != 'string' || r.length === 0
			? {}
			: r
					.split(En)
					.map(function (e) {
						return Fs(e)
					})
					.filter(function (e) {
						return e !== void 0 && e.value.length > 0
					})
					.reduce(function (e, t) {
						return (e[t.key] = t.value), e
					}, {})
	}
	var zl = (function () {
			function r() {}
			return (
				(r.prototype.inject = function (e, t, n) {
					var i = xe.getBaggage(e)
					if (!(!i || As(e))) {
						var s = Bl(i)
								.filter(function (l) {
									return l.length <= ny
								})
								.slice(0, ry),
							o = Kl(s)
						o.length > 0 && n.set(t, Ys, o)
					}
				}),
				(r.prototype.extract = function (e, t, n) {
					var i = n.get(t, Ys),
						s = Array.isArray(i) ? i.join(En) : i
					if (!s) return e
					var o = {}
					if (s.length === 0) return e
					var l = s.split(En)
					return (
						l.forEach(function (a) {
							var c = Fs(a)
							if (c) {
								var u = { value: c.value }
								c.metadata && (u.metadata = c.metadata),
									(o[c.key] = u)
							}
						}),
						Object.entries(o).length === 0
							? e
							: xe.setBaggage(e, xe.createBaggage(o))
					)
				}),
				(r.prototype.fields = function () {
					return [Ys]
				}),
				r
			)
		})(),
		Dl = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		ay = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		}
	function Cn(r) {
		var e,
			t,
			n = {}
		if (typeof r != 'object' || r == null) return n
		try {
			for (
				var i = Dl(Object.entries(r)), s = i.next();
				!s.done;
				s = i.next()
			) {
				var o = ay(s.value, 2),
					l = o[0],
					a = o[1]
				if (!ly(l)) {
					Y.warn('Invalid attribute key: ' + l)
					continue
				}
				if (!jl(a)) {
					Y.warn('Invalid attribute value set for key: ' + l)
					continue
				}
				Array.isArray(a) ? (n[l] = a.slice()) : (n[l] = a)
			}
		} catch (c) {
			e = { error: c }
		} finally {
			try {
				s && !s.done && (t = i.return) && t.call(i)
			} finally {
				if (e) throw e.error
			}
		}
		return n
	}
	function ly(r) {
		return typeof r == 'string' && r.length > 0
	}
	function jl(r) {
		return r == null ? !0 : Array.isArray(r) ? cy(r) : Ql(r)
	}
	function cy(r) {
		var e, t, n
		try {
			for (var i = Dl(r), s = i.next(); !s.done; s = i.next()) {
				var o = s.value
				if (o != null) {
					if (!n) {
						if (Ql(o)) {
							n = typeof o
							continue
						}
						return !1
					}
					if (typeof o !== n) return !1
				}
			}
		} catch (l) {
			e = { error: l }
		} finally {
			try {
				s && !s.done && (t = i.return) && t.call(i)
			} finally {
				if (e) throw e.error
			}
		}
		return !0
	}
	function Ql(r) {
		switch (typeof r) {
			case 'number':
			case 'boolean':
			case 'string':
				return !0
		}
		return !1
	}
	function uy() {
		return function (r) {
			Y.error(dy(r))
		}
	}
	function dy(r) {
		return typeof r == 'string' ? r : JSON.stringify(hy(r))
	}
	function hy(r) {
		for (var e = {}, t = r; t !== null; )
			Object.getOwnPropertyNames(t).forEach(function (n) {
				if (!e[n]) {
					var i = t[n]
					i && (e[n] = String(i))
				}
			}),
				(t = Object.getPrototypeOf(t))
		return e
	}
	var py = uy()
	function Gn(r) {
		try {
			py(r)
		} catch (e) {}
	}
	var qe
	;(function (r) {
		;(r.AlwaysOff = 'always_off'),
			(r.AlwaysOn = 'always_on'),
			(r.ParentBasedAlwaysOff = 'parentbased_always_off'),
			(r.ParentBasedAlwaysOn = 'parentbased_always_on'),
			(r.ParentBasedTraceIdRatio = 'parentbased_traceidratio'),
			(r.TraceIdRatio = 'traceidratio')
	})(qe || (qe = {}))
	var fy = ',',
		my = ['OTEL_SDK_DISABLED']
	function yy(r) {
		return my.indexOf(r) > -1
	}
	var by = [
		'OTEL_BSP_EXPORT_TIMEOUT',
		'OTEL_BSP_MAX_EXPORT_BATCH_SIZE',
		'OTEL_BSP_MAX_QUEUE_SIZE',
		'OTEL_BSP_SCHEDULE_DELAY',
		'OTEL_BLRP_EXPORT_TIMEOUT',
		'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE',
		'OTEL_BLRP_MAX_QUEUE_SIZE',
		'OTEL_BLRP_SCHEDULE_DELAY',
		'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT',
		'OTEL_ATTRIBUTE_COUNT_LIMIT',
		'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT',
		'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT',
		'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT',
		'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT',
		'OTEL_SPAN_EVENT_COUNT_LIMIT',
		'OTEL_SPAN_LINK_COUNT_LIMIT',
		'OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT',
		'OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT',
		'OTEL_EXPORTER_OTLP_TIMEOUT',
		'OTEL_EXPORTER_OTLP_TRACES_TIMEOUT',
		'OTEL_EXPORTER_OTLP_METRICS_TIMEOUT',
		'OTEL_EXPORTER_OTLP_LOGS_TIMEOUT',
		'OTEL_EXPORTER_JAEGER_AGENT_PORT',
	]
	function gy(r) {
		return by.indexOf(r) > -1
	}
	var Sy = ['OTEL_NO_PATCH_MODULES', 'OTEL_PROPAGATORS']
	function vy(r) {
		return Sy.indexOf(r) > -1
	}
	var Vn = 1 / 0,
		Nn = 128,
		Ry = 128,
		Iy = 128,
		$l = {
			OTEL_SDK_DISABLED: !1,
			CONTAINER_NAME: '',
			ECS_CONTAINER_METADATA_URI_V4: '',
			ECS_CONTAINER_METADATA_URI: '',
			HOSTNAME: '',
			KUBERNETES_SERVICE_HOST: '',
			NAMESPACE: '',
			OTEL_BSP_EXPORT_TIMEOUT: 3e4,
			OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
			OTEL_BSP_MAX_QUEUE_SIZE: 2048,
			OTEL_BSP_SCHEDULE_DELAY: 5e3,
			OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
			OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
			OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
			OTEL_BLRP_SCHEDULE_DELAY: 5e3,
			OTEL_EXPORTER_JAEGER_AGENT_HOST: '',
			OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
			OTEL_EXPORTER_JAEGER_ENDPOINT: '',
			OTEL_EXPORTER_JAEGER_PASSWORD: '',
			OTEL_EXPORTER_JAEGER_USER: '',
			OTEL_EXPORTER_OTLP_ENDPOINT: '',
			OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: '',
			OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: '',
			OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: '',
			OTEL_EXPORTER_OTLP_HEADERS: '',
			OTEL_EXPORTER_OTLP_TRACES_HEADERS: '',
			OTEL_EXPORTER_OTLP_METRICS_HEADERS: '',
			OTEL_EXPORTER_OTLP_LOGS_HEADERS: '',
			OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
			OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
			OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
			OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
			OTEL_EXPORTER_ZIPKIN_ENDPOINT: 'http://localhost:9411/api/v2/spans',
			OTEL_LOG_LEVEL: de.INFO,
			OTEL_NO_PATCH_MODULES: [],
			OTEL_PROPAGATORS: ['tracecontext', 'baggage'],
			OTEL_RESOURCE_ATTRIBUTES: '',
			OTEL_SERVICE_NAME: '',
			OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: Vn,
			OTEL_ATTRIBUTE_COUNT_LIMIT: Nn,
			OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: Vn,
			OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: Nn,
			OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: Vn,
			OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: Nn,
			OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
			OTEL_SPAN_LINK_COUNT_LIMIT: 128,
			OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: Ry,
			OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: Iy,
			OTEL_TRACES_EXPORTER: '',
			OTEL_TRACES_SAMPLER: qe.ParentBasedAlwaysOn,
			OTEL_TRACES_SAMPLER_ARG: '',
			OTEL_LOGS_EXPORTER: '',
			OTEL_EXPORTER_OTLP_INSECURE: '',
			OTEL_EXPORTER_OTLP_TRACES_INSECURE: '',
			OTEL_EXPORTER_OTLP_METRICS_INSECURE: '',
			OTEL_EXPORTER_OTLP_LOGS_INSECURE: '',
			OTEL_EXPORTER_OTLP_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_COMPRESSION: '',
			OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: '',
			OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: '',
			OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: '',
			OTEL_EXPORTER_OTLP_CLIENT_KEY: '',
			OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: '',
			OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: '',
			OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: '',
			OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: '',
			OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
			OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: 'http/protobuf',
			OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: 'http/protobuf',
			OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: 'http/protobuf',
			OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: 'cumulative',
		}
	function wy(r, e, t) {
		if (typeof t[r] != 'undefined') {
			var n = String(t[r])
			e[r] = n.toLowerCase() === 'true'
		}
	}
	function Zy(r, e, t, n, i) {
		if (
			(n === void 0 && (n = -1 / 0),
			i === void 0 && (i = 1 / 0),
			typeof t[r] != 'undefined')
		) {
			var s = Number(t[r])
			isNaN(s) || (s < n ? (e[r] = n) : s > i ? (e[r] = i) : (e[r] = s))
		}
	}
	function Ty(r, e, t, n) {
		n === void 0 && (n = fy)
		var i = t[r]
		typeof i == 'string' &&
			(e[r] = i.split(n).map(function (s) {
				return s.trim()
			}))
	}
	var Ey = {
		ALL: de.ALL,
		VERBOSE: de.VERBOSE,
		DEBUG: de.DEBUG,
		INFO: de.INFO,
		WARN: de.WARN,
		ERROR: de.ERROR,
		NONE: de.NONE,
	}
	function Cy(r, e, t) {
		var n = t[r]
		if (typeof n == 'string') {
			var i = Ey[n.toUpperCase()]
			i != null && (e[r] = i)
		}
	}
	function ql(r) {
		var e = {}
		for (var t in $l) {
			var n = t
			switch (n) {
				case 'OTEL_LOG_LEVEL':
					Cy(n, e, r)
					break
				default:
					if (yy(n)) wy(n, e, r)
					else if (gy(n)) Zy(n, e, r)
					else if (vy(n)) Ty(n, e, r)
					else {
						var i = r[n]
						typeof i != 'undefined' &&
							i !== null &&
							(e[n] = String(i))
					}
			}
		}
		return e
	}
	var Xr =
		typeof globalThis == 'object'
			? globalThis
			: typeof self == 'object'
				? self
				: typeof window == 'object'
					? window
					: typeof global == 'object'
						? global
						: {}
	function lt() {
		var r = ql(Xr)
		return Object.assign({}, $l, r)
	}
	function Gy() {
		return ql(Xr)
	}
	function ec(r) {
		return r >= 48 && r <= 57
			? r - 48
			: r >= 97 && r <= 102
				? r - 87
				: r - 55
	}
	function Js(r) {
		for (
			var e = new Uint8Array(r.length / 2), t = 0, n = 0;
			n < r.length;
			n += 2
		) {
			var i = ec(r.charCodeAt(n)),
				s = ec(r.charCodeAt(n + 1))
			e[t++] = (i << 4) | s
		}
		return e
	}
	var Oe = performance,
		Vy = '1.26.0',
		Ny = 'exception.type',
		Ly = 'exception.message',
		Xy = 'exception.stacktrace',
		Wy = 'http.method',
		_y = 'http.url',
		xy = 'http.host',
		Oy = 'http.scheme',
		ky = 'http.status_code',
		Py = 'http.user_agent',
		Uy = 'http.response_content_length',
		Ay = 'http.response_content_length_uncompressed',
		Hs = Ny,
		Ks = Ly,
		My = Xy,
		tc = Wy,
		Wr = _y,
		rc = xy,
		nc = Oy,
		ic = ky,
		Bs = Py,
		Yy = Uy,
		Fy = Ay,
		Jy = 'deployment.environment',
		Hy = 'process.runtime.name',
		Ky = 'service.name',
		By = 'telemetry.sdk.name',
		zy = 'telemetry.sdk.language',
		Dy = 'telemetry.sdk.version',
		jy = Jy,
		Qy = Hy,
		sc = Ky,
		zs = By,
		Ds = zy,
		js = Dy,
		$y = 'webjs',
		qy = $y,
		zt,
		Qs =
			((zt = {}),
			(zt[zs] = 'opentelemetry'),
			(zt[Qy] = 'browser'),
			(zt[Ds] = qy),
			(zt[js] = Vy),
			zt),
		eb = 9,
		tb = 6,
		rb = Math.pow(10, tb),
		Ln = Math.pow(10, eb)
	function ct(r) {
		var e = r / 1e3,
			t = Math.trunc(e),
			n = Math.round((r % 1e3) * rb)
		return [t, n]
	}
	function $s() {
		var r = Oe.timeOrigin
		if (typeof r != 'number') {
			var e = Oe
			r = e.timing && e.timing.fetchStart
		}
		return r
	}
	function Dt(r) {
		var e = ct($s()),
			t = ct(typeof r == 'number' ? r : Oe.now())
		return ac(e, t)
	}
	function _r(r) {
		if (qs(r)) return r
		if (typeof r == 'number') return r < $s() ? Dt(r) : ct(r)
		if (r instanceof Date) return ct(r.getTime())
		throw TypeError('Invalid input type')
	}
	function nb(r, e) {
		var t = e[0] - r[0],
			n = e[1] - r[1]
		return n < 0 && ((t -= 1), (n += Ln)), [t, n]
	}
	function ut(r) {
		return r[0] * Ln + r[1]
	}
	function qs(r) {
		return (
			Array.isArray(r) &&
			r.length === 2 &&
			typeof r[0] == 'number' &&
			typeof r[1] == 'number'
		)
	}
	function oc(r) {
		return qs(r) || typeof r == 'number' || r instanceof Date
	}
	function ac(r, e) {
		var t = [r[0] + e[0], r[1] + e[1]]
		return t[1] >= Ln && ((t[1] -= Ln), (t[0] += 1)), t
	}
	var Ot
	;(function (r) {
		;(r[(r.SUCCESS = 0)] = 'SUCCESS'), (r[(r.FAILED = 1)] = 'FAILED')
	})(Ot || (Ot = {}))
	var ib = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		lc = (function () {
			function r(e) {
				e === void 0 && (e = {})
				var t
				;(this._propagators =
					(t = e.propagators) !== null && t !== void 0 ? t : []),
					(this._fields = Array.from(
						new Set(
							this._propagators
								.map(function (n) {
									return typeof n.fields == 'function'
										? n.fields()
										: []
								})
								.reduce(function (n, i) {
									return n.concat(i)
								}, []),
						),
					))
			}
			return (
				(r.prototype.inject = function (e, t, n) {
					var i, s
					try {
						for (
							var o = ib(this._propagators), l = o.next();
							!l.done;
							l = o.next()
						) {
							var a = l.value
							try {
								a.inject(e, t, n)
							} catch (c) {
								Y.warn(
									'Failed to inject with ' +
										a.constructor.name +
										'. Err: ' +
										c.message,
								)
							}
						}
					} catch (c) {
						i = { error: c }
					} finally {
						try {
							l && !l.done && (s = o.return) && s.call(o)
						} finally {
							if (i) throw i.error
						}
					}
				}),
				(r.prototype.extract = function (e, t, n) {
					return this._propagators.reduce(function (i, s) {
						try {
							return s.extract(i, t, n)
						} catch (o) {
							Y.warn(
								'Failed to inject with ' +
									s.constructor.name +
									'. Err: ' +
									o.message,
							)
						}
						return i
					}, e)
				}),
				(r.prototype.fields = function () {
					return this._fields.slice()
				}),
				r
			)
		})(),
		eo = '[_0-9a-z-*/]',
		sb = '[a-z]' + eo + '{0,255}',
		ob = '[a-z0-9]' + eo + '{0,240}@[a-z]' + eo + '{0,13}',
		ab = new RegExp('^(?:' + sb + '|' + ob + ')$'),
		lb = /^[ -~]{0,255}[!-~]$/,
		cb = /,|=/
	function ub(r) {
		return ab.test(r)
	}
	function db(r) {
		return lb.test(r) && !cb.test(r)
	}
	var cc = 32,
		hb = 512,
		uc = ',',
		dc = '=',
		pb = (function () {
			function r(e) {
				;(this._internalState = new Map()), e && this._parse(e)
			}
			return (
				(r.prototype.set = function (e, t) {
					var n = this._clone()
					return (
						n._internalState.has(e) && n._internalState.delete(e),
						n._internalState.set(e, t),
						n
					)
				}),
				(r.prototype.unset = function (e) {
					var t = this._clone()
					return t._internalState.delete(e), t
				}),
				(r.prototype.get = function (e) {
					return this._internalState.get(e)
				}),
				(r.prototype.serialize = function () {
					var e = this
					return this._keys()
						.reduce(function (t, n) {
							return t.push(n + dc + e.get(n)), t
						}, [])
						.join(uc)
				}),
				(r.prototype._parse = function (e) {
					e.length > hb ||
						((this._internalState = e
							.split(uc)
							.reverse()
							.reduce(function (t, n) {
								var i = n.trim(),
									s = i.indexOf(dc)
								if (s !== -1) {
									var o = i.slice(0, s),
										l = i.slice(s + 1, n.length)
									ub(o) && db(l) && t.set(o, l)
								}
								return t
							}, new Map())),
						this._internalState.size > cc &&
							(this._internalState = new Map(
								Array.from(this._internalState.entries())
									.reverse()
									.slice(0, cc),
							)))
				}),
				(r.prototype._keys = function () {
					return Array.from(this._internalState.keys()).reverse()
				}),
				(r.prototype._clone = function () {
					var e = new r()
					return (e._internalState = new Map(this._internalState)), e
				}),
				r
			)
		})(),
		Xn = 'traceparent',
		to = 'tracestate',
		fb = '00',
		mb = '(?!ff)[\\da-f]{2}',
		yb = '(?![0]{32})[\\da-f]{32}',
		bb = '(?![0]{16})[\\da-f]{16}',
		gb = '[\\da-f]{2}',
		Sb = new RegExp(
			'^\\s?(' +
				mb +
				')-(' +
				yb +
				')-(' +
				bb +
				')-(' +
				gb +
				')(-.*)?\\s?$',
		)
	function vb(r) {
		var e = Sb.exec(r)
		return !e || (e[1] === '00' && e[5])
			? null
			: { traceId: e[2], spanId: e[3], traceFlags: parseInt(e[4], 16) }
	}
	var hc = (function () {
			function r() {}
			return (
				(r.prototype.inject = function (e, t, n) {
					var i = ae.getSpanContext(e)
					if (!(!i || As(e) || !Zn(i))) {
						var s =
							fb +
							'-' +
							i.traceId +
							'-' +
							i.spanId +
							'-0' +
							Number(i.traceFlags || at.NONE).toString(16)
						n.set(t, Xn, s),
							i.traceState &&
								n.set(t, to, i.traceState.serialize())
					}
				}),
				(r.prototype.extract = function (e, t, n) {
					var i = n.get(t, Xn)
					if (!i) return e
					var s = Array.isArray(i) ? i[0] : i
					if (typeof s != 'string') return e
					var o = vb(s)
					if (!o) return e
					o.isRemote = !0
					var l = n.get(t, to)
					if (l) {
						var a = Array.isArray(l) ? l.join(',') : l
						o.traceState = new pb(typeof a == 'string' ? a : void 0)
					}
					return ae.setSpanContext(e, o)
				}),
				(r.prototype.fields = function () {
					return [Xn, to]
				}),
				r
			)
		})(),
		Rb = '[object Object]',
		Ib = '[object Null]',
		wb = '[object Undefined]',
		Zb = Function.prototype,
		pc = Zb.toString,
		Tb = pc.call(Object),
		Eb = Cb(Object.getPrototypeOf, Object),
		fc = Object.prototype,
		mc = fc.hasOwnProperty,
		kt = Symbol ? Symbol.toStringTag : void 0,
		yc = fc.toString
	function Cb(r, e) {
		return function (t) {
			return r(e(t))
		}
	}
	function bc(r) {
		if (!Gb(r) || Vb(r) !== Rb) return !1
		var e = Eb(r)
		if (e === null) return !0
		var t = mc.call(e, 'constructor') && e.constructor
		return typeof t == 'function' && t instanceof t && pc.call(t) === Tb
	}
	function Gb(r) {
		return r != null && typeof r == 'object'
	}
	function Vb(r) {
		return r == null
			? r === void 0
				? wb
				: Ib
			: kt && kt in Object(r)
				? Nb(r)
				: Lb(r)
	}
	function Nb(r) {
		var e = mc.call(r, kt),
			t = r[kt],
			n = !1
		try {
			;(r[kt] = void 0), (n = !0)
		} catch (s) {}
		var i = yc.call(r)
		return n && (e ? (r[kt] = t) : delete r[kt]), i
	}
	function Lb(r) {
		return yc.call(r)
	}
	var Xb = 20
	function Wb() {
		for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e]
		for (var t = r.shift(), n = new WeakMap(); r.length > 0; )
			t = gc(t, r.shift(), 0, n)
		return t
	}
	function ro(r) {
		return Wn(r) ? r.slice() : r
	}
	function gc(r, e, t, n) {
		t === void 0 && (t = 0)
		var i
		if (!(t > Xb)) {
			if ((t++, _n(r) || _n(e) || vc(e))) i = ro(e)
			else if (Wn(r)) {
				if (((i = r.slice()), Wn(e)))
					for (var s = 0, o = e.length; s < o; s++) i.push(ro(e[s]))
				else if (xr(e))
					for (
						var l = Object.keys(e), s = 0, o = l.length;
						s < o;
						s++
					) {
						var a = l[s]
						i[a] = ro(e[a])
					}
			} else if (xr(r))
				if (xr(e)) {
					if (!_b(r, e)) return e
					i = Object.assign({}, r)
					for (
						var l = Object.keys(e), s = 0, o = l.length;
						s < o;
						s++
					) {
						var a = l[s],
							c = e[a]
						if (_n(c))
							typeof c == 'undefined' ? delete i[a] : (i[a] = c)
						else {
							var u = i[a],
								d = c
							if (Sc(r, a, n) || Sc(e, a, n)) delete i[a]
							else {
								if (xr(u) && xr(d)) {
									var h = n.get(u) || [],
										p = n.get(d) || []
									h.push({ obj: r, key: a }),
										p.push({ obj: e, key: a }),
										n.set(u, h),
										n.set(d, p)
								}
								i[a] = gc(i[a], c, t, n)
							}
						}
					}
				} else i = e
			return i
		}
	}
	function Sc(r, e, t) {
		for (var n = t.get(r[e]) || [], i = 0, s = n.length; i < s; i++) {
			var o = n[i]
			if (o.key === e && o.obj === r) return !0
		}
		return !1
	}
	function Wn(r) {
		return Array.isArray(r)
	}
	function vc(r) {
		return typeof r == 'function'
	}
	function xr(r) {
		return !_n(r) && !Wn(r) && !vc(r) && typeof r == 'object'
	}
	function _n(r) {
		return (
			typeof r == 'string' ||
			typeof r == 'number' ||
			typeof r == 'boolean' ||
			typeof r == 'undefined' ||
			r instanceof Date ||
			r instanceof RegExp ||
			r === null
		)
	}
	function _b(r, e) {
		return !(!bc(r) || !bc(e))
	}
	var xb = function (r) {
		var e = typeof Symbol == 'function' && Symbol.iterator,
			t = e && r[e],
			n = 0
		if (t) return t.call(r)
		if (r && typeof r.length == 'number')
			return {
				next: function () {
					return (
						r && n >= r.length && (r = void 0),
						{ value: r && r[n++], done: !r }
					)
				},
			}
		throw new TypeError(
			e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
		)
	}
	function Rc(r, e) {
		return typeof e == 'string' ? r === e : !!r.match(e)
	}
	function Ic(r, e) {
		var t, n
		if (!e) return !1
		try {
			for (var i = xb(e), s = i.next(); !s.done; s = i.next()) {
				var o = s.value
				if (Rc(r, o)) return !0
			}
		} catch (l) {
			t = { error: l }
		} finally {
			try {
				s && !s.done && (n = i.return) && n.call(i)
			} finally {
				if (t) throw t.error
			}
		}
		return !1
	}
	var Ob = (function () {
			function r() {
				var e = this
				this._promise = new Promise(function (t, n) {
					;(e._resolve = t), (e._reject = n)
				})
			}
			return (
				Object.defineProperty(r.prototype, 'promise', {
					get: function () {
						return this._promise
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype.resolve = function (e) {
					this._resolve(e)
				}),
				(r.prototype.reject = function (e) {
					this._reject(e)
				}),
				r
			)
		})(),
		kb = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		Pb = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		wc = (function () {
			function r(e, t) {
				;(this._callback = e),
					(this._that = t),
					(this._isCalled = !1),
					(this._deferred = new Ob())
			}
			return (
				Object.defineProperty(r.prototype, 'isCalled', {
					get: function () {
						return this._isCalled
					},
					enumerable: !1,
					configurable: !0,
				}),
				Object.defineProperty(r.prototype, 'promise', {
					get: function () {
						return this._deferred.promise
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype.call = function () {
					for (
						var e, t = this, n = [], i = 0;
						i < arguments.length;
						i++
					)
						n[i] = arguments[i]
					if (!this._isCalled) {
						this._isCalled = !0
						try {
							Promise.resolve(
								(e = this._callback).call.apply(
									e,
									Pb([this._that], kb(n), !1),
								),
							).then(
								function (s) {
									return t._deferred.resolve(s)
								},
								function (s) {
									return t._deferred.reject(s)
								},
							)
						} catch (s) {
							this._deferred.reject(s)
						}
					}
					return this._deferred.promise
				}),
				r
			)
		})(),
		Ub = {
			getKeyPairs: Bl,
			serializeKeyPairs: Kl,
			parseKeyPairsIntoRecord: oy,
			parsePairKeyValue: Fs,
		},
		Ab = (function () {
			function r() {}
			return (r.prototype.emit = function (e) {}), r
		})(),
		Mb = (function () {
			function r() {}
			return (
				(r.prototype.getLogger = function (e, t, n) {
					return new Ab()
				}),
				r
			)
		})(),
		Zc = new Mb(),
		Yb =
			typeof globalThis == 'object'
				? globalThis
				: typeof self == 'object'
					? self
					: typeof window == 'object'
						? window
						: typeof global == 'object'
							? global
							: {},
		xn = Symbol.for('io.opentelemetry.js.api.logs'),
		Or = Yb
	function Fb(r, e, t) {
		return function (n) {
			return n === r ? e : t
		}
	}
	var Tc = 1,
		Jb = (function () {
			function r() {}
			return (
				(r.getInstance = function () {
					return (
						this._instance || (this._instance = new r()),
						this._instance
					)
				}),
				(r.prototype.setGlobalLoggerProvider = function (e) {
					return Or[xn]
						? this.getLoggerProvider()
						: ((Or[xn] = Fb(Tc, e, Zc)), e)
				}),
				(r.prototype.getLoggerProvider = function () {
					var e, t
					return (t =
						(e = Or[xn]) === null || e === void 0
							? void 0
							: e.call(Or, Tc)) !== null && t !== void 0
						? t
						: Zc
				}),
				(r.prototype.getLogger = function (e, t, n) {
					return this.getLoggerProvider().getLogger(e, t, n)
				}),
				(r.prototype.disable = function () {
					delete Or[xn]
				}),
				r
			)
		})(),
		Ec = Jb.getInstance()
	function Hb(r, e, t, n) {
		for (var i = 0, s = r.length; i < s; i++) {
			var o = r[i]
			e && o.setTracerProvider(e),
				t && o.setMeterProvider(t),
				n && o.setLoggerProvider && o.setLoggerProvider(n),
				o.getConfig().enabled || o.enable()
		}
	}
	function Kb(r) {
		r.forEach(function (e) {
			return e.disable()
		})
	}
	function Bb(r) {
		var e,
			t,
			n = r.tracerProvider || ae.getTracerProvider(),
			i = r.meterProvider || Fl.getMeterProvider(),
			s = r.loggerProvider || Ec.getLoggerProvider(),
			o =
				(t =
					(e = r.instrumentations) === null || e === void 0
						? void 0
						: e.flat()) !== null && t !== void 0
					? t
					: []
		return (
			Hb(o, n, i, s),
			function () {
				Kb(o)
			}
		)
	}
	function no(r) {
		return typeof r == 'function'
	}
	var we = console.error.bind(console)
	function kr(r, e, t) {
		var n = !!r[e] && r.propertyIsEnumerable(e)
		Object.defineProperty(r, e, {
			configurable: !0,
			enumerable: n,
			writable: !0,
			value: t,
		})
	}
	function Pr(r) {
		r &&
			r.logger &&
			(no(r.logger)
				? (we = r.logger)
				: we("new logger isn't a function, not replacing"))
	}
	function Cc(r, e, t) {
		if (!r || !r[e]) {
			we('no original function ' + e + ' to wrap')
			return
		}
		if (!t) {
			we('no wrapper function'), we(new Error().stack)
			return
		}
		if (!no(r[e]) || !no(t)) {
			we('original object and wrapper must be functions')
			return
		}
		var n = r[e],
			i = t(n, e)
		return (
			kr(i, '__original', n),
			kr(i, '__unwrap', function () {
				r[e] === i && kr(r, e, n)
			}),
			kr(i, '__wrapped', !0),
			kr(r, e, i),
			i
		)
	}
	function zb(r, e, t) {
		if (r) Array.isArray(r) || (r = [r])
		else {
			we('must provide one or more modules to patch'),
				we(new Error().stack)
			return
		}
		if (!(e && Array.isArray(e))) {
			we('must provide one or more functions to wrap on modules')
			return
		}
		r.forEach(function (n) {
			e.forEach(function (i) {
				Cc(n, i, t)
			})
		})
	}
	function Gc(r, e) {
		if (!r || !r[e]) {
			we('no function to unwrap.'), we(new Error().stack)
			return
		}
		if (!r[e].__unwrap)
			we(
				'no original to unwrap to -- has ' +
					e +
					' already been unwrapped?',
			)
		else return r[e].__unwrap()
	}
	function Db(r, e) {
		if (r) Array.isArray(r) || (r = [r])
		else {
			we('must provide one or more modules to patch'),
				we(new Error().stack)
			return
		}
		if (!(e && Array.isArray(e))) {
			we('must provide one or more functions to unwrap on modules')
			return
		}
		r.forEach(function (t) {
			e.forEach(function (n) {
				Gc(t, n)
			})
		})
	}
	;(Pr.wrap = Cc), (Pr.massWrap = zb), (Pr.unwrap = Gc), (Pr.massUnwrap = Db)
	var On = Pr,
		io = function () {
			return (
				(io =
					Object.assign ||
					function (r) {
						for (var e, t = 1, n = arguments.length; t < n; t++) {
							e = arguments[t]
							for (var i in e)
								Object.prototype.hasOwnProperty.call(e, i) &&
									(r[i] = e[i])
						}
						return r
					}),
				io.apply(this, arguments)
			)
		},
		jb = (function () {
			function r(e, t, n) {
				;(this.instrumentationName = e),
					(this.instrumentationVersion = t),
					(this._config = {}),
					(this._wrap = On.wrap),
					(this._unwrap = On.unwrap),
					(this._massWrap = On.massWrap),
					(this._massUnwrap = On.massUnwrap),
					this.setConfig(n),
					(this._diag = Y.createComponentLogger({ namespace: e })),
					(this._tracer = ae.getTracer(e, t)),
					(this._meter = Fl.getMeter(e, t)),
					(this._logger = Ec.getLogger(e, t)),
					this._updateMetricInstruments()
			}
			return (
				Object.defineProperty(r.prototype, 'meter', {
					get: function () {
						return this._meter
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype.setMeterProvider = function (e) {
					;(this._meter = e.getMeter(
						this.instrumentationName,
						this.instrumentationVersion,
					)),
						this._updateMetricInstruments()
				}),
				Object.defineProperty(r.prototype, 'logger', {
					get: function () {
						return this._logger
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype.setLoggerProvider = function (e) {
					this._logger = e.getLogger(
						this.instrumentationName,
						this.instrumentationVersion,
					)
				}),
				(r.prototype.getModuleDefinitions = function () {
					var e,
						t = (e = this.init()) !== null && e !== void 0 ? e : []
					return Array.isArray(t) ? t : [t]
				}),
				(r.prototype._updateMetricInstruments = function () {}),
				(r.prototype.getConfig = function () {
					return this._config
				}),
				(r.prototype.setConfig = function (e) {
					this._config = io({ enabled: !0 }, e)
				}),
				(r.prototype.setTracerProvider = function (e) {
					this._tracer = e.getTracer(
						this.instrumentationName,
						this.instrumentationVersion,
					)
				}),
				Object.defineProperty(r.prototype, 'tracer', {
					get: function () {
						return this._tracer
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype._runSpanCustomizationHook = function (e, t, n, i) {
					if (e)
						try {
							e(n, i)
						} catch (s) {
							this._diag.error(
								'Error running span customization hook due to exception in handler',
								{ triggerName: t },
								s,
							)
						}
				}),
				r
			)
		})(),
		Qb = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		kn = (function (r) {
			Qb(e, r)
			function e(t, n, i) {
				var s = r.call(this, t, n, i) || this
				return s._config.enabled && s.enable(), s
			}
			return e
		})(jb)
	function Pn(r, e, t) {
		var n, i
		try {
			i = r()
		} catch (s) {
			n = s
		} finally {
			if ((e(n, i), n && !t)) throw n
			return i
		}
	}
	function Pt(r) {
		return (
			typeof r == 'function' &&
			typeof r.__original == 'function' &&
			typeof r.__unwrap == 'function' &&
			r.__wrapped === !0
		)
	}
	var $b = 'exception',
		qb = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		Vc = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		eg = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		tg = (function () {
			function r(e, t, n, i, s, o, l, a, c, u) {
				l === void 0 && (l = []),
					(this.attributes = {}),
					(this.links = []),
					(this.events = []),
					(this._droppedAttributesCount = 0),
					(this._droppedEventsCount = 0),
					(this._droppedLinksCount = 0),
					(this.status = { code: xs.UNSET }),
					(this.endTime = [0, 0]),
					(this._ended = !1),
					(this._duration = [-1, -1]),
					(this.name = n),
					(this._spanContext = i),
					(this.parentSpanId = o),
					(this.kind = s),
					(this.links = l)
				var d = Date.now()
				;(this._performanceStartTime = Oe.now()),
					(this._performanceOffset =
						d - (this._performanceStartTime + $s())),
					(this._startTimeProvided = a != null),
					(this.startTime = this._getTime(a != null ? a : d)),
					(this.resource = e.resource),
					(this.instrumentationLibrary = e.instrumentationLibrary),
					(this._spanLimits = e.getSpanLimits()),
					(this._attributeValueLengthLimit =
						this._spanLimits.attributeValueLengthLimit || 0),
					u != null && this.setAttributes(u),
					(this._spanProcessor = e.getActiveSpanProcessor()),
					this._spanProcessor.onStart(this, t)
			}
			return (
				(r.prototype.spanContext = function () {
					return this._spanContext
				}),
				(r.prototype.setAttribute = function (e, t) {
					return t == null || this._isSpanEnded()
						? this
						: e.length === 0
							? (Y.warn('Invalid attribute key: ' + e), this)
							: jl(t)
								? Object.keys(this.attributes).length >=
										this._spanLimits.attributeCountLimit &&
									!Object.prototype.hasOwnProperty.call(
										this.attributes,
										e,
									)
									? (this._droppedAttributesCount++, this)
									: ((this.attributes[e] =
											this._truncateToSize(t)),
										this)
								: (Y.warn(
										'Invalid attribute value set for key: ' +
											e,
									),
									this)
				}),
				(r.prototype.setAttributes = function (e) {
					var t, n
					try {
						for (
							var i = qb(Object.entries(e)), s = i.next();
							!s.done;
							s = i.next()
						) {
							var o = Vc(s.value, 2),
								l = o[0],
								a = o[1]
							this.setAttribute(l, a)
						}
					} catch (c) {
						t = { error: c }
					} finally {
						try {
							s && !s.done && (n = i.return) && n.call(i)
						} finally {
							if (t) throw t.error
						}
					}
					return this
				}),
				(r.prototype.addEvent = function (e, t, n) {
					if (this._isSpanEnded()) return this
					if (this._spanLimits.eventCountLimit === 0)
						return (
							Y.warn('No events allowed.'),
							this._droppedEventsCount++,
							this
						)
					this.events.length >= this._spanLimits.eventCountLimit &&
						(this._droppedEventsCount === 0 &&
							Y.debug('Dropping extra events.'),
						this.events.shift(),
						this._droppedEventsCount++),
						oc(t) && (oc(n) || (n = t), (t = void 0))
					var i = Cn(t)
					return (
						this.events.push({
							name: e,
							attributes: i,
							time: this._getTime(n),
							droppedAttributesCount: 0,
						}),
						this
					)
				}),
				(r.prototype.addLink = function (e) {
					return this.links.push(e), this
				}),
				(r.prototype.addLinks = function (e) {
					var t
					return (
						(t = this.links).push.apply(t, eg([], Vc(e), !1)), this
					)
				}),
				(r.prototype.setStatus = function (e) {
					return this._isSpanEnded()
						? this
						: ((this.status = e), this)
				}),
				(r.prototype.updateName = function (e) {
					return this._isSpanEnded() ? this : ((this.name = e), this)
				}),
				(r.prototype.end = function (e) {
					if (this._isSpanEnded()) {
						Y.error(
							this.name +
								' ' +
								this._spanContext.traceId +
								'-' +
								this._spanContext.spanId +
								' - You can only call end() on a span once.',
						)
						return
					}
					;(this._ended = !0),
						(this.endTime = this._getTime(e)),
						(this._duration = nb(this.startTime, this.endTime)),
						this._duration[0] < 0 &&
							(Y.warn(
								'Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.',
								this.startTime,
								this.endTime,
							),
							(this.endTime = this.startTime.slice()),
							(this._duration = [0, 0])),
						this._droppedEventsCount > 0 &&
							Y.warn(
								'Dropped ' +
									this._droppedEventsCount +
									' events because eventCountLimit reached',
							),
						this._spanProcessor.onEnd(this)
				}),
				(r.prototype._getTime = function (e) {
					if (typeof e == 'number' && e < Oe.now())
						return Dt(e + this._performanceOffset)
					if (typeof e == 'number') return ct(e)
					if (e instanceof Date) return ct(e.getTime())
					if (qs(e)) return e
					if (this._startTimeProvided) return ct(Date.now())
					var t = Oe.now() - this._performanceStartTime
					return ac(this.startTime, ct(t))
				}),
				(r.prototype.isRecording = function () {
					return this._ended === !1
				}),
				(r.prototype.recordException = function (e, t) {
					var n = {}
					typeof e == 'string'
						? (n[Ks] = e)
						: e &&
							(e.code
								? (n[Hs] = e.code.toString())
								: e.name && (n[Hs] = e.name),
							e.message && (n[Ks] = e.message),
							e.stack && (n[My] = e.stack)),
						n[Hs] || n[Ks]
							? this.addEvent($b, n, t)
							: Y.warn('Failed to record an exception ' + e)
				}),
				Object.defineProperty(r.prototype, 'duration', {
					get: function () {
						return this._duration
					},
					enumerable: !1,
					configurable: !0,
				}),
				Object.defineProperty(r.prototype, 'ended', {
					get: function () {
						return this._ended
					},
					enumerable: !1,
					configurable: !0,
				}),
				Object.defineProperty(r.prototype, 'droppedAttributesCount', {
					get: function () {
						return this._droppedAttributesCount
					},
					enumerable: !1,
					configurable: !0,
				}),
				Object.defineProperty(r.prototype, 'droppedEventsCount', {
					get: function () {
						return this._droppedEventsCount
					},
					enumerable: !1,
					configurable: !0,
				}),
				Object.defineProperty(r.prototype, 'droppedLinksCount', {
					get: function () {
						return this._droppedLinksCount
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype._isSpanEnded = function () {
					return (
						this._ended &&
							Y.warn(
								'Can not execute the operation on ended Span {traceId: ' +
									this._spanContext.traceId +
									', spanId: ' +
									this._spanContext.spanId +
									'}',
							),
						this._ended
					)
				}),
				(r.prototype._truncateToLimitUtil = function (e, t) {
					return e.length <= t ? e : e.substr(0, t)
				}),
				(r.prototype._truncateToSize = function (e) {
					var t = this,
						n = this._attributeValueLengthLimit
					return n <= 0
						? (Y.warn(
								'Attribute value limit must be positive, got ' +
									n,
							),
							e)
						: typeof e == 'string'
							? this._truncateToLimitUtil(e, n)
							: Array.isArray(e)
								? e.map(function (i) {
										return typeof i == 'string'
											? t._truncateToLimitUtil(i, n)
											: i
									})
								: e
				}),
				r
			)
		})(),
		jt
	;(function (r) {
		;(r[(r.NOT_RECORD = 0)] = 'NOT_RECORD'),
			(r[(r.RECORD = 1)] = 'RECORD'),
			(r[(r.RECORD_AND_SAMPLED = 2)] = 'RECORD_AND_SAMPLED')
	})(jt || (jt = {}))
	var Un = (function () {
			function r() {}
			return (
				(r.prototype.shouldSample = function () {
					return { decision: jt.NOT_RECORD }
				}),
				(r.prototype.toString = function () {
					return 'AlwaysOffSampler'
				}),
				r
			)
		})(),
		Qt = (function () {
			function r() {}
			return (
				(r.prototype.shouldSample = function () {
					return { decision: jt.RECORD_AND_SAMPLED }
				}),
				(r.prototype.toString = function () {
					return 'AlwaysOnSampler'
				}),
				r
			)
		})(),
		so = (function () {
			function r(e) {
				var t, n, i, s
				;(this._root = e.root),
					this._root ||
						(Gn(
							new Error(
								'ParentBasedSampler must have a root sampler configured',
							),
						),
						(this._root = new Qt())),
					(this._remoteParentSampled =
						(t = e.remoteParentSampled) !== null && t !== void 0
							? t
							: new Qt()),
					(this._remoteParentNotSampled =
						(n = e.remoteParentNotSampled) !== null && n !== void 0
							? n
							: new Un()),
					(this._localParentSampled =
						(i = e.localParentSampled) !== null && i !== void 0
							? i
							: new Qt()),
					(this._localParentNotSampled =
						(s = e.localParentNotSampled) !== null && s !== void 0
							? s
							: new Un())
			}
			return (
				(r.prototype.shouldSample = function (e, t, n, i, s, o) {
					var l = ae.getSpanContext(e)
					return !l || !Zn(l)
						? this._root.shouldSample(e, t, n, i, s, o)
						: l.isRemote
							? l.traceFlags & at.SAMPLED
								? this._remoteParentSampled.shouldSample(
										e,
										t,
										n,
										i,
										s,
										o,
									)
								: this._remoteParentNotSampled.shouldSample(
										e,
										t,
										n,
										i,
										s,
										o,
									)
							: l.traceFlags & at.SAMPLED
								? this._localParentSampled.shouldSample(
										e,
										t,
										n,
										i,
										s,
										o,
									)
								: this._localParentNotSampled.shouldSample(
										e,
										t,
										n,
										i,
										s,
										o,
									)
				}),
				(r.prototype.toString = function () {
					return (
						'ParentBased{root=' +
						this._root.toString() +
						', remoteParentSampled=' +
						this._remoteParentSampled.toString() +
						', remoteParentNotSampled=' +
						this._remoteParentNotSampled.toString() +
						', localParentSampled=' +
						this._localParentSampled.toString() +
						', localParentNotSampled=' +
						this._localParentNotSampled.toString() +
						'}'
					)
				}),
				r
			)
		})(),
		Nc = (function () {
			function r(e) {
				e === void 0 && (e = 0),
					(this._ratio = e),
					(this._ratio = this._normalize(e)),
					(this._upperBound = Math.floor(this._ratio * 4294967295))
			}
			return (
				(r.prototype.shouldSample = function (e, t) {
					return {
						decision:
							Al(t) && this._accumulate(t) < this._upperBound
								? jt.RECORD_AND_SAMPLED
								: jt.NOT_RECORD,
					}
				}),
				(r.prototype.toString = function () {
					return 'TraceIdRatioBased{' + this._ratio + '}'
				}),
				(r.prototype._normalize = function (e) {
					return typeof e != 'number' || isNaN(e)
						? 0
						: e >= 1
							? 1
							: e <= 0
								? 0
								: e
				}),
				(r.prototype._accumulate = function (e) {
					for (var t = 0, n = 0; n < e.length / 8; n++) {
						var i = n * 8,
							s = parseInt(e.slice(i, i + 8), 16)
						t = (t ^ s) >>> 0
					}
					return t
				}),
				r
			)
		})(),
		rg = lt(),
		ng = qe.AlwaysOn,
		$t = 1
	function Lc() {
		var r = lt()
		return {
			sampler: Xc(rg),
			forceFlushTimeoutMillis: 3e4,
			generalLimits: {
				attributeValueLengthLimit: r.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
				attributeCountLimit: r.OTEL_ATTRIBUTE_COUNT_LIMIT,
			},
			spanLimits: {
				attributeValueLengthLimit:
					r.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
				attributeCountLimit: r.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
				linkCountLimit: r.OTEL_SPAN_LINK_COUNT_LIMIT,
				eventCountLimit: r.OTEL_SPAN_EVENT_COUNT_LIMIT,
				attributePerEventCountLimit:
					r.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
				attributePerLinkCountLimit:
					r.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
			},
		}
	}
	function Xc(r) {
		switch ((r === void 0 && (r = lt()), r.OTEL_TRACES_SAMPLER)) {
			case qe.AlwaysOn:
				return new Qt()
			case qe.AlwaysOff:
				return new Un()
			case qe.ParentBasedAlwaysOn:
				return new so({ root: new Qt() })
			case qe.ParentBasedAlwaysOff:
				return new so({ root: new Un() })
			case qe.TraceIdRatio:
				return new Nc(Wc(r))
			case qe.ParentBasedTraceIdRatio:
				return new so({ root: new Nc(Wc(r)) })
			default:
				return (
					Y.error(
						'OTEL_TRACES_SAMPLER value "' +
							r.OTEL_TRACES_SAMPLER +
							' invalid, defaulting to ' +
							ng +
							'".',
					),
					new Qt()
				)
		}
	}
	function Wc(r) {
		if (
			r.OTEL_TRACES_SAMPLER_ARG === void 0 ||
			r.OTEL_TRACES_SAMPLER_ARG === ''
		)
			return (
				Y.error(
					'OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ' +
						$t +
						'.',
				),
				$t
			)
		var e = Number(r.OTEL_TRACES_SAMPLER_ARG)
		return isNaN(e)
			? (Y.error(
					'OTEL_TRACES_SAMPLER_ARG=' +
						r.OTEL_TRACES_SAMPLER_ARG +
						' was given, but it is invalid, defaulting to ' +
						$t +
						'.',
				),
				$t)
			: e < 0 || e > 1
				? (Y.error(
						'OTEL_TRACES_SAMPLER_ARG=' +
							r.OTEL_TRACES_SAMPLER_ARG +
							' was given, but it is out of range ([0..1]), defaulting to ' +
							$t +
							'.',
					),
					$t)
				: e
	}
	function ig(r) {
		var e = { sampler: Xc() },
			t = Lc(),
			n = Object.assign({}, t, e, r)
		return (
			(n.generalLimits = Object.assign(
				{},
				t.generalLimits,
				r.generalLimits || {},
			)),
			(n.spanLimits = Object.assign(
				{},
				t.spanLimits,
				r.spanLimits || {},
			)),
			n
		)
	}
	function sg(r) {
		var e,
			t,
			n,
			i,
			s,
			o,
			l,
			a,
			c,
			u,
			d,
			h,
			p = Object.assign({}, r.spanLimits),
			y = Gy()
		return (
			(p.attributeCountLimit =
				(o =
					(s =
						(i =
							(t =
								(e = r.spanLimits) === null || e === void 0
									? void 0
									: e.attributeCountLimit) !== null &&
							t !== void 0
								? t
								: (n = r.generalLimits) === null || n === void 0
									? void 0
									: n.attributeCountLimit) !== null &&
						i !== void 0
							? i
							: y.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null &&
					s !== void 0
						? s
						: y.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && o !== void 0
					? o
					: Nn),
			(p.attributeValueLengthLimit =
				(h =
					(d =
						(u =
							(a =
								(l = r.spanLimits) === null || l === void 0
									? void 0
									: l.attributeValueLengthLimit) !== null &&
							a !== void 0
								? a
								: (c = r.generalLimits) === null || c === void 0
									? void 0
									: c.attributeValueLengthLimit) !== null &&
						u !== void 0
							? u
							: y.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !==
						null && d !== void 0
						? d
						: y.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null &&
				h !== void 0
					? h
					: Vn),
			Object.assign({}, r, { spanLimits: p })
		)
	}
	var og = (function () {
			function r(e, t) {
				;(this._exporter = e),
					(this._isExporting = !1),
					(this._finishedSpans = []),
					(this._droppedSpansCount = 0)
				var n = lt()
				;(this._maxExportBatchSize =
					typeof (t == null ? void 0 : t.maxExportBatchSize) ==
					'number'
						? t.maxExportBatchSize
						: n.OTEL_BSP_MAX_EXPORT_BATCH_SIZE),
					(this._maxQueueSize =
						typeof (t == null ? void 0 : t.maxQueueSize) == 'number'
							? t.maxQueueSize
							: n.OTEL_BSP_MAX_QUEUE_SIZE),
					(this._scheduledDelayMillis =
						typeof (t == null ? void 0 : t.scheduledDelayMillis) ==
						'number'
							? t.scheduledDelayMillis
							: n.OTEL_BSP_SCHEDULE_DELAY),
					(this._exportTimeoutMillis =
						typeof (t == null ? void 0 : t.exportTimeoutMillis) ==
						'number'
							? t.exportTimeoutMillis
							: n.OTEL_BSP_EXPORT_TIMEOUT),
					(this._shutdownOnce = new wc(this._shutdown, this)),
					this._maxExportBatchSize > this._maxQueueSize &&
						(Y.warn(
							'BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize',
						),
						(this._maxExportBatchSize = this._maxQueueSize))
			}
			return (
				(r.prototype.forceFlush = function () {
					return this._shutdownOnce.isCalled
						? this._shutdownOnce.promise
						: this._flushAll()
				}),
				(r.prototype.onStart = function (e, t) {}),
				(r.prototype.onEnd = function (e) {
					this._shutdownOnce.isCalled ||
						(e.spanContext().traceFlags & at.SAMPLED &&
							this._addToBuffer(e))
				}),
				(r.prototype.shutdown = function () {
					return this._shutdownOnce.call()
				}),
				(r.prototype._shutdown = function () {
					var e = this
					return Promise.resolve()
						.then(function () {
							return e.onShutdown()
						})
						.then(function () {
							return e._flushAll()
						})
						.then(function () {
							return e._exporter.shutdown()
						})
				}),
				(r.prototype._addToBuffer = function (e) {
					if (this._finishedSpans.length >= this._maxQueueSize) {
						this._droppedSpansCount === 0 &&
							Y.debug('maxQueueSize reached, dropping spans'),
							this._droppedSpansCount++
						return
					}
					this._droppedSpansCount > 0 &&
						(Y.warn(
							'Dropped ' +
								this._droppedSpansCount +
								' spans because maxQueueSize reached',
						),
						(this._droppedSpansCount = 0)),
						this._finishedSpans.push(e),
						this._maybeStartTimer()
				}),
				(r.prototype._flushAll = function () {
					var e = this
					return new Promise(function (t, n) {
						for (
							var i = [],
								s = Math.ceil(
									e._finishedSpans.length /
										e._maxExportBatchSize,
								),
								o = 0,
								l = s;
							o < l;
							o++
						)
							i.push(e._flushOneBatch())
						Promise.all(i)
							.then(function () {
								t()
							})
							.catch(n)
					})
				}),
				(r.prototype._flushOneBatch = function () {
					var e = this
					return (
						this._clearTimer(),
						this._finishedSpans.length === 0
							? Promise.resolve()
							: new Promise(function (t, n) {
									var i = setTimeout(function () {
										n(new Error('Timeout'))
									}, e._exportTimeoutMillis)
									Q.with(ey(Q.active()), function () {
										var s
										e._finishedSpans.length <=
										e._maxExportBatchSize
											? ((s = e._finishedSpans),
												(e._finishedSpans = []))
											: (s = e._finishedSpans.splice(
													0,
													e._maxExportBatchSize,
												))
										for (
											var o = function () {
													return e._exporter.export(
														s,
														function (d) {
															var h
															clearTimeout(i),
																d.code ===
																Ot.SUCCESS
																	? t()
																	: n(
																			(h =
																				d.error) !==
																				null &&
																				h !==
																					void 0
																				? h
																				: new Error(
																						'BatchSpanProcessor: span export failed',
																					),
																		)
														},
													)
												},
												l = null,
												a = 0,
												c = s.length;
											a < c;
											a++
										) {
											var u = s[a]
											u.resource.asyncAttributesPending &&
												u.resource
													.waitForAsyncAttributes &&
												(l != null || (l = []),
												l.push(
													u.resource.waitForAsyncAttributes(),
												))
										}
										l === null
											? o()
											: Promise.all(l).then(
													o,
													function (d) {
														Gn(d), n(d)
													},
												)
									})
								})
					)
				}),
				(r.prototype._maybeStartTimer = function () {
					var e = this
					if (!this._isExporting) {
						var t = function () {
							;(e._isExporting = !0),
								e
									._flushOneBatch()
									.finally(function () {
										;(e._isExporting = !1),
											e._finishedSpans.length > 0 &&
												(e._clearTimer(),
												e._maybeStartTimer())
									})
									.catch(function (n) {
										;(e._isExporting = !1), Gn(n)
									})
						}
						if (
							this._finishedSpans.length >=
							this._maxExportBatchSize
						)
							return t()
						this._timer === void 0 &&
							(this._timer = setTimeout(function () {
								return t()
							}, this._scheduledDelayMillis))
					}
				}),
				(r.prototype._clearTimer = function () {
					this._timer !== void 0 &&
						(clearTimeout(this._timer), (this._timer = void 0))
				}),
				r
			)
		})(),
		ag = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		_c = (function (r) {
			ag(e, r)
			function e(t, n) {
				var i = r.call(this, t, n) || this
				return i.onInit(n), i
			}
			return (
				(e.prototype.onInit = function (t) {
					var n = this
					;(t == null ? void 0 : t.disableAutoFlushOnDocumentHide) !==
						!0 &&
						typeof document != 'undefined' &&
						((this._visibilityChangeListener = function () {
							document.visibilityState === 'hidden' &&
								n.forceFlush()
						}),
						(this._pageHideListener = function () {
							n.forceFlush()
						}),
						document.addEventListener(
							'visibilitychange',
							this._visibilityChangeListener,
						),
						document.addEventListener(
							'pagehide',
							this._pageHideListener,
						))
				}),
				(e.prototype.onShutdown = function () {
					typeof document != 'undefined' &&
						(this._visibilityChangeListener &&
							document.removeEventListener(
								'visibilitychange',
								this._visibilityChangeListener,
							),
						this._pageHideListener &&
							document.removeEventListener(
								'pagehide',
								this._pageHideListener,
							))
				}),
				e
			)
		})(og),
		lg = 8,
		cg = 16,
		ug = (function () {
			function r() {
				;(this.generateTraceId = xc(cg)), (this.generateSpanId = xc(lg))
			}
			return r
		})(),
		An = Array(32)
	function xc(r) {
		return function () {
			for (var t = 0; t < r * 2; t++)
				(An[t] = Math.floor(Math.random() * 16) + 48),
					An[t] >= 58 && (An[t] += 39)
			return String.fromCharCode.apply(null, An.slice(0, r * 2))
		}
	}
	var dg = (function () {
		function r(e, t, n) {
			this._tracerProvider = n
			var i = ig(t)
			;(this._sampler = i.sampler),
				(this._generalLimits = i.generalLimits),
				(this._spanLimits = i.spanLimits),
				(this._idGenerator = t.idGenerator || new ug()),
				(this.resource = n.resource),
				(this.instrumentationLibrary = e)
		}
		return (
			(r.prototype.startSpan = function (e, t, n) {
				var i, s, o
				t === void 0 && (t = {}),
					n === void 0 && (n = Q.active()),
					t.root && (n = ae.deleteSpan(n))
				var l = ae.getSpan(n)
				if (As(n)) {
					Y.debug('Instrumentation suppressed, returning Noop Span')
					var a = ae.wrapSpanContext(Pl)
					return a
				}
				var c = l == null ? void 0 : l.spanContext(),
					u = this._idGenerator.generateSpanId(),
					d,
					h,
					p
				!c || !ae.isSpanContextValid(c)
					? (d = this._idGenerator.generateTraceId())
					: ((d = c.traceId), (h = c.traceState), (p = c.spanId))
				var y = (i = t.kind) !== null && i !== void 0 ? i : Lr.INTERNAL,
					f = ((s = t.links) !== null && s !== void 0 ? s : []).map(
						function (L) {
							return {
								context: L.context,
								attributes: Cn(L.attributes),
							}
						},
					),
					m = Cn(t.attributes),
					g = this._sampler.shouldSample(n, d, e, y, m, f)
				h = (o = g.traceState) !== null && o !== void 0 ? o : h
				var v =
						g.decision === Tn.RECORD_AND_SAMPLED
							? at.SAMPLED
							: at.NONE,
					S = { traceId: d, spanId: u, traceFlags: v, traceState: h }
				if (g.decision === Tn.NOT_RECORD) {
					Y.debug(
						'Recording is off, propagating context in a non-recording span',
					)
					var a = ae.wrapSpanContext(S)
					return a
				}
				var I = Cn(Object.assign(m, g.attributes)),
					G = new tg(this, n, e, S, y, p, f, t.startTime, void 0, I)
				return G
			}),
			(r.prototype.startActiveSpan = function (e, t, n, i) {
				var s, o, l
				if (!(arguments.length < 2)) {
					arguments.length === 2
						? (l = t)
						: arguments.length === 3
							? ((s = t), (l = n))
							: ((s = t), (o = n), (l = i))
					var a = o != null ? o : Q.active(),
						c = this.startSpan(e, s, a),
						u = ae.setSpan(a, c)
					return Q.with(u, l, void 0, c)
				}
			}),
			(r.prototype.getGeneralLimits = function () {
				return this._generalLimits
			}),
			(r.prototype.getSpanLimits = function () {
				return this._spanLimits
			}),
			(r.prototype.getActiveSpanProcessor = function () {
				return this._tracerProvider.getActiveSpanProcessor()
			}),
			r
		)
	})()
	function hg() {
		return 'unknown_service'
	}
	var gt = function () {
			return (
				(gt =
					Object.assign ||
					function (r) {
						for (var e, t = 1, n = arguments.length; t < n; t++) {
							e = arguments[t]
							for (var i in e)
								Object.prototype.hasOwnProperty.call(e, i) &&
									(r[i] = e[i])
						}
						return r
					}),
				gt.apply(this, arguments)
			)
		},
		pg = function (r, e, t, n) {
			function i(s) {
				return s instanceof t
					? s
					: new t(function (o) {
							o(s)
						})
			}
			return new (t || (t = Promise))(function (s, o) {
				function l(u) {
					try {
						c(n.next(u))
					} catch (d) {
						o(d)
					}
				}
				function a(u) {
					try {
						c(n.throw(u))
					} catch (d) {
						o(d)
					}
				}
				function c(u) {
					u.done ? s(u.value) : i(u.value).then(l, a)
				}
				c((n = n.apply(r, e || [])).next())
			})
		},
		fg = function (r, e) {
			var t = {
					label: 0,
					sent: function () {
						if (s[0] & 1) throw s[1]
						return s[1]
					},
					trys: [],
					ops: [],
				},
				n,
				i,
				s,
				o
			return (
				(o = { next: l(0), throw: l(1), return: l(2) }),
				typeof Symbol == 'function' &&
					(o[Symbol.iterator] = function () {
						return this
					}),
				o
			)
			function l(c) {
				return function (u) {
					return a([c, u])
				}
			}
			function a(c) {
				if (n) throw new TypeError('Generator is already executing.')
				for (; t; )
					try {
						if (
							((n = 1),
							i &&
								(s =
									c[0] & 2
										? i.return
										: c[0]
											? i.throw ||
												((s = i.return) && s.call(i), 0)
											: i.next) &&
								!(s = s.call(i, c[1])).done)
						)
							return s
						switch (
							((i = 0), s && (c = [c[0] & 2, s.value]), c[0])
						) {
							case 0:
							case 1:
								s = c
								break
							case 4:
								return t.label++, { value: c[1], done: !1 }
							case 5:
								t.label++, (i = c[1]), (c = [0])
								continue
							case 7:
								;(c = t.ops.pop()), t.trys.pop()
								continue
							default:
								if (
									((s = t.trys),
									!(s = s.length > 0 && s[s.length - 1]) &&
										(c[0] === 6 || c[0] === 2))
								) {
									t = 0
									continue
								}
								if (
									c[0] === 3 &&
									(!s || (c[1] > s[0] && c[1] < s[3]))
								) {
									t.label = c[1]
									break
								}
								if (c[0] === 6 && t.label < s[1]) {
									;(t.label = s[1]), (s = c)
									break
								}
								if (s && t.label < s[2]) {
									;(t.label = s[2]), t.ops.push(c)
									break
								}
								s[2] && t.ops.pop(), t.trys.pop()
								continue
						}
						c = e.call(r, t)
					} catch (u) {
						;(c = [6, u]), (i = 0)
					} finally {
						n = s = 0
					}
				if (c[0] & 5) throw c[1]
				return { value: c[0] ? c[1] : void 0, done: !0 }
			}
		},
		mg = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		oo = (function () {
			function r(e, t) {
				var n = this,
					i
				;(this._attributes = e),
					(this.asyncAttributesPending = t != null),
					(this._syncAttributes =
						(i = this._attributes) !== null && i !== void 0
							? i
							: {}),
					(this._asyncAttributesPromise =
						t == null
							? void 0
							: t.then(
									function (s) {
										return (
											(n._attributes = Object.assign(
												{},
												n._attributes,
												s,
											)),
											(n.asyncAttributesPending = !1),
											s
										)
									},
									function (s) {
										return (
											Y.debug(
												"a resource's async attributes promise rejected: %s",
												s,
											),
											(n.asyncAttributesPending = !1),
											{}
										)
									},
								))
			}
			return (
				(r.empty = function () {
					return r.EMPTY
				}),
				(r.default = function () {
					var e
					return new r(
						((e = {}),
						(e[sc] = hg()),
						(e[Ds] = Qs[Ds]),
						(e[zs] = Qs[zs]),
						(e[js] = Qs[js]),
						e),
					)
				}),
				Object.defineProperty(r.prototype, 'attributes', {
					get: function () {
						var e
						return (
							this.asyncAttributesPending &&
								Y.error(
									'Accessing resource attributes before async attributes settled',
								),
							(e = this._attributes) !== null && e !== void 0
								? e
								: {}
						)
					},
					enumerable: !1,
					configurable: !0,
				}),
				(r.prototype.waitForAsyncAttributes = function () {
					return pg(this, void 0, void 0, function () {
						return fg(this, function (e) {
							switch (e.label) {
								case 0:
									return this.asyncAttributesPending
										? [4, this._asyncAttributesPromise]
										: [3, 2]
								case 1:
									e.sent(), (e.label = 2)
								case 2:
									return [2]
							}
						})
					})
				}),
				(r.prototype.merge = function (e) {
					var t = this,
						n
					if (!e) return this
					var i = gt(
						gt({}, this._syncAttributes),
						(n = e._syncAttributes) !== null && n !== void 0
							? n
							: e.attributes,
					)
					if (
						!this._asyncAttributesPromise &&
						!e._asyncAttributesPromise
					)
						return new r(i)
					var s = Promise.all([
						this._asyncAttributesPromise,
						e._asyncAttributesPromise,
					]).then(function (o) {
						var l,
							a = mg(o, 2),
							c = a[0],
							u = a[1]
						return gt(
							gt(
								gt(gt({}, t._syncAttributes), c),
								(l = e._syncAttributes) !== null && l !== void 0
									? l
									: e.attributes,
							),
							u,
						)
					})
					return new r(i, s)
				}),
				(r.EMPTY = new r({})),
				r
			)
		})(),
		Mn = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		yg = (function () {
			function r(e) {
				this._spanProcessors = e
			}
			return (
				(r.prototype.forceFlush = function () {
					var e,
						t,
						n = []
					try {
						for (
							var i = Mn(this._spanProcessors), s = i.next();
							!s.done;
							s = i.next()
						) {
							var o = s.value
							n.push(o.forceFlush())
						}
					} catch (l) {
						e = { error: l }
					} finally {
						try {
							s && !s.done && (t = i.return) && t.call(i)
						} finally {
							if (e) throw e.error
						}
					}
					return new Promise(function (l) {
						Promise.all(n)
							.then(function () {
								l()
							})
							.catch(function (a) {
								Gn(
									a ||
										new Error(
											'MultiSpanProcessor: forceFlush failed',
										),
								),
									l()
							})
					})
				}),
				(r.prototype.onStart = function (e, t) {
					var n, i
					try {
						for (
							var s = Mn(this._spanProcessors), o = s.next();
							!o.done;
							o = s.next()
						) {
							var l = o.value
							l.onStart(e, t)
						}
					} catch (a) {
						n = { error: a }
					} finally {
						try {
							o && !o.done && (i = s.return) && i.call(s)
						} finally {
							if (n) throw n.error
						}
					}
				}),
				(r.prototype.onEnd = function (e) {
					var t, n
					try {
						for (
							var i = Mn(this._spanProcessors), s = i.next();
							!s.done;
							s = i.next()
						) {
							var o = s.value
							o.onEnd(e)
						}
					} catch (l) {
						t = { error: l }
					} finally {
						try {
							s && !s.done && (n = i.return) && n.call(i)
						} finally {
							if (t) throw t.error
						}
					}
				}),
				(r.prototype.shutdown = function () {
					var e,
						t,
						n = []
					try {
						for (
							var i = Mn(this._spanProcessors), s = i.next();
							!s.done;
							s = i.next()
						) {
							var o = s.value
							n.push(o.shutdown())
						}
					} catch (l) {
						e = { error: l }
					} finally {
						try {
							s && !s.done && (t = i.return) && t.call(i)
						} finally {
							if (e) throw e.error
						}
					}
					return new Promise(function (l, a) {
						Promise.all(n).then(function () {
							l()
						}, a)
					})
				}),
				r
			)
		})(),
		bg = (function () {
			function r() {}
			return (
				(r.prototype.onStart = function (e, t) {}),
				(r.prototype.onEnd = function (e) {}),
				(r.prototype.shutdown = function () {
					return Promise.resolve()
				}),
				(r.prototype.forceFlush = function () {
					return Promise.resolve()
				}),
				r
			)
		})(),
		Ut
	;(function (r) {
		;(r[(r.resolved = 0)] = 'resolved'),
			(r[(r.timeout = 1)] = 'timeout'),
			(r[(r.error = 2)] = 'error'),
			(r[(r.unresolved = 3)] = 'unresolved')
	})(Ut || (Ut = {}))
	var gg = (function () {
			function r(e) {
				e === void 0 && (e = {})
				var t
				;(this._registeredSpanProcessors = []),
					(this._tracers = new Map())
				var n = Wb({}, Lc(), sg(e))
				;(this.resource =
					(t = n.resource) !== null && t !== void 0 ? t : oo.empty()),
					(this.resource = oo.default().merge(this.resource)),
					(this._config = Object.assign({}, n, {
						resource: this.resource,
					}))
				var i = this._buildExporterFromEnv()
				if (i !== void 0) {
					var s = new _c(i)
					this.activeSpanProcessor = s
				} else this.activeSpanProcessor = new bg()
			}
			return (
				(r.prototype.getTracer = function (e, t, n) {
					var i =
						e +
						'@' +
						(t || '') +
						':' +
						((n == null ? void 0 : n.schemaUrl) || '')
					return (
						this._tracers.has(i) ||
							this._tracers.set(
								i,
								new dg(
									{
										name: e,
										version: t,
										schemaUrl:
											n == null ? void 0 : n.schemaUrl,
									},
									this._config,
									this,
								),
							),
						this._tracers.get(i)
					)
				}),
				(r.prototype.addSpanProcessor = function (e) {
					this._registeredSpanProcessors.length === 0 &&
						this.activeSpanProcessor.shutdown().catch(function (t) {
							return Y.error(
								'Error while trying to shutdown current span processor',
								t,
							)
						}),
						this._registeredSpanProcessors.push(e),
						(this.activeSpanProcessor = new yg(
							this._registeredSpanProcessors,
						))
				}),
				(r.prototype.getActiveSpanProcessor = function () {
					return this.activeSpanProcessor
				}),
				(r.prototype.register = function (e) {
					e === void 0 && (e = {}),
						ae.setGlobalTracerProvider(this),
						e.propagator === void 0 &&
							(e.propagator = this._buildPropagatorFromEnv()),
						e.contextManager &&
							Q.setGlobalContextManager(e.contextManager),
						e.propagator && xe.setGlobalPropagator(e.propagator)
				}),
				(r.prototype.forceFlush = function () {
					var e = this._config.forceFlushTimeoutMillis,
						t = this._registeredSpanProcessors.map(function (n) {
							return new Promise(function (i) {
								var s,
									o = setTimeout(function () {
										i(
											new Error(
												'Span processor did not completed within timeout period of ' +
													e +
													' ms',
											),
										),
											(s = Ut.timeout)
									}, e)
								n.forceFlush()
									.then(function () {
										clearTimeout(o),
											s !== Ut.timeout &&
												((s = Ut.resolved), i(s))
									})
									.catch(function (l) {
										clearTimeout(o), (s = Ut.error), i(l)
									})
							})
						})
					return new Promise(function (n, i) {
						Promise.all(t)
							.then(function (s) {
								var o = s.filter(function (l) {
									return l !== Ut.resolved
								})
								o.length > 0 ? i(o) : n()
							})
							.catch(function (s) {
								return i([s])
							})
					})
				}),
				(r.prototype.shutdown = function () {
					return this.activeSpanProcessor.shutdown()
				}),
				(r.prototype._getPropagator = function (e) {
					var t
					return (t =
						this.constructor._registeredPropagators.get(e)) ===
						null || t === void 0
						? void 0
						: t()
				}),
				(r.prototype._getSpanExporter = function (e) {
					var t
					return (t =
						this.constructor._registeredExporters.get(e)) ===
						null || t === void 0
						? void 0
						: t()
				}),
				(r.prototype._buildPropagatorFromEnv = function () {
					var e = this,
						t = Array.from(new Set(lt().OTEL_PROPAGATORS)),
						n = t.map(function (s) {
							var o = e._getPropagator(s)
							return (
								o ||
									Y.warn(
										'Propagator "' +
											s +
											'" requested through environment variable is unavailable.',
									),
								o
							)
						}),
						i = n.reduce(function (s, o) {
							return o && s.push(o), s
						}, [])
					if (i.length !== 0)
						return t.length === 1
							? i[0]
							: new lc({ propagators: i })
				}),
				(r.prototype._buildExporterFromEnv = function () {
					var e = lt().OTEL_TRACES_EXPORTER
					if (!(e === 'none' || e === '')) {
						var t = this._getSpanExporter(e)
						return (
							t ||
								Y.error(
									'Exporter "' +
										e +
										'" requested through environment variable is unavailable.',
								),
							t
						)
					}
				}),
				(r._registeredPropagators = new Map([
					[
						'tracecontext',
						function () {
							return new hc()
						},
					],
					[
						'baggage',
						function () {
							return new zl()
						},
					],
				])),
				(r._registeredExporters = new Map()),
				r
			)
		})(),
		Sg = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		vg = function (r, e, t) {
			if (t || arguments.length === 2)
				for (var n = 0, i = e.length, s; n < i; n++)
					(s || !(n in e)) &&
						(s || (s = Array.prototype.slice.call(e, 0, n)),
						(s[n] = e[n]))
			return r.concat(s || Array.prototype.slice.call(e))
		},
		Oc = (function () {
			function r() {
				;(this._enabled = !1), (this._currentContext = _t)
			}
			return (
				(r.prototype._bindFunction = function (e, t) {
					e === void 0 && (e = _t)
					var n = this,
						i = function () {
							for (
								var s = this, o = [], l = 0;
								l < arguments.length;
								l++
							)
								o[l] = arguments[l]
							return n.with(e, function () {
								return t.apply(s, o)
							})
						}
					return (
						Object.defineProperty(i, 'length', {
							enumerable: !1,
							configurable: !0,
							writable: !1,
							value: t.length,
						}),
						i
					)
				}),
				(r.prototype.active = function () {
					return this._currentContext
				}),
				(r.prototype.bind = function (e, t) {
					return (
						e === void 0 && (e = this.active()),
						typeof t == 'function' ? this._bindFunction(e, t) : t
					)
				}),
				(r.prototype.disable = function () {
					return (
						(this._currentContext = _t), (this._enabled = !1), this
					)
				}),
				(r.prototype.enable = function () {
					return this._enabled
						? this
						: ((this._enabled = !0),
							(this._currentContext = _t),
							this)
				}),
				(r.prototype.with = function (e, t, n) {
					for (var i = [], s = 3; s < arguments.length; s++)
						i[s - 3] = arguments[s]
					var o = this._currentContext
					this._currentContext = e || _t
					try {
						return t.call.apply(t, vg([n], Sg(i), !1))
					} finally {
						this._currentContext = o
					}
				}),
				r
			)
		})(),
		Rg = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		Ig = (function (r) {
			Rg(e, r)
			function e(t) {
				t === void 0 && (t = {})
				var n = r.call(this, t) || this
				if (t.contextManager)
					throw 'contextManager should be defined in register method not in constructor'
				if (t.propagator)
					throw 'propagator should be defined in register method not in constructor'
				return n
			}
			return (
				(e.prototype.register = function (t) {
					t === void 0 && (t = {}),
						t.contextManager === void 0 &&
							(t.contextManager = new Oc()),
						t.contextManager && t.contextManager.enable(),
						r.prototype.register.call(this, t)
				}),
				e
			)
		})(gg),
		k
	;(function (r) {
		;(r.CONNECT_END = 'connectEnd'),
			(r.CONNECT_START = 'connectStart'),
			(r.DECODED_BODY_SIZE = 'decodedBodySize'),
			(r.DOM_COMPLETE = 'domComplete'),
			(r.DOM_CONTENT_LOADED_EVENT_END = 'domContentLoadedEventEnd'),
			(r.DOM_CONTENT_LOADED_EVENT_START = 'domContentLoadedEventStart'),
			(r.DOM_INTERACTIVE = 'domInteractive'),
			(r.DOMAIN_LOOKUP_END = 'domainLookupEnd'),
			(r.DOMAIN_LOOKUP_START = 'domainLookupStart'),
			(r.ENCODED_BODY_SIZE = 'encodedBodySize'),
			(r.FETCH_START = 'fetchStart'),
			(r.LOAD_EVENT_END = 'loadEventEnd'),
			(r.LOAD_EVENT_START = 'loadEventStart'),
			(r.NAVIGATION_START = 'navigationStart'),
			(r.REDIRECT_END = 'redirectEnd'),
			(r.REDIRECT_START = 'redirectStart'),
			(r.REQUEST_START = 'requestStart'),
			(r.RESPONSE_END = 'responseEnd'),
			(r.RESPONSE_START = 'responseStart'),
			(r.SECURE_CONNECTION_START = 'secureConnectionStart'),
			(r.UNLOAD_EVENT_END = 'unloadEventEnd'),
			(r.UNLOAD_EVENT_START = 'unloadEventStart')
	})(k || (k = {}))
	var ao
	function wg() {
		return ao || (ao = document.createElement('a')), ao
	}
	function St(r, e) {
		return e in r
	}
	function ge(r, e, t, n) {
		var i = void 0,
			s = void 0
		St(t, e) && typeof t[e] == 'number' && (i = t[e])
		var o = k.FETCH_START
		if (
			(St(t, o) && typeof t[o] == 'number' && (s = t[o]),
			i !== void 0 && s !== void 0 && i >= s)
		)
			return r.addEvent(e, i), r
	}
	function qt(r, e) {
		ge(r, k.FETCH_START, e),
			ge(r, k.DOMAIN_LOOKUP_START, e),
			ge(r, k.DOMAIN_LOOKUP_END, e),
			ge(r, k.CONNECT_START, e),
			St(e, 'name') &&
				e.name.startsWith('https:') &&
				ge(r, k.SECURE_CONNECTION_START, e),
			ge(r, k.CONNECT_END, e),
			ge(r, k.REQUEST_START, e),
			ge(r, k.RESPONSE_START, e),
			ge(r, k.RESPONSE_END, e)
		var t = e[k.ENCODED_BODY_SIZE]
		t !== void 0 && r.setAttribute(Yy, t)
		var n = e[k.DECODED_BODY_SIZE]
		n !== void 0 && t !== n && r.setAttribute(Fy, n)
	}
	function Zg(r) {
		return r.slice().sort(function (e, t) {
			var n = e[k.FETCH_START],
				i = t[k.FETCH_START]
			return n > i ? 1 : n < i ? -1 : 0
		})
	}
	function kc() {
		return typeof location != 'undefined' ? location.origin : void 0
	}
	function Pc(r, e, t, n, i, s) {
		i === void 0 && (i = new WeakSet())
		var o = dt(r)
		r = o.toString()
		var l = Eg(r, e, t, n, i, s)
		if (l.length === 0) return { mainRequest: void 0 }
		if (l.length === 1) return { mainRequest: l[0] }
		var a = Zg(l)
		if (o.origin !== kc() && a.length > 1) {
			var c = a[0],
				u = Tg(a, c[k.RESPONSE_END], t),
				d = c[k.RESPONSE_END],
				h = u[k.FETCH_START]
			return (
				h < d && ((u = c), (c = void 0)),
				{ corsPreFlightRequest: c, mainRequest: u }
			)
		} else return { mainRequest: l[0] }
	}
	function Tg(r, e, t) {
		for (
			var n = ut(t), i = ut(_r(e)), s = r[1], o, l = r.length, a = 1;
			a < l;
			a++
		) {
			var c = r[a],
				u = ut(_r(c[k.FETCH_START])),
				d = ut(_r(c[k.RESPONSE_END])),
				h = n - d
			u >= i && (!o || h < o) && ((o = h), (s = c))
		}
		return s
	}
	function Eg(r, e, t, n, i, s) {
		var o = ut(e),
			l = ut(t),
			a = n.filter(function (c) {
				var u = ut(_r(c[k.FETCH_START])),
					d = ut(_r(c[k.RESPONSE_END]))
				return (
					c.initiatorType.toLowerCase() === (s || 'xmlhttprequest') &&
					c.name === r &&
					u >= o &&
					d <= l
				)
			})
		return (
			a.length > 0 &&
				(a = a.filter(function (c) {
					return !i.has(c)
				})),
			a
		)
	}
	function dt(r) {
		if (typeof URL == 'function')
			return new URL(
				r,
				typeof document != 'undefined'
					? document.baseURI
					: typeof location != 'undefined'
						? location.href
						: void 0,
			)
		var e = wg()
		return (e.href = r), e
	}
	function Uc(r, e) {
		if (r.nodeType === Node.DOCUMENT_NODE) return '/'
		var t = Gg(r, e)
		if (e && t.indexOf('@id') > 0) return t
		var n = ''
		return r.parentNode && (n += Uc(r.parentNode, !1)), (n += t), n
	}
	function Cg(r) {
		if (!r.parentNode) return 0
		var e = [r.nodeType]
		r.nodeType === Node.CDATA_SECTION_NODE && e.push(Node.TEXT_NODE)
		var t = Array.from(r.parentNode.childNodes)
		return (
			(t = t.filter(function (n) {
				var i = n.localName
				return e.indexOf(n.nodeType) >= 0 && i === r.localName
			})),
			t.length >= 1 ? t.indexOf(r) + 1 : 0
		)
	}
	function Gg(r, e) {
		var t = r.nodeType,
			n = Cg(r),
			i = ''
		if (t === Node.ELEMENT_NODE) {
			var s = r.getAttribute('id')
			if (e && s) return '//*[@id="' + s + '"]'
			i = r.localName
		} else if (t === Node.TEXT_NODE || t === Node.CDATA_SECTION_NODE)
			i = 'text()'
		else if (t === Node.COMMENT_NODE) i = 'comment()'
		else return ''
		return i && n > 1 ? '/' + i + '[' + n + ']' : '/' + i
	}
	function Ac(r, e) {
		var t = e || []
		;(typeof t == 'string' || t instanceof RegExp) && (t = [t])
		var n = dt(r)
		return n.origin === kc()
			? !0
			: t.some(function (i) {
					return Rc(r, i)
				})
	}
	var Ur
	;(function (r) {
		;(r.DOCUMENT_LOAD = 'documentLoad'),
			(r.DOCUMENT_FETCH = 'documentFetch'),
			(r.RESOURCE_FETCH = 'resourceFetch')
	})(Ur || (Ur = {}))
	var Vg = '0.40.0',
		Ng = '@opentelemetry/instrumentation-document-load',
		Yn
	;(function (r) {
		;(r.FIRST_PAINT = 'firstPaint'),
			(r.FIRST_CONTENTFUL_PAINT = 'firstContentfulPaint')
	})(Yn || (Yn = {}))
	var Lg = function () {
			var r,
				e,
				t = {},
				n =
					(e = (r = Oe).getEntriesByType) === null || e === void 0
						? void 0
						: e.call(r, 'navigation')[0]
			if (n) {
				var i = Object.values(k)
				i.forEach(function (l) {
					if (St(n, l)) {
						var a = n[l]
						typeof a == 'number' && (t[l] = a)
					}
				})
			} else {
				var s = Oe,
					o = s.timing
				if (o) {
					var i = Object.values(k)
					i.forEach(function (a) {
						if (St(o, a)) {
							var c = o[a]
							typeof c == 'number' && (t[a] = c)
						}
					})
				}
			}
			return t
		},
		Mc = {
			'first-paint': Yn.FIRST_PAINT,
			'first-contentful-paint': Yn.FIRST_CONTENTFUL_PAINT,
		},
		Xg = function (r) {
			var e,
				t,
				n =
					(t = (e = Oe).getEntriesByType) === null || t === void 0
						? void 0
						: t.call(e, 'paint')
			n &&
				n.forEach(function (i) {
					var s = i.name,
						o = i.startTime
					St(Mc, s) && r.addEvent(Mc[s], o)
				})
		},
		Wg = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		_g = (function (r) {
			Wg(e, r)
			function e(t) {
				t === void 0 && (t = {})
				var n = r.call(this, Ng, Vg, t) || this
				return (
					(n.component = 'document-load'),
					(n.version = '1'),
					(n.moduleName = n.component),
					n
				)
			}
			return (
				(e.prototype.init = function () {}),
				(e.prototype._onDocumentLoaded = function () {
					var t = this
					window.setTimeout(function () {
						t._collectPerformance()
					})
				}),
				(e.prototype._addResourcesSpans = function (t) {
					var n = this,
						i,
						s,
						o =
							(s = (i = Oe).getEntriesByType) === null ||
							s === void 0
								? void 0
								: s.call(i, 'resource')
					o &&
						o.forEach(function (l) {
							n._initResourceSpan(l, t)
						})
				}),
				(e.prototype._collectPerformance = function () {
					var t = this,
						n = Array.from(
							document.getElementsByTagName('meta'),
						).find(function (o) {
							return o.getAttribute('name') === Xn
						}),
						i = Lg(),
						s = (n && n.content) || ''
					Q.with(xe.extract(_t, { traceparent: s }), function () {
						var o,
							l = t._startSpan(Ur.DOCUMENT_LOAD, k.FETCH_START, i)
						l &&
							(Q.with(ae.setSpan(Q.active(), l), function () {
								var a = t._startSpan(
									Ur.DOCUMENT_FETCH,
									k.FETCH_START,
									i,
								)
								a &&
									(a.setAttribute(Wr, location.href),
									Q.with(
										ae.setSpan(Q.active(), a),
										function () {
											var c
											t.getConfig().ignoreNetworkEvents ||
												qt(a, i),
												t._addCustomAttributesOnSpan(
													a,
													(c =
														t.getConfig()
															.applyCustomAttributesOnSpan) ===
														null || c === void 0
														? void 0
														: c.documentFetch,
												),
												t._endSpan(a, k.RESPONSE_END, i)
										},
									))
							}),
							l.setAttribute(Wr, location.href),
							l.setAttribute(Bs, navigator.userAgent),
							t._addResourcesSpans(l),
							t.getConfig().ignoreNetworkEvents ||
								(ge(l, k.FETCH_START, i),
								ge(l, k.UNLOAD_EVENT_START, i),
								ge(l, k.UNLOAD_EVENT_END, i),
								ge(l, k.DOM_INTERACTIVE, i),
								ge(l, k.DOM_CONTENT_LOADED_EVENT_START, i),
								ge(l, k.DOM_CONTENT_LOADED_EVENT_END, i),
								ge(l, k.DOM_COMPLETE, i),
								ge(l, k.LOAD_EVENT_START, i),
								ge(l, k.LOAD_EVENT_END, i)),
							t.getConfig().ignorePerformancePaintEvents || Xg(l),
							t._addCustomAttributesOnSpan(
								l,
								(o =
									t.getConfig()
										.applyCustomAttributesOnSpan) ===
									null || o === void 0
									? void 0
									: o.documentLoad,
							),
							t._endSpan(l, k.LOAD_EVENT_END, i))
					})
				}),
				(e.prototype._endSpan = function (t, n, i) {
					t && (St(i, n) ? t.end(i[n]) : t.end())
				}),
				(e.prototype._initResourceSpan = function (t, n) {
					var i,
						s = this._startSpan(
							Ur.RESOURCE_FETCH,
							k.FETCH_START,
							t,
							n,
						)
					s &&
						(s.setAttribute(Wr, t.name),
						this.getConfig().ignoreNetworkEvents || qt(s, t),
						this._addCustomAttributesOnResourceSpan(
							s,
							t,
							(i =
								this.getConfig()
									.applyCustomAttributesOnSpan) === null ||
								i === void 0
								? void 0
								: i.resourceFetch,
						),
						this._endSpan(s, k.RESPONSE_END, t))
				}),
				(e.prototype._startSpan = function (t, n, i, s) {
					if (St(i, n) && typeof i[n] == 'number') {
						var o = this.tracer.startSpan(
							t,
							{ startTime: i[n] },
							s ? ae.setSpan(Q.active(), s) : void 0,
						)
						return o
					}
				}),
				(e.prototype._waitForPageLoad = function () {
					window.document.readyState === 'complete'
						? this._onDocumentLoaded()
						: ((this._onDocumentLoaded =
								this._onDocumentLoaded.bind(this)),
							window.addEventListener(
								'load',
								this._onDocumentLoaded,
							))
				}),
				(e.prototype._addCustomAttributesOnSpan = function (t, n) {
					var i = this
					n &&
						Pn(
							function () {
								return n(t)
							},
							function (s) {
								s &&
									i._diag.error(
										'addCustomAttributesOnSpan',
										s,
									)
							},
							!0,
						)
				}),
				(e.prototype._addCustomAttributesOnResourceSpan = function (
					t,
					n,
					i,
				) {
					var s = this
					i &&
						Pn(
							function () {
								return i(t, n)
							},
							function (o) {
								o &&
									s._diag.error(
										'addCustomAttributesOnResourceSpan',
										o,
									)
							},
							!0,
						)
				}),
				(e.prototype.enable = function () {
					window.removeEventListener('load', this._onDocumentLoaded),
						this._waitForPageLoad()
				}),
				(e.prototype.disable = function () {
					window.removeEventListener('load', this._onDocumentLoaded)
				}),
				e
			)
		})(kn),
		Fn
	;(function (r) {
		;(r.COMPONENT = 'component'),
			(r.HTTP_ERROR_NAME = 'http.error_name'),
			(r.HTTP_STATUS_TEXT = 'http.status_text')
	})(Fn || (Fn = {}))
	var Yc = '0.53.0',
		xg = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		lo,
		Og = 300,
		Fc =
			typeof process == 'object' &&
			((lo = process.release) === null || lo === void 0
				? void 0
				: lo.name) === 'node',
		kg = (function (r) {
			xg(e, r)
			function e(t) {
				t === void 0 && (t = {})
				var n =
					r.call(
						this,
						'@opentelemetry/instrumentation-fetch',
						Yc,
						t,
					) || this
				return (
					(n.component = 'fetch'),
					(n.version = Yc),
					(n.moduleName = n.component),
					(n._usedResources = new WeakSet()),
					(n._tasksCount = 0),
					n
				)
			}
			return (
				(e.prototype.init = function () {}),
				(e.prototype._addChildSpan = function (t, n) {
					var i = this.tracer.startSpan(
						'CORS Preflight',
						{ startTime: n[k.FETCH_START] },
						ae.setSpan(Q.active(), t),
					)
					this.getConfig().ignoreNetworkEvents || qt(i, n),
						i.end(n[k.RESPONSE_END])
				}),
				(e.prototype._addFinalSpanAttributes = function (t, n) {
					var i = dt(n.url)
					t.setAttribute(ic, n.status),
						n.statusText != null &&
							t.setAttribute(Fn.HTTP_STATUS_TEXT, n.statusText),
						t.setAttribute(rc, i.host),
						t.setAttribute(nc, i.protocol.replace(':', '')),
						typeof navigator != 'undefined' &&
							t.setAttribute(Bs, navigator.userAgent)
				}),
				(e.prototype._addHeaders = function (t, n) {
					if (!Ac(n, this.getConfig().propagateTraceHeaderCorsUrls)) {
						var i = {}
						xe.inject(Q.active(), i),
							Object.keys(i).length > 0 &&
								this._diag.debug(
									'headers inject skipped due to CORS policy',
								)
						return
					}
					if (t instanceof Request)
						xe.inject(Q.active(), t.headers, {
							set: function (s, o, l) {
								return s.set(
									o,
									typeof l == 'string' ? l : String(l),
								)
							},
						})
					else if (t.headers instanceof Headers)
						xe.inject(Q.active(), t.headers, {
							set: function (s, o, l) {
								return s.set(
									o,
									typeof l == 'string' ? l : String(l),
								)
							},
						})
					else if (t.headers instanceof Map)
						xe.inject(Q.active(), t.headers, {
							set: function (s, o, l) {
								return s.set(
									o,
									typeof l == 'string' ? l : String(l),
								)
							},
						})
					else {
						var i = {}
						xe.inject(Q.active(), i),
							(t.headers = Object.assign({}, i, t.headers || {}))
					}
				}),
				(e.prototype._clearResources = function () {
					this._tasksCount === 0 &&
						this.getConfig().clearTimingResources &&
						(performance.clearResourceTimings(),
						(this._usedResources = new WeakSet()))
				}),
				(e.prototype._createSpan = function (t, n) {
					var i
					if (
						(n === void 0 && (n = {}),
						Ic(t, this.getConfig().ignoreUrls))
					) {
						this._diag.debug(
							'ignoring span as url matches ignored url',
						)
						return
					}
					var s = (n.method || 'GET').toUpperCase(),
						o = 'HTTP ' + s
					return this.tracer.startSpan(o, {
						kind: Lr.CLIENT,
						attributes:
							((i = {}),
							(i[Fn.COMPONENT] = this.moduleName),
							(i[tc] = s),
							(i[Wr] = t),
							i),
					})
				}),
				(e.prototype._findResourceAndAddNetworkEvents = function (
					t,
					n,
					i,
				) {
					var s = n.entries
					if (!s.length) {
						if (!performance.getEntriesByType) return
						s = performance.getEntriesByType('resource')
					}
					var o = Pc(
						n.spanUrl,
						n.startTime,
						i,
						s,
						this._usedResources,
						'fetch',
					)
					if (o.mainRequest) {
						var l = o.mainRequest
						this._markResourceAsUsed(l)
						var a = o.corsPreFlightRequest
						a &&
							(this._addChildSpan(t, a),
							this._markResourceAsUsed(a)),
							this.getConfig().ignoreNetworkEvents || qt(t, l)
					}
				}),
				(e.prototype._markResourceAsUsed = function (t) {
					this._usedResources.add(t)
				}),
				(e.prototype._endSpan = function (t, n, i) {
					var s = this,
						o = ct(Date.now()),
						l = Dt()
					this._addFinalSpanAttributes(t, i),
						setTimeout(function () {
							var a
							;(a = n.observer) === null ||
								a === void 0 ||
								a.disconnect(),
								s._findResourceAndAddNetworkEvents(t, n, l),
								s._tasksCount--,
								s._clearResources(),
								t.end(o)
						}, Og)
				}),
				(e.prototype._patchConstructor = function () {
					var t = this
					return function (n) {
						var i = t
						return function () {
							for (var o = [], l = 0; l < arguments.length; l++)
								o[l] = arguments[l]
							var a = this,
								c = dt(
									o[0] instanceof Request
										? o[0].url
										: String(o[0]),
								).href,
								u = o[0] instanceof Request ? o[0] : o[1] || {},
								d = i._createSpan(c, u)
							if (!d) return n.apply(this, o)
							var h = i._prepareSpanData(c)
							function p(g, v) {
								i._applyAttributesAfterFetch(g, u, v),
									i._endSpan(g, h, {
										status: v.status || 0,
										statusText: v.message,
										url: c,
									})
							}
							function y(g, v) {
								i._applyAttributesAfterFetch(g, u, v),
									v.status >= 200 && v.status < 400
										? i._endSpan(g, h, v)
										: i._endSpan(g, h, {
												status: v.status,
												statusText: v.statusText,
												url: c,
											})
							}
							function f(g, v, S) {
								try {
									var I = S.clone(),
										G = S.clone(),
										L = I.body
									if (L) {
										var w = L.getReader(),
											V = function () {
												w.read().then(
													function (P) {
														var X = P.done
														X ? y(g, G) : V()
													},
													function (P) {
														p(g, P)
													},
												)
											}
										V()
									} else y(g, S)
								} finally {
									v(S)
								}
							}
							function m(g, v, S) {
								try {
									p(g, S)
								} finally {
									v(S)
								}
							}
							return new Promise(function (g, v) {
								return Q.with(
									ae.setSpan(Q.active(), d),
									function () {
										return (
											i._addHeaders(u, c),
											i._tasksCount++,
											n
												.apply(
													a,
													u instanceof Request
														? [u]
														: [c, u],
												)
												.then(
													f.bind(a, d, g),
													m.bind(a, d, v),
												)
										)
									},
								)
							})
						}
					}
				}),
				(e.prototype._applyAttributesAfterFetch = function (t, n, i) {
					var s = this,
						o = this.getConfig().applyCustomAttributesOnSpan
					o &&
						Pn(
							function () {
								return o(t, n, i)
							},
							function (l) {
								l &&
									s._diag.error(
										'applyCustomAttributesOnSpan',
										l,
									)
							},
							!0,
						)
				}),
				(e.prototype._prepareSpanData = function (t) {
					var n = Dt(),
						i = []
					if (typeof PerformanceObserver != 'function')
						return { entries: i, startTime: n, spanUrl: t }
					var s = new PerformanceObserver(function (o) {
						var l = o.getEntries()
						l.forEach(function (a) {
							a.initiatorType === 'fetch' &&
								a.name === t &&
								i.push(a)
						})
					})
					return (
						s.observe({ entryTypes: ['resource'] }),
						{ entries: i, observer: s, startTime: n, spanUrl: t }
					)
				}),
				(e.prototype.enable = function () {
					if (Fc) {
						this._diag.warn(
							"this instrumentation is intended for web usage only, it does not instrument Node.js's fetch()",
						)
						return
					}
					Pt(fetch) &&
						(this._unwrap(Xr, 'fetch'),
						this._diag.debug(
							'removing previous patch for constructor',
						)),
						this._wrap(Xr, 'fetch', this._patchConstructor())
				}),
				(e.prototype.disable = function () {
					Fc ||
						(this._unwrap(Xr, 'fetch'),
						(this._usedResources = new WeakSet()))
				}),
				e
			)
		})(kn),
		ht
	;(function (r) {
		;(r.METHOD_OPEN = 'open'),
			(r.METHOD_SEND = 'send'),
			(r.EVENT_ABORT = 'abort'),
			(r.EVENT_ERROR = 'error'),
			(r.EVENT_LOAD = 'loaded'),
			(r.EVENT_TIMEOUT = 'timeout')
	})(ht || (ht = {}))
	var Jc = '0.53.0',
		co
	;(function (r) {
		r.HTTP_STATUS_TEXT = 'http.status_text'
	})(co || (co = {}))
	var Pg = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		Ug = 300,
		Ag = (function (r) {
			Pg(e, r)
			function e(t) {
				t === void 0 && (t = {})
				var n =
					r.call(
						this,
						'@opentelemetry/instrumentation-xml-http-request',
						Jc,
						t,
					) || this
				return (
					(n.component = 'xml-http-request'),
					(n.version = Jc),
					(n.moduleName = n.component),
					(n._tasksCount = 0),
					(n._xhrMem = new WeakMap()),
					(n._usedResources = new WeakSet()),
					n
				)
			}
			return (
				(e.prototype.init = function () {}),
				(e.prototype._addHeaders = function (t, n) {
					var i = dt(n).href
					if (!Ac(i, this.getConfig().propagateTraceHeaderCorsUrls)) {
						var s = {}
						xe.inject(Q.active(), s),
							Object.keys(s).length > 0 &&
								this._diag.debug(
									'headers inject skipped due to CORS policy',
								)
						return
					}
					var o = {}
					xe.inject(Q.active(), o),
						Object.keys(o).forEach(function (l) {
							t.setRequestHeader(l, String(o[l]))
						})
				}),
				(e.prototype._addChildSpan = function (t, n) {
					var i = this
					Q.with(ae.setSpan(Q.active(), t), function () {
						var s = i.tracer.startSpan('CORS Preflight', {
							startTime: n[k.FETCH_START],
						})
						i.getConfig().ignoreNetworkEvents || qt(s, n),
							s.end(n[k.RESPONSE_END])
					})
				}),
				(e.prototype._addFinalSpanAttributes = function (t, n, i) {
					if (typeof i == 'string') {
						var s = dt(i)
						n.status !== void 0 && t.setAttribute(ic, n.status),
							n.statusText !== void 0 &&
								t.setAttribute(
									co.HTTP_STATUS_TEXT,
									n.statusText,
								),
							t.setAttribute(rc, s.host),
							t.setAttribute(nc, s.protocol.replace(':', '')),
							t.setAttribute(Bs, navigator.userAgent)
					}
				}),
				(e.prototype._applyAttributesAfterXHR = function (t, n) {
					var i = this,
						s = this.getConfig().applyCustomAttributesOnSpan
					typeof s == 'function' &&
						Pn(
							function () {
								return s(t, n)
							},
							function (o) {
								o &&
									i._diag.error(
										'applyCustomAttributesOnSpan',
										o,
									)
							},
							!0,
						)
				}),
				(e.prototype._addResourceObserver = function (t, n) {
					var i = this._xhrMem.get(t)
					!i ||
						typeof PerformanceObserver != 'function' ||
						typeof PerformanceResourceTiming != 'function' ||
						((i.createdResources = {
							observer: new PerformanceObserver(function (s) {
								var o = s.getEntries(),
									l = dt(n)
								o.forEach(function (a) {
									a.initiatorType === 'xmlhttprequest' &&
										a.name === l.href &&
										i.createdResources &&
										i.createdResources.entries.push(a)
								})
							}),
							entries: [],
						}),
						i.createdResources.observer.observe({
							entryTypes: ['resource'],
						}))
				}),
				(e.prototype._clearResources = function () {
					this._tasksCount === 0 &&
						this.getConfig().clearTimingResources &&
						(Oe.clearResourceTimings(),
						(this._xhrMem = new WeakMap()),
						(this._usedResources = new WeakSet()))
				}),
				(e.prototype._findResourceAndAddNetworkEvents = function (
					t,
					n,
					i,
					s,
					o,
				) {
					if (!(!i || !s || !o || !t.createdResources)) {
						var l = t.createdResources.entries
						;(!l || !l.length) &&
							(l = Oe.getEntriesByType('resource'))
						var a = Pc(dt(i).href, s, o, l, this._usedResources)
						if (a.mainRequest) {
							var c = a.mainRequest
							this._markResourceAsUsed(c)
							var u = a.corsPreFlightRequest
							u &&
								(this._addChildSpan(n, u),
								this._markResourceAsUsed(u)),
								this.getConfig().ignoreNetworkEvents || qt(n, c)
						}
					}
				}),
				(e.prototype._cleanPreviousSpanInformation = function (t) {
					var n = this._xhrMem.get(t)
					if (n) {
						var i = n.callbackToRemoveEvents
						i && i(), this._xhrMem.delete(t)
					}
				}),
				(e.prototype._createSpan = function (t, n, i) {
					var s
					if (Ic(n, this.getConfig().ignoreUrls)) {
						this._diag.debug(
							'ignoring span as url matches ignored url',
						)
						return
					}
					var o = i.toUpperCase(),
						l = this.tracer.startSpan(o, {
							kind: Lr.CLIENT,
							attributes:
								((s = {}),
								(s[tc] = i),
								(s[Wr] = dt(n).toString()),
								s),
						})
					return (
						l.addEvent(ht.METHOD_OPEN),
						this._cleanPreviousSpanInformation(t),
						this._xhrMem.set(t, { span: l, spanUrl: n }),
						l
					)
				}),
				(e.prototype._markResourceAsUsed = function (t) {
					this._usedResources.add(t)
				}),
				(e.prototype._patchOpen = function () {
					var t = this
					return function (n) {
						var i = t
						return function () {
							for (var o = [], l = 0; l < arguments.length; l++)
								o[l] = arguments[l]
							var a = o[0],
								c = o[1]
							return i._createSpan(this, c, a), n.apply(this, o)
						}
					}
				}),
				(e.prototype._patchSend = function () {
					var t = this
					function n(u, d, h, p) {
						var y = d.callbackToRemoveEvents
						typeof y == 'function' && y()
						var f = d.span,
							m = d.spanUrl,
							g = d.sendStartTime
						f &&
							(t._findResourceAndAddNetworkEvents(d, f, m, g, h),
							f.addEvent(u, p),
							t._addFinalSpanAttributes(f, d, m),
							f.end(p),
							t._tasksCount--),
							t._clearResources()
					}
					function i(u, d) {
						var h = t._xhrMem.get(d)
						if (h) {
							;(h.status = d.status),
								(h.statusText = d.statusText),
								t._xhrMem.delete(d),
								h.span && t._applyAttributesAfterXHR(h.span, d)
							var p = Dt(),
								y = Date.now()
							setTimeout(function () {
								n(u, h, p, y)
							}, Ug)
						}
					}
					function s() {
						i(ht.EVENT_ERROR, this)
					}
					function o() {
						i(ht.EVENT_ABORT, this)
					}
					function l() {
						i(ht.EVENT_TIMEOUT, this)
					}
					function a() {
						this.status < 299
							? i(ht.EVENT_LOAD, this)
							: i(ht.EVENT_ERROR, this)
					}
					function c(u) {
						u.removeEventListener('abort', o),
							u.removeEventListener('error', s),
							u.removeEventListener('load', a),
							u.removeEventListener('timeout', l)
						var d = t._xhrMem.get(u)
						d && (d.callbackToRemoveEvents = void 0)
					}
					return function (u) {
						return function () {
							for (
								var h = this, p = [], y = 0;
								y < arguments.length;
								y++
							)
								p[y] = arguments[y]
							var f = t._xhrMem.get(this)
							if (!f) return u.apply(this, p)
							var m = f.span,
								g = f.spanUrl
							return (
								m &&
									g &&
									Q.with(
										ae.setSpan(Q.active(), m),
										function () {
											t._tasksCount++,
												(f.sendStartTime = Dt()),
												m.addEvent(ht.METHOD_SEND),
												h.addEventListener('abort', o),
												h.addEventListener('error', s),
												h.addEventListener('load', a),
												h.addEventListener(
													'timeout',
													l,
												),
												(f.callbackToRemoveEvents =
													function () {
														c(h),
															f.createdResources &&
																f.createdResources.observer.disconnect()
													}),
												t._addHeaders(h, g),
												t._addResourceObserver(h, g)
										},
									),
								u.apply(this, p)
							)
						}
					}
				}),
				(e.prototype.enable = function () {
					this._diag.debug(
						'applying patch to',
						this.moduleName,
						this.version,
					),
						Pt(XMLHttpRequest.prototype.open) &&
							(this._unwrap(XMLHttpRequest.prototype, 'open'),
							this._diag.debug(
								'removing previous patch from method open',
							)),
						Pt(XMLHttpRequest.prototype.send) &&
							(this._unwrap(XMLHttpRequest.prototype, 'send'),
							this._diag.debug(
								'removing previous patch from method send',
							)),
						this._wrap(
							XMLHttpRequest.prototype,
							'open',
							this._patchOpen(),
						),
						this._wrap(
							XMLHttpRequest.prototype,
							'send',
							this._patchSend(),
						)
				}),
				(e.prototype.disable = function () {
					this._diag.debug(
						'removing patch from',
						this.moduleName,
						this.version,
					),
						this._unwrap(XMLHttpRequest.prototype, 'open'),
						this._unwrap(XMLHttpRequest.prototype, 'send'),
						(this._tasksCount = 0),
						(this._xhrMem = new WeakMap()),
						(this._usedResources = new WeakSet())
				}),
				e
			)
		})(kn)
	function Jn(r, e) {
		if (!!!r) throw new Error(e)
	}
	function Mg(r) {
		return typeof r == 'object' && r !== null
	}
	function Yg(r, e) {
		if (!!!r) throw new Error('Unexpected invariant triggered.')
	}
	const Fg = /\r\n|[\n\r]/g
	function uo(r, e) {
		let t = 0,
			n = 1
		for (const i of r.body.matchAll(Fg)) {
			if ((typeof i.index == 'number' || Yg(!1), i.index >= e)) break
			;(t = i.index + i[0].length), (n += 1)
		}
		return { line: n, column: e + 1 - t }
	}
	function Jg(r) {
		return Hc(r.source, uo(r.source, r.start))
	}
	function Hc(r, e) {
		const t = r.locationOffset.column - 1,
			n = ''.padStart(t) + r.body,
			i = e.line - 1,
			s = r.locationOffset.line - 1,
			o = e.line + s,
			l = e.line === 1 ? t : 0,
			a = e.column + l,
			c = `${r.name}:${o}:${a}
`,
			u = n.split(/\r\n|[\n\r]/g),
			d = u[i]
		if (d.length > 120) {
			const h = Math.floor(a / 80),
				p = a % 80,
				y = []
			for (let f = 0; f < d.length; f += 80) y.push(d.slice(f, f + 80))
			return (
				c +
				Kc([
					[`${o} |`, y[0]],
					...y.slice(1, h + 1).map((f) => ['|', f]),
					['|', '^'.padStart(p)],
					['|', y[h + 1]],
				])
			)
		}
		return (
			c +
			Kc([
				[`${o - 1} |`, u[i - 1]],
				[`${o} |`, d],
				['|', '^'.padStart(a)],
				[`${o + 1} |`, u[i + 1]],
			])
		)
	}
	function Kc(r) {
		const e = r.filter(([n, i]) => i !== void 0),
			t = Math.max(...e.map(([n]) => n.length))
		return e.map(([n, i]) => n.padStart(t) + (i ? ' ' + i : '')).join(`
`)
	}
	function Hg(r) {
		const e = r[0]
		return e == null || 'kind' in e || 'length' in e
			? {
					nodes: e,
					source: r[1],
					positions: r[2],
					path: r[3],
					originalError: r[4],
					extensions: r[5],
				}
			: e
	}
	class ho extends Error {
		constructor(e, ...t) {
			var n, i, s
			const {
				nodes: o,
				source: l,
				positions: a,
				path: c,
				originalError: u,
				extensions: d,
			} = Hg(t)
			super(e),
				(this.name = 'GraphQLError'),
				(this.path = c != null ? c : void 0),
				(this.originalError = u != null ? u : void 0),
				(this.nodes = Bc(Array.isArray(o) ? o : o ? [o] : void 0))
			const h = Bc(
				(n = this.nodes) === null || n === void 0
					? void 0
					: n.map((y) => y.loc).filter((y) => y != null),
			)
			;(this.source =
				l != null
					? l
					: h == null || (i = h[0]) === null || i === void 0
						? void 0
						: i.source),
				(this.positions =
					a != null ? a : h == null ? void 0 : h.map((y) => y.start)),
				(this.locations =
					a && l
						? a.map((y) => uo(l, y))
						: h == null
							? void 0
							: h.map((y) => uo(y.source, y.start)))
			const p = Mg(u == null ? void 0 : u.extensions)
				? u == null
					? void 0
					: u.extensions
				: void 0
			;(this.extensions =
				(s = d != null ? d : p) !== null && s !== void 0
					? s
					: Object.create(null)),
				Object.defineProperties(this, {
					message: { writable: !0, enumerable: !0 },
					name: { enumerable: !1 },
					nodes: { enumerable: !1 },
					source: { enumerable: !1 },
					positions: { enumerable: !1 },
					originalError: { enumerable: !1 },
				}),
				u != null && u.stack
					? Object.defineProperty(this, 'stack', {
							value: u.stack,
							writable: !0,
							configurable: !0,
						})
					: Error.captureStackTrace
						? Error.captureStackTrace(this, ho)
						: Object.defineProperty(this, 'stack', {
								value: Error().stack,
								writable: !0,
								configurable: !0,
							})
		}
		get [Symbol.toStringTag]() {
			return 'GraphQLError'
		}
		toString() {
			let e = this.message
			if (this.nodes)
				for (const t of this.nodes)
					t.loc &&
						(e +=
							`

` + Jg(t.loc))
			else if (this.source && this.locations)
				for (const t of this.locations)
					e +=
						`

` + Hc(this.source, t)
			return e
		}
		toJSON() {
			const e = { message: this.message }
			return (
				this.locations != null && (e.locations = this.locations),
				this.path != null && (e.path = this.path),
				this.extensions != null &&
					Object.keys(this.extensions).length > 0 &&
					(e.extensions = this.extensions),
				e
			)
		}
	}
	function Bc(r) {
		return r === void 0 || r.length === 0 ? void 0 : r
	}
	function Se(r, e, t) {
		return new ho(`Syntax Error: ${t}`, { source: r, positions: [e] })
	}
	class Kg {
		constructor(e, t, n) {
			;(this.start = e.start),
				(this.end = t.end),
				(this.startToken = e),
				(this.endToken = t),
				(this.source = n)
		}
		get [Symbol.toStringTag]() {
			return 'Location'
		}
		toJSON() {
			return { start: this.start, end: this.end }
		}
	}
	class zc {
		constructor(e, t, n, i, s, o) {
			;(this.kind = e),
				(this.start = t),
				(this.end = n),
				(this.line = i),
				(this.column = s),
				(this.value = o),
				(this.prev = null),
				(this.next = null)
		}
		get [Symbol.toStringTag]() {
			return 'Token'
		}
		toJSON() {
			return {
				kind: this.kind,
				value: this.value,
				line: this.line,
				column: this.column,
			}
		}
	}
	const Dc = {
			Name: [],
			Document: ['definitions'],
			OperationDefinition: [
				'name',
				'variableDefinitions',
				'directives',
				'selectionSet',
			],
			VariableDefinition: [
				'variable',
				'type',
				'defaultValue',
				'directives',
			],
			Variable: ['name'],
			SelectionSet: ['selections'],
			Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
			Argument: ['name', 'value'],
			FragmentSpread: ['name', 'directives'],
			InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
			FragmentDefinition: [
				'name',
				'variableDefinitions',
				'typeCondition',
				'directives',
				'selectionSet',
			],
			IntValue: [],
			FloatValue: [],
			StringValue: [],
			BooleanValue: [],
			NullValue: [],
			EnumValue: [],
			ListValue: ['values'],
			ObjectValue: ['fields'],
			ObjectField: ['name', 'value'],
			Directive: ['name', 'arguments'],
			NamedType: ['name'],
			ListType: ['type'],
			NonNullType: ['type'],
			SchemaDefinition: ['description', 'directives', 'operationTypes'],
			OperationTypeDefinition: ['type'],
			ScalarTypeDefinition: ['description', 'name', 'directives'],
			ObjectTypeDefinition: [
				'description',
				'name',
				'interfaces',
				'directives',
				'fields',
			],
			FieldDefinition: [
				'description',
				'name',
				'arguments',
				'type',
				'directives',
			],
			InputValueDefinition: [
				'description',
				'name',
				'type',
				'defaultValue',
				'directives',
			],
			InterfaceTypeDefinition: [
				'description',
				'name',
				'interfaces',
				'directives',
				'fields',
			],
			UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
			EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
			EnumValueDefinition: ['description', 'name', 'directives'],
			InputObjectTypeDefinition: [
				'description',
				'name',
				'directives',
				'fields',
			],
			DirectiveDefinition: [
				'description',
				'name',
				'arguments',
				'locations',
			],
			SchemaExtension: ['directives', 'operationTypes'],
			ScalarTypeExtension: ['name', 'directives'],
			ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
			InterfaceTypeExtension: [
				'name',
				'interfaces',
				'directives',
				'fields',
			],
			UnionTypeExtension: ['name', 'directives', 'types'],
			EnumTypeExtension: ['name', 'directives', 'values'],
			InputObjectTypeExtension: ['name', 'directives', 'fields'],
		},
		Bg = new Set(Object.keys(Dc))
	function jc(r) {
		const e = r == null ? void 0 : r.kind
		return typeof e == 'string' && Bg.has(e)
	}
	var er
	;(function (r) {
		;(r.QUERY = 'query'),
			(r.MUTATION = 'mutation'),
			(r.SUBSCRIPTION = 'subscription')
	})(er || (er = {}))
	var po
	;(function (r) {
		;(r.QUERY = 'QUERY'),
			(r.MUTATION = 'MUTATION'),
			(r.SUBSCRIPTION = 'SUBSCRIPTION'),
			(r.FIELD = 'FIELD'),
			(r.FRAGMENT_DEFINITION = 'FRAGMENT_DEFINITION'),
			(r.FRAGMENT_SPREAD = 'FRAGMENT_SPREAD'),
			(r.INLINE_FRAGMENT = 'INLINE_FRAGMENT'),
			(r.VARIABLE_DEFINITION = 'VARIABLE_DEFINITION'),
			(r.SCHEMA = 'SCHEMA'),
			(r.SCALAR = 'SCALAR'),
			(r.OBJECT = 'OBJECT'),
			(r.FIELD_DEFINITION = 'FIELD_DEFINITION'),
			(r.ARGUMENT_DEFINITION = 'ARGUMENT_DEFINITION'),
			(r.INTERFACE = 'INTERFACE'),
			(r.UNION = 'UNION'),
			(r.ENUM = 'ENUM'),
			(r.ENUM_VALUE = 'ENUM_VALUE'),
			(r.INPUT_OBJECT = 'INPUT_OBJECT'),
			(r.INPUT_FIELD_DEFINITION = 'INPUT_FIELD_DEFINITION')
	})(po || (po = {}))
	var _
	;(function (r) {
		;(r.NAME = 'Name'),
			(r.DOCUMENT = 'Document'),
			(r.OPERATION_DEFINITION = 'OperationDefinition'),
			(r.VARIABLE_DEFINITION = 'VariableDefinition'),
			(r.SELECTION_SET = 'SelectionSet'),
			(r.FIELD = 'Field'),
			(r.ARGUMENT = 'Argument'),
			(r.FRAGMENT_SPREAD = 'FragmentSpread'),
			(r.INLINE_FRAGMENT = 'InlineFragment'),
			(r.FRAGMENT_DEFINITION = 'FragmentDefinition'),
			(r.VARIABLE = 'Variable'),
			(r.INT = 'IntValue'),
			(r.FLOAT = 'FloatValue'),
			(r.STRING = 'StringValue'),
			(r.BOOLEAN = 'BooleanValue'),
			(r.NULL = 'NullValue'),
			(r.ENUM = 'EnumValue'),
			(r.LIST = 'ListValue'),
			(r.OBJECT = 'ObjectValue'),
			(r.OBJECT_FIELD = 'ObjectField'),
			(r.DIRECTIVE = 'Directive'),
			(r.NAMED_TYPE = 'NamedType'),
			(r.LIST_TYPE = 'ListType'),
			(r.NON_NULL_TYPE = 'NonNullType'),
			(r.SCHEMA_DEFINITION = 'SchemaDefinition'),
			(r.OPERATION_TYPE_DEFINITION = 'OperationTypeDefinition'),
			(r.SCALAR_TYPE_DEFINITION = 'ScalarTypeDefinition'),
			(r.OBJECT_TYPE_DEFINITION = 'ObjectTypeDefinition'),
			(r.FIELD_DEFINITION = 'FieldDefinition'),
			(r.INPUT_VALUE_DEFINITION = 'InputValueDefinition'),
			(r.INTERFACE_TYPE_DEFINITION = 'InterfaceTypeDefinition'),
			(r.UNION_TYPE_DEFINITION = 'UnionTypeDefinition'),
			(r.ENUM_TYPE_DEFINITION = 'EnumTypeDefinition'),
			(r.ENUM_VALUE_DEFINITION = 'EnumValueDefinition'),
			(r.INPUT_OBJECT_TYPE_DEFINITION = 'InputObjectTypeDefinition'),
			(r.DIRECTIVE_DEFINITION = 'DirectiveDefinition'),
			(r.SCHEMA_EXTENSION = 'SchemaExtension'),
			(r.SCALAR_TYPE_EXTENSION = 'ScalarTypeExtension'),
			(r.OBJECT_TYPE_EXTENSION = 'ObjectTypeExtension'),
			(r.INTERFACE_TYPE_EXTENSION = 'InterfaceTypeExtension'),
			(r.UNION_TYPE_EXTENSION = 'UnionTypeExtension'),
			(r.ENUM_TYPE_EXTENSION = 'EnumTypeExtension'),
			(r.INPUT_OBJECT_TYPE_EXTENSION = 'InputObjectTypeExtension')
	})(_ || (_ = {}))
	function fo(r) {
		return r === 9 || r === 32
	}
	function Ar(r) {
		return r >= 48 && r <= 57
	}
	function Qc(r) {
		return (r >= 97 && r <= 122) || (r >= 65 && r <= 90)
	}
	function $c(r) {
		return Qc(r) || r === 95
	}
	function zg(r) {
		return Qc(r) || Ar(r) || r === 95
	}
	function Dg(r) {
		var e
		let t = Number.MAX_SAFE_INTEGER,
			n = null,
			i = -1
		for (let o = 0; o < r.length; ++o) {
			var s
			const l = r[o],
				a = jg(l)
			a !== l.length &&
				((n = (s = n) !== null && s !== void 0 ? s : o),
				(i = o),
				o !== 0 && a < t && (t = a))
		}
		return r
			.map((o, l) => (l === 0 ? o : o.slice(t)))
			.slice((e = n) !== null && e !== void 0 ? e : 0, i + 1)
	}
	function jg(r) {
		let e = 0
		for (; e < r.length && fo(r.charCodeAt(e)); ) ++e
		return e
	}
	function Qg(r, e) {
		const t = r.replace(/"""/g, '\\"""'),
			n = t.split(/\r\n|[\n\r]/g),
			i = n.length === 1,
			s =
				n.length > 1 &&
				n.slice(1).every((p) => p.length === 0 || fo(p.charCodeAt(0))),
			o = t.endsWith('\\"""'),
			l = r.endsWith('"') && !o,
			a = r.endsWith('\\'),
			c = l || a,
			u = !i || r.length > 70 || c || s || o
		let d = ''
		const h = i && fo(r.charCodeAt(0))
		return (
			((u && !h) || s) &&
				(d += `
`),
			(d += t),
			(u || c) &&
				(d += `
`),
			'"""' + d + '"""'
		)
	}
	var R
	;(function (r) {
		;(r.SOF = '<SOF>'),
			(r.EOF = '<EOF>'),
			(r.BANG = '!'),
			(r.DOLLAR = '$'),
			(r.AMP = '&'),
			(r.PAREN_L = '('),
			(r.PAREN_R = ')'),
			(r.SPREAD = '...'),
			(r.COLON = ':'),
			(r.EQUALS = '='),
			(r.AT = '@'),
			(r.BRACKET_L = '['),
			(r.BRACKET_R = ']'),
			(r.BRACE_L = '{'),
			(r.PIPE = '|'),
			(r.BRACE_R = '}'),
			(r.NAME = 'Name'),
			(r.INT = 'Int'),
			(r.FLOAT = 'Float'),
			(r.STRING = 'String'),
			(r.BLOCK_STRING = 'BlockString'),
			(r.COMMENT = 'Comment')
	})(R || (R = {}))
	class $g {
		constructor(e) {
			const t = new zc(R.SOF, 0, 0, 0, 0)
			;(this.source = e),
				(this.lastToken = t),
				(this.token = t),
				(this.line = 1),
				(this.lineStart = 0)
		}
		get [Symbol.toStringTag]() {
			return 'Lexer'
		}
		advance() {
			return (
				(this.lastToken = this.token), (this.token = this.lookahead())
			)
		}
		lookahead() {
			let e = this.token
			if (e.kind !== R.EOF)
				do
					if (e.next) e = e.next
					else {
						const t = e0(this, e.end)
						;(e.next = t), (t.prev = e), (e = t)
					}
				while (e.kind === R.COMMENT)
			return e
		}
	}
	function qg(r) {
		return (
			r === R.BANG ||
			r === R.DOLLAR ||
			r === R.AMP ||
			r === R.PAREN_L ||
			r === R.PAREN_R ||
			r === R.SPREAD ||
			r === R.COLON ||
			r === R.EQUALS ||
			r === R.AT ||
			r === R.BRACKET_L ||
			r === R.BRACKET_R ||
			r === R.BRACE_L ||
			r === R.PIPE ||
			r === R.BRACE_R
		)
	}
	function tr(r) {
		return (r >= 0 && r <= 55295) || (r >= 57344 && r <= 1114111)
	}
	function Hn(r, e) {
		return qc(r.charCodeAt(e)) && eu(r.charCodeAt(e + 1))
	}
	function qc(r) {
		return r >= 55296 && r <= 56319
	}
	function eu(r) {
		return r >= 56320 && r <= 57343
	}
	function At(r, e) {
		const t = r.source.body.codePointAt(e)
		if (t === void 0) return R.EOF
		if (t >= 32 && t <= 126) {
			const n = String.fromCodePoint(t)
			return n === '"' ? `'"'` : `"${n}"`
		}
		return 'U+' + t.toString(16).toUpperCase().padStart(4, '0')
	}
	function fe(r, e, t, n, i) {
		const s = r.line,
			o = 1 + t - r.lineStart
		return new zc(e, t, n, s, o, i)
	}
	function e0(r, e) {
		const t = r.source.body,
			n = t.length
		let i = e
		for (; i < n; ) {
			const s = t.charCodeAt(i)
			switch (s) {
				case 65279:
				case 9:
				case 32:
				case 44:
					++i
					continue
				case 10:
					++i, ++r.line, (r.lineStart = i)
					continue
				case 13:
					t.charCodeAt(i + 1) === 10 ? (i += 2) : ++i,
						++r.line,
						(r.lineStart = i)
					continue
				case 35:
					return t0(r, i)
				case 33:
					return fe(r, R.BANG, i, i + 1)
				case 36:
					return fe(r, R.DOLLAR, i, i + 1)
				case 38:
					return fe(r, R.AMP, i, i + 1)
				case 40:
					return fe(r, R.PAREN_L, i, i + 1)
				case 41:
					return fe(r, R.PAREN_R, i, i + 1)
				case 46:
					if (
						t.charCodeAt(i + 1) === 46 &&
						t.charCodeAt(i + 2) === 46
					)
						return fe(r, R.SPREAD, i, i + 3)
					break
				case 58:
					return fe(r, R.COLON, i, i + 1)
				case 61:
					return fe(r, R.EQUALS, i, i + 1)
				case 64:
					return fe(r, R.AT, i, i + 1)
				case 91:
					return fe(r, R.BRACKET_L, i, i + 1)
				case 93:
					return fe(r, R.BRACKET_R, i, i + 1)
				case 123:
					return fe(r, R.BRACE_L, i, i + 1)
				case 124:
					return fe(r, R.PIPE, i, i + 1)
				case 125:
					return fe(r, R.BRACE_R, i, i + 1)
				case 34:
					return t.charCodeAt(i + 1) === 34 &&
						t.charCodeAt(i + 2) === 34
						? a0(r, i)
						: n0(r, i)
			}
			if (Ar(s) || s === 45) return r0(r, i, s)
			if ($c(s)) return l0(r, i)
			throw Se(
				r.source,
				i,
				s === 39
					? `Unexpected single quote character ('), did you mean to use a double quote (")?`
					: tr(s) || Hn(t, i)
						? `Unexpected character: ${At(r, i)}.`
						: `Invalid character: ${At(r, i)}.`,
			)
		}
		return fe(r, R.EOF, n, n)
	}
	function t0(r, e) {
		const t = r.source.body,
			n = t.length
		let i = e + 1
		for (; i < n; ) {
			const s = t.charCodeAt(i)
			if (s === 10 || s === 13) break
			if (tr(s)) ++i
			else if (Hn(t, i)) i += 2
			else break
		}
		return fe(r, R.COMMENT, e, i, t.slice(e + 1, i))
	}
	function r0(r, e, t) {
		const n = r.source.body
		let i = e,
			s = t,
			o = !1
		if ((s === 45 && (s = n.charCodeAt(++i)), s === 48)) {
			if (((s = n.charCodeAt(++i)), Ar(s)))
				throw Se(
					r.source,
					i,
					`Invalid number, unexpected digit after 0: ${At(r, i)}.`,
				)
		} else (i = mo(r, i, s)), (s = n.charCodeAt(i))
		if (
			(s === 46 &&
				((o = !0),
				(s = n.charCodeAt(++i)),
				(i = mo(r, i, s)),
				(s = n.charCodeAt(i))),
			(s === 69 || s === 101) &&
				((o = !0),
				(s = n.charCodeAt(++i)),
				(s === 43 || s === 45) && (s = n.charCodeAt(++i)),
				(i = mo(r, i, s)),
				(s = n.charCodeAt(i))),
			s === 46 || $c(s))
		)
			throw Se(
				r.source,
				i,
				`Invalid number, expected digit but got: ${At(r, i)}.`,
			)
		return fe(r, o ? R.FLOAT : R.INT, e, i, n.slice(e, i))
	}
	function mo(r, e, t) {
		if (!Ar(t))
			throw Se(
				r.source,
				e,
				`Invalid number, expected digit but got: ${At(r, e)}.`,
			)
		const n = r.source.body
		let i = e + 1
		for (; Ar(n.charCodeAt(i)); ) ++i
		return i
	}
	function n0(r, e) {
		const t = r.source.body,
			n = t.length
		let i = e + 1,
			s = i,
			o = ''
		for (; i < n; ) {
			const l = t.charCodeAt(i)
			if (l === 34)
				return (o += t.slice(s, i)), fe(r, R.STRING, e, i + 1, o)
			if (l === 92) {
				o += t.slice(s, i)
				const a =
					t.charCodeAt(i + 1) === 117
						? t.charCodeAt(i + 2) === 123
							? i0(r, i)
							: s0(r, i)
						: o0(r, i)
				;(o += a.value), (i += a.size), (s = i)
				continue
			}
			if (l === 10 || l === 13) break
			if (tr(l)) ++i
			else if (Hn(t, i)) i += 2
			else
				throw Se(
					r.source,
					i,
					`Invalid character within String: ${At(r, i)}.`,
				)
		}
		throw Se(r.source, i, 'Unterminated string.')
	}
	function i0(r, e) {
		const t = r.source.body
		let n = 0,
			i = 3
		for (; i < 12; ) {
			const s = t.charCodeAt(e + i++)
			if (s === 125) {
				if (i < 5 || !tr(n)) break
				return { value: String.fromCodePoint(n), size: i }
			}
			if (((n = (n << 4) | Mr(s)), n < 0)) break
		}
		throw Se(
			r.source,
			e,
			`Invalid Unicode escape sequence: "${t.slice(e, e + i)}".`,
		)
	}
	function s0(r, e) {
		const t = r.source.body,
			n = tu(t, e + 2)
		if (tr(n)) return { value: String.fromCodePoint(n), size: 6 }
		if (
			qc(n) &&
			t.charCodeAt(e + 6) === 92 &&
			t.charCodeAt(e + 7) === 117
		) {
			const i = tu(t, e + 8)
			if (eu(i)) return { value: String.fromCodePoint(n, i), size: 12 }
		}
		throw Se(
			r.source,
			e,
			`Invalid Unicode escape sequence: "${t.slice(e, e + 6)}".`,
		)
	}
	function tu(r, e) {
		return (
			(Mr(r.charCodeAt(e)) << 12) |
			(Mr(r.charCodeAt(e + 1)) << 8) |
			(Mr(r.charCodeAt(e + 2)) << 4) |
			Mr(r.charCodeAt(e + 3))
		)
	}
	function Mr(r) {
		return r >= 48 && r <= 57
			? r - 48
			: r >= 65 && r <= 70
				? r - 55
				: r >= 97 && r <= 102
					? r - 87
					: -1
	}
	function o0(r, e) {
		const t = r.source.body
		switch (t.charCodeAt(e + 1)) {
			case 34:
				return { value: '"', size: 2 }
			case 92:
				return { value: '\\', size: 2 }
			case 47:
				return { value: '/', size: 2 }
			case 98:
				return { value: '\b', size: 2 }
			case 102:
				return { value: '\f', size: 2 }
			case 110:
				return {
					value: `
`,
					size: 2,
				}
			case 114:
				return { value: '\r', size: 2 }
			case 116:
				return { value: '	', size: 2 }
		}
		throw Se(
			r.source,
			e,
			`Invalid character escape sequence: "${t.slice(e, e + 2)}".`,
		)
	}
	function a0(r, e) {
		const t = r.source.body,
			n = t.length
		let i = r.lineStart,
			s = e + 3,
			o = s,
			l = ''
		const a = []
		for (; s < n; ) {
			const c = t.charCodeAt(s)
			if (
				c === 34 &&
				t.charCodeAt(s + 1) === 34 &&
				t.charCodeAt(s + 2) === 34
			) {
				;(l += t.slice(o, s)), a.push(l)
				const u = fe(
					r,
					R.BLOCK_STRING,
					e,
					s + 3,
					Dg(a).join(`
`),
				)
				return (r.line += a.length - 1), (r.lineStart = i), u
			}
			if (
				c === 92 &&
				t.charCodeAt(s + 1) === 34 &&
				t.charCodeAt(s + 2) === 34 &&
				t.charCodeAt(s + 3) === 34
			) {
				;(l += t.slice(o, s)), (o = s + 1), (s += 4)
				continue
			}
			if (c === 10 || c === 13) {
				;(l += t.slice(o, s)),
					a.push(l),
					c === 13 && t.charCodeAt(s + 1) === 10 ? (s += 2) : ++s,
					(l = ''),
					(o = s),
					(i = s)
				continue
			}
			if (tr(c)) ++s
			else if (Hn(t, s)) s += 2
			else
				throw Se(
					r.source,
					s,
					`Invalid character within String: ${At(r, s)}.`,
				)
		}
		throw Se(r.source, s, 'Unterminated string.')
	}
	function l0(r, e) {
		const t = r.source.body,
			n = t.length
		let i = e + 1
		for (; i < n; ) {
			const s = t.charCodeAt(i)
			if (zg(s)) ++i
			else break
		}
		return fe(r, R.NAME, e, i, t.slice(e, i))
	}
	const c0 = 10,
		ru = 2
	function yo(r) {
		return Kn(r, [])
	}
	function Kn(r, e) {
		switch (typeof r) {
			case 'string':
				return JSON.stringify(r)
			case 'function':
				return r.name ? `[function ${r.name}]` : '[function]'
			case 'object':
				return u0(r, e)
			default:
				return String(r)
		}
	}
	function u0(r, e) {
		if (r === null) return 'null'
		if (e.includes(r)) return '[Circular]'
		const t = [...e, r]
		if (d0(r)) {
			const n = r.toJSON()
			if (n !== r) return typeof n == 'string' ? n : Kn(n, t)
		} else if (Array.isArray(r)) return p0(r, t)
		return h0(r, t)
	}
	function d0(r) {
		return typeof r.toJSON == 'function'
	}
	function h0(r, e) {
		const t = Object.entries(r)
		return t.length === 0
			? '{}'
			: e.length > ru
				? '[' + f0(r) + ']'
				: '{ ' +
					t.map(([i, s]) => i + ': ' + Kn(s, e)).join(', ') +
					' }'
	}
	function p0(r, e) {
		if (r.length === 0) return '[]'
		if (e.length > ru) return '[Array]'
		const t = Math.min(c0, r.length),
			n = r.length - t,
			i = []
		for (let s = 0; s < t; ++s) i.push(Kn(r[s], e))
		return (
			n === 1
				? i.push('... 1 more item')
				: n > 1 && i.push(`... ${n} more items`),
			'[' + i.join(', ') + ']'
		)
	}
	function f0(r) {
		const e = Object.prototype.toString
			.call(r)
			.replace(/^\[object /, '')
			.replace(/]$/, '')
		if (e === 'Object' && typeof r.constructor == 'function') {
			const t = r.constructor.name
			if (typeof t == 'string' && t !== '') return t
		}
		return e
	}
	const m0 =
		globalThis.process && globalThis.process.env.NODE_ENV === 'production'
			? function (e, t) {
					return e instanceof t
				}
			: function (e, t) {
					if (e instanceof t) return !0
					if (typeof e == 'object' && e !== null) {
						var n
						const i = t.prototype[Symbol.toStringTag],
							s =
								Symbol.toStringTag in e
									? e[Symbol.toStringTag]
									: (n = e.constructor) === null ||
										  n === void 0
										? void 0
										: n.name
						if (i === s) {
							const o = yo(e)
							throw new Error(`Cannot use ${i} "${o}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`)
						}
					}
					return !1
				}
	class nu {
		constructor(e, t = 'GraphQL request', n = { line: 1, column: 1 }) {
			typeof e == 'string' ||
				Jn(!1, `Body must be a string. Received: ${yo(e)}.`),
				(this.body = e),
				(this.name = t),
				(this.locationOffset = n),
				this.locationOffset.line > 0 ||
					Jn(
						!1,
						'line in locationOffset is 1-indexed and must be positive.',
					),
				this.locationOffset.column > 0 ||
					Jn(
						!1,
						'column in locationOffset is 1-indexed and must be positive.',
					)
		}
		get [Symbol.toStringTag]() {
			return 'Source'
		}
	}
	function y0(r) {
		return m0(r, nu)
	}
	function bo(r, e) {
		return new b0(r, e).parseDocument()
	}
	class b0 {
		constructor(e, t = {}) {
			const n = y0(e) ? e : new nu(e)
			;(this._lexer = new $g(n)),
				(this._options = t),
				(this._tokenCounter = 0)
		}
		parseName() {
			const e = this.expectToken(R.NAME)
			return this.node(e, { kind: _.NAME, value: e.value })
		}
		parseDocument() {
			return this.node(this._lexer.token, {
				kind: _.DOCUMENT,
				definitions: this.many(R.SOF, this.parseDefinition, R.EOF),
			})
		}
		parseDefinition() {
			if (this.peek(R.BRACE_L)) return this.parseOperationDefinition()
			const e = this.peekDescription(),
				t = e ? this._lexer.lookahead() : this._lexer.token
			if (t.kind === R.NAME) {
				switch (t.value) {
					case 'schema':
						return this.parseSchemaDefinition()
					case 'scalar':
						return this.parseScalarTypeDefinition()
					case 'type':
						return this.parseObjectTypeDefinition()
					case 'interface':
						return this.parseInterfaceTypeDefinition()
					case 'union':
						return this.parseUnionTypeDefinition()
					case 'enum':
						return this.parseEnumTypeDefinition()
					case 'input':
						return this.parseInputObjectTypeDefinition()
					case 'directive':
						return this.parseDirectiveDefinition()
				}
				if (e)
					throw Se(
						this._lexer.source,
						this._lexer.token.start,
						'Unexpected description, descriptions are supported only on type definitions.',
					)
				switch (t.value) {
					case 'query':
					case 'mutation':
					case 'subscription':
						return this.parseOperationDefinition()
					case 'fragment':
						return this.parseFragmentDefinition()
					case 'extend':
						return this.parseTypeSystemExtension()
				}
			}
			throw this.unexpected(t)
		}
		parseOperationDefinition() {
			const e = this._lexer.token
			if (this.peek(R.BRACE_L))
				return this.node(e, {
					kind: _.OPERATION_DEFINITION,
					operation: er.QUERY,
					name: void 0,
					variableDefinitions: [],
					directives: [],
					selectionSet: this.parseSelectionSet(),
				})
			const t = this.parseOperationType()
			let n
			return (
				this.peek(R.NAME) && (n = this.parseName()),
				this.node(e, {
					kind: _.OPERATION_DEFINITION,
					operation: t,
					name: n,
					variableDefinitions: this.parseVariableDefinitions(),
					directives: this.parseDirectives(!1),
					selectionSet: this.parseSelectionSet(),
				})
			)
		}
		parseOperationType() {
			const e = this.expectToken(R.NAME)
			switch (e.value) {
				case 'query':
					return er.QUERY
				case 'mutation':
					return er.MUTATION
				case 'subscription':
					return er.SUBSCRIPTION
			}
			throw this.unexpected(e)
		}
		parseVariableDefinitions() {
			return this.optionalMany(
				R.PAREN_L,
				this.parseVariableDefinition,
				R.PAREN_R,
			)
		}
		parseVariableDefinition() {
			return this.node(this._lexer.token, {
				kind: _.VARIABLE_DEFINITION,
				variable: this.parseVariable(),
				type: (this.expectToken(R.COLON), this.parseTypeReference()),
				defaultValue: this.expectOptionalToken(R.EQUALS)
					? this.parseConstValueLiteral()
					: void 0,
				directives: this.parseConstDirectives(),
			})
		}
		parseVariable() {
			const e = this._lexer.token
			return (
				this.expectToken(R.DOLLAR),
				this.node(e, { kind: _.VARIABLE, name: this.parseName() })
			)
		}
		parseSelectionSet() {
			return this.node(this._lexer.token, {
				kind: _.SELECTION_SET,
				selections: this.many(
					R.BRACE_L,
					this.parseSelection,
					R.BRACE_R,
				),
			})
		}
		parseSelection() {
			return this.peek(R.SPREAD)
				? this.parseFragment()
				: this.parseField()
		}
		parseField() {
			const e = this._lexer.token,
				t = this.parseName()
			let n, i
			return (
				this.expectOptionalToken(R.COLON)
					? ((n = t), (i = this.parseName()))
					: (i = t),
				this.node(e, {
					kind: _.FIELD,
					alias: n,
					name: i,
					arguments: this.parseArguments(!1),
					directives: this.parseDirectives(!1),
					selectionSet: this.peek(R.BRACE_L)
						? this.parseSelectionSet()
						: void 0,
				})
			)
		}
		parseArguments(e) {
			const t = e ? this.parseConstArgument : this.parseArgument
			return this.optionalMany(R.PAREN_L, t, R.PAREN_R)
		}
		parseArgument(e = !1) {
			const t = this._lexer.token,
				n = this.parseName()
			return (
				this.expectToken(R.COLON),
				this.node(t, {
					kind: _.ARGUMENT,
					name: n,
					value: this.parseValueLiteral(e),
				})
			)
		}
		parseConstArgument() {
			return this.parseArgument(!0)
		}
		parseFragment() {
			const e = this._lexer.token
			this.expectToken(R.SPREAD)
			const t = this.expectOptionalKeyword('on')
			return !t && this.peek(R.NAME)
				? this.node(e, {
						kind: _.FRAGMENT_SPREAD,
						name: this.parseFragmentName(),
						directives: this.parseDirectives(!1),
					})
				: this.node(e, {
						kind: _.INLINE_FRAGMENT,
						typeCondition: t ? this.parseNamedType() : void 0,
						directives: this.parseDirectives(!1),
						selectionSet: this.parseSelectionSet(),
					})
		}
		parseFragmentDefinition() {
			const e = this._lexer.token
			return (
				this.expectKeyword('fragment'),
				this._options.allowLegacyFragmentVariables === !0
					? this.node(e, {
							kind: _.FRAGMENT_DEFINITION,
							name: this.parseFragmentName(),
							variableDefinitions:
								this.parseVariableDefinitions(),
							typeCondition:
								(this.expectKeyword('on'),
								this.parseNamedType()),
							directives: this.parseDirectives(!1),
							selectionSet: this.parseSelectionSet(),
						})
					: this.node(e, {
							kind: _.FRAGMENT_DEFINITION,
							name: this.parseFragmentName(),
							typeCondition:
								(this.expectKeyword('on'),
								this.parseNamedType()),
							directives: this.parseDirectives(!1),
							selectionSet: this.parseSelectionSet(),
						})
			)
		}
		parseFragmentName() {
			if (this._lexer.token.value === 'on') throw this.unexpected()
			return this.parseName()
		}
		parseValueLiteral(e) {
			const t = this._lexer.token
			switch (t.kind) {
				case R.BRACKET_L:
					return this.parseList(e)
				case R.BRACE_L:
					return this.parseObject(e)
				case R.INT:
					return (
						this.advanceLexer(),
						this.node(t, { kind: _.INT, value: t.value })
					)
				case R.FLOAT:
					return (
						this.advanceLexer(),
						this.node(t, { kind: _.FLOAT, value: t.value })
					)
				case R.STRING:
				case R.BLOCK_STRING:
					return this.parseStringLiteral()
				case R.NAME:
					switch ((this.advanceLexer(), t.value)) {
						case 'true':
							return this.node(t, { kind: _.BOOLEAN, value: !0 })
						case 'false':
							return this.node(t, { kind: _.BOOLEAN, value: !1 })
						case 'null':
							return this.node(t, { kind: _.NULL })
						default:
							return this.node(t, {
								kind: _.ENUM,
								value: t.value,
							})
					}
				case R.DOLLAR:
					if (e)
						if (
							(this.expectToken(R.DOLLAR),
							this._lexer.token.kind === R.NAME)
						) {
							const n = this._lexer.token.value
							throw Se(
								this._lexer.source,
								t.start,
								`Unexpected variable "$${n}" in constant value.`,
							)
						} else throw this.unexpected(t)
					return this.parseVariable()
				default:
					throw this.unexpected()
			}
		}
		parseConstValueLiteral() {
			return this.parseValueLiteral(!0)
		}
		parseStringLiteral() {
			const e = this._lexer.token
			return (
				this.advanceLexer(),
				this.node(e, {
					kind: _.STRING,
					value: e.value,
					block: e.kind === R.BLOCK_STRING,
				})
			)
		}
		parseList(e) {
			const t = () => this.parseValueLiteral(e)
			return this.node(this._lexer.token, {
				kind: _.LIST,
				values: this.any(R.BRACKET_L, t, R.BRACKET_R),
			})
		}
		parseObject(e) {
			const t = () => this.parseObjectField(e)
			return this.node(this._lexer.token, {
				kind: _.OBJECT,
				fields: this.any(R.BRACE_L, t, R.BRACE_R),
			})
		}
		parseObjectField(e) {
			const t = this._lexer.token,
				n = this.parseName()
			return (
				this.expectToken(R.COLON),
				this.node(t, {
					kind: _.OBJECT_FIELD,
					name: n,
					value: this.parseValueLiteral(e),
				})
			)
		}
		parseDirectives(e) {
			const t = []
			for (; this.peek(R.AT); ) t.push(this.parseDirective(e))
			return t
		}
		parseConstDirectives() {
			return this.parseDirectives(!0)
		}
		parseDirective(e) {
			const t = this._lexer.token
			return (
				this.expectToken(R.AT),
				this.node(t, {
					kind: _.DIRECTIVE,
					name: this.parseName(),
					arguments: this.parseArguments(e),
				})
			)
		}
		parseTypeReference() {
			const e = this._lexer.token
			let t
			if (this.expectOptionalToken(R.BRACKET_L)) {
				const n = this.parseTypeReference()
				this.expectToken(R.BRACKET_R),
					(t = this.node(e, { kind: _.LIST_TYPE, type: n }))
			} else t = this.parseNamedType()
			return this.expectOptionalToken(R.BANG)
				? this.node(e, { kind: _.NON_NULL_TYPE, type: t })
				: t
		}
		parseNamedType() {
			return this.node(this._lexer.token, {
				kind: _.NAMED_TYPE,
				name: this.parseName(),
			})
		}
		peekDescription() {
			return this.peek(R.STRING) || this.peek(R.BLOCK_STRING)
		}
		parseDescription() {
			if (this.peekDescription()) return this.parseStringLiteral()
		}
		parseSchemaDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('schema')
			const n = this.parseConstDirectives(),
				i = this.many(
					R.BRACE_L,
					this.parseOperationTypeDefinition,
					R.BRACE_R,
				)
			return this.node(e, {
				kind: _.SCHEMA_DEFINITION,
				description: t,
				directives: n,
				operationTypes: i,
			})
		}
		parseOperationTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseOperationType()
			this.expectToken(R.COLON)
			const n = this.parseNamedType()
			return this.node(e, {
				kind: _.OPERATION_TYPE_DEFINITION,
				operation: t,
				type: n,
			})
		}
		parseScalarTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('scalar')
			const n = this.parseName(),
				i = this.parseConstDirectives()
			return this.node(e, {
				kind: _.SCALAR_TYPE_DEFINITION,
				description: t,
				name: n,
				directives: i,
			})
		}
		parseObjectTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('type')
			const n = this.parseName(),
				i = this.parseImplementsInterfaces(),
				s = this.parseConstDirectives(),
				o = this.parseFieldsDefinition()
			return this.node(e, {
				kind: _.OBJECT_TYPE_DEFINITION,
				description: t,
				name: n,
				interfaces: i,
				directives: s,
				fields: o,
			})
		}
		parseImplementsInterfaces() {
			return this.expectOptionalKeyword('implements')
				? this.delimitedMany(R.AMP, this.parseNamedType)
				: []
		}
		parseFieldsDefinition() {
			return this.optionalMany(
				R.BRACE_L,
				this.parseFieldDefinition,
				R.BRACE_R,
			)
		}
		parseFieldDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription(),
				n = this.parseName(),
				i = this.parseArgumentDefs()
			this.expectToken(R.COLON)
			const s = this.parseTypeReference(),
				o = this.parseConstDirectives()
			return this.node(e, {
				kind: _.FIELD_DEFINITION,
				description: t,
				name: n,
				arguments: i,
				type: s,
				directives: o,
			})
		}
		parseArgumentDefs() {
			return this.optionalMany(
				R.PAREN_L,
				this.parseInputValueDef,
				R.PAREN_R,
			)
		}
		parseInputValueDef() {
			const e = this._lexer.token,
				t = this.parseDescription(),
				n = this.parseName()
			this.expectToken(R.COLON)
			const i = this.parseTypeReference()
			let s
			this.expectOptionalToken(R.EQUALS) &&
				(s = this.parseConstValueLiteral())
			const o = this.parseConstDirectives()
			return this.node(e, {
				kind: _.INPUT_VALUE_DEFINITION,
				description: t,
				name: n,
				type: i,
				defaultValue: s,
				directives: o,
			})
		}
		parseInterfaceTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('interface')
			const n = this.parseName(),
				i = this.parseImplementsInterfaces(),
				s = this.parseConstDirectives(),
				o = this.parseFieldsDefinition()
			return this.node(e, {
				kind: _.INTERFACE_TYPE_DEFINITION,
				description: t,
				name: n,
				interfaces: i,
				directives: s,
				fields: o,
			})
		}
		parseUnionTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('union')
			const n = this.parseName(),
				i = this.parseConstDirectives(),
				s = this.parseUnionMemberTypes()
			return this.node(e, {
				kind: _.UNION_TYPE_DEFINITION,
				description: t,
				name: n,
				directives: i,
				types: s,
			})
		}
		parseUnionMemberTypes() {
			return this.expectOptionalToken(R.EQUALS)
				? this.delimitedMany(R.PIPE, this.parseNamedType)
				: []
		}
		parseEnumTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('enum')
			const n = this.parseName(),
				i = this.parseConstDirectives(),
				s = this.parseEnumValuesDefinition()
			return this.node(e, {
				kind: _.ENUM_TYPE_DEFINITION,
				description: t,
				name: n,
				directives: i,
				values: s,
			})
		}
		parseEnumValuesDefinition() {
			return this.optionalMany(
				R.BRACE_L,
				this.parseEnumValueDefinition,
				R.BRACE_R,
			)
		}
		parseEnumValueDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription(),
				n = this.parseEnumValueName(),
				i = this.parseConstDirectives()
			return this.node(e, {
				kind: _.ENUM_VALUE_DEFINITION,
				description: t,
				name: n,
				directives: i,
			})
		}
		parseEnumValueName() {
			if (
				this._lexer.token.value === 'true' ||
				this._lexer.token.value === 'false' ||
				this._lexer.token.value === 'null'
			)
				throw Se(
					this._lexer.source,
					this._lexer.token.start,
					`${Bn(this._lexer.token)} is reserved and cannot be used for an enum value.`,
				)
			return this.parseName()
		}
		parseInputObjectTypeDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('input')
			const n = this.parseName(),
				i = this.parseConstDirectives(),
				s = this.parseInputFieldsDefinition()
			return this.node(e, {
				kind: _.INPUT_OBJECT_TYPE_DEFINITION,
				description: t,
				name: n,
				directives: i,
				fields: s,
			})
		}
		parseInputFieldsDefinition() {
			return this.optionalMany(
				R.BRACE_L,
				this.parseInputValueDef,
				R.BRACE_R,
			)
		}
		parseTypeSystemExtension() {
			const e = this._lexer.lookahead()
			if (e.kind === R.NAME)
				switch (e.value) {
					case 'schema':
						return this.parseSchemaExtension()
					case 'scalar':
						return this.parseScalarTypeExtension()
					case 'type':
						return this.parseObjectTypeExtension()
					case 'interface':
						return this.parseInterfaceTypeExtension()
					case 'union':
						return this.parseUnionTypeExtension()
					case 'enum':
						return this.parseEnumTypeExtension()
					case 'input':
						return this.parseInputObjectTypeExtension()
				}
			throw this.unexpected(e)
		}
		parseSchemaExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('schema')
			const t = this.parseConstDirectives(),
				n = this.optionalMany(
					R.BRACE_L,
					this.parseOperationTypeDefinition,
					R.BRACE_R,
				)
			if (t.length === 0 && n.length === 0) throw this.unexpected()
			return this.node(e, {
				kind: _.SCHEMA_EXTENSION,
				directives: t,
				operationTypes: n,
			})
		}
		parseScalarTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('scalar')
			const t = this.parseName(),
				n = this.parseConstDirectives()
			if (n.length === 0) throw this.unexpected()
			return this.node(e, {
				kind: _.SCALAR_TYPE_EXTENSION,
				name: t,
				directives: n,
			})
		}
		parseObjectTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('type')
			const t = this.parseName(),
				n = this.parseImplementsInterfaces(),
				i = this.parseConstDirectives(),
				s = this.parseFieldsDefinition()
			if (n.length === 0 && i.length === 0 && s.length === 0)
				throw this.unexpected()
			return this.node(e, {
				kind: _.OBJECT_TYPE_EXTENSION,
				name: t,
				interfaces: n,
				directives: i,
				fields: s,
			})
		}
		parseInterfaceTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('interface')
			const t = this.parseName(),
				n = this.parseImplementsInterfaces(),
				i = this.parseConstDirectives(),
				s = this.parseFieldsDefinition()
			if (n.length === 0 && i.length === 0 && s.length === 0)
				throw this.unexpected()
			return this.node(e, {
				kind: _.INTERFACE_TYPE_EXTENSION,
				name: t,
				interfaces: n,
				directives: i,
				fields: s,
			})
		}
		parseUnionTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('union')
			const t = this.parseName(),
				n = this.parseConstDirectives(),
				i = this.parseUnionMemberTypes()
			if (n.length === 0 && i.length === 0) throw this.unexpected()
			return this.node(e, {
				kind: _.UNION_TYPE_EXTENSION,
				name: t,
				directives: n,
				types: i,
			})
		}
		parseEnumTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('enum')
			const t = this.parseName(),
				n = this.parseConstDirectives(),
				i = this.parseEnumValuesDefinition()
			if (n.length === 0 && i.length === 0) throw this.unexpected()
			return this.node(e, {
				kind: _.ENUM_TYPE_EXTENSION,
				name: t,
				directives: n,
				values: i,
			})
		}
		parseInputObjectTypeExtension() {
			const e = this._lexer.token
			this.expectKeyword('extend'), this.expectKeyword('input')
			const t = this.parseName(),
				n = this.parseConstDirectives(),
				i = this.parseInputFieldsDefinition()
			if (n.length === 0 && i.length === 0) throw this.unexpected()
			return this.node(e, {
				kind: _.INPUT_OBJECT_TYPE_EXTENSION,
				name: t,
				directives: n,
				fields: i,
			})
		}
		parseDirectiveDefinition() {
			const e = this._lexer.token,
				t = this.parseDescription()
			this.expectKeyword('directive'), this.expectToken(R.AT)
			const n = this.parseName(),
				i = this.parseArgumentDefs(),
				s = this.expectOptionalKeyword('repeatable')
			this.expectKeyword('on')
			const o = this.parseDirectiveLocations()
			return this.node(e, {
				kind: _.DIRECTIVE_DEFINITION,
				description: t,
				name: n,
				arguments: i,
				repeatable: s,
				locations: o,
			})
		}
		parseDirectiveLocations() {
			return this.delimitedMany(R.PIPE, this.parseDirectiveLocation)
		}
		parseDirectiveLocation() {
			const e = this._lexer.token,
				t = this.parseName()
			if (Object.prototype.hasOwnProperty.call(po, t.value)) return t
			throw this.unexpected(e)
		}
		node(e, t) {
			return (
				this._options.noLocation !== !0 &&
					(t.loc = new Kg(
						e,
						this._lexer.lastToken,
						this._lexer.source,
					)),
				t
			)
		}
		peek(e) {
			return this._lexer.token.kind === e
		}
		expectToken(e) {
			const t = this._lexer.token
			if (t.kind === e) return this.advanceLexer(), t
			throw Se(
				this._lexer.source,
				t.start,
				`Expected ${iu(e)}, found ${Bn(t)}.`,
			)
		}
		expectOptionalToken(e) {
			return this._lexer.token.kind === e ? (this.advanceLexer(), !0) : !1
		}
		expectKeyword(e) {
			const t = this._lexer.token
			if (t.kind === R.NAME && t.value === e) this.advanceLexer()
			else
				throw Se(
					this._lexer.source,
					t.start,
					`Expected "${e}", found ${Bn(t)}.`,
				)
		}
		expectOptionalKeyword(e) {
			const t = this._lexer.token
			return t.kind === R.NAME && t.value === e
				? (this.advanceLexer(), !0)
				: !1
		}
		unexpected(e) {
			const t = e != null ? e : this._lexer.token
			return Se(this._lexer.source, t.start, `Unexpected ${Bn(t)}.`)
		}
		any(e, t, n) {
			this.expectToken(e)
			const i = []
			for (; !this.expectOptionalToken(n); ) i.push(t.call(this))
			return i
		}
		optionalMany(e, t, n) {
			if (this.expectOptionalToken(e)) {
				const i = []
				do i.push(t.call(this))
				while (!this.expectOptionalToken(n))
				return i
			}
			return []
		}
		many(e, t, n) {
			this.expectToken(e)
			const i = []
			do i.push(t.call(this))
			while (!this.expectOptionalToken(n))
			return i
		}
		delimitedMany(e, t) {
			this.expectOptionalToken(e)
			const n = []
			do n.push(t.call(this))
			while (this.expectOptionalToken(e))
			return n
		}
		advanceLexer() {
			const { maxTokens: e } = this._options,
				t = this._lexer.advance()
			if (
				e !== void 0 &&
				t.kind !== R.EOF &&
				(++this._tokenCounter, this._tokenCounter > e)
			)
				throw Se(
					this._lexer.source,
					t.start,
					`Document contains more that ${e} tokens. Parsing aborted.`,
				)
		}
	}
	function Bn(r) {
		const e = r.value
		return iu(r.kind) + (e != null ? ` "${e}"` : '')
	}
	function iu(r) {
		return qg(r) ? `"${r}"` : r
	}
	function g0(r) {
		return `"${r.replace(S0, v0)}"`
	}
	const S0 = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g
	function v0(r) {
		return R0[r.charCodeAt(0)]
	}
	const R0 = [
			'\\u0000',
			'\\u0001',
			'\\u0002',
			'\\u0003',
			'\\u0004',
			'\\u0005',
			'\\u0006',
			'\\u0007',
			'\\b',
			'\\t',
			'\\n',
			'\\u000B',
			'\\f',
			'\\r',
			'\\u000E',
			'\\u000F',
			'\\u0010',
			'\\u0011',
			'\\u0012',
			'\\u0013',
			'\\u0014',
			'\\u0015',
			'\\u0016',
			'\\u0017',
			'\\u0018',
			'\\u0019',
			'\\u001A',
			'\\u001B',
			'\\u001C',
			'\\u001D',
			'\\u001E',
			'\\u001F',
			'',
			'',
			'\\"',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'\\\\',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'\\u007F',
			'\\u0080',
			'\\u0081',
			'\\u0082',
			'\\u0083',
			'\\u0084',
			'\\u0085',
			'\\u0086',
			'\\u0087',
			'\\u0088',
			'\\u0089',
			'\\u008A',
			'\\u008B',
			'\\u008C',
			'\\u008D',
			'\\u008E',
			'\\u008F',
			'\\u0090',
			'\\u0091',
			'\\u0092',
			'\\u0093',
			'\\u0094',
			'\\u0095',
			'\\u0096',
			'\\u0097',
			'\\u0098',
			'\\u0099',
			'\\u009A',
			'\\u009B',
			'\\u009C',
			'\\u009D',
			'\\u009E',
			'\\u009F',
		],
		I0 = Object.freeze({})
	function w0(r, e, t = Dc) {
		const n = new Map()
		for (const g of Object.values(_)) n.set(g, Z0(e, g))
		let i,
			s = Array.isArray(r),
			o = [r],
			l = -1,
			a = [],
			c = r,
			u,
			d
		const h = [],
			p = []
		do {
			l++
			const g = l === o.length,
				v = g && a.length !== 0
			if (g) {
				if (
					((u = p.length === 0 ? void 0 : h[h.length - 1]),
					(c = d),
					(d = p.pop()),
					v)
				)
					if (s) {
						c = c.slice()
						let I = 0
						for (const [G, L] of a) {
							const w = G - I
							L === null ? (c.splice(w, 1), I++) : (c[w] = L)
						}
					} else {
						c = Object.defineProperties(
							{},
							Object.getOwnPropertyDescriptors(c),
						)
						for (const [I, G] of a) c[I] = G
					}
				;(l = i.index),
					(o = i.keys),
					(a = i.edits),
					(s = i.inArray),
					(i = i.prev)
			} else if (d) {
				if (((u = s ? l : o[l]), (c = d[u]), c == null)) continue
				h.push(u)
			}
			let S
			if (!Array.isArray(c)) {
				var y, f
				jc(c) || Jn(!1, `Invalid AST Node: ${yo(c)}.`)
				const I = g
					? (y = n.get(c.kind)) === null || y === void 0
						? void 0
						: y.leave
					: (f = n.get(c.kind)) === null || f === void 0
						? void 0
						: f.enter
				if (
					((S = I == null ? void 0 : I.call(e, c, u, d, h, p)),
					S === I0)
				)
					break
				if (S === !1) {
					if (!g) {
						h.pop()
						continue
					}
				} else if (S !== void 0 && (a.push([u, S]), !g))
					if (jc(S)) c = S
					else {
						h.pop()
						continue
					}
			}
			if ((S === void 0 && v && a.push([u, c]), g)) h.pop()
			else {
				var m
				;(i = { inArray: s, index: l, keys: o, edits: a, prev: i }),
					(s = Array.isArray(c)),
					(o = s
						? c
						: (m = t[c.kind]) !== null && m !== void 0
							? m
							: []),
					(l = -1),
					(a = []),
					d && p.push(d),
					(d = c)
			}
		} while (i !== void 0)
		return a.length !== 0 ? a[a.length - 1][1] : r
	}
	function Z0(r, e) {
		const t = r[e]
		return typeof t == 'object'
			? t
			: typeof t == 'function'
				? { enter: t, leave: void 0 }
				: { enter: r.enter, leave: r.leave }
	}
	function su(r) {
		return w0(r, E0)
	}
	const T0 = 80,
		E0 = {
			Name: { leave: (r) => r.value },
			Variable: { leave: (r) => '$' + r.name },
			Document: {
				leave: (r) =>
					N(
						r.definitions,
						`

`,
					),
			},
			OperationDefinition: {
				leave(r) {
					const e = F('(', N(r.variableDefinitions, ', '), ')'),
						t = N(
							[r.operation, N([r.name, e]), N(r.directives, ' ')],
							' ',
						)
					return (t === 'query' ? '' : t + ' ') + r.selectionSet
				},
			},
			VariableDefinition: {
				leave: ({
					variable: r,
					type: e,
					defaultValue: t,
					directives: n,
				}) => r + ': ' + e + F(' = ', t) + F(' ', N(n, ' ')),
			},
			SelectionSet: { leave: ({ selections: r }) => Je(r) },
			Field: {
				leave({
					alias: r,
					name: e,
					arguments: t,
					directives: n,
					selectionSet: i,
				}) {
					const s = F('', r, ': ') + e
					let o = s + F('(', N(t, ', '), ')')
					return (
						o.length > T0 &&
							(o =
								s +
								F(
									`(
`,
									zn(
										N(
											t,
											`
`,
										),
									),
									`
)`,
								)),
						N([o, N(n, ' '), i], ' ')
					)
				},
			},
			Argument: { leave: ({ name: r, value: e }) => r + ': ' + e },
			FragmentSpread: {
				leave: ({ name: r, directives: e }) =>
					'...' + r + F(' ', N(e, ' ')),
			},
			InlineFragment: {
				leave: ({ typeCondition: r, directives: e, selectionSet: t }) =>
					N(['...', F('on ', r), N(e, ' '), t], ' '),
			},
			FragmentDefinition: {
				leave: ({
					name: r,
					typeCondition: e,
					variableDefinitions: t,
					directives: n,
					selectionSet: i,
				}) =>
					`fragment ${r}${F('(', N(t, ', '), ')')} on ${e} ${F('', N(n, ' '), ' ')}` +
					i,
			},
			IntValue: { leave: ({ value: r }) => r },
			FloatValue: { leave: ({ value: r }) => r },
			StringValue: {
				leave: ({ value: r, block: e }) => (e ? Qg(r) : g0(r)),
			},
			BooleanValue: { leave: ({ value: r }) => (r ? 'true' : 'false') },
			NullValue: { leave: () => 'null' },
			EnumValue: { leave: ({ value: r }) => r },
			ListValue: { leave: ({ values: r }) => '[' + N(r, ', ') + ']' },
			ObjectValue: { leave: ({ fields: r }) => '{' + N(r, ', ') + '}' },
			ObjectField: { leave: ({ name: r, value: e }) => r + ': ' + e },
			Directive: {
				leave: ({ name: r, arguments: e }) =>
					'@' + r + F('(', N(e, ', '), ')'),
			},
			NamedType: { leave: ({ name: r }) => r },
			ListType: { leave: ({ type: r }) => '[' + r + ']' },
			NonNullType: { leave: ({ type: r }) => r + '!' },
			SchemaDefinition: {
				leave: ({ description: r, directives: e, operationTypes: t }) =>
					F(
						'',
						r,
						`
`,
					) + N(['schema', N(e, ' '), Je(t)], ' '),
			},
			OperationTypeDefinition: {
				leave: ({ operation: r, type: e }) => r + ': ' + e,
			},
			ScalarTypeDefinition: {
				leave: ({ description: r, name: e, directives: t }) =>
					F(
						'',
						r,
						`
`,
					) + N(['scalar', e, N(t, ' ')], ' '),
			},
			ObjectTypeDefinition: {
				leave: ({
					description: r,
					name: e,
					interfaces: t,
					directives: n,
					fields: i,
				}) =>
					F(
						'',
						r,
						`
`,
					) +
					N(
						[
							'type',
							e,
							F('implements ', N(t, ' & ')),
							N(n, ' '),
							Je(i),
						],
						' ',
					),
			},
			FieldDefinition: {
				leave: ({
					description: r,
					name: e,
					arguments: t,
					type: n,
					directives: i,
				}) =>
					F(
						'',
						r,
						`
`,
					) +
					e +
					(ou(t)
						? F(
								`(
`,
								zn(
									N(
										t,
										`
`,
									),
								),
								`
)`,
							)
						: F('(', N(t, ', '), ')')) +
					': ' +
					n +
					F(' ', N(i, ' ')),
			},
			InputValueDefinition: {
				leave: ({
					description: r,
					name: e,
					type: t,
					defaultValue: n,
					directives: i,
				}) =>
					F(
						'',
						r,
						`
`,
					) + N([e + ': ' + t, F('= ', n), N(i, ' ')], ' '),
			},
			InterfaceTypeDefinition: {
				leave: ({
					description: r,
					name: e,
					interfaces: t,
					directives: n,
					fields: i,
				}) =>
					F(
						'',
						r,
						`
`,
					) +
					N(
						[
							'interface',
							e,
							F('implements ', N(t, ' & ')),
							N(n, ' '),
							Je(i),
						],
						' ',
					),
			},
			UnionTypeDefinition: {
				leave: ({ description: r, name: e, directives: t, types: n }) =>
					F(
						'',
						r,
						`
`,
					) + N(['union', e, N(t, ' '), F('= ', N(n, ' | '))], ' '),
			},
			EnumTypeDefinition: {
				leave: ({
					description: r,
					name: e,
					directives: t,
					values: n,
				}) =>
					F(
						'',
						r,
						`
`,
					) + N(['enum', e, N(t, ' '), Je(n)], ' '),
			},
			EnumValueDefinition: {
				leave: ({ description: r, name: e, directives: t }) =>
					F(
						'',
						r,
						`
`,
					) + N([e, N(t, ' ')], ' '),
			},
			InputObjectTypeDefinition: {
				leave: ({
					description: r,
					name: e,
					directives: t,
					fields: n,
				}) =>
					F(
						'',
						r,
						`
`,
					) + N(['input', e, N(t, ' '), Je(n)], ' '),
			},
			DirectiveDefinition: {
				leave: ({
					description: r,
					name: e,
					arguments: t,
					repeatable: n,
					locations: i,
				}) =>
					F(
						'',
						r,
						`
`,
					) +
					'directive @' +
					e +
					(ou(t)
						? F(
								`(
`,
								zn(
									N(
										t,
										`
`,
									),
								),
								`
)`,
							)
						: F('(', N(t, ', '), ')')) +
					(n ? ' repeatable' : '') +
					' on ' +
					N(i, ' | '),
			},
			SchemaExtension: {
				leave: ({ directives: r, operationTypes: e }) =>
					N(['extend schema', N(r, ' '), Je(e)], ' '),
			},
			ScalarTypeExtension: {
				leave: ({ name: r, directives: e }) =>
					N(['extend scalar', r, N(e, ' ')], ' '),
			},
			ObjectTypeExtension: {
				leave: ({ name: r, interfaces: e, directives: t, fields: n }) =>
					N(
						[
							'extend type',
							r,
							F('implements ', N(e, ' & ')),
							N(t, ' '),
							Je(n),
						],
						' ',
					),
			},
			InterfaceTypeExtension: {
				leave: ({ name: r, interfaces: e, directives: t, fields: n }) =>
					N(
						[
							'extend interface',
							r,
							F('implements ', N(e, ' & ')),
							N(t, ' '),
							Je(n),
						],
						' ',
					),
			},
			UnionTypeExtension: {
				leave: ({ name: r, directives: e, types: t }) =>
					N(
						['extend union', r, N(e, ' '), F('= ', N(t, ' | '))],
						' ',
					),
			},
			EnumTypeExtension: {
				leave: ({ name: r, directives: e, values: t }) =>
					N(['extend enum', r, N(e, ' '), Je(t)], ' '),
			},
			InputObjectTypeExtension: {
				leave: ({ name: r, directives: e, fields: t }) =>
					N(['extend input', r, N(e, ' '), Je(t)], ' '),
			},
		}
	function N(r, e = '') {
		var t
		return (t = r == null ? void 0 : r.filter((n) => n).join(e)) !== null &&
			t !== void 0
			? t
			: ''
	}
	function Je(r) {
		return F(
			`{
`,
			zn(
				N(
					r,
					`
`,
				),
			),
			`
}`,
		)
	}
	function F(r, e, t = '') {
		return e != null && e !== '' ? r + e + t : ''
	}
	function zn(r) {
		return F(
			'  ',
			r.replace(
				/\n/g,
				`
  `,
			),
		)
	}
	function ou(r) {
		var e
		return (e =
			r == null
				? void 0
				: r.some((t) =>
						t.includes(`
`),
					)) !== null && e !== void 0
			? e
			: !1
	}
	/*! js-cookie v3.0.5 | MIT */ function Dn(r) {
		for (var e = 1; e < arguments.length; e++) {
			var t = arguments[e]
			for (var n in t) r[n] = t[n]
		}
		return r
	}
	var C0 = {
		read: function (r) {
			return (
				r[0] === '"' && (r = r.slice(1, -1)),
				r.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
			)
		},
		write: function (r) {
			return encodeURIComponent(r).replace(
				/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
				decodeURIComponent,
			)
		},
	}
	function go(r, e) {
		function t(i, s, o) {
			if (typeof document != 'undefined') {
				;(o = Dn({}, e, o)),
					typeof o.expires == 'number' &&
						(o.expires = new Date(Date.now() + o.expires * 864e5)),
					o.expires && (o.expires = o.expires.toUTCString()),
					(i = encodeURIComponent(i)
						.replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
						.replace(/[()]/g, escape))
				var l = ''
				for (var a in o)
					o[a] &&
						((l += '; ' + a),
						o[a] !== !0 && (l += '=' + o[a].split(';')[0]))
				return (document.cookie = i + '=' + r.write(s, i) + l)
			}
		}
		function n(i) {
			if (!(typeof document == 'undefined' || (arguments.length && !i))) {
				for (
					var s = document.cookie ? document.cookie.split('; ') : [],
						o = {},
						l = 0;
					l < s.length;
					l++
				) {
					var a = s[l].split('='),
						c = a.slice(1).join('=')
					try {
						var u = decodeURIComponent(a[0])
						if (((o[u] = r.read(c, u)), i === u)) break
					} catch (d) {}
				}
				return i ? o[i] : o
			}
		}
		return Object.create(
			{
				set: t,
				get: n,
				remove: function (i, s) {
					t(i, '', Dn({}, s, { expires: -1 }))
				},
				withAttributes: function (i) {
					return go(this.converter, Dn({}, this.attributes, i))
				},
				withConverter: function (i) {
					return go(Dn({}, this.converter, i), this.attributes)
				},
			},
			{
				attributes: { value: Object.freeze(e) },
				converter: { value: Object.freeze(r) },
			},
		)
	}
	var So = go(C0, { path: '/' })
	let vo = 'localStorage',
		Ro = !0
	class G0 {
		constructor() {
			C(this, 'storage', {})
		}
		getItem(e) {
			var t
			return (t = this.storage[e]) != null ? t : ''
		}
		setItem(e, t) {
			this.storage[e] = t
		}
		removeItem(e) {
			delete this.storage[e]
		}
	}
	class V0 {
		getItem(e) {
			var t
			return (t = So.get(e)) != null ? t : ''
		}
		setItem(e, t) {
			if (!Ro) return
			const n = new Date()
			n.setTime(n.getTime() + Le), So.set(e, t, { expires: n })
		}
		removeItem(e) {
			Ro && So.remove(e)
		}
	}
	let N0 = new G0()
	const jn = new V0(),
		Io = () => {
			try {
				switch (vo) {
					case 'localStorage':
						return window.localStorage
					case 'sessionStorage':
						return window.sessionStorage
				}
			} catch (r) {
				return N0
			}
		},
		L0 = (r) => {
			vo = r
		},
		au = (r) => {
			Ro = r
		},
		ke = (r) => Io().getItem(r),
		pt = (r, e) => (jn.setItem(r, e), Io().setItem(r, e)),
		wo = (r) => (jn.removeItem(r), Io().removeItem(r)),
		X0 = (r) => {
			if (vo === 'sessionStorage') {
				console.warn(
					'highlight.io cannot use local storage; segment integration will not work',
				)
				return
			}
			const e = window.localStorage.setItem
			window.localStorage.setItem = function () {
				const [t, n] = arguments
				r({ keyName: t, keyValue: n }), e.apply(this, [t, n])
			}
		}
	var Ze
	;(function (r) {
		;(r.SEGMENT_LAST_SENT_HASH_KEY =
			'HIGHLIGHT_SEGMENT_LAST_SENT_HASH_KEY'),
			(r.SESSION_ID = 'sessionID'),
			(r.SESSION_DATA = 'sessionData'),
			(r.USER_IDENTIFIER = 'highlightIdentifier'),
			(r.USER_OBJECT = 'highlightUserObject')
	})(Ze || (Ze = {}))
	const Qn = (r) => `${Ze.SESSION_DATA}_${r}`
	let lu = ''
	const cu = () => lu,
		W0 = (r) => {
			r && (lu = r)
		},
		_0 = () => {
			var r
			return (r = ke(Ze.SESSION_ID)) != null ? r : ''
		},
		$n = (r) => {
			pt(Ze.SESSION_ID, r)
		},
		x0 = (r) => {
			const e = Qn(r)
			return JSON.parse(ke(e) || '{}')
		},
		rr = (r) => {
			r || (r = _0())
			let e = x0(r)
			if (e && e.lastPushTime && Date.now() - e.lastPushTime < Le)
				return e
			wo(Qn(r))
		},
		nr = function (r) {
			if (!(r != null && r.sessionSecureID)) return
			const e = r.sessionSecureID
			W0(e), pt(Qn(e), JSON.stringify(r))
		},
		O0 = function () {
			const r = jn.getItem(Ze.SESSION_ID)
			$n(r)
			const e = Qn(r),
				t = jn.getItem(e)
			try {
				nr(JSON.parse(t))
			} catch (n) {}
		},
		uu = (r, e, t) => {
			const n = du(e, r.headers, t)
			return q(Z({}, r), { headers: n })
		},
		du = (r, e, t) => {
			var i, s
			const n = Z({}, e)
			return t
				? ((i = Object.keys(n)) == null ||
						i.forEach((o) => {
							;[...t].includes(
								o == null ? void 0 : o.toLowerCase(),
							) || (n[o] = '[REDACTED]')
						}),
					n)
				: ((s = Object.keys(n)) == null ||
						s.forEach((o) => {
							;[...k0, ...r].includes(
								o == null ? void 0 : o.toLowerCase(),
							) && (n[o] = '[REDACTED]')
						}),
					n)
		},
		k0 = ['authorization', 'cookie', 'proxy-authorization', 'token'],
		hu = [
			'https://www.googleapis.com/identitytoolkit',
			'https://securetoken.googleapis.com',
		],
		pu = 'X-Highlight-Request',
		fu = (r) => {
			let e = r
			return (
				!r.startsWith('https://') &&
					!r.startsWith('http://') &&
					(e = `${window.location.origin}${e}`),
				e.replace(/\/+$/, '')
			)
		},
		P0 = (
			r,
			{
				headersToRedact: e,
				headersToRecord: t,
				requestResponseSanitizer: n,
			},
		) => {
			var a, c
			let i = r
			if (n) {
				let d = !0
				try {
					i.request.body = JSON.parse(i.request.body)
				} catch (p) {
					d = !1
				}
				let h = !0
				try {
					i.response.body = JSON.parse(i.response.body)
				} catch (p) {
					h = !1
				}
				try {
					i = n(i)
				} catch (p) {
				} finally {
					;(d =
						d &&
						!!(
							(a = i == null ? void 0 : i.request) != null &&
							a.body
						)),
						(h =
							h &&
							!!(
								(c = i == null ? void 0 : i.response) != null &&
								c.body
							)),
						d && (i.request.body = JSON.stringify(i.request.body)),
						h && (i.response.body = JSON.stringify(i.response.body))
				}
				if (!i) return null
			}
			const u = i,
				{ request: s, response: o } = u,
				l = Ve(u, ['request', 'response'])
			return Z({ request: uu(s, e, t), response: uu(o, e, t) }, l)
		},
		mu = (r, e, t, n) => {
			r.sort((a, c) => a.responseEnd - c.responseEnd)
			const i = { xmlhttprequest: {}, others: {}, fetch: {} },
				s = r.reduce((a, c) => {
					const u = fu(c.name)
					return (
						c.initiatorType === t
							? (a[t][u] = [...(a[t][u] || []), c])
							: (a.others[u] = [...(a.others[u] || []), c]),
						a
					)
				}, i)
			let o = {}
			o = e.reduce((a, c) => {
				const u = fu(c.request.url)
				return (a[u] = [...(a[u] || []), c]), a
			}, o)
			for (let a in s[t]) {
				const c = s[t][a],
					u = o[a]
				if (!u) continue
				const d = Math.max(c.length - u.length, 0)
				for (let h = d; h < c.length; h++)
					c[h] && (c[h].requestResponsePair = u[h - d])
			}
			let l = []
			for (let a in s) for (let c in s[a]) l = l.concat(s[a][c])
			return l
				.sort((a, c) => a.fetchStart - c.fetchStart)
				.reduce((a, c) => {
					let u = c.requestResponsePair
					return (
						(u && ((u = P0(c.requestResponsePair, n)), !u)) ||
							((c.toJSON = function () {
								const d = window.performance.timeOrigin
								return {
									initiatorType: this.initiatorType,
									startTimeAbs: d + this.startTime,
									connectStartAbs: d + this.connectStart,
									connectEndAbs: d + this.connectEnd,
									domainLookupStartAbs:
										d + this.domainLookupStart,
									domainLookupEndAbs:
										d + this.domainLookupEnd,
									fetchStartAbs: d + this.fetchStart,
									redirectStartAbs: d + this.redirectStart,
									redirectEndAbs: d + this.redirectEnd,
									requestStartAbs: d + this.requestStart,
									responseStartAbs: d + this.responseStart,
									responseEndAbs: d + this.responseEnd,
									secureConnectionStartAbs:
										d + this.secureConnectionStart,
									workerStartAbs: d + this.workerStart,
									name: this.name,
									transferSize: this.transferSize,
									encodedBodySize: this.encodedBodySize,
									decodedBodySize: this.decodedBodySize,
									nextHopProtocol: this.nextHopProtocol,
									requestResponsePairs: u,
								}
							}),
							a.push(c)),
						a
					)
				}, [])
		},
		U0 = (r, e) =>
			r.toLocaleLowerCase().includes('pub.highlight.io') ||
			r.toLocaleLowerCase().includes('pub.highlight.io') ||
			r.toLocaleLowerCase().includes('otel.highlight.io') ||
			e.some((t) => r.toLocaleLowerCase().includes(t)),
		qn = (r, e, t) => !U0(r, e) || Zo(r, t != null ? t : [], []),
		Zo = (r, e, t) => {
			var s
			if (t.some((o) => r.toLowerCase().includes(o))) return !1
			let n = []
			e === !0
				? ((n = ['localhost', /^\//]),
					(s = window == null ? void 0 : window.location) != null &&
						s.host &&
						n.push(window.location.host))
				: e instanceof Array && (n = e)
			let i = !1
			return (
				n.forEach((o) => {
					r.match(o) && (i = !0)
				}),
				i
			)
		}
	function A0(r) {
		for (
			var e = '',
				t =
					'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
				n = t.length,
				i = 0;
			i < r;
			i++
		)
			e += t.charAt(Math.floor(Math.random() * n))
		return e
	}
	const To = (r) => {
			const e = A0(10)
			if (r) {
				const t = HS(),
					n = t == null ? void 0 : t.spanContext().traceId
				return [cu(), n != null ? n : e]
			}
			return [cu(), e]
		},
		yu = (r, e) => r + '/' + e,
		M0 = (r, e, t, n, i, s, o) => {
			const l = XMLHttpRequest.prototype,
				a = l.open,
				c = l.send,
				u = l.setRequestHeader
			return (
				(l.open = function (d, h) {
					return (
						typeof h == 'string'
							? (this._url = h)
							: (this._url = h.toString()),
						(this._method = d),
						(this._requestHeaders = {}),
						(this._shouldRecordHeaderAndBody = !n.some((p) =>
							this._url.toLowerCase().includes(p),
						)),
						a.apply(this, arguments)
					)
				}),
				(l.setRequestHeader = function (d, h) {
					return (
						(this._requestHeaders[d] = h), u.apply(this, arguments)
					)
				}),
				(l.send = function (d) {
					if (!qn(this._url, e, t)) return c.apply(this, arguments)
					const [h, p] = To(o)
					Zo(this._url, t, n) && this.setRequestHeader(pu, yu(h, p))
					const y = this._shouldRecordHeaderAndBody,
						f = {
							sessionSecureID: h,
							id: p,
							url: this._url,
							verb: this._method,
							headers: y ? this._requestHeaders : {},
							body: void 0,
						}
					if (y && d) {
						const m = bu(d, f.url)
						m &&
							((this._body = m),
							(f.body = vt(m, i, s, f.headers)))
					}
					return (
						this.addEventListener('load', function () {
							return z(this, null, function* () {
								const m = {
									status: this.status,
									headers: {},
									body: void 0,
								}
								if (y) {
									const S = this.getAllResponseHeaders()
											.trim()
											.split(/[\r\n]+/),
										I = {}
									if (
										(S.forEach(function (G) {
											const L = G.split(': '),
												w = L.shift()
											I[w] = L.join(': ')
										}),
										(m.headers = I),
										d)
									) {
										const G = bu(d, f.url)
										G && (f.body = vt(G, i, s, m.headers))
									}
									if (
										this.responseType === '' ||
										this.responseType === 'text'
									)
										(m.body = vt(
											this.responseText,
											i,
											s,
											m.headers,
										)),
											(m.size =
												this.responseText.length * 8)
									else if (this.responseType === 'blob') {
										if (this.response instanceof Blob)
											try {
												const G =
													yield this.response.text()
												;(m.body = vt(
													G,
													i,
													s,
													m.headers,
												)),
													(m.size =
														this.response.size)
											} catch (G) {}
									} else
										try {
											m.body = vt(
												this.response,
												i,
												s,
												m.headers,
											)
										} catch (G) {}
								}
								r({ request: f, response: m, urlBlocked: !y })
							})
						}),
						this.addEventListener('error', function () {
							return z(this, null, function* () {
								const m = {
									status: this.status,
									headers: void 0,
									body: void 0,
								}
								r({ request: f, response: m, urlBlocked: !1 })
							})
						}),
						c.apply(this, arguments)
					)
				}),
				() => {
					;(l.open = a), (l.send = c), (l.setRequestHeader = u)
				}
			)
		},
		bu = (r, e) => {
			if (typeof r == 'string') {
				if (
					!(
						((e != null && e.includes('localhost')) ||
							(e != null && e.includes('highlight.run'))) &&
						r.includes('pushPayload')
					)
				)
					return r
			} else if (
				typeof r == 'object' ||
				typeof r == 'number' ||
				typeof r == 'boolean'
			)
				return Lt(r)
			return null
		},
		gu = 64 * 1024,
		Y0 = {
			'application/json': 64 * 1024 * 1024,
			'text/plain': 64 * 1024 * 1024,
		},
		vt = (r, e, t, n) => {
			var s, o, l
			let i = gu
			if (n) {
				let a = ''
				typeof n.get == 'function'
					? (a = (s = n.get('content-type')) != null ? s : '')
					: (a = (o = n['content-type']) != null ? o : '')
				try {
					a = a.split(';')[0]
				} catch (c) {}
				i = (l = Y0[a]) != null ? l : gu
			}
			if (r) {
				if (e)
					try {
						const a = JSON.parse(r)
						Array.isArray(a)
							? a.forEach((c) => {
									Object.keys(c).forEach((u) => {
										e.includes(u.toLocaleLowerCase()) &&
											(c[u] = '[REDACTED]')
									})
								})
							: Object.keys(a).forEach((c) => {
									e.includes(c.toLocaleLowerCase()) &&
										(a[c] = '[REDACTED]')
								}),
							(r = JSON.stringify(a))
					} catch (a) {}
				if (t)
					try {
						const a = JSON.parse(r)
						Object.keys(a).forEach((c) => {
							t.includes(c.toLocaleLowerCase()) ||
								(a[c] = '[REDACTED]')
						}),
							(r = JSON.stringify(a))
					} catch (a) {}
			}
			try {
				r = r.slice(0, i)
			} catch (a) {}
			return r
		},
		F0 = (r, e, t, n, i, s, o) => {
			const l = window._fetchProxy
			return (
				(window._fetchProxy = function (a, c) {
					const { method: u, url: d } = J0(a, c)
					if (!qn(d, e, t)) return l.call(this, a, c)
					const [h, p] = To(o)
					if (Zo(d, t, n)) {
						c = c || {}
						let g = new Headers(c.headers)
						a instanceof Request &&
							[...a.headers].forEach(([v, S]) => g.set(v, S)),
							g.set(pu, yu(h, p)),
							(c.headers = Object.fromEntries(g.entries()))
					}
					const y = {
							sessionSecureID: h,
							id: p,
							headers: {},
							body: void 0,
							url: d,
							verb: u,
						},
						f = !n.some((g) => d.toLowerCase().includes(g))
					f &&
						((y.headers = Object.fromEntries(
							new Headers(
								c == null ? void 0 : c.headers,
							).entries(),
						)),
						(y.body = vt(
							c == null ? void 0 : c.body,
							i,
							s,
							c == null ? void 0 : c.headers,
						)))
					let m = l.call(this, a, c)
					return H0(m, y, r, f, i, s), m
				}),
				() => {
					window._fetchProxy = l
				}
			)
		},
		J0 = (r, e) => {
			const t =
				(e && e.method) ||
				(typeof r == 'object' && 'method' in r && r.method) ||
				'GET'
			let n
			return (
				typeof r == 'object'
					? 'url' in r && r.url
						? (n = r.url)
						: (n = r.toString())
					: (n = r),
				{ method: t, url: n }
			)
		},
		H0 = (r, e, t, n, i, s) => {
			const o = (l) =>
				z(this, null, function* () {
					let a = {
							body: void 0,
							headers: void 0,
							status: 0,
							size: 0,
						},
						c = !1,
						u = !n
					'stack' in l || l instanceof Error
						? ((a = q(Z({}, a), {
								body: l.message,
								status: 0,
								size: void 0,
							})),
							(c = !0))
						: 'status' in l &&
							((a = q(Z({}, a), { status: l.status })),
							n &&
								((a.body = yield Su(l, s, i)),
								(a.headers = Object.fromEntries(
									l.headers.entries(),
								)),
								(a.size = a.body.length * 8)),
							(l.type === 'opaque' ||
								l.type === 'opaqueredirect') &&
								((u = !0),
								(a = q(Z({}, a), {
									body: 'CORS blocked request',
								}))),
							(c = !0)),
						c && t({ request: e, response: a, urlBlocked: u })
				})
			r.then(o).catch(() => {})
		},
		Su = (r, e, t) =>
			z(this, null, function* () {
				let n
				try {
					const s = r.clone().body
					if (s) {
						let o = s.getReader(),
							l = new TextDecoder(),
							a,
							c = ''
						for (; !(a = yield o.read()).done; ) {
							let u = a.value
							c += l.decode(u)
						}
						;(n = c), (n = vt(n, t, e, r.headers))
					} else n = ''
				} catch (i) {
					n = `Unable to clone response: ${i}`
				}
				return n
			})
	var K0 = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		vu = 1e4
	function B0(r) {
		r === void 0 && (r = {})
		var e = {}
		return (
			Object.entries(r).forEach(function (t) {
				var n = K0(t, 2),
					i = n[0],
					s = n[1]
				typeof s != 'undefined'
					? (e[i] = String(s))
					: Y.warn(
							'Header "' +
								i +
								'" has invalid value (' +
								s +
								') and will be ignored',
						)
			}),
			e
		)
	}
	function z0(r) {
		return typeof r == 'number' ? (r <= 0 ? Ru(r, vu) : r) : D0()
	}
	function D0() {
		var r,
			e = Number(
				(r = lt().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT) !== null &&
					r !== void 0
					? r
					: lt().OTEL_EXPORTER_OTLP_TIMEOUT,
			)
		return e <= 0 ? Ru(e, vu) : e
	}
	function Ru(r, e) {
		return Y.warn('Timeout must be greater than 0', r), e
	}
	function j0(r) {
		var e = [429, 502, 503, 504]
		return e.includes(r)
	}
	function Q0(r) {
		if (r == null) return -1
		var e = Number.parseInt(r, 10)
		if (Number.isInteger(e)) return e > 0 ? e * 1e3 : -1
		var t = new Date(r).getTime() - Date.now()
		return t >= 0 ? t : 0
	}
	var $0 = (function () {
			function r(e) {
				e === void 0 && (e = {}),
					(this._sendingPromises = []),
					(this.url = this.getDefaultUrl(e)),
					typeof e.hostname == 'string' &&
						(this.hostname = e.hostname),
					(this.shutdown = this.shutdown.bind(this)),
					(this._shutdownOnce = new wc(this._shutdown, this)),
					(this._concurrencyLimit =
						typeof e.concurrencyLimit == 'number'
							? e.concurrencyLimit
							: 30),
					(this.timeoutMillis = z0(e.timeoutMillis)),
					this.onInit(e)
			}
			return (
				(r.prototype.export = function (e, t) {
					if (this._shutdownOnce.isCalled) {
						t({
							code: Ot.FAILED,
							error: new Error('Exporter has been shutdown'),
						})
						return
					}
					if (
						this._sendingPromises.length >= this._concurrencyLimit
					) {
						t({
							code: Ot.FAILED,
							error: new Error('Concurrent export limit reached'),
						})
						return
					}
					this._export(e)
						.then(function () {
							t({ code: Ot.SUCCESS })
						})
						.catch(function (n) {
							t({ code: Ot.FAILED, error: n })
						})
				}),
				(r.prototype._export = function (e) {
					var t = this
					return new Promise(function (n, i) {
						try {
							Y.debug('items to be sent', e), t.send(e, n, i)
						} catch (s) {
							i(s)
						}
					})
				}),
				(r.prototype.shutdown = function () {
					return this._shutdownOnce.call()
				}),
				(r.prototype.forceFlush = function () {
					return Promise.all(this._sendingPromises).then(
						function () {},
					)
				}),
				(r.prototype._shutdown = function () {
					return (
						Y.debug('shutdown started'),
						this.onShutdown(),
						this.forceFlush()
					)
				}),
				r
			)
		})(),
		q0 = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		Iu = (function (r) {
			q0(e, r)
			function e(t, n, i) {
				var s = r.call(this, t) || this
				return (
					(s.name = 'OTLPExporterError'),
					(s.data = i),
					(s.code = n),
					s
				)
			}
			return e
		})(Error),
		eS = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		},
		tS = (function () {
			function r(e) {
				this._parameters = e
			}
			return (
				(r.prototype.send = function (e, t) {
					var n = this
					return new Promise(function (i) {
						var s = new XMLHttpRequest()
						;(s.timeout = t),
							s.open('POST', n._parameters.url),
							Object.entries(n._parameters.headers).forEach(
								function (o) {
									var l = eS(o, 2),
										a = l[0],
										c = l[1]
									s.setRequestHeader(a, c)
								},
							),
							(s.ontimeout = function (o) {
								i({
									status: 'failure',
									error: new Error('XHR request timed out'),
								})
							}),
							(s.onreadystatechange = function () {
								s.status >= 200 && s.status <= 299
									? (Y.debug('XHR success'),
										i({ status: 'success' }))
									: s.status && j0(s.status)
										? i({
												status: 'retryable',
												retryInMillis: Q0(
													s.getResponseHeader(
														'Retry-After',
													),
												),
											})
										: s.status !== 0 &&
											i({
												status: 'failure',
												error: new Error(
													'XHR request failed with non-retryable status',
												),
											})
							}),
							(s.onabort = function () {
								i({
									status: 'failure',
									error: new Error('XHR request aborted'),
								})
							}),
							(s.onerror = function () {
								i({
									status: 'failure',
									error: new Error('XHR request errored'),
								})
							}),
							s.send(
								new Blob([e], {
									type: n._parameters.headers['Content-Type'],
								}),
							)
					})
				}),
				(r.prototype.shutdown = function () {}),
				r
			)
		})()
	function rS(r) {
		return new tS(r)
	}
	var nS = (function () {
		function r(e) {
			this._params = e
		}
		return (
			(r.prototype.send = function (e) {
				var t = this
				return new Promise(function (n) {
					navigator.sendBeacon(
						t._params.url,
						new Blob([e], { type: t._params.blobType }),
					)
						? (Y.debug('SendBeacon success'),
							n({ status: 'success' }))
						: n({
								status: 'failure',
								error: new Error('SendBeacon failed'),
							})
				})
			}),
			(r.prototype.shutdown = function () {}),
			r
		)
	})()
	function iS(r) {
		return new nS(r)
	}
	var sS = function (r, e, t, n) {
			function i(s) {
				return s instanceof t
					? s
					: new t(function (o) {
							o(s)
						})
			}
			return new (t || (t = Promise))(function (s, o) {
				function l(u) {
					try {
						c(n.next(u))
					} catch (d) {
						o(d)
					}
				}
				function a(u) {
					try {
						c(n.throw(u))
					} catch (d) {
						o(d)
					}
				}
				function c(u) {
					u.done ? s(u.value) : i(u.value).then(l, a)
				}
				c((n = n.apply(r, e || [])).next())
			})
		},
		oS = function (r, e) {
			var t = {
					label: 0,
					sent: function () {
						if (s[0] & 1) throw s[1]
						return s[1]
					},
					trys: [],
					ops: [],
				},
				n,
				i,
				s,
				o
			return (
				(o = { next: l(0), throw: l(1), return: l(2) }),
				typeof Symbol == 'function' &&
					(o[Symbol.iterator] = function () {
						return this
					}),
				o
			)
			function l(c) {
				return function (u) {
					return a([c, u])
				}
			}
			function a(c) {
				if (n) throw new TypeError('Generator is already executing.')
				for (; t; )
					try {
						if (
							((n = 1),
							i &&
								(s =
									c[0] & 2
										? i.return
										: c[0]
											? i.throw ||
												((s = i.return) && s.call(i), 0)
											: i.next) &&
								!(s = s.call(i, c[1])).done)
						)
							return s
						switch (
							((i = 0), s && (c = [c[0] & 2, s.value]), c[0])
						) {
							case 0:
							case 1:
								s = c
								break
							case 4:
								return t.label++, { value: c[1], done: !1 }
							case 5:
								t.label++, (i = c[1]), (c = [0])
								continue
							case 7:
								;(c = t.ops.pop()), t.trys.pop()
								continue
							default:
								if (
									((s = t.trys),
									!(s = s.length > 0 && s[s.length - 1]) &&
										(c[0] === 6 || c[0] === 2))
								) {
									t = 0
									continue
								}
								if (
									c[0] === 3 &&
									(!s || (c[1] > s[0] && c[1] < s[3]))
								) {
									t.label = c[1]
									break
								}
								if (c[0] === 6 && t.label < s[1]) {
									;(t.label = s[1]), (s = c)
									break
								}
								if (s && t.label < s[2]) {
									;(t.label = s[2]), t.ops.push(c)
									break
								}
								s[2] && t.ops.pop(), t.trys.pop()
								continue
						}
						c = e.call(r, t)
					} catch (u) {
						;(c = [6, u]), (i = 0)
					} finally {
						n = s = 0
					}
				if (c[0] & 5) throw c[1]
				return { value: c[0] ? c[1] : void 0, done: !0 }
			}
		},
		aS = 5,
		lS = 1e3,
		cS = 5e3,
		uS = 1.5,
		wu = 0.2
	function dS() {
		return Math.random() * (2 * wu) - wu
	}
	var hS = (function () {
		function r(e) {
			this._transport = e
		}
		return (
			(r.prototype.retry = function (e, t, n) {
				var i = this
				return new Promise(function (s, o) {
					setTimeout(function () {
						i._transport.send(e, t).then(s, o)
					}, n)
				})
			}),
			(r.prototype.send = function (e, t) {
				var n
				return sS(this, void 0, void 0, function () {
					var i, s, o, l, a, c, u
					return oS(this, function (d) {
						switch (d.label) {
							case 0:
								return (
									(i = Date.now() + t),
									[4, this._transport.send(e, t)]
								)
							case 1:
								;(s = d.sent()),
									(o = aS),
									(l = lS),
									(d.label = 2)
							case 2:
								return s.status === 'retryable' && o > 0
									? (o--,
										(a = Math.max(
											Math.min(l, cS) + dS(),
											0,
										)),
										(l = l * uS),
										(c =
											(n = s.retryInMillis) !== null &&
											n !== void 0
												? n
												: a),
										(u = i - Date.now()),
										c > u
											? [2, s]
											: [4, this.retry(e, u, c)])
									: [3, 4]
							case 3:
								return (s = d.sent()), [3, 2]
							case 4:
								return [2, s]
						}
					})
				})
			}),
			(r.prototype.shutdown = function () {
				return this._transport.shutdown()
			}),
			r
		)
	})()
	function pS(r) {
		return new hS(r.transport)
	}
	var fS = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		mS = (function (r) {
			fS(e, r)
			function e(t, n, i) {
				t === void 0 && (t = {})
				var s = r.call(this, t) || this
				s._serializer = n
				var o = !!t.headers || typeof navigator.sendBeacon != 'function'
				return (
					o
						? (s._transport = pS({
								transport: rS({
									headers: Object.assign(
										{},
										B0(t.headers),
										Ub.parseKeyPairsIntoRecord(
											lt().OTEL_EXPORTER_OTLP_HEADERS,
										),
										{ 'Content-Type': i },
									),
									url: s.url,
								}),
							}))
						: (s._transport = iS({ url: s.url, blobType: i })),
					s
				)
			}
			return (
				(e.prototype.onInit = function () {}),
				(e.prototype.onShutdown = function () {}),
				(e.prototype.send = function (t, n, i) {
					var s = this
					if (this._shutdownOnce.isCalled) {
						Y.debug('Shutdown already started. Cannot send objects')
						return
					}
					var o = this._serializer.serializeRequest(t)
					if (o == null) {
						i(new Error('Could not serialize message'))
						return
					}
					var l = this._transport
						.send(o, this.timeoutMillis)
						.then(function (c) {
							c.status === 'success'
								? n()
								: c.status === 'failure' && c.error
									? i(c.error)
									: c.status === 'retryable'
										? i(
												new Iu(
													'Export failed with retryable status',
												),
											)
										: i(
												new Iu(
													'Export failed with unknown error',
												),
											)
						}, i)
					this._sendingPromises.push(l)
					var a = function () {
						var c = s._sendingPromises.indexOf(l)
						s._sendingPromises.splice(c, 1)
					}
					l.then(a, a)
				}),
				e
			)
		})($0)
	function Zu(r) {
		var e = BigInt(1e9)
		return BigInt(r[0]) * e + BigInt(r[1])
	}
	function yS(r) {
		var e = Number(BigInt.asUintN(32, r)),
			t = Number(BigInt.asUintN(32, r >> BigInt(32)))
		return { low: e, high: t }
	}
	function Tu(r) {
		var e = Zu(r)
		return yS(e)
	}
	function bS(r) {
		var e = Zu(r)
		return e.toString()
	}
	var gS = typeof BigInt != 'undefined' ? bS : ut
	function Eu(r) {
		return r
	}
	function Cu(r) {
		if (r !== void 0) return Js(r)
	}
	var SS = {
		encodeHrTime: Tu,
		encodeSpanContext: Js,
		encodeOptionalSpanContext: Cu,
	}
	function vS(r) {
		var e, t
		if (r === void 0) return SS
		var n = (e = r.useLongBits) !== null && e !== void 0 ? e : !0,
			i = (t = r.useHex) !== null && t !== void 0 ? t : !1
		return {
			encodeHrTime: n ? Tu : gS,
			encodeSpanContext: i ? Eu : Js,
			encodeOptionalSpanContext: i ? Eu : Cu,
		}
	}
	var RS = function (r, e) {
		var t = typeof Symbol == 'function' && r[Symbol.iterator]
		if (!t) return r
		var n = t.call(r),
			i,
			s = [],
			o
		try {
			for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
				s.push(i.value)
		} catch (l) {
			o = { error: l }
		} finally {
			try {
				i && !i.done && (t = n.return) && t.call(n)
			} finally {
				if (o) throw o.error
			}
		}
		return s
	}
	function IS(r) {
		return { name: r.name, version: r.version }
	}
	function ei(r) {
		return Object.keys(r).map(function (e) {
			return Gu(e, r[e])
		})
	}
	function Gu(r, e) {
		return { key: r, value: Vu(e) }
	}
	function Vu(r) {
		var e = typeof r
		return e === 'string'
			? { stringValue: r }
			: e === 'number'
				? Number.isInteger(r)
					? { intValue: r }
					: { doubleValue: r }
				: e === 'boolean'
					? { boolValue: r }
					: r instanceof Uint8Array
						? { bytesValue: r }
						: Array.isArray(r)
							? { arrayValue: { values: r.map(Vu) } }
							: e === 'object' && r != null
								? {
										kvlistValue: {
											values: Object.entries(r).map(
												function (t) {
													var n = RS(t, 2),
														i = n[0],
														s = n[1]
													return Gu(i, s)
												},
											),
										},
									}
								: {}
	}
	function wS(r, e) {
		var t,
			n = r.spanContext(),
			i = r.status
		return {
			traceId: e.encodeSpanContext(n.traceId),
			spanId: e.encodeSpanContext(n.spanId),
			parentSpanId: e.encodeOptionalSpanContext(r.parentSpanId),
			traceState:
				(t = n.traceState) === null || t === void 0
					? void 0
					: t.serialize(),
			name: r.name,
			kind: r.kind == null ? 0 : r.kind + 1,
			startTimeUnixNano: e.encodeHrTime(r.startTime),
			endTimeUnixNano: e.encodeHrTime(r.endTime),
			attributes: ei(r.attributes),
			droppedAttributesCount: r.droppedAttributesCount,
			events: r.events.map(function (s) {
				return TS(s, e)
			}),
			droppedEventsCount: r.droppedEventsCount,
			status: { code: i.code, message: i.message },
			links: r.links.map(function (s) {
				return ZS(s, e)
			}),
			droppedLinksCount: r.droppedLinksCount,
		}
	}
	function ZS(r, e) {
		var t
		return {
			attributes: r.attributes ? ei(r.attributes) : [],
			spanId: e.encodeSpanContext(r.context.spanId),
			traceId: e.encodeSpanContext(r.context.traceId),
			traceState:
				(t = r.context.traceState) === null || t === void 0
					? void 0
					: t.serialize(),
			droppedAttributesCount: r.droppedAttributesCount || 0,
		}
	}
	function TS(r, e) {
		return {
			attributes: r.attributes ? ei(r.attributes) : [],
			name: r.name,
			timeUnixNano: e.encodeHrTime(r.time),
			droppedAttributesCount: r.droppedAttributesCount || 0,
		}
	}
	function ES(r) {
		return { attributes: ei(r.attributes), droppedAttributesCount: 0 }
	}
	var CS = function (r) {
			var e = typeof Symbol == 'function' && Symbol.iterator,
				t = e && r[e],
				n = 0
			if (t) return t.call(r)
			if (r && typeof r.length == 'number')
				return {
					next: function () {
						return (
							r && n >= r.length && (r = void 0),
							{ value: r && r[n++], done: !r }
						)
					},
				}
			throw new TypeError(
				e
					? 'Object is not iterable.'
					: 'Symbol.iterator is not defined.',
			)
		},
		GS = function (r, e) {
			var t = typeof Symbol == 'function' && r[Symbol.iterator]
			if (!t) return r
			var n = t.call(r),
				i,
				s = [],
				o
			try {
				for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
					s.push(i.value)
			} catch (l) {
				o = { error: l }
			} finally {
				try {
					i && !i.done && (t = n.return) && t.call(n)
				} finally {
					if (o) throw o.error
				}
			}
			return s
		}
	function VS(r, e) {
		var t = vS(e)
		return { resourceSpans: LS(r, t) }
	}
	function NS(r) {
		var e,
			t,
			n = new Map()
		try {
			for (var i = CS(r), s = i.next(); !s.done; s = i.next()) {
				var o = s.value,
					l = n.get(o.resource)
				l || ((l = new Map()), n.set(o.resource, l))
				var a =
						o.instrumentationLibrary.name +
						'@' +
						(o.instrumentationLibrary.version || '') +
						':' +
						(o.instrumentationLibrary.schemaUrl || ''),
					c = l.get(a)
				c || ((c = []), l.set(a, c)), c.push(o)
			}
		} catch (u) {
			e = { error: u }
		} finally {
			try {
				s && !s.done && (t = i.return) && t.call(i)
			} finally {
				if (e) throw e.error
			}
		}
		return n
	}
	function LS(r, e) {
		for (var t = NS(r), n = [], i = t.entries(), s = i.next(); !s.done; ) {
			for (
				var o = GS(s.value, 2),
					l = o[0],
					a = o[1],
					c = [],
					u = a.values(),
					d = u.next();
				!d.done;

			) {
				var h = d.value
				if (h.length > 0) {
					var p = h.map(function (f) {
						return wS(f, e)
					})
					c.push({
						scope: IS(h[0].instrumentationLibrary),
						spans: p,
						schemaUrl: h[0].instrumentationLibrary.schemaUrl,
					})
				}
				d = u.next()
			}
			var y = { resource: ES(l), scopeSpans: c, schemaUrl: void 0 }
			n.push(y), (s = i.next())
		}
		return n
	}
	var XS = {
			serializeRequest: function (r) {
				var e = VS(r, { useHex: !0, useLongBits: !1 }),
					t = new TextEncoder()
				return t.encode(JSON.stringify(e))
			},
			deserializeResponse: function (r) {
				var e = new TextDecoder()
				return JSON.parse(e.decode(r))
			},
		},
		WS = (function () {
			var r = function (e, t) {
				return (
					(r =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (n, i) {
								n.__proto__ = i
							}) ||
						function (n, i) {
							for (var s in i)
								Object.prototype.hasOwnProperty.call(i, s) &&
									(n[s] = i[s])
						}),
					r(e, t)
				)
			}
			return function (e, t) {
				if (typeof t != 'function' && t !== null)
					throw new TypeError(
						'Class extends value ' +
							String(t) +
							' is not a constructor or null',
					)
				r(e, t)
				function n() {
					this.constructor = e
				}
				e.prototype =
					t === null
						? Object.create(t)
						: ((n.prototype = t.prototype), new n())
			}
		})(),
		_S = 'v1/traces',
		xS = 'http://localhost:4318/' + _S,
		Nu = (function (r) {
			WS(e, r)
			function e(t) {
				return (
					t === void 0 && (t = {}),
					r.call(this, t, XS, 'application/json') || this
				)
			}
			return (
				(e.prototype.getDefaultUrl = function (t) {
					return typeof t.url == 'string' ? t.url : xS
				}),
				e
			)
		})(mS)
	class OS extends Nu {
		constructor(t) {
			super(t)
			C(this, 'xhrTraceExporter')
			this.xhrTraceExporter = new Nu(
				q(Z({}, t != null ? t : {}), { headers: {} }),
			)
		}
		send(t, n, i) {
			super.send(t, n, (s) => {
				s.message.toLocaleLowerCase().includes('beacon')
					? this.xhrTraceExporter.send(t, n, (o) => {
							i(
								q(Z({}, s), {
									message: `${s.message} --- [XHR retry message: ${o.message}; code: ${o.code}].`,
									code: s.code,
									data: `${s.data} --- [XHR retry data: ${o.data}].`,
								}),
							)
						})
					: i(s)
			})
		}
	}
	const kS = ['click', 'input', 'submit']
	function PS() {
		return !1
	}
	class US extends kn {
		constructor(t = {}) {
			var n
			super('user-interaction', '1.0.0', t)
			C(this, '_spansData', new WeakMap())
			C(this, '_wrappedListeners', new WeakMap())
			C(this, '_eventsSpanMap', new WeakMap())
			C(this, '_eventNames')
			C(this, '_shouldPreventSpanCreation')
			;(this._eventNames = new Set(
				(n = t == null ? void 0 : t.eventNames) != null ? n : kS,
			)),
				(this._shouldPreventSpanCreation =
					typeof (t == null ? void 0 : t.shouldPreventSpanCreation) ==
					'function'
						? t.shouldPreventSpanCreation
						: PS)
		}
		init() {}
		_allowEventName(t) {
			return this._eventNames.has(t)
		}
		_createSpan(t, n) {
			var l
			const i = t == null ? void 0 : t.target,
				s = t == null ? void 0 : t.type
			if (
				!(i instanceof HTMLElement) ||
				!i.getAttribute ||
				i.hasAttribute('disabled') ||
				!this._allowEventName(s)
			)
				return
			const o = Uc(i, !0)
			try {
				const a = this.tracer.startSpan(
					s,
					{
						attributes: {
							'event.type': s,
							'event.tag': i.tagName,
							'event.xpath': o,
							'event.id': i.id,
							'event.text': (l = i.textContent) != null ? l : '',
							'event.url': window.location.href,
							'viewport.width': window.innerWidth,
							'viewport.height': window.innerHeight,
						},
					},
					n ? ae.setSpan(Q.active(), n) : void 0,
				)
				return (
					t instanceof MouseEvent &&
						(a.setAttribute('event.x', t.clientX),
						a.setAttribute('event.y', t.clientY),
						a.setAttribute(
							'event.relativeX',
							t.clientX / window.innerWidth,
						),
						a.setAttribute(
							'event.relativeY',
							t.clientY / window.innerHeight,
						),
						s === 'scroll' &&
							(a.setAttribute('event.scrollX', window.scrollX),
							a.setAttribute('event.scrollY', window.scrollY))),
					this._shouldPreventSpanCreation(s, i, a) === !0
						? void 0
						: (this._spansData.set(a, { taskCount: 0 }), a)
				)
			} catch (a) {
				this._diag.error(
					'failed to start create new user interaction span',
					a,
				)
			}
		}
		addPatchedListener(t, n, i, s) {
			let o = this._wrappedListeners.get(i)
			o || ((o = new Map()), this._wrappedListeners.set(i, o))
			let l = o.get(n)
			return (
				l || ((l = new Map()), o.set(n, l)),
				l.has(t) ? !1 : (l.set(t, s), !0)
			)
		}
		removePatchedListener(t, n, i) {
			const s = this._wrappedListeners.get(i)
			if (!s) return
			const o = s.get(n)
			if (!o) return
			const l = o.get(t)
			return (
				l &&
					(o.delete(t),
					o.size === 0 &&
						(s.delete(n),
						s.size === 0 && this._wrappedListeners.delete(i))),
				l
			)
		}
		_invokeListener(t, n, i) {
			return typeof t == 'function' ? t.apply(n, i) : t.handleEvent(i[0])
		}
		_patchAddEventListener() {
			const t = this
			let n = 0
			return (i) =>
				function (o, l, a) {
					if (!l) return i.call(this, o, l, a)
					const c = a && typeof a == 'object' && a.once,
						u = function (...d) {
							let h
							const p = d[0]
							if (
								(p == null ? void 0 : p.type) === 'mousemove' &&
								Date.now() - n < 1e3 / 60
							)
								return i.call(this, o, l, a)
							;(n = Date.now()),
								p && (h = t._eventsSpanMap.get(p)),
								c && t.removePatchedListener(this, o, l)
							const y = t._createSpan(p, h)
							return y
								? (p && t._eventsSpanMap.set(p, y),
									Q.with(ae.setSpan(Q.active(), y), () => {
										const f = t._invokeListener(l, this, d)
										return y.end(), f
									}))
								: t._invokeListener(l, this, d)
						}
					if (t.addPatchedListener(this, o, l, u))
						return i.call(this, o, u, a)
				}
		}
		_patchRemoveEventListener() {
			const t = this
			return (n) =>
				function (s, o, l) {
					const a = t.removePatchedListener(this, s, o)
					return a ? n.call(this, s, a, l) : n.call(this, s, o, l)
				}
		}
		_getPatchableEventTargets() {
			return window.EventTarget
				? [EventTarget.prototype]
				: [Node.prototype, Window.prototype]
		}
		enable() {
			this._getPatchableEventTargets().forEach((n) => {
				Pt(n.addEventListener) &&
					(this._unwrap(n, 'addEventListener'),
					this._diag.debug(
						'removing previous patch from method addEventListener',
					)),
					Pt(n.removeEventListener) &&
						(this._unwrap(n, 'removeEventListener'),
						this._diag.debug(
							'removing previous patch from method removeEventListener',
						)),
					this._wrap(
						n,
						'addEventListener',
						this._patchAddEventListener(),
					),
					this._wrap(
						n,
						'removeEventListener',
						this._patchRemoveEventListener(),
					)
			})
		}
		disable() {
			this._getPatchableEventTargets().forEach((n) => {
				Pt(n.addEventListener) && this._unwrap(n, 'addEventListener'),
					Pt(n.removeEventListener) &&
						this._unwrap(n, 'removeEventListener')
			})
		}
	}
	let Rt
	const ti = 'highlight.record',
		AS = (r) => {
			var l, a, c, u
			if (Rt !== void 0) {
				console.warn('OTEL already initialized. Skipping...')
				return
			}
			const e = r.backendUrl || void 0 || 'https://pub.highlight.run',
				t = [
					...((a =
						(l = r.networkRecordingOptions) == null
							? void 0
							: l.urlBlocklist) != null
						? a
						: []),
					...hu,
				],
				n = (c = r.environment) != null ? c : 'production'
			Rt = new Ig({
				resource: new oo({
					[sc]: (u = r.serviceName) != null ? u : 'highlight-browser',
					[jy]: n,
					'highlight.project_id': r.projectId,
					'highlight.session_id': r.sessionSecureId,
				}),
			})
			const i = new OS({
					url: r.otlpEndpoint + '/v1/traces',
					concurrencyLimit: 10,
					compression: 'gzip',
				}),
				s = new MS(i, { maxExportBatchSize: 15 })
			Rt.addSpanProcessor(s),
				Bb({
					instrumentations: [
						new _g({
							applyCustomAttributesOnSpan: {
								documentLoad: Wu,
								documentFetch: Wu,
								resourceFetch: zS,
							},
						}),
						new US(),
						new kg({
							propagateTraceHeaderCorsUrls: /.*/,
							applyCustomAttributesOnSpan: (d, h, p) =>
								z(this, null, function* () {
									var v, S, I
									const y = d
									if (y.attributes[ti] === !1) return
									const f = y.attributes['http.url'],
										m = (v = h.method) != null ? v : 'GET'
									if (
										(d.updateName(Lu(f, m, h.body)),
										!(p instanceof Response))
									) {
										d.setAttributes({
											'http.response.error': p.message,
											'http.response.status': p.status,
										})
										return
									}
									Xu(
										d,
										h.body,
										h.headers,
										r.networkRecordingOptions,
									)
									const g = yield Su(
										p,
										(S = r.networkRecordingOptions) == null
											? void 0
											: S.bodyKeysToRecord,
										(I = r.networkRecordingOptions) == null
											? void 0
											: I.networkBodyKeysToRedact,
									)
									d.setAttribute('http.response.body', g)
								}),
						}),
						new Ag({
							propagateTraceHeaderCorsUrls: /.*/,
							applyCustomAttributesOnSpan: (d, h) => {
								var g, v
								const p = h
								if (d.attributes[ti] === !1) return
								const f = Lu(p._url, p._method, h.responseText)
								d.updateName(f),
									Xu(
										d,
										p._body,
										p._requestHeaders,
										r.networkRecordingOptions,
									)
								const m = vt(
									p._body,
									(g = r.networkRecordingOptions) == null
										? void 0
										: g.networkBodyKeysToRedact,
									(v = r.networkRecordingOptions) == null
										? void 0
										: v.bodyKeysToRecord,
									p._requestHeaders,
								)
								d.setAttribute('http.request.body', m)
							},
						}),
					],
				})
			const o = new Oc()
			o.enable(),
				Rt.register({
					contextManager: o,
					propagator: new lc({
						propagators: [
							new zl(),
							new YS({
								backendUrl: e,
								otlpEndpoint: r.otlpEndpoint,
								tracingOrigins: r.tracingOrigins,
								urlBlocklist: t,
							}),
						],
					}),
				})
		}
	class MS extends _c {
		onEnd(e) {
			e.attributes[ti] !== !1 && super.onEnd(e)
		}
	}
	class YS extends hc {
		constructor(t) {
			super()
			C(this, 'highlightEndpoints')
			C(this, 'tracingOrigins')
			C(this, 'urlBlocklist')
			;(this.highlightEndpoints = [t.backendUrl, t.otlpEndpoint]),
				(this.tracingOrigins = t.tracingOrigins),
				(this.urlBlocklist = t.urlBlocklist)
		}
		inject(t, n, i) {
			const s = ae.getSpan(t)
			if (!s) return
			const o = s.attributes['http.url']
			if (
				typeof o == 'string' &&
				!BS(
					o,
					this.highlightEndpoints,
					this.tracingOrigins,
					this.urlBlocklist,
				)
			) {
				s.setAttribute(ti, !1)
				return
			}
			super.inject(t, n, i)
		}
	}
	const FS = 'highlight-browser',
		JS = () => Rt.getTracer(FS),
		HS = () => ae.getActiveSpan(),
		KS = () =>
			z(this, null, function* () {
				Rt !== void 0 && (yield Rt.forceFlush(), Rt.shutdown())
			}),
		Lu = (r, e, t) => {
			var l, a, c
			let n
			const i = new URL(r),
				s = i.pathname
			let o = `${e.toUpperCase()} - ${s}`
			try {
				if (
					((n = typeof t == 'string' ? JSON.parse(t) : t),
					n && n.query)
				) {
					const u = bo(n.query),
						d =
							((l = u.definitions[0]) == null
								? void 0
								: l.kind) === 'OperationDefinition'
								? (c =
										(a = u.definitions[0]) == null
											? void 0
											: a.name) == null
									? void 0
									: c.value
								: void 0
					d && (o = `${d} (GraphQL: ${i.host + i.pathname})`)
				}
			} catch (u) {}
			return o
		},
		Xu = (r, e, t, n) => {
			var l
			const i = typeof e == 'string' ? e : String(e)
			let s
			try {
				;(s = e ? JSON.parse(i) : void 0),
					s.operationName &&
						r.setAttribute(
							'graphql.operation.name',
							s.operationName,
						)
			} catch (a) {}
			const o = du(
				(l = n == null ? void 0 : n.networkHeadersToRedact) != null
					? l
					: [],
				t,
				n == null ? void 0 : n.headerKeysToRecord,
			)
			r.setAttributes({
				'highlight.type': 'http.request',
				'http.request.headers': JSON.stringify(o),
				'http.request.body': i,
			})
		},
		BS = (r, e, t, n) =>
			n != null && n.some((s) => r.toLowerCase().includes(s))
				? !1
				: qn(r, e, t),
		Wu = (r) => {
			const t = r.events,
				n = {
					unload: He('unloadEventStart', 'unloadEventEnd', t),
					dom_interactive: He('domInteractive', 'fetchStart', t),
					dom_content_loaded: He(
						'domContentLoadedEventEnd',
						'domContentLoadedEventStart',
						t,
					),
					dom_complete: He('fetchStart', 'domComplete', t),
					load_event: He('loadEventStart', 'loadEventEnd', t),
					first_paint: He('fetchStart', 'firstPaint', t),
					first_contentful_paint: He(
						'fetchStart',
						'firstContentfulPaint',
						t,
					),
					domain_lookup: He(
						'domainLookupStart',
						'domainLookupEnd',
						t,
					),
					connect: He('connectStart', 'connectEnd', t),
					request: He('requestStart', 'requestEnd', t),
					response: He('responseStart', 'responseEnd', t),
				}
			Object.entries(n).forEach(([i, s]) => {
				s > 0 &&
					(r.setAttribute(`timings.${i}.ns`, s),
					r.setAttribute(`timings.${i}.readable`, _u(s)))
			})
		}
	function He(r, e, t) {
		const n = t.find((l) => l.name === r),
			i = t.find((l) => l.name === e)
		if (!n || !i) return 0
		const s = n.time[0] * 1e9 + n.time[1]
		return i.time[0] * 1e9 + i.time[1] - s
	}
	const zS = (r, e) => {
			const t = {
				domain_lookup: (e.domainLookupEnd - e.domainLookupStart) * 1e6,
				connect: (e.connectEnd - e.connectStart) * 1e6,
				request: (e.responseEnd - e.requestStart) * 1e6,
				response: (e.responseEnd - e.responseStart) * 1e6,
			}
			Object.entries(t).forEach(([n, i]) => {
				i > 0 &&
					(r.setAttribute(`timings.${n}.ns`, i),
					r.setAttribute(`timings.${n}.readable`, _u(i)))
			})
		},
		_u = (r) => {
			if (r >= 36e11) {
				const o = r / 36e11
				return `${Number(o.toFixed(1))}h`
			} else if (r >= 6e10) {
				const o = r / 6e10
				return `${Number(o.toFixed(1))}m`
			} else if (r >= 1e9) {
				const o = r / 1e9
				return `${Number(o.toFixed(1))}s`
			} else if (r >= 1e6) {
				const o = r / 1e6
				return `${Number(o.toFixed(1))}ms`
			} else if (r >= 1e3) {
				const o = r / 1e3
				return `${Number(o.toFixed(1))}µs`
			} else return `${Number(r.toFixed(1))}ns`
		},
		DS = [
			'assert',
			'count',
			'countReset',
			'debug',
			'dir',
			'dirxml',
			'error',
			'group',
			'groupCollapsed',
			'groupEnd',
			'info',
			'log',
			'table',
			'time',
			'timeEnd',
			'timeLog',
			'trace',
			'warn',
		]
	var It
	;(function (r) {
		;(r.DeviceMemory = 'DeviceMemory'),
			(r.ViewportHeight = 'ViewportHeight'),
			(r.ViewportWidth = 'ViewportWidth'),
			(r.ScreenHeight = 'ScreenHeight'),
			(r.ScreenWidth = 'ScreenWidth'),
			(r.ViewportArea = 'ViewportArea')
	})(It || (It = {}))
	var Xe
	;(function (r) {
		;(r.Device = 'Device'),
			(r.WebVital = 'WebVital'),
			(r.Performance = 'Performance'),
			(r.Frontend = 'Frontend'),
			(r.Backend = 'Backend')
	})(Xe || (Xe = {}))
	const jS = (r, e, t) => {
			const n = window._highlightWebSocketRequestCallback
			window._highlightWebSocketRequestCallback = r
			const i = window._highlightWebSocketEventCallback
			return (
				(window._highlightWebSocketEventCallback = (s) => {
					const d = s,
						{ message: o, size: l } = d,
						a = Ve(d, ['message', 'size']),
						u = t.some((h) => s.name.toLowerCase().includes(h))
							? a
							: s
					e(u)
				}),
				() => {
					;(window._highlightWebSocketRequestCallback = n),
						(window._highlightWebSocketEventCallback = i)
				}
			)
		},
		QS = ({
			xhrCallback: r,
			fetchCallback: e,
			webSocketRequestCallback: t,
			webSocketEventCallback: n,
			disableWebSocketRecording: i,
			bodyKeysToRedact: s,
			highlightEndpoints: o,
			tracingOrigins: l,
			urlBlocklist: a,
			bodyKeysToRecord: c,
			otelEnabled: u,
		}) => {
			const d = M0(r, o, l, a, s, c, u),
				h = F0(e, o, l, a, s, c, u),
				p = i ? () => {} : jS(t, n, a)
			return () => {
				d(), h(), p()
			}
		}
	class et {
		constructor(e) {
			C(this, 'disableConsoleRecording')
			C(this, 'reportConsoleErrors')
			C(this, 'enablePromisePatch')
			C(this, 'consoleMethodsToRecord')
			C(this, 'listeners')
			C(this, 'errors')
			C(this, 'messages')
			C(this, 'options')
			C(this, 'hasNetworkRecording', !0)
			C(this, 'disableNetworkRecording')
			C(this, 'enableRecordingNetworkContents')
			C(this, 'xhrNetworkContents')
			C(this, 'fetchNetworkContents')
			C(this, 'disableRecordingWebSocketContents')
			C(this, 'webSocketNetworkContents')
			C(this, 'webSocketEventContents')
			C(this, 'tracingOrigins')
			C(this, 'networkHeadersToRedact')
			C(this, 'networkBodyKeysToRedact')
			C(this, 'networkBodyKeysToRecord')
			C(this, 'networkHeaderKeysToRecord')
			C(this, 'lastNetworkRequestTimestamp')
			C(this, 'urlBlocklist')
			C(this, 'highlightEndpoints')
			C(this, 'requestResponseSanitizer')
			var t, n
			;(this.options = e),
				(this.disableConsoleRecording = !!e.disableConsoleRecording),
				(this.reportConsoleErrors =
					(t = e.reportConsoleErrors) != null ? t : !1),
				(this.enablePromisePatch =
					(n = e.enablePromisePatch) != null ? n : !0),
				(this.consoleMethodsToRecord = e.consoleMethodsToRecord || [
					...DS,
				]),
				(this.listeners = []),
				(this.errors = []),
				(this.messages = []),
				(this.lastNetworkRequestTimestamp = 0)
		}
		isListening() {
			return this.listeners.length > 0
		}
		startListening() {
			if (this.isListening()) return
			const e = this
			this.disableConsoleRecording ||
				this.listeners.push(
					Uf(
						(t) => {
							var n, i, s
							if (
								this.reportConsoleErrors &&
								(t.type === 'Error' || t.type === 'error') &&
								t.value &&
								t.trace
							) {
								const o = Lt(t.value)
								if (
									Wl.includes(o) ||
									_l.some((l) => o.includes(l))
								)
									return
								e.errors.push({
									event: o,
									type: 'console.error',
									url: window.location.href,
									source:
										(n = t.trace[0]) != null && n.fileName
											? t.trace[0].fileName
											: '',
									lineNumber:
										(i = t.trace[0]) != null && i.lineNumber
											? t.trace[0].lineNumber
											: 0,
									columnNumber:
										(s = t.trace[0]) != null &&
										s.columnNumber
											? t.trace[0].columnNumber
											: 0,
									stackTrace: t.trace,
									timestamp: new Date().toISOString(),
								})
							}
							e.messages.push(t)
						},
						{
							level: this.consoleMethodsToRecord,
							logger: 'console',
							stringifyOptions: {
								depthOfLimit: 10,
								numOfKeysLimit: 100,
								stringLengthLimit: 1e3,
							},
						},
					),
				),
				this.listeners.push(
					Mf(
						(t) => {
							Wl.includes(t.event) ||
								_l.some((n) => t.event.includes(n)) ||
								e.errors.push(t)
						},
						{ enablePromisePatch: this.enablePromisePatch },
					),
				),
				this.options.enableOtelTracing && this.listeners.push(KS),
				et.setupNetworkListener(this, this.options)
		}
		stopListening() {
			this.listeners.forEach((e) => e()), (this.listeners = [])
		}
		static setupNetworkListener(e, t) {
			var s, o, l, a, c, u, d, h, p, y, f, m
			const n =
					(t == null ? void 0 : t.backendUrl) ||
					void 0 ||
					'https://pub.highlight.run',
				i = t.otlpEndpoint || 'https://otel.highlight.io'
			;(e.highlightEndpoints = [n, i]),
				(e.xhrNetworkContents = []),
				(e.fetchNetworkContents = []),
				(e.webSocketNetworkContents = []),
				(e.webSocketEventContents = []),
				(e.networkHeadersToRedact = []),
				(e.urlBlocklist = []),
				(e.tracingOrigins = t.tracingOrigins || []),
				(t == null ? void 0 : t.disableNetworkRecording) !== void 0
					? ((e.disableNetworkRecording =
							t == null ? void 0 : t.disableNetworkRecording),
						(e.enableRecordingNetworkContents = !1),
						(e.disableRecordingWebSocketContents = !0),
						(e.networkHeadersToRedact = []),
						(e.networkBodyKeysToRedact = []),
						(e.urlBlocklist = []),
						(e.networkBodyKeysToRecord = []))
					: typeof (t == null ? void 0 : t.networkRecording) ==
						  'boolean'
						? ((e.disableNetworkRecording = !t.networkRecording),
							(e.enableRecordingNetworkContents = !1),
							(e.disableRecordingWebSocketContents = !0),
							(e.networkHeadersToRedact = []),
							(e.networkBodyKeysToRedact = []),
							(e.urlBlocklist = []))
						: (((s = t.networkRecording) == null
								? void 0
								: s.enabled) !== void 0
								? (e.disableNetworkRecording =
										!t.networkRecording.enabled)
								: (e.disableNetworkRecording = !1),
							(e.enableRecordingNetworkContents =
								((o = t.networkRecording) == null
									? void 0
									: o.recordHeadersAndBody) || !1),
							(e.disableRecordingWebSocketContents =
								((l = t.networkRecording) == null
									? void 0
									: l.disableWebSocketEventRecordings) || !1),
							(e.networkHeadersToRedact =
								((c =
									(a = t.networkRecording) == null
										? void 0
										: a.networkHeadersToRedact) == null
									? void 0
									: c.map((g) => g.toLowerCase())) || []),
							(e.networkBodyKeysToRedact =
								((d =
									(u = t.networkRecording) == null
										? void 0
										: u.networkBodyKeysToRedact) == null
									? void 0
									: d.map((g) => g.toLowerCase())) || []),
							(e.urlBlocklist =
								((p =
									(h = t.networkRecording) == null
										? void 0
										: h.urlBlocklist) == null
									? void 0
									: p.map((g) => g.toLowerCase())) || []),
							(e.urlBlocklist = [...e.urlBlocklist, ...hu]),
							(e.requestResponseSanitizer =
								(y = t.networkRecording) == null
									? void 0
									: y.requestResponseSanitizer),
							(e.networkHeaderKeysToRecord =
								(f = t.networkRecording) == null
									? void 0
									: f.headerKeysToRecord),
							e.networkHeaderKeysToRecord &&
								((e.networkHeadersToRedact = []),
								(e.networkHeaderKeysToRecord =
									e.networkHeaderKeysToRecord.map((g) =>
										g.toLocaleLowerCase(),
									))),
							(e.networkBodyKeysToRecord =
								(m = t.networkRecording) == null
									? void 0
									: m.bodyKeysToRecord),
							e.networkBodyKeysToRecord &&
								((e.networkBodyKeysToRedact = []),
								(e.networkBodyKeysToRecord =
									e.networkBodyKeysToRecord.map((g) =>
										g.toLocaleLowerCase(),
									)))),
				!e.disableNetworkRecording &&
					e.enableRecordingNetworkContents &&
					e.listeners.push(
						QS({
							xhrCallback: (g) => {
								e.xhrNetworkContents.push(g)
							},
							fetchCallback: (g) => {
								e.fetchNetworkContents.push(g)
							},
							webSocketRequestCallback: (g) => {
								e.webSocketNetworkContents &&
									e.webSocketNetworkContents.push(g)
							},
							webSocketEventCallback: (g) => {
								e.webSocketEventContents.push(g)
							},
							disableWebSocketRecording:
								e.disableRecordingWebSocketContents,
							bodyKeysToRedact: e.networkBodyKeysToRedact,
							highlightEndpoints: e.highlightEndpoints,
							tracingOrigins: e.tracingOrigins,
							urlBlocklist: e.urlBlocklist,
							bodyKeysToRecord: e.networkBodyKeysToRecord,
							otelEnabled: !!t.enableOtelTracing,
						}),
					)
		}
		static getRecordedNetworkResources(e, t) {
			var s, o
			let n = [],
				i = []
			if (!e.disableNetworkRecording) {
				const l =
					((s = window == null ? void 0 : window.performance) == null
						? void 0
						: s.timeOrigin) || 0
				n = performance.getEntriesByType('resource')
				const a = (t - l) * 2
				if (
					((n = n
						.filter((c) =>
							c.responseEnd < e.lastNetworkRequestTimestamp
								? !1
								: qn(
										c.name,
										e.highlightEndpoints,
										e.tracingOrigins,
									),
						)
						.map((c) =>
							q(Z({}, c.toJSON()), {
								offsetStartTime: c.startTime - a,
								offsetResponseEnd: c.responseEnd - a,
								offsetFetchStart: c.fetchStart - a,
							}),
						)),
					(e.lastNetworkRequestTimestamp =
						((o = n.at(-1)) == null ? void 0 : o.responseEnd) ||
						e.lastNetworkRequestTimestamp),
					e.enableRecordingNetworkContents)
				) {
					const c = {
						headersToRedact: e.networkHeadersToRedact,
						headersToRecord: e.networkHeaderKeysToRecord,
						requestResponseSanitizer: e.requestResponseSanitizer,
					}
					;(n = mu(n, e.xhrNetworkContents, 'xmlhttprequest', c)),
						(n = mu(n, e.fetchNetworkContents, 'fetch', c))
				}
			}
			return (
				e.disableRecordingWebSocketContents ||
					(i = e.webSocketNetworkContents || []),
				[...n, ...i]
			)
		}
		static getRecordedWebSocketEvents(e) {
			let t = []
			return (
				!e.disableNetworkRecording &&
					!e.disableRecordingWebSocketContents &&
					(t = e.webSocketEventContents),
				t
			)
		}
		static clearRecordedNetworkResources(e) {
			e.disableNetworkRecording ||
				((e.xhrNetworkContents = []),
				(e.fetchNetworkContents = []),
				(e.webSocketNetworkContents = []),
				(e.webSocketEventContents = []),
				performance.clearResourceTimings())
		}
	}
	const Yr = () => {
			var s
			const e =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
			var t = ''
			const n =
					typeof window != 'undefined' &&
					((s = window.crypto) == null ? void 0 : s.getRandomValues),
				i = new Uint32Array(28)
			n && window.crypto.getRandomValues(i)
			for (let o = 0; o < 28; o++)
				n
					? (t += e.charAt(i[o] % e.length))
					: (t += e.charAt(Math.floor(Math.random() * e.length)))
			return t
		},
		$S = '9.5.0',
		qS = () => {
			var r, e
			typeof chrome != 'undefined' &&
				(r = chrome == null ? void 0 : chrome.runtime) != null &&
				r.onMessage &&
				((e = chrome == null ? void 0 : chrome.runtime) == null ||
					e.onMessage.addListener((t, n, i) => {
						const s = t.action
						switch (
							(console.log(
								`[highlight] received '${s}' event from extension.`,
							),
							s)
						) {
							case 'init': {
								he.init(1, { debug: !0 }),
									he.getSessionURL().then((o) => {
										i({ url: o })
									})
								break
							}
							case 'stop': {
								he.stop(), i({ success: !0 })
								break
							}
						}
						return !0
					}))
		}
	function ev(r) {
		var e
		r.on &&
			(e = r.webContents) != null &&
			e.send &&
			(r.on('focus', () => {
				r.webContents.send('highlight.run', { visible: !0 })
			}),
			r.on('blur', () => {
				r.webContents.send('highlight.run', { visible: !1 })
			}),
			r.on('close', () => {
				r.webContents.send('highlight.run', { visible: !1 })
			}))
	}
	const tv = ({ next: r, payload: e }) => {
			if (
				typeof window != 'undefined' &&
				typeof document != 'undefined' &&
				'H' in window
			) {
				if (e.obj.type === 'track') {
					const t = e.obj.event,
						n = e.obj.properties
					window.H.track(t, n)
				} else if (e.obj.type === 'identify') {
					const t = e.obj.userId
					if (t != null && t.length) {
						const n = e.obj.traits
						window.H.identify(t, n)
					}
				}
			}
			r(e)
		},
		Eo = () => {
			if (typeof window != 'undefined') {
				if (typeof window._highlightFetchPatch != 'undefined') return
				;(window._originalFetch = window.fetch),
					(window._fetchProxy = (r, e) =>
						window._originalFetch(r, e)),
					(window._highlightFetchPatch = (r, e) =>
						window._fetchProxy.call(window || global, r, e)),
					(window.fetch = window._highlightFetchPatch)
			}
		},
		xu = () => null,
		Co = () => {
			if (typeof window != 'undefined') {
				if (
					typeof window._highlightWebSocketRequestCallback !=
					'undefined'
				)
					return
				;(window._highlightWebSocketRequestCallback = xu),
					(window._highlightWebSocketEventCallback = xu)
				const r = new Proxy(window.WebSocket, {
					construct(e, t) {
						const [, n] = To(),
							i = new e(...t),
							s = (u) => {
								window._highlightWebSocketRequestCallback({
									socketId: n,
									initiatorType: 'websocket',
									type: 'open',
									name: i.url,
									startTimeAbs:
										performance.timeOrigin + u.timeStamp,
								})
							},
							o = (u) => {
								window._highlightWebSocketRequestCallback({
									socketId: n,
									initiatorType: 'websocket',
									type: 'close',
									name: i.url,
									responseEndAbs:
										performance.timeOrigin + u.timeStamp,
								}),
									i.removeEventListener('open', s),
									i.removeEventListener('error', a),
									i.removeEventListener('message', l),
									i.removeEventListener('close', o)
							},
							l = (u) => {
								const { data: d } = u,
									h = typeof d == 'string' ? u.data : void 0
								let p
								typeof d == 'string'
									? (p = d.length)
									: d instanceof Blob
										? (p = d.size)
										: (p = d.byteLength || 0),
									window._highlightWebSocketEventCallback({
										socketId: n,
										type: 'received',
										name: i.url,
										timeStamp:
											performance.timeOrigin +
											u.timeStamp,
										size: p,
										message: h,
									})
							},
							a = (u) => {
								window._highlightWebSocketEventCallback({
									socketId: n,
									type: 'error',
									name: i.url,
									timeStamp:
										performance.timeOrigin + u.timeStamp,
									size: 0,
								})
							}
						i.addEventListener('open', s),
							i.addEventListener('error', a),
							i.addEventListener('message', l),
							i.addEventListener('close', o)
						const c = new Proxy(i.send, {
							apply: function (u, d, h) {
								const p = h[0],
									y = typeof p == 'string' ? p : void 0
								let f
								typeof p == 'string'
									? (f = p.length)
									: p instanceof Blob
										? (f = p.size)
										: (f = p.byteLength || 0),
									window._highlightWebSocketEventCallback({
										socketId: n,
										type: 'sent',
										name: i.url,
										timeStamp:
											performance.timeOrigin +
											performance.now(),
										size: f,
										message: y,
									}),
									u.apply(d, h)
							},
						})
						return (i.send = c), i
					},
				})
				window.WebSocket = r
			}
		},
		Ou = () => {
			const r = {
				end: () => {},
				spanContext: () => ({ traceId: '', spanId: '', traceFlags: 0 }),
				setAttribute: (e, t) => r,
				setAttributes: (e) => r,
				addEvent: (e, t, n) => r,
				addLinks: (e) => r,
				setStatus: (e) => r,
				recordException: () => {},
				addLink: () => r,
				updateName: () => r,
				isRecording: () => !1,
			}
			return r
		}
	;(O.MetricCategory = void 0),
		(function (r) {
			;(r.Device = 'Device'),
				(r.WebVital = 'WebVital'),
				(r.Frontend = 'Frontend'),
				(r.Backend = 'Backend')
		})(O.MetricCategory || (O.MetricCategory = {}))
	const ft = (r, e) => {
			console.warn(`highlight.run warning: (${r}): `, e)
		},
		rv = 200
	let ri = [],
		Go,
		Ke,
		ee,
		ni,
		Vo = !1,
		Fr
	const he = {
		options: void 0,
		init: (r, e) => {
			var t, n, i, s, o, l, a, c
			try {
				if (
					((he.options = e),
					typeof window == 'undefined' ||
						typeof document == 'undefined')
				)
					return
				if (!r) {
					console.info(
						'Highlight is not initializing because projectID was passed undefined.',
					)
					return
				}
				e != null && e.skipCookieSessionDataLoad ? au(!1) : O0()
				let u = rr()
				if (
					((Ke = Yr()),
					u != null && u.sessionSecureID && (Ke = u.sessionSecureID),
					Vo)
				)
					return { sessionSecureID: Ke }
				;(Vo = !0),
					Eo(),
					Co(),
					Promise.resolve()
						.then(() => nC)
						.then((f) =>
							z(
								this,
								[f],
								function* ({
									Highlight: h,
									setupBrowserTracing: p,
									getTracer: y,
								}) {
									var m, g, v
									e != null &&
										e.enableOtelTracing &&
										(p({
											otlpEndpoint:
												(m =
													e == null
														? void 0
														: e.otlpEndpoint) !=
												null
													? m
													: 'https://otel.highlight.io',
											projectId: r,
											sessionSecureId: Ke,
											environment:
												(g =
													e == null
														? void 0
														: e.environment) != null
													? g
													: 'production',
											networkRecordingOptions:
												typeof (e == null
													? void 0
													: e.networkRecording) ==
												'object'
													? e.networkRecording
													: void 0,
											tracingOrigins:
												e == null
													? void 0
													: e.tracingOrigins,
											serviceName:
												(v =
													e == null
														? void 0
														: e.serviceName) != null
													? v
													: 'highlight-browser',
										}),
										(Fr = y)),
										(ee = new h(d, ni)),
										Eo(),
										Co(),
										(e != null && e.manualStart) ||
											(yield ee.initialize())
								},
							),
						)
				const d = q(Z({}, e), {
					organizationID: r,
					firstloadVersion: $S,
					environment:
						(e == null ? void 0 : e.environment) || 'production',
					appVersion: e == null ? void 0 : e.version,
					sessionSecureID: Ke,
				})
				return (
					(ni = new et(d)),
					(e != null && e.manualStart) || ni.startListening(),
					!(
						(n =
							(t = e == null ? void 0 : e.integrations) == null
								? void 0
								: t.mixpanel) != null && n.disabled
					) &&
						(s =
							(i = e == null ? void 0 : e.integrations) == null
								? void 0
								: i.mixpanel) != null &&
						s.projectToken &&
						ye(e.integrations.mixpanel),
					!(
						(l =
							(o = e == null ? void 0 : e.integrations) == null
								? void 0
								: o.amplitude) != null && l.disabled
					) &&
						(c =
							(a = e == null ? void 0 : e.integrations) == null
								? void 0
								: a.amplitude) != null &&
						c.apiKey &&
						ne(e.integrations.amplitude),
					{ sessionSecureID: Ke }
				)
			} catch (u) {
				ft('init', u)
			}
		},
		snapshot: (r) =>
			z(this, null, function* () {
				try {
					if (ee && ee.ready) return yield ee.snapshot(r)
				} catch (e) {
					ft('snapshot', e)
				}
			}),
		addSessionFeedback: ({
			verbatim: r,
			userName: e,
			userEmail: t,
			timestampOverride: n,
		}) => {
			try {
				he.onHighlightReady(() =>
					ee.addSessionFeedback({
						verbatim: r,
						timestamp: n || new Date().toISOString(),
						user_email: t,
						user_name: e,
					}),
				)
			} catch (i) {
				ft('error', i)
			}
		},
		consumeError: (r, e, t) => {
			try {
				he.onHighlightReady(() =>
					ee.consumeCustomError(r, e, JSON.stringify(t)),
				)
			} catch (n) {
				ft('error', n)
			}
		},
		consume: (r, e) => {
			try {
				he.onHighlightReady(() => ee.consumeError(r, e))
			} catch (t) {
				ft('error', t)
			}
		},
		error: (r, e) => {
			try {
				he.onHighlightReady(() =>
					ee.pushCustomError(r, JSON.stringify(e)),
				)
			} catch (t) {
				ft('error', t)
			}
		},
		track: (r, e = {}) => {
			var t, n, i, s, o, l, a, c, u, d, h
			try {
				he.onHighlightReady(() =>
					ee.addProperties(q(Z({}, e), { event: r })),
				)
				const p = ee == null ? void 0 : ee.getCurrentSessionURL()
				;((i =
					(n = (t = he.options) == null ? void 0 : t.integrations) ==
					null
						? void 0
						: n.mixpanel) != null &&
					i.disabled) ||
					((s = window.mixpanel) != null &&
						s.track &&
						window.mixpanel.track(
							r,
							q(Z({}, e), { highlightSessionURL: p }),
						)),
					((a =
						(l =
							(o = he.options) == null
								? void 0
								: o.integrations) == null
							? void 0
							: l.amplitude) != null &&
						a.disabled) ||
						((c = window.amplitude) != null &&
							c.getInstance &&
							window.amplitude
								.getInstance()
								.logEvent(
									r,
									q(Z({}, e), { highlightSessionURL: p }),
								)),
					((h =
						(d =
							(u = he.options) == null
								? void 0
								: u.integrations) == null
							? void 0
							: d.intercom) != null &&
						h.disabled) ||
						(window.Intercom && window.Intercom('trackEvent', r, e))
			} catch (p) {
				ft('track', p)
			}
		},
		start: (r) => {
			;(ee == null ? void 0 : ee.state) === 'Recording' &&
			!(r != null && r.forceNew)
				? (r != null && r.silent) ||
					console.warn(
						'Highlight is already recording. Please `H.stop()` the current session before starting a new one.',
					)
				: (ni.startListening(),
					he.onHighlightReady(
						() =>
							z(this, null, function* () {
								yield ee.initialize(r)
							}),
						{ waitForReady: !1 },
					))
		},
		stop: (r) => {
			;(ee == null ? void 0 : ee.state) !== 'Recording'
				? (r != null && r.silent) ||
					console.warn(
						'Highlight is already stopped. Please call `H.start()`.',
					)
				: he.onHighlightReady(() => ee.stopRecording(!0))
		},
		identify: (r, e = {}) => {
			var t, n, i, s, o, l, a, c
			try {
				he.onHighlightReady(() => ee.identify(r, e))
			} catch (u) {
				ft('identify', u)
			}
			if (
				(((i =
					(n = (t = he.options) == null ? void 0 : t.integrations) ==
					null
						? void 0
						: n.mixpanel) != null &&
					i.disabled) ||
					((s = window.mixpanel) != null &&
						s.identify &&
						(window.mixpanel.identify(
							typeof (e == null ? void 0 : e.email) == 'string'
								? e == null
									? void 0
									: e.email
								: r,
						),
						e &&
							(window.mixpanel.track('identify', e),
							window.mixpanel.people.set(e)))),
				!(
					(a =
						(l =
							(o = he.options) == null
								? void 0
								: o.integrations) == null
							? void 0
							: l.amplitude) != null && a.disabled
				) &&
					(c = window.amplitude) != null &&
					c.getInstance &&
					(window.amplitude.getInstance().setUserId(r),
					Object.keys(e).length > 0))
			) {
				const u = Object.keys(e).reduce(
					(d, h) => (d.set(h, e[h]), d),
					new window.amplitude.Identify(),
				)
				window.amplitude.getInstance().identify(u)
			}
		},
		metrics: (r) => {
			try {
				he.onHighlightReady(() =>
					ee.recordMetric(
						r.map((e) =>
							q(Z({}, e), {
								category: O.MetricCategory.Frontend,
							}),
						),
					),
				)
			} catch (e) {
				ft('metrics', e)
			}
		},
		startSpan: (r, e, t, n) => {
			const i = typeof Fr == 'function' ? Fr() : void 0
			if (!i) {
				const o = Ou()
				return n === void 0 && t === void 0
					? e(o)
					: n === void 0
						? t(o)
						: n(o)
			}
			const s = (o, l) => {
				const a = l(o)
				return a instanceof Promise
					? a.finally(() => o.end())
					: (o.end(), a)
			}
			return n === void 0 && t === void 0
				? i.startActiveSpan(r, (o) => s(o, e))
				: n === void 0
					? i.startActiveSpan(r, e, (o) => s(o, t))
					: i.startActiveSpan(r, e, t, (o) => s(o, n))
		},
		startManualSpan: (r, e, t, n) => {
			const i = typeof Fr == 'function' ? Fr() : void 0
			if (!i) {
				const s = Ou()
				return n === void 0 && t === void 0
					? e(s)
					: n === void 0
						? t(s)
						: n(s)
			}
			return n === void 0 && t === void 0
				? i.startActiveSpan(r, e)
				: n === void 0
					? i.startActiveSpan(r, e, t)
					: i.startActiveSpan(r, e, t, n)
		},
		getSessionURL: () =>
			z(this, null, function* () {
				const r = rr(Ke)
				if (r) return `https://${vs}/${r.projectID}/sessions/${Ke}`
				throw new Error(`Unable to get session URL: ${Ke}}`)
			}),
		getSessionDetails: () =>
			z(this, null, function* () {
				const r = yield he.getSessionURL(),
					e = rr(Ke)
				if (!r) throw new Error('Could not get session URL')
				const t = e == null ? void 0 : e.sessionStartTime
				if (!t) throw new Error('Could not get session start timestamp')
				const n = new Date().getTime(),
					i = new URL(r),
					s = new URL(r)
				return (
					s.searchParams.set('ts', ((n - t) / 1e3).toString()),
					{
						url: i.toString(),
						urlWithTimestamp: s.toString(),
						sessionSecureID: Ke,
					}
				)
			}),
		getRecordingState: () => {
			var r
			return (r = ee == null ? void 0 : ee.state) != null
				? r
				: 'NotRecording'
		},
		onHighlightReady: (r, e) => {
			if ((ri.push({ options: e, func: r }), Go === void 0)) {
				const t = () => {
					var i
					const n = []
					for (const s of ri)
						ee &&
						(((i = s.options) == null ? void 0 : i.waitForReady) ===
							!1 ||
							ee.ready)
							? s.func()
							: n.push(s)
					;(ri = n),
						(Go = void 0),
						ri.length > 0 && (Go = setTimeout(t, rv))
				}
				t()
			}
		},
	}
	typeof window != 'undefined' && (window.H = he), qS(), Eo(), Co()
	const nv = {
			reset: () => {
				Vo = !1
			},
		},
		ku = { key: '_sid' },
		iv = 'rrweb/sequential-id@1',
		sv = (r) => {
			const e = r ? Object.assign({}, ku, r) : ku
			let t = 0
			return {
				name: iv,
				eventProcessor(n) {
					return Object.assign(n, { [e.key]: ++t }), n
				},
				options: e,
			}
		},
		No = JSON,
		ov = (r) => r.toUpperCase(),
		av = (r) => {
			const e = {}
			return (
				r.forEach((t, n) => {
					e[n] = t
				}),
				e
			)
		},
		lv = (r, e, t) =>
			r.document
				? r
				: {
						document: r,
						variables: e,
						requestHeaders: t,
						signal: void 0,
					},
		cv = (r, e, t) =>
			r.query
				? r
				: { query: r, variables: e, requestHeaders: t, signal: void 0 },
		uv = (r, e) =>
			r.documents
				? r
				: { documents: r, requestHeaders: e, signal: void 0 },
		Pu = (r) => {
			var n, i
			let e
			const t = r.definitions.filter(
				(s) => s.kind === 'OperationDefinition',
			)
			return (
				t.length === 1 &&
					(e =
						(i = (n = t[0]) == null ? void 0 : n.name) == null
							? void 0
							: i.value),
				e
			)
		},
		Lo = (r) => {
			if (typeof r == 'string') {
				let t
				try {
					const n = bo(r)
					t = Pu(n)
				} catch (n) {}
				return { query: r, operationName: t }
			}
			const e = Pu(r)
			return { query: su(r), operationName: e }
		}
	class ir extends Error {
		constructor(e, t) {
			const n = `${ir.extractMessage(e)}: ${JSON.stringify({ response: e, request: t })}`
			super(n),
				Object.setPrototypeOf(this, ir.prototype),
				(this.response = e),
				(this.request = t),
				typeof Error.captureStackTrace == 'function' &&
					Error.captureStackTrace(this, ir)
		}
		static extractMessage(e) {
			var t, n, i
			return (i =
				(n = (t = e.errors) == null ? void 0 : t[0]) == null
					? void 0
					: n.message) != null
				? i
				: `GraphQL Error (Code: ${e.status})`
		}
	}
	var Xo = { exports: {} }
	;(function (r, e) {
		var t = typeof self != 'undefined' ? self : Rs,
			n = (function () {
				function s() {
					;(this.fetch = !1), (this.DOMException = t.DOMException)
				}
				return (s.prototype = t), new s()
			})()
		;(function (s) {
			;(function (o) {
				var l = {
					searchParams: 'URLSearchParams' in s,
					iterable: 'Symbol' in s && 'iterator' in Symbol,
					blob:
						'FileReader' in s &&
						'Blob' in s &&
						(function () {
							try {
								return new Blob(), !0
							} catch (b) {
								return !1
							}
						})(),
					formData: 'FormData' in s,
					arrayBuffer: 'ArrayBuffer' in s,
				}
				function a(b) {
					return b && DataView.prototype.isPrototypeOf(b)
				}
				if (l.arrayBuffer)
					var c = [
							'[object Int8Array]',
							'[object Uint8Array]',
							'[object Uint8ClampedArray]',
							'[object Int16Array]',
							'[object Uint16Array]',
							'[object Int32Array]',
							'[object Uint32Array]',
							'[object Float32Array]',
							'[object Float64Array]',
						],
						u =
							ArrayBuffer.isView ||
							function (b) {
								return (
									b &&
									c.indexOf(
										Object.prototype.toString.call(b),
									) > -1
								)
							}
				function d(b) {
					if (
						(typeof b != 'string' && (b = String(b)),
						/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(b))
					)
						throw new TypeError(
							'Invalid character in header field name',
						)
					return b.toLowerCase()
				}
				function h(b) {
					return typeof b != 'string' && (b = String(b)), b
				}
				function p(b) {
					var T = {
						next: function () {
							var x = b.shift()
							return { done: x === void 0, value: x }
						},
					}
					return (
						l.iterable &&
							(T[Symbol.iterator] = function () {
								return T
							}),
						T
					)
				}
				function y(b) {
					;(this.map = {}),
						b instanceof y
							? b.forEach(function (T, x) {
									this.append(x, T)
								}, this)
							: Array.isArray(b)
								? b.forEach(function (T) {
										this.append(T[0], T[1])
									}, this)
								: b &&
									Object.getOwnPropertyNames(b).forEach(
										function (T) {
											this.append(T, b[T])
										},
										this,
									)
				}
				;(y.prototype.append = function (b, T) {
					;(b = d(b)), (T = h(T))
					var x = this.map[b]
					this.map[b] = x ? x + ', ' + T : T
				}),
					(y.prototype.delete = function (b) {
						delete this.map[d(b)]
					}),
					(y.prototype.get = function (b) {
						return (b = d(b)), this.has(b) ? this.map[b] : null
					}),
					(y.prototype.has = function (b) {
						return this.map.hasOwnProperty(d(b))
					}),
					(y.prototype.set = function (b, T) {
						this.map[d(b)] = h(T)
					}),
					(y.prototype.forEach = function (b, T) {
						for (var x in this.map)
							this.map.hasOwnProperty(x) &&
								b.call(T, this.map[x], x, this)
					}),
					(y.prototype.keys = function () {
						var b = []
						return (
							this.forEach(function (T, x) {
								b.push(x)
							}),
							p(b)
						)
					}),
					(y.prototype.values = function () {
						var b = []
						return (
							this.forEach(function (T) {
								b.push(T)
							}),
							p(b)
						)
					}),
					(y.prototype.entries = function () {
						var b = []
						return (
							this.forEach(function (T, x) {
								b.push([x, T])
							}),
							p(b)
						)
					}),
					l.iterable &&
						(y.prototype[Symbol.iterator] = y.prototype.entries)
				function f(b) {
					if (b.bodyUsed)
						return Promise.reject(new TypeError('Already read'))
					b.bodyUsed = !0
				}
				function m(b) {
					return new Promise(function (T, x) {
						;(b.onload = function () {
							T(b.result)
						}),
							(b.onerror = function () {
								x(b.error)
							})
					})
				}
				function g(b) {
					var T = new FileReader(),
						x = m(T)
					return T.readAsArrayBuffer(b), x
				}
				function v(b) {
					var T = new FileReader(),
						x = m(T)
					return T.readAsText(b), x
				}
				function S(b) {
					for (
						var T = new Uint8Array(b),
							x = new Array(T.length),
							ie = 0;
						ie < T.length;
						ie++
					)
						x[ie] = String.fromCharCode(T[ie])
					return x.join('')
				}
				function I(b) {
					if (b.slice) return b.slice(0)
					var T = new Uint8Array(b.byteLength)
					return T.set(new Uint8Array(b)), T.buffer
				}
				function G() {
					return (
						(this.bodyUsed = !1),
						(this._initBody = function (b) {
							;(this._bodyInit = b),
								b
									? typeof b == 'string'
										? (this._bodyText = b)
										: l.blob &&
											  Blob.prototype.isPrototypeOf(b)
											? (this._bodyBlob = b)
											: l.formData &&
												  FormData.prototype.isPrototypeOf(
														b,
												  )
												? (this._bodyFormData = b)
												: l.searchParams &&
													  URLSearchParams.prototype.isPrototypeOf(
															b,
													  )
													? (this._bodyText =
															b.toString())
													: l.arrayBuffer &&
														  l.blob &&
														  a(b)
														? ((this._bodyArrayBuffer =
																I(b.buffer)),
															(this._bodyInit =
																new Blob([
																	this
																		._bodyArrayBuffer,
																])))
														: l.arrayBuffer &&
															  (ArrayBuffer.prototype.isPrototypeOf(
																	b,
															  ) ||
																	u(b))
															? (this._bodyArrayBuffer =
																	I(b))
															: (this._bodyText =
																	b =
																		Object.prototype.toString.call(
																			b,
																		))
									: (this._bodyText = ''),
								this.headers.get('content-type') ||
									(typeof b == 'string'
										? this.headers.set(
												'content-type',
												'text/plain;charset=UTF-8',
											)
										: this._bodyBlob && this._bodyBlob.type
											? this.headers.set(
													'content-type',
													this._bodyBlob.type,
												)
											: l.searchParams &&
												URLSearchParams.prototype.isPrototypeOf(
													b,
												) &&
												this.headers.set(
													'content-type',
													'application/x-www-form-urlencoded;charset=UTF-8',
												))
						}),
						l.blob &&
							((this.blob = function () {
								var b = f(this)
								if (b) return b
								if (this._bodyBlob)
									return Promise.resolve(this._bodyBlob)
								if (this._bodyArrayBuffer)
									return Promise.resolve(
										new Blob([this._bodyArrayBuffer]),
									)
								if (this._bodyFormData)
									throw new Error(
										'could not read FormData body as blob',
									)
								return Promise.resolve(
									new Blob([this._bodyText]),
								)
							}),
							(this.arrayBuffer = function () {
								return this._bodyArrayBuffer
									? f(this) ||
											Promise.resolve(
												this._bodyArrayBuffer,
											)
									: this.blob().then(g)
							})),
						(this.text = function () {
							var b = f(this)
							if (b) return b
							if (this._bodyBlob) return v(this._bodyBlob)
							if (this._bodyArrayBuffer)
								return Promise.resolve(S(this._bodyArrayBuffer))
							if (this._bodyFormData)
								throw new Error(
									'could not read FormData body as text',
								)
							return Promise.resolve(this._bodyText)
						}),
						l.formData &&
							(this.formData = function () {
								return this.text().then(P)
							}),
						(this.json = function () {
							return this.text().then(JSON.parse)
						}),
						this
					)
				}
				var L = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
				function w(b) {
					var T = b.toUpperCase()
					return L.indexOf(T) > -1 ? T : b
				}
				function V(b, T) {
					T = T || {}
					var x = T.body
					if (b instanceof V) {
						if (b.bodyUsed) throw new TypeError('Already read')
						;(this.url = b.url),
							(this.credentials = b.credentials),
							T.headers || (this.headers = new y(b.headers)),
							(this.method = b.method),
							(this.mode = b.mode),
							(this.signal = b.signal),
							!x &&
								b._bodyInit != null &&
								((x = b._bodyInit), (b.bodyUsed = !0))
					} else this.url = String(b)
					if (
						((this.credentials =
							T.credentials || this.credentials || 'same-origin'),
						(T.headers || !this.headers) &&
							(this.headers = new y(T.headers)),
						(this.method = w(T.method || this.method || 'GET')),
						(this.mode = T.mode || this.mode || null),
						(this.signal = T.signal || this.signal),
						(this.referrer = null),
						(this.method === 'GET' || this.method === 'HEAD') && x)
					)
						throw new TypeError(
							'Body not allowed for GET or HEAD requests',
						)
					this._initBody(x)
				}
				V.prototype.clone = function () {
					return new V(this, { body: this._bodyInit })
				}
				function P(b) {
					var T = new FormData()
					return (
						b
							.trim()
							.split('&')
							.forEach(function (x) {
								if (x) {
									var ie = x.split('='),
										D = ie.shift().replace(/\+/g, ' '),
										W = ie.join('=').replace(/\+/g, ' ')
									T.append(
										decodeURIComponent(D),
										decodeURIComponent(W),
									)
								}
							}),
						T
					)
				}
				function X(b) {
					var T = new y(),
						x = b.replace(/\r?\n[\t ]+/g, ' ')
					return (
						x.split(/\r?\n/).forEach(function (ie) {
							var D = ie.split(':'),
								W = D.shift().trim()
							if (W) {
								var pe = D.join(':').trim()
								T.append(W, pe)
							}
						}),
						T
					)
				}
				G.call(V.prototype)
				function $(b, T) {
					T || (T = {}),
						(this.type = 'default'),
						(this.status = T.status === void 0 ? 200 : T.status),
						(this.ok = this.status >= 200 && this.status < 300),
						(this.statusText =
							'statusText' in T ? T.statusText : 'OK'),
						(this.headers = new y(T.headers)),
						(this.url = T.url || ''),
						this._initBody(b)
				}
				G.call($.prototype),
					($.prototype.clone = function () {
						return new $(this._bodyInit, {
							status: this.status,
							statusText: this.statusText,
							headers: new y(this.headers),
							url: this.url,
						})
					}),
					($.error = function () {
						var b = new $(null, { status: 0, statusText: '' })
						return (b.type = 'error'), b
					})
				var be = [301, 302, 303, 307, 308]
				;($.redirect = function (b, T) {
					if (be.indexOf(T) === -1)
						throw new RangeError('Invalid status code')
					return new $(null, { status: T, headers: { location: b } })
				}),
					(o.DOMException = s.DOMException)
				try {
					new o.DOMException()
				} catch (b) {
					;(o.DOMException = function (T, x) {
						;(this.message = T), (this.name = x)
						var ie = Error(T)
						this.stack = ie.stack
					}),
						(o.DOMException.prototype = Object.create(
							Error.prototype,
						)),
						(o.DOMException.prototype.constructor = o.DOMException)
				}
				function ve(b, T) {
					return new Promise(function (x, ie) {
						var D = new V(b, T)
						if (D.signal && D.signal.aborted)
							return ie(
								new o.DOMException('Aborted', 'AbortError'),
							)
						var W = new XMLHttpRequest()
						function pe() {
							W.abort()
						}
						;(W.onload = function () {
							var _e = {
								status: W.status,
								statusText: W.statusText,
								headers: X(W.getAllResponseHeaders() || ''),
							}
							_e.url =
								'responseURL' in W
									? W.responseURL
									: _e.headers.get('X-Request-URL')
							var Ye =
								'response' in W ? W.response : W.responseText
							x(new $(Ye, _e))
						}),
							(W.onerror = function () {
								ie(new TypeError('Network request failed'))
							}),
							(W.ontimeout = function () {
								ie(new TypeError('Network request failed'))
							}),
							(W.onabort = function () {
								ie(new o.DOMException('Aborted', 'AbortError'))
							}),
							W.open(D.method, D.url, !0),
							D.credentials === 'include'
								? (W.withCredentials = !0)
								: D.credentials === 'omit' &&
									(W.withCredentials = !1),
							'responseType' in W &&
								l.blob &&
								(W.responseType = 'blob'),
							D.headers.forEach(function (_e, Ye) {
								W.setRequestHeader(Ye, _e)
							}),
							D.signal &&
								(D.signal.addEventListener('abort', pe),
								(W.onreadystatechange = function () {
									W.readyState === 4 &&
										D.signal.removeEventListener(
											'abort',
											pe,
										)
								})),
							W.send(
								typeof D._bodyInit == 'undefined'
									? null
									: D._bodyInit,
							)
					})
				}
				return (
					(ve.polyfill = !0),
					s.fetch ||
						((s.fetch = ve),
						(s.Headers = y),
						(s.Request = V),
						(s.Response = $)),
					(o.Headers = y),
					(o.Request = V),
					(o.Response = $),
					(o.fetch = ve),
					Object.defineProperty(o, '__esModule', { value: !0 }),
					o
				)
			})({})
		})(n),
			(n.fetch.ponyfill = !0),
			delete n.fetch.polyfill
		var i = n
		;(e = i.fetch),
			(e.default = i.fetch),
			(e.fetch = i.fetch),
			(e.Headers = i.Headers),
			(e.Request = i.Request),
			(e.Response = i.Response),
			(r.exports = e)
	})(Xo, Xo.exports)
	var ii = Xo.exports
	const si = Is(ii),
		dv = U({ __proto__: null, default: si }, [ii]),
		sr = (r) => {
			let e = {}
			return (
				r &&
					((typeof Headers != 'undefined' && r instanceof Headers) ||
					(dv && ii.Headers && r instanceof ii.Headers)
						? (e = av(r))
						: Array.isArray(r)
							? r.forEach(([t, n]) => {
									t && n !== void 0 && (e[t] = n)
								})
							: (e = r)),
				e
			)
		},
		Uu = (r) => r.replace(/([\s,]|#[^\n\r]+)+/g, ' ').trim(),
		hv = (r) => {
			if (!Array.isArray(r.query)) {
				const n = r,
					i = [`query=${encodeURIComponent(Uu(n.query))}`]
				return (
					r.variables &&
						i.push(
							`variables=${encodeURIComponent(n.jsonSerializer.stringify(n.variables))}`,
						),
					n.operationName &&
						i.push(
							`operationName=${encodeURIComponent(n.operationName)}`,
						),
					i.join('&')
				)
			}
			if (
				typeof r.variables != 'undefined' &&
				!Array.isArray(r.variables)
			)
				throw new Error(
					'Cannot create query with given variable type, array expected',
				)
			const e = r,
				t = r.query.reduce(
					(n, i, s) => (
						n.push({
							query: Uu(i),
							variables: e.variables
								? e.jsonSerializer.stringify(e.variables[s])
								: void 0,
						}),
						n
					),
					[],
				)
			return `query=${encodeURIComponent(e.jsonSerializer.stringify(t))}`
		},
		pv = (r) => (e) =>
			z(this, null, function* () {
				var f
				const {
						url: t,
						query: n,
						variables: i,
						operationName: s,
						fetch: o,
						fetchOptions: l,
						middleware: a,
					} = e,
					c = Z({}, e.headers)
				let u = '',
					d
				r === 'POST'
					? ((d = mv(n, i, s, l.jsonSerializer)),
						typeof d == 'string' &&
							(c['Content-Type'] = 'application/json'))
					: (u = hv({
							query: n,
							variables: i,
							operationName: s,
							jsonSerializer:
								(f = l.jsonSerializer) != null ? f : No,
						}))
				const h = Z({ method: r, headers: c, body: d }, l)
				let p = t,
					y = h
				if (a) {
					const m = yield Promise.resolve(
							a(
								q(Z({}, h), {
									url: t,
									operationName: s,
									variables: i,
								}),
							),
						),
						{ url: v } = m,
						S = Ve(m, ['url'])
					;(p = v), (y = S)
				}
				return u && (p = `${p}?${u}`), yield o(p, y)
			})
	class fv {
		constructor(e, t = {}) {
			;(this.url = e),
				(this.requestConfig = t),
				(this.rawRequest = (...n) =>
					z(this, null, function* () {
						const [i, s, o] = n,
							l = cv(i, s, o),
							m = this.requestConfig,
							{
								headers: a,
								fetch: c = si,
								method: u = 'POST',
								requestMiddleware: d,
								responseMiddleware: h,
							} = m,
							p = Ve(m, [
								'headers',
								'fetch',
								'method',
								'requestMiddleware',
								'responseMiddleware',
							]),
							{ url: y } = this
						l.signal !== void 0 && (p.signal = l.signal)
						const { operationName: f } = Lo(l.query)
						return Wo({
							url: y,
							query: l.query,
							variables: l.variables,
							headers: Z(Z({}, sr(_o(a))), sr(l.requestHeaders)),
							operationName: f,
							fetch: c,
							method: u,
							fetchOptions: p,
							middleware: d,
						})
							.then((g) => (h && h(g), g))
							.catch((g) => {
								throw (h && h(g), g)
							})
					}))
		}
		request(e, ...t) {
			return z(this, null, function* () {
				const [n, i] = t,
					s = lv(e, n, i),
					f = this.requestConfig,
					{
						headers: o,
						fetch: l = si,
						method: a = 'POST',
						requestMiddleware: c,
						responseMiddleware: u,
					} = f,
					d = Ve(f, [
						'headers',
						'fetch',
						'method',
						'requestMiddleware',
						'responseMiddleware',
					]),
					{ url: h } = this
				s.signal !== void 0 && (d.signal = s.signal)
				const { query: p, operationName: y } = Lo(s.document)
				return Wo({
					url: h,
					query: p,
					variables: s.variables,
					headers: Z(Z({}, sr(_o(o))), sr(s.requestHeaders)),
					operationName: y,
					fetch: l,
					method: a,
					fetchOptions: d,
					middleware: c,
				})
					.then((m) => (u && u(m), m.data))
					.catch((m) => {
						throw (u && u(m), m)
					})
			})
		}
		batchRequests(e, t) {
			var c
			const n = uv(e, t),
				a = this.requestConfig,
				{ headers: i } = a,
				s = Ve(a, ['headers'])
			n.signal !== void 0 && (s.signal = n.signal)
			const o = n.documents.map(({ document: u }) => Lo(u).query),
				l = n.documents.map(({ variables: u }) => u)
			return Wo({
				url: this.url,
				query: o,
				variables: l,
				headers: Z(Z({}, sr(_o(i))), sr(n.requestHeaders)),
				operationName: void 0,
				fetch: (c = this.requestConfig.fetch) != null ? c : si,
				method: this.requestConfig.method || 'POST',
				fetchOptions: s,
				middleware: this.requestConfig.requestMiddleware,
			})
				.then(
					(u) => (
						this.requestConfig.responseMiddleware &&
							this.requestConfig.responseMiddleware(u),
						u.data
					),
				)
				.catch((u) => {
					throw (
						(this.requestConfig.responseMiddleware &&
							this.requestConfig.responseMiddleware(u),
						u)
					)
				})
		}
		setHeaders(e) {
			return (this.requestConfig.headers = e), this
		}
		setHeader(e, t) {
			const { headers: n } = this.requestConfig
			return (
				n ? (n[e] = t) : (this.requestConfig.headers = { [e]: t }), this
			)
		}
		setEndpoint(e) {
			return (this.url = e), this
		}
	}
	const Wo = (r) =>
			z(this, null, function* () {
				var u, d
				const { query: e, variables: t, fetchOptions: n } = r,
					i = pv(ov((u = r.method) != null ? u : 'post')),
					s = Array.isArray(r.query),
					o = yield i(r),
					l = yield yv(o, (d = n.jsonSerializer) != null ? d : No),
					a = Array.isArray(l)
						? !l.some(({ data: p }) => !p)
						: !!l.data,
					c =
						Array.isArray(l) ||
						!l.errors ||
						(Array.isArray(l.errors) && !l.errors.length) ||
						n.errorPolicy === 'all' ||
						n.errorPolicy === 'ignore'
				if (o.ok && c && a) {
					const h = (Array.isArray(l), l),
						{ errors: p } = h,
						y = Ve(h, ['errors']),
						f = n.errorPolicy === 'ignore' ? y : l
					return q(Z({}, s ? { data: f } : f), {
						headers: o.headers,
						status: o.status,
					})
				} else {
					const p = typeof l == 'string' ? { error: l } : l
					throw new ir(
						q(Z({}, p), { status: o.status, headers: o.headers }),
						{ query: e, variables: t },
					)
				}
			}),
		mv = (r, e, t, n) => {
			const i = n != null ? n : No
			if (!Array.isArray(r))
				return i.stringify({ query: r, variables: e, operationName: t })
			if (typeof e != 'undefined' && !Array.isArray(e))
				throw new Error(
					'Cannot create request body with given variable type, array expected',
				)
			const s = r.reduce(
				(o, l, a) => (
					o.push({ query: l, variables: e ? e[a] : void 0 }), o
				),
				[],
			)
			return i.stringify(s)
		},
		yv = (r, e) =>
			z(this, null, function* () {
				let t
				return (
					r.headers.forEach((n, i) => {
						i.toLowerCase() === 'content-type' && (t = n)
					}),
					t &&
					(t.toLowerCase().startsWith('application/json') ||
						t
							.toLowerCase()
							.startsWith('application/graphql+json') ||
						t
							.toLowerCase()
							.startsWith('application/graphql-response+json'))
						? e.parse(yield r.text())
						: r.text()
				)
			}),
		_o = (r) => (typeof r == 'function' ? r() : r)
	var bv = Object.defineProperty,
		gv = (r, e, t) =>
			e in r
				? bv(r, e, {
						enumerable: !0,
						configurable: !0,
						writable: !0,
						value: t,
					})
				: (r[e] = t),
		E = (r, e, t) => gv(r, typeof e != 'symbol' ? e + '' : e, t),
		Au,
		Sv = Object.defineProperty,
		vv = (r, e, t) =>
			e in r
				? Sv(r, e, {
						enumerable: !0,
						configurable: !0,
						writable: !0,
						value: t,
					})
				: (r[e] = t),
		Mu = (r, e, t) => vv(r, typeof e != 'symbol' ? e + '' : e, t),
		me = ((r) => (
			(r[(r.Document = 0)] = 'Document'),
			(r[(r.DocumentType = 1)] = 'DocumentType'),
			(r[(r.Element = 2)] = 'Element'),
			(r[(r.Text = 3)] = 'Text'),
			(r[(r.CDATA = 4)] = 'CDATA'),
			(r[(r.Comment = 5)] = 'Comment'),
			r
		))(me || {})
	const Yu = {
			Node: ['childNodes', 'parentNode', 'parentElement', 'textContent'],
			ShadowRoot: ['host', 'styleSheets'],
			Element: ['shadowRoot', 'querySelector', 'querySelectorAll'],
			MutationObserver: [],
		},
		Fu = {
			Node: ['contains', 'getRootNode'],
			ShadowRoot: ['getSelection'],
			Element: [],
			MutationObserver: ['constructor'],
		},
		oi = {}
	function xo(r) {
		if (oi[r]) return oi[r]
		const e = globalThis[r],
			t = e.prototype,
			n = r in Yu ? Yu[r] : void 0,
			i = !!(
				n &&
				n.every((l) => {
					var a, c
					return !!(
						(c =
							(a = Object.getOwnPropertyDescriptor(t, l)) == null
								? void 0
								: a.get) != null &&
						c.toString().includes('[native code]')
					)
				})
			),
			s = r in Fu ? Fu[r] : void 0,
			o = !!(
				s &&
				s.every((l) => {
					var a
					return (
						typeof t[l] == 'function' &&
						((a = t[l]) == null
							? void 0
							: a.toString().includes('[native code]'))
					)
				})
			)
		if (i && o) return (oi[r] = e.prototype), e.prototype
		try {
			const l = document.createElement('iframe')
			document.body.appendChild(l)
			const a = l.contentWindow
			if (!a) return e.prototype
			const c = a[r].prototype
			return document.body.removeChild(l), c ? (oi[r] = c) : t
		} catch (l) {
			return t
		}
	}
	const Oo = {}
	function wt(r, e, t) {
		var n
		const i = `${r}.${String(t)}`
		if (Oo[i]) return Oo[i].call(e)
		const s = xo(r),
			o =
				(n = Object.getOwnPropertyDescriptor(s, t)) == null
					? void 0
					: n.get
		return o ? ((Oo[i] = o), o.call(e)) : e[t]
	}
	const ko = {}
	function Ju(r, e, t) {
		const n = `${r}.${String(t)}`
		if (ko[n]) return ko[n].bind(e)
		const s = xo(r)[t]
		return typeof s != 'function' ? e[t] : ((ko[n] = s), s.bind(e))
	}
	function Rv(r) {
		return wt('Node', r, 'childNodes')
	}
	function Iv(r) {
		return wt('Node', r, 'parentNode')
	}
	function wv(r) {
		return wt('Node', r, 'parentElement')
	}
	function Zv(r) {
		return wt('Node', r, 'textContent')
	}
	function Tv(r, e) {
		return Ju('Node', r, 'contains')(e)
	}
	function Ev(r) {
		return Ju('Node', r, 'getRootNode')()
	}
	function Cv(r) {
		return !r || !('host' in r) ? null : wt('ShadowRoot', r, 'host')
	}
	function Gv(r) {
		return r.styleSheets
	}
	function Vv(r) {
		return !r || !('shadowRoot' in r)
			? null
			: wt('Element', r, 'shadowRoot')
	}
	function Nv(r, e) {
		return wt('Element', r, 'querySelector')(e)
	}
	function Lv(r, e) {
		return wt('Element', r, 'querySelectorAll')(e)
	}
	function Xv() {
		return xo('MutationObserver').constructor
	}
	const Re = {
		childNodes: Rv,
		parentNode: Iv,
		parentElement: wv,
		textContent: Zv,
		contains: Tv,
		getRootNode: Ev,
		host: Cv,
		styleSheets: Gv,
		shadowRoot: Vv,
		querySelector: Nv,
		querySelectorAll: Lv,
		mutationObserver: Xv,
	}
	function Hu(r) {
		return r.nodeType === r.ELEMENT_NODE
	}
	function Jr(r) {
		const e = (r && 'host' in r && 'mode' in r && Re.host(r)) || null
		return !!(e && 'shadowRoot' in e && Re.shadowRoot(e) === r)
	}
	function Hr(r) {
		return Object.prototype.toString.call(r) === '[object ShadowRoot]'
	}
	function Wv(r) {
		return (
			r.includes(' background-clip: text;') &&
				!r.includes(' -webkit-background-clip: text;') &&
				(r = r.replace(
					/\sbackground-clip:\s*text;/g,
					' -webkit-background-clip: text; background-clip: text;',
				)),
			r
		)
	}
	function _v(r) {
		const { cssText: e } = r
		if (e.split('"').length < 3) return e
		const t = ['@import', `url(${JSON.stringify(r.href)})`]
		return (
			r.layerName === ''
				? t.push('layer')
				: r.layerName && t.push(`layer(${r.layerName})`),
			r.supportsText && t.push(`supports(${r.supportsText})`),
			r.media.length && t.push(r.media.mediaText),
			t.join(' ') + ';'
		)
	}
	function Po(r) {
		try {
			const e = r.rules || r.cssRules
			if (!e) return null
			let t = r.href
			!t &&
				r.ownerNode &&
				r.ownerNode.ownerDocument &&
				(t = r.ownerNode.ownerDocument.location.href)
			const n = Array.from(e, (i) => Ku(i, t)).join('')
			return Wv(n)
		} catch (e) {
			return null
		}
	}
	function Ku(r, e) {
		if (Ov(r)) {
			let t
			try {
				t = Po(r.styleSheet) || _v(r)
			} catch (n) {
				t = r.cssText
			}
			return r.styleSheet.href ? ai(t, r.styleSheet.href) : t
		} else {
			let t = r.cssText
			return (
				kv(r) && r.selectorText.includes(':') && (t = xv(t)),
				e ? ai(t, e) : t
			)
		}
	}
	function xv(r) {
		const e = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm
		return r.replace(e, '$1\\$2')
	}
	function Ov(r) {
		return 'styleSheet' in r
	}
	function kv(r) {
		return 'selectorText' in r
	}
	class Bu {
		constructor() {
			Mu(this, 'idNodeMap', new Map()),
				Mu(this, 'nodeMetaMap', new WeakMap())
		}
		getId(e) {
			var t
			if (!e) return -1
			const n = (t = this.getMeta(e)) == null ? void 0 : t.id
			return n != null ? n : -1
		}
		getNode(e) {
			return this.idNodeMap.get(e) || null
		}
		getIds() {
			return Array.from(this.idNodeMap.keys())
		}
		getMeta(e) {
			return this.nodeMetaMap.get(e) || null
		}
		removeNodeFromMap(e) {
			const t = this.getId(e)
			this.idNodeMap.delete(t),
				e.childNodes &&
					e.childNodes.forEach((n) => this.removeNodeFromMap(n))
		}
		has(e) {
			return this.idNodeMap.has(e)
		}
		hasNode(e) {
			return this.nodeMetaMap.has(e)
		}
		add(e, t) {
			const n = t.id
			this.idNodeMap.set(n, e), this.nodeMetaMap.set(e, t)
		}
		replace(e, t) {
			const n = this.getNode(e)
			if (n) {
				const i = this.nodeMetaMap.get(n)
				i && this.nodeMetaMap.set(t, i)
			}
			this.idNodeMap.set(e, t)
		}
		reset() {
			;(this.idNodeMap = new Map()), (this.nodeMetaMap = new WeakMap())
		}
	}
	function Pv() {
		return new Bu()
	}
	function Uo({
		element: r,
		maskInputOptions: e,
		tagName: t,
		type: n,
		value: i,
		overwriteRecord: s,
		maskInputFn: o,
	}) {
		let l = i || ''
		return (
			Qu({
				maskInputOptions: e,
				tagName: t,
				type: n,
				overwriteRecord: s,
			}) && (o ? (l = o(l, r)) : (l = '*'.repeat(l.length))),
			l
		)
	}
	function or(r) {
		return r.toLowerCase()
	}
	const zu = '__rrweb_original__'
	function Uv(r) {
		const e = r.getContext('2d')
		if (!e) return !0
		const t = 50
		for (let n = 0; n < r.width; n += t)
			for (let i = 0; i < r.height; i += t) {
				const s = e.getImageData,
					o = zu in s ? s[zu] : s
				if (
					new Uint32Array(
						o.call(
							e,
							n,
							i,
							Math.min(t, r.width - n),
							Math.min(t, r.height - i),
						).data.buffer,
					).some((a) => a !== 0)
				)
					return !1
			}
		return !0
	}
	function Ao(r) {
		const e = r.type
		return r.hasAttribute('data-rr-is-password')
			? 'password'
			: e
				? or(e)
				: null
	}
	function Du(r, e) {
		var s
		let t
		try {
			t = new URL(r, window.location.href)
		} catch (o) {
			return null
		}
		const n = /\.([0-9a-z]+)(?:$)/i,
			i = t.pathname.match(n)
		return (s = i == null ? void 0 : i[1]) != null ? s : null
	}
	function Av(r) {
		let e = ''
		return (
			r.indexOf('//') > -1
				? (e = r.split('/').slice(0, 3).join('/'))
				: (e = r.split('/')[0]),
			(e = e.split('?')[0]),
			e
		)
	}
	const Mv = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm,
		Yv = /^(?:[a-z+]+:)?\/\//i,
		Fv = /^www\..*/i,
		Jv = /^(data:)([^,]*),(.*)/i
	function ai(r, e) {
		return (r || '').replace(Mv, (t, n, i, s, o, l) => {
			const a = i || o || l,
				c = n || s || ''
			if (!a) return t
			if (Yv.test(a) || Fv.test(a)) return `url(${c}${a}${c})`
			if (Jv.test(a)) return `url(${c}${a}${c})`
			if (a[0] === '/') return `url(${c}${Av(e) + a}${c})`
			const u = e.split('/'),
				d = a.split('/')
			u.pop()
			for (const h of d) h !== '.' && (h === '..' ? u.pop() : u.push(h))
			return `url(${c}${u.join('/')}${c})`
		})
	}
	function Mo(r) {
		return r.replace(/(\/\*[^*]*\*\/)|[\s;]/g, '')
	}
	function Hv(r, e) {
		const t = Array.from(e.childNodes),
			n = []
		if (t.length > 1 && r && typeof r == 'string') {
			const i = Mo(r)
			for (let s = 1; s < t.length; s++)
				if (t[s].textContent && typeof t[s].textContent == 'string') {
					const o = Mo(t[s].textContent)
					for (let l = 3; l < o.length; l++) {
						const a = o.substring(0, l)
						if (i.split(a).length === 2) {
							const c = i.indexOf(a)
							for (let u = c; u < r.length; u++)
								if (Mo(r.substring(0, u)).length === c) {
									n.push(r.substring(0, u)),
										(r = r.substring(u))
									break
								}
							break
						}
					}
				}
		}
		return n.push(r), n
	}
	function Kv(r, e) {
		return Hv(r, e).join('/* rr_split */')
	}
	function Yo(r) {
		return (
			(r = r.replace(/[^ -~]+/g, '')),
			(r =
				(r == null
					? void 0
					: r
							.split(' ')
							.map((e) =>
								Math.random()
									.toString(20)
									.substring(2, e.length),
							)
							.join(' ')) || ''),
			r
		)
	}
	function Fo(r) {
		return r === 'img' || r === 'video' || r === 'audio' || r === 'source'
	}
	const Bv = new RegExp(
			/[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*/,
		),
		zv = new RegExp(/[0-9]{9,16}/),
		Dv = new RegExp(/[0-9]{3}-?[0-9]{2}-?[0-9]{4}/),
		jv = new RegExp(/[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/),
		Qv = new RegExp(/[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}/),
		$v = new RegExp(
			/[0-9]{1,5}.?[0-9]{0,3}\s[a-zA-Z]{2,30}\s[a-zA-Z]{2,15}/,
		),
		qv = new RegExp(/(?:[0-9]{1,3}.){3}[0-9]{1,3}/),
		eR = [Bv, zv, Dv, jv, Qv, $v, qv]
	function ju(r) {
		return r ? eR.some((e) => e.test(r)) : !1
	}
	const Qu = ({
		maskInputOptions: r,
		tagName: e,
		type: t,
		overwriteRecord: n,
	}) => {
		const i = t && t.toLowerCase()
		return n !== 'true' && (!!r[e.toLowerCase()] || !!(i && r[i]))
	}
	let tR = 1
	const rR = new RegExp('[^a-z0-9-_:]'),
		Kr = -2
	function $u() {
		return tR++
	}
	function nR(r) {
		if (r instanceof HTMLFormElement) return 'form'
		const e = or(r.tagName)
		return rR.test(e) ? 'div' : e
	}
	let ar, qu
	const iR = /^[^ \t\n\r\u000c]+/,
		sR = /^[, \t\n\r\u000c]+/
	function oR(r, e) {
		if (e.trim() === '') return e
		let t = 0
		function n(s) {
			let o
			const l = s.exec(e.substring(t))
			return l ? ((o = l[0]), (t += o.length), o) : ''
		}
		const i = []
		for (; n(sR), !(t >= e.length); ) {
			let s = n(iR)
			if (s.slice(-1) === ',')
				(s = lr(r, s.substring(0, s.length - 1))), i.push(s)
			else {
				let o = ''
				s = lr(r, s)
				let l = !1
				for (;;) {
					const a = e.charAt(t)
					if (a === '') {
						i.push((s + o).trim())
						break
					} else if (l) a === ')' && (l = !1)
					else if (a === ',') {
						;(t += 1), i.push((s + o).trim())
						break
					} else a === '(' && (l = !0)
					;(o += a), (t += 1)
				}
			}
		}
		return i.join(', ')
	}
	const ed = new WeakMap()
	function lr(r, e) {
		return !e || e.trim() === '' ? e : Jo(r, e)
	}
	function aR(r) {
		return !!(r.tagName === 'svg' || r.ownerSVGElement)
	}
	function Jo(r, e) {
		let t = ed.get(r)
		if ((t || ((t = r.createElement('a')), ed.set(r, t)), !e)) e = ''
		else if (e.startsWith('blob:') || e.startsWith('data:')) return e
		return t.setAttribute('href', e), t.href
	}
	function td(r, e, t, n) {
		return (
			n &&
			(t === 'src' ||
			(t === 'href' && !(e === 'use' && n[0] === '#')) ||
			(t === 'xlink:href' && n[0] !== '#') ||
			(t === 'background' && (e === 'table' || e === 'td' || e === 'th'))
				? lr(r, n)
				: t === 'srcset'
					? oR(r, n)
					: t === 'style'
						? ai(n, Jo(r))
						: e === 'object' && t === 'data'
							? lr(r, n)
							: n)
		)
	}
	function rd(r, e, t) {
		return (r === 'video' || r === 'audio') && e === 'autoplay'
	}
	function nd(r, e, t) {
		try {
			if (typeof e == 'string') {
				if (r.classList.contains(e)) return !0
			} else
				for (let n = r.classList.length; n--; ) {
					const i = r.classList[n]
					if (e.test(i)) return !0
				}
			if (t) return r.matches(t)
		} catch (n) {}
		return !1
	}
	function li(r, e, t) {
		if (!r) return !1
		if (r.nodeType !== r.ELEMENT_NODE)
			return t ? li(Re.parentNode(r), e, t) : !1
		for (let n = r.classList.length; n--; ) {
			const i = r.classList[n]
			if (e.test(i)) return !0
		}
		return t ? li(Re.parentNode(r), e, t) : !1
	}
	function id(r, e, t, n) {
		let i
		if (Hu(r)) {
			if (((i = r), !Re.childNodes(i).length)) return !1
		} else {
			if (Re.parentElement(r) === null) return !1
			i = Re.parentElement(r)
		}
		try {
			if (typeof e == 'string') {
				if (n) {
					if (i.closest(`.${e}`)) return !0
				} else if (i.classList.contains(e)) return !0
			} else if (li(i, e, n)) return !0
			if (t) {
				if (n) {
					if (i.closest(t)) return !0
				} else if (i.matches(t)) return !0
			}
		} catch (s) {}
		return !1
	}
	function lR(r, e, t) {
		const n = r.contentWindow
		if (!n) return
		let i = !1,
			s
		try {
			s = n.document.readyState
		} catch (l) {
			return
		}
		if (s !== 'complete') {
			const l = setTimeout(() => {
				i || (e(), (i = !0))
			}, t)
			r.addEventListener('load', () => {
				clearTimeout(l), (i = !0), e()
			})
			return
		}
		const o = 'about:blank'
		if (n.location.href !== o || r.src === o || r.src === '')
			return setTimeout(e, 0), r.addEventListener('load', e)
		r.addEventListener('load', e)
	}
	function cR(r, e, t) {
		let n = !1,
			i
		try {
			i = r.sheet
		} catch (o) {
			return
		}
		if (i) return
		const s = setTimeout(() => {
			n || (e(), (n = !0))
		}, t)
		r.addEventListener('load', () => {
			clearTimeout(s), (n = !0), e()
		})
	}
	function uR(r, e) {
		const {
				doc: t,
				mirror: n,
				blockClass: i,
				blockSelector: s,
				needsMask: o,
				inlineStylesheet: l,
				maskInputOptions: a = {},
				maskTextClass: c,
				maskTextFn: u,
				maskInputFn: d,
				dataURLOptions: h = {},
				inlineImages: p,
				recordCanvas: y,
				keepIframeSrcFn: f,
				newlyAddedElement: m = !1,
				cssCaptured: g = !1,
				privacySetting: v,
			} = e,
			S = dR(t, n)
		switch (r.nodeType) {
			case r.DOCUMENT_NODE:
				return r.compatMode !== 'CSS1Compat'
					? {
							type: me.Document,
							childNodes: [],
							compatMode: r.compatMode,
						}
					: { type: me.Document, childNodes: [] }
			case r.DOCUMENT_TYPE_NODE:
				return {
					type: me.DocumentType,
					name: r.name,
					publicId: r.publicId,
					systemId: r.systemId,
					rootId: S,
				}
			case r.ELEMENT_NODE:
				return pR(r, {
					doc: t,
					blockClass: i,
					blockSelector: s,
					inlineStylesheet: l,
					maskInputOptions: a,
					maskInputFn: d,
					maskTextClass: c,
					dataURLOptions: h,
					inlineImages: p,
					recordCanvas: y,
					keepIframeSrcFn: f,
					newlyAddedElement: m,
					privacySetting: v,
					rootId: S,
				})
			case r.TEXT_NODE:
				return hR(r, {
					doc: t,
					needsMask: o,
					maskTextFn: u,
					privacySetting: v,
					rootId: S,
					cssCaptured: g,
				})
			case r.CDATA_SECTION_NODE:
				return { type: me.CDATA, textContent: '', rootId: S }
			case r.COMMENT_NODE:
				return {
					type: me.Comment,
					textContent: Re.textContent(r) || '',
					rootId: S,
				}
			default:
				return !1
		}
	}
	function dR(r, e) {
		if (!e.hasNode(r)) return
		const t = e.getId(r)
		return t === 1 ? void 0 : t
	}
	function hR(r, e) {
		var t
		const {
				needsMask: n,
				maskTextFn: i,
				privacySetting: s,
				rootId: o,
				cssCaptured: l,
			} = e,
			a = Re.parentNode(r),
			c = a && a.tagName
		let u = ''
		const d = c === 'STYLE' ? !0 : void 0,
			h = c === 'SCRIPT' ? !0 : void 0
		h
			? (u = 'SCRIPT_PLACEHOLDER')
			: l || ((u = Re.textContent(r)), d && u && (u = ai(u, Jo(e.doc)))),
			!d &&
				!h &&
				u &&
				n &&
				(u = i ? i(u, Re.parentElement(r)) : u.replace(/[\S]/g, '*'))
		const p = s === 'strict',
			y =
				(t = r.parentElement) == null
					? void 0
					: t.getAttribute('data-hl-record'),
			f = s === 'default' && ju(u)
		return (
			(p || f) &&
				!y &&
				c &&
				!new Set([
					'HEAD',
					'TITLE',
					'STYLE',
					'SCRIPT',
					'HTML',
					'BODY',
					'NOSCRIPT',
				]).has(c) &&
				u &&
				(u = Yo(u)),
			{ type: me.Text, textContent: u || '', rootId: o }
		)
	}
	function pR(r, e) {
		const {
			doc: t,
			blockClass: n,
			blockSelector: i,
			inlineStylesheet: s,
			maskInputOptions: o = {},
			maskInputFn: l,
			maskTextClass: a,
			dataURLOptions: c = {},
			inlineImages: u,
			recordCanvas: d,
			keepIframeSrcFn: h,
			newlyAddedElement: p = !1,
			privacySetting: y,
			rootId: f,
		} = e
		let m = nd(r, n, i)
		const g = nd(r, a, null),
			v = y === 'strict'
		let S = nR(r),
			I = {}
		const G = r.attributes.length
		for (let w = 0; w < G; w++) {
			const V = r.attributes[w]
			rd(S, V.name) || (I[V.name] = td(t, S, or(V.name), V.value))
		}
		if (S === 'link' && s) {
			const w = Array.from(t.styleSheets).find((P) => P.href === r.href)
			let V = null
			w && (V = Po(w)),
				V && (delete I.rel, delete I.href, (I._cssText = V))
		}
		if (S === 'style' && r.sheet) {
			let w = Po(r.sheet)
			w && (r.childNodes.length > 1 && (w = Kv(w, r)), (I._cssText = w))
		}
		if (S === 'input' || S === 'textarea' || S === 'select') {
			const w = r.value,
				V = r.checked
			I.type !== 'radio' &&
			I.type !== 'checkbox' &&
			I.type !== 'submit' &&
			I.type !== 'button' &&
			w
				? (I.value = Uo({
						element: r,
						type: Ao(r),
						tagName: S,
						value: w,
						overwriteRecord: r.getAttribute('data-hl-record'),
						maskInputOptions: o,
						maskInputFn: l,
					}))
				: V && (I.checked = V)
		}
		if (
			(S === 'option' &&
				(r.selected && !o.select
					? (I.selected = !0)
					: delete I.selected),
			S === 'dialog' &&
				r.open &&
				(I.rr_open_mode = r.matches('dialog:modal')
					? 'modal'
					: 'non-modal'),
			S === 'canvas' && d)
		) {
			if (r.__context === '2d') Uv(r)
			else if (!('__context' in r)) {
				const w = r.toDataURL(c.type, c.quality),
					V = t.createElement('canvas')
				;(V.width = r.width), (V.height = r.height)
				const P = V.toDataURL(c.type, c.quality)
				w !== P && (I.rr_dataURL = w)
			}
		}
		if (S === 'img' && u && !m && !g && !v) {
			ar || ((ar = t.createElement('canvas')), (qu = ar.getContext('2d')))
			const w = r,
				V = w.currentSrc || w.getAttribute('src') || '<unknown-src>',
				P = w.crossOrigin,
				X = () => {
					w.removeEventListener('load', X)
					try {
						;(ar.width = w.naturalWidth),
							(ar.height = w.naturalHeight),
							qu.drawImage(w, 0, 0),
							(I.rr_dataURL = ar.toDataURL(c.type, c.quality))
					} catch ($) {
						if (w.crossOrigin !== 'anonymous') {
							;(w.crossOrigin = 'anonymous'),
								w.complete && w.naturalWidth !== 0
									? X()
									: w.addEventListener('load', X)
							return
						} else
							console.warn(
								`Cannot inline img src=${V}! Error: ${$}`,
							)
					}
					w.crossOrigin === 'anonymous' &&
						(P
							? (I.crossOrigin = P)
							: w.removeAttribute('crossorigin'))
				}
			w.complete && w.naturalWidth !== 0
				? X()
				: w.addEventListener('load', X)
		}
		if (S === 'audio' || S === 'video') {
			const w = I
			;(w.rr_mediaState = r.paused ? 'paused' : 'played'),
				(w.rr_mediaCurrentTime = r.currentTime),
				(w.rr_mediaPlaybackRate = r.playbackRate),
				(w.rr_mediaMuted = r.muted),
				(w.rr_mediaLoop = r.loop),
				(w.rr_mediaVolume = r.volume)
		}
		if (
			(p ||
				(r.scrollLeft && (I.rr_scrollLeft = r.scrollLeft),
				r.scrollTop && (I.rr_scrollTop = r.scrollTop)),
			m || g || (v && Fo(S)))
		) {
			const { width: w, height: V } = r.getBoundingClientRect()
			I = { class: I.class, rr_width: `${w}px`, rr_height: `${V}px` }
		}
		v && Fo(S) && (m = !0),
			S === 'iframe' &&
				!h(I.src) &&
				(r.contentDocument || (I.rr_src = I.src), delete I.src)
		let L
		try {
			customElements.get(S) && (L = !0)
		} catch (w) {}
		if (u && S === 'video') {
			const w = r
			if (w.src === '' || w.src.indexOf('blob:') !== -1) {
				const { width: V, height: P } = r.getBoundingClientRect()
				;(I = {
					width: V,
					height: P,
					rr_width: `${V}px`,
					rr_height: `${P}px`,
					rr_inlined_video: !0,
					class: I.class,
					style: I.style,
				}),
					(S = 'canvas')
				const X = t.createElement('canvas')
				;(X.width = r.width),
					(X.height = r.height),
					(I.rr_dataURL = X.toDataURL(c.type, c.quality))
			}
		}
		return {
			type: me.Element,
			tagName: S,
			attributes: I,
			childNodes: [],
			isSVG: aR(r) || void 0,
			needBlock: m,
			needMask: g,
			rootId: f,
			isCustom: L,
		}
	}
	function oe(r) {
		return r == null ? '' : r.toLowerCase()
	}
	function fR(r, e) {
		if (e.comment && r.type === me.Comment) return !0
		if (r.type === me.Element) {
			if (
				e.script &&
				(r.tagName === 'script' ||
					(r.tagName === 'link' &&
						(r.attributes.rel === 'preload' ||
							r.attributes.rel === 'modulepreload') &&
						r.attributes.as === 'script') ||
					(r.tagName === 'link' &&
						r.attributes.rel === 'prefetch' &&
						typeof r.attributes.href == 'string' &&
						Du(r.attributes.href) === 'js'))
			)
				return !0
			if (
				e.headFavicon &&
				((r.tagName === 'link' &&
					r.attributes.rel === 'shortcut icon') ||
					(r.tagName === 'meta' &&
						(oe(r.attributes.name).match(
							/^msapplication-tile(image|color)$/,
						) ||
							oe(r.attributes.name) === 'application-name' ||
							oe(r.attributes.rel) === 'icon' ||
							oe(r.attributes.rel) === 'apple-touch-icon' ||
							oe(r.attributes.rel) === 'shortcut icon')))
			)
				return !0
			if (r.tagName === 'meta') {
				if (
					e.headMetaDescKeywords &&
					oe(r.attributes.name).match(/^description|keywords$/)
				)
					return !0
				if (
					e.headMetaSocial &&
					(oe(r.attributes.property).match(/^(og|twitter|fb):/) ||
						oe(r.attributes.name).match(/^(og|twitter):/) ||
						oe(r.attributes.name) === 'pinterest')
				)
					return !0
				if (
					e.headMetaRobots &&
					(oe(r.attributes.name) === 'robots' ||
						oe(r.attributes.name) === 'googlebot' ||
						oe(r.attributes.name) === 'bingbot')
				)
					return !0
				if (
					e.headMetaHttpEquiv &&
					r.attributes['http-equiv'] !== void 0
				)
					return !0
				if (
					e.headMetaAuthorship &&
					(oe(r.attributes.name) === 'author' ||
						oe(r.attributes.name) === 'generator' ||
						oe(r.attributes.name) === 'framework' ||
						oe(r.attributes.name) === 'publisher' ||
						oe(r.attributes.name) === 'progid' ||
						oe(r.attributes.property).match(/^article:/) ||
						oe(r.attributes.property).match(/^product:/))
				)
					return !0
				if (
					e.headMetaVerification &&
					(oe(r.attributes.name) === 'google-site-verification' ||
						oe(r.attributes.name) === 'yandex-verification' ||
						oe(r.attributes.name) === 'csrf-token' ||
						oe(r.attributes.name) === 'p:domain_verify' ||
						oe(r.attributes.name) === 'verify-v1' ||
						oe(r.attributes.name) === 'verification' ||
						oe(r.attributes.name) === 'shopify-checkout-api-token')
				)
					return !0
			}
		}
		return !1
	}
	function cr(r, e) {
		const {
			doc: t,
			mirror: n,
			blockClass: i,
			blockSelector: s,
			maskTextClass: o,
			maskTextSelector: l,
			skipChild: a = !1,
			inlineStylesheet: c = !0,
			maskInputOptions: u = {},
			maskTextFn: d,
			maskInputFn: h,
			slimDOMOptions: p,
			dataURLOptions: y = {},
			inlineImages: f = !1,
			recordCanvas: m = !1,
			onSerialize: g,
			onIframeLoad: v,
			iframeLoadTimeout: S = 5e3,
			onStylesheetLoad: I,
			stylesheetLoadTimeout: G = 5e3,
			keepIframeSrcFn: L = () => !1,
			newlyAddedElement: w = !1,
			cssCaptured: V = !1,
			privacySetting: P,
		} = e
		let { needsMask: X } = e,
			{ preserveWhiteSpace: $ = !0 } = e
		X || (X = id(r, o, l, X === void 0))
		const be = uR(r, {
			doc: t,
			mirror: n,
			blockClass: i,
			blockSelector: s,
			needsMask: X,
			inlineStylesheet: c,
			maskInputOptions: u,
			maskTextClass: o,
			maskTextFn: d,
			maskInputFn: h,
			dataURLOptions: y,
			inlineImages: f,
			recordCanvas: m,
			keepIframeSrcFn: L,
			newlyAddedElement: w,
			cssCaptured: V,
			privacySetting: P,
		})
		if (!be) return console.warn(r, 'not serialized'), null
		let ve
		n.hasNode(r)
			? (ve = n.getId(r))
			: fR(be, p) ||
				  (!$ &&
						be.type === me.Text &&
						!be.textContent.replace(/^\s+|\s+$/gm, '').length)
				? (ve = Kr)
				: (ve = $u())
		const b = Object.assign(be, { id: ve })
		if ((n.add(r, b), ve === Kr)) return null
		g && g(r)
		let T = !a,
			x = P,
			ie = P === 'strict'
		if (b.type === me.Element) {
			if (
				((T = T && !b.needBlock),
				ie || (ie = !!b.needBlock || !!b.needMask),
				(x = ie ? 'strict' : x),
				ie && Fo(b.tagName))
			) {
				const pe = r.cloneNode()
				;(pe.src = ''), n.add(pe, b)
			}
			delete b.needBlock, delete b.needMask
			const W = Re.shadowRoot(r)
			W && Hr(W) && (b.isShadowHost = !0)
		}
		if ((b.type === me.Document || b.type === me.Element) && T) {
			p.headWhitespace &&
				b.type === me.Element &&
				b.tagName === 'head' &&
				($ = !1)
			const W = {
				doc: t,
				mirror: n,
				blockClass: i,
				blockSelector: s,
				needsMask: X,
				maskTextClass: o,
				maskTextSelector: l,
				skipChild: a,
				inlineStylesheet: c,
				maskInputOptions: u,
				maskTextFn: d,
				maskInputFn: h,
				slimDOMOptions: p,
				dataURLOptions: y,
				inlineImages: f,
				recordCanvas: m,
				preserveWhiteSpace: $,
				onSerialize: g,
				onIframeLoad: v,
				iframeLoadTimeout: S,
				onStylesheetLoad: I,
				stylesheetLoadTimeout: G,
				keepIframeSrcFn: L,
				cssCaptured: !1,
				privacySetting: x,
			}
			if (
				!(
					b.type === me.Element &&
					b.tagName === 'textarea' &&
					b.attributes.value !== void 0
				)
			) {
				b.type === me.Element &&
					b.attributes._cssText !== void 0 &&
					typeof b.attributes._cssText == 'string' &&
					(W.cssCaptured = !0)
				for (const _e of Array.from(Re.childNodes(r))) {
					const Ye = cr(_e, W)
					Ye && b.childNodes.push(Ye)
				}
			}
			let pe = null
			if (Hu(r) && (pe = Re.shadowRoot(r)))
				for (const _e of Array.from(Re.childNodes(pe))) {
					const Ye = cr(_e, W)
					Ye && (Hr(pe) && (Ye.isShadow = !0), b.childNodes.push(Ye))
				}
		}
		const D = Re.parentNode(r)
		return (
			D && Jr(D) && Hr(D) && (b.isShadow = !0),
			b.type === me.Element &&
				b.tagName === 'iframe' &&
				lR(
					r,
					() => {
						const W = r.contentDocument
						if (W && v) {
							const pe = cr(W, {
								doc: W,
								mirror: n,
								blockClass: i,
								blockSelector: s,
								needsMask: X,
								maskTextClass: o,
								maskTextSelector: l,
								skipChild: !1,
								inlineStylesheet: c,
								maskInputOptions: u,
								maskTextFn: d,
								maskInputFn: h,
								slimDOMOptions: p,
								dataURLOptions: y,
								inlineImages: f,
								recordCanvas: m,
								preserveWhiteSpace: $,
								onSerialize: g,
								onIframeLoad: v,
								iframeLoadTimeout: S,
								onStylesheetLoad: I,
								stylesheetLoadTimeout: G,
								keepIframeSrcFn: L,
								privacySetting: P,
							})
							pe && v(r, pe)
						}
					},
					S,
				),
			b.type === me.Element &&
				b.tagName === 'link' &&
				typeof b.attributes.rel == 'string' &&
				(b.attributes.rel === 'stylesheet' ||
					(b.attributes.rel === 'preload' &&
						typeof b.attributes.href == 'string' &&
						Du(b.attributes.href) === 'css')) &&
				cR(
					r,
					() => {
						if (I) {
							const W = cr(r, {
								doc: t,
								mirror: n,
								blockClass: i,
								blockSelector: s,
								needsMask: X,
								maskTextClass: o,
								maskTextSelector: l,
								skipChild: !1,
								inlineStylesheet: c,
								maskInputOptions: u,
								maskTextFn: d,
								maskInputFn: h,
								slimDOMOptions: p,
								dataURLOptions: y,
								inlineImages: f,
								recordCanvas: m,
								preserveWhiteSpace: $,
								onSerialize: g,
								onIframeLoad: v,
								iframeLoadTimeout: S,
								onStylesheetLoad: I,
								stylesheetLoadTimeout: G,
								keepIframeSrcFn: L,
								privacySetting: P,
							})
							W && I(r, W)
						}
					},
					G,
				),
			b
		)
	}
	function mR(r, e) {
		const {
			mirror: t = new Bu(),
			blockClass: n = 'highlight-block',
			blockSelector: i = null,
			maskTextClass: s = 'highlight-mask',
			maskTextSelector: o = null,
			inlineStylesheet: l = !0,
			inlineImages: a = !1,
			recordCanvas: c = !1,
			maskAllInputs: u = !1,
			maskTextFn: d,
			maskInputFn: h,
			slimDOM: p = !1,
			dataURLOptions: y,
			preserveWhiteSpace: f,
			onSerialize: m,
			onIframeLoad: g,
			iframeLoadTimeout: v,
			onStylesheetLoad: S,
			stylesheetLoadTimeout: I,
			keepIframeSrcFn: G = () => !1,
			privacySetting: L = 'default',
		} = e || {}
		return cr(r, {
			doc: r,
			mirror: t,
			blockClass: n,
			blockSelector: i,
			maskTextClass: s,
			maskTextSelector: o,
			skipChild: !1,
			inlineStylesheet: l,
			maskInputOptions:
				u === !0
					? {
							color: !0,
							date: !0,
							'datetime-local': !0,
							email: !0,
							month: !0,
							number: !0,
							range: !0,
							search: !0,
							tel: !0,
							text: !0,
							time: !0,
							url: !0,
							week: !0,
							textarea: !0,
							select: !0,
							password: !0,
						}
					: u === !1
						? { password: !0 }
						: u,
			maskTextFn: d,
			maskInputFn: h,
			slimDOMOptions:
				p || p === 'all'
					? {
							script: !0,
							comment: !0,
							headFavicon: !0,
							headWhitespace: !0,
							headMetaDescKeywords: p === 'all',
							headMetaSocial: !0,
							headMetaRobots: !0,
							headMetaHttpEquiv: !0,
							headMetaAuthorship: !0,
							headMetaVerification: !0,
						}
					: p || {},
			dataURLOptions: y,
			inlineImages: a,
			recordCanvas: c,
			preserveWhiteSpace: f,
			onSerialize: m,
			onIframeLoad: g,
			iframeLoadTimeout: v,
			onStylesheetLoad: S,
			stylesheetLoadTimeout: I,
			keepIframeSrcFn: G,
			newlyAddedElement: !1,
			privacySetting: L,
		})
	}
	function yR(r) {
		if (r.__esModule) return r
		var e = r.default
		if (typeof e == 'function') {
			var t = function n() {
				return this instanceof n
					? Reflect.construct(e, arguments, this.constructor)
					: e.apply(this, arguments)
			}
			t.prototype = e.prototype
		} else t = {}
		return (
			Object.defineProperty(t, '__esModule', { value: !0 }),
			Object.keys(r).forEach(function (n) {
				var i = Object.getOwnPropertyDescriptor(r, n)
				Object.defineProperty(
					t,
					n,
					i.get
						? i
						: {
								enumerable: !0,
								get: function () {
									return r[n]
								},
							},
				)
			}),
			t
		)
	}
	var Ho = { exports: {} },
		A = String,
		sd = function () {
			return {
				isColorSupported: !1,
				reset: A,
				bold: A,
				dim: A,
				italic: A,
				underline: A,
				inverse: A,
				hidden: A,
				strikethrough: A,
				black: A,
				red: A,
				green: A,
				yellow: A,
				blue: A,
				magenta: A,
				cyan: A,
				white: A,
				gray: A,
				bgBlack: A,
				bgRed: A,
				bgGreen: A,
				bgYellow: A,
				bgBlue: A,
				bgMagenta: A,
				bgCyan: A,
				bgWhite: A,
				blackBright: A,
				redBright: A,
				greenBright: A,
				yellowBright: A,
				blueBright: A,
				magentaBright: A,
				cyanBright: A,
				whiteBright: A,
				bgBlackBright: A,
				bgRedBright: A,
				bgGreenBright: A,
				bgYellowBright: A,
				bgBlueBright: A,
				bgMagentaBright: A,
				bgCyanBright: A,
				bgWhiteBright: A,
			}
		}
	;(Ho.exports = sd()), (Ho.exports.createColors = sd)
	var bR = Ho.exports
	const Be = yR(
		Object.freeze(
			Object.defineProperty(
				{ __proto__: null, default: {} },
				Symbol.toStringTag,
				{ value: 'Module' },
			),
		),
	)
	let od = bR,
		ad = Be,
		Ko = class Ef extends Error {
			constructor(e, t, n, i, s, o) {
				super(e),
					(this.name = 'CssSyntaxError'),
					(this.reason = e),
					s && (this.file = s),
					i && (this.source = i),
					o && (this.plugin = o),
					typeof t != 'undefined' &&
						typeof n != 'undefined' &&
						(typeof t == 'number'
							? ((this.line = t), (this.column = n))
							: ((this.line = t.line),
								(this.column = t.column),
								(this.endLine = n.line),
								(this.endColumn = n.column))),
					this.setMessage(),
					Error.captureStackTrace && Error.captureStackTrace(this, Ef)
			}
			setMessage() {
				;(this.message = this.plugin ? this.plugin + ': ' : ''),
					(this.message += this.file ? this.file : '<css input>'),
					typeof this.line != 'undefined' &&
						(this.message += ':' + this.line + ':' + this.column),
					(this.message += ': ' + this.reason)
			}
			showSourceCode(e) {
				if (!this.source) return ''
				let t = this.source
				e == null && (e = od.isColorSupported)
				let n = (u) => u,
					i = (u) => u,
					s = (u) => u
				if (e) {
					let { bold: u, gray: d, red: h } = od.createColors(!0)
					;(i = (p) => u(h(p))),
						(n = (p) => d(p)),
						ad && (s = (p) => ad(p))
				}
				let o = t.split(/\r?\n/),
					l = Math.max(this.line - 3, 0),
					a = Math.min(this.line + 2, o.length),
					c = String(a).length
				return o.slice(l, a).map((u, d) => {
					let h = l + 1 + d,
						p = ' ' + (' ' + h).slice(-c) + ' | '
					if (h === this.line) {
						if (u.length > 160) {
							let f = 20,
								m = Math.max(0, this.column - f),
								g = Math.max(
									this.column + f,
									this.endColumn + f,
								),
								v = u.slice(m, g),
								S =
									n(p.replace(/\d/g, ' ')) +
									u
										.slice(
											0,
											Math.min(this.column - 1, f - 1),
										)
										.replace(/[^\t]/g, ' ')
							return (
								i('>') +
								n(p) +
								s(v) +
								`
 ` +
								S +
								i('^')
							)
						}
						let y =
							n(p.replace(/\d/g, ' ')) +
							u.slice(0, this.column - 1).replace(/[^\t]/g, ' ')
						return (
							i('>') +
							n(p) +
							s(u) +
							`
 ` +
							y +
							i('^')
						)
					}
					return ' ' + n(p) + s(u)
				}).join(`
`)
			}
			toString() {
				let e = this.showSourceCode()
				return (
					e &&
						(e =
							`

` +
							e +
							`
`),
					this.name + ': ' + this.message + e
				)
			}
		}
	var Bo = Ko
	Ko.default = Ko
	const ld = {
		after: `
`,
		beforeClose: `
`,
		beforeComment: `
`,
		beforeDecl: `
`,
		beforeOpen: ' ',
		beforeRule: `
`,
		colon: ': ',
		commentLeft: ' ',
		commentRight: ' ',
		emptyBody: '',
		indent: '    ',
		semicolon: !1,
	}
	function gR(r) {
		return r[0].toUpperCase() + r.slice(1)
	}
	let zo = class {
		constructor(e) {
			this.builder = e
		}
		atrule(e, t) {
			let n = '@' + e.name,
				i = e.params ? this.rawValue(e, 'params') : ''
			if (
				(typeof e.raws.afterName != 'undefined'
					? (n += e.raws.afterName)
					: i && (n += ' '),
				e.nodes)
			)
				this.block(e, n + i)
			else {
				let s = (e.raws.between || '') + (t ? ';' : '')
				this.builder(n + i + s, e)
			}
		}
		beforeAfter(e, t) {
			let n
			e.type === 'decl'
				? (n = this.raw(e, null, 'beforeDecl'))
				: e.type === 'comment'
					? (n = this.raw(e, null, 'beforeComment'))
					: t === 'before'
						? (n = this.raw(e, null, 'beforeRule'))
						: (n = this.raw(e, null, 'beforeClose'))
			let i = e.parent,
				s = 0
			for (; i && i.type !== 'root'; ) (s += 1), (i = i.parent)
			if (
				n.includes(`
`)
			) {
				let o = this.raw(e, null, 'indent')
				if (o.length) for (let l = 0; l < s; l++) n += o
			}
			return n
		}
		block(e, t) {
			let n = this.raw(e, 'between', 'beforeOpen')
			this.builder(t + n + '{', e, 'start')
			let i
			e.nodes && e.nodes.length
				? (this.body(e), (i = this.raw(e, 'after')))
				: (i = this.raw(e, 'after', 'emptyBody')),
				i && this.builder(i),
				this.builder('}', e, 'end')
		}
		body(e) {
			let t = e.nodes.length - 1
			for (; t > 0 && e.nodes[t].type === 'comment'; ) t -= 1
			let n = this.raw(e, 'semicolon')
			for (let i = 0; i < e.nodes.length; i++) {
				let s = e.nodes[i],
					o = this.raw(s, 'before')
				o && this.builder(o), this.stringify(s, t !== i || n)
			}
		}
		comment(e) {
			let t = this.raw(e, 'left', 'commentLeft'),
				n = this.raw(e, 'right', 'commentRight')
			this.builder('/*' + t + e.text + n + '*/', e)
		}
		decl(e, t) {
			let n = this.raw(e, 'between', 'colon'),
				i = e.prop + n + this.rawValue(e, 'value')
			e.important && (i += e.raws.important || ' !important'),
				t && (i += ';'),
				this.builder(i, e)
		}
		document(e) {
			this.body(e)
		}
		raw(e, t, n) {
			let i
			if ((n || (n = t), t && ((i = e.raws[t]), typeof i != 'undefined')))
				return i
			let s = e.parent
			if (
				n === 'before' &&
				(!s ||
					(s.type === 'root' && s.first === e) ||
					(s && s.type === 'document'))
			)
				return ''
			if (!s) return ld[n]
			let o = e.root()
			if (
				(o.rawCache || (o.rawCache = {}),
				typeof o.rawCache[n] != 'undefined')
			)
				return o.rawCache[n]
			if (n === 'before' || n === 'after') return this.beforeAfter(e, n)
			{
				let l = 'raw' + gR(n)
				this[l]
					? (i = this[l](o, e))
					: o.walk((a) => {
							if (((i = a.raws[t]), typeof i != 'undefined'))
								return !1
						})
			}
			return (
				typeof i == 'undefined' && (i = ld[n]), (o.rawCache[n] = i), i
			)
		}
		rawBeforeClose(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length > 0 &&
						typeof n.raws.after != 'undefined'
					)
						return (
							(t = n.raws.after),
							t.includes(`
`) && (t = t.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				t && (t = t.replace(/\S/g, '')),
				t
			)
		}
		rawBeforeComment(e, t) {
			let n
			return (
				e.walkComments((i) => {
					if (typeof i.raws.before != 'undefined')
						return (
							(n = i.raws.before),
							n.includes(`
`) && (n = n.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				typeof n == 'undefined'
					? (n = this.raw(t, null, 'beforeDecl'))
					: n && (n = n.replace(/\S/g, '')),
				n
			)
		}
		rawBeforeDecl(e, t) {
			let n
			return (
				e.walkDecls((i) => {
					if (typeof i.raws.before != 'undefined')
						return (
							(n = i.raws.before),
							n.includes(`
`) && (n = n.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				typeof n == 'undefined'
					? (n = this.raw(t, null, 'beforeRule'))
					: n && (n = n.replace(/\S/g, '')),
				n
			)
		}
		rawBeforeOpen(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.type !== 'decl' &&
						((t = n.raws.between), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawBeforeRule(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						(n.parent !== e || e.first !== n) &&
						typeof n.raws.before != 'undefined'
					)
						return (
							(t = n.raws.before),
							t.includes(`
`) && (t = t.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				t && (t = t.replace(/\S/g, '')),
				t
			)
		}
		rawColon(e) {
			let t
			return (
				e.walkDecls((n) => {
					if (typeof n.raws.between != 'undefined')
						return (t = n.raws.between.replace(/[^\s:]/g, '')), !1
				}),
				t
			)
		}
		rawEmptyBody(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length === 0 &&
						((t = n.raws.after), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawIndent(e) {
			if (e.raws.indent) return e.raws.indent
			let t
			return (
				e.walk((n) => {
					let i = n.parent
					if (
						i &&
						i !== e &&
						i.parent &&
						i.parent === e &&
						typeof n.raws.before != 'undefined'
					) {
						let s = n.raws.before.split(`
`)
						return (
							(t = s[s.length - 1]),
							(t = t.replace(/\S/g, '')),
							!1
						)
					}
				}),
				t
			)
		}
		rawSemicolon(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length &&
						n.last.type === 'decl' &&
						((t = n.raws.semicolon), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawValue(e, t) {
			let n = e[t],
				i = e.raws[t]
			return i && i.value === n ? i.raw : n
		}
		root(e) {
			this.body(e), e.raws.after && this.builder(e.raws.after)
		}
		rule(e) {
			this.block(e, this.rawValue(e, 'selector')),
				e.raws.ownSemicolon &&
					this.builder(e.raws.ownSemicolon, e, 'end')
		}
		stringify(e, t) {
			if (!this[e.type])
				throw new Error(
					'Unknown AST node type ' +
						e.type +
						'. Maybe you need to change PostCSS stringifier.',
				)
			this[e.type](e, t)
		}
	}
	var cd = zo
	zo.default = zo
	let SR = cd
	function Do(r, e) {
		new SR(e).stringify(r)
	}
	var ci = Do
	Do.default = Do
	var Br = {}
	;(Br.isClean = Symbol('isClean')), (Br.my = Symbol('my'))
	let vR = Bo,
		RR = cd,
		IR = ci,
		{ isClean: zr, my: wR } = Br
	function jo(r, e) {
		let t = new r.constructor()
		for (let n in r) {
			if (
				!Object.prototype.hasOwnProperty.call(r, n) ||
				n === 'proxyCache'
			)
				continue
			let i = r[n],
				s = typeof i
			n === 'parent' && s === 'object'
				? e && (t[n] = e)
				: n === 'source'
					? (t[n] = i)
					: Array.isArray(i)
						? (t[n] = i.map((o) => jo(o, t)))
						: (s === 'object' && i !== null && (i = jo(i)),
							(t[n] = i))
		}
		return t
	}
	let Qo = class {
		constructor(e = {}) {
			;(this.raws = {}), (this[zr] = !1), (this[wR] = !0)
			for (let t in e)
				if (t === 'nodes') {
					this.nodes = []
					for (let n of e[t])
						typeof n.clone == 'function'
							? this.append(n.clone())
							: this.append(n)
				} else this[t] = e[t]
		}
		addToError(e) {
			if (
				((e.postcssNode = this),
				e.stack && this.source && /\n\s{4}at /.test(e.stack))
			) {
				let t = this.source
				e.stack = e.stack.replace(
					/\n\s{4}at /,
					`$&${t.input.from}:${t.start.line}:${t.start.column}$&`,
				)
			}
			return e
		}
		after(e) {
			return this.parent.insertAfter(this, e), this
		}
		assign(e = {}) {
			for (let t in e) this[t] = e[t]
			return this
		}
		before(e) {
			return this.parent.insertBefore(this, e), this
		}
		cleanRaws(e) {
			delete this.raws.before,
				delete this.raws.after,
				e || delete this.raws.between
		}
		clone(e = {}) {
			let t = jo(this)
			for (let n in e) t[n] = e[n]
			return t
		}
		cloneAfter(e = {}) {
			let t = this.clone(e)
			return this.parent.insertAfter(this, t), t
		}
		cloneBefore(e = {}) {
			let t = this.clone(e)
			return this.parent.insertBefore(this, t), t
		}
		error(e, t = {}) {
			if (this.source) {
				let { end: n, start: i } = this.rangeBy(t)
				return this.source.input.error(
					e,
					{ column: i.column, line: i.line },
					{ column: n.column, line: n.line },
					t,
				)
			}
			return new vR(e)
		}
		getProxyProcessor() {
			return {
				get(e, t) {
					return t === 'proxyOf'
						? e
						: t === 'root'
							? () => e.root().toProxy()
							: e[t]
				},
				set(e, t, n) {
					return (
						e[t] === n ||
							((e[t] = n),
							(t === 'prop' ||
								t === 'value' ||
								t === 'name' ||
								t === 'params' ||
								t === 'important' ||
								t === 'text') &&
								e.markDirty()),
						!0
					)
				},
			}
		}
		markClean() {
			this[zr] = !0
		}
		markDirty() {
			if (this[zr]) {
				this[zr] = !1
				let e = this
				for (; (e = e.parent); ) e[zr] = !1
			}
		}
		next() {
			if (!this.parent) return
			let e = this.parent.index(this)
			return this.parent.nodes[e + 1]
		}
		positionBy(e, t) {
			let n = this.source.start
			if (e.index) n = this.positionInside(e.index, t)
			else if (e.word) {
				t = this.toString()
				let i = t.indexOf(e.word)
				i !== -1 && (n = this.positionInside(i, t))
			}
			return n
		}
		positionInside(e, t) {
			let n = t || this.toString(),
				i = this.source.start.column,
				s = this.source.start.line
			for (let o = 0; o < e; o++)
				n[o] ===
				`
`
					? ((i = 1), (s += 1))
					: (i += 1)
			return { column: i, line: s }
		}
		prev() {
			if (!this.parent) return
			let e = this.parent.index(this)
			return this.parent.nodes[e - 1]
		}
		rangeBy(e) {
			let t = {
					column: this.source.start.column,
					line: this.source.start.line,
				},
				n = this.source.end
					? {
							column: this.source.end.column + 1,
							line: this.source.end.line,
						}
					: { column: t.column + 1, line: t.line }
			if (e.word) {
				let i = this.toString(),
					s = i.indexOf(e.word)
				s !== -1 &&
					((t = this.positionInside(s, i)),
					(n = this.positionInside(s + e.word.length, i)))
			} else
				e.start
					? (t = { column: e.start.column, line: e.start.line })
					: e.index && (t = this.positionInside(e.index)),
					e.end
						? (n = { column: e.end.column, line: e.end.line })
						: typeof e.endIndex == 'number'
							? (n = this.positionInside(e.endIndex))
							: e.index && (n = this.positionInside(e.index + 1))
			return (
				(n.line < t.line ||
					(n.line === t.line && n.column <= t.column)) &&
					(n = { column: t.column + 1, line: t.line }),
				{ end: n, start: t }
			)
		}
		raw(e, t) {
			return new RR().raw(this, e, t)
		}
		remove() {
			return (
				this.parent && this.parent.removeChild(this),
				(this.parent = void 0),
				this
			)
		}
		replaceWith(...e) {
			if (this.parent) {
				let t = this,
					n = !1
				for (let i of e)
					i === this
						? (n = !0)
						: n
							? (this.parent.insertAfter(t, i), (t = i))
							: this.parent.insertBefore(t, i)
				n || this.remove()
			}
			return this
		}
		root() {
			let e = this
			for (; e.parent && e.parent.type !== 'document'; ) e = e.parent
			return e
		}
		toJSON(e, t) {
			let n = {},
				i = t == null
			t = t || new Map()
			let s = 0
			for (let o in this) {
				if (
					!Object.prototype.hasOwnProperty.call(this, o) ||
					o === 'parent' ||
					o === 'proxyCache'
				)
					continue
				let l = this[o]
				if (Array.isArray(l))
					n[o] = l.map((a) =>
						typeof a == 'object' && a.toJSON
							? a.toJSON(null, t)
							: a,
					)
				else if (typeof l == 'object' && l.toJSON)
					n[o] = l.toJSON(null, t)
				else if (o === 'source') {
					let a = t.get(l.input)
					a == null && ((a = s), t.set(l.input, s), s++),
						(n[o] = { end: l.end, inputId: a, start: l.start })
				} else n[o] = l
			}
			return i && (n.inputs = [...t.keys()].map((o) => o.toJSON())), n
		}
		toProxy() {
			return (
				this.proxyCache ||
					(this.proxyCache = new Proxy(
						this,
						this.getProxyProcessor(),
					)),
				this.proxyCache
			)
		}
		toString(e = IR) {
			e.stringify && (e = e.stringify)
			let t = ''
			return (
				e(this, (n) => {
					t += n
				}),
				t
			)
		}
		warn(e, t, n) {
			let i = { node: this }
			for (let s in n) i[s] = n[s]
			return e.warn(t, i)
		}
		get proxyOf() {
			return this
		}
	}
	var ui = Qo
	Qo.default = Qo
	let ZR = ui,
		$o = class extends ZR {
			constructor(e) {
				super(e), (this.type = 'comment')
			}
		}
	var di = $o
	$o.default = $o
	let TR = ui,
		qo = class extends TR {
			constructor(e) {
				e &&
					typeof e.value != 'undefined' &&
					typeof e.value != 'string' &&
					(e = q(Z({}, e), { value: String(e.value) })),
					super(e),
					(this.type = 'decl')
			}
			get variable() {
				return this.prop.startsWith('--') || this.prop[0] === '$'
			}
		}
	var hi = qo
	qo.default = qo
	let ud = di,
		dd = hi,
		ER = ui,
		{ isClean: hd, my: pd } = Br,
		ea,
		fd,
		md,
		ta
	function yd(r) {
		return r.map(
			(e) => (e.nodes && (e.nodes = yd(e.nodes)), delete e.source, e),
		)
	}
	function bd(r) {
		if (((r[hd] = !1), r.proxyOf.nodes))
			for (let e of r.proxyOf.nodes) bd(e)
	}
	let mt = class Cf extends ER {
		append(...e) {
			for (let t of e) {
				let n = this.normalize(t, this.last)
				for (let i of n) this.proxyOf.nodes.push(i)
			}
			return this.markDirty(), this
		}
		cleanRaws(e) {
			if ((super.cleanRaws(e), this.nodes))
				for (let t of this.nodes) t.cleanRaws(e)
		}
		each(e) {
			if (!this.proxyOf.nodes) return
			let t = this.getIterator(),
				n,
				i
			for (
				;
				this.indexes[t] < this.proxyOf.nodes.length &&
				((n = this.indexes[t]),
				(i = e(this.proxyOf.nodes[n], n)),
				i !== !1);

			)
				this.indexes[t] += 1
			return delete this.indexes[t], i
		}
		every(e) {
			return this.nodes.every(e)
		}
		getIterator() {
			this.lastEach || (this.lastEach = 0),
				this.indexes || (this.indexes = {}),
				(this.lastEach += 1)
			let e = this.lastEach
			return (this.indexes[e] = 0), e
		}
		getProxyProcessor() {
			return {
				get(e, t) {
					return t === 'proxyOf'
						? e
						: e[t]
							? t === 'each' ||
								(typeof t == 'string' && t.startsWith('walk'))
								? (...n) =>
										e[t](
											...n.map((i) =>
												typeof i == 'function'
													? (s, o) =>
															i(s.toProxy(), o)
													: i,
											),
										)
								: t === 'every' || t === 'some'
									? (n) =>
											e[t]((i, ...s) =>
												n(i.toProxy(), ...s),
											)
									: t === 'root'
										? () => e.root().toProxy()
										: t === 'nodes'
											? e.nodes.map((n) => n.toProxy())
											: t === 'first' || t === 'last'
												? e[t].toProxy()
												: e[t]
							: e[t]
				},
				set(e, t, n) {
					return (
						e[t] === n ||
							((e[t] = n),
							(t === 'name' ||
								t === 'params' ||
								t === 'selector') &&
								e.markDirty()),
						!0
					)
				},
			}
		}
		index(e) {
			return typeof e == 'number'
				? e
				: (e.proxyOf && (e = e.proxyOf), this.proxyOf.nodes.indexOf(e))
		}
		insertAfter(e, t) {
			let n = this.index(e),
				i = this.normalize(t, this.proxyOf.nodes[n]).reverse()
			n = this.index(e)
			for (let o of i) this.proxyOf.nodes.splice(n + 1, 0, o)
			let s
			for (let o in this.indexes)
				(s = this.indexes[o]), n < s && (this.indexes[o] = s + i.length)
			return this.markDirty(), this
		}
		insertBefore(e, t) {
			let n = this.index(e),
				i = n === 0 ? 'prepend' : !1,
				s = this.normalize(t, this.proxyOf.nodes[n], i).reverse()
			n = this.index(e)
			for (let l of s) this.proxyOf.nodes.splice(n, 0, l)
			let o
			for (let l in this.indexes)
				(o = this.indexes[l]),
					n <= o && (this.indexes[l] = o + s.length)
			return this.markDirty(), this
		}
		normalize(e, t) {
			if (typeof e == 'string') e = yd(fd(e).nodes)
			else if (typeof e == 'undefined') e = []
			else if (Array.isArray(e)) {
				e = e.slice(0)
				for (let i of e) i.parent && i.parent.removeChild(i, 'ignore')
			} else if (e.type === 'root' && this.type !== 'document') {
				e = e.nodes.slice(0)
				for (let i of e) i.parent && i.parent.removeChild(i, 'ignore')
			} else if (e.type) e = [e]
			else if (e.prop) {
				if (typeof e.value == 'undefined')
					throw new Error('Value field is missed in node creation')
				typeof e.value != 'string' && (e.value = String(e.value)),
					(e = [new dd(e)])
			} else if (e.selector || e.selectors) e = [new ta(e)]
			else if (e.name) e = [new ea(e)]
			else if (e.text) e = [new ud(e)]
			else throw new Error('Unknown node type in node creation')
			return e.map(
				(i) => (
					i[pd] || Cf.rebuild(i),
					(i = i.proxyOf),
					i.parent && i.parent.removeChild(i),
					i[hd] && bd(i),
					i.raws || (i.raws = {}),
					typeof i.raws.before == 'undefined' &&
						t &&
						typeof t.raws.before != 'undefined' &&
						(i.raws.before = t.raws.before.replace(/\S/g, '')),
					(i.parent = this.proxyOf),
					i
				),
			)
		}
		prepend(...e) {
			e = e.reverse()
			for (let t of e) {
				let n = this.normalize(t, this.first, 'prepend').reverse()
				for (let i of n) this.proxyOf.nodes.unshift(i)
				for (let i in this.indexes)
					this.indexes[i] = this.indexes[i] + n.length
			}
			return this.markDirty(), this
		}
		push(e) {
			return (e.parent = this), this.proxyOf.nodes.push(e), this
		}
		removeAll() {
			for (let e of this.proxyOf.nodes) e.parent = void 0
			return (this.proxyOf.nodes = []), this.markDirty(), this
		}
		removeChild(e) {
			;(e = this.index(e)),
				(this.proxyOf.nodes[e].parent = void 0),
				this.proxyOf.nodes.splice(e, 1)
			let t
			for (let n in this.indexes)
				(t = this.indexes[n]), t >= e && (this.indexes[n] = t - 1)
			return this.markDirty(), this
		}
		replaceValues(e, t, n) {
			return (
				n || ((n = t), (t = {})),
				this.walkDecls((i) => {
					;(t.props && !t.props.includes(i.prop)) ||
						(t.fast && !i.value.includes(t.fast)) ||
						(i.value = i.value.replace(e, n))
				}),
				this.markDirty(),
				this
			)
		}
		some(e) {
			return this.nodes.some(e)
		}
		walk(e) {
			return this.each((t, n) => {
				let i
				try {
					i = e(t, n)
				} catch (s) {
					throw t.addToError(s)
				}
				return i !== !1 && t.walk && (i = t.walk(e)), i
			})
		}
		walkAtRules(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'atrule' && e.test(n.name))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'atrule' && n.name === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'atrule') return t(n, i)
					}))
		}
		walkComments(e) {
			return this.walk((t, n) => {
				if (t.type === 'comment') return e(t, n)
			})
		}
		walkDecls(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'decl' && e.test(n.prop))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'decl' && n.prop === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'decl') return t(n, i)
					}))
		}
		walkRules(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'rule' && e.test(n.selector))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'rule' && n.selector === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'rule') return t(n, i)
					}))
		}
		get first() {
			if (this.proxyOf.nodes) return this.proxyOf.nodes[0]
		}
		get last() {
			if (this.proxyOf.nodes)
				return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
		}
	}
	;(mt.registerParse = (r) => {
		fd = r
	}),
		(mt.registerRule = (r) => {
			ta = r
		}),
		(mt.registerAtRule = (r) => {
			ea = r
		}),
		(mt.registerRoot = (r) => {
			md = r
		})
	var Mt = mt
	;(mt.default = mt),
		(mt.rebuild = (r) => {
			r.type === 'atrule'
				? Object.setPrototypeOf(r, ea.prototype)
				: r.type === 'rule'
					? Object.setPrototypeOf(r, ta.prototype)
					: r.type === 'decl'
						? Object.setPrototypeOf(r, dd.prototype)
						: r.type === 'comment'
							? Object.setPrototypeOf(r, ud.prototype)
							: r.type === 'root' &&
								Object.setPrototypeOf(r, md.prototype),
				(r[pd] = !0),
				r.nodes &&
					r.nodes.forEach((e) => {
						mt.rebuild(e)
					})
		})
	let gd = Mt,
		pi = class extends gd {
			constructor(e) {
				super(e), (this.type = 'atrule')
			}
			append(...e) {
				return (
					this.proxyOf.nodes || (this.nodes = []), super.append(...e)
				)
			}
			prepend(...e) {
				return (
					this.proxyOf.nodes || (this.nodes = []), super.prepend(...e)
				)
			}
		}
	var ra = pi
	;(pi.default = pi), gd.registerAtRule(pi)
	let CR = Mt,
		Sd,
		vd,
		Dr = class extends CR {
			constructor(e) {
				super(Z({ type: 'document' }, e)),
					this.nodes || (this.nodes = [])
			}
			toResult(e = {}) {
				return new Sd(new vd(), this, e).stringify()
			}
		}
	;(Dr.registerLazyResult = (r) => {
		Sd = r
	}),
		(Dr.registerProcessor = (r) => {
			vd = r
		})
	var na = Dr
	Dr.default = Dr
	let GR = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
	var VR = {
		nanoid: (r = 21) => {
			let e = '',
				t = r
			for (; t--; ) e += GR[(Math.random() * 64) | 0]
			return e
		},
		customAlphabet:
			(r, e = 21) =>
			(t = e) => {
				let n = '',
					i = t
				for (; i--; ) n += r[(Math.random() * r.length) | 0]
				return n
			},
	}
	let { existsSync: NR, readFileSync: LR } = Be,
		{ dirname: ia, join: XR } = Be,
		{ SourceMapConsumer: Rd, SourceMapGenerator: Id } = Be
	function WR(r) {
		return Buffer ? Buffer.from(r, 'base64').toString() : window.atob(r)
	}
	let sa = class {
		constructor(e, t) {
			if (t.map === !1) return
			this.loadAnnotation(e),
				(this.inline = this.startWith(this.annotation, 'data:'))
			let n = t.map ? t.map.prev : void 0,
				i = this.loadMap(t.from, n)
			!this.mapFile && t.from && (this.mapFile = t.from),
				this.mapFile && (this.root = ia(this.mapFile)),
				i && (this.text = i)
		}
		consumer() {
			return (
				this.consumerCache || (this.consumerCache = new Rd(this.text)),
				this.consumerCache
			)
		}
		decodeInline(e) {
			let t = /^data:application\/json;charset=utf-?8;base64,/,
				n = /^data:application\/json;base64,/,
				i = /^data:application\/json;charset=utf-?8,/,
				s = /^data:application\/json,/,
				o = e.match(i) || e.match(s)
			if (o) return decodeURIComponent(e.substr(o[0].length))
			let l = e.match(t) || e.match(n)
			if (l) return WR(e.substr(l[0].length))
			let a = e.match(/data:application\/json;([^,]+),/)[1]
			throw new Error('Unsupported source map encoding ' + a)
		}
		getAnnotationURL(e) {
			return e.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
		}
		isMap(e) {
			return typeof e != 'object'
				? !1
				: typeof e.mappings == 'string' ||
						typeof e._mappings == 'string' ||
						Array.isArray(e.sections)
		}
		loadAnnotation(e) {
			let t = e.match(/\/\*\s*# sourceMappingURL=/g)
			if (!t) return
			let n = e.lastIndexOf(t.pop()),
				i = e.indexOf('*/', n)
			n > -1 &&
				i > -1 &&
				(this.annotation = this.getAnnotationURL(e.substring(n, i)))
		}
		loadFile(e) {
			if (((this.root = ia(e)), NR(e)))
				return (this.mapFile = e), LR(e, 'utf-8').toString().trim()
		}
		loadMap(e, t) {
			if (t === !1) return !1
			if (t) {
				if (typeof t == 'string') return t
				if (typeof t == 'function') {
					let n = t(e)
					if (n) {
						let i = this.loadFile(n)
						if (!i)
							throw new Error(
								'Unable to load previous source map: ' +
									n.toString(),
							)
						return i
					}
				} else {
					if (t instanceof Rd) return Id.fromSourceMap(t).toString()
					if (t instanceof Id) return t.toString()
					if (this.isMap(t)) return JSON.stringify(t)
					throw new Error(
						'Unsupported previous source map format: ' +
							t.toString(),
					)
				}
			} else {
				if (this.inline) return this.decodeInline(this.annotation)
				if (this.annotation) {
					let n = this.annotation
					return e && (n = XR(ia(e), n)), this.loadFile(n)
				}
			}
		}
		startWith(e, t) {
			return e ? e.substr(0, t.length) === t : !1
		}
		withContent() {
			return !!(
				this.consumer().sourcesContent &&
				this.consumer().sourcesContent.length > 0
			)
		}
	}
	var wd = sa
	sa.default = sa
	let { nanoid: _R } = VR,
		{ isAbsolute: oa, resolve: aa } = Be,
		{ SourceMapConsumer: xR, SourceMapGenerator: OR } = Be,
		{ fileURLToPath: Zd, pathToFileURL: fi } = Be,
		Td = Bo,
		kR = wd,
		la = Be,
		ca = Symbol('fromOffsetCache'),
		PR = !!(xR && OR),
		Ed = !!(aa && oa),
		mi = class {
			constructor(e, t = {}) {
				if (
					e === null ||
					typeof e == 'undefined' ||
					(typeof e == 'object' && !e.toString)
				)
					throw new Error(
						`PostCSS received ${e} instead of CSS string`,
					)
				if (
					((this.css = e.toString()),
					this.css[0] === '\uFEFF' || this.css[0] === '￾'
						? ((this.hasBOM = !0), (this.css = this.css.slice(1)))
						: (this.hasBOM = !1),
					t.from &&
						(!Ed || /^\w+:\/\//.test(t.from) || oa(t.from)
							? (this.file = t.from)
							: (this.file = aa(t.from))),
					Ed && PR)
				) {
					let n = new kR(this.css, t)
					if (n.text) {
						this.map = n
						let i = n.consumer().file
						!this.file && i && (this.file = this.mapResolve(i))
					}
				}
				this.file || (this.id = '<input css ' + _R(6) + '>'),
					this.map && (this.map.file = this.from)
			}
			error(e, t, n, i = {}) {
				let s, o, l
				if (t && typeof t == 'object') {
					let c = t,
						u = n
					if (typeof c.offset == 'number') {
						let d = this.fromOffset(c.offset)
						;(t = d.line), (n = d.col)
					} else (t = c.line), (n = c.column)
					if (typeof u.offset == 'number') {
						let d = this.fromOffset(u.offset)
						;(o = d.line), (s = d.col)
					} else (o = u.line), (s = u.column)
				} else if (!n) {
					let c = this.fromOffset(t)
					;(t = c.line), (n = c.col)
				}
				let a = this.origin(t, n, o, s)
				return (
					a
						? (l = new Td(
								e,
								a.endLine === void 0
									? a.line
									: { column: a.column, line: a.line },
								a.endLine === void 0
									? a.column
									: { column: a.endColumn, line: a.endLine },
								a.source,
								a.file,
								i.plugin,
							))
						: (l = new Td(
								e,
								o === void 0 ? t : { column: n, line: t },
								o === void 0 ? n : { column: s, line: o },
								this.css,
								this.file,
								i.plugin,
							)),
					(l.input = {
						column: n,
						endColumn: s,
						endLine: o,
						line: t,
						source: this.css,
					}),
					this.file &&
						(fi && (l.input.url = fi(this.file).toString()),
						(l.input.file = this.file)),
					l
				)
			}
			fromOffset(e) {
				let t, n
				if (this[ca]) n = this[ca]
				else {
					let s = this.css.split(`
`)
					n = new Array(s.length)
					let o = 0
					for (let l = 0, a = s.length; l < a; l++)
						(n[l] = o), (o += s[l].length + 1)
					this[ca] = n
				}
				t = n[n.length - 1]
				let i = 0
				if (e >= t) i = n.length - 1
				else {
					let s = n.length - 2,
						o
					for (; i < s; )
						if (((o = i + ((s - i) >> 1)), e < n[o])) s = o - 1
						else if (e >= n[o + 1]) i = o + 1
						else {
							i = o
							break
						}
				}
				return { col: e - n[i] + 1, line: i + 1 }
			}
			mapResolve(e) {
				return /^\w+:\/\//.test(e)
					? e
					: aa(
							this.map.consumer().sourceRoot ||
								this.map.root ||
								'.',
							e,
						)
			}
			origin(e, t, n, i) {
				if (!this.map) return !1
				let s = this.map.consumer(),
					o = s.originalPositionFor({ column: t, line: e })
				if (!o.source) return !1
				let l
				typeof n == 'number' &&
					(l = s.originalPositionFor({ column: i, line: n }))
				let a
				oa(o.source)
					? (a = fi(o.source))
					: (a = new URL(
							o.source,
							this.map.consumer().sourceRoot ||
								fi(this.map.mapFile),
						))
				let c = {
					column: o.column,
					endColumn: l && l.column,
					endLine: l && l.line,
					line: o.line,
					url: a.toString(),
				}
				if (a.protocol === 'file:')
					if (Zd) c.file = Zd(a)
					else
						throw new Error(
							'file: protocol is not available in this PostCSS build',
						)
				let u = s.sourceContentFor(o.source)
				return u && (c.source = u), c
			}
			toJSON() {
				let e = {}
				for (let t of ['hasBOM', 'css', 'file', 'id'])
					this[t] != null && (e[t] = this[t])
				return (
					this.map &&
						((e.map = Z({}, this.map)),
						e.map.consumerCache && (e.map.consumerCache = void 0)),
					e
				)
			}
			get from() {
				return this.file || this.id
			}
		}
	var yi = mi
	;(mi.default = mi), la && la.registerInput && la.registerInput(mi)
	let Cd = Mt,
		Gd,
		Vd,
		ur = class extends Cd {
			constructor(e) {
				super(e), (this.type = 'root'), this.nodes || (this.nodes = [])
			}
			normalize(e, t, n) {
				let i = super.normalize(e)
				if (t) {
					if (n === 'prepend')
						this.nodes.length > 1
							? (t.raws.before = this.nodes[1].raws.before)
							: delete t.raws.before
					else if (this.first !== t)
						for (let s of i) s.raws.before = t.raws.before
				}
				return i
			}
			removeChild(e, t) {
				let n = this.index(e)
				return (
					!t &&
						n === 0 &&
						this.nodes.length > 1 &&
						(this.nodes[1].raws.before = this.nodes[n].raws.before),
					super.removeChild(e)
				)
			}
			toResult(e = {}) {
				return new Gd(new Vd(), this, e).stringify()
			}
		}
	;(ur.registerLazyResult = (r) => {
		Gd = r
	}),
		(ur.registerProcessor = (r) => {
			Vd = r
		})
	var jr = ur
	;(ur.default = ur), Cd.registerRoot(ur)
	let Qr = {
		comma(r) {
			return Qr.split(r, [','], !0)
		},
		space(r) {
			let e = [
				' ',
				`
`,
				'	',
			]
			return Qr.split(r, e)
		},
		split(r, e, t) {
			let n = [],
				i = '',
				s = !1,
				o = 0,
				l = !1,
				a = '',
				c = !1
			for (let u of r)
				c
					? (c = !1)
					: u === '\\'
						? (c = !0)
						: l
							? u === a && (l = !1)
							: u === '"' || u === "'"
								? ((l = !0), (a = u))
								: u === '('
									? (o += 1)
									: u === ')'
										? o > 0 && (o -= 1)
										: o === 0 && e.includes(u) && (s = !0),
					s
						? (i !== '' && n.push(i.trim()), (i = ''), (s = !1))
						: (i += u)
			return (t || i !== '') && n.push(i.trim()), n
		},
	}
	var Nd = Qr
	Qr.default = Qr
	let Ld = Mt,
		UR = Nd,
		bi = class extends Ld {
			constructor(e) {
				super(e), (this.type = 'rule'), this.nodes || (this.nodes = [])
			}
			get selectors() {
				return UR.comma(this.selector)
			}
			set selectors(e) {
				let t = this.selector ? this.selector.match(/,\s*/) : null,
					n = t ? t[0] : ',' + this.raw('between', 'beforeOpen')
				this.selector = e.join(n)
			}
		}
	var ua = bi
	;(bi.default = bi), Ld.registerRule(bi)
	let AR = ra,
		MR = di,
		YR = hi,
		FR = yi,
		JR = wd,
		HR = jr,
		KR = ua
	function $r(r, e) {
		if (Array.isArray(r)) return r.map((o) => $r(o))
		let i = r,
			{ inputs: t } = i,
			n = Ve(i, ['inputs'])
		if (t) {
			e = []
			for (let o of t) {
				let l = q(Z({}, o), { __proto__: FR.prototype })
				l.map && (l.map = q(Z({}, l.map), { __proto__: JR.prototype })),
					e.push(l)
			}
		}
		if ((n.nodes && (n.nodes = r.nodes.map((o) => $r(o, e))), n.source)) {
			let s = n.source,
				{ inputId: o } = s,
				l = Ve(s, ['inputId'])
			;(n.source = l), o != null && (n.source.input = e[o])
		}
		if (n.type === 'root') return new HR(n)
		if (n.type === 'decl') return new YR(n)
		if (n.type === 'rule') return new KR(n)
		if (n.type === 'comment') return new MR(n)
		if (n.type === 'atrule') return new AR(n)
		throw new Error('Unknown node type: ' + r.type)
	}
	var BR = $r
	$r.default = $r
	let { dirname: gi, relative: Xd, resolve: Wd, sep: _d } = Be,
		{ SourceMapConsumer: xd, SourceMapGenerator: Si } = Be,
		{ pathToFileURL: Od } = Be,
		zR = yi,
		DR = !!(xd && Si),
		jR = !!(gi && Wd && Xd && _d)
	var kd = class {
		constructor(e, t, n, i) {
			;(this.stringify = e),
				(this.mapOpts = n.map || {}),
				(this.root = t),
				(this.opts = n),
				(this.css = i),
				(this.originalCSS = i),
				(this.usesFileUrls =
					!this.mapOpts.from && this.mapOpts.absolute),
				(this.memoizedFileURLs = new Map()),
				(this.memoizedPaths = new Map()),
				(this.memoizedURLs = new Map())
		}
		addAnnotation() {
			let e
			this.isInline()
				? (e =
						'data:application/json;base64,' +
						this.toBase64(this.map.toString()))
				: typeof this.mapOpts.annotation == 'string'
					? (e = this.mapOpts.annotation)
					: typeof this.mapOpts.annotation == 'function'
						? (e = this.mapOpts.annotation(this.opts.to, this.root))
						: (e = this.outputFile() + '.map')
			let t = `
`
			this.css.includes(`\r
`) &&
				(t = `\r
`),
				(this.css += t + '/*# sourceMappingURL=' + e + ' */')
		}
		applyPrevMaps() {
			for (let e of this.previous()) {
				let t = this.toUrl(this.path(e.file)),
					n = e.root || gi(e.file),
					i
				this.mapOpts.sourcesContent === !1
					? ((i = new xd(e.text)),
						i.sourcesContent && (i.sourcesContent = null))
					: (i = e.consumer()),
					this.map.applySourceMap(i, t, this.toUrl(this.path(n)))
			}
		}
		clearAnnotation() {
			if (this.mapOpts.annotation !== !1)
				if (this.root) {
					let e
					for (let t = this.root.nodes.length - 1; t >= 0; t--)
						(e = this.root.nodes[t]),
							e.type === 'comment' &&
								e.text.startsWith('# sourceMappingURL=') &&
								this.root.removeChild(t)
				} else
					this.css &&
						(this.css = this.css.replace(
							/\n*\/\*#[\S\s]*?\*\/$/gm,
							'',
						))
		}
		generate() {
			if ((this.clearAnnotation(), jR && DR && this.isMap()))
				return this.generateMap()
			{
				let e = ''
				return (
					this.stringify(this.root, (t) => {
						e += t
					}),
					[e]
				)
			}
		}
		generateMap() {
			if (this.root) this.generateString()
			else if (this.previous().length === 1) {
				let e = this.previous()[0].consumer()
				;(e.file = this.outputFile()),
					(this.map = Si.fromSourceMap(e, {
						ignoreInvalidMapping: !0,
					}))
			} else
				(this.map = new Si({
					file: this.outputFile(),
					ignoreInvalidMapping: !0,
				})),
					this.map.addMapping({
						generated: { column: 0, line: 1 },
						original: { column: 0, line: 1 },
						source: this.opts.from
							? this.toUrl(this.path(this.opts.from))
							: '<no source>',
					})
			return (
				this.isSourcesContent() && this.setSourcesContent(),
				this.root && this.previous().length > 0 && this.applyPrevMaps(),
				this.isAnnotation() && this.addAnnotation(),
				this.isInline() ? [this.css] : [this.css, this.map]
			)
		}
		generateString() {
			;(this.css = ''),
				(this.map = new Si({
					file: this.outputFile(),
					ignoreInvalidMapping: !0,
				}))
			let e = 1,
				t = 1,
				n = '<no source>',
				i = {
					generated: { column: 0, line: 0 },
					original: { column: 0, line: 0 },
					source: '',
				},
				s,
				o
			this.stringify(this.root, (l, a, c) => {
				if (
					((this.css += l),
					a &&
						c !== 'end' &&
						((i.generated.line = e),
						(i.generated.column = t - 1),
						a.source && a.source.start
							? ((i.source = this.sourcePath(a)),
								(i.original.line = a.source.start.line),
								(i.original.column = a.source.start.column - 1),
								this.map.addMapping(i))
							: ((i.source = n),
								(i.original.line = 1),
								(i.original.column = 0),
								this.map.addMapping(i))),
					(o = l.match(/\n/g)),
					o
						? ((e += o.length),
							(s = l.lastIndexOf(`
`)),
							(t = l.length - s))
						: (t += l.length),
					a && c !== 'start')
				) {
					let u = a.parent || { raws: {} }
					;(!(
						a.type === 'decl' ||
						(a.type === 'atrule' && !a.nodes)
					) ||
						a !== u.last ||
						u.raws.semicolon) &&
						(a.source && a.source.end
							? ((i.source = this.sourcePath(a)),
								(i.original.line = a.source.end.line),
								(i.original.column = a.source.end.column - 1),
								(i.generated.line = e),
								(i.generated.column = t - 2),
								this.map.addMapping(i))
							: ((i.source = n),
								(i.original.line = 1),
								(i.original.column = 0),
								(i.generated.line = e),
								(i.generated.column = t - 1),
								this.map.addMapping(i)))
				}
			})
		}
		isAnnotation() {
			return this.isInline()
				? !0
				: typeof this.mapOpts.annotation != 'undefined'
					? this.mapOpts.annotation
					: this.previous().length
						? this.previous().some((e) => e.annotation)
						: !0
		}
		isInline() {
			if (typeof this.mapOpts.inline != 'undefined')
				return this.mapOpts.inline
			let e = this.mapOpts.annotation
			return typeof e != 'undefined' && e !== !0
				? !1
				: this.previous().length
					? this.previous().some((t) => t.inline)
					: !0
		}
		isMap() {
			return typeof this.opts.map != 'undefined'
				? !!this.opts.map
				: this.previous().length > 0
		}
		isSourcesContent() {
			return typeof this.mapOpts.sourcesContent != 'undefined'
				? this.mapOpts.sourcesContent
				: this.previous().length
					? this.previous().some((e) => e.withContent())
					: !0
		}
		outputFile() {
			return this.opts.to
				? this.path(this.opts.to)
				: this.opts.from
					? this.path(this.opts.from)
					: 'to.css'
		}
		path(e) {
			if (
				this.mapOpts.absolute ||
				e.charCodeAt(0) === 60 ||
				/^\w+:\/\//.test(e)
			)
				return e
			let t = this.memoizedPaths.get(e)
			if (t) return t
			let n = this.opts.to ? gi(this.opts.to) : '.'
			typeof this.mapOpts.annotation == 'string' &&
				(n = gi(Wd(n, this.mapOpts.annotation)))
			let i = Xd(n, e)
			return this.memoizedPaths.set(e, i), i
		}
		previous() {
			if (!this.previousMaps)
				if (((this.previousMaps = []), this.root))
					this.root.walk((e) => {
						if (e.source && e.source.input.map) {
							let t = e.source.input.map
							this.previousMaps.includes(t) ||
								this.previousMaps.push(t)
						}
					})
				else {
					let e = new zR(this.originalCSS, this.opts)
					e.map && this.previousMaps.push(e.map)
				}
			return this.previousMaps
		}
		setSourcesContent() {
			let e = {}
			if (this.root)
				this.root.walk((t) => {
					if (t.source) {
						let n = t.source.input.from
						if (n && !e[n]) {
							e[n] = !0
							let i = this.usesFileUrls
								? this.toFileUrl(n)
								: this.toUrl(this.path(n))
							this.map.setSourceContent(i, t.source.input.css)
						}
					}
				})
			else if (this.css) {
				let t = this.opts.from
					? this.toUrl(this.path(this.opts.from))
					: '<no source>'
				this.map.setSourceContent(t, this.css)
			}
		}
		sourcePath(e) {
			return this.mapOpts.from
				? this.toUrl(this.mapOpts.from)
				: this.usesFileUrls
					? this.toFileUrl(e.source.input.from)
					: this.toUrl(this.path(e.source.input.from))
		}
		toBase64(e) {
			return Buffer
				? Buffer.from(e).toString('base64')
				: window.btoa(unescape(encodeURIComponent(e)))
		}
		toFileUrl(e) {
			let t = this.memoizedFileURLs.get(e)
			if (t) return t
			if (Od) {
				let n = Od(e).toString()
				return this.memoizedFileURLs.set(e, n), n
			} else
				throw new Error(
					'`map.absolute` option is not available in this PostCSS build',
				)
		}
		toUrl(e) {
			let t = this.memoizedURLs.get(e)
			if (t) return t
			_d === '\\' && (e = e.replace(/\\/g, '/'))
			let n = encodeURI(e).replace(/[#?]/g, encodeURIComponent)
			return this.memoizedURLs.set(e, n), n
		}
	}
	const da = 39,
		Pd = 34,
		vi = 92,
		Ud = 47,
		Ri = 10,
		qr = 32,
		Ii = 12,
		wi = 9,
		Zi = 13,
		QR = 91,
		$R = 93,
		qR = 40,
		eI = 41,
		tI = 123,
		rI = 125,
		nI = 59,
		iI = 42,
		sI = 58,
		oI = 64,
		Ti = /[\t\n\f\r "#'()/;[\\\]{}]/g,
		Ei = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g,
		aI = /.[\r\n"'(/\\]/,
		Ad = /[\da-f]/i
	var lI = function (e, t = {}) {
		let n = e.css.valueOf(),
			i = t.ignoreErrors,
			s,
			o,
			l,
			a,
			c,
			u,
			d,
			h,
			p,
			y,
			f = n.length,
			m = 0,
			g = [],
			v = []
		function S() {
			return m
		}
		function I(V) {
			throw e.error('Unclosed ' + V, m)
		}
		function G() {
			return v.length === 0 && m >= f
		}
		function L(V) {
			if (v.length) return v.pop()
			if (m >= f) return
			let P = V ? V.ignoreUnclosed : !1
			switch (((s = n.charCodeAt(m)), s)) {
				case Ri:
				case qr:
				case wi:
				case Zi:
				case Ii: {
					a = m
					do (a += 1), (s = n.charCodeAt(a))
					while (
						s === qr ||
						s === Ri ||
						s === wi ||
						s === Zi ||
						s === Ii
					)
					;(u = ['space', n.slice(m, a)]), (m = a - 1)
					break
				}
				case QR:
				case $R:
				case tI:
				case rI:
				case sI:
				case nI:
				case eI: {
					let X = String.fromCharCode(s)
					u = [X, X, m]
					break
				}
				case qR: {
					if (
						((y = g.length ? g.pop()[1] : ''),
						(p = n.charCodeAt(m + 1)),
						y === 'url' &&
							p !== da &&
							p !== Pd &&
							p !== qr &&
							p !== Ri &&
							p !== wi &&
							p !== Ii &&
							p !== Zi)
					) {
						a = m
						do {
							if (
								((d = !1),
								(a = n.indexOf(')', a + 1)),
								a === -1)
							)
								if (i || P) {
									a = m
									break
								} else I('bracket')
							for (h = a; n.charCodeAt(h - 1) === vi; )
								(h -= 1), (d = !d)
						} while (d)
						;(u = ['brackets', n.slice(m, a + 1), m, a]), (m = a)
					} else
						(a = n.indexOf(')', m + 1)),
							(o = n.slice(m, a + 1)),
							a === -1 || aI.test(o)
								? (u = ['(', '(', m])
								: ((u = ['brackets', o, m, a]), (m = a))
					break
				}
				case da:
				case Pd: {
					;(c = s === da ? "'" : '"'), (a = m)
					do {
						if (((d = !1), (a = n.indexOf(c, a + 1)), a === -1))
							if (i || P) {
								a = m + 1
								break
							} else I('string')
						for (h = a; n.charCodeAt(h - 1) === vi; )
							(h -= 1), (d = !d)
					} while (d)
					;(u = ['string', n.slice(m, a + 1), m, a]), (m = a)
					break
				}
				case oI: {
					;(Ti.lastIndex = m + 1),
						Ti.test(n),
						Ti.lastIndex === 0
							? (a = n.length - 1)
							: (a = Ti.lastIndex - 2),
						(u = ['at-word', n.slice(m, a + 1), m, a]),
						(m = a)
					break
				}
				case vi: {
					for (a = m, l = !0; n.charCodeAt(a + 1) === vi; )
						(a += 1), (l = !l)
					if (
						((s = n.charCodeAt(a + 1)),
						l &&
							s !== Ud &&
							s !== qr &&
							s !== Ri &&
							s !== wi &&
							s !== Zi &&
							s !== Ii &&
							((a += 1), Ad.test(n.charAt(a))))
					) {
						for (; Ad.test(n.charAt(a + 1)); ) a += 1
						n.charCodeAt(a + 1) === qr && (a += 1)
					}
					;(u = ['word', n.slice(m, a + 1), m, a]), (m = a)
					break
				}
				default: {
					s === Ud && n.charCodeAt(m + 1) === iI
						? ((a = n.indexOf('*/', m + 2) + 1),
							a === 0 && (i || P ? (a = n.length) : I('comment')),
							(u = ['comment', n.slice(m, a + 1), m, a]),
							(m = a))
						: ((Ei.lastIndex = m + 1),
							Ei.test(n),
							Ei.lastIndex === 0
								? (a = n.length - 1)
								: (a = Ei.lastIndex - 2),
							(u = ['word', n.slice(m, a + 1), m, a]),
							g.push(u),
							(m = a))
					break
				}
			}
			return m++, u
		}
		function w(V) {
			v.push(V)
		}
		return { back: w, endOfFile: G, nextToken: L, position: S }
	}
	let cI = ra,
		uI = di,
		dI = hi,
		hI = jr,
		Md = ua,
		pI = lI
	const Yd = { empty: !0, space: !0 }
	function fI(r) {
		for (let e = r.length - 1; e >= 0; e--) {
			let t = r[e],
				n = t[3] || t[2]
			if (n) return n
		}
	}
	var mI = class {
		constructor(e) {
			;(this.input = e),
				(this.root = new hI()),
				(this.current = this.root),
				(this.spaces = ''),
				(this.semicolon = !1),
				this.createTokenizer(),
				(this.root.source = {
					input: e,
					start: { column: 1, line: 1, offset: 0 },
				})
		}
		atrule(e) {
			let t = new cI()
			;(t.name = e[1].slice(1)),
				t.name === '' && this.unnamedAtrule(t, e),
				this.init(t, e[2])
			let n,
				i,
				s,
				o = !1,
				l = !1,
				a = [],
				c = []
			for (; !this.tokenizer.endOfFile(); ) {
				if (
					((e = this.tokenizer.nextToken()),
					(n = e[0]),
					n === '(' || n === '['
						? c.push(n === '(' ? ')' : ']')
						: n === '{' && c.length > 0
							? c.push('}')
							: n === c[c.length - 1] && c.pop(),
					c.length === 0)
				)
					if (n === ';') {
						;(t.source.end = this.getPosition(e[2])),
							t.source.end.offset++,
							(this.semicolon = !0)
						break
					} else if (n === '{') {
						l = !0
						break
					} else if (n === '}') {
						if (a.length > 0) {
							for (
								s = a.length - 1, i = a[s];
								i && i[0] === 'space';

							)
								i = a[--s]
							i &&
								((t.source.end = this.getPosition(
									i[3] || i[2],
								)),
								t.source.end.offset++)
						}
						this.end(e)
						break
					} else a.push(e)
				else a.push(e)
				if (this.tokenizer.endOfFile()) {
					o = !0
					break
				}
			}
			;(t.raws.between = this.spacesAndCommentsFromEnd(a)),
				a.length
					? ((t.raws.afterName = this.spacesAndCommentsFromStart(a)),
						this.raw(t, 'params', a),
						o &&
							((e = a[a.length - 1]),
							(t.source.end = this.getPosition(e[3] || e[2])),
							t.source.end.offset++,
							(this.spaces = t.raws.between),
							(t.raws.between = '')))
					: ((t.raws.afterName = ''), (t.params = '')),
				l && ((t.nodes = []), (this.current = t))
		}
		checkMissedSemicolon(e) {
			let t = this.colon(e)
			if (t === !1) return
			let n = 0,
				i
			for (
				let s = t - 1;
				s >= 0 &&
				((i = e[s]), !(i[0] !== 'space' && ((n += 1), n === 2)));
				s--
			);
			throw this.input.error(
				'Missed semicolon',
				i[0] === 'word' ? i[3] + 1 : i[2],
			)
		}
		colon(e) {
			let t = 0,
				n,
				i,
				s
			for (let [o, l] of e.entries()) {
				if (
					((i = l),
					(s = i[0]),
					s === '(' && (t += 1),
					s === ')' && (t -= 1),
					t === 0 && s === ':')
				)
					if (!n) this.doubleColon(i)
					else {
						if (n[0] === 'word' && n[1] === 'progid') continue
						return o
					}
				n = i
			}
			return !1
		}
		comment(e) {
			let t = new uI()
			this.init(t, e[2]),
				(t.source.end = this.getPosition(e[3] || e[2])),
				t.source.end.offset++
			let n = e[1].slice(2, -2)
			if (/^\s*$/.test(n))
				(t.text = ''), (t.raws.left = n), (t.raws.right = '')
			else {
				let i = n.match(/^(\s*)([^]*\S)(\s*)$/)
				;(t.text = i[2]), (t.raws.left = i[1]), (t.raws.right = i[3])
			}
		}
		createTokenizer() {
			this.tokenizer = pI(this.input)
		}
		decl(e, t) {
			let n = new dI()
			this.init(n, e[0][2])
			let i = e[e.length - 1]
			for (
				i[0] === ';' && ((this.semicolon = !0), e.pop()),
					n.source.end = this.getPosition(i[3] || i[2] || fI(e)),
					n.source.end.offset++;
				e[0][0] !== 'word';

			)
				e.length === 1 && this.unknownWord(e),
					(n.raws.before += e.shift()[1])
			for (
				n.source.start = this.getPosition(e[0][2]), n.prop = '';
				e.length;

			) {
				let c = e[0][0]
				if (c === ':' || c === 'space' || c === 'comment') break
				n.prop += e.shift()[1]
			}
			n.raws.between = ''
			let s
			for (; e.length; )
				if (((s = e.shift()), s[0] === ':')) {
					n.raws.between += s[1]
					break
				} else
					s[0] === 'word' && /\w/.test(s[1]) && this.unknownWord([s]),
						(n.raws.between += s[1])
			;(n.prop[0] === '_' || n.prop[0] === '*') &&
				((n.raws.before += n.prop[0]), (n.prop = n.prop.slice(1)))
			let o = [],
				l
			for (
				;
				e.length &&
				((l = e[0][0]), !(l !== 'space' && l !== 'comment'));

			)
				o.push(e.shift())
			this.precheckMissedSemicolon(e)
			for (let c = e.length - 1; c >= 0; c--) {
				if (((s = e[c]), s[1].toLowerCase() === '!important')) {
					n.important = !0
					let u = this.stringFrom(e, c)
					;(u = this.spacesFromEnd(e) + u),
						u !== ' !important' && (n.raws.important = u)
					break
				} else if (s[1].toLowerCase() === 'important') {
					let u = e.slice(0),
						d = ''
					for (let h = c; h > 0; h--) {
						let p = u[h][0]
						if (d.trim().startsWith('!') && p !== 'space') break
						d = u.pop()[1] + d
					}
					d.trim().startsWith('!') &&
						((n.important = !0), (n.raws.important = d), (e = u))
				}
				if (s[0] !== 'space' && s[0] !== 'comment') break
			}
			e.some((c) => c[0] !== 'space' && c[0] !== 'comment') &&
				((n.raws.between += o.map((c) => c[1]).join('')), (o = [])),
				this.raw(n, 'value', o.concat(e), t),
				n.value.includes(':') && !t && this.checkMissedSemicolon(e)
		}
		doubleColon(e) {
			throw this.input.error(
				'Double colon',
				{ offset: e[2] },
				{ offset: e[2] + e[1].length },
			)
		}
		emptyRule(e) {
			let t = new Md()
			this.init(t, e[2]),
				(t.selector = ''),
				(t.raws.between = ''),
				(this.current = t)
		}
		end(e) {
			this.current.nodes &&
				this.current.nodes.length &&
				(this.current.raws.semicolon = this.semicolon),
				(this.semicolon = !1),
				(this.current.raws.after =
					(this.current.raws.after || '') + this.spaces),
				(this.spaces = ''),
				this.current.parent
					? ((this.current.source.end = this.getPosition(e[2])),
						this.current.source.end.offset++,
						(this.current = this.current.parent))
					: this.unexpectedClose(e)
		}
		endFile() {
			this.current.parent && this.unclosedBlock(),
				this.current.nodes &&
					this.current.nodes.length &&
					(this.current.raws.semicolon = this.semicolon),
				(this.current.raws.after =
					(this.current.raws.after || '') + this.spaces),
				(this.root.source.end = this.getPosition(
					this.tokenizer.position(),
				))
		}
		freeSemicolon(e) {
			if (((this.spaces += e[1]), this.current.nodes)) {
				let t = this.current.nodes[this.current.nodes.length - 1]
				t &&
					t.type === 'rule' &&
					!t.raws.ownSemicolon &&
					((t.raws.ownSemicolon = this.spaces), (this.spaces = ''))
			}
		}
		getPosition(e) {
			let t = this.input.fromOffset(e)
			return { column: t.col, line: t.line, offset: e }
		}
		init(e, t) {
			this.current.push(e),
				(e.source = { input: this.input, start: this.getPosition(t) }),
				(e.raws.before = this.spaces),
				(this.spaces = ''),
				e.type !== 'comment' && (this.semicolon = !1)
		}
		other(e) {
			let t = !1,
				n = null,
				i = !1,
				s = null,
				o = [],
				l = e[1].startsWith('--'),
				a = [],
				c = e
			for (; c; ) {
				if (((n = c[0]), a.push(c), n === '(' || n === '['))
					s || (s = c), o.push(n === '(' ? ')' : ']')
				else if (l && i && n === '{') s || (s = c), o.push('}')
				else if (o.length === 0)
					if (n === ';')
						if (i) {
							this.decl(a, l)
							return
						} else break
					else if (n === '{') {
						this.rule(a)
						return
					} else if (n === '}') {
						this.tokenizer.back(a.pop()), (t = !0)
						break
					} else n === ':' && (i = !0)
				else
					n === o[o.length - 1] &&
						(o.pop(), o.length === 0 && (s = null))
				c = this.tokenizer.nextToken()
			}
			if (
				(this.tokenizer.endOfFile() && (t = !0),
				o.length > 0 && this.unclosedBracket(s),
				t && i)
			) {
				if (!l)
					for (
						;
						a.length &&
						((c = a[a.length - 1][0]),
						!(c !== 'space' && c !== 'comment'));

					)
						this.tokenizer.back(a.pop())
				this.decl(a, l)
			} else this.unknownWord(a)
		}
		parse() {
			let e
			for (; !this.tokenizer.endOfFile(); )
				switch (((e = this.tokenizer.nextToken()), e[0])) {
					case 'space':
						this.spaces += e[1]
						break
					case ';':
						this.freeSemicolon(e)
						break
					case '}':
						this.end(e)
						break
					case 'comment':
						this.comment(e)
						break
					case 'at-word':
						this.atrule(e)
						break
					case '{':
						this.emptyRule(e)
						break
					default:
						this.other(e)
						break
				}
			this.endFile()
		}
		precheckMissedSemicolon() {}
		raw(e, t, n, i) {
			let s,
				o,
				l = n.length,
				a = '',
				c = !0,
				u,
				d
			for (let h = 0; h < l; h += 1)
				(s = n[h]),
					(o = s[0]),
					o === 'space' && h === l - 1 && !i
						? (c = !1)
						: o === 'comment'
							? ((d = n[h - 1] ? n[h - 1][0] : 'empty'),
								(u = n[h + 1] ? n[h + 1][0] : 'empty'),
								!Yd[d] && !Yd[u]
									? a.slice(-1) === ','
										? (c = !1)
										: (a += s[1])
									: (c = !1))
							: (a += s[1])
			if (!c) {
				let h = n.reduce((p, y) => p + y[1], '')
				e.raws[t] = { raw: h, value: a }
			}
			e[t] = a
		}
		rule(e) {
			e.pop()
			let t = new Md()
			this.init(t, e[0][2]),
				(t.raws.between = this.spacesAndCommentsFromEnd(e)),
				this.raw(t, 'selector', e),
				(this.current = t)
		}
		spacesAndCommentsFromEnd(e) {
			let t,
				n = ''
			for (
				;
				e.length &&
				((t = e[e.length - 1][0]), !(t !== 'space' && t !== 'comment'));

			)
				n = e.pop()[1] + n
			return n
		}
		spacesAndCommentsFromStart(e) {
			let t,
				n = ''
			for (
				;
				e.length &&
				((t = e[0][0]), !(t !== 'space' && t !== 'comment'));

			)
				n += e.shift()[1]
			return n
		}
		spacesFromEnd(e) {
			let t,
				n = ''
			for (; e.length && ((t = e[e.length - 1][0]), t === 'space'); )
				n = e.pop()[1] + n
			return n
		}
		stringFrom(e, t) {
			let n = ''
			for (let i = t; i < e.length; i++) n += e[i][1]
			return e.splice(t, e.length - t), n
		}
		unclosedBlock() {
			let e = this.current.source.start
			throw this.input.error('Unclosed block', e.line, e.column)
		}
		unclosedBracket(e) {
			throw this.input.error(
				'Unclosed bracket',
				{ offset: e[2] },
				{ offset: e[2] + 1 },
			)
		}
		unexpectedClose(e) {
			throw this.input.error(
				'Unexpected }',
				{ offset: e[2] },
				{ offset: e[2] + 1 },
			)
		}
		unknownWord(e) {
			throw this.input.error(
				'Unknown word',
				{ offset: e[0][2] },
				{ offset: e[0][2] + e[0][1].length },
			)
		}
		unnamedAtrule(e, t) {
			throw this.input.error(
				'At-rule without name',
				{ offset: t[2] },
				{ offset: t[2] + t[1].length },
			)
		}
	}
	let yI = Mt,
		bI = yi,
		gI = mI
	function Ci(r, e) {
		let t = new bI(r, e),
			n = new gI(t)
		try {
			n.parse()
		} catch (i) {
			throw (
				(process.env.NODE_ENV !== 'production' &&
					i.name === 'CssSyntaxError' &&
					e &&
					e.from &&
					(/\.scss$/i.test(e.from)
						? (i.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser`)
						: /\.sass/i.test(e.from)
							? (i.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser`)
							: /\.less$/i.test(e.from) &&
								(i.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)),
				i)
			)
		}
		return n.root
	}
	var ha = Ci
	;(Ci.default = Ci), yI.registerParse(Ci)
	let pa = class {
		constructor(e, t = {}) {
			if (
				((this.type = 'warning'),
				(this.text = e),
				t.node && t.node.source)
			) {
				let n = t.node.rangeBy(t)
				;(this.line = n.start.line),
					(this.column = n.start.column),
					(this.endLine = n.end.line),
					(this.endColumn = n.end.column)
			}
			for (let n in t) this[n] = t[n]
		}
		toString() {
			return this.node
				? this.node.error(this.text, {
						index: this.index,
						plugin: this.plugin,
						word: this.word,
					}).message
				: this.plugin
					? this.plugin + ': ' + this.text
					: this.text
		}
	}
	var Fd = pa
	pa.default = pa
	let SI = Fd,
		fa = class {
			constructor(e, t, n) {
				;(this.processor = e),
					(this.messages = []),
					(this.root = t),
					(this.opts = n),
					(this.css = void 0),
					(this.map = void 0)
			}
			toString() {
				return this.css
			}
			warn(e, t = {}) {
				t.plugin ||
					(this.lastPlugin &&
						this.lastPlugin.postcssPlugin &&
						(t.plugin = this.lastPlugin.postcssPlugin))
				let n = new SI(e, t)
				return this.messages.push(n), n
			}
			warnings() {
				return this.messages.filter((e) => e.type === 'warning')
			}
			get content() {
				return this.css
			}
		}
	var ma = fa
	fa.default = fa
	let Jd = {}
	var Hd = function (e) {
		Jd[e] ||
			((Jd[e] = !0),
			typeof console != 'undefined' && console.warn && console.warn(e))
	}
	let vI = Mt,
		RI = na,
		II = kd,
		wI = ha,
		Kd = ma,
		ZI = jr,
		TI = ci,
		{ isClean: tt, my: EI } = Br,
		CI = Hd
	const GI = {
			atrule: 'AtRule',
			comment: 'Comment',
			decl: 'Declaration',
			document: 'Document',
			root: 'Root',
			rule: 'Rule',
		},
		VI = {
			AtRule: !0,
			AtRuleExit: !0,
			Comment: !0,
			CommentExit: !0,
			Declaration: !0,
			DeclarationExit: !0,
			Document: !0,
			DocumentExit: !0,
			Once: !0,
			OnceExit: !0,
			postcssPlugin: !0,
			prepare: !0,
			Root: !0,
			RootExit: !0,
			Rule: !0,
			RuleExit: !0,
		},
		NI = { Once: !0, postcssPlugin: !0, prepare: !0 },
		dr = 0
	function en(r) {
		return typeof r == 'object' && typeof r.then == 'function'
	}
	function Bd(r) {
		let e = !1,
			t = GI[r.type]
		return (
			r.type === 'decl'
				? (e = r.prop.toLowerCase())
				: r.type === 'atrule' && (e = r.name.toLowerCase()),
			e && r.append
				? [t, t + '-' + e, dr, t + 'Exit', t + 'Exit-' + e]
				: e
					? [t, t + '-' + e, t + 'Exit', t + 'Exit-' + e]
					: r.append
						? [t, dr, t + 'Exit']
						: [t, t + 'Exit']
		)
	}
	function zd(r) {
		let e
		return (
			r.type === 'document'
				? (e = ['Document', dr, 'DocumentExit'])
				: r.type === 'root'
					? (e = ['Root', dr, 'RootExit'])
					: (e = Bd(r)),
			{
				eventIndex: 0,
				events: e,
				iterator: 0,
				node: r,
				visitorIndex: 0,
				visitors: [],
			}
		)
	}
	function ya(r) {
		return (r[tt] = !1), r.nodes && r.nodes.forEach((e) => ya(e)), r
	}
	let ba = {},
		hr = class Gf {
			constructor(e, t, n) {
				;(this.stringified = !1), (this.processed = !1)
				let i
				if (
					typeof t == 'object' &&
					t !== null &&
					(t.type === 'root' || t.type === 'document')
				)
					i = ya(t)
				else if (t instanceof Gf || t instanceof Kd)
					(i = ya(t.root)),
						t.map &&
							(typeof n.map == 'undefined' && (n.map = {}),
							n.map.inline || (n.map.inline = !1),
							(n.map.prev = t.map))
				else {
					let s = wI
					n.syntax && (s = n.syntax.parse),
						n.parser && (s = n.parser),
						s.parse && (s = s.parse)
					try {
						i = s(t, n)
					} catch (o) {
						;(this.processed = !0), (this.error = o)
					}
					i && !i[EI] && vI.rebuild(i)
				}
				;(this.result = new Kd(e, i, n)),
					(this.helpers = q(Z({}, ba), {
						postcss: ba,
						result: this.result,
					})),
					(this.plugins = this.processor.plugins.map((s) =>
						typeof s == 'object' && s.prepare
							? Z(Z({}, s), s.prepare(this.result))
							: s,
					))
			}
			async() {
				return this.error
					? Promise.reject(this.error)
					: this.processed
						? Promise.resolve(this.result)
						: (this.processing ||
								(this.processing = this.runAsync()),
							this.processing)
			}
			catch(e) {
				return this.async().catch(e)
			}
			finally(e) {
				return this.async().then(e, e)
			}
			getAsyncError() {
				throw new Error(
					'Use process(css).then(cb) to work with async plugins',
				)
			}
			handleError(e, t) {
				let n = this.result.lastPlugin
				try {
					if (
						(t && t.addToError(e),
						(this.error = e),
						e.name === 'CssSyntaxError' && !e.plugin)
					)
						(e.plugin = n.postcssPlugin), e.setMessage()
					else if (
						n.postcssVersion &&
						process.env.NODE_ENV !== 'production'
					) {
						let i = n.postcssPlugin,
							s = n.postcssVersion,
							o = this.result.processor.version,
							l = s.split('.'),
							a = o.split('.')
						;(l[0] !== a[0] || parseInt(l[1]) > parseInt(a[1])) &&
							console.error(
								'Unknown error from PostCSS plugin. Your current PostCSS version is ' +
									o +
									', but ' +
									i +
									' uses ' +
									s +
									'. Perhaps this is the source of the error below.',
							)
					}
				} catch (i) {
					console && console.error && console.error(i)
				}
				return e
			}
			prepareVisitors() {
				this.listeners = {}
				let e = (t, n, i) => {
					this.listeners[n] || (this.listeners[n] = []),
						this.listeners[n].push([t, i])
				}
				for (let t of this.plugins)
					if (typeof t == 'object')
						for (let n in t) {
							if (!VI[n] && /^[A-Z]/.test(n))
								throw new Error(
									`Unknown event ${n} in ${t.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`,
								)
							if (!NI[n])
								if (typeof t[n] == 'object')
									for (let i in t[n])
										i === '*'
											? e(t, n, t[n][i])
											: e(
													t,
													n + '-' + i.toLowerCase(),
													t[n][i],
												)
								else typeof t[n] == 'function' && e(t, n, t[n])
						}
				this.hasListener = Object.keys(this.listeners).length > 0
			}
			runAsync() {
				return z(this, null, function* () {
					this.plugin = 0
					for (let e = 0; e < this.plugins.length; e++) {
						let t = this.plugins[e],
							n = this.runOnRoot(t)
						if (en(n))
							try {
								yield n
							} catch (i) {
								throw this.handleError(i)
							}
					}
					if ((this.prepareVisitors(), this.hasListener)) {
						let e = this.result.root
						for (; !e[tt]; ) {
							e[tt] = !0
							let t = [zd(e)]
							for (; t.length > 0; ) {
								let n = this.visitTick(t)
								if (en(n))
									try {
										yield n
									} catch (i) {
										let s = t[t.length - 1].node
										throw this.handleError(i, s)
									}
							}
						}
						if (this.listeners.OnceExit)
							for (let [t, n] of this.listeners.OnceExit) {
								this.result.lastPlugin = t
								try {
									if (e.type === 'document') {
										let i = e.nodes.map((s) =>
											n(s, this.helpers),
										)
										yield Promise.all(i)
									} else yield n(e, this.helpers)
								} catch (i) {
									throw this.handleError(i)
								}
							}
					}
					return (this.processed = !0), this.stringify()
				})
			}
			runOnRoot(e) {
				this.result.lastPlugin = e
				try {
					if (typeof e == 'object' && e.Once) {
						if (this.result.root.type === 'document') {
							let t = this.result.root.nodes.map((n) =>
								e.Once(n, this.helpers),
							)
							return en(t[0]) ? Promise.all(t) : t
						}
						return e.Once(this.result.root, this.helpers)
					} else if (typeof e == 'function')
						return e(this.result.root, this.result)
				} catch (t) {
					throw this.handleError(t)
				}
			}
			stringify() {
				if (this.error) throw this.error
				if (this.stringified) return this.result
				;(this.stringified = !0), this.sync()
				let e = this.result.opts,
					t = TI
				e.syntax && (t = e.syntax.stringify),
					e.stringifier && (t = e.stringifier),
					t.stringify && (t = t.stringify)
				let i = new II(t, this.result.root, this.result.opts).generate()
				return (
					(this.result.css = i[0]),
					(this.result.map = i[1]),
					this.result
				)
			}
			sync() {
				if (this.error) throw this.error
				if (this.processed) return this.result
				if (((this.processed = !0), this.processing))
					throw this.getAsyncError()
				for (let e of this.plugins) {
					let t = this.runOnRoot(e)
					if (en(t)) throw this.getAsyncError()
				}
				if ((this.prepareVisitors(), this.hasListener)) {
					let e = this.result.root
					for (; !e[tt]; ) (e[tt] = !0), this.walkSync(e)
					if (this.listeners.OnceExit)
						if (e.type === 'document')
							for (let t of e.nodes)
								this.visitSync(this.listeners.OnceExit, t)
						else this.visitSync(this.listeners.OnceExit, e)
				}
				return this.result
			}
			then(e, t) {
				return (
					process.env.NODE_ENV !== 'production' &&
						('from' in this.opts ||
							CI(
								'Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.',
							)),
					this.async().then(e, t)
				)
			}
			toString() {
				return this.css
			}
			visitSync(e, t) {
				for (let [n, i] of e) {
					this.result.lastPlugin = n
					let s
					try {
						s = i(t, this.helpers)
					} catch (o) {
						throw this.handleError(o, t.proxyOf)
					}
					if (t.type !== 'root' && t.type !== 'document' && !t.parent)
						return !0
					if (en(s)) throw this.getAsyncError()
				}
			}
			visitTick(e) {
				let t = e[e.length - 1],
					{ node: n, visitors: i } = t
				if (n.type !== 'root' && n.type !== 'document' && !n.parent) {
					e.pop()
					return
				}
				if (i.length > 0 && t.visitorIndex < i.length) {
					let [o, l] = i[t.visitorIndex]
					;(t.visitorIndex += 1),
						t.visitorIndex === i.length &&
							((t.visitors = []), (t.visitorIndex = 0)),
						(this.result.lastPlugin = o)
					try {
						return l(n.toProxy(), this.helpers)
					} catch (a) {
						throw this.handleError(a, n)
					}
				}
				if (t.iterator !== 0) {
					let o = t.iterator,
						l
					for (; (l = n.nodes[n.indexes[o]]); )
						if (((n.indexes[o] += 1), !l[tt])) {
							;(l[tt] = !0), e.push(zd(l))
							return
						}
					;(t.iterator = 0), delete n.indexes[o]
				}
				let s = t.events
				for (; t.eventIndex < s.length; ) {
					let o = s[t.eventIndex]
					if (((t.eventIndex += 1), o === dr)) {
						n.nodes &&
							n.nodes.length &&
							((n[tt] = !0), (t.iterator = n.getIterator()))
						return
					} else if (this.listeners[o]) {
						t.visitors = this.listeners[o]
						return
					}
				}
				e.pop()
			}
			walkSync(e) {
				e[tt] = !0
				let t = Bd(e)
				for (let n of t)
					if (n === dr)
						e.nodes &&
							e.each((i) => {
								i[tt] || this.walkSync(i)
							})
					else {
						let i = this.listeners[n]
						if (i && this.visitSync(i, e.toProxy())) return
					}
			}
			warnings() {
				return this.sync().warnings()
			}
			get content() {
				return this.stringify().content
			}
			get css() {
				return this.stringify().css
			}
			get map() {
				return this.stringify().map
			}
			get messages() {
				return this.sync().messages
			}
			get opts() {
				return this.result.opts
			}
			get processor() {
				return this.result.processor
			}
			get root() {
				return this.sync().root
			}
			get [Symbol.toStringTag]() {
				return 'LazyResult'
			}
		}
	hr.registerPostcss = (r) => {
		ba = r
	}
	var Dd = hr
	;(hr.default = hr), ZI.registerLazyResult(hr), RI.registerLazyResult(hr)
	let LI = kd,
		XI = ha
	const WI = ma
	let _I = ci,
		xI = Hd,
		ga = class {
			constructor(e, t, n) {
				;(t = t.toString()),
					(this.stringified = !1),
					(this._processor = e),
					(this._css = t),
					(this._opts = n),
					(this._map = void 0)
				let i,
					s = _I
				;(this.result = new WI(this._processor, i, this._opts)),
					(this.result.css = t)
				let o = this
				Object.defineProperty(this.result, 'root', {
					get() {
						return o.root
					},
				})
				let l = new LI(s, i, this._opts, t)
				if (l.isMap()) {
					let [a, c] = l.generate()
					a && (this.result.css = a), c && (this.result.map = c)
				} else l.clearAnnotation(), (this.result.css = l.css)
			}
			async() {
				return this.error
					? Promise.reject(this.error)
					: Promise.resolve(this.result)
			}
			catch(e) {
				return this.async().catch(e)
			}
			finally(e) {
				return this.async().then(e, e)
			}
			sync() {
				if (this.error) throw this.error
				return this.result
			}
			then(e, t) {
				return (
					process.env.NODE_ENV !== 'production' &&
						('from' in this._opts ||
							xI(
								'Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.',
							)),
					this.async().then(e, t)
				)
			}
			toString() {
				return this._css
			}
			warnings() {
				return []
			}
			get content() {
				return this.result.css
			}
			get css() {
				return this.result.css
			}
			get map() {
				return this.result.map
			}
			get messages() {
				return []
			}
			get opts() {
				return this.result.opts
			}
			get processor() {
				return this.result.processor
			}
			get root() {
				if (this._root) return this._root
				let e,
					t = XI
				try {
					e = t(this._css, this._opts)
				} catch (n) {
					this.error = n
				}
				if (this.error) throw this.error
				return (this._root = e), e
			}
			get [Symbol.toStringTag]() {
				return 'NoWorkResult'
			}
		}
	var OI = ga
	ga.default = ga
	let kI = na,
		PI = Dd,
		UI = OI,
		AI = jr,
		tn = class {
			constructor(e = []) {
				;(this.version = '8.4.47'), (this.plugins = this.normalize(e))
			}
			normalize(e) {
				let t = []
				for (let n of e)
					if (
						(n.postcss === !0
							? (n = n())
							: n.postcss && (n = n.postcss),
						typeof n == 'object' && Array.isArray(n.plugins))
					)
						t = t.concat(n.plugins)
					else if (typeof n == 'object' && n.postcssPlugin) t.push(n)
					else if (typeof n == 'function') t.push(n)
					else if (typeof n == 'object' && (n.parse || n.stringify)) {
						if (process.env.NODE_ENV !== 'production')
							throw new Error(
								'PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.',
							)
					} else throw new Error(n + ' is not a PostCSS plugin')
				return t
			}
			process(e, t = {}) {
				return !this.plugins.length &&
					!t.parser &&
					!t.stringifier &&
					!t.syntax
					? new UI(this, e, t)
					: new PI(this, e, t)
			}
			use(e) {
				return (
					(this.plugins = this.plugins.concat(this.normalize([e]))),
					this
				)
			}
		}
	var MI = tn
	;(tn.default = tn), AI.registerProcessor(tn), kI.registerProcessor(tn)
	let jd = ra,
		Qd = di,
		YI = Mt,
		FI = Bo,
		$d = hi,
		qd = na,
		JI = BR,
		HI = yi,
		KI = Dd,
		BI = Nd,
		zI = ui,
		DI = ha,
		Sa = MI,
		jI = ma,
		eh = jr,
		th = ua,
		QI = ci,
		$I = Fd
	function te(...r) {
		return r.length === 1 && Array.isArray(r[0]) && (r = r[0]), new Sa(r)
	}
	;(te.plugin = function (e, t) {
		let n = !1
		function i(...o) {
			console &&
				console.warn &&
				!n &&
				((n = !0),
				console.warn(
					e +
						`: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`,
				),
				process.env.LANG &&
					process.env.LANG.startsWith('cn') &&
					console.warn(
						e +
							`: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`,
					))
			let l = t(...o)
			return (
				(l.postcssPlugin = e), (l.postcssVersion = new Sa().version), l
			)
		}
		let s
		return (
			Object.defineProperty(i, 'postcss', {
				get() {
					return s || (s = i()), s
				},
			}),
			(i.process = function (o, l, a) {
				return te([i(a)]).process(o, l)
			}),
			i
		)
	}),
		(te.stringify = QI),
		(te.parse = DI),
		(te.fromJSON = JI),
		(te.list = BI),
		(te.comment = (r) => new Qd(r)),
		(te.atRule = (r) => new jd(r)),
		(te.decl = (r) => new $d(r)),
		(te.rule = (r) => new th(r)),
		(te.root = (r) => new eh(r)),
		(te.document = (r) => new qd(r)),
		(te.CssSyntaxError = FI),
		(te.Declaration = $d),
		(te.Container = YI),
		(te.Processor = Sa),
		(te.Document = qd),
		(te.Comment = Qd),
		(te.Warning = $I),
		(te.AtRule = jd),
		(te.Result = jI),
		(te.Input = HI),
		(te.Rule = th),
		(te.Root = eh),
		(te.Node = zI),
		KI.registerPostcss(te),
		(te.default = te)
	var qI = Object.defineProperty,
		ew = (r, e, t) =>
			e in r
				? qI(r, e, {
						enumerable: !0,
						configurable: !0,
						writable: !0,
						value: t,
					})
				: (r[e] = t),
		Pe = (r, e, t) => ew(r, typeof e != 'symbol' ? e + '' : e, t)
	function tw(r) {
		if (r.__esModule) return r
		var e = r.default
		if (typeof e == 'function') {
			var t = function n() {
				return this instanceof n
					? Reflect.construct(e, arguments, this.constructor)
					: e.apply(this, arguments)
			}
			t.prototype = e.prototype
		} else t = {}
		return (
			Object.defineProperty(t, '__esModule', { value: !0 }),
			Object.keys(r).forEach(function (n) {
				var i = Object.getOwnPropertyDescriptor(r, n)
				Object.defineProperty(
					t,
					n,
					i.get
						? i
						: {
								enumerable: !0,
								get: function () {
									return r[n]
								},
							},
				)
			}),
			t
		)
	}
	var va = { exports: {} },
		M = String,
		rh = function () {
			return {
				isColorSupported: !1,
				reset: M,
				bold: M,
				dim: M,
				italic: M,
				underline: M,
				inverse: M,
				hidden: M,
				strikethrough: M,
				black: M,
				red: M,
				green: M,
				yellow: M,
				blue: M,
				magenta: M,
				cyan: M,
				white: M,
				gray: M,
				bgBlack: M,
				bgRed: M,
				bgGreen: M,
				bgYellow: M,
				bgBlue: M,
				bgMagenta: M,
				bgCyan: M,
				bgWhite: M,
				blackBright: M,
				redBright: M,
				greenBright: M,
				yellowBright: M,
				blueBright: M,
				magentaBright: M,
				cyanBright: M,
				whiteBright: M,
				bgBlackBright: M,
				bgRedBright: M,
				bgGreenBright: M,
				bgYellowBright: M,
				bgBlueBright: M,
				bgMagentaBright: M,
				bgCyanBright: M,
				bgWhiteBright: M,
			}
		}
	;(va.exports = rh()), (va.exports.createColors = rh)
	var rw = va.exports
	const ze = tw(
		Object.freeze(
			Object.defineProperty(
				{ __proto__: null, default: {} },
				Symbol.toStringTag,
				{ value: 'Module' },
			),
		),
	)
	let nh = rw,
		ih = ze,
		Ra = class Vf extends Error {
			constructor(e, t, n, i, s, o) {
				super(e),
					(this.name = 'CssSyntaxError'),
					(this.reason = e),
					s && (this.file = s),
					i && (this.source = i),
					o && (this.plugin = o),
					typeof t != 'undefined' &&
						typeof n != 'undefined' &&
						(typeof t == 'number'
							? ((this.line = t), (this.column = n))
							: ((this.line = t.line),
								(this.column = t.column),
								(this.endLine = n.line),
								(this.endColumn = n.column))),
					this.setMessage(),
					Error.captureStackTrace && Error.captureStackTrace(this, Vf)
			}
			setMessage() {
				;(this.message = this.plugin ? this.plugin + ': ' : ''),
					(this.message += this.file ? this.file : '<css input>'),
					typeof this.line != 'undefined' &&
						(this.message += ':' + this.line + ':' + this.column),
					(this.message += ': ' + this.reason)
			}
			showSourceCode(e) {
				if (!this.source) return ''
				let t = this.source
				e == null && (e = nh.isColorSupported)
				let n = (u) => u,
					i = (u) => u,
					s = (u) => u
				if (e) {
					let { bold: u, gray: d, red: h } = nh.createColors(!0)
					;(i = (p) => u(h(p))),
						(n = (p) => d(p)),
						ih && (s = (p) => ih(p))
				}
				let o = t.split(/\r?\n/),
					l = Math.max(this.line - 3, 0),
					a = Math.min(this.line + 2, o.length),
					c = String(a).length
				return o.slice(l, a).map((u, d) => {
					let h = l + 1 + d,
						p = ' ' + (' ' + h).slice(-c) + ' | '
					if (h === this.line) {
						if (u.length > 160) {
							let f = 20,
								m = Math.max(0, this.column - f),
								g = Math.max(
									this.column + f,
									this.endColumn + f,
								),
								v = u.slice(m, g),
								S =
									n(p.replace(/\d/g, ' ')) +
									u
										.slice(
											0,
											Math.min(this.column - 1, f - 1),
										)
										.replace(/[^\t]/g, ' ')
							return (
								i('>') +
								n(p) +
								s(v) +
								`
 ` +
								S +
								i('^')
							)
						}
						let y =
							n(p.replace(/\d/g, ' ')) +
							u.slice(0, this.column - 1).replace(/[^\t]/g, ' ')
						return (
							i('>') +
							n(p) +
							s(u) +
							`
 ` +
							y +
							i('^')
						)
					}
					return ' ' + n(p) + s(u)
				}).join(`
`)
			}
			toString() {
				let e = this.showSourceCode()
				return (
					e &&
						(e =
							`

` +
							e +
							`
`),
					this.name + ': ' + this.message + e
				)
			}
		}
	var Ia = Ra
	Ra.default = Ra
	const sh = {
		after: `
`,
		beforeClose: `
`,
		beforeComment: `
`,
		beforeDecl: `
`,
		beforeOpen: ' ',
		beforeRule: `
`,
		colon: ': ',
		commentLeft: ' ',
		commentRight: ' ',
		emptyBody: '',
		indent: '    ',
		semicolon: !1,
	}
	function nw(r) {
		return r[0].toUpperCase() + r.slice(1)
	}
	let wa = class {
		constructor(e) {
			this.builder = e
		}
		atrule(e, t) {
			let n = '@' + e.name,
				i = e.params ? this.rawValue(e, 'params') : ''
			if (
				(typeof e.raws.afterName != 'undefined'
					? (n += e.raws.afterName)
					: i && (n += ' '),
				e.nodes)
			)
				this.block(e, n + i)
			else {
				let s = (e.raws.between || '') + (t ? ';' : '')
				this.builder(n + i + s, e)
			}
		}
		beforeAfter(e, t) {
			let n
			e.type === 'decl'
				? (n = this.raw(e, null, 'beforeDecl'))
				: e.type === 'comment'
					? (n = this.raw(e, null, 'beforeComment'))
					: t === 'before'
						? (n = this.raw(e, null, 'beforeRule'))
						: (n = this.raw(e, null, 'beforeClose'))
			let i = e.parent,
				s = 0
			for (; i && i.type !== 'root'; ) (s += 1), (i = i.parent)
			if (
				n.includes(`
`)
			) {
				let o = this.raw(e, null, 'indent')
				if (o.length) for (let l = 0; l < s; l++) n += o
			}
			return n
		}
		block(e, t) {
			let n = this.raw(e, 'between', 'beforeOpen')
			this.builder(t + n + '{', e, 'start')
			let i
			e.nodes && e.nodes.length
				? (this.body(e), (i = this.raw(e, 'after')))
				: (i = this.raw(e, 'after', 'emptyBody')),
				i && this.builder(i),
				this.builder('}', e, 'end')
		}
		body(e) {
			let t = e.nodes.length - 1
			for (; t > 0 && e.nodes[t].type === 'comment'; ) t -= 1
			let n = this.raw(e, 'semicolon')
			for (let i = 0; i < e.nodes.length; i++) {
				let s = e.nodes[i],
					o = this.raw(s, 'before')
				o && this.builder(o), this.stringify(s, t !== i || n)
			}
		}
		comment(e) {
			let t = this.raw(e, 'left', 'commentLeft'),
				n = this.raw(e, 'right', 'commentRight')
			this.builder('/*' + t + e.text + n + '*/', e)
		}
		decl(e, t) {
			let n = this.raw(e, 'between', 'colon'),
				i = e.prop + n + this.rawValue(e, 'value')
			e.important && (i += e.raws.important || ' !important'),
				t && (i += ';'),
				this.builder(i, e)
		}
		document(e) {
			this.body(e)
		}
		raw(e, t, n) {
			let i
			if ((n || (n = t), t && ((i = e.raws[t]), typeof i != 'undefined')))
				return i
			let s = e.parent
			if (
				n === 'before' &&
				(!s ||
					(s.type === 'root' && s.first === e) ||
					(s && s.type === 'document'))
			)
				return ''
			if (!s) return sh[n]
			let o = e.root()
			if (
				(o.rawCache || (o.rawCache = {}),
				typeof o.rawCache[n] != 'undefined')
			)
				return o.rawCache[n]
			if (n === 'before' || n === 'after') return this.beforeAfter(e, n)
			{
				let l = 'raw' + nw(n)
				this[l]
					? (i = this[l](o, e))
					: o.walk((a) => {
							if (((i = a.raws[t]), typeof i != 'undefined'))
								return !1
						})
			}
			return (
				typeof i == 'undefined' && (i = sh[n]), (o.rawCache[n] = i), i
			)
		}
		rawBeforeClose(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length > 0 &&
						typeof n.raws.after != 'undefined'
					)
						return (
							(t = n.raws.after),
							t.includes(`
`) && (t = t.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				t && (t = t.replace(/\S/g, '')),
				t
			)
		}
		rawBeforeComment(e, t) {
			let n
			return (
				e.walkComments((i) => {
					if (typeof i.raws.before != 'undefined')
						return (
							(n = i.raws.before),
							n.includes(`
`) && (n = n.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				typeof n == 'undefined'
					? (n = this.raw(t, null, 'beforeDecl'))
					: n && (n = n.replace(/\S/g, '')),
				n
			)
		}
		rawBeforeDecl(e, t) {
			let n
			return (
				e.walkDecls((i) => {
					if (typeof i.raws.before != 'undefined')
						return (
							(n = i.raws.before),
							n.includes(`
`) && (n = n.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				typeof n == 'undefined'
					? (n = this.raw(t, null, 'beforeRule'))
					: n && (n = n.replace(/\S/g, '')),
				n
			)
		}
		rawBeforeOpen(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.type !== 'decl' &&
						((t = n.raws.between), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawBeforeRule(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						(n.parent !== e || e.first !== n) &&
						typeof n.raws.before != 'undefined'
					)
						return (
							(t = n.raws.before),
							t.includes(`
`) && (t = t.replace(/[^\n]+$/, '')),
							!1
						)
				}),
				t && (t = t.replace(/\S/g, '')),
				t
			)
		}
		rawColon(e) {
			let t
			return (
				e.walkDecls((n) => {
					if (typeof n.raws.between != 'undefined')
						return (t = n.raws.between.replace(/[^\s:]/g, '')), !1
				}),
				t
			)
		}
		rawEmptyBody(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length === 0 &&
						((t = n.raws.after), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawIndent(e) {
			if (e.raws.indent) return e.raws.indent
			let t
			return (
				e.walk((n) => {
					let i = n.parent
					if (
						i &&
						i !== e &&
						i.parent &&
						i.parent === e &&
						typeof n.raws.before != 'undefined'
					) {
						let s = n.raws.before.split(`
`)
						return (
							(t = s[s.length - 1]),
							(t = t.replace(/\S/g, '')),
							!1
						)
					}
				}),
				t
			)
		}
		rawSemicolon(e) {
			let t
			return (
				e.walk((n) => {
					if (
						n.nodes &&
						n.nodes.length &&
						n.last.type === 'decl' &&
						((t = n.raws.semicolon), typeof t != 'undefined')
					)
						return !1
				}),
				t
			)
		}
		rawValue(e, t) {
			let n = e[t],
				i = e.raws[t]
			return i && i.value === n ? i.raw : n
		}
		root(e) {
			this.body(e), e.raws.after && this.builder(e.raws.after)
		}
		rule(e) {
			this.block(e, this.rawValue(e, 'selector')),
				e.raws.ownSemicolon &&
					this.builder(e.raws.ownSemicolon, e, 'end')
		}
		stringify(e, t) {
			if (!this[e.type])
				throw new Error(
					'Unknown AST node type ' +
						e.type +
						'. Maybe you need to change PostCSS stringifier.',
				)
			this[e.type](e, t)
		}
	}
	var oh = wa
	wa.default = wa
	let iw = oh
	function Za(r, e) {
		new iw(e).stringify(r)
	}
	var Gi = Za
	Za.default = Za
	var rn = {}
	;(rn.isClean = Symbol('isClean')), (rn.my = Symbol('my'))
	let sw = Ia,
		ow = oh,
		aw = Gi,
		{ isClean: nn, my: lw } = rn
	function Ta(r, e) {
		let t = new r.constructor()
		for (let n in r) {
			if (
				!Object.prototype.hasOwnProperty.call(r, n) ||
				n === 'proxyCache'
			)
				continue
			let i = r[n],
				s = typeof i
			n === 'parent' && s === 'object'
				? e && (t[n] = e)
				: n === 'source'
					? (t[n] = i)
					: Array.isArray(i)
						? (t[n] = i.map((o) => Ta(o, t)))
						: (s === 'object' && i !== null && (i = Ta(i)),
							(t[n] = i))
		}
		return t
	}
	let Ea = class {
		constructor(e = {}) {
			;(this.raws = {}), (this[nn] = !1), (this[lw] = !0)
			for (let t in e)
				if (t === 'nodes') {
					this.nodes = []
					for (let n of e[t])
						typeof n.clone == 'function'
							? this.append(n.clone())
							: this.append(n)
				} else this[t] = e[t]
		}
		addToError(e) {
			if (
				((e.postcssNode = this),
				e.stack && this.source && /\n\s{4}at /.test(e.stack))
			) {
				let t = this.source
				e.stack = e.stack.replace(
					/\n\s{4}at /,
					`$&${t.input.from}:${t.start.line}:${t.start.column}$&`,
				)
			}
			return e
		}
		after(e) {
			return this.parent.insertAfter(this, e), this
		}
		assign(e = {}) {
			for (let t in e) this[t] = e[t]
			return this
		}
		before(e) {
			return this.parent.insertBefore(this, e), this
		}
		cleanRaws(e) {
			delete this.raws.before,
				delete this.raws.after,
				e || delete this.raws.between
		}
		clone(e = {}) {
			let t = Ta(this)
			for (let n in e) t[n] = e[n]
			return t
		}
		cloneAfter(e = {}) {
			let t = this.clone(e)
			return this.parent.insertAfter(this, t), t
		}
		cloneBefore(e = {}) {
			let t = this.clone(e)
			return this.parent.insertBefore(this, t), t
		}
		error(e, t = {}) {
			if (this.source) {
				let { end: n, start: i } = this.rangeBy(t)
				return this.source.input.error(
					e,
					{ column: i.column, line: i.line },
					{ column: n.column, line: n.line },
					t,
				)
			}
			return new sw(e)
		}
		getProxyProcessor() {
			return {
				get(e, t) {
					return t === 'proxyOf'
						? e
						: t === 'root'
							? () => e.root().toProxy()
							: e[t]
				},
				set(e, t, n) {
					return (
						e[t] === n ||
							((e[t] = n),
							(t === 'prop' ||
								t === 'value' ||
								t === 'name' ||
								t === 'params' ||
								t === 'important' ||
								t === 'text') &&
								e.markDirty()),
						!0
					)
				},
			}
		}
		markClean() {
			this[nn] = !0
		}
		markDirty() {
			if (this[nn]) {
				this[nn] = !1
				let e = this
				for (; (e = e.parent); ) e[nn] = !1
			}
		}
		next() {
			if (!this.parent) return
			let e = this.parent.index(this)
			return this.parent.nodes[e + 1]
		}
		positionBy(e, t) {
			let n = this.source.start
			if (e.index) n = this.positionInside(e.index, t)
			else if (e.word) {
				t = this.toString()
				let i = t.indexOf(e.word)
				i !== -1 && (n = this.positionInside(i, t))
			}
			return n
		}
		positionInside(e, t) {
			let n = t || this.toString(),
				i = this.source.start.column,
				s = this.source.start.line
			for (let o = 0; o < e; o++)
				n[o] ===
				`
`
					? ((i = 1), (s += 1))
					: (i += 1)
			return { column: i, line: s }
		}
		prev() {
			if (!this.parent) return
			let e = this.parent.index(this)
			return this.parent.nodes[e - 1]
		}
		rangeBy(e) {
			let t = {
					column: this.source.start.column,
					line: this.source.start.line,
				},
				n = this.source.end
					? {
							column: this.source.end.column + 1,
							line: this.source.end.line,
						}
					: { column: t.column + 1, line: t.line }
			if (e.word) {
				let i = this.toString(),
					s = i.indexOf(e.word)
				s !== -1 &&
					((t = this.positionInside(s, i)),
					(n = this.positionInside(s + e.word.length, i)))
			} else
				e.start
					? (t = { column: e.start.column, line: e.start.line })
					: e.index && (t = this.positionInside(e.index)),
					e.end
						? (n = { column: e.end.column, line: e.end.line })
						: typeof e.endIndex == 'number'
							? (n = this.positionInside(e.endIndex))
							: e.index && (n = this.positionInside(e.index + 1))
			return (
				(n.line < t.line ||
					(n.line === t.line && n.column <= t.column)) &&
					(n = { column: t.column + 1, line: t.line }),
				{ end: n, start: t }
			)
		}
		raw(e, t) {
			return new ow().raw(this, e, t)
		}
		remove() {
			return (
				this.parent && this.parent.removeChild(this),
				(this.parent = void 0),
				this
			)
		}
		replaceWith(...e) {
			if (this.parent) {
				let t = this,
					n = !1
				for (let i of e)
					i === this
						? (n = !0)
						: n
							? (this.parent.insertAfter(t, i), (t = i))
							: this.parent.insertBefore(t, i)
				n || this.remove()
			}
			return this
		}
		root() {
			let e = this
			for (; e.parent && e.parent.type !== 'document'; ) e = e.parent
			return e
		}
		toJSON(e, t) {
			let n = {},
				i = t == null
			t = t || new Map()
			let s = 0
			for (let o in this) {
				if (
					!Object.prototype.hasOwnProperty.call(this, o) ||
					o === 'parent' ||
					o === 'proxyCache'
				)
					continue
				let l = this[o]
				if (Array.isArray(l))
					n[o] = l.map((a) =>
						typeof a == 'object' && a.toJSON
							? a.toJSON(null, t)
							: a,
					)
				else if (typeof l == 'object' && l.toJSON)
					n[o] = l.toJSON(null, t)
				else if (o === 'source') {
					let a = t.get(l.input)
					a == null && ((a = s), t.set(l.input, s), s++),
						(n[o] = { end: l.end, inputId: a, start: l.start })
				} else n[o] = l
			}
			return i && (n.inputs = [...t.keys()].map((o) => o.toJSON())), n
		}
		toProxy() {
			return (
				this.proxyCache ||
					(this.proxyCache = new Proxy(
						this,
						this.getProxyProcessor(),
					)),
				this.proxyCache
			)
		}
		toString(e = aw) {
			e.stringify && (e = e.stringify)
			let t = ''
			return (
				e(this, (n) => {
					t += n
				}),
				t
			)
		}
		warn(e, t, n) {
			let i = { node: this }
			for (let s in n) i[s] = n[s]
			return e.warn(t, i)
		}
		get proxyOf() {
			return this
		}
	}
	var Vi = Ea
	Ea.default = Ea
	let cw = Vi,
		Ca = class extends cw {
			constructor(e) {
				super(e), (this.type = 'comment')
			}
		}
	var Ni = Ca
	Ca.default = Ca
	let uw = Vi,
		Ga = class extends uw {
			constructor(e) {
				e &&
					typeof e.value != 'undefined' &&
					typeof e.value != 'string' &&
					(e = q(Z({}, e), { value: String(e.value) })),
					super(e),
					(this.type = 'decl')
			}
			get variable() {
				return this.prop.startsWith('--') || this.prop[0] === '$'
			}
		}
	var Li = Ga
	Ga.default = Ga
	let ah = Ni,
		lh = Li,
		dw = Vi,
		{ isClean: ch, my: uh } = rn,
		Va,
		dh,
		hh,
		Na
	function ph(r) {
		return r.map(
			(e) => (e.nodes && (e.nodes = ph(e.nodes)), delete e.source, e),
		)
	}
	function fh(r) {
		if (((r[ch] = !1), r.proxyOf.nodes))
			for (let e of r.proxyOf.nodes) fh(e)
	}
	let yt = class Nf extends dw {
		append(...e) {
			for (let t of e) {
				let n = this.normalize(t, this.last)
				for (let i of n) this.proxyOf.nodes.push(i)
			}
			return this.markDirty(), this
		}
		cleanRaws(e) {
			if ((super.cleanRaws(e), this.nodes))
				for (let t of this.nodes) t.cleanRaws(e)
		}
		each(e) {
			if (!this.proxyOf.nodes) return
			let t = this.getIterator(),
				n,
				i
			for (
				;
				this.indexes[t] < this.proxyOf.nodes.length &&
				((n = this.indexes[t]),
				(i = e(this.proxyOf.nodes[n], n)),
				i !== !1);

			)
				this.indexes[t] += 1
			return delete this.indexes[t], i
		}
		every(e) {
			return this.nodes.every(e)
		}
		getIterator() {
			this.lastEach || (this.lastEach = 0),
				this.indexes || (this.indexes = {}),
				(this.lastEach += 1)
			let e = this.lastEach
			return (this.indexes[e] = 0), e
		}
		getProxyProcessor() {
			return {
				get(e, t) {
					return t === 'proxyOf'
						? e
						: e[t]
							? t === 'each' ||
								(typeof t == 'string' && t.startsWith('walk'))
								? (...n) =>
										e[t](
											...n.map((i) =>
												typeof i == 'function'
													? (s, o) =>
															i(s.toProxy(), o)
													: i,
											),
										)
								: t === 'every' || t === 'some'
									? (n) =>
											e[t]((i, ...s) =>
												n(i.toProxy(), ...s),
											)
									: t === 'root'
										? () => e.root().toProxy()
										: t === 'nodes'
											? e.nodes.map((n) => n.toProxy())
											: t === 'first' || t === 'last'
												? e[t].toProxy()
												: e[t]
							: e[t]
				},
				set(e, t, n) {
					return (
						e[t] === n ||
							((e[t] = n),
							(t === 'name' ||
								t === 'params' ||
								t === 'selector') &&
								e.markDirty()),
						!0
					)
				},
			}
		}
		index(e) {
			return typeof e == 'number'
				? e
				: (e.proxyOf && (e = e.proxyOf), this.proxyOf.nodes.indexOf(e))
		}
		insertAfter(e, t) {
			let n = this.index(e),
				i = this.normalize(t, this.proxyOf.nodes[n]).reverse()
			n = this.index(e)
			for (let o of i) this.proxyOf.nodes.splice(n + 1, 0, o)
			let s
			for (let o in this.indexes)
				(s = this.indexes[o]), n < s && (this.indexes[o] = s + i.length)
			return this.markDirty(), this
		}
		insertBefore(e, t) {
			let n = this.index(e),
				i = n === 0 ? 'prepend' : !1,
				s = this.normalize(t, this.proxyOf.nodes[n], i).reverse()
			n = this.index(e)
			for (let l of s) this.proxyOf.nodes.splice(n, 0, l)
			let o
			for (let l in this.indexes)
				(o = this.indexes[l]),
					n <= o && (this.indexes[l] = o + s.length)
			return this.markDirty(), this
		}
		normalize(e, t) {
			if (typeof e == 'string') e = ph(dh(e).nodes)
			else if (typeof e == 'undefined') e = []
			else if (Array.isArray(e)) {
				e = e.slice(0)
				for (let i of e) i.parent && i.parent.removeChild(i, 'ignore')
			} else if (e.type === 'root' && this.type !== 'document') {
				e = e.nodes.slice(0)
				for (let i of e) i.parent && i.parent.removeChild(i, 'ignore')
			} else if (e.type) e = [e]
			else if (e.prop) {
				if (typeof e.value == 'undefined')
					throw new Error('Value field is missed in node creation')
				typeof e.value != 'string' && (e.value = String(e.value)),
					(e = [new lh(e)])
			} else if (e.selector || e.selectors) e = [new Na(e)]
			else if (e.name) e = [new Va(e)]
			else if (e.text) e = [new ah(e)]
			else throw new Error('Unknown node type in node creation')
			return e.map(
				(i) => (
					i[uh] || Nf.rebuild(i),
					(i = i.proxyOf),
					i.parent && i.parent.removeChild(i),
					i[ch] && fh(i),
					i.raws || (i.raws = {}),
					typeof i.raws.before == 'undefined' &&
						t &&
						typeof t.raws.before != 'undefined' &&
						(i.raws.before = t.raws.before.replace(/\S/g, '')),
					(i.parent = this.proxyOf),
					i
				),
			)
		}
		prepend(...e) {
			e = e.reverse()
			for (let t of e) {
				let n = this.normalize(t, this.first, 'prepend').reverse()
				for (let i of n) this.proxyOf.nodes.unshift(i)
				for (let i in this.indexes)
					this.indexes[i] = this.indexes[i] + n.length
			}
			return this.markDirty(), this
		}
		push(e) {
			return (e.parent = this), this.proxyOf.nodes.push(e), this
		}
		removeAll() {
			for (let e of this.proxyOf.nodes) e.parent = void 0
			return (this.proxyOf.nodes = []), this.markDirty(), this
		}
		removeChild(e) {
			;(e = this.index(e)),
				(this.proxyOf.nodes[e].parent = void 0),
				this.proxyOf.nodes.splice(e, 1)
			let t
			for (let n in this.indexes)
				(t = this.indexes[n]), t >= e && (this.indexes[n] = t - 1)
			return this.markDirty(), this
		}
		replaceValues(e, t, n) {
			return (
				n || ((n = t), (t = {})),
				this.walkDecls((i) => {
					;(t.props && !t.props.includes(i.prop)) ||
						(t.fast && !i.value.includes(t.fast)) ||
						(i.value = i.value.replace(e, n))
				}),
				this.markDirty(),
				this
			)
		}
		some(e) {
			return this.nodes.some(e)
		}
		walk(e) {
			return this.each((t, n) => {
				let i
				try {
					i = e(t, n)
				} catch (s) {
					throw t.addToError(s)
				}
				return i !== !1 && t.walk && (i = t.walk(e)), i
			})
		}
		walkAtRules(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'atrule' && e.test(n.name))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'atrule' && n.name === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'atrule') return t(n, i)
					}))
		}
		walkComments(e) {
			return this.walk((t, n) => {
				if (t.type === 'comment') return e(t, n)
			})
		}
		walkDecls(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'decl' && e.test(n.prop))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'decl' && n.prop === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'decl') return t(n, i)
					}))
		}
		walkRules(e, t) {
			return t
				? e instanceof RegExp
					? this.walk((n, i) => {
							if (n.type === 'rule' && e.test(n.selector))
								return t(n, i)
						})
					: this.walk((n, i) => {
							if (n.type === 'rule' && n.selector === e)
								return t(n, i)
						})
				: ((t = e),
					this.walk((n, i) => {
						if (n.type === 'rule') return t(n, i)
					}))
		}
		get first() {
			if (this.proxyOf.nodes) return this.proxyOf.nodes[0]
		}
		get last() {
			if (this.proxyOf.nodes)
				return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
		}
	}
	;(yt.registerParse = (r) => {
		dh = r
	}),
		(yt.registerRule = (r) => {
			Na = r
		}),
		(yt.registerAtRule = (r) => {
			Va = r
		}),
		(yt.registerRoot = (r) => {
			hh = r
		})
	var Yt = yt
	;(yt.default = yt),
		(yt.rebuild = (r) => {
			r.type === 'atrule'
				? Object.setPrototypeOf(r, Va.prototype)
				: r.type === 'rule'
					? Object.setPrototypeOf(r, Na.prototype)
					: r.type === 'decl'
						? Object.setPrototypeOf(r, lh.prototype)
						: r.type === 'comment'
							? Object.setPrototypeOf(r, ah.prototype)
							: r.type === 'root' &&
								Object.setPrototypeOf(r, hh.prototype),
				(r[uh] = !0),
				r.nodes &&
					r.nodes.forEach((e) => {
						yt.rebuild(e)
					})
		})
	let mh = Yt,
		Xi = class extends mh {
			constructor(e) {
				super(e), (this.type = 'atrule')
			}
			append(...e) {
				return (
					this.proxyOf.nodes || (this.nodes = []), super.append(...e)
				)
			}
			prepend(...e) {
				return (
					this.proxyOf.nodes || (this.nodes = []), super.prepend(...e)
				)
			}
		}
	var La = Xi
	;(Xi.default = Xi), mh.registerAtRule(Xi)
	let hw = Yt,
		yh,
		bh,
		sn = class extends hw {
			constructor(e) {
				super(Z({ type: 'document' }, e)),
					this.nodes || (this.nodes = [])
			}
			toResult(e = {}) {
				return new yh(new bh(), this, e).stringify()
			}
		}
	;(sn.registerLazyResult = (r) => {
		yh = r
	}),
		(sn.registerProcessor = (r) => {
			bh = r
		})
	var Xa = sn
	sn.default = sn
	let pw = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
	var fw = {
		nanoid: (r = 21) => {
			let e = '',
				t = r
			for (; t--; ) e += pw[(Math.random() * 64) | 0]
			return e
		},
		customAlphabet:
			(r, e = 21) =>
			(t = e) => {
				let n = '',
					i = t
				for (; i--; ) n += r[(Math.random() * r.length) | 0]
				return n
			},
	}
	let { existsSync: mw, readFileSync: yw } = ze,
		{ dirname: Wa, join: bw } = ze,
		{ SourceMapConsumer: gh, SourceMapGenerator: Sh } = ze
	function gw(r) {
		return Buffer ? Buffer.from(r, 'base64').toString() : window.atob(r)
	}
	let _a = class {
		constructor(e, t) {
			if (t.map === !1) return
			this.loadAnnotation(e),
				(this.inline = this.startWith(this.annotation, 'data:'))
			let n = t.map ? t.map.prev : void 0,
				i = this.loadMap(t.from, n)
			!this.mapFile && t.from && (this.mapFile = t.from),
				this.mapFile && (this.root = Wa(this.mapFile)),
				i && (this.text = i)
		}
		consumer() {
			return (
				this.consumerCache || (this.consumerCache = new gh(this.text)),
				this.consumerCache
			)
		}
		decodeInline(e) {
			let t = /^data:application\/json;charset=utf-?8;base64,/,
				n = /^data:application\/json;base64,/,
				i = /^data:application\/json;charset=utf-?8,/,
				s = /^data:application\/json,/,
				o = e.match(i) || e.match(s)
			if (o) return decodeURIComponent(e.substr(o[0].length))
			let l = e.match(t) || e.match(n)
			if (l) return gw(e.substr(l[0].length))
			let a = e.match(/data:application\/json;([^,]+),/)[1]
			throw new Error('Unsupported source map encoding ' + a)
		}
		getAnnotationURL(e) {
			return e.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
		}
		isMap(e) {
			return typeof e != 'object'
				? !1
				: typeof e.mappings == 'string' ||
						typeof e._mappings == 'string' ||
						Array.isArray(e.sections)
		}
		loadAnnotation(e) {
			let t = e.match(/\/\*\s*# sourceMappingURL=/g)
			if (!t) return
			let n = e.lastIndexOf(t.pop()),
				i = e.indexOf('*/', n)
			n > -1 &&
				i > -1 &&
				(this.annotation = this.getAnnotationURL(e.substring(n, i)))
		}
		loadFile(e) {
			if (((this.root = Wa(e)), mw(e)))
				return (this.mapFile = e), yw(e, 'utf-8').toString().trim()
		}
		loadMap(e, t) {
			if (t === !1) return !1
			if (t) {
				if (typeof t == 'string') return t
				if (typeof t == 'function') {
					let n = t(e)
					if (n) {
						let i = this.loadFile(n)
						if (!i)
							throw new Error(
								'Unable to load previous source map: ' +
									n.toString(),
							)
						return i
					}
				} else {
					if (t instanceof gh) return Sh.fromSourceMap(t).toString()
					if (t instanceof Sh) return t.toString()
					if (this.isMap(t)) return JSON.stringify(t)
					throw new Error(
						'Unsupported previous source map format: ' +
							t.toString(),
					)
				}
			} else {
				if (this.inline) return this.decodeInline(this.annotation)
				if (this.annotation) {
					let n = this.annotation
					return e && (n = bw(Wa(e), n)), this.loadFile(n)
				}
			}
		}
		startWith(e, t) {
			return e ? e.substr(0, t.length) === t : !1
		}
		withContent() {
			return !!(
				this.consumer().sourcesContent &&
				this.consumer().sourcesContent.length > 0
			)
		}
	}
	var vh = _a
	_a.default = _a
	let { nanoid: Sw } = fw,
		{ isAbsolute: xa, resolve: Oa } = ze,
		{ SourceMapConsumer: vw, SourceMapGenerator: Rw } = ze,
		{ fileURLToPath: Rh, pathToFileURL: Wi } = ze,
		Ih = Ia,
		Iw = vh,
		ka = ze,
		Pa = Symbol('fromOffsetCache'),
		ww = !!(vw && Rw),
		wh = !!(Oa && xa),
		_i = class {
			constructor(e, t = {}) {
				if (
					e === null ||
					typeof e == 'undefined' ||
					(typeof e == 'object' && !e.toString)
				)
					throw new Error(
						`PostCSS received ${e} instead of CSS string`,
					)
				if (
					((this.css = e.toString()),
					this.css[0] === '\uFEFF' || this.css[0] === '￾'
						? ((this.hasBOM = !0), (this.css = this.css.slice(1)))
						: (this.hasBOM = !1),
					t.from &&
						(!wh || /^\w+:\/\//.test(t.from) || xa(t.from)
							? (this.file = t.from)
							: (this.file = Oa(t.from))),
					wh && ww)
				) {
					let n = new Iw(this.css, t)
					if (n.text) {
						this.map = n
						let i = n.consumer().file
						!this.file && i && (this.file = this.mapResolve(i))
					}
				}
				this.file || (this.id = '<input css ' + Sw(6) + '>'),
					this.map && (this.map.file = this.from)
			}
			error(e, t, n, i = {}) {
				let s, o, l
				if (t && typeof t == 'object') {
					let c = t,
						u = n
					if (typeof c.offset == 'number') {
						let d = this.fromOffset(c.offset)
						;(t = d.line), (n = d.col)
					} else (t = c.line), (n = c.column)
					if (typeof u.offset == 'number') {
						let d = this.fromOffset(u.offset)
						;(o = d.line), (s = d.col)
					} else (o = u.line), (s = u.column)
				} else if (!n) {
					let c = this.fromOffset(t)
					;(t = c.line), (n = c.col)
				}
				let a = this.origin(t, n, o, s)
				return (
					a
						? (l = new Ih(
								e,
								a.endLine === void 0
									? a.line
									: { column: a.column, line: a.line },
								a.endLine === void 0
									? a.column
									: { column: a.endColumn, line: a.endLine },
								a.source,
								a.file,
								i.plugin,
							))
						: (l = new Ih(
								e,
								o === void 0 ? t : { column: n, line: t },
								o === void 0 ? n : { column: s, line: o },
								this.css,
								this.file,
								i.plugin,
							)),
					(l.input = {
						column: n,
						endColumn: s,
						endLine: o,
						line: t,
						source: this.css,
					}),
					this.file &&
						(Wi && (l.input.url = Wi(this.file).toString()),
						(l.input.file = this.file)),
					l
				)
			}
			fromOffset(e) {
				let t, n
				if (this[Pa]) n = this[Pa]
				else {
					let s = this.css.split(`
`)
					n = new Array(s.length)
					let o = 0
					for (let l = 0, a = s.length; l < a; l++)
						(n[l] = o), (o += s[l].length + 1)
					this[Pa] = n
				}
				t = n[n.length - 1]
				let i = 0
				if (e >= t) i = n.length - 1
				else {
					let s = n.length - 2,
						o
					for (; i < s; )
						if (((o = i + ((s - i) >> 1)), e < n[o])) s = o - 1
						else if (e >= n[o + 1]) i = o + 1
						else {
							i = o
							break
						}
				}
				return { col: e - n[i] + 1, line: i + 1 }
			}
			mapResolve(e) {
				return /^\w+:\/\//.test(e)
					? e
					: Oa(
							this.map.consumer().sourceRoot ||
								this.map.root ||
								'.',
							e,
						)
			}
			origin(e, t, n, i) {
				if (!this.map) return !1
				let s = this.map.consumer(),
					o = s.originalPositionFor({ column: t, line: e })
				if (!o.source) return !1
				let l
				typeof n == 'number' &&
					(l = s.originalPositionFor({ column: i, line: n }))
				let a
				xa(o.source)
					? (a = Wi(o.source))
					: (a = new URL(
							o.source,
							this.map.consumer().sourceRoot ||
								Wi(this.map.mapFile),
						))
				let c = {
					column: o.column,
					endColumn: l && l.column,
					endLine: l && l.line,
					line: o.line,
					url: a.toString(),
				}
				if (a.protocol === 'file:')
					if (Rh) c.file = Rh(a)
					else
						throw new Error(
							'file: protocol is not available in this PostCSS build',
						)
				let u = s.sourceContentFor(o.source)
				return u && (c.source = u), c
			}
			toJSON() {
				let e = {}
				for (let t of ['hasBOM', 'css', 'file', 'id'])
					this[t] != null && (e[t] = this[t])
				return (
					this.map &&
						((e.map = Z({}, this.map)),
						e.map.consumerCache && (e.map.consumerCache = void 0)),
					e
				)
			}
			get from() {
				return this.file || this.id
			}
		}
	var xi = _i
	;(_i.default = _i), ka && ka.registerInput && ka.registerInput(_i)
	let Zh = Yt,
		Th,
		Eh,
		pr = class extends Zh {
			constructor(e) {
				super(e), (this.type = 'root'), this.nodes || (this.nodes = [])
			}
			normalize(e, t, n) {
				let i = super.normalize(e)
				if (t) {
					if (n === 'prepend')
						this.nodes.length > 1
							? (t.raws.before = this.nodes[1].raws.before)
							: delete t.raws.before
					else if (this.first !== t)
						for (let s of i) s.raws.before = t.raws.before
				}
				return i
			}
			removeChild(e, t) {
				let n = this.index(e)
				return (
					!t &&
						n === 0 &&
						this.nodes.length > 1 &&
						(this.nodes[1].raws.before = this.nodes[n].raws.before),
					super.removeChild(e)
				)
			}
			toResult(e = {}) {
				return new Th(new Eh(), this, e).stringify()
			}
		}
	;(pr.registerLazyResult = (r) => {
		Th = r
	}),
		(pr.registerProcessor = (r) => {
			Eh = r
		})
	var on = pr
	;(pr.default = pr), Zh.registerRoot(pr)
	let an = {
		comma(r) {
			return an.split(r, [','], !0)
		},
		space(r) {
			let e = [
				' ',
				`
`,
				'	',
			]
			return an.split(r, e)
		},
		split(r, e, t) {
			let n = [],
				i = '',
				s = !1,
				o = 0,
				l = !1,
				a = '',
				c = !1
			for (let u of r)
				c
					? (c = !1)
					: u === '\\'
						? (c = !0)
						: l
							? u === a && (l = !1)
							: u === '"' || u === "'"
								? ((l = !0), (a = u))
								: u === '('
									? (o += 1)
									: u === ')'
										? o > 0 && (o -= 1)
										: o === 0 && e.includes(u) && (s = !0),
					s
						? (i !== '' && n.push(i.trim()), (i = ''), (s = !1))
						: (i += u)
			return (t || i !== '') && n.push(i.trim()), n
		},
	}
	var Ch = an
	an.default = an
	let Gh = Yt,
		Zw = Ch,
		Oi = class extends Gh {
			constructor(e) {
				super(e), (this.type = 'rule'), this.nodes || (this.nodes = [])
			}
			get selectors() {
				return Zw.comma(this.selector)
			}
			set selectors(e) {
				let t = this.selector ? this.selector.match(/,\s*/) : null,
					n = t ? t[0] : ',' + this.raw('between', 'beforeOpen')
				this.selector = e.join(n)
			}
		}
	var Ua = Oi
	;(Oi.default = Oi), Gh.registerRule(Oi)
	let Tw = La,
		Ew = Ni,
		Cw = Li,
		Gw = xi,
		Vw = vh,
		Nw = on,
		Lw = Ua
	function ln(r, e) {
		if (Array.isArray(r)) return r.map((o) => ln(o))
		let i = r,
			{ inputs: t } = i,
			n = Ve(i, ['inputs'])
		if (t) {
			e = []
			for (let o of t) {
				let l = q(Z({}, o), { __proto__: Gw.prototype })
				l.map && (l.map = q(Z({}, l.map), { __proto__: Vw.prototype })),
					e.push(l)
			}
		}
		if ((n.nodes && (n.nodes = r.nodes.map((o) => ln(o, e))), n.source)) {
			let s = n.source,
				{ inputId: o } = s,
				l = Ve(s, ['inputId'])
			;(n.source = l), o != null && (n.source.input = e[o])
		}
		if (n.type === 'root') return new Nw(n)
		if (n.type === 'decl') return new Cw(n)
		if (n.type === 'rule') return new Lw(n)
		if (n.type === 'comment') return new Ew(n)
		if (n.type === 'atrule') return new Tw(n)
		throw new Error('Unknown node type: ' + r.type)
	}
	var Xw = ln
	ln.default = ln
	let { dirname: ki, relative: Vh, resolve: Nh, sep: Lh } = ze,
		{ SourceMapConsumer: Xh, SourceMapGenerator: Pi } = ze,
		{ pathToFileURL: Wh } = ze,
		Ww = xi,
		_w = !!(Xh && Pi),
		xw = !!(ki && Nh && Vh && Lh)
	var _h = class {
		constructor(e, t, n, i) {
			;(this.stringify = e),
				(this.mapOpts = n.map || {}),
				(this.root = t),
				(this.opts = n),
				(this.css = i),
				(this.originalCSS = i),
				(this.usesFileUrls =
					!this.mapOpts.from && this.mapOpts.absolute),
				(this.memoizedFileURLs = new Map()),
				(this.memoizedPaths = new Map()),
				(this.memoizedURLs = new Map())
		}
		addAnnotation() {
			let e
			this.isInline()
				? (e =
						'data:application/json;base64,' +
						this.toBase64(this.map.toString()))
				: typeof this.mapOpts.annotation == 'string'
					? (e = this.mapOpts.annotation)
					: typeof this.mapOpts.annotation == 'function'
						? (e = this.mapOpts.annotation(this.opts.to, this.root))
						: (e = this.outputFile() + '.map')
			let t = `
`
			this.css.includes(`\r
`) &&
				(t = `\r
`),
				(this.css += t + '/*# sourceMappingURL=' + e + ' */')
		}
		applyPrevMaps() {
			for (let e of this.previous()) {
				let t = this.toUrl(this.path(e.file)),
					n = e.root || ki(e.file),
					i
				this.mapOpts.sourcesContent === !1
					? ((i = new Xh(e.text)),
						i.sourcesContent && (i.sourcesContent = null))
					: (i = e.consumer()),
					this.map.applySourceMap(i, t, this.toUrl(this.path(n)))
			}
		}
		clearAnnotation() {
			if (this.mapOpts.annotation !== !1)
				if (this.root) {
					let e
					for (let t = this.root.nodes.length - 1; t >= 0; t--)
						(e = this.root.nodes[t]),
							e.type === 'comment' &&
								e.text.startsWith('# sourceMappingURL=') &&
								this.root.removeChild(t)
				} else
					this.css &&
						(this.css = this.css.replace(
							/\n*\/\*#[\S\s]*?\*\/$/gm,
							'',
						))
		}
		generate() {
			if ((this.clearAnnotation(), xw && _w && this.isMap()))
				return this.generateMap()
			{
				let e = ''
				return (
					this.stringify(this.root, (t) => {
						e += t
					}),
					[e]
				)
			}
		}
		generateMap() {
			if (this.root) this.generateString()
			else if (this.previous().length === 1) {
				let e = this.previous()[0].consumer()
				;(e.file = this.outputFile()),
					(this.map = Pi.fromSourceMap(e, {
						ignoreInvalidMapping: !0,
					}))
			} else
				(this.map = new Pi({
					file: this.outputFile(),
					ignoreInvalidMapping: !0,
				})),
					this.map.addMapping({
						generated: { column: 0, line: 1 },
						original: { column: 0, line: 1 },
						source: this.opts.from
							? this.toUrl(this.path(this.opts.from))
							: '<no source>',
					})
			return (
				this.isSourcesContent() && this.setSourcesContent(),
				this.root && this.previous().length > 0 && this.applyPrevMaps(),
				this.isAnnotation() && this.addAnnotation(),
				this.isInline() ? [this.css] : [this.css, this.map]
			)
		}
		generateString() {
			;(this.css = ''),
				(this.map = new Pi({
					file: this.outputFile(),
					ignoreInvalidMapping: !0,
				}))
			let e = 1,
				t = 1,
				n = '<no source>',
				i = {
					generated: { column: 0, line: 0 },
					original: { column: 0, line: 0 },
					source: '',
				},
				s,
				o
			this.stringify(this.root, (l, a, c) => {
				if (
					((this.css += l),
					a &&
						c !== 'end' &&
						((i.generated.line = e),
						(i.generated.column = t - 1),
						a.source && a.source.start
							? ((i.source = this.sourcePath(a)),
								(i.original.line = a.source.start.line),
								(i.original.column = a.source.start.column - 1),
								this.map.addMapping(i))
							: ((i.source = n),
								(i.original.line = 1),
								(i.original.column = 0),
								this.map.addMapping(i))),
					(o = l.match(/\n/g)),
					o
						? ((e += o.length),
							(s = l.lastIndexOf(`
`)),
							(t = l.length - s))
						: (t += l.length),
					a && c !== 'start')
				) {
					let u = a.parent || { raws: {} }
					;(!(
						a.type === 'decl' ||
						(a.type === 'atrule' && !a.nodes)
					) ||
						a !== u.last ||
						u.raws.semicolon) &&
						(a.source && a.source.end
							? ((i.source = this.sourcePath(a)),
								(i.original.line = a.source.end.line),
								(i.original.column = a.source.end.column - 1),
								(i.generated.line = e),
								(i.generated.column = t - 2),
								this.map.addMapping(i))
							: ((i.source = n),
								(i.original.line = 1),
								(i.original.column = 0),
								(i.generated.line = e),
								(i.generated.column = t - 1),
								this.map.addMapping(i)))
				}
			})
		}
		isAnnotation() {
			return this.isInline()
				? !0
				: typeof this.mapOpts.annotation != 'undefined'
					? this.mapOpts.annotation
					: this.previous().length
						? this.previous().some((e) => e.annotation)
						: !0
		}
		isInline() {
			if (typeof this.mapOpts.inline != 'undefined')
				return this.mapOpts.inline
			let e = this.mapOpts.annotation
			return typeof e != 'undefined' && e !== !0
				? !1
				: this.previous().length
					? this.previous().some((t) => t.inline)
					: !0
		}
		isMap() {
			return typeof this.opts.map != 'undefined'
				? !!this.opts.map
				: this.previous().length > 0
		}
		isSourcesContent() {
			return typeof this.mapOpts.sourcesContent != 'undefined'
				? this.mapOpts.sourcesContent
				: this.previous().length
					? this.previous().some((e) => e.withContent())
					: !0
		}
		outputFile() {
			return this.opts.to
				? this.path(this.opts.to)
				: this.opts.from
					? this.path(this.opts.from)
					: 'to.css'
		}
		path(e) {
			if (
				this.mapOpts.absolute ||
				e.charCodeAt(0) === 60 ||
				/^\w+:\/\//.test(e)
			)
				return e
			let t = this.memoizedPaths.get(e)
			if (t) return t
			let n = this.opts.to ? ki(this.opts.to) : '.'
			typeof this.mapOpts.annotation == 'string' &&
				(n = ki(Nh(n, this.mapOpts.annotation)))
			let i = Vh(n, e)
			return this.memoizedPaths.set(e, i), i
		}
		previous() {
			if (!this.previousMaps)
				if (((this.previousMaps = []), this.root))
					this.root.walk((e) => {
						if (e.source && e.source.input.map) {
							let t = e.source.input.map
							this.previousMaps.includes(t) ||
								this.previousMaps.push(t)
						}
					})
				else {
					let e = new Ww(this.originalCSS, this.opts)
					e.map && this.previousMaps.push(e.map)
				}
			return this.previousMaps
		}
		setSourcesContent() {
			let e = {}
			if (this.root)
				this.root.walk((t) => {
					if (t.source) {
						let n = t.source.input.from
						if (n && !e[n]) {
							e[n] = !0
							let i = this.usesFileUrls
								? this.toFileUrl(n)
								: this.toUrl(this.path(n))
							this.map.setSourceContent(i, t.source.input.css)
						}
					}
				})
			else if (this.css) {
				let t = this.opts.from
					? this.toUrl(this.path(this.opts.from))
					: '<no source>'
				this.map.setSourceContent(t, this.css)
			}
		}
		sourcePath(e) {
			return this.mapOpts.from
				? this.toUrl(this.mapOpts.from)
				: this.usesFileUrls
					? this.toFileUrl(e.source.input.from)
					: this.toUrl(this.path(e.source.input.from))
		}
		toBase64(e) {
			return Buffer
				? Buffer.from(e).toString('base64')
				: window.btoa(unescape(encodeURIComponent(e)))
		}
		toFileUrl(e) {
			let t = this.memoizedFileURLs.get(e)
			if (t) return t
			if (Wh) {
				let n = Wh(e).toString()
				return this.memoizedFileURLs.set(e, n), n
			} else
				throw new Error(
					'`map.absolute` option is not available in this PostCSS build',
				)
		}
		toUrl(e) {
			let t = this.memoizedURLs.get(e)
			if (t) return t
			Lh === '\\' && (e = e.replace(/\\/g, '/'))
			let n = encodeURI(e).replace(/[#?]/g, encodeURIComponent)
			return this.memoizedURLs.set(e, n), n
		}
	}
	const Aa = 39,
		xh = 34,
		Ui = 92,
		Oh = 47,
		Ai = 10,
		cn = 32,
		Mi = 12,
		Yi = 9,
		Fi = 13,
		Ow = 91,
		kw = 93,
		Pw = 40,
		Uw = 41,
		Aw = 123,
		Mw = 125,
		Yw = 59,
		Fw = 42,
		Jw = 58,
		Hw = 64,
		Ji = /[\t\n\f\r "#'()/;[\\\]{}]/g,
		Hi = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g,
		Kw = /.[\r\n"'(/\\]/,
		kh = /[\da-f]/i
	var Bw = function (e, t = {}) {
		let n = e.css.valueOf(),
			i = t.ignoreErrors,
			s,
			o,
			l,
			a,
			c,
			u,
			d,
			h,
			p,
			y,
			f = n.length,
			m = 0,
			g = [],
			v = []
		function S() {
			return m
		}
		function I(V) {
			throw e.error('Unclosed ' + V, m)
		}
		function G() {
			return v.length === 0 && m >= f
		}
		function L(V) {
			if (v.length) return v.pop()
			if (m >= f) return
			let P = V ? V.ignoreUnclosed : !1
			switch (((s = n.charCodeAt(m)), s)) {
				case Ai:
				case cn:
				case Yi:
				case Fi:
				case Mi: {
					a = m
					do (a += 1), (s = n.charCodeAt(a))
					while (
						s === cn ||
						s === Ai ||
						s === Yi ||
						s === Fi ||
						s === Mi
					)
					;(u = ['space', n.slice(m, a)]), (m = a - 1)
					break
				}
				case Ow:
				case kw:
				case Aw:
				case Mw:
				case Jw:
				case Yw:
				case Uw: {
					let X = String.fromCharCode(s)
					u = [X, X, m]
					break
				}
				case Pw: {
					if (
						((y = g.length ? g.pop()[1] : ''),
						(p = n.charCodeAt(m + 1)),
						y === 'url' &&
							p !== Aa &&
							p !== xh &&
							p !== cn &&
							p !== Ai &&
							p !== Yi &&
							p !== Mi &&
							p !== Fi)
					) {
						a = m
						do {
							if (
								((d = !1),
								(a = n.indexOf(')', a + 1)),
								a === -1)
							)
								if (i || P) {
									a = m
									break
								} else I('bracket')
							for (h = a; n.charCodeAt(h - 1) === Ui; )
								(h -= 1), (d = !d)
						} while (d)
						;(u = ['brackets', n.slice(m, a + 1), m, a]), (m = a)
					} else
						(a = n.indexOf(')', m + 1)),
							(o = n.slice(m, a + 1)),
							a === -1 || Kw.test(o)
								? (u = ['(', '(', m])
								: ((u = ['brackets', o, m, a]), (m = a))
					break
				}
				case Aa:
				case xh: {
					;(c = s === Aa ? "'" : '"'), (a = m)
					do {
						if (((d = !1), (a = n.indexOf(c, a + 1)), a === -1))
							if (i || P) {
								a = m + 1
								break
							} else I('string')
						for (h = a; n.charCodeAt(h - 1) === Ui; )
							(h -= 1), (d = !d)
					} while (d)
					;(u = ['string', n.slice(m, a + 1), m, a]), (m = a)
					break
				}
				case Hw: {
					;(Ji.lastIndex = m + 1),
						Ji.test(n),
						Ji.lastIndex === 0
							? (a = n.length - 1)
							: (a = Ji.lastIndex - 2),
						(u = ['at-word', n.slice(m, a + 1), m, a]),
						(m = a)
					break
				}
				case Ui: {
					for (a = m, l = !0; n.charCodeAt(a + 1) === Ui; )
						(a += 1), (l = !l)
					if (
						((s = n.charCodeAt(a + 1)),
						l &&
							s !== Oh &&
							s !== cn &&
							s !== Ai &&
							s !== Yi &&
							s !== Fi &&
							s !== Mi &&
							((a += 1), kh.test(n.charAt(a))))
					) {
						for (; kh.test(n.charAt(a + 1)); ) a += 1
						n.charCodeAt(a + 1) === cn && (a += 1)
					}
					;(u = ['word', n.slice(m, a + 1), m, a]), (m = a)
					break
				}
				default: {
					s === Oh && n.charCodeAt(m + 1) === Fw
						? ((a = n.indexOf('*/', m + 2) + 1),
							a === 0 && (i || P ? (a = n.length) : I('comment')),
							(u = ['comment', n.slice(m, a + 1), m, a]),
							(m = a))
						: ((Hi.lastIndex = m + 1),
							Hi.test(n),
							Hi.lastIndex === 0
								? (a = n.length - 1)
								: (a = Hi.lastIndex - 2),
							(u = ['word', n.slice(m, a + 1), m, a]),
							g.push(u),
							(m = a))
					break
				}
			}
			return m++, u
		}
		function w(V) {
			v.push(V)
		}
		return { back: w, endOfFile: G, nextToken: L, position: S }
	}
	let zw = La,
		Dw = Ni,
		jw = Li,
		Qw = on,
		Ph = Ua,
		$w = Bw
	const Uh = { empty: !0, space: !0 }
	function qw(r) {
		for (let e = r.length - 1; e >= 0; e--) {
			let t = r[e],
				n = t[3] || t[2]
			if (n) return n
		}
	}
	var eZ = class {
		constructor(e) {
			;(this.input = e),
				(this.root = new Qw()),
				(this.current = this.root),
				(this.spaces = ''),
				(this.semicolon = !1),
				this.createTokenizer(),
				(this.root.source = {
					input: e,
					start: { column: 1, line: 1, offset: 0 },
				})
		}
		atrule(e) {
			let t = new zw()
			;(t.name = e[1].slice(1)),
				t.name === '' && this.unnamedAtrule(t, e),
				this.init(t, e[2])
			let n,
				i,
				s,
				o = !1,
				l = !1,
				a = [],
				c = []
			for (; !this.tokenizer.endOfFile(); ) {
				if (
					((e = this.tokenizer.nextToken()),
					(n = e[0]),
					n === '(' || n === '['
						? c.push(n === '(' ? ')' : ']')
						: n === '{' && c.length > 0
							? c.push('}')
							: n === c[c.length - 1] && c.pop(),
					c.length === 0)
				)
					if (n === ';') {
						;(t.source.end = this.getPosition(e[2])),
							t.source.end.offset++,
							(this.semicolon = !0)
						break
					} else if (n === '{') {
						l = !0
						break
					} else if (n === '}') {
						if (a.length > 0) {
							for (
								s = a.length - 1, i = a[s];
								i && i[0] === 'space';

							)
								i = a[--s]
							i &&
								((t.source.end = this.getPosition(
									i[3] || i[2],
								)),
								t.source.end.offset++)
						}
						this.end(e)
						break
					} else a.push(e)
				else a.push(e)
				if (this.tokenizer.endOfFile()) {
					o = !0
					break
				}
			}
			;(t.raws.between = this.spacesAndCommentsFromEnd(a)),
				a.length
					? ((t.raws.afterName = this.spacesAndCommentsFromStart(a)),
						this.raw(t, 'params', a),
						o &&
							((e = a[a.length - 1]),
							(t.source.end = this.getPosition(e[3] || e[2])),
							t.source.end.offset++,
							(this.spaces = t.raws.between),
							(t.raws.between = '')))
					: ((t.raws.afterName = ''), (t.params = '')),
				l && ((t.nodes = []), (this.current = t))
		}
		checkMissedSemicolon(e) {
			let t = this.colon(e)
			if (t === !1) return
			let n = 0,
				i
			for (
				let s = t - 1;
				s >= 0 &&
				((i = e[s]), !(i[0] !== 'space' && ((n += 1), n === 2)));
				s--
			);
			throw this.input.error(
				'Missed semicolon',
				i[0] === 'word' ? i[3] + 1 : i[2],
			)
		}
		colon(e) {
			let t = 0,
				n,
				i,
				s
			for (let [o, l] of e.entries()) {
				if (
					((i = l),
					(s = i[0]),
					s === '(' && (t += 1),
					s === ')' && (t -= 1),
					t === 0 && s === ':')
				)
					if (!n) this.doubleColon(i)
					else {
						if (n[0] === 'word' && n[1] === 'progid') continue
						return o
					}
				n = i
			}
			return !1
		}
		comment(e) {
			let t = new Dw()
			this.init(t, e[2]),
				(t.source.end = this.getPosition(e[3] || e[2])),
				t.source.end.offset++
			let n = e[1].slice(2, -2)
			if (/^\s*$/.test(n))
				(t.text = ''), (t.raws.left = n), (t.raws.right = '')
			else {
				let i = n.match(/^(\s*)([^]*\S)(\s*)$/)
				;(t.text = i[2]), (t.raws.left = i[1]), (t.raws.right = i[3])
			}
		}
		createTokenizer() {
			this.tokenizer = $w(this.input)
		}
		decl(e, t) {
			let n = new jw()
			this.init(n, e[0][2])
			let i = e[e.length - 1]
			for (
				i[0] === ';' && ((this.semicolon = !0), e.pop()),
					n.source.end = this.getPosition(i[3] || i[2] || qw(e)),
					n.source.end.offset++;
				e[0][0] !== 'word';

			)
				e.length === 1 && this.unknownWord(e),
					(n.raws.before += e.shift()[1])
			for (
				n.source.start = this.getPosition(e[0][2]), n.prop = '';
				e.length;

			) {
				let c = e[0][0]
				if (c === ':' || c === 'space' || c === 'comment') break
				n.prop += e.shift()[1]
			}
			n.raws.between = ''
			let s
			for (; e.length; )
				if (((s = e.shift()), s[0] === ':')) {
					n.raws.between += s[1]
					break
				} else
					s[0] === 'word' && /\w/.test(s[1]) && this.unknownWord([s]),
						(n.raws.between += s[1])
			;(n.prop[0] === '_' || n.prop[0] === '*') &&
				((n.raws.before += n.prop[0]), (n.prop = n.prop.slice(1)))
			let o = [],
				l
			for (
				;
				e.length &&
				((l = e[0][0]), !(l !== 'space' && l !== 'comment'));

			)
				o.push(e.shift())
			this.precheckMissedSemicolon(e)
			for (let c = e.length - 1; c >= 0; c--) {
				if (((s = e[c]), s[1].toLowerCase() === '!important')) {
					n.important = !0
					let u = this.stringFrom(e, c)
					;(u = this.spacesFromEnd(e) + u),
						u !== ' !important' && (n.raws.important = u)
					break
				} else if (s[1].toLowerCase() === 'important') {
					let u = e.slice(0),
						d = ''
					for (let h = c; h > 0; h--) {
						let p = u[h][0]
						if (d.trim().startsWith('!') && p !== 'space') break
						d = u.pop()[1] + d
					}
					d.trim().startsWith('!') &&
						((n.important = !0), (n.raws.important = d), (e = u))
				}
				if (s[0] !== 'space' && s[0] !== 'comment') break
			}
			e.some((c) => c[0] !== 'space' && c[0] !== 'comment') &&
				((n.raws.between += o.map((c) => c[1]).join('')), (o = [])),
				this.raw(n, 'value', o.concat(e), t),
				n.value.includes(':') && !t && this.checkMissedSemicolon(e)
		}
		doubleColon(e) {
			throw this.input.error(
				'Double colon',
				{ offset: e[2] },
				{ offset: e[2] + e[1].length },
			)
		}
		emptyRule(e) {
			let t = new Ph()
			this.init(t, e[2]),
				(t.selector = ''),
				(t.raws.between = ''),
				(this.current = t)
		}
		end(e) {
			this.current.nodes &&
				this.current.nodes.length &&
				(this.current.raws.semicolon = this.semicolon),
				(this.semicolon = !1),
				(this.current.raws.after =
					(this.current.raws.after || '') + this.spaces),
				(this.spaces = ''),
				this.current.parent
					? ((this.current.source.end = this.getPosition(e[2])),
						this.current.source.end.offset++,
						(this.current = this.current.parent))
					: this.unexpectedClose(e)
		}
		endFile() {
			this.current.parent && this.unclosedBlock(),
				this.current.nodes &&
					this.current.nodes.length &&
					(this.current.raws.semicolon = this.semicolon),
				(this.current.raws.after =
					(this.current.raws.after || '') + this.spaces),
				(this.root.source.end = this.getPosition(
					this.tokenizer.position(),
				))
		}
		freeSemicolon(e) {
			if (((this.spaces += e[1]), this.current.nodes)) {
				let t = this.current.nodes[this.current.nodes.length - 1]
				t &&
					t.type === 'rule' &&
					!t.raws.ownSemicolon &&
					((t.raws.ownSemicolon = this.spaces), (this.spaces = ''))
			}
		}
		getPosition(e) {
			let t = this.input.fromOffset(e)
			return { column: t.col, line: t.line, offset: e }
		}
		init(e, t) {
			this.current.push(e),
				(e.source = { input: this.input, start: this.getPosition(t) }),
				(e.raws.before = this.spaces),
				(this.spaces = ''),
				e.type !== 'comment' && (this.semicolon = !1)
		}
		other(e) {
			let t = !1,
				n = null,
				i = !1,
				s = null,
				o = [],
				l = e[1].startsWith('--'),
				a = [],
				c = e
			for (; c; ) {
				if (((n = c[0]), a.push(c), n === '(' || n === '['))
					s || (s = c), o.push(n === '(' ? ')' : ']')
				else if (l && i && n === '{') s || (s = c), o.push('}')
				else if (o.length === 0)
					if (n === ';')
						if (i) {
							this.decl(a, l)
							return
						} else break
					else if (n === '{') {
						this.rule(a)
						return
					} else if (n === '}') {
						this.tokenizer.back(a.pop()), (t = !0)
						break
					} else n === ':' && (i = !0)
				else
					n === o[o.length - 1] &&
						(o.pop(), o.length === 0 && (s = null))
				c = this.tokenizer.nextToken()
			}
			if (
				(this.tokenizer.endOfFile() && (t = !0),
				o.length > 0 && this.unclosedBracket(s),
				t && i)
			) {
				if (!l)
					for (
						;
						a.length &&
						((c = a[a.length - 1][0]),
						!(c !== 'space' && c !== 'comment'));

					)
						this.tokenizer.back(a.pop())
				this.decl(a, l)
			} else this.unknownWord(a)
		}
		parse() {
			let e
			for (; !this.tokenizer.endOfFile(); )
				switch (((e = this.tokenizer.nextToken()), e[0])) {
					case 'space':
						this.spaces += e[1]
						break
					case ';':
						this.freeSemicolon(e)
						break
					case '}':
						this.end(e)
						break
					case 'comment':
						this.comment(e)
						break
					case 'at-word':
						this.atrule(e)
						break
					case '{':
						this.emptyRule(e)
						break
					default:
						this.other(e)
						break
				}
			this.endFile()
		}
		precheckMissedSemicolon() {}
		raw(e, t, n, i) {
			let s,
				o,
				l = n.length,
				a = '',
				c = !0,
				u,
				d
			for (let h = 0; h < l; h += 1)
				(s = n[h]),
					(o = s[0]),
					o === 'space' && h === l - 1 && !i
						? (c = !1)
						: o === 'comment'
							? ((d = n[h - 1] ? n[h - 1][0] : 'empty'),
								(u = n[h + 1] ? n[h + 1][0] : 'empty'),
								!Uh[d] && !Uh[u]
									? a.slice(-1) === ','
										? (c = !1)
										: (a += s[1])
									: (c = !1))
							: (a += s[1])
			if (!c) {
				let h = n.reduce((p, y) => p + y[1], '')
				e.raws[t] = { raw: h, value: a }
			}
			e[t] = a
		}
		rule(e) {
			e.pop()
			let t = new Ph()
			this.init(t, e[0][2]),
				(t.raws.between = this.spacesAndCommentsFromEnd(e)),
				this.raw(t, 'selector', e),
				(this.current = t)
		}
		spacesAndCommentsFromEnd(e) {
			let t,
				n = ''
			for (
				;
				e.length &&
				((t = e[e.length - 1][0]), !(t !== 'space' && t !== 'comment'));

			)
				n = e.pop()[1] + n
			return n
		}
		spacesAndCommentsFromStart(e) {
			let t,
				n = ''
			for (
				;
				e.length &&
				((t = e[0][0]), !(t !== 'space' && t !== 'comment'));

			)
				n += e.shift()[1]
			return n
		}
		spacesFromEnd(e) {
			let t,
				n = ''
			for (; e.length && ((t = e[e.length - 1][0]), t === 'space'); )
				n = e.pop()[1] + n
			return n
		}
		stringFrom(e, t) {
			let n = ''
			for (let i = t; i < e.length; i++) n += e[i][1]
			return e.splice(t, e.length - t), n
		}
		unclosedBlock() {
			let e = this.current.source.start
			throw this.input.error('Unclosed block', e.line, e.column)
		}
		unclosedBracket(e) {
			throw this.input.error(
				'Unclosed bracket',
				{ offset: e[2] },
				{ offset: e[2] + 1 },
			)
		}
		unexpectedClose(e) {
			throw this.input.error(
				'Unexpected }',
				{ offset: e[2] },
				{ offset: e[2] + 1 },
			)
		}
		unknownWord(e) {
			throw this.input.error(
				'Unknown word',
				{ offset: e[0][2] },
				{ offset: e[0][2] + e[0][1].length },
			)
		}
		unnamedAtrule(e, t) {
			throw this.input.error(
				'At-rule without name',
				{ offset: t[2] },
				{ offset: t[2] + t[1].length },
			)
		}
	}
	let tZ = Yt,
		rZ = xi,
		nZ = eZ
	function Ki(r, e) {
		let t = new rZ(r, e),
			n = new nZ(t)
		try {
			n.parse()
		} catch (i) {
			throw (
				(process.env.NODE_ENV !== 'production' &&
					i.name === 'CssSyntaxError' &&
					e &&
					e.from &&
					(/\.scss$/i.test(e.from)
						? (i.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser`)
						: /\.sass/i.test(e.from)
							? (i.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser`)
							: /\.less$/i.test(e.from) &&
								(i.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)),
				i)
			)
		}
		return n.root
	}
	var Ma = Ki
	;(Ki.default = Ki), tZ.registerParse(Ki)
	let Ya = class {
		constructor(e, t = {}) {
			if (
				((this.type = 'warning'),
				(this.text = e),
				t.node && t.node.source)
			) {
				let n = t.node.rangeBy(t)
				;(this.line = n.start.line),
					(this.column = n.start.column),
					(this.endLine = n.end.line),
					(this.endColumn = n.end.column)
			}
			for (let n in t) this[n] = t[n]
		}
		toString() {
			return this.node
				? this.node.error(this.text, {
						index: this.index,
						plugin: this.plugin,
						word: this.word,
					}).message
				: this.plugin
					? this.plugin + ': ' + this.text
					: this.text
		}
	}
	var Ah = Ya
	Ya.default = Ya
	let iZ = Ah,
		Fa = class {
			constructor(e, t, n) {
				;(this.processor = e),
					(this.messages = []),
					(this.root = t),
					(this.opts = n),
					(this.css = void 0),
					(this.map = void 0)
			}
			toString() {
				return this.css
			}
			warn(e, t = {}) {
				t.plugin ||
					(this.lastPlugin &&
						this.lastPlugin.postcssPlugin &&
						(t.plugin = this.lastPlugin.postcssPlugin))
				let n = new iZ(e, t)
				return this.messages.push(n), n
			}
			warnings() {
				return this.messages.filter((e) => e.type === 'warning')
			}
			get content() {
				return this.css
			}
		}
	var Ja = Fa
	Fa.default = Fa
	let Mh = {}
	var Yh = function (e) {
		Mh[e] ||
			((Mh[e] = !0),
			typeof console != 'undefined' && console.warn && console.warn(e))
	}
	let sZ = Yt,
		oZ = Xa,
		aZ = _h,
		lZ = Ma,
		Fh = Ja,
		cZ = on,
		uZ = Gi,
		{ isClean: rt, my: dZ } = rn,
		hZ = Yh
	const pZ = {
			atrule: 'AtRule',
			comment: 'Comment',
			decl: 'Declaration',
			document: 'Document',
			root: 'Root',
			rule: 'Rule',
		},
		fZ = {
			AtRule: !0,
			AtRuleExit: !0,
			Comment: !0,
			CommentExit: !0,
			Declaration: !0,
			DeclarationExit: !0,
			Document: !0,
			DocumentExit: !0,
			Once: !0,
			OnceExit: !0,
			postcssPlugin: !0,
			prepare: !0,
			Root: !0,
			RootExit: !0,
			Rule: !0,
			RuleExit: !0,
		},
		mZ = { Once: !0, postcssPlugin: !0, prepare: !0 },
		fr = 0
	function un(r) {
		return typeof r == 'object' && typeof r.then == 'function'
	}
	function Jh(r) {
		let e = !1,
			t = pZ[r.type]
		return (
			r.type === 'decl'
				? (e = r.prop.toLowerCase())
				: r.type === 'atrule' && (e = r.name.toLowerCase()),
			e && r.append
				? [t, t + '-' + e, fr, t + 'Exit', t + 'Exit-' + e]
				: e
					? [t, t + '-' + e, t + 'Exit', t + 'Exit-' + e]
					: r.append
						? [t, fr, t + 'Exit']
						: [t, t + 'Exit']
		)
	}
	function Hh(r) {
		let e
		return (
			r.type === 'document'
				? (e = ['Document', fr, 'DocumentExit'])
				: r.type === 'root'
					? (e = ['Root', fr, 'RootExit'])
					: (e = Jh(r)),
			{
				eventIndex: 0,
				events: e,
				iterator: 0,
				node: r,
				visitorIndex: 0,
				visitors: [],
			}
		)
	}
	function Ha(r) {
		return (r[rt] = !1), r.nodes && r.nodes.forEach((e) => Ha(e)), r
	}
	let Ka = {},
		mr = class Lf {
			constructor(e, t, n) {
				;(this.stringified = !1), (this.processed = !1)
				let i
				if (
					typeof t == 'object' &&
					t !== null &&
					(t.type === 'root' || t.type === 'document')
				)
					i = Ha(t)
				else if (t instanceof Lf || t instanceof Fh)
					(i = Ha(t.root)),
						t.map &&
							(typeof n.map == 'undefined' && (n.map = {}),
							n.map.inline || (n.map.inline = !1),
							(n.map.prev = t.map))
				else {
					let s = lZ
					n.syntax && (s = n.syntax.parse),
						n.parser && (s = n.parser),
						s.parse && (s = s.parse)
					try {
						i = s(t, n)
					} catch (o) {
						;(this.processed = !0), (this.error = o)
					}
					i && !i[dZ] && sZ.rebuild(i)
				}
				;(this.result = new Fh(e, i, n)),
					(this.helpers = q(Z({}, Ka), {
						postcss: Ka,
						result: this.result,
					})),
					(this.plugins = this.processor.plugins.map((s) =>
						typeof s == 'object' && s.prepare
							? Z(Z({}, s), s.prepare(this.result))
							: s,
					))
			}
			async() {
				return this.error
					? Promise.reject(this.error)
					: this.processed
						? Promise.resolve(this.result)
						: (this.processing ||
								(this.processing = this.runAsync()),
							this.processing)
			}
			catch(e) {
				return this.async().catch(e)
			}
			finally(e) {
				return this.async().then(e, e)
			}
			getAsyncError() {
				throw new Error(
					'Use process(css).then(cb) to work with async plugins',
				)
			}
			handleError(e, t) {
				let n = this.result.lastPlugin
				try {
					if (
						(t && t.addToError(e),
						(this.error = e),
						e.name === 'CssSyntaxError' && !e.plugin)
					)
						(e.plugin = n.postcssPlugin), e.setMessage()
					else if (
						n.postcssVersion &&
						process.env.NODE_ENV !== 'production'
					) {
						let i = n.postcssPlugin,
							s = n.postcssVersion,
							o = this.result.processor.version,
							l = s.split('.'),
							a = o.split('.')
						;(l[0] !== a[0] || parseInt(l[1]) > parseInt(a[1])) &&
							console.error(
								'Unknown error from PostCSS plugin. Your current PostCSS version is ' +
									o +
									', but ' +
									i +
									' uses ' +
									s +
									'. Perhaps this is the source of the error below.',
							)
					}
				} catch (i) {
					console && console.error && console.error(i)
				}
				return e
			}
			prepareVisitors() {
				this.listeners = {}
				let e = (t, n, i) => {
					this.listeners[n] || (this.listeners[n] = []),
						this.listeners[n].push([t, i])
				}
				for (let t of this.plugins)
					if (typeof t == 'object')
						for (let n in t) {
							if (!fZ[n] && /^[A-Z]/.test(n))
								throw new Error(
									`Unknown event ${n} in ${t.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`,
								)
							if (!mZ[n])
								if (typeof t[n] == 'object')
									for (let i in t[n])
										i === '*'
											? e(t, n, t[n][i])
											: e(
													t,
													n + '-' + i.toLowerCase(),
													t[n][i],
												)
								else typeof t[n] == 'function' && e(t, n, t[n])
						}
				this.hasListener = Object.keys(this.listeners).length > 0
			}
			runAsync() {
				return z(this, null, function* () {
					this.plugin = 0
					for (let e = 0; e < this.plugins.length; e++) {
						let t = this.plugins[e],
							n = this.runOnRoot(t)
						if (un(n))
							try {
								yield n
							} catch (i) {
								throw this.handleError(i)
							}
					}
					if ((this.prepareVisitors(), this.hasListener)) {
						let e = this.result.root
						for (; !e[rt]; ) {
							e[rt] = !0
							let t = [Hh(e)]
							for (; t.length > 0; ) {
								let n = this.visitTick(t)
								if (un(n))
									try {
										yield n
									} catch (i) {
										let s = t[t.length - 1].node
										throw this.handleError(i, s)
									}
							}
						}
						if (this.listeners.OnceExit)
							for (let [t, n] of this.listeners.OnceExit) {
								this.result.lastPlugin = t
								try {
									if (e.type === 'document') {
										let i = e.nodes.map((s) =>
											n(s, this.helpers),
										)
										yield Promise.all(i)
									} else yield n(e, this.helpers)
								} catch (i) {
									throw this.handleError(i)
								}
							}
					}
					return (this.processed = !0), this.stringify()
				})
			}
			runOnRoot(e) {
				this.result.lastPlugin = e
				try {
					if (typeof e == 'object' && e.Once) {
						if (this.result.root.type === 'document') {
							let t = this.result.root.nodes.map((n) =>
								e.Once(n, this.helpers),
							)
							return un(t[0]) ? Promise.all(t) : t
						}
						return e.Once(this.result.root, this.helpers)
					} else if (typeof e == 'function')
						return e(this.result.root, this.result)
				} catch (t) {
					throw this.handleError(t)
				}
			}
			stringify() {
				if (this.error) throw this.error
				if (this.stringified) return this.result
				;(this.stringified = !0), this.sync()
				let e = this.result.opts,
					t = uZ
				e.syntax && (t = e.syntax.stringify),
					e.stringifier && (t = e.stringifier),
					t.stringify && (t = t.stringify)
				let i = new aZ(t, this.result.root, this.result.opts).generate()
				return (
					(this.result.css = i[0]),
					(this.result.map = i[1]),
					this.result
				)
			}
			sync() {
				if (this.error) throw this.error
				if (this.processed) return this.result
				if (((this.processed = !0), this.processing))
					throw this.getAsyncError()
				for (let e of this.plugins) {
					let t = this.runOnRoot(e)
					if (un(t)) throw this.getAsyncError()
				}
				if ((this.prepareVisitors(), this.hasListener)) {
					let e = this.result.root
					for (; !e[rt]; ) (e[rt] = !0), this.walkSync(e)
					if (this.listeners.OnceExit)
						if (e.type === 'document')
							for (let t of e.nodes)
								this.visitSync(this.listeners.OnceExit, t)
						else this.visitSync(this.listeners.OnceExit, e)
				}
				return this.result
			}
			then(e, t) {
				return (
					process.env.NODE_ENV !== 'production' &&
						('from' in this.opts ||
							hZ(
								'Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.',
							)),
					this.async().then(e, t)
				)
			}
			toString() {
				return this.css
			}
			visitSync(e, t) {
				for (let [n, i] of e) {
					this.result.lastPlugin = n
					let s
					try {
						s = i(t, this.helpers)
					} catch (o) {
						throw this.handleError(o, t.proxyOf)
					}
					if (t.type !== 'root' && t.type !== 'document' && !t.parent)
						return !0
					if (un(s)) throw this.getAsyncError()
				}
			}
			visitTick(e) {
				let t = e[e.length - 1],
					{ node: n, visitors: i } = t
				if (n.type !== 'root' && n.type !== 'document' && !n.parent) {
					e.pop()
					return
				}
				if (i.length > 0 && t.visitorIndex < i.length) {
					let [o, l] = i[t.visitorIndex]
					;(t.visitorIndex += 1),
						t.visitorIndex === i.length &&
							((t.visitors = []), (t.visitorIndex = 0)),
						(this.result.lastPlugin = o)
					try {
						return l(n.toProxy(), this.helpers)
					} catch (a) {
						throw this.handleError(a, n)
					}
				}
				if (t.iterator !== 0) {
					let o = t.iterator,
						l
					for (; (l = n.nodes[n.indexes[o]]); )
						if (((n.indexes[o] += 1), !l[rt])) {
							;(l[rt] = !0), e.push(Hh(l))
							return
						}
					;(t.iterator = 0), delete n.indexes[o]
				}
				let s = t.events
				for (; t.eventIndex < s.length; ) {
					let o = s[t.eventIndex]
					if (((t.eventIndex += 1), o === fr)) {
						n.nodes &&
							n.nodes.length &&
							((n[rt] = !0), (t.iterator = n.getIterator()))
						return
					} else if (this.listeners[o]) {
						t.visitors = this.listeners[o]
						return
					}
				}
				e.pop()
			}
			walkSync(e) {
				e[rt] = !0
				let t = Jh(e)
				for (let n of t)
					if (n === fr)
						e.nodes &&
							e.each((i) => {
								i[rt] || this.walkSync(i)
							})
					else {
						let i = this.listeners[n]
						if (i && this.visitSync(i, e.toProxy())) return
					}
			}
			warnings() {
				return this.sync().warnings()
			}
			get content() {
				return this.stringify().content
			}
			get css() {
				return this.stringify().css
			}
			get map() {
				return this.stringify().map
			}
			get messages() {
				return this.sync().messages
			}
			get opts() {
				return this.result.opts
			}
			get processor() {
				return this.result.processor
			}
			get root() {
				return this.sync().root
			}
			get [Symbol.toStringTag]() {
				return 'LazyResult'
			}
		}
	mr.registerPostcss = (r) => {
		Ka = r
	}
	var Kh = mr
	;(mr.default = mr), cZ.registerLazyResult(mr), oZ.registerLazyResult(mr)
	let yZ = _h,
		bZ = Ma
	const gZ = Ja
	let SZ = Gi,
		vZ = Yh,
		Ba = class {
			constructor(e, t, n) {
				;(t = t.toString()),
					(this.stringified = !1),
					(this._processor = e),
					(this._css = t),
					(this._opts = n),
					(this._map = void 0)
				let i,
					s = SZ
				;(this.result = new gZ(this._processor, i, this._opts)),
					(this.result.css = t)
				let o = this
				Object.defineProperty(this.result, 'root', {
					get() {
						return o.root
					},
				})
				let l = new yZ(s, i, this._opts, t)
				if (l.isMap()) {
					let [a, c] = l.generate()
					a && (this.result.css = a), c && (this.result.map = c)
				} else l.clearAnnotation(), (this.result.css = l.css)
			}
			async() {
				return this.error
					? Promise.reject(this.error)
					: Promise.resolve(this.result)
			}
			catch(e) {
				return this.async().catch(e)
			}
			finally(e) {
				return this.async().then(e, e)
			}
			sync() {
				if (this.error) throw this.error
				return this.result
			}
			then(e, t) {
				return (
					process.env.NODE_ENV !== 'production' &&
						('from' in this._opts ||
							vZ(
								'Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.',
							)),
					this.async().then(e, t)
				)
			}
			toString() {
				return this._css
			}
			warnings() {
				return []
			}
			get content() {
				return this.result.css
			}
			get css() {
				return this.result.css
			}
			get map() {
				return this.result.map
			}
			get messages() {
				return []
			}
			get opts() {
				return this.result.opts
			}
			get processor() {
				return this.result.processor
			}
			get root() {
				if (this._root) return this._root
				let e,
					t = bZ
				try {
					e = t(this._css, this._opts)
				} catch (n) {
					this.error = n
				}
				if (this.error) throw this.error
				return (this._root = e), e
			}
			get [Symbol.toStringTag]() {
				return 'NoWorkResult'
			}
		}
	var RZ = Ba
	Ba.default = Ba
	let IZ = Xa,
		wZ = Kh,
		ZZ = RZ,
		TZ = on,
		dn = class {
			constructor(e = []) {
				;(this.version = '8.4.47'), (this.plugins = this.normalize(e))
			}
			normalize(e) {
				let t = []
				for (let n of e)
					if (
						(n.postcss === !0
							? (n = n())
							: n.postcss && (n = n.postcss),
						typeof n == 'object' && Array.isArray(n.plugins))
					)
						t = t.concat(n.plugins)
					else if (typeof n == 'object' && n.postcssPlugin) t.push(n)
					else if (typeof n == 'function') t.push(n)
					else if (typeof n == 'object' && (n.parse || n.stringify)) {
						if (process.env.NODE_ENV !== 'production')
							throw new Error(
								'PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.',
							)
					} else throw new Error(n + ' is not a PostCSS plugin')
				return t
			}
			process(e, t = {}) {
				return !this.plugins.length &&
					!t.parser &&
					!t.stringifier &&
					!t.syntax
					? new ZZ(this, e, t)
					: new wZ(this, e, t)
			}
			use(e) {
				return (
					(this.plugins = this.plugins.concat(this.normalize([e]))),
					this
				)
			}
		}
	var EZ = dn
	;(dn.default = dn), TZ.registerProcessor(dn), IZ.registerProcessor(dn)
	let Bh = La,
		zh = Ni,
		CZ = Yt,
		GZ = Ia,
		Dh = Li,
		jh = Xa,
		VZ = Xw,
		NZ = xi,
		LZ = Kh,
		XZ = Ch,
		WZ = Vi,
		_Z = Ma,
		za = EZ,
		xZ = Ja,
		Qh = on,
		$h = Ua,
		OZ = Gi,
		kZ = Ah
	function re(...r) {
		return r.length === 1 && Array.isArray(r[0]) && (r = r[0]), new za(r)
	}
	;(re.plugin = function (e, t) {
		let n = !1
		function i(...o) {
			console &&
				console.warn &&
				!n &&
				((n = !0),
				console.warn(
					e +
						`: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`,
				),
				process.env.LANG &&
					process.env.LANG.startsWith('cn') &&
					console.warn(
						e +
							`: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`,
					))
			let l = t(...o)
			return (
				(l.postcssPlugin = e), (l.postcssVersion = new za().version), l
			)
		}
		let s
		return (
			Object.defineProperty(i, 'postcss', {
				get() {
					return s || (s = i()), s
				},
			}),
			(i.process = function (o, l, a) {
				return re([i(a)]).process(o, l)
			}),
			i
		)
	}),
		(re.stringify = OZ),
		(re.parse = _Z),
		(re.fromJSON = VZ),
		(re.list = XZ),
		(re.comment = (r) => new zh(r)),
		(re.atRule = (r) => new Bh(r)),
		(re.decl = (r) => new Dh(r)),
		(re.rule = (r) => new $h(r)),
		(re.root = (r) => new Qh(r)),
		(re.document = (r) => new jh(r)),
		(re.CssSyntaxError = GZ),
		(re.Declaration = Dh),
		(re.Container = CZ),
		(re.Processor = za),
		(re.Document = jh),
		(re.Comment = zh),
		(re.Warning = kZ),
		(re.AtRule = Bh),
		(re.Result = xZ),
		(re.Input = NZ),
		(re.Rule = $h),
		(re.Root = Qh),
		(re.Node = WZ),
		LZ.registerPostcss(re),
		(re.default = re)
	class Da {
		constructor(...e) {
			Pe(this, 'parentElement', null),
				Pe(this, 'parentNode', null),
				Pe(this, 'ownerDocument'),
				Pe(this, 'firstChild', null),
				Pe(this, 'lastChild', null),
				Pe(this, 'previousSibling', null),
				Pe(this, 'nextSibling', null),
				Pe(this, 'ELEMENT_NODE', 1),
				Pe(this, 'TEXT_NODE', 3),
				Pe(this, 'nodeType'),
				Pe(this, 'nodeName'),
				Pe(this, 'RRNodeType')
		}
		get childNodes() {
			const e = []
			let t = this.firstChild
			for (; t; ) e.push(t), (t = t.nextSibling)
			return e
		}
		contains(e) {
			if (e instanceof Da) {
				if (e.ownerDocument !== this.ownerDocument) return !1
				if (e === this) return !0
			} else return !1
			for (; e.parentNode; ) {
				if (e.parentNode === this) return !0
				e = e.parentNode
			}
			return !1
		}
		appendChild(e) {
			throw new Error(
				"RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.",
			)
		}
		insertBefore(e, t) {
			throw new Error(
				"RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.",
			)
		}
		removeChild(e) {
			throw new Error(
				"RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.",
			)
		}
		toString() {
			return 'RRNode'
		}
	}
	const qh = {
			Node: ['childNodes', 'parentNode', 'parentElement', 'textContent'],
			ShadowRoot: ['host', 'styleSheets'],
			Element: ['shadowRoot', 'querySelector', 'querySelectorAll'],
			MutationObserver: [],
		},
		ep = {
			Node: ['contains', 'getRootNode'],
			ShadowRoot: ['getSelection'],
			Element: [],
			MutationObserver: ['constructor'],
		},
		Bi = {}
	function ja(r) {
		if (Bi[r]) return Bi[r]
		const e = globalThis[r],
			t = e.prototype,
			n = r in qh ? qh[r] : void 0,
			i = !!(
				n &&
				n.every((l) => {
					var a, c
					return !!(
						(c =
							(a = Object.getOwnPropertyDescriptor(t, l)) == null
								? void 0
								: a.get) != null &&
						c.toString().includes('[native code]')
					)
				})
			),
			s = r in ep ? ep[r] : void 0,
			o = !!(
				s &&
				s.every((l) => {
					var a
					return (
						typeof t[l] == 'function' &&
						((a = t[l]) == null
							? void 0
							: a.toString().includes('[native code]'))
					)
				})
			)
		if (i && o) return (Bi[r] = e.prototype), e.prototype
		try {
			const l = document.createElement('iframe')
			document.body.appendChild(l)
			const a = l.contentWindow
			if (!a) return e.prototype
			const c = a[r].prototype
			return document.body.removeChild(l), c ? (Bi[r] = c) : t
		} catch (l) {
			return t
		}
	}
	const Qa = {}
	function Zt(r, e, t) {
		var n
		const i = `${r}.${String(t)}`
		if (Qa[i]) return Qa[i].call(e)
		const s = ja(r),
			o =
				(n = Object.getOwnPropertyDescriptor(s, t)) == null
					? void 0
					: n.get
		return o ? ((Qa[i] = o), o.call(e)) : e[t]
	}
	const $a = {}
	function tp(r, e, t) {
		const n = `${r}.${String(t)}`
		if ($a[n]) return $a[n].bind(e)
		const s = ja(r)[t]
		return typeof s != 'function' ? e[t] : (($a[n] = s), s.bind(e))
	}
	function PZ(r) {
		return Zt('Node', r, 'childNodes')
	}
	function UZ(r) {
		return Zt('Node', r, 'parentNode')
	}
	function AZ(r) {
		return Zt('Node', r, 'parentElement')
	}
	function MZ(r) {
		return Zt('Node', r, 'textContent')
	}
	function YZ(r, e) {
		return tp('Node', r, 'contains')(e)
	}
	function FZ(r) {
		return tp('Node', r, 'getRootNode')()
	}
	function JZ(r) {
		return !r || !('host' in r) ? null : Zt('ShadowRoot', r, 'host')
	}
	function HZ(r) {
		return r.styleSheets
	}
	function KZ(r) {
		return !r || !('shadowRoot' in r)
			? null
			: Zt('Element', r, 'shadowRoot')
	}
	function BZ(r, e) {
		return Zt('Element', r, 'querySelector')(e)
	}
	function zZ(r, e) {
		return Zt('Element', r, 'querySelectorAll')(e)
	}
	function rp() {
		return ja('MutationObserver').constructor
	}
	const J = {
		childNodes: PZ,
		parentNode: UZ,
		parentElement: AZ,
		textContent: MZ,
		contains: YZ,
		getRootNode: FZ,
		host: JZ,
		styleSheets: HZ,
		shadowRoot: KZ,
		querySelector: BZ,
		querySelectorAll: zZ,
		mutationObserver: rp,
	}
	function Te(r, e, t = document) {
		const n = { capture: !0 }
		return t.addEventListener(r, e, n), () => t.removeEventListener(r, e, n)
	}
	const yr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`
	let np = {
		map: {},
		getId() {
			return console.error(yr), -1
		},
		getNode() {
			return console.error(yr), null
		},
		removeNodeFromMap() {
			console.error(yr)
		},
		has() {
			return console.error(yr), !1
		},
		reset() {
			console.error(yr)
		},
	}
	typeof window != 'undefined' &&
		window.Proxy &&
		window.Reflect &&
		(np = new Proxy(np, {
			get(r, e, t) {
				return e === 'map' && console.error(yr), Reflect.get(r, e, t)
			},
		}))
	function hn(r, e, t = {}) {
		let n = null,
			i = 0
		return function (...s) {
			const o = Date.now()
			!i && t.leading === !1 && (i = o)
			const l = e - (o - i),
				a = this
			l <= 0 || l > e
				? (n && (clearTimeout(n), (n = null)), (i = o), r.apply(a, s))
				: !n &&
					t.trailing !== !1 &&
					(n = setTimeout(() => {
						;(i = t.leading === !1 ? 0 : Date.now()),
							(n = null),
							r.apply(a, s)
					}, l))
		}
	}
	function zi(r, e, t, n, i = window) {
		const s = i.Object.getOwnPropertyDescriptor(r, e)
		return (
			i.Object.defineProperty(
				r,
				e,
				n
					? t
					: {
							set(o) {
								setTimeout(() => {
									t.set.call(this, o)
								}, 0),
									s && s.set && s.set.call(this, o)
							},
						},
			),
			() => zi(r, e, s || {}, !0)
		)
	}
	function br(r, e, t) {
		try {
			if (!(e in r)) return () => {}
			const n = r[e],
				i = t(n)
			return (
				typeof i == 'function' &&
					((i.prototype = i.prototype || {}),
					Object.defineProperties(i, {
						__rrweb_original__: { enumerable: !1, value: n },
					})),
				(r[e] = i),
				() => {
					r[e] = n
				}
			)
		} catch (n) {
			return () => {}
		}
	}
	let Di = Date.now
	;/[1-9][0-9]{12}/.test(Date.now().toString()) ||
		(Di = () => new Date().getTime())
	function ip(r) {
		var e, t, n, i
		const s = r.document
		return {
			left: s.scrollingElement
				? s.scrollingElement.scrollLeft
				: r.pageXOffset !== void 0
					? r.pageXOffset
					: s.documentElement.scrollLeft ||
						((s == null ? void 0 : s.body) &&
							((e = J.parentElement(s.body)) == null
								? void 0
								: e.scrollLeft)) ||
						((t = s == null ? void 0 : s.body) == null
							? void 0
							: t.scrollLeft) ||
						0,
			top: s.scrollingElement
				? s.scrollingElement.scrollTop
				: r.pageYOffset !== void 0
					? r.pageYOffset
					: (s == null ? void 0 : s.documentElement.scrollTop) ||
						((s == null ? void 0 : s.body) &&
							((n = J.parentElement(s.body)) == null
								? void 0
								: n.scrollTop)) ||
						((i = s == null ? void 0 : s.body) == null
							? void 0
							: i.scrollTop) ||
						0,
		}
	}
	function sp() {
		return (
			window.innerHeight ||
			(document.documentElement &&
				document.documentElement.clientHeight) ||
			(document.body && document.body.clientHeight)
		)
	}
	function op() {
		return (
			window.innerWidth ||
			(document.documentElement &&
				document.documentElement.clientWidth) ||
			(document.body && document.body.clientWidth)
		)
	}
	function ap(r) {
		return r
			? r.nodeType === r.ELEMENT_NODE
				? r
				: J.parentElement(r)
			: null
	}
	const DZ = (r) => {
		try {
			if (r instanceof HTMLElement) return r.tagName === 'CANVAS'
		} catch (e) {
			return !1
		}
		return !1
	}
	function Ie(r, e, t, n) {
		if (!r) return !1
		const i = ap(r)
		if (!i) return !1
		try {
			if (typeof e == 'string') {
				if (
					i.classList.contains(e) ||
					(n && i.closest('.' + e) !== null)
				)
					return !0
			} else if (li(i, e, n)) return !0
		} catch (s) {}
		return !!(t && (i.matches(t) || (n && i.closest(t) !== null)))
	}
	function jZ(r, e) {
		return e.getId(r) !== -1
	}
	function qa(r, e, t) {
		return r.tagName === 'TITLE' && t.headTitleMutations
			? !0
			: e.getId(r) === Kr
	}
	function lp(r, e) {
		if (Jr(r)) return !1
		const t = e.getId(r)
		if (!e.has(t)) return !0
		const n = J.parentNode(r)
		return n && n.nodeType === r.DOCUMENT_NODE ? !1 : n ? lp(n, e) : !0
	}
	function el(r) {
		return !!r.changedTouches
	}
	function QZ(r = window) {
		'NodeList' in r &&
			!r.NodeList.prototype.forEach &&
			(r.NodeList.prototype.forEach = Array.prototype.forEach),
			'DOMTokenList' in r &&
				!r.DOMTokenList.prototype.forEach &&
				(r.DOMTokenList.prototype.forEach = Array.prototype.forEach)
	}
	function cp(r, e) {
		return !!(r.nodeName === 'IFRAME' && e.getMeta(r))
	}
	function up(r, e) {
		return !!(
			r.nodeName === 'LINK' &&
			r.nodeType === r.ELEMENT_NODE &&
			r.getAttribute &&
			r.getAttribute('rel') === 'stylesheet' &&
			e.getMeta(r)
		)
	}
	function tl(r) {
		return r
			? r instanceof Da && 'shadowRoot' in r
				? !!r.shadowRoot
				: !!J.shadowRoot(r)
			: !1
	}
	class $Z {
		constructor() {
			E(this, 'id', 1),
				E(this, 'styleIDMap', new WeakMap()),
				E(this, 'idStyleMap', new Map())
		}
		getId(e) {
			var t
			return (t = this.styleIDMap.get(e)) != null ? t : -1
		}
		has(e) {
			return this.styleIDMap.has(e)
		}
		add(e, t) {
			if (this.has(e)) return this.getId(e)
			let n
			return (
				t === void 0 ? (n = this.id++) : (n = t),
				this.styleIDMap.set(e, n),
				this.idStyleMap.set(n, e),
				n
			)
		}
		getStyle(e) {
			return this.idStyleMap.get(e) || null
		}
		reset() {
			;(this.styleIDMap = new WeakMap()),
				(this.idStyleMap = new Map()),
				(this.id = 1)
		}
		generateId() {
			return this.id++
		}
	}
	function dp(r) {
		var e
		let t = null
		return (
			'getRootNode' in r &&
				((e = J.getRootNode(r)) == null ? void 0 : e.nodeType) ===
					Node.DOCUMENT_FRAGMENT_NODE &&
				J.host(J.getRootNode(r)) &&
				(t = J.host(J.getRootNode(r))),
			t
		)
	}
	function qZ(r) {
		let e = r,
			t
		for (; (t = dp(e)); ) e = t
		return e
	}
	function eT(r) {
		const e = r.ownerDocument
		if (!e) return !1
		const t = qZ(r)
		return J.contains(e, t)
	}
	function hp(r) {
		const e = r.ownerDocument
		return e ? J.contains(e, r) || eT(r) : !1
	}
	var B = ((r) => (
			(r[(r.DomContentLoaded = 0)] = 'DomContentLoaded'),
			(r[(r.Load = 1)] = 'Load'),
			(r[(r.FullSnapshot = 2)] = 'FullSnapshot'),
			(r[(r.IncrementalSnapshot = 3)] = 'IncrementalSnapshot'),
			(r[(r.Meta = 4)] = 'Meta'),
			(r[(r.Custom = 5)] = 'Custom'),
			(r[(r.Plugin = 6)] = 'Plugin'),
			r
		))(B || {}),
		H = ((r) => (
			(r[(r.Mutation = 0)] = 'Mutation'),
			(r[(r.MouseMove = 1)] = 'MouseMove'),
			(r[(r.MouseInteraction = 2)] = 'MouseInteraction'),
			(r[(r.Scroll = 3)] = 'Scroll'),
			(r[(r.ViewportResize = 4)] = 'ViewportResize'),
			(r[(r.Input = 5)] = 'Input'),
			(r[(r.TouchMove = 6)] = 'TouchMove'),
			(r[(r.MediaInteraction = 7)] = 'MediaInteraction'),
			(r[(r.StyleSheetRule = 8)] = 'StyleSheetRule'),
			(r[(r.CanvasMutation = 9)] = 'CanvasMutation'),
			(r[(r.Font = 10)] = 'Font'),
			(r[(r.Log = 11)] = 'Log'),
			(r[(r.Drag = 12)] = 'Drag'),
			(r[(r.StyleDeclaration = 13)] = 'StyleDeclaration'),
			(r[(r.Selection = 14)] = 'Selection'),
			(r[(r.AdoptedStyleSheet = 15)] = 'AdoptedStyleSheet'),
			(r[(r.CustomElement = 16)] = 'CustomElement'),
			r
		))(H || {}),
		Ge = ((r) => (
			(r[(r.MouseUp = 0)] = 'MouseUp'),
			(r[(r.MouseDown = 1)] = 'MouseDown'),
			(r[(r.Click = 2)] = 'Click'),
			(r[(r.ContextMenu = 3)] = 'ContextMenu'),
			(r[(r.DblClick = 4)] = 'DblClick'),
			(r[(r.Focus = 5)] = 'Focus'),
			(r[(r.Blur = 6)] = 'Blur'),
			(r[(r.TouchStart = 7)] = 'TouchStart'),
			(r[(r.TouchMove_Departed = 8)] = 'TouchMove_Departed'),
			(r[(r.TouchEnd = 9)] = 'TouchEnd'),
			(r[(r.TouchCancel = 10)] = 'TouchCancel'),
			r
		))(Ge || {}),
		Tt = ((r) => (
			(r[(r.Mouse = 0)] = 'Mouse'),
			(r[(r.Pen = 1)] = 'Pen'),
			(r[(r.Touch = 2)] = 'Touch'),
			r
		))(Tt || {}),
		gr = ((r) => (
			(r[(r['2D'] = 0)] = '2D'),
			(r[(r.WebGL = 1)] = 'WebGL'),
			(r[(r.WebGL2 = 2)] = 'WebGL2'),
			r
		))(gr || {}),
		Sr = ((r) => (
			(r[(r.Play = 0)] = 'Play'),
			(r[(r.Pause = 1)] = 'Pause'),
			(r[(r.Seeked = 2)] = 'Seeked'),
			(r[(r.VolumeChange = 3)] = 'VolumeChange'),
			(r[(r.RateChange = 4)] = 'RateChange'),
			r
		))(Sr || {})
	function pp(r) {
		return '__ln' in r
	}
	class tT {
		constructor() {
			E(this, 'length', 0), E(this, 'head', null), E(this, 'tail', null)
		}
		get(e) {
			if (e >= this.length)
				throw new Error('Position outside of list range')
			let t = this.head
			for (let n = 0; n < e; n++)
				t = (t == null ? void 0 : t.next) || null
			return t
		}
		addNode(e) {
			const t = { value: e, previous: null, next: null }
			if (((e.__ln = t), e.previousSibling && pp(e.previousSibling))) {
				const n = e.previousSibling.__ln.next
				;(t.next = n),
					(t.previous = e.previousSibling.__ln),
					(e.previousSibling.__ln.next = t),
					n && (n.previous = t)
			} else if (
				e.nextSibling &&
				pp(e.nextSibling) &&
				e.nextSibling.__ln.previous
			) {
				const n = e.nextSibling.__ln.previous
				;(t.previous = n),
					(t.next = e.nextSibling.__ln),
					(e.nextSibling.__ln.previous = t),
					n && (n.next = t)
			} else
				this.head && (this.head.previous = t),
					(t.next = this.head),
					(this.head = t)
			t.next === null && (this.tail = t), this.length++
		}
		removeNode(e) {
			const t = e.__ln
			this.head &&
				(t.previous
					? ((t.previous.next = t.next),
						t.next
							? (t.next.previous = t.previous)
							: (this.tail = t.previous))
					: ((this.head = t.next),
						this.head
							? (this.head.previous = null)
							: (this.tail = null)),
				e.__ln && delete e.__ln,
				this.length--)
		}
	}
	const fp = (r, e) => `${r}@${e}`
	class rT {
		constructor() {
			E(this, 'frozen', !1),
				E(this, 'locked', !1),
				E(this, 'texts', []),
				E(this, 'attributes', []),
				E(this, 'attributeMap', new WeakMap()),
				E(this, 'removes', []),
				E(this, 'mapRemoves', []),
				E(this, 'movedMap', {}),
				E(this, 'addedSet', new Set()),
				E(this, 'movedSet', new Set()),
				E(this, 'droppedSet', new Set()),
				E(this, 'removesSubTreeCache', new Set()),
				E(this, 'mutationCb'),
				E(this, 'blockClass'),
				E(this, 'blockSelector'),
				E(this, 'maskTextClass'),
				E(this, 'maskTextSelector'),
				E(this, 'inlineStylesheet'),
				E(this, 'maskInputOptions'),
				E(this, 'maskTextFn'),
				E(this, 'maskInputFn'),
				E(this, 'keepIframeSrcFn'),
				E(this, 'recordCanvas'),
				E(this, 'inlineImages'),
				E(this, 'privacySetting'),
				E(this, 'slimDOMOptions'),
				E(this, 'dataURLOptions'),
				E(this, 'doc'),
				E(this, 'mirror'),
				E(this, 'iframeManager'),
				E(this, 'stylesheetManager'),
				E(this, 'shadowDomManager'),
				E(this, 'canvasManager'),
				E(this, 'processedNodeManager'),
				E(this, 'unattachedDoc'),
				E(this, 'processMutations', (e) => {
					e.forEach(this.processMutation), this.emit()
				}),
				E(this, 'emit', () => {
					if (this.frozen || this.locked) return
					const e = [],
						t = new Set(),
						n = new tT(),
						i = (a) => {
							let c = a,
								u = Kr
							for (; u === Kr; )
								(c = c && c.nextSibling),
									(u = c && this.mirror.getId(c))
							return u
						},
						s = (a) => {
							const c = J.parentNode(a)
							if (!c || !hp(a)) return
							let u = !1
							if (a.nodeType === Node.TEXT_NODE) {
								const y = c.tagName
								if (y === 'TEXTAREA') return
								y === 'STYLE' &&
									this.addedSet.has(c) &&
									(u = !0)
							}
							const d = Jr(c)
									? this.mirror.getId(dp(a))
									: this.mirror.getId(c),
								h = i(a)
							if (d === -1 || h === -1) return n.addNode(a)
							const p = cr(a, {
								doc: this.doc,
								mirror: this.mirror,
								blockClass: this.blockClass,
								blockSelector: this.blockSelector,
								maskTextClass: this.maskTextClass,
								maskTextSelector: this.maskTextSelector,
								skipChild: !0,
								newlyAddedElement: !0,
								inlineStylesheet: this.inlineStylesheet,
								maskInputOptions: this.maskInputOptions,
								maskTextFn: this.maskTextFn,
								maskInputFn: this.maskInputFn,
								slimDOMOptions: this.slimDOMOptions,
								dataURLOptions: this.dataURLOptions,
								recordCanvas: this.recordCanvas,
								inlineImages: this.inlineImages,
								privacySetting: this.privacySetting,
								onSerialize: (y) => {
									cp(y, this.mirror) &&
										this.iframeManager.addIframe(y),
										up(y, this.mirror) &&
											this.stylesheetManager.trackLinkElement(
												y,
											),
										tl(a) &&
											this.shadowDomManager.addShadowRoot(
												J.shadowRoot(a),
												this.doc,
											)
								},
								onIframeLoad: (y, f) => {
									this.iframeManager.attachIframe(y, f),
										this.shadowDomManager.observeAttachShadow(
											y,
										)
								},
								onStylesheetLoad: (y, f) => {
									this.stylesheetManager.attachLinkElement(
										y,
										f,
									)
								},
								cssCaptured: u,
							})
							p &&
								(e.push({ parentId: d, nextId: h, node: p }),
								t.add(p.id))
						}
					for (; this.mapRemoves.length; )
						this.mirror.removeNodeFromMap(this.mapRemoves.shift())
					for (const a of this.movedSet)
						(mp(this.removesSubTreeCache, a) &&
							!this.movedSet.has(J.parentNode(a))) ||
							s(a)
					for (const a of this.addedSet)
						(!yp(this.droppedSet, a) &&
							!mp(this.removesSubTreeCache, a)) ||
						yp(this.movedSet, a)
							? s(a)
							: this.droppedSet.add(a)
					let o = null
					for (; n.length; ) {
						let a = null
						if (o) {
							const c = this.mirror.getId(J.parentNode(o.value)),
								u = i(o.value)
							c !== -1 && u !== -1 && (a = o)
						}
						if (!a) {
							let c = n.tail
							for (; c; ) {
								const u = c
								if (((c = c.previous), u)) {
									const d = this.mirror.getId(
										J.parentNode(u.value),
									)
									if (i(u.value) === -1) continue
									if (d !== -1) {
										a = u
										break
									} else {
										const p = u.value,
											y = J.parentNode(p)
										if (
											y &&
											y.nodeType ===
												Node.DOCUMENT_FRAGMENT_NODE
										) {
											const f = J.host(y)
											if (this.mirror.getId(f) !== -1) {
												a = u
												break
											}
										}
									}
								}
							}
						}
						if (!a) {
							for (; n.head; ) n.removeNode(n.head.value)
							break
						}
						;(o = a.previous), n.removeNode(a.value), s(a.value)
					}
					const l = {
						texts: this.texts
							.map((a) => {
								var c, u
								const d = a.node,
									h = J.parentNode(d)
								h &&
									h.tagName === 'TEXTAREA' &&
									this.genTextAreaValueMutation(h)
								let p = a.value
								const y = this.privacySetting === 'strict',
									f =
										this.privacySetting === 'default' &&
										ju(p),
									m =
										(u =
											(c = a.node) == null
												? void 0
												: c.parentElement) == null
											? void 0
											: u.getAttribute('data-hl-record')
								return (
									(y || f) && !m && p && (p = Yo(p)),
									{ id: this.mirror.getId(d), value: p }
								)
							})
							.filter((a) => !t.has(a.id))
							.filter((a) => this.mirror.has(a.id)),
						attributes: this.attributes
							.map((a) => {
								const { attributes: c } = a
								if (typeof c.style == 'string') {
									const u = JSON.stringify(a.styleDiff),
										d = JSON.stringify(a._unchangedStyles)
									u.length < c.style.length &&
										(u + d).split('var(').length ===
											c.style.split('var(').length &&
										(c.style = a.styleDiff)
								}
								return {
									id: this.mirror.getId(a.node),
									attributes: c,
								}
							})
							.filter((a) => !t.has(a.id))
							.filter((a) => this.mirror.has(a.id)),
						removes: this.removes,
						adds: e,
					}
					;(!l.texts.length &&
						!l.attributes.length &&
						!l.removes.length &&
						!l.adds.length) ||
						((this.texts = []),
						(this.attributes = []),
						(this.attributeMap = new WeakMap()),
						(this.removes = []),
						(this.addedSet = new Set()),
						(this.movedSet = new Set()),
						(this.droppedSet = new Set()),
						(this.removesSubTreeCache = new Set()),
						(this.movedMap = {}),
						this.mutationCb(l))
				}),
				E(this, 'genTextAreaValueMutation', (e) => {
					let t = this.attributeMap.get(e)
					t ||
						((t = {
							node: e,
							attributes: {},
							styleDiff: {},
							_unchangedStyles: {},
						}),
						this.attributes.push(t),
						this.attributeMap.set(e, t)),
						(t.attributes.value = Array.from(
							J.childNodes(e),
							(n) => J.textContent(n) || '',
						).join(''))
				}),
				E(this, 'processMutation', (e) => {
					if (!qa(e.target, this.mirror, this.slimDOMOptions))
						switch (e.type) {
							case 'characterData': {
								const t = J.textContent(e.target)
								!Ie(
									e.target,
									this.blockClass,
									this.blockSelector,
									!1,
								) &&
									t !== e.oldValue &&
									this.texts.push({
										value:
											id(
												e.target,
												this.maskTextClass,
												this.maskTextSelector,
												!0,
											) && t
												? this.maskTextFn
													? this.maskTextFn(
															t,
															ap(e.target),
														)
													: t.replace(/[\S]/g, '*')
												: t,
										node: e.target,
									})
								break
							}
							case 'attributes': {
								const t = e.target
								let n = e.attributeName,
									i = e.target.getAttribute(n)
								if (n === 'value') {
									const o = Ao(t)
									i = Uo({
										element: t,
										maskInputOptions: this.maskInputOptions,
										tagName: t.tagName,
										type: o,
										value: i,
										overwriteRecord:
											t.getAttribute('data-hl-record'),
										maskInputFn: this.maskInputFn,
									})
								}
								if (
									Ie(
										e.target,
										this.blockClass,
										this.blockSelector,
										!1,
									) ||
									i === e.oldValue
								)
									return
								let s = this.attributeMap.get(e.target)
								if (
									t.tagName === 'IFRAME' &&
									n === 'src' &&
									!this.keepIframeSrcFn(i)
								)
									if (!t.contentDocument) n = 'rr_src'
									else return
								if (
									(s ||
										((s = {
											node: e.target,
											attributes: {},
											styleDiff: {},
											_unchangedStyles: {},
										}),
										this.attributes.push(s),
										this.attributeMap.set(e.target, s)),
									n === 'type' &&
										t.tagName === 'INPUT' &&
										(e.oldValue || '').toLowerCase() ===
											'password' &&
										t.setAttribute(
											'data-rr-is-password',
											'true',
										),
									!rd(t.tagName, n))
								) {
									if (e.target.tagName === 'INPUT') {
										const l = e.target
										if (l.type === 'password') {
											s.attributes.value = '*'.repeat(
												l.value.length,
											)
											break
										}
									}
									if (
										((s.attributes[n] = td(
											this.doc,
											or(t.tagName),
											or(n),
											i,
										)),
										n === 'style')
									) {
										if (!this.unattachedDoc)
											try {
												this.unattachedDoc =
													document.implementation.createHTMLDocument()
											} catch (a) {
												this.unattachedDoc = this.doc
											}
										const l =
											this.unattachedDoc.createElement(
												'span',
											)
										e.oldValue &&
											l.setAttribute('style', e.oldValue)
										for (const a of Array.from(t.style)) {
											const c =
													t.style.getPropertyValue(a),
												u =
													t.style.getPropertyPriority(
														a,
													)
											c !== l.style.getPropertyValue(a) ||
											u !== l.style.getPropertyPriority(a)
												? u === ''
													? (s.styleDiff[a] = c)
													: (s.styleDiff[a] = [c, u])
												: (s._unchangedStyles[a] = [
														c,
														u,
													])
										}
										for (const a of Array.from(l.style))
											t.style.getPropertyValue(a) ===
												'' && (s.styleDiff[a] = !1)
									} else
										n === 'open' &&
											t.tagName === 'DIALOG' &&
											(t.matches('dialog:modal')
												? (s.attributes.rr_open_mode =
														'modal')
												: (s.attributes.rr_open_mode =
														'non-modal'))
								}
								break
							}
							case 'childList': {
								if (
									Ie(
										e.target,
										this.blockClass,
										this.blockSelector,
										!0,
									)
								)
									return
								if (e.target.tagName === 'TEXTAREA') {
									this.genTextAreaValueMutation(e.target)
									return
								}
								e.addedNodes.forEach((t) =>
									this.genAdds(t, e.target),
								),
									e.removedNodes.forEach((t) => {
										const n = this.mirror.getId(t),
											i = Jr(e.target)
												? this.mirror.getId(
														J.host(e.target),
													)
												: this.mirror.getId(e.target)
										Ie(
											e.target,
											this.blockClass,
											this.blockSelector,
											!1,
										) ||
											qa(
												t,
												this.mirror,
												this.slimDOMOptions,
											) ||
											!jZ(t, this.mirror) ||
											(this.addedSet.has(t)
												? (rl(this.addedSet, t),
													this.droppedSet.add(t))
												: (this.addedSet.has(
														e.target,
													) &&
														n === -1) ||
													lp(e.target, this.mirror) ||
													(this.movedSet.has(t) &&
													this.movedMap[fp(n, i)]
														? rl(this.movedSet, t)
														: (this.removes.push({
																parentId: i,
																id: n,
																isShadow:
																	Jr(
																		e.target,
																	) &&
																	Hr(e.target)
																		? !0
																		: void 0,
															}),
															nT(
																t,
																this
																	.removesSubTreeCache,
															))),
											this.mapRemoves.push(t))
									})
								break
							}
						}
				}),
				E(this, 'genAdds', (e, t) => {
					if (
						!this.processedNodeManager.inOtherBuffer(e, this) &&
						!(this.addedSet.has(e) || this.movedSet.has(e))
					) {
						if (this.mirror.hasNode(e)) {
							if (qa(e, this.mirror, this.slimDOMOptions)) return
							this.movedSet.add(e)
							let n = null
							t &&
								this.mirror.hasNode(t) &&
								(n = this.mirror.getId(t)),
								n &&
									n !== -1 &&
									(this.movedMap[
										fp(this.mirror.getId(e), n)
									] = !0)
						} else this.addedSet.add(e), this.droppedSet.delete(e)
						Ie(e, this.blockClass, this.blockSelector, !1) ||
							(J.childNodes(e).forEach((n) => this.genAdds(n)),
							tl(e) &&
								J.childNodes(J.shadowRoot(e)).forEach((n) => {
									this.processedNodeManager.add(n, this),
										this.genAdds(n, e)
								}))
					}
				})
		}
		init(e) {
			;[
				'mutationCb',
				'blockClass',
				'blockSelector',
				'maskTextClass',
				'maskTextSelector',
				'inlineStylesheet',
				'maskInputOptions',
				'maskTextFn',
				'maskInputFn',
				'keepIframeSrcFn',
				'recordCanvas',
				'inlineImages',
				'privacySetting',
				'slimDOMOptions',
				'dataURLOptions',
				'doc',
				'mirror',
				'iframeManager',
				'stylesheetManager',
				'shadowDomManager',
				'canvasManager',
				'processedNodeManager',
			].forEach((t) => {
				this[t] = e[t]
			})
		}
		freeze() {
			;(this.frozen = !0), this.canvasManager.freeze()
		}
		unfreeze() {
			;(this.frozen = !1), this.canvasManager.unfreeze(), this.emit()
		}
		isFrozen() {
			return this.frozen
		}
		lock() {
			;(this.locked = !0), this.canvasManager.lock()
		}
		unlock() {
			;(this.locked = !1), this.canvasManager.unlock(), this.emit()
		}
		reset() {
			this.shadowDomManager.reset(), this.canvasManager.reset()
		}
	}
	function rl(r, e) {
		r.delete(e), J.childNodes(e).forEach((t) => rl(r, t))
	}
	function nT(r, e) {
		const t = [r]
		for (; t.length; ) {
			const n = t.pop()
			e.has(n) || (e.add(n), J.childNodes(n).forEach((i) => t.push(i)))
		}
	}
	function mp(r, e, t) {
		return r.size === 0 ? !1 : iT(r, e)
	}
	function iT(r, e, t) {
		const n = J.parentNode(e)
		return n ? r.has(n) : !1
	}
	function yp(r, e) {
		return r.size === 0 ? !1 : bp(r, e)
	}
	function bp(r, e) {
		const t = J.parentNode(e)
		return t ? (r.has(t) ? !0 : bp(r, t)) : !1
	}
	let pn
	function sT(r) {
		pn = r
	}
	function oT() {
		pn = void 0
	}
	const K = (r) =>
			pn
				? (...t) => {
						try {
							return r(...t)
						} catch (n) {
							if (pn && pn(n) === !0) return
							throw n
						}
					}
				: r,
		Ft = []
	function fn(r) {
		try {
			if ('composedPath' in r) {
				const e = r.composedPath()
				if (e.length) return e[0]
			} else if ('path' in r && r.path.length) return r.path[0]
		} catch (e) {}
		return r && r.target
	}
	function gp(r, e) {
		const t = new rT()
		Ft.push(t), t.init(r)
		const n = new (rp())(K(t.processMutations.bind(t)))
		return (
			n.observe(e, {
				attributes: !0,
				attributeOldValue: !0,
				characterData: !0,
				characterDataOldValue: !0,
				childList: !0,
				subtree: !0,
			}),
			n
		)
	}
	function aT({ mousemoveCb: r, sampling: e, doc: t, mirror: n }) {
		if (e.mousemove === !1) return () => {}
		const i = typeof e.mousemove == 'number' ? e.mousemove : 50,
			s =
				typeof e.mousemoveCallback == 'number'
					? e.mousemoveCallback
					: 500
		let o = [],
			l
		const a = hn(
				K((d) => {
					const h = Date.now() - l
					r(
						o.map((p) => ((p.timeOffset -= h), p)),
						d,
					),
						(o = []),
						(l = null)
				}),
				s,
			),
			c = K(
				hn(
					K((d) => {
						const h = fn(d),
							{ clientX: p, clientY: y } = el(d)
								? d.changedTouches[0]
								: d
						l || (l = Di()),
							o.push({
								x: p,
								y,
								id: n.getId(h),
								timeOffset: Di() - l,
							}),
							a(
								typeof DragEvent != 'undefined' &&
									d instanceof DragEvent
									? H.Drag
									: d instanceof MouseEvent
										? H.MouseMove
										: H.TouchMove,
							)
					}),
					i,
					{ trailing: !1 },
				),
			),
			u = [Te('mousemove', c, t), Te('touchmove', c, t), Te('drag', c, t)]
		return K(() => {
			u.forEach((d) => d())
		})
	}
	function lT({
		mouseInteractionCb: r,
		doc: e,
		mirror: t,
		blockClass: n,
		blockSelector: i,
		sampling: s,
	}) {
		if (s.mouseInteraction === !1) return () => {}
		const o =
				s.mouseInteraction === !0 || s.mouseInteraction === void 0
					? {}
					: s.mouseInteraction,
			l = []
		let a = null
		const c = (u) => (d) => {
			const h = fn(d)
			if (Ie(h, n, i, !0) || DZ(h)) return
			let p = null,
				y = u
			if ('pointerType' in d) {
				switch (d.pointerType) {
					case 'mouse':
						p = Tt.Mouse
						break
					case 'touch':
						p = Tt.Touch
						break
					case 'pen':
						p = Tt.Pen
						break
				}
				p === Tt.Touch &&
					(Ge[u] === Ge.MouseDown
						? (y = 'TouchStart')
						: Ge[u] === Ge.MouseUp && (y = 'TouchEnd'))
			} else el(d) && (p = Tt.Touch)
			p !== null
				? ((a = p),
					((y.startsWith('Touch') && p === Tt.Touch) ||
						(y.startsWith('Mouse') && p === Tt.Mouse)) &&
						(p = null))
				: Ge[u] === Ge.Click && ((p = a), (a = null))
			const f = el(d) ? d.changedTouches[0] : d
			if (!f) return
			const m = t.getId(h),
				{ clientX: g, clientY: v } = f
			K(r)(
				Z(
					{ type: Ge[y], id: m, x: g, y: v },
					p !== null && { pointerType: p },
				),
			)
		}
		return (
			Object.keys(Ge)
				.filter(
					(u) =>
						Number.isNaN(Number(u)) &&
						!u.endsWith('_Departed') &&
						o[u] !== !1,
				)
				.forEach((u) => {
					let d = or(u)
					const h = c(u)
					if (window.PointerEvent)
						switch (Ge[u]) {
							case Ge.MouseDown:
							case Ge.MouseUp:
								d = d.replace('mouse', 'pointer')
								break
							case Ge.TouchStart:
							case Ge.TouchEnd:
								return
						}
					l.push(Te(d, h, e))
				}),
			K(() => {
				l.forEach((u) => u())
			})
		)
	}
	function Sp({
		scrollCb: r,
		doc: e,
		mirror: t,
		blockClass: n,
		blockSelector: i,
		sampling: s,
	}) {
		const o = K(
			hn(
				K((l) => {
					const a = fn(l)
					if (!a || Ie(a, n, i, !0)) return
					const c = t.getId(a)
					if (a === e && e.defaultView) {
						const u = ip(e.defaultView)
						r({ id: c, x: u.left, y: u.top })
					} else r({ id: c, x: a.scrollLeft, y: a.scrollTop })
				}),
				s.scroll || 100,
			),
		)
		return Te('scroll', o, e)
	}
	function cT({ viewportResizeCb: r }, { win: e }) {
		let t = -1,
			n = -1
		const i = K(
			hn(
				K(() => {
					const s = sp(),
						o = op()
					;(t !== s || n !== o) &&
						(r({ width: Number(o), height: Number(s) }),
						(t = s),
						(n = o))
				}),
				200,
			),
		)
		return Te('resize', i, e)
	}
	const uT = ['INPUT', 'TEXTAREA', 'SELECT'],
		vp = new WeakMap()
	function dT({
		inputCb: r,
		doc: e,
		mirror: t,
		blockClass: n,
		blockSelector: i,
		ignoreClass: s,
		ignoreSelector: o,
		maskInputOptions: l,
		maskInputFn: a,
		sampling: c,
		userTriggeredOnInput: u,
	}) {
		function d(v) {
			let S = fn(v)
			const I = v.isTrusted,
				G = S && S.tagName
			if (
				(S && G === 'OPTION' && (S = J.parentElement(S)),
				!S ||
					!G ||
					uT.indexOf(G) < 0 ||
					Ie(S, n, i, !0) ||
					S.classList.contains(s) ||
					(o && S.matches(o)))
			)
				return
			let L = S.value,
				w = !1
			const V = Ao(S) || '',
				P = S.getAttribute('data-hl-record')
			V === 'radio' || V === 'checkbox'
				? (w = S.checked)
				: Qu({
						maskInputOptions: l,
						type: V,
						tagName: G,
						overwriteRecord: P,
					}) &&
					(L = Uo({
						element: S,
						maskInputOptions: l,
						tagName: G,
						type: V,
						value: L,
						overwriteRecord: P,
						maskInputFn: a,
					})),
				h(
					S,
					u
						? { text: L, isChecked: w, userTriggered: I }
						: { text: L, isChecked: w },
				)
			const X = S.name
			V === 'radio' &&
				X &&
				w &&
				e
					.querySelectorAll(`input[type="radio"][name="${X}"]`)
					.forEach(($) => {
						if ($ !== S) {
							const be = $.value
							h(
								$,
								u
									? {
											text: be,
											isChecked: !w,
											userTriggered: !1,
										}
									: { text: be, isChecked: !w },
							)
						}
					})
		}
		function h(v, S) {
			const I = vp.get(v)
			if (!I || I.text !== S.text || I.isChecked !== S.isChecked) {
				vp.set(v, S)
				const G = t.getId(v)
				K(r)(q(Z({}, S), { id: G }))
			}
		}
		const y = (c.input === 'last' ? ['change'] : ['input', 'change']).map(
				(v) => Te(v, K(d), e),
			),
			f = e.defaultView
		if (!f)
			return () => {
				y.forEach((v) => v())
			}
		const m = f.Object.getOwnPropertyDescriptor(
				f.HTMLInputElement.prototype,
				'value',
			),
			g = [
				[f.HTMLInputElement.prototype, 'value'],
				[f.HTMLInputElement.prototype, 'checked'],
				[f.HTMLSelectElement.prototype, 'value'],
				[f.HTMLTextAreaElement.prototype, 'value'],
				[f.HTMLSelectElement.prototype, 'selectedIndex'],
				[f.HTMLOptionElement.prototype, 'selected'],
			]
		return (
			m &&
				m.set &&
				y.push(
					...g.map((v) =>
						zi(
							v[0],
							v[1],
							{
								set() {
									K(d)({ target: this, isTrusted: !1 })
								},
							},
							!1,
							f,
						),
					),
				),
			K(() => {
				y.forEach((v) => v())
			})
		)
	}
	function ji(r) {
		const e = []
		function t(n, i) {
			if (
				(Qi('CSSGroupingRule') &&
					n.parentRule instanceof CSSGroupingRule) ||
				(Qi('CSSMediaRule') && n.parentRule instanceof CSSMediaRule) ||
				(Qi('CSSSupportsRule') &&
					n.parentRule instanceof CSSSupportsRule) ||
				(Qi('CSSConditionRule') &&
					n.parentRule instanceof CSSConditionRule)
			) {
				const o = Array.from(n.parentRule.cssRules).indexOf(n)
				i.unshift(o)
			} else if (n.parentStyleSheet) {
				const o = Array.from(n.parentStyleSheet.cssRules).indexOf(n)
				i.unshift(o)
			}
			return i
		}
		return t(r, e)
	}
	function Et(r, e, t) {
		let n, i
		return r
			? (r.ownerNode ? (n = e.getId(r.ownerNode)) : (i = t.getId(r)),
				{ styleId: i, id: n })
			: {}
	}
	function hT(
		{ styleSheetRuleCb: r, mirror: e, stylesheetManager: t },
		{ win: n },
	) {
		if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype) return () => {}
		const i = n.CSSStyleSheet.prototype.insertRule
		;(n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
			apply: K((u, d, h) => {
				const [p, y] = h,
					{ id: f, styleId: m } = Et(d, e, t.styleMirror)
				return (
					((f && f !== -1) || (m && m !== -1)) &&
						r({ id: f, styleId: m, adds: [{ rule: p, index: y }] }),
					u.apply(d, h)
				)
			}),
		})),
			(n.CSSStyleSheet.prototype.addRule = function (
				u,
				d,
				h = this.cssRules.length,
			) {
				const p = `${u} { ${d} }`
				return n.CSSStyleSheet.prototype.insertRule.apply(this, [p, h])
			})
		const s = n.CSSStyleSheet.prototype.deleteRule
		;(n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
			apply: K((u, d, h) => {
				const [p] = h,
					{ id: y, styleId: f } = Et(d, e, t.styleMirror)
				return (
					((y && y !== -1) || (f && f !== -1)) &&
						r({ id: y, styleId: f, removes: [{ index: p }] }),
					u.apply(d, h)
				)
			}),
		})),
			(n.CSSStyleSheet.prototype.removeRule = function (u) {
				return n.CSSStyleSheet.prototype.deleteRule.apply(this, [u])
			})
		let o
		n.CSSStyleSheet.prototype.replace &&
			((o = n.CSSStyleSheet.prototype.replace),
			(n.CSSStyleSheet.prototype.replace = new Proxy(o, {
				apply: K((u, d, h) => {
					const [p] = h,
						{ id: y, styleId: f } = Et(d, e, t.styleMirror)
					return (
						((y && y !== -1) || (f && f !== -1)) &&
							r({ id: y, styleId: f, replace: p }),
						u.apply(d, h)
					)
				}),
			})))
		let l
		n.CSSStyleSheet.prototype.replaceSync &&
			((l = n.CSSStyleSheet.prototype.replaceSync),
			(n.CSSStyleSheet.prototype.replaceSync = new Proxy(l, {
				apply: K((u, d, h) => {
					const [p] = h,
						{ id: y, styleId: f } = Et(d, e, t.styleMirror)
					return (
						((y && y !== -1) || (f && f !== -1)) &&
							r({ id: y, styleId: f, replaceSync: p }),
						u.apply(d, h)
					)
				}),
			})))
		const a = {}
		$i('CSSGroupingRule')
			? (a.CSSGroupingRule = n.CSSGroupingRule)
			: ($i('CSSMediaRule') && (a.CSSMediaRule = n.CSSMediaRule),
				$i('CSSConditionRule') &&
					(a.CSSConditionRule = n.CSSConditionRule),
				$i('CSSSupportsRule') &&
					(a.CSSSupportsRule = n.CSSSupportsRule))
		const c = {}
		return (
			Object.entries(a).forEach(([u, d]) => {
				;(c[u] = {
					insertRule: d.prototype.insertRule,
					deleteRule: d.prototype.deleteRule,
				}),
					(d.prototype.insertRule = new Proxy(c[u].insertRule, {
						apply: K((h, p, y) => {
							const [f, m] = y,
								{ id: g, styleId: v } = Et(
									p.parentStyleSheet,
									e,
									t.styleMirror,
								)
							return (
								((g && g !== -1) || (v && v !== -1)) &&
									r({
										id: g,
										styleId: v,
										adds: [
											{
												rule: f,
												index: [...ji(p), m || 0],
											},
										],
									}),
								h.apply(p, y)
							)
						}),
					})),
					(d.prototype.deleteRule = new Proxy(c[u].deleteRule, {
						apply: K((h, p, y) => {
							const [f] = y,
								{ id: m, styleId: g } = Et(
									p.parentStyleSheet,
									e,
									t.styleMirror,
								)
							return (
								((m && m !== -1) || (g && g !== -1)) &&
									r({
										id: m,
										styleId: g,
										removes: [{ index: [...ji(p), f] }],
									}),
								h.apply(p, y)
							)
						}),
					}))
			}),
			K(() => {
				;(n.CSSStyleSheet.prototype.insertRule = i),
					(n.CSSStyleSheet.prototype.deleteRule = s),
					o && (n.CSSStyleSheet.prototype.replace = o),
					l && (n.CSSStyleSheet.prototype.replaceSync = l),
					Object.entries(a).forEach(([u, d]) => {
						;(d.prototype.insertRule = c[u].insertRule),
							(d.prototype.deleteRule = c[u].deleteRule)
					})
			})
		)
	}
	function Rp({ mirror: r, stylesheetManager: e }, t) {
		var n, i, s
		let o = null
		t.nodeName === '#document' ? (o = r.getId(t)) : (o = r.getId(J.host(t)))
		const l =
				t.nodeName === '#document'
					? (n = t.defaultView) == null
						? void 0
						: n.Document
					: (s =
								(i = t.ownerDocument) == null
									? void 0
									: i.defaultView) == null
						? void 0
						: s.ShadowRoot,
			a =
				l != null && l.prototype
					? Object.getOwnPropertyDescriptor(
							l == null ? void 0 : l.prototype,
							'adoptedStyleSheets',
						)
					: void 0
		return o === null || o === -1 || !l || !a
			? () => {}
			: (Object.defineProperty(t, 'adoptedStyleSheets', {
					configurable: a.configurable,
					enumerable: a.enumerable,
					get() {
						var c
						return (c = a.get) == null ? void 0 : c.call(this)
					},
					set(c) {
						var u
						const d = (u = a.set) == null ? void 0 : u.call(this, c)
						if (o !== null && o !== -1)
							try {
								e.adoptStyleSheets(c, o)
							} catch (h) {}
						return d
					},
				}),
				K(() => {
					Object.defineProperty(t, 'adoptedStyleSheets', {
						configurable: a.configurable,
						enumerable: a.enumerable,
						get: a.get,
						set: a.set,
					})
				}))
	}
	function pT(
		{
			styleDeclarationCb: r,
			mirror: e,
			ignoreCSSAttributes: t,
			stylesheetManager: n,
		},
		{ win: i },
	) {
		const s = i.CSSStyleDeclaration.prototype.setProperty
		i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
			apply: K((l, a, c) => {
				var u
				const [d, h, p] = c
				if (t.has(d)) return s.apply(a, [d, h, p])
				const { id: y, styleId: f } = Et(
					(u = a.parentRule) == null ? void 0 : u.parentStyleSheet,
					e,
					n.styleMirror,
				)
				return (
					((y && y !== -1) || (f && f !== -1)) &&
						r({
							id: y,
							styleId: f,
							set: { property: d, value: h, priority: p },
							index: ji(a.parentRule),
						}),
					l.apply(a, c)
				)
			}),
		})
		const o = i.CSSStyleDeclaration.prototype.removeProperty
		return (
			(i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(o, {
				apply: K((l, a, c) => {
					var u
					const [d] = c
					if (t.has(d)) return o.apply(a, [d])
					const { id: h, styleId: p } = Et(
						(u = a.parentRule) == null
							? void 0
							: u.parentStyleSheet,
						e,
						n.styleMirror,
					)
					return (
						((h && h !== -1) || (p && p !== -1)) &&
							r({
								id: h,
								styleId: p,
								remove: { property: d },
								index: ji(a.parentRule),
							}),
						l.apply(a, c)
					)
				}),
			})),
			K(() => {
				;(i.CSSStyleDeclaration.prototype.setProperty = s),
					(i.CSSStyleDeclaration.prototype.removeProperty = o)
			})
		)
	}
	function fT({
		mediaInteractionCb: r,
		blockClass: e,
		blockSelector: t,
		mirror: n,
		sampling: i,
		doc: s,
	}) {
		const o = K((a) =>
				hn(
					K((c) => {
						const u = fn(c)
						if (!u || Ie(u, e, t, !0)) return
						const {
							currentTime: d,
							volume: h,
							muted: p,
							playbackRate: y,
							loop: f,
						} = u
						r({
							type: a,
							id: n.getId(u),
							currentTime: d,
							volume: h,
							muted: p,
							playbackRate: y,
							loop: f,
						})
					}),
					i.media || 500,
				),
			),
			l = [
				Te('play', o(Sr.Play), s),
				Te('pause', o(Sr.Pause), s),
				Te('seeked', o(Sr.Seeked), s),
				Te('volumechange', o(Sr.VolumeChange), s),
				Te('ratechange', o(Sr.RateChange), s),
			]
		return K(() => {
			l.forEach((a) => a())
		})
	}
	function mT({ fontCb: r, doc: e }) {
		const t = e.defaultView
		if (!t) return () => {}
		const n = [],
			i = new WeakMap(),
			s = t.FontFace
		t.FontFace = function (a, c, u) {
			const d = new s(a, c, u)
			return (
				i.set(d, {
					family: a,
					buffer: typeof c != 'string',
					descriptors: u,
					fontSource:
						typeof c == 'string'
							? c
							: JSON.stringify(Array.from(new Uint8Array(c))),
				}),
				d
			)
		}
		const o = br(e.fonts, 'add', function (l) {
			return function (a) {
				return (
					setTimeout(
						K(() => {
							const c = i.get(a)
							c && (r(c), i.delete(a))
						}),
						0,
					),
					l.apply(this, [a])
				)
			}
		})
		return (
			n.push(() => {
				t.FontFace = s
			}),
			n.push(o),
			K(() => {
				n.forEach((l) => l())
			})
		)
	}
	function yT(r) {
		const {
			doc: e,
			mirror: t,
			blockClass: n,
			blockSelector: i,
			selectionCb: s,
		} = r
		let o = !0
		const l = K(() => {
			const a = e.getSelection()
			if (!a || (o && a != null && a.isCollapsed)) return
			o = a.isCollapsed || !1
			const c = [],
				u = a.rangeCount || 0
			for (let d = 0; d < u; d++) {
				const h = a.getRangeAt(d),
					{
						startContainer: p,
						startOffset: y,
						endContainer: f,
						endOffset: m,
					} = h
				Ie(p, n, i, !0) ||
					Ie(f, n, i, !0) ||
					c.push({
						start: t.getId(p),
						startOffset: y,
						end: t.getId(f),
						endOffset: m,
					})
			}
			s({ ranges: c })
		})
		return l(), Te('selectionchange', l)
	}
	function bT({ doc: r, customElementCb: e }) {
		const t = r.defaultView
		return !t || !t.customElements
			? () => {}
			: br(t.customElements, 'define', function (i) {
					return function (s, o, l) {
						try {
							e({ define: { name: s } })
						} catch (a) {
							console.warn(
								`Custom element callback failed for ${s}`,
							)
						}
						return i.apply(this, [s, o, l])
					}
				})
	}
	function gT(r, e) {
		const {
			mutationCb: t,
			mousemoveCb: n,
			mouseInteractionCb: i,
			scrollCb: s,
			viewportResizeCb: o,
			inputCb: l,
			mediaInteractionCb: a,
			styleSheetRuleCb: c,
			styleDeclarationCb: u,
			canvasMutationCb: d,
			fontCb: h,
			selectionCb: p,
			customElementCb: y,
		} = r
		;(r.mutationCb = (...f) => {
			e.mutation && e.mutation(...f), t(...f)
		}),
			(r.mousemoveCb = (...f) => {
				e.mousemove && e.mousemove(...f), n(...f)
			}),
			(r.mouseInteractionCb = (...f) => {
				e.mouseInteraction && e.mouseInteraction(...f), i(...f)
			}),
			(r.scrollCb = (...f) => {
				e.scroll && e.scroll(...f), s(...f)
			}),
			(r.viewportResizeCb = (...f) => {
				e.viewportResize && e.viewportResize(...f), o(...f)
			}),
			(r.inputCb = (...f) => {
				e.input && e.input(...f), l(...f)
			}),
			(r.mediaInteractionCb = (...f) => {
				e.mediaInteaction && e.mediaInteaction(...f), a(...f)
			}),
			(r.styleSheetRuleCb = (...f) => {
				e.styleSheetRule && e.styleSheetRule(...f), c(...f)
			}),
			(r.styleDeclarationCb = (...f) => {
				e.styleDeclaration && e.styleDeclaration(...f), u(...f)
			}),
			(r.canvasMutationCb = (...f) => {
				e.canvasMutation && e.canvasMutation(...f), d(...f)
			}),
			(r.fontCb = (...f) => {
				e.font && e.font(...f), h(...f)
			}),
			(r.selectionCb = (...f) => {
				e.selection && e.selection(...f), p(...f)
			}),
			(r.customElementCb = (...f) => {
				e.customElement && e.customElement(...f), y(...f)
			})
	}
	function ST(r, e = {}) {
		const t = r.doc.defaultView
		if (!t) return () => {}
		gT(r, e)
		let n
		r.recordDOM && (n = gp(r, r.doc))
		const i = aT(r),
			s = lT(r),
			o = Sp(r),
			l = cT(r, { win: t }),
			a = dT(r),
			c = fT(r)
		let u = () => {},
			d = () => {},
			h = () => {},
			p = () => {}
		r.recordDOM &&
			((u = hT(r, { win: t })),
			(d = Rp(r, r.doc)),
			(h = pT(r, { win: t })),
			r.collectFonts && (p = mT(r)))
		const y = yT(r),
			f = bT(r),
			m = []
		for (const g of r.plugins) m.push(g.observer(g.callback, t, g.options))
		return K(() => {
			Ft.forEach((g) => g.reset()),
				n == null || n.disconnect(),
				i(),
				s(),
				o(),
				l(),
				a(),
				c(),
				u(),
				d(),
				h(),
				p(),
				y(),
				f(),
				m.forEach((g) => g())
		})
	}
	function Qi(r) {
		return typeof window[r] != 'undefined'
	}
	function $i(r) {
		return !!(
			typeof window[r] != 'undefined' &&
			window[r].prototype &&
			'insertRule' in window[r].prototype &&
			'deleteRule' in window[r].prototype
		)
	}
	class Ip {
		constructor(e) {
			E(this, 'iframeIdToRemoteIdMap', new WeakMap()),
				E(this, 'iframeRemoteIdToIdMap', new WeakMap()),
				(this.generateIdFn = e)
		}
		getId(e, t, n, i) {
			const s = n || this.getIdToRemoteIdMap(e),
				o = i || this.getRemoteIdToIdMap(e)
			let l = s.get(t)
			return l || ((l = this.generateIdFn()), s.set(t, l), o.set(l, t)), l
		}
		getIds(e, t) {
			const n = this.getIdToRemoteIdMap(e),
				i = this.getRemoteIdToIdMap(e)
			return t.map((s) => this.getId(e, s, n, i))
		}
		getRemoteId(e, t, n) {
			const i = n || this.getRemoteIdToIdMap(e)
			if (typeof t != 'number') return t
			const s = i.get(t)
			return s || -1
		}
		getRemoteIds(e, t) {
			const n = this.getRemoteIdToIdMap(e)
			return t.map((i) => this.getRemoteId(e, i, n))
		}
		reset(e) {
			if (!e) {
				;(this.iframeIdToRemoteIdMap = new WeakMap()),
					(this.iframeRemoteIdToIdMap = new WeakMap())
				return
			}
			this.iframeIdToRemoteIdMap.delete(e),
				this.iframeRemoteIdToIdMap.delete(e)
		}
		getIdToRemoteIdMap(e) {
			let t = this.iframeIdToRemoteIdMap.get(e)
			return (
				t || ((t = new Map()), this.iframeIdToRemoteIdMap.set(e, t)), t
			)
		}
		getRemoteIdToIdMap(e) {
			let t = this.iframeRemoteIdToIdMap.get(e)
			return (
				t || ((t = new Map()), this.iframeRemoteIdToIdMap.set(e, t)), t
			)
		}
	}
	class vT {
		constructor(e) {
			E(this, 'iframes', new WeakMap()),
				E(this, 'crossOriginIframeMap', new WeakMap()),
				E(this, 'crossOriginIframeMirror', new Ip($u)),
				E(this, 'crossOriginIframeStyleMirror'),
				E(this, 'crossOriginIframeRootIdMap', new WeakMap()),
				E(this, 'mirror'),
				E(this, 'mutationCb'),
				E(this, 'wrappedEmit'),
				E(this, 'loadListener'),
				E(this, 'stylesheetManager'),
				E(this, 'recordCrossOriginIframes'),
				(this.mutationCb = e.mutationCb),
				(this.wrappedEmit = e.wrappedEmit),
				(this.stylesheetManager = e.stylesheetManager),
				(this.recordCrossOriginIframes = e.recordCrossOriginIframes),
				(this.crossOriginIframeStyleMirror = new Ip(
					this.stylesheetManager.styleMirror.generateId.bind(
						this.stylesheetManager.styleMirror,
					),
				)),
				(this.mirror = e.mirror),
				this.recordCrossOriginIframes &&
					window.addEventListener(
						'message',
						this.handleMessage.bind(this),
					)
		}
		addIframe(e) {
			this.iframes.set(e, !0),
				e.contentWindow &&
					this.crossOriginIframeMap.set(e.contentWindow, e)
		}
		addLoadListener(e) {
			this.loadListener = e
		}
		attachIframe(e, t) {
			var n, i
			this.mutationCb({
				adds: [
					{ parentId: this.mirror.getId(e), nextId: null, node: t },
				],
				removes: [],
				texts: [],
				attributes: [],
				isAttachIframe: !0,
			}),
				this.recordCrossOriginIframes &&
					((n = e.contentWindow) == null ||
						n.addEventListener(
							'message',
							this.handleMessage.bind(this),
						)),
				(i = this.loadListener) == null || i.call(this, e),
				e.contentDocument &&
					e.contentDocument.adoptedStyleSheets &&
					e.contentDocument.adoptedStyleSheets.length > 0 &&
					this.stylesheetManager.adoptStyleSheets(
						e.contentDocument.adoptedStyleSheets,
						this.mirror.getId(e.contentDocument),
					)
		}
		handleMessage(e) {
			const t = e
			if (t.data.type !== 'rrweb' || t.origin !== t.data.origin) return
			const n = e.source
			if (!n) return
			const i = this.crossOriginIframeMap.get(n)
			if (!i) return
			const s = this.transformCrossOriginEvent(i, t.data.event)
			s && this.wrappedEmit(s, t.data.isCheckout)
		}
		transformCrossOriginEvent(e, t) {
			var n
			switch (t.type) {
				case B.FullSnapshot: {
					this.crossOriginIframeMirror.reset(e),
						this.crossOriginIframeStyleMirror.reset(e),
						this.replaceIdOnNode(t.data.node, e)
					const i = t.data.node.id
					return (
						this.crossOriginIframeRootIdMap.set(e, i),
						this.patchRootIdOnNode(t.data.node, i),
						{
							timestamp: t.timestamp,
							type: B.IncrementalSnapshot,
							data: {
								source: H.Mutation,
								adds: [
									{
										parentId: this.mirror.getId(e),
										nextId: null,
										node: t.data.node,
									},
								],
								removes: [],
								texts: [],
								attributes: [],
								isAttachIframe: !0,
							},
						}
					)
				}
				case B.Meta:
				case B.Load:
				case B.DomContentLoaded:
					return !1
				case B.Plugin:
					return t
				case B.Custom:
					return (
						this.replaceIds(t.data.payload, e, [
							'id',
							'parentId',
							'previousId',
							'nextId',
						]),
						t
					)
				case B.IncrementalSnapshot:
					switch (t.data.source) {
						case H.Mutation:
							return (
								t.data.adds.forEach((i) => {
									this.replaceIds(i, e, [
										'parentId',
										'nextId',
										'previousId',
									]),
										this.replaceIdOnNode(i.node, e)
									const s =
										this.crossOriginIframeRootIdMap.get(e)
									s && this.patchRootIdOnNode(i.node, s)
								}),
								t.data.removes.forEach((i) => {
									this.replaceIds(i, e, ['parentId', 'id'])
								}),
								t.data.attributes.forEach((i) => {
									this.replaceIds(i, e, ['id'])
								}),
								t.data.texts.forEach((i) => {
									this.replaceIds(i, e, ['id'])
								}),
								t
							)
						case H.Drag:
						case H.TouchMove:
						case H.MouseMove:
							return (
								t.data.positions.forEach((i) => {
									this.replaceIds(i, e, ['id'])
								}),
								t
							)
						case H.ViewportResize:
							return !1
						case H.MediaInteraction:
						case H.MouseInteraction:
						case H.Scroll:
						case H.CanvasMutation:
						case H.Input:
							return this.replaceIds(t.data, e, ['id']), t
						case H.StyleSheetRule:
						case H.StyleDeclaration:
							return (
								this.replaceIds(t.data, e, ['id']),
								this.replaceStyleIds(t.data, e, ['styleId']),
								t
							)
						case H.Font:
							return t
						case H.Selection:
							return (
								t.data.ranges.forEach((i) => {
									this.replaceIds(i, e, ['start', 'end'])
								}),
								t
							)
						case H.AdoptedStyleSheet:
							return (
								this.replaceIds(t.data, e, ['id']),
								this.replaceStyleIds(t.data, e, ['styleIds']),
								(n = t.data.styles) == null ||
									n.forEach((i) => {
										this.replaceStyleIds(i, e, ['styleId'])
									}),
								t
							)
					}
			}
			return !1
		}
		replace(e, t, n, i) {
			for (const s of i)
				(!Array.isArray(t[s]) && typeof t[s] != 'number') ||
					(Array.isArray(t[s])
						? (t[s] = e.getIds(n, t[s]))
						: (t[s] = e.getId(n, t[s])))
			return t
		}
		replaceIds(e, t, n) {
			return this.replace(this.crossOriginIframeMirror, e, t, n)
		}
		replaceStyleIds(e, t, n) {
			return this.replace(this.crossOriginIframeStyleMirror, e, t, n)
		}
		replaceIdOnNode(e, t) {
			this.replaceIds(e, t, ['id', 'rootId']),
				'childNodes' in e &&
					e.childNodes.forEach((n) => {
						this.replaceIdOnNode(n, t)
					})
		}
		patchRootIdOnNode(e, t) {
			e.type !== me.Document && !e.rootId && (e.rootId = t),
				'childNodes' in e &&
					e.childNodes.forEach((n) => {
						this.patchRootIdOnNode(n, t)
					})
		}
	}
	class RT {
		constructor(e) {
			E(this, 'shadowDoms', new WeakSet()),
				E(this, 'mutationCb'),
				E(this, 'scrollCb'),
				E(this, 'bypassOptions'),
				E(this, 'mirror'),
				E(this, 'restoreHandlers', []),
				(this.mutationCb = e.mutationCb),
				(this.scrollCb = e.scrollCb),
				(this.bypassOptions = e.bypassOptions),
				(this.mirror = e.mirror),
				this.init()
		}
		init() {
			this.reset(), this.patchAttachShadow(Element, document)
		}
		addShadowRoot(e, t) {
			if (!Hr(e) || this.shadowDoms.has(e)) return
			this.shadowDoms.add(e)
			const n = gp(
				q(Z({}, this.bypassOptions), {
					doc: t,
					mutationCb: this.mutationCb,
					mirror: this.mirror,
					shadowDomManager: this,
				}),
				e,
			)
			this.restoreHandlers.push(() => n.disconnect()),
				this.restoreHandlers.push(
					Sp(
						q(Z({}, this.bypassOptions), {
							scrollCb: this.scrollCb,
							doc: e,
							mirror: this.mirror,
						}),
					),
				),
				setTimeout(() => {
					e.adoptedStyleSheets &&
						e.adoptedStyleSheets.length > 0 &&
						this.bypassOptions.stylesheetManager.adoptStyleSheets(
							e.adoptedStyleSheets,
							this.mirror.getId(J.host(e)),
						),
						this.restoreHandlers.push(
							Rp(
								{
									mirror: this.mirror,
									stylesheetManager:
										this.bypassOptions.stylesheetManager,
								},
								e,
							),
						)
				}, 0)
		}
		observeAttachShadow(e) {
			!e.contentWindow ||
				!e.contentDocument ||
				this.patchAttachShadow(
					e.contentWindow.Element,
					e.contentDocument,
				)
		}
		patchAttachShadow(e, t) {
			const n = this
			this.restoreHandlers.push(
				br(e.prototype, 'attachShadow', function (i) {
					return function (s) {
						const o = i.call(this, s),
							l = J.shadowRoot(this)
						return l && hp(this) && n.addShadowRoot(l, t), o
					}
				}),
			)
		}
		reset() {
			this.restoreHandlers.forEach((e) => {
				try {
					e()
				} catch (t) {}
			}),
				(this.restoreHandlers = []),
				(this.shadowDoms = new WeakSet())
		}
	}
	for (
		var vr =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
			IT = typeof Uint8Array == 'undefined' ? [] : new Uint8Array(256),
			qi = 0;
		qi < vr.length;
		qi++
	)
		IT[vr.charCodeAt(qi)] = qi
	var wT = function (r) {
		var e = new Uint8Array(r),
			t,
			n = e.length,
			i = ''
		for (t = 0; t < n; t += 3)
			(i += vr[e[t] >> 2]),
				(i += vr[((e[t] & 3) << 4) | (e[t + 1] >> 4)]),
				(i += vr[((e[t + 1] & 15) << 2) | (e[t + 2] >> 6)]),
				(i += vr[e[t + 2] & 63])
		return (
			n % 3 === 2
				? (i = i.substring(0, i.length - 1) + '=')
				: n % 3 === 1 && (i = i.substring(0, i.length - 2) + '=='),
			i
		)
	}
	const wp = new Map()
	function ZT(r, e) {
		let t = wp.get(r)
		return (
			t || ((t = new Map()), wp.set(r, t)),
			t.has(e) || t.set(e, []),
			t.get(e)
		)
	}
	const Zp = (r, e, t) => {
		if (!r || !(Ep(r, e) || typeof r == 'object')) return
		const n = r.constructor.name,
			i = ZT(t, n)
		let s = i.indexOf(r)
		return s === -1 && ((s = i.length), i.push(r)), s
	}
	function es(r, e, t) {
		if (r instanceof Array) return r.map((n) => es(n, e, t))
		if (r === null) return r
		if (
			r instanceof Float32Array ||
			r instanceof Float64Array ||
			r instanceof Int32Array ||
			r instanceof Uint32Array ||
			r instanceof Uint8Array ||
			r instanceof Uint16Array ||
			r instanceof Int16Array ||
			r instanceof Int8Array ||
			r instanceof Uint8ClampedArray
		)
			return { rr_type: r.constructor.name, args: [Object.values(r)] }
		if (r instanceof ArrayBuffer) {
			const n = r.constructor.name,
				i = wT(r)
			return { rr_type: n, base64: i }
		} else {
			if (r instanceof DataView)
				return {
					rr_type: r.constructor.name,
					args: [es(r.buffer, e, t), r.byteOffset, r.byteLength],
				}
			if (r instanceof HTMLImageElement) {
				const n = r.constructor.name,
					{ src: i } = r
				return { rr_type: n, src: i }
			} else if (r instanceof HTMLCanvasElement) {
				const n = 'HTMLImageElement',
					i = r.toDataURL()
				return { rr_type: n, src: i }
			} else {
				if (r instanceof ImageData)
					return {
						rr_type: r.constructor.name,
						args: [es(r.data, e, t), r.width, r.height],
					}
				if (Ep(r, e) || typeof r == 'object') {
					const n = r.constructor.name,
						i = Zp(r, e, t)
					return { rr_type: n, index: i }
				}
			}
		}
		return r
	}
	const Tp = (r, e, t) => r.map((n) => es(n, e, t)),
		Ep = (r, e) =>
			!![
				'WebGLActiveInfo',
				'WebGLBuffer',
				'WebGLFramebuffer',
				'WebGLProgram',
				'WebGLRenderbuffer',
				'WebGLShader',
				'WebGLShaderPrecisionFormat',
				'WebGLTexture',
				'WebGLUniformLocation',
				'WebGLVertexArrayObject',
				'WebGLVertexArrayObjectOES',
			]
				.filter((i) => typeof e[i] == 'function')
				.find((i) => r instanceof e[i])
	function TT(r, e, t, n) {
		const i = [],
			s = Object.getOwnPropertyNames(e.CanvasRenderingContext2D.prototype)
		for (const o of s)
			try {
				if (
					typeof e.CanvasRenderingContext2D.prototype[o] != 'function'
				)
					continue
				const l = br(
					e.CanvasRenderingContext2D.prototype,
					o,
					function (a) {
						return function (...c) {
							return (
								Ie(this.canvas, t, n, !0) ||
									setTimeout(() => {
										const u = Tp(c, e, this)
										r(this.canvas, {
											type: gr['2D'],
											property: o,
											args: u,
										})
									}, 0),
								a.apply(this, c)
							)
						}
					},
				)
				i.push(l)
			} catch (l) {
				const a = zi(e.CanvasRenderingContext2D.prototype, o, {
					set(c) {
						r(this.canvas, {
							type: gr['2D'],
							property: o,
							args: [c],
							setter: !0,
						})
					},
				})
				i.push(a)
			}
		return () => {
			i.forEach((o) => o())
		}
	}
	function ET(r) {
		return r === 'experimental-webgl' ? 'webgl' : r
	}
	function Cp(r, e, t, n) {
		const i = []
		try {
			const s = br(
				r.HTMLCanvasElement.prototype,
				'getContext',
				function (o) {
					return function (l, ...a) {
						if (!Ie(this, e, t, !0)) {
							const c = ET(l)
							if (
								('__context' in this || (this.__context = c),
								n && ['webgl', 'webgl2'].includes(c))
							)
								if (a[0] && typeof a[0] == 'object') {
									const u = a[0]
									u.preserveDrawingBuffer ||
										(u.preserveDrawingBuffer = !0)
								} else
									a.splice(0, 1, {
										preserveDrawingBuffer: !0,
									})
						}
						return o.apply(this, [l, ...a])
					}
				},
			)
			i.push(s)
		} catch (s) {
			console.error(
				'failed to patch HTMLCanvasElement.prototype.getContext',
			)
		}
		return () => {
			i.forEach((s) => s())
		}
	}
	function Gp(r, e, t, n, i, s) {
		const o = [],
			l = Object.getOwnPropertyNames(r)
		for (const a of l)
			if (
				![
					'isContextLost',
					'canvas',
					'drawingBufferWidth',
					'drawingBufferHeight',
				].includes(a)
			)
				try {
					if (typeof r[a] != 'function') continue
					const c = br(r, a, function (u) {
						return function (...d) {
							const h = u.apply(this, d)
							if (
								(Zp(h, s, this),
								'tagName' in this.canvas &&
									!Ie(this.canvas, n, i, !0))
							) {
								const p = Tp(d, s, this),
									y = { type: e, property: a, args: p }
								t(this.canvas, y)
							}
							return h
						}
					})
					o.push(c)
				} catch (c) {
					const u = zi(r, a, {
						set(d) {
							t(this.canvas, {
								type: e,
								property: a,
								args: [d],
								setter: !0,
							})
						},
					})
					o.push(u)
				}
		return o
	}
	function CT(r, e, t, n) {
		const i = []
		return (
			i.push(
				...Gp(e.WebGLRenderingContext.prototype, gr.WebGL, r, t, n, e),
			),
			typeof e.WebGL2RenderingContext != 'undefined' &&
				i.push(
					...Gp(
						e.WebGL2RenderingContext.prototype,
						gr.WebGL2,
						r,
						t,
						n,
						e,
					),
				),
			() => {
				i.forEach((s) => s())
			}
		)
	}
	const Vp =
			'KGZ1bmN0aW9uKCkgewogICJ1c2Ugc3RyaWN0IjsKICB2YXIgY2hhcnMgPSAiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyI7CiAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAidW5kZWZpbmVkIiA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7CiAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpOwogIH0KICB2YXIgZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpIHsKICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSwgaTIsIGxlbiA9IGJ5dGVzLmxlbmd0aCwgYmFzZTY0ID0gIiI7CiAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW47IGkyICs9IDMpIHsKICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2kyXSA+PiAyXTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMl0gJiAzKSA8PCA0IHwgYnl0ZXNbaTIgKyAxXSA+PiA0XTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMiArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpMiArIDJdID4+IDZdOwogICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaTIgKyAyXSAmIDYzXTsKICAgIH0KICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgIj0iOwogICAgfSBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgIj09IjsKICAgIH0KICAgIHJldHVybiBiYXNlNjQ7CiAgfTsKICBjb25zdCBsYXN0QmxvYk1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICBhc3luYyBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEJsb2JGb3Iod2lkdGgsIGhlaWdodCwgZGF0YVVSTE9wdGlvbnMpIHsKICAgIGNvbnN0IGlkID0gYCR7d2lkdGh9LSR7aGVpZ2h0fWA7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBpZiAodHJhbnNwYXJlbnRCbG9iTWFwLmhhcyhpZCkpIHJldHVybiB0cmFuc3BhcmVudEJsb2JNYXAuZ2V0KGlkKTsKICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsKICAgICAgb2Zmc2NyZWVuLmdldENvbnRleHQoIjJkIik7CiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBvZmZzY3JlZW4uY29udmVydFRvQmxvYihkYXRhVVJMT3B0aW9ucyk7CiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpOwogICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOwogICAgICB0cmFuc3BhcmVudEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICByZXR1cm4gYmFzZTY0OwogICAgfSBlbHNlIHsKICAgICAgcmV0dXJuICIiOwogICAgfQogIH0KICBjb25zdCB3b3JrZXIgPSBzZWxmOwogIGxldCBsb2dEZWJ1ZyA9IGZhbHNlOwogIGNvbnN0IGRlYnVnID0gKC4uLmFyZ3MpID0+IHsKICAgIGlmIChsb2dEZWJ1ZykgewogICAgICBjb25zb2xlLmRlYnVnKC4uLmFyZ3MpOwogICAgfQogIH07CiAgd29ya2VyLm9ubWVzc2FnZSA9IGFzeW5jIGZ1bmN0aW9uKGUpIHsKICAgIGxvZ0RlYnVnID0gISFlLmRhdGEubG9nRGVidWc7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBjb25zdCB7IGlkLCBiaXRtYXAsIHdpZHRoLCBoZWlnaHQsIGR4LCBkeSwgZHcsIGRoLCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOwogICAgICBjb25zdCB0cmFuc3BhcmVudEJhc2U2NCA9IGdldFRyYW5zcGFyZW50QmxvYkZvcigKICAgICAgICB3aWR0aCwKICAgICAgICBoZWlnaHQsCiAgICAgICAgZGF0YVVSTE9wdGlvbnMKICAgICAgKTsKICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsKICAgICAgY29uc3QgY3R4ID0gb2Zmc2NyZWVuLmdldENvbnRleHQoIjJkIik7CiAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTsKICAgICAgYml0bWFwLmNsb3NlKCk7CiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBvZmZzY3JlZW4uY29udmVydFRvQmxvYihkYXRhVVJMT3B0aW9ucyk7CiAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7CiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpOwogICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOwogICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgYXdhaXQgdHJhbnNwYXJlbnRCYXNlNjQgPT09IGJhc2U2NCkgewogICAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gY2FudmFzIGJpdG1hcCBpcyB0cmFuc3BhcmVudCIsIHsKICAgICAgICAgIGlkLAogICAgICAgICAgYmFzZTY0CiAgICAgICAgfSk7CiAgICAgICAgbGFzdEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICAgIHJldHVybiB3b3JrZXIucG9zdE1lc3NhZ2UoeyBpZCwgc3RhdHVzOiAidHJhbnNwYXJlbnQiIH0pOwogICAgICB9CiAgICAgIGlmIChsYXN0QmxvYk1hcC5nZXQoaWQpID09PSBiYXNlNjQpIHsKICAgICAgICBkZWJ1ZygiW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgaXMgdW5jaGFuZ2VkIiwgewogICAgICAgICAgaWQsCiAgICAgICAgICBiYXNlNjQKICAgICAgICB9KTsKICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQsIHN0YXR1czogInVuY2hhbmdlZCIgfSk7CiAgICAgIH0KICAgICAgY29uc3QgbXNnID0gewogICAgICAgIGlkLAogICAgICAgIHR5cGUsCiAgICAgICAgYmFzZTY0LAogICAgICAgIHdpZHRoLAogICAgICAgIGhlaWdodCwKICAgICAgICBkeCwKICAgICAgICBkeSwKICAgICAgICBkdywKICAgICAgICBkaAogICAgICB9OwogICAgICBkZWJ1ZygiW2hpZ2hsaWdodC13b3JrZXJdIGNhbnZhcyBiaXRtYXAgcHJvY2Vzc2VkIiwgbXNnKTsKICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG1zZyk7CiAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsKICAgIH0gZWxzZSB7CiAgICAgIGRlYnVnKCJbaGlnaGxpZ2h0LXdvcmtlcl0gbm8gb2Zmc2NyZWVuY2FudmFzIHN1cHBvcnQiLCB7CiAgICAgICAgaWQ6IGUuZGF0YS5pZAogICAgICB9KTsKICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkOiBlLmRhdGEuaWQsIHN0YXR1czogInVuc3VwcG9ydGVkIiB9KTsKICAgIH0KICB9Owp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1pbWFnZS1iaXRtYXAtZGF0YS11cmwtd29ya2VyLUJpWEpSZjQ3LmpzLm1hcAo=',
		GT = (r) => Uint8Array.from(atob(r), (e) => e.charCodeAt(0)),
		Np =
			typeof self != 'undefined' &&
			self.Blob &&
			new Blob([GT(Vp)], { type: 'text/javascript;charset=utf-8' })
	function VT(r) {
		let e
		try {
			if (
				((e = Np && (self.URL || self.webkitURL).createObjectURL(Np)),
				!e)
			)
				throw ''
			const t = new Worker(e, { name: r == null ? void 0 : r.name })
			return (
				t.addEventListener('error', () => {
					;(self.URL || self.webkitURL).revokeObjectURL(e)
				}),
				t
			)
		} catch (t) {
			return new Worker('data:text/javascript;base64,' + Vp, {
				name: r == null ? void 0 : r.name,
			})
		} finally {
			e && (self.URL || self.webkitURL).revokeObjectURL(e)
		}
	}
	class NT {
		constructor(e) {
			E(this, 'pendingCanvasMutations', new Map()),
				E(this, 'rafStamps', { latestId: 0, invokeId: null }),
				E(this, 'mirror'),
				E(this, 'logger'),
				E(this, 'worker'),
				E(this, 'snapshotInProgressMap', new Map()),
				E(this, 'lastSnapshotTime', new Map()),
				E(this, 'options'),
				E(this, 'mutationCb'),
				E(this, 'resetObservers'),
				E(this, 'frozen', !1),
				E(this, 'locked', !1),
				E(this, 'processMutation', (u, d) => {
					;((this.rafStamps.invokeId &&
						this.rafStamps.latestId !== this.rafStamps.invokeId) ||
						!this.rafStamps.invokeId) &&
						(this.rafStamps.invokeId = this.rafStamps.latestId),
						this.pendingCanvasMutations.has(u) ||
							this.pendingCanvasMutations.set(u, []),
						this.pendingCanvasMutations.get(u).push(d)
				})
			const {
				sampling: t,
				win: n,
				blockClass: i,
				blockSelector: s,
				recordCanvas: o,
				recordVideos: l,
				initialSnapshotDelay: a,
				dataURLOptions: c,
			} = e
			;(this.mutationCb = e.mutationCb),
				(this.mirror = e.mirror),
				(this.logger = e.logger),
				(this.worker = new VT()),
				(this.worker.onmessage = (u) => {
					const { id: d } = u.data
					if (
						(this.snapshotInProgressMap.set(d, !1),
						!('base64' in u.data))
					) {
						this.debug(
							null,
							'canvas worker received empty message',
							{ data: u.data, status: u.data.status },
						)
						return
					}
					const {
							base64: h,
							type: p,
							dx: y,
							dy: f,
							dw: m,
							dh: g,
						} = u.data,
						v = {
							id: d,
							type: gr['2D'],
							commands: [
								{ property: 'clearRect', args: [y, f, m, g] },
								{
									property: 'drawImage',
									args: [
										{
											rr_type: 'ImageBitmap',
											args: [
												{
													rr_type: 'Blob',
													data: [
														{
															rr_type:
																'ArrayBuffer',
															base64: h,
														},
													],
													type: p,
												},
											],
										},
										y,
										f,
										m,
										g,
									],
								},
							],
						}
					this.debug(null, 'canvas worker recording mutation', v),
						this.mutationCb(v)
				}),
				(this.options = e),
				o && t === 'all'
					? (this.debug(
							null,
							'initializing canvas mutation observer',
							{ sampling: t },
						),
						this.initCanvasMutationObserver(n, i, s))
					: o &&
						typeof t == 'number' &&
						(this.debug(null, 'initializing canvas fps observer', {
							sampling: t,
						}),
						this.initCanvasFPSObserver(
							l,
							t,
							n,
							i,
							s,
							{ initialSnapshotDelay: a, dataURLOptions: c },
							e.resizeFactor,
							e.maxSnapshotDimension,
						))
		}
		reset() {
			this.pendingCanvasMutations.clear(),
				this.resetObservers && this.resetObservers()
		}
		freeze() {
			this.frozen = !0
		}
		unfreeze() {
			this.frozen = !1
		}
		lock() {
			this.locked = !0
		}
		unlock() {
			this.locked = !1
		}
		debug(e, ...t) {
			if (!this.logger) return
			const n = this.mirror.getId(e)
			let i = '[highlight-canvas-manager]'
			e &&
				((i = `[highlight-canvas] [id:${n}]`),
				e.tagName.toLowerCase() === 'canvas' &&
					(i += ` [ctx:${e.__context}]`)),
				this.logger.debug(i, e, ...t)
		}
		snapshot(e) {
			return z(this, null, function* () {
				var t
				const n = this.mirror.getId(e)
				if (this.snapshotInProgressMap.get(n)) {
					this.debug(e, 'snapshotting already in progress for', n)
					return
				}
				const i =
						1e3 /
						(typeof this.options.samplingManual == 'number'
							? this.options.samplingManual
							: 1),
					s = this.lastSnapshotTime.get(n)
				if (!(s && new Date().getTime() - s < i)) {
					if (
						(this.debug(e, 'starting snapshotting'),
						e.width === 0 || e.height === 0)
					) {
						this.debug(e, 'not yet ready', {
							width: e.width,
							height: e.height,
						})
						return
					}
					this.lastSnapshotTime.set(n, new Date().getTime()),
						this.snapshotInProgressMap.set(n, !0)
					try {
						if (
							this.options.clearWebGLBuffer !== !1 &&
							['webgl', 'webgl2'].includes(e.__context)
						) {
							const u = e.getContext(e.__context)
							;((t =
								u == null
									? void 0
									: u.getContextAttributes()) == null
								? void 0
								: t.preserveDrawingBuffer) === !1 &&
								(u.clear(u.COLOR_BUFFER_BIT),
								this.debug(
									e,
									'cleared webgl canvas to load it into memory',
									{
										attributes:
											u == null
												? void 0
												: u.getContextAttributes(),
									},
								))
						}
						if (e.width === 0 || e.height === 0) {
							this.debug(e, 'not yet ready', {
								width: e.width,
								height: e.height,
							})
							return
						}
						let o = this.options.resizeFactor || 1
						if (this.options.maxSnapshotDimension) {
							const u = Math.max(e.width, e.height)
							o = Math.min(
								o,
								this.options.maxSnapshotDimension / u,
							)
						}
						const l = e.width * o,
							a = e.height * o,
							c = yield createImageBitmap(e, {
								resizeWidth: l,
								resizeHeight: a,
							})
						this.debug(e, 'created image bitmap', {
							width: c.width,
							height: c.height,
						}),
							this.worker.postMessage(
								{
									id: n,
									bitmap: c,
									width: l,
									height: a,
									dx: 0,
									dy: 0,
									dw: e.width,
									dh: e.height,
									dataURLOptions: this.options.dataURLOptions,
									logDebug: !!this.logger,
								},
								[c],
							),
							this.debug(e, 'sent message')
					} catch (o) {
						this.debug(e, 'failed to snapshot', o)
					} finally {
						this.snapshotInProgressMap.set(n, !1)
					}
				}
			})
		}
		initCanvasFPSObserver(e, t, n, i, s, o, l, a) {
			const c = Cp(n, i, s, !0),
				u = 1e3 / t
			let d = 0,
				h
			const p = new Map(),
				y = (v, S) => {
					const I = []
					v.querySelectorAll(S).forEach((w) => I.push(w))
					const G = document.createNodeIterator(v, Node.ELEMENT_NODE)
					let L
					for (; (L = G.nextNode()); )
						L != null &&
							L.shadowRoot &&
							I.push(...y(L.shadowRoot, S))
					return I
				},
				f = (v) => {
					const S = []
					return (
						y(n.document, 'canvas').forEach((I) => {
							if (!Ie(I, i, s, !0)) {
								this.debug(I, 'discovered canvas'), S.push(I)
								const G = this.mirror.getId(I)
								p.has(G) || p.set(G, v)
							}
						}),
						S
					)
				},
				m = (v) => {
					const S = []
					return (
						e &&
							y(n.document, 'video').forEach((I) => {
								if (
									!(
										I.src !== '' &&
										I.src.indexOf('blob:') === -1
									) &&
									!Ie(I, i, s, !0)
								) {
									S.push(I)
									const G = this.mirror.getId(I)
									p.has(G) || p.set(G, v)
								}
							}),
						S
					)
				},
				g = (v) =>
					z(this, null, function* () {
						if (d && v - d < u) {
							h = requestAnimationFrame(g)
							return
						}
						d = v
						const S = (G) => {
								const L = this.mirror.getId(G),
									w = p.get(L),
									V =
										!o.initialSnapshotDelay ||
										v - w > o.initialSnapshotDelay
								return (
									this.debug(G, {
										delay: o.initialSnapshotDelay,
										delta: v - w,
										hadLoadingTime: V,
									}),
									V
								)
							},
							I = []
						I.push(
							...f(v)
								.filter(S)
								.map((G) => this.snapshot(G)),
						),
							I.push(
								...m(v)
									.filter(S)
									.map((G) =>
										z(this, null, function* () {
											this.debug(
												G,
												'starting video snapshotting',
											)
											const L = this.mirror.getId(G)
											if (
												this.snapshotInProgressMap.get(
													L,
												)
											) {
												this.debug(
													G,
													'video snapshotting already in progress for',
													L,
												)
												return
											}
											this.snapshotInProgressMap.set(
												L,
												!0,
											)
											try {
												const { width: w, height: V } =
														G.getBoundingClientRect(),
													{
														actualWidth: P,
														actualHeight: X,
													} = {
														actualWidth:
															G.videoWidth,
														actualHeight:
															G.videoHeight,
													},
													$ = Math.max(P, X)
												if ($ === 0) {
													this.debug(
														G,
														'not yet ready',
														{
															width: G.width,
															height: G.height,
															actualWidth: P,
															actualHeight: X,
															boxWidth: w,
															boxHeight: V,
														},
													)
													return
												}
												let be = l || 1
												a && (be = Math.min(be, a / $))
												const ve = P * be,
													b = X * be,
													T = yield createImageBitmap(
														G,
														{
															resizeWidth: ve,
															resizeHeight: b,
														},
													),
													x = Math.max(w, V) / $,
													ie = P * x,
													D = X * x,
													W = (w - ie) / 2,
													pe = (V - D) / 2
												this.debug(
													G,
													'created image bitmap',
													{
														actualWidth: P,
														actualHeight: X,
														boxWidth: w,
														boxHeight: V,
														outputWidth: ie,
														outputHeight: D,
														resizeWidth: ve,
														resizeHeight: b,
														scale: be,
														outputScale: x,
														offsetX: W,
														offsetY: pe,
													},
												),
													this.worker.postMessage(
														{
															id: L,
															bitmap: T,
															width: ve,
															height: b,
															dx: W,
															dy: pe,
															dw: ie,
															dh: D,
															dataURLOptions:
																o.dataURLOptions,
															logDebug:
																!!this.logger,
														},
														[T],
													),
													this.debug(
														G,
														'send message',
													)
											} catch (w) {
												this.debug(
													G,
													'failed to snapshot',
													w,
												)
											} finally {
												this.snapshotInProgressMap.set(
													L,
													!1,
												)
											}
										}),
									),
							),
							yield Promise.all(I).catch(console.error),
							(h = requestAnimationFrame(g))
					})
			;(h = requestAnimationFrame(g)),
				(this.resetObservers = () => {
					c(), h && cancelAnimationFrame(h)
				})
		}
		initCanvasMutationObserver(e, t, n) {
			this.startRAFTimestamping(),
				this.startPendingCanvasMutationFlusher()
			const i = Cp(e, t, n, !1),
				s = TT(this.processMutation.bind(this), e, t, n),
				o = CT(this.processMutation.bind(this), e, t, n)
			this.resetObservers = () => {
				i(), s(), o()
			}
		}
		startPendingCanvasMutationFlusher() {
			requestAnimationFrame(() => this.flushPendingCanvasMutations())
		}
		startRAFTimestamping() {
			const e = (t) => {
				;(this.rafStamps.latestId = t), requestAnimationFrame(e)
			}
			requestAnimationFrame(e)
		}
		flushPendingCanvasMutations() {
			this.pendingCanvasMutations.forEach((e, t) => {
				const n = this.mirror.getId(t)
				this.flushPendingCanvasMutationFor(t, n)
			}),
				requestAnimationFrame(() => this.flushPendingCanvasMutations())
		}
		flushPendingCanvasMutationFor(e, t) {
			if (this.frozen || this.locked) return
			const n = this.pendingCanvasMutations.get(e)
			if (!n || t === -1) return
			const i = n.map((o) => {
					const c = o,
						{ type: l } = c
					return Ve(c, ['type'])
				}),
				{ type: s } = n[0]
			this.mutationCb({ id: t, type: s, commands: i }),
				this.pendingCanvasMutations.delete(e)
		}
	}
	class LT {
		constructor(e) {
			E(this, 'trackedLinkElements', new WeakSet()),
				E(this, 'mutationCb'),
				E(this, 'adoptedStyleSheetCb'),
				E(this, 'styleMirror', new $Z()),
				(this.mutationCb = e.mutationCb),
				(this.adoptedStyleSheetCb = e.adoptedStyleSheetCb)
		}
		attachLinkElement(e, t) {
			'_cssText' in t.attributes &&
				this.mutationCb({
					adds: [],
					removes: [],
					texts: [],
					attributes: [{ id: t.id, attributes: t.attributes }],
				}),
				this.trackLinkElement(e)
		}
		trackLinkElement(e) {
			this.trackedLinkElements.has(e) ||
				(this.trackedLinkElements.add(e),
				this.trackStylesheetInLinkElement(e))
		}
		adoptStyleSheets(e, t) {
			if (e.length === 0) return
			const n = { id: t, styleIds: [] },
				i = []
			for (const s of e) {
				let o
				this.styleMirror.has(s)
					? (o = this.styleMirror.getId(s))
					: ((o = this.styleMirror.add(s)),
						i.push({
							styleId: o,
							rules: Array.from(s.rules || CSSRule, (l, a) => ({
								rule: Ku(l, s.href),
								index: a,
							})),
						})),
					n.styleIds.push(o)
			}
			i.length > 0 && (n.styles = i), this.adoptedStyleSheetCb(n)
		}
		reset() {
			this.styleMirror.reset(), (this.trackedLinkElements = new WeakSet())
		}
		trackStylesheetInLinkElement(e) {}
	}
	class XT {
		constructor() {
			E(this, 'nodeMap', new WeakMap()), E(this, 'active', !1)
		}
		inOtherBuffer(e, t) {
			const n = this.nodeMap.get(e)
			return n && Array.from(n).some((i) => i !== t)
		}
		add(e, t) {
			this.active ||
				((this.active = !0),
				requestAnimationFrame(() => {
					;(this.nodeMap = new WeakMap()), (this.active = !1)
				})),
				this.nodeMap.set(e, (this.nodeMap.get(e) || new Set()).add(t))
		}
		destroy() {}
	}
	let le,
		ts,
		mn,
		rs = !1
	try {
		if (Array.from([1], (r) => r * 2)[0] !== 2) {
			const r = document.createElement('iframe')
			document.body.appendChild(r),
				(Array.from =
					((Au = r.contentWindow) == null ? void 0 : Au.Array.from) ||
					Array.from),
				document.body.removeChild(r)
		}
	} catch (r) {
		console.debug('Unable to override Array.from', r)
	}
	const De = Pv()
	function bt(r = {}) {
		var e, t, n, i, s, o, l, a
		const {
				emit: c,
				checkoutEveryNms: u,
				checkoutEveryNth: d,
				blockClass: h = 'highlight-block',
				blockSelector: p = null,
				ignoreClass: y = 'highlight-ignore',
				ignoreSelector: f = null,
				maskTextClass: m = 'highlight-mask',
				maskTextSelector: g = null,
				inlineStylesheet: v = !0,
				maskAllInputs: S,
				maskInputOptions: I,
				slimDOMOptions: G,
				maskInputFn: L,
				maskTextFn: w = Yo,
				hooks: V,
				packFn: P,
				sampling: X = {},
				mousemoveWait: $,
				recordDOM: be = !0,
				recordCanvas: ve = !1,
				recordCrossOriginIframes: b = !1,
				recordAfter: T = r.recordAfter === 'DOMContentLoaded'
					? r.recordAfter
					: 'load',
				userTriggeredOnInput: x = !1,
				collectFonts: ie = !1,
				inlineImages: D = !1,
				plugins: W,
				keepIframeSrcFn: pe = () => !1,
				privacySetting: _e = 'default',
				ignoreCSSAttributes: Ye = new Set([]),
				errorHandler: iC,
				logger: sC,
			} = r,
			ms = Z(
				Z({}, r.dataURLOptions),
				(t = (e = r.sampling) == null ? void 0 : e.canvas) == null
					? void 0
					: t.dataURLOptions,
			)
		sT(iC)
		const ys = b ? window.parent === window : !0
		let Rn = !1
		if (!ys)
			try {
				window.parent.document && (Rn = !1)
			} catch (j) {
				Rn = !0
			}
		if (ys && !c) throw new Error('emit function is required')
		if (!ys && !Rn) return () => {}
		$ !== void 0 && X.mousemove === void 0 && (X.mousemove = $), De.reset()
		const Il =
				S === !0
					? {
							color: !0,
							date: !0,
							'datetime-local': !0,
							email: !0,
							month: !0,
							number: !0,
							range: !0,
							search: !0,
							tel: !0,
							text: !0,
							time: !0,
							url: !0,
							week: !0,
							textarea: !0,
							select: !0,
							password: !0,
						}
					: I !== void 0
						? I
						: { password: !0 },
			wl =
				G === !0 || G === 'all'
					? {
							script: !0,
							comment: !0,
							headFavicon: !0,
							headWhitespace: !0,
							headMetaSocial: !0,
							headMetaRobots: !0,
							headMetaHttpEquiv: !0,
							headMetaVerification: !0,
							headMetaAuthorship: G === 'all',
							headMetaDescKeywords: G === 'all',
							headTitleMutations: G === 'all',
						}
					: G || {}
		QZ()
		let vf,
			Zl = 0
		const Rf = (j) => {
			for (const Qe of W || [])
				Qe.eventProcessor && (j = Qe.eventProcessor(j))
			return P && !Rn && (j = P(j)), j
		}
		le = (j, Qe) => {
			var ce
			const ue = j
			if (
				((ue.timestamp = Di()),
				(ce = Ft[0]) != null &&
					ce.isFrozen() &&
					ue.type !== B.FullSnapshot &&
					!(
						ue.type === B.IncrementalSnapshot &&
						ue.data.source === H.Mutation
					) &&
					Ft.forEach((st) => st.unfreeze()),
				ys)
			)
				c == null || c(Rf(ue), Qe)
			else if (Rn) {
				const st = {
					type: 'rrweb',
					event: Rf(ue),
					origin: window.location.origin,
					isCheckout: Qe,
				}
				window.parent.postMessage(st, '*')
			}
			if (ue.type === B.FullSnapshot) (vf = ue), (Zl = 0)
			else if (ue.type === B.IncrementalSnapshot) {
				if (ue.data.source === H.Mutation && ue.data.isAttachIframe)
					return
				Zl++
				const st = d && Zl >= d,
					se = u && ue.timestamp - vf.timestamp > u
				;(st || se) && ts(!0)
			}
		}
		const bs = (j) => {
				le({
					type: B.IncrementalSnapshot,
					data: Z({ source: H.Mutation }, j),
				})
			},
			If = (j) =>
				le({
					type: B.IncrementalSnapshot,
					data: Z({ source: H.Scroll }, j),
				}),
			wf = (j) =>
				le({
					type: B.IncrementalSnapshot,
					data: Z({ source: H.CanvasMutation }, j),
				}),
			oC = (j) =>
				le({
					type: B.IncrementalSnapshot,
					data: Z({ source: H.AdoptedStyleSheet }, j),
				}),
			Ht = new LT({ mutationCb: bs, adoptedStyleSheetCb: oC }),
			Kt = new vT({
				mirror: De,
				mutationCb: bs,
				stylesheetManager: Ht,
				recordCrossOriginIframes: b,
				wrappedEmit: le,
			})
		for (const j of W || [])
			j.getMirror &&
				j.getMirror({
					nodeMirror: De,
					crossOriginIframeMirror: Kt.crossOriginIframeMirror,
					crossOriginIframeStyleMirror:
						Kt.crossOriginIframeStyleMirror,
				})
		const Tl = new XT()
		mn = new NT({
			recordCanvas: ve,
			recordVideos: D,
			mutationCb: wf,
			win: window,
			blockClass: h,
			blockSelector: p,
			mirror: De,
			sampling:
				(n = X == null ? void 0 : X.canvas) == null ? void 0 : n.fps,
			samplingManual:
				(i = X == null ? void 0 : X.canvas) == null
					? void 0
					: i.fpsManual,
			clearWebGLBuffer:
				(s = X == null ? void 0 : X.canvas) == null
					? void 0
					: s.clearWebGLBuffer,
			initialSnapshotDelay:
				(o = X == null ? void 0 : X.canvas) == null
					? void 0
					: o.initialSnapshotDelay,
			dataURLOptions: ms,
			resizeFactor:
				(l = X == null ? void 0 : X.canvas) == null
					? void 0
					: l.resizeFactor,
			maxSnapshotDimension:
				(a = X == null ? void 0 : X.canvas) == null
					? void 0
					: a.maxSnapshotDimension,
			logger: sC,
		})
		const gs = new RT({
			mutationCb: bs,
			scrollCb: If,
			bypassOptions: {
				blockClass: h,
				blockSelector: p,
				maskTextClass: m,
				maskTextSelector: g,
				inlineStylesheet: v,
				maskInputOptions: Il,
				dataURLOptions: ms,
				maskTextFn: w,
				maskInputFn: L,
				recordCanvas: ve,
				inlineImages: D,
				privacySetting: _e,
				sampling: X,
				slimDOMOptions: wl,
				iframeManager: Kt,
				stylesheetManager: Ht,
				canvasManager: mn,
				keepIframeSrcFn: pe,
				processedNodeManager: Tl,
			},
			mirror: De,
		})
		ts = (j = !1) => {
			if (!be) return
			le(
				{
					type: B.Meta,
					data: {
						href: window.location.href,
						width: op(),
						height: sp(),
					},
				},
				j,
			),
				Ht.reset(),
				gs.init(),
				Ft.forEach((ce) => ce.lock())
			const Qe = mR(document, {
				mirror: De,
				blockClass: h,
				blockSelector: p,
				maskTextClass: m,
				maskTextSelector: g,
				inlineStylesheet: v,
				maskAllInputs: Il,
				maskTextFn: w,
				maskInputFn: L,
				slimDOM: wl,
				dataURLOptions: ms,
				recordCanvas: ve,
				inlineImages: D,
				privacySetting: _e,
				onSerialize: (ce) => {
					cp(ce, De) && Kt.addIframe(ce),
						up(ce, De) && Ht.trackLinkElement(ce),
						tl(ce) && gs.addShadowRoot(J.shadowRoot(ce), document)
				},
				onIframeLoad: (ce, ue) => {
					Kt.attachIframe(ce, ue), gs.observeAttachShadow(ce)
				},
				onStylesheetLoad: (ce, ue) => {
					Ht.attachLinkElement(ce, ue)
				},
				keepIframeSrcFn: pe,
			})
			if (!Qe) return console.warn('Failed to snapshot the document')
			le(
				{
					type: B.FullSnapshot,
					data: { node: Qe, initialOffset: ip(window) },
				},
				j,
			),
				Ft.forEach((ce) => ce.unlock()),
				document.adoptedStyleSheets &&
					document.adoptedStyleSheets.length > 0 &&
					Ht.adoptStyleSheets(
						document.adoptedStyleSheets,
						De.getId(document),
					)
		}
		try {
			const j = [],
				Qe = (ue) => {
					var st
					return K(ST)(
						{
							mutationCb: bs,
							mousemoveCb: (se, El) =>
								le({
									type: B.IncrementalSnapshot,
									data: { source: El, positions: se },
								}),
							mouseInteractionCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.MouseInteraction }, se),
								}),
							scrollCb: If,
							viewportResizeCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.ViewportResize }, se),
								}),
							inputCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.Input }, se),
								}),
							mediaInteractionCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.MediaInteraction }, se),
								}),
							styleSheetRuleCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.StyleSheetRule }, se),
								}),
							styleDeclarationCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.StyleDeclaration }, se),
								}),
							canvasMutationCb: wf,
							fontCb: (se) =>
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.Font }, se),
								}),
							selectionCb: (se) => {
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.Selection }, se),
								})
							},
							customElementCb: (se) => {
								le({
									type: B.IncrementalSnapshot,
									data: Z({ source: H.CustomElement }, se),
								})
							},
							blockClass: h,
							ignoreClass: y,
							ignoreSelector: f,
							maskTextClass: m,
							maskTextSelector: g,
							maskInputOptions: Il,
							inlineStylesheet: v,
							sampling: X,
							recordDOM: be,
							recordCanvas: ve,
							inlineImages: D,
							userTriggeredOnInput: x,
							collectFonts: ie,
							doc: ue,
							maskInputFn: L,
							maskTextFn: w,
							keepIframeSrcFn: pe,
							blockSelector: p,
							slimDOMOptions: wl,
							dataURLOptions: ms,
							mirror: De,
							iframeManager: Kt,
							stylesheetManager: Ht,
							shadowDomManager: gs,
							processedNodeManager: Tl,
							canvasManager: mn,
							ignoreCSSAttributes: Ye,
							privacySetting: _e,
							plugins:
								((st =
									W == null
										? void 0
										: W.filter((se) => se.observer)) == null
									? void 0
									: st.map((se) => ({
											observer: se.observer,
											options: se.options,
											callback: (El) =>
												le({
													type: B.Plugin,
													data: {
														plugin: se.name,
														payload: El,
													},
												}),
										}))) || [],
						},
						V,
					)
				}
			Kt.addLoadListener((ue) => {
				try {
					j.push(Qe(ue.contentDocument))
				} catch (st) {
					console.warn(st)
				}
			})
			const ce = () => {
				ts(), j.push(Qe(document)), (rs = !0)
			}
			return (
				document.readyState === 'interactive' ||
				document.readyState === 'complete'
					? ce()
					: (j.push(
							Te('DOMContentLoaded', () => {
								le({ type: B.DomContentLoaded, data: {} }),
									T === 'DOMContentLoaded' && ce()
							}),
						),
						j.push(
							Te(
								'load',
								() => {
									le({ type: B.Load, data: {} }),
										T === 'load' && ce()
								},
								window,
							),
						)),
				() => {
					j.forEach((ue) => ue()), Tl.destroy(), (rs = !1), oT()
				}
			)
		} catch (j) {
			console.warn(j)
		}
	}
	;(bt.addCustomEvent = (r, e) => {
		rs && le({ type: B.Custom, data: { tag: r, payload: e } })
	}),
		(bt.freezePage = () => {
			Ft.forEach((r) => r.freeze())
		}),
		(bt.takeFullSnapshot = (r) => {
			if (!rs)
				throw new Error(
					'please take full snapshot after start recording',
				)
			ts(r)
		}),
		(bt.snapshotCanvas = (r) =>
			z(this, null, function* () {
				if (!mn) throw new Error('canvas manager is not initialized')
				yield mn.snapshot(r)
			})),
		(bt.mirror = De)
	var Lp
	;(function (r) {
		;(r[(r.NotStarted = 0)] = 'NotStarted'),
			(r[(r.Running = 1)] = 'Running'),
			(r[(r.Stopped = 2)] = 'Stopped')
	})(Lp || (Lp = {}))
	const { addCustomEvent: Xp } = bt
	var ns = function () {
			return (
				(ns =
					Object.assign ||
					function (e) {
						for (var t, n = 1, i = arguments.length; n < i; n++) {
							t = arguments[n]
							for (var s in t)
								Object.prototype.hasOwnProperty.call(t, s) &&
									(e[s] = t[s])
						}
						return e
					}),
				ns.apply(this, arguments)
			)
		},
		is = new Map(),
		nl = new Map(),
		Wp = !0,
		ss = !1
	function _p(r) {
		return r.replace(/[\s,]+/g, ' ').trim()
	}
	function WT(r) {
		return _p(r.source.body.substring(r.start, r.end))
	}
	function _T(r) {
		var e = new Set(),
			t = []
		return (
			r.definitions.forEach(function (n) {
				if (n.kind === 'FragmentDefinition') {
					var i = n.name.value,
						s = WT(n.loc),
						o = nl.get(i)
					o && !o.has(s)
						? Wp &&
							console.warn(
								'Warning: fragment with name ' +
									i +
									` already exists.
graphql-tag enforces all fragment names across your application to be unique; read more about
this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names`,
							)
						: o || nl.set(i, (o = new Set())),
						o.add(s),
						e.has(s) || (e.add(s), t.push(n))
				} else t.push(n)
			}),
			ns(ns({}, r), { definitions: t })
		)
	}
	function xT(r) {
		var e = new Set(r.definitions)
		e.forEach(function (n) {
			n.loc && delete n.loc,
				Object.keys(n).forEach(function (i) {
					var s = n[i]
					s && typeof s == 'object' && e.add(s)
				})
		})
		var t = r.loc
		return t && (delete t.startToken, delete t.endToken), r
	}
	function OT(r) {
		var e = _p(r)
		if (!is.has(e)) {
			var t = bo(r, {
				experimentalFragmentVariables: ss,
				allowLegacyFragmentVariables: ss,
			})
			if (!t || t.kind !== 'Document')
				throw new Error('Not a valid GraphQL document.')
			is.set(e, xT(_T(t)))
		}
		return is.get(e)
	}
	function We(r) {
		for (var e = [], t = 1; t < arguments.length; t++)
			e[t - 1] = arguments[t]
		typeof r == 'string' && (r = [r])
		var n = r[0]
		return (
			e.forEach(function (i, s) {
				i && i.kind === 'Document'
					? (n += i.loc.source.body)
					: (n += i),
					(n += r[s + 1])
			}),
			OT(n)
		)
	}
	function kT() {
		is.clear(), nl.clear()
	}
	function PT() {
		Wp = !1
	}
	function UT() {
		ss = !0
	}
	function AT() {
		ss = !1
	}
	var yn = {
		gql: We,
		resetCaches: kT,
		disableFragmentWarnings: PT,
		enableExperimentalFragmentVariables: UT,
		disableExperimentalFragmentVariables: AT,
	}
	;(function (r) {
		;(r.gql = yn.gql),
			(r.resetCaches = yn.resetCaches),
			(r.disableFragmentWarnings = yn.disableFragmentWarnings),
			(r.enableExperimentalFragmentVariables =
				yn.enableExperimentalFragmentVariables),
			(r.disableExperimentalFragmentVariables =
				yn.disableExperimentalFragmentVariables)
	})(We || (We = {})),
		(We.default = We)
	var xp
	;(function (r) {
		r.BillingQuotaExceeded = 'BillingQuotaExceeded'
	})(xp || (xp = {}))
	const Op = We`
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
`,
		MT = We`
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
`,
		YT = We`
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
`,
		FT = We`
	mutation addSessionProperties(
		$session_secure_id: String!
		$properties_object: Any
	) {
		addSessionProperties(
			session_secure_id: $session_secure_id
			properties_object: $properties_object
		)
	}
`,
		JT = We`
	mutation pushMetrics($metrics: [MetricInput]!) {
		pushMetrics(metrics: $metrics)
	}
`,
		HT = We`
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
`,
		KT = We`
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
`,
		BT = We`
	query Ignore($id: ID!) {
		ignore(id: $id)
	}
`,
		zT = (r, e, t, n) => r()
	function DT(r, e = zT) {
		return {
			PushPayload(t, n) {
				return e(
					(i) => r.request(Op, t, Z(Z({}, n), i)),
					'PushPayload',
					'mutation',
					t,
				)
			},
			PushPayloadCompressed(t, n) {
				return e(
					(i) => r.request(MT, t, Z(Z({}, n), i)),
					'PushPayloadCompressed',
					'mutation',
					t,
				)
			},
			identifySession(t, n) {
				return e(
					(i) => r.request(YT, t, Z(Z({}, n), i)),
					'identifySession',
					'mutation',
					t,
				)
			},
			addSessionProperties(t, n) {
				return e(
					(i) => r.request(FT, t, Z(Z({}, n), i)),
					'addSessionProperties',
					'mutation',
					t,
				)
			},
			pushMetrics(t, n) {
				return e(
					(i) => r.request(JT, t, Z(Z({}, n), i)),
					'pushMetrics',
					'mutation',
					t,
				)
			},
			addSessionFeedback(t, n) {
				return e(
					(i) => r.request(HT, t, Z(Z({}, n), i)),
					'addSessionFeedback',
					'mutation',
					t,
				)
			},
			initializeSession(t, n) {
				return e(
					(i) => r.request(KT, t, Z(Z({}, n), i)),
					'initializeSession',
					'mutation',
					t,
				)
			},
			Ignore(t, n) {
				return e(
					(i) => r.request(BT, t, Z(Z({}, n), i)),
					'Ignore',
					'query',
					t,
				)
			},
		}
	}
	const jT = (r) => {
			r(window.location.href)
			const e = history.pushState
			history.pushState = ((s) =>
				function () {
					var l = s.apply(this, arguments)
					return (
						window.dispatchEvent(new Event('pushstate')),
						window.dispatchEvent(new Event('locationchange')),
						l
					)
				})(history.pushState)
			const t = history.replaceState
			history.replaceState = ((s) =>
				function () {
					var l = s.apply(this, arguments)
					return (
						window.dispatchEvent(new Event('replacestate')),
						window.dispatchEvent(new Event('locationchange')),
						l
					)
				})(history.replaceState)
			const n = () => {
				window.dispatchEvent(new Event('locationchange'))
			}
			window.addEventListener('popstate', n)
			const i = function () {
				r(window.location.href)
			}
			return (
				window.addEventListener('locationchange', i),
				() => {
					window.removeEventListener('popstate', n),
						window.removeEventListener('locationchange', i),
						(history.pushState = e),
						(history.replaceState = t)
				}
			)
		},
		QT = (r) => {
			switch (r) {
				case 'strict':
					return [!0, void 0]
				case 'default':
					return [!0, void 0]
				case 'none':
					return [!1, { password: !0 }]
			}
		}
	var Ct
	;(function (r) {
		;(r[(r.All = 0)] = 'All'),
			(r[(r.Two = 1)] = 'Two'),
			(r[(r.One = 2)] = 'One')
	})(Ct || (Ct = {}))
	let Ue, il
	function kp(r, e) {
		return r.nodeType, Node.ELEMENT_NODE, ll(r)
		return $T(r, e)
	}
	function Pp(r) {
		if (r.id.length) return `#${r.id}`
		if (r.classList.length) {
			let e = []
			for (const t of r.classList) e.push(`.${t}`)
			return `${r.nodeName.toLowerCase()}${e.join(',')}`
		}
		return r.nodeName.toLowerCase()
	}
	function $T(r, e) {
		if (r.tagName.toLowerCase() === 'html') return 'html'
		try {
			const t = {
				root: document.body,
				idName: (i) => !0,
				className: (i) => !0,
				tagName: (i) => !0,
				attr: (i, s) => !1,
				seedMinLength: 1,
				optimizedMinLength: 2,
				threshold: 50,
				maxNumberOfTries: 1e3,
				optimized: !0,
			}
			;(Ue = Z(Z({}, t), e)), (il = qT(Ue.root, t))
			let n = sl(r, Ct.All, () => sl(r, Ct.Two, () => sl(r, Ct.One)))
			if (n) {
				if (Ue.optimized) {
					const i = Fp(Jp(n, r))
					i.length > 0 && (n = i[0])
				}
				return os(n)
			} else return ll(r)
		} catch (t) {
			return ll(r)
		}
	}
	function qT(r, e) {
		return r.nodeType === Node.DOCUMENT_NODE
			? r
			: r === e.root
				? r.ownerDocument
				: r
	}
	function sl(r, e, t) {
		let n = null,
			i = [],
			s = r,
			o = 0
		for (; s && s !== Ue.root.parentElement; ) {
			let l = as(eE(s)) ||
				as(...tE(s)) ||
				as(...rE(s)) ||
				as(nE(s)) || [iE()]
			const a = sE(s)
			if (e === Ct.All)
				a && (l = l.concat(l.filter(al).map((c) => ol(c, a))))
			else if (e === Ct.Two)
				(l = l.slice(0, 1)),
					a && (l = l.concat(l.filter(al).map((c) => ol(c, a))))
			else if (e === Ct.One) {
				const [c] = (l = l.slice(0, 1))
				a && al(c) && (l = [ol(c, a)])
			}
			for (let c of l) c.level = o
			if (
				(i.push(l), i.length >= Ue.seedMinLength && ((n = Up(i, t)), n))
			)
				break
			;(s = s.parentElement), o++
		}
		return n || (n = Up(i, t)), n
	}
	function Up(r, e) {
		const t = Fp(Yp(r))
		if (t.length > Ue.threshold) return e ? e() : null
		for (let n of t) if (Mp(n)) return n
		return null
	}
	function os(r) {
		let e = r[0],
			t = e.name
		for (let n = 1; n < r.length; n++) {
			const i = r[n].level || 0
			e.level === i - 1
				? (t = `${r[n].name} > ${t}`)
				: (t = `${r[n].name} ${t}`),
				(e = r[n])
		}
		return t
	}
	function Ap(r) {
		return r.map((e) => e.penalty).reduce((e, t) => e + t, 0)
	}
	function Mp(r) {
		switch (il.querySelectorAll(os(r)).length) {
			case 0:
				return !0
			case 1:
				return !0
			default:
				return !1
		}
	}
	function eE(r) {
		const e = r.getAttribute('id')
		return e && Ue.idName(e)
			? { name: '#' + ls(e, { isIdentifier: !0 }), penalty: 0 }
			: null
	}
	function tE(r) {
		return Array.from(r.attributes)
			.filter((t) => Ue.attr(t.name, t.value))
			.map((t) => ({
				name:
					'[' +
					ls(t.name, { isIdentifier: !0 }) +
					'="' +
					ls(t.value) +
					'"]',
				penalty: 0.5,
			}))
	}
	function rE(r) {
		return Array.from(r.classList)
			.filter(Ue.className)
			.map((t) => ({
				name: '.' + ls(t, { isIdentifier: !0 }),
				penalty: 1,
			}))
	}
	function nE(r) {
		const e = r.tagName.toLowerCase()
		return Ue.tagName(e) ? { name: e, penalty: 2 } : null
	}
	function iE() {
		return { name: '*', penalty: 3 }
	}
	function sE(r) {
		const e = r.parentNode
		if (!e) return null
		let t = e.firstChild
		if (!t) return null
		let n = 0
		for (; t && (t.nodeType === Node.ELEMENT_NODE && n++, t !== r); )
			t = t.nextSibling
		return n
	}
	function ol(r, e) {
		return { name: r.name + `:nth-child(${e})`, penalty: r.penalty + 1 }
	}
	function al(r) {
		return r.name !== 'html' && !r.name.startsWith('#')
	}
	function as(...r) {
		const e = r.filter(oE)
		return e.length > 0 ? e : null
	}
	function oE(r) {
		return r != null
	}
	function* Yp(r, e = []) {
		if (r.length > 0)
			for (let t of r[0]) yield* Vl(Yp(r.slice(1, r.length), e.concat(t)))
		else yield e
	}
	function Fp(r) {
		return Array.from(r).sort((e, t) => Ap(e) - Ap(t))
	}
	function* Jp(r, e, t = { counter: 0, visited: new Map() }) {
		if (r.length > 2 && r.length > Ue.optimizedMinLength)
			for (let n = 1; n < r.length - 1; n++) {
				if (t.counter > Ue.maxNumberOfTries) return
				t.counter += 1
				const i = [...r]
				i.splice(n, 1)
				const s = os(i)
				if (t.visited.has(s)) return
				Mp(i) &&
					aE(i, e) &&
					(yield i, t.visited.set(s, !0), yield* Vl(Jp(i, e, t)))
			}
	}
	function aE(r, e) {
		return il.querySelector(os(r)) === e
	}
	const lE = /[ -,\.\/:-@\[-\^`\{-~]/,
		cE = /[ -,\.\/:-@\[\]\^`\{-~]/,
		uE = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g,
		dE = {
			escapeEverything: !1,
			isIdentifier: !1,
			quotes: 'single',
			wrap: !1,
		}
	function ls(r, e = {}) {
		const t = Z(Z({}, dE), e)
		t.quotes != 'single' && t.quotes != 'double' && (t.quotes = 'single')
		const n = t.quotes == 'double' ? '"' : "'",
			i = t.isIdentifier,
			s = r.charAt(0)
		let o = '',
			l = 0
		const a = r.length
		for (; l < a; ) {
			const c = r.charAt(l++)
			let u = c.charCodeAt(0),
				d
			if (u < 32 || u > 126) {
				if (u >= 55296 && u <= 56319 && l < a) {
					const h = r.charCodeAt(l++)
					;(h & 64512) == 56320
						? (u = ((u & 1023) << 10) + (h & 1023) + 65536)
						: l--
				}
				d = '\\' + u.toString(16).toUpperCase() + ' '
			} else
				t.escapeEverything
					? lE.test(c)
						? (d = '\\' + c)
						: (d = '\\' + u.toString(16).toUpperCase() + ' ')
					: /[\t\n\f\r\x0B]/.test(c)
						? (d = '\\' + u.toString(16).toUpperCase() + ' ')
						: c == '\\' ||
							  (!i &&
									((c == '"' && n == c) ||
										(c == "'" && n == c))) ||
							  (i && cE.test(c))
							? (d = '\\' + c)
							: (d = c)
			o += d
		}
		return (
			i &&
				(/^-[-\d]/.test(o)
					? (o = '\\-' + o.slice(1))
					: /\d/.test(s) && (o = '\\3' + s + ' ' + o.slice(1))),
			(o = o.replace(uE, function (c, u, d) {
				return u && u.length % 2 ? c : (u || '') + d
			})),
			!i && t.wrap ? n + o + n : o
		)
	}
	const ll = (r) => {
			let e = ''
			const t = r.getAttribute('class'),
				n = r.getAttribute('id')
			return (
				n && (e = e.concat(Hp(n, '#'))),
				t && (e = e.concat(Hp(t, '.'))),
				e === '' && (e = e.concat(r.tagName.toLowerCase())),
				e
			)
		},
		Hp = (r, e) => `${e}${r.trim().split(' ').join(e)}`,
		hE = (r) => {
			const e = (t) => {
				if (t.target) {
					const n = t.target,
						i = kp(n)
					r(i, t)
				}
			}
			return (
				window.addEventListener('click', e),
				() => window.removeEventListener('click', e)
			)
		},
		pE = (r) => {
			const e = (t) => {
				if (t.target) {
					const n = kp(t.target)
					r(n)
				}
			}
			return (
				window.addEventListener('focusin', e),
				() => window.removeEventListener('focusin', e)
			)
		},
		fE = 30,
		mE = () =>
			new Promise((r) =>
				requestAnimationFrame((e) =>
					requestAnimationFrame((t) => r(t - e)),
				),
			),
		yE = () =>
			z(this, null, function* () {
				const r = []
				for (let e = 0; e < fE; e++) r.push(yield mE())
				return r.reduce((e, t) => e + t, 0) / r.length
			}),
		bE = (r, e) => {
			let t = {},
				n = 16.666666666666668
			yE().then((a) => (n = a))
			const i = (a) => {
					var c
					;(t != null && t.event) ||
						((t = {
							event: a,
							location: window.location.href,
							timerStart:
								(c = window.performance) == null
									? void 0
									: c.now(),
						}),
						window.requestAnimationFrame(s))
				},
				s = () => {
					if (!(t != null && t.timerStart)) return
					const a = window.performance.now() - t.timerStart - n
					o(a), (t = {})
				},
				o = (a) => {
					const c = (new Date().getTime() - e) / 1e3
					r({
						relativeTimestamp: c,
						jankAmount: a,
						querySelector: l(),
						newLocation:
							window.location.href != t.location
								? window.location.href
								: void 0,
					})
				},
				l = () => {
					var a
					return (a = t == null ? void 0 : t.event) != null &&
						a.target
						? Pp(t.event.target)
						: ''
				}
			return (
				window.addEventListener('click', i, !0),
				window.addEventListener('keydown', i, !0),
				() => {
					window.removeEventListener('keydown', i, !0),
						window.removeEventListener('click', i, !0)
				}
			)
		},
		gE = (r) => {
			let e, t
			if (
				(typeof document.hidden != 'undefined'
					? ((e = 'hidden'), (t = 'visibilitychange'))
					: typeof document.msHidden != 'undefined'
						? ((e = 'msHidden'), (t = 'msvisibilitychange'))
						: typeof document.webkitHidden != 'undefined' &&
							((e = 'webkitHidden'),
							(t = 'webkitvisibilitychange')),
				t === void 0)
			)
				return () => {}
			if (e === void 0) return () => {}
			const n = e,
				i = () => {
					const o = document[n]
					r(!!o)
				}
			document.addEventListener(t, i)
			const s = t
			return () => document.removeEventListener(s, i)
		},
		Kp =
			typeof window != 'undefined' &&
			'performance' in window &&
			'memory' in performance
				? performance
				: { memory: {} },
		SE = (r, e) => {
			let t = 0,
				n = 0
			const i = () => {
				const u = (new Date().getTime() - e) / 1e3,
					d = Kp.memory.jsHeapSizeLimit || 0,
					h = Kp.memory.usedJSHeapSize || 0
				r({
					jsHeapSizeLimit: d,
					usedJSHeapSize: h,
					relativeTimestamp: u,
					fps: t,
				})
			}
			i()
			let s
			s = setInterval(() => {
				i()
			}, 1e3 * 5)
			let o = 0,
				l = Date.now()
			const a = function () {
				var c = Date.now()
				o++,
					c > 1e3 + l &&
						((t = Math.round((o * 1e3) / (c - l))),
						(o = 0),
						(l = c)),
					(n = requestAnimationFrame(a))
			}
			return (
				a(),
				() => {
					clearInterval(s), cancelAnimationFrame(n)
				}
			)
		}
	var Gt
	;(function (r) {
		;(r.USER_ID = 'ajs_user_id'),
			(r.USER_TRAITS = 'ajs_user_traits'),
			(r.ANONYMOUS_ID = 'ajs_anonymous_id')
	})(Gt || (Gt = {}))
	const vE = (r) => {
			r(window.location.href)
			var e = XMLHttpRequest.prototype.send
			XMLHttpRequest.prototype.send = function (s) {
				setTimeout(() => {
					var l
					var o
					try {
						o = JSON.parse(
							(l = s == null ? void 0 : s.toString()) != null
								? l
								: '',
						)
					} catch (a) {
						return
					}
					;(o.type === 'track' || o.type === 'identify') &&
						cl(o) &&
						r(o)
				}, 100),
					e.call(this, s)
			}
			const t = (s) => {
					if (
						s.key === Gt.USER_ID ||
						s.key === Gt.ANONYMOUS_ID ||
						s.key === Gt.USER_TRAITS
					) {
						const { userId: o, userTraits: l } = Bp()
						if (o) {
							let a = {}
							l && (a = JSON.parse(l))
							const c = {
								type: 'identify',
								userId: o.toString(),
								traits: a,
							}
							cl(c) && r(c)
						}
					}
				},
				{ userId: n, userTraits: i } = Bp()
			if (n) {
				let s = {}
				i && (s = JSON.parse(i))
				const o = { type: 'identify', userId: n.toString(), traits: s }
				cl(o) && r(o)
			}
			return (
				window.addEventListener('storage', t),
				X0(({ keyName: s }) => {
					t({ key: s })
				}),
				() => {
					window.removeEventListener('storage', t),
						(XMLHttpRequest.prototype.send = e)
				}
			)
		},
		Bp = () => {
			const r = ke(Gt.USER_ID),
				e = ke(Gt.USER_TRAITS),
				t = ke(Gt.ANONYMOUS_ID)
			return { userId: r, userTraits: e, anonymousId: t }
		},
		cl = (r) => {
			if (!r) return !1
			let e = ''
			try {
				e = JSON.stringify(r)
			} catch (i) {
				return !1
			}
			const t = RE(e),
				n = ke(Ze.SEGMENT_LAST_SENT_HASH_KEY)
			return n === void 0 || t !== n
				? (pt(Ze.SEGMENT_LAST_SENT_HASH_KEY, t), !0)
				: !1
		},
		RE = (r) => {
			var e = 0,
				t = r.length,
				n = 0
			if (t > 0)
				for (; n < t; ) e = ((e << 5) - e + r.charCodeAt(n++)) | 0
			return e.toString()
		},
		IE = (r, e) => {
			const t = wE(r)
			let n = []
			const i = !1,
				s = !0
			for (let o = 0; o < t.length; o++) {
				let l = t[o].split('+')
				;(n = []),
					l.length > 1 && (n = EE(Dp, l)),
					(l = l[l.length - 1]),
					(l = l === '*' ? '*' : TE(l)),
					l in nt || (nt[l] = []),
					nt[l].push({
						mods: n,
						shortcut: t[o],
						key: t[o],
						method: e,
						keyup: i,
						keydown: s,
						scope: 'all',
						splitKey: '+',
					})
			}
			CE(document, 'keydown', (o) => {
				VE(o)
			})
		}
	let Ee = []
	function wE(r) {
		typeof r != 'string' && (r = ''), (r = r.replace(/\s/g, ''))
		const e = r.split(',')
		let t = e.lastIndexOf('')
		for (; t >= 0; )
			(e[t - 1] += ','), e.splice(t, 1), (t = e.lastIndexOf(''))
		return e
	}
	const nt = {},
		ul =
			typeof navigator != 'undefined'
				? navigator.userAgent.toLowerCase().indexOf('firefox') > 0
				: !1,
		ZE = {
			backspace: 8,
			tab: 9,
			clear: 12,
			enter: 13,
			return: 13,
			esc: 27,
			escape: 27,
			space: 32,
			left: 37,
			up: 38,
			right: 39,
			down: 40,
			del: 46,
			delete: 46,
			ins: 45,
			insert: 45,
			home: 36,
			end: 35,
			pageup: 33,
			pagedown: 34,
			capslock: 20,
			num_0: 96,
			num_1: 97,
			num_2: 98,
			num_3: 99,
			num_4: 100,
			num_5: 101,
			num_6: 102,
			num_7: 103,
			num_8: 104,
			num_9: 105,
			num_multiply: 106,
			num_add: 107,
			num_enter: 108,
			num_subtract: 109,
			num_decimal: 110,
			num_divide: 111,
			'⇪': 20,
			',': 188,
			'.': 190,
			'/': 191,
			'`': 192,
			'-': ul ? 173 : 189,
			'=': ul ? 61 : 187,
			';': ul ? 59 : 186,
			"'": 222,
			'[': 219,
			']': 221,
			'\\': 220,
		},
		zp = {
			16: 'shiftKey',
			18: 'altKey',
			17: 'ctrlKey',
			91: 'metaKey',
			shiftKey: 16,
			ctrlKey: 17,
			altKey: 18,
			metaKey: 91,
		},
		Ce = { 16: !1, 18: !1, 17: !1, 91: !1 },
		Dp = {
			'⇧': 16,
			shift: 16,
			'⌥': 18,
			alt: 18,
			option: 18,
			'⌃': 17,
			ctrl: 17,
			control: 17,
			'⌘': 91,
			cmd: 91,
			command: 91,
		},
		TE = (r) =>
			ZE[r.toLowerCase()] ||
			Dp[r.toLowerCase()] ||
			r.toUpperCase().charCodeAt(0)
	function EE(r, e) {
		const t = e.slice(0, e.length - 1)
		for (let n = 0; n < t.length; n++) t[n] = r[t[n].toLowerCase()]
		return t
	}
	function CE(r, e, t) {
		r.addEventListener
			? r.addEventListener(e, t, !1)
			: r.attachEvent &&
				r.attachEvent(`on${e}`, () => {
					t(window.event)
				})
	}
	function GE(r, e, t) {
		let n
		if (e.scope === t || e.scope === 'all') {
			n = e.mods.length > 0
			for (const i in Ce)
				Object.prototype.hasOwnProperty.call(Ce, i) &&
					((!Ce[i] && e.mods.indexOf(+i) > -1) ||
						(Ce[i] && e.mods.indexOf(+i) === -1)) &&
					(n = !1)
			;((e.mods.length === 0 &&
				!Ce[16] &&
				!Ce[18] &&
				!Ce[17] &&
				!Ce[91]) ||
				n ||
				e.shortcut === '*') &&
				e.method(r, e) === !1 &&
				(r.preventDefault ? r.preventDefault() : (r.returnValue = !1),
				r.stopPropagation && r.stopPropagation(),
				r.cancelBubble && (r.cancelBubble = !0))
		}
	}
	function VE(r) {
		const e = nt['*']
		let t = r.keyCode || r.which || r.charCode
		if (
			((t === 93 || t === 224) && (t = 91),
			Ee.indexOf(t) === -1 && t !== 229 && Ee.push(t),
			['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach((n) => {
				const i = zp[n]
				r[n] && Ee.indexOf(i) === -1
					? Ee.push(i)
					: !r[n] && Ee.indexOf(i) > -1
						? Ee.splice(Ee.indexOf(i), 1)
						: n === 'metaKey' &&
							r[n] &&
							Ee.length === 3 &&
							(r.ctrlKey ||
								r.shiftKey ||
								r.altKey ||
								(Ee = Ee.slice(Ee.indexOf(i))))
			}),
			!(t in Ce && ((Ce[t] = !0), !e)))
		) {
			for (const n in Ce)
				Object.prototype.hasOwnProperty.call(Ce, n) &&
					(Ce[n] = r[zp[n]])
			if (
				(r.getModifierState &&
					!(r.altKey && !r.ctrlKey) &&
					r.getModifierState('AltGraph') &&
					(Ee.indexOf(17) === -1 && Ee.push(17),
					Ee.indexOf(18) === -1 && Ee.push(18),
					(Ce[17] = !0),
					(Ce[18] = !0)),
				t in nt)
			) {
				for (let n = 0; n < nt[t].length; n++)
					if (
						((r.type === 'keydown' && nt[t][n].keydown) ||
							(r.type === 'keyup' && nt[t][n].keyup)) &&
						nt[t][n].key
					) {
						const i = nt[t][n]
						GE(r, i, 'all')
					}
			}
		}
	}
	const NE = (r) => {
		let e
		const n = () => {
			clearTimeout(e),
				(e = setTimeout(() => {
					var i, s
					r({
						height: window.innerHeight,
						width: window.innerWidth,
						availHeight: window.screen.availHeight,
						availWidth: window.screen.availWidth,
						colorDepth: window.screen.colorDepth,
						pixelDepth: window.screen.pixelDepth,
						orientation:
							(s =
								(i = window.screen.orientation) == null
									? void 0
									: i.angle) != null
								? s
								: 0,
					})
				}, 500))
		}
		return (
			window.addEventListener('resize', n),
			n(),
			() => window.removeEventListener('resize', n)
		)
	}
	var Vt,
		bn,
		jp,
		cs,
		dl,
		Qp = -1,
		Jt = function (r) {
			addEventListener(
				'pageshow',
				function (e) {
					e.persisted && ((Qp = e.timeStamp), r(e))
				},
				!0,
			)
		},
		hl = function () {
			return (
				window.performance &&
				performance.getEntriesByType &&
				performance.getEntriesByType('navigation')[0]
			)
		},
		us = function () {
			var r = hl()
			return (r && r.activationStart) || 0
		},
		Ae = function (r, e) {
			var t = hl(),
				n = 'navigate'
			return (
				Qp >= 0
					? (n = 'back-forward-cache')
					: t &&
						(document.prerendering || us() > 0
							? (n = 'prerender')
							: document.wasDiscarded
								? (n = 'restore')
								: t.type && (n = t.type.replace(/_/g, '-'))),
				{
					name: r,
					value: e === void 0 ? -1 : e,
					rating: 'good',
					delta: 0,
					entries: [],
					id: 'v3-'
						.concat(Date.now(), '-')
						.concat(
							Math.floor(8999999999999 * Math.random()) + 1e12,
						),
					navigationType: n,
				}
			)
		},
		Rr = function (r, e, t) {
			try {
				if (PerformanceObserver.supportedEntryTypes.includes(r)) {
					var n = new PerformanceObserver(function (i) {
						Promise.resolve().then(function () {
							e(i.getEntries())
						})
					})
					return (
						n.observe(
							Object.assign({ type: r, buffered: !0 }, t || {}),
						),
						n
					)
				}
			} catch (i) {}
		},
		Me = function (r, e, t, n) {
			var i, s
			return function (o) {
				e.value >= 0 &&
					(o || n) &&
					((s = e.value - (i || 0)) || i === void 0) &&
					((i = e.value),
					(e.delta = s),
					(e.rating = (function (l, a) {
						return l > a[1]
							? 'poor'
							: l > a[0]
								? 'needs-improvement'
								: 'good'
					})(e.value, t)),
					r(e))
			}
		},
		pl = function (r) {
			requestAnimationFrame(function () {
				return requestAnimationFrame(function () {
					return r()
				})
			})
		},
		ds = function (r) {
			var e = function (t) {
				;(t.type !== 'pagehide' &&
					document.visibilityState !== 'hidden') ||
					r(t)
			}
			addEventListener('visibilitychange', e, !0),
				addEventListener('pagehide', e, !0)
		},
		fl = function (r) {
			var e = !1
			return function (t) {
				e || (r(t), (e = !0))
			}
		},
		Ir = -1,
		$p = function () {
			return document.visibilityState !== 'hidden' ||
				document.prerendering
				? 1 / 0
				: 0
		},
		hs = function (r) {
			document.visibilityState === 'hidden' &&
				Ir > -1 &&
				((Ir = r.type === 'visibilitychange' ? r.timeStamp : 0), LE())
		},
		qp = function () {
			addEventListener('visibilitychange', hs, !0),
				addEventListener('prerenderingchange', hs, !0)
		},
		LE = function () {
			removeEventListener('visibilitychange', hs, !0),
				removeEventListener('prerenderingchange', hs, !0)
		},
		ml = function () {
			return (
				Ir < 0 &&
					((Ir = $p()),
					qp(),
					Jt(function () {
						setTimeout(function () {
							;(Ir = $p()), qp()
						}, 0)
					})),
				{
					get firstHiddenTime() {
						return Ir
					},
				}
			)
		},
		gn = function (r) {
			document.prerendering
				? addEventListener(
						'prerenderingchange',
						function () {
							return r()
						},
						!0,
					)
				: r()
		},
		ef = [1800, 3e3],
		tf = function (r, e) {
			;(e = e || {}),
				gn(function () {
					var t,
						n = ml(),
						i = Ae('FCP'),
						s = Rr('paint', function (o) {
							o.forEach(function (l) {
								l.name === 'first-contentful-paint' &&
									(s.disconnect(),
									l.startTime < n.firstHiddenTime &&
										((i.value = Math.max(
											l.startTime - us(),
											0,
										)),
										i.entries.push(l),
										t(!0)))
							})
						})
					s &&
						((t = Me(r, i, ef, e.reportAllChanges)),
						Jt(function (o) {
							;(i = Ae('FCP')),
								(t = Me(r, i, ef, e.reportAllChanges)),
								pl(function () {
									;(i.value =
										performance.now() - o.timeStamp),
										t(!0)
								})
						}))
				})
		},
		rf = [0.1, 0.25],
		XE = function (r, e) {
			;(e = e || {}),
				tf(
					fl(function () {
						var t,
							n = Ae('CLS', 0),
							i = 0,
							s = [],
							o = function (a) {
								a.forEach(function (c) {
									if (!c.hadRecentInput) {
										var u = s[0],
											d = s[s.length - 1]
										i &&
										c.startTime - d.startTime < 1e3 &&
										c.startTime - u.startTime < 5e3
											? ((i += c.value), s.push(c))
											: ((i = c.value), (s = [c]))
									}
								}),
									i > n.value &&
										((n.value = i), (n.entries = s), t())
							},
							l = Rr('layout-shift', o)
						l &&
							((t = Me(r, n, rf, e.reportAllChanges)),
							ds(function () {
								o(l.takeRecords()), t(!0)
							}),
							Jt(function () {
								;(i = 0),
									(n = Ae('CLS', 0)),
									(t = Me(r, n, rf, e.reportAllChanges)),
									pl(function () {
										return t()
									})
							}),
							setTimeout(t, 0))
					}),
				)
		},
		Sn = { passive: !0, capture: !0 },
		WE = new Date(),
		nf = function (r, e) {
			Vt ||
				((Vt = e),
				(bn = r),
				(jp = new Date()),
				of(removeEventListener),
				sf())
		},
		sf = function () {
			if (bn >= 0 && bn < jp - WE) {
				var r = {
					entryType: 'first-input',
					name: Vt.type,
					target: Vt.target,
					cancelable: Vt.cancelable,
					startTime: Vt.timeStamp,
					processingStart: Vt.timeStamp + bn,
				}
				cs.forEach(function (e) {
					e(r)
				}),
					(cs = [])
			}
		},
		_E = function (r) {
			if (r.cancelable) {
				var e =
					(r.timeStamp > 1e12 ? new Date() : performance.now()) -
					r.timeStamp
				r.type == 'pointerdown'
					? (function (t, n) {
							var i = function () {
									nf(t, n), o()
								},
								s = function () {
									o()
								},
								o = function () {
									removeEventListener('pointerup', i, Sn),
										removeEventListener(
											'pointercancel',
											s,
											Sn,
										)
								}
							addEventListener('pointerup', i, Sn),
								addEventListener('pointercancel', s, Sn)
						})(e, r)
					: nf(e, r)
			}
		},
		of = function (r) {
			;['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(
				function (e) {
					return r(e, _E, Sn)
				},
			)
		},
		af = [100, 300],
		xE = function (r, e) {
			;(e = e || {}),
				gn(function () {
					var t,
						n = ml(),
						i = Ae('FID'),
						s = function (a) {
							a.startTime < n.firstHiddenTime &&
								((i.value = a.processingStart - a.startTime),
								i.entries.push(a),
								t(!0))
						},
						o = function (a) {
							a.forEach(s)
						},
						l = Rr('first-input', o)
					;(t = Me(r, i, af, e.reportAllChanges)),
						l &&
							ds(
								fl(function () {
									o(l.takeRecords()), l.disconnect()
								}),
							),
						l &&
							Jt(function () {
								var a
								;(i = Ae('FID')),
									(t = Me(r, i, af, e.reportAllChanges)),
									(cs = []),
									(bn = -1),
									(Vt = null),
									of(addEventListener),
									(a = s),
									cs.push(a),
									sf()
							})
				})
		},
		lf = 0,
		yl = 1 / 0,
		ps = 0,
		OE = function (r) {
			r.forEach(function (e) {
				e.interactionId &&
					((yl = Math.min(yl, e.interactionId)),
					(ps = Math.max(ps, e.interactionId)),
					(lf = ps ? (ps - yl) / 7 + 1 : 0))
			})
		},
		cf = function () {
			return dl ? lf : performance.interactionCount || 0
		},
		kE = function () {
			'interactionCount' in performance ||
				dl ||
				(dl = Rr('event', OE, {
					type: 'event',
					buffered: !0,
					durationThreshold: 0,
				}))
		},
		uf = [200, 500],
		df = 0,
		hf = function () {
			return cf() - df
		},
		it = [],
		bl = {},
		pf = function (r) {
			var e = it[it.length - 1],
				t = bl[r.interactionId]
			if (t || it.length < 10 || r.duration > e.latency) {
				if (t)
					t.entries.push(r),
						(t.latency = Math.max(t.latency, r.duration))
				else {
					var n = {
						id: r.interactionId,
						latency: r.duration,
						entries: [r],
					}
					;(bl[n.id] = n), it.push(n)
				}
				it.sort(function (i, s) {
					return s.latency - i.latency
				}),
					it.splice(10).forEach(function (i) {
						delete bl[i.id]
					})
			}
		},
		PE = function (r, e) {
			;(e = e || {}),
				gn(function () {
					var t
					kE()
					var n,
						i = Ae('INP'),
						s = function (l) {
							l.forEach(function (u) {
								u.interactionId && pf(u),
									u.entryType === 'first-input' &&
										!it.some(function (d) {
											return d.entries.some(function (h) {
												return (
													u.duration === h.duration &&
													u.startTime === h.startTime
												)
											})
										}) &&
										pf(u)
							})
							var a,
								c =
									((a = Math.min(
										it.length - 1,
										Math.floor(hf() / 50),
									)),
									it[a])
							c &&
								c.latency !== i.value &&
								((i.value = c.latency),
								(i.entries = c.entries),
								n())
						},
						o = Rr('event', s, {
							durationThreshold:
								(t = e.durationThreshold) !== null &&
								t !== void 0
									? t
									: 40,
						})
					;(n = Me(r, i, uf, e.reportAllChanges)),
						o &&
							('interactionId' in
								PerformanceEventTiming.prototype &&
								o.observe({
									type: 'first-input',
									buffered: !0,
								}),
							ds(function () {
								s(o.takeRecords()),
									i.value < 0 &&
										hf() > 0 &&
										((i.value = 0), (i.entries = [])),
									n(!0)
							}),
							Jt(function () {
								;(it = []),
									(df = cf()),
									(i = Ae('INP')),
									(n = Me(r, i, uf, e.reportAllChanges))
							}))
				})
		},
		ff = [2500, 4e3],
		gl = {},
		UE = function (r, e) {
			;(e = e || {}),
				gn(function () {
					var t,
						n = ml(),
						i = Ae('LCP'),
						s = function (a) {
							var c = a[a.length - 1]
							c &&
								c.startTime < n.firstHiddenTime &&
								((i.value = Math.max(c.startTime - us(), 0)),
								(i.entries = [c]),
								t())
						},
						o = Rr('largest-contentful-paint', s)
					if (o) {
						t = Me(r, i, ff, e.reportAllChanges)
						var l = fl(function () {
							gl[i.id] ||
								(s(o.takeRecords()),
								o.disconnect(),
								(gl[i.id] = !0),
								t(!0))
						})
						;['keydown', 'click'].forEach(function (a) {
							addEventListener(
								a,
								function () {
									return setTimeout(l, 0)
								},
								!0,
							)
						}),
							ds(l),
							Jt(function (a) {
								;(i = Ae('LCP')),
									(t = Me(r, i, ff, e.reportAllChanges)),
									pl(function () {
										;(i.value =
											performance.now() - a.timeStamp),
											(gl[i.id] = !0),
											t(!0)
									})
							})
					}
				})
		},
		mf = [800, 1800],
		AE = function r(e) {
			document.prerendering
				? gn(function () {
						return r(e)
					})
				: document.readyState !== 'complete'
					? addEventListener(
							'load',
							function () {
								return r(e)
							},
							!0,
						)
					: setTimeout(e, 0)
		},
		ME = function (r, e) {
			e = e || {}
			var t = Ae('TTFB'),
				n = Me(r, t, mf, e.reportAllChanges)
			AE(function () {
				var i = hl()
				if (i) {
					var s = i.responseStart
					if (s <= 0 || s > performance.now()) return
					;(t.value = Math.max(s - us(), 0)),
						(t.entries = [i]),
						n(!0),
						Jt(function () {
							;(t = Ae('TTFB', 0)),
								(n = Me(r, t, mf, e.reportAllChanges))(!0)
						})
				}
			})
		}
	const YE = (r) => (XE(r), tf(r), xE(r), UE(r), ME(r), PE(r), () => {})
	class FE {
		constructor(e, t) {
			C(this, 'debug')
			C(this, 'name')
			;(this.debug = e), (this.name = t)
		}
		log(...e) {
			if (this.debug) {
				let t = `[${Date.now()}]`
				this.name && (t += ` - ${this.name}`),
					console.log.apply(console, [t, ...e])
			}
		}
	}
	const yf = 'iframe parent ready',
		bf = 'iframe ok'
	var Sl
	;(function (r) {
		r.BillingQuotaExceeded = 'BillingQuotaExceeded'
	})(Sl || (Sl = {}))
	const JE = 10,
		HE = 1e3,
		KE = 500,
		BE = [Sl.BillingQuotaExceeded.toString()],
		zE = (r) => {
			var t
			return (
				((t = r.response.errors) == null
					? void 0
					: t.find((n) => BE.includes(n.message))) === void 0
			)
		},
		DE = (r) => {
			const e = (t, n, i, s, o = 0) =>
				z(this, null, function* () {
					try {
						return yield t()
					} catch (l) {
						if (l instanceof ir && !zE(l)) throw l
						if (o < JE)
							return (
								yield new Promise((a) =>
									setTimeout(a, HE + KE * Math.pow(2, o)),
								),
								yield e(t, n, i, s, o + 1)
							)
						throw (
							(console.error(
								`highlight.io: [${r || r}] data request failed after ${o} retries`,
							),
							l)
						)
					}
				})
			return e
		},
		vn = 'highlightLogs',
		jE = (r) => {
			let e = ke(vn) || ''
			;(e =
				e +
				'[' +
				new Date().getTime() +
				'] ' +
				r +
				`
`),
				pt(vn, e)
		},
		QE = () => ke(vn) || '',
		$E = (r) => {
			if (!r) return
			let e = ke(vn) || ''
			e &&
				(e.startsWith(r)
					? ((e = e.slice(r.length)), pt(vn, e))
					: jE(
							'Unable to clear logs ' +
								r.replace(
									`
`,
									' ',
								) +
								' from ' +
								e.replace(
									`
`,
									' ',
								),
						))
		},
		qE = () => {
			if (!('performance' in window && 'memory' in performance))
				return {
					getDeviceDetails: void 0,
					getCurrentDeviceDetails: void 0,
				}
			const r = window.performance
			return {
				getDeviceDetails: () => ({
					deviceMemory: eC(navigator.deviceMemory || 0),
				}),
				getCurrentDeviceDetails: () => {
					const n = vl(r.memory.jsHeapSizeLimit),
						i = vl(r.memory.totalJSHeapSize),
						s = vl(r.memory.usedJSHeapSize)
					return {
						jsHeapSizeLimit: n,
						totalJSHeapSize: i,
						usedJSHeapSize: s,
					}
				},
			}
		},
		vl = (r) => r / Math.pow(1e3, 2),
		eC = (r) => 1024 * r,
		gf =
			'dmFyIFVyPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxWcj1PYmplY3QuZGVmaW5lUHJvcGVydGllczt2YXIganI9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7dmFyIE1lPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7dmFyIFF0PU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksWHQ9T2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTt2YXIgdXQ9KEIsRCxDKT0+RCBpbiBCP1VyKEIsRCx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6Q30pOkJbRF09QyxQPShCLEQpPT57Zm9yKHZhciBDIGluIER8fChEPXt9KSlRdC5jYWxsKEQsQykmJnV0KEIsQyxEW0NdKTtpZihNZSlmb3IodmFyIEMgb2YgTWUoRCkpWHQuY2FsbChELEMpJiZ1dChCLEMsRFtDXSk7cmV0dXJuIEJ9LFVlPShCLEQpPT5WcihCLGpyKEQpKTt2YXIgdmU9KEIsRCk9Pnt2YXIgQz17fTtmb3IodmFyIEogaW4gQilRdC5jYWxsKEIsSikmJkQuaW5kZXhPZihKKTwwJiYoQ1tKXT1CW0pdKTtpZihCIT1udWxsJiZNZSlmb3IodmFyIEogb2YgTWUoQikpRC5pbmRleE9mKEopPDAmJlh0LmNhbGwoQixKKSYmKENbSl09QltKXSk7cmV0dXJuIEN9O3ZhciBsdD0oQixELEMpPT51dChCLHR5cGVvZiBEIT0ic3ltYm9sIj9EKyIiOkQsQyk7dmFyIFg9KEIsRCxDKT0+bmV3IFByb21pc2UoKEosY2UpPT57dmFyIGdlPWVlPT57dHJ5e3VlKEMubmV4dChlZSkpfWNhdGNoKEVlKXtjZShFZSl9fSxJZT1lZT0+e3RyeXt1ZShDLnRocm93KGVlKSl9Y2F0Y2goRWUpe2NlKEVlKX19LHVlPWVlPT5lZS5kb25lP0ooZWUudmFsdWUpOlByb21pc2UucmVzb2x2ZShlZS52YWx1ZSkudGhlbihnZSxJZSk7dWUoKEM9Qy5hcHBseShCLEQpKS5uZXh0KCkpfSk7KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIEIoZSx0KXtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKG4pe24mJnR5cGVvZiBuIT0ic3RyaW5nIiYmIUFycmF5LmlzQXJyYXkobikmJk9iamVjdC5rZXlzKG4pLmZvckVhY2goZnVuY3Rpb24oaSl7aWYoaSE9PSJkZWZhdWx0IiYmIShpIGluIGUpKXt2YXIgcj1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG4saSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsaSxyLmdldD9yOntlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBuW2ldfX0pfX0pfSksT2JqZWN0LmZyZWV6ZShlKX12YXIgRD1VaW50OEFycmF5LEM9VWludDE2QXJyYXksSj1JbnQzMkFycmF5LGNlPW5ldyBEKFswLDAsMCwwLDAsMCwwLDAsMSwxLDEsMSwyLDIsMiwyLDMsMywzLDMsNCw0LDQsNCw1LDUsNSw1LDAsMCwwLDBdKSxnZT1uZXcgRChbMCwwLDAsMCwxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4LDksOSwxMCwxMCwxMSwxMSwxMiwxMiwxMywxMywwLDBdKSxJZT1uZXcgRChbMTYsMTcsMTgsMCw4LDcsOSw2LDEwLDUsMTEsNCwxMiwzLDEzLDIsMTQsMSwxNV0pLHVlPWZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPW5ldyBDKDMxKSxpPTA7aTwzMTsrK2kpbltpXT10Kz0xPDxlW2ktMV07Zm9yKHZhciByPW5ldyBKKG5bMzBdKSxpPTE7aTwzMDsrK2kpZm9yKHZhciBzPW5baV07czxuW2krMV07KytzKXJbc109cy1uW2ldPDw1fGk7cmV0dXJue2I6bixyfX0sZWU9dWUoY2UsMiksRWU9ZWUuYixWZT1lZS5yO0VlWzI4XT0yNTgsVmVbMjU4XT0yODtmb3IodmFyIFd0PXVlKGdlLDApLGZ0PVd0LnIsamU9bmV3IEMoMzI3NjgpLEY9MDtGPDMyNzY4OysrRil7dmFyIGllPShGJjQzNjkwKT4+MXwoRiYyMTg0NSk8PDE7aWU9KGllJjUyNDI4KT4+MnwoaWUmMTMxMDcpPDwyLGllPShpZSY2MTY4MCk+PjR8KGllJjM4NTUpPDw0LGplW0ZdPSgoaWUmNjUyODApPj44fChpZSYyNTUpPDw4KT4+MX1mb3IodmFyIF9lPWZ1bmN0aW9uKGUsdCxuKXtmb3IodmFyIGk9ZS5sZW5ndGgscj0wLHM9bmV3IEModCk7cjxpOysrcillW3JdJiYrK3NbZVtyXS0xXTt2YXIgbz1uZXcgQyh0KTtmb3Iocj0xO3I8dDsrK3Ipb1tyXT1vW3ItMV0rc1tyLTFdPDwxO3ZhciBjO2lmKG4pe2M9bmV3IEMoMTw8dCk7dmFyIGY9MTUtdDtmb3Iocj0wO3I8aTsrK3IpaWYoZVtyXSlmb3IodmFyIGQ9cjw8NHxlW3JdLHU9dC1lW3JdLHk9b1tlW3JdLTFdKys8PHUsZz15fCgxPDx1KS0xO3k8PWc7Kyt5KWNbamVbeV0+PmZdPWR9ZWxzZSBmb3IoYz1uZXcgQyhpKSxyPTA7cjxpOysrcillW3JdJiYoY1tyXT1qZVtvW2Vbcl0tMV0rK10+PjE1LWVbcl0pO3JldHVybiBjfSxvZT1uZXcgRCgyODgpLEY9MDtGPDE0NDsrK0Ypb2VbRl09ODtmb3IodmFyIEY9MTQ0O0Y8MjU2OysrRilvZVtGXT05O2Zvcih2YXIgRj0yNTY7RjwyODA7KytGKW9lW0ZdPTc7Zm9yKHZhciBGPTI4MDtGPDI4ODsrK0Ypb2VbRl09ODtmb3IodmFyIE9lPW5ldyBEKDMyKSxGPTA7RjwzMjsrK0YpT2VbRl09NTt2YXIgWnQ9X2Uob2UsOSwwKSxLdD1fZShPZSw1LDApLGh0PWZ1bmN0aW9uKGUpe3JldHVybihlKzcpLzh8MH0sZHQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybihuPT1udWxsfHxuPmUubGVuZ3RoKSYmKG49ZS5sZW5ndGgpLG5ldyBEKGUuc3ViYXJyYXkodCxuKSl9LG5lPWZ1bmN0aW9uKGUsdCxuKXtuPDw9dCY3O3ZhciBpPXQvOHwwO2VbaV18PW4sZVtpKzFdfD1uPj44fSxUZT1mdW5jdGlvbihlLHQsbil7bjw8PXQmNzt2YXIgaT10Lzh8MDtlW2ldfD1uLGVbaSsxXXw9bj4+OCxlW2krMl18PW4+PjE2fSxxZT1mdW5jdGlvbihlLHQpe2Zvcih2YXIgbj1bXSxpPTA7aTxlLmxlbmd0aDsrK2kpZVtpXSYmbi5wdXNoKHtzOmksZjplW2ldfSk7dmFyIHI9bi5sZW5ndGgscz1uLnNsaWNlKCk7aWYoIXIpcmV0dXJue3Q6dnQsbDowfTtpZihyPT0xKXt2YXIgbz1uZXcgRChuWzBdLnMrMSk7cmV0dXJuIG9bblswXS5zXT0xLHt0Om8sbDoxfX1uLnNvcnQoZnVuY3Rpb24oJCxxKXtyZXR1cm4gJC5mLXEuZn0pLG4ucHVzaCh7czotMSxmOjI1MDAxfSk7dmFyIGM9blswXSxmPW5bMV0sZD0wLHU9MSx5PTI7Zm9yKG5bMF09e3M6LTEsZjpjLmYrZi5mLGw6YyxyOmZ9O3UhPXItMTspYz1uW25bZF0uZjxuW3ldLmY/ZCsrOnkrK10sZj1uW2QhPXUmJm5bZF0uZjxuW3ldLmY/ZCsrOnkrK10sblt1KytdPXtzOi0xLGY6Yy5mK2YuZixsOmMscjpmfTtmb3IodmFyIGc9c1swXS5zLGk9MTtpPHI7KytpKXNbaV0ucz5nJiYoZz1zW2ldLnMpO3ZhciBiPW5ldyBDKGcrMSksbT1HZShuW3UtMV0sYiwwKTtpZihtPnQpe3ZhciBpPTAsTj0wLHY9bS10LEU9MTw8djtmb3Iocy5zb3J0KGZ1bmN0aW9uKHEsTSl7cmV0dXJuIGJbTS5zXS1iW3Euc118fHEuZi1NLmZ9KTtpPHI7KytpKXt2YXIgaz1zW2ldLnM7aWYoYltrXT50KU4rPUUtKDE8PG0tYltrXSksYltrXT10O2Vsc2UgYnJlYWt9Zm9yKE4+Pj12O04+MDspe3ZhciB3PXNbaV0ucztiW3ddPHQ/Ti09MTw8dC1iW3ddKystMTorK2l9Zm9yKDtpPj0wJiZOOy0taSl7dmFyIEw9c1tpXS5zO2JbTF09PXQmJigtLWJbTF0sKytOKX1tPXR9cmV0dXJue3Q6bmV3IEQoYiksbDptfX0sR2U9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlLnM9PS0xP01hdGgubWF4KEdlKGUubCx0LG4rMSksR2UoZS5yLHQsbisxKSk6dFtlLnNdPW59LHB0PWZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1lLmxlbmd0aDt0JiYhZVstLXRdOyk7Zm9yKHZhciBuPW5ldyBDKCsrdCksaT0wLHI9ZVswXSxzPTEsbz1mdW5jdGlvbihmKXtuW2krK109Zn0sYz0xO2M8PXQ7KytjKWlmKGVbY109PXImJmMhPXQpKytzO2Vsc2V7aWYoIXImJnM+Mil7Zm9yKDtzPjEzODtzLT0xMzgpbygzMjc1NCk7cz4yJiYobyhzPjEwP3MtMTE8PDV8Mjg2OTA6cy0zPDw1fDEyMzA1KSxzPTApfWVsc2UgaWYocz4zKXtmb3IobyhyKSwtLXM7cz42O3MtPTYpbyg4MzA0KTtzPjImJihvKHMtMzw8NXw4MjA4KSxzPTApfWZvcig7cy0tOylvKHIpO3M9MSxyPWVbY119cmV0dXJue2M6bi5zdWJhcnJheSgwLGkpLG46dH19LGJlPWZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPTAsaT0wO2k8dC5sZW5ndGg7KytpKW4rPWVbaV0qdFtpXTtyZXR1cm4gbn0sbXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciBpPW4ubGVuZ3RoLHI9aHQodCsyKTtlW3JdPWkmMjU1LGVbcisxXT1pPj44LGVbcisyXT1lW3JdXjI1NSxlW3IrM109ZVtyKzFdXjI1NTtmb3IodmFyIHM9MDtzPGk7KytzKWVbcitzKzRdPW5bc107cmV0dXJuKHIrNCtpKSo4fSx5dD1mdW5jdGlvbihlLHQsbixpLHIscyxvLGMsZixkLHUpe25lKHQsdSsrLG4pLCsrclsyNTZdO2Zvcih2YXIgeT1xZShyLDE1KSxnPXkudCxiPXkubCxtPXFlKHMsMTUpLE49bS50LHY9bS5sLEU9cHQoZyksaz1FLmMsdz1FLm4sTD1wdChOKSwkPUwuYyxxPUwubixNPW5ldyBDKDE5KSxJPTA7STxrLmxlbmd0aDsrK0kpKytNW2tbSV0mMzFdO2Zvcih2YXIgST0wO0k8JC5sZW5ndGg7KytJKSsrTVskW0ldJjMxXTtmb3IodmFyIE89cWUoTSw3KSxqPU8udCxVPU8ubCxIPTE5O0g+NCYmIWpbSWVbSC0xXV07LS1IKTt2YXIgUT1kKzU8PDMsYT1iZShyLG9lKStiZShzLE9lKStvLGg9YmUocixnKStiZShzLE4pK28rMTQrMypIK2JlKE0saikrMipNWzE2XSszKk1bMTddKzcqTVsxOF07aWYoZj49MCYmUTw9YSYmUTw9aClyZXR1cm4gbXQodCx1LGUuc3ViYXJyYXkoZixmK2QpKTt2YXIgXyxBLFIseDtpZihuZSh0LHUsMSsoaDxhKSksdSs9MixoPGEpe189X2UoZyxiLDApLEE9ZyxSPV9lKE4sdiwwKSx4PU47dmFyIHNlPV9lKGosVSwwKTtuZSh0LHUsdy0yNTcpLG5lKHQsdSs1LHEtMSksbmUodCx1KzEwLEgtNCksdSs9MTQ7Zm9yKHZhciBJPTA7STxIOysrSSluZSh0LHUrMypJLGpbSWVbSV1dKTt1Kz0zKkg7Zm9yKHZhciB6PVtrLCRdLHJlPTA7cmU8MjsrK3JlKWZvcih2YXIgbWU9eltyZV0sST0wO0k8bWUubGVuZ3RoOysrSSl7dmFyIHRlPW1lW0ldJjMxO25lKHQsdSxzZVt0ZV0pLHUrPWpbdGVdLHRlPjE1JiYobmUodCx1LG1lW0ldPj41JjEyNyksdSs9bWVbSV0+PjEyKX19ZWxzZSBfPVp0LEE9b2UsUj1LdCx4PU9lO2Zvcih2YXIgST0wO0k8YzsrK0kpe3ZhciBZPWlbSV07aWYoWT4yNTUpe3ZhciB0ZT1ZPj4xOCYzMTtUZSh0LHUsX1t0ZSsyNTddKSx1Kz1BW3RlKzI1N10sdGU+NyYmKG5lKHQsdSxZPj4yMyYzMSksdSs9Y2VbdGVdKTt2YXIgeWU9WSYzMTtUZSh0LHUsUlt5ZV0pLHUrPXhbeWVdLHllPjMmJihUZSh0LHUsWT4+NSY4MTkxKSx1Kz1nZVt5ZV0pfWVsc2UgVGUodCx1LF9bWV0pLHUrPUFbWV19cmV0dXJuIFRlKHQsdSxfWzI1Nl0pLHUrQVsyNTZdfSxlbj1uZXcgSihbNjU1NDAsMTMxMDgwLDEzMTA4OCwxMzExMDQsMjYyMTc2LDEwNDg3MDQsMTA0ODgzMiwyMTE0NTYwLDIxMTc2MzJdKSx2dD1uZXcgRCgwKSx0bj1mdW5jdGlvbihlLHQsbixpLHIscyl7dmFyIG89cy56fHxlLmxlbmd0aCxjPW5ldyBEKGkrbys1KigxK01hdGguY2VpbChvLzdlMykpK3IpLGY9Yy5zdWJhcnJheShpLGMubGVuZ3RoLXIpLGQ9cy5sLHU9KHMucnx8MCkmNztpZih0KXt1JiYoZlswXT1zLnI+PjMpO2Zvcih2YXIgeT1lblt0LTFdLGc9eT4+MTMsYj15JjgxOTEsbT0oMTw8biktMSxOPXMucHx8bmV3IEMoMzI3NjgpLHY9cy5ofHxuZXcgQyhtKzEpLEU9TWF0aC5jZWlsKG4vMyksaz0yKkUsdz1mdW5jdGlvbihjdCl7cmV0dXJuKGVbY3RdXmVbY3QrMV08PEVeZVtjdCsyXTw8aykmbX0sTD1uZXcgSigyNWUzKSwkPW5ldyBDKDI4OCkscT1uZXcgQygzMiksTT0wLEk9MCxPPXMuaXx8MCxqPTAsVT1zLnd8fDAsSD0wO08rMjxvOysrTyl7dmFyIFE9dyhPKSxhPU8mMzI3NjcsaD12W1FdO2lmKE5bYV09aCx2W1FdPWEsVTw9Tyl7dmFyIF89by1PO2lmKChNPjdlM3x8aj4yNDU3NikmJihfPjQyM3x8IWQpKXt1PXl0KGUsZiwwLEwsJCxxLEksaixILE8tSCx1KSxqPU09ST0wLEg9Tztmb3IodmFyIEE9MDtBPDI4NjsrK0EpJFtBXT0wO2Zvcih2YXIgQT0wO0E8MzA7KytBKXFbQV09MH12YXIgUj0yLHg9MCxzZT1iLHo9YS1oJjMyNzY3O2lmKF8+MiYmUT09dyhPLXopKWZvcih2YXIgcmU9TWF0aC5taW4oZyxfKS0xLG1lPU1hdGgubWluKDMyNzY3LE8pLHRlPU1hdGgubWluKDI1OCxfKTt6PD1tZSYmLS1zZSYmYSE9aDspe2lmKGVbTytSXT09ZVtPK1Itel0pe2Zvcih2YXIgWT0wO1k8dGUmJmVbTytZXT09ZVtPK1ktel07KytZKTtpZihZPlIpe2lmKFI9WSx4PXosWT5yZSlicmVhaztmb3IodmFyIHllPU1hdGgubWluKHosWS0yKSxIdD0wLEE9MDtBPHllOysrQSl7dmFyIG90PU8teitBJjMyNzY3LE1yPU5bb3RdLHp0PW90LU1yJjMyNzY3O3p0Pkh0JiYoSHQ9enQsaD1vdCl9fX1hPWgsaD1OW2FdLHorPWEtaCYzMjc2N31pZih4KXtMW2orK109MjY4NDM1NDU2fFZlW1JdPDwxOHxmdFt4XTt2YXIgWXQ9VmVbUl0mMzEsSnQ9ZnRbeF0mMzE7SSs9Y2VbWXRdK2dlW0p0XSwrKyRbMjU3K1l0XSwrK3FbSnRdLFU9TytSLCsrTX1lbHNlIExbaisrXT1lW09dLCsrJFtlW09dXX19Zm9yKE89TWF0aC5tYXgoTyxVKTtPPG87KytPKUxbaisrXT1lW09dLCsrJFtlW09dXTt1PXl0KGUsZixkLEwsJCxxLEksaixILE8tSCx1KSxkfHwocy5yPXUmN3xmW3UvOHwwXTw8Myx1LT03LHMuaD12LHMucD1OLHMuaT1PLHMudz1VKX1lbHNle2Zvcih2YXIgTz1zLnd8fDA7TzxvK2Q7Tys9NjU1MzUpe3ZhciBhdD1PKzY1NTM1O2F0Pj1vJiYoZlt1Lzh8MF09ZCxhdD1vKSx1PW10KGYsdSsxLGUuc3ViYXJyYXkoTyxhdCkpfXMuaT1vfXJldHVybiBkdChjLDAsaStodCh1KStyKX0sbm49ZnVuY3Rpb24oKXtmb3IodmFyIGU9bmV3IEludDMyQXJyYXkoMjU2KSx0PTA7dDwyNTY7Kyt0KXtmb3IodmFyIG49dCxpPTk7LS1pOyluPShuJjEmJi0zMDY2NzQ5MTIpXm4+Pj4xO2VbdF09bn1yZXR1cm4gZX0oKSxybj1mdW5jdGlvbigpe3ZhciBlPS0xO3JldHVybntwOmZ1bmN0aW9uKHQpe2Zvcih2YXIgbj1lLGk9MDtpPHQubGVuZ3RoOysraSluPW5uW24mMjU1XnRbaV1dXm4+Pj44O2U9bn0sZDpmdW5jdGlvbigpe3JldHVybn5lfX19LHNuPWZ1bmN0aW9uKGUsdCxuLGkscil7aWYoIXImJihyPXtsOjF9LHQuZGljdGlvbmFyeSkpe3ZhciBzPXQuZGljdGlvbmFyeS5zdWJhcnJheSgtMzI3NjgpLG89bmV3IEQocy5sZW5ndGgrZS5sZW5ndGgpO28uc2V0KHMpLG8uc2V0KGUscy5sZW5ndGgpLGU9byxyLnc9cy5sZW5ndGh9cmV0dXJuIHRuKGUsdC5sZXZlbD09bnVsbD82OnQubGV2ZWwsdC5tZW09PW51bGw/ci5sP01hdGguY2VpbChNYXRoLm1heCg4LE1hdGgubWluKDEzLE1hdGgubG9nKGUubGVuZ3RoKSkpKjEuNSk6MjA6MTIrdC5tZW0sbixpLHIpfSxIZT1mdW5jdGlvbihlLHQsbil7Zm9yKDtuOysrdCllW3RdPW4sbj4+Pj04fSxvbj1mdW5jdGlvbihlLHQpe3ZhciBuPXQuZmlsZW5hbWU7aWYoZVswXT0zMSxlWzFdPTEzOSxlWzJdPTgsZVs4XT10LmxldmVsPDI/NDp0LmxldmVsPT05PzI6MCxlWzldPTMsdC5tdGltZSE9MCYmSGUoZSw0LE1hdGguZmxvb3IobmV3IERhdGUodC5tdGltZXx8RGF0ZS5ub3coKSkvMWUzKSksbil7ZVszXT04O2Zvcih2YXIgaT0wO2k8PW4ubGVuZ3RoOysraSllW2krMTBdPW4uY2hhckNvZGVBdChpKX19LGFuPWZ1bmN0aW9uKGUpe3JldHVybiAxMCsoZS5maWxlbmFtZT9lLmZpbGVuYW1lLmxlbmd0aCsxOjApfTtmdW5jdGlvbiBjbihlLHQpe3R8fCh0PXt9KTt2YXIgbj1ybigpLGk9ZS5sZW5ndGg7bi5wKGUpO3ZhciByPXNuKGUsdCxhbih0KSw4KSxzPXIubGVuZ3RoO3JldHVybiBvbihyLHQpLEhlKHIscy04LG4uZCgpKSxIZShyLHMtNCxpKSxyfXZhciBndD10eXBlb2YgVGV4dEVuY29kZXIhPSJ1bmRlZmluZWQiJiZuZXcgVGV4dEVuY29kZXIsdW49dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIiYmbmV3IFRleHREZWNvZGVyLGxuPTA7dHJ5e3VuLmRlY29kZSh2dCx7c3RyZWFtOiEwfSksbG49MX1jYXRjaChlKXt9ZnVuY3Rpb24gZm4oZSx0KXt2YXIgbjtpZihndClyZXR1cm4gZ3QuZW5jb2RlKGUpO2Zvcih2YXIgaT1lLmxlbmd0aCxyPW5ldyBEKGUubGVuZ3RoKyhlLmxlbmd0aD4+MSkpLHM9MCxvPWZ1bmN0aW9uKGQpe3JbcysrXT1kfSxuPTA7bjxpOysrbil7aWYocys1PnIubGVuZ3RoKXt2YXIgYz1uZXcgRChzKzgrKGktbjw8MSkpO2Muc2V0KHIpLHI9Y312YXIgZj1lLmNoYXJDb2RlQXQobik7ZjwxMjh8fHQ/byhmKTpmPDIwNDg/KG8oMTkyfGY+PjYpLG8oMTI4fGYmNjMpKTpmPjU1Mjk1JiZmPDU3MzQ0PyhmPTY1NTM2KyhmJjEwNDc1NTIpfGUuY2hhckNvZGVBdCgrK24pJjEwMjMsbygyNDB8Zj4+MTgpLG8oMTI4fGY+PjEyJjYzKSxvKDEyOHxmPj42JjYzKSxvKDEyOHxmJjYzKSk6KG8oMjI0fGY+PjEyKSxvKDEyOHxmPj42JjYzKSxvKDEyOHxmJjYzKSl9cmV0dXJuIGR0KHIsMCxzKX1jb25zdCB6ZT1KU09OLGhuPWU9PmUudG9VcHBlckNhc2UoKSxkbj1lPT57Y29uc3QgdD17fTtyZXR1cm4gZS5mb3JFYWNoKChuLGkpPT57dFtpXT1ufSksdH0scG49KGUsdCxuKT0+ZS5kb2N1bWVudD9lOntkb2N1bWVudDplLHZhcmlhYmxlczp0LHJlcXVlc3RIZWFkZXJzOm4sc2lnbmFsOnZvaWQgMH0sbW49KGUsdCxuKT0+ZS5xdWVyeT9lOntxdWVyeTplLHZhcmlhYmxlczp0LHJlcXVlc3RIZWFkZXJzOm4sc2lnbmFsOnZvaWQgMH0seW49KGUsdCk9PmUuZG9jdW1lbnRzP2U6e2RvY3VtZW50czplLHJlcXVlc3RIZWFkZXJzOnQsc2lnbmFsOnZvaWQgMH07ZnVuY3Rpb24gU2UoZSx0KXtpZighISFlKXRocm93IG5ldyBFcnJvcih0KX1mdW5jdGlvbiB2bihlKXtyZXR1cm4gdHlwZW9mIGU9PSJvYmplY3QiJiZlIT09bnVsbH1mdW5jdGlvbiBnbihlLHQpe2lmKCEhIWUpdGhyb3cgbmV3IEVycm9yKCJVbmV4cGVjdGVkIGludmFyaWFudCB0cmlnZ2VyZWQuIil9Y29uc3QgRW49L1xyXG58W1xuXHJdL2c7ZnVuY3Rpb24gWWUoZSx0KXtsZXQgbj0wLGk9MTtmb3IoY29uc3QgciBvZiBlLmJvZHkubWF0Y2hBbGwoRW4pKXtpZih0eXBlb2Ygci5pbmRleD09Im51bWJlciJ8fGduKCExKSxyLmluZGV4Pj10KWJyZWFrO249ci5pbmRleCtyWzBdLmxlbmd0aCxpKz0xfXJldHVybntsaW5lOmksY29sdW1uOnQrMS1ufX1mdW5jdGlvbiBfbihlKXtyZXR1cm4gRXQoZS5zb3VyY2UsWWUoZS5zb3VyY2UsZS5zdGFydCkpfWZ1bmN0aW9uIEV0KGUsdCl7Y29uc3Qgbj1lLmxvY2F0aW9uT2Zmc2V0LmNvbHVtbi0xLGk9IiIucGFkU3RhcnQobikrZS5ib2R5LHI9dC5saW5lLTEscz1lLmxvY2F0aW9uT2Zmc2V0LmxpbmUtMSxvPXQubGluZStzLGM9dC5saW5lPT09MT9uOjAsZj10LmNvbHVtbitjLGQ9YCR7ZS5uYW1lfToke299OiR7Zn0KYCx1PWkuc3BsaXQoL1xyXG58W1xuXHJdL2cpLHk9dVtyXTtpZih5Lmxlbmd0aD4xMjApe2NvbnN0IGc9TWF0aC5mbG9vcihmLzgwKSxiPWYlODAsbT1bXTtmb3IobGV0IE49MDtOPHkubGVuZ3RoO04rPTgwKW0ucHVzaCh5LnNsaWNlKE4sTis4MCkpO3JldHVybiBkK190KFtbYCR7b30gfGAsbVswXV0sLi4ubS5zbGljZSgxLGcrMSkubWFwKE49PlsifCIsTl0pLFsifCIsIl4iLnBhZFN0YXJ0KGIpXSxbInwiLG1bZysxXV1dKX1yZXR1cm4gZCtfdChbW2Ake28tMX0gfGAsdVtyLTFdXSxbYCR7b30gfGAseV0sWyJ8IiwiXiIucGFkU3RhcnQoZildLFtgJHtvKzF9IHxgLHVbcisxXV1dKX1mdW5jdGlvbiBfdChlKXtjb25zdCB0PWUuZmlsdGVyKChbaSxyXSk9PnIhPT12b2lkIDApLG49TWF0aC5tYXgoLi4udC5tYXAoKFtpXSk9PmkubGVuZ3RoKSk7cmV0dXJuIHQubWFwKChbaSxyXSk9PmkucGFkU3RhcnQobikrKHI/IiAiK3I6IiIpKS5qb2luKGAKYCl9ZnVuY3Rpb24gVG4oZSl7Y29uc3QgdD1lWzBdO3JldHVybiB0PT1udWxsfHwia2luZCJpbiB0fHwibGVuZ3RoImluIHQ/e25vZGVzOnQsc291cmNlOmVbMV0scG9zaXRpb25zOmVbMl0scGF0aDplWzNdLG9yaWdpbmFsRXJyb3I6ZVs0XSxleHRlbnNpb25zOmVbNV19OnR9Y2xhc3MgSmUgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3Rvcih0LC4uLm4pe3ZhciBpLHIscztjb25zdHtub2RlczpvLHNvdXJjZTpjLHBvc2l0aW9uczpmLHBhdGg6ZCxvcmlnaW5hbEVycm9yOnUsZXh0ZW5zaW9uczp5fT1UbihuKTtzdXBlcih0KSx0aGlzLm5hbWU9IkdyYXBoUUxFcnJvciIsdGhpcy5wYXRoPWQhPW51bGw/ZDp2b2lkIDAsdGhpcy5vcmlnaW5hbEVycm9yPXUhPW51bGw/dTp2b2lkIDAsdGhpcy5ub2Rlcz1UdChBcnJheS5pc0FycmF5KG8pP286bz9bb106dm9pZCAwKTtjb25zdCBnPVR0KChpPXRoaXMubm9kZXMpPT09bnVsbHx8aT09PXZvaWQgMD92b2lkIDA6aS5tYXAobT0+bS5sb2MpLmZpbHRlcihtPT5tIT1udWxsKSk7dGhpcy5zb3VyY2U9YyE9bnVsbD9jOmc9PW51bGx8fChyPWdbMF0pPT09bnVsbHx8cj09PXZvaWQgMD92b2lkIDA6ci5zb3VyY2UsdGhpcy5wb3NpdGlvbnM9ZiE9bnVsbD9mOmc9PW51bGw/dm9pZCAwOmcubWFwKG09Pm0uc3RhcnQpLHRoaXMubG9jYXRpb25zPWYmJmM/Zi5tYXAobT0+WWUoYyxtKSk6Zz09bnVsbD92b2lkIDA6Zy5tYXAobT0+WWUobS5zb3VyY2UsbS5zdGFydCkpO2NvbnN0IGI9dm4odT09bnVsbD92b2lkIDA6dS5leHRlbnNpb25zKT91PT1udWxsP3ZvaWQgMDp1LmV4dGVuc2lvbnM6dm9pZCAwO3RoaXMuZXh0ZW5zaW9ucz0ocz15IT1udWxsP3k6YikhPT1udWxsJiZzIT09dm9pZCAwP3M6T2JqZWN0LmNyZWF0ZShudWxsKSxPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLHttZXNzYWdlOnt3cml0YWJsZTohMCxlbnVtZXJhYmxlOiEwfSxuYW1lOntlbnVtZXJhYmxlOiExfSxub2Rlczp7ZW51bWVyYWJsZTohMX0sc291cmNlOntlbnVtZXJhYmxlOiExfSxwb3NpdGlvbnM6e2VudW1lcmFibGU6ITF9LG9yaWdpbmFsRXJyb3I6e2VudW1lcmFibGU6ITF9fSksdSE9bnVsbCYmdS5zdGFjaz9PYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywic3RhY2siLHt2YWx1ZTp1LnN0YWNrLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH0pOkVycm9yLmNhcHR1cmVTdGFja1RyYWNlP0Vycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsSmUpOk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCJzdGFjayIse3ZhbHVlOkVycm9yKCkuc3RhY2ssd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfSl9Z2V0W1N5bWJvbC50b1N0cmluZ1RhZ10oKXtyZXR1cm4iR3JhcGhRTEVycm9yIn10b1N0cmluZygpe2xldCB0PXRoaXMubWVzc2FnZTtpZih0aGlzLm5vZGVzKWZvcihjb25zdCBuIG9mIHRoaXMubm9kZXMpbi5sb2MmJih0Kz1gCgpgK19uKG4ubG9jKSk7ZWxzZSBpZih0aGlzLnNvdXJjZSYmdGhpcy5sb2NhdGlvbnMpZm9yKGNvbnN0IG4gb2YgdGhpcy5sb2NhdGlvbnMpdCs9YAoKYCtFdCh0aGlzLnNvdXJjZSxuKTtyZXR1cm4gdH10b0pTT04oKXtjb25zdCB0PXttZXNzYWdlOnRoaXMubWVzc2FnZX07cmV0dXJuIHRoaXMubG9jYXRpb25zIT1udWxsJiYodC5sb2NhdGlvbnM9dGhpcy5sb2NhdGlvbnMpLHRoaXMucGF0aCE9bnVsbCYmKHQucGF0aD10aGlzLnBhdGgpLHRoaXMuZXh0ZW5zaW9ucyE9bnVsbCYmT2JqZWN0LmtleXModGhpcy5leHRlbnNpb25zKS5sZW5ndGg+MCYmKHQuZXh0ZW5zaW9ucz10aGlzLmV4dGVuc2lvbnMpLHR9fWZ1bmN0aW9uIFR0KGUpe3JldHVybiBlPT09dm9pZCAwfHxlLmxlbmd0aD09PTA/dm9pZCAwOmV9ZnVuY3Rpb24gRyhlLHQsbil7cmV0dXJuIG5ldyBKZShgU3ludGF4IEVycm9yOiAke259YCx7c291cmNlOmUscG9zaXRpb25zOlt0XX0pfWNsYXNzIGJue2NvbnN0cnVjdG9yKHQsbixpKXt0aGlzLnN0YXJ0PXQuc3RhcnQsdGhpcy5lbmQ9bi5lbmQsdGhpcy5zdGFydFRva2VuPXQsdGhpcy5lbmRUb2tlbj1uLHRoaXMuc291cmNlPWl9Z2V0W1N5bWJvbC50b1N0cmluZ1RhZ10oKXtyZXR1cm4iTG9jYXRpb24ifXRvSlNPTigpe3JldHVybntzdGFydDp0aGlzLnN0YXJ0LGVuZDp0aGlzLmVuZH19fWNsYXNzIGJ0e2NvbnN0cnVjdG9yKHQsbixpLHIscyxvKXt0aGlzLmtpbmQ9dCx0aGlzLnN0YXJ0PW4sdGhpcy5lbmQ9aSx0aGlzLmxpbmU9cix0aGlzLmNvbHVtbj1zLHRoaXMudmFsdWU9byx0aGlzLnByZXY9bnVsbCx0aGlzLm5leHQ9bnVsbH1nZXRbU3ltYm9sLnRvU3RyaW5nVGFnXSgpe3JldHVybiJUb2tlbiJ9dG9KU09OKCl7cmV0dXJue2tpbmQ6dGhpcy5raW5kLHZhbHVlOnRoaXMudmFsdWUsbGluZTp0aGlzLmxpbmUsY29sdW1uOnRoaXMuY29sdW1ufX19Y29uc3QgTnQ9e05hbWU6W10sRG9jdW1lbnQ6WyJkZWZpbml0aW9ucyJdLE9wZXJhdGlvbkRlZmluaXRpb246WyJuYW1lIiwidmFyaWFibGVEZWZpbml0aW9ucyIsImRpcmVjdGl2ZXMiLCJzZWxlY3Rpb25TZXQiXSxWYXJpYWJsZURlZmluaXRpb246WyJ2YXJpYWJsZSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJkaXJlY3RpdmVzIl0sVmFyaWFibGU6WyJuYW1lIl0sU2VsZWN0aW9uU2V0Olsic2VsZWN0aW9ucyJdLEZpZWxkOlsiYWxpYXMiLCJuYW1lIiwiYXJndW1lbnRzIiwiZGlyZWN0aXZlcyIsInNlbGVjdGlvblNldCJdLEFyZ3VtZW50OlsibmFtZSIsInZhbHVlIl0sRnJhZ21lbnRTcHJlYWQ6WyJuYW1lIiwiZGlyZWN0aXZlcyJdLElubGluZUZyYWdtZW50OlsidHlwZUNvbmRpdGlvbiIsImRpcmVjdGl2ZXMiLCJzZWxlY3Rpb25TZXQiXSxGcmFnbWVudERlZmluaXRpb246WyJuYW1lIiwidmFyaWFibGVEZWZpbml0aW9ucyIsInR5cGVDb25kaXRpb24iLCJkaXJlY3RpdmVzIiwic2VsZWN0aW9uU2V0Il0sSW50VmFsdWU6W10sRmxvYXRWYWx1ZTpbXSxTdHJpbmdWYWx1ZTpbXSxCb29sZWFuVmFsdWU6W10sTnVsbFZhbHVlOltdLEVudW1WYWx1ZTpbXSxMaXN0VmFsdWU6WyJ2YWx1ZXMiXSxPYmplY3RWYWx1ZTpbImZpZWxkcyJdLE9iamVjdEZpZWxkOlsibmFtZSIsInZhbHVlIl0sRGlyZWN0aXZlOlsibmFtZSIsImFyZ3VtZW50cyJdLE5hbWVkVHlwZTpbIm5hbWUiXSxMaXN0VHlwZTpbInR5cGUiXSxOb25OdWxsVHlwZTpbInR5cGUiXSxTY2hlbWFEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJkaXJlY3RpdmVzIiwib3BlcmF0aW9uVHlwZXMiXSxPcGVyYXRpb25UeXBlRGVmaW5pdGlvbjpbInR5cGUiXSxTY2FsYXJUeXBlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImRpcmVjdGl2ZXMiXSxPYmplY3RUeXBlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImludGVyZmFjZXMiLCJkaXJlY3RpdmVzIiwiZmllbGRzIl0sRmllbGREZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwiYXJndW1lbnRzIiwidHlwZSIsImRpcmVjdGl2ZXMiXSxJbnB1dFZhbHVlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJkaXJlY3RpdmVzIl0sSW50ZXJmYWNlVHlwZURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJpbnRlcmZhY2VzIiwiZGlyZWN0aXZlcyIsImZpZWxkcyJdLFVuaW9uVHlwZURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJkaXJlY3RpdmVzIiwidHlwZXMiXSxFbnVtVHlwZURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJkaXJlY3RpdmVzIiwidmFsdWVzIl0sRW51bVZhbHVlRGVmaW5pdGlvbjpbImRlc2NyaXB0aW9uIiwibmFtZSIsImRpcmVjdGl2ZXMiXSxJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uOlsiZGVzY3JpcHRpb24iLCJuYW1lIiwiZGlyZWN0aXZlcyIsImZpZWxkcyJdLERpcmVjdGl2ZURlZmluaXRpb246WyJkZXNjcmlwdGlvbiIsIm5hbWUiLCJhcmd1bWVudHMiLCJsb2NhdGlvbnMiXSxTY2hlbWFFeHRlbnNpb246WyJkaXJlY3RpdmVzIiwib3BlcmF0aW9uVHlwZXMiXSxTY2FsYXJUeXBlRXh0ZW5zaW9uOlsibmFtZSIsImRpcmVjdGl2ZXMiXSxPYmplY3RUeXBlRXh0ZW5zaW9uOlsibmFtZSIsImludGVyZmFjZXMiLCJkaXJlY3RpdmVzIiwiZmllbGRzIl0sSW50ZXJmYWNlVHlwZUV4dGVuc2lvbjpbIm5hbWUiLCJpbnRlcmZhY2VzIiwiZGlyZWN0aXZlcyIsImZpZWxkcyJdLFVuaW9uVHlwZUV4dGVuc2lvbjpbIm5hbWUiLCJkaXJlY3RpdmVzIiwidHlwZXMiXSxFbnVtVHlwZUV4dGVuc2lvbjpbIm5hbWUiLCJkaXJlY3RpdmVzIiwidmFsdWVzIl0sSW5wdXRPYmplY3RUeXBlRXh0ZW5zaW9uOlsibmFtZSIsImRpcmVjdGl2ZXMiLCJmaWVsZHMiXX0sTm49bmV3IFNldChPYmplY3Qua2V5cyhOdCkpO2Z1bmN0aW9uIHh0KGUpe2NvbnN0IHQ9ZT09bnVsbD92b2lkIDA6ZS5raW5kO3JldHVybiB0eXBlb2YgdD09InN0cmluZyImJk5uLmhhcyh0KX12YXIgbGU7KGZ1bmN0aW9uKGUpe2UuUVVFUlk9InF1ZXJ5IixlLk1VVEFUSU9OPSJtdXRhdGlvbiIsZS5TVUJTQ1JJUFRJT049InN1YnNjcmlwdGlvbiJ9KShsZXx8KGxlPXt9KSk7dmFyIFFlOyhmdW5jdGlvbihlKXtlLlFVRVJZPSJRVUVSWSIsZS5NVVRBVElPTj0iTVVUQVRJT04iLGUuU1VCU0NSSVBUSU9OPSJTVUJTQ1JJUFRJT04iLGUuRklFTEQ9IkZJRUxEIixlLkZSQUdNRU5UX0RFRklOSVRJT049IkZSQUdNRU5UX0RFRklOSVRJT04iLGUuRlJBR01FTlRfU1BSRUFEPSJGUkFHTUVOVF9TUFJFQUQiLGUuSU5MSU5FX0ZSQUdNRU5UPSJJTkxJTkVfRlJBR01FTlQiLGUuVkFSSUFCTEVfREVGSU5JVElPTj0iVkFSSUFCTEVfREVGSU5JVElPTiIsZS5TQ0hFTUE9IlNDSEVNQSIsZS5TQ0FMQVI9IlNDQUxBUiIsZS5PQkpFQ1Q9Ik9CSkVDVCIsZS5GSUVMRF9ERUZJTklUSU9OPSJGSUVMRF9ERUZJTklUSU9OIixlLkFSR1VNRU5UX0RFRklOSVRJT049IkFSR1VNRU5UX0RFRklOSVRJT04iLGUuSU5URVJGQUNFPSJJTlRFUkZBQ0UiLGUuVU5JT049IlVOSU9OIixlLkVOVU09IkVOVU0iLGUuRU5VTV9WQUxVRT0iRU5VTV9WQUxVRSIsZS5JTlBVVF9PQkpFQ1Q9IklOUFVUX09CSkVDVCIsZS5JTlBVVF9GSUVMRF9ERUZJTklUSU9OPSJJTlBVVF9GSUVMRF9ERUZJTklUSU9OIn0pKFFlfHwoUWU9e30pKTt2YXIgVDsoZnVuY3Rpb24oZSl7ZS5OQU1FPSJOYW1lIixlLkRPQ1VNRU5UPSJEb2N1bWVudCIsZS5PUEVSQVRJT05fREVGSU5JVElPTj0iT3BlcmF0aW9uRGVmaW5pdGlvbiIsZS5WQVJJQUJMRV9ERUZJTklUSU9OPSJWYXJpYWJsZURlZmluaXRpb24iLGUuU0VMRUNUSU9OX1NFVD0iU2VsZWN0aW9uU2V0IixlLkZJRUxEPSJGaWVsZCIsZS5BUkdVTUVOVD0iQXJndW1lbnQiLGUuRlJBR01FTlRfU1BSRUFEPSJGcmFnbWVudFNwcmVhZCIsZS5JTkxJTkVfRlJBR01FTlQ9IklubGluZUZyYWdtZW50IixlLkZSQUdNRU5UX0RFRklOSVRJT049IkZyYWdtZW50RGVmaW5pdGlvbiIsZS5WQVJJQUJMRT0iVmFyaWFibGUiLGUuSU5UPSJJbnRWYWx1ZSIsZS5GTE9BVD0iRmxvYXRWYWx1ZSIsZS5TVFJJTkc9IlN0cmluZ1ZhbHVlIixlLkJPT0xFQU49IkJvb2xlYW5WYWx1ZSIsZS5OVUxMPSJOdWxsVmFsdWUiLGUuRU5VTT0iRW51bVZhbHVlIixlLkxJU1Q9Ikxpc3RWYWx1ZSIsZS5PQkpFQ1Q9Ik9iamVjdFZhbHVlIixlLk9CSkVDVF9GSUVMRD0iT2JqZWN0RmllbGQiLGUuRElSRUNUSVZFPSJEaXJlY3RpdmUiLGUuTkFNRURfVFlQRT0iTmFtZWRUeXBlIixlLkxJU1RfVFlQRT0iTGlzdFR5cGUiLGUuTk9OX05VTExfVFlQRT0iTm9uTnVsbFR5cGUiLGUuU0NIRU1BX0RFRklOSVRJT049IlNjaGVtYURlZmluaXRpb24iLGUuT1BFUkFUSU9OX1RZUEVfREVGSU5JVElPTj0iT3BlcmF0aW9uVHlwZURlZmluaXRpb24iLGUuU0NBTEFSX1RZUEVfREVGSU5JVElPTj0iU2NhbGFyVHlwZURlZmluaXRpb24iLGUuT0JKRUNUX1RZUEVfREVGSU5JVElPTj0iT2JqZWN0VHlwZURlZmluaXRpb24iLGUuRklFTERfREVGSU5JVElPTj0iRmllbGREZWZpbml0aW9uIixlLklOUFVUX1ZBTFVFX0RFRklOSVRJT049IklucHV0VmFsdWVEZWZpbml0aW9uIixlLklOVEVSRkFDRV9UWVBFX0RFRklOSVRJT049IkludGVyZmFjZVR5cGVEZWZpbml0aW9uIixlLlVOSU9OX1RZUEVfREVGSU5JVElPTj0iVW5pb25UeXBlRGVmaW5pdGlvbiIsZS5FTlVNX1RZUEVfREVGSU5JVElPTj0iRW51bVR5cGVEZWZpbml0aW9uIixlLkVOVU1fVkFMVUVfREVGSU5JVElPTj0iRW51bVZhbHVlRGVmaW5pdGlvbiIsZS5JTlBVVF9PQkpFQ1RfVFlQRV9ERUZJTklUSU9OPSJJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uIixlLkRJUkVDVElWRV9ERUZJTklUSU9OPSJEaXJlY3RpdmVEZWZpbml0aW9uIixlLlNDSEVNQV9FWFRFTlNJT049IlNjaGVtYUV4dGVuc2lvbiIsZS5TQ0FMQVJfVFlQRV9FWFRFTlNJT049IlNjYWxhclR5cGVFeHRlbnNpb24iLGUuT0JKRUNUX1RZUEVfRVhURU5TSU9OPSJPYmplY3RUeXBlRXh0ZW5zaW9uIixlLklOVEVSRkFDRV9UWVBFX0VYVEVOU0lPTj0iSW50ZXJmYWNlVHlwZUV4dGVuc2lvbiIsZS5VTklPTl9UWVBFX0VYVEVOU0lPTj0iVW5pb25UeXBlRXh0ZW5zaW9uIixlLkVOVU1fVFlQRV9FWFRFTlNJT049IkVudW1UeXBlRXh0ZW5zaW9uIixlLklOUFVUX09CSkVDVF9UWVBFX0VYVEVOU0lPTj0iSW5wdXRPYmplY3RUeXBlRXh0ZW5zaW9uIn0pKFR8fChUPXt9KSk7ZnVuY3Rpb24gWGUoZSl7cmV0dXJuIGU9PT05fHxlPT09MzJ9ZnVuY3Rpb24gTmUoZSl7cmV0dXJuIGU+PTQ4JiZlPD01N31mdW5jdGlvbiBBdChlKXtyZXR1cm4gZT49OTcmJmU8PTEyMnx8ZT49NjUmJmU8PTkwfWZ1bmN0aW9uIEl0KGUpe3JldHVybiBBdChlKXx8ZT09PTk1fWZ1bmN0aW9uIHhuKGUpe3JldHVybiBBdChlKXx8TmUoZSl8fGU9PT05NX1mdW5jdGlvbiBBbihlKXt2YXIgdDtsZXQgbj1OdW1iZXIuTUFYX1NBRkVfSU5URUdFUixpPW51bGwscj0tMTtmb3IobGV0IG89MDtvPGUubGVuZ3RoOysrbyl7dmFyIHM7Y29uc3QgYz1lW29dLGY9SW4oYyk7ZiE9PWMubGVuZ3RoJiYoaT0ocz1pKSE9PW51bGwmJnMhPT12b2lkIDA/czpvLHI9byxvIT09MCYmZjxuJiYobj1mKSl9cmV0dXJuIGUubWFwKChvLGMpPT5jPT09MD9vOm8uc2xpY2UobikpLnNsaWNlKCh0PWkpIT09bnVsbCYmdCE9PXZvaWQgMD90OjAscisxKX1mdW5jdGlvbiBJbihlKXtsZXQgdD0wO2Zvcig7dDxlLmxlbmd0aCYmWGUoZS5jaGFyQ29kZUF0KHQpKTspKyt0O3JldHVybiB0fWZ1bmN0aW9uIE9uKGUsdCl7Y29uc3Qgbj1lLnJlcGxhY2UoLyIiIi9nLCdcXCIiIicpLGk9bi5zcGxpdCgvXHJcbnxbXG5ccl0vZykscj1pLmxlbmd0aD09PTEscz1pLmxlbmd0aD4xJiZpLnNsaWNlKDEpLmV2ZXJ5KGI9PmIubGVuZ3RoPT09MHx8WGUoYi5jaGFyQ29kZUF0KDApKSksbz1uLmVuZHNXaXRoKCdcXCIiIicpLGM9ZS5lbmRzV2l0aCgnIicpJiYhbyxmPWUuZW5kc1dpdGgoIlxcIiksZD1jfHxmLHU9IXJ8fGUubGVuZ3RoPjcwfHxkfHxzfHxvO2xldCB5PSIiO2NvbnN0IGc9ciYmWGUoZS5jaGFyQ29kZUF0KDApKTtyZXR1cm4odSYmIWd8fHMpJiYoeSs9YApgKSx5Kz1uLCh1fHxkKSYmKHkrPWAKYCksJyIiIicreSsnIiIiJ312YXIgbDsoZnVuY3Rpb24oZSl7ZS5TT0Y9IjxTT0Y+IixlLkVPRj0iPEVPRj4iLGUuQkFORz0iISIsZS5ET0xMQVI9IiQiLGUuQU1QPSImIixlLlBBUkVOX0w9IigiLGUuUEFSRU5fUj0iKSIsZS5TUFJFQUQ9Ii4uLiIsZS5DT0xPTj0iOiIsZS5FUVVBTFM9Ij0iLGUuQVQ9IkAiLGUuQlJBQ0tFVF9MPSJbIixlLkJSQUNLRVRfUj0iXSIsZS5CUkFDRV9MPSJ7IixlLlBJUEU9InwiLGUuQlJBQ0VfUj0ifSIsZS5OQU1FPSJOYW1lIixlLklOVD0iSW50IixlLkZMT0FUPSJGbG9hdCIsZS5TVFJJTkc9IlN0cmluZyIsZS5CTE9DS19TVFJJTkc9IkJsb2NrU3RyaW5nIixlLkNPTU1FTlQ9IkNvbW1lbnQifSkobHx8KGw9e30pKTtjbGFzcyBTbntjb25zdHJ1Y3Rvcih0KXtjb25zdCBuPW5ldyBidChsLlNPRiwwLDAsMCwwKTt0aGlzLnNvdXJjZT10LHRoaXMubGFzdFRva2VuPW4sdGhpcy50b2tlbj1uLHRoaXMubGluZT0xLHRoaXMubGluZVN0YXJ0PTB9Z2V0W1N5bWJvbC50b1N0cmluZ1RhZ10oKXtyZXR1cm4iTGV4ZXIifWFkdmFuY2UoKXtyZXR1cm4gdGhpcy5sYXN0VG9rZW49dGhpcy50b2tlbix0aGlzLnRva2VuPXRoaXMubG9va2FoZWFkKCl9bG9va2FoZWFkKCl7bGV0IHQ9dGhpcy50b2tlbjtpZih0LmtpbmQhPT1sLkVPRilkbyBpZih0Lm5leHQpdD10Lm5leHQ7ZWxzZXtjb25zdCBuPURuKHRoaXMsdC5lbmQpO3QubmV4dD1uLG4ucHJldj10LHQ9bn13aGlsZSh0LmtpbmQ9PT1sLkNPTU1FTlQpO3JldHVybiB0fX1mdW5jdGlvbiB3bihlKXtyZXR1cm4gZT09PWwuQkFOR3x8ZT09PWwuRE9MTEFSfHxlPT09bC5BTVB8fGU9PT1sLlBBUkVOX0x8fGU9PT1sLlBBUkVOX1J8fGU9PT1sLlNQUkVBRHx8ZT09PWwuQ09MT058fGU9PT1sLkVRVUFMU3x8ZT09PWwuQVR8fGU9PT1sLkJSQUNLRVRfTHx8ZT09PWwuQlJBQ0tFVF9SfHxlPT09bC5CUkFDRV9MfHxlPT09bC5QSVBFfHxlPT09bC5CUkFDRV9SfWZ1bmN0aW9uIGZlKGUpe3JldHVybiBlPj0wJiZlPD01NTI5NXx8ZT49NTczNDQmJmU8PTExMTQxMTF9ZnVuY3Rpb24gd2UoZSx0KXtyZXR1cm4gT3QoZS5jaGFyQ29kZUF0KHQpKSYmU3QoZS5jaGFyQ29kZUF0KHQrMSkpfWZ1bmN0aW9uIE90KGUpe3JldHVybiBlPj01NTI5NiYmZTw9NTYzMTl9ZnVuY3Rpb24gU3QoZSl7cmV0dXJuIGU+PTU2MzIwJiZlPD01NzM0M31mdW5jdGlvbiBhZShlLHQpe2NvbnN0IG49ZS5zb3VyY2UuYm9keS5jb2RlUG9pbnRBdCh0KTtpZihuPT09dm9pZCAwKXJldHVybiBsLkVPRjtpZihuPj0zMiYmbjw9MTI2KXtjb25zdCBpPVN0cmluZy5mcm9tQ29kZVBvaW50KG4pO3JldHVybiBpPT09JyInP2AnIidgOmAiJHtpfSJgfXJldHVybiJVKyIrbi50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5wYWRTdGFydCg0LCIwIil9ZnVuY3Rpb24gVihlLHQsbixpLHIpe2NvbnN0IHM9ZS5saW5lLG89MStuLWUubGluZVN0YXJ0O3JldHVybiBuZXcgYnQodCxuLGkscyxvLHIpfWZ1bmN0aW9uIERuKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LGk9bi5sZW5ndGg7bGV0IHI9dDtmb3IoO3I8aTspe2NvbnN0IHM9bi5jaGFyQ29kZUF0KHIpO3N3aXRjaChzKXtjYXNlIDY1Mjc5OmNhc2UgOTpjYXNlIDMyOmNhc2UgNDQ6KytyO2NvbnRpbnVlO2Nhc2UgMTA6KytyLCsrZS5saW5lLGUubGluZVN0YXJ0PXI7Y29udGludWU7Y2FzZSAxMzpuLmNoYXJDb2RlQXQocisxKT09PTEwP3IrPTI6KytyLCsrZS5saW5lLGUubGluZVN0YXJ0PXI7Y29udGludWU7Y2FzZSAzNTpyZXR1cm4gQ24oZSxyKTtjYXNlIDMzOnJldHVybiBWKGUsbC5CQU5HLHIscisxKTtjYXNlIDM2OnJldHVybiBWKGUsbC5ET0xMQVIscixyKzEpO2Nhc2UgMzg6cmV0dXJuIFYoZSxsLkFNUCxyLHIrMSk7Y2FzZSA0MDpyZXR1cm4gVihlLGwuUEFSRU5fTCxyLHIrMSk7Y2FzZSA0MTpyZXR1cm4gVihlLGwuUEFSRU5fUixyLHIrMSk7Y2FzZSA0NjppZihuLmNoYXJDb2RlQXQocisxKT09PTQ2JiZuLmNoYXJDb2RlQXQocisyKT09PTQ2KXJldHVybiBWKGUsbC5TUFJFQUQscixyKzMpO2JyZWFrO2Nhc2UgNTg6cmV0dXJuIFYoZSxsLkNPTE9OLHIscisxKTtjYXNlIDYxOnJldHVybiBWKGUsbC5FUVVBTFMscixyKzEpO2Nhc2UgNjQ6cmV0dXJuIFYoZSxsLkFULHIscisxKTtjYXNlIDkxOnJldHVybiBWKGUsbC5CUkFDS0VUX0wscixyKzEpO2Nhc2UgOTM6cmV0dXJuIFYoZSxsLkJSQUNLRVRfUixyLHIrMSk7Y2FzZSAxMjM6cmV0dXJuIFYoZSxsLkJSQUNFX0wscixyKzEpO2Nhc2UgMTI0OnJldHVybiBWKGUsbC5QSVBFLHIscisxKTtjYXNlIDEyNTpyZXR1cm4gVihlLGwuQlJBQ0VfUixyLHIrMSk7Y2FzZSAzNDpyZXR1cm4gbi5jaGFyQ29kZUF0KHIrMSk9PT0zNCYmbi5jaGFyQ29kZUF0KHIrMik9PT0zND9CbihlLHIpOlJuKGUscil9aWYoTmUocyl8fHM9PT00NSlyZXR1cm4ga24oZSxyLHMpO2lmKEl0KHMpKXJldHVybiAkbihlLHIpO3Rocm93IEcoZS5zb3VyY2UscixzPT09Mzk/YFVuZXhwZWN0ZWQgc2luZ2xlIHF1b3RlIGNoYXJhY3RlciAoJyksIGRpZCB5b3UgbWVhbiB0byB1c2UgYSBkb3VibGUgcXVvdGUgKCIpP2A6ZmUocyl8fHdlKG4scik/YFVuZXhwZWN0ZWQgY2hhcmFjdGVyOiAke2FlKGUscil9LmA6YEludmFsaWQgY2hhcmFjdGVyOiAke2FlKGUscil9LmApfXJldHVybiBWKGUsbC5FT0YsaSxpKX1mdW5jdGlvbiBDbihlLHQpe2NvbnN0IG49ZS5zb3VyY2UuYm9keSxpPW4ubGVuZ3RoO2xldCByPXQrMTtmb3IoO3I8aTspe2NvbnN0IHM9bi5jaGFyQ29kZUF0KHIpO2lmKHM9PT0xMHx8cz09PTEzKWJyZWFrO2lmKGZlKHMpKSsrcjtlbHNlIGlmKHdlKG4scikpcis9MjtlbHNlIGJyZWFrfXJldHVybiBWKGUsbC5DT01NRU5ULHQscixuLnNsaWNlKHQrMSxyKSl9ZnVuY3Rpb24ga24oZSx0LG4pe2NvbnN0IGk9ZS5zb3VyY2UuYm9keTtsZXQgcj10LHM9bixvPSExO2lmKHM9PT00NSYmKHM9aS5jaGFyQ29kZUF0KCsrcikpLHM9PT00OCl7aWYocz1pLmNoYXJDb2RlQXQoKytyKSxOZShzKSl0aHJvdyBHKGUuc291cmNlLHIsYEludmFsaWQgbnVtYmVyLCB1bmV4cGVjdGVkIGRpZ2l0IGFmdGVyIDA6ICR7YWUoZSxyKX0uYCl9ZWxzZSByPVdlKGUscixzKSxzPWkuY2hhckNvZGVBdChyKTtpZihzPT09NDYmJihvPSEwLHM9aS5jaGFyQ29kZUF0KCsrcikscj1XZShlLHIscykscz1pLmNoYXJDb2RlQXQocikpLChzPT09Njl8fHM9PT0xMDEpJiYobz0hMCxzPWkuY2hhckNvZGVBdCgrK3IpLChzPT09NDN8fHM9PT00NSkmJihzPWkuY2hhckNvZGVBdCgrK3IpKSxyPVdlKGUscixzKSxzPWkuY2hhckNvZGVBdChyKSkscz09PTQ2fHxJdChzKSl0aHJvdyBHKGUuc291cmNlLHIsYEludmFsaWQgbnVtYmVyLCBleHBlY3RlZCBkaWdpdCBidXQgZ290OiAke2FlKGUscil9LmApO3JldHVybiBWKGUsbz9sLkZMT0FUOmwuSU5ULHQscixpLnNsaWNlKHQscikpfWZ1bmN0aW9uIFdlKGUsdCxuKXtpZighTmUobikpdGhyb3cgRyhlLnNvdXJjZSx0LGBJbnZhbGlkIG51bWJlciwgZXhwZWN0ZWQgZGlnaXQgYnV0IGdvdDogJHthZShlLHQpfS5gKTtjb25zdCBpPWUuc291cmNlLmJvZHk7bGV0IHI9dCsxO2Zvcig7TmUoaS5jaGFyQ29kZUF0KHIpKTspKytyO3JldHVybiByfWZ1bmN0aW9uIFJuKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LGk9bi5sZW5ndGg7bGV0IHI9dCsxLHM9cixvPSIiO2Zvcig7cjxpOyl7Y29uc3QgYz1uLmNoYXJDb2RlQXQocik7aWYoYz09PTM0KXJldHVybiBvKz1uLnNsaWNlKHMsciksVihlLGwuU1RSSU5HLHQscisxLG8pO2lmKGM9PT05Mil7bys9bi5zbGljZShzLHIpO2NvbnN0IGY9bi5jaGFyQ29kZUF0KHIrMSk9PT0xMTc/bi5jaGFyQ29kZUF0KHIrMik9PT0xMjM/TG4oZSxyKTpQbihlLHIpOkZuKGUscik7bys9Zi52YWx1ZSxyKz1mLnNpemUscz1yO2NvbnRpbnVlfWlmKGM9PT0xMHx8Yz09PTEzKWJyZWFrO2lmKGZlKGMpKSsrcjtlbHNlIGlmKHdlKG4scikpcis9MjtlbHNlIHRocm93IEcoZS5zb3VyY2UscixgSW52YWxpZCBjaGFyYWN0ZXIgd2l0aGluIFN0cmluZzogJHthZShlLHIpfS5gKX10aHJvdyBHKGUuc291cmNlLHIsIlVudGVybWluYXRlZCBzdHJpbmcuIil9ZnVuY3Rpb24gTG4oZSx0KXtjb25zdCBuPWUuc291cmNlLmJvZHk7bGV0IGk9MCxyPTM7Zm9yKDtyPDEyOyl7Y29uc3Qgcz1uLmNoYXJDb2RlQXQodCtyKyspO2lmKHM9PT0xMjUpe2lmKHI8NXx8IWZlKGkpKWJyZWFrO3JldHVybnt2YWx1ZTpTdHJpbmcuZnJvbUNvZGVQb2ludChpKSxzaXplOnJ9fWlmKGk9aTw8NHx4ZShzKSxpPDApYnJlYWt9dGhyb3cgRyhlLnNvdXJjZSx0LGBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlOiAiJHtuLnNsaWNlKHQsdCtyKX0iLmApfWZ1bmN0aW9uIFBuKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LGk9d3Qobix0KzIpO2lmKGZlKGkpKXJldHVybnt2YWx1ZTpTdHJpbmcuZnJvbUNvZGVQb2ludChpKSxzaXplOjZ9O2lmKE90KGkpJiZuLmNoYXJDb2RlQXQodCs2KT09PTkyJiZuLmNoYXJDb2RlQXQodCs3KT09PTExNyl7Y29uc3Qgcj13dChuLHQrOCk7aWYoU3QocikpcmV0dXJue3ZhbHVlOlN0cmluZy5mcm9tQ29kZVBvaW50KGksciksc2l6ZToxMn19dGhyb3cgRyhlLnNvdXJjZSx0LGBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlOiAiJHtuLnNsaWNlKHQsdCs2KX0iLmApfWZ1bmN0aW9uIHd0KGUsdCl7cmV0dXJuIHhlKGUuY2hhckNvZGVBdCh0KSk8PDEyfHhlKGUuY2hhckNvZGVBdCh0KzEpKTw8OHx4ZShlLmNoYXJDb2RlQXQodCsyKSk8PDR8eGUoZS5jaGFyQ29kZUF0KHQrMykpfWZ1bmN0aW9uIHhlKGUpe3JldHVybiBlPj00OCYmZTw9NTc/ZS00ODplPj02NSYmZTw9NzA/ZS01NTplPj05NyYmZTw9MTAyP2UtODc6LTF9ZnVuY3Rpb24gRm4oZSx0KXtjb25zdCBuPWUuc291cmNlLmJvZHk7c3dpdGNoKG4uY2hhckNvZGVBdCh0KzEpKXtjYXNlIDM0OnJldHVybnt2YWx1ZTonIicsc2l6ZToyfTtjYXNlIDkyOnJldHVybnt2YWx1ZToiXFwiLHNpemU6Mn07Y2FzZSA0NzpyZXR1cm57dmFsdWU6Ii8iLHNpemU6Mn07Y2FzZSA5ODpyZXR1cm57dmFsdWU6IlxiIixzaXplOjJ9O2Nhc2UgMTAyOnJldHVybnt2YWx1ZToiXGYiLHNpemU6Mn07Y2FzZSAxMTA6cmV0dXJue3ZhbHVlOmAKYCxzaXplOjJ9O2Nhc2UgMTE0OnJldHVybnt2YWx1ZToiXHIiLHNpemU6Mn07Y2FzZSAxMTY6cmV0dXJue3ZhbHVlOiIJIixzaXplOjJ9fXRocm93IEcoZS5zb3VyY2UsdCxgSW52YWxpZCBjaGFyYWN0ZXIgZXNjYXBlIHNlcXVlbmNlOiAiJHtuLnNsaWNlKHQsdCsyKX0iLmApfWZ1bmN0aW9uIEJuKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LGk9bi5sZW5ndGg7bGV0IHI9ZS5saW5lU3RhcnQscz10KzMsbz1zLGM9IiI7Y29uc3QgZj1bXTtmb3IoO3M8aTspe2NvbnN0IGQ9bi5jaGFyQ29kZUF0KHMpO2lmKGQ9PT0zNCYmbi5jaGFyQ29kZUF0KHMrMSk9PT0zNCYmbi5jaGFyQ29kZUF0KHMrMik9PT0zNCl7Yys9bi5zbGljZShvLHMpLGYucHVzaChjKTtjb25zdCB1PVYoZSxsLkJMT0NLX1NUUklORyx0LHMrMyxBbihmKS5qb2luKGAKYCkpO3JldHVybiBlLmxpbmUrPWYubGVuZ3RoLTEsZS5saW5lU3RhcnQ9cix1fWlmKGQ9PT05MiYmbi5jaGFyQ29kZUF0KHMrMSk9PT0zNCYmbi5jaGFyQ29kZUF0KHMrMik9PT0zNCYmbi5jaGFyQ29kZUF0KHMrMyk9PT0zNCl7Yys9bi5zbGljZShvLHMpLG89cysxLHMrPTQ7Y29udGludWV9aWYoZD09PTEwfHxkPT09MTMpe2MrPW4uc2xpY2UobyxzKSxmLnB1c2goYyksZD09PTEzJiZuLmNoYXJDb2RlQXQocysxKT09PTEwP3MrPTI6KytzLGM9IiIsbz1zLHI9cztjb250aW51ZX1pZihmZShkKSkrK3M7ZWxzZSBpZih3ZShuLHMpKXMrPTI7ZWxzZSB0aHJvdyBHKGUuc291cmNlLHMsYEludmFsaWQgY2hhcmFjdGVyIHdpdGhpbiBTdHJpbmc6ICR7YWUoZSxzKX0uYCl9dGhyb3cgRyhlLnNvdXJjZSxzLCJVbnRlcm1pbmF0ZWQgc3RyaW5nLiIpfWZ1bmN0aW9uICRuKGUsdCl7Y29uc3Qgbj1lLnNvdXJjZS5ib2R5LGk9bi5sZW5ndGg7bGV0IHI9dCsxO2Zvcig7cjxpOyl7Y29uc3Qgcz1uLmNoYXJDb2RlQXQocik7aWYoeG4ocykpKytyO2Vsc2UgYnJlYWt9cmV0dXJuIFYoZSxsLk5BTUUsdCxyLG4uc2xpY2UodCxyKSl9Y29uc3QgTW49MTAsRHQ9MjtmdW5jdGlvbiBaZShlKXtyZXR1cm4gRGUoZSxbXSl9ZnVuY3Rpb24gRGUoZSx0KXtzd2l0Y2godHlwZW9mIGUpe2Nhc2Uic3RyaW5nIjpyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZSk7Y2FzZSJmdW5jdGlvbiI6cmV0dXJuIGUubmFtZT9gW2Z1bmN0aW9uICR7ZS5uYW1lfV1gOiJbZnVuY3Rpb25dIjtjYXNlIm9iamVjdCI6cmV0dXJuIFVuKGUsdCk7ZGVmYXVsdDpyZXR1cm4gU3RyaW5nKGUpfX1mdW5jdGlvbiBVbihlLHQpe2lmKGU9PT1udWxsKXJldHVybiJudWxsIjtpZih0LmluY2x1ZGVzKGUpKXJldHVybiJbQ2lyY3VsYXJdIjtjb25zdCBuPVsuLi50LGVdO2lmKFZuKGUpKXtjb25zdCBpPWUudG9KU09OKCk7aWYoaSE9PWUpcmV0dXJuIHR5cGVvZiBpPT0ic3RyaW5nIj9pOkRlKGksbil9ZWxzZSBpZihBcnJheS5pc0FycmF5KGUpKXJldHVybiBxbihlLG4pO3JldHVybiBqbihlLG4pfWZ1bmN0aW9uIFZuKGUpe3JldHVybiB0eXBlb2YgZS50b0pTT049PSJmdW5jdGlvbiJ9ZnVuY3Rpb24gam4oZSx0KXtjb25zdCBuPU9iamVjdC5lbnRyaWVzKGUpO3JldHVybiBuLmxlbmd0aD09PTA/Int9Ijp0Lmxlbmd0aD5EdD8iWyIrR24oZSkrIl0iOiJ7ICIrbi5tYXAoKFtyLHNdKT0+cisiOiAiK0RlKHMsdCkpLmpvaW4oIiwgIikrIiB9In1mdW5jdGlvbiBxbihlLHQpe2lmKGUubGVuZ3RoPT09MClyZXR1cm4iW10iO2lmKHQubGVuZ3RoPkR0KXJldHVybiJbQXJyYXldIjtjb25zdCBuPU1hdGgubWluKE1uLGUubGVuZ3RoKSxpPWUubGVuZ3RoLW4scj1bXTtmb3IobGV0IHM9MDtzPG47KytzKXIucHVzaChEZShlW3NdLHQpKTtyZXR1cm4gaT09PTE/ci5wdXNoKCIuLi4gMSBtb3JlIGl0ZW0iKTppPjEmJnIucHVzaChgLi4uICR7aX0gbW9yZSBpdGVtc2ApLCJbIityLmpvaW4oIiwgIikrIl0ifWZ1bmN0aW9uIEduKGUpe2NvbnN0IHQ9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpLnJlcGxhY2UoL15cW29iamVjdCAvLCIiKS5yZXBsYWNlKC9dJC8sIiIpO2lmKHQ9PT0iT2JqZWN0IiYmdHlwZW9mIGUuY29uc3RydWN0b3I9PSJmdW5jdGlvbiIpe2NvbnN0IG49ZS5jb25zdHJ1Y3Rvci5uYW1lO2lmKHR5cGVvZiBuPT0ic3RyaW5nIiYmbiE9PSIiKXJldHVybiBufXJldHVybiB0fWNvbnN0IEhuPWdsb2JhbFRoaXMucHJvY2VzcyYmZ2xvYmFsVGhpcy5wcm9jZXNzLmVudi5OT0RFX0VOVj09PSJwcm9kdWN0aW9uIj9mdW5jdGlvbih0LG4pe3JldHVybiB0IGluc3RhbmNlb2Ygbn06ZnVuY3Rpb24odCxuKXtpZih0IGluc3RhbmNlb2YgbilyZXR1cm4hMDtpZih0eXBlb2YgdD09Im9iamVjdCImJnQhPT1udWxsKXt2YXIgaTtjb25zdCByPW4ucHJvdG90eXBlW1N5bWJvbC50b1N0cmluZ1RhZ10scz1TeW1ib2wudG9TdHJpbmdUYWcgaW4gdD90W1N5bWJvbC50b1N0cmluZ1RhZ106KGk9dC5jb25zdHJ1Y3Rvcik9PT1udWxsfHxpPT09dm9pZCAwP3ZvaWQgMDppLm5hbWU7aWYocj09PXMpe2NvbnN0IG89WmUodCk7dGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgdXNlICR7cn0gIiR7b30iIGZyb20gYW5vdGhlciBtb2R1bGUgb3IgcmVhbG0uCgpFbnN1cmUgdGhhdCB0aGVyZSBpcyBvbmx5IG9uZSBpbnN0YW5jZSBvZiAiZ3JhcGhxbCIgaW4gdGhlIG5vZGVfbW9kdWxlcwpkaXJlY3RvcnkuIElmIGRpZmZlcmVudCB2ZXJzaW9ucyBvZiAiZ3JhcGhxbCIgYXJlIHRoZSBkZXBlbmRlbmNpZXMgb2Ygb3RoZXIKcmVsaWVkIG9uIG1vZHVsZXMsIHVzZSAicmVzb2x1dGlvbnMiIHRvIGVuc3VyZSBvbmx5IG9uZSB2ZXJzaW9uIGlzIGluc3RhbGxlZC4KCmh0dHBzOi8veWFybnBrZy5jb20vZW4vZG9jcy9zZWxlY3RpdmUtdmVyc2lvbi1yZXNvbHV0aW9ucwoKRHVwbGljYXRlICJncmFwaHFsIiBtb2R1bGVzIGNhbm5vdCBiZSB1c2VkIGF0IHRoZSBzYW1lIHRpbWUgc2luY2UgZGlmZmVyZW50CnZlcnNpb25zIG1heSBoYXZlIGRpZmZlcmVudCBjYXBhYmlsaXRpZXMgYW5kIGJlaGF2aW9yLiBUaGUgZGF0YSBmcm9tIG9uZQp2ZXJzaW9uIHVzZWQgaW4gdGhlIGZ1bmN0aW9uIGZyb20gYW5vdGhlciBjb3VsZCBwcm9kdWNlIGNvbmZ1c2luZyBhbmQKc3B1cmlvdXMgcmVzdWx0cy5gKX19cmV0dXJuITF9O2NsYXNzIEN0e2NvbnN0cnVjdG9yKHQsbj0iR3JhcGhRTCByZXF1ZXN0IixpPXtsaW5lOjEsY29sdW1uOjF9KXt0eXBlb2YgdD09InN0cmluZyJ8fFNlKCExLGBCb2R5IG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkOiAke1plKHQpfS5gKSx0aGlzLmJvZHk9dCx0aGlzLm5hbWU9bix0aGlzLmxvY2F0aW9uT2Zmc2V0PWksdGhpcy5sb2NhdGlvbk9mZnNldC5saW5lPjB8fFNlKCExLCJsaW5lIGluIGxvY2F0aW9uT2Zmc2V0IGlzIDEtaW5kZXhlZCBhbmQgbXVzdCBiZSBwb3NpdGl2ZS4iKSx0aGlzLmxvY2F0aW9uT2Zmc2V0LmNvbHVtbj4wfHxTZSghMSwiY29sdW1uIGluIGxvY2F0aW9uT2Zmc2V0IGlzIDEtaW5kZXhlZCBhbmQgbXVzdCBiZSBwb3NpdGl2ZS4iKX1nZXRbU3ltYm9sLnRvU3RyaW5nVGFnXSgpe3JldHVybiJTb3VyY2UifX1mdW5jdGlvbiB6bihlKXtyZXR1cm4gSG4oZSxDdCl9ZnVuY3Rpb24ga3QoZSx0KXtyZXR1cm4gbmV3IFluKGUsdCkucGFyc2VEb2N1bWVudCgpfWNsYXNzIFlue2NvbnN0cnVjdG9yKHQsbj17fSl7Y29uc3QgaT16bih0KT90Om5ldyBDdCh0KTt0aGlzLl9sZXhlcj1uZXcgU24oaSksdGhpcy5fb3B0aW9ucz1uLHRoaXMuX3Rva2VuQ291bnRlcj0wfXBhcnNlTmFtZSgpe2NvbnN0IHQ9dGhpcy5leHBlY3RUb2tlbihsLk5BTUUpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULk5BTUUsdmFsdWU6dC52YWx1ZX0pfXBhcnNlRG9jdW1lbnQoKXtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOlQuRE9DVU1FTlQsZGVmaW5pdGlvbnM6dGhpcy5tYW55KGwuU09GLHRoaXMucGFyc2VEZWZpbml0aW9uLGwuRU9GKX0pfXBhcnNlRGVmaW5pdGlvbigpe2lmKHRoaXMucGVlayhsLkJSQUNFX0wpKXJldHVybiB0aGlzLnBhcnNlT3BlcmF0aW9uRGVmaW5pdGlvbigpO2NvbnN0IHQ9dGhpcy5wZWVrRGVzY3JpcHRpb24oKSxuPXQ/dGhpcy5fbGV4ZXIubG9va2FoZWFkKCk6dGhpcy5fbGV4ZXIudG9rZW47aWYobi5raW5kPT09bC5OQU1FKXtzd2l0Y2gobi52YWx1ZSl7Y2FzZSJzY2hlbWEiOnJldHVybiB0aGlzLnBhcnNlU2NoZW1hRGVmaW5pdGlvbigpO2Nhc2Uic2NhbGFyIjpyZXR1cm4gdGhpcy5wYXJzZVNjYWxhclR5cGVEZWZpbml0aW9uKCk7Y2FzZSJ0eXBlIjpyZXR1cm4gdGhpcy5wYXJzZU9iamVjdFR5cGVEZWZpbml0aW9uKCk7Y2FzZSJpbnRlcmZhY2UiOnJldHVybiB0aGlzLnBhcnNlSW50ZXJmYWNlVHlwZURlZmluaXRpb24oKTtjYXNlInVuaW9uIjpyZXR1cm4gdGhpcy5wYXJzZVVuaW9uVHlwZURlZmluaXRpb24oKTtjYXNlImVudW0iOnJldHVybiB0aGlzLnBhcnNlRW51bVR5cGVEZWZpbml0aW9uKCk7Y2FzZSJpbnB1dCI6cmV0dXJuIHRoaXMucGFyc2VJbnB1dE9iamVjdFR5cGVEZWZpbml0aW9uKCk7Y2FzZSJkaXJlY3RpdmUiOnJldHVybiB0aGlzLnBhcnNlRGlyZWN0aXZlRGVmaW5pdGlvbigpfWlmKHQpdGhyb3cgRyh0aGlzLl9sZXhlci5zb3VyY2UsdGhpcy5fbGV4ZXIudG9rZW4uc3RhcnQsIlVuZXhwZWN0ZWQgZGVzY3JpcHRpb24sIGRlc2NyaXB0aW9ucyBhcmUgc3VwcG9ydGVkIG9ubHkgb24gdHlwZSBkZWZpbml0aW9ucy4iKTtzd2l0Y2gobi52YWx1ZSl7Y2FzZSJxdWVyeSI6Y2FzZSJtdXRhdGlvbiI6Y2FzZSJzdWJzY3JpcHRpb24iOnJldHVybiB0aGlzLnBhcnNlT3BlcmF0aW9uRGVmaW5pdGlvbigpO2Nhc2UiZnJhZ21lbnQiOnJldHVybiB0aGlzLnBhcnNlRnJhZ21lbnREZWZpbml0aW9uKCk7Y2FzZSJleHRlbmQiOnJldHVybiB0aGlzLnBhcnNlVHlwZVN5c3RlbUV4dGVuc2lvbigpfX10aHJvdyB0aGlzLnVuZXhwZWN0ZWQobil9cGFyc2VPcGVyYXRpb25EZWZpbml0aW9uKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbjtpZih0aGlzLnBlZWsobC5CUkFDRV9MKSlyZXR1cm4gdGhpcy5ub2RlKHQse2tpbmQ6VC5PUEVSQVRJT05fREVGSU5JVElPTixvcGVyYXRpb246bGUuUVVFUlksbmFtZTp2b2lkIDAsdmFyaWFibGVEZWZpbml0aW9uczpbXSxkaXJlY3RpdmVzOltdLHNlbGVjdGlvblNldDp0aGlzLnBhcnNlU2VsZWN0aW9uU2V0KCl9KTtjb25zdCBuPXRoaXMucGFyc2VPcGVyYXRpb25UeXBlKCk7bGV0IGk7cmV0dXJuIHRoaXMucGVlayhsLk5BTUUpJiYoaT10aGlzLnBhcnNlTmFtZSgpKSx0aGlzLm5vZGUodCx7a2luZDpULk9QRVJBVElPTl9ERUZJTklUSU9OLG9wZXJhdGlvbjpuLG5hbWU6aSx2YXJpYWJsZURlZmluaXRpb25zOnRoaXMucGFyc2VWYXJpYWJsZURlZmluaXRpb25zKCksZGlyZWN0aXZlczp0aGlzLnBhcnNlRGlyZWN0aXZlcyghMSksc2VsZWN0aW9uU2V0OnRoaXMucGFyc2VTZWxlY3Rpb25TZXQoKX0pfXBhcnNlT3BlcmF0aW9uVHlwZSgpe2NvbnN0IHQ9dGhpcy5leHBlY3RUb2tlbihsLk5BTUUpO3N3aXRjaCh0LnZhbHVlKXtjYXNlInF1ZXJ5IjpyZXR1cm4gbGUuUVVFUlk7Y2FzZSJtdXRhdGlvbiI6cmV0dXJuIGxlLk1VVEFUSU9OO2Nhc2Uic3Vic2NyaXB0aW9uIjpyZXR1cm4gbGUuU1VCU0NSSVBUSU9OfXRocm93IHRoaXMudW5leHBlY3RlZCh0KX1wYXJzZVZhcmlhYmxlRGVmaW5pdGlvbnMoKXtyZXR1cm4gdGhpcy5vcHRpb25hbE1hbnkobC5QQVJFTl9MLHRoaXMucGFyc2VWYXJpYWJsZURlZmluaXRpb24sbC5QQVJFTl9SKX1wYXJzZVZhcmlhYmxlRGVmaW5pdGlvbigpe3JldHVybiB0aGlzLm5vZGUodGhpcy5fbGV4ZXIudG9rZW4se2tpbmQ6VC5WQVJJQUJMRV9ERUZJTklUSU9OLHZhcmlhYmxlOnRoaXMucGFyc2VWYXJpYWJsZSgpLHR5cGU6KHRoaXMuZXhwZWN0VG9rZW4obC5DT0xPTiksdGhpcy5wYXJzZVR5cGVSZWZlcmVuY2UoKSksZGVmYXVsdFZhbHVlOnRoaXMuZXhwZWN0T3B0aW9uYWxUb2tlbihsLkVRVUFMUyk/dGhpcy5wYXJzZUNvbnN0VmFsdWVMaXRlcmFsKCk6dm9pZCAwLGRpcmVjdGl2ZXM6dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpfSl9cGFyc2VWYXJpYWJsZSgpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47cmV0dXJuIHRoaXMuZXhwZWN0VG9rZW4obC5ET0xMQVIpLHRoaXMubm9kZSh0LHtraW5kOlQuVkFSSUFCTEUsbmFtZTp0aGlzLnBhcnNlTmFtZSgpfSl9cGFyc2VTZWxlY3Rpb25TZXQoKXtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOlQuU0VMRUNUSU9OX1NFVCxzZWxlY3Rpb25zOnRoaXMubWFueShsLkJSQUNFX0wsdGhpcy5wYXJzZVNlbGVjdGlvbixsLkJSQUNFX1IpfSl9cGFyc2VTZWxlY3Rpb24oKXtyZXR1cm4gdGhpcy5wZWVrKGwuU1BSRUFEKT90aGlzLnBhcnNlRnJhZ21lbnQoKTp0aGlzLnBhcnNlRmllbGQoKX1wYXJzZUZpZWxkKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbixuPXRoaXMucGFyc2VOYW1lKCk7bGV0IGkscjtyZXR1cm4gdGhpcy5leHBlY3RPcHRpb25hbFRva2VuKGwuQ09MT04pPyhpPW4scj10aGlzLnBhcnNlTmFtZSgpKTpyPW4sdGhpcy5ub2RlKHQse2tpbmQ6VC5GSUVMRCxhbGlhczppLG5hbWU6cixhcmd1bWVudHM6dGhpcy5wYXJzZUFyZ3VtZW50cyghMSksZGlyZWN0aXZlczp0aGlzLnBhcnNlRGlyZWN0aXZlcyghMSksc2VsZWN0aW9uU2V0OnRoaXMucGVlayhsLkJSQUNFX0wpP3RoaXMucGFyc2VTZWxlY3Rpb25TZXQoKTp2b2lkIDB9KX1wYXJzZUFyZ3VtZW50cyh0KXtjb25zdCBuPXQ/dGhpcy5wYXJzZUNvbnN0QXJndW1lbnQ6dGhpcy5wYXJzZUFyZ3VtZW50O3JldHVybiB0aGlzLm9wdGlvbmFsTWFueShsLlBBUkVOX0wsbixsLlBBUkVOX1IpfXBhcnNlQXJndW1lbnQodD0hMSl7Y29uc3Qgbj10aGlzLl9sZXhlci50b2tlbixpPXRoaXMucGFyc2VOYW1lKCk7cmV0dXJuIHRoaXMuZXhwZWN0VG9rZW4obC5DT0xPTiksdGhpcy5ub2RlKG4se2tpbmQ6VC5BUkdVTUVOVCxuYW1lOmksdmFsdWU6dGhpcy5wYXJzZVZhbHVlTGl0ZXJhbCh0KX0pfXBhcnNlQ29uc3RBcmd1bWVudCgpe3JldHVybiB0aGlzLnBhcnNlQXJndW1lbnQoITApfXBhcnNlRnJhZ21lbnQoKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0VG9rZW4obC5TUFJFQUQpO2NvbnN0IG49dGhpcy5leHBlY3RPcHRpb25hbEtleXdvcmQoIm9uIik7cmV0dXJuIW4mJnRoaXMucGVlayhsLk5BTUUpP3RoaXMubm9kZSh0LHtraW5kOlQuRlJBR01FTlRfU1BSRUFELG5hbWU6dGhpcy5wYXJzZUZyYWdtZW50TmFtZSgpLGRpcmVjdGl2ZXM6dGhpcy5wYXJzZURpcmVjdGl2ZXMoITEpfSk6dGhpcy5ub2RlKHQse2tpbmQ6VC5JTkxJTkVfRlJBR01FTlQsdHlwZUNvbmRpdGlvbjpuP3RoaXMucGFyc2VOYW1lZFR5cGUoKTp2b2lkIDAsZGlyZWN0aXZlczp0aGlzLnBhcnNlRGlyZWN0aXZlcyghMSksc2VsZWN0aW9uU2V0OnRoaXMucGFyc2VTZWxlY3Rpb25TZXQoKX0pfXBhcnNlRnJhZ21lbnREZWZpbml0aW9uKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbjtyZXR1cm4gdGhpcy5leHBlY3RLZXl3b3JkKCJmcmFnbWVudCIpLHRoaXMuX29wdGlvbnMuYWxsb3dMZWdhY3lGcmFnbWVudFZhcmlhYmxlcz09PSEwP3RoaXMubm9kZSh0LHtraW5kOlQuRlJBR01FTlRfREVGSU5JVElPTixuYW1lOnRoaXMucGFyc2VGcmFnbWVudE5hbWUoKSx2YXJpYWJsZURlZmluaXRpb25zOnRoaXMucGFyc2VWYXJpYWJsZURlZmluaXRpb25zKCksdHlwZUNvbmRpdGlvbjoodGhpcy5leHBlY3RLZXl3b3JkKCJvbiIpLHRoaXMucGFyc2VOYW1lZFR5cGUoKSksZGlyZWN0aXZlczp0aGlzLnBhcnNlRGlyZWN0aXZlcyghMSksc2VsZWN0aW9uU2V0OnRoaXMucGFyc2VTZWxlY3Rpb25TZXQoKX0pOnRoaXMubm9kZSh0LHtraW5kOlQuRlJBR01FTlRfREVGSU5JVElPTixuYW1lOnRoaXMucGFyc2VGcmFnbWVudE5hbWUoKSx0eXBlQ29uZGl0aW9uOih0aGlzLmV4cGVjdEtleXdvcmQoIm9uIiksdGhpcy5wYXJzZU5hbWVkVHlwZSgpKSxkaXJlY3RpdmVzOnRoaXMucGFyc2VEaXJlY3RpdmVzKCExKSxzZWxlY3Rpb25TZXQ6dGhpcy5wYXJzZVNlbGVjdGlvblNldCgpfSl9cGFyc2VGcmFnbWVudE5hbWUoKXtpZih0aGlzLl9sZXhlci50b2tlbi52YWx1ZT09PSJvbiIpdGhyb3cgdGhpcy51bmV4cGVjdGVkKCk7cmV0dXJuIHRoaXMucGFyc2VOYW1lKCl9cGFyc2VWYWx1ZUxpdGVyYWwodCl7Y29uc3Qgbj10aGlzLl9sZXhlci50b2tlbjtzd2l0Y2gobi5raW5kKXtjYXNlIGwuQlJBQ0tFVF9MOnJldHVybiB0aGlzLnBhcnNlTGlzdCh0KTtjYXNlIGwuQlJBQ0VfTDpyZXR1cm4gdGhpcy5wYXJzZU9iamVjdCh0KTtjYXNlIGwuSU5UOnJldHVybiB0aGlzLmFkdmFuY2VMZXhlcigpLHRoaXMubm9kZShuLHtraW5kOlQuSU5ULHZhbHVlOm4udmFsdWV9KTtjYXNlIGwuRkxPQVQ6cmV0dXJuIHRoaXMuYWR2YW5jZUxleGVyKCksdGhpcy5ub2RlKG4se2tpbmQ6VC5GTE9BVCx2YWx1ZTpuLnZhbHVlfSk7Y2FzZSBsLlNUUklORzpjYXNlIGwuQkxPQ0tfU1RSSU5HOnJldHVybiB0aGlzLnBhcnNlU3RyaW5nTGl0ZXJhbCgpO2Nhc2UgbC5OQU1FOnN3aXRjaCh0aGlzLmFkdmFuY2VMZXhlcigpLG4udmFsdWUpe2Nhc2UidHJ1ZSI6cmV0dXJuIHRoaXMubm9kZShuLHtraW5kOlQuQk9PTEVBTix2YWx1ZTohMH0pO2Nhc2UiZmFsc2UiOnJldHVybiB0aGlzLm5vZGUobix7a2luZDpULkJPT0xFQU4sdmFsdWU6ITF9KTtjYXNlIm51bGwiOnJldHVybiB0aGlzLm5vZGUobix7a2luZDpULk5VTEx9KTtkZWZhdWx0OnJldHVybiB0aGlzLm5vZGUobix7a2luZDpULkVOVU0sdmFsdWU6bi52YWx1ZX0pfWNhc2UgbC5ET0xMQVI6aWYodClpZih0aGlzLmV4cGVjdFRva2VuKGwuRE9MTEFSKSx0aGlzLl9sZXhlci50b2tlbi5raW5kPT09bC5OQU1FKXtjb25zdCBpPXRoaXMuX2xleGVyLnRva2VuLnZhbHVlO3Rocm93IEcodGhpcy5fbGV4ZXIuc291cmNlLG4uc3RhcnQsYFVuZXhwZWN0ZWQgdmFyaWFibGUgIiQke2l9IiBpbiBjb25zdGFudCB2YWx1ZS5gKX1lbHNlIHRocm93IHRoaXMudW5leHBlY3RlZChuKTtyZXR1cm4gdGhpcy5wYXJzZVZhcmlhYmxlKCk7ZGVmYXVsdDp0aHJvdyB0aGlzLnVuZXhwZWN0ZWQoKX19cGFyc2VDb25zdFZhbHVlTGl0ZXJhbCgpe3JldHVybiB0aGlzLnBhcnNlVmFsdWVMaXRlcmFsKCEwKX1wYXJzZVN0cmluZ0xpdGVyYWwoKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3JldHVybiB0aGlzLmFkdmFuY2VMZXhlcigpLHRoaXMubm9kZSh0LHtraW5kOlQuU1RSSU5HLHZhbHVlOnQudmFsdWUsYmxvY2s6dC5raW5kPT09bC5CTE9DS19TVFJJTkd9KX1wYXJzZUxpc3QodCl7Y29uc3Qgbj0oKT0+dGhpcy5wYXJzZVZhbHVlTGl0ZXJhbCh0KTtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOlQuTElTVCx2YWx1ZXM6dGhpcy5hbnkobC5CUkFDS0VUX0wsbixsLkJSQUNLRVRfUil9KX1wYXJzZU9iamVjdCh0KXtjb25zdCBuPSgpPT50aGlzLnBhcnNlT2JqZWN0RmllbGQodCk7cmV0dXJuIHRoaXMubm9kZSh0aGlzLl9sZXhlci50b2tlbix7a2luZDpULk9CSkVDVCxmaWVsZHM6dGhpcy5hbnkobC5CUkFDRV9MLG4sbC5CUkFDRV9SKX0pfXBhcnNlT2JqZWN0RmllbGQodCl7Y29uc3Qgbj10aGlzLl9sZXhlci50b2tlbixpPXRoaXMucGFyc2VOYW1lKCk7cmV0dXJuIHRoaXMuZXhwZWN0VG9rZW4obC5DT0xPTiksdGhpcy5ub2RlKG4se2tpbmQ6VC5PQkpFQ1RfRklFTEQsbmFtZTppLHZhbHVlOnRoaXMucGFyc2VWYWx1ZUxpdGVyYWwodCl9KX1wYXJzZURpcmVjdGl2ZXModCl7Y29uc3Qgbj1bXTtmb3IoO3RoaXMucGVlayhsLkFUKTspbi5wdXNoKHRoaXMucGFyc2VEaXJlY3RpdmUodCkpO3JldHVybiBufXBhcnNlQ29uc3REaXJlY3RpdmVzKCl7cmV0dXJuIHRoaXMucGFyc2VEaXJlY3RpdmVzKCEwKX1wYXJzZURpcmVjdGl2ZSh0KXtjb25zdCBuPXRoaXMuX2xleGVyLnRva2VuO3JldHVybiB0aGlzLmV4cGVjdFRva2VuKGwuQVQpLHRoaXMubm9kZShuLHtraW5kOlQuRElSRUNUSVZFLG5hbWU6dGhpcy5wYXJzZU5hbWUoKSxhcmd1bWVudHM6dGhpcy5wYXJzZUFyZ3VtZW50cyh0KX0pfXBhcnNlVHlwZVJlZmVyZW5jZSgpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47bGV0IG47aWYodGhpcy5leHBlY3RPcHRpb25hbFRva2VuKGwuQlJBQ0tFVF9MKSl7Y29uc3QgaT10aGlzLnBhcnNlVHlwZVJlZmVyZW5jZSgpO3RoaXMuZXhwZWN0VG9rZW4obC5CUkFDS0VUX1IpLG49dGhpcy5ub2RlKHQse2tpbmQ6VC5MSVNUX1RZUEUsdHlwZTppfSl9ZWxzZSBuPXRoaXMucGFyc2VOYW1lZFR5cGUoKTtyZXR1cm4gdGhpcy5leHBlY3RPcHRpb25hbFRva2VuKGwuQkFORyk/dGhpcy5ub2RlKHQse2tpbmQ6VC5OT05fTlVMTF9UWVBFLHR5cGU6bn0pOm59cGFyc2VOYW1lZFR5cGUoKXtyZXR1cm4gdGhpcy5ub2RlKHRoaXMuX2xleGVyLnRva2VuLHtraW5kOlQuTkFNRURfVFlQRSxuYW1lOnRoaXMucGFyc2VOYW1lKCl9KX1wZWVrRGVzY3JpcHRpb24oKXtyZXR1cm4gdGhpcy5wZWVrKGwuU1RSSU5HKXx8dGhpcy5wZWVrKGwuQkxPQ0tfU1RSSU5HKX1wYXJzZURlc2NyaXB0aW9uKCl7aWYodGhpcy5wZWVrRGVzY3JpcHRpb24oKSlyZXR1cm4gdGhpcy5wYXJzZVN0cmluZ0xpdGVyYWwoKX1wYXJzZVNjaGVtYURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJzY2hlbWEiKTtjb25zdCBpPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxyPXRoaXMubWFueShsLkJSQUNFX0wsdGhpcy5wYXJzZU9wZXJhdGlvblR5cGVEZWZpbml0aW9uLGwuQlJBQ0VfUik7cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOlQuU0NIRU1BX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixkaXJlY3RpdmVzOmksb3BlcmF0aW9uVHlwZXM6cn0pfXBhcnNlT3BlcmF0aW9uVHlwZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZU9wZXJhdGlvblR5cGUoKTt0aGlzLmV4cGVjdFRva2VuKGwuQ09MT04pO2NvbnN0IGk9dGhpcy5wYXJzZU5hbWVkVHlwZSgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULk9QRVJBVElPTl9UWVBFX0RFRklOSVRJT04sb3BlcmF0aW9uOm4sdHlwZTppfSl9cGFyc2VTY2FsYXJUeXBlRGVmaW5pdGlvbigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW4sbj10aGlzLnBhcnNlRGVzY3JpcHRpb24oKTt0aGlzLmV4cGVjdEtleXdvcmQoInNjYWxhciIpO2NvbnN0IGk9dGhpcy5wYXJzZU5hbWUoKSxyPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKTtyZXR1cm4gdGhpcy5ub2RlKHQse2tpbmQ6VC5TQ0FMQVJfVFlQRV9ERUZJTklUSU9OLGRlc2NyaXB0aW9uOm4sbmFtZTppLGRpcmVjdGl2ZXM6cn0pfXBhcnNlT2JqZWN0VHlwZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJ0eXBlIik7Y29uc3QgaT10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUltcGxlbWVudHNJbnRlcmZhY2VzKCkscz10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCksbz10aGlzLnBhcnNlRmllbGRzRGVmaW5pdGlvbigpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULk9CSkVDVF9UWVBFX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixuYW1lOmksaW50ZXJmYWNlczpyLGRpcmVjdGl2ZXM6cyxmaWVsZHM6b30pfXBhcnNlSW1wbGVtZW50c0ludGVyZmFjZXMoKXtyZXR1cm4gdGhpcy5leHBlY3RPcHRpb25hbEtleXdvcmQoImltcGxlbWVudHMiKT90aGlzLmRlbGltaXRlZE1hbnkobC5BTVAsdGhpcy5wYXJzZU5hbWVkVHlwZSk6W119cGFyc2VGaWVsZHNEZWZpbml0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KGwuQlJBQ0VfTCx0aGlzLnBhcnNlRmllbGREZWZpbml0aW9uLGwuQlJBQ0VfUil9cGFyc2VGaWVsZERlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCksaT10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUFyZ3VtZW50RGVmcygpO3RoaXMuZXhwZWN0VG9rZW4obC5DT0xPTik7Y29uc3Qgcz10aGlzLnBhcnNlVHlwZVJlZmVyZW5jZSgpLG89dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULkZJRUxEX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixuYW1lOmksYXJndW1lbnRzOnIsdHlwZTpzLGRpcmVjdGl2ZXM6b30pfXBhcnNlQXJndW1lbnREZWZzKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KGwuUEFSRU5fTCx0aGlzLnBhcnNlSW5wdXRWYWx1ZURlZixsLlBBUkVOX1IpfXBhcnNlSW5wdXRWYWx1ZURlZigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW4sbj10aGlzLnBhcnNlRGVzY3JpcHRpb24oKSxpPXRoaXMucGFyc2VOYW1lKCk7dGhpcy5leHBlY3RUb2tlbihsLkNPTE9OKTtjb25zdCByPXRoaXMucGFyc2VUeXBlUmVmZXJlbmNlKCk7bGV0IHM7dGhpcy5leHBlY3RPcHRpb25hbFRva2VuKGwuRVFVQUxTKSYmKHM9dGhpcy5wYXJzZUNvbnN0VmFsdWVMaXRlcmFsKCkpO2NvbnN0IG89dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULklOUFVUX1ZBTFVFX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixuYW1lOmksdHlwZTpyLGRlZmF1bHRWYWx1ZTpzLGRpcmVjdGl2ZXM6b30pfXBhcnNlSW50ZXJmYWNlVHlwZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJpbnRlcmZhY2UiKTtjb25zdCBpPXRoaXMucGFyc2VOYW1lKCkscj10aGlzLnBhcnNlSW1wbGVtZW50c0ludGVyZmFjZXMoKSxzPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxvPXRoaXMucGFyc2VGaWVsZHNEZWZpbml0aW9uKCk7cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOlQuSU5URVJGQUNFX1RZUEVfREVGSU5JVElPTixkZXNjcmlwdGlvbjpuLG5hbWU6aSxpbnRlcmZhY2VzOnIsZGlyZWN0aXZlczpzLGZpZWxkczpvfSl9cGFyc2VVbmlvblR5cGVEZWZpbml0aW9uKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbixuPXRoaXMucGFyc2VEZXNjcmlwdGlvbigpO3RoaXMuZXhwZWN0S2V5d29yZCgidW5pb24iKTtjb25zdCBpPXRoaXMucGFyc2VOYW1lKCkscj10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCkscz10aGlzLnBhcnNlVW5pb25NZW1iZXJUeXBlcygpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULlVOSU9OX1RZUEVfREVGSU5JVElPTixkZXNjcmlwdGlvbjpuLG5hbWU6aSxkaXJlY3RpdmVzOnIsdHlwZXM6c30pfXBhcnNlVW5pb25NZW1iZXJUeXBlcygpe3JldHVybiB0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4obC5FUVVBTFMpP3RoaXMuZGVsaW1pdGVkTWFueShsLlBJUEUsdGhpcy5wYXJzZU5hbWVkVHlwZSk6W119cGFyc2VFbnVtVHlwZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJlbnVtIik7Y29uc3QgaT10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLHM9dGhpcy5wYXJzZUVudW1WYWx1ZXNEZWZpbml0aW9uKCk7cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOlQuRU5VTV9UWVBFX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixuYW1lOmksZGlyZWN0aXZlczpyLHZhbHVlczpzfSl9cGFyc2VFbnVtVmFsdWVzRGVmaW5pdGlvbigpe3JldHVybiB0aGlzLm9wdGlvbmFsTWFueShsLkJSQUNFX0wsdGhpcy5wYXJzZUVudW1WYWx1ZURlZmluaXRpb24sbC5CUkFDRV9SKX1wYXJzZUVudW1WYWx1ZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCksaT10aGlzLnBhcnNlRW51bVZhbHVlTmFtZSgpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULkVOVU1fVkFMVUVfREVGSU5JVElPTixkZXNjcmlwdGlvbjpuLG5hbWU6aSxkaXJlY3RpdmVzOnJ9KX1wYXJzZUVudW1WYWx1ZU5hbWUoKXtpZih0aGlzLl9sZXhlci50b2tlbi52YWx1ZT09PSJ0cnVlInx8dGhpcy5fbGV4ZXIudG9rZW4udmFsdWU9PT0iZmFsc2UifHx0aGlzLl9sZXhlci50b2tlbi52YWx1ZT09PSJudWxsIil0aHJvdyBHKHRoaXMuX2xleGVyLnNvdXJjZSx0aGlzLl9sZXhlci50b2tlbi5zdGFydCxgJHtDZSh0aGlzLl9sZXhlci50b2tlbil9IGlzIHJlc2VydmVkIGFuZCBjYW5ub3QgYmUgdXNlZCBmb3IgYW4gZW51bSB2YWx1ZS5gKTtyZXR1cm4gdGhpcy5wYXJzZU5hbWUoKX1wYXJzZUlucHV0T2JqZWN0VHlwZURlZmluaXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZURlc2NyaXB0aW9uKCk7dGhpcy5leHBlY3RLZXl3b3JkKCJpbnB1dCIpO2NvbnN0IGk9dGhpcy5wYXJzZU5hbWUoKSxyPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxzPXRoaXMucGFyc2VJbnB1dEZpZWxkc0RlZmluaXRpb24oKTtyZXR1cm4gdGhpcy5ub2RlKHQse2tpbmQ6VC5JTlBVVF9PQkpFQ1RfVFlQRV9ERUZJTklUSU9OLGRlc2NyaXB0aW9uOm4sbmFtZTppLGRpcmVjdGl2ZXM6cixmaWVsZHM6c30pfXBhcnNlSW5wdXRGaWVsZHNEZWZpbml0aW9uKCl7cmV0dXJuIHRoaXMub3B0aW9uYWxNYW55KGwuQlJBQ0VfTCx0aGlzLnBhcnNlSW5wdXRWYWx1ZURlZixsLkJSQUNFX1IpfXBhcnNlVHlwZVN5c3RlbUV4dGVuc2lvbigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIubG9va2FoZWFkKCk7aWYodC5raW5kPT09bC5OQU1FKXN3aXRjaCh0LnZhbHVlKXtjYXNlInNjaGVtYSI6cmV0dXJuIHRoaXMucGFyc2VTY2hlbWFFeHRlbnNpb24oKTtjYXNlInNjYWxhciI6cmV0dXJuIHRoaXMucGFyc2VTY2FsYXJUeXBlRXh0ZW5zaW9uKCk7Y2FzZSJ0eXBlIjpyZXR1cm4gdGhpcy5wYXJzZU9iamVjdFR5cGVFeHRlbnNpb24oKTtjYXNlImludGVyZmFjZSI6cmV0dXJuIHRoaXMucGFyc2VJbnRlcmZhY2VUeXBlRXh0ZW5zaW9uKCk7Y2FzZSJ1bmlvbiI6cmV0dXJuIHRoaXMucGFyc2VVbmlvblR5cGVFeHRlbnNpb24oKTtjYXNlImVudW0iOnJldHVybiB0aGlzLnBhcnNlRW51bVR5cGVFeHRlbnNpb24oKTtjYXNlImlucHV0IjpyZXR1cm4gdGhpcy5wYXJzZUlucHV0T2JqZWN0VHlwZUV4dGVuc2lvbigpfXRocm93IHRoaXMudW5leHBlY3RlZCh0KX1wYXJzZVNjaGVtYUV4dGVuc2lvbigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47dGhpcy5leHBlY3RLZXl3b3JkKCJleHRlbmQiKSx0aGlzLmV4cGVjdEtleXdvcmQoInNjaGVtYSIpO2NvbnN0IG49dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLGk9dGhpcy5vcHRpb25hbE1hbnkobC5CUkFDRV9MLHRoaXMucGFyc2VPcGVyYXRpb25UeXBlRGVmaW5pdGlvbixsLkJSQUNFX1IpO2lmKG4ubGVuZ3RoPT09MCYmaS5sZW5ndGg9PT0wKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULlNDSEVNQV9FWFRFTlNJT04sZGlyZWN0aXZlczpuLG9wZXJhdGlvblR5cGVzOml9KX1wYXJzZVNjYWxhclR5cGVFeHRlbnNpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJzY2FsYXIiKTtjb25zdCBuPXRoaXMucGFyc2VOYW1lKCksaT10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCk7aWYoaS5sZW5ndGg9PT0wKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULlNDQUxBUl9UWVBFX0VYVEVOU0lPTixuYW1lOm4sZGlyZWN0aXZlczppfSl9cGFyc2VPYmplY3RUeXBlRXh0ZW5zaW9uKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbjt0aGlzLmV4cGVjdEtleXdvcmQoImV4dGVuZCIpLHRoaXMuZXhwZWN0S2V5d29yZCgidHlwZSIpO2NvbnN0IG49dGhpcy5wYXJzZU5hbWUoKSxpPXRoaXMucGFyc2VJbXBsZW1lbnRzSW50ZXJmYWNlcygpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLHM9dGhpcy5wYXJzZUZpZWxkc0RlZmluaXRpb24oKTtpZihpLmxlbmd0aD09PTAmJnIubGVuZ3RoPT09MCYmcy5sZW5ndGg9PT0wKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULk9CSkVDVF9UWVBFX0VYVEVOU0lPTixuYW1lOm4saW50ZXJmYWNlczppLGRpcmVjdGl2ZXM6cixmaWVsZHM6c30pfXBhcnNlSW50ZXJmYWNlVHlwZUV4dGVuc2lvbigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW47dGhpcy5leHBlY3RLZXl3b3JkKCJleHRlbmQiKSx0aGlzLmV4cGVjdEtleXdvcmQoImludGVyZmFjZSIpO2NvbnN0IG49dGhpcy5wYXJzZU5hbWUoKSxpPXRoaXMucGFyc2VJbXBsZW1lbnRzSW50ZXJmYWNlcygpLHI9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLHM9dGhpcy5wYXJzZUZpZWxkc0RlZmluaXRpb24oKTtpZihpLmxlbmd0aD09PTAmJnIubGVuZ3RoPT09MCYmcy5sZW5ndGg9PT0wKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULklOVEVSRkFDRV9UWVBFX0VYVEVOU0lPTixuYW1lOm4saW50ZXJmYWNlczppLGRpcmVjdGl2ZXM6cixmaWVsZHM6c30pfXBhcnNlVW5pb25UeXBlRXh0ZW5zaW9uKCl7Y29uc3QgdD10aGlzLl9sZXhlci50b2tlbjt0aGlzLmV4cGVjdEtleXdvcmQoImV4dGVuZCIpLHRoaXMuZXhwZWN0S2V5d29yZCgidW5pb24iKTtjb25zdCBuPXRoaXMucGFyc2VOYW1lKCksaT10aGlzLnBhcnNlQ29uc3REaXJlY3RpdmVzKCkscj10aGlzLnBhcnNlVW5pb25NZW1iZXJUeXBlcygpO2lmKGkubGVuZ3RoPT09MCYmci5sZW5ndGg9PT0wKXRocm93IHRoaXMudW5leHBlY3RlZCgpO3JldHVybiB0aGlzLm5vZGUodCx7a2luZDpULlVOSU9OX1RZUEVfRVhURU5TSU9OLG5hbWU6bixkaXJlY3RpdmVzOmksdHlwZXM6cn0pfXBhcnNlRW51bVR5cGVFeHRlbnNpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJlbnVtIik7Y29uc3Qgbj10aGlzLnBhcnNlTmFtZSgpLGk9dGhpcy5wYXJzZUNvbnN0RGlyZWN0aXZlcygpLHI9dGhpcy5wYXJzZUVudW1WYWx1ZXNEZWZpbml0aW9uKCk7aWYoaS5sZW5ndGg9PT0wJiZyLmxlbmd0aD09PTApdGhyb3cgdGhpcy51bmV4cGVjdGVkKCk7cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOlQuRU5VTV9UWVBFX0VYVEVOU0lPTixuYW1lOm4sZGlyZWN0aXZlczppLHZhbHVlczpyfSl9cGFyc2VJbnB1dE9iamVjdFR5cGVFeHRlbnNpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuO3RoaXMuZXhwZWN0S2V5d29yZCgiZXh0ZW5kIiksdGhpcy5leHBlY3RLZXl3b3JkKCJpbnB1dCIpO2NvbnN0IG49dGhpcy5wYXJzZU5hbWUoKSxpPXRoaXMucGFyc2VDb25zdERpcmVjdGl2ZXMoKSxyPXRoaXMucGFyc2VJbnB1dEZpZWxkc0RlZmluaXRpb24oKTtpZihpLmxlbmd0aD09PTAmJnIubGVuZ3RoPT09MCl0aHJvdyB0aGlzLnVuZXhwZWN0ZWQoKTtyZXR1cm4gdGhpcy5ub2RlKHQse2tpbmQ6VC5JTlBVVF9PQkpFQ1RfVFlQRV9FWFRFTlNJT04sbmFtZTpuLGRpcmVjdGl2ZXM6aSxmaWVsZHM6cn0pfXBhcnNlRGlyZWN0aXZlRGVmaW5pdGlvbigpe2NvbnN0IHQ9dGhpcy5fbGV4ZXIudG9rZW4sbj10aGlzLnBhcnNlRGVzY3JpcHRpb24oKTt0aGlzLmV4cGVjdEtleXdvcmQoImRpcmVjdGl2ZSIpLHRoaXMuZXhwZWN0VG9rZW4obC5BVCk7Y29uc3QgaT10aGlzLnBhcnNlTmFtZSgpLHI9dGhpcy5wYXJzZUFyZ3VtZW50RGVmcygpLHM9dGhpcy5leHBlY3RPcHRpb25hbEtleXdvcmQoInJlcGVhdGFibGUiKTt0aGlzLmV4cGVjdEtleXdvcmQoIm9uIik7Y29uc3Qgbz10aGlzLnBhcnNlRGlyZWN0aXZlTG9jYXRpb25zKCk7cmV0dXJuIHRoaXMubm9kZSh0LHtraW5kOlQuRElSRUNUSVZFX0RFRklOSVRJT04sZGVzY3JpcHRpb246bixuYW1lOmksYXJndW1lbnRzOnIscmVwZWF0YWJsZTpzLGxvY2F0aW9uczpvfSl9cGFyc2VEaXJlY3RpdmVMb2NhdGlvbnMoKXtyZXR1cm4gdGhpcy5kZWxpbWl0ZWRNYW55KGwuUElQRSx0aGlzLnBhcnNlRGlyZWN0aXZlTG9jYXRpb24pfXBhcnNlRGlyZWN0aXZlTG9jYXRpb24oKXtjb25zdCB0PXRoaXMuX2xleGVyLnRva2VuLG49dGhpcy5wYXJzZU5hbWUoKTtpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoUWUsbi52YWx1ZSkpcmV0dXJuIG47dGhyb3cgdGhpcy51bmV4cGVjdGVkKHQpfW5vZGUodCxuKXtyZXR1cm4gdGhpcy5fb3B0aW9ucy5ub0xvY2F0aW9uIT09ITAmJihuLmxvYz1uZXcgYm4odCx0aGlzLl9sZXhlci5sYXN0VG9rZW4sdGhpcy5fbGV4ZXIuc291cmNlKSksbn1wZWVrKHQpe3JldHVybiB0aGlzLl9sZXhlci50b2tlbi5raW5kPT09dH1leHBlY3RUb2tlbih0KXtjb25zdCBuPXRoaXMuX2xleGVyLnRva2VuO2lmKG4ua2luZD09PXQpcmV0dXJuIHRoaXMuYWR2YW5jZUxleGVyKCksbjt0aHJvdyBHKHRoaXMuX2xleGVyLnNvdXJjZSxuLnN0YXJ0LGBFeHBlY3RlZCAke1J0KHQpfSwgZm91bmQgJHtDZShuKX0uYCl9ZXhwZWN0T3B0aW9uYWxUb2tlbih0KXtyZXR1cm4gdGhpcy5fbGV4ZXIudG9rZW4ua2luZD09PXQ/KHRoaXMuYWR2YW5jZUxleGVyKCksITApOiExfWV4cGVjdEtleXdvcmQodCl7Y29uc3Qgbj10aGlzLl9sZXhlci50b2tlbjtpZihuLmtpbmQ9PT1sLk5BTUUmJm4udmFsdWU9PT10KXRoaXMuYWR2YW5jZUxleGVyKCk7ZWxzZSB0aHJvdyBHKHRoaXMuX2xleGVyLnNvdXJjZSxuLnN0YXJ0LGBFeHBlY3RlZCAiJHt0fSIsIGZvdW5kICR7Q2Uobil9LmApfWV4cGVjdE9wdGlvbmFsS2V5d29yZCh0KXtjb25zdCBuPXRoaXMuX2xleGVyLnRva2VuO3JldHVybiBuLmtpbmQ9PT1sLk5BTUUmJm4udmFsdWU9PT10Pyh0aGlzLmFkdmFuY2VMZXhlcigpLCEwKTohMX11bmV4cGVjdGVkKHQpe2NvbnN0IG49dCE9bnVsbD90OnRoaXMuX2xleGVyLnRva2VuO3JldHVybiBHKHRoaXMuX2xleGVyLnNvdXJjZSxuLnN0YXJ0LGBVbmV4cGVjdGVkICR7Q2Uobil9LmApfWFueSh0LG4saSl7dGhpcy5leHBlY3RUb2tlbih0KTtjb25zdCByPVtdO2Zvcig7IXRoaXMuZXhwZWN0T3B0aW9uYWxUb2tlbihpKTspci5wdXNoKG4uY2FsbCh0aGlzKSk7cmV0dXJuIHJ9b3B0aW9uYWxNYW55KHQsbixpKXtpZih0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4odCkpe2NvbnN0IHI9W107ZG8gci5wdXNoKG4uY2FsbCh0aGlzKSk7d2hpbGUoIXRoaXMuZXhwZWN0T3B0aW9uYWxUb2tlbihpKSk7cmV0dXJuIHJ9cmV0dXJuW119bWFueSh0LG4saSl7dGhpcy5leHBlY3RUb2tlbih0KTtjb25zdCByPVtdO2RvIHIucHVzaChuLmNhbGwodGhpcykpO3doaWxlKCF0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4oaSkpO3JldHVybiByfWRlbGltaXRlZE1hbnkodCxuKXt0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4odCk7Y29uc3QgaT1bXTtkbyBpLnB1c2gobi5jYWxsKHRoaXMpKTt3aGlsZSh0aGlzLmV4cGVjdE9wdGlvbmFsVG9rZW4odCkpO3JldHVybiBpfWFkdmFuY2VMZXhlcigpe2NvbnN0e21heFRva2Vuczp0fT10aGlzLl9vcHRpb25zLG49dGhpcy5fbGV4ZXIuYWR2YW5jZSgpO2lmKHQhPT12b2lkIDAmJm4ua2luZCE9PWwuRU9GJiYoKyt0aGlzLl90b2tlbkNvdW50ZXIsdGhpcy5fdG9rZW5Db3VudGVyPnQpKXRocm93IEcodGhpcy5fbGV4ZXIuc291cmNlLG4uc3RhcnQsYERvY3VtZW50IGNvbnRhaW5zIG1vcmUgdGhhdCAke3R9IHRva2Vucy4gUGFyc2luZyBhYm9ydGVkLmApfX1mdW5jdGlvbiBDZShlKXtjb25zdCB0PWUudmFsdWU7cmV0dXJuIFJ0KGUua2luZCkrKHQhPW51bGw/YCAiJHt0fSJgOiIiKX1mdW5jdGlvbiBSdChlKXtyZXR1cm4gd24oZSk/YCIke2V9ImA6ZX1mdW5jdGlvbiBKbihlKXtyZXR1cm5gIiR7ZS5yZXBsYWNlKFFuLFhuKX0iYH1jb25zdCBRbj0vW1x4MDAtXHgxZlx4MjJceDVjXHg3Zi1ceDlmXS9nO2Z1bmN0aW9uIFhuKGUpe3JldHVybiBXbltlLmNoYXJDb2RlQXQoMCldfWNvbnN0IFduPVsiXFx1MDAwMCIsIlxcdTAwMDEiLCJcXHUwMDAyIiwiXFx1MDAwMyIsIlxcdTAwMDQiLCJcXHUwMDA1IiwiXFx1MDAwNiIsIlxcdTAwMDciLCJcXGIiLCJcXHQiLCJcXG4iLCJcXHUwMDBCIiwiXFxmIiwiXFxyIiwiXFx1MDAwRSIsIlxcdTAwMEYiLCJcXHUwMDEwIiwiXFx1MDAxMSIsIlxcdTAwMTIiLCJcXHUwMDEzIiwiXFx1MDAxNCIsIlxcdTAwMTUiLCJcXHUwMDE2IiwiXFx1MDAxNyIsIlxcdTAwMTgiLCJcXHUwMDE5IiwiXFx1MDAxQSIsIlxcdTAwMUIiLCJcXHUwMDFDIiwiXFx1MDAxRCIsIlxcdTAwMUUiLCJcXHUwMDFGIiwiIiwiIiwnXFwiJywiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiIiwiXFxcXCIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIiIsIlxcdTAwN0YiLCJcXHUwMDgwIiwiXFx1MDA4MSIsIlxcdTAwODIiLCJcXHUwMDgzIiwiXFx1MDA4NCIsIlxcdTAwODUiLCJcXHUwMDg2IiwiXFx1MDA4NyIsIlxcdTAwODgiLCJcXHUwMDg5IiwiXFx1MDA4QSIsIlxcdTAwOEIiLCJcXHUwMDhDIiwiXFx1MDA4RCIsIlxcdTAwOEUiLCJcXHUwMDhGIiwiXFx1MDA5MCIsIlxcdTAwOTEiLCJcXHUwMDkyIiwiXFx1MDA5MyIsIlxcdTAwOTQiLCJcXHUwMDk1IiwiXFx1MDA5NiIsIlxcdTAwOTciLCJcXHUwMDk4IiwiXFx1MDA5OSIsIlxcdTAwOUEiLCJcXHUwMDlCIiwiXFx1MDA5QyIsIlxcdTAwOUQiLCJcXHUwMDlFIiwiXFx1MDA5RiJdLFpuPU9iamVjdC5mcmVlemUoe30pO2Z1bmN0aW9uIEtuKGUsdCxuPU50KXtjb25zdCBpPW5ldyBNYXA7Zm9yKGNvbnN0IEUgb2YgT2JqZWN0LnZhbHVlcyhUKSlpLnNldChFLGVyKHQsRSkpO2xldCByLHM9QXJyYXkuaXNBcnJheShlKSxvPVtlXSxjPS0xLGY9W10sZD1lLHUseTtjb25zdCBnPVtdLGI9W107ZG97YysrO2NvbnN0IEU9Yz09PW8ubGVuZ3RoLGs9RSYmZi5sZW5ndGghPT0wO2lmKEUpe2lmKHU9Yi5sZW5ndGg9PT0wP3ZvaWQgMDpnW2cubGVuZ3RoLTFdLGQ9eSx5PWIucG9wKCksaylpZihzKXtkPWQuc2xpY2UoKTtsZXQgTD0wO2Zvcihjb25zdFskLHFdb2YgZil7Y29uc3QgTT0kLUw7cT09PW51bGw/KGQuc3BsaWNlKE0sMSksTCsrKTpkW01dPXF9fWVsc2V7ZD1PYmplY3QuZGVmaW5lUHJvcGVydGllcyh7fSxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhkKSk7Zm9yKGNvbnN0W0wsJF1vZiBmKWRbTF09JH1jPXIuaW5kZXgsbz1yLmtleXMsZj1yLmVkaXRzLHM9ci5pbkFycmF5LHI9ci5wcmV2fWVsc2UgaWYoeSl7aWYodT1zP2M6b1tjXSxkPXlbdV0sZD09bnVsbCljb250aW51ZTtnLnB1c2godSl9bGV0IHc7aWYoIUFycmF5LmlzQXJyYXkoZCkpe3ZhciBtLE47eHQoZCl8fFNlKCExLGBJbnZhbGlkIEFTVCBOb2RlOiAke1plKGQpfS5gKTtjb25zdCBMPUU/KG09aS5nZXQoZC5raW5kKSk9PT1udWxsfHxtPT09dm9pZCAwP3ZvaWQgMDptLmxlYXZlOihOPWkuZ2V0KGQua2luZCkpPT09bnVsbHx8Tj09PXZvaWQgMD92b2lkIDA6Ti5lbnRlcjtpZih3PUw9PW51bGw/dm9pZCAwOkwuY2FsbCh0LGQsdSx5LGcsYiksdz09PVpuKWJyZWFrO2lmKHc9PT0hMSl7aWYoIUUpe2cucG9wKCk7Y29udGludWV9fWVsc2UgaWYodyE9PXZvaWQgMCYmKGYucHVzaChbdSx3XSksIUUpKWlmKHh0KHcpKWQ9dztlbHNle2cucG9wKCk7Y29udGludWV9fWlmKHc9PT12b2lkIDAmJmsmJmYucHVzaChbdSxkXSksRSlnLnBvcCgpO2Vsc2V7dmFyIHY7cj17aW5BcnJheTpzLGluZGV4OmMsa2V5czpvLGVkaXRzOmYscHJldjpyfSxzPUFycmF5LmlzQXJyYXkoZCksbz1zP2Q6KHY9bltkLmtpbmRdKSE9PW51bGwmJnYhPT12b2lkIDA/djpbXSxjPS0xLGY9W10seSYmYi5wdXNoKHkpLHk9ZH19d2hpbGUociE9PXZvaWQgMCk7cmV0dXJuIGYubGVuZ3RoIT09MD9mW2YubGVuZ3RoLTFdWzFdOmV9ZnVuY3Rpb24gZXIoZSx0KXtjb25zdCBuPWVbdF07cmV0dXJuIHR5cGVvZiBuPT0ib2JqZWN0Ij9uOnR5cGVvZiBuPT0iZnVuY3Rpb24iP3tlbnRlcjpuLGxlYXZlOnZvaWQgMH06e2VudGVyOmUuZW50ZXIsbGVhdmU6ZS5sZWF2ZX19ZnVuY3Rpb24gdHIoZSl7cmV0dXJuIEtuKGUscnIpfWNvbnN0IG5yPTgwLHJyPXtOYW1lOntsZWF2ZTplPT5lLnZhbHVlfSxWYXJpYWJsZTp7bGVhdmU6ZT0+IiQiK2UubmFtZX0sRG9jdW1lbnQ6e2xlYXZlOmU9PnAoZS5kZWZpbml0aW9ucyxgCgpgKX0sT3BlcmF0aW9uRGVmaW5pdGlvbjp7bGVhdmUoZSl7Y29uc3QgdD1TKCIoIixwKGUudmFyaWFibGVEZWZpbml0aW9ucywiLCAiKSwiKSIpLG49cChbZS5vcGVyYXRpb24scChbZS5uYW1lLHRdKSxwKGUuZGlyZWN0aXZlcywiICIpXSwiICIpO3JldHVybihuPT09InF1ZXJ5Ij8iIjpuKyIgIikrZS5zZWxlY3Rpb25TZXR9fSxWYXJpYWJsZURlZmluaXRpb246e2xlYXZlOih7dmFyaWFibGU6ZSx0eXBlOnQsZGVmYXVsdFZhbHVlOm4sZGlyZWN0aXZlczppfSk9PmUrIjogIit0K1MoIiA9ICIsbikrUygiICIscChpLCIgIikpfSxTZWxlY3Rpb25TZXQ6e2xlYXZlOih7c2VsZWN0aW9uczplfSk9PksoZSl9LEZpZWxkOntsZWF2ZSh7YWxpYXM6ZSxuYW1lOnQsYXJndW1lbnRzOm4sZGlyZWN0aXZlczppLHNlbGVjdGlvblNldDpyfSl7Y29uc3Qgcz1TKCIiLGUsIjogIikrdDtsZXQgbz1zK1MoIigiLHAobiwiLCAiKSwiKSIpO3JldHVybiBvLmxlbmd0aD5uciYmKG89cytTKGAoCmAsa2UocChuLGAKYCkpLGAKKWApKSxwKFtvLHAoaSwiICIpLHJdLCIgIil9fSxBcmd1bWVudDp7bGVhdmU6KHtuYW1lOmUsdmFsdWU6dH0pPT5lKyI6ICIrdH0sRnJhZ21lbnRTcHJlYWQ6e2xlYXZlOih7bmFtZTplLGRpcmVjdGl2ZXM6dH0pPT4iLi4uIitlK1MoIiAiLHAodCwiICIpKX0sSW5saW5lRnJhZ21lbnQ6e2xlYXZlOih7dHlwZUNvbmRpdGlvbjplLGRpcmVjdGl2ZXM6dCxzZWxlY3Rpb25TZXQ6bn0pPT5wKFsiLi4uIixTKCJvbiAiLGUpLHAodCwiICIpLG5dLCIgIil9LEZyYWdtZW50RGVmaW5pdGlvbjp7bGVhdmU6KHtuYW1lOmUsdHlwZUNvbmRpdGlvbjp0LHZhcmlhYmxlRGVmaW5pdGlvbnM6bixkaXJlY3RpdmVzOmksc2VsZWN0aW9uU2V0OnJ9KT0+YGZyYWdtZW50ICR7ZX0ke1MoIigiLHAobiwiLCAiKSwiKSIpfSBvbiAke3R9ICR7UygiIixwKGksIiAiKSwiICIpfWArcn0sSW50VmFsdWU6e2xlYXZlOih7dmFsdWU6ZX0pPT5lfSxGbG9hdFZhbHVlOntsZWF2ZTooe3ZhbHVlOmV9KT0+ZX0sU3RyaW5nVmFsdWU6e2xlYXZlOih7dmFsdWU6ZSxibG9jazp0fSk9PnQ/T24oZSk6Sm4oZSl9LEJvb2xlYW5WYWx1ZTp7bGVhdmU6KHt2YWx1ZTplfSk9PmU/InRydWUiOiJmYWxzZSJ9LE51bGxWYWx1ZTp7bGVhdmU6KCk9PiJudWxsIn0sRW51bVZhbHVlOntsZWF2ZTooe3ZhbHVlOmV9KT0+ZX0sTGlzdFZhbHVlOntsZWF2ZTooe3ZhbHVlczplfSk9PiJbIitwKGUsIiwgIikrIl0ifSxPYmplY3RWYWx1ZTp7bGVhdmU6KHtmaWVsZHM6ZX0pPT4ieyIrcChlLCIsICIpKyJ9In0sT2JqZWN0RmllbGQ6e2xlYXZlOih7bmFtZTplLHZhbHVlOnR9KT0+ZSsiOiAiK3R9LERpcmVjdGl2ZTp7bGVhdmU6KHtuYW1lOmUsYXJndW1lbnRzOnR9KT0+IkAiK2UrUygiKCIscCh0LCIsICIpLCIpIil9LE5hbWVkVHlwZTp7bGVhdmU6KHtuYW1lOmV9KT0+ZX0sTGlzdFR5cGU6e2xlYXZlOih7dHlwZTplfSk9PiJbIitlKyJdIn0sTm9uTnVsbFR5cGU6e2xlYXZlOih7dHlwZTplfSk9PmUrIiEifSxTY2hlbWFEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsZGlyZWN0aXZlczp0LG9wZXJhdGlvblR5cGVzOm59KT0+UygiIixlLGAKYCkrcChbInNjaGVtYSIscCh0LCIgIiksSyhuKV0sIiAiKX0sT3BlcmF0aW9uVHlwZURlZmluaXRpb246e2xlYXZlOih7b3BlcmF0aW9uOmUsdHlwZTp0fSk9PmUrIjogIit0fSxTY2FsYXJUeXBlRGVmaW5pdGlvbjp7bGVhdmU6KHtkZXNjcmlwdGlvbjplLG5hbWU6dCxkaXJlY3RpdmVzOm59KT0+UygiIixlLGAKYCkrcChbInNjYWxhciIsdCxwKG4sIiAiKV0sIiAiKX0sT2JqZWN0VHlwZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsaW50ZXJmYWNlczpuLGRpcmVjdGl2ZXM6aSxmaWVsZHM6cn0pPT5TKCIiLGUsYApgKStwKFsidHlwZSIsdCxTKCJpbXBsZW1lbnRzICIscChuLCIgJiAiKSkscChpLCIgIiksSyhyKV0sIiAiKX0sRmllbGREZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGFyZ3VtZW50czpuLHR5cGU6aSxkaXJlY3RpdmVzOnJ9KT0+UygiIixlLGAKYCkrdCsoTHQobik/UyhgKApgLGtlKHAobixgCmApKSxgCilgKTpTKCIoIixwKG4sIiwgIiksIikiKSkrIjogIitpK1MoIiAiLHAociwiICIpKX0sSW5wdXRWYWx1ZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsdHlwZTpuLGRlZmF1bHRWYWx1ZTppLGRpcmVjdGl2ZXM6cn0pPT5TKCIiLGUsYApgKStwKFt0KyI6ICIrbixTKCI9ICIsaSkscChyLCIgIildLCIgIil9LEludGVyZmFjZVR5cGVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGludGVyZmFjZXM6bixkaXJlY3RpdmVzOmksZmllbGRzOnJ9KT0+UygiIixlLGAKYCkrcChbImludGVyZmFjZSIsdCxTKCJpbXBsZW1lbnRzICIscChuLCIgJiAiKSkscChpLCIgIiksSyhyKV0sIiAiKX0sVW5pb25UeXBlRGVmaW5pdGlvbjp7bGVhdmU6KHtkZXNjcmlwdGlvbjplLG5hbWU6dCxkaXJlY3RpdmVzOm4sdHlwZXM6aX0pPT5TKCIiLGUsYApgKStwKFsidW5pb24iLHQscChuLCIgIiksUygiPSAiLHAoaSwiIHwgIikpXSwiICIpfSxFbnVtVHlwZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsZGlyZWN0aXZlczpuLHZhbHVlczppfSk9PlMoIiIsZSxgCmApK3AoWyJlbnVtIix0LHAobiwiICIpLEsoaSldLCIgIil9LEVudW1WYWx1ZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsZGlyZWN0aXZlczpufSk9PlMoIiIsZSxgCmApK3AoW3QscChuLCIgIildLCIgIil9LElucHV0T2JqZWN0VHlwZURlZmluaXRpb246e2xlYXZlOih7ZGVzY3JpcHRpb246ZSxuYW1lOnQsZGlyZWN0aXZlczpuLGZpZWxkczppfSk9PlMoIiIsZSxgCmApK3AoWyJpbnB1dCIsdCxwKG4sIiAiKSxLKGkpXSwiICIpfSxEaXJlY3RpdmVEZWZpbml0aW9uOntsZWF2ZTooe2Rlc2NyaXB0aW9uOmUsbmFtZTp0LGFyZ3VtZW50czpuLHJlcGVhdGFibGU6aSxsb2NhdGlvbnM6cn0pPT5TKCIiLGUsYApgKSsiZGlyZWN0aXZlIEAiK3QrKEx0KG4pP1MoYCgKYCxrZShwKG4sYApgKSksYAopYCk6UygiKCIscChuLCIsICIpLCIpIikpKyhpPyIgcmVwZWF0YWJsZSI6IiIpKyIgb24gIitwKHIsIiB8ICIpfSxTY2hlbWFFeHRlbnNpb246e2xlYXZlOih7ZGlyZWN0aXZlczplLG9wZXJhdGlvblR5cGVzOnR9KT0+cChbImV4dGVuZCBzY2hlbWEiLHAoZSwiICIpLEsodCldLCIgIil9LFNjYWxhclR5cGVFeHRlbnNpb246e2xlYXZlOih7bmFtZTplLGRpcmVjdGl2ZXM6dH0pPT5wKFsiZXh0ZW5kIHNjYWxhciIsZSxwKHQsIiAiKV0sIiAiKX0sT2JqZWN0VHlwZUV4dGVuc2lvbjp7bGVhdmU6KHtuYW1lOmUsaW50ZXJmYWNlczp0LGRpcmVjdGl2ZXM6bixmaWVsZHM6aX0pPT5wKFsiZXh0ZW5kIHR5cGUiLGUsUygiaW1wbGVtZW50cyAiLHAodCwiICYgIikpLHAobiwiICIpLEsoaSldLCIgIil9LEludGVyZmFjZVR5cGVFeHRlbnNpb246e2xlYXZlOih7bmFtZTplLGludGVyZmFjZXM6dCxkaXJlY3RpdmVzOm4sZmllbGRzOml9KT0+cChbImV4dGVuZCBpbnRlcmZhY2UiLGUsUygiaW1wbGVtZW50cyAiLHAodCwiICYgIikpLHAobiwiICIpLEsoaSldLCIgIil9LFVuaW9uVHlwZUV4dGVuc2lvbjp7bGVhdmU6KHtuYW1lOmUsZGlyZWN0aXZlczp0LHR5cGVzOm59KT0+cChbImV4dGVuZCB1bmlvbiIsZSxwKHQsIiAiKSxTKCI9ICIscChuLCIgfCAiKSldLCIgIil9LEVudW1UeXBlRXh0ZW5zaW9uOntsZWF2ZTooe25hbWU6ZSxkaXJlY3RpdmVzOnQsdmFsdWVzOm59KT0+cChbImV4dGVuZCBlbnVtIixlLHAodCwiICIpLEsobildLCIgIil9LElucHV0T2JqZWN0VHlwZUV4dGVuc2lvbjp7bGVhdmU6KHtuYW1lOmUsZGlyZWN0aXZlczp0LGZpZWxkczpufSk9PnAoWyJleHRlbmQgaW5wdXQiLGUscCh0LCIgIiksSyhuKV0sIiAiKX19O2Z1bmN0aW9uIHAoZSx0PSIiKXt2YXIgbjtyZXR1cm4obj1lPT1udWxsP3ZvaWQgMDplLmZpbHRlcihpPT5pKS5qb2luKHQpKSE9PW51bGwmJm4hPT12b2lkIDA/bjoiIn1mdW5jdGlvbiBLKGUpe3JldHVybiBTKGB7CmAsa2UocChlLGAKYCkpLGAKfWApfWZ1bmN0aW9uIFMoZSx0LG49IiIpe3JldHVybiB0IT1udWxsJiZ0IT09IiI/ZSt0K246IiJ9ZnVuY3Rpb24ga2UoZSl7cmV0dXJuIFMoIiAgIixlLnJlcGxhY2UoL1xuL2csYAogIGApKX1mdW5jdGlvbiBMdChlKXt2YXIgdDtyZXR1cm4odD1lPT1udWxsP3ZvaWQgMDplLnNvbWUobj0+bi5pbmNsdWRlcyhgCmApKSkhPT1udWxsJiZ0IT09dm9pZCAwP3Q6ITF9Y29uc3QgUHQ9ZT0+e3ZhciBpLHI7bGV0IHQ7Y29uc3Qgbj1lLmRlZmluaXRpb25zLmZpbHRlcihzPT5zLmtpbmQ9PT0iT3BlcmF0aW9uRGVmaW5pdGlvbiIpO3JldHVybiBuLmxlbmd0aD09PTEmJih0PShyPShpPW5bMF0pPT1udWxsP3ZvaWQgMDppLm5hbWUpPT1udWxsP3ZvaWQgMDpyLnZhbHVlKSx0fSxLZT1lPT57aWYodHlwZW9mIGU9PSJzdHJpbmciKXtsZXQgbjt0cnl7Y29uc3QgaT1rdChlKTtuPVB0KGkpfWNhdGNoKGkpe31yZXR1cm57cXVlcnk6ZSxvcGVyYXRpb25OYW1lOm59fWNvbnN0IHQ9UHQoZSk7cmV0dXJue3F1ZXJ5OnRyKGUpLG9wZXJhdGlvbk5hbWU6dH19O2NsYXNzIGhlIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IodCxuKXtjb25zdCBpPWAke2hlLmV4dHJhY3RNZXNzYWdlKHQpfTogJHtKU09OLnN0cmluZ2lmeSh7cmVzcG9uc2U6dCxyZXF1ZXN0Om59KX1gO3N1cGVyKGkpLE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLGhlLnByb3RvdHlwZSksdGhpcy5yZXNwb25zZT10LHRoaXMucmVxdWVzdD1uLHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZT09ImZ1bmN0aW9uIiYmRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcyxoZSl9c3RhdGljIGV4dHJhY3RNZXNzYWdlKHQpe3ZhciBuLGkscjtyZXR1cm4ocj0oaT0obj10LmVycm9ycyk9PW51bGw/dm9pZCAwOm5bMF0pPT1udWxsP3ZvaWQgMDppLm1lc3NhZ2UpIT1udWxsP3I6YEdyYXBoUUwgRXJyb3IgKENvZGU6ICR7dC5zdGF0dXN9KWB9fXZhciBpcj10eXBlb2YgZ2xvYmFsVGhpcyE9InVuZGVmaW5lZCI/Z2xvYmFsVGhpczp0eXBlb2Ygd2luZG93IT0idW5kZWZpbmVkIj93aW5kb3c6dHlwZW9mIGdsb2JhbCE9InVuZGVmaW5lZCI/Z2xvYmFsOnR5cGVvZiBzZWxmIT0idW5kZWZpbmVkIj9zZWxmOnt9O2Z1bmN0aW9uIEZ0KGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGUmJk9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLCJkZWZhdWx0Iik/ZS5kZWZhdWx0OmV9dmFyIGV0PXtleHBvcnRzOnt9fTsoZnVuY3Rpb24oZSx0KXt2YXIgbj10eXBlb2Ygc2VsZiE9InVuZGVmaW5lZCI/c2VsZjppcixpPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gcygpe3RoaXMuZmV0Y2g9ITEsdGhpcy5ET01FeGNlcHRpb249bi5ET01FeGNlcHRpb259cmV0dXJuIHMucHJvdG90eXBlPW4sbmV3IHN9KCk7KGZ1bmN0aW9uKHMpeyhmdW5jdGlvbihvKXt2YXIgYz17c2VhcmNoUGFyYW1zOiJVUkxTZWFyY2hQYXJhbXMiaW4gcyxpdGVyYWJsZToiU3ltYm9sImluIHMmJiJpdGVyYXRvciJpbiBTeW1ib2wsYmxvYjoiRmlsZVJlYWRlciJpbiBzJiYiQmxvYiJpbiBzJiZmdW5jdGlvbigpe3RyeXtyZXR1cm4gbmV3IEJsb2IsITB9Y2F0Y2goYSl7cmV0dXJuITF9fSgpLGZvcm1EYXRhOiJGb3JtRGF0YSJpbiBzLGFycmF5QnVmZmVyOiJBcnJheUJ1ZmZlciJpbiBzfTtmdW5jdGlvbiBmKGEpe3JldHVybiBhJiZEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihhKX1pZihjLmFycmF5QnVmZmVyKXZhciBkPVsiW29iamVjdCBJbnQ4QXJyYXldIiwiW29iamVjdCBVaW50OEFycmF5XSIsIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldIiwiW29iamVjdCBJbnQxNkFycmF5XSIsIltvYmplY3QgVWludDE2QXJyYXldIiwiW29iamVjdCBJbnQzMkFycmF5XSIsIltvYmplY3QgVWludDMyQXJyYXldIiwiW29iamVjdCBGbG9hdDMyQXJyYXldIiwiW29iamVjdCBGbG9hdDY0QXJyYXldIl0sdT1BcnJheUJ1ZmZlci5pc1ZpZXd8fGZ1bmN0aW9uKGEpe3JldHVybiBhJiZkLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpKT4tMX07ZnVuY3Rpb24geShhKXtpZih0eXBlb2YgYSE9InN0cmluZyImJihhPVN0cmluZyhhKSksL1teYS16MC05XC0jJCUmJyorLl5fYHx+XS9pLnRlc3QoYSkpdGhyb3cgbmV3IFR5cGVFcnJvcigiSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUiKTtyZXR1cm4gYS50b0xvd2VyQ2FzZSgpfWZ1bmN0aW9uIGcoYSl7cmV0dXJuIHR5cGVvZiBhIT0ic3RyaW5nIiYmKGE9U3RyaW5nKGEpKSxhfWZ1bmN0aW9uIGIoYSl7dmFyIGg9e25leHQ6ZnVuY3Rpb24oKXt2YXIgXz1hLnNoaWZ0KCk7cmV0dXJue2RvbmU6Xz09PXZvaWQgMCx2YWx1ZTpffX19O3JldHVybiBjLml0ZXJhYmxlJiYoaFtTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7cmV0dXJuIGh9KSxofWZ1bmN0aW9uIG0oYSl7dGhpcy5tYXA9e30sYSBpbnN0YW5jZW9mIG0/YS5mb3JFYWNoKGZ1bmN0aW9uKGgsXyl7dGhpcy5hcHBlbmQoXyxoKX0sdGhpcyk6QXJyYXkuaXNBcnJheShhKT9hLmZvckVhY2goZnVuY3Rpb24oaCl7dGhpcy5hcHBlbmQoaFswXSxoWzFdKX0sdGhpcyk6YSYmT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYSkuZm9yRWFjaChmdW5jdGlvbihoKXt0aGlzLmFwcGVuZChoLGFbaF0pfSx0aGlzKX1tLnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSxoKXthPXkoYSksaD1nKGgpO3ZhciBfPXRoaXMubWFwW2FdO3RoaXMubWFwW2FdPV8/XysiLCAiK2g6aH0sbS5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKGEpe2RlbGV0ZSB0aGlzLm1hcFt5KGEpXX0sbS5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiBhPXkoYSksdGhpcy5oYXMoYSk/dGhpcy5tYXBbYV06bnVsbH0sbS5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eSh5KGEpKX0sbS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsaCl7dGhpcy5tYXBbeShhKV09ZyhoKX0sbS5wcm90b3R5cGUuZm9yRWFjaD1mdW5jdGlvbihhLGgpe2Zvcih2YXIgXyBpbiB0aGlzLm1hcCl0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShfKSYmYS5jYWxsKGgsdGhpcy5tYXBbX10sXyx0aGlzKX0sbS5wcm90b3R5cGUua2V5cz1mdW5jdGlvbigpe3ZhciBhPVtdO3JldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oaCxfKXthLnB1c2goXyl9KSxiKGEpfSxtLnByb3RvdHlwZS52YWx1ZXM9ZnVuY3Rpb24oKXt2YXIgYT1bXTtyZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGgpe2EucHVzaChoKX0pLGIoYSl9LG0ucHJvdG90eXBlLmVudHJpZXM9ZnVuY3Rpb24oKXt2YXIgYT1bXTtyZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGgsXyl7YS5wdXNoKFtfLGhdKX0pLGIoYSl9LGMuaXRlcmFibGUmJihtLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdPW0ucHJvdG90eXBlLmVudHJpZXMpO2Z1bmN0aW9uIE4oYSl7aWYoYS5ib2R5VXNlZClyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcigiQWxyZWFkeSByZWFkIikpO2EuYm9keVVzZWQ9ITB9ZnVuY3Rpb24gdihhKXtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24oaCxfKXthLm9ubG9hZD1mdW5jdGlvbigpe2goYS5yZXN1bHQpfSxhLm9uZXJyb3I9ZnVuY3Rpb24oKXtfKGEuZXJyb3IpfX0pfWZ1bmN0aW9uIEUoYSl7dmFyIGg9bmV3IEZpbGVSZWFkZXIsXz12KGgpO3JldHVybiBoLnJlYWRBc0FycmF5QnVmZmVyKGEpLF99ZnVuY3Rpb24gayhhKXt2YXIgaD1uZXcgRmlsZVJlYWRlcixfPXYoaCk7cmV0dXJuIGgucmVhZEFzVGV4dChhKSxffWZ1bmN0aW9uIHcoYSl7Zm9yKHZhciBoPW5ldyBVaW50OEFycmF5KGEpLF89bmV3IEFycmF5KGgubGVuZ3RoKSxBPTA7QTxoLmxlbmd0aDtBKyspX1tBXT1TdHJpbmcuZnJvbUNoYXJDb2RlKGhbQV0pO3JldHVybiBfLmpvaW4oIiIpfWZ1bmN0aW9uIEwoYSl7aWYoYS5zbGljZSlyZXR1cm4gYS5zbGljZSgwKTt2YXIgaD1uZXcgVWludDhBcnJheShhLmJ5dGVMZW5ndGgpO3JldHVybiBoLnNldChuZXcgVWludDhBcnJheShhKSksaC5idWZmZXJ9ZnVuY3Rpb24gJCgpe3JldHVybiB0aGlzLmJvZHlVc2VkPSExLHRoaXMuX2luaXRCb2R5PWZ1bmN0aW9uKGEpe3RoaXMuX2JvZHlJbml0PWEsYT90eXBlb2YgYT09InN0cmluZyI/dGhpcy5fYm9keVRleHQ9YTpjLmJsb2ImJkJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYSk/dGhpcy5fYm9keUJsb2I9YTpjLmZvcm1EYXRhJiZGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihhKT90aGlzLl9ib2R5Rm9ybURhdGE9YTpjLnNlYXJjaFBhcmFtcyYmVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGEpP3RoaXMuX2JvZHlUZXh0PWEudG9TdHJpbmcoKTpjLmFycmF5QnVmZmVyJiZjLmJsb2ImJmYoYSk/KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcj1MKGEuYnVmZmVyKSx0aGlzLl9ib2R5SW5pdD1uZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpOmMuYXJyYXlCdWZmZXImJihBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihhKXx8dShhKSk/dGhpcy5fYm9keUFycmF5QnVmZmVyPUwoYSk6dGhpcy5fYm9keVRleHQ9YT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSk6dGhpcy5fYm9keVRleHQ9IiIsdGhpcy5oZWFkZXJzLmdldCgiY29udGVudC10eXBlIil8fCh0eXBlb2YgYT09InN0cmluZyI/dGhpcy5oZWFkZXJzLnNldCgiY29udGVudC10eXBlIiwidGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Iik6dGhpcy5fYm9keUJsb2ImJnRoaXMuX2JvZHlCbG9iLnR5cGU/dGhpcy5oZWFkZXJzLnNldCgiY29udGVudC10eXBlIix0aGlzLl9ib2R5QmxvYi50eXBlKTpjLnNlYXJjaFBhcmFtcyYmVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGEpJiZ0aGlzLmhlYWRlcnMuc2V0KCJjb250ZW50LXR5cGUiLCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCIpKX0sYy5ibG9iJiYodGhpcy5ibG9iPWZ1bmN0aW9uKCl7dmFyIGE9Tih0aGlzKTtpZihhKXJldHVybiBhO2lmKHRoaXMuX2JvZHlCbG9iKXJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpO2lmKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSk7aWYodGhpcy5fYm9keUZvcm1EYXRhKXRocm93IG5ldyBFcnJvcigiY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iIik7cmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSl9LHRoaXMuYXJyYXlCdWZmZXI9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYm9keUFycmF5QnVmZmVyP04odGhpcyl8fFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpOnRoaXMuYmxvYigpLnRoZW4oRSl9KSx0aGlzLnRleHQ9ZnVuY3Rpb24oKXt2YXIgYT1OKHRoaXMpO2lmKGEpcmV0dXJuIGE7aWYodGhpcy5fYm9keUJsb2IpcmV0dXJuIGsodGhpcy5fYm9keUJsb2IpO2lmKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHcodGhpcy5fYm9keUFycmF5QnVmZmVyKSk7aWYodGhpcy5fYm9keUZvcm1EYXRhKXRocm93IG5ldyBFcnJvcigiY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0Iik7cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dCl9LGMuZm9ybURhdGEmJih0aGlzLmZvcm1EYXRhPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oTyl9KSx0aGlzLmpzb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKX0sdGhpc312YXIgcT1bIkRFTEVURSIsIkdFVCIsIkhFQUQiLCJPUFRJT05TIiwiUE9TVCIsIlBVVCJdO2Z1bmN0aW9uIE0oYSl7dmFyIGg9YS50b1VwcGVyQ2FzZSgpO3JldHVybiBxLmluZGV4T2YoaCk+LTE/aDphfWZ1bmN0aW9uIEkoYSxoKXtoPWh8fHt9O3ZhciBfPWguYm9keTtpZihhIGluc3RhbmNlb2YgSSl7aWYoYS5ib2R5VXNlZCl0aHJvdyBuZXcgVHlwZUVycm9yKCJBbHJlYWR5IHJlYWQiKTt0aGlzLnVybD1hLnVybCx0aGlzLmNyZWRlbnRpYWxzPWEuY3JlZGVudGlhbHMsaC5oZWFkZXJzfHwodGhpcy5oZWFkZXJzPW5ldyBtKGEuaGVhZGVycykpLHRoaXMubWV0aG9kPWEubWV0aG9kLHRoaXMubW9kZT1hLm1vZGUsdGhpcy5zaWduYWw9YS5zaWduYWwsIV8mJmEuX2JvZHlJbml0IT1udWxsJiYoXz1hLl9ib2R5SW5pdCxhLmJvZHlVc2VkPSEwKX1lbHNlIHRoaXMudXJsPVN0cmluZyhhKTtpZih0aGlzLmNyZWRlbnRpYWxzPWguY3JlZGVudGlhbHN8fHRoaXMuY3JlZGVudGlhbHN8fCJzYW1lLW9yaWdpbiIsKGguaGVhZGVyc3x8IXRoaXMuaGVhZGVycykmJih0aGlzLmhlYWRlcnM9bmV3IG0oaC5oZWFkZXJzKSksdGhpcy5tZXRob2Q9TShoLm1ldGhvZHx8dGhpcy5tZXRob2R8fCJHRVQiKSx0aGlzLm1vZGU9aC5tb2RlfHx0aGlzLm1vZGV8fG51bGwsdGhpcy5zaWduYWw9aC5zaWduYWx8fHRoaXMuc2lnbmFsLHRoaXMucmVmZXJyZXI9bnVsbCwodGhpcy5tZXRob2Q9PT0iR0VUInx8dGhpcy5tZXRob2Q9PT0iSEVBRCIpJiZfKXRocm93IG5ldyBUeXBlRXJyb3IoIkJvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzIik7dGhpcy5faW5pdEJvZHkoXyl9SS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEkodGhpcyx7Ym9keTp0aGlzLl9ib2R5SW5pdH0pfTtmdW5jdGlvbiBPKGEpe3ZhciBoPW5ldyBGb3JtRGF0YTtyZXR1cm4gYS50cmltKCkuc3BsaXQoIiYiKS5mb3JFYWNoKGZ1bmN0aW9uKF8pe2lmKF8pe3ZhciBBPV8uc3BsaXQoIj0iKSxSPUEuc2hpZnQoKS5yZXBsYWNlKC9cKy9nLCIgIikseD1BLmpvaW4oIj0iKS5yZXBsYWNlKC9cKy9nLCIgIik7aC5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KFIpLGRlY29kZVVSSUNvbXBvbmVudCh4KSl9fSksaH1mdW5jdGlvbiBqKGEpe3ZhciBoPW5ldyBtLF89YS5yZXBsYWNlKC9ccj9cbltcdCBdKy9nLCIgIik7cmV0dXJuIF8uc3BsaXQoL1xyP1xuLykuZm9yRWFjaChmdW5jdGlvbihBKXt2YXIgUj1BLnNwbGl0KCI6IikseD1SLnNoaWZ0KCkudHJpbSgpO2lmKHgpe3ZhciBzZT1SLmpvaW4oIjoiKS50cmltKCk7aC5hcHBlbmQoeCxzZSl9fSksaH0kLmNhbGwoSS5wcm90b3R5cGUpO2Z1bmN0aW9uIFUoYSxoKXtofHwoaD17fSksdGhpcy50eXBlPSJkZWZhdWx0Iix0aGlzLnN0YXR1cz1oLnN0YXR1cz09PXZvaWQgMD8yMDA6aC5zdGF0dXMsdGhpcy5vaz10aGlzLnN0YXR1cz49MjAwJiZ0aGlzLnN0YXR1czwzMDAsdGhpcy5zdGF0dXNUZXh0PSJzdGF0dXNUZXh0ImluIGg/aC5zdGF0dXNUZXh0OiJPSyIsdGhpcy5oZWFkZXJzPW5ldyBtKGguaGVhZGVycyksdGhpcy51cmw9aC51cmx8fCIiLHRoaXMuX2luaXRCb2R5KGEpfSQuY2FsbChVLnByb3RvdHlwZSksVS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IFUodGhpcy5fYm9keUluaXQse3N0YXR1czp0aGlzLnN0YXR1cyxzdGF0dXNUZXh0OnRoaXMuc3RhdHVzVGV4dCxoZWFkZXJzOm5ldyBtKHRoaXMuaGVhZGVycyksdXJsOnRoaXMudXJsfSl9LFUuZXJyb3I9ZnVuY3Rpb24oKXt2YXIgYT1uZXcgVShudWxsLHtzdGF0dXM6MCxzdGF0dXNUZXh0OiIifSk7cmV0dXJuIGEudHlwZT0iZXJyb3IiLGF9O3ZhciBIPVszMDEsMzAyLDMwMywzMDcsMzA4XTtVLnJlZGlyZWN0PWZ1bmN0aW9uKGEsaCl7aWYoSC5pbmRleE9mKGgpPT09LTEpdGhyb3cgbmV3IFJhbmdlRXJyb3IoIkludmFsaWQgc3RhdHVzIGNvZGUiKTtyZXR1cm4gbmV3IFUobnVsbCx7c3RhdHVzOmgsaGVhZGVyczp7bG9jYXRpb246YX19KX0sby5ET01FeGNlcHRpb249cy5ET01FeGNlcHRpb247dHJ5e25ldyBvLkRPTUV4Y2VwdGlvbn1jYXRjaChhKXtvLkRPTUV4Y2VwdGlvbj1mdW5jdGlvbihoLF8pe3RoaXMubWVzc2FnZT1oLHRoaXMubmFtZT1fO3ZhciBBPUVycm9yKGgpO3RoaXMuc3RhY2s9QS5zdGFja30sby5ET01FeGNlcHRpb24ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKSxvLkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3I9by5ET01FeGNlcHRpb259ZnVuY3Rpb24gUShhLGgpe3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihfLEEpe3ZhciBSPW5ldyBJKGEsaCk7aWYoUi5zaWduYWwmJlIuc2lnbmFsLmFib3J0ZWQpcmV0dXJuIEEobmV3IG8uRE9NRXhjZXB0aW9uKCJBYm9ydGVkIiwiQWJvcnRFcnJvciIpKTt2YXIgeD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZnVuY3Rpb24gc2UoKXt4LmFib3J0KCl9eC5vbmxvYWQ9ZnVuY3Rpb24oKXt2YXIgej17c3RhdHVzOnguc3RhdHVzLHN0YXR1c1RleHQ6eC5zdGF0dXNUZXh0LGhlYWRlcnM6aih4LmdldEFsbFJlc3BvbnNlSGVhZGVycygpfHwiIil9O3oudXJsPSJyZXNwb25zZVVSTCJpbiB4P3gucmVzcG9uc2VVUkw6ei5oZWFkZXJzLmdldCgiWC1SZXF1ZXN0LVVSTCIpO3ZhciByZT0icmVzcG9uc2UiaW4geD94LnJlc3BvbnNlOngucmVzcG9uc2VUZXh0O18obmV3IFUocmUseikpfSx4Lm9uZXJyb3I9ZnVuY3Rpb24oKXtBKG5ldyBUeXBlRXJyb3IoIk5ldHdvcmsgcmVxdWVzdCBmYWlsZWQiKSl9LHgub250aW1lb3V0PWZ1bmN0aW9uKCl7QShuZXcgVHlwZUVycm9yKCJOZXR3b3JrIHJlcXVlc3QgZmFpbGVkIikpfSx4Lm9uYWJvcnQ9ZnVuY3Rpb24oKXtBKG5ldyBvLkRPTUV4Y2VwdGlvbigiQWJvcnRlZCIsIkFib3J0RXJyb3IiKSl9LHgub3BlbihSLm1ldGhvZCxSLnVybCwhMCksUi5jcmVkZW50aWFscz09PSJpbmNsdWRlIj94LndpdGhDcmVkZW50aWFscz0hMDpSLmNyZWRlbnRpYWxzPT09Im9taXQiJiYoeC53aXRoQ3JlZGVudGlhbHM9ITEpLCJyZXNwb25zZVR5cGUiaW4geCYmYy5ibG9iJiYoeC5yZXNwb25zZVR5cGU9ImJsb2IiKSxSLmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih6LHJlKXt4LnNldFJlcXVlc3RIZWFkZXIocmUseil9KSxSLnNpZ25hbCYmKFIuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoImFib3J0IixzZSkseC5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXt4LnJlYWR5U3RhdGU9PT00JiZSLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCJhYm9ydCIsc2UpfSkseC5zZW5kKHR5cGVvZiBSLl9ib2R5SW5pdD09InVuZGVmaW5lZCI/bnVsbDpSLl9ib2R5SW5pdCl9KX1yZXR1cm4gUS5wb2x5ZmlsbD0hMCxzLmZldGNofHwocy5mZXRjaD1RLHMuSGVhZGVycz1tLHMuUmVxdWVzdD1JLHMuUmVzcG9uc2U9VSksby5IZWFkZXJzPW0sby5SZXF1ZXN0PUksby5SZXNwb25zZT1VLG8uZmV0Y2g9USxPYmplY3QuZGVmaW5lUHJvcGVydHkobywiX19lc01vZHVsZSIse3ZhbHVlOiEwfSksb30pKHt9KX0pKGkpLGkuZmV0Y2gucG9ueWZpbGw9ITAsZGVsZXRlIGkuZmV0Y2gucG9seWZpbGw7dmFyIHI9aTt0PXIuZmV0Y2gsdC5kZWZhdWx0PXIuZmV0Y2gsdC5mZXRjaD1yLmZldGNoLHQuSGVhZGVycz1yLkhlYWRlcnMsdC5SZXF1ZXN0PXIuUmVxdWVzdCx0LlJlc3BvbnNlPXIuUmVzcG9uc2UsZS5leHBvcnRzPXR9KShldCxldC5leHBvcnRzKTt2YXIgUmU9ZXQuZXhwb3J0cyxMZT1GdChSZSksc3I9Qih7X19wcm90b19fOm51bGwsZGVmYXVsdDpMZX0sW1JlXSk7Y29uc3QgZGU9ZT0+e2xldCB0PXt9O3JldHVybiBlJiYodHlwZW9mIEhlYWRlcnMhPSJ1bmRlZmluZWQiJiZlIGluc3RhbmNlb2YgSGVhZGVyc3x8c3ImJlJlLkhlYWRlcnMmJmUgaW5zdGFuY2VvZiBSZS5IZWFkZXJzP3Q9ZG4oZSk6QXJyYXkuaXNBcnJheShlKT9lLmZvckVhY2goKFtuLGldKT0+e24mJmkhPT12b2lkIDAmJih0W25dPWkpfSk6dD1lKSx0fSxCdD1lPT5lLnJlcGxhY2UoLyhbXHMsXXwjW15cblxyXSspKy9nLCIgIikudHJpbSgpLG9yPWU9PntpZighQXJyYXkuaXNBcnJheShlLnF1ZXJ5KSl7Y29uc3QgaT1lLHI9W2BxdWVyeT0ke2VuY29kZVVSSUNvbXBvbmVudChCdChpLnF1ZXJ5KSl9YF07cmV0dXJuIGUudmFyaWFibGVzJiZyLnB1c2goYHZhcmlhYmxlcz0ke2VuY29kZVVSSUNvbXBvbmVudChpLmpzb25TZXJpYWxpemVyLnN0cmluZ2lmeShpLnZhcmlhYmxlcykpfWApLGkub3BlcmF0aW9uTmFtZSYmci5wdXNoKGBvcGVyYXRpb25OYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGkub3BlcmF0aW9uTmFtZSl9YCksci5qb2luKCImIil9aWYodHlwZW9mIGUudmFyaWFibGVzIT0idW5kZWZpbmVkIiYmIUFycmF5LmlzQXJyYXkoZS52YXJpYWJsZXMpKXRocm93IG5ldyBFcnJvcigiQ2Fubm90IGNyZWF0ZSBxdWVyeSB3aXRoIGdpdmVuIHZhcmlhYmxlIHR5cGUsIGFycmF5IGV4cGVjdGVkIik7Y29uc3QgdD1lLG49ZS5xdWVyeS5yZWR1Y2UoKGkscixzKT0+KGkucHVzaCh7cXVlcnk6QnQociksdmFyaWFibGVzOnQudmFyaWFibGVzP3QuanNvblNlcmlhbGl6ZXIuc3RyaW5naWZ5KHQudmFyaWFibGVzW3NdKTp2b2lkIDB9KSxpKSxbXSk7cmV0dXJuYHF1ZXJ5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHQuanNvblNlcmlhbGl6ZXIuc3RyaW5naWZ5KG4pKX1gfSxhcj1lPT50PT5YKHRoaXMsbnVsbCxmdW5jdGlvbiooKXt2YXIgTjtjb25zdHt1cmw6bixxdWVyeTppLHZhcmlhYmxlczpyLG9wZXJhdGlvbk5hbWU6cyxmZXRjaDpvLGZldGNoT3B0aW9uczpjLG1pZGRsZXdhcmU6Zn09dCxkPVAoe30sdC5oZWFkZXJzKTtsZXQgdT0iIix5O2U9PT0iUE9TVCI/KHk9dXIoaSxyLHMsYy5qc29uU2VyaWFsaXplciksdHlwZW9mIHk9PSJzdHJpbmciJiYoZFsiQ29udGVudC1UeXBlIl09ImFwcGxpY2F0aW9uL2pzb24iKSk6dT1vcih7cXVlcnk6aSx2YXJpYWJsZXM6cixvcGVyYXRpb25OYW1lOnMsanNvblNlcmlhbGl6ZXI6KE49Yy5qc29uU2VyaWFsaXplcikhPW51bGw/Tjp6ZX0pO2NvbnN0IGc9UCh7bWV0aG9kOmUsaGVhZGVyczpkLGJvZHk6eX0sYyk7bGV0IGI9bixtPWc7aWYoZil7Y29uc3Qgdj15aWVsZCBQcm9taXNlLnJlc29sdmUoZihVZShQKHt9LGcpLHt1cmw6bixvcGVyYXRpb25OYW1lOnMsdmFyaWFibGVzOnJ9KSkpLHt1cmw6a309dix3PXZlKHYsWyJ1cmwiXSk7Yj1rLG09d31yZXR1cm4gdSYmKGI9YCR7Yn0/JHt1fWApLHlpZWxkIG8oYixtKX0pO2NsYXNzIGNye2NvbnN0cnVjdG9yKHQsbj17fSl7dGhpcy51cmw9dCx0aGlzLnJlcXVlc3RDb25maWc9bix0aGlzLnJhd1JlcXVlc3Q9KC4uLmkpPT5YKHRoaXMsbnVsbCxmdW5jdGlvbiooKXtjb25zdFtyLHMsb109aSxjPW1uKHIscyxvKSx2PXRoaXMucmVxdWVzdENvbmZpZyx7aGVhZGVyczpmLGZldGNoOmQ9TGUsbWV0aG9kOnU9IlBPU1QiLHJlcXVlc3RNaWRkbGV3YXJlOnkscmVzcG9uc2VNaWRkbGV3YXJlOmd9PXYsYj12ZSh2LFsiaGVhZGVycyIsImZldGNoIiwibWV0aG9kIiwicmVxdWVzdE1pZGRsZXdhcmUiLCJyZXNwb25zZU1pZGRsZXdhcmUiXSkse3VybDptfT10aGlzO2Muc2lnbmFsIT09dm9pZCAwJiYoYi5zaWduYWw9Yy5zaWduYWwpO2NvbnN0e29wZXJhdGlvbk5hbWU6Tn09S2UoYy5xdWVyeSk7cmV0dXJuIHR0KHt1cmw6bSxxdWVyeTpjLnF1ZXJ5LHZhcmlhYmxlczpjLnZhcmlhYmxlcyxoZWFkZXJzOlAoUCh7fSxkZShudChmKSkpLGRlKGMucmVxdWVzdEhlYWRlcnMpKSxvcGVyYXRpb25OYW1lOk4sZmV0Y2g6ZCxtZXRob2Q6dSxmZXRjaE9wdGlvbnM6YixtaWRkbGV3YXJlOnl9KS50aGVuKEU9PihnJiZnKEUpLEUpKS5jYXRjaChFPT57dGhyb3cgZyYmZyhFKSxFfSl9KX1yZXF1ZXN0KHQsLi4ubil7cmV0dXJuIFgodGhpcyxudWxsLGZ1bmN0aW9uKigpe2NvbnN0W2kscl09bixzPXBuKHQsaSxyKSxOPXRoaXMucmVxdWVzdENvbmZpZyx7aGVhZGVyczpvLGZldGNoOmM9TGUsbWV0aG9kOmY9IlBPU1QiLHJlcXVlc3RNaWRkbGV3YXJlOmQscmVzcG9uc2VNaWRkbGV3YXJlOnV9PU4seT12ZShOLFsiaGVhZGVycyIsImZldGNoIiwibWV0aG9kIiwicmVxdWVzdE1pZGRsZXdhcmUiLCJyZXNwb25zZU1pZGRsZXdhcmUiXSkse3VybDpnfT10aGlzO3Muc2lnbmFsIT09dm9pZCAwJiYoeS5zaWduYWw9cy5zaWduYWwpO2NvbnN0e3F1ZXJ5OmIsb3BlcmF0aW9uTmFtZTptfT1LZShzLmRvY3VtZW50KTtyZXR1cm4gdHQoe3VybDpnLHF1ZXJ5OmIsdmFyaWFibGVzOnMudmFyaWFibGVzLGhlYWRlcnM6UChQKHt9LGRlKG50KG8pKSksZGUocy5yZXF1ZXN0SGVhZGVycykpLG9wZXJhdGlvbk5hbWU6bSxmZXRjaDpjLG1ldGhvZDpmLGZldGNoT3B0aW9uczp5LG1pZGRsZXdhcmU6ZH0pLnRoZW4odj0+KHUmJnUodiksdi5kYXRhKSkuY2F0Y2godj0+e3Rocm93IHUmJnUodiksdn0pfSl9YmF0Y2hSZXF1ZXN0cyh0LG4pe3ZhciBkO2NvbnN0IGk9eW4odCxuKSxmPXRoaXMucmVxdWVzdENvbmZpZyx7aGVhZGVyczpyfT1mLHM9dmUoZixbImhlYWRlcnMiXSk7aS5zaWduYWwhPT12b2lkIDAmJihzLnNpZ25hbD1pLnNpZ25hbCk7Y29uc3Qgbz1pLmRvY3VtZW50cy5tYXAoKHtkb2N1bWVudDp1fSk9PktlKHUpLnF1ZXJ5KSxjPWkuZG9jdW1lbnRzLm1hcCgoe3ZhcmlhYmxlczp1fSk9PnUpO3JldHVybiB0dCh7dXJsOnRoaXMudXJsLHF1ZXJ5Om8sdmFyaWFibGVzOmMsaGVhZGVyczpQKFAoe30sZGUobnQocikpKSxkZShpLnJlcXVlc3RIZWFkZXJzKSksb3BlcmF0aW9uTmFtZTp2b2lkIDAsZmV0Y2g6KGQ9dGhpcy5yZXF1ZXN0Q29uZmlnLmZldGNoKSE9bnVsbD9kOkxlLG1ldGhvZDp0aGlzLnJlcXVlc3RDb25maWcubWV0aG9kfHwiUE9TVCIsZmV0Y2hPcHRpb25zOnMsbWlkZGxld2FyZTp0aGlzLnJlcXVlc3RDb25maWcucmVxdWVzdE1pZGRsZXdhcmV9KS50aGVuKHU9Pih0aGlzLnJlcXVlc3RDb25maWcucmVzcG9uc2VNaWRkbGV3YXJlJiZ0aGlzLnJlcXVlc3RDb25maWcucmVzcG9uc2VNaWRkbGV3YXJlKHUpLHUuZGF0YSkpLmNhdGNoKHU9Pnt0aHJvdyB0aGlzLnJlcXVlc3RDb25maWcucmVzcG9uc2VNaWRkbGV3YXJlJiZ0aGlzLnJlcXVlc3RDb25maWcucmVzcG9uc2VNaWRkbGV3YXJlKHUpLHV9KX1zZXRIZWFkZXJzKHQpe3JldHVybiB0aGlzLnJlcXVlc3RDb25maWcuaGVhZGVycz10LHRoaXN9c2V0SGVhZGVyKHQsbil7Y29uc3R7aGVhZGVyczppfT10aGlzLnJlcXVlc3RDb25maWc7cmV0dXJuIGk/aVt0XT1uOnRoaXMucmVxdWVzdENvbmZpZy5oZWFkZXJzPXtbdF06bn0sdGhpc31zZXRFbmRwb2ludCh0KXtyZXR1cm4gdGhpcy51cmw9dCx0aGlzfX1jb25zdCB0dD1lPT5YKHRoaXMsbnVsbCxmdW5jdGlvbiooKXt2YXIgdSx5O2NvbnN0e3F1ZXJ5OnQsdmFyaWFibGVzOm4sZmV0Y2hPcHRpb25zOml9PWUscj1hcihobigodT1lLm1ldGhvZCkhPW51bGw/dToicG9zdCIpKSxzPUFycmF5LmlzQXJyYXkoZS5xdWVyeSksbz15aWVsZCByKGUpLGM9eWllbGQgbHIobywoeT1pLmpzb25TZXJpYWxpemVyKSE9bnVsbD95OnplKSxmPUFycmF5LmlzQXJyYXkoYyk/IWMuc29tZSgoe2RhdGE6Yn0pPT4hYik6ISFjLmRhdGEsZD1BcnJheS5pc0FycmF5KGMpfHwhYy5lcnJvcnN8fEFycmF5LmlzQXJyYXkoYy5lcnJvcnMpJiYhYy5lcnJvcnMubGVuZ3RofHxpLmVycm9yUG9saWN5PT09ImFsbCJ8fGkuZXJyb3JQb2xpY3k9PT0iaWdub3JlIjtpZihvLm9rJiZkJiZmKXtjb25zdCBnPShBcnJheS5pc0FycmF5KGMpLGMpLHtlcnJvcnM6Yn09ZyxtPXZlKGcsWyJlcnJvcnMiXSksTj1pLmVycm9yUG9saWN5PT09Imlnbm9yZSI/bTpjO3JldHVybiBVZShQKHt9LHM/e2RhdGE6Tn06Tikse2hlYWRlcnM6by5oZWFkZXJzLHN0YXR1czpvLnN0YXR1c30pfWVsc2V7Y29uc3QgYj10eXBlb2YgYz09InN0cmluZyI/e2Vycm9yOmN9OmM7dGhyb3cgbmV3IGhlKFVlKFAoe30sYikse3N0YXR1czpvLnN0YXR1cyxoZWFkZXJzOm8uaGVhZGVyc30pLHtxdWVyeTp0LHZhcmlhYmxlczpufSl9fSksdXI9KGUsdCxuLGkpPT57Y29uc3Qgcj1pIT1udWxsP2k6emU7aWYoIUFycmF5LmlzQXJyYXkoZSkpcmV0dXJuIHIuc3RyaW5naWZ5KHtxdWVyeTplLHZhcmlhYmxlczp0LG9wZXJhdGlvbk5hbWU6bn0pO2lmKHR5cGVvZiB0IT0idW5kZWZpbmVkIiYmIUFycmF5LmlzQXJyYXkodCkpdGhyb3cgbmV3IEVycm9yKCJDYW5ub3QgY3JlYXRlIHJlcXVlc3QgYm9keSB3aXRoIGdpdmVuIHZhcmlhYmxlIHR5cGUsIGFycmF5IGV4cGVjdGVkIik7Y29uc3Qgcz1lLnJlZHVjZSgobyxjLGYpPT4oby5wdXNoKHtxdWVyeTpjLHZhcmlhYmxlczp0P3RbZl06dm9pZCAwfSksbyksW10pO3JldHVybiByLnN0cmluZ2lmeShzKX0sbHI9KGUsdCk9PlgodGhpcyxudWxsLGZ1bmN0aW9uKigpe2xldCBuO3JldHVybiBlLmhlYWRlcnMuZm9yRWFjaCgoaSxyKT0+e3IudG9Mb3dlckNhc2UoKT09PSJjb250ZW50LXR5cGUiJiYobj1pKX0pLG4mJihuLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgiYXBwbGljYXRpb24vanNvbiIpfHxuLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgiYXBwbGljYXRpb24vZ3JhcGhxbCtqc29uIil8fG4udG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCJhcHBsaWNhdGlvbi9ncmFwaHFsLXJlc3BvbnNlK2pzb24iKSk/dC5wYXJzZSh5aWVsZCBlLnRleHQoKSk6ZS50ZXh0KCl9KSxudD1lPT50eXBlb2YgZT09ImZ1bmN0aW9uIj9lKCk6ZTt2YXIgcnQ9e2V4cG9ydHM6e319OyhmdW5jdGlvbihlLHQpe3Q9ZS5leHBvcnRzPW4sdC5nZXRTZXJpYWxpemU9aTtmdW5jdGlvbiBuKHIscyxvLGMpe3JldHVybiBKU09OLnN0cmluZ2lmeShyLGkocyxjKSxvKX1mdW5jdGlvbiBpKHIscyl7dmFyIG89W10sYz1bXTtyZXR1cm4gcz09bnVsbCYmKHM9ZnVuY3Rpb24oZixkKXtyZXR1cm4gb1swXT09PWQ/IltDaXJjdWxhciB+XSI6IltDaXJjdWxhciB+LiIrYy5zbGljZSgwLG8uaW5kZXhPZihkKSkuam9pbigiLiIpKyJdIn0pLGZ1bmN0aW9uKGYsZCl7aWYoby5sZW5ndGg+MCl7dmFyIHU9by5pbmRleE9mKHRoaXMpO351P28uc3BsaWNlKHUrMSk6by5wdXNoKHRoaXMpLH51P2Muc3BsaWNlKHUsMS8wLGYpOmMucHVzaChmKSx+by5pbmRleE9mKGQpJiYoZD1zLmNhbGwodGhpcyxmLGQpKX1lbHNlIG8ucHVzaChkKTtyZXR1cm4gcj09bnVsbD9kOnIuY2FsbCh0aGlzLGYsZCl9fX0pKHJ0LHJ0LmV4cG9ydHMpO3ZhciBmcj1ydC5leHBvcnRzLHBlPUZ0KGZyKTtjb25zdCAkdD0xZTMqMTU7dmFyIFBlPWZ1bmN0aW9uKCl7cmV0dXJuIFBlPU9iamVjdC5hc3NpZ258fGZ1bmN0aW9uKHQpe2Zvcih2YXIgbixpPTEscj1hcmd1bWVudHMubGVuZ3RoO2k8cjtpKyspe249YXJndW1lbnRzW2ldO2Zvcih2YXIgcyBpbiBuKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuLHMpJiYodFtzXT1uW3NdKX1yZXR1cm4gdH0sUGUuYXBwbHkodGhpcyxhcmd1bWVudHMpfTt0eXBlb2YgU3VwcHJlc3NlZEVycm9yPT0iZnVuY3Rpb24iJiZTdXBwcmVzc2VkRXJyb3I7dmFyIEZlPW5ldyBNYXAsaXQ9bmV3IE1hcCxNdD0hMCxCZT0hMTtmdW5jdGlvbiBVdChlKXtyZXR1cm4gZS5yZXBsYWNlKC9bXHMsXSsvZywiICIpLnRyaW0oKX1mdW5jdGlvbiBocihlKXtyZXR1cm4gVXQoZS5zb3VyY2UuYm9keS5zdWJzdHJpbmcoZS5zdGFydCxlLmVuZCkpfWZ1bmN0aW9uIGRyKGUpe3ZhciB0PW5ldyBTZXQsbj1bXTtyZXR1cm4gZS5kZWZpbml0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGkpe2lmKGkua2luZD09PSJGcmFnbWVudERlZmluaXRpb24iKXt2YXIgcj1pLm5hbWUudmFsdWUscz1ocihpLmxvYyksbz1pdC5nZXQocik7byYmIW8uaGFzKHMpP010JiZjb25zb2xlLndhcm4oIldhcm5pbmc6IGZyYWdtZW50IHdpdGggbmFtZSAiK3IrYCBhbHJlYWR5IGV4aXN0cy4KZ3JhcGhxbC10YWcgZW5mb3JjZXMgYWxsIGZyYWdtZW50IG5hbWVzIGFjcm9zcyB5b3VyIGFwcGxpY2F0aW9uIHRvIGJlIHVuaXF1ZTsgcmVhZCBtb3JlIGFib3V0CnRoaXMgaW4gdGhlIGRvY3M6IGh0dHA6Ly9kZXYuYXBvbGxvZGF0YS5jb20vY29yZS9mcmFnbWVudHMuaHRtbCN1bmlxdWUtbmFtZXNgKTpvfHxpdC5zZXQocixvPW5ldyBTZXQpLG8uYWRkKHMpLHQuaGFzKHMpfHwodC5hZGQocyksbi5wdXNoKGkpKX1lbHNlIG4ucHVzaChpKX0pLFBlKFBlKHt9LGUpLHtkZWZpbml0aW9uczpufSl9ZnVuY3Rpb24gcHIoZSl7dmFyIHQ9bmV3IFNldChlLmRlZmluaXRpb25zKTt0LmZvckVhY2goZnVuY3Rpb24oaSl7aS5sb2MmJmRlbGV0ZSBpLmxvYyxPYmplY3Qua2V5cyhpKS5mb3JFYWNoKGZ1bmN0aW9uKHIpe3ZhciBzPWlbcl07cyYmdHlwZW9mIHM9PSJvYmplY3QiJiZ0LmFkZChzKX0pfSk7dmFyIG49ZS5sb2M7cmV0dXJuIG4mJihkZWxldGUgbi5zdGFydFRva2VuLGRlbGV0ZSBuLmVuZFRva2VuKSxlfWZ1bmN0aW9uIG1yKGUpe3ZhciB0PVV0KGUpO2lmKCFGZS5oYXModCkpe3ZhciBuPWt0KGUse2V4cGVyaW1lbnRhbEZyYWdtZW50VmFyaWFibGVzOkJlLGFsbG93TGVnYWN5RnJhZ21lbnRWYXJpYWJsZXM6QmV9KTtpZighbnx8bi5raW5kIT09IkRvY3VtZW50Iil0aHJvdyBuZXcgRXJyb3IoIk5vdCBhIHZhbGlkIEdyYXBoUUwgZG9jdW1lbnQuIik7RmUuc2V0KHQscHIoZHIobikpKX1yZXR1cm4gRmUuZ2V0KHQpfWZ1bmN0aW9uIFcoZSl7Zm9yKHZhciB0PVtdLG49MTtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXRbbi0xXT1hcmd1bWVudHNbbl07dHlwZW9mIGU9PSJzdHJpbmciJiYoZT1bZV0pO3ZhciBpPWVbMF07cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbihyLHMpe3ImJnIua2luZD09PSJEb2N1bWVudCI/aSs9ci5sb2Muc291cmNlLmJvZHk6aSs9cixpKz1lW3MrMV19KSxtcihpKX1mdW5jdGlvbiB5cigpe0ZlLmNsZWFyKCksaXQuY2xlYXIoKX1mdW5jdGlvbiB2cigpe010PSExfWZ1bmN0aW9uIGdyKCl7QmU9ITB9ZnVuY3Rpb24gRXIoKXtCZT0hMX12YXIgQWU9e2dxbDpXLHJlc2V0Q2FjaGVzOnlyLGRpc2FibGVGcmFnbWVudFdhcm5pbmdzOnZyLGVuYWJsZUV4cGVyaW1lbnRhbEZyYWdtZW50VmFyaWFibGVzOmdyLGRpc2FibGVFeHBlcmltZW50YWxGcmFnbWVudFZhcmlhYmxlczpFcn07KGZ1bmN0aW9uKGUpe2UuZ3FsPUFlLmdxbCxlLnJlc2V0Q2FjaGVzPUFlLnJlc2V0Q2FjaGVzLGUuZGlzYWJsZUZyYWdtZW50V2FybmluZ3M9QWUuZGlzYWJsZUZyYWdtZW50V2FybmluZ3MsZS5lbmFibGVFeHBlcmltZW50YWxGcmFnbWVudFZhcmlhYmxlcz1BZS5lbmFibGVFeHBlcmltZW50YWxGcmFnbWVudFZhcmlhYmxlcyxlLmRpc2FibGVFeHBlcmltZW50YWxGcmFnbWVudFZhcmlhYmxlcz1BZS5kaXNhYmxlRXhwZXJpbWVudGFsRnJhZ21lbnRWYXJpYWJsZXN9KShXfHwoVz17fSkpLFcuZGVmYXVsdD1XO3ZhciBWdDsoZnVuY3Rpb24oZSl7ZS5CaWxsaW5nUXVvdGFFeGNlZWRlZD0iQmlsbGluZ1F1b3RhRXhjZWVkZWQifSkoVnR8fChWdD17fSkpO2NvbnN0IF9yPVdgCgltdXRhdGlvbiBQdXNoUGF5bG9hZCgKCQkkc2Vzc2lvbl9zZWN1cmVfaWQ6IFN0cmluZyEKCQkkcGF5bG9hZF9pZDogSUQhCgkJJGV2ZW50czogUmVwbGF5RXZlbnRzSW5wdXQhCgkJJG1lc3NhZ2VzOiBTdHJpbmchCgkJJHJlc291cmNlczogU3RyaW5nIQoJCSR3ZWJfc29ja2V0X2V2ZW50czogU3RyaW5nIQoJCSRlcnJvcnM6IFtFcnJvck9iamVjdElucHV0XSEKCQkkaXNfYmVhY29uOiBCb29sZWFuCgkJJGhhc19zZXNzaW9uX3VubG9hZGVkOiBCb29sZWFuCgkJJGhpZ2hsaWdodF9sb2dzOiBTdHJpbmcKCSkgewoJCXB1c2hQYXlsb2FkKAoJCQlzZXNzaW9uX3NlY3VyZV9pZDogJHNlc3Npb25fc2VjdXJlX2lkCgkJCXBheWxvYWRfaWQ6ICRwYXlsb2FkX2lkCgkJCWV2ZW50czogJGV2ZW50cwoJCQltZXNzYWdlczogJG1lc3NhZ2VzCgkJCXJlc291cmNlczogJHJlc291cmNlcwoJCQl3ZWJfc29ja2V0X2V2ZW50czogJHdlYl9zb2NrZXRfZXZlbnRzCgkJCWVycm9yczogJGVycm9ycwoJCQlpc19iZWFjb246ICRpc19iZWFjb24KCQkJaGFzX3Nlc3Npb25fdW5sb2FkZWQ6ICRoYXNfc2Vzc2lvbl91bmxvYWRlZAoJCQloaWdobGlnaHRfbG9nczogJGhpZ2hsaWdodF9sb2dzCgkJKQoJfQpgLFRyPVdgCgltdXRhdGlvbiBQdXNoUGF5bG9hZENvbXByZXNzZWQoCgkJJHNlc3Npb25fc2VjdXJlX2lkOiBTdHJpbmchCgkJJHBheWxvYWRfaWQ6IElEIQoJCSRkYXRhOiBTdHJpbmchCgkpIHsKCQlwdXNoUGF5bG9hZENvbXByZXNzZWQoCgkJCXNlc3Npb25fc2VjdXJlX2lkOiAkc2Vzc2lvbl9zZWN1cmVfaWQKCQkJcGF5bG9hZF9pZDogJHBheWxvYWRfaWQKCQkJZGF0YTogJGRhdGEKCQkpCgl9CmAsYnI9V2AKCW11dGF0aW9uIGlkZW50aWZ5U2Vzc2lvbigKCQkkc2Vzc2lvbl9zZWN1cmVfaWQ6IFN0cmluZyEKCQkkdXNlcl9pZGVudGlmaWVyOiBTdHJpbmchCgkJJHVzZXJfb2JqZWN0OiBBbnkKCSkgewoJCWlkZW50aWZ5U2Vzc2lvbigKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQl1c2VyX2lkZW50aWZpZXI6ICR1c2VyX2lkZW50aWZpZXIKCQkJdXNlcl9vYmplY3Q6ICR1c2VyX29iamVjdAoJCSkKCX0KYCxOcj1XYAoJbXV0YXRpb24gYWRkU2Vzc2lvblByb3BlcnRpZXMoCgkJJHNlc3Npb25fc2VjdXJlX2lkOiBTdHJpbmchCgkJJHByb3BlcnRpZXNfb2JqZWN0OiBBbnkKCSkgewoJCWFkZFNlc3Npb25Qcm9wZXJ0aWVzKAoJCQlzZXNzaW9uX3NlY3VyZV9pZDogJHNlc3Npb25fc2VjdXJlX2lkCgkJCXByb3BlcnRpZXNfb2JqZWN0OiAkcHJvcGVydGllc19vYmplY3QKCQkpCgl9CmAseHI9V2AKCW11dGF0aW9uIHB1c2hNZXRyaWNzKCRtZXRyaWNzOiBbTWV0cmljSW5wdXRdISkgewoJCXB1c2hNZXRyaWNzKG1ldHJpY3M6ICRtZXRyaWNzKQoJfQpgLEFyPVdgCgltdXRhdGlvbiBhZGRTZXNzaW9uRmVlZGJhY2soCgkJJHNlc3Npb25fc2VjdXJlX2lkOiBTdHJpbmchCgkJJHVzZXJfbmFtZTogU3RyaW5nCgkJJHVzZXJfZW1haWw6IFN0cmluZwoJCSR2ZXJiYXRpbTogU3RyaW5nIQoJCSR0aW1lc3RhbXA6IFRpbWVzdGFtcCEKCSkgewoJCWFkZFNlc3Npb25GZWVkYmFjaygKCQkJc2Vzc2lvbl9zZWN1cmVfaWQ6ICRzZXNzaW9uX3NlY3VyZV9pZAoJCQl1c2VyX25hbWU6ICR1c2VyX25hbWUKCQkJdXNlcl9lbWFpbDogJHVzZXJfZW1haWwKCQkJdmVyYmF0aW06ICR2ZXJiYXRpbQoJCQl0aW1lc3RhbXA6ICR0aW1lc3RhbXAKCQkpCgl9CmAsSXI9V2AKCW11dGF0aW9uIGluaXRpYWxpemVTZXNzaW9uKAoJCSRzZXNzaW9uX3NlY3VyZV9pZDogU3RyaW5nIQoJCSRvcmdhbml6YXRpb25fdmVyYm9zZV9pZDogU3RyaW5nIQoJCSRlbmFibGVfc3RyaWN0X3ByaXZhY3k6IEJvb2xlYW4hCgkJJHByaXZhY3lfc2V0dGluZzogU3RyaW5nIQoJCSRlbmFibGVfcmVjb3JkaW5nX25ldHdvcmtfY29udGVudHM6IEJvb2xlYW4hCgkJJGNsaWVudFZlcnNpb246IFN0cmluZyEKCQkkZmlyc3Rsb2FkVmVyc2lvbjogU3RyaW5nIQoJCSRjbGllbnRDb25maWc6IFN0cmluZyEKCQkkZW52aXJvbm1lbnQ6IFN0cmluZyEKCQkkaWQ6IFN0cmluZyEKCQkkYXBwVmVyc2lvbjogU3RyaW5nCgkJJHNlcnZpY2VOYW1lOiBTdHJpbmchCgkJJGNsaWVudF9pZDogU3RyaW5nIQoJCSRuZXR3b3JrX3JlY29yZGluZ19kb21haW5zOiBbU3RyaW5nIV0KCQkkZGlzYWJsZV9zZXNzaW9uX3JlY29yZGluZzogQm9vbGVhbgoJKSB7CgkJaW5pdGlhbGl6ZVNlc3Npb24oCgkJCXNlc3Npb25fc2VjdXJlX2lkOiAkc2Vzc2lvbl9zZWN1cmVfaWQKCQkJb3JnYW5pemF0aW9uX3ZlcmJvc2VfaWQ6ICRvcmdhbml6YXRpb25fdmVyYm9zZV9pZAoJCQllbmFibGVfc3RyaWN0X3ByaXZhY3k6ICRlbmFibGVfc3RyaWN0X3ByaXZhY3kKCQkJZW5hYmxlX3JlY29yZGluZ19uZXR3b3JrX2NvbnRlbnRzOiAkZW5hYmxlX3JlY29yZGluZ19uZXR3b3JrX2NvbnRlbnRzCgkJCWNsaWVudFZlcnNpb246ICRjbGllbnRWZXJzaW9uCgkJCWZpcnN0bG9hZFZlcnNpb246ICRmaXJzdGxvYWRWZXJzaW9uCgkJCWNsaWVudENvbmZpZzogJGNsaWVudENvbmZpZwoJCQllbnZpcm9ubWVudDogJGVudmlyb25tZW50CgkJCWFwcFZlcnNpb246ICRhcHBWZXJzaW9uCgkJCXNlcnZpY2VOYW1lOiAkc2VydmljZU5hbWUKCQkJZmluZ2VycHJpbnQ6ICRpZAoJCQljbGllbnRfaWQ6ICRjbGllbnRfaWQKCQkJbmV0d29ya19yZWNvcmRpbmdfZG9tYWluczogJG5ldHdvcmtfcmVjb3JkaW5nX2RvbWFpbnMKCQkJZGlzYWJsZV9zZXNzaW9uX3JlY29yZGluZzogJGRpc2FibGVfc2Vzc2lvbl9yZWNvcmRpbmcKCQkJcHJpdmFjeV9zZXR0aW5nOiAkcHJpdmFjeV9zZXR0aW5nCgkJKSB7CgkJCXNlY3VyZV9pZAoJCQlwcm9qZWN0X2lkCgkJfQoJfQpgLE9yPVdgCglxdWVyeSBJZ25vcmUoJGlkOiBJRCEpIHsKCQlpZ25vcmUoaWQ6ICRpZCkKCX0KYCxTcj0oZSx0LG4saSk9PmUoKTtmdW5jdGlvbiB3cihlLHQ9U3Ipe3JldHVybntQdXNoUGF5bG9hZChuLGkpe3JldHVybiB0KHI9PmUucmVxdWVzdChfcixuLFAoUCh7fSxpKSxyKSksIlB1c2hQYXlsb2FkIiwibXV0YXRpb24iLG4pfSxQdXNoUGF5bG9hZENvbXByZXNzZWQobixpKXtyZXR1cm4gdChyPT5lLnJlcXVlc3QoVHIsbixQKFAoe30saSkscikpLCJQdXNoUGF5bG9hZENvbXByZXNzZWQiLCJtdXRhdGlvbiIsbil9LGlkZW50aWZ5U2Vzc2lvbihuLGkpe3JldHVybiB0KHI9PmUucmVxdWVzdChicixuLFAoUCh7fSxpKSxyKSksImlkZW50aWZ5U2Vzc2lvbiIsIm11dGF0aW9uIixuKX0sYWRkU2Vzc2lvblByb3BlcnRpZXMobixpKXtyZXR1cm4gdChyPT5lLnJlcXVlc3QoTnIsbixQKFAoe30saSkscikpLCJhZGRTZXNzaW9uUHJvcGVydGllcyIsIm11dGF0aW9uIixuKX0scHVzaE1ldHJpY3MobixpKXtyZXR1cm4gdChyPT5lLnJlcXVlc3QoeHIsbixQKFAoe30saSkscikpLCJwdXNoTWV0cmljcyIsIm11dGF0aW9uIixuKX0sYWRkU2Vzc2lvbkZlZWRiYWNrKG4saSl7cmV0dXJuIHQocj0+ZS5yZXF1ZXN0KEFyLG4sUChQKHt9LGkpLHIpKSwiYWRkU2Vzc2lvbkZlZWRiYWNrIiwibXV0YXRpb24iLG4pfSxpbml0aWFsaXplU2Vzc2lvbihuLGkpe3JldHVybiB0KHI9PmUucmVxdWVzdChJcixuLFAoUCh7fSxpKSxyKSksImluaXRpYWxpemVTZXNzaW9uIiwibXV0YXRpb24iLG4pfSxJZ25vcmUobixpKXtyZXR1cm4gdChyPT5lLnJlcXVlc3QoT3IsbixQKFAoe30saSkscikpLCJJZ25vcmUiLCJxdWVyeSIsbil9fX1jbGFzcyBEcntjb25zdHJ1Y3Rvcih0LG4pe2x0KHRoaXMsImRlYnVnIik7bHQodGhpcywibmFtZSIpO3RoaXMuZGVidWc9dCx0aGlzLm5hbWU9bn1sb2coLi4udCl7aWYodGhpcy5kZWJ1Zyl7bGV0IG49YFske0RhdGUubm93KCl9XWA7dGhpcy5uYW1lJiYobis9YCAtICR7dGhpcy5uYW1lfWApLGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsW24sLi4udF0pfX19dmFyIHN0OyhmdW5jdGlvbihlKXtlLkJpbGxpbmdRdW90YUV4Y2VlZGVkPSJCaWxsaW5nUXVvdGFFeGNlZWRlZCJ9KShzdHx8KHN0PXt9KSk7Y29uc3QgQ3I9MTAsa3I9MWUzLFJyPTUwMCxMcj1bc3QuQmlsbGluZ1F1b3RhRXhjZWVkZWQudG9TdHJpbmcoKV0sUHI9ZT0+e3ZhciBuO3JldHVybigobj1lLnJlc3BvbnNlLmVycm9ycyk9PW51bGw/dm9pZCAwOm4uZmluZChpPT5Mci5pbmNsdWRlcyhpLm1lc3NhZ2UpKSk9PT12b2lkIDB9LEZyPWU9Pntjb25zdCB0PShuLGkscixzLG89MCk9PlgodGhpcyxudWxsLGZ1bmN0aW9uKigpe3RyeXtyZXR1cm4geWllbGQgbigpfWNhdGNoKGMpe2lmKGMgaW5zdGFuY2VvZiBoZSYmIVByKGMpKXRocm93IGM7aWYobzxDcilyZXR1cm4geWllbGQgbmV3IFByb21pc2UoZj0+c2V0VGltZW91dChmLGtyK1JyKk1hdGgucG93KDIsbykpKSx5aWVsZCB0KG4saSxyLHMsbysxKTt0aHJvdyBjb25zb2xlLmVycm9yKGBoaWdobGlnaHQuaW86IFske2V8fGV9XSBkYXRhIHJlcXVlc3QgZmFpbGVkIGFmdGVyICR7b30gcmV0cmllc2ApLGN9fSk7cmV0dXJuIHR9LGp0PTUscXQ9MmUzLEJyPVsibnVtYmVyIiwic3RyaW5nIiwiYm9vbGVhbiJdO3ZhciBaOyhmdW5jdGlvbihlKXtlW2UuSW5pdGlhbGl6ZT0wXT0iSW5pdGlhbGl6ZSIsZVtlLkFzeW5jRXZlbnRzPTFdPSJBc3luY0V2ZW50cyIsZVtlLklkZW50aWZ5PTJdPSJJZGVudGlmeSIsZVtlLlByb3BlcnRpZXM9M109IlByb3BlcnRpZXMiLGVbZS5NZXRyaWNzPTRdPSJNZXRyaWNzIixlW2UuRmVlZGJhY2s9NV09IkZlZWRiYWNrIixlW2UuQ3VzdG9tRXZlbnQ9Nl09IkN1c3RvbUV2ZW50IixlW2UuU3RvcD03XT0iU3RvcCJ9KShafHwoWj17fSkpO2Z1bmN0aW9uICRyKGUpe3JldHVybiBYKHRoaXMsbnVsbCxmdW5jdGlvbiooKXtjb25zdCB0PXlpZWxkIG5ldyBQcm9taXNlKG49Pntjb25zdCBpPW5ldyBGaWxlUmVhZGVyO2kub25sb2FkPSgpPT5uKGkucmVzdWx0KSxpLnJlYWRBc0RhdGFVUkwobmV3IEJsb2IoW2VdKSl9KTtyZXR1cm4gdC5zbGljZSh0LmluZGV4T2YoIiwiKSsxKX0pfWNvbnN0ICRlPXNlbGY7ZnVuY3Rpb24gR3QoZSx0KXtjb25zdCBuPXt9LGk9W10scj1bXTtmb3IoY29uc3RbcyxvXW9mIE9iamVjdC5lbnRyaWVzKGUpKXtpZihvPT1udWxsKWNvbnRpbnVlO0JyLmluY2x1ZGVzKHR5cGVvZiBvKXx8aS5wdXNoKHtbc106b30pO2xldCBjO3R5cGVvZiBvPT0ic3RyaW5nIj9jPW86Yz1wZShvKSxjLmxlbmd0aD5xdCYmKHIucHVzaCh7W3NdOm99KSxjPWMuc3Vic3RyaW5nKDAscXQpKSxuW3NdPWN9cmV0dXJuIHQhPT0ic2Vzc2lvbiImJihpLmxlbmd0aD4wJiZjb25zb2xlLndhcm4oYEhpZ2hsaWdodCB3YXMgcGFzc2VkIG9uZSBvciBtb3JlICR7dH0gcHJvcGVydGllcyBub3Qgb2YgdHlwZSBzdHJpbmcsIG51bWJlciwgb3IgYm9vbGVhbi5gLGkpLHIubGVuZ3RoPjAmJmNvbnNvbGUud2FybihgSGlnaGxpZ2h0IHdhcyBwYXNzZWQgb25lIG9yIG1vcmUgJHt0fSBwcm9wZXJ0aWVzIGV4Y2VlZGluZyAyMDAwIGNoYXJhY3RlcnMsIHdoaWNoIHdpbGwgYmUgdHJ1bmNhdGVkLmAscikpLG59e2xldCBlLHQsbixpPTAscj0wLHM9ITEsbz0wLGM9bmV3IERyKCExLCJbd29ya2VyXSIpO2NvbnN0IGY9W10sZD0oKT0+byE9PTAmJmk8anQmJiEhKG4hPW51bGwmJm4ubGVuZ3RoKSx1PSh2LEUpPT57JGUucG9zdE1lc3NhZ2Uoe3Jlc3BvbnNlOnt0eXBlOlouQ3VzdG9tRXZlbnQsdGFnOnYscGF5bG9hZDpFfX0pfSx5PXY9PlgodGhpcyxudWxsLGZ1bmN0aW9uKigpe2NvbnN0e2lkOkUsZXZlbnRzOmssbWVzc2FnZXM6dyxlcnJvcnM6TCxyZXNvdXJjZXNTdHJpbmc6JCx3ZWJTb2NrZXRFdmVudHNTdHJpbmc6cSxoYXNTZXNzaW9uVW5sb2FkZWQ6TSxoaWdobGlnaHRMb2dzOkl9PXYsTz1wZSh7bWVzc2FnZXM6d30pO2xldCBqPXtzZXNzaW9uX3NlY3VyZV9pZDpuLHBheWxvYWRfaWQ6RS50b1N0cmluZygpLGV2ZW50czp7ZXZlbnRzOmt9LG1lc3NhZ2VzOk8scmVzb3VyY2VzOiQsd2ViX3NvY2tldF9ldmVudHM6cSxlcnJvcnM6TCxpc19iZWFjb246ITEsaGFzX3Nlc3Npb25fdW5sb2FkZWQ6TX07SSYmKGouaGlnaGxpZ2h0X2xvZ3M9SSk7Y29uc3QgVT1mbihKU09OLnN0cmluZ2lmeShqKSksSD1jbihVKSxRPXlpZWxkICRyKEgpLGE9e3R5cGU6Wi5Bc3luY0V2ZW50cyxpZDpFLGV2ZW50c1NpemU6VS5sZW5ndGgsY29tcHJlc3NlZFNpemU6US5sZW5ndGh9O2MubG9nKGBQdXNoaW5nIHBheWxvYWQ6ICR7SlNPTi5zdHJpbmdpZnkoe3Nlc3Npb25TZWN1cmVJRDpuLGlkOkUsZmlyc3RTSUQ6TWF0aC5taW4oLi4uai5ldmVudHMuZXZlbnRzLm1hcCh4PT54PT1udWxsP3ZvaWQgMDp4Ll9zaWQpLmZpbHRlcih4PT4hIXgpKSxldmVudHNMZW5ndGg6ai5ldmVudHMuZXZlbnRzLmxlbmd0aCxtZXNzYWdlc0xlbmd0aDp3Lmxlbmd0aCxyZXNvdXJjZXNMZW5ndGg6JC5sZW5ndGgsd2ViU29ja2V0TGVuZ3RoOnEubGVuZ3RoLGVycm9yc0xlbmd0aDpMLmxlbmd0aCxidWZMZW5ndGg6VS5sZW5ndGgsY29tcHJlc3NlZExlbmd0aDpILmxlbmd0aCxjb21wcmVzc2VkQmFzZTY0TGVuZ3RoOlEubGVuZ3RofSx2b2lkIDAsMil9YCk7Y29uc3QgaD1lLlB1c2hQYXlsb2FkQ29tcHJlc3NlZCh7c2Vzc2lvbl9zZWN1cmVfaWQ6bixwYXlsb2FkX2lkOkUudG9TdHJpbmcoKSxkYXRhOlF9KTtsZXQgXz1Qcm9taXNlLnJlc29sdmUoKTtmLmxlbmd0aCYmKF89ZS5wdXNoTWV0cmljcyh7bWV0cmljczpmfSksZi5zcGxpY2UoMCkpO2xldCBBPXBlcmZvcm1hbmNlLm5vdygpO2NvbnN0IFI9c2V0SW50ZXJ2YWwoKCk9PntBJiZwZXJmb3JtYW5jZS5ub3coKS1BPiR0JiYoY29uc29sZS53YXJuKGBVcGxvYWRpbmcgcHVzaFBheWxvYWQgdG9vayB0b28gbG9uZywgZmFpbHVyZSBudW1iZXIgIyR7cn0uYCkscis9MSxjbGVhckludGVydmFsKFIpLHI+PWp0JiYoY29uc29sZS53YXJuKCJVcGxvYWRpbmcgcHVzaFBheWxvYWQgdG9vayB0b28gbG9uZywgc3RvcHBpbmcgcmVjb3JkaW5nIHRvIGF2b2lkIE9PTS4iKSwkZS5wb3N0TWVzc2FnZSh7cmVzcG9uc2U6e3R5cGU6Wi5TdG9wLHJlcXVlc3RTdGFydDpBLGFzeW5jRXZlbnRzUmVzcG9uc2U6YX19KSxiKHt0eXBlOlouUHJvcGVydGllcyxwcm9wZXJ0aWVzT2JqZWN0OntzdG9wUmVhc29uOiJQdXNoIFBheWxvYWQgVGltZW91dCJ9LHByb3BlcnR5VHlwZTp7dHlwZToidHJhY2sifX0pKSl9LDEwMCk7dHJ5e3lpZWxkIFByb21pc2UuYWxsKFtoLF9dKSxyJiZwZXJmb3JtYW5jZS5ub3coKS1BPD0kdCYmKGNvbnNvbGUud2FybihgcHVzaFBheWxvYWQgc3VjY2VlZGVkIGFmdGVyICMke3J9IGZhaWx1cmVzLCByZXNldHRpbmcgc3RvcCBzd2l0Y2guYCkscj0wKX1maW5hbGx5e0E9MCxjbGVhckludGVydmFsKFIpfSRlLnBvc3RNZXNzYWdlKHtyZXNwb25zZTphfSl9KSxnPXY9PlgodGhpcyxudWxsLGZ1bmN0aW9uKigpe2NvbnN0e3VzZXJPYmplY3Q6RSx1c2VySWRlbnRpZmllcjprLHNvdXJjZTp3fT12O3c9PT0ic2VnbWVudCI/dSgiU2VnbWVudCBJZGVudGlmeSIscGUoUCh7dXNlcklkZW50aWZpZXI6a30sRSkpKTp1KCJJZGVudGlmeSIscGUoUCh7dXNlcklkZW50aWZpZXI6a30sRSkpKSx5aWVsZCBlLmlkZW50aWZ5U2Vzc2lvbih7c2Vzc2lvbl9zZWN1cmVfaWQ6bix1c2VyX2lkZW50aWZpZXI6ayx1c2VyX29iamVjdDpHdChFLCJ1c2VyIil9KTtjb25zdCBMPXc9PT0ic2VnbWVudCI/dzoiZGVmYXVsdCI7Yy5sb2coYElkZW50aWZ5ICgke2t9LCBzb3VyY2U6ICR7TH0pIHcvIG9iajogJHtwZShFKX0gQCAke3R9YCl9KSxiPXY9PlgodGhpcyxudWxsLGZ1bmN0aW9uKigpe2NvbnN0e3Byb3BlcnRpZXNPYmplY3Q6RSxwcm9wZXJ0eVR5cGU6a309djtsZXQgdzsoaz09bnVsbD92b2lkIDA6ay50eXBlKT09PSJzZXNzaW9uIj8odz0iU2Vzc2lvbiIseWllbGQgZS5hZGRTZXNzaW9uUHJvcGVydGllcyh7c2Vzc2lvbl9zZWN1cmVfaWQ6bixwcm9wZXJ0aWVzX29iamVjdDpHdChFLCJzZXNzaW9uIil9KSk6KGs9PW51bGw/dm9pZCAwOmsuc291cmNlKT09PSJzZWdtZW50Ij93PSJTZWdtZW50Ijp3PSJUcmFjayIsdyE9PSJTZXNzaW9uIiYmdSh3LHBlKEUpKSxjLmxvZyhgQWRkaW5nICR7d30gUHJvcGVydGllcyB0byBzZXNzaW9uICgke259KSB3LyBvYmo6ICR7SlNPTi5zdHJpbmdpZnkoRSl9IEAgJHt0fWApfSksbT12PT5YKHRoaXMsbnVsbCxmdW5jdGlvbiooKXtmLnB1c2goLi4udi5tZXRyaWNzLm1hcChFPT4oe25hbWU6RS5uYW1lLHZhbHVlOkUudmFsdWUsc2Vzc2lvbl9zZWN1cmVfaWQ6bixjYXRlZ29yeTpFLmNhdGVnb3J5LGdyb3VwOkUuZ3JvdXAsdGltZXN0YW1wOkUudGltZXN0YW1wLnRvSVNPU3RyaW5nKCksdGFnczpFLnRhZ3N9KSkpfSksTj12PT5YKHRoaXMsbnVsbCxmdW5jdGlvbiooKXtjb25zdHt0aW1lc3RhbXA6RSx2ZXJiYXRpbTprLHVzZXJFbWFpbDp3LHVzZXJOYW1lOkx9PXY7eWllbGQgZS5hZGRTZXNzaW9uRmVlZGJhY2soe3Nlc3Npb25fc2VjdXJlX2lkOm4sdGltZXN0YW1wOkUsdmVyYmF0aW06ayx1c2VyX2VtYWlsOncsdXNlcl9uYW1lOkx9KX0pOyRlLm9ubWVzc2FnZT1mdW5jdGlvbih2KXtyZXR1cm4gWCh0aGlzLG51bGwsZnVuY3Rpb24qKCl7aWYodi5kYXRhLm1lc3NhZ2UudHlwZT09PVouSW5pdGlhbGl6ZSl7dD12LmRhdGEubWVzc2FnZS5iYWNrZW5kLG49di5kYXRhLm1lc3NhZ2Uuc2Vzc2lvblNlY3VyZUlELHM9di5kYXRhLm1lc3NhZ2UuZGVidWcsbz12LmRhdGEubWVzc2FnZS5yZWNvcmRpbmdTdGFydFRpbWUsYy5kZWJ1Zz1zLGU9d3IobmV3IGNyKHQse2hlYWRlcnM6e319KSxGcihuKSk7cmV0dXJufWlmKGQoKSl0cnl7di5kYXRhLm1lc3NhZ2UudHlwZT09PVouQXN5bmNFdmVudHM/eWllbGQgeSh2LmRhdGEubWVzc2FnZSk6di5kYXRhLm1lc3NhZ2UudHlwZT09PVouSWRlbnRpZnk/eWllbGQgZyh2LmRhdGEubWVzc2FnZSk6di5kYXRhLm1lc3NhZ2UudHlwZT09PVouUHJvcGVydGllcz95aWVsZCBiKHYuZGF0YS5tZXNzYWdlKTp2LmRhdGEubWVzc2FnZS50eXBlPT09Wi5NZXRyaWNzP3lpZWxkIG0odi5kYXRhLm1lc3NhZ2UpOnYuZGF0YS5tZXNzYWdlLnR5cGU9PT1aLkZlZWRiYWNrJiYoeWllbGQgTih2LmRhdGEubWVzc2FnZSkpLGk9MH1jYXRjaChFKXtzJiZjb25zb2xlLmVycm9yKEUpLGkrPTF9fSl9fX0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPWhpZ2hsaWdodC1jbGllbnQtd29ya2VyLUJlTlRnNWxWLmpzLm1hcAo=',
		tC = (r) => Uint8Array.from(atob(r), (e) => e.charCodeAt(0)),
		Sf =
			typeof self != 'undefined' &&
			self.Blob &&
			new Blob([tC(gf)], { type: 'text/javascript;charset=utf-8' })
	function rC(r) {
		let e
		try {
			if (
				((e = Sf && (self.URL || self.webkitURL).createObjectURL(Sf)),
				!e)
			)
				throw ''
			const t = new Worker(e, { name: r == null ? void 0 : r.name })
			return (
				t.addEventListener('error', () => {
					;(self.URL || self.webkitURL).revokeObjectURL(e)
				}),
				t
			)
		} catch (t) {
			return new Worker('data:text/javascript;base64,' + gf, {
				name: r == null ? void 0 : r.name,
			})
		} finally {
			e && (self.URL || self.webkitURL).revokeObjectURL(e)
		}
	}
	var je
	;(function (r) {
		;(r[(r.Initialize = 0)] = 'Initialize'),
			(r[(r.AsyncEvents = 1)] = 'AsyncEvents'),
			(r[(r.Identify = 2)] = 'Identify'),
			(r[(r.Properties = 3)] = 'Properties'),
			(r[(r.Metrics = 4)] = 'Metrics'),
			(r[(r.Feedback = 5)] = 'Feedback'),
			(r[(r.CustomEvent = 6)] = 'CustomEvent'),
			(r[(r.Stop = 7)] = 'Stop')
	})(je || (je = {}))
	const wr = (r, e) => {
		console.warn(`Highlight Warning: (${r}): `, { output: e })
	}
	var fs
	;(function (r) {
		r.CLIENT_ID = 'highlightClientID'
	})(fs || (fs = {}))
	class Rl {
		constructor(e, t) {
			C(this, 'options')
			C(this, 'isRunningOnHighlight')
			C(this, 'organizationID')
			C(this, 'graphqlSDK')
			C(this, 'events')
			C(this, 'sessionData')
			C(this, 'ready')
			C(this, 'manualStopped')
			C(this, 'state')
			C(this, 'logger')
			C(this, 'enableSegmentIntegration')
			C(this, 'privacySetting')
			C(this, 'enableCanvasRecording')
			C(this, 'enablePerformanceRecording')
			C(this, 'samplingStrategy')
			C(this, 'inlineImages')
			C(this, 'inlineStylesheet')
			C(this, 'debugOptions')
			C(this, 'listeners')
			C(this, 'firstloadVersion')
			C(this, 'environment')
			C(this, 'sessionShortcut')
			C(this, 'appVersion')
			C(this, 'serviceName')
			C(this, '_worker')
			C(this, '_optionsInternal')
			C(this, '_backendUrl')
			C(this, '_recordingStartTime')
			C(this, '_isOnLocalHost')
			C(this, '_onToggleFeedbackFormVisibility')
			C(this, '_firstLoadListeners')
			C(this, '_isCrossOriginIframe')
			C(this, '_eventBytesSinceSnapshot')
			C(this, '_lastSnapshotTime')
			C(this, '_lastVisibilityChangeTime')
			C(this, 'pushPayloadTimerId')
			C(this, 'hasSessionUnloaded')
			C(this, 'hasPushedData')
			C(this, 'reloaded')
			C(this, '_hasPreviouslyInitialized')
			C(this, '_recordStop')
			var i, s, o, l, a
			e.sessionSecureID || (e.sessionSecureID = Yr()),
				(this.options = e),
				typeof ((i = this.options) == null ? void 0 : i.debug) ==
				'boolean'
					? (this.debugOptions = this.options.debug
							? { clientInteractions: !0 }
							: {})
					: (this.debugOptions =
							(o =
								(s = this.options) == null
									? void 0
									: s.debug) != null
								? o
								: {}),
				(this.logger = new FE(this.debugOptions.clientInteractions)),
				e.storageMode &&
					(this.logger.log(
						`initializing in ${e.storageMode} session mode`,
					),
					L0(e.storageMode)),
				au(!(e != null && e.skipCookieSessionDataLoad)),
				(this._worker = new rC()),
				(this._worker.onmessage = (c) => {
					var u, d, h
					;((u = c.data.response) == null ? void 0 : u.type) ===
					je.AsyncEvents
						? ((this._eventBytesSinceSnapshot +=
								c.data.response.eventsSize),
							this.logger
								.log(`Web worker sent payloadID ${c.data.response.id} size ${c.data.response.eventsSize} bytes, compression ratio ${c.data.response.eventsSize / c.data.response.compressedSize}.
                Total since snapshot: ${(this._eventBytesSinceSnapshot / 1e6).toFixed(1)}MB`))
						: ((d = c.data.response) == null ? void 0 : d.type) ===
							  je.CustomEvent
							? this.addCustomEvent(
									c.data.response.tag,
									c.data.response.payload,
								)
							: ((h = c.data.response) == null
									? void 0
									: h.type) === je.Stop &&
								(wr(
									'Stopping recording due to worker failure',
									c.data.response,
								),
								this.stopRecording(!1))
				})
			let n = rr()
			if (
				((this.reloaded = !1),
				!((l = this.sessionData) != null && l.sessionSecureID) &&
					n != null &&
					n.sessionSecureID)
			)
				(this.sessionData = n),
					(this.options.sessionSecureID = n.sessionSecureID),
					(this.reloaded = !0),
					this.logger.log(
						`Tab reloaded, continuing previous session: ${this.sessionData.sessionSecureID}`,
					)
			else {
				for (const c of Object.values(Ze)) wo(c)
				this.sessionData = {
					sessionSecureID: this.options.sessionSecureID,
					projectID: 0,
					payloadID: 1,
					sessionStartTime: Date.now(),
				}
			}
			;(this._hasPreviouslyInitialized = !1),
				(this._firstLoadListeners = t || new et(this.options))
			try {
				window.parent.document && (this._isCrossOriginIframe = !1)
			} catch (c) {
				this._isCrossOriginIframe =
					(a = this.options.recordCrossOriginIframe) != null ? a : !0
			}
			this._initMembers(this.options)
		}
		static create(e) {
			return new Rl(e)
		}
		_reset(t) {
			return z(this, arguments, function* ({ forceNew: e }) {
				this.pushPayloadTimerId &&
					(clearTimeout(this.pushPayloadTimerId),
					(this.pushPayloadTimerId = void 0))
				let n, i
				if (!e)
					try {
						n = ke(Ze.USER_IDENTIFIER)
						const s = ke(Ze.USER_OBJECT)
						s && (i = JSON.parse(s))
					} catch (s) {}
				for (const s of Object.values(Ze)) wo(s)
				;(this.sessionData.sessionSecureID = Yr()),
					(this.sessionData.sessionStartTime = Date.now()),
					(this.options.sessionSecureID =
						this.sessionData.sessionSecureID),
					this.stopRecording(),
					(this._firstLoadListeners = new et(this.options)),
					yield this.initialize(),
					n && i && this.identify(n, i)
			})
		}
		_initMembers(e) {
			var s, o, l, a, c, u, d, h, p, y, f
			;(this.sessionShortcut = !1),
				(this._recordingStartTime = 0),
				(this._isOnLocalHost =
					window.location.hostname === 'localhost' ||
					window.location.hostname === '127.0.0.1' ||
					window.location.hostname === ''),
				(this.ready = !1),
				(this.state = 'NotRecording'),
				(this.manualStopped = !1),
				(this.enableSegmentIntegration = !!e.enableSegmentIntegration),
				(this.privacySetting =
					(s = e.privacySetting) != null ? s : 'default'),
				(this.enableCanvasRecording =
					(o = e.enableCanvasRecording) != null ? o : !1),
				(this.enablePerformanceRecording =
					(l = e.enablePerformanceRecording) != null ? l : !0),
				(this.inlineImages =
					(a = e.inlineImages) != null ? a : this._isOnLocalHost),
				(this.inlineStylesheet =
					(c = e.inlineStylesheet) != null ? c : !0),
				(this.samplingStrategy = Z(
					{
						canvasFactor: 0.5,
						canvasMaxSnapshotDimension: 360,
						canvasClearWebGLBuffer: !0,
						dataUrlOptions: Pf(),
					},
					(u = e.samplingStrategy) != null ? u : { canvas: 2 },
				)),
				(this._backendUrl =
					(d = e == null ? void 0 : e.backendUrl) != null
						? d
						: 'https://pub.highlight.io'),
				this._backendUrl[0] === '/' &&
					(this._backendUrl = new URL(
						this._backendUrl,
						document.baseURI,
					).href)
			const t = new fv(`${this._backendUrl}`, { headers: {} })
			;(this.graphqlSDK = DT(
				t,
				DE(
					((h = this.sessionData) == null
						? void 0
						: h.sessionSecureID) ||
						((p = this.options) == null
							? void 0
							: p.sessionSecureID),
				),
			)),
				(this.environment =
					(y = e.environment) != null ? y : 'production'),
				(this.appVersion = e.appVersion),
				(this.serviceName = (f = e.serviceName) != null ? f : ''),
				typeof e.organizationID == 'string'
					? (this.organizationID = e.organizationID)
					: (this.organizationID = e.organizationID.toString()),
				(this.isRunningOnHighlight =
					this.organizationID === '1' ||
					this.organizationID === '1jdkoe52'),
				(this.firstloadVersion = e.firstloadVersion || 'unknown'),
				(this.sessionShortcut = e.sessionShortcut || !1),
				(this._onToggleFeedbackFormVisibility = () => {})
			const m = e,
				{ firstloadVersion: n } = m,
				i = Ve(m, ['firstloadVersion'])
			;(this._optionsInternal = i),
				(this.listeners = []),
				(this.events = []),
				(this.hasSessionUnloaded = !1),
				(this.hasPushedData = !1),
				window.Intercom &&
					window.Intercom('onShow', () => {
						window.Intercom('update', {
							highlightSessionURL:
								this.getCurrentSessionURLWithTimestamp(),
						}),
							this.addProperties({ event: 'Intercom onShow' })
					}),
				(this._eventBytesSinceSnapshot = 0),
				(this._lastSnapshotTime = new Date().getTime()),
				(this._lastVisibilityChangeTime = new Date().getTime())
		}
		identify(e, t = {}, n) {
			if (!e || e === '') {
				console.warn(
					"Highlight's identify() call was passed an empty identifier.",
					{ user_identifier: e, user_object: t },
				)
				return
			}
			;(this.sessionData.userIdentifier = e.toString()),
				(this.sessionData.userObject = t),
				pt(Ze.USER_IDENTIFIER, e.toString()),
				pt(Ze.USER_OBJECT, JSON.stringify(t)),
				this._worker.postMessage({
					message: {
						type: je.Identify,
						userIdentifier: e,
						userObject: t,
						source: n,
					},
				})
		}
		pushCustomError(e, t) {
			return this.consumeCustomError(new Error(e), void 0, t)
		}
		consumeCustomError(e, t, n) {
			let i = {}
			if (n)
				try {
					i = Z(Z({}, JSON.parse(n)), i)
				} catch (s) {}
			return this.consumeError(e, { message: t, payload: i })
		}
		consumeError(e, { message: t, payload: n, source: i, type: s }) {
			var a, c, u, d
			e.cause && (n = q(Z({}, n), { 'exception.cause': e.cause }))
			let o = t ? t + ':' + e.message : e.message
			s === 'React.ErrorBoundary' && (o = 'ErrorBoundary: ' + o)
			const l = Zr.parse(e)
			this._firstLoadListeners.errors.push({
				event: o,
				type: s != null ? s : 'custom',
				url: window.location.href,
				source: i != null ? i : '',
				lineNumber:
					(a = l[0]) != null && a.lineNumber
						? (c = l[0]) == null
							? void 0
							: c.lineNumber
						: 0,
				columnNumber:
					(u = l[0]) != null && u.columnNumber
						? (d = l[0]) == null
							? void 0
							: d.columnNumber
						: 0,
				stackTrace: l,
				timestamp: new Date().toISOString(),
				payload: JSON.stringify(n),
			})
		}
		addProperties(e = {}, t) {
			const n = Z({}, e)
			Object.entries(n).forEach(([i, s]) => {
				try {
					structuredClone(s)
				} catch (o) {
					delete n[i]
				}
			}),
				this._worker.postMessage({
					message: {
						type: je.Properties,
						propertiesObject: n,
						propertyType: t,
					},
				})
		}
		initialize(e) {
			return z(this, null, function* () {
				var t, n, i, s, o, l, a, c, u
				if (
					(this.logger.log(
						'Initializing...',
						e,
						this.sessionData,
						this.options,
					),
					(navigator != null &&
						navigator.webdriver &&
						!window.Cypress) ||
						((t =
							navigator == null ? void 0 : navigator.userAgent) !=
							null &&
							t.includes('Googlebot')) ||
						((n =
							navigator == null ? void 0 : navigator.userAgent) !=
							null &&
							n.includes('AdsBot')))
				) {
					;(i = this._firstLoadListeners) == null || i.stopListening()
					return
				}
				try {
					if (e != null && e.forceNew) {
						yield this._reset(e)
						return
					}
					;(this.sessionData =
						(s = rr(this.sessionData.sessionSecureID)) != null
							? s
							: this.sessionData),
						(o = this.sessionData) != null && o.sessionStartTime
							? (this._recordingStartTime =
									(l = this.sessionData) == null
										? void 0
										: l.sessionStartTime)
							: ((this._recordingStartTime =
									new Date().getTime()),
								(this.sessionData.sessionStartTime =
									this._recordingStartTime)),
						$n(''),
						nr(this.sessionData)
					let d = ke(fs.CLIENT_ID)
					d || ((d = Yr()), pt(fs.CLIENT_ID, d))
					let h
					this.options.disableSessionRecording ||
					this.options.disableNetworkRecording !== void 0 ||
					typeof this.options.networkRecording == 'boolean'
						? (h = !1)
						: (h =
								((a = this.options.networkRecording) == null
									? void 0
									: a.recordHeadersAndBody) || !1)
					let p = []
					if (
						(typeof this.options.networkRecording == 'object' &&
							(c =
								this.options.networkRecording
									.destinationDomains) != null &&
							c.length &&
							(p =
								this.options.networkRecording
									.destinationDomains),
						this._isCrossOriginIframe)
					)
						yield this._setupCrossOriginIframe()
					else {
						const S = yield this.graphqlSDK.initializeSession({
							organization_verbose_id: this.organizationID,
							enable_strict_privacy:
								this.privacySetting === 'strict',
							privacy_setting: this.privacySetting,
							enable_recording_network_contents: h,
							clientVersion: this.firstloadVersion,
							firstloadVersion: this.firstloadVersion,
							clientConfig: JSON.stringify(this._optionsInternal),
							environment: this.environment,
							id: d,
							appVersion: this.appVersion,
							serviceName: this.serviceName,
							session_secure_id: this.sessionData.sessionSecureID,
							client_id: d,
							network_recording_domains: p,
							disable_session_recording:
								this.options.disableSessionRecording,
						})
						if (
							(S.initializeSession.secure_id !==
								this.sessionData.sessionSecureID &&
								this.logger.log(
									`Unexpected secure id returned by initializeSession: ${S.initializeSession.secure_id}, expected ${this.sessionData.sessionSecureID}`,
								),
							(this.sessionData.sessionSecureID =
								S.initializeSession.secure_id),
							(this.sessionData.projectID = parseInt(
								((u =
									S == null ? void 0 : S.initializeSession) ==
								null
									? void 0
									: u.project_id) || '0',
							)),
							!this.sessionData.projectID ||
								!this.sessionData.sessionSecureID)
						) {
							console.error(
								'Failed to initialize Highlight; an error occurred on our end.',
								this.sessionData,
							)
							return
						}
					}
					if (
						(this.logger.log(`Loaded Highlight
Remote: ${this._backendUrl}
Project ID: ${this.sessionData.projectID}
SessionSecureID: ${this.sessionData.sessionSecureID}`),
						(this.options.sessionSecureID =
							this.sessionData.sessionSecureID),
						this._worker.postMessage({
							message: {
								type: je.Initialize,
								sessionSecureID:
									this.sessionData.sessionSecureID,
								backend: this._backendUrl,
								debug: !!this.debugOptions.clientInteractions,
								recordingStartTime: this._recordingStartTime,
							},
						}),
						this.sessionData.userIdentifier &&
							this.identify(
								this.sessionData.userIdentifier,
								this.sessionData.userObject,
							),
						this._firstLoadListeners.isListening()
							? this._firstLoadListeners.hasNetworkRecording ||
								et.setupNetworkListener(
									this._firstLoadListeners,
									this.options,
								)
							: this._firstLoadListeners.startListening(),
						this.pushPayloadTimerId &&
							(clearTimeout(this.pushPayloadTimerId),
							(this.pushPayloadTimerId = void 0)),
						this._isCrossOriginIframe ||
							(this.pushPayloadTimerId = setTimeout(() => {
								this._save()
							}, Ne)),
						this.options.disableSessionRecording)
					) {
						this.logger.log(
							'Highlight is NOT RECORDING a session replay per H.init setting.',
						),
							(this.ready = !0),
							(this.state = 'Recording'),
							(this.manualStopped = !1)
						return
					}
					const { getDeviceDetails: y } = qE()
					y &&
						this.recordMetric([
							{
								name: It.DeviceMemory,
								value: y().deviceMemory,
								category: Xe.Device,
								group: window.location.href,
							},
						])
					const f = (S, I) => {
						I &&
							this.logger.log('received isCheckout emit', {
								event: S,
							}),
							this.events.push(S)
					}
					f.bind(this)
					const m = !!this._recordStop
					this._recordStop &&
						(this._recordStop(), (this._recordStop = void 0))
					const [g, v] = QT(this.privacySetting)
					;(this._recordStop = bt({
						ignoreClass: 'highlight-ignore',
						blockClass: 'highlight-block',
						emit: f,
						recordCrossOriginIframes:
							this.options.recordCrossOriginIframe,
						privacySetting: this.privacySetting,
						maskAllInputs: g,
						maskInputOptions: v,
						recordCanvas: this.enableCanvasRecording,
						sampling: {
							canvas: {
								fps: this.samplingStrategy.canvas,
								fpsManual:
									this.samplingStrategy.canvasManualSnapshot,
								resizeFactor:
									this.samplingStrategy.canvasFactor,
								clearWebGLBuffer:
									this.samplingStrategy
										.canvasClearWebGLBuffer,
								initialSnapshotDelay:
									this.samplingStrategy
										.canvasInitialSnapshotDelay,
								dataURLOptions:
									this.samplingStrategy.dataUrlOptions,
								maxSnapshotDimension:
									this.samplingStrategy
										.canvasMaxSnapshotDimension,
							},
						},
						keepIframeSrcFn: (S) =>
							!this.options.recordCrossOriginIframe,
						inlineImages: this.inlineImages,
						collectFonts: this.inlineImages,
						inlineStylesheet: this.inlineStylesheet,
						plugins: [sv()],
						logger:
							(typeof this.options.debug == 'boolean' &&
								this.options.debug) ||
							(typeof this.options.debug == 'object' &&
								this.options.debug.domRecording)
								? { debug: this.logger.log, warn: wr }
								: void 0,
					})),
						m ||
							(this.options.recordCrossOriginIframe &&
								this._setupCrossOriginIframeParent()),
						document.referrer &&
							((window &&
								document.referrer.includes(
									window.location.origin,
								)) ||
								(this.addCustomEvent(
									'Referrer',
									document.referrer,
								),
								this.addProperties(
									{ referrer: document.referrer },
									{ type: 'session' },
								))),
						this._setupWindowListeners(),
						(this.ready = !0),
						(this.state = 'Recording'),
						(this.manualStopped = !1)
				} catch (d) {
					this._isOnLocalHost &&
						(console.error(d), wr('initializeSession', d))
				}
			})
		}
		_visibilityHandler(e) {
			return z(this, null, function* () {
				if (this.manualStopped) {
					this.logger.log(
						'Ignoring visibility event due to manual stop.',
					)
					return
				}
				new Date().getTime() - this._lastVisibilityChangeTime < Xf ||
					((this._lastVisibilityChangeTime = new Date().getTime()),
					this.logger.log(
						`Detected window ${e ? 'hidden' : 'visible'}.`,
					),
					e
						? (this.addCustomEvent('TabHidden', !0),
							this.options.disableBackgroundRecording &&
								this.stopRecording())
						: (this.options.disableBackgroundRecording &&
								(yield this.initialize()),
							this.addCustomEvent('TabHidden', !1)))
			})
		}
		_setupCrossOriginIframe() {
			return z(this, null, function* () {
				this.logger.log('highlight in cross-origin iframe is waiting '),
					yield new Promise((e) => {
						const t = (n) => {
							if (n.data.highlight === yf) {
								const i = n.data
								this.logger.log(
									'highlight got window message ',
									i,
								),
									(this.sessionData.projectID = i.projectID),
									(this.sessionData.sessionSecureID =
										i.sessionSecureID),
									window.parent.postMessage(
										{ highlight: bf },
										'*',
									),
									window.removeEventListener('message', t),
									e()
							}
						}
						window.addEventListener('message', t)
					})
			})
		}
		_setupCrossOriginIframeParent() {
			this.logger.log(
				'highlight setting up cross origin iframe parent notification',
			),
				setInterval(() => {
					window.document.querySelectorAll('iframe').forEach((e) => {
						var t
						;(t = e.contentWindow) == null ||
							t.postMessage(
								{
									highlight: yf,
									projectID: this.sessionData.projectID,
									sessionSecureID:
										this.sessionData.sessionSecureID,
								},
								'*',
							)
					})
				}, Ne),
				window.addEventListener('message', (e) => {
					e.data.highlight === bf &&
						this.logger.log(
							'highlight got response from initialized iframe',
						)
				})
		}
		_setupWindowListeners() {
			var n
			try {
				const i = this
				this.enableSegmentIntegration &&
					this.listeners.push(
						vE((o) => {
							if (o.type === 'track') {
								const l = {}
								;(l['segment-event'] = o.event),
									i.addProperties(l, {
										type: 'track',
										source: 'segment',
									})
							} else if (o.type === 'identify') {
								const l = o.userId.replace(/^"(.*)"$/, '$1')
								i.identify(l, o.traits, 'segment')
							}
						}),
					),
					this.listeners.push(
						jT((o) => {
							this.reloaded
								? (this.addCustomEvent('Reload', o),
									(this.reloaded = !1),
									i.addProperties(
										{ reload: !0 },
										{ type: 'session' },
									))
								: this.addCustomEvent('Navigate', o),
								i.addProperties(
									{ 'visited-url': o },
									{ type: 'session' },
								)
						}),
					),
					this.listeners.push(
						NE((o) => {
							this.addCustomEvent('Viewport', o),
								this.submitViewportMetrics(o)
						}),
					),
					this.listeners.push(
						hE((o, l) => {
							let a = null,
								c = null
							if (l && l.target) {
								const u = l.target
								;(a = Pp(u)),
									(c = u.textContent),
									c &&
										c.length > 2e3 &&
										(c = c.substring(0, 2e3))
							}
							this.addCustomEvent('Click', {
								clickTarget: o,
								clickTextContent: c,
								clickSelector: a,
							})
						}),
					),
					this.listeners.push(
						pE((o) => {
							o && this.addCustomEvent('Focus', o)
						}),
					),
					this.listeners.push(
						YE((o) => {
							const { name: l, value: a } = o
							this.recordMetric([
								{
									name: l,
									value: a,
									group: window.location.href,
									category: Xe.WebVital,
								},
							])
						}),
					),
					this.sessionShortcut &&
						IE(this.sessionShortcut, () => {
							window.open(
								this.getCurrentSessionURLWithTimestamp(),
								'_blank',
							)
						}),
					this.enablePerformanceRecording &&
						(this.listeners.push(
							SE((o) => {
								this.addCustomEvent('Performance', Lt(o)),
									this.recordMetric(
										Object.entries(o)
											.map(([l, a]) =>
												a
													? {
															name: l,
															value: a,
															category:
																Xe.Performance,
															group: window
																.location.href,
														}
													: void 0,
											)
											.filter((l) => l),
									)
							}, this._recordingStartTime),
						),
						this.listeners.push(
							bE((o) => {
								this.addCustomEvent('Jank', Lt(o)),
									this.recordMetric([
										{
											name: 'Jank',
											value: o.jankAmount,
											category: Xe.WebVital,
											group: o.querySelector,
										},
									])
							}, this._recordingStartTime),
						)),
					this._hasPreviouslyInitialized ||
						((n = window.electron) != null && n.ipcRenderer
							? (window.electron.ipcRenderer.on(
									'highlight.run',
									({ visible: o }) => {
										this._visibilityHandler(!o)
									},
								),
								this.logger.log(
									'Set up Electron highlight.run events.',
								))
							: (gE((o) => this._visibilityHandler(o)),
								this.logger.log(
									'Set up document visibility listener.',
								)),
						(this._hasPreviouslyInitialized = !0))
				const s = () => {
					;(this.hasSessionUnloaded = !0),
						this.pushPayloadTimerId &&
							(clearTimeout(this.pushPayloadTimerId),
							(this.pushPayloadTimerId = void 0))
				}
				window.addEventListener('beforeunload', s),
					this.listeners.push(() =>
						window.removeEventListener('beforeunload', s),
					)
			} catch (i) {
				this._isOnLocalHost &&
					(console.error(i),
					wr('initializeSession _setupWindowListeners', i))
			}
			const e = () => {
				this.addCustomEvent('Page Unload', ''),
					$n(this.sessionData.sessionSecureID),
					nr(this.sessionData)
			}
			if (
				(window.addEventListener('beforeunload', e),
				this.listeners.push(() =>
					window.removeEventListener('beforeunload', e),
				),
				navigator.userAgent.match(/iPad/i) ||
					navigator.userAgent.match(/iPhone/i))
			) {
				const i = () => {
					this.addCustomEvent('Page Unload', ''),
						$n(this.sessionData.sessionSecureID),
						nr(this.sessionData)
				}
				window.addEventListener('pagehide', i),
					this.listeners.push(() =>
						window.removeEventListener('beforeunload', i),
					)
			}
		}
		submitViewportMetrics({
			height: e,
			width: t,
			availHeight: n,
			availWidth: i,
		}) {
			this.recordMetric([
				{
					name: It.ViewportHeight,
					value: e,
					category: Xe.Device,
					group: window.location.href,
				},
				{
					name: It.ViewportWidth,
					value: t,
					category: Xe.Device,
					group: window.location.href,
				},
				{
					name: It.ScreenHeight,
					value: n,
					category: Xe.Device,
					group: window.location.href,
				},
				{
					name: It.ScreenWidth,
					value: i,
					category: Xe.Device,
					group: window.location.href,
				},
				{
					name: It.ViewportArea,
					value: e * t,
					category: Xe.Device,
					group: window.location.href,
				},
			])
		}
		recordMetric(e) {
			this._worker.postMessage({
				message: {
					type: je.Metrics,
					metrics: e.map((t) =>
						q(Z({}, t), {
							tags: t.tags || [],
							group: t.group || window.location.href,
							category: t.category || Xe.Frontend,
							timestamp: new Date(),
						}),
					),
				},
			})
		}
		stopRecording(e) {
			;(this.manualStopped = !!e),
				this.manualStopped &&
					this.addCustomEvent(
						'Stop',
						'H.stop() was called which stops Highlight from recording.',
					),
				(this.state = 'NotRecording'),
				e &&
					this._recordStop &&
					(this._recordStop(), (this._recordStop = void 0)),
				this.listeners.forEach((t) => t()),
				(this.listeners = [])
		}
		getCurrentSessionTimestamp() {
			return this._recordingStartTime
		}
		getCurrentSessionURLWithTimestamp() {
			const e = new Date().getTime(),
				{ projectID: t, sessionSecureID: n } = this.sessionData,
				i = (e - this._recordingStartTime) / 1e3
			return `https://${vs}/${t}/sessions/${n}?ts=${i}`
		}
		getCurrentSessionURL() {
			const e = this.sessionData.projectID,
				t = this.sessionData.sessionSecureID
			return e && t ? `https://${vs}/${e}/sessions/${t}` : null
		}
		snapshot(e) {
			return z(this, null, function* () {
				yield bt.snapshotCanvas(e)
			})
		}
		addSessionFeedback({
			timestamp: e,
			verbatim: t,
			user_email: n,
			user_name: i,
		}) {
			var s
			this._worker.postMessage({
				message: {
					type: je.Feedback,
					verbatim: t,
					timestamp: e,
					userName: i || this.sessionData.userIdentifier,
					userEmail:
						n ||
						((s = this.sessionData.userObject) == null
							? void 0
							: s.name),
				},
			})
		}
		_save() {
			return z(this, null, function* () {
				var e
				try {
					this.state === 'Recording' &&
						this.listeners &&
						this.sessionData.sessionStartTime &&
						Date.now() - this.sessionData.sessionStartTime > Nt &&
						(this.logger.log('Resetting session', {
							start: this.sessionData.sessionStartTime,
						}),
						yield this._reset({}))
					let t
					;((e = this.options) == null ? void 0 : e.sendMode) ===
						'local' &&
						(t = (n) =>
							z(this, null, function* () {
								let i = new Blob(
									[
										JSON.stringify({
											query: su(Op),
											variables: n,
										}),
									],
									{ type: 'application/json' },
								)
								return (
									yield window.fetch(`${this._backendUrl}`, {
										method: 'POST',
										body: i,
									}),
									0
								)
							})),
						yield this._sendPayload({ sendFn: t }),
						(this.hasPushedData = !0),
						(this.sessionData.lastPushTime = Date.now()),
						nr(this.sessionData)
				} catch (t) {
					this._isOnLocalHost && (console.error(t), wr('_save', t))
				}
				this.state === 'Recording' &&
					(this.pushPayloadTimerId &&
						(clearTimeout(this.pushPayloadTimerId),
						(this.pushPayloadTimerId = void 0)),
					(this.pushPayloadTimerId = setTimeout(() => {
						this._save()
					}, ot)))
			})
		}
		addCustomEvent(e, t) {
			if (this.state === 'NotRecording') {
				let n
				const i = () => {
					clearInterval(n),
						this.state === 'Recording' && this.events.length > 0
							? Xp(e, t)
							: (n = setTimeout(i, 500))
				}
				n = setTimeout(i, 500)
			} else
				this.state === 'Recording' &&
					(this.events.length > 0 || this.hasPushedData) &&
					Xp(e, t)
		}
		_sendPayload(t) {
			return z(this, arguments, function* ({ sendFn: e }) {
				const n = et.getRecordedNetworkResources(
						this._firstLoadListeners,
						this._recordingStartTime,
					),
					i = et.getRecordedWebSocketEvents(this._firstLoadListeners),
					s = [...this.events],
					o = [...this._firstLoadListeners.messages],
					l = [...this._firstLoadListeners.errors],
					{ bytes: a, time: c } = this.enableCanvasRecording
						? Bt.canvas
						: Bt.normal
				this._eventBytesSinceSnapshot >= a &&
					new Date().getTime() - this._lastSnapshotTime >= c &&
					this.takeFullSnapshot(),
					this.logger
						.log(`Sending: ${s.length} events, ${o.length} messages, ${n.length} network resources, ${l.length} errors 
To: ${this._backendUrl}
Org: ${this.organizationID}
SessionSecureID: ${this.sessionData.sessionSecureID}`)
				const u = QE()
				e
					? yield e({
							session_secure_id: this.sessionData.sessionSecureID,
							payload_id: this.sessionData.payloadID.toString(),
							events: { events: s },
							messages: Lt({ messages: o }),
							resources: JSON.stringify({ resources: n }),
							web_socket_events: JSON.stringify({
								webSocketEvents: i,
							}),
							errors: l,
							is_beacon: !1,
							has_session_unloaded: this.hasSessionUnloaded,
						})
					: this._worker.postMessage({
							message: {
								type: je.AsyncEvents,
								id: this.sessionData.payloadID++,
								events: s,
								messages: o,
								errors: l,
								resourcesString: JSON.stringify({
									resources: n,
								}),
								webSocketEventsString: JSON.stringify({
									webSocketEvents: i,
								}),
								hasSessionUnloaded: this.hasSessionUnloaded,
								highlightLogs: u,
							},
						}),
					nr(this.sessionData),
					et.clearRecordedNetworkResources(this._firstLoadListeners),
					(this.events = this.events.slice(s.length)),
					(this._firstLoadListeners.messages =
						this._firstLoadListeners.messages.slice(o.length)),
					(this._firstLoadListeners.errors =
						this._firstLoadListeners.errors.slice(l.length)),
					$E(u)
			})
		}
		takeFullSnapshot() {
			if (!this._recordStop) {
				this.logger.log(
					'skipping full snapshot as rrweb is not running',
				)
				return
			}
			this.logger.log('taking full snapshot', {
				bytesSinceSnapshot: this._eventBytesSinceSnapshot,
				lastSnapshotTime: this._lastSnapshotTime,
			}),
				bt.takeFullSnapshot(),
				(this._eventBytesSinceSnapshot = 0),
				(this._lastSnapshotTime = new Date().getTime())
		}
	}
	const nC = Object.freeze(
		Object.defineProperty(
			{
				__proto__: null,
				FirstLoadListeners: et,
				GenerateSecureID: Yr,
				Highlight: Rl,
				HighlightWarning: wr,
				get MetricCategory() {
					return Xe
				},
				getPreviousSessionData: rr,
				getTracer: JS,
				setupBrowserTracing: AS,
			},
			Symbol.toStringTag,
			{ value: 'Module' },
		),
	)
	;(O.H = he),
		(O.HighlightSegmentMiddleware = tv),
		(O.__testing = nv),
		(O.configureElectronHighlight = ev),
		Object.defineProperty(O, Symbol.toStringTag, { value: 'Module' })
})
//# sourceMappingURL=index.umd.cjs.map
