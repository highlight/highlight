import { LinkButton } from '@components/LinkButton'
import {
	GetClientIntegrationDataQuery,
	GetServerIntegrationDataQuery,
} from '@graph/operations'
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
	integrationData:
		| GetClientIntegrationDataQuery['clientIntegrationData']
		| GetServerIntegrationDataQuery['serverIntegrationData']
}

const AREA_TITLE_MAP = {
	client: 'UX monitoring',
	backend: 'Server monitoring',
	'backend-logging': 'Server logging',
}

export const IntegrationBar: React.FC<Props> = ({ integrationData }) => {
	const { area } = useParams<{ area: string }>()
	const { projectId } = useProjectId()
	const path = `/${projectId}/${snakeCase(integrationData?.__typename)}/${
		integrationData?.secure_id
	}`
	const integrated = !!integrationData

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
						label={
							AREA_TITLE_MAP[area as keyof typeof AREA_TITLE_MAP]
						}
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
					{path && (
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
								<Text>
									{area === 'backend'
										? 'View first error'
										: area === 'client'
										? 'View first session'
										: 'View logs'}
								</Text>
								<IconSolidExternalLink />
							</Box>
						</LinkButton>
					)}
				</Box>
			</Box>
		</Box>
	)
}
