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
import { useHistory } from 'react-router'
import { BooleanParam, StringParam, useQueryParam } from 'use-query-params'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import { ReactComponent as GoogleLogo } from '../../static/google.svg'
import heroBugLeft from '../../static/hero-bug-left.gif'
import heroBugRight from '../../static/hero-bug-right.gif'
import lorilynMcCueAvatar from '../../static/lorilyn-mccue-avatar.jpeg'
import { Landing } from '../Landing/Landing'
import styles from './Login.module.scss'

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
		} else {
			auth.createUserWithEmailAndPassword(email, password)
				.then(() => {
					auth.currentUser?.sendEmailVerification()

					if (auth.currentUser?.email) {
						analytics.track('Sign up', {
							email: auth.currentUser.email,
						})
					}
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

	const getLoginDescriptionText = () => {
		if (formState === LoginFormState.SignUp) {
			return "It's time to squash some bugs."
		}
	}

	if (formState === LoginFormState.EnterMultiFactorCode) {
		return <VerifyPhone resolver={resolver} />
	}

	return (
		<Landing>
			<AuthPageLayout
				title={getLoginTitleText()}
				description={getLoginDescriptionText()}
				showTestimonial={formState === LoginFormState.SignUp}
			>
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
						{formState === LoginFormState.SignUp && (
							<>
								<Input
									placeholder="Confirm Password"
									type="password"
									name="confirm-password"
									required
									value={passwordConfirmation}
									onChange={(e) => {
										setPasswordConfirmation(e.target.value)
									}}
								/>
							</>
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
							: formState === LoginFormState.SignUp
							? 'Sign Up'
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
				showTestimonial={false}
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
	showTestimonial = false,
	children,
	description,
}: {
	title: string
	showTestimonial: boolean
	children: ReactNode
	description?: string
}) {
	const heroBugClass = classNames(
		'pointer-events-none absolute h-56 w-56 object-contain hidden xl:block',
	)

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

			{showTestimonial && (
				<>
					<img
						src={heroBugLeft}
						className={classNames(heroBugClass, '-left-56')}
						style={{ transform: 'rotate(-30deg)' }} // tailwind rotate class doesn't work for some reason
					/>

					<img
						src={heroBugRight}
						className={classNames(
							heroBugClass,
							'-right-56 -top-28',
						)}
					/>

					<div className="hidden min-w-0 flex-1 xl:block">
						<Testimonial />
					</div>
				</>
			)}
		</div>
	)
}

function Testimonial() {
	return (
		<div className="font-poppins flex flex-col gap-8 tracking-wide text-white">
			<p className="text-2xl font-semibold leading-normal tracking-wider text-white">
				<span className="text-highlight-1">
					No matter your team size
				</span>
				, Highlight makes debugging and fixing bugs faster than ever.
			</p>
			<blockquote className="border-y-0 border-l-2 border-r-0 border-solid border-white pr-32 pl-8 text-lg">
				<p className="relative font-semibold text-white">
					<span
						aria-hidden
						className="absolute right-full -top-3 block select-none pr-2 text-4xl "
					>
						“
					</span>
					<span className="leading-9">
						Highlight helps me see behind the scenes, to understand
						the “why” behind the “what” I see in the event logs.
						Before Highlight, I was flying blind. Now I can see
						exactly where users are succeeding, failing and running
						into issues.
					</span>
					<span
						aria-hidden
						className="relative -top-3 inline-block select-none pl-2 align-text-top text-4xl"
					>
						”
					</span>
				</p>
				<div className="flex items-center gap-4">
					<img
						src={lorilynMcCueAvatar}
						alt=""
						className="h-12 w-12 rounded-full"
					/>
					<p className="text-base text-white">
						<span className="font-semibold">Lorilyn McCue</span>,
						Head of Product at Impira
					</p>
				</div>
			</blockquote>
			<section>
				<p className="m-0 text-lg font-semibold text-white">
					Trusted by teams everywhere
				</p>
				<div className="mt-2 flex gap-x-12 gap-y-3">
					<PipeLogo />
					<ImpiraLogo />
					<MageLogo />
					<AirplaneLogo />
				</div>
			</section>
		</div>
	)
}

function PipeLogo() {
	return (
		<svg
			width="97"
			height="30"
			viewBox="0 0 97 30"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_1507_1735)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M36.3508 29.1929V21.8729C36.5036 21.9904 36.6436 22.1078 36.7709 22.2252C37.0509 22.4731 37.3054 22.695 37.5854 22.8776C40.5001 24.874 44.9549 24.1563 47.4369 21.2466C49.4988 18.8327 50.0588 15.9883 49.5242 12.8959C48.8242 8.77268 46.2023 5.58896 41.7093 5.43238C39.5965 5.35409 37.7127 5.90211 36.2872 7.6375C36.2745 7.6636 36.2363 7.68969 36.1726 7.71579C36.1345 7.72884 36.0963 7.75493 36.0454 7.78103V6.03259H31.2979V29.1929H36.3508V29.1929ZM40.411 19.1328C38.0946 19.1328 36.1472 17.1234 36.1217 14.7095H36.1345C36.2236 12.7262 37.5345 10.3254 40.3601 10.3254C41.5056 10.3254 42.5875 10.7821 43.3894 11.6172C44.1912 12.4392 44.6367 13.5744 44.624 14.7356C44.5985 17.1887 42.7403 19.1459 40.411 19.1459V19.1328Z"
					fill="white"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M64.4568 29.196V21.9674C64.6731 22.1239 64.8768 22.2675 65.0677 22.4241C65.5005 22.7372 65.9077 23.0504 66.3405 23.2852C69.5479 24.9423 73.8882 23.7419 76.0646 20.6234C77.8847 18.0008 78.2156 15.0911 77.4392 12.0639C76.6374 8.86713 74.8427 6.50543 71.5589 5.74865C68.8479 5.12234 66.2769 5.42244 64.304 7.77109C64.304 7.77109 64.2786 7.77109 64.2404 7.77109C64.2149 7.77109 64.1767 7.75805 64.1386 7.745V6.10094H59.4165V29.196H64.4568ZM68.517 19.1359C66.175 19.1359 64.2404 17.1135 64.2277 14.7127C64.3295 12.7163 65.6532 10.3416 68.4788 10.3416C69.6116 10.3416 70.7062 10.7982 71.508 11.6333C72.3099 12.4684 72.7554 13.5905 72.7299 14.7518C72.6917 17.2048 70.8462 19.162 68.517 19.149V19.1359Z"
					fill="white"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M83.7094 15.9013H96.0937C96.8192 12.2609 94.9227 7.14605 89.9079 5.76296C85.1477 4.45815 80.4638 7.11995 79.1528 11.7912C77.8037 16.5798 80.3874 21.4859 84.9949 22.869C89.8315 24.3173 94.1081 21.4467 95.61 17.5062C95.5973 17.5062 95.5973 17.5062 95.5973 17.4932L95.5718 17.4671C95.2027 17.4671 94.8336 17.4671 94.4772 17.4671C93.3572 17.4671 92.2371 17.4671 91.1171 17.4801C90.7861 17.4801 90.4679 17.6236 90.2134 17.8455C89.1697 18.8762 87.9224 19.1764 86.5096 18.9545C84.944 18.6936 83.7221 17.3757 83.7094 15.9013V15.9013ZM86.9678 9.71652C89.1824 9.55994 90.8625 10.6429 91.2189 12.5349H83.8367C83.8749 11.2562 85.2495 9.83395 86.9678 9.71652Z"
					fill="white"
				/>
				<path
					d="M0 29.1929V28.7362C0 22.9559 0 17.1887 0 11.4215C0 8.43346 1.94737 5.98043 4.79843 5.53679C6.04576 5.34107 7.35674 5.49765 8.71863 5.49765V22.9951C8.71863 26.6224 6.21123 29.1668 2.64741 29.1799C1.79464 29.1799 0.941867 29.1799 0 29.1799V29.1929Z"
					fill="white"
				/>
				<path
					d="M11.6221 19.2676V0.491455C13.2385 0.582791 14.855 0.282686 16.4205 0.8568C18.7243 1.69188 20.2898 3.97528 20.328 6.58489C20.3662 8.67258 20.3534 10.7733 20.3407 12.861C20.328 16.4362 18.1006 19.0197 14.7786 19.2676C13.7476 19.3328 12.7167 19.2676 11.6221 19.2676V19.2676Z"
					fill="white"
				/>
				<path
					d="M56.4958 23.2598H51.6465V6.42786H56.4958V23.2598Z"
					fill="white"
				/>
				<path
					d="M56.4958 0.491455V4.44501H51.6465V0.491455H56.4958Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1507_1735">
					<rect
						width="96.2486"
						height="28.7057"
						fill="white"
						transform="translate(0 0.491455)"
					/>
				</clipPath>
			</defs>
		</svg>
	)
}

function ImpiraLogo() {
	return (
		<svg
			width="118"
			height="27"
			viewBox="0 0 118 27"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_1507_1743)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M30.4127 11.3705C30.7285 8.62477 30.4335 6.39847 29.4845 4.36422L29.4769 4.34745C29.0275 3.33288 27.9095 2.55162 26.8149 3.00194C26.1771 3.26022 25.5299 3.87917 23.5645 6.70289C22.2952 8.52631 20.6762 9.97432 18.8071 11.001C18.9107 11.1937 19.0147 11.3916 19.1196 11.5956C20.5269 14.3313 21.7743 16.5165 23.9221 17.6787C25.0399 18.2838 26.1587 18.4435 27.0722 18.1277C27.7781 17.884 28.3583 17.3744 28.8023 16.6096C29.6346 15.0272 30.1953 13.2613 30.4127 11.3705V11.3705ZM16.267 24.3186C20.0642 24.3188 23.5936 22.7506 26.19 20.1565C25.1738 20.1771 24.1002 19.8966 23.0541 19.3304C20.2324 17.8032 18.7089 14.8414 17.4846 12.4617C17.3641 12.2276 17.2449 12.002 17.1268 11.7842C15.8066 12.2973 14.3902 12.6205 12.9066 12.7435C15.3206 14.0428 17.3237 15.6967 17.4792 18.2736C17.5943 20.1814 16.4211 21.9025 14.3406 22.8776C13.6011 23.2243 12.7373 23.4728 11.8153 23.5855C12.7142 23.8902 13.6561 24.1062 14.633 24.2219C15.1815 24.287 15.7273 24.3186 16.267 24.3186V24.3186ZM6.2932 20.0985C8.3988 22.0589 11.5279 22.1342 13.5673 21.1783C14.2219 20.8715 15.7346 19.9852 15.6383 18.388C15.4824 15.8079 12.0975 14.3208 8.82405 12.8829C7.95012 12.4991 7.05006 12.1031 6.22804 11.6905C4.56163 10.9217 3.11985 9.79012 2.15183 8.42904C1.75552 12.9148 3.391 17.1356 6.2932 20.0985V20.0985ZM2.95873 4.71049C2.74077 5.4292 2.95873 6.32248 3.57263 7.22587C4.2279 8.19049 5.36783 9.19115 6.83363 9.90689L6.83422 9.90582C6.85941 9.91878 6.88554 9.93163 6.91097 9.94459C7.96981 10.4504 9.19469 10.8071 10.5288 10.8951C12.5361 11.0278 14.4421 10.7651 16.167 10.1436C14.672 7.79106 13.2781 6.53451 11.5978 5.14797C10.0534 3.87358 7.52968 2.85901 5.92326 2.85901C5.89771 2.85901 5.8724 2.85925 5.84733 2.85984C4.38082 2.89005 3.30089 3.58188 2.95873 4.71049V4.71049ZM26.1267 1.26521C28.0228 0.485852 30.2319 1.49769 31.1554 3.57154C32.2557 5.93423 32.602 8.48183 32.2448 11.5875C32.0275 13.4767 31.5061 15.255 30.7363 16.877L30.7388 16.8781C30.6404 17.0989 30.5336 17.3099 30.419 17.5103C27.6574 22.7416 22.2573 26.1902 16.2683 26.1905C15.6572 26.1905 15.0404 26.1548 14.4192 26.081C10.7438 25.6459 7.50331 23.9596 5.05168 21.4847C5.00351 21.4398 4.95559 21.3945 4.90813 21.3483L4.91305 21.343C1.58878 17.9048 -0.235598 12.9969 0.360379 7.81247C0.504862 6.55639 0.788086 5.32064 1.2022 4.13911C1.78775 2.24161 3.55107 1.03511 5.80983 0.988381C7.84735 0.94688 10.8401 2.11033 12.7614 3.69568C14.5833 5.19899 16.1735 6.6382 17.8733 9.37975C19.522 8.48552 20.9463 7.2198 22.0579 5.62291C24.1199 2.66054 24.9944 1.72386 26.1267 1.26521V1.26521ZM42.3923 20.9003V7.13978H45.7638V20.9003H42.3923ZM44.0539 0.996443C45.1584 0.996443 45.975 1.84085 45.975 2.90905C45.975 4.00186 45.1584 4.8465 44.0539 4.8465C42.9732 4.8465 42.181 4.00186 42.181 2.90905C42.181 1.84085 42.9732 0.996443 44.0539 0.996443V0.996443ZM64.6922 6.92127C67.6088 6.92127 69.5086 8.85968 69.5086 11.5627V20.9004H66.137V12.5182C66.137 10.8801 65.254 9.84274 63.6754 9.84274C61.8557 9.84274 60.8123 11.4534 60.8123 13.8834V20.9004H57.4407V12.5182C57.4407 10.8801 56.5846 9.84274 55.0326 9.84274C53.1864 9.84274 52.1428 11.4809 52.1428 13.9106V20.9004H48.7712V7.13972H52.1428V9.24199C52.8919 7.87674 54.1496 6.92127 56.0227 6.92127C58.1633 6.92127 59.6081 7.84951 60.2235 9.51501C60.946 8.12277 62.5515 6.92127 64.6922 6.92127V6.92127ZM79.2383 18.1427C81.3789 18.1427 82.7969 16.5045 82.7969 14.02C82.7969 11.5354 81.3789 9.89734 79.2383 9.89734C77.0707 9.89734 75.6524 11.5354 75.6524 14.02C75.6524 16.5045 77.0707 18.1427 79.2383 18.1427ZM79.8805 6.9213C83.7604 6.9213 86.1417 9.81529 86.1417 14.02C86.1417 18.2244 83.5998 21.1189 79.6396 21.1189C78.0877 21.1189 76.6426 20.5182 75.8669 19.5352V25.7873H72.4954V7.13986H75.8669V8.72331C76.6159 7.65832 78.0877 6.9213 79.8805 6.9213V6.9213ZM88.1493 20.9003V7.13978H91.5208V20.9003H88.1493ZM97.7497 9.65153C98.4186 8.0953 100.185 6.92139 101.817 6.92139C102.299 6.92139 102.887 7.00308 103.289 7.13983L103.258 10.5381C102.776 10.3197 101.951 10.143 101.362 10.143C99.4621 10.143 97.7497 11.754 97.7497 15.8494V20.9001H94.3782V7.13983H97.7497V9.65153ZM110.813 18.1427C112.98 18.1427 114.399 16.5045 114.399 14.02C114.399 11.5354 112.98 9.89734 110.813 9.89734C108.672 9.89734 107.254 11.5354 107.254 14.02C107.254 16.5045 108.672 18.1427 110.813 18.1427ZM114.185 7.13986H117.556V20.9001H114.185V19.317C113.515 20.4089 112.017 21.1189 110.331 21.1189C106.291 21.1189 103.91 18.2244 103.91 14.02C103.91 9.81529 106.291 6.9213 110.278 6.9213C111.964 6.9213 113.409 7.63109 114.185 8.66861V7.13986ZM89.8111 0.996039C90.9155 0.996039 91.732 1.84068 91.732 2.909C91.732 4.00193 90.9155 4.8467 89.8111 4.8467C88.7304 4.8467 87.9381 4.00193 87.9381 2.909C87.9381 1.84068 88.7304 0.996039 89.8111 0.996039V0.996039Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1507_1743">
					<rect
						width="117.356"
						height="25.3286"
						fill="white"
						transform="translate(0.248535 0.86853)"
					/>
				</clipPath>
			</defs>
		</svg>
	)
}

function MageLogo() {
	return (
		<svg
			width="122"
			height="31"
			viewBox="0 0 122 31"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_1507_1745)">
				<path
					d="M68.6163 21.9569H65.1637V12.9046L59.5719 21.9569H57.0937L51.5019 12.9046V21.9569H48.0493V8.76343H52.7092L58.3222 18.0654L63.9352 8.76343H68.5951V21.9569H68.6163Z"
					fill="white"
				/>
				<path
					d="M83.1286 19.1475H75.1009L73.6606 21.9569H69.8691L76.7954 8.76343H81.4553L88.4027 21.9569H84.5901L83.1286 19.1475ZM81.8577 16.6296L79.1253 11.2814L76.3718 16.6296H81.8577Z"
					fill="white"
				/>
				<path
					d="M96.1756 14.8593H104.69V21.9347H102.149L102 19.8537C100.73 21.2064 98.7173 22.122 95.8579 22.122C90.9015 22.122 87.8726 19.708 87.8726 15.338C87.8726 10.9679 90.9015 8.55396 96.4298 8.55396C101.81 8.55396 104.479 10.6141 104.69 13.8813H101.174C100.984 12.8824 100.052 11.3841 96.4086 11.3841C91.9182 11.3841 91.3039 13.8189 91.3039 15.4004C91.3039 17.0028 91.9393 19.4999 96.4086 19.4999C99.7552 19.4999 101.09 18.0641 101.174 17.0652H96.1756V14.8593Z"
					fill="white"
				/>
				<path
					d="M110.599 11.4687V14.1532H121.337V16.6087H110.599V19.2932H121.337V21.9985H107.146V8.76343H121.337V11.4687H110.599Z"
					fill="white"
				/>
				<path
					d="M39.1106 1.06924L24.0923 29.6293H16.7644L31.7827 1.06924H39.1106Z"
					stroke="white"
					strokeWidth="0.844286"
				/>
				<path
					d="M39.7905 0.647095H31.5298V30.0514H39.7905V0.647095Z"
					fill="white"
				/>
				<path
					d="M8.88634 30.0514H0.604492L16.0668 0.647095H24.3486L8.88634 30.0514Z"
					fill="white"
				/>
				<path
					d="M24.3261 0.647095H16.0654V30.0514H24.3261V0.647095Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1507_1745">
					<rect
						width="120.733"
						height="29.55"
						fill="white"
						transform="translate(0.604492 0.647095)"
					/>
				</clipPath>
			</defs>
		</svg>
	)
}

