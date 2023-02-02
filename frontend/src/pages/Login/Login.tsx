import { useAuthContext } from '@authentication/AuthContext'
import Alert from '@components/Alert/Alert'
import Input from '@components/Input/Input'
import Space from '@components/Space/Space'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import AboutYouPage from '@pages/AboutYou/AboutYouCard'
import { SignUp } from '@pages/Auth/SignUp'
import VerifyEmailCard from '@pages/Login/components/VerifyEmailCard/VerifyEmailCard'
import { AppRouter } from '@routers/AppRouter/AppRouter'
import analytics from '@util/analytics'
import { auth, googleProvider } from '@util/auth'
import { showIntercom } from '@util/window'
import { message } from 'antd'
import classNames from 'classnames'
import firebase from 'firebase/app'
import { H } from 'highlight.run'
import { omit } from 'lodash'
import React, {
	FormEvent,
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { BooleanParam, StringParam, useQueryParam } from 'use-query-params'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import { ReactComponent as GoogleLogo } from '../../static/google.svg'
import { Landing } from '../Landing/Landing'
import styles from './Login.module.scss'

// TODO: Consider dropping this and putting logic in AppRouter
export const AuthAdminRouter = () => {
	const { isAuthLoading, admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (admin) {
			const { email, id, name } = admin
			const identifyMetadata: {
				id: string
				avatar?: string
				name: string
				email?: string
			} = {
				email,
				id,
				name,
			}

			if (admin.photo_url) {
				identifyMetadata.avatar = admin.photo_url
			}

			H.identify(email, identifyMetadata)

			// `id` is a reserved keyword in rudderstack and it's recommended to use a
			// static property for the user ID rather than something that could change
			// over time, like an email address.
			analytics.identify(admin.id, omit(identifyMetadata, ['id']))
			showIntercom({ admin, hideMessage: true })
		}
	}, [admin])

	useEffect(() => {
		if (isAuthLoading) {
			setLoadingState(AppLoadingState.LOADING)
		}
	}, [isAuthLoading, setLoadingState])

	if (isAuthLoading) {
		return null
	}

	return <AppRouter />
}

enum LoginFormState {
	// User's current state is unkown, this is used as an intermediary state.
	Unknown,
	// User is on the SignIn Page
	SignIn,
	// User is on the SignUp Page
	SignUp,
	// The user is on the Reset Password page
	ResetPassword,
	// The user needs to verify their email
	VerifyEmail,
	// The user needs to enter missing user details
	MissingUserDetails,
	// The user has finished onboarding and can continue to the page in the url
	FinishedOnboarding,
	// The user has MFA configured and needs to enter a code
	EnterMultiFactorCode,
}

