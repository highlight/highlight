/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

import 'firebase/compat/auth'

import Firebase from 'firebase/compat/app'

import { AUTH_MODE, PRIVATE_GRAPH_URI } from '@/constants'

interface User {
	email: string | null

	sendEmailVerification(): Promise<void>

	getIdToken(): Promise<string>
}

const getFakeFirebaseUser: (email?: string, token?: string) => User = (
	email,
	token,
) => ({
	async getIdToken(): Promise<string> {
		if (AUTH_MODE === 'password') {
			return token || ''
		}
		return 'a1b2c3'
	},
	email: email || 'demo@example.com',
	async sendEmailVerification(): Promise<void> {
		console.warn('simple auth does not support email verification')
	},
})

const getFakeFirebaseCredentials: (
	email?: string,
	password?: string,
) => Promise<Firebase.auth.UserCredential> = async (email, password) => {
	return {
		credential: {
			providerId: '',
			signInMethod: '',
			toJSON: () => Object(),
		},
		user: getFakeFirebaseUser(email, password) as Firebase.User,
	}
}

class SimpleAuth {
	currentUser: User | null = getFakeFirebaseUser()
	googleProvider?: Firebase.auth.GoogleAuthProvider
	githubProvider?: Firebase.auth.GithubAuthProvider

	async createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await getFakeFirebaseCredentials(email, password)
	}

	onAuthStateChanged(
		onSignedIn: (user: Firebase.User | null) => void,
		onError: (error: Firebase.auth.Error) => any,
	): () => void {
		onSignedIn(this.currentUser as Firebase.User)
		return function () {}
	}

	sendPasswordResetEmail(email: string): Promise<void> {
		return Promise.resolve(undefined)
	}

	async signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await getFakeFirebaseCredentials(email, password)
	}

	async signInWithPopup(
		provider: Firebase.auth.AuthProvider,
	): Promise<Firebase.auth.UserCredential> {
		return await getFakeFirebaseCredentials()
	}

	isSignInWithEmailLink(emailLink: string): boolean {
		console.warn('simple auth does not support email sign in')
		return false
	}

	async applyActionCode(
		actionCode: string,
		continueUrl: string,
	): Promise<any> {
		console.warn('simple auth does not support email verification')
		return false
	}

	signOut(): Promise<void> {
		return Promise.resolve(undefined)
	}
}

class PasswordAuth implements SimpleAuth {
	static Key = 'XNnrgjSyZjjEANuxFBG4nXw4p8GvMtrK'

	currentUser: User | null = null
	googleProvider?: Firebase.auth.GoogleAuthProvider
	githubProvider?: Firebase.auth.GithubAuthProvider

	constructor() {
		this.initialize()
	}

	protected set(data: { user: User | undefined; token: string | undefined }) {
		localStorage.setItem(PasswordAuth.Key, JSON.stringify(data))
	}

	private retrieve(): {
		user: User | undefined
		token: string | undefined
	} {
		const data = localStorage.getItem(PasswordAuth.Key)
		if (data) {
			return JSON.parse(data)
		}
		return { user: undefined, token: undefined }
	}

	makePasswordAuthUser(email: string, token: string): User {
		return {
			async getIdToken(): Promise<string> {
				return token || ''
			},
			email,
			async sendEmailVerification(): Promise<void> {
				console.warn('simple auth does not support email verification')
			},
		}
	}

	initialize() {
		const { user, token } = this.retrieve()
		if (user?.email && token) {
			try {
				this.currentUser = this.makePasswordAuthUser(user.email, token)
			} catch (error) {
				console.log('error setting user from storage', error)
			}
		}
		this.validateUser()
	}

	async validateUser(): Promise<boolean> {
		const response = await fetch(`${PRIVATE_GRAPH_URI}/validate-token`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				token: this.retrieve().token || '',
			},
		})

		if (response.status !== 200) {
			await this.signOut()
			// only redirect if we are already not on the sign_in route
			if (!window.location.href.endsWith('/sign_in')) {
				window.location.href = `${window.location.origin}/sign_in`
			}
			return false
		}
		return true
	}

	async createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await this.signInWithEmailAndPassword(email, password)
	}

	onAuthStateChanged(
		onSignedIn: (user: Firebase.User | null) => void,
		onError: (error: Firebase.auth.Error) => any,
	): () => void {
		onSignedIn(this.currentUser as Firebase.User)
		return function () {}
	}

	sendPasswordResetEmail(email: string): Promise<void> {
		return Promise.resolve(undefined)
	}

	async signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		const response = await fetch(`${PRIVATE_GRAPH_URI}/login`, {
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		})

		if (response.status === 200) {
			const jsonResponse = await response.json()

			const user = this.makePasswordAuthUser(
				jsonResponse.user.email,
				jsonResponse.token,
			)
			this.currentUser = user

			this.set({ user, token: jsonResponse.token })

			return {
				credential: {
					providerId: '',
					signInMethod: '',
					toJSON: () => Object(),
				},
				user,
			} as any
		}
		throw new Error('Invalid credentials')
	}

	async signInWithPopup(
		provider: Firebase.auth.AuthProvider,
	): Promise<Firebase.auth.UserCredential> {
		const { token } = this.retrieve()
		return await getFakeFirebaseCredentials(undefined, token)
	}

	isSignInWithEmailLink(emailLink: string): boolean {
		console.warn('password auth does not support email sign in')
		return false
	}

	async applyActionCode(
		actionCode: string,
		continueUrl: string,
	): Promise<any> {
		console.warn('password auth does not support email verification')
		return false
	}

	async signOut() {
		localStorage.removeItem(PasswordAuth.Key)
	}
}

