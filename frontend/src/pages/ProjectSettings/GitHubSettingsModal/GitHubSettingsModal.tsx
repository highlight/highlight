import { LinkButton } from '@/components/LinkButton'
import {
	Box,
	Button,
	ButtonIcon,
	ComboboxSelect,
	Form,
	IconSolidInformationCircle,
	IconSolidQuestionMarkCircle,
	IconSolidTrash,
	IconSolidX,
	Modal,
	Text,
	TextLink,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import analytics from '@util/analytics'
import { useMemo } from 'react'

import { GitHubRepo, Service } from '@/graph/generated/schemas'

import * as styles from './GitHubSettingsModal.css'

type Props = {
	service: Service
	githubRepos: GitHubRepo[]
	handleSave: (service: Service, formValues: GithubSettingsFormValues) => void
	closeModal: () => void
}

export type GithubSettingsFormValues = {
	githubRepo: string | null
	buildPrefix: string | null
	githubPrefix: string | null
}

export const GitHubSettingsModal = ({
	service,
	githubRepos,
	handleSave,
	closeModal,
}: Props) => {
	const handleSubmit = (formValues: GithubSettingsFormValues) => {
		const submittedValues = formValues.githubRepo
			? formValues
			: { githubRepo: null, buildPrefix: null, githubPrefix: null }

		handleSave(service, submittedValues)
		closeModal()
	}

	if (!service) {
		return null
	}

	return (
		<Modal
			open={!!service}
			onClose={closeModal}
			width={360}
		>
			<Modal.Header>
				<Text size="xxSmall" color="n11" weight="medium">
					GitHub settings for {service.name} service
				</Text>
			</Modal.Header>
			<Modal.Body>
				<GithubSettingsForm
					service={service}
					githubRepos={githubRepos}
					handleSubmit={handleSubmit}
					handleCancel={closeModal}
				/>
			</Modal.Body>
		</Modal>
	)
}

type GithubSettingsFormProps = {
	service: Service
	githubRepos: GitHubRepo[]
	handleSubmit: (formValues: GithubSettingsFormValues) => void
	handleCancel: () => void
}

const GithubSettingsForm = ({
	service,
	githubRepos,
	handleSubmit,
	handleCancel,
}: GithubSettingsFormProps) => {
	const githubOptions = useMemo(
		() =>
			githubRepos.map((repo: GitHubRepo) => ({
				key: repo.repo_id.replace(
					'https://api.github.com/repos/',
					'',
				),
				render: repo.name.split('/').pop() || repo.name,
			})),
		[githubRepos],
	)

	const formStore = Form.useStore<GithubSettingsFormValues>({
		defaultValues: {
			githubRepo: service.githubRepoPath || null,
			buildPrefix: service.buildPrefix || null,
			githubPrefix: service.githubPrefix || null,
		},
	})
	const formState = formStore.useState()

	const exampleLink = formState.values.githubPrefix
		? `https://github.com/${formState.values.githubRepo}/blob/HEAD${formState.values.githubPrefix}/README.md`
		: `https://github.com/${formState.values.githubRepo}/blob/HEAD/README.md`

	const selectedRepoLabel = formState.values.githubRepo
		? formState.values.githubRepo.split('/').pop()
		: 'Search repos...'

	return (
		<Form store={formStore} onSubmit={() => handleSubmit(formState.values)}>
			<Box px="12" py="8" gap="12" display="flex" flexDirection="column">
				<Form.NamedSection
					label="Select GitHub repository"
					name="githubRepo"
				>
					<Box display="flex" alignItems="center" gap="8">
						<ComboboxSelect
							label="GitHub repository"
							value={formState.values.githubRepo || ''}
							valueRender={selectedRepoLabel}
							options={githubOptions}
							onChange={(repo: string) =>
								formStore.setValue(
									formStore.names.githubRepo,
									repo,
								)
							}
							onChangeQuery={() => undefined}
							queryPlaceholder="Search repos..."
							cssClass={styles.repoSelect}
						/>
						<ButtonIcon
							kind="secondary"
							emphasis="medium"
							size="medium"
							disabled={!formState.values.githubRepo}
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
										vars.theme.interactive.fill.secondary
											.content.text
									}
								/>
							}
						/>
					</Box>
				</Form.NamedSection>
				{formState.values.githubRepo && (
					<>
						<Box
							display="flex"
							gap="16"
							paddingTop="12"
							borderTop="dividerWeak"
						>
							<Form.Input
								name={formStore.names.buildPrefix}
								label="Build path prefix"
								placeholder="/build"
								icon={
									<Tooltip
										trigger={
											<IconSolidQuestionMarkCircle
												color={
													vars.theme.static.content
														.weak
												}
												size={14}
											/>
										}
										renderInLine
									>
										<Box cssClass={styles.tooltipContent}>
											The path added in the deployment
											process to host your files, and
											should be removed when trying to map
											your files to GitHub.
										</Box>
									</Tooltip>
								}
							/>
							<Form.Input
								name={formStore.names.githubPrefix}
								label="GitHub path prefix"
								placeholder="/src"
								icon={
									<Tooltip
										trigger={
											<IconSolidQuestionMarkCircle
												color={
													vars.theme.static.content
														.weak
												}
												size={14}
											/>
										}
										renderInLine
									>
										<Box cssClass={styles.tooltipContent}>
											The path removed in the deployment
											process to host your files, which
											can be seen in your GitHub repo.
										</Box>
									</Tooltip>
								}
							/>
						</Box>

						<Box
							display="flex"
							alignItems="flex-start"
							gap="4"
							cssClass={styles.example}
						>
							<Tooltip
								trigger={
									<IconSolidInformationCircle
										color={vars.theme.static.content.weak}
										size={14}
									/>
								}
								renderInLine
							>
								<Box cssClass={styles.tooltipContent}>
									An example using the configuration provided.
								</Box>
							</Tooltip>
							<Text break="all">
								e.g.{' '}
								<i>{formState.values.buildPrefix}/README.md</i>{' '}
								→{' '}
								<TextLink href={exampleLink} target="_blank">
									{exampleLink}
								</TextLink>
							</Text>
						</Box>
					</>
				)}
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
				>
					<LinkButton
						kind="secondary"
						to="https://www.highlight.io/docs/general/product-features/error-monitoring/enhancing-errors-with-github#link-your-service-to-a-github-repo"
						trackingId="enhance-stack-traces-docs"
						emphasis="low"
						size="medium"
						target="_blank"
						iconLeft={
							<IconSolidQuestionMarkCircle
								color={vars.theme.static.content.weak}
								size={14}
							/>
						}
					>
						Learn more
					</LinkButton>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="flex-end"
						gap="8"
					>
						<Button
							kind="secondary"
							size="medium"
							emphasis="medium"
							onClick={() => {
								analytics.track('cancel-service-github-settings')
								handleCancel()
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							kind="primary"
							size="medium"
							onClick={() => {
								analytics.track('update-service-github-settings')
							}}
						>
							Save
						</Button>
					</Box>
				</Box>
			</Box>
		</Form>
	)
}
