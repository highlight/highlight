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
import { lowerCase, snakeCase } from 'lodash'
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

	return (
		<Box
			backgroundColor={!!integrationData ? 'informative' : 'elevated'}
			p="8"
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
		>
			{!!integrationData ? (
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
								AREA_TITLE_MAP[
									area as keyof typeof AREA_TITLE_MAP
								]
							}
							variant="purple"
						/>
						<Badge
							label="Installation complete"
							variant="purple"
							iconStart={<IconSolidCheckCircle />}
						/>
					</Stack>
					<Box
						display="flex"
						flexGrow={1}
						justifyContent="flex-end"
						flexBasis={0}
					>
						<LinkButton
							to={path}
							trackingId={`setup-resource-${integrationData.__typename}`}
							kind="primary"
							size="small"
						>
							<Box
								display="flex"
								flexDirection="row"
								gap="4"
								alignItems="center"
							>
								<Text>
									View first{' '}
									{lowerCase(integrationData.__typename)}
								</Text>
								<IconSolidExternalLink />
							</Box>
						</LinkButton>
					</Box>
				</Box>
			) : (
				<Stack gap="2" direction="row">
					<Badge
						size="medium"
						label={
							AREA_TITLE_MAP[area as keyof typeof AREA_TITLE_MAP]
						}
						variant="gray"
						cssClass={styles.badgeFirst}
					/>
					<Badge
						size="medium"
						label="Installation pending"
						variant="gray"
						iconStart={
							<IconSolidLoading className={styles.loading} />
						}
						cssClass={styles.badgeLast}
					/>
				</Stack>
			)}
		</Box>
	)
}
