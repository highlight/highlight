import { useAuthContext } from '@authentication/AuthContext'
import { Menu, Text } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { useUpdateErrorGroupStateMutation } from '../../../graph/generated/hooks'
import { ErrorState } from '../../../graph/generated/schemas'

export const ErrorStateSelect: React.FC<
	React.PropsWithChildren<{
		state?: ErrorState
	}>
> = ({ state: initialErrorState }) => {
	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState, { loading: updateLoading }] =
		useUpdateErrorGroupStateMutation()
	const [action, setAction] = useQueryParam('action', StringParam)
	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)

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

	const handleChange = async (newState: ErrorState) => {
		await updateErrorGroupState({
			variables: { secure_id: error_secure_id, state: newState },
		})

		showStateUpdateMessage(newState)
	}

	if (!initialErrorState) {
		return null
	}

	return (
		<Menu>
			<Menu.Button size="small" variant="grey">
				<Text case="capital">{initialErrorState}</Text>
			</Menu.Button>
			<Menu.List>
				{ErrorStatuses.map((option) => (
					<Menu.Item
						disabled={!isLoggedIn}
						onClick={() =>
							handleChange(option.toUpperCase() as ErrorState)
						}
						key={option}
					>
						<Text case="capital">{option}</Text>
					</Menu.Item>
				))}
			</Menu.List>
		</Menu>
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
