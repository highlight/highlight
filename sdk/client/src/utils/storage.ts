type Mode = 'localStorage' | 'sessionStorage'

let mode: Mode = 'localStorage'

const getPersistentStorage = () => {
	switch (mode) {
		case 'localStorage':
			return window.localStorage
		case 'sessionStorage':
			return window.sessionStorage
	}
}

export const setStorageMode = (m: Mode) => {
	mode = m
}

export const getItem = (key: string) => {
	return getPersistentStorage().getItem(key)
}

export const setItem = (key: string, value: string) => {
	return getPersistentStorage().setItem(key, value)
}

export const monkeyPatchLocalStorage = (
	onSetItemHandler: ({
		keyName,
		keyValue,
	}: {
		keyName: string
		keyValue: string
	}) => void,
) => {
	if (mode === 'sessionStorage') {
		console.warn(
			`highlight.io cannot use local storage; segment integration will not work`,
		)
		return
	}

	const originalSetItem = window.localStorage.setItem
	window.localStorage.setItem = function () {
		const [keyName, keyValue] = arguments as unknown as [
			key: string,
			value: string,
		]
		onSetItemHandler({ keyName, keyValue })
		originalSetItem.apply(this, [keyName, keyValue])
	}
}
