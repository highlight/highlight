import 'firebase/auth'

import Firebase from 'firebase/app'
import Auth = Firebase.auth.Auth
import GoogleAuthProvider = Firebase.auth.GoogleAuthProvider

interface User {
	email: string | null
	sendEmailVerification(): Promise<void>
	getIdToken(): Promise<string>
}

interface AuthClient {
	currentUser: User | null
	signOut(): Promise<void>
	signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential>
	sendPasswordResetEmail(email: string): Promise<void>
	createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential>
	onAuthStateChanged(
		onSignedIn: (user: Firebase.User | null) => void,
		onError: (error: Firebase.auth.Error) => any,
	): () => void
}

export class FirebaseAuth implements AuthClient {
	private googleProvider: GoogleAuthProvider
	private auth: Auth
	public currentUser: Firebase.User | null

	constructor() {
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
		this.googleProvider = new Firebase.auth.GoogleAuthProvider()
		this.auth = Firebase.auth()
		// TODO(vkorolik) does this work
		this.currentUser = this.auth.currentUser
	}

	async signOut() {
		await this.auth.signOut()
	}

	onAuthStateChanged(
		onSignedIn: (user: Firebase.User | null) => void,
		onError: (error: Firebase.auth.Error) => any,
	): () => void {
		return this.auth.onAuthStateChanged(onSignedIn, onError)
	}

	onLoginWithGoogle(onError: (e: Firebase.auth.MultiFactorError) => void) {
		this.auth.signInWithPopup(this.googleProvider).catch(onError)
	}

	async createUserWithEmailAndPassword(email: string, password: string) {
		return await this.auth.createUserWithEmailAndPassword(email, password)
	}

	async sendPasswordResetEmail(email: string): Promise<void> {
		return await this.auth.sendPasswordResetEmail(email)
	}

	async signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await this.auth.signInWithEmailAndPassword(email, password)
	}
}

class SimpleAuth implements AuthClient {
	currentUser: User | null = {
		async getIdToken(): Promise<string> {
			return Promise.resolve('a1b2c3')
		},
		email: 'demo@example.com',
		async sendEmailVerification(): Promise<void> {
			console.warn('simple auth does not support email verification')
		},
	}

	private async _getFakeFirebaseUser(): Promise<Firebase.auth.UserCredential> {
		return {
			credential: {
				providerId: '',
				signInMethod: '',
				toJSON: () => Object(),
			},
			user: this.currentUser as Firebase.User,
		}
	}

	async createUserWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<Firebase.auth.UserCredential> {
		return await this._getFakeFirebaseUser()
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
		return await this._getFakeFirebaseUser()
	}

	signOut(): Promise<void> {
		return Promise.resolve(undefined)
	}
}

// TODO(vkorolik) based on env
export const auth: AuthClient =
	import.meta.env.REACT_APP_AUTH_MODE === 'simple'
		? new SimpleAuth()
		: new FirebaseAuth()
