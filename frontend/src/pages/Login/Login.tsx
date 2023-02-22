import { useAuthContext } from '@authentication/AuthContext'
import Alert from '@components/Alert/Alert'
import Input from '@components/Input/Input'
import Space from '@components/Space/Space'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import AboutYouPage from '@pages/AboutYou/AboutYouCard'
import { AppRouter } from '@routers/AppRouter/AppRouter'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { showIntercom } from '@util/window'
import { message } from 'antd'
import clsx from 'clsx'
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
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom'
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
