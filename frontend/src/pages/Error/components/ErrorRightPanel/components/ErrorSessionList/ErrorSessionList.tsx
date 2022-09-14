import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { GetRecentErrorsQuery } from '@graph/operations'
import { Session } from '@graph/schemas'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { useParams } from '@util/react-router/useParams'
import React, { useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import MinimalSessionCard from '../../../../../Sessions/SessionsFeedV2/components/MinimalSessionCard/MinimalSessionCard'

interface Props {
	recentErrors?: GetRecentErrorsQuery
	loading: boolean
}

const ErrorSessionList = ({ recentErrors, loading }: Props) => {
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { isLoggedIn } = useAuthContext()
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	if (loading) {
		return (
			<Skeleton
				count={4}
				height={35}
				style={{
					marginTop: 8,
					marginBottom: 8,
				}}
			/>
		)
	} else if (!recentErrors?.error_group?.metadata_log) {
		return null
	}

	return (
		<Virtuoso
			ref={virtuoso}
			overscan={500}
			data={recentErrors.error_group.metadata_log}
			itemContent={(index, session) => (
				<MinimalSessionCard
					session={
						{
							secure_id: session?.session_secure_id,
							created_at: session?.timestamp,
							identifier: session?.identifier,
							fingerprint: session?.fingerprint,
							browser_name: session?.browser,
							os_name: session?.os,
							environment: session?.environment || 'Production',
							user_properties: session?.user_properties || {},
						} as Partial<Session> as Session
					}
					selected={false}
					key={`${session?.session_secure_id}-${index}`}
					errorVersion
					showDetailedViewOverride
					urlParams={`?${PlayerSearchParameters.errorId}=${session?.error_id}`}
					linkDisabled={
						!isLoggedIn &&
						projectIdRemapped !==
							DEMO_WORKSPACE_PROXY_APPLICATION_ID
					}
					configuration={{
						datetimeFormat: 'Relative',
						countFormat: 'Short',
					}}
				/>
			)}
		/>
	)
}

export default ErrorSessionList