export default function LoginForm() {
	const [signUpParam] = useQueryParam('sign_up', BooleanParam)
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const [formState, setFormState] = useState<LoginFormState>(
		signUpParam ? LoginFormState.SignUp : LoginFormState.SignIn,
	)
	const [resolver, setResolver] =
		useState<firebase.auth.MultiFactorResolver>()
	const { isAuthLoading, isLoggedIn, admin } = useAuthContext()
	const [firebaseError, setFirebaseError] = useState('')
	const { setLoadingState: setIsLoading } = useAppLoadingContext()
	const [isLoadingFirebase, setIsLoadingFirebase] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		setIsLoadingFirebase(true)
		if (formState === LoginFormState.SignIn) {
			auth.signInWithEmailAndPassword(email, password)
				.then(() => {})
				.catch((error: firebase.auth.MultiFactorError) => {
					if (error.code == 'auth/multi-factor-auth-required') {
						setResolver(error.resolver)
						setFormState(LoginFormState.EnterMultiFactorCode)
					} else {
						setError(error.toString())
					}
				})
				.finally(() => setIsLoadingFirebase(false))
		} else if (formState === LoginFormState.ResetPassword) {
			if (!email.length) {
				message.warning('Please enter your email.')
				return
			}
			auth.sendPasswordResetEmail(email)
				.catch(() => {
					// swallow error if user does not exist
				})
				.finally(() => {
					message.success(
						'Password reset email sent (if a user exists)!',
					)
					setIsLoadingFirebase(false)
					setTimeout(() => {
						setFormState(LoginFormState.SignIn)
					}, 1000)
				})
		}
	}

	const changeState = (nextState: LoginFormState) => {
		setFormState(nextState)
		setError(null)
	}

	useEffect(() => {
		if (isAuthLoading) {
			setIsLoading(AppLoadingState.LOADING)
		}
	}, [isAuthLoading, setIsLoading])

	useEffect(() => {
		if (isLoggedIn && admin) {
			if (admin.email_verified === false) {
				setFormState(LoginFormState.VerifyEmail)
			} else if (!admin.about_you_details_filled) {
				setFormState(LoginFormState.MissingUserDetails)
			} else {
				setFormState(LoginFormState.FinishedOnboarding)
			}
		} else if (
			!isLoggedIn &&
			formState === LoginFormState.FinishedOnboarding
		) {
			setFormState(LoginFormState.SignIn)
		}
	}, [admin, admin?.email_verified, formState, isLoggedIn])

	useEffect(() => {
		// This is loaded on every page, but we only want to track pageviews when we
		// are on the login page.
		if (isAuthLoading || isLoggedIn) {
			return
		}

		analytics.page(`/login`, { page: LoginFormState[formState] })
	}, [formState, isAuthLoading, isLoggedIn])

	if (isAuthLoading) {
		return null
	}

	if (isLoggedIn && formState === LoginFormState.VerifyEmail) {
		return (
			<VerifyEmailCard
				onStartHandler={() => {
					setFormState(LoginFormState.Unknown)
				}}
			/>
		)
	} else if (
		isLoggedIn &&
		(formState === LoginFormState.FinishedOnboarding ||
			isVercelIntegrationFlow) // Do not show the about you page if this is during the Vercel integration flow
	) {
		return <AuthAdminRouter />
	} else if (isLoggedIn && formState === LoginFormState.MissingUserDetails) {
		return (
			<AboutYouPage
				onSubmitHandler={() => {
					setFormState(LoginFormState.Unknown)
				}}
			/>
		)
	}

	function getLoginTitleText() {
		if (formState === LoginFormState.ResetPassword) {
			return 'Reset your password'
		}
		if (formState === LoginFormState.SignIn) {
			return 'Welcome back to Highlight.'
		}
		return 'Welcome to Highlight.'
	}

	if (formState === LoginFormState.EnterMultiFactorCode) {
		return <VerifyPhone resolver={resolver} />
	}

	if (formState === LoginFormState.SignUp) {
		return <SignUp />
	}

	return (
		<Landing>
			<AuthPageLayout title={getLoginTitleText()}>
				<form onSubmit={onSubmit} className={styles.loginForm}>
					<div className={styles.loginTitleWrapper}>
						<p className={styles.loginSubTitle}>
							{formState === LoginFormState.SignIn ? (
								<>
									New here?{' '}
									<span
										onClick={() => {
											changeState(LoginFormState.SignUp)
										}}
										className={styles.loginStateSwitcher}
									>
										Create an account.
									</span>
								</>
							) : formState === LoginFormState.ResetPassword ? (
								<>
									Want to{' '}
									<span
										onClick={() => {
											changeState(LoginFormState.SignIn)
										}}
										className={styles.loginStateSwitcher}
									>
										sign in
									</span>{' '}
									again?
								</>
							) : (
								<>
									Already have an account?{' '}
									<span
										onClick={() => {
											changeState(LoginFormState.SignIn)
										}}
										className={styles.loginStateSwitcher}
									>
										Sign in.
									</span>
								</>
							)}
						</p>
					</div>
					<div className={styles.inputContainer}>
						<Input
							placeholder="Email"
							name="email"
							type="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
							}}
							autoFocus
							required
						/>
						{formState !== LoginFormState.ResetPassword && (
							<Input
								placeholder="Password"
								type="password"
								name="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value)
								}}
								required
							/>
						)}
					</div>
					{error && (
						<div className={commonStyles.errorMessage}>{error}</div>
					)}
					{formState !== LoginFormState.ResetPassword && (
						<span
							onClick={() => {
								changeState(LoginFormState.ResetPassword)
							}}
							className={classNames(
								styles.loginStateSwitcher,
								styles.resetPasswordText,
							)}
						>
							Forgot your password?
						</span>
					)}
					<Button
						block
						trackingId="LoginSignInUp"
						className="mt-2"
						type="primary"
						htmlType="submit"
						loading={isLoadingFirebase}
					>
						{formState === LoginFormState.SignIn
							? 'Sign In'
							: 'Reset Password'}
					</Button>
				</form>
				{formState !== LoginFormState.ResetPassword && (
					<>
						<p className={styles.otherSigninText}>
							or sign{' '}
							{formState === LoginFormState.SignIn ? 'in' : 'up'}{' '}
							with
						</p>
						<Button
							trackingId="LoginWithGoogle"
							className={classNames(
								commonStyles.secondaryButton,
								styles.googleButton,
							)}
							onClick={() => {
								auth.signInWithPopup(googleProvider).catch(
									(error: firebase.auth.MultiFactorError) => {
										if (
											error.code ===
											'auth/multi-factor-auth-required'
										) {
											setResolver(error.resolver)
											setFormState(
												LoginFormState.EnterMultiFactorCode,
											)
										} else {
											setFirebaseError(
												JSON.stringify(error.message),
											)
										}
									},
								)
							}}
							loading={isLoadingFirebase}
						>
							<GoogleLogo className={styles.googleLogoStyle} />
							<span className={styles.googleText}>
								Google Sign In
							</span>
						</Button>
						<div className={commonStyles.errorMessage}>
							{firebaseError}
						</div>
					</>
				)}
			</AuthPageLayout>
		</Landing>
	)
}

