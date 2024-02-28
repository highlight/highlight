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

const getFakeFirebaseUser: (email?: string, password?: string) => User = (
	email,
	password,
) => ({
	async getIdToken(): Promise<string> {
		if (AUTH_MODE === 'password') {
			return sessionStorage.getItem('passwordToken') || ''
		}
		return Promise.resolve('a1b2c3')
	},
	email: email || 'demo@example.com',
	async sendEmailVerification(): Promise<void> {
		console.warn('simple auth does not support email verification')
	},
})

const makePasswordAuthUser = (email: string): User => ({
	async getIdToken(): Promise<string> {
		return sessionStorage.getItem('passwordToken') || ''
	},
	email,
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

	signOut(): Promise<void> {
		return Promise.resolve(undefined)
	}
}

class PasswordAuth {
	currentUser: User | null = null
	googleProvider?: Firebase.auth.GoogleAuthProvider
	githubProvider?: Firebase.auth.GithubAuthProvider

	constructor() {
		this.initialize()
	}

	initialize() {
		const user = sessionStorage.getItem('currentUser')
		const token = sessionStorage.getItem('passwordToken')
		if (user && token) {
			try {
				const userObject = JSON.parse(user)
				this.currentUser = makePasswordAuthUser(userObject.email)
			} catch (error) {
				console.log('error setting user from session storage')
			}
			this.validateTokenAndInitializeUser(token)
		}
	}

	async validateTokenAndInitializeUser(token: string): Promise<void> {
		const response = await fetch(`${PRIVATE_GRAPH_URI}/validate-token`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				token,
			},
		})

		if (response.status !== 200) {
			localStorage.removeItem('passwordToken')
			localStorage.removeItem('currentUser')
		}
	}

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
			sessionStorage.setItem('passwordToken', jsonResponse.token)

			const user = makePasswordAuthUser(jsonResponse.user.email)
			this.currentUser = user

			sessionStorage.setItem('currentUser', JSON.stringify(user))

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
		return await getFakeFirebaseCredentials()
	}

	signOut(): Promise<void> {
		sessionStorage.removeItem('passwordToken')
		sessionStorage.removeItem('currentUser')
		return Promise.resolve(undefined)
	}
}

export let auth: SimpleAuth
if (AUTH_MODE === 'simple') {
	auth = new SimpleAuth()
} else if (AUTH_MODE === 'password') {
	auth = new PasswordAuth()
} else {
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
		throw new Error('Error parsing incoming firebase config' + e.toString())
	}

	window._highlightFirebaseConfig = firebaseConfig

	Firebase.initializeApp(firebaseConfig)
	const googleProvider = new Firebase.auth.GoogleAuthProvider()
	const githubProvider = new Firebase.auth.GithubAuthProvider()
	auth = Firebase.auth()
	auth.googleProvider = googleProvider
	auth.githubProvider = githubProvider
}
