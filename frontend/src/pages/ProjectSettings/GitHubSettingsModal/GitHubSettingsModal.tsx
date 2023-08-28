import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidTrash,
	IconSolidX,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import { Select } from 'antd'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { GitHubRepo, Service } from '@/graph/generated/schemas'

import * as styles from './GitHubSettingsModal.css'

type Props = {
	service: Service
	githubRepos: GitHubRepo[]
	handleSave: (service: Service, formValues: GithubSettingsFormValues) => void
	githubIntegrated: boolean
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
	githubIntegrated,
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
			onCancel={closeModal}
			visible={!!service}
			minimal
			minimalPaddingSize="0"
			width="360px"
			title={
				<Box
					display="flex"
					alignItems="center"
					userSelect="none"
					px="8"
					py="4"
					bb="secondary"
					justifyContent="space-between"
				>
					<Text size="xxSmall" color="n11" weight="medium">
						GitHub settings for {service.name} service
					</Text>
					<ButtonIcon
						kind="secondary"
						emphasis="none"
						size="xSmall"
						onClick={closeModal}
						icon={
							<IconSolidX
								size={14}
								color={
									vars.theme.interactive.fill.secondary
										.content.text
								}
							/>
						}
					/>
				</Box>
			}
		>
			<ModalBody>
				{!githubIntegrated ? (
					<Stack>
						<Text size="small" weight="medium">
							It looks like you have not enabled GitHub to
							integrate with Highlight yet. Visit{' '}
							<Link to={`/${service.projectID}/integrations`}>
								Integrations
							</Link>{' '}
							to start creating GitHub issues from comments,
							enhancing your error stacktraces with more context,
							and more!
						</Text>
						<Box display="flex">
							<LinkButton
								to={`/${service.projectID}/integrations`}
								trackingId="github-settings-integrations-page-link"
							>
								Integrate GitHub
							</LinkButton>
						</Box>
					</Stack>
				) : (
					<GithubSettingsForm
						service={service}
						githubRepos={githubRepos}
						handleSubmit={handleSubmit}
						handleCancel={closeModal}
					/>
				)}
			</ModalBody>
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
				id: repo.key,
				label: repo.name.split('/').pop(),
				value: repo.repo_id.replace(
					'https://api.github.com/repos/',
					'',
				),
			})),
		[githubRepos],
	)

	const form = Form.useFormState<GithubSettingsFormValues>({
		defaultValues: {
			githubRepo: service.githubRepoPath || null,
			buildPrefix: service.buildPrefix || null,
			githubPrefix: service.githubPrefix || null,
		},
	})

	const exampleLink = form.values.githubPrefix
		? `https://github.com/${form.values.githubRepo}/blob/HEAD${form.values.githubPrefix}/README.md`
		: `https://github.com/${form.values.githubRepo}/blob/HEAD/README.md`

	return (
		<Form state={form} onSubmit={() => handleSubmit(form.values)}>
			<Box px="12" py="8" gap="12" display="flex" flexDirection="column">
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
								form.setValue(form.names.githubRepo, repo)
							}
							value={form.values.githubRepo?.split('/').pop()}
							options={githubOptions}
							notFoundContent={<span>No repos found</span>}
							optionFilterProp="label"
							filterOption
							showSearch
						/>
						<ButtonIcon
							kind="secondary"
							emphasis="medium"
							size="medium"
							disabled={!form.values.githubRepo}
							onClick={() =>
								form.setValue(form.names.githubRepo, null)
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
				{form.values.githubRepo && (
					<>
						<Box
							display="flex"
							gap="16"
							paddingTop="12"
							borderTop="dividerWeak"
						>
							<Form.Input
								name={form.names.buildPrefix}
								label="Build path prefix"
								placeholder="/build"
							/>
							<Form.Input
								name={form.names.githubPrefix}
								label="GitHub path prefix"
								placeholder="/src"
							/>
						</Box>

						<Box
							display="flex"
							alignItems="flex-start"
							gap="4"
							cssClass={styles.example}
						>
							<Text break="all">
								e.g. <i>{form.values.buildPrefix}/README.md</i>{' '}
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
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						kind="secondary"
						trackingId="cancel-service-github-settings"
						size="medium"
						emphasis="medium"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						kind="primary"
						trackingId="update-service-github-settings"
						size="medium"
					>
						Save
					</Button>
				</Box>
			</Box>
		</Form>
	)
}
