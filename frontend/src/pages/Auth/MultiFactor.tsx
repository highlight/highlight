import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidCheveronLeft,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { AuthBody, AuthError, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import firebase from 'firebase/compat/app'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import analytics from '@/util/analytics'

type Props = {
	resolver?: firebase.auth.MultiFactorResolver
}

export const MultiFactor: React.FC<Props> = ({ resolver }) => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [verificationId, setVerificationId] = useState<string>('')
	const { setLoadingState } = useAppLoadingContext()
	const { signIn } = useAuthContext()
	const navigate = useNavigate()
	const recaptchaVerifier = useRef<firebase.auth.ApplicationVerifier>()
	const phoneAuthProvider = new firebase.auth.PhoneAuthProvider()
	const formStore = Form.useStore({
		defaultValues: {
			code: '',
		},
	})
	const code = formStore.useValue('code')

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

	useEffect(() => analytics.page('Multi Factor Auth'), [])

	const handleSubmit = useCallback(
		async (e?: React.FormEvent<HTMLFormElement>) => {
			if (!resolver) {
				return
			}

			e?.preventDefault()
			setLoading(true)
			setError('')

			try {
				const cred = firebase.auth.PhoneAuthProvider.credential(
					verificationId,
					code,
				)
				const multiFactorAssertion =
					firebase.auth.PhoneMultiFactorGenerator.assertion(cred)

				const { user } =
					await resolver.resolveSignIn(multiFactorAssertion)

				signIn(user)
			} catch (error: any) {
				setError(error.message)
			} finally {
				setLoading(false)
			}
		},
		[resolver, verificationId, code, signIn],
	)

	useEffect(() => {
		if (code.length >= 6) {
			handleSubmit()
		}
	}, [handleSubmit, code])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	// After logging out we sometimes re-render this component even though the
	// route doesn't match. This is a hack to get us back to the sign in page.
	if (window.location.pathname.indexOf('multi_factor') === -1) {
		navigate('/')
	}

	return (
		<Form store={formStore} resetOnSubmit={false} onSubmit={handleSubmit}>
			<AuthHeader px="10" py="4">
				<Stack justify="space-between" align="center" direction="row">
					<Box display="flex" style={{ width: 24 }}>
						<ButtonIcon
							kind="secondary"
							emphasis="low"
							size="xSmall"
							icon={
								<IconSolidCheveronLeft
									color={vars.theme.static.content.weak}
								/>
							}
							onClick={() => {
								navigate(SIGN_IN_ROUTE)
							}}
						/>
					</Box>
					<Text color="moderate">Verify via SMS</Text>
					<Box style={{ width: 24 }}></Box>
				</Stack>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formStore.names.code}
						label="SMS Verification Code"
						autoFocus
						autoComplete="one-time-code"
					/>
					{error && <AuthError>{error}</AuthError>}
				</Stack>
			</AuthBody>
			<AuthFooter>
				<Stack gap="12">
					<Button
						trackingId="sign-up-submit"
						loading={loading}
						type="submit"
					>
						Next
					</Button>
				</Stack>
			</AuthFooter>
			<div id="recaptcha"></div>
		</Form>
	)
}
