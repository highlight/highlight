import { ApolloError } from '@apollo/client'
import Alert, { AlertProps } from '@components/Alert/Alert'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import { CircularSpinner } from '../../components/Loading/Loading'
import {
	useAddAdminToWorkspaceMutation,
	useGetAdminQuery,
} from '../../graph/generated/hooks'
import { auth } from '../../util/auth'
import { client } from '../../util/graph'
import styles from './NewMemberPage.module.scss'

const NewMemberPage = () => {
	const { invite_id, workspace_id } = useParams<{
		workspace_id: string
		invite_id: string
	}>()
	const [adminAdded, setAdminAdded] = useState(false)
	const addAdminMutation = useAddAdminToWorkspaceMutation
	const [addAdmin, { loading: addLoading, error }] = addAdminMutation()
	const { loading: adminLoading, data: adminData } = useGetAdminQuery()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (!adminLoading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [adminLoading, setLoadingState])

	if (adminAdded) {
		return <Navigate replace to={`/w/${workspace_id}`} />
	}

	return (
		<div className={styles.box}>
			<h2 className={styles.title}>Accept Project Invite?</h2>
			<p className={styles.subTitle}>
				Would you like to enter this project as '
				{adminData?.admin?.email}' ?
			</p>
			<Button
				trackingId="NewMemberEnterWorkspace"
				type="primary"
				className={commonStyles.submitButton}
				onClick={() => {
					addAdmin({
						variables: {
							workspace_id: workspace_id!,
							invite_id: invite_id!,
						},
					})
						.then((result) => {
							if (result.data?.addAdminToWorkspace) {
								setAdminAdded(true)
							}
						})
						.catch(() => {})
				}}
			>
				{addLoading ? (
					<CircularSpinner
						style={{
							fontSize: 18,
							color: 'var(--text-primary-inverted)',
						}}
					/>
				) : (
					'Join Project'
				)}
			</Button>
			<Button
				trackingId="NewMemberLoginWithDifferentUser"
				className={commonStyles.secondaryButton}
				style={{ marginTop: 16 }}
				onClick={() => {
					auth.signOut()
					client.clearStore()
				}}
			>
				Login as different User
			</Button>

			{!!error && (
				<Alert
					shouldAlwaysShow
					type="error"
					trackingId="NewMemberPageError"
					{...getAlertMessage(error)}
				/>
			)}
		</div>
	)
}

export default NewMemberPage

const getAlertMessage = (
	error: ApolloError,
): Pick<AlertProps, 'message' | 'description'> => {
	const { message } = error
	const defaultAlertProps = {
		message: 'A problem occurred while trying to join the project.',
		description:
			'This is usually an intermittent issue. If this keeps happening please reach out to us. We are probably already looking into it!',
	}
	const proxyError = new Error(
		'A 500 occurred when an admin tried joining a workspace.',
	)

	if (message.includes('403')) {
		return {
			message: defaultAlertProps.message,
			description:
				"It doesn't look like this is a valid invite link. Ask the person that shared this link with you to double check.",
		}
	}

	if (message.includes('404')) {
		return {
			message: "This invite doesn't exist",
			description:
				'Ask the person that shared this link with you to re-invite you. An invite link expires after it is used.',
		}
	}

	if (message.includes('405')) {
		return {
			message: 'The invite link has expired',
			description:
				'Ask the person that shared with you the invite to create a new invite for you.',
		}
	}

	H.consumeError(proxyError)
	return defaultAlertProps
}
