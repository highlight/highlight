import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidBeaker,
	IconSolidInformationCircle,
	IconSolidLoading,
	IconSolidQuestionMarkCircle,
	IconSolidTrash,
	IconSolidXCircle,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { Select } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import {
	useEditServiceGithubSettingsMutation,
	useTestErrorEnhancementMutation,
} from '@/graph/generated/hooks'
import { ErrorObjectFragment } from '@/graph/generated/operations'
import { GitHubRepo, Maybe, Service } from '@/graph/generated/schemas'
import ErrorStackTrace from '@/pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'

import * as styles from './GitHubEnhancementSettingsForm.css'

type GithubSettingsFormProps = {
	errorObject: ErrorObjectFragment
	githubRepos: GitHubRepo[]
	service?: Maybe<Service>
	onSave: () => void
	disabled?: boolean
}

export type GithubSettingsFormValues = {
	githubRepo: string | null
	buildPrefix: string | null
	githubPrefix: string | null
}

export const GitHubEnhancementSettingsForm: React.FC<
	GithubSettingsFormProps
> = ({ githubRepos, errorObject, service, onSave, disabled }) => {
	const [testedError, setTestedError] =
		useState<ErrorObjectFragment>(errorObject)
	const [testLoading, setTestLoading] = useState(false)
	const [failedEnhancement, setFailedEnhancement] = useState(false)
	const [testErrorEnhancement] = useTestErrorEnhancementMutation()
	const [editServiceGithubSettings] = useEditServiceGithubSettingsMutation()

	const formStore = Form.useStore<GithubSettingsFormValues>({
		defaultValues: {
			githubRepo: null,
			buildPrefix: '',
			githubPrefix: '',
		},
	})
	const formState = formStore.useState()

	const githubOptions = useMemo(
		() =>
			githubRepos.map((repo: GitHubRepo) => ({
				id: repo.key,
				label: repo.name.split('/').pop(),
				value: repo.repo_id.replace(
					'https://api.github.com/repos/',
					'',
				),
			})),
		[githubRepos],
	)

	useEffect(() => {
		formStore.setValues({
			githubRepo: service?.githubRepoPath ?? null,
			buildPrefix: service?.buildPrefix ?? '',
			githubPrefix: service?.githubPrefix ?? '',
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [service])

	const handleSave = () => {
		const formValues = formState.values
		const submittedValues = formValues?.githubRepo
			? formValues
			: { githubRepo: null, buildPrefix: null, githubPrefix: null }

		setTestLoading(true)
		editServiceGithubSettings({
			variables: {
				id: String(service?.id),
				project_id: String(service?.projectID),
				github_repo_path: submittedValues.githubRepo,
				build_prefix: submittedValues.buildPrefix,
				github_prefix: submittedValues.githubPrefix,
			},
		})
			.then(() => {
				if (formValues?.githubRepo) {
					testErrorEnhancement({
						variables: {
							error_object_id: testedError.id,
							github_repo_path: String(
								submittedValues?.githubRepo,
							),
							build_prefix: submittedValues?.buildPrefix,
							github_prefix: submittedValues?.githubPrefix,
							save_error: true,
						},
					})
						.then(() => {
							setTestLoading(false)
							onSave()
						})
						.catch(() => {
							setTestLoading(false)
						})
				} else {
					setTestLoading(false)
					onSave()
				}
			})
			.catch(() => {
				setTestLoading(false)
			})
	}

	const handleTestConfiguration = () => {
		setTestLoading(true)

		const formValues = formState.values
		testErrorEnhancement({
			variables: {
				error_object_id: testedError.id,
				github_repo_path: String(formValues?.githubRepo),
				build_prefix: formValues?.buildPrefix,
				github_prefix: formValues?.githubPrefix,
				save_error: false,
			},
		}).then(({ data }) => {
			if (data?.testErrorEnhancement) {
				const updatedError: ErrorObjectFragment = {
					...testedError,
					...data.testErrorEnhancement,
				}

				// check if at least one file was enhanced
				let latestFailedEnhancement = true
				for (const trace of updatedError.structured_stack_trace) {
					if (trace?.enhancementSource === 'github') {
						latestFailedEnhancement = false
						break
					}
				}

				setTestedError(updatedError)
				setFailedEnhancement(latestFailedEnhancement)
			}
			setTestLoading(false)
		})
	}

	return (
		<Form store={formStore}>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				width="full"
				marginBottom="12"
			>
				<Text color="strong">Configure enhancement settings</Text>
				<Stack direction="row" alignItems="center" gap="4">
					<Button
						trackingId="error-github-enhancement-test-configuration"
						kind="secondary"
						emphasis="low"
						size="xSmall"
						iconLeft={
							testLoading ? (
								<IconSolidLoading
									className={styles.loadingIcon}
								/>
							) : (
								<IconSolidBeaker />
							)
						}
						disabled={
							disabled ||
							testLoading ||
							!formStore.getValue(formStore.names.githubRepo)
						}
						onClick={handleTestConfiguration}
					>
						Test enhancement
					</Button>
					<Button
						trackingId="error-github-enhancement-step-save-configuration"
						kind="primary"
						size="xSmall"
						disabled={disabled || testLoading}
						onClick={handleSave}
					>
						Save changes
					</Button>
				</Stack>
			</Stack>

			<Stack direction="row" gap="0">
				<Stack gap="16" width="full" paddingRight="8">
					<Form.NamedSection
						label="Select GitHub repository"
						name="githubRepo"
					>
						<Box display="flex" alignItems="center" gap="8">
							<Select
								aria-label="GitHub repository"
								className={styles.repoSelect}
								placeholder="Search repos..."
								onSelect={(repo: string) =>
									formStore.setValue(
										formStore.names.githubRepo,
										repo,
									)
								}
								value={formState.values.githubRepo
									?.split('/')
									.pop()}
								options={githubOptions}
								disabled={disabled || testLoading}
								notFoundContent={<span>No repos found</span>}
								optionFilterProp="label"
								filterOption
								showSearch
							/>
							<ButtonIcon
								kind="secondary"
								emphasis="medium"
								size="medium"
								disabled={
									!formState.values.githubRepo ||
									disabled ||
									testLoading
								}
								onClick={() =>
									formStore.setValue(
										formStore.names.githubRepo,
										null,
									)
								}
								icon={
									<IconSolidTrash
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
							/>
						</Box>
					</Form.NamedSection>
					{disabled && (
						<Box
							display="flex"
							alignItems="flex-start"
							gap="4"
							cssClass={styles.example}
						>
							<Box>
								<IconSolidInformationCircle
									color={vars.theme.static.content.weak}
									size={14}
								/>
							</Box>
							<Text>
								Report service & connect to GitHub before being
								able to access the enhancement settings.
							</Text>
						</Box>
					)}
				</Stack>
				<Stack
					gap="16"
					width="full"
					borderLeft="dividerWeak"
					paddingLeft="8"
				>
					<Form.Input
						name={formStore.names.buildPrefix}
						label="Build path prefix"
						placeholder="/build"
						disabled={disabled || testLoading}
						icon={
							<Tooltip
								trigger={
									<IconSolidQuestionMarkCircle
										color={vars.theme.static.content.weak}
										size={14}
									/>
								}
								renderInLine
							>
								<Box cssClass={styles.tooltipContent}>
									The path added in the deployment process to
									host your files, and should be removed when
									trying to map your files to GitHub.
								</Box>
							</Tooltip>
						}
					/>
					<Form.Input
						name={formStore.names.githubPrefix}
						label="GitHub path prefix"
						placeholder="/src"
						disabled={disabled || testLoading}
						icon={
							<Tooltip
								trigger={
									<IconSolidQuestionMarkCircle
										color={vars.theme.static.content.weak}
										size={14}
									/>
								}
								renderInLine
							>
								<Box cssClass={styles.tooltipContent}>
									The path removed in the deployment process
									to host your files, which can be seen in
									your GitHub repo.
								</Box>
							</Tooltip>
						}
					/>
				</Stack>
			</Stack>
			{!disabled && (
				<Box pt="12">
					{testLoading ? (
						<LoadingBox height={600} />
					) : (
						<>
							{failedEnhancement && (
								<Box
									display="flex"
									alignItems="center"
									gap="2"
									pb="8"
								>
									<IconSolidXCircle
										size={14}
										color={
											vars.theme.static.content.sentiment
												.bad
										}
									/>
									<Text color="bad">
										Error: no traces successfully enhanced
									</Text>
								</Box>
							)}
							<ErrorStackTrace errorObject={testedError} />
						</>
					)}
				</Box>
			)}
		</Form>
	)
}
