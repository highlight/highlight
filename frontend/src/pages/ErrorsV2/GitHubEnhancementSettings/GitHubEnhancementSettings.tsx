import { Button } from '@components/Button'
import Card from '@components/Card/Card'
import {
	Badge,
	Box,
	IconSolidBeaker,
	IconSolidCheckCircle,
	IconSolidGithub,
	IconSolidLoading,
	IconSolidX,
	Stack,
	Text,
} from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { IntegrationModal } from '@pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import { GITHUB_INTEGRATION } from '@pages/IntegrationsPage/Integrations'
import React, { useRef, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import {
	useEditServiceGithubSettingsMutation,
	useGetServiceByNameQuery,
	useTestErrorEnhancementMutation,
} from '@/graph/generated/hooks'
import { ErrorObjectFragment } from '@/graph/generated/operations'

import * as styles from './GitHubEnhancementSettings.css'
import {
	GitHubEnhancementSettingsForm,
	GithubSettingsFormValues,
} from './GitHubEnhancementSettingsForm'

type Props = {
	onClose: () => void
	errorObject: ErrorObjectFragment
}

type StepAction = {
	title: string
	iconLeft?: React.ReactElement
	onClick: () => void
	disabled?: boolean
	primary?: boolean
}

type EnhancementButtonRef = HTMLButtonElement & {
	getFormValues: () => GithubSettingsFormValues
}

export const GitHubEnhancementSettings: React.FC<Props> = ({
	errorObject,
	onClose,
}) => {
	const { configurationPage } = GITHUB_INTEGRATION
	const {
		settings: { isIntegrated },
		data: githubData,
	} = useGitHubIntegration()
	const [testErrorEnhancement] = useTestErrorEnhancementMutation()
	const [editServiceGithubSettings] = useEditServiceGithubSettingsMutation()

	const [integrationModalVisible, setIntegrationModalVisible] =
		useState(false)
	const [testedError, setTestedError] =
		useState<ErrorObjectFragment>(errorObject)
	const [testLoading, setTestLoading] = useState(false)

	const submitRef = useRef<EnhancementButtonRef>(null)
	const testConfigurationRef = useRef<EnhancementButtonRef>(null)

	const { data: serviceData, loading } = useGetServiceByNameQuery({
		variables: {
			project_id: String(testedError.project_id),
			name: testedError.serviceName!,
		},
		skip: !testedError.serviceName,
	})

	const handleSave = () => {
		const formValues = submitRef.current?.getFormValues()
		const submittedValues = formValues?.githubRepo
			? formValues
			: { githubRepo: null, buildPrefix: null, githubPrefix: null }

		editServiceGithubSettings({
			variables: {
				id: String(serviceData?.serviceByName?.id),
				project_id: String(serviceData?.serviceByName?.projectID),
				github_repo_path: submittedValues.githubRepo,
				build_prefix: submittedValues.buildPrefix,
				github_prefix: submittedValues.githubPrefix,
			},
		})

		onClose()
	}

	const handleTestConfiguration = () => {
		// TODO(spenny): disable or error if no repo path
		const formValues = testConfigurationRef.current?.getFormValues()

		setTestLoading(true)
		testErrorEnhancement({
			variables: {
				error_object_id: testedError.id,
				github_repo_path: String(formValues?.githubRepo),
				build_prefix: formValues?.buildPrefix,
				github_prefix: formValues?.githubPrefix,
			},
		}).then(({ data }) => {
			if (data?.testErrorEnhancement) {
				const updatedError: ErrorObjectFragment = {
					...testedError,
					...data.testErrorEnhancement,
				}

				setTestedError(updatedError)
			}
			setTestLoading(false)
		})
	}

	const steps = [
		{
			step: 'A',
			title: 'Report services',
			completed: !!testedError.serviceName,
			actions: [
				{
					title: 'Read docs',
					onClick: () =>
						window.open(
							'https://www.highlight.io/docs/general/product-features/general-features/services',
							'_blank',
						),
				},
			],
		},
		{
			step: 'B',
			title: 'Connect to GitHub',
			completed: isIntegrated,
			actions: [
				{
					title: 'Integrate GitHub',
					iconLeft: <IconSolidGithub />,
					onClick: () => setIntegrationModalVisible(true),
					disabled: isIntegrated,
				},
			],
		},
		{
			step: 'C',
			title: 'Configure enhancement settings',
			completed: !!serviceData?.serviceByName?.githubRepoPath,
			actions: [
				{
					title: 'Test enhancement',
					iconLeft: testLoading ? (
						<IconSolidLoading className={styles.loading} />
					) : (
						<IconSolidBeaker />
					),
					onClick: handleTestConfiguration,
					// TODO(spenny): should we disable this based on form values
					disabled: !isIntegrated && !testedError.serviceName,
				},
				{
					title: 'Save changes',
					onClick: handleSave,
					// TODO(spenny): should we disable this based on form values
					disabled: !isIntegrated && !testedError.serviceName,
					primary: true,
				},
			],
			component: () => {
				if (loading) {
					return <LoadingBox />
				}

				return (
					<GitHubEnhancementSettingsForm
						githubRepos={githubData?.github_repos || []}
						errorObject={testedError}
						service={serviceData?.serviceByName}
						submitRef={submitRef}
						testRef={testConfigurationRef}
						testLoading={testLoading}
					/>
				)
			},
		},
	]

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
								<Text color="strong">{step.title}</Text>
								<Stack
									direction="row"
									alignItems="center"
									gap="4"
								>
									{step.actions.map(
										(action: StepAction, index: number) => (
											<Button
												key={action.title}
												trackingId={`error-github-enhancement-step-${step.step}${index}`}
												kind={
													action.primary
														? 'primary'
														: 'secondary'
												}
												size="xSmall"
												iconLeft={action.iconLeft}
												disabled={action.disabled}
												onClick={action.onClick}
											>
												{action.title}
											</Button>
										),
									)}
								</Stack>
							</Stack>
						</Stack>
						{step.component && <Box pt="8">{step.component()}</Box>}
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
