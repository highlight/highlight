/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

import 'firebase/compat/auth'

import Firebase from 'firebase/compat/app'

interface User {
	email: string | null

	sendEmailVerification(): Promise<void>

	getIdToken(): Promise<string>
}

const fakeFirebaseUser: User = {
	async getIdToken(): Promise<string> {
		return Promise.resolve('a1b2c3')
	},
	email: 'demo@example.com',
	async sendEmailVerification(): Promise<void> {
		console.warn('simple auth does not support email verification')
	},
}

const getFakeFirebaseCredentials: () => Promise<Firebase.auth.UserCredential> =
	async () => {
		return {
			credential: {
				providerId: '',
				signInMethod: '',
				toJSON: () => Object(),
			},
			user: fakeFirebaseUser as Firebase.User,
		}
	}

class SimpleAuth {
	currentUser: User | null = fakeFirebaseUser
	googleProvider?: Firebase.auth.GoogleAuthProvider

	async createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await getFakeFirebaseCredentials()
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
		return await getFakeFirebaseCredentials()
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

export let auth: SimpleAuth
if (import.meta.env.REACT_APP_AUTH_MODE === 'simple') {
	auth = new SimpleAuth()
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
	auth = Firebase.auth()
	auth.googleProvider = googleProvider
}
