import { useAuthContext } from '@authentication/AuthContext'
import { useUpdateErrorGroupStateMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorState } from '@graph/schemas'
import { IconSolidCheveronDown, Menu, Text } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { wait } from '@util/time'
import { message } from 'antd'
import React, { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

export const ErrorStateSelect: React.FC<{ state: ErrorState }> = ({
	state: initialErrorState,
}) => {
	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState, { loading }] =
		useUpdateErrorGroupStateMutation({
			refetchQueries: [namedOperations.Query.GetErrorGroupsOpenSearch],
		})
	const [action, setAction] = useQueryParam('action', StringParam)
	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)

	const handleChange = async (newState: ErrorState) => {
		if (newState === initialErrorState) return
		await updateErrorGroupState({
			variables: { secure_id: error_secure_id, state: newState },
			refetchQueries: [namedOperations.Query.GetErrorGroupsOpenSearch],
			onQueryUpdated: (observableQuery) => {
				// wait until the changes propage to openSearch nodes
				wait(3500).then(() => {
					observableQuery.refetch()
				})
			},
		})

		showStateUpdateMessage(newState)
	}

	// Sets the state based on the query parameters. This is used for the Slack deep-linked messages.
	useEffect(() => {
		if (action) {
			const castedAction = action.toUpperCase() as ErrorState
			if (Object.values(ErrorState).includes(castedAction)) {
				handleChange(castedAction)
			}

			setAction(undefined)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action, error_secure_id])

	return (
		<Menu>
			<Menu.Button
				size="small"
				kind="secondary"
				emphasis="low"
				disabled={loading || !isLoggedIn}
				iconRight={<IconSolidCheveronDown />}
			>
				<Text case="capital">{initialErrorState.toLowerCase()}</Text>
			</Menu.Button>
			{isLoggedIn && (
				<Menu.List>
					{ErrorStatuses.map((option) => (
						<Menu.Item
							onClick={() =>
								handleChange(option.toUpperCase() as ErrorState)
							}
							key={option}
						>
							{option}
						</Menu.Item>
					))}
				</Menu.List>
			)}
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
