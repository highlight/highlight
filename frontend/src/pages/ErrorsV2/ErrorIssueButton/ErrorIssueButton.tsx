import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import { getAttachmentUrl } from '@components/Comment/AttachmentList/AttachmentList'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { useGetErrorIssuesQuery } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { ExternalAttachment, IntegrationType } from '@graph/schemas'
import {
	IconSolidCheveronRight,
	IconSolidDocumentAdd,
	IconSolidPlusSm,
} from '@highlight-run/ui'
import { Box, Menu, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
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

	const { isLinearIntegratedWithProject, loading: isLoadingLinear } =
		useLinearIntegration()
	const {
		settings: {
			isIntegrated: isClickupIntegrated,
			loading: isLoadingClickUp,
		},
	} = useClickUpIntegration()

	const { isIntegrated: isHeightIntegrated, loading: isLoadingHeight } =
		useIsProjectIntegratedWith(IntegrationType.Height)

	const { data: errorIssues, loading: isLoadingErrorIssues } =
		useGetErrorIssuesQuery({
			variables: {
				error_group_secure_id: errorGroup?.secure_id ?? '',
			},
			fetchPolicy: 'network-only',
		})

	const integrations: Array<[boolean | undefined, IssueTrackerIntegration]> =
		useMemo(
			() => [
				[isLinearIntegratedWithProject, LINEAR_INTEGRATION],
				[isClickupIntegrated, CLICKUP_INTEGRATION],
				[isHeightIntegrated, HEIGHT_INTEGRATION],
			],
			[
				isClickupIntegrated,
				isLinearIntegratedWithProject,
				isHeightIntegrated,
			],
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

	const isLoading =
		isLoadingLinear ||
		isLoadingClickUp ||
		isLoadingHeight ||
		isLoadingErrorIssues

	const hasIssue =
		!isLoadingErrorIssues &&
		errorIssues?.error_issue &&
		errorIssues.error_issue.length > 0

	const menu = useMemo(() => {
		const options = integrations
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
							<integration.Icon size={16} />
							<Box mr="auto" cssClass={style.menuOption}>
								<Text
									size="small"
									weight="medium"
									userSelect="none"
								>
									{integration?.name} issue
								</Text>
							</Box>
							<IconSolidCheveronRight size={16} />
						</Box>
					</Menu.Item>
				)
			})
			.filter(Boolean)
		return (
			<Menu placement="bottom-end">
				<Menu.Button
					kind="secondary"
					size="small"
					emphasis="high"
					disabled={!isLoggedIn || isLoading}
					iconLeft={<IconSolidDocumentAdd />}
				>
					Create Issue
				</Menu.Button>
				<Menu.List cssClass={style.menuList}>
					<Menu.Heading>
						<Box
							p="8"
							bb="secondary"
							mb={integrationCount > 0 ? '4' : undefined}
							userSelect="none"
						>
							<Text size="xxSmall" weight="medium" color="n11">
								Attach an issue
							</Text>
						</Box>
					</Menu.Heading>
					{options}
					{options.length > 0 && <Menu.Divider />}
					<Menu.Item>
						<Link to={`/${projectId}/integrations`}>
							<Box
								gap="4"
								display="flex"
								alignItems="center"
								color="n11"
							>
								<IconSolidPlusSm size={16} />
								<Text size="small" weight="medium">
									Add new integration
								</Text>
							</Box>
						</Link>
					</Menu.Item>
				</Menu.List>
			</Menu>
		)
	}, [integrationCount, integrations, isLoading, isLoggedIn, projectId])

	const issueButton = useMemo(() => {
		const issue = errorIssues?.error_issue[0]
		if (!errorIssues?.error_issue || !issue) {
			return null
		}
		const Icon = integrations.find(
			(integration) => integration[1]?.name === issue.integration_type,
		)?.[1]?.Icon
		return (
			<Button
				kind="secondary"
				size="small"
				emphasis="medium"
				disabled={!isLoggedIn}
				iconLeft={Icon ? <Icon /> : undefined}
				trackingId="errorIssueButton"
				cssClass={style.issueButton}
				onClick={() => {
					if (issue) {
						window.open(
							getAttachmentUrl(issue as ExternalAttachment),
							'_blank',
						)
					}
				}}
			>
				<Text lines="1">{issue.title}</Text>
			</Button>
		)
	}, [errorIssues?.error_issue, integrations, isLoggedIn])

	return (
		<>
			{hasIssue ? issueButton : menu}
			<NewIssueModal
				selectedIntegration={showNewIssueModal ?? LINEAR_INTEGRATION}
				visible={!!showNewIssueModal}
				onClose={() => setShowNewIssueModal(undefined)}
				commentType="ErrorComment"
				defaultIssueTitle={defaultIssueTitle}
			/>
		</>
	)
}

export default ErrorIssueButton