interface VerifyPhoneProps {
	resolver?: firebase.auth.MultiFactorResolver
}

export const VerifyPhone: React.FC<VerifyPhoneProps> = ({ resolver }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>()
	const [verificationId, setVerificationId] = useState<string>('')
	const [verificationCode, setVerificationCode] = useState<string>('')
	const recaptchaVerifier = useRef<firebase.auth.ApplicationVerifier>()
	const phoneAuthProvider = new firebase.auth.PhoneAuthProvider()

	useEffect(() => {
		recaptchaVerifier.current = new firebase.auth.RecaptchaVerifier(
			'recaptcha',
			{
				size: 'invisible',
			},
		)
	}, [])

	useEffect(() => {
		const sendAuthCode = async () => {
			// Should never not be set but the check is necessary for types.
			if (!recaptchaVerifier.current || !resolver) {
				return
			}

			const vId = await phoneAuthProvider.verifyPhoneNumber(
				{
					multiFactorHint: resolver.hints[0],
					session: resolver.session,
				},
				recaptchaVerifier.current,
			)

			setVerificationId(vId)
		}

		sendAuthCode()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleSubmit = useCallback(
		async (e?: FormEvent<HTMLFormElement>) => {
			if (!resolver) {
				return
			}

			e?.preventDefault()
			setLoading(true)
			setError(null)

			try {
				const cred = firebase.auth.PhoneAuthProvider.credential(
					verificationId,
					verificationCode,
				)
				const multiFactorAssertion =
					firebase.auth.PhoneMultiFactorGenerator.assertion(cred)

				await resolver.resolveSignIn(multiFactorAssertion)
			} catch (error: any) {
				setError(error.message)
			} finally {
				setLoading(false)
			}
		},
		[resolver, verificationCode, verificationId],
	)

	useEffect(() => {
		if (verificationCode.length >= 6) {
			handleSubmit()
		}
	}, [handleSubmit, verificationCode])

	return (
		<Landing>
			<AuthPageLayout
				title="Verify via SMS"
				description="Enter the code we sent to your phone."
			>
				<form onSubmit={handleSubmit}>
					<Space direction="vertical" size="medium">
						{error && (
							<Alert
								shouldAlwaysShow
								closable={false}
								trackingId="2faVerifyError"
								type="error"
								description={error}
							/>
						)}

						<div className={styles.inputContainer}>
							<Input
								placeholder="Verification code"
								name="verification_code"
								value={verificationCode}
								onChange={(e) => {
									setVerificationCode(e.target.value)
								}}
								autoFocus
								required
								autoComplete="off"
							/>
						</div>

						<Button
							block
							type="primary"
							htmlType="submit"
							loading={loading}
							trackingId="setup2fa"
						>
							Submit
						</Button>
					</Space>
					<div id="recaptcha"></div>
				</form>
			</AuthPageLayout>
		</Landing>
	)
}

function AuthPageLayout({
	title,
	children,
	description,
}: {
	title: string
	children: ReactNode
	description?: string
}) {
	return (
		<div className="relative m-auto flex w-full max-w-6xl items-center justify-center gap-24">
			<section className="flex w-full max-w-md flex-col items-center gap-6">
				<div className="font-poppins flex flex-col items-center gap-2 text-center font-semibold">
					<h2 className="text-4xl tracking-wide text-white">
						{title}
					</h2>

					{!!description && (
						<p className="text-xl tracking-wider text-white">
							{description}
						</p>
					)}
				</div>

				<div className="w-full rounded-md bg-white px-8 py-6">
					{children}
				</div>
			</section>
		</div>
	)
}
