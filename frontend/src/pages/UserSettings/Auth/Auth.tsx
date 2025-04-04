import Alert from '@components/Alert/Alert'
import Button from '@components/Button/Button/Button'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import Input from '@components/Input/Input'
import Space from '@components/Space/Space'
import { toast } from '@components/Toaster'
import { auth } from '@util/auth'
import firebase from 'firebase/compat/app'
import moment from 'moment'
import React, {
	FormEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

import { useAuthContext } from '@/authentication/AuthContext'
import { formatPhoneNumber } from '@/pages/UserSettings/Auth/utils'

import styles from './Auth.module.css'

enum AuthState {
	Enroll,
	Enrolled,
	Login,
}

const firebaseAuth = auth as firebase.auth.Auth

const Auth: React.FC = () => {
	const [error, setError] = useState<string | null>(null)
	const [status, setStatus] = useState<AuthState>(AuthState.Enroll)
	const Component = STATUS_COMPONENT_MAP[status]

	useEffect(() => {
		if (firebaseAuth.currentUser?.multiFactor.enrolledFactors.length) {
			setStatus(AuthState.Enrolled)
		} else if (
			// Firebase won't allow a user to modify 2FA unless they recently
			// authenticated. If they haven't recently, make them log in.
			moment().diff(
				moment(firebaseAuth.currentUser?.metadata.lastSignInTime),
			) >
			2 * 60 * 1000
		) {
			setStatus(AuthState.Login)
		}
		// Passing dependency because this component isn't unmounted when logged out
		// so the state never gets reset after logging in.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [firebaseAuth.currentUser?.metadata.lastSignInTime])

	return (
		<FieldsBox>
			<h2>Two-Factor Authentication</h2>

			{error && (
				<Alert
					shouldAlwaysShow
					closable={false}
					trackingId="2faError"
					type="error"
					description={
						typeof error === 'object'
							? JSON.stringify(error)
							: error
					}
					className={styles.error}
				/>
			)}

			<Component setStatus={setStatus} setError={setError} />
		</FieldsBox>
	)
}

interface Props {
	setError: (error: any) => void
	setStatus: (status: AuthState) => void
}

const Login: React.FC<Props> = () => {
	const { signOut } = useAuthContext()

	return (
		<>
			<Alert
				shouldAlwaysShow
				closable={false}
				trackingId="2faSignIn"
				description="In order to modify your 2FA settings you will need to log in again. After logging back in you will be returned to this page."
				className={styles.signInAlert}
			/>

			<Button
				trackingId="logInAgainFor2fa"
				type="primary"
				onClick={() => {
					signOut()
				}}
			>
				Re-Authenticate to Modify Auth Settings
			</Button>
		</>
	)
}

const Enroll: React.FC<Props> = ({ setError, setStatus }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [phoneNumber, setPhoneNumber] = useState<string>('')
	const [verificationId, setVerificationId] = useState<string>('')
	const recaptchaVerifier =
		useRef<firebase.auth.ApplicationVerifier>(undefined)

	useEffect(() => {
		recaptchaVerifier.current = new firebase.auth.RecaptchaVerifier(
			'recaptcha',
			{
				size: 'invisible',
			},
		)
	}, [])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		if (!recaptchaVerifier.current) {
			return
		}

		e.preventDefault()
		setLoading(true)
		setError(null)

		await recaptchaVerifier.current?.verify()

		const multiFactorSession =
			await firebaseAuth.currentUser?.multiFactor.getSession()
		const phoneAuthProvider = new firebase.auth.PhoneAuthProvider()

		// Send SMS verification code.
		try {
			const vId = await phoneAuthProvider.verifyPhoneNumber(
				{
					phoneNumber,
					session: multiFactorSession,
				},
				recaptchaVerifier.current,
			)

			setVerificationId(vId)
		} catch (error: any) {
			if (error.code === 'auth/requires-recent-login') {
				setStatus(AuthState.Login)
			} else {
				setError(
					"Please use a valid phone number. Don't forget your regional prefix!",
				)
				console.error(`Firebase threw an error: ${error.message}`)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
		setPhoneNumber(formatPhoneNumber(event.target.value))
	}

	return (
		<>
			{!verificationId ? (
				<form onSubmit={handleSubmit}>
					<Space size="medium" direction="vertical">
						<p>
							Add an additional layer of security for your account
							by enabling SMS-based two-factor authentication.
						</p>

						<Input
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder="+1 123-456-7890"
							onBlur={handleOnBlur}
						/>

						<Button
							type="primary"
							htmlType="submit"
							trackingId="setup2fa"
							loading={loading}
						>
							Setup 2FA
						</Button>
					</Space>
				</form>
			) : (
				<VerifyPhone
					phoneNumber={phoneNumber}
					verificationId={verificationId}
					onSuccess={() => setStatus(AuthState.Enrolled)}
				/>
			)}

			<div id="recaptcha"></div>
		</>
	)
}

interface VerifyPhoneProps {
	phoneNumber: string
	verificationId: string
	onSuccess: () => void
}

export const VerifyPhone: React.FC<VerifyPhoneProps> = ({
	phoneNumber,
	verificationId,
	onSuccess,
}) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>()
	const [verificationCode, setVerificationCode] = useState<string>('')

	const handleCodeSubmit = useCallback(
		async (e?: FormEvent<HTMLFormElement>) => {
			e?.preventDefault()
			setLoading(true)
			setError(null)

			const cred = firebase.auth.PhoneAuthProvider.credential(
				verificationId,
				verificationCode,
			)
			const multiFactorAssertion =
				firebase.auth.PhoneMultiFactorGenerator.assertion(cred)

			// Complete enrollment.
			try {
				await firebaseAuth.currentUser?.multiFactor.enroll(
					multiFactorAssertion,
					`***-***-${phoneNumber.slice(-4)}`,
				)

				toast.success('Successfully enrolled in two-factor auth')
				onSuccess()
			} catch (e: any) {
				setError(e.message)
			} finally {
				setLoading(false)
			}
		},
		[onSuccess, phoneNumber, verificationCode, verificationId],
	)

	useEffect(() => {
		if (verificationCode.length >= 6) {
			handleCodeSubmit()
		}
	}, [handleCodeSubmit, verificationCode])

	return (
		<>
			{error && (
				<Alert
					shouldAlwaysShow
					closable={false}
					trackingId="2faVerifyError"
					type="error"
					description={error}
					className={styles.error}
				/>
			)}

			<p>Enter the code sent to your phone to verify your device.</p>

			<form onSubmit={handleCodeSubmit}>
				<Space direction="vertical" size="medium">
					<Input
						value={verificationCode}
						onChange={(e) => setVerificationCode(e.target.value)}
						placeholder="Verification code"
					/>

					<Button
						type="primary"
						htmlType="submit"
						trackingId="setup2fa"
						loading={loading}
					>
						Submit
					</Button>
				</Space>
			</form>
		</>
	)
}

const Enrolled: React.FC<Props> = ({ setError, setStatus }) => {
	return (
		<Space direction="vertical" size="medium">
			<p>
				You are enrolled in two-factor authentication with{' '}
				{
					firebaseAuth.currentUser?.multiFactor.enrolledFactors[0]
						.displayName
				}{' '}
				set as your backup phone number.
			</p>

			<Button
				trackingId="remove2fa"
				type="primary"
				onClick={async () => {
					const currentFactor =
						firebaseAuth.currentUser?.multiFactor.enrolledFactors[0]

					if (currentFactor) {
						try {
							await firebaseAuth.currentUser?.multiFactor.unenroll(
								currentFactor,
							)

							setStatus(AuthState.Enroll)
							toast.success('2FA removed successfully')
						} catch (e: any) {
							if (e.code === 'auth/requires-recent-login') {
								setStatus(AuthState.Login)
							} else {
								setError(e.message)
							}
						}
					}
				}}
			>
				Remove 2FA
			</Button>
		</Space>
	)
}

const STATUS_COMPONENT_MAP: { [key in AuthState]: React.FC<Props> } = {
	[AuthState.Enroll]: Enroll,
	[AuthState.Enrolled]: Enrolled,
	[AuthState.Login]: Login,
}

export default Auth
