import { Button } from '@components/Button'
import Card from '@components/Card/Card'
import { Maybe } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidArrowRight,
	IconSolidBeaker,
	IconSolidCheckCircle,
	IconSolidGithub,
	Stack,
	Text,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { IntegrationModal } from '@pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import { GITHUB_INTEGRATION } from '@pages/IntegrationsPage/Integrations'
import React, { useState } from 'react'

import * as styles from './GitHubEnhancementSettings.css'

type Props = {
	onCancel: () => void
	serviceName?: Maybe<string>
}

export const GitHubEnhancementSettings: React.FC<Props> = ({
	serviceName,
	onCancel,
}) => {
	const [integrationModalVisible, setIntegrationModalVisible] =
		useState(false)
	const { configurationPage } = GITHUB_INTEGRATION
	const {
		settings: { isIntegrated },
		// data: githubData,
	} = useGitHubIntegration()

	const steps = [
		{
			step: 'A',
			title: 'Report services',
			description:
				'Add service name to your SDK to better deliniate errors and logs.',
			completed: !!serviceName,
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
			description: 'Connect to GitHub to access repositories.',
			completed: isIntegrated,
			action: {
				title: 'Integrate GitHub',
				iconLeft: <IconSolidGithub />,
				onClick: () => setIntegrationModalVisible(true),
				disabled: isIntegrated,
			},
		},
		{
			step: 'C',
			title: 'Configure enhancement settings',
			description:
				'Link a GitHub repository to your service to start enhancing stacktraces.',
			completed: false,
			action: {
				title: 'Start',
				iconRight: <IconSolidArrowRight />,
				onClick: () => {}, // TODO(spenny): show form
				disabled: !serviceName || !isIntegrated,
			},
		},
	]

	// TODO(spenny): build form
	return (
		<Stack cssClass={styles.container}>
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
						onClick={onCancel}
						size="small"
					>
						Cancel
					</Button>
					<Button
						trackingId="error-github-enhancement-test"
						kind="secondary"
						emphasis="medium"
						size="small"
						iconLeft={<IconSolidBeaker />}
						disabled={true} // TODO(spenny): enable when form is ready
					>
						Test enhancement
					</Button>
					<Button
						trackingId="error-github-enhancement-save"
						kind="primary"
						size="small"
						disabled={true} // TODO(spenny): enable when form is ready
					>
						Save settings
					</Button>
				</Stack>
			</Stack>

			<Stack direction="row" width="full">
				{steps.map((step) => (
					<Card className={styles.cardStep} key={step.step}>
						<Stack direction="row" gap="8">
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
							<Stack pt="4" gap="16">
								<Text color="strong">{step.title}</Text>
								<Text color="moderate">{step.description}</Text>
								<Box>
									<Button
										trackingId={`error-github-enhancement-step-${step.step}`}
										kind="secondary"
										size="xSmall"
										iconLeft={step.action.iconLeft}
										iconRight={step.action.iconRight}
										disabled={step.action.disabled}
										onClick={step.action.onClick}
									>
										{step.action.title}
									</Button>
								</Box>
							</Stack>
						</Stack>
					</Card>
				))}
			</Stack>

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
