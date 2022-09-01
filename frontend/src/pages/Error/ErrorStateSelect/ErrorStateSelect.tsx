import { useAuthContext } from '@authentication/AuthContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import Select from '../../../components/Select/Select'
import { useUpdateErrorGroupStateMutation } from '../../../graph/generated/hooks'
import { ErrorState } from '../../../graph/generated/schemas'
import styles from './ErrorStateSelect.module.scss'

/**
 * The possible states for an `ErrorGroup`.
 */
export const ErrorStateOptions = Object.keys(ErrorState).map((key) => ({
	displayValue: `${key}`,
	value: key.toUpperCase(),
	id: key.toUpperCase(),
}))

export const ErrorStateSelect: React.FC<
	React.PropsWithChildren<
		React.PropsWithChildren<{
			state?: ErrorState
			loading: boolean
		}>
	>
> = ({ state: initialErrorState, loading }) => {
	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState, { loading: updateLoading }] =
		useUpdateErrorGroupStateMutation()
	const [action, setAction] = useQueryParam('action', StringParam)
	const { isLoggedIn } = useAuthContext()

	// Sets the state based on the query parameters. This is used for the Slack deep-linked messages.
	useEffect(() => {
		if (action) {
			const castedAction = action.toUpperCase() as ErrorState
			if (Object.values(ErrorState).includes(castedAction)) {
				updateErrorGroupState({
					variables: {
						secure_id: error_secure_id,
						state: castedAction,
					},
				})
				showStateUpdateMessage(castedAction)
			}
			setAction(undefined)
		}
	}, [action, error_secure_id, setAction, updateErrorGroupState])

	// Add disabled state to each option if not logged in
	const thisErrorStateOptions = ErrorStateOptions.map((opt) => ({
		...opt,
		disabled: !isLoggedIn,
	}))

	return (
		<Select
			options={thisErrorStateOptions}
			className={classNames(styles.select, {
				[styles.resolved]: initialErrorState === ErrorState.Resolved,
				[styles.open]: initialErrorState === ErrorState.Open,
				[styles.ignored]: initialErrorState === ErrorState.Ignored,
			})}
			value={initialErrorState}
			onChange={async (newState: ErrorState) => {
				await updateErrorGroupState({
					variables: { secure_id: error_secure_id, state: newState },
				})

				showStateUpdateMessage(newState)
			}}
			loading={updateLoading || loading}
		/>
	)
}

const showStateUpdateMessage = (newState: ErrorState) => {
	let displayMessage = ''
	switch (newState) {
		case ErrorState.Open:
			displayMessage = `This error is set to Open. You will receive alerts when a new error gets thrown.`
			break
		case ErrorState.Ignored:
			displayMessage = `This error is set to Ignored. You will not receive any alerts even if a new error gets thrown.`
			break
		case ErrorState.Resolved:
			displayMessage = `This error is set to Resolved. You will receive alerts when a new error gets thrown.`
			break
	}

	message.success(displayMessage, 10)
}
