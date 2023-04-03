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
import { useParams } from '@util/react-router/useParams'
import { snakeCase } from 'lodash'
import React from 'react'

import * as styles from './IntegrationBar.css'

type Props = React.PropsWithChildren & {
	integrationData?: IntegrationStatus
}

type Area = 'client' | 'backend' | 'backend-logging'

const AREA_TITLE_MAP: { [key in Area]: string } = {
	client: 'UX monitoring',
	backend: 'Backend monitoring',
	'backend-logging': 'Backend logging',
}

const CTA_TITLE_MAP: { [key in Area]: string } = {
	client: 'View first session',
	backend: 'View first error',
	'backend-logging': 'View logs',
}

export const IntegrationBar: React.FC<Props> = ({ integrationData }) => {
	const { area } = useParams<{ area: Area }>()
	const { projectId } = useProjectId()
	const path = `/${projectId}/${snakeCase(integrationData?.resourceType)}${
		integrationData?.resourceSecureId
			? `/${integrationData.resourceSecureId}`
			: ''
	}`
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
			cssClass={styles.container}
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
