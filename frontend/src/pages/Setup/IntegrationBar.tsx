import { LinkButton } from '@components/LinkButton'
import { IntegrationStatus } from '@graph/schemas'
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
	const path = buildResourcePath(area!, projectId, integrationData)
	const integrated = integrationData?.integrated
	const ctaText = CTA_TITLE_MAP[area!]

	return (
		<Box
			backgroundColor={integrated ? 'informative' : 'elevated'}
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
						variant={integrated ? 'purple' : 'gray'}
					/>
					<Badge
						label={`Installation ${
							integrated ? 'complete' : 'pending'
						}`}
						variant={integrated ? 'purple' : 'gray'}
						iconStart={
							integrated ? (
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
					{path && ctaText && (
						<LinkButton
							to={path}
							trackingId={`setup-resource-${
								area === 'backend' ? 'error' : 'session'
							}`}
							kind={integrated ? 'primary' : 'secondary'}
							disabled={!integrated}
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
	integrationData?: IntegrationStatus,
) => {
	let path = `/${projectId}/${CTA_PATH_MAP[area!]}`

	if (integrationData?.resourceSecureId) {
		path = `${path}/${integrationData.resourceSecureId}`
	} else if (area === 'backend-logging') {
		const logDate = moment(integrationData?.createdAt)
		// Show logs with a 2 minute buffer of when the setup event was created.
		const startDate = moment(logDate).subtract(2, 'minutes')
		const endDate = moment(logDate).add(2, 'minutes')

		path = `${path}?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
	}

	return path
}
