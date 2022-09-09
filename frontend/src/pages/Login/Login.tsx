import { useAuthContext } from '@authentication/AuthContext'
import Alert from '@components/Alert/Alert'
import Input from '@components/Input/Input'
import Space from '@components/Space/Space'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import AboutYouPage from '@pages/AboutYou/AboutYouCard'
import VerifyEmailCard from '@pages/Login/components/VerifyEmailCard/VerifyEmailCard'
import useLocalStorage from '@rehooks/local-storage'
import { AppRouter } from '@routers/AppRouter/AppRouter'
import { auth, googleProvider } from '@util/auth'
import { message } from 'antd'
import classNames from 'classnames'
import firebase from 'firebase'
import { H } from 'highlight.run'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import { BooleanParam, useQueryParam } from 'use-query-params'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import { ReactComponent as GoogleLogo } from '../../static/google.svg'
import { Landing } from '../Landing/Landing'
import styles from './Login.module.scss'

export const AuthAdminRouter = () => {
	const { isAuthLoading, admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	useEffect(() => {
		if (admin) {
			const { email, id, name } = admin
			let identifyMetadata: {
				id: string
				avatar?: string
				name: string
				highlightDisplayName?: string
				email?: string
			} = {
				id,
				name,
			}

			if (admin.photo_url) {
				identifyMetadata = {
					...identifyMetadata,
					avatar: admin.photo_url,
				}
			}
			H.identify(email, identifyMetadata)
			window.analytics.identify(email, identifyMetadata)
			H.getSessionURL()
				.then((sessionUrl) => {
					window.Intercom('boot', {
						app_id: 'gm6369ty',
						alignment: 'right',
						hide_default_launcher: true,
						email: admin?.email,
						user_id: admin?.uid,
						sessionUrl,
					})
				})
				.catch(() => {
					window.Intercom('boot', {
						app_id: 'gm6369ty',
						alignment: 'right',
						hide_default_launcher: true,
						email: admin?.email,
						user_id: admin?.uid,
					})
				})
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

// TODO:
//  - Google Sign In
const LoginForm = () => {
	const [signUpParam] = useQueryParam('sign_up', BooleanParam)
	const [formState, setFormState] = useState<LoginFormState>(
		signUpParam ? LoginFormState.SignUp : LoginFormState.SignIn,
	)
	// TODO: Look into better types
	const [resolver, setResolver] = useState<any>()
	const [, setSignUpReferral] = useLocalStorage('HighlightSignUpReferral', '')
	const { isAuthLoading, isLoggedIn, admin } = useAuthContext()
	const [firebaseError, setFirebaseError] = useState('')
	const { setLoadingState: setIsLoading } = useAppLoadingContext()
	const [isLoadingFirebase, setIsLoadingFirebase] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [passwordConfirmation, setPasswordConfirmation] = useState('')
	const [error, setError] = useState<string | null>(null)
	const history = useHistory<{ previousPathName?: string }>()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		setIsLoadingFirebase(true)
		if (formState === LoginFormState.SignIn) {
			auth.signInWithEmailAndPassword(email, password)
				.then(() => {})
				.catch((error) => {
					if (error.code == 'auth/multi-factor-auth-required') {
						console.log(error.resolver)
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
		} else {
			auth.createUserWithEmailAndPassword(email, password)
				.then(() => {
					auth.currentUser?.sendEmailVerification()
				})
				.catch((error) => {
					setError(error.toString())
				})
				.finally(() => setIsLoadingFirebase(false))

			// Redirect the user to their initial path instead to creating a new workspace.
			// We do this because this happens when a new user clicks on a Highlight link that was shared to them and they don't have an account yet.
			if (history.location.state?.previousPathName) {
				history.push(history.location.state.previousPathName)
			}
		}
	}

	const changeState = (nextState: LoginFormState) => {
		setFormState(nextState)
		setError(null)
	}

	// Record where the new user was referred from.
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const ref = urlParams.get('ref') || document.referrer

		setSignUpReferral(ref)
	}, [setSignUpReferral])

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
	} else if (isLoggedIn && formState === LoginFormState.MissingUserDetails) {
		return (
			<AboutYouPage
				onSubmitHandler={() => {
					setFormState(LoginFormState.Unknown)
				}}
			/>
		)
	} else if (isLoggedIn && formState === LoginFormState.FinishedOnboarding) {
		// TODO: Figure out why we aren't getting here :thinking:
		return <AuthAdminRouter />
	}

	if (formState === LoginFormState.EnterMultiFactorCode) {
		return <VerifyPhone resolver={resolver} />
	}

	return (
		<Landing>
			<div className={styles.loginPage}>
				<div className={styles.loginFormWrapper}>
					<form onSubmit={onSubmit} className={styles.loginForm}>
						<div className={styles.loginTitleWrapper}>
							<h2 className={styles.loginTitle}>
								{formState === LoginFormState.ResetPassword ? (
									<>Reset your Password.</>
								) : (
									<>
										Welcome{' '}
										{formState === LoginFormState.SignIn &&
											'back'}{' '}
										to Highlight.
									</>
								)}
							</h2>
							<p className={styles.loginSubTitle}>
								{formState === LoginFormState.SignIn ? (
									<>
										New here?{' '}
										<span
											onClick={() => {
												changeState(
													LoginFormState.SignUp,
												)
											}}
											className={
												styles.loginStateSwitcher
											}
										>
											Create an account.
										</span>
									</>
								) : formState ===
								  LoginFormState.ResetPassword ? (
									<>
										Want to{' '}
										<span
											onClick={() => {
												changeState(
													LoginFormState.SignIn,
												)
											}}
											className={
												styles.loginStateSwitcher
											}
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
												changeState(
													LoginFormState.SignIn,
												)
											}}
											className={
												styles.loginStateSwitcher
											}
										>
											Sign in.
										</span>
									</>
								)}
							</p>
						</div>
						<div className={styles.inputContainer}>
							<Input
								placeholder={'Email'}
								name="email"
								type={'email'}
								value={email}
								onChange={(e) => {
									setEmail(e.target.value)
								}}
								autoFocus
								required
							/>
							{formState !== LoginFormState.ResetPassword && (
								<Input
									placeholder={'Password'}
									type="password"
									name="password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value)
									}}
									required
								/>
							)}
							{formState === LoginFormState.SignUp && (
								<>
									<Input
										placeholder={'Confirm Password'}
										type="password"
										name="confirm-password"
										required
										value={passwordConfirmation}
										onChange={(e) => {
											setPasswordConfirmation(
												e.target.value,
											)
										}}
									/>
								</>
							)}
						</div>
						{error && (
							<div className={commonStyles.errorMessage}>
								{error}
							</div>
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
							trackingId="LoginSignInUp"
							className={commonStyles.submitButton}
							type="primary"
							htmlType="submit"
							loading={isLoadingFirebase}
						>
							{formState === LoginFormState.SignIn
								? 'Sign In'
								: formState === LoginFormState.SignUp
								? 'Sign Up'
								: 'Reset Password'}
						</Button>
					</form>
					{formState !== LoginFormState.ResetPassword && (
						<>
							<p className={styles.otherSigninText}>
								or sign{' '}
								{formState === LoginFormState.SignIn
									? 'in'
									: 'up'}{' '}
								with
							</p>
							<Button
								trackingId="LoginWithGoogle"
								className={classNames(
									commonStyles.secondaryButton,
									styles.googleButton,
								)}
								onClick={() => {
									auth.signInWithRedirect(
										googleProvider,
									).catch((e) =>
										setFirebaseError(JSON.stringify(e)),
									)
								}}
								loading={isLoadingFirebase}
							>
								<GoogleLogo
									className={styles.googleLogoStyle}
								/>
								<span className={styles.googleText}>
									Google Sign{' '}
									{formState === LoginFormState.SignIn
										? 'In'
										: 'Up'}
								</span>
							</Button>
							<div className={commonStyles.errorMessage}>
								{firebaseError}
							</div>
						</>
					)}
				</div>
			</div>
		</Landing>
	)
}

interface VerifyPhoneProps {
	resolver: any
}

export const VerifyPhone: React.FC<VerifyPhoneProps> = ({ resolver }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>()
	const [verificationCode, setVerificationCode] = useState<string>('')
	const recaptchaVerifier = useRef<any>()
	const phoneAuthProvider = new firebase.auth.PhoneAuthProvider()

	useEffect(() => {
		recaptchaVerifier.current = new firebase.auth.RecaptchaVerifier(
			'recaptcha',
			{
				size: 'invisible',
			},
		)
	}, [])

	const verify = async () => {
		setLoading(true)
		setError(null)

		try {
			const verificationId = await phoneAuthProvider.verifyPhoneNumber(
				{
					multiFactorHint: resolver.hints[0],
					session: resolver.session,
				},
				recaptchaVerifier.current,
			)

			const cred = firebase.auth.PhoneAuthProvider.credential(
				verificationId,
				verificationCode,
			)
			const multiFactorAssertion =
				firebase.auth.PhoneMultiFactorGenerator.assertion(cred)

			await resolver.resolveSignIn(multiFactorAssertion)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Landing>
			<div className={styles.loginPage}>
				<div className={styles.loginFormWrapper}>
					<div className={styles.loginTitleWrapper}>
						<h2 className={styles.loginTitle}>Verify via SMS</h2>
						<p className={styles.loginSubTitle}>
							Enter the code we sent to your phone.
						</p>
					</div>

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
							className={commonStyles.submitButton}
							type="primary"
							htmlType="submit"
							loading={loading}
							trackingId="setup2fa"
							onClick={verify}
						>
							Submit
						</Button>
					</Space>
				</div>
			</div>
			<div id="recaptcha"></div>
		</Landing>
	)
}

export default LoginForm