function AirplaneLogo() {
	return (
		<svg
			width="133"
			height="32"
			viewBox="0 0 133 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_1507_1754)">
				<path
					d="M56.5585 12.9823C55.1151 12.9823 53.9236 13.3217 53.0069 13.9779C52.0674 14.6342 51.5634 15.5618 51.4029 16.7385H53.3506C53.4654 16.1276 53.8319 15.6296 54.3818 15.2677C54.9088 14.9057 55.6191 14.7247 56.444 14.7247C57.4065 14.7247 58.1398 14.9283 58.6897 15.3808C59.2167 15.8333 59.4687 16.4444 59.4687 17.2136V18.0284H55.8943C54.2903 18.0284 53.0989 18.3677 52.2739 19.0012C51.4262 19.635 51.0137 20.5852 51.0137 21.7845C51.0137 22.8705 51.4259 23.7079 52.2509 24.3414C53.0529 24.9749 54.1298 25.2919 55.4818 25.2919C57.2463 25.2919 58.598 24.6129 59.5605 23.278L59.721 25.1561H61.4164V17.3494C61.4164 15.9693 60.9809 14.883 60.1562 14.1363C59.3082 13.3669 58.0938 12.9823 56.5585 12.9823V12.9823ZM59.4917 20.2458C59.4917 21.2639 59.148 22.0787 58.4605 22.6895C57.7733 23.3233 56.8335 23.64 55.6421 23.64C54.8401 23.64 54.1986 23.459 53.7174 23.0968C53.2361 22.7348 53.0069 22.2597 53.0069 21.6714C53.0069 20.3363 53.9236 19.6802 55.7338 19.6802H59.4917V20.2458V20.2458Z"
					fill="white"
				/>
				<path
					d="M65.5413 8.50208C65.1748 8.50208 64.8768 8.61522 64.6248 8.86412C64.3728 9.11301 64.2583 9.40718 64.2583 9.76923C64.2583 10.1313 64.3728 10.4254 64.6248 10.6743C64.8768 10.9233 65.1748 11.0364 65.5413 11.0364C65.908 11.0364 66.2057 10.9233 66.4577 10.6743C66.71 10.4254 66.8245 10.1313 66.8245 9.76923C66.8245 9.40718 66.71 9.11301 66.4577 8.86412C66.2057 8.61522 65.885 8.50208 65.5413 8.50208Z"
					fill="white"
				/>
				<path
					d="M62.6323 14.9074H64.5573V25.135H66.5047V13.1423H62.6323V14.9074V14.9074Z"
					fill="white"
				/>
				<path
					d="M86.2795 13.7295C85.4088 13.2317 84.3778 13.0054 83.2551 13.0054C81.4906 13.0054 80.1159 13.6842 79.0849 15.0646L78.8327 13.1411H77.1372V29.8404H79.0849V23.3009C79.4972 23.9121 80.0471 24.3872 80.7344 24.7265C81.4219 25.0885 82.2926 25.2695 83.2551 25.2695C84.3778 25.2695 85.386 25.0207 86.2567 24.5003C87.1275 23.9799 87.8377 23.2557 88.342 22.3281C88.8459 21.4002 89.0752 20.3369 89.0752 19.1375C89.0752 17.8703 88.8459 16.7617 88.342 15.8338C87.8377 14.9288 87.1502 14.2047 86.2795 13.7295V13.7295ZM86.0045 22.3055C85.2713 23.1199 84.286 23.5498 83.0716 23.5498C82.2926 23.5498 81.6051 23.3688 81.0094 22.9842C80.3909 22.5996 79.9096 22.0563 79.5886 21.3776C79.2452 20.6989 79.0849 19.952 79.0849 19.0696C79.0849 18.2323 79.2452 17.463 79.5886 16.7843C79.9324 16.1279 80.3909 15.6076 81.0094 15.223C81.6051 14.861 82.2926 14.6797 83.0716 14.6797C84.286 14.6797 85.2713 15.0872 86.0045 15.9017C86.7377 16.7164 87.1047 17.8024 87.1047 19.0923C87.1047 20.4274 86.7377 21.4907 86.0045 22.3055Z"
					fill="white"
				/>
				<path
					d="M69.189 15.473V25.135H71.1364V14.9074H75.3526V13.1423H71.5489C70.2429 13.1423 69.189 14.1606 69.189 15.473V15.473Z"
					fill="white"
				/>
				<path
					d="M93.2922 8.66199H91.3447V25.1348H93.2922V8.66199Z"
					fill="white"
				/>
				<path
					d="M101.035 12.9823C99.5919 12.9823 98.4002 13.3217 97.4837 13.9779C96.5442 14.6342 96.0402 15.5618 95.8797 16.7385H97.8274C97.9419 16.1276 98.3087 15.6296 98.8587 15.2677C99.3856 14.9057 100.096 14.7247 100.921 14.7247C101.883 14.7247 102.616 14.9283 103.166 15.3808C103.693 15.8333 103.946 16.4444 103.946 17.2136V18.0284H100.371C98.7669 18.0284 97.5754 18.3677 96.7504 19.0012C95.9027 19.635 95.4902 20.5852 95.4902 21.7845C95.4902 22.8705 95.9027 23.7079 96.7277 24.3414C97.5297 24.9749 98.6064 25.2919 99.9584 25.2919C101.723 25.2919 103.075 24.6129 104.037 23.278L104.197 25.1561H105.893V17.3494C105.893 15.9693 105.458 14.883 104.633 14.1363C103.785 13.3669 102.571 12.9823 101.035 12.9823V12.9823ZM103.968 20.2458C103.968 21.2639 103.625 22.0787 102.937 22.6895C102.25 23.3233 101.31 23.64 100.119 23.64C99.3169 23.64 98.6752 23.459 98.1939 23.0968C97.7127 22.7348 97.4837 22.2597 97.4837 21.6714C97.4837 20.3363 98.4002 19.6802 100.21 19.6802H103.968V20.2458V20.2458Z"
					fill="white"
				/>
				<path
					d="M114.37 12.9823C112.628 12.9823 111.299 13.5706 110.36 14.7473L110.108 13.118H108.412V25.1109H110.36V19.1143C110.36 17.7792 110.703 16.6933 111.345 15.9238C111.987 15.1545 112.903 14.7473 114.026 14.7473C115.103 14.7473 115.905 15.0867 116.477 15.7201C117.027 16.3765 117.302 17.3267 117.302 18.5714V25.1335H119.25V18.4582C119.25 16.5801 118.792 15.1772 117.921 14.3173C117.05 13.4348 115.859 12.9823 114.37 12.9823V12.9823Z"
					fill="white"
				/>
				<path
					d="M132.84 19.4995C132.863 19.1149 132.886 18.8434 132.886 18.685C132.863 17.5309 132.611 16.5126 132.106 15.6528C131.602 14.7931 130.938 14.1141 130.09 13.6842C129.242 13.2316 128.257 13.0054 127.134 13.0054C126.011 13.0054 125.003 13.2543 124.133 13.7521C123.262 14.2725 122.574 14.9967 122.116 15.9243C121.612 16.8522 121.383 17.9155 121.383 19.1375C121.383 20.3369 121.635 21.4228 122.139 22.3281C122.643 23.2783 123.331 24.0026 124.224 24.5003C125.141 25.0207 126.172 25.2695 127.386 25.2695C128.761 25.2695 129.93 24.8623 130.892 24.0931C131.854 23.3236 132.45 22.3281 132.679 21.1061H130.709C130.502 21.8753 130.09 22.4638 129.494 22.8937C128.876 23.3462 128.142 23.5498 127.249 23.5498C126.126 23.5498 125.209 23.1878 124.499 22.4865C123.811 21.7848 123.422 20.8346 123.399 19.6579V19.4995H132.84H132.84ZM124.705 15.585C125.393 14.9967 126.194 14.6797 127.134 14.6797C128.165 14.6797 129.013 14.9515 129.7 15.5171C130.365 16.0827 130.754 16.8748 130.846 17.8929H123.514C123.605 16.9427 124.018 16.1732 124.705 15.585V15.585Z"
					fill="white"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M14.7525 0.802856L24.5655 0.805899C25.3089 0.805899 25.9852 1.2334 26.2994 1.90202C28.3268 6.21502 35.7914 22.092 38.8015 28.4944C39.078 29.0824 39.0328 29.7702 38.6817 30.3179C38.3302 30.8653 37.7214 31.1971 37.0676 31.1971H32.8036C31.3803 31.1971 30.0225 30.6071 29.0564 29.5703C28.24 28.6939 27.2689 27.6511 26.6123 26.9453C26.1289 26.4268 25.4498 26.1319 24.7385 26.1319C22.955 26.1319 16.2451 26.1295 14.4229 26.1295C13.7115 26.1295 13.0323 26.4242 12.5496 26.943C11.8923 27.6485 10.9212 28.6908 10.1053 29.5671C9.13932 30.6045 7.78092 31.194 6.35771 31.194H2.25038C1.59669 31.194 0.987909 30.8625 0.636323 30.3148C0.285234 29.7674 0.239828 29.0798 0.516418 28.4913C3.52662 22.0888 10.9912 6.212 13.0186 1.89897C13.3329 1.23035 14.009 0.802856 14.7525 0.802856ZM30.4502 25.3403C28.9385 21.7248 23.2852 9.35041 20.8193 3.96911C20.6128 3.51628 20.1585 3.22555 19.6574 3.22555C19.1568 3.22555 18.7022 3.51628 18.4955 3.96911C16.0307 9.34989 10.3793 21.7217 8.86783 25.3371C8.81476 25.4674 8.83058 25.6154 8.90918 25.7319C8.98828 25.8484 9.12042 25.9176 9.26178 25.9176H11.1871C11.9709 25.9176 12.7109 25.5605 13.1946 24.9481C13.9845 23.9487 15.2091 22.3993 15.9991 21.4C16.4829 20.7881 17.223 20.4305 18.0067 20.4305C18.7909 20.4305 20.5271 20.4336 21.3113 20.4336C22.095 20.4336 22.835 20.7907 23.3189 21.4026C24.1088 22.4025 25.3335 23.9519 26.1235 24.9512C26.6071 25.5631 27.3471 25.9207 28.1308 25.9207H30.0563C30.1974 25.9207 30.3297 25.8507 30.4089 25.7342C30.4873 25.6183 30.5032 25.4706 30.4502 25.3403V25.3403Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1507_1754">
					<rect
						width="132.553"
						height="30.3943"
						fill="white"
						transform="translate(0.336914 0.802856)"
					/>
				</clipPath>
			</defs>
		</svg>
	)
}
