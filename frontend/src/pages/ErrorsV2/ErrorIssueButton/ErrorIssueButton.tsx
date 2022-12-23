import { useAuthContext } from '@authentication/AuthContext'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	IconChevronRight,
	IconClickUp,
	IconCreateFile,
	IconLinear,
	IconPlusSm,
	Menu,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { getErrorBody } from '@util/errors/errorUtils'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import * as style from './style.css'
interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorIssueButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useProjectId()

	const { isLinearIntegratedWithProject } = useLinearIntegration()
	const {
		settings: { isIntegrated: isClickupIntegrated },
	} = useClickUpIntegration()

	const integrations: Array<[boolean | undefined, IssueTrackerIntegration]> =
		useMemo(
			() => [
				[isLinearIntegratedWithProject, LINEAR_INTEGRATION],
				[isClickupIntegrated, CLICKUP_INTEGRATION],
			],
			[isClickupIntegrated, isLinearIntegratedWithProject],
		)

	const integrationCount = integrations.reduce(
		(acc, curr) => acc + (Number(curr[0]) ?? 0),
		0,
	)

	const [showNewIssueModal, setShowNewIssueModal] = useState<
		IssueTrackerIntegration | undefined
	>(undefined)

	const defaultIssueTitle = useMemo(() => {
		if (errorGroup?.event) {
			return getErrorBody(errorGroup?.event)
		}
		return `Issue from this bug`
	}, [errorGroup])

	const menuOptions = useMemo(() => {
		return integrations
			.map(([isIntegrated, integration]) => {
				if (!isIntegrated) return null
				return (
					<Menu.Item
						key={integration?.name}
						onClick={() => setShowNewIssueModal(integration)}
					>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							style={{ width: '100%' }}
							color="n8"
						>
							{integration === LINEAR_INTEGRATION && (
								<IconLinear size={16} />
							)}
							{integration === CLICKUP_INTEGRATION && (
								<IconClickUp size={16} />
							)}
							<Box mr="auto" cssClass={style.menuOption}>
								<Text
									size="small"
									weight="medium"
									userSelect="none"
								>
									{integration?.name} issue
								</Text>
							</Box>
							<IconChevronRight size={16} />
						</Box>
					</Menu.Item>
				)
			})
			.filter(Boolean)
	}, [integrations])

	return (
		<Menu placement="bottom-end">
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="high"
				disabled={!isLoggedIn}
				iconLeft={<IconCreateFile />}
			>
				Create Issue
			</Menu.Button>
			<Menu.List cssClass={style.noPadding}>
				<Box
					p="8"
					bb="secondary"
					mb={integrationCount > 0 ? '4' : undefined}
				>
					<Text size="xxSmall" weight="medium" color="n11">
						Create issue
					</Text>
				</Box>
				{menuOptions}
				<Box
					p="8"
					bt={integrationCount > 0 ? 'secondary' : undefined}
					mt={integrationCount > 0 ? '4' : undefined}
				>
					<Link to={`/${projectId}/integrations`}>
						<Box
							gap="4"
							display="flex"
							alignItems="center"
							color="n11"
						>
							<IconPlusSm size={16} />
							<Text size="small" weight="medium">
								Add new integration
							</Text>
						</Box>
					</Link>
				</Box>
			</Menu.List>
			<NewIssueModal
				selectedIntegration={showNewIssueModal ?? LINEAR_INTEGRATION}
				visible={!!showNewIssueModal}
				onClose={() => setShowNewIssueModal(undefined)}
				commentId={0}
				commentText={errorGroup?.event?.join('') || ''}
				commentType="ErrorComment"
				defaultIssueTitle={defaultIssueTitle}
			/>
		</Menu>
	)
}

export default ErrorIssueButton