class OAuth extends PasswordAuth implements SimpleAuth {
	initialized = false
	currentUser: User | null = null
	onSignedIn: ((user: Firebase.User | null) => void) | undefined
	onError: ((error: Firebase.auth.Error) => any) | undefined

	onAuthStateChanged(
		onSignedIn: (user: Firebase.User | null) => void,
		onError: (error: Firebase.auth.Error) => any,
	): () => void {
		this.onSignedIn = onSignedIn
		this.onError = onError
		if (!this.initialized) {
			this.initialized = true
			this.initialize()
		}
		return function () {}
	}

	async signInWithEmailAndPassword(): Promise<Firebase.auth.UserCredential> {
		return await this.signInWithPopup()
	}

	async signInWithPopup(): Promise<Firebase.auth.UserCredential> {
		window.location.href = `${PRIVATE_GRAPH_URI}/oauth/login`
		throw new Error('Redirected')
	}

	async validateUser(): Promise<boolean> {
		const response = await fetch(`${PRIVATE_GRAPH_URI}/validate-token`, {
			method: 'GET',
			credentials: 'include',
		})

		if (response.status !== 200) {
			// only redirect if we are already not on the sign_in route
			if (!window.location.href.endsWith('/sign_in')) {
				window.location.href = `${window.location.origin}/sign_in`
			}

			if (this.onSignedIn) {
				this.onSignedIn(null)
			}
			return false
		} else {
			const jsonResponse = await response.json()

			const user = this.makePasswordAuthUser(
				jsonResponse.user.email,
				jsonResponse.token,
			)
			this.currentUser = user

			this.set({ user, token: jsonResponse.token })

			if (this.onSignedIn) {
				this.onSignedIn(this.currentUser as Firebase.User)
			}
			return {
				credential: {
					providerId: '',
					signInMethod: '',
					toJSON: () => Object(),
				},
				user,
			} as any
		}
	}

	async createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		throw new Error('Not implemented')
	}

	sendPasswordResetEmail(email: string): Promise<void> {
		throw new Error('Not implemented')
	}

	isSignInWithEmailLink(emailLink: string): boolean {
		throw new Error('Not implemented')
	}

	async applyActionCode(
		actionCode: string,
		continueUrl: string,
	): Promise<any> {
		throw new Error('Not implemented')
	}

	async signOut() {
		await fetch(`${PRIVATE_GRAPH_URI}/oauth/logout`, {
			method: 'POST',
			credentials: 'include',
		})
		await super.signOut()
	}
}

export let auth: SimpleAuth
switch (AUTH_MODE) {
	case 'simple':
		auth = new SimpleAuth()
		break
	case 'password':
		auth = new PasswordAuth()
		break
	case 'oauth':
		auth = new OAuth()
		break
	default:
		let firebaseConfig: any
		let firebaseConfigString: string

		if (import.meta.env.REACT_APP_FIREBASE_CONFIG_OBJECT) {
			firebaseConfigString =
				import.meta.env.REACT_APP_FIREBASE_CONFIG_OBJECT ?? ''
		} else {
			firebaseConfigString = window._highlightFirebaseConfigString
		}

		// NOTE: we use eval() here (rather than JSON.parse) because its more in-tune
		// with the string presented to a developer in the firebase console.
		// This value is passed at build time, so security concerns are put aside.
		try {
			firebaseConfig = eval('(' + firebaseConfigString + ')')
		} catch (_e) {
			const e = _e as Error
			throw new Error(
				'Error parsing incoming firebase config' + e.toString(),
			)
		}

		window._highlightFirebaseConfig = firebaseConfig

		Firebase.initializeApp(firebaseConfig)
		const googleProvider = new Firebase.auth.GoogleAuthProvider()
		const githubProvider = new Firebase.auth.GithubAuthProvider()
		auth = Firebase.auth()
		auth.googleProvider = googleProvider
		auth.githubProvider = githubProvider
}
