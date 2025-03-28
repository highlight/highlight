import Cookies from 'js-cookie'
import { SESSION_PUSH_THRESHOLD } from '../constants/sessions'

type Mode = 'localStorage' | 'sessionStorage'

let mode: Mode = 'localStorage'
let cookieWriteEnabled: boolean = true

class Storage {
	private storage: { [key: string]: string } = {}
	public getItem(key: string) {
		return this.storage[key] ?? ''
	}
	public setItem(key: string, value: string) {
		this.storage[key] = value
	}
	public removeItem(key: string) {
		delete this.storage[key]
	}
}

export class CookieStorage {
	public getItem(key: string) {
		return Cookies.get(key) ?? ''
	}

	public setItem(key: string, value: string) {
		if (!cookieWriteEnabled) {
			return
		}
		const expires = new Date()
		expires.setTime(expires.getTime() + SESSION_PUSH_THRESHOLD)
		Cookies.set(key, value, { expires })
	}

	public removeItem(key: string) {
		if (!cookieWriteEnabled) {
			return
		}
		Cookies.remove(key)
	}
}

let globalStorage = new Storage()
export const cookieStorage = new CookieStorage()

const getPersistentStorage = () => {
	try {
		switch (mode) {
			case 'localStorage':
				return window.localStorage
			case 'sessionStorage':
				return window.sessionStorage
		}
	} catch (e) {
		return globalStorage
	}
}

export const setStorageMode = (m: Mode) => {
	mode = m
}

export const setCookieWriteEnabled = (enabled: boolean) => {
	cookieWriteEnabled = enabled
}

export const getItem = (key: string) => {
	return getPersistentStorage().getItem(key)
}

export const setItem = (key: string, value: string) => {
	cookieStorage.setItem(key, value)
	return getPersistentStorage().setItem(key, value)
}

export const removeItem = (key: string) => {
	cookieStorage.removeItem(key)
	return getPersistentStorage().removeItem(key)
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
