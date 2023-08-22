import { LinkButton } from '@components/LinkButton'
import { ErrorGroup, IntegrationStatus, Session } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidCheckCircle,
	IconSolidExternalLink,
	IconSolidLoading,
	Stack,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import moment from 'moment'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { useAuthContext } from '@/authentication/AuthContext'
import {
	useGetErrorGroupsOpenSearchQuery,
	useGetSessionsOpenSearchQuery,
} from '@/graph/generated/hooks'

import * as styles from './IntegrationBar.css'

type Props = React.PropsWithChildren & {
	integrationData?: IntegrationStatus
}

type Area = 'client' | 'backend' | 'backend-logging'

const AREA_TITLE_MAP: { [key in Area]: string } = {
	client: 'Frontend monitoring + session replay',
	backend: 'Backend monitoring',
	'backend-logging': 'Backend logging',
}

const CTA_TITLE_MAP: { [key in Area]: string } = {
	client: 'View a session',
	backend: 'View an error',
	'backend-logging': 'View logs',
}

const CTA_PATH_MAP: { [key in Area]: string } = {
	client: 'sessions',
	backend: 'errors',
	'backend-logging': 'logs',
}

export const IntegrationBar: React.FC<Props> = ({ integrationData }) => {
	const location = useLocation()
	const area = location.pathname.split('/')[3] as Area
	const { projectId } = useProjectId()
	const integrated = integrationData?.integrated
	const ctaText = CTA_TITLE_MAP[area!]

	const { isHighlightAdmin } = useAuthContext()
	const [useClickhouse] = useLocalStorage(
		'highlight-session-search-use-clickhouse-v2',
		isHighlightAdmin || Number(projectId) % 2 == 0,
	)

	const { data: sessionData } = useGetSessionsOpenSearchQuery({
		variables: {
			project_id: projectId,
			query: '{"match_all": {}}',
			clickhouse_query: useClickhouse
				? { isAnd: true, rules: [] }
				: undefined,
			count: 1,
			page: 1,
			sort_desc: true,
		},
		skip: area !== 'client' || !integrated,
		fetchPolicy: 'no-cache',
	})

	const { data: errorGroupData } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			project_id: projectId,
			query: '{"match_all": {}}',
			count: 1,
		},
		skip: area !== 'backend' || !integrated,
		fetchPolicy: 'no-cache',
	})

	const resource =
		area === 'client'
			? sessionData?.sessions_opensearch.sessions[0]
			: area === 'backend'
			? errorGroupData?.error_groups_opensearch.error_groups[0]
			: undefined
	const path = buildResourcePath(area!, projectId, resource)
	const complete = path && integrated

	return (
		<Box
			backgroundColor={complete ? 'informative' : 'elevated'}
			p="8"
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
		>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				width="full"
			>
				<Box flexBasis={0} flexGrow={1}>
					&nbsp;
				</Box>
				<Stack gap="2" direction="row" align="center">
					<Badge
						label={AREA_TITLE_MAP[area!]}
						variant={complete ? 'purple' : 'gray'}
					/>
					<Badge
						label={`Installation ${
							complete ? 'complete' : 'pending'
						}`}
						variant={complete ? 'purple' : 'gray'}
						iconStart={
							complete ? (
								<IconSolidCheckCircle />
							) : (
								<IconSolidLoading className={styles.loading} />
							)
						}
					/>
				</Stack>
				<Box
					display="flex"
					flexGrow={1}
					justifyContent="flex-end"
					flexBasis={0}
				>
					{ctaText && (
						<LinkButton
							to={path || ''}
							trackingId={`setup-resource-${
								area === 'backend' ? 'error' : 'session'
							}`}
							kind={complete ? 'primary' : 'secondary'}
							disabled={!complete}
							size="small"
						>
							<Box
								display="flex"
								flexDirection="row"
								gap="4"
								alignItems="center"
							>
								<Text>{ctaText}</Text>
								<IconSolidExternalLink />
							</Box>
						</LinkButton>
					)}
				</Box>
			</Box>
		</Box>
	)
}

const buildResourcePath = (
	area: Area,
	projectId: string,
	resource?: Partial<Session> | Partial<ErrorGroup>,
) => {
	const basePath = `/${projectId}/${CTA_PATH_MAP[area!]}`
	let path

	if (resource?.secure_id) {
		path = `${basePath}/${resource.secure_id}`
	} else if (area === 'backend-logging') {
		const logDate = moment(resource?.created_at)
		// Show logs with a 2 minute buffer of when the setup event was created.
		const startDate = moment(logDate).subtract(2, 'minutes')
		const endDate = moment(logDate).add(2, 'minutes')

		path = `${basePath}?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
	}

	return path
}
