import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	Box,
	Callout,
	Form,
	FormState,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import { auth } from '@util/auth'
import {
	applyActionCode,
	checkActionCode,
	confirmPasswordReset,
	sendPasswordResetEmail,
	verifyPasswordResetCode,
} from 'firebase/auth'
import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

import * as styles from './AuthRouter.css'

function validatePassword(password: string) {
	if (password.length < 8) {
		return 'Password must be at least 8 characters long.'
	}
	if (!password.match(/[a-z]+/)) {
		return 'Password must have at least 1 lower case character.'
	}
	if (!password.match(/[A-Z]+/)) {
		return 'Password must have at least 1 upper case character.'
	}
	if (!password.match(/[0-9]+/)) {
		return 'Password must have at least 1 number.'
	}
	if (!password.match(/[!@#$%^&*()]+/)) {
		return 'Password must have at least 1 special character.'
	}
}

function ResetPassword({
	formStore,
}: {
	formStore: FormState<{ email: string; password: string }>
}) {
	formStore.useValidate(() => {
		const password = formStore.getValue(formStore.names.password)
		const validationError = validatePassword(password)
		if (validationError) {
			formStore.setError(formStore.names.password, validationError)
		}
	})
	return (
		<Stack gap="12">
			<Stack direction="column" gap="4">
				<Form.Label
					label="Current Email"
					name={formStore.names.email}
				/>
				<Stack gap="0">
					<Form.Input
						name={formStore.names.email}
						placeholder="Current email"
						autoFocus
						required
						disabled
					/>
				</Stack>
			</Stack>
			<Form.Input
				name={formStore.names.password}
				label="New Password"
				type="password"
				minLength={8}
				autoComplete="new-password"
			/>
			<Form.Error name={formStore.names.password} />
		</Stack>
	)
}

function ConfirmEmail({
	formStore,
}: {
	formStore: FormState<{ email: string }>
}) {
	return (
		<Stack gap="12" py="12">
			<Stack direction="column" gap="4">
				<Form.Label
					label="Current Email"
					name={formStore.names.email}
				/>
				<Stack gap="0">
					<Form.Input
						name={formStore.names.email}
						placeholder="Current email"
						autoFocus
						required
						disabled
					/>
				</Stack>
			</Stack>
		</Stack>
	)
}

const titles = {
	resetPassword: 'Reset your password',
	recoverEmail: 'Recover your email address',
	verifyEmail: 'Verify your email address',
} as const

export const Firebase: React.FC = () => {
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const formStore = Form.useStore({
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const [params] = useQueryParams({
		mode: StringParam,
		oobCode: StringParam,
		continueUrl: StringParam,
	})

	const verifyEmail = useCallback(async () => {
		await applyActionCode(auth as unknown as any, params.oobCode!)
		navigate(SIGN_IN_ROUTE)
	}, [navigate, params.oobCode])

	const resetPassword = useCallback(async () => {
		const email = await verifyPasswordResetCode(
			auth as unknown as any,
			params.oobCode!,
		)
		formStore.setValue(formStore.names.email, email)
	}, [formStore, params.oobCode])

	const onSubmitResetPassword = useCallback(async () => {
		await confirmPasswordReset(
			auth as unknown as any,
			params.oobCode!,
			formStore.getValue(formStore.names.password),
		)
		navigate(SIGN_IN_ROUTE)
	}, [formStore, navigate, params.oobCode])

	const recoverEmail = useCallback(async () => {
		const info = await checkActionCode(
			auth as unknown as any,
			params.oobCode!,
		)
		const email = info['data']['email']
		await applyActionCode(auth as unknown as any, params.oobCode!)

		formStore.setValue(formStore.names.email, email)
	}, [formStore, params.oobCode])

	const onSubmitRecoverEmail = useCallback(async () => {
		await sendPasswordResetEmail(
			auth as unknown as any,
			params.oobCode!,
			formStore.getValue(formStore.names.email),
		)
		navigate(SIGN_IN_ROUTE)
	}, [formStore, navigate, params.oobCode])

	const onSubmit = useCallback(async () => {
		if (
			params.mode === 'resetPassword' &&
			!formStore.getError(formStore.names.password)
		) {
			await onSubmitResetPassword()
		} else if (
			params.mode === 'recoverEmail' &&
			!formStore.getError(formStore.names.email)
		) {
			await onSubmitRecoverEmail()
		}
	}, [formStore, onSubmitRecoverEmail, onSubmitResetPassword, params.mode])

	useEffect(() => {
		;(async () => {
			setLoading(true)
			try {
				if (params.mode === 'resetPassword') {
					await resetPassword()
				} else if (params.mode === 'verifyEmail') {
					await verifyEmail()
				} else if (params.mode === 'recoverEmail') {
					await recoverEmail()
				}
			} catch (error: any) {
				setError(error.message || error.toString())
			} finally {
				setLoading(false)
			}
		})()
	}, [
		formStore,
		params.mode,
		params.oobCode,
		resetPassword,
		verifyEmail,
		recoverEmail,
	])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<Form store={formStore} resetOnSubmit={false} validateOnBlur>
					<AuthHeader>
						<Text color="moderate">
							{titles[params.mode as keyof typeof titles]}
						</Text>
					</AuthHeader>
					<AuthBody>
						{params.mode === 'resetPassword' ? (
							<ResetPassword formStore={formStore} />
						) : null}
						{params.mode === 'recoverEmail' ? (
							<ConfirmEmail formStore={formStore} />
						) : null}
						{error && (
							<Box py="12">
								<Callout kind="error">{error}</Callout>
							</Box>
						)}
					</AuthBody>
					<AuthFooter>
						<Button
							trackingId="auth-firebase-continue"
							loading={loading}
							type="submit"
							onClick={onSubmit}
						>
							Submit
						</Button>
					</AuthFooter>
				</Form>
			</Box>
		</Landing>
	)
}
