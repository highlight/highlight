import { Button } from '@components/Button'
import Card from '@components/Card/Card'
import {
	Badge,
	Box,
	IconSolidCheckCircle,
	IconSolidGithub,
	IconSolidInformationCircle,
	IconSolidX,
	Stack,
	Text,
	Tooltip,
	vars,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { IntegrationModal } from '@pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import { GITHUB_INTEGRATION } from '@pages/IntegrationsPage/Integrations'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoadingBox from '@/components/LoadingBox'
import { useGetServiceByNameQuery } from '@/graph/generated/hooks'
import { ErrorObjectFragment } from '@/graph/generated/operations'

import * as styles from './GitHubEnhancementSettings.css'
import { GitHubEnhancementSettingsForm } from './GitHubEnhancementSettingsForm'

type Props = {
	onClose: () => void
	errorObject: ErrorObjectFragment
}

export const GitHubEnhancementSettings: React.FC<Props> = ({
	errorObject,
	onClose,
}) => {
	const navigate = useNavigate()
	const { configurationPage } = GITHUB_INTEGRATION
	const {
		settings: { isIntegrated },
		data: githubData,
	} = useGitHubIntegration()

	const [integrationModalVisible, setIntegrationModalVisible] =
		useState(false)

	const {
		data: serviceData,
		loading,
		refetch,
	} = useGetServiceByNameQuery({
		variables: {
			project_id: String(errorObject.project_id),
			name: errorObject.serviceName!,
		},
		skip: !errorObject.serviceName,
	})

	useEffect(() => {
		refetch({
			project_id: String(errorObject.project_id),
			name: errorObject.serviceName!,
		})
	}, [errorObject.serviceName, errorObject.project_id, refetch])

	const steps = [
		{
			step: 'A',
			title: 'Report services',
			description: 'Start linking your errors to a service via the SDK.',
			completed: !!errorObject.serviceName,
			action: {
				title: 'Read docs',
				onClick: () =>
					window.open(
						'https://www.highlight.io/docs/general/product-features/general-features/services',
						'_blank',
					),
			},
		},
		{
			step: 'B',
			title: 'Connect to GitHub',
			description:
				'Integrate your workspace to GitHub to link your repos to services.',
			completed: isIntegrated,
			action: isIntegrated
				? {
						title: 'Manage Integration',
						onClick: () =>
							navigate(`/${errorObject.project_id}/integrations`),
				  }
				: {
						title: 'Connect to GitHub',
						iconLeft: <IconSolidGithub />,
						onClick: () => setIntegrationModalVisible(true),
				  },
		},
	]

	return (
		<Stack cssClass={styles.container} gap="12">
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Text size="large" weight="bold" color="strong">
					Setup GitHub-enhanced stacktraces
				</Text>
				<Stack direction="row" gap="4">
					<Button
						trackingId="error-github-enhancement-cancel"
						kind="secondary"
						emphasis="low"
						onClick={onClose}
						size="small"
						iconRight={<IconSolidX />}
					>
						Cancel
					</Button>
				</Stack>
			</Stack>

			<Stack direction="column" width="full" gap="8">
				{steps.map((step) => (
					<Card className={styles.cardStep} key={step.step}>
						<Stack direction="row" gap="8" alignItems="center">
							<Box display="flex" alignItems="flex-start">
								{step.completed ? (
									<Badge
										variant="green"
										size="medium"
										iconStart={
											<IconSolidCheckCircle size={12} />
										}
									/>
								) : (
									<Badge
										variant="gray"
										label={step.step}
										size="medium"
									/>
								)}
							</Box>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								width="full"
							>
								<Stack
									direction="row"
									justifyContent="center"
									gap="4"
								>
									<Text color="strong">{step.title}</Text>
									<Tooltip
										trigger={
											<IconSolidInformationCircle
												color={
													vars.theme.interactive.fill
														.secondary.content.text
												}
												size={12}
											/>
										}
									>
										{step.description}
									</Tooltip>
								</Stack>
								<Button
									trackingId={`error-github-enhancement-step-${step.step}`}
									kind="secondary"
									size="xSmall"
									iconLeft={step.action.iconLeft}
									onClick={step.action.onClick}
								>
									{step.action.title}
								</Button>
							</Stack>
						</Stack>
					</Card>
				))}
			</Stack>

			{loading ? (
				<LoadingBox />
			) : (
				<Box borderTop="dividerWeak" paddingTop="12">
					<GitHubEnhancementSettingsForm
						githubRepos={githubData?.github_repos || []}
						errorObject={errorObject}
						service={serviceData?.serviceByName}
						onSave={onClose}
						disabled={
							!isIntegrated || !serviceData?.serviceByName?.name
						}
					/>
				</Box>
			)}

			<IntegrationModal
				title="Configuring GitHub Integration"
				visible={integrationModalVisible}
				onCancel={() => setIntegrationModalVisible(false)}
				configurationPage={() =>
					configurationPage({
						setModalOpen: () => setIntegrationModalVisible(false),
						setIntegrationEnabled: () => {},
						action: IntegrationAction.Setup,
					})
				}
			/>
		</Stack>
	)
}
