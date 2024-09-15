const SessionShortcutListener = (
	shortcutString: string,
	callback: () => void,
) => {
	const keys = getKeys(shortcutString)
	let mods = []
	const keyup = false
	const keydown = true

	for (let i = 0; i < keys.length; i++) {
		let key: any = keys[i].split('+')
		mods = []

		if (key.length > 1) mods = getMods(_modifier, key)

		key = key[key.length - 1]
		key = key === '*' ? '*' : code(key)

		// @ts-expect-error
		if (!(key in handlers)) handlers[key] = []
		// @ts-expect-error
		handlers[key].push({
			mods,
			shortcut: keys[i],
			key: keys[i],
			method: callback,
			keyup,
			keydown,
			scope: 'all',
			splitKey: '+',
		})
	}
	addEvent(document, 'keydown', (e: any) => {
		dispatch(e)
	})
}

export default SessionShortcutListener

// @ts-expect-error
let _downKeys = []

function getKeys(key: string) {
	if (typeof key !== 'string') key = ''
	key = key.replace(/\s/g, '')
	const keys = key.split(',')
	let index = keys.lastIndexOf('')

	for (; index >= 0; ) {
		keys[index - 1] += ','
		keys.splice(index, 1)
		index = keys.lastIndexOf('')
	}

	return keys
}

const handlers = {}

const isff =
	typeof navigator !== 'undefined'
		? navigator.userAgent.toLowerCase().indexOf('firefox') > 0
		: false

const _keyMap = {
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
	'-': isff ? 173 : 189,
	'=': isff ? 61 : 187,
	';': isff ? 59 : 186,
	"'": 222,
	'[': 219,
	']': 221,
	'\\': 220,
}

const modifierMap = {
	16: 'shiftKey',
	18: 'altKey',
	17: 'ctrlKey',
	91: 'metaKey',

	shiftKey: 16,
	ctrlKey: 17,
	altKey: 18,
	metaKey: 91,
}

const _mods = {
	16: false,
	18: false,
	17: false,
	91: false,
}

// Modifier Keys
const _modifier = {
	// shiftKey
	'⇧': 16,
	shift: 16,
	// altKey
	'⌥': 18,
	alt: 18,
	option: 18,
	// ctrlKey
	'⌃': 17,
	ctrl: 17,
	control: 17,
	// metaKey
	'⌘': 91,
	cmd: 91,
	command: 91,
}

const code = (x: string) =>
	// @ts-expect-error
	_keyMap[x.toLowerCase()] ||
	// @ts-expect-error
	_modifier[x.toLowerCase()] ||
	x.toUpperCase().charCodeAt(0)

function getMods(modifier: any, key: any) {
	const mods = key.slice(0, key.length - 1)
	for (let i = 0; i < mods.length; i++)
		mods[i] = modifier[mods[i].toLowerCase()]
	return mods
}

// @ts-expect-error
function addEvent(object, event, method) {
	if (object.addEventListener) {
		object.addEventListener(event, method, false)
	} else if (object.attachEvent) {
		object.attachEvent(`on${event}`, () => {
			method(window.event)
		})
	}
}

// @ts-expect-error
function eventHandler(event, handler, scope) {
	let modifiersMatch

	if (handler.scope === scope || handler.scope === 'all') {
		modifiersMatch = handler.mods.length > 0

		for (const y in _mods) {
			if (Object.prototype.hasOwnProperty.call(_mods, y)) {
				if (
					// @ts-expect-error
					(!_mods[y] && handler.mods.indexOf(+y) > -1) ||
					// @ts-expect-error
					(_mods[y] && handler.mods.indexOf(+y) === -1)
				) {
					modifiersMatch = false
				}
			}
		}

		if (
			(handler.mods.length === 0 &&
				!_mods[16] &&
				!_mods[18] &&
				!_mods[17] &&
				!_mods[91]) ||
			modifiersMatch ||
			handler.shortcut === '*'
		) {
			if (handler.method(event, handler) === false) {
				if (event.preventDefault) event.preventDefault()
				else event.returnValue = false
				if (event.stopPropagation) event.stopPropagation()
				if (event.cancelBubble) event.cancelBubble = true
			}
		}
	}
}

// @ts-expect-error
function dispatch(event) {
	// @ts-expect-error
	const asterisk = handlers['*']
	let key = event.keyCode || event.which || event.charCode

	if (key === 93 || key === 224) key = 91

	/**
	 * Collect bound keys
	 * If an Input Method Editor is processing key input and the event is keydown, return 229.
	 * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
	 * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
	 */
	// @ts-expect-error
	if (_downKeys.indexOf(key) === -1 && key !== 229)
		_downKeys.push(key)
		/**
		 * Jest test cases are required.
		 * ===============================
		 */
	;['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach((keyName) => {
		// @ts-expect-error
		const keyNum = modifierMap[keyName]
		// @ts-expect-error
		if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
			_downKeys.push(keyNum)
			// @ts-expect-error
		} else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
			// @ts-expect-error
			_downKeys.splice(_downKeys.indexOf(keyNum), 1)
		} else if (
			keyName === 'metaKey' &&
			event[keyName] &&
			_downKeys.length === 3
		) {
			/**
			 * Fix if Command is pressed:
			 * ===============================
			 */
			if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
				// @ts-expect-error
				_downKeys = _downKeys.slice(_downKeys.indexOf(keyNum))
			}
		}
	})

	if (key in _mods) {
		// @ts-expect-error
		_mods[key] = true

		if (!asterisk) return
	}

	for (const e in _mods) {
		if (Object.prototype.hasOwnProperty.call(_mods, e)) {
			// @ts-expect-error
			_mods[e] = event[modifierMap[e]]
		}
	}
	/**
	 * https://github.com/jaywcjlove/hotkeys/pull/129
	 * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
	 * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
	 * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
	 */
	if (
		event.getModifierState &&
		!(event.altKey && !event.ctrlKey) &&
		event.getModifierState('AltGraph')
	) {
		// @ts-expect-error
		if (_downKeys.indexOf(17) === -1) {
			_downKeys.push(17)
		}

		// @ts-expect-error
		if (_downKeys.indexOf(18) === -1) {
			_downKeys.push(18)
		}

		_mods[17] = true
		_mods[18] = true
	}

	if (!(key in handlers)) return

	// @ts-expect-error
	for (let i = 0; i < handlers[key].length; i++) {
		if (
			// @ts-expect-error
			(event.type === 'keydown' && handlers[key][i].keydown) ||
			// @ts-expect-error
			(event.type === 'keyup' && handlers[key][i].keyup)
		) {
			// @ts-expect-error
			if (handlers[key][i].key) {
				// @ts-expect-error
				const record = handlers[key][i]

				eventHandler(event, record, 'all')
			}
		}
	}
}
